// QA Nov 14 2026 (overnight multiplayer round 3): a stranger I hid or reported on the public island was only taken out of the DRAWING
// (remoteAvatars.setHidden). The island's party runtime (lib/multiplayer/townBridge.ts) read only the party's own Hide list
// (hiddenFriends()), so the hidden kid still got my "Pass it" / "Juggle with me" ask (nearestAskable), their pond splashes and ripples
// were drawn (eachDrawn -> remotePond), their invisible force field bounced my ball (ballVsFields) and their ball was tracked.
// Every one of those now also skips a hidden stranger, only while the connection is a public world (ids are reused).
// usage: node tests/mp-hidden-stranger.cjs
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const src = fs.readFileSync(path.join(__dirname, '../lib/multiplayer/townBridge.ts'), 'utf8');
let n = 0; const t = (name, fn) => { try { fn(); n++; } catch (e) { console.error('FAIL', name); throw e; } };
t('imports the public hide list', () => assert.match(src, /import \{ isHiddenStranger(?:, onHiddenStrangers)? \} from '\.\/strangers';/));
t('one predicate: party hide or (world and hidden stranger)', () => assert.match(src, /const hiddenNow = \(id: MemberId\) => hiddenFriends\(\)\.has\(id\) \|\| \(conn\.kind === 'world' && isHiddenStranger\(id\)\);/));
const body = (name) => { const i = src.indexOf(name); assert.ok(i > 0, name); return src.slice(i, src.indexOf('\n    },', i)); };
t('nearestAskable skips a hidden stranger', () => assert.match(body('nearestAskable(x, y, z, range) {'), /if \(hiddenNow\(id\) \|\| mut\.has\(id\)/));
t('ballVsFields skips a hidden stranger', () => assert.match(body('ballVsFields(ball) {'), /hiddenNow\(id\)/));
t('ball tracks skip a hidden stranger', () => assert.match(src, /if \(b\.state !== BallState\.Free \|\| hiddenNow\(id\)\) \{ q\.ok = false;/));
t('eachDrawn (pond splashes) skips a hidden stranger in a world', () => {
  assert.match(src, /const eachDrawnOne = \(p: RemotePose, id: MemberId\) => \{ if \(drawnCb && p\.zone !== Zone\.Indoors && !drawnHid\.has\(id\) && !\(drawnWorld && isHiddenStranger\(id\)\)\) drawnCb\(id, p\); \};/);
  assert.match(body('eachDrawn(cb) {'), /drawnWorld = conn\.kind === 'world';/);
});
t('no hiddenFriends()-only check left in the per-friend paths', () => {
  for (const fn of ['nearestAskable(x, y, z, range) {', 'ballVsFields(ball) {']) assert.doesNotMatch(body(fn), /hiddenFriends\(\)\.has|hid\.has/);
});
t('door hints ("2 players in the Arcade") skip a hidden / reported stranger and recount on a Hide', () => {
  const i = src.indexOf('function syncHints() {'), fn = src.slice(i, src.indexOf('\n  }\n', i));
  assert.match(fn, /atRoomDoor\(m, d\.room\) && !hiddenNow\(m\.id\)\) n\+\+;/);
  assert.match(src, /offStrangers = onHiddenStrangers\(syncHints\)/); assert.match(src, /offFilters\(\); offStrangers\(\);/);
  assert.ok(src.indexOf('const hiddenNow =') < src.indexOf('ready = true;\n  syncHints();'), 'hiddenNow exists before the first syncHints');
});
console.log(`mp-hidden-stranger: ${n} checks passed`);
