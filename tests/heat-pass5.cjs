// Heat pass 5 (docs/performance-guide.md): view-based work on phones and prepared-but-off visible options.
// The in-browser "offscreen = no work" and "no on-screen object culled" checks are tests/e2e/offscreen-work.spec.ts.
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),ts=require('typescript'),path=require('path'),T=require('three');
const read=p=>fs.readFileSync(p,'utf8');
function load(file,globals={}){const m={exports:{}};vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,...globals,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts'),globals):require(id)});return m.exports;}

// 1. Far, off-screen live fields are dormant (no clock, sim, bookkeeping or effects) with hysteresis, and wake before they can be seen.
{const rt=read('lib/town/fieldRuntime.ts');
 assert.match(rt,/const near=focus\?Math\.hypot\(focus\.x-v\.x,focus\.z-v\.z\):camDistance,sleepAt=focus\?45:60,wakeAt=focus\?40:50;/,'near = the player (ball-hit zone) when Town passes it, else the camera');
 assert.match(rt,/const dormant=!visible&&viewingFormat!==v\.id&&!teaching&&\(v\.id==='beach'\|\|\(e\.dormant\?near>sphere\.radius\+wakeAt:near>sphere\.radius\+sleepAt\)\);/);// the cay's beach court also sleeps off screen at any distance (tests/beach-match.cjs)
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
 // NPC heat fix 2 (Oct 12 2026): classic-only parts also leave the scene graph; joints, bean meshes (even a hidden bean hat) stay.
 const joint=new T.Group(),jersey=new T.Mesh(new T.BoxGeometry()),decal=new T.Mesh(new T.BoxGeometry()),hat=new T.Mesh(new T.BoxGeometry()),hand=new T.Group(),handMesh=new T.Mesh(new T.BoxGeometry()),longHair=new T.Group(),strand=new T.Mesh(new T.BoxGeometry());
 jersey.visible=decal.visible=false;jersey.add(decal);hat.visible=false;hat.userData.beanPart='hat';handMesh.userData.beanHidden=true;hand.add(handMesh);longHair.name='female-long-hair';strand.userData.beanHidden=true;longHair.add(strand);
 joint.add(jersey,hat,hand,longHair);root.add(joint);
 const src=npcs.match(/const RELEASED=new T\.BufferGeometry\(\);\nfunction releaseHiddenClassic[^\n]*\n[\s\S]*?function detachClassic[^\n]*\n/)[0];const fn=new Function('T',ts.transpile(src,{target:ts.ScriptTarget.ES2020})+'return releaseHiddenClassic;')(T);fn(root);
 assert.equal(hidden.geometry.attributes.position,undefined,'hidden classic geometry released');assert(shown.geometry.attributes.position,'visible meshes untouched');
 assert.equal(hidden.parent,null,'released classic mesh off the graph');assert.equal(shown.parent,root,'drawn mesh stays');
 assert.equal(jersey.parent,null,'hidden classic jersey (with its hidden decal) off the graph');assert.equal(decal.parent,jersey);
 assert.equal(hat.parent,joint,'a hidden BEAN part stays (the skin may show it)');assert.equal(hand.parent,joint,'joints stay');assert.equal(handMesh.parent,null);
 assert.equal(longHair.parent,null,'the classic long-hair group leaves with its strands');
 // NPC heat fix 1: beyond 20 m walking and idle townsfolk pose at ~10 Hz, staggered; their root still follows the route every frame.
 assert.match(npcs,/const FAR_POSE=20,POSE_HZ=10;/);
 assert.match(npcs,/const bucket=Math\.floor\(\(poseClock\+entry\.poseSlot\)\*POSE_HZ\);if\(bucket===entry\.poseBucket&&!entry\.definition\.travel&&!entry\.stunned&&!truckWitnesses\.has\(entry\.id\)&&\(entry\.freestyle\?distance>32&&entry\.routine\.mode!=='walk'&&entry\.routine\.mode!=='approach':distance>FAR_POSE\)\)\{entry\.rig\.root\.position\.set\(entry\.position\.x,entry\.position\.y,entry\.position\.z\);continue;\}entry\.poseBucket=bucket;const poseDt=Math\.min\(entry\.rigElapsed,\.1\);entry\.rigElapsed=0;/);
 assert.match(npcs,/rigElapsed:0,poseSlot:\(index\*\.618034\)%1\/POSE_HZ,poseBucket:-1,/,'spread offsets');
 assert.match(npcs,/poseClock\+=paused\?0:dt;/,'one shared pose clock (stops while paused)');
 // The stagger holds under uneven frame times: simulate the phase lock for 89+100 townsfolk at 20, 30 and 60 fps with jitter.
 for(const fps of [20,30,60]){const n=189,slot=[...Array(n)].map((_,i)=>(i*.618034)%1/10),bucket=new Array(n).fill(-1);let clock=0,max=0,total=0,frames=0,seed=1;
  for(let f=0;f<600;f++){seed=(seed*16807)%2147483647;clock+=1/fps*(.8+.4*seed/2147483647);let posed=0;for(let i=0;i<n;i++){const b=Math.floor((clock+slot[i])*10);if(b!==bucket[i]){bucket[i]=b;posed++;}}if(f>10){max=Math.max(max,posed);total+=posed;frames++;}}
  const mean=total/frames;assert(Math.abs(mean*fps/n-10)<1.2,fps+' fps: ~10 poses per second each');assert(max<=Math.ceil(n*Math.min(1,10*1.2/fps*1.25))+3,fps+' fps: no frame poses everyone ('+max+')');}
 assert(!/\['walk','approach'\]\.includes/.test(npcs),'no per-frame array in the pose loop');}
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
console.log('PASS heat pass 5: dormant far off-screen fields (hysteresis, visible first), 10 Hz off-screen NPC routines, 10 Hz staggered far NPC poses, hidden townsfolk geometry released and detached, fixed arena bounds, visible options off in production');
