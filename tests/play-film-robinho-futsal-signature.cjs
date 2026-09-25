// Robinho's signature (futsal) film: contract checks (no browser). Run: node tests/play-film-robinho-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/robinho-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'robinho-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,4,'four chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/robinho-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the real moment is stated (match + year), only confirmed facts are claimed, and the step-over is honestly framed as a demonstration
const n0=film.chapters[0].narration,n1=film.chapters[1].narration,n2=film.chapters[2].narration,n3=film.chapters[3].narration;
assert.ok(/2014/.test(n0)&&/semi-final/.test(n0)&&/Russia/.test(n0)&&/Spain/.test(n0),'the real match is named');
assert.ok(/three all/.test(n0)&&/extra time/.test(n0)&&/four three/.test(n0),'the documented 3–3, extra time and 4–3');
assert.ok(/Eder Lima sends Robinho free/.test(n0),'the goal as UEFA described it');
assert.ok(!/step/i.test(n0+n1),'no step-over is claimed inside the real match');
assert.ok(/move on his card/.test(n2)&&/step-over/.test(n2),'the signature is framed honestly as a demonstration');
assert.ok(/step over the ball/.test(n3)&&/defender lean the wrong way/.test(n3),'ends with the entry lesson');
assert.ok(/6 Feb 2014/.test(src)&&/48:54/.test(src)&&/Sportpaleis/.test(src),'header states the match date, minute and venue');
assert.ok(/NOT the Brazil football forward|not the Brazil football forward/.test(src),'the futsal Robinho, not the footballer');
for(const ch of film.chapters)for(const c of ch.cues)assert.ok(/^[A-Za-zÀ-ÿ0-9]+(\s|$)/.test(c.words)&&!/^[^\s]*[’'-]/.test(c.words),`cue "${c.words}" starts with a plain word (Kokoro)`);
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Robinho'].kind,'signature');assert.equal(iconic['Robinho'].params.side,'right');
console.log(`Robinho signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
