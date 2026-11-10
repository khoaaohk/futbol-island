/**
 * The full-screen gashapon toy viewer (round 3A, Nov 8 2026; round 3B studio + kinds, Nov 9 2026; docs/gashapon-design.md). Same
 * recipe as the museum's World Cup ball viewer (lib/museum/wcBalls/ballViewer.ts): its own canvas + renderer over a studio sweep,
 * drag to turn with throw inertia, a soft contact shadow, a loop that runs only while something moves and sleeps when the tab is
 * hidden, phones at ≤ 1.5× pixel ratio. Toys stand on a turntable: the drag spins the table (yaw) and tilts the camera (pitch).
 *
 * Touch (lib/gashapon/toyGestures.ts turns pointers into these calls): `pointerDown` / `pointerMove` / `pointerUp` grab a toy's
 * parts (puzzle pieces, a wind-up key, a secret capsule; lib/gashapon/toyInteract.ts), `grab` / `drag` / `release` turn the table,
 * `holdStart` / `holdEnd` squeeze, `tap` pokes, `flick` spins, `rub` jiggles. `releaseAll` lets go of everything (blur, cancel).
 * Letting go of a squeeze ALWAYS springs the toy back: the pressure is a damped spring (k 256, c 16: a ~16 % overshoot, at rest in
 * ~0.5 s) and squash-type release reactions are dropped (owner, Nov 9 2026: "letting go it still squeezes the toy").
 *
 * Round 3B (HD toys, lib/gashapon/toyModels/index.ts HD_MACHINES): while the viewer is open the island draws nothing, so an HD toy
 * gets the freed budget: physical materials (clearcoat vinyl, sheen bun, jelly, gold, glitter, pearl), a studio rig (key with ONE
 * soft shadow map on the turntable floor, fill, warm rim, low hemisphere), a generated PMREM room reflection, neutral tone mapping,
 * a soft-body squeeze and the toy's kind. Round 3A toys keep their toon look and two lights exactly as before.
 *
 * Heat: everything is built on `show` / first HD show and freed on `dispose` (geometries, materials, textures, the PMREM target,
 * the shadow map, the renderer + its context). 60 fps cap; 30 fps under reduced motion, the heat governor's slow tiers
 * (lib/graphics/heatTier.ts tier ≥ 1) or a low-end phone (≤ 4 cores or ≤ 3 GB). Idle life ~8 s after the last touch, then it sleeps.
 * Budgets per toy: round 3A ≤ 40 draws / 9k triangles; HD ≤ 120 draws / 60k triangles (tests/gashapon-viewer.cjs).
 */
import * as T from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {buildToy,toyBuilder} from './toyModels';
import {createToyAnimator,asList,type FxKind,type ToyAnimator} from './toyReactions';
import {createKindRuntime,type KindAction,type KindEvent,type KindFx,type KindRuntime,type GrabKind} from './toyInteract';
import {createToyVoice,type ToyVoice} from './toySound';
import {kindPlan,KIND_LIVE,TOY_KINDS,type ToyKind,type ToyKindPlan} from './toyKinds';
import {frameCapSlot} from '../town/frameCap';
import {tierSettings} from '../graphics/heatTier';
import type {ToyBehaviour,ToyRig} from './toyKit';

export type ToyTouch={kind:'poke'|'tap';part:string;refs:readonly string[]};
export type ToyAction=KindAction;
/** `hint`: the first-use chip (a working part's own hint, e.g. "Open me", "Crank me"). */
export type ToyKindInfo={kind:ToyKind;bonus:ToyKind;live:boolean;hint:string;can:ReturnType<KindRuntime['can']>|null};
export type ToyViewer={
 show(toyId:string):boolean;
 grab():void;drag(dx:number,dy:number):void;release(vx:number,vy:number):void;
 /** Zoom by a factor (>1 closer). */
 zoom(factor:number):void;
 /** True if the screen point is on the toy. */
 hit(x:number,y:number):boolean;
 /** Pointer down on a grabbable part (a puzzle piece, a wind-up key, a closed capsule): starts that grab and returns its kind. */
 pointerDown(x:number,y:number):GrabKind;pointerMove(x:number,y:number):void;pointerUp():void;
 /** Drop the current grab without its let-go action (a still hold on a working part turns into a squeeze). */
 pointerCancel():void;
 /** Hold started on the toy (squash + squeak, or winding a wind-up); `holdEnd` lets go: it springs back. */
 holdStart():void;holdEnd():void;
 /** Finger motion during a squeeze. */
 rub(dx:number,dy:number):void;
 /** A fast release that started on the toy: spins it (spin-top kinds); true if it spun. */
 flick(vx:number):boolean;
 /** Let go of everything (blur, pointer cancel, lost capture). */
 releaseAll():void;
 tap(x:number,y:number):ToyTouch|null;
 action(a:ToyAction):string|null;
 kind():ToyKindInfo|null;
 happy():void;
 /** The px the name card (bottom) and the header (top) cover: the toy is framed in the space between. */
 setInsets(top:number,bottom:number):void;
 setPaused(p:boolean):void;resize():void;dispose():void;
 stats():{draws:number;triangles:number;generic:boolean;running:boolean;voices:number;hd:boolean;pressure:number;squash:number;deform:number;frameMs:number;
  memory:{geometries:number;textures:number}|null;lights:number};
 rig():ToyRig|null;
 /** Tests: the kind runtime's joint / chain / pose state. */
 probe():ReturnType<KindRuntime['probe']>|null;
 /** Tests: the screen point (client px) of a part's current centre, or null. */
 screenOf(part:string):{x:number;y:number}|null;
};
type RendererLike=Pick<T.WebGLRenderer,'setPixelRatio'|'setSize'|'render'|'dispose'|'setClearColor'>&{outputColorSpace?:string;forceContextLoss?:()=>void;
 info?:{render:{calls:number;triangles:number};memory?:{geometries:number;textures:number}};shadowMap?:T.WebGLRenderer['shadowMap'];toneMapping?:T.ToneMapping;toneMappingExposure?:number};
export type ToyViewerOpts={reducedMotion?:boolean;coarse?:boolean;
 /** Dev labs only (/toy-lab sample models, never registered for players): build and plan ids the catalogue does not know. */
 lab?:{build(id:string):ToyRig|null;plan(id:string):ToyKindPlan|null};
 /** Kind events (haptics, hint chips, live status) for the component. */
 onEvent?:(e:KindEvent,detail?:string)=>void;
 /** Secret capsules already opened before (they start open). */
 opened?:(toyId:string)=>boolean;
 /** Tests: a stand-in renderer and voice. */
 renderer?:RendererLike;voice?:ToyVoice;onFrame?:()=>void};

const IDLE_MS=8000,PITCH_MIN=-.18,PITCH_MAX=.62,ZOOM_MIN=.62,ZOOM_MAX=1.9;
/** Squash-type reactions never play on a squeeze let-go (they would squash the toy again after the finger is up). */
const SQUASHY=new Set(['squash','e_juicysquish','d_widen','c_pixelshrink','beat1','beat2','beat3']);
export function releaseRefs(refs:readonly string[]):string[]{const out=refs.filter(r=>!SQUASHY.has(r.split(':')[0]));if(!out.some(r=>!/^(sparkle|puff|bubbles|petal|glow)$/.test(r)))out.unshift('jiggle');return out;}
/** Kind sound for each event (under the toy's own voice). */
const KIND_SOUND:Partial<Record<KindEvent,string[]>>={dent:['k_dent'],pull:['k_pop:1.2'],pop:['k_pop'],snap:['k_snap'],drop:['k_drop'],complete:['k_complete'],ratchet:['k_ratchet'],
 run:['k_tick'],stop:['k_tick:.8'],spin:['k_whirr'],twist:['k_twist'],reveal:['k_reveal'],close:['k_close'],blocked:['k_blocked'],
 open:['k_click'],shut:['k_clack'],detent:['k_detent'],push:['k_thunk'],fire:['k_spring','k_pop:1.4'],roll:['k_roll'],tinkle:['k_tinkle']};

export function createToyViewer(canvas:HTMLCanvasElement,opts:ToyViewerOpts={}):ToyViewer{
 const reduced=!!opts.reducedMotion,real=!opts.renderer;
 const renderer:RendererLike=opts.renderer??new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'default'});
 if(real){(renderer as T.WebGLRenderer).outputColorSpace=T.SRGBColorSpace;}
 if(renderer.shadowMap){renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=true;}
 renderer.setClearColor(0x000000,0);
 const nav=typeof navigator!=='undefined'?navigator as Navigator&{deviceMemory?:number}:null;
 const lowEnd=!!opts.coarse&&((nav?.hardwareConcurrency??8)<=4||(nav?.deviceMemory??8)<=3);
 const dpr=()=>Math.min(window.devicePixelRatio||1,opts.coarse?Math.min(1.5,tierSettings().maxPixelRatio):Math.min(2,tierSettings().maxPixelRatio));
 /** 60 fps, or 30 under reduced motion / a slow heat tier / a low-end phone. */
 const frameMs=()=>{const t=tierSettings();return reduced||lowEnd||t.cap30Everywhere?Math.max(1000/30,t.frameMs):1000/60;};
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(28,1,.05,40);
 // Round 3A rig (toon toys): hemisphere + one key, unchanged.
 const legacy=new T.Group();legacy.add(new T.HemisphereLight(0xffffff,0xd9cdb5,1.5));{const k=new T.DirectionalLight(0xffffff,1.6);k.position.set(-2.2,4,3.2);legacy.add(k);}scene.add(legacy);
 // Round 3B studio (HD toys): a shadow-casting key, a cool fill, a warm rim from behind, a low hemisphere; plus a PMREM room.
 const studio=new T.Group();studio.visible=false;scene.add(studio);
 const sKey=new T.DirectionalLight(0xfff6ea,2.4);sKey.position.set(-1.6,3.6,2.4);sKey.castShadow=true;
 sKey.shadow.mapSize.set(opts.coarse?512:1024,opts.coarse?512:1024);sKey.shadow.radius=6;sKey.shadow.bias=-.0006;sKey.shadow.normalBias=.02;
 const sFill=new T.DirectionalLight(0xdfe9ff,.7);sFill.position.set(2.6,1.4,2);const sRim=new T.DirectionalLight(0xffe2b8,2.2);sRim.position.set(1.2,2.2,-3.2);
 const sHemi=new T.HemisphereLight(0xffffff,0xe6dccb,.45);studio.add(sKey,sKey.target,sFill,sRim,sHemi);
 const floorMat=new T.ShadowMaterial({opacity:.2,depthWrite:false}),floor=new T.Mesh(new T.CircleGeometry(1,48),floorMat);floor.rotation.x=-Math.PI/2;floor.position.y=.001;floor.receiveShadow=true;floor.visible=false;scene.add(floor);
 // The tray: a soft cream plate under the toy that shows while pieces or capsule halves are out on it.
 const trayMat=new T.MeshBasicMaterial({color:'#e9dcc0',transparent:true,opacity:0,depthWrite:false,toneMapped:false}),tray=new T.Mesh(new T.CircleGeometry(1,64),trayMat);tray.rotation.x=-Math.PI/2;tray.position.y=.0005;tray.visible=false;tray.renderOrder=-1;scene.add(tray);
 let env:T.WebGLRenderTarget|null=null,pmrem:T.PMREMGenerator|null=null;
 function ensureEnv(){if(env||!real)return;try{pmrem=new T.PMREMGenerator(renderer as T.WebGLRenderer);const room=new RoomEnvironment();env=pmrem.fromScene(room,.04);room.traverse(o=>{const m=o as T.Mesh;if(m.isMesh){m.geometry.dispose();(m.material as T.Material).dispose();}});pmrem.dispose();pmrem=null;}catch{env=null;}}
 const turntable=new T.Group();scene.add(turntable);
 // Contact shadow: the museum's soft ellipse (one tiny canvas texture).
 let shadowTex:T.Texture;
 try{const sc=document.createElement('canvas');sc.width=sc.height=128;const g=sc.getContext('2d');if(g){const grad=g.createRadialGradient(64,64,0,64,64,64);grad.addColorStop(0,'rgba(36,48,40,.42)');grad.addColorStop(.45,'rgba(36,48,40,.16)');grad.addColorStop(1,'rgba(36,48,40,0)');g.fillStyle=grad;g.fillRect(0,0,128,128);}shadowTex=new T.CanvasTexture(sc);}
 catch{shadowTex=new T.DataTexture(new Uint8Array([0,0,0,60]),1,1);}
 const shadow=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.002;scene.add(shadow);
 // Particles (sparkle / steam / bubbles / petals / confetti / crumbs): one instanced mesh, 64 slots, shown only while a burst lives.
 const FX_N=64,fxGeo=new T.OctahedronGeometry(.035,0),fxMat=new T.MeshBasicMaterial({color:0xffffff,toneMapped:false}),fx=new T.InstancedMesh(fxGeo,fxMat,FX_N);fx.visible=false;fx.frustumCulled=false;fx.count=0;scene.add(fx);
 type AnyFx=FxKind|KindFx;type P={life:number;max:number;p:T.Vector3;v:T.Vector3;s:number;kind:AnyFx;c:string;rot:number};const parts:P[]=[];const fxM=new T.Matrix4(),fxQ=new T.Quaternion(),fxS=new T.Vector3(),fxC=new T.Color(),fxE=new T.Euler();
 const FX_COLOR:Record<string,string>={sparkle:'#ffd447',puff:'#ffffff',bubbles:'#bfe9ff',petal:'#ffb7c9',crumb:'#fffaf0'};
 const CONFETTI=['#ff6b6b','#ffd447','#4fc3f7','#7bd389','#ff9ad5','#ffffff'];

 const voice=opts.voice??createToyVoice();
 let rig:ToyRig|null=null,anim:ToyAnimator|null=null,behaviour:ToyBehaviour|null=null,kinds:KindRuntime|null=null,generic=false,toyId='';
 let yaw=-.35,yawV=0,pitch=.14,pitchV=0,zoom=1,zoomTo=1,held=false,pressure=0,pressureV=0,holding=false,idleMix=reduced?0:1;
 let lastInput=performance.now(),frame=0,last=0,slot=0,paused=false,disposed=false,fitDist=4,center=new T.Vector3(0,.5,0),lastYaw=yaw,yawW=0,yawAcc=0,extentNow=0;
 const ray=new T.Raycaster(),ndc=new T.Vector2();

 function burst(kind:AnyFx,at?:T.Vector3){if(!rig)return;const n=reduced?4:kind==='petal'?5:kind==='confetti'?28:kind==='crumb'?8:10,h=rig.height;
  for(let i=0;i<n;i++){if(parts.length>=FX_N)parts.shift();const a=Math.random()*Math.PI*2,r=rig.radius*(kind==='petal'?.6:.9);
   const p=at?turntable.worldToLocal(at.clone()).add(new T.Vector3((Math.random()-.5)*.1,(Math.random()-.5)*.1,(Math.random()-.5)*.1)):new T.Vector3(Math.cos(a)*r*.6,kind==='petal'?h+.5:kind==='confetti'?h*.9:h*(.5+Math.random()*.5),Math.sin(a)*r*.6);
   const v=kind==='sparkle'?new T.Vector3(Math.cos(a)*.9,.6+Math.random()*.6,Math.sin(a)*.9):kind==='petal'?new T.Vector3((Math.random()-.5)*.25,-.32,(Math.random()-.5)*.2)
    :kind==='confetti'?new T.Vector3(Math.cos(a)*(.6+Math.random()*.8),1.6+Math.random()*1.4,Math.sin(a)*(.6+Math.random()*.8)):kind==='crumb'?new T.Vector3(Math.cos(a)*.5,.5+Math.random()*.5,Math.sin(a)*.5)
    :new T.Vector3((Math.random()-.5)*.2,.5+Math.random()*.4,(Math.random()-.5)*.2);
   parts.push({life:0,max:kind==='petal'?2.4:kind==='confetti'?1.8:kind==='sparkle'?.7:kind==='crumb'?.9:1.1,p,v,s:kind==='bubbles'?1.4:kind==='puff'?1.8:kind==='confetti'?1.1:kind==='crumb'?.5:1,kind,
    c:kind==='confetti'?CONFETTI[i%CONFETTI.length]:FX_COLOR[kind]??'#ffffff',rot:Math.random()*6});}
  wake();}
 function setGlow(g:number){if(!rig)return;for(const m of rig.materials)(m as T.MeshToonMaterial).emissiveIntensity=g;}
 function onKind(e:KindEvent,detail?:string){const s=e==='dent'&&detail==='crackle'?['k_crackle']:KIND_SOUND[e];if(s){voice.unlock();voice.say(`kind:${e}`,s);}
  if(e==='complete'&&anim)anim.play(['hop','glow'],performance.now()/1000);if(e==='reveal'&&anim)anim.play(['glow'],performance.now()/1000);
  opts.onEvent?.(e,detail);touch();}

 function fit(){if(!rig)return;
  // Measure with the turntable square (QA Nov 8 2026): setFromObject is world space, so a turned table (the opening yaw, or the
  // yaw left over from the toy before) skewed the centring and an asymmetric toy spun off its own axis.
  const spun=turntable.rotation.y;turntable.rotation.y=0;turntable.updateMatrixWorld(true);
  const box=new T.Box3().setFromObject(rig.root),c=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());
  // The turning radius, from the vertices (QA Nov 8 2026): the box's half-diagonal over-reserved width for round and flat toys.
  let spinR=.2;const vv=new T.Vector3();for(const m of rig.meshes){const p=m.geometry.getAttribute('position');for(let i=0;i<p.count;i++){vv.fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);spinR=Math.max(spinR,Math.hypot(vv.x-c.x,vv.z-c.z));}}
  turntable.rotation.y=spun;turntable.updateMatrixWorld(true);
  // Centre the toy on the turntable (x/z) so it spins about itself.
  rig.root.position.x-=c.x;rig.root.position.z-=c.z;rig.root.updateMatrixWorld(true);anim=createToyAnimator(rig.root,rig.parts,{reduced,onFx:k=>burst(k),setGlow});
  kinds=rig.hd?createKindRuntime(rig,{reduced,emit:onKind,fx:(k,at)=>burst(k,at),startOpen:opts.opened?.(rig.toy.id),say:refs=>{voice.unlock();voice.say('kind:pose',refs);}}):null;
  baseR=spinR;extentNow=spinR;dims.set(spinR,rig.hd?Math.max(size.y,.92):size.y,0);// HD: a short, wide toy (a bun) is framed like a 1-tall one, never zoomed past the cardcenter.set(0,size.y*.5,0);fitCamera();
  shadow.scale.set(Math.max(size.x,size.z)*1.5+.3,Math.max(size.x,size.z)*1.2+.3,1);
  // HD: the studio, the room reflection, the floor shadow fitted to the toy and its tray.
  const hd=rig.hd;legacy.visible=!hd;studio.visible=hd;floor.visible=hd;
  if(renderer.toneMapping!==undefined||real){renderer.toneMapping=hd?T.NeutralToneMapping:T.NoToneMapping;renderer.toneMappingExposure=1;}
  if(hd){ensureEnv();scene.environment=env?.texture??null;scene.environmentIntensity=.55;const R=Math.max(1.2,spinR+1);floor.scale.setScalar(R*1.6);
   const cam=sKey.shadow.camera;cam.left=cam.bottom=-R;cam.right=cam.top=R;cam.near=.5;cam.far=10;cam.updateProjectionMatrix();sKey.target.position.set(0,size.y*.4,0);}
  else scene.environment=null;}
 /** Frame the toy: about half the screen tall, at most ~62 % of the width (so a tall phone never crops it), the card below. */
 const dims=new T.Vector3(.5,1,0);let baseR=.5;
 let insetTop=-1,insetBottom=-1;
 /** Free height between the header and the card, as a fraction of the canvas (1 when no insets were given: round 3A framing). */
 const freeFrac=()=>{const h=canvas.clientHeight||window.innerHeight||1;return insetBottom<0?1:Math.max(.3,Math.min(1,(h-insetTop-insetBottom)/h));};
 function fitCamera(){const t=Math.tan(T.MathUtils.degToRad(camera.fov/2)),aspect=Math.max(.3,camera.aspect);
  // The toy takes about half the screen height (59 % on a tall phone), never more than ~74 % of the free space above the card.
  const frac=Math.min(aspect<1?.59:.5,.74*freeFrac());fitDist=Math.max(dims.y/(2*t*frac),dims.x/(.7*t*aspect),1.2);}
 function resize(){const w=canvas.clientWidth||window.innerWidth,h=canvas.clientHeight||window.innerHeight;renderer.setPixelRatio(dpr());renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);
  camera.fov=w<h?34:28;
  // Leave room under the toy for the name card: the toy sits a little above centre (or centred in the free space between the insets).
  const off=insetBottom<0?h*(w<h?.08:.07):(insetBottom-insetTop)/2;
  camera.setViewOffset(w,h,0,Math.round(off),w,h);camera.updateProjectionMatrix();fitCamera();wake();}
 function place(){const d=fitDist/zoom;camera.position.set(center.x,center.y+Math.sin(pitch)*d,Math.cos(pitch)*d);camera.lookAt(center);}

 function step(now:number){
  frame=0;if(disposed||paused)return;
  const interval=frameMs(),next=frameCapSlot(now,slot,interval);if(next<0){frame=requestAnimationFrame(step);return;}slot=next;
  const dt=Math.min(.05,last?(now-last)/1000:1/60);last=now;const sec=now/1000;
  if(!held){yaw+=yawV*dt;pitch+=pitchV*dt;const k=Math.exp(-dt*2.6);yawV*=k;pitchV*=Math.exp(-dt*6);}
  pitch=Math.min(PITCH_MAX,Math.max(PITCH_MIN,pitch));turntable.rotation.y=yaw;
  {const w=(yaw-lastYaw)/Math.max(.001,dt);yawAcc=yawAcc*.6+((w-yawW)/Math.max(.001,dt))*.4;yawW=w;lastYaw=yaw;}
  zoom+=(zoomTo-zoom)*Math.min(1,dt*12);
  // Squeeze: pressure follows the hold; on release a spring overshoots back (the "puff back"), at rest in about half a second.
  if(holding){pressure+=(1-pressure)*Math.min(1,dt*7);pressureV=0;}else if(pressure!==0||pressureV!==0){pressureV+=(-pressure*256-pressureV*16)*dt;pressure+=pressureV*dt;if(Math.abs(pressure)<.002&&Math.abs(pressureV)<.02){pressure=0;pressureV=0;}}
  const since=now-lastInput;if(reduced)idleMix=0;else if(since<IDLE_MS)idleMix=Math.min(1,idleMix+dt*.8);else idleMix=Math.max(0,idleMix-dt*.6);
  const p=Math.max(-.4,Math.min(1,pressure))*(reduced?.4:1);
  // The soft body takes the squeeze on soft HD toys; everything else squashes the pose root (round 3A).
  const softTakes=!!kinds?.soft;
  let moving=anim?anim.update(sec,softTakes?0:p,idleMix):false;
  if(kinds&&kinds.update(dt,p,yawAcc))moving=true;
  // The tray: the camera backs off while pieces or capsule halves are out (and comes back in when they are home).
  if(kinds){const want=Math.max(baseR,kinds.extent());if(Math.abs(want-extentNow)>.002){extentNow+=(want-extentNow)*Math.min(1,dt*3);dims.x=extentNow;fitCamera();moving=true;}
   const k=Math.min(1,Math.max(0,(extentNow-baseR)/.25));tray.visible=k>.01;trayMat.opacity=.6*k;tray.scale.setScalar(extentNow+.18);}
  // Particles.
  for(let i=parts.length-1;i>=0;i--){const q=parts[i];q.life+=dt;if(q.life>=q.max){parts.splice(i,1);continue;}q.p.addScaledVector(q.v,dt);
   if(q.kind==='sparkle')q.v.y-=dt*1.6;if(q.kind==='confetti'){q.v.y-=dt*3.2;q.v.multiplyScalar(Math.exp(-dt*1.4));q.rot+=dt*9;if(q.p.y<.01){q.p.y=.01;q.v.set(0,0,0);}}
   if(q.kind==='crumb'){q.v.y-=dt*4;if(q.p.y<.01){q.p.y=.01;q.v.set(0,0,0);}}if(q.kind==='petal'){q.p.x+=Math.sin(q.life*3+i)*dt*.12;}}
  fx.count=parts.length;fx.visible=parts.length>0;
  parts.forEach((q,i)=>{const k=1-q.life/q.max,sz=q.s*(q.kind==='sparkle'?k:q.kind==='confetti'?Math.min(1,k*3):Math.min(1,q.life*6)*(.5+.5*k));
   if(q.kind==='confetti'){fxQ.setFromEuler(fxE.set(q.rot,q.rot*.7,0));fxM.compose(fxV.copy(q.p).applyMatrix4(turntable.matrixWorld),fxQ,fxS.set(sz*1.4,sz*.15,sz));}
   else{fxQ.setFromAxisAngle(fxS.set(0,1,0),q.life*4+i);fxM.compose(fxV.copy(q.p).applyMatrix4(turntable.matrixWorld),fxQ,fxS.set(sz,q.kind==='petal'?sz*.4:sz,sz));}
   fx.setMatrixAt(i,fxM);fx.setColorAt(i,fxC.set(q.c));});
  if(parts.length){fx.instanceMatrix.needsUpdate=true;if(fx.instanceColor)fx.instanceColor.needsUpdate=true;}
  place();renderer.render(scene,camera);opts.onFrame?.();
  const spinning=Math.abs(yawV)>.004||Math.abs(pitchV)>.004,zooming=Math.abs(zoomTo-zoom)>.002,squeezing=holding||pressure!==0;
  if(held||spinning||zooming||squeezing||moving||parts.length>0||idleMix>0||kinds?.grabbing())frame=requestAnimationFrame(step);else{last=0;slot=0;}
 }
 const fxV=new T.Vector3();
 function wake(){if(!frame&&!disposed&&!paused&&!lostCtx){last=0;slot=0;frame=requestAnimationFrame(step);}}
 const touch=()=>{lastInput=performance.now();wake();};
 const vis=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;api.releaseAll();}else wake();};document.addEventListener('visibilitychange',vis);
 // WebGL context loss (QA Nov 8 2026): stop drawing while lost; three re-uploads on restore, but the loop was asleep, so draw again.
 let lostCtx=false;const onLost=()=>{lostCtx=true;cancelAnimationFrame(frame);frame=0;},onRestored=()=>{lostCtx=false;resize();wake();};
 canvas.addEventListener?.('webglcontextlost',onLost);canvas.addEventListener?.('webglcontextrestored',onRestored);
 const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;ro?.observe(canvas);resize();

 const visibleChain=(o:T.Object3D|null)=>{while(o){if(!o.visible)return false;o=o.parent;}return true;};
 function setRay(x:number,y:number){const r=canvas.getBoundingClientRect();ndc.set((x-r.left)/Math.max(1,r.width)*2-1,-((y-r.top)/Math.max(1,r.height))*2+1);
  place();camera.updateMatrixWorld();turntable.updateMatrixWorld(true);ray.setFromCamera(ndc,camera);}
 function pick(x:number,y:number){if(!rig)return null;setRay(x,y);return ray.intersectObjects(rig.meshes,false).find(h=>visibleChain(h.object))??null;}
 const partChain=(name:string)=>{const out:string[]=[];let o:T.Object3D|null|undefined=rig?.parts.get(name);while(o&&o!==rig?.root){if(o.name)out.push(o.name);o=o.parent;}return out;};
 const project=(p:T.Vector3)=>{const c=p.clone().project(camera),r=canvas.getBoundingClientRect();return {x:r.left+(c.x+1)/2*r.width,y:r.top+(1-c.y)/2*r.height};};
 const view=(x:number,y:number)=>({ray:ray.ray,x,y,camera,project,wpp:(p:T.Vector3)=>{const d=camera.position.distanceTo(p),h=canvas.clientHeight||window.innerHeight||800;return 2*d*Math.tan(T.MathUtils.degToRad(camera.fov/2))/Math.max(1,h);}});
 let grabbing:GrabKind=null;

 const api:ToyViewer={
  show(id){if(disposed)return false;if(rig){kinds?.dispose();kinds=null;rig.dispose();anim?.clear();}holding=false;pressure=pressureV=0;grabbing=null;
   const r=buildToy(id)??opts.lab?.build(id)??null;if(!r)return false;rig=r;behaviour=r.behaviour;toyId=id;
   generic=opts.lab?.plan(id)?false:toyBuilder(r.toy).generic;
   turntable.add(r.root);fit();place();touch();return true;},
  grab(){held=true;yawV=pitchV=0;touch();},
  drag(dx,dy){const h=canvas.clientHeight||1,k=4.2/h;yaw+=dx*k;pitch+=dy*k*.6;pitch=Math.min(PITCH_MAX,Math.max(PITCH_MIN,pitch));touch();},
  release(vx,vy){held=false;const h=canvas.clientHeight||1,k=4.2/h;yawV=reduced?0:Math.max(-14,Math.min(14,vx*k));pitchV=reduced?0:vy*k*.3;touch();},
  zoom(f){zoomTo=Math.min(ZOOM_MAX,Math.max(ZOOM_MIN,zoomTo*f));touch();},
  hit(x,y){return !!pick(x,y);},
  pointerDown(x,y){if(!kinds||!rig)return null;const h=pick(x,y);setRay(x,y);const g=kinds.down(view(x,y),h?String(h.object.userData.part??'body'):null,h?.point);grabbing=g;if(g)touch();return g;},
  pointerMove(x,y){if(!kinds||!grabbing)return;setRay(x,y);kinds.move(view(x,y));touch();},
  pointerUp(){if(!kinds||!grabbing)return;grabbing=null;kinds.up();touch();},
  pointerCancel(){if(!kinds||!grabbing)return;grabbing=null;kinds.cancel();touch();},
  holdStart(){if(!rig||holding)return;voice.unlock();
   if(kinds?.holdWinds()){kinds.holdStart();touch();return;}
   if(kinds&&kinds.spec?.kind==='capsule'&&!kinds.can().opened){kinds.poke('capsule',new T.Vector3(),new T.Vector3(0,0,1));touch();return;}
   holding=true;voice.say('hold',kinds?.soft?['k_squelch']:['squeak']);touch();},
  holdEnd(){kinds?.holdEnd();if(!holding){touch();return;}holding=false;// the pressure spring takes it from here, every time
   if(anim&&behaviour){anim.play(releaseRefs(asList(behaviour.squeeze)),performance.now()/1000);voice.say('squeeze',kinds?.soft?['k_puffback',...behaviour.voice.squeeze.slice(0,1)]:behaviour.voice.squeeze);}
   kinds?.released();touch();},
  rub(dx,dy){if(holding)kinds?.rub(dx,dy);touch();},
  flick(vx){const s=!!kinds?.flick(vx);if(s){yawV=0;touch();}return s;},
  releaseAll(){held=false;if(grabbing){grabbing=null;kinds?.up();}if(holding||kinds)api.holdEnd();},
  tap(x,y){const h=pick(x,y);if(!h||!rig||!anim||!behaviour)return null;const part=String(h.object.userData.part??'body'),chain=partChain(part);
   const local=rig.root.worldToLocal(h.point.clone());
   if(kinds){const n=(h.face?.normal??new T.Vector3(0,0,1)).clone().transformDirection(h.object.matrixWorld);const inv=new T.Quaternion();rig.root.getWorldQuaternion(inv).invert();n.applyQuaternion(inv);
    // Model space = root-local plus the centring offset the fit applied.
    const pm=local.clone();if(kinds.poke(part,pm,n)){voice.unlock();touch();return {kind:'poke',part,refs:[]};}}
   const head=behaviour.head??'head',poke=behaviour.poke;const map=(typeof poke==='object'&&!Array.isArray(poke))?poke as Readonly<Record<string,string|readonly string[]>>:null;
   const isHead=typeof head==='string'?chain.includes(head):local.y>head.above;
   let kind:'poke'|'tap'='poke',refs:readonly string[];
   if(map&&map[part]&&!(typeof head==='string'&&part===head))refs=asList(map[part]);
   else if(isHead){kind='tap';refs=asList(behaviour.tap);}
   else{const key=map?chain.find(c=>map[c])??'default':null;refs=map?asList(map[key!]??map.default??['jiggle']):asList(poke as string|readonly string[]);}
   anim.play(refs,performance.now()/1000);voice.unlock();voice.say(kind,kind==='tap'?behaviour.voice.tap:behaviour.voice.poke);touch();
   return {kind,part,refs};},
  action(a){const s=kinds?.action(a)??null;if(s)touch();return s;},
  kind(){if(!rig)return null;const lab=opts.lab?.plan(rig.toy.id)??null,plan=lab??kindPlan(rig.toy.id);if(!plan)return null;const can=kinds?.can()??null;
   const hint=plan.kind==='mechanism'&&can?.mechs.length?can.mechs[0].hint:TOY_KINDS[plan.kind].hint;
   return {kind:plan.kind,bonus:plan.bonus,live:rig.hd&&(!!lab||KIND_LIVE.has(rig.toy.machine)),hint,can};},
  setInsets(top,bottom){if(Math.abs(top-insetTop)<2&&Math.abs(bottom-insetBottom)<2)return;insetTop=Math.max(0,top);insetBottom=Math.max(0,bottom);resize();},
  happy(){if(!anim||!behaviour)return;anim.play(['hop','sparkle'],performance.now()/1000+.15);voice.say('open',behaviour.voice.tap);touch();},
  setPaused(p){paused=p;if(p){cancelAnimationFrame(frame);frame=0;api.releaseAll();}else wake();},
  resize,
  stats(){const lights=(rig?.hd?4:2);const mem=renderer.info?.memory;
   return {draws:(rig?.stats.draws??0)+1+(parts.length?1:0)+(rig?.hd?1:0),triangles:rig?.stats.triangles??0,generic,running:frame!==0,voices:voice.active(),hd:!!rig?.hd,
    pressure,squash:rig?rig.root.scale.y:1,deform:kinds?.soft?.energy()??0,frameMs:frameMs(),memory:mem?{geometries:mem.geometries,textures:mem.textures}:null,lights};},
  rig:()=>rig,
  probe:()=>kinds?.probe()??null,
  screenOf(part){const o=rig?.parts.get(part);if(!o)return null;place();camera.updateMatrixWorld();turntable.updateMatrixWorld(true);const b=new T.Box3().setFromObject(o),c=b.getCenter(new T.Vector3()).project(camera),r=canvas.getBoundingClientRect();
   return {x:r.left+(c.x+1)/2*r.width,y:r.top+(1-c.y)/2*r.height};},
  dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);frame=0;ro?.disconnect();document.removeEventListener('visibilitychange',vis);
   canvas.removeEventListener?.('webglcontextlost',onLost);canvas.removeEventListener?.('webglcontextrestored',onRestored);
   voice.dispose();kinds?.dispose();kinds=null;rig?.dispose();rig=null;anim=null;parts.length=0;shadowTex.dispose();shadow.geometry.dispose();(shadow.material as T.Material).dispose();fxGeo.dispose();fxMat.dispose();fx.dispose();
   floor.geometry.dispose();floorMat.dispose();tray.geometry.dispose();trayMat.dispose();sKey.shadow.map?.dispose();sKey.dispose();env?.dispose();env=null;scene.environment=null;
   scene.clear();renderer.dispose();try{renderer.forceContextLoss?.();}catch{/* already lost */}},
 };
 void toyId;
 return api;
}
