// Card rewards (docs/card-rewards.md): the pure "choose 1 of 3" rules in lib/town/cardRewards.ts, run in Node.
// usage: node tests/card-rewards.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const vm=require('node:vm');
const src=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../lib/town/cardRewards.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const mod={exports:{}};vm.runInNewContext(src,{exports:mod.exports,module:mod,Math,Date});
const R=mod.exports;
// Values from the vm realm: compare by JSON (deepStrictEqual checks prototypes across realms).
const same=(a,b,m)=>assert.equal(JSON.stringify(a),JSON.stringify(b),m);

// Shipped defaults stay as the user left them.
assert.equal(R.CARD_REWARDS_LAUNCH,true,'card rewards launched (user, Sep 24 2026)');
assert.equal(R.CARD_REWARDS_ENABLED,R.CARD_REWARDS_LAUNCH,'rewards follow the launch switch');
assert.equal(R.THEME_ONE_CARD,true,'one of the three is matched to the activity (user approved)');
assert.equal(R.MAX_OFFERS_PER_SESSION,6);
// Quiz rule (user, 24 Sep): 5+ questions, all correct, first try (quizEligibleForCard).
assert.equal(R.MIN_QUIZ_QUESTIONS,5);
assert.equal(R.quizEarnsCard(5,true),true);assert.equal(R.quizEarnsCard(8,true),true);
assert.equal(R.quizEarnsCard(4,true),false,'short quizzes earn nothing');assert.equal(R.quizEarnsCard(5,false),false,'every answer must be right');
assert.equal(R.MAX_CATCH_UP,undefined,'catch-up picks were removed (user, 24 Sep: no users yet)');
assert.equal(R.OFFER_SIZE,3);assert.equal(R.NPC_PICKS_PER_DAY,5);assert.ok(R.MAX_OFFERS_PER_SESSION>0);
const unlock=fs.readFileSync(path.join(__dirname,'../lib/town/cardCollection.ts'),'utf8');
assert.match(unlock,/export const UNLOCK_ALL_CARDS=!CARD_REWARDS_LAUNCH;/,'one launch switch drives both flags: unlock-all stays on until launch');
assert.match(unlock,/process\.env\.NODE_ENV==='production'/,'the ?cards=earn switch is ignored in production builds');

const GROUPS=JSON.parse(fs.readFileSync(path.join(__dirname,'../lib/town/positionPlayers.json'),'utf8'));
const seen=new Set(),CARDS=[];for(const [role,g] of Object.entries(GROUPS))for(const name of [...g.current,...g.allTime])if(!seen.has(name)){seen.add(name);CARDS.push({name,role});}
let seed=7;const rng=()=>(seed=(seed*16807)%2147483647)/2147483647;

// Offers: three distinct, never owned; fewer when fewer are missing; none when the set is complete.
for(let k=0;k<200;k++){const owned=new Set(CARDS.filter(()=>rng()<.6).map(c=>c.name));const offer=R.drawOffer(CARDS,owned,rng,{theme:k%2?R.themeFromText('keeper'):undefined});
 assert.equal(offer.length,Math.min(3,CARDS.length-owned.size));assert.equal(new Set(offer).size,offer.length,'no card twice in one offer');assert.ok(offer.every(n=>!owned.has(n)),'never an owned card');}
const allBut2=new Set(CARDS.slice(2).map(c=>c.name));same(R.drawOffer(CARDS,allBut2,rng).sort(),CARDS.slice(0,2).map(c=>c.name).sort(),'with 2 left, offer those 2');
same(R.drawOffer(CARDS,new Set(CARDS.map(c=>c.name)),rng),[],'complete collection → no offer');

// Random: across many draws every card can appear (no hidden weighting).
const counts=new Map();for(let k=0;k<4000;k++)for(const n of R.drawOffer(CARDS,new Set(),rng,{themed:false}))counts.set(n,(counts.get(n)??0)+1);
assert.equal(counts.size,CARDS.length,'every card is reachable');

// Choosing one card per offer always finishes the collection (no duplicates, no wall).
{const owned=new Set();let offers=0;while(owned.size<CARDS.length){const offer=R.drawOffer(CARDS,owned,rng);assert.ok(offer.length);owned.add(offer[Math.floor(rng()*offer.length)]);offers++;}
 assert.equal(offers,CARDS.length,`${CARDS.length} picks collect all ${CARDS.length} cards`);}

// Pending offers avoid each other's cards while enough others remain.
{const a=R.drawOffer(CARDS,new Set(),rng),b=R.drawOffer(CARDS,new Set(),rng,{avoid:new Set(a)});assert.ok(b.every(n=>!a.includes(n)));}

// Theme (off by default): when on, one card comes from the activity's positions.
const keeper=R.themeFromText('Goalkeeper & Restarts Keeper: Defend the Goal');same(keeper.roles,['goalkeeper']);
same(R.themeFromText('Goalkeeper & Restarts',true).roles,['goleiro'],'futsal keeper lessons map to goleiros');
same(R.themeFromText('Team Systems',true).roles,['goleiro','fixo','ala','pivot'],'other futsal lessons → any futsal card');
assert.equal(R.themeFromText('Build Through Pressure').roles[0],'midfielder','"Pressure" is not the defending word "press"');
const roleOf=n=>CARDS.find(c=>c.name===n).role;
for(let k=0;k<50;k++){const {cards,match}=R.drawThemedOffer(CARDS,new Set(),rng,{theme:keeper});assert.equal(roleOf(match),'goalkeeper','keeper quiz → a goalkeeper');assert.ok(cards.includes(match));assert.equal(cards.length,3);}
const futsal=R.themeFromText('Team Systems 3-1: Meet the Court Roles',true);
for(let k=0;k<50;k++){const {match}=R.drawThemedOffer(CARDS,new Set(),rng,{theme:futsal});assert.ok(['goleiro','fixo','ala','pivot'].includes(roleOf(match)),'futsal quiz → a futsal card');}
// No keeper left uncollected → fully random, no match claimed.
{const keepers=new Set(CARDS.filter(c=>c.role==='goalkeeper').map(c=>c.name));const {cards,match}=R.drawThemedOffer(CARDS,keepers,rng,{theme:keeper});assert.equal(match,null);assert.equal(cards.length,3);assert.ok(cards.every(n=>!keepers.has(n)));}
// The reason line mentions the match while the matched card is still offered.
{const offer={id:'o',kind:'quiz',source:'q',reason:'You passed “Keeper at Feet”, a quiz about goalkeeping.',cards:['Alisson','A','B'],at:1,seen:false,theme:keeper,match:'Alisson'};
 assert.equal(R.offerReason(offer,()=>'Goalkeeper'),'You passed “Keeper at Feet”, a quiz about goalkeeping. Alisson (goalkeeper) matches what you just learned about goalkeeping.');
 assert.equal(R.offerReason({...offer,cards:['X','A','B']},()=>'Goalkeeper'),offer.reason,'no claim once the matched card is gone');}

// Refresh: an offer never shows a card collected since it was made.
{const offer={id:'o',kind:'ball',source:'ball:x',reason:'r',cards:CARDS.slice(0,3).map(c=>c.name),at:1,seen:false};
 assert.equal(R.refreshOffer(offer,CARDS,new Set(),rng),offer,'unchanged offer is the same object');
 const next=R.refreshOffer(offer,CARDS,new Set([CARDS[0].name]),rng);assert.equal(next.cards.length,3);assert.ok(!next.cards.includes(CARDS[0].name));assert.ok(next.cards.includes(CARDS[1].name),'the other two stay');}

// NPC limits (user decision): one pick per NPC per day, NPC_PICKS_PER_DAY in total, reset at local midnight.
{const day=R.dayKey(new Date(2026,8,24,23,59)),next=R.dayKey(new Date(2026,8,25,0,1));assert.equal(day,'2026-09-24');assert.equal(next,'2026-09-25');
 const s=R.emptyOfferState();assert.equal(R.npcPickState(s,'rosa',day),'ok');
 s.npcDay={day,ids:['rosa']};assert.equal(R.npcPickState(s,'rosa',day),'npc-today');assert.equal(R.npcPickState(s,'kai',day),'ok');
 s.npcDay={day,ids:['a','b','c','d','e']};assert.equal(R.npcPickState(s,'kai',day),'day-cap');
 assert.equal(R.npcPickState(s,'rosa',next),'ok','a new day starts fresh');assert.equal(R.npcPickState(s,'a',next),'ok');
 assert.notEqual(R.sourceKey('npc','rosa',day),R.sourceKey('npc','rosa',next));assert.equal(R.sourceKey('quiz','futsal:x',day),R.sourceKey('quiz','futsal:x',next),'quizzes and balls pay once ever');}

// Saved state is sanitized; merges never lose an offer or a payout.
{const valid=new Set(CARDS.map(c=>c.name));
 same(R.sanitizeOfferState('junk',valid),R.emptyOfferState());
 const s=R.sanitizeOfferState({offers:[{id:'a',kind:'ball',source:'ball:a',reason:'r',cards:[CARDS[0].name,'Nobody',CARDS[1].name],at:5},{id:'b',kind:'bogus',source:'x',reason:'r',cards:[CARDS[0].name]},{id:'c',kind:'quiz',source:'q',reason:'r',cards:['Nobody']}],paid:['ball:a',3],npcDay:{day:'2026-09-24',ids:['rosa']}},valid);
 assert.equal(s.offers.length,1);same(s.offers[0].cards,[CARDS[0].name,CARDS[1].name]);assert.equal(s.offers[0].seen,false);same(s.paid,['ball:a']);
 const mine={...R.emptyOfferState(),offers:[{...s.offers[0],seen:true},{id:'m',kind:'npc',source:'n',reason:'r',cards:[CARDS[2].name],at:9,seen:false}],paid:['n']};
 const theirs={...R.emptyOfferState(),offers:[s.offers[0],{id:'t',kind:'quiz',source:'q',reason:'r',cards:[CARDS[3].name],at:7,seen:false}],paid:['ball:a','q']};
 const merged=R.mergeOfferState(mine,theirs,new Set(['m']));
 same(merged.offers.map(o=>o.id),['a','t'],'union of offers, oldest first, minus the one chosen here');assert.equal(merged.offers[0].seen,true,"this tab's copy wins");
 same(merged.paid.sort(),['ball:a','n','q']);}

// Hooks are wired at the three triggers, one offer per quiz (at its end), and the offer is face-up and must be answered (no Choose later).
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
assert.match(read('components/Town.tsx'),/earnForBall\(c\)/,'ball collect hook');
assert.match(read('components/NpcConversation.tsx'),/earnForNpc\(/,'NPC chat hook');
assert.match(read('components/FieldLearning.tsx'),/n>=chosen\.questions\.length\)\{if\(!preview\.current&&!learningId\)earnForQuiz\(/,'quiz hook runs once, at the end of the quiz (a Journey stage quiz pays through its stage instead, never twice)');
const triggers=read('lib/town/cardRewardTriggers.ts');
assert.match(triggers,/if\(!quizEligibleForCard\(lesson\.questions\.length,allCorrect\)\)return 'off';/,'live quiz trigger uses the one rule');
const store=read('lib/town/cardRewardStore.ts');
assert.doesNotMatch(store+triggers,/grantCatchUp/,'no catch-up grant');
// Follow-up triggers (Explore items, Learning Journey stages, stories): once per item/stage/story ever (ledger keys), same session
// cap (they go through earnCardOffer), and saved offers of these kinds survive sanitizing.
{const valid=new Set(CARDS.map(c=>c.name));const kinds=['explore','journey','story'];
 const saved=R.sanitizeOfferState({offers:kinds.map((kind,i)=>({id:kind,kind,source:`${kind}:x`,reason:'r',cards:[CARDS[i].name],at:i}))},valid);
 same(saved.offers.map(o=>o.kind),kinds,'new kinds are kept');
 assert.equal(R.sourceKey('journey','support:0','2026-09-24'),'journey:support:0');assert.equal(R.sourceKey('story','futsl','2026-09-24'),R.sourceKey('story','futsl','2030-01-01'),'stories pay once ever');}
assert.match(triggers,/export function earnForExplore[\s\S]*?earnCardOffer\(request\)/,'Explore goes through earnCardOffer (session cap, ledger, launch gate)');
assert.match(triggers,/export function earnForJourney[\s\S]*?earnCardOffer\(request\)/);assert.match(triggers,/export function earnForStory[\s\S]*?earnCardOffer\(request\)/);
assert.match(triggers,/filter\(item=>item\.id!=='knock-characters'\)/,'knocking characters over never pays a card');
assert.match(read('lib/town/learningProgress.ts'),/window\.dispatchEvent\(new CustomEvent\(LEARNING_STAGE_COMPLETE,\{detail:\{id,stage\}\}\)\);\n\}/,'journey stage event after the write');
const host=read('components/CardOfferHost.tsx');
assert.match(host,/addEventListener\(LEARNING_STAGE_COMPLETE,stage\)/,'host listens for journey stages');assert.match(host,/earnForExplore\(id\)/,'explore watcher');
assert.match(host,/cardRewardsActive\(\)&&<ExploreCardWatcher/,'no explore subscriptions while rewards are off');
const questPath=read('components/QuestLearningPath.tsx');assert.equal((questPath.match(/earnForStory\(/g)||[]).length,2,'life stories and optional stories');
const offerUi=read('components/CardOffer.tsx');assert.match(offerUi,/<MiniCard [^>]*got/,'cards are shown face-up');assert.doesNotMatch(offerUi,/>Choose later</,'no Choose later: pick one there and then');assert.match(offerUi,/const dismiss=\(\)=>\{if\(offer&&!landed\)return;/,'Escape cannot skip an open offer');assert.doesNotMatch(offerUi,/setInterval|\d+\s*%\s*(chance|odds)|rare pull/i,'no loops, odds or pull copy');
// Deck layout (user, Sep 24 2026): one large card in front, the others behind; arrows, keys, swipe and a tap bring a card forward; a
// clear "Choose [first name]" pill; "N of M" under the card. Once chosen it spins into the full PlayerCard (loaded lazily).
assert.match(offerUi,/aria-label="Previous card"[\s\S]*aria-label="Next card"/,'arrow buttons cycle the deck');
assert.match(offerUi,/data-choose=""[^\n]*>Choose \{first\(frontEntry\.name\)\}</,'a clear Choose [first name] pill');
assert.match(offerUi,/`\$\{active\+1\} of \$\{n\}`/,'the card count under the front card');
assert.match(offerUi,/ArrowRight'\?active\+1:event\.key==='ArrowLeft'\?active-1/,'arrow keys turn the deck');
assert.match(offerUi,/onPointerUp=\{onPointerUp\}/,'swipe turns the deck');
assert.match(offerUi,/import\('\.\/PlayerCard'\)/,'the full PlayerCard loads lazily for the reveal');
assert.doesNotMatch(offerUi,/^import PlayerCard/m,'PlayerCard is never in the offer chunk itself');
const offerCss=read('components/CardOffer.module.css');
assert.match(offerCss,/\.choice\{[^}]*transition:transform [^;]*,z-index 0s linear \.1s,filter 0s linear \.1s\}/,'deck moves are transform-only');
assert.doesNotMatch(offerCss.split('/* Pending picks')[0],/infinite/,'the offer dialog has no endless animation');
assert.match(offerCss,/\.reveal \[data-scenery\],\.reveal \[data-scenery\] \*\{animation-play-state:paused!important\}/,'the revealed card holds its scenery still');
// Art under a modal it is not part of (Paths under "Pick a card") rests and is not woken by the dialog's input.
assert.match(read('lib/sceneryRest.ts'),/closest\('dialog:modal'\)[\s\S]*if\(covered\(event\)\)/,'covered scenery rests');
console.log('Card rewards: random face-up offers of 3 missing cards, completion, theme option, refresh, NPC daily limits, storage and hooks passed.');
