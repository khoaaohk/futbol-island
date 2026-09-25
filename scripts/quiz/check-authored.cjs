// Validate authored visual quiz questions without writing anything (docs/quiz-design.md, "Authoring guide").
// usage: node scripts/quiz/check-authored.cjs <format> [lessonId ...]      exit 1 on errors; warnings are printed
const fs=require('fs'),path=require('path'),ts=require('typescript'),vm=require('vm');
process.chdir(path.resolve(__dirname,'../..'));
const load=(file,deps={})=>{const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:mod,exports:mod.exports,require:n=>deps[n],Math,Map,Set,Array,Object,String,Number,JSON});return mod.exports;};
const L=load('lib/town/formatLessons.ts'),V=load('lib/town/visualQuiz.ts',{'./formatLessons':L});
const [fmt,...only]=process.argv.slice(2);if(!fmt){console.error('usage: check-authored.cjs <format> [lessonId ...]');process.exit(2);}
const CAPS={'7v7':[12,14],'9v9':[16,18],futsal:[16,18],'11v11':[20,22]}[fmt]??[20,22];
const catalog=JSON.parse(fs.readFileSync(`public/lessons/${fmt}.json`));const dir=`scripts/quiz/authored/${fmt}`;
const files=fs.existsSync(dir)?fs.readdirSync(dir).filter(f=>f.endsWith('.json')):[];
let errors=0,warnings=0,checked=0;const err=(k,m)=>{errors++;console.log(`ERROR ${k}: ${m}`);},warn=(k,m)=>{warnings++;console.log(`warn  ${k}: ${m}`);};
const words=s=>s.trim().split(/\s+/).length,first=s=>s.split(/(?<=[.!?])\s/)[0];
const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
for(const f of files){
 let a;try{a=JSON.parse(fs.readFileSync(path.join(dir,f)));}catch(e){err(f,'invalid JSON: '+e.message);continue;}
 if(only.length&&!only.includes(a.lesson))continue;
 const lesson=catalog.find(l=>l.id===a.lesson);if(!lesson){err(f,'unknown lesson '+a.lesson);continue;}
 if(f!==a.lesson+'.json')warn(f,'file name should be <lessonId>.json');
 const base=lesson.questions.filter(q=>!q.visual),all=[...base,...a.questions],kinds=new Set(a.questions.map(q=>q.visual?.kind));
 if(all.length<5)err(a.lesson,`quiz has ${all.length} questions; needs at least 5`);
 if(kinds.size<2)err(a.lesson,`use at least 2 visual kinds (has ${[...kinds].join(',')})`);
 const picks=a.questions.filter(q=>!['order','trueFalse'].includes(q.visual?.kind)).map(q=>q.correct);if(picks.length>=2&&new Set(picks).size===1)warn(a.lesson,'vary the position of the correct answer');
 for(const [i,q]of a.questions.entries()){
  const k=`${a.lesson}/new${i}`;checked++;
  if(!q.visual){err(k,'missing visual');continue;}
  if(q.interact)err(k,'visual questions must not carry interact');
  if(q.voice||q.explainVoice||q.choiceVoices)warn(k,'voice is added by the merge script; leave it out');
  const qq={step:(q.visual.frame??q.visual.pictures?.[0]??q.visual.frames?.[0]??{step:0}).step,...q};
  for(const e of V.validateVisualQuestion(lesson,qq))err(k,e);
  if(words(q.q)>CAPS[0]+4)err(k,`question has ${words(q.q)} words (cap ${CAPS[0]} for ${fmt})`);else if(words(q.q)>CAPS[0])warn(k,`question has ${words(q.q)} words (aim ≤ ${CAPS[0]})`);
  for(const [j,s]of (q.choiceExplanations??[]).entries()){const w=words(first(s));if(w>CAPS[1]+4)err(k,`why ${j} first sentence has ${w} words (cap ${CAPS[1]})`);else if(w>CAPS[1])warn(k,`why ${j} first sentence has ${w} words (aim ≤ ${CAPS[1]})`);if(words(s)>34)err(k,`why ${j} over 34 words`);}
  if(/^(wrong|no)\b/i.test(q.choiceExplanations?.find((_,j)=>j!==q.correct)??''))warn(k,'start wrong-answer lines with the football reason, not "Wrong/No"');
  const v=q.visual,fr=v.frame;if(!fr)continue;
  let pose;try{pose=V.framePose(lesson,fr);}catch(e){err(k,'frame: '+e.message);continue;}
  const actors=[...pose.positions].map(([id,p])=>({id,p}));
  if(v.kind==='tapSpot')for(const [j,s]of (v.spots??[]).entries()){const near=actors.filter(x=>d(x.p,s)<14);if(near.length)warn(k,`spot ${'ABCD'[j]} sits on ${near.map(x=>x.id)} (keep answer spaces clear of players)`);for(const [m,o]of v.spots.entries())if(m>j&&d(s,o)<30)warn(k,`spots ${'ABCD'[j]} and ${'ABCD'[m]} are closer than 30`);if(s.x<0||s.x>270||s.y<0||s.y>400)err(k,'spot off the pitch');}
  if(v.kind==='dragToZone'){for(const [j,z]of (v.zones??[]).entries()){for(const [m,o]of v.zones.entries())if(m>j&&Math.abs(z.x-o.x)<(z.w+o.w)/2&&Math.abs(z.y-o.y)<(z.h+o.h)/2)err(k,`zones ${'ABCD'[j]} and ${'ABCD'[m]} overlap`);const inside=actors.filter(x=>x.id!==v.drag&&Math.abs(x.p.x-z.x)<z.w/2&&Math.abs(x.p.y-z.y)<z.h/2);if(inside.length)warn(k,`zone ${'ABCD'[j]} contains ${inside.map(x=>x.id)}`);}}
  if(v.kind==='bestPass'){const from=pose.positions.get(v.from);if(from&&d(from,pose.ball)>18)warn(k,`the ball is not at ${v.from}'s feet (set frame.ball:"${v.from}")`);for(const t of v.to??[]){const p=typeof t==='string'?pose.positions.get(t):t;if(!p)err(k,'pass target not in picture: '+t);}}
  if(v.kind==='pickPicture'||v.pictures){const seen=new Set();for(const p of v.pictures??[]){const key=JSON.stringify(p);if(seen.has(key))err(k,'two pictures are identical');seen.add(key);}}
 }
}
const missing=catalog.filter(l=>l.questions.length&&!files.includes(l.id+'.json')&&l.questions.length<5&&(!only.length||only.includes(l.id))).map(l=>l.id);
if(missing.length)console.log(`note: ${missing.length} lessons still under 5 questions with no authored file: ${missing.join(', ')}`);
console.log(`${fmt}: ${checked} authored questions checked, ${errors} errors, ${warnings} warnings`);process.exit(errors?1:0);
