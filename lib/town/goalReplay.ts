// Goal replays (owner Nov 5 2026: "do the replays for scores"; docs/join-live-game-design.md "Goal replays"). In a live match with
// me joined (7v7, futsal, 9v9, 11v11, beach; solo, a friend's match or mine with friends on it) the last ~4 s of what the renderer
// draws are kept in ONE preallocated ring (ball + every player's position, velocity and kick, at ~18 Hz, the same fields a friend's
// puppet gets from matchNet snapshots, so recording works the same on every phone). On a goal, after the ball-flies-in beat, the
// field runtime draws the build-up again from this ring (interpolated), slowed, with the TV side camera (liveJoinRuntime) and a
// REPLAY tag under the score bar; a tap, a key or Skip ends it.
// - Solo (nobody else on the match): the sim holds while it plays (the field runtime does not step it), then the quick goal reset
//   (GOAL_RESET: fade in the net, the arrival on the centre spot) carries on exactly where it paused.
// - Shared (a friend runs the match or plays on mine): the sim never holds. The replay is drawn over the reset beat (the ball is
//   faded and lands on the spot while the replay shows), it is shorter (fits before the kick-off), and it cuts back to live the
//   moment the kick-off is taken. Nothing is sent: the protocol, the relay and other phones are untouched.
// - Reduced motion: real speed, a shorter clip, the camera cuts instead of easing.
// The live state is stashed before a replay frame is written into the sim and restored right after the field is drawn, so
// anything reading the sim outside the draw (the owner's snapshot encode, the HUD score, the AI) sees live play only.
// Heat: no allocation after creation (two typed arrays), no extra draw calls, render targets or passes; ~1 small copy at 18 Hz.

export const GOAL_REPLAY={
  /** Recording rate (frames per match second) and how much is kept. */
  hz:18,keep:4.2,
  /** Real seconds after the goal before the replay starts: the ball flies in and nestles (before GOAL_RESET.fadeAt hides it). */
  delay:.4,
  /** Solo: the build-up (match s) up to `tail` after the goal, played at `rate` (≈ 3.1 s on screen). */
  clip:1.7,tail:.3,rate:.55,
  /** Shared match: shorter and less slow, ≤ `sharedMax` real s (the reset beat after `delay` is ~1.75 s), cut at the kick-off. */
  sharedClip:1.1,sharedRate:.7,sharedMax:1.6,
  /** Reduced motion: real speed, shorter. */
  calmClip:1.2,
  /** Too little history (just joined): no replay. */
  minHistory:.6,
  /** Taps in the first moment are the shot's own follow-through, not a skip. */
  skipAfter:.15,
} as const;
const FRAMES=Math.ceil(GOAL_REPLAY.keep*GOAL_REPLAY.hz)+2;
/** Per frame: t, ball x, y, vx, vy, height, owner index (-1 none), lofted, render shot offset; then 5 numbers a player. */
const HEAD=9,PER=5;
/** Ring value `o` of frames A and B, mixed by u (a plain function: no closure per frame). */
const mix=(ring:Float32Array,A:number,B:number,u:number,o:number)=>ring[A+o]+(ring[B+o]-ring[A+o])*u;

/** What the replay reads / writes on the sim (MatchSim's fields; a puppet's are filled by matchNet sample the same way). */
type ReplaySim={ids:string[];players:Record<string,{x:number;y:number;vx:number;vy:number;kick:number}>;ball:{x:number;y:number;vx:number;vy:number;height:number;owner:string|null;lofted:boolean};score:{gold:number;blue:number};goalHold:number};

// The replays setting (Island settings → Live matches, default on). One store per page (dev hot reload, like liveJoinRuntime's).
const KEY='fi2-goal-replays-v1';
type Store={on:boolean|null;subs:Set<()=>void>};
const store:Store=((globalThis as {__fi2Replays?:Store}).__fi2Replays??={on:null,subs:new Set()});
export function replaysEnabled(){if(store.on===null){store.on=true;try{store.on=localStorage.getItem(KEY)!=='off';}catch{}}return store.on;}
export function setReplaysEnabled(on:boolean){store.on=on;try{localStorage.setItem(KEY,on?'on':'off');}catch{}store.subs.forEach(f=>f());}
export function subscribeReplays(f:()=>void){store.subs.add(f);return ()=>{store.subs.delete(f);};}

export type GoalReplay=ReturnType<typeof createGoalReplay>;
/** One per live field (created the first time I join it). `n`: the field's player count (sim.ids.length). */
export function createGoalReplay(n:number){
  const stride=HEAD+n*PER,ring=new Float32Array(FRAMES*stride),live=new Float64Array(HEAD+n*PER);
  let head=-1,count=0,clock=0,lastRec=-Infinity,goals=-1,goldSeen=0,since=-1,wait=-1,pt=0,end=0,stashed=false,shooter=-1;
  const r={
    /** 'idle' | 'pending' (a goal, waiting for the beat) | 'play'. */
    phase:'idle' as 'idle'|'pending'|'play',
    /** Real seconds since the replay started; its planned length (real s); the playback rate; shared (sim not held); calm. */
    age:0,dur:0,rate:1,shared:false,calm:false,
    /** Bumps on every replay started (HUD / headless checks). */
    serial:0,skipped:0,
    /** The scoring side ('gold' scored in the top goal) of the replay playing. */
    scorer:'gold' as 'gold'|'blue',
    /** The interpolated render ball height (m) and shot offset of the frame written by apply(). */
    ballH:0,shotOffset:0,
    /** The replay camera (Nov 5 2026, liveJoinRuntime): the match time of the shot (the last touch before the goal; -1 none in the
     *  clip), and the shooter's interpolated sim position at the playhead (-1 when there is none). */
    shotT:-1,shooterX:-1,shooterY:-1,
    /** Match time of the playhead. */
    get playhead(){return pt;},
    get active(){return r.phase==='play';},
    /** The solo replay holds the sim (the field runtime does not step it). */
    get holdSim(){return r.phase==='play'&&!r.shared;},
    get frames(){return count;},
    /** Match seconds of history kept. */
    get history(){return count<2?0:ring[head*stride]-ring[((head-count+1+FRAMES)%FRAMES)*stride];},
    /** After the sim stepped (or a snapshot was sampled): keep a frame every 1/hz match s. `matchDt` real match seconds. */
    record(sim:ReplaySim,matchDt:number,ballH:number,shotOffset:number){
      if(r.phase==='play'||matchDt<=0)return;
      clock+=matchDt;if(clock-lastRec<1/GOAL_REPLAY.hz-1e-4)return;lastRec=clock;
      head=(head+1)%FRAMES;count=Math.min(FRAMES,count+1);
      const o=head*stride,b=sim.ball,ids=sim.ids;
      ring[o]=clock;ring[o+1]=b.x;ring[o+2]=b.y;ring[o+3]=b.vx;ring[o+4]=b.vy;ring[o+5]=ballH;ring[o+6]=b.owner?ids.indexOf(b.owner):-1;ring[o+7]=b.lofted?1:0;ring[o+8]=shotOffset;
      for(let i=0;i<n;i++){const p=sim.players[ids[i]],q=o+HEAD+i*PER;if(!p)continue;ring[q]=p.x;ring[q+1]=p.y;ring[q+2]=p.vx;ring[q+3]=p.vy;ring[q+4]=p.kick;}
    },
    /** Every frame (cheap): a new goal arms the replay. `enabled`: the setting and nothing else owning the view. A goal is a score
     *  that went up with the goal celebration on (sim.goalHold; a friend's snapshot carries it a frame or two after the score, so it
     *  is waited for briefly). `dt` real s. */
    watch(sim:ReplaySim,enabled:boolean,dt:number){
      const g=sim.score.gold+sim.score.blue;
      if(goals>=0&&g>goals){since=0;r.scorer=sim.score.gold>goldSeen?'gold':'blue';}
      goals=g;goldSeen=sim.score.gold;
      if(since<0)return;since+=dt;
      if(sim.goalHold>0&&r.phase==='idle'&&enabled&&r.history>=GOAL_REPLAY.minHistory){r.phase='pending';wait=since;since=-1;}
      else if(since>.8||r.phase!=='idle')since=-1;
    },
    /** Real dt: the beat before it, then playback. `shared`: others are on the match (no hold, cut at the kick-off); `liveRestart`:
     *  the live kick-off is being set up (the ball on the spot). Returns true while playing. */
    step(dt:number,shared:boolean,calm:boolean,goalHold:number,liveRestart:boolean){
      if(r.phase==='pending'){wait+=dt;if(wait<GOAL_REPLAY.delay)return false;
        r.shared=shared;r.calm=calm;const clip=calm?GOAL_REPLAY.calmClip:shared?GOAL_REPLAY.sharedClip:GOAL_REPLAY.clip;
        r.rate=calm?1:shared?GOAL_REPLAY.sharedRate:GOAL_REPLAY.rate;
        const newest=ring[head*stride],oldest=ring[((head-count+1+FRAMES)%FRAMES)*stride];
        // the goal went in `wait` real s ago, which the recording also ran (solo: the sim was not held yet)
        end=Math.min(newest,newest-wait+GOAL_REPLAY.tail);pt=Math.max(oldest,end-clip);
        r.dur=(end-pt)/r.rate;if(shared)r.dur=Math.min(r.dur,GOAL_REPLAY.sharedMax);
        // the shooter: the last owner before the goal, inside the clip (newest-first walk; a deflection or a struck loose ball: none)
        const goalT=newest-wait;shooter=-1;r.shotT=-1;r.shooterX=r.shooterY=-1;
        for(let k=0;k<count;k++){const o=((head-k+FRAMES)%FRAMES)*stride,t=ring[o];if(t>goalT)continue;if(t<pt)break;if(ring[o+6]>=0){shooter=ring[o+6];r.shotT=t;break;}}
        r.phase='play';r.age=0;r.serial++;return true;}
      if(r.phase!=='play')return false;
      r.shared=r.shared||shared;// a friend joined mid-replay: the sim stops holding from now on
      r.age+=dt;pt=Math.min(end,pt+dt*r.rate);
      if(r.age>=r.dur||r.shared&&r.age>.3&&goalHold<=0&&!liveRestart){r.phase='idle';return false;}
      return true;
    },
    /** Tap / key / Skip. True when it ended a replay. */
    skip(){if(r.phase!=='play'||r.age<GOAL_REPLAY.skipAfter)return false;r.phase='idle';r.skipped++;return true;},
    /** Leaving, a match reset: drop any replay and the history (the next join starts clean). */
    cancel(){r.phase='idle';head=-1;count=0;goals=-1;goldSeen=0;since=-1;clock=0;lastRec=-Infinity;},
    /** Stash the live state, then write the replay frame at the playhead into the sim (and ballH / shotOffset). */
    apply(sim:ReplaySim){
      if(r.phase!=='play'||count<2)return false;
      const b=sim.ball,ids=sim.ids;
      live[0]=b.x;live[1]=b.y;live[2]=b.vx;live[3]=b.vy;live[4]=b.height;live[5]=b.owner?ids.indexOf(b.owner):-1;live[6]=b.lofted?1:0;
      for(let i=0;i<n;i++){const p=sim.players[ids[i]],q=HEAD+i*PER;if(!p)continue;live[q]=p.x;live[q+1]=p.y;live[q+2]=p.vx;live[q+3]=p.vy;live[q+4]=p.kick;}
      stashed=true;
      // the two frames around the playhead (newest-first walk; ≤ FRAMES steps)
      let ia=head,ib=head;
      for(let k=0;k<count;k++){const i=(head-k+FRAMES)%FRAMES;if(ring[i*stride]<=pt){ia=i;break;}ib=i;ia=i;}
      const A=ia*stride,B=ib*stride,ta=ring[A],tb=ring[B],u=tb>ta?Math.max(0,Math.min(1,(pt-ta)/(tb-ta))):0;
      b.x=mix(ring,A,B,u,1);b.y=mix(ring,A,B,u,2);b.vx=mix(ring,A,B,u,3);b.vy=mix(ring,A,B,u,4);r.ballH=Math.max(0,mix(ring,A,B,u,5));b.height=r.ballH;
      const own=ring[(u<.5?A:B)+6];b.owner=own>=0&&own<ids.length?ids[own]:null;b.lofted=ring[(u<.5?A:B)+7]>0;r.shotOffset=mix(ring,A,B,u,8);
      for(let i=0;i<n;i++){const p=sim.players[ids[i]],q=HEAD+i*PER;if(!p)continue;p.x=mix(ring,A,B,u,q);p.y=mix(ring,A,B,u,q+1);p.vx=mix(ring,A,B,u,q+2);p.vy=mix(ring,A,B,u,q+3);p.kick=Math.max(0,mix(ring,A,B,u,q+4));}
      if(shooter>=0&&shooter<n){const q=HEAD+shooter*PER;r.shooterX=mix(ring,A,B,u,q);r.shooterY=mix(ring,A,B,u,q+1);}
      return true;
    },
    /** Put the live state back (after the field is drawn). */
    restore(sim:ReplaySim){
      if(!stashed)return;stashed=false;const b=sim.ball,ids=sim.ids;
      b.x=live[0];b.y=live[1];b.vx=live[2];b.vy=live[3];b.height=live[4];const own=live[5];b.owner=own>=0?ids[own]??null:null;b.lofted=live[6]>0;
      for(let i=0;i<n;i++){const p=sim.players[ids[i]],q=HEAD+i*PER;if(!p)continue;p.x=live[q];p.y=live[q+1];p.vx=live[q+2];p.vy=live[q+3];p.kick=live[q+4];}
    },
  };
  return r;
}
