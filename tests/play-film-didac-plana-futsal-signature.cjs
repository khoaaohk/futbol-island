// Dídac Plana's signature (futsal goleiro) film: contract checks (no browser). Run: node tests/play-film-didac-plana-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/didac-plana-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'didac-plana-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,4,'four chapters');assert.equal(typeof film.touch,'function','touch micro-interaction');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().includes(c.words.toLowerCase()),`cue words "${c.words}" are in the narration`);
  const first=c.words.split(/\s+/)[0];assert.ok(/^[A-Za-z0-9]+$/.test(first),`cue "${c.words}" starts with a plain word (Kokoro splits contractions / hyphens / accents)`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/didac-plana-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// only confirmed match facts are stated; the save is framed honestly as the kind of save he is known for
assert.ok(/2026 Futsal Euro final/.test(film.chapters[0].narration)&&/Portugal/.test(film.chapters[0].narration),'the real match is named');
assert.ok(/famous for/.test(film.chapters[0].narration)&&/This is how he saves/.test(film.chapters[1].narration),'the save is framed as his signature, not a dated moment');
assert.ok(/five goals to three/.test(film.chapters[0].narration),'the confirmed 5–3 result, in the real-match chapter');
assert.ok(/demo/.test(film.chapters[1].label)&&/demo/.test(film.chapters[2].label),'the save chapters are labelled as demonstrations');
assert.ok(!/\b(save|saves|shot|blocked)\b/i.test(film.chapters[0].narration.replace('lightning saves','')),'no save is narrated inside the real final');
assert.ok(/No save, shot or pass is staged inside that final/.test(src),'header states the fallback rule');
assert.ok(!/\b(minute|second half|first half)\b/i.test(words),'no invented match timing');
const last=film.chapters[3].narration;assert.ok(/on your toes/i.test(last)&&/react fast/i.test(last)&&/close range/i.test(last),'ends with the entry lesson');
assert.ok(/7 Feb 2026/.test(src)&&/Ljubljana/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src),'header states date, venue, confirmed vs inferred');
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Dídac Plana'].kind,'signature');
console.log(`Dídac Plana signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
