// Beachcombing (Oct 14 2026, docs/beachcombing.md; user: "have the player find on the beach like star fish, sea shells, and other
// related animals to fish so they can sell. stagger that throughout the mountain island and other islands"). Covers: the one finds
// table (facts, football tips, values, welfare rules); placement on sand only (not in water, not on paths, roads, courts or
// colliders, clear of fishing posts) against the town the game actually builds; the daily rotation (deterministic, new places each
// day, per-island counts, at most one golden cowrie); pickup, put-back and look through the runtime; selling at the market via the
// table; the save key; the draw budget and nothing running far away. usage: node tests/beachcombing.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}},timers={raf:0,timeout:0,interval:0},listeners=new Map();
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const store=new Map();
const context=vm.createContext({console,Math,Set,Map,performance,Date,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,
 window:{addEventListener:(t,f)=>{if(!listeners.has(t))listeners.set(t,new Set());listeners.get(t).add(f);},removeEventListener:(t,f)=>listeners.get(t)?.delete(f),matchMedia:()=>({matches:false})},
 requestAnimationFrame:()=>{timers.raf++;return 1;},setTimeout:()=>{timers.timeout++;return 1;},setInterval:()=>{timers.interval++;return 1;},
 localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){const file=path.resolve(base,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id));cache.set(file,mod.exports);return mod.exports;}

const B=load('lib/town/beachcombing.ts'),G=load('lib/town/market/goods.ts'),P=load('lib/town/market/pocket.ts'),Mk=load('lib/town/market/market.ts');
const shore=load('lib/town/shoreline.ts'),cay=load('lib/town/coralCay.ts'),S=load('lib/town/summitIsle.ts'),{onLand}=load('lib/town/landmass.ts');
const {FISH,FISH_SPOTS}=load('lib/town/fishing/fishCatalog.ts'),Sim=load('lib/town/simulation.ts'),{VENUES}=load('lib/town/venues.ts');
const snap=load('lib/saves/snapshot.ts'),RT=load('lib/graphics/beachFinds.ts');

// ---- 1. The one table: teaching, welfare and values.
const F=B.BEACH_FINDS;
assert.equal(new Set(F.map(f=>f.id)).size,F.length,'unique ids');
assert(F.length>=12,'a dozen or more kinds of find');
for(const id of ['starfish','scallop-shell','sand-dollar','hermit-crab','sea-glass','shore-crab','sea-urchin','driftwood','golden-cowrie','conch-shell','cowrie-shell','spiral-shell'])assert(B.beachFindById(id),'has '+id);
for(const f of F){
 assert(f.fact.length>30&&f.football.length>30,`${f.id}: a sea fact and a football tip`);
 assert(f.beaches.length>0&&f.beaches.every(k=>['sandy','rocky','coral'].includes(k)),`${f.id}: beach types`);
 if(f.care==='sell')assert(f.value>0,`${f.id} sells for coins`);
 if(f.care==='putBack')assert(f.value>0&&f.value<=2,`${f.id}: a small kindness reward`);
 if(f.care==='look')assert.equal(f.value,0,`${f.id} is look-only: no coins`);}
// Welfare: every living animal is put back or looked at, never a good; only empty shells and things sell.
for(const id of ['starfish','shore-crab','hermit-crab'])assert.equal(B.beachFindById(id).care,'putBack',id+' is put back gently');
assert.equal(B.beachFindById('sea-urchin').care,'look','the spiny urchin is look, never touch');
for(const f of F)assert.equal(G.isGood(f.id),f.care==='sell',`${f.id} ${f.care==='sell'?'is':'is not'} a basket good`);
assert(/empty/i.test(B.beachFindById('sand-dollar').fact)&&/leave/i.test(B.beachFindById('sand-dollar').fact),'the sand dollar: only the empty white ones');
// Prices come from the table only, and sit just under fish of the same rarity (less effort than a catch).
const fishPrice=r=>FISH.filter(x=>x.rarity===r).map(x=>x.price);
for(const g of G.GOODS.filter(g=>g.kind==='beach')){const f=B.beachFindById(g.id);assert.equal(g.price,f.value,`${g.id}: the good's price IS BEACH_FINDS.value`);
 assert(f.value<=Math.max(...fishPrice(f.rarity)),`${g.id}: no more than a ${f.rarity} fish`);assert.equal(P.pocketCategory(g),'beach');}
for(const f of ['lib/graphics/beachFinds.ts','components/BeachcombHud.tsx','components/Shellbook.tsx','components/MarketStand.tsx'].map(p=>fs.readFileSync(path.join(base,p),'utf8')))
 assert(!/(?<![.\w])value\s*:\s*\d/.test(f),'no beach value hard-coded outside the table');
console.log('PASS the finds table: '+F.length+' finds, facts and football tips, welfare rules, values only in BEACH_FINDS');

// ---- 2. The beaches and their counts per island.
const per={};for(const z of B.BEACH_ZONES)per[z.island]=(per[z.island]??0)+z.perDay;
assert.deepEqual(per,{summit:10,cay:7,main:6},'finds a day per island');
assert(per.summit>per.cay&&per.summit>per.main,'Summit Isle (the mountain island) has the most');

// ---- 3. Placement on the town the game builds: sand only, never water, paths, roads, courts or colliders.
const world=load('lib/town/world.ts').buildTown(new T.Scene());
const obstacles=[...world.obstacles,...world.buildings],paved=[...world.surfaceAreas,...world.roads];
const W=RT.beachWorld(obstacles,paved);
const valid={};for(const z of B.BEACH_ZONES){valid[z.id]=B.zoneCandidates(z).filter(c=>B.spotOk(c,W));assert(valid[z.id].length>=z.perDay*4,`${z.id}: plenty of valid spots (${valid[z.id].length})`);}
const sandCheck=s=>{
 if(s.zone==='north-beach'||s.zone==='south-beach'){const p=shore.ISLAND_SHORE.reduce((b,q)=>Math.hypot(q.x-s.x,q.z-s.z)<Math.hypot(b.x-s.x,b.z-s.z)?q:b);
  return shore.onIsland(s.x,s.z)&&shore.distanceToShore(s.x,s.z)<=shore.shoreSandWidth(p)+.5&&shore.distanceToShore(s.x,s.z)>=1;}
 if(s.zone==='cay-beach')return cay.onCay(s.x,s.z)&&!S.insidePolygon(cay.CAY_LAWN,s.x,s.z)&&cay.distanceToCayShore(s.x,s.z)>=1;
 if(s.zone==='summit-sandbar')return S.onSummitSandbar(s.x,s.z);
 return S.onSummitIsle(s.x,s.z)&&!S.insidePolygon(S.SUMMIT_LAWN,s.x,s.z)&&S.distanceToSummitShore(s.x,s.z)>=1&&S.summitGround(s.x,s.z)<2.5;};
// (the Summit Sandbar is listed as a long 'sand' area for landings: it is a beach, not a court)
const pathRects=[...world.surfaceAreas.filter(a=>a.kind==='path'||a.kind==='court'||a.kind==='sand'&&Math.max(a.w,a.d)<=60||a.kind==='cafe-patio'),...world.roads,...shore.NORTH_BEACH_PATHS];
const days=[];for(let d=0;d<45;d++){const t=new Date(2026,9,14+d);days.push(B.localBeachDay(t.getTime()));}
let all=0,goldenDays=0;const findsSeen=new Set();
for(const day of days){const spots=B.spotsForDay(day,valid);all+=spots.length;
 for(const z of B.BEACH_ZONES)assert.equal(spots.filter(s=>s.zone===z.id).length,z.perDay,`${day} ${z.id}: ${z.perDay} finds`);
 const golden=spots.filter(s=>s.find==='golden-cowrie').length;assert(golden<=1,`${day}: at most one golden cowrie (${golden})`);if(golden)goldenDays++;
 for(const s of spots){const zone=B.BEACH_ZONES.find(z=>z.id===s.zone),f=B.beachFindById(s.find);findsSeen.add(s.find);
  assert(f.beaches.includes(zone.kind),`${s.find} belongs on a ${zone.kind} beach`);
  assert(onLand(s.x,s.z),`${s.key} is on land, not in the water`);
  assert(sandCheck(s),`${s.key} (${s.x},${s.z}) is on the sand band of its beach`);
  assert(!obstacles.some(o=>Sim.insideObstacle(s.x,s.z,o,.5)),`${s.key} is clear of every collider`);
  assert(!pathRects.some(r=>Math.abs(s.x-r.x)<r.w/2+.5&&Math.abs(s.z-r.z)<r.d/2+.5),`${s.key} is off paths, roads and courts`);
  assert(!VENUES.some(v=>Math.abs(s.x-v.x)<v.width/2+2&&Math.abs(s.z-v.z)<v.length/2+2),`${s.key} is off every pitch`);
  assert(!S.SUMMIT_PATHS.some(p=>p.some(q=>Math.hypot(q.x-s.x,q.z-s.z)<S.SUMMIT_PATH_WIDTH/2+.8)),`${s.key} is off Summit Isle's trails`);
  assert(!FISH_SPOTS.some(p=>Math.hypot(p.x-s.x,p.z-s.z)<B.BEACHCOMB.fishClear),`${s.key} is clear of the fishing posts`);
  for(const o of spots)if(o!==s)assert(Math.hypot(o.x-s.x,o.z-s.z)>=B.BEACHCOMB.spacing-1e-9,`${s.key} and ${o.key} are spread out`);}}
assert(goldenDays>=1&&goldenDays<days.length/2,`a golden cowrie some days, not most (${goldenDays}/${days.length})`);
for(const f of F)assert(findsSeen.has(f.id),`${f.id} turns up within ${days.length} days`);
console.log(`PASS placement: ${all} finds over ${days.length} days, all on beach sand, none in water, on paths/roads/courts/pitches/trails, in colliders or by fishing posts`);

// ---- 4. The daily rotation: same finds on every device today, new places tomorrow.
{const a=B.spotsForDay(days[0],valid),b=B.spotsForDay(days[0],valid),c=B.spotsForDay(days[1],valid);
 assert.deepEqual(a,b,'deterministic for a day');
 const moved=c.filter(s=>!a.some(o=>o.key===s.key)).length;assert(moved>=c.length*.6,`most spots move to new places the next day (${moved}/${c.length})`);
 assert.equal(B.goldenZone(days[0]),B.goldenZone(days[0]));assert(['cay-beach','summit-coves'].includes(B.goldenZone(days[0])),'golden cowries: Coral Cay or the Summit coves only');}
console.log('PASS daily rotation: deterministic per local day, new places each day');

// ---- 5. The runtime: pickup, put back, look, the basket, the save, the draw budget.
store.clear();
const scene=new T.Scene(),gathered=[],rewards=[],poses=[];let full=false,clock=new Date(2026,9,14,11).getTime();
const rt=RT.createBeachFinds(scene,{obstacles,paved,gather:id=>{if(full)return 0;gathered.push(id);return 1;},reward:(id,c,r)=>rewards.push({id,c,r}),pose:(k,at)=>poses.push(k),now:()=>clock});
const cam=new T.PerspectiveCamera(50,390/844,.1,2000);
const prompt={hidden:true};const placed=[];
const frame=(x,z,o={})=>{cam.position.set(x+17,23,z+31.5);cam.lookAt(x,0,z);cam.updateMatrixWorld();
 return rt.update({dt:1/30,x,z,onFoot:true,canEnter:true,frozen:false,reduced:false,camera:cam,width:390,height:844,focusKey:'beach',ui:()=>prompt,place:(el,px,py)=>placed.push([px,py]),hide:(el,h)=>{el.hidden=h;},...o});};
// Far out at sea: nothing is built, nothing works.
for(let i=0;i<30;i++)frame(1500,1500);
assert.equal(rt.stats.islands,0,'nothing built far from every island');assert.equal(rt.root.children.filter(c=>c.isMesh&&!c.isInstancedMesh).length,0);
rt.buildAll();const v=rt.view();assert.equal(v.islands.reduce((n,i)=>n+i.spots.length,0),23,'23 finds today');
const isleMeshes=()=>rt.root.children.filter(c=>c.isMesh&&!c.isInstancedMesh&&c.name.startsWith('beach-finds-'));
assert(isleMeshes().length===3,'one merged mesh per island');
const mats=new Set(isleMeshes().map(m=>m.material));assert.equal(mats.size,1,'one shared material');
for(const m of rt.root.children)assert(!m.castShadow,'no shadows');
const spots=v.islands.flatMap(i=>i.spots),sellSpot=spots.find(s=>B.beachFindById(s.find).care==='sell'&&s.key.startsWith('summit'))??spots.find(s=>B.beachFindById(s.find).care==='sell');
// Walk up to a shell: the prompt names it, the arbiter key is 'beach', within reach.
let want;for(let i=0;i<10;i++)want=frame(sellSpot.x+1,sellSpot.z);
assert(want&&want.key==='beach'&&want.distance<=B.BEACHCOMB.reach,'a find in reach asks for the focus slot');
assert.equal(prompt.hidden,false,'the prompt shows');assert.equal(B.beachStore.get().label,B.promptLabel(B.beachFindById(sellSpot.find)));
assert(/^Pick up the /.test(B.beachStore.get().label),'"Pick up the …"');
// Draw budget at a beach: the near island's merged mesh + sparkles.
const drawn=()=>rt.root.children.filter(c=>c.visible&&c.isMesh&&(!c.isInstancedMesh||c.count>0)).length;
assert(drawn()<=2,`≤ 2 draw calls at a beach (${drawn()})`);
const spark=rt.root.children.find(c=>c.isInstancedMesh);assert(spark.visible&&spark.count>=1&&spark.count<=B.BEACHCOMB.maxSparkles,'sparkles over the nearby finds');
// Take it.
const before=B.beachStore.get().notes;assert(rt.take(),'tap / E takes it');
assert.deepEqual(gathered,[sellSpot.find],'the shell goes in the basket');assert.deepEqual(poses,['gpick'],'the character crouches to pick it up');
assert(B.beachStore.get().notes>before&&/^\+1 /.test(B.beachStore.get().note.title)||/Shellbook/.test(B.beachStore.get().note.detail),'a note');
let save=JSON.parse(store.get(B.BEACH_SAVE_KEY));assert(save.taken.includes(sellSpot.key)&&save.book[sellSpot.find].found===1,'saved: taken today and in the Shellbook');
assert(drawn()<=3,'≤ 3 draw calls during a pickup');
for(let i=0;i<30;i++)frame(sellSpot.x+1,sellSpot.z);
assert(drawn()<=2,'the moving find is gone after its animation');
assert(!rt.view().near||rt.view().near!==sellSpot.key,'a taken spot no longer prompts');
// Its vertices collapsed in place: the island mesh's bounding geometry still exists, the find's triangles are degenerate.
// A living animal: put back gently, a small reward, never in the basket.
const live=spots.find(s=>B.beachFindById(s.find).care==='putBack');
for(let i=0;i<10;i++)frame(live.x+1,live.z);assert(/back gently$/.test(B.beachStore.get().label),'"Put the … back gently"');
const g0=gathered.length;assert(rt.take());assert.equal(gathered.length,g0,'a living animal never goes in the basket');
assert.equal(rewards.length,1);assert(rewards[0].id.includes(live.key)&&rewards[0].c===B.beachFindById(live.find).value,'one kindness reward, keyed per spot and day');
assert(/Only take empty shells/.test(B.beachStore.get().note.detail),'the first living animal teaches the beach rule');
save=JSON.parse(store.get(B.BEACH_SAVE_KEY));assert.equal(save.book[live.find].putBack,1);
// A full basket: the shell stays on the sand, nothing recorded.
const another=spots.find(s=>B.beachFindById(s.find).care==='sell'&&s.key!==sellSpot.key);full=true;
for(let i=0;i<10;i++)frame(another.x+1,another.z);assert.equal(rt.take(),false,'a full basket leaves it there');
assert(/basket is full/.test(B.beachStore.get().note.title));assert(!JSON.parse(store.get(B.BEACH_SAVE_KEY)).taken.includes(another.key));full=false;
// Look-only: the urchin (when today has one; otherwise force a check through the pure note).
const urchin=spots.find(s=>s.find==='sea-urchin');
if(urchin){for(let i=0;i<10;i++)frame(urchin.x+1,urchin.z);assert(/^Look at the sea urchin/.test(B.beachStore.get().label));const n=rewards.length,g=gathered.length;assert(rt.take());assert.equal(rewards.length,n);assert.equal(gathered.length,g);assert.equal(poses.at(-1),'headshake');}
else assert(/Look, don/.test(B.findNote(B.beachFindById('sea-urchin'),{added:true,first:false,firstKind:false,coins:0}).title));
// A new day: new finds; yesterday's taken spots are free again.
clock+=24*3600e3;for(let i=0;i<150;i++)frame(sellSpot.x+1,sellSpot.z);
assert.notEqual(rt.view().day,v.day,'the day rolled over');assert.equal(rt.view().save.taken.length,0,'today has nothing taken yet');assert(rt.view().islands.every(i=>i.spots.every(s=>!s.taken)),'every find is back on the sand');
// Far away again: hidden, no work, no loops.
const idle=rt.stats.idleFrames;for(let i=0;i<20;i++)frame(1500,1500);
assert.equal(rt.stats.idleFrames-idle,20,'far from every beach: no work');assert.equal(drawn(),0,'nothing drawn far from the beaches');
assert.equal(timers.raf+timers.interval,0,'no rAF or intervals of its own');
rt.dispose();assert.equal(rt.root.parent,null,'disposed');assert.equal(listeners.get('keydown')?.size??0,0,'its key listener is removed');
console.log('PASS runtime: prompt, pickup into the basket, put back gently with a kindness reward, look-only urchin, full basket, new day, ≤ 2 draws at a beach, idle far away');

// ---- 6. Selling at the market, through the table's values.
{let saved=null,credits=[];const m=Mk.createMarket({read:()=>saved,write:s=>{saved=s;},credit:async(id,n)=>{credits.push(n);return n;},now:()=>clock});
 m.gather('scallop-shell',2);m.gather('conch-shell',1);m.gather('sardine',1);
 const q=m.quote('beach');assert.equal(q.coins,2*B.beachFindById('scallop-shell').value+B.beachFindById('conch-shell').value,'the stand quotes beach finds at the table values');
 const pv=P.pocketView(saved);assert.equal(pv.beach.count,3);assert.equal(pv.hud.beach,3);assert.equal(pv.fish.count,1,'fish stay in the fish card');
 const r=await m.sell('beach');assert(r.ok&&r.coins===q.coins,'Sell all beach finds');assert.equal(saved.basket.sardine,1,'selling beach finds leaves the fish');
 assert(Mk.sanitizeMarket({basket:{'starfish':2,'scallop-shell':1}},'2026-10-14').basket.starfish===undefined,'a starfish can never sit in the basket');}
console.log('PASS selling: Rosa\'s stand sells beach finds at BEACH_FINDS values under the shared market rules');

// ---- 7. The save.
assert(snap.SYNC_KEYS.includes(B.BEACH_SAVE_KEY)&&!snap.DEVICE_KEYS.includes(B.BEACH_SAVE_KEY),'fi2-beachcomb-v1 is a synced progress key');
assert(fs.readFileSync(path.join(base,'docs/accounts-design.md'),'utf8').includes(B.BEACH_SAVE_KEY),'documented in the accounts design');
{const now=new Date(2026,9,14,9).getTime(),day=B.localBeachDay(now);
 const s=B.sanitizeBeach({day,taken:['cay-beach:12','bad key',5],book:{'starfish':{found:3,putBack:9,first:'2026-10-01'},'dragon':{found:1}},tip:true},now);
 assert.deepEqual([...s.taken],['cay-beach:12']);assert.deepEqual(Object.keys(s.book),['starfish']);assert.equal(s.book.starfish.putBack,3,'put back never exceeds found');assert.equal(s.tip,true);
 const y=B.sanitizeBeach({day:'2026-10-13',taken:['cay-beach:12'],book:{}},now);assert.equal(y.taken.length,0,'yesterday\'s taken spots are not carried over');
 assert.equal(JSON.stringify(B.sanitizeBeach(JSON.parse(JSON.stringify(s)),now)),JSON.stringify(s),'round-trips');}
console.log('PASS save: fi2-beachcomb-v1 synced, sanitised, day-scoped taken spots');
console.log('beachcombing: all checks passed');
})().catch(e=>{console.error(e);process.exit(1);});
