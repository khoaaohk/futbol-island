// Paco Sedano's signature (futsal goleiro) film: contract checks (no browser). Run: node tests/play-film-paco-sedano-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/paco-sedano-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'paco-sedano-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,3,'three chapters');assert.equal(typeof film.touch,'function','touch micro-interaction');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.includes(c.words),`cue words "${c.words}" are in the narration`);
  const first=c.words.split(/\s+/)[0];assert.ok(/^[A-Za-z0-9]+$/.test(first),`cue "${c.words}" starts with a plain word (Kokoro splits contractions / hyphens)`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/paco-sedano-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the sourced moment: UEFA.com's report of the 2013/14 UEFA Futsal Cup semi-final, Araz Naxçivan 4–4 Barcelona, Barcelona 4–2 on pens
const c1=film.chapters[0].narration,c2=film.chapters[1].narration,c3=film.chapters[2].narration;
assert.ok(/Baku, 2014/.test(c1)&&/UEFA Futsal Cup semi-final/.test(c1)&&/Araz against Barcelona/.test(c1)&&/four all/.test(c1)&&/penalties/.test(c1),'the real match, the 4–4 and the shoot-out');
assert.ok(/Paco Sedano/.test(c1)&&/Davi/.test(c1)&&/saves it/.test(c1),'the confirmed kicker and the save');
assert.ok(/Torras scores/.test(c2)&&/in the final/.test(c2),'the confirmed winner and Barcelona reaching the final');
assert.ok(/demo/.test(film.chapters[2].label),'the last chapter is labelled as a demonstration');
assert.ok(/stay big on your line/i.test(c3)&&/wait/i.test(c3)&&/where the ball is going/i.test(c3),'ends with the entry lesson');
assert.ok(/24 April 2014/.test(src)&&/Sarhadchi/.test(src)&&/had efforts saved/.test(src)&&/4-2 on pens/.test(src),'header states date, venue and the quote');
assert.ok(/CONFIRMED/.test(src)&&/INFERRED/.test(src),'header separates confirmed and inferred');
assert.ok(!/\b(minute|first half|second half|dive|dived|dives|left|right|corner|post)\b/i.test(c1+' '+c2),'no invented timing, dive direction or technique narrated for the real kick');
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Paco Sedano'].kind,'signature');
console.log(`Paco Sedano signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
