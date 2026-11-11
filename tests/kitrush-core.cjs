// Kit Rush (Nov 10 2026, docs/arcade-aaa/kitrush-direction.md): the seeded rules, the device save and its arcade wiring.
// Run: node -r ./scripts/test-ts-cache.cjs tests/kitrush-core.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const K=require('../lib/arcade/kitrush/core.ts'),S=require('../lib/arcade/kitrush/save.ts'),L=require('../lib/arcade/leaderboard.ts');
const {arcadeCabinets}=require('../lib/arcade/arcadeCatalog.ts'),T=require('../lib/arcade/arcadeTodayCore.ts'),{arcadeCoinTarget}=require('../lib/arcade/arcadeWalletCore.ts'),{ARCADE_COIN_CAPS}=require('../lib/economy.ts');
const {isSyncKey}=require('../lib/saves/snapshot.ts');
const read=p=>fs.readFileSync(p,'utf8'),{KR,KIND}=K;
const isOwn=(s,it)=>it.kind>=KIND.golden||(it.kind<K.KIT_KINDS&&it.team===s.team);
/** Steps a game and records every event (copied out of the pooled ring). */
function trace(g,seconds,onFrame){const ev=[];for(let i=0;i<seconds*60&&!g.state.over;i++){g.step(1/60);if(onFrame)onFrame(g);g.drain(e=>ev.push({...e}));}return ev;}
/** A careful player: one stroke through each own item in reach, never near a hazard. */
function careful(g){const s=g.state;if(s.beat>0)return;const haz=s.items.filter(it=>it.active&&!isOwn(s,it));
 for(const it of s.items){if(!it.active||!isOwn(s,it)||it.y>s.h*.85||it.y<s.h*.15)continue;if(haz.some(h=>Math.hypot(h.x-it.x,h.y-it.y)<KR.r*2.6))continue;g.beginStroke(0);g.swipe(0,it.x,it.y-8,it.x,it.y+1);g.endStroke(0);}}
let n=0;const ok=(name,fn)=>{fn();n++;};

ok('same seed, same round; another seed, another round',()=>{
 const sig=seed=>{const g=K.createKitRush({seed,h:170});return trace(g,25).filter(e=>e.type==='toss').map(e=>`${e.x.toFixed(2)}:${e.a}:${e.b}`).join('|');};
 assert.equal(sig(4242),sig(4242));assert.notEqual(sig(4242),sig(4243));assert(sig(4242).split('|').length>12,'a round tosses kit');
 // the field height changes the flight, never the wave plan
 const plan=h=>{const g=K.createKitRush({seed:99,h});return trace(g,18).filter(e=>e.type==='toss').map(e=>`${e.x.toFixed(1)}:${e.a}:${e.b}`).join('|');};
 assert.equal(plan(140),plan(200),'a taller phone sees the same kit in the same order');
});
ok('teaching waves: one of yours, a pair of yours, then one of theirs',()=>{
 const g=K.createKitRush({seed:7,h:160}),s=g.state,ev=trace(g,KR.readyBeat+.02).concat();assert.equal(ev[0].type,'ready');assert.equal(ev[0].a,s.team);
 const toss=trace(g,6).filter(e=>e.type==='toss');
 assert.deepEqual(toss.slice(0,5).map(e=>e.b===s.team),[true,true,true,true,false],'waves 0-2: own, own+own, own then rival');
 assert(toss.slice(0,5).every(e=>e.a<K.KIT_KINDS),'no whistle or special in the teaching waves');
 const early=K.createKitRush({seed:11,h:160});const kinds=trace(early,9).filter(e=>e.type==='toss').map(e=>e.a);assert(!kinds.slice(0,5).includes(KIND.whistle),'the whistle waits for wave 5');
});
ok('scoring: 10 x place in the swipe, a named call at the end, bonus from three',()=>{
 const g=K.createKitRush({seed:7,h:160}),s=g.state;trace(g,KR.readyBeat+.9);
 const one=s.items.filter(it=>it.active);assert.equal(one.length,1);g.beginStroke(0);g.swipe(0,one[0].x-9,one[0].y,one[0].x+9,one[0].y);g.endStroke(0);
 assert.equal(s.score,10);let ev=[];g.drain(e=>ev.push({...e}));assert(ev.some(e=>e.type==='slice'&&e.a===10&&e.b===1));assert(!ev.some(e=>e.type==='call'),'one item is not a combo');
 for(let i=0;i<400&&s.items.filter(it=>it.active&&it.y<s.h*.8).length<2;i++)g.step(1/60);g.drain(()=>{});
 const pair=s.items.filter(it=>it.active).sort((a,b)=>a.x-b.x);assert.equal(pair.length,2);g.beginStroke(0);g.swipe(0,pair[0].x-9,pair[0].y,pair[0].x,pair[0].y);g.swipe(0,pair[0].x,pair[0].y,pair[1].x,pair[1].y);g.endStroke(0);
 assert.equal(s.score,10+10+20);ev=[];g.drain(e=>ev.push({...e}));const call=ev.find(e=>e.type==='call');assert(call&&call.a===2&&call.b===0);assert.equal(K.callFor(2),'ONE-TWO!');assert.equal(s.stats.bestCombo,2);
 assert.deepEqual([2,3,4,5,6,9].map(K.callFor),['ONE-TWO!','HAT-TRICK!','TIKI-TAKA!','TOTAL FOOTBALL!','GOLAZO!','GOLAZO!']);
 // a tap is not a swipe
 const t=K.createKitRush({seed:7,h:160});trace(t,KR.readyBeat+.9);const it=t.state.items.find(i=>i.active);t.beginStroke(0);t.swipe(0,it.x,it.y,it.x+.5,it.y);t.endStroke(0);assert.equal(t.state.score,0,'under minTravel nothing is struck');
});
ok('lives: their kit or the whistle costs one, clears the air, and never two from one swipe',()=>{
 const g=K.createKitRush({seed:7,h:160}),s=g.state;for(let i=0;i<900&&!s.items.some(it=>it.active&&!isOwn(s,it)&&it.y<s.h*.8);i++)g.step(1/60);g.drain(()=>{});
 const rival=s.items.find(it=>it.active&&!isOwn(s,it));assert(rival,'wave 2 brings a rival kit');
 g.beginStroke(0);g.swipe(0,rival.x-9,rival.y,rival.x+9,rival.y);assert.equal(s.lives,KR.lives-1);assert(!s.items.some(it=>it.active),'the air clears');assert(s.safe>0);
 const ev=[];g.drain(e=>ev.push({...e}));assert(ev.some(e=>e.type==='foul'&&e.a===0&&e.b===2));assert(ev.some(e=>e.type==='puff'));
 // force another hazard under the same finger while safe: no second life
 const o=s.items[0];Object.assign(o,{active:true,kind:KIND.whistle,team:-1,x:50,y:80,vx:0,vy:0});g.swipe(0,40,80,60,80);assert.equal(s.lives,KR.lives-1,'safe window');
 s.safe=0;g.step(.5);g.beginStroke(0);Object.assign(o,{active:true,kind:KIND.whistle,team:-1,x:50,y:80,vx:0,vy:0});g.swipe(0,40,80,60,80);assert.equal(s.lives,KR.lives-2);assert.equal(s.stats.whistle,1);
 s.safe=0;g.step(.5);g.beginStroke(0);Object.assign(o,{active:true,kind:KIND.ball,team:s.teams.find(t=>t!==s.team),x:50,y:80,vx:0,vy:0});g.swipe(0,40,80,60,80);assert.equal(s.lives,0);assert(s.over);
 const before=s.score;g.step(1);g.swipe(0,0,0,100,100);assert.equal(s.score,before,'a finished round is frozen');
});
ok('missing your own kit costs no life, only the clean run; a long clean run brings a life back',()=>{
 const g=K.createKitRush({seed:21,h:160}),s=g.state,ev=trace(g,12);assert(ev.some(e=>e.type==='miss'));assert.equal(s.lives,KR.lives);assert.equal(s.clean,0);assert(s.stats.missed>0);
 const c=K.createKitRush({seed:5,h:160});c.state.lives=1;const evs=trace(c,120,careful);const sub=evs.find(e=>e.type==='sub');assert(sub,'a clean run earns SUPER SUB');assert(c.state.subs>=1);assert(c.state.lives<=KR.lives);
});
ok('switch: a beat, the air clears, your kit changes to one already in play',()=>{
 const g=K.createKitRush({seed:31,h:160}),s=g.state,first=s.team,ev=trace(g,90,careful),sw=ev.find(e=>e.type==='switch');
 assert(sw,'a switch comes');assert.equal(sw.b,first);assert.notEqual(sw.a,first);assert(s.stats.switches>=1);assert(s.wave>=KR.switchFirst[0]);
 const g2=K.createKitRush({seed:31,h:160});let hit=false;for(let i=0;i<6000&&!hit;i++){g2.step(1/60);g2.drain(e=>{if(e.type==='switch')hit=true;});}
 assert(g2.state.beat>0,'the game holds its breath');assert(!g2.state.items.some(it=>it.active));const sc=g2.state.score;g2.beginStroke(0);g2.swipe(0,0,50,100,50);assert.equal(g2.state.score,sc,'no swipe lands during the beat');
});
ok('specials: golden frenzy, slow motion, the captain doubles points',()=>{
 const g=K.createKitRush({seed:3,h:160}),s=g.state;trace(g,2);const it=s.items[5];
 Object.assign(it,{active:true,kind:KIND.armband,team:-1,x:50,y:80,vx:0,vy:0,frenzy:false});g.beginStroke(0);g.swipe(0,40,80,60,80);g.endStroke(0);assert(s.armband>0);
 const base=s.score;Object.assign(it,{active:true,kind:KIND.ball,team:s.team,x:50,y:80,vx:0,vy:0,frenzy:false});g.beginStroke(0);g.swipe(0,40,80,60,80);g.endStroke(0);assert.equal(s.score-base,20,'armband doubles');
 Object.assign(it,{active:true,kind:KIND.stopwatch,team:-1,x:50,y:80,vx:0,vy:0,frenzy:false});g.beginStroke(0);g.swipe(0,40,80,60,80);g.endStroke(0);assert(s.slow>0);const t0=s.t;g.step(.04);assert(Math.abs((s.t-t0)-.04*KR.slowScale)<1e-9,'time runs slow');
 Object.assign(it,{active:true,kind:KIND.golden,team:-1,x:50,y:80,vx:0,vy:0,frenzy:false});g.beginStroke(0);g.swipe(0,40,80,60,80);g.endStroke(0);assert(s.frenzy>0);
 const ev=trace(g,3).filter(e=>e.type==='toss');assert(ev.length>8&&ev.every(e=>e.a===KIND.golden),'only golden balls in a frenzy');assert.equal(s.lives,KR.lives);
});
ok('fair for a careful player, and it does end: speed, rivals and whistles ramp',()=>{
 const g=K.createKitRush({seed:1234,h:170});trace(g,60,careful);assert(g.state.score>=KR.medals[0],'a careful minute earns Bronze: '+g.state.score);assert(g.state.level>=4);assert(g.state.nTeams>=3,'a third kit joins');
 assert.deepEqual([0,499,500,1200,2500,5000,99999].map(K.medalFor),[0,0,1,2,3,4,4]);
 assert.deepEqual(K.nextMedalLine(488),{medal:0,next:'Bronze',gap:12});assert.equal(K.nextMedalLine(6000).next,null);
});
ok('Daily Rush: one seed per day, the same for everyone',()=>{
 assert.equal(K.kitRushDailySeed('2026-11-10'),K.kitRushDailySeed('2026-11-10'));assert.notEqual(K.kitRushDailySeed('2026-11-10'),K.kitRushDailySeed('2026-11-11'));
 const run=()=>{const g=K.createKitRush({seed:K.kitRushDailySeed('2026-11-10'),h:170,daily:true});trace(g,45,careful);return g.state.score;};assert.equal(run(),run());
 assert.equal(K.kitRushFieldH(390,844),KR.fieldW*844/390);assert.equal(K.kitRushFieldH(1000,500),KR.minH);assert.equal(K.kitRushFieldH(300,900),KR.maxH);
});
ok('save: best, medal, daily first run, day streak, rotating facts, near-miss lines',()=>{
 const stats={sliced:10,missed:1,rival:1,whistle:0,bestCombo:3,bestClean:8,waves:9,switches:1,specials:0,swipes:9};
 let r=S.settleKitRush(S.emptyKitRushSave(),{score:520,daily:false,day:'2026-11-10',stats});assert(r.newBest&&r.newMedal);assert.equal(r.medal,1);assert.equal(r.save.best,520);assert.equal(r.save.plays,1);assert.equal(r.streak,0);
 let r2=S.settleKitRush(r.save,{score:300,daily:false,day:'2026-11-10',stats});assert(!r2.newBest);assert.equal(r2.save.best,520);assert.notEqual(r2.fact.title,r.fact.title,'a new fact each run');
 let d=S.settleKitRush(r2.save,{score:400,daily:true,day:'2026-11-10',stats});assert(d.dailyFirst&&d.streakUp);assert.equal(d.streak,1);assert.equal(d.save.best,520,'the daily never touches the endless best');
 let d2=S.settleKitRush(d.save,{score:900,daily:true,day:'2026-11-10',stats});assert(!d2.dailyFirst,'only the first daily run is the board run');assert.equal(d2.dailyBest,900);assert.equal(d2.streak,1);
 let d3=S.settleKitRush(d2.save,{score:100,daily:true,day:'2026-11-11',stats});assert(d3.dailyFirst);assert.equal(d3.streak,2);assert.equal(S.liveStreak(d3.save,'2026-11-12'),2,'alive until the end of the next day');assert.equal(S.liveStreak(d3.save,'2026-11-13'),0);
 let d4=S.settleKitRush(d3.save,{score:100,daily:true,day:'2026-11-14',stats});assert.equal(d4.streak,1,'a skipped day starts again');assert.equal(d4.save.streak.best,2);
 assert.equal(S.dayBefore('2026-03-01'),'2026-02-28');assert.equal(S.dayBefore('2027-01-01'),'2026-12-31');
 assert.deepEqual(S.sanitizeKitRushSave({best:'x',medal:99,daily:{day:'nope',best:-4}}),{...S.emptyKitRushSave(),medal:KR.medals.length});
 assert.equal(S.nearMissLine({score:488,best:0,newBest:true,stats,daily:false}),'12 points from Bronze');
 assert.equal(S.nearMissLine({score:1000,best:1040,newBest:false,stats,daily:false}),'200 points from Silver');
 assert.equal(S.nearMissLine({score:600,best:650,newBest:false,stats,daily:false}),'50 from your best');
 assert.match(S.nearMissLine({score:600,best:5000,newBest:false,stats,daily:false}),/one more for TIKI-TAKA/);
 assert(S.KIT_FACTS.length>=10&&S.KIT_FACTS.every(f=>f.line.length<=130&&f.title.length<=32),'facts stay short');
 assert.match(S.coachLine({...stats,whistle:2,rival:1}),/whistle/i);assert.match(S.coachLine(stats),/pattern/);
 assert(isSyncKey(S.KITRUSH_KEY),'the save travels with a save code');
});
ok('arcade wiring: cabinet, boards, coins, today, skin, routing',()=>{
 assert(arcadeCabinets.some(c=>c.id==='kitrush'&&c.name==='Kit Rush'&&c.short==='KIT RUSH'));assert(!arcadeCabinets.some(c=>c.id==='live'),'Kit Rush took the Strikers cabinet');assert.equal(arcadeCabinets.length,6);/* Nov 10 2026: Squad Snake is the sixth cabinet (tests/snake-core.cjs) */
 assert(L.isBoardGame('kitrush')&&L.isBoardGame('kitdaily')&&L.isBoardGame('live'),'old live board stays');assert.deepEqual(L.BOARD_TIER_TABS.kitrush,['kitdaily']);
 assert.equal(L.scorePlausible('kitrush',3000,60_000),'ok');assert.equal(L.scorePlausible('kitrush',30_000,20_000),'fast');assert.equal(L.scorePlausible('kitrush',300,3000),'short');assert(L.scoreInBounds('kitdaily',60_000)&&!L.scoreInBounds('kitdaily',60_001));
 // the fastest honest scoring fits the board's rate: six kits a swipe with the armband, a wave every gapFloor seconds
 const perSwipe=(10+20+30+40+50+60+6*KR.callBonus)*2;assert(perSwipe/KR.gapFloor<L.BOARD_RULES.kitrush.perSecond*3,'board rate is the right order of size');
 assert.equal(arcadeCoinTarget('kitrush',{points:449}),2);assert.equal(arcadeCoinTarget('kitrush',{points:1e6}),ARCADE_COIN_CAPS.kitrush);assert.equal(K.kitRushCoins(449),2);
 assert(T.TODAY_CABINETS.includes('kitrush')&&!T.TODAY_CABINETS.includes('live'));const c=T.todayChallenge('2026-11-10','kitrush');assert(c.line&&c.point);
 assert.equal(T.todayMet('2026-11-10',{kind:'kitrush',daily:true,day:'2026-11-10',score:9999,bestCombo:9,clean:99}),'kitrush');assert.equal(T.todayMet('2026-11-10',{kind:'kitrush',daily:false,day:'2026-11-09',score:0,bestCombo:0,clean:0}),null);
 const room=read('components/ArcadeRoom.tsx');assert(/raw==='live'\?'kitrush':raw/.test(room),'old ?game=live links open Kit Rush');assert(/game==='kitrush'\?<KitRush onExit=\{back\}\/>/.test(room));assert(!/<Strikers /.test(room),'Strikers is not reachable from the room');
 assert(fs.existsSync('components/LiveArcadeMatch.tsx')&&fs.existsSync('lib/arcade/strikerMatch.ts'),'Strikers code stays in the repo');
 assert(/kitrush:kitrush\.skin/.test(read('components/games/skins/index.ts')));assert(/data-game="kitrush"/.test(read('components/games/KitRushGame.tsx')));
 const sql=read('docs/arcade-aaa/kitrush-supabase.sql');for(const g of L.BOARD_GAMES.filter(g=>!['snake','snakedaily'/* Nov 10 2026: Squad Snake's boards come in docs/arcade-aaa/endless-supabase.sql, the one file that names every board */].includes(g)))assert(sql.includes(`'${g}'`),'SQL allow-list names '+g);
});
ok('sound: one limiter, wired to the output and nowhere else; made on the first tap',()=>{
 const a=read('lib/arcade/kitrush/audio.ts');assert.equal((a.match(/createDynamicsCompressor\(\)/g)||[]).length,1);assert(/master\.connect\(limiter\);limiter\.connect\(ctx\.destination\);/.test(a));
 assert.equal((a.match(/limiter\.connect\(/g)||[]).length,1,'the limiter has exactly one output');assert(!/\.connect\(ctx\.destination\)/.test(a.replace('limiter.connect(ctx.destination)','')),'no voice bypasses the limiter');
 assert(!/new Audio\(|\.mp3|\.ogg|\.wav|fetch\(/.test(a),'no audio files');assert(/ctx\.state==='suspended'\)void ctx\.resume\(\)/.test(a));assert(!/setInterval|setTimeout/.test(a),'no timers');
});
ok('heat: the loop lives only while playing; pools, DPR cap, reduced motion',()=>{
 const c=read('components/games/KitRushGame.tsx'),v=read('lib/arcade/kitrush/view.ts'),core=read('lib/arcade/kitrush/core.ts');
 assert(/if\(phaseRef\.current!=='playing'\|\|!g\|\|!v\)return;/.test(c));assert(/Math\.min\(2,window\.devicePixelRatio\|\|1\)/.test(c));assert(/frameCapSlot\(now,slot\.current,FRAME_MS\)/.test(c));assert(/document\.hidden\)pause\(\)/.test(c));
 assert(/getCoalescedEvents/.test(c)&&/touch-action:none/.test(read('components/games/KitRushGame.module.css')));
 assert(!/requestAnimationFrame|setInterval/.test(v)&&!/three/.test(v),'the view has no loop and no three.js');assert(!/Math\.random|Date\.now|performance\.now/.test(core),'the rules are deterministic');
 assert(/opts\.reduced/.test(v)&&/prefers-reduced-motion/.test(read('components/games/comic/comic.module.css')));
});
ok('comic kit: buttons in the UI sans at 800, 44 px, focus ring; no blur or glow',()=>{
 const css=read('components/games/comic/comic.module.css'),btn=/\.button\{[^}]*\}/.exec(css)[0];assert(/font:800 16px/.test(btn)&&/min-height:48px/.test(btn)&&/min-width:44px/.test(btn));assert(/\.button\[data-size=small\]\{min-height:44px/.test(css));assert(/\.button:focus-visible\{outline:var\(--cm-focus\)/.test(css));
 assert(!/IslandBrush[^;}]*\}?[^{]*\.button/.test(btn)&&!/IslandBrush/.test(btn),'never IslandBrush on a button');assert(!/blur\(|box-shadow:[^;]*\d+px \d+px \d+px [^0]/.test(css.replace(/backdrop-filter:none/g,'')),'hard shadows only');
 for(const t of ['#231a2e','#fff3d6','#ffc83a','#f0452e','#19b5a5','#8f78b8'])assert(css.includes(t)&&read('components/games/skins/runner.module.css').includes(t.slice(0,7)),'token '+t+' matches the runner page');
 for(const piece of ['ComicButton','ComicPanel','ComicBurst','ComicStat','ComicCard'])assert(read('components/games/comic/index.tsx').includes('export function '+piece)||read('components/games/comic/index.tsx').includes('export const '+piece),piece);
 assert(fs.existsSync('components/games/comic/README.md'));assert(/"test":.*tests\/kitrush-core\.cjs/.test(read('package.json')),'in the core test chain');
});
console.log(`kitrush-core: ${n} groups passed`);
