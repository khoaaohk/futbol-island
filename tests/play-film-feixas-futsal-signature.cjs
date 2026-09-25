// Miquel Feixas's signature (futsal goleiro) film: contract checks (no browser). Run: node tests/play-film-feixas-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/feixas-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'feixas-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,4,'four chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=28&&total<=55,`about 28–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);
  const first=c.words.split(/\s+/)[0];assert.ok(!/['’-]/.test(first),`cue "${c.words}" starts with a plain word (Kokoro splits contractions)`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/feixas-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the real match: named with its real result and only the confirmed play (block, bounce, left-foot volley, off the bar)
const c1=film.chapters[0].narration,c2=film.chapters[1].narration;
assert.ok(/Barcelona/.test(c1)&&/Palma/.test(c1)&&/March 2024/.test(c1)&&/No goals/.test(c1)&&/last minute/.test(c1),'the real match is named');
assert.ok(/blocks/.test(c1)&&/volleys/.test(c1)&&/empty/.test(c1),'the confirmed play: block, volley, empty goal');
assert.ok(/left foot/.test(c2)&&/bounces/.test(c2)&&/crossbar/.test(c2),'the replay states only the confirmed details');
assert.ok(/^This is how he blocks/.test(film.chapters[2].narration)&&/demo/i.test(film.chapters[2].label),'the block lesson is a clearly labelled demonstration');
const c4=film.chapters[3].narration;assert.ok(/Come off your line/.test(c4)&&/close the angle fast/.test(c4)&&/breaks through/.test(c4),'ends with the entry lesson');
assert.ok(/9 March 2024/.test(src)&&/Palau Blaugrana/.test(src)&&/1–0/.test(src),'header states the match, date and venue');
assert.ok(/CONFIRMED/.test(src)&&/INFERRED/.test(src),'header separates confirmed from inferred');
assert.ok(/foot:'l'/.test(src),'the volley is left-footed (confirmed)');
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Miquel Feixas'].kind,'signature');
// every scene draws without throwing on a stub sheet
console.log(`Feixas signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
