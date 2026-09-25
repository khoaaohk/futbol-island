// Authoring aid (docs/quiz-design.md). usage: node scripts/quiz/dump-lesson.cjs <format> <lessonId|all>  — prints steps, say text, poses at each step end, existing questions
process.chdir(require('path').resolve(__dirname,'../..'));
const fs=require('fs'),ts=require('typescript'),vm=require('vm');
const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/town/formatLessons.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:mod,exports:mod.exports,Math,Map,fetch:()=>{}});
const {lessonPositions}=mod.exports;const [fmt,id]=process.argv.slice(2);
for(const l of JSON.parse(fs.readFileSync(`public/lessons/${fmt}.json`))){if(id!=='all'&&l.id!==id)continue;
 const lab=Object.fromEntries([...l.offense,...l.defense].map(a=>[a.id,a.label]));
 console.log(`\n### ${l.id} — ${l.name} [${l.difficulty}] ${l.catalog?.category}\n${l.concept}`);
 console.log('actors: gold '+l.offense.map(a=>a.id+'='+a.label).join(', ')+' | blue '+l.defense.map(a=>a.id+'='+a.label).join(', '));
 l.steps.forEach((s,i)=>{const p=lessonPositions(l,i,1);const pos=[...p.positions].map(([k,v])=>`${k}(${Math.round(v.x)},${Math.round(v.y)})`).join(' ');
  console.log(`S${i}: ${s.say??s.desc}\n    ball(${Math.round(p.ball.x)},${Math.round(p.ball.y)}) ${pos}`);});
 l.questions.forEach((q,i)=>console.log(`Q${i} [step ${q.step}${q.visual?' visual '+q.visual.kind:' '+q.interact?.kind}] ${q.q} -> ${q.options[q.correct]} | ${q.options.join(' / ')}`));
}
