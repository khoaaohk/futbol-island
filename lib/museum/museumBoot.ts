import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {useShape,buildUpperGeometry,buildSoleGeometry,buildStudsGeometry,buildLacesGeometry,studGround,PART} from '../shop/bootGeometry';
import type {BootModel,Collar,Laces,StudType} from '../shop/boots';

/**
 * The Kit Shop's procedural boot (lib/shop/bootGeometry.ts, used read-only) as ONE plain vertex-coloured geometry for the museum
 * hall's "Boots through time" plinth (Oct 13 2026, user: "This doesn't look anything like a futbol boot"). The shop's phone detail
 * (its light LOD), no bake, no textures, no shader: the upper (its lining a shade lighter), the soleplate, the studs and the laces
 * are reduced to position + normal + colour (the upper's baked occlusion darkens its colour) and merged, indexed, into one
 * geometry for one draw call on the hall's own material. Units are the shop's decimetres with the stud tips on y = 0 and the boot
 * centred (heel → toe along +x, +z the outside of a right boot); the hall scales and turns it. Built once when the hall loads.
 */
export type MuseumBootLook={model:BootModel;collar:Collar;laces:Laces;studs:StudType;upper:string;lining:string;sole:string;studColor:string;lace:string};
export function buildMuseumBoot(look:MuseumBootLook):T.BufferGeometry{
 useShape(look.model);
 const parts:T.BufferGeometry[]=[],col=new T.Color();
 /** Keep position + normal (+ the index), and colour every vertex (`shade` darkens: the baked occlusion, the laces' shading). */
 const keep=(g:T.BufferGeometry,hex:(i:number)=>string,shade:(i:number)=>number=()=>1)=>{
  if(!g.getAttribute('normal'))g.computeVertexNormals();
  const n=g.getAttribute('position').count,c=new Float32Array(n*3);
  for(let i=0;i<n;i++){col.set(hex(i)).multiplyScalar(shade(i));c[i*3]=col.r;c[i*3+1]=col.g;c[i*3+2]=col.b;}
  for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal')g.deleteAttribute(k);
  g.setAttribute('color',new T.BufferAttribute(c,3));
  if(!g.index)g.setIndex(Array.from({length:n},(_,i)=>i));
  for(const k of Object.keys(g.morphAttributes))delete g.morphAttributes[k];g.clearGroups();
  parts.push(g);};
 const {geometry:upper,flipGeometry}=buildUpperGeometry({collar:look.collar,laces:look.laces,studs:look.studs,detail:'phone'});flipGeometry.dispose();
 {const ao=upper.getAttribute('aAO'),zone=upper.getAttribute('aZone');
  const ab=ao?Float32Array.from(ao.array as ArrayLike<number>):null,zw=zone?Array.from({length:zone.count},(_,i)=>Math.round(zone.getW(i))):null;
  keep(upper,i=>zw&&zw[i]===PART.lining?look.lining:look.upper,i=>ab?.55+.45*ab[i]:1);}
 keep(buildSoleGeometry(look.studs,'phone'),()=>look.sole);
 const studs=buildStudsGeometry(look.studs,'phone');if(studs)keep(studs,()=>look.studColor);
 const laces=buildLacesGeometry(),lc=laces.getAttribute('color'),lshade=lc?Float32Array.from({length:lc.count},(_,i)=>lc.getX(i)):null;
 keep(laces,()=>look.lace,i=>lshade?lshade[i]:1);
 const merged=mergeGeometries(parts,false)!;for(const p of parts)p.dispose();
 // Stand it on its studs and centre it.
 merged.computeBoundingBox();const bb=merged.boundingBox!;merged.translate(-(bb.min.x+bb.max.x)/2,-studGround(look.studs),-(bb.min.z+bb.max.z)/2);
 merged.computeBoundingBox();merged.computeBoundingSphere();return merged;
}
