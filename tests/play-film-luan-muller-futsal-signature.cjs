// Luan Muller's signature (futsal goleiro) film: contract checks (no browser). Run: node tests/play-film-luan-muller-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/luan-muller-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'luan-muller-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,4,'four chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/luan-muller-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the real match: first-minute tests by Merlim and Tomás Paçó; the 39'56" goal only on the board; technique a labelled demo; the entry lesson
assert.ok(/semi final, 2025/.test(film.chapters[0].narration)&&/Merlim/.test(film.chapters[0].narration)&&/Tomás Paçó/.test(film.chapters[0].narration),'the two first-minute tests');
assert.ok(!/square|chest|body/i.test(film.chapters[0].narration+film.chapters[1].narration),'real-match chapters never claim technique');
assert.ok(/Three nil/.test(film.chapters[1].narration)&&/reach the final/.test(film.chapters[1].narration),'the confirmed 0–3 and the final');
assert.ok(/demo/i.test(film.chapters[2].label)&&/Watch how he does it/.test(film.chapters[2].narration),'the technique is a labelled demonstration');
assert.ok(/Stay square to the ball, so shots hit your body/.test(film.chapters[3].narration),'ends with the entry lesson');
assert.ok(/2 May 2025/.test(src)&&/39'56"/.test(src)&&/pusieron/.test(src),'header states the match date, the goal minute and the source quote');
for(const ch of film.chapters)for(const c of ch.cues)assert.ok(!/^[^\s]*[’'-]/.test(c.words),`cue "${c.words}" starts with a plain word`);
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Luan Muller'].kind,'signature');
console.log(`Luan Muller signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
