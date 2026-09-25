// Gustavo Lobo's signature (futsal) film: contract checks (no browser). Run: node tests/play-film-gustavo-lobo-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/gustavo-lobo-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'gustavo-lobo-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,4,'four chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=60,`about 30–60 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);
  assert.ok(!/^[^\s]*['’-]/.test(c.words.split(/\s+/)[0]),`cue "${c.words}" starts with a plain word (Kokoro)`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/gustavo-lobo-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the real moment is named with confirmed facts only; inferred details (foot, how he got the ball, placement) are not claimed
const c1=film.chapters[0].narration,c2=film.chapters[1].narration;
assert.ok(/2016 Futsal World Cup quarter-final/.test(c1)&&/Cali/.test(c1),'the real match is named');
assert.ok(/five two/.test(c1)&&/Six two/.test(c1),'confirmed score before and after (5–2 → 6–2)');
assert.ok(/flying keeper/.test(c1)&&/own end/.test(c1),'confirmed: Spain\'s flying keeper, the strike from his own end');
for(const ch of[c1,c2])assert.ok(!/right foot|left foot|catch|save|volley|throw|header|corner|post|metres/i.test(ch),'match chapters claim no inferred foot / how he got the ball / placement / distance');
assert.ok(/Shout clear instructions/.test(film.chapters[3].narration)&&/where to be/.test(film.chapters[3].narration),'ends with the entry lesson');
assert.ok(/24 Sep 2016/.test(src)&&/38'21"/.test(src)&&/Gustavo's strike from the opposite end sealed it/.test(src),'header states the match date, minute and the source wording');
assert.ok(/foot:'r'/.test(src),'right-foot strike (library default, inferred)');
assert.ok(/INFERRED/.test(src)&&/CONFIRMED/.test(src),'header separates confirmed from inferred');
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Gustavo Lobo'].kind,'signature');
const app=JSON.parse(fs.readFileSync(path.join(root,'lib/town/playerAppearance.json'),'utf8'));assert.equal(app['Gustavo Lobo'].country,'Brazil','card country Brazil (his birth country; he played for Russia)');
console.log(`Gustavo Lobo signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
