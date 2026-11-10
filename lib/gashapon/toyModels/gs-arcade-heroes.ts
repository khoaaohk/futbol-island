/**
 * Cabinet Heroes (gs-arcade-heroes), rebuilt for round 3B batch 4 (Nov 9 2026; docs/gashapon-design.md "Round 3B"): characters from
 * the arcade games, from the machine on the Arcade's back wall. HD kit, each toy plays its planned KIND (lib/gashapon/toyKinds.ts):
 *   Striker Sparky   a wind-up footballer: pink spiky hair, a lightning-bolt kit, arms up in a goal celebration, a ball at his
 *                    feet, the key in his back (bonus: his big head bobbles on a spring)
 *   Breakaway Bolt   a bobblehead runner mid-stride on a running-track base: a visible spring neck, a cyan headband with flying
 *                    tails, speed streaks (bonus wind-up key in the base, not in the runtime yet: a poke sprints him)
 *   Tennis Tess      a squeezy felt tennis-ball pal: the real seam curve, a purple sweatband and ponytail (bonus: a mini football
 *                    on a ball chain from her hand)
 *   Flipper Finn     working parts: a mini Futbol Pinball cabinet; Finn is the flipper (pull him: he flicks and the steel ball
 *                    pops), pop bumpers, a goal at the top, a plunger to push (bonus: flick to spin)
 *   Puzzle Pip       take-apart: the goal tile, then the pass tile, then the ball tile slide out of his tummy tray, in order
 *                    (bonus: the click button on his head)
 *   Claw Club Bean   the rare: a glitter gold-and-teal secret capsule; inside, the bean buddy waving on the prize chute under the
 *                    claw that missed (the extra part) (bonus: squishy)
 * Model space: stands on y = 0, about 1 tall, front +z. Rows in lib/gashapon/toys.ts keep the words, links and voices.
 */
import * as T from 'three';
import type {Finish,ToyKit,ToyModelSet,V3} from '../toyKit';

const PI=Math.PI,INK='#1d2b24',WHITE='#ffffff',BLUSH='#ff9bb0',MOUTH='#7a2630',TONGUE='#ff7f96',GOLD='#e8c14a',STEEL='#c9ced6';
type Pt=readonly [number,number];
type Surf=(x:number,y:number)=>number;
/** A shape's outline as points (the closing duplicate dropped). */
function outline(sh:T.Shape,n:number):Pt[]{const p=sh.getSpacedPoints(n).map(q=>[q.x,q.y] as Pt);const a=p[0],b=p[p.length-1];if(Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6)p.pop();return p;}
const unit=(d:V3):V3=>{const l=Math.hypot(d[0],d[1],d[2])||1;return [d[0]/l,d[1]/l,d[2]/l];};
const eul=(q:T.Quaternion):V3=>{const e=new T.Euler().setFromQuaternion(q,'XYZ');return [e.x,e.y,e.z];};
/** Euler angles that turn +y onto the direction d. */
const upTo=(d:V3):V3=>eul(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(...unit(d))));
/** Euler angles for rotations applied in order, each about a MODEL axis. */
function qrot(...ops:readonly (readonly ['x'|'y'|'z',number])[]):V3{const q=new T.Quaternion(),t=new T.Quaternion(),ax={x:new T.Vector3(1,0,0),y:new T.Vector3(0,1,0),z:new T.Vector3(0,0,1)};
 for(const [a,ang] of ops){t.setFromAxisAngle(ax[a],ang);q.premultiply(t);}return eul(q);}
/** Turn +z onto n, after a feature's own rotation. */
const faceRot=(n:V3,extra:V3):V3=>eul(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),new T.Vector3(...unit(n))).multiply(new T.Quaternion().setFromEuler(new T.Euler(...extra))));
/** A straight rod (a round tube) between two model points, with optional ball joints. */
function rod(k:ToyKit,a:V3,b:V3,r:number,o:{part?:string;color:string;mat:Finish;seg?:number;joints?:boolean}){const d:V3=[b[0]-a[0],b[1]-a[1],b[2]-a[2]];
 k.cyl(r,r,Math.hypot(...d),{part:o.part,at:[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],rot:upTo(d),color:o.color,mat:o.mat,seg:o.seg??14});
 if(o.joints)for(const p of [a,b])k.sphere(r,{part:o.part,at:p,color:o.color,mat:o.mat,seg:14});}
/** A jointed limb through points (rods with ball joints). */
const limb=(k:ToyKit,pts:readonly V3[],r:number,o:{part?:string;color:string;mat:Finish})=>{for(let i=1;i<pts.length;i++)rod(k,pts[i-1],pts[i],r,{...o,seg:12});for(const p of pts.slice(1,-1))k.sphere(r*1.05,{part:o.part,at:p,color:o.color,mat:o.mat,seg:14});};
const ellSurf=(cx:number,cy:number,cz:number,rx:number,ry:number,rz:number):Surf=>(x,y)=>{const u=(x-cx)/rx,v=(y-cy)/ry;return cz+rz*Math.sqrt(Math.max(0,1-u*u-v*v));};
const sphSurf=(cy:number,R:number,cz=0):Surf=>(x,y)=>cz+Math.sqrt(Math.max(0,R*R-x*x-(y-cy)**2));
/** A point on an ellipsoid (centre c, radii r) in direction d, and its outward normal. */
function onEll(c:V3,r:V3,d:V3):{p:V3;n:V3}{const u=unit(d),m=Math.hypot(u[0]/r[0],u[1]/r[1],u[2]/r[2]);const p:V3=[c[0]+u[0]/m,c[1]+u[1]/m,c[2]+u[2]/m];
 return {p,n:unit([(p[0]-c[0])/r[0]**2,(p[1]-c[1])/r[1]**2,(p[2]-c[2])/r[2]**2])};}
/** A flat lens spot on a surface point p with outward normal n (half sunk). */
const spot=(k:ToyKit,p:V3,n:V3,r:number,o:{part?:string;color:string;mat:Finish;flat?:number})=>k.sphere(r,{part:o.part,at:[p[0]-n[0]*r*.05,p[1]-n[1]*r*.05,p[2]-n[2]*r*.05],rot:upTo(n),scale:[1,o.flat??.3,1],color:o.color,mat:o.mat});
type FaceOpts={x:number;y:number;surf:Surf;gap?:number;size?:number;mouth?:'smile'|'open'|'o'|'grin'|'none';blush?:string|false;eyes?:'dot'|'happy';prefix?:string;brows?:string;
 /** A light eye back (sclera): the eyes stay readable on a dark body. */
 back?:string;
 /** The smile line / mouth colour (light on a dark face). */
 lip?:string;
 /** The direction the face looks (default +z): features sit on the surface and turn to face it. */
 n?:V3};
/** A premium capsule-toy face: glossy ink eyes with two highlights (eyeL / eyeR under eyes, so blink works), a mouth, blush. */
function face(k:ToyKit,part:string,o:FaceOpts){
 const pre=o.prefix??'',gap=o.gap??.12,s=o.size??.045,{x,y,surf}=o,n:V3=o.n?unit(o.n):[0,0,1];
 const P=(px:number,py:number,d:number):V3=>[px+n[0]*d,py+n[1]*d,surf(px,py)+n[2]*d],R=(extra:V3=[0,0,0]):V3=>o.n?faceRot(n,extra):extra;
 k.part(pre+'eyes',{at:P(x,y,0),parent:part});const pf=o.back?.8:1;
 for(const side of [-1,1] as const){const nm=pre+(side<0?'eyeL':'eyeR'),ex=x+side*gap;k.part(nm,{at:P(ex,y,0),parent:pre+'eyes'});
  if(o.back)k.sphere(s*1.5,{part:nm,at:P(ex,y,-s*.32),rot:R(),scale:[1,1.16,.32],color:o.back,mat:'vinyl'});
  if(o.eyes==='happy')k.torus(s*.85*pf,s*.28*pf,{part:nm,arc:PI,at:P(ex,y-s*.35,.003),rot:R(),color:INK,mat:'ink'});
  else{k.sphere(s*pf,{part:nm,at:P(ex,y,-s*.16),rot:R(),scale:[1,1.28,.5],color:INK,mat:'ink'});
   k.sphere(s*.4*pf,{part:nm,at:P(ex+s*.34*pf,y+s*.46*pf,s*.2),rot:R(),scale:[1,1,.45],color:WHITE,mat:'ink'});
   k.sphere(s*.17*pf,{part:nm,at:P(ex-s*.3*pf,y-s*.44*pf,s*.18),rot:R(),scale:[1,1,.45],color:WHITE,mat:'ink'});}
  if(o.brows)k.capsule(s*.16,s*.7,{part:nm,at:P(ex,y+s*1.75,.002),rot:R([0,0,PI/2+side*.18]),color:o.brows,mat:'ink'});}
 const my=y-s*2.15;
 if(o.mouth==='open'||o.mouth==='grin'){const w=o.mouth==='grin'?1.6:1.15;k.sphere(s*.72,{part,at:P(x,my,-s*.14),rot:R(),scale:[w,.95,.42],color:o.lip??MOUTH,mat:'ink'});
  k.sphere(s*.4,{part,at:P(x,my-s*.3,-s*.02),rot:R(),scale:[w*.95,.6,.42],color:TONGUE,mat:'ink'});}
 else if(o.mouth==='o')k.torus(s*.42,s*.17,{part,at:P(x,my+s*.1,.002),rot:R(),color:o.lip??MOUTH,mat:'ink'});
 else if(o.mouth!=='none')k.torus(s,s*.24,{part,arc:PI,rot:R([0,0,PI]),at:P(x,my+s*.55,.003),color:o.lip??INK,mat:'ink'});
 if(o.blush!==false){const bx=gap+s*1.55,by=y-s*1.6;for(const side of [-1,1])k.sphere(s*.9,{part,at:P(x+side*bx,by,-s*.1),rot:R(),scale:[1.35,.8,.3],color:o.blush??BLUSH,mat:'matte'});}
}
const starPts=(R:number,r:number,n=5):Pt[]=>Array.from({length:n*2},(_,i)=>{const a=PI/2+i*PI/n,rr=i%2?r:R;return [Math.cos(a)*rr,Math.sin(a)*rr] as Pt;});
const ellPts=(rx:number,ry:number,cx=0,cy=0,n=28):Pt[]=>Array.from({length:n},(_,i)=>{const a=i/n*PI*2;return [cx+Math.cos(a)*rx,cy+Math.sin(a)*ry] as Pt;});
/** The secret capsule: a domed top and a cup bottom, each a shell (outside + inside), a rim and a mark on the front. */
function secretCapsule(k:ToyKit,o:{top:string;topMat:Finish;bot:string;botMat:Finish;rim:string;mark:string;markMat:Finish;band?:{color:string;dot:string}}){
 k.part('capTop',{at:[0,.7,0]});k.part('capBot',{at:[0,.3,0]});k.part('inner',{at:[0,0,0]});
 const dome:Pt[]=[[.48,.5],[.48,.56],[.45,.7],[.37,.85],[.23,.95],[0,.985]],cupP:Pt[]=[[0,.05],[.2,.06],[.37,.11],[.46,.23],[.48,.36],[.48,.5]];
 const inset=(pts:Pt[])=>pts.map(([r,y])=>[Math.max(0,r-.02),y] as Pt).reverse();
 k.smoothLathe(dome,{part:'capTop',color:o.top,mat:o.topMat,seg:44});k.smoothLathe(inset(dome),{part:'capTop',color:k.shade(o.top,.08),mat:o.topMat,seg:44});
 k.torus(.475,.015,{part:'capTop',at:[0,.505,0],rot:[PI/2,0,0],color:o.rim,mat:'gold'});
 k.extrude(starPts(.1,.045),.03,{part:'capTop',at:[0,.74,.425],rot:[-.62,0,0],color:o.mark,mat:o.markMat,bevel:.008});
 if(o.band){k.torus(.472,.012,{part:'capTop',at:[0,.6,0],rot:[PI/2,0,0],color:o.band.color,mat:'vinyl'});
  for(let i=0;i<14;i++){const a=i/14*PI*2+.22;k.sphere(.015,{part:'capTop',at:[Math.sin(a)*.483,.6,Math.cos(a)*.483],color:o.band.dot,mat:'gold'});}
  for(let i=0;i<8;i++){const a=i/8*PI*2;k.sphere(.013,{part:'capBot',at:[Math.sin(a)*.47,.3,Math.cos(a)*.47],color:o.band.dot,mat:'gold'});}}
 k.smoothLathe(cupP,{part:'capBot',color:o.bot,mat:o.botMat,seg:44});k.smoothLathe(inset(cupP),{part:'capBot',color:k.shade(o.bot,.08),mat:o.botMat,seg:44});
 k.torus(.48,.02,{part:'capBot',at:[0,.48,0],rot:[PI/2,0,0],color:o.rim,mat:'gold'});k.cyl(.2,.24,.05,{part:'capBot',at:[0,.025,0],color:k.shade(o.bot,-.1),mat:o.botMat,seg:36});
}
/** A wind-up key: a shaft out along x or -z from `at` and a butterfly grip (part `part`, a >= 44 px grab target). */
function windKey(k:ToyKit,part:string,at:V3,dir:'x'|'-x'|'-z',s=1){
 const d:V3=dir==='x'?[1,0,0]:dir==='-x'?[-1,0,0]:[0,0,-1],L=.07*s,tip:V3=[at[0]+d[0]*L,at[1]+d[1]*L,at[2]+d[2]*L];
 rod(k,at,tip,.014*s,{part,color:'#d9b13b',mat:'gold',seg:12});
 const side:V3=dir==='-z'?[1,0,0]:[0,0,1],rot:V3=dir==='-z'?[PI/2,0,0]:[0,0,PI/2];
 for(const sg of [-1,1])k.cyl(.04*s,.04*s,.014*s,{part,at:[tip[0]+side[0]*sg*.045*s,tip[1],tip[2]+side[2]*sg*.045*s],rot,scale:[1,1,.75],color:GOLD,mat:'gold',seg:20});
 k.sphere(.02*s,{part,at:tip,color:GOLD,mat:'gold'});k.proxy(part,.08,tip);
}
const ICO:V3[]=(()=>{const p=(1+Math.sqrt(5))/2,v:V3[]=[];for(const a of [-1,1])for(const b of [-1,1])v.push([0,a,b*p],[a,b*p,0],[b*p,0,a]);return v.map(unit);})();
/** A little football: white with twelve black pentagon patches. */
function football(k:ToyKit,part:string,at:V3,r:number){k.sphere(r,{part,at,color:WHITE,mat:'vinyl'});
 for(const d of ICO)k.sphere(r*.36,{part,at:[at[0]+d[0]*r*.93,at[1]+d[1]*r*.93,at[2]+d[2]*r*.93],rot:upTo(d),scale:[1,.3,1],color:'#22262b',mat:'vinyl',seg:12});}

const SKIN='#f6c9a2',NAVY='#19152e';
/** Convex hull of 2D points (monotone chain), counter-clockwise. */
function hull(pts:Pt[]):Pt[]{const p=[...pts].sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o:Pt,a:Pt,b:Pt)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const lo:Pt[]=[],up:Pt[]=[];for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}
 for(const q of [...p].reverse()){while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q);}return [...lo.slice(0,-1),...up.slice(0,-1)];}
/** A chibi footballer's boot: a rounded shoe with a stripe and a sole. */
function boot(k:ToyKit,part:string,at:V3,col:string,stripe:string,rx=0){
 k.sphere(1,{part,at,rot:[rx,0,0],scale:[.052,.042,.08],color:col,mat:'vinyl',seg:28});
 k.torus(.05,.008,{part,at:[at[0],at[1]+.004,at[2]-.01],rot:[PI/2+rx,0,0],scale:[1,1.5,1],arc:PI,color:stripe,mat:'vinyl'});
}
const set:ToyModelSet={
 'striker-sparky':(k)=>{
  const {body:pink}=k.c,white=WHITE;
  k.part('head',{at:[0,.5,0]});k.part('armL',{at:[-.14,.45,0]});k.part('armR',{at:[.14,.45,0]});k.part('legL',{at:[-.065,.2,0]});k.part('legR',{at:[.065,.2,0]});k.part('ball',{at:[.21,.075,.16]});
  // The kit: a pink shirt with a white lightning bolt and collar, white shorts, a star on the back.
  k.smoothLathe([[0,.215],[.125,.215],[.145,.27],[.15,.34],[.14,.42],[.11,.475],[.06,.5],[0,.505]],{color:pink,mat:'soft',seg:40});
  k.smoothLathe([[0,.15],[.125,.15],[.148,.19],[.147,.245],[0,.25]],{color:white,mat:'soft',seg:40});
  k.torus(.085,.016,{at:[0,.49,0],rot:[PI/2,0,0],color:white,mat:'vinyl'});
  k.extrude([[-.03,.075],[.03,.075],[.003,.012],[.04,.012],[-.035,-.08],[-.008,-.012],[-.042,-.012]],.012,{at:[0,.35,.145],rot:[-.08,0,0],color:white,mat:'vinyl',bevel:.003});
  k.extrude(starPts(.05,.022),.012,{at:[0,.36,-.147],rot:[.08,PI,0],color:white,mat:'vinyl',bevel:.003});
  // The head (on a bobble spring): pink spiky hair, ears, a big grin.
  k.sphere(.205,{part:'head',at:[0,.7,0],color:SKIN,mat:'vinyl'});
  k.sphere(1,{part:'head',at:[0,.745,-.03],scale:[.215,.18,.205],color:pink,mat:'vinyl',seg:40});
  for(const [x,y,z,rx,rz] of [[0,.91,.0,-.2,0],[-.1,.88,-.02,-.1,.6],[.1,.88,-.02,-.1,-.6],[-.05,.9,.1,.5,.3],[.06,.9,.1,.5,-.3],[0,.85,-.17,-1.1,0]] as const)k.cone(.06,.13,{part:'head',at:[x,y,z],rot:[rx,0,rz],color:pink,mat:'vinyl'});
  for(const s of [-1,1])k.sphere(.04,{part:'head',at:[s*.2,.68,.0],scale:[.6,1,1],color:SKIN,mat:'vinyl'});
  face(k,'head',{x:0,y:.68,surf:sphSurf(.7,.205),gap:.085,size:.044,mouth:'grin',brows:k.shade(pink,-.25)});
  // Arms up in a goal celebration, legs in socks and pink-striped white boots, a ball at his feet.
  for(const s of [-1,1] as const){const a=s<0?'armL':'armR';k.sphere(.05,{part:a,at:[s*.15,.46,0],color:pink,mat:'soft'});
   k.capsule(.04,.12,{part:a,at:[s*.21,.55,.02],rot:[0,0,-s*.6],color:SKIN,mat:'vinyl'});k.sphere(.048,{part:a,at:[s*.26,.63,.03],color:SKIN,mat:'vinyl'});
   const l=s<0?'legL':'legR';k.capsule(.042,.05,{part:l,at:[s*.07,.15,0],color:SKIN,mat:'vinyl'});k.cyl(.043,.04,.06,{part:l,at:[s*.07,.09,0],color:pink,mat:'soft'});
   boot(k,l,[s*.07,.045,.025],white,pink);}
  football(k,'ball',[.21,.075,.16],.075);
  windKey(k,'key',[0,.34,-.145],'-z');
  return {kind:{kind:'windup',key:'key',legs:['legL','legR'],arms:['armL','armR']},springs:[{part:'head',k:55,c:2.6,amp:1.3}],
   squeeze:['kneeslide','wave:armL+armR'],poke:{default:['pop:armL+armR','nod'],legL:['kick:legL'],legR:['kick:legR'],ball:['shoot:ball']},tap:['kick:legR','shoot:ball','sparkle'],head:'head',
   voice:{squeeze:['ding','crowd'],poke:['ding:.8'],tap:['ding','ding:1.25','crowd']}};
 },
 'breakaway-bolt':(k)=>{
  const {body:cyan,accent:navy}=k.c,track='#d9573f';
  k.part('head',{at:[0,.56,0]});k.part('band',{at:[0,.86,0],parent:'head'});k.part('legL',{at:[-.06,.28,0]});k.part('legR',{at:[.06,.28,0]});k.part('armL',{at:[-.13,.5,0]});k.part('armR',{at:[.13,.5,0]});k.part('speed',{at:[0,.4,-.28]});
  // A running-track base: lane lines, a white start line, the wind-up key on its side.
  k.cyl(.34,.35,.06,{at:[0,.03,0],scale:[1,1,.72],color:track,mat:'matte',seg:56});k.torus(.345,.01,{at:[0,.06,0],rot:[PI/2,0,0],scale:[1,.72,1],color:WHITE,mat:'vinyl'});
  for(const z of [-.08,.08])k.box(.6,.004,.012,{at:[0,.0615,z],color:WHITE,mat:'matte'});k.box(.012,.004,.3,{at:[.2,.0615,0],color:WHITE,mat:'matte'});
  windKey(k,'key',[.33,.03,0],'x',.75);
  // A cyan running vest, navy shorts, mid-stride.
  k.smoothLathe([[0,.29],[.115,.29],[.135,.34],[.14,.42],[.13,.5],[.1,.555],[0,.565]],{color:cyan,mat:'soft',seg:40});
  k.smoothLathe([[0,.235],[.12,.235],[.138,.27],[.137,.32],[0,.325]],{color:navy,mat:'soft',seg:40});
  k.extrude([[-.025,.06],[.025,.06],[.002,.01],[.034,.01],[-.03,-.065],[-.006,-.008],[-.036,-.008]],.012,{at:[0,.42,.135],rot:[-.08,0,0],color:navy,mat:'vinyl',bevel:.003});
  for(const s of [-1,1] as const){const l=s<0?'legL':'legR',fwd=s>0;
   const hip:V3=[s*.06,.28,0],knee:V3=fwd?[s*.07,.25,.11]:[s*.07,.17,-.05],ank:V3=fwd?[s*.07,.15,.1]:[s*.07,.1,-.13];
   limb(k,[hip,knee,ank],.04,{part:l,color:SKIN,mat:'vinyl'});k.cyl(.042,.04,.05,{part:l,at:[ank[0],ank[1]+.02,ank[2]],rot:fwd?[.2,0,0]:[-.6,0,0],color:cyan,mat:'soft'});
   boot(k,l,fwd?[ank[0],ank[1]-.025,ank[2]+.03]:[ank[0],.085,ank[2]-.02],navy,cyan,fwd?.15:-.75);
   const a=s<0?'armL':'armR',sw=fwd?-1:1;limb(k,[[s*.13,.5,0],[s*.17,.42,sw*.08],[s*.15,.36,sw*.02+(fwd?0:.06)]],.034,{part:a,color:SKIN,mat:'vinyl'});
   k.sphere(.04,{part:a,at:[s*.15,.36,sw*.02+(fwd?0:.06)],color:SKIN,mat:'vinyl'});k.sphere(.045,{part:a,at:[s*.13,.5,0],color:cyan,mat:'soft'});}
  // Speed streaks behind him.
  for(const [y,x,l] of [[.5,-.1,.22],[.4,.12,.3],[.3,-.05,.18]] as const)k.capsule(.016,l,{part:'speed',at:[x,y,-.3],rot:[PI/2,0,0],color:cyan,mat:'jelly'});
  // The bobble: a visible spring neck and a big head, navy hair, a cyan headband with flying tails.
  k.tube(Array.from({length:25},(_,i)=>{const a=i/24*PI*8;return [Math.cos(a)*.03,.54+i/24*.07,Math.sin(a)*.03] as V3;}),.007,{part:'head',color:STEEL,mat:'gold'});
  k.sphere(.225,{part:'head',at:[0,.8,0],color:SKIN,mat:'vinyl'});
  k.sphere(1,{part:'head',at:[0,.845,-.035],scale:[.232,.19,.215],color:navy,mat:'vinyl',seg:40});
  for(const [x,z,rx,rz] of [[-.12,.08,.7,.5],[0,.12,.9,0],[.12,.08,.7,-.5],[.08,-.08,-.5,-.6],[-.08,-.08,-.5,.6]] as const)k.cone(.05,.1,{part:'head',at:[x,.99,z],rot:[rx,0,rz],color:navy,mat:'vinyl'});
  for(const s of [-1,1])k.sphere(.042,{part:'head',at:[s*.222,.78,.0],scale:[.6,1,1],color:SKIN,mat:'vinyl'});
  face(k,'head',{x:0,y:.78,surf:sphSurf(.8,.225),gap:.09,size:.048,mouth:'grin',brows:navy});
  k.torus(.228,.024,{part:'band',at:[0,.87,0],rot:[PI/2-.12,0,0],color:cyan,mat:'soft'});
  for(const s of [-1,1])k.capsule(.02,.13,{part:'band',at:[s*.06,.83,-.28],rot:upTo([s*.35,-.45,-1]),scale:[1.4,1,.5],color:cyan,mat:'soft'});
  return {kind:{kind:'bobble',head:'head'},springs:[{part:'band',k:40,c:1.8,amp:1.4}],
   squeeze:['sprint:legL+legR','sprint:armL+armR'],poke:{default:['sidestep'],legL:['kick:legL'],legR:['kick:legR'],band:['swish:band'],speed:['zip:speed'],key:['sprint:legL+legR']},tap:['kickup','swish:band'],head:'head',
   voice:{squeeze:['steps'],poke:['whoosh:1.5'],tap:['whoosh','pip:1.4']}};
 },
 'tennis-tess':(k)=>{
  const {body:purple,accent:lime}=k.c,R=.3,CY=.34;
  k.part('tail',{at:[0,.6,-.2]});k.part('ball',{at:[.36,.17,.06]});
  // The fuzzy tennis-ball body (felt), its white seam turned so a lobe frames her face.
  k.sphere(R,{at:[0,CY,0],color:lime,mat:'soft',seg:56});
  const a=.7,b=.3,curve:V3[]=Array.from({length:64},(_,i)=>{const t=i/64*PI*2;return unit([a*Math.cos(t)+b*Math.cos(3*t),a*Math.sin(t)-b*Math.sin(3*t),2*Math.sqrt(a*b)*Math.sin(2*t)]);});
  const cands:V3[]=([[1,-1,0],[-1,1,0],[1,1,0],[-1,-1,0],[0,0,1],[0,0,-1],[1,0,0],[0,1,0]] as V3[]).map(unit);
  let best=cands[0],bd=-1;for(const c of cands){const md=Math.min(...curve.map(p=>Math.acos(Math.max(-1,Math.min(1,p[0]*c[0]+p[1]*c[1]+p[2]*c[2])))));if(md>bd){bd=md;best=c;}}
  const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(...best),new T.Vector3(0,.12,1).normalize()),pts=curve.map(p=>{const v=new T.Vector3(...p).applyQuaternion(q).multiplyScalar(R*1.004);return [v.x,v.y+CY,v.z] as V3;});
  k.tube([...pts,pts[0],pts[1]],.012,{color:'#fbfbf2',mat:'soft'});
  // A purple sweatband and ponytail, wristbands, purple sneakers.
  k.torus(.236,.03,{at:[0,CY+.185,0],rot:[PI/2,0,0],color:purple,mat:'soft'});
  k.sphere(.05,{part:'tail',at:[0,.6,-.2],color:purple,mat:'vinyl'});k.capsule(.045,.12,{part:'tail',at:[0,.53,-.28],rot:[.7,0,0],color:k.shade(purple,-.05),mat:'vinyl'});
  face(k,'body',{x:0,y:.37,surf:sphSurf(CY,R),gap:.1,size:.05,mouth:'open'});
  for(const s of [-1,1]){k.capsule(.04,.08,{at:[s*.31,.3,.04],rot:[0,0,s*.5],color:lime,mat:'soft'});k.torus(.042,.014,{at:[s*.33,.27,.045],rot:[PI/2,0,s*.5],color:purple,mat:'soft'});
   k.sphere(1,{at:[s*.11,.04,.08],scale:[.06,.04,.085],color:purple,mat:'vinyl',seg:28});k.rbox(.11,.012,.16,.005,{at:[s*.11,.006,.08],color:WHITE,mat:'matte'});}
  // A mini football on a ball chain from her right hand (the charm).
  football(k,'ball',[.36,.125,.06],.045);
  k.chain({mode:'dangle',from:'body',at:[.36,.29,.06],length:.12,links:4,tag:'ball',color:'#d9c27a'});
  return {kind:{kind:'squish'},soft:{soft:.6},springs:[{part:'tail',k:45,c:2,amp:1.3}],
   squeeze:['stretch','swish:tail'],poke:{default:['jiggle','swish:tail'],ball:['wiggle:ball'],tail:['swish:tail']},tap:['hop','swish:tail'],head:{above:.5},
   voice:{squeeze:['pok','pok:1.1','pok:1.2'],poke:['pok:.9','pok'],tap:['pok:1.2','whoosh:1.3','pok']}};
 },
 'flipper-finn':(k)=>{
  const {body:cyan,accent:pink}=k.c,field='#2c2350',A=PI/3,n:V3=[0,Math.cos(A),Math.sin(A)],u:V3=[0,Math.sin(A),-Math.cos(A)],O:V3=[0,.09,.18];
  const P=(s:number,t:number,d=0):V3=>[s,O[1]+u[1]*t+n[1]*d,O[2]+u[2]*t+n[2]*d],tilt:V3=[-(PI/2-A),0,0];
  const pv=P(-.14,.2,0);k.part('finn',{at:pv});k.part('ball',{at:P(.12,.36,.055)});k.part('bumperL',{at:P(-.2,.6,0)});k.part('bumperR',{at:P(.17,.66,0)});k.part('plunger',{at:[.3,.07,.23]});
  // The cabinet: a tilted purple playfield on a base, cyan side rails with pink trim.
  k.rbox(.8,.09,.48,.03,{at:[0,.045,-.02],color:NAVY,mat:'vinyl'});
  k.rbox(.72,.86,.05,.03,{at:P(0,.43,-.025),rot:tilt,color:field,mat:'vinyl'});
  for(const s of [-1,1]){k.extrude([[-.21,.09],[.26,.09],[.27,.88],[.22,.88]],.03,{at:[s*.375,0,0],rot:[0,PI/2,0],color:cyan,mat:'vinyl',bevel:.01});
   k.tube([P(s*.37,.02,.03),P(s*.37,.86,.03)],.012,{color:pink,mat:'vinyl'});}
  k.rbox(.72,.78,.03,.02,{at:[0,.48,-.255],color:NAVY,mat:'vinyl'});k.rbox(.5,.05,.012,.01,{at:[0,.7,-.274],color:pink,mat:'vinyl'});
  k.extrude(starPts(.07,.03),.012,{at:[0,.5,-.274],rot:[0,PI,0],color:'#ffd447',mat:'gold',bevel:.003});
  // Neon lane guides, a little goal at the top and an arrow.
  k.tube([P(-.3,.12,.008),P(-.32,.4,.008),P(-.24,.7,.008),P(-.08,.8,.008)],.008,{color:cyan,mat:'ink'});k.tube([P(.3,.12,.008),P(.32,.42,.008),P(.26,.72,.008)],.008,{color:pink,mat:'ink'});
  for(const s of [-1,1])k.tube([P(s*.1,.73,.005),P(s*.1,.73,.09)],.009,{color:WHITE,mat:'vinyl'});k.tube([P(-.1,.73,.09),P(.1,.73,.09)],.009,{color:WHITE,mat:'vinyl'});
  for(let i=-2;i<=2;i++)k.tube([P(i*.04,.73,.09),P(i*.05,.8,.004)],.003,{color:'#e9eef5',mat:'matte'});
  k.extrude([[-.03,0],[.03,0],[.03,.05],[.06,.05],[0,.1],[-.06,.05],[-.03,.05]],.006,{at:P(0,.45,.004),rot:tilt,color:'#ffd447',mat:'ink',bevel:.002});
  // Two pop bumpers (pink skirts, white caps, gold stars).
  for(const [p,s,t] of [['bumperL',-.2,.6],['bumperR',.17,.66]] as const){const rot=upTo(n);
   k.cyl(.07,.075,.05,{part:p,at:P(s,t,.025),rot,color:pink,mat:'vinyl',seg:32});k.cyl(.052,.052,.025,{part:p,at:P(s,t,.062),rot,color:WHITE,mat:'vinyl',seg:32});
   k.torus(.078,.01,{part:p,at:P(s,t,.012),rot:tilt,color:cyan,mat:'ink'});
   k.extrude(starPts(.03,.013),.008,{part:p,at:P(s,t,.078),rot:tilt,color:'#ffd447',mat:'gold',bevel:.002});}
  // Finn: a cyan flipper bat with a pink rubber edge, his face on the round end.
  const pts:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*PI*2;pts.push([Math.cos(a)*.1,Math.sin(a)*.1],[.3+Math.cos(a)*.045,-.07+Math.sin(a)*.045]);}
  const bat=hull(pts);k.extrude(bat,.07,{part:'finn',at:P(-.14,.2,.035),rot:tilt,color:cyan,mat:'vinyl',bevel:.02});
  k.tube([...bat,bat[0],bat[1]].map(([x,y])=>{const p=P(-.14+x*1.04,.2+y*1.04,.035);return p;}),.016,{part:'finn',color:pink,mat:'vinyl'});
  k.cyl(.03,.03,.02,{part:'finn',at:P(-.14,.2,.078),rot:upTo(n),color:WHITE,mat:'gold',seg:20});
  const C=P(-.12,.2,.072);face(k,'finn',{x:C[0]+.005,y:C[1]-.01,surf:(x,y)=>C[2]-(y-C[1])*Math.tan(PI/2-A),gap:.045,size:.026,mouth:'open',n});
  // The steel ball (it pops up when the flipper fires) and the plunger knob.
  k.sphere(.055,{part:'ball',at:P(.12,.36,.055),color:'#e3e7ec',mat:'gold'});
  rod(k,[.3,.07,.22],[.3,.07,.29],.012,{part:'plunger',color:STEEL,mat:'gold'});k.sphere(.032,{part:'plunger',at:[.3,.07,.3],color:'#e94b3c',mat:'vinyl'});k.proxy('plunger',.07,[.3,.07,.29]);
  k.lever('finn',{axis:n,max:.6,label:'flipper',hint:'Flip me',fires:{part:'ball',at:.55,lift:[0,u[1]*.26,u[2]*.26],hold:.5}});
  k.slider('plunger',{axis:[0,0,-1],max:.05,release:'return',label:'plunger',hint:'Push me'});
  return {kind:{kind:'mechanism'},flick:true,
   squeeze:['flipup:finn'],poke:{default:['shoot:ball','pop:bumperL'],ball:['shoot:ball'],bumperL:['pop:bumperL'],bumperR:['pop:bumperR']},tap:['glow','pop:bumperL+bumperR','blink'],head:'finn',
   voice:{squeeze:['clack'],poke:['bong','clack:1.2'],tap:['bong:1.2','bong:1.5','pip']}};
 },
 'puzzle-pip':(k)=>{
  const {body:pink,accent:yellow}=k.c,tray='#3a2b4f';
  k.part('feet',{at:[0,.08,0]});k.part('nub',{at:[0,.68,0]});for(const n of ['tileL','tileM','tileR'])k.part(n,{at:[n==='tileL'?-.15:n==='tileM'?0:.15,.27,.17]});
  // A chunky rounded tile body with carved grid lines on the sides and back.
  k.rbox(.56,.52,.3,.09,{at:[0,.4,0],color:pink,mat:'vinyl'});
  const groove=k.shade(pink,-.15);
  for(const s of [-1,1]){k.box(.004,.42,.006,{at:[s*.281,.4,0],color:groove,mat:'matte'});k.box(.004,.006,.22,{at:[s*.281,.4,0],color:groove,mat:'matte'});}
  k.box(.006,.42,.004,{at:[0,.4,-.151],color:groove,mat:'matte'});k.box(.46,.006,.004,{at:[0,.4,-.151],color:groove,mat:'matte'});
  k.rbox(.44,.24,.02,.06,{at:[0,.52,.146],color:k.shade(pink,.1),mat:'vinyl'});
  face(k,'body',{x:0,y:.53,surf:()=>.157,gap:.1,size:.046,mouth:'open'});
  // The tile tray on his tummy: three yellow pass tiles (a ball, the pass arrow, a goal).
  k.rbox(.47,.17,.03,.03,{at:[0,.27,.15],color:tray,mat:'matte'});
  for(const [p,x] of [['tileL',-.15],['tileM',0],['tileR',.15]] as const){k.rbox(.13,.13,.05,.025,{part:p,at:[x,.27,.17],color:yellow,mat:'vinyl'});k.proxy(p,.075,[x,.27,.19]);}
  k.torus(.032,.01,{part:'tileL',at:[-.15,.27,.196],color:NAVY,mat:'ink'});k.sphere(.012,{part:'tileL',at:[-.15,.27,.196],scale:[1,1,.4],color:NAVY,mat:'ink'});
  k.extrude([[-.045,-.01],[.01,-.01],[.01,-.03],[.05,0],[.01,.03],[.01,.01],[-.045,.01]],.008,{part:'tileM',at:[0,.27,.198],color:pink,mat:'ink',bevel:.002});
  for(const s of [-1,1])k.box(.008,.06,.008,{part:'tileR',at:[.15+s*.035,.27,.198],color:WHITE,mat:'vinyl'});k.box(.078,.008,.008,{part:'tileR',at:[.15,.3,.198],color:WHITE,mat:'vinyl'});
  // Nubby arms, short legs and yellow shoes; the click button on his head.
  for(const s of [-1,1]){k.capsule(.045,.08,{at:[s*.31,.38,0],rot:[0,0,s*.35],color:pink,mat:'vinyl'});k.capsule(.04,.04,{at:[s*.12,.13,.02],color:pink,mat:'vinyl'});
   k.rbox(.14,.08,.2,.035,{part:'feet',at:[s*.12,.055,.04],color:yellow,mat:'vinyl'});k.rbox(.145,.014,.205,.006,{part:'feet',at:[s*.12,.012,.04],color:WHITE,mat:'matte'});}
  k.cyl(.08,.085,.02,{at:[0,.664,0],color:k.shade(pink,-.12),mat:'vinyl',seg:32});k.cyl(.06,.06,.04,{part:'nub',at:[0,.69,0],color:yellow,mat:'vinyl',seg:32});k.proxy('nub',.08,[0,.7,0]);
  k.slider('nub',{axis:[0,-1,0],max:.025,release:'return',label:'click button',hint:'Push me'});
  return {kind:{kind:'puzzle',pieces:[{part:'tileR',name:'the goal tile'},{part:'tileM',name:'the pass tile',after:['tileR']},{part:'tileL',name:'the ball tile',after:['tileM']}]},
   squeeze:['slide'],poke:{default:['blink','hop'],nub:['pop:nub'],feet:['hop']},tap:['pop:nub','sparkle'],head:{above:.6},
   voice:{squeeze:['slide','click'],poke:['whoosh:2.2','pip'],tap:['click','chime:1.2']}};
 },
 'claw-club-bean':(k)=>{
  const {body:tan,accent:teal}=k.c;
  secretCapsule(k,{top:tan,topMat:'glitter',bot:teal,botMat:'glitter',rim:'#ffd447',mark:'#ff65c8',markMat:'pearl'});
  k.part('claw',{at:[0,.78,.04],parent:'inner'});k.part('bean',{at:[0,.2,.02],parent:'inner'});k.part('armL',{at:[-.13,.38,.04],parent:'bean'});k.part('armR',{at:[.13,.38,.04],parent:'bean'});
  // The prize chute box with its flap, a yellow PRIZE stripe and a gantry above.
  k.rbox(.5,.2,.4,.04,{part:'inner',at:[0,.1,0],color:teal,mat:'vinyl'});k.rbox(.51,.03,.41,.01,{part:'inner',at:[0,.16,0],color:'#ffd447',mat:'vinyl'});
  k.rbox(.22,.09,.02,.02,{part:'inner',at:[0,.08,.199],color:NAVY,mat:'matte'});k.rbox(.2,.06,.012,.012,{part:'inner',at:[0,.095,.21],rot:[-.3,0,0],color:'#ff65c8',mat:'vinyl'});
  for(const s of [-1,1])rod(k,[s*.22,.2,-.14],[s*.22,.8,-.14],.016,{part:'inner',color:STEEL,mat:'gold'});rod(k,[-.22,.8,-.14],[.22,.8,-.14],.016,{part:'inner',color:STEEL,mat:'gold'});
  rod(k,[0,.8,-.14],[0,.8,.06],.012,{part:'inner',color:STEEL,mat:'gold'});k.rbox(.09,.05,.08,.015,{part:'inner',at:[0,.79,.04],color:'#ff65c8',mat:'vinyl'});
  // The claw (the extra part): a cable, a hub, three curled prongs.
  rod(k,[0,.77,.04],[0,.68,.04],.006,{part:'claw',color:'#3a3f44',mat:'matte'});k.cyl(.04,.035,.05,{part:'claw',at:[0,.66,.04],color:STEEL,mat:'gold',seg:24});
  for(let i=0;i<3;i++){const a=i/3*PI*2+.4,c=Math.cos(a),s=Math.sin(a);k.tube([[c*.03,.645,.04+s*.03],[c*.09,.62,.04+s*.09],[c*.1,.58,.04+s*.1],[c*.07,.555,.04+s*.07]],.009,{part:'claw',color:STEEL,mat:'gold'});}
  // The bean buddy: a soft golden bean with a face, waving.
  k.capsule(.15,.1,{part:'bean',at:[0,.38,.02],rot:[0,0,.12],color:tan,mat:'soft'});
  face(k,'bean',{x:0,y:.42,surf:sphSurf(.42,.15,.02),gap:.065,size:.036,mouth:'open',prefix:'in'});
  for(const [p,s] of [['armL',-1],['armR',1]] as const){k.capsule(.03,.06,{part:p,at:[s*.16,.43,.05],rot:[0,0,-s*.7],color:tan,mat:'soft'});k.sphere(.034,{part:p,at:[s*.19,.47,.05],color:tan,mat:'soft'});}
  for(const s of [-1,1])k.sphere(1,{part:'bean',at:[s*.06,.215,.11],scale:[.04,.025,.05],color:k.shade(tan,-.1),mat:'soft',seg:20});
  return {kind:{kind:'capsule',top:'capTop',bottom:'capBot',inner:'inner'},soft:{soft:.6},
   squeeze:['grab:claw','wiggle:bean'],poke:{default:['dangle:claw','blink:ineyes'],armR:['wave:armR'],armL:['wave:armL'],claw:['grab:claw']},tap:['wave:armR','hop'],head:{above:.62},
   voice:{squeeze:['whirr','yay'],poke:['whirr:1.3'],tap:['yay','sparkle']}};
 },
};
export default set;
