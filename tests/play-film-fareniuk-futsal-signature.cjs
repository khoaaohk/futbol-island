// Artem Fareniuk's signature (futsal) film: contract checks (no browser). Run: node tests/play-film-fareniuk-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/fareniuk-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'fareniuk-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,4,'four chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/fareniuk-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the real moment is stated (competition + year + teams), only confirmed facts are claimed, and the wall pass is honestly framed as "how he does it"
const n0=film.chapters[0].narration;
assert.ok(/2021/.test(n0)&&/Futsal Champions League/.test(n0)&&/Uragan/.test(n0)&&/Araz/.test(n0),'the real match is named');
assert.ok(/second goal/.test(n0)&&/two one/.test(n0),'his documented goal (2–0) and the 2–1 result');
assert.ok(/pivot/.test(n0),'his role');
assert.ok(/This is how he does it/.test(film.chapters[1].narration),'the signature is framed honestly as a demonstration');
assert.ok(!/Araz|Uragan|2021|Champions League/.test(film.chapters.slice(1).map(c=>c.narration).join(' ')),'the demonstration never names the real match');
assert.ok(/show for the pass, then play it back and spin away/.test(film.chapters[3].narration),'ends with the entry lesson');
assert.ok(/28 Oct 2021/.test(src)&&/15'04"/.test(src)&&/Ivano-Frankivsk/.test(src)&&/2033595/.test(src),'header states the match date, minute, venue and UEFA match id');
for(const ch of film.chapters)for(const c of ch.cues)assert.ok(/^[A-Za-zÀ-ÿ0-9]+(\s|$)/.test(c.words)&&!/^[^\s]*[’'-]/.test(c.words),`cue "${c.words}" starts with a plain word (Kokoro)`);
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Artem Fareniuk'].kind,'signature');
console.log(`Artem Fareniuk signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
