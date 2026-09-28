import * as T from 'three';
import {LUMBAR_HEIGHT,CHEST_HEIGHT} from './spineSurface';
import {shirtDigitAtlas,shirtInk,SHIRT_NUMBER_COVER_GLSL,BEAN_NUMBER_U,BEAN_DIGIT_HEIGHT} from './shirtNumbers';
import {styleIndexRange} from './playerBatch';
import {BEAN_EYES,BEAN_MOUTHS,BEAN_EXPRESSIONS,defaultBeanLookFor,defaultOutfitForTeam,
 type BeanLook,type Outfit,type BeanExpression,type BeanBuild,type BeanEyes,type BeanMouth} from './beanLook';

/*
 * Bean skin (docs/bean-characters/CONTRACT.md, lane A): a production port of the "Bean buddies" prototype, driven
 * by the motion solver's hidden joints. Everything a bean needs is drawn by FOUR meshes that share geometry,
 * programs and textures across every rig:
 *
 *  - body:  one bean geometry for every build. The shape (height, width, taper, belly, lean) and the spine bend
 *           (lumbar/chest rotations, true weighted rotation, exactly matching the chest joint at the top) are
 *           evaluated in the vertex shader from per-instance data. Kit bands, the face panel (a SHARED face atlas,
 *           one cell per expression × eyes × mouth, chosen per instance) and the back number (the shared shirt
 *           digit atlas) are shaded in its fragment shader, so the face and number cost no extra draw.
 *  - limbs: four noodle tubes + two mittens + two boots in one geometry. Tubes are bent in the vertex shader
 *           along a continuous curve (straight → circular arc → straight) from shoulder/hip through elbow/knee to
 *           hand/ankle; mittens/boots follow the hand/ankle joint frames.
 *  - hair / hat: every style in one geometry each; the instance's style id keeps its vertices, others collapse.
 *
 * Per-instance data (colours, shape, face cell, number, spine rotations, limb control points and end frames) is
 * one row of a float RGBA data texture: `playerBatch` gives each batch its own texture with one row per
 * instance (gl_InstanceID), an individually rendered rig uses its own one-row texture. No per-rig programs,
 * no per-rig textures beyond that row, no per-frame geometry uploads.
 */

// ---------------------------------------------------------------- per-instance data layout (texels, RGBA float)
export const BD={shirt:0,shirt2:1,shorts:2,socks:3,socks2:4,boots:5,body:6,skin:7,blush:8,hands:9,hair:10,hat1:11,hat2:12,
 shape0:13,shape1:14,misc:15,lumbar:16,chest:17,limbs:18,frames:34,size:46} as const;
/** Texels the body / hair / hat shaders read (a prefix of the row); the limbs read all of it. */
export const BEAN_STATIC_WIDTH=18;

// ---------------------------------------------------------------- shape (mirrors the GLSL exactly)
export type BeanShape={H:number;W:number;D:number;taper:number;belly:number;leanX:number;leanZ:number};
export const BEAN_SHAPES:Record<BeanBuild,BeanShape>={
 regular:{H:.86,W:.25,D:.88,taper:.12,belly:.06,leanX:0,leanZ:.05},
 tall:{H:.98,W:.222,D:.88,taper:.2,belly:.05,leanX:0,leanZ:.05},
 short:{H:.74,W:.262,D:.9,taper:.08,belly:.11,leanX:0,leanZ:.06},
 wide:{H:.86,W:.296,D:.92,taper:-.04,belly:.1,leanX:0,leanZ:.05},
};
const Y0=-.13,FACE_U=.775,FACE_RX=.2,FACE_RY=.17;
/**
 * Kit bands as fractions of the bean height: shorts, shirt (up to just under the face panel, so a player reads as
 * their team first at match distance), a collar stripe, then the kid's own body colour on the crown.
 */
export const BEAN_BANDS={shorts:.1,shirt:.585,collar:.612};
export function beanRadius(s:BeanShape,u:number){
 const uu=Math.min(1,Math.max(0,u)),e=Math.abs(2*uu-1),n=uu>.5?2.3:2.1;
 return s.W*Math.pow(Math.max(0,1-Math.pow(e,n)),1/n)*(1+s.taper*(uu-.5))*(1+.04*Math.sin(uu*Math.PI*2-1.2));
}
/** Torso-space point on the (unbent) bean at height fraction u and angle a (a = 0 is the front, +z). */
export function beanPoint(s:BeanShape,u:number,a:number,out=new T.Vector3()){
 const span=s.H-Y0,uu=Math.min(1,Math.max(0,u)),r=beanRadius(s,uu);
 let x=Math.sin(a)*r,z=Math.cos(a)*r*s.D;
 if(z>0)z*=1+s.belly*Math.sin(Math.PI*uu)*(1-uu*.6);
 x+=s.leanX*uu*uu*span;z+=s.leanZ*uu*uu*span;
 return out.set(x,Y0+uu*span,z);
}
/** Head frame for hats and hair features: origin and radius R (torso space), as in the prototype. */
export function beanHeadFrame(s:BeanShape){
 const uh=.84,span=s.H-Y0,R=beanRadius(s,uh)*1.06;
 return {R,origin:new T.Vector3(s.leanX*uh*uh*span,Y0+uh*span+.3*R,s.leanZ*uh*uh*span+.04*R)};
}

// ---------------------------------------------------------------- body dims + attachment points (API for other lanes)
/**
 * Bean body dimensions in 'armor-torso' local metres (the bean mesh is a child of armor-torso and matches this
 * exactly before the spine bend). The FACE lives on the torso bean (front, around `faceY`), not on player-head:
 * hiding player-head does not hide the face. The spine bend rotates the upper bean with the lumbar/chest joints;
 * above y ≈ .38 it follows 'player-chest' exactly, so head-level attachments belong on player-chest (use the
 * `chest` variants, already offset by CHEST_HEIGHT). Hands and feet are the solver joints themselves
 * ('left-hand'/'right-hand', 'left-ankle'/'right-ankle'). `rig.root.userData.beanBody` holds these dims while
 * the bean skin shows (undefined in classic style or while a classic costume shows).
 */
export type BeanBodyDims={
 build:BeanBuild;y0:number;H:number;W:number;D:number;belly:number;taper:number;lean:[number,number];
 /** Face panel centre as a fraction of the height, its y, and its half extents (arc length, height). */
 faceU:number;faceY:number;faceRX:number;faceRY:number;
 numberU:number;
 radius:(u:number)=>number;
 /** Surface point at height fraction u and angle a (0 = front, π/2 = the bean's left, x+). */
 point:(u:number,a:number,out?:T.Vector3)=>T.Vector3;
 /** Hat frame: origin and radius R (hats are modelled in R units round this origin). */
 head:{R:number;origin:T.Vector3;top:T.Vector3};
 /** Ground-guard spheres [y, radius, …] (torso space, conservative: the bean's radius at seven heights). */
 ground:number[];
 attach:{
  /** Crown top, a hood rim centre (behind/around the face) and the upper back, torso space; `chest` = player-chest local. */
  headTop:T.Vector3;hood:T.Vector3;back:T.Vector3;tail:T.Vector3;frontBelly:T.Vector3;
  chest:{headTop:T.Vector3;hood:T.Vector3;back:T.Vector3};
 };
};
export function beanBodyDims(build:BeanBuild='regular'):BeanBodyDims{
 const s=BEAN_SHAPES[build]??BEAN_SHAPES.regular,span=s.H-Y0,{R,origin}=beanHeadFrame(s);
 const top=beanPoint(s,1,0),headTop=top.clone(),hood=beanPoint(s,FACE_U,0).setZ(0),back=beanPoint(s,.72,Math.PI),tail=beanPoint(s,.12,Math.PI),frontBelly=beanPoint(s,.3,0);
 const toChest=(v:T.Vector3)=>v.clone().setY(v.y-CHEST_HEIGHT);
 const ground:number[]=[];for(const u of [.06,.18,.33,.5,.66,.8,.92])ground.push(+(Y0+u*span).toFixed(4),+Math.min(beanRadius(s,u),beanRadius(s,u)*(1+s.belly)).toFixed(4));
 return {build,y0:Y0,H:s.H,W:s.W,D:s.D,belly:s.belly,taper:s.taper,lean:[s.leanX,s.leanZ],ground,
  faceU:FACE_U,faceY:Y0+FACE_U*span,faceRX:FACE_RX,faceRY:FACE_RY,numberU:BEAN_NUMBER_U,
  radius:u=>beanRadius(s,u),point:(u,a,out)=>beanPoint(s,u,a,out),head:{R,origin,top},
  attach:{headTop,hood,back,tail,frontBelly,chest:{headTop:toChest(headTop),hood:toChest(hood),back:toChest(back)}}};
}

// ---------------------------------------------------------------- noodle limb curve (mirrors the GLSL exactly)
/** Per limb type: K caps the fillet tangent length (fraction of the shorter segment), RHO the preferred bend radius. */
export const LIMB_ARM={r0:.058,r1:.045,bulge:.1,K:.44,RHO:.5},LIMB_LEG={r0:.068,r1:.05,bulge:.06,K:.42,RHO:.5};
export type BeanLimbCurve={P0:T.Vector3;P2:T.Vector3;d1:T.Vector3;m:T.Vector3;A:T.Vector3;Cc:T.Vector3;E:T.Vector3;T2:T.Vector3;h:T.Vector3;rho:number;th:number;L1a:number;Larc:number;L3:number;S:number;l1:number;l2:number};
const _e1=new T.Vector3(),_e2=new T.Vector3(),_d2=new T.Vector3(),_hp=new T.Vector3(),_mt=new T.Vector3(),_mfb=new T.Vector3();
/**
 * A continuous curve through the limb joints: straight from P0 toward P1, a circular fillet round P1, straight
 * to P2. The fillet's tangent length is capped (K × the shorter segment) so the curve never folds into a cusp;
 * at a full fold the arc shrinks toward a point and the tube rounds over it at full radius. Endpoints are exact.
 */
export function beanLimbCurve(P0:T.Vector3,P1:T.Vector3,P2:T.Vector3,h:T.Vector3,sgn:number,K:number,RHO:number,out?:BeanLimbCurve):BeanLimbCurve{
 const L=out??{P0:new T.Vector3(),P2:new T.Vector3(),d1:new T.Vector3(),m:new T.Vector3(),A:new T.Vector3(),Cc:new T.Vector3(),E:new T.Vector3(),T2:new T.Vector3(),h:new T.Vector3(),rho:0,th:0,L1a:0,Larc:0,L3:0,S:0,l1:0,l2:0};
 L.P0.copy(P0);L.P2.copy(P2);
 _e1.subVectors(P1,P0);_e2.subVectors(P2,P1);const l1=_e1.length(),l2=_e2.length();
 if(l1>1e-5)L.d1.copy(_e1).divideScalar(l1);else if(l2>1e-5)L.d1.copy(_e2).divideScalar(l2);else L.d1.set(0,-1,0);
 if(l2>1e-5)_d2.copy(_e2).divideScalar(l2);else _d2.copy(L.d1);
 const c=Math.min(1,Math.max(-1,L.d1.dot(_d2))),th=Math.acos(c);
 _hp.copy(h).addScaledVector(L.d1,-h.dot(L.d1));const hl=_hp.length();
 if(hl>1e-4)_hp.divideScalar(hl);else{_hp.set(Math.abs(L.d1.x)<.9?1:0,0,Math.abs(L.d1.x)<.9?0:1).cross(L.d1).normalize();}
 _mfb.crossVectors(_hp,L.d1).multiplyScalar(sgn);
 _mt.copy(_d2).addScaledVector(L.d1,-c);const sl=_mt.length();
 L.m.copy(_mfb);
 // The true in-plane bend direction whenever the joint bends at all (the arc then ends exactly along the lower
 // segment: no kink). Only a dead-straight or exactly folded limb, where it is undefined, uses the hinge side.
 if(sl>1e-3)L.m.copy(_mt).divideScalar(sl);
 // Ring-frame reference: the bend plane's normal. Both straight parts and the arc lie in that plane, so the
 // reference is perpendicular to every tangent and constant along the limb: rings never twist or flip.
 L.h.crossVectors(L.d1,L.m).normalize();
 const tanHalf=Math.sqrt(Math.max(0,1-c)/Math.max(1e-6,1+c));
 const a=Math.min(RHO*tanHalf,K*Math.min(l1,l2));
 const rho=Math.min(a/Math.max(tanHalf,1e-5),RHO);
 L.th=th;L.rho=rho;L.l1=l1;L.l2=l2;
 L.A.copy(P1).addScaledVector(L.d1,-a);
 L.Cc.copy(L.A).addScaledVector(L.m,rho);
 L.E.copy(L.Cc).addScaledVector(L.m,-rho*Math.cos(th)).addScaledVector(L.d1,rho*Math.sin(th));
 _e1.subVectors(P2,L.E);const l3=_e1.length();
 if(l3>1e-5)L.T2.copy(_e1).divideScalar(l3);else L.T2.copy(L.d1).multiplyScalar(Math.cos(th)).addScaledVector(L.m,Math.sin(th)).normalize();
 L.L1a=Math.max(l1-a,0);L.Larc=rho*th;L.L3=l3;L.S=Math.max(L.L1a+L.Larc+l3,1e-4);
 return L;
}
/** Centre, tangent and arc length at (section 1 straight, 2 arc, 3 straight; t 0..1). */
export function beanLimbAt(L:BeanLimbCurve,section:number,t:number,c:T.Vector3,tan:T.Vector3){
 if(section<1.5){c.lerpVectors(L.P0,L.A,t);tan.copy(L.d1);return t*L.L1a;}
 if(section<2.5){const ph=t*L.th;c.copy(L.Cc).addScaledVector(L.m,-L.rho*Math.cos(ph)).addScaledVector(L.d1,L.rho*Math.sin(ph));tan.copy(L.d1).multiplyScalar(Math.cos(ph)).addScaledVector(L.m,Math.sin(ph)).normalize();return L.L1a+L.rho*ph;}
 c.lerpVectors(L.E,L.P2,t);tan.copy(L.T2);return L.L1a+L.Larc+t*L.L3;
}
/** Ring frame: B is the curve's plane normal (L.h) made orthogonal to the tangent, N = B × T. */
export function beanRingFrame(h:T.Vector3,tan:T.Vector3,N:T.Vector3,B:T.Vector3){
 B.copy(h).addScaledVector(tan,-h.dot(tan));
 if(B.lengthSq()<1e-8)B.set(Math.abs(tan.x)<.9?1:0,0,Math.abs(tan.x)<.9?0:1).addScaledVector(tan,-(Math.abs(tan.x)<.9?tan.x:tan.z));
 B.normalize();N.crossVectors(B,tan);
}
export function beanLimbRadius(r0:number,r1:number,bulge:number,f:number){return Math.max((r0+(r1-r0)*f)*(1+bulge*Math.sin(Math.PI*f)),.015);}
/** Tube rings along each limb: [section, t]. Caps (0, 4) round both ends; the arc gets the densest sampling. */
export const LIMB_RINGS:[number,number][]=[[0,0],[0,.4],[0,.75],[1,0],[1,.34],[1,.67],...Array.from({length:10},(_,i)=>[2,i/10] as [number,number]),[3,0],[3,.34],[3,.67],[3,1],[4,.25],[4,.6],[4,1]];
const LIMB_RADIAL=10;

const _lc=new T.Vector3(),_lt=new T.Vector3(),_ln=new T.Vector3(),_lb=new T.Vector3(),_lo=new T.Vector3(),_la=new T.Vector3(),_l1=new T.Vector3(),_l2=new T.Vector3(),_lh=new T.Vector3();
let _curve:BeanLimbCurve|undefined;
/**
 * CPU mirror of the limbs vertex shader: the root-space position (and normal) of one limbs-geometry vertex for a
 * data row. `limb` = the vertex's beanLimb attribute (part, section, t, angle); `local` = beanLocal (rigid parts).
 * Used by tests (joint endpoints, continuity, GPU parity), never per frame.
 */
export function evalLimbVertex(data:Float32Array,limb:[number,number,number,number],local:T.Vector3,out:T.Vector3,normal?:T.Vector3){
 const tx=(k:number,o:T.Vector3)=>o.set(data[k*4],data[k*4+1],data[k*4+2]),w=(k:number)=>data[k*4+3];
 const [part,sec,t,ang]=limb;
 if(part<3.5){
  const k=Math.round(part),base=BD.limbs+4*k,arm=k<2,spec=arm?LIMB_ARM:LIMB_LEG;
  _curve=beanLimbCurve(tx(base,_la),tx(base+1,_l1),tx(base+2,_l2),tx(base+3,_lh),w(base+3),spec.K,spec.RHO,_curve);
  const s=sec<.5?beanLimbAt(_curve,1,0,_lc,_lt):sec>3.5?beanLimbAt(_curve,3,1,_lc,_lt):beanLimbAt(_curve,sec,t,_lc,_lt);
  const f=s/_curve.S,r=Math.max((w(base)+(w(base+1)-w(base))*f)*w(BD.shape1)*(1+w(base+2)*Math.sin(Math.PI*f)),.015);
  beanRingFrame(_lh,_lt,_ln,_lb);_lo.copy(_ln).multiplyScalar(Math.cos(ang)).addScaledVector(_lb,Math.sin(ang));
  let al=0,dir=0;if(sec<.5){al=(1-t)*Math.PI/2;dir=-1;}else if(sec>3.5){al=t*Math.PI/2;dir=1;}
  out.copy(_lc).addScaledVector(_lt,dir*r*Math.sin(al)).addScaledVector(_lo,r*Math.cos(al));
  normal?.copy(_lo).multiplyScalar(Math.cos(al)).addScaledVector(_lt,dir*Math.sin(al)).normalize();
  return {s,S:_curve.S,r,centre:_lc,tangent:_lt,frameN:_ln,frameB:_lb};
 }
 const fi=Math.round(part-4),base=BD.frames+3*fi,sc=fi<2?w(BD.hands):1,x=local.x*sc,y=local.y*sc,z=local.z*sc;
 const row=(k:number)=>data[k*4]*x+data[k*4+1]*y+data[k*4+2]*z+data[k*4+3];
 out.set(row(base),row(base+1),row(base+2));
 return undefined;
}

// ---------------------------------------------------------------- face atlas
export const FACE_CELL=160,FACE_COLS=7,FACE_ROWS=4;
type ExprSpec={mouth:string;eyes:string;brow:string|null;look:[number,number]};
const BEXPR:Record<BeanExpression,ExprSpec>={
 neutral:{mouth:'smile',eyes:'base',brow:null,look:[0,0]},
 calling:{mouth:'shout',eyes:'wide',brow:'up',look:[.3,.1]},
 determined:{mouth:'flat',eyes:'narrow',brow:'angry',look:[0,0]},
 beaten:{mouth:'wobble',eyes:'down',brow:'sad',look:[-.1,-.4]},
 happy:{mouth:'grin',eyes:'happy',brow:'up',look:[0,.1]},
 surprised:{mouth:'o',eyes:'wide',brow:'up',look:[0,-.2]},
 focused:{mouth:'flat',eyes:'ovals',brow:null,look:[0,.35]},
};
/** Atlas cell: the neutral face is the kid's own eyes × mouth (20 cells); other expressions share one cell each. */
export function faceCell(eyes:BeanEyes,mouth:BeanMouth,expression:BeanExpression){
 if(expression==='neutral')return Math.max(0,BEAN_EYES.indexOf(eyes))*BEAN_MOUTHS.length+Math.max(0,BEAN_MOUTHS.indexOf(mouth));
 return BEAN_EYES.length*BEAN_MOUTHS.length+BEAN_EXPRESSIONS.indexOf(expression)-1;
}
type Layer='ink'|'white'|'pink'|'tear';
function paintCell(g:CanvasRenderingContext2D,S:number,eyes:string,mouth:string,e:ExprSpec,layer:Layer){
 const X=(x:number)=>S/2+x*S/2,Y=(y:number)=>S/2-y*S/2,L=(v:number)=>v*S/2;
 g.fillStyle=g.strokeStyle='#fff';
 const line=(w:number)=>{g.lineWidth=L(w);g.lineCap='round';g.lineJoin='round';g.stroke();};
 const erase=(fn:()=>void)=>{g.save();g.globalCompositeOperation='destination-out';fn();g.restore();};
 const lx=e.look[0]*.05,ly=e.look[1]*.05,gap=.3,ey=.12;
 g.save();g.translate(X(0),Y(-.02));g.scale(1.25,1.25);g.translate(-X(0),-Y(-.02));
 if(layer==='ink'){
  for(const s of [-1,1]){
   const cx=s*gap+lx,cy=ey+ly;g.beginPath();
   const kind=e.eyes==='base'?eyes:e.eyes;
   if(kind==='dots'){g.arc(X(cx),Y(cy),L(.06),0,Math.PI*2);g.fill();}
   else if(kind==='ticks'){g.moveTo(X(cx),Y(cy+.08));g.lineTo(X(cx),Y(cy-.06));line(.07);}
   else if(kind==='happy'){g.moveTo(X(cx-.08),Y(cy-.02));g.quadraticCurveTo(X(cx),Y(cy+.1),X(cx+.08),Y(cy-.02));line(.055);}
   else if(kind==='ovals'){g.ellipse(X(cx),Y(cy),L(.055),L(.09),0,0,Math.PI*2);g.fill();erase(()=>{g.beginPath();g.arc(X(cx+.02),Y(cy+.035),L(.018),0,Math.PI*2);g.fill();});}
   else if(kind==='sleepy'){g.moveTo(X(cx-.08),Y(cy));g.quadraticCurveTo(X(cx),Y(cy-.07),X(cx+.08),Y(cy));line(.055);}
   else if(kind==='wide'){g.ellipse(X(cx),Y(cy+.01),L(.07),L(.1),0,0,Math.PI*2);g.fill();erase(()=>{g.beginPath();g.arc(X(cx+.025),Y(cy+.05),L(.022),0,Math.PI*2);g.fill();});}
   else if(kind==='narrow'){g.ellipse(X(cx),Y(cy-.01),L(.06),L(.07),0,0,Math.PI*2);g.fill();}
   else if(kind==='down'){g.ellipse(X(cx),Y(cy-.03),L(.05),L(.06),0,0,Math.PI*2);g.fill();}
   if(e.brow==='angry'){g.beginPath();g.moveTo(X(s*(gap-.13)),Y(ey+.06));g.lineTo(X(s*(gap+.1)),Y(ey+.16));line(.06);}
   if(e.brow==='sad'){g.beginPath();g.moveTo(X(s*(gap-.12)),Y(ey+.2));g.lineTo(X(s*(gap+.1)),Y(ey+.12));line(.05);}
   if(e.brow==='up'){g.beginPath();g.moveTo(X(s*(gap-.09)),Y(ey+.2));g.quadraticCurveTo(X(s*gap),Y(ey+.26),X(s*(gap+.09)),Y(ey+.2));line(.045);}
  }
  // Determined: lids cut straight across the eye tops (they also cover the brows, as in the prototype).
  if(e.eyes==='narrow')for(const s of [-1,1]){
   erase(()=>{g.beginPath();g.moveTo(X(s*(gap-.15)),Y(ey+.015));g.lineTo(X(s*(gap+.12)),Y(ey+.075));g.lineTo(X(s*(gap+.12)),Y(ey+.2));g.lineTo(X(s*(gap-.15)),Y(ey+.2));g.closePath();g.fill();});
   g.beginPath();g.moveTo(X(s*(gap-.15)),Y(ey+.015));g.lineTo(X(s*(gap+.12)),Y(ey+.075));line(.05);
  }
 }
 const my=-.2,m=e.mouth==='smile'?mouth:e.mouth;
 const grin=()=>{g.beginPath();g.moveTo(X(-.2),Y(my+.04));g.quadraticCurveTo(X(0),Y(my),X(.2),Y(my+.04));g.quadraticCurveTo(X(.12),Y(my-.2),X(0),Y(my-.2));g.quadraticCurveTo(X(-.12),Y(my-.2),X(-.2),Y(my+.04));};
 const shout=()=>{g.beginPath();g.moveTo(X(-.19),Y(my+.06));g.quadraticCurveTo(X(0),Y(my+.09),X(.19),Y(my+.06));g.quadraticCurveTo(X(.16),Y(my-.28),X(0),Y(my-.28));g.quadraticCurveTo(X(-.16),Y(my-.28),X(-.19),Y(my+.06));};
 if(layer==='ink'){
  g.beginPath();
  if(m==='smile'){g.moveTo(X(-.17),Y(my+.03));g.quadraticCurveTo(X(0),Y(my-.12),X(.17),Y(my+.03));line(.055);}
  else if(m==='grin'){grin();g.fill();}
  else if(m==='smirk'){g.moveTo(X(-.12),Y(my-.02));g.quadraticCurveTo(X(.04),Y(my-.08),X(.16),Y(my+.05));line(.055);}
  else if(m==='o'){g.ellipse(X(0),Y(my-.03),L(.055),L(.065),0,0,Math.PI*2);g.fill();}
  else if(m==='shout'){shout();g.fill();}
  else if(m==='flat'){g.moveTo(X(-.13),Y(my-.03));g.lineTo(X(.13),Y(my-.03));line(.06);}
  else if(m==='wobble'){g.moveTo(X(-.15),Y(my-.08));g.quadraticCurveTo(X(-.075),Y(my-.01),X(0),Y(my-.05));g.quadraticCurveTo(X(.075),Y(my-.01),X(.15),Y(my-.08));line(.05);}
 }else if(layer==='white'&&m==='grin'){g.save();grin();g.clip();g.fillRect(X(-.2),Y(my+.05),L(.4),L(.06));g.restore();}
 else if(layer==='pink'&&m==='shout'){g.save();shout();g.clip();g.beginPath();g.ellipse(X(0),Y(my-.25),L(.11),L(.07),0,0,Math.PI*2);g.fill();g.restore();}
 g.restore();
 if(layer==='tear'&&e.mouth==='wobble'){g.beginPath();g.moveTo(X(.62),Y(.42));g.quadraticCurveTo(X(.69),Y(.3),X(.65),Y(.26));g.quadraticCurveTo(X(.58),Y(.26),X(.58),Y(.31));g.quadraticCurveTo(X(.59),Y(.36),X(.62),Y(.42));g.fill();}
}
let faceAtlas:T.Texture|undefined;
/** The shared face atlas: R = ink, G = teeth, B = tongue, A = tear (coverage). Panel, blush and colours are shaded. */
export function beanFaceAtlas():T.Texture{
 if(faceAtlas)return faceAtlas;
 const W=FACE_CELL*FACE_COLS,H=FACE_CELL*FACE_ROWS;
 const doc=typeof document!=='undefined'?document:undefined;
 const layers:Layer[]=['ink','white','pink','tear'];
 const canvases=doc?layers.map(()=>{const c=doc.createElement('canvas');c.width=W;c.height=H;return c;}):[];
 const ctxs=canvases.map(c=>c.getContext('2d'));
 if(!doc||ctxs.some(c=>!c)){const t=new T.DataTexture(new Uint8Array(4),1,1);t.needsUpdate=true;return faceAtlas=t;}
 try{return faceAtlas=paintFaceAtlas(ctxs as CanvasRenderingContext2D[],W,H,layers);}
 catch{const t=new T.DataTexture(new Uint8Array(4),1,1);t.needsUpdate=true;return faceAtlas=t;}
}
function paintFaceAtlas(ctxs:CanvasRenderingContext2D[],W:number,H:number,layers:Layer[]){
 const cells:{eyes:string;mouth:string;e:ExprSpec}[]=[];
 for(const eyes of BEAN_EYES)for(const mouth of BEAN_MOUTHS)cells.push({eyes,mouth,e:BEXPR.neutral});
 for(const k of BEAN_EXPRESSIONS)if(k!=='neutral')cells.push({eyes:'dots',mouth:'smile',e:BEXPR[k]});
 layers.forEach((layer,li)=>{const g=ctxs[li];cells.forEach((cell,i)=>{
  g.save();g.translate((i%FACE_COLS)*FACE_CELL,Math.floor(i/FACE_COLS)*FACE_CELL);g.beginPath();g.rect(0,0,FACE_CELL,FACE_CELL);g.clip();
  paintCell(g,FACE_CELL,cell.eyes,cell.mouth,cell.e,layer);g.restore();});});
 const data=new Uint8Array(W*H*4);
 layers.forEach((_,li)=>{const src=ctxs[li].getImageData(0,0,W,H).data;for(let i=0;i<W*H;i++)data[i*4+li]=src[i*4+3];});
 const t=new T.DataTexture(data,W,H,T.RGBAFormat,T.UnsignedByteType);
 t.flipY=false;t.colorSpace=T.NoColorSpace;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;
 t.anisotropy=4;t.wrapS=t.wrapT=T.ClampToEdgeWrapping;t.name='bean-face-atlas';t.needsUpdate=true;
 return t;
}

// ---------------------------------------------------------------- GLSL
const g=(v:number)=>v.toFixed(6);
const ROW_ACCESS=/* glsl */`
#ifdef BEAN_ROW_TEXTURE
uniform highp sampler2D beanData;
uniform highp sampler2D beanDyn;
vec4 bt(int k){return k<${BD.lumbar}?texelFetch(beanData,ivec2(k,beanRowI),0):texelFetch(beanDyn,ivec2(k-${BD.lumbar},beanRowI),0);}
#else
uniform vec4 beanRowU[${BD.size}];
vec4 bt(int k){return beanRowU[k];}
#endif`;
const COMMON=/* glsl */`
uniform float uBeanViewport;
int beanRowI;
${ROW_ACCESS}
float beanEase(float x){x=clamp(x,0.,1.);return x*x*(3.-2.*x);}
float beanRad(float u,vec4 s0){
 float uu=clamp(u,0.,1.),e=abs(2.*uu-1.),n=uu>.5?2.3:2.1;
 return s0.y*pow(max(0.,1.-pow(e,n)),1./n)*(1.+s0.w*(uu-.5))*(1.+.04*sin(uu*6.2831853-1.2));
}
vec3 beanPt(float u,float a,vec4 s0,vec4 s1){
 float span=s0.x-(${g(Y0)}),uu=clamp(u,0.,1.),r=beanRad(uu,s0);
 float x=sin(a)*r,z=cos(a)*r*s0.z;
 if(z>0.)z*=1.+s1.x*sin(3.14159265*uu)*(1.-uu*.6);
 return vec3(x+s1.y*uu*uu*span,${g(Y0)}+uu*span,z+s1.z*uu*uu*span);
}
vec3 beanNrm(float u,float a,vec4 s0,vec4 s1){
 vec3 pu=beanPt(min(u+.012,1.),a,s0,s1)-beanPt(max(u-.012,0.),a,s0,s1);
 vec3 pa=beanPt(u,a+.03,s0,s1)-beanPt(u,a-.03,s0,s1);
 vec3 n=cross(pa,pu);float l=length(n);
 return l>1e-7?n/l:vec3(0.,u>.5?1.:-1.,0.);
}
mat3 beanEuler(vec3 r){
 float a=cos(r.x),b=sin(r.x),c=cos(r.y),d=sin(r.y),e=cos(r.z),f=sin(r.z);
 float ae=a*e,af=a*f,be=b*e,bf=b*f;
 // three.js Euler 'XYZ' (Rx*Ry*Rz), column-major.
 return mat3(c*e,af+be*d,bf-ae*d, -c*f,ae-bf*d,be+af*d, d,-b*c,a*c);
}
mat3 beanRl,beanRc;
void beanSpineSetup(){beanRl=beanEuler(bt(${BD.lumbar}).xyz);beanRc=beanEuler(bt(${BD.chest}).xyz);}
// Weighted lumbar/chest rotation (same weights as the jersey's spine morphs); exact joint rotation at the top.
vec3 beanSpine(vec3 p,float y){
 float wl=beanEase((y-.025)/.22),wc=beanEase((y-.2)/.18);
 vec3 q=p-vec3(0.,${g(CHEST_HEIGHT)},0.);q=mix(q,beanRc*q,wc)+vec3(0.,${g(CHEST_HEIGHT-LUMBAR_HEIGHT)},0.);
 return mix(q,beanRl*q,wl)+vec3(0.,${g(LUMBAR_HEIGHT)},0.);
}
vec3 beanSpineN(vec3 n,float y){
 float wl=beanEase((y-.025)/.22),wc=beanEase((y-.2)/.18);
 n=mix(n,beanRc*n,wc);return normalize(mix(n,beanRl*n,wl));
}
vec3 beanP;vec3 beanN;bool beanCollapse;
void beanRow(){
 #ifdef USE_INSTANCING
  beanRowI=gl_InstanceID;
 #else
  beanRowI=0;
 #endif
}
float beanPxPerMetre(vec4 clip){
 mat4 m=modelMatrix;
 #ifdef USE_INSTANCING
  m=modelMatrix*instanceMatrix;
 #endif
 return length(m[1].xyz)*projectionMatrix[1][1]*uBeanViewport*.5/max(clip.w,1e-3);
}`;

const BODY_VERTEX=/* glsl */`
attribute vec2 beanUA;
flat varying float vBeanRow;
varying float vBeanU;
varying vec4 vBeanSC;
varying float vBeanPx;
void beanShape(){
 beanRow();beanSpineSetup();beanCollapse=false;
 vec4 s0=bt(${BD.shape0}),s1=bt(${BD.shape1}),mc=bt(${BD.misc});
 float u=beanUA.x,a=beanUA.y;
 vec3 p=beanPt(u,a,s0,s1),n=beanNrm(u,a,s0,s1);
 float span=s0.x-(${g(Y0)}),r=beanRad(u,s0);
 vBeanU=u;
 // sin/cos interpolate continuously all round; the fragment rebuilds the angle (no wrap seam inside a triangle).
 vBeanSC=vec4(sin(a),cos(a),r,p.y);
 vBeanRow=float(beanRowI);
 beanP=beanSpine(p,p.y);beanN=beanSpineN(n,p.y);
}`;
const LIMB_VERTEX=/* glsl */`
attribute vec4 beanLimb;
attribute vec3 beanLocal;
attribute vec3 beanLocalN;
attribute float beanPaint;
attribute float beanDetail;
flat varying float vBeanRow;
flat varying float vBeanPaint;
varying vec3 vBeanS;
struct BeanLimbC{vec3 P0;vec3 P2;vec3 d1;vec3 m;vec3 nP;vec3 A;vec3 Cc;vec3 E;vec3 T2;float rho;float th;float L1a;float Larc;float L3;float S;float l1;float l2;};
BeanLimbC beanLimbSetup(vec3 P0,vec3 P1,vec3 P2,vec3 h,float sgn,float K,float RHO){
 BeanLimbC L;L.P0=P0;L.P2=P2;
 vec3 e1=P1-P0,e2=P2-P1;float l1=length(e1),l2=length(e2);
 vec3 d1=l1>1e-5?e1/l1:(l2>1e-5?e2/l2:vec3(0.,-1.,0.));
 vec3 d2=l2>1e-5?e2/l2:d1;
 float c=clamp(dot(d1,d2),-1.,1.),th=acos(c);
 vec3 hp=h-d1*dot(h,d1);float hl=length(hp);
 if(hl>1e-4)hp/=hl;else hp=normalize(cross(abs(d1.x)<.9?vec3(1.,0.,0.):vec3(0.,0.,1.),d1));
 vec3 mfb=sgn*cross(hp,d1);
 vec3 mt=d2-d1*c;float sl=length(mt);
 vec3 m=mfb;
 if(sl>1e-3)m=mt/sl;
 L.nP=normalize(cross(d1,m));
 float tanHalf=sqrt(max(0.,1.-c)/max(1e-6,1.+c));
 float a=min(RHO*tanHalf,K*min(l1,l2));
 float rho=min(a/max(tanHalf,1e-5),RHO);
 L.d1=d1;L.m=m;L.th=th;L.rho=rho;L.l1=l1;L.l2=l2;
 L.A=P1-d1*a;L.Cc=L.A+m*rho;
 L.E=L.Cc-m*(rho*cos(th))+d1*(rho*sin(th));
 vec3 e3=P2-L.E;float l3=length(e3);
 L.T2=l3>1e-5?e3/l3:normalize(d1*cos(th)+m*sin(th));
 L.L1a=max(l1-a,0.);L.Larc=rho*th;L.L3=l3;L.S=max(L.L1a+L.Larc+l3,1e-4);
 return L;
}
float beanLimbAt(BeanLimbC L,float sec,float t,out vec3 c,out vec3 tn){
 if(sec<1.5){c=mix(L.P0,L.A,t);tn=L.d1;return t*L.L1a;}
 if(sec<2.5){float ph=t*L.th;c=L.Cc-L.m*(L.rho*cos(ph))+L.d1*(L.rho*sin(ph));tn=normalize(L.d1*cos(ph)+L.m*sin(ph));return L.L1a+L.rho*ph;}
 c=mix(L.E,L.P2,t);tn=L.T2;return L.L1a+L.Larc+t*L.L3;
}
void beanShape(){
 beanRow();beanCollapse=false;
 vBeanRow=float(beanRowI);
 float part=beanLimb.x;
 if(part<3.5){
  int k=int(part+.5),base=${BD.limbs}+4*k;
  vec4 A=bt(base),B=bt(base+1),C=bt(base+2),H=bt(base+3);
  float limbK=bt(${BD.shape1}).w;
  bool arm=k<2;
  BeanLimbC L=beanLimbSetup(A.xyz,B.xyz,C.xyz,H.xyz,H.w,arm?${g(LIMB_ARM.K)}:${g(LIMB_LEG.K)},arm?${g(LIMB_ARM.RHO)}:${g(LIMB_LEG.RHO)});
  float sec=beanLimb.y,t=beanLimb.z,ang=beanLimb.w;
  vec3 c,tn;float s;
  if(sec<.5){s=beanLimbAt(L,1.,0.,c,tn);}
  else if(sec>3.5){s=beanLimbAt(L,3.,1.,c,tn);}
  else s=beanLimbAt(L,sec,t,c,tn);
  float f=s/L.S;
  float r=max(mix(A.w,B.w,f)*limbK*(1.+C.w*sin(3.14159265*f)),.015);
  vec3 Bf=L.nP-tn*dot(L.nP,tn);
  if(dot(Bf,Bf)<1e-8)Bf=cross(tn,abs(tn.y)<.9?vec3(0.,1.,0.):vec3(1.,0.,0.));
  Bf=normalize(Bf);vec3 Nf=cross(Bf,tn);
  vec3 off=Nf*cos(ang)+Bf*sin(ang);
  if(sec<.5){float al=(1.-t)*1.5707963;beanP=c-tn*(r*sin(al))+off*(r*cos(al));beanN=normalize(off*cos(al)-tn*sin(al));}
  else if(sec>3.5){float al=t*1.5707963;beanP=c+tn*(r*sin(al))+off*(r*cos(al));beanN=normalize(off*cos(al)+tn*sin(al));}
  else{beanP=c+off*r;beanN=off;}
  vBeanPaint=arm?-1.:-2.;
  vBeanS=vec3(s/max(L.l1,1e-3),(L.S-s)/max(L.l2,1e-3),0.);
 }else{
  int fi=int(part-4.+.5),base=${BD.frames}+3*fi;
  vec4 r0=bt(base),r1=bt(base+1),r2=bt(base+2);
  vec3 lp=beanLocal;
  if(fi<2)lp*=bt(${BD.hands}).w;
  beanP=vec3(dot(r0,vec4(lp,1.)),dot(r1,vec4(lp,1.)),dot(r2,vec4(lp,1.)));
  beanN=normalize(vec3(dot(r0.xyz,beanLocalN),dot(r1.xyz,beanLocalN),dot(r2.xyz,beanLocalN)));
  vBeanPaint=beanPaint;
  vBeanS=vec3(0.,0.,beanLocal.y);
 }
}`;
const HEAD_VERTEX=/* glsl */`
attribute vec4 beanAnchor;
attribute vec3 beanLocal;
attribute vec3 beanLocalN;
attribute float beanPaint;
flat varying float vBeanRow;
flat varying float vBeanPaint;
void beanShape(){
 beanRow();beanSpineSetup();
 vBeanRow=float(beanRowI);vBeanPaint=beanPaint;
 vec4 s0=bt(${BD.shape0}),s1=bt(${BD.shape1});
 float sel=bt(BEAN_STYLE_TEXEL).w;
 beanCollapse=abs(beanAnchor.w-sel)>.5;
 float span=s0.x-(${g(Y0)}),R=beanRad(.84,s0)*1.06;
 vec3 p,n;
 if(beanAnchor.z<.5){
  vec3 o=vec3(s1.y*.7056*span,${g(Y0)}+.84*span+.3*R,s1.z*.7056*span+.04*R);
  p=o+beanLocal*R;n=beanLocalN;
 }else{
  float u=beanAnchor.x,a=beanAnchor.y;
  vec3 base=beanPt(u,a,s0,s1);
  vec3 pu=beanPt(min(u+.012,1.),a,s0,s1)-beanPt(max(u-.012,0.),a,s0,s1),Sd=beanPt(u,a+.03,s0,s1)-beanPt(u,a-.03,s0,s1);
  vec3 N=cross(Sd,pu);N=dot(N,N)>1e-14?normalize(N):vec3(0.,u>.5?1.:-1.,0.);
  Sd-=N*dot(Sd,N);Sd=dot(Sd,Sd)>1e-10?normalize(Sd):normalize(cross(vec3(0.,1.,0.),N)+vec3(1e-4,0.,0.));
  vec3 Up=cross(N,Sd);
  p=base+(Sd*beanLocal.x+Up*beanLocal.y+N*beanLocal.z)*R;
  n=normalize(Sd*beanLocalN.x+Up*beanLocalN.y+N*beanLocalN.z);
 }
 beanP=beanSpine(p,p.y);beanN=beanSpineN(n,p.y);
}`;
const LOD_BODY=/* glsl */`
vBeanPx=beanPxPerMetre(gl_Position);`;
const LOD_LIMB=/* glsl */`
{
 // Thumbs and other small parts vanish when the whole character is under ~34 px tall.
 if(beanDetail>.5&&beanPxPerMetre(gl_Position)*1.7<34.)gl_Position=vec4(0.,0.,2.,1.);
}`;
const LOD_HEAD=/* glsl */`
if(beanCollapse)gl_Position=vec4(0.,0.,2.,1.);`;

const FRAG_COMMON=/* glsl */`
int beanRowI;
float beanFaceMask;
${ROW_ACCESS}`;
const BODY_FRAG_PARS=/* glsl */`
uniform sampler2D beanFace;
uniform sampler2D beanDigits;
flat varying float vBeanRow;
varying float vBeanU;
varying vec4 vBeanSC;
varying float vBeanPx;
${SHIRT_NUMBER_COVER_GLSL}`;
const BODY_FRAG=/* glsl */`
{
 beanRowI=int(vBeanRow+.5);beanFaceMask=0.;
 float u=vBeanU;
 vec4 mc=bt(${BD.misc}),s0=bt(${BD.shape0});float span=s0.x-(${g(Y0)});
 // Face coordinates (arc length from the front, height from the panel centre) and back coordinates (from the back).
 vec2 vBeanFace=vec2(atan(vBeanSC.x,vBeanSC.y)*vBeanSC.z,vBeanSC.w-(${g(Y0)}+mc.x*span));
 vec2 vBeanBack=vec2(atan(-vBeanSC.x,-vBeanSC.y)*vBeanSC.z,vBeanSC.w-(${g(Y0)}+mc.y*span));
 vec3 col=u<${g(BEAN_BANDS.shorts)}?bt(${BD.shorts}).rgb:u<${g(BEAN_BANDS.shirt)}?bt(${BD.shirt}).rgb:u<${g(BEAN_BANDS.collar)}?bt(${BD.shirt2}).rgb:bt(${BD.body}).rgb;
 // Derivatives outside the region branches (explicit-gradient lookups inside them).
 vec2 bdx=dFdx(vBeanBack),bdy=dFdy(vBeanBack),fdx=dFdx(vBeanFace),fdy=dFdy(vBeanFace);
 vec2 fp=vBeanFace/vec2(${g(FACE_RX)},${g(FACE_RY)});float fr=length(fp),faa=max(fwidth(fr),1e-4);
 vec4 nb=bt(${BD.hat2});
 if(nb.w>.5&&abs(vBeanBack.x)<.24&&abs(vBeanBack.y)<.17){
  float fade=smoothstep(6.,9.,${g(BEAN_DIGIT_HEIGHT)}*vBeanPx);
  if(fade>0.){
   vec2 cov=shirtNumberCover(beanDigits,vBeanBack,nb.w,${g(BEAN_DIGIT_HEIGHT)},bdx,bdy);
   bool white=bt(${BD.shirt}).w>.5;
   vec3 dark=vec3(.01681,.01681,.02315);
   float alpha=white?max(cov.r,max(cov.g,cov.r)*.5):cov.r;
   col=mix(col,mix(dark,white?vec3(1.):dark,cov.r),alpha*fade);
  }
 }
 if(fr<1.08){
  vec4 sk=bt(${BD.skin});vec3 panel=sk.rgb;
  vec3 pc=mix(panel*1.12+.02,panel,smoothstep(0.,.85,length(fp-vec2(-.17,.24))));
  pc=mix(pc,mix(panel,vec3(.146,.102,.117),.22),smoothstep(.7,1.,fr));
  vec2 cp=vec2(vBeanFace.x/${g(FACE_RX*1.12)},vBeanFace.y/${g(FACE_RY*1.12)});
  vec4 bl=bt(${BD.blush});
  if(bl.w>.5){
   vec2 q=vec2(abs(cp.x)-.625,cp.y+.195)/vec2(.1625,.1);
   float bm=1.-smoothstep(.75,1.,length(q));
   pc=mix(pc,mix(bl.rgb,panel,.35),bm*.55);
  }
  float ff=smoothstep(3.,6.,.34*vBeanPx);
  if(ff>0.){
   vec2 cc=clamp(vec2(cp.x*.5+.5,.5-cp.y*.5),.012,.988);
   float cell=sk.w,cx=mod(cell,${FACE_COLS}.),cy=floor(cell/${FACE_COLS}.+.001);
   vec2 uv=vec2((cx+cc.x)/${FACE_COLS}.,(cy+cc.y)/${FACE_ROWS}.);
   vec2 k=vec2(.5/${g(FACE_RX*1.12)}/${FACE_COLS}.,-.5/${g(FACE_RY*1.12)}/${FACE_ROWS}.);
   vec4 f=textureGrad(beanFace,uv,fdx*k,fdy*k);
   float lp=dot(panel,vec3(.2126,.7152,.0722));
   vec3 ink=lp<.28?vec3(1.,.896,.76):vec3(.0176,.0103,.0103);
   pc=mix(pc,ink,f.r*ff);pc=mix(pc,vec3(1.),f.g*ff);pc=mix(pc,vec3(1.,.212,.254),f.b*ff);pc=mix(pc,vec3(.346,.716,.922),f.a*ff);
  }
  float inside=1.-smoothstep(1.-faa,1.+faa,fr);
  col=mix(col,pc,inside);beanFaceMask=inside;
 }
 diffuseColor.rgb=col;
}`;
const LIMB_FRAG_PARS=/* glsl */`
flat varying float vBeanRow;
flat varying float vBeanPaint;
varying vec3 vBeanS;`;
const LIMB_FRAG=/* glsl */`
{
 beanRowI=int(vBeanRow+.5);beanFaceMask=0.;
 vec3 col;
 // Legs: shorts on the thigh top, kit socks up most of the shin (stripe at the top); arms: kit sleeves + cuff.
 if(vBeanPaint<-1.5){float ft=vBeanS.x,fb=vBeanS.y;col=ft<.42?bt(${BD.shorts}).rgb:fb<.64?bt(${BD.socks}).rgb:fb<.71?bt(${BD.socks2}).rgb:bt(${BD.body}).rgb;}
 else if(vBeanPaint<-.5){float ft=vBeanS.x;col=ft<.86?bt(${BD.shirt}).rgb:ft<.93?bt(${BD.shirt2}).rgb:bt(${BD.body}).rgb;}
 else if(abs(vBeanPaint-${BD.boots}.)<.5)col=vBeanS.z<-.062?vec3(.93,.88,.8):bt(${BD.boots}).rgb;
 else col=bt(int(vBeanPaint+.5)).rgb;
 diffuseColor.rgb=col;
}`;
const HEAD_FRAG_PARS=/* glsl */`
flat varying float vBeanRow;
flat varying float vBeanPaint;`;
const HEAD_FRAG=/* glsl */`
{
 beanRowI=int(vBeanRow+.5);beanFaceMask=0.;
 diffuseColor.rgb=vBeanPaint>2.5?vec3(.93,.88,.8):bt(${BD.hair}+int(vBeanPaint+.5)).rgb;
}`;
// Soft clay: a warm rim and a little extra ambient, both proportional to the scene's ambient light (night stays dark).
const CLAY=/* glsl */`
{
 vec3 vd=normalize(vViewPosition);float fres=pow(1.-clamp(dot(normal,vd),0.,1.),2.5);
 // Lift by the ambient's brightness in the part's own colour (kit colours stay true under warm or cool skies).
 vec3 ind=reflectedLight.indirectDiffuse;
 vec3 neutral=diffuseColor.rgb*(dot(ind,vec3(.3333))/max(dot(diffuseColor.rgb,vec3(.3333)),.03));
 outgoingLight+=mix(ind,neutral,.75)*(.22+fres*.55+beanFaceMask*.35);
 // Keep half of each part's own hue under tinted light (a blue kit stays blue at sunset); shading is unchanged.
 float lo=dot(outgoingLight,vec3(.2126,.7152,.0722)),la=max(dot(diffuseColor.rgb,vec3(.2126,.7152,.0722)),.02);
 outgoingLight=mix(outgoingLight,diffuseColor.rgb*(lo/la),.5);
}`;

export type BeanKind='body'|'limbs'|'hair'|'hat';
const viewport={value:800};
const _size=new T.Vector2();
function vertexFor(kind:BeanKind){return kind==='body'?BODY_VERTEX:kind==='limbs'?LIMB_VERTEX:HEAD_VERTEX.replace('BEAN_STYLE_TEXEL',String(kind==='hair'?BD.hair:BD.hat1));}
function patchVertex(src:string,kind:BeanKind,depth:boolean){
 src=src.replace('#include <common>','#include <common>\n'+COMMON+vertexFor(kind));
 if(depth)src=src.replace('#include <begin_vertex>','beanShape();vec3 transformed=beanP;');
 else src=src.replace('#include <beginnormal_vertex>','beanShape();vec3 objectNormal=beanN;').replace('#include <begin_vertex>','vec3 transformed=beanP;');
 const lod=kind==='body'?(depth?'':LOD_BODY):kind==='limbs'?LOD_LIMB:LOD_HEAD;
 return src.replace('#include <project_vertex>','#include <project_vertex>\n'+lod);
}
type BeanUniforms={beanData:{value:T.Texture|null};beanDyn:{value:T.Texture|null};beanRowU:{value:Float32Array};uBeanViewport:{value:number};beanFace:{value:T.Texture|null};beanDigits:{value:T.Texture|null}};
const EMPTY_ROW=new Float32Array(BD.size*4);
/** A rig's row wrapped as a texture handle: identifies the row for code that clones bean materials; never uploaded. */
export function beanRowHandle(row:Float32Array){const t=new T.DataTexture(row,BD.size,1,T.RGBAFormat,T.FloatType);t.userData.beanRow=true;t.name='bean-row-handle';return t;}
type RowSource=Float32Array|T.Texture|null|undefined;
function rowOf(source:RowSource):Float32Array|null{if(!source)return null;if(source instanceof Float32Array)return source;return source.userData?.beanRow?(source.image as {data:Float32Array}).data:null;}
const isBatchTexture=(source:RowSource)=>!!source&&!(source instanceof Float32Array)&&!source.userData?.beanRow;
/**
 * An individually rendered rig reads its row from a uniform array (`beanRowU`, cached by three: re-sent only when
 * it changed, no texture upload); a batch sets row textures (BEAN_ROW_TEXTURE, one row per instance): the static
 * texels (colours, face cell, number, shape) and the per-frame ones (spine, limb control points) are split, so a
 * frame re-uploads only the small dynamic texture.
 */
function uniformsFor(kind:BeanKind,row:Float32Array|null,texture:T.Texture|null):BeanUniforms{
 return {beanData:{value:texture},beanDyn:{value:null},beanRowU:{value:row??EMPTY_ROW},uBeanViewport:viewport,beanFace:{value:kind==='body'?beanFaceAtlas():null},beanDigits:{value:kind==='body'?shirtDigitAtlas():null}};
}
/** Clay MeshStandardMaterial for one bean part; clones (playerBatch) keep the shader with their own data texture. */
export class BeanMaterial extends T.MeshStandardMaterial{
 readonly isBeanMaterial=true;
 beanKind:BeanKind='body';
 beanUniforms:BeanUniforms=uniformsFor('body',null,null);
 /** `source`: the rig's row (Float32Array or its beanRowHandle) for an individually rendered rig, or a batch row texture. */
 constructor(kind?:BeanKind,source?:RowSource){
  super({roughness:.58,metalness:0});
  if(kind){this.beanKind=kind;this.beanUniforms=uniformsFor(kind,rowOf(source),source instanceof T.Texture?source:null);}
  this.name='bean-'+this.beanKind;this.beanSetup();
  if(isBatchTexture(source))this.setBeanData(source as T.Texture);
 }
 beanSetup(){
  const kind=this.beanKind;
  this.onBeforeCompile=shader=>{
   Object.assign(shader.uniforms,this.beanUniforms);
   shader.vertexShader=patchVertex(shader.vertexShader,kind,false);
   const pars=kind==='body'?BODY_FRAG_PARS:kind==='limbs'?LIMB_FRAG_PARS:HEAD_FRAG_PARS,body=kind==='body'?BODY_FRAG:kind==='limbs'?LIMB_FRAG:HEAD_FRAG;
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\n'+FRAG_COMMON+pars).replace('#include <color_fragment>',body).replace('#include <opaque_fragment>',CLAY+'\n#include <opaque_fragment>');
  };
  this.customProgramCacheKey=()=>'bean-'+kind+'-v1';
  this.onBeforeRender=(renderer:T.WebGLRenderer)=>{viewport.value=renderer.getSize(_size).y||800;};
 }
 copy(source:T.MeshStandardMaterial){
  super.copy(source);
  const s=source as Partial<BeanMaterial>;
  if(s.isBeanMaterial&&s.beanKind&&s.beanUniforms){this.beanKind=s.beanKind;this.beanUniforms=uniformsFor(s.beanKind,s.beanUniforms.beanRowU.value,s.beanUniforms.beanData.value);this.beanUniforms.beanDyn.value=s.beanUniforms.beanDyn.value;this.name=s.name??this.name;this.beanSetup();}
  return this;
 }
 /** Batches: read rows from `texture` (one per instance). */
 setBeanData(texture:T.Texture,dynamic?:T.Texture){this.beanUniforms.beanData.value=texture;this.beanUniforms.beanDyn.value=dynamic??texture;if(this.defines?.BEAN_ROW_TEXTURE===undefined){this.defines={...(this.defines??{}),BEAN_ROW_TEXTURE:''};this.needsUpdate=true;}}
}
/** Shadow depth for a bean part (same vertex deformation). */
export class BeanDepthMaterial extends T.MeshDepthMaterial{
 readonly isBeanMaterial=true;
 beanKind:BeanKind='body';
 beanUniforms:BeanUniforms=uniformsFor('limbs',null,null);
 constructor(kind?:BeanKind,source?:RowSource){
  super({depthPacking:T.RGBADepthPacking});
  if(kind){this.beanKind=kind;this.beanUniforms=uniformsFor('limbs',rowOf(source),source instanceof T.Texture?source:null);}
  this.beanSetup();
  if(isBatchTexture(source))this.setBeanData(source as T.Texture);
 }
 beanSetup(){
  const kind=this.beanKind;
  this.onBeforeCompile=shader=>{Object.assign(shader.uniforms,this.beanUniforms);shader.vertexShader=patchVertex(shader.vertexShader,kind,true);};
  this.customProgramCacheKey=()=>'bean-depth-'+kind+'-v1';
 }
 copy(source:T.MeshDepthMaterial){
  super.copy(source);
  const s=source as Partial<BeanDepthMaterial>;
  if(s.isBeanMaterial&&s.beanKind&&s.beanUniforms){this.beanKind=s.beanKind;this.beanUniforms=uniformsFor('limbs',s.beanUniforms.beanRowU.value,s.beanUniforms.beanData.value);this.beanUniforms.beanDyn.value=s.beanUniforms.beanDyn.value;this.beanSetup();}
  return this;
 }
 setBeanData(texture:T.Texture,dynamic?:T.Texture){this.beanUniforms.beanData.value=texture;this.beanUniforms.beanDyn.value=dynamic??texture;if(this.defines?.BEAN_ROW_TEXTURE===undefined){this.defines={...(this.defines??{}),BEAN_ROW_TEXTURE:''};this.needsUpdate=true;}}
}

// ---------------------------------------------------------------- shared geometry
const REST_SHAPE=BEAN_SHAPES.regular;
function bodyGeometry(){
 const NU=30,SEG=32,pos:number[]=[],nrm:number[]=[],ua:number[]=[],idx:number[]=[],p=new T.Vector3(),q=new T.Vector3(),r=new T.Vector3(),n=new T.Vector3();
 for(let i=0;i<=NU;i++){const u=i/NU;for(let j=0;j<=SEG;j++){const a=j/SEG*Math.PI*2;
  beanPoint(REST_SHAPE,u,a,p);pos.push(p.x,p.y,p.z);ua.push(u,a);
  beanPoint(REST_SHAPE,Math.min(u+.012,1),a,q).sub(beanPoint(REST_SHAPE,Math.max(u-.012,0),a,r));
  beanPoint(REST_SHAPE,u,a+.03,r).sub(beanPoint(REST_SHAPE,u,a-.03,n));n.crossVectors(r,q);
  if(n.lengthSq()<1e-14)n.set(0,u>.5?1:-1,0);n.normalize();nrm.push(n.x,n.y,n.z);}}
 const W=SEG+1;for(let i=0;i<NU;i++)for(let j=0;j<SEG;j++){const a=i*W+j,c=a+W;idx.push(a,a+1,c,c,a+1,c+1);}
 const geo=new T.BufferGeometry();
 geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new T.Float32BufferAttribute(nrm,3));
 geo.setAttribute('beanUA',new T.Float32BufferAttribute(ua,2));geo.setIndex(idx);
 geo.boundingSphere=new T.Sphere(new T.Vector3(0,.4,0),.85);geo.boundingBox=new T.Box3(new T.Vector3(-.45,-.2,-.45),new T.Vector3(.45,1.15,.45));
 geo.name='bean-body';return geo;
}
/** Standing rest pose (root space) used for bounds, picking and the geometry's own `position`. */
const REST_LIMBS=[
 {P0:[-.13,1.25,0],P1:[-.25,.98,-.01],P2:[-.27,.72,.02],h:[1,0,0],sgn:-1,arm:true},
 {P0:[.13,1.25,0],P1:[.25,.98,-.01],P2:[.27,.72,.02],h:[1,0,0],sgn:-1,arm:true},
 {P0:[-.07,.95,0],P1:[-.108,.49,.02],P2:[-.108,.09,0],h:[1,0,0],sgn:1,arm:false},
 {P0:[.07,.95,0],P1:[.108,.49,.02],P2:[.108,.09,0],h:[1,0,0],sgn:1,arm:false},
];
function ellipsoidPart(cx:number,cy:number,cz:number,sx:number,sy:number,sz:number,ws:number,hs:number,rot?:T.Euler){
 const g=new T.SphereGeometry(1,ws,hs);const m=new T.Matrix4().compose(new T.Vector3(cx,cy,cz),new T.Quaternion().setFromEuler(rot??new T.Euler()),new T.Vector3(sx,sy,sz));g.applyMatrix4(m);return g;
}
function limbGeometry(){
 const pos:number[]=[],nrm:number[]=[],limb:number[]=[],local:number[]=[],localN:number[]=[],paint:number[]=[],detail:number[]=[],idx:number[]=[];
 const c=new T.Vector3(),tn=new T.Vector3(),N=new T.Vector3(),B=new T.Vector3(),off=new T.Vector3();
 const v=(a:T.Vector3Tuple)=>new T.Vector3(...a);
 REST_LIMBS.forEach((rest,k)=>{
  const spec=rest.arm?LIMB_ARM:LIMB_LEG,curve=beanLimbCurve(v(rest.P0 as T.Vector3Tuple),v(rest.P1 as T.Vector3Tuple),v(rest.P2 as T.Vector3Tuple),v(rest.h as T.Vector3Tuple),rest.sgn,spec.K,spec.RHO);
  const start=pos.length/3;
  for(const [sec,t] of LIMB_RINGS){
   const s=sec<.5?beanLimbAt(curve,1,0,c,tn):sec>3.5?beanLimbAt(curve,3,1,c,tn):beanLimbAt(curve,sec,t,c,tn);
   const r=beanLimbRadius(spec.r0,spec.r1,spec.bulge,s/curve.S);beanRingFrame(curve.h,tn,N,B);
   for(let j=0;j<=LIMB_RADIAL;j++){const ang=j/LIMB_RADIAL*Math.PI*2;off.copy(N).multiplyScalar(Math.cos(ang)).addScaledVector(B,Math.sin(ang));
    let al=0,dir=0;if(sec<.5){al=(1-t)*Math.PI/2;dir=-1;}else if(sec>3.5){al=t*Math.PI/2;dir=1;}
    const p=c.clone().addScaledVector(tn,dir*r*Math.sin(al)).addScaledVector(off,r*Math.cos(al));pos.push(p.x,p.y,p.z);
    const nn=off.clone().multiplyScalar(Math.cos(al)).addScaledVector(tn,dir*Math.sin(al)).normalize();nrm.push(nn.x,nn.y,nn.z);
    limb.push(k,sec,t,ang);local.push(0,0,0);localN.push(0,0,0);paint.push(rest.arm?-1:-2);detail.push(0);}
  }
  const W=LIMB_RADIAL+1;for(let i=0;i<LIMB_RINGS.length-1;i++)for(let j=0;j<LIMB_RADIAL;j++){const a=start+i*W+j,b=a+W;idx.push(a,b,a+1,a+1,b,b+1);}
 });
 // Rigid parts in their joint's local frame: mittens (+ thumb, a small part) and rounded boots with a sole.
 const rigid=(part:number,geo:T.BufferGeometry,paintIndex:number,isDetail:boolean,rest:T.Vector3)=>{
  const g2=geo.index?geo:geo;const p=g2.getAttribute('position'),n=g2.getAttribute('normal'),start=pos.length/3;
  for(let i=0;i<p.count;i++){pos.push(p.getX(i)+rest.x,p.getY(i)+rest.y,p.getZ(i)+rest.z);nrm.push(n.getX(i),n.getY(i),n.getZ(i));limb.push(part,-1,0,0);local.push(p.getX(i),p.getY(i),p.getZ(i));localN.push(n.getX(i),n.getY(i),n.getZ(i));paint.push(paintIndex);detail.push(isDetail?1:0);}
  const index=g2.index!;for(let i=0;i<index.count;i++)idx.push(start+index.getX(i));geo.dispose();
 };
 for(let side=0;side<2;side++){
  const s=side?1:-1,handRest=v(REST_LIMBS[side].P2 as T.Vector3Tuple),footRest=v(REST_LIMBS[2+side].P2 as T.Vector3Tuple);
  rigid(4+side,ellipsoidPart(0,-.02,0,.052,.062,.046,12,9),BD.hands,false,handRest);
  const thumb=new T.CapsuleGeometry(.019,.03,3,6);thumb.applyMatrix4(new T.Matrix4().compose(new T.Vector3(s*-.012,-.005,.036),new T.Quaternion().setFromEuler(new T.Euler(.9,0,s*.2)),new T.Vector3(1,1,1)));
  rigid(4+side,thumb,BD.hands,true,handRest);
  rigid(6+side,ellipsoidPart(0,-.03,.052,.072,.058,.132,16,10),BD.boots,false,footRest);
 }
 const geo=new T.BufferGeometry();
 geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new T.Float32BufferAttribute(nrm,3));
 geo.setAttribute('beanLimb',new T.Float32BufferAttribute(limb,4));geo.setAttribute('beanLocal',new T.Float32BufferAttribute(local,3));geo.setAttribute('beanLocalN',new T.Float32BufferAttribute(localN,3));
 geo.setAttribute('beanPaint',new T.Float32BufferAttribute(paint,1));geo.setAttribute('beanDetail',new T.Float32BufferAttribute(detail,1));geo.setIndex(idx);
 // Generous bounds: arms can rise overhead and legs reach out while the rest pose stands.
 geo.boundingSphere=new T.Sphere(new T.Vector3(0,.95,0),1.45);geo.boundingBox=new T.Box3(new T.Vector3(-.4,0,-.2),new T.Vector3(.4,1.35,.2));
 geo.name='bean-limbs';return geo;
}

// ---------------------------------------------------------------- hair and headwear
export const HAIR_IDS:Record<string,number>={none:0,crop:1,tuft:2,puffs:3,bun:4,ponytail:5,curls:6,long:7};
export const HAT_IDS:Record<string,number>={none:0,cap:1,beanie:2,headband:3,bucket:4,visor:5,keeper:6};
/** Hats that cover the crown: short styles sit hidden under them. */
const COVERING=new Set(['cap','beanie','bucket','keeper']),SHORT_HAIR=new Set(['crop','tuft','curls']);
type HeadBuilder={pos:number[];nrm:number[];anchor:number[];local:number[];localN:number[];paint:number[];idx:number[]};
const newHead=():HeadBuilder=>({pos:[],nrm:[],anchor:[],local:[],localN:[],paint:[],idx:[]});
const _hp0=new T.Vector3(),_hp1=new T.Vector3(),_hn=new T.Vector3(),_hs=new T.Vector3(),_hu=new T.Vector3(),_hq=new T.Vector3();
/** Rest-pose (regular build) position of a head vertex, mirroring the HEAD_VERTEX shader, for bounds and picking. */
function restHead(mode:number,u:number,a:number,l:T.Vector3,out:T.Vector3){
 const s=REST_SHAPE,{R,origin}=beanHeadFrame(s);
 if(mode<.5)return out.copy(origin).addScaledVector(l,R);
 beanPoint(s,u,a,_hp0);
 beanPoint(s,Math.min(u+.012,1),a,_hq).sub(beanPoint(s,Math.max(u-.012,0),a,_hp1));
 beanPoint(s,u,a+.03,_hs).sub(beanPoint(s,u,a-.03,_hp1));_hn.crossVectors(_hs,_hq);
 if(_hn.lengthSq()<1e-14)_hn.set(0,u>.5?1:-1,0);_hn.normalize();
 _hs.addScaledVector(_hn,-_hs.dot(_hn));if(_hs.lengthSq()<1e-10)_hs.set(1,0,0);_hs.normalize();_hu.crossVectors(_hn,_hs);
 return out.copy(_hp0).addScaledVector(_hs,l.x*R).addScaledVector(_hu,l.y*R).addScaledVector(_hn,l.z*R);
}
/** Adds a rigid (mode 0, head-frame units) geometry. */
function addRigid(b:HeadBuilder,geo:T.BufferGeometry,style:number,paint:number,matrix?:T.Matrix4){
 if(matrix)geo.applyMatrix4(matrix);
 const g2=geo.index?geo:geo;const p=g2.getAttribute('position'),n=g2.getAttribute('normal'),start=b.pos.length/3,l=new T.Vector3(),o=new T.Vector3();
 for(let i=0;i<p.count;i++){l.set(p.getX(i),p.getY(i),p.getZ(i));restHead(0,0,0,l,o);b.pos.push(o.x,o.y,o.z);b.nrm.push(n.getX(i),n.getY(i),n.getZ(i));b.anchor.push(0,0,0,style);b.local.push(l.x,l.y,l.z);b.localN.push(n.getX(i),n.getY(i),n.getZ(i));b.paint.push(paint);}
 if(g2.index){const index=g2.index;for(let i=0;i<index.count;i++)b.idx.push(start+index.getX(i));}
 else for(let i=0;i<p.count;i++)b.idx.push(start+i);
 geo.dispose();
}
/** Adds a surface-anchored (mode 1) vertex; returns its index. */
function addAnchored(b:HeadBuilder,u:number,a:number,l:T.Vector3,n:T.Vector3,style:number,paint:number){
 const o=restHead(1,u,a,l,new T.Vector3());b.pos.push(o.x,o.y,o.z);b.nrm.push(0,1,0);b.anchor.push(u,a,1,style);b.local.push(l.x,l.y,l.z);b.localN.push(n.x,n.y,n.z);b.paint.push(paint);
 return b.pos.length/3-1;
}
/** A hair shell hugging the crown from a hairline u(a) to the top, with a lip closing its edge onto the bean. */
function hairShell(b:HeadBuilder,style:number,hairline:(a:number)=>number,thick:number,bumpy=0,aRange?:[number,number],uTop=1){
 const SEGA=aRange?10:20,NU=5,a0=aRange?aRange[0]:0,a1=aRange?aRange[1]:Math.PI*2;
 const cols=SEGA+1,rows=NU+2,start=b.pos.length/3,l=new T.Vector3(),n=new T.Vector3(0,0,1);
 for(let j=0;j<cols;j++){const a=a0+(a1-a0)*j/SEGA,uh=hairline(a);
  for(let i=0;i<rows;i++){
   const lip=i===0,uu=lip?uh:uh+(uTop-uh)*((i-1)/NU);
   const wob=bumpy?bumpy*Math.sin(a*9+uu*23)*Math.sin(a*5-uu*17):0;
   l.set(0,0,lip?.004:thick*(1-.25*((i-1)/NU))+wob);addAnchored(b,uu,a,l,n,style,0);
  }}
 for(let j=0;j<SEGA;j++)for(let i=0;i<rows-1;i++){const a=start+j*rows+i,c=a+rows;b.idx.push(a,c,a+1,a+1,c,c+1);}
 if(aRange){/* open side edges on partial shells are hidden against the body */}
}
const place=(pos:T.Vector3Tuple,rot:T.Vector3Tuple=[0,0,0],scl:T.Vector3Tuple=[1,1,1])=>new T.Matrix4().compose(new T.Vector3(...pos),new T.Quaternion().setFromEuler(new T.Euler(...rot)),new T.Vector3(...scl));
/** Appends a back-facing copy so open shells (bucket crown/brim) read from both sides on a front-side material. */
function doubleSided(geo:T.BufferGeometry){
 const g2=geo.index?geo.toNonIndexed():geo.clone();const p=g2.getAttribute('position'),n=g2.getAttribute('normal'),count=p.count;
 const pos=new Float32Array(count*6),nor=new Float32Array(count*6);
 for(let i=0;i<count;i++){pos.set([p.getX(i),p.getY(i),p.getZ(i)],i*3);nor.set([n.getX(i),n.getY(i),n.getZ(i)],i*3);}
 for(let t=0;t<count;t+=3)for(let k=0;k<3;k++){const src=t+2-k,dst=count+t+k;pos.set([p.getX(src),p.getY(src),p.getZ(src)],dst*3);nor.set([-n.getX(src),-n.getY(src),-n.getZ(src)],dst*3);}
 const out=new T.BufferGeometry();out.setAttribute('position',new T.BufferAttribute(pos,3));out.setAttribute('normal',new T.BufferAttribute(nor,3));
 const index:number[]=[];for(let i=0;i<count*2;i++)index.push(i);out.setIndex(index);geo.dispose();g2.dispose();return out;
}
function bumpySphere(r:number,ws:number,hs:number,amp:number){
 const geo=new T.SphereGeometry(r,ws,hs),p=geo.getAttribute('position'),v=new T.Vector3();
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);v.multiplyScalar(1+amp*Math.sin(v.x/r*9)*Math.sin(v.y/r*8)*Math.sin(v.z/r*7));p.setXYZ(i,v.x,v.y,v.z);}
 geo.computeVertexNormals();return geo;
}
const frontness=(a:number)=>(1+Math.cos(a))/2;
const hairlineOf=(front:number,back:number,p=1.3)=>(a:number)=>back+(front-back)*Math.pow(frontness(a),p);
function hairGeometry(){
 const b=newHead(),H=HAIR_IDS;
 // crop: a close cap of hair, fringe just above the eyes.
 hairShell(b,H.crop,hairlineOf(.9,.62),.07,.006);
 // tuft: short sides + a spiky tuft on top.
 hairShell(b,H.tuft,hairlineOf(.93,.72),.055);
 for(let i=0;i<7;i++){const cg=new T.ConeGeometry(.24,.9+(i%2)*.25,6,1,true);cg.translate(0,.42,0);cg.rotateZ((i-3)*.26);cg.rotateX(-.25-(i%2)*.2);cg.translate((i-3)*.11,.1,-(i%2)*.12);addRigid(b,cg,H.tuft,0,place([0,-.2,-.02]));}
 // puffs: a light cap and two round puffs with bobbles (accent colour).
 hairShell(b,H.puffs,hairlineOf(.92,.64),.05);
 for(const s of [-1,1]){addRigid(b,bumpySphere(.5,12,9,.035),H.puffs,0,place([s*.92,.02,-.15],[0,0,0],[.95,.95,.95]));addRigid(b,new T.TorusGeometry(.2,.07,5,10),H.puffs,1,place([s*.62,-.12,-.1],[0,Math.PI/2+s*.5,0]));}
 // bun: cap + a bun high at the back.
 hairShell(b,H.bun,hairlineOf(.9,.6),.065);
 addRigid(b,bumpySphere(.38,11,8,.02),H.bun,0,place([0,.5,-.62]));addRigid(b,new T.TorusGeometry(.25,.07,5,12),H.bun,1,place([0,.32,-.5],[-.9,0,0]));
 // ponytail: cap + a swinging tail from the back of the crown.
 hairShell(b,H.ponytail,hairlineOf(.9,.58),.065);
 {const curve=new T.CatmullRomCurve3([new T.Vector3(.05,.26,-.8),new T.Vector3(.22,.04,-1.1),new T.Vector3(.42,-.3,-1.08),new T.Vector3(.56,-.8,-.9)]);
  const tube=new T.TubeGeometry(curve,10,.25,8,false),p=tube.getAttribute('position'),v=new T.Vector3();
  // taper toward the tip
  const pts=curve.getSpacedPoints(10);for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const ring=Math.floor(i/9),k=Math.min(10,ring),cpt=pts[k],f=1-.4*(k/10);v.sub(cpt).multiplyScalar(f).add(cpt);p.setXYZ(i,v.x,v.y,v.z);}
  tube.computeVertexNormals();addRigid(b,tube,H.ponytail,0);
  addRigid(b,new T.SphereGeometry(.15,7,5),H.ponytail,0,place([.56,-.8,-.9]));
  addRigid(b,new T.TorusGeometry(.22,.075,5,10),H.ponytail,1,place([.1,.2,-.88],[-.5,.3,0]));}
 // curls: a thick bumpy cap ringed with curls.
 hairShell(b,H.curls,hairlineOf(.9,.6),.09,.012);
 {const bump=(u:number,a:number,r:number)=>{const sp=new T.SphereGeometry(r,5,3),p=sp.getAttribute('position'),n=new T.Vector3(),l=new T.Vector3(),start=b.pos.length/3;
   for(let k=0;k<p.count;k++){l.set(p.getX(k),p.getY(k),p.getZ(k));n.copy(l).normalize();l.z+=.1;addAnchored(b,u,a,l,n,H.curls,0);}
   const index=sp.index!;for(let k=0;k<index.count;k++)b.idx.push(start+index.getX(k));sp.dispose();};
  for(let i=0;i<15;i++){const a=i/15*Math.PI*2;bump(hairlineOf(.9,.6)(a)+.035+(i%2)*.03,a,.18);}
  for(let i=0;i<6;i++)bump(.955,i/6*Math.PI*2+.3,.2);}
 // long: cap + hair lying down the upper back + two side locks framing the face.
 hairShell(b,H.long,hairlineOf(.9,.55),.075);
 hairShell(b,H.long,()=>.58,.07,0,[Math.PI-1.25,Math.PI+1.25],.8);
 for(const s of [-1,1])hairShell(b,H.long,()=>.63,.07,0,s<0?[Math.PI*2-1.42,Math.PI*2-.98]:[.98,1.42],.9);
 return finishHead(b,'bean-hair');
}
function hatGeometry(){
 const b=newHead(),K=HAT_IDS;
 // cap: training cap, brim forward, button on top.
 addRigid(b,new T.SphereGeometry(1.04,16,7,0,Math.PI*2,0,Math.PI*.5),K.cap,1,place([0,-.25,0],[-.12,0,0]));
 {const brim=new T.CylinderGeometry(.72,.72,.07,12,1,false,-Math.PI/2,Math.PI);brim.scale(1,1,1.25);addRigid(b,brim,K.cap,2,place([0,-.24,.42],[-.1,0,0]));}
 addRigid(b,new T.SphereGeometry(.1,6,4),K.cap,2,place([0,.78,-.05]));
 // beanie: match-day beanie, turned-up stripe and pom-pom.
 addRigid(b,new T.SphereGeometry(1.06,16,8,0,Math.PI*2,0,Math.PI*.56),K.beanie,1,place([0,-.28,0]));
 addRigid(b,new T.TorusGeometry(1.02,.16,6,18),K.beanie,2,place([0,-.2,0],[Math.PI/2,0,0]));
 addRigid(b,bumpySphere(.32,8,6,.06),K.beanie,2,place([0,.9,-.02]));
 // headband: sweatband.
 addRigid(b,new T.TorusGeometry(1.0,.13,6,20),K.headband,1,place([0,-.42,0],[Math.PI/2-.1,0,0]));
 // bucket: supporters' bucket hat, two-tone.
 addRigid(b,doubleSided(new T.CylinderGeometry(.82,.98,.7,18,1,true)),K.bucket,1,place([0,.05,0]));
 addRigid(b,new T.CircleGeometry(.82,18),K.bucket,1,place([0,.4,0],[-Math.PI/2,0,0]));
 addRigid(b,doubleSided(new T.CylinderGeometry(1.02,1.42,.28,20,1,true)),K.bucket,2,place([0,-.42,0]));
 addRigid(b,new T.TorusGeometry(.96,.07,4,18),K.bucket,2,place([0,-.22,0],[Math.PI/2,0,0]));
 // visor: sun visor.
 addRigid(b,new T.TorusGeometry(1.0,.11,6,20),K.visor,1,place([0,-.35,0],[Math.PI/2-.12,0,0]));
 {const brim=new T.CylinderGeometry(.8,.8,.05,12,1,false,-Math.PI/2,Math.PI);brim.scale(1,1,1.2);addRigid(b,brim,K.visor,1,place([0,-.33,.5],[-.25,0,0]));}
 // keeper: retro goalkeeper cap, flat crown and a long brim.
 addRigid(b,new T.CylinderGeometry(.96,1.04,.32,18),K.keeper,1,place([0,-.2,0],[-.1,0,0]));
 addRigid(b,new T.SphereGeometry(.96,18,5,0,Math.PI*2,0,Math.PI*.5),K.keeper,1,place([0,-.05,-.02],[-.1,0,0],[1,.55,1]));
 {const brim=new T.CylinderGeometry(.86,.86,.06,12,1,false,-Math.PI/2,Math.PI);brim.scale(1,1,1.35);addRigid(b,brim,K.keeper,2,place([0,-.36,.42],[-.08,0,0]));}
 return finishHead(b,'bean-hat');
}
function finishHead(b:HeadBuilder,name:string){
 const geo=new T.BufferGeometry();
 geo.setAttribute('position',new T.Float32BufferAttribute(b.pos,3));geo.setAttribute('normal',new T.Float32BufferAttribute(b.nrm,3));
 geo.setAttribute('beanAnchor',new T.Float32BufferAttribute(b.anchor,4));geo.setAttribute('beanLocal',new T.Float32BufferAttribute(b.local,3));
 geo.setAttribute('beanLocalN',new T.Float32BufferAttribute(b.localN,3));geo.setAttribute('beanPaint',new T.Float32BufferAttribute(b.paint,1));geo.setIndex(b.idx);
 geo.boundingSphere=new T.Sphere(new T.Vector3(0,.8,-.05),.6);geo.boundingBox=new T.Box3(new T.Vector3(-.4,.35,-.5),new T.Vector3(.4,1.2,.4));
 geo.name=name;return geo;
}
let shared:{body:T.BufferGeometry;limbs:T.BufferGeometry;hair:T.BufferGeometry;hat:T.BufferGeometry}|undefined;
/** Shared, never-disposed bean geometry (one set for every rig). */
export function beanGeometries(){return shared??={body:bodyGeometry(),limbs:limbGeometry(),hair:hairGeometry(),hat:hatGeometry()};}
/**
 * NPC style views (Sep 27 2026): a view of the shared hair or hat geometry that draws only one style's index range. It shares
 * the base's attribute and index objects (the same GPU buffers, no copy or upload) and bounds, and has its own draw range, so an
 * individually rendered rig (townsfolk, previews) draws only its style in the colour and shadow passes instead of every style
 * collapsed in the vertex shader. One view per style, cached and never disposed (disposing would release the shared buffers).
 * playerBatch keys and clones by `userData.beanStyleBase`, so batches group exactly as before. Style 0 (none, mesh hidden)
 * and a non-contiguous style fall back to the base geometry.
 */
const styleViews=new WeakMap<T.BufferGeometry,Map<number,T.BufferGeometry>>();
export function beanStyleView(base:T.BufferGeometry,style:number):T.BufferGeometry{
 if(style<=0)return base;
 let views=styleViews.get(base);if(!views){views=new Map();styleViews.set(base,views);}
 let view=views.get(style);if(view)return view;
 const range=styleIndexRange(base,style);if(!range)return base;
 view=new T.BufferGeometry();for(const [name,attribute] of Object.entries(base.attributes))view.setAttribute(name,attribute);view.setIndex(base.index);
 view.setDrawRange(range.start,range.count);view.boundingSphere=base.boundingSphere?.clone()??null;view.boundingBox=base.boundingBox?.clone()??null;view.name=base.name;
 view.userData.beanStyleBase=base;view.userData.beanStyle=style;views.set(style,view);return view;
}
/** Picking on a hair/hat mesh tests the whole base geometry, as before the style views (taps on a townsperson are unchanged). */
function raycastBase(this:T.Mesh,raycaster:T.Raycaster,hits:T.Intersection[]){
 const view=this.geometry,base=view.userData.beanStyleBase as T.BufferGeometry|undefined;if(!base){T.Mesh.prototype.raycast.call(this,raycaster,hits);return;}
 this.geometry=base;try{T.Mesh.prototype.raycast.call(this,raycaster,hits);}finally{this.geometry=view;}
}

// ---------------------------------------------------------------- rig skin
export type BeanJoints={
 root:T.Group;pelvis:T.Group;torso:T.Group;lumbar:T.Group;chest:T.Group;head:T.Group;
 arms:{shoulder:T.Group;elbow:T.Group;hand:T.Group}[];legs:{hip:T.Group;knee:T.Group;ankle:T.Group}[];
};
export type BeanSkin={
 readonly meshes:readonly T.Mesh[];
 readonly data:Float32Array;
 readonly look:BeanLook;
 readonly outfit:Outfit;
 readonly expression:BeanExpression;
 readonly number:number|null;
 /** Face atlas cell currently shown (per instance). */
 readonly faceCell:number;
 active:boolean;
 setLook:(look:BeanLook,outfit:Outfit)=>void;
 setExpression:(e:BeanExpression)=>void;
 setNumber:(n:number|null)=>void;
 /** Refreshes spine rotations, limb control points and end frames from the joints (needs current world matrices). */
 sync:()=>void;
 dispose:()=>void;
};
const _inv=new T.Matrix4(),_m=new T.Matrix4(),_v=new T.Vector3(),_w=new T.Vector3(),_col=new T.Color(),_hand=new T.Matrix4().makeTranslation(0,-.265,0);
/**
 * Builds the bean skin on a rig's joints (hidden classic meshes stay in place for the classic fallback).
 * The skin's four meshes are added now, so playerBatch's cached part list includes them.
 */
export function createBeanSkin(j:BeanJoints,id:string,team:string,articulatedHands:boolean):BeanSkin{
 const geos=beanGeometries(),data=new Float32Array(BD.size*4),handle=beanRowHandle(data);
 const materials:(BeanMaterial|BeanDepthMaterial)[]=[];
 const make=(kind:BeanKind,geo:T.BufferGeometry,parent:T.Object3D,width:number)=>{
  const mat=new BeanMaterial(kind,handle),depth=new BeanDepthMaterial(kind,handle);materials.push(mat,depth);
  const mesh=new T.Mesh(geo,mat);mesh.name='bean-'+kind;mesh.customDepthMaterial=depth;mesh.castShadow=kind!=='hair';if(kind==='hair')mesh.userData.batchShadow=false;mesh.receiveShadow=true;
  mesh.userData.playerId=id;mesh.userData.beanData={array:data,width,staticWidth:BD.lumbar};mesh.userData.beanPart=kind;
  mesh.onBeforeRender=renderer=>syncFor(renderer);mesh.onBeforeShadow=renderer=>syncFor(renderer);
  parent.add(mesh);mesh.updateMatrix();mesh.matrixAutoUpdate=false;return mesh;
 };
 const body=make('body',geos.body,j.torso,BEAN_STATIC_WIDTH),limbs=make('limbs',geos.limbs,j.root,BD.size);
 const hair=make('hair',geos.hair,j.torso,BEAN_STATIC_WIDTH),hat=make('hat',geos.hat,j.torso,BEAN_STATIC_WIDTH);
 hair.raycast=hat.raycast=raycastBase;
 // The number panel is shaded on the body: no separate draw, no shadow.
 const meshes=[body,limbs,hair,hat];
 let look:BeanLook=defaultBeanLookFor(id),outfit:Outfit=defaultOutfitForTeam(team),expression:BeanExpression='neutral',number:number|null=null,active=true,cell=0;
 const put=(k:number,x:number,y:number,z:number,w:number)=>{const o=k*4;data[o]=x;data[o+1]=y;data[o+2]=z;data[o+3]=w;};
 const colour=(k:number,hex:string,w=0)=>{_col.set(hex);put(k,_col.r,_col.g,_col.b,w);};
 const writeStatic=()=>{
  const shirtW=shirtInk(outfit.shirt)==='#ffffff'?1:0;
  colour(BD.shirt,outfit.shirt,shirtW);colour(BD.shirt2,outfit.shirt2);colour(BD.shorts,outfit.shorts);colour(BD.socks,outfit.socks);colour(BD.socks2,outfit.socks2??outfit.shirt2);colour(BD.boots,outfit.boots);
  colour(BD.body,look.body);cell=faceCell(look.eyes,look.mouth,expression);colour(BD.skin,look.skin,cell);colour(BD.blush,look.blush??look.skin,look.blush?1:0);
  colour(BD.hands,look.gloves??look.body,look.gloves?1.45:1);
  const hw=look.headwear??'none',hs=look.hair?.style??'none',hairId=COVERING.has(hw)&&SHORT_HAIR.has(hs)?0:HAIR_IDS[hs]??0;
  colour(BD.hair,look.hair?.color??'#2a1c16',hairId);colour(BD.hat1,look.headwearColor??(hw==='none'?'#ff5d8f':outfit.shirt),HAT_IDS[hw]??0);
  colour(BD.hat2,look.headwearColor2??(hw==='none'?'#fff4cd':outfit.shirt2),number??0);
  const s=BEAN_SHAPES[look.build]??BEAN_SHAPES.regular;put(BD.shape0,s.H,s.W,s.D,s.taper);put(BD.shape1,s.belly,s.leanX,s.leanZ,look.build==='wide'?1.08:look.build==='tall'?.95:1);
  put(BD.misc,FACE_U,BEAN_NUMBER_U,0,0);
  hair.geometry=beanStyleView(geos.hair,hairId);hat.geometry=beanStyleView(geos.hat,HAT_IDS[hw]??0);
  hair.visible=hairId>0;hat.visible=(HAT_IDS[hw]??0)>0;
  for(const m of meshes)if(m!==hair&&m!==hat)m.visible=active;
  if(!active){hair.visible=hat.visible=false;}
  if(active)j.root.userData.beanBody=beanBodyDims(look.build);else delete j.root.userData.beanBody;
 };
 const rest=[[-1,LIMB_ARM],[1,LIMB_ARM],[-1,LIMB_LEG],[1,LIMB_LEG]] as const;
 const sync=()=>{
  _inv.copy(j.root.matrixWorld).invert();
  put(BD.lumbar,j.lumbar.rotation.x,j.lumbar.rotation.y,j.lumbar.rotation.z,0);put(BD.chest,j.chest.rotation.x,j.chest.rotation.y,j.chest.rotation.z,0);
  const chestP=_w.setFromMatrixPosition(j.chest.matrixWorld).applyMatrix4(_inv).clone(),pelvisP=_v.setFromMatrixPosition(j.pelvis.matrixWorld).applyMatrix4(_inv).clone();
  for(let k=0;k<4;k++){
   const arm=k<2,side=k%2,[,spec]=rest[k],base=BD.limbs+4*k;
   const top=arm?j.arms[side].shoulder:j.legs[side].hip,mid=arm?j.arms[side].elbow:j.legs[side].knee;
   _v.setFromMatrixPosition(top.matrixWorld).applyMatrix4(_inv);
   if(arm){_v.lerp(chestP,.55);_v.y-=.045;}else{_v.lerp(pelvisP,.35);_v.y+=.07;}
   put(base,_v.x,_v.y,_v.z,spec.r0);
   _v.setFromMatrixPosition(mid.matrixWorld).applyMatrix4(_inv);put(base+1,_v.x,_v.y,_v.z,spec.r1);
   if(arm){_m.multiplyMatrices(j.arms[side].elbow.matrixWorld,_hand);if(articulatedHands&&j.arms[side].hand.parent===j.arms[side].elbow)_m.copy(j.arms[side].hand.matrixWorld);}
   else _m.copy(j.legs[side].ankle.matrixWorld);
   _v.setFromMatrixPosition(_m).applyMatrix4(_inv);put(base+2,_v.x,_v.y,_v.z,spec.bulge);
   // Hinge: the upper joint's x axis (knees and elbows bend about it), in root space.
   _w.setFromMatrixColumn(top.matrixWorld,0).transformDirection(_inv);put(base+3,_w.x,_w.y,_w.z,arm?-1:1);
   // End frame (hand or ankle) as three rows of a root-space 3×4 matrix.
   _m.premultiply(_inv);const e=_m.elements,f=BD.frames+3*(arm?side:2+side);
   put(f,e[0],e[4],e[8],e[12]);put(f+1,e[1],e[5],e[9],e[13]);put(f+2,e[2],e[6],e[10],e[14]);
  }
 };
 let syncedRenderer:unknown,syncedFrame=-1;
 const syncFor=(renderer:T.WebGLRenderer)=>{const frame=renderer.info.render.frame;if(renderer===syncedRenderer&&frame===syncedFrame)return;syncedRenderer=renderer;syncedFrame=frame;sync();};
 j.root.userData.beanSync=()=>{if(active)sync();};
 writeStatic();sync();
 return {
  meshes,data,get look(){return look;},get outfit(){return outfit;},get expression(){return expression;},get number(){return number;},get faceCell(){return cell;},
  get active(){return active;},set active(v:boolean){if(v===active)return;active=v;writeStatic();},
  setLook(l,o){look={...l};outfit={...o};if(o.number!==undefined)number=o.number===null||!Number.isFinite(o.number)||o.number<1?null:Math.min(99,Math.round(o.number));writeStatic();},
  setExpression(e){if(e===expression||!BEXPR[e])return;expression=e;writeStatic();},
  setNumber(n){number=n===null||!Number.isFinite(n)||n<1?null:Math.min(99,Math.round(n));writeStatic();},
  sync,
  dispose(){for(const m of meshes)m.removeFromParent();materials.forEach(m=>m.dispose());handle.dispose();delete j.root.userData.beanSync;delete j.root.userData.beanBody;},
 };
}

// ---------------------------------------------------------------- PlayerRig hook (player.ts calls this once, in createPlayer)
type HookedRig={
 root:T.Group;
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 setAppearance:(value:any)=>void;
 setShirtNumber:(n:number|null)=>void;
 setBeanLook:(look:BeanLook,outfit:Outfit)=>void;
 setExpression:(e:BeanExpression)=>void;
 dispose:()=>void;
};
/**
 * In 'bean' style: hides the classic meshes and attaches the bean skin; the PlayerRig API is unchanged. While an
 * animal club costume is equipped the rig renders classic (costumes are built for the classic body) and the bean
 * skin sleeps. In 'classic' style the rig is returned untouched (setBeanLook/setExpression stay no-ops).
 * Classic mesh visibility set by setAppearance/setShirtNumber is remembered, so the classic fallback is exact.
 */
export function attachBeanSkin<R extends HookedRig>(rig:R,j:BeanJoints,id:string,team:string,articulatedHands:boolean,style:'bean'|'classic'):R{
 if(style!=='bean')return rig;
 const skin=createBeanSkin(j,id,team,articulatedHands),bean=new Set<T.Object3D>(skin.meshes),intended=new Map<T.Mesh,boolean>();
 let costume=false;
 const classic=()=>{const out:T.Mesh[]=[];j.root.traverse(o=>{if(o instanceof T.Mesh&&!bean.has(o)&&!(o.parent&&bean.has(o.parent))&&o.name!=='character-selection-glow')out.push(o);});return out;};
 // userData.beanHidden (heat pass 4, audit F8): a hidden childless classic mesh whose matrices playerBatch may skip (joints are Groups).
 const restore=()=>{for(const [m,v] of intended){m.visible=v;delete m.userData.beanHidden;}intended.clear();};
 const capture=()=>{for(const m of classic()){intended.set(m,m.visible);if(!costume){m.visible=false;if(!m.children.length)m.userData.beanHidden=true;}}};
 capture();
 const {setAppearance,setShirtNumber,dispose}=rig;
 rig.setAppearance=(value:{costume?:string|null})=>{restore();setAppearance(value);costume=!!value.costume&&value.costume!=='none';skin.active=!costume;capture();};
 rig.setShirtNumber=n=>{restore();setShirtNumber(n);skin.setNumber(n);capture();};
 rig.setBeanLook=(look,outfit)=>{skin.setLook(look,outfit);if(outfit.number!==undefined)rig.setShirtNumber(outfit.number);};
 rig.setExpression=e=>skin.setExpression(e);
 rig.dispose=()=>{skin.dispose();dispose();};
 Object.defineProperty(rig,'beanSkin',{value:skin,enumerable:false,configurable:true});
 return rig;
}
/** The bean skin attached to a rig (undefined in classic style). */
export function beanSkinOf(rig:object):BeanSkin|undefined{return (rig as {beanSkin?:BeanSkin}).beanSkin;}
