// Friends' balls look like the standard island ball (Oct 23 2026). The owner saw the local ball with its black pentagons but a
// party friend's ball as a plain cream sphere: the pentagons are child meshes (addBallPatches) on the island ball, and friends
// only borrowed its sphere geometry + (skinned) material. Friends now draw ONE vertex-coloured classic ball geometry (sphere +
// the same six pentagons) and ONE material, on the island and in every room. Node only.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),T=require('three');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 const m={exports:{}},full=path.join(root,file);cache.set(file,m);
 const out=ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(out,{module:m,exports:m.exports,process:{env:{}},document:{createElement:()=>({width:0,height:0,getContext:()=>null})},Math,Number,Set,Map,Float32Array,Array,Object,Error,console,
  require:id=>{
   if(id==='three')return T;
   if(id.startsWith('.')){const rel=path.resolve(path.dirname(full),id);for(const ext of ['.ts','/index.ts'])if(fs.existsSync(rel+ext))return load(path.relative(root,rel+ext));}
   return require(id);
  }});
 return m.exports;
}
const B=load('lib/graphics/ballAppearance.ts'),{CLASSIC_BALL}=B;
const close=(a,b,eps=1e-5)=>Math.abs(a-b)<eps;
t('classic constants match the equipped classic skin and the island ball mesh',()=>{
 const custom=read('lib/town/customization.ts'),m=custom.match(/BALL_COLORS=\{classic:'(#[0-9a-f]{6})'/);
 assert.ok(m);assert.equal(CLASSIC_BALL.color,m[1],'classic colour = BALL_COLORS.classic (what setStyle(classic) paints)');
 const mat=new T.MeshStandardMaterial({color:CLASSIC_BALL.color,roughness:CLASSIC_BALL.roughness});
 // setStyle('classic') on the island material (no texture needed for classic)
 const look=B.createBallAppearance(mat);look.setStyle('classic');
 const fm=B.createClassicBallMaterial();
 assert.equal(mat.map,null);assert.equal(fm.map,null,'no texture: the pattern is geometry, like the island ball');
 assert.equal(mat.roughness,fm.roughness);assert.equal(mat.emissive.getHex(),fm.emissive.getHex());assert.ok(fm.vertexColors);assert.equal(fm.color.getHex(),0xffffff,'white base: vertex colours give the tones');
 const town=read('components/Town.tsx');
 assert.match(town,/new T\.SphereGeometry\(CLASSIC_BALL\.radius,CLASSIC_BALL\.widthSegments,CLASSIC_BALL\.heightSegments\),ballMaterial\)/,'island ball built from the same constants');
 assert.match(town,/addBallPatches\(ball,\.19\)/);assert.equal(CLASSIC_BALL.radius,.19);
});
t('friend geometry = island sphere (same radius + segments) + the six addBallPatches pentagons in the patch colour',()=>{
 const g=B.createClassicBallGeometry(.19),pos=g.attributes.position,col=g.attributes.color;
 const sphere=new T.SphereGeometry(.19,CLASSIC_BALL.widthSegments,CLASSIC_BALL.heightSegments).toNonIndexed(),circle=new T.CircleGeometry(CLASSIC_BALL.patchRadius,5).toNonIndexed();
 const sn=sphere.attributes.position.count,cn=circle.attributes.position.count;
 assert.equal(pos.count,sn+6*cn);
 for(let i=0;i<sn;i++){assert.ok(close(pos.getX(i),sphere.attributes.position.getX(i))&&close(pos.getY(i),sphere.attributes.position.getY(i))&&close(pos.getZ(i),sphere.attributes.position.getZ(i)));}
 const base=new T.Color(CLASSIC_BALL.color),dark=new T.Color(CLASSIC_BALL.patch);
 assert.ok(close(col.getX(0),base.r)&&close(col.getY(0),base.g)&&close(col.getZ(0),base.b),'sphere is the classic cream');
 // the island ball's actual patches
 const island=new T.Group();const patches=B.addBallPatches(island,.19);assert.equal(island.children.length,6);
 const v=new T.Vector3();let o=sn;
 for(const p of island.children){
  assert.equal(p.material.color.getHex(),dark.getHex(),'island patch colour = CLASSIC_BALL.patch');p.updateMatrix();
  for(let i=0;i<cn;i++,o++){v.fromBufferAttribute(circle.attributes.position,i).applyMatrix4(p.matrix);
   assert.ok(close(pos.getX(o),v.x)&&close(pos.getY(o),v.y)&&close(pos.getZ(o),v.z),'pentagon vertex where the island ball has it');
   assert.ok(close(col.getX(o),dark.r)&&close(col.getY(o),dark.g)&&close(col.getZ(o),dark.b));
   const nx=new T.Vector3().fromBufferAttribute(g.attributes.normal,o);assert.ok(nx.dot(p.position.clone().normalize())>.99,'patch faces outwards');}
 }
 patches.dispose();g.dispose();sphere.dispose();circle.dispose();
});
t('remote avatars (island + rooms) draw BALL_MAX meshes of the ONE classic geometry + material; no borrowed local skin',()=>{
 const src=read('lib/graphics/remoteAvatars.ts');
 assert.match(src,/BALL_RADIUS=\.19/);assert.match(src,/const ballGeo=createClassicBallGeometry\(BALL_RADIUS\),ballMat=createClassicBallMaterial\(\);/);
 assert.match(src,/for\(let i=0;i<BALL_MAX;i\+\+\)\{const m=new T\.Mesh\(ballGeo,ballMat\);/);
 assert.equal((src.match(/createClassicBall(Geometry|Material)\(/g)||[]).length,2,'built once per avatar layer');
 assert.doesNotMatch(src+read('lib/multiplayer/townBridge.ts')+read('components/Town.tsx'),/setBallLook/,'no swap to the local player\'s skinned material');
 assert.match(read('lib/multiplayer/roomParty.ts'),/createRemoteAvatars\(/,'rooms use the same layer, so the same classic ball');
});
console.log(`friend-ball-look: ${n} ok`);
