// Matheus Rodrigues' signature (futsal) film: contract checks (no browser). Run: node tests/play-film-matheus-rodrigues-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/matheus-rodrigues-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'matheus-rodrigues-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,4,'four chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/matheus-rodrigues-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the real match is stated (city, year, teams, round) and only confirmed facts are narrated; the trick is framed as "how he does it"
assert.ok(/Yerevan, 2024/.test(film.chapters[0].narration)&&/Barcelona play Sporting in a futsal Champions League semi final/.test(film.chapters[0].narration),'the real match is named');
assert.ok(/Four all, then Matheus Rodrigues scores the fifth/.test(film.chapters[0].narration)&&/five four/.test(film.chapters[0].narration),'the documented 4–4 → his fifth goal → 5–4 (Wikipedia goal list)');
assert.ok(!/\b(header|volley|trick|elastico|shoots|left foot|dribbles)\b/i.test(film.chapters[0].narration),'no invented goal action in the real-match chapter');
assert.ok(/here’s how he does it/i.test(film.chapters[1].narration),'the signature is framed honestly as a demonstration');
assert.ok(!/left foot/i.test(film.chapters.map(c=>c.narration).join(' ')),'the (unsourced) left foot is not narrated');
assert.ok(/tricks work best when you do them at speed, and with a purpose/i.test(film.chapters[3].narration),'ends with the entry lesson');
assert.ok(/3 May 2024/.test(src)&&/31:10/.test(src)&&/23:58/.test(src)&&/Demirchyan Arena/.test(src)&&/5–4/.test(src),'header states the match date, venue, goal times and score');
assert.ok(/VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE null until the lead voices it');
for(const ch of film.chapters)for(const c of ch.cues)assert.ok(!/^[^ ]*[’'-]/.test(c.words),`cue "${c.words}" starts with a plain word (Kokoro splits contractions/hyphens)`);
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Matheus Rodrigues'].kind,'signature');assert.match(iconic['Matheus Rodrigues'].lesson,/at speed and with a purpose/);
const app=JSON.parse(fs.readFileSync(path.join(root,'lib/town/playerAppearance.json'),'utf8'));assert.equal(app['Matheus Rodrigues'].country,'Brazil','the card is the Brazilian player');
console.log(`Matheus Rodrigues signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
