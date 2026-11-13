// DRIP FC Stadium: the crowd's shared mood (Nov 13 2026). One small state object, stepped once a frame by stadiumSit while the
// stadium's match is awake, read by the crowd's shader uniforms (stadiumCrowd.ts) and, later, by the stadium audio (music
// crossfade, chants, rumble), which should only READ it: stadiumMood() returns the live object, never a copy.
//  - beat / bpm: a continuous beat clock (beats since the match woke). A bpm change at a phase switch keeps the beat count
//    continuous, so a sway or a drum loop never jumps.
//  - phase + chant: a chant cycle, every CHANT_PHASE_S (40–90 s, seeded) the next chant from CHANTS (Nov 13: mostly terrace shouts); two of the ten are slow
//    song, when the fans hold their scarves up.
//  - excitement 0..1: a base (a live match with players above an all-AI exhibition), up while the ball is near a goal (a chance),
//    a spike on a near miss (the ball out over the goal line close to the posts) and 1 on a goal, easing back down after.
//  - wave: now and then (WAVE_GAP_S) a Mexican wave travels round the bowl (angle round the stadium centre, radians) while the
//    match is calm.
// Heat: a few multiplies a frame while the match is awake; nothing at all when it sleeps (stadiumSit stops stepping it).
import {STADIUM} from './westParkLayout';

export type ChantId='drip-drip-clap'|'ole-ole'|'island-anthem'|'drum-march'|'here-we-go'|'stand-up-song'|'lets-go'|'hey-hey-hey'|'clap-clap-shout'|'stand-to-stand';
export type MoodPhase='quiet'|'chant'|'slow-song';
/** The chants in cycle order: bpm and kind (a slow song raises the scarves). Audio maps the id to its own loop. */
export const CHANTS:readonly {id:ChantId;bpm:number;slow:boolean}[]=[
 {id:'drip-drip-clap',bpm:112,slow:false},{id:'lets-go',bpm:116,slow:false},{id:'island-anthem',bpm:72,slow:true},
 {id:'hey-hey-hey',bpm:120,slow:false},{id:'here-we-go',bpm:106,slow:false},{id:'ole-ole',bpm:100,slow:false},
 {id:'clap-clap-shout',bpm:110,slow:false},{id:'stand-up-song',bpm:68,slow:true},{id:'stand-to-stand',bpm:114,slow:false},
 {id:'drum-march',bpm:122,slow:false},
];
/** Seconds per chant phase (min, max), the quiet spell between chants, the gap between waves and one wave's run. */
export const CHANT_PHASE_S=[40,90] as const,QUIET_S=[6,14] as const,WAVE_GAP_S=[50,120] as const,WAVE_LAP_S=18,WAVE_LAPS=1.5;
/** Excitement levels: the base for a match with players / an exhibition, the chance boost near a goal, a near miss, a goal. */
export const EXCITE={live:.3,exhibition:.2,chance:.45,nearMiss:.85,goal:1,rise:2.5,fall:.12,chanceRange:[8,30]} as const;
/** The quiet-bpm (no chant): a slow murmur clock so a sway still has a beat. */
export const QUIET_BPM=84;

export type StadiumMood={
 /** A match is awake at the stadium (no match: everything below rests). */
 live:boolean;exhibition:boolean;
 bpm:number;/** beats since the match woke (continuous across bpm changes) */beat:number;
 phase:MoodPhase;chant:ChantId|null;/** seconds left in this phase */phaseLeft:number;
 excitement:number;/** 0..1: the share of fans with a scarf up (eases in and out over a slow song) */scarves:number;
 /** the wave: on 0..1 (envelope) and its angle round the bowl (radians, atan2(z, x) from the stadium centre) */
 wave:{on:number;angle:number;next:number;left:number};
 /** seconds since the last goal / near miss (Infinity = none yet): audio's roar and "ooh" triggers */
 sinceGoal:number;sinceNearMiss:number;
 /** bumps on every phase change, goal and near miss: audio can watch one number */
 seq:number;
};
const mood:StadiumMood={live:false,exhibition:false,bpm:QUIET_BPM,beat:0,phase:'quiet',chant:null,phaseLeft:8,excitement:0,scarves:0,
 wave:{on:0,angle:0,next:60,left:0},sinceGoal:Infinity,sinceNearMiss:Infinity,seq:0};
/** The shared mood (read-only for everyone but stadiumSit). */
export const stadiumMood=():Readonly<StadiumMood>=>mood;

let seed=0x5eed,chantAt=0,goals=-1,lastBall:{x:number;z:number}|null=null,pendingMiss=0;
const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const between=(r:readonly [number,number])=>r[0]+(r[1]-r[0])*rand();

/** Distance (m) from the ball to the nearer goal mouth (the goal lines are the pitch's ends along z). */
export function goalDistance(x:number,z:number){const dz=STADIUM.pitchL/2-Math.abs(z-STADIUM.z),dx=Math.max(0,Math.abs(x-STADIUM.x)-3.66);return Math.hypot(dx,Math.max(0,dz));}
/** A near miss: the ball just crossed a goal line (inside → outside) within NEAR_MISS_X of the centre, posts excluded. */
export const NEAR_MISS_X=9;
export function crossedNearMiss(prev:{x:number;z:number},now:{x:number;z:number}){
 const L=STADIUM.pitchL/2,was=Math.abs(prev.z-STADIUM.z)<=L,out=Math.abs(now.z-STADIUM.z)>L;return was&&out&&Math.abs(now.x-STADIUM.x)<NEAR_MISS_X;
}

/** The excitement a match settles to with the ball at (x, z) (no goal, no near miss). */
export function excitementTarget(live:boolean,exhibition:boolean,ball:{x:number;z:number}|null){
 if(!live)return 0;const base=exhibition?EXCITE.exhibition:EXCITE.live;if(!ball)return base;
 const [n,f]=EXCITE.chanceRange,d=goalDistance(ball.x,ball.z),c=Math.min(1,Math.max(0,(f-d)/(f-n)));return base+EXCITE.chance*c*c;
}

function nextPhase(){
 if(mood.phase==='chant'||mood.phase==='slow-song'){mood.phase='quiet';mood.chant=null;mood.bpm=QUIET_BPM;mood.phaseLeft=between(QUIET_S);}
 else{const c=CHANTS[chantAt++%CHANTS.length];mood.phase=c.slow?'slow-song':'chant';mood.chant=c.id;mood.bpm=c.bpm;mood.phaseLeft=between(CHANT_PHASE_S);}
 mood.seq++;
}

/** Each frame from stadiumSit while the stadium's match is awake (live false once: everything rests). goals = both scores
 *  added; ball = the live ball. Returns the mood. */
export function stepStadiumMood(dt:number,o:{live:boolean;exhibition:boolean;goals:number;ball:{x:number;z:number}|null}){
 const m=mood;
 if(!o.live){if(m.live){m.live=false;m.excitement=0;m.scarves=0;m.wave.on=0;m.wave.left=0;m.phase='quiet';m.chant=null;m.bpm=QUIET_BPM;m.seq++;}goals=-1;lastBall=null;return m;}
 if(!m.live){m.live=true;m.beat=0;m.phase='quiet';m.phaseLeft=between(QUIET_S);m.seq++;}
 m.exhibition=o.exhibition;
 dt=Math.min(.1,Math.max(0,dt));m.beat+=dt*m.bpm/60;m.sinceGoal+=dt;m.sinceNearMiss+=dt;
 m.phaseLeft-=dt;if(m.phaseLeft<=0)nextPhase();
 // Goals and near misses (a miss waits half a second: a ball over the line inside the posts is a goal the sim counts a beat later).
 if(goals>=0&&o.goals>goals){m.sinceGoal=0;pendingMiss=0;m.excitement=EXCITE.goal;m.seq++;}
 goals=o.goals;
 if(o.ball){if(lastBall&&crossedNearMiss(lastBall,o.ball))pendingMiss=.5;lastBall??={x:0,z:0};lastBall.x=o.ball.x;lastBall.z=o.ball.z;}
 if(pendingMiss>0){pendingMiss-=dt;if(pendingMiss<=0&&m.sinceGoal>1){m.sinceNearMiss=0;m.excitement=Math.max(m.excitement,EXCITE.nearMiss);m.seq++;}}
 const want=excitementTarget(true,o.exhibition,o.ball),k=want>m.excitement?EXCITE.rise:EXCITE.fall;
 m.excitement+=(want-m.excitement)*(1-Math.exp(-k*dt));
 // Scarves ease up over a slow song, down after it.
 const sc=m.phase==='slow-song'?1:0;m.scarves+=(sc-m.scarves)*(1-Math.exp(-.8*dt));
 // The wave: only while calm (no slow song, excitement low); one and a half laps, eased in and out.
 const w=m.wave;
 if(w.left>0){w.left-=dt;w.angle=(w.angle+dt*Math.PI*2/WAVE_LAP_S)%(Math.PI*2);const run=WAVE_LAP_S*WAVE_LAPS,t=run-w.left;w.on=Math.max(0,Math.min(1,t/2,w.left/2));if(w.left<=0){w.on=0;w.next=between(WAVE_GAP_S);}}
 else{w.next-=dt;if(w.next<=0){if(m.phase!=='slow-song'&&m.excitement<.5){w.left=WAVE_LAP_S*WAVE_LAPS;w.angle=rand()*Math.PI*2;m.seq++;}else w.next=8;}}
 return m;
}
/** Tests: back to a fresh state (seeded). */
export function resetStadiumMood(s=0x5eed){seed=s;chantAt=0;goals=-1;lastBall=null;pendingMiss=0;
 Object.assign(mood,{live:false,exhibition:false,bpm:QUIET_BPM,beat:0,phase:'quiet',chant:null,phaseLeft:8,excitement:0,scarves:0,sinceGoal:Infinity,sinceNearMiss:Infinity,seq:0});
 Object.assign(mood.wave,{on:0,angle:0,next:60,left:0});}
