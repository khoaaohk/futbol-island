// Ricardo Mayor's signature (futsal) film: contract checks (no browser). Run: node tests/play-film-ricardo-mayor-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/ricardo-mayor-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'ricardo-mayor-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,3,'three chapters: live celebration, demonstration, lesson');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=25&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);
  assert.ok(!/['’-]/.test(c.words.split(/\s+/)[0]),`cue "${c.words}" starts with a plain word (Kokoro splits contractions / hyphens)`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/ricardo-mayor-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
assert.ok(!/sheet\.safe|s\.safe/.test(src),'full-sheet framing (never sheet.safe)');
// the real-match chapter stages no play (only the confirmed win and celebration); the move is a labelled demonstration
const c1=film.chapters[0].narration,c2=film.chapters[1].narration,c3=film.chapters[2].narration;
assert.ok(/2026/.test(c1)&&/final/.test(c1)&&/five goals to three/.test(c1)&&/champions/.test(c1)&&/Ricardo Mayor/.test(c1)&&/number three/.test(c1),'the confirmed final, result and Mayor (no. 3) are named');
assert.ok(!/Raya|steal|shoot|scores|goal!/i.test(c1),'no play is staged or narrated in the real-match chapter');
assert.ok(!/Raya|replayB|repBall|liveRaya/.test(src),'the Raya steal was removed from the film');
assert.ok(/Watch how he does it/.test(c2)&&/reads the pass/.test(c2)&&/cuts it out/.test(c2),'the signature is framed honestly as a demonstration');
assert.ok(/win the ball/i.test(c3)&&/pass forward fast/i.test(c3)&&/before they get back/i.test(c3),'ends with the entry lesson');
assert.ok(/7 Feb 2026/.test(src)&&/Arena Stožice/.test(src)&&/3–5/.test(src),'header states the match, date and venue');
assert.ok(/CONFIRMED:/.test(src)&&/INFERRED/.test(src),'header separates confirmed from inferred');
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Ricardo Mayor'].kind,'signature');
console.log(`Ricardo Mayor signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
