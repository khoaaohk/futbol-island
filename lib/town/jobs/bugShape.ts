/**
 * The shared bug shape (Oct 20 2026): one merged vertex-colour geometry for every bug, used by the Bug squad job
 * (lib/town/jobs/jobScene.ts) and the wild meadow bugs (lib/graphics/wildBugs.ts), so the job's bugs and the world's are the same
 * creature. No textures. The wings are white so an instance colour tints them (bugScout.ts colours); body and spots stay dark.
 */
import * as T from 'three';

/** Merge coloured parts into one non-indexed geometry with vertex colours. */
export function mergeColoured(parts:{geometry:T.BufferGeometry;matrix:T.Matrix4;color:string}[]){
 const pos:number[]=[],nor:number[]=[],col:number[]=[],c=new T.Color();
 for(const p of parts){const g=(p.geometry.index?p.geometry.toNonIndexed():p.geometry.clone()).applyMatrix4(p.matrix);c.set(p.color);const a=g.getAttribute('position'),n=g.getAttribute('normal');
  for(let i=0;i<a.count;i++){pos.push(a.getX(i),a.getY(i),a.getZ(i));nor.push(n.getX(i),n.getY(i),n.getZ(i));col.push(c.r,c.g,c.b);}g.dispose();}
 const out=new T.BufferGeometry();out.setAttribute('position',new T.Float32BufferAttribute(pos,3));out.setAttribute('normal',new T.Float32BufferAttribute(nor,3));out.setAttribute('color',new T.Float32BufferAttribute(col,3));out.computeBoundingSphere();return out;
}

/** One bug for every species (one instanced draw): a dark body and head, two wings (white, so the instance colour tints them,
 *  bugScout.ts) each with three dark pentagon spots, a football's patches (a ladybird's spots, a beetle's markings). */
export function createBugGeometry(){const parts:{geometry:T.BufferGeometry;matrix:T.Matrix4;color:string}[]=[],tmp:T.BufferGeometry[]=[];const k=<G extends T.BufferGeometry>(g:G)=>{tmp.push(g);return g;};
 const body=k(new T.BoxGeometry(.1,.09,.46)),head=k(new T.BoxGeometry(.12,.1,.11)),wing=k(new T.BoxGeometry(.38,.018,.3)),spot=k(new T.CircleGeometry(.06,5));
 parts.push({geometry:body,matrix:new T.Matrix4(),color:'#2b2620'},{geometry:head,matrix:new T.Matrix4().makeTranslation(0,.01,.27),color:'#211d19'});
 for(const sd of [-1,1]){const w=new T.Matrix4().makeTranslation(sd*.22,.04,-.02).multiply(new T.Matrix4().makeRotationZ(sd*.22));parts.push({geometry:wing,matrix:w,color:'#ffffff'});
  for(const [sx,sz] of [[.07,.06],[-.06,-.05],[.09,-.09]] as const)parts.push({geometry:spot,matrix:w.clone().multiply(new T.Matrix4().makeTranslation(sd*sx,.011,sz)).multiply(new T.Matrix4().makeRotationX(-Math.PI/2)),color:'#1d1b1b'});}
 const g=mergeColoured(parts);for(const t of tmp)t.dispose();return g;}
