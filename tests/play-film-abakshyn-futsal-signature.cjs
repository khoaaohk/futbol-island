// Danyil Abakshyn's signature (futsal) film: contract checks (no browser). Run: node tests/play-film-abakshyn-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/abakshyn-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'abakshyn-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,4,'four chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/abakshyn-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
const app=JSON.parse(fs.readFileSync(path.join(root,'lib/town/playerAppearance.json'),'utf8'));assert.equal(app['Danyil Abakshyn'].country,'Ukraine','card country matches the film');
// the real match is named with its confirmed facts; the signature is honestly framed as "his trick" in a separate chapter
const n0=film.chapters[0].narration,n1=film.chapters[1].narration;
assert.ok(/2024/.test(n0)&&/bronze/.test(n0)&&/France/.test(n0)&&/Tashkent/.test(n0),'the real match is named');
assert.ok(/four one/.test(n0)&&/Five one/.test(n0)&&/Sukhov saves/.test(n0)&&/own half/.test(n0),'the documented first goal: 4–1, the Sukhov save, from his own half, 5–1');
assert.ok(/Nineteen seconds/.test(n1)&&/hat-trick/.test(n1)&&/seven one/.test(n1),'the documented hat-trick and the 7–1 result');
assert.ok(/This is his trick/.test(film.chapters[2].narration),'the signature is framed honestly as a demonstration');
assert.ok(!/France|2024|World Cup|Sukhov/.test(film.chapters.slice(2).map(c=>c.narration).join(' ')),'the demonstration never names the real match');
assert.ok(/quick toe-poke can beat the keeper before they are set/.test(film.chapters[3].narration),'ends with the entry lesson');
assert.ok(/6 Oct 2024/.test(src)&&/29'20"/.test(src)&&/29'39"/.test(src)&&/32'50"/.test(src)&&/Humo Arena/.test(src),'header states the match date, minutes and venue');
assert.ok(/INFERRED/.test(src)&&/CONFIRMED/.test(src),'header separates confirmed and inferred');
for(const ch of film.chapters)for(const c of ch.cues)assert.ok(/^[A-Za-zÀ-ÿ0-9]+(\s|$)/.test(c.words)&&!/^[^\s]*[’'-]/.test(c.words),`cue "${c.words}" starts with a plain word (Kokoro)`);
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Danyil Abakshyn'].kind,'signature');
console.log(`Danyil Abakshyn signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
