// Raúl Gómez's signature (futsal) film: contract checks (no browser). Run: node tests/play-film-raul-gomez-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/raul-gomez-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'raul-gomez-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,3,'three chapters: live, replay, your turn');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=25&&total<=55,`about 25–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/raul-gomez-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the real moment is stated (tournament + year + opponent) and matches the RFEF report: back post, saved, the rebound in
const n0=film.chapters[0].narration;
assert.ok(/2021 Futsal World Cup/.test(n0)&&/round of sixteen/.test(n0)&&/Czech Republic/.test(n0),'the real match is named');
assert.ok(/back post/.test(n0)&&/saved/.test(n0)&&/follows it in/.test(n0)&&/Two nil/.test(n0),'the documented goal: back post, save, rebound, 2–0 (RFEF)');
assert.ok(/arrive at the back post at the same time as the ball/i.test(film.chapters[2].narration),'ends with the entry lesson');
assert.ok(/24 Sep 2021/.test(src)&&/Vilnius/.test(src)&&/minuto cinco/.test(src)&&/Vahala/.test(src),'header states the match date, venue, minute and the source line');
for(const ch of film.chapters)for(const c of ch.cues)assert.ok(!/^[^ ]*[’'-]/.test(c.words),`cue "${c.words}" starts with a plain word (Kokoro splits contractions/hyphens)`);
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Raúl Gómez'].kind,'signature');
assert.equal(JSON.parse(fs.readFileSync(path.join(root,'lib/town/playerAppearance.json'),'utf8'))['Raúl Gómez'].country,'Spain','the card is the Spanish player');
console.log(`Raúl Gómez signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
