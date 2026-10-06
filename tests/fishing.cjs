// Fishing + market stand: catch logic, values, soft cap, Fishbook persistence, selling into the shared wallet, club facts.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..');
function environment(){
 const data=new Map(),events=new Map(),cache=new Map();
 const localStorage={getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
 const window={addEventListener:(n,f)=>events.set(n,f),removeEventListener:(n,f)=>{if(events.get(n)===f)events.delete(n);}};
 const context=vm.createContext({console,Set,Map,Math,Date,JSON,Promise,Object,Array,Number,String,Error,URL,localStorage,window,structuredClone,queueMicrotask});
 const overrides=new Map();
 function load(name){const file=path.resolve(ROOT,name);if(overrides.has(file))return overrides.get(file);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id));
  cache.set(file,mod.exports);return mod.exports;}
 return {load,data,override:(name,value)=>overrides.set(path.resolve(ROOT,name),value),
  /** Re-evaluate one module (its imports stay cached), like a hot update of that file. */
  fresh:name=>{cache.delete(path.resolve(ROOT,name));return load(name);}};
}
const lcg=seed=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};

(async()=>{
const e=environment();
const cat=e.load('lib/town/fishing/fishCatalog.ts'),core=e.load('lib/town/fishing/fishingCore.ts');
const {FISH,FISH_SPOTS,KEEPER_LESSONS,RARITY_LABEL,MARKET_STAND,fishById}=cat;
const straight=(r,f)=>{const pts=[];for(let i=0;i<=8;i++)pts.push({x:3-(3-cat.SHADOW_LENGTH[f.shadow]*.5-.05)*i/8,z:0});return {points:pts,circles:false,angle:0};};
const spawn={approach:straight,out:{x:1,z:0}};

// ---- Catalogue + football facts ----
assert(FISH.length>=10&&FISH.length<=72,'10 shared species + spot specials + the Deep Sea Boat creatures');assert(FISH.every(f=>f.group!=='shark'||(core.reelRange(f)[0]===10&&core.reelRange(f)[1]===14)),'every shark, whatever its rarity, needs 10-14 taps');
assert.equal(new Set(FISH.map(f=>f.id)).size,FISH.length,'unique ids');
const SPOT_IDS=FISH_SPOTS.map(s=>s.id),PRICE={common:[2,4],uncommon:[4,7],rare:[8,11],legendary:[12,20]};
for(const f of FISH){
 // Every species: a sourced football story, a spot and a rarity (user, Sep 28 2026).
 assert(f.club&&f.club.name&&f.club.fact.length>30&&f.club.fact.length<=230,`${f.id}: one-line club fact`);
 assert(/^https:\/\//.test(f.club.source),`${f.id}: cited source`);
 for(const u of f.club.sources??[])assert(/^https:\/\//.test(u),`${f.id}: extra sources are URLs`);
 assert(['Nickname','Port city','Fan culture','Football culture','Crest','Mascot','Club name'].includes(f.club.link),`${f.id}: link kind`);
 assert(['common','uncommon','rare','legendary'].includes(f.rarity),`${f.id}: rarity`);
 assert(Array.isArray(f.spots)&&f.spots.length>=1&&f.spots.every(id=>SPOT_IDS.includes(id)),`${f.id}: lives at a real spot`);
 assert(Number.isInteger(f.price)&&f.price>=PRICE[f.rarity][0]&&f.price<=PRICE[f.rarity][1],`${f.id}: price ${f.price} fits its rarity`);
 assert(f.size[0]>0&&f.size[1]>f.size[0],`${f.id}: size range`);
 assert(FISH_SPOTS.some(s=>f.id in s.weights),`${f.id}: catchable somewhere`);
 assert(f.group&&f.shape&&cat.SHADOW_LENGTH[f.shadow],`${f.id}: group, art shape and shadow size`);
}
// Spot-exclusive specials: at most 10 per spot, each only at its own spot, and every spot has its own.
const exclusives=FISH.filter(cat.isExclusive);
// The East Pier (Sep 29 2026) has no specials by design: its table reuses shared species (shore commons + a few visitors).
// The six causeway and Coral Cay spots (Oct 5 2026, `area` set) follow the East Pier's rule: shared species only.
for(const s of FISH_SPOTS){const own=exclusives.filter(f=>f.spots[0]===s.id);if(s.id==='east-pier'||s.area){assert.equal(own.length,0,`${s.id}: no specials of its own`);continue;}assert(own.length>=1&&own.length<=10,`${s.id}: 1-10 specials (${own.length})`);}
{const pier=cat.spotById('east-pier'),w=Object.entries(pier.weights),tot=w.reduce((n,[,x])=>n+x,0),ev=w.reduce((n,[id,x])=>n+x/tot*fishById(id).price,0);
 assert(['shrimp','sardine','mackerel','sea-bass','herring','cod','haddock','tuna','octopus'].every(id=>id in pier.weights)&&w.length===9,'east-pier: shore commons, three good catches, a rare tuna and a legendary octopus');
 assert(ev>3.8&&ev<4.3,`east-pier mean catch ${ev.toFixed(2)} ≈ the shore's 4.0 (economy unchanged)`);}
assert(new Set(FISH.map(f=>f.club.name+'|'+f.name)).size===FISH.length,'no duplicate stories');
assert.equal(FISH.filter(f=>/Paul the Octopus/.test(f.club.name)).length,1,'Paul the Octopus appears once');
assert(FISH.filter(f=>f.group==='shark').length>=4,'sharks are included');
// User decision (Sep 28 2026): no marine mammals or reptiles at all, not even release-only. Explicit denylist of kinds.
const DENIED_KINDS=['dolphin','porpoise','whale','orca','seal','sea-lion','walrus','otter','manatee','dugong','turtle','tortoise','crocodile','alligator','iguana','snake','mammal','reptile'];
const DENIED_NAMES=/\b(dolphins?|porpoises?|orcas?|seals?|sea lions?|walrus|otters?|manatees?|dugongs?|turtles?|tortoises?|crocodiles?|iguanas?|sea snakes?)\b|\bwhales?\b(?! shark)/i;
for(const f of FISH){
 assert(!DENIED_KINDS.includes(f.group)&&!DENIED_KINDS.includes(f.shape),`${f.id}: not a mammal or reptile (group ${f.group}, shape ${f.shape})`);
 assert(!DENIED_NAMES.test(f.name)&&!DENIED_NAMES.test(f.id.replace(/-/g,' ')),`${f.id}: name is not a mammal or reptile`);
}
assert(FISH.every(f=>['fish','shark','ray','eel','seahorse','crab','lobster','shellfish','octopus','squid'].includes(f.group)),'only fish and a few crustaceans, shellfish, the octopus and the squid');
{const fishArt=fs.readFileSync(path.join(ROOT,'components/FishArt.tsx'),'utf8');for(const k of ['dolphin','whale','turtle','seal','dugong'])assert(!new RegExp(`case '${k}'`).test(fishArt),`FishArt has no ${k} art`);}
// Big animals pay more, but the economy stays sane (docs/island-jobs.md: welcome 40, packs 40/60, books 100).
assert(Math.max(...FISH.map(f=>f.price))<=20,'no catch pays more than 20 coins');
for(const s of FISH_SPOTS){assert(Object.keys(s.weights).every(id=>fishById(id)),`${s.id}: valid species`);assert(s.story,'island story text');}
// 13 spots (Oct 5 2026): the 6 main-island shore posts (the East Pier is the 6th), the Deep Sea Boat, and 6 more on the Coral
// Cay side (user: "add more fishing spots along the bridge road and coral cay island"): 3 on the causeway's sand banks and 3 on
// the cay's beaches. Still ONE merged post mesh and ONE float InstancedMesh for all of them (asserted below).
assert.equal(FISH_SPOTS.length,13,'13 fishing spots: 6 main-island posts, the Deep Sea Boat, 3 causeway posts and 3 Coral Cay posts');
{const cayCat=e.load('lib/town/coralCay.ts'),{onLand}=e.load('lib/town/landmass.ts'),world=fs.readFileSync(path.join(ROOT,'lib/town/fishing/fishingWorld.ts'),'utf8');
 const causeway=FISH_SPOTS.filter(s=>s.area==='causeway'),cay=FISH_SPOTS.filter(s=>s.area==='cay');
 assert.equal(causeway.length,3,'three causeway spots');assert.equal(cay.length,3,'three Coral Cay spots');
 const sharks=cayCat.SHARK_LOOPS.flatMap(l=>l.points),onIsland=e.load('lib/town/shoreline.ts').onIsland;
 // The post (kiosk) footprint exactly as fishingWorld.ts kioskAt/fishingKioskObstacles place it (that module needs WebGL-side three imports).
 assert(/KIOSK_OFFSET=2\.1/.test(world)&&/size=\(1\.2\+\.7\)\*c/.test(world),'kiosk rule unchanged');
 const kioskOf=s=>{const dx=s.buoy.x-s.x,dz=s.buoy.z-s.z,l=Math.hypot(dx,dz),size=(1.2+.7)*Math.SQRT1_2;return {x:s.x-dz/l*2.1,z:s.z+dx/l*2.1,w:size,d:size};};
 for(const s of [...causeway,...cay]){
  const k=kioskOf(s);
  assert(onLand(s.x,s.z)&&!onIsland(s.x,s.z),`${s.id}: stands on walkable Coral Cay ground`);
  for(const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]])assert(onLand(k.x+dx*k.w/2,k.z+dz*k.d/2),`${s.id}: the post stands on sand, not in the sea`);
  assert(core.inOpenWater(s.buoy.x,s.buoy.z),`${s.id}: the idle float sits in open water`);
  const c=core.castPoint(s,s);assert(core.inOpenWater(c.x,c.z)&&Math.hypot(c.x-s.buoy.x,c.z-s.buoy.z)<3,`${s.id}: the cast lands in open water by the float`);
  // Spread out: at least 60 m from every other fishing spot.
  for(const o of FISH_SPOTS)if(o!==s)assert(Math.hypot(o.x-s.x,o.z-s.z)>60,`${s.id}: 60+ m from ${o.id}`);
 }
 for(const s of causeway){const f=cayCat.causewayFrame(s.x,s.z,true),kf=cayCat.causewayFrame(kioskOf(s).x,kioskOf(s).z,true);
  assert(f.s>cayCat.CAUSEWAY.sWater0&&f.s<cayCat.CAUSEWAY.sWater1,`${s.id}: over the water stretch of the causeway`);
  // Lanes are ±2 m (cayTraffic.ts CAY_LANE_OFFSET), lamps 6.65 m, the deck edge 7 m: the angler and the post stand on the bank beyond.
  assert(f.dist>cayCat.CAUSEWAY.deckHalf+1&&kf.dist-1>cayCat.CAUSEWAY.deckHalf,`${s.id}: angler and post stand on the sand bank, off the deck and clear of traffic`);
  assert(Math.min(...sharks.map(p=>Math.hypot(p.x-s.buoy.x,p.z-s.buoy.z)))>=9,`${s.id}: the float is clear of the causeway sharks' patrols`);
  assert(cayCat.SANDBARS.every(b=>Math.hypot(b.x-s.x,b.z-s.z)>b.radius+10),`${s.id}: not on a sandbar stop`);}
 for(const s of cay){assert(cayCat.onCay(s.x,s.z)&&cayCat.distanceToCayShore(s.x,s.z)<6,`${s.id}: on the cay's beach, near the water`);
  assert(!cayCat.onCourtBeach(s.x,s.z)&&!cayCat.inHostelArea(s.x,s.z),`${s.id}: away from the court and the hostel`);
  const F=cayCat.FARM.fence;assert(!(s.x>F[0].x-6&&s.x<F[1].x+6&&s.z>F[0].z-6&&s.z<F[5].z+6),`${s.id}: outside the farm fence`);}
 // Mean catch value stays near the shore's (≈ 4 coins), like the East Jetty: no new "best spot" to farm.
 for(const s of [...causeway,...cay]){const w=Object.entries(s.weights),tot=w.reduce((n,[,x])=>n+x,0),ev=w.reduce((n,[id,x])=>n+x/tot*fishById(id).price,0);
  assert(ev>3.7&&ev<4.3,`${s.id}: mean catch ${ev.toFixed(2)} ≈ the shore's 4.0`);assert(w.length>=6,`${s.id}: a varied table`);}
 // Shallow sandbar water vs the open channel: shrimp in the shallows, tuna only where the water is deep and open.
 assert(!('shrimp' in cat.spotById('causeway-channel').weights)&&'tuna' in cat.spotById('causeway-channel').weights,'the channel is deep water: tuna, no shrimp');
 for(const id of ['causeway-gate','turtle-bank','farm-beach'])assert('shrimp' in cat.spotById(id).weights&&!('tuna' in cat.spotById(id).weights),`${id}: sandy shallows`);
 // Heat: still one merged post mesh (built from FISH_SPOTS) and one float InstancedMesh sized to FISH_SPOTS.
 assert(/for\(const s of FISH_SPOTS\)\{if\(s\.boat\)continue;/.test(world)&&/new T\.InstancedMesh\(floatGeo,floatMaterial,FISH_SPOTS\.length\)/.test(world)&&(world.match(/new T\.Mesh\(merged,/g)||[]).length===1,'posts merged into one mesh, floats instanced');}

// Kid safety: no odds or percentages anywhere the player reads.
const sessionMod=e.load('lib/town/fishing/fishingSession.ts');
const shown=[...Object.values(RARITY_LABEL),...Object.values(cat.SHADOW_LABEL),...FISH.flatMap(f=>[f.name,f.plural,f.club.fact,f.club.name,f.club.nickname??'',f.club.credit??'']),...Object.values(KEEPER_LESSONS).flatMap(l=>[l.title,l.text]),...FISH_SPOTS.flatMap(s=>[s.story,s.name]),sessionMod.PULL_HINT];
assert(shown.every(t=>!/%|percent|chance|odds|probab|\b1 in \d/i.test(t)),'no odds or percentages shown');
for(const f of ['components/FishingHost.tsx','components/Fishbook.tsx','components/MarketStand.tsx']){const src=fs.readFileSync(path.join(ROOT,f),'utf8');
 assert(!/\*\s*100|percent|%\s*[<'"`]|\bodds\b|RARITY_WEIGHT|\.weights\b/.test(src),`${f}: shows no odds, weights or percentages`);}
assert(/sciencedirect/.test(KEEPER_LESSONS.nibble.source),'the nibble (patience) lesson cites Bar-Eli et al.');
// Kid safety (user, Sep 27 2026): the kid-facing fishing + market UI shows no clickable external links. Sources stay in the data
// (asserted above) and docs; the Fishbook shows a plain-text credit only.
for(const f of ['components/FishingHost.tsx','components/Fishbook.tsx','components/MarketStand.tsx','components/MarketCardsSection.tsx','components/FishArt.tsx']){
 const src=fs.readFileSync(path.join(ROOT,f),'utf8');
 assert(!/<a[\s>]/.test(src),`${f}: no anchor tags in kid-facing fishing UI`);
 assert(!/href=/.test(src),`${f}: no hrefs`);
 assert(!/window\.open\(|target="_blank"/.test(src),`${f}: no external navigation`);
}
assert(/Source: \{credit\(f\)\}/.test(fs.readFileSync(path.join(ROOT,'components/Fishbook.tsx'),'utf8')),'Fishbook keeps a plain-text source credit');
assert(/Found at/.test(fs.readFileSync(path.join(ROOT,'components/Fishbook.tsx'),'utf8')),'Fishbook shows where each species lives');
// Specific verified facts stay precise (see docs/fishing.md).
assert(/8 out of 8/.test(fishById('octopus').club.fact));assert(/1989/.test(fishById('haddock').club.fact));assert(/first French club/.test(fishById('sea-bass').club.fact));assert(/Europe's biggest/.test(fishById('mackerel').club.fact));


// ---- Catch rolls: weighted per spot, commons first (10k simulated casts per spot) ----
const TIERS=['common','uncommon','rare','legendary'];
for(const s of FISH_SPOTS){const rand=lcg(11+s.id.length),n={},tier={common:0,uncommon:0,rare:0,legendary:0};
 for(let i=0;i<10000;i++){const id=core.rollCatch(s,rand());n[id]=(n[id]??0)+1;tier[fishById(id).rarity]++;}
 for(const id of Object.keys(n)){const f=fishById(id);assert(f.spots.includes(s.id),`${s.id}: ${id} lives here`);}
 for(const f of exclusives)if(f.spots[0]!==s.id)assert(!n[f.id],`${f.id} is only caught at ${f.spots[0]}, never at ${s.id}`);
 const present=TIERS.filter(t=>FISH.some(f=>f.rarity===t&&f.spots.includes(s.id)));
 for(let i=1;i<present.length;i++)assert(tier[present[i-1]]>tier[present[i]],`${s.id}: ${present[i-1]} (${tier[present[i-1]]}) beat ${present[i]} (${tier[present[i]]})`);
 // Per species too: each common is met more often than any rare or legendary animal at the same spot.
 const avg=t=>{const ids=FISH.filter(f=>f.rarity===t&&f.spots.includes(s.id)).map(f=>n[f.id]??0);return ids.length?ids.reduce((a,b)=>a+b,0)/ids.length:null;};
 const avgs=present.map(avg);for(let i=1;i<avgs.length;i++)assert(avgs[i-1]>avgs[i],`${s.id}: a typical ${present[i-1]} is met more often than a ${present[i]}`);
 assert(tier.common/10000>.5,`${s.id}: most casts bring a common catch`);
}
// Rarer animals are harder in every way: bigger or faster shadows, more taps, shorter bite windows.
{const rank=f=>TIERS.indexOf(f.rarity),avgLen=t=>{const fs=FISH.filter(f=>f.rarity===t);return fs.reduce((a,f)=>a+cat.SHADOW_LENGTH[f.shadow],0)/fs.length;};
 assert(avgLen('common')<avgLen('rare')&&avgLen('uncommon')<avgLen('legendary'),'rarer animals cast bigger shadows');
 for(let i=1;i<TIERS.length;i++){assert(core.SWIM_SPEED[TIERS[i]]>core.SWIM_SPEED[TIERS[i-1]],'rarer is faster');assert(core.BITE_WINDOW[TIERS[i]]<core.BITE_WINDOW[TIERS[i-1]],'rarer bites are shorter');}
 assert(core.BITE_WINDOW.legendary<core.BITE_WINDOW.common);void rank;}
// Reel taps scale with the animal: commons 2-3, uncommon 4-5, rare 6-8, legendary and sharks 10-14.
{const WANT={common:[2,3],uncommon:[4,5],rare:[6,8],legendary:[10,14]};
 for(const f of FISH){const want=f.group==='shark'?WANT.legendary:WANT[f.rarity],lo=core.reelTapsFor(f,f.size[0]),hi=core.reelTapsFor(f,f.size[1]),mid=core.reelTapsFor(f,(f.size[0]+f.size[1])/2);
  assert.equal(lo,want[0],`${f.id}: smallest needs ${want[0]} taps`);assert.equal(hi,want[1],`${f.id}: biggest needs ${want[1]} taps`);assert(mid>=lo&&mid<=hi);}
 for(let i=1;i<TIERS.length;i++)assert(core.REEL_TAPS[TIERS[i]][0]>core.REEL_TAPS[TIERS[i-1]][1],'every tier needs more taps than the one below');}
// Resistance: big animals pull back during a pause (never below zero); commons never do; tapping stops the pull.
{const mk=id=>{const s=core.createSession(),f=fishById(id);s.fish={id,size:f.size[1]};s.phase='bite';s.window=1;core.tapSession(s);return s;};
 const common=FISH.find(f=>f.rarity==='common'),big=FISH.find(f=>f.group==='shark');
 for(const [f,pulls] of [[common,false],[big,true]]){const s=mk(f.id);const sp=FISH_SPOTS.find(x=>f.spots.includes(x.id));
  for(let i=0;i<2;i++){for(let k=0;k<2;k++)core.stepSession(s,sp,.1,()=>.5,spawn);core.tapSession(s);}
  const before=s.reelTaps;const ev=[];for(let i=0;i<18;i++)ev.push(...core.stepSession(s,sp,.1,()=>.5,spawn));
  if(pulls){assert(s.reelTaps<before&&s.reelTaps>=0,`${f.id} pulls line back during a pause`);assert(ev.includes('pull')&&s.pulling);core.tapSession(s);assert(!s.pulling,'a tap stops the pull');}
  else{assert.equal(s.reelTaps,before,'commons never pull back');assert(!ev.includes('pull'));}
  assert.equal(s.phase,'reeling','a pause alone does not lose the fish');}}

// ---- Catch rolls ----
const pier=FISH_SPOTS[0];assert.equal(core.rollCatch(pier,0),Object.keys(pier.weights)[0]);
{const rand=lcg(7),n={};for(let i=0;i<20000;i++){const id=core.rollCatch(pier,rand());n[id]=(n[id]??0)+1;}
 assert(Object.keys(n).every(id=>id in pier.weights),'only spot species');
 const rare=Object.entries(n).filter(([id])=>['rare','legendary'].includes(fishById(id).rarity)).reduce((a,[,v])=>a+v,0);assert(rare>0&&rare<20000*.15,'rare fish stay rare');}
for(const f of FISH){const a=core.rollSize(f.id,0),b=core.rollSize(f.id,1),m=core.rollSize(f.id,.5);assert(a===f.size[0]&&b===f.size[1]&&m>a&&m<b);assert(cat.SHADOW_LENGTH[f.shadow]>0,`${f.id}: shadow size`);}
assert(cat.SHADOW_LENGTH.small<cat.SHADOW_LENGTH.medium&&cat.SHADOW_LENGTH.medium<cat.SHADOW_LENGTH.large&&cat.SHADOW_LENGTH.large<cat.SHADOW_LENGTH.huge);
assert(fishById('tuna').shadow==='huge'&&fishById('shrimp').shadow==='small','shadow size hints at the species');

// ---- Geometry: every spot casts into the water; shadows start in the water ----
const shore=e.load('lib/town/shoreline.ts');
for(const s of FISH_SPOTS){const c=core.castPoint(s,s);assert(!shore.onIsland(c.x,c.z),`${s.id}: float lands in the water`);assert(c.distance>3&&c.distance<=30);
 const r=lcg(3);for(let i=0;i<10;i++){const p=core.shadowSpawn(c,r);assert(!shore.onIsland(c.x+p.x,c.z+p.z)||Math.hypot(p.x,p.z)<4,`${s.id}: shadow starts in the water`);}}

// ---- Approaches: a different direction each cast, curved paths, always in the water (user, Sep 28 2026) ----
for(const s of FISH_SPOTS){const c=core.castPoint(s,s),r=lcg(40+s.id.length),sectors=new Set(),species=FISH.filter(f=>f.spots.includes(s.id));let loops=0,curved=0;
 for(let i=0;i<50;i++){const f=species[i%species.length],p=core.planApproach(c,r,f);
  assert(p.points.length>=8,'a route, not a jump');
  for(const q of p.points)assert(core.inOpenWater(c.x+q.x,c.z+q.z),`${s.id}: ${f.id} route stays in open water`);
  const last=p.points[p.points.length-1];assert(Math.hypot(last.x,last.z)<=cat.SHADOW_LENGTH[f.shadow]*.5+.06,'ends with its mouth at the float');
  const a=p.points[0];sectors.add(Math.floor(((Math.atan2(a.x,a.z)+Math.PI*2)%(Math.PI*2))/(Math.PI/4)));
  if(p.circles)loops++;
  // Curved: the route bends away from the straight start-to-float line somewhere.
  const L=Math.hypot(a.x,a.z),off=Math.max(...p.points.map(q=>Math.abs(q.x*a.z-q.z*a.x)/L));if(off>.2)curved++;
 }
 assert(sectors.size>=4,`${s.id}: shadows come from ${sectors.size} of 8 compass sectors`);assert(curved>=40,`${s.id}: most routes curve (${curved}/50)`);
 if(species.some(f=>f.rarity==='legendary'||f.group==='shark'))assert(loops>0,`${s.id}: big or rare animals sometimes circle the float`);}

// ---- Live session: cast -> float -> shadow -> nibbles -> bite -> tap window ----
const run=(s,spot,rand,until,max=40)=>{const ev=[];for(let t=0;t<max;t+=1/30){ev.push(...core.stepSession(s,spot,1/30,rand,spawn));if(until(s,ev))return ev;}return ev;};
{const s=core.createSession(),r=lcg(21);assert.equal(core.tapSession(s),'cast');assert.equal(s.phase,'casting');
 const ev=run(s,pier,r,x=>x.phase==='bite');
 assert.equal(s.phase,'bite','a real bite always comes');const order=ev.filter(x=>x!=='nibble');assert.deepEqual([...order],['splash','notice','bite']);
 const nib=ev.filter(x=>x==='nibble').length;assert(nib>=1&&nib<=4,`1-4 nibbles (${nib})`);
 assert.equal(core.tapSession(s),'reel');assert.equal(s.phase,'reeling');assert.equal(core.tapSession(s),null,'duplicate tap cannot reel instantly');while(s.phase==='reeling'){core.stepSession(s,pier,.1,r,spawn);core.stepSession(s,pier,.1,r,spawn);core.tapSession(s);}assert.equal(s.phase,'caught');assert(s.fish&&fishById(s.fish.id),'the hooked fish is known');
 const landedFish=s.fish;
 for(let i=0;i<120;i++){core.stepSession(s,pier,.05,r,spawn);assert.equal(core.tapSession(s),null,'rapid reel taps cannot dismiss a catch');}
 assert.equal(s.phase,'caught');assert.equal(s.fish,landedFish,'catch fact remains available throughout the tap burst');
 for(let i=0;i<8;i++)core.stepSession(s,pier,.1,r,spawn);
 assert.equal(core.tapSession(s),'cast','an intentional tap after a pause casts again');}
// Nibble counts across seeds; legendary fish nibble faster and more.
{const counts=new Set();for(let seed=1;seed<60;seed++){const s=core.createSession(),r=lcg(seed);core.tapSession(s);const ev=run(s,pier,r,x=>x.phase==='bite');counts.add(ev.filter(x=>x==='nibble').length);}
 assert([...counts].every(n=>n>=1&&n<=4)&&counts.size>=3,'nibble count varies 1-4');}
// Reaction windows: about 0.6-1 s, a little longer in easy mode.
for(const [r,w] of Object.entries(core.BITE_WINDOW)){assert(w>=.6&&w<=1,`${r} window ${w}`);assert(w+core.EASY_BONUS<=1.4);}
// Too late: the fish swims off, then a new shadow comes (nothing lost).
{const s=core.createSession(),r=lcg(5);core.tapSession(s);run(s,pier,r,x=>x.phase==='bite');const w=s.window;const ev=run(s,pier,r,x=>x.phase==='escaped',5);
 assert.equal(s.phase,'escaped');assert(ev.includes('escaped'));assert(Math.abs(s.t)<.1);
 run(s,pier,r,x=>x.phase==='floating',5);assert.equal(s.phase,'floating');assert.equal(s.fish,null);
 const ev2=run(s,pier,r,(x,e)=>e.includes('notice'),10);assert(ev2.includes('notice'),'another fish comes along');assert(w>0);}
// Too early: tapping on a nibble scares the fish (no catch).
{const s=core.createSession(),r=lcg(9);core.tapSession(s);run(s,pier,r,(x,e)=>e.includes('nibble'));assert.equal(s.phase,'nibble');
 assert.equal(core.tapSession(s),'scared');assert.equal(s.phase,'scared');run(s,pier,r,x=>x.phase==='floating',5);assert.equal(s.phase,'floating','a new shadow will come');}
// Tapping while nothing is biting just reels the line in.
{const s=core.createSession(),r=lcg(2);core.tapSession(s);run(s,pier,r,x=>x.phase==='floating');assert.equal(core.tapSession(s),'reeled-in');assert.equal(s.phase,'ready');}
// Idle: with no taps at all, the line is reeled in after a few fish (no endless cycle).
{const s=core.createSession(),r=lcg(4);core.tapSession(s);const ev=run(s,pier,r,x=>x.phase==='ready',200);assert.equal(s.phase,'ready','idle session winds down');assert.equal(ev.filter(x=>x==='escaped').length,core.IDLE_ESCAPES);assert(ev.includes('reeled-in'));}

// ---- Session store (HUD bridge): snapshot per phase, lessons, cues, landing ----
{const sessMod=e.load('lib/town/fishing/fishingSession.ts'),cues=[],landed=[];
 const api=sessMod.createFishingSession((id,size)=>{landed.push([id,size]);return {isNew:true,isBiggest:false,inBasket:true};},k=>cues.push(k));
 let renders=0;api.subscribe(()=>renders++);
 api.start('nope');assert.equal(api.takePending(),null,'unknown spot ignored');
 api.start('west-cove');assert.equal(api.takePending(),'west-cove');api.begin('west-cove');assert(api.getView().active);
 api.pause(true);api.tap();assert.equal(api.session.phase,'ready','drawer input cannot cast');api.pause(false);
 api.tap();assert.equal(api.session.phase,'casting');assert(cues.includes('cast'));
 const r=lcg(8);let steps=0;const rendersBefore=renders;
 while(api.session.phase!=='bite'&&steps++<1500)api.handle(core.stepSession(api.session,FISH_SPOTS[4],1/30,r,spawn));
 assert(renders-rendersBefore<20,'the HUD re-renders on phase changes only, not per frame');
 assert(cues.includes('tick')&&cues.includes('plunge')&&cues.includes('splash'));
 assert.equal(api.getView().hint,'Now! Reel it in!');assert(api.getView().lesson,'a keeper lesson was shown');
 api.tap();assert.equal(api.getView().phase,'reeling');assert.equal(landed.length,0,'hooking alone does not award a fish');while(api.session.phase==='reeling'){api.handle(core.stepSession(api.session,FISH_SPOTS[4],.1,r,spawn));api.handle(core.stepSession(api.session,FISH_SPOTS[4],.1,r,spawn));api.tap();}assert.equal(api.getView().phase,'caught');assert.equal(landed.length,1,'the catch is landed once (Fishbook + basket)');assert(api.getView().caught?.isNew);
 assert(cues.includes('fanfare'));assert.equal(api.drainTapEvents().filter(x=>x==='hooked').length,1);
 api.stop();assert(api.takeStop());api.end();assert.equal(api.getView().active,false);assert.equal(api.getView().catches,1);}

// ---- Fishbook + persistence ----
for(const raw of [null,1,'x',{species:{nope:{count:3}},total:-4},{species:{cod:{count:'9'}}}])assert.equal(core.speciesCaught(core.sanitizeFishbook(raw)),0);
let book=core.emptyFishbook();let rec=core.recordCatch(book,'cod',50,1000);assert(rec.isNew&&!rec.isBiggest);book=rec.book;
rec=core.recordCatch(book,'cod',70,2000);assert(!rec.isNew&&rec.isBiggest);book=rec.book;rec=core.recordCatch(book,'cod',60,3000);assert(!rec.isBiggest);book=rec.book;
assert.equal(JSON.stringify(book.species.cod),JSON.stringify({count:3,biggest:70,first:1000}));assert.equal(book.total,3);
assert.equal(core.sanitizeFishbook({species:{cod:{count:1,biggest:9999,first:1}}}).species.cod.biggest,fishById('cod').size[1],'sizes are clamped');
const merged=core.mergeFishbooks(book,core.recordCatch(core.emptyFishbook(),'tuna',100,5).book);assert.equal(core.speciesCaught(merged),2);

// ---- Market: goods registry, soft cap, sell one / all, into the shared wallet ----
const goods=e.load('lib/town/market/goods.ts'),market=e.load('lib/town/market/market.ts'),stand=e.load('lib/town/market/marketStand.ts');
for(const f of FISH){const g=goods.goodById(f.id);assert(g&&g.kind==='fish'&&g.price===f.price&&g.lesson.includes(f.club.name),`${f.id} is a sellable good`);}
assert(goods.PRODUCE_GOODS.length>0&&goods.GOODS.some(g=>g.kind==='produce'),'produce entries kept');
const walletCore=e.load('lib/arcade/arcadeWalletCore.ts'),jobWallet=e.load('lib/town/jobs/jobWallet.ts');
let saved=null,serial=0,queue=Promise.resolve();
const wallet=walletCore.createArcadeWallet({read:()=>saved&&JSON.parse(JSON.stringify(saved)),write:v=>{saved=JSON.parse(JSON.stringify(v));},lock:fn=>{const t=queue.then(fn);queue=t.catch(()=>{});return t;},valid:new Set(),grant:()=>true,notify:()=>{},now:()=>1700000000000+serial,id:()=>`id-${++serial}`,random:()=>0});
const bridge=jobWallet.createJobWallet({creditRun:(id,game,target,reason)=>wallet.creditRun(id,game,target,reason),balance:()=>wallet.load().balance,caps:walletCore.ARCADE_COIN_CAPS,read:()=>({version:1,day:'',today:{},lifetime:{},earned:0,best:{},starter:true}),write:(u,n)=>u({version:1,day:'',today:{},lifetime:{},earned:0,best:{},starter:true})});
const day=market.localMarketDay();
const store=e.data;store.set(market.MARKET_STORAGE_KEY,JSON.stringify({version:1,day,basket:{mackerel:3,octopus:1,orange:2},soldToday:0,sales:0,lifetime:0}));
const live=market.createMarket({read:()=>JSON.parse(store.get(market.MARKET_STORAGE_KEY)??'null'),write:v=>store.set(market.MARKET_STORAGE_KEY,JSON.stringify(v)),credit:(id,a,r)=>bridge.credit(id,a,r)});
const ports={read:()=>JSON.parse(store.get(market.MARKET_STORAGE_KEY)??'null'),write:v=>store.set(market.MARKET_STORAGE_KEY,JSON.stringify(v)),credit:(id,a,r)=>bridge.credit(id,a,r),refresh:()=>live.refresh()};
assert.equal(stand.unitPrice(live.read(),'mackerel'),4);
const one=await stand.sellOneGood('mackerel',ports);assert(one.ok&&one.coins===4&&one.credited===4,'sell one pays its price');
assert.equal(live.read().basket.mackerel,2);assert.equal(wallet.load().balance,4);
assert.equal((await stand.sellOneGood('cod',ports)).ok,false,'cannot sell what you do not have');
const all=await live.sell('fish');assert(all.ok&&all.coins===4*2+12&&all.credited===20);assert.equal(wallet.load().balance,24);
assert.equal(stand.basketLines(live.read(),'fish').length,0);assert.equal(stand.basketLines(live.read(),'produce')[0].count,2,'produce stays for its own section');
// Soft cap: after MARKET_FULL_PRICE_COINS of sales today, prices halve (min 1) — shared by fish and produce.
store.set(market.MARKET_STORAGE_KEY,JSON.stringify({...JSON.parse(store.get(market.MARKET_STORAGE_KEY)),basket:{octopus:2,shrimp:1},soldToday:market.MARKET_FULL_PRICE_COINS}));live.refresh();
assert.equal(stand.unitPrice(live.read(),'octopus'),6);assert.equal(stand.allowanceUsed(live.read()),1);
const half=await stand.sellOneGood('octopus',ports);assert(half.ok&&half.coins===6&&half.halfPrice);
const plan=stand.planSellOne({version:1,day,basket:{shrimp:1},soldToday:39,sales:0,lifetime:0},'shrimp');assert.equal(plan.coins,3,'the item that crosses the cap is still full price');
// Idempotent wallet runs: replaying a sale id never pays twice.
const before=wallet.load().balance;assert.equal(await bridge.credit(`market:${day}:1`,4,'replay'),0);assert.equal(wallet.load().balance,before);

// ---- Browser store: landing a fish logs it and fills the shared basket ----
e.override('lib/town/jobs/islandWallet.ts',{islandMarket:live});
const fishingStore=e.load('lib/town/fishing/fishingStore.ts');
const landed=fishingStore.landFish('herring',25,9000);assert(landed.isNew&&landed.inBasket);
assert.equal(JSON.parse(store.get(core.FISHBOOK_STORAGE_KEY)).species.herring.count,1,'Fishbook persists in localStorage');
assert.equal(live.read().basket.herring,1);
store.set(market.MARKET_STORAGE_KEY,JSON.stringify({version:1,day,basket:{shrimp:market.BASKET_LIMIT},soldToday:0,sales:9,lifetime:0}));live.refresh();
const full=fishingStore.landFish('herring',30,9100);assert(!full.inBasket&&full.isBiggest,'full basket: logged, swims free');
assert.equal(JSON.parse(store.get(core.FISHBOOK_STORAGE_KEY)).species.herring.count,2);


// ---- Deep Sea Boat (user, Sep 29 2026): a moored boat south of the Coral Cay causeway; its catches are mostly deep-sea ----
{const cay=e.load('lib/town/coralCay.ts'),data=e.load('lib/town/fishing/deepSeaBoatData.ts'),decks=e.load('lib/town/landableDecks.ts'),land=e.load('lib/town/landmass.ts'),sim=e.load('lib/town/simulation.ts');
 const boat=cat.spotById('deep-sea-boat'),m=data.BOAT_MOORING;
 assert(boat&&boat.boat,'the boat spot exists');
 // The boat's own mooring (the user's circled spot, Sep 29 2026), checked against the live Coral Cay and flight rules:
 // the hull plus a 12 m ring of fishing water is flyable open sea (never land); outside the shallow band; at least 12 m
 // (plus the boat's half-length) from the causeway deck and banks and from every shark patrol point.
 for(let a=0;a<32;a++)for(const r of [0,3,6,9,12]){const x=m.x+Math.cos(a/32*Math.PI*2)*r,z=m.z+Math.sin(a/32*Math.PI*2)*r;
  assert(!sim.flightBlocked(x,z)&&!land.onLand(x,z),`boat water ${x.toFixed(1)},${z.toFixed(1)} is open, flyable sea`);}
 const offShore=shore.distanceToShore(m.x,m.z);assert(offShore>=25&&offShore<=70,`off the main island's east beach, outside the shallow band (${offShore.toFixed(1)} m)`);
 const halfLength=Math.max(-data.BOAT_HULL.x0,data.BOAT_HULL.x1);
 assert(cay.distanceToCayLand(m.x,m.z)>=12+halfLength,'clear of the causeway deck, its banks and the sandbars');
 assert(cay.SHARK_LOOPS.every(l=>l.points.every(p=>Math.hypot(p.x-m.x,p.z-m.z)>=12+halfLength)),'clear of the causeway shark patrols');
 // Bow along the coast (north), casting side (starboard) out to sea (east).
 const bow=data.boatToWorld(1,0),star=data.boatToWorld(0,1);assert(bow.z<m.z-.99&&star.x>m.x+.99,'bow points north along the coast; you cast east, out to sea');
 assert(Math.hypot(boat.x-m.x,boat.z-m.z)<4,'the spot is on the boat');
 assert(!shore.onIsland(boat.x,boat.z)&&!cay.isOnCayLand(boat.x,boat.z),'the boat floats in open water, far from both coasts');
 // The aft deck: a real floor while registered (walkable, landable), water again once removed. Height stays "on foot".
 const deck=data.BOAT_DECK;assert(deck.height<1.2&&deck.height>.4,'deck floor height counts as on foot');
 for(const [u,v] of [[-1,-1],[-1,1],[1,-1],[1,1]]){const c=data.boatToWorld(-2.4+u*deck.w/2,v*deck.d/2);assert(data.onBoatHull(c.x,c.z),'deck lies inside the hull');}
 {const sl=data.worldToBoat(boat.x,boat.z);assert(Math.abs(sl.x+2.4)<=deck.w/2&&Math.abs(sl.z)<=deck.d/2,'the fishing stand is on the deck');}
 assert(!land.onLand(boat.x,boat.z),'no floor before the boat is built');
 const off=decks.registerLandableDeck({...deck});assert(land.onLand(boat.x,boat.z)&&decks.landableDeckHeight(boat.x,boat.z)===deck.height,'registered deck is land at deck height');off();
 // Float and shadows stay off the hull; the cast clears the rail.
 const c=core.castPoint(boat,boat);assert(core.inOpenWater(c.x,c.z)&&!data.onBoatHull(c.x,c.z)&&c.distance>3,'boat cast lands in open water past the rail');
 assert(!core.inOpenWater(m.x,m.z),'the hull is not open water');
 // Catch table: 70-80% deep-sea creatures (internal weights, never shown), plus a few bait fish.
 const w=Object.entries(boat.weights),tot=w.reduce((a,[,v])=>a+v,0),deep=w.filter(([id])=>fishById(id).deepSea).reduce((a,[,v])=>a+v,0);
 assert(deep/tot>=.7&&deep/tot<=.8,`deep-sea share of the boat table ${(deep/tot).toFixed(3)}`);
 const rand=lcg(99);let hits=0;for(let i=0;i<10000;i++)if(fishById(core.rollCatch(boat,rand())).deepSea)hits++;assert(hits>=6800&&hits<=8200,`simulated deep-sea catches ${hits}/10000`);
 const own=FISH.filter(f=>cat.isExclusive(f)&&f.spots[0]==='deep-sea-boat');
 assert(own.length>=6&&own.every(f=>f.deepSea),'the boat has its own deep-sea specials');
 assert(fishById('ocean-sunfish').weight<cat.RARITY_WEIGHT.legendary,'the ocean sunfish is the rarest');
 // Old shore spots unchanged (snapshot taken before the boat was added: species count and total internal weight).
 const SNAP={'south-pier':[14,304.8],'west-pier':[16,281.2],'harbour-wall':[18,369.2],'north-rocks':[15,358.4],'west-cove':[18,269.2]};
 for(const [id,[n,sum]] of Object.entries(SNAP)){const s=cat.spotById(id),v=Object.values(s.weights);assert.equal(v.length,n,`${id}: same species`);assert(Math.abs(v.reduce((a,b)=>a+b,0)-sum)<1e-6,`${id}: same weights`);assert(!Object.keys(s.weights).some(k=>own.some(f=>f.id===k)),`${id}: no boat specials`);}
 // Each new species: complete content, a cited source, Fishbook art for its shape.
 const art=fs.readFileSync(path.join(ROOT,'components/FishArt.tsx'),'utf8');
 for(const f of own){assert(f.name&&f.plural&&f.club.name&&f.club.fact.length>40&&/^https:\/\/en\.wikipedia\.org\/wiki\//.test(f.club.source),`${f.id}: content and a Wikipedia source`);
  assert(['slim','round','squid'].includes(f.shape)||new RegExp(`case '${f.shape}'`).test(art),`${f.id}: has Fishbook art`);}
 // The catch card names the boat; the Fishbook separates shore spots from the boat.
 assert(/data-fish-where>Deep sea boat</.test(fs.readFileSync(path.join(ROOT,'components/FishingHost.tsx'),'utf8')),'catch card says "Deep sea boat"');
 // Heat: one merged boat mesh, no shadow casting, no timers or frame loops, built/dropped by distance, bob gated.
 const src=fs.readFileSync(path.join(ROOT,'lib/town/fishing/deepSeaBoat.ts'),'utf8');
 assert(/mergeGeometries\(parts\)/.test(src)&&(src.match(/new T\.Mesh\(/g)||[]).length===1,'the boat is one merged mesh');
 assert(/castShadow=false/.test(src)&&!/requestAnimationFrame|setInterval|setTimeout/.test(src),'no shadow draw, no timers');
 assert(/BUILD_RANGE=\d+,DROP_RANGE=\d+,BOB_RANGE=\d+/.test(src)&&/frustum\.intersectsSphere/.test(src),'lazy build, bob only near and on screen');}

// One fishing session per page, surviving hot updates (Sep 29 2026 root cause of "the fishing for the boat doesn't work":
// a re-run fishingStore made a second session, so the Fish button started one the island loop never stepped).
{const src=fs.readFileSync(path.join(ROOT,'lib/town/fishing/fishingStore.ts'),'utf8');
 assert(/__fi2Fishing/.test(src)&&/hot\.session\?\?=createFishingSession/.test(src),'the session singleton lives on globalThis');
 assert(e.fresh('lib/town/fishing/fishingStore.ts').fishingSession===fishingStore.fishingSession,'a hot-updated fishingStore reuses the same session');}
// ---- Portrait framing: head and float both clear the top HUD and bottom controls ----
{const T=require('three'),{createFishingCamera}=e.load('lib/town/fishing/fishingCamera.ts');
 for(const spot of FISH_SPOTS)for(const [width,height] of [[390,844],[375,667]]){
  const stand={x:spot.x,z:spot.z},floor=spot.boat?.floor??0,cast=core.castPoint(spot,stand),camera=new T.PerspectiveCamera(40,width/height,.1,1000),rig=createFishingCamera();rig.begin(stand,cast.dir,cast.distance,undefined,spot.camera);rig.apply(camera,.05,true);camera.updateMatrixWorld();
  const float=new T.Vector3(cast.x,-.35,cast.z).project(camera),head=new T.Vector3(stand.x,floor+1.6,stand.z).project(camera);
  assert(float.y>-.6&&float.y<.6,`${spot.id} float stays between HUD and controls at ${width}x${height}`);assert(Math.abs(float.x)<.8&&head.y<.65&&head.y>-.1,'angler and float are framed');
 }}

// ---- Heat: world props are merged/instanced and idle work is bounded ----
const world=fs.readFileSync(path.join(ROOT,'lib/town/fishing/fishingWorld.ts'),'utf8');
assert(/mergeGeometries\(all\)/.test(world)&&/InstancedMesh/.test(world),'posts merged, floats instanced');
assert(!/requestAnimationFrame|setInterval/.test(world),'world never schedules its own frames');
const visualsSrc=fs.readFileSync(path.join(ROOT,'lib/town/fishing/fishingVisuals.ts'),'utf8'),hud=fs.readFileSync(path.join(ROOT,'components/FishingHost.tsx'),'utf8');
assert(!/requestAnimationFrame|setInterval|setTimeout/.test(visualsSrc),'visuals never schedule their own frames');assert(!/requestAnimationFrame|setInterval/.test(hud),'no polling or loops in the HUD');
assert(!/stepSession|tapSession|rollCatch|landFish|islandMarket/.test(visualsSrc),'the visuals module holds no game logic');
assert(/visuals\.dispose\(\);visuals=null/.test(world)&&/nearAnySpot\(c\.x,c\.z,80\)/.test(world),'visuals are disposed once the player is far from every spot');
assert(!fs.existsSync(path.join(ROOT,'components/FishingPanel.tsx')),'no fishing modal: the flow is live in the island');
const hostCss=fs.readFileSync(path.join(ROOT,'components/FishingHost.module.css'),'utf8');assert(!/backdrop-filter/.test(hostCss),'no blur over the island canvas');
assert.equal(MARKET_STAND.z,35,'one stand: the CITRUS & FRUIT stall the jobs sale uses');

// ---- Species models (Oct 5 2026, "this example is not a shrimp"): every species has its own cached, merged model ----
{const models=e.load('lib/town/fishing/fishModels.ts'),tris=[];
 for(const f of FISH){assert(models.MODELLED_SPECIES.includes(f.id),`${f.id} has its own 3D model`);
  const m=models.speciesModel(f.id,f.shape,f.color);assert.equal(models.speciesModel(f.id,f.shape,f.color),m,`${f.id} model is cached`);
  const g=m.geometry;['position','normal','color','glow'].forEach(a=>assert(g.getAttribute(a),`${f.id} has ${a}`));
  g.computeBoundingBox();const bb=g.boundingBox;assert(bb.min.x>-.75&&bb.min.x<(f.group==="shellfish"?-.25:-.35)&&bb.max.x<.85,`${f.id} front near -0.5 (${bb.min.x.toFixed(2)}..${bb.max.x.toFixed(2)})`);
  assert(m.triangles>80&&m.triangles<2600,`${f.id} low-poly (${m.triangles} triangles)`);tris.push([f.id,m.triangles]);}
 assert(/name='fishing-held-fish'/.test(visualsSrc)&&!/fish-tail/.test(visualsSrc),'held and reeled catches are one mesh each (no per-part meshes)');
 const sorted=tris.map(t=>t[1]).sort((a,b)=>a-b);console.log(`species models: ${tris.length}, triangles min ${sorted[0]} median ${sorted[sorted.length>>1]} max ${sorted[sorted.length-1]} (${tris.find(t=>t[1]===sorted[sorted.length-1])[0]})`);}

for(const hz of [30,60,120]){const s=core.createSession();s.fish={id:'cod',size:40};s.phase='bite';core.tapSession(s);for(let i=0;i<hz*9;i++)core.stepSession(s,pier,1/hz,()=>.5,spawn);assert.notEqual(s.phase,'caught','idle reeling never awards a fish');assert(['escaped','floating'].includes(s.phase));}

console.log(`FISHING_PASS: ${FISH.length} species with cited club facts (${exclusives.length} spot specials), ${FISH_SPOTS.length} spots, weighted catches (commons first), rarity reel taps + pull-back, varied in-water approaches, live bite timing (nibbles, 0.7-1 s window, early = scared, late = escaped, idle reels in), Fishbook persists, sell one/all + soft cap pay the shared wallet`);
})().catch(err=>{console.error(err);process.exit(1);});
