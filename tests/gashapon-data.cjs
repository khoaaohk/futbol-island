// Gashapon data layer (Nov 8 2026, docs/gashapon-design.md): the 14 machines and where they stand (2 per Konbini on the side
// opposite its vending + drink pair, 2 in the Arcade, 8 outdoors, checked on the town the game builds), the 84 toys (6 per
// machine, unique ids, each linked to football, the island or Japan), the odds, and the spin rules against the REAL arcade
// wallet core (one idempotent debit per spin, never below 0, the repeat-toy refund), the save round trip and the save-key
// classification. usage: node tests/gashapon-data.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),storage=new Map(),gradient={addColorStop(){}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,queueMicrotask,performance,structuredClone,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,Number,String,Error,Symbol,
 window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},localStorage,document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){
 let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,allowJs:true}}).outputText;
 const r=id=>id==='react'?{useSyncExternalStore:(_s,get)=>get(),useEffect(){},useState(){},useRef(){},createContext(){}}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('@/')?load(id.slice(2)):
  id.endsWith('.json')?JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id),'utf8')):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
/** Deep equality across the vm realm (plain JSON data). */
const same=(a,b,m)=>assert.deepStrictEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),m);
let failed=0;const ok=async(name,fn)=>{try{await fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};

const M=load('lib/gashapon/machines.ts'),Y=load('lib/gashapon/toys.ts'),St=load('lib/gashapon/store.ts'),E=load('lib/economy.ts');
const VC=load('lib/town/vendingCatalog.ts'),VP=load('lib/town/vendingPlaces.ts'),CC=load('lib/town/coralCay.ts'),SI=load('lib/town/summitIsle.ts');
const all=M.GASHAPON_MACHINES,byZone=z=>all.filter(m=>m.zone===z);
const {w:GW,d:GD}=M.GASHA_SIZE;
/** The cabinet's four ground corners (+ the walk-up point 1.5 m in front when `front`). */
// Nov 10 2026: each body style its own size (lib/gashapon/machines.ts GASHA_STYLE_SIZE): the corners are that cabinet's.
const corners=(m,front=false)=>{const S=M.GASHA_STYLE_SIZE[M.gashaStyleOf(m)],W=S.w,D=S.d,fx=Math.sin(m.yaw),fz=Math.cos(m.yaw),rx=fz,rz=-fx,p=[[W/2,D/2],[-W/2,D/2],[W/2,-D/2],[-W/2,-D/2]].map(([a,b])=>({x:m.x+rx*a+fx*b,z:m.z+rz*a+fz*b}));if(front)p.push({x:m.x+fx*1.5,z:m.z+fz*1.5});return p;};

await ok('18 machines: 2 per Konbini, 2 in the Arcade, 8 outdoors, 4 at the DRIP FC Stadium; unique ids and colours',()=>{
 assert.equal(all.length,18);assert.equal(new Set(all.map(m=>m.id)).size,18);assert.equal(new Set(all.map(m=>m.name)).size,18,'unique names');assert.equal(new Set(all.map(m=>m.color)).size,18,'unique colours');assert.equal(byZone('stadium').length,4);
 assert.equal(byZone('konbini-square').length,2);assert.equal(byZone('konbini-cay').length,2);assert.equal(byZone('arcade').length,2);assert.equal(byZone('outdoor').length,8);
 for(const m of all){assert(/^#[0-9a-f]{6}$/i.test(m.color)&&/^#[0-9a-f]{6}$/i.test(m.accent),m.id+' colours');assert(Number.isFinite(m.x+m.z+m.y+m.yaw),m.id+' numbers');assert(m.theme&&m.place,m.id+' text');}
 assert.equal(M.islandGashaponMachines().length,16,'the island mesh holds 16 (the arcade pair is in its own scene)');
});

await ok('Konbini pairs: flush against the shopfront, on the side OPPOSITE the vending + drink machines, clear of the doors',()=>{
 const cases=[['konbini-square',VP.ISLAND_SQUARE_KONBINI,M.SQUARE_DOOR_X,'plaza','drinksplaza'],['konbini-cay',CC.CAY_KONBINI,M.CAY_DOOR_X,'caykonbini','drinkscay']];
 for(const [zone,store,doorX,vendId,drinkId] of cases){
  const pair=byZone(zone),vend=VC.vendingMachine(vendId),drink=VC.vendingMachine(drinkId),side=Math.sign(vend.x-doorX);
  assert(side!==0&&Math.sign(drink.x-doorX)===side,zone+': vending + drinks share one side of the doors');
  for(const g of pair){
   assert(Math.sign(g.x-doorX)===-side,`${g.id} stands on the other side of the doors from the vending machine`);
   assert(Math.abs(g.x-doorX)-GW/2>=1.6,`${g.id} is clear of the doorway Enter strip (|x − door| < 1.6)`);
   assert(g.x-GW/2>=store.x-5&&g.x+GW/2<=store.x+5,`${g.id} stays inside the 10 m shopfront`);
   assert.equal(g.yaw,vend.yaw,`${g.id} faces out like the vending machine`);
   assert(Math.abs((g.z-GD/2)-(vend.z-VP.CABINET_HALF_DEPTH))<.01,`${g.id}: back flush on the same line as the vending machine's back`);}
  const mid=(pair[0].x+pair[1].x)/2;assert(Math.abs(mid-(2*doorX-vend.x))<.011,zone+': the pair is the vending spot mirrored across the doors');
  assert(Math.abs(pair[0].x-pair[1].x)>=GW+.1,zone+': the two cabinets do not overlap');}
});

await ok('Arcade pair: inside the room, clear of every cabinet, prop collider, bench and the exit',()=>{
 const {arcadeCabinets}=load('lib/arcade/arcadeCatalog.ts');
 const boxes=[...read('lib/arcade/arcadeRoomProps.ts').matchAll(/\{x:(-?[\d.]+),z:(-?[\d.]+),halfX:([\d.]+),halfZ:([\d.]+)/g),...read('lib/arcade/arcadeRoomScene.ts').matchAll(/\{x:(-?[\d.]+),z:(-?[\d.]+),halfX:([\d.]+),halfZ:([\d.]+)/g)].map(m=>m.slice(1).map(Number));
 assert(boxes.length>=5,'found the room colliders');
 boxes.push([13,-2,3.6,3.6]);// the prize counter + shelf (placed by a rotation in arcadeRoomProps.ts), a generous box
 for(const g of byZone('arcade')){
  for(const p of corners(g,true))assert(p.x>-13.7&&p.x<13.7&&p.z>-10.7&&p.z<11.1,`${g.id} on the floor (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`);
  for(const c of arcadeCabinets)assert(Math.hypot(g.x-c.x,g.z-c.z)>=2,`${g.id} ≥ 2 m from the ${c.id} cabinet`);
  for(const [x,z,hx,hz] of boxes)for(const p of corners(g,true))assert(!(Math.abs(p.x-x)<hx+.3&&Math.abs(p.z-z)<hz+.3),`${g.id} clear of the collider at (${x}, ${z})`);
  assert(!(Math.abs(g.x)<2.1+GW&&g.z>9),`${g.id} clear of the exit`);}
});

// The town the game builds: buildings, colliders, roads, paths, venues.
const world=load('lib/town/world.ts').buildTown(new T.Scene()),V=load('lib/town/venues.ts'),{onLand}=load('lib/town/landmass.ts');
const gap=(q,o)=>Math.hypot(Math.max(0,Math.abs(q.x-o.x)-o.w/2),Math.max(0,Math.abs(q.z-o.z)-o.d/2));
// The machines' own footprints (lib/town/gashaponWorld.ts) are obstacles too: the placement checks are against everything else.
const ownFootprint=o=>all.some(m=>Math.abs(m.x-o.x)<.01&&Math.abs(m.z-o.z)<.01);
const solid=[...world.obstacles.filter(o=>!ownFootprint(o)),...world.buildings];
await ok('8 outdoor machines: on land, clear of buildings/colliders, roads, walk paths, pitches, vending machines; spread out',()=>{
 assert(world.obstacles.length>100&&world.buildings.length>10&&world.roads.length>10,'the real town');
 const out=byZone('outdoor');
 for(const g of out){
  const pts=corners(g,true);
  for(const p of pts)assert(onLand(p.x,p.z),`${g.id}: (${p.x.toFixed(1)}, ${p.z.toFixed(1)}) on land`);
  // Nov 10 2026 (owner: the summit machines stand with their backs against the Summit 5s east fence): for gs-summit the fence
  // rails right behind it (within 1 m of its back line) are the one collider it may touch; every other collider still counts.
  const solidFor=g.id==='gs-summit'?solid.filter(o=>!(Math.abs(o.x-(g.x-.75))<1&&o.w<1)):solid;
  const near=Math.min(...solidFor.map(o=>gap(g,o)));assert(near>=1.4,`${g.id}: ≥ 1.4 m from every building and collider (${near.toFixed(2)})`);
  for(const p of pts)for(const o of solidFor)assert(gap(p,o)>=.5,`${g.id}: footprint/front clear of the collider at (${o.x.toFixed(1)}, ${o.z.toFixed(1)})`);
  for(const r of world.roads)assert(gap(g,r)>=.8,`${g.id}: off the road at (${r.x}, ${r.z})`);
  for(const a of world.surfaceAreas)if(a.kind!=='sand'&&!(a.kind==='path'&&Math.min(a.w,a.d)>=8))for(const p of pts)assert(!(Math.abs(p.x-a.x)<a.w/2+.6&&Math.abs(p.z-a.z)<a.d/2+.6),`${g.id}: off the ${a.kind} at (${a.x}, ${a.z})`);
  for(const v of V.LIVE_VENUES)assert(Math.abs(g.x-v.x)>=v.width/2+3||Math.abs(g.z-v.z)>=v.length/2+3,`${g.id}: ≥ 3 m outside the ${v.name} pitch`);
  for(const q of VC.VENDING_MACHINES)if(!(g.id==='gs-summit'&&(q.id==='summit'||q.id==='drinksummit'))/* beside the Summit vending pair on purpose (Nov 9 2026) */)assert(Math.hypot(q.x-g.x,q.z-g.z)>=4.5,`${g.id}: ≥ 4.5 m from the ${q.id} vending machine`);
  if(SI.onSummitIsle(g.x,g.z)){assert(VP.standsOnSummit({x:g.x,z:g.z,yaw:g.yaw})||VP.standsAtSummitFence({x:g.x,z:g.z,yaw:g.yaw}),g.id+': summit flat-ground rules (Nov 10 2026: or the line against the east fence)');assert(Math.abs(g.y-SI.summitGround(g.x,g.z))<.02,g.id+': y is the summit ground');}
  else if(CC.isOnCayLand(g.x,g.z))assert(VP.standsOnCay({x:g.x,z:g.z,yaw:g.yaw}),g.id+': cay ground rules');
  else{assert.equal(g.y,0);assert(Math.abs(V.fieldSurfaceHeight(g.x,g.z))<=.3,g.id+': ground level');}}
 for(let i=0;i<out.length;i++)for(let j=i+1;j<out.length;j++)assert(Math.hypot(out[i].x-out[j].x,out[i].z-out[j].z)>=40,`${out[i].id} and ${out[j].id} are spread out (≥ 40 m)`);
 assert(out.some(g=>SI.onSummitIsle(g.x,g.z))&&out.some(g=>CC.isOnCayLand(g.x,g.z))&&out.filter(g=>g.x<300).length>=4,'main island, Coral Cay and Summit Isle all get some');
 // The Konbini pairs: nothing but their own shop behind them.
 for(const g of [...byZone('konbini-square'),...byZone('konbini-cay')]){const store=g.zone==='konbini-square'?VP.ISLAND_SQUARE_KONBINI:CC.CAY_KONBINI;
  for(const o of solid){const own=Math.abs(o.x-store.x)<=6&&o.z<store.front+.15;if(own)continue;
   for(const p of corners(g))assert(gap(p,o)>0,`${g.id} does not overlap the collider at (${o.x.toFixed(2)}, ${o.z.toFixed(2)})`);
   assert(gap({x:g.x,z:g.z+1.3},o)>=.3,`${g.id}: its buying spot is clear of the collider at (${o.x.toFixed(2)}, ${o.z.toFixed(2)})`);}}
});

await ok('DRIP FC Stadium four: against the south stand under the big screen, two either side of the vending + drink pair, flush, facing out, clear of the posts, stairs, lights and viewers; existing football sets',()=>{
 const SS=load('lib/town/stadiumShops.ts'),SW=load('lib/town/stadiumWorld.ts'),SN=load('lib/town/stadiumNpcs.ts'),SB=load('lib/town/stadiumBalls.ts'),Seats=load('lib/town/stadiumSeats.ts');
 const row=byZone('stadium'),vend=VC.vendingMachine('stadium'),drink=VC.vendingMachine('drinkstadium'),posts=SW.screenPosts(),wall=SS.STADIUM_SHOP_WALL_Z;
 same(row.map(m=>m.set),['gs-oldtown','gs-eleven','gs-arcade-pixel','gs-westbeach'],'four existing football sets (no new toys)');
 for(const m of row){same(Y.toysIn(m.id).map(t=>t.id),Y.toysIn(m.set).map(t=>t.id),m.id+' sells its set');assert(M.GASHAPON_MACHINES.find(x=>x.id===m.set)&&!M.GASHAPON_MACHINES.find(x=>x.id===m.set).set,m.id+': its set is a home machine');}
 assert.equal(row.filter(m=>m.x<SS.STADIUM_SHOP_X).length,2,'two on the left (west)');assert.equal(row.filter(m=>m.x>SS.STADIUM_SHOP_X).length,2,'two on the right (east)');
 assert(Math.abs((vend.x+drink.x)/2-SS.STADIUM_SHOP_X)<.01&&vend.yaw===0&&drink.yaw===0,'the vending + drink pair is centred under the screen, facing out');
 assert(Math.abs(posts[0].x+posts[1].x-2*SS.STADIUM_SHOP_X)<.01,'the screen is centred on the row too');
 const cab=[...row.map(m=>({id:m.id,...M.gashaponFootprint?.(m)??{x:m.x,z:m.z,w:M.GASHA_STYLE_SIZE[M.gashaStyleOf(m)].w+.06,d:M.GASHA_STYLE_SIZE[M.gashaStyleOf(m)].d+.06}})),{id:'stadium',x:vend.x,z:vend.z,w:1.69,d:1.118},{id:'drinkstadium',x:drink.x,z:drink.z,w:1.69,d:1.118}].sort((a,b)=>a.x-b.x);
 for(const c of cab){assert(Math.abs(c.z-c.d/2-(wall+.03))<.011,`${c.id}: back flush to the wall (3 cm gap)`);}
 for(let i=1;i<cab.length;i++){const g=(cab[i].x-cab[i].w/2)-(cab[i-1].x+cab[i-1].w/2);assert(g>=.1&&g<=.13,`${cab[i-1].id} | ${cab[i].id}: a 12 cm gap (${g.toFixed(3)})`);}
 for(const m of row)assert.equal(m.yaw,0,m.id+' faces out (south)');
 const x0=cab[0].x-cab[0].w/2,x1=cab.at(-1).x+cab.at(-1).w/2;
 for(const q of posts)assert(Math.min(Math.abs(q.x-x0),Math.abs(q.x-x1))>=2&&(q.x<x0||q.x>x1),'the row stands between the posts, ≥ 2 m clear of each');
 // The kick lanes of both screen-post targets run straight south from the posts: the row stays out of them.
 for(const s of SB.STADIUM_BALL_SPOTS.filter(s=>s.id.startsWith('stadium-screen')))assert(s.wall.x<x0-1.5||s.wall.x>x1+1.5,s.id+': its target and kick lane are clear of the row');
 const so=Seats.STANDS.find(q=>q.id==='south');for(const c of so.stairs)assert(Math.abs(c)-Seats.STAIR_WIDTH/2-1>Math.max(Math.abs(x0-SS.STADIUM_SHOP_X),Math.abs(x1-SS.STADIUM_SHOP_X)),'clear of the back stairs and their bollards');
 const others=solid.filter(o=>!cab.some(c=>Math.abs(c.x-o.x)<.01&&Math.abs(c.z-o.z)<.01)),standBox=o=>o.z+o.d/2<=wall+.01;
 for(const c of cab)for(const o of others){if(standBox(o))continue;assert(gap(c,o)>=.3,`${c.id}: clear of the collider at (${o.x.toFixed(2)}, ${o.z.toFixed(2)})`);
  assert(gap({x:c.x,z:c.z+c.d/2+.9},o)>=.3,`${c.id}: its buying spot is clear of the collider at (${o.x.toFixed(2)}, ${o.z.toFixed(2)})`);}
 const viewers=Object.entries(SN.STADIUM_NPC_ROUTES).filter(([id])=>/viewer|guide-iris/.test(id)).flatMap(([,r])=>r);
 for(const c of cab)for(const v of viewers)assert(Math.hypot(Math.max(0,Math.abs(v.x-c.x)-c.w/2),Math.max(0,Math.abs(v.z-c.z)-c.d/2))>=3,`${c.id}: ≥ 3 m from the viewers' and the guide's spots`);
 assert(cab.every(c=>c.z+c.d/2<SN.VIEWING.z0-3),'in front of the viewing patch, never in it');
});

await ok('84 toys: 6 per machine (3 common, 2 uncommon, 1 rare), unique ids and names, a soccer/island/japan link each',()=>{
 const toys=Y.GASHAPON_TOYS;assert.equal(toys.length,84);assert.equal(new Set(toys.map(t=>t.id)).size,84,'unique ids');assert.equal(new Set(toys.map(t=>t.name)).size,84,'unique names');
 for(const m of all){const list=Y.toysIn(m.id);assert.equal(list.length,6,m.id+' has 6');
  for(const r of ['common','uncommon','rare'])assert.equal(list.filter(t=>t.rarity===r).length,Y.RARITY_MIX[r],`${m.id}: ${r} count`);
  assert.equal(list.reduce((n,t)=>n+Y.toyWeight(t),0),100,m.id+': odds sum to 100');}
 for(const t of toys){
  assert(/^[a-z0-9-]{3,40}$/.test(t.id),t.id+' id shape');assert(M.isGashaponMachine(t.machine),t.id+' machine');
  assert(t.link&&['soccer','island','japan'].includes(t.link.kind)&&t.link.note.trim().length>=8,t.id+': link {kind, note}');
  assert(t.personality.length>=15&&t.name.length>=3,t.id+' text');for(const k of ['squeeze','poke','tap'])assert(t.touch[k]&&t.touch[k].length>=3,t.id+' touch '+k);
  assert(t.sound.length>=8,t.id+' sound recipe');assert(t.colors.every(c=>/^#[0-9a-f]{6}$/i.test(c)),t.id+' colours');
  assert(!/\b(robot|dinosaur|dino|unicorn|alien)\b/i.test(t.name+' '+t.personality),t.id+': no generic toys');}
 // Konbini machines lean on food and Japan; the rest keep a good football mix.
 for(const m of [...byZone('konbini-square'),...byZone('konbini-cay')])assert(Y.toysIn(m.id).every(t=>t.link.kind!=='soccer'),m.id+': food / Japan toys');
 assert(toys.filter(t=>t.machine.startsWith('gs-')&&!/square|cay-(sweets|bento)/.test(t.machine)&&t.link.kind==='soccer').length>=20,'≥ 20 football toys outside the Konbinis');
 assert(toys.filter(t=>t.link.kind==='japan').length>=18,'plenty of Japan toys');
 // The odds, by the roll the store uses.
 const m='gs-eleven',n=40000,seen={};for(let i=0;i<n;i++){const t=Y.pickToy(m,St.spinRoll('s'+i,m));seen[t.rarity]=(seen[t.rarity]??0)+1;}
 assert(Math.abs(seen.common/n-.66)<.02&&Math.abs(seen.uncommon/n-.24)<.02&&Math.abs(seen.rare/n-.10)<.015,'roll frequencies match the weights '+JSON.stringify(seen));
 assert.equal(Y.pickToy(m,0).rarity,'common');assert(Y.pickToy(m,.9999).rarity==='rare');assert(Y.pickToy('nope',.5)===null);
});

// A real arcade wallet (lib/arcade/arcadeWalletCore.ts) in memory, and the store's ports around it.
const {createArcadeWallet}=load('lib/arcade/arcadeWalletCore.ts'),{isTrainingRun,localPlayDay}={...load('lib/town/dailyMeter.ts'),...load('lib/town/dailyPlay.ts')};
function rig(coins,opts={}){
 const runs={};for(let i=0,left=coins;left>0;i++,left-=20)runs['island-starter-coins:'+i]={game:'island',paid:Math.min(20,left),reason:'Welcome coins',at:1};
 let wdata={version:1,runs,packs:[]},q=Promise.resolve(),clock=opts.clock??new Date(2026,10,8,10).getTime();
 const wallet=createArcadeWallet({meter:isTrainingRun,read:()=>structuredClone(wdata),write:v=>{wdata=structuredClone(v);},lock:fn=>{const t=q.then(fn);q=t.catch(()=>{});return t;},valid:new Set(['A']),grant:()=>true,notify:()=>{},now:()=>clock,id:()=>'id'+Math.random(),random:()=>0});
 let saved=opts.saved??null,failWrite=false,spends=0;
 const store=St.createGashaponStore({read:()=>saved===null?null:JSON.parse(saved),write:s=>{if(failWrite)throw Error('disk');saved=JSON.stringify(s);},now:()=>clock,day:localPlayDay,
  spend:(id,cost,reason)=>{spends++;return wallet.spend(id,cost,reason);},refund:(id,c,reason)=>wallet.creditOnce(id,'island',c,reason)});
 return {store,wallet,balance:()=>wallet.load().balance,tick:ms=>{clock+=ms;},raw:()=>saved,failWrite:v=>{failWrite=v;},spends:()=>spends};
}
/** A spin id whose roll gives `toyId` on `machine` (so the tests can force a repeat). */
const idFor=(machine,toyId,from=0)=>{for(let i=from;i<1e6;i++)if(Y.pickToy(machine,St.spinRoll('t'+i,machine)).id===toyId)return 't'+i;};

await ok('spin: 20 coins once per spin id, never twice, never below 0; a repeat toy gives 5 back',async()=>{
 assert.equal(E.GASHAPON.price,20);assert.equal(E.GASHAPON.repeatRefund,5);assert.equal(St.GASHAPON_PRICE,20);
 const R=rig(50);assert.equal(R.balance(),50);
 const a=await R.store.spin('gs-eleven','spin-a');assert(a.ok&&!a.duplicate&&a.count===1&&a.refund===0,'first spin: a new toy');assert.equal(R.balance(),30);
 const again=await R.store.spin('gs-eleven','spin-a');assert(again.ok&&again.repeat&&again.toy.id===a.toy.id,'same id: same result');assert.equal(R.balance(),30,'same id never charges twice');
 R.tick(2000);
 const dupId=idFor('gs-eleven',a.toy.id,100);const d=await R.store.spin('gs-eleven',dupId);
 assert(d.ok&&d.duplicate&&d.count===2&&d.refund===5,'a repeat toy: count 2 and 5 back');assert.equal(R.balance(),15,'50 − 20 − 20 + 5');
 R.tick(2000);const d2=await R.store.spin('gs-eleven',dupId);assert(d2.ok&&d2.repeat&&d2.refund===5);assert.equal(R.balance(),15,'the refund is never paid twice');
 R.tick(2000);const poor=await R.store.spin('gs-eleven','spin-poor');assert(!poor.ok&&poor.reason==='coins','15 coins cannot pay 20');assert.equal(R.balance(),15,'balance unchanged, never negative');
 assert.equal(R.store.read().owned[a.toy.id].n,2);assert.equal(Object.keys(R.store.read().owned).length,1,'a refused spin gives nothing');
 // Two taps at once with coins for one: only one spin goes through (the busy gate + the wallet's lock).
 const T2=rig(30);const both=await Promise.all([T2.store.spin('gs-summit','x1'),T2.store.spin('gs-summit','x2')]);
 assert.equal(both.filter(r=>r.ok).length,1,'one capsule for one payment');assert.equal(T2.balance(),10);
 // Two separate stores (two tabs) racing for the last 20 coins: the wallet lets only one pay.
 const T3=rig(20),other=St.createGashaponStore({read:()=>null,write:()=>{},now:()=>Date.now(),day:localPlayDay,spend:(id,c,r)=>T3.wallet.spend(id,c,r),refund:async()=>0});
 const race=await Promise.all([T3.store.spin('gs-jetty','r1'),other.spin('gs-jetty','r2')]);assert.equal(race.filter(r=>r.ok).length,1,'two tabs cannot overdraw');assert.equal(T3.balance(),0);
});

await ok('spin safety: unknown machine / bad id, cool-down, daily cap, failed save retried without a new charge',async()=>{
 const R=rig(10000);
 assert.equal((await R.store.spin('gs-nope','ok-id')).reason,'machine');assert.equal((await R.store.spin('gs-eleven','bad id!')).reason,'id');assert.equal((await R.store.spin('gs-eleven','__proto__x'.repeat(10))).reason,'id');
 assert((await R.store.spin('gs-eleven','c1')).ok);assert.equal((await R.store.spin('gs-eleven','c2')).reason,'cooldown','a second spin within 1.5 s waits');
 for(let i=2;i<=E.GASHAPON.spinsPerDay;i++){R.tick(2000);assert((await R.store.spin('gs-sharks','c'+i)).ok,'spin '+i);}
 R.tick(2000);const cap=await R.store.spin('gs-sharks','over');assert.equal(cap.reason,'daily');assert.equal(R.store.spinsLeftToday(),0);
 const spent=10000-R.balance();R.tick(24*3600e3);assert((await R.store.spin('gs-sharks','tomorrow')).ok,'a new day, new spins');assert.equal(R.store.spinsLeftToday(),E.GASHAPON.spinsPerDay-1);
 // The save fails after the coins are spent: the retry (same id) finishes it with no second charge.
 R.tick(2000);const before=R.balance();R.failWrite(true);const f=await R.store.spin('gs-cayplaza','sv1');assert(!f.ok&&f.reason==='save');R.failWrite(false);
 assert.equal(R.balance(),before-20);const f2=await R.store.spin('gs-cayplaza','sv1');assert(f2.ok&&!f2.repeat,'the retry opens the capsule');assert.equal(R.balance(),before-20,'and costs nothing more');
 assert(spent>0);
});

await ok('save: round trip, sanitiser drops junk, owned counts + first-found time kept',async()=>{
 const R=rig(500);assert((await R.store.spin('gs-oldtown','rt1')).ok);R.tick(5000);assert((await R.store.spin('gs-pixel-nope','rt2')).reason==='machine');assert((await R.store.spin('gs-arcade-pixel','rt3')).ok);
 const raw=R.raw(),s=JSON.parse(raw);assert.equal(s.version,1);assert.equal(Object.keys(s.owned).length,2);
 for(const o of Object.values(s.owned))assert(o.n===1&&o.first>0);
 same(St.sanitizeGashapon(JSON.parse(raw)),s,'round trip is lossless');
 const R2=rig(500,{saved:raw});same(R2.store.read(),s,'a reload (another device after sync) reads the same collection');
 const junk={version:1,owned:{'not-a-toy':{n:3,first:1},'cup-captain':{n:-2,first:1},'pixel-ball':{n:2.7,first:5}},spins:{'a b':{m:'gs-eleven',toy:'pixel-ball',at:1},ok1:{m:'gs-eleven',toy:'pixel-ball',at:1},ok2:{m:'gs-arcade-pixel',toy:'pixel-ball',at:2}},day:5,today:'x',last:-1};
 const clean=St.sanitizeGashapon(junk);same(clean.owned,{'pixel-ball':{n:2,first:5}});same(Object.keys(clean.spins),['ok2'],'receipts must match their machine');assert.equal(clean.day,'');assert.equal(clean.today,0);
 for(const bad of [null,'x',{version:2},[],{version:1,owned:'x'}])same(St.sanitizeGashapon(bad).owned,{});
 const R3=rig(500,{saved:'{not json'});same(R3.store.read(),St.emptyGashapon(),'corrupt save reads as empty, never throws');
 // Nov 13 2026: a spin at a stadium machine gives a toy of its set, and its receipt survives a reload (receipts match the set).
 {const RS=rig(100);const r=await RS.store.spin('gs-stadium-boots','st1');assert(r.ok&&r.toy.machine==='gs-eleven','a Boots & Kits toy from the stadium machine');assert.equal(RS.balance(),80,'the same 20-coin price');
  same(Object.keys(St.sanitizeGashapon(JSON.parse(RS.raw())).spins),['st1'],'the stadium receipt is kept');same(St.sanitizeGashapon({version:1,owned:{},spins:{x1:{m:'gs-stadium-pixel',toy:r.toy.id,at:1}}}).spins,{},'a receipt whose toy is not in that machine\'s set is dropped');}
 // Receipts are bounded.
 const R4=rig(100000);for(let i=0;i<E.GASHAPON.spinsPerDay;i++){R4.tick(2000);await R4.store.spin('gs-westbeach','b'+i);}
 for(let d=1;d<5;d++){R4.tick(24*3600e3);for(let i=0;i<E.GASHAPON.spinsPerDay;i++){R4.tick(2000);await R4.store.spin('gs-westbeach',`d${d}-${i}`);}}
 assert(Object.keys(JSON.parse(R4.raw()).spins).length<=St.RECEIPTS_KEPT,'receipts capped at '+St.RECEIPTS_KEPT);
 const prog=R4.store.progress();assert(prog.all>=1&&prog.all<=6&&prog.per['gs-westbeach']===prog.all);
});

await ok('save key classified: fi2-gashapon-v1 is SYNC (with the account snapshot, like the Konbini Collection) and in the doc table A',()=>{
 const S=load('lib/saves/snapshot.ts');assert.equal(St.GASHAPON_KEY,'fi2-gashapon-v1');assert(S.SYNC_KEYS.includes(St.GASHAPON_KEY));assert(S.isSyncKey(St.GASHAPON_KEY));
 assert(!S.DEVICE_KEYS.includes(St.GASHAPON_KEY)&&!S.NEVER_KEYS.includes(St.GASHAPON_KEY));
 const doc=read('docs/accounts-design.md'),a=doc.slice(doc.indexOf('**A. Progress: synced**'),doc.indexOf('**B. Device preferences'));assert(a.includes('`fi2-gashapon-v1`'),'doc table A');
 // Pure modules: no React, no three.js, no window.
 for(const f of ['machines','toys','store'])assert(!/from ['"](react|three)['"]|\bwindow\.|document\./.test(read(`lib/gashapon/${f}.ts`).replace(/\/\*[\s\S]*?\*\//g,'')),f+'.ts stays pure');
 assert(fs.existsSync(path.join(base,'docs/gashapon-design.md')),'the design doc');
});

if(failed){console.log(failed+' FAILED');process.exit(1);}console.log('PASS gashapon data: 18 machines placed (4 at the DRIP FC Stadium sharing island sets), 84 toys, odds, spins against the real wallet, save + sync key');
})().catch(e=>{console.error(e);process.exit(1);});
