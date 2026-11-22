// Education structured data (seo-extras, Nov 15 2026; lib/site/learningLd.ts, lib/site/seo.ts articleLd):
//  1. Lesson pages: one LearningResource with educationalLevel, learningResourceType, teaches, inLanguage, isAccessibleForFree and an
//     audience of kids 7-12 AND coaches, and NO Quiz markup: the lesson page never shows the right option, and Google requires
//     acceptedAnswer on every Question (Search Console "Practice Problems", Nov 17 2026).
//  2. Guide pages (drills, rules, plans, formations, positions): one node typed ['Article','LearningResource'] with the same fields.
//  3. No page has two top-level nodes with the same @type.
//  4. guideQuizPart (for the seo-design end-of-guide quiz) returns a valid nested Quiz: every Question has an acceptedAnswer.
// usage: node tests/seo-learning-ld.cjs
const assert=require('node:assert/strict');
const {root,L,render,React,ldOf}=require('./lib/tsLoad.cjs');process.chdir(root);
const lessons=L('lib/site/lessons.ts'),ll=L('lib/site/learningLd.ts'),drills=L('lib/site/drills.ts'),rules=L('lib/site/rules.ts');
const noDupes=(ld,where)=>{const seen=new Set();for(const x of ld){const k=JSON.stringify([].concat(x['@type']).sort());assert(!seen.has(k),`${where}: duplicate @type ${k}`);seen.add(k);}};
const shape=(r,where)=>{
 for(const k of ['name','url','description','educationalLevel','learningResourceType','teaches','inLanguage'])assert(r[k],`${where}: ${k}`);
 assert.equal(r.isAccessibleForFree,true,`${where}: free`);assert.equal(r.inLanguage,'en');
 const aud=[].concat(r.audience);
 assert(aud.some(a=>a['@type']==='PeopleAudience'&&a.suggestedMinAge===7&&a.suggestedMaxAge===12),`${where}: kids audience`);
 assert(aud.some(a=>a['@type']==='EducationalAudience'&&a.educationalRole==='coach'),`${where}: coaches audience`);
};
let n=0,q=0;
const LP=L('app/(site)/learn/lessons/[slug]/page.tsx');
for(const l of lessons.LESSONS){
 const where=lessons.lessonPath(l.id),ld=ldOf(render(React.createElement(LP.default,{params:{slug:l.id}})));noDupes(ld,where);
 const r=ld.filter(x=>x['@type']==='LearningResource');assert.equal(r.length,1,`${where}: one LearningResource`);shape(r[0],where);
 const json=JSON.stringify(ld.filter(x=>x['@type']!=='FAQPage'));assert(!/"@type":"(Quiz|Question)"|acceptedAnswer|suggestedAnswer/.test(json)&&!r[0].hasPart,`${where}: no Quiz markup (the page never reveals the answer)`);
 if(l.questions.length)q++;
 n++;
}
const guidePages=[
 ['app/(site)/learn/soccer-drills/[slug]/page.tsx',drills.DRILLS.slice(0,3).map(d=>({slug:d.path.split('/').pop(),path:d.path})),'Drill'],
 ['app/(site)/learn/soccer-rules/[slug]/page.tsx',rules.RULES.slice(0,3).map(r=>({slug:r.path.split('/').pop(),path:r.path})),'Reference'],
];
for(const [file,items,type] of guidePages){const P=L(file);for(const it of items){
 const ld=ldOf(render(React.createElement(P.default,{params:{slug:it.slug}})));noDupes(ld,it.path);
 const a=ld.filter(x=>[].concat(x['@type']).includes('LearningResource'));assert.equal(a.length,1,`${it.path}: one learning node`);
 assert.deepEqual(a[0]['@type'],['Article','LearningResource'],`${it.path}: Article + LearningResource on ONE node`);
 assert.equal(a[0].learningResourceType,type,`${it.path}: learningResourceType`);shape(a[0],it.path);n++;}}
const g=ll.guideQuizPart({path:'/learn/soccer-rules/offside',name:'Offside quiz',questions:[{q:'Is it offside?',options:['Yes','No'],correct:1,explain:'No. Level is onside.'}]});
assert.equal(g['@type'],'Quiz');assert.equal(g.url,'https://futbolisland.app/learn/soccer-rules/offside#quiz');
assert.deepEqual(g.hasPart[0].acceptedAnswer,{'@type':'Answer',position:2,text:'No',encodingFormat:'text/plain',answerExplanation:{'@type':'Comment',text:'No. Level is onside.'},comment:{'@type':'Comment',text:'Yes! No. Level is onside.'}});
assert.equal(g.hasPart[0].suggestedAnswer[0].comment.text,'Not quite. The answer is: No. Level is onside.','wrong-answer comment = the shown feedback');
assert.equal(g.assesses,'Offside');assert.equal(g.hasPart[0].assesses,'Offside');assert.deepEqual(g.about,{'@type':'Thing',name:'Offside'});
// Google practice-problems rules (required + the recommended fields Search Console warned about on Nov 21 2026).
const practiceOk=(z,where)=>{const C=c=>c&&c['@type']==='Comment'&&typeof c.text==='string'&&c.text.length>0;
 assert(z['@type']==='Quiz'&&z.about&&z.about.name&&Array.isArray(z.hasPart)&&z.hasPart.length,`${where}: Quiz about + hasPart`);
 for(const k of ['educationalLevel','typicalAgeRange','assesses'])assert(z[k],`${where}: Quiz ${k}`);
 for(const x of z.hasPart){const w=`${where} "${x.text}"`;
  assert.equal(x['@type'],'Question');assert.equal(x.eduQuestionType,'Multiple choice',w);assert.equal(x.learningResourceType,'Practice problem',w);
  assert(x.text&&x.encodingFormat==='text/plain'&&x.typicalAgeRange==='7-12'&&x.assesses&&x.educationalLevel&&C(x.comment),`${w}: Question fields`);
  assert(Array.isArray(x.educationalAlignment)&&x.educationalAlignment.every(a=>a['@type']==='AlignmentObject'&&['educationalSubject','educationalLevel'].includes(a.alignmentType)&&a.targetName),`${w}: educationalAlignment`);
  assert(x.acceptedAnswer&&!Array.isArray(x.acceptedAnswer),`${w}: exactly one acceptedAnswer`);
  assert(Array.isArray(x.suggestedAnswer)&&x.suggestedAnswer.length>=1,`${w}: suggestedAnswer`);
  for(const a of [x.acceptedAnswer,...x.suggestedAnswer])assert(a['@type']==='Answer'&&a.text&&Number.isInteger(a.position)&&a.encodingFormat==='text/plain'&&C(a.comment),`${w}: Answer fields`);
  const pos=[x.acceptedAnswer,...x.suggestedAnswer].map(a=>a.position);assert.equal(new Set(pos).size,pos.length,`${w}: distinct positions`);}};
practiceOk(g,'sample');
assert.deepEqual(g.hasPart[0].suggestedAnswer.map(a=>a.text),['Yes']);
assert.throws(()=>ll.guideQuizPart({path:'/x',name:'x',questions:[{q:'?',options:['a'],correct:3,explain:'x'}]}),'a Question without a right option is refused');
// Every emitted Question: acceptedAnswer = the visible right option, suggestedAnswer = the visible wrong ones, a real question.
const checkQuestions=(z,vis,where)=>{assert.equal(z.hasPart.length,vis.length,`${where}: one Question per visible question`);
 for(const [i,x] of z.hasPart.entries()){const v=vis[i];
  assert.equal(x.text,v.q,`${where}: Question text is the visible question`);assert.equal(x.name,v.q);assert(/\?$/.test(v.q)&&!/^(Which one is right|And this one|Last one\. Which is right|Which one is a common mistake)\?$/.test(v.q),`${where}: "${v.q}" is a real question`);
  assert(x.acceptedAnswer&&x.acceptedAnswer['@type']==='Answer',`${where}: acceptedAnswer on "${v.q}"`);
  assert.equal(x.acceptedAnswer.text,v.options[v.correct],`${where}: acceptedAnswer is the visible right option`);
  assert(v.options.includes(x.acceptedAnswer.text));assert.equal(x.acceptedAnswer.answerExplanation.text,v.explain,`${where}: explanation is the shown one`);
  assert.deepEqual(x.suggestedAnswer.map(s=>s.text),v.options.filter((_,j)=>j!==v.correct),`${where}: wrong options as suggestedAnswer`);}
 const names=z.hasPart.map(x=>x.name);assert.equal(new Set(names).size,names.length,`${where}: distinct question names`);};
// 5. Every rules, terms and positions page carries its visible end-of-guide quiz as hasPart on its ONE Article+LearningResource node.
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
const gq=L('lib/site/guideQuiz.ts'),terms=L('lib/site/terms.ts'),positions=L('lib/site/positions.ts');let gn=0;
const quizPages=[
 ['app/(site)/learn/soccer-rules/[slug]/page.tsx',rules.RULES,r=>gq.ruleQuiz(r)],
 ['app/(site)/learn/soccer-terms/[slug]/page.tsx',terms.TERM_PAGES,t=>gq.termQuiz(t,terms.TERM_PAGES)],
 ['app/(site)/learn/soccer-positions/[slug]/page.tsx',positions.POSITIONS,p=>gq.positionQuiz(p,positions.POSITIONS)],
];
for(const [file,items,quizOf] of quizPages){const P=L(file);for(const it of items){
 const html=render(React.createElement(P.default,{params:{slug:it.path.split('/').pop()}})),ld=ldOf(html);noDupes(ld,it.path);
 assert(!ld.some(x=>[].concat(x['@type']).includes('Quiz')),`${it.path}: Quiz is nested, not top-level`);
 const a=ld.filter(x=>[].concat(x['@type']).includes('LearningResource'));assert.equal(a.length,1,`${it.path}: one learning node`);
 const z=a[0].hasPart,vis=quizOf(it);assert(z&&z['@type']==='Quiz'&&!z['@context'],`${it.path}: nested end-of-guide Quiz`);
 assert(/id="quiz"/.test(html)&&z.url.endsWith(it.path+'#quiz'),`${it.path}: Quiz url points at the visible #quiz`);
 checkQuestions(z,vis,it.path);practiceOk(z,it.path);for(const v of vis){assert(html.includes(esc(v.q)),`${it.path}: question shown`);for(const o of v.options)assert(html.includes(esc(o)),`${it.path}: option shown`);}
 gn++;}}
console.log(`seo-learning-ld: ok (${n} pages, ${q} lessons with an unmarked quiz, ${gn} guide quizzes)`);
