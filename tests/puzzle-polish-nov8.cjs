// Pass Puzzles polish (Nov 8 2026): Pro Cup + Legend Cup tiers with their own boards, the skill multiplier (cup points),
// every new puzzle proven by the engine, server validation + caps, the SQL allow-list, pooled sounds, reduced motion and the
// simplified UI wiring. Run: node tests/puzzle-polish-nov8.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,f);
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const lib=f=>require(path.join(ROOT,'lib','passPuzzle',f));
const P=lib('index.ts'),{isCall}=lib('packs.ts'),{youthScenario}=lib('youth.ts'),C=lib('catalog.ts'),T=lib('tiers.ts');
const L=require(path.join(ROOT,'lib','arcade','leaderboard.ts'));

function strokeFor(w,k,{dx=0,dz=0}={}){const s=w.state,b=s.ball.p,g=w.scenario.pitch,goalZ=g.length/2,hg=g.goalWidth/2-0.25;let end;
 if(k.kind==='shot')end={x:Math.max(-hg,Math.min(hg,k.target.x+dx)),z:goalZ+2};else if((k.kind==='pass-feet'||k.kind==='header')&&k.receiver!=null){const a=s.attackers[k.receiver].p;end={x:a.x+dx,z:a.z+dz};}else end={x:k.target.x+dx,z:k.target.z+dz};
 const DX=end.x-b.x,DZ=end.z-b.z,Ln=Math.hypot(DX,DZ),nx=DZ/Ln,nz=-DX/Ln,bow=k.curl?Math.sign(k.curl)*(Math.abs(k.curl)*0.22*Ln+0.4):0,loft=k.loft>0?Math.min(1,Math.max(0.16,k.loft)):0,hold=loft>0?0.25+(loft-0.15)*0.45/0.85+0.002:0;
 const pts=[],n=Math.max(3,Math.min(24,Math.floor(Ln/0.5)));for(let i=0;i<=n;i++){const u=i/n,o=Math.sin(Math.PI*u)*bow;pts.push({x:b.x+DX*u+nx*o,z:b.z+DZ*u+nz*o,t:u*.4});}
 if(hold>0){for(let t=0.05;t<hold;t+=0.05)pts.push({x:end.x+0.02,z:end.z,t:.4+t});pts.push({x:end.x,z:end.z,t:.4+hold});}return pts;}
function play(sc,route,slop={}){const w=P.createPuzzle(sc),ev=[];w.on(e=>ev.push(e));let i=0;
 for(let g=0;g<120*40;g++){const ph=w.state.phase;if(ph==='success'||ph==='fail')break;
  if(ph==='aiming'){if(i>=route.length)break;const st=route[i++];if(isCall(st)){assert(w.callRun(st.call.attacker,st.call.to));continue;}const k=P.readStroke(strokeFor(w,st,slop),w);if(st.kind!=='pass-space')assert.equal(k.kind,st.kind,sc.id+' draws as '+st.kind);assert(w.kick(k));}
  w.step(1/120);}return{w,ev};}

/* 1. two tiers, separate packs, separate boards, gates above Expert and reachable from classic stars */
assert.deepEqual(T.PUZZLE_TIER_IDS,['pro','legend']);
assert.deepEqual(T.PUZZLE_TIER_IDS.map(t=>T.PUZZLE_TIERS[t].board),['puzpro','puzlgnd']);
const classicStars=C.ALL_SCENARIOS.length*3,expertTop=Math.max(...C.ALL_PACKS.map(p=>p.gate));
assert(T.PUZZLE_TIERS.pro.gate>expertTop&&T.PUZZLE_TIERS.legend.gate>T.PUZZLE_TIERS.pro.gate&&T.PUZZLE_TIERS.legend.gate<=classicStars*.75,'cup gates sit above Expert and stay reachable');
assert(T.PUZZLE_TIERS.legend.attempts<T.PUZZLE_TIERS.pro.attempts,'Legend gives fewer tries');
// the classic catalogue is untouched: cup puzzles are not in ALL_SCENARIOS / MAP_ORDER (classic star board never mixes)
assert(!C.ALL_SCENARIOS.some(s=>T.isTierPuzzle(s.id))&&!C.MAP_ORDER.some(s=>T.isTierPuzzle(s.id)));
assert.equal(T.TIER_SCENARIOS.length,12);for(const t of T.PUZZLE_TIER_IDS)assert.equal(T.TIER_SCENARIOS.filter(s=>s.pack===T.PUZZLE_TIERS[t].pack).length,6);
// routes are reachable through the shared catalogue (coach's route + hint spot)
for(const s of T.TIER_SCENARIOS)assert(C.ALL_SOLUTIONS[s.id]&&C.routeFor(s.id,false).length>0,s.id+' route in catalogue');
assert.equal(T.boardForPuzzle('pc-scan-and-strike'),'puzpro');assert.equal(T.boardForPuzzle('lc-two-hunters'),'puzlgnd');assert.equal(T.boardForPuzzle('fp-find-a-friend'),'puzzle');

/* 2. new puzzles: unique ids/titles/layouts, kid copy limits, every one harder (clock + a moving defender) */
const words=s=>s.split(/\s+/).filter(x=>/[A-Za-z0-9]/.test(x)),LIM={'7v7':[12,24],'9v9':[18,30],'11v11':[22,34]};
const JARGON=/\b(goal-side|half-space|overload\w*|third[- ]man|channel|press trigger|centre-back|full-back|lay-off|recycle|point of attack|between the lines|in stride|weight)\b/i;
const titles=new Set(C.ALL_SCENARIOS.map(s=>s.title)),ids=new Set(C.ALL_SCENARIOS.map(s=>s.id));
const layout=s=>JSON.stringify([s.attackers.map(a=>[a.x,a.z]),s.defenders.map(d=>[d.x,d.z,!!d.hunt,!!d.recover,d.trap??0]),s.keeper?.sweeper??false]);
const layouts=new Set(C.ALL_SCENARIOS.map(layout));
for(const sc of T.TIER_SCENARIOS){assert(!ids.has(sc.id)&&!titles.has(sc.title),sc.id+' new id + title');titles.add(sc.title);ids.add(sc.id);
 assert(!layouts.has(layout(sc)),sc.id+' is a new layout, not a copy');layouts.add(layout(sc));
 assert(sc.require.clock>0&&(sc.defenders.some(d=>d.hunt||d.recover||d.trap)||sc.keeper?.sweeper),sc.id+' has the clock and a moving defender');
 assert.equal(sc.require.offside,true);assert(sc.bonus);assert(sc.lesson.length>=20&&sc.lesson.length<=110);
 for(const key of ['brief','hint'])for(const [f,[sent,tot]] of Object.entries(LIM)){const t=sc[key][f];assert(words(t).length<=tot,`${sc.id} ${key} ${f}`);for(const s of t.split(/(?<=[.!?:;])\s+/))assert(words(s).length<=sent,`${sc.id} ${key} ${f}: "${s}"`);if(f==='7v7')assert(!JARGON.test(t),sc.id+' 7v7 jargon');}}

/* 3. the solver: every route solves when drawn, earns the bonus, beats the clock, replays identically, survives a sloppy finger,
      works with heading off; the naive pass fails. The ramp climbs: more passes / a tighter clock share further in. */
for(const sc of T.TIER_SCENARIOS){const {solution,naive}=T.TIER_SOLUTIONS[sc.id];
 const r=play(sc,solution);assert.equal(r.w.state.phase,'success',`${sc.id}: ${JSON.stringify(r.w.state.result)}`);assert(r.w.state.result.bonus,sc.id+' bonus');
 assert(r.w.state.t<=sc.require.clock,sc.id+' beats the clock');
 const rp=P.replay(r.w.attemptStart(),r.w.inputs()).run();assert.deepEqual(rp.map(e=>[e.type,e.tick]),r.ev.map(e=>[e.type,e.tick]),sc.id+' replay');
 assert.notEqual(play(sc,naive).w.state.phase,'success',sc.id+' naive fails');
 let good=0;for(const s of [{dx:.4},{dx:-.4},{dz:.4},{dz:-.4}])if(play(sc,solution,s).w.state.phase==='success')good++;assert(good>=3,`${sc.id} sloppy ${good}/4`);
 assert.equal(play(youthScenario(sc),solution).w.state.phase,'success',sc.id+' youth');
 // the clock is tight: the same route with 40% less time fails
 assert.notEqual(play({...sc,require:{...sc.require,clock:sc.require.clock*.6}},solution).w.state.phase,'success',sc.id+' clock matters');}
const avgPasses=p=>{const l=T.TIER_SCENARIOS.filter(s=>s.pack===p);return l.reduce((n,s)=>n+s.require.minPasses,0)/l.length;};
assert(avgPasses('legend-cup')>=avgPasses('pro-cup'),'Legend asks for longer moves');
const firstHalf=l=>l.slice(0,3).reduce((n,s)=>n+s.require.minPasses,0),secondHalf=l=>l.slice(3).reduce((n,s)=>n+s.require.minPasses,0);
for(const t of T.PUZZLE_TIER_IDS){const l=T.TIER_SCENARIOS.filter(s=>s.pack===T.PUZZLE_TIERS[t].pack);assert(secondHalf(l)>firstHalf(l),t+' ramps up inside the cup');}

/* 4. skill multiplier: readable parts, ×1 base, capped, cup points and board sums */
{const base={stars:3,firstTry:false,passes:3,minPasses:2,throughBall:false,oneTouch:0};
 assert.equal(T.skillMultiplier(base).mult,1);assert.deepEqual(T.skillMultiplier(base).parts,[]);
 const all=T.skillMultiplier({...base,firstTry:true,passes:2,throughBall:true,oneTouch:5,clock:6,clockLeft:3});
 assert.equal(all.mult,T.SKILL_MAX);assert.deepEqual(all.parts.map(p=>p.key),['first-try','clean','through','one-touch','quick']);
 assert.equal(T.SKILL_MAX,2.75);assert.equal(T.TIER_PUZZLE_MAX,825);
 assert.equal(T.cupPoints({...base,stars:0}),0);assert.equal(T.cupPoints(base),300);assert.equal(T.cupPoints({...base,stars:2,firstTry:true}),300);
 assert.equal(T.skillMultiplier({...base,clock:6,clockLeft:1}).parts.length,0,'no time bonus with under a quarter of the clock left');
 for(const p of all.parts)assert(words(p.label).length<=3,'chip label short: '+p.label);
 const best=Object.fromEntries(T.TIER_SCENARIOS.map(s=>[s.id,99999]));assert.equal(T.tierBoardScore(best,'pro'),T.tierBoardMax('pro'));
 assert.equal(T.tierBoardScore({'pc-scan-and-strike':300,'lc-two-hunters':500,'fp-find-a-friend':3},'pro'),300,'a cup board only sums its own cup');}

/* 5. boards: new ids, own rules (caps above the max sum, no per-second rule), server validation, one row per letters */
for(const g of ['puzpro','puzlgnd']){assert(L.isBoardGame(g),g);assert(/^[a-z]{2,8}$/.test(g));const r=L.BOARD_RULES[g];
 const tier=T.PUZZLE_TIER_IDS.find(t=>T.PUZZLE_TIERS[t].board===g);assert(r.max>=T.tierBoardMax(tier)&&r.max<=400000,g+' ceiling');assert.equal(r.perSecond,0);assert(r.base>=T.tierBoardMax(tier));
 assert(L.scoreInBounds(g,T.tierBoardMax(tier))&&!L.scoreInBounds(g,r.max+1)&&!L.scoreInBounds(g,0));
 // a running total keeps one row per letters (the best), like the classic star board
 let b=L.emptyLocalBoards();b=L.addLocalScore(b,g,{initials:'ABC',icon:'',score:300,now:Date.parse('2026-11-08T12:00:00Z')}).boards;b=L.addLocalScore(b,g,{initials:'ABC',icon:'',score:900,now:Date.parse('2026-11-08T12:00:00Z')}).boards;
 assert.deepEqual(b.boards[g].map(x=>x.score),[900]);assert.equal(b.boards.puzzle,undefined,'classic board untouched');}
assert.equal(L.BOARD_RULES.puzzle.max,300,'classic star board rules unchanged');
{const SV=require(path.join(ROOT,'lib','arcade','leaderboardServer.ts'));assert.equal(typeof SV.handleBoard,'function');}
const files=fs.readdirSync(path.join(ROOT,'supabase/migrations')).sort(),f='20261110_puzzle_tier_boards.sql';assert(files.includes(f));
const widen=files.filter(x=>/arcade_scores_game_check/.test(read('supabase/migrations/'+x)));/* Nov 10 2026: 20261112_runner_route_boards.sql now runs after it (and names every board, puzzle cups included) */assert(widen.includes(f)&&widen.indexOf(f)>=widen.length-2,'runs after the earlier board files');{const last=read('supabase/migrations/'+widen[widen.length-1]);for(const g of L.BOARD_GAMES)assert(last.includes(`'${g}'`),'the last allow-list keeps '+g);}
const sql=read('supabase/migrations/'+f);for(const g of L.BOARD_GAMES.filter(g=>!['runwarm','runnight','runstorm','rundaily'].includes(g)))assert(sql.includes(`'${g}'`),'SQL allows '+g);
assert(/'OK, puzzle cup boards installed'/.test(sql));assert(!/\bdrop\s+(table|function|column)|truncate|delete from|\bupdate\s+public/i.test(sql.replace(/--.*$/gm,'')),'additive');
// Economy: cup puzzles pay through the same recordPuzzleBest path (first solve + new stars), nothing new.
assert(!/puzpro|puzlgnd|cupPoints/.test(read('lib/arcade/arcadeWalletCore.ts'))&&!/puzpro|puzlgnd/.test(read('lib/economy.ts')),'no new coin source');

/* 6. game wiring (source checks): cups on the Expert sheet, own board per puzzle, cup points on the result card, one-row dock,
      one primary per card, pooled sounds, reduced motion, cheap visuals (no new mesh / light). */
{const tsx=read('components/games/PassPuzzleGame.tsx'),css=read('components/games/PassPuzzleGame.module.css'),scene=read('lib/arcade/passPuzzleScene.ts'),audio=read('lib/arcade/passPuzzleAudio.ts');
 assert.match(tsx,/const SCENARIOS=\[\.\.\.ALL_SCENARIOS,\.\.\.TIER_SCENARIOS\],PACKS=\[\.\.\.ALL_PACKS,\.\.\.TIER_PACKS\];/);
 assert.match(tsx,/k\.startsWith\('daily'\)\|\|isTierPuzzle\(k\)\?n:n\+v/,'cup stars never reach the classic star board');
 assert.match(tsx,/boardRef\.current=boardForPuzzle\(s\.id,s\.pack\)/);assert.match(tsx,/beginBoardSession\(boardRef\.current\)/,'the play token is for the puzzle\'s own board');
 assert.match(tsx,/<HighScoreEntry game=\{boardGame\}/);assert.match(tsx,/setBoardGame\(cupTier\.board\);setBoardScore\(total\)/,'a new cup best posts the cup total');
 assert.match(tsx,/&&!cupTier\)\{setBoardGame\('puzzle'\)/,'classic star board only for classic puzzles');
 assert.match(tsx,/corePacks=PACKS\.filter\(p=>p\.tier!=='expert'&&!tierOfPack\(p\.id\)\)/,'cups are not on the home pack map (no new home button)');
 const home=tsx.slice(tsx.indexOf("{menu==='home'&&"),tsx.indexOf("{menu==='expert'&&"));assert.equal((home.match(/arcade\.primary/g)??[]).length,1,'home keeps one primary');
 assert.match(tsx,/data-cup-tile=\{t\}/);assert.match(tsx,/data-skill data-new-best/);
 const result=tsx.slice(tsx.indexOf("{view==='result'&&outcome&&level&&"),tsx.indexOf('{error&&'));assert.equal((result.match(/arcade\.primary/g)??[]).length,3,'result: exactly one primary per branch (next / all puzzles / try again)');
 assert.match(result,/styles\.quietRow/,'secondary actions are one quiet row');assert(!/rewindNote/.test(result),'rewind note copy removed');
 const brief=tsx.slice(tsx.indexOf("{view==='brief'&&level&&"),tsx.indexOf("{view==='result'&&outcome&&level&&"));assert(!/directHint/.test(brief),'brief lost the extra direct-shot line');assert.equal((brief.match(/arcade\.primary/g)??[]).length,1);
 // the dock: Scan + flight modes in one row; power only in a manual mode; Auto resets to automatic power
 assert.match(tsx,/data-compact=\{controlMode==='auto'\|\|undefined\}/);assert.match(tsx,/\{controlMode!=='auto'&&<label className=\{styles\.powerControl\}>/);assert.match(tsx,/if\(mode==='auto'\)\{controls\.current\.power=undefined;setPower\(null\);\}/);
 // sounds: snap tick (primitive refs, no allocation), intercept buzz, UI tap, skill chimes, new best; all through the voice pool
 assert.match(tsx,/if\(r!==snapReceiver\.current\|\|clear!==snapClear\.current\)\{if\(r>=0\)puzzleSnapTick/);assert.match(tsx,/puzzleIntercept\(ctx\)/);assert.match(tsx,/puzzleSkillChime\(/);assert.match(tsx,/puzzleNewBest\(/);assert.match(tsx,/puzzleUiTap\(/);
 for(const f of ['puzzleSnapTick','puzzleIntercept','puzzleUiTap','puzzleSkillChime','puzzleNewBest']){const body=audio.slice(audio.indexOf('export function '+f));assert.match(body.slice(0,body.indexOf('\n}')),/if\(!ready\(ctx\)\)return;/,f+' respects the pool, mute and hidden tab');}
 assert.match(audio,/const MAX_VOICES=8;/,'voice pool unchanged');assert(!/new Audio\(|fetch\(|\.mp3|\.wav/.test(audio),'no sound files');
 // visuals: the steal flash reuses the pooled pop ring; the cup tint reuses the trail; no new mesh, light or texture
 assert.match(scene,/case 'intercept':[^\n]*popMat\.color\.copy\(POP_STEAL\)/);assert.match(scene,/function setTier\(look:'gold'\|'violet'\|null\)/);
 const added=scene.slice(scene.indexOf('// Nov 8 2026: the same pooled ring'),scene.indexOf("function clearBeats"));assert(!/new T\.(Mesh|\w*Light|\w*Texture|\w*Geometry)\(/.test(added),'no new mesh/light/texture');
 // reduced motion: shake, pops and the best flash only under no-preference; the shake also checks stage.reduced; hit-stop unchanged
 const rm=css.slice(css.indexOf('/* Nov 8 2026 polish'));assert.match(rm,/@media\(prefers-reduced-motion:no-preference\)\{\n \.skill \.mult/);
 assert(!/\n\.game\[data-shake/.test(rm),'shake is only inside the no-preference block');assert.match(tsx,/!sceneRef\.current\?\.stage\.reduced\)shake\(/);
 assert.match(tsx,/hitStop\.current=performance\.now\(\)\+\(e\.type==='goal'\?90:45\)/,'hit-stop unchanged');
 // CSS modules rule: every new selector starts from a local class
 for(const line of rm.split('\n').filter(l=>/^\s*[.\w[]/.test(l)&&l.includes('{')&&!/^\s*@/.test(l)&&!/^\s*(from|to|\d+%)/.test(l)))assert.match(line.trim(),/^\.[a-zA-Z]/,'local class first: '+line.trim().slice(0,60));
 // tap targets: the quiet row and dock keep 44 px
 assert.match(css,/\.quietRow>\.secondary\.secondary\{[^}]*min-height:44px/);assert.match(css,/\.game \.passModes button,\.game \.scanToggle\{min-height:52px\}/);
 // the cup's look uses existing arcade colours only
 for(const c of (rm.match(/#[0-9a-fA-F]{6}/g)??[]))assert(/^#(ffd45c|c39bff|b994ff|e8bc58|8cff9e|a9bed6|1c2440|2c3a5c|2b2440|3a3120|f1eaff|fff4d8|f3f6ff|c9d7ea|d8f7f3|ffd45c00|ffd45c80)$/i.test(c),'palette colour '+c);}
/* UI_CHECKS */
console.log('puzzle-polish-nov8 ok');
