// Pass Puzzles simple start menu (Oct 26 owner feedback: "way too complex and cluttered").
// One primary Play button that continues where the child left off, no setup before play, team size + heading behind
// a settings sheet with remembered defaults, and nothing on the menu that blocks a first play. Run: node tests/pass-puzzle-menu-simple.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const tsx=read('components/games/PassPuzzleGame.tsx'),css=read('components/games/PassPuzzleGame.module.css');
const start=tsx.indexOf("{view==='levels'&&"),end=tsx.indexOf("{view==='brief'&&level&&");assert(start>0&&end>start,'menu block found');
const menu=tsx.slice(start,end);
const home=menu.slice(menu.indexOf("{menu==='home'&&"),menu.indexOf("{menu==='pack'&&"));
const sheet=menu.slice(menu.indexOf("{menu==='settings'&&"));

// 1. One primary Play button on the home view, and it is the only primary there.
assert.equal((home.match(/arcade\.primary/g)??[]).length,1,'exactly one primary button on the home menu');
assert.match(home,/data-play[^>]*onClick=\{quickPlay\}/,'the primary is Play');
assert.match(home,/<b>Play<\/b>/,'labelled Play');
// Play = continue: loads the next unfinished level and starts it in the same tap (no brief, no question).
const qp=/const quickPlay=\(\)=>\{([^\n]*)\};/.exec(tsx);assert(qp,'quickPlay defined');
assert.match(qp[1],/loadLevel\(continueLevel\)/);assert.match(qp[1],/play\(\)/);assert.doesNotMatch(qp[1],/setView\('brief'\)|setMenu/,'no brief or sheet before play');
assert.match(tsx,/const continueLevel=MAP_ORDER\.find\(s=>packOpen\(s\)&&!\(progress\.stars\[s\.id\]>0\)\)/,'continue = first unsolved puzzle in an open pack');

// 2. The old clutter is gone from the menu: the chip, the blurb, the inline format/heading questions, the big leaderboard pill.
for(const gone of ['FREEZE · DRAW · PLAY','Find the open teammate. Draw a pass, then watch','How do you play football?','Heading the ball','Small-sided','stars collected · saved on this device','arcade.boards'])
 assert(!menu.includes(gone),'removed from the menu: '+gone);
assert(!/chooseFormat|chooseHeading/.test(home),'no setup controls on the home view');
assert.match(home,/firstRun\?'Draw a pass to the open teammate\.'/,'the one-line hint shows on the first run only');
assert.match(home,/data-boards[^>]*>|setBoardsOpen\(true\)/,'leaderboard is a small icon chip');
assert.match(home,/data-daily/,'compact daily tile');assert.match(home,/data-pack=\{p\.id\}/,'pack grid');assert.match(home,/data-current=\{continueLevel\?\.pack===p\.id/,'current pack highlighted');

// 3. The settings sheet holds team size + heading (with the US youth rule), and Done remembers the shown defaults.
assert.match(sheet,/data-format-choice[\s\S]*FORMATS\.map[\s\S]*chooseFormat\(f\)/,'team size in the sheet');
assert.match(sheet,/data-heading-choice[\s\S]*chooseHeading\(on\)/,'heading in the sheet');
assert.match(sheet,/US youth rule: no heading at 10 and under\./,'age-safety rule kept, short');
assert.match(sheet,/progress\.format===undefined&&[^\n]*data-ask-once/,'asks once, only when never set');
assert.match(tsx,/const saveSettings=\(\)=>\{setProgress\(p=>\{const next=\{\.\.\.p,format,heading:headingAllowed\(p,format\)\};writeProgress\(next\)/,'Done saves the defaults');
assert.match(tsx,/const headingAllowed=\(p:Progress,f:Format\)=>p\.heading\?\?f!=='7v7';/,'heading default unchanged (off in 7v7)');
assert.match(tsx,/setFormat\(p\.format\?\?childFormat\(\)\?\?'9v9'\)/,'format default unchanged');
assert.match(home,/data-unset=\{progress\.format===undefined\|\|undefined\}/,'a dot invites a first look, never blocks');

// 4. Nothing hidden blocks a first play: Play is rendered on the home view unconditionally (apart from a level existing),
//    and the menu opens on home.
assert.match(tsx,/useState<'home'\|'pack'\|'settings'(\|'expert')?>\('home'\)/,'menu opens on home');
assert.match(home,/\{continueLevel&&<button className=\{`\$\{arcade\.primary\} \$\{styles\.playBig\}`\}/,'Play only waits for a level');

// 5. Economy, stars, unlocks, saves and the free replay are untouched.
assert.match(tsx,/Replay level · free/);assert.match(tsx,/const play=async\(\)=>\{unlock\(\);const id=await entry\.enter\(\);/,'Play goes through the same entry/coin path');
assert.match(tsx,/const PROGRESS_KEY='fi2-pass-puzzles-v1';/);assert.match(tsx,/open=packGateOpen\(p,totalStars\)/,'pack gates by stars');

// 6. Tap targets and no scrolling.
assert.match(css,/\.chip\{[^}]*width:48px;height:48px/,'48px chips');
assert.match(css,/\.packMap button\{[^}]*min-height:52px/);assert.match(css,/\.seg button\{[^}]*min-height:52px/);assert.match(css,/\.daily\{[^}]*min-height:48px/);
assert.match(css,/@media\(max-height:520px\) and \(orientation:landscape\)\{\n \.game \.menuOverlay/,'landscape two-column menu');

// 7. Continue logic against the real catalog: first run = level 1; after solving it, the next puzzle.
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const Module=require('module'),orig=Module._resolveFilename;Module._resolveFilename=function(r,...a){if(r.startsWith('@/'))r=path.join(ROOT,r.slice(2));return orig.call(this,r,...a);};
const C=require(path.join(ROOT,'lib/passPuzzle/catalog.ts'));
const cont=stars=>{const total=Object.values(stars).reduce((a,b)=>a+b,0),open=s=>{const p=C.ALL_PACKS.find(x=>x.id===s.pack);return !p||C.packGateOpen(p,total);};
 return C.MAP_ORDER.find(s=>open(s)&&!(stars[s.id]>0))??C.MAP_ORDER.find(s=>open(s)&&(stars[s.id]??0)<3)??C.MAP_ORDER[0];};
assert.equal(cont({}).id,C.MAP_ORDER[0].id,'first run: level 1');
assert.equal(cont({[C.MAP_ORDER[0].id]:1}).id,C.MAP_ORDER[1].id,'then the next puzzle');
const all=Object.fromEntries(C.MAP_ORDER.map(s=>[s.id,3]));assert.equal(cont(all).id,C.MAP_ORDER[0].id,'all done: back to the start');
console.log('pass-puzzle-menu-simple: ok');
