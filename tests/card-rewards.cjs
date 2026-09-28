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
assert.equal(R.MAX_OFFERS_PER_SESSION,undefined,'no per-session cap: an earned ball must always pay (bug, Sep 25)');
// Quiz rule (user, 24 Sep): 5+ questions, all correct, first try (quizEligibleForCard).
assert.equal(R.MIN_QUIZ_QUESTIONS,5);
assert.equal(R.quizEarnsCard(5,true),true);assert.equal(R.quizEarnsCard(8,true),true);
assert.equal(R.quizEarnsCard(4,true),false,'short quizzes earn nothing');assert.equal(R.quizEarnsCard(5,false),false,'every answer must be right');
assert.equal(R.MAX_CATCH_UP,undefined,'catch-up picks were removed (user, 24 Sep: no users yet)');
assert.equal(R.OFFER_SIZE,3);assert.equal(R.NPC_PICKS_PER_DAY,3,'economy pass (28 Sep 2026): 3 NPC picks a day');
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
 assert.equal(R.offerReason(offer,()=>'Goalkeeper'),offer.reason,'no single player is called out: the child chooses freely (user, Sep 25)');
 assert.equal(R.offerReason({...offer,reason:'You found a ball: “X”. Here are three players to learn from.',match:undefined},()=>''),'You found a ball: “X”.','old saved tail dropped');
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
assert.match(triggers,/NO_CARD_EXPLORE=new Set\(\[[^\]]*'knock-characters'/,'knocking characters over never pays a card');
for(const id of ['visit-futsal','visit-7v7','visit-9v9','visit-11v11','use-parachute','visit-store','ride-truck','roof-drop','ramp-trick'])assert.match(triggers,new RegExp(`NO_CARD_EXPLORE=new Set\\(\\[[^\\]]*'${id}'`),`${id} is too easy for a card (user, Sep 27 2026)`);
assert.match(read('lib/town/learningProgress.ts'),/window\.dispatchEvent\(new CustomEvent\(LEARNING_STAGE_COMPLETE,\{detail:\{id,stage\}\}\)\);\n\}/,'journey stage event after the write');
const host=read('components/CardOfferHost.tsx');
assert.match(host,/addEventListener\(LEARNING_STAGE_COMPLETE,stage\)/,'host listens for journey stages');assert.match(host,/earnForExplore\(id\)/,'explore watcher');
assert.match(host,/cardRewardsActive\(\)&&<><ExploreCardWatcher\/><PathCardWatcher\/><\/>/,'no explore or path subscriptions while rewards are off');
const questPath=read('components/QuestLearningPath.tsx');assert.equal((questPath.match(/earnForStory\(/g)||[]).length,2,'life stories and optional stories');
const offerUi=read('components/CardOffer.tsx');assert.match(offerUi,/<CardBack mystery className=\{styles\.mini\}>/,'cards are shown face-down (user, Sep 25 2026: mystery cards)');assert.doesNotMatch(offerUi,/<MiniCard /,'no face-up MiniCard in the deck');assert.doesNotMatch(offerUi,/>Choose later</,'no Choose later: pick one there and then');assert.match(offerUi,/const dismiss=\(\)=>\{if\(offer&&!landed\)\{skip\(\);return;\}/,'Escape cannot skip an open offer (during the unpack it only skips the animation)');assert.doesNotMatch(offerUi,/setInterval|\d+\s*%\s*(chance|odds)|rare pull/i,'no loops, odds or pull copy');
// Deck layout (user, Sep 24 2026): one large card in front, the others behind; arrows, keys, swipe and a tap bring a card forward; a
// clear "Choose [first name]" pill; "N of M" under the card. Once chosen it spins into the full PlayerCard (loaded lazily).
assert.match(offerUi,/aria-label="Previous card"[\s\S]*aria-label="Next card"/,'arrow buttons cycle the deck');
assert.match(offerUi,/data-choose=""[^\n]*>Open this card</,'a clear Open this card pill, no player name');
assert.match(offerUi,/`\$\{active\+1\} of \$\{n\}`/,'the card count under the front card');
assert.match(offerUi,/ArrowRight'\?active\+1:event\.key==='ArrowLeft'\?active-1/,'arrow keys turn the deck');
assert.match(offerUi,/onPointerUp=\{onPointerUp\}/,'swipe turns the deck');
assert.match(offerUi,/import\('\.\/PlayerCard'\)/,'the full PlayerCard loads lazily for the reveal');
assert.doesNotMatch(offerUi,/^import PlayerCard/m,'PlayerCard is never in the offer chunk itself');
// Reveal (user, Sep 24 2026): the binder viewer's layout (top bar: Done left, Play centre, Flip right; its card size), no count line,
// no "Keep playing"; "Added to your binder!" above the card and "See it in my binder" under it (no sheet).
const viewerBranch=offerUi.slice(offerUi.indexOf('{showViewer&&chosenEntry?'),offerUi.indexOf('{!landed&&<div className={styles.stage}'));
assert.ok(viewerBranch.length>200,'the reveal is its own branch');
assert.match(viewerBranch,/className=\{`\$\{viewerStyles\.viewer\} \$\{styles\.reveal\}`\}/,'the reveal reuses the binder viewer');
assert.match(viewerBranch,/<div className=\{viewerStyles\.viewerBar\}>\s*<DoneButton ref=\{doneRef\}[^>]*onDone=\{onClose\}/,'Done (the animated DoneButton) at the top left of the viewer bar');
assert.match(viewerBranch,/className=\{`\$\{viewerStyles\.viewerFlip\} \$\{navStyles\.button\}`\}[^>]*aria-pressed=\{flipped\}[^\n]*?>Flip</,'the viewer bar Flip at the top right');
assert.doesNotMatch(viewerBranch,/countLine|Keep playing/,'no count line and no Keep playing on the reveal');
assert.match(offerUi,/<p id=\{`\$\{uid\}-reason`\}>\{offerReason\([^\n]*<br\/>[^\n]*collected\. Collect them all!/,'the reason, then the count on its own line (user, Sep 25)');
{const css=read('components/CardOffer.module.css');assert.match(css,/\.deck>\.caption\{[^}]*bottom:calc\(50% \+ var\(--w\) \* \.7 \+ 52px\)/,'caption 52px above the card');assert.match(css,/\.deck>\.choose\{[^}]*top:calc\(50% \+ var\(--w\) \* \.7 \+ 52px\)/,'Choose 52px below the card');}
assert.match(viewerBranch,/<h2 id=\{`\$\{uid\}-title`\} className=\{styles\.added\}>Added to your binder!<\/h2>/,'"Added to your binder!" above the card (user, Sep 25)');assert.doesNotMatch(viewerBranch,/sheetOpen|Hide/,'no slide-up sheet (user, Sep 25)');
assert.match(viewerBranch,/<section ref=\{sheetRef\}[\s\S]*See it in my binder[\s\S]*<\/section>/,'See it in my binder sits under the card');
assert.match(offerUi,/if\(landed&&doneRef\.current\)\{doneRef\.current\.click\(\);return;\}/,'Escape after the reveal works like Done');
// The chosen card's flight (Sep 25 2026, "the card seems to stretch"): a FLIP from the deck's MiniCard to the PlayerCard's own place.
// Size/position are the card's individual translate/scale (uniform, after its perspective), the turn is rotateY alone on the flip
// layer (no scale inside the 3D transform), and the MiniCard hands over at edge-on (p = .25) with matched heights. The deck stays
// under the reveal until landing; the flight is built in the PlayerCard's mount commit so its host-spin check shows the rim.
assert.match(offerUi,/flip\.animate\(\[\{transform:'rotateY\(90deg\)',offset:0\},\{transform:'rotateY\(90deg\)',offset:EDGE,easing:TURN_IN\},\{transform:'rotateY\(0deg\)',offset:1\}\],timing\)/,'the unpack turn is rotateY only: the front takes over edge-on and opens to 0°');
assert.doesNotMatch(offerUi,/rotateY\([^)]*\) scale\(/,'no scale mixed into the 3D turn (the old spin skewed and stretched)');
assert.match(offerUi,/card\.animate\(\[\{\.\.\.at\(0\),offset:0,easing:TO_EDGE\},\{\.\.\.at\(SWAP\),offset:EDGE/,'the card flies from the lifted back rect, matched at the edge-on swap');
assert.match(offerUi,/\{!landed&&<div className=\{styles\.stage\} \{\.\.\.\(flying\?\{inert:''\}:\{\}\)/,'the deck stays under the flight, inert (string form: React 18 drops a boolean inert)');
assert.match(offerUi,/const LIFT_MS=340,FLY_MS=1050,EDGE=\.4,/,'lift then turn: about 1.4 s in all (1.2–1.8 s asked)');
const offerCss=read('components/CardOffer.module.css');
assert.match(offerCss,/\.reveal \.host\.host>div\{--card-w:min\(520px,92vw,calc\(\(100dvh - 104px - var\(--head-room\) - env\(safe-area-inset-top,0px\) - var\(--sheet-room\)\) \/ 1\.52\)\)\}/,'the viewer card size, less the heading and the note');
assert.match(offerCss,/\.choice\{[^}]*transition:transform [^;]*,z-index 0s linear \.1s,filter 0s linear \.1s\}/,'deck moves are transform-only');
assert.deepEqual([...(offerCss.split('/* Pending picks')[0].match(/[^{}]*\{[^{}]*infinite[^{}]*\}/g)??[]),...(offerCss.split('/* Sparkling stars')[1]?.match(/[^{}]*\{[^{}]*infinite[^{}]*\}/g)??[])].map(r=>r.trim().split('{')[0].split('*/').pop().trim()),['.sparkles span'],'the only endless animation is the twinkling stars (user, Sep 25), compositor-only');
assert.match(offerCss,/@media\(prefers-reduced-motion:reduce\)\{\.sparkles\{display:none\}\}/,'no stars with reduced motion');
assert.match(offerCss,/\.reveal \[data-scenery\]:not\(\[data-sparkles\]\),\.reveal \[data-scenery\]:not\(\[data-sparkles\]\) \*\{animation-play-state:paused!important\}/,'the revealed card holds its scenery still');
// Mystery cards (user, Sep 25 2026: "choose three cards exactly how it is now, but won't know who it is"): nothing identifies a player
// before the pick (no name, portrait, number, position or strength in the deck), labels are "Mystery card N of 3", the reveal is the
// chosen card only, the grant happens once at the pick, a tap/Escape skips the unpack, and reduced motion is a crossfade.
{const deck=offerUi.slice(offerUi.indexOf('<div className={styles.deck}'),offerUi.indexOf("{offer&&<p className={styles.srOnly} aria-live"));
 assert.ok(deck.length>500,'the deck branch');
 assert.doesNotMatch(deck,/ENTRY\.get|PROFILES|roleLabel|photoFor|describe\(|first\(|\{name\}|key=\{name\}/,'the deck never renders a name, portrait, position or strength');
 assert.match(deck,/key=\{i\}/,'cards keyed by place, not by name');
 assert.match(deck,/aria-label=\{isFront\?`Mystery card \$\{i\+1\} of \$\{n\}`:undefined\}/,'"Mystery card 1 of 3" labels');
 assert.match(offerUi,/setAnnounce\(`Mystery card \$\{next\+1\} of \$\{n\}\.`\)/,'turning the deck announces the place only');
 assert.match(offerUi,/const choose=\(\)=>\{if\(!offer\|\|chosen\)return;const name=cards\[Math\.min\(active,n-1\)\];if\(!name\|\|!chooseOfferCard\(offer\.id,name\)\)return;/,'the front card is the pick, granted once (chooseOfferCard) before any motion');
 assert.equal((offerUi.match(/chooseOfferCard\(/g)||[]).length,1,'exactly one grant call');
 assert.match(offerUi,/Promise\.all\(\[warm\(name\)/,'the chosen portrait is only warmed after the pick');
 assert.doesNotMatch(offerUi.slice(0,offerUi.indexOf('const choose=')),/warm\(/,'no portrait warm-up before the pick');
 assert.match(offerUi,/const dismiss=\(\)=>\{if\(offer&&!landed\)\{skip\(\);return;\}onClose\(\);\};/,'Escape during the unpack skips it; it never skips the offer');
 assert.match(offerUi,/onPointerDown=\{chosen&&!landed\?skip:undefined\}/,'a tap skips the unpack');
 assert.match(offerUi,/if\(reducedMotion\(\)\)\{settle\(\);return;\}/,'reduced motion: straight to the reveal (crossfade)');
 assert.match(offerUi,/<PlayerCard name=\{chosen\}[^>]*glint=\{glint\}/,'the reveal shows the chosen card with its own foil turn light');
 const mini=read('components/MiniCard.tsx');assert.match(mini,/if\(mystery\)return[^\n]*\n\s*<span className=\{styles\.downNo\}>No\. \?\?\?<\/span>[^\n]*<span>\?\?\?<\/span>/,'the mystery back carries no number or name');
 const css=read('components/CardOffer.module.css');assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{[^\n]*\.shine\{display:none\}\}/,'no shine with reduced motion');}
// Art under a modal it is not part of (Paths under "Pick a card") rests and is not woken by the dialog's input.
assert.match(read('lib/sceneryRest.ts'),/closest\('dialog:modal,\[role=dialog\]\[aria-modal=true\]'\)[\s\S]*if\(covered\(event\)\)/,'covered scenery rests');
console.log('Card rewards: random face-down (mystery) offers of 3 missing cards, completion, theme option, refresh, NPC daily limits, storage and hooks passed.');
