/**
 * Bug-spotting FX for a Bug squad shift (bug-polish, Oct 20 2026; user: "can't see bugs to catch when walking around"). Two pooled
 * instanced draws, built with the swarm's set and disposed with it, no textures, no per-frame allocation:
 *  - ground: a soft contact-shadow dot under each flying bug (smaller and fainter the higher it flies) and, for a bug that just
 *    turned up near the player, a bright pulsing ring on the grass (mode 1);
 *  - marks (camera-facing): a gentle periodic glint on uncaught bugs within 25 m (mode 0, a four-point star that flashes for
 *    ~0.5 s every 2.4 s, staggered per bug), a green check for a bug whose species is already in today's jar (mode 1, "already
 *    in your jar": shown only when no uncaught bug can be sent over) and a bouncing "!" over a bug that just turned up (mode 2).
 * Capacity = 2 × the set's size (ground) and the set's size (marks), so the counts can never pass the heat caps.
 */
import * as T from 'three';

export const SPOT_FX={glintRange:25,shadowRange:40,spawnShow:2.5,glintPeriod:2.4} as const;

function groundMaterial(){
 return new T.ShaderMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,uniforms:{uTime:{value:0}},
  vertexShader:`attribute vec2 iM;uniform float uTime;varying vec2 vUv;varying vec2 vM;
void main(){vUv=uv-.5;vM=iM;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform float uTime;varying vec2 vUv;varying vec2 vM;
void main(){float d=length(vUv)*2.;float a;vec3 c;
 if(vM.x<.5){a=(1.-smoothstep(.15,1.,d))*vM.y*.42;c=vec3(.04,.06,.03);}
 else{float r=.62+.25*fract(uTime*1.4);a=(1.-smoothstep(0.,.13,abs(d-r)))*vM.y*(1.-fract(uTime*1.4)*.6);c=vec3(1.,.92,.5);}
 if(a<.01)discard;gl_FragColor=vec4(c,a);}`});
}
function markMaterial(){
 return new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:{value:0}},
  vertexShader:`attribute vec3 iG;uniform float uTime;varying vec2 vUv;varying vec3 vG;varying float vA;
void main(){vUv=uv-.5;vG=iG;vec4 mv=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);float sc=length(instanceMatrix[0].xyz);
 float cyc=fract(uTime/${SPOT_FX.glintPeriod.toFixed(1)}+iG.x);float a;
 if(iG.y<.5){a=smoothstep(0.,.06,cyc)*(1.-smoothstep(.06,.22,cyc));sc*=.6+.6*a;}
 else if(iG.y<1.5){a=.55+.45*smoothstep(0.,.1,cyc)*(1.-smoothstep(.3,.6,cyc));}
 else{a=1.;mv.y+=abs(sin(uTime*6.))*.12*sc;}
 vA=a*iG.z;mv.xy+=position.xy*sc;gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying vec2 vUv;varying vec3 vG;varying float vA;
float seg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}
void main(){vec2 p=vUv;float a;vec3 c;
 if(vG.y<.5){float x=abs(p.x),y=abs(p.y);a=exp(-x*38.)*exp(-y*5.)+exp(-y*38.)*exp(-x*5.)+exp(-dot(p,p)*90.);c=vec3(1.,.95,.7);}
 else if(vG.y<1.5){float d=min(seg(p,vec2(-.26,.02),vec2(-.08,-.17)),seg(p,vec2(-.08,-.17),vec2(.27,.24)));
  float o=1.-smoothstep(.07,.1,d),i=1.-smoothstep(.035,.06,d);a=o;c=mix(vec3(1.),vec3(.25,.78,.36),i);}
 else{float d=min(seg(p,vec2(0.,-.02),vec2(0.,.3)),length(p-vec2(0.,-.2)));float o=1.-smoothstep(.08,.11,d),i=1.-smoothstep(.045,.07,d);a=o;c=mix(vec3(.2,.12,.02),vec3(1.,.82,.2),i);}
 a*=vA;if(a<.01)discard;gl_FragColor=vec4(c,min(1.,a));}`});
}

export function createBugSpotFx(n:number){
 const gGeo=new T.PlaneGeometry(1,1);gGeo.rotateX(-Math.PI/2);
 const iM=new T.InstancedBufferAttribute(new Float32Array(n*2*2),2);iM.setUsage(T.DynamicDrawUsage);gGeo.setAttribute('iM',iM);
 const gMat=groundMaterial();const ground=new T.InstancedMesh(gGeo,gMat,n*2);ground.name='bug-spot-ground';ground.frustumCulled=false;ground.count=0;ground.renderOrder=1;
 ground.instanceMatrix.setUsage(T.DynamicDrawUsage);
 const mGeo=new T.PlaneGeometry(1,1);const iG=new T.InstancedBufferAttribute(new Float32Array(n*3),3);iG.setUsage(T.DynamicDrawUsage);mGeo.setAttribute('iG',iG);
 const mMat=markMaterial();const marks=new T.InstancedMesh(mGeo,mMat,n);marks.name='bug-spot-marks';marks.frustumCulled=false;marks.count=0;marks.renderOrder=3;
 marks.instanceMatrix.setUsage(T.DynamicDrawUsage);
 const m4=new T.Matrix4();let gi=0,mi=0;
 return {ground,marks,
  begin(time:number){gi=0;mi=0;gMat.uniforms.uTime.value=time;mMat.uniforms.uTime.value=time;},
  /** mode 0 = contact shadow (size = dot diameter), 1 = spawn ring. */
  groundAt(x:number,y:number,z:number,size:number,mode:number,alpha:number){if(gi>=n*2)return;m4.makeScale(size,1,size).setPosition(x,y,z);ground.setMatrixAt(gi,m4);iM.setXY(gi,mode,alpha);gi++;},
  /** mode 0 = glint, 1 = ✓ already in the jar, 2 = "!" just turned up; phase staggers the glint. */
  markAt(x:number,y:number,z:number,size:number,mode:number,phase:number,alpha=1){if(mi>=n)return;m4.makeScale(size,size,size).setPosition(x,y,z);marks.setMatrixAt(mi,m4);iG.setXYZ(mi,phase,mode,alpha);mi++;},
  end(){ground.count=gi;ground.visible=gi>0;marks.count=mi;marks.visible=mi>0;if(gi){ground.instanceMatrix.needsUpdate=true;iM.needsUpdate=true;}if(mi){marks.instanceMatrix.needsUpdate=true;iG.needsUpdate=true;}},
  hide(){ground.count=marks.count=0;ground.visible=marks.visible=false;},
  get counts(){return {ground:ground.count,marks:marks.count};},
  dispose(){ground.removeFromParent();marks.removeFromParent();ground.dispose();marks.dispose();gGeo.dispose();mGeo.dispose();gMat.dispose();mMat.dispose();},
 };
}
export type BugSpotFx=ReturnType<typeof createBugSpotFx>;
