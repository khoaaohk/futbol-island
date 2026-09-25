/** Virgil van Dijk's signature — "winning every header in the box" (lib/town/iconicPlays.json: kind "signature", lesson "Time your jump
 * and meet the ball at its highest point."). THE MOMENT: his Liverpool debut, Liverpool 2–1 Everton, FA Cup third round (the Merseyside
 * derby), Anfield, Liverpool, Friday 5 January 2018 — the 84th-minute winning HEADER from Alex Oxlade-Chamberlain's corner, in front of the
 * Kop. An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or
 * StoryFilmPlayer. A 1:1 reconstruction from WRITTEN accounts plus one agency photo of the header (the footage itself was not reviewed),
 * rendered as a riso print.
 * WHY THIS MOMENT: the signature is an AERIAL one. The two candidates in the brief (the 2019 jockeying of Tottenham's 2 v 1) show his
 * defending on the ground, not his heading, so they do not fit this signature. The debut winner is the best-documented header of his career:
 * both match reports describe it (he "towered above the Everton defence", "beat Phil Jagielka plus a flapping Jordan Pickford to head in the
 * winner", "got to the ball ahead of Pickford") and the BBC notes he "was almost unbeatable in the air" all game — exactly the timing-your-
 * jump lesson.
 * Narration text: public/plays/narration/van-dijk-signature/script.json. The lead voices it later with local Kokoro. Until then every chapter
 * runs on provisional cue times (see estimate()); EVERY action time is read from cue onsets and chapter seconds, so once timing.json exists
 * `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/van-dijk-signature/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/van-dijk-signature/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * SOURCES (Sept 2026, read as raw pages; cached under the build scratchpad films/src-cache/):
 *  - BBC Sport, Phil McNulty, "Liverpool 2-1 Everton" (5 Jan 2018)  https://www.bbc.com/sport/football/42508636
 *    "his late header settled a highly competitive FA Cup third round Merseyside derby"; "keeper Jordan Pickford misjudged a corner, allowing
 *    Van Dijk … to steal in six minutes from time"; "in front of the Kop"; "Van Dijk got to the ball ahead of Pickford, whose rash attempt to
 *    claim was heavily punished"; he had earlier "head[ed] at Pickford from six yards"; "almost unbeatable in the air" against Calvert-Lewin;
 *    Klopp: "a brilliant header … In front of the Kop makes it even better."
 *  - The Guardian, Andy Hunter, "Virgil van Dijk crowns Liverpool debut to see off Everton in Cup derby" (5 Jan 2018)
 *    https://www.theguardian.com/football/2018/jan/05/liverpool-everton-fa-cup-match-report
 *    "Five minutes remained at Anfield when Virgil van Dijk towered above the Everton defence … with the winning goal in front of the Kop";
 *    "Alex Oxlade-Chamberlain swung over a late corner and he beat Phil Jagielka plus a flapping Jordan Pickford to head in the winner";
 *    Milner's penalty (35'), Sigurdsson's equaliser (67'); the first Liverpool player to score on his debut against Everton since 1901.
 *  - Wikipedia (raw wikitext): "2017–18 Liverpool F.C. season" (5 January, FA Cup R3, Liverpool 2–1 Everton: Milner 35' pen., Van Dijk 84';
 *    "van Dijk in his Liverpool debut scored off a corner kick making it 2–1"; signed for a reported £75m) and "2017–18 Everton F.C. season"
 *    (kit infobox: royal blue home shirt, white shorts, white socks).
 *  - Getty Images / AFP editorial photo 901623028, "Liverpool's Dutch defender Virgil van Dijk (L) heads the ball to score their second goal
 *    during the English FA Cup third round …" (viewed, not reproduced): the kits THAT night — Liverpool all red (red shirts, shorts and
 *    socks), Van Dijk's No. 4; Everton royal blue shirts, WHITE shorts, WHITE socks; Pickford in a lime-green shirt, shorts and socks with
 *    PICKFORD 1 on the back and pale gloves; a night match under floodlights; Van Dijk rising from the left with his head on the ball while
 *    Pickford, beside him, flaps up with both gloves just short of it; a second Liverpool player and several Everton players around them.
 * CONFIRMED by those sources: date, venue, competition, opponent, 1–1 until the 84th minute; the goal came from a corner swung over by
 *  Oxlade-Chamberlain; Pickford came to claim it, misjudged it and flapped; Van Dijk got there first, rising above Jagielka and the Everton
 *  defence, and headed the winner; the goal was scored at the Kop end; it was his debut; the kits and numbers above (Van Dijk 4, Pickford 1);
 *  a floodlit night.
 * INFERRED / ILLUSTRATIVE: which corner (drawn: Liverpool's LEFT, the −z flag on the Main Stand side, Oxlade-Chamberlain curling an
 *  in-swinger with his RIGHT foot — not stated in the sources and never narrated); every position, run and timing in metres and seconds (Van
 *  Dijk waiting near the penalty spot, ≈ 6 m steal-in, meeting the ball ≈ 6.5 m out; the corner ≈ 34 m in ≈ 1.4 s; Pickford ≈ 4 m off his
 *  line); where the header went (drawn: down and across, inside the far post, past the stranded keeper); Jagielka's spot and late jump; the
 *  other players (unnamed) and who stood where; Oxlade-Chamberlain's number (21) and every kit detail beyond the photo (Liverpool's paper
 *  numbers and trim; Pickford's lime printed in yellow ink, the four-ink palette has no green); the ball (drawn white with navy panels); the
 *  celebration run toward the Kop corner; Anfield's stands (the 2018 ground as drawn in trent-corner-2019), the Everton fans' corner of the
 *  Anfield Road end, seat and crowd colours, flags, the TV camera positions and lenses. The narration names none of the inferred details.
 *
 * STRUCTURE (the TV broadcast, never top-down): the play is ONE simulation on a real clock τ (seconds, τ = 0 the corner is struck):
 *  ch1 = the live broadcast from the high Main Stand camera in real time (Liverpool in red, Everton in blue, the 1-1 / 84' score bug,
 *  Oxlade-Chamberlain at the flag, the corner, the header, the Kop erupts); ch2 = the TV slow-motion replay, low from the far side of the
 *  box: Pickford rushing off his line, Van Dijk timing his jump and getting there first; ch3 = a second replay high behind the goal: he meets
 *  the ball at its highest point above Pickford's gloves and it comes at the camera into the net, then the crane round to the Kop; ch4 = the
 *  lesson: a close, very slow replay with teaching marks (a pale ghost who jumps too early and is falling as the ball arrives; the take-off
 *  spark; the ball's arc; a height line and a ring at the highest point). Composed on the FULL sheet (world units = sheet units centred on
 *  the canvas; never sheet.safe), so it frames from the 1.45:1 card window down to square (a narrower window widens the lens a little).
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev`
 * secondary motion for hems, motionSmear on the corner, the leap and Pickford's flap). Handedness: the world is right-handed (x toward
 * Everton's goal at the Kop end, y up, +z = Liverpool's right), exactly athlete.ts's convention, so strike({foot:'r'}) is the RIGHT foot and
 * the corner from Liverpool's left is the −z corner. Inks: yellow, red, blue, navy (Everton's white shorts = paper). Everything is keyed to
 * cue times, poses on twos, cameras on ones; all randomness seeded. Heat: small figures print at 'low', at most FULL_CAP non-hero figures at
 * full detail, every figure inside a passage (and a chapter's last .7 s) capped. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,celebrate,header,posed,blendPose,keyPoses,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Dream debut',text:"Anfield, January 2018: Virgil van Dijk's first game for Liverpool, in red, against Everton, in blue. One-all, eighty-four minutes. Oxlade-Chamberlain swings in a corner... Van Dijk rises... Goal!",tail:2.1,
  cues:['Anfield','first game','in red','in blue','One-all','eighty-four','Oxlade-Chamberlain','swings in','Van Dijk rises','Goal']},
 {label:'Watch it again',text:'Watch again, slowly. The keeper, Jordan Pickford, rushes off his line to catch it. Van Dijk times his jump and gets there first.',tail:1.6,
  cues:['Watch again','slowly','Jordan Pickford','rushes off','catch it','Van Dijk times','gets there first']},
 {label:'Highest point',text:'From behind the goal: he meets the ball at its highest point, before Pickford can. Into the net, in front of the Kop!',tail:2.1,
  cues:['From behind','meets the ball','highest point','before Pickford','Into the net','the Kop']},
 {label:'Time your jump',text:"Don't jump too early! Time your jump, and meet the ball at its highest point.",tail:2.2,
  cues:["Don't jump",'too early','Time your jump','meet the ball','highest point']},
];
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py van-dijk-signature (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header): withTiming swaps in the clips, the chapter
 * lengths and the word onsets, and every action below re-times itself. */
import timingJson from '../../../public/plays/narration/van-dijk-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('van-dijk: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('van-dijk: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mul3=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*clamp(u);
/** yaw (athlete.ts: 0 faces +x, + turns left) facing the ground direction (dx,dz) */
const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera (also aperture()) */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: Everton's goal line is x = 0 (Liverpool attack +x, toward the Kop), goal centre z = 0, +z = Liverpool's right; touchlines z = ±34,
 * halfway x = −52.5. The Main Stand (the TV camera side) is −z. */
type Cam=Camera;
const NEAR=.4;
function toCam(c:Cam,P:V3):V3{const d:V3=[P[0]-c.eye[0],P[1]-c.eye[1],P[2]-c.eye[2]];return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.center[0]+c.F*q[0]/q[2],c.center[1]-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
const kAt=(c:Cam,P:V3)=>c.F/Math.max(NEAR,toCam(c,P)[2]);
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};
/** a 3D segment as a projected quad (clipped to the near plane); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- Anfield on a January night: the Kop behind Everton's goal
/** stand planes (a along, b up the rake 0..1): 0 the far side (+z, two tiers), 1 the Kop behind Everton's goal (+x: one great single tier),
 * 2 the Main Stand (−z, the camera side, three tiers), 3 the Anfield Road end (−x, the Everton fans in its far corner). Corners open. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-114,8,a),1.4+23*b,41+30*b],
 (a,b)=>[9+36*b,1.4+31*b,lerp(-40,40,a)],
 (a,b)=>[lerp(8,-114,a),1.4+33*b,-41-37*b],
 (a,b)=>[-114-25*b,1.4+18*b,lerp(38,-38,a)],
];
const STAND_COLS=[100,76,100,64],STAND_ROWS=[13,16,15,10],TIERS=[[.5],[],[.36,.7],[]];
/** flags and banners along the stand fronts: [stand, a, b, 0 = red flag | 1 = red-and-paper halves | 2 = a long red banner] */
const FLAGS:[number,number,number,number][]=[[1,.1,.32,0],[1,.24,.56,1],[1,.38,.22,2],[1,.55,.6,0],[1,.68,.34,1],[1,.84,.48,0],[0,.6,.12,2],[0,.82,.55,0],[2,.3,.1,2],[3,.62,.3,0]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a January night on Merseyside: a navy sky, a floodlit blue haze low down
 s.field(K,.58,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){[.12,.2,.3].forEach((d,i)=>s.tone(B,polyPath([[-1e4,hz[1]+120-i*160],[1e4,hz[1]+120-i*160],[1e4,hz[1]-190-i*160],[-1e4,hz[1]-190-i*160]],true),d));}
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIERS[i])seg3(c,S(0,b),S(1,b),1.2,tier);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.7),[0,12,0]),add3(S(0,.7),[0,12,0])]));
  seg3(c,add3(S(0,.7),[0,11.8,0]),add3(S(1,.7),[0,11.8,0]),.5,edge);}
 s.knockout(planes);s.tone(R,planes,.66);s.tone(K,planes,.3);s.knockout(tier,.8);
 // the crowd: seeded marks sized by distance (Liverpool red, white, navy; Everton's blue in a corner of the Anfield Road end); the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],rows=STAND_ROWS[si];for(let j=0;j<rows;j++){const b=(j+.5)/rows;if(TIERS[si].some(w=>Math.abs(b-w)<.04))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,13);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const away=si===3&&a<.26;const ink=away?(h<.55?3:0):h<.4?1:h<.72?0:h<.93?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(K,inks[2],.9);s.fill(B,inks[3],.95);
 s.knockout(roof);s.fill(K,roof,.92);s.knockout(edge,.8);
 const fl=new Path2D(),half=new Path2D();
 for(const[si,a,b0,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=kind===2?.1:.028,hb=kind===2?.04:.07,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,b0),P(1,b0),P(1,b0+hb),P(0,b0+hb)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===1)addPoly(half,polyP(c,[P(.5,b0),P(1,b0),P(1,b0+hb),P(.5,b0+hb)]));}
 s.knockout(fl);s.fill(R,fl,.95);s.knockout(half,.9);
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.025,.7),[0,11,0]),b=add3(S(u+.025,.7),[0,11,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.13);
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([6,0,-38],[6,0,38]);board([-110,0,-38],[6,0,-38]);board([-110,0,38],[6,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.9,.25,z],[5.9,.25,z+3.3],[5.9,.68,z+3.3],[5.9,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(R,bd,.85);s.fill(K,bd,.3);s.knockout(pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 seg3(c,[-11.12,0,0],[-10.88,0,0],.24,ln);
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
}
/** Everton's goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around (bz) */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-2.6,-1.3,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[B,.1]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]];
const SKIN_V:InkFill[]=[[R,.4],[Y,.5],[K,.15]];
/** Liverpool, 5 Jan 2018: all red — red shirts, red shorts, red socks (the photo); paper numbers and trim (inferred) */
const lfc=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Everton, 5 Jan 2018: royal blue shirts, white shorts, white socks (the photo + the kit infobox) */
const efc=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',build:{height:1.83,bulk:1},...o});
const B_VVD:Build={height:1.93,bulk:1.08,thighs:1.06},B_OX:Build={height:1.75,bulk:1.02,thighs:1.08},B_PICK:Build={height:1.85,bulk:1.04},B_JAG:Build={height:1.83,bulk:1};
/** Van Dijk: No. 4, 1.93 m, short dark hair */
const VVD_ST=lfc({number:4,skin:SKIN_V,hair:[K,.95],build:B_VVD,seed:4});
const OX_ST=lfc({number:21,skin:SKIN_M,build:B_OX,seed:21});
/** Pickford: lime green (the photo), printed in yellow; PICKFORD 1; pale gloves */
const PICK_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[Y,.6],hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,number:1,numberInk:K,build:B_PICK,seed:1};
const JAG_ST=efc({number:6,hair:[K,.6],build:B_JAG,seed:6});
/** the lesson's ghost: a pale navy print of a player who jumps too early (not a real player) */
const GHOST_ST:AthleteStyle={shirt:[K,.16],shorts:[K,.16],socks:[K,.16],boots:[K,.3],skin:[[K,.12]],hair:[K,.3],line:K,hairStyle:'short',shadow:false,lineWeight:.7,build:B_VVD,seed:40};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is the corner struck)
const BALL_R=.11,GRAV=9.81;
/** the corner flies TF s to his forehead; the header reaches the goal line TG (≈ 6.8 m in .44 s) */
const TF=1.4,TG=TF+.44;
/** Van Dijk's header spot (his pelvis) ≈ 6.5 m out, a little toward the near post; he faces the goal, turned toward the corner */
const HP:[number,number]=[-6.5,-1],YAW_H=yawTo(1,-.3);
/** his header: header() with a tall man's spring ("towered above"), the head flicking the ball down and across toward the far post (his right) */
function vvdHeader(u:number):Pose{const p=header(clamp(u));p.air*=1.2;const w=Math.sin(Math.PI*clamp((u-.34)/.36)),sn=clamp((u-.36)/.2);
 p.neckY+=lerp(.18,-.3,sn)*w;p.twist+=lerp(.1,-.14,sn)*w;p.neckP+=.3*w;return p;}
/** contact on the header clock: mid-snap, forehead through the ball */
const CU=.47,HD=1.0,TJ=TF-CU*HD;
/** his forehead at contact (solved from the skeleton): the ball's centre is one radius in front of it */
const HEAD_PT:V3=(()=>{const sk=solve(vvdHeader(CU),B_VVD,{x:HP[0],z:HP[1],yaw:YAW_H}),hd=sk.head,fc=sk.face,d=sub3(fc,hd),l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*(BALL_R+.02),fc[1]+d[1]/l*(BALL_R+.02)+.02,fc[2]+d[2]/l*(BALL_R+.02)] as V3;})();
/** the corner spot: Liverpool's LEFT, the −z flag on the Main Stand side (inferred) */
const P0:V3=[-.45,BALL_R,-33.55];
/** the in-swinger: a steady sideways pull toward goal (+x) on top of gravity (right foot from the left) */
const SWING:V3=[2.4,-GRAV,0];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
const V_CROSS=launch(P0,HEAD_PT,TF,SWING);
/** Oxlade-Chamberlain strikes along the ball's launch direction */
const DC=nrm2(V_CROSS[0],V_CROSS[2]),YAW_X=yawTo(DC[0],DC[1]);
/** where his pelvis stands at contact so his RIGHT boot meets the back of the ball (solved once, FK) */
const PCX:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),B_OX,{x:0,z:0,yaw:YAW_X});return[P0[0]-DC[0]*.12-sk.rToe[0],P0[2]-DC[1]*.12-sk.rToe[2]];})();
/** the run-up: from behind the ball and to its left (a right-footer's angle) */
const LEFT_X:[number,number]=[DC[1],-DC[0]],RUN0:[number,number]=[PCX[0]-DC[0]*3.2+LEFT_X[0]*1.5,PCX[1]-DC[1]*3.2+LEFT_X[1]*1.5];
/** where the header crosses the goal line: down and across, inside the far post (+z), past the stranded keeper (inferred) */
const GOAL_PT:V3=[0,.8,1.9],NET_HIT:V3=[1.8,.55,2.1],REST:V3=[1.3,BALL_R,1.8];
const G3:V3=[0,-GRAV,0];
const V_HEAD=launch(HEAD_PT,GOAL_PT,TG-TF,G3);

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated (all illustrative, see header)
type Role='vvd'|'ox'|'gk'|'mark'|'hold'|'lfc'|'efc';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean;holds?:number};
const T0=-9,T1=12,DT=.02;
const mp=(u:number):[number,number]=>[PCX[0]+DC[0]*u,PCX[1]+DC[1]*u];
/** after the goal the Liverpool players chase Van Dijk toward the Kop corner (−z, x ≈ 0) */
const toVvd=(x:number,z:number,k:number):number[][]=>[[TG+1+k*.2,x,z],[TG+3.6+k*.3,lerp(x,-3,.6),lerp(z,-14,.6)],[T1,lerp(x,-1.4,.8),lerp(z,-22,.85)]];
const ACTORS:Actor[]=[
 // Van Dijk: waits near the penalty spot, steals in toward the near post as the corner is struck, takes off ≈ 6.5 m out
 {name:'Virgil van Dijk',role:'vvd',hero:true,style:VVD_ST,keys:[[T0,-12.6,2.3],[-4,-12.8,2.5],[-1.4,-12.5,2.1],[-.4,-12.1,1.8],[0,-11.5,1.45],[.45,-9.6,.5],[TJ-.12,HP[0]-.95,HP[1]+.3],[TJ+.2,HP[0],HP[1]],[TF+.5,HP[0],HP[1]],[TF+1.3,-5.4,-3.6],[TF+3.4,-3.2,-11.5],[TF+6,-1.4,-20],[T1,-.4,-26]]},
 {name:'Alex Oxlade-Chamberlain',role:'ox',hero:true,style:OX_ST,keys:[[T0,.4,-36.2],[-6,.1,-35.3],[-4.8,...mp(-.7)],[-3.2,...RUN0],[-1,...RUN0],[-.5,...mp(-1.6)],[0,...mp(0)],[.7,...mp(.9)],[3,...mp(3.2)],[T1,-2,-26]]},
 // Pickford: on his line, then comes rushing out to claim — and misjudges it (the ball is headed before his gloves get there)
 {name:'Jordan Pickford',role:'gk',hero:true,style:PICK_ST,keys:[[T0,-.8,-1.1],[-2,-.8,-1.3],[0,-.9,-1.4],[.35,-1.3,-1.5],[TF-.55,-3.5,-1.7],[TF-.3,-4.6,-1.8],[TF,-5.3,-1.85],[TF+.4,-5.6,-1.9],[TF+1.2,-5.7,-1.85],[T1,-4.9,-1.5]]},
 // Jagielka: marking Van Dijk, a step behind him when he goes, a late lower jump
 {name:'Phil Jagielka (beaten)',role:'mark',hero:true,style:JAG_ST,keys:[[T0,-11.6,1.4],[-1.4,-11.5,1.3],[0,-11,1.1],[.5,-9.4,.6],[TJ,-7.6,-.05],[TF,-7.3,-.15],[T1,-6.8,.3]]},
 // the pack in the box: Everton markers holding Liverpool players
 {name:'Everton near post',role:'efc',style:efc({skin:SKIN_M,seed:42}),keys:[[T0,-.9,-4.3],[0,-.8,-4.1],[TF,-1,-3.6],[T1,-1.3,-3]]},
 {name:'Everton holder 1',role:'hold',holds:10,style:efc({build:{height:1.9},seed:43}),keys:[[T0,-4.4,-3.3],[-2,-4.5,-3.1],[0,-4.6,-2.9],[TF,-4.9,-2.6],[T1,-4.8,-2]]},
 {name:'Everton holder 2',role:'hold',holds:11,style:efc({skin:SKIN_D,seed:44}),keys:[[T0,-5.4,1.6],[-2,-5.5,1.5],[0,-5.6,1.4],[TF,-5.9,1.1],[T1,-5.6,.6]]},
 {name:'Everton edge',role:'efc',style:efc({skin:SKIN_M,hair:K,seed:46}),keys:[[T0,-16.2,-4.6],[-2,-16.4,-4.4],[0,-15.8,-4],[TF,-13.8,-3.2],[T1,-12.6,-2.4]]},
 {name:'Everton back post',role:'efc',style:efc({seed:48,build:{height:1.88}}),keys:[[T0,-1.6,3.4],[0,-1.5,3.3],[TF,-1.2,2.8],[T1,-1.4,2.6]]},
 {name:'Everton zone',role:'efc',style:efc({skin:SKIN_D,seed:49}),keys:[[T0,-8.6,4.6],[0,-8.4,4.4],[TF,-8.2,3.6],[T1,-7.6,3]]},
 {name:'Liverpool attacker 1 (held)',role:'lfc',style:lfc({build:{height:1.93},skin:SKIN_M,seed:61}),keys:[[T0,-3.9,-2.6],[-2,-3.9,-2.4],[0,-4,-2.2],[TF,-4.2,-1.8],...toVvd(-4.4,-1.6,0)]},
 {name:'Liverpool attacker 2 (held)',role:'lfc',style:lfc({skin:SKIN_D,seed:62}),keys:[[T0,-4.9,2.2],[-2,-4.9,2.1],[0,-5,2],[TF,-5.2,1.8],...toVvd(-5.4,1.6,1)]},
 {name:'Liverpool attacker 3',role:'lfc',style:lfc({seed:63,build:{height:1.84}}),keys:[[T0,-9.8,5.2],[-2,-9.6,5],[0,-9.4,4.8],[TF,-8.6,3.9],...toVvd(-8,3.4,2)]},
 {name:'Liverpool edge',role:'lfc',style:lfc({skin:SKIN_M,hair:[K,.7],seed:64}),keys:[[T0,-18.2,1.6],[-2,-18,1.4],[0,-17.6,1.2],[TF,-15.6,.8],...toVvd(-14,.2,3)]},
];
const VVD=0,OX=1,GK=2,JAG=3;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const still=(a:number[],b:number[])=>Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<1e-6;
 const f=(j:number)=>{const m1=still(k1,k2)||still(k0,k1)?0:(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=still(k1,k2)||still(k2,k3)?0:(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (drives the gait phase) — built once */
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};

// ---------------------------------------------------------------- the ball
/** in the quadrant → the corner → the header → the net */
function ballAt(tau:number):V3{
 if(tau<=0)return P0;
 if(tau<TF)return flyA(P0,V_CROSS,SWING,tau);
 if(tau<TG)return flyA(HEAD_PT,V_HEAD,G3,tau-TF);
 if(tau<TG+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.55),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.69)*9))*Math.exp(-(tau-TG-.69)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:tau<TF?tau*TAU*4:TF*TAU*4-(tau-TF)*TAU*3;
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=distOf(k,tau)/(2.3+2.1*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 // set-piece jostling: knees bent, arms out, a small shuffle
 const idle=blendPose(stand(),posed({lHipF:24,rHipF:18,lKnee:30,rKnee:26,lean:14,pitch:4,neckP:-10,lShA:26,rShA:22,lElb:40,rElb:36,rAnk:-6,lAnk:-6}),.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
/** face along the run when moving, else toward the ball (blended, so turns are continuous) */
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
const DEJECT=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:30,pitch:6,neckP:34,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24});
/** a marker holding his man: both arms out and grabbing, knees bent, leaning in (pulses on a slow tug) */
const HOLD=(tau:number,k:number)=>posed({lHipF:30,rHipF:22,lKnee:34,rKnee:30,lean:18,pitch:6,lShF:74+10*Math.sin(tau*3+k),rShF:52,lShA:26,rShA:34,lElb:18,rElb:42,lHand:1,rHand:1,neckP:-8,twist:-.12});
/** Pickford's claim: a keeper's take-off off one foot, knee up, both gloves reaching high for the ball — and flapping at air. Peak at .55. */
const CLAIM_KEYS:[number,Pose][]=[
 [0,posed({lHipF:30,rHipF:26,lKnee:40,rKnee:36,lean:16,pitch:6,lShF:40,rShF:40,lShA:24,rShA:24,lElb:60,rElb:60,neckP:-20,lHand:1,rHand:1})],
 [.28,posed({lHipF:8,lKnee:30,rHipF:66,rKnee:84,lAnk:30,lean:6,pitch:0,lShF:120,rShF:118,lShA:22,rShA:20,lElb:40,rElb:44,neckP:-34,air:.08,lHand:1,rHand:1})],
 [.55,posed({air:.55,lHipF:-6,lKnee:26,lAnk:40,rHipF:88,rKnee:96,rAnk:36,lean:-4,pitch:-2,lShF:148,rShF:156,lShA:12,rShA:8,lElb:12,rElb:8,neckP:-44,lHand:1,rHand:1})],
 [.72,posed({air:.3,lHipF:4,lKnee:40,rHipF:70,rKnee:84,lean:-2,pitch:-2,lShF:150,rShF:140,lShA:30,rShA:34,lElb:30,rElb:36,neckP:-30,twist:-.2,neckY:-30,lHand:.9,rHand:.9})],
 [1,posed({lHipF:44,rHipF:40,lKnee:62,rKnee:58,lean:22,pitch:6,lShF:40,rShF:34,lShA:30,rShA:30,lElb:50,rElb:50,neckP:-4,neckY:-40,twist:-.3,lHand:.7,rHand:.7})],
];
const CLAIM=(u:number)=>keyPoses(clamp(u),CLAIM_KEYS);
/** his claim clock: the leap peaks just after the ball has been headed */
const T_CL=TF-.6,CL_L=1.05;
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'vvd':{
   // eyes on the corner while he waits; the steal-in; he gathers, springs, heads it down and across, lands, runs off to the Kop
   if(tau>TJ-.3&&tau<TJ+HD+.6){const u=(tau-TJ)/HD,hp=vvdHeader(u);pose=blendPose(pose,hp,sm(TJ-.3,TJ,tau)*(1-sm(TJ+HD,TJ+HD+.6,tau)));}
   if(tau>TJ+HD){const run=celebrate(distOf(k,tau)/4.2,{kind:'run'});pose=blendPose(pose,run,sm(TJ+HD+.1,TJ+HD+.8,tau));}
   if(tau<-.5){yaw=faceYaw(k,tau,P0);}
   const w=sm(TJ-.6,TJ-.15,tau)*(1-sm(TF+.55,TF+1.1,tau));yaw=w>=1?YAW_H:lerpAng(yaw,YAW_H,w);break;}
  case 'ox':{const w=win(tau,-.55,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'r'}),w);
   if(tau<-4.4&&tau>-6.2){// bends to set the ball in the quadrant
    pose=blendPose(pose,posed({lHipF:70,rHipF:40,lKnee:90,rKnee:60,lean:40,pitch:10,neckP:30,lShF:60,rShF:50,lElb:30,rElb:30}),win(tau,-6.2,-4.4,.5));yaw=faceYaw(k,tau,P0);}
   // the raised arm (a signal to the box) as he steps back
   if(tau>-3.2&&tau<-1.3)pose=blendPose(pose,posed({lHipF:8,rHipF:4,lKnee:12,rKnee:10,rShF:170,rShA:20,rElb:10,lShA:14,lElb:30,neckY:10}),win(tau,-3.2,-1.3,.4)*.9);
   if(tau>-3.4&&tau<-1){yaw=lerpAng(faceYaw(k,tau,[HP[0],0,HP[1]]),YAW_X,sm(-2.1,-1.2,tau));}
   yaw=lerpAng(yaw,YAW_X,sm(-1.1,-.5,tau)*(1-sm(.9,1.6,tau)));
   if(tau>1.4)yaw=lerpAng(yaw,faceYaw(k,tau,[HP[0],0,HP[1]]),sm(1.4,1.9,tau));
   if(tau>TG+.5){const j=celebrate((tau-TG)*1.1,{kind:'arms'});pose=blendPose(pose,j,sm(TG+.5,TG+1.1,tau)*.85);}
   break;}
  case 'gk':{const set=keeperSet(tau*1.3);pose=blendPose(set,pose,sm(.2,.6,tau));
   if(tau>T_CL-.12)pose=blendPose(pose,CLAIM((tau-T_CL)/CL_L),sm(T_CL-.12,T_CL+.05,tau));
   if(tau>TG+1.2)pose=blendPose(pose,DEJECT,sm(TG+1.4,TG+2.2,tau)*.7);
   yaw=faceYaw(k,Math.min(tau,TF+.05),ballAt(Math.min(tau,TF)));if(tau>TF+.1)yaw=lerpAng(yaw,yawTo(1,.4),sm(TF+.1,TF+.6,tau));break;}
  case 'mark':{// a step behind him when he goes: a late, lower jump beside him, then hands on hips
   if(tau>TF-.6&&tau<TF+1){const hp=header(clamp((tau-(TF-.4))/1.0));hp.air*=.5;pose=blendPose(pose,hp,sm(TF-.6,TF-.4,tau)*(1-sm(TF+.6,TF+1,tau)));}
   if(tau>TF+.9)pose=blendPose(pose,DEJECT,sm(TF+.9,TF+1.6,tau));yaw=faceYaw(k,Math.min(tau,TF));break;}
  case 'hold':{const m=a.holds??0,[mx,mz]=posOf(m,tau),g=1-sm(TF-.3,TF+.2,tau);pose=blendPose(pose,HOLD(tau,k),g*.95);
   if(g>.02)yaw=lerpAng(faceYaw(k,tau),yawTo(mx-x,mz-z),g);
   if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);break;}
  case 'efc':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);if(tau>TF+.2)yaw=faceYaw(k,TF+.2);break;
  case 'lfc':if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
 }
 return{pose,place:{x,z,yaw}};
}
/** the lesson's ghost: the same leap started .45 s too early, a metre further out — falling as the ball arrives */
const GHOST_P:[number,number]=[HP[0]-1.4,HP[1]-1.3],GHOST_EARLY=.45;
function ghostState(tau:number):State{const u=(tau-(TJ-GHOST_EARLY))/HD,idle=blendPose(stand(),posed({lHipF:24,rHipF:20,lKnee:30,rKnee:28,lean:14,pitch:4,neckP:-12}),.6);
 const p=u<-.3?idle:blendPose(idle,vvdHeader(u),sm(-.3,0,u)*(1-sm(1,1.4,u)));return{pose:p,place:{x:GHOST_P[0],z:GHOST_P[1],yaw:YAW_H}};}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hems trail), smear = halftone echo + speed lines on fast limbs (the corner, the leap, Pickford's flap). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball + the scene assembly
function drawBall(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;prevP?:V3|null;lines?:boolean}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??12,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05&&P[2]>-34.5)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.1,.08,.5));
 if(o.lines&&o.prevP){const a=pr(c,o.prevP);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
type Item={d:number;draw:()=>void};
const FULL_CAP=2;
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean};
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print at `low`; in a chapter's last .7 s and inside a passage
 * every figure is capped (Van Dijk 'mid', everyone else 'low', tiny extras skipped). */
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,goal:{bulge:number;bz:number}|null,cap=false):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending||cap;
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>FULL_CAP?near[FULL_CAP-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  const px=k*ppu;if(passing&&!f.hero&&px<34)continue;const style:AthleteStyle=passing?{...f.style,detail:f.style===VVD_ST?'mid':'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<44?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,goal.bulge,goal.bz)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
/** the pitch at play time τ (poses on twos): every actor (prev = one drawn frame earlier), the ball, the goal (+ the lesson's ghost) */
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[];cap?:boolean;ghost?:boolean}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k];const st=stateOf(k,tau);const hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===VVD&&tau>TJ-.3&&tau<TF+.3)||(k===OX&&tau>-.25&&tau<.35)||(k===GK&&tau>T_CL+.15&&tau<T_CL+.75))};});
 if(o.ghost)figs.push({st:ghostState(tau),prev:ghostState(tauPrev),style:GHOST_ST,hero:true});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]},!!o.cap);
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const gnd=(P:V3,y=0):V3=>[P[0],y,P[2]];
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};
const HP3:V3=[HP[0],1.6,HP[1]];
/** a flat ring on the grass (navy band, paper core, ink) */
function groundRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number){
 const X=pr(c,[P[0],.01,P[2]]);if(!X||a<=0)return;const pts:Pt[]=[];for(let i=0;i<24;i++){const u=i/24*TAU,p=pr(c,[P[0]+Math.cos(u)*rad,.01,P[2]+Math.sin(u)*rad]);if(p)pts.push(p);}
 if(pts.length<8)return;const w=Math.max(5,kAt(c,P)*.07),band=ribbon(pts,w*1.5,{close:true,seed:5,taper:0,wobble:.6}),core=ribbon(pts,w,{close:true,seed:5,taper:0,wobble:.6});s.fill(K,band,.7*a);s.knockout(core,a);s.fill(ink,core,.95*a);
}
/** a team ring on the grass round each player of a side (on "in red" / "in blue") */
function teamRings(s:Sheet,c:Cam,tau:number,side:'lfc'|'efc',g:number){
 if(g<=.02)return;const p=new Path2D();
 ACTORS.forEach((a,k)=>{const isL=a.role==='vvd'||a.role==='ox'||a.role==='lfc';if(side==='lfc'?!isL:isL)return;
  const[x,z]=posOf(k,tau),pts:Pt[]=[];for(let i=0;i<20;i++){const u=i/20*TAU,q=pr(c,[x+Math.cos(u)*.9*g,.02,z+Math.sin(u)*.9*g]);if(q)pts.push(q);}if(pts.length>12)p.addPath(ribbon(pts,Math.max(5,kAt(c,[x,0,z])*.13),{close:true,taper:0,wobble:.6}));});
 s.knockout(p,.9);s.fill(side==='lfc'?R:B,p,.95);
}
/** a ring round a point on screen (a keeper, the ball) */
function screenRing(s:Sheet,q:Pt,rr:number,g:number,ink=Y,seed=8){if(g<=.02||rr<1)return;const pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([q[0]+Math.cos(a)*rr,q[1]+Math.sin(a)*rr*1.08]);}
 const p=ribbon(pts,Math.max(5,rr*.1),{seed,close:true,taper:0,wobble:.8});s.knockout(p,.9*g);s.fill(ink,p,.95*g);}
/** 7-segment block digits (glyph box 1 × 2) for the score bug */
const SEGS:Record<string,number[][]>={a:[[0,0],[1,0]],b:[[1,0],[1,1]],c:[[1,1],[1,2]],d:[[0,2],[1,2]],e:[[0,1],[0,2]],f:[[0,0],[0,1]],g:[[0,1],[1,1]]};
const DIGITS:Record<string,string>={'0':'abcdef','1':'bc','2':'abged','3':'abgcd','4':'fgbc','5':'afgcd','6':'afgedc','7':'abc','8':'abcdefg','9':'abfgcd','-':'g'};
function glyphs(str:string,x0:number,y0:number,gw:number,path:Path2D){const th=gw*.3;[...str].forEach((ch,ci)=>{const ox=x0+ci*gw*1.6;for(const sg of DIGITS[ch]??''){const[[a0,b0],[a1,b1]]=SEGS[sg],x=ox+Math.min(a0,a1)*gw-th/2,y=y0+Math.min(b0,b1)*gw-th/2,w=a0===a1?th:gw+th,h=b0===b1?th:gw+th;path.rect(x,y,w,h);}});}
/** the TV score bug (top left): Liverpool's red block, 1-1 (2-1 after the goal), Everton's blue block, the minute (84) */
function scoreBug(s:Sheet,g:number,goal:boolean,minute:number){
 if(g<=.02)return;const x=-s.W/2+60-(1-g)*120,y=-s.H/2+54,w=380,h=112,panel=polyPath([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],true);
 s.knockout(panel,.95*g);s.fill(K,panel,.92*g);
 const blk=(fx:number,ink:string)=>{const p=polyPath([[fx,y+16],[fx+54,y+16],[fx+54,y+58],[fx,y+58]],true);s.knockout(p,g);s.fill(ink,p,.95*g);};
 blk(x+16,R);blk(x+w-70,B);
 const sc=new Path2D(),mn=new Path2D();glyphs(goal?'2-1':'1-1',x+118,y+14,28,sc);s.knockout(sc,g);if(minute>.02){glyphs('84',x+150,y+82-8*(1-minute),11,mn);s.knockout(mn,g*minute);s.fill(Y,mn,.95*g*minute);}
}
/** the TV replay badge (top left): a rewind mark (two yellow triangles on navy); "slowly" → the second triangle gives way to three slow dots */
function replayBadge(s:Sheet,g:number,slow:number){
 if(g<=.02)return;const x=-s.W/2+60-(1-g)*120,y=-s.H/2+54,w=190,h=96,panel=polyPath([[x,y],[x+w,y],[x+w-18,y+h],[x-18,y+h]],true);
 s.knockout(panel,.95*g);s.fill(K,panel,.92*g);
 const tri=(cx:number,cov:number)=>{const p=polyPath([[cx+22,y+22],[cx+22,y+h-22],[cx-14,y+h/2]],true);s.knockout(p,cov);s.fill(Y,p,.95*cov);};
 tri(x+50,g);tri(x+100,g*(1-slow));
 if(slow>.02){const d=new Path2D();for(let i=0;i<3;i++){const cx=x+96+i*26,cy=y+h/2,r=7*easeOutBack(clamp(slow*1.4-i*.2));if(r>.5)d.addPath(polyPath(blob(cx,cy,r,r,i+3,{n:10}),true));}s.knockout(d,g);s.fill(Y,d,.95*g);}
}
/** the replay trail: the corner's path so far, a fading yellow ribbon */
function trail(s:Sheet,c:Cam,tau:number,fade:number){
 if(fade<=0||tau<=0)return;const pts:Pt[]=[];const a=Math.max(0,tau-.9),b=Math.min(tau,TG);for(let i=0;i<=22;i++){const p=pr(c,ballAt(lerp(a,b,i/22)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(8,kAt(c,ballAt(Math.min(tau,TG)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p,cov);s.fill(ink,p,cov*.95);s.stroke(K,p,Math.max(2,w*.12),.85*cov);
}
/** a dashed yellow level line across the pack at his head height (the "highest point") */
function levelLine(s:Sheet,c:Cam,tau:number,g:number,z0=-2.4,z1=2.8){
 if(g<=.02)return;const st=stateOf(VVD,tau),sk=solve(st.pose,B_VVD,st.place),hy=sk.head[1]+.14,l=pr(c,[HP[0]-.3,hy,HP[1]+z0*g]),rr=pr(c,[HP[0]-.3,hy,HP[1]+z1*g]);
 if(l&&rr){const gaps:[number,number][]=[];for(let i=0;i<9;i++)gaps.push([(i+.66)/9,(i+.96)/9]);const p=ribbon([l,rr],Math.max(6,kAt(c,sk.head)*.05),{taper:0,wobble:.5,gaps});s.knockout(p,.9*g);s.fill(Y,p,.95*g);}
}

// ---------------------------------------------------------------- 1 · live: the high Main Stand camera, real time
/** τ from chapter time: real time (×≈1), anchored so the corner is struck on "swings in" and his forehead meets it on "Van Dijk rises" */
function tau1(t:number){const tX=Math.min(CUE(0,'swings in')+.35,CUE(0,'Van Dijk rises')-1),tH=CUE(0,'Van Dijk rises')+.45,k=clamp(TF/Math.max(.5,tH-tX),.8,1.15);return Math.max(T0+.5,(t-tX)*k);}
const P1:V3=[-24,22,-64];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-10,0,-2],fov:20})],
  [CUE(0,'first game')-.2,1.1,()=>({P:P1,T:mix3(at(VVD,tau,1.1),[-10,1,0],.3),fov:8})],
  [CUE(0,'in red')-.2,1,()=>({P:P1,T:[-8.5,1,0],fov:14})],
  [CUE(0,'One-all')-.1,1.2,()=>({P:P1,T:mix3(at(VVD,tau,1),[-7,1,0],.5),fov:15})],
  [CUE(0,'Oxlade-Chamberlain')-.5,.8,()=>({P:P1,T:mix3(at(OX,tau,.9),P0,.35),fov:4.8})],
  [CUE(0,'swings in')+.35,1.1,()=>({P:P1,T:mix3(add3(gnd(b),[0,1.4+.3*b[1],0]),HP3,.25+.5*sm(0,TF,tau)),fov:lerp(10,15,sm(-.1,.8,tau))})],
  [CUE(0,'Van Dijk rises')-.45,.8,()=>({P:P1,T:[HP[0]+1.2,1.9,HP[1]+.4],fov:7.5})],
  [CUE(0,'Goal')-.2,1.5,()=>{const w=at(VVD,tau,1.2);return{P:P1,T:mix3(w,[-1,1.2,-2],.4),fov:12};}],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tG=CUE(0,'Goal'),tN=CUE(0,'Van Dijk rises')+.6,tR=CUE(0,'in red'),tB=CUE(0,'in blue'),tO=CUE(0,'One-all'),tM=CUE(0,'eighty-four'),tF=CUE(0,'first game'),tA=CUE(0,'Anfield');
  stadium(s,c,t,[0,1,3],{roar:Math.max(.12*sm(tA,tA+.6,t),sm(tN,tN+.5,t)),flash:sm(tG-.2,tG+.3,t)*(1-sm(tG+2,tG+2.8,t))});
  ground(s,c);
  // "first game": a red ring round the debutant; "in red" / "in blue": team rings
  groundRing(s,c,at(VVD,tau,0),1.1,R,sm(tF-.1,tF+.3,t)*(1-sm(tR-.2,tR+.2,t)));
  teamRings(s,c,tau,'lfc',sm(tR,tR+.3,tt,easeOutBack)*(1-sm(tB,tB+.4,tt)));
  teamRings(s,c,tau,'efc',sm(tB,tB+.3,tt,easeOutBack)*(1-sm(tO,tO+.4,tt)));
  play(s,c,tau,tp,{min:18,lines:true,prevBall:tau1(t-.06),cap:t>SECS(0)-.7});
  // "One-all, eighty-four minutes": the TV score bug slides in (and turns to 2-1 on the goal)
  scoreBug(s,sm(tO-.1,tO+.3,t,easeOut)*(1-sm(SECS(0)-.9,SECS(0)-.5,t)),tau>TG+.1,sm(tM-.05,tM+.3,t,easeOutBack));
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'Van Dijk rises')+.6;},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay, low from the far side of the box
const tau2=(t:number)=>key(t,mono([[0,-1.3],[CUE(1,'Jordan Pickford'),-.1],[CUE(1,'rushes off'),.3],[CUE(1,'catch it'),TF-.62],[CUE(1,'Van Dijk times'),TJ-.12],[CUE(1,'gets there first'),TF-.06],[SECS(1)-.2,TF+.4]]),linear);
const E2:V3=[-10.5,1.9,19];
function cam2(t:number):Cam{
 const tau=tau2(t),g=at(GK,tau,1.3),v=at(VVD,tau,1.4);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-7,1.2,-1],fov:24})],
  [CUE(1,'Jordan Pickford')-.3,1,()=>({P:E2,T:mix3(g,[-4,1.2,-1.4],.3),fov:15})],
  [CUE(1,'rushes off')-.1,1.2,()=>({P:add3(E2,[.5,0,-.6]),T:mix3(g,v,.35),fov:17})],
  [CUE(1,'Van Dijk times')-.4,1,()=>({P:add3(E2,[.8,.2,-1]),T:mix3(v,[HP[0]+.6,2.1,HP[1]-.4],.4),fov:13})],
  [CUE(1,'gets there')-.2,.8,()=>({P:add3(E2,[.8,.3,-1.2]),T:[HP[0]+.8,2.4,HP[1]-.5],fov:10.5})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12),tP=CUE(1,'Jordan Pickford'),tR=CUE(1,'rushes off'),tC=CUE(1,'catch it'),tT=CUE(1,'Van Dijk times'),tF=CUE(1,'gets there first');
  stadium(s,c,t,[1,2,3],{roar:.25});
  ground(s,c);
  trail(s,c,tau,1-sm(TF+.1,TF+.4,tau));
  // "Van Dijk times his jump": a yellow ring on his take-off spot
  groundRing(s,c,[HP[0]-.3,0,HP[1]+.1],.8,Y,sm(tT-.1,tT+.3,t)*(1-sm(SECS(1)-.8,SECS(1)-.4,t)));
  const r=play(s,c,tau,tp,{smear:true,min:10,cap:t>SECS(1)-.7});
  // "Jordan Pickford": a ring round the keeper; "rushes off his line": speed lines trail him
  {const st=stateOf(GK,tau),sk=solve(st.pose,B_PICK,st.place),q=pr(c,sk.chest);if(q)screenRing(s,q,kAt(c,sk.chest)*.75*easeOutBack(sm(tP-.1,tP+.3,t)),sm(tP-.1,tP+.3,t)*(1-sm(tC+.2,tC+.6,t)),Y,11);}
  const rs=sm(tR,tR+.3,t)*(1-sm(tT,tT+.4,t));if(rs>0){const a=pr(c,at(GK,tau-.14,1.1)),b=pr(c,at(GK,tau,1.1));if(a&&b&&Math.hypot(b[0]-a[0],b[1]-a[1])>1)speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:13,len:170,spread:kAt(c,at(GK,tau))*.5,width:6,cov:.85*rs});}
  // "catch it": his gloves glow as they reach up
  const cg=sm(tC-.1,tC+.3,t)*(1-sm(tF+.1,tF+.5,t));if(cg>0){const st=stateOf(GK,tau),sk=solve(st.pose,B_PICK,st.place);for(const h of[sk.lHa,sk.rHa]){const q=pr(c,h);if(q)screenRing(s,q,Math.max(10,kAt(c,h)*.14),cg,R,17);}}
  // "gets there first": a spark on his forehead at contact
  const hit=(tau-TF)/.25;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(60,r.ball.r*5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
  // "Watch again, slowly": the replay badge
  const tWa=CUE(1,'Watch again'),tSl=CUE(1,'slowly');replayBadge(s,sm(tWa-.1,tWa+.3,t,easeOut)*(1-sm(tP+.6,tP+1,t)),sm(tSl-.05,tSl+.4,t));
 },
 aperture(t){const c=cam2(t),p=stateOf(VVD,tau2(twos(t))),sk=solve(p.pose,B_VVD,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(1,'gets there first')+.2;},
};

// ---------------------------------------------------------------- 3 · a second replay: high behind the goal — the highest point, into the net, then round to the Kop
const tau3=(t:number)=>key(t,mono([[0,TJ-.3],[CUE(2,'meets the ball'),TF-.2],[CUE(2,'highest point'),TF],[CUE(2,'before Pickford'),TF+.12],[CUE(2,'Into the net'),TG-.05],[CUE(2,'the Kop'),TG+1.4],[SECS(2),TG+3.4]]),linear);
const E3:V3=[15,7.2,-6];
function cam3v(t:number):Cam{
 const tau=tau3(t),v=at(VVD,tau,1.6);
 return plan(t,[
  [0,0,()=>({P:E3,T:[HP[0],1.8,HP[1]],fov:22})],
  [CUE(2,'meets the ball')-.3,.9,()=>({P:E3,T:[HP[0],2.3,HP[1]],fov:15})],
  [CUE(2,'before Pickford')-.1,.9,()=>({P:E3,T:[-3.5,1.4,-.6],fov:26})],
  [CUE(2,'the Kop')-.6,1.8,()=>({P:[-12,2.4,-5],T:mix3(v,[10,5,-12],.3),fov:32})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tM=CUE(2,'meets the ball'),tH=CUE(2,'highest point'),tP=CUE(2,'before Pickford'),tI=CUE(2,'Into the net'),tK=CUE(2,'the Kop');
  const kop=sm(tK-.4,tK+.2,t)>0;
  stadium(s,c,t,kop?[0,1,2,3]:[0,2,3],{roar:sm(TG,TG+.4,tau),flash:Math.max(sm(TG+.05,TG+.3,tau)*(1-sm(TG+1,TG+1.6,tau)),sm(tK-.1,tK+.4,t))});
  ground(s,c);
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06),cap:t>SECS(2)-.7});
  // "meets the ball at its highest point": a ring on the ball, a level line at his head height across the pack
  const hp=sm(tM-.15,tM+.2,t)*(1-sm(tP+.2,tP+.6,t));if(hp>0&&r.ball)screenRing(s,r.ball.g,r.ball.r*2,hp,Y,8);
  levelLine(s,c,tau,sm(tH-.1,tH+.3,t,easeOut)*(1-sm(tI-.3,tI+.1,t)));
  // "before Pickford can": a red ring round the keeper's gloves, still short of the ball
  const pg=sm(tP-.1,tP+.25,t)*(1-sm(tI+.3,tI+.8,t));if(pg>0){const st=stateOf(GK,tau),sk=solve(st.pose,B_PICK,st.place),q=pr(c,mix3(sk.lHa,sk.rHa,.5));if(q)screenRing(s,q,Math.max(14,kAt(c,sk.lHa)*.3)*easeOutBack(clamp(pg)),pg,R,19);}
  // the touch: a spark on his forehead at contact; "Into the net": the header's path printed over the net
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
  const hf=sm(TF-.05,TF+.05,tau)*(1-sm(TG+.6,TG+1.1,tau));if(hf>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=pr(c,ballAt(lerp(TF,Math.min(tau,TG),i/16)));if(p)pts.push(p);}
   if(pts.length>2){const w=Math.max(6,kAt(c,HEAD_PT)*.12);s.stroke(K,ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),3,.8*hf);s.knockout(ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),hf);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.95*hf);}}
  // "From behind the goal": the replay badge again (a second angle), gone before the contact
  const tB=CUE(2,'From behind');replayBadge(s,sm(tB-.1,tB+.3,t,easeOut)*(1-sm(tM+.2,tM+.6,t)),1);
 },
 aperture(t){const c=cam3v(t),p=stateOf(VVD,tau3(twos(t))),sk=solve(p.pose,B_VVD,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'highest point')+.1;},
};

// ---------------------------------------------------------------- 4 · the lesson: a close, very slow replay with teaching marks
const tau4=(t:number)=>key(t,mono([[0,TJ-1.1],[CUE(3,"Don't jump"),TJ-.75],[CUE(3,'too early'),TJ-.3],[CUE(3,'Time your jump'),TJ-.05],[CUE(3,'meet the ball'),TF-.25],[CUE(3,'highest point'),TF],[SECS(3),TF+.35]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),v=at(VVD,tau,1.4);
 return plan(t,[
  [0,0,()=>({P:[-16,2.3,4.5],T:mix3(v,[GHOST_P[0],1.2,GHOST_P[1]],.5),fov:30})],
  [CUE(3,'Time your jump')-.3,1,()=>({P:[-15,2.1,5.2],T:[HP[0],1.4,HP[1]-.2],fov:26})],
  [CUE(3,'meet the ball')-.3,.9,()=>({P:[-14.4,2.3,5.6],T:[HP[0]+.2,2.2,HP[1]-.4],fov:22})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tD=CUE(3,"Don't jump"),tE=CUE(3,'too early'),tT=CUE(3,'Time your jump'),tM=CUE(3,'meet the ball'),tH=CUE(3,'highest point'),E=SECS(3);
  stadium(s,c,t,[0,1,2],{roar:.3+.5*sm(tH+.4,tH+1,t)});
  ground(s,c);
  // the corner's arc dotted in, arriving where he will meet it (from "Don't jump" on)
  const ab=sm(tD-.2,tD+.3,t)*(1-sm(E-.6,E-.2,t));
  if(ab>0){const pts:Pt[]=[];for(let i=0;i<=24;i++){const p=pr(c,flyA(P0,V_CROSS,SWING,lerp(TF*.55,TF,i/24)));if(p)pts.push(p);}
   if(pts.length>2){const gaps:[number,number][]=[];for(let i=0;i<10;i++)gaps.push([(i+.62)/10,(i+.98)/10]);const d=ribbon(partial(pts,sm(tD,tD+1.1,t)),Math.max(7,kAt(c,HEAD_PT)*.06),{seed:21,taper:.2,wobble:.6,gaps});s.knockout(d,.8*ab);s.fill(Y,d,.95*ab);}}
  const gh=sm(tD-.3,tD+.2,t)*(1-sm(tT+.8,tT+1.4,t));
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[VVD,GK,5,10],ghost:gh>.05});
  // "too early": a red ring on the ghost's head as he drops back down, under the ball
  if(gh>.05){const st=ghostState(tau),sk=solve(st.pose,B_VVD,st.place),q=pr(c,sk.head);const e=sm(tE-.1,tE+.3,t)*gh;if(q&&e>0){screenRing(s,q,kAt(c,sk.head)*.28,e,R,31);const x=new Path2D(),rr=kAt(c,sk.head)*.16;x.addPath(ribbon([[q[0]-rr,q[1]-rr],[q[0]+rr,q[1]+rr]],6,{taper:0,wobble:.4}));x.addPath(ribbon([[q[0]+rr,q[1]-rr],[q[0]-rr,q[1]+rr]],6,{taper:0,wobble:.4}));s.knockout(x,e);s.fill(R,x,.95*e);}}
  // "Time your jump": a spark under his take-off
  const jp=sm(tT-.1,tT+.3,t)*(1-sm(tM+.2,tM+.6,t));if(jp>0){const q=pr(c,[HP[0]-.3,.05,HP[1]+.1]);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(70,kAt(c,[HP[0],0,HP[1]])*.7)*jp,{n:9,seed:41,g:easeOutBack(jp),width:12});}
  // "meet the ball at its highest point": the level line at his head height and a ring on the ball at the top of his leap
  levelLine(s,c,tau,sm(tM-.1,tM+.35,t,easeOut),-1.6,2.2);
  const hp=sm(tH-.2,tH+.2,t);if(hp>0&&r.ball&&tau<TF+.05)screenRing(s,r.ball.g,r.ball.r*1.9,hp,Y,8);
  // his forehead glows at contact and the header's arrow drives toward the net
  const hd=sm(tH-.05,tH+.3,t);
  if(hd>0){const st=stateOf(VVD,tau),sk=solve(st.pose,B_VVD,st.place),h=sk.head,fc=sk.face,fp=add3(h,mul3(sub3(fc,h),1.05)),q=pr(c,add3(fp,[0,.05,0]));
   if(q){const rr=kAt(c,fp)*.07*clamp(hd,0,1.2),glow=polyPath(blob(q[0],q[1],rr,rr*.8,11,{amp:.06,n:16}),true);s.knockout(glow,.8);s.fill(Y,glow,.9);}
   const arr=sm(tH+.2,E-.3,t,easeInOutSine);if(arr>0){const pts:V3[]=[];for(let i=0;i<=8;i++)pts.push(flyA(HEAD_PT,V_HEAD,G3,(TG-TF)*arr*i/8));arrow3(s,c,pts,Math.max(9,kAt(c,HEAD_PT)*.05),Y,.95);}}
 },
 get still(){return CUE(3,'highest point')+.3;},
};

const film:RisoStory={
 id:'van-dijk-signature',format:'11v11',title:"Van Dijk's debut header",
 theme:'Win the header: time your jump and meet the ball at its highest point',
 ageNote:'Liverpool 2–1 Everton, FA Cup third round, Anfield, 5 January 2018. On his Liverpool debut, Van Dijk headed Oxlade-Chamberlain\'s corner in the 84th minute. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little header — a ball drops in on an arc, a yellow spark where it is met at the top, and it is driven away. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.35),out=clamp((age-.35)/.4),fade=1-clamp((age-.6)/.2);
  const bx=age<.35?x-170*(1-u):x+220*easeOut(out),by=age<.35?y-130*(1-u)*(1-u)-10:y+60*out;
  if(age>.3&&age<.65)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.3)/.12))*(1-clamp((age-.5)/.15)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; Everton's goal line x = 0, +z = Liverpool's right) — checked by tests/play-film-van-dijk-signature.cjs. */
export const FACTS={P0,HEAD_PT,HP,GOAL_PT,TF,TG,TJ,ballAt,cornerFoot:'r' as const,
 oxContact:()=>{const st=stateOf(OX,0),sk=solve(st.pose,B_OX,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 vvdAt:(tau:number)=>{const st=stateOf(VVD,tau),sk=solve(st.pose,B_VVD,st.place);return{head:sk.head,face:sk.face,air:st.pose.air,pelvis:sk.pelvis};},
 pickfordAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_PICK,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis};},
 jagielkaAt:(tau:number)=>{const st=stateOf(JAG,tau),sk=solve(st.pose,B_JAG,st.place);return{head:sk.head};},
 ghostAt:(tau:number)=>{const st=ghostState(tau),sk=solve(st.pose,B_VVD,st.place);return{head:sk.head,air:st.pose.air};}};
