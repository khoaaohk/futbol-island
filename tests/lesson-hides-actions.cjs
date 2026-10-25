// Plays/lessons screen: the island action buttons (map, parachute, dive, emote grid) must be hidden. The emote-grid rule
// (.town-app .travel-actions[data-emote-grid]{display:grid}) out-ranks `.in-lesson .travel-actions`, so a later, equal-or-higher rule must hide it.
const fs = require('fs'), assert = require('assert');
const css = fs.readFileSync('app/globals.css', 'utf8');
const hide = '.town-app.in-lesson .travel-actions,.town-app.in-lesson .travel-actions[data-emote-grid]{display:none}';
const at = css.lastIndexOf(hide);
assert(at > css.lastIndexOf('.town-app .travel-actions[data-emote-grid]{display:grid'), 'lesson hide rule comes after the emote-grid display rule');
assert(css.slice(at + hide.length).indexOf('{') === -1 || !/travel-actions[^{]*\{[^}]*display:(grid|flex)/.test(css.slice(at + hide.length)), 'nothing after it shows the buttons again');
console.log('lesson-hides-actions: OK');
// Flying: an Enter button whose building door is off screen is hidden (Oct 24 2026).
{ const t = fs.readFileSync('components/Town.tsx', 'utf8');
  assert(t.includes("rideRef.current==='jetpack'&&(Math.abs(storePromptPoint.x)>1.05||Math.abs(storePromptPoint.y)>1.05)"), 'flying hides Enter when the door is off screen'); console.log('flying-enter: OK'); }
// Vending machine Go button: only on foot, scooter, bike or moped (not flying or swimming).
{ const t = fs.readFileSync('components/Town.tsx', 'utf8');
  assert(t.includes("hidePrompt:hudFocusNow!=='vending'||rideRef.current==='jetpack'||water.inWater"), 'vending Go hidden while flying or swimming'); console.log('vending-go: OK'); }
