// The whale shark off Summit Isle's west coast (Oct 14 2026, user: "add some sharks, manta rays and even a whale shark around
// the mountain island"). Loop: lib/town/summitSeaLife.ts WHALE_SHARK_LOOP.
//
// Look: a big (13 m, ~2.3× a shark), slow, low-poly whale shark cruising with its back just awash: the broad flat head with its
// wide dark mouth across the front, small eyes, a dark blue-grey back with the pale spot-and-stripe pattern, the pectoral fins
// spread just under the surface, a swept first dorsal fin and the tall upper lobe of its tail standing clear of the water. Only
// the top half exists (the opaque sea hides anything lower); the flanks shade into the water colour so it reads as "just under
// the surface" from the summit, the beach or a parachute.
//
// Heat (AGENTS.md, docs/performance-guide.md):
//  - ONE mesh, ONE material, ~260 triangles, no texture: the spots, stripes, mouth and eyes are a fragment-shader pattern on the
//    object-space position; the tail sweep is a vertex-shader term on one time uniform. No shadows (cast or received).
//  - Moves only inside the island's frame update (world.updateSharks → updateCoralCay), only within 140 m of the player with its
//    loop on screen; beyond 260 m it is hidden entirely (no draw). Frozen frames (dt 0) and reduced motion / static ambience
//    (heat tiers 3–4) upload nothing. No per-frame allocations, no loop, timer or audio of its own.
import * as T from 'three';
import {RIDE_BACK,RIDE_BANK,RIDE_RISE,type RideFriend} from '../town/water/animalRides';
import {WHALE_SHARK_LOOP} from '../town/summitSeaLife';
import {silhouetteOf,sunShadowOffset} from '../town/fishing/fishSilhouette';
import {patchSeaVeil} from './seaVeil';

const WATER=-.43,NEAR=140,DRAW=260,UW_SURFACE=-.42;
/** Oct 19 2026 (user: "too flat ... floating on top of the water", then "glitchy ... doesn't feel beneath the water"): the body
 *  swims well UNDER the surface. Its back sits WHALE_DEPTH.mean ± bob metres below the water line (1.45 to 2.15 m, a slow 14 s
 *  swell); the fin tip stays just under the surface (the veil, light bands and ripples read over it). */
export const WHALE_DEPTH={mean:1.8,bob:.35,backTop:1.02,finTop:1.95,rate:.45} as const;
/** Body stations, nose (x 6.25) to the tail stock (x -4.95): half-width, the back's height and the belly's depth below the body axis (m). */
export const STATIONS:[x:number,w:number,ht:number,hb:number][]=[[6.25,1,.22,.3],[6,1.3,.38,.45],[5.4,1.5,.55,.6],[4.5,1.58,.78,.8],[3.4,1.62,.95,.92],[2.2,1.58,1.02,.98],[1,1.45,1,.95],[-.2,1.25,.9,.88],[-1.4,1,.75,.75],[-2.6,.76,.6,.6],[-3.6,.52,.46,.45],[-4.4,.36,.34,.34],[-4.95,.26,.27,.27]];
/** Ring round each station: 12 points from the spine (0) round the body; slate back to white belly, with a keel ridge either side of the spine. */
const RING=12,RIDGE=[1,1.08,.985,1,1,1,1,1,1,1,.985,1.08];
// Oct 20 2026 (user: "pale, glassy"): the shark's slate countershading (caySharks.ts SHARK_COLORS), the belly lighter but not glowing.
const RING_COLOR=['#2f4354','#33485a','#3b5163','#4a6273','#5b7383','#7a8d99','#8798a3','#7a8d99','#5b7383','#4a6273','#3b5163','#33485a'];

/** The whale shark, local +x forward, y up (0 = the body axis, the back at +1 m), z across. Non-indexed; colours baked as a belly-to-back
 *  gradient (basic material, no lights). Budget: ~350 triangles (the flat pancake it replaced was ~320). */
export function whaleSharkGeometry(){
 const pos:number[]=[],col:number[]=[],nor:number[]=[],c=new T.Color(),nA=new T.Vector3(),nB=new T.Vector3();
 const FIN='#33485a',FIN_LOW='#3b5163',MOUTH='#10171e',colors=RING_COLOR.map(h=>new T.Color(h));
 const v=(p:number[],cl:T.Color,n?:number[])=>{pos.push(p[0],p[1],p[2]);col.push(cl.r,cl.g,cl.b);nor.push(n?n[0]:0,n?n[1]:0,n?n[2]:1);};
 // Flat pieces (fins, tail): the face normal (used only for the soft edge fade).
 const tri=(a:number[],b:number[],d:number[],color:string)=>{c.set(color);nA.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);nB.set(d[0]-a[0],d[1]-a[1],d[2]-a[2]);nA.cross(nB).normalize();const n=[nA.x,nA.y,nA.z];v(a,c,n);v(b,c,n);v(d,c,n);};
 const two=(a:number[],b:number[],d:number[],color:string)=>{tri(a,b,d,color);tri(a,d,b,color);};
 // Rounded torpedo: a ring per station, superellipse (boxier on the head), ridged near the spine.
 const R=(i:number,k:number)=>{const [x,w,ht,hb]=STATIONS[i],a=k*Math.PI*2/RING,s=Math.sin(a),co=Math.cos(a),e=x>4.2?.62:.85;
  const f=x>4.6?1:RIDGE[k];return [x,Math.sign(co)*Math.abs(co)**e*(co>=0?ht:hb)*f,Math.sign(s)*Math.abs(s)**e*w*f];};
 // Smooth outward normal of the ring point (an ellipse's gradient), for the silhouette fade.
 const N=(i:number,k:number)=>{const [,w,ht,hb]=STATIONS[i],p=R(i,k),h=p[1]>=0?ht:hb;nA.set(0,p[1]/(h*h),p[2]/(w*w)).normalize();return [nA.x,nA.y,nA.z];};
 for(let i=0;i<STATIONS.length-1;i++)for(let k=0;k<RING;k++){const k2=(k+1)%RING,a=R(i,k),b=R(i,k2),d=R(i+1,k2),e=R(i+1,k);
  const na=N(i,k),nb=N(i,k2),nd=N(i+1,k2),ne=N(i+1,k);
  v(a,colors[k],na);v(d,colors[k2],nd);v(b,colors[k2],nb);v(a,colors[k],na);v(e,colors[k],ne);v(d,colors[k2],nd);}
 // The blunt snout: a fan round a forward-bulged centre; the wide dark mouth across the lower front.
 for(let k=0;k<RING;k++){const k2=(k+1)%RING,mouth=k>=3&&k<=9,cl=mouth?new T.Color(MOUTH):colors[k];v([6.6,-.02,0],cl,[1,0,0]);v(R(0,k2),cl,N(0,k2));v(R(0,k),cl,N(0,k));}
 {const n=STATIONS.length-1;for(let k=0;k<RING;k++){const k2=(k+1)%RING;v([-5.05,0,0],colors[k],[-1,0,0]);v(R(n,k),colors[k],N(n,k));v(R(n,k2),colors[k2],N(n,k2));}}
 // Pectoral fins: long, swept back, angled down from the lower flank.
 for(const s of [1,-1]){const r0=[3.5,-.35,1.5*s],r1=[1.3,-.45,1.38*s],lead=[2,-1.15,3.1*s],tip=[.3,-1.75,4.3*s];two(r0,lead,tip,FIN_LOW);two(r0,tip,r1,FIN);}
 // First dorsal: tall and swept; second dorsal small.
 two([.5,.92,0],[-.1,1.5,0],[-1.25,WHALE_DEPTH.finTop,0],FIN);two([.5,.92,0],[-1.25,WHALE_DEPTH.finTop,0],[-2.1,.62,0],FIN);
 two([-3,.5,0],[-3.75,1,0],[-3.95,.42,0],FIN);
 // Tail: a tall crescent upper lobe and a shorter lower lobe, vertical, on the tail stock.
 const tail:[number,number][]=[[-4.8,.1],[-5.5,.9],[-6.3,1.8],[-6.8,1.95],[-6.25,.9],[-6,.05],[-6.4,-.8],[-6.65,-1.2],[-5.7,-.5]];
 for(let i=1;i<tail.length-1;i++)two([tail[0][0],tail[0][1],0],[tail[i][0],tail[i][1],0],[tail[i+1][0],tail[i+1][1],0],FIN);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));
 // Bound with room for the tail sweep and the swell (culling never needs per-frame bounds work).
 g.boundingSphere=new T.Sphere(new T.Vector3(-.2,0,0),7.8);
 return g;
}

/** Swimming in the vertex shader: the rear half swings side to side (more towards the tail, the S-bend travels back along the
 *  body), the tail also lifts a little, and a slow pitch rocks the nose and tail; the head stays steady. */
export const TAIL_SWEEP=`
vWhaleLocal=transformed;
float wsBack=smoothstep(1.5,-6.6,transformed.x);
transformed.z+=wsBack*wsBack*.75*sin(uWhaleTime*1.15-transformed.x*.32);
transformed.y+=transformed.x*.03*sin(uWhaleTime*.45)+wsBack*wsBack*.22*sin(uWhaleTime*1.15-transformed.x*.32+1.2);`;
/** Spots (object space, so they ride with the animal): a jittered grid of soft pale-grey spots laid out by length and by the angle
 *  round the body (so they stay round on the flanks instead of smearing into vertical streaks; smaller and denser on the head), on
 *  the body only (not the fins), two small eyes; then the water look. Oct 20 2026 (user: spots "smeared into white stripes"): the
 *  stripe bands are gone (the old stripe variable is kept at 0 so shader probes still find it). */
export const PATTERN_FRAGMENT=`
{
 vec3 p=vWhaleLocal;
 float head=step(3.4,p.x),cell=mix(.62,.36,head);
 vec2 q=vec2(p.x,atan(p.y,p.z)*1.25)/cell,id=floor(q),f=fract(q)-.5;
 vec2 jit=vec2(wsHash(id),wsHash(id+7.3))-.5;
 float spot=smoothstep(.2,.12,length(f-jit*.35))*step(.18,wsHash(id+3.1))*step(.06,abs(p.z))*step(-4.6,p.x);
 float stripe=0.;
 float pale=max(spot,stripe)*smoothstep(-.4,.05,p.y);
 vec3 shade=diffuseColor.rgb;
 shade=mix(shade,vec3(.42,.48,.52),pale*.45);// soft pale-grey spots (linear), a hint, not a decal
 float eye=smoothstep(.16,.09,length(vec2(p.x-5.25,abs(p.z)-1.28)))*step(-.15,p.y);
 shade=mix(shade,vec3(.05,.06,.08),eye*.7);
 diffuseColor.rgb=shade;
}`;
function addShaders(material:T.Material,uniform:{value:number}){
 material.onBeforeCompile=shader=>{shader.uniforms.uWhaleTime=uniform;
  // The sweep + pattern are the whale's own; the depth trick, veil, light bands, rim fade and wobble are the shared seaVeil.ts.
  patchSeaVeil(shader,uniform,{fade:false/* Oct 20 2026: no rim alpha (it made the body and fins glassy) */,vertexHead:'uniform float uWhaleTime;varying vec3 vWhaleLocal;',vertexAnim:TAIL_SWEEP,
   fragmentHead:'varying vec3 vWhaleLocal;\nfloat wsHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',colorBody:PATTERN_FRAGMENT});};
 material.customProgramCacheKey=()=>'whale-shark-3d';
}

/** The one geometry, material (tail-sweep time uniform) and seabed-silhouette texture, shareable by several whale sharks
 *  (Oct 20 2026: the open-sea whale sharks, openSeaLife.ts, draw from ONE set; whoever shares it owns `time`). */
export function createWhaleSharkShared(){
 const time={value:0};
 // Oct 19 2026 (user: "too flat ... floating on top of the water"): a real rounded body swimming UNDER the surface (WHALE_DEPTH),
 // opaque and depth-writing (SEA_DEPTH makes the sea's depth test let it show through), tinted by depth in the fragment.
 const geometry=whaleSharkGeometry(),material=new T.MeshBasicMaterial({side:T.DoubleSide,vertexColors:true,transparent:false,depthWrite:true});addShaders(material,time);// Oct 19 2026: solid from every angle, slate back with the pale spots and stripes (pattern on), flanks pale not teal
 const sil=silhouetteOf(geometry,'top');
 return {time,geometry,material,sil,dispose(){geometry.dispose();material.dispose();sil.geometry.dispose();sil.texture.dispose();}};
}
export type WhaleSharkShared=ReturnType<typeof createWhaleSharkShared>;
export function createWhaleShark(scene:T.Scene,options:{loop?:{points:readonly {x:number;z:number}[];speed:number};id?:string;name?:string;start?:number;shared?:WhaleSharkShared}={}){
 const loop=options.loop??WHALE_SHARK_LOOP,pts=loop.points,n=pts.length;
 const lengths=new Float64Array(n+1);for(let i=1;i<=n;i++){const a=pts[i-1],b=pts[i%n];lengths[i]=lengths[i-1]+Math.hypot(b.x-a.x,b.z-a.z);}
 const own=!options.shared,res=options.shared??createWhaleSharkShared(),total=lengths[n],time=res.time,geometry=res.geometry,material=res.material;
 const mesh=new T.Mesh(geometry,material);mesh.name=options.name??'summit-whale-shark';mesh.renderOrder=1;/* opaque, after the sea like the sharks */mesh.castShadow=mesh.receiveShadow=false;mesh.frustumCulled=true;mesh.matrixAutoUpdate=false;
 const root=new T.Group();root.name=mesh.name+'-root';root.add(mesh);scene.add(root);
 // A soft translucent shadow on the seabed (ONE mesh): only while the clear water window is open over a bed (setClearBed from
 // Town.tsx); hidden otherwise, so tiers 3-4 and the open sea pay nothing. Oct 20 2026: the whale shark's own outline seen from above
 // (fishSilhouette.ts, its geometry rasterized once into a soft alpha texture; was a round disc), turned and placed with the body.
 const sil=res.sil,shadowTex=sil.texture;
 const shadowMat=new T.MeshBasicMaterial({map:shadowTex,color:'#04141c',transparent:true,opacity:.34,depthWrite:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4/* Oct 20 2026: no z-fight with the bed */});
 const shadow=new T.Mesh(sil.geometry,shadowMat);shadow.name=mesh.name+'-seabed-shadow';shadow.visible=false;shadow.castShadow=shadow.receiveShadow=false;shadow.matrixAutoUpdate=false;shadow.renderOrder=2;root.add(shadow);
 const sunOff={x:0,z:0};
 let clearBed:{strength:()=>number;depth:(x:number,z:number)=>number}|null=null;
 /** Trail ripples / bubbles and the fin's small V wake reuse the island's pooled ring FX (ballEffects.ripple), set from Town.tsx. */
 let fx:{ripple:(x:number,y:number,z:number,power:number,size?:number)=>void}|null=null;
 const wakeAt=new T.Vector3(),finAt=new T.Vector3();
 // A fixed box over the loop for the distance test; the on-screen test uses a sphere round the animal itself (one reused object).
 const xs=pts.map(p=>p.x),zs=pts.map(p=>p.z),box={minX:Math.min(...xs)-8,maxX:Math.max(...xs)+8,minZ:Math.min(...zs)-8,maxZ:Math.max(...zs)+8};
 const sphere=new T.Sphere(new T.Vector3(),9);
 // Starts in the stretch the summit lookout's camera frames (on desktop and phones).
 const state={u:(options.start??.45)*total,enabled:true,k:1,clock:0,placed:false,placedReduced:false,ridden:false,free:false,fx:0,fz:0,fyaw:0,dx:0,dz:0,dyaw:0,bank:0,rise:0,/* the dart after a ride (animalRides.ts DART_*) */boost:1,bend:0,bendYaw:0,bubbleT:1.2,finT:0,finUp:false};
 const stats={awake:false,updated:0,visible:false};
 const up=new T.Vector3(0,1,0),ax=new T.Vector3(1,0,0),qBank=new T.Quaternion(),pivot=new T.Vector3();
 function place(dt:number){
  if(!state.ridden&&!state.free){const before=state.u;state.u=(state.u+dt*loop.speed*state.boost)%total;if(state.u<before)state.k=1;}else if(state.u<lengths[state.k-1])state.k=1;// ridden (water P1b): the ride moved u
  while(state.k<n&&lengths[state.k]<state.u)state.k++;
  const a=pts[state.k-1],b=pts[state.k%n],f=(state.u-lengths[state.k-1])/((lengths[state.k]-lengths[state.k-1])||1);
  const dx=b.x-a.x,dz=b.z-a.z;
  // Ridden (Oct 20 2026, user: "when riding the whale, they are not together"): it rises (rise 0 → 1 at RIDE_RISE) until its back
  // is RIDE_BACK.whale under the water line, right under the rider's seat (animalRides.ts RIDE_GRIP), and sinks back after.
  if(dt>0)state.rise+=((state.ridden?1:0)-state.rise)*(1-Math.exp(-dt*RIDE_RISE));
  const swimDepth=WHALE_DEPTH.mean+WHALE_DEPTH.bob*Math.sin(state.clock*WHALE_DEPTH.rate),rise=state.rise;
  mesh.position.set(a.x+dx*f,WATER-WHALE_DEPTH.backTop-(swimDepth+(RIDE_BACK.whale-swimDepth)*rise),a.z+dz*f);
  if(state.free){mesh.position.x=state.dx;mesh.position.z=state.dz;}// steered (animalRides.ts): the drawn (tick-interpolated) pose
  else if(state.bend!==0){const l=Math.hypot(dx,dz)||1;mesh.position.x+=dz/l*state.bend;mesh.position.z-=dx/l*state.bend;}// the dart's sideways bend
  mesh.quaternion.setFromAxisAngle(up,(state.free?state.dyaw-Math.PI/2:Math.atan2(-dz,dx)+state.bendYaw)+.05*(1-rise)*Math.sin(state.clock*.37));// no yaw wobble under a rider
  // The bank into a steered turn: a roll about the long axis through the BACK (the rider's seat stays put).
  const bank=state.bank*RIDE_BANK.whale;
  if(bank!==0){qBank.setFromAxisAngle(ax,bank);mesh.quaternion.multiply(qBank);pivot.set(0,-WHALE_DEPTH.backTop,0).applyQuaternion(qBank);pivot.y+=WHALE_DEPTH.backTop;pivot.applyAxisAngle(up,state.free?state.dyaw-Math.PI/2:0);mesh.position.add(pivot);}
  mesh.updateMatrix();
  // The seabed shadow: only over a clear-window bed.
  const bk=clearBed?clearBed.strength():0,bd=bk>.05&&clearBed?clearBed.depth(mesh.position.x,mesh.position.z):-1;
  if(bd>.5){shadow.visible=true;shadowMat.opacity=.34*Math.min(1,bk)*Math.min(1,bd/1.5);sunShadowOffset(mesh.position.y-(UW_SURFACE-bd),sunOff);shadow.position.set(mesh.position.x+sunOff.x,UW_SURFACE-bd+.04,mesh.position.z+sunOff.z);shadow.quaternion.copy(mesh.quaternion);shadow.updateMatrix();}else shadow.visible=false;
 }
 /** Called from the island's frame update with the frustum the sharks just built. */
 function update(dt:number,reduced:boolean,frustum:T.Frustum,player:{x:number;z:number}){
  const d=Math.hypot(Math.max(box.minX-player.x,0,player.x-box.maxX),Math.max(box.minZ-player.z,0,player.z-box.maxZ));
  root.visible=stats.visible=(state.enabled||state.ridden||state.free)&&d<DRAW;stats.awake=false;stats.updated=0;if(!root.visible)return;
  if(!state.placed||state.placedReduced!==reduced){place(0);state.placed=true;state.placedReduced=reduced;}
  sphere.center.copy(mesh.position);if(!state.ridden&&!state.free&&(d>NEAR||!frustum.intersectsSphere(sphere)))return;
  // Frozen (dt 0) or static ambience / reduced motion: already placed, so nothing uploads.
  stats.awake=true;if(dt===0||reduced&&!state.ridden&&!state.free&&state.rise<.005)return;// a ride is the player's own travel: it moves with reduced motion too
  const step=Math.min(dt,.1);state.clock=(state.clock+step)%(2*Math.PI/1.15*400);if(own)time.value=state.clock;place(step);stats.updated=1;
  // Near the player only (pooled rings, <= ~2 a second): small trail ripples over the back, and a V wake while the fin cuts the surface.
  if(fx&&!reduced&&!state.ridden/* ridden: the ride's own wake (Town.tsx RIDE_WAKE_AT) */&&Math.hypot(mesh.position.x-player.x,mesh.position.z-player.z)<70){
   if((state.bubbleT-=step)<=0){state.bubbleT=1.1;wakeAt.set(2.6,0,(Math.sin(state.clock*2.3))*.6).applyMatrix4(mesh.matrix);fx.ripple(wakeAt.x,WATER,wakeAt.z,.07,.5);}
   state.finUp=mesh.position.y+WHALE_DEPTH.finTop>WATER-.04;
   if(state.finUp&&(state.finT-=step)<=0){state.finT=.45;finAt.set(-1.25,WHALE_DEPTH.finTop,0).applyMatrix4(mesh.matrix);fx.ripple(finAt.x,WATER,finAt.z,.12,.8);}
  }
 }
 /** Water P1b (lib/town/water/animalRides.ts): the whale shark as a ridable "island friend" (the same one mesh). */
 const friend:RideFriend={kind:'whale',id:options.id??(loop===WHALE_SHARK_LOOP?WHALE_SHARK_LOOP.id:'whale-shark'),points:pts,lengths,total,
  get u(){return state.u;},set u(v:number){state.u=v;},get available(){return root.visible;},
  get free(){return state.free;},set free(v:boolean){state.free=v;},get fx(){return state.fx;},set fx(v:number){state.fx=v;},get fz(){return state.fz;},set fz(v:number){state.fz=v;},get fyaw(){return state.fyaw;},set fyaw(v:number){state.fyaw=v;},get dx(){return state.dx;},set dx(v:number){state.dx=v;},get dz(){return state.dz;},set dz(v:number){state.dz=v;},get dyaw(){return state.dyaw;},set dyaw(v:number){state.dyaw=v;},get bank(){return state.bank;},set bank(v:number){state.bank=v;},get ridden(){return state.ridden;},set ridden(v:boolean){state.ridden=v;},speed:loop.speed,
  get boost(){return state.boost;},set boost(v:number){state.boost=v;},get bend(){return state.bend;},set bend(v:number){state.bend=v;},get bendYaw(){return state.bendYaw;},set bendYaw(v:number){state.bendYaw=v;}};
 return {root,mesh,shadow,stats,update,time,box,friend,state,
  /** Open-sea cap (openSeaLife.ts): a whale over the drawn cap is hidden (never one being ridden or swimming back). */
  setEnabled(v:boolean){state.enabled=v;},
  /** Town.tsx: the clear window's strength and the bed's depth under a point (m, -1 off the bed), for the seabed shadow. */
  setClearBed(b:typeof clearBed){clearBed=b;if(!b)shadow.visible=false;},
  /** Town.tsx: the island's pooled ring FX (ballEffects), for the trail ripples and the fin's V wake. */
  setFx(f:typeof fx){fx=f;},
  dispose(){root.removeFromParent();shadowMat.dispose();if(own)res.dispose();}};
}
