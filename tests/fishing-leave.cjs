// Leaving a fishing spot by ANY means ends the session and hides the HUD (Oct 15 2026, user: "fix this bug where fishing hud is
// showing when flying", then "it happened when i was in the water and it refreshed"). Runs the real fishingWorld.ts driver with a
// real fishingSession.ts: walk away, any ride / launch / water (onFoot false), the Back button, all of them while paused under the
// Fishbook / balances too, and the refresh case: a Town remount (Fast Refresh, warm rebuild) builds a NEW world while the shared
// session (fishingStore.ts hot.session) is still active; that orphaned session must end, never float its HUD over the island.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),T=require('three');
const ROOT=path.resolve(__dirname,'..');
const ctx2d=new Proxy({},{get:(t,k)=>k==='measureText'?()=>({width:10}):k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):()=>{},set:()=>true});
const document={createElement:()=>({width:0,height:0,getContext:()=>ctx2d,style:{}}),querySelector:()=>null,dispatchEvent(){}};
const noop=new Proxy(function(){},{get:(t,k)=>k==='busy'?false:k==='then'?undefined:noop,apply:()=>undefined});
const visualsStub={createFishingVisuals:()=>noop};
const cache=new Map();
const context=vm.createContext({console,Set,Map,WeakMap,Math,Date,JSON,Promise,Object,Array,Number,String,Error,URL,structuredClone,queueMicrotask,Symbol,
 Float32Array,Float64Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,document,performance,setTimeout,clearTimeout});
function load(name){const file=path.resolve(ROOT,name);if(cache.has(file))return cache.get(file);
 const real=[file,file+'.ts',file+'.tsx'].find(f=>fs.existsSync(f)&&fs.statSync(f).isFile());const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(real,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>/\/fishingVisuals$/.test(id)?visualsStub:id.startsWith('.')?load(path.resolve(path.dirname(real),id)):id.startsWith('@/')?load(path.resolve(ROOT,id.slice(2))):require(id));
 cache.set(file,mod.exports);return mod.exports;}
const {createFishingWorld}=load('lib/town/fishing/fishingWorld.ts'),{createFishingSession}=load('lib/town/fishing/fishingSession.ts'),{FISH_SPOTS}=load('lib/town/fishing/fishCatalog.ts');
let checks=0;const ok=(c,m)=>{assert(c,m);checks++;};
const spot=FISH_SPOTS.find(s=>!s.boat),camera=new T.PerspectiveCamera();camera.updateMatrixWorld();
let now=1000;
const frame=(w,o={})=>{now+=16;return w.update({x:spot.x,z:spot.z,onFoot:true,canEnter:true,ray:null,now,dt:.016,elapsed:now/1000,reduced:true,camera,width:1280,height:800,
 mobile:false,blocked:false,ui:()=>null,place(){},hide(){},...o});};
const setup=()=>{const scene=new T.Scene(),player=new T.Object3D(),session=createFishingSession(()=>({isNew:false,isBiggest:false,inBasket:true}),()=>{});
 const world=createFishingWorld(scene,player,session);frame(world);session.start(spot.id);frame(world);
 assert(session.getView().active&&world.update,'fishing started');return {world,session,scene,player};};
const leaves={
 'walk away':{x:spot.x+3,z:spot.z},
 'jetpack takeoff / any ride (onFoot false)':{onFoot:false},
 'into the water (onFoot false)':{onFoot:false},
 'teleport / map travel far away':{x:spot.x+400,z:spot.z-300,onFoot:true},
 'a cannon launch far in the air':{x:spot.x+30,z:spot.z+30,onFoot:false},
};
for(const [name,o] of Object.entries(leaves))for(const paused of [false,true]){
 const {world,session}=setup();if(paused)session.pause(true);
 frame(world,{...o,canEnter:!paused});/* Town: a dialog / balances make canEnter false */
 ok(!session.getView().active,`${name}${paused?' (paused under the Fishbook / balances)':''}: the session ends within a frame`);
 ok(!world.focused,`${name}: the fishing camera / focus lets go`);world.dispose();}
// The Back button, paused or not.
for(const paused of [false,true]){const {world,session}=setup();if(paused)session.pause(true);session.stop();frame(world,{canEnter:!paused});
 ok(!session.getView().active,`Back${paused?' while paused':''} ends it`);world.dispose();}
// Opening the Fishbook / balances at the spot (canEnter false only because of that dialog) does NOT end the session.
{const {world,session}=setup();session.pause(true);for(let i=0;i<5;i++)frame(world,{canEnter:false});ok(session.getView().active,'a dialog over a live session keeps it');
 session.pause(false);frame(world);ok(session.getView().active,'and fishing goes on when it closes');world.dispose();}
// The refresh: a remount builds a second world while the shared session is still active. The old world never ran its stop.
{const {world,session,scene,player}=setup();ok(session.getView().active,'fishing before the refresh');
 const fresh=createFishingWorld(scene,player,session);/* the new world (fishing=false) drives the SAME session object */
 frame(fresh,{x:spot.x+80,z:spot.z+80,onFoot:false});/* the player is swimming / flying elsewhere */
 ok(!session.getView().active,'a session the current world is not fishing is ended (no HUD floating while flying)');world.dispose();fresh.dispose();}
// Disposing the world while fishing (Town unmount / Fast Refresh) ends the session too.
{const {world,session}=setup();world.dispose();ok(!session.getView().active,'world.dispose() ends a live session');}
// Source guards: the leave check runs before the paused early-return.
{const src=fs.readFileSync(path.join(ROOT,'lib/town/fishing/fishingWorld.ts'),'utf8');
 const leave=src.indexOf('if(fishing&&(session.takeStop()||'),pause=src.indexOf('if(session.paused){');
 ok(leave>0&&pause>leave,'the leave / stop check runs before the paused early-return');
 ok(/if\(!fishing&&session\.getView\(\)\.active\)session\.end\(\);/.test(src),'an orphaned active session is ended every frame');}
console.log(`fishing-leave: ${checks} checks passed`);
