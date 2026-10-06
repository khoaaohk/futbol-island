import * as T from 'three';
import {BeanDepthMaterial,BD} from './beanSkin';
/**
 * Heat pass 6b (Oct 3 2026, user-approved): townsfolk shadows in a few instanced depth draws instead of one per body part.
 *
 * For ONE shadow pass (wrapped inside `shadowVisibility`, so its dynamic culling and the view gate have already hidden the units
 * whose shadows cannot reach the view) every shadow-casting part of the registered units is gathered into a shadow-only
 * InstancedMesh per shape:
 * - bean parts (body, limbs, hat style view): the SAME `BeanDepthMaterial` vertex deformation, reading each rig's row from batch
 *   row textures (one row per instance, gl_InstanceID), exactly as `playerBatch` does for live players; the rig's `onBeforeShadow`
 *   sync runs first, so pose and shape are this frame's;
 * - plain rigid parts (scooter, skateboard and ball pieces): grouped by geometry shape and side, default depth material.
 * Only shapes with ≥ 2 casters this pass are batched; a lone caster draws itself as before. The source meshes' `castShadow` is
 * restored in `finally`, and the proxies are visible only inside the pass, so the colour pass, picking and the simulation are
 * untouched. The world matrices are the ones the renderer just computed: shadows follow every pose, with no lag.
 * Cost when nothing is visible: a visibility check per unit per shadow pass; no allocations per frame (lists, bindings and
 * instanced meshes are created once and reused; row textures grow in powers of two).
 */
type Kind='body'|'limbs'|'hat';
type RowSource={array:Float32Array;width:number;staticWidth?:number};
type RowTex={width:number;texture:T.DataTexture;dirty:boolean};
type Group={key:string;kind:Kind|null;mesh:T.InstancedMesh|null;members:T.Mesh[];bean:null|{rows:number;fixed:RowTex;pose:RowTex;depth:BeanDepthMaterial}};
type Part={mesh:T.Mesh;group:Group|null;geometry:T.BufferGeometry;material:T.Material|T.Material[]};
const CAPACITY=256;
const relative=new T.Matrix4();
const defaultShadowHook=T.Object3D.prototype.onBeforeShadow;

function rowTex(width:number,rows:number,old?:RowTex):RowTex{
 const texture=new T.DataTexture(new Float32Array(width*rows*4),width,rows,T.RGBAFormat,T.FloatType);
 texture.minFilter=texture.magFilter=T.NearestFilter;texture.generateMipmaps=false;texture.needsUpdate=true;texture.name='npc-shadow-rows';
 if(old){(texture.image.data as unknown as Float32Array).set(old.texture.image.data as unknown as Float32Array);old.texture.dispose();}
 return {width,texture,dirty:false};
}
const upload=(t:RowTex)=>{if(t.dirty){t.texture.needsUpdate=true;t.dirty=false;}};
function copyRow(t:RowTex,i:number,array:Float32Array,from:number){
 const data=t.texture.image.data as unknown as Float32Array,n=t.width*4,offset=i*n;
 for(let k=0;k<n;k++)if(data[offset+k]!==array[from+k]){data.set(array.subarray(from,from+n),offset);t.dirty=true;return;}
}
/** A plain rigid part whose default depth draw an instanced depth draw reproduces exactly. */
function plainCaster(mesh:T.Mesh){
 const m=mesh.material;if(Array.isArray(m)||mesh.customDepthMaterial||(mesh as T.Object3D as T.SkinnedMesh).isSkinnedMesh||(mesh as T.Object3D as T.InstancedMesh).isInstancedMesh)return false;
 if(mesh.morphTargetInfluences?.length||Object.keys(mesh.geometry.morphAttributes).length||mesh.onBeforeShadow!==defaultShadowHook)return false;
 const s=m as T.MeshStandardMaterial;
 return !s.transparent&&!(s.alphaTest>0)&&!s.alphaMap&&!s.displacementMap&&!s.clippingPlanes?.length&&!s.alphaHash&&!s.wireframe;
}
const beanKind=(mesh:T.Mesh):Kind|null=>{const d=mesh.customDepthMaterial as (T.Material&{isBeanMaterial?:boolean;beanKind?:string})|undefined;
 if(!d?.isBeanMaterial||!mesh.userData.beanData||Array.isArray(mesh.material))return null;return d.beanKind==='body'||d.beanKind==='limbs'||d.beanKind==='hat'?d.beanKind:null;};

export function createNpcShadowBatch(renderer:T.WebGLRenderer,scene:T.Scene,enabled=true){
 const stats={groups:0,batched:0,draws:0,savedCalls:0};
 const roots:T.Object3D[]=[],units=new WeakMap<T.Object3D,Part[]>(),groups=new Map<string,Group>(),active:Group[]=[];
 const geometryKeys=new WeakMap<T.BufferGeometry,string>();let original=renderer.shadowMap.render;
 // Plain parts group by shape: same geometry type and parameters AND the same vertex data (a geometry translated or edited after
 // construction keeps its parameters, so it is checked once against the shape's first geometry and keyed by uuid if it differs).
 const representative=new Map<string,T.BufferGeometry>();
 const sameData=(a:T.BufferGeometry,b:T.BufferGeometry)=>{const pa=a.getAttribute('position'),pb=b.getAttribute('position');
  if(!pa||!pb||pa.count!==pb.count||a.drawRange.start!==b.drawRange.start||a.drawRange.count!==b.drawRange.count||(a.index?.count??-1)!==(b.index?.count??-1))return false;
  const xa=pa.array,xb=pb.array;for(let i=0;i<xa.length;i++)if(xa[i]!==xb[i])return false;
  if(a.index&&b.index){const ia=a.index.array,ib=b.index.array;for(let i=0;i<ia.length;i++)if(ia[i]!==ib[i])return false;}return true;};
 const keyOf=(g:T.BufferGeometry)=>{let k=geometryKeys.get(g);if(k===undefined){const p=(g as T.BufferGeometry&{parameters?:unknown}).parameters;k=p?g.type+JSON.stringify(p):g.uuid;
  if(p){const first=representative.get(k);if(!first)representative.set(k,g);else if(first!==g&&!sameData(first,g))k=g.uuid;}geometryKeys.set(g,k);}return k;};
 function groupFor(mesh:T.Mesh):Group|null{
  const kind=beanKind(mesh);if(!kind&&!plainCaster(mesh))return null;
  const m=mesh.material as T.Material,g=mesh.geometry;
  const key=(kind?'bean:'+kind+':'+g.uuid:'plain:'+keyOf(g))+':'+m.side+':'+m.shadowSide;
  let group=groups.get(key);if(!group){group={key,kind,mesh:null,members:[],bean:null};groups.set(key,group);}
  return group;
 }
 /** The shadow-only InstancedMesh is built the first time a shape has ≥ 2 casters in one pass (most shapes never do). */
 function build(group:Group,mesh:T.Mesh){
  const m=mesh.material as T.Material,g=mesh.geometry,kind=group.kind;
  // Same side / shadowSide as the source, so three picks the same depth face culling; never drawn in the colour pass.
  const material=new T.MeshBasicMaterial({side:m.side,colorWrite:false});material.shadowSide=m.shadowSide;
  // Bean parts share the never-disposed bean geometry (or its style view); plain parts get their own copy of the shape.
  const instance=new T.InstancedMesh(kind?g:g.clone(),material,CAPACITY);instance.name='npc-shadow-batch';instance.count=0;
  instance.visible=false;instance.castShadow=true;instance.receiveShadow=false;instance.frustumCulled=false;instance.matrixAutoUpdate=false;
  instance.instanceMatrix.setUsage(T.DynamicDrawUsage);scene.add(instance);instance.updateMatrixWorld(true);instance.matrixWorldAutoUpdate=false;
  if(kind){const source=mesh.userData.beanData as RowSource,fixedW=Math.min(source.width,source.staticWidth??BD.lumbar);
   const depth=new BeanDepthMaterial(kind);const fixed=rowTex(fixedW,32),pose=rowTex(Math.max(1,source.width-fixedW),32);depth.setBeanData(fixed.texture,pose.texture);
   instance.customDepthMaterial=depth;group.bean={rows:32,fixed,pose,depth};}
  group.mesh=instance;stats.groups++;return instance;
 }
 function partsOf(unit:T.Object3D){
  let parts=units.get(unit);if(parts)return parts;parts=[];
  // Every mesh except the classic ones the bean skin hid and released (castShadow is read per pass: the desktop static cache,
  // hair and app toggles change it).
  unit.traverse(o=>{if(o instanceof T.Mesh&&!o.userData.beanHidden&&!(o as T.Object3D as T.InstancedMesh).isInstancedMesh)parts!.push({mesh:o,group:groupFor(o),geometry:o.geometry,material:o.material});});
  units.set(unit,parts);return parts;
 }
 const shown=(mesh:T.Object3D,unit:T.Object3D)=>{for(let n:T.Object3D|null=mesh;n;n=n.parent){if(!n.visible)return false;if(n===unit)return true;}return true;};
 function writeBean(group:Group,i:number,source:RowSource){
  const b=group.bean!;
  if(i>=b.rows){b.rows=Math.min(CAPACITY,Math.max(b.rows*2,i+1));b.fixed=rowTex(b.fixed.width,b.rows,b.fixed);b.pose=rowTex(b.pose.width,b.rows,b.pose);b.depth.setBeanData(b.fixed.texture,b.pose.texture);}
  copyRow(b.fixed,i,source.array,0);copyRow(b.pose,i,source.array,b.fixed.width*4);
 }
 function wrapped(this:T.WebGLShadowMap,lights:T.Light[],world:T.Scene,camera:T.Camera){
  stats.batched=stats.draws=stats.savedCalls=0;
  if(!enabled||!roots.length||!this.enabled||(!this.autoUpdate&&!this.needsUpdate))return original.call(this,lights,world,camera);
  active.length=0;
  for(const root of roots){if(!root.visible||!root.parent)continue;
   for(const unit of root.children){if(!unit.visible)continue;
    for(const part of partsOf(unit)){const mesh=part.mesh;
     // A swapped geometry (hat or hair style view) or material regroups the part; no work while it stays the same.
     if(part.geometry!==mesh.geometry||part.material!==mesh.material){part.geometry=mesh.geometry;part.material=mesh.material;part.group=groupFor(mesh);}
     const group=part.group;
     if(!group||!mesh.castShadow||!(mesh.material as T.Material).visible||!shown(mesh,unit))continue;
     if(!group.members.length)active.push(group);if(group.members.length<CAPACITY)group.members.push(mesh);}
   }
  }
  try{
   for(const group of active){const members=group.members;if(members.length<2)continue;
    const instance=group.mesh??build(group,members[0]);
    // Precision: the proxy sits at its first caster's origin and the instances are relative to it, so the GPU multiplies small
    // offsets (as the per-mesh path's CPU-combined model-view does) instead of island-scale translations (feet contact shadows).
    const e0=members[0].matrixWorld.elements,ox=e0[12],oy=e0[13],oz=e0[14];instance.matrixWorld.makeTranslation(ox,oy,oz);
    for(let i=0;i<members.length;i++){const mesh=members[i];
     if(group.bean){mesh.onBeforeShadow(renderer,world,camera,camera,mesh.geometry,mesh.customDepthMaterial!,null as unknown as T.Group);writeBean(group,i,mesh.userData.beanData as RowSource);}
     relative.copy(mesh.matrixWorld);const r=relative.elements;r[12]-=ox;r[13]-=oy;r[14]-=oz;instance.setMatrixAt(i,relative);mesh.castShadow=false;}
    instance.count=members.length;instance.visible=true;
    instance.instanceMatrix.clearUpdateRanges();instance.instanceMatrix.addUpdateRange(0,members.length*16);instance.instanceMatrix.needsUpdate=true;
    if(group.bean){upload(group.bean.fixed);upload(group.bean.pose);}
    stats.batched+=members.length;stats.draws++;stats.savedCalls+=members.length-1;
   }
   return original.call(this,lights,world,camera);
  }finally{
   for(const group of active){if(group.mesh?.visible){group.mesh.visible=false;for(const mesh of group.members)mesh.castShadow=true;}group.members.length=0;}
   active.length=0;
  }
 }
 renderer.shadowMap.render=wrapped;
 return {stats,
  /** Each direct child of these roots is a unit (a townsperson rig, a ride); its casting parts are listed once, on first use. */
  addRoots(list:T.Object3D[]){for(const root of list)if(!roots.includes(root))roots.push(root);},
  /** Drop a unit's cached part list after its meshes change (appearance, costume). */
  refresh(unit:T.Object3D){units.delete(unit);},
  setEnabled(value:boolean){enabled=value;},
  dispose(){if(renderer.shadowMap.render===wrapped)renderer.shadowMap.render=original;original=()=>{};
   for(const g of groups.values()){if(!g.mesh)continue;g.mesh.removeFromParent();if(!g.bean)g.mesh.geometry.dispose();(g.mesh.material as T.Material).dispose();if(g.bean){g.bean.depth.dispose();g.bean.fixed.texture.dispose();g.bean.pose.texture.dispose();}g.mesh.dispose();}
   groups.clear();}};
}
