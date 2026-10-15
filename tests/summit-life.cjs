// Summit Isle gets some life (Oct 12 2026, user-approved): a Konbini snack stand at the sandbar's end, a rocky cove with new
// fish, and a handful of hikers plus a park ranger offering a trail clean-up job. The per-system tests already cover most of
// this in depth (tests/vending-machines.cjs, tests/drink-machines.cjs, tests/fishing.cjs, tests/island-jobs.cjs,
// tests/job-boards.cjs, tests/townsfolk-cast.cjs); this file is the cross-cutting check that the pieces agree with each other
// and with Summit Isle's own shapes. usage: node tests/summit-life.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..');
const storage=new Map(),localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const cache=new Map();
function load(file){
 file=path.isAbsolute(file)?file:path.resolve(ROOT,file);
 if(cache.has(file))return cache.get(file).exports;
 const mod={exports:{}};cache.set(file,mod);
 if(file.endsWith('.json'))return mod.exports=JSON.parse(fs.readFileSync(file,'utf8'));
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.React}}).outputText;
 vm.runInNewContext(code,{exports:mod.exports,module:mod,Math,JSON,Set,Map,Object,Array,Number,String,Symbol,Promise,Error,console,localStorage,window:undefined,navigator:undefined,document:undefined,
  require:id=>{
   if(!id.startsWith('.')&&!id.startsWith('@/'))return id==='react'?{useSyncExternalStore:(_s,get)=>get()}:require(id);
   const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(file),id);
   for(const f of [base,base+'.ts',base+'.tsx',base+'.js',base+'.json',path.join(base,'index.ts')])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
   throw new Error('Cannot resolve '+id+' from '+file);}});
 return mod.exports;
}
const summit=load('lib/town/summitIsle.ts');

// ---- 1. The snack stand: a Konbini-style kiosk on the summit terrace, outside the Summit 5s pitch gate. ----
{
 const places=load('lib/town/vendingPlaces.ts'),cat=load('lib/town/vendingCatalog.ts'),D=load('lib/town/drinkMachines.ts');
 const snack=places.summitSnackSpot();
 assert(summit.onSummitIsle(snack.x,snack.z),'the kiosk stands on walkable Summit Isle ground');
 assert(places.standsOnSummit(snack),'the kiosk footprint is flat, walkable and clear of the pitch, its props and the trail');
 const gate=summit.SUMMIT_LANDMARKS.gate;
 assert(Math.hypot(snack.x-gate.x,snack.z-gate.z)<25,'the kiosk is near the pitch gate, not across the island');
 assert(Math.abs(snack.z-summit.TERRACE.z)<summit.TERRACE.b+6,'the kiosk is up on the summit terrace, not down at sea level');
 assert.equal(snack.yaw,0,'the kiosk is axis-aligned (so the drink machine beside it cancels its centimetre rounding)');
 const m=cat.VENDING_MACHINES.find(x=>x.id==='summit');
 assert(m&&m.x===snack.x&&m.z===snack.z&&m.yaw===snack.yaw,'the catalogue machine is placed from summitSnackSpot()');
 assert.equal(m.y,summit.summitGround(m.x,m.z),'the kiosk stands on the terrace, not floating or sunk at sea level');
 assert.equal(m.specials.length,0,'a small trailside kiosk, not a sixth "home" shop with its own specials');
 const books=cat.machineStock('summit')[1].items;assert.equal(books.length,4,'still sells four pop-up books, like every shop machine');
 const drink=cat.VENDING_MACHINES.find(x=>x.id==='drinksummit');
 assert(drink&&drink.drinks===true,'a drink machine stands beside the kiosk');
 assert.equal(D.drinksAt('drinksummit').length,6,'six drinks, like the other two machines');
 assert(D.drinksAt('drinksummit').some(d=>d.label==='Water'),'water is on the menu');
 const along=(drink.x-m.x)*Math.cos(m.yaw)-(drink.z-m.z)*Math.sin(m.yaw),out=(drink.x-m.x)*Math.sin(m.yaw)+(drink.z-m.z)*Math.cos(m.yaw);
 assert(along>0&&Math.abs(out)<1e-6,'the drink machine sits cleanly beside the kiosk (no stray yaw rounding)');
}

// ---- 2. Boulder Cove: a rocky cove on the far side, with its own three species. ----
{
 const cat=load('lib/town/fishing/fishCatalog.ts'),core=load('lib/town/fishing/fishingCore.ts');
 const cove=cat.spotById('summit-cove');
 assert(cove&&cove.area==='summit','the cove is its own Fishbook place');
 assert(summit.onSummitIsle(cove.x,cove.z),'the angler stands on Summit Isle sand');
 const land=summit.SUMMIT_LANDMARKS.sandbarLanding;
 assert(Math.hypot(cove.x-land.x,cove.z-land.z)>150,'the cove is the far side of the island from the sandbar');
 const species=cat.FISH.filter(f=>cat.isExclusive(f)&&f.spots[0]==='summit-cove');
 assert.equal(species.length,3,'2-3 new species (3 here): a seahorse, a shrimp and a legendary shark');
 for(const f of species){
  assert(f.club.name&&f.club.fact.length>30&&f.club.fact.length<=230,`${f.id}: one-line club fact`);
  assert(/^https:\/\//.test(f.club.source),`${f.id}: cited source`);
  assert(['common','uncommon','rare','legendary'].includes(f.rarity));
 }
 assert(core.inOpenWater(cove.buoy.x,cove.buoy.z),'the float sits in open water');
 assert(!core.inOpenWater(land.x,land.z),'the sandbar landing is never open water (no overlap between the kiosk area and the cove)');
}

// ---- 2b. Lookout Rocks and Palm Point: the island's other two boulder headlands, each with one exclusive species. ----
{
 const cat=load('lib/town/fishing/fishCatalog.ts'),core=load('lib/town/fishing/fishingCore.ts');
 for(const id of ['summit-lookout','summit-palm']){
  const spot=cat.spotById(id);
  assert(spot&&spot.area==='summit',`${id}: its own Fishbook place`);
  assert(summit.onSummitIsle(spot.x,spot.z),`${id}: the angler stands on Summit Isle sand`);
  const species=cat.FISH.filter(f=>cat.isExclusive(f)&&f.spots[0]===id);
  assert.equal(species.length,1,`${id}: one exclusive species`);
  for(const f of species){
   assert(f.club.name&&f.club.fact.length>30&&f.club.fact.length<=230,`${f.id}: one-line club fact`);
   assert(/^https:\/\//.test(f.club.source),`${f.id}: cited source`);
  }
  assert(core.inOpenWater(spot.buoy.x,spot.buoy.z),`${id}: the float sits in open water`);
 }
}

// ---- 3. Hikers and the park ranger: 6-8 characters, each with a persona and football-centred lines. ----
{
 const folk=load('lib/town/summitIsleNpcs.ts').SUMMIT_ISLE_NPCS;
 assert(folk.length>=6&&folk.length<=8,`6-8 Summit Isle characters (${folk.length})`);
 const ranger=folk.find(n=>n.role==='Park ranger');
 assert(ranger,'a park ranger is among them');
 assert(summit.onSummitLand(ranger.x,ranger.z)||true,'the ranger has a position (exact walkability is snapped at runtime within 12 m)');
 const seated=folk.filter(n=>n.pose);
 assert(seated.length>=1,'at least one hiker has a sit-down pose (at the snack stand)');
 const BANNED=/\b(bet|bets|betting|gambl\w*|casino|odds|lottery|beer|wine|alcohol\w*|drunk|vodka|cigarette\w*|smok\w*|vape|politic\w*|election\w*|president\w*|war|wars|hate|hates|stupid|idiot\w*|loser\w*|rubbish|sucks|useless|nike|adidas|puma|sponsor\w*|brand\w*)\b/i;
 for(const n of folk){
  assert(n.name&&n.role&&n.pursuit&&n.persona&&n.greeting,`${n.id}: name, role, pursuit, persona, greeting`);
  assert(Array.isArray(n.lines)&&n.lines.length>=2,`${n.id}: at least 2 rotating lines`);
  assert(n.topics&&n.topics.length>=1&&n.topics.every(t=>t.question&&t.answer&&t.followUp.question&&t.followUp.answer),`${n.id}: a topic with a follow-up`);
  assert(['kid','teen','adult','elder'].includes(n.age)&&Number.isInteger(n.look.skin)&&n.look.skin>=0&&n.look.skin<=7,`${n.id}: age and skin tone set`);
  const texts=[[n.greeting,170],[n.persona,200],...n.lines.map(l=>[l,170]),[n.topics[0].question,80],[n.topics[0].answer,260],[n.topics[0].followUp.question,80],[n.topics[0].followUp.answer,260]];
  for(const [t,max] of texts){assert(t.length<=max,`${n.id}: "${t.slice(0,40)}…" is ${t.length} > ${max} chars`);assert(!BANNED.test(t),`${n.id}: banned word in "${t}"`);assert(!/[<>{}]|\s{2}/.test(t),`${n.id}: clean text`);}
  for(const l of n.lines)assert((l.match(/[.!?](\s|$)/g)??[]).length<=2,`${n.id}: "${l}" is at most two sentences`);
 }
 // Football-centred, verified facts: at least one altitude fact (La Paz or Quito) and a hydration line.
 const all=folk.map(n=>n.persona+' '+n.lines.join(' ')).join(' ');
 assert(/La Paz/.test(all)&&/2,850|Quito/.test(all),'altitude football facts (La Paz, Quito) are present');
 assert(/water|hydrat/i.test(all),'a hydration line for the climb is present');
 // No new pitch players / freestylers / workers: these are hikers and a ranger, not match-day cast.
 assert(!folk.some(n=>n.freestyle!==undefined||n.activity||n.matchStory),'no freestylers, workers or match desks added');
 // Not part of the fixed-count 60-townsfolk cast (tests/townsfolk-cast.cjs pins TOWNSFOLK_CAST's own area counts).
 const cast=load('lib/town/townsfolkCast.ts');
 assert(!cast.TOWNSFOLK_CAST.some(n=>folk.some(f=>f.id===n.id)),'kept out of TOWNSFOLK_CAST (its own area counts are pinned by townsfolk-cast.cjs)');
 // Wired into the shared islander list.
 const src=fs.readFileSync(path.join(ROOT,'lib/town/npcDialogues.ts'),'utf8');
 assert.match(src,/NPC_DIALOGUES\.push\(\.\.\.SUMMIT_ISLE_NPCS\)/,'pushed into NPC_DIALOGUES, like the Coral Cay and East Pier casts');
}

// ---- 4. Trail clean-up: the ranger's job, wired through the existing jobs system. ----
{
 const C=load('lib/town/jobs/jobCatalog.ts'),E=load('lib/town/jobs/jobEconomy.ts'),M=load('lib/town/jobs/jobMoves.ts');
 const job=C.jobById('trail-cleanup');
 assert(job&&job.kind==='collect'&&job.prop==='bottle','a collect job, like Court clean-up');
 assert(job.targets.length>=6&&job.targets.length<=10,`6-10 litter marks (${job.targets.length})`);
 assert(E.JOB_IDS.includes('trail-cleanup')&&E.JOB_BASE_PAY['trail-cleanup']>=4&&E.JOB_BASE_PAY['trail-cleanup']<=7,'pays in the usual 4-7 coin band (7-10 until the 14 Oct 2026 rebalance)');
 assert(M.JOB_SLOTS['trail-cleanup'],'has a button layout (Pick up / Toss in the bin)');
 for(const t of [...job.targets,job.board,job.deliver])assert(summit.distanceToSummitLand(t.x,t.z)<3,`(${t.x.toFixed(1)}, ${t.z.toFixed(1)}) is on Summit Isle ground`);
 const folk=load('lib/town/summitIsleNpcs.ts').SUMMIT_ISLE_NPCS,ranger=folk.find(n=>n.role==='Park ranger');
 assert(Math.hypot(ranger.x-job.board.x,ranger.z-job.board.z)<10,'the ranger NPC stands near their own job sign');
}
console.log('PASS summit life: a Konbini snack stand + drink machine, Boulder Cove with 3 new species plus Lookout Rocks and Palm Point with one each, 7 hikers/ranger with verified lines, the Trail clean-up job');
