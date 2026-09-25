// Manoel Tobias's signature (futsal) film: contract checks (no browser). Run: node tests/play-film-manoel-tobias-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/manoel-tobias-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'manoel-tobias-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,3,'three chapters: live, the move, the lesson');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);
  const first=c.words.split(/\s+/)[0];assert.ok(!/['’-]/.test(first),`cue "${c.words}" starts with a plain word (Kokoro splits contractions / hyphens)`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/manoel-tobias-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
assert.ok(!/safe\b/.test(src.replace(/\/\*[\s\S]*?\*\//g,'')),'never uses sheet.safe');
// the real moment is stated (confirmed facts only) and the card move is honestly framed as a demonstration
const c1=film.chapters[0].narration;
assert.ok(/1996/.test(c1)&&/World Cup final/.test(c1)&&/Barcelona/.test(c1),'the real match is named');
assert.ok(/five to four/.test(c1)&&/Six to four/.test(c1)&&/less than a minute/.test(c1),'the documented score and time');
assert.ok(!/toe/i.test(c1),'the live goal is not claimed as a toe-poke (how it was scored is not documented)');
assert.ok(/move on his card/i.test(film.chapters[1].narration),'the signature is framed honestly as the card move');
assert.ok(/toe/i.test(film.chapters[1].narration)&&/one v one/.test(film.chapters[1].narration),'shows the 1v1 and the toe-poke');
const last=film.chapters[2].narration;assert.ok(/toe-poke/i.test(last)&&/surprises the keeper before they are ready/i.test(last),'ends with the entry lesson');
assert.ok(/8 Dec 1996/.test(src)&&/39'10"/.test(src)&&/Palau Sant Jordi/.test(src),'header states the match date, venue and minute');
assert.ok(/NOT 2008/.test(src),'header records that he did not play the 2008 World Cup');
assert.ok(/NO goal is staged/.test(src),'fallback: the real-match chapter stages no invented goal');
const ch1src=src.slice(src.indexOf('chapter 1 —'),src.indexOf('chapter 2 —'));assert.ok(!/strike\(|toePoke\(|keeperDive\(/.test(ch1src),'chapter 1 stages no strike or save');
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Manoel Tobias'].kind,'signature');
assert.equal(typeof film.touch,'function','touch effect');
console.log(`Manoel Tobias signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
