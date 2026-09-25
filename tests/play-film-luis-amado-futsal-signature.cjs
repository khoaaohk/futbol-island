// Luis Amado's signature (futsal goleiro) film: contract checks (no browser). Run: node tests/play-film-luis-amado-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/luis-amado-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'luis-amado-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,4,'four chapters');assert.equal(typeof film.touch,'function','touch micro-interaction');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.includes(c.words),`cue words "${c.words}" are in the narration`);
  const first=c.words.split(/\s+/)[0];assert.ok(/^[A-Za-z0-9]+$/.test(first),`cue "${c.words}" starts with a plain word (Kokoro splits contractions / hyphens)`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/luis-amado-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the sourced moment: UEFA's commentary of the 2012 Futsal EURO final (30:31 Abramov, 30:32 Amado "point-blank", 30:33 the corner)
const c1=film.chapters[0].narration,c2=film.chapters[1].narration;
assert.ok(/2012 Futsal Euro final/.test(c1)&&/Russia against Spain/.test(c1)&&/no goals yet/.test(c1),'the real match and the 0–0 score at the time');
assert.ok(/Sergei Abramov/.test(c1)&&/close range/.test(c1)&&/Luis Amado/.test(c1),'the confirmed shooter and the point-blank save');
assert.ok(/corner/.test(c2)&&/three to one/.test(c2),'the corner that followed and the 3–1 result');
assert.ok(/demo/.test(film.chapters[2].label)&&/^How he does it/.test(film.chapters[2].narration),'the positioning chapter is labelled as a demonstration');
assert.ok(/right place early/i.test(film.chapters[3].narration)&&/saves become easier/i.test(film.chapters[3].narration),'ends with the entry lesson');
assert.ok(/11 Feb 2012/.test(src)&&/Arena Zagreb/.test(src)&&/30:31/.test(src)&&/Point-blank from Amado/.test(src),'header states date, venue, minute and the quote');
assert.ok(/CONFIRMED/.test(src)&&/INFERRED/.test(src),'header separates confirmed and inferred');
assert.ok(!/\b(minute|first half|second half|dive|dived)\b/i.test(words),'no invented match timing or dive narrated');
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Luis Amado'].kind,'signature');
console.log(`Luis Amado signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
