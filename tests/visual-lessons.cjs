// Lesson reading pages: picture pass (Nov 17 2026, visual audit rank 1). No build: the REAL page modules are transpiled and
// rendered to static HTML here (same loader as tests/seo-rules-terms-sizes.cjs), for every lesson in English AND Spanish.
//  1. Source: the parts are server-only (no client hooks), icons are drawn like the fuel bolt, CSS uses --r-* radii, flat fills,
//     no shadows or gradients, no animation; frames are read from the lesson's own data, never the quiz's answer fields.
//  2. Every lesson page (EN + ES): the learn card with concept + key facts, 2-3 coach chapters with headings, every step's text
//     exactly once and in order, and one pitch frame per chapter (role="img" + aria-label) or the format-shape fallback.
//  3. The quiz (Nov 23 2026, owner overruled the old "never give it away" rule): played in place (QuizPlay), and an answer key
//     in a closed <details> lists every question, its options, the right answer (or right order) and an explanation without a
//     verdict opener. Still no Quiz JSON-LD. The right answers match public/lessons/*.json in both languages.
// usage: node tests/visual-lessons.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.join(__dirname,'..');process.chdir(root);
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const cache=new Map();
const cssProxy=new Proxy({},{get:(_,k)=>typeof k==='string'?k:undefined});
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const mod={exports:{}};cache.set(file,mod);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const req=id=>{
  if(id==='next/navigation')return {notFound:()=>{throw new Error('NEXT_NOT_FOUND');}};
  if(/\.css$/.test(id))return {__esModule:true,default:cssProxy};
  if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
  const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
  for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
  throw new Error('Cannot resolve '+id+' from '+file);};
 new Function('exports','module','require',out)(mod.exports,mod,req);
 return mod.exports;
}
const L=rel=>load(path.join(root,rel));
const {renderToStaticMarkup}=require('react-dom/server'),React=require('react');

// ---- 1. source ---------------------------------------------------------------------------------------------------------------
const parts=read('components/site/lessons/LessonParts.tsx'),frame=read('components/site/lessons/LessonFrame.tsx'),frames=read('lib/site/lessonFrames.ts'),css=read('components/site/lessons/lesson.module.css');
for(const [n,src] of [['LessonParts',parts],['LessonFrame',frame]])assert(!/^\s*['"]use client['"]/.test(src)&&!/useState|useEffect|onClick/.test(src),`${n} is server-only`);
assert(/shapeRendering="crispEdges"/.test(parts)&&/#7a4e12/.test(parts)&&/#f2b632/.test(parts)&&/SW='1\.4'/.test(parts),'icons drawn like the fuel bolt');
assert(!/border-radius:\d+px/.test(css)&&!/box-shadow|gradient|animation|transition|@keyframes/.test(css),'radii from tokens, flat fills, no shadows, nothing animates');
assert(!/correct|choiceExplanations|visual/.test(frames.replace(/\/\*\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'')),'frames never read quiz answer fields');
for(const f of ['app/(site)/learn/lessons/[slug]/page.tsx','components/es/pages/LessonsEs.tsx']){const s=read(f);
 assert(/<LearnCard /.test(s)&&/<CoachChapters /.test(s)&&/<LessonQuiz /.test(s)&&!/QuizCards/.test(s),`${f}: learn card, chapters and the played quiz`);}
console.log('visual-lessons: source checks OK');

// ---- 2 + 3. every lesson rendered, EN and ES --------------------------------------------------------------------------------
const lessons=L('lib/site/lessons.ts'),lf=L('lib/site/lessonFrames.ts'),es=L('lib/i18n/es/lessons.ts');
const EnPage=L('app/(site)/learn/lessons/[slug]/page.tsx').default,{LessonEsPage}=L('components/es/pages/LessonsEs.tsx');
const unesc=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const text=h=>unesc(h.replace(/<[^>]+>/g,'')).replace(/\s+/g,' ').trim();
let real=0,fallback=0,framesDrawn=0;
for(const l of lessons.LESSONS){
 const e=es.esLesson(l.id);assert(e,`${l.id}: Spanish lesson`);
 for(const [lang,h,steps,qs] of [['en',renderToStaticMarkup(React.createElement(EnPage,{params:{slug:l.id}})),l.steps,l.questions],['es',renderToStaticMarkup(React.createElement(LessonEsPage,{l:e})),e.steps,e.questions]]){
  const id=`${l.id} (${lang})`;
  assert.equal((h.match(/<h1\b/g)||[]).length,1,`${id}: one h1`);
  assert(/aria-labelledby="learn"/.test(h)&&/<dl class="facts"/.test(h),`${id}: learn card with key facts`);
  const ch=(h.match(/data-chapter=""/g)||[]).length;
  assert(ch>=2&&ch<=4,`${id}: 2-4 chapters (${ch})`);
  assert.equal((h.match(/<h3 class="chapterTitle" id="ch-\d">[^<]+<\/h3>/g)||[]).length,ch,`${id}: every chapter has a heading`);
  // every step's words exactly once, in order, numbered on from chapter to chapter
  const coach=h.slice(h.indexOf('id="coach"'),h.indexOf('id="quiz"')>0?h.indexOf('id="quiz"'):undefined);
  const lis=[...coach.matchAll(/<ol class="steps" start="(\d+)">([\s\S]*?)<\/ol>/g)];
  assert.deepEqual(lis.flatMap(m=>[...m[2].matchAll(/<li>([\s\S]*?)<\/li>/g)].map(x=>text(x[1]))),steps,`${id}: steps word for word`);
  let n=1;for(const m of lis){assert.equal(+m[1],n,`${id}: chapter list starts at step ${n}`);n+=[...m[2].matchAll(/<li>/g)].length;}
  // frames: one per chapter from the lesson's own data, or the format-shape fallback
  const svgs=[...coach.matchAll(/<svg[^>]*data-lesson-frame="(\d+)"[^>]*>/g)];
  if(/data-frames="lesson"/.test(coach)){
   assert.equal(svgs.length,ch,`${id}: one frame per chapter`);
   for(const s of svgs)assert(/role="img"/.test(s[0])&&/aria-label="[^"]{60,}"/.test(s[0]),`${id}: frame is an image with a description`);
   assert(/<figcaption[^>]*>[^<]*\d+<\/figcaption>/.test(coach),`${id}: frame caption names its step`);
   if(lang==='en'){real++;framesDrawn+=svgs.length;}
  }else{assert(/data-fallback=""/.test(coach)&&/data-diagram=/.test(coach),`${id}: fallback format diagram`);if(lang==='en')fallback++;}
  // the quiz: played in place, answer key server-rendered with the right answer marked
  assert(!/"@type":"Quiz"|"Question"|acceptedAnswer"[^}]*Quiz/.test(h.replace(/"@type":"FAQPage"[\s\S]*?<\/script>/g,'')),`${id}: no Quiz markup`);
  if(qs.length){
   assert.equal((h.match(/data-quiz-play=""/g)||[]).length,1,`${id}: one played quiz`);
   const key=h.slice(h.indexOf('data-answer-key=""'));assert(key.length<h.length&&!/data-answer-key=""[^>]*open/.test(h),`${id}: closed answer key`);
   const items=[...key.matchAll(/<h4 class="keyQ">([\s\S]*?)<\/h4>([\s\S]*?)<p data-explain="">([^<]*)<\/p>/g)];
   assert.equal(items.length,qs.length,`${id}: every question in the answer key`);
   items.forEach((m,k)=>{const q=qs[k];assert.equal(text(m[1]),q.q,`${id} q${k}: question text`);
    const marked=[...m[2].matchAll(/<li[^>]*data-right=""[^>]*>([\s\S]*?)<\/li>/g)].map(x=>text(x[1]).replace(/ \((?:Right answer|Respuesta correcta)\)$/,''));
    assert.deepEqual(marked,q.seq?q.seq.map(j=>q.options[j]):[q.options[q.correct]],`${id} q${k}: right answer marked`);
    assert(!lessons.VERDICT_OPENER.test(unesc(m[3])),`${id} q${k}: explanation opens with a verdict`);});
  }else assert(!/data-quiz-play/.test(h),`${id}: no quiz without questions`);
 }
}
assert.equal(real+fallback,lessons.LESSONS.length);
{/* the shown right answer is the game's (public/lessons/*.json `correct`, or an order question's stored order); options are not
    always in the data's order; Spanish true/false keeps Verdadero first like True */
 const raw=new Map(['7v7','9v9','11v11','futsal'].flatMap(f=>JSON.parse(read(`public/lessons/${f}.json`))).map(x=>[x.id,x]));const cl=t=>t.replace(/\s+/g,' ').trim();let moved=0,orders=0;
 for(const l of lessons.LESSONS){const rq=raw.get(l.id).questions.filter(q=>cl(q.q||'')),e=es.esLesson(l.id);
  l.questions.forEach((q,k)=>{const r=rq[k];
   if(q.kind==='order'){orders++;assert.deepEqual(q.seq.map(j=>q.options[j]),r.options.map(cl),`${l.id} q${k}: order`);assert(q.seq.some((j,n)=>j!==n),`${l.id} q${k}: not shown in order`);}
   else assert.equal(q.options[q.correct],cl(r.options[r.correct]),`${l.id} q${k}: right answer`);
   if(q.correct!==0)moved++;
   assert.deepEqual([e.questions[k].correct,e.questions[k].seq],[q.correct,q.seq],`${l.id} q${k}: Spanish answer`);
   if(q.kind==='truefalse')assert.deepEqual([q.options,e.questions[k].options.map(o=>o.toLowerCase())],[['True','False'],['verdadero','falso']],`${l.id} q${k}: true/false order`);});}
 assert(orders>=40&&moved>100,`order questions ${orders}, right answer not first in ${moved}`);}
{const {CoachChapters}=L('components/site/lessons/LessonParts.tsx');/* a lesson with no positions gets its format's shape */
 const h=renderToStaticMarkup(React.createElement(CoachChapters,{lang:'en',id:'no-such-lesson',format:'9v9',formatLabel:'9v9',steps:['a','b','c','d','e','f','g','h']}));
 assert(/data-frames="format"/.test(h)&&/data-fallback=""/.test(h)&&/data-diagram="9v9"/.test(h)&&(h.match(/data-chapter=""/g)||[]).length===3,'fallback: format shape, chapters kept');}
assert.deepEqual(lf.chapterRanges(12),[[0,4],[4,8],[8,12]]);assert.deepEqual(lf.chapterRanges(7),[[0,4],[4,7]]);
console.log(`visual-lessons: ${lessons.LESSONS.length} lessons x EN+ES rendered; ${real} with frames from their own positions (${framesDrawn} frames), ${fallback} with the format fallback`);
