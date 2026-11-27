// Soft island sweep (Nov 27 2026; lib/graphics/softBox.ts, `?soft=0` = before). Node = ON.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createLoader}=require('./summit-harness.cjs');const load=createLoader();const T=require('three');
const src=f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const S=load('lib/graphics/softBox.ts');
ok('soft box: still a BoxGeometry, same size, outward winding, smooth normals, counted triangles',()=>{
 for(const seg of [0,1,2])for(const dome of [0,.05]){const g=new S.SoftBoxGeometry(2,.5,1,{seg,dome});assert(g instanceof T.BoxGeometry);assert.equal(g.parameters.width,2);
  const tris=g.index.count/3;assert.equal(tris,S.softBoxTriangles(seg,dome),`seg ${seg} dome ${dome}: ${tris}`);
  g.computeBoundingBox();const b=g.boundingBox;assert(Math.abs(b.max.x-1)<1e-6&&Math.abs(b.min.z+.5)<1e-6&&Math.abs(b.max.y-.25-dome)<1e-6,`bounds seg ${seg}`);
  const p=g.getAttribute('position'),n=g.getAttribute('normal'),ix=g.index.array;let vol=0;
  for(let i=0;i<ix.length;i+=3){const a=new T.Vector3().fromBufferAttribute(p,ix[i]),bb=new T.Vector3().fromBufferAttribute(p,ix[i+1]),c=new T.Vector3().fromBufferAttribute(p,ix[i+2]);vol+=a.dot(bb.clone().cross(c))/6;}
  assert(vol>0&&vol<=2*.5*1+dome*2+1e-6&&vol>.85,`volume ${vol}`);
  for(let i=0;i<n.count;i++)assert(Math.abs(new T.Vector3().fromBufferAttribute(n,i).length()-1)<1e-4);
  let s=0;for(const gr of g.groups)s+=gr.count;assert.equal(s,g.index.count);}});
console.log(failed?`${failed} failed`:'soft-sweep: all ok');process.exit(failed?1:0);
