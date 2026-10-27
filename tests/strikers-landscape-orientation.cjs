// Strikers plays SIDEWAYS on phones (owner, Oct 26 2026, docs/STRIKERS_LANDSCAPE_OCT26.md). The app stays portrait-only
// (components/RotateLock.tsx); Strikers asks for landscape while mounted (lib/orientationMode.ts) and the lock card flips to
// "Turn your phone sideways to play" for upright phones, pausing the match with the same window blur. Leaving restores portrait.
// Browser check: scratchpad qa.cjs (upright 390x844 = card + phase paused; back on the Arcade = portrait card again).
// Run: node tests/strikers-landscape-orientation.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
// Run the real module against a tiny fake document / screen.
const locks=[],html={dataset:{}};
const ctx={module:{exports:{}},document:{documentElement:html},screen:{orientation:{lock:o=>{locks.push(o);return Promise.resolve();}}}};ctx.exports=ctx.module.exports;
vm.runInNewContext(ts.transpileModule(read('lib/orientationMode.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,ctx);
const M=ctx.module.exports;
assert.equal(M.getOrientationMode(),'portrait','portrait-only by default');
let calls=0;const off=M.subscribeOrientationMode(()=>calls++);
const release=M.requestLandscape();
assert.equal(M.getOrientationMode(),'landscape');assert.equal(html.dataset.orientation,'landscape');assert.equal(calls,1);assert.equal(locks.at(-1),'landscape');
const second=M.requestLandscape();assert.equal(calls,1,'a second holder does not re-notify');
release();assert.equal(M.getOrientationMode(),'landscape','still held by the other mount (StrictMode remount)');
release();assert.equal(M.getOrientationMode(),'landscape','a release is idempotent');
second();assert.equal(M.getOrientationMode(),'portrait','last release restores portrait-only');assert.equal(html.dataset.orientation,undefined);assert.equal(locks.at(-1),'portrait');assert.equal(calls,2);
off();M.requestLandscape()();assert.equal(calls,2,'unsubscribed');
assert.equal(M.wrongOrientationQuery('portrait'),M.PORTRAIT_ONLY_QUERY);assert.equal(M.wrongOrientationQuery('landscape'),M.LANDSCAPE_ONLY_QUERY);
assert.match(M.LANDSCAPE_ONLY_QUERY,/\(pointer:coarse\) and \(orientation:portrait\) and \(max-width:500px\)/,'upright PHONES: tall tablets still play upright');assert.doesNotMatch(M.LANDSCAPE_ONLY_QUERY,/pointer:fine/,'narrow tall mouse windows get the letterboxed landscape frame, not a card (round 3)');

// RotateLock follows the mode: card text, CSS rule per mode, blur on the wrong-orientation query (also right after a mode switch).
const lock=read('components/RotateLock.tsx'),css=read('components/RotateLock.module.css');
assert.match(lock,/useSyncExternalStore\(subscribeOrientationMode, getOrientationMode, serverMode\)/);
assert.match(lock,/data-mode=\{mode\}/);assert.match(lock,/Turn your phone sideways to play/);assert.match(lock,/Turn your phone upright to play/);
assert.match(lock,/if \(switched\.current\) change\(\);/,'leaving Strikers while sideways pauses whatever is behind the portrait card');
assert.match(css,/\.lock\[data-mode=landscape\] \.phone\{transform:rotate\(0deg\);animation-name:turnSideways\}/,'the inverse animation');
// Strikers holds landscape only while mounted; nothing else asks for it.
const live=read('components/LiveArcadeMatch.tsx');
assert.match(live,/useEffect\(\(\)=>requestLandscape\(\),\[\]\);/,'Strikers asks while mounted and releases on unmount');
assert.match(live,/addEventListener\('blur',blur\)/,'the wrong-orientation card pauses Strikers (blur)');
assert.match(live,/addEventListener\('orientationchange',release\)/,'turning the phone lets go of held thumbs');
const users=require('node:child_process').execSync("grep -rl 'requestLandscape' components app lib",{cwd:root,encoding:'utf8'}).trim().split('\n').sort();
// Oct 27 2026: Futbol Tennis and Breakaway Run (ArcadeGame3D, kind-gated) also play sideways; tests/tennis-landscape-clean.cjs and breakaway-clean-ui-oct27.cjs pin them.
assert.deepEqual(users,['components/LiveArcadeMatch.tsx','components/games/ArcadeGame3D.tsx','lib/orientationMode.ts'],'only Strikers, Tennis and Breakaway change orientation');
// The landscape camera: a .9-wide fit (clear of notch insets), lifted so the goal mouths clear the corner controls.
const scene=read('lib/arcade/strikerScene.ts');
assert.match(scene,/const LANDSCAPE_LIFT=\.16,LANDSCAPE_X=\.9,LANDSCAPE_PAN=\.4;/);
assert.ok(scene.includes('if(wide){camera.setViewOffset(w,h,0,h*LANDSCAPE_LIFT,w,h);'),'lift after the fit, so the pitch keeps its size');
console.log('strikers-landscape-orientation ok');
