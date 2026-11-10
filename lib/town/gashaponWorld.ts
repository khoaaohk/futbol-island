/**
 * The 12 island gashapon machines (round 2, Nov 8 2026; docs/gashapon-design.md; placement lib/gashapon/machines.ts). Built
 * inside buildTown from the one shared machine (lib/graphics/gashaponMesh.ts):
 *  - every solid piece goes through the town's `put` (palette colour, casting shadows), so the batching pass folds it into the
 *    SAME 50 m vertex-colour paint batch as the rest of that cell: no new draw call, no new material;
 *  - the glass globes share ONE transparent material (no shadow), merged per 50 m cell by the same pass: one extra draw for a
 *    cell with machines (a Konbini pair is one), frustum- and distance-culled with the rest of the town;
 *  - each cabinet's footprint becomes an obstacle (players and the ball stop at it).
 * No lights, no textures, no animation, no per-frame work. Each piece carries `userData.gashaponId`, so after batching world.ts
 * knows each machine's vertex runs (`gashaponStatic.hide/show`): the machine you open is swapped for its animated live copy
 * (lib/graphics/gashaponLive.ts) and folded back when you leave.
 */
import * as T from 'three';
import type {Obstacle} from './simulation';
import {islandGashaponMachines} from '../gashapon/machines';
import {gashaponPieces,gashaponBases,disposeBases,gashaponGlassMaterial,gashaponFootprint} from '../graphics/gashaponMesh';

export type GashaponWorldTools={
 put:(g:T.BufferGeometry,c:string,x:number,y:number,z:number)=>T.Mesh;
 town:T.Group;obstacles:Obstacle[];materials:T.Material[];
};
export function buildGashaponProps(t:GashaponWorldTools){
 const glass=gashaponGlassMaterial();t.materials.push(glass);
 const b=gashaponBases(),machines=islandGashaponMachines();
 machines.forEach((m,i)=>{
  for(const piece of gashaponPieces(m,i,b)){
   if(piece.glass){const mesh=new T.Mesh(piece.geometry,glass);mesh.position.set(m.x,m.y,m.z);mesh.rotation.y=m.yaw;mesh.castShadow=false;mesh.receiveShadow=false;mesh.name='gashapon-glass';mesh.userData.gashaponId=m.id;t.town.add(mesh);continue;}
   const mesh=t.put(piece.geometry,piece.color,m.x,m.y,m.z);mesh.rotation.y=m.yaw;mesh.castShadow=true;mesh.userData.gashaponId=m.id;// world.ts keeps its vertex runs (gashaponStatic: the open machine swaps to its live copy)
  }
  t.obstacles.push(gashaponFootprint(m));
 });
 disposeBases(b);
 return {machines:machines.length};
}
