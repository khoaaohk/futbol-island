import * as T from 'three';
import {createFishingBackdrop,chunkCellKey,isChunk,type FishingBackdrop} from './fishingBackdrop';

/**
 * Focus mode: "while fishing, pause everything in the background" (Oct 12 2026; docs/performance-guide.md "Fishing focus mode").
 *
 * ONE switch for the island loop. While it is on (a fishing session whose camera has arrived), Town reads `active` and the background
 * HOLDS STILL where it is: live matches, street traffic, the volleyball and coach-wall groups and townsfolk skip their updates
 * (frozen in place), the ferry stops, and shadows refresh at half rate (lib/graphics/islandHeat.ts setFocus).
 *
 * Rendering (Oct 15 2026, user: "the background while fishing is not rendering fully. we need it to render but, not detailed" and
 * "save on heat"): the background is drawn COMPLETE but cheap. The old cut hid static chunks past 90 / 200 m one material batch at
 * a time, which left half-built buildings, lone lamp posts and floating roofs and signs. Now, for the main camera's colour pass only
 * (renderer.render(scene, camera)):
 * - static chunks in the 50 m cells near the angler (NEAR_M) stay real, full detail;
 * - every other cell is drawn by the low-detail backdrop (lib/graphics/fishingBackdrop.ts: one flat-colour mesh per island region,
 *   no small props, no textures, no shadows), and its real chunks are skipped, so nothing is drawn twice or half;
 * - people, vehicles, small props and markers away from the angler are skipped as whole categories (FAR_UNITS / FAR_ROOTS /
 *   ALWAYS_HIDDEN): every townsperson, car, vending machine, ball-hunt spot, ramp and job sign, or none of them; never half of one;
 * - landmarks outside the chunks (pitches and goals, floodlights, the ferry, the lighthouse, the sea and shore, sea life) stay.
 * Skipped objects are hidden for that one render and restored in `finally` (like viewGate), so no system's own visibility is ever
 * overwritten and other renders (the shore field's top-down capture, previews) see the normal scene. The backdrop is built once,
 * a few ms per frame, the first time a fishing shot needs it; until it is ready the island draws in full (complete, never broken).
 */
export const NEAR_M=45;
/** Roots whose direct children are separate units (a townsperson, a car, a ball-hunt spot): each is skipped when away from the angler. */
export const FAR_UNITS=['island-townsfolk','island-street-cars','matchday-coin-hunt','vending-machines','ride-boost-ramps','night-light-pools'];
/** Roots skipped whole when no part of them is near the angler (matches' players and effects, groups, finds, fruit). */
export const FAR_ROOTS=['match-futsal','match-7v7','match-9v9','match-11v11','match-beach','pier-volleyball-game','coaches-wall-practice','live-rooftop-knockout','beach-finds','summit-fruit-trees','coin-buoy-scenery','east-pier-target'];
/** Small props spread over the whole island in one mesh (no unit to keep near), and overworld markers: never drawn behind a fishing
 *  shot. The ferry's padlock ("matchday-ferry-locked", a translucent green lock floating 9 m over the ferry, Town.tsx showFerryLock)
 *  read as a floating green shopping bag from the boats (user report Oct 15 2026). */
export const ALWAYS_HIDDEN=['island-jobs','manhole-covers','matchday-ferry-locked','ferry-lock-particles'];

type Entry={object:T.Object3D;x:number;z:number;r:number};
export function createFocusMode(scene:T.Scene,renderer?:{render:(scene:T.Scene,camera:T.Camera)=>void},camera?:T.Camera){
 let on=false,backdropWanted=false,selected=false;const groups=new Map<T.Object3D,Entry>();
 const sphere=new T.Sphere(),box=new T.Box3(),wp=new T.Vector3(),frustum=new T.Frustum(),viewMatrix=new T.Matrix4();
 let cx=0,cz=0;
 const stats={chunksHidden:0,unitsHidden:0,nearCells:0,backdropReady:false,frames:0,selects:0};
 let backdrop:FishingBackdrop|null=null;
 /** What one focused colour pass skips (computed once per session, frozen scene), and the cells kept real. */
 const skip:T.Object3D[]=[];let near=new Set<string>();
 const measure=(root:T.Object3D)=>{let e=groups.get(root);if(!e){root.updateWorldMatrix(true,true);box.setFromObject(root);if(box.isEmpty())return null;box.getBoundingSphere(sphere);e={object:root,x:sphere.center.x,z:sphere.center.z,r:sphere.radius};groups.set(root,e);}return e;};
 const isNear=(x:number,z:number,r:number)=>Math.hypot(x-cx,z-cz)-r<NEAR_M;
 /** A cell is near when its 50 m square OR what it actually holds (a hillside batched from a far origin) comes within NEAR_M. */
 const cellNear=(key:string,boxes:Map<string,T.Box3>)=>{const [ix,iz]=key.split(':').map(Number),x0=ix*50,z0=iz*50,dist=(ax:number,az:number,bx:number,bz:number)=>Math.hypot(Math.max(ax-cx,0,cx-bx),Math.max(az-cz,0,cz-bz));
  const b=boxes.get(key);return dist(x0,z0,x0+50,z0+50)<NEAR_M||!!b&&!b.isEmpty()&&dist(b.min.x,b.min.z,b.max.x,b.max.z)<NEAR_M;};
 const byName=(name:string)=>{const out:T.Object3D[]=[];for(const o of scene.children){if(o.name===name)out.push(o);else if(!isChunk(o))o.traverse(c=>{if(c!==o&&c.name===name)out.push(c);});}return out;};
 /** Fill `skip` for this session (the backdrop is ready). */
 function plan(){
  skip.length=0;near=new Set();
  const boxes=new Map(backdrop!.cells().map(c=>[c.key,c.box]));
  for(const o of scene.children)if(isChunk(o)){const key=chunkCellKey(o);if(near.has(key)||cellNear(key,boxes))near.add(key);else skip.push(o);}
  stats.chunksHidden=skip.length;stats.nearCells=near.size;
  // Beach umbrella canopies (the backdrop copies them into their cell).
  for(const o of scene.children)if(o.type==='Group'&&!o.name)o.traverse(c=>{if(c instanceof T.Mesh&&c.userData.umbrellaAnimated){c.getWorldPosition(wp);if(!near.has(Math.floor(wp.x/50)+':'+Math.floor(wp.z/50)))skip.push(c);}});
  // Units move between sessions (townsfolk, cars), so they are measured afresh each session (bounds of the frozen pose).
  for(const name of FAR_UNITS)for(const root of byName(name))for(const unit of root.children){unit.updateWorldMatrix(true,true);box.setFromObject(unit);if(box.isEmpty())continue;box.getBoundingSphere(sphere);if(!isNear(sphere.center.x,sphere.center.z,sphere.radius))skip.push(unit);}
  for(const name of FAR_ROOTS)for(const root of byName(name)){const e=measure(root);if(!e||!isNear(e.x,e.z,e.r))skip.push(root);}
  for(const name of ALWAYS_HIDDEN)for(const root of byName(name))skip.push(root);
  stats.unitsHidden=skip.length-stats.chunksHidden;
  selected=true;
 }
 // The colour pass of the main camera: skip, draw the backdrop, restore (exactly what was changed).
 const hiddenNow:T.Object3D[]=[];
 const original=renderer?.render;
 if(renderer&&original)renderer.render=function(this:unknown,target:T.Scene,cam:T.Camera){
  if(!on||!backdropWanted||target!==scene||camera&&cam!==camera)return original.call(this,target,cam);
  if(!backdrop?.ready){backdrop??=createFishingBackdrop(scene);backdrop.step(6);stats.backdropReady=backdrop.ready;if(!backdrop.ready)return original.call(this,target,cam);}
  if(!selected)plan();
  // Only the cells this camera can see (the camera that is actually rendering: the fishing shot, boat motion included).
  cam.updateMatrixWorld();viewMatrix.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);frustum.setFromProjectionMatrix(viewMatrix);
  if(backdrop.select(near,frustum,{x:cx,z:cz}))stats.selects++;
  stats.frames++;
  for(const o of skip)if(o.visible){o.visible=false;hiddenNow.push(o);}
  backdrop.updateLights();for(const m of backdrop.meshes.values())m.visible=m.userData.drawn===true;
  try{return original.call(this,target,cam);}
  finally{for(const o of hiddenNow)o.visible=true;hiddenNow.length=0;for(const m of backdrop.meshes.values())m.visible=false;}
 };
 return {stats,
  get active(){return on;},
  get backdrop(){return backdrop;},
  /** What the focused colour pass skips and the cells kept real (tests, __fi2). */
  get plan(){return {skip:skip.slice(),near:new Set(near),selected};},
  /** Turn focus on round (x, z). `backdrop` false (the easel): hold still only, draw everything. */
  enter(x:number,z:number,useBackdrop=true){
   if(on)return;on=true;cx=x;cz=z;backdropWanted=useBackdrop&&!!renderer;selected=false;skip.length=0;
  },
  /** Is any part of this group (measured once) within `radius` of the focus point? */
  near(root:T.Object3D,radius:number){const e=measure(root);if(!e)return false;return Math.hypot(e.x-cx,e.z-cz)-e.r<radius;},
  exit(){if(!on)return;on=false;selected=false;skip.length=0;stats.chunksHidden=stats.unitsHidden=stats.nearCells=0;},
  dispose(){this.exit();if(renderer&&original)renderer.render=original;backdrop?.dispose();backdrop=null;groups.clear();},
 };
}
