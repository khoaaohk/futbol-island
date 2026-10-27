// Pass Puzzles clean pitch (owner, Oct 27 2026: "remove text and instructions"), the same rule as Strikers (commit 8f3cd15c).
// While playing the screen holds only the pitch, the essential controls and the score/tries; after a result a short word
// ("So close!", the goal call) with no sub-line. The start (brief) and result cards keep teaching. Run: node tests/pass-puzzle-clean-play.cjs
const assert=require('assert'),fs=require('fs'),path=require('path');
const tsx=fs.readFileSync(path.join(__dirname,'..','components/games/PassPuzzleGame.tsx'),'utf8');
const ret=tsx.slice(tsx.lastIndexOf(' return <div className={`${arcade.game}'));
const play=ret.slice(ret.indexOf('<ArcadeTopBar'),ret.indexOf("{view==='levels'&&"));
assert(play.length>500,'found the in-play markup');
// Gone from the in-play markup: the tip line (brief, hint, lane read, offside warning, coach lines), hint words, modifier chips, callout sub-lines.
for(const [re,what] of [[/styles\.tip/,'tip line'],[/hintText|hintNote|briefText|briefTip/,'hint / brief words'],[/Big idea|expertIdea/,'expert idea line'],[/modifiers\(/,'modifier chips over the pitch'],[/laneRead|aimWarn/,'live lane read / offside words'],[/callout\.teach/,'callout sub-line'],[/Drag to pass|Scan is on|Nice touch|Now finish it/,'instruction copy']])
 assert.doesNotMatch(play,re,what+' removed from play');
assert.match(play,/data-callout><b>\{callout\.text\}<\/b><\/div>/,'the result word has no sub-line');
// Mid-play combos are heard, not captioned; the fail word carries no teach line.
assert.doesNotMatch(tsx,/shout\.current\(c\)/,'no live pass callouts');assert.match(tsx,/if\(c&&c\.tier>=2\)puzzleCombo\(ctx,2\)/,'combo sound kept');
assert.match(tsx,/shout\.current\(\{text:'So close!',teach:'',tier:1\}\)/);assert.match(tsx,/shout\.current\(goalCallout\(/,'goal word kept');
assert.doesNotMatch(tsx,/setHintNote|setLaneRead|setAimWarn|setBriefTip/,'no state left for removed text');
// Kept: controls, score/tries, undo, counter clock, hint (as the glowing spot), the cards, Expert.
for(const [re,what] of [[/<ArcadeTopBar game="pass-puzzle"[\s\S]*?value=\{view!=='levels'\?progressHud\.count:undefined\}/,'pass count in the shared bar'],[/try \$\{hud\.attempt\}\/\$\{hud\.attempts\}/,'tries counter on the pause card'],[/styles\.passModes/,'flight modes'],[/data-undo/,'undo'],[/data-clock/,'counter clock'],[/cycleHint/,'hint button']])
 assert.match(ret,re,what+' kept');
assert.match(tsx,/const cycleHint=\(\)=>\{if\(!spotHint\)\{setShowHint\(true\);setSpotHint\(true\);return;\}/,'hint goes straight to the spot');
assert.match(ret,/view==='brief'&&level[\s\S]*?\{briefText\}[\s\S]*?\{hintText\}/,'start card keeps the brief and hint');
assert.match(ret,/view==='result'&&outcome&&level[\s\S]*?level\.lesson[\s\S]*?\{hintText\}/,'result card keeps the lesson and hint');
assert.match(ret,/data-expert-tile/,'Expert tier kept');
console.log('PASS pass-puzzle clean play: no tips, hints, lesson lines, modifier chips or callout sub-lines while playing; cards and Expert kept');
