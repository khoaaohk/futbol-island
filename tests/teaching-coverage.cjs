const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const cache=new Map();
const document={createElement:()=>({width:0,height:0,getContext:()=>({font:'',measureText:t=>({width:t.length*30}),fillRect(){},fillText(){}})})};
function load(file){if(cache.has(file))return cache.get(file);const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Number,document,window:{innerHeight:800},require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});cache.set(file,mod.exports);return mod.exports;}
const {createLessonCues}=load(path.resolve('lib/town/lessonCues.ts')),{VENUES}=load(path.resolve('lib/town/venues.ts'));
const cues=createLessonCues(new T.Scene()),ground=cues.root.getObjectByName('teaching-ground-markings');let steps=0,questions=0,maxVertices=0;
for(const venue of VENUES)for(const lesson of JSON.parse(fs.readFileSync('public/lessons/'+venue.id+'.json'))){
 const session={lesson,format:venue.id,step:0,progress:0,playing:false,quiz:false,question:0,answer:null,onStep(){}};
 for(let step=0;step<lesson.steps.length;step++){
  session.step=step;session.quiz=false;session.answer=null;
  for(const t of [.15,.5,.85]){session.progress=t;cues.update(session,venue);const count=ground.geometry.drawRange.count;assert(count>0,lesson.id+':'+step+' has actual field teaching geometry');assert(count<ground.geometry.attributes.position.count,'pooled buffer has room');maxVertices=Math.max(maxVertices,count);assert.equal(cues.root.children.filter(n=>n.isSprite&&n.visible).length,0,'plays have no floating coaching labels');assert(cues.root.children.filter(n=>n.isMesh&&n.visible&&n.material.opacity===.18).length<=2,'at most two instructional fills');const positions=ground.geometry.attributes.position.array;for(let i=0;i<count*3;i++)assert(Number.isFinite(positions[i]));}
  steps++;
 }
 for(let i=0;i<lesson.questions.length;i++){
  const q=lesson.questions[i];Object.assign(session,{quiz:true,question:i,step:q.step,progress:1,answer:null});cues.update(session,venue);
  const labels=cues.root.children.filter(n=>n.isSprite&&n.visible&&n.userData.answer!==undefined),fills=cues.root.children.filter(n=>n.isMesh&&n.visible&&n.material.opacity===.18);
  assert.equal(labels.length,q.options.length,lesson.id+':'+i+' all targets render');assert.equal(fills.length,q.options.length,'no answer-giving fills before selection');assert.equal(new Set(fills.map(m=>m.material.color.getHex())).size,1,'neutral choice colors');
  session.answer=q.correct;cues.update(session,venue);assert(ground.geometry.drawRange.count>0);questions++;
 }
}
cues.dispose();console.log('TEACHING_COVERAGE_PASS',{steps,questions,maxVertices});
