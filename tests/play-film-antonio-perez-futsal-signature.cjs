// Antonio Pérez's signature (futsal) film: contract checks (no browser). Run: node tests/play-film-antonio-perez-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/antonio-perez-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'antonio-perez-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,4,'four chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/antonio-perez-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the real moment is stated (match + year), only confirmed facts are claimed, and the steal is honestly framed as "how he defends"
assert.ok(/2026/.test(film.chapters[0].narration)&&/quarter-final/.test(film.chapters[0].narration)&&/Italy/.test(film.chapters[0].narration),'the real match is named');
assert.ok(/scores twice/.test(film.chapters[0].narration)&&/four nil/.test(film.chapters[0].narration),'his two documented goals and the 4–0 result');
assert.ok(/fixo/i.test(film.chapters[0].narration),'his documented position');
assert.ok(/This is how he defends/.test(film.chapters[1].narration),'the signature is framed honestly as a demonstration');
assert.ok(!/Italy|2026|EURO/.test(film.chapters.slice(1).map(c=>c.narration).join(' ')),'the demonstration never names the real match');
assert.ok(/last defender/.test(film.chapters[3].narration)&&/read the pass/.test(film.chapters[3].narration)&&/step in to steal it/.test(film.chapters[3].narration),'ends with the entry lesson');
assert.ok(/1 Feb 2026/.test(src)&&/19'09"/.test(src)&&/25'03"/.test(src)&&/Arena Stožice/.test(src),'header states the match date, minutes and venue');
for(const ch of film.chapters)for(const c of ch.cues)assert.ok(/^[A-Za-zÀ-ÿ0-9]+(\s|$)/.test(c.words)&&!/^[^\s]*[’'-]/.test(c.words),`cue "${c.words}" starts with a plain word (Kokoro)`);
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Antonio Pérez'].kind,'signature');
console.log(`Antonio Pérez signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
