// Mathi Fernández's signature (futsal goleiro) film: contract checks (no browser). Run: node tests/play-film-mathi-fernandez-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/mathi-fernandez-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'mathi-fernandez-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,4,'four chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/mathi-fernandez-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// the real, El País-reported save (Pereira's left-foot shot) and the throw for Duque's 3–1; the reaction is a labelled demonstration; ends with the entry lesson
assert.ok(/Copa Libertadores final, 2025/.test(film.chapters[0].narration)&&/Andre Pereira/.test(film.chapters[0].narration)&&/left-foot/.test(film.chapters[0].narration)&&/Mathi Fernández stops it/.test(film.chapters[0].narration),'the reported save from Pereira');
assert.ok(/one to nothing/.test(film.chapters[0].narration)&&!/hands|parr|dive/i.test(film.chapters[0].narration),'the live chapter never claims how he saved it');
assert.ok(/Mathi throws to Franco Duque/.test(film.chapters[1].narration)&&/empty goal/.test(film.chapters[1].narration)&&/Three to one/.test(film.chapters[1].narration),'the confirmed throw and 3–1');
assert.ok(/demo/i.test(film.chapters[2].label)&&/This is how he reacts/.test(film.chapters[2].narration),'the reaction is a labelled demonstration');
assert.ok(/Keep your hands ready in front of you, so you can react in a flash/.test(film.chapters[3].narration),'ends with the entry lesson');
assert.ok(/1 June 2025/.test(src)&&/COP Arena/.test(src)&&/le tapó un zurdazo muy potente/.test(src)&&/saque de manos/.test(src),'header states the match date, venue and source quotes');
for(const ch of film.chapters)for(const c of ch.cues)assert.ok(!/^[^\s]*[’'-]/.test(c.words),`cue "${c.words}" starts with a plain word`);
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Mathi Fernández'].kind,'signature');
console.log(`Mathi Fernández signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
