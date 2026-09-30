// Coral Cay farm decorative planting (Sep 29 2026): sugar cane, taro, hibiscus, bird-of-paradise, bougainvillea and
// understorey leaves as FOUR instanced meshes (blob / stem / blade / cone) with per-instance colour. Instances are ordered
// by plant priority, so thinning on a warm phone is one `count` change per mesh when the heat tier changes (full at tier 0,
// half at tiers 1–3, 30% at the lowest tier and Battery saver). No per-frame work; no shadows cast (small ground plants).
import * as T from 'three';
import {subscribeHeatTier,effectiveTier,LOWEST_TIER,type HeatTier} from './heatTier';
export type DecorKind='blob'|'stem'|'blade'|'cone';
export type DecorPart={kind:DecorKind;x:number;y:number;z:number;sx:number;sy:number;sz:number;ry?:number;rz?:number;color:string};
export type DecorPlant={parts:DecorPart[]};
export const decorFraction=(tier:HeatTier)=>tier===0?1:tier===LOWEST_TIER?.3:.5;
export function createFarmDecor(scene:T.Scene,plants:DecorPlant[]){
 const root=new T.Group();root.name='coral-cay-farm-decor';scene.add(root);
 const geometries:Record<DecorKind,T.BufferGeometry>={blob:new T.IcosahedronGeometry(1,0),stem:new T.CylinderGeometry(1,1,1,5),blade:new T.BoxGeometry(1,1,1),cone:new T.ConeGeometry(1,1,4)};
 const material=new T.MeshStandardMaterial({roughness:.85,flatShading:true});
 // Deterministic priority: every other plant first, so any fraction keeps an even spread across the farm.
 const order=plants.map((_,i)=>i).sort((a,b)=>((a*7919)%plants.length)-((b*7919)%plants.length));
 const meshes=(['blob','stem','blade','cone'] as DecorKind[]).map(kind=>{
  const rows:{plant:number;part:DecorPart}[]=[];order.forEach((p,rank)=>{for(const part of plants[p].parts)if(part.kind===kind)rows.push({plant:rank,part});});
  const mesh=new T.InstancedMesh(geometries[kind],material,Math.max(1,rows.length));mesh.name='farm-decor-'+kind;mesh.castShadow=false;mesh.receiveShadow=true;
  const m=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),c=new T.Color();
  rows.forEach(({part},i)=>{e.set(0,part.ry??0,part.rz??0,'YXZ');q.setFromEuler(e);m.compose(new T.Vector3(part.x,part.y,part.z),q,new T.Vector3(part.sx,part.sy,part.sz));mesh.setMatrixAt(i,m);mesh.setColorAt(i,c.set(part.color));});
  mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;mesh.computeBoundingSphere();mesh.count=rows.length;root.add(mesh);
  // Instances of plants ranked below `keep` stay drawn: cut points per plant count.
  const cut=(keep:number)=>{let n=0;while(n<rows.length&&rows[n].plant<keep)n++;return n;};
  return {mesh,rows,cut};
 });
 const stats={tier:0 as HeatTier,plants:plants.length,shown:plants.length};
 const apply=()=>{const tier=effectiveTier(),keep=Math.round(plants.length*decorFraction(tier));stats.tier=tier;stats.shown=keep;for(const x of meshes)x.mesh.count=x.cut(keep);};
 apply();const off=subscribeHeatTier(apply);
 return {root,stats,meshes:meshes.map(x=>x.mesh),apply,dispose(){off();root.removeFromParent();for(const x of meshes)x.mesh.dispose();Object.values(geometries).forEach(g=>g.dispose());material.dispose();}};
}
