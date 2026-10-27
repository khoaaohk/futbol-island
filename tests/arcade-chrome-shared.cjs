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
assert.match(barCss,/@media \(max-height:520px\)\{\n \.bar\.bar\{padding:calc\(6px/,'slim bar on short landscape');
// The pause card: Paused, optional score, ONE big Resume, small Arcade (+ extra) + Restart row, keycaps on fine pointers only.
assert.match(card,/<h2 className=\{styles\.title\}>Paused<\/h2>/);
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
assert.match(a3d,/<ArcadeTopBar game=\{kind\} className=\{styles\.topBar\}[^\n]*value=\{hud\.score\}/);
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
