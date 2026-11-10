// Offside wording (audit Nov 10 2026). Law 11 measures from the SECOND-LAST opponent (usually the last outfield defender, the
// keeper being last); the lessons say so (e.g. next7_offsideboundary). Player-facing copy used to say "past/level with the last
// defender". This pins the fix in the match feeds, pass puzzles, quizzes, ball-hunt lessons and site pages.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const files=['lib/town/match/formatAI.ts','lib/town/match/sevenAI.ts','lib/town/match/elevenAI.ts','lib/passPuzzle/explain.ts','components/games/PassPuzzleGame.tsx',
 'lib/learning/bookChecks.ts','lib/town/ballHuntLessons.ts','lib/town/npcFresh/part3.ts','lib/town/coinQuest.ts','lib/site/terms.ts','lib/site/positions.ts'];
for(const f of files){const s=fs.readFileSync(path.join(__dirname,'..',f),'utf8');
 assert.doesNotMatch(s,/(past|level with|just behind) the last defenders?\b/i,f+': offside is measured from the second-last defender');}
const nine=fs.readFileSync(path.join(__dirname,'../lib/town/match/formatAI.ts'),'utf8');
assert.match(nine,/offside: \["Offside!", "He was past the second-last defender when the pass was played/,'9v9 offside note');
console.log('PASS offside wording: every offside rule line says the second-last defender');
