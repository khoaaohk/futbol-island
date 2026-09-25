// Cardinal's signature (futsal pivot) film: contract checks (no browser). Run: node tests/play-film-cardinal-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/cardinal-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'cardinal-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,4,'four chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=28&&total<=55,`about 28–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);
  const first=c.words.split(/\s+/)[0];assert.ok(!/['’-]/.test(first),`cue "${c.words}" starts with a plain word (Kokoro splits contractions)`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/cardinal-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// fallback honesty: the real match is named with its real score only; the back-post move is a separately labelled demonstration
const c1=film.chapters[0].narration;
assert.ok(/2019/.test(c1)&&/Almaty/.test(c1)&&/Inter/.test(c1)&&/semi-final/.test(c1)&&/four to two/.test(c1)&&/Five two/.test(c1),'the real semi-final and its real score are named');
assert.ok(!/pass|post|tap|touch|run/i.test(c1),'no pass, run or finish is staged or narrated inside the real match');
assert.ok(/^Here is how he does it/.test(film.chapters[1].narration)&&/how he does it/i.test(film.chapters[1].label),'the move is a clearly labelled demonstration');
assert.ok(/watch the ball/i.test(film.chapters[2].narration)&&/back post/i.test(film.chapters[2].narration)&&/nobody is looking/i.test(film.chapters[2].narration),'the replay teaches the blind side');
const c4=film.chapters[3].narration;assert.ok(/keep moving between defenders/i.test(c4)&&/free when the pass comes/.test(c4),'ends with the entry lesson');
assert.ok(/26 April 2019/.test(src)&&/Almaty Arena/.test(src)&&/5–3/.test(src)&&/39:38/.test(src),'header states the match, date, venue, result and goal time');
assert.ok(/CONFIRMED/.test(src)&&/INFERRED/.test(src),'header separates confirmed from inferred');
assert.ok(/Fernando Alberto dos Santos Cardinal/.test(src),'header names the right Cardinal (futsal pivot)');
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Cardinal'].kind,'signature');assert.match(iconic['Cardinal'].lesson,/moving between defenders/);
console.log(`Cardinal signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
