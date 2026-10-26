// Pass Puzzles combo beats (Oct 25 2026, docs/ARCADE_PASSPUZZLES_UPGRADE_OCT25.md): live callouts name each completed
// pass of every coach's route played through the real engine (one-twos are found where the levels teach them), the
// first-try streak rules, the celebration plan, and the view/scene/audio wiring. Run: node tests/pass-puzzle-combo.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const root=path.join(__dirname,'..'),lib=f=>require(path.join(root,'lib','passPuzzle',f)),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const P=lib('index.ts'),{ALL_SCENARIOS,ALL_SOLUTIONS}=lib('catalog.ts'),{strokeForKick}=lib('coach.ts'),{isCall}=lib('packs.ts'),C=lib('combo.ts');
const playable=s=>({...s,require:{...s.require,allowDirectShot:s.require.finish==='goal'}});

// Pure rules.
assert.equal(C.passCallout([],0,0),null);
assert.equal(C.passCallout([{kicker:0,firstTime:false}],1,1).text,'Nice pass!');
assert.equal(C.passCallout([{kicker:0,firstTime:false},{kicker:1,firstTime:false}],0,2).text,'One-two!','wall pass back to the first passer');
assert.equal(C.passCallout([{kicker:0,firstTime:false},{kicker:1,firstTime:true}],2,2).text,'First time!');
assert.equal(C.passCallout([{kicker:0,firstTime:false},{kicker:1,firstTime:false}],2,2).text,'Keep it moving!');
assert.match(C.passCallout([{kicker:0,firstTime:false},{kicker:1,firstTime:false},{kicker:2,firstTime:false}],3,3).text,/Tiki-taka ×3/);
assert.equal(C.goalCallout(0,false).text,'GOAL! Straight in');assert.equal(C.goalCallout(3,true).text,'GOAL! 3-pass move');assert.equal(C.goalCallout(2,false).tier,3);
assert.equal(C.nextStreak(0,true,true),1);assert.equal(C.nextStreak(2,true,true),3);assert.equal(C.nextStreak(2,true,false),2,'a later-try solve keeps it');assert.equal(C.nextStreak(4,false,true),0);
assert.equal(C.streakLabel(1),'');assert.equal(C.streakLabel(3),'Streak ×3');
assert.equal(C.celebrationFor(2,2,1,1),'airplane');assert.equal(C.celebrationFor(2,2,1,2),'kneeSlide');assert.equal(C.celebrationFor(1,2,1,1),'highFive');
assert.ok(['fistBump','thankPasser'].includes(C.celebrationFor(0,2,1,1)));

// Every coach's route through the real engine: every completed pass gets a callout, every goal a goal callout.
let passes=0,named=0,oneTwos=0,goals=0;
for(const sc of ALL_SCENARIOS){const r=ALL_SOLUTIONS[sc.id];if(!r)continue;const w=P.createPuzzle(playable(sc)),steps=r.solution;let i=0,seen=0;
 for(let g=0;g<120*40;g++){const ph=w.state.phase;if(ph==='success'||ph==='fail')break;
  if(ph==='aiming'){if(i>=steps.length)break;const st=steps[i++];if(isCall(st)){w.callRun(st.call.attacker,st.call.to);continue;}if(!w.kick(P.readStroke(strokeForKick(w,st),w)))break;}
  w.step(1/120);
  for(const e of w.drain()){
   if(e.type==='receive'&&w.state.passes>seen){seen=w.state.passes;passes++;const c=C.passCallout(w.state.chain,e.attacker,w.state.passes);assert.ok(c&&c.text&&c.teach,sc.id+' pass callout');if(c.tier>=2)named++;if(c.text==='One-two!')oneTwos++;}
   if(e.type==='goal'){goals++;const c=C.goalCallout(w.state.passes,!!w.state.chain.at(-1)?.firstTime);assert.equal(c.tier,3);assert.match(c.text,/^GOAL!/);}}}}
assert.ok(passes>40,'routes complete many passes ('+passes+')');assert.ok(goals>10,'routes score ('+goals+')');assert.ok(oneTwos>=1,'one-two levels are named as one-twos');assert.ok(named>=5,'named combinations appear');

// Wiring: the view shouts live (not in replays), the streak is session only, the scene runs authored celebration lengths.
const tsx=read('components/games/PassPuzzleGame.tsx'),scene=read('lib/arcade/passPuzzleScene.ts'),audio=read('lib/arcade/passPuzzleAudio.ts'),css=read('components/games/PassPuzzleGame.module.css');
assert.match(tsx,/if\(!replayRef\.current&&w&&e\.attacker!=null\)\{const c=passCallout/);assert.match(tsx,/puzzleGoalRoar\(ctx,passes\)/);assert.match(tsx,/nextStreak\(streak\.current,success,s\.attempt===1&&!rewound\.current\)/);
assert.doesNotMatch(tsx.slice(tsx.indexOf('function writeProgress'),tsx.indexOf('function childFormat')),/streak/,'streak never saved');
assert.match(scene,/SKILL_MOVES\[c\.type\]\.seconds/);assert.doesNotMatch(scene,/goalAge<1\.5/,'old rushed 1.5 s celebration window gone');
assert.match(scene,/confettiGeo\.dispose\(\)/);assert.match(scene,/if\(!stage\.reduced\)launchConfetti/);assert.match(scene,/state\.flight\?\.receiver===i&&a\.receiveLeft<=0/);
for(const f of ['puzzleShotWhoosh','puzzleGoalRoar','puzzleCrowdOoh','puzzleCombo','puzzleStreak'])assert.match(audio,new RegExp('export function '+f+'\\(ctx:AudioContext\\|null[^)]*\\)\\{\\n if\\(!ready\\(ctx\\)'),f+' respects the voice gate');
assert.doesNotMatch(audio,/setInterval|setTimeout|requestAnimationFrame/,'audio stays one-shot');
assert.match(css,/prefers-reduced-motion:no-preference\)\{\.callout\{animation/);
console.log(`PASS pass-puzzle combo: ${passes} route passes called (${named} named, ${oneTwos} one-twos), ${goals} goal callouts; streak + celebration rules; wiring`);
