// Signature species (owner decision, 6 Nov 2026: grow the Fishbook from 73 to 150 in three waves, ~4 own species per spot, every
// animal with a sourced football fact AND a 2-3 sentence kid-friendly story). Wave 1 = the first six shore spots in FISH_SPOTS
// order. Every total here is derived from the catalogue (never a hard-coded 73 / 97 / 150), so waves 2 and 3 only extend WAVES.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..');
const cache=new Map(),data=new Map();
const ctx=vm.createContext({console,Set,Map,Math,Date,JSON,Promise,Object,Array,Number,String,Error,URL,structuredClone,queueMicrotask,
 localStorage:{getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)},window:{addEventListener(){},removeEventListener(){}},
 Float32Array,Float64Array,Uint8Array,Uint16Array,Int32Array});
function load(name){const file=path.resolve(ROOT,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInContext('(function(exports,module,require){'+code+'\n})',ctx)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,g)=>g()}:id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):id.startsWith('@/')?load(id.slice(2)+'.ts'):require(id));
 cache.set(file,mod.exports);return mod.exports;}
let n=0;const ok=(c,m)=>{assert.ok(c,m);n++;};
const cat=load('lib/town/fishing/fishCatalog.ts'),O=load('lib/town/fishing/fishingOdds.ts'),core=load('lib/town/fishing/fishingCore.ts');
const LU=load('lib/town/fishing/lures.ts'),SIG=load('lib/town/fishing/shoreSignatures.ts'),{fishSellValue}=load('lib/economy.ts');
const {FISH,FISH_SPOTS,SHORE_SPOTS,fishById,isExclusive}=cat;

// ---- 1. One catalogue, no duplicates, counts derived from it
ok(new Set(FISH.map(f=>f.id)).size===FISH.length,'no duplicate ids');
ok(new Set(FISH.map(f=>f.name.toLowerCase())).size===FISH.length,'no duplicate names');
ok(new Set(FISH.map(f=>f.plural.toLowerCase())).size===FISH.length,'no duplicate plurals');
ok(FISH.length<=150+3,'the Fishbook grows to at most 150 species in the three waves, + the park pond\'s koi, perch and pike (Nov 13 2026)');
const ALL_SIG=[...SIG.SIGNATURE_FISH_WAVE1,...SIG.SIGNATURE_FISH_WAVE2,...SIG.SIGNATURE_FISH_WAVE3];
ok(ALL_SIG.every(f=>FISH.includes(f)),'waves 1, 2 and 3 are in FISH (market goods, Fishbook, SEO pages all read FISH)');
ok(!ALL_SIG.some(f=>load('lib/town/fishing/legendary.ts').LEGEND_FISH.some(l=>l.id===f.id)),'no clash with an Island Legend id');
{const BC=load('lib/town/beachcombing.ts'),G=load('lib/town/market/goods.ts');ok(ALL_SIG.every(f=>!BC.beachFindById(f.id)&&G.isGood(f.id)),'no signature id clashes with a beach find (living finds are never goods), and each one is a market good');}

// ---- 2. Wave 1: the first six SHORE spots in catalogue order, each with 4+ species of its own, an easy first catch and a goal
// Wave 2 (Nov 6 2026): the next six shore spots in catalogue order, the three causeway posts and the three Coral Cay beaches.
// Wave 3 (Nov 6 2026): Summit Isle's four shore spots (4 each) and, separately, the two deep-sea boats' shared specials (below).
const BOAT_IDS=cat.BOAT_SPOTS.map(s=>s.id),W3_BOAT=SIG.SIGNATURE_FISH_WAVE3.filter(f=>f.spots.every(id=>BOAT_IDS.includes(id))),W3_SHORE=SIG.SIGNATURE_FISH_WAVE3.filter(f=>!W3_BOAT.includes(f));
const WAVES=[{name:'wave 1',spots:SHORE_SPOTS.slice(0,6).map(s=>s.id),species:SIG.SIGNATURE_FISH_WAVE1},{name:'wave 2',spots:SHORE_SPOTS.slice(6,12).map(s=>s.id),species:SIG.SIGNATURE_FISH_WAVE2},{name:'wave 3',spots:SHORE_SPOTS.slice(12,16).map(s=>s.id),species:W3_SHORE}];
ok(JSON.stringify(WAVES[0].spots)===JSON.stringify(['south-pier','west-pier','harbour-wall','north-rocks','west-cove','east-pier']),'wave 1 = South Pier, Lifebuoy Point, Harbour Wall, North Beach Rocks, West Cove, East Jetty');
ok(JSON.stringify(WAVES[1].spots)===JSON.stringify(['causeway-gate','causeway-channel','turtle-bank','coral-garden','sharks-beach','farm-beach']),'wave 2 = the three causeway posts and the three Coral Cay beaches');
ok(JSON.stringify(WAVES[2].spots)===JSON.stringify(['summit-cove','summit-palm','summit-lookout','summit-ledge'])&&SHORE_SPOTS.filter(s=>!s.pond).length===16&&SHORE_SPOTS.at(-1).id==='park-pond','wave 3 = Summit Isle\'s four shore spots (every sea shore spot has a wave; the park pond, Nov 13 2026, has its own fresh-water three, pondFish.ts)');
// Wave 3's deep-sea specials: shared by BOTH boats (one deep table, tests/fishing.cjs), deep-sea creatures, explicit weights, common to rare.
ok(W3_BOAT.length>=8&&W3_BOAT.every(f=>JSON.stringify([...f.spots].sort())===JSON.stringify([...BOAT_IDS].sort())&&f.deepSea&&!f.when&&typeof f.weight==='number'&&f.weight>0&&cat.isDeepSeaSpecial(f)),`wave 3: ${W3_BOAT.length} deep-sea specials shared by both boats`);
ok(['common','uncommon','rare'].every(r=>W3_BOAT.some(f=>f.rarity===r))&&!W3_BOAT.some(f=>f.group==='shark'||f.rarity==='legendary'),'wave 3 boats: commons to rares, no new sharks or legendaries');
for(const f of W3_BOAT)for(const id of BOAT_IDS)ok(f.id in cat.spotById(id).weights,`${f.id}: in ${id}'s table`);
ok(new Set(ALL_SIG.map(f=>f.id)).size===ALL_SIG.length&&WAVES.every(w=>w.species.every(f=>!WAVES.some(v=>v!==w&&v.species.includes(f)))),'no species in two waves');
for(const w of WAVES){
 ok(w.species.every(f=>f.spots.length===1&&w.spots.includes(f.spots[0])),`${w.name}: every new species lives at exactly one of its spots`);
 for(const id of w.spots){const own=w.species.filter(f=>f.spots[0]===id),spot=cat.spotById(id);
  ok(own.length>=4,`${id}: ${own.length} signature species (4+)`);
  ok(own.some(f=>f.rarity==='common'&&!f.when),`${id}: an easy first catch (a day common of its own)`);
  ok(own.some(f=>f.rarity!=='common'),`${id}: a goal to chase (good, rare or legendary)`);
  ok(new Set(own.map(f=>f.rarity)).size>=2,`${id}: common to rare, not one tier`);
  for(const f of own)if(!f.when){ok(f.id in spot.weights,`${f.id}: in ${id}'s day table`);ok(typeof f.weight==='number'&&f.weight>0,`${f.id}: explicit internal weight`);}}
 ok(w.species.some(f=>f.when==='night')&&w.species.some(f=>f.when==='sunset'),`${w.name}: some night and sunset species`);}
// Spot tables still sum correctly: each weight is the species' own weight × the spot's factors, no stray entries.
for(const s of FISH_SPOTS){for(const [id,x] of Object.entries(s.weights)){const f=fishById(id);ok(f&&f.spots.includes(s.id)&&!f.when&&x>0,`${s.id}/${id}: a valid static entry`);
  const want=(f.weight??cat.RARITY_WEIGHT[f.rarity])*(s.shallowFactor&&!f.deepSea?s.shallowFactor:1)*(s.rarityBoost?.[f.rarity]??1);ok(Math.abs(want-x)<1e-9,`${s.id}/${id}: weight sums from its rarity / override`);}}

// ---- 3. Economy: prices in band (never by size), each wave-1 spot's mean catch within ±2.5 % of its pre-wave value, sharks stay hard
const BAND={common:[2,4],uncommon:[4,7],rare:[8,11],legendary:[12,18]};
for(const f of ALL_SIG){const [lo,hi]=BAND[f.rarity];ok(Number.isInteger(f.price)&&f.price>=lo&&f.price<=hi,`${f.id}: price ${f.price} in the ${f.rarity} band`);}
// Pre-wave day tables (6 Nov 2026, before wave 1): mean catch price and Rosa's mean sell value per spot.
const BEFORE={'south-pier':[3.605,2.219],'west-pier':[4.205,2.560],'harbour-wall':[3.963,2.458],'north-rocks':[3.458,2.090],'west-cove':[4.820,3.019],'east-pier':[4.048,2.425],
 // Pre-wave-2 (6 Nov 2026): the causeway and Coral Cay tables of shared species only.
 'causeway-gate':[3.814,2.246],'causeway-channel':[4.263,2.474],'turtle-bank':[3.750,2.182],'coral-garden':[3.874,2.302],'sharks-beach':[3.867,2.267],'farm-beach':[3.826,2.261],
 // Pre-wave-3 (6 Nov 2026): Summit Isle and the two deep-sea boats.
 'summit-cove':[2.992,1.722],'summit-palm':[4.000,2.000],'summit-lookout':[3.000,2.000],'summit-ledge':[4.216,2.459],'deep-sea-boat':[4.485,2.891],'deep-sea-boat-west':[4.485,2.891]};
for(const [id,[p0,v0]] of Object.entries(BEFORE)){const s=cat.spotById(id),p=O.meanPrice(s.weights),v=O.meanSellValue(s.weights);
 ok(Math.abs(p-p0)<=p0*.025,`${id}: mean catch ${p0} → ${p.toFixed(3)} (±2.5 %)`);ok(Math.abs(v-v0)<=v0*.025,`${id}: mean sell ${v0} → ${v.toFixed(3)} (±2.5 %)`);}
for(const f of ALL_SIG.filter(f=>f.group==='shark')){const s=cat.spotById(f.spots[0]),tot=Object.values(s.weights).reduce((a,b)=>a+b,0);
 // Wave 2's and 3's sharks are rare: never easier than the shared Little Shark (rare, weight 4), so sharks stay hard.
 if(f.when){ok(f.rarity==='rare'&&f.weight===undefined,`${f.id}: a ${f.when} shark is rare and only takes a resting shared rare's place at its time`);continue;}
 const share=s.weights[f.id]/tot;ok(f.rarity==='legendary'?share<.003:f.rarity==='rare'&&f.weight<=cat.RARITY_WEIGHT.rare&&share<.015,`${f.id}: a shark is hard to meet (${f.rarity}, ${(share*100).toFixed(2)} % a cast)`);}
// Adding species only grows each table, so every legendary shark is as hard or harder to meet than before (tests/fishing-sell-pity.cjs).
ok(ALL_SIG.every(f=>fishSellValue(f)>=1),'every new species sells');

// ---- 4. Reachable: in a day table or swapped in at its time somewhere, and no lure ever removes an animal
for(const f of FISH){const day=FISH_SPOTS.some(s=>f.id in s.weights),timed=!!f.when&&O.timeSpotsFor(f.id).length>0;ok(day||timed,`${f.id}: reachable (day table or at its time)`);}
for(const f of ALL_SIG.filter(f=>f.when)){const at=O.timeSpotsFor(f.id);ok(at.length===1&&at[0]===f.spots[0],`${f.id}: comes out at ${f.spots[0]} at ${f.when}`);}
for(const s of FISH_SPOTS)for(const time of ['day','sunset','night'])for(const l of [null,...LU.LURES.map(x=>x.id)]){
 const base=O.catchWeights(s,0,{time,lure:null,legends:[]}),w=O.catchWeights(s,0,{time,lure:l,legends:[]});
 for(const id of Object.keys(base))if(base[id]>0)ok(w[id]>0,`${s.id} ${time}/${l}: ${id} still swims`);}

// ---- 5. Content: every species has a sourced fact AND a 2-3 sentence story, kid-safe; the sources list is in the docs
const SCARY=/\b(kill\w*|dead|death|die[sd]?|dying|blood\w*|attack\w*|scar(y|ier|iest)|terrif\w*|deadly|danger\w*|monsters?|jaws|horror|fear\w*|eaten alive|man-eat\w*|vicious|savage|bite[sd]? (you|people|kids))\b/i;
const sentences=t=>t.replace(/\b(?:[A-Z]\.){1,3}|\bSt\./g,'X').split(/(?<=[.!?])\s+(?=[A-Z"“])/).filter(Boolean);
const doc=fs.readFileSync(path.join(ROOT,'docs/fishing-content-sources.md'),'utf8');
for(const f of FISH){
 ok(typeof f.club.fact==='string'&&f.club.fact.length>30&&f.club.fact.length<=230,`${f.id}: a one-line fact`);
 ok(/^https:\/\//.test(f.club.source)&&(f.club.sources??[]).every(u=>/^https:\/\//.test(u)),`${f.id}: a cited source`);
 ok(typeof f.story==='string'&&f.story.length>=60&&f.story.length<=320,`${f.id}: a story (${f.story?.length} chars)`);
 const k=sentences(f.story??'').length;ok(k>=2&&k<=3,`${f.id}: 2-3 sentences (${k})`);
 ok(!SCARY.test(f.story??''),`${f.id}: story is never scary`);
 ok(!/https?:|www\./.test(f.story??''),`${f.id}: no links in the story`);
 ok(!/\d+(\.\d+)?\s?%|\bodds\b|\bchance\b|\bprobab/i.test(f.story??''),`${f.id}: no odds in the story`);}
// ---- 5b. The football link is enforced (owner review, 6 Nov 2026): a dish, a place name, a port or a national fish is NOT a
// football fact. Every Fishbook species names a real football entity word for word in its fact, with a source URL; when no club,
// team, mascot or player is tied to the animal, the fact is split and labelled "Fun fish fact: … Football: …".
const KINDS=cat.FOOTBALL_ENTITY_KINDS;
ok(JSON.stringify([...KINDS])===JSON.stringify(['club','national-team','stadium','mascot','player','tournament','chant','federation']),'football entity kinds: club | national-team | stadium | mascot | player | tournament | chant | federation');
for(const f of FISH){const e=f.club.entity;
 ok(e&&KINDS.includes(e.kind),`${f.id}: a football entity kind (${e?.kind})`);
 ok(e&&typeof e.name==='string'&&e.name.trim().length>=3,`${f.id}: a named football entity`);
 ok(e&&f.club.fact.includes(e.name),`${f.id}: the fact names its football entity "${e?.name}"`);
 ok(typeof f.club.source==='string'&&f.club.source.length>12,`${f.id}: a source URL for the football fact`);
 const fun=f.club.link==='Fun fish fact';
 ok(fun===/^Fun fish fact: /.test(f.club.fact),`${f.id}: "Fun fish fact:" label matches its link kind`);
 if(fun){const i=f.club.fact.indexOf(' Football: ');ok(i>15&&f.club.fact.indexOf(e.name,i)>i,`${f.id}: a fun fish fact keeps a real "Football:" half that names ${e.name}`);}}
for(const f of [...ALL_SIG]){
 ok(!['Port city'].includes(f.club.link),`${f.id}: a port alone is not a football link`);
 if(f.club.link!=='Fun fish fact')ok(!/\bnational (dish|fish)\b|\bfamous dish\b|\bis named after\b/i.test(f.club.fact),`${f.id}: a dish / place name / national fish is labelled a fun fish fact, never the football link`);}
{const src=fs.readFileSync(path.join(ROOT,'components/Fishbook.tsx'),'utf8'),page=fs.readFileSync(path.join(ROOT,'app/(site)/fish/[id]/page.tsx'),'utf8'),host=fs.readFileSync(path.join(ROOT,'components/FishingHost.tsx'),'utf8');
 ok([src,page,host].every(t=>/'Fun fish fact'\?'Fun fish fact \+ real football fact'/.test(t)),'Fishbook, fish page and catch card label a fun fish fact as such');}

for(const f of ALL_SIG){ok(doc.includes(`\`${f.id}\``)&&[f.club.source,...(f.club.sources??[])].every(u=>doc.includes(u)),`${f.id}: listed with every source URL in docs/fishing-content-sources.md`);}
ok(/^## Wave 2\b/m.test(doc)&&/^## Checked and cut \(wave 2\)/m.test(doc),'the sources doc has the wave-2 table and its cut list');
ok(/^## Wave 3\b/m.test(doc)&&/^## Checked and cut \(wave 3\)/m.test(doc),'the sources doc has the wave-3 table and its cut list');
// Wave 2: a STRONG link is the animal itself (a player's or club's nickname, a mascot); everything else is a labelled fun fish fact.
{const w3=SIG.SIGNATURE_FISH_WAVE3,strong=w3.filter(f=>f.club.link!=='Fun fish fact');ok(strong.every(f=>['Nickname','Mascot','Crest','Club name','Fan culture'].includes(f.club.link)),`wave 3: ${strong.length} strong link(s), ${w3.length-strong.length} labelled fun fish facts`);}
{const w2=SIG.SIGNATURE_FISH_WAVE2,strong=w2.filter(f=>f.club.link!=='Fun fish fact');ok(strong.length>0&&strong.every(f=>['Nickname','Mascot','Crest','Club name','Fan culture'].includes(f.club.link)&&['club','player','mascot','national-team'].includes(f.club.entity.kind)),`wave 2: ${strong.length} strong links (nickname / mascot), ${w2.length-strong.length} labelled fun fish facts`);}

// ---- 6. Fishbook totals and old saves
{const LEG=load('lib/town/fishing/legendary.ts');
 const old=Object.fromEntries(FISH.filter(f=>!ALL_SIG.includes(f)).map(f=>[f.id,{count:2,biggest:f.size[1],first:1,last:2}]));
 ok(Object.keys(old).length===FISH.length-ALL_SIG.length,'an old save holds every pre-wave species');
 const book=core.sanitizeFishbook({version:1,species:old,total:Object.keys(old).length*2});
 ok(core.speciesCaught(book)===Object.keys(old).length,`an old save still loads with all ${Object.keys(old).length} species caught`);
 ok(ALL_SIG.every(f=>!book.species[f.id]),'the new species start at 0 (silhouettes) in an old save');
 const withLegend=core.sanitizeFishbook({version:1,species:{...old,[LEG.LEGEND_FISH[0].id]:{count:1,biggest:100,first:1,last:1}},total:1});
 ok(core.speciesCaught(withLegend)<=FISH.length&&core.speciesCaught(withLegend)===Object.keys(old).length,'an Island Legend never adds a stray +1 to the species count');}
// The Fishbook's pages cover every species exactly once (the partition Fishbook.tsx SECTIONS uses).
{const shared=FISH.filter(f=>!f.when&&!isExclusive(f)&&!cat.isDeepSeaSpecial(f)),night=FISH.filter(f=>!!f.when&&!isExclusive(f)),own=FISH.filter(isExclusive),deep=FISH.filter(cat.isDeepSeaSpecial);
 const all=[...shared,...night,...own,...deep];ok(all.length===FISH.length&&new Set(all.map(f=>f.id)).size===FISH.length,'every species is on exactly one Fishbook page');
 const src=fs.readFileSync(path.join(ROOT,'components/Fishbook.tsx'),'utf8');
 ok(src.includes("fish:FISH.filter(f=>!!f.when&&!isExclusive(f))")&&src.includes("fish:FISH.filter(f=>isExclusive(f)&&f.spots[0]===s.id)"),'Fishbook.tsx uses the same partition');
 ok(/caught here/.test(src)&&/data-fish-story/.test(src)&&/>\?\?\?</.test(src)&&/Found at/.test(src),'Fishbook: "N of M caught here", the story, ??? silhouettes with a where hint');
 const host=fs.readFileSync(path.join(ROOT,'components/FishingHost.tsx'),'utf8');
 ok(/data-fish-story/.test(host)&&/data-fishbook-count/.test(host)&&/\{caught\}\/\{FISH\.length\}/.test(host),'catch card story and the X/N Fishbook count on the Fishbook button');
 const page=fs.readFileSync(path.join(ROOT,'app/(site)/fish/[id]/page.tsx'),'utf8');ok(/f\.story/.test(page)&&/Fish tale/.test(page),'the public fish pages show the story');}

console.log(`FISHING_SIGNATURES_PASS: ${n} checks (${FISH.length} species; ${WAVES.map(w=>`${w.name} +${w.species.length} at ${w.spots.length} spots`).join(', ')}, wave 3 boats +${W3_BOAT.length})`);
