// Lenísio's signature (futsal) film: contract checks (no browser). Run: node tests/play-film-lenisio-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/lenisio-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'lenisio-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,4,'four chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/lenisio-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the real match is stated (city, year, home World Cup, teams) and only confirmed facts are narrated; the finish is framed as "how he does it"
const n0=film.chapters[0].narration;
assert.ok(/Brasília, 2008/.test(n0)&&/Brazil play Russia/.test(n0)&&/World Cup/.test(n0),'the real match is named');
assert.ok(/scores twice/.test(n0)&&/seven nil/.test(n0),'the documented two goals and the 7–0 win (FIFA match sheet)');
assert.ok(!/\b(header|volley|turns|spins|shoots|first time|pass)\b/i.test(n0),'no invented goal action in the real-match chapter');
assert.ok(/here’s how he does it/i.test(film.chapters[1].narration),'the signature is framed honestly as a demonstration');
assert.ok(/shoot early in the box/i.test(film.chapters[3].narration)&&/less time to react/i.test(film.chapters[3].narration),'ends with the entry lesson');
assert.ok(/4 October 2008/.test(src)&&/14' LENISIO/.test(src)&&/22' LENISIO/.test(src)&&/Nilson Nelson/.test(src)&&/7–0/.test(src),'header states the match date, venue, goal minutes and score');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming);/.test(src),'VOICE null until the lead voices it');
// Kokoro matches each cue by its FIRST word, in order: that word must be the next such word in the narration after the previous cue
for(const ch of film.chapters){const ws=ch.narration.split(/\s+/).map(w=>w.toLowerCase().replace(/[^a-z0-9]/g,''));let from=0;
 for(const c of ch.cues){const first=c.words.split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g,''),k=ws.indexOf(first,from),at=ch.narration.toLowerCase().indexOf(c.words.toLowerCase());
  const wi=ch.narration.slice(0,at).split(/\s+/).filter(Boolean).length;assert.equal(k,wi,`cue "${c.words}" is the next "${first}" (Kokoro order match)`);from=k+1;}}
for(const ch of film.chapters)for(const c of ch.cues)assert.ok(!/^[^ ]*[’'-]/.test(c.words),`cue "${c.words}" starts with a plain word (Kokoro splits contractions/hyphens)`);
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Lenísio'].kind,'signature');assert.match(iconic['Lenísio'].lesson,/Shoot early in the box/);
console.log(`Lenísio signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
