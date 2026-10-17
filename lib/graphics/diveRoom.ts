import * as T from 'three';
import {speciesModel} from '../town/fishing/fishModels';
import {DIVE_ROOM_R,DIVE_SURFACE_Y,diveFindPoint,diveFloor,diveRipple,type DiveFind,type DiveSpot} from '../town/water/diveSpots';

/**
 * The dive's sealed underwater room (water phase P2, Oct 16 2026; docs/swimming-research.md §2.4, "P2 implemented: one spot").
 * User: "make sure the under water scene is robust with coral and fish swimming around."
 *
 * A small separate scene the island's renderer draws INSTEAD of the island while diving (the island is not rendered or stepped,
 * like a paused menu). Built when the dive starts, disposed when it ends: nothing stays allocated between dives.
 *
 * What is in it (room-local metres; the sand ≈ 0, the surface at DIVE_SURFACE_Y):
 *  - ONE static vertex-coloured mesh: rippled sand, a ring of soft rocks closing the view, ~80 coral pieces of five kinds
 *    (branching, brain, table, tube, finger) in the island palette, the sunken goal with Paul's two flag boxes, the clam's lower
 *    shell, the treasure chest, the bubbling vent;
 *  - ONE swaying mesh: sea fans, anemones, kelp and seagrass tufts, bent in the vertex shader (a height-weighted sway on one time
 *    uniform, like the Summit trees: no per-mesh CPU work);
 *  - fish as INSTANCED draws, one per species (the fishing catalogue's articulated shapes, lib/town/fishing/fishModels.ts): six
 *    schools (68 fish) on precomputed loops and lazy figure-eights at different depths, a cownose ray gliding, a grouper, a big
 *    parrotfish and the octopus under the goal. Every path is a closed curve evaluated in the vertex shader from per-instance
 *    attributes + ONE time uniform (no boids, no CPU per fish), with the species' own tail wag;
 *  - a burst of 14 small damselfish that dart out of the coral when it is touched (the same shader, hidden until then);
 *  - god-ray streaks (ONE static additive fan mesh, no light), the bright surface overhead (ONE mesh), bubbles from the diver
 *    and the vent (ONE Points draw, moved in the vertex shader);
 *  - the clam's lid and pearl and the matchday coin (3 tiny meshes; the lid and coin move only while they animate);
 *  - THREE.Fog for depth, ONE hemisphere light, no shadows, no reflections, no render targets.
 * Per frame on the CPU: one time uniform, the player uniform for the bubbles, the follow camera and (briefly) the lid / coin.
 */
export const DIVE_FOG_COLOR_KEY='water';
export type DiveRoomOptions={phone:boolean;reduced:boolean;found:readonly string[]};
type C=[number,number,number];
const col=(h:string|T.Color):C=>{const c=new T.Color(h);return [c.r,c.g,c.b];};
const mix=(a:C,b:C,k:number):C=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
const scl=(a:C,k:number):C=>[a[0]*k,a[1]*k,a[2]*k];
/** A small seeded random (mulberry32), so the reef is the same every dive. */
function rng(seed:number){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}

/** Collects pieces into one non-indexed geometry (position, normal, colour; plus sway weight and seed for the swaying mesh). The
 *  pieces' own normals are kept (smooth rocks and brain coral, faceted branches), transformed by each piece's matrix. */
class Merge{
 pos:number[]=[];nor:number[]=[];col:number[]=[];sway:number[]=[];seed:number[]=[];
 private v=new T.Vector3();private n=new T.Vector3();private nm=new T.Matrix3();
 add(g:T.BufferGeometry,m:T.Matrix4,paint:(p:T.Vector3,n:T.Vector3,local:T.Vector3)=>C,sway?:(local:T.Vector3)=>number,seed=0){
  const src=g.index?g.toNonIndexed():g;if(!src.getAttribute('normal'))src.computeVertexNormals();
  const P=src.getAttribute('position'),N=src.getAttribute('normal'),local=new T.Vector3();this.nm.getNormalMatrix(m);
  for(let i=0;i<P.count;i++){local.fromBufferAttribute(P,i);this.v.copy(local).applyMatrix4(m);this.n.fromBufferAttribute(N,i).applyMatrix3(this.nm).normalize();
   this.pos.push(this.v.x,this.v.y,this.v.z);this.nor.push(this.n.x,this.n.y,this.n.z);const c=paint(this.v,this.n,local);this.col.push(c[0],c[1],c[2]);
   if(sway){this.sway.push(sway(local));this.seed.push(seed);}}
  if(src!==g)src.dispose();g.dispose();
 }
 geometry(swaying=false){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.nor,3));
  g.setAttribute('color',new T.Float32BufferAttribute(this.col,3));if(swaying){g.setAttribute('aSway',new T.Float32BufferAttribute(this.sway,1));g.setAttribute('aSeed',new T.Float32BufferAttribute(this.seed,1));}
  g.computeBoundingSphere();return g;}
}
const M=(x=0,y=0,z=0,rx=0,ry=0,rz=0,s:number|[number,number,number]=1)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),typeof s==='number'?new T.Vector3(s,s,s):new T.Vector3(...s));
/** Lumpy, soft-edged rock: an icosphere pushed out by a few sines (smooth normals). */
function rockGeo(seed:number,detail=1){const g=new T.IcosahedronGeometry(1,detail),p=g.getAttribute('position'),v=new T.Vector3();
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const k=1+.22*Math.sin(v.x*3.1+seed)*Math.cos(v.z*2.7+seed*1.3)+.12*Math.sin(v.y*5.3+seed*2.1);v.multiplyScalar(k);p.setXYZ(i,v.x,v.y,v.z);}
 g.computeVertexNormals();return g;}
/** A branching (staghorn) coral: a few levels of tapering branches, as one geometry. */
function branchGeo(r:()=>number,levels=3){const parts:T.BufferGeometry[]=[];
 const grow=(m:T.Matrix4,len:number,rad:number,level:number)=>{const c=new T.CylinderGeometry(rad*.65,rad,len,5,1);c.translate(0,len/2,0);c.applyMatrix4(m);parts.push(c);
  if(level<=0){const tip=new T.SphereGeometry(rad*.75,5,3);tip.translate(0,len,0);tip.applyMatrix4(m);parts.push(tip);return;}
  const n=2+(r()<.5?1:0);for(let i=0;i<n;i++){const a=i/n*Math.PI*2+r()*1.2,tilt=.45+r()*.4;
   grow(m.clone().multiply(new T.Matrix4().makeTranslation(0,len*(.75+r()*.2),0)).multiply(new T.Matrix4().makeRotationY(a)).multiply(new T.Matrix4().makeRotationZ(tilt)),len*(.62+r()*.2),rad*.7,level-1);}};
 grow(new T.Matrix4(),.45+r()*.25,.09,levels);return mergeGeos(parts);}
function mergeGeos(parts:T.BufferGeometry[]){
 let n=0;const flat=parts.map(p=>{const q=p.index?p.toNonIndexed():p;if(q!==p)p.dispose();q.computeVertexNormals();n+=q.getAttribute('position').count;return q;});
 const pos=new Float32Array(n*3),nor=new Float32Array(n*3);let o=0;
 for(const q of flat){pos.set(q.getAttribute('position').array as Float32Array,o*3);nor.set(q.getAttribute('normal').array as Float32Array,o*3);o+=q.getAttribute('position').count;q.dispose();}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));return g;}

/** Fish: per-instance path attributes (see the vertex shader below). */
type Swimmer={cx:number;cy:number;cz:number;r:number;omega:number;phase:number;eight:boolean;stretch:number;yaw:number;bob:number;wag:number;seed:number;scale:number;dir?:[number,number,number]};
const FISH_GLSL=/* glsl */`
attribute vec4 aPA;attribute vec4 aPB;attribute vec4 aPC;attribute vec4 aPD;
uniform float uDiveTime;uniform vec4 uBurst;uniform vec3 uWagAxis,uWagDir,uWagK,uWag;
// A closed path: a loop (aPB.z 0) or a lazy figure-eight (1), radius aPA.w, stretched aPB.w across, turned by aPD.x, bobbing aPD.y.
vec3 dvPath(float t){float th=aPB.x*t+aPB.y,r=aPA.w;vec3 p;
 if(aPB.z<.5||aPB.z>1.5)p=vec3(cos(th)*r,0.,sin(th)*r*aPB.w);else p=vec3(sin(th)*r,0.,sin(th)*cos(th)*r*aPB.w*2.);
 p.y=sin(th*2.+aPD.w)*aPD.y+sin(t*1.3+aPD.w*3.)*.08;float c=cos(aPD.x),s=sin(aPD.x);p.xz=vec2(c*p.x-s*p.z,s*p.x+c*p.z);return aPA.xyz+p;}
`;
const FISH_BASIS=/* glsl */`
 float dvT=uDiveTime;vec3 dvP=dvPath(dvT),dvF=dvPath(dvT+.12)-dvP;
 if(aPB.z>1.5){// the burst: dart out of the coral along aPC.xyz, then settle into the home loop round it
  float bt=max(0.,dvT-uBurst.w);vec3 bd=normalize(aPC.xyz);vec3 bp=uBurst.xyz+bd*3.4*(1.-exp(-1.5*bt))+vec3(0.,bt*.18,0.);
  float home=smoothstep(1.4,3.4,bt);dvP=mix(bp,dvP,home);dvF=mix(bd,normalize(dvF+vec3(1e-4)),home);}
 dvF=normalize(dvF+vec3(1e-5,0.,0.));vec3 dvS=normalize(cross(dvF,vec3(0.,1.,0.))+vec3(0.,0.,1e-5)),dvU=cross(dvS,dvF);
`;

export function createDiveRoom(spot:DiveSpot,opt:DiveRoomOptions){
 const th=spot.theme,r=rng(9173),phone=opt.phone;
 const scene=new T.Scene();scene.name='dive-room';scene.background=new T.Color(th.water);scene.fog=new T.Fog(th.water,th.fog[0],th.fog[1]);
 const hemi=new T.HemisphereLight(th.light[0],th.light[1],th.light[2]);scene.add(hemi);
 const camera=new T.PerspectiveCamera(58,1,.1,th.fog[1]+6);camera.name='dive-camera';
 const uTime={value:0};
 const fp={x:0,y:0,z:0};const findPt=(id:string)=>{const f=spot.finds.find(q=>q.id===id);return f?diveFindPoint(f,{x:0,y:0,z:0}):null;};
 const clearOf=(x:number,z:number,gap:number)=>spot.finds.every(f=>Math.hypot(f.x-x,f.z-z)>gap)&&Math.hypot(x,z-3)>2.2;

 // ---- The static reef: ONE draw.
 const S=new Merge();
 const sandA=col(th.sand[0]),sandB=col(th.sand[1]);
 {const N=phone?44:60,R=DIVE_ROOM_R+9,g=new T.PlaneGeometry(R*2,R*2,N,N);g.rotateX(-Math.PI/2);const p=g.getAttribute('position');
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,diveFloor(x,z));}g.computeVertexNormals();
  S.add(g,new T.Matrix4(),(v,n)=>{const rip=diveRipple(v.x,v.z),patch=.5+.5*Math.sin(v.x*.33+1.1)*Math.sin(v.z*.29-.6);
   return scl(mix(sandA,sandB,.25+.55*rip*rip),(.86+.14*patch)*(.75+.25*n.y));});}
 const rockA=col(th.rock[0]),rockB=col(th.rock[1]);
 const paintRock=(v:T.Vector3,n:T.Vector3)=>scl(mix(rockA,rockB,.5+.5*n.y),.85+.15*Math.sin(v.x*2.3+v.z*1.7));
 // The rock ring closing the view (the fog finishes it), then scattered boulders.
 const ringN=phone?14:20;
 for(let i=0;i<ringN;i++){const a=i/ringN*Math.PI*2+r()*.2,d=DIVE_ROOM_R+2.5+r()*4,x=Math.cos(a)*d,z=Math.sin(a)*d,s=2.2+r()*2.4;
  S.add(rockGeo(i*1.7,1),M(x,diveFloor(x,z)+s*.25,z,r()*.5,r()*6,r()*.5,[s*1.2,s*(.9+r()*.8),s]),paintRock);}
 for(let i=0;i<(phone?10:14);i++){let x=0,z=0;for(let k=0;k<20;k++){const a=r()*Math.PI*2,d=4+r()*(DIVE_ROOM_R-3);x=Math.cos(a)*d;z=Math.sin(a)*d;if(clearOf(x,z,2.2))break;}
  const s=.3+r()*.45;S.add(rockGeo(50+i,1),M(x,diveFloor(x,z)+s*.2,z,0,r()*6,0,[s*1.3,s*.8,s]),paintRock);}
 // Coral: many pieces of five kinds in the palette, clustered into reef heads with sand lanes between them.
 const corals=th.coral.map(h=>col(h));
 const heads:{x:number;z:number}[]=[{x:6,z:-5},{x:-7,z:-3},{x:-3,z:-11},{x:3,z:-10.5},{x:9,z:3},{x:-10,z:5},{x:-1,z:9},{x:11,z:-8},{x:-12,z:-8},{x:5,z:11}];
 const coralCount=phone?100:120;let placedCoral=0;
 for(let i=0;i<coralCount*3&&placedCoral<coralCount;i++){
  const h=heads[i%heads.length],a=r()*Math.PI*2,d=Math.pow(r(),.8)*3,x=h.x+Math.cos(a)*d,z=h.z+Math.sin(a)*d;
  if(Math.hypot(x,z)>DIVE_ROOM_R+1||!clearOf(x,z,1.5))continue;placedCoral++;
  const y=diveFloor(x,z)-.05,base=corals[Math.floor(r()*corals.length)],tip=mix(base,[1,1,1],.35),kind=Math.floor(r()*5),s=.6+r()*.7,yaw=r()*6.28;
  if(kind===0){// branching
   S.add(branchGeo(r,phone?2:3),M(x,y,z,0,yaw,0,s*1.4),(v,n,l)=>scl(mix(base,tip,Math.min(1,l.y/1.4)),.8+.2*n.y));}
  else if(kind===1){// brain: a squashed sphere with winding grooves
   const g=new T.IcosahedronGeometry(.55,phone?1:2),p=g.getAttribute('position'),v=new T.Vector3();
   for(let k=0;k<p.count;k++){v.fromBufferAttribute(p,k);const groove=Math.sin(v.x*16+Math.sin(v.z*13)*2.2+v.y*9);v.multiplyScalar(1+.04*groove);v.y=Math.max(-.1,v.y*.62);p.setXYZ(k,v.x,v.y,v.z);}g.computeVertexNormals();
   S.add(g,M(x,y+.05,z,0,yaw,0,s),(v,n,l)=>scl(base,.72+.28*(.5+.5*Math.sin(l.x*16+Math.sin(l.z*13)*2.2+l.y*9))));}
  else if(kind===2){// table: a wide flat plate on a short stalk
   const st=new T.CylinderGeometry(.07,.12,.5,6);st.translate(0,.25,0);const top=new T.CylinderGeometry(.75,.6,.1,phone?10:14);top.translate(0,.55,0);
   S.add(mergeGeos([st,top]),M(x,y,z,(r()-.5)*.2,yaw,(r()-.5)*.2,s*1.2),(v,n,l)=>scl(l.y>.48?mix(base,tip,n.y>.5?.3:0):base,.75+.25*Math.abs(n.y)));}
  else if(kind===3){// tubes: a cluster of upright tubes with pale rims
   const parts:T.BufferGeometry[]=[];const n=5+Math.floor(r()*5);for(let k=0;k<n;k++){const hh=.3+r()*.7,c=new T.CylinderGeometry(.07+r()*.04,.09,hh,6,1,true);c.translate((r()-.5)*.45,hh/2,(r()-.5)*.45);c.rotateZ((r()-.5)*.3);parts.push(c);}
   S.add(mergeGeos(parts),M(x,y,z,0,yaw,0,s),(v,n,l)=>scl(mix(base,tip,Math.min(1,Math.max(0,l.y-.25)*1.5)),.8+.2*Math.abs(n.x)));}
  else{// finger coral: a lumpy mound of short rounded fingers
   const parts:T.BufferGeometry[]=[new T.SphereGeometry(.35,7,4,0,Math.PI*2,0,Math.PI/2)];const n=6+Math.floor(r()*6);
   for(let k=0;k<n;k++){const aa=r()*6.28,dd=r()*.28,c=new T.CapsuleGeometry(.06,.2+r()*.25,2,5);c.translate(Math.cos(aa)*dd,.3+r()*.15,Math.sin(aa)*dd);parts.push(c);}
   S.add(mergeGeos(parts),M(x,y,z,0,yaw,0,s),(v,n)=>scl(base,.78+.22*n.y));}
 }
 // The sunken goal (a youth goal, half sunk and tilted) with Paul's two flag boxes in front of it. Barnacles on the frame.
 {const relic=findPt('relic')??{x:0,y:1,z:-9};const gx=relic.x,gz=relic.z-.6,gy=diveFloor(gx,gz),W=3.6,H=1.6,tilt=.12;
  const white=col('#e8e6dc'),rust=col('#b8794a'),barn=col('#cfc6d8');
  const post=(px:number)=>{const c=new T.CylinderGeometry(.07,.07,H,7);c.translate(px,H/2,0);return c;};
  const bar=new T.CylinderGeometry(.07,.07,W,7);bar.rotateZ(Math.PI/2);bar.translate(0,H,0);
  S.add(mergeGeos([post(-W/2),post(W/2),bar]),M(gx,gy-.15,gz,tilt,.25,.06),(v,n,l)=>mix(white,rust,.25+.25*Math.sin(l.x*7+l.y*5)));
  for(let k=0;k<22;k++){const u=r(),px=u<.33?-W/2:u<.66?W/2:(r()-.5)*W,py=u<.66?r()*H:H,b=new T.IcosahedronGeometry(.06+r()*.05,0);
   S.add(b,M(gx,gy-.15,gz,tilt,.25,.06).multiply(M(px+(r()-.5)*.08,py,.07*(r()<.5?-1:1))),()=>scl(barn,.8+.2*r()));}
  // Two little flag boxes (the boxes Paul chose from), one tipped over by the island's octopus.
  const boxPaint=(c:C)=>(v:T.Vector3,n:T.Vector3)=>scl(c,.75+.25*n.y);
  [[-.7,0,col('#3a6fd8'),col('#f4f1e6')],[.7,.6,col('#e0322b'),col('#f2c14e')]].forEach(([dx,tip,a,b])=>{const bx=gx+(dx as number),bz=gz+1.6,by=diveFloor(bx,bz);
   const box=new T.BoxGeometry(.55,.45,.55);box.translate(0,.22,0);S.add(box,M(bx,by,bz,0,.3,tip as number),boxPaint(a as C));
   const flag=new T.BoxGeometry(.32,.2,.02);flag.translate(.18,.62,0);const pole=new T.CylinderGeometry(.015,.015,.5,4);pole.translate(0,.45,0);
   S.add(mergeGeos([flag,pole]),M(bx,by,bz,0,.3,tip as number),(v,n,l)=>l.x>.03?(b as C):col('#3a3f44'));});}
 // The clam's lower shell (the lid and the pearl are their own meshes below).
 const clamAt=findPt('clam')??{x:-7,y:.5,z:-2};const clamBase=col('#7c6bb8'),clamRim=col('#e8d8f4');
 {const g=new T.SphereGeometry(.7,phone?10:14,6,0,Math.PI*2,Math.PI/2,Math.PI/2),p=g.getAttribute('position'),v=new T.Vector3();
  for(let k=0;k<p.count;k++){v.fromBufferAttribute(p,k);const a=Math.atan2(v.z,v.x);v.x*=1+.08*Math.cos(a*7);v.z*=.75;v.y*=.6;p.setXYZ(k,v.x,v.y,v.z);}g.computeVertexNormals();
  S.add(g,M(clamAt.x,diveFloor(clamAt.x,clamAt.z)+.28,clamAt.z,0,.4,0),(v,n,l)=>mix(clamBase,clamRim,Math.max(0,1+l.y*3)*.6));}
 // The treasure: a small half-buried chest, its lid propped open.
 const chestAt=findPt('treasure')??{x:4,y:.5,z:6};
 {const wood=col('#7a5232'),band=col('#d9a441'),cy=diveFloor(chestAt.x,chestAt.z);
  const body=new T.BoxGeometry(.9,.45,.6);body.translate(0,.2,0);const lid=new T.BoxGeometry(.9,.08,.6);lid.translate(0,.04,-.3);lid.rotateX(-1.1);lid.translate(0,.42,-.3+.3);
  S.add(mergeGeos([body,lid]),M(chestAt.x,cy-.08,chestAt.z,0,-.5,.08),(v,n,l)=>Math.abs(l.x)>.38||Math.abs(l.x)<.05?band:scl(wood,.8+.2*n.y));}
 // The vent: a little rock chimney the bubbles stream from.
 const vent={x:-4.5,z:5.5};vent.x=-4.5;{const vy=diveFloor(vent.x,vent.z);S.add(rockGeo(77,1),M(vent.x,vy+.2,vent.z,0,0,0,[.6,.55,.6]),paintRock);
  const c=new T.CylinderGeometry(.18,.32,.45,7,1,true);c.translate(0,.62,0);S.add(c,M(vent.x,vy,vent.z),(v,n)=>scl(rockA,.6+.3*n.y));}
 const reefMat=new T.MeshLambertMaterial({vertexColors:true});reefMat.name='dive-reef';
 const reef=new T.Mesh(S.geometry(),reefMat);reef.name='dive-reef';reef.matrixAutoUpdate=false;scene.add(reef);

 // ---- The swaying life: sea fans, anemones, kelp, seagrass. ONE draw, bent in the vertex shader.
 const W=new Merge();
 const fans=th.fan.map(h=>col(h)),anem=th.anemone.map(h=>col(h)),kelp=th.kelp.map(h=>col(h));
 const spotNear=(gap:number,minR=3,maxR=DIVE_ROOM_R)=>{for(let k=0;k<30;k++){const a=r()*Math.PI*2,d=minR+r()*(maxR-minR),x=Math.cos(a)*d,z=Math.sin(a)*d;if(clearOf(x,z,gap))return {x,z};}return {x:maxR,z:0};};
 // Sea fans: a flat lattice of fine branches spreading up from one stem (both faces), the veins darker.
 for(let i=0;i<(phone?16:22);i++){const h=heads[i%heads.length],a=r()*6.28,d=1.2+r()*2.2,x=h.x+Math.cos(a)*d,z=h.z+Math.sin(a)*d;if(!clearOf(x,z,1.4))continue;
  const c=fans[i%fans.length],sz=.8+r()*.8,pos:number[]=[],segs=9;
  for(let k=0;k<segs;k++){const a0=-1.1+k/segs*2.2,a1=-1.1+(k+1)/segs*2.2;pos.push(0,0,0,Math.sin(a0)*sz,.25+Math.cos(a0)*sz*1.2,0,Math.sin(a1)*sz,.25+Math.cos(a1)*sz*1.2,0);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.computeVertexNormals();
  W.add(g,M(x,diveFloor(x,z)-.05,z,0,r()*6.28,0),(v,n,l)=>scl(c,.7+.3*(.5+.5*Math.sin(Math.atan2(l.x,l.y)*22))*(.6+.4*Math.min(1,l.y))),l=>Math.min(1,l.y/(sz*1.3)),r()*6.28);}
 // Anemones: a soft base and a crown of tentacles that wave.
 for(let i=0;i<(phone?14:18);i++){const h=heads[(i*3+1)%heads.length],a=r()*6.28,d=.8+r()*2.6,x=h.x+Math.cos(a)*d,z=h.z+Math.sin(a)*d;if(!clearOf(x,z,1.4))continue;
  const c=anem[i%anem.length],tipC=mix(c,[1,1,1],.45),y=diveFloor(x,z)-.03,parts:T.BufferGeometry[]=[];const base=new T.CylinderGeometry(.22,.28,.25,8);base.translate(0,.12,0);parts.push(base);
  const n=phone?14:22;for(let k=0;k<n;k++){const aa=k/n*6.28+r()*.2,rr=.08+r()*.14,len=.35+r()*.3,t=new T.ConeGeometry(.035,len,3);t.translate(0,len/2,0);t.rotateZ(.35+rr*1.5);t.rotateY(aa);t.translate(Math.cos(aa)*rr,.24,-Math.sin(aa)*rr);parts.push(t);}
  W.add(mergeGeos(parts),M(x,y,z,0,0,0,.9+r()*.5),(v,n,l)=>l.y<.25?scl(c,.7):mix(c,tipC,Math.min(1,(l.y-.25)*2.5)),l=>Math.max(0,Math.min(1,(l.y-.2)*2)),r()*6.28);}
 // Kelp: tall ribbons in clumps toward the back and the sides, swaying the most at the top.
 const clumps=[{x:-11,z:-11},{x:12,z:-3},{x:-13,z:2},{x:8,z:-13},{x:-6,z:12},{x:13,z:9}];
 for(const cl of clumps)for(let k=0;k<(phone?3:4);k++){const x=cl.x+(r()-.5)*2.4,z=cl.z+(r()-.5)*2.4,H=3.5+r()*3.5,segs=phone?6:9,wd=.22+r()*.1,c=kelp[Math.floor(r()*kelp.length)];
  const pos:number[]=[];for(let s=0;s<segs;s++){const y0=s/segs*H,y1=(s+1)/segs*H,w0=wd*(1-s/segs*.4),w1=wd*(1-(s+1)/segs*.4),o0=Math.sin(s*.9)*.12,o1=Math.sin((s+1)*.9)*.12;
   pos.push(-w0+o0,y0,0,w0+o0,y0,0,w1+o1,y1,0,-w0+o0,y0,0,w1+o1,y1,0,-w1+o1,y1,0);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.computeVertexNormals();
  W.add(g,M(x,diveFloor(x,z)-.1,z,0,r()*6.28,0),(v,n,l)=>scl(c,.65+.35*Math.min(1,l.y/H)),l=>Math.min(1,l.y/H)*1.6,r()*6.28);}
 // Seagrass tufts on the open sand.
 for(let i=0;i<(phone?26:40);i++){const p=spotNear(1.2,2.5,DIVE_ROOM_R+2),c=mix(kelp[i%kelp.length],sandB,.15),pos:number[]=[],n=6;
  for(let k=0;k<n;k++){const a=k/n*6.28+r(),h=.3+r()*.45,bx=Math.cos(a)*.08,bz=Math.sin(a)*.08,lean=.15;pos.push(bx-.03,0,bz,bx+.03,0,bz,bx+Math.cos(a)*lean,h,bz+Math.sin(a)*lean);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.computeVertexNormals();
  W.add(g,M(p.x,diveFloor(p.x,p.z)-.02,p.z),(v,n,l)=>scl(c,.7+.6*l.y),l=>Math.min(1,l.y*2),r()*6.28);}
 const swayAmp={value:opt.reduced?.25:1};
 const swayMat=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});swayMat.name='dive-sway';
 swayMat.onBeforeCompile=sh=>{sh.uniforms.uDiveTime=uTime;sh.uniforms.uSwayAmp=swayAmp;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uDiveTime,uSwayAmp;attribute float aSway,aSeed;')
   .replace('#include <begin_vertex>',/* glsl */`#include <begin_vertex>
    float sw=aSway*aSway*uSwayAmp;transformed.x+=sin(uDiveTime*1.1+aSeed+position.y*.6)*.22*sw;transformed.z+=cos(uDiveTime*.83+aSeed*1.7+position.y*.4)*.14*sw;`);};
 swayMat.customProgramCacheKey=()=>'dive-sway-v1';
 const sway=new T.Mesh(W.geometry(true),swayMat);sway.name='dive-sway';sway.frustumCulled=false;sway.matrixAutoUpdate=false;scene.add(sway);

 // ---- Fish: one instanced draw per species, every path in the vertex shader.
 const fishMeshes:T.Mesh[]=[];
 const school=(id:string|undefined,shape:string|undefined,color:string|undefined,list:Swimmer[],name:string)=>{
  const model=speciesModel(id,shape as never,color),src=model.geometry,g=new T.InstancedBufferGeometry();
  for(const a of ['position','normal','color'])g.setAttribute(a,new T.BufferAttribute((src.getAttribute(a).array as Float32Array).slice(),src.getAttribute(a).itemSize));
  const n=list.length,A=new Float32Array(n*4),B=new Float32Array(n*4),Cc=new Float32Array(n*4),D=new Float32Array(n*4);
  list.forEach((f,i)=>{A.set([f.cx,f.cy,f.cz,f.r],i*4);B.set([f.omega,f.phase,f.dir?2:f.eight?1:0,f.stretch],i*4);Cc.set([...(f.dir??[0,0,0]),f.scale],i*4);D.set([f.yaw,f.bob,f.wag,f.seed],i*4);});
  g.setAttribute('aPA',new T.InstancedBufferAttribute(A,4));g.setAttribute('aPB',new T.InstancedBufferAttribute(B,4));g.setAttribute('aPC',new T.InstancedBufferAttribute(Cc,4));g.setAttribute('aPD',new T.InstancedBufferAttribute(D,4));
  g.instanceCount=n;g.boundingSphere=new T.Sphere(new T.Vector3(0,4,0),40);
  const an=model.anim,mat=new T.MeshLambertMaterial({vertexColors:true});mat.name='dive-fish-'+name;
  const wag={uWagAxis:{value:new T.Vector3(...an.axis)},uWagDir:{value:new T.Vector3(...an.dir)},uWagK:{value:new T.Vector3(...an.k)},uWag:{value:new T.Vector3(an.start,Math.max(.01,an.span),an.amp)}};
  mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,wag,{uDiveTime:uTime,uBurst});
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+FISH_GLSL)
    .replace('#include <beginnormal_vertex>',FISH_BASIS+'vec3 objectNormal=normalize(-dvF*normal.x+dvU*normal.y-dvS*normal.z);')
    .replace('#include <begin_vertex>',/* glsl */`vec3 transformed=vec3(position);
     float dvW=clamp((dot(transformed,uWagAxis)-uWag.x)/uWag.y,0.,1.);transformed+=uWagDir*uWag.z*dvW*dvW*sin(dvT*aPD.z+aPD.w*7.-dot(transformed,uWagK));
     transformed*=aPC.w;transformed=dvP-dvF*transformed.x+dvU*transformed.y-dvS*transformed.z;`);};
  mat.customProgramCacheKey=()=>'dive-fish-v1';
  const mesh=new T.Mesh(g,mat);mesh.name='dive-fish-'+name;mesh.frustumCulled=false;mesh.matrixAutoUpdate=false;scene.add(mesh);fishMeshes.push(mesh);return mesh;};
 const uBurst={value:new T.Vector4(0,0,0,-1e4)};
 /** A school: `n` fish sharing one path, each in its own lane (radius, height and phase offsets), so they move as one shoal. */
 const shoal=(n:number,c:{x:number;y:number;z:number},R:number,omega:number,eight:boolean,size:[number,number],spread:number,extra:Partial<Swimmer>={})=>
  Array.from({length:n},(_,i)=>({cx:c.x,cy:c.y+(r()-.5)*spread*1.2,cz:c.z,r:R+(r()-.5)*spread*2,omega,phase:(extra.phase??0)-i*.035*Math.sign(omega||1)+(r()-.5)*spread/Math.max(R,1),eight,stretch:extra.stretch??1,yaw:extra.yaw??0,bob:extra.bob??.3,wag:extra.wag??9,seed:r()*6.28,scale:size[0]+r()*(size[1]-size[0])} as Swimmer));
 school('anchovy',undefined,undefined,shoal(phone?18:22,{x:1,y:5,z:-2},5.6,.24,true,[.32,.42],.9,{stretch:.8,yaw:.4,wag:13}),'anchovy');
 school(undefined,'round','#2c5ee8',shoal(12,{x:6,y:2.6,z:-5},3.4,.33,false,[.36,.46],.6,{bob:.25}),'blue-tang');
 school(undefined,'round','#ffd21f',shoal(10,{x:-6.5,y:2.3,z:-2.5},3,-.37,false,[.32,.42],.55,{bob:.2,phase:2}),'yellow-tang');
 school('red-snapper',undefined,undefined,shoal(8,{x:0,y:3.4,z:-5},7,.15,true,[.55,.7],.7,{stretch:.7,yaw:-.3,bob:.5,phase:1}),'snapper');
 school(undefined,'round','#ff7a3a',shoal(12,{x:-2,y:1.7,z:-.5},2.6,.45,true,[.24,.3],.5,{bob:.2,phase:3,wag:15}),'anthias');
 school('bigeye',undefined,undefined,shoal(6,{x:-1,y:1.9,z:-9.4},2.2,.42,false,[.34,.42],.4),'bigeye');
 school('golden-trevally',undefined,undefined,shoal(6,{x:0,y:5.8,z:0},10.5,-.12,false,[.6,.75],.8,{stretch:.85,bob:.6,phase:4}),'trevally');
 // The residents: a cownose ray gliding a lazy eight up high, a grouper patrolling low, a big parrotfish, the octopus at the goal.
 school('cownose-ray',undefined,undefined,[{cx:0,cy:7.1,cz:-4,r:10,omega:.07,phase:.5,eight:true,stretch:.7,yaw:.9,bob:.5,wag:2.2,seed:1,scale:2.2}],'ray');
 school('grouper',undefined,undefined,[{cx:3,cy:1.5,cz:-6.5,r:3.8,omega:-.11,phase:0,eight:false,stretch:.6,yaw:.3,bob:.15,wag:4,seed:2,scale:1.25}],'grouper');
 school(undefined,'round','#22c4a2',[{cx:-7,cy:1.8,cz:-4,r:2.2,omega:.16,phase:1,eight:true,stretch:.9,yaw:0,bob:.2,wag:6,seed:3,scale:.95}],'parrotfish');
 const relicAt=findPt('relic')??{x:0,y:1,z:-9};
 school('octopus',undefined,undefined,[{cx:relicAt.x+.5,cy:diveFloor(relicAt.x,relicAt.z)+.55,cz:relicAt.z-.3,r:.35,omega:.25,phase:0,eight:true,stretch:1,yaw:0,bob:.1,wag:3,seed:4,scale:.85}],'octopus');
 // The burst: damselfish hidden in the coral until it is touched.
 const coralAt=findPt('coral')??{x:7,y:1,z:-4};
 const burst=school(undefined,'round','#1f8bff',Array.from({length:14},(_,i)=>{const a=i/14*Math.PI*2+r()*.3,up=.2+r()*.6;
  return {cx:coralAt.x,cy:coralAt.y+.4+(r()-.5)*.6,cz:coralAt.z,r:1.3+r()*.6,omega:.55+r()*.2,phase:a,eight:false,stretch:1,yaw:0,bob:.2,wag:16,seed:r()*6.28,scale:.22+r()*.08,dir:[Math.cos(a),up,Math.sin(a)] as [number,number,number]};}),'burst');
 burst.visible=false;

 // ---- God rays: long soft streaks slanting down from the surface. ONE static additive draw, no light.
 {const pos:number[]=[],cl:number[]=[],n=phone?9:13;
  for(let i=0;i<n;i++){const x=-12+i/(n-1)*24+(r()-.5)*2,z=-14+r()*22,w=.6+r()*1.4,len=8+r()*3,sl=.35,a=.07+r()*.06;
   const top=[[x-w,DIVE_SURFACE_Y,z],[x+w,DIVE_SURFACE_Y,z]],bot=[[x-w*1.6+sl*len,DIVE_SURFACE_Y-len,z+.4*len*.3],[x+w*1.6+sl*len,DIVE_SURFACE_Y-len,z+.4*len*.3]];
   pos.push(...top[0],...top[1],...bot[1],...top[0],...bot[1],...bot[0]);for(const k of [a,a,0,a,0,0])cl.push(.75,.95,1,k);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(cl,4));
  const m=new T.MeshBasicMaterial({vertexColors:true,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,fog:false});m.name='dive-rays';
  const rays=new T.Mesh(g,m);rays.name='dive-rays';rays.renderOrder=2;rays.matrixAutoUpdate=false;scene.add(rays);}
 // ---- The surface overhead: bright, with a soft sun patch and caustic-like mottling painted in the vertex colours.
 {const N=phone?24:36,R=DIVE_ROOM_R+12,g=new T.PlaneGeometry(R*2,R*2,N,N);g.rotateX(Math.PI/2);g.translate(0,DIVE_SURFACE_Y,0);const p=g.getAttribute('position'),cl:number[]=[];
  const deep=col(th.water),light=col('#bfeef5');
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),sun=Math.exp(-(x*x+(z+2)*(z+2))/60),mott=.5+.5*Math.sin(x*.9+Math.sin(z*.7)*2)*Math.sin(z*.8+Math.sin(x*.6)*2);
   const c=mix(mix(deep,light,.55+.25*mott),[1,1,.95],sun*.6);cl.push(...c);}
  g.setAttribute('color',new T.Float32BufferAttribute(cl,3));const m=new T.MeshBasicMaterial({vertexColors:true});m.name='dive-surface';
  const surf=new T.Mesh(g,m);surf.name='dive-surface';surf.matrixAutoUpdate=false;scene.add(surf);}
 // ---- Bubbles: the vent's stream and the diver's breath. ONE Points draw; each bubble rises and loops in the vertex shader.
 const uPlayer={value:new T.Vector3(0,DIVE_SURFACE_Y-1,0)},uBubbleScale={value:300};
 {const NV=phone?28:40,NP=phone?12:16,n=NV+NP,A=new Float32Array(n*4),K=new Float32Array(n),pos=new Float32Array(n*3);
  for(let i=0;i<n;i++){const player=i>=NV;A.set([(r()-.5)*(player?.25:.4),(r()-.5)*(player?.25:.4),player?.9+r()*.6:.7+r()*.6,r()*10],i*4);K[i]=player?1:0;}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('aB',new T.BufferAttribute(A,4));g.setAttribute('aKind',new T.BufferAttribute(K,1));
  const ventY=diveFloor(vent.x,vent.z)+.85;
  const m=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uDiveTime:uTime,uPlayer,uScale:uBubbleScale,uFogFar:{value:th.fog[1]}},
   vertexShader:/* glsl */`attribute vec4 aB;attribute float aKind;uniform float uDiveTime,uScale,uFogFar;uniform vec3 uPlayer;varying float vA;
    void main(){vec3 p;float life;
     if(aKind<.5){float h=${(DIVE_SURFACE_Y).toFixed(2)}-${ventY.toFixed(2)};float y=mod(uDiveTime*aB.z+aB.w,h);life=y/h;p=vec3(${vent.x.toFixed(2)}+aB.x+sin(y*2.+aB.w)*.12,${ventY.toFixed(2)}+y,${vent.z.toFixed(2)}+aB.y);}
     else{float c=2.6,a=mod(uDiveTime+aB.w,c);life=a/c;p=uPlayer+vec3(aB.x+sin(a*5.+aB.w)*.08,.4+a*aB.z,aB.y);}
     vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=uScale*(aKind<.5?.07:.05)*(.7+.6*fract(aB.w))/max(.5,-mv.z);
     vA=(1.-smoothstep(.75,1.,life))*smoothstep(0.,.06,life)*(1.-smoothstep(uFogFar*.5,uFogFar,-mv.z));}`,
   fragmentShader:/* glsl */`varying float vA;void main(){vec2 d=gl_PointCoord-.5;float r=length(d);if(r>.5)discard;float ring=smoothstep(.32,.45,r)*(1.-smoothstep(.45,.5,r));
    float hi=smoothstep(.16,0.,length(d-vec2(-.15,-.15)));gl_FragColor=vec4(.88,.97,1.,(ring*.85+hi*.9+.12)*vA);}`});
  m.name='dive-bubbles';const pts=new T.Points(g,m);pts.name='dive-bubbles';pts.frustumCulled=false;pts.renderOrder=3;scene.add(pts);}
 // ---- The clam's lid and pearl, and the treasure coin (tiny meshes; they move only while they animate).
 const lidGeo=new T.SphereGeometry(.7,phone?10:14,6,0,Math.PI*2,0,Math.PI/2);{const p=lidGeo.getAttribute('position'),v=new T.Vector3();
  for(let k=0;k<p.count;k++){v.fromBufferAttribute(p,k);const a=Math.atan2(v.z,v.x);v.x*=1+.08*Math.cos(a*7);v.z*=.75;v.y*=.5;p.setXYZ(k,v.x,v.y,v.z+.52);}lidGeo.computeVertexNormals();}
 const lidMat=new T.MeshLambertMaterial({color:'#8e7dcc',side:T.DoubleSide});lidMat.name='dive-clam-lid';
 // The hinge sits on the shell's back edge (z −0.52 in the shell's frame, turned with it); the lid lifts its front edge.
 const lid=new T.Mesh(lidGeo,lidMat);lid.name='dive-clam-lid';const lidHinge=new T.Group();lidHinge.rotation.order='YXZ';lidHinge.rotation.y=.4;
 lidHinge.position.set(clamAt.x-Math.sin(.4)*.52,diveFloor(clamAt.x,clamAt.z)+.3,clamAt.z-Math.cos(.4)*.52);lidHinge.add(lid);scene.add(lidHinge);
 const pearlMat=new T.MeshLambertMaterial({color:'#fbf6ff',emissive:'#6e6a80'});pearlMat.name='dive-pearl';
 const pearl=new T.Mesh(new T.SphereGeometry(.13,12,8),pearlMat);pearl.name='dive-pearl';pearl.position.set(clamAt.x,diveFloor(clamAt.x,clamAt.z)+.36,clamAt.z);pearl.visible=false;scene.add(pearl);
 const coinMat=new T.MeshLambertMaterial({color:'#ffc93c',emissive:'#7a5208'});coinMat.name='dive-coin';
 const coin=new T.Mesh(new T.CylinderGeometry(.2,.2,.05,18),coinMat);coin.name='dive-coin';coin.rotation.order='YXZ';coin.rotation.x=Math.PI/2;
 const coinHome=new T.Vector3(chestAt.x,diveFloor(chestAt.x,chestAt.z)+.55,chestAt.z);coin.position.copy(coinHome);coin.visible=!opt.found.includes('treasure');scene.add(coin);
 let lidT=-1,lidOpen=0,coinT=-1;

 // ---- The follow camera: behind and a little above the diver, eased; kept under the surface and over the sand.
 const camPos=new T.Vector3(0,DIVE_SURFACE_Y-1,8),camLook=new T.Vector3(),tmp=new T.Vector3();let camInit=false;
 function follow(dt:number,d:{x:number;y:number;z:number;yaw:number}){
  const fx=Math.sin(d.yaw),fz=Math.cos(d.yaw);tmp.set(d.x-fx*7.2,d.y+3.1,d.z-fz*7.2);
  {const cr=Math.hypot(tmp.x,tmp.z),lim=DIVE_ROOM_R+1.5;if(cr>lim){tmp.x*=lim/cr;tmp.z*=lim/cr;}}// never back into the rock ring
  tmp.y=Math.min(DIVE_SURFACE_Y-.35,Math.max(diveFloor(tmp.x,tmp.z)+.6,tmp.y));
  const k=camInit?1-Math.exp(-dt*3.2):1;camPos.lerp(tmp,k);camLook.lerp(tmp.set(d.x+fx*3,d.y-.6,d.z+fz*3),camInit?1-Math.exp(-dt*5):1);camInit=true;
  camera.position.copy(camPos);camera.lookAt(camLook);
 }
 const triangles=()=>{let t=0;scene.traverse(o=>{const m=o as T.Mesh;if(!m.isMesh||!o.name.startsWith('dive-'))return;const g=m.geometry as T.BufferGeometry&{instanceCount?:number};const n=(g.index?g.index.count:g.getAttribute('position').count)/3;t+=n*(g.instanceCount&&Number.isFinite(g.instanceCount)?g.instanceCount:1);});return Math.round(t);};
 let disposed=false;
 return {scene,camera,uTime,
  /** Draws (meshes and points in the room, not counting the diver's rig) and triangles, for the budget test and the docs. */
  stats(){let draws=0;scene.traverse(o=>{if(((o as T.Mesh).isMesh||(o as T.Points).isPoints)&&o.name.startsWith('dive-'))draws++;});return {draws,triangles:triangles(),fish:fishMeshes.reduce((n,m)=>n+((m.geometry as T.InstancedBufferGeometry).instanceCount||0),0)-(burst.geometry as T.InstancedBufferGeometry).instanceCount};},
  /** One frame: the time uniform (fish, sway, bubbles), the bubbles' origin, the camera, and the lid / coin while they animate. */
  frame(t:number,dt:number,diver:{x:number;y:number;z:number;yaw:number}){
   uTime.value=t;uPlayer.value.set(diver.x,diver.y+.9,diver.z);follow(dt,diver);
   if(lidT>=0){lidT+=dt;lidOpen=Math.min(1,lidT/1.1);lidHinge.rotation.x=-.9*(lidOpen*lidOpen*(3-2*lidOpen));if(lidT>6){lidT=-2;}}
   else if(lidT<-1){lidT+=dt;lidOpen=Math.max(0,1-(lidT+2)/1.2);lidHinge.rotation.x=-.9*lidOpen;if(lidOpen<=0){lidT=-1;pearl.visible=false;}}
   if(coin.visible){coin.rotation.y=t*1.6;if(coinT>=0){coinT+=dt;coin.position.y=coinHome.y+coinT*1.4;coin.scale.setScalar(Math.max(.01,1-coinT/1.2));if(coinT>1.2){coin.visible=false;coinT=-1;}}}
  },
  /** The size of a bubble (pixels at 1 m), from the drawing buffer's height. */
  setViewport(width:number,height:number,aspect:number){uBubbleScale.value=height;if(camera.aspect!==aspect){camera.aspect=aspect;camera.updateProjectionMatrix();}void width;},
  /** The find's interaction: the coral's burst, the clam opening (visual only), the coin rising into your coins. */
  use(find:DiveFind,t:number){
   if(find.kind==='burst'){uBurst.value.set(coralAt.x,coralAt.y+.3,coralAt.z,t);burst.visible=true;}
   else if(find.kind==='clam'){lidT=0;pearl.visible=true;}
   else if(find.kind==='treasure'&&coin.visible&&coinT<0)coinT=0;
  },
  /** Where a find's prompt floats (room-local), written into `out`. */
  anchor(find:DiveFind,out:T.Vector3){diveFindPoint(find,fp);return out.set(fp.x,fp.y+.9,fp.z);},
  get disposed(){return disposed;},
  /** Free everything the room made (the diver's rig must be taken out first: it belongs to the island). */
  dispose(){if(disposed)return;disposed=true;
   scene.traverse(o=>{const m=o as T.Mesh;if(m.isMesh||(o as T.Points).isPoints){m.geometry.dispose();const mats=Array.isArray(m.material)?m.material:[m.material];mats.forEach(x=>x.dispose());}});
   scene.clear();scene.background=null;scene.fog=null;},
 };
}
export type DiveRoom=ReturnType<typeof createDiveRoom>;
