import * as T from 'three';
import {hotspotAt,type Hotspot} from './fishingAim';

/**
 * Reading the water + aiming (Oct 14 2026, user: "update the fishing to be able to cast in certain spots to try and catch bigger
 * fish. not cast in the same spot"). Draws, only while fishing:
 * - each HOTSPOT (fishingAim.ts) as a subtle sign in the water: a dark drop-off patch, a ring of ripples, the boil of a bait
 *   ball, a lighter reef edge, a shadow passing under the surface, a dark upwelling, and a few birds circling and diving over it;
 * - the AIM PREVIEW: a dotted arc from the rod to where the float will land, and a ring on the water there.
 *
 * Heat (AGENTS.md): ONE InstancedMesh of quads with one small shader (one draw), created with the fishing visuals and hidden
 * unless a session is on. Per frame while fishing it rewrites at most 32 instance matrices (the hotspots drift slowly, the birds
 * circle); nothing at rest. Patterns are drawn in the fragment shader (no textures).
 */
const KIND={dropoff:0,ripples:1,boil:2,edge:3,shadow:4,upwelling:5,bird:6,dot:7,target:8} as const;
const SURF=-.385,DOTS=16,BIRDS=3,CAP=3*(1+BIRDS)+DOTS+1;
const VERT=/* glsl */`
attribute float iKind,iSeed,iAlpha;uniform float uTime;varying vec2 vUv;varying float vKind,vSeed,vAlpha;
void main(){
 vUv=uv;vKind=iKind;vSeed=iSeed;vAlpha=iAlpha;
 vec3 c=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;
 vec3 p;
 if(iKind>5.5&&iKind<7.5){// Billboards (birds, aim dots): face the camera, size from the instance scale.
  float s=length(instanceMatrix[0].xyz);vec3 right=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]),up=vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1]);
  p=c+(right*position.x+up*position.z*-1.)*s;}
 else p=(modelMatrix*instanceMatrix*vec4(position,1.)).xyz;
 gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);
}`;
const FRAG=/* glsl */`
uniform float uTime;varying vec2 vUv;varying float vKind,vSeed,vAlpha;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
 vec2 d=vUv*2.-1.;float r=length(d),t=uTime,a=0.;vec3 col=vec3(1.);
 if(vKind<.5){a=(1.-smoothstep(.45,1.,r))*.34*(.85+.15*sin(t*.6+vSeed));col=vec3(.01,.06,.16);}
 else if(vKind<1.5){float w=fract(r*2.6-t*.35+vSeed);a=smoothstep(.0,.08,w)*smoothstep(.22,.1,w)*(1.-smoothstep(.6,1.,r))*.38;col=vec3(.92,.98,1.);}
 else if(vKind<2.5){vec2 g=vUv*9.;vec2 id=floor(g);float h=hash(id+floor(t*2.2+vSeed));float dot=1.-smoothstep(.08,.22,length(fract(g)-.5));
  a=dot*step(.78,h)*(1.-smoothstep(.55,1.,r))*.75+(1.-smoothstep(.3,1.,r))*.08;col=vec3(.9,.97,1.);}
 else if(vKind<3.5){float band=1.-smoothstep(.0,.12,abs(r-.72));a=band*smoothstep(-.2,.6,d.y)*.32*(.8+.2*sin(t*.5+vSeed));col=vec3(.45,.95,.85);}
 else if(vKind<4.5){float e=length(vec2(d.x/.42,d.y));a=(1.-smoothstep(.55,1.,e))*.32;col=vec3(0.,.04,.08);}
 else if(vKind<5.5){float sw=sin(atan(d.y,d.x)*3.+r*8.-t*.4+vSeed)*.5+.5;a=(1.-smoothstep(.4,1.,r))*(.26+.1*sw);col=mix(vec3(0.,.07,.11),vec3(.1,.3,.32),sw*.4);}
 else if(vKind<6.5){// A gull: two wings in a flapping V.
  float flap=sin(t*7.+vSeed*3.)*.35;vec2 q=vec2(abs(d.x),d.y);float wing=abs(q.y-(q.x*(.55+flap)-.1));a=(1.-smoothstep(.05,.12,wing))*step(q.x,.95)*.95;col=mix(vec3(.15,.17,.2),vec3(.95),step(.35,q.x));}
 else if(vKind<7.5){a=(1.-smoothstep(.55,1.,r))*.9;col=vec3(1.,.97,.86);}
 else{float ring=1.-smoothstep(.0,.1,abs(r-.8));a=ring*(.65+.35*sin(t*5.));col=vec3(1.,.95,.75);}
 gl_FragColor=vec4(col,a*vAlpha);
 #include <colorspace_fragment>
}`;
export type AimPreview={from:{x:number;y:number;z:number};to:{x:number;z:number}}|null;

export function createFishingOverlay(scene:T.Scene){
 const quad=new T.PlaneGeometry(1,1).rotateX(-Math.PI/2);
 const kindA=new T.InstancedBufferAttribute(new Float32Array(CAP),1),seedA=new T.InstancedBufferAttribute(new Float32Array(CAP),1),alphaA=new T.InstancedBufferAttribute(new Float32Array(CAP),1);
 alphaA.setUsage(T.DynamicDrawUsage);quad.setAttribute('iKind',kindA);quad.setAttribute('iSeed',seedA);quad.setAttribute('iAlpha',alphaA);
 const uniforms={uTime:{value:0}};
 const material=new T.ShaderMaterial({uniforms,vertexShader:VERT,fragmentShader:FRAG,transparent:true,depthWrite:false,side:T.DoubleSide});
 const mesh=new T.InstancedMesh(quad,material,CAP);mesh.name='fishing-water-signs';mesh.renderOrder=1.4;mesh.frustumCulled=false;mesh.visible=false;mesh.raycast=()=>{};mesh.count=0;scene.add(mesh);
 const dummy=new T.Object3D();
 let hotspots:readonly Hotspot[]=[],aim:AimPreview=null,fade=0,target=0,clock=0;
 const put=(i:number,kind:number,seed:number,alpha:number,x:number,y:number,z:number,sx:number,sz=sx,yaw=0)=>{
  dummy.position.set(x,y,z);dummy.rotation.set(0,yaw,0);dummy.scale.set(sx,1,sz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
  kindA.setX(i,kind);seedA.setX(i,seed);alphaA.setX(i,alpha);};
 const PATCH:Record<string,number>={dropoff:KIND.dropoff,ripples:KIND.ripples,birds:KIND.ripples,'reef-edge':KIND.edge,shadow:KIND.shadow,baitball:KIND.boil,upwelling:KIND.upwelling};
 return {mesh,
  get busy(){return mesh.visible;},
  /** The session's hotspots (shown while fishing), or none. */
  setHotspots(list:readonly Hotspot[]){hotspots=list;},
  /** The aim preview (null hides it). */
  setAim(a:AimPreview){aim=a;},
  begin(){target=1;mesh.visible=true;},
  end(){target=0;aim=null;},
  /** `time`: the session clock for the hotspot drift (seconds); dt for the fades and animation. */
  frame(dt:number,reduced:boolean,time:number){
   if(!mesh.visible)return;
   fade=reduced?target:T.MathUtils.clamp(fade+Math.sign(target-fade)*Math.min(Math.abs(target-fade),dt/.7),0,1);
   if(fade<=0&&target===0){mesh.visible=false;mesh.count=0;return;}
   if(!reduced)clock=(clock+Math.min(dt,.1))%3600;uniforms.uTime.value=clock;
   let n=0;
   hotspots.forEach((h,hi)=>{const c=hotspotAt(h,reduced?0:time),seed=hi*7.3+1;
    if(h.kind==='shadow'){// A big shadow cruising slowly round the patch, under the surface.
     const a=clock*.35+seed,x=c.x+Math.cos(a)*h.r*.45,z=c.z+Math.sin(a)*h.r*.45;put(n++,KIND.shadow,seed,fade,x,SURF-.5,z,h.r*.45,h.r*1.05,Math.atan2(-Math.sin(a),Math.cos(a)));}
    else put(n++,PATCH[h.kind]??KIND.ripples,seed,fade,c.x,SURF,c.z,h.r*2);
    if(h.kind==='birds'||h.kind==='baitball')for(let b=0;b<(h.kind==='birds'?BIRDS:2);b++){
     // Gulls circle 3.5-5 m up; every few seconds one folds and dives to the surface.
     const ph=clock*(.55+b*.12)+b*2.1+seed,cyc=(clock*.16+b*.33+seed*.1)%1,dive=cyc>.82?Math.sin((cyc-.82)/.18*Math.PI):0;
     const rr=h.r*(.6+b*.18)*(1-dive*.6);put(n++,KIND.bird,seed+b,fade,c.x+Math.cos(ph)*rr,SURF+3.6+b*.5-dive*(3.4+b*.5),c.z+Math.sin(ph)*rr,.55);}
   });
   if(aim){const {from,to}=aim;for(let i=1;i<=DOTS;i++){const t=i/(DOTS+1),x=from.x+(to.x-from.x)*t,z=from.z+(to.z-from.z)*t,y=from.y+(SURF+.05-from.y)*t+Math.sin(t*Math.PI)*1.6;put(n++,KIND.dot,i,fade*(.35+.65*(1-t*.5)),x,y,z,.085);}
    put(n++,KIND.target,0,fade,to.x,SURF+.01,to.z,1.5);}
   mesh.count=n;mesh.instanceMatrix.needsUpdate=true;kindA.needsUpdate=true;seedA.needsUpdate=true;alphaA.needsUpdate=true;
  },
  dispose(){mesh.removeFromParent();mesh.dispose();quad.dispose();material.dispose();},
 };
}
