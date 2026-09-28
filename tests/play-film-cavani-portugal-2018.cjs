// Cavani's 2018 World Cup header v Portugal film: narration/script consistency, measured timing, cue coverage and sourced facts (no browser).
// Run: node tests/play-film-cavani-portugal-2018.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),ID='cavani-portugal-2018',file=path.join(root,`lib/plays/riso/${ID}.ts`),src=fs.readFileSync(file,'utf8');
const cache={};
function load(f){f=path.resolve(f);if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(f,'utf8'));if(cache[f])return cache[f].exports;const m={exports:{}};cache[f]=m;
 const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 new Function('module','exports','require',code)(m,m.exports,n=>{if(n.startsWith('@/'))n=path.join(root,n.slice(2));else if(n.startsWith('.'))n=path.resolve(path.dirname(f),n);else return require(n);const r=[n,`${n}.ts`,`${n}.json`].find(fs.existsSync);assert.ok(r,`missing module ${n}`);return load(r);});return m.exports;}
const film=load(file).default;
const script=JSON.parse(fs.readFileSync(path.join(root,`public/plays/narration/${ID}/script.json`),'utf8'));
const timing=JSON.parse(fs.readFileSync(path.join(root,`public/plays/narration/${ID}/timing.json`),'utf8'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.deepEqual(film.audio,{mode:'chapters'});assert.equal(typeof film.draw,'function');assert.equal(typeof film.touch,'function');
assert.equal(film.chapters.length,3,'three chapters: live, replay, lesson');
assert.deepEqual(film.chapters.map(c=>({label:c.label,text:c.narration})),script.chapters,'script.json mirrors the film narration');
assert.equal(timing.voice,'kokoro_af_bella');assert.equal(timing.speed,1);
assert.deepEqual(timing.chapters.map(c=>c.text),film.chapters.map(c=>c.narration),'timing.json was voiced from this script');
assert.ok(/timingJson as NarrationTiming/.test(src)&&/from '\.\.\/\.\.\/\.\.\/public\/plays\/narration\/cavani-portugal-2018\/timing\.json'/.test(src),'measured timing imported');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(words>=60&&words<=90,`60–90 words (${words})`);assert.ok(text.length<700,`under 700 characters (${text.length})`);
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=20&&total<=45,`about 20–45 s (${total.toFixed(1)})`);
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9 ]/g,'');
const tnorm=w=>norm(w).replace(/ /g,'');
film.chapters.forEach((c,i)=>{let prev=-1;assert.ok(c.audio&&fs.existsSync(path.join(root,'public',c.audio)),`ch${i+1} audio exists`);assert.equal(c.seconds,timing.chapters[i].seconds,`ch${i+1} measured length`);
 const toks=timing.chapters[i].words.map(w=>tnorm(w.w));
 for(const q of c.cues){assert.ok(q.at>prev&&q.at<c.seconds,`ch${i+1} cue "${q.words}" ordered and inside the chapter`);prev=q.at;assert.ok(norm(c.narration).includes(norm(q.words)),`ch${i+1} cue "${q.words}" is spoken`);
  const first=tnorm(q.words.split(/\s+/)[0]);assert.ok(toks.includes(first),`ch${i+1} cue "${q.words}" first word is a recorded token`);
  assert.ok(timing.chapters[i].words.some(w=>Math.abs(w.at-q.at)<1e-6),`ch${i+1} cue "${q.words}" sits on a measured word onset`);}});
for(const m of src.matchAll(/T\((\d),'([^']+)'\)/g))assert.ok(film.chapters[+m[1]].cues.some(q=>q.words===m[2]),`scene cue "${m[2]}" exists in chapter ${+m[1]+1}`);
// sourced facts: the switch from right to left to Suárez, the run, the cross, the back-post header; kits; no foot claimed
assert.ok(/Sochi, 2018/.test(text)&&/Uruguay against Portugal/.test(text)&&/One nil to Uruguay/.test(text),'venue, match, score');
assert.ok(/long pass out to Luis Suárez on the left/.test(text)&&/far post/.test(text)&&/head it home/.test(text),'the sourced sequence');
assert.ok(!/left foot|right foot/i.test(text),'no unverified foot claimed');
assert.ok(/shirt:\[B,\.55\],shorts:K,socks:K/.test(src)&&/shirt:R,shorts:R/.test(src),'Uruguay sky blue, Portugal red');
assert.ok(/number:21/.test(src)&&/number:9/.test(src),'Cavani 21, Suárez 9');assert.ok(/A\.header\(/.test(src),'a header');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');assert.ok(/INFERRED \/ ILLUSTRATIVE/.test(src)&&/7th minute/.test(src),'header separates confirmed from inferred');
const reg=fs.readFileSync(path.join(root,'lib/plays/riso/registry.ts'),'utf8');
assert.ok(reg.includes(`'Edinson Cavani':()=>import('./${ID}')`),'registered');assert.ok(!/PENDING=new Set<string>\(\[[^\]]*'Edinson Cavani'/.test(reg),'not pending');
console.log(`Cavani film: ${words} words, ${text.length} chars, ${total.toFixed(2)} s, cues on measured onsets, facts and registry consistent.`);
