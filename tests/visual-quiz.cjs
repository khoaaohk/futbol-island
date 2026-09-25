// Visual quiz questions (docs/quiz-design.md): schema, one-correct mapping, per-choice "why", voice clips, card-length quizzes,
// the deterministic order shuffle, and the quiz → card rule in quizProgress.ts.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm');
const load=(file,deps={})=>{const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:mod,exports:mod.exports,require:name=>deps[name]??(()=>{throw Error('unexpected import '+name);})(),Math,Map,Set,Array,Object,String,Number,JSON,DOMPoint:undefined});return mod.exports;};
const lessons=load('lib/town/formatLessons.ts'),visual=load('lib/town/visualQuiz.ts',{'./formatLessons':lessons});
const tags=['kokoro_af_bella','kokoro_af_heart','kokoro_am_michael','kokoro_af_sarah'];
const PILOT=new Set(['futsal','7v7','9v9','11v11']);// formats whose every quiz must be card length (add each format as its content lands)
let checked=0,kinds={},clips=0;
for(const fmt of ['7v7','9v9','11v11','futsal'])for(const lesson of JSON.parse(fs.readFileSync(`public/lessons/${fmt}.json`))){
 const qs=lesson.questions;
 if(PILOT.has(fmt)&&qs.length){assert(qs.length>=5,`${fmt}/${lesson.id}: card quizzes need at least 5 questions (has ${qs.length})`);
  const types=new Set(qs.filter(q=>q.visual).map(q=>q.visual.kind));assert(types.size>=2,`${fmt}/${lesson.id}: mix at least 2 visual types (has ${[...types]})`);}
 let seenVisual=false;
 for(const [i,q]of qs.entries()){
  const key=`${fmt}/${lesson.id}/q${i}`;
  if(!q.visual){assert(!seenVisual,key+': visual questions are appended after the original pitch questions (progress keys stay stable)');continue;}
  seenVisual=true;assert(!q.interact,key+': a question is either visual or a 3D pitch tap');
  const errs=visual.validateVisualQuestion(lesson,q);assert.equal(errs.length,0,key+': '+errs.join('; '));
  // one short "why" per option (the card shows the first sentence) in kid-sized sentences
  for(const s of [q.q,...q.choiceExplanations])assert(s.split(/\s+/).length<=34,key+': keep lines short: '+s);
  for(const v of [q.voice,q.explainVoice,...q.choiceVoices])for(const t of tags){assert(v?.[t]?.src,key+' voice '+t);if(!process.argv.includes('--structure-only')){assert(v[t].duration>0,key+' voiced '+t+' '+v[t].src);assert(fs.statSync('public'+v[t].src).size>100);}clips++;}
  if(q.visual.kind==='order'){const o=visual.orderDisplay(q.options.length,lesson.id+q.q);assert.deepEqual([...o].sort(),q.options.map((_,n)=>n));assert(o.some((v,n)=>v!==n),key+' order never shown solved');}
  kinds[q.visual.kind]=(kinds[q.visual.kind]??0)+1;checked++;
 }
}
// The quiz → card rule (single source; cardRewardTriggers.quizEligibleForCard delegates to it).
const qp=fs.readFileSync('lib/town/quizProgress.ts','utf8');
const rule=load('lib/town/quizProgress.ts',{'./learningProgress':{isLearningPreview:()=>false},react:{useMemo:f=>f(),useSyncExternalStore:()=>0},'./quizManifest.json':{default:JSON.parse(fs.readFileSync('lib/town/quizManifest.json'))}});
assert.equal(rule.MIN_CARD_QUIZ_QUESTIONS,5);assert.equal(rule.quizCardEligible(4,true),false);assert.equal(rule.quizCardEligible(5,false),false);assert.equal(rule.quizCardEligible(5,true),true);
const run=rule.newQuizRun('x');rule.recordRunAnswer(run,0,false);rule.recordRunAnswer(run,0,true);for(const n of [1,2,3,4])rule.recordRunAnswer(run,n,true);
assert.equal(run.firstTry.has(0),false,'a retry is not first-try');assert.equal(run.correct.size,5);
assert.equal(rule.quizRunAllCorrect(5,run),!rule.CARD_QUIZ_FIRST_TRY,'retries count unless CARD_QUIZ_FIRST_TRY');
assert.equal(rule.quizRunAllCorrect(6,run),false,'every question must be answered');
assert(/quizCardEligible\(questions,allCorrect\)/.test(fs.readFileSync('lib/town/cardRewardTriggers.ts','utf8')),'card trigger delegates to quizCardEligible');
assert(qp.includes('export function quizCardEligible'));
console.log('VISUAL_QUIZ_PASS',{checked,kinds,clips});
