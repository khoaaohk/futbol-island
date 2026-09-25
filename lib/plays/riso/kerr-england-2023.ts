/** Sam Kerr's long-range equaliser — Australia 1–3 England, 2023 FIFA Women's World Cup semi-final, Stadium Australia, Sydney,
 * Wednesday 16 August 2023 (63rd minute, 1–1). An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (CardFilmPlayer) or StoryFilmPlayer. A 1:1 reconstruction of the goal from WRITTEN accounts (the footage itself was not reviewed),
 * rendered as a riso print.
 *
 * SOURCES (read Sept 2026; page text fetched with curl, cached in the film scratchpad src-cache/):
 *  - Wikipedia, "2023 FIFA Women's World Cup knockout stage" (Australia vs England: date, 20:00 kick-off, score, scorers and minutes,
 *    Stadium Australia, 75,784, line-ups with shirt numbers, the kit templates worn that night)
 *    https://en.wikipedia.org/wiki/2023_FIFA_Women%27s_World_Cup_knockout_stage
 *  - Wikipedia, "Sam Kerr" (her first start and first goal of the tournament after a calf injury; Puskás Award nomination)
 *  - The Guardian, "England beat Australia to reach Women's World Cup final" match report, 16 Aug 2023
 *    https://www.theguardian.com/football/2023/aug/16/england-australia-world-cup-semi-final-match-report
 *  - The Guardian live blog, 16 Aug 2023 ("GOAL! Australia 1-1 England (Kerr, 63)": "WALLOP! Sam Kerr smashes Australia level from long
 *    range!"; Reuters caption "The Matildas captain scores a cracker from outside the box")
 *  - Associated Press via Sportsnet, "Sam Kerr finally scores, but Australia still misses out on Women's World Cup final", 16 Aug 2023
 *  - Sports Illustrated, "Australia's Sam Kerr Scores Wonder Goal in Women's World Cup Semifinal vs. England", 16 Aug 2023
 *  - USA Today, "Sam Kerr's goal for Australia equalizes World Cup semifinal before loss to England", 16 Aug 2023
 * CONFIRMED by those accounts: Wednesday 16 August 2023, 20:00 local, Stadium Australia, Sydney, 75,784; England led through Ella Toone
 * (36'); Kerr (No. 20, captain) made her first start of the tournament and equalised in the 63rd minute; "Kerr picked up the ball just
 * inside the Australia half and sprinted across the field. She split two England defenders, including Millie Bright ... and fired off a
 * long-range strike over goalkeeper Mary Earps" (AP); "she received the ball in her half before advancing towards her retreating
 * clubmates Bright and Carter, and lashing past Earps from the edge of the box via a small deflection off Bright" (Guardian); "Taking on two
 * defenders during a counterattack, Kerr rocketed a knuckling shot from beyond the 18-yard box" (SI); Hemp (71') and Russo (86') won it
 * 3–1 for England. Numbers: Kerr 20, Fowler 11, Foord 9, Hunt 15; England: Earps 1, Bright 6, Carter 16, Greenwood 5, Walsh 4, Stanway 8,
 * Bronze 2. KITS (Wikipedia kit templates for this match): Australia gold-yellow shirts, dark green shorts, white socks; England their
 * light-blue change kit (light-blue shirts and shorts, navy socks).
 * INFERRED (illustrative): every exact position, run and timing in metres and seconds (the pass that found her ≈3 m inside her own half,
 * shown as a ground ball from Clare Hunt; the diagonal run ≈37 m; the split at ≈27 m; the strike ≈21 m out, just left of centre); the
 * SHOOTING FOOT (her right, the likelier; not narrated); where the shot went in (high, just left of Earps as she faces the play; not
 * narrated) and its flight time; how Bright's small deflection happened (a late stretching block); Earps still moving back as the shot was
 * struck (the lesson; the sources say only that it went over/past her); Earps' goalkeeper kit colour (red here); the other players shown
 * and their runs; the side of the pitch the play is filmed from; Kerr's celebration run; hair (dark, tied back — from memory of
 * photographs, not a text source); Australia's dark green shorts are printed in navy (a four-ink riso sheet has no green plate); the
 * crowd's colours; the roof lights; the camera positions.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME, panning with the ball: the pass into her own
 * half → the turn → the long diagonal run → the split between Bright and Carter → the strike → the net → the celebration; ch2 = slow-motion
 * replay from a LOW tracking touchline camera ahead of her: she drives straight at the defenders, they back away (red arrows on the grass),
 * she keeps going between them (a yellow trail marks the run); ch3 = the second replay angle from BEHIND THE GOAL, through the net: she
 * shoots early while Earps is still moving (a ring and arrow at the keeper's feet), the shot clips Bright and flies over Earps, then live
 * again for "One-all!"; ch4 = the lesson: drive at defenders to push them back → shoot early while the keeper is moving → lock the ankle and
 * strike through the ball. Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), framing from the
 * 1.45:1 card window down to square (a narrower window widens the lens a little). Figures: every body goes through ONE adapter,
 * drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary motion so the ponytails swing, motionSmear on the sprint
 * and the strike); women's builds (1.62–1.80 m, slimmer bulk) with ponytails; small wide-shot figures and every figure inside a passage print
 * at `low` detail. Handedness: the world is right-handed (x toward the goal England defend, y up, +z = the attackers' right, the main-stand
 * side), athlete.ts's own convention, so Kerr's RIGHT foot is the right foot. Night under floodlights. Inks: yellow, red, blue, navy.
 * Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,backpedal,lunge,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. LEAD: once scripts/plays/kokoro-narrate.py
 * has written public/plays/narration/kerr-england-2023/timing.json, add
 *   import timingJson from '../../../public/plays/narration/kerr-england-2023/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The wonder goal, live',text:'Sydney, the 2023 World Cup semi-final. England lead one-nil. Sam Kerr gets the ball in her own half, and runs! She splits two defenders... and shoots from outside the box. Goal!',tail:2.2,
  cues:['Sydney','England lead','Sam Kerr','own half','runs','splits','shoots','Goal']},
 {label:'Drive at them',text:'Watch it again. Kerr drives straight at the defenders. They back away, so she keeps going, right between them.',tail:1.2,
  cues:['Watch it again','drives straight','back away','keeps going','right between']},
 {label:'Before the keeper is set',text:'Then she shoots early, before Mary Earps is set. It flies over her... One-all!',tail:1.8,
  cues:['shoots early','before Mary Earps','flies over','One-all']},
 {label:'The secret',text:'The secret? Drive at defenders to push them back. Shoot early, while the keeper is still moving. Lock your ankle and strike through the ball.',tail:1.6,
  cues:['The secret','Drive at defenders','push them back','Shoot early','still moving','Lock your ankle','strike through']},
];
import timingJson from '../../../public/plays/narration/kerr-england-2023/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('kerr: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('kerr: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const DEG=Math.PI/180;
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the goal line England defend is x = 0 (Australia attack +x), goal centre z = 0, +z = the attackers' right (the main-stand side). */
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
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- Stadium Australia at night: a huge steep bowl of seats under a roof, floodlights on the lip
/** stand planes (a along, b up the rake 0..1): 0 the far side (z<0), 1 behind the goal, 2 the main stand (z>0, the camera side), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-118,14,a),1.3+30*b,-42-34*b],
 (a,b)=>[8+30*b,1.3+27*b,lerp(-58,58,a)],
 (a,b)=>[lerp(14,-118,a),1.3+26*b,42+30*b],
 (a,b)=>[-113-30*b,1.3+27*b,lerp(58,-58,a)],
];
const STAND_COLS=[104,72,104,72],STAND_ROWS=16,WALKS=[[.4,.72],[.45],[.45],[.45]];
/** banners on the stand fronts: [stand, a, kind 0 = Matildas gold-and-green, 1 = St George] (Australia fans in the vast majority) */
const FLAGS:[number,number,number][]=[[0,.42,0],[0,.55,0],[0,.68,1],[0,.8,0],[1,.2,0],[1,.4,0],[1,.62,1],[1,.82,0],[2,.12,0],[2,.3,0],[3,.28,1],[3,.6,0]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a winter night in Sydney: a deep navy print over the paper, a faint blue glow over the bowl
 s.field(K,.86,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(B,polyPath([[-1e4,hz[1]-700],[1e4,hz[1]-700],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.3);
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);for(const b of WALKS[i])seg3(c,S(0,b),S(1,b),.6,walk);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.86),[0,9.5,0]),add3(S(0,.86),[0,9.5,0])]));
  seg3(c,add3(S(0,.86),[0,9.3,0]),add3(S(1,.86),[0,9.3,0]),.45,edge);}
 s.knockout(planes);s.tone(B,planes,.5);s.tone(K,planes,.3);s.knockout(walk,.5);
 // the crowd: Australia gold (most), green (gold under blue), white; England fans in white and red; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(WALKS[si].some(w=>Math.abs(b-w)<.04))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.24)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.66?0:h<.82?1:h<.93?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.8);s.fill(Y,inks[0],.95);s.knockout(inks[1],.8);s.fill(Y,inks[1],.9);s.tone(B,inks[1],.85);s.knockout(inks[2],.75);s.fill(R,inks[3],.95);
 s.knockout(roof);s.fill(K,roof,.95);s.knockout(edge,.7);
 // banners: Matildas gold with a green band; St George (paper, red cross)
 const gold=new Path2D(),band=new Path2D(),fl=new Path2D(),cr=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.07),P(0,.07)]);if(q.length<3)continue;
  if(kind===0){gold.addPath(polyPath(q,true));addPoly(band,polyP(c,[P(0,.028),P(1,.028),P(1,.047),P(0,.047)]));}
  else{fl.addPath(polyPath(q,true));addPoly(cr,polyP(c,[P(.43,.005),P(.57,.005),P(.57,.07),P(.43,.07)]));addPoly(cr,polyP(c,[P(0,.032),P(1,.032),P(1,.043),P(0,.043)]));}}
 s.knockout(gold);s.fill(Y,gold,.95);s.tone(B,band,.9);s.knockout(fl);s.fill(R,cr,.95);
 // floodlights along the roof lip with yellow haloes
 const lamp=new Path2D(),halo=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.025,.86),[0,8.6,0]),b=add3(S(u+.025,.86),[0,8.6,0]),m=mix3(a,b,.5);if(toCam(c,m)[2]<NEAR+2)continue;seg3(c,a,b,1.1,lamp);
  const g=pr(c,m);if(g){const r=clamp(kAt(c,m)*4.5,8,140);halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.62,0,0,TAU);}}}
 s.knockout(halo,.22);s.tone(Y,halo,.4);s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.6);}
}
// ---------------------------------------------------------------- grass under the floodlights, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const g=polyP(c,[[-116,0,-45],[12,0,-45],[12,0,45],[-116,0,45]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.74);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.14);
 // advertising boards: navy with yellow panels
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.3],[5.4,.68,z+3.3],[5.4,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 seg3(c,[-11.1,0,0],[-10.9,0,0],.22,ln);
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out high where the shot went in (z ≈ 1.6) */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=1.6,back=(z:number)=>X+2+bulge*.7*Math.exp(-Math.pow((z-bz)/1.5,2));
 const zs=[z0,-1.8,0,1.6,3,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.knockout(mesh,.8);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]];
/** women's footballers: a lighter frame than the default 1.8 m build, just as athletic */
const W_BUILD=(height:number,bulk=.9)=>({height,bulk,head:.97});
/** Australia: gold shirts, dark green shorts (navy on this four-ink sheet), white socks, green numbers (navy) */
const aus=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,shorts:[K,.9],socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.9],numberInk:[K,.9],hairStyle:'ponytail',build:W_BUILD(1.68),...o});
/** England's light-blue change kit: light-blue shirts and shorts, navy socks, white numbers */
const eng=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.55],shorts:[B,.55],socks:K,boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:'paper',hairStyle:'ponytail',build:W_BUILD(1.68),...o});
const KERR_B=W_BUILD(1.67,.93);
const KERR_ST=aus({number:20,hair:K,build:KERR_B,seed:20});
const BRIGHT_B=W_BUILD(1.78,.97);
const BRIGHT_ST=eng({number:6,hair:[Y,.85],build:BRIGHT_B,seed:6});
const EARPS_ST:AthleteStyle={shirt:[R,.9],shorts:[R,.9],socks:[R,.9],boots:K,skin:SKIN_L,hair:[Y,.9],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:1,numberInk:'paper',build:W_BUILD(1.73,.95),seed:1};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Kerr's strike)
/** the strike spot (≈21 m out, a little left of centre) and where it goes in: high, just under the bar, to Earps' left (inferred) */
const S_BALL:V3=[-20.6,.11,-2.4];
const G_PT:V3=[0,2.2,1.6];
/** Kerr's run-up: the right-footed strike comes from a little to the left of the line of the shot */
const KDIR:[number,number]=(()=>{const a=Math.atan2(G_PT[2]-S_BALL[2],G_PT[0]-S_BALL[0])+.3;return[Math.cos(a),Math.sin(a)];})();
const YAW_K=yawTo(0,0,KDIR[0],KDIR[1]);
const KSD=.85;
/** Kerr's pelvis at contact so her RIGHT boot meets the ball (solved once through the skeleton) */
const PK:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),KERR_B,{x:0,z:0,yaw:YAW_K});const tx=S_BALL[0]-KDIR[0]*.1,tz=S_BALL[2]-KDIR[1]*.1;return[tx-sk.rToe[0],tz-sk.rToe[2]];})();
/** the pass into her half and the first touch */
const T_PASS=-8.3,T_RCV=-7.0;
/** the deflection: the shot clips Bright's stretching boot ≈1.7 m after contact, then flies on over Earps; into the net */
const SHOT_DIR:V3=(()=>{const d:V3=[G_PT[0]-S_BALL[0],0,G_PT[2]-S_BALL[2]],l=Math.hypot(d[0],d[2]);return[d[0]/l,0,d[2]/l];})();
const T_DEF=.07,DEF_PT:V3=[S_BALL[0]+SHOT_DIR[0]*1.75,.42,S_BALL[2]+SHOT_DIR[2]*1.75-.05];
const T_FLY=.74,T_GOAL=T_DEF+T_FLY,NET_HIT:V3=[1.55,1.72,1.9],REST:V3=[1.2,.11,1.6],T_NET=T_GOAL+.1;
function flightAt(u:number):V3{const e=u*(1.06-.06*u);// a knuckling ball: a little wobble side to side, a flat rising arc
 return[lerp(DEF_PT[0],G_PT[0],e),lerp(DEF_PT[1],G_PT[1],e)+.55*Math.sin(Math.PI*e),lerp(DEF_PT[2],G_PT[2],e)+.1*Math.sin(e*11)*Math.sin(Math.PI*e)];}

// ---------------------------------------------------------------- movement: time-keyed paths (C¹ Hermite) with a cumulative-distance table for the stride phase
type Path=[number,number,number][];// [τ, x, z]
function pathAt(p:Path,tau:number):[number,number]{
 const n=p.length;if(tau<=p[0][0])return[p[0][1],p[0][2]];if(tau>=p[n-1][0])return[p[n-1][1],p[n-1][2]];
 let i=0;while(i<n-2&&tau>=p[i+1][0])i++;
 const a=p[i],b=p[i+1],h=b[0]-a[0],u=(tau-a[0])/h,u2=u*u,u3=u2*u;
 const tan=(j:number,k:1|2)=>{if(j<=0||j>=n-1)return 0;return(p[j+1][k]-p[j-1][k])/(p[j+1][0]-p[j-1][0]);};
 const f=(k:1|2)=>(2*u3-3*u2+1)*a[k]+(u3-2*u2+u)*h*tan(i,k)+(-2*u3+3*u2)*b[k]+(u3-u2)*h*tan(i+1,k);
 return[f(1),f(2)];
}
const T_MIN=-12,T_MAX=10,DT=.02;
function distTable(p:Path){const out:number[]=[0];let q=pathAt(p,T_MIN);for(let t=T_MIN+DT;t<=T_MAX+1e-9;t+=DT){const r=pathAt(p,t);out.push(out[out.length-1]+Math.hypot(r[0]-q[0],r[1]-q[1]));q=r;}return out;}
const distAt=(tab:number[],tau:number)=>{const f=(clamp(tau,T_MIN,T_MAX)-T_MIN)/DT,i=Math.min(tab.length-2,Math.floor(f));return lerp(tab[i],tab[i+1],f-i);};
const speedAt=(p:Path,tau:number)=>{const a=pathAt(p,tau-.06),b=pathAt(p,tau+.06);return Math.hypot(b[0]-a[0],b[1]-a[1])/.12;};
/** metres per full run cycle (two strides) */
const CYCLE_M=3.9;

// ---------------------------------------------------------------- Kerr: comes short, the turn, the long diagonal drive, the split, the strike, the celebration
const KERR_PATH:Path=[[-12,-49.5,11.6],[-9,-52.4,10.9],[-7.7,-54.6,10.5],[T_RCV,-55.5,10.3],[-6.2,-52.6,9.8],[-5.4,-46.4,7.8],[-4,-38.4,4.9],[-2.6,-31.6,2.2],[-1.5,-26.8,.3],
 [-.5,PK[0]-KDIR[0]*1.9,PK[1]-KDIR[1]*1.9],[0,PK[0],PK[1]],[.55,PK[0]+KDIR[0]*1.4,PK[1]+KDIR[1]*1.4],
 // the celebration: she wheels away toward the main-stand touchline and the gold crowd
 [1.6,-16.6,1.2],[2.8,-15.4,6.4],[4.2,-14.6,12.4],[5.6,-14.4,17.6],[7.2,-15,20.6]];
const KERR_TAB=distTable(KERR_PATH);
const kerrXZ=(tau:number):V3=>{const p=pathAt(KERR_PATH,tau);return[p[0],0,p[1]];};
/** the dribble: a push ahead with the right foot every ≈.85 s, the right leg reaching at each touch (run phase .92) */
const TOUCHES=[T_RCV,-6.15,-5.3,-4.45,-3.6,-2.75,-1.9,-1.1];
const TRAP=posed({lHipF:10,rHipF:40,rKnee:40,rAnk:20,lKnee:24,lean:18,pitch:3,neckP:34,lShA:40,rShA:30,lElb:40,rElb:40});
const TOUCH=posed({rHipF:36,rKnee:26,rAnk:30,rHipR:14,lHipF:-10,lKnee:30,lean:16,pitch:6,neckP:26,lShA:34,rShA:22,lShF:20,rShF:-24,lElb:70,rElb:70});
const ARMS_OUT=posed({lShA:104,rShA:100,lShF:10,rShF:14,lElb:14,rElb:18,lHand:1,rHand:1,neckP:-28,lean:-6,pitch:-3,lHipF:14,rHipF:-2,lKnee:18,rKnee:22,lHipA:8,rHipA:8});
function touchIndex(tau:number){let k=-1;for(let i=0;i<TOUCHES.length;i++)if(tau>=TOUCHES[i])k=i;return k;}
function kerrPose(tau:number):Pose{
 const sp=speedAt(KERR_PATH,tau);
 if(tau<T_RCV+.1){const ph=distAt(KERR_TAB,tau)/CYCLE_M;let p=blendPose(stand(),runCycle(ph,{speed:clamp((sp-1)/5.5)}),sm(.5,2,sp));
  const w=Math.sin(Math.PI*clamp((tau-T_RCV+.3)/.5));if(w>0)p=blendPose(p,TRAP,w*.85);return p;}
 // the drive: one run cycle per touch interval, the right leg reaching as it meets the ball
 const k=Math.max(0,touchIndex(tau)),t0=TOUCHES[k],t1=k+1<TOUCHES.length?TOUCHES[k+1]:TOUCHES[k]+.85,u=(tau-t0)/(t1-t0);
 let p=runCycle(k+.92+u,{speed:clamp((sp-1)/5),stride:1.08});
 const tw=Math.max(0,1-Math.abs(u)/.13)*(k>0?.7:0)+Math.max(0,1-Math.abs(1-u)/.13)*(k+1<TOUCHES.length?.7:0);if(tw>0)p=blendPose(p,TOUCH,tw);
 // she looks up at the goal before she shoots (the head lifts off the ball)
 p.neckP-=22*DEG*sm(-1.05,-.8,tau)*(1-sm(-.45,-.25,tau));
 // the strike (right foot) and its follow-through
 const us=STRIKE_CONTACT+tau/KSD;
 if(us>.05){const w=sm(.05,.2,us)*(tau<1?1:1-sm(1,1.4,tau));p=blendPose(p,strike(clamp(us,0,1),{foot:'r',power:1}),w);}
 // then the celebration run, arms out
 if(tau>.5){const s=distAt(KERR_TAB,tau);let c=celebrate(s/4.2,{kind:'run'});if(tau>5.2)c=blendPose(c,ARMS_OUT,clamp(1-sp/3)*sm(5.2,6.2,tau));p=blendPose(p,c,sm(.5,1.1,tau));}
 return p;
}
function kerrPlace(tau:number):Place{
 const[x,z]=pathAt(KERR_PATH,tau),sp=speedAt(KERR_PATH,tau),a=pathAt(KERR_PATH,tau+.1),b=ballAt(tau);
 let yaw=lerpAng(yawTo(x,z,b[0],b[2]),yawTo(x,z,a[0],a[1]),sm(1.2,3,sp));
 const w=sm(-.55,-.3,tau)*(1-sm(.5,.9,tau));yaw=lerpAng(yaw,YAW_K,w);
 if(tau>5.2)yaw=lerpAng(yaw,yawTo(x,z,-14,40),clamp(1-sp/2.5)*sm(5.2,6.2,tau));
 return{x,z,yaw};
}

// ---------------------------------------------------------------- the ball
const HUNT_BALL:V3=[-68.1,.11,3.7];
const RCV_BALL:V3=(()=>{const[x,z]=pathAt(KERR_PATH,T_RCV);return[x-.45,.11,z-.12];})();
/** where each push leaves the ball: ahead of her boot along her run */
const PUSH:V3[]=TOUCHES.map((t,i)=>{if(i===0)return RCV_BALL;const[x,z]=pathAt(KERR_PATH,t),a=pathAt(KERR_PATH,t+.12),l=Math.hypot(a[0]-x,a[1]-z)||1;return[x+(a[0]-x)/l*.55,.11,z+(a[1]-z)/l*.55];});
function ballAt(tau:number):V3{
 if(tau<T_PASS)return mix3([-70.2,.11,2.6],HUNT_BALL,clamp((tau+12)/(12+T_PASS)));
 if(tau<T_RCV){const u=(tau-T_PASS)/(T_RCV-T_PASS);return mix3(HUNT_BALL,RCV_BALL,u*(1.3-.3*u));}
 if(tau<0){const k=touchIndex(tau),a=PUSH[k],b=k+1<PUSH.length?PUSH[k+1]:S_BALL,t0=TOUCHES[k],t1=k+1<TOUCHES.length?TOUCHES[k+1]:0,u=(tau-t0)/(t1-t0);return mix3(a,b,u*(1.45-.45*u));}
 if(tau<T_DEF)return mix3(S_BALL,DEF_PT,tau/T_DEF);
 if(tau<T_GOAL)return flightAt((tau-T_DEF)/T_FLY);
 if(tau<T_NET)return mix3(flightAt(1),NET_HIT,easeOut((tau-T_GOAL)/(T_NET-T_GOAL)));
 const u=clamp((tau-T_NET)/.55),h=NET_HIT[1]*(1-u*u)+.11*u*u,b=u>=1?.12*Math.abs(Math.sin((tau-T_NET-.55)*9))*Math.exp(-(tau-T_NET-.55)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?TAU*1.2*(tau+12):TAU*1.2*12+TAU*1.5*Math.min(tau,T_NET)+TAU*1.2*Math.max(0,tau-T_NET);// a knuckler barely spins
const bulgeAt=(tau:number)=>tau<T_NET-.03?0:Math.exp(-(tau-T_NET+.03)*2.4)*(1+.3*Math.sin((tau-T_NET)*14));

// ---------------------------------------------------------------- everyone else
type Role='run'|'def'|'bright'|'keeper'|'passer';
type Actor={name:string;role:Role;st:AthleteStyle;path:Path;phase:number;/** a pass: [contact τ, foot, power] */kick?:[number,'l'|'r',number];aus:boolean;
 /** a defender turns from backing off to chasing at this τ */turn?:number};
/** Bright's block: her stretching right boot reaches the line of the shot as it passes (solved once) */
const YAW_BR=yawTo(0,0,-1,-.15);
const PB:[number,number]=(()=>{const sk=solve(lunge(.6,{side:'r'}),BRIGHT_B,{x:0,z:0,yaw:YAW_BR});return[DEF_PT[0]-sk.rToe[0]-.05,DEF_PT[2]-sk.rToe[2]];})();
const ACTORS:Actor[]=[
 {name:'Hunt',role:'passer',aus:true,st:aus({number:15,build:W_BUILD(1.72,.95),hair:[Y,.9],seed:15}),path:[[-12,-71,1.6],[-9.4,-69,3.1],[T_PASS,HUNT_BALL[0]-.62,HUNT_BALL[2]-.22],[-6,-66.5,4],[0,-58,4.6],[4,-54,5]],phase:.3,kick:[T_PASS,'r',.6]},
 {name:'Bright',role:'bright',aus:false,st:BRIGHT_ST,path:[[-12,-33.5,-1.4],[-8,-32.4,-2],[-5,-30.8,-2.4],[-3,-28.6,-2.7],[-1.6,-25.6,-3.1],[-.6,PB[0]-1.4,PB[1]-.2],[0,PB[0],PB[1]],[1.5,PB[0]+.9,PB[1]+.3],[4,PB[0]+1.4,PB[1]+.6]],phase:.1,turn:-1.6},
 {name:'Carter',role:'def',aus:false,st:eng({number:16,build:W_BUILD(1.71,.95),skin:SKIN_M,seed:16}),path:[[-12,-33.2,5.4],[-8,-32.3,5],[-5,-30.8,4.3],[-3,-28.9,3.6],[-1.5,-26.6,2.8],[0,-22.8,1.9],[1.5,-19.8,1.4],[4,-17.2,1.2]],phase:.6,turn:-1.3},
 {name:'Greenwood',role:'def',aus:false,st:eng({number:5,hair:[Y,.8],build:W_BUILD(1.68),seed:5}),path:[[-12,-34.5,12],[-6,-31.5,10.4],[-2,-26.8,8.2],[1,-21.2,6.2],[4,-18.4,5.2]],phase:.35,turn:-3},
 {name:'Walsh',role:'run',aus:false,st:eng({number:4,build:W_BUILD(1.69,.9),seed:4}),path:[[-12,-47.5,4.4],[-8.4,-51.8,7.2],[-6.8,-53.2,8.2],[-5,-48.2,6.4],[-2.4,-38.6,3.2],[.4,-30.6,.9],[4,-26,.3]],phase:.8},
 {name:'Stanway',role:'run',aus:false,st:eng({number:8,hair:[Y,.8],build:W_BUILD(1.64,.95),seed:8}),path:[[-12,-44,16],[-7,-48,13.5],[-4,-42.5,11.2],[0,-33.5,7.5],[4,-28,6]],phase:.5},
 {name:'Bronze',role:'run',aus:false,st:eng({number:2,skin:SKIN_M,build:W_BUILD(1.71,.95),seed:2}),path:[[-12,-38,-17],[-5,-34.4,-14.6],[0,-27.5,-10.6],[4,-24,-8.4]],phase:.2},
 {name:'Fowler',role:'run',aus:true,st:aus({number:11,skin:SKIN_M,build:W_BUILD(1.66,.9),seed:11}),path:[[-12,-40,-6],[-6.5,-42,-7],[-3,-33.5,-7.2],[0,-23.4,-6.6],[3,-18.6,-5],[5.5,-16.6,-3.4]],phase:.45},
 {name:'Foord',role:'run',aus:true,st:aus({number:9,hair:[Y,.9],build:W_BUILD(1.66,.9),seed:9}),path:[[-12,-42,-20],[-6.5,-43.4,-19.4],[-3,-34,-15.4],[0,-24.2,-11.2],[3,-19.4,-9]],phase:.9},
 {name:'Earps',role:'keeper',aus:false,st:EARPS_ST,path:[[-12,-9.5,.9],[-6,-8.2,.7],[-3,-5.6,.5],[-1.2,-3.4,.35],[0,-2.1,.25],[.5,-1.8,.25],[4,-1.6,.3]],phase:0},
];
const READY=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
const TABS=new Map<Path,number[]>();
function distTableCached(p:Path){let t=TABS.get(p);if(!t){t=distTable(p);TABS.set(p,t);}return t;}
/** one actor's pose + place at τ (it = idle clock). Australia celebrate after the goal; England's heads drop. */
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=pathAt(a.path,tau),sp=speedAt(a.path,tau),ahead=pathAt(a.path,tau+.1),ball=ballAt(tau);
 const toBall=yawTo(x,z,ball[0],ball[2]),heading=yawTo(x,z,ahead[0],ahead[1]);let yaw=lerpAng(toBall,heading,sm(1.2,3,sp));
 const ph=distAt(distTableCached(a.path),tau)/CYCLE_M+a.phase,br=Math.sin(it*2.1+a.phase*TAU);
 let p=blendPose(blendPose(READY,stand(),.35+.15*br),runCycle(ph,{speed:clamp((sp-1)/5.5)}),sm(.5,2,sp));
 if(a.role==='keeper'){
  // Earps is still stepping back as the shot is struck (not set), then a late leap to her left as it flies over her
  let kp=blendPose(keeperSet(it*1.3),backpedal(ph*1.6),sm(.3,1,sp));
  if(tau>.06){const u=clamp((tau-.06)/1.3);kp=blendPose(kp,keeperDive(u*.72,{side:'l',height:.95}),sm(.06,.22,tau)*(1-sm(2.6,3.2,tau)));}
  if(tau>2.6)kp=blendPose(kp,SLUMP,sm(2.6,3.2,tau)*.6);
  return{pose:kp,place:{x,z,yaw:toBall}};
 }
 if(a.role==='def'||a.role==='bright'){
  // backing off: facing the ball, shuffling back; then turning to chase once she is through
  const turn=a.turn??-1.5,chase=sm(turn,turn+.45,tau);
  const back=blendPose(READY,backpedal(ph*1.4),sm(.4,1.2,sp));p=blendPose(back,p,chase);yaw=lerpAng(toBall,yaw,chase);
  if(a.role==='bright'){const us=.6+(tau-T_DEF)/.55;if(us>0&&us<1.05){const w=sm(0,.25,us)*(1-sm(.85,1.05,us));p=blendPose(p,lunge(clamp(us,0,1),{side:'r'}),w);yaw=lerpAng(yaw,YAW_BR,w);}}
 }
 if(a.kick){const[t0,foot,power]=a.kick,us=STRIKE_CONTACT+(tau-t0)/.8;
  if(us>.05&&us<1){const w=sm(.05,.2,us)*(1-sm(.85,1,us));p=blendPose(p,strike(us,{foot,power}),w);yaw=lerpAng(yaw,yawTo(x,z,RCV_BALL[0],RCV_BALL[2]),w);}}
 if(tau>T_NET+.2&&sp<1.4){if(a.aus)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(T_NET+.2,T_NET+.7,tau)*.9);else p=blendPose(p,SLUMP,sm(T_NET+.2,T_NET+.9,tau)*.6);}
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and hems trail), smear = halftone echo + speed lines on fast limbs (the sprint, the strike). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball on screen
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.12,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<T_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,Y,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(280,d*1.5),spread:r*.9,width:Math.max(2.5,r*.18),cov:.85});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';only?:number};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped. `only` skips figures farther than that (m). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;if(e.only&&q[2]>e.only)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(px<(hero?50:120))return{...st,detail:'low'};if(e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 {const pl=kerrPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=kerrPose(tp),prev={pose:kerrPose(tpPrev),place:kerrPlace(tpPrev)};
  drawPlayer(s,pose,c,detailFor(KERR_ST,d,true),pl,prev,!!e.smear&&((tp>-6.4&&tp<.6)||(tp>1&&tp<4.5)));}});}
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);
  drawPlayer(s,cur.pose,c,detailFor(a.st,d,a.role==='bright'||a.role==='keeper'),cur.place,prev,!!e.smear&&(a.role==='bright'||a.role==='keeper')&&tp>-.3&&tp<1);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2]-.3,draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
/** a broadcast pan: the ball's recent path averaged (the operator lags a touch), nudged toward the goal */
function panTarget(tau:number):V3{let x=0,y=0,z=0;for(let i=0;i<5;i++){const p=ballAt(tau-i*.1);x+=p[0];y+=p[1];z+=p[2];}return[x/5+3,Math.min(1.4,y/5)*.6+.6,z/5];}
/** smoothed ground point under Kerr (cameras ride this) */
const kxz=(tau:number):V3=>{let x=0,z=0;for(let i=-2;i<=2;i++){const p=pathAt(KERR_PATH,tau+i*.12);x+=p[0];z+=p[1];}return[x/5,0,z/5];};

/** the run so far, traced on the grass (a riso replay trail under the players) */
function runTrail(s:Sheet,c:Cam,t0:number,t1:number,fade:number,wm=.34){
 if(t1<=t0+.05||fade<=.02)return;const pts:Pt[]=[];for(let i=0;i<=26;i++){const tau=lerp(t0,t1,i/26),p=pathAt(KERR_PATH,tau),q=pr(c,[p[0],.02,p[1]]);if(q)pts.push(q);}
 if(pts.length<3)return;const w=Math.max(9,kAt(c,kerrXZ(t1))*wm);s.knockout(ribbon(pts,w*1.5,{taper:.8,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.8,pressure:.2,wobble:0}),.9*fade);}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1,dashed=false){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const gaps:[number,number][]=[];if(dashed)for(let i=0;i<6;i++)gaps.push([(i+.55)/6,(i+.9)/6]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8,gaps});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a ring on the grass around a ground point (radius in metres), drawn as a projected ellipse */
function groundRing(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number){if(u<=.02)return;const pts:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU,q=pr(c,[P[0]+Math.cos(a)*rm*(.7+.3*u),.02,P[2]+Math.sin(a)*rm*(.7+.3*u)]);if(q)pts.push(q);}if(pts.length<10)return;
 const w=Math.max(5,kAt(c,P)*.07),rr=ribbon(pts,w,{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*u);s.fill(ink,rr,.95*u);}
/** a projected ring on the view plane around a 3D point (radius in metres) */
function ring3(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number){const q=pr(c,P);if(!q||u<=.02)return;const k=kAt(c,P),r=rm*k*(.7+.3*u),pts:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r]);}
 const rr=ribbon(pts,Math.max(5,k*.035),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*u);s.fill(ink,rr,.95*u);}
/** "they back away": red arrows on the grass behind the two centre-backs, pointing toward their own goal */
function backArrows(s:Sheet,c:Cam,tau:number,u:number){if(u<=.02)return;
 for(const n of['Bright','Carter']){const a=ACTORS.find(q=>q.name===n)!;const[x,z]=pathAt(a.path,Math.min(tau,-1.7));const P0:V3=[x+.5,.03,z],P1:V3=[x+.5+3.2*u,.03,z];arrow3(s,c,[P0,mix3(P0,P1,.5),P1],Math.max(7,kAt(c,P0)*.2),R,.95);}}
/** Earps "still moving": a red ring at her feet and a short arrow the way she is stepping */
function keeperMoving(s:Sheet,c:Cam,tau:number,u:number){if(u<=.02)return;const a=ACTORS.find(q=>q.name==='Earps')!,[x,z]=pathAt(a.path,tau),P:V3=[x,0,z];groundRing(s,c,P,.75,u,R,71);
 const P1:V3=[x+1.4*u,.03,z-.1*u];arrow3(s,c,[[x+.5,.03,z],mix3([x+.5,.03,z],P1,.5),P1],Math.max(6,kAt(c,P)*.14),R,.95);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time, panning with the ball
/** real time; the strike lands just after "shoots" */
const tS1=()=>CUE(0,'shoots')+.25;
const tau1=(t:number)=>t-tS1();
const P1:V3=[-32,21,58];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-56,0,6],fov:24})],
  [CUE(0,'England lead')-.2,1.4,()=>({P:P1,T:panTarget(tau),fov:15})],
  [CUE(0,'Sam Kerr')-.3,1.2,()=>({P:P1,T:panTarget(tau),fov:12})],
  [CUE(0,'splits')-.3,1,()=>({P:P1,T:mix3(panTarget(tau),[-12,1,0],.3),fov:9.5})],
  [tS1()-.3,.8,()=>({P:P1,T:mix3(panTarget(tau),[-6,1.2,0],.55),fov:10.5})],
  [tS1()+T_NET+.5,1.6,()=>({P:P1,T:add3(kxz(tau),[0,1,0]),fov:8})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+T_NET;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t),flash:sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,minBall:12,lines:true,prevT:tau1(t-.06),hero:'mid',smear:true});
 },
 aperture(t){const c=cam1(t),q=pr(c,add3(kxz(tau1(t)),[0,1.1,0]))??[0,0];return apertureDisc(q[0],q[1],80,12);},
 still:9.8,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, low tracking touchline camera ahead of her: she drives at them, they back away
const tau2=(t:number)=>key(t,mono([[0,-5.8],[CUE(1,'drives straight'),-4.7],[CUE(1,'back away'),-3.3],[CUE(1,'keeps going'),-2.5],[CUE(1,'right between'),-1.95],[SECS(1),-1.25]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),k=kxz(tau);
 return plan(t,[
  [0,0,()=>({P:add3(k,[10,1.4,10.5]),T:add3(k,[3.5,1,-1]),fov:28})],
  [CUE(1,'back away')-.3,1.2,()=>({P:add3(k,[9,1.3,9.5]),T:add3(k,[4.2,1,-.8]),fov:24})],
  [CUE(1,'right between')-.4,1,()=>({P:add3(k,[7,1.2,7.5]),T:add3(k,[1.8,1,-.6]),fov:22})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[0,1,3]);
  ground(s,c);
  runTrail(s,c,T_RCV,Math.min(tau,-.5),sm(CUE(1,'drives straight')-.2,CUE(1,'drives straight')+.5,t));
  backArrows(s,c,tau,sm(CUE(1,'back away')-.1,CUE(1,'back away')+.6,t,easeOutBack)*(1-sm(CUE(1,'right between')+.2,CUE(1,'right between')+.7,t)));
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:11,lines:true,prevT:tau2(t-.06),only:70});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*.11/q[2]*1.3),12);},
 still:4.6,
};

// ---------------------------------------------------------------- 3 · second replay from behind the goal, through the net; then live for "One-all!"
const tau3=(t:number)=>{const a=CUE(2,'shoots early'),b=CUE(2,'before Mary'),f=CUE(2,'flies over'),o=CUE(2,'One-all');
 return key(t,mono([[0,-1.5],[a+.1,-.6],[b+.25,-.02],[f+.1,.3],[o-.1,T_NET+.2],[SECS(2),T_NET+.2+(SECS(2)-o+.1)]]),linear);};
const E3:V3=[4.6,1.9,-3.3];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.max(0,Math.min(tau,T_GOAL))),k=add3(kxz(tau),[0,1.1,0]);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3(k,[-4,1,.3],.08),fov:15})],
  [CUE(2,'before Mary')-.2,.8,()=>({P:E3,T:mix3([-10,1.1,-.5],[-2,1.1,.3],.5),fov:28})],
  [CUE(2,'flies over')-.1,.5,()=>({P:E3,T:mix3([-6,1.2,0],b,.5),fov:30})],
  [CUE(2,'One-all')-.2,1.4,()=>({P:add3(E3,[.6,.5,0]),T:k,fov:16})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tO=CUE(2,'One-all'),tB=CUE(2,'before Mary');
  stadium(s,c,t,[3,0,2],{roar:sm(tO-.3,tO+.3,t),flash:sm(tO-.2,tO+.2,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  keeperMoving(s,c,tau,sm(tB-.1,tB+.4,t,easeOutBack)*(1-sm(CUE(2,'flies over'),CUE(2,'flies over')+.5,t)));
  // the shot's path so far: a yellow replay trail, boot → over Earps → net
  if(tau>0&&tau<T_NET+.8){const pts=pathPts(c,0,Math.min(tau,T_GOAL),18),fade=1-sm(T_NET,T_NET+.8,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,T_GOAL)))*.14);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12,lines:true,prevT:tau3(t-.06),only:60});
  // the strike: a spark off her boot; the little clip off Bright's boot
  const hit=sm(-.02,.04,tau)*(1-sm(.1,.28,tau));if(hit>0){const q=pr(c,S_BALL);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(50,kAt(c,S_BALL)*.6)*hit,{n:9,seed:20,width:Math.max(5,kAt(c,S_BALL)*.05)});}
  const clip=sm(T_DEF-.02,T_DEF+.03,tau)*(1-sm(T_DEF+.08,T_DEF+.24,tau));if(clip>0){const q=pr(c,DEF_PT);if(q)sparkBurst(s,R,q[0],q[1],Math.max(30,kAt(c,DEF_PT)*.35)*clip,{n:6,seed:6,width:Math.max(4,kAt(c,DEF_PT)*.04)});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,add3(kxz(tau3(t)),[0,1.2,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:1.9,
};

// ---------------------------------------------------------------- 4 · the lesson: drive at them → they back off → shoot early while the keeper moves → lock the ankle, strike through
const tau4=(t:number)=>{const d=CUE(3,'Drive at'),p=CUE(3,'push them'),e=CUE(3,'Shoot early'),m=CUE(3,'still moving'),l=CUE(3,'Lock your'),s=CUE(3,'strike through');
 return key(t,mono([[0,-5],[d,-4.5],[p+.3,-2.2],[e,-1.25],[m+.2,-.5],[l,-.2],[s+.1,.03],[SECS(3),.4]]),linear);};
function cam4v(t:number):Cam{
 const tau=tau4(t),k=kxz(tau);
 return plan(t,[
  [0,0,()=>({P:add3(k,[-9,4.6,5]),T:add3(k,[7,.4,-1]),fov:36})],
  [CUE(3,'push them')-.3,1,()=>({P:add3(k,[-7,4.2,6]),T:add3(k,[6,.6,-1.5]),fov:34})],
  [CUE(3,'Shoot early')-.3,1,()=>({P:[-34,4.4,3.2],T:[-9,.2,-1.2],fov:30})],
  [CUE(3,'Lock your')-.35,.7,()=>({P:add3(S_BALL,[.6,.55,3.3]),T:add3(S_BALL,[-.25,.35,-.1]),fov:34})],
  [CUE(3,'strike through')-.1,.8,()=>({P:add3(S_BALL,[-1.2,.9,3.4]),T:add3(S_BALL,[2.4,.5,.2]),fov:36})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tD=CUE(3,'Drive at'),tP=CUE(3,'push them'),tE=CUE(3,'Shoot early'),tM=CUE(3,'still moving'),tL=CUE(3,'Lock your'),tS=CUE(3,'strike through');
  stadium(s,c,t,[0,1,2,3]);
  ground(s,c,{bulge:bulgeAt(tau)});
  // 1 · drive at defenders: her run traced on the grass; 2 · push them back: red arrows behind the centre-backs
  runTrail(s,c,-5.4,Math.min(tau,-.5),sm(tD-.2,tD+.4,t)*(1-sm(tL-.4,tL,t)),.28);
  backArrows(s,c,tau,sm(tP-.1,tP+.5,t,easeOutBack)*(1-sm(tE-.2,tE+.3,t)));
  // 3 · shoot early, while the keeper is still moving
  keeperMoving(s,c,tau,sm(tM-.2,tM+.3,t,easeOutBack)*(1-sm(tL-.3,tL+.1,t)));
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:13,only:45});
  // 4 · lock your ankle: a yellow ring on the striking boot; strike through the ball: an arrow through it toward goal
  const la=sm(tL-.1,tL+.3,t,easeOutBack)*(1-sm(tS+.6,tS+1.1,t));if(la>.02){const sk=solve(kerrPose(tp),KERR_B,kerrPlace(tp));ring3(s,c,mix3(sk.rAn,sk.rToe,.4),.2,la,Y,31);}
  const st=sm(tS-.05,tS+.5,t,easeOut);if(st>.02){const a0:V3=add3(S_BALL,[-SHOT_DIR[0]*.3,.05,-SHOT_DIR[2]*.3]),a1:V3=add3(S_BALL,[SHOT_DIR[0]*3.4,.9,SHOT_DIR[2]*3.4]);arrow3(s,c,[a0,mix3(a0,a1,.5*st),mix3(a0,a1,st)],Math.max(9,kAt(c,S_BALL)*.08),Y,.95);}
 },
 still:8.2,
};

const film:RisoStory={
 id:'kerr-england-2023',format:'11v11',title:"Kerr's wonder goal v England",
 theme:'Drive at the defence and shoot early: run straight at defenders to push them back, then strike before the keeper is set',
 ageNote:'Australia 1–3 England, 2023 FIFA Women’s World Cup semi-final, Stadium Australia, Sydney, 16 August 2023. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little long shot — a yellow streak rockets from the touch and the ball knuckles away. Reduced motion: the still streak. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.45)),fade=age<=0?1:1-clamp((age-.5)/.3),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=12;i++){const k=i/12*u;pts.push([x+230*k,y-70*k-26*Math.sin(Math.PI*k)+6*Math.sin(k*14)]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,14,{seed,taper:.9,pressure:.3,wobble:1}),.95*fade);
  if(age>0&&age<.3)sparkBurst(s,Y,x,y,70,{n:8,seed,g:1-clamp(age/.3),width:10});
  const e=pts[pts.length-1];footballPanels(s,e[0],e[1],28,{rot:age*6+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
