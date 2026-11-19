// Line Up! (Nov 17 2026, docs/arcade-aaa/lineup-direction.md): the seeded rules, a bot that proves the ramp, the device save and
// the arcade wiring. Run: node tests/lineup-core.cjs   (--bots prints the bot numbers used to set the medals)
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const K=require('../lib/arcade/lineup/core.ts'),S=require('../lib/arcade/lineup/save.ts'),L=require('../lib/arcade/leaderboard.ts');
const {arcadeCabinets,ARCADE_ROW}=require('../lib/arcade/arcadeCatalog.ts'),{arcadeCoinTarget}=require('../lib/arcade/arcadeWalletCore.ts'),{ARCADE_COIN_CAPS}=require('../lib/economy.ts');
const {isSyncKey}=require('../lib/saves/snapshot.ts'),{LAST_SCORE_GAMES}=require('../lib/arcade/lastScore.ts');
const read=p=>fs.readFileSync(p,'utf8'),{LU,RAMP,SHAPES,SHAPE_GROUPS}=K;
let n=0;const ok=(name,fn)=>{fn();n++;};

/** Holes: empty squares closed in on three or four sides (a bot's sense of a messy pitch). */
function holes(s){let h=0;for(let i=0;i<64;i++){if(s.grid[i]||s.ref[i])continue;const x=i%8,y=i>>3;let c=0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>7||Y>7||s.grid[Y*8+X]||s.ref[Y*8+X])c++;}if(c>=3)h++;}return h;}
/** A careful greedy player: tries every tray piece at every square, scores lines, few holes, an emptier pitch. */
function botMove(g,bench=true){const s=g.state;let best=null;
 for(let k=0;k<(bench?4:3);k++){const p=g.pieceAt(k);if(!p)continue;const d=SHAPES[p.shape];
  for(let y=0;y+d.h<=8;y++)for(let x=0;x+d.w<=8;x++){if(!g.fits(p.shape,x,y))continue;const ln=g.linesIf(p.shape,x,y),keep=s.grid.slice();
   for(const [cx,cy] of d.cells)s.grid[(y+cy)*8+x+cx]=1;for(const r of ln.rows)for(let c=0;c<8;c++)s.grid[r*8+c]=0;for(const c of ln.cols)for(let r=0;r<8;r++)s.grid[r*8+c]=0;
   let fill=0;for(let i=0;i<64;i++)fill+=s.grid[i]?1:0;const v=(ln.rows.length+ln.cols.length)*10-holes(s)*3-fill*.2+d.n*.5;s.grid.set(keep);
   if(!best||v>best.v)best={v,k,x,y};}}
 return best;}
function play(opts,cap=5000){const g=K.createLineUp(opts);let moves=0;while(!g.state.over&&moves<cap){const m=botMove(g,!opts.noBench);if(!m){/* AAA pass: nothing fits, the bench is the way out */if(g.state.rescue&&!opts.noBench){assert.ok(g.hold(g.state.tray.findIndex(Boolean)));continue;}break;}assert.ok(g.place(m.k,m.x,m.y),'the bot only plays legal moves');g.drain(()=>{});moves++;}return g;}

ok('shapes: 18 groups, every rotation and mirror once, 1-5 beans, tiers 0-3',()=>{
 assert.equal(SHAPE_GROUPS.length,18);const keys=new Set(SHAPES.map(s=>s.group+':'+s.cells.map(c=>c.join(',')).join(';')));assert.equal(keys.size,SHAPES.length,'no duplicate orientation');
 for(const s of SHAPES){assert.ok(s.n>=1&&s.n<=5,'1-5 beans');assert.ok(s.cells.every(([x,y])=>x>=0&&y>=0&&x<s.w&&y<s.h));}
 assert.equal(SHAPES.filter(s=>SHAPE_GROUPS[s.group].id==='ell').length,8,'an L has 8 orientations');assert.equal(SHAPES.filter(s=>SHAPE_GROUPS[s.group].id==='box').length,1,'a box has one');
 assert.deepEqual([...new Set(SHAPE_GROUPS.map(g=>g.tier))].sort(),[0,1,2,3]);
});
ok('same seed, same pieces and same run; the daily seed is one per day',()=>{
 const a=play({seed:42},60),b=play({seed:42},60);assert.equal(a.state.score,b.state.score);assert.deepEqual([...a.state.grid],[...b.state.grid]);
 const trays=seed=>{const g=K.createLineUp({seed});return g.state.tray.map(p=>p.shape+':'+p.kit).join();};assert.equal(trays(42),trays(42));assert.ok([43,44,45].some(x=>trays(x)!==trays(42)),'another seed, other pieces');
 assert.equal(K.lineupDailySeed('2026-11-17'),K.lineupDailySeed('2026-11-17'));assert.notEqual(K.lineupDailySeed('2026-11-17'),K.lineupDailySeed('2026-11-18'));
});
ok('placing: a tray of three, refused when it does not fit, a new tray the moment the last one is placed',()=>{
 const g=K.createLineUp({seed:7}),s=g.state;assert.equal(s.tray.filter(Boolean).length,3);const p=s.tray[0],d=SHAPES[p.shape];
 assert.equal(g.place(0,8-d.w+1,0),false,'off the pitch');assert.ok(g.place(0,0,0));assert.equal(g.place(0,0,0),false,'the slot is empty now');
 const ev=[];g.drain(e=>ev.push(e.type));assert.ok(ev.includes('place'));assert.equal(s.score,d.n,'1 point a bean');
 const q=s.tray[1];assert.equal(g.fits(q.shape,0,0)&&SHAPES[q.shape].cells.some(([x,y])=>SHAPES[p.shape].cells.some(c=>c[0]===x&&c[1]===y)),false,'an occupied square refuses');
 for(const k of [1,2]){const sh=s.tray[k].shape;let done=false;for(let y=0;y<8&&!done;y++)for(let x=0;x<8&&!done;x++)if(g.fits(sh,x,y)){g.place(k,x,y);done=true;}}
 assert.equal(s.tray.filter(Boolean).length,3,'no dead time: the next tray is dealt at once');assert.equal(s.stats.deals,2);
});
ok('lines: a full row and a full column clear together, combo and streak scoring, clean sheet',()=>{
 const g=K.createLineUp({seed:3}),s=g.state;const slot=0,sh=SHAPES[s.tray[slot].shape];
 // fill row 0 and column 0 except the cells the piece covers at 0,0, so one piece completes both
 const cover=new Set(sh.cells.map(([x,y])=>y*8+x));for(let i=0;i<8;i++){if(!cover.has(i))s.grid[i]=1+i%6;if(!cover.has(i*8))s.grid[i*8]=1+(i+3)%6;}/* mixed ball types: no team line here */
 const pre=s.score;g.drain(()=>{});assert.ok(g.place(slot,0,0));const ev=[];g.drain(e=>ev.push(e));const clear=ev.find(e=>e.type==='clear');
 assert.ok(clear&&clear.rows.includes(0)&&clear.cols.includes(0),'row 0 and column 0 clear');assert.equal(clear.a,clear.rows.length+clear.cols.length);
 assert.equal(clear.team.length,0);assert.equal(clear.points,Math.round(K.linePoints(clear.a)*K.streakFactor(1)*K.levelFactor(1)));assert.ok(clear.from.length===sh.n,'the clear knows the piece it rippled from');assert.equal(K.linePoints(1),100);assert.equal(K.linePoints(2),300);assert.equal(K.linePoints(4),1000);
 assert.equal(clear.kits.length,clear.cells.length,'every cleared bean keeps its kit for the burst');
 const empty=sh.cells.every(([x,y])=>x===0||y===0);assert.equal(ev.some(e=>e.type==='clean'),empty,'CLEAN SHEET exactly when the pitch is empty');assert.ok(s.score>=pre+sh.n+clear.points+(empty?LU.cleanPts:0));
 assert.equal(K.streakFactor(1),1);assert.equal(K.streakFactor(3),2);assert.equal(K.streakFactor(99),LU.streakMax);assert.equal(K.levelFactor(1),1);assert.equal(K.levelFactor(99),LU.levelMax);
});
ok('team line (AAA pass): five or more of one ball type in a cleared line pays LU.teamPts more, and the preview says so first',()=>{
 const g=K.createLineUp({seed:9}),s=g.state,p=s.tray[0],sh=SHAPES[p.shape],top=new Set(sh.cells.filter(c=>c[1]===0).map(c=>c[0]));
 for(let x=0;x<8;x++)if(!top.has(x))s.grid[x]=((p.kit+1)%6)+1;/* seven or fewer of ANOTHER type: still one type, so a team line of that type */
 const pre=g.preview(0,0,0);assert.ok(pre.ok&&pre.rows.includes(0));const others=8-top.size;assert.equal(pre.team.length,others>=LU.teamNeed||top.size>=LU.teamNeed?1:0);
 g.drain(()=>{});assert.ok(g.place(0,0,0));const ev=[];g.drain(e=>ev.push(e));const c=ev.find(e=>e.type==='clear');assert.deepEqual(c.team,pre.team,'the drop pays what the preview showed');
 assert.equal(c.points,Math.round((K.linePoints(c.a)+c.team.length*LU.teamPts)*K.streakFactor(1)*K.levelFactor(1)));assert.equal(s.stats.teamLines,c.team.length);
 // four of one type and four of another: no team line
 const h=K.createLineUp({seed:9}),t=h.state,q=t.tray[0],dot=SHAPES.findIndex(d=>d.n===1);q.shape=dot;for(let x=1;x<8;x++)t.grid[x]=x<4?((q.kit+1)%6)+1:((q.kit+2)%6)+1;/* 3 + 4 + the piece */
 assert.equal(h.preview(0,0,0).team.length,0,'3 + 4 + 1 is no team line');for(let x=1;x<8;x++)t.grid[x]=x<LU.teamNeed?q.kit+1:((q.kit+2)%6)+1;const tp=h.preview(0,0,0).team;assert.equal(tp.length,1);assert.equal(tp[0].kit,q.kit);assert.equal(tp[0].col,false);
});
ok('bench (AAA pass): park a piece, swap it, play it from the bench; parking the last piece deals; it saves a stuck run once',()=>{
 const g=K.createLineUp({seed:21}),s=g.state,a=s.tray[0],b=s.tray[1];assert.equal(s.bench,null);assert.ok(g.hold(0));assert.equal(s.bench,a);assert.equal(s.tray[0],null);assert.equal(s.stats.placed,0,'parking is not a placement');
 assert.ok(g.hold(1),'a full bench swaps');assert.equal(s.bench,b);assert.equal(s.tray[1],a);assert.equal(g.hold(0),false,'an empty slot parks nothing');
 const ev=[];g.drain(e=>ev.push(e.type));assert.equal(ev.filter(t=>t==='hold').length,2);
 assert.ok(g.preview(LU.bench,0,0).ok);assert.ok(g.place(LU.bench,0,0));assert.equal(s.bench,null);assert.equal(s.stats.placed,1);
 // park the last tray piece: the next tray comes at once
 const h=K.createLineUp({seed:22}),t=h.state;t.tray[0]=null;t.tray[1]=null;const deals=t.stats.deals;assert.ok(h.hold(2));assert.equal(t.tray.filter(Boolean).length,3);assert.equal(t.stats.deals,deals+1);
 // stuck: a full pitch but one hole that the last piece does not fit. Empty bench: not over yet (rescue). Bench in use: over.
 const big=SHAPES.findIndex(d=>d.n===5),stuck=bench=>{const k=K.createLineUp({seed:23}),u=k.state;u.grid.fill(1);u.grid[0]=0;u.tray[0]=null;u.tray[1]=null;u.tray[2].shape=big;if(bench)u.bench={id:99,shape:big,kit:0};k.drain(()=>{});
  // any placement would re-check; ask through a refused move, then the public re-check that hold() runs
  return k;};
 const free=stuck(false);assert.ok(free.hold(2),'the last piece can be parked');assert.equal(free.state.tray.filter(Boolean).length,3,'and a new tray comes');
 const full=stuck(true);assert.ok(full.hold(2),'a swap is allowed');const evs=[];full.drain(e=>evs.push(e.type));assert.ok(full.state.over&&evs.includes('over'),'a swap that changes nothing ends the run');
});
ok('fair deals (AAA pass): an open pitch never gets three dead pieces, at any level',()=>{
 for(let seed=1;seed<=40;seed++){const g=K.createLineUp({seed,fixLevel:12}),s=g.state;let guard=0;
  while(!s.over&&guard++<300){let open=0;for(let i=0;i<64;i++)if(!s.grid[i]&&!s.ref[i])open++;
   if(s.tray.filter(Boolean).length===3&&open>=LU.openFree+3/* a referee may walk on after the deal */)assert.ok(s.tray.some(p=>g.fitsAnywhere(p.shape)),`seed ${seed}: a fresh tray on an open pitch (${open} free) holds a piece that fits`);
   const m=botMove(g);if(!m){if(s.rescue){g.hold(s.tray.findIndex(Boolean));continue;}break;}g.place(m.k,m.x,m.y);g.drain(()=>{});}}
});
ok('streak: one placement without a clear is forgiven, the second breaks it',()=>{
 const g=K.createLineUp({seed:5}),s=g.state;s.streak=2;s.miss=0;
 const place=()=>{for(let k=0;k<3;k++){const p=s.tray[k];if(!p)continue;for(let y=7;y>=0;y--)for(let x=7;x>=0;x--)if(g.fits(p.shape,x,y)&&!g.linesIf(p.shape,x,y).rows.length&&!g.linesIf(p.shape,x,y).cols.length){g.place(k,x,y);return;}}};
 place();assert.equal(s.streak,2,'one miss kept');place();const ev=[];g.drain(e=>ev.push(e.type));assert.equal(s.streak,0);assert.ok(ev.includes('streakLost'));
});
ok('referee: from level 4 a referee blocks one square, counts down each placement and leaves',()=>{
 assert.equal(RAMP.slice(0,3).every(r=>r.refs===0),true,'no referee on levels 1-3');
 const g=K.createLineUp({seed:11,fixLevel:12}),s=g.state;let seen=0,left=0,guard=0;
 while(!s.over&&guard++<400){g.drain(e=>{if(e.type==='refOn')seen++;if(e.type==='refOff')left++;});for(let i=0;i<64;i++)if(s.ref[i]){assert.equal(g.fits(SHAPES.findIndex(d=>d.n===1),i%8,i>>3),false,'a referee square takes no bean');}
  const m=botMove(g);if(!m)break;g.place(m.k,m.x,m.y);}
 assert.ok(seen>0&&left>0,`referees came (${seen}) and went (${left})`);
});
ok('the ramp is a table that only ever gets harder',()=>{
 const meanBeans=r=>{let tot=0,w=0;const N=SHAPE_GROUPS.length;for(let t=0;t<4;t++){const gs=SHAPE_GROUPS.filter(g=>g.tier===t);const ws=gs.map(g=>g.id==='dot'?r.dot:1),sum=ws.reduce((a,b)=>a+b,0);gs.forEach((g,i)=>{const n=g.rows.join('').split('#').length-1;tot+=r.tier[t]*ws[i]/sum*n;});w+=r.tier[t];}return tot/w;};
 for(let i=1;i<RAMP.length;i++){const a=RAMP[i-1],b=RAMP[i];
  assert.ok(b.tier[0]<=a.tier[0]&&b.tier[3]>=a.tier[3],`level ${i+1}: fewer easy, more odd shapes`);assert.ok(b.dot<=a.dot,'fewer singles');assert.ok(b.refs>=a.refs&&b.life>=a.life&&b.refChance>=a.refChance,'more referee');
  assert.ok(b.fair<=a.fair,'fewer fair re-deals');assert.ok(meanBeans(b)>=meanBeans(a)-1e-9,`level ${i+1}: bigger shapes on average`);}
 assert.equal(K.rampFor(99),RAMP[RAMP.length-1],'the last row holds forever');assert.equal(K.levelForPlaced(0),1);assert.equal(K.levelForPlaced(LU.perLevel),2);
});
ok('bots: later is harder (a held level 12 ends sooner than a held level 1) and a run always ends',()=>{
 const seeds=Array.from({length:+process.env.LU_SEEDS||30},(_,i)=>1000+i),med=a=>a.slice().sort((x,y)=>x-y)[a.length>>1];
 const easy=seeds.map(seed=>play({seed,fixLevel:1},400).state),hard=seeds.map(seed=>play({seed,fixLevel:12},400).state);
 const easyMoves=med(easy.map(s=>s.stats.placed)),hardMoves=med(hard.map(s=>s.stats.placed));
 assert.ok(hard.every(s=>s.over),'every level-12 run ends');assert.ok(hardMoves<easyMoves*.75,`level 12 lasts clearly less (${hardMoves} vs ${easyMoves} placements)`);
 const runs=seeds.map(seed=>play({seed}).state);assert.ok(runs.every(s=>s.over),'every endless run ends on its own');
 const placed=runs.map(s=>s.stats.placed),scores=runs.map(s=>s.score);
 assert.ok(Math.max(...placed)<1000,'and not after an endless time');assert.ok(med(placed)>=30,`a careful player gets a real run (median ${med(placed)} placements)`);
 assert.ok(med(runs.map(s=>s.level))>=3,'and climbs levels');
 const plain=seeds.map(seed=>play({seed,noBench:true}).state);assert.ok(plain.every(s=>s.over||s.rescue),'a run that never uses the bench ends too (stuck with the bench still free)');
 if(process.argv.includes('--bots'))console.log(JSON.stringify({easyMoves,hardMoves,medianPlaced:med(placed),medianScore:med(scores),maxScore:Math.max(...scores),noBench:{medianPlaced:med(plain.map(s=>s.stats.placed)),medianScore:med(plain.map(s=>s.score)),maxScore:Math.max(...plain.map(s=>s.score))},teamLines:runs.reduce((a,s)=>a+s.stats.teamLines,0),lines:runs.reduce((a,s)=>a+s.stats.lines,0),medals:LU.medals}));
 // medals sit where a careful player reaches bronze, a good run silver, and gold is a stretch
 assert.ok(med(scores)>=LU.medals[0],'the bot median earns Bronze');assert.ok(Math.max(...scores)<LU.medals[2]*2,'Gold stays in reach of a great run');
 // board rate: a fast bot (1 s a placement) never beats base + perSecond x seconds
 const R=L.BOARD_RULES.lineup;for(const s of runs)assert.ok(s.score<=R.base+R.perSecond*s.stats.placed,`board rate holds (${s.score} in ${s.stats.placed} s)`);
});
ok('device save: best, medal, daily claim and day streak, near-miss and coach lines',()=>{
 const stats={placed:40,beans:120,lines:9,clears:7,bestCombo:2,bestStreak:3,cleanSheets:0,refs:1,deals:14,bigShapes:2,teamLines:1,holds:2};
 assert.match(S.coachLine({...stats,holds:0},10),/bench/,'a run that never used the bench is told about it');
 let st=S.settleLineup(S.emptyLineupSave(),{score:1600,daily:false,day:'2026-11-17',stats,level:4});assert.ok(st.newBest&&st.newMedal);assert.equal(st.save.best,1600);assert.equal(st.save.medal,1);
 st=S.settleLineup(st.save,{score:900,daily:true,day:'2026-11-17',stats,level:2});assert.ok(st.dailyFirst);assert.equal(st.save.best,1600,'a daily run does not touch the endless best');assert.equal(st.streak,1);
 const again=S.settleLineup(st.save,{score:1000,daily:true,day:'2026-11-17',stats,level:2});assert.equal(again.dailyFirst,false,'later daily runs are practice');assert.equal(again.dailyBest,1000);
 const next=S.settleLineup(again.save,{score:10,daily:true,day:'2026-11-18',stats,level:1});assert.equal(next.streak,2,'a day in a row');assert.equal(S.liveStreak(next.save,'2026-11-20'),0,'a missed day ends it');
 assert.deepEqual(S.sanitizeLineupSave({best:-5,medal:99,daily:{day:'x'}}).best,0);assert.equal(S.sanitizeLineupSave({medal:99}).medal,3);
 assert.match(S.nearMissLine({score:1450,best:0,newBest:true,daily:false,stats}),/50 points from Bronze/);assert.match(S.nearMissLine({score:900,best:1000,newBest:false,daily:false,stats}),/100 points from your best/);
 assert.ok(S.coachLine({...stats,lines:0},10).length>10);assert.ok(S.LINEUP_TIPS.length>=5);
});
ok('arcade wiring: last in the back row, board, coins, save key, last score, room route, analytics, SQL',()=>{
 const cab=arcadeCabinets.find(c=>c.id==='lineup');assert.ok(cab,'a cabinet');assert.equal(ARCADE_ROW.indexOf('lineup'),6,'the first cabinet after the six uprights (Nov 17 2026: Trophy Drop was appended after it, tests/trophydrop-core.cjs; Nov 18 2026: then Roll It In and Ball Blaster)');assert.equal(cab.lesson,'Fill the line. Keep your shape.');
 assert.equal(cab.z,-10);assert.equal(cab.yaw,0);
 assert.ok(L.BOARD_GAMES.includes('lineup')&&L.HALL_MACHINES.includes('lineup'),'one all-time board, in the Hall');assert.equal(L.BOARD_TIER_TABS.lineup,undefined,'no second (daily) board');
 assert.equal(arcadeCoinTarget('lineup',{points:4000}),10);assert.equal(arcadeCoinTarget('lineup',{points:1e6}),ARCADE_COIN_CAPS.lineup);
 assert.ok(isSyncKey('fi2-lineup-v1'),'the save travels with the player');assert.ok(LAST_SCORE_GAMES.includes('lineup')&&LAST_SCORE_GAMES.includes('lineup_daily'));
 const room=read('components/ArcadeRoom.tsx');assert.match(room,/import\('\.\/games\/LineUpGame'\)/);assert.match(room,/game==='lineup'\?<LineUp onExit=\{back\}\/>/);
 assert.match(read('lib/analytics/islandIds.ts'),/'snake','airhockey','lineup','trophydrop','rollball'[,\]]/);/* Nov 18 2026: Trophy Drop and Roll It In come after it */assert.match(read('lib/analytics/islandIds.ts'),/\['arcade_lineup','Arcade: Line Up!'\]/);
 assert.match(read('components/arcade/HighScoreEntry.tsx'),/'lineup'/,'results-first high-score strip');assert.match(read('components/games/skins/index.ts'),/lineup:lineup\.skin/);
 const sql=read('docs/arcade-aaa/lineup-supabase.sql'),list=/check \(game in \(([^)]*)\)\)/.exec(sql.replace(/--.*$/gm,''))[1].split(',').map(v=>v.trim().replace(/'/g,''));assert.deepEqual(list,L.BOARD_GAMES.slice(0,L.BOARD_GAMES.indexOf('lineup')+1)/* Nov 17 2026: the boards after Line Up! (Trophy Drop, Clear the Box, Street Dash) come in docs/arcade-aaa/new-games-supabase.sql, a superset of this file */,'the owner file names every board');assert.match(sql,/between 1 and 9000000/);assert.match(sql,/'airhockey', 'lineup'\)\);/);assert.match(sql,/'arcade_airhockey','arcade_lineup',/);assert.match(sql.trim().split('\n').pop(),/as missing\) x;$/);
 assert.match(read('supabase/migrations/20261124_analytics_lineup.sql'),/'arcade_lineup'/);{const mig=read('supabase/migrations/20261123_lineup_boards.sql');for(const g of L.BOARD_GAMES.slice(0,L.BOARD_GAMES.indexOf('lineup')+1)/* Nov 17 2026: later boards in 20261125_trophydrop_board.sql, 20261127_clearbox_boards.sql, 20261129_streetdash_boards.sql */)assert.ok(mig.includes(`'${g}'`),'migration names '+g);}
 const shell=read('components/games/LineUpGame.tsx');assert.match(shell,/beginBoardSession\('lineup'\)/);assert.match(shell,/!r\.daily\|\|settled\.dailyFirst/,'only the first daily run posts');
 assert.match(shell,/takeTodayLaunch|data-lineup-daily/,'the daily challenge is offered on the start card');
});
ok('sound: one limiter wired to the output only; made on the first tap; no loops',()=>{
 const a=read('lib/arcade/lineup/audio.ts');assert.match(a,/master\.connect\(limiter\);limiter\.connect\(ctx\.destination\);/);assert.equal((a.match(/limiter\.connect\(/g)||[]).length,1);
 assert.doesNotMatch(a,/setInterval|setTimeout|loop\s*=\s*true/);assert.match(a,/function unlock\(\)/);
 for(const cue of ['snap','ready','hold','near','risk','venue'])assert.match(a,new RegExp('\\n  '+cue+'\\('),'AAA pass cue: '+cue);assert.match(a,/clear\(lines:number,streak:number,team=0\)/);
 const shell=read('components/games/LineUpGame.tsx');assert.match(shell,/\(audio\.current\?\?=createLineupAudio\(\)\)\.unlock\(\)/);
});
ok('heat and input: frames only on demand, DPR cap 2, reduced motion, lifted drag, keys',()=>{
 const shell=read('components/games/LineUpGame.tsx'),view=read('lib/arcade/lineup/view.ts');
 assert.match(shell,/if\(busy\|\|g\.state\.over\)raf\.current=requestAnimationFrame/,'the loop stops when nothing moves');assert.match(shell,/Math\.min\(2,window\.devicePixelRatio\|\|1\)/);
 assert.match(shell,/d\.touch\?y-sh\.h\*c-c\*1\.1/,'a finger drags the piece lifted above the thumb');assert.match(shell,/prefers-reduced-motion/);
 assert.match(shell,/'Digit1','Digit2','Digit3'/);assert.match(shell,/ArrowLeft:\[-1,0\]/);assert.match(view,/sparks:Spark\[\]=Array\.from\(\{length:64\}/,'pooled sparks');
 assert.match(view,/sprites\.get\(kit\)/,'ball sprites drawn once per ball type (AAA pass, Nov 18 2026: one size, scaled; before, one per kit and size, and a fly-back made new ones every frame)');
 assert.doesNotMatch(view,/sprites\.set\(key/,'no per-size sprite keys');
 // AAA pass (Nov 18 2026): the drag
 assert.match(shell,/const done=e\.type==='pointerup'&&d\.moved;/,'a tap never drops a piece');assert.match(shell,/Math\.hypot\(cx-d\.px,cy-d\.py\)>TAP_SLOP/);
 assert.match(shell,/v\.magnet\(g,p\.shape,d\.x,d\.y\)/,'magnetic snap');assert.match(view,/const MAGNET=\.62;/);assert.match(shell,/d\.bench=d\.slot!==LU\.bench&&d\.moved&&v\.overBench\(x,y\)/,'the bench takes the piece under the finger');
 assert.match(shell,/g\.hold\(d\.slot\)/);assert.match(shell,/e\.code==='KeyB'/,'B parks a shape from the keys');assert.match(shell,/'Digit1','Digit2','Digit3','Digit4'/,'4 picks the bench');
 assert.match(shell,/audio\.current\?\.ready\(d\.rows\.length\+d\.cols\.length,d\.team\.length>0\)/,'a cue before the drop when a line is ready');
 assert.match(shell,/clearTimeout\(idle\.current\);if\(!s\.over\)idle\.current=window\.setTimeout\(/,'the idle nudge is one timeout, set again only by a move');assert.doesNotMatch(shell,/setInterval/);
 assert.match(view,/setLevel\(level:number\)\{const v=venueFor\(level\);if\(v===venue\)return false;venue=v;paintScene\(\);/,'the static scene repaints only when the venue changes');
 const V=require('../lib/arcade/lineup/view.ts');assert.equal(V.VENUES.length,4);assert.deepEqual([1,3,4,6,7,9,10,40].map(V.venueFor),[0,0,1,1,2,2,3,3],'a new venue every third level, night from level 10');
});
console.log(`lineup-core: ${n} checks passed`);
