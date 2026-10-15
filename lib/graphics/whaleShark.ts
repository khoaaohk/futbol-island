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
import {WHALE_SHARK_LOOP} from '../town/summitSeaLife';

const WATER=-.43,NEAR=140,DRAW=260;
/** Body stations, nose (x 6.2) to the tail stock (x -4.9): half-width and the back's height above the waterline (m). */
const STATIONS:[x:number,w:number,h:number][]=[[6.25,.95,.05],[6.05,1.22,.2],[5.5,1.42,.36],[4.6,1.55,.48],[3.4,1.6,.58],[2.2,1.55,.62],[1,1.42,.6],[-.2,1.22,.55],[-1.4,.98,.46],[-2.5,.74,.36],[-3.5,.52,.27],[-4.3,.36,.2],[-4.95,.26,.16]];
/** Across the back: fraction of the half-width per column, with a raised ridge either side of the spine (whale sharks' keels). */
const ACROSS=[-1,-.82,-.55,-.28,0,.28,.55,.82,1];
const lift=(f:number)=>{const a=Math.abs(f);return Math.max(0,1-a*a)**.6+.08*Math.exp(-(((a-.42)/.1)**2));};

/** The whale shark, local +x forward, y up (y 0 = its waterline), z across. Non-indexed; colour attribute: back, fins, mouth. */
export function whaleSharkGeometry(){
 const pos:number[]=[],col:number[]=[],c=new T.Color();
 const BACK='#3f5a6e',FIN='#36505f',MOUTH='#141c24';
 const tri=(a:number[],b:number[],d:number[],color:string)=>{pos.push(...a,...b,...d);c.set(color);for(let k=0;k<3;k++)col.push(c.r,c.g,c.b);};
 const two=(a:number[],b:number[],d:number[],color:string)=>{tri(a,b,d,color);tri(a,d,b,color);};
 // The back: a dome lofted through the stations, flat across the broad head.
 const P=(i:number,j:number)=>{const [x,w,h]=STATIONS[i],f=ACROSS[j],flat=x>3.6?.55:0;return [x,h*(flat+(1-flat)*lift(f))*(Math.abs(f)>.99?0:1),w*f];};
 for(let i=0;i<STATIONS.length-1;i++)for(let j=0;j<ACROSS.length-1;j++){
  const a=P(i,j),b=P(i,j+1),d=P(i+1,j+1),e=P(i+1,j);tri(a,d,b,BACK);tri(a,e,d,BACK);}
 // The blunt front: a low vertical face across the head, with the wide mouth line along it.
 for(let j=0;j<ACROSS.length-1;j++){const a=P(0,j),b=P(0,j+1);two([a[0],0,a[2]],[b[0],0,b[2]],[b[0],b[1],b[2]],MOUTH);two([a[0],0,a[2]],[b[0],b[1],b[2]],[a[0],a[1],a[2]],MOUTH);}
 // Tail stock end cap.
 {const k=STATIONS.length-1;for(let j=0;j<ACROSS.length-1;j++){const a=P(k,j),b=P(k,j+1);two([a[0],0,0],a,b,BACK);}}
 // Pectoral fins: long, swept back, spread flat just under the surface.
 for(const s of [1,-1]){const root0=[3.3,.02,1.45*s],root1=[1.4,.02,1.35*s],tip=[.6,-.02,4.4*s];two(root0,tip,root1,FIN);}
 // First dorsal fin: tall, swept back, two-sided with a little thickness.
 {const b0=[.2,.5,0],b1=[-1.9,.4,0],top=[-1.5,2.1,0];for(const s of [1,-1]){const o=(p:number[])=>[p[0],p[1],p[2]+.07*s];two(o(b0),o(top),o(b1),FIN);}two([b0[0],b0[1],.07],[top[0],top[1],0],[b0[0],b0[1],-.07],FIN);}
 // Second dorsal, small.
 two([-3,.28,0],[-3.95,.6,0],[-3.8,.22,0],FIN);
 // Tail: a tall, crescent upper lobe and a shorter lower lobe (mostly under water), vertical.
 const tail:[number,number][]=[[-4.7,.1],[-5.4,1.1],[-6.4,2.6],[-6.7,2.75],[-6.15,1.2],[-5.95,.15],[-6.35,-1],[-6.55,-1.25],[-5.7,-.55]];
 for(let i=1;i<tail.length-1;i++){const a=[tail[0][0],tail[0][1],0],b=[tail[i][0],tail[i][1],0],d=[tail[i+1][0],tail[i+1][1],0];two(a,b,d,FIN);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.computeVertexNormals();
 // Bound with room for the tail sweep (culling never needs per-frame bounds work).
 g.boundingSphere=new T.Sphere(new T.Vector3(-.2,.6,0),7.6);
 return g;
}

/** Tail sweep in the vertex shader: the rear half swings side to side, more towards the tail; the head stays steady. */
export const TAIL_SWEEP=`
vWhaleLocal=transformed;
float wsBack=smoothstep(1.5,-6.6,transformed.x);
transformed.z+=wsBack*wsBack*.75*sin(uWhaleTime*1.15-transformed.x*.32);`;
/** Spots and stripes (object space, so they ride with the animal): pale stripes across the back behind the head, a jittered
 *  grid of pale spots between them (smaller and denser on the head), two small eyes, and the flanks shading into the sea. */
export const PATTERN_FRAGMENT=`
{
 vec3 p=vWhaleLocal;
 float head=step(3.4,p.x),cell=mix(.62,.36,head);
 vec2 q=vec2(p.x,p.z)/cell,id=floor(q),f=fract(q)-.5;
 vec2 jit=vec2(wsHash(id),wsHash(id+7.3))-.5;
 float spot=smoothstep(.2,.13,length(f-jit*.35))*step(.18,wsHash(id+3.1));
 float band=abs(fract(p.x/1.05+.25)-.5);
 float stripe=smoothstep(.07,.035,band)*(1.-head)*step(-4.4,p.x)*step(abs(p.z),1.7);
 float pale=max(spot,stripe)*step(.04,p.y);
 vec3 shade=diffuseColor.rgb;
 shade=mix(shade,vec3(.86,.9,.9),pale*.85);
 float eye=smoothstep(.16,.09,length(vec2(p.x-5.25,abs(p.z)-1.28)));
 shade=mix(shade,vec3(.05,.06,.08),eye);
 // Flanks shade into the sea: low on the back reads as just under the surface.
 float awash=1.-smoothstep(.0,.12,p.y);
 shade=mix(shade,vec3(.17,.43,.55),awash*.45);
 diffuseColor.rgb=shade;
}`;
function addShaders(material:T.Material,uniform:{value:number},pattern=true){
 material.onBeforeCompile=shader=>{shader.uniforms.uWhaleTime=uniform;
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float uWhaleTime;\nvarying vec3 vWhaleLocal;').replace('#include <begin_vertex>','#include <begin_vertex>'+TAIL_SWEEP);
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWhaleLocal;\nfloat wsHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}').replace('#include <color_fragment>','#include <color_fragment>'+(pattern?PATTERN_FRAGMENT:''));};
 material.customProgramCacheKey=()=>pattern?'whale-shark':'whale-shark-shadow';
}

export function createWhaleShark(scene:T.Scene,options:{loop?:{points:readonly {x:number;z:number}[];speed:number}}={}){
 const loop=options.loop??WHALE_SHARK_LOOP,pts=loop.points,n=pts.length;
 const lengths=new Float64Array(n+1);for(let i=1;i<=n;i++){const a=pts[i-1],b=pts[i%n];lengths[i]=lengths[i-1]+Math.hypot(b.x-a.x,b.z-a.z);}
 const total=lengths[n],time={value:0};
 // Oct 14 2026 (user: "they don't come up like that, more of just a shadow"): drawn like the mantas' underwater shadows, a flat dark
 // silhouette just under the surface (no spots, no fins standing out of the water); the tail still sweeps in the vertex shader.
 const geometry=whaleSharkGeometry(),material=new T.MeshBasicMaterial({color:'#12384b',transparent:true,opacity:.36,depthWrite:false});addShaders(material,time,false);
 const mesh=new T.Mesh(geometry,material);mesh.name='summit-whale-shark';mesh.renderOrder=1;mesh.scale.set(1,.04,1);mesh.castShadow=mesh.receiveShadow=false;mesh.frustumCulled=true;mesh.matrixAutoUpdate=false;
 const root=new T.Group();root.name='summit-whale-shark-root';root.add(mesh);scene.add(root);
 // A fixed box over the loop for the distance test; the on-screen test uses a sphere round the animal itself (one reused object).
 const xs=pts.map(p=>p.x),zs=pts.map(p=>p.z),box={minX:Math.min(...xs)-8,maxX:Math.max(...xs)+8,minZ:Math.min(...zs)-8,maxZ:Math.max(...zs)+8};
 const sphere=new T.Sphere(new T.Vector3(),9);
 // Starts in the stretch the summit lookout's camera frames (on desktop and phones).
 const state={u:.45*total,k:1,clock:0,placed:false,placedReduced:false};
 const stats={awake:false,updated:0,visible:false};
 const up=new T.Vector3(0,1,0);
 function place(dt:number){
  const before=state.u;state.u=(state.u+dt*loop.speed)%total;if(state.u<before)state.k=1;
  while(state.k<n&&lengths[state.k]<state.u)state.k++;
  const a=pts[state.k-1],b=pts[state.k%n],f=(state.u-lengths[state.k-1])/((lengths[state.k]-lengths[state.k-1])||1);
  const dx=b.x-a.x,dz=b.z-a.z;
  mesh.position.set(a.x+dx*f,WATER+.02,a.z+dz*f);
  mesh.quaternion.setFromAxisAngle(up,Math.atan2(-dz,dx)+.05*Math.sin(state.clock*.37));mesh.updateMatrix();
 }
 /** Called from the island's frame update with the frustum the sharks just built. */
 function update(dt:number,reduced:boolean,frustum:T.Frustum,player:{x:number;z:number}){
  const d=Math.hypot(Math.max(box.minX-player.x,0,player.x-box.maxX),Math.max(box.minZ-player.z,0,player.z-box.maxZ));
  root.visible=stats.visible=d<DRAW;stats.awake=false;stats.updated=0;if(!root.visible)return;
  if(!state.placed||state.placedReduced!==reduced){place(0);state.placed=true;state.placedReduced=reduced;}
  sphere.center.copy(mesh.position);if(d>NEAR||!frustum.intersectsSphere(sphere))return;
  // Frozen (dt 0) or static ambience / reduced motion: already placed, so nothing uploads.
  stats.awake=true;if(dt===0||reduced)return;
  const step=Math.min(dt,.1);state.clock=(state.clock+step)%(2*Math.PI/1.15*400);time.value=state.clock;place(step);stats.updated=1;
 }
 return {root,mesh,stats,update,time,box,dispose(){root.removeFromParent();geometry.dispose();material.dispose();}};
}
