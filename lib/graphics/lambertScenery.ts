import * as T from 'three';
/** Heat pass 5, VISIBLE option `lambertScenery` (off by default, lib/graphics/heatTier HEAT_OPTIONS): the merged static scenery chunks
 * (island-chunk-*) swap MeshStandardMaterial for MeshLambertMaterial with the same colour, vertex colours, maps, emission,
 * transparency and side. Characters, vehicles, water and effects keep their materials. Returns the number of meshes changed. */
export function applyLambertScenery(scene:T.Object3D){
 const cache=new Map<T.Material,T.Material>();let changed=0;
 const convert=(m:T.Material)=>{if(!(m instanceof T.MeshStandardMaterial))return m;let l=cache.get(m);if(!l){
  l=new T.MeshLambertMaterial({color:m.color,map:m.map,vertexColors:m.vertexColors,emissive:m.emissive,emissiveMap:m.emissiveMap,emissiveIntensity:m.emissiveIntensity,transparent:m.transparent,opacity:m.opacity,side:m.side,alphaTest:m.alphaTest,depthWrite:m.depthWrite,polygonOffset:m.polygonOffset,polygonOffsetFactor:m.polygonOffsetFactor,polygonOffsetUnits:m.polygonOffsetUnits});
  l.name=m.name;cache.set(m,l);}return l;};
 scene.traverse(o=>{if(!(o instanceof T.Mesh)||!o.name.startsWith('island-chunk'))return;const next=Array.isArray(o.material)?o.material.map(convert):convert(o.material);if(next!==o.material){o.material=next;changed++;}});
 return changed;
}
/** Quality pass: 4× anisotropic filtering (capped by the device) on every mipmapped scene texture, so textures seen at grazing angles
 * (the ocean ripple tile, sign and stripe maps) stay crisp instead of blurring into their smaller mipmaps. Essentially free on
 * current GPUs; non-mipmapped textures (canvas labels, data rows) are left as they are. Returns how many textures changed. */
export function sharpenSceneTextures(scene:T.Object3D,maxAnisotropy:number,level=4){
 const target=Math.max(1,Math.min(level,maxAnisotropy));const done=new Set<T.Texture>();let changed=0;
 scene.traverse(o=>{if(!(o instanceof T.Mesh))return;for(const m of Array.isArray(o.material)?o.material:[o.material])for(const k of ['map','bumpMap','normalMap','emissiveMap','alphaMap','roughnessMap'] as const){
  const t=(m as unknown as Record<string,T.Texture|null|undefined>)[k];if(!t||done.has(t))continue;done.add(t);
  const mipmapped=t.generateMipmaps&&(t.minFilter===T.LinearMipmapLinearFilter||t.minFilter===T.LinearMipmapNearestFilter||t.minFilter===T.NearestMipmapLinearFilter);
  if(mipmapped&&t.anisotropy<target){t.anisotropy=target;t.needsUpdate=true;changed++;}}});
 return changed;
}
