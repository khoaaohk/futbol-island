/** Carli Lloyd's goal from the halfway line — USA 5–2 Japan, 2015 FIFA Women's World Cup final, BC Place, Vancouver, 5 July 2015 (her third
 * goal, ≈16', 4–0) — an iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx)
 * or StoryFilmPlayer. A 1:1 reconstruction of the goal from WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print.
 * LEAD: once public/plays/narration/lloyd-halfway-2015/timing.json exists, add
 *   import timingJson from '../../../public/plays/narration/lloyd-halfway-2015/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cue words).
 *
 * SOURCES (read Sept 2026 via web-search summaries and article text):
 *  - FIFA, "Lloyd's audacious halfway strike stuns the watching world" https://inside.fifa.com/news/lloyd-s-audacious-halfway-strike-stuns-the-watching-world
 *  - Sports Illustrated, "Four goals, 16 minutes: How the USA stunned Japan in World Cup final" (6 Jul 2015)
 *    https://www.si.com/soccer/2015/07/06/usa-japan-womens-world-cup-final-four-goals-carli-lloyd
 *  - Sports Illustrated, "The story behind the goal and the star: Carli Lloyd's rise to World Cup hero" (13 Jul 2015)
 *    https://www.si.com/soccer/2015/07/13/carli-lloyd-usa-womens-world-cup-final-goal
 *  - These Football Times, "Carli Lloyd and the unforgettable 13-minute World Cup final hat-trick" (26 Nov 2018)
 *  - CNN, "Carli Lloyd: The 13-minute 'out of this world' World Cup final hattrick" (19 Aug 2023)
 *  - Front Row Soccer, "It was years in the making: Lloyd looks back at her iconic goal" (15 Apr 2025)
 *  - CBS Sports, "Carli Lloyd scores absurd goal from midfield in final vs. Japan"; NPR, "U.S. Women Win World Cup Final 5-2"
 *  - Wikipedia, "2015 FIFA Women's World Cup final"; SI / U.S. Soccer, "Nike reveals new all-white home kit" (Apr 2015)
 * CONFIRMED by those accounts: 5 July 2015, BC Place, Vancouver, the final; USA won 5–2; the USA scored four in the first 16 minutes, three
 *  by Lloyd (the fastest World Cup hat-trick, the first in a Women's World Cup final); this goal made it 4–0 in about the 16th minute; Lloyd
 *  (No. 10) intercepted a misplayed Japanese pass in midfield, turned with one touch, took another past Rumi Utsugi, LOOKED UP and struck with
 *  her RIGHT foot "as soon as the ball kissed the halfway line" (≈50 yards / 45–50 m out); keeper Ayumi Kaihori was well off her line
 *  (probably covering a through ball to Alex Morgan); Kaihori backpedalled, slipped, got a slight touch, and the ball went in off the LEFT post;
 *  Lloyd: "Every single game I play I'm always checking to see where the goalkeeper is. She was really off her line." USA wore the 2015
 *  all-white Nike home kit (white shirt and shorts, black accents, neon/volt gradient socks); ≈53,000 in BC Place.
 * RECALLED, NOT RE-VERIFIED: referee Kateryna Monzul (Ukraine); Morgan No. 13, Rapinoe No. 15, Holiday No. 12, Heath No. 17; BC Place's
 *  cable-supported roof and centre-hung video board; the artificial turf.
 * INFERRED (illustrative): Japan in blue shirts, shorts and socks; Kaihori's yellow kit and No. 18; every position and run in metres (the
 *  interception ≈10 m inside the US half, the strike 4 m right of centre, Kaihori ≈11.5 m out); the ball's flight (apex ≈13 m, ≈3.1 s,
 *  no curl), the bounce before the post, where it met the net; who passed the ball and where, the other players shown and their runs;
 *  hair styles (Lloyd's brown ponytail is from photographs we remember, not a text source); the roof closed; the crowd's colours and US flags;
 *  Lloyd's quick scan BEFORE the interception (the lesson; the sources only say she looked up before she shot); her celebration; cameras.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (BC Place wide → push in → Lloyd → Kaihori far
 * off her line, a telestrator gap → the interception, two touches, the look up → the strike from halfway, the halfway line flashes → pan with
 * the lob to the net); ch2 = the slow-motion replay from a LOW pitch-side camera by the Japan box (tele on Lloyd, the ball climbs, Kaihori
 * scrambles back, fingertip, post, net); ch3 = the lesson: close on Lloyd scanning before the ball arrives, a sight line to the keeper, the gap,
 * then a slow side-on strike "through the ball" and the whole arc over the keeper from a raised main-stand-side camera.
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), kept inside the central ~1000 units so it
 * frames from the 1.45:1 card window down to square (a narrower window widens the lens a little). Every body goes through ONE adapter,
 * drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev` secondary motion so ponytails swing, motion
 * smear on the strike). Women footballers: build {height ≈1.63–1.75, bulk ≈.88–.93}, ponytails / long hair. Small figures in wide shots and
 * every figure inside a passage print at `low` detail. Handedness: the world is right-handed (x toward Japan's goal, y up, +z = Lloyd's right,
 * the main-stand side), athlete.ts's own convention, so her RIGHT foot strikes without a mirrored projector.
 * Inks: yellow, red, blue, navy. Poses on twos, cameras on ones, all randomness seeded. Budget ≈150–300 plate ops per frame, passages ≲600. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,settle,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperTip,backpedal,lunge,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'From halfway, live',text:"Vancouver, 2015, the World Cup final. Carli Lloyd has scored twice already, and Japan's keeper is far off her line. Lloyd wins the ball, looks up, and shoots from the halfway line! Up it goes... and in!",tail:1.3,
  cues:['Vancouver','World Cup final','Carli Lloyd','scored twice',"Japan's keeper",'far off her line','Lloyd wins','looks up','shoots','halfway line','Up it goes','and in']},
 {label:'Watch it again',text:'Watch again, slowly. The ball sails over the keeper. She scrambles back and touches it, but it clips the post and goes in. A hat-trick in sixteen minutes!',tail:1.5,
  cues:['Watch again','slowly','sails over','the keeper','scrambles back','touches it','clips the post','goes in','hat-trick','sixteen minutes']},
 {label:'The secret',text:'Here is the secret. Look up before the ball reaches you, and find the keeper. Then be brave, and strike cleanly through the ball.',tail:1.8,
  cues:['the secret','Look up','before the ball','find the keeper','be brave','strike cleanly','through the ball']},
];
import timingJson from '../../../public/plays/narration/lloyd-halfway-2015/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('lloyd: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('lloyd: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy',D2R=Math.PI/180;
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet,dx=0,dy=0){const S=s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D projection through an athlete.ts Camera (right-handed metres, y up)
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
/** a quad only when every corner is comfortably in front of the lens (stands beside / behind the camera would project huge) */
function quadP(c:Cam,path:Path2D,pts:V3[],minD=3){for(const p of pts)if(toCam(c,p)[2]<minD)return;addPoly(path,pts.map(p=>scr(c,toCam(c,p))));}
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- BC Place: an oval two-tier bowl under a white cable-supported roof
/** the bowl is centred on the halfway line (x = −52.5); tier 0 = lower bowl from the pitch, tier 1 = upper bowl above the club-level fascia */
const CX=-52.5;
const TIERS=[{r0:[61,43],r1:[79,59],y0:1.3,y1:14},{r0:[81,61],r1:[98,77],y0:17.5,y1:35}];
const bowl=(k:number,a:number,v:number):V3=>{const T=TIERS[k],th=a*TAU,rx=lerp(T.r0[0],T.r1[0],v),rz=lerp(T.r0[1],T.r1[1],v);return[CX+rx*Math.cos(th),lerp(T.y0,T.y1,v),rz*Math.sin(th)];};
/** roof underside: from the rim (above the upper bowl) rising to the closed centre panel */
const roofPt=(a:number,v:number):V3=>{const th=a*TAU,rx=lerp(101,60,v),rz=lerp(80,42,v);return[CX+rx*Math.cos(th),lerp(40,52,v),rz*Math.sin(th)];};
const SEGS=56,CROWD_COLS=[190,210],CROWD_ROWS=[9,9];
/** US flags held up in the crowd: [tier, a, b] */
const FLAGS:[number,number,number][]=[[0,.61,.4],[0,.66,.7],[0,.71,.3],[0,.78,.55],[0,.84,.35],[1,.64,.3],[1,.74,.5],[1,.86,.25],[0,.02,.5],[0,.95,.6]];
function stadium(s:Sheet,c:Cam,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // the covered interior: a dark mottled navy field (no sky under the roof)
 s.field(K,.5,.55);
 // roof underside: paper fabric in shade, radial cables, a lit ring of lamps, the closed centre panel
 const roof=new Path2D(),cab=new Path2D(),lamps=new Path2D(),panel=new Path2D();
 for(let i=0;i<SEGS;i++){const a0=i/SEGS,a1=(i+1)/SEGS;quadP(c,roof,[roofPt(a0,0),roofPt(a1,0),roofPt(a1,1),roofPt(a0,1)],6);
  if(i%2===0){const p0=roofPt(a0,0),p1=roofPt(a0,1);if(toCam(c,p0)[2]>6&&toCam(c,p1)[2]>6)seg3(c,p0,p1,.35,cab);}
  if(i%4===1){const p=roofPt(a0+.5/SEGS,.97),q=add3(p,[0,-.6,0]);if(toCam(c,p)[2]>6)seg3(c,p,q,1.6,lamps);}}
 {const pts:V3[]=[];for(let i=0;i<32;i++){const th=i/32*TAU;pts.push([CX+60*Math.cos(th),53,42*Math.sin(th)]);}if(pts.every(p=>toCam(c,p)[2]>6))addPoly(panel,pts.map(p=>scr(c,toCam(c,p))));}
 s.knockout(roof);s.tone(B,roof,.22);s.tone(K,roof,.18);s.fill(K,cab,.75);s.knockout(panel);s.tone(Y,panel,.14);s.tone(K,panel,.12);s.knockout(lamps);s.fill(Y,lamps,.9);
 // the seats (BC Place blue) under the crowd, the club-level fascia between the tiers with an LED ribbon
 const seats=new Path2D(),fascia=new Path2D(),led=new Path2D();
 for(let k=0;k<2;k++)for(let i=0;i<SEGS;i++){const a0=i/SEGS,a1=(i+1)/SEGS;quadP(c,seats,[bowl(k,a0,0),bowl(k,a1,0),bowl(k,a1,1),bowl(k,a0,1)]);}
 for(let i=0;i<SEGS;i++){const a0=i/SEGS,a1=(i+1)/SEGS;quadP(c,fascia,[bowl(0,a0,1),bowl(0,a1,1),bowl(1,a1,0),bowl(1,a0,0)]);
  const l0=mix3(bowl(0,a0,1),bowl(1,a0,0),.45),l1=mix3(bowl(0,a1,1),bowl(1,a1,0),.45);if(i%3!==2&&toCam(c,l0)[2]>3&&toCam(c,l1)[2]>3)seg3(c,l0,l1,1.1,led);}
 s.knockout(seats);s.tone(B,seats,.55);s.tone(K,seats,.3);
 // the crowd: seeded dots (USA white, red, blue; Japan blue; a little yellow), sized by distance; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(let k=0;k<2;k++){const cols=CROWD_COLS[k],rows=CROWD_ROWS[k];for(let j=0;j<rows;j++){const b=(j+.5)/rows;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+k*17,5);if(h<.28)continue;const a=(i+.5+(hash(i+j*31,9+k)-.5)*.6)/cols,P=bowl(k,a,b),q=toCam(c,add3(P,[0,.45,0]));if(q[2]<4)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.55/q[2],2.2,16),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.6?0:h<.76?1:h<.9?2:h<.97?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.72);s.fill(R,inks[1],.95);s.fill(B,inks[2],.95);s.fill(K,inks[3],.9);s.fill(Y,inks[4],.95);
 s.knockout(fascia);s.fill(K,fascia,.85);s.knockout(led);s.fill(Y,led,.55);s.tone(R,led,.3);
 // US flags in the crowd: paper, red stripes, a navy canton
 const fl=new Path2D(),st=new Path2D(),can=new Path2D();
 for(const[k,a,b] of FLAGS){const base=bowl(k,a,b),wv=Math.sin(tt*5+a*40)*.3*(.4+roar),th=a*TAU,tx=-Math.sin(th),tz=Math.cos(th);
  const P=(u:number,w:number):V3=>[base[0]+tx*(u-.5)*2.8,base[1]+1.2+w*1.7+wv*u,base[2]+tz*(u-.5)*2.8];
  if(toCam(c,base)[2]<5)continue;const q=polyP(c,[P(0,0),P(1,0),P(1,1),P(0,1)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  for(const w0 of[.08,.37,.66])addPoly(st,polyP(c,[P(0,w0),P(1,w0),P(1,w0+.14),P(0,w0+.14)]));addPoly(can,polyP(c,[P(0,.5),P(.42,.5),P(.42,1),P(0,1)]));}
 s.knockout(fl);s.fill(R,st,.95);s.fill(K,can,.95);
 // the centre-hung video board over the halfway line
 {const box:V3[]=[];for(const dx of[-9,9])for(const dy of[31,39])for(const dz of[-6,6])box.push([CX+dx,dy,dz]);
  if(box.every(p=>toCam(c,p)[2]>6)){const hullPts=convex(box.map(p=>scr(c,toCam(c,p))));const hb=polyPath(hullPts,true);s.knockout(hb);s.fill(K,hb,.92);
   const faces:[V3,V3[]][]=[[[1,0,0],[[CX+9,31.6,-5.4],[CX+9,31.6,5.4],[CX+9,38.4,5.4],[CX+9,38.4,-5.4]]],[[-1,0,0],[[CX-9,31.6,-5.4],[CX-9,31.6,5.4],[CX-9,38.4,5.4],[CX-9,38.4,-5.4]]],
    [[0,0,1],[[CX-8.4,31.6,6],[CX+8.4,31.6,6],[CX+8.4,38.4,6],[CX-8.4,38.4,6]]],[[0,0,-1],[[CX-8.4,31.6,-6],[CX+8.4,31.6,-6],[CX+8.4,38.4,-6],[CX-8.4,38.4,-6]]]];
   const scrn=new Path2D();for(const[n,q] of faces){const ctr:V3=[CX+n[0]*9,35,n[2]*6];if(dot3(n,[c.eye[0]-ctr[0],c.eye[1]-ctr[1],c.eye[2]-ctr[2]])>0)addPoly(scrn,q.map(p=>scr(c,toCam(c,p))));}
   s.knockout(scrn);s.tone(Y,scrn,.5);s.tone(R,scrn,.3);}}
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),q=pr(c,bowl(r1<.6?0:1,r2,.15+.7*hash(i,Math.floor(tt*12))));if(!q||Math.abs(q[0])>v.hx||Math.abs(q[1])>v.hy)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
function convex(pts:Pt[]):Pt[]{const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o:Pt,a:Pt,b:Pt)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo:Pt[]=[],up:Pt[]=[];
 for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q);}up.pop();lo.pop();return lo.concat(up);}

// ---------------------------------------------------------------- the pitch (turf), lines, boards, both goals
function ground(s:Sheet,c:Cam,o:{bulge?:number;halfway?:number}={}){
 const g=polyP(c,[[-112,0,-40],[7,0,-40],[7,0,40],[-112,0,40]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.78);
 // mowing-pattern stripes (painted into the turf) every 5.25 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.12);
 // advertising boards: navy with yellow panels, behind the goal and along both touchlines
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>{if(toCam(c,a)[2]<2||toCam(c,b)[2]<2)return;addPoly(bd,polyP(c,[a,b,add3(b,[0,.9,0]),add3(a,[0,.9,0])]));};
 board([5,0,-37],[5,0,37]);board([-110,0,-37],[-110,0,37]);for(let k=0;k<6;k++){board([-110+k*19.2,0,-37],[-110+(k+1)*19.2,0,-37]);board([-110+k*19.2,0,37],[-110+(k+1)*19.2,0,37]);}
 for(const zz of[-36.9,36.9])for(let k=0;k<18;k++){const x=-108+k*6.2;const q=[[x,.25,zz],[x+3.3,.25,zz],[x+3.3,.65,zz],[x,.65,zz]] as V3[];if(q.every(p=>toCam(c,p)[2]>2))addPoly(pn,polyP(c,q));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;const q=[[4.9,.25,z],[4.9,.25,z+3.3],[4.9,.65,z+3.3],[4.9,.65,z]] as V3[];if(q.every(p=>toCam(c,p)[2]>2))addPoly(pn,polyP(c,q));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.9);
 // painted lines
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(const X of[0,-52.5,-105])for(let k=0;k<4;k++)L([X,0,-34+k*17],[X,0,-34+(k+1)*17]);
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);seg3(c,[-52.65,0,0],[-52.35,0,0],.3,ln);
 for(const sg of[1,-1]){const X=sg>0?0:-105,d=-sg;
  L([X,0,-20.16],[X+d*16.5,0,-20.16]);L([X+d*16.5,0,-20.16],[X+d*16.5,0,20.16]);L([X+d*16.5,0,20.16],[X,0,20.16]);
  L([X,0,-9.16],[X+d*5.5,0,-9.16]);L([X+d*5.5,0,-9.16],[X+d*5.5,0,9.16]);L([X+d*5.5,0,9.16],[X,0,9.16]);
  const a=Math.acos(5.5/9.15);if(sg>0)circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);else circ(-94,0,9.15,-a,a,12);
  seg3(c,[X+d*11.1,0,0],[X+d*10.9,0,0],.22,ln);}
 s.knockout(ln);
 // "from the halfway line!": the line itself flashes yellow
 const hw=o.halfway??0;if(hw>.02){const hl=new Path2D();for(let k=0;k<8;k++)seg3(c,[-52.5,.01,-34+k*8.5],[-52.5,.01,-34+(k+1)*8.5],.55+.5*hw,hl);s.fill(Y,hl,.95*hw);}
 // corner flags
 const pole=new Path2D(),flag=new Path2D();for(const X of[0,-105])for(const z of[-34,34]){if(toCam(c,[X,0,z])[2]<2)continue;seg3(c,[X,0,z],[X,1.55,z],.05,pole);addPoly(flag,polyP(c,[[X,1.55,z],[X,1.2,z],[X+(X?.45:-.45),1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
 goal3(s,c,1,o.bulge??0);goal3(s,c,-1,0);
}
/** a goal: sg = 1 the Japan goal at x = 0 (net toward +x), −1 the far goal at x = −105. bulge pushes the back net out low by the left post. */
function goal3(s:Sheet,c:Cam,sg:number,bulge:number){
 const X=sg>0?0:-105,z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X+sg*(2+bulge*.8*Math.exp(-Math.pow((z+2.6)/1.3,2))*Math.exp(-Math.pow((y-.5)/.9,2)));
 if(toCam(c,[X,1,0])[2]<2)return;
 const zs=[z0,-2.6,-1.4,0,1.4,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.022,mesh,.7);for(let j=0;j<3;j++){const y0=1.9*(1-j/3),y1=1.9*(1-(j+1)/3);seg3(c,[back(z,y0),y0,z],[back(z,y1),y1,z],.022,mesh,.7);}}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D(),fo=new Path2D();for(const[w,p] of [[.12,fr],[.2,fo]] as [number,Path2D][]){seg3(c,[X,0,z0],[X,H,z0],w,p);seg3(c,[X,0,z1],[X,H,z1],w,p);seg3(c,[X,H,z0-.06],[X,H,z1+.06],w,p);}
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is the strike)
const G=9.81;
/** the strike: the ball on the halfway line, 4 m right of centre (Lloyd's right = the main-stand side) */
const B0:V3=[-52.5,.11,4.0];
type MKey=[number,number,number];// τ, x, z
function pathPos(p:MKey[],tau:number){let dist=0;if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0,dist:0};
 for(let i=0;i+1<p.length;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[1]-a[1],b[2]-a[2]),dt=b[0]-a[0];if(tau<b[0]){const u=(tau-a[0])/dt;return{x:lerp(a[1],b[1],u),z:lerp(a[2],b[2],u),vx:(b[1]-a[1])/dt,vz:(b[2]-a[2])/dt,dist:dist+L*u};}dist+=L;}
 const l=p[p.length-1];return{x:l[1],z:l[2],vx:0,vz:0,dist};}
/** a body moving along keys: stride phase from distance, speed from velocity, facing the run (or `look` when slow) */
function runner(p:MKey[],tau:number,look:[number,number],idle:Pose=stand()):{pose:Pose;place:Place}{
 const q=pathPos(p,tau),v=Math.hypot(q.vx,q.vz),sp=clamp(v/8),run=runCycle(q.dist/(2.2+2.4*sp),{speed:sp});
 const lookYaw=yawTo(q.x,q.z,look[0],look[1]),yaw=v>.05?lerpAng(lookYaw,Math.atan2(-q.vz,q.vx),clamp((v-.3)/.9)):lookYaw;
 return{pose:blendPose(idle,run,clamp(v/1.2)),place:{x:q.x,z:q.z,yaw}};}
/** turn the head (and a little of the shoulders) toward a ground point; up = chin angle (− looks up) */
function headTo(p:Pose,pl:Place,tx:number,tz:number,w:number,up=-14):Pose{if(w<=0)return p;const o={...p},rel=clamp(wrap(yawTo(pl.x??0,pl.z??0,tx,tz)-(pl.yaw??0)),-1.25,1.25);
 o.neckY=lerp(p.neckY,rel*.8,w);o.twist=lerp(p.twist,rel*.25,w);o.neckP=lerp(p.neckP,up*D2R,w);return o;}
const bumpT=(t:number,c:number,w:number)=>{const d=Math.abs(t-c)/w;return d>=1?0:.5+.5*Math.cos(d*Math.PI);};

// ---- the kits (athlete.ts styles): women footballers, ponytails ----
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.55],[K,.28]],SKIN_A:InkFill[]=[[Y,.42],[R,.17]];
const WOMAN:Build={height:1.7,bulk:.9};
const usa=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:[Y,.95],boots:K,skin:SKIN_L,hair:[K,.7],line:K,trim:K,numberInk:K,hairStyle:'ponytail',build:WOMAN,...o});
const japan=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:B,socks:B,boots:K,skin:SKIN_A,hair:K,line:K,trim:'paper',number:null,hairStyle:'ponytail',build:{height:1.64,bulk:.88},...o});
const LLOYD_B:Build={height:1.73,bulk:.93,thighs:1.05};
const LLOYD_ST=usa({number:10,hair:[K,.72],build:LLOYD_B,seed:10});
const KB:Build={height:1.7,bulk:.92};
const KEEPER_ST:AthleteStyle={shirt:[Y,.95],shorts:K,socks:[Y,.95],boots:K,skin:SKIN_A,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:18,numberInk:K,build:KB,seed:18};
const REF_ST:AthleteStyle={shirt:[K,.88],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN_L,hair:[Y,.9],line:K,hairStyle:'ponytail',build:{height:1.7,bulk:.9},seed:30};

// ---- the ball ----
/** Japan's move before the turnover: a midfielder carries it up, then the misplayed pass across the US half (Lloyd reads it) */
const BALL_KEYS:MKey[]=[[-16,-38,-16],[-10,-45,-13],[-6.5,-51,-10.5],[-4.2,-57.4,-7.0],[-3.3,-62.4,1.0]];
const T_PASS=-4.2,T_INT=-3.3,T_T2=-2.45;
const T2P:[number,number]=[-60.7,2.4];
/** the strike target: just above Kaihori's reaching right palm (solved below), then the bounce, the LEFT post (z −3.66) and the net */
const KTIP=.62,TD=1.0;
const K0:[number,number]=[-11.5,.5];
const TIP_HAND=(()=>{const sk=solve(keeperTip(KTIP,{hand:'r'}),KB,{x:0,z:0,yaw:Math.PI});return sk.rHa;})();
const TH:V3=[-1.25,TIP_HAND[1],-2.85];
const K1:[number,number]=[TH[0]-TIP_HAND[0],TH[2]-TIP_HAND[2]];
const BH:V3=[TH[0]+.03,TH[1]+.13,TH[2]];
const APEX=13;
const VY0=Math.sqrt(2*G*(APEX-B0[1])),FLY=VY0/G+Math.sqrt(2*(APEX-BH[1])/G);
const TT0=FLY-KTIP*TD;
const BOUNCE:V3=[-.5,.11,-3.2],POST:V3=[.02,.42,-3.47],NETP:V3=[1.45,.32,-2.65],REST:V3=[1.15,.11,-2.3];
const T_BOUNCE=FLY+.24,T_POST=FLY+.4,T_NET=FLY+.62,T_REST=T_NET+.55;
function ballAt(tau:number):V3{
 if(tau<T_PASS){const q=pathPos(BALL_KEYS,tau),v=Math.hypot(q.vx,q.vz)||1,tap=.35+.25*Math.abs(Math.sin(q.dist*.9));return[q.x+q.vx/v*tap,.11,q.z+q.vz/v*tap];}
 if(tau<T_INT){const q=pathPos(BALL_KEYS,tau);return[q.x,.11,q.z];}
 if(tau<T_T2){const u=easeOut(clamp((tau-T_INT)/(T_T2-T_INT-.08)));return[lerp(-62.4,T2P[0],u),.11,lerp(1,T2P[1],u)];}
 if(tau<0){const u=(tau-T_T2)/-T_T2,e=1-Math.pow(1-u,1.4);return[lerp(T2P[0],B0[0],e),.11,lerp(T2P[1],B0[2],e)];}
 if(tau<FLY){const u=tau/FLY;return[lerp(B0[0],BH[0],u),B0[1]+VY0*tau-.5*G*tau*tau,lerp(B0[2],BH[2],u)];}
 if(tau<T_BOUNCE){const u=(tau-FLY)/(T_BOUNCE-FLY),p=mix3(BH,BOUNCE,u);p[1]=lerp(BH[1],.11,u*u);return p;}
 if(tau<T_POST){const u=(tau-T_BOUNCE)/(T_POST-T_BOUNCE),p=mix3(BOUNCE,POST,u);p[1]+=.25*Math.sin(u*Math.PI*.8);return p;}
 if(tau<T_NET)return mix3(POST,NETP,easeOut((tau-T_POST)/(T_NET-T_POST)));
 const u=clamp((tau-T_NET)/(T_REST-T_NET)),h=NETP[1]*(1-u*u)+.11*u*u,b=u>=1?.1*Math.abs(Math.sin((tau-T_REST)*9))*Math.exp(-(tau-T_REST)*3.5):0;
 return[lerp(NETP[0],REST[0],u),Math.max(.11,h)+b,lerp(NETP[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:-TAU*5*Math.min(tau,T_POST)-TAU*2*Math.max(0,tau-T_POST);
const bulgeAt=(tau:number)=>tau<T_NET-.05?0:Math.exp(-(tau-T_NET+.05)*2.4)*(1+.3*Math.sin((tau-T_NET)*14));

// ---- Carli Lloyd: jog, scan, intercept, turn, touch past Utsugi, head up, the strike from halfway, then the goal ----
/** approach: from slightly left of the shot line (≈20°) so the right leg swings through the back of the ball */
const SHOT=Math.atan2(BH[2]-B0[2],BH[0]-B0[0]),DA=SHOT+20*D2R,DIR:[number,number]=[Math.cos(DA),Math.sin(DA)];
const YAW_L=yawTo(0,0,DIR[0],DIR[1]);
const SD=1.0,RUN_END=-STRIKE_CONTACT*SD,STRIKE_L=1.6;
/** her pelvis at contact so the RIGHT boot meets the back of the ball (solved once, FK) */
const PC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT),LLOYD_B,{x:0,z:0,yaw:YAW_L}),toe:[number,number]=[B0[0]-DIR[0]*.1,B0[2]-DIR[1]*.1];return[toe[0]-sk.rToe[0],toe[1]-sk.rToe[2]];})();
const PRE:[number,number]=[PC[0]-DIR[0]*STRIKE_L,PC[1]-DIR[1]*STRIKE_L];
const LL_KEYS:MKey[]=[[-16,-58,-10],[-9,-62.5,-5.5],[-4.4,-64.4,-1.3],[T_INT-.05,-63.1,.45],[T_T2,-61.6,1.7],[RUN_END,PRE[0],PRE[1]]];
const GOAL_C:[number,number]=[0,0];
/** the two windows where her head comes up to find the keeper: a scan before the pass reaches her, and the look before the shot */
const lookUp=(tau:number)=>Math.max(sm(-4.7,-4.35,tau)*(1-sm(-3.85,-3.55,tau)),sm(-2.05,-1.75,tau)*(1-sm(-1.05,-.75,tau)));
const TOUCH=(p:Pose):Pose=>({...p,rHipF:38*D2R,rHipA:14*D2R,rKnee:24*D2R,rAnk:30*D2R,lKnee:34*D2R,lHipF:18*D2R,lean:18*D2R,neckP:30*D2R,lShA:44*D2R,rShA:30*D2R});
const ARMS_UP=(u:number)=>celebrate(u,{kind:'arms'});
function lloydRun(tau:number):{pose:Pose;place:Place}{
 const r=runner(LL_KEYS,tau,[ballAt(tau)[0],ballAt(tau)[2]]);let p=r.pose;
 // head down on the ball near the touches
 const down=Math.max(bumpT(tau,T_INT,.5),bumpT(tau,T_T2,.45),bumpT(tau,RUN_END,.35));p={...p,neckP:lerp(p.neckP,26*D2R,down)};
 const b=Math.max(bumpT(tau,T_INT-.02,.3),bumpT(tau,T_T2,.24));if(b>0)p=blendPose(p,TOUCH(p),b);
 p=headTo(p,r.place,GOAL_C[0],GOAL_C[1],lookUp(tau));
 return{pose:p,place:r.place};}
const RUN_AT_END=lloydRun(RUN_END);
function lloydAt(tau:number):{pose:Pose;place:Place}{
 if(tau<RUN_END)return lloydRun(tau);
 const us=STRIKE_CONTACT+tau/SD;
 let p=blendPose(RUN_AT_END.pose,strike(Math.min(1,us),{power:1}),sm(RUN_END,RUN_END+.14,tau));
 // eyes back on the ball through contact, then up to follow the flight
 const lo=sm(RUN_END,-.05,tau)*(1-sm(.1,.5,tau));p.lean+=.06*lo;p.neckP+=.12*lo;
 let g:number;if(tau<0){const v=(tau-RUN_END)/-RUN_END;g=-STRIKE_L+STRIKE_L*(.55*v+.45*(1-(1-v)*(1-v)));}else g=.9*(1-Math.pow(1-clamp(tau/.7),2))+(tau>.7?2.4*(1-Math.exp(-(tau-.7)*.9)):0);
 const x=PC[0]+DIR[0]*g,z=PC[1]+DIR[1]*g,place:Place={x,z,yaw:lerpAng(YAW_L,yawTo(x,z,BH[0],BH[2]),sm(.6,1.2,tau))};
 if(tau>.5){const jog=runCycle(tau*1.5,{speed:.35*Math.exp(-(tau-.5)*.6)});let q=blendPose(p,jog,sm(.5,.95,tau));q.neckP=lerp(q.neckP,-20*D2R,sm(.5,1,tau));p=q;}
 if(tau>T_NET-.2)p=blendPose(p,ARMS_UP((tau-T_NET)*1.1),sm(T_NET-.2,T_NET+.35,tau));
 return{pose:p,place};}

// ---- Ayumi Kaihori: set well off her line, backpedals, slips, fingertip, sprawls ----
const SPRAWL=posed({dx:-1.15,pitch:-66,lean:16,lHipF:76,rHipF:52,lKnee:58,rKnee:86,lAnk:20,rAnk:20,lShA:44,rShA:112,rShF:36,lShF:26,lElb:40,rElb:26,neckP:18,neckY:-24,lHand:1,rHand:1});
function keeperAt(tau:number,it:number):{pose:Pose;place:Place}{
 const ball=ballAt(tau);
 if(tau<.15)return{pose:keeperSet(it*1.3),place:{x:K0[0]+.4*Math.sin(tau*.35),z:K0[1]+.5*clamp((ball[2]-K0[1])/20,-1,1),yaw:yawTo(K0[0],K0[1],ball[0],ball[2])}};
 if(tau<TT0){const u=(tau-.15)/(TT0-.15),e=u*u*(3-2*u)*.35+u*.65,x=lerp(K0[0],K1[0],e),z=lerp(K0[1],K1[1],e);
  let p=blendPose(keeperSet(.2),backpedal(tau*2.7),sm(.15,.4,tau));p={...p,neckP:-34*D2R};
  return{pose:p,place:{x,z,yaw:lerpAng(yawTo(K0[0],K0[1],B0[0],B0[2]),Math.PI,sm(.15,.8,tau))}};}
 const u=clamp((tau-TT0)/TD);let p=blendPose(backpedal(TT0*2.7),keeperTip(u,{hand:'r'}),sm(TT0,TT0+.12,tau));
 // the slip: her standing foot goes and she sits down hard, still stretching
 p=blendPose(p,SPRAWL,sm(TT0+TD*.72,TT0+TD+.25,tau));
 if(tau>T_NET)p={...p,neckY:lerp(p.neckY,-60*D2R,sm(T_NET,T_NET+.6,tau))};
 return{pose:p,place:{x:K1[0],z:K1[1],yaw:Math.PI}};}

// ---- everyone else ----
type Actor={name:string;st:AthleteStyle;at:(tau:number,it:number)=>{pose:Pose;place:Place};hero?:boolean};
const watch=(r:{pose:Pose;place:Place},tau:number,it:number,ph:number,happy:boolean)=>{const b=ballAt(tau);let p=headTo(r.pose,r.place,b[0],b[2],sm(0,.4,tau),-10);
 if(tau>T_NET)p=happy?blendPose(p,ARMS_UP(it*.9+ph),sm(T_NET,T_NET+.5,tau)*.9):blendPose(p,posed({lean:30,neckP:30,lHipF:26,rHipF:26,lKnee:32,rKnee:32,lShA:12,rShA:12,lShF:22,rShF:22}),sm(T_NET+.2,T_NET+1,tau)*.7);return{pose:p,place:r.place};};
const mover=(name:string,st:AthleteStyle,keys:MKey[],happy:boolean,ph=0):Actor=>({name,st,at:(tau,it)=>{const b=ballAt(tau);return watch(runner(keys,tau,[b[0],b[2]]),tau,it,ph,happy);}});
/** the Japan midfielder on the ball: carries it, then the pass that goes astray */
const PASSER_KEYS:MKey[]=(()=>{const o:MKey[]=[];for(let t=-16;t<=T_PASS+.01;t+=.8){const q=pathPos(BALL_KEYS,Math.min(t,T_PASS-.01)),v=Math.hypot(q.vx,q.vz)||1;o.push([t,q.x-q.vx/v*.75,q.z-q.vz/v*.75]);}const l=o[o.length-1];o.push([T_PASS+.9,l[1]-1.6,l[2]+1.2],[1,l[1]-4.5,l[2]+2]);return o;})();
const ACTORS:Actor[]=[
 {name:'Japan midfielder',st:japan({seed:40,hairStyle:'short',build:{height:1.62,bulk:.88}}),at:(tau,it)=>{const b=ballAt(tau);const r=runner(PASSER_KEYS,tau,[b[0],b[2]]);
  if(tau>T_PASS-.55&&tau<T_PASS+.5){const u=clamp((tau-T_PASS+.52)/1.0);r.pose=blendPose(r.pose,strike(u,{power:.35}),Math.sin(Math.PI*clamp((tau-T_PASS+.55)/1.05)));r.place.yaw=yawTo(r.place.x??0,r.place.z??0,-66,9);}
  return watch(r,tau,it,.2,false);}},
 {name:'Rumi Utsugi',st:japan({seed:41,hairStyle:'ponytail',build:{height:1.66,bulk:.9}}),at:(tau,it)=>{
  const keys:MKey[]=[[-16,-52,10],[-6,-55.5,8],[T_INT,-57.3,5.6],[T_T2-.3,-59.6,3.4],[T_T2+.4,-59.9,3.2],[1.5,-56,4.6]];const b=ballAt(tau);const r=runner(keys,tau,[b[0],b[2]]);
  // she steps in and lunges for the ball as Lloyd pushes it past her, then turns to chase
  const lu=clamp((tau-(T_T2-.45))/.8);if(lu>0&&lu<1){r.pose=blendPose(r.pose,lunge(lu,{side:'l'}),Math.sin(Math.PI*lu));r.place.yaw=yawTo(r.place.x??0,r.place.z??0,T2P[0],T2P[1]);}
  return watch(r,tau,it,.5,false);}},
 {name:'Japan (intended receiver)',st:japan({seed:42,hairStyle:'short'}),at:(tau,it)=>{const b=ballAt(tau);return watch(runner([[-16,-60,15],[-6,-64,11],[T_PASS,-66.2,8.6],[T_INT,-65.4,7.2],[0,-62,6.5]],tau,[b[0],b[2]]),tau,it,.7,false);}},
 mover('Japan centre-back',japan({seed:43,build:{height:1.7,bulk:.92}}),[[-16,-40,-6],[-6,-34,-5],[0,-26,-4.5],[3,-17,-4]],false,.1),
 mover('Japan centre-back 2',japan({seed:44,hairStyle:'short',build:{height:1.68,bulk:.9}}),[[-16,-41,5],[-6,-35,5.5],[0,-27.5,6],[3,-18.5,5]],false,.3),
 mover('Japan full-back',japan({seed:45}),[[-16,-44,-24],[-6,-40,-20],[0,-33,-17],[3,-26,-13]],false,.6),
 mover('Japan midfielder 2',japan({seed:46,hairStyle:'short'}),[[-16,-47,14],[-6,-51,13],[0,-50,11],[3,-47,9]],false,.8),
 mover('Alex Morgan',usa({number:13,seed:21,hair:[R,.55],build:{height:1.7,bulk:.9}}),[[-16,-44,-3],[-6,-37,-4],[0,-31,-4.5],[2,-21,-3.5],[4,-15,-2.5]],true,.15),
 mover('Tobin Heath',usa({number:17,seed:22,hair:[K,.6],build:{height:1.68,bulk:.9}}),[[-16,-46,22],[-6,-44,20],[0,-38,17],[4,-30,13]],true,.45),
 mover('Megan Rapinoe',usa({number:15,seed:23,hair:[Y,.9],hairStyle:'short',build:{height:1.68,bulk:.9}}),[[-16,-52,-24],[-6,-50,-21],[0,-45,-19],[4,-38,-16]],true,.65),
 mover('Lauren Holiday',usa({number:12,seed:24,hair:[Y,.8],build:{height:1.68,bulk:.9}}),[[-16,-66,-12],[-6,-66,-9],[0,-60,-6],[4,-55,-4]],true,.85),
 mover('referee',REF_ST,[[-16,-48,-20],[-6,-55,-15],[0,-56,-10],[4,-50,-9]],false,.3),
];

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytail and hem trail), smear = halftone echo + speed lines on fast limbs (the strike). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
const BALL_R=.11;
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??14,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+Math.min(P[1],14)*.04;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.05,.12,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<T_POST){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(240,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';only?:string[]};
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(!hero&&px<120)return{...st,detail:'low'};if(e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 {const cur=lloydAt(tp),d=visible(cur.place);if(d>0)items.push({d,draw:()=>{const prev=lloydAt(tpPrev);
  drawPlayer(s,cur.pose,c,detailFor(LLOYD_ST,d,true),cur.place,prev,!!e.smear&&tp>RUN_END+.2&&tp<.45);}});}
 {const cur=keeperAt(tp,e.it),d=visible(cur.place);if(d>0)items.push({d,draw:()=>{const prev=keeperAt(tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(KEEPER_ST,d,true),cur.place,prev,!!e.smear&&tp>TT0&&tp<TT0+TD);}});}
 for(const a of ACTORS){const cur=a.at(tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=a.at(tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(a.st,d,false),cur.place,prev);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const at3=(pl:Place,y=1):V3=>[pl.x??0,y,pl.z??0];
/** the ball as a camera follows it: averaged over the last .4 s (an operator's lag), height eased so the frame never whips */
const follow=(tau:number):V3=>{const a=ballAt(tau),b=ballAt(tau-.2),c=ballAt(tau-.4);return[(a[0]+b[0]+c[0])/3,Math.min(9,(a[1]+b[1]+c[1])/3*.8+.8),(a[2]+b[2]+c[2])/3];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** the strike lands just after "shoots"; the chapter must still hold the ball going in (the voice can run faster than the estimate) */
const tS1=()=>Math.min(CUE(0,'shoots')+.1,SECS(0)-T_NET-1.05);
const tau1=(t:number)=>t-tS1();
const P1:V3=[-54,22,64];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-52,13,-14],fov:44})],
  [CUE(0,'World Cup final')-.2,1.6,()=>({P:P1,T:[-54,1.5,-6],fov:25})],
  [CUE(0,'Carli Lloyd')-.2,.9,()=>({P:P1,T:at3(lloydAt(tau).place,1),fov:6.5})],
  [CUE(0,"Japan's keeper")-.25,1,()=>({P:P1,T:at3(keeperAt(tau,0).place,1),fov:6})],
  [CUE(0,'far off her line')-.1,1,()=>({P:P1,T:[-5.5,1,0],fov:14})],
  [CUE(0,'Lloyd wins')-.7,.75,()=>({P:P1,T:mix3(follow(tau),at3(lloydAt(tau).place,1),.5),fov:11})],
  [CUE(0,'looks up')-.1,1,()=>({P:P1,T:add3(mix3(follow(tau),at3(lloydAt(tau).place,1),.5),[5,0,-1]),fov:17})],
  [tS1()-1,.8,()=>({P:P1,T:add3(mix3(follow(tau),at3(lloydAt(tau).place,1),.5),[1.5,0,0]),fov:10})],
  [tS1()+.35,1.3,()=>({P:P1,T:add3(follow(tau),[3,0,0]),fov:24})],
  [tS1()+FLY-.9,.8,()=>({P:P1,T:[-2.5,1.5,-2],fov:12})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+T_NET;
  stadium(s,c,t,{roar:sm(tN,tN+.4,t),flash:.15+.85*sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  const hwT=CUE(0,'halfway line');ground(s,c,{bulge:bulgeAt(tau),halfway:sm(hwT-.15,hwT+.2,t)*(1-sm(hwT+.9,hwT+1.6,t))});
  // TV telestrator on "far off her line": a ring under Kaihori and a dashed yellow line back to her goal line — the gap behind her
  const tf=CUE(0,'far off her line'),tl=sm(tf+.1,tf+.9,t)*(1-sm(CUE(0,'Lloyd wins')-.2,CUE(0,'Lloyd wins')+.4,t));
  if(tl>.02){const kp=keeperAt(tau,0).place,kx=kp.x??0,kz=kp.z??0,pts:Pt[]=[];for(let i=0;i<=12;i++){const u=i/12*tl,p=pr(c,[lerp(kx,0,u),.02,lerp(kz,0,u)]);if(p)pts.push(p);}
   const gaps:[number,number][]=[];for(let x=.08;x<1;x+=.16)gaps.push([x,x+.07]);if(pts.length>1)s.fill(Y,ribbon(pts,Math.max(5,kAt(c,[kx/2,0,0])*.25),{taper:.1,wobble:.5,gaps}),.95);
   const ring:Pt[]=[];for(let i=0;i<30;i++){const a=i/30*TAU,p=pr(c,[kx+Math.cos(a)*1.1,.02,kz+Math.sin(a)*1.1]);if(p)ring.push(p);}if(ring.length>20)s.fill(Y,ribbon(ring,Math.max(4,kAt(c,[kx,0,kz])*.18),{close:true,taper:0,wobble:.6}),.95*tl);}
  play(s,c,tau,tp,tpp,{it:tt,minBall:12,lines:true,prevT:tau1(t-.06),hero:'mid',smear:true});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 still:11.6,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from a low camera by the Japan box
const tau2=(t:number)=>key(t,mono([[0,-2.55],[CUE(1,'Watch again'),-2.4],[CUE(1,'slowly'),-1.5],[CUE(1,'sails over')-.2,.3],[CUE(1,'the keeper'),1.15],[CUE(1,'scrambles back'),1.9],[CUE(1,'touches it'),FLY-.02],[CUE(1,'clips the post'),T_POST+.01],[CUE(1,'goes in'),T_NET+.1],[CUE(1,'hat-trick'),T_NET+.8],[SECS(1),T_NET+2.1]]),linear);
const E2:V3=[-13,1.7,17];
function cam2(t:number):Cam{
 const tau=tau2(t),L=at3(lloydAt(tau).place,1.05);
 return plan(t,[
  [0,0,()=>({P:E2,T:L,fov:7.5})],
  [CUE(1,'sails over')-.35,1.3,()=>({P:E2,T:follow(tau),fov:24})],
  [CUE(1,'the keeper')-.1,1,()=>({P:add3(E2,[2.5,-.2,-2]),T:mix3(follow(tau),at3(keeperAt(tau,0).place,1.2),.62),fov:40})],
  [CUE(1,'scrambles back')-.2,.8,()=>({P:add3(E2,[3,-.2,-2.5]),T:mix3(follow(tau),at3(keeperAt(tau,0).place,1.2),.72),fov:36})],
  [CUE(1,'touches it')-.45,.7,()=>({P:add3(E2,[3,-.2,-2.5]),T:[-1.1,1.5,-2.8],fov:20})],
  [CUE(1,'goes in')-.1,.7,()=>({P:add3(E2,[3,-.2,-2.5]),T:[.2,.8,-3.1],fov:13})],
  [CUE(1,'hat-trick')-.1,1.3,()=>({P:add3(E2,[1.5,.4,-1]),T:[-4,2,-2.2],fov:30})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  const tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  // the post rings when the ball hits it: the frame shakes a little
  const shake=tau>=T_POST?7*settle(tau,T_POST,{freq:5,decay:5}):0;frame(s,shake,shake*.3);const c=cam2(t);
  const tH=CUE(1,'hat-trick');
  stadium(s,c,t,{roar:sm(T_NET,T_NET+.4,tau),flash:sm(T_NET,T_NET+.3,tau)*(.6+.4*sm(tH-.1,tH+.3,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the replay trail: the lob so far, fading at the tail
  if(tau>.02&&tau<T_NET+.6){const pts=pathPts(c,Math.max(0,tau-.9),Math.min(tau,T_POST),22),fade=1-sm(T_POST,T_NET+.6,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:11});
  // the fingertip: a spark at the glove; the post: a spark where it clips
  if(tp>FLY-.05&&tp<FLY+.3){const p=pr(c,BH);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(50,kAt(c,BH)*.5)*sm(FLY-.05,FLY+.08,tp,easeOut),{n:8,seed:31,g:1-sm(FLY+.1,FLY+.3,tp),width:9});}
  if(tp>T_POST-.03&&tp<T_POST+.35){const p=pr(c,POST);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(60,kAt(c,POST)*.6)*sm(T_POST-.03,T_POST+.1,tp,easeOut),{n:10,seed:37,g:1-sm(T_POST+.12,T_POST+.35,tp),width:11});}
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 still:8.4,
};

// ---------------------------------------------------------------- 3 · the lesson: scan before the ball arrives → find the keeper → be brave → strike through the ball
const tau3=(t:number)=>key(t,mono([[0,-5.1],[CUE(2,'Look up'),-4.45],[CUE(2,'before the ball'),-4.1],[CUE(2,'find the keeper'),-3.9],[CUE(2,'find the keeper')+1.3,-3.75],[CUE(2,'be brave'),-.9],[CUE(2,'strike cleanly'),-.1],[CUE(2,'through the ball')+.2,.12],[SECS(2),2.2]]),linear);
function cam3v(t:number):Cam{
 const tau=tau3(t),Lp=lloydAt(Math.min(tau,-3)).place,L=at3(Lp,1.25),tF=CUE(2,'find the keeper');
 return plan(t,[
  [0,0,()=>({P:add3(L,[-1.6,.2,5.6]),T:add3(L,[1.6,-.1,-.6]),fov:36})],
  [CUE(2,'Look up')-.1,1.1,()=>({P:add3(L,[-8.5,3.4,2.4]),T:[-40,0,.5],fov:38})],
  [tF+.2,1.2,()=>({P:add3(L,[-8.5,9,2.4]),T:[K0[0]+4.5,.9,K0[1]-.3],fov:9.5})],
  [CUE(2,'be brave')-.35,1.1,()=>({P:add3(B0,[-1.6,.95,6.4]),T:add3(B0,[-1.1,.72,0]),fov:40})],
  [CUE(2,'through the ball')+.25,1.9,()=>({P:[-27,19,64],T:[-26,6.5,-6],fov:40})],
 ]);
}
/** a projected arrow (shaft + head) along 3D points */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12);
  const tL=CUE(2,'Look up'),tB=CUE(2,'before the ball'),tF=CUE(2,'find the keeper'),tV=CUE(2,'be brave'),tS=CUE(2,'strike cleanly'),tT=CUE(2,'through the ball');
  stadium(s,c,t);
  ground(s,c,{bulge:bulgeAt(tau)});
  // the whole arc (dashed) once the ball is struck: over the keeper, down by the left post
  const arc=sm(tT+.3,tT+1.3,t);
  if(arc>.02){const pts=partial(pathPts(c,0,FLY,36),arc),gaps:[number,number][]=[];for(let x=.03;x<1;x+=.06)gaps.push([x,x+.03]);if(pts.length>2){const w=Math.max(20,kAt(c,[-26,6,0])*.5),rb=ribbon(pts,w,{taper:.3,wobble:0,gaps});s.knockout(ribbon(pts,w*1.7,{taper:.3,wobble:0,gaps}));s.fill(Y,rb,.95);s.stroke(K,rb,Math.max(2,w*.1),.8);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:13});
  // 1 · "Look up": a red dashed sight line from her eyes toward the keeper, growing while the pass is still on its way
  const sl=sm(tL+.3,tB+.5,t,easeOut)*(1-sm(tF+.15,tF+.5,t));
  if(sl>.02){const sk=solve(lloydAt(tp).pose,LLOYD_B,lloydAt(tp).place),eye=add3(sk.face,[0,.02,0]),kp=keeperAt(tp,tt).place,kh:V3=[kp.x??0,1.5,kp.z??0];
   const a=pr(c,eye),bb=pr(c,mix3(eye,kh,sl));if(a&&bb){const gaps:[number,number][]=[];for(let i=0;i<9;i++)gaps.push([(i+.6)/9.4,(i+.95)/9.4]);const w=Math.max(13,kAt(c,eye)*.05),rb=ribbon([a,bb],w,{seed:13,taper:.25,wobble:.5,gaps});s.knockout(ribbon([a,bb],w*1.7,{seed:13,taper:.25,wobble:.5,gaps}),.9);s.fill(R,rb,.95);s.stroke(K,rb,Math.max(2,w*.14),.85);}}
  // 2 · "find the keeper": a ring round Kaihori and a red screen over the empty ground behind her, back to the goal line
  const fk=sm(tF-.1,tF+.5,t,easeOutBack)*(1-sm(tV-.2,tV+.3,t));
  if(fk>.02){const kp=keeperAt(tp,tt).place,kx=kp.x??0,kz=kp.z??0,ring:Pt[]=[];for(let i=0;i<34;i++){const a=i/34*TAU,p=pr(c,[kx+Math.cos(a)*1.3*fk,.02,kz+Math.sin(a)*1.3*fk]);if(p)ring.push(p);}
   if(ring.length>24){const rr=ribbon(ring,Math.max(5,kAt(c,[kx,0,kz])*.22),{close:true,seed:43,taper:0,wobble:1});s.knockout(rr,.9);s.fill(Y,rr,.95);}
   const gp=sm(tF+.3,tF+1.1,t,easeOut);if(gp>.02){const x0=kx+1.2,x1=lerp(x0,0,gp),q=polyP(c,[[x0,.02,-3.66],[x1,.02,-3.66],[x1,.02,3.66],[x0,.02,3.66]]);if(q.length>2){const gz=polyPath(q,true);s.tone(R,gz,.6*fk);s.stroke(R,gz,Math.max(3,kAt(c,[x1,0,0])*.06),.95*fk);}}}
  // 3 · "be brave": the plant — a yellow ring where her standing foot lands beside the ball
  const pl=sm(tV,tV+.4,t,easeOutBack)*(1-sm(tT+.2,tT+.7,t));
  if(pl>.02){const ring:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU,p=pr(c,[B0[0]+Math.cos(a)*.5*(.7+.3*pl),0,B0[2]+Math.sin(a)*.5*(.7+.3*pl)]);if(p)ring.push(p);}if(ring.length>28){const rr=ribbon(ring,Math.max(6,kAt(c,B0)*.05),{close:true,seed:47,taper:0,wobble:1.2});s.knockout(rr,.9*pl);s.fill(Y,rr,.95*pl);}}
  // 4 · "strike cleanly through the ball": a red arrow straight through the ball's middle, rising with the lob; a spark at contact
  const th=sm(tS-.1,tS+.4,t,easeOut)*(1-sm(tT+.5,tT+1.1,t));
  if(th>.02){const a:V3=[B0[0]-DIR[0]*.9,.05,B0[2]-DIR[1]*.9],b:V3=[B0[0]+Math.cos(SHOT)*1.6,.11+1.0,B0[2]+Math.sin(SHOT)*1.6];arrow3(s,c,[a,mix3(a,b,.4*th+.1),mix3(a,b,th)],Math.max(8,kAt(c,B0)*.05),R,.95);}
  if(tp>-.06&&tp<.3){const p=pr(c,add3(B0,[-DIR[0]*.08,0,-DIR[1]*.08]));if(p)sparkBurst(s,Y,p[0],p[1],Math.max(60,kAt(c,B0)*.4)*sm(-.06,.06,tp,easeOut),{n:9,seed:61,g:1-sm(.1,.3,tp),width:Math.max(6,kAt(c,B0)*.035)});}
 },
 still:9,
};

const film:RisoStory={
 id:'lloyd-halfway-2015',format:'11v11',title:"Carli Lloyd's halfway-line goal",
 theme:'Look up before the ball reaches you: spot the keeper off her line, then be brave and strike cleanly through the ball',
 ageNote:'USA 5–2 Japan, FIFA Women\'s World Cup final, BC Place, Vancouver, 5 July 2015. Lloyd\'s hat-trick came in the first 16 minutes.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a little lob — a dashed yellow arc climbs from the point and drops, a ball riding its tip. Reduced motion: the still arc. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.6)),fade=age<=0?1:1-clamp((age-.6)/.2),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=18;i++){const k=i/18*u;pts.push([x+240*k,y-300*k+300*k*k]);}
  const gaps:[number,number][]=[];for(let g=.05;g<1;g+=.12)gaps.push([g,g+.05]);
  if(pts.length>2)s.fill(Y,ribbon(pts,13,{seed,taper:.6,pressure:.3,wobble:1,gaps}),.95*fade);
  const e=pts[pts.length-1];if(age>0&&age<.3)sparkBurst(s,Y,x,y,80,{n:8,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,e[0],e[1],30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
