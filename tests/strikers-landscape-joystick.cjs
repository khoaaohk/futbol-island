// Strikers floating stick (owner, Oct 26 2026, docs/STRIKERS_LANDSCAPE_OCT26.md): same behaviour as the island stick
// (lib/town/floatingStick.ts + walkControl.ts, components/Town.tsx): a press anywhere in the left stick zone (~45% of the screen)
// anchors a bigger ring at the thumb; release glides it home to its faint bottom-left rest spot. Multi-touch safe: the zone
// captures only its own pointer, and blur / pointercancel / lost capture / orientationchange all let go.
// Browser check: scratchpad qa.cjs (CDP touches: stick + Sprint held together, ring back at its rest spot after release).
// Run: node tests/strikers-landscape-joystick.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const load=f=>{const m={exports:{}};vm.runInNewContext(ts.transpileModule(read(f),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math});return m.exports;};
const F=load('lib/town/floatingStick.ts'),W=load('lib/town/walkControl.ts');
const live=read('components/LiveArcadeMatch.tsx'),css=read('components/LiveArcadeMatch.module.css');
// Shared code, not a copy.
assert.match(live,/import \{clampAnchor,stickTravel\} from '@\/lib\/town\/floatingStick';/);
assert.match(live,/import \{shapeStick\} from '@\/lib\/town\/walkControl';/,'same dead zone + response curve as the island');
assert.match(live,/paintJoystick\(joy\.current,stickPaint\.current\.x,stickPaint\.current\.y,stickT\.current\)/,'knob paints on the game frame with the live travel');
// The zone: left 45%, below the header, own touch surface; the ring itself ignores pointers (the zone owns them).
const zoneRule=css.match(/\.root \.stickZone\{display:block;position:absolute;left:0;top:([^;]+);bottom:0;width:45%;[^}]*touch-action:none/);
assert.ok(zoneRule,'zone covers the left 45%, touch-action none');
assert.match(css,/\.root \.stickZone\{top:calc\(56px \+ env\(safe-area-inset-top,0px\)\)\}/,'landscape: zone starts under the slim header (the Arcade button stays tappable)');
assert.match(css,/\.root \.movement,\.root \.movement :global\(\.joystick\)\{pointer-events:none\}/);
assert.match(live,/className=\{styles\.stickZone\} aria-hidden="true" onPointerDown=\{stickDown\} onPointerMove=\{moveStick\} onPointerUp=\{releaseStick\} onPointerCancel=\{releaseStick\} onLostPointerCapture=\{releaseStick\}/);
// Bigger ring in landscape (island phones: up to 160 px) and a faint rest / full active look with a fade.
const stick=css.match(/--stick:clamp\((\d+)px,calc\(100vh - (\d+)px\),(\d+)px\)/);assert.ok(stick);
const ring=vh=>Math.min(+stick[3],Math.max(+stick[1],vh-+stick[2]));
assert.ok(ring(390)>=150&&ring(375)>=132&&ring(430)>=160,`ring ${ring(375)}-${ring(430)} px on phones`);
assert.match(css,/\.root \.movement :global\(\.joystick\):not\(\[data-active=true\]\)\{opacity:\.55\}/);
assert.match(live,/translate \.32s cubic-bezier\(\.22,\.8,\.24,1\),opacity \.2s ease-out/,'glides home and fades like the island stick');
assert.match(live,/prefers-reduced-motion: reduce/,'reduced motion snaps home');
// Behaviour, with the shared maths: a press near the zone edge anchors the ring fully inside the zone.
const zone={left:8,top:68,right:380,bottom:382},r=80,a=F.clampAnchor(4,380,zone,r);
assert.deepEqual([a.x,a.y],[88,302],'a corner press keeps the whole ring inside the zone');
const mid=F.clampAnchor(250,200,zone,r);assert.deepEqual([mid.x,mid.y],[250,200],'mid-zone press anchors right under the thumb');
// Moving the thumb: travel from the ring size, dead zone and walk floor from walkControl, y flipped to "up = +".
const T=F.stickTravel(r*2),out={x:0,z:0};
W.shapeStick(.05,0,out);assert.equal(out.x,0,'dead zone ignores a resting thumb');
W.shapeStick(1,0,out);assert.equal(out.x,1,'full tilt at the rim');
assert.ok(T>25&&T<40,`travel ${T}`);
assert.match(live,/shapeStick\(px\/T,py\/T,shaped\);local\.current\.mx=shaped\.x;local\.current\.my=-shaped\.z;/);
// No per-move allocation: shaped vector and paint slot are reused.
assert.match(live,/const shaped=\{x:0,z:0\};/);assert.match(live,/stickPaint=useRef\(\{x:0,y:0,dirty:false\}\)/);
const move=live.slice(live.indexOf('const moveStick='),live.indexOf('const releaseStick='));assert.ok(!/\{x:|new |getBoundingClientRect/.test(move),'moveStick allocates nothing and reads no layout');
// Release paths: pointer up/cancel/lost capture, window blur, orientationchange, phase changes (release()).
assert.match(live,/const release=\(\)=>\{[^}]*releaseStick\(\);/,'release() lets go of the stick');
assert.match(live,/const releaseStick=\(event\?:\{pointerId:number\}\)=>\{if\(event&&event\.pointerId!==joyId\.current\)return;/,'another finger lifting never releases the stick');
assert.match(live,/if\(phaseRef\.current!=='playing'\|\|joyId\.current!==null\|\|!el/,'one stick finger at a time, only while playing');
// Multi-touch buttons: each press is tracked by pointer id.
assert.match(live,/pressed\.current\.set\(event\.pointerId,b\);tapHaptic\(\);/);
assert.match(live,/onPointerDown=\{actionDown\} onPointerUp=\{actionUp\} onPointerCancel=\{actionUp\} onLostPointerCapture=\{actionUp\}/);
// Keyboard path is untouched.
assert.match(live,/const keyboardX=Number\(k\.has\('ArrowRight'\)\|\|k\.has\('KeyD'\)\)/);
console.log('strikers-landscape-joystick ok');
