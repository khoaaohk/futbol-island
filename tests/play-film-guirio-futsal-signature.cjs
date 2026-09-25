// Ouassini Guirio's signature (futsal) film: contract checks (no browser). Run: node tests/play-film-guirio-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/guirio-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'guirio-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,4,'four chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/guirio-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the real moment is stated (match + year), only confirmed facts are claimed, and the move is honestly framed as "how he does it"
const n0=film.chapters[0].narration;
assert.ok(/2026/.test(n0)&&/third-place match/.test(n0)&&/Ljubljana/.test(n0)&&/Croatia/.test(n0),'the real match is named');
assert.ok(/three one/.test(n0)&&/number fourteen/.test(n0)&&/three goals/.test(n0)&&/five all/.test(n0)&&/Croatia win on penalties/.test(n0),'1–3, No. 14, his hat-trick, 5–5 and the shoot-out result');
assert.ok(!/Portugal|Ukraine|semi-final|quarter-final|France win/.test(n0),'not the matches used by other films, and no invented win');
assert.ok(/This is how he does it/.test(film.chapters[1].narration),'the signature is framed honestly as a demonstration');
assert.ok(!/Croatia|2026|EURO|Ljubljana/.test(film.chapters.slice(1).map(c=>c.narration).join(' ')),'the demonstration never names the real match');
assert.ok(/keep the ball close to your body when a defender is right behind you/.test(film.chapters[3].narration),'ends with the entry lesson');
assert.ok(/7 Feb 2026/.test(src)&&/21'18"/.test(src)&&/31'19"/.test(src)&&/37'34"/.test(src)&&/Arena Stožice/.test(src),'header states the match date, minutes and venue');
const heads=film.chapters[0].cues.map(c=>c.headline).filter(Boolean);assert.ok(heads.includes('Hat-trick!')&&heads.includes('1–3')&&heads.includes('5–5')&&heads.includes('Penalties: 5–6'),'headlines: 1–3, hat-trick, 5–5, penalties');
for(const ch of film.chapters)for(const c of ch.cues)assert.ok(/^[A-Za-zÀ-ÿ0-9]+(\s|$)/.test(c.words)&&!/^[^\s]*[’'-]/.test(c.words),`cue "${c.words}" starts with a plain word (Kokoro)`);
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Ouassini Guirio'].kind,'signature');
const look=JSON.parse(fs.readFileSync(path.join(root,'lib/town/playerAppearance.json'),'utf8'));assert.equal(look['Ouassini Guirio'].country,'France','the card is French, like the film');
console.log(`Ouassini Guirio signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
