import * as T from 'three';
import {BALL_GLSL_PRELUDE,BALL_GLSL_POLY} from './glsl';
import {MAX_DECALS,type Decal} from './decals';
import type {BallModel} from './models';

/**
 * World Cup ball gallery viewer (Oct 5 2026): one procedurally shaded ball on a studio sweep, turned by dragging (trackball,
 * with throw inertia), idling in a slow turn, and spun to the next ball with a short motion-blurred whip. Each design is a
 * GLSL `Surf design(vec3 p)` (see glsl.ts); its program is compiled the first time it's shown and kept (neighbours are
 * precompiled while idle so scrubbing never hitches). The loop runs only while something moves: the idle turn winds down ~10 s
 * after the last input and the loop sleeps; it also sleeps while the tab is hidden. Phones render at ≤1.5× pixel ratio.
 *
 * Exact balls (Oct 5 2026): a ball can carry printed decals (decals.ts: PNGs packed into one small atlas per ball, loaded on
 * first show) or come from a licensed 3D model (models.ts: a GLB loaded on demand; the procedural design shows until it lands
 * and stays the fallback). Models get a lazily built studio environment for their PBR materials.
 */
/** What the viewer draws for one ball: the procedural design, its decals and, if there is one, the licensed model. */
export type BallSource={id:string;glsl:string;decals?:readonly Decal[];model?:BallModel};
export type BallViewer={
 /** Show a design; `dir` (−1/1) is which way the ball whips round (0 = cut, used on first show). */
 show(src:BallSource,dir:-1|0|1):void;
 /** Compile a design ahead of time (no draw). */
 warm(src:BallSource):void;
 drag(dx:number,dy:number):void;
 release(vx:number,vy:number):void;
 grab():void;
 setPaused(paused:boolean):void;
 /** Tests and design previews: hold the ball still at an orientation (Euler radians) with no idle turn. */
 pose(x:number,y:number,z:number):void;
 resize():void;
 dispose():void;
};

const VERT=/* glsl */`
varying vec3 vObj;varying vec3 vPos;varying vec3 vN;
void main(){vObj=position;vec4 mv=modelViewMatrix*vec4(position,1.);vPos=mv.xyz;vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*mv;}`;

function frag(design:string){return /* glsl */`
uniform float uBlur;uniform vec3 uBlurAxis;
uniform sampler2D uDecalTex;uniform int uDecalN;uniform vec3 uDDir[${MAX_DECALS}];uniform vec3 uDUp[${MAX_DECALS}];uniform vec4 uDSize[${MAX_DECALS}];uniform vec4 uDRect[${MAX_DECALS}];
varying vec3 vObj;varying vec3 vPos;varying vec3 vN;
${BALL_GLSL_PRELUDE}
${BALL_GLSL_POLY}
${design}
/** The design plus its printed decals: each image projected onto the sphere around its direction (seen from outside, unmirrored). */
Surf designD(vec3 p){Surf s=design(p);
 for(int i=0;i<${MAX_DECALS};i++){if(i>=uDecalN)break;vec3 d=uDDir[i];if(dot(p,d)<.3)continue;vec3 r=normalize(cross(uDUp[i],d)),u=cross(d,r);
  // Sample with the UV clamped (continuous derivatives, so no mip seam outlines the decal), then mask outside the rectangle.
  vec2 q=vec2(dot(p,r),dot(p,u))/uDSize[i].xy*.5+.5;float inside=step(0.,q.x)*step(0.,q.y)*step(q.x,1.)*step(q.y,1.);
  vec4 t=texture2D(uDecalTex,uDRect[i].xy+clamp(q,.002,.998)*uDRect[i].zw);float a=t.a*inside;s.col=mix(s.col,pow(t.rgb,vec3(2.2)),a);if(uDSize[i].z>0.)s.gloss=mix(s.gloss,uDSize[i].z,a);}
 return s;}
vec3 bumpNormal(vec3 pos,vec3 n,float h){vec3 dx=dFdx(pos),dy=dFdy(pos);float hx=dFdx(h),hy=dFdy(h);
 vec3 r1=cross(dy,n),r2=cross(n,dx);float det=dot(dx,r1);vec3 g=sign(det)*(hx*r1+hy*r2);return normalize(abs(det)*n-g);}
void main(){
 vec3 p=normalize(vObj);Surf s=designD(p);
 if(uBlur>.004){vec3 c=vec3(0);float g=0.;for(int i=0;i<8;i++){float t=(float(i)/7.-.5)*uBlur;Surf q=designD(rotAxis(p,uBlurAxis,t));c+=q.col;g+=q.groove;}s.col=c/8.;s.groove=g/8.;}
 vec3 N=normalize(vN);N=bumpNormal(vPos,N,-s.groove*.006);
 vec3 V=normalize(-vPos);
 vec3 L1=normalize(vec3(-.45,.8,.55)),L2=normalize(vec3(.8,.05,.45));
 float d1=max(dot(N,L1),0.),d2=max(dot(N,L2),0.)*.32,hemi=.5+.5*N.y;
 vec3 amb=mix(vec3(.42),vec3(.95),hemi)*.42;
 float occ=1.-.38*s.groove;
 vec3 col=s.col*(d1*.78+d2+amb)*occ;
 vec3 H=normalize(L1+V);float spec=pow(max(dot(N,H),0.),mix(14.,110.,s.gloss))*mix(.04,.55,s.gloss)*(1.-.7*s.groove);
 float fr=pow(1.-max(dot(N,V),0.),3.5);vec3 env=mix(vec3(.62),vec3(1.),N.y*.5+.5)*fr*mix(.06,.32,s.gloss);
 gl_FragColor=vec4(col+spec+env,1.);
 #include <colorspace_fragment>
}`;}

/** A ball material for other scenes (the museum's plinth): the same studio shading, no motion blur. */
export function createBallMaterial(glsl:string){return new T.ShaderMaterial({vertexShader:VERT,fragmentShader:frag(glsl),uniforms:{uBlur:{value:0},uBlurAxis:{value:new T.Vector3(0,1,0)},...decalUniforms()}});}

const WHITE=new T.DataTexture(new Uint8Array([255,255,255,0]),1,1);WHITE.needsUpdate=true;
function decalUniforms(){const v3=()=>Array.from({length:MAX_DECALS},()=>new T.Vector3()),v4=()=>Array.from({length:MAX_DECALS},()=>new T.Vector4());
 return {uDecalTex:{value:WHITE as T.Texture},uDecalN:{value:0},uDDir:{value:v3()},uDUp:{value:v3()},uDSize:{value:v4()},uDRect:{value:v4()}};}
type DecalUniforms=ReturnType<typeof decalUniforms>;
const loadImage=(src:string)=>new Promise<HTMLImageElement>((ok,fail)=>{const i=new Image();i.decoding='async';i.onload=()=>ok(i);i.onerror=fail;i.src=src;});
/** Pack a ball's decal images into one atlas row (each scaled to 512 px tall, max 4096 wide) and fill the uniforms. */
async function applyDecals(u:DecalUniforms,decals:readonly Decal[]){
 const list=decals.slice(0,MAX_DECALS),imgs=await Promise.all(list.map(d=>loadImage(d.src)));const H=512,ws=imgs.map(i=>Math.round(i.naturalWidth/i.naturalHeight*H));
 let total=ws.reduce((a,b)=>a+b+4,0);const k=total>4096?4096/total:1;total=Math.ceil(total*k);
 const c=document.createElement('canvas');c.width=total;c.height=Math.round(H*k);const g=c.getContext('2d')!;let x=2;
 list.forEach((d,i)=>{const w=Math.round(ws[i]*k);g.drawImage(imgs[i],x,0,w,c.height);
  u.uDDir.value[i].set(...d.dir).normalize();u.uDUp.value[i].set(...d.up).normalize();u.uDSize.value[i].set(d.w,d.h,d.gloss??0,0);
  u.uDRect.value[i].set(x/c.width,0,w/c.width,1);x+=w+Math.round(4*k);});
 const tex=new T.CanvasTexture(c);tex.flipY=false;tex.colorSpace=T.NoColorSpace;tex.anisotropy=4;tex.generateMipmaps=true;tex.minFilter=T.LinearMipmapLinearFilter;
 // The canvas is drawn top-down; with flipY off, v=0 is the image top, so flip the rows' v in the rect.
 list.forEach((_,i)=>{const r=u.uDRect.value[i];r.set(r.x,1,r.z,-1);});
 u.uDecalTex.value=tex;u.uDecalN.value=list.length;return tex;}

/** Load a licensed GLB, centre it and scale it to a unit-radius ball. */
async function loadModel(m:BallModel){const {GLTFLoader}=await import('three/examples/jsm/loaders/GLTFLoader.js');const gltf=await new GLTFLoader().loadAsync(m.url);
 const root=gltf.scene,box=new T.Box3().setFromObject(root),c=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());
 root.position.sub(c);const wrap=new T.Group();wrap.add(root);wrap.scale.setScalar(2/Math.max(size.x,size.y,size.z));if(m.turn)wrap.rotation.set(...m.turn);
 const outer=new T.Group();outer.add(wrap);return outer;}

export function createBallViewer(canvas:HTMLCanvasElement,opts:{reducedMotion?:boolean;coarse?:boolean;onIdle?:(idle:boolean)=>void}={}):BallViewer{
 const reduced=!!opts.reducedMotion;
 const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'default'});
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.setClearColor(0x000000,0);
 // Phones render at ≤1.5× (the island's heat rule); desktops at ≤2×.
 const dpr=()=>Math.min(window.devicePixelRatio||1,opts.coarse?1.5:2);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(26,1,.1,50);camera.position.set(0,.35,7.6);camera.lookAt(0,-.05,0);
 const geo=new T.SphereGeometry(1,160,112);
 const holder=new T.Group();scene.add(holder);
 const ball=new T.Mesh<T.BufferGeometry,T.Material>(geo,new T.MeshBasicMaterial({color:0xffffff}));holder.add(ball);
 // Contact shadow: a soft ellipse on the sweep, tighter and darker at the centre.
 const sc=document.createElement('canvas');sc.width=256;sc.height=256;const sg=sc.getContext('2d')!;
 const grad=sg.createRadialGradient(128,128,0,128,128,128);grad.addColorStop(0,'rgba(20,24,30,.42)');grad.addColorStop(.3,'rgba(20,24,30,.2)');grad.addColorStop(.6,'rgba(20,24,30,.06)');grad.addColorStop(1,'rgba(20,24,30,0)');
 sg.fillStyle=grad;sg.fillRect(0,0,256,256);
 const shadowTex=new T.CanvasTexture(sc);shadowTex.colorSpace=T.SRGBColorSpace;
 const shadow=new T.Mesh(new T.PlaneGeometry(3,3),new T.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.02;scene.add(shadow);

 const materials=new Map<string,T.ShaderMaterial>(),decalTex:T.Texture[]=[];
 const uniforms={uBlur:{value:0},uBlurAxis:{value:new T.Vector3(0,1,0)}};
 function material(src:BallSource){let m=materials.get(src.id);if(!m){const u=decalUniforms();m=new T.ShaderMaterial({vertexShader:VERT,fragmentShader:frag(src.glsl),uniforms:{...uniforms,...u}});m.name=`wc-ball-${src.id}`;materials.set(src.id,m);
   if(src.decals?.length)applyDecals(u,src.decals).then(t=>{if(disposed)t.dispose();else{decalTex.push(t);wake();}}).catch(err=>console.warn('ball decals failed',src.id,err));}return m;}
 // Licensed models: loaded on demand and kept; a studio environment is built the first time one is needed.
 const models=new Map<string,Promise<T.Object3D|null>>();let env:T.Texture|null=null,shownModel:T.Object3D|null=null;
 function modelFor(src:BallSource){if(!src.model)return null;let p=models.get(src.id);if(!p){p=(async()=>{
   if(!env){const {RoomEnvironment}=await import('three/examples/jsm/environments/RoomEnvironment.js');const pm=new T.PMREMGenerator(renderer);env=pm.fromScene(new RoomEnvironment(),.04).texture;pm.dispose();scene.environment=env;
    const key=new T.DirectionalLight(0xffffff,1.6);key.position.set(-3,5,4);scene.add(key);}
   return loadModel(src.model!);})().catch(err=>{console.warn('ball model failed, using the drawn ball',src.id,err);return null;});models.set(src.id,p);}return p;}
 function present(src:BallSource){ball.material=material(src);currentId=src.id;if(shownModel){holder.remove(shownModel);shownModel=null;}ball.visible=true;
  const p=modelFor(src);if(p)p.then(o=>{if(!o||disposed||currentId!==src.id)return;holder.add(o);shownModel=o;ball.visible=false;wake();});}

 // Rotation state: the ball's orientation, an angular velocity (world, rad/s) and a slow idle turn that eases back in.
 const q=new T.Quaternion().setFromEuler(new T.Euler(.32,-.5,.08)),omega=new T.Vector3(),tmpQ=new T.Quaternion(),tmpV=new T.Vector3(),inv=new T.Quaternion();
 const IDLE=new T.Vector3(.05,reduced?0:.38,0),IDLE_MS=10000;let held=false,idleMix=reduced?0:1,lastInput=performance.now()-1400;
 let swap:{t:number;dir:number;src:BallSource;swapped:boolean}|null=null,scale=1;
 let frame=0,last=0,paused=false,disposed=false,currentId='';

 function resize(){const w=canvas.clientWidth||window.innerWidth,h=canvas.clientHeight||window.innerHeight;renderer.setPixelRatio(dpr());renderer.setSize(w,h,false);camera.aspect=w/h;
  // Fit like a product shot: the ball spans ~42% of the height on wide screens and ~64% of the width on tall ones, and sits a
  // little above centre (the year, name and timeline live underneath).
  const t=Math.tan(T.MathUtils.degToRad(camera.fov/2)),radiusFrac=w>h*.85?.21:Math.min(.21,.32*w/h),dist=1/(t*radiusFrac*2);
  const elev=T.MathUtils.degToRad(7);camera.position.set(0,Math.sin(elev)*dist,Math.cos(elev)*dist);camera.lookAt(0,0,0);
  camera.setViewOffset(w,h,0,Math.round(h*.07),w,h);camera.updateProjectionMatrix();wake();}
 function step(now:number){
  frame=0;if(disposed||paused)return;const dt=Math.min(.05,last?(now-last)/1000:1/60);last=now;
  if(swap){swap.t+=dt;const T1=reduced?.12:.24,T2=reduced?.12:.42;
   if(!swap.swapped){const k=Math.min(1,swap.t/T1);if(!reduced){omega.y+=swap.dir*dt*70*(1-k*.4);}scale=1-.1*k*k;if(k>=1){swap.swapped=true;present(swap.src);swap.t=0;if(!reduced)q.multiplyQuaternions(tmpQ.setFromAxisAngle(tmpV.set(0,1,0),swap.dir*-.9),q);}}
   else{const k=Math.min(1,swap.t/T2),e=1-Math.pow(1-k,3);scale=.9+.1*e;if(k>=1){swap=null;scale=1;}}}
  // Damping: a flick coasts, then the idle turn eases back in.
  const damp=held?0:Math.exp(-dt*(swap&&!swap.swapped?1.2:swap?5:2.4));if(!held)omega.multiplyScalar(damp);
  // The idle turn eases in 1.4 s after the last touch and winds down after ~10 s, so an untouched ball comes to rest and the
  // loop sleeps (no endless render loop while a phone sits on the gallery).
  const since=now-lastInput;if(!held&&!swap){if(since>1400&&since<IDLE_MS)idleMix=Math.min(reduced?0:1,idleMix+dt*.6);else if(since>=IDLE_MS)idleMix=Math.max(0,idleMix-dt*.35);}
  const w=tmpV.copy(omega).addScaledVector(IDLE,idleMix),speed=w.length();
  if(speed>1e-5){tmpQ.setFromAxisAngle(w.clone().normalize(),speed*dt);q.premultiply(tmpQ);}
  holder.quaternion.copy(q);holder.scale.setScalar(scale);shadow.scale.setScalar(.9+.1*scale);
  // Motion blur ≈ a 1/40 s shutter, in ball-local space.
  const blur=Math.min(1.1,speed/40);uniforms.uBlur.value=blur>.03?blur:0;if(blur>.03){inv.copy(q).invert();uniforms.uBlurAxis.value.copy(w).normalize().applyQuaternion(inv);}
  renderer.render(scene,camera);
  const moving=speed>.002||!!swap||held;opts.onIdle?.(!moving);if(moving||idleMix>0||(!reduced&&since<IDLE_MS))frame=requestAnimationFrame(step);else last=0;
 }
 function wake(){if(!frame&&!disposed&&!paused){last=0;frame=requestAnimationFrame(step);}}
 const vis=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();};document.addEventListener('visibilitychange',vis);
 const ro=new ResizeObserver(resize);ro.observe(canvas);resize();

 return {
  show(src,dir){if(src.id===currentId&&!swap)return;if(!dir||!currentId){present(src);swap=null;scale=1;}else swap={t:0,dir,src,swapped:false};lastInput=performance.now();wake();},
  warm(src){if(materials.has(src.id))return;const m=material(src),prev=ball.material;ball.material=m;renderer.compile(scene,camera);ball.material=prev;},
  grab(){held=true;omega.set(0,0,0);idleMix=0;lastInput=performance.now();wake();},
  drag(dx,dy){const h=canvas.clientHeight||1,k=2.6/h*1.6;tmpQ.setFromAxisAngle(tmpV.set(0,1,0),dx*k);q.premultiply(tmpQ);tmpQ.setFromAxisAngle(tmpV.set(1,0,0),dy*k);q.premultiply(tmpQ);idleMix=0;lastInput=performance.now();wake();},
  release(vx,vy){held=false;const h=canvas.clientHeight||1,k=2.6/h*1.6;omega.set(vy*k,vx*k,0);if(omega.length()>18)omega.setLength(18);lastInput=performance.now();wake();},
  pose(x,y,z){q.setFromEuler(new T.Euler(x,y,z));omega.set(0,0,0);idleMix=0;held=false;lastInput=-Infinity;wake();},
  setPaused(p){paused=p;if(p){cancelAnimationFrame(frame);frame=0;}else wake();},
  resize,
  dispose(){disposed=true;cancelAnimationFrame(frame);ro.disconnect();document.removeEventListener('visibilitychange',vis);for(const m of materials.values())m.dispose();for(const t of decalTex)t.dispose();env?.dispose();for(const p of models.values())p.then(o=>o?.traverse(x=>{if(x instanceof T.Mesh){x.geometry.dispose();(Array.isArray(x.material)?x.material:[x.material]).forEach(mm=>{for(const v of Object.values(mm))if(v instanceof T.Texture)v.dispose();mm.dispose();});}}));geo.dispose();shadowTex.dispose();shadow.geometry.dispose();(shadow.material as T.Material).dispose();renderer.dispose();},
 };
}
