// Edu's signature (futsal goleiro: the quick throw) film: contract checks (no browser). Run: node tests/play-film-edu-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/edu-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'edu-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,4,'four chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=28&&total<=55,`about 28–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);
  const first=c.words.split(/\s+/)[0];assert.ok(!/['’-]/.test(first),`cue "${c.words}" starts with a plain word (Kokoro splits contractions)`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/edu-futsal-signature/script.json'),'utf8'));
assert.equal(script.id,'edu-futsal-signature');
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// fallback honesty: the real match is named with its real result only; the throw is a separately labelled demonstration
const c1=film.chapters[0].narration;
assert.ok(/2022/.test(c1)&&/Finalissima/.test(c1)&&/Buenos Aires/.test(c1)&&/one all/.test(c1)&&/four to two/.test(c1),'the real final and its real result are named');
assert.ok(!/throw|save|catch|shot/i.test(c1),'no throw or save is staged or narrated inside the real match');
assert.ok(/^This is how he does it/.test(film.chapters[1].narration)&&/how he does it/i.test(film.chapters[1].label),'the throw is a clearly labelled demonstration');
assert.ok(/free/.test(film.chapters[2].narration)&&/in front of him/.test(film.chapters[2].narration),'the replay teaches the free player and the throw in front');
const c4=film.chapters[3].narration;assert.ok(/After a save, throw it fast to a free teammate to start a counter/.test(c4),'ends with the entry lesson');
assert.ok(/18 Sep 2022/.test(src)&&/Mary Terán de Weiss/.test(src)&&/1–1/.test(src)&&/4–2/.test(src),'header states the match, date, venue and result');
assert.ok(/CONFIRMED/.test(src)&&/INFERRED/.test(src),'header separates confirmed from inferred');
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Edu'].kind,'signature');
assert.ok(/lesson/.test(src)&&iconic['Edu'].lesson.startsWith('After a save'),'lesson comes from the card entry');
console.log(`Edu signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
