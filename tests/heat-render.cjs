// Heat audit pass 2 (docs/performance-guide.md, "Heat audit pass 2"): 3D rendering work that must stay removed.
// 1. Out of night mode the pooled pitch spotlights are hidden (not just zero intensity), so lit shaders skip them;
//    within night (including zero-intensity teaching views) they stay, so lessons never switch shader variants.
// 2. Moving shadow casters (townsfolk, rides, cars) whose swept shadow volume misses the view skip the shadow pass only,
//    and are restored afterwards, even when the pass throws.
// 3. rooftopTravel indexes static roof props instead of scanning getter-backed copies on every query, with identical
//    answers, while dynamic (opening ball-hunt) boxes stay live.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict'),T=require('three'),ts=require('typescript');
(async()=>{
const utils=await import('three/examples/jsm/utils/BufferGeometryUtils.js'),cache=new Map(),gradient={addColorStop(){}};const ctx=new Proxy({createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
function load(file){file=path.resolve(__dirname,'..',file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,Float32Array,Set,Map,document:{createElement:()=>({getContext:()=>ctx})},localStorage:{getItem:()=>null,setItem(){}},require:id=>id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('.')?load(path.relative(path.join(__dirname,'..'),path.resolve(path.dirname(file),id+'.ts'))):require(id)});return m.exports;}

// 1. Spot pool
{const scene=new T.Scene(),fields=load('lib/town/fields.ts').buildFormatFields(scene),venues=load('lib/town/venues.ts').VENUES,camera=new T.PerspectiveCamera(50,1,.1,500);
 const pool=scene.getObjectByName('field-floodlight-pool'),v=venues[0];camera.position.set(v.x+20,30,v.z+30);camera.lookAt(v.x,0,v.z);camera.updateMatrixWorld();
 for(const mode of ['day','sunset']){fields.updateLighting(mode,camera,null,1/30,true);assert.equal(pool.visible,false,`${mode}: pool out of the shader`);}
 fields.updateLighting('night',camera,null,.2,true,false,{x:v.x,y:(v.elevation??0)+.105,z:v.z});assert.equal(pool.visible,true,'night: pool in the shader');
 fields.setIsolated(true);fields.updateLighting('night',camera,v.id,.2,true);assert.equal(pool.visible,true,'night lesson: zero intensity but no shader switch');
 assert(pool.children.filter(o=>o.isLight).every(l=>l.intensity===0));fields.setIsolated(false);
 fields.updateLighting('day',camera,null,1/30);assert.equal(pool.visible,true,'still visible while night fades');
 for(let i=0;i<400;i++)fields.updateLighting('day',camera,null,1/30);assert.equal(pool.visible,false,'hidden once the fade settles');
 fields.dispose();}

// 2. Dynamic shadow culling
{const {createShadowVisibility}=load('lib/graphics/shadowVisibility.ts');const scene=new T.Scene(),sun=new T.DirectionalLight();sun.position.set(-20,20,0);sun.target.position.set(0,0,0);
 const camera=new T.PerspectiveCamera(50,1,.1,100);camera.position.set(0,10,20);camera.lookAt(0,0,0);camera.updateMatrixWorld();
 const folk=new T.Group();folk.name='island-townsfolk';scene.add(folk);
 const rig=(x,z)=>{const g=new T.Group();g.position.set(x,0,z);const body=new T.Mesh(new T.BoxGeometry(.6,1.8,.4),new T.MeshBasicMaterial());body.position.y=.9;body.castShadow=true;g.add(body);folk.add(g);return g;};
 const near=rig(0,0),far=rig(300,0),edge=rig(-14,0),upSun=rig(-40,0);scene.updateMatrixWorld(true);
 let fail=false,seen=null;const original=()=>{seen={near:near.visible,far:far.visible,edge:edge.visible,upSun:upSun.visible};if(fail)throw Error('render failure');};
 const renderer={shadowMap:{render:original}},effect=createShadowVisibility(renderer,scene,sun);effect.addDynamicRoots([folk]);
 renderer.shadowMap.render([sun],scene,camera);
 assert.deepEqual(seen,{near:true,far:false,edge:true,upSun:false},'distant rig skipped; rig whose shadow reaches the view kept');
 assert(far.visible&&upSun.visible,'visibility restored after the pass');assert.equal(effect.stats.dynamicCulled,2);
 fail=true;assert.throws(()=>renderer.shadowMap.render([sun],scene,camera));assert(far.visible,'restored on exception');fail=false;
 effect.setDynamic(false);renderer.shadowMap.render([sun],scene,camera);assert.equal(seen.far,true,'switch restores the full pass');
 far.position.set(1,0,1);far.updateMatrixWorld(true);effect.setDynamic(true);renderer.shadowMap.render([sun],scene,camera);assert.equal(seen.far,true,'a rig that walks into view casts again');
 effect.dispose();assert.equal(renderer.shadowMap.render,original);}
assert.match(fs.readFileSync(path.join(__dirname,'..','components/Town.tsx'),'utf8'),/shadowVisibility\.addDynamicRoots\(\[islandNpcs\.root,streetTraffic\.root\]\)/,'Town registers townsfolk and traffic');

// 3. Rooftop landing surfaces: static props indexed, answers identical to the all-live (getter) path
{const {createRooftopTravel}=load('lib/town/rooftopTravel.ts');let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 const roofs=[];for(let i=0;i<40;i++)roofs.push({x:rnd()*200-100,z:rnd()*200-100,w:4+rnd()*20,d:4+rnd()*20,height:2+rnd()*12,stepAccess:rnd()<.2});
 const obstacles=roofs.map(r=>({x:r.x,z:r.z,w:r.w,d:r.d}));
 const mk=()=>{const props=[];let s2=11;const r2=()=>(s2=(s2*16807)%2147483647)/2147483647;for(let i=0;i<150;i++)props.push({x:r2()*200-100,z:r2()*200-100,w:r2()*4,d:r2()*4,floor:r2()*8,top:1+r2()*14,noLanding:r2()<.1});props.push({dynamic:true,x:500,z:500,w:1.6,d:1.3,floor:0,top:.9,noLanding:false});return props;};
 const plainProps=mk(),liveProps=mk().map(p=>{if(p.dynamic)return p;const q={...p};return {get x(){return q.x;},get z(){return q.z;},get w(){return q.w;},get d(){return q.d;},get top(){return q.top;},get floor(){return q.floor;},noLanding:q.noLanding};});
 const a=createRooftopTravel(roofs,obstacles,{x:0,z:0},plainProps),b=createRooftopTravel(roofs,obstacles,{x:0,z:0},liveProps);
 for(let i=0;i<20000;i++){const x=rnd()*220-110,z=rnd()*220-110;assert.equal(a.canLand(x,z),b.canLand(x,z),`canLand ${x},${z}`);assert.equal(a.surface(x,z),b.surface(x,z),`surface ${x},${z}`);}
 const box=plainProps[plainProps.length-1];assert.equal(a.surface(500,500),.9);box.top=0;box.w=box.d=0;assert.equal(a.surface(500,500)<.9,true,'dynamic box stays live after it opens');}
// 4. Dynamic resolution (user-approved proposal A): phones/tablets 1.5x while moving, 2x after 0.5 s still; desktop untouched.
{const {MotionResolution,dynamicResolutionEnabled,MOVING_PIXEL_RATIO,SHARP_SETTLE_MS}=load('lib/graphics/quality.ts');
 assert.equal(MOVING_PIXEL_RATIO,1.5);assert(SHARP_SETTLE_MS>=400&&SHARP_SETTLE_MS<=600);
 assert.equal(dynamicResolutionEnabled(3,false),true,'DPR 3 phone');assert.equal(dynamicResolutionEnabled(2,true),true,'coarse-pointer tablet');assert.equal(dynamicResolutionEnabled(2,false),false,'desktop DPR 2');assert.equal(dynamicResolutionEnabled(1,false),false,'desktop DPR 1');
 const desk=new MotionResolution(2,false);for(let t=0;t<3000;t+=33)assert.equal(desk.update(t,t%200<100),0,'desktop never switches');assert.equal(desk.ratio,2);
 assert.equal(new MotionResolution(1.5,true).enabled,false,'nothing to drop on a DPR 1.5 device');
 const m=new MotionResolution(2,true);assert.equal(m.update(0,false),0,'starts sharp');assert.equal(m.update(33,true),1.5,'movement drops at once');assert.equal(m.update(66,true),0);
 let t=66;for(;t<66+SHARP_SETTLE_MS-40;t+=33)assert.equal(m.update(t,false),0,'no early return to sharp');
 let back=0;for(;t<66+SHARP_SETTLE_MS+100;t+=33){const r=m.update(t,false);if(r)back=r;}assert.equal(back,2,'sharp after the settle time');
 assert.equal(m.update(t+=33,true),1.5);assert.equal(m.update(t+=33,false,true),2,'menus/quizzes are sharp at once');
 const j=new MotionResolution(2,true);let switches=0;for(let k=0;k<5000;k+=33){if(j.update(k,Math.floor(k/100)%2===0))switches++;}assert.equal(switches,1,'jittery move/still input never thrashes back to sharp');assert.equal(j.ratio,1.5);
 const town=fs.readFileSync(path.join(__dirname,'..','components/Town.tsx'),'utf8');
 assert.match(town,/new MotionResolution\(quality\.pixelRatio,dynamicResolutionEnabled\(/,'Town builds the helper from the existing quality cap');
 assert.match(town,/motionResolution\.update\(now,viewMoved\|\|Math\.hypot\(velocity\.x,velocity\.z\)>\.1\|\|Boolean\(learning&&!quiz\?\.quiz\),paused\|\|Boolean\(quiz\?\.quiz\)\|\|aimWaiting\)/,'moving = camera/player/live view; menus, quizzes and aim are sharp');
 assert.match(town,/if\(resolution\)\{renderer\.setPixelRatio\(resolution\);renderer\.setViewport\([^)]*\);\}\n\s*(heat\.beforeRender\(location[^;]*\);)?renderer\.render\(scene,camera\)/,'switch happens at the frame boundary right before drawing');}
console.log('PASS heat pass 2: dynamic resolution (move 1.5 / still 2 / desktop off / no thrash); spot pool out of day shaders, night lessons keep it; dynamic shadow culling + restore; rooftop static index parity (20000 points) with live dynamic boxes');
})().catch(e=>{console.error(e);process.exit(1);});
