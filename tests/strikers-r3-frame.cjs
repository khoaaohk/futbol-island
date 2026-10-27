// Strikers round 3 (Oct 26 2026, docs/ARCADE_STRIKERS_R3_OCT26.md): the pitch is ALWAYS sideways.
// Upright phones: RotateLock's "Turn your phone sideways" card (phones only). Every other tall window (narrow desktop window, upright
// tablet): a letterboxed 4:3 landscape frame centred on a backdrop; menus open over the whole window; mouse windows hide the touch
// buttons; upright tablets get the landscape thumb layout inside the frame.
// Run: node tests/strikers-r3-frame.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const css=read('components/LiveArcadeMatch.module.css'),live=read('components/LiveArcadeMatch.tsx'),mode=read('lib/orientationMode.ts'),lock=read('components/RotateLock.module.css');
// Card for phones only.
assert.match(mode,/export const LANDSCAPE_ONLY_QUERY = '\(pointer:coarse\) and \(orientation:portrait\) and \(max-width:500px\)';/);
assert.doesNotMatch(lock,/pointer:fine/,'mouse windows never get the card');
// Frame.
const FRAME='@media(pointer:fine) and (orientation:portrait),(pointer:coarse) and (orientation:portrait) and (min-width:501px){';
const i=css.indexOf(FRAME);assert.ok(i>0,'frame block for tall non-phone windows');const block=css.slice(i,css.indexOf('\n}',i));
assert.match(block,/\.root\.root\{inset:auto 0;top:calc\(50dvh - 37\.5vw\);height:75vw;/,'4:3 frame, centred, beats ArcadeRoom section height:100%');
assert.match(block,/\.backdrop\{display:block;position:fixed;inset:0;z-index:139;/,'a backdrop under the frame that also blocks taps to the room behind');
assert.match(block,/\.root \.overlay\{position:fixed;inset:0;z-index:6;/,'menus use the whole window');
assert.match(css,/\.backdrop\{display:none\}/);assert.match(live,/<div className=\{styles\.backdrop\} aria-hidden="true"\/><section className=\{styles\.root\}/);
// No containment on the root: fixed modals (leaderboards) must still cover the window.
assert.doesNotMatch(css,/container-type/);
assert.match(css,/@media\(pointer:fine\) and \(orientation:portrait\)\{\n \.root \.touchControls\{display:none\}/,'mouse windows: keyboard, no touch buttons');
// Upright tablets reuse the landscape thumb layout; upright phone rules only apply behind the card.
assert.ok(css.split('@media(pointer:coarse) and (orientation:landscape),(pointer:coarse) and (min-width:501px)').length>=6,'landscape touch blocks also match upright tablets');
assert.doesNotMatch(css,/@media\(pointer:coarse\) and \(orientation:portrait\)\{/,'portrait touch blocks are phone-only now');
// Scene picks the sideways camera from the canvas shape alone (aspect >= .85), so a 4:3 frame is landscape.
assert.match(read('lib/arcade/strikerScene.ts'),/portrait=camera\.aspect<\.85/);
console.log('strikers-r3-frame ok');
