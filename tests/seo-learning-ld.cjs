// Education structured data (seo-extras, Nov 15 2026; lib/site/learningLd.ts, lib/site/seo.ts articleLd):
//  1. Lesson pages: one LearningResource with educationalLevel, learningResourceType, teaches, inLanguage, isAccessibleForFree and an
//     audience of kids 7-12 AND coaches; its quiz is a nested Quiz (hasPart) with one Question per visible question, options as
//     suggestedAnswer and NO acceptedAnswer (the page never shows the right option).
//  2. Guide pages (drills, rules, plans, formations, positions): one node typed ['Article','LearningResource'] with the same fields.
//  3. No page has two top-level nodes with the same @type.
//  4. guideQuizPart (for the seo-design end-of-guide quiz) returns a valid nested Quiz.
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
 if(l.questions.length){const z=r[0].hasPart;assert(z&&z['@type']==='Quiz'&&!z['@context'],`${where}: nested Quiz`);
  assert.equal(z.hasPart.length,l.questions.length,`${where}: one Question per visible question`);
  for(const x of z.hasPart){assert.equal(x['@type'],'Question');assert(x.text&&x.eduQuestionType);assert(!('acceptedAnswer' in x),`${where}: never states the right answer`);
   if(x.suggestedAnswer)assert(x.suggestedAnswer.every(a=>a['@type']==='Answer'&&a.text));}
  q+=z.hasPart.length;}
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
const g=ll.guideQuizPart({path:'/learn/soccer-rules/offside',name:'Offside quiz',questions:[{q:'Is it offside?',options:['Yes','No']}]});
assert.equal(g['@type'],'Quiz');assert.equal(g.url,'https://futbolisland.app/learn/soccer-rules/offside#quiz');assert.equal(g.hasPart[0].suggestedAnswer.length,2);
console.log(`seo-learning-ld: ok (${n} pages, ${q} quiz questions)`);
