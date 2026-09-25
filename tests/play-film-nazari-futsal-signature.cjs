// Mostafa Nazari's signature (futsal goleiro) film: contract checks (no browser). Run: node tests/play-film-nazari-futsal-signature.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.join(root,'lib/plays/riso/nazari-futsal-signature.ts'),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const mod={exports:{}};cache[f]=mod;new Function('module','exports','require',code)(mod,mod.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else n=path.resolve(path.dirname(f),n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);if(r.endsWith('.json'))return JSON.parse(fs.readFileSync(r,'utf8'));return load(r);});return mod.exports;}
const film=load(file).default;
assert.equal(film.id,'nazari-futsal-signature');assert.equal(film.format,'futsal','a futsal film');assert.deepEqual(film.audio,{mode:'chapters'});
assert.equal(film.chapters.length,3,'three chapters');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=30&&total<=55,`about 30–55 s (${total})`);
for(const ch of film.chapters){let last=-1;for(const c of ch.cues){assert.ok(c.at>last&&c.at<ch.seconds-.65,`cue "${c.words}" ordered and before the passage`);last=c.at;assert.ok(ch.narration.toLowerCase().replace(/’/g,"'").includes(c.words.toLowerCase().replace(/’/g,"'")),`cue words "${c.words}" are in the narration`);}
 assert.ok(ch.cues.length>=4,'≥ 4 cue actions per chapter');}
const words=film.chapters.map(c=>c.narration).join(' '),n=words.split(/\s+/).length;
assert.ok(n>=70&&n<=90,`70–90 words (${n})`);assert.ok(words.length<700,'under 700 characters');
const script=JSON.parse(fs.readFileSync(path.join(root,'public/plays/narration/nazari-futsal-signature/script.json'),'utf8'));
assert.deepEqual(script.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'script.json matches the film narration');
assert.deepEqual(script.chapters.map(c=>c.label),film.chapters.map(c=>c.label),'script.json labels match');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming)/.test(src),'VOICE left null for the lead');
// fallback mode: the real final shows only confirmed things (result, number, award); the block is a labelled demonstration; ends with the entry lesson
const live=film.chapters[0].narration;
assert.ok(/Asian Futsal Championship final/.test(live)&&/eight to three/.test(live)&&/Uzbekistan/.test(live)&&/number twelve/.test(live),'the confirmed 2010 final, 3–8, his number');
assert.ok(!/sav|block|stop|dive/i.test(live),'the live chapter never claims a save in the named match');
assert.ok(/best futsal goalkeeper in the world/.test(live),'the confirmed 2010 award');
assert.ok(/demo/i.test(film.chapters[1].label)&&/How he blocks/.test(film.chapters[1].narration),'the block is a labelled demonstration');
assert.ok(/Be brave, and get your body behind the ball/.test(film.chapters[2].narration),'ends with the entry lesson');
assert.ok(/30 May 2010/.test(src)&&/Uzbekistan 3–8\s*\n?\s*\*?\s*Iran/.test(src)&&/number 12 shirt/.test(src),'header states the match, score and source quote');
for(const ch of film.chapters)for(const c of ch.cues)assert.ok(!/^[^\s]*[’'-]/.test(c.words),`cue "${c.words}" starts with a plain word`);
const iconic=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'));assert.equal(iconic['Mostafa Nazari'].kind,'signature');assert.ok(/brave block/.test(iconic['Mostafa Nazari'].title));
console.log(`Mostafa Nazari signature film: ${film.chapters.length} chapters, ${total.toFixed(1)} s, ${n} words, ${words.length} characters — contract passed.`);
