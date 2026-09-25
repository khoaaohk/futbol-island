// Pany Varela's signature (futsal) film: contract checks (no browser). Run: node tests/play-film-pany-varela-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/pany-varela-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'pany-varela-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,3,'three chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/pany-varela-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the real match is stated with confirmed facts only; the move is honestly framed as a demonstration; the lesson closes the film
const n0=film.chapters[0].narration;
assert.ok(/2021/.test(n0)&&/World Cup final/.test(n0)&&/Argentina/.test(n0)&&/Two to one/.test(n0),'the real match and score are named');
assert.ok(!/one against one|1v1/i.test(n0),'the live chapter never claims the goal was a 1v1 (undocumented)');
assert.ok(/Kaunas/.test(n0)&&!/on the right/.test(n0),'the live chapter names the venue and no undocumented detail');
assert.ok(/NOT DEPICTED \(undocumented\): how either goal was scored/.test(src)&&/scoreAt=/.test(src),'chapter 1 shows the score change, never the goals');
assert.ok(/watch how he does it/i.test(film.chapters[1].narration),'the signature is framed as a demonstration');
const last=film.chapters[2].narration;assert.ok(/fake one way/i.test(last)&&/go the other/i.test(last)&&/shoot fast/i.test(last),'ends with the entry lesson');
for(const ch of film.chapters)for(const c of ch.cues)assert.ok(!/['’-]/.test(c.words.split(/\s+/)[0]),`cue "${c.words}" starts with a plain word (Kokoro)`);
assert.ok(/3 Oct 2021/.test(src)&&/Pany 15', 28'/.test(src)&&/Claudino/.test(src),'header states the date, goal minutes and scorers');
assert.ok(/INFERRED/.test(src)&&/CONFIRMED/.test(src),'header separates confirmed and inferred');
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Pany Varela'].kind,'signature');
console.log(`Pany Varela signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
