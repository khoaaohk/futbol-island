// QA round 2 (Oct 25 2026, docs/QA_AUDIT2_OCT25.md): coin spending asks first and says the true price.
// #4 Boot Studio's "Buy for N" spent the coins on one tap (ball and jersey studios confirm first); it now opens "Buy these boots?".
// #3 Pass Puzzles' solved card said "Replay level · 3 coins" while puzzles are free (lib/arcade/useArcadeEntry.ts never charges them).
// Run: node tests/qa2-buy-copy.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const boots=read('components/shop/BootStudio.tsx');
const open=boots.match(/<button[^\n]*?data-boot-buy-open[^\n]*?<span>Buy for/);assert(open,'footer buy button is marked');
assert(!/onClick=\{buy\}/.test(open[0]),'footer button does not spend');
assert.match(open[0],/setBuyOpen\(true\)/,'footer button opens the confirmation');
assert.match(boots,/role="alertdialog"[^>]*aria-labelledby="boot-buy-title"/,'confirmation is an alert dialog');
assert.match(boots,/data-boot-buy-confirm onClick=\{\(\)=>\{setBuyOpen\(false\);buy\(\);\}\}/,'only the confirm button buys');
assert.match(boots,/>Not yet</,'a way out');
assert.match(boots,/if\(buyOpen\)setBuyOpen\(false\);else if\(saveOpen\)/,'Escape closes the confirmation before the studio');
assert.match(boots,/\[undo,redo,saveOpen,buyOpen,onClose\]/,'Escape handler sees the current buyOpen');
const puzzle=read('components/games/PassPuzzleGame.tsx'),entry=read('lib/arcade/useArcadeEntry.ts');
assert.match(entry,/game==='puzzle'\?\{ok:true as const\}/,'puzzles are free');
assert(!/Replay level · \d+ coins/.test(puzzle),'no coin price on the free replay');
assert.match(puzzle,/Replay level · free/);
console.log('qa2-buy-copy: ok');
