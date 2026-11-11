import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {COMIC_INK} from './shading';

/* ---- props with their ink outline baked in (an inverted hull inside the same geometry: outline for 0 draws) ---- */
const tintC=new T.Color();
/** Flat vertex colour; `hex` may pick per triangle (non-indexed geometry). */
export function tint(g:T.BufferGeometry,hex:string|((tri:number)=>string)){const n=g.attributes.position.count,col=new Float32Array(n*3);for(let i=0;i<n;i++){tintC.set(typeof hex==='string'?hex:hex(Math.floor(i/3)));col[i*3]=tintC.r;col[i*3+1]=tintC.g;col[i*3+2]=tintC.b;}g.setAttribute('color',new T.BufferAttribute(col,3));return g;}
/** Reverse the winding of a non-indexed geometry (the hull is drawn inside out, so only its far side shows: a line round the part). */
export function flipFaces(g:T.BufferGeometry){for(const name of Object.keys(g.attributes)){const a=g.attributes[name] as T.BufferAttribute,n=a.itemSize,arr=a.array as Float32Array;for(let t=0;t+2<a.count;t+=3)for(let k=0;k<n;k++){const i=(t+1)*n+k,j=(t+2)*n+k,v=arr[i];arr[i]=arr[j];arr[j]=v;}}return g;}
/** Push `src` (vertex-coloured `hex`, placed by `m`) into `out`, with an ink hull `ink` world units fatter behind it. `round` grows
 * the hull radially (cylinders, cones); otherwise per-axis (boxes). Merge `out` with bakeParts: one geometry, one vertex-colour
 * material, outline included. Works on simple convex shapes; concave or thin shapes want the shader ink edge (`rim`) instead. */
export function inkedPart(out:T.BufferGeometry[],src:T.BufferGeometry,hex:string|((tri:number)=>string),m:T.Matrix4,ink=.06,round=false,inkHex:string=COMIC_INK){
 const g=src.index?src.toNonIndexed():src.clone();g.deleteAttribute('uv');
 if(ink>0){const h=g.clone(),p=h.attributes.position as T.BufferAttribute;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(round){const l=Math.hypot(x,z)||1;p.setXYZ(i,x+x/l*ink,y+Math.sign(y)*ink,z+z/l*ink);}else p.setXYZ(i,x+Math.sign(x)*ink,y+Math.sign(y)*ink,z+Math.sign(z)*ink);}
  flipFaces(h);tint(h,inkHex);h.applyMatrix4(m);out.push(h);}
 tint(g,hex);g.applyMatrix4(m);out.push(g);src.dispose();
}
export const partAt=(x:number,y:number,z:number,ry=0,rz=0)=>new T.Matrix4().makeRotationFromEuler(new T.Euler(0,ry,rz)).setPosition(x,y,z);
export function bakeParts(parts:T.BufferGeometry[]){const g=mergeGeometries(parts)!;for(const p of parts)p.dispose();return g;}
/** The impact star (Breakaway's struck ball, Pass Puzzles' goal): a jagged 12-point burst of radius 1 in the XY plane. Draw it twice
 * (ink behind, colour in front, MeshBasicMaterial) facing the camera, only while it shows. */
export function comicStarGeometry(){const shape=new T.Shape();for(let i=0;i<24;i++){const a=i/24*Math.PI*2,r=i%2?.52+((i*7)%5)*.035:1-((i*5)%3)*.08;if(i)shape.lineTo(Math.cos(a)*r,Math.sin(a)*r);else shape.moveTo(Math.cos(a)*r,Math.sin(a)*r);}return new T.ShapeGeometry(shape);}
