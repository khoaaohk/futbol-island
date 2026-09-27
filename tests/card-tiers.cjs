// Card value tiers (docs/card-rewards.md "Value tiers", user Sep 25 2026): Icon / Elite / Regular from fan-demand scores, gated by
// path progress, weighted, Icons only on big triggers, and a path finish that always brings an Icon.
// usage: node tests/card-tiers.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const vm=require('node:vm');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const src=ts.transpileModule(read('lib/town/cardRewards.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const mod={exports:{}};vm.runInNewContext(src,{exports:mod.exports,module:mod,Math,Date});
const R=mod.exports;

// The data: every card has a 0–100 demand judgement score and a reason; tiers derive from the thresholds.
const DATA=JSON.parse(read('lib/town/cardTiers.json'));
const GROUPS=JSON.parse(read('lib/town/positionPlayers.json'));
const FUTSAL=new Set(['goleiro','fixo','ala','pivot']);
const seen=new Set(),CARDS=[];
for(const [role,g] of Object.entries(GROUPS))for(const name of [...g.current,...g.allTime])if(!seen.has(name)){seen.add(name);CARDS.push({name,role,tier:R.tierFromDemand(DATA.cards[name]?.demand,DATA.thresholds,DATA.overrides[name])});}
assert.match(DATA.note,/JUDGEMENT score/,'the score is labelled as a judgement, not follower data');
for(const c of CARDS){const e=DATA.cards[c.name];assert.ok(e,`${c.name} has a demand entry`);assert.ok(Number.isInteger(e.demand)&&e.demand>=0&&e.demand<=100,`${c.name} demand 0–100`);assert.ok(e.why&&e.why.length>10,`${c.name} has a reason`);}
assert.deepEqual(Object.keys(DATA.cards).filter(n=>!seen.has(n)),[],'no tier entry for a player who is not a card');
const byTier=t=>CARDS.filter(c=>c.tier===t);
const ICONS=byTier('icon'),ELITE=byTier('elite'),REGULAR=byTier('regular');
assert.ok(ICONS.length>=20&&ICONS.length<=35,`20–35 Icons (${ICONS.length})`);
assert.ok(ELITE.length>=50&&ELITE.length<=71,`50–71 Elite (${ELITE.length})`);
for(const name of ['Lionel Messi','Cristiano Ronaldo','Pelé','Diego Maradona','Zinedine Zidane','Johan Cruyff','Ronaldo Nazário','Franz Beckenbauer','Marta','Mia Hamm','Kylian Mbappé','Erling Haaland','Ronaldinho','Neymar','Vinícius Júnior','Jude Bellingham','Lamine Yamal','David Beckham','Falcão','Ricardinho'])
 assert.equal(CARDS.find(c=>c.name===name).tier,'icon',`${name} is an Icon`);
assert.ok(ICONS.filter(c=>FUTSAL.has(c.role)).length>=2&&ELITE.filter(c=>FUTSAL.has(c.role)).length>=5,'futsal has its own Icons and Elites');
const WOMEN=['Marta','Mia Hamm','Aitana Bonmatí','Alexia Putellas','Alex Morgan','Sam Kerr','Megan Rapinoe','Lucy Bronze'];
assert.ok(WOMEN.filter(n=>CARDS.find(c=>c.name===n).tier!=='regular').length===WOMEN.length,"the women's game's biggest names are Icon or Elite");
assert.equal(R.tierFromDemand(99,DATA.thresholds,'regular'),'regular','an override wins');assert.equal(R.tierFromDemand(undefined,DATA.thresholds),'regular','unknown players are Regular');

// Constants in one place.
const same=(a,b,m)=>assert.equal(JSON.stringify(a),JSON.stringify(b),m);
same(R.TIER_UNLOCK,{elite:.5,icon:.8});assert.equal(R.MAX_ICONS_PER_OFFER,1);assert.equal(R.PATH_FINISH_ICON,true,'the path-finish Icon is on');
assert.ok(R.TIER_WEIGHT.icon<R.TIER_WEIGHT.elite&&R.TIER_WEIGHT.elite<R.TIER_WEIGHT.regular,'Icons rarer than Elite, rarer than Regular');
same([...R.ICON_TRIGGERS].sort(),['journey','path','quiz'],'Icons only on big triggers');
assert.ok(R.REWARD_KINDS.includes('path'),'the path-finish kind survives sanitizing');
assert.equal(R.TIER_TEACHING_LINE,'The greatest players unlock as you master the game.');

let seed=11;const rng=()=>(seed=(seed*16807)%2147483647)/2147483647;
const tierOf=new Map(CARDS.map(c=>[c.name,c.tier]));
const draws=(progress,kind,k=3000,owned=new Set())=>{const all=[];for(let i=0;i<k;i++)all.push(R.drawThemedOffer(CARDS,owned,rng,{gate:R.tierGate(progress,kind)}).cards);return all;};
const count=(offers,t)=>offers.flat().filter(n=>tierOf.get(n)===t).length;

// No Icon (or Elite) before the thresholds, on any trigger.
for(const kind of ['ball','npc','quiz','explore','journey','story']){
 const early=draws(0,kind,800);assert.equal(count(early,'icon'),0,`no Icon at the start (${kind})`);assert.equal(count(early,'elite'),0,`no Elite at the start (${kind})`);
 assert.equal(count(draws(.49,kind,800),'elite'),0,`Elite gated below half-way (${kind})`);
 assert.equal(count(draws(.79,kind,800),'icon'),0,`no Icon below ${R.TIER_UNLOCK.icon*100}% (${kind})`);
 early.forEach(o=>assert.equal(o.length,3));
}
// Elite from half-way, at a reduced weight; still no Icons until 80%.
{const mid=draws(.5,'ball',4000);assert.ok(count(mid,'elite')>0,'Elite offered from half-way');assert.equal(count(mid,'icon'),0);
 const perElite=count(mid,'elite')/ELITE.length,perRegular=count(mid,'regular')/REGULAR.length,ratio=perElite/perRegular;
 assert.ok(ratio>R.TIER_WEIGHT.elite*.7&&ratio<R.TIER_WEIGHT.elite*1.3,`an Elite card is drawn at about ${R.TIER_WEIGHT.elite}× a Regular card (${ratio.toFixed(2)})`);}
// Icons after the threshold, only on big triggers, rarely, and at most one per offer.
{const late=draws(.8,'quiz',6000);assert.ok(count(late,'icon')>0,'Icons offered after 80% on a quiz');
 assert.ok(late.every(o=>o.filter(n=>tierOf.get(n)==='icon').length<=R.MAX_ICONS_PER_OFFER),'at most one Icon per offer');
 const share=late.filter(o=>o.some(n=>tierOf.get(n)==='icon')).length/late.length;assert.ok(share>0&&share<.12,`an Icon is in few offers (${(share*100).toFixed(1)}%)`);
 assert.ok(count(draws(1,'journey',3000),'icon')>0,'a Journey stage can offer an Icon late');
 for(const kind of ['ball','npc','explore','story'])assert.equal(count(draws(1,kind,1500),'icon'),0,`never an Icon from a ${kind}, even at 100%`);}
// The path-finish guarantee: Icons only, so any face-down pick is an Icon; falls back to Elite, then Regular.
{for(const o of draws(1,'path',300))assert.ok(o.length===3&&o.every(n=>tierOf.get(n)==='icon'),'a path finish offers three Icons');
 const allButOneIcon=new Set(ICONS.slice(1).map(c=>c.name));const o=R.drawThemedOffer(CARDS,allButOneIcon,rng,{gate:R.tierGate(1,'path')}).cards;
 assert.equal(o.length,3);assert.ok(o.includes(ICONS[0].name),'the last Icon is offered');assert.equal(o.filter(n=>tierOf.get(n)==='elite').length,2,'filled with Elite');
 const noTop=new Set([...ICONS,...ELITE].map(c=>c.name));assert.ok(R.drawThemedOffer(CARDS,noTop,rng,{gate:R.tierGate(1,'path')}).cards.every(n=>tierOf.get(n)==='regular'),'then Regular');
 const g=R.tierGate(0,'path');assert.equal(g.iconOffer,true,'the path-finish pick is Icons whatever the progress reading');}
// Small-pool fallback: fewer cards when fewer unlocked cards are missing; never an empty offer while any card is missing.
{const twoLeft=new Set(REGULAR.slice(2).map(c=>c.name));const o=R.drawThemedOffer(CARDS,twoLeft,rng,{gate:R.tierGate(0,'ball')}).cards;
 same(o.sort(),REGULAR.slice(0,2).map(c=>c.name).sort(),'two unlocked cards left → an offer of those two, no locked card added');
 const noRegular=new Set(REGULAR.map(c=>c.name));const e=R.drawThemedOffer(CARDS,noRegular,rng,{gate:R.tierGate(0,'ball')}).cards;
 assert.equal(e.length,3);assert.ok(e.every(n=>tierOf.get(n)==='elite'),'nothing unlocked left → the lowest locked tier (Elite), so an earned pick is never lost');
 const onlyIcons=new Set([...REGULAR,...ELITE].map(c=>c.name));const i=R.drawThemedOffer(CARDS,onlyIcons,rng,{gate:R.tierGate(0,'npc')}).cards;
 assert.equal(i.length,1,'only Icons left → one Icon (the one-Icon limit), never nothing');assert.equal(tierOf.get(i[0]),'icon');}
// Theme stays inside the gate: a keeper quiz early never brings an Icon or Elite keeper.
{const keeper=R.themeFromText('Goalkeeper');for(let k=0;k<300;k++){const {cards,match}=R.drawThemedOffer(CARDS,new Set(),rng,{theme:keeper,gate:R.tierGate(0,'quiz')});assert.equal(tierOf.get(match),'regular');assert.ok(cards.every(n=>tierOf.get(n)==='regular'));}}
// No duplicates: whatever the progress and triggers, every offer is distinct missing cards and one pick per offer completes the set.
{const kinds=['ball','npc','quiz','explore','journey','story','path'];const owned=new Set();let picks=0,progress=0;
 while(owned.size<CARDS.length){progress=Math.min(1,progress+.004);const kind=kinds[picks%kinds.length];const o=R.drawThemedOffer(CARDS,owned,rng,{gate:R.tierGate(progress,kind),avoid:new Set()}).cards;
  assert.ok(o.length>0,'never an empty offer while cards are missing');assert.equal(new Set(o).size,o.length,'no card twice in one offer');assert.ok(o.every(n=>!owned.has(n)),'never an owned card');
  owned.add(o[Math.floor(rng()*o.length)]);picks++;}
 assert.equal(picks,CARDS.length,'one pick per offer still collects every card: no wall');}
// Refresh keeps the gate: a collected card's replacement never adds a second Icon or a locked card.
{const icon=ICONS[0].name,reg=REGULAR.slice(0,2).map(c=>c.name);const offer={id:'o',kind:'quiz',source:'q',reason:'r',cards:[icon,...reg],at:1,seen:false};
 for(let k=0;k<200;k++){const next=R.refreshOffer(offer,CARDS,new Set([reg[0]]),rng,new Set(),R.tierGate(1,'quiz'));assert.equal(next.cards.filter(n=>tierOf.get(n)==='icon').length,1);assert.ok(!next.cards.includes(reg[0]));}
 const early={...offer,cards:reg.concat(REGULAR[2].name)};for(let k=0;k<200;k++){const next=R.refreshOffer(early,CARDS,new Set([reg[0]]),rng,new Set(),R.tierGate(0,'ball'));assert.ok(next.cards.every(n=>tierOf.get(n)==='regular'),'early refresh stays Regular');}
 const pathOffer={...offer,kind:'path',cards:ICONS.slice(0,3).map(c=>c.name)};const next=R.refreshOffer(pathOffer,CARDS,new Set([ICONS[0].name]),rng,new Set(),R.tierGate(1,'path'));assert.ok(next.cards.every(n=>tierOf.get(n)==='icon'),'a path pick stays all Icons');}

// Wiring: the store gates every draw and refresh by path progress; the path watcher pays each newly finished path once; the binder
// explains locked tiers; the tier data never reaches the face-down deck.
const store=read('lib/town/cardRewardStore.ts');
assert.match(store,/const CARDS=CARD_ENTRIES\.map\(\(\{name,role\}\)=>\(\{name,role,tier:cardTier\(name\)\}\)\);/,'every card carries its tier');
assert.match(store,/drawThemedOffer\(CARDS,owned,Math\.random,\{avoid,theme,gate:tierGate\(readPathProgress\(\),kind\)\}\)/,'offers draw through the tier gate');
assert.match(store,/refreshOffer\(offer,CARDS,owned,Math\.random,avoid,tierGate\(readPathProgress\(\),offer\.kind\)\)/,'refreshes too');
const tiers=read('lib/town/cardTiers.ts');
assert.match(tiers,/const core=path\.chapters\.flatMap\(chapter=>chapter\.lessons\);/,'progress counts the starter lessons');
assert.match(tiers,/lessonEvidence\(path\.format,lesson,steps,answers\)\.complete/,"the Paths screen's own complete rule");
assert.match(tiers,/best:Math\.max\(0,\.\.\.Object\.values\(byFormat\)\)/,'the furthest path counts');
assert.match(tiers,/process\.env\.NODE_ENV==='production'/,'the ?cardpath preview is ignored in production');
const host=read('components/CardOfferHost.tsx');
assert.match(host,/if\(pathBaseline===null\)\{pathBaseline=new Set\(done\);return;\}\n\s*for\(const format of done\)if\(!pathBaseline\.has\(format\)\)\{pathBaseline\.add\(format\);earnForPath\(format\);\}/,'only newly finished paths pay (no catch-up)');
assert.match(read('lib/town/cardRewardTriggers.ts'),/earnCardOffer\(\{kind:'path',id:format,reason:`You finished the \$\{path\.title\} path! \$\{TIER_TEACHING_LINE\}`\}\)/,'the path pick explains why icons come later');
const binder=read('components/CardCollection.tsx');
assert.match(binder,/const earnCopy=\(name:string\)=>cardRewardsActive\(\)\?TIER_HINT\[cardTier\(name\)\]\?\?EARN_ACTIVE_COPY:EARN_COPY;/,'greyed Icon/Elite cards say when they unlock');
assert.match(binder,/icon:`\$\{TIER_TEACHING_LINE\} Icon cards appear near the end of a path/);
assert.doesNotMatch(read('components/CardOffer.tsx'),/cardTier|cardTiers|TIER_/,'no tier or rarity in the face-down offer');
console.log(`Card tiers: ${ICONS.length} Icon / ${ELITE.length} Elite / ${REGULAR.length} Regular; gates, weights, big-trigger Icons, path-finish Icons, small-pool fallback, no duplicates and wiring passed.`);
