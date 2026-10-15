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
 * unless a session is on. Per frame while fishing it rewrites at most ~60 instance matrices (the hotspots drift slowly, the birds
 * circle); nothing at rest. Patterns are drawn in the fragment shader (no textures).
 *
 * Oct 14 2026 polish ("subtle animations … improve water"): the same draw also carries
 * - the SPLASH RINGS (cast landing, nibbles, bite, hook, the catch leaving the water): soft double rings spreading and fading
 *   (they were 5 ring meshes with a material each = up to 5 draws);
 * - the SPLASH DROPS and the drip from the held catch (were one more instanced sphere draw): a small pool with simple ballistics;
 * - BUBBLES rising now and then from the reef (depth-tinted, they wobble and pop at the surface).
 * So the polish removes up to 6 draws while adding the bubbles. Drops and bubbles follow fishingLife (tiers 0-1 only).
 */
const KIND={dropoff:0,ripples:1,boil:2,edge:3,shadow:4,upwelling:5,bird:6,dot:7,target:8,ring:9,drop:10,bubble:11} as const;
const SURF=-.385,DOTS=16,BIRDS=3,RINGS=7,DROPS=18,BUBBLES=8,CAP=3*(1+BIRDS)+DOTS+1+RINGS+DROPS+BUBBLES;
const VERT=/* glsl */`
attribute float iKind,iSeed,iAlpha;uniform float uTime;varying vec2 vUv;varying float vKind,vSeed,vAlpha;
void main(){
 vUv=uv;vKind=iKind;vSeed=iSeed;vAlpha=iAlpha;
 vec3 c=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;
 vec3 p;
 if(iKind>5.5&&iKind<7.5||iKind>9.5){// Billboards (birds, aim dots, drops, bubbles): face the camera, size from the instance scale.
  float s=length(instanceMatrix[0].xyz);vec3 right=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]),up=vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1]);
  p=c+(right*position.x+up*position.z*-1.)*s;}
 else p=(modelMatrix*instanceMatrix*vec4(position,1.)).xyz;
 gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);
}`;
const FRAG=/* glsl */`
uniform float uTime;uniform vec3 uUwShallow,uUwDeep;varying vec2 vUv;varying float vKind,vSeed,vAlpha;
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
 else if(vKind<8.5){float ring=1.-smoothstep(.0,.1,abs(r-.8));a=ring*(.65+.35*sin(t*5.));col=vec3(1.,.95,.75);}
 else if(vKind<9.5){// Splash ring: a soft bright crest with a fainter trailing ring inside (vSeed = age 0..1).
  float k=vSeed,w=.035+.05*k;a=(exp(-pow((r-.94)/w,2.))*.9+exp(-pow((r-.72)/(w*1.4),2.))*.35)*(1.-k)*(1.-k*.4);col=vec3(.96,1.,.98);}
 else if(vKind<10.5){// A water drop: a bright round bead with a darker rim.
  a=(1.-smoothstep(.55,1.,r))*.95;col=mix(vec3(.93,1.,.98),vec3(.55,.85,.9),smoothstep(.2,.9,r));}
 else{// A bubble: a thin bright rim and a highlight, tinted by the water it is in (vSeed = depth in m).
  float rim=smoothstep(.62,.86,r)*(1.-smoothstep(.86,1.,r)),hi=1.-smoothstep(.0,.22,length(d-vec2(-.3,.3)));
  a=(rim*.7+hi*.9+.06)*(1.-smoothstep(.98,1.,r));col=mix(vec3(.92,1.,1.),mix(uUwShallow,uUwDeep,clamp(vSeed/3.,0.,1.))*2.2,clamp(vSeed/3.5,0.,.6));}
 gl_FragColor=vec4(col,a*vAlpha);
 #include <colorspace_fragment>
}`;
export type AimPreview={from:{x:number;y:number;z:number};to:{x:number;z:number}}|null;

type Ring={x:number;z:number;y:number;size:number;life:number;age:number};
type Drop={x:number;y:number;z:number;vx:number;vy:number;vz:number;age:number;life:number;size:number;floor:number};
type Bubble={x:number;y:number;z:number;top:number;age:number;size:number;seed:number};
export function createFishingOverlay(scene:T.Scene,uw?:{uUwShallow:{value:T.Vector3};uUwDeep:{value:T.Vector3}}){
 const quad=new T.PlaneGeometry(1,1).rotateX(-Math.PI/2);
 const kindA=new T.InstancedBufferAttribute(new Float32Array(CAP),1),seedA=new T.InstancedBufferAttribute(new Float32Array(CAP),1),alphaA=new T.InstancedBufferAttribute(new Float32Array(CAP),1);
 alphaA.setUsage(T.DynamicDrawUsage);quad.setAttribute('iKind',kindA);quad.setAttribute('iSeed',seedA);quad.setAttribute('iAlpha',alphaA);
 const uniforms={uTime:{value:0},uUwShallow:uw?.uUwShallow??{value:new T.Vector3(0,.42,.62)},uUwDeep:uw?.uUwDeep??{value:new T.Vector3(0,.16,.32)}};
 const material=new T.ShaderMaterial({uniforms,vertexShader:VERT,fragmentShader:FRAG,transparent:true,depthWrite:false,side:T.DoubleSide});
 const mesh=new T.InstancedMesh(quad,material,CAP);mesh.name='fishing-water-signs';mesh.renderOrder=1.4;mesh.frustumCulled=false;mesh.visible=false;mesh.raycast=()=>{};mesh.count=0;scene.add(mesh);
 const dummy=new T.Object3D();
 let hotspots:readonly Hotspot[]=[],aim:AimPreview=null,fade=0,target=0,clock=0;
 const rings:Ring[]=[],drops:Drop[]=[],bubbles:Bubble[]=[];let bubbleSources:{x:number;y:number;z:number}[]=[],bubbleWait=2,lifeOn=true;
 /** Fx alive (rings, drops, bubbles): the overlay stays awake for them a moment after a session ends. */
 const fxBusy=()=>rings.length>0||drops.length>0||bubbles.length>0;
 const put=(i:number,kind:number,seed:number,alpha:number,x:number,y:number,z:number,sx:number,sz=sx,yaw=0)=>{
  dummy.position.set(x,y,z);dummy.rotation.set(0,yaw,0);dummy.scale.set(sx,1,sz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
  kindA.setX(i,kind);seedA.setX(i,seed);alphaA.setX(i,alpha);};
 const PATCH:Record<string,number>={dropoff:KIND.dropoff,ripples:KIND.ripples,birds:KIND.ripples,'reef-edge':KIND.edge,shadow:KIND.shadow,baitball:KIND.boil,upwelling:KIND.upwelling};
 return {mesh,
  get busy(){return mesh.visible;},
  /** A splash ring on the water at (x, z): `size` its final radius (m), `life` seconds. Oldest replaced when the pool is full. */
  ring(x:number,z:number,size:number,life:number,y=SURF+.004){if(rings.length>=RINGS)rings.shift();rings.push({x,z,y,size,life,age:0});mesh.visible=true;},
  /** A burst of `n` drops thrown up from (x, y, z) (splashes, the catch leaving the water); `power` scales the throw. */
  burst(x:number,y:number,z:number,n:number,power:number){if(!lifeOn)return;for(let i=0;i<n;i++){if(drops.length>=DROPS)drops.shift();const a=Math.random()*Math.PI*2,h=(.35+Math.random()*.65)*power;
   drops.push({x:x+Math.cos(a)*.06,y,z:z+Math.sin(a)*.06,vx:Math.cos(a)*h*.9,vy:(1.6+Math.random()*1.4)*power,vz:Math.sin(a)*h*.9,age:0,life:1.4,size:.035+Math.random()*.03,floor:SURF});}mesh.visible=true;},
  /** One drop falling from (x, y, z) (the wet catch dripping); it lands in the water below (floor) or on the sand. */
  drip(x:number,y:number,z:number,floor=SURF){if(!lifeOn)return;if(drops.length>=DROPS)drops.shift();drops.push({x,y,z,vx:(Math.random()-.5)*.15,vy:-.2,vz:(Math.random()-.5)*.15,age:0,life:1.6,size:.028+Math.random()*.014,floor});},
  /** Where bubbles may rise from (reef pieces in view: base x, seabed y, z). */
  setBubbleSources(list:{x:number;y:number;z:number}[]){bubbleSources=list;},
  /** fishingLife: drops and bubbles only on the cool tiers (gameplay rings always). */
  setLife(on:boolean){lifeOn=on;if(!on){drops.length=0;bubbles.length=0;}},
  /** The session's hotspots (shown while fishing), or none. */
  setHotspots(list:readonly Hotspot[]){hotspots=list;},
  /** The aim preview (null hides it). */
  setAim(a:AimPreview){aim=a;},
  begin(){target=1;mesh.visible=true;},
  end(){target=0;aim=null;bubbles.length=0;},
  /** `time`: the session clock for the hotspot drift (seconds); dt for the fades and animation. */
  frame(dt:number,reduced:boolean,time:number){
   if(!mesh.visible)return;
   fade=reduced?target:T.MathUtils.clamp(fade+Math.sign(target-fade)*Math.min(Math.abs(target-fade),dt/.7),0,1);
   if(fade<=0&&target===0&&!fxBusy()){mesh.visible=false;mesh.count=0;return;}
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
   // ---- Splash rings, drops, bubbles (Oct 14 2026 polish). Frozen (no ageing) with reduced motion except the rings' fade.
   const step=Math.min(dt,.05);
   for(let i=rings.length-1;i>=0;i--){const g=rings[i];g.age+=step||dt;const k=g.age/g.life;if(k>=1){rings.splice(i,1);continue;}
    const e=1-(1-k)*(1-k);put(n++,KIND.ring,k,1,g.x,g.y,g.z,g.size*(.3+e*.9)*2);}
   for(let i=drops.length-1;i>=0;i--){const p=drops[i];if(!reduced){p.age+=step;p.vy-=9.8*step;p.x+=p.vx*step;p.y+=p.vy*step;p.z+=p.vz*step;}
    if(reduced||p.age>=p.life||p.y<p.floor){drops.splice(i,1);continue;}put(n++,KIND.drop,0,Math.min(1,(p.life-p.age)*3),p.x,p.y,p.z,p.size);}
   if(lifeOn&&!reduced&&target>0&&bubbleSources.length){bubbleWait-=step;if(bubbleWait<=0){bubbleWait=1.6+Math.random()*3.2;
    // Now and then a little train of 2-4 bubbles from one reef piece.
    const s=bubbleSources[Math.floor(Math.random()*bubbleSources.length)],k=2+Math.floor(Math.random()*3);
    for(let j=0;j<k&&bubbles.length<BUBBLES;j++)bubbles.push({x:s.x+(Math.random()-.5)*.1,y:s.y+.08-j*.22,z:s.z+(Math.random()-.5)*.1,top:SURF-.02,age:0,size:.035+Math.random()*.035,seed:Math.random()*6.28});}}
   for(let i=bubbles.length-1;i>=0;i--){const b=bubbles[i];if(!reduced){b.age+=step;b.y+=(.32+b.size*4)*step;}
    if(b.y>=b.top||!lifeOn){if(b.y>=b.top&&rings.length<RINGS)rings.push({x:b.x,z:b.z,y:SURF+.004,size:.12,life:.6,age:0});bubbles.splice(i,1);continue;}
    const w=Math.sin(b.age*7+b.seed)*.025;put(n++,KIND.bubble,Math.max(0,SURF-b.y),Math.min(1,b.age*3)*fade,b.x+w,b.y,b.z+w*.6,b.size);}
   mesh.count=n;mesh.instanceMatrix.needsUpdate=true;kindA.needsUpdate=true;seedA.needsUpdate=true;alphaA.needsUpdate=true;
  },
  dispose(){mesh.removeFromParent();mesh.dispose();quad.dispose();material.dispose();},
 };
}
