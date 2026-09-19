const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm');
const moduleUnderTest={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/town/formatLessons.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:moduleUnderTest,exports:moduleUnderTest.exports,Math,Map});
const sample=moduleUnderTest.exports.lessonPositions,scales={'7v7':[37/270,55/400],'9v9':[45.7/270,73.2/400],'11v11':[68/270,105/400],futsal:[20/270,40/400]},distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);let questions=0,passes=0,minimumPassClearance=Infinity;
for(const [format,[sx,sy]] of Object.entries(scales))for(const lesson of JSON.parse(fs.readFileSync('public/lessons/'+format+'.json')))for(const [i,q]of lesson.questions.entries()){
 const key=`${format}/${lesson.id}/q${i}`,choices=q.interact.paths??q.interact.candidates??q.interact.spots??q.interact.zones,correct=choices[q.correct];assert.equal(choices.length,q.options.length,key+' option mapping');assert.equal(choices.filter(c=>c.correct).length,1,key+' unique correct choice');assert(correct.correct,key+' correct spatial index');assert.equal(q.outcomeStep,q.step+1,key+' contiguous outcome');assert(q.q.trim()&&q.explain.trim()&&q.options.every(s=>s.trim()),key+' explanation exists');assert(q.choiceExplanations.every(s=>s.trim()),key+' per-choice feedback');
 const start=sample(lesson,q.step,1),end=sample(lesson,q.outcomeStep,1),ids=new Set(start.positions.keys());
 for(const h of q.feedback?.highlight??[])for(const id of h.ids)assert(ids.has(id),key+' feedback actor '+id);
 for(const cue of q.feedback?.overlays??[]){if(cue.anchor)assert(ids.has(cue.anchor),key+' callout anchor');for(const attr of ['from','to','vertex','a','b'])if(cue[attr]?.id)assert(ids.has(cue[attr].id),key+' cue reference');}
 for(const [j,c]of choices.entries())if(c.why)assert.equal(q.choiceExplanations[j],c.why,key+' choice feedback alignment');
 if(q.interact.kind==='path'){
  if(correct.style==='pass'){passes++;assert(distance(correct.to,end.ball)<.001,key+' pass destination');for(let n=0;n<=80;n++){const pose=sample(lesson,q.outcomeStep,n/80);for(const defender of lesson.defense){const at=pose.positions.get(defender.id),gap=Math.hypot((at.x-pose.ball.x)*sx,(at.y-pose.ball.y)*sy);minimumPassClearance=Math.min(minimumPassClearance,gap);assert(gap>=.9,key+' moving defender intersects correct pass');}}}
  else{const actor=[...start.positions].sort((a,b)=>distance(a[1],correct.from)-distance(b[1],correct.from))[0];assert(distance(actor[1],correct.from)<.001,key+' route starts at actor');assert(distance(end.positions.get(actor[0]),correct.to)<.001,key+' route ends at selected target');}
 }else if(q.interact.kind==='player'){assert(ids.has(correct.id),key+' candidate exists');const moved=distance(start.positions.get(correct.id),end.positions.get(correct.id)),receives=distance(end.positions.get(correct.id),end.ball);assert(moved>=1||receives<=15,key+' chosen actor participates');}
 else if(q.interact.kind==='spot'){let reaches=false;for(let n=0;n<=80;n++)for(const at of sample(lesson,q.outcomeStep,n/80).positions.values())if(distance(at,correct)<=correct.r)reaches=true;assert(reaches,key+' selected spot reached during outcome');}
 else if(q.interact.kind==='zone'){assert([...end.positions.values(),end.ball].some(at=>Math.abs(at.x-correct.x)<=correct.w/2&&Math.abs(at.y-correct.y)<=correct.h/2),key+' selected zone contains outcome actor/ball');}
 questions++;
}
console.log('QUIZ_OUTCOMES_PASS',{questions,passes,minimumPassClearance});
