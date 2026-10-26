// Plays/lessons screen: the island action buttons (map, parachute, dive, emote grid) must be hidden. The emote-grid rule
// (.town-app .travel-actions[data-emote-grid]{display:grid}) out-ranks `.in-lesson .travel-actions`, so a later, equal-or-higher rule must hide it.
const fs = require('fs'), assert = require('assert');
const css = fs.readFileSync('app/globals.css', 'utf8');
const hide = '.town-app.in-lesson .travel-actions,.town-app.in-lesson .travel-actions[data-emote-grid]{display:none}';
const at = css.lastIndexOf(hide);
assert(at > css.lastIndexOf('.town-app .travel-actions[data-emote-grid]{display:grid'), 'lesson hide rule comes after the emote-grid display rule');
assert(css.slice(at + hide.length).indexOf('{') === -1 || !/travel-actions[^{]*\{[^}]*display:(grid|flex)/.test(css.slice(at + hide.length)), 'nothing after it shows the buttons again');
// Ball lessons (Oct 25 2026): an open ball lesson card (island or Explore reef ball, BallHuntLesson's data-ball-lesson dialog) hides
// the island action buttons and the dive's depth / Say hi buttons; nothing later shows them again.
{ const ball = '.town-app:has(dialog[data-ball-lesson][open]) .travel-actions,.town-app:has(dialog[data-ball-lesson][open]) .travel-actions[data-emote-grid],.town-app:has(dialog[data-ball-lesson][open]) .dive-depth,.town-app:has(dialog[data-ball-lesson][open]) .dive-emote{display:none}';
  const b = css.lastIndexOf(ball); assert(b > css.lastIndexOf('.town-app .travel-actions[data-emote-grid]{display:grid'), 'ball lesson hide rule after the emote-grid rule');
  assert(!/(travel-actions|dive-depth|dive-emote)[^{]*\{[^}]*display:(grid|flex|block)/.test(css.slice(b + ball.length)), 'nothing after it shows them again');
  const comp = fs.readFileSync('components/BallHuntLesson.tsx', 'utf8'); assert(/data-ball-lesson=\{reef\?'dive':'island'\}/.test(comp), 'the lesson dialog carries data-ball-lesson');
  const hud = fs.readFileSync('components/DiveHud.tsx', 'utf8'); assert(/v\.card\?\.lesson&&v\.card\.zone\?<BallHuntLesson/.test(hud), 'DiveHud shows the ball lesson for an explore ball'); }
console.log('lesson-hides-actions: OK');
// Flying: an Enter button whose building door is off screen is hidden (Oct 24 2026).
{ const t = fs.readFileSync('components/Town.tsx', 'utf8');
  assert(t.includes("rideRef.current==='jetpack'&&(Math.abs(storePromptPoint.x)>1.05||Math.abs(storePromptPoint.y)>1.05)"), 'flying hides Enter when the door is off screen'); console.log('flying-enter: OK'); }
// Vending machine Go button: only on foot, scooter, bike or moped (not flying or swimming).
{ const t = fs.readFileSync('components/Town.tsx', 'utf8');
  assert(t.includes("hidePrompt:hudFocusNow!=='vending'||rideRef.current==='jetpack'||water.inWater"), 'vending Go hidden while flying or swimming'); console.log('vending-go: OK'); }
