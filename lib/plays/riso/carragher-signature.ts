/** Iconic-play film · Jamie Carragher, "Signature: the last-ditch slide" — shown through one real, sourced moment: AC Milan v Liverpool,
 * UEFA Champions League final, 25 May 2005, Atatürk Olympic Stadium, Istanbul (3–3 after extra time, Liverpool won 3–2 on penalties), the
 * 112th minute, in the second period of extra time.
 *
 * WHY THIS MOMENT: Carragher's signature (lib/town/iconicPlays.json, kind "signature") is a trait — the last-ditch challenge that gets there
 * just in time. Wikipedia's Carragher article singles out this final: "two vital last-ditch intercepts in extra-time of the final against AC
 * Milan whilst suffering from cramp". The BBC's clockwatch of the night records them: "110 mins: … Jamie Carragher makes yet another crucial
 * clearance to deny Milan a goalscoring opportunity" and "112 mins: Once again Jamie Carragher, who appears to be suffering from cramp, clears
 * for a corner and Rui Costa's flag-kick flies just over the far post". The Guardian's minute-by-minute agrees ("ET 19: Jamie Carragher is
 * suffering badly from cramp"; "ET 22: Rui Costa swings in a corner, conceded by Jamie Carragher, which curls across the face of goal and
 * wide"). The film recreates the 112th-minute clearance. No account describes the attack itself or the exact body shape of the clearance, so the
 * film DRAWS it as a low sliding interception of a ball played across Liverpool's box (the signature, and the way a "last-ditch intercept" is
 * made), but the footage narration only says what the sources say ("Carragher has cramp", "gets there just in time, and clears it for a
 * corner"; the replay says he "stretches in low"). The lesson chapter teaches the signature itself from the iconicPlays lesson: only slide
 * when you're sure; timing matters more than power.
 *
 * A faithful recreation rendered as a riso print: one 3D choreography in pitch metres (X along the pitch, Liverpool's goal line at X = 0, Z
 * across, away from the main camera, Y up) seen through TV cameras — 1 live, the high main camera (Milan attack down the near side, the ball
 * is played across the box, Carragher gets there just in time and it goes behind for a corner; he stays down, stretching his cramping leg);
 * 2 a TV slow-motion replay from a low camera out by the edge of the box, side-on (he waits, stretches in low, his boot reaches the ball
 * first); 3 a second replay from behind Liverpool's goal (out for a corner, no goal); 4 the lesson (the only chapter with teaching marks: the
 * ball's lane, the slide's path, a burst and tick at the touch, and a crossed-out ghost of a slide made too early). No overlays inside the
 * footage chapters.
 *
 * SOURCES (curl, 23 Sep 2026, cached in scratchpad/films/src-cache/):
 *  - BBC Sport, "Champions League final clockwatch", 25 May 2005 (the 110th- and 112th-minute Carragher clearances quoted above, cramp; 104
 *    mins Šmicer stretchered off with cramp; 103 mins Gerrard "now helping out at right-back"; 117 mins Dudek's double save)
 *    http://news.bbc.co.uk/sport1/hi/football/europe/4579949.stm  (src-cache/bbc-clockwatch-2005-final.txt)
 *  - The Guardian, minute-by-minute, "Liverpool 3–3 AC Milan", Barry Glendenning, 25 May 2005 (ET 19 cramp, ET 22 the corner conceded by
 *    Carragher; line-ups with numbers) https://www.theguardian.com/football/2005/may/25/minutebyminute.championsleague
 *    (src-cache/guardian-mbm-liv-milan-2005.txt)
 *  - Wikipedia, "Jamie Carragher" ("two vital last-ditch intercepts in extra-time … whilst suffering from cramp"; style: "last-ditch, recovery
 *    tackles") https://en.wikipedia.org/wiki/Jamie_Carragher  (src-cache/wiki-jamie-carragher.txt)
 *  - Wikipedia, "2005 UEFA Champions League final" (date, venue, 3–3, penalties 3–2, kick-off 21:45 local, "Clear night, 18 °C"; "Liverpool
 *    lined up in their red home kit, whilst Milan wore a changed strip of all white"; Carragher 23, Dudek 1, Rui Costa 10 on for Gattuso at
 *    112') https://en.wikipedia.org/wiki/2005_UEFA_Champions_League_final  (src-cache/wiki-2005-ucl-final.txt)
 *  - Milan's all-white kit drawn as in the approved 2003 films (lib/plays/riso/shevchenko-penalty-2003.ts, nesta-signature.ts).
 * CONFIRMED: the match, date, venue, a clear night; 3–3 in extra time; Carragher (Liverpool 23) suffering from cramp in extra time; in the
 *  112th minute he cleared the ball behind for a Milan corner; Rui Costa's corner went across the face of goal and wide/over the far post (no
 *  goal); Liverpool went on to win the final on penalties. Kits: Liverpool all red (white trim), Milan all white. Dudek (1) in Liverpool's goal.
 * INFERRED (not in the accounts; drawn, never narrated): the attack before it (a Milan move down the near side and a low ball across the box by an
 *  unnamed, unnumbered Milan player, a Milan runner arriving in the middle), that the clearance was a low slide and the leading leg (right);
 *  where on the pitch it happened and which end Liverpool defended on screen (their goal screen-left from the main camera on the near side);
 *  the deflection's angle; Carragher sitting on the grass afterwards stretching his calf (the usual thing with cramp; the sources only say he
 *  had cramp); every other player's position (drawn without names or numbers); Dudek's kit colour (a neutral grey); the stadium drawn simply
 *  (an open bowl round an athletics track, a roof over the main stand, floodlights on the rim), crowd colours, hair and skin tones; camera
 *  placements and lenses.
 *
 * Figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). The camera frames the whole
 * sheet (never sheet.safe) for card windows from 1.45:1 to square. Actions are timed from the chapter cues, so the recorded voice (withTiming)
 * re-times the drawing. Scenes read only their local time t. Every random value is seeded (hash). Inks: yellow, red, blue, navy. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,keyPath,hash,easeOut,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,clampPose,runCycle,dribble,stand,strike,keeperSet,slideTackle,posed,keyPoses,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and each chapter's `seconds` are
 * ESTIMATES until the Kokoro voice exists. withTiming matches a cue by its FIRST word, in order, so no cue starts with a word that also appears
 * between it and the previous cue, and no cue starts with a contraction or a hyphenated word. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Extra time',text:'Istanbul, 2005: the Champions League final, Liverpool against Milan. Three goals each, in extra time. Jamie Carragher has cramp, but Milan attack again... Carragher gets there just in time, and clears it for a corner!',tail:1.8,
  cues:['Istanbul','Liverpool against','Three goals','Jamie Carragher','Milan attack','Carragher gets','clears it']},
 {label:'The replay',text:'Watch again, slowly. Carragher waits for the right moment. Then he stretches in low, and his boot reaches the ball first.',tail:1.4,
  cues:['Watch again','Carragher waits','Then he stretches','his boot']},
 {label:'From behind the goal',text:'From behind the goal: out for a corner. No goal! Liverpool went on to win on penalties.',tail:1.6,
  cues:['From behind','out for','No goal','Liverpool went']},
 {label:'The lesson',text:'Jamie Carragher, brave to the end. Only slide when you\'re sure. Timing matters more than power!',tail:2,
  cues:['Jamie Carragher','brave to','Only slide','Timing matters','more than power']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py carragher-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/carragher-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/carragher-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (≈ the recorded Kokoro pace of the other films): .26 s + .025 s a letter per word, pauses after punctuation, × .87 */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.87*(.26+.025*w.replace(/[^a-z0-9]/gi,'').length);if(/[,;:]$/.test(w))t+=.19;if(/[.!?]$/.test(w))t+=.37;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('carragher: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 cs[0].at=0;
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** Cue onsets of chapter i (seconds), by index. Keep the counts [7,4,4,5]. */
const Q=(i:number)=>CHAPTERS[i].cues.map(c=>c.at);
const SECS=(i:number)=>CHAPTERS[i].seconds;

const Y='yellow',R='red',B='blue',K='navy';
/** Piecewise-linear map from chapter time to play time (anchors kept increasing). */
function warp(t:number,A:[number,number][]){const a:[number,number][]=[];for(const p of A)if(!a.length||(p[0]>a[a.length-1][0]+.05&&p[1]>=a[a.length-1][1]))a.push(p);
 if(t<=a[0][0])return a[0][1];for(let i=1;i<a.length;i++)if(t<=a[i][0])return a[i-1][1]+(a[i][1]-a[i-1][1])*(t-a[i-1][0])/(a[i][0]-a[i-1][0]);const n=a.length-1;return a[n][1]+(t-a[n][0])*(n?(a[n][1]-a[n-1][1])/(a[n][0]-a[n-1][0]):1);}
/** Consistent winding so overlapping parts of one shape union cleanly under the nonzero rule. */
function orient(p:Pt[]):Pt[]{let a=0;for(let i=0;i<p.length;i++){const q=p[i],r=p[(i+1)%p.length];a+=q[0]*r[1]-r[0]*q[1];}return a<0?p.slice().reverse():p;}
const shape=(p:Pt[])=>polyPath(orient(p),true);

// ---------------------------------------------------------------- camera: the whole frame
/** Screen (x,y) → the centre of the canvas; ~1500 × 1030 units visible (the card window is 1.45:1 to square). Full sheet, never the safe box. */
function frame(s:Sheet,x=0,y=0,z=1){const base=z*Math.min(s.W/1500,s.H/1030),a=Math.round(s.arrival*1e6)/1e6,k=base*a,q=(v:number)=>Math.round(v*1e4)/1e4;s.camera(q(x-(s.W/2-s.cx)/k),q(y-(s.H/2-s.cy)/k),base/s.fit,0);}

// ---------------------------------------------------------------- 3D: pitch metres → screen through a TV camera
type V3=[number,number,number];
type Cam={pos:V3;yaw:number;tilt:number;F:number};
function camAt(pos:V3,target:V3,F:number):Cam{const dx=target[0]-pos[0],dz=target[2]-pos[2];return{pos,yaw:Math.atan2(dx,dz),tilt:Math.atan2(pos[1]-target[1],Math.hypot(dx,dz)),F};}
/** camera space: [right, up, depth] */
function toCam(v:V3,c:Cam):V3{const dx=v[0]-c.pos[0],dy=v[1]-c.pos[1],dz=v[2]-c.pos[2],cy=Math.cos(c.yaw),sy=Math.sin(c.yaw),x1=dx*cy-dz*sy,z1=dx*sy+dz*cy,ct=Math.cos(c.tilt),st=Math.sin(c.tilt);return[x1,dy*ct+z1*st,z1*ct-dy*st];}
/** screen x, y and scale (units per metre); scale ≤ 0 means behind the camera */
function P3(v:V3,c:Cam):[number,number,number]{const q=toCam(v,c);if(q[2]<.3)return[0,0,0];const k=c.F/q[2];return[q[0]*k,-q[1]*k,k];}
const NEAR=.6;
function projPoly(pts:V3[],c:Cam):Pt[]{const cs=pts.map(p=>toCam(p,c)),out:V3[]=[];
 for(let i=0;i<cs.length;i++){const a=cs[i],b=cs[(i+1)%cs.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const u=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,NEAR]);}}
 return out.map(q=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]]);}
function addPoly(p:Path2D,pts:V3[],c:Cam){const q=projPoly(pts,c);if(q.length>2)p.addPath(shape(q));}
function groundLine(p:Path2D,a:[number,number],b:[number,number],c:Cam,w=.13){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2;addPoly(p,[[a[0]+nx,.01,a[1]+nz],[b[0]+nx,.01,b[1]+nz],[b[0]-nx,.01,b[1]-nz],[a[0]-nx,.01,a[1]-nz]],c);}
function groundArc(p:Path2D,cx:number,cz:number,r:number,a0:number,a1:number,c:Cam,n=16){for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;groundLine(p,[cx+Math.cos(u0)*r,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,cz+Math.sin(u1)*r],c,Math.max(.13,r*.02));}}
const onScreen=(q:[number,number,number])=>q[2]>0&&Math.abs(q[0])<2600&&Math.abs(q[1])<2200;
/** a ground point (pitch x,z) on screen */
const G=(x:number,z:number,c:Cam,y=0):Pt=>{const q=P3([x,y,z],c);return[q[0],q[1]];};

// ---------------------------------------------------------------- the Atatürk Olympic Stadium on a clear night: an athletics track round the pitch,
// an open bowl of seats round the track, a roof over the main stand (the camera's side), floodlights on the rim
/** the running track's inner edge is a "stadium" shape: straights along X, semicircle bends round the ends (a 400 m track fits a pitch
 * with 2.5 m to spare at the sides). oval(k,r): point k of N round a stadium shape r metres out from the bends' centres. */
const OV={x1:10.3,x2:94.7,cz:34,r0:36.5,N:48};
function oval(k:number,r:number,y=0):V3{const n=OV.N,u=((k%n)+n)%n/n;
 // quarter of the points on each straight, a quarter on each bend
 if(u<.25){const a=-Math.PI/2+u/.25*Math.PI;return[OV.x2+Math.cos(a)*r,y,OV.cz+Math.sin(a)*r];}
 if(u<.5)return[lerp(OV.x2,OV.x1,(u-.25)/.25),y,OV.cz+r];
 if(u<.75){const a=Math.PI/2+(u-.5)/.25*Math.PI;return[OV.x1+Math.cos(a)*r,y,OV.cz+Math.sin(a)*r];}
 return[lerp(OV.x1,OV.x2,(u-.75)/.25),y,OV.cz-r];}
const TRACK_OUT=OV.r0+9.8,RIM=TRACK_OUT+2.5,ROWS=12,STEP=2.4,RISE=.62;
/** floodlight banks on the bowl's rim (inferred), by oval point index */
const LAMPS=[3,9,15,21,27,33,39,45];
function stadium(s:Sheet,c:Cam,o:{crowd?:boolean}={}){
 // a clear night: a deep navy sky, a little blue haze low over the far rim where the floodlights catch it
 s.field(K,.8,.5);s.field(B,.3,.5);
 const Bnd=4000,hz=P3([c.pos[0]+Math.sin(c.yaw)*1e4,0,c.pos[2]+Math.cos(c.yaw)*1e4],c)[1];
 s.tone(B,polyPath([[-Bnd,hz-420],[Bnd,hz-460],[Bnd,Bnd],[-Bnd,Bnd]],true),.3);
 // the bowl: concrete tiers rising from a low wall behind the track
 const N=OV.N,conc=new Path2D(),wall=new Path2D(),aisles=new Path2D();
 for(let k=0;k<N;k++){addPoly(conc,[oval(k,RIM,1.2),oval(k+1,RIM,1.2),oval(k+1,RIM+ROWS*STEP,1.2+ROWS*STEP*RISE),oval(k,RIM+ROWS*STEP,1.2+ROWS*STEP*RISE)],c);
  addPoly(wall,[oval(k,RIM,0),oval(k+1,RIM,0),oval(k+1,RIM,1.2),oval(k,RIM,1.2)],c);}
 const mid=RIM+ROWS*STEP*.5;for(let k=0;k<N;k++)addPoly(aisles,[oval(k,mid,1.2+ROWS*STEP*.5*RISE),oval(k+1,mid,1.2+ROWS*STEP*.5*RISE),oval(k+1,mid+.9,1.2+(ROWS*STEP*.5+.9)*RISE),oval(k,mid+.9,1.2+(ROWS*STEP*.5+.9)*RISE)],c);
 s.knockout(conc);s.tone(K,conc,.5);s.tone(B,conc,.35);s.knockout(aisles,.35);
 s.fill(K,wall,.7);
 if(o.crowd!==false){// the crowd: seeded dots — Liverpool red, scarves and shirts in paper, dark coats in navy, a little blue
  const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],cols=N*5;
  for(let j=0;j<ROWS;j++){const d=RIM+(j+.5)*STEP;if(Math.abs(d-mid-.45)<1.2)continue;
   for(let i=0;i<cols;i++){const h=hash(i*131+j*7919,5);if(h<.26)continue;const kk=(i+.5+(hash(i+j*31,9)-.5)*.6)/5,a=oval(Math.floor(kk),d,0),b=oval(Math.floor(kk)+1,d,0),f=kk-Math.floor(kk);
    const P:V3=[lerp(a[0],b[0],f),1.2+(d-RIM)*RISE+.5,lerp(a[2],b[2],f)],q=P3(P,c);if(q[2]<=0||Math.abs(q[0])>1300||Math.abs(q[1])>900)continue;
    const z=clamp(q[2]*.55,2.4,16),u=hash(i*17+j*3,11),ink=u<.44?1:u<.66?0:u<.92?2:3;inks[ink].rect(q[0]-z/2,q[1]-z*.7,z,z*1.3);}}
  s.knockout(inks[0],.72);s.fill(R,inks[1],.95);s.fill(K,inks[2],.9);s.fill(B,inks[3],.9);}
 // the main stand's roof on the near side (the camera's side): a dark canopy, only seen from the low and behind-goal cameras
 const roof=new Path2D(),top=1.2+ROWS*STEP*RISE;
 addPoly(roof,[[22,top+2,OV.cz-RIM-ROWS*STEP],[83,top+2,OV.cz-RIM-ROWS*STEP],[83,top+9,OV.cz-RIM-4],[22,top+9,OV.cz-RIM-4]],c);
 s.knockout(roof);s.tone(K,roof,.75);
 // floodlight banks on the rim, each with a soft glow
 const lamp=new Path2D(),halo=new Path2D();
 for(const k of LAMPS){const P=oval(k,RIM+ROWS*STEP+1,top+6),q=P3(P,c);if(q[2]<=0||!onScreen(q))continue;const r=clamp(q[2]*2.2,5,40);
  lamp.rect(q[0]-r,q[1]-r*.4,r*2,r*.8);halo.addPath(polyPath(Array.from({length:14},(_,i)=>{const an=i/14*TAU;return[q[0]+Math.cos(an)*r*2.6,q[1]+Math.sin(an)*r*1.6] as Pt;}),true));}
 s.knockout(halo,.45);s.tone(Y,halo,.3);s.knockout(lamp);s.fill(Y,lamp,.25);
}
/** the running track, the floodlit grass inside it, stripes, markings, corner flags */
function pitch(s:Sheet,c:Cam){
 const N=OV.N,trk:V3[]=[],inn:V3[]=[];for(let k=0;k<N;k++){trk.push(oval(k,TRACK_OUT+2.5));inn.push(oval(k,OV.r0));}
 const tp=new Path2D();addPoly(tp,trk,c);s.knockout(tp);s.fill(R,tp,.5);s.tone(Y,tp,.4);s.tone(K,tp,.12);
 const lanes=new Path2D();for(const r of[OV.r0+2.45,OV.r0+4.9,OV.r0+7.35])for(let k=0;k<N;k++){const a=oval(k,r),b=oval(k+1,r);groundLine(lanes,[a[0],a[2]],[b[0],b[2]],c,.1);}
 s.knockout(lanes,.5);
 const g=new Path2D();addPoly(g,inn,c);s.knockout(g);s.fill(Y,g,.74);s.tone(B,g,.62);
 const st=new Path2D();for(let i=0;i<20;i+=2)addPoly(st,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(K,st,.14);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);{const d:V3[]=[];for(let i=0;i<10;i++){const a=i/10*TAU;d.push([gx+dir*11+Math.cos(a)*.14,.01,34+Math.sin(a)*.14]);}addPoly(ln,d,c);}}
 s.knockout(ln,.92);
 for(const[x,z]of[[0,0],[0,68],[105,0],[105,68]]as[number,number][]){const a=P3([x,0,z],c),b=P3([x,1.5,z],c);if(a[2]<=0||b[2]<=0||!onScreen(a))continue;const f=P3([x,1.42,z+(z?-.5:.5)],c),gq=P3([x,1.15,z],c);
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[gq[0],gq[1]]]);s.knockout(fl);s.fill(Y,fl);}
}
/** A goal at line gx whose net runs out by dir (Liverpool's: gx 0, dir −1): white posts and bar, a net (paper haze + navy mesh). */
function goal(s:Sheet,c:Cam,gx:number,dir:number){
 const z0=30.34,z1=37.66,h=2.44,bx=gx+dir*2,bh=2.0,net=new Path2D();
 addPoly(net,[[gx,0,z0],[bx,0,z0],[bx,bh,z0],[gx,h,z0]],c);addPoly(net,[[gx,0,z1],[bx,0,z1],[bx,bh,z1],[gx,h,z1]],c);
 addPoly(net,[[bx,0,z0],[bx,0,z1],[bx,bh,z1],[bx,bh,z0]],c);addPoly(net,[[gx,h,z0],[gx,h,z1],[bx,bh,z1],[bx,bh,z0]],c);
 s.knockout(net,.32);
 const k0=P3([gx,1,34],c)[2],sp=Math.max(.36,34/Math.max(1,k0));// the mesh never prints tighter than ~34 units (no moiré in a small card)
 if(k0>8){const mesh=new Path2D(),seg=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);if(p[2]<=0||q[2]<=0)return;mesh.moveTo(p[0],p[1]);mesh.lineTo(q[0],q[1]);};
  for(let z=z0;z<=z1+.01;z+=sp){seg([bx,0,z],[bx,bh,z]);seg([gx,h,z],[bx,bh,z]);}
  for(let y=0;y<=bh+.01;y+=sp){seg([bx,y,z0],[bx,y,z1]);for(const z of[z0,z1])seg([gx,y*h/bh,z],[bx,y,z]);}
  for(let x=0;x<=2.01;x+=sp)for(const z of[z0,z1])seg([gx+dir*x,0,z],[gx+dir*x,lerp(h,bh,x/2),z]);
  s.stroke(K,mesh,Math.max(1.5,.012*k0),.45);}
 const post=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);return ribbon([[p[0],p[1]],[q[0],q[1]]],Math.max(4,.12*(p[2]+q[2])/2),{seed:9,taper:0,wobble:.4,pressure:.1});};
 const fr=new Path2D();fr.addPath(post([gx,0,z0],[gx,h,z0]));fr.addPath(post([gx,0,z1],[gx,h,z1]));fr.addPath(post([gx,h,z0-.06],[gx,h,z1+.06]));
 s.knockout(fr);s.stroke(K,fr,Math.max(2.5,.02*k0),.95);
}

// ---------------------------------------------------------------- figures: the shared athlete library, through ONE adapter
/** athlete.ts is right-handed (y up); this film's pitch (X to the right on the main camera, Z away from it) is left-handed, so the projector
 * negates z both ways — that keeps Carragher's RIGHT leg on his right and the crosser's RIGHT boot on his right. */
function proj(c:Cam):Projector{const my=(p:V3):V3=>[p[0],p[1],-p[2]];
 return{eye:[c.pos[0],c.pos[1],-c.pos[2]],project(p){const q=toCam(my(p),c),d=Math.max(.05,q[2]);return[c.F*q[0]/d,-c.F*q[1]/d,d];},scale(p){return c.F/Math.max(.05,toCam(my(p),c)[2]);}};}
const toMy=(p:V3):V3=>[p[0],p[1],-p[2]];
/** a place on the pitch (my metres) facing heading h (my x,z) */
const placeOf=(x:number,z:number,h:[number,number]):Place=>({x,z:-z,yaw:Math.atan2(h[1],h[0])});
/** THE adapter: every body in the film is printed here. */
function drawPlayer(s:Sheet,pose:Pose,c:Cam,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}){
 const pc=proj(c);
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,pc,style,place,{prevPlace:o.prevPlace,ink:[K,.35]});
 return drawAthlete(s,pose,pc,style,place,{prev:o.prev,prevPlace:o.prevPlace});
}
// skin: one flat screen + at most one light screen (athlete.ts guidance)
const LIGHT:InkFill[]=[[R,.2]],OLIVE:InkFill[]=[[R,.2],[Y,.15]],DARK:InkFill[]=[[R,.85],[K,.2]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
/** Liverpool all in red (white trim, white numbers) */
const liverpool=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,skin,hair:K,hairStyle:'short',line:K,trim:'paper',shade:[K,.26],sleeves:'short',numberInk:'paper',scale:FIG,...o});
/** Milan all in white (red-and-black trim) */
const milan=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin,hair:K,hairStyle:'short',line:K,trim:R,shade:[K,.26],sleeves:'short',numberInk:K,scale:FIG,...o});
/** Carragher: centre-back, number 23, short dark hair */
const CARRA:AthleteStyle=liverpool(LIGHT,{number:23,seed:23,hair:[K,.9],build:{height:1.85,bulk:1.02}});
const CROSSER:AthleteStyle=milan(OLIVE,{seed:41,build:{height:1.8}});
const RUNNER:AthleteStyle=milan(LIGHT,{seed:42,build:{height:1.83}});
const DUDEK:AthleteStyle={shirt:[K,.45],shorts:[K,.7],socks:[K,.45],boots:K,skin:LIGHT,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',number:1,numberInk:'paper',scale:FIG,seed:1,build:{height:1.87}};
/** the lesson's marks: a yellow silhouette of a body */
const GHOST:AthleteStyle={shirt:[Y,.7],shorts:[Y,.7],socks:[Y,.7],boots:[Y,.7],skin:[[Y,.7]],hair:[Y,.7],line:Y,shade:null,shadow:false,sleeves:'short',scale:FIG,seed:23,build:CARRA.build,detail:'mid'};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T = 0 is Carragher's touch)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const add2=(a:[number,number],b:[number,number],k=1):[number,number]=>[a[0]+b[0]*k,a[1]+b[1]*k];
const midSole=(a:V3,b:V3):V3=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
const T_CLEAR=0;
/** the low ball across the box: from the near side, aimed at the Milan runner arriving by the far post */
const CROSS_BALL:[number,number]=[10.5,11.5],AIM:[number,number]=[3.4,33.2],CROSS_D=nrm2(AIM[0]-CROSS_BALL[0],AIM[1]-CROSS_BALL[1]);
/** where Carragher's boot meets it: 13.5 m down the lane (in front of the near post, just outside the six-yard box) */
const BALL0:[number,number]=add2(CROSS_BALL,CROSS_D,13.5);
const CROSS_SPEED=17,T_CROSS=T_CLEAR-13.5/CROSS_SPEED;
/** Carragher's slide heading: from the goal side of the runner, out toward the ball as it comes (toward the near side, a touch toward goal) */
const H=nrm2(-.2,-1);
/** slide: duration, and the phase at which his right toe reaches the ball (just after he lands on his hip) */
const SLIDE_DUR=1.05,U_C=.46,LS=T_CLEAR-U_C*SLIDE_DUR;
/** the library slide, the leading leg a little lower as it reaches (the toe skims the grass) */
const slideAt=(u:number)=>{const p=slideTackle(u,{foot:'r'});p.rHipF-=.14*sm(.2,.42,u);return clampPose(p);};
/** the slide's travel stops where the toe meets the ball */
const DX_C=slideAt(U_C).dx;
const TOE_OFF:V3=(()=>{const sk=solve(slideAt(U_C),CARRA.build,placeOf(0,0,H),FIG);return toMy(sk.rToe);})();
/** Carragher's spot, solved so his right toe touches the ball's near side at the touch */
const C_AT:[number,number]=[BALL0[0]-TOE_OFF[0]-H[0]*.1,BALL0[1]-TOE_OFF[2]-H[1]*.1];
/** off his boot: up a little, back toward the near side and over the goal line wide of the near post → a corner; rolling to rest behind */
const D_OUT=nrm2(-1,-.5),OUT_AT:[number,number]=[0,BALL0[1]+D_OUT[1]/D_OUT[0]*(0-BALL0[0])],BALL_REST:[number,number]=[-3.3,OUT_AT[1]-1.6];
const T_OUT=T_CLEAR+.5,T_REST=T_CLEAR+1.7;
/** the crosser (right foot, inferred), facing along the lane */
const STRIKE_DUR=1,W_START=T_CROSS-STRIKE_CONTACT*STRIKE_DUR,W_H=nrm2(CROSS_D[0]+.35,CROSS_D[1]);
const W_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),CROSSER.build,placeOf(0,0,W_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[CROSS_BALL[0]-f[0]-W_H[0]*.13,CROSS_BALL[1]-f[2]-W_H[1]*.13];})();
/** the build-up (inferred): a pass out wide from midfield to the near side, then the run down the line */
const T_PASS=-7.2,T_RECV=-5.7,PASS_FROM:[number,number]=[33,33],RECV:[number,number]=[25.4,9.6];
type Track={id:string;style:AthleteStyle;keys:number[][]};
const W_KEYS=[[-10,31,14],[-7.2,27.2,11.4],[T_RECV,...add2(RECV,[.7,.2])],[-3.6,17.6,10.2],[-2,13.6,10.6],[W_START,...W_AT]];
const C_KEYS=[[-10,18,34.5],[-7,15,33.2],[-4.2,11.2,31.6],[-2.2,8.6,29.8],[LS,...C_AT]];
const RUN_KEYS=[[-10,32,42],[-6,22.5,39.5],[-3,12.6,36.4],[T_CLEAR,5.2,33.6],[1,3.8,33],[T_REST+3,4.2,31.8]];
const TRACKS:Track[]=[
 {id:'carragher',style:CARRA,keys:C_KEYS},
 {id:'crosser',style:CROSSER,keys:W_KEYS},
 {id:'runner',style:RUNNER,keys:RUN_KEYS},
 // everyone else (positions illustrative; no names or numbers printed)
 {id:'m-pass',style:milan(OLIVE,{seed:43}),keys:[[-10,38,35],[T_PASS,...add2(PASS_FROM,[.6,.3])],[-4,29,30],[T_CLEAR,22,29],[T_REST+3,19,28]]},
 {id:'m-b',style:milan(DARK,{seed:44}),keys:[[-10,36,24],[-6,27,22],[-2,17.5,21],[T_CLEAR,14,22],[T_REST+3,12.4,22.6]]},
 {id:'m-c',style:milan(LIGHT,{seed:45,hairStyle:'long'}),keys:[[-10,40,48],[-6,30,46],[-2,17,43],[T_CLEAR,11.5,41.5],[T_REST+3,9.6,39.6]]},
 {id:'l-a',style:liverpool(LIGHT,{seed:51,hair:[Y,.85]}),keys:[[-10,20,40],[-6,16.4,39.2],[-2,10.2,37.6],[T_CLEAR,6.4,36.4],[T_REST+3,5.2,35]]},
 {id:'l-b',style:liverpool(DARK,{seed:52}),keys:[[-10,24,17],[-6,21,14.5],[-3,15.4,13.2],[T_CLEAR,11.6,13.8],[T_REST+3,9.4,15]]},
 {id:'l-c',style:liverpool(LIGHT,{seed:53}),keys:[[-10,30,26],[-6,24,24],[-2,17.6,24.4],[T_CLEAR,15,25.8],[T_REST+3,13,26.4]]},
 {id:'l-d',style:liverpool(OLIVE,{seed:54}),keys:[[-10,30,36],[-6,25,34],[-2,19.4,32.6],[T_CLEAR,17,32],[T_REST+3,15,31]]},
 {id:'l-e',style:liverpool(LIGHT,{seed:55,hair:[Y,.8]}),keys:[[-10,28,50],[-6,23,48],[-2,16,46],[T_CLEAR,13.4,45],[T_REST+3,12,43]]},
];
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-10.2);for(let t=-10;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
/** Dudek edges across toward his near post as the ball goes wide */
const DUDEK_Z=(T:number)=>{const b=ballAt(Math.min(T,T_CLEAR));return clamp(lerp(34,b[2],.45),31.2,36.6);};
/** The ball at play time T: at the passer's feet, the pass out wide, the run down the line, the low ball across (right foot), off Carragher's
 * right boot, over the goal line wide of the near post, rolling to rest behind it (a corner). */
function ballAt(T:number):V3{
 const ahead=(k:number[][],t:number,lead:number):V3=>{const p=trackAt(k,t),v=velAt(k,t),s=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/s*lead,.11,p[1]+v[1]/s*lead];};
 const pf:V3=[PASS_FROM[0],.11,PASS_FROM[1]],rv:V3=[RECV[0],.11,RECV[1]],cb:V3=[CROSS_BALL[0],.11,CROSS_BALL[1]],b0:V3=[BALL0[0],.13,BALL0[1]];
 if(T<T_PASS)return pf;
 if(T<T_RECV)return lerp3(pf,rv,sm(T_PASS,T_RECV,T,u=>u*(1.3-.3*u)));
 if(T<W_START-.3){const a=ahead(W_KEYS,T,.7+.35*Math.max(0,Math.sin((T-T_RECV)*TAU/.62)));return lerp3(rv,a,sm(T_RECV,T_RECV+.35,T));}
 if(T<T_CROSS)return lerp3(ahead(W_KEYS,W_START-.3,.7),cb,sm(W_START-.3,T_CROSS-.25,T,easeOut));
 if(T<T_CLEAR)return lerp3(cb,b0,clamp((T-T_CROSS)/(T_CLEAR-T_CROSS)));
 const out:V3=[OUT_AT[0],.45,OUT_AT[1]],rest:V3=[BALL_REST[0],.11,BALL_REST[1]];
 if(T<T_OUT)return lerp3(b0,out,clamp((T-T_CLEAR)/(T_OUT-T_CLEAR)),.5);
 if(T<T_REST){const u=sm(T_OUT,T_REST,T,easeOut),p=lerp3(out,rest,u);p[1]=.11+.34*Math.abs(Math.cos(u*Math.PI*1.5))*(1-u)*(1-u);return p;}
 return rest;
}

// ---------------------------------------------------------------- the players at play time T
const win=(T:number,a:number,b:number,e=.15)=>sm(a,a+e,T)*(1-sm(b-e,b,T));
const yawTo=(a:[number,number],b:[number,number],u:number):[number,number]=>{const aa=Math.atan2(a[1],a[0]);let bb=Math.atan2(b[1],b[0]);while(bb-aa>Math.PI)bb-=TAU;while(bb-aa<-Math.PI)bb+=TAU;const y=lerp(aa,bb,clamp(u));return[Math.cos(y),Math.sin(y)];};
/** running / jogging / standing along a track; faces its run, or the ball when (nearly) still, or a fixed heading */
function runState(k:number[][],T:number,face?:[number,number]):St{
 const p=trackAt(k,T),v=velAt(k,T),sp=Math.hypot(v[0],v[1]);let h:[number,number];
 if(face)h=face;else if(sp>1.2)h=[v[0]/sp,v[1]/sp];else{const b=ballAt(T);h=nrm2(b[0]-p[0],b[2]-p[1]);}
 const run=runCycle(strideAt(k,T)*.9/4.3,{speed:clamp((sp-2)/6)});
 return{pose:blendPose(stand(),run,clamp((sp-.5)/1.8)),place:placeOf(p[0],p[1],h)};
}
/** head (and a little shoulder) turned toward the ball. Right-handed yaw: + turns left. */
function lookAtBall(st:St,T:number,w=1):Pose{const b=ballAt(T),x=st.place.x!,z=-st.place.z!,want=Math.atan2(b[2]-z,b[0]-x),rel=Math.atan2(Math.sin(want-st.place.yaw!),Math.cos(want-st.place.yaw!));
 const p={...st.pose};p.neckY+=clamp(rel,-1.4,1.4)*.75*w;p.twist+=clamp(rel,-1.4,1.4)*.25*w;p.neckP+=.25*w;return clampPose(p);}
/** after the slide: sitting on the grass, right leg straight, toes pulled back toward him with his right hand (stretching the cramp) */
const SIT=posed({pitch:-14,lHipF:82,rHipF:80,lKnee:16,lHipA:14,lHipR:25,lAnk:16,rKnee:2,rAnk:-28,lean:62,neckP:10,rShF:115,rShA:4,rElb:4,lShF:40,lShA:34,lElb:50,rHand:.8,lHand:.9});
/** Carragher: goal-side of the runner, then the slide on his right side (on the grass from .4), the right toe reaching the ball at the touch;
 * he stays down, then sits up and stretches the cramping leg. */
function carraState(T:number):St{
 if(T<LS){const st=runState(C_KEYS,T),h=yawTo([Math.cos(st.place.yaw!),Math.sin(st.place.yaw!)],H,sm(LS-.8,LS-.1,T));
  const p=trackAt(C_KEYS,T);return{pose:lookAtBall({pose:st.pose,place:placeOf(p[0],p[1],h)},T,.7*(1-sm(LS-.5,LS,T))),place:placeOf(p[0],p[1],h)};}
 const place=placeOf(C_AT[0],C_AT[1],H),u=clamp((T-LS)/SLIDE_DUR),from=runState(C_KEYS,LS,H).pose;
 const p=blendPose(from,slideAt(u),sm(0,.12,u));
 if(u>U_C){p.dx=DX_C+.1*easeOut(clamp((u-U_C)/(1-U_C)));
  const r=sm(T_CLEAR,T_CLEAR+.2,T,easeInOutSine);p.rKnee+=.7*r;p.rHipF-=.15*r;p.neckY+=-.4*sm(T_CLEAR+.2,T_CLEAR+1,T);}
 const end=LS+SLIDE_DUR;
 if(T>end+.25){const r=sm(end+.25,end+1.35,T,easeInOutSine),sit={...SIT,dx:p.dx};const q=blendPose(clampPose(p),sit,r);
  // a small wince-rock as he pulls the toes back
  const w=sm(end+1.3,end+1.6,T);q.lean+=.05*w*Math.sin((T-end)*5);q.rAnk-=.08*w*(1+Math.sin((T-end)*5));return{pose:clampPose(q),place};}
 return{pose:clampPose(p),place};
}
/** the crosser: onto the pass, down the line, the ball across with the right foot, then watching it go */
function crosserState(T:number):St{
 if(T<W_START){const st=runState(W_KEYS,T);
  let pose=blendPose(st.pose,dribble(strideAt(W_KEYS,T)*.9/3.6,{foot:'r',speed:.8}),.5*win(T,T_RECV-.2,W_START+.1,.3));
  pose=lookAtBall({pose,place:st.place},T,.5);
  const h=yawTo([Math.cos(st.place.yaw!),Math.sin(st.place.yaw!)],W_H,sm(W_START-.6,W_START,T)),p=trackAt(W_KEYS,T);
  return{pose,place:placeOf(p[0],p[1],h)};}
 const u=clamp((T-W_START)/STRIKE_DUR),place=placeOf(W_AT[0],W_AT[1],W_H);
 if(u<1)return{pose:strike(u,{foot:'r',power:.7}),place};
 const pose=keyPoses(clamp((T-W_START-STRIKE_DUR)/.6),[[0,strike(1,{foot:'r',power:.7})],[1,stand()]]);
 return{pose:lookAtBall({pose,place},T,.8),place};
}
function dudekState(T:number):St{const x=.8,z=DUDEK_Z(T),b=ballAt(T);return{pose:keeperSet(T*1.3),place:placeOf(x,z,nrm2(b[0]-x,b[2]-z))};}
function stateOf(id:string,T:number):St{
 if(id==='carragher')return carraState(T);if(id==='crosser')return crosserState(T);if(id==='dudek')return dudekState(T);
 const st=runState(TR(id).keys,T);let pose=lookAtBall(st,T,.5);
 if(id==='m-pass'){const w=win(T,T_PASS-.5,T_PASS+.5,.2);if(w>0)pose=blendPose(pose,strike(clamp(STRIKE_CONTACT+(T-T_PASS)/.9),{foot:'r',power:.5}),w);}
 return{pose,place:st.place};
}
const HEROES=['carragher','crosser','runner'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: the stadium, the pitch, then players, keeper, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the heroes. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];wide?:boolean;noStadium?:boolean}={}){
 if(!o.noStadium){stadium(s,c);pitch(s,c);}
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'dudek'].filter(id=>!o.only||o.only.includes(id));
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<2.5)continue;// nobody printed right against the lens
  const style=id==='dudek'?DUDEK:TR(id).style,hero=(HEROES.includes(id)||id==='dudek')&&!o.wide,sty={...style,detail:hero||(!o.wide&&g[2]>190)?'auto' as const:'low' as const};
  const fast=(id==='carragher'&&T>LS+.05&&T<T_CLEAR+.25)||(id==='crosser'&&Math.abs(T-T_CROSS)<.22);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-(Math.abs(T-T_CLEAR)<.3?.002:0),draw:()=>{const h=Math.max(0,g[1]-bq[1]);s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-T*(T>T_CLEAR?12:6),key:K,shadow:B,seed:3});}});}}
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera on the near side, Liverpool's goal screen-left, panning with the attack; closing in as the ball comes across. */
const MAIN_CAM:V3=[30,17,-44];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,-9.6],[q[2],-8],[q[3],T_PASS+.2],[q[4],-4.4],[q[5],T_CROSS-.25],[q[6]+.1,T_CLEAR+.15],[S,T_REST+1.4]]);};
const cam1=(t:number)=>{const T=t1(t),b=ballAt(Math.min(T,T_OUT)),tx=clamp(lerp(b[0],7,.35),7,28),tz=lerp(40,30,sm(-6,T_CLEAR,T)),F=lerp(2900,5000,sm(-5,T_CLEAR,T,easeInOutSine));
 return camAt(MAIN_CAM,[tx,0,tz],F);};
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.3*p[2]),12);},
 get still(){return Q(0)[6]+.5;},
};
/** 2 · TV slow-motion replay from a low camera out by the edge of the box, side-on to the slide: the goal behind; Carragher waits goal-side,
 * then goes down and stretches in; his boot gets to the ball first; the runner arrives a moment too late. */
const LOW_CAM:V3=[17.5,2.4,27];
const REPLAY_CAST=['carragher','runner','dudek','ball','l-a'];
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,-2.6],[q[1],-2.1],[q[2],LS+.05],[q[3]+.3,T_CLEAR],[S,T_CLEAR+.5]]);};
const cam2=(t:number)=>{const T=t2(t),u=sm(-2.4,T_CLEAR,T,easeInOutSine),tx=lerp(7.6,5.8,u),tz=lerp(29,25.6,u),F=lerp(1500,1850,u);
 return camAt(LOW_CAM,[tx,.8,tz],F);};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6,only:REPLAY_CAST});frame(s);},
 aperture(t){const p=P3(ballAt(t2(twos(t))),cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.25*p[2]),12);},
 get still(){return Q(1)[3]+.5;},
};
/** 3 · the second replay, from behind Liverpool's goal line, out past the near post: the ball comes off his boot toward us and runs behind
 * the line (a corner); no goal; Carragher down on the grass, stretching his leg. */
const BEHIND:V3=[-15,5.2,21];
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,T_CLEAR-.5],[q[1]+.2,T_CLEAR+.45],[q[2],T_REST],[q[3],T_REST+1.3],[S,T_REST+2.6]]);};
const cam3=(t:number)=>{const T=t3(t),f=sm(T_CLEAR,T_REST+1,T,easeInOutSine),tx=lerp(4.4,.5,f),tz=lerp(27,24.5,f),F=lerp(1750,1550,f);
 return camAt(BEHIND,[tx,.7,tz],F);};
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3(ballAt(t3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.25*p[2]),12);},
 get still(){return Q(2)[1]+.4;},
};
/** 4 · the lesson plate: the moment again from a raised pitch-side camera, with bold yellow teaching marks — a ring round Carragher (Jamie
 * Carragher), the ball's lane across the box (brave to the end: he goes where it is coming), the slide's path to the lane (only slide when you're
 * sure), a burst and a tick where boot meets ball (timing), and a yellow ghost of a slide launched too early, sliding short of the lane, crossed
 * out (more than power). */
const LESSON_CAM:V3=[16,6.2,14];
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,LS-.5],[q[2],LS],[q[3]+.3,T_CLEAR],[S,T_CLEAR+.1]]);};
const LESSON_MID:[number,number]=[(C_AT[0]+BALL0[0])/2,(C_AT[1]+BALL0[1])/2];
const cam4=(t:number)=>camAt(LESSON_CAM,[LESSON_MID[0]-.4,.5,LESSON_MID[1]-.6],2150);
/** a bold yellow teaching stroke (navy edge, paper knockout, yellow) */
function mark(s:Sheet,p:Path2D){s.stroke(K,p,5,.9);s.knockout(p);s.fill(Y,p,.95);}
/** a bold teaching arrow a → b (drawn to `u`), one path: shaft + head */
function arrow(s:Sheet,a:Pt,b:Pt,w:number,seed:number,u=1){if(u<=.01)return;const e:Pt=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],an=Math.atan2(e[1]-a[1],e[0]-a[0]),hl=w*2.4,L=Math.hypot(e[0]-a[0],e[1]-a[1]);
 const back:Pt=[e[0]-Math.cos(an)*Math.min(hl*.8,L*.5),e[1]-Math.sin(an)*Math.min(hl*.8,L*.5)],p=new Path2D();p.addPath(ribbon([a,back],w,{seed,taper:0,wobble:.8}));
 p.addPath(shape([[e[0],e[1]],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));mark(s,p);}
/** a ring on the grass round (x,z), radius r (ground metres) */
function groundRing(s:Sheet,x:number,z:number,r:number,c:Cam){const out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G(x+Math.cos(a)*r,z+Math.sin(a)*r,c));inn.push(G(x+Math.cos(a)*r*.72,z+Math.sin(a)*r*.72,c));}
 const ring=new Path2D();ring.addPath(polyPath(out,true));ring.addPath(polyPath(inn.reverse(),true));mark(s,ring);}
/** the slide he did NOT make: launched too early, from further back, it runs out short of the ball's lane */
const GHOST_PLACE=placeOf(C_AT[0]-H[0]*4.6+.3,C_AT[1]-H[1]*4.6,H);
const ch4:Scene={
 draw(s,t){
  const q=Q(3),T=t4(twos(t)),c=cam4(t);frame(s);
  stadium(s,c,{crowd:false});pitch(s,c);
  // "Jamie Carragher": a yellow ring on the grass round him (printed under the figures)
  const hal=sm(.1,.5,t,easeOutBack)*(1-sm(q[1]+.1,q[1]+.5,t));
  if(hal>.01){const m=carraState(T).place;groundRing(s,m.x!,-m.z!,1.1*hal,c);}
  // "brave to the end": the ball's lane across the box, the place he has to get to
  const lane=sm(q[1],q[1]+.6,t,easeOut)*(1-sm(q[4]+.3,q[4]+.7,t));
  if(lane>.01){const a=G(...add2(CROSS_BALL,CROSS_D,7),c),b=G(...add2(BALL0,CROSS_D,.2),c),w=Math.max(10,.2*P3([BALL0[0],0,BALL0[1]],c)[2]);arrow(s,a,b,w,31,lane);}
  // "Only slide when you're sure": the slide's path on the grass, from where he goes down to the lane
  const path=sm(q[2],q[2]+.5,t,easeOut)*(1-sm(q[4]-.1,q[4]+.3,t));
  if(path>.01){const a=G(C_AT[0]-H[0]*.2,C_AT[1]-H[1]*.2,c),b=G(BALL0[0]-H[0]*.6,BALL0[1]-H[1]*.6,c),w=Math.max(10,.2*P3([C_AT[0],0,C_AT[1]],c)[2]);arrow(s,a,b,w,32,path);}
  drawPlay(s,T,c,{ballScale:1.5,only:['carragher','runner','dudek','ball'],noStadium:true});
  // "Timing matters": a burst where boot meets ball, and a tick
  const stamp=sm(q[3]+.3,q[3]+.65,t,easeOutBack);
  if(stamp>.002&&t<q[4]+.3){const bp=P3([BALL0[0],.13,BALL0[1]],c);sparkBurst(s,Y,bp[0],bp[1],.9*bp[2],{n:10,seed:61,g:clamp(stamp),width:.07*bp[2]});
   const k=.9*bp[2]*clamp(stamp),x=bp[0]+1.3*bp[2],y=bp[1]-1.5*bp[2];mark(s,ribbon([[x-k*.45,y],[x-k*.12,y+k*.35],[x+k*.55,y-k*.5]],Math.max(8,.14*bp[2])*clamp(stamp),{seed:71,taper:.15}));}
  // "more than power": the too-early slide, a yellow ghost stopping short of the lane, and a big cross over it
  const dive=sm(q[4]-.1,q[4]+.3,t,easeOutBack);
  if(dive>.01){drawPlayer(s,slideTackle(.45+.55*clamp(dive)),c,GHOST,GHOST_PLACE);
   const ctr=P3([GHOST_PLACE.x!+H[0]*1.3,.45,-GHOST_PLACE.z!+H[1]*1.3],c),r=.7*ctr[2]*clamp((t-q[4]-.25)/.3),w=Math.max(10,.18*ctr[2]);
   if(r>1){const x=new Path2D();x.addPath(ribbon([[ctr[0]-r,ctr[1]-r*.8],[ctr[0]+r,ctr[1]+r*.8]],w,{seed:81,taper:.1}));x.addPath(ribbon([[ctr[0]-r,ctr[1]+r*.8],[ctr[0]+r,ctr[1]-r*.8]],w,{seed:82,taper:.1}));mark(s,x);}}
  frame(s);
 },
 get still(){return Q(3)[4]+1.2;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'carragher-signature',format:'11v11',title:'Carragher: the last-ditch slide',theme:'Only slide when you’re sure: timing beats power',
 ageNote:'AC Milan v Liverpool · Champions League final, 25 May 2005 · Istanbul',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a little floodlight spark and a spray of grass flecks where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){
  const g=age>0?easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3)):1;if(g<=0)return;
  sparkBurst(s,Y,x,y,110,{n:9,seed,g,width:14});
  if(age>0)dust(s,null,x,y+14,30+110*easeOut(clamp(age/.6)),12,{seed:seed+1,size:10,cov:.9*(1-clamp(age/.8))});
 },
};
export default film;
/** Solved contact points (pitch metres; Liverpool's goal line at X = 0, Z across) — checked by tests/play-film-carragher-signature.cjs. */
const skOf=(id:'carragher'|'runner',T:number)=>{const st=stateOf(id,T);return solve(st.pose,(id==='carragher'?CARRA:RUNNER).build,st.place,FIG);};
export const FACTS={BALL0,CROSS_BALL,OUT_AT,BALL_REST,C_AT,T_CLEAR,T_CROSS,ballAt,
 /** Carragher's right toe at the touch (my metres) */
 carraToe:(T=T_CLEAR)=>toMy(skOf('carragher',T).rToe),
 carraPelvisY:(T=T_CLEAR)=>skOf('carragher',T).pelvis[1],
 /** Carragher's lower body at T — for the "ball, not the man" check against the runner */
 carraBody:(T:number)=>{const sk=skOf('carragher',T);return[sk.lToe,sk.lHeel,sk.rToe,sk.rHeel,sk.lAn,sk.rAn,sk.lKn,sk.rKn,sk.pelvis].map(toMy);},
 runnerLegs:(T:number)=>{const sk=skOf('runner',T);return[sk.lToe,sk.lHeel,sk.rToe,sk.rHeel,sk.lAn,sk.rAn,sk.lKn,sk.rKn].map(toMy);},
 /** Carragher's right hand and right toe once he is sitting (the cramp stretch) */
 stretch:(T:number)=>{const sk=skOf('carragher',T);return{hand:toMy(sk.rHa),toe:toMy(sk.rToe),pelvisY:sk.pelvis[1]};},
 carraAt:(T:number)=>{const st=stateOf('carragher',T);return[st.place.x!,-st.place.z!] as [number,number];}};
