// Quality-recovery pass (docs/performance-guide.md): crisper shadows at the same map, anisotropic textures, phones at 1.75 while cool.
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),ts=require('typescript'),path=require('path'),T=require('three');
const read=p=>fs.readFileSync(p,'utf8');
function load(file,globals={}){const m={exports:{}};vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,...globals,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts'),globals):require(id)});return m.exports;}
const {createIslandShadowFit,fitShadowsToBox}=load('lib/graphics/islandShadows.ts');

// 1. The town fit (since Oct 14 2026 createIslandShadowFit: the real camera over the real ground; tests/shadow-fit.cjs covers Summit Isle) covers only the visible receivers: smaller than the old y = −8 / ±8 m fit (so more texels per metre), yet every
// receiver point along the view's corner rays (ground and roofs up to 24 m) stays inside, and the normal bias is 2 texels.
{const light=new T.DirectionalLight();light.shadow.mapSize.set(1024,1024);
 for(const [aspect,elevation] of [[390/844,0],[390/844,28],[834/1194,0],[1280/800,0]]){
  const view=new T.PerspectiveCamera(40,aspect,.1,500);view.position.set(18,23+elevation,30);view.lookAt(2,elevation,-3);const scene=new T.Scene();scene.add(light,light.target);createIslandShadowFit(light,()=>elevation).update(view);const c=light.shadow.camera,w=c.right-c.left,h=c.top-c.bottom;
  // the old fit, for comparison
  const ref=new T.PerspectiveCamera(40,aspect,.1,500);ref.position.set(18,23+elevation,30);ref.lookAt(2,elevation,-3);ref.updateMatrixWorld();
  const sv=new T.OrthographicCamera();sv.position.set(-288,252,198);sv.lookAt(0,0,0);sv.updateMatrixWorld();const tq=light.target.position.clone().applyMatrix4(sv.matrixWorldInverse);let l=1e9,r=-1e9,b=1e9,t=-1e9;const ray=new T.Vector3(),p=new T.Vector3();
  for(const x of [-1,1])for(const y of [-1,1]){ray.set(x,y,.5).unproject(ref).sub(ref.position).normalize();const g=ref.position.clone().addScaledVector(ray,(-8-ref.position.y)/ray.y);for(const hh of [-8,24]){p.set(g.x,hh,g.z).applyMatrix4(sv.matrixWorldInverse);l=Math.min(l,p.x);r=Math.max(r,p.x);b=Math.min(b,p.y);t=Math.max(t,p.y);}}
  const oldArea=(r-l+16)*(t-b+16);assert(w*h<oldArea*.9,`aspect ${aspect.toFixed(2)} elevation ${elevation}: ${w}×${h} vs old ${(r-l+16).toFixed(0)}×${(t-b+16).toFixed(0)}`);
  // coverage: sample receivers along the corner and edge rays at the ground and at roof heights
  for(const x of [-1,0,1])for(const y of [-1,0,1]){ray.set(x,y,.5).unproject(ref).sub(ref.position).normalize();if(ray.y>=0)continue;
   for(const hh of [0,6,12,20].map(v=>v+elevation)){if(hh>=ref.position.y)continue;const q=ref.position.clone().addScaledVector(ray,(hh-ref.position.y)/ray.y);q.applyMatrix4(sv.matrixWorldInverse).sub(tq);
    assert(q.x>=c.left&&q.x<=c.right&&q.y>=c.bottom&&q.y<=c.top,`receiver at ${hh} m on ray (${x},${y}) outside the shadow frustum`);}}
  assert(Math.abs(light.shadow.normalBias-2*Math.max(w,h)/1024)<1e-9,'normal bias = 2 texels (no acne on parapets at the tighter fit)');}}
// 2. The watch view fits the watched pitch: every pitch corner is inside, far tighter than the view-based fit there (~680 m).
{const light=new T.DirectionalLight();light.shadow.mapSize.set(1024,1024);fitShadowsToBox(light,68*250/270/2+3,105*380/400/2+3,0,6);const c=light.shadow.camera;
 const sv=new T.OrthographicCamera();sv.position.set(-288,252,198);sv.lookAt(0,0,0);sv.updateMatrixWorld();
 for(const x of [-34,34])for(const z of [-50,50])for(const y of [0,2.5]){const q=new T.Vector3(x,y,z).applyMatrix4(sv.matrixWorldInverse);assert(q.x>=c.left&&q.x<=c.right&&q.y>=c.bottom&&q.y<=c.top);}
 assert(c.right-c.left<160&&c.top-c.bottom<100,`pitch fit ${c.right-c.left}×${c.top-c.bottom}`);
 const town=read('components/Town.tsx');assert.match(town,/if\(watchedVenue\)fitShadowsToBox\(sun,watchedVenue\.width\/2\+3,watchedVenue\.length\/2\+3,0,6\);else islandShadowFit\.invalidate\(\);/);
 assert.match(town,/if\(watchedVenue\)\{sun\.target\.position\.set\(watchedVenue\.x,watchedVenue\.elevation\?\?0,watchedVenue\.z\);/);assert.match(town,/else islandShadowFit\.update\(camera\);/);}
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
// Phone landscape (batch 2, Oct 23 2026, docs/LANDSCAPE_AUDIT_OCT23.md): the dollied landscape walk view's shadow box is no bigger
// than the portrait one (same 1536² map, so the same or finer texels; before: ~3x the area), the area cap is phone-landscape only,
// and a raised landscape view is capped around the ground under the screen centre (the player keeps sharp shadows).
{const S=load('lib/graphics/islandShadows.ts'),Wc=load('lib/town/walkControl.ts');
 assert.equal(S.shadowAreaCap(.46,true),Infinity);assert.equal(S.shadowAreaCap(2.17,false),Infinity,'desktop: no cap');assert.equal(S.shadowAreaCap(1.33,false),Infinity,'tablet: no cap');
 assert(S.shadowAreaCap(2.17,true)<=S.SHADOW_PORTRAIT_AREA*1.25+1e-9&&S.shadowAreaCap(1.78,true)===S.shadowAreaCap(2.17,true));
 const box=(aspect,dolly,lift=0,cap=Infinity)=>{const light=new T.DirectionalLight();light.shadow.mapSize.set(1536,1536);const scene=new T.Scene();scene.add(light,light.target);
  const view=new T.PerspectiveCamera(40,aspect,1,500);view.position.set(18*dolly,23*dolly+lift,30*dolly);view.lookAt(18*dolly-16,23*dolly+lift-23,30*dolly-33);
  const fit=createIslandShadowFit(light,()=>0);fit.setAreaCap(cap);fit.update(view);const c=light.shadow.camera;return {w:c.right-c.left,h:c.top-c.bottom,c,fit,light};};
 const port=box(393/852,1),old=box(852/393,1),land=box(852/393,Wc.cameraDollyFor(852/393,true)),se=box(667/375,Wc.cameraDollyFor(667/375,true));
 assert(old.w*old.h>2*port.w*port.h,`before: landscape box ${old.w}x${old.h} >> portrait ${port.w}x${port.h}`);
 for(const [n,b] of [['852x393',land],['667x375',se]])assert(b.w*b.h<=1.1*port.w*port.h,`${n} dollied box ${b.w}x${b.h} m <= portrait ${port.w}x${port.h} m`);
 // a raised view (flying ~25 m above the walk height) in landscape: capped near the portrait area, the player's ground still inside
 const capArea=S.shadowAreaCap(2.17,true),free=box(2.17,Wc.cameraDollyFor(2.17,true,'fly'),25),capped=box(2.17,Wc.cameraDollyFor(2.17,true,'fly'),25,capArea);
 assert(free.w*free.h>capArea,'the raised view needs more than the cap');assert(capped.fit.stats.capped>0&&capped.w*capped.h<free.w*free.h&&capped.w*capped.h<=capArea*1.6,`capped ${capped.w}x${capped.h}`);
 const sb=S.sunBasis();
 const inside=(v,b)=>{const t=b.light.target.position,x=v.dot(sb.right)-t.dot(sb.right),y=v.dot(sb.up)-t.dot(sb.up);return Math.abs(x)<b.c.right*.92&&Math.abs(y)<b.c.top*.92;};
 {const view=new T.PerspectiveCamera(40,2.17,1,500),d=Wc.cameraDollyFor(2.17,true,'fly');view.position.set(18*d,23*d+25,30*d);view.lookAt(18*d-16,23*d+25-23,30*d-33);view.updateMatrixWorld();
  for(const sy of [-1,-.75,-.5,-.25]){const r=new T.Vector3(0,sy,.5).unproject(view).sub(view.position).normalize(),g=view.position.clone().addScaledVector(r,-view.position.y/r.y);assert(inside(g,capped),`capped box keeps the near ground (screen y ${sy})`);}}
 // the cap never bites the dollied walk view, and the map size (cost) is untouched
 const lw=box(2.17,Wc.cameraDollyFor(2.17,true),0,capArea);assert.equal(lw.fit.stats.capped,0,'walking landscape is under the cap');assert.equal(lw.light.shadow.mapSize.x,1536);}
console.log('PASS quality pass: tighter shadow fit covers every visible receiver (2-texel bias), watch view fits its pitch, 4× anisotropy on mipmapped textures, phones 1.75 while cool, ?heat=1 readout, contiguous hair/hat style ranges, 1536² phone shadows while cool');
