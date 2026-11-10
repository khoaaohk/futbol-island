// Breakaway swipes (Nov 10 2026, arcade audit part 1; lib/arcade/runnerSwipe.ts). Run: node tests/runner-swipe.cjs
//  1. the recogniser: distance and time thresholds, the four directions, diagonals, one action per swipe, other fingers ignored
//  2. what a swipe does (lane −1/+1, jump = pad action 1, slide = pad action 2, the same as the buttons)
//  3. wiring: the swipe layer is touch-action:none, starts never on a button, the stick zone keeps sideways for the stick, the
//     stick and buttons stay, mouse windows hide it
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const ROOT=path.join(__dirname,'..');process.chdir(ROOT);
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const W=require('../lib/arcade/runnerSwipe.ts'),{RUNNER_SWIPE:C}=W;
const read=f=>fs.readFileSync(f,'utf8');
// A swipe from (0,0) at t=0 through the given points [x,y,t]; returns everything it fired.
const run=(pts,id=1)=>{const s=W.runnerSwipeStart(1,0,0,0),out=[];for(const [x,y,t,pid] of pts){const w=W.runnerSwipeMove(s,pid??id,x,y,t);if(w)out.push(w);}return out;};

// 1. Thresholds and directions.
assert.deepEqual(run([[C.minDist-1,0,.05]]),[],'under the distance: nothing');
assert.deepEqual(run([[C.minDist,0,.05]]),['right'],'at the distance: fires');
assert.deepEqual(run([[-40,0,.1]]),['left']);assert.deepEqual(run([[0,-40,.1]]),['up']);assert.deepEqual(run([[0,40,.1]]),['down']);
assert.deepEqual(run([[40,0,C.maxTime+.01]]),[],'too slow: a drag, not a flick');
assert.deepEqual(run([[10,0,C.maxTime+.01],[60,0,C.maxTime+.05]]),[],'once expired it stays dead');
assert.deepEqual(run([[40,0,C.maxTime]]),['right'],'at the time limit: still a flick');
// Diagonals: a clear lean fires its main axis; a true 45° flick fires nothing; an early diagonal waits until it is clear.
assert.deepEqual(run([[50,20,.1]]),['right'],'mostly sideways');assert.deepEqual(run([[15,-45,.1]]),['up'],'mostly up');
assert.deepEqual(run([[40,40,.1],[80,80,.2]]),[],'45°: neither a lane change nor a jump');
assert.deepEqual(run([[30,30,.05],[90,32,.12]]),['right'],'diagonal start, then clearly sideways');
assert.deepEqual(run([[50*C.axisRatio-1,50,.1]]),[],'just under the axis ratio');
// One action per swipe: a long flick or a turn back does nothing more.
assert.deepEqual(run([[40,0,.05],[120,0,.1],[200,0,.15],[200,-80,.2],[0,0,.25]]),['right'],'one lane change per swipe');
assert.deepEqual(run([[0,40,.05],[0,-40,.1]]),['down'],'no slide-then-jump in one swipe');
// Another finger (a second pointer id) never drives this swipe.
assert.deepEqual(run([[60,0,.05,2]]),[],'other pointer ignored');assert.equal(W.runnerSwipeMove(null,1,60,0,.05),'');

// 2. Actions match the buttons.
assert.deepEqual(W.runnerSwipeAction('left'),{lane:-1});assert.deepEqual(W.runnerSwipeAction('right'),{lane:1});
assert.deepEqual(W.runnerSwipeAction('up'),{action:1});assert.deepEqual(W.runnerSwipeAction('down'),{action:2});
const pad=read('components/games/RunnerControls.tsx'),css=read('components/games/RunnerControls.module.css'),game=read('components/games/ArcadeGame3D.tsx');
assert(/data-runner-jump[^>]*\{\.\.\.pressAction\(1\)\}/.test(pad)&&/data-runner-slide \{\.\.\.pressAction\(2\)\}/.test(pad),'jump = action 1, slide = action 2 on the buttons too');
assert(/<RunnerControls [^>]*act=\{action\}/.test(game),'swipes use the same action handler as the buttons (route input buffers apply)');

// 3. Wiring.
assert(/\.swipe\{[^}]*touch-action:none/.test(css)&&/\.zone\{[^}]*touch-action:none/.test(css),'a swipe never scrolls or zooms');
assert(/@media \(pointer:fine\)\{[^}]*\.swipe/.test(css),'mouse windows hide the swipe layer');
assert(/closest\?\.\('button'\)\)return/.test(pad),'a touch that starts on a button is never a swipe');
assert(/data-runner-swipe-zone[^>]*\/>\s*<div className=\{`touch-controls/.test(pad)&&pad.indexOf('data-runner-swipe-zone')<pad.indexOf('styles.cluster'),'the layer sits under the button cluster');
assert(/swipeMove\(e,false\);stick\.zone\.onPointerMove\(e\)/.test(pad),'in the stick zone sideways stays the stick (no double lane change)');
assert(/data-runner-stick /.test(pad)&&/useFloatingStick\(/.test(pad),'the stick stays');
console.log('runner swipe: thresholds, diagonals, one action per swipe, wiring OK');
