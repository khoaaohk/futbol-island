/**
 * Pixel Pitch (gs-arcade-pixel), rebuilt for round 3B batch 4 (Nov 9 2026; docs/gashapon-design.md "Round 3B"): retro 8-bit
 * football from the machine on the Arcade's back wall. HD kit; the pixel toys are real voxel art (greedy-merged blocks, each
 * with a chamfered outline and a rounded bevel, so every step and colour edge stays crisp). Each toy plays its planned KIND:
 *   Pixel Ball       a squishy 3D voxel football (pentagon patches where a truncated icosahedron has them), pixel eyes with a
 *                    glint, navy pixel boots (bonus: flick to spin)
 *   Pixel Keeper     take-apart: the checker ball comes off first, then each big cyan glove (bonus: his voxel head bobbles)
 *   Pixel Ref        a wind-up referee: black shirt with gold collar and cuffs, a green card held high, a whistle on a lanyard,
 *                    the key in his back (bonus: his head bobbles)
 *   Ticket Twirl     working parts: crank the prize-ticket roll, pull the printed ticket out of the dispenser slot; Twirl is the
 *                    ticket strip with perforations and a curl on top (bonus: a gold prize star on a ball chain)
 *   Puck Pal         a spinner: an air-hockey puck on his edge on a round mini rink (air holes, cyan rail, goal slots), neon rings
 *                    both sides (bonus: push the mallet)
 *   High Score Hero  the rare: a gold-and-pink glitter secret capsule; inside, a gold cup with a face on a plinth whose screen
 *                    glows HI 99 in pixels, a pink star above (the extra part); bonus take-apart not in the runtime yet
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

type Vx={c:string;part:string;mat:Finish};
/** A bevelled block (w × h × d, centred at `at`): a chamfered outline pushed d deep with a rounded bevel: crisp pixel-toy edges. */
function block(k:ToyKit,w:number,h:number,d:number,at:V3,o:{part?:string;color:string;mat:Finish;bevel?:number}){
 const b=o.bevel??Math.min(.011,Math.min(w,h,d)*.17),W=w/2-b,H=h/2-b,c=Math.min(W,H)*.25;
 k.extrude([[-W+c,-H],[W-c,-H],[W,-H+c],[W,H-c],[W-c,H],[-W+c,H],[-W,H-c],[-W,-H+c]],d,{part:o.part,at,color:o.color,mat:o.mat,bevel:b});
}
/**
 * Voxel art: voxels on an integer grid (cell size s; cell (x,y,z) spans o + s·[x,x+1] …), emitted as greedy-merged bevelled
 * blocks (one per run of the same colour, part and finish), so silhouettes step like a real pixel toy and colour edges stay crisp.
 */
class Vox{
 m=new Map<string,Vx>();constructor(readonly s:number,readonly o:V3){}
 set(x:number,y:number,z:number,c:string,part='body',mat:Finish='vinyl'){this.m.set(`${x},${y},${z}`,{c,part,mat});}
 get(x:number,y:number,z:number){return this.m.get(`${x},${y},${z}`);}
 fill(x0:number,x1:number,y0:number,y1:number,z0:number,z1:number,c:string,part='body',mat:Finish='vinyl'){for(let x=x0;x<x1;x++)for(let y=y0;y<y1;y++)for(let z=z0;z<z1;z++)this.set(x,y,z,c,part,mat);}
 /** The model point of a cell corner. */
 at(x:number,y:number,z:number):V3{return [this.o[0]+x*this.s,this.o[1]+y*this.s,this.o[2]+z*this.s];}
 /** The front-most cell of a column (largest z), or null. */
 front(x:number,y:number){let best:number|null=null;for(const key of this.m.keys()){const [a,b,c]=key.split(',').map(Number);if(a===x&&b===y&&(best===null||c>best))best=c;}return best;}
 emit(k:ToyKit){const s=this.s,done=new Set<string>(),cells=[...this.m.keys()].map(q=>q.split(',').map(Number)).sort((a,b)=>a[1]-b[1]||a[2]-b[2]||a[0]-b[0]);
  for(const [x,y,z] of cells){const key=`${x},${y},${z}`;if(done.has(key))continue;const v=this.m.get(key)!;
   const same=(X:number,Y:number,Z:number)=>{const q=`${X},${Y},${Z}`,w=this.m.get(q);return !!w&&!done.has(q)&&w.c===v.c&&w.part===v.part&&w.mat===v.mat;};
   let x1=x+1;while(same(x1,y,z))x1++;
   let y1=y+1;grow:for(;;){for(let i=x;i<x1;i++)if(!same(i,y1,z))break grow;y1++;}
   let z1=z+1;deep:for(;;){for(let i=x;i<x1;i++)for(let j=y;j<y1;j++)if(!same(i,j,z1))break deep;z1++;}
   for(let i=x;i<x1;i++)for(let j=y;j<y1;j++)for(let l=z;l<z1;l++)done.add(`${i},${j},${l}`);
   const g=.004;block(k,(x1-x)*s-g,(y1-y)*s-g,(z1-z)*s-g,[this.o[0]+(x+x1)/2*s,this.o[1]+(y+y1)/2*s,this.o[2]+(z+z1)/2*s],{part:v.part,color:v.c,mat:v.mat});}}
}
/** 3 × 5 pixel digits / letters for the score screen. */
const FONT:Record<string,string[]>={'9':['###','#.#','###','..#','###'],H:['#.#','#.#','###','#.#','#.#'],I:['###','.#.','.#.','.#.','###']};
const NAVY='#19152e',SKIN='#f2c39b';
const set:ToyModelSet={
 'pixel-ball':(k)=>{
  const s=.068,CY=.09+5*s,v=new Vox(s,[0,CY,0]),ink='#22232b',front=new T.Vector3(0,.1,1).normalize();
  // A real 3D voxel football: a sphere of cubes, black pentagon patches where a truncated icosahedron has them.
  const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1/((1+Math.sqrt(5))/2),(1+Math.sqrt(5))/2).normalize(),new T.Vector3(0,.25,1).normalize());
  const patches=ICO.map(d=>new T.Vector3(...d).applyQuaternion(q)).filter(p=>p.dot(front)<.78);// the three round the face stay off: a clean white face
  for(let x=-5;x<5;x++)for(let y=-5;y<5;y++)for(let z=-5;z<5;z++){const c=new T.Vector3(x+.5,y+.5,z+.5);if(c.length()>4.95||c.length()<3.2)continue;
   const d=c.clone().normalize(),dark=patches.some(p=>p.dot(d)>.94);v.set(x,y,z,dark?ink:WHITE);}
  // Pixel eyes (eyeL / eyeR so they blink) with a white glint, a pixel smile and pink cheeks on the front.
  k.part('eyes',{at:[0,CY+s,.33]});k.part('eyeL',{at:[-1.5*s,CY+s,.33],parent:'eyes'});k.part('eyeR',{at:[1.5*s,CY+s,.33],parent:'eyes'});k.part('feet',{at:[0,.05,0]});
  for(const [x,p] of [[-2,'eyeL'],[1,'eyeR']] as const)for(const y of [0,1]){const z=v.front(x,y)!;v.set(x,y,z,ink,p,'ink');}
  for(const [x,y] of [[-2,-1],[1,-1],[-1,-2],[0,-2]] as const){const z=v.front(x,y)!;v.set(x,y,z,'#7a2630','body','ink');}
  for(const x of [-3,2]){const z=v.front(x,-1)!;v.set(x,-1,z,'#ff9bb0','body','matte');}
  v.emit(k);
  for(const [x,p] of [[-2,'eyeL'],[1,'eyeR']] as const){const z=v.front(x,1)!,a=v.at(x,1,z+1);block(k,s*.38,s*.38,.02,[a[0]+s*.68,a[1]+s*.66,a[2]+.006],{part:p,color:WHITE,mat:'ink'});}
  // Two chunky navy pixel boots.
  for(const sd of [-1,1]){block(k,.15,.08,.2,[sd*.1,.045,.05],{part:'feet',color:NAVY,mat:'vinyl'});block(k,.152,.02,.202,[sd*.1,.012,.05],{part:'feet',color:'#60e9f2',mat:'matte'});}
  return {kind:{kind:'squish'},soft:{soft:.55},flick:true,
   squeeze:['c_pixelshrink'],poke:{default:['blink','c_squarehop'],feet:['c_squarehop']},tap:['c_squarehop','blink'],head:{above:.62},
   voice:{squeeze:['c_bip:.8'],poke:['c_bip:1.3'],tap:['c_bip','c_bip:1.2','c_bip:1.5']}};
 },
 'pixel-keeper':(k)=>{
  const {body:purple,accent:cyan}=k.c,s=.068,v=new Vox(s,[0,0,0]),dark='#2a2440',hair=NAVY,P=(x:number,y:number,z:number)=>v.at(x,y,z);
  k.part('head',{at:P(0,10,0)});k.part('ball',{at:P(0,6,4)});k.part('gloveL',{at:P(-2.5,6.5,4)});k.part('gloveR',{at:P(2.5,6.5,4)});
  // Boots, purple socks, dark shorts, the keeper shirt with a cyan collar and a white number block, sleeves reaching forward.
  for(const x0 of [-3,1]){v.fill(x0,x0+2,0,1,-1,2,NAVY);v.fill(x0,x0+2,1,3,-1,1,purple);v.fill(x0,x0+2,2,3,-1,1,cyan);}
  v.fill(-3,3,3,5,-1,1,dark);v.fill(-3,3,5,9,-1,2,purple);v.fill(-2,2,8,9,1,2,cyan);v.fill(-1,1,6,8,-1,0,WHITE);
  for(const x of [-4,3]){v.fill(x,x+1,6,9,-1,2,purple);v.fill(x,x+1,6,7,2,3,SKIN);}
  v.fill(-1,1,9,10,-1,1,SKIN);
  // The head (a bobble): skin, navy hair with a fringe, pixel eyes and smile.
  v.fill(-3,3,10,15,-2,3,SKIN,'head');v.fill(-3,3,15,16,-2,3,hair,'head');v.fill(-3,3,10,15,-2,-1,hair,'head');
  for(const x of [-3,2])v.fill(x,x+1,12,15,-1,2,hair,'head');v.fill(-2,2,14,15,2,3,hair,'head');
  k.part('eyes',{at:[0,P(0,12.5,3)[1],P(0,0,3)[2]],parent:'head'});k.part('eyeL',{at:P(-1.5,12.5,3),parent:'eyes'});k.part('eyeR',{at:P(1.5,12.5,3),parent:'eyes'});
  for(const [x,p] of [[-2,'eyeL'],[1,'eyeR']] as const)v.fill(x,x+1,12,14,2,3,'#22232b',p,'ink');
  v.fill(-1,1,11,12,2,3,'#7a2630','head','ink');for(const x of [-2,1])v.fill(x,x+1,11,12,2,3,'#ff9bb0','head','matte');
  // The pieces: two big cyan gloves (navy cuffs) and the ball they hold.
  for(const [x0,p] of [[-4,'gloveL'],[1,'gloveR']] as const){v.fill(x0,x0+3,5,8,3,5,cyan,p);v.fill(x0,x0+3,5,6,3,5,NAVY,p);}
  for(let x=-1;x<1;x++)for(let y=5;y<7;y++)for(let z=3;z<5;z++)v.set(x,y,z,(x+y+z)%2?WHITE:'#22232b','ball');
  v.emit(k);
  for(const [x,p] of [[-2,'eyeL'],[1,'eyeR']] as const){const a=P(x,13,3);block(k,s*.36,s*.36,.016,[a[0]+s*.7,a[1]+s*.66,a[2]+.005],{part:p,color:WHITE,mat:'ink'});}
  return {kind:{kind:'puzzle',pieces:[{part:'ball',name:'the ball'},{part:'gloveL',name:'the left glove',after:['ball']},{part:'gloveR',name:'the right glove',after:['ball']}]},springs:[{part:'head',k:55,c:2.6,amp:1.2}],
   squeeze:['c_dive'],poke:{default:['blink','nod:head'],gloveL:['clap:gloveL+gloveR'],gloveR:['clap:gloveL+gloveR'],ball:['shoot:ball']},tap:['c_punch:gloveR','nod:head'],head:'head',
   voice:{squeeze:['c_bwip'],poke:['c_ta:1.2'],tap:['c_bwip:1.3','c_ta']}};
 },
 'pixel-ref':(k)=>{
  const {body:black,accent:gold}=k.c,s=.066,v=new Vox(s,[0,0,0]),hair='#6b4226',P=(x:number,y:number,z:number)=>v.at(x,y,z);
  k.part('head',{at:P(0,10,0)});k.part('legL',{at:P(-2,5,0)});k.part('legR',{at:P(2,5,0)});k.part('armL',{at:P(-3.5,8.5,.5)});k.part('armR',{at:P(3.5,8.5,.5)});k.part('whistle',{at:P(0,7,2)});
  // White boots, black socks with gold tops, black shorts, the black referee shirt with a gold collar and cuffs.
  for(const [x0,p] of [[-3,'legL'],[1,'legR']] as const){v.fill(x0,x0+2,0,1,-1,2,WHITE,p);v.fill(x0,x0+2,1,3,-1,1,black,p);v.fill(x0,x0+2,3,4,-1,1,gold,p);v.fill(x0,x0+2,4,5,-1,1,SKIN,p);}
  v.fill(-3,3,5,6,-1,1,black);v.fill(-3,3,6,9,-1,2,black);v.fill(-2,2,8,9,1,2,gold);v.fill(-1,1,8,9,-1,0,gold);v.fill(-3,3,6,7,-1,2,'#2e2a40');
  // Arms: the left points down to the centre spot, the right holds up a green card (for kindness).
  v.fill(-4,-3,6,9,-1,2,black,'armL');v.fill(-4,-3,5,6,-1,2,gold,'armL');v.fill(-4,-3,4,5,0,1,SKIN,'armL');
  v.fill(3,4,6,12,0,1,black,'armR');v.fill(3,4,8,9,0,1,gold,'armR');v.fill(3,4,12,13,0,1,SKIN,'armR');v.fill(3,5,13,15,0,1,'#34c759','armR');
  v.fill(-1,1,9,10,-1,1,SKIN);
  // The head: brown hair, a tidy moustache, pixel eyes.
  v.fill(-3,3,10,15,-2,3,SKIN,'head');v.fill(-3,3,15,16,-2,3,hair,'head');v.fill(-3,3,10,15,-2,-1,hair,'head');for(const x of [-3,2])v.fill(x,x+1,13,15,-1,2,hair,'head');
  k.part('eyes',{at:[0,P(0,12.5,3)[1],P(0,0,3)[2]],parent:'head'});k.part('eyeL',{at:P(-1.5,12.5,3),parent:'eyes'});k.part('eyeR',{at:P(1.5,12.5,3),parent:'eyes'});
  for(const [x,p] of [[-2,'eyeL'],[1,'eyeR']] as const)v.fill(x,x+1,12,14,2,3,'#22232b',p,'ink');
  v.fill(-2,2,11,12,2,3,hair,'head');v.fill(-1,1,10,11,2,3,'#7a2630','head','ink');
  v.emit(k);
  for(const [x,p] of [[-2,'eyeL'],[1,'eyeR']] as const){const a=P(x,13,3);block(k,s*.36,s*.36,.016,[a[0]+s*.7,a[1]+s*.66,a[2]+.005],{part:p,color:WHITE,mat:'ink'});}
  // A silver whistle on a gold lanyard (it pops when he blows it).
  k.tube([P(-1.4,9,1.9),P(-.9,8,2.15),P(0,7.4,2.2)],.006,{color:gold,mat:'vinyl'});k.tube([P(1.4,9,1.9),P(.9,8,2.15),P(0,7.4,2.2)],.006,{color:gold,mat:'vinyl'});
  block(k,.07,.045,.05,P(0,7,2.4),{part:'whistle',color:STEEL,mat:'gold'});block(k,.03,.03,.04,[P(0,7,2.4)[0]+.05,P(0,7,2.4)[1]+.005,P(0,7,2.4)[2]],{part:'whistle',color:STEEL,mat:'gold'});
  windKey(k,'key',P(0,7.5,-1),'-z');
  return {kind:{kind:'windup',key:'key',legs:['legL','legR'],arms:['armL','armR']},springs:[{part:'head',k:55,c:2.6,amp:1.2}],
   squeeze:['pop:whistle','stretch'],poke:{default:['c_cardup:armR'],armR:['c_cardup:armR'],armL:['c_pointdown:armL'],whistle:['pop:whistle']},tap:['c_pointdown:armL','nod:head'],head:'head',
   voice:{squeeze:['c_freeet'],poke:['c_bip:.9','c_ta:1.4'],tap:['c_freeet:1.1']}};
 },
 'ticket-twirl':(k)=>{
  const {body:magenta,accent:lilac}=k.c,tilt=.12,C:V3=[0,.67,.075];
  k.part('roll',{at:[0,.42,-.04]});k.part('crank',{at:[.2,.42,-.04]});k.part('ticket',{at:[0,.08,.225]});k.part('tail',{at:[0,.88,.05]});k.part('star',{at:[.24,.13,.16]});
  // The prize-counter dispenser: a magenta box, a gold coin slot, the slot the printed ticket comes out of.
  k.rbox(.52,.3,.34,.05,{at:[0,.15,0],color:magenta,mat:'vinyl'});k.rbox(.53,.03,.35,.012,{at:[0,.29,0],color:k.shade(magenta,.14),mat:'vinyl'});
  k.rbox(.07,.05,.012,.01,{at:[.17,.21,.171],color:'#ffd447',mat:'gold'});k.box(.04,.008,.014,{at:[.17,.21,.176],color:NAVY,mat:'matte'});
  k.rbox(.26,.04,.014,.012,{at:[0,.11,.171],color:NAVY,mat:'matte'});
  for(const [x,c] of [[-.17,'#60e9f2'],[-.11,'#ffd447']] as const)k.cyl(.022,.022,.012,{at:[x,.21,.172],rot:[PI/2,0,0],color:c,mat:'ink',seg:16});
  k.rbox(.2,.012,.16,.004,{part:'ticket',at:[0,.08,.225],rot:[.5,0,0],color:lilac,mat:'matte'});
  for(const t of [-.03,.04])k.extrude(starPts(.018,.008),.004,{part:'ticket',at:[0,.08-Math.sin(.5)*t+.007*Math.cos(.5),.225+Math.cos(.5)*t+.007*Math.sin(.5)],rot:[.5-PI/2,0,0],color:magenta,mat:'vinyl',bevel:.001});
  // The ticket roll (it turns when you crank) with paper spiral rings on its ends, and the crank handle.
  k.cyl(.12,.12,.3,{part:'roll',at:[0,.42,-.04],rot:[0,0,PI/2],color:lilac,mat:'matte',seg:40});
  for(const sd of [-1,1])for(const r of [.03,.06,.09,.115])k.torus(r,.004,{part:'roll',at:[sd*.151,.42,-.04],rot:[0,PI/2,0],color:k.shade(lilac,-.2),mat:'matte'});
  k.cyl(.02,.02,.42,{at:[0,.42,-.04],rot:[0,0,PI/2],color:'#ffd447',mat:'gold',seg:16});for(const sd of [-1,1])k.rbox(.03,.16,.06,.012,{at:[sd*.2,.33,-.04],color:k.shade(magenta,-.1),mat:'vinyl'});
  k.rbox(.025,.13,.035,.01,{part:'crank',at:[.225,.37,-.04],color:STEEL,mat:'gold'});k.cyl(.022,.022,.07,{part:'crank',at:[.255,.31,-.04],rot:[0,0,PI/2],color:'#e94b3c',mat:'vinyl',seg:16});k.proxy('crank',.08,[.24,.33,-.04]);
  // Twirl: the ticket strip rising off the roll, a magenta border, perforations, a curl on top and a big face.
  const n:V3=[0,Math.sin(tilt),Math.cos(tilt)];
  k.rbox(.31,.42,.02,.025,{at:[C[0],C[1],C[2]-.008],rot:[-tilt,0,0],color:magenta,mat:'vinyl'});k.rbox(.27,.38,.02,.02,{at:C,rot:[-tilt,0,0],color:lilac,mat:'matte'});
  for(const sd of [-1,1])for(let i=0;i<7;i++){const y=.5+i*.055;k.sphere(.009,{at:[sd*.145,y,C[2]+.012-(y-C[1])*Math.tan(tilt)],scale:[1,1,.5],color:NAVY,mat:'matte',seg:10});}
  k.tube([[0,.455,.02],[0,.47,.06],[0,.48,.075]],.01,{color:lilac,mat:'matte'});
  k.torus(.05,.012,{part:'tail',at:[0,.88,.03],rot:[0,PI/2,0],arc:PI*1.5,scale:[1,1,12],color:lilac,mat:'matte'});
  k.extrude(starPts(.03,.013),.006,{at:[0,.51,C[2]+.025+.17*Math.tan(tilt)],rot:[-tilt,0,0],color:'#ffd447',mat:'gold',bevel:.002});
  face(k,'body',{x:0,y:.7,surf:(x,y)=>C[2]+.01-(y-C[1])*Math.tan(tilt),gap:.075,size:.042,mouth:'open',n});
  // A gold prize star on a ball chain from the box corner (the charm).
  k.extrude(starPts(.05,.022),.018,{part:'star',at:[.24,.085,.16],color:'#ffd447',mat:'gold',bevel:.005});
  k.chain({mode:'dangle',from:'body',at:[.24,.26,.16],length:.13,links:4,tag:'star',color:'#d9c27a'});
  k.crank('crank',{axis:'x',label:'roll handle',hint:'Crank me',drives:[{part:'roll',ratio:1}]});
  k.slider('ticket',{axis:[0,-Math.sin(.5),Math.cos(.5)],max:.06,release:'stay',label:'ticket',hint:'Pull my ticket'});
  return {kind:{kind:'mechanism'},
   squeeze:['c_unroll:tail','jiggle'],poke:{default:['rollup'],tail:['c_unroll:tail','wiggle:tail'],ticket:['peek:ticket']},tap:['peek:ticket','sparkle'],head:{above:.5},
   voice:{squeeze:['c_chatter'],poke:['c_chatter:1.3','pip'],tap:['c_chatter','ding']}};
 },
 'puck-pal':(k)=>{
  const {body:navy,accent:cyan}=k.c;
  k.part('puck',{at:[0,.32,0]});k.part('mallet',{at:[.24,.1,.2]});
  // A round mini air-hockey rink: white top with air holes, a cyan rail, red centre circle, goal slots.
  k.cyl(.42,.42,.07,{at:[0,.035,0],color:'#f4f7fb',mat:'vinyl',seg:64});k.torus(.42,.03,{at:[0,.075,0],rot:[PI/2,0,0],color:cyan,mat:'vinyl'});
  k.torus(.14,.005,{at:[0,.0705,0],rot:[PI/2,0,0],color:'#ff4d6d',mat:'matte'});k.box(.8,.002,.008,{at:[0,.0705,0],color:'#ff4d6d',mat:'matte'});
  for(const z of [-.4,.4])k.rbox(.2,.035,.05,.012,{at:[0,.08,z],color:navy,mat:'vinyl'});
  for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++){const x=i*.1,z=j*.1;if(Math.hypot(x,z)>.36||Math.hypot(x,z)<.27&&Math.abs(z)<.12)continue;k.cyl(.007,.007,.003,{at:[x,.0712,z],color:'#9aa6b6',mat:'matte',seg:8});}
  // Puck Pal standing on his edge in a cyan cradle: navy with neon rings both sides, grip ridges, a big grin.
  for(const z of [-.08,.08])k.rbox(.12,.04,.05,.012,{at:[0,.09,z],color:cyan,mat:'vinyl'});
  k.cyl(.25,.25,.14,{part:'puck',at:[0,.32,0],rot:[PI/2,0,0],color:navy,mat:'vinyl',seg:56});
  for(const z of [-.062,.062])k.torus(.25,.012,{part:'puck',at:[0,.32,z],color:k.shade(navy,.15),mat:'vinyl'});
  for(const z of [-.071,.071])k.torus(.212,.012,{part:'puck',at:[0,.32,z],color:cyan,mat:'ink'});
  k.extrude(starPts(.06,.026),.008,{part:'puck',at:[0,.32,-.073],rot:[0,PI,0],color:cyan,mat:'ink',bevel:.002});
  face(k,'puck',{x:0,y:.35,surf:()=>.07,gap:.085,size:.045,mouth:'grin',back:'#ffffff',lip:'#ff65c8',blush:'#ff7fb0'});
  // The mallet: push it and it taps the puck.
  k.cyl(.085,.09,.04,{part:'mallet',at:[.24,.09,.2],color:'#ff4d6d',mat:'vinyl',seg:36});k.cyl(.05,.06,.05,{part:'mallet',at:[.24,.135,.2],color:'#ff4d6d',mat:'vinyl',seg:28});
  k.sphere(.045,{part:'mallet',at:[.24,.19,.2],color:WHITE,mat:'vinyl'});
  k.slider('mallet',{axis:[-1,0,0],max:.07,release:'return',label:'mallet',hint:'Push me'});
  return {kind:{kind:'spintop'},
   squeeze:['c_spinflat:puck'],poke:{default:['c_glideback:puck'],mallet:['wiggle:mallet','c_glideback:puck']},tap:['glow','sparkle','blink'],head:{above:.47},
   voice:{squeeze:['clack','c_glidehum'],poke:['clack:1.15','c_glidehum:1.2'],tap:['c_glidehum:.8','sparkle']}};
 },
 'high-score-hero':(k)=>{
  const {body:gold,accent:pink}=k.c;
  secretCapsule(k,{top:gold,topMat:'gold',bot:pink,botMat:'glitter',rim:'#ffd447',mark:WHITE,markMat:'pearl'});
  k.part('screen',{at:[0,.11,.155],parent:'inner'});k.part('star',{at:[0,.8,0],parent:'inner'});
  // A navy plinth with a pink trim and the score screen: HI 99 in glowing pixels.
  k.rbox(.4,.2,.3,.03,{part:'inner',at:[0,.1,0],color:NAVY,mat:'vinyl'});k.rbox(.41,.025,.31,.01,{part:'inner',at:[0,.19,0],color:pink,mat:'vinyl'});
  k.rbox(.32,.12,.012,.012,{part:'screen',at:[0,.1,.152],color:'#0d0b1a',mat:'ink'});
  const px=.011;'HI99'.split('').forEach((ch,ci)=>FONT[ch].forEach((row,ri)=>row.split('').forEach((c,xi)=>{if(c!=='#')return;
   k.box(px*.9,px*.9,.006,{part:'screen',at:[-.13+ci*.07+xi*px+(ci>1?.02:0),.1+.022-ri*px,.16],color:ci<2?'#ff65c8':'#60e9f2',mat:'ink'});})));
  // The gold cup: a turned bowl on a stem, two loop handles, his face on the front.
  const prof:Pt[]=[[0,.2],[.11,.2],[.11,.225],[.05,.25],[.035,.3],[.04,.34],[.1,.38],[.17,.45],[.2,.55],[.205,.64],[.19,.645],[.18,.56],[.15,.47],[0,.44]];
  k.lathe(prof,{part:'inner',color:gold,mat:'gold',seg:48});
  for(const sd of [-1,1])k.torus(.075,.018,{part:'inner',at:[sd*.2,.53,0],rot:[0,0,sd*-PI/2],arc:PI,color:gold,mat:'gold'});
  const r=(y:number)=>y<.45?.17:y<.55?.17+(y-.45)*.3:.2;
  face(k,'inner',{x:0,y:.54,surf:(x,y)=>Math.sqrt(Math.max(0,r(y)**2-x*x))+.003,gap:.07,size:.04,mouth:'open',prefix:'in'});
  // A pink star above the cup (the extra part) and pixel confetti.
  rod(k,[0,.45,0],[0,.74,0],.008,{part:'inner',color:gold,mat:'gold'});
  k.extrude(starPts(.09,.04),.04,{part:'star',at:[0,.8,0],color:pink,mat:'vinyl',bevel:.01});
  for(const [x,z,c] of [[-.15,.08,'#60e9f2'],[.14,.1,'#ff65c8'],[-.1,-.1,'#ffd447'],[.12,-.08,'#60e9f2']] as const)block(k,.025,.025,.025,[x,.215,z],{part:'inner',color:c,mat:'vinyl'});
  return {kind:{kind:'capsule',top:'capTop',bottom:'capBot',inner:'inner'},
   squeeze:['c_flash:screen','glow'],poke:{default:['rattle:screen','blink:ineyes'],screen:['c_flash:screen','rattle:screen'],star:['pop:star']},tap:['twirl','sparkle'],head:{above:.66},
   voice:{squeeze:['c_fanfare'],poke:['c_countup'],tap:['c_fanfare:1.2','sparkle']}};
 },
};
export default set;
