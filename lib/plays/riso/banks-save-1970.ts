/** Iconic-play film · Gordon Banks, "the save of the century" — England v Brazil, World Cup group match, 7 June 1970, Estadio Jalisco, Guadalajara.
 *
 * A faithful recreation of the broadcast rendered as a riso print: one 3D choreography in pitch metres (X along the pitch to England's goal
 * line at X=105, Z across from the near touchline, Y up) seen through TV cameras — 1 live, the high main camera on the side (Carlos Alberto →
 * Jairzinho → beats Terry Cooper → cross from the right byline), 2 live, a high camera behind the goal (Pelé over Mullery, the header down,
 * the bounce, Banks across from the near post, right hand, over the bar), 3 a TV slow-motion replay from a low reverse angle, 4 the lesson
 * (the only chapter with teaching marks: footprints, the dive stamped, the rescue arc). No overlays inside the footage chapters.
 *
 * Sources (read 23 Sep 2026 through web-search summaries):
 *  - SI, "Anatomy of a Save" (2019): https://www.si.com/soccer/2019/02/12/anatomy-save-gordon-banks-world-famous-stop-pele-1970-world-cup
 *  - FIFA, "Brilliant Banks denies Pele header": https://inside.fifa.com/news/brilliant-banks-denies-pele-header-2842873
 *  - FIFA, "Brazil 1-0 England | Mexico 1970": https://www.fifa.com/en/tournaments/mens/worldcup/articles/brazil-england-mexico-1970
 *  - Football Bloody Hell, "Mexico 70 and that save" (2023): https://footballbh.net/2023/08/23/mexico-70-1970-world-cup-banks-save-pele/
 *  - Scroll.in, "Pause, rewind, play": https://scroll.in/field/996899/pause-rewind-play-the-scarcely-believable-gordon-banks-save-from-peles-header-at-1970-world-cup
 *  - 17lawsguy, "Gordon Banks and the Save That Stopped Pelé": https://17lawsguy.substack.com/p/gordon-banks-and-the-save-that-stopped
 *  - England Football Online, match 446: http://www.englandfootballonline.com/Seas1960-70/1969-70/M0446Bra1970.html
 *  - Museum of Jerseys, 1970 kit tracker group 3: https://museumofjerseys.com/2018/05/19/1970-world-cup-kit-tracker-group-3/
 *  - Historical Football Kits, 1970 group 3: https://www.historicalkits.co.uk/international/tournaments/fifa-world-cup/1970/1970-group-3.html
 *  - Budds, "Gordon Banks' save of the century shirt: the blue jersey": https://www.budds.com/news-blog/2026/06/gordon-banks-save-of-the-century-shirt-the-blue-jersey-from-the-day-england-met-the-future
 * Confirmed by those accounts: about the 10th minute; Carlos Alberto's pass into Jairzinho's stride down the right; Jairzinho beats Terry
 * Cooper, reaches the byline and crosses to the back post; Pelé leaps over Mullery and heads hard down toward Banks's right-hand corner; the
 * ball bounces about two yards in front of the line; Banks, who started near his left (near) post, gets across, dives, and with the fingers
 * of his right hand scoops the rising ball over the bar; Pelé shouted "Gol"; England wore all white, Banks a blue change shirt; Brazil yellow
 * shirts and blue shorts.
 * Inferred (not in the accounts): every other player's position, all paths and timings, the camera placements and lenses, Banks's shorts,
 * glove and hair colour, where the pass was struck, Pelé's arm gesture, where the ball landed behind the goal.
 *
 * Figures are articulated riso cut-outs (hip/knee/ankle, shoulder/elbow, head) printed with knockouts, halftone form shading and a navy
 * silhouette line; distant players share one batch pass. The camera frames the whole sheet (never sheet.safe), for card windows from 1.45:1
 * to square. Actions are timed from the chapter cues so real narration timings re-time the drawing. Scenes read only their local time t. */
import {withTiming,type NarrationTiming} from './timing';
import timing from '../../../public/plays/narration/banks-save-1970/timing.json';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,key,keyPath,easeOut,easeIn,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,partial,smoothPts,type Pt,type Ease} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,runCycle,stand,strike,header,keeperSet,keeperDive,lunge,celebrate,STRIKE_CONTACT,type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

const K='navy',Y='yellow',O='orange',B='blue';
/** Cue onsets of chapter i (seconds). */
const Q=(i:number)=>film.chapters[i].cues.map(c=>c.at);
/** Piecewise-linear map from chapter time to play time (anchors kept increasing). */
function warp(t:number,A:[number,number][]){const a:[number,number][]=[];for(const p of A)if(!a.length||(p[0]>a[a.length-1][0]+.05&&p[1]>=a[a.length-1][1]))a.push(p);
 if(t<=a[0][0])return a[0][1];for(let i=1;i<a.length;i++)if(t<=a[i][0])return a[i-1][1]+(a[i][1]-a[i-1][1])*(t-a[i-1][0])/(a[i][0]-a[i-1][0]);const n=a.length-1;return a[n][1]+(t-a[n][0])*(n?(a[n][1]-a[n-1][1])/(a[n][0]-a[n-1][0]):1);}
/** Consistent winding so overlapping parts of one figure union cleanly under the nonzero rule. */
function orient(p:Pt[]):Pt[]{let a=0;for(let i=0;i<p.length;i++){const q=p[i],r=p[(i+1)%p.length];a+=q[0]*r[1]-r[0]*q[1];}return a<0?p.slice().reverse():p;}
const shape=(p:Pt[])=>polyPath(orient(p),true);

// ---------------- camera: the whole frame ----------------
/** Screen (x,y) → the centre of the canvas; ~1500 × 1030 units visible (the card window is 1.45:1 to square). Compensates camera()'s safe-centre aim and fit. */
function frame(s:Sheet,x=0,y=0,z=1){const base=z*Math.min(s.W/1500,s.H/1030),a=Math.round(s.arrival*1e6)/1e6,k=base*a,q=(v:number)=>Math.round(v*1e4)/1e4;s.camera(q(x-(s.W/2-s.cx)/k),q(y-(s.H/2-s.cy)/k),base/s.fit,0);}

// ---------------- 3D: pitch metres → screen through a TV camera ----------------
type V3=[number,number,number];
type Cam={pos:V3;yaw:number;tilt:number;F:number};
function camAt(pos:V3,target:V3,F:number):Cam{const dx=target[0]-pos[0],dz=target[2]-pos[2];return{pos,yaw:Math.atan2(dx,dz),tilt:Math.atan2(pos[1]-target[1],Math.hypot(dx,dz)),F};}
/** camera space: [right, up, depth] */
function toCam(v:V3,c:Cam):V3{const dx=v[0]-c.pos[0],dy=v[1]-c.pos[1],dz=v[2]-c.pos[2],cy=Math.cos(c.yaw),sy=Math.sin(c.yaw),x1=dx*cy-dz*sy,z1=dx*sy+dz*cy,ct=Math.cos(c.tilt),st=Math.sin(c.tilt);return[x1,dy*ct+z1*st,z1*ct-dy*st];}
/** screen x, y and scale (units per metre); scale ≤ 0 means behind the camera */
function P3(v:V3,c:Cam):[number,number,number]{const q=toCam(v,c);if(q[2]<.3)return[0,0,0];const k=c.F/q[2];return[q[0]*k,-q[1]*k,k];}
const NEAR=.6;
/** A 3D polygon clipped at the near plane and projected. */
function projPoly(pts:V3[],c:Cam):Pt[]{const cs=pts.map(p=>toCam(p,c)),out:V3[]=[];
 for(let i=0;i<cs.length;i++){const a=cs[i],b=cs[(i+1)%cs.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const u=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,NEAR]);}}
 return out.map(q=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]]);}
function addPoly(p:Path2D,pts:V3[],c:Cam){const q=projPoly(pts,c);if(q.length>2)p.addPath(shape(q));}
/** A painted line on the grass from a to b (x,z), w metres wide. */
function groundLine(p:Path2D,a:[number,number],b:[number,number],c:Cam,w=.13){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2;addPoly(p,[[a[0]+nx,.01,a[1]+nz],[b[0]+nx,.01,b[1]+nz],[b[0]-nx,.01,b[1]-nz],[a[0]-nx,.01,a[1]-nz]],c);}
function groundArc(p:Path2D,cx:number,cz:number,r:number,a0:number,a1:number,c:Cam,n=16){for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;groundLine(p,[cx+Math.cos(u0)*r,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,cz+Math.sin(u1)*r],c,Math.max(.13,r*.02));}}
const onScreen=(q:[number,number,number])=>q[2]>0&&Math.abs(q[0])<2600&&Math.abs(q[1])<2200;

// ---------------- the stadium in 3D: stands with crowd tiers, grass, stripes, markings, the goal ----------------
type Stand={a:[number,number];b:[number,number];out:[number,number]};
const STANDS:Stand[]=[
 {a:[-12,75],b:[117,75],out:[0,1]},    // far side
 {a:[112,-10],b:[112,78],out:[1,0]},   // behind England's goal
 {a:[-12,-7],b:[117,-7],out:[0,-1]},   // main stand (the side camera sits in it)
 {a:[-7,-10],b:[-7,78],out:[-1,0]},    // the far end
];
const TIER_INK:[string,number][]=[[O,.32],[B,.2],[Y,.32],[O,.2],[K,.2],[B,.32],[O,.45],[Y,.2]];
function stadium(s:Sheet,c:Cam,bounce=0){
 const concrete=new Path2D(),wall=new Path2D(),tiers=TIER_INK.map(()=>new Path2D());
 for(const st of STANDS){const P=(u:number,d:number,y:number):V3=>[lerp(st.a[0],st.b[0],u)+st.out[0]*d,y,lerp(st.a[1],st.b[1],u)+st.out[1]*d];
  addPoly(concrete,[P(0,0,1.2),P(1,0,1.2),P(1,44,1.2+44*.55),P(0,44,1.2+44*.55)],c);
  addPoly(wall,[P(0,0,0),P(1,0,0),P(1,0,1.1),P(0,0,1.1)],c);
  const segs=16;for(let k=0;k<26;k++){const d0=1+k*1.62,d1=d0+1.28,lift=bounce*(k%2?.25:.45),y0=1.2+d0*.55+lift,y1=1.2+d1*.55+lift;
   for(let g=0;g<segs;g++){const u0=g/segs,u1=(g+1)/segs;addPoly(tiers[(k*3+g*5+(st.out[0]?2:0))%TIER_INK.length],[P(u0,d0,y0),P(u1,d0,y0),P(u1,d1,y1),P(u0,d1,y1)],c);}}}
 s.fill(Y,concrete,.2);
 TIER_INK.forEach(([ink,cov],i)=>s.fill(ink,tiers[i],cov));
 s.fill(O,wall,.32);s.fill(Y,wall,.6);s.stroke(K,wall,Math.max(2,.05*P3([100,0,34],c)[2]),.6);
 const grass=new Path2D();addPoly(grass,[[-7,0,-7],[112,0,-7],[112,0,75],[-7,0,75]],c);s.fill(Y,grass,.6);s.fill(B,grass,.45);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(B,stripes,.2);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);{const d:V3[]=[];for(let i=0;i<10;i++){const a=i/10*TAU;d.push([gx+dir*11+Math.cos(a)*.14,.01,34+Math.sin(a)*.14]);}addPoly(ln,d,c);}}
 s.knockout(ln,.92);
 for(const z of[0,68]){const a=P3([105,0,z],c),b=P3([105,1.5,z],c);if(a[2]<=0||b[2]<=0||!onScreen(a))continue;const f=P3([105,1.42,z+(z?-.5:.5)],c),g=P3([105,1.15,z],c);
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[g[0],g[1]]]);s.knockout(fl);s.fill(O,fl);}
}
const GOAL={x:105,z0:30.34,z1:37.66,h:2.44,back:107,backH:2.0};
/** England's goal: white posts and bar, a net (paper haze + navy mesh) back to the stanchions. */
function goal(s:Sheet,c:Cam){
 const g=GOAL,net=new Path2D();
 addPoly(net,[[g.x,0,g.z0],[g.back,0,g.z0],[g.back,g.backH,g.z0],[g.x,g.h,g.z0]],c);addPoly(net,[[g.x,0,g.z1],[g.back,0,g.z1],[g.back,g.backH,g.z1],[g.x,g.h,g.z1]],c);
 addPoly(net,[[g.back,0,g.z0],[g.back,0,g.z1],[g.back,g.backH,g.z1],[g.back,g.backH,g.z0]],c);addPoly(net,[[g.x,g.h,g.z0],[g.x,g.h,g.z1],[g.back,g.backH,g.z1],[g.back,g.backH,g.z0]],c);
 s.knockout(net,.32);
 const k0=P3([g.x,1,34],c)[2],sp=Math.max(.36,34/Math.max(1,k0));// the mesh never prints tighter than ~34 units (no moiré in a small card)
 const mesh=new Path2D(),seg=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);if(p[2]<=0||q[2]<=0)return;mesh.moveTo(p[0],p[1]);mesh.lineTo(q[0],q[1]);};
 for(let z=g.z0;z<=g.z1+.01;z+=sp){seg([g.back,0,z],[g.back,g.backH,z]);seg([g.x,g.h,z],[g.back,g.backH,z]);}
 for(let y=0;y<=g.backH+.01;y+=sp){seg([g.back,y,g.z0],[g.back,y,g.z1]);for(const z of[g.z0,g.z1])seg([g.x,y*g.h/g.backH,z],[g.back,y,z]);}
 for(let x=g.x;x<=g.back+.01;x+=sp)for(const z of[g.z0,g.z1])seg([x,0,z],[x,lerp(g.h,g.backH,(x-g.x)/(g.back-g.x)),z]);
 s.stroke(K,mesh,Math.max(1.5,.012*k0),.45);
 const post=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);return ribbon([[p[0],p[1]],[q[0],q[1]]],Math.max(5,.12*(p[2]+q[2])/2),{seed:9,taper:0,wobble:.4,pressure:.1});};
 const fr=new Path2D();fr.addPath(post([g.x,0,g.z0],[g.x,g.h,g.z0]));fr.addPath(post([g.x,0,g.z1],[g.x,g.h,g.z1]));fr.addPath(post([g.x,g.h,g.z0-.06],[g.x,g.h,g.z1+.06]));
 s.knockout(fr);s.stroke(K,fr,Math.max(2.5,.02*k0),.95);
 const stan=new Path2D();for(const z of[g.z0,g.z1]){const a=P3([g.back,0,z],c),b=P3([g.back,g.backH,z],c),d=P3([g.x,g.h,z],c);if(a[2]>0&&b[2]>0&&d[2]>0){stan.moveTo(a[0],a[1]);stan.lineTo(b[0],b[1]);stan.lineTo(d[0],d[1]);}}
 s.stroke(K,stan,Math.max(2,.03*k0),.7);
}

// ---------------- figures: the shared athlete library (lib/plays/riso/athlete.ts) ----------------
/** athlete.ts is right-handed (y up); this film's pitch (X to England's goal, Z away from the main camera) is left-handed, so the adapter
 * negates z both ways — that keeps Banks's RIGHT hand on the far-post side, as the accounts say. */
function proj(c:Cam):Projector{const my=(p:V3):V3=>[p[0],p[1],-p[2]];
 return{eye:[c.pos[0],c.pos[1],-c.pos[2]],project(p){const q=toCam(my(p),c),d=Math.max(.05,q[2]);return[c.F*q[0]/d,-c.F*q[1]/d,d];},scale(p){return c.F/Math.max(.05,toCam(my(p),c)[2]);}};}
const toMy=(p:V3):V3=>[p[0],p[1],-p[2]];
/** a place on the pitch (my metres) facing heading h (my x,z) */
const placeOf=(x:number,z:number,h:[number,number]):Place=>({x,z:-z,yaw:Math.atan2(h[1],h[0])});
// skin: one flat screen + at most one light screen (athlete.ts guidance)
const LIGHT:InkFill[]=[[O,.2]],MID:InkFill[]=[[O,.75],[Y,.2]],DARK:InkFill[]=[[O,.88],[K,.2]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
const brazil=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,trim:[B,.6],shorts:B,socks:'paper',boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:[B,.6],scale:FIG,...o});
const england=(hair:number,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:'paper',shorts:'paper',socks:'paper',boots:K,skin:LIGHT,hair:[K,hair],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:K,scale:FIG,...o});
const BANKS:AthleteStyle={shirt:[B,.6],shorts:'paper',socks:'paper',boots:K,skin:LIGHT,hair:[K,.88],hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',number:1,numberInk:'paper',scale:FIG,seed:1};
/** the lesson's replay marks: a yellow silhouette of the same body */
const GHOST:AthleteStyle={shirt:[Y,.7],shorts:[Y,.7],socks:[Y,.7],boots:[Y,.7],skin:[[Y,.7]],hair:[Y,.7],gloves:[Y,.7],line:Y,shade:null,shadow:false,sleeves:'long',scale:FIG,seed:1};
type St={pose:Pose;place:Place};

// ---------------- the play (pitch metres; play seconds T, T=0 = Carlos Alberto on the ball) ----------------
type Track={id:string;style:AthleteStyle;keys:number[][]};
const TRACKS:Track[]=[
 {id:'carlos',style:brazil(MID,{number:4,seed:4}),keys:[[-4,45,15],[0,50.6,14],[.8,51.8,14.3],[3,54.5,16],[14,60,19]]},
 {id:'jair',style:brazil(DARK,{number:7,seed:7}),keys:[[-4,69,5.2],[0,73,4.6],[2.3,79.4,5.2],[3.1,84.3,5.9],[3.6,87.6,6.1],[5.3,101.9,6.6],[5.45,102.1,6.7],[6.5,103,7.5],[14,101.5,9]]},
 {id:'cooper',style:england(.75,{number:3,seed:3}),keys:[[-4,79,11],[0,80.6,10],[2.3,83,7.7],[3.1,84.5,6.9],[3.6,85.1,6.9],[4.4,88.6,7.4],[5.5,95.6,8.1],[7,99.2,9],[14,99.5,10]]},
 {id:'pele',style:brazil(DARK,{number:10,seed:10,build:{height:1.73,bulk:.95}}),keys:[[-4,75,31],[0,79,32],[3,87,34.5],[5.45,94.6,36.9],[5.95,96.9,37.4],[6.3,97.95,37.65],[6.65,98.25,37.8],[6.95,98.45,37.85],[8,99,37.3],[14,98.5,35]]},
 {id:'mullery',style:england(.88,{number:4,seed:14}),keys:[[-4,81,33],[0,83.6,33.2],[3,90,35.4],[5.45,95.6,37.5],[6.3,97.45,38.2],[6.75,97.7,38.3],[8,98.3,38.6],[14,98,38]]},
 // the rest of both teams: positions are illustrative (not in the accounts)
 {id:'b-f',style:brazil(LIGHT),keys:[[-4,79,24],[0,82.5,25],[5.45,96,29.4],[7,98.6,30.4],[14,98,31]]},
 {id:'e-cb1',style:england(.6),keys:[[-4,89,27],[0,91.5,27.2],[5.45,97.4,30],[7,99.4,31],[14,99,31]]},
 {id:'e-cb2',style:england(.75),keys:[[-4,88,41],[0,90.5,41],[5.45,97,42.3],[7,99,42.4],[14,98.5,42]]},
 {id:'e-rb',style:england(.6),keys:[[-4,85,57],[0,87.5,56],[5.45,95,51],[7,97,49.5],[14,97,49]]},
 {id:'e-m1',style:england(.88),keys:[[-4,69,40],[0,72.5,39],[5.45,84,38],[7,87,37],[14,88,37]]},
 {id:'e-m2',style:england(.6),keys:[[-4,65,24],[0,68.5,24],[5.45,80,25],[7,83,26],[14,84,27]]},
 {id:'b-m1',style:brazil(LIGHT),keys:[[-4,67,45],[0,71.5,46],[5.45,86,49],[7,89,48],[14,90,47]]},
 {id:'b-m2',style:brazil(MID),keys:[[-4,57,34],[0,60.5,35],[5.45,70,36],[7,73,36],[14,75,36]]},
 {id:'b-w',style:brazil(LIGHT),keys:[[-4,72,58],[0,75.5,58],[5.45,88,58],[7,91,56],[14,92,55]]},
];
const BANKS_KEYS=[[-4,103.2,34],[3,103.8,32.4],[5.3,104.25,31.0],[5.6,104.25,31.0],[6.72,104.2,35.0]];
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-4);for(let t=-3.8;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const CROSS_FROM:V3=[102.75,.11,6.85];
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
/** The ball in 3D at play time T: at Carlos Alberto's feet, the pass, Jairzinho's dribble (knocked past Cooper), the cross, the header down,
 * the bounce about two yards out, up to Banks's fingers, over the bar, behind the goal. */
function ballAt(T:number):V3{
 const ahead=(k:number[][],t:number,lead:number):V3=>{const p=trackAt(k,t),v=velAt(k,t),s=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/s*lead,.11,p[1]+v[1]/s*lead];};
 const car=TRACKS[0].keys,jr=TRACKS[1].keys;
 if(T<.8)return ahead(car,T,.7);
 if(T<2.3)return lerp3(ahead(car,.8,.7),ahead(jr,2.3,.8),sm(.8,2.3,T,u=>u*(1.3-.3*u)),1.8);
 if(T<5.3)return ahead(jr,T,key(T,[[2.3,.8],[3.1,.8],[3.35,3.2],[4.1,1.0],[5.3,.85]])+.18*Math.sin(T*9));
 if(T<5.45)return CROSS_FROM;
 if(T<6.65)return lerp3(CROSS_FROM,HEAD_PT,sm(5.45,6.65,T,linear),5.2);
 if(T<6.95)return lerp3(HEAD_PT,BOUNCE,sm(6.65,6.95,T,u=>u*(1.15-.15*u)));
 if(T<7.08)return lerp3(BOUNCE,HAND,sm(6.95,7.08,T,linear),.1);
 if(T<7.9)return lerp3(HAND,LANDS,sm(7.08,7.9,T,linear),3.8);
 const u=sm(7.9,9.4,T,easeOut);return[lerp(LANDS[0],109.8,u),.11+.5*Math.abs(Math.sin(u*Math.PI))*(1-u),lerp(LANDS[2],38.4,u)];
}

// ---------------- the players at play time T (poses from athlete.ts generators; contacts solved in 3D) ----------------
const win=(T:number,a:number,b:number,e=.15)=>sm(a,a+e,T)*(1-sm(b-e,b,T));
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
/** running / jogging / standing along a track; faces its run, or the ball when (nearly) still, or a fixed heading */
function runState(k:number[][],T:number,face?:[number,number]):St{
 const p=trackAt(k,T),v=velAt(k,T),sp=Math.hypot(v[0],v[1]);let h:[number,number];
 if(face)h=face;else if(sp>.8)h=[v[0]/sp,v[1]/sp];else{const b=ballAt(T);h=nrm2(b[0]-p[0],b[2]-p[1]);}
 const run=runCycle(strideAt(k,T)*.9/4.3,{speed:clamp((sp-2)/6)});
 return{pose:blendPose(stand(),run,clamp((sp-.5)/1.8)),place:placeOf(p[0],p[1],h)};
}
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
const PELE_FACE=nrm2(105-98.25,37.0-37.8),MULLERY_FACE=nrm2(-.4,-1);
/** Jairzinho's right boot meets the ball at the cross (5.45): the body is nudged in 3D so the solved toe lands on CROSS_FROM */
let _jairShift:[number,number]|null=null;
function jairShift(){if(_jairShift)return _jairShift;const st=runState(TR('jair').keys,5.45),sk=solve(strike(STRIKE_CONTACT),TR('jair').style.build,st.place,FIG),toe=toMy(sk.rToe);return _jairShift=[CROSS_FROM[0]-toe[0],CROSS_FROM[2]-toe[2]];}
function stateOf(id:string,T:number):St{
 const tr=TR(id),k=tr.keys;
 if(id==='carlos'){const st=runState(k,T),w=win(T,.28,1.3);return w>0?{...st,pose:blendPose(st.pose,strike(clamp((T-.8)/1.0+STRIKE_CONTACT)),w)}:st;}
 if(id==='jair'){const st=runState(k,T),w=win(T,4.93,6.05);if(w<=0)return st;const d=jairShift(),ws=win(T,4.7,6.2,.4);
  return{pose:blendPose(st.pose,strike(clamp((T-5.45)/1.0+STRIKE_CONTACT)),w),place:{...st.place,x:st.place.x!+d[0]*ws,z:st.place.z!-d[1]*ws}};}
 if(id==='cooper'){const st=runState(k,T),w=win(T,3.05,3.95);return w>0?{...st,pose:blendPose(st.pose,lunge(clamp((T-3.05)/.9),{side:'l'}),w)}:st;}
 if(id==='pele'){const st=runState(k,T,T>5.8?PELE_FACE:undefined);if(T<6.04)return st;
  const hp=header(clamp((T-6.65)/1.17+.52));hp.air*=1.4;// Pelé out-jumps Mullery (his leap is the accounts' point)
  let pose=blendPose(st.pose,hp,sm(6.04,6.2,T));
  // "he shouts goal": both arms go up as he lands (the gesture is inferred), then he settles
  if(T>7.1)pose=blendPose(pose,celebrate(Math.min(.5,(T-7.1)*.7)),sm(7.1,7.4,T)*(1-sm(8.6,9.4,T)));
  if(T>8.6)pose=blendPose(pose,stand(),sm(8.6,9.4,T));
  return{pose,place:st.place};}
 if(id==='mullery'){const st=runState(k,T,T>5.9?MULLERY_FACE:undefined);if(T<6.14)return st;const hp=header(clamp((T-6.75)/1.17+.52));hp.air*=.6;
  return{pose:blendPose(blendPose(st.pose,hp,sm(6.14,6.3,T)),stand(),sm(7.3,7.8,T)),place:st.place};}
 return runState(k,T);
}
/** Banks: set at the near post, bouncing across his line, the dive to his right (full stretch at 7.08, right hand under the ball, a flick
 * of the wrist), down on the grass, back up, and (lesson plate) back toward the middle of his goal. Facing the field (−X). */
const DIVE=(t:number)=>keeperDive(clamp(t),{side:'r',height:.18}),DIVE_AT:[number,number]=[104.2,35.0],DIVE_DZ=DIVE(1).dz;
function banksState(T:number):St{
 if(T<6.72){const[x,z]=trackAt(BANKS_KEYS,T);return{pose:keeperSet(T<5.6?T*1.3:5.6*1.3+(T-5.6)*3.4),place:placeOf(x,z,[-1,0])};}
 let pose=DIVE((T-6.72)/.65);const f=sm(7.08,7.18,T)*(1-sm(7.25,7.5,T));pose={...pose,rShF:pose.rShF+.35*f};
 const up=sm(8.4,9.7,T,easeInOutSine);let z=DIVE_AT[1];
 if(up>0){pose=blendPose(pose,keeperSet(T*1.3),up);z+=DIVE_DZ*up;const back=sm(9.9,11.4,T,easeInOutSine);z=lerp(z,33.9,back);}
 return{pose,place:placeOf(DIVE_AT[0],z,[-1,0])};
}
// the contacts, solved once from the bodies: Banks's right fingertips (HAND), the bounce two yards out, Pelé's forehead (HEAD_PT)
const HAND:V3=(()=>{const sk=solve(DIVE(.55),BANKS.build,placeOf(DIVE_AT[0],DIVE_AT[1],[-1,0]),FIG),h=toMy(sk.rHa),e=toMy(sk.rEl),[dx,dz]=nrm2(h[0]-e[0],h[2]-e[2]);return[h[0]+dx*.1,Math.max(.35,h[1]),h[2]+dz*.1] as V3;})();
const BOUNCE:V3=[HAND[0]-1.25,.11,HAND[2]-.25],LANDS:V3=[107.6,.11,HAND[2]+.5];
const HEAD_PT:V3=(()=>{const st=stateOf('pele',6.65),sk=solve(st.pose,TR('pele').style.build,st.place,FIG),hd=toMy(sk.head),fc=toMy(sk.face),d=[fc[0]-hd[0],fc[1]-hd[1],fc[2]-hd[2]],l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*.11,fc[1]+d[1]/l*.11+.02,fc[2]+d[2]/l*.11] as V3;})();

type Item={depth:number;draw:()=>void};
const HEROES=['jair','cooper','pele','mullery','carlos','banks'];
/** Everything at play time T through camera c: the stadium, then players, keeper, ball and goal in depth order (far first).
 * detail 'low' for wide shots; otherwise heroes print at 'auto' (mid/high) and the rest at 'low'. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;bounce?:number;only?:string[];wide?:boolean}={}){
 stadium(s,c,o.bounce??0);
 const pc=proj(c),items:Item[]=[],ids=[...TRACKS.map(t=>t.id).filter(id=>!o.only||o.only.includes(id)),'banks'];
 for(const id of ids){const fn=(t:number)=>id==='banks'?banksState(t):stateOf(id,t),st=fn(T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g))continue;
  const style=id==='banks'?BANKS:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='pele'&&T>6.2&&T<6.95)||(id==='banks'&&T>6.75&&T<7.35)||(id==='jair'&&T>5.3&&T<5.75);
  items.push({depth:1/g[2],draw:()=>{const pr=fn(T-1/12);if(fast&&hero)motionSmear(s,pr.pose,st.pose,pc,sty,st.place,{prevPlace:pr.place,ink:[K,.35]});drawAthlete(s,st.pose,pc,sty,st.place,{prev:pr.pose,prevPlace:pr.place});}});}
 const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:T>6.9&&T<7.4?0:1/bq[2],draw:()=>{const h=Math.max(0,g[1]-bq[1]);s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:T*6,key:K,shadow:B,seed:3});}});}
 const gq=P3([106,1.2,34],c);if(gq[2]>0)items.push({depth:1/gq[2],draw:()=>goal(s,c)});
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------- chapters ----------------
const MAIN_CAM:V3=[52.5,24,-40];
const t1=(t:number)=>{const q=Q(0),S=film.chapters[0].seconds;return warp(t,[[0,-1.6],[q[1],0],[q[2],3.1],[S-1.05,5.45],[S,6.25]]);};
const cam1=(t:number)=>{const Tc=t1(t),bx=ballAt(Math.max(-1.6,Tc-.35))[0],est=1-sm(-1.6,-.2,Tc,easeInOutSine),tx=clamp(lerp(bx+5,99.5,sm(3.6,5.2,Tc,easeInOutSine)),58,99.5),tz=lerp(lerp(22,17,sm(3.6,5.2,Tc)),30,sm(5.45,6.25,Tc,easeInOutSine))+est*40,ty=est*9;
 return camAt(MAIN_CAM,[tx,ty,tz],lerp(4700,5600,sm(-.5,5.2,Tc,easeInOutSine)));};
/** 1 · live: the high main camera on the side, panning with Carlos Alberto's pass, Jairzinho's run past Cooper and the cross. */
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.2*p[2]),12);},
 get still(){return Q(0)[2]+.6;},
};
/** 2 · live: the high camera behind England's goal — the cross arrives, Pelé over Mullery, the header down, the bounce, Banks across, over the bar. */
const BEHIND:V3=[127,12.5,33.2];
const cam2=(t:number)=>{const T=5.95+t;return camAt(BEHIND,[101,.3,lerp(33.2,35.6,sm(5.95,6.9,T))],lerp(3500,3800,sm(7.5,10,T,easeInOutSine)));};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,5.95+twos(t),cam2(t),{ballScale:1.8});frame(s);},
 aperture(t){const p=P3([104.9,1.25,34],cam2(t));return apertureDisc(p[0],p[1],Math.max(10,.9*p[2]),12);},
 get still(){return .9;},
};
/** 3 · the TV slow-motion replay from a low reverse angle in front of the goal. */
const LOW:V3=[86.5,1.55,35.2];
const replayT=(t:number)=>{const q=Q(2),S=film.chapters[2].seconds;return warp(t,[[0,5.72],[q[1],6.1],[q[1]+1.8,6.65],[q[2]+.5,6.95],[q[3]+.3,7.08],[q[4],7.22],[S,7.5]]);};
const cam3=(t:number)=>{const T=replayT(t),q=Q(2);return camAt(LOW,[103.4,1.05,lerp(lerp(34.4,35.4,sm(5.72,6.7,T)),36.3,sm(6.95,7.1,T))],lerp(2900,3500,sm(0,q[3]+.3,t,easeInOutSine)));};
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,replayT(twos(t)),cam3(t),{ballScale:1.7});frame(s);},
 aperture(t){const p=P3(ballAt(replayT(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.12*p[2]),12);},
 get still(){return Q(2)[3]+.3;},
};
/** 4 · the lesson plate (not footage): the goal, Banks getting up, and bold yellow teaching marks — his shuffle's footprints light up in order
 * while a halftone Banks shuffles along them (move your feet), then the dive is stamped and the ball's rescue path printed from the bounce,
 * off his fingers, over the bar (never give up on a ball). */
const LESSON_CAM:V3=[92.5,1.45,34.2];
const cam4=(t:number)=>camAt(LESSON_CAM,[104.6,1.5,lerp(34.8,34.3,sm(0,8,t))],lerp(2050,2200,sm(0,8,t,easeInOutSine)));
const ch4:Scene={
 draw(s,t){
  const q=Q(3),tt=twos(t),cam=cam4(t);frame(s);
  // relief: sunlight bursting over the stand behind the goal (drawn first so it prints under everything)
  const rel=easeOutBack(sm(0,.6,t))*(1-.5*sm(2,3.2,t));
  drawPlay(s,7.9+tt*.62,cam,{ballScale:1.3,bounce:.6*Math.abs(Math.sin(t*6))*(1-sm(.3,2.6,t)),only:[]});
  if(rel>0){const c0=P3([118,26,34],cam),rays=new Path2D();for(let i=0;i<14;i++){const a=i/14*TAU+t*.1,w=.08,R=2600*rel;rays.addPath(shape([[c0[0],c0[1]],[c0[0]+Math.cos(a-w)*R,c0[1]+Math.sin(a-w)*R],[c0[0]+Math.cos(a+w)*R,c0[1]+Math.sin(a+w)*R]]));}
   const top=P3([112,1.1,34],cam)[1];s.save();s.clip(polyPath([[-9e4,-9e4],[9e4,-9e4],[9e4,top],[-9e4,top]],true));s.tone(Y,rays,.45);s.restore();}
  // "keep moving your feet": footprints light up in order while a halftone Banks shuffles along them again
  const walk=sm(q[1],q[1]+2.2,t,easeInOutSine),Tw=lerp(5.6,6.72,walk),dim=new Path2D(),lit=new Path2D();
  for(let k=0;k<8;k++){const Tk=5.66+k*.14,[x,z]=trackAt(BANKS_KEYS,Tk),zz=z+(k%2?.2:-.2),pts:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU,p=P3([x-.5+Math.cos(a)*.28,.01,zz+Math.sin(a)*.14],cam);pts.push([p[0],p[1]]);}(Tk<=Tw+.02?lit:dim).addPath(shape(pts));}
  if(t>=q[1]-.3){s.knockout(dim,.75);if(walk>0){s.stroke(K,lit,6,.9);s.knockout(lit);s.fill(Y,lit,.95);}
   if(walk>0&&walk<1&&t<q[2]){const g=banksState(Tw);drawAthlete(s,g.pose,proj(cam),GHOST,g.place);}}
  // "never give up on a ball": the dive stamped, then the ball's path from the bounce, off the fingers, over the bar, with an arrowhead
  const g=sm(q[2],q[2]+.35,t,easeOutBack),draw=sm(q[2]+.2,q[2]+1.4,t,easeInOutSine);
  if(g>.002){const d=banksState(7.08);drawAthlete(s,d.pose,proj(cam),GHOST,d.place);
   // a teaching arc (stylised, not the camera-true path, which is edge-on here): bounce → fingers → up and over the bar → down behind it
   const b0=P3(BOUNCE,cam),h0=P3(HAND,cam),bar=P3([GOAL.x,GOAL.h,HAND[2]],cam),back=P3([GOAL.back,GOAL.backH,HAND[2]-.9],cam),up=h0[1]-bar[1];
   const arcPts=smoothPts([[b0[0],b0[1]],[h0[0],h0[1]],[h0[0]+up*.15,bar[1]-up*.55],[h0[0]+up*.6,bar[1]-up*.75],[back[0]+up*.95,bar[1]-up*.1]],false,6,2);
   const hp=P3(HAND,cam),w=Math.max(10,.1*hp[2]),line=partial(arcPts,draw);
   if(line.length>1){const path=ribbon(line,w,{seed:9,taper:.2,wobble:1.2});s.stroke(K,path,5,.9);s.knockout(path);s.fill(Y,path,.95);
    if(draw>.97){const e=line[line.length-1],pr=line[line.length-3]??line[0],a=Math.atan2(e[1]-pr[1],e[0]-pr[0]),hl=w*2.6,head=shape([[e[0]+Math.cos(a)*hl*.6,e[1]+Math.sin(a)*hl*.6],[e[0]+Math.cos(a+2.4)*hl,e[1]+Math.sin(a+2.4)*hl],[e[0]+Math.cos(a-2.4)*hl,e[1]+Math.sin(a-2.4)*hl]]);s.stroke(K,head,5,.9);s.knockout(head);s.fill(Y,head,.95);}}
   const bp=P3(BOUNCE,cam),rr=.32*bp[2]*clamp(g),spot=shape(blob(bp[0],bp[1],rr,rr*.34,5,{n:16}));s.stroke(K,spot,5,.9);s.knockout(spot);s.fill(Y,spot,.95);
   sparkBurst(s,Y,hp[0],hp[1],.8*hp[2],{n:10,seed:61,g:clamp(g),width:.06*hp[2]});}
  frame(s);
 },
 get still(){return film.chapters[3].seconds*.85;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
/** Timings are estimates (≈2.6 words/s plus sentence pauses) until the shared Kokoro generator writes the audio; cue `at` values are the
 * estimated onsets of those exact words. Replace `seconds`, `at` and add `audio` from the generated alignment — the drawing follows the cues. */
const film:RisoStory={
 id:'banks-save-1970',format:'11v11',title:'The save of the century',theme:'Never give up on a ball',
 ageNote:'England v Brazil · World Cup, 7 June 1970 · Guadalajara, Mexico',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:withTiming([
  {label:'The cross',narration:'Mexico, 1970. England against Brazil. Carlos Alberto finds Jairzinho on the right. He beats Terry Cooper and crosses from the byline.',seconds:9.65,
   cues:[{at:0,words:'Mexico'},{at:2.5,words:'Carlos Alberto'},{at:5.5,words:'He beats Terry Cooper'},{at:7.4,words:'crosses from the byline'}]},
  {label:'The header',narration:'Pelé leaps over Alan Mullery and heads it down. He shouts, “Goal!” But Gordon Banks gets there!',seconds:8.05,
   cues:[{at:0,words:'Pelé leaps'},{at:2.3,words:'heads it down'},{at:3.8,words:'He shouts'},{at:5.2,words:'But Gordon Banks'}]},
  {label:'The replay',narration:'Watch again, slowly. Banks races across from the near post. The ball bounces up in front of him, and his right hand scoops it over the bar.',seconds:11.95,
   cues:[{at:0,words:'Watch again'},{at:1.45,words:'Banks races across'},{at:4.45,words:'The ball bounces up'},{at:8.05,words:'his right hand scoops'},{at:10,words:'over the bar'}]},
  {label:'The lesson',narration:'The save of the century! Keep moving your feet, and never give up on a ball.',seconds:8.2,
   cues:[{at:0,words:'The save of the century'},{at:2.3,words:'Keep moving your feet'},{at:4.45,words:'never give up'}]},
 ],timing as NarrationTiming),
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a little sun spark and a spray of grass flecks where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){
  const g=age>0?easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3)):1;if(g<=0)return;
  sparkBurst(s,Y,x,y,110,{n:9,seed,g,width:14});
  if(age>0)dust(s,null,x,y+14,30+110*easeOut(clamp(age/.6)),12,{seed:seed+1,size:10,cov:.9*(1-clamp(age/.8))});
 },
};
export default film;
/** Solved contact points (pitch metres; X to England's goal line at 105, Z across) — checked by tests/play-film-banks-save-1970.cjs. */
export const FACTS={HAND,BOUNCE,HEAD_PT,GOAL,ballAt,nearPost:GOAL.z0,farPost:GOAL.z1};
