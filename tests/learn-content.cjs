// The /learn marketing hub's copy (Nov 2 2026, lib/site/learnFeatures.ts + docs/learn-page-content.md). Checks:
//  1. shape: 5-7 groups; every feature has every field, title <= 28, hook <= 70, a two-sentence description, a valid group,
//     unique ids and imageKeys (snake_case), steps with a line and a unique imageKey each; 8+ parent FAQs and 2+ Play together FAQs;
//     the hero has a headline, subhead and exactly 3 trust points;
//  2. tone: no banned hype words and no emoji anywhere in the copy;
//  3. truth: every number in a proof line is declared in `counts`, and every count equals the value computed here from the
//     game's own data (lessons, Fishbook, cards, museum, NPCs, arcade, relay constants …), so the copy fails when the game changes;
//  4. nothing paused or removed is promoted (cave game, underground world, the old 2D arcade games);
//  5. the /learn "Fuel up" chapter (Nov 3 2026) claims only what the game does (docs/learn-konbini-facts.md): Konbini food and
//     drinks refill fuel, every item has a football-nutrition note, water comes first, the notes cite sources, walking always works.
// usage: node tests/learn-content.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');

// ---- loader: the REAL modules, TypeScript transpiled into a vm (same as tests/seo-pages.cjs) --------------------------------
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const mod={exports:{}};cache.set(file,mod);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.React}}).outputText;
 vm.runInNewContext(out,{Math,JSON,Set,Map,Object,Array,Number,String,Symbol,Promise,Error,RegExp,Date,Boolean,Infinity,NaN,isFinite,console,URL,URLSearchParams,
  setTimeout,clearTimeout,process:{env:{NODE_ENV:'production'},cwd:()=>root},exports:mod.exports,module:mod,require:id=>{
  if(id==='next/navigation')return {notFound:()=>{throw new Error('NEXT_NOT_FOUND');}};
  if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
  const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
  for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
  throw new Error('Cannot resolve '+id+' from '+file);}});
 return mod.exports;
}
const L=rel=>load(path.join(root,rel));
const {LEARN_FEATURES:F,LEARN_GROUPS:G,LEARN_FAQ:Q,LEARN_HERO:H,LEARN_TOGETHER_TRUST:TT,LEARN_TOGETHER_NOT:TN}=L('lib/site/learnFeatures.ts');

// ---- 1. shape -----------------------------------------------------------------------------------------------------------------
assert.ok(G.length>=5&&G.length<=7,`5-7 groups (${G.length})`);
const groupIds=new Set(G.map(g=>g.id));assert.equal(groupIds.size,G.length,'group ids are unique');
for(const g of G)assert.ok(g.title&&g.blurb,`group ${g.id} has a title and blurb`);
const sentences=s=>s.trim().split(/(?<=[.!?])\s+/).filter(Boolean);
const ids=new Set(),keys=new Set(),SNAKE=/^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
for(const f of F){
 for(const k of ['id','title','hook','description','footballTie','where','proof','group','imageKey'])assert.ok(typeof f[k]==='string'&&f[k].trim(),`${f.id}: ${k} is set`);
 assert.ok(f.title.length<=28,`${f.id}: title <= 28 (${f.title.length})`);
 assert.ok(f.hook.length<=70,`${f.id}: hook <= 70 (${f.hook.length})`);
 assert.equal(sentences(f.description).length,2,`${f.id}: description is two sentences`);
 assert.match(f.description,/[.!?]$/,`${f.id}: description ends a sentence`);
 assert.ok(groupIds.has(f.group),`${f.id}: group ${f.group} exists`);
 assert.ok(!ids.has(f.id),`${f.id}: id is unique`);ids.add(f.id);
 assert.match(f.imageKey,SNAKE,`${f.id}: imageKey is snake_case`);
 assert.ok(!keys.has(f.imageKey),`${f.id}: imageKey ${f.imageKey} is unique`);keys.add(f.imageKey);
 for(const s of f.steps??[]){assert.ok(s.line&&s.line.length<=100,`${f.id}: step line set, <= 100`);assert.match(s.imageKey,SNAKE);
  assert.ok(!keys.has(s.imageKey),`step imageKey ${s.imageKey} is unique`);keys.add(s.imageKey);}
}
for(const g of G)assert.ok(F.some(f=>f.group===g.id),`group ${g.id} has a feature`);
assert.ok(F.filter(f=>f.group==='together').length>=4,'Play together has several features');
const steps=F.flatMap(f=>f.steps??[]);assert.equal(steps.length,3,'one 3-step "play with a friend" sequence');
const parentsFaq=Q.filter(q=>q.group==='parents'),togetherFaq=Q.filter(q=>q.group==='together');
assert.ok(parentsFaq.length>=8&&parentsFaq.length<=10,`8-10 parent FAQs (${parentsFaq.length})`);
assert.ok(togetherFaq.length>=2&&togetherFaq.length<=3,`2-3 Play together FAQs (${togetherFaq.length})`);
for(const q of Q)assert.ok(q.q.endsWith('?')&&q.a.length>20,`FAQ "${q.q}" is a question with an answer`);
assert.ok(H.headline&&H.subhead&&H.trust.length===3,'hero: headline, subhead and 3 trust points');
assert.ok(TT.length>=3&&TN.length>=3,'Play together trust points and what it does not have');

// ---- 2. tone ------------------------------------------------------------------------------------------------------------------
const ALL=[...F.flatMap(f=>[f.title,f.hook,f.description,f.footballTie,f.where,f.proof,...(f.steps??[]).map(s=>s.line)]),
 ...G.flatMap(g=>[g.title,g.blurb]),...Q.flatMap(q=>[q.q,q.a]),H.headline,H.subhead,...H.trust,H.cta,...TT,...TN];
const BANNED=/\b(amazing|awesome|incredible|revolutionary|ultimate|epic|game[- ]chang\w*|unleash\w*|world[- ]class|cutting[- ]edge|seamless\w*|magical|insane|unbelievable|best[- ]in[- ]class|perfect|guarantee\w*|mind[- ]blowing|next[- ]level|supercharge\w*|unlock your|state[- ]of[- ]the[- ]art|limitless|endless fun|super fun)\b/i;
for(const s of ALL){assert.ok(!BANNED.test(s),`no hype word: "${s}"`);assert.ok(!/\p{Extended_Pictographic}/u.test(s),`no emoji: "${s}"`);}

// ---- 3. truth: every proof number is declared and matches the data -----------------------------------------------------------
const lessons=L('lib/site/lessons.ts'),fish=L('lib/site/fish.ts').SITE_FISH,cards=L('lib/site/cards.ts').SITE_CARDS,ex=L('lib/site/exhibits.ts');
const paths=JSON.parse(fs.readFileSync(path.join(root,'lib/paths/formatPaths.json'),'utf8'));
const starter=[...new Set(paths.map(p=>p.chapters.reduce((s,c)=>s+c.lessons.length,0)))];
assert.equal(starter.length,1,'every path has the same number of starter lessons');
const storyIds=[...L('lib/paths/stories.ts').STORY_CARDS.map(s=>s.id),...Object.values(L('lib/paths/upcomingStories.ts').UPCOMING_STORIES).flat().map(s=>s.id)];
for(const id of storyIds)assert.ok(fs.existsSync(path.join(root,'lib/paths/riso/stories',id+'.ts')),`story film ${id} exists`);
const NPCS=L('lib/town/npcDialogues.ts').NPC_DIALOGUES,FRESH=L('lib/town/npcFresh.ts').FRESH;
const npcChallenges=NPCS.reduce((s,n)=>s+((FRESH.byNpc[n.id]||{}).challenges||[]).length,0)+Object.values(FRESH.byArea).reduce((s,a)=>s+(a.challenges||[]).length,0);
const drinks=L('lib/town/drinkMachines.ts').DRINK_MACHINE_IDS;
const books=Object.keys(L('lib/books/catalog.ts').PLAYER_BOOKS);
const voiced=fs.readdirSync(path.join(root,'public/voice/books'));for(const b of books)assert.ok(voiced.includes(b),`book ${b} is narrated`);
const coin=L('lib/town/coinQuest.ts'),hunt=L('lib/town/ballHuntLessons.ts'),proto=L('multiplayer/protocol/types.ts');
for(const s of coin.COIN_QUEST)assert.ok(hunt.BALL_HUNT_LESSONS[s.id],`hidden ball ${s.id} has a mini lesson`);
const hs=L('lib/town/emoteHandshakes.ts');
const COMPUTED={
 lessons:lessons.LESSONS.length,quizQuestions:lessons.LESSONS.reduce((s,l)=>s+l.questions.length,0),formats:lessons.FORMAT_ORDER.length,
 starterLessonsPerPath:starter[0],stories:storyIds.length,
 hiddenBalls:coin.COIN_QUEST.length,exploreBalls:Object.keys(hunt.DIVE_BALL_LESSONS).length,
 fish:fish.length,legendaryFish:fish.filter(f=>f.rarity==='legendary').length,
 bugs:L('lib/town/jobs/bugSpecies.ts').BUG_SPECIES.length,beachFinds:L('lib/town/beachcombing.ts').BEACH_FINDS.length,
 exhibits:ex.SITE_EXHIBITS.length,galleries:ex.GALLERIES.length,magazines:L('lib/konbini/konbiniContent.ts').MAGAZINES.length,
 npcs:NPCS.length,npcChallenges,bubblesAtOnce:L('lib/town/npcChatter.ts').CHATTER.MAX,newsLeagues:Object.keys(L('lib/town/newsLeagues.ts').NEWS_LEAGUES).length,
 arcadeGames:L('lib/arcade/arcadeCatalog.ts').arcadeCabinets.length,
 passPuzzles:L('lib/passPuzzle/catalog.ts').ALL_SCENARIOS.length,passPuzzlePacks:L('lib/passPuzzle/catalog.ts').ALL_PACKS.length,
 jobs:L('lib/town/jobs/jobCatalog.ts').JOBS.length,rideTypes:L('lib/town/rideUnlocks.ts').RIDE_CATEGORIES.length,
 animalRides:Object.keys(L('lib/town/water/animalRides.ts').RIDE_PROMPT_LABEL).length,
 cards:cards.length,coachCards:cards.filter(c=>c.coach).length,books:books.length,
 vendingMachines:L('lib/town/vendingCatalog.ts').VENDING_MACHINES.filter(m=>!drinks.includes(m.id)).length,
 costumes:L('lib/town/costumes.ts').CLUB_COSTUMES.length,ballsPerCostumeMilestone:coin.BALLS_PER_COSTUME_MILESTONE,costumesPerMilestone:coin.COSTUMES_PER_MILESTONE,
 shopStudios:L('lib/shop/shopLayout.ts').SHOP_STATIONS.length,
 emotes:L('lib/town/emoteReact.ts').LOCAL_EMOTES.length,handshakes:hs.HANDSHAKES.length,highFives:hs.HIGH_FIVE_SEQS.length,
 partyMax:proto.PARTY_MAX,codeHours:proto.CODE_TTL_MS/3600000,codeLength:proto.CODE_LENGTH,nameMaxLetters:L('multiplayer/protocol/names.ts').NICK_MAX,
 practices:L('lib/grownups/practice.ts').PRACTICES.length,
};
for(const [k,v] of Object.entries(COMPUTED))assert.ok(Number.isFinite(v)&&v>0,`computed ${k} is a positive number (${v})`);
const numbersIn=s=>(s.match(/\d+/g)??[]).map(Number);
for(const f of F){
 const c=f.counts??{};
 for(const [k,v] of Object.entries(c)){assert.ok(k in COMPUTED,`${f.id}: count ${k} has a computation`);assert.equal(v,COMPUTED[k],`${f.id}: ${k} is ${COMPUTED[k]} in the data, copy says ${v}`);}
 const declared=new Set(Object.values(c));
 for(const n of numbersIn(f.proof))assert.ok(declared.has(n),`${f.id}: proof number ${n} is declared in counts`);
 for(const v of declared)assert.ok(numbersIn(f.proof).includes(v),`${f.id}: count ${v} appears in the proof`);
}
// The few numbers in hero / FAQ / step copy come from the same data.
const FIXED=new Set([7,12,COMPUTED.partyMax,COMPUTED.codeHours,COMPUTED.codeLength]); // 7 to 12 = the audience ages (lib/site/seo.ts KIDS_AUDIENCE)
const seo=L('lib/site/seo.ts');assert.equal(seo.KIDS_AUDIENCE.suggestedMinAge,7);assert.equal(seo.KIDS_AUDIENCE.suggestedMaxAge,12);
for(const s of [H.subhead,...H.trust,...Q.flatMap(q=>[q.q,q.a]),...steps.map(s=>s.line),...TT,...TN])
 for(const n of numbersIn(s.replace(/\b(7v7|9v9|11v11)\b/g,'')))assert.ok(FIXED.has(n),`number ${n} in "${s.slice(0,60)}…" comes from the data`);

// ---- 4. nothing paused or removed --------------------------------------------------------------------------------------------
for(const s of ALL)assert.ok(!/\b(cave|underground)\b/i.test(s),`no paused or removed feature: "${s}"`);

// ---- 5. Fuel up: every claim is true in the game's own data ----------------------------------------------------------------
{const HL=L('lib/site/learnFeatures.ts').LEARN_HIGHLIGHTS,fu=HL.find(h=>h.id==='fuel');assert.ok(fu,'the Fuel up chapter exists');
 const food=L('lib/konbini/food.ts'),fuel=L('lib/town/fuel.ts');
 for(const s of [fu.title,fu.line,...fu.chips]){assert.ok(!BANNED.test(s)&&!/\p{Extended_Pictographic}/u.test(s),`Fuel up tone: "${s}"`);
  assert.ok(!/energy drink|weight|diet|calorie|medical|healthy|faster|stronger/i.test(s),`Fuel up: no health, weight or perk claims: "${s}"`);}
 // "Konbini snacks refill your energy" / "Eat to refill your fuel": every Konbini item adds fuel, and walking needs none
 for(const f of food.FOOD_MENU)assert.ok(fuel.foodFuel(f)>0,`${f.id} refills fuel`);
 assert.ok(fuel.canUse('walk',0)&&!fuel.canUse('jetpack',0),'fuel only gates the fast modes; walking always works');
 // "each one shares a football food tip" / "Tips from real sources"
 for(const f of food.FOOD_MENU)assert.ok(food.foodNote(f.id).length>20,`${f.id} shows a nutrition note`);
 assert.ok(food.FOOD_SOURCES.length>=3&&food.FOOD_SOURCES.every(x=>/^https:\/\//.test(x.url)),'the notes cite real sources');
 // "Water comes first"
 assert.match(food.FOOD_NOTES.hydration,/Water comes first/,'the hydration note says water comes first');
 assert.ok(/fuel/i.test(F.find(f=>f.id==='konbini').description),'the Konbini feature mentions fuel');}

console.log(`learn-content ok (${F.length} features in ${G.length} groups, ${Q.length} FAQs, ${keys.size} image keys)`);
