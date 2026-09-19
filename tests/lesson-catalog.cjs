const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm');
const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/town/formatLessons.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:mod.exports,module:mod,Map,Math});
const tags=['kokoro_af_bella','kokoro_af_heart','kokoro_am_michael','kokoro_af_sarah'];let total=0,steps=0,questions=0,clips=0;const rows=[],missing=[];
for(const f of ['7v7','9v9','11v11','futsal'])for(const p of JSON.parse(fs.readFileSync(`public/lessons/${f}.json`))){
 assert(p.steps.length&&p.questions.length,p.id);const ids=new Set([...p.offense,...p.defense].map(a=>a.id));assert.equal(ids.size,p.offense.length+p.defense.length);
 for(const [i,s] of p.steps.entries()){
 for(const id of [...s.moves.map(m=>m.id),...(s.highlight??[]).flatMap(h=>h.ids),...(s.focusIds??[]),...(s.cameraFocusIds??[]),...(s.links??[]).flat()])assert(ids.has(id),`${p.id}:${i} unknown ${id}`);
 for(const t of [0,.25,.5,.75,1]){const sample=mod.exports.lessonPositions(p,i,t);for(const point of [...sample.positions.values(),sample.ball])assert(Number.isFinite(point.x)&&Number.isFinite(point.y),`${p.id}:${i} finite sampling`);}
 }
 for(const q of p.questions){const candidates=q.interact?.candidates??q.interact?.cells??q.interact?.zones??q.interact?.spots??q.interact?.paths??[];assert.equal(candidates.length,q.options.length,`${p.id} quiz option mapping`);assert(candidates[q.correct].correct,`${p.id} correct spatial choice`);assert(q.step>=0&&q.step<p.steps.length);assert(q.options.length&&q.correct>=0&&q.correct<q.options.length);}
 for(const voice of [...p.steps.map(s=>s.voice),...p.questions.flatMap(q=>[q.voice,q.explainVoice,...q.choiceVoices??[]])])for(const tag of tags){if(!voice?.[tag]){missing.push(`${p.id}:${tag}`);continue;}assert(fs.statSync(`public${voice[tag].src}`).size>100);assert(voice[tag].duration>0);clips++;}
 total++;steps+=p.steps.length;questions+=p.questions.length;rows.push({format:f,id:p.id,steps:p.steps.length,questions:p.questions.length,status:process.argv.includes('--structure-only')?'structure and finite playback samples passed; voice completion pending':'structure, finite playback samples and four-voice assets passed'});
}
if(!process.argv.includes('--structure-only'))assert.equal(missing.length,0,`${missing.length} missing voice references`);
fs.writeFileSync('/tmp/fi2-catalog-check.json',JSON.stringify(rows,null,2));console.log({total,steps,questions,clipReferences:clips});
