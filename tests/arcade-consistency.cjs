// Arcade consistency (owner, Oct 27 2026: "make sure all the modals, buttons, joystick position and size are all consistent. Make sure
// buttons are placed in the right position"; docs/ARCADE_CHROME_OCT27.md "Consistency audit"). Static source checks:
//  1. one token sheet (components/arcade/arcadeChrome.css), loaded globally from app/layout.tsx;
//  2. all five games (Strikers, Breakaway Run, Tennis, Pinball, Pass Puzzles) + the shared bar / pause card take their gutters,
//     stick, thumb-button and card sizes from it;
//  3. sizes stay thumb-sized (buttons >= 56 px, Back / Pause 44 px, card primary >= 48 px) in every media override;
//  4. every edge gutter is added to the matching env(safe-area-inset-*) (notches / home bar), nothing uses max(gutter, inset);
//  5. heat: the token sheet has no animation. Browser numbers: scripts/measure-arcade-chrome.cjs. Run: node tests/arcade-consistency.cjs
const assert=require('node:assert/strict'),fs=require('node:fs');
const read=f=>fs.readFileSync(f,'utf8');
const T=require('./fixtures/arcadeTokens.cjs');

// 1. Token sheet, global.
assert.match(read('app/layout.tsx'),/import '@\/components\/arcade\/arcadeChrome\.css';/,'tokens loaded once, globally');
for(const name of ['edge-x','edge-top','edge-bottom','bar-h','bar-clear','stick','btn-main','btn','btn-sm','btn-gap','card-w','card-wide','card-r','card-pad','card-title','primary-h','small-h'])
 assert.ok(T.tokens.tall['arcade-'+name],`--arcade-${name} defined`);
assert.doesNotMatch(T.src.replace(/\/\*[\s\S]*?\*\//g,''),/animation|@keyframes|transition/,'heat: the token sheet is static');

// 2. Every game uses the shared tokens.
const files={
 bar:'components/arcade/ArcadeTopBar.module.css',pause:'components/arcade/ArcadePauseCard.module.css',
 strikers:'components/LiveArcadeMatch.module.css',breakawayPad:'components/games/RunnerControls.module.css',breakawayCard:'components/games/RunnerMenu.module.css',
 a3d:'components/games/ArcadeGame3D.module.css',tennisCard:'components/games/TennisCourtPicker.module.css',pinballCard:'components/games/PinballCard.module.css',
 puzzle:'components/games/PassPuzzleGame.module.css'};
const css=Object.fromEntries(Object.entries(files).map(([k,f])=>[k,read(f)]));
const uses=(key,tokens,why)=>{for(const t of tokens)assert.ok(css[key].includes(`var(--arcade-${t}`),`${files[key]} uses --arcade-${t} (${why})`);};
uses('bar',['edge-top','edge-x','bar-h'],'score bar gutters + Back / Pause size');
uses('pause',['card-w','card-r','card-pad','card-title','primary-h','small-h'],'pause card');
uses('strikers',['stick','edge-x','edge-bottom','bar-clear','btn-main','btn','btn-sm','card-wide','card-r','card-pad','card-title','primary-h','small-h'],'Strikers stick, thumb arc, start / full-time card');
uses('breakawayPad',['stick','edge-x','edge-bottom','bar-clear','btn-main','btn','btn-sm'],'Breakaway stick + thumb cluster');
/* Nov 10 2026 arcade AAA: Breakaway's comic title card is square-cornered by direction (docs/arcade-aaa/runner-direction.md), so it no longer reads --arcade-card-r. */uses('breakawayCard',['card-wide','card-pad','card-title','primary-h','small-h','bar-clear'],'Breakaway menu card');
/* Nov 10 2026 comic house style: the Tennis card is square-cornered like Breakaway's (docs/arcade-aaa/tennis-direction.md), so it no longer reads --arcade-card-r. */uses('tennisCard',['card-pad','card-title','primary-h','small-h'],'Tennis card');
uses('pinballCard',['card-wide','card-r','card-pad','card-title','primary-h','small-h'],'Pinball card');
uses('puzzle',['edge-x','bar-clear'],'Pass Puzzles hint dock / undo / clock');
const tennis=css.a3d.slice(css.a3d.indexOf("/* ===== Consistency audit (Oct 27 2026"),css.a3d.indexOf('/* Futbol Pinball full-screen cabinet'));
for(const t of ['stick','edge-x','edge-bottom','btn-sm','btn','btn-gap'])assert.ok(tennis.includes(`var(--arcade-${t})`),`Tennis controls use --arcade-${t}`);
const pinball=css.a3d.slice(css.a3d.indexOf('/* Futbol Pinball full-screen cabinet'));
for(const t of ['edge-x','edge-bottom'])assert.ok(pinball.includes(`var(--arcade-${t})`),`Pinball pads use --arcade-${t}`);
// One stick ring everywhere: Strikers, Breakaway and Tennis all size the ring from --arcade-stick (no per-game clamp left).
assert.match(css.strikers,/--stick:var\(--arcade-stick\)/);assert.match(css.breakawayPad,/--stick:var\(--arcade-stick\)/);
assert.match(tennis,/\.tennisMovement\.tennisMovement :global\(\.joystick\)\{width:var\(--arcade-stick\);height:var\(--arcade-stick\)\}/);
assert.doesNotMatch(css.strikers+css.breakawayPad,/--stick:clamp\(/,'no per-game stick clamp');
// Shoot is the one big button in both landscape games; the same three sizes in the same places.
assert.match(css.strikers,/button\[data-action=shoot\]\{--d:var\(--arcade-btn-main\)/);assert.match(css.breakawayPad,/\.shoot\.shoot\{--d:var\(--arcade-btn-main\)/);
assert.match(css.strikers,/button\[data-action=pass\]\{--d:var\(--arcade-btn\)/);assert.match(css.breakawayPad,/\.jump\.jump\{--d:var\(--arcade-btn\)/);
// Strikers' header: the dead .root>.header.header paddings are gone (the shared ArcadeTopBar owns the Arcade button's position).
assert.doesNotMatch(css.strikers,/\.root>\.header\.header|\.root \.header>\.pause\.pause/,'no dead Strikers header rules');

// 3. Thumb-sized in every mode (desktop / tall, sideways phones, very narrow phones).
const narrow=T.src.match(/@media \(max-width:350px\)\{\s*:root\{([^}]*)\}/);assert.ok(narrow,'narrow-phone override');
const narrowTok={...T.tokens.tall,...Object.fromEntries([...narrow[1].matchAll(/--(arcade-[\w-]+):([^;}]+)/g)].map(m=>[m[1],m[2].trim()]))};
for(const [mode,tok] of [['tall',T.tokens.tall],['short',T.tokens.short],['narrow',narrowTok]]){
 const px=n=>{const m=/^(\d+)px$/.exec(tok['arcade-'+n]);assert.ok(m,`${mode}: --arcade-${n} px`);return +m[1];};
 assert.ok(px('btn-sm')>=56&&px('btn')>=64&&px('btn-main')>=76&&px('btn-main')<=96,`${mode}: buttons 56+ / 64+ / 76-96 px`);
 assert.ok(px('btn-sm')<px('btn')&&px('btn')<px('btn-main'),`${mode}: one primary, then secondaries, then extras`);
 assert.ok(px('bar-h')>=44,`${mode}: Back / Pause >= 44 px`);assert.ok(px('primary-h')>=48&&px('small-h')>=44,`${mode}: card buttons`);
 assert.ok(px('edge-x')>=12&&px('edge-bottom')>=8,`${mode}: gutters keep controls off the screen edge`);
 assert.ok(px('btn-gap')>=8,`${mode}: gaps between buttons`);
}
for(const vh of [375,390,430,844])assert.ok(T.stick(vh)>=132&&T.stick(vh)<=156,`stick ${T.stick(vh)} px at ${vh} px tall`);
assert.equal(T.barClear('short'),56,'under the slim bar: 56 px');assert.equal(T.barClear('tall'),64,'under the bar: 64 px');

// 4. Safe areas: each gutter is added to its inset (calc(gutter + env(...))), never max(gutter, env(...)).
for(const [key,src] of Object.entries(css)){
 for(const m of src.matchAll(/var\(--arcade-edge-x\)/g)){const ctx=src.slice(Math.max(0,m.index-6),m.index+80);
  assert.match(ctx,/calc\(var\(--arcade-edge-x(,\d+px)?\) \+ env\(safe-area-inset-(left|right),0px\)\)/,`${files[key]}: side gutter plus the side inset: ${ctx}`);}
 for(const m of src.matchAll(/var\(--arcade-edge-bottom\)/g)){const ctx=src.slice(m.index,m.index+70);
  assert.match(ctx,/^var\(--arcade-edge-bottom\) \+ env\(safe-area-inset-bottom,0px\)/,`${files[key]}: bottom gutter plus the home-bar inset`);}
 for(const m of src.matchAll(/var\(--arcade-bar-clear\)/g)){const ctx=src.slice(m.index,m.index+70);
  assert.match(ctx,/^var\(--arcade-bar-clear\)( \+ \d+px)? \+ env\(safe-area-inset-top,0px\)/,`${files[key]}: under the bar plus the top inset`);}
}
assert.match(css.bar,/env\(safe-area-inset-top,0px\)/);assert.match(css.bar,/env\(safe-area-inset-left,0px\)/);assert.match(css.bar,/env\(safe-area-inset-right,0px\)/);
assert.match(css.pause,/env\(safe-area-inset-bottom,0px\)/,'pause backdrop pads the home bar');
assert.doesNotMatch(css.breakawayPad,/max\(\d+px,env\(safe-area-inset/,'Breakaway pad: no max(gutter, inset) edges');
for(const cls of ['skip','undo','clockChip','hintDock'])assert.doesNotMatch(css.puzzle.match(new RegExp(`\\.${cls}\\{[^}]*\\}`))[0],/max\(\d+px,env\(/,`Pass Puzzles .${cls}: gutter plus inset`);
assert.doesNotMatch(pinball,/max\(var\(--pb-gap\),env/,'Pinball pads: gutter plus inset');
// Cards scroll instead of clipping when taller than a sideways phone.
assert.match(css.pause,/\.overlay\{[^}]*overflow:auto/);assert.match(css.pause,/\.card\.card\{[^}]*max-height:100%;overflow:auto/);
assert.match(css.breakawayCard,/\.overlay\{[^}]*overflow:auto/);assert.match(css.strikers,/\.root \.overlay>\.start\{max-height:calc\(100% - 4px\);overflow:auto/);

// Wired into npm test.
assert.match(read('package.json'),/node tests\/arcade-consistency\.cjs/,'in the npm test chain');
console.log('PASS arcade consistency: one token sheet; bar, stick, thumb buttons and cards share it in all five games; 56+ px buttons; safe-area insets on every edge; static');
