// Pond dragonflies, netted (Nov 13 2026, lib/town/pondBugs.ts + lib/town/parkPond.ts): the two Stadium Park pond dragonflies are the
// Bug book's Midfield Dragonfly, caught on foot with a Net it prompt when the player is calm. usage: node tests/pond-bugs.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const store=new Map();
const context=vm.createContext({console,Math,Set,Map,performance,Date,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,
 window:{addEventListener:()=>{},removeEventListener:()=>{},matchMedia:()=>({matches:false})},
 requestAnimationFrame:()=>1,setTimeout:()=>1,setInterval:()=>1,
 localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){const file=path.resolve(base,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id));cache.set(file,mod.exports);return mod.exports;}

const read=f=>fs.readFileSync(path.join(base,f),'utf8');
// 1. A pond catch is the Bug book's existing Midfield Dragonfly: no new species, the 20-bug squad and the totals unchanged.
const B=load('lib/town/jobs/bugBook.ts'),PB=load('lib/town/pondBugs.ts'),SP=load('lib/town/jobs/bugSpecies.ts');
assert(SP.BUG_SPECIES.some(s=>s.id===PB.POND_DRAGONFLY_ID&&s.name==='Midfield Dragonfly'),'the pond dragonfly is the Midfield Dragonfly');
assert.equal(B.BUG_IDS.length,20,'still 20 bugs');assert.equal(B.BUG_BOOK_SIZE,28,'still 28 pages');
assert(/20-bug squad/.test(read('components/BugBook.tsx')),'the 20-bug squad copy stays right');
{let saved=null;const port={get:()=>saved,set:v=>{saved=v;}},fired=[];const fire=(t,n,d)=>fired.push([t,n,d]);
 const a=PB.netPondDragonfly(port,fire);assert(a.first&&a.count===1,'first pond catch is a first catch');
 assert(fired.some(([t,n,d])=>t==='document'&&n===B.BUG_NEW_SPECIES_EVENT&&d==='dragonfly'),'the first catch pays the new-species coin (same event as a shift)');
 assert(fired.some(([t,n,d])=>t==='window'&&n===PB.POND_BUG_CAUGHT&&d.first&&d.name==='Midfield Dragonfly'),'the toast event');
 fired.length=0;const b=PB.netPondDragonfly(port,fire);assert(!b.first&&b.count===2&&!fired.some(([,n])=>n===B.BUG_NEW_SPECIES_EVENT),'a second catch counts, pays nothing new');
 const s=B.readBugBook(port);assert.equal(s.bugs.dragonfly,2);assert(s.squad.includes('dragonfly'),'fills its squad page');assert.equal(B.bugsCaught(s),1);
 // An old save (no pond catches) reads the same; a shift catch and a pond catch share one count.
 assert.equal(B.recordBugCatch('bug','dragonfly',port).count,3,'shift and pond catches share the count');
 const t=PB.pondCatchToast({id:'dragonfly',name:'Midfield Dragonfly',first:true,count:1});assert(/Bug book/.test(t.title)&&t.detail.length<=140,'kid toast');}
assert(PB.pondNetAllowed({ride:'walk',onGround:true,canEnter:true,job:false}),'on foot');
for(const o of [{ride:'bike',onGround:true,canEnter:true,job:false},{ride:'walk',onGround:false,canEnter:true,job:false},{ride:'walk',onGround:true,canEnter:false,job:false},{ride:'walk',onGround:true,canEnter:true,job:true}])assert(!PB.pondNetAllowed(o),'not '+JSON.stringify(o));
// 2. The pond: a calm player is not fled from and gets a visit; a rushing one is fled from; a netted one is away, then back.
const L=load('lib/town/westParkLayout.ts'),P=load('lib/town/parkPond.ts');
const make=()=>P.createPondLife(new T.Scene(),{phone:false,sink:{splash(){},ring(){}}});
const at={x:0,y:0,z:0},rim={x:L.PARK_POND.x,z:L.PARK_POND.z-L.PARK_POND.rz+2};// wading in, 2 m inside the north edge
const input=(o)=>({x:rim.x,z:rim.z,speed:0,onGround:true,ballX:0,ballY:9,ballZ:0,ballOn:false,shown:true,mode:0,...o});
{const pond=make();let first=-1;for(let i=0;i<60*120&&first<0;i++){pond.update(1/60,input({calm:true}));if(pond.nearFly(rim.x,rim.z,PB.POND_NET.range)>=0)first=i/60;}
 assert(first>=0&&first<120,'standing still, a dragonfly comes within reach (after '+first.toFixed(1)+' s)');
 const k=pond.nearFly(rim.x,rim.z,PB.POND_NET.range);pond.flyAt(k,at);assert(Math.hypot(at.x-rim.x,at.z-rim.z)<=PB.POND_NET.range&&L.pondQ(at.x,at.z)<1,'over the water, in reach');
 assert(pond.netFly(k),'netted');assert(!pond.netFly(k),'once');assert.equal(pond.flies.count,2);
 {let seen=false;assert(pond.nearFly(at.x,at.z,.01)!==k,'not nettable while away');for(let i=0;i<60*(PB.POND_NET.away-3);i++){pond.update(1/60,input({calm:true}));}
  const m=new T.Matrix4(),sc=new T.Vector3();pond.flies.getMatrixAt(k,m);sc.setFromMatrixScale(m);assert(sc.x<1e-6,'the netted dragonfly is away (not drawn)');
  for(let i=0;i<60*5;i++)pond.update(1/60,input({calm:true}));pond.flies.getMatrixAt(k,m);sc.setFromMatrixScale(m);seen=sc.x>.5;assert(seen,'and back after POND_NET.away s');}}
{const pond=make();let close=0;for(let i=0;i<60*60;i++){pond.update(1/60,input({calm:false,speed:4}));for(let k=0;k<2;k++){pond.flyAt(k,at);if(Math.hypot(at.x-rim.x,at.z-rim.z)<1)close++;}}
 assert(close<60*3,'a rushing player is darted away from ('+close+' close frames)');}
{const pond=make();pond.update(1/60,input({mode:1}));assert.equal(pond.nearFly(rim.x,rim.z,99),-1,'lite mode: no dragonflies to net');}
// 3. Wiring: the Net it prompt (the HUD arbiter's enter slot), the calm flag, the toast, the Bug book's where line.
const town=read('components/Town.tsx');
assert(/data-pond-net=""[^>]*onClick=\{\(\)=>pondNetActions\.current\(\)\}>Net it</.test(town),'the Net it button');
assert(/pondNetActions\.current=\(\)=>\{const k=pondLife\.nearFly\(location\.x,location\.z,POND_NET\.range\);if\(k<0\|\|!pondLife\.netFly\(k\)\)return;netPondDragonfly\(\)/.test(town),'nets the nearest and records it');
assert(/if\(pondNetWant\)cands\.push\(\{kind:'enter',key:pondNetWant\.key/.test(town)&&/calm:rideRef\.current==='walk'&&groundY<\.05&&Math\.hypot\(velocity\.x,velocity\.z\)<POND_NET\.calmSpeed/.test(town),'one prompt at a time; calm = slow on foot');
assert(/POND_BUG_CAUGHT,pond\)/.test(read('components/IslandJobs.tsx')),'the toast listens');
assert(/POND_DRAGONFLY_WHERE/.test(read('components/BugBook.tsx')),'the dragonfly page says where to find one at the pond');
console.log('PASS pond bugs: the pond dragonflies are the Midfield Dragonfly (20 bugs, 28 pages unchanged), netted on foot when calm, recorded like a shift catch, let go and back, lite mode none');
})().catch(e=>{console.error(e);process.exit(1);});
