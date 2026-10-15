import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {FISH_SPOTS,SHADOW_LENGTH,type FishShape,type ShadowSize} from './fishCatalog';
import {createFishingWater} from './shoreWater';
import {createFishSchools} from './fishSchools';
import {speciesModel,releaseSpeciesModels,type ShadowKind,type SpeciesModel} from './fishModels';
import {applyReefWater,patchUnderwater,reefTheme,uwDepthAt,UW_SURFACE,UW_UNIFORMS} from './underwater';
import {graphicsQuality} from '../../graphics/quality';
import {createDeepSeaScene} from './deepSeaScene';
import {createFishingOverlay,type AimPreview} from './fishingOverlay';
import type {Hotspot} from './fishingAim';
import {fishingLife} from './fishingLife';
import {effectiveTier} from '../../graphics/heatTier';
import {WATER_UNIFORMS} from '../../graphics/waterSurface';

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
 /* `rise` (optional, Oct 14 2026, "the fish sometimes teleport in"): 1 = deep down in the haze, 0 = up under the float. */
 showShadow(shadow:{size:ShadowSize;pos:Vec2;heading:number;alpha:number;shape?:FishShape;id?:string;color?:string;mode?:'swim'|'nibble'|'bite'|'flee';rise?:number}|null):void;
 /** Aimed casting (Oct 14 2026, optional): where this cast lands and its direction (the session began with the spot's usual cast). */
 setCast?(cast:Vec2,dir:Vec2):void;
 /** The session's hotspots (fishingAim.ts) drawn as signs in the water; the deep-sea bait ball follows a 'baitball' hotspot. */
 setHotspots?(list:readonly Hotspot[]):void;
 /** The dotted aim arc to a landing point (null hides it). */
 setAim?(to:Vec2|null):void;
 /** Session clock (s) for the hotspots' slow drift. */
 setClock?(t:number):void;
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
  // Oct 14 2026 polish: a soft pale rim on the swimming catch, so the biter's outline reads clearly against the reef and sand.
  if(underwater){sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n{float rim=1.-abs(dot(normalize(vViewPosition),normal));totalEmissiveRadiance+=vec3(.55,.85,.9)*pow(rim,3.)*.45;}');patchUnderwater(sh);}
 };
 material.customProgramCacheKey=()=>underwater?'fishing-catch-wag-under-v2':'fishing-catch-wag-v1';
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

 // Moving water (Oct 12 2026): the swash, wet sand, caustics and swells round the active spot (shoreWater.ts, one strip draw + the
 // ocean's own draw) and ambient fish schools (fishSchools.ts, one instanced draw). Replaces the static foam / band / ripple decals.
 // ?fishwater=0 (A/B measurements only) leaves the shore still and the schools out.
 const waterOn=typeof window==='undefined'||new URLSearchParams(window.location.search).get('fishwater')!=='0';
 // Phones (every heat tier): fewer seabed props, a simpler fish body, no sway (underwater.ts / fishSchools.ts).
 const phone=typeof window!=='undefined'&&graphicsQuality().phone;
 const water=renderer&&waterOn?createFishingWater(scene,renderer,phone):null,schools=createFishSchools(scene,phone);
 // Oct 14 2026: the deep-sea boats' water column (light shafts, plankton, jellyfish; one draw, deep spots only) and the water
 // signs + aim arc (one instanced draw, only while fishing).
 const column=waterOn?createDeepSeaScene(scene,phone):null,overlay=createFishingOverlay(scene,UW_UNIFORMS);
 // Polish pass (Oct 14 2026): the line's sag eases between states (slack while waiting, taut when reeling, a twitch on nibbles);
 // the float rides the swell; after the catch leaves the water it drips for a moment. `life` = fishingLife (heat tier gate).
 let lineSag=0,lineTwitch=0,restRing=1.5,dripT=9,dripWait=0,life=fishingLife(0,false,2);
 let hotList:readonly Hotspot[]=[],clockT=0,aimTo:Vec2|null=null;
 let active=false,stand:Vec2={x:0,z:0},cast:Vec2={x:0,z:0},dir:Vec2={x:0,z:1},pose:FishingPose='hold',bobState:BobberState={kind:'hanging'},dip=0,shadowOn=false,heldFish:CatchLook|null=null;
 let reelTravel=0,landingAge=1,reelingFish:CatchLook|null=null;const landingFrom=new T.Vector3();
 const hv=new T.Vector3(),tip=new T.Vector3(),bob=new T.Vector3(),tmp=new T.Vector3();
 const rightShoulder=player.getObjectByName('right-shoulder'),leftShoulder=player.getObjectByName('left-shoulder'),rightHand=player.getObjectByName('right-hand'),head=player.getObjectByName('player-head');
 const reelDistance=()=>reelTravel;
 const floatX=()=>cast.x-dir.x*reelDistance(),floatZ=()=>cast.z-dir.z*reelDistance();
 const ring=(size:number,life:number)=>overlay.ring(floatX(),floatZ(),size,life);
 const spray=(n:number,power:number)=>overlay.burst(floatX(),SURFACE+.02,floatZ(),n,power);
 const ringsBusy=()=>overlay.busy;
 return {
  begin(s,c,d){const spot=FISH_SPOTS.reduce((a,b)=>Math.hypot(b.x-s.x,b.z-s.z)<Math.hypot(a.x-s.x,a.z-s.z)?b:a);
   const halfWidth=typeof window!=='undefined'&&window.innerWidth<window.innerHeight?4.5:9;
   // Farther casts (Oct 13 2026): the seabed scatter and the ambient schools reach past the float itself (default 11/15 m
   // when the cast happens to be shorter), so coral, rocks and fish still surround a float cast much farther out.
   const viewDepth=Math.max(halfWidth<6?11:15,Math.hypot(c.x-s.x,c.z-s.z)+5);
   // Each spot's own reef (Oct 13 2026): water tint and sand (shared uniforms), the seabed layout and palette, the fish and the
   // clownfish's anemone, all from its theme (underwater.ts REEF_THEMES).
   const theme=reefTheme(spot);applyReefWater(theme);
   water?.begin(s,d,spot,halfWidth,viewDepth);if(waterOn)schools.begin(s,d,water?.field?.distance??null,SURFACE-.003,halfWidth,theme,water?.homes??[],viewDepth,water?.pieces??[]);
   if(theme.deep)column?.begin(s,d,theme);else column?.end();overlay.begin();
   // Bubbles rise now and then from the taller reef pieces in view (from the seabed build; none in open deep water).
   {const pcs=(water?.pieces??[]).filter(p=>p.top-p.y>.2);const pick:{x:number;y:number;z:number}[]=[];for(let i=0;i<pcs.length&&pick.length<12;i+=Math.max(1,Math.floor(pcs.length/12)))pick.push({x:pcs[i].x,y:pcs[i].y,z:pcs[i].z});overlay.setBubbleSources(pick);}
   lineSag=.1;lineTwitch=0;restRing=1.5;dripT=9;hotList=[];aimTo=null;overlay.setHotspots(hotList);overlay.setAim(null);active=true;reelTravel=0;bend=0;rodTilt=.62;rightArm=-1.05;leftArm=0;reelImpulse=0;reelTurn=0;dip=0;reelingFish=null;stand={...s};cast={...c};dir={...d};root.visible=true;rod.visible=line.visible=bobber.visible=true;pose='hold';bobState={kind:'hanging'};},
  end(){water?.end();schools.end();column?.end();overlay.end();aimTo=null;active=false;rod.visible=line.visible=bobber.visible=false;shadow.visible=false;catchFish.visible=false;held.visible=false;reeledFish.visible=false;reelingFish=null;shadowOn=false;heldFish=null;if(!ringsBusy())root.visible=false;},
  setPose(p){pose=p;},
  setCast(c,d){cast={...c};dir={...d};},
  setHotspots(list){hotList=list;overlay.setHotspots(list);const bait=list.find(h=>h.kind==='baitball');schools.setBait(bait?{x:bait.x,z:bait.z}:null);},
  setAim(to){aimTo=to;},
  setClock(t){clockT=t;},
  setBobber(s){bobState=s;},
  splash(size){if(size==='bite')lunge=1;schools.scatter(floatX(),floatZ(),size==='bite'||size==='hook'?1.2:size==='land'?1:.7);
   if(size==='land'){ring(.9,.9);ring(.5,.6);spray(8,.55);restRing=2.2;}else if(size==='bite'){ring(1.5,1.1);ring(.8,.7);ring(2.1,1.4);spray(12,1);lineTwitch=1;}else if(size==='hook'){ring(1.2,.8);ring(2.1,1.4);spray(12,1.1);}else{ring(.7,.7);spray(4,.4);}},
  nibble(){dip=1;lineTwitch=Math.max(lineTwitch,.6);if(catchSwim.mode==='nibble')peck=1;if(bobState.kind==='reeling'){reelImpulse=1;ring(.8,.7);spray(5,.45);}else ring(.55,.6);},
  showShadow(sh){shadowOn=!!sh&&sh.alpha>.01;shadow.visible=shadowOn;const clear=!!water?.field;catchFish.visible=shadowOn&&clear;if(!sh)return;
   const x=cast.x+sh.pos.x-dir.x*reelDistance(),z=cast.z+sh.pos.z-dir.z*reelDistance(),depth=clear?uwDepthAt(water!.field!.distance(x,z)):0;
   // Clear water: the silhouette lies on the seabed under the swimming catch; without the clear water (A/B) it stays at the surface.
   shadow.position.set(x,clear?UW_SURFACE-depth+.012:SURFACE-.001,z);shadow.renderOrder=clear?.58:1;// The silhouette head is local -Z; simulation headings point along +Z.
   const kind=shadowKind(sh.shape);if(kind!==shKind){shKind=kind;({geo:shGeo,rest:shadowRest}=shadowGeo(kind));shadow.geometry=shGeo;}
   shadow.rotation.y=sh.heading+Math.PI;shadow.scale.setScalar(SHADOW_LENGTH[sh.size]);shadowMat.opacity=(clear?.36:.5)*sh.alpha;
   if(clear){catchModel=look(catchFish,catchFx,{color:sh.color??'#8aa0a8',lengthCm:40,shape:sh.shape,id:sh.id});
    // The model's nose is local −X (see the reeled fish): face the heading. Near the surface, so it reads clearly over the seabed.
    // Placed in frame() (the bite pose eases in and out there); here only where it swims.
    // Rising in from the haze (or sinking away): deeper while `rise` is up (down to the seabed in the shallows, 3 m out at sea).
    const rise=Math.max(0,Math.min(1,sh.rise??0)),high=Math.min(.42,Math.max(.2,depth-.25)),low=Math.max(high,Math.min(depth-.15-SHADOW_LENGTH[sh.size]*.2,3));
    Object.assign(catchSwim,{x,z,y:UW_SURFACE-(high+(low-high)*rise),heading:sh.heading,len:SHADOW_LENGTH[sh.size]*.95,depth,mode:sh.mode??'swim',alpha:sh.alpha});
    catchFx.material.opacity=Math.min(1,sh.alpha*1.3)*(1-rise*.55);shadowMat.opacity*=1-rise*.8;}
   else catchFresh=true;},
  setReelingFish(f){reelingFish=f;reeledFish.visible=!!f;if(f)reelModel=look(reeledFish,reelFx,f);},
  holdUpFish(f){if(f&&!heldFish){landingAge=0;landingFrom.copy(bob);
    // The catch leaving the water: a splash, two rings and a burst of drops where it came out; it drips for a moment after.
    overlay.ring(bob.x,bob.z,1.1,1);overlay.ring(bob.x,bob.z,.6,.7);overlay.burst(bob.x,SURFACE+.02,bob.z,14,1.1);dripT=0;dripWait=.15;}
   heldFish=f;held.visible=!!f;
   if(f){heldModel=look(held,heldFx,f);heldLift=liftWhenHeld(heldModel);}},
  setCoastVisible(){},
  labelAnchor(out){const hd=head;if(hd)hd.getWorldPosition(out);else out.set(stand.x,1.3,stand.z);out.y+=.55;return out;},
  get busy(){return active||ringsBusy()||!!water?.busy||schools.busy||!!column?.busy||overlay.busy;},
  frame(dt,elapsed,reduced){
   // Heat gate (fishingLife): sway, the extra reef life and particles only on the cool tiers; uniform writes only.
   life=fishingLife(effectiveTier(),reduced,WATER_UNIFORMS.uWaterDetail.value);UW_UNIFORMS.uUwSway.value=life.sway?1:0;overlay.setLife(life.particles);schools.setLife(life.life);
   column?.frame(dt,reduced);
   overlay.setAim(active&&aimTo?{from:{x:tip.x,y:tip.y,z:tip.z},to:aimTo}:null);overlay.frame(dt,reduced,clockT);
   water?.frame(dt,reduced);schools.frame(dt,reduced,active&&(bobState.kind==='floating'||bobState.kind==='under'||bobState.kind==='reeling')?{x:bob.x,z:bob.z}:null);
   if(!active){UW_UNIFORMS.uUwFloatOn.value=0;if(!ringsBusy())root.visible=false;return;}
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
   // Line sag (Oct 14 2026 polish): a target per state, eased (no snaps): slack while the float waits (breathing with the swell),
   // nearly taut while reeling (tighter on each pull), a quick tightening twitch on nibbles and the bite.
   let sagTarget=.35;const b=bobState;
   // The float rides the swell: a slow 5.6 s rise and fall (the strip's swell period) plus a little chop, and leans with it.
   const swellBob=reduced?0:Math.sin(elapsed*1.122)*.022+Math.sin(elapsed*2.9+1.3)*.008,swellTilt=reduced?0:Math.cos(elapsed*1.122)*.09+Math.sin(elapsed*2.3)*.035;
   if(b.kind==='hanging'){bob.set(tip.x,tip.y-.45,tip.z);sagTarget=0;}
   else if(b.kind==='flying'){const k=Math.min(1,b.progress);bob.set(tip.x+(cast.x-tip.x)*k,tip.y+(SURFACE+.06-tip.y)*k+Math.sin(k*Math.PI)*1.6,tip.z+(cast.z-tip.z)*k);sagTarget=.05+k*.25;}
   else if(b.kind==='reeling'){const pull=reelDistance();bob.set(cast.x-dir.x*pull,SURFACE+.04-dip*.05+swellBob*.4,cast.z-dir.z*pull);sagTarget=.05-reelImpulse*.04;}
   else if(b.kind==='under'){bob.set(cast.x,SURFACE-.12+(reduced?0:Math.sin(elapsed*40)*.02),cast.z);sagTarget=0;}
   else{bob.set(cast.x,SURFACE+.05+swellBob-dip*.07,cast.z);sagTarget=.3+swellBob*2-dip*.18;
    // A faint resting ripple round the float every few seconds as it rocks (cool tiers only).
    if(life.particles&&!reduced){restRing-=dt;if(restRing<=0){restRing=2.6+Math.random()*1.6;overlay.ring(bob.x,bob.z,.42,1.8);}}}
   lineTwitch=Math.max(0,lineTwitch-dt*3);
   lineSag=reduced?sagTarget:lineSag+(sagTarget-lineSag)*(1-Math.exp(-dt*(sagTarget<lineSag?10:2.5)));
   const sag=Math.max(0,lineSag-lineTwitch*.12);
   const showLine=b.kind!=='hidden'&&pose!=='holdUp';bobber.visible=showLine;line.visible=showLine;
   // The float's and the line's soft shadow on the seabed (Oct 14 2026 depth pass; drawn by the strip shader: two uniform writes).
   const onWater=showLine&&(b.kind==='floating'||b.kind==='under'||b.kind==='reeling');UW_UNIFORMS.uUwFloatOn.value=onWater?1:0;if(onWater)UW_UNIFORMS.uUwFloat.value.set(bob.x,bob.z,stand.x,stand.z);bobber.position.copy(bob);bobber.rotation.z=reduced?0:swellTilt*.8+dip*.2;bobber.rotation.x=reduced?0:Math.sin(elapsed*1.122+1.7)*.05;
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
   // The catch wriggles hard as it comes out of the water, then settles (polish: it calms over ~2.5 s).
   dripT+=dt;const wriggle=Math.max(0,1-dripT/2.5);
   if(heldModel)heldFx.drive(swimPhase*(1.4+wriggle*1.2),reduced?0:heldModel.anim.amp*(.8+wriggle*1.4));
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
   for(let i=0;i<LINE_N;i++){const t=i/(LINE_N-1);tmp.lerpVectors(tip,bob,t);
    // A hanging line sags most a little past the middle (the float end is lower); a twitch sends a small wave along it.
    const hang=4*t*(1-t)*(1+.35*(t-.5));tmp.y-=hang*sag;if(lineTwitch>0&&!reduced)tmp.y+=Math.sin(t*Math.PI*3-elapsed*30)*.012*lineTwitch*Math.sin(t*Math.PI);linePos[i*3]=tmp.x;linePos[i*3+1]=tmp.y;linePos[i*3+2]=tmp.z;}
   lineGeo.attributes.position.needsUpdate=true;
   if(heldFish){const hd=head;if(hd)hd.getWorldPosition(tmp);else tmp.set(stand.x,1.3,stand.z);
    const len=Math.min(1.3,Math.max(.8,heldFish.lengthCm/70));held.scale.setScalar(len);held.position.set(tmp.x,tmp.y+.55+len*(.2+heldLift)+(reduced?0:Math.sin(elapsed*3)*.02),tmp.z);landingAge=Math.min(1,landingAge+dt/.65);if(!reduced&&landingAge<1){const k=landingAge*landingAge*(3-2*landingAge);held.position.lerpVectors(landingFrom,tmp.copy(held.position),k);held.position.y+=Math.sin(landingAge*Math.PI)*1.1;held.scale.setScalar(len*(.6+.4*k));}// Side-on to the fishing camera (it looks back from over the water, a little to the side): the animal's flank (+Z)
    // faces out to sea. Flat animals tip their back toward the camera; the octopus hangs its arms down (model.hold).
    const hm=heldModel;held.rotation.set(hm?.hold.x??0,Math.atan2(dir.x,dir.z)-.3+(reduced?0:Math.sin(elapsed*9)*.12*wriggle),.15+(hm?.hold.z??0)+(reduced?0:Math.sin(landingAge*Math.PI)*.65+Math.sin(elapsed*13)*.1*wriggle),'YZX');
    // Water drips off it for a couple of seconds (a few drops falling to the sand; cool tiers only).
    if(dripT<2.4&&!reduced){dripWait-=dt;if(dripWait<=0){dripWait=.1+dripT*.12+Math.random()*.12;overlay.drip(held.position.x+(Math.random()-.5)*.3*len,held.position.y-.12*len,held.position.z+(Math.random()-.5)*.3*len,player.position.y+.03);}}}
  },
  dispose(){water?.dispose();schools.dispose();column?.dispose();overlay.dispose();releaseSpeciesModels();root.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());},
 };
}
