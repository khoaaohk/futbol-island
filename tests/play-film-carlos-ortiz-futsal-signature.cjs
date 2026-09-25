// Carlos Ortiz's signature (futsal) film: contract checks (no browser). Run: node tests/play-film-carlos-ortiz-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/carlos-ortiz-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'carlos-ortiz-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,3,'three chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);
  assert.ok(!/^[^\s]*['’-]/.test(c.words.split(/\s+/)[0]),`cue "${c.words}" starts with a plain word (Kokoro)`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/carlos-ortiz-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the real moment is named; inferred details (foot, spot, distance, height) are not claimed in the match chapters
assert.ok(/2012 Futsal World Cup quarter-final/.test(film.chapters[0].narration)&&/toe/.test(film.chapters[0].narration)&&/far corner/.test(film.chapters[0].narration),'the real match and the confirmed goal (toe-poke, far corner) are named');
for(const ch of film.chapters.slice(0,2))assert.ok(!/right foot|left foot|\blow\b|near post|far away|from the back/i.test(ch.narration),'match chapters claim no inferred foot / height / distance');
assert.ok(/Spain win three two/.test(film.chapters[1].narration),'the confirmed final score');
assert.ok(/from the back/i.test(film.chapters[2].narration)&&/Keep your shot low/.test(film.chapters[2].narration)&&/skids past the keeper/.test(film.chapters[2].narration),'ends with the entry lesson');
assert.ok(/14 Nov 2012/.test(src)&&/3'18"/.test(src)&&/toe-poked the ball beyond Gustavo and into the far corner/.test(src),'header states the match date, minute and the source wording');
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Carlos Ortiz'].kind,'signature');
const look=JSON.parse(fs.readFileSync(path.join(root,'lib/town/playerAppearance.json'),'utf8'));assert.equal(look['Carlos Ortiz'].country,'Spain','card country matches');
console.log(`Carlos Ortiz signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
