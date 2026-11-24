/**
 * Island Line passengers (train Gameplay 3; look pass Nov 24 2026, owner: "the npcs don't look good"): the passengers are the
 * island's own bean characters, not a separate figure. They reuse the islanders' bean skin (lib/graphics/beanSkin.ts) as-is:
 * the SAME shared body / limbs / hair / headwear geometry and the SAME BeanMaterial programs the town's batched islanders use
 * (playerBatch: BEAN_ROW_TEXTURE + instancing), so faces, blush, hair styles, hats, casual outfits and skin tones match exactly,
 * and no new bean program is compiled. Each part is ONE InstancedMesh for every passenger on every train, reading a per-instance
 * row (gl_InstanceID) from two small float textures, like playerBatch: the static texels (colours, face cell, hair / hat style,
 * shape) and the pose texels (spine, limb control points, hand / foot frames, neck gaze).
 *  - Poses are BAKED once, on first sight, from a real rig: one hidden createPlayer rig (never added to the scene, disposed
 *    straight after) is posed with the island's own seated-bench solve (npcSeatPose 'bench': bottom on the seat, thighs along
 *    it, lower legs hanging, hands on the lap) and a few variants (hands round a box on the lap, a phone, a newspaper / notebook
 *    held up; standing with a hand up on the strap, a phone in the other, arms down, a ball held in front), adult and kid
 *    (AGE_PROFILES.kid height). The static rows are baked the same way (rig.setBeanLook per cast member: the islanders' code).
 *  - Props (ball, bento, newspaper, phone, notebook, camera, scarf in island team colours, backpack) are one more instanced mesh:
 *    every prop in every baked hand spot in one geometry; per-instance flags keep this passenger's props, the rest collapse to a
 *    point in the vertex shader (no fragments).
 * Draws: body, limbs, hair, hat, props = at most 5 for every passenger on every train (the hat mesh only while someone wears
 * one); no shadow pass. Far tier (trainPassengers.ts NEAR_RANGE): instances are ordered near first, the limbs and props draw only
 * the near ones (behind a window at 30–45 m the bodies and heads read; arms and props would not).
 * Frames: the limbs and the instance root = the rig root (on the car floor, +z = facing, y up, metres before the kid scale); the
 * body / hair / hat / props = the baked torso frame (root × torso of that pose). No allocation per frame.
 */
import * as T from 'three';
import {createPlayer} from './player';
import {BD,BEAN_SHAPES,BeanMaterial,beanGeometries,beanPoint,beanRadius,beanSkinOf} from './beanSkin';
import {characterStyle,setCharacterStyle} from './characterStyle';
import {npcSeatPose,restHand} from './npcSeatPose';
import {createTrickPose,type TrickPose} from './trickPose';
import type {BeanBuild,BeanLook,Outfit} from './beanLook';
import {AGE_PROFILES} from '../town/townsfolkCast';

/** Baked poses (bake index = pose + PAX_POSES for a kid). Seated: lap (hands on the thighs), hold (both hands round a box / ball /
 *  bag on the lap), phone (one hand up, head down), read (newspaper / notebook up in both hands). Standing: strap (one hand up on
 *  the strap), strapPhone (+ a phone in the other), stand (arms down: walking on / off, kids), standHold (a ball in front). */
export const PAX_POSE={lap:0,hold:1,phone:2,read:3,strap:4,strapPhone:5,stand:6,standHold:7} as const;
export const PAX_POSES=8,PAX_KID_SCALE=AGE_PROFILES.kid.height;
export const paxSeated=(bake:number)=>bake%PAX_POSES<4;
/** Prop bits (PaxLook.props). */
export const PAX_PROP={ball:0,bento:1,paper:2,phone:3,notebook:4,camera:5,scarf:6,bag:7} as const;
export type PaxProp=keyof typeof PAX_PROP;
export const propMask=(list:readonly PaxProp[])=>list.reduce((m,p)=>m|1<<PAX_PROP[p],0);
const has=(mask:number,p:PaxProp)=>(mask>>PAX_PROP[p]&1)===1;
/** The pose for a passenger's props: seated / standing, a kid, walking through the doors. */
export function paxPoseFor(mask:number,seated:boolean,kid:boolean,walking=false){
 const P=PAX_POSE,ball=has(mask,'ball');let p:number;
 if(walking)p=ball?P.standHold:P.stand;
 else if(seated)p=has(mask,'paper')||has(mask,'notebook')?P.read:has(mask,'phone')?P.phone:ball||has(mask,'bento')?P.hold:P.lap;
 else p=kid?(ball?P.standHold:P.stand):has(mask,'phone')?P.strapPhone:P.strap;
 return p+(kid?PAX_POSES:0);
}
/** Neck gaze pitch each pose rests at (+ = looking down: a phone, a page, the box on the lap). */
export const PAX_GAZE_PITCH=[.06,.22,.42,.3,0,.36,0,.12] as const;
/** A cast member's look: the islander bean look + outfit, a kid, props, the prop colours (scarf stripes / bag / bento lid). */
export type PaxLook={look:BeanLook;outfit:Outfit;kid:boolean;props:number;propA:string;propB:string};
/** Strap handle height over the car floor (trainCarModel STRAP_GRIP_Y − CAR_FLOOR_Y, + the loop) where the strap hand closes. */
export const PAX_STRAP_HAND={y:1.5,z:.24,x:.23} as const;
/** The seated bake fits the envelope of every build (npcSeatPose: none can clip the backrest), so a slimmer bean sits a little off
 *  it: how far (m, before the kid scale) each build's root slides back so its own back meets the backrest like the widest one. */
export const PAX_SEAT_BACK:Record<BeanBuild,number>=(()=>{const deep=(s:typeof BEAN_SHAPES.regular)=>{let z=0;for(let u=.15;u<=.6;u+=.05)z=Math.min(z,beanPoint(s,u,Math.PI).z);return z;};
 const all=Object.values(BEAN_SHAPES).map(deep),env=Math.min(...all),o={} as Record<BeanBuild,number>;for(const k of Object.keys(BEAN_SHAPES) as BeanBuild[])o[k]=Math.max(0,deep(BEAN_SHAPES[k])-env);return o;})();
const STATIC_W=BD.lumbar,DYN_W=BD.size-BD.lumbar,ROWS_MIN=64;
type Bake={dyn:Float32Array;torso:T.Matrix4;hands:[T.Vector3,T.Vector3];feet:[T.Vector3,T.Vector3]};

// ---------------------------------------------------------------- the bake (one hidden rig, once)
/** Arms relaxed by the sides (standing). */
function relaxArms(o:TrickPose){for(const a of o.arms){a.sx=.08;a.sz=.1;a.el=-.32;a.w=1;}}
function standPose(){const o=createTrickPose();o.w=1;o.pelvisY=.9;o.headPitch=0;for(const [i,l] of o.legs.entries()){l.x=i?.11:-.11;l.y=.075;l.z=0;l.toe=0;l.w=1;}relaxArms(o);return o;}
/** Bakes every pose (adult and kid) and every cast member's static row from one hidden rig. Pure CPU, ~tens of ms, once. */
export function bakePassengers(looks:readonly PaxLook[]){
 const was=characterStyle();setCharacterStyle('bean');
 let rig:ReturnType<typeof createPlayer>;try{rig=createPlayer('train-pax-bake','home',true,true);}finally{setCharacterStyle(was==='bean'?undefined:was);}
 const skin=beanSkinOf(rig);if(!skin){rig.dispose();throw new Error('train passengers: no bean skin');}
 const statics=new Float32Array(Math.max(1,looks.length)*STATIC_W*4),hats=new Uint8Array(looks.length);
 looks.forEach((d,i)=>{rig.setBeanLook(d.look,{...d.outfit,number:null});statics.set(skin.data.subarray(0,STATIC_W*4),i*STATIC_W*4);hats[i]=skin.data[BD.hat1*4+3]>.5?1:0;});
 const inv=new T.Matrix4(),bakes:Bake[]=[],v=new T.Vector3();
 const at=(f:number,lx:number,ly:number,lz:number,out:T.Vector3)=>{const d=skin.data,r=(k:number)=>d[(f+k)*4]*lx+d[(f+k)*4+1]*ly+d[(f+k)*4+2]*lz+d[(f+k)*4+3];return out.set(r(0),r(1),r(2));};
 const run=(o:TrickPose,gaze:number):Bake=>{
  for(let i=0;i<8;i++)rig.update(0,0,1/30,i/30,true,{trick:o});rig.root.updateMatrixWorld(true);skin.sync();
  inv.copy(rig.root.matrixWorld).invert();const torso=skin.meshes[0].matrixWorld.clone().premultiply(inv);
  const dyn=skin.data.slice(STATIC_W*4,BD.size*4);dyn[3]=gaze;dyn[7]=0;
  // mitten centres (2 cm down the hand joint, beanSkin limbGeometry) and the soles, root frame
  return {dyn,torso,hands:[at(BD.frames,0,-.02,0,new T.Vector3()),at(BD.frames+3,0,-.02,0,new T.Vector3())],feet:[at(BD.frames+6,0,0,.05,new T.Vector3()),at(BD.frames+9,0,0,.05,new T.Vector3())]};
 };
 try{
  for(const kid of [false,true]){
   const scale=kid?PAX_KID_SCALE:1;if(kid)rig.setProfile(AGE_PROFILES.kid);
   const seat=()=>npcSeatPose('bench',scale);
   const lap=run(seat(),PAX_GAZE_PITCH[0]);
   // the top of the lap between the hands: where a box / ball rests
   const mid=v.copy(lap.hands[0]).add(lap.hands[1]).multiplyScalar(.5);const lapY=mid.y-.01,lapZ=mid.z+.03;
   const hold=seat();for(const [i,a] of hold.arms.entries())restHand(hold,i?1:-1,lapZ,lapY+.07,a);
   const phone=seat();restHand(phone,1,phone.pelvisZ+.3,phone.pelvisY+.36,phone.arms[1]);
   const read=seat();for(const [i,a] of read.arms.entries())restHand(read,i?1:-1,read.pelvisZ+.33,read.pelvisY+.3,a);
   const strap=standPose(),H=PAX_STRAP_HAND;restHand(strap,1,H.z/scale,H.y/scale,strap.arms[1]);
   const strapPhone=standPose();restHand(strapPhone,1,H.z/scale,H.y/scale,strapPhone.arms[1]);restHand(strapPhone,-1,.3,strapPhone.pelvisY+.36,strapPhone.arms[0]);
   const standHold=standPose();for(const [i,a] of standHold.arms.entries())restHand(standHold,i?1:-1,.27,standHold.pelvisY+.12,a);
   const poses=[lap,run(hold,PAX_GAZE_PITCH[1]),run(phone,PAX_GAZE_PITCH[2]),run(read,PAX_GAZE_PITCH[3]),run(strap,PAX_GAZE_PITCH[4]),run(strapPhone,PAX_GAZE_PITCH[5]),run(standPose(),PAX_GAZE_PITCH[6]),run(standHold,PAX_GAZE_PITCH[7])];
   bakes.push(...poses);
  }
 }finally{rig.dispose();}
 return {statics,hats,bakes};
}

// ---------------------------------------------------------------- props (one geometry, every prop in every baked spot)
/** aPax: x colour code (0 prop colour A, 1 B, 2 white, 3 ink, 4 print grey, 5 screen, 6 wood), y prop bit, z selector (a bake
 *  index; 20 any pose, 21 standing only, 22 seated only; ≥ 20 = worn on the body: follows the build's width / height). */
const C={A:0,B:1,white:2,ink:3,print:4,screen:5,wood:6,case:7} as const,ANY=20,STANDING=21,SEATED=22;
function tagged(g:T.BufferGeometry,colour:number|((tri:number,c:T.Vector3)=>number),bit:number,sel:number){
 const out=g.index?g.toNonIndexed():g;if(out!==g)g.dispose();for(const k of Object.keys(out.attributes))if(k!=='position'&&k!=='normal')out.deleteAttribute(k);if(!out.getAttribute('normal'))out.computeVertexNormals();
 const pos=out.getAttribute('position'),n=pos.count,a=new Float32Array(n*3),c=new T.Vector3();
 for(let t=0;t<n/3;t++){let code:number;if(typeof colour==='number')code=colour;else{c.set(0,0,0);for(let k=0;k<3;k++)c.x+=pos.getX(t*3+k)/3,c.y+=pos.getY(t*3+k)/3,c.z+=pos.getZ(t*3+k)/3;code=colour(t,c);}
  for(let k=0;k<3;k++){const i=(t*3+k)*3;a[i]=code;a[i+1]=bit;a[i+2]=sel;}}
 out.setAttribute('aPax',new T.BufferAttribute(a,3));return out;
}
const box=(w:number,h:number,d:number)=>new T.BoxGeometry(w,h,d);
const place=(g:T.BufferGeometry,x:number,y:number,z:number,rx=0,ry=0,rz=0)=>{g.applyMatrix4(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(1,1,1)));return g;};
/** A football: white with 12 dark patches (the triangles round the icosahedron's corners). */
function football(r:number){
 const g=new T.IcosahedronGeometry(r,1),corners=new T.IcosahedronGeometry(1,0),cp=corners.getAttribute('position'),dirs:T.Vector3[]=[];
 for(let i=0;i<cp.count;i++){const d=new T.Vector3(cp.getX(i),cp.getY(i),cp.getZ(i)).normalize();if(!dirs.some(e=>e.distanceTo(d)<1e-3))dirs.push(d);}corners.dispose();
 return {g,colour:(_t:number,c:T.Vector3)=>{const d=c.clone().normalize();return dirs.some(e=>e.dot(d)>.94)?C.ink:C.white;}};
}
/** The worn props (torso frame of the regular build): scarf (striped ring + two tails), camera on the chest, backpack (standing). */
function wornProps(out:T.BufferGeometry[]){
 const s=BEAN_SHAPES.regular,ring=(u:number,band:number,off:number,thick:number,segs:number,colour:(i:number)=>number,bit:number)=>{
  const p=new T.Vector3();for(let i=0;i<segs;i++){const a0=i/segs*Math.PI*2,a1=(i+1)/segs*Math.PI*2,pts:T.Vector3[]=[];
   for(const a of [a0,a1]){beanPoint(s,u,a,p);const cx=s.leanX*u*u*(s.H+.13),cz=s.leanZ*u*u*(s.H+.13),dx=p.x-cx,dz=p.z-cz,l=Math.hypot(dx,dz)||1;
    for(const [o,dy] of [[off,band/2],[off,-band/2],[off+thick,-band/2],[off+thick,band/2]] as const)pts.push(new T.Vector3(p.x+dx/l*o,p.y+dy,p.z+dz/l*o));}
   const g=new T.BufferGeometry(),v:number[]=[],q=(a:T.Vector3,b:T.Vector3,c:T.Vector3,d:T.Vector3)=>v.push(...a.toArray(),...b.toArray(),...c.toArray(),...a.toArray(),...c.toArray(),...d.toArray());
   const [A0,B0,C0,D0,A1,B1,C1,D1]=pts;q(D0,C0,C1,D1);q(A0,D0,D1,A1);q(B0,A0,A1,B1);q(C0,B0,B1,C1);
   g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.computeVertexNormals();out.push(tagged(g,colour(i),bit,ANY));}
 };
 // scarf: a striped band round the neck line, then two striped tails down the chest (left of the face)
 ring(.6,.085,.0,.035,20,i=>i%4<2?C.A:C.B,PAX_PROP.scarf);
 const front=beanPoint(s,.56,.42,new T.Vector3()),tailTop=front.y-.02;
 for(const [k,dx,rz] of [[0,0,.05],[1,.075,-.06]] as const)for(let j=0;j<4;j++){
  const g=place(box(.072,.075,.022),front.x+dx-.03,tailTop-.04-j*.075,front.z+.03+(.012*j)+k*.008,-.12,.35,rz);out.push(tagged(g,j%2?C.B:C.A,PAX_PROP.scarf,ANY));}
 // camera on a strap: a thin dark band round the neck, the body on the chest with its lens
 ring(.63,.016,.012,.012,14,()=>C.ink,PAX_PROP.camera);
 const chest=beanPoint(s,.44,0,new T.Vector3());
 out.push(tagged(place(box(.11,.075,.05),chest.x,chest.y,chest.z+.03),C.ink,PAX_PROP.camera,ANY));
 {const l=new T.CylinderGeometry(.026,.03,.045,10);l.rotateX(Math.PI/2);place(l,chest.x,chest.y-.004,chest.z+.075);out.push(tagged(l,C.print,PAX_PROP.camera,ANY));}
 out.push(tagged(place(box(.028,.016,.008),chest.x-.032,chest.y+.045,chest.z+.03),C.print,PAX_PROP.camera,ANY));
 // backpack (standing / walking): on the upper back, two straps over the shoulders
 const back=beanPoint(s,.44,Math.PI,new T.Vector3()),bw=beanRadius(s,.44);
 out.push(tagged(place(box(.27,.32,.13),back.x,back.y,back.z-.075),C.A,PAX_PROP.bag,STANDING));
 out.push(tagged(place(box(.24,.12,.02),back.x,back.y+.06,back.z-.15),C.B,PAX_PROP.bag,STANDING));
 for(const sx of [-1,1]){const f=beanPoint(s,.5,sx*.42,new T.Vector3());out.push(tagged(place(box(.035,.24,.012),f.x,f.y-.02,f.z+.006,-.08,sx*.42,0),C.B,PAX_PROP.bag,STANDING));
  out.push(tagged(place(box(.035,.02,bw*2*s.D),sx*.11,beanPoint(s,.62,0).y+.005,(back.z+f.z)/2),C.B,PAX_PROP.bag,STANDING));}
}
/** The hand-held props of one bake (its hands, in the root frame → that bake's torso frame). */
function handProps(out:T.BufferGeometry[],b:Bake,bi:number){
 const pose=bi%PAX_POSES;if(bi>=PAX_POSES&&pose!==PAX_POSE.hold&&pose!==PAX_POSE.lap&&pose!==PAX_POSE.standHold)return;
 const toTorso=b.torso.clone().invert(),P=PAX_POSE,add=(g:T.BufferGeometry,colour:Parameters<typeof tagged>[1],bit:number)=>{g.applyMatrix4(toTorso);out.push(tagged(g,colour,bit,bi));};
 const [L,R]=b.hands,mid=L.clone().add(R).multiplyScalar(.5);
 if(pose===P.hold||pose===P.standHold){
  const f=football(.1);place(f.g,mid.x,mid.y+(pose===P.hold?.035:.0),mid.z+.02);add(f.g,f.colour,PAX_PROP.ball);
 }
 if(pose===P.hold){
  add(place(box(.2,.075,.14),mid.x,mid.y+.0,mid.z+.01),C.wood,PAX_PROP.bento);
  add(place(box(.212,.022,.152),mid.x,mid.y+.048,mid.z+.01),C.A,PAX_PROP.bento);
  add(place(box(.03,.1,.156),mid.x,mid.y+.02,mid.z+.01),C.B,PAX_PROP.bento);
 }
 if(pose===P.read){
  // a newspaper held open in both hands, its top tipped back toward the face; or a small notebook
  const tilt=-.55;
  add(place(box(.46,.32,.006),mid.x,mid.y+.1,mid.z+.03,tilt),C.white,PAX_PROP.paper);
  const sheet=new T.Matrix4().compose(new T.Vector3(mid.x,mid.y+.1,mid.z+.03),new T.Quaternion().setFromEuler(new T.Euler(tilt,0,0)),new T.Vector3(1,1,1));
  for(const side of [-1,1]){add(place(box(.4,.036,.002),0,.11,side*.0045).applyMatrix4(sheet),C.print,PAX_PROP.paper);
   for(const cx of [-.11,.11])add(place(box(.18,.17,.002),cx,-.03,side*.0045).applyMatrix4(sheet),C.print,PAX_PROP.paper);}
  add(place(box(.17,.23,.012),mid.x,mid.y+.06,mid.z+.02,-.95),C.A,PAX_PROP.notebook);
  add(place(box(.155,.215,.004).translate(0,0,-.008),mid.x,mid.y+.06,mid.z+.02,-.95),C.white,PAX_PROP.notebook);
 }
 const phoneHand=pose===P.phone?R:pose===P.strapPhone?L:null;
 if(phoneHand){// a bright case on the back (it reads from across the aisle), the lit screen toward the face
  add(place(box(.08,.155,.014),phoneHand.x,phoneHand.y+.055,phoneHand.z+.035,-.55),C.case,PAX_PROP.phone);
  add(place(box(.066,.13,.002).translate(0,0,-.008),phoneHand.x,phoneHand.y+.055,phoneHand.z+.035,-.55),C.screen,PAX_PROP.phone);}
 // seated with a bag: it stands on the floor against the shins
 if(pose<4){const f=b.feet[0].clone().add(b.feet[1]).multiplyScalar(.5);
  add(place(box(.28,.3,.13),f.x,.15,f.z+.13,-.08),C.A,PAX_PROP.bag);add(place(box(.25,.1,.02),f.x,.24,f.z+.2,-.08),C.B,PAX_PROP.bag);}
}
function propGeometry(bakes:readonly Bake[]){
 const parts:T.BufferGeometry[]=[];wornProps(parts);bakes.forEach((b,i)=>handProps(parts,b,i));
 const pos:number[]=[],nrm:number[]=[],pax:number[]=[];
 for(const g of parts){const p=g.getAttribute('position').array,n=g.getAttribute('normal').array,a=g.getAttribute('aPax').array;for(let i=0;i<p.length;i++){pos.push(p[i]);nrm.push(n[i]);pax.push(a[i]);}g.dispose();}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nrm,3));g.setAttribute('aPax',new T.Float32BufferAttribute(pax,3));
 g.boundingSphere=new T.Sphere(new T.Vector3(0,.5,.2),1.4);return g;
}
const PROP_VERT_HEAD=`attribute vec3 aPax;attribute vec4 iPose;attribute vec3 iColA;attribute vec3 iColB;varying vec3 vPax;
`;
const PROP_VERT_BODY=`
 {float sel=aPax.z,b=iPose.x;bool seated=mod(b,${PAX_POSES}.)<3.5;
  bool on=mod(floor(iPose.y/exp2(aPax.y)+.5),2.)>.5&&(sel<19.5?abs(sel-b)<.5:sel<20.5?true:sel<21.5?!seated:seated);
  if(!on)transformed=vec3(0.);else if(sel>19.5){transformed.xz*=iPose.z;transformed.y+=iPose.w;}
  float c=aPax.x;vPax=c<.5?iColA:c<1.5?iColB:c<2.5?vec3(.95,.93,.88):c<3.5?vec3(.12,.12,.14):c<4.5?vec3(.55,.53,.5):c<5.5?vec3(.55,.8,.98):c<6.5?vec3(.62,.4,.22):vec3(.3,.77,.78);}
`;
function propMaterial(){
 const m=new T.MeshLambertMaterial({color:0xffffff});
 m.onBeforeCompile=sh=>{sh.vertexShader=PROP_VERT_HEAD+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>'+PROP_VERT_BODY);
  sh.fragmentShader='varying vec3 vPax;\n'+sh.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );','vec4 diffuseColor = vec4( diffuse*vPax, opacity );');};
 m.customProgramCacheKey=()=>'train-pax-props-1';return m;
}

// ---------------------------------------------------------------- the meshes
/** Per-build fit of the worn props (scarf / camera / backpack): width scale and height shift against the regular bean. */
const WORN_FIT:Record<BeanBuild,[number,number]>=(()=>{const r=BEAN_SHAPES.regular,y=(s:typeof r,u:number)=>-.13+u*(s.H+.13);const o={} as Record<BeanBuild,[number,number]>;
 for(const k of Object.keys(BEAN_SHAPES) as BeanBuild[]){const s=BEAN_SHAPES[k];o[k]=[beanRadius(s,.6)/beanRadius(r,.6),y(s,.6)-y(r,.6)];}return o;})();
/** Every passenger part: room for `max` instances; looks = the cast (static rows baked now). */
export function createPassengerMesh(max:number,looks:readonly PaxLook[]){
 const baked=bakePassengers(looks),{statics,hats,bakes}=baked,geos=beanGeometries(),rows=Math.max(ROWS_MIN,1<<Math.ceil(Math.log2(Math.max(1,max))));
 const tex=(w:number)=>{const t=new T.DataTexture(new Float32Array(w*rows*4),w,rows,T.RGBAFormat,T.FloatType);t.minFilter=t.magFilter=T.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;t.name='train-pax-rows';return t;};
 const fixed=tex(STATIC_W),pose=tex(DYN_W),fixedA=fixed.image.data as unknown as Float32Array,poseA=pose.image.data as unknown as Float32Array;
 const group=new T.Group();group.name='train-passengers';
 const part=(kind:'body'|'limbs'|'hair'|'hat',geo:T.BufferGeometry)=>{const mat=new BeanMaterial(kind,fixed);mat.setBeanData(fixed,pose);
  const m=new T.InstancedMesh(geo,mat,max);m.name='train-pax-'+kind;m.frustumCulled=false;m.count=0;m.castShadow=m.receiveShadow=false;m.instanceMatrix.setUsage(T.DynamicDrawUsage);group.add(m);return m;};
 const body=part('body',geos.body),limbs=part('limbs',geos.limbs),hair=part('hair',geos.hair),hat=part('hat',geos.hat);
 hair.instanceMatrix=hat.instanceMatrix=body.instanceMatrix;// one torso-frame matrix buffer for body, hair and hat
 const pg=propGeometry(bakes),attr=(n:number)=>{const a=new T.InstancedBufferAttribute(new Float32Array(max*n),n);a.setUsage(T.DynamicDrawUsage);return a;};
 const iPose=attr(4),iColA=attr(3),iColB=attr(3);pg.setAttribute('iPose',iPose);pg.setAttribute('iColA',iColA);pg.setAttribute('iColB',iColB);
 const props=new T.InstancedMesh(pg,propMaterial(),max);props.name='train-pax-props';props.frustumCulled=false;props.count=0;props.castShadow=props.receiveShadow=false;props.instanceMatrix=body.instanceMatrix;group.add(props);
 // what each instance row holds now (rows are rewritten only when that changes: a texture upload only then)
 const rowCast=new Int32Array(max).fill(-1),rowBake=new Int32Array(max).fill(-1),rowGP=new Float32Array(max),rowGY=new Float32Array(max),rowHat=new Uint8Array(max);
 const tm=new T.Matrix4(),col=new T.Color();let fixedDirty=false,poseDirty=false;
 const fits=looks.map(l=>WORN_FIT[l.look.build]??WORN_FIT.regular),colA=looks.map(l=>new T.Color(l.propA)),colB=looks.map(l=>new T.Color(l.propB));
 return {
  group,bakes,statics,
  /** Instance n: cast member ci in bake bi (paxPoseFor) at `root` (the rig-root matrix in the world, kid scale included), neck
   *  gaze pitch / yaw (rad; + pitch = down, + yaw = toward the passenger's +x). */
  set(n:number,ci:number,bi:number,root:T.Matrix4,gazeP:number,gazeY:number){
   limbs.setMatrixAt(n,root);tm.multiplyMatrices(root,bakes[bi].torso);body.setMatrixAt(n,tm);
   if(rowCast[n]!==ci){rowCast[n]=ci;fixedA.set(statics.subarray(ci*STATIC_W*4,(ci+1)*STATIC_W*4),n*STATIC_W*4);rowHat[n]=hats[ci];fixedDirty=true;}
   const gp=Math.round(gazeP*50)/50,gy=Math.round(gazeY*50)/50;
   if(rowBake[n]!==bi||rowGP[n]!==gp||rowGY[n]!==gy){rowBake[n]=bi;rowGP[n]=gp;rowGY[n]=gy;const o=n*DYN_W*4;poseA.set(bakes[bi].dyn,o);poseA[o+3]=gp;poseA[o+7]=gy;poseDirty=true;}
   const L=looks[ci],f=fits[ci],a=iPose.array as Float32Array;a[n*4]=bi;a[n*4+1]=L.props;a[n*4+2]=f[0];a[n*4+3]=f[1];
   col.copy(colA[ci]).toArray(iColA.array as Float32Array,n*3);col.copy(colB[ci]).toArray(iColB.array as Float32Array,n*3);
  },
  /** After the frame's set() calls: nAll instances (the first nNear with limbs and props). */
  commit(nAll:number,nNear:number){
   body.count=hair.count=hat.count=nAll;limbs.count=props.count=nNear;let anyHat=false;for(let i=0;i<nAll&&!anyHat;i++)anyHat=rowHat[i]===1;
   body.visible=hair.visible=nAll>0;hat.visible=anyHat;limbs.visible=props.visible=nNear>0;group.visible=nAll>0;
   if(nAll>0){body.instanceMatrix.needsUpdate=true;limbs.instanceMatrix.needsUpdate=nNear>0;}
   if(nNear>0)iPose.needsUpdate=iColA.needsUpdate=iColB.needsUpdate=true;
   if(fixedDirty){fixed.needsUpdate=true;fixedDirty=false;}if(poseDirty){pose.needsUpdate=true;poseDirty=false;}
  },
  dispose(){group.removeFromParent();for(const m of [body,limbs,hair,hat,props])(m.material as T.Material).dispose();pg.dispose();fixed.dispose();pose.dispose();},
 };
}
export type PassengerMesh=ReturnType<typeof createPassengerMesh>;
