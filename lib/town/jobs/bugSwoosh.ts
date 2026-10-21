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
 night:{core:'#fffbe6',edge:'#ffd24a',additive:true,strength:1},
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
