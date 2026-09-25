// Daniel Ibañes's signature (futsal) film: contract checks (no browser). Run: node tests/play-film-ibanes-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/ibanes-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'ibanes-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,3,'three chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=28&&total<=50,`about 28–50 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/ibanes-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the real match is named, only confirmed facts are claimed, and the move is honestly framed as a demonstration
const n0=film.chapters[0].narration;
assert.ok(/Guatemala City, 2000/.test(n0)&&/Futsal World Cup semi final/.test(n0)&&/Spain against Russia/.test(n0),'the real match is named');
assert.ok(/Daniel scores\. Two one!/.test(n0)&&/Russia equalise/.test(n0)&&/fifty five seconds left, Daniel scores again! Three two/.test(n0)&&/world champions/.test(n0),'the documented 23:03 and 39:05 goals, 2–2 and the title');
assert.ok(!/sole|drag|turn|dribbl|trick/i.test(n0),'no move is claimed inside the real match');
assert.ok(/Watch how he does it/.test(film.chapters[1].narration),'the signature is framed honestly as a demonstration');
assert.ok(/step on the ball, pull it back with your sole, and turn away/.test(film.chapters[2].narration),'ends with the entry lesson');
assert.ok(/1 December 2000/.test(src)&&/Domo Polideportivo/.test(src)&&/DENISOV/.test(src)&&/39:05/.test(src)&&/6 Jul 1976/.test(src),'header states the match, venue, times and which Daniel');
for(const ch of film.chapters)for(const c of ch.cues)assert.ok(/^[A-Za-zÀ-ÿ0-9]+(\s|$)/.test(c.words)&&!/^[^\s]*[’'-]/.test(c.words),`cue "${c.words}" starts with a plain word (Kokoro)`);
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Daniel Ibañes'].kind,'signature');
assert.match(iconic['Daniel Ibañes'].lesson,/sole/,'the entry lesson is the sole drag-back');
const appear=JSON.parse(fs.readFileSync(path.join(root,'lib/town/playerAppearance.json'),'utf8'));assert.equal(appear['Daniel Ibañes'].country,'Spain','the card is Spanish, like the film');
// the move: the stab lands where the ball was, after the ball has gone; the ball is under the left sole at τ = 0
console.log(`Daniel Ibañes (futsal) signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
