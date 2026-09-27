const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript');
const m={exports:{}};new Function('exports','module','require',ts.transpileModule(fs.readFileSync('lib/paths/formatPaths.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText)(m.exports,m,id=>require('../lib/paths/'+id));
const {FORMAT_PATHS,lessonEvidence,validPathLaunch}=m.exports;let core=0,depth=0;
for(const p of FORMAT_PATHS){const catalog=JSON.parse(fs.readFileSync(`public/lessons/${p.format}.json`)),lessons=p.chapters.flatMap(c=>c.lessons),all=[...lessons,...p.depth];assert.equal(lessons.length,12);core+=lessons.length;depth+=p.depth.length;assert.deepEqual(all.map(l=>l.id).sort(),catalog.map(l=>l.id).sort());for(const l of all){const source=catalog.find(x=>x.id===l.id);assert.equal(l.steps,source.steps.length);assert.equal(l.questions,source.questions.length);const prefix=`${p.format}:${l.id}:`,steps=new Set(Array.from({length:l.steps},(_,i)=>prefix+i)),answers=new Set(Array.from({length:l.questions},(_,i)=>prefix+i));assert(lessonEvidence(p.format,l,new Set(),answers).complete,'passing the quiz completes the lesson (user, Sep 26 2026)');assert(!lessonEvidence(p.format,l,steps,new Set()).complete,'watch alone insufficient');assert(lessonEvidence(p.format,l,steps,answers).complete);answers.delete(prefix+0);assert.equal(lessonEvidence(p.format,l,steps,answers).question,0);assert.equal(lessonEvidence(p.format,l,steps,answers).quiz,true);assert(validPathLaunch({format:p.format,lessonId:l.id,step:0,quiz:false,question:0,nonce:1}));assert(!validPathLaunch({format:p.format,lessonId:l.id,step:l.steps,quiz:false,question:0,nonce:1}));}}
assert.equal(core,48);assert.equal(depth,48);console.log('PASS four paths, 48 core / 48 depth, full catalog coverage, evidence and safe launch bounds');
const eleven=FORMAT_PATHS.find(path=>path.format==='11v11');
assert.equal(eleven.openingStory,'reset','Mental Toughness opens the 11v11 path');
assert(!eleven.chapters.some(chapter=>chapter.lessons.some(lesson=>lesson.story==='reset')),'opening film must not duplicate a later stop');
assert(eleven.chapters.some(chapter=>chapter.lessons.some(lesson=>lesson.story==='loss')),'After the Final Whistle stays on the 11v11 path');
console.log('PASS first 11v11 Mental Toughness stop without duplicate, retained loss stop');
// Stories between two chapter islands sit in the gap, clear of both islands (user, Sep 25 2026), spaced evenly; a tight gap grows.
{const bm={exports:{}};new Function('exports','module','require',ts.transpileModule(fs.readFileSync('lib/paths/betweenStops.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(bm.exports,bm,require);
 const {placeBetweenStops,BETWEEN_H,ISLAND_TOP,ISLAND_BOTTOM}=bm.exports;
 const L=(id,y)=>({lesson:{id},index:0,y}),S=(y,up)=>({lesson:{id:'x'},index:1,y,...(up?{upcoming:{}}:{story:'s'})});
 const clear=(stops,ends,starts)=>{const islands=[];for(let c=0;c<ends.length;c++){const a=stops.find(s=>!s.story&&!s.upcoming&&s.lesson.id===starts[c]),b=stops.find(s=>!s.story&&!s.upcoming&&s.lesson.id===ends[c]);islands.push([a.y+ISLAND_TOP,b.y+ISLAND_BOTTOM]);}
  for(const s of stops.filter(s=>s.story||s.upcoming)){const box=[s.y-32,s.y-32+BETWEEN_H];for(const [t,b] of islands)assert.ok(box[1]<=t||box[0]>=b,`between item at ${s.y} overlaps an island ${t}-${b}`);}};
 for(const [label,stops] of [['one story',[L('a',84),L('b',284),S(484),L('c',794)]],['story + optional',[L('a',84),L('b',284),S(484),S(684,true),L('c',994)]],['tight gap',[L('a',84),L('b',284),S(484),S(500),S(520),L('c',600)]],['after the last stop',[L('a',84),L('b',284),S(484)]]]){
  const ends=stops.some(s=>s.lesson.id==='c')?['b','c']:['b'],starts=stops.some(s=>s.lesson.id==='c')?['a','c']:['a'];
  placeBetweenStops(stops,ends);clear(stops,ends,starts);
  const items=stops.filter(s=>s.story||s.upcoming);for(let k=1;k<items.length;k++)assert.ok(items[k].y-items[k-1].y>=BETWEEN_H,`${label}: items do not overlap each other`);}
 console.log('PASS stories between chapter islands sit in the gap, clear of both islands, evenly spaced; tight gaps grow');}
