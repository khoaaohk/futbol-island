import * as T from 'three';
import {buildTownSteps,runSteps,type TownWorld} from './world';
import {createVendingMachines,type VendingMachines} from '@/lib/graphics/vendingMachines';
import {readArcadeWallet} from '@/lib/arcade/arcadeWallet';
import {graphicsQuality} from '@/lib/graphics/quality';
import {heatOptions} from '@/lib/graphics/heatTier';
import {applyLambertScenery} from '@/lib/graphics/lambertScenery';
import {bootMark} from '@/lib/boot/perfMarks';

/**
 * The warm island (preload pass, Oct 9 2026; user: "the tan screen takes a while … can we load while they are on the main page?").
 *
 * When a player shows they are about to play (Start · Get my save code, or Play), the title screen builds the island's heavy,
 * static part here, in slices it schedules in idle time (components/root/islandPreload.ts): the WebGL renderer, the scene with the
 * whole static world (lib/town/world.ts buildTownSteps, ~12 slices) and the vending machines (their ball atlas starts downloading
 * and decoding), then ONE renderer.compileAsync for the world's shaders. Town takes all of it on mount (takeWarmIsland) instead of
 * building it while the tan sheet waits.
 *
 *  - No render loop: nothing here calls requestAnimationFrame or renders a frame; compileAsync polls with setTimeout (three.js) and
 *    the canvas is never attached, so the title screen stays at 0 rAF at rest. Geometry and textures are not uploaded (no render).
 *  - The compile uses stand-in lights shaped like Town's (one hemisphere + one shadow-casting sun, same shadow map type, colour
 *    space and tone mapping), so Town's first frame finds the same programs; they are removed before the hand-over.
 *  - Never used (no Play): disposeWarmIsland() releases the WebGL context (dispose + forceContextLoss) and drops the scene.
 *  - A Play before the build has finished: takeWarmIsland() runs the remaining slices synchronously (no work is thrown away); only
 *    the shader warm-up is skipped (Town's first frame compiles as before).
 */
export type WarmIsland={renderer:T.WebGLRenderer|null;scene:T.Scene;world:TownWorld;vending:VendingMachines};
export type WarmInfo={phase:Phase;slices:number;programs:number;geometries:number;textures:number;ms:number};
type Phase='idle'|'building'|'compiling'|'ready'|'taken'|'disposed';

let phase:Phase='idle',slices=0,startedAt=0,builtMs=0;
let renderer:T.WebGLRenderer|null=null,antialias=false,scene:T.Scene|null=null,world:TownWorld|null=null,vending:VendingMachines|null=null;
let build:Generator<void,TownWorld,unknown>|null=null;
/** The in-flight shader compile and its stand-in lights (removed the moment Town takes the scene). */
let compiling:Promise<unknown>|null=null,standIns:T.Object3D[]=[];
const dropStandIns=()=>{for(const o of standIns){o.removeFromParent();(o as T.Light).dispose?.();}standIns=[];};

/** Town's renderer settings (components/Town.tsx), applied before the compile so the program keys match. */
export function configureIslandRenderer(r:T.WebGLRenderer){
 r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;r.outputColorSpace=T.SRGBColorSpace;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.0;
}

/**
 * The warm-up as slices: each next() does one bounded piece; a yielded promise (the shader compile) is awaited by the scheduler.
 * Restartable after a dispose. Returns false from the generator when WebGL is unavailable (Town then shows its own error).
 */
export function* warmIslandSteps():Generator<void|Promise<unknown>,boolean,unknown>{
 if(phase!=='idle'&&phase!=='disposed')return phase!=='taken';
 phase='building';slices=0;startedAt=performance.now();bootMark('warm:start');
 const quality=graphicsQuality();antialias=quality.antialias;
 try{renderer=new T.WebGLRenderer({antialias,powerPreference:'default'});configureIslandRenderer(renderer);}catch{renderer=null;}
 slices++;yield;
 scene=new T.Scene();scene.background=new T.Color('#e8b98b');scene.fog=null;
 build=buildTownSteps(scene);
 for(;;){if(currentPhase()!=='building')return false;const r=build.next();slices++;if(r.done){world=r.value;break;}yield;}
 build=null;
 vending=createVendingMachines(scene,{coins:()=>readArcadeWallet().balance});slices++;
 if(quality.phone&&heatOptions().lambertScenery)applyLambertScenery(scene);
 builtMs=performance.now()-startedAt;bootMark('warm:built');
 yield;
 if(currentPhase()!=='building')return false;
 if(renderer){
  phase='compiling';bootMark('warm:compile-start');
  const camera=new T.PerspectiveCamera(40,1,1,500),hemi=new T.HemisphereLight('#ffe0aa','#9b785c',2.0),sun=new T.DirectionalLight('#ffc477',3.0);
  sun.castShadow=true;sun.shadow.mapSize.set(quality.shadowSize,quality.shadowSize);standIns=[hemi,sun,sun.target];scene.add(...standIns);
  const job=renderer.compileAsync(scene,camera).catch(()=>undefined).finally(()=>{if(compiling===job)compiling=null;bootMark('warm:compile-end');});
  compiling=job;yield job;
  if((phase as Phase)!=='compiling')return false;
  dropStandIns();
 }
 phase='ready';bootMark('warm:ready');return true;
}
const currentPhase=()=>phase;

/** Town, on mount: the warm island, finishing any slices still to run. Null when nothing was warmed (a reload, /island-return). */
export function takeWarmIsland():WarmIsland|null{
 if(phase==='idle'||phase==='taken'||phase==='disposed'||!scene)return null;
 if(phase==='building'){
  if(!world&&build)world=runSteps(build);
  build=null;
  if(!vending&&world)vending=createVendingMachines(scene,{coins:()=>readArcadeWallet().balance});
  const quality=graphicsQuality();if(quality.phone&&heatOptions().lambertScenery)applyLambertScenery(scene);
 }
 if(!world||!vending){disposeWarmIsland();return null;}
 // compiling: the in-flight compile's stand-in lights are removed when it settles; Town's own lights match them, so the programs
 // being compiled are the ones its first frame uses.
 dropStandIns();phase='taken';bootMark('warm:taken');
 // A renderer made with another antialias setting than Town would choose now (quality changed in between) is not reused.
 let r=renderer;if(r&&antialias!==graphicsQuality().antialias){r.dispose();r.forceContextLoss();r=null;}
 // Taken mid-compile: three's compileAsync still polls this renderer's programs, so a dispose (Town's cleanup, e.g. React's dev
 // double mount) waits for it to settle instead of pulling the properties out from under the poll.
 const job=compiling;if(r&&job){const dispose=r.dispose.bind(r);r.dispose=()=>{void job.then(dispose);};}
 const out={renderer:r,scene,world,vending};
 renderer=null;scene=null;world=null;vending=null;
 return out;
}

/** Drop a warm island nobody took: free the WebGL context and every geometry, material and texture made for it. */
export function disposeWarmIsland(){
 if(phase==='taken'||phase==='idle'&&!scene)return;
 phase='disposed';build=null;
 try{vending?.dispose();}catch{/* best effort */}
 try{world?.dispose();}catch{/* best effort */}
 const textures=new Set<T.Texture>();
 scene?.traverse(o=>{const m=o as T.Mesh;m.geometry?.dispose?.();
  for(const mat of m.material?(Array.isArray(m.material)?m.material:[m.material]):[]){for(const v of Object.values(mat))if(v instanceof T.Texture)textures.add(v);mat.dispose();}});
 textures.forEach(t=>t.dispose());
 dropStandIns();
 // three's compileAsync keeps polling its programs until they are ready: release the context only after that, never under it.
 const r=renderer,release=()=>{if(r){r.dispose();r.forceContextLoss();}};
 if(compiling)void compiling.then(release);else release();
 renderer=null;scene=null;world=null;vending=null;bootMark('warm:disposed');
}

/** For measurements and tests (scratchpad/preload): where the warm-up is and what it holds. */
export function warmIslandInfo():WarmInfo{
 const info=renderer?.info;
 return {phase,slices,programs:info?.programs?.length??0,geometries:info?.memory.geometries??0,textures:info?.memory.textures??0,ms:Math.round(builtMs)};
}
