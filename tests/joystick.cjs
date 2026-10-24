// Phone movement stick (owner, Oct 23 2026): bigger ring, see-through knob, floating base. Pure math + CSS values;
// the live layout/touch check is scripts/check-joystick.cjs. Run: node tests/joystick.cjs
const assert = require('node:assert/strict'), fs = require('node:fs'), ts = require('typescript'), vm = require('node:vm'), path = require('node:path');
const load = (f) => { const m = { exports: {} }; vm.runInNewContext(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { module: m, exports: m.exports, Math }); return m.exports; };
const root = path.join(__dirname, '..'), F = load(path.join(root, 'lib/town/floatingStick.ts')), W = load(path.join(root, 'lib/town/walkControl.ts'));
const near = (a, b, e = 1e-9) => Math.abs(a - b) < e, eq = (a, b, m) => assert.deepEqual(JSON.parse(JSON.stringify(a)), b, m);

// Travel = ring radius − knob radius; the old 132 px ring keeps its ~36 px travel.
assert(near(F.stickTravel(132), 29.7, 1e-6), 'ring 132 px travel ~30 px');
assert(near(F.stickTravel(220), 220 / 2 - 220 * 0.55 / 2), 'travel is ring radius minus knob radius');
// The same RELATIVE offset gives the same normalised vector (and walk effort) at two ring sizes.
for (const [fx, fy] of [[0.05, -0.04], [0.2, 0.1], [-0.5, 0.5], [0.9, -1.4]]) {
  const a = F.stickInput(fx * F.stickTravel(132), fy * F.stickTravel(132), F.stickTravel(132)), b = F.stickInput(fx * F.stickTravel(220), fy * F.stickTravel(220), F.stickTravel(220));
  assert(near(a.x, b.x) && near(a.y, b.y), `same vector at 132 and 220 px for ${fx},${fy}`);
  const oa = W.shapeStick(a.x, a.y, { x: 0, z: 0 }), ob = W.shapeStick(b.x, b.y, { x: 0, z: 0 });
  assert(near(oa.x, ob.x) && near(oa.z, ob.z), 'same dead zone / walk floor output at both sizes');
}
const rest = F.stickInput(3, -2, F.stickTravel(220)); assert(Math.hypot(rest.x, rest.y) <= W.STICK_DEAD_ZONE, 'a resting thumb stays in the dead zone on the big ring');
const full = F.stickInput(500, 0, F.stickTravel(220)); assert(near(full.x, 1) && near(full.px, F.stickTravel(220)), 'a drag past the ring clamps to full tilt');

// Zone: left half in landscape (stops 12 px before the right column), up to the button column in portrait, below the HUD row.
const L = F.stickZone(852, 393, { top: 0, right: 59, bottom: 21, left: 59 }, 134, 706);
eq(L, { left: 67, top: 146, right: 426, bottom: 364 }, 'landscape zone');
const P = F.stickZone(393, 852, { top: 59, right: 0, bottom: 34, left: 0 }, 60, 247);
assert.equal(P.right, 235, 'portrait zone runs to 12 px before the button column'); assert.equal(P.top, 72, 'zone starts below the safe area / HUD');
assert(F.inRect(100, 500, P) && !F.inRect(300, 500, P) && !F.inRect(100, 40, P), 'inRect');
// Anchor clamping keeps the whole ring inside the zone; a press inside the clamp box anchors exactly there.
const r = 100;
eq(F.clampAnchor(120, 400, P, r), { x: 120, y: 400 }, 'free anchor');
eq(F.clampAnchor(10, 840, P, r), { x: P.left + r, y: P.bottom - r }, 'bottom-left corner press clamps inward');
eq(F.clampAnchor(230, 75, P, r), { x: P.right - r, y: P.top + r }, 'top-right corner press clamps inward');
assert.equal(F.clampAnchor(0, 0, { left: 0, top: 0, right: 100, bottom: 400 }, r).x, 50, 'a zone narrower than the ring centres it');

// CSS: phone ring size, knob 45%, see-through knob (rest ≈ .45 with the faint resting ring, more while dragging), lighter base.
const css = fs.readFileSync(path.join(root, 'app/globals.css'), 'utf8'), block = css.slice(css.indexOf('/* Movement stick (owner, Oct 23 2026)'));
assert(block.includes('--stick-size:clamp(123px,calc(100vw - 224px),180px)'), 'portrait phone ring up to 180 px');
assert(block.includes('--stick-size:min(180px,calc(100vh - 175px - env(safe-area-inset-bottom,0px)))'), 'landscape ring fits under the HUD row');
assert(block.includes('.touch-controls .joystick>span{width:55%;height:55%}'), 'knob is 55% of the ring');
const op = (re) => +block.match(re)[1];
const knob = op(/\.joystick>span\{opacity:([.\d]+)\}/), active = op(/\.joystick\[data-active=true\]>span\{opacity:([.\d]+)\}/), idle = op(/:not\(\[data-active=true\]\)\{opacity:([.\d]+)\}/);
assert(knob * idle >= 0.4 && knob * idle <= 0.55, `resting knob opacity ${knob * idle}`); assert(active > knob && active <= 0.7, 'knob a bit stronger while dragging');
assert(block.includes('.joystick{background:#294f4333;'), 'lighter ring fill');
assert.equal(F.PHONE_STICK_QUERY, '(pointer:coarse) and (max-width:600px),(pointer:coarse) and (max-height:500px)', 'phones only; desktop/tablets keep the fixed stick');
assert(block.includes('@media(pointer:coarse) and (max-width:600px),(pointer:coarse) and (max-height:500px){'), 'CSS sizes use the same phone query');
console.log('joystick: OK');
