// Vander Carioca's signature (futsal) film: contract checks (no browser). Run: node tests/play-film-vander-carioca-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/vander-carioca-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'vander-carioca-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,3,'three chapters: live, the move, the lesson');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);
  const first=c.words.split(/\s+/)[0];assert.ok(!/['’-]/.test(first),`cue "${c.words}" starts with a plain word (Kokoro splits contractions / hyphens)`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/vander-carioca-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
assert.ok(!/safe\b/.test(src.replace(/\/\*[\s\S]*?\*\//g,'')),'never uses sheet.safe');
// the real moment is stated (confirmed facts only) and the card move is honestly framed as a demonstration
const c1=film.chapters[0].narration;
assert.ok(/2004/.test(c1)&&/World Cup/.test(c1)&&/Taipei/.test(c1)&&/third place/.test(c1),'the real match is named');
assert.ok(/six to one/.test(c1)&&/seven to four/.test(c1)&&/number fourteen/.test(c1)&&/Argentina/.test(c1),'the documented scores and his shirt number');
assert.ok(!/lay|pass|scores|goal/i.test(c1),'no play of his is claimed in the real match (none is documented)');
assert.ok(/move on his card/i.test(film.chapters[1].narration)&&/lay-off/.test(film.chapters[1].narration),'the signature is framed honestly as the card move');
const last=film.chapters[2].narration;assert.ok(/Let the ball do the work/.test(last)&&/forty-two/.test(last),'ends with the entry lesson and his long career');
assert.ok(/5 Dec 2004/.test(src)&&/NTU Gymnasium/.test(src)&&/\[14\] \* VANDER/.test(src),'header states the match date, venue and his line-up entry');
assert.ok(/Vander Iacovino/.test(src)&&/NAMESAKE/.test(src),'header records the namesake check');
assert.ok(/NO goal or pass is staged/.test(src),'fallback: the real-match chapter stages no invented play');
const ch1src=src.slice(src.indexOf('chapter 1 —'),src.indexOf('chapter 2 —'));assert.ok(!/strike\(|layOff\(|keeperDive\(|dribble\(/.test(ch1src),'chapter 1 stages no pass, shot or save');
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Vander Carioca'].kind,'signature');
const look=JSON.parse(fs.readFileSync(path.join(root,'lib/town/playerAppearance.json'),'utf8'));assert.equal(look['Vander Carioca'].country,'Brazil','the card is Brazil');
assert.equal(typeof film.touch,'function','touch effect');
console.log(`Vander Carioca signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
