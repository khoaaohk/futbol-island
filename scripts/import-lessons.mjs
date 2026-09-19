import {lessonIcon} from './lesson-icons.mjs';
// Explicit one-time content import. The running app has no dependency on V1.
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {writeFileSync,mkdirSync,readFileSync,existsSync,copyFileSync} from 'node:fs';
const source=resolve(process.argv[2]??'../project-archives/restored/futbol-island');
await import(pathToFileURL(resolve(source,'scripts/register-local-ts.mjs')));
const {PLAYS,withFullSquads}=await import(pathToFileURL(resolve(source,'lib/plays.ts')));
const {REBUILT_CARDS,REBUILT_QUIZ}=await import(pathToFileURL(resolve(source,'lib/curriculum/index.ts')));
const {cleanNarration}=await import(pathToFileURL(resolve(source,'lib/voice.ts')));
const {voiceFileHash}=await import(pathToFileURL(resolve(source,'lib/voiceFiles.ts')));
const tags=['kokoro_af_bella','kokoro_af_heart','kokoro_am_michael','kokoro_af_sarah'];
const manifests=Object.fromEntries(tags.map(tag=>[tag,JSON.parse(readFileSync(resolve(source,`public/voice/${tag}/manifest.json`),'utf8'))]));
const generated=existsSync('public/lessons/generated-voice.json')?JSON.parse(readFileSync('public/lessons/generated-voice.json','utf8')):{};
const report={formats:{},voices:Object.fromEntries(tags.map(tag=>[tag,{copied:new Set(),generated:new Set(),sourceMissing:[],missing:[]}]))};
function clips(text,context){const hash=voiceFileHash(cleanNarration(text));return Object.fromEntries(tags.flatMap(tag=>{const entry=manifests[tag].files[hash],file=resolve(source,`public/voice/${tag}/${hash}.m4a`);if(!entry||!existsSync(file)){report.voices[tag].sourceMissing.push({context,text,hash});const local=generated[tag]?.[hash];if(local&&existsSync(`public${local.src}`)){report.voices[tag].generated.add(hash);return [[tag,local]];}report.voices[tag].missing.push({context,text,hash});return [];}mkdirSync(`public/voice/${tag}`,{recursive:true});copyFileSync(file,`public/voice/${tag}/${hash}.m4a`);report.voices[tag].copied.add(hash);return [[tag,{src:`/voice/${tag}/${hash}.m4a`,duration:entry.d}]];}));}
mkdirSync('public/lessons',{recursive:true});
for(const [format,cards] of Object.entries(REBUILT_CARDS)){
 const lessons=cards.filter(c=>c.playId).map(c=>{const p=PLAYS.find(p=>p.id===c.playId);if(!p)throw Error(c.playId);const lesson=withFullSquads(p);return {...lesson,icon:lessonIcon(lesson.icon),steps:lesson.steps.map((s,i)=>({...s,voice:clips(s.say??s.desc,`${p.id}:step:${i}`)})),catalog:c,questions:(REBUILT_QUIZ[p.id]??[]).map((q,i)=>({...q,voice:clips(q.q,`${p.id}:question:${i}`),explainVoice:clips(q.explain,`${p.id}:explain:${i}`),choiceExplanations:(q.interact?.candidates??q.interact?.cells??q.interact?.zones??q.interact?.spots??q.interact?.paths??[]).map(o=>o.why??q.explain),choiceVoices:(q.interact?.candidates??q.interact?.cells??q.interact?.zones??q.interact?.spots??q.interact?.paths??[]).map((o,j)=>clips(o.why??q.explain,`${p.id}:choice:${i}:${j}`))}))};});
 report.formats[format]={plays:lessons.length,steps:lessons.reduce((n,p)=>n+p.steps.length,0),questions:lessons.reduce((n,p)=>n+p.questions.length,0)};
 writeFileSync(`public/lessons/${format}.json`,JSON.stringify(lessons));console.log(format,lessons.length);
}

for(const tag of tags){const v=report.voices[tag];v.copied=v.copied.size;v.generated=v.generated.size;console.log(tag,v.copied,'copied;',v.generated,'completed with original engine;',v.missing.length,'missing line references');}
writeFileSync('public/lessons/voice-audit.json',JSON.stringify(report,null,2));
