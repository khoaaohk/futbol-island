// Eder Lima's signature (futsal) film: contract checks (no browser). Run: node tests/play-film-eder-lima-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/eder-lima-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'eder-lima-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,3,'three chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);
  assert.ok(!/^[^\s]*['’-]/.test(c.words.split(/\s+/)[0]),`cue "${c.words}" starts with a plain word (Kokoro)`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/eder-lima-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the real moment is named; inferred details (foot, placement, height) are not claimed in the match chapters
assert.ok(/2016 Futsal World Cup final/.test(film.chapters[0].narration),'the real match is named');
assert.ok(/second penalty/.test(film.chapters[0].narration)&&/ten metres/.test(film.chapters[0].narration),'the confirmed kind of goal (a second penalty from 10 m)');
assert.ok(/five three/i.test(film.chapters[0].narration)&&/Five four/.test(film.chapters[1].narration),'confirmed score before and after (3–5 → 4–5)');
assert.ok(/Argentina are champions/.test(film.chapters[1].narration),'the result is told honestly: Russia lost the final');
for(const ch of film.chapters.slice(0,2))assert.ok(!/right foot|left foot|low|corner|post/i.test(ch.narration),'match chapters claim no inferred foot / placement');
assert.ok(/turn/i.test(film.chapters[2].narration)&&/hard and low/i.test(film.chapters[2].narration)&&/just outside the area/i.test(film.chapters[2].narration),'ends with the entry lesson');
assert.ok(/1 Oct 2016/.test(src)&&/39:41/.test(src)&&/successfully converts the second penalty/.test(src),'header states the match date, minute and the source wording');
assert.ok(/strike\(t,\{foot:'r'\}\)/.test(src)&&!/foot:'l'/.test(src),'right-foot strikes and touches (verified from footage)');
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Eder Lima'].kind,'signature');
console.log(`Eder Lima signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
