// Souheil Mouhoudine's signature (futsal) film: contract checks (no browser). Run: node tests/play-film-mouhoudine-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/mouhoudine-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'mouhoudine-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,4,'four chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/mouhoudine-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the real moment is stated (match + year), only confirmed facts are claimed, and the steal is honestly framed as "how he wins the ball"
const n0=film.chapters[0].narration;
assert.ok(/2026/.test(n0)&&/quarter-final/.test(n0)&&/Riga/.test(n0)&&/Ukraine/.test(n0),'the real match is named');
assert.ok(/one all after forty minutes/.test(n0)&&/In extra time/.test(n0)&&/three goals/.test(n0)&&/France win four two/.test(n0),'1–1 after 40 minutes, his extra-time hat-trick and the 4–2 result');
assert.ok(/captain/.test(n0),'his documented armband');
assert.ok(!/Portugal|semi-final/.test(n0),'not the semi-final used by the Bernardo Paçó film');
assert.ok(/This is how he wins the ball/.test(film.chapters[1].narration),'the signature is framed honestly as a demonstration');
assert.ok(!/Ukraine|2026|EURO|Riga/.test(film.chapters.slice(1).map(c=>c.narration).join(' ')),'the demonstration never names the real match');
assert.ok(/use your long legs to reach passes/.test(film.chapters[3].narration)&&/win the ball back/.test(film.chapters[3].narration),'ends with the entry lesson');
assert.ok(/31 Jan 2026/.test(src)&&/40'51"/.test(src)&&/44'55"/.test(src)&&/47'19"/.test(src)&&/Arena Riga/.test(src),'header states the match date, minutes and venue');
const heads=film.chapters[0].cues.map(c=>c.headline).filter(Boolean);assert.ok(heads.includes('Player of the Match')&&heads.includes('4–2')===false&&heads.includes('1–1'),'headlines: 1–1 and Player of the Match');
for(const ch of film.chapters)for(const c of ch.cues)assert.ok(/^[A-Za-zÀ-ÿ0-9]+(\s|$)/.test(c.words)&&!/^[^\s]*[’'-]/.test(c.words),`cue "${c.words}" starts with a plain word (Kokoro)`);
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Souheil Mouhoudine'].kind,'signature');
console.log(`Souheil Mouhoudine signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
