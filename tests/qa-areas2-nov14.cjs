// QA round 3 (areas 2), Nov 14 2026: the owner's defaults for the round-2 polish list, and the areas found while playing.
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const loaded=new Map();function load(file){file=path.resolve(ROOT,file);if(!/\.tsx?$/.test(file)&&fs.existsSync(file+'.ts'))file+='.ts';if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Float32Array,Uint8Array,Uint16Array,Uint32Array,console,
  require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id)):require(id)});loaded.set(file,mod.exports);return mod.exports;}
let n=0;const ok=(name,fn)=>{fn();n++;console.log('ok',name);};

// 1. No palm stands between an outdoor Coral Cay gashapon and the island camera (before: the plaza's east palm and two Sharks
//    Beach palms covered the kid and the machine in the follow view).
ok('Cay gashapon views match the machine data and no palm stands in them',()=>{
 const W=load('lib/town/coralCayWorld.ts'),M=load('lib/gashapon/machines.ts');
 const list=Object.values(M).find(v=>Array.isArray(v)&&v[0]?.id?.startsWith?.('gs-'));
 for(const id of ['gs-cayplaza','gs-sharks']){const m=list.find(x=>x.id===id);assert(m,id);
  assert(W.CAY_GASHAPON_VIEWS.some(v=>v.x===m.x&&v.z===m.z),`${id} (${m.x}, ${m.z}) is in CAY_GASHAPON_VIEWS`);
  assert(Math.abs(m.yaw-Math.atan2(16,33))<1e-9,`${id} faces the island camera`);
  // The camera side of the machine is in the view; the back is not.
  assert(W.inGashaponView(m.x+Math.sin(m.yaw)*10,m.z+Math.cos(m.yaw)*10)&&!W.inGashaponView(m.x-Math.sin(m.yaw)*10,m.z-Math.cos(m.yaw)*10));}
 const T=require('three'),palms=[],mesh=()=>new T.Mesh(),noop=()=>{};
 W.buildCoralCay({box:mesh,cylinder:mesh,put:mesh,line:mesh,sign:mesh,palm:(x,z)=>palms.push([x,z]),house:noop,table:noop,planter:noop,path:noop,districtSign:noop,obstacles:[],buildings:[],assets:[],surfaceAreas:[]});
 assert(palms.length>40,'the cay still has its palms ('+palms.length+')');
 for(const [x,z] of palms)assert(!W.inGashaponView(x,z),`palm at (${x.toFixed(1)}, ${z.toFixed(1)}) stands in a gashapon's camera view`);
});

// 2. Rooftop Knockout: the four floodlight posts stand outside the 26 x 48.5 m cage (one stood on the pitch), still on the roof.
ok('Knockout floodlights stand outside the cage, on the roof',()=>{
 const {fieldLightLayout}=load('lib/town/fieldLightLayout.ts'),K=load('lib/games/rooftopKnockout.ts');
 const {posts}=fieldLightLayout({id:'knockout',width:24,length:44});
 for(const p of posts){
  assert(Math.abs(p.x)-.375>K.ARENA.w/2&&Math.abs(p.z)-.375>K.ARENA.d/2,`post (${p.x}, ${p.z}) is outside the cage`);
  assert(Math.abs(p.x)+.375<K.KNOCKOUT_ROOF.w/2&&Math.abs(p.z)+.375<K.KNOCKOUT_ROOF.d/2,`post (${p.x}, ${p.z}) is on the roof`);}
 // Other venues keep their layout.
 const v=fieldLightLayout({id:'7v7',width:40,length:60});assert.equal(v.posts[0].x,-22.3);
});

// 3. Rooftop Knockout has a Leave button (the live match's Leave pill) that sets you down off the roof, so the round ends.
ok('Knockout Leave: button, frame wiring and a street exit',()=>{
 const hud=read('components/LiveJoinHud.tsx'),town=read('components/Town.tsx'),css=read('app/globals.css');
 assert.match(hud,/export function KnockoutLeave\(\{onLeave\}[^]*data-knockout-leave className=\{styles\.leave\} onClick=\{onLeave\}[^]*hidden>Leave<\/button>/);
 assert.match(town,/<KnockoutLeave onLeave=\{\(\)=>\{knockoutLeaveRef\.current=true;\}\}\/>/);
 assert.match(town,/if\(knockoutLeaveRef\.current\)\{knockoutLeaveRef\.current=false;if\(liveKnockout\.joined\)\{const \{x,z,yaw\}=KNOCKOUT_EXIT;/);
 assert.match(town,/setUIHidden\(arenaLeave,!liveKnockout\.joined\)/);
 assert.match(css,/\.town-app:has\(\[data-knockout-leave\]:not\(\[hidden\]\)\) nav\[data-hud-triggers\]\{display:none!important\}/,'Leave takes the settings spot');
 const K=load('lib/games/rooftopKnockout.ts'),e=K.KNOCKOUT_EXIT,r=K.KNOCKOUT_ROOF;
 assert(Math.abs(e.z-r.z)>r.d/2+1,'the exit is off the roof (the round ends when you are not on it)');
});

// 4. The lighthouse ladder: no "Change ride" mid-climb (it dropped you 5 m to the foot on a ride); R does nothing there either.
ok('Ladder hides Change ride while climbing',()=>{
 const town=read('components/Town.tsx'),css=read('app/globals.css');
 assert.match(town,/travel\.toggleAttribute\('data-on-ladder',rooftop\.ladder\.active\)/);
 assert.match(town,/const guardedCycleRide=\(\)=>\{if\(document\.querySelector\('\.travel-actions\[data-on-ladder\]'\)\)return;/);
 assert.match(town,/e\.key\.toLowerCase\(\)==='r'&&!fieldMenu\.current&&!lessonRef\.current&&!rooftop\.ladder\.active\)cycleRide\(\)/);
 assert.match(css,/\.travel-actions\[data-on-ladder\] \.travel-mode\{visibility:hidden;pointer-events:none\}/);
});

// 5. three.js "toNonIndexed(): BufferGeometry is already non-indexed" (once a session): the vending cabinet merged a mix of
//    indexed boxes and already-flat lit parts.
ok('Vending cabinet only flattens indexed parts',()=>{
 assert.match(read('lib/graphics/vendingMachines.ts'),/const flat=parts\.map\(g=>g\.index\?g\.toNonIndexed\(\):g\)/);
});

// 6. Stadium Park pond: no "Net the dragonfly" while swimming in the middle of the pond (on foot only; wading still counts).
ok('Pond net is on foot only, not swimming',()=>{
 const PB=load('lib/town/pondBugs.ts'),base={ride:'walk',onGround:true,canEnter:true,job:false};
 assert(PB.pondNetAllowed(base)&&PB.pondNetAllowed({...base,swimming:false})&&!PB.pondNetAllowed({...base,swimming:true}));
 assert.match(read('components/Town.tsx'),/under:water\.diveActive,swimming:water\.swimming\}\)\?pondLife\.nearFly/);
});

console.log(`PASS qa-areas2-nov14: ${n} checks`);
