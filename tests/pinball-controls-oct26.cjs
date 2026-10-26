// Futbol Pinball overlaid thumb pads (Oct 26 2026, docs/ARCADE_PINBALL_UPGRADE2_OCT26.md). Replaces the pins on the old
// round 72-76 px control strip: big translucent Left / Right pads in the lower corners, a wide Launch / Nudge pill with
// a charge fill between them, all overlaid on the table (no separate strip), scoped to pinball so tennis and Breakaway
// Run keep their controls. Instant presses (pointerdown, not click), multi-touch, nothing stuck on cancel / blur / pause.
// Browser half: the QA run in the doc (390x844, 430x932, 360x740, 820x1180, 1440x900; synthesized two-thumb touch).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),vm=require('node:vm');
const tsx=fs.readFileSync('components/games/ArcadeGame3D.tsx','utf8'),css=fs.readFileSync('components/games/ArcadeGame3D.module.css','utf8');
const block=css.slice(css.indexOf('/* Futbol Pinball full-screen cabinet'));
assert.ok(block.length>500,'pinball pad block present');

// 1. Markup: labelled pads + launch pill with a charge element; the live flipper state paints the pads.
assert.match(tsx,/<button ref=\{leftPad\} \{\.\.\.hold\(0\)\} aria-label="Left flipper" data-pinball-pad="left"/);
assert.match(tsx,/<button ref=\{rightPad\} \{\.\.\.hold\(1\)\} aria-label="Right flipper" data-pinball-pad="right"/);
assert.match(tsx,/<button ref=\{launchPad\} \{\.\.\.hold\(2\)\} data-pinball-launch=\{hud\.ready\?'launch':'nudge'\}[^>]*><i aria-hidden="true"\/><span>\{hud\.ready\?'Launch':'Nudge'\}<\/span>/);
assert.match(tsx,/const paintPads=\(\)=>\{if\(kind!=='pinball'\)return;/,'pads mirror the flipper state');
assert.match(tsx,/stopChargeSound\(\);\}paintPads\(\);\};/,'recompute repaints');assert.match(tsx,/charge:false\}\);paintPads\(\);/,'release() unlights');
assert.match(tsx,/launchPad\.current\?\.style\.setProperty\('--charge'/,'charge fill written by the frame loop, only on change');
assert.match(tsx,/if\(charge!==shownCharge\)/);
// 2. Instant + multi-touch + no stuck flippers (shared hold handler).
assert.match(tsx,/onPointerDown:\(e:PointerEvent<HTMLButtonElement>\)=>\{e\.preventDefault\(\);if\(phaseRef\.current!=='playing'\)return;unlock\(\);e\.currentTarget\.setPointerCapture\(e\.pointerId\);held\.current\.set\(e\.pointerId,id\)/,'pointerdown (touchstart), per-pointer');
assert.match(tsx,/onPointerCancel:[^}]*flipperPulse\[canceled\]=0/,'cancel never flicks');assert.match(tsx,/onLostPointerCapture:[^}]*flipperPulse\[canceled\]=0/);
assert.match(tsx,/window\.addEventListener\('blur',pause\)/,'blur pauses and releases');
// 3. Geometry: big pads, rectangular launch pill, overlay (not a strip), touch-action none, everything scoped.
const rule=sel=>{let out='',i=-1;while((i=block.indexOf(sel+'{',i+1))>=0)out+=block.slice(i,block.indexOf('}',i))+';';assert.ok(out,'missing '+sel);return out;};
const pad=rule('.game[data-arcade-kind=pinball] .controls>button[data-pinball-pad]'),launch=rule('.game[data-arcade-kind=pinball] .controls>button[data-pinball-launch]'),bar=rule('.game[data-arcade-kind=pinball] .controls');
assert.match(block,/--pb-pad-h:120px/);assert.match(pad,/height:var\(--pb-pad-h\);min-height:110px/);assert.match(pad,/border-radius:30px/);
assert.match(launch,/height:64px/);assert.match(bar,/minmax\(150px,168px\)/,'launch pill ≥150 px wide on phones');assert.match(bar,/position:absolute;inset:auto 0 0 0/,'overlaid on the table');
assert.match(block,/data-pinball-launch\]\{[^}]*touch-action:none/,'pads own touch-action:none');assert.match(launch+block,/transform:scaleX\(var\(--charge,0\)\)/,'compositor-only charge fill');
assert.match(block,/\[data-held\]\{transform:scale\(\.965\)/,'strong pressed state');
for(const line of block.split('\n').filter(l=>l.includes('{')&&!l.trim().startsWith('/*')&&!l.startsWith('@keyframes'))){const selectors=line.replace(/@media[^{]*\{/,'').split('{')[0];if(/^\s*\d|^\s*(from|to)\b/.test(selectors))continue;
 for(const sel of selectors.split(','))assert.match(sel,/data-arcade-kind=pinball/,'every new rule is pinball-scoped: '+sel);}
// 4. The camera's pad band agrees with the CSS pads (120 px + 12 px gap on phones; 96 px on desktop).
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{Math,exports:m.exports,module:m,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
const C=load('lib/games/soccerPinballCamera.ts');
for(const [w,h] of [[390,844],[360,740],[430,932],[390,664]])assert.ok(C.pinballCameraLayout(w,h,true).flip<=h-12-120-6,`${w}x${h}: flippers framed above the pads`);
assert.equal(C.pinballCameraLayout(1440,900,false).landscape,true,'wide screens: the pads sit beside the table (checked in tests/pinball-camera-oct26.cjs)');
// 5. The tip fades and rides over the drain strip; tennis / runner messages keep their own rules.
assert.match(block,/\.message\{bottom:calc\(var\(--pb-bottom\) \+ 72px\)[^}]*animation:pinballTip/);assert.match(tsx,/<p key=\{\(kind==='tennis'\|\|kind==='pinball'\)\?hud\.message:undefined\}/);
console.log('PASS pinball controls: overlaid 120 px thumb pads + 150x64 launch pill with charge fill, lit by the live flipper, pointerdown multi-touch, no stuck flippers, pinball-scoped CSS, camera/pad band agree, fading tip');
