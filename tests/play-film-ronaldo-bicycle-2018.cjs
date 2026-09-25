// Cristiano Ronaldo's bicycle-kick film: contract checks (no browser). Run: node tests/play-film-ronaldo-bicycle-2018.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/ronaldo-bicycle-2018.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'ronaldo-bicycle-2018');assert.equal(film.format,'11v11');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(typeof film.draw,'function');assert.equal(typeof film.touch,'function');
assert.equal(film.chapters.length,4,'four chapters: live, slow-motion replay, behind-the-goal replay, lesson');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=28&&total<=55,`about 30–50 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;
  assert.ok(ch.narration.toLowerCase().includes(c.words.toLowerCase()),`cue words "${c.words}" are in the narration`);}
 assert.ok(ch.cues.length>=4,`≥ 4 cue actions in "${ch.label}"`);}
const words=film.chapters.map(c=>c.narration).join(' '),count=words.split(/\s+/).length;
assert.ok(count>=70&&count<=90,`70–90 words (${count})`);
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/ronaldo-bicycle-2018/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
// the real moment and the lesson
assert.ok(/Carvajal crosses/.test(words)&&/back to goal/.test(words)&&/Buffon/.test(words)&&/Juventus fans/.test(words),'names the cross, the back-to-goal position, Buffon and the applauding fans');
assert.ok(/soft ground/i.test(words)&&/with a coach/i.test(words),'safety: beginners practise on soft ground with a coach');
assert.ok(/timing and body shape/i.test(words)&&/watch the ball/i.test(words)&&/jump early/i.test(words),'the lesson: timing and body shape');
assert.ok(/land safely on your hands and back\.$/i.test(film.chapters[3].narration),'ends with the lesson: land safely on your hands and back');
// house rules: seeded randomness, one figure adapter routed to the shared athlete library, sources listed at the top
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/from '\.\/athlete'/.test(src)&&/function drawPlayer\(/.test(src),'figures go through drawPlayer() → ./athlete');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called only inside the adapter');
const head=src.slice(0,src.indexOf('import '));assert.ok(/SOURCES/.test(head)&&/CONFIRMED/.test(head)&&/INFERRED/.test(head),'sources + confirmed/inferred listed at the top');
assert.ok(/3 April 2018/.test(head)&&/Allianz Stadium/.test(head),'match identified in the header');
console.log(`Ronaldo bicycle-kick film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${count} words — contract passed.`);
