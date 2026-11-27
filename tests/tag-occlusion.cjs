// Name tags behind solid structures (owner, Nov 26 2026, shot 139: an NPC tag drew on top of the stadium's big screen).
// lib/town/tagOcclusion.ts: the stadium screen, stands, roofs and every building block hide the shown tag when they sit between
// its anchor and the camera; a tag in front stays; a solid holding the anchor or the camera is skipped; Town and islandNpcs wire it.
// usage: node tests/tag-occlusion.cjs
// usage: node tests/stadium-flight-bump.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}},store=new Map();
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const context=vm.createContext({console,Math,Set,Map,performance,Date,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,
 window:{addEventListener:()=>{},removeEventListener:()=>{},matchMedia:()=>({matches:false})},requestAnimationFrame:()=>1,setTimeout:()=>1,setInterval:()=>1,
 localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){const file=path.resolve(base,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('@/')?load(id.slice(2)+'.ts'):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id));cache.set(file,mod.exports);return mod.exports;}
const src=f=>fs.readFileSync(path.resolve(base,f),'utf8');
const O=load('lib/town/tagOcclusion.ts'),Q=load('lib/town/stadiumSeats.ts'),L=load('lib/town/westParkLayout.ts');
const S=L.STADIUM,SC=Q.SCREEN,zs=S.z+SC.z;
const solids=O.tagOccluderSolids([{x:0,z:0,w:10,d:10,height:8,name:'BOX'},{x:30,z:0,w:1,d:1,height:3,name:'KIOSK POST'}]);
// The big screen is an occluder (and the stands, roofs; no thin posts / masts / flags).
assert.ok(solids.some(q=>q.kind==='stadium-screen'),'the stadium big screen hides tags');
for(const k of ['stadium-stand','stadium-roof','stadium-fascia'])assert.ok(solids.some(q=>q.kind===k),k+' hides tags');
for(const k of ['stadium-mast','stadium-screenPost','stadium-flag','stadium-head'])assert.ok(!solids.some(q=>q.kind===k),k+' is too thin to hide a tag');
assert.ok(solids.some(q=>q.kind==='building:BOX')&&!solids.some(q=>q.kind==='building:KIOSK POST'),'buildings hide tags; tiny blocks do not');
// Owner shot 139: close to the screen, the townsperson on the other side of it: hidden.
assert.equal(O.tagBlocked(solids,S.x+1,SC.y,zs-3,S.x-2,SC.y+1.5,zs+12),true,'a tag behind the big screen is hidden');
// The same camera, the townsperson between it and the screen: shown.
assert.equal(O.tagBlocked(solids,S.x+1,SC.y-8,zs+5,S.x-2,SC.y+1.5,zs+12),false,'a tag in front of the screen stays');
// The play camera high above, the townsperson beside the screen's back: shown (as before).
assert.equal(O.tagBlocked(solids,S.x+12,2.6,zs+4,S.x+12,30,zs+24),false,'top-down camera near the stadium keeps the tag');
// A building between: hidden; the anchor inside a building block (a shopkeeper): the block is skipped.
assert.equal(O.tagBlocked(solids,0,2.5,-12,0,4,12),true,'a tag behind a building is hidden');
assert.equal(O.tagBlocked(solids,0,2.5,2,0,30,22),false,'a solid holding the anchor never hides its tag');
// Oriented boxes: a 45° box blocks along its diagonal.
const rot={x:0,z:0,hw:2,hd:.2,c:Math.SQRT1_2,s:-Math.SQRT1_2,y0:0,y1:5,reach:2.1,kind:'t'};
assert.equal(O.segmentHitsSolid(-1,1,-1,1,1,1,rot),true);assert.equal(O.segmentHitsSolid(3,1,-3,3,1,3,rot),false);
// Throttle: a re-test only every interval, at once on a new owner.
const occ=O.createTagOcclusion(solids,.12),a={},b={};
assert.equal(occ.update(.016,a,0,2.5,-12,0,4,12),true);assert.equal(occ.update(.016,a,0,2.5,-12,0,4,-30),true,'held until the interval');
assert.equal(occ.update(.016,b,0,2.5,-12,0,4,-30),false,'a new owner re-tests at once');
// Wiring.
assert.match(src('components/Town.tsx'),/islandNpcs\.setTagOcclusion\(createTagOcclusion\(tagOccluderSolids\(world\.buildings\)\)\)/);
assert.match(src('lib/graphics/islandNpcs.ts'),/tagOcclusion\.update\(dt,show,/);
console.log('tag-occlusion: ok ('+solids.length+' solids)');
})().catch(e=>{console.error(e);process.exit(1);});
