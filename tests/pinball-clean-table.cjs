// Futbol Pinball clean table (owner, Oct 27 2026: "remove text and instructions"). While playing, the screen holds only
// the score bar, the Left / Launch-Nudge / Right pads (the charge fill on Launch is the only meter) and a short GOAL! +points
// pop on the table after a goal. Start and end cards are unchanged. Same pattern as Strikers (commit 8f3cd15c).
const assert=require('node:assert/strict'),fs=require('node:fs');
const tsx=fs.readFileSync('components/games/ArcadeGame3D.tsx','utf8'),card=fs.readFileSync('components/games/PinballCard.tsx','utf8'),fx=fs.readFileSync('lib/games/soccerPinballFx.ts','utf8');
const play=tsx.slice(tsx.indexOf("{phase==='playing'&&kind!=='runner'&&<>"),tsx.indexOf('{card&&<div className={styles.overlay}>'));
assert.ok(play.length>500,'in-play markup found');
// 1. No tip / coach / status line for pinball: the message <p> is gated off for pinball.
assert.match(play,/\{kind!=='pinball'&&<p [^>]*className=\{styles\.message\}/,'message line skipped for pinball');
assert.doesNotMatch(play,/kind==='pinball'\)\?hud\.message/,'no pinball-keyed tip line');
// 2. No first-time "Tap left kick / right kick" hint over the table, and the component is gone.
assert.doesNotMatch(tsx,/<PinballTutorial\b/);assert.doesNotMatch(card,/data-pinball-tutorial|function PinballTutorial/);
// 3. Controls stay: both flipper pads and the Launch / Nudge pill with its charge fill.
assert.match(play,/data-pinball-pad="left"/);assert.match(play,/data-pinball-pad="right"/);assert.match(play,/data-pinball-launch=\{hud\.ready\?'launch':'nudge'\}[^>]*><i aria-hidden="true"\/>/);
// 4. Table pops: only the goal call (GOAL! +points) is drawn; combos, PERFECT / TOO EARLY, commentary and warnings are not.
assert.match(fx,/const alive=src\.age<PINBALL_POPUP_LIFE&&src\.serial>0&&src\.kind==='goal'&&\/GOAL! \\\+\/\.test\(src\.text\);/);
const show=(kind,text)=>kind==='goal'&&/GOAL! \+/.test(text);
assert.ok(show('goal','GOAL! +1,500')&&show('goal','REBOUND GOAL! +900')&&show('goal','2v1 GOAL! +800'));
for(const [k,t] of [['goal','PERFECT READ +60'],['goal','FULL TIME +500'],['lit','SWITCH FEET! 3× +75'],['lit','Top corner!'],['warn','TOO EARLY'],['score','+25'],['save','PARRIED!'],['rescue','BALL SAVED']])assert.ok(!show(k,t),`hidden: ${t}`);
// 5. Start / end cards untouched: PinballCard still renders and the full-time takeaway still flows to it.
assert.match(tsx,/<PinballCard phase=\{phase==='playing'\?'ready':phase\}[^>]*takeaway=\{phase==='over'\?hud\.message:undefined\}/);
console.log('PASS pinball clean table: no tip line, no tutorial hint, only GOAL! +points pops, pads and cards kept');
