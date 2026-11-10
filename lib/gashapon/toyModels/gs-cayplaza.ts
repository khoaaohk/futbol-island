/**
 * Bug Squad (gs-cayplaza), rebuilt for round 3B batch 4 (Nov 9 2026; docs/gashapon-design.md "Round 3B"): island bugs that play
 * football, from the machine on the Coral Cay plaza. HD kit, each toy plays its planned KIND (lib/gashapon/toyKinds.ts):
 *   Ladybug Libby    working parts: lift her front spot and both glossy wing cases open on clear folded flying wings; lime goalie
 *                    gloves on her front legs, a black head with white eye backs (bonus wind-up key, not in the runtime yet:
 *                    a poke on it marches her)
 *   Grasshopper Gil  a wind-up hopper: big springy hind legs with yellow chevrons, folded wings, a sweatband, a ball at his toes
 *                    (bonus: squishy)
 *   Ant Ace          take-apart: the crate of team water bottles comes off first, then her head; her abdomen comes off too
 *                    (bonus wind-up key, not in the runtime yet: a poke marches her)
 *   Dragonfly Dax    a spinner: a balancing dragonfly on a reed in a lily pad, four clear wings with gold tip weights (bonus: a
 *                    mini football on a ball chain off his tail)
 *   Firefly Fia      a jelly lantern: a glowing jelly belly with amber rings round a bright core, a salmon shield hood, white
 *                    eye backs (bonus: a gold moon on a ball chain, springy antennae)
 *   Monarch Mara     the rare: the secret capsule is a glitter jade chrysalis with a black-and-gold band; inside, a monarch on a
 *                    milkweed leaf with a pink milkweed flower (the extra part); orange wings above with black veins and a
 *                    white-dotted border, orange underneath too; tip her head into a bow and the wings fold (bonus working parts)
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
  for(let i=0;i<14;i++){const a=i/14*PI*2+.22;k.sphere(.015,{part:'capTop',at:[Math.sin(a)*.483,.6,Math.cos(a)*.483],color:o.band.dot,mat:'gold',seg:10});}
  for(let i=0;i<8;i++){const a=i/8*PI*2;k.sphere(.013,{part:'capBot',at:[Math.sin(a)*.47,.3,Math.cos(a)*.47],color:o.band.dot,mat:'gold',seg:10});}}
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

const BLACK='#211c2b',LEAF='#6fae4a';
const set:ToyModelSet={
 'ladybug-libby':(k)=>{
  const {body}=k.c,red=body,lime='#b6e84a';
  k.part('head',{at:[0,.28,.3]});k.part('caseL',{at:[0,.39,-.07]});k.part('caseR',{at:[0,.39,-.07]});k.part('ants',{at:[0,.47,.46],parent:'head'});
  k.part('gloveL',{at:[-.29,.25,.43]});k.part('gloveR',{at:[.29,.25,.43]});k.part('key',{at:[0,.18,-.385]});k.part('spot',{at:[0,.36,0]});
  // The black underside, with clear folded flying wings that only show when the wing cases open.
  k.sphere(1,{at:[0,.19,-.05],scale:[.27,.15,.34],color:BLACK,mat:'vinyl',seg:44});
  for(const s of [-1,1])k.extrude(ellPts(.085,.25,0,0,24),.008,{at:[s*.08,.33,-.14],rot:qrot(['x',-PI/2],['y',s*.18]),color:'#e6f5ff',mat:'jelly',bevel:.003});
  // Two glossy red wing cases (they meet on a seam down the back), seven black spots in all.
  const C:Record<string,V3>={caseL:[-.125,.25,-.07],caseR:[.125,.25,-.07]},RAD:V3=[.165,.215,.33];
  for(const [p,s] of [['caseL',-1],['caseR',1]] as const){k.sphere(1,{part:p,at:C[p],scale:RAD,color:red,mat:'vinyl',seg:44});
   for(const [dx,dy,dz,r] of [[.25,.9,.35,.055],[.8,.45,.05,.05],[.3,.78,-.55,.06],[.72,.25,-.62,.045]] as const){const {p:pp,n}=onEll(C[p],RAD,[s*dx,dy,dz]);spot(k,pp,n,r,{part:p,color:BLACK,mat:'vinyl'});}}
  // The shared front spot is the handle: lift it and both wing cases open (a small grab target keeps the shell squeezable).
  k.sphere(.052,{part:'spot',at:[0,.352,.08],rot:upTo([0,.8,.6]),scale:[1,.45,1],color:BLACK,mat:'vinyl'});k.proxy('spot',.07,[0,.352,.08]);
  // The pronotum (black, two white patches) and the big round head with white eye backs.
  k.sphere(1,{part:'head',at:[0,.27,.24],scale:[.2,.13,.12],color:BLACK,mat:'vinyl',seg:36});
  for(const s of [-1,1]){const {p,n}=onEll([0,.27,.24],[.2,.13,.12],[s*.62,.45,.6]);spot(k,p,n,.055,{part:'head',color:'#fff8ee',mat:'vinyl'});}
  k.sphere(.2,{part:'head',at:[0,.31,.42],color:BLACK,mat:'vinyl'});
  face(k,'head',{x:0,y:.34,surf:sphSurf(.31,.2,.42),gap:.085,size:.044,mouth:'open',back:'#ffffff',lip:'#d8475e'});
  // Antennae with red tips.
  for(const s of [-1,1]){k.tube([[s*.04,.46,.5],[s*.09,.58,.55],[s*.15,.66,.5]],.009,{part:'ants',color:BLACK,mat:'vinyl'});k.sphere(.026,{part:'ants',at:[s*.15,.665,.5],color:red,mat:'vinyl'});}
  // Six legs: the front pair wears lime goalie gloves (white palms, black straps); the others stand on the floor.
  for(const s of [-1,1] as const){const g=s<0?'gloveL':'gloveR',gx=s*.31;
   limb(k,[[s*.13,.2,.3],[s*.22,.18,.38],[s*.29,.24,.43]],.016,{color:BLACK,mat:'vinyl'});
   k.sphere(1,{part:g,at:[gx,.29,.45],scale:[.072,.088,.05],color:lime,mat:'vinyl',seg:32});k.sphere(1,{part:g,at:[gx,.29,.488],scale:[.055,.066,.014],color:WHITE,mat:'matte',seg:28});
   k.capsule(.022,.04,{part:g,at:[gx-s*.06,.27,.46],rot:[0,0,s*.7],color:lime,mat:'vinyl'});k.cyl(.052,.052,.03,{part:g,at:[gx,.215,.45],scale:[1,1,.75],color:BLACK,mat:'vinyl',seg:24});
   for(let i=-1;i<=1;i++)k.capsule(.006,.03,{part:g,at:[gx+i*.022,.33,.494],color:k.shade(lime,-.18),mat:'matte'});
   limb(k,[[s*.21,.14,.0],[s*.32,.12,.03],[s*.36,.025,.07]],.014,{color:BLACK,mat:'vinyl'});k.sphere(.02,{at:[s*.36,.02,.07],color:BLACK,mat:'vinyl'});
   limb(k,[[s*.19,.13,-.2],[s*.3,.11,-.26],[s*.34,.025,-.32]],.014,{color:BLACK,mat:'vinyl'});k.sphere(.02,{at:[s*.34,.02,-.32],color:BLACK,mat:'vinyl'});}
  // A little gold wind-up key at the back (the bonus).
  windKey(k,'key',[0,.18,-.385],'-z',.85);
  k.hinge('spot',{axis:[1,0,0],max:1.05,detents:[.55],label:'wing cases',hint:'Open my wings',drives:[{part:'caseL',ratio:1,axis:[0,0,-1]},{part:'caseR',ratio:1,axis:[0,0,1]}]});
  return {kind:{kind:'mechanism'},
   squeeze:['e_caseopen:caseL+caseR'],poke:{default:['e_count:head'],gloveL:['clap:gloveL+gloveR'],gloveR:['clap:gloveL+gloveR'],ants:['wiggle:ants'],key:['e_march']},tap:['e_flyhop','e_caseopen:caseL+caseR'],head:'head',
   voice:{squeeze:['e_tinybuzz','click'],poke:['pip','pip:1.12','pip:1.26'],tap:['e_tinybuzz:1.3','click:1.2']}};
 },
 'grasshopper-gil':(k)=>{
  const {body,accent}=k.c,dark=k.shade(body,-.14),belly='#e9e27a';
  k.part('head',{at:[0,.38,.12]});k.part('ants',{at:[0,.66,.24],parent:'head'});k.part('legL',{at:[-.14,.3,-.1]});k.part('legR',{at:[.14,.3,-.1]});k.part('key',{at:[.15,.33,0]});k.part('ball',{at:[0,.07,.42]});
  // Thorax with a darker saddle; a long abdomen with a pale belly and segment rings; folded wings down the back.
  k.sphere(1,{at:[0,.32,0],scale:[.15,.14,.15],color:body,mat:'vinyl',seg:36});k.sphere(1,{at:[0,.375,-.02],scale:[.158,.085,.165],color:dark,mat:'vinyl',seg:36});
  k.sphere(1,{at:[0,.27,-.28],scale:[.12,.12,.26],color:body,mat:'vinyl',seg:40});k.sphere(1,{at:[0,.225,-.26],scale:[.1,.08,.22],color:belly,mat:'vinyl',seg:32});
  for(const z of [-.2,-.3,-.4]){const f=Math.sqrt(1-((z+.28)/.26)**2);k.torus(1,.05,{at:[0,.27,z],scale:[.121*f,.121*f,.4],color:dark,mat:'vinyl',seg:40});}
  for(const s of [-1,1]){k.extrude(ellPts(.055,.27,0,.27,26),.016,{at:[s*.05,.39,-.03],rot:qrot(['z',s*.1],['x',-PI/2+.22],['y',s*.06]),color:'#5e8f2c',mat:'vinyl',bevel:.005});
   k.tube([[s*.05,.41,-.06],[s*.065,.45,-.3],[s*.07,.5,-.52]],.005,{color:k.shade('#5e8f2c',.12),mat:'matte'});}
  // The head: big glossy eyes, a yellow sweatband, long antennae.
  k.sphere(.2,{part:'head',at:[0,.5,.2],color:body,mat:'vinyl'});
  k.torus(.186,.024,{part:'head',at:[0,.585,.19],rot:[PI/2-.25,0,0],color:accent,mat:'soft'});
  face(k,'head',{x:0,y:.49,surf:sphSurf(.5,.2,.2),gap:.085,size:.048,mouth:'open'});
  for(const s of [-1,1]){k.sphere(.05,{part:'head',at:[s*.17,.5,.22],scale:[.7,1,1],color:k.shade(body,-.05),mat:'vinyl'});
   k.tube([[s*.05,.66,.26],[s*.11,.82,.2],[s*.2,.9,.02],[s*.27,.88,-.12]],.008,{part:'ants',color:dark,mat:'vinyl'});}
  // Big springy hind legs (yellow chevrons on the thighs), four small legs, a football at his toes.
  for(const s of [-1,1] as const){const p=s<0?'legL':'legR',hip:V3=[s*.14,.3,-.1],knee:V3=[s*.2,.47,-.36],ank:V3=[s*.2,.05,-.2];
   const mid:V3=[(hip[0]+knee[0])/2,(hip[1]+knee[1])/2,(hip[2]+knee[2])/2],d:V3=[knee[0]-hip[0],knee[1]-hip[1],knee[2]-hip[2]];
   k.sphere(1,{part:p,at:mid,rot:upTo(d),scale:[.055,.17,.062],color:body,mat:'vinyl',seg:32});
   for(const t of [.35,.6])k.torus(.05*(1-t*.25),.008,{part:p,at:[hip[0]+d[0]*t+s*.012,hip[1]+d[1]*t,hip[2]+d[2]*t],rot:qrot(['y',PI/2],['z',.6]),arc:PI*.9,color:accent,mat:'vinyl'});
   limb(k,[knee,ank,[s*.21,.02,-.1]],.016,{part:p,color:dark,mat:'vinyl'});k.sphere(.022,{part:p,at:[s*.21,.022,-.09],color:dark,mat:'vinyl'});
   limb(k,[[s*.1,.27,.08],[s*.17,.15,.16],[s*.17,.025,.22]],.013,{color:dark,mat:'vinyl'});k.sphere(.02,{at:[s*.17,.02,.23],color:dark,mat:'vinyl'});
   limb(k,[[s*.12,.25,-.02],[s*.23,.13,-.02],[s*.25,.025,.01]],.013,{color:dark,mat:'vinyl'});k.sphere(.02,{at:[s*.25,.02,.01],color:dark,mat:'vinyl'});}
  football(k,'ball',[0,.07,.42],.07);
  windKey(k,'key',[.15,.33,0],'x');
  return {kind:{kind:'windup',key:'key',legs:['legL','legR'],gait:'hop'},soft:{soft:.4},
   squeeze:['e_legspring:legL+legR','squash'],poke:{default:['e_chirpleg:legL+legR'],legL:['e_legspring:legL'],legR:['e_legspring:legR'],ball:['shoot:ball'],ants:['wiggle:ants']},tap:['e_bighop','e_legspring:legL+legR'],head:'head',
   voice:{squeeze:['boing:1.3','e_chirp'],poke:['e_chirp'],tap:['boing:1.6','e_chirp:1.15']}};
 },
 'ant-ace':(k)=>{
  const {body,accent}=k.c,hi=k.shade(body,.08);
  k.part('head',{at:[0,.46,.04]});k.part('ants',{at:[0,.74,.1],parent:'head'});k.part('gaster',{at:[0,.25,-.3]});k.part('bottles',{at:[0,.95,.08]});k.part('key',{at:[.12,.34,-.02]});
  // Thorax in an orange vest (a white number stripe), the waist node, four legs in orange sneakers, two arms up.
  k.sphere(1,{at:[0,.33,0],scale:[.11,.13,.12],color:body,mat:'vinyl',seg:36});k.sphere(1,{at:[0,.365,.004],scale:[.118,.085,.127],color:accent,mat:'soft',seg:36});
  k.rbox(.03,.075,.012,.006,{at:[0,.37,.128],rot:[-.2,0,0],color:WHITE,mat:'matte'});k.sphere(.048,{at:[0,.27,-.12],color:body,mat:'vinyl'});
  for(const s of [-1,1]){for(const [a,b,c] of [[[s*.09,.29,.04],[s*.22,.31,.1],[s*.27,.04,.15]],[[s*.09,.28,-.05],[s*.22,.3,-.14],[s*.26,.04,-.24]]] as const){
    limb(k,[a,b,c],.018,{color:body,mat:'vinyl'});k.sphere(1,{at:[c[0],.027,c[2]+.015],scale:[.036,.027,.05],color:accent,mat:'vinyl',seg:24});k.rbox(.05,.008,.07,.004,{at:[c[0],.005,c[2]+.015],color:WHITE,mat:'matte'});}
   limb(k,[[s*.1,.42,.06],[s*.27,.62,.1],[s*.19,.88,.08]],.018,{color:body,mat:'vinyl'});k.sphere(.036,{at:[s*.19,.885,.08],color:body,mat:'vinyl'});}
  // The striped abdomen (a take-apart piece).
  k.sphere(1,{part:'gaster',at:[0,.25,-.3],scale:[.17,.16,.2],color:hi,mat:'vinyl',seg:40});
  for(const z of [-.24,-.34]){const f=Math.sqrt(1-((z+.3)/.2)**2);k.torus(1,.07,{part:'gaster',at:[0,.25,z],scale:[.171*f,.161*f,.3],color:k.shade(body,.2),mat:'vinyl',seg:40});}
  // The head: cream eye backs (a dark face never hides them), little mandibles, an orange sweatband, elbowed antennae.
  k.sphere(.17,{part:'head',at:[0,.6,.06],color:body,mat:'vinyl'});
  k.torus(.163,.022,{part:'head',at:[0,.665,.05],rot:[PI/2-.18,0,0],color:accent,mat:'soft'});
  face(k,'head',{x:0,y:.6,surf:sphSurf(.6,.17,.06),gap:.072,size:.04,mouth:'open',back:'#fff4dc',lip:'#e0647a',blush:'#ff8f8f'});
  for(const s of [-1,1]){k.torus(.025,.008,{part:'head',at:[s*.035,.495,.19],rot:[-.5,0,s*.6],arc:PI*1.2,color:k.shade(body,-.1),mat:'vinyl'});
   k.tube([[s*.05,.74,.12],[s*.1,.82,.14],[s*.19,.83,.2]],.009,{part:'ants',color:body,mat:'vinyl'});k.sphere(.022,{part:'ants',at:[s*.195,.83,.205],color:accent,mat:'vinyl'});}
  // The team's water bottles in an orange crate, held up high (the first piece off).
  k.rbox(.36,.07,.16,.02,{part:'bottles',at:[0,.93,.08],color:accent,mat:'vinyl'});k.rbox(.34,.012,.14,.004,{part:'bottles',at:[0,.966,.08],color:k.shade(accent,-.15),mat:'matte'});
  for(const x of [-.11,0,.11]){k.cyl(.036,.036,.15,{part:'bottles',at:[x,1.03,.08],color:'#9fdcff',mat:'jelly',seg:24});k.cyl(.037,.037,.04,{part:'bottles',at:[x,1.02,.08],color:'#2f86d6',mat:'vinyl',seg:24});
   k.cyl(.02,.03,.025,{part:'bottles',at:[x,1.118,.08],color:'#9fdcff',mat:'jelly',seg:16});k.cyl(.022,.022,.022,{part:'bottles',at:[x,1.14,.08],color:WHITE,mat:'vinyl',seg:16});}
  windKey(k,'key',[.12,.34,-.02],'x',.8);
  return {kind:{kind:'puzzle',pieces:[{part:'bottles',name:'the water bottles'},{part:'head',name:'the head',after:['bottles']},{part:'gaster',name:'the abdomen'}]},
   squeeze:['e_liftcrumb:bottles'],poke:{default:['wiggle:ants'],bottles:['e_liftcrumb:bottles'],key:['e_march']},tap:['e_march','wiggle:ants'],head:'head',
   voice:{squeeze:['d_hup:1.4'],poke:['tok:1.4','tok:1.6'],tap:['e_taptap']}};
 },
 'dragonfly-dax':(k)=>{
  const {body,accent}=k.c;
  k.part('head',{at:[0,.5,.1]});k.part('wingL',{at:[-.04,.555,.03]});k.part('wingR',{at:[.04,.555,.03]});k.part('tag',{at:[0,.36,-.56]});
  // A lily pad base (veins, a pink flower), a reed, and Dax balancing on its tip.
  const pad:Pt[]=[[0,0],...Array.from({length:40},(_,i)=>{const a=.22+i/39*(PI*2-.44);return [Math.sin(a)*.34,Math.cos(a)*.34] as Pt;})];
  k.extrude(pad,.035,{at:[0,.02,0],rot:[-PI/2,0,0],color:'#5cae5a',mat:'vinyl',bevel:.012});
  for(let i=0;i<7;i++){const a=.6+i/6*(PI*2-1.2);k.tube([[0,.039,0],[Math.sin(a)*.16,.04,-Math.cos(a)*.16],[Math.sin(a)*.3,.039,-Math.cos(a)*.3]],.005,{color:'#8fd07a',mat:'matte'});}
  for(let i=0;i<6;i++){const a=i/6*PI*2;k.sphere(1,{at:[.2+Math.sin(a)*.035,.06,.16+Math.cos(a)*.035],rot:[Math.cos(a)*.6,0,-Math.sin(a)*.6],scale:[.03,.045,.03],color:'#ff9ec4',mat:'vinyl',seg:20});}
  k.sphere(.025,{at:[.2,.075,.16],color:'#ffd447',mat:'vinyl'});
  rod(k,[0,.035,0],[0,.45,0],.012,{color:'#6a9a3a',mat:'vinyl'});k.extrude(ellPts(.03,.09,0,.09,16),.008,{at:[0,.3,0],rot:[0,.6,-.5],color:'#6a9a3a',mat:'vinyl',bevel:.003});
  // The body: a mint thorax with cyan bands, a long segmented tail.
  k.sphere(1,{at:[0,.5,.03],scale:[.085,.085,.1],color:accent,mat:'vinyl',seg:32});for(const z of [-.01,.06])k.torus(.08,.01,{at:[0,.5,z],scale:[1,1,.8],color:body,mat:'vinyl'});
  for(let i=0;i<9;i++){const z=-.08-i*.055,r=.044-i*.003;k.capsule(r,.032,{at:[0,.5+i*.005,z],rot:[PI/2,0,0],color:i%2?accent:body,mat:'vinyl'});}
  for(const s of [-1,1])k.capsule(.008,.03,{at:[s*.015,.55,-.57],rot:[PI/2+.4,0,s*.3],color:body,mat:'vinyl'});
  // The head: big round eyes on the front.
  k.sphere(.13,{part:'head',at:[0,.54,.17],color:body,mat:'vinyl'});
  face(k,'head',{x:0,y:.555,surf:sphSurf(.54,.13,.17),gap:.062,size:.04,mouth:'open'});
  // Four long clear wings with a mint leading vein, a cyan wing spot and the gold balancing weights at the tips.
  for(const [p,s] of [['wingL',-1],['wingR',1]] as const){const root:V3=[s*.04,.555,.03];
   for(const [yaw,len,w,dy] of [[.2,.42,.09,0],[-.16,.38,.1,-.012]] as const){const rot=qrot(['x',-PI/2],['y',s*yaw],['z',-s*.08]);
    k.extrude(ellPts(len/2,w/2,s*len/2,0,30),.006,{part:p,at:[root[0],root[1]+dy,root[2]],rot,color:'#e8fbff',mat:'jelly',bevel:.002});
    const tv=new T.Vector3(s*len,0,0).applyQuaternion(new T.Quaternion().setFromEuler(new T.Euler(...rot))),tipD:V3=[tv.x,tv.y+dy,tv.z],tip:V3=[root[0]+tipD[0],root[1]+tipD[1],root[2]+tipD[2]];
    k.tube([[root[0],root[1]+dy+.006,root[2]+.01],[root[0]+tipD[0]*.5,root[1]+tipD[1]*.5+.006,root[2]+tipD[2]*.5+.02],[tip[0]*.98,tip[1]+.004,tip[2]+.006]],.004,{part:p,color:accent,mat:'vinyl'});
    k.box(.035,.006,.018,{part:p,at:[root[0]+tipD[0]*.86,root[1]+tipD[1]*.86+.005,root[2]+tipD[2]*.86+.012],rot:[0,s*yaw,0],color:k.shade(body,-.2),mat:'vinyl'});
    if(yaw>0)k.sphere(.022,{part:p,at:[tip[0],tip[1],tip[2]],color:GOLD,mat:'gold'});}}
  // A mini football on a short ball chain off the tail tip (the charm).
  football(k,'tag',[0,.31,-.56],.045);
  k.chain({mode:'dangle',from:'body',at:[0,.53,-.56],length:.17,links:5,tag:'tag',color:'#d9c27a'});
  return {kind:{kind:'spintop'},
   squeeze:['e_buzz:wingL+wingR'],poke:{default:['d_hover','e_buzz:wingL+wingR'],wingL:['e_buzz:wingL'],wingR:['e_buzz:wingR']},tap:['e_dart','e_buzz:wingL+wingR'],head:'head',
   voice:{squeeze:['e_wingbuzz'],poke:['e_wingbuzz:1.2'],tap:['e_zip','e_zip:1.25']}};
 },
 'firefly-fia':(k)=>{
  const {body,accent}=k.c,olive=accent,salmon='#ff8f6e';
  k.part('lantern',{at:[0,.24,0]});k.part('head',{at:[0,.48,.02]});k.part('antL',{at:[-.07,.8,.06],parent:'head'});k.part('antR',{at:[.07,.8,.06],parent:'head'});
  k.part('wingL',{at:[-.07,.5,-.12]});k.part('wingR',{at:[.07,.5,-.12]});k.part('moon',{at:[0,.585,-.235]});
  // The glowing jelly lantern belly: amber segment rings round a bright core.
  k.sphere(1,{part:'lantern',at:[0,.24,0],scale:[.23,.22,.21],color:body,mat:'jelly',seg:48});k.sphere(.14,{part:'lantern',at:[0,.23,0],color:'#fff6c0',mat:'ink'});
  for(const y of [.13,.24,.35]){const f=Math.sqrt(1-((y-.24)/.22)**2);k.torus(.232*f,.011,{part:'lantern',at:[0,y,0],rot:[PI/2,0,0],scale:[1,.913,1],color:'#f0a830',mat:'vinyl'});}
  // A dark thorax with little arms and feet.
  k.sphere(1,{at:[0,.455,-.01],scale:[.15,.08,.13],color:olive,mat:'vinyl',seg:32});
  for(const s of [-1,1]){k.capsule(.026,.08,{at:[s*.19,.42,.03],rot:[0,0,s*.9],color:olive,mat:'vinyl'});k.sphere(.032,{at:[s*.235,.385,.04],color:olive,mat:'vinyl'});
   k.sphere(1,{at:[s*.09,.03,.14],scale:[.045,.03,.06],color:olive,mat:'vinyl',seg:24});}
  // The head: white eye backs, a salmon-pink shield hood with two dark spots, glowing antenna tips.
  k.sphere(.18,{part:'head',at:[0,.6,.03],color:olive,mat:'vinyl'});
  k.sphere(1,{part:'head',at:[0,.68,-.04],scale:[.21,.15,.2],color:salmon,mat:'vinyl',seg:44});
  for(const s of [-1,1]){const {p,n}=onEll([0,.68,-.04],[.21,.15,.2],[s*.35,.85,.3]);spot(k,p,n,.045,{part:'head',color:olive,mat:'vinyl'});}
  face(k,'head',{x:0,y:.6,surf:sphSurf(.6,.18,.03),gap:.075,size:.04,mouth:'open',back:'#ffffff',lip:'#d8475e'});
  for(const [p,s] of [['antL',-1],['antR',1]] as const){k.tube([[s*.07,.8,.06],[s*.12,.9,.1],[s*.17,.96,.13]],.008,{part:p,color:olive,mat:'vinyl'});k.sphere(.028,{part:p,at:[s*.172,.965,.132],color:'#ffe066',mat:'jelly'});}
  // Wing cases on the back like a little cape, with yellow edges.
  for(const [p,s] of [['wingL',-1],['wingR',1]] as const){k.sphere(1,{part:p,at:[s*.11,.37,-.17],rot:[.28,0,-s*.28],scale:[.1,.2,.045],color:olive,mat:'vinyl',seg:36});
   k.tube([[s*.07,.54,-.15],[s*.18,.42,-.16],[s*.18,.22,-.2]],.009,{part:p,color:body,mat:'vinyl'});}
  // A gold crescent moon on a ball chain at the back of her hood (the charm).
  k.torus(.05,.016,{part:'moon',at:[0,.52,-.235],arc:PI*1.25,rot:[0,0,-PI*.1],color:'#ffd447',mat:'gold'});
  k.chain({mode:'dangle',from:'body',at:[0,.75,-.235],length:.165,links:5,tag:'moon',color:'#d9c27a'});
  return {kind:{kind:'jelly'},soft:{soft:.5,jelly:true},springs:[{part:'antL',k:60,c:2.4,amp:1.2},{part:'antR',k:66,c:2.4,amp:1.2}],
   squeeze:['glow','e_lanternpulse:lantern'],poke:{default:['blink','e_lanternpulse:lantern'],wingL:['flap:wingL'],wingR:['flap:wingR']},tap:['e_flash3:lantern','glow','sparkle'],head:'head',
   voice:{squeeze:['e_twinkle'],poke:['ting:1.3'],tap:['e_twinkle:1.25','sparkle']}};
 },
 'monarch-mara':(k)=>{
  const orange=k.c.body,pale='#ffad5c',black=BLACK;
  // The secret capsule is a jade chrysalis: glitter green, a black-and-gold band, gold dots.
  secretCapsule(k,{top:'#5cc99a',topMat:'glitter',bot:'#3aa877',botMat:'glitter',rim:'#ffd447',mark:'#ffd447',markMat:'gold',band:{color:'#1d2b24',dot:'#ffd447'}});
  k.part('head',{at:[0,.5,.02],parent:'inner'});k.part('wingL',{at:[-.03,.45,-.03],parent:'inner'});k.part('wingR',{at:[.03,.45,-.03],parent:'inner'});k.part('flower',{at:[.25,.04,.13],parent:'inner'});
  // A milkweed leaf to stand on.
  k.extrude(ellPts(.38,.16,0,0,32),.03,{part:'inner',at:[0,.02,0],rot:qrot(['x',-PI/2],['y',.35]),color:LEAF,mat:'vinyl',bevel:.01});
  k.tube([[-.34,.038,.12],[0,.04,0],[.34,.038,-.12]],.006,{part:'inner',color:'#a6d97a',mat:'matte'});
  // The body: black, dotted white; little legs to the leaf.
  k.sphere(1,{part:'inner',at:[0,.27,0],scale:[.05,.12,.05],color:black,mat:'vinyl',seg:28});k.sphere(1,{part:'inner',at:[0,.42,0],scale:[.07,.08,.065],color:black,mat:'vinyl',seg:28});
  for(const [y,z] of [[.4,.06],[.44,.058],[.3,.045],[.24,.045]] as const)for(const s of [-1,1])k.sphere(.009,{part:'inner',at:[s*.022,y,z],color:WHITE,mat:'matte'});
  for(const s of [-1,1])for(const dz of [-.02,.03])limb(k,[[s*.03,.36,dz],[s*.08,.2,dz*2],[s*.1,.04,dz*3]],.007,{part:'inner',color:black,mat:'vinyl'});
  k.sphere(.11,{part:'head',at:[0,.58,.02],color:black,mat:'vinyl'});
  face(k,'head',{x:0,y:.585,surf:sphSurf(.58,.11,.02),gap:.048,size:.03,mouth:'open',back:'#ffffff',lip:'#d8475e'});
  for(const s of [-1,1]){k.tube([[s*.03,.68,.03],[s*.07,.76,.05],[s*.12,.82,.04]],.005,{part:'head',color:black,mat:'vinyl'});k.sphere(.016,{part:'head',at:[s*.122,.822,.04],color:black,mat:'vinyl'});}
  // The wings: orange above with black veins and a black border dotted white; paler orange underneath (a real monarch's).
  const fore=new T.Shape();fore.moveTo(0,.06);fore.bezierCurveTo(-.08,.2,-.2,.31,-.31,.3);fore.bezierCurveTo(-.37,.29,-.35,.18,-.31,.11);fore.bezierCurveTo(-.24,.04,-.11,.0,0,.0);
  const hind=new T.Shape();hind.moveTo(0,.01);hind.bezierCurveTo(-.11,.01,-.26,-.02,-.28,-.11);hind.bezierCurveTo(-.3,-.22,-.19,-.3,-.1,-.28);hind.bezierCurveTo(-.04,-.26,0,-.15,0,-.05);
  for(const [p,s] of [['wingL',-1],['wingR',1]] as const){const at:V3=[s*.03,.45,-.03],m=-s,mx=(pts:Pt[])=>pts.map(([x,y])=>[x*m,y] as Pt);
   for(const sh of [fore,hind]){const o=outline(sh,36),cx=o.reduce((a,q)=>a+q[0],0)/o.length,cy=o.reduce((a,q)=>a+q[1],0)/o.length,ins=(f:number)=>o.map(([x,y])=>[cx+(x-cx)*f,cy+(y-cy)*f] as Pt);
    k.extrude(mx(o),.018,{part:p,at,color:black,mat:'vinyl',bevel:.004});
    k.extrude(mx(ins(.8)),.006,{part:p,at:[at[0],at[1],at[2]+.0105],color:orange,mat:'vinyl',bevel:.0015});k.extrude(mx(ins(.8)),.006,{part:p,at:[at[0],at[1],at[2]-.0105],color:pale,mat:'vinyl',bevel:.0015});
    for(const t of [.15,.42,.7]){const q=o[Math.floor(o.length*(.08+t*.5))],e:V3=[m*(cx+(q[0]-cx)*.82),cy+(q[1]-cy)*.82,0];
     for(const dz of [.0145,-.0145])k.tube([[at[0],at[1]+cy*.4,at[2]+dz],[at[0]+e[0]*.55,at[1]+e[1]*.55+cy*.2,at[2]+dz],[at[0]+e[0],at[1]+e[1],at[2]+dz]],.003,{part:p,color:black,mat:'vinyl'});}
    for(let i=3;i<o.length;i+=6){const [x,y]=o[i];if(Math.hypot(x,y)<.12)continue;const d:V3=[at[0]+m*(cx+(x-cx)*.9),at[1]+cy+(y-cy)*.9,0];
     for(const dz of [.0105,-.0105])k.sphere(.009,{part:p,at:[d[0],d[1],at[2]+dz*1.02],scale:[1,1,.4],color:WHITE,mat:'matte',seg:8});}}}
  // A pink milkweed flower (the extra part).
  rod(k,[.25,.04,.13],[.25,.2,.13],.008,{part:'flower',color:'#7bbf55',mat:'vinyl'});
  for(let i=0;i<10;i++){const a=i*2.4,r=i?.035+(i%3)*.012:0;k.sphere(.024,{part:'flower',at:[.25+Math.sin(a)*r,.225+(i?-.004*(i%3):.012),.13+Math.cos(a)*r],color:i%2?'#ff8fb5':'#ffb3cc',mat:'vinyl'});}
  // Tip her head into a bow and both wings fold behind her; let go and they open again (a small grab target: the wings stay squeezable).
  k.lever('head',{axis:[1,0,0],max:.3,label:'wings',hint:'Fold my wings',drives:[{part:'wingL',ratio:4,axis:[0,-1,0]},{part:'wingR',ratio:4,axis:[0,1,0]}]});
  return {kind:{kind:'capsule',top:'capTop',bottom:'capBot',inner:'inner'},
   squeeze:['e_wingfold:wingL+wingR'],poke:{default:['e_flutter:wingL+wingR'],wingL:['e_flutter:wingL'],wingR:['e_flutter:wingR'],flower:['wiggle:flower']},tap:['e_wingspread:wingL+wingR','sparkle'],head:'head',
   voice:{squeeze:['d_flutter','e_gliss:.8'],poke:['d_flutter:1.2'],tap:['e_gliss','sparkle']}};
 },
};
export default set;
