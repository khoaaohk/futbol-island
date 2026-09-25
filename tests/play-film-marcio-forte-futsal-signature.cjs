// Marcio Forte's signature (futsal) film: contract checks (no browser). Run: node tests/play-film-marcio-forte-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/marcio-forte-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'marcio-forte-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,4,'four chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);
  assert.ok(/^[a-z0-9]+$/i.test(c.words.split(/\s+/)[0]),`cue "${c.words}" starts with a plain word (Kokoro timing)`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/marcio-forte-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the real match is named with only confirmed facts; the pass is honestly framed as a demonstration; the lesson closes the film
const c1=film.chapters[0].narration;
assert.ok(/2012/.test(c1)&&/Futsal World Cup/.test(c1)&&/captain/.test(c1)&&/number three/.test(c1)&&/three nil/.test(c1)&&/bronze/.test(c1),'the real match: 2012 World Cup, captain No. 3, 3–0, bronze');
assert.ok(/Brazil/.test(c1)&&/Italy/.test(c1),'born in Brazil, plays for Italy (card flag vs national team)');
assert.ok(/this is how he plays/i.test(film.chapters[1].narration),'the signature is framed as a demonstration');
assert.ok(/long, accurate pass to the pivot/i.test(film.chapters[3].narration)&&/skip the whole defence/i.test(film.chapters[3].narration),'ends with the entry lesson');
assert.ok(/18 Nov 2012/.test(src)&&/Huamark/.test(src)&&/Marcio FORTE \(C\)/.test(src),'header states the match, venue and the captaincy source');
assert.ok(/CONFIRMED:/.test(src)&&/INFERRED/.test(src),'confirmed vs inferred listed');
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Marcio Forte'].kind,'signature');
console.log(`Marcio Forte signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
