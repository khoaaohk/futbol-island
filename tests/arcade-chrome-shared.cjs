// One arcade score bar + one pause card (owner, Oct 27 2026: "match the score bar at the top for all the games that make sense…
// keep the bar simple as possible" and "also do the same for the pause modal. keep them consistent as possible").
// docs/ARCADE_CHROME_OCT27.md. Source contract: all five games (Strikers, Tennis, Pinball, Breakaway Run, Pass Puzzles) render
// components/arcade/ArcadeTopBar + ArcadePauseCard; the old per-game headers and pause cards are gone. Run: node tests/arcade-chrome-shared.cjs
const assert=require('node:assert/strict'),fs=require('node:fs');
const read=f=>fs.readFileSync(f,'utf8');
const bar=read('components/arcade/ArcadeTopBar.tsx'),barCss=read('components/arcade/ArcadeTopBar.module.css');
const card=read('components/arcade/ArcadePauseCard.tsx'),cardCss=read('components/arcade/ArcadePauseCard.module.css');
const live=read('components/LiveArcadeMatch.tsx'),a3d=read('components/games/ArcadeGame3D.tsx'),puzzle=read('components/games/PassPuzzleGame.tsx');

// The bar: Back · ONE pill · Pause. No detail line; the pill holds a value + at most one word, or Strikers' Gold n · clock · n Blue.
const ret=bar.slice(bar.indexOf(' return <header'));
assert.match(ret,/<BackButton label="Arcade"/,'Back on the left');
assert.equal((ret.match(/className=\{styles\.pill\}/g)||[]).length,2,'one pill (versus or single value), never both');
assert.match(ret,/<b key=\{bumpKey\}[^>]*>\{value\}<\/b>\{word&&<span>\{word\}<\/span>\}/,'value plus one short word');
assert.match(ret,/<span>Gold<\/span><b[^>]*>\{versus\.gold\}<\/b><time>\{versus\.clock\}<\/time><b[^>]*>\{versus\.blue\}<\/b><span>Blue<\/span>/,'Strikers pill');
assert.match(ret,/data-arcade-pause onClick=\{onPause\} disabled=\{!canPause\} aria-label=\{label\}/,'Pause on the right keeps an aria label');
assert.doesNotMatch(ret,/detail|tries|attempt/,'no second detail line');
assert.match(bar,/pauseLabel='Pause game',resumeLabel='Resume game'/,'default aria labels as before');
assert.match(barCss,/env\(safe-area-inset-top,0px\)/,'safe-area top inset');assert.match(barCss,/env\(safe-area-inset-left,0px\)/);assert.match(barCss,/env\(safe-area-inset-right,0px\)/);
assert.match(barCss,/padding:calc\(var\(--arcade-edge-top,14px\) \+ env\(safe-area-inset-top,0px\)\) calc\(var\(--arcade-edge-x,18px\)/,'bar gutters from the arcade tokens');
assert.match(barCss,/@media \(max-height:520px\)\{\n \.bar\.bar\{padding-bottom:4px\}/,'slim bar on short landscape (tokens step down to 6 / 16 px)');
// The pause card: Paused, optional score, ONE big Resume, small Arcade (+ extra) + Restart row, keycaps on fine pointers only.
assert.match(card,/<h2 className=\{styles\.title\} data-arcade-pause-title>Paused<\/h2>/);// Nov 10 2026: the title carries the per-game skin hook
assert.equal((card.match(/className=\{styles\.resume\}/g)||[]).length,1,'one big Resume');
assert.match(card,/>Arcade<\/button>/);assert.match(card,/\{onRestart&&<button[^>]*>Restart<\/button>\}/,'Restart only when the game supports it');
assert.match(cardCss,/@media \(pointer:coarse\)\{\.keys\.keys\{display:none\}\}/,'keycaps hidden on touch');
assert.match(cardCss,/\.overlay\{position:fixed;inset:0/,'one backdrop over the whole window');
// Heat: no new loops (one-shot score bump only).
for(const css of [barCss,cardCss])assert.doesNotMatch(css,/infinite/,'no looping animation');
assert.doesNotMatch(bar+card,/requestAnimationFrame|setInterval/,'no timers');

// Strikers: two-sided pill with the clock; Pause / Resume labels kept; the shared pause card (with keycaps on desktop).
assert.match(live,/<ArcadeTopBar game="live" overlay=\{false\}[^\n]*versus=\{\{gold:view\.gold,blue:view\.blue,clock:view\.pens\|\|clock\}\}[^\n]*pauseLabel="Pause" resumeLabel="Resume"\/>/);
assert.match(live,/\{phase==='paused'&&!failed&&<ArcadePauseCard game="live"[^\n]*keys=\{touchDevice\?undefined:KEY_LIST\}\/>\}/);
assert.doesNotMatch(live,/<header className=\{styles\.header\}|Resume match|>Paused<\/h2>/,'old header and pause branch gone');
// Tennis, Pinball, Breakaway: one bar for the three, one pause card; the old header, RunnerTopBar and per-game pause cards are gone.
assert.match(a3d,/<ArcadeTopBar game=\{kind\} className=\{styles\.topBar\}[^\n]*value=\{kind==='tennis'\?undefined:hud\.score\}/);// Nov 10 2026: tennis renders no pill (its slat board is the score), instead of hiding one from its skin
assert.match(a3d,/\{phase==='paused'&&!error&&<ArcadePauseCard game=\{kind\}[^\n]*keys=\{touchDevice\?undefined:PAUSE_KEYS\[kind\]\}\/>\}/);
assert.match(a3d,/\{card&&!\(phase==='paused'&&!error\)&&<div className=\{styles\.overlay\}>/,'start / full-time cards stay game-specific');
assert.doesNotMatch(a3d,/RunnerTopBar|styles\.headerScore|hud\.detail\|\|/,'old headers gone');
assert.ok(!fs.existsSync('components/games/RunnerTopBar.tsx'),'runner-only bar folded into the shared one');
assert.doesNotMatch(read('components/games/TennisCard.tsx'),/data-tennis-card="paused"/,'Tennis pause branch gone');
assert.doesNotMatch(read('components/games/RunnerMenu.tsx'),/data-runner-pause|onRestart/,'Breakaway pause card gone');
// Pass Puzzles: pass count in the pill (no tries line), a real pause (the draw loop sleeps, touches ignored), Puzzles on the card.
assert.match(puzzle,/<ArcadeTopBar game="pass-puzzle"[^\n]*value=\{view!=='levels'\?progressHud\.count:undefined\} word=\{progressHud\.label\}/);
assert.match(puzzle,/<ArcadePauseCard game="pass-puzzle"[^\n]*extra=\{\{label:'Puzzles'/);
assert.match(puzzle,/if\(pausedRef\.current\)\{last=0;slot=0;return;\}/,'paused: the loop sleeps');
assert.match(puzzle,/const down=\(e:PointerEvent\)=>\{if\(pausedRef\.current\)return;/,'paused: no strokes');
assert.doesNotMatch(puzzle,/styles\.passScore|styles\.navigation/,'old header strip gone');
console.log('PASS arcade chrome: one score bar + one pause card across Strikers, Tennis, Pinball, Breakaway Run and Pass Puzzles');

// Nov 10 2026 touch-up (owner rule: the back button is the one thing common to all games). Every arcade game renders the shared
// bar, and the back button's face is fixed on the bar itself, so a host root that forgets the tokens (Kit Rush rendered it island
// gold) or a skin can never change it.
const kitrushSrc=read('components/games/KitRushGame.tsx'),snakeSrc=read('components/games/SquadSnakeGame.tsx');
for(const [name,src] of [['Kit Rush',kitrushSrc],['Squad Snake',snakeSrc],['Breakaway / Tennis / Pinball',a3d],['Pass Puzzles',puzzle]]){
 assert.match(src,/<ArcadeTopBar game=/,`${name} renders the shared ArcadeTopBar`);
 assert.doesNotMatch(src,/<BackButton|<NavigationButton|from '\.\.\/BackButton'/,`${name} has no back button of its own`);
}
assert.match(barCss,/\.bar\.bar\{--btn-gold:#24223e;[^}]*--btn-ink:#e9f5ff;--btn-rim:#81fbed;--btn-rim-width:3px;--btn-shadow-gold:0 4px 0 #121329,0 0 12px #4debd52e;[^}]*--btn-height:44px/,'the back button face is pinned on the shared bar');
for(const f of ['kitrush','snake','runner','tennis','pinball','puzzle'])assert.doesNotMatch(read(`components/games/skins/${f}.module.css`),/data-navigation|--btn-(gold|rim|ink)\b/,`${f} skin never restyles the back button`);
assert.doesNotMatch(read('components/games/comic/comic.module.css'),/data-navigation/,'the comic kit never restyles the back button');
// Results before initials: in the six arcade games a top-10 score shows a strip (in the card's [data-hs-slot], or docked under the bar),
// never the entry dialog over the results card; the strip opens the same entry, and leaving it saves as Skip does (device only).
{const hs=read('components/arcade/HighScoreEntry.tsx'),lb=read('components/arcade/Leaderboard.module.css');
 assert.match(hs,/const RESULTS_FIRST=\['kitrush','snake','runner','tennis','pinball','pass-puzzle'\]/,'results first in all six games');
 assert.match(hs,/if\(!open\)\{[\s\S]*data-hs-prompt=\{slot\?'inline':'docked'\}[\s\S]*data-hs-open onClick=\{\(\)=>setOpen\(true\)\}/,'the strip opens the entry on a tap');
 assert.match(hs,/leave\.current=!open&&place&&!saving&&!result\?\(\)=>\{void postScore\(game,score,valid\?initials:'AAA',valid\?icon:'',false\);closeRef\.current\(\);\}:null/,'an unopened strip saves like Skip: this device only');
 assert.match(kitrushSrc,/data-kitrush-near>\{result\.near\}<\/ComicPanel>\n\s*<div className=\{styles\.hsSlot\} data-hs-slot\/>/,'Kit Rush hosts the strip under the near-miss line');
 assert.match(snakeSrc,/data-snake-near>\{result\.near\}<\/ComicPanel>\n\s*<div className=\{styles\.hsSlot\} data-hs-slot\/>/,'Squad Snake hosts the strip under the near-miss line');
 assert.match(lb,/\.prompt button\{[^}]*min-height:44px/,'thumb-sized strip button');assert.doesNotMatch(lb.slice(lb.indexOf('.prompt{')),/infinite|blur\(/,'the strip never loops or blurs');
 // Drawn board pictures: one inline SVG per stored id, no emoji drawn by the picker or the rows; ids and labels untouched.
 const icons=read('components/arcade/BoardIcon.tsx'),ids=[...read('lib/arcade/leaderboard.ts').matchAll(/\{id:'([a-z]+)',emoji:/g)].map(m=>m[1]);
 assert.equal(ids.length,12);for(const id of ids)assert.match(icons,new RegExp(`\\n ${id}:<>`),`a drawing for "${id}"`);
 assert.doesNotMatch(hs+read('components/arcade/BoardTable.tsx'),/\.emoji|iconEmoji/,'the picker and the rows draw SVG, not emoji');
 assert.match(hs,/aria-label=\{p\.label\} onClick=\{\(\)=>setIcon\(p\.id\)\}><BoardIcon id=\{p\.id\}/,'picker buttons keep their labels');assert.match(read('components/arcade/BoardTable.tsx'),/label=\{boardIconLabel\(r\.icon\)\}/,'row pictures are named');
 // Turn-your-phone card: comic page inside an arcade game only (the island keeps the green card); the way out wears the standard back face.
 const rot=read('components/RotateLock.module.css');
 assert.match(rot,/:global\(body:has\(\[data-arcade-kind\]\)\) \.lock\{background:#19b5a5 /);assert.match(rot,/^\.lock\{display:none;position:fixed;inset:0;z-index:2147483000;background:#244d40/m,'island card unchanged');
 assert.match(rot,/:global\(body:has\(\[data-arcade-kind\]\)\) \.lock \.leave\{[^}]*border:3px solid #81fbed;border-radius:999px;background:#24223e;color:#e9f5ff/,'standard back button face');}
