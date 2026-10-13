import * as T from 'three';

/**
 * Focus mode: "while fishing, pause everything in the background" (Oct 12 2026; docs/performance-guide.md "Fishing focus mode").
 *
 * ONE switch for the island loop. While it is on (a fishing session whose camera has arrived), Town reads `active` and the background
 * HOLDS STILL where it is: live matches, street traffic, the volleyball and coach-wall groups and townsfolk with nothing within 30 m of
 * the angler skip their updates (still drawn, frozen in place), the ferry stops, and shadows refresh at half rate (lib/graphics/
 * islandHeat.ts setFocus). Nothing is hidden that the shot can see, so nothing pops in or out.
 *
 * Rendering: this module hides the static island chunks beyond a radius from the angler. The portrait fishing shot looks back at the
 * island under the HUD card, so chunks past 90 m are behind the beach or under the card (identical phone captures at four spots:
 * scratchpad fishing-water/chunkcut-*); landscape keeps 200 m because its horizon is open. `exit()` restores exactly the visibility
 * it changed, and every system resumes from its own state on the next frame (no resets, no teleports; live matches resume).
 */
export function createFocusMode(scene:T.Scene){
 type Entry={object:T.Object3D;x:number;z:number;r:number};
 let chunks:Entry[]|null=null,on=false;const hidden:T.Object3D[]=[];const groups=new Map<T.Object3D,Entry>();
 const sphere=new T.Sphere(),box=new T.Box3();
 const measureChunks=()=>{
  chunks=[];for(const o of scene.children){if(!(o instanceof T.Mesh)||!o.name.startsWith('island-chunk-'))continue;
   if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();sphere.copy(o.geometry.boundingSphere!).applyMatrix4(o.matrixWorld);chunks.push({object:o,x:sphere.center.x,z:sphere.center.z,r:sphere.radius});}
  return chunks;
 };
 let cx=0,cz=0;const stats={chunksHidden:0};
 return {stats,
  get active(){return on;},
  /** Turn focus on round (x, z), hiding static chunks farther than `chunkRadius` metres (render only). */
  enter(x:number,z:number,chunkRadius:number){
   if(on)return;on=true;cx=x;cz=z;
   for(const e of chunks??measureChunks())if(e.object.visible&&Math.hypot(e.x-x,e.z-z)-e.r>chunkRadius){e.object.visible=false;hidden.push(e.object);}
   stats.chunksHidden=hidden.length;
  },
  /** Is any part of this group (measured once) within `radius` of the focus point? */
  near(root:T.Object3D,radius:number){
   let e=groups.get(root);if(!e){box.setFromObject(root);if(box.isEmpty())return false;box.getBoundingSphere(sphere);e={object:root,x:sphere.center.x,z:sphere.center.z,r:sphere.radius};groups.set(root,e);}
   return Math.hypot(e.x-cx,e.z-cz)-e.r<radius;
  },
  exit(){if(!on)return;on=false;for(const o of hidden)o.visible=true;hidden.length=0;stats.chunksHidden=0;},
  dispose(){this.exit();chunks=null;groups.clear();},
 };
}
