// Heat pass 5 (docs/performance-guide.md): view-based work on phones and prepared-but-off visible options.
// The in-browser "offscreen = no work" and "no on-screen object culled" checks are tests/e2e/offscreen-work.spec.ts.
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),ts=require('typescript'),path=require('path'),T=require('three');
const read=p=>fs.readFileSync(p,'utf8');
function load(file,globals={}){const m={exports:{}};vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,...globals,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts'),globals):require(id)});return m.exports;}

// 1. Far, off-screen live fields are dormant (no clock, sim, bookkeeping or effects) with hysteresis, and wake before they can be seen.
{const rt=read('lib/town/fieldRuntime.ts');
 assert.match(rt,/const dormant=!visible&&viewingFormat!==v\.id&&!teaching&&\(e\.dormant\?camDistance>sphere\.radius\+50:camDistance>sphere\.radius\+60\);/);
 const i=rt.indexOf('if(dormant){stats.dormant++;continue;}'),clock=rt.indexOf('const matchDt=e.clock.take(');assert(i>0&&i<clock,'dormant fields leave before the clock, sim and bookkeeping');
 assert(rt.indexOf('const visible=')<i,'visibility (frustum + 240 m) is decided first: a field in view is never dormant');
 assert.match(rt,/if\(matchDt>0\|\|!e\.synced\)\{e\.liveFrame\.sync\(e\.sim\.players\);e\.synced=true;\}/,'audit F23');}
// 2. Off-screen townsfolk step their routines at 10 Hz; on-screen, near, stunned, frozen and conversing ones every frame.
{const npcs=read('lib/graphics/islandNpcs.ts');
 assert.match(npcs,/if\(!camera\|\|entry\.near\|\|entry\.stunned\|\|entry\.routine\.partner!==null\|\|frozen\.has\(entry\.id\)\)\{fastRoutine\.push\(entry\);continue;\}/);
 assert.match(npcs,/\(viewFrustum\.intersectsSphere\(viewSphere\)\?fastRoutine:slowRoutine\)\.push\(entry\);/);
 assert.match(npcs,/slowRoutineDt>=\.1/);
 assert.match(npcs,/rig\.setBeanLook\(dress\.look,dress\.outfit\);releaseHiddenClassic\(rig\.root\);root\.add\(rig\.root\);/,'townsfolk release the classic body geometry the bean skin hides');
 // the release only touches skin-hidden meshes
 const root=new T.Group(),hidden=new T.Mesh(new T.BoxGeometry()),shown=new T.Mesh(new T.BoxGeometry());hidden.userData.beanHidden=true;root.add(hidden,shown);
 const src=npcs.match(/const RELEASED=new T\.BufferGeometry\(\);\nfunction releaseHiddenClassic[^\n]*\n/)[0];const fn=new Function('T',ts.transpile(src,{target:ts.ScriptTarget.ES2020})+'return releaseHiddenClassic;')(T);fn(root);
 assert.equal(hidden.geometry.attributes.position,undefined,'hidden classic geometry released');assert(shown.geometry.attributes.position,'visible meshes untouched');}
// 3. Audit F19: the knockout arena bounds are assigned once, not recomputed over all instances every frame.
{const k=read('lib/graphics/liveKnockout.ts');assert(!/computeBoundingSphere\(\)/.test(k));assert.match(k,/mesh\.boundingSphere=new T\.Sphere\(new T\.Vector3\(0,1,0\),40\)/);}
// 4. Visible options are prepared but OFF in production, and development overrides never reach production.
{const H=load('lib/graphics/heatTier.ts',{localStorage:{getItem:()=>null,setItem(){},removeItem(){}},process:{env:{NODE_ENV:'production'}},window:{__fiHeatOptions:{spectate24:true}}});
 assert.deepEqual({...H.HEAT_OPTIONS},{spectate24:false,spectateDpr125:false,fewerAmbient:false,lambertScenery:false});
 assert.deepEqual({...H.heatOptions()},{spectate24:false,spectateDpr125:false,fewerAmbient:false,lambertScenery:false},'production ignores the dev override');
 const {createIslandHeat}=load('lib/graphics/islandHeat.ts',{localStorage:{getItem:()=>null,setItem(){},removeItem(){}},process:{env:{NODE_ENV:'production'}}});
 let limit=Infinity;const cars=[{index:1,group:{visible:true,position:{x:0,z:0}}}];const heat=createIslandHeat({renderer:{shadowMap:{autoUpdate:true,needsUpdate:false}},sun:{shadow:{mapSize:{x:1024,set(){}},map:null}},resolution:{setLimit:v=>limit=v},npcs:{setDrawDistance(){}},traffic:{cars,rider:{index:-1}},governed:true});
 heat.beforeRender({x:0,z:0},true);assert.equal(heat.frameMs,1000/30,'spectating stays 30 fps while spectate24 is off');assert.equal(limit,Infinity,'and sharp');assert(cars[0].group.visible,'no car thinned');heat.dispose();
 const town=read('components/Town.tsx');assert.match(town,/if\(quality\.phone&&heatOptions\(\)\.lambertScenery\)applyLambertScenery\(scene\);/);}
// 5. The Lambert option only swaps the static scenery chunks.
{const {applyLambertScenery}=load('lib/graphics/lambertScenery.ts');const scene=new T.Scene(),std=new T.MeshStandardMaterial({color:'#abcdef'});
 const chunk=new T.Mesh(new T.BoxGeometry(),std);chunk.name='island-chunk-0:0';const rig=new T.Mesh(new T.BoxGeometry(),std);rig.name='bean-body';scene.add(chunk,rig);
 assert.equal(applyLambertScenery(scene),1);assert(chunk.material instanceof T.MeshLambertMaterial);assert.equal(chunk.material.color.getHexString(),'abcdef');assert.equal(rig.material,std);}
console.log('PASS heat pass 5: dormant far off-screen fields (hysteresis, visible first), 10 Hz off-screen NPC routines, hidden townsfolk geometry released, fixed arena bounds, visible options off in production');
