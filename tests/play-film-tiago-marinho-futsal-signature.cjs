// Tiago Marinho's signature (futsal goleiro) film: contract checks (no browser). Run: node tests/play-film-tiago-marinho-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/tiago-marinho-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'tiago-marinho-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,3,'three chapters');assert.equal(typeof film.touch,'function','touch micro-interaction');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=28&&total<=55,`about 28–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.includes(c.words),`cue words "${c.words}" are in the narration`);
  const first=c.words.split(/\s+/)[0];assert.ok(/^[A-Za-z0-9]+$/.test(first),`cue "${c.words}" starts with a plain word (Kokoro splits contractions / hyphens)`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/tiago-marinho-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the sourced moment: FIFA summary + play-by-play of Argentina 2–3 Brazil (a.e.t.), 2012 QF: Cuzzolino from distance, Tiago's save at 36'04"
const [c1,c2,c3]=film.chapters.map(c=>c.narration);
assert.ok(/Bangkok, 2012/.test(c1)&&/quarter-final/.test(c1)&&/Argentina against Brazil/.test(c1)&&/two all/.test(c1)&&/four minutes left/.test(c1),'the real match, 2–2, four minutes left');
assert.ok(/Leandro Cuzzolino/.test(c1)&&/far out/.test(c1)&&/Tiago/.test(c1),'the confirmed shooter, distance and keeper');
assert.ok(/three to two after extra time/.test(c2)&&/world champions/.test(c2),'the 3–2 a.e.t. result and the 2012 title');
assert.ok(/demo/.test(film.chapters[2].label)&&/^How he does it/.test(c3),'the technique chapter is labelled as a demonstration');
assert.ok(/weight forward, on your toes, ready to spring/i.test(c3),'ends with the entry lesson');
assert.ok(/14 Nov 2012/.test(src)&&/Indoor Stadium Huamark/.test(src)&&/36'04"/.test(src)&&/fine acrobatic save/.test(src),'header states date, venue, minute and the quote');
assert.ok(/CONFIRMED/.test(src)&&/INFERRED/.test(src),'header separates confirmed and inferred');
assert.ok(!/\b(corner|dive|dived|right hand|left hand|near post|far post|top corner)\b/i.test(c1+' '+c2),'no inferred detail of the save narrated');
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Tiago Marinho'].kind,'signature');
const app=JSON.parse(fs.readFileSync(path.join(root,'lib/town/playerAppearance.json'),'utf8'));assert.equal(app['Tiago Marinho'].country,'Brazil','the card is Brazilian');
console.log(`Tiago Marinho signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
