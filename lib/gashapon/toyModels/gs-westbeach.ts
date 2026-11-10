/**
 * Beach Day (gs-westbeach), rebuilt for round 3B batch 4 (Nov 9 2026; docs/gashapon-design.md "Round 3B"): beach soccer and sunny
 * sand from the machine on the west beach. HD kit, each toy plays its planned KIND (lib/gashapon/toyKinds.ts):
 *   Beach Ball Bea   a squishy beach ball on a patch of sand: three printed bands crossing at white caps, a valve, her face on
 *                    the yellow band; a shell and a starfish (bonus: flick to spin)
 *   Sandcastle Sam   take-apart: a bucket-moulded keep with ridges and crenellations; the driftwood crossbar comes off first, then
 *                    the two towers (his goal posts) (bonus: his arched door opens on a little goal net)
 *   Flip-Flop Flo    working parts: a flip-flop standing in the sand (orange tread, white midsole, cyan footbed, a Y strap with a
 *                    hibiscus); turn the hibiscus: she flaps forward, let go: she slaps back with a burst of sand (bonus: a shell on a ball chain)
 *   Surfboard Sid    a pull-back wind-up: a surfboard (blue bottom, orange deck, stringer, stripes, fins) riding a jelly wave on
 *                    hidden wheels, the curl breaking behind him (bonus: the board bobs on a spring)
 *   Sunhat Sunny     a spinner: a floppy straw sunhat with woven rings, a red ribbon band, a daisy, a bow whose tails flutter
 *                    (bonus charm: the bow and tails swing on springs; a ball chain would pierce the brim)
 *   Lifeguard Lou    the rare: a pearl white-and-red secret capsule; inside, a lifeguard tower on stilts with a ladder, a striped
 *                    parasol roof, a ring buoy (the extra part); pull the rope lever and the lifeguard flag runs up (bonus)
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

const SAND='#e8c98a';
/** A sand patch (a flattened lumpy blob) whose bottom sits on the floor. */
const sandPatch=(k:ToyKit,rx:number,rz:number,h:number,o:{part?:string;seed?:number}={})=>k.blob(1,{part:o.part,at:[0,h,0],scale:[rx,h,rz],amp:.05,freq:5,seed:o.seed??2,color:SAND,dark:'#d4ae6c',light:'#f3dcaa',mat:'matte',seg:44});
/** A pink scallop shell (a ribbed fan) lying at `at`, facing n. */
function shell(k:ToyKit,at:V3,r:number,o:{part?:string;rot?:V3;color?:string}={}){
 const pts:Pt[]=[[0,-r*.15]];for(let i=0;i<=12;i++){const a=PI*.12+i/12*PI*.76,rr=r*(1+.06*Math.cos(i*PI));pts.push([Math.cos(a)*rr,Math.sin(a)*rr]);}
 k.extrude(pts,r*.3,{part:o.part,at,rot:o.rot,color:o.color??'#ffb3c1',mat:'vinyl',bevel:r*.1});
}
const set:ToyModelSet={
 'beachball-bea':(k)=>{
  const R=.32,CY=.4,red=k.c.body,yellow=k.c.accent,blue='#3ec6e0';
  // A patch of sand with a shell and a starfish.
  sandPatch(k,.4,.34,.055);shell(k,[.27,.1,.17],.045,{rot:[-1.1,0,-.4]});k.extrude(starPts(.045,.02),.016,{at:[-.26,.1,.15],rot:[-1.35,0,.3],color:'#ff9a3c',mat:'vinyl',bevel:.006});
  // The ball: white, three printed bands crossing at the poles (yellow down the front, red, blue), white caps and a valve.
  k.sphere(R,{at:[0,CY,0],color:WHITE,mat:'vinyl',seg:56});
  for(const [phi,c,e] of [[0,yellow,1.02],[PI/3,red,1.024],[2*PI/3,blue,1.028]] as const)k.sphere(1,{at:[0,CY,0],rot:[0,phi,0],scale:[R*.9,R*e,R*e],color:c,mat:'vinyl',seg:56});
  for(const sd of [1,-1]){const cap:Pt[]=Array.from({length:9},(_,i)=>{const a=(24-i*3)*PI/180;return [R*1.04*Math.sin(a),CY+sd*R*1.04*Math.cos(a)] as Pt;});k.lathe(sd>0?cap:cap.reverse(),{color:WHITE,mat:'vinyl',seg:40});}
  k.cyl(.022,.026,.02,{at:[0,CY+R*1.04+.006,0],color:WHITE,mat:'vinyl',seg:20});k.cyl(.012,.012,.012,{at:[0,CY+R*1.04+.02,0],color:'#e8e8e8',mat:'vinyl',seg:12});
  face(k,'body',{x:0,y:CY+.03,surf:sphSurf(CY,R*1.02),gap:.085,size:.046,mouth:'open'});
  return {kind:{kind:'squish'},soft:{soft:.6},flick:true,
   squeeze:['squash','boingy'],poke:['c_roll'],tap:['bounce'],head:{above:.62},
   voice:{squeeze:['c_bonk','boing:.8'],poke:['c_shuffle'],tap:['c_bonk:1.2','c_bonk']}};
 },
 'sandcastle-sam':(k)=>{
  const sand=k.c.body,cyan=k.c.accent,wood='#a0673a',ridge=k.shade(sand,-.07);
  k.part('door',{at:[-.05,.1,.252]});k.part('towerL',{at:[-.36,.06,0]});k.part('towerR',{at:[.36,.06,0]});k.part('bar',{at:[0,.53,0]});k.part('flag',{at:[0,.45,0]});k.part('crumbs',{at:[.18,.07,.24]});
  sandPatch(k,.5,.36,.06,{seed:5});
  // The keep: a bucket-moulded tower with ridges and crenellations; a shell, a starfish, a spade in the sand.
  const keep:Pt[]=[[0,.08],[.25,.08],[.25,.12],[.235,.14],[.238,.2],[.226,.22],[.229,.28],[.217,.3],[.22,.36],[.21,.38],[.212,.44],[0,.44]];
  k.lathe(keep,{color:sand,mat:'matte',seg:48});for(const y of [.14,.22,.3,.38])k.torus(.232-(y-.14)*.07,.006,{at:[0,y,0],rot:[PI/2,0,0],color:ridge,mat:'matte'});
  for(let i=0;i<8;i++){const a=i/8*PI*2+PI/8;k.rbox(.08,.07,.06,.015,{at:[Math.sin(a)*.18,.47,Math.cos(a)*.18],rot:[0,a,0],color:sand,mat:'matte'});}
  const cylZ=(r:(y:number)=>number):Surf=>(x,y)=>Math.sqrt(Math.max(0,r(y)**2-x*x));const rK=(y:number)=>.238-(y-.14)*.085;
  face(k,'body',{x:0,y:.31,surf:(x,y)=>cylZ(rK)(x,y)+.004,gap:.08,size:.04,mouth:'open'});
  shell(k,[-.19,.22,.14],.035,{rot:[0,-.9,0]});k.extrude(starPts(.035,.016),.012,{at:[.2,.2,.13],rot:[0,.95,.2],color:'#ff9a3c',mat:'vinyl',bevel:.004});
  rod(k,[.3,.05,-.24],[.36,.36,-.28],.012,{color:cyan,mat:'vinyl'});k.rbox(.09,.12,.016,.03,{at:[.29,.06,-.235],rot:[.05,0,-.18],color:cyan,mat:'vinyl'});
  // The arched door (it opens on a little goal net inside).
  const arch:Pt[]=[[-.05,0],[.05,0],...Array.from({length:9},(_,i)=>{const a=i/8*PI;return [Math.cos(a)*.05,.08+Math.sin(a)*.05] as Pt;})];
  k.extrude(arch.map(([x,y])=>[x*1.15,y*1.08] as Pt),.012,{at:[0,.1,.244],color:'#4a3524',mat:'matte',bevel:.003});
  for(const x of [-.03,0,.03])k.box(.004,.11,.004,{at:[x,.155,.251],color:WHITE,mat:'matte'});for(const y of [.13,.17])k.box(.09,.004,.004,{at:[0,y,.251],color:WHITE,mat:'matte'});
  k.extrude(arch,.016,{part:'door',at:[0,.1,.258],color:wood,mat:'matte',bevel:.004});for(const x of [-.02,.02])k.box(.004,.11,.004,{part:'door',at:[x,.15,.267],color:k.shade(wood,-.15),mat:'matte'});
  k.sphere(.009,{part:'door',at:[.03,.15,.268],color:'#ffd447',mat:'gold'});k.proxy('door',.07,[0,.16,.26]);
  // Two towers (they lift off) and the driftwood crossbar on top: a sand goal.
  for(const [p,x] of [['towerL',-.36],['towerR',.36]] as const){const t:Pt[]=[[0,.06],[.12,.06],[.12,.1],[.11,.12],[.112,.22],[.104,.24],[.106,.34],[.098,.36],[.1,.46],[0,.46]];
   k.lathe(t.map(([r,y])=>[r,y] as Pt),{part:p,at:[x,0,0],color:sand,mat:'matte',seg:36});for(const y of [.12,.24,.36])k.torus(.111-(y-.12)*.05,.005,{part:p,at:[x,y,0],rot:[PI/2,0,0],color:ridge,mat:'matte'});
   for(let i=0;i<5;i++){const a=i/5*PI*2;k.rbox(.05,.05,.04,.01,{part:p,at:[x+Math.sin(a)*.08,.48,Math.cos(a)*.08],rot:[0,a,0],color:sand,mat:'matte'});}k.proxy(p,.11,[x,.3,0]);}
  k.tube([[-.36,.525,0],[-.12,.535,.005],[.12,.53,-.005],[.36,.525,0]],.02,{part:'bar',color:'#c9a27a',mat:'matte'});for(const x of [-.2,.15])k.torus(.02,.004,{part:'bar',at:[x,.531,0],rot:[0,PI/2,0],color:k.shade('#c9a27a',-.2),mat:'matte'});
  // The flag on the keep, and a few loose sand crumbs.
  rod(k,[0,.44,0],[0,.72,0],.008,{part:'flag',color:wood,mat:'matte'});k.extrude([[0,0],[.13,-.035],[0,-.07]],.008,{part:'flag',at:[.004,.715,0],color:cyan,mat:'vinyl',bevel:.002});
  for(const [x,z,r] of [[.18,.24,.03],[.24,.18,.022],[-.2,.26,.025]] as const)k.blob(r,{part:'crumbs',at:[x,.075,z],amp:r*.25,freq:7,color:sand,mat:'matte',seg:16});
  k.hinge('door',{axis:[0,-1,0],max:1.6,detents:[.8],label:'door',hint:'Open my door'});
  return {kind:{kind:'puzzle',pieces:[{part:'bar',name:'the crossbar'},{part:'towerL',name:'the left tower',after:['bar']},{part:'towerR',name:'the right tower',after:['bar']}]},springs:[{part:'flag',k:40,c:1.8,amp:1.3}],
   squeeze:['c_crumble:crumbs','jiggle'],poke:{default:['peek:flag'],flag:['peek:flag','swish:flag'],door:['wiggle:door']},tap:['peek:flag','sparkle'],head:{above:.62},
   voice:{squeeze:['c_pour','yay:1.4'],poke:['pop:.8'],tap:['c_pour:1.3','cheer:1.3']}};
 },
 'flip-flop-flo':(k)=>{
  const {body:cyan,accent:orange}=k.c,lean=-.17,q=new T.Quaternion().setFromEuler(new T.Euler(lean,0,0)),n:V3=[0,-Math.sin(lean),Math.cos(lean)];
  const L=(x:number,y:number,d:number):V3=>{const v=new T.Vector3(x,y,d).applyQuaternion(q);return [v.x,v.y+.07,v.z];};
  k.part('sole',{at:[0,.07,0]});k.part('flower',{at:L(0,.6,.09),parent:'sole'});k.part('splash',{at:[0,.06,.2]});k.part('shell',{at:L(.19,.28,0)});
  sandPatch(k,.3,.24,.06,{seed:8});
  // The sole, standing up in the sand: an orange tread, a white midsole, a cyan footbed with a toe grip pattern.
  const sh=new T.Shape();sh.moveTo(0,0);sh.bezierCurveTo(.09,0,.14,.05,.14,.16);sh.bezierCurveTo(.14,.28,.11,.34,.115,.42);sh.bezierCurveTo(.12,.52,.17,.56,.165,.64);sh.bezierCurveTo(.16,.72,.08,.76,0,.76);
  sh.bezierCurveTo(-.08,.76,-.16,.72,-.165,.64);sh.bezierCurveTo(-.17,.56,-.12,.52,-.115,.42);sh.bezierCurveTo(-.11,.34,-.14,.28,-.14,.16);sh.bezierCurveTo(-.14,.05,-.09,0,0,0);
  const o=outline(sh,64),ins=(f:number)=>o.map(([x,y])=>[x*f,.38+(y-.38)*f] as Pt);
  k.extrude(o,.025,{part:'sole',at:L(0,0,-.0275),rot:[lean,0,0],color:orange,mat:'vinyl',bevel:.008});
  k.extrude(o,.022,{part:'sole',at:L(0,0,-.004),rot:[lean,0,0],color:WHITE,mat:'matte',bevel:.006});
  k.extrude(ins(.975),.028,{part:'sole',at:L(0,0,.02),rot:[lean,0,0],color:cyan,mat:'vinyl',bevel:.009});
  for(let i=0;i<5;i++)for(let j=0;j<3;j++)k.sphere(.009,{part:'sole',at:L((j-1)*.06+(i%2)*.03-.015,.5+i*.045,.035),rot:[lean,0,0],scale:[1,1,.35],color:k.shade(cyan,.12),mat:'vinyl',seg:10});
  // The orange Y strap with a hibiscus on the toe post.
  const post=L(0,.62,.04),knot=L(0,.6,.075);k.tube([post,knot],.016,{part:'sole',color:orange,mat:'vinyl'});
  for(const sd of [-1,1])k.tube([knot,L(sd*.06,.54,.1),L(sd*.12,.45,.075),L(sd*.145,.38,.03)],.019,{part:'sole',color:orange,mat:'vinyl'});
  for(let i=0;i<5;i++){const a=i/5*PI*2,p=L(Math.cos(a)*.032,.6+Math.sin(a)*.032,.09);k.sphere(1,{part:'flower',at:p,rot:qrot(['z',a],['x',lean]),scale:[.032,.022,.008],color:'#ff6b8a',mat:'vinyl',seg:20});}
  k.sphere(.014,{part:'flower',at:L(0,.6,.096),color:'#ffd447',mat:'vinyl'});k.proxy('flower',.07,L(0,.6,.09));
  // Her face on the heel.
  const C=L(0,.24,.034);face(k,'sole',{x:0,y:C[1],surf:(x,y)=>C[2]-(y-C[1])*Math.tan(-lean),gap:.065,size:.038,mouth:'open',n});
  // A burst of sand when she slaps down (pull her and let go), and a pink shell charm on a ball chain from her strap.
  for(const [x,y,z,r] of [[0,.1,.24,.035],[-.08,.13,.22,.025],[.09,.12,.23,.028],[-.04,.17,.25,.02],[.05,.18,.24,.018]] as const)k.sphere(r,{part:'splash',at:[x,y,z],color:'#f3dcaa',mat:'matte'});
  shell(k,[L(.19,.28,0)[0],L(.19,.28,0)[1]-.15,L(.19,.28,0)[2]],.04,{part:'shell'});
  k.chain({mode:'dangle',from:'sole',at:L(.19,.4,0),length:.12,links:4,tag:'shell',color:'#d9c27a'});
  // Turn her hibiscus and she flaps forward (a small grab target: the sole stays squeezable); let go: she slaps back with a burst of sand.
  k.lever('flower',{axis:n,max:.5,label:'flip-flop',hint:'Flap me',drives:[{part:'sole',ratio:1,axis:[1,0,0]}],fires:{part:'splash',at:.7,hidden:true,hold:.5}});
  return {kind:{kind:'mechanism'},
   squeeze:['c_flapflop'],poke:{default:['c_slap'],shell:['wiggle:shell']},tap:['sidestep','hop'],head:{above:.62},
   voice:{squeeze:['c_flipflop'],poke:['c_flipflop:1.2'],tap:['c_flipflop:.9','c_flipflop:1.1']}};
 },
 'surfboard-sid':(k)=>{
  const {body:orange,accent:blue}=k.c,tilt=-.7,BC:V3=[0,.31,.07],bq=new T.Quaternion().setFromEuler(new T.Euler(...qrot(['x',tilt],['z',.1])));
  const B=(x:number,y:number,d:number):V3=>{const v=new T.Vector3(x,y,d).applyQuaternion(bq);return [BC[0]+v.x,BC[1]+v.y,BC[2]+v.z];},brot=qrot(['x',tilt],['z',.1]);
  k.part('board',{at:[0,.24,.04]});k.part('wave',{at:[0,.34,-.14]});
  // A jelly wave on hidden pull-back wheels, its curl breaking behind him with white foam.
  k.blob(1,{at:[0,.1,0],scale:[.42,.09,.27],amp:.006,freq:4,seed:3,color:'#4fb3e8',dark:'#2f86c8',light:'#9fdcf5',mat:'jelly',seg:48});
  for(const x of [-.22,.22])for(const z of [-.15,.15])k.cyl(.035,.035,.03,{at:[x,.036,z],rot:[0,0,PI/2],color:'#2a2f33',mat:'matte',seg:20});
  k.torus(.15,.038,{part:'wave',at:[0,.34,-.14],rot:[0,PI/2,-PI/2],arc:PI*1.35,scale:[1,1,6.8],color:'#4fb3e8',mat:'jelly'});
  for(let i=0;i<7;i++){const x=-.24+i*.08;k.sphere(.03+(i%2)*.01,{part:'wave',at:[x,.43+(i%3)*.01,-.02],color:WHITE,mat:'soft'});}
  for(let i=0;i<6;i++)k.sphere(.022,{at:[-.3+i*.12,.17,.2-(i%2)*.04],color:WHITE,mat:'soft'});
  windKey(k,'key',[0,.12,-.26],'-z');
  // Sid: a surfboard with a blue bottom, an orange deck, a white stringer, blue stripes, three fins and his face.
  const sh=new T.Shape();sh.moveTo(.42,0);sh.bezierCurveTo(.32,.115,.0,.13,-.26,.11);sh.bezierCurveTo(-.37,.1,-.39,.04,-.39,0);sh.bezierCurveTo(-.39,-.04,-.37,-.1,-.26,-.11);sh.bezierCurveTo(0,-.13,.32,-.115,.42,0);
  const o=outline(sh,64);k.extrude(o,.022,{part:'board',at:B(0,0,-.012),rot:brot,color:blue,mat:'vinyl',bevel:.008});
  k.extrude(o.map(([x,y])=>[x*.985,y*.95] as Pt),.03,{part:'board',at:B(0,0,.01),rot:brot,color:orange,mat:'vinyl',bevel:.01});
  k.box(.66,.006,.006,{part:'board',at:B(-.02,0,.026),rot:brot,color:WHITE,mat:'matte'});
  for(const [x,w] of [[.27,.17],[.31,.13],[-.27,.17]] as const)k.box(.018,w,.006,{part:'board',at:B(x,0,.026),rot:brot,color:blue,mat:'vinyl'});
  for(const [x,y] of [[-.32,0],[-.27,.06],[-.27,-.06]] as const)k.extrude([[0,0],[.06,0],[0,.05]],.008,{part:'board',at:B(x,y,-.024),rot:qrot(['y',PI/2],['x',PI/2],['x',tilt],['z',.1]),color:blue,mat:'vinyl',bevel:.002});
  const C=B(.04,0,.028),nv=new T.Vector3(0,0,1).applyQuaternion(bq),n:V3=[nv.x,nv.y,nv.z];
  face(k,'board',{x:C[0],y:C[1],surf:(x,y)=>C[2]-(n[0]*(x-C[0])+n[1]*(y-C[1]))/n[2],gap:.07,size:.04,mouth:'open',n});
  return {kind:{kind:'windup',key:'key'},springs:[{part:'board',k:50,c:2.2,amp:1}],
   squeeze:['c_bend'],poke:{default:['tilt:board'],wave:['wiggle:wave','c_surf']},tap:['c_surf','sparkle'],head:{above:.3},
   voice:{squeeze:['c_swish'],poke:['c_swish:1.3'],tap:['c_swish','c_woo']}};
 },
 'sunhat-sunny':(k)=>{
  const {body:straw,accent:red}=k.c,weave=k.shade(straw,-.12);
  k.part('brim',{at:[0,.1,0]});k.part('bow',{at:[.15,.17,.1]});k.part('tails',{at:[.15,.16,.1],parent:'bow'});
  // A wide floppy straw brim with woven rings, a domed crown, a red ribbon band.
  const brim:Pt[]=[[.16,.13],[.26,.115],[.36,.09],[.44,.065],[.475,.05],[.48,.04],[.46,.035],[.38,.055],[.27,.085],[.16,.1],[.16,.13]];
  k.lathe(brim,{part:'brim',color:straw,mat:'matte',seg:64});
  const yB=(r:number)=>r<.26?.13-(r-.16)*.15:r<.36?.115-(r-.26)*.25:r<.44?.09-(r-.36)*.31:.065-(r-.44)*.4;
  for(const r of [.21,.27,.33,.39,.45])k.torus(r,.004,{part:'brim',at:[0,yB(r)+.002,0],rot:[PI/2,0,0],color:weave,mat:'matte'});
  const crown:Pt[]=[[.168,.1],[.172,.22],[.17,.36],[.163,.45],[.14,.5],[.08,.522],[0,.527]];
  k.smoothLathe(crown,{color:straw,mat:'matte',seg:56});k.cyl(.16,.16,.01,{at:[0,.104,0],color:weave,mat:'matte',seg:40});
  for(const [y,r] of [[.29,.172],[.4,.168]] as const)k.torus(r,.004,{at:[0,y,0],rot:[PI/2,0,0],color:weave,mat:'matte'});
  k.lathe([[.176,.125],[.178,.205]],{color:red,mat:'soft',seg:56});for(const y of [.125,.205])k.torus(.177,.005,{at:[0,y,0],rot:[PI/2,0,0],color:k.shade(red,-.12),mat:'soft'});
  // Her face on the crown, a daisy tucked in the band, a red bow whose tails flutter (the charm-like bonus).
  const rC=(y:number)=>y<.36?.172-Math.max(0,y-.22)*.014:.17-(y-.36)*.08;
  face(k,'body',{x:0,y:.32,surf:(x,y)=>Math.sqrt(Math.max(0,rC(y)**2-x*x))+.003,gap:.068,size:.038,mouth:'open'});
  for(let i=0;i<8;i++){const a=i/8*PI*2;k.sphere(1,{at:[-.12+Math.cos(a)*.022,.17+Math.sin(a)*.022,.14],rot:[0,-.7,a],scale:[.018,.008,.006],color:WHITE,mat:'vinyl',seg:14});}
  k.sphere(.012,{at:[-.12,.17,.145],color:'#ffd447',mat:'vinyl'});
  for(const sd of [-1,1])k.torus(.035,.012,{part:'bow',at:[.15+sd*.035,.17,.105],rot:[0,.75,0],scale:[1.2,.75,1],color:red,mat:'soft'});k.sphere(.02,{part:'bow',at:[.15,.17,.11],color:red,mat:'soft'});
  for(const sd of [-1,1])k.capsule(.012,.09,{part:'tails',at:[.15+sd*.025,.11,.13],rot:[.3,0,sd*.3],scale:[1.6,1,.6],color:red,mat:'soft'});
  return {kind:{kind:'spintop'},springs:[{part:'tails',k:30,c:1.4,amp:1.5},{part:'bow',k:60,c:2.5,amp:.8}],
   squeeze:['c_brimflop:brim','squash'],poke:{default:['c_tiphat'],bow:['wiggle:bow'],tails:['wiggle:tails']},tap:['spin','petal'],head:{above:.4},
   voice:{squeeze:['breeze'],poke:['pip:.9','breeze:1.2'],tap:['breeze:1.1','pip']}};
 },
 'lifeguard-lou':(k)=>{
  const {body:red}=k.c,yellow='#ffd447';
  secretCapsule(k,{top:'#fff8ec',topMat:'pearl',bot:red,botMat:'pearl',rim:'#ffd447',mark:'#ffd447',markMat:'gold'});
  k.part('flag',{at:[-.2,.6,.08],parent:'inner'});k.part('cloth',{at:[-.2,.6,.08],parent:'flag'});k.part('lever',{at:[-.13,.42,.14],parent:'inner'});k.part('buoy',{at:[.135,.5,.02],parent:'inner'});k.part('whistle',{at:[.1,.56,.105],parent:'inner'});
  // Sand, the white stilt legs with red braces, the platform and front rail.
  k.cyl(.4,.41,.05,{part:'inner',at:[0,.025,0],scale:[1,1,.9],color:SAND,mat:'matte',seg:48});
  for(const sx of [-1,1])for(const sz of [-1,1])rod(k,[sx*.14,.05,sz*.12],[sx*.11,.38,sz*.09],.012,{part:'inner',color:WHITE,mat:'vinyl'});
  for(const sz of [-1,1])rod(k,[-.13,.12,sz*.11],[.12,.3,sz*.095],.008,{part:'inner',color:red,mat:'vinyl'});for(const sx of [-1,1])rod(k,[sx*.13,.12,-.11],[sx*.12,.3,.1],.008,{part:'inner',color:red,mat:'vinyl'});
  k.rbox(.34,.03,.3,.01,{part:'inner',at:[0,.395,0],color:WHITE,mat:'vinyl'});
  k.tube([[-.16,.47,.14],[.16,.47,.14]],.008,{part:'inner',color:WHITE,mat:'vinyl'});for(const x of [-.16,0,.16])rod(k,[x,.41,.14],[x,.47,.14],.007,{part:'inner',color:WHITE,mat:'vinyl'});
  // The ladder down to the sand.
  for(const sx of [-1,1])rod(k,[sx*.06,.05,.31],[sx*.06,.39,.15],.009,{part:'inner',color:WHITE,mat:'vinyl'});
  for(let i=1;i<5;i++){const t=i/5;rod(k,[-.06,.05+.34*t,.31-.16*t],[.06,.05+.34*t,.31-.16*t],.007,{part:'inner',color:red,mat:'vinyl'});}
  // The red cabin with a white window panel (her face), a striped parasol roof.
  k.rbox(.26,.2,.22,.03,{part:'inner',at:[0,.51,-.02],color:red,mat:'vinyl'});k.rbox(.2,.12,.012,.02,{part:'inner',at:[0,.53,.093],color:WHITE,mat:'vinyl'});
  face(k,'inner',{x:0,y:.545,surf:()=>.1,gap:.055,size:.03,mouth:'open',prefix:'in'});
  rod(k,[0,.61,-.02],[0,.74,-.02],.01,{part:'inner',color:WHITE,mat:'vinyl'});
  const ring=(r0:number,r1:number,y0:number,y1:number,c:string)=>k.lathe([[r0,y0],[r1,y1]],{part:'inner',at:[0,0,-.02],color:c,mat:'vinyl',seg:40});
  ring(.25,.19,.64,.665,red);ring(.19,.13,.665,.69,WHITE);ring(.13,.065,.69,.715,red);ring(.065,0,.715,.73,WHITE);k.cyl(.25,.25,.006,{part:'inner',at:[0,.637,-.02],color:WHITE,mat:'matte',seg:40});
  k.sphere(.02,{part:'inner',at:[0,.74,-.02],color:yellow,mat:'gold'});
  // A ring buoy on the cabin side (the extra part), a silver whistle on a hook.
  for(let i=0;i<4;i++)k.torus(.055,.02,{part:'buoy',at:[.135,.5,.02],rot:[0,PI/2,i*PI/2],arc:PI/2,color:i%2?WHITE:'#ff7a2a',mat:'vinyl'});
  k.rbox(.04,.022,.022,.008,{part:'whistle',at:[.1,.56,.108],color:STEEL,mat:'gold'});k.cyl(.012,.012,.02,{part:'whistle',at:[.125,.56,.108],rot:[0,0,PI/2],color:STEEL,mat:'gold',seg:12});
  // The flag pole: pull the rope lever and the red-and-yellow lifeguard flag runs up to the top.
  rod(k,[-.2,.41,.08],[-.2,.84,.08],.007,{part:'inner',color:STEEL,mat:'gold'});k.sphere(.014,{part:'inner',at:[-.2,.845,.08],color:yellow,mat:'gold'});
  k.extrude([[0,0],[.14,0],[0,-.09]],.006,{part:'cloth',at:[-.193,.6,.08],color:red,mat:'vinyl',bevel:.0015});k.extrude([[.14,0],[.14,-.09],[0,-.09]],.006,{part:'cloth',at:[-.193,.6,.08],color:yellow,mat:'vinyl',bevel:.0015});
  rod(k,[-.13,.42,.14],[-.13,.5,.17],.008,{part:'lever',color:STEEL,mat:'gold'});k.sphere(.022,{part:'lever',at:[-.13,.505,.172],color:red,mat:'vinyl'});k.proxy('lever',.07,[-.13,.49,.17]);
  k.lever('lever',{axis:[1,0,0],max:.9,label:'flag rope',hint:'Pull me',fires:{part:'flag',at:.7,lift:[0,.16,0],hold:1.6}});
  return {kind:{kind:'capsule',top:'capTop',bottom:'capBot',inner:'inner'},
   squeeze:['swish:cloth','wiggle:cloth'],poke:{default:['pop:whistle','blink:ineyes'],buoy:['dangle:buoy'],whistle:['pop:whistle'],flag:['swish:cloth']},tap:['peek:flag','swish:cloth'],head:{above:.6},
   voice:{squeeze:['c_whistle:.9','c_gull'],poke:['c_whistle'],tap:['c_whistle:1.1','c_gull:1.1']}};
 },
};
export default set;
