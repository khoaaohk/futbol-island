/** Iconic-play film · Moisés Caicedo, "Signature: the steal and go" — his goal from the halfway line, Chelsea 2–1 Bournemouth, Premier
 * League (final day), Stamford Bridge, London, Sunday 19 May 2024, 16th minute (1–0). A RisoStory (chapters mode) played by the card's
 * picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction from WRITTEN accounts plus one match photograph
 * (the footage itself was not reviewed), rendered as a riso print.
 * LEAD: once public/plays/narration/caicedo-signature/timing.json exists, add
 *   import timingJson from '../../../public/plays/narration/caicedo-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cue words).
 *
 * WHY THIS MOMENT: Caicedo's entry in lib/town/iconicPlays.json is a signature ("the steal and go"; lesson: watch the passer's eyes and
 * hips to guess the pass, then step in and steal it). Wikipedia describes him as "known for his passing and interceptions … intercepting
 * attacks along the midfield … able to … contribute to his side's counterattacks". His best-documented moment of reading where the ball
 * will go, stepping in and GOING is this goal: Bournemouth's keeper, rushed by Gallagher, scuffed a clearance toward halfway, and Caicedo
 * "as he tends to be, was waiting" — he took the loose ball, crept forward and scored from halfway (his first Chelsea goal, the club's
 * Goal of the Season). The written match report describes the whole play, so chapters 1–2 show it; chapter 3 is a clearly labelled
 * "How he does it" demonstration of the card's lesson (a training drill in bibs, no named match, no named opponents).
 *
 * SOURCES (read 24 Sep 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - The Guardian, Jacob Steinberg at Stamford Bridge, "Chelsea into Europe after Caicedo's goal from halfway cuts down Bournemouth"
 *    (19 May 2024) https://www.theguardian.com/football/article/2024/may/19/chelsea-bournemouth-premier-league-match-report
 *    (guardian-che-bou-2024-report.txt): "Caicedo's opener in the 16th minute … the move had started with Jackson spinning and sending
 *    Sterling through on goal … Jackson's pass was marginally overhit. Neto flew out of his area, produced a fine tackle and prepared to
 *    clear, only to scuff the ball towards the halfway line because of sudden pressure from Conor Gallagher. Caicedo, as he tends to be, was
 *    waiting. Urged to shoot by the crowd, he crept a couple of yards into Bournemouth's half … Neto was stranded as the ball sailed over
 *    him and dipped under the bar before Marcos Senesi could head clear." Also: 2–1, Sterling's goal off Neto, Badiashile own goal,
 *    Petrović in Chelsea's goal, Caicedo's first goal for the club; photo captions "scores from the halfway line".
 *  - The same report's PA photograph (Bradley Collyer/PA) of the strike (guardian-che-bou-2024-caicedo-goal.jpg): Chelsea's home kit
 *    (royal blue shirt and shorts, white socks), No. 25, Caicedo's bleached-blond top that day, a sunny afternoon, Thiago Silva (No. 6)
 *    behind him; a Bournemouth player in the PALE-BLUE patterned away shirt, pale-blue shorts and NAVY socks beside him.
 *  - Wikipedia, "Moisés Caicedo" (raw; wiki-moises-caicedo.txt): 19 May 2024, final day, first Chelsea goal "with a shot from 50 yards out"
 *    in a 2–1 win over Bournemouth; Chelsea Goal of the Season 2023–24; style of play (interceptions, right side of the pivot, counters).
 *  - Wikipedia, "2023–24 AFC Bournemouth season" (raw; wiki-2023-24-bournemouth-season.txt): the away kit is pale blue (B9DCEF).
 * CONFIRMED by those sources: the match, date, venue, minute and score; the chain Jackson → Sterling (overhit) → Neto out of his area, tackle
 *  → scuffed clearance toward halfway under Gallagher's pressure → Caicedo waiting → a couple of yards into Bournemouth's half → the shot
 *  over the stranded Neto, dipping under the bar before Senesi could head clear; the kits (photo); Caicedo's No. 25 and his hair that day.
 * INFERRED (illustrative, never narrated as fact): every position and run in metres (Neto's tackle ≈18 m out, the clearance ≈35 m, the
 *  strike ≈50 m out, 2 m inside Bournemouth's half, slightly left of centre as Chelsea attack); that Caicedo met the loose ball with two
 *  touches; his RIGHT foot (the photo's follow-through reads as right-footed; he is right-footed); the flight (apex ≈12 m, ≈3 s, no curl) and
 *  where it met the net; Neto's retreat; Senesi's late leap; which end Chelsea attacked on screen; Neto's keeper kit (drawn yellow);
 *  Gallagher's lunge; Sterling's stumble; the other players and their runs; the crowd's colours; Stamford Bridge drawn as four close
 *  roofed stands with blue seats; the celebration; camera placements. Chapter 3's drill (bibs, positions) is an invented demonstration.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (the ground wide → Jackson and Sterling → Neto
 * rushes out and tackles → Gallagher's pressure, the scuff → Caicedo waiting on halfway → two touches → the strike, the halfway line flashes
 * → pan with the ball over Neto into the net); ch2 = the slow-motion replay from a LOW pitch-side camera by Bournemouth's box (tele on
 * Caicedo, the ball climbs, Neto stranded, it dips under the bar as Senesi leaps too late, the net); ch3 = "How he does it": a raised
 * side-on training-pitch camera — a passer's eyes and hips point to the pass, Caicedo reads it, steps into the lane, steals it and goes.
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe) so it frames from the 1.45:1 card window
 * down to square (a narrower window widens the lens a little). Every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous
 * silhouettes, FK skeleton, full range of motion, `prev` secondary motion, motion smear on the strikes). Small figures in wide shots and
 * every figure inside a passage print at `low` detail. Handedness: the world is right-handed (x toward Bournemouth's goal at x = 0, y up,
 * +z = the main-stand side), athlete.ts's own convention, so his RIGHT foot strikes without a mirrored projector.
 * Inks: yellow, red, blue, navy. Poses on twos, cameras on ones, all randomness seeded. Budget ≈150–300 plate ops per frame, passages ≲600. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,settle,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,dribble,stand,keeperSet,backpedal,lunge,header,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. No cue starts with a contraction. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Live from the Bridge',text:'Stamford Bridge, 2024: Chelsea against Bournemouth. Keeper Neto rushes out and wins the ball, but Gallagher chases him, and his clearance goes wrong. Caicedo is waiting. He steps in and shoots from near halfway. Over the keeper... goal!',tail:1.3,
  cues:['Stamford Bridge','Chelsea against','Keeper Neto','rushes out','wins the ball','Gallagher chases','clearance goes wrong','Caicedo is waiting','He steps in','shoots','near halfway','Over the keeper','goal']},
 {label:'Watch it again',text:'Watch again, slowly. The ball sails over the stranded keeper and dips under the bar, before a defender can head it. His first Chelsea goal!',tail:1.5,
  cues:['Watch again','slowly','sails over','stranded keeper','dips under','before a defender','head it','His first','Chelsea goal']},
 {label:'How he does it',text:"How he does it: watch the passer's eyes and hips. They point where the ball will go. Guess the pass, step in, steal it, then go!",tail:1.8,
  cues:['How he does it',"watch the passer's eyes",'and hips','They point','will go','Guess the pass','step in','steal it','then go']},
];
import timingJson from '../../../public/plays/narration/caicedo-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (≈2.7 words/s, Kokoro's pace): .22 s + .02 s a letter per word, pauses after , : . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.22+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('caicedo: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('caicedo: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}
/** piecewise-linear t → τ through anchors, slope 1 (real time) before the first and after the last anchor */
function pw(t:number,A:[number,number][]):number{if(t<=A[0][0])return A[0][1]-(A[0][0]-t);for(let i=0;i+1<A.length;i++){const a=A[i],b=A[i+1];if(t<b[0])return lerp(a[1],b[1],(t-a[0])/(b[0]-a[0]));}const l=A[A.length-1];return l[1]+(t-l[0]);}

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
function ringPts(c:Cam,x:number,z:number,r:number,n=30):Pt[]{const o:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU,p=pr(c,[x+Math.cos(a)*r,.02,z+Math.sin(a)*r]);if(p)o.push(p);}return o;}

// ---------------------------------------------------------------- Stamford Bridge on a sunny May afternoon
/** pitch 103 × 67: Bournemouth's goal line x = 0 (net toward +x), halfway x = −51.5, Chelsea's goal x = −103; touchlines z = ±33.5 */
const HW=-51.5,PL=-103,TZ=33.5;
type Q4=[V3,V3,V3,V3];// [lowA, lowB, upB, upA]
const STANDS:Q4[]=[
 [[-108,.9,-37],[5,.9,-37],[5,22,-57],[-108,22,-57]],// West Stand (far side, three tiers)
 [[6,.9,38],[6,.9,-38],[21,14,-38],[21,14,38]],// the end behind Bournemouth's goal
 [[5,.9,37],[-108,.9,37],[-108,19,55],[5,19,55]],// East Stand (the main stand under the TV camera)
 [[-109,.9,-38],[-109,.9,38],[-124,14,38],[-124,14,-38]],// the far end
];
/** the four corners: stands wrap round so no sky shows between them at pitch level */
const CORNERS:Q4[]=[[[5,.9,-37],[6,.9,-38],[21,14,-38],[5,22,-57]],[[6,.9,38],[5,.9,37],[5,19,55],[21,14,38]],[[-108,.9,37],[-109,.9,38],[-124,14,38],[-108,19,55]],[[-109,.9,-38],[-108,.9,-37],[-108,22,-57],[-124,14,-38]]];
const bil=(q:Q4,u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** crowd: [stand, u, v, ink 0 paper faces / 1 Chelsea blue / 2 navy / 3 red (Bournemouth's away fans, far end corner), phase] */
const CROWD=(()=>{const r=rng(2024),out:[number,number,number,number,number][]=[];[620,300,520,300].forEach((n,st)=>{for(let i=0;i<n;i++){const c=r(),u=r(),v=.04+r()*.9;
 const away=st===3&&u<.35;out.push([st,u,v,away&&c<.55?3:c<.42?0:c<.82?1:2,r()*TAU]);}});return out;})();
const USEG=10;
function stadium(s:Sheet,c:Cam,t:number,o:{roar?:number;flash?:number;lite?:boolean}={}){
 const{roar=0,flash=0,lite=false}=o,tt=twos(t),v=view(s);
 // a pale May sky (paper through a light blue screen) — only its top shows over the roofs
 s.field(B,.24,.4);
 const stands=new Path2D(),rows=new Path2D(),roof=new Path2D(),fascia=new Path2D(),shade=new Path2D();
 STANDS.forEach((q,si)=>{for(let k=0;k<USEG;k++){const u0=k/USEG,u1=(k+1)/USEG;
   quadP(c,stands,[bil(q,u0,0),bil(q,u1,0),bil(q,u1,1),bil(q,u0,1)]);
   if(!lite)for(let j=0;j<12;j+=2)quadP(c,rows,[bil(q,u0,j/12),bil(q,u1,j/12),bil(q,u1,(j+1)/12),bil(q,u0,(j+1)/12)]);
   for(const vv of si===1||si===3?[.5]:[.36,.7])quadP(c,fascia,[bil(q,u0,vv),bil(q,u1,vv),bil(q,u1,vv+.045),bil(q,u0,vv+.045)]);
   // the roof: a slab over the back of the stand, and its shadow over the upper rows (the sun is high over the West Stand)
   const lift:V3=[0,3.4,0],over:V3=si===0?[0,0,7]:si===2?[0,0,-7]:si===1?[-6,0,0]:[6,0,0];
   const r0=add3(bil(q,u0,1),lift),r1=add3(bil(q,u1,1),lift);quadP(c,roof,[r0,r1,add3(r1,over),add3(r0,over)]);
   if(si!==0)quadP(c,shade,[bil(q,u0,.62),bil(q,u1,.62),bil(q,u1,1),bil(q,u0,1)]);}});
 for(const q of CORNERS)for(let k=0;k<4;k++)quadP(c,stands,[bil(q,k/4,0),bil(q,(k+1)/4,0),bil(q,(k+1)/4,1),bil(q,k/4,1)]);
 s.knockout(stands);s.tone(B,stands,.6);s.tone(K,stands,.22);if(!lite){s.tone(K,rows,.16);}
 // crowd heads: faces, Chelsea blue, navy, a red corner of Bournemouth fans — bobbing on the twos when they roar
 if(!lite){const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0];
  for(const[st,u,vv,col,ph] of CROWD){const q=STANDS[st],bob=roar>0?roar*.8*Math.abs(Math.sin(ph+tt*9)):0,p=bil(q,u,vv);p[1]+=.35+bob;const d=toCam(c,p);if(d[2]<3)continue;
   const g=scr(c,d);if(Math.abs(g[0])>v.hx||Math.abs(g[1])>v.hy)continue;const sz=clamp(.55*c.F/d[2],3.5,18);heads[col].rect(g[0]-sz/2,g[1]-sz*.6,sz,sz*1.15);seen[col]++;}
  if(seen[0])s.knockout(heads[0],.8);if(seen[1])s.fill(B,heads[1],.95);if(seen[2])s.fill(K,heads[2],.85);if(seen[3])s.fill(R,heads[3],.95);}
 s.tone(K,shade,.22);s.fill(K,fascia,.88);s.fill(K,roof,.92);
 // camera flashes at the goal (paper sparks on the twos)
 if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(22*flash);i++){const st=Math.floor(r()*4),p=bil(STANDS[st],r(),.08+r()*.8),d=toCam(c,p);if(d[2]<4)continue;const g=scr(c,d),sz=clamp(.9*c.F/d[2],7,22);if(Math.abs(g[0])>v.hx||Math.abs(g[1])>v.hy)continue;
  fp.addPath(polyPath([[g[0],g[1]-sz],[g[0]+sz*.3,g[1]],[g[0],g[1]+sz],[g[0]-sz*.3,g[1]]],true));fp.addPath(polyPath([[g[0]-sz,g[1]],[g[0],g[1]-sz*.3],[g[0]+sz,g[1]],[g[0],g[1]+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 // advertising boards along the touchlines and behind the goals: navy with blue and paper panels
 const bd=new Path2D(),pn=new Path2D();
 for(const z of[-35.4,35.4])for(let x=PL-3;x<3;x+=8){const q:V3[]=[[x,0,z],[x+7.8,0,z],[x+7.8,.9,z],[x,.9,z]];quadP(c,bd,q,2);if((Math.round(x/8)&1)===0)quadP(c,pn,[[x+.4,.2,z],[x+7.4,.2,z],[x+7.4,.7,z],[x+.4,.7,z]],2);}
 for(const X of[4.5,PL-4.5])for(let z=-32;z<32;z+=8){quadP(c,bd,[[X,0,z],[X,0,z+7.8],[X,.9,z+7.8],[X,.9,z]],2);}
 s.knockout(bd);s.fill(K,bd,.9);s.tone(B,bd,.4);s.knockout(pn,.85);
}
/** the sunlit pitch, mowing stripes, paper lines, corner flags and both goals */
function ground(s:Sheet,c:Cam,o:{bulge?:number;halfway?:number;lite?:boolean}={}){
 const g=polyP(c,[[PL-6,0,-36],[5,0,-36],[5,0,36],[PL-6,0,36]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.62);
 if(!o.lite){const st=new Path2D();for(let x=PL;x<0;x+=10.3)addPoly(st,polyP(c,[[x,0,-TZ],[x+5.15,0,-TZ],[x+5.15,0,TZ],[x,0,TZ]]));s.tone(B,st,.18);}
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([PL*k/8,0,-TZ],[PL*(k+1)/8,0,-TZ]);L([PL*k/8,0,TZ],[PL*(k+1)/8,0,TZ]);}
 for(const X of[0,HW,PL])for(let k=0;k<4;k++)L([X,0,-TZ+k*TZ/2],[X,0,-TZ+(k+1)*TZ/2]);
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(HW,0,9.15);seg3(c,[HW-.15,0,0],[HW+.15,0,0],.3,ln);
 for(const sg of[1,-1]){const X=sg>0?0:PL,d=-sg;
  L([X,0,-20.16],[X+d*16.5,0,-20.16]);L([X+d*16.5,0,-20.16],[X+d*16.5,0,20.16]);L([X+d*16.5,0,20.16],[X,0,20.16]);
  L([X,0,-9.16],[X+d*5.5,0,-9.16]);L([X+d*5.5,0,-9.16],[X+d*5.5,0,9.16]);L([X+d*5.5,0,9.16],[X,0,9.16]);
  const a=Math.acos(5.5/9.15);if(sg>0)circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);else circ(PL+11,0,9.15,-a,a,12);
  seg3(c,[X+d*11.1,0,0],[X+d*10.9,0,0],.22,ln);}
 s.knockout(ln);
 // "from near halfway": the halfway line flashes yellow
 const hw=o.halfway??0;if(hw>.02){const hl=new Path2D();for(let k=0;k<8;k++)seg3(c,[HW,.01,-TZ+k*TZ/4],[HW,.01,-TZ+(k+1)*TZ/4],.55+.5*hw,hl);s.fill(Y,hl,.95*hw);}
 const pole=new Path2D(),flag=new Path2D();for(const X of[0,PL])for(const z of[-TZ,TZ]){if(toCam(c,[X,0,z])[2]<2)continue;seg3(c,[X,0,z],[X,1.55,z],.05,pole);addPoly(flag,polyP(c,[[X,1.55,z],[X,1.2,z],[X+(X?.45:-.45),1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal3(s,c,1,o.bulge??0);goal3(s,c,-1,0);
}
/** a goal: sg = 1 Bournemouth's goal at x = 0 (net toward +x), −1 the far goal. bulge pushes the back net out, high and just left of centre. */
function goal3(s:Sheet,c:Cam,sg:number,bulge:number){
 const X=sg>0?0:PL,z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X+sg*(2+bulge*.9*Math.exp(-Math.pow((z-BH[2])/1.4,2))*Math.exp(-Math.pow((y-1.3)/.9,2)));
 if(toCam(c,[X,1,0])[2]<2)return;
 const zs=[z0,-2.4,-1.2,0,1.2,2.4,z1];
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

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Caicedo's strike)
const G=9.81;
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

// ---- the kits (athlete.ts styles) ----
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.45],[Y,.6],[K,.32]];
/** Chelsea's home kit that day: royal-blue shirt and shorts, white socks (PA photo) */
const chelsea=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:B,socks:'paper',boots:K,trim:'paper',skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,shade:[K,.3],numberInk:'paper',number:null,...o});
/** Bournemouth's pale-blue away kit, navy socks (PA photo; the season article's pale-blue change strip) */
const afcb=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.3],shorts:[B,.3],socks:K,boots:K,trim:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,shade:[K,.26],numberInk:K,number:null,...o});
const CAI_B:Build={height:1.78,bulk:.97,thighs:1.05};
/** Moisés Caicedo, No. 25 — bleached-blond top that afternoon (photo) */
const CAI_ST=chelsea({number:25,skin:SKIN_D,hair:[Y,.9],build:CAI_B,seed:25});
const NETO_B:Build={height:1.9,bulk:.97};
/** Neto's keeper kit is not in the sources: drawn yellow and never named in the narration */
const NETO_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_M,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:NETO_B,seed:1};

// ---- the ball ----
/** Jackson's pass (τ −7.6) through for Sterling, marginally overhit, running on toward the box edge where Neto meets it */
const T_JP=-7.6,T_TK=-5.85,T_CL=-4.3,T_T1=-2.05,T_T2=-1.05;
const JP:[number,number]=[-29,3.6],TK:[number,number]=[-18.3,-1.3],NB:[number,number]=[-17.6,-.8];
/** the scuffed clearance comes down short of halfway, bobbling toward Caicedo */
const T1P:[number,number]=[-53.0,-2.6],T2P:[number,number]=[-51.3,-2.35];
/** the strike: 2 m inside Bournemouth's half, a little left of centre as Chelsea attack (−z = far side) */
const B0:V3=[-49.5,.11,-2.1];
/** the ball crosses the goal line just under the bar, a little left of centre, then hits the back of the net */
const BH:V3=[0,2.12,-.9];
const APEX=12;
const VY0=Math.sqrt(2*G*(APEX-B0[1])),FLY=VY0/G+Math.sqrt(2*(APEX-BH[1])/G);
const NETP:V3=[1.75,1.25,-.95],REST:V3=[1.3,.11,-1.1];
const T_NET=FLY+.13,T_REST=T_NET+.6;
function ballAt(tau:number):V3{
 if(tau<T_JP){// at Jackson's feet as he turns
  const a=(tau+9)*2.2;return[JP[0]-.9+.5*Math.cos(a),.11,JP[1]+.2+.5*Math.sin(a)];}
 if(tau<T_TK){const u=(tau-T_JP)/(T_TK-T_JP),e=1-Math.pow(1-u,1.25);return[lerp(JP[0],TK[0],e),.11,lerp(JP[1],TK[1],e)];}
 if(tau<T_CL-.02){// the tackle knocks it a stride on; it sits by Neto's feet
  const u=easeOut(clamp((tau-T_TK)/.5));return[lerp(TK[0],NB[0],u),.11+.25*Math.sin(Math.PI*clamp((tau-T_TK)/.35)),lerp(TK[1],NB[1],u)];}
 if(tau<T_T1){// the scuff: skids, two low bobbles, slowing
  const u=(tau-T_CL)/(T_T1-T_CL),e=1-Math.pow(1-u,1.7),hop=Math.abs(Math.sin(u*Math.PI*2.2))*(1.3*(1-u)+.1);return[lerp(NB[0],T1P[0],e),.11+hop,lerp(NB[1],T1P[1],e)];}
 if(tau<T_T2){const u=easeOut(clamp((tau-T_T1)/(T_T2-T_T1-.1)));return[lerp(T1P[0],T2P[0],u),.11,lerp(T1P[1],T2P[1],u)];}
 if(tau<0){const u=(tau-T_T2)/-T_T2,e=1-Math.pow(1-u,1.4);return[lerp(T2P[0],B0[0],e),.11,lerp(T2P[1],B0[2],e)];}
 if(tau<FLY){const u=tau/FLY;return[lerp(B0[0],BH[0],u),B0[1]+VY0*tau-.5*G*tau*tau,lerp(B0[2],BH[2],u)];}
 if(tau<T_NET)return mix3(BH,NETP,easeOut((tau-FLY)/(T_NET-FLY)));
 const u=clamp((tau-T_NET)/(T_REST-T_NET)),h=NETP[1]*(1-u*u)+.11*u*u,b=u>=1?.12*Math.abs(Math.sin((tau-T_REST)*9))*Math.exp(-(tau-T_REST)*3.5):0;
 return[lerp(NETP[0],REST[0],u),Math.max(.11,h)+b,lerp(NETP[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?tau*3:-TAU*4*Math.min(tau,T_NET);
const bulgeAt=(tau:number)=>tau<T_NET-.05?0:Math.exp(-(tau-T_NET+.05)*2.4)*(1+.3*Math.sin((tau-T_NET)*14));

// ---- Moisés Caicedo: waiting on halfway, steps in, two touches forward, head up, the strike, then away to celebrate ----
const SHOT=Math.atan2(BH[2]-B0[2],BH[0]-B0[0]),DA=SHOT+20*D2R,DIR:[number,number]=[Math.cos(DA),Math.sin(DA)];
const YAW_C=yawTo(0,0,DIR[0],DIR[1]);
const SD=1.0,RUN_END=-STRIKE_CONTACT*SD,STRIKE_L=1.6;
/** his pelvis at contact so the RIGHT boot meets the back of the ball (solved once, FK) */
const PC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT),CAI_B,{x:0,z:0,yaw:YAW_C}),toe:[number,number]=[B0[0]-DIR[0]*.1,B0[2]-DIR[1]*.1];return[toe[0]-sk.rToe[0],toe[1]-sk.rToe[2]];})();
const PRE:[number,number]=[PC[0]-DIR[0]*STRIKE_L,PC[1]-DIR[1]*STRIKE_L];
const CA_KEYS:MKey[]=[[-14,-56.5,-5.2],[-7,-56.2,-4.4],[-4.2,-55.9,-3.9],[-3.1,-55.4,-3.5],[T_T1-.05,-53.7,-2.9],[T_T2,-52.0,-2.6],[RUN_END,PRE[0],PRE[1]]];
const lookUp=(tau:number)=>Math.max(sm(-.95,-.7,tau)*(1-sm(-.45,-.3,tau)),sm(-9,-8.5,tau)*(1-sm(-4.6,-4.2,tau)));
const TOUCH=(p:Pose):Pose=>({...p,rHipF:38*D2R,rHipA:14*D2R,rKnee:24*D2R,rAnk:30*D2R,lKnee:34*D2R,lHipF:18*D2R,lean:18*D2R,neckP:30*D2R,lShA:44*D2R,rShA:30*D2R});
const ARMS_UP=(u:number)=>celebrate(u,{kind:'arms'});
function caiRun(tau:number):{pose:Pose;place:Place}{
 const r=runner(CA_KEYS,tau,[ballAt(tau)[0],ballAt(tau)[2]]);let p=r.pose;
 const down=Math.max(bumpT(tau,T_T1,.5),bumpT(tau,T_T2,.45),bumpT(tau,RUN_END,.35));p={...p,neckP:lerp(p.neckP,26*D2R,down)};
 const b=Math.max(bumpT(tau,T_T1-.02,.3),bumpT(tau,T_T2,.24));if(b>0)p=blendPose(p,TOUCH(p),b);
 p=headTo(p,r.place,-8,0,lookUp(tau));
 return{pose:p,place:r.place};}
const RUN_AT_END=caiRun(RUN_END);
function caiAt(tau:number):{pose:Pose;place:Place}{
 if(tau<RUN_END)return caiRun(tau);
 const us=STRIKE_CONTACT+tau/SD;
 let p=blendPose(RUN_AT_END.pose,strike(Math.min(1,us),{power:1}),sm(RUN_END,RUN_END+.14,tau));
 const lo=sm(RUN_END,-.05,tau)*(1-sm(.1,.5,tau));p.lean+=.06*lo;p.neckP+=.12*lo;
 let g:number;if(tau<0){const v=(tau-RUN_END)/-RUN_END;g=-STRIKE_L+STRIKE_L*(.55*v+.45*(1-(1-v)*(1-v)));}else g=.9*(1-Math.pow(1-clamp(tau/.7),2))+(tau>.7?2.4*(1-Math.exp(-(tau-.7)*.9)):0);
 const x=PC[0]+DIR[0]*g,z=PC[1]+DIR[1]*g,place:Place={x,z,yaw:lerpAng(YAW_C,yawTo(x,z,BH[0],BH[2]),sm(.6,1.2,tau))};
 if(tau>.5){const jog=runCycle(tau*1.5,{speed:.35*Math.exp(-(tau-.5)*.6)});const q=blendPose(p,jog,sm(.5,.95,tau));q.neckP=lerp(q.neckP,-20*D2R,sm(.5,1,tau));p=q;}
 if(tau>T_NET-.2){p=blendPose(p,celebrate((tau-T_NET)*1.1,{kind:'run'}),sm(T_NET-.2,T_NET+.35,tau));place.x=(place.x??0)+Math.max(0,tau-T_NET)*1.6;place.z=(place.z??0)+Math.max(0,tau-T_NET)*2.2;place.yaw=lerpAng(place.yaw??0,yawTo(0,0,.6,-1),sm(T_NET,T_NET+.5,tau));}
 return{pose:p,place};}

// ---- Neto: sprints out of his area, the block tackle on Sterling, sets to clear, the scuff, then back — stranded ----
const NETO_SD=1.0;
const NETO_TGT:[number,number]=[T1P[0],T1P[1]];
const YAW_N=yawTo(NB[0],NB[1],NETO_TGT[0],NETO_TGT[1]);
const NPC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{power:.55}),NETO_B,{x:0,z:0,yaw:YAW_N});const d:[number,number]=[Math.cos(-YAW_N),Math.sin(-YAW_N)];return[NB[0]-d[0]*.08-sk.rToe[0],NB[1]-d[1]*.08-sk.rToe[2]];})();
const N_KEYS:MKey[]=[[-14,-2.6,.2],[-8.1,-3.2,.1],[-6.2,-15.9,-.9],[T_TK,-17.2,-1.2],[-5.2,-16.9,-1.0],[T_CL-.55,NPC[0]+1.1,NPC[1]+.2],[T_CL-.1,NPC[0],NPC[1]],[-.2,NPC[0]+.4,NPC[1]]];
const N_BACK:MKey[]=[[.25,NPC[0]+.4,NPC[1]],[FLY*.8,-8.2,-.6],[FLY+1.4,-6.5,-.6]];
function netoAt(tau:number,it:number):{pose:Pose;place:Place}{
 const ball=ballAt(tau);
 if(tau<-8.1)return{pose:keeperSet(it*1.3),place:{x:-2.6,z:.2*Math.cos(tau),yaw:yawTo(-2.6,0,ball[0],ball[2])}};
 if(tau<T_CL-.6){const r=runner(N_KEYS,tau,[ball[0],ball[2]]);
  // the block: he gets across Sterling and his right boot meets the ball first
  const lu=clamp((tau-(T_TK-.45))/.8);if(lu>0&&lu<1){r.pose=blendPose(r.pose,lunge(lu,{side:'r'}),Math.sin(Math.PI*lu));r.place.yaw=yawTo(r.place.x??0,r.place.z??0,TK[0]-1,TK[1]-.4);}
  return{pose:headTo(r.pose,r.place,ball[0],ball[2],.6,20),place:r.place};}
 if(tau<.25){// the clearance: a hurried right-footed swing (contact at T_CL), then he watches it go
  const us=STRIKE_CONTACT+(tau-T_CL)/NETO_SD;const r=runner(N_KEYS,tau,[ball[0],ball[2]]);
  let p=blendPose(r.pose,strike(clamp(us),{power:.55}),sm(T_CL-.6,T_CL-.45,tau)*(1-sm(T_CL+.5,T_CL+1.1,tau)));
  if(tau>T_CL+.5)p=headTo(p,r.place,ball[0],ball[2],sm(T_CL+.5,T_CL+1,tau),-4);
  const yaw=tau<T_CL+.5?lerpAng(r.place.yaw??0,YAW_N,sm(T_CL-.75,T_CL-.5,tau)):lerpAng(YAW_N,yawTo(r.place.x??0,r.place.z??0,ball[0],ball[2]),sm(T_CL+.5,T_CL+1.2,tau));
  return{pose:p,place:{...r.place,yaw}};}
 // back toward goal, head up to the ball: backpedal, then a turn and a hopeless look up as it sails over
 const q=pathPos(N_BACK,tau);let p=blendPose(stand(),backpedal(tau*2.4),sm(.25,.6,tau)*(1-sm(FLY*.8,FLY+.3,tau)));
 p={...p,neckP:lerp(p.neckP,-40*D2R,sm(.4,1.2,tau))};
 if(tau>FLY*.75)p=blendPose(p,posed({lean:-6,neckP:-30,lShA:40,rShA:40,lElb:30,rElb:30,lHipF:10,rHipF:14,lKnee:18,rKnee:22}),sm(FLY*.75,FLY+.4,tau)*.8);
 if(tau>T_NET+.3)p=blendPose(p,posed({lean:30,neckP:30,lHipF:26,rHipF:26,lKnee:32,rKnee:32,lShA:12,rShA:12,lShF:22,rShF:22}),sm(T_NET+.3,T_NET+1.2,tau)*.8);
 const yaw=lerpAng(yawTo(q.x,q.z,B0[0],B0[2]),yawTo(q.x,q.z,0,0),sm(FLY*.85,FLY+.3,tau));
 return{pose:p,place:{x:q.x,z:q.z,yaw}};}

// ---- everyone else ----
type Actor={name:string;st:AthleteStyle;at:(tau:number,it:number)=>{pose:Pose;place:Place}};
const watch=(r:{pose:Pose;place:Place},tau:number,it:number,ph:number,happy:boolean)=>{const b=ballAt(tau);let p=headTo(r.pose,r.place,b[0],b[2],sm(0,.4,tau),-10);
 if(tau>T_NET)p=happy?blendPose(p,ARMS_UP(it*.9+ph),sm(T_NET,T_NET+.5,tau)*.9):blendPose(p,posed({lean:30,neckP:30,lHipF:26,rHipF:26,lKnee:32,rKnee:32,lShA:12,rShA:12,lShF:22,rShF:22}),sm(T_NET+.2,T_NET+1,tau)*.7);return{pose:p,place:r.place};};
const mover=(name:string,st:AthleteStyle,keys:MKey[],happy:boolean,ph=0):Actor=>({name,st,at:(tau,it)=>{const b=ballAt(tau);return watch(runner(keys,tau,[b[0],b[2]]),tau,it,ph,happy);}});
const STUMBLE=posed({lean:38,pitch:14,neckP:18,lHipF:40,rHipF:-10,lKnee:60,rKnee:30,lShA:50,rShA:60,lShF:30,rShF:-20,lElb:40,rElb:30});
/** Senesi races back to the line and leaps — too late: the ball has dipped in over him */
const T_SJ=FLY-.62;
const SEN_KEYS:MKey[]=[[-14,-26,-8],[-6,-21.5,-3.5],[T_CL,-22.5,-2.6],[0,-19.5,-1.6],[T_SJ,-2.6,-.25]];
const ACTORS:Actor[]=[
 {name:'Nicolas Jackson',st:chelsea({seed:15,skin:SKIN_D,build:{height:1.86,bulk:.95}}),at:(tau,it)=>{const b=ballAt(tau);
  const r=runner([[-14,-32,5.5],[-9,-30.2,4.2],[T_JP+.3,-29.9,4],[-5,-24,2.6],[0,-19,1.2],[4,-14,.5]],tau,[b[0],b[2]]);
  // the spin and the pass through (right foot, gentle)
  if(tau>T_JP-.6&&tau<T_JP+.5){const u=clamp((tau-T_JP+.52)/1.0);r.pose=blendPose(r.pose,strike(u,{power:.35}),Math.sin(Math.PI*clamp((tau-T_JP+.6)/1.1)));r.place.yaw=yawTo(r.place.x??0,r.place.z??0,TK[0],TK[1]);}
  else if(tau>-9.3&&tau<=T_JP-.6)r.place.yaw=lerpAng(yawTo(0,0,-1,0),yawTo(0,0,1,-.4),sm(-9.2,-8.2,tau));
  return watch(r,tau,it,.2,true);}},
 {name:'Raheem Sterling',st:chelsea({seed:7,skin:SKIN_D,build:{height:1.72,bulk:.95}}),at:(tau,it)=>{const b=ballAt(tau);
  const r=runner([[-14,-33,-9],[T_JP,-30.5,-7.2],[T_TK,-19.6,-2.6],[T_TK+.6,-18.8,-2.2],[-2,-19.4,-3.5],[4,-15,-3]],tau,[b[0],b[2]]);
  const f=clamp((tau-T_TK+.1)/1.4);if(f>0&&f<1)r.pose=blendPose(r.pose,STUMBLE,Math.sin(Math.PI*f)*.85);
  return watch(r,tau,it,.4,true);}},
 {name:'Conor Gallagher',st:chelsea({seed:23,hair:[R,.5],skin:SKIN_L,build:{height:1.82,bulk:.93}}),at:(tau,it)=>{const b=ballAt(tau);
  const r=runner([[-14,-37,8],[-8,-31,6],[T_TK,-23.5,2.2],[T_CL-.1,-19.9,.2],[T_CL+.7,-19.1,-.2],[3,-17,-1]],tau,[b[0],b[2]]);
  // sudden pressure: he closes Neto down and lunges at the clearance
  const lu=clamp((tau-(T_CL-.55))/.85);if(lu>0&&lu<1){r.pose=blendPose(r.pose,lunge(lu,{side:'l'}),Math.sin(Math.PI*lu));r.place.yaw=yawTo(r.place.x??0,r.place.z??0,NB[0],NB[1]);}
  return watch(r,tau,it,.6,true);}},
 mover('Cole Palmer',chelsea({seed:20,hair:[K,.6],build:{height:1.85,bulk:.9}}),[[-14,-36,-15],[-6,-31,-13],[0,-27,-11],[4,-22,-9]],true,.1),
 mover('Thiago Silva',chelsea({number:6,seed:6,skin:SKIN_M,hair:[K,.55],build:{height:1.83,bulk:.97}}),[[-14,-66,6],[-6,-63,5],[-2,-58,2.8],[3,-54,1.5]],true,.3),
 mover('Chelsea left-back',chelsea({seed:3,hair:[K,.9],build:{height:1.72,bulk:.93}}),[[-14,-52,-22],[-6,-47,-20],[0,-44,-18],[4,-40,-16]],true,.5),
 mover('Chelsea right-back',chelsea({seed:27,skin:SKIN_D,build:{height:1.78,bulk:.94}}),[[-14,-50,13],[-6,-46,12],[0,-43,11],[4,-40,10]],true,.7),
 {name:'Marcos Senesi',st:afcb({seed:25,hair:[K,.7],build:{height:1.85,bulk:.96}}),at:(tau,it)=>{const b=ballAt(tau);
  if(tau<T_SJ){const r=runner(SEN_KEYS,tau,[b[0],b[2]]);return{pose:headTo(r.pose,r.place,b[0],b[2],sm(.2,.8,tau),-40),place:r.place};}
  const u=clamp((tau-T_SJ)/1.1);let p=header(u);p=blendPose(p,posed({lean:30,neckP:30,lHipF:26,rHipF:26,lKnee:32,rKnee:32,lShA:12,rShA:12}),sm(T_NET+.5,T_NET+1.3,tau)*.8);
  return{pose:p,place:{x:-2.6+.9*sm(0,.6,u),z:-.25,yaw:Math.PI}};}},
 mover('Bournemouth centre-back',afcb({seed:31,skin:SKIN_D,build:{height:1.88,bulk:.97}}),[[-14,-27,6],[-6,-24,3.5],[0,-22,2.2],[4,-12,1.4]],false,.2),
 mover('Bournemouth full-back',afcb({seed:32,build:{height:1.8,bulk:.93}}),[[-14,-30,-20],[-6,-27,-15],[0,-25,-12],[4,-19,-9]],false,.4),
 mover('Bournemouth midfielder',afcb({seed:33,hair:[K,.6],build:{height:1.8,bulk:.93}}),[[-14,-44,-9],[-6,-40,-7],[0,-43,-5.5],[4,-38,-4]],false,.6),
 // from the photo: a long-haired Bournemouth player jogging near Caicedo as he strikes
 mover('Bournemouth forward',afcb({seed:34,hairStyle:'long',hair:[K,.8],build:{height:1.87,bulk:.95}}),[[-14,-47,9],[-6,-50,7.5],[-2,-52.5,5.2],[0,-52,4.4],[4,-46,3]],false,.8),
];

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair and hem trail), smear = halftone echo + speed lines on fast limbs (the strikes). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
const BALL_R=.11;
function drawBallAt(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;dir?:number;lineLen?:number}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??14,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+Math.min(P[1],14)*.04;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.05,.12,.5));
 if(o.dir!==undefined&&o.lineLen)speedLines(s,K,g[0],g[1],o.dir,{n:4,seed:7,len:o.lineLen,spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau);let dir:number|undefined,lineLen:number|undefined;
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<T_NET){const a=pr(c,ballAt(o.prev)),g=pr(c,P);if(a&&g){const d=Math.hypot(g[0]-a[0],g[1]-a[1]),r=Math.max(o.min??14,kAt(c,P)*BALL_R);if(d>r*.8){dir=Math.atan2(g[1]-a[1],g[0]-a[0]);lineLen=Math.min(240,d*1.4);}}}
 return drawBallAt(s,c,P,spinAt(tau),{min:o.min,dir,lineLen});
}
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the match through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid'};
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(!hero&&px<120)return{...st,detail:'low'};if(e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 {const cur=caiAt(tp),d=visible(cur.place);if(d>0)items.push({d,draw:()=>{const prev=caiAt(tpPrev);
  drawPlayer(s,cur.pose,c,detailFor(CAI_ST,d,true),cur.place,prev,!!e.smear&&tp>RUN_END+.2&&tp<.45);}});}
 {const cur=netoAt(tp,e.it),d=visible(cur.place);if(d>0)items.push({d,draw:()=>{const prev=netoAt(tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(NETO_ST,d,true),cur.place,prev,!!e.smear&&tp>T_CL-.25&&tp<T_CL+.25);}});}
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
/** the strike lands just after "shoots" but early enough that the ball is in by "goal" and before the chapter's passage */
const tS1=()=>Math.min(CUE(0,'shoots')+.12,CUE(0,'goal')-FLY+.2,SECS(0)-T_NET-.95);
/** the play clock: anchored so Neto's tackle meets "wins the ball" and the scuff meets "clearance goes wrong"; real time elsewhere */
const tau1=(t:number)=>pw(t,mono([[CUE(0,'wins the ball')+.1,T_TK],[CUE(0,'clearance goes wrong')+.15,T_CL],[tS1(),0]],.3));
const P1:V3=[-44,24,62];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-46,5,-10],fov:42})],
  [CUE(0,'Chelsea against')-.3,1.4,()=>({P:P1,T:mix3(follow(tau),[-24,1,0],.4),fov:24})],
  [CUE(0,'Keeper Neto')-.2,1,()=>({P:P1,T:add3(mix3(follow(tau),at3(netoAt(tau,0).place,1),.5),[0,0,0]),fov:10})],
  [CUE(0,'Gallagher')-.3,.8,()=>({P:P1,T:mix3(at3(netoAt(tau,0).place,1),follow(tau),.5),fov:9})],
  [CUE(0,'clearance goes wrong')+.1,1.2,()=>({P:P1,T:follow(tau),fov:20})],
  [CUE(0,'Caicedo is waiting')-.2,.9,()=>({P:P1,T:mix3(follow(tau),at3(caiAt(tau).place,1),.75),fov:6.5})],
  [tS1()-.9,.7,()=>({P:P1,T:add3(mix3(follow(tau),at3(caiAt(tau).place,1),.5),[1.5,0,0]),fov:8})],
  [tS1()+.3,1.3,()=>({P:P1,T:add3(mix3(follow(tau),[follow(tau)[0],1,follow(tau)[2]],.45),[4,0,0]),fov:24})],
  [tS1()+FLY-.9,.8,()=>({P:P1,T:[-3,1.5,-1],fov:12})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+T_NET;
  stadium(s,c,t,{roar:sm(tN,tN+.4,t),flash:.12+.88*sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  const hwT=CUE(0,'near halfway');ground(s,c,{bulge:bulgeAt(tau),halfway:sm(hwT-.15,hwT+.2,t)*(1-sm(hwT+.9,hwT+1.6,t))});
  // TV telestrator on "Caicedo is waiting": a ring under him on the halfway line
  const tw=CUE(0,'Caicedo is waiting'),tl=sm(tw,tw+.5,t,easeOutBack)*(1-sm(CUE(0,'He steps in')+.1,CUE(0,'He steps in')+.5,t));
  if(tl>.02){const pl=caiAt(tau).place,ring=ringPts(c,pl.x??0,pl.z??0,1.3*tl);if(ring.length>20)s.fill(Y,ribbon(ring,Math.max(4,kAt(c,at3(pl,0))*.2),{close:true,taper:0,wobble:.6}),.95);}
  play(s,c,tau,tp,tpp,{it:tt,minBall:12,lines:true,prevT:tau1(t-.06),hero:'mid',smear:true});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 still:12.4,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from a low camera by Bournemouth's box
const tau2=(t:number)=>key(t,mono([[0,-1.6],[CUE(1,'Watch again'),-1.45],[CUE(1,'slowly'),-.7],[CUE(1,'sails over')-.2,.25],[CUE(1,'stranded keeper'),1.55],[CUE(1,'dips under'),FLY-.35],[CUE(1,'before a defender'),FLY-.02],[CUE(1,'head it'),T_NET],[CUE(1,'His first'),T_NET+.6],[SECS(1),T_NET+2]]),linear);
const E2:V3=[-12,1.7,19];
function cam2(t:number):Cam{
 const tau=tau2(t),L=at3(caiAt(tau).place,1.05);
 return plan(t,[
  [0,0,()=>({P:E2,T:L,fov:6.5})],
  [CUE(1,'sails over')-.35,1.3,()=>({P:E2,T:follow(tau),fov:26})],
  [CUE(1,'stranded keeper')-.2,1,()=>({P:add3(E2,[2,-.2,-2]),T:mix3(follow(tau),at3(netoAt(tau,0).place,1.2),.55),fov:40})],
  [CUE(1,'dips under')-.3,.8,()=>({P:add3(E2,[4,-.2,-4]),T:[-1.2,1.6,-.6],fov:24})],
  [CUE(1,'head it')-.1,.7,()=>({P:add3(E2,[4,-.2,-4]),T:[.2,1.3,-.8],fov:15})],
  [CUE(1,'His first')-.1,1.3,()=>({P:add3(E2,[1,.4,-1]),T:mix3([-4,1.4,-1],at3(caiAt(tau).place,1.2),.25),fov:34})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  const tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  // the net snaps back: the frame shakes a little
  const shake=tau>=T_NET?6*settle(tau,T_NET,{freq:5,decay:5}):0;frame(s,shake,shake*.3);const c=cam2(t);
  const tH=CUE(1,'His first');
  stadium(s,c,t,{roar:sm(T_NET,T_NET+.4,tau),flash:sm(T_NET,T_NET+.3,tau)*(.6+.4*sm(tH-.1,tH+.3,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the replay trail: the lob so far, fading at the tail
  if(tau>.02&&tau<T_NET+.6){const pts=pathPts(c,Math.max(0,tau-.9),Math.min(tau,T_NET),22),fade=1-sm(T_NET,T_NET+.6,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:11});
  // under the bar: a spark where it crosses the line
  if(tp>FLY-.05&&tp<FLY+.35){const p=pr(c,BH);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(55,kAt(c,BH)*.5)*sm(FLY-.05,FLY+.1,tp,easeOut),{n:9,seed:31,g:1-sm(FLY+.12,FLY+.35,tp),width:10});}
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 still:7.6,
};

// ---------------------------------------------------------------- 3 · "How he does it": a training drill in bibs (a demonstration, not the match)
/** a passer (red bib) on the ball, a team-mate to his right, Caicedo in a navy training top between them — reading the eyes and hips */
const DP:[number,number]=[0,0],DR:[number,number]=[11,6.2];
const LANE=Math.atan2(DR[1]-DP[1],DR[0]-DP[0]);
const DI:[number,number]=[DP[0]+Math.cos(LANE)*5.6,DP[1]+Math.sin(LANE)*5.6];
const T3P=0,T3I=.42;// the pass and the steal (τ3)
const bib=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.9],shorts:K,socks:K,boots:K,trim:'paper',skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,shade:[K,.28],number:null,...o});
const PASSER_ST=bib({seed:61,build:{height:1.8,bulk:.94}}),RECV_ST=bib({seed:62,skin:SKIN_M,build:{height:1.78,bulk:.93}});
const CAI3_ST:AthleteStyle={...CAI_ST,shirt:[K,.88],shorts:K,socks:K,number:null,numberInk:'paper'};
/** where his right boot must be to meet the ball in the lane: he steps across with a lunge */
const C3_KEYS:MKey[]=[[-6,7.6,.4],[-.9,7.3,.9],[-.15,6.9,1.6],[T3I-.05,DI[0]+.35,DI[1]-1.05]];
function ball3(tau:number):V3{
 if(tau<-.35){const a=tau*1.7;return[DP[0]-.9+Math.min(0,tau+.35)*.55+.3*Math.max(0,Math.sin(a*3)),.11,DP[1]+.05];}
 if(tau<T3P){const u=(tau+.35)/.35;return[lerp(DP[0]-.9,DP[0]-.35,u),.11,DP[1]+.05];}
 if(tau<T3I){const u=(tau-T3P)/(T3I-T3P);return[lerp(DP[0]-.35,DI[0],u),.11,lerp(DP[1]+.05,DI[1],u)];}
 // stolen: a touch away, then carried at his feet on the run toward the far goal (−x)
 const q=cai3(tau).place,yaw=q.yaw??0,dx=Math.cos(-yaw),dz=Math.sin(-yaw),k=.5+.25*Math.abs(Math.sin((tau-T3I)*4.5)),u=sm(T3I,T3I+.3,tau);
 return[lerp(DI[0],(q.x??0)+dx*k,u),.11+.2*Math.sin(Math.PI*clamp((tau-T3I)/.3)),lerp(DI[1],(q.z??0)+dz*k,u)];
}
const GO_KEYS:MKey[]=[[T3I,DI[0]+.35,DI[1]-1.05],[T3I+.5,DI[0]-.6,DI[1]-.3],[T3I+2.6,DI[0]-11,DI[1]+3.5]];
function passer3(tau:number):{pose:Pose;place:Place}{
 const x=tau<-.35?DP[0]-1.6+Math.min(0,tau+.35)*.55:DP[0]-1.05,pl:Place={x:Math.max(-4,x),z:DP[1],yaw:0};
 let p=tau<-.35?dribble(tau*1.4,{speed:.25}):stand();
 // the eyes turn to the team-mate first, then the hips open
 const eyes=sm(-2.35,-2.0,tau),hips=sm(-1.6,-1.2,tau);
 pl.yaw=lerpAng(0,LANE*-1,hips*.85);
 p=headTo(p,pl,DR[0],DR[1],eyes,-4);
 if(tau>-.6){p=blendPose(p,strike(clamp(STRIKE_CONTACT+(tau-T3P)/1.0),{power:.4}),sm(-.6,-.45,tau)*(1-sm(.5,1,tau)));pl.yaw=-LANE;}
 if(tau>T3I+.2)p=headTo(p,pl,ball3(tau)[0],ball3(tau)[2],sm(T3I+.2,T3I+.6,tau),0);
 return{pose:p,place:pl};}
function recv3(tau:number):{pose:Pose;place:Place}{const pl:Place={x:DR[0],z:DR[1],yaw:yawTo(DR[0],DR[1],DP[0],DP[1])};let p=stand();
 if(tau>-.3&&tau<T3I+.4)p=blendPose(p,posed({lShA:40,rShA:20,lShF:40,lElb:30,lean:10,lHipF:20,lKnee:24,rKnee:20}),sm(-.3,0,tau)*(1-sm(T3I,T3I+.4,tau)));
 if(tau>T3I+.1){p=blendPose(p,runCycle((tau-T3I)*1.6,{speed:.5}),sm(T3I+.1,T3I+.5,tau));pl.x=DR[0]-Math.max(0,tau-T3I-.2)*3.2;pl.z=DR[1]-Math.max(0,tau-T3I-.2)*.6;pl.yaw=yawTo(0,0,-1,-.2);}
 return{pose:headTo(p,pl,ball3(tau)[0],ball3(tau)[2],1,0),place:pl};}
function cai3(tau:number):{pose:Pose;place:Place}{
 if(tau<T3I+.05){const r=runner(C3_KEYS,tau,[DP[0],DP[1]]);let p=r.pose;
  // reading: low, on his toes, eyes on the passer's hips and face
  p=blendPose(p,posed({lean:22,lHipF:30,rHipF:26,lKnee:40,rKnee:38,lShA:22,rShA:22,lElb:40,rElb:40,neckP:-6}),(1-sm(-.25,0,tau))*.7);
  const lu=clamp((tau-(T3I-.54))/.9);if(lu>0){p=blendPose(p,lunge(lu,{side:'l'}),Math.sin(Math.PI*Math.min(lu,.6)/1.2));r.place.yaw=yawTo(r.place.x??0,r.place.z??0,DP[0]-2,DP[1]+2);}
  return{pose:headTo(p,r.place,DP[0],DP[1],1,4),place:r.place};}
 const q=pathPos(GO_KEYS,tau),v=Math.hypot(q.vx,q.vz),dr=dribble((tau-T3I)*2.2,{speed:clamp(v/6)}),p=blendPose(lunge(.6,{side:'l'}),dr,sm(T3I+.05,T3I+.35,tau));
 return{pose:p,place:{x:q.x,z:q.z,yaw:lerpAng(yawTo(0,0,DP[0]-2,DP[1]+2),Math.atan2(-q.vz,q.vx),sm(T3I,T3I+.4,tau))}};}
const tau3=(t:number)=>key(t,mono([[0,-3.6],[CUE(2,'How he does it'),-3.4],[CUE(2,"watch the passer's eyes"),-2.5],[CUE(2,'and hips'),-1.75],[CUE(2,'They point'),-1.2],[CUE(2,'Guess the pass'),-.7],[CUE(2,'step in')+.05,-.25],[CUE(2,'steal it')+.1,T3I],[CUE(2,'then go'),T3I+.45],[SECS(2),T3I+2.6]]),linear);
/** a training ground: grass to a line of trees under a pale sky, a few cones */
const CONES:[number,number][]=[[-6,-6],[-2,-6],[2,-6],[6,-6],[10,-6],[14,-6],[-6,12],[14,12]];
function training(s:Sheet,c:Cam){
 s.field(B,.2,.4);
 const gp=polyP(c,[[-60,0,-38],[60,0,-38],[60,0,40],[-60,0,40]]);
 if(gp.length>2){const g=polyPath(gp,true);s.knockout(g);s.fill(Y,g,.95);s.tone(B,g,.6);}
 const trees=new Path2D();for(let i=0;i<30;i++){const x=-60+i*4.2,h=7+4*hash(i,3),p:V3[]=[];for(let k=0;k<10;k++){const a=k/10*TAU;p.push([x+Math.cos(a)*3.4,h*.5+Math.sin(a)*h*.5,40+Math.sin(a*2)*.5]);}addPoly(trees,polyP(c,p));}
 s.knockout(trees);s.fill(K,trees,.55);s.tone(B,trees,.55);
 const st=new Path2D();for(let x=-60;x<60;x+=8)addPoly(st,polyP(c,[[x,0,-38],[x+4,0,-38],[x+4,0,40],[x,0,40]]));s.tone(B,st,.16);
 const cn=new Path2D();for(const[x,z] of CONES)addPoly(cn,polyP(c,[[x-.18,0,z],[x+.18,0,z],[x,.32,z]]));s.knockout(cn);s.fill(R,cn,.95);s.fill(Y,cn,.5);
}
/** a projected arrow (shaft + head) along 3D points */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1,gaps?:[number,number][]){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8,gaps});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
function cam3v(t:number):Cam{
 const tau=tau3(t),tG=CUE(2,'then go');
 return plan(t,[
  [0,0,()=>({P:[3,6.2,-17.5],T:[4.6,.9,2.4],fov:27})],
  [CUE(2,"watch the passer's eyes")-.2,1,()=>({P:[1.5,3.2,-9],T:[-.6,1.3,.2],fov:30})],
  [CUE(2,'They point')-.1,1,()=>({P:[3.5,6,-15],T:[5,.8,2.8],fov:27})],
  [CUE(2,'step in')-.3,.8,()=>({P:[5.5,3.6,-9.5],T:[DI[0],.8,DI[1]],fov:24})],
  [tG-.1,1.4,()=>({P:[2,6,-16],T:mix3([DI[0],1,DI[1]],at3(cai3(tau).place,1),.7),fov:30})],
 ]);
}
function drawDemo(s:Sheet,c:Cam,tau:number,tp:number,tpp:number,smear:boolean){
 const items:{d:number;draw:()=>void}[]=[];
 const add=(f:(x:number)=>{pose:Pose;place:Place},st:AthleteStyle,sm2=false)=>{const cur=f(tp),d=toCam(c,at3(cur.place,.9))[2];if(d<1)return;items.push({d,draw:()=>drawPlayer(s,cur.pose,c,st,cur.place,f(tpp),sm2)});};
 add(passer3,PASSER_ST,smear&&tp>-.3&&tp<.2);add(recv3,RECV_ST);add(cai3,CAI3_ST,smear&&tp>-.2&&tp<T3I+.3);
 const bp=ball3(tau),bq=toCam(c,bp);if(bq[2]>NEAR)items.push({d:bq[2],draw:()=>{drawBallAt(s,c,bp,tau*4,{min:12});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12);
  const tE=CUE(2,"watch the passer's eyes"),tH=CUE(2,'and hips'),tP=CUE(2,'They point'),tW=CUE(2,'will go'),tG=CUE(2,'Guess the pass'),tS=CUE(2,'step in'),tL=CUE(2,'steal it'),tO=CUE(2,'then go');
  training(s,c);
  // "will go" / "Guess the pass": the dashed yellow lane from the ball to the team-mate, then a ring where it can be stolen
  const lane=sm(tW-.2,tW+.4,t,easeOut)*(1-sm(tL+.2,tL+.7,t));
  if(lane>.02){const a:V3=[DP[0]-.35,.03,DP[1]+.05],b:V3=[DR[0],.03,DR[1]],pts:V3[]=[];for(let i=0;i<=8;i++)pts.push(mix3(a,mix3(a,b,lane),i/8));const gaps:[number,number][]=[];for(let x=.06;x<1;x+=.14)gaps.push([x,x+.06]);arrow3(s,c,pts,Math.max(7,kAt(c,[5,0,3])*.09),Y,.95,gaps);}
  const gr=sm(tG,tG+.4,t,easeOutBack)*(1-sm(tL,tL+.4,t));
  if(gr>.02){const ring=ringPts(c,DI[0],DI[1],.9*gr,32);if(ring.length>24){const rr=ribbon(ring,Math.max(5,kAt(c,[DI[0],0,DI[1]])*.14),{close:true,seed:43,taper:0,wobble:1});s.knockout(rr,.9);s.fill(Y,rr,.95);}}
  // "step in": a red arrow from Caicedo into the lane
  const st=sm(tS-.2,tS+.2,t,easeOut)*(1-sm(tL,tL+.3,t));
  if(st>.02){const cp=cai3(Math.min(tp,-.6)).place,a:V3=[cp.x??0,.05,cp.z??0],b:V3=[DI[0]+.2,.05,DI[1]-.4];arrow3(s,c,[a,mix3(a,b,st*.5),mix3(a,b,st)],Math.max(7,kAt(c,a)*.08),R,.95);}
  drawDemo(s,c,tau,tp,tpp,true);
  // "watch the passer's eyes": a red ring round his head and a dashed sight line to his team-mate
  const ey=sm(tE,tE+.4,t,easeOut)*(1-sm(tW,tW+.4,t));
  if(ey>.02){const pp=passer3(tp),sk=solve(pp.pose,PASSER_ST.build,pp.place),eye=add3(sk.face,[0,.02,0]),tgt:V3=[DR[0],1.6,DR[1]];
   const a=pr(c,eye),bb=pr(c,mix3(eye,tgt,ey*.8));if(a&&bb){const gaps:[number,number][]=[];for(let i=0;i<9;i++)gaps.push([(i+.6)/9.4,(i+.95)/9.4]);const w=Math.max(9,kAt(c,eye)*.05),rb=ribbon([a,bb],w,{seed:13,taper:.25,wobble:.5,gaps});s.knockout(ribbon([a,bb],w*1.7,{seed:13,taper:.25,wobble:.5,gaps}),.9);s.fill(R,rb,.95);s.stroke(K,rb,Math.max(2,w*.14),.85);}
   const hr=kAt(c,sk.head)*.24;const hp=pr(c,sk.head);if(hp){const pts:Pt[]=[];for(let i=0;i<24;i++){const a2=i/24*TAU;pts.push([hp[0]+Math.cos(a2)*hr,hp[1]+Math.sin(a2)*hr]);}const rr=ribbon(pts,Math.max(4,hr*.14),{close:true,taper:0,wobble:.8,seed:5});s.knockout(rr,.9);s.fill(R,rr,.95);}}
  // "and hips": a yellow arrow on the ground from his hips, pointing where they face
  const hp2=sm(tH,tH+.4,t,easeOut)*(1-sm(tW,tW+.5,t));
  if(hp2>.02){const pp=passer3(tp),x=pp.place.x??0,z=pp.place.z??0,yaw=pp.place.yaw??0,d:[number,number]=[Math.cos(-yaw),Math.sin(-yaw)],a:V3=[x+d[0]*.5,.04,z+d[1]*.5],b:V3=[x+d[0]*(.5+3.2*hp2),.04,z+d[1]*(.5+3.2*hp2)];arrow3(s,c,[a,mix3(a,b,.5),b],Math.max(8,kAt(c,a)*.1),Y,.95);}
  // "They point": both marks pulse together (the eyes and hips agree)
  if(t>tP-.1&&t<tP+.6){const pp=passer3(tp),p=pr(c,at3(pp.place,1.1));if(p)sparkBurst(s,Y,p[0],p[1],Math.max(40,kAt(c,at3(pp.place,1))*.9)*sm(tP-.1,tP+.2,t,easeOut),{n:8,seed:17,g:1-sm(tP+.2,tP+.6,t),width:7});}
  // "steal it": a spark at his boot as he takes it
  if(tp>T3I-.06&&tp<T3I+.35){const P:V3=[DI[0],.2,DI[1]],p=pr(c,P);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(55,kAt(c,P)*.5)*sm(T3I-.06,T3I+.08,tp,easeOut),{n:9,seed:61,g:1-sm(T3I+.12,T3I+.35,tp),width:Math.max(6,kAt(c,P)*.035)});}
  // "then go": speed lines off the carry
  if(t>tO-.1){const q=cai3(tp).place,p=pr(c,at3(q,.9)),yaw=q.yaw??0;if(p){const f=pr(c,[(q.x??0)+Math.cos(-yaw)*2,.9,(q.z??0)+Math.sin(-yaw)*2]);if(f)speedLines(s,K,p[0],p[1],Math.atan2(p[1]-f[1],p[0]-f[0]),{n:4,seed:9,len:Math.max(60,kAt(c,at3(q,1))*1.1),spread:kAt(c,at3(q,1))*.5,width:4,cov:.7*sm(tO-.1,tO+.3,t)});}}
 },
 still:9,
};

const film:RisoStory={
 id:'caicedo-signature',format:'11v11',title:"Moisés Caicedo: the steal and go",
 theme:"Watch the passer's eyes and hips to guess the pass, then step in, steal it and go",
 ageNote:'Chelsea 2–1 Bournemouth, Premier League, Stamford Bridge, London, 19 May 2024: his first Chelsea goal, from just inside Bournemouth\'s half. Chapter 3 is a training demonstration.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a quick steal — a short yellow lane is cut by a red dash and a ball darts off. Reduced motion: the still mark. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.6)),fade=age<=0?1:1-clamp((age-.6)/.2),r=rng(seed);
  const gaps:[number,number][]=[];for(let g=.05;g<1;g+=.16)gaps.push([g,g+.07]);
  s.fill(Y,ribbon([[x-150,y+60],[x+150,y-60]],12,{seed,taper:.3,wobble:1,gaps}),.9*fade);
  const e:Pt=[x+lerp(0,-170,u),y+lerp(0,-40,u)];
  s.fill(R,ribbon([[x+40,y+90],[x,y],[e[0],e[1]]],14,{seed:seed+1,taper:.6,pressure:.3,wobble:1}),.9*fade);
  if(age>0&&age<.3)sparkBurst(s,Y,x,y,80,{n:8,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,e[0],e[1],28,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
