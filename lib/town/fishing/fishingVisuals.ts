import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {FISH_SPOTS,SHADOW_LENGTH,type FishShape,type ShadowSize} from './fishCatalog';
import {createFishingWater} from './shoreWater';
import {createFishSchools} from './fishSchools';
import {speciesModel,releaseSpeciesModels,type ShadowKind,type SpeciesModel} from './fishModels';
import {patchUnderwater,seabedStyle,uwDepthAt,UW_SURFACE} from './underwater';
import {graphicsQuality} from '../../graphics/quality';

/**
 * FISHING VISUALS — original shoreline art behind a small interface (hand-off: docs/fishing-visuals-HANDOFF.md).
 *
 * Contains NO game logic: lib/town/fishing/fishingWorld.ts drives it from the state machine (fishingCore.ts). The graphics
 * agent may replace everything in this file as long as `FishingVisuals` keeps its shape and behaviour contract.
 * Lifecycle: created only when the player comes near a fishing spot (or starts fishing) and disposed after they leave;
 * `frame()` is called only while `busy` is true (a session is running or effects are fading), so idle cost is zero.
 */
export type Vec2={x:number;z:number};
export type FishingPose='hold'|'windup'|'cast'|'strike'|'holdUp';
export type BobberState={kind:'hanging'}|{kind:'flying';progress:number}|{kind:'floating'}|{kind:'reeling';progress:number}|{kind:'under'}|{kind:'hidden'};
export type CatchLook={color:string;lengthCm:number;shape?:FishShape;id?:string};
export interface FishingVisuals{
 /** Show the rod/line/float for an angler at `stand` casting along unit `dir` to world point `cast`. */
 begin(stand:Vec2,cast:Vec2,dir:Vec2):void;
 /** Hide everything of the session (effects may finish fading). */
 end():void;
 /** Arm/rod pose for the current beat. */
 setPose(pose:FishingPose):void;
 /** Where the float is. `flying.progress` is 0..1 of the cast arc (CAST_TIME seconds). */
 setBobber(state:BobberState):void;
 /** One-shot beats. */
 splash(size:'land'|'bite'|'hook'|'small'):void;
 nibble():void;
 /** The fish shadow (or null to hide): size class, position relative to the float, heading (radians, yaw), 0..1 opacity. */
 /* `shape` (optional, Oct 5 2026) picks a cheap silhouette: sharks, rays, octopus/squid and crabs read differently from a fish. */
 /* `id` / `color` (optional, Oct 12 2026): in the clear water the catch is drawn as its own species, with the shadow on the seabed. */
 /* `mode` (optional, Oct 12 2026): while it nibbles and bites, the swimming catch comes up under the float, nose up at the bait. */
 showShadow(shadow:{size:ShadowSize;pos:Vec2;heading:number;alpha:number;shape?:FishShape;id?:string;color?:string;mode?:'swim'|'nibble'|'bite'|'flee'}|null):void;
 /** The held-up catch above the angler (or null). */
 /* `shape` (optional, added Sep 28 2026 by the fishing agent for the new sea animals: crab, ray, eel, seahorse …) is
    fishCatalog's FishShape so the art can tell a crab from a fish. `id` (optional, Oct 5 2026) picks the species' own model
    (fishModels.ts): a shrimp looks like a shrimp, a haddock has its thumbprint. Without it the shape picks a generic animal. */
 setReelingFish(fish:CatchLook|null):void;
 holdUpFish(fish:CatchLook|null):void;
 /** Near a spot (45 m). Since Oct 12 2026 the shore is the moving water built when a session begins (shoreWater.ts); kept for the driver. */
 setCoastVisible(visible:boolean):void;
 /** World point for the in-world catch label (above the angler's head). */
 labelAnchor(out:T.Vector3):T.Vector3;
 /** Per-frame animation (only called while `busy`). */
 frame(dt:number,elapsed:number,reduced:boolean):void;
 readonly busy:boolean;
 dispose():void;
}

const SURFACE=-.398,ROD=1.7,LINE_N=20;
/** The catch material: flat-shaded vertex colours, with a vertex-shader wag (no CPU vertex work) and per-vertex glow. */
type FishFx={material:T.MeshStandardMaterial;setAnim(a:SpeciesModel['anim']):void;drive(phase:number,amp:number):void};
function fishMaterial(underwater=false):FishFx{
 const u={uPhase:{value:0},uAmp:{value:0},uStart:{value:0},uSpan:{value:.5},uAxis:{value:new T.Vector3(1,0,0)},uDir:{value:new T.Vector3(0,0,1)},uK:{value:new T.Vector3(5,0,0)}};
 const material=new T.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.55,metalness:0,side:T.DoubleSide,transparent:underwater});
 material.onBeforeCompile=sh=>{Object.assign(sh.uniforms,u);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uPhase,uAmp,uStart,uSpan;uniform vec3 uAxis,uDir,uK;attribute float glow;varying float vGlow;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvGlow=glow;{float w=clamp((dot(position,uAxis)-uStart)/uSpan,0.,1.);transformed+=uDir*(uAmp*w*w*sin(uPhase-dot(position,uK)));}');
  // A soft self-lift keeps the toon colours bright in the low camera; glow (photophores, lures) shines.
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vGlow;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vColor.rgb*(.12+vGlow*1.4);');
  // The catch swimming under the clear water: tinted by its depth like the coral and the ambient fish (underwater.ts).
  if(underwater)patchUnderwater(sh);
 };
 material.customProgramCacheKey=()=>underwater?'fishing-catch-wag-under-v1':'fishing-catch-wag-v1';
 return {material,setAnim(a){u.uAxis.value.set(...a.axis);u.uDir.value.set(...a.dir).normalize();u.uK.value.set(...a.k);u.uStart.value=a.start;u.uSpan.value=a.span;},drive(phase,amp){u.uPhase.value=phase;u.uAmp.value=amp;}};
}
/** How far the held model's lowest point hangs below its origin, in model units (octopus arms, seahorse tails). */
function liftWhenHeld(m:SpeciesModel){
 if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();
 const box=m.geometry.boundingBox!.clone().applyMatrix4(new T.Matrix4().makeRotationFromEuler(new T.Euler(m.hold.x,0,m.hold.z+.15,'YZX')));
 return Math.max(0,-box.min.y-.15);
}
const shadowKind=(shape?:FishShape):ShadowKind=>shape==='shark'||shape==='hammerhead'?'shark':shape==='ray'?'ray':shape==='octopus'||shape==='squid'?'octopus':shape==='crab'||shape==='lobster'||shape==='shell'?'crab':'fish';
/** Flat top-view silhouettes, head toward -Z after the rotation (the swim code bends +Z, the tail). */
function silhouette(kind:ShadowKind){
 const parts:T.BufferGeometry[]=[];const shape=(pts:[number,number][])=>{const s=new T.Shape(pts.map(([x,y])=>new T.Vector2(x,y)));parts.push(new T.ShapeGeometry(s).toNonIndexed());};
 if(kind==='fish'){parts.push(new T.CircleGeometry(.5,24).scale(.42,1,1).toNonIndexed(),new T.CircleGeometry(.16,3).rotateZ(Math.PI/2).translate(0,-.56,0).scale(1.1,1,1).toNonIndexed());}
 else if(kind==='shark')shape([[0,.55],[.1,.35],[.13,.15],[.42,-.05],[.44,-.12],[.12,-.04],[.07,-.4],[.25,-.66],[.18,-.7],[0,-.5],[-.18,-.7],[-.25,-.66],[-.07,-.4],[-.12,-.04],[-.44,-.12],[-.42,-.05],[-.13,.15],[-.1,.35]]);
 else if(kind==='ray'){shape([[0,.42],[.5,.0],[.05,-.22],[.02,-.7],[-.02,-.7],[-.05,-.22],[-.5,0]]);}
 else if(kind==='octopus'){parts.push(new T.CircleGeometry(.2,14).scale(1,1.2,1).translate(0,.28,0).toNonIndexed());for(let i=0;i<8;i++){const a=-Math.PI*.85+i/7*Math.PI*.7;shape([[Math.sin(a)*.06-.03,.1],[Math.sin(a)*.06+.03,.1],[Math.sin(a)*.45,-.55+Math.abs(i-3.5)*.04]]);}}
 else {parts.push(new T.CircleGeometry(.24,12).scale(1.3,.8,1).toNonIndexed());for(const s of [1,-1]){for(let i=0;i<4;i++)shape([[s*.25,.1-i*.08],[s*.5,.18-i*.14],[s*.48,.14-i*.14],[s*.25,.06-i*.08]]);shape([[s*.15,.15],[s*.32,.42],[s*.2,.46],[s*.08,.18]]);}}
 for(const p of parts){p.deleteAttribute('uv');p.deleteAttribute('normal');}
 const g=mergeGeometries(parts)!;parts.forEach(p=>p.dispose());g.rotateX(-Math.PI/2);return g;
}

export function createFishingVisuals(scene:T.Scene,player:T.Object3D,renderer?:T.WebGLRenderer):FishingVisuals{
 const root=new T.Group();root.name='fishing-live';root.visible=false;scene.add(root);
 const geometries:T.BufferGeometry[]=[],materials:T.Material[]=[],textures:T.Texture[]=[];
 const keep=<G extends T.BufferGeometry>(g:G)=>{geometries.push(g);return g;},mat=<M extends T.Material>(m:M)=>{materials.push(m);return m;};
 const rod=new T.Mesh(keep(mergeGeometries([new T.CylinderGeometry(.006,.019,ROD,8,12).translate(0,ROD/2,0).toNonIndexed(),new T.CylinderGeometry(.037,.033,.28,8).translate(0,.14,0).toNonIndexed(),new T.CylinderGeometry(.065,.065,.055,12).rotateX(Math.PI/2).translate(0,.29,-.06).toNonIndexed(),new T.TorusGeometry(.027,.006,5,10).translate(0,ROD-.03,0).toNonIndexed()],true)!),[mat(new T.MeshStandardMaterial({color:'#213d49',roughness:.7})),mat(new T.MeshStandardMaterial({color:'#d9b27c',roughness:.9})),mat(new T.MeshStandardMaterial({color:'#bdc9c5',metalness:.4,roughness:.4})),mat(new T.MeshStandardMaterial({color:'#d6c99d',metalness:.35,roughness:.45}))]);rod.name='fishing-rod';rod.castShadow=true;root.add(rod);
 // A short crank shares the reel material; it only turns after accepted reel taps.
 const crank=new T.Mesh(keep(mergeGeometries([new T.CylinderGeometry(.009,.009,.11,6).translate(.04,.025,0).toNonIndexed(),new T.CylinderGeometry(.019,.019,.045,6).rotateX(Math.PI/2).translate(.04,.08,.016).toNonIndexed()])!),rod.material[2]);crank.name='fishing-reel-crank';crank.position.set(0,.29,-.1);rod.add(crank);
 const rodPositions=rod.geometry.getAttribute('position') as T.BufferAttribute,rodRest=new Float32Array(rodPositions.array);
 const rodNormals=rod.geometry.getAttribute('normal') as T.BufferAttribute,rodNormalRest=new Float32Array(rodNormals.array);
 let bend=0,lastBend=-1,rodTilt=.62,rightArm=-1.05,leftArm=0,reelTurn=0,reelImpulse=0;
 const linePos=new Float32Array(LINE_N*3),lineGeo=keep(new T.BufferGeometry());lineGeo.setAttribute('position',new T.BufferAttribute(linePos,3));
 const line=new T.Line(lineGeo,mat(new T.LineBasicMaterial({color:'#f5f1e4',transparent:true,opacity:.85})));line.name='fishing-line';line.frustumCulled=false;root.add(line);
 const bobber=new T.Mesh(keep(mergeGeometries([new T.SphereGeometry(.13,12,8,0,Math.PI*2,0,Math.PI/2).toNonIndexed(),new T.SphereGeometry(.13,12,8,0,Math.PI*2,Math.PI/2,Math.PI/2).toNonIndexed(),new T.CylinderGeometry(.016,.012,.2,6).translate(0,.19,0).toNonIndexed()],true)!),[mat(new T.MeshStandardMaterial({color:'#e0513f',roughness:.45})),mat(new T.MeshStandardMaterial({color:'#fff6e6',roughness:.45})),mat(new T.MeshStandardMaterial({color:'#ffe292',emissive:'#ffbd42',emissiveIntensity:.18}))]);root.add(bobber);
 const ringGeo=keep(new T.RingGeometry(.97,1,48));ringGeo.rotateX(-Math.PI/2);
 const rings=Array.from({length:5},()=>{const m=new T.Mesh(ringGeo,mat(new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0,depthWrite:false})));m.visible=false;m.renderOrder=2;root.add(m);return {mesh:m,age:1,life:1,size:1};});
 // Swimming shadow: one mesh; its silhouette geometry (fish / shark / ray / octopus / crab) is built once per kind on first use.
 const shadowGeos=new Map<ShadowKind,{geo:T.BufferGeometry;rest:Float32Array}>();
 const shadowGeo=(kind:ShadowKind)=>{let e=shadowGeos.get(kind);if(!e){const geo=keep(silhouette(kind));e={geo,rest:new Float32Array(geo.getAttribute('position').array)};shadowGeos.set(kind,e);}return e;};
 let shKind:ShadowKind='fish',{geo:shGeo,rest:shadowRest}=shadowGeo('fish');
 const shadowMat=mat(new T.MeshBasicMaterial({color:'#0d2a33',transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}));const shadow=new T.Mesh(shGeo,shadowMat);shadow.name='fishing-swimming-shadow';shadow.renderOrder=1;shadow.visible=false;root.add(shadow);
 // The catch: ONE mesh each for the held-up and the reeled animal, species geometry from fishModels.ts (cached, merged,
 // vertex-coloured), the tail wag / arm sway in the vertex shader (fishMaterial), so 2 draws instead of 12.
 const heldFx=fishMaterial(),reelFx=fishMaterial();mat(heldFx.material);mat(reelFx.material);
 const empty=keep(new T.BufferGeometry());
 const held=new T.Mesh(empty,heldFx.material);held.name='fishing-held-fish';held.castShadow=true;held.visible=false;root.add(held);
 const reeledFish=new T.Mesh(empty,reelFx.material);reeledFish.name='fishing-reeled-fish';reeledFish.visible=false;root.add(reeledFish);
 // Clear water (Oct 12 2026): the catch approaching the float is drawn as its own species under the surface (one more draw while it
 // is there), depth-tinted like the ambient fish; the dark silhouette becomes its shadow on the seabed, so the "fish shadow" cue stays.
 const catchFx=fishMaterial(true);mat(catchFx.material);
 const catchFish=new T.Mesh(empty,catchFx.material);catchFish.name='fishing-catch-swimmer';catchFish.renderOrder=.65;catchFish.visible=false;catchFish.raycast=()=>{};root.add(catchFish);
 let heldModel:SpeciesModel|null=null,reelModel:SpeciesModel|null=null,catchModel:SpeciesModel|null=null,heldLift=0;
 // The catch's bite pose (visual only; fishingCore's timings and cues are untouched): `biteBlend` eases it from where it swims to
 // under the float, nose up with its mouth at the hook; `peck` is the quick dart on each nibble, `lunge` the strong pull on the bite.
 const catchSwim={x:0,y:0,z:0,heading:0,len:1,depth:1,mode:'swim' as 'swim'|'nibble'|'bite'|'flee',alpha:0};let biteBlend=0,peck=0,lunge=0,catchYaw=0,catchFresh=true;
 const catchPos=new T.Vector3(),BITE_PITCH=.8;
 const look=(m:T.Mesh,fx:FishFx,f:CatchLook)=>{const model=speciesModel(f.id,f.shape,f.color);if(m.geometry!==model.geometry)m.geometry=model.geometry;fx.setAnim(model.anim);return model;};
 let swimPhase=0;
 const spray=new T.InstancedMesh(keep(new T.SphereGeometry(.035,6,4)),mat(new T.MeshBasicMaterial({color:'#e3fff9',transparent:true,opacity:.85,depthWrite:false})),12);spray.visible=false;spray.frustumCulled=false;root.add(spray);let sprayAge=1,spraySize=1,sprayX=0,sprayZ=0;const dropMatrix=new T.Object3D();

 // Moving water (Oct 12 2026): the swash, wet sand, caustics and swells round the active spot (shoreWater.ts, one strip draw + the
 // ocean's own draw) and ambient fish schools (fishSchools.ts, one instanced draw). Replaces the static foam / band / ripple decals.
 // ?fishwater=0 (A/B measurements only) leaves the shore still and the schools out.
 const waterOn=typeof window==='undefined'||new URLSearchParams(window.location.search).get('fishwater')!=='0';
 // Phones (every heat tier): fewer seabed props, a simpler fish body, no sway (underwater.ts / fishSchools.ts).
 const phone=typeof window!=='undefined'&&graphicsQuality().phone;
 const water=renderer&&waterOn?createFishingWater(scene,renderer,phone):null,schools=createFishSchools(scene,phone);
 let active=false,stand:Vec2={x:0,z:0},cast:Vec2={x:0,z:0},dir:Vec2={x:0,z:1},pose:FishingPose='hold',bobState:BobberState={kind:'hanging'},dip=0,shadowOn=false,heldFish:CatchLook|null=null;
 let reelTravel=0,landingAge=1,reelingFish:CatchLook|null=null;const landingFrom=new T.Vector3();
 const hv=new T.Vector3(),tip=new T.Vector3(),bob=new T.Vector3(),tmp=new T.Vector3();
 const rightShoulder=player.getObjectByName('right-shoulder'),leftShoulder=player.getObjectByName('left-shoulder'),rightHand=player.getObjectByName('right-hand'),head=player.getObjectByName('player-head');
 const reelDistance=()=>reelTravel;
 const ring=(size:number,life:number)=>{const r=rings.reduce((a,b)=>a.age/a.life>b.age/b.life?a:b);r.mesh.position.set(cast.x-dir.x*reelDistance(),SURFACE+.01,cast.z-dir.z*reelDistance());r.age=0;r.life=life;r.size=size;r.mesh.visible=true;};
 const ringsBusy=()=>rings.some(r=>r.mesh.visible)||sprayAge<.6;
 return {
  begin(s,c,d){const spot=FISH_SPOTS.reduce((a,b)=>Math.hypot(b.x-s.x,b.z-s.z)<Math.hypot(a.x-s.x,a.z-s.z)?b:a);
   const halfWidth=typeof window!=='undefined'&&window.innerWidth<window.innerHeight?4.5:9;
   water?.begin(s,d,spot,halfWidth);if(waterOn)schools.begin(s,d,water?.field?.distance??null,SURFACE-.003,halfWidth,seabedStyle(spot),spot.id);active=true;reelTravel=0;bend=0;rodTilt=.62;rightArm=-1.05;leftArm=0;reelImpulse=0;reelTurn=0;dip=0;reelingFish=null;stand={...s};cast={...c};dir={...d};root.visible=true;rod.visible=line.visible=bobber.visible=true;pose='hold';bobState={kind:'hanging'};},
  end(){water?.end();schools.end();active=false;rod.visible=line.visible=bobber.visible=false;shadow.visible=false;catchFish.visible=false;held.visible=false;reeledFish.visible=false;reelingFish=null;shadowOn=false;heldFish=null;if(!ringsBusy())root.visible=false;},
  setPose(p){pose=p;},
  setBobber(s){bobState=s;},
  splash(size){if(size==='bite')lunge=1;schools.scatter(cast.x-dir.x*reelDistance(),cast.z-dir.z*reelDistance(),size==='bite'||size==='hook'?1.2:size==='land'?1:.7);sprayAge=0;sprayX=cast.x-dir.x*reelDistance();sprayZ=cast.z-dir.z*reelDistance();spraySize=size==='bite'||size==='hook'?1.5:.7;if(size==='land')ring(.9,.9);else if(size==='bite'){ring(1.5,1.1);ring(.8,.7);ring(2.1,1.4);}else if(size==='hook'){ring(1.2,.8);ring(2.1,1.4);}else ring(.7,.7);},
  nibble(){dip=1;if(catchSwim.mode==='nibble')peck=1;if(bobState.kind==='reeling'){reelImpulse=1;ring(.8,.7);sprayAge=0;spraySize=.45;sprayX=cast.x-dir.x*reelDistance();sprayZ=cast.z-dir.z*reelDistance();}else ring(.55,.6);},
  showShadow(sh){shadowOn=!!sh&&sh.alpha>.01;shadow.visible=shadowOn;const clear=!!water?.field;catchFish.visible=shadowOn&&clear;if(!sh)return;
   const x=cast.x+sh.pos.x-dir.x*reelDistance(),z=cast.z+sh.pos.z-dir.z*reelDistance(),depth=clear?uwDepthAt(water!.field!.distance(x,z)):0;
   // Clear water: the silhouette lies on the seabed under the swimming catch; without the clear water (A/B) it stays at the surface.
   shadow.position.set(x,clear?UW_SURFACE-depth+.012:SURFACE-.001,z);shadow.renderOrder=clear?.58:1;// The silhouette head is local -Z; simulation headings point along +Z.
   const kind=shadowKind(sh.shape);if(kind!==shKind){shKind=kind;({geo:shGeo,rest:shadowRest}=shadowGeo(kind));shadow.geometry=shGeo;}
   shadow.rotation.y=sh.heading+Math.PI;shadow.scale.setScalar(SHADOW_LENGTH[sh.size]);shadowMat.opacity=(clear?.36:.5)*sh.alpha;
   if(clear){catchModel=look(catchFish,catchFx,{color:sh.color??'#8aa0a8',lengthCm:40,shape:sh.shape,id:sh.id});
    // The model's nose is local −X (see the reeled fish): face the heading. Near the surface, so it reads clearly over the seabed.
    // Placed in frame() (the bite pose eases in and out there); here only where it swims.
    Object.assign(catchSwim,{x,z,y:UW_SURFACE-Math.min(.42,Math.max(.2,depth-.25)),heading:sh.heading,len:SHADOW_LENGTH[sh.size]*.95,depth,mode:sh.mode??'swim',alpha:sh.alpha});
    catchFx.material.opacity=Math.min(1,sh.alpha*1.3);}
   else catchFresh=true;},
  setReelingFish(f){reelingFish=f;reeledFish.visible=!!f;if(f)reelModel=look(reeledFish,reelFx,f);},
  holdUpFish(f){if(f&&!heldFish){landingAge=0;landingFrom.copy(bob);}heldFish=f;held.visible=!!f;
   if(f){heldModel=look(held,heldFx,f);heldLift=liftWhenHeld(heldModel);}},
  setCoastVisible(){},
  labelAnchor(out){const hd=head;if(hd)hd.getWorldPosition(out);else out.set(stand.x,1.3,stand.z);out.y+=.55;return out;},
  get busy(){return active||ringsBusy()||!!water?.busy||schools.busy;},
  frame(dt,elapsed,reduced){
   if(sprayAge<.6){sprayAge+=dt;spray.visible=!reduced&&sprayAge<.6;for(let i=0;i<12&&spray.visible;i++){const a=i*Math.PI*2/12,t=sprayAge/.6,r=(.12+t*.65)*spraySize;dropMatrix.position.set(sprayX+Math.cos(a)*r,SURFACE+Math.sin(t*Math.PI)*(.3+(i%3)*.1)*spraySize,sprayZ+Math.sin(a)*r);dropMatrix.scale.setScalar((1-t)*(.7+(i%3)*.3));dropMatrix.updateMatrix();spray.setMatrixAt(i,dropMatrix.matrix);}if(spray.visible)spray.instanceMatrix.needsUpdate=true;}
   water?.frame(dt,reduced);schools.frame(dt,reduced,active&&(bobState.kind==='floating'||bobState.kind==='under'||bobState.kind==='reeling')?{x:bob.x,z:bob.z}:null);
   for(const r of rings){if(!r.mesh.visible)continue;r.age+=dt;const k=r.age/r.life;if(k>=1){r.mesh.visible=false;continue;}r.mesh.scale.setScalar(r.size*(.35+k*.9));(r.mesh.material as T.MeshBasicMaterial).opacity=.75*(1-k);}
   if(!active){if(!ringsBusy())root.visible=false;return;}
   dip=Math.max(0,dip-dt*4);const reelTarget=bobState.kind==='reeling'?Math.min(2.7,Math.hypot(cast.x-stand.x,cast.z-stand.z)*.5)*bobState.progress:0;reelTravel=reduced?reelTarget:reelTravel+(reelTarget-reelTravel)*(1-Math.exp(-dt*14));
   // Face the water and pose the arms (applied after the rig's own update each frame).
   player.rotation.y=Math.atan2(dir.x,dir.z);
   const reeling=bobState.kind==='reeling',ease=reduced?1:1-Math.exp(-dt*18);
   reelImpulse=Math.max(0,reelImpulse-dt*3.6);reelTurn+=reduced?0:dt*reelImpulse*24;
   const armTarget=pose==='holdUp'?-2.7:pose==='windup'?-2.4:pose==='cast'?-.9:pose==='strike'?-1.6:-1.05;
   rightArm+=(armTarget-rightArm)*ease;leftArm+=((pose==='holdUp'?-2.7:reeling?-1.12:0)-leftArm)*ease;
   rightShoulder?.rotation.set(rightArm-(reduced?0:reelImpulse*.12),0,pose==='holdUp'?-.25:-.1);
   leftShoulder?.rotation.set(leftArm+(reduced||!reeling?0:Math.sin(reelTurn)*.13),reeling?.25:0,pose==='holdUp'?.25:reeling?.6:0);
   player.updateMatrixWorld(true);
   const h=rightHand;if(h)h.getWorldPosition(hv);else hv.set(stand.x,.8,stand.z);
   const tilt=pose==='holdUp'?1.35:pose==='windup'?1.25:pose==='strike'?.95:.62;
   rodTilt+=(tilt-rodTilt)*ease;
   // Curvature grows toward the tip. The same deformed endpoint drives the line,
   // so the line stays attached through the windup, bite and each pull.
   const tension=reeling?.16+reelImpulse*.2:pose==='strike'?.3:pose==='windup'?-.09:pose==='cast'?.1:dip*.08;
   bend+=(tension-bend)*(reduced?1:1-Math.exp(-dt*12));
   if(Math.abs(bend-lastBend)>.0005){for(let i=0;i<rodPositions.count;i++){const j=i*3,t=Math.max(0,(rodRest[j+1]-.3)/(ROD-.3)),slope=2*t*bend/(ROD-.3),angle=Math.atan(slope),c=Math.cos(angle),s=Math.sin(angle);
    rodPositions.setZ(i,rodRest[j+2]+t*t*bend);rodNormals.setY(i,rodNormalRest[j+1]*c-rodNormalRest[j+2]*s);rodNormals.setZ(i,rodNormalRest[j+1]*s+rodNormalRest[j+2]*c);}
    rodPositions.needsUpdate=true;rodNormals.needsUpdate=true;lastBend=bend;}
   rod.visible=pose!=='holdUp';rod.position.copy(hv);rod.rotation.set(Math.PI/2-rodTilt,Math.atan2(dir.x,dir.z),0,'YXZ');crank.rotation.z=reelTurn;
   tip.set(0,ROD,bend).applyQuaternion(rod.quaternion).add(hv);
   let sag=.35;const b=bobState;
   if(b.kind==='hanging'){bob.set(tip.x,tip.y-.45,tip.z);sag=0;}
   else if(b.kind==='flying'){const k=Math.min(1,b.progress);bob.set(tip.x+(cast.x-tip.x)*k,tip.y+(SURFACE+.06-tip.y)*k+Math.sin(k*Math.PI)*1.6,tip.z+(cast.z-tip.z)*k);sag=.1;}
   else if(b.kind==='reeling'){const pull=reelDistance();bob.set(cast.x-dir.x*pull,SURFACE+.04-dip*.05,cast.z-dir.z*pull);sag=.035;}
   else if(b.kind==='under'){bob.set(cast.x,SURFACE-.12+(reduced?0:Math.sin(elapsed*40)*.02),cast.z);sag=0;}
   else bob.set(cast.x,SURFACE+.05+(reduced?0:Math.sin(elapsed*2.2)*.012)-dip*.07,cast.z);
   const showLine=b.kind!=='hidden'&&pose!=='holdUp';bobber.visible=showLine;line.visible=showLine;bobber.position.copy(bob);bobber.rotation.z=reduced?0:Math.sin(elapsed*2.1)*.07+dip*.2;
   swimPhase+=Math.min(.05,Math.max(0,dt))*(reelingFish?10+dip*12:7);
   if(shadowOn){
    // A travelling bend grows toward the tail. Reuse the original vertex buffer.
    const shadowPositions=shGeo.getAttribute('position') as T.BufferAttribute;
    for(let i=0;i<shadowPositions.count;i++){const j=i*3,z=shadowRest[j+2],tailWeight=Math.max(0,Math.min(1,(z+.18)/.8));shadowPositions.setX(i,shadowRest[j]+(reduced?0:Math.sin(swimPhase-z*5)*.075*tailWeight));}
    shadowPositions.needsUpdate=true;
   }
   // The wag (shader): the same phases the old tail / fin rotations used, scaled by each species' own amplitude.
   if(reelModel)reelFx.drive(swimPhase-1,reduced?0:reelModel.anim.amp*(1+dip*1.2));
   if(catchModel&&catchFish.visible)catchFx.drive(swimPhase,reduced?0:catchModel.anim.amp*(1+dip));
   if(heldModel)heldFx.drive(swimPhase*1.4,reduced?0:heldModel.anim.amp*.8);
   if(catchFish.visible){
    // Swim → bite pose. Hook point: just under the float, on the line. The mouth (model nose, local −X) goes there, the body
    // pitched nose-up toward it and facing in from where the fish was; pecks dart in and back, the bite lunges and tugs.
    const k=reduced?1:1-Math.exp(-dt*(catchSwim.mode==='nibble'||catchSwim.mode==='bite'?3.2:2.6));
    biteBlend+=((catchSwim.mode==='nibble'||catchSwim.mode==='bite'?1:0)-biteBlend)*(reduced?1:Math.min(1,dt/.45));
    peck=Math.max(0,peck-dt/.28);lunge=Math.max(0,lunge-dt/.5);
    const e=biteBlend*biteBlend*(3-2*biteBlend),len=catchSwim.len,hx=bob.x,hz=bob.z,hy=Math.min(SURFACE-.14,bob.y-.16);
    let fx=hx-catchSwim.x,fz=hz-catchSwim.z;const fl=Math.hypot(fx,fz);if(fl>.05){fx/=fl;fz/=fl;}else{fx=Math.sin(catchSwim.heading);fz=Math.cos(catchSwim.heading);}
    const pitch=BITE_PITCH*e,c=Math.cos(pitch),sn=Math.sin(pitch),dart=.06-(reduced?0:Math.sin(peck*Math.PI)*.1+Math.sin(lunge*Math.PI)*.16);
    // Body centre for a mouth at the hook (nose is half a length ahead along the pitched axis), held off the seabed.
    const bx=hx-fx*(dart*c+len*.5*c),bz=hz-fz*(dart*c+len*.5*c),by=Math.max(UW_SURFACE-catchSwim.depth+len*.5*sn+.05,hy-dart*sn-len*.5*sn);
    const tx=catchSwim.x+(bx-catchSwim.x)*e,ty=catchSwim.y+(by-catchSwim.y)*e,tz=catchSwim.z+(bz-catchSwim.z)*e;
    if(catchFresh){catchPos.set(tx,ty,tz);catchYaw=catchSwim.heading;catchFresh=false;}else catchPos.set(catchPos.x+(tx-catchPos.x)*k,catchPos.y+(ty-catchPos.y)*k,catchPos.z+(tz-catchPos.z)*k);
    let turn=Math.atan2(fx,fz)-catchSwim.heading;turn=Math.atan2(Math.sin(turn),Math.cos(turn));const yawTarget=catchSwim.heading+turn*e;
    let dy=yawTarget-catchYaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));catchYaw+=dy*(reduced?1:Math.min(1,dt*5));
    catchFish.position.copy(catchPos);catchFish.scale.setScalar(len);catchFish.rotation.set(0,catchYaw+Math.PI/2,-pitch,'YZX');
    // The seabed silhouette stays exactly where fishingCore puts the fish (the gameplay cue: nose-first approach and flight).
   }
   if(reelingFish){shadow.visible=false;catchFish.visible=false;const len=Math.min(1.2,Math.max(.62,reelingFish.lengthCm/85));reeledFish.scale.setScalar(len);const sway=reduced?0:Math.sin(swimPhase*.5)*(.05+dip*.11);
    // -X (the nose) points back toward the angler, in the direction of the reel travel.
    reeledFish.rotation.set(reduced?0:Math.sin(swimPhase)*.09,Math.atan2(dir.x,dir.z)-Math.PI/2+(reduced?0:Math.sin(swimPhase*.7)*(.12+reelImpulse*.25)),reduced?0:Math.sin(swimPhase*.65)*.07);
    // Authoritative attachment is the nose at local -X, not the fish centre or
    // tail. Solve body position AFTER rotation/scale so every struggle keeps
    // the line anchored at its mouth and the body trailing behind the pull.
    bob.x+=dir.z*sway;bob.z-=dir.x*sway;bob.y=SURFACE+.025+(reduced?0:Math.sin(swimPhase*.65)*.035+reelImpulse*.18);
    tmp.set(-.5,0,0).multiplyScalar(len).applyQuaternion(reeledFish.quaternion);reeledFish.position.copy(bob).sub(tmp);
    bobber.position.copy(bob);bobber.position.y+=.12;
   }
   bobber.scale.setScalar(reelingFish?.72:1);
   for(let i=0;i<LINE_N;i++){const t=i/(LINE_N-1);tmp.lerpVectors(tip,bob,t);tmp.y-=Math.sin(t*Math.PI)*sag;linePos[i*3]=tmp.x;linePos[i*3+1]=tmp.y;linePos[i*3+2]=tmp.z;}
   lineGeo.attributes.position.needsUpdate=true;
   if(heldFish){const hd=head;if(hd)hd.getWorldPosition(tmp);else tmp.set(stand.x,1.3,stand.z);
    const len=Math.min(1.3,Math.max(.8,heldFish.lengthCm/70));held.scale.setScalar(len);held.position.set(tmp.x,tmp.y+.55+len*(.2+heldLift)+(reduced?0:Math.sin(elapsed*3)*.02),tmp.z);landingAge=Math.min(1,landingAge+dt/.65);if(!reduced&&landingAge<1){const k=landingAge*landingAge*(3-2*landingAge);held.position.lerpVectors(landingFrom,tmp.copy(held.position),k);held.position.y+=Math.sin(landingAge*Math.PI)*1.1;held.scale.setScalar(len*(.6+.4*k));}// Side-on to the fishing camera (it looks back from over the water, a little to the side): the animal's flank (+Z)
    // faces out to sea. Flat animals tip their back toward the camera; the octopus hangs its arms down (model.hold).
    const hm=heldModel;held.rotation.set(hm?.hold.x??0,Math.atan2(dir.x,dir.z)-.3,.15+(hm?.hold.z??0)+(reduced?0:Math.sin(landingAge*Math.PI)*.65),'YZX');}
  },
  dispose(){water?.dispose();schools.dispose();spray.dispose();releaseSpeciesModels();root.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());},
 };
}
