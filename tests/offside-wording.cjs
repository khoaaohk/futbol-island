// Offside wording (audit Nov 10 2026). Law 11 measures from the SECOND-LAST opponent (usually the last outfield defender, the
// keeper being last); the lessons say so (e.g. next7_offsideboundary). Player-facing copy used to say "past/level with the last
// defender". This pins the fix in the match feeds, pass puzzles, quizzes, ball-hunt lessons and site pages.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const files=['lib/town/match/formatAI.ts','lib/town/match/sevenAI.ts','lib/town/match/elevenAI.ts','lib/passPuzzle/explain.ts','components/games/PassPuzzleGame.tsx',
 'lib/learning/bookChecks.ts','lib/town/ballHuntLessons.ts','lib/town/npcFresh/part3.ts','lib/town/coinQuest.ts','lib/site/terms.ts','lib/site/positions.ts',
 'lib/site/formations.ts','lib/site/notesGuides.ts','lib/site/quizBank.ts','app/(site)/games/page.tsx','lib/site/cardNotes.json','lib/site/rulePlay.ts'];
for(const f of files){const s=fs.readFileSync(path.join(__dirname,'..',f),'utf8');
 assert.doesNotMatch(s,/(past|level with|just behind|is behind|stands behind|watch|line of|shoulder of) the last defenders?\b/i,f+': offside is measured from the second-last defender');}
// Spanish twins (batch C, Nov 25 2026): the Law's "penúltimo defensa/adversario", never "último" when the line is meant.
const esFiles=['lib/i18n/es/terms.ts','lib/i18n/es/positions.ts','lib/i18n/es/formations.ts','lib/i18n/es/quizBank.ts','lib/i18n/es/rules.ts',
 'lib/i18n/es/rulePlay.ts','lib/i18n/es/lessons/7v7.ts','components/es/pages/GamesEs.tsx'];
const esBad=/(más allá|a la altura|detrás|a la espalda|fijarse en|mirar|ver el balón y|cuenta como|se queda con)\s+(del?|al|el)\s+(hombro del\s+|línea del\s+)?último (defensa|rival|adversario)/i;
for(const f of esFiles){const s=fs.readFileSync(path.join(__dirname,'..',f),'utf8');
 assert.doesNotMatch(s,esBad,f+': el fuera de juego se mide con el penúltimo defensa');}
const nine=fs.readFileSync(path.join(__dirname,'../lib/town/match/formatAI.ts'),'utf8');
assert.match(nine,/offside: \["Offside!", "He was past the second-last defender when the pass was played/,'9v9 offside note');
console.log('PASS offside wording: every offside rule line says the second-last defender (EN + ES)');
