// Quality-recovery pass (docs/performance-guide.md): crisper shadows at the same map, anisotropic textures, phones at 1.75 while cool.
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),ts=require('typescript'),path=require('path'),T=require('three');
const read=p=>fs.readFileSync(p,'utf8');
function load(file,globals={}){const m={exports:{}};vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,...globals,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts'),globals):require(id)});return m.exports;}
const {fitIslandShadows,fitShadowsToBox}=load('lib/graphics/islandShadows.ts');

// 1. The town fit covers only the visible receivers: smaller than the old y = −8 / ±8 m fit (so more texels per metre), yet every
// receiver point along the view's corner rays (ground and roofs up to 24 m) stays inside, and the normal bias is 2 texels.
{const light=new T.DirectionalLight();light.shadow.mapSize.set(1024,1024);
 for(const [aspect,elevation] of [[390/844,0],[390/844,28],[834/1194,0],[1280/800,0]]){
  const view=new T.PerspectiveCamera(40,aspect,.1,500);fitIslandShadows(light,view,elevation);const c=light.shadow.camera,w=c.right-c.left,h=c.top-c.bottom;
  // the old fit, for comparison
  const ref=new T.PerspectiveCamera(40,aspect,.1,500);ref.position.set(18,23+elevation,30);ref.lookAt(2,elevation,-3);ref.updateMatrixWorld();
  const sv=new T.OrthographicCamera();sv.position.set(-288,252,198);sv.lookAt(0,0,0);sv.updateMatrixWorld();let l=1e9,r=-1e9,b=1e9,t=-1e9;const ray=new T.Vector3(),p=new T.Vector3();
  for(const x of [-1,1])for(const y of [-1,1]){ray.set(x,y,.5).unproject(ref).sub(ref.position).normalize();const g=ref.position.clone().addScaledVector(ray,(-8-ref.position.y)/ray.y);for(const hh of [-8,24]){p.set(g.x,hh,g.z).applyMatrix4(sv.matrixWorldInverse);l=Math.min(l,p.x);r=Math.max(r,p.x);b=Math.min(b,p.y);t=Math.max(t,p.y);}}
  const oldArea=(r-l+16)*(t-b+16);assert(w*h<oldArea*.9,`aspect ${aspect.toFixed(2)} elevation ${elevation}: ${w}×${h} vs old ${(r-l+16).toFixed(0)}×${(t-b+16).toFixed(0)}`);
  // coverage: sample receivers along the corner and edge rays at the ground and at roof heights
  for(const x of [-1,0,1])for(const y of [-1,0,1]){ray.set(x,y,.5).unproject(ref).sub(ref.position).normalize();if(ray.y>=0)continue;
   for(const hh of [0,6,12,20]){if(hh>=ref.position.y)continue;const q=ref.position.clone().addScaledVector(ray,(hh-ref.position.y)/ray.y);q.applyMatrix4(sv.matrixWorldInverse);
    assert(q.x>=c.left&&q.x<=c.right&&q.y>=c.bottom&&q.y<=c.top,`receiver at ${hh} m on ray (${x},${y}) outside the shadow frustum`);}}
  assert(Math.abs(light.shadow.normalBias-2*Math.max(w,h)/1024)<1e-9,'normal bias = 2 texels (no acne on parapets at the tighter fit)');}}
// 2. The watch view fits the watched pitch: every pitch corner is inside, far tighter than the view-based fit there (~680 m).
{const light=new T.DirectionalLight();light.shadow.mapSize.set(1024,1024);fitShadowsToBox(light,68*250/270/2+3,105*380/400/2+3,0,6);const c=light.shadow.camera;
 const sv=new T.OrthographicCamera();sv.position.set(-288,252,198);sv.lookAt(0,0,0);sv.updateMatrixWorld();
 for(const x of [-34,34])for(const z of [-50,50])for(const y of [0,2.5]){const q=new T.Vector3(x,y,z).applyMatrix4(sv.matrixWorldInverse);assert(q.x>=c.left&&q.x<=c.right&&q.y>=c.bottom&&q.y<=c.top);}
 assert(c.right-c.left<160&&c.top-c.bottom<100,`pitch fit ${c.right-c.left}×${c.top-c.bottom}`);
 const town=read('components/Town.tsx');assert.match(town,/if\(watchedVenue\)fitShadowsToBox\(sun,watchedVenue\.width\/2\+3,watchedVenue\.length\/2\+3,0,6\);else fitIslandShadows\(sun,camera,shadowElevation\);/);
 assert.match(town,/if\(watchedVenue\)sun\.target\.position\.set\(watchedVenue\.x,watchedVenue\.elevation\?\?0,watchedVenue\.z\);else sun\.target\.position\.set\(camera\.position\.x-18,0,camera\.position\.z-30\);/);}
// 3. Anisotropic filtering: 4× (capped by the device) on mipmapped textures only.
{const {sharpenSceneTextures}=load('lib/graphics/lambertScenery.ts');const scene=new T.Scene();
 const mip=new T.Texture();mip.generateMipmaps=true;mip.minFilter=T.LinearMipmapLinearFilter;const flat=new T.Texture();flat.generateMipmaps=false;flat.minFilter=T.LinearFilter;
 scene.add(new T.Mesh(new T.BoxGeometry(),new T.MeshStandardMaterial({map:mip})),new T.Mesh(new T.BoxGeometry(),new T.MeshBasicMaterial({map:flat})));
 assert.equal(sharpenSceneTextures(scene,16),1);assert.equal(mip.anisotropy,4);assert.equal(flat.anisotropy,1);
 const cap=new T.Texture();cap.minFilter=T.LinearMipmapLinearFilter;const s2=new T.Scene();s2.add(new T.Mesh(new T.BoxGeometry(),new T.MeshBasicMaterial({map:cap})));sharpenSceneTextures(s2,2);assert.equal(cap.anisotropy,2,'capped by the device');
 assert.match(read('components/Town.tsx'),/sharpenSceneTextures\(scene,renderer\.capabilities\.getMaxAnisotropy\(\)\);/);}
// 4. Phones start at 1.75 while cool (user decision Sep 26 2026) and never switch resolution by motion; the tiers take it down.
{const Q=load('lib/graphics/quality.ts',{process:{env:{NODE_ENV:'production'}}});assert.equal(Q.PHONE_PIXEL_RATIO,1.75);assert.equal(Q.phoneGraphicsFor(3,true).pixelRatio,1.75);assert.equal(Q.phoneGraphicsFor(2,false).pixelRatio,2,'desktop unchanged');
 const H=load('lib/graphics/heatTier.ts',{localStorage:{getItem:()=>null,setItem(){},removeItem(){}}});assert.equal(H.TIERS[1].maxPixelRatio,1.5,'first sign of throttling: 1.5');
 assert.match(read('lib/graphics/islandHeat.ts'),/new URLSearchParams\(window\.location\.search\)\.get\('heat'\)==='1'/,'hidden ?heat=1 readout');}
// 5. Budget pass: hair/hat style ranges are contiguous for every style (so batches can draw only the rig's style), and phones start at
// 1536² shadows while cool (tiers 1+ cap at 1024², tests/heat-tiers.cjs).
{const {styleIndexRange}=load('lib/graphics/playerBatch.ts');const B=load('lib/graphics/beanSkin.ts',{document:undefined,window:undefined});
 const geos=B.beanGeometries();for(const name of ['hair','hat']){const g=geos[name],anchor=g.getAttribute('beanAnchor');const styles=new Set();for(let i=0;i<anchor.count;i++)styles.add(Math.round(anchor.getW(i)));
  for(const st of styles){if(st===0)continue;const r=styleIndexRange(g,st);assert(r&&r.count>0&&r.count<g.index.count,`${name} style ${st} is one contiguous range`);}}
 const Q=load('lib/graphics/quality.ts',{process:{env:{NODE_ENV:'production'}}});assert.equal(Q.phoneGraphicsFor(3,true).shadowSize,1536);assert.equal(Q.phoneGraphicsFor(2,false).shadowSize,2048,'desktop unchanged');}
console.log('PASS quality pass: tighter shadow fit covers every visible receiver (2-texel bias), watch view fits its pitch, 4× anisotropy on mipmapped textures, phones 1.75 while cool, ?heat=1 readout, contiguous hair/hat style ranges, 1536² phone shadows while cool');
