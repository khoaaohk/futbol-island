// Strikers plays upright on phones (QA round 2, Oct 25 2026, docs/QA_AUDIT2_OCT25.md #1). Phones are portrait only
// (components/RotateLock.tsx shows "Turn your phone upright" when sideways), while Island Strikers blocked portrait touch screens with
// "Turn sideways to play": a deadlock, the cabinet could not be played on any phone. The block is gone; the start / pause card hides
// the thumb controls so they no longer cover Kick off and Leaderboard.
// Run: node tests/strikers-portrait.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const match=read('components/LiveArcadeMatch.tsx'),css=read('components/LiveArcadeMatch.module.css'),lock=read('components/RotateLock.module.css');
assert.match(lock,/orientation:landscape/,'RotateLock still blocks sideways phones (outside Strikers)');
// Oct 26 2026 (owner): Strikers now plays SIDEWAYS on phones (tests/strikers-landscape-orientation.cjs); upright phones see RotateLock's
// "turn sideways" card. Upright play stays for tall tablets (wider than 500 px), so the portrait rules below still matter.
assert(!/innerHeight\s*>\s*window\.innerWidth/.test(match),'Strikers no longer blocks portrait touch screens');
assert(!/setRotate\(/.test(match),'nothing turns the rotate prompt on');
assert.match(match,/data-phase=\{phase\}/,'root exposes the phase for the CSS rule');
assert.match(match,/\{phase==='ready'&&!failed&&<div className=\{styles\.overlay\}>/,'the start card shows before kick-off');
assert.match(match,/\(phase==='finished'\|\|failed\)&&!outroOn&&<div className=\{styles\.overlay\}/,'the full-time card shows otherwise');
assert.match(css,/\.root:not\(\[data-phase=playing\]\) \.touchControls\{visibility:hidden;pointer-events:none\}/,'thumb controls hide under the card');
console.log('strikers-portrait: ok');
