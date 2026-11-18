// Street Dash (Nov 17 2026, docs/arcade-aaa/streetdash-direction.md): the seeded side-view run. Determinism per seed, frame-rate
// independence (fixed 1/120 s steps), fairness (a perfect bot runs 3,000 m on 30 seeds at every speed tier), the reaction window,
// a sloppy bot always ends, the ramp only gets harder, the daily seed is shared, the device save, the arcade wiring and the sound.
//   node tests/streetdash-core.cjs [--bots]   (--bots prints the bot numbers the medals and the board rate come from)
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const K=require('../lib/arcade/streetdash/core.ts'),{SD,HZ,CHUNKS,rampAt}=K,STEP=SD.step,BOTS=process.argv.includes('--bots');
const TRACE=process.env.SDTRACE?process.env.SDTRACE.split(',').map(Number):null;
const read=p=>fs.readFileSync(p,'utf8');
let n=0;const MAIN=require.main===module,ok=(name,fn)=>{if(!MAIN)return;const t0=Date.now();fn();n++;if(BOTS)console.log(`  ${name} (${Date.now()-t0} ms)`);};

/* ---- bots ---- */
/** One tick: scheduled presses, then one fixed step. */
function tick(g,d){if(d.rel===0)g.press('release');if(d.rel>=0)d.rel--;g.advance(STEP);g.drain(()=>{});}
function act(g,d,k,hold){g.press(k);if(k==='jump')d.rel=hold;}
/** With no input from here: the step, x and hazard kind of the first hit (or null within `max` steps). Leaves the run where it was. */
function firstHit(g,max){const snap=g.snapshot(),s=g.state,h0=s.hits,d={rel:-1};let r=null,kind=0;
 for(let i=1;i<=max;i++){if(d.rel===0)g.press('release');g.advance(STEP);g.drain(e=>{if(e.type==='hit'||e.type==='oops')kind=e.kind;});if(s.hits!==h0||s.over){r={i,x:s.bean.x,kind};break;}}g.restore(snap);return r;}
const J=[['jump',1],['jump',10],['jump',18],['jump',32]],SLIDE=['slide',0],VOLLEY=['volley',0];
/** moves worth trying first for what is coming (any move still gets tried) */
const movesFor=k=>k===HZ.banner?[SLIDE,...J]:k===HZ.crate||k===HZ.gate?[VOLLEY,...J,SLIDE]:k===0?[J[3],J[2],J[1],J[0],SLIDE]:[...J,VOLLEY,SLIDE];
/** The latest moment and the move that gets past the hit at x without being hit (searched on copies of the run): a coarse sweep
 *  back from the hit (every 4 steps), then every step if that finds nothing. */
function findPlan(g,steps,hx,kind){const s=g.state,h0=s.hits,base=g.snapshot(),moves=movesFor(kind),at=[];
 {const d={rel:-1};for(let i=0;i<steps;i++){at.push(i%4===(steps-2)%4||i===0?g.snapshot():null);tick(g,d);}g.restore(base);}// the run idles to the coarse moments once
 const from=delay=>{let j=delay;while(!at[j])j--;g.restore(at[j]);const d={rel:-1};for(;j<delay;j++)tick(g,d);};
 const tryAt=(delay,k,hold)=>{from(delay);const d={rel:-1};act(g,d,k,hold);
  for(let i=0;i<260;i++){tick(g,d);if(s.hits!==h0||s.over)return false;if(s.bean.x>hx+3&&s.bean.ground)break;}return true;};
 for(const stride of [4,1])for(let delay=Math.max(0,steps-2);delay>=0;delay-=stride){
  for(const [k,hold] of moves){if(k==='volley'){from(delay);if(s.aim<0)continue;}if(tryAt(delay,k,hold)){g.restore(base);return {delay,k,hold};}}}
 g.restore(base);return null;}
/** skill 1 = the perfect bot. Lower: some hazards are missed (no reaction) and timing wobbles. */
function playBot(opts,{metres=3000,skill=1,seed=7,maxSteps=4e6}={}){
 const g=K.createStreetDash(opts),s=g.state,d={rel:-1};let next=0,plan=null,step=0,fails=0,why='';let r=seed>>>0||1;const rnd=()=>{r=(r*1664525+1013904223)>>>0;return r/4294967296;};
 while(!s.over&&s.dist<metres&&step<maxSteps){
  if(plan){if(plan.delay<=0){act(g,d,plan.k,plan.hold);next=step+(plan.k==='jump'?plan.hold+2:2);plan=null;}else plan.delay--;}
  else if(step>=next&&d.rel<0){const hit=firstHit(g,150);
   if(!hit)next=step+90;
   else if(skill<1&&rnd()>skill){next=step+hit.i+40;}// not seen in time: the hit lands
   else{plan=findPlan(g,hit.i,hit.x,hit.kind);if(!plan){fails++;if(!why)why=`at ${hit.x.toFixed(1)} in ${hit.i} steps, bean y ${s.bean.y.toFixed(2)} ground ${s.bean.ground}: `+s.haz.filter(z=>z.on&&Math.abs(z.x-hit.x)<6).map(z=>K.HZ_NAME[z.kind]+'@'+z.x.toFixed(1)+(z.soft?'(soft)':'')).join(' ')+' | ground '+s.segs.filter(q=>q.on&&q.x1>hit.x-8&&q.x0<hit.x+8).map(q=>`${q.x0.toFixed(1)}-${q.x1.toFixed(1)}@${q.y}${q.amp?'~':''}`).join(' ');next=step+hit.i+40;}else{if(skill<1)plan.delay=Math.max(0,plan.delay+Math.round((rnd()-.5)*(1-skill)*40));continue;}}}
  if(TRACE&&step%1===0&&(plan||step===next-1)&&s.dist>TRACE[0]&&s.dist<TRACE[1])console.log(step,s.bean.x.toFixed(2),s.bean.y.toFixed(2),s.bean.ground,JSON.stringify(plan),next);
  tick(g,d);step++;}
 return {g,s,fails,why,steps:step,secs:step*STEP};}

/** Every hazard and ground piece generated along `metres` of street (the bean is carried forward, unhurt). */
function scan(seed,tier,metres){const g=K.createStreetDash({seed,fixTier:tier}),s=g.state,seen=new Map();
 while(s.bean.x<metres){for(const z of s.haz)if(z.on&&!seen.has(z.id))seen.set(z.id,{kind:z.kind,x:z.x,w:z.w,trig:z.trig,run:z.run,u:-z.vx,theme:z.theme});
  for(const sg of s.segs)if(sg.on&&!seen.has('g'+sg.id))seen.set('g'+sg.id,{gap:sg.x0});s.bean.x+=1;s.bean.y=0;s.bean.ground=true;g.advance(STEP);s.hits=0;s.invuln=1;s.hearts=3;s.over=false;}
 return seen;}
/* ---- checks ---- */
module.exports={playBot,scan,firstHit,findPlan,K};// the bots, for a debugging script (required, the checks below do not run)
ok('patterns: at least 18 hand-made chunks, every hazard kind used, the three backdrops',()=>{
 assert.ok(CHUNKS.length>=18,`${CHUNKS.length} chunks`);assert.equal(new Set(CHUNKS.map(c=>c.id)).size,CHUNKS.length);
 const kinds=new Set();for(const o of scan(3,6,3000).values())if(o.kind)kinds.add(o.kind);for(const o of scan(4,2,3000).values())if(o.kind)kinds.add(o.kind);
 for(const k of Object.values(HZ))assert.ok(kinds.has(k),'kind '+k+' appears');
 assert.deepEqual([...K.THEMES],['street','roofs','beach']);assert.equal(K.themeAt(0),0);assert.equal(K.themeAt(SD.themeM+1),1);assert.equal(K.themeAt(SD.themeM*2+1),2);assert.equal(K.themeAt(SD.themeM*3+1),0);
 {let peak={segs:0,haz:0,stars:0};const g=K.createStreetDash({seed:8,fixTier:6}),st=g.state;for(let i=0;i<120*300;i++){st.bean.x+=.1;st.bean.y=0;st.bean.ground=true;g.advance(STEP);st.invuln=1;st.over=false;for(const key of ['segs','haz','stars'])peak[key]=Math.max(peak[key],st[key].filter(o=>o.on).length);}
  for(const key of ['segs','haz','stars'])assert.ok(peak[key]<=K.POOL[key]*.75,`pool ${key}: peak ${peak[key]} of ${K.POOL[key]}`);}
 for(const id of ['gap','wall','tackle','tackle2','puddle','dog','crate','gate','goal','mover','steps','windGap','banner'])assert.ok(CHUNKS.some(c=>c.id===id),'chunk '+id);
});
ok('same seed, same run; another seed, another street; the daily seed is one per day for everyone',()=>{
 const run=seed=>{const b=playBot({seed},{metres:500});return [b.s.score,b.s.bean.x.toFixed(6),b.s.stats.volleys,b.s.hits].join();};
 assert.equal(run(42),run(42));
 const layout=seed=>{const g=K.createStreetDash({seed,fixTier:3});return g.state.haz.filter(z=>z.on).map(z=>z.kind+':'+z.x.toFixed(2)).join();};
 assert.equal(layout(42),layout(42));assert.ok([43,44,45].some(x=>layout(x)!==layout(42)));
 assert.equal(K.streetdashDailySeed('2026-11-17'),K.streetdashDailySeed('2026-11-17'));assert.notEqual(K.streetdashDailySeed('2026-11-17'),K.streetdashDailySeed('2026-11-18'));
 assert.equal(layout(K.streetdashDailySeed('2026-11-17')),layout(K.streetdashDailySeed('2026-11-17')),'the daily street is the same on every device');
});
ok('frame-rate independence: 30, 60 and 144 fps with the same inputs give the same run (fixed 1/120 s steps)',()=>{
 const inputs=[[1.0,'jump'],[1.18,'release'],[2.4,'slide'],[3.3,'jump'],[3.31,'release'],[4.1,'volley'],[5.0,'jump'],[5.25,'release'],[5.4,'slide'],[7.7,'jump'],[7.75,'release']];
 const run=fps=>{const g=K.createStreetDash({seed:9});let i=0;
  for(let f=1;f<=9*fps;f++){const end=f/fps;while(i<inputs.length&&inputs[i][0]<end){g.advance(inputs[i][0]-g.clock);g.press(inputs[i][1]);i++;}g.advance(end-g.clock);g.drain(()=>{});}
  const s=g.state;return [s.t.toFixed(4),s.bean.x.toFixed(5),s.bean.y.toFixed(5),s.score,s.hits,s.stats.jumps,s.stats.slides].join();};
 const a=run(30),b=run(60),c=run(144);assert.equal(a,b);assert.equal(b,c);
});
ok('controls: variable jump, coyote time, a buffered jump, slide under, fast fall, volley at the feet',()=>{
 const flat=()=>{const g=K.createStreetDash({seed:5,fixTier:0});for(const z of g.state.haz)z.on=false;for(const s of g.state.segs)if(s.on){s.x0=-100;s.x1=1e4;s.y=0;s.amp=0;}return g;};
 const apex=hold=>{const g=flat(),s=g.state;g.press('jump');let top=0,steps=0;for(let i=0;i<200;i++){if(i===hold)g.press('release');g.advance(STEP);top=Math.max(top,s.bean.y);if(i>2&&s.bean.ground){steps=i;break;}}return {top,steps};};
 const tap=apex(1),full=apex(60);assert.ok(tap.top>1.25&&tap.top<1.5,`a tap clears a low wall (${tap.top.toFixed(2)} m)`);assert.ok(full.top>2.3&&full.top>tap.top+.8,`holding goes higher (${full.top.toFixed(2)} m)`);assert.ok(full.steps>tap.steps);
 // coyote: walk off a ledge and press 80 ms later: still a jump
 {const g=flat(),s=g.state;for(const sg of s.segs)if(sg.on)sg.x1=s.bean.x+.5;let off=-1;for(let i=0;i<120;i++){g.advance(STEP);if(!s.bean.ground&&off<0)off=i;if(off>=0&&i===off+9){g.press('jump');}if(s.bean.vy>5)break;}assert.ok(s.bean.vy>5,'a jump just after the edge still goes');}
 // buffer: press 100 ms before landing
 {const g=flat(),s=g.state;g.press('jump');g.press('release');let pressed=false,jumps=0;for(let i=0;i<200;i++){if(!pressed&&!s.bean.ground&&s.bean.vy<0&&s.bean.y<SD.jumpV*.1*.55){g.press('jump');g.press('release');pressed=true;}g.advance(STEP);g.drain(e=>{if(e.type==='jump')jumps++;});}assert.equal(jumps,2,'the early press jumps on landing');}
 // slide: low, then up again; fast fall in the air
 {const g=flat(),s=g.state;g.press('slide');g.advance(STEP*2);assert.ok(s.bean.slide>0);g.advance(SD.slide+.05);assert.ok(s.bean.slide<=0);
  g.press('jump');g.advance(.15);const vy=s.bean.vy;g.press('slide');g.advance(STEP*2);assert.ok(s.bean.vy<Math.min(vy,-5),'swipe down in the air falls fast');let slid=false;for(let i=0;i<120;i++){g.advance(STEP);if(s.bean.ground&&s.bean.slide>0)slid=true;}assert.ok(slid,'and slides on landing');}
 // volley: a crate ahead, the ball at the feet: it breaks and scores
 {const g=flat(),s=g.state,z=s.haz[0];Object.assign(z,{on:true,kind:HZ.crate,x:s.bean.x+5,y:0,w:.9,h:.95,vx:0,spent:false,done:false,teach:0,soft:false});g.advance(STEP);assert.ok(s.aim===0,'the crate is a target');
  g.press('volley');const ev=[];for(let i=0;i<100;i++){g.advance(STEP);g.drain(e=>ev.push(e.type));}assert.ok(ev.includes('volley')&&ev.includes('crate'));assert.equal(s.hits,0,'no hit: the crate is gone');assert.equal(s.ball.mode,0,'the ball came back');assert.equal(s.streak,1);}
});
ok('hits: a heart and the ball lost, a blink of safety, the ball rolls back, three hits end the run; the lessons cost no heart',()=>{
 const g=K.createStreetDash({seed:2}),s=g.state,ev=[];let i=0;while(!s.over&&i++<120*120){g.advance(STEP);g.drain(e=>ev.push({...e}));}
 assert.ok(s.over&&s.hearts===0);const hits=ev.filter(e=>e.type==='hit');assert.equal(hits.length,SD.hearts);assert.ok(ev.filter(e=>e.type==='oops').length>=1,'the soft lessons');
 assert.deepEqual(ev.filter(e=>e.type==='teach').map(e=>e.word),['JUMP!','SLIDE!','SHOOT!'],'one word per lesson');
 const tFirst=ev.findIndex(e=>e.type==='teach');assert.ok(tFirst>=0);
 // the first 20 seconds are lessons: no graded pattern starts before ~120 m
 const g2=K.createStreetDash({seed:2});let early=0;for(const z of g2.state.haz)if(z.on&&!z.soft&&z.x<110)early++;assert.equal(early,0,'only lessons in the first 110 m');
});
ok('the ramp only gets harder: speed, unlocked grades, pull to hard patterns, less open street; it keeps creeping after the cap',()=>{
 let prev=rampAt(0);for(let L=.1;L<=20;L+=.1){const r=rampAt(L);assert.ok(r.speed>=prev.speed-1e-9&&r.maxK>=prev.maxK&&r.bias>=prev.bias&&r.space<=prev.space+1e-9&&r.sc>=prev.sc,`level ${L.toFixed(1)}`);prev=r;}
 assert.equal(rampAt(0).speed,SD.v0);assert.equal(rampAt(SD.capLevel).speed,SD.vCap);assert.ok(rampAt(12).bias>rampAt(6).bias,'the mix still shifts after the speed cap');
 assert.ok(rampAt(SD.capLevel).space*SD.vCap>=SD.react*SD.vCap,'open street never shorter than the reaction window');
 assert.ok(CHUNKS.some(c=>c.k===3)&&CHUNKS.filter(c=>c.k===0).length>=5);
});
ok('reaction window: two hazards are never closer than 0.45 s at the speed they are met (30 seeds, every tier)',()=>{
 for(let tier=0;tier<SD.tiers;tier++)for(let seed=1;seed<=30;seed++){const seen=scan(seed,tier,1500);
  // obstacles in x order, a moving one where the bean meets it
  const v=rampAt(tier).speed,list=[...seen.values()].filter(o=>o.gap===undefined).map(o=>{const m=o.u?Math.min(o.run,o.u*(o.trig-o.w)/(v+o.u)):0;return {a:o.x-m,b:o.x-m+o.w};}).sort((p,q)=>p.a-q.a);
  for(let i=1;i<list.length;i++){const gap=(list[i].a-list[i-1].b)/v;assert.ok(gap>=SD.react-1e-6,`tier ${tier} seed ${seed}: ${gap.toFixed(2)} s between hazards at ${list[i].a.toFixed(1)}`);}}
});
const SEEDS=Array.from({length:30},(_,i)=>101+i*7);
ok('fairness: the perfect bot runs 3,000 m without a hit on 30 seeds at every speed tier',()=>{
 for(let tier=0;tier<SD.tiers;tier++){let worst=null;for(const seed of SEEDS){const b=playBot({seed,fixTier:tier},{metres:3000});
   if(b.s.hits||b.fails){worst={seed,hits:b.s.hits,fails:b.fails,at:Math.round(b.s.dist),why:b.why};break;}
   assert.ok(b.s.dist>=3000);}
  assert.equal(worst,null,`tier ${tier} (${rampAt(tier).speed.toFixed(1)} m/s): ${JSON.stringify(worst)}`);
  if(BOTS)console.log(`    tier ${tier}: ${rampAt(tier).speed.toFixed(2)} m/s, 30 seeds x 3000 m clean`);}
});
ok('free runs: the perfect bot also gets through the lessons and the ramp; a sloppy bot always ends; medals sit on bot runs',()=>{
 const med=a=>a.slice().sort((x,y)=>x-y)[a.length>>1];
 const perfect=SEEDS.slice(0,10).map(seed=>playBot({seed},{metres:3000}));for(const b of perfect)assert.equal(b.s.hits+b.fails,0,'clean free run '+b.s.seed);
 const sloppy=SEEDS.map((seed,i)=>playBot({seed},{metres:1e6,skill:.8,seed:i+1,maxSteps:120*60*40}));assert.ok(sloppy.every(b=>b.s.over),'every sloppy run ends');
 const good=SEEDS.map((seed,i)=>playBot({seed},{metres:1e6,skill:.95,seed:i+50,maxSteps:120*60*60}));assert.ok(good.every(b=>b.s.over),'a good bot ends too');
 const sl=sloppy.map(b=>b.s.score),gd=good.map(b=>b.s.score),pf=perfect.map(b=>b.s.score);
 if(BOTS)console.log(JSON.stringify({sloppyMedian:med(sl),sloppyMax:Math.max(...sl),sloppyDist:med(sloppy.map(b=>Math.round(b.s.dist))),goodMedian:med(gd),goodMax:Math.max(...gd),goodDist:med(good.map(b=>Math.round(b.s.dist))),perfect3000:med(pf),
  rate:Math.max(...[...sloppy,...good,...perfect].map(b=>b.s.score/b.secs)).toFixed(1),medals:SD.medals}));
 assert.ok(med(sl)>=SD.medals[0]*.5&&med(sl)<SD.medals[1],'a sloppy player is around Bronze');assert.ok(med(gd)>=SD.medals[0],'a good player earns Bronze');
 assert.ok(med(pf)>=SD.medals[1],'a clean 3 km earns Silver at least');assert.ok(Math.max(...gd)<SD.medals[2]*3,'Gold is a stretch, not out of reach');
 const L=require('../lib/arcade/leaderboard.ts'),R=L.BOARD_RULES.streetdash;if(R)for(const b of [...sloppy,...good,...perfect])assert.ok(b.s.score<=R.base+R.perSecond*b.secs,`board rate holds (${b.s.score} in ${b.secs.toFixed(0)} s)`);
});
ok('device save: best, longest run, medal, daily claim and day streak, near-miss and coach lines',()=>{
 const S=require('../lib/arcade/streetdash/save.ts'),stats={stars:4,volleys:3,goals:1,crates:1,gates:0,near:2,hits:3,falls:0,bestStreak:2,jumps:30,slides:5,chunks:20,steals:0};
 let st=S.settleStreetdash(S.emptyStreetdashSave(),{score:900,daily:false,day:'2026-11-17',dist:600,stats});assert.ok(st.newBest&&st.newMedal);assert.equal(st.save.best,900);assert.equal(st.save.medal,1);assert.equal(st.save.far,600);
 st=S.settleStreetdash(st.save,{score:500,daily:true,day:'2026-11-17',dist:300,stats});assert.ok(st.dailyFirst);assert.equal(st.save.best,900,'a daily run does not touch the endless best');assert.equal(st.streak,1);
 const again=S.settleStreetdash(st.save,{score:700,daily:true,day:'2026-11-17',dist:400,stats});assert.equal(again.dailyFirst,false,'later daily runs are practice');assert.equal(again.dailyBest,700);
 const next=S.settleStreetdash(again.save,{score:10,daily:true,day:'2026-11-18',dist:10,stats});assert.equal(next.streak,2,'a day in a row');assert.equal(S.liveStreak(next.save,'2026-11-20'),0,'a missed day ends it');
 assert.equal(S.sanitizeStreetdashSave({best:-5,medal:99}).best,0);assert.equal(S.sanitizeStreetdashSave({medal:99}).medal,3);
 assert.match(S.nearMissLine({score:750,best:0,newBest:true,daily:false,stats}),/50 points from Bronze/);assert.match(S.nearMissLine({score:800,best:900,newBest:false,daily:false,stats}),/100 points from your best/);
 for(const k of ['fall','banner','dog','tackle','puddle','gate',''])assert.ok(S.coachLine(stats,k).length>10);assert.ok(S.STREETDASH_TIPS.length>=5);
});
ok('arcade wiring: last in the back row, board, coins, save key, last score, room route, analytics, SQL',()=>{
 const L=require('../lib/arcade/leaderboard.ts'),{arcadeCabinets,ARCADE_ROW}=require('../lib/arcade/arcadeCatalog.ts'),{arcadeCoinTarget}=require('../lib/arcade/arcadeWalletCore.ts'),{ARCADE_COIN_CAPS}=require('../lib/economy.ts');
 const {isSyncKey}=require('../lib/saves/snapshot.ts'),{LAST_SCORE_GAMES}=require('../lib/arcade/lastScore.ts');
 const cab=arcadeCabinets.find(c=>c.id==='streetdash');assert.ok(cab,'a cabinet');assert.equal(ARCADE_ROW[ARCADE_ROW.length-1],'streetdash','appended to the end of the row');assert.equal(cab.lesson,'Keep the ball close. Look up early.');assert.equal(cab.z,-10);assert.equal(cab.yaw,0);
 assert.ok(L.BOARD_GAMES.includes('streetdash')&&L.HALL_MACHINES.includes('streetdash'),'one all-time board, in the Hall');assert.equal(L.BOARD_TIER_TABS.streetdash,undefined,'no second (daily) board');
 assert.equal(arcadeCoinTarget('streetdash',{points:1000}),4);assert.equal(arcadeCoinTarget('streetdash',{points:1e6}),ARCADE_COIN_CAPS.streetdash);assert.equal(K.streetdashCoins(1000),4);
 assert.ok(isSyncKey('fi2-streetdash-v1'),'the save travels with the player');assert.ok(LAST_SCORE_GAMES.includes('streetdash')&&LAST_SCORE_GAMES.includes('streetdash_daily'));
 const room=read('components/ArcadeRoom.tsx');assert.match(room,/import\('\.\/games\/StreetDashGame'\)/);assert.match(room,/game==='streetdash'\?<StreetDash onExit=\{back\}\/>/);
 assert.match(read('lib/analytics/islandIds.ts'),/'lineup','trophydrop','clearbox','streetdash'\]/);/* Nov 17 2026 merge: after Trophy Drop and Clear the Box */assert.match(read('lib/analytics/islandIds.ts'),/\['arcade_streetdash','Arcade: Street Dash'\]/);
 assert.match(read('components/arcade/HighScoreEntry.tsx'),/'streetdash'/,'results-first high-score strip');assert.match(read('components/games/skins/index.ts'),/streetdash:streetdash\.skin/);
 assert.match(read('docs/arcade-aaa/streetdash-supabase.sql'),/^-- SUPERSEDED FOR PASTING .*new-games-supabase\.sql/,'the per-game file points at the combined owner file');{const own=read('docs/arcade-aaa/streetdash-supabase.sql');assert.match(own,/'airhockey', 'lineup', 'streetdash'\)\);/);assert.match(own,/'arcade_airhockey','arcade_lineup','arcade_streetdash',/);assert.match(own,/SUPERSET of docs\/arcade-aaa\/lineup-supabase\.sql/);assert.match(own,/OK, Street Dash board installed/);}
 /* Nov 17 2026 merge: the owner pastes ONE combined file (top 20 + Line Up! + Trophy Drop + Clear the Box + Street Dash) */const sql=read('docs/arcade-aaa/new-games-supabase.sql'),list=/check \(game in \(([^)]*)\)\)/.exec(sql.replace(/--.*$/gm,''))[1].split(',').map(v=>v.trim().replace(/'/g,''));assert.deepEqual(list,[...L.BOARD_GAMES],'the owner file names every board');
 assert.match(sql,/between 1 and 9000000/);assert.match(sql,/'lineup', 'trophydrop', 'clearbox', 'streetdash'\)\);/);assert.match(sql,/'arcade_lineup','arcade_trophydrop','arcade_clearbox','arcade_streetdash',/);assert.match(sql,/prosrc like '%arcade_streetdash%'/,'the self-check looks for the key');assert.match(sql,/'OK, new arcade games installed'/);assert.match(sql.trim().split('\n').pop(),/as missing\) x;$/);
 assert.match(read('supabase/migrations/20261130_analytics_streetdash.sql'),/'arcade_lineup','arcade_trophydrop','arcade_clearbox','arcade_streetdash'/);{const mig=read('supabase/migrations/20261129_streetdash_boards.sql');for(const g of L.BOARD_GAMES)assert.ok(mig.includes(`'${g}'`),'migration names '+g);}
 const shell=read('components/games/StreetDashGame.tsx');assert.match(shell,/beginBoardSession\('streetdash'\)/);assert.match(shell,/!r\.daily\|\|settled\.dailyFirst/,'only the first daily run posts');assert.match(shell,/data-streetdash-daily/,'the daily run is offered on the start card');
 assert.match(read('scripts/check-arcade-audio.cjs'),/game==='streetdash'/);
});
ok('sound: one limiter wired to the output only; made on the first tap; no loops',()=>{
 const a=read('lib/arcade/streetdash/audio.ts');assert.match(a,/master\.connect\(limiter\);limiter\.connect\(ctx\.destination\);/);assert.equal((a.match(/limiter\.connect\(/g)||[]).length,1);
 assert.doesNotMatch(a,/setInterval|setTimeout|loop\s*=\s*true/);assert.match(a,/function unlock\(\)/);assert.match(read('components/games/StreetDashGame.tsx'),/\(audio\.current\?\?=createStreetdashAudio\(\)\)\.unlock\(\)/);
});
ok('heat and input: one canvas, the loop only while playing, DPR cap 2, pooled effects, reduced motion, the thumb and the keys',()=>{
 const shell=read('components/games/StreetDashGame.tsx'),view=read('lib/arcade/streetdash/view.ts'),core=read('lib/arcade/streetdash/core.ts');
 assert.equal((shell.match(/<canvas /g)||[]).length,1,'one canvas');assert.match(shell,/if\(phaseRef\.current!=='playing'\|\|!g\|\|!v\)return;/,'the loop stops off the street');assert.match(shell,/Math\.min\(2,window\.devicePixelRatio\|\|1\)/);
 assert.match(shell,/Math\.min\(\.1,\(now-last\.current\)\/1000\)/,'a long frame is clamped');assert.match(shell,/prefers-reduced-motion/);assert.match(view,/const shake=\(a:number\)=>\{if\(reduced\)return;/,'no shake in reduced motion');
 assert.match(view,/parts:Part\[\]=Array\.from\(\{length:96\}/,'pooled particles');assert.match(core,/No allocation in a step/);assert.doesNotMatch(core.slice(core.indexOf('function step()'),core.indexOf('generate();\n return')),/new |\[\]|=>\{|\.map\(|\.filter\(/,'no allocation inside step()');
 assert.match(shell,/'KeyX'\|\|e\.code==='Enter'/);assert.match(shell,/'ArrowDown'\|\|e\.code==='KeyS'/);assert.match(shell,/TAP_WAIT=55/,'a touch waits 55 ms to tell a tap from a swipe');assert.match(shell,/g\.press\('jump',\(now-tc\.t\)\/1000\)/,'and the wait is handed to the core');
});
if(MAIN)console.log(`streetdash-core: ${n} checks passed`);
