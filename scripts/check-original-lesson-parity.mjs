import {lessonIcon} from './lesson-icons.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const source=resolve(process.argv[2]??'../project-archives/restored/futbol-island');
await import(pathToFileURL(resolve(source,'scripts/register-local-ts.mjs')));
const {PLAYS,withFullSquads}=await import(pathToFileURL(resolve(source,'lib/plays.ts')));
const {REBUILT_CARDS,REBUILT_QUIZ}=await import(pathToFileURL(resolve(source,'lib/curriculum/index.ts')));
let count=0;
for(const [format,cards] of Object.entries(REBUILT_CARDS)){
 const actual=JSON.parse(readFileSync(`public/lessons/${format}.json`,'utf8'));
 const expected=cards.filter(c=>c.playId).map(c=>({...withFullSquads(PLAYS.find(p=>p.id===c.playId)),catalog:c,questions:REBUILT_QUIZ[c.playId]??[]}));
 for(const p of expected)p.icon=lessonIcon(p.icon);
 for(const p of actual){for(const s of p.steps)delete s.voice;for(const q of p.questions)for(const key of ['voice','explainVoice','choiceVoices','choiceExplanations'])delete q[key];}
 assert.deepEqual(actual,JSON.parse(JSON.stringify(expected)),`${format}: exact original visible lessons and quizzes`);count+=actual.length;
}
console.log(`PASS ${count} exact original visible lesson/quiz snapshots; narration references added and icon metadata normalized`);
