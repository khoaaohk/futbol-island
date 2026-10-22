/**
 * The Bug squad's swing / cup swoosh trail (shared by the net and the firefly jar). Oct 21 2026 (user: "the night swoosh trail is
 * pale against the blue backdrop"): a soft glowing ribbon instead of a flat pale one. Three rows across the ribbon (transparent
 * edges, a bright core), revealed along the sweep with a comet tail (the newest part brightest) by a uniform, so no index ranges and
 * no per-frame writes beyond two numbers. Looks:
 *  - 'island' (day / sunset on the island): additive warm white;
 *  - 'night' (island and stage): additive warm yellow with a near-white core, full strength (it glows on the deep blue);
 *  - 'stage-day' / 'stage-sunset' (the catch stage's pale cream / peach backdrops, where additive light vanishes): normal blending,
 *    a golden core with deeper amber / orange edges so the trail reads as a warm stroke.
 * One draw while a swing shows it; no textures.
 */
import * as T from 'three';

export type SwooshLook='island'|'night'|'stage-day'|'stage-sunset';
export const SWOOSH_LOOKS:Record<SwooshLook,{core:string;edge:string;additive:boolean;strength:number}>={
 island:{core:'#ffffff',edge:'#fff1b8',additive:true,strength:.75},
 night:{core:'#fff3c0',edge:'#ffb020',additive:true,strength:1},
 'stage-day':{core:'#ffc93a',edge:'#d9770f',additive:false,strength:.92},
 'stage-sunset':{core:'#fff0a8',edge:'#c2410f',additive:false,strength:.92},
};

export function createSwoosh(own:<X extends {dispose:()=>void}>(x:X)=>X,inner:number,outer:number,arc=Math.PI*1.25,name='job-net-swoosh'){
 const SEG=24,g=own(new T.RingGeometry(inner,outer,SEG,2,0,arc));
 // aT: 0 → 1 along the arc; aE: 0 at the edges → 1 in the middle of the ribbon.
 {const p=g.getAttribute('position'),n=p.count,at=new Float32Array(n),ae=new Float32Array(n);
  for(let i=0;i<n;i++){const x=p.getX(i),y=p.getY(i),r=Math.hypot(x,y),a=(Math.atan2(y,x)+Math.PI*2)%(Math.PI*2);at[i]=Math.min(1,a/arc);ae[i]=1-Math.abs((r-inner)/(outer-inner)*2-1);}
  g.setAttribute('aT',new T.BufferAttribute(at,1));g.setAttribute('aE',new T.BufferAttribute(ae,1));}
 const uniforms={uReveal:{value:0},uOpacity:{value:0},uCore:{value:new T.Color()},uEdge:{value:new T.Color()}};
 const mat=own(new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,
  vertexShader:'attribute float aT;attribute float aE;varying float vT;varying float vE;void main(){vT=aT;vE=aE;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`uniform float uReveal;uniform float uOpacity;uniform vec3 uCore;uniform vec3 uEdge;varying float vT;varying float vE;
void main(){if(vT>uReveal)discard;float tail=smoothstep(uReveal-.85,uReveal,vT);float core=smoothstep(.35,1.,vE);
 float a=uOpacity*tail*(.25+.75*smoothstep(0.,.6,vE));if(a<.01)discard;gl_FragColor=vec4(mix(uEdge,uCore,core),min(1.,a));}`}));
 const mesh=new T.Mesh(g,mat);mesh.name=name;mesh.frustumCulled=false;mesh.visible=false;mesh.rotation.order='YXZ';
 let strength=1;
 const api={mesh,material:mat,
  setLook(look:SwooshLook){const L=SWOOSH_LOOKS[look];uniforms.uCore.value.set(L.core);uniforms.uEdge.value.set(L.edge);strength=L.strength;
   const b=L.additive?T.AdditiveBlending:T.NormalBlending;if(mat.blending!==b){mat.blending=b;mat.needsUpdate=true;}},
  /** `reveal` 0..1 along the arc, `opacity` 0..1 (times the look's strength). */
  show(reveal:number,opacity:number){uniforms.uReveal.value=reveal;uniforms.uOpacity.value=opacity*strength;},
  get look(){return {core:uniforms.uCore.value,edge:uniforms.uEdge.value,additive:mat.blending===T.AdditiveBlending,strength};},
 };
 return api;
}
export type Swoosh=ReturnType<typeof createSwoosh>;

/**
 * The net's swing trail that FOLLOWS THE HOOP (Oct 21 2026, user: "the net trail is on the wrong side, it should follow the path of
 * the net from behind"): the old trail was a fixed arc round the chest, so on the catch stage it sat on the opposite side of the
 * player from the net. This one is a ribbon laid down from the hoop's own recent positions (a comet tail behind it): each frame
 * of a swing adds a sample (the hoop centre and a point either side of it along the pole axis); samples older than LIFE s are
 * dropped and the rest fade with age, so the newest part, at the hoop, is the brightest and the tail thins out behind it. World
 * space (the mesh stays at the origin), one draw, preallocated buffers, no per-frame allocation, no textures.
 */
export const PATH_SWOOSH={samples:30,life:.42} as const;
export function createPathSwoosh(own:<X extends {dispose:()=>void}>(x:X)=>X,name='job-net-swoosh'){
 const N=PATH_SWOOSH.samples,LIFE=PATH_SWOOSH.life;
 const g=own(new T.BufferGeometry());
 const pos=new Float32Array(N*2*3),aT=new Float32Array(N*2),aE=new Float32Array(N*2),idx:number[]=[];
 for(let i=0;i<N;i++){aE[i*2]=0;aE[i*2+1]=0;}
 for(let i=0;i<N-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
 const P=new T.BufferAttribute(pos,3);P.setUsage(T.DynamicDrawUsage);
 const AT=new T.BufferAttribute(aT,1);AT.setUsage(T.DynamicDrawUsage);
 g.setAttribute('position',P);g.setAttribute('aT',AT);g.setAttribute('aE',new T.BufferAttribute(aE,1));g.setIndex(idx);
 // the ribbon is brightest along its centre line: three rows would need a centre vertex, so aE is 1 across the whole sample row
 // and the cross-fade comes from aT along the length (the ribbon's edges are the two points either side of the hoop centre).
 for(let i=0;i<N*2;i++)aE[i]=1;
 const uniforms={uOpacity:{value:1},uCore:{value:new T.Color()},uEdge:{value:new T.Color()}};
 const mat=own(new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,
  vertexShader:'attribute float aT;varying float vT;void main(){vT=aT;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`uniform float uOpacity;uniform vec3 uCore;uniform vec3 uEdge;varying float vT;
void main(){float a=uOpacity*pow(vT,1.35);if(a<.01)discard;gl_FragColor=vec4(mix(uEdge,uCore,smoothstep(.45,1.,vT)),min(1.,a));}`}));
 const mesh=new T.Mesh(g,mat);mesh.name=name;mesh.frustumCulled=false;mesh.visible=false;
 // samples, newest last: centre + the two edge points + age (s)
 const cx=new Float32Array(N),cy=new Float32Array(N),cz=new Float32Array(N),ex=new Float32Array(N),ey=new Float32Array(N),ez=new Float32Array(N),age=new Float32Array(N);
 let n=0,strength=1;
 function write(){
  // oldest first in the buffers; vertices past the live samples collapse onto the newest sample (degenerate triangles, nothing drawn)
  for(let i=0;i<N;i++){const k=Math.min(i,n-1);if(k<0)break;
   const t=Math.max(0,1-age[k]/LIFE);
   pos[i*6]=cx[k]+ex[k];pos[i*6+1]=cy[k]+ey[k];pos[i*6+2]=cz[k]+ez[k];pos[i*6+3]=cx[k]-ex[k];pos[i*6+4]=cy[k]-ey[k];pos[i*6+5]=cz[k]-ez[k];
   aT[i*2]=aT[i*2+1]=i>=n?0:t;}
  P.needsUpdate=true;AT.needsUpdate=true;g.setDrawRange(0,Math.max(0,n-1)*6);mesh.visible=n>=2;
 }
 function drop(dt:number){
  for(let i=0;i<n;i++)age[i]+=dt;
  let first=0;while(first<n&&age[first]>LIFE)first++;
  if(first>0){n-=first;for(let i=0;i<n;i++){const j=i+first;cx[i]=cx[j];cy[i]=cy[j];cz[i]=cz[j];ex[i]=ex[j];ey[i]=ey[j];ez[i]=ez[j];age[i]=age[j];}}
 }
 const api={mesh,material:mat,
  setLook(look:SwooshLook){const L=SWOOSH_LOOKS[look];uniforms.uCore.value.set(L.core);uniforms.uEdge.value.set(L.edge);strength=L.strength;uniforms.uOpacity.value=strength;
   const b=L.additive?T.AdditiveBlending:T.NormalBlending;if(mat.blending!==b){mat.blending=b;mat.needsUpdate=true;}},
  /** Kept so callers written for the arc ribbon keep working (the path ribbon fades by age, not by reveal). */
  show(_reveal:number,opacity:number){uniforms.uOpacity.value=opacity*strength;},
  get look(){return {core:uniforms.uCore.value,edge:uniforms.uEdge.value,additive:mat.blending===T.AdditiveBlending,strength};},
  /** Lay down the hoop's position this frame: centre (c) and the half-width vector (e, along the pole axis). */
  add(dt:number,cX:number,cY:number,cZ:number,eX:number,eY:number,eZ:number){
   drop(dt);if(n>=N){for(let i=1;i<n;i++){cx[i-1]=cx[i];cy[i-1]=cy[i];cz[i-1]=cz[i];ex[i-1]=ex[i];ey[i-1]=ey[i];ez[i-1]=ez[i];age[i-1]=age[i];}n=N-1;}
   cx[n]=cX;cy[n]=cY;cz[n]=cZ;ex[n]=eX;ey[n]=eY;ez[n]=eZ;age[n]=0;n++;uniforms.uOpacity.value=strength;write();},
  /** No new sample (the swing is over or paused): the tail keeps ageing and thins out. */
  fade(dt:number){if(n===0){mesh.visible=false;return;}drop(dt);write();},
  clear(){n=0;mesh.visible=false;},
  get count(){return n;},
 };
 return api;
}
export type PathSwoosh=ReturnType<typeof createPathSwoosh>;
