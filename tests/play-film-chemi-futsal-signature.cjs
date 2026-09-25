// Chemi's signature (futsal goleiro, the low split save) film: contract checks (no browser). Run: node tests/play-film-chemi-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/chemi-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'chemi-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,4,'four chapters');assert.equal(typeof film.touch,'function','touch micro-interaction');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.includes(c.words),`cue words "${c.words}" are in the narration`);
  const first=c.words.split(/\s+/)[0];assert.ok(/^[A-Za-z0-9]+$/.test(first),`cue "${c.words}" starts with a plain word (Kokoro splits contractions / hyphens)`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/chemi-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the sourced moment: Jimbee Cartagena's report of game 4 of the 2023–24 league final ("parando un disparo a bocajarro de Marlon", 10 left, 2–0)
const c1=film.chapters[0].narration,c2=film.chapters[1].narration;
assert.ok(/2024 Spanish league final/.test(c1)&&/Jimbee Cartagena/.test(c1)&&/ElPozo Murcia/.test(c1)&&/by two goals/.test(c1)&&/ten minutes left/.test(c1),'the real match, the 2–0 and the time left');
assert.ok(/Marlon/.test(c1)&&/point-blank/.test(c1)&&/Chemi blocks/.test(c1),'the confirmed shooter and the point-blank save');
assert.ok(/five to two/.test(c2)&&/first league title/.test(c2),'the 5–2 result and the first title');
assert.ok(/demo/.test(film.chapters[2].label)&&/^How he does it/.test(film.chapters[2].narration),'the split chapter is labelled as a demonstration');
assert.ok(/split/i.test(film.chapters[3].narration)&&/low corners/i.test(film.chapters[3].narration),'ends with the entry lesson');
assert.ok(!/split/i.test(c1+' '+c2),'the match chapters never claim the body shape (inferred)');
assert.ok(/23 June 2024/.test(src)&&/bocajarro de Marlon/.test(src)&&/Restaban diez para el final/.test(src),'header states date, the quote and the time');
assert.ok(/CONFIRMED/.test(src)&&/INFERRED/.test(src),'header separates confirmed and inferred');
assert.ok(!/\b(corner kick|dive|dived|penalty)\b/i.test(words),'no invented restart or dive narrated');
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Chemi'].kind,'signature');assert.match(iconic['Chemi'].title,/split/);
// the save geometry: the ball meets the shin in the split (solved), so leg and ball always touch
const ath=load(path.join(root,'lib/plays/riso/athlete.ts'));assert.equal(typeof ath.solve,'function');
console.log(`Chemi signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
