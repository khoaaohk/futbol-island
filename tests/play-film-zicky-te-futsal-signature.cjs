// Zicky Té’s signature (futsal) film: contract checks (no browser). Run: node tests/play-film-zicky-te-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/zicky-te-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'zicky-te-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,4,'four chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/zicky-te-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the real moment is stated (competition + year), only documented facts are narrated, and the signature is framed honestly
assert.ok(/Euro 2022 semi-final/.test(film.chapters[0].narration)&&/beat Russia/.test(film.chapters[1].narration)&&/two down/.test(film.chapters[0].narration)&&/Three two/.test(film.chapters[0].narration),'the real match and score line');
assert.ok(!/(left|right) foot|header|volley|top corner|far post/i.test(film.chapters.slice(0,2).map(c=>c.narration).join(' ')),'the undocumented finish is never described');
assert.ok(/here’s how he does it/i.test(film.chapters[2].narration),'the signature is framed honestly as a demonstration');
assert.ok(/back to goal/i.test(film.chapters[3].narration)&&/hold off the defender/i.test(film.chapters[3].narration)&&/spin and shoot/i.test(film.chapters[3].narration),'ends with the entry lesson');
for(const ch of film.chapters)for(const c of ch.cues)assert.ok(!/[’'\-]/.test(c.words.split(' ')[0]),`cue "${c.words}" starts with a plain word (Kokoro splits contractions/hyphens)`);
assert.ok(/4 Feb 2022/.test(src)&&/38'41"/.test(src)&&/31'10"/.test(src)&&/Ziggo Dome/.test(src),'header states the match date, venue and minutes');
assert.ok(/No goal is staged/.test(src)&&!/function liveBall|repBall/.test(src),'fallback: the real-match chapters never stage the undocumented goal');
assert.ok(/INFERRED/.test(src)&&/CONFIRMED/.test(src),'header separates confirmed from inferred');
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Zicky Té'].kind,'signature');
console.log(`Zicky Té signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
