// Futbol Pinball pattern labels (Nov 10 2026, arcade part 3): the wall pass, the rebound goal and the 2v1 are named
// the moment the table counts them, at most one label every PATTERN_GAP seconds, through one reused HUD chip.
// Run: node -r ./scripts/test-ts-cache.cjs tests/pinball-patterns.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const P=require('../lib/games/soccerPinballPatterns.ts');
const s={stats:{wallPasses:0,rebounds:0,mbStarts:0}},w=P.createPinballPatternWatch(),dt=1/60;
const run=(sec)=>{let n=0;for(let i=0;i<Math.round(sec/dt);i++)if(P.watchPinballPatterns(w,s,dt))n++;return n;};
assert.equal(run(1),0,'nothing counted, nothing shown');
s.stats.wallPasses=1;assert.equal(P.watchPinballPatterns(w,s,dt),true);assert.equal(w.kind,'wallPass');
assert.equal(P.pinballPatternShown(w).label,'Wall pass!');
s.stats.rebounds=1;assert.equal(run(1),0,'a second pattern inside the gap is dropped');
run(P.PATTERN_SHOW);assert.equal(w.kind,null,'the label ends');assert.equal(P.pinballPatternShown(w).label,'Wall pass!','words kept for the fade-out');
run(1);s.stats.rebounds=2;s.stats.wallPasses=2;assert.equal(run(.1),1);assert.equal(w.kind,'rebound','rebound wins a tie');
run(5);s.stats.mbStarts=1;run(.1);assert.equal(w.kind,'twoVOne');
run(5);s.stats.mbStarts=3;assert.equal(run(1),0,'2v1 is named only on the first two breakaways');
// Copy: every why is five to eight words, no IslandBrush-style shouting.
for(const [k,p] of Object.entries(P.PINBALL_PATTERNS)){const n=p.why.split(/\s+/).length;assert.ok(n>=5&&n<=8,`${k} why is ${n} words`);}
// A new game (stats back to 0) re-arms without a false label.
s.stats={wallPasses:0,rebounds:0,mbStarts:0};P.resetPinballPatternWatch(w);assert.equal(run(1),0);
// Wiring: one chip, always mounted, fed by the HUD; the watcher runs after watchPinballCinema; stepPinball untouched.
const games=fs.readFileSync('lib/arcade/arcadeGames.ts','utf8'),view=fs.readFileSync('components/games/ArcadeGame3D.tsx','utf8'),css=fs.readFileSync('components/games/ArcadeGame3D.module.css','utf8');
assert.match(games,/watchPinballCinema\(pinballCine,pinball\);watchPinballPatterns\(pinballPatterns,pinball,dt\);/);
assert.match(games,/resetPinballPatternWatch\(pinballPatterns\)/);
assert.match(view,/<span className=\{styles\.pbPattern\} data-pinball-pattern data-on=\{hud\.pinballPatternOn\|\|undefined\}>/);
assert.match(css,/prefers-reduced-motion:reduce\)\{\.game\[data-arcade-kind=pinball\] \.pbHud \.pbPattern\{transition:none/);
assert.doesNotMatch(fs.readFileSync('lib/games/soccerPinball.ts','utf8'),/soccerPinballPatterns/,'the sim never imports the labels');
console.log('pinball-patterns: ok');
