// João Victor's signature (futsal) film: contract checks (no browser). Run: node tests/play-film-joao-victor-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/joao-victor-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'joao-victor-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,3,'three chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);
  assert.ok(!/^[^\s]*['’-]/.test(c.words.split(/\s+/)[0]),`cue "${c.words}" starts with a plain word (Kokoro)`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/joao-victor-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the real match chapter names only confirmed things: the 2024 World Cup, Brazil v Costa Rica, his role, his two goals (4–0, 5–0)
const c1=film.chapters[0].narration;
assert.ok(/2024 Futsal World Cup/.test(c1)&&/Costa Rica/.test(c1)&&/fixo/.test(c1)&&/Four nil/.test(c1)&&/Five nil/.test(c1),'the real match, his role and his two goals are named');
assert.ok(!/right foot|left foot|shot|shoot|strike|from distance|far out|corner|post/i.test(c1),'the match chapter claims no inferred way of scoring');
// the demonstration is labelled as such, and the film ends with the entry lesson
assert.ok(/This is how he does it/.test(film.chapters[1].narration),'chapter 2 is framed as a demonstration');
assert.ok(/defenders give you space/i.test(film.chapters[2].narration)&&/shoot from distance/i.test(film.chapters[2].narration),'ends with the entry lesson');
assert.ok(/24 Sep 2024/.test(src)&&/35'09"/.test(src)&&/39'34"/.test(src)&&/Bukhara/.test(src),'header states the match date, venue and goal minutes');
assert.ok(/No goal, pass, shot or tackle of\s+\*?\s*that match is staged|No goal, pass, shot or tackle of the match is staged/.test(src),'header states that no play of the real match is staged');
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['João Victor'].kind,'signature');
console.log(`João Victor signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
