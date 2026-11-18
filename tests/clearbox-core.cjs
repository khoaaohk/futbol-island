// Clear the Box (Nov 17 2026, docs/arcade-aaa/clearbox-direction.md): the seeded rules, a solver that proves every box can be
// cleared, a bot that proves the ramp, the device save and the arcade wiring. Run: node tests/clearbox-core.cjs  (--bots prints numbers)
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const K=require('../lib/arcade/clearbox/core.ts'),S=require('../lib/arcade/clearbox/save.ts');
const read=p=>fs.readFileSync(p,'utf8'),{CB,RAMP}=K;
const WIRED=process.argv.includes('--core')?false:true;
let n=0;const ok=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL: '+name);throw e;}};

/** Solver: depth-first search over the order beans leave in (turners turn each time a bean leaves; no free spins counted), with a
 *  memo of seen positions. Returns an order that clears the box, or null. */
function solve(box,limit=200000){
 const beans=box.beans.map(b=>({...b})),seen=new Set();let nodes=0;
 const key=()=>beans.map(b=>b.out?'x':b.dir).join('');
 function dfs(order){if(beans.every(b=>b.out))return order;if(++nodes>limit)return null;const k0=key();if(seen.has(k0))return null;seen.add(k0);
  for(let k=0;k<beans.length;k++){const b=beans[k];if(b.out||!K.canRun({...box,beans},b))continue;
   b.out=true;const turned=beans.filter(o=>!o.out&&o.turner);for(const o of turned)o.dir=(o.dir+1)%4;
   const r=dfs([...order,k]);for(const o of turned)o.dir=(o.dir+3)%4;b.out=false;if(r)return r;}
  return null;}
 return dfs([]);
}
/** A child-like bot: each tap takes 0.45 s plus a look along the lanes (0.03 s a bean left); it spots a free bean with chance `eye`,
 *  otherwise it taps a bean it only thinks is free (a foul when the lane is blocked). */
function play(opts,eye=.93,cap=4000){const g=K.createClearBox(opts),s=g.state,rnd=K.mulberry(opts.seed^0x5bd1e995);let taps=0;
 while(!s.over&&taps<cap){const left=s.box.beans.map((b,k)=>({b,k})).filter(o=>!o.b.out);g.tick(.45+.03*left.length);if(s.over)break;
  const free=left.filter(o=>g.canRun(o.k));const pick=free.length&&rnd()<eye?free[Math.floor(rnd()*free.length)]:left[Math.floor(rnd()*left.length)];
  g.tap(pick.k);g.drain(()=>{});taps++;}
 return g;}

ok('every generated box can be cleared: 200 seeds across levels, by its plan and by the solver',()=>{
 let turners=0,defs=0;
 for(let seed=1;seed<=200;seed++){const level=1+(seed*7)%22,rnd=K.mulberry(seed),box=K.buildBox(rnd,level),R=K.rampFor(level);
  assert.equal(box.w,R.w);assert.equal(box.h,R.h);assert.ok(box.beans.length>=Math.min(R.beans,5),'the box is crowded');
  const cells=new Set(box.beans.map(b=>b.y*box.w+b.x));assert.equal(cells.size,box.beans.length,'one bean a cell');for(const d of box.defs)assert.ok(!cells.has(d),'no bean on a defender');
  turners+=box.beans.filter(b=>b.turner).length;defs+=box.defs.length;
  // the plan (the build order reversed) clears it through the real rules with no foul
  const g=K.createClearBox({seed:1,fixLevel:level});g.state.box=JSON.parse(JSON.stringify(box));g.state.clock=999;
  for(const k of box.plan)assert.equal(g.tap(k),'run',`seed ${seed} level ${level}: the plan never fouls`);
  assert.equal(g.state.stats.boxes,1,'and clears the box');
  assert.ok(solve(box),`seed ${seed} level ${level}: the solver finds a way out`);
 }
 assert.ok(turners>50&&defs>50,'turners and defenders appear in the sample');
});
ok('the solver is real: a head-to-head pair is refused',()=>{
 const box={w:3,h:1,level:1,defs:[],time:30,plan:[],beans:[{id:0,x:0,y:0,dir:1,turner:false,kit:0,out:false},{id:1,x:1,y:0,dir:3,turner:false,kit:0,out:false}]};
 assert.equal(solve(box),null);box.beans[1].dir=1;assert.deepEqual(solve(box),[1,0]);
});
ok('same seed, same boxes and same run; the daily seed is one per day',()=>{
 const sig=g=>g.state.box.beans.map(b=>`${b.x},${b.y},${b.dir},${b.turner?1:0}`).join(';');
 assert.equal(sig(K.createClearBox({seed:42})),sig(K.createClearBox({seed:42})));assert.ok([43,44,45].some(x=>sig(K.createClearBox({seed:x}))!==sig(K.createClearBox({seed:42}))));
 const a=play({seed:9}),b=play({seed:9});assert.equal(a.state.score,b.state.score);assert.equal(a.state.level,b.state.level);
 assert.equal(K.clearboxDailySeed('2026-11-17'),K.clearboxDailySeed('2026-11-17'));assert.notEqual(K.clearboxDailySeed('2026-11-17'),K.clearboxDailySeed('2026-11-18'));
});
ok('tapping: a clear lane runs out and scores, a blocked lane is a foul that costs a whistle, three fouls end the run',()=>{
 const g=K.createClearBox({seed:5}),s=g.state,bx=s.box;const k=bx.plan[0];assert.equal(g.tap(k),'run');const ev=[];g.drain(e=>ev.push(e));
 const run=ev.find(e=>e.type==='run');assert.ok(run&&run.bean===k&&run.points===CB.beanPts);assert.equal(s.score,CB.beanPts);assert.equal(g.tap(k),null,'gone');
 // make a foul: put a bean right in front of another
 const b=s.box.beans.find(o=>!o.out);const blocked=s.box.beans.find(o=>!o.out&&o!==b&&!g.canRun(s.box.beans.indexOf(o)));
 const fouler=blocked?s.box.beans.indexOf(blocked):-1;assert.ok(fouler>=0,'the first box has a blocked bean');
 assert.equal(g.tap(fouler),'foul');g.drain(e=>ev.push(e));const f=ev.find(e=>e.type==='foul');assert.ok(f&&f.cell>=0,'the bump cell');assert.equal(s.whistles,2);assert.equal(s.box.beans[fouler].out,false,'the bean comes back');
 assert.equal(s.clean,0);g.tap(fouler);g.tap(fouler);assert.ok(s.over);assert.equal(s.overWhy,'fouls');assert.equal(g.tap(bx.plan[1]),null,'nothing after the end');
});
ok('box clear: time bonus, clean streak, a whistle back after three clean boxes, and the next box at once (no dead time)',()=>{
 const g=K.createClearBox({seed:12}),s=g.state;s.whistles=2;let lastBox=0;
 for(let box=1;box<=3;box++){const plan=s.box.plan.slice();g.tick(CB.grace+3.2);const pre=s.score;for(const k of plan)g.tap(k);const ev=[];g.drain(e=>ev.push(e));
  const done=ev.find(e=>e.type==='box');assert.ok(done,'box '+box+' cleared');assert.equal(done.a,Math.floor(K.rampFor(box).time-3.2),'whole seconds left');
  const lf=K.levelFactor(box);assert.equal(done.points,Math.round((Math.round(CB.boxPts*lf)+done.a*CB.secPts)*K.streakFactor(box)));assert.ok(s.score>pre+done.points-1);
  assert.equal(s.level,box+1,'the next box is already here');assert.equal(s.clock,K.rampFor(box+1).time);assert.equal(s.grace,CB.grace);lastBox=done.points;
  if(box===3)assert.ok(ev.some(e=>e.type==='whistleBack')&&s.whistles===3,'three clean boxes win a whistle back');}
 assert.ok(lastBox>0);
});
ok('the clock: waits while a box slides in, then runs out and ends the run',()=>{
 const g=K.createClearBox({seed:3}),s=g.state;g.tick(CB.grace);assert.equal(s.clock,K.rampFor(1).time,'the grace is free');g.tick(10);assert.equal(s.clock,K.rampFor(1).time-10);
 g.tick(99);assert.ok(s.over);assert.equal(s.overWhy,'clock');const ev=[];g.drain(e=>ev.push(e));assert.equal(ev.find(e=>e.type==='over').b,1);
});
ok('turners turn a quarter each time a bean leaves; a stuck box spins its turners for free',()=>{
 const g=K.createClearBox({seed:21,fixLevel:9}),s=g.state;const t=s.box.beans.findIndex(b=>b.turner);assert.ok(t>=0,'level 9 has turners');
 const d0=s.box.beans[t].dir,first=s.box.plan.find(k=>k!==t);g.tap(first);assert.equal(s.box.beans[t].dir,(d0+1)%4);
 // spin: a turner in the middle with defenders above and to the right; after bean 1 leaves it turns up (blocked), spins right
 // (blocked), spins down (free)
 const box={w:3,h:3,level:9,defs:[1,5],time:30,plan:[],beans:[{id:0,x:1,y:1,dir:3,turner:true,kit:0,out:false},{id:1,x:0,y:2,dir:3,turner:false,kit:1,out:false}]};
 g.state.box=box;g.state.over=false;g.tap(1);const ev=[];g.drain(e=>ev.push(e.type));assert.ok(ev.includes('turn'));assert.ok(ev.includes('spin'),'a free spin when nobody can run');assert.ok(g.canRun(0));
});
ok('the ramp is a table that only ever gets harder, and keeps going after it',()=>{
 for(let i=1;i<RAMP.length;i++){const a=RAMP[i-1],b=RAMP[i];assert.ok(b.beans>a.beans,'more beans');assert.ok(b.w*b.h>=a.w*a.h,'a box as big or bigger (longer lanes)');
  assert.ok(b.defs>=a.defs&&b.turn>=a.turn&&b.tangle>=a.tangle,'more defenders, turners, tangle');assert.ok(b.time<=a.time,'a clock as short or shorter');}
 assert.equal(RAMP[3].turn,0);assert.ok(RAMP[4].turn>0,'turners from box 5');
 for(let L=RAMP.length;L<60;L++){const a=K.rampFor(L),b=K.rampFor(L+1);assert.ok(b.beans>=a.beans&&b.time<=a.time&&b.turn>=a.turn);}
 assert.ok(K.rampFor(40).time<K.rampFor(10).time&&K.rampFor(40).beans>K.rampFor(10).beans,'still harder after the table');assert.equal(K.rampFor(200).time,9);
});
ok('bots: a later box is harder (held levels clear less often) and every run ends',()=>{
 const seeds=Array.from({length:40},(_,i)=>2000+i),med=a=>a.slice().sort((x,y)=>x-y)[a.length>>1];
 const rate=level=>{let cleared=0,tried=0;for(const seed of seeds){const g=K.createClearBox({seed,fixLevel:level}),s=g.state;const r=play({seed,fixLevel:level},.93,400);tried++;if(r.state.stats.boxes>=1)cleared++;void s;}return cleared/tried;};
 const boxesAt=level=>med(seeds.map(seed=>play({seed,fixLevel:level},.93,600).state.stats.boxes));
 const b1=boxesAt(1),b6=boxesAt(6),b12=boxesAt(12),b20=boxesAt(20);
 assert.ok(b1>b6&&b6>b12&&b12>=b20,`held at a level, a bot clears fewer boxes the later it is (${b1} / ${b6} / ${b12} / ${b20})`);
 assert.ok(rate(1)>rate(20),'and finishes the first box less often');
 const runs=seeds.map(seed=>play({seed}).state);assert.ok(runs.every(s=>s.over),'every endless run ends on its own');
 const boxes=runs.map(s=>s.stats.boxes),scores=runs.map(s=>s.score),secs=runs.map(s=>s.elapsed);
 assert.ok(Math.max(...boxes)<60,'and not after an endless time');assert.ok(med(boxes)>=4,`a careful player gets a real run (median ${med(boxes)} boxes)`);
 assert.ok(runs.some(s=>s.overWhy==='clock')&&runs.some(s=>s.overWhy==='fouls'),'runs end both ways');
 const sharp=seeds.map(seed=>play({seed},.995).state);assert.ok(sharp.every(s=>s.over),'even a near-perfect bot runs out of clock');
 if(process.argv.includes('--bots'))console.log(JSON.stringify({b1,b6,b12,b20,rate1:rate(1),rate20:rate(20),medianBoxes:med(boxes),medianScore:med(scores),maxScore:Math.max(...scores),sharpMedian:med(sharp.map(s=>s.score)),sharpBoxes:med(sharp.map(s=>s.stats.boxes)),maxRate:Math.max(...[...runs,...sharp].map(s=>s.score/Math.max(1,s.elapsed))),medals:CB.medals,secs:med(secs)}));
 assert.ok(med(scores)>=CB.medals[0]*.6,'the bot median is near Bronze');assert.ok(med(sharp.map(s=>s.score))>=CB.medals[1],'a sharp player reaches Silver');
 if(WIRED){const L=require('../lib/arcade/leaderboard.ts'),R=L.BOARD_RULES.clearbox;for(const s of [...runs,...sharp])assert.ok(s.score<=R.base+R.perSecond*s.elapsed,`board rate holds (${s.score} in ${s.elapsed.toFixed(0)} s)`);}
});
ok('device save: best, medal, daily claim and day streak, near-miss and coach lines',()=>{
 const stats={beans:40,boxes:4,fouls:1,cleanBoxes:3,bestClean:2,fastest:9,taps:41,turners:1};
 let st=S.settleClearbox(S.emptyClearboxSave(),{score:2600,daily:false,day:'2026-11-17',stats,level:5});assert.ok(st.newBest&&st.newMedal);assert.equal(st.save.best,2600);assert.equal(st.save.medal,1);assert.equal(st.save.boxes,4);
 st=S.settleClearbox(st.save,{score:900,daily:true,day:'2026-11-17',stats,level:2});assert.ok(st.dailyFirst);assert.equal(st.save.best,2600,'a daily run does not touch the endless best');assert.equal(st.streak,1);
 const again=S.settleClearbox(st.save,{score:1000,daily:true,day:'2026-11-17',stats,level:2});assert.equal(again.dailyFirst,false,'later daily runs are practice');assert.equal(again.dailyBest,1000);
 const next=S.settleClearbox(again.save,{score:10,daily:true,day:'2026-11-18',stats,level:1});assert.equal(next.streak,2,'a day in a row');assert.equal(S.liveStreak(next.save,'2026-11-20'),0,'a missed day ends it');
 assert.equal(S.sanitizeClearboxSave({best:-5,medal:99,daily:{day:'x'}}).best,0);assert.equal(S.sanitizeClearboxSave({medal:99}).medal,3);
 assert.match(S.nearMissLine({score:2450,best:0,newBest:true,daily:false,stats}),/50 points from Bronze/);assert.match(S.nearMissLine({score:900,best:1000,newBest:false,daily:false,stats}),/100 points from your best/);
 assert.match(S.coachLine(stats,'clock'),/clock/);assert.ok(S.CLEARBOX_TIPS.length>=5);
});
if(WIRED){
ok('arcade wiring: last in the back row, board, coins, save key, last score, room route, analytics, SQL',()=>{
 const L=require('../lib/arcade/leaderboard.ts'),{arcadeCabinets,ARCADE_ROW}=require('../lib/arcade/arcadeCatalog.ts'),{arcadeCoinTarget}=require('../lib/arcade/arcadeWalletCore.ts'),{ARCADE_COIN_CAPS}=require('../lib/economy.ts');
 const {isSyncKey}=require('../lib/saves/snapshot.ts'),{LAST_SCORE_GAMES}=require('../lib/arcade/lastScore.ts');
 const cab=arcadeCabinets.find(c=>c.id==='clearbox');assert.ok(cab,'a cabinet');assert.equal(ARCADE_ROW[ARCADE_ROW.length-1],'clearbox','appended to the end of the row');assert.equal(cab.lesson,'Time your run. Make the space.');
 assert.equal(cab.z,-10);assert.equal(cab.yaw,0);
 assert.ok(L.BOARD_GAMES.includes('clearbox')&&L.HALL_MACHINES.includes('clearbox'),'one all-time board, in the Hall');assert.equal(L.BOARD_TIER_TABS.clearbox,undefined,'no second (daily) board');
 assert.equal(arcadeCoinTarget('clearbox',{points:4000}),10);assert.equal(arcadeCoinTarget('clearbox',{points:1e6}),ARCADE_COIN_CAPS.clearbox);
 assert.ok(isSyncKey('fi2-clearbox-v1'),'the save travels with the player');assert.ok(LAST_SCORE_GAMES.includes('clearbox')&&LAST_SCORE_GAMES.includes('clearbox_daily'));
 const room=read('components/ArcadeRoom.tsx');assert.match(room,/import\('\.\/games\/ClearBoxGame'\)/);assert.match(room,/game==='clearbox'\?<ClearBox onExit=\{back\}\/>/);
 assert.match(read('lib/analytics/islandIds.ts'),/'lineup','clearbox'\]/);assert.match(read('lib/analytics/islandIds.ts'),/\['arcade_clearbox','Arcade: Clear the Box'\]/);
 assert.match(read('components/arcade/HighScoreEntry.tsx'),/'clearbox'/,'results-first high-score strip');assert.match(read('components/games/skins/index.ts'),/clearbox:clearbox\.skin/);
 const sql=read('docs/arcade-aaa/clearbox-supabase.sql'),list=/check \(game in \(([^)]*)\)\)/.exec(sql.replace(/--.*$/gm,''))[1].split(',').map(v=>v.trim().replace(/'/g,''));assert.deepEqual(list,[...L.BOARD_GAMES],'the owner file names every board');
 assert.match(sql,/between 1 and 9000000/);assert.match(sql,/'lineup', 'clearbox'\)\);/);assert.match(sql,/'arcade_airhockey','arcade_lineup','arcade_clearbox',/,'a superset of the Line Up! file');assert.match(sql.trim().split('\n').pop(),/as missing\) x;$/);
 assert.match(read('supabase/migrations/20261128_analytics_clearbox.sql'),/'arcade_clearbox'/);{const mig=read('supabase/migrations/20261127_clearbox_boards.sql');for(const g of L.BOARD_GAMES)assert.ok(mig.includes(`'${g}'`),'migration names '+g);}
 const shell=read('components/games/ClearBoxGame.tsx');assert.match(shell,/beginBoardSession\('clearbox'\)/);assert.match(shell,/!r\.daily\|\|settled\.dailyFirst/,'only the first daily run posts');
 assert.match(shell,/data-clearbox-daily/,'the daily challenge is offered on the start card');
});
ok('sound: one limiter wired to the output only; made on the first tap; no loops',()=>{
 const a=read('lib/arcade/clearbox/audio.ts');assert.match(a,/master\.connect\(limiter\);limiter\.connect\(ctx\.destination\);/);assert.equal((a.match(/limiter\.connect\(/g)||[]).length,1);
 assert.doesNotMatch(a,/setInterval|setTimeout|loop\s*=\s*true/);assert.match(a,/function unlock\(\)/);
 const shell=read('components/games/ClearBoxGame.tsx');assert.match(shell,/\(audio\.current\?\?=createClearboxAudio\(\)\)\.unlock\(\)/);
});
ok('heat and input: canvas drawn only when something moves, DPR cap 2, reduced motion, pooled dust, keys',()=>{
 const shell=read('components/games/ClearBoxGame.tsx'),view=read('lib/arcade/clearbox/view.ts');
 assert.match(shell,/Math\.min\(2,window\.devicePixelRatio\|\|1\)/);assert.match(shell,/prefers-reduced-motion/);assert.match(shell,/if\(busy\|\|dirty\.current\)/,'the canvas repaints only when it must');
 assert.match(shell,/ArrowLeft:\[-1,0\]/);assert.match(view,/dust:Puff\[\]=Array\.from\(\{length:48\}/,'pooled dust');assert.match(view,/sprites\.get\(key\)/,'beans drawn once per kit, facing and size');
});
}
console.log(`clearbox-core: ${n} checks passed`);
