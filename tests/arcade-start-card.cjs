// Arcade start card exit (Oct 9 2026 QA). The header's Arcade button (header z 3) showed dimmed on every ArcadeGame3D start card
// but could not be tapped: the card overlay (z 4) covered it. Escape did nothing on the card, and in landscape the card's own
// "Back to arcade" sits below the fold. Now the header stops being a stacking context while a card is up and only the Arcade
// button rises above the overlay (NavigationButton look unchanged), and Escape exits on the start / full-time / error card (the
// pause card keeps Escape = resume). Island Strikers (LiveArcadeMatch) has its header outside the overlay already; it gets the
// same Escape. Browser check: tennis, runner, pinball and Strikers at 390x844, 844x390 and 1440x900: the button is the top
// element at its centre, a tap/click exits, Escape exits.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const comp=read('components/games/ArcadeGame3D.tsx'),css=read('components/games/ArcadeGame3D.module.css');
assert.match(comp,/data-card=\{card\|\|undefined\}/,'the game marks when a card is up');
assert.match(comp,/\{card&&<div className=\{styles\.overlay\}>/,'same condition as the overlay');
assert.match(comp,/<header className=\{styles\.header\}><BackButton onBack=\{onExit\} label="Arcade"\/>/,'the Arcade NavigationButton is still the header\'s first child');
assert.match(css,/\.overlay\{position:absolute;inset:0;z-index:4/,'overlay z 4');
assert.match(css,/\.game\[data-card\]>\.header\{z-index:auto\}/,'header stops being a stacking context under a card');
const lift=css.match(/\.game\[data-card\]>\.header>button:first-child\{([^}]*)\}/);
assert.ok(lift,'the Arcade button is lifted');
assert.match(lift[1],/z-index:5/,'above the overlay');
assert.ok(!/background|border|color|height|width|shadow/.test(lift[1]),'without restyling the NavigationButton');
const esc=comp.slice(comp.indexOf('const exitRef=useRef(onExit)'));
assert.match(esc,/e\.code!=='Escape'\|\|\(!error&&phaseRef\.current!=='ready'&&phaseRef\.current!=='over'\)/,'Escape exits only on the start / full-time / error card');
assert.match(esc,/closest\('input,select,textarea'\)/,'not from a select or field');
assert.match(esc,/release\(\);exitRef\.current\(\)/,'releases input and exits');
const live=read('components/LiveArcadeMatch.tsx');
assert.match(live,/e\.code!=='Escape'\|\|\(!failed&&phaseRef\.current!=='ready'&&phaseRef\.current!=='finished'\)/,'Strikers: Escape exits on its start / full-time card too');
console.log('PASS arcade start card: the Arcade button is tappable above the card and Escape exits');
