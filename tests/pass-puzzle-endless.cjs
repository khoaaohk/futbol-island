// Pass Puzzles Endless Run (lib/passPuzzle/endless.ts): the template pool, determinism per seed, solvability of 500 generated
// puzzles (heading on and the youth no-heading rule, checked with the real engine), the monotone ramp, lives, scoring and the
// board caps the run posts under. Run: node tests/pass-puzzle-endless.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),Module=require('node:module');
const ROOT=path.join(__dirname,'..');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const resolve=Module._resolveFilename;Module._resolveFilename=function(req,parent,...rest){if(req.startsWith('@/'))req=path.join(ROOT,req.slice(2));try{return resolve.call(this,req,parent,...rest);}catch(e){if(req.startsWith('.')||path.isAbsolute(req))return resolve.call(this,req+'.ts',parent,...rest);throw e;}};
const lib=f=>require(path.join(ROOT,'lib','passPuzzle',f));
const E=lib('endless.ts'),C=lib('catalog.ts'),{coachRun}=lib('coach.ts'),{DIFFICULTY}=lib('curve.ts'),{youthScenario}=lib('youth.ts'),L=require(path.join(ROOT,'lib/arcade/leaderboard.ts'));
const played=(s,heading)=>{const b=heading?s:youthScenario(s);return{...b,require:{...b.require,allowDirectShot:b.require.finish==='goal'}};};
const solvable=p=>coachRun(played(p.scenario,true),p.solution).ok&&coachRun(played(p.scenario,false),p.solution).ok;

// 1. The pool: real, rated puzzles whose own route still solves them once renamed, in both heading modes (the last-resort fallback).
assert(E.ENDLESS_POOL.length>=40,'a wide pool: '+E.ENDLESS_POOL.length);assert.equal(new Set(E.ENDLESS_POOL).size,E.ENDLESS_POOL.length);
for(const id of E.ENDLESS_POOL){const s=C.ALL_SCENARIOS.find(x=>x.id===id);assert(s,id+' is an authored puzzle');assert(Number.isFinite(DIFFICULTY[id]),id+' rated');
 const sol=C.ALL_SOLUTIONS[id].solution,renamed={...s,id:'endless-0',pack:'endless',attempts:1};assert(coachRun(played(renamed,true),sol).ok,id+' solves');assert(coachRun(played(renamed,false),sol).ok,id+' solves with no heading');}
for(const id of E.ENDLESS_OPENERS)assert(E.ENDLESS_POOL.includes(id)&&DIFFICULTY[id]<=45,'gentle opener '+id);

// 2. Determinism: the same seed and level give the same puzzle, in any order of asking; another seed gives another run.
{const a=[1,2,3,9,17,30].map(n=>E.endlessPuzzle('2026-11-10',n)),b=[30,17,9,3,2,1].map(n=>E.endlessPuzzle('2026-11-10',n)).reverse();assert.deepEqual(a,b);
 const other=Array.from({length:12},(_,i)=>E.endlessPuzzle('2026-11-11',i+1).template+E.endlessPuzzle('2026-11-11',i+1).mirrored).join(),same=Array.from({length:12},(_,i)=>E.endlessPuzzle('2026-11-10',i+1).template+E.endlessPuzzle('2026-11-10',i+1).mirrored).join();assert.notEqual(other,same,'seeds differ');
 assert.equal(E.endlessSeed(new Date(2026,10,10)),'2026-11-10');assert.equal(E.endlessSeed(new Date(2026,10,10),2),'2026-11-10.2');}

// 3. 500 generated puzzles (10 seeds x 50 levels): every one is solved by its own route in the real engine, in both heading
//    modes; ids, packs and counts are sane; no template repeats inside three puzzles; generation is cheap.
{let n=0,worst=0,extras=0,pressing=0,remixed=0;const used=new Set();
 for(let s=0;s<10;s++){const seed='seed-'+s,recent=[];
  for(let level=1;level<=50;level++){const t0=performance.now(),p=E.endlessPuzzle(seed,level);worst=Math.max(worst,performance.now()-t0);n++;
   assert(solvable(p),`${seed} level ${level} (${p.template}) is solvable`);
   assert.equal(p.scenario.id,'endless-'+level);assert.equal(p.scenario.pack,'endless');assert.equal(p.scenario.attempts,1);assert.equal(p.level,level);
   assert(p.scenario.attackers.length<=11&&p.scenario.defenders.length<=11,'fits the scene pools');
   const src=C.ALL_SCENARIOS.find(x=>x.id===p.template);assert.equal(p.scenario.defenders.length,src.defenders.length+p.extra);assert(p.extra<=p.ramp.extraDefenders+(p.blocker?1:0),'the ramp\'s defenders, plus at most the one stood in the way of the lazy shot');
   const hw=p.scenario.pitch.halfWidth,hl=p.scenario.pitch.length/2;for(const d of p.scenario.defenders.slice(src.defenders.length))assert(Math.abs(d.x)<=hw&&Math.abs(d.z)<=hl,'added defender on the pitch');
   if(level<=2)assert(E.ENDLESS_OPENERS.includes(p.template),'gentle opener');assert(!recent.includes(p.template),`${seed} level ${level}: no repeat inside three`);recent.push(p.template);if(recent.length>3)recent.shift();
   extras+=p.extra;if(p.press)pressing++;if(p.mirrored||p.extra)remixed++;used.add(p.template);}}
 assert.equal(n,500);assert(used.size>=30,'variety: '+used.size+' templates');assert(extras>=150,'extra defenders are really added: '+extras);assert(pressing>=40,'pressing defenders appear: '+pressing);assert(remixed>=300,'remixes: '+remixed);
 assert(worst<500,'a puzzle is built in well under half a second ('+worst.toFixed(0)+' ms)');
 console.log(`PASS 500 endless puzzles solvable (both heading modes), ${used.size} templates, ${extras} added defenders, ${pressing} pressing, worst build ${worst.toFixed(0)} ms`);}

// 4. The ramp only ever gets harder, and the served puzzles follow it.
{let prev=E.endlessRamp(1);const aid={scan:0,hint:1,none:2};
 for(let n=2;n<=80;n++){const r=E.endlessRamp(n);assert(r.target>=prev.target&&r.floor>=prev.floor&&r.extraDefenders>=prev.extraDefenders&&r.shift>=prev.shift&&(r.press||!prev.press)&&aid[r.aid]>=aid[prev.aid],'monotone at '+n);
  if(prev.clock!==null)assert(r.clock!==null&&r.clock<=prev.clock&&prev.clock-r.clock<=2,'the clock shortens gently at '+n);assert(r.clock===null||r.clock>=15,'clock floor');prev=r;}
 assert.equal(E.endlessRamp(1).aid,'scan');assert.equal(E.endlessRamp(1).clock,null);assert.equal(E.endlessRamp(1).extraDefenders,0);assert.equal(E.endlessRamp(40).extraDefenders,2);assert.equal(E.endlessRamp(40).aid,'none');assert.equal(E.endlessRamp(40).clock,15);
 const mean=(a,b)=>{let t=0,c=0;for(let s=0;s<10;s++)for(let n=a;n<=b;n++){t+=E.endlessPuzzle('seed-'+s,n).difficulty;c++;}return t/c;};
 const m=[mean(1,5),mean(6,10),mean(11,15),mean(16,20),mean(21,30)];for(let i=1;i<m.length;i++)assert(m[i]>m[i-1],'served difficulty climbs: '+m.map(v=>v.toFixed(0)).join(' < '));
 const p=E.endlessPuzzle('seed-1',20);assert.equal(p.clock,p.ramp.clock+4*p.scenario.require.minPasses);
 console.log('PASS ramp monotone; mean served difficulty by band '+m.map(v=>v.toFixed(0)).join(' < '));}

// 5. Lives and scoring.
{let r=E.startEndlessRun('s');assert.deepEqual([r.level,r.lives,r.score,r.over],[1,3,0,false]);
 let x=E.stepEndless(r,{kind:'solve',move:true});assert.equal(x.gained,3);assert.deepEqual([x.run.level,x.run.score,x.run.streak,x.run.lives],[2,3,1,3]);
 x=E.stepEndless(x.run,{kind:'solve',move:false});assert.equal(x.gained,2,'a direct shot skips the move star');
 x=E.stepEndless(x.run,{kind:'fail'});assert.deepEqual([x.run.level,x.run.lives,x.run.streak,x.run.tries,x.gained,x.lifeLost],[3,2,0,1,0,true],'a fail costs a life and serves the same puzzle');
 x=E.stepEndless(x.run,{kind:'solve',move:true});assert.equal(x.gained,2,'solved on the second try: no first-try star');assert.equal(x.run.streak,0);
 x=E.stepEndless(x.run,{kind:'skip'});assert.deepEqual([x.run.level,x.run.lives,x.gained],[5,1,0],'a skip costs a life and moves on');
 x=E.stepEndless(x.run,{kind:'fail'});assert.equal(x.run.over,true);assert.equal(x.run.lives,0);const frozen=E.stepEndless(x.run,{kind:'solve',move:true});assert.equal(frozen.run.score,x.run.score,'nothing scores after the run ends');
 // the streak star: every fifth first-try solve in a row
 r=E.startEndlessRun('s');const gains=[];for(let i=0;i<10;i++){const y=E.stepEndless(r,{kind:'solve',move:true});gains.push(y.gained);r=y.run;}assert.deepEqual(gains,[3,3,3,3,4,3,3,3,3,4]);assert.equal(r.bestStreak,10);
 assert.equal(Math.max(...gains),E.ENDLESS_MAX_STARS);assert.equal(E.endlessStars(false,false,0),1);}

// 6. The board: Endless posts to the one 'puzzle' board in stars. Old star totals still post with no play time; a real run fits the
//    rate; the ceiling holds a very long run and stays inside the database's 400000.
{const R=L.BOARD_RULES.puzzle;assert.equal(R.unit,'stars');assert(R.base>=3*C.ALL_SCENARIOS.length,'a full star total posts without a rate');assert(R.max>=1000&&R.max<=400000);
 assert(R.perSecond>=E.ENDLESS_MAX_STARS/2.5,'the fastest real pace (4 stars per 2.5 s puzzle) fits the rate');
 assert(!L.RUNNING_TOTAL_BOARDS.has('puzzle'),'no new running-total board was added for it');assert(L.BOARD_GAMES.includes('puzzle')&&!L.BOARD_GAMES.some(g=>/endless/i.test(g)),'one board per game: no endless board');
 // device board: the same letters keep one row, their best (star total or best run)
 let b={seq:0,boards:{}};const add=(score,initials)=>{b=L.addLocalScore(b,'puzzle',{initials,icon:'ball',score,now:Date.UTC(2026,10,10)}).boards;};add(40,'KID');add(64,'KID');add(22,'KID');add(30,'PAL');
 const rows=b.boards.puzzle.map(e=>e.initials+e.score);assert(rows.includes('KID64')&&!rows.includes('KID40')&&rows.includes('PAL30'),'a better score replaces the same letters\' lower row: '+rows);assert.equal(rows[0],'KID64');}
console.log('PASS endless lives, scoring and board caps');

// 7. AAA pass (Nov 18 2026). The lazy way out is shut: before, one straight shot from the first whistle finished about one late
//    puzzle in four (two stars, no reading). Now a remix that leaves it on gets a defender in its way, and its route still solves.
{const lazy=(a,b)=>{let hit=0,n=0,blockers=0;for(let s=0;s<12;s++)for(let level=a;level<=b;level++){const p=E.endlessPuzzle('lazy-'+s,level);if(p.solution.filter(x=>!('call' in x)).length<2)continue;n++;if(p.blocker){blockers++;assert(solvable(p),'a blocked puzzle still solves');}if(E.directShotScores(E.endlessPlayable(p.scenario,true)))hit++;}return{rate:hit/n,n,blockers};};
 const early=lazy(3,9),late=lazy(10,30);assert(early.n>40&&late.n>150);assert(early.rate<=.08,'levels 3-9: the lazy shot almost never scores: '+early.rate.toFixed(3));assert(late.rate<=.14,'levels 10-30: the lazy shot is rare: '+late.rate.toFixed(3));assert(early.blockers+late.blockers>=10,'blockers are really placed');
 // an opener that IS a shot stays a shot (Far Corner teaches the finish), and the check itself is honest about an open goal
 const far=C.ALL_SCENARIOS.find(x=>x.id==='fp-far-corner');assert.equal(E.directShotScores(E.endlessPlayable(far,true)),true,'Far Corner is a shooting puzzle');
 console.log(`PASS lazy direct shot: ${(early.rate*100).toFixed(1)}% of pass puzzles at levels 3-9, ${(late.rate*100).toFixed(1)}% at 10-30 (${early.blockers+late.blockers} blockers placed)`);}

// 8. Wet pitches arrive from level 8, never before, only on dry templates, about one puzzle in six, and each one still solves.
{let wet=0,n=0;for(let s=0;s<12;s++)for(let level=1;level<=30;level++){const p=E.endlessPuzzle('wet-'+s,level),src=C.ALL_SCENARIOS.find(x=>x.id===p.template);
  if(p.wet){wet++;assert(level>=8,'no wet remix before level 8');assert(!src.weather,'only a dry template is made wet');assert.equal(p.scenario.weather.wet,true);assert(solvable(p),'a wet remix still solves');}else assert.deepEqual(p.scenario.weather,src.weather,'weather untouched');if(level>=8)n++;}
 assert(wet/n>.06&&wet/n<.3,'wet share from level 8: '+(wet/n).toFixed(2));for(let n2=1;n2<8;n2++)assert.equal(E.endlessRamp(n2).wet,0);assert(E.endlessRamp(8).wet>0&&E.endlessRamp(60).wet<=.3);
 console.log(`PASS wet-pitch remixes: ${wet} of ${n} puzzles from level 8, all solvable`);}

// 9. Coach's eyes: two to start, one back for every third first-try solve in a row, never more than three, none from a retry.
{let r=E.startEndlessRun('eyes');assert.equal(r.eyes,E.ENDLESS_EYES);r=E.spendEye(r);assert.equal(r.eyes,1);r=E.spendEye(r);assert.equal(r.eyes,0);assert.equal(E.spendEye(r),null,'nothing to spend');
 const eyes=[],won=[];for(let i=0;i<12;i++){const y=E.stepEndless(r,{kind:'solve',move:true});r=y.run;eyes.push(r.eyes);won.push(!!y.eye);}assert.deepEqual(eyes,[0,0,1,1,1,2,2,2,3,3,3,3],'one eye per three in a row, capped at '+E.ENDLESS_EYES_MAX);assert.equal(won.filter(Boolean).length,3);
 let f=E.stepEndless(E.startEndlessRun('eyes'),{kind:'fail'}).run;for(let i=0;i<3;i++)f=E.stepEndless(f,{kind:i?'solve':'solve',move:true}).run;assert.equal(f.streak,2,'a retry solve does not count toward the streak');assert.equal(f.eyes,E.ENDLESS_EYES);
 const over={...E.startEndlessRun('eyes'),over:true};assert.equal(E.spendEye(over),null);
 // scoring is untouched by the eyes: the same gains as before
 let g=E.startEndlessRun('s');const gains=[];for(let i=0;i<5;i++){const y=E.stepEndless(g,{kind:'solve',move:true});gains.push(y.gained);g=y.run;}assert.deepEqual(gains,[3,3,3,3,4]);
 console.log('PASS coach\'s eyes: start, spend, win back, cap');}

// 10. The wiring (source text): the eye key, the clock ticks, the life sound, the flying stars and the splash words clear of the HUD.
{const g=fs.readFileSync(path.join(ROOT,'components/games/PassPuzzleGame.tsx'),'utf8'),css=fs.readFileSync(path.join(ROOT,'components/games/PassPuzzleGame.module.css'),'utf8'),au=fs.readFileSync(path.join(ROOT,'lib/arcade/passPuzzleAudio.ts'),'utf8');
 assert(/const endlessEye=\(\)=>\{[^\n]*spendEye\(e\.run\)[^\n]*puzzleEye\(audio\.current\)/.test(g),'the Scan key spends an eye');assert(/scanOpen:e\.scanLevel===run\.level/.test(g),'a bought Scan stays for the retry of that puzzle');
 assert(/function endlessTick\(\)\{[^\n]*clearTimeout\(e\.tickTimer\)/.test(g)&&/puzzleClockTick\(audio\.current,k\)/.test(g),'the last five seconds tick');assert.equal((g.match(/clearTimeout\(e\.clockTimer\);clearTimeout\(e\.tickTimer\);/g)||[]).length,6,'every place that stops the clock stops the ticks');
 assert(/if\(step\.lifeLost\)\{puzzleLifeLost\(/.test(g),'a lost life is heard');assert(/puzzleWipe\(audio\.current,run\.level\)/.test(g),'the change-over is heard');assert(/if\(!newBest\)puzzleRunOver\(/.test(g),'full time has its phrase');
 assert(/else if\(!endless\.current\)shout\.current\(\{text:'So close!'/.test(g),'no generic splash over the run HUD');assert(/data-run=\{endHud\?'endless':undefined\}/.test(g)&&/\[data-run=endless\] \.callout:not\(\[data-tier="3"\]\)\{top:/.test(css),'splash words sit under the note in a run');
 assert(/data-star-fly/.test(g)&&/@keyframes ppStarFly/.test(css)&&/prefers-reduced-motion:reduce\)\{\.starFly\{display:none\}/.test(css),'stars fly to the score; not with reduced motion');assert(/bumpKey=\{endHud\?endHud\.score:undefined\}/.test(g),'the score pill bumps');
 for(const fn of ['puzzleLifeLost','puzzleWipe','puzzleClockTick','puzzleEye','puzzleRunOver','puzzleStarLand'])assert(new RegExp(`export function ${fn}\\(ctx:AudioContext\\|null[^\\n]*\\n if\\(!ready\\(ctx\\)\\)return;`).test(au),fn+' goes through the same gate (mute, hidden tab, voice cap)');
 assert(!/setInterval|\.loop=true/.test(au),'still no loops or intervals in the puzzle voices');
 const sc=fs.readFileSync(path.join(ROOT,'lib/arcade/passPuzzleScene.ts'),'utf8');assert(/cutMark\.visible=endOut\.visible=splat\.visible=false;[^\n]*scenario=s;/.test(sc),'a new puzzle starts with no fail splat left on the grass');
 assert(/const GOAL_FINISH=new Set<string>\(\['top-corner','low-corner','high','placed'\]\)/.test(g)&&/if\(fin&&!GOAL_FINISH\.has\(fin\.kind\)\)why=fin\.line;else if\(fin&&reasonCopy\[reason\?\?''\]\)why=reasonCopy/.test(g),'a goal that did not count is not praised on a failed try');
 assert(/run\.level===5\?'Scans cost 1 now':run\.level===6\?'Clock on!':run\.level===10\?'No hints now':p\.scenario\.weather\?\.wet\?'Wet pitch!'/.test(g),'each step of the ramp is said once as it arrives');
 console.log('PASS endless AAA wiring');}
