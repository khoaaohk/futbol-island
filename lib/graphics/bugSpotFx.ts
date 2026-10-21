/**
 * Bug-spotting cue for a Bug squad shift. Oct 20 2026 (user playtest: "the check marks and shadows with sparkles is confusing",
 * "there are exclamation points for the bugs"): the contact shadows, spawn rings, "!" marks, glints and green checks are gone. ONE
 * cue is left: a soft pulsing halo (a camera-facing ring with a faint fill) round the nearest uncaught bug within SPOT_FX.haloRange,
 * so a child always knows which bug to go for; farther ones are found with the ➤ Nearest bug hint. One instanced draw of at most one
 * instance, no textures, no per-frame allocation; built with the swarm's set and disposed with it.
 */
import * as T from 'three';

export const SPOT_FX={haloRange:30,period:1.4,haloMin:1.6} as const;
/** The halo's diameter (m) round a bug of on-screen size `size`. Oct 21 2026: the island bugs are now believable sizes (≈ .26-.7 m),
 *  so the halo, not the body, carries the readability: never under SPOT_FX.haloMin (≈ 62 px tall at 30 m on a phone). */
export const haloSize=(size:number)=>Math.max(SPOT_FX.haloMin,size*3+.9);

function haloMaterial(){
 return new T.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,uniforms:{uTime:{value:0}},
  vertexShader:`attribute float iA;uniform float uTime;varying vec2 vUv;varying float vA;
void main(){vUv=uv-.5;vA=iA;vec4 mv=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);float sc=length(instanceMatrix[0].xyz);
 sc*=1.+.08*sin(uTime*${(Math.PI*2/SPOT_FX.period).toFixed(3)});mv.xy+=position.xy*sc;gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform float uTime;varying vec2 vUv;varying float vA;
void main(){float d=length(vUv)*2.;float ring=1.-smoothstep(.0,.07,abs(d-.86));float fill=(1.-smoothstep(.2,.9,d))*.16;
 float a=(ring*(.62+.3*sin(uTime*${(Math.PI*2/SPOT_FX.period).toFixed(3)}))+fill)*vA;if(a<.01)discard;
 gl_FragColor=vec4(mix(vec3(1.,.97,.82),vec3(1.,.85,.32),ring),min(1.,a));}`});
}

export function createBugSpotFx(){
 const geo=new T.PlaneGeometry(1,1),iA=new T.InstancedBufferAttribute(new Float32Array(1),1);iA.setUsage(T.DynamicDrawUsage);geo.setAttribute('iA',iA);
 const mat=haloMaterial(),halo=new T.InstancedMesh(geo,mat,1);halo.name='bug-spot-halo';halo.frustumCulled=false;halo.count=0;halo.renderOrder=3;
 halo.instanceMatrix.setUsage(T.DynamicDrawUsage);
 const m4=new T.Matrix4();let n=0;
 return {halo,
  begin(time:number){n=0;mat.uniforms.uTime.value=time;},
  /** The halo round one bug (diameter `size` m, alpha). One per frame; a second call is ignored. */
  haloAt(x:number,y:number,z:number,size:number,alpha=1){if(n>=1)return;m4.makeScale(size,size,size).setPosition(x,y,z);halo.setMatrixAt(0,m4);iA.setX(0,alpha);n=1;},
  end(){halo.count=n;halo.visible=n>0;if(n){halo.instanceMatrix.needsUpdate=true;iA.needsUpdate=true;}},
  hide(){halo.count=0;halo.visible=false;},
  get counts(){return {halo:halo.count};},
  dispose(){halo.removeFromParent();halo.dispose();geo.dispose();mat.dispose();},
 };
}
export type BugSpotFx=ReturnType<typeof createBugSpotFx>;
