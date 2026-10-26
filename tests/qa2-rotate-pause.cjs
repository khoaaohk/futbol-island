// Turning the phone sideways pauses the games behind the turn-upright card (QA round 2, Oct 25 2026, docs/QA_AUDIT2_OCT25.md #2).
// The card (components/RotateLock.tsx) covered the screen but Island Strikers kept playing (Blue scored) and Breakaway Run kept
// running (a heart lost). RotateLock now sends a window `blur` when its media query starts matching; the arcade games pause on blur.
// Browser check: scratch p-rot.cjs (Strikers clock held at 2:58 and "Match paused"; Breakaway "TIME OUT", sideways for 8 s).
// Run: node tests/qa2-rotate-pause.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const tsx=read('components/RotateLock.tsx'),css=read('components/RotateLock.module.css');
const query=tsx.match(/ROTATE_LOCK_QUERY = '([^']+)'/)[1];
const media=css.match(/@media([^{]+)\{\.lock\{display:flex\}\}/)[1];
assert.equal(query.replace(/\s/g,''),media.replace(/\s/g,''),'the pause fires on exactly the query that shows the card');
assert.match(tsx,/matchMedia\?\.\(ROTATE_LOCK_QUERY\)/);
assert.match(tsx,/if \(mq\.matches\) window\.dispatchEvent\(new Event\('blur'\)\)/,'only turning sideways pauses (not turning back)');
assert.match(tsx,/removeEventListener\?\.\('change', change\)/,'listener cleaned up');
assert(!/setInterval|setTimeout|requestAnimationFrame/.test(tsx),'no polling');
// The games that run behind it pause on window blur.
for(const f of ['components/LiveArcadeMatch.tsx','components/games/ArcadeGame3D.tsx','components/games/SoccerTennisGame.tsx','components/games/PassPuzzleGame.tsx'])
 assert.match(read(f),/addEventListener\('blur',/,f+' listens for blur');
console.log('qa2-rotate-pause: ok');
