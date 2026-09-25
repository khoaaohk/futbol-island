// Zidane volley iconic-play film: narration/script consistency, timing sanity and cue coverage. Run: node tests/play-film-zidane-volley-2002.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const cache={};
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache[file])return cache[file].exports;const m={exports:{}};cache[file]=m;
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 new Function('module','exports','require',code)(m,m.exports,n=>{if(!n.startsWith('.'))return require(n);const b=path.resolve(path.dirname(file),n);return load([b,b+'.ts'].find(fs.existsSync));});return m.exports;}
const film=load('lib/plays/riso/zidane-volley-2002.ts').default;
const script=JSON.parse(fs.readFileSync('public/plays/narration/zidane-volley-2002/script.json','utf8'));
assert.equal(film.id,'zidane-volley-2002');assert.equal(film.audio.mode,'chapters');assert.equal(typeof film.draw,'function');
assert.equal(film.chapters.length,4,'four chapters');
assert.deepEqual(film.chapters.map(c=>({label:c.label,text:c.narration})),script.chapters,'script.json mirrors the film narration');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(words>=60&&words<=90,`60–90 words (${words})`);assert.ok(text.length<700,`under 700 characters (${text.length})`);
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=20&&total<=40,`about 20–35 s (${total.toFixed(1)})`);
const norm=s=>s.toLowerCase().replace(/[^a-z0-9 ]/g,'');
film.chapters.forEach((c,i)=>{let prev=-1;for(const q of c.cues){assert.ok(q.at>prev&&q.at<c.seconds,`ch${i+1} cue "${q.words}" ordered and inside the chapter`);prev=q.at;assert.ok(norm(c.narration).includes(norm(q.words)),`ch${i+1} cue "${q.words}" is spoken`);}
 if(c.audio)assert.ok(fs.existsSync(path.join('public',c.audio.split('?')[0])),`ch${i+1} audio file exists`);});
// every cue the scenes key their actions to must exist (a retime that renames a cue fails here, not silently on screen)
const src=fs.readFileSync('lib/plays/riso/zidane-volley-2002.ts','utf8');
for(const m of src.matchAll(/T\((\d),'([^']+)'\)/g))assert.ok(film.chapters[+m[1]].cues.some(q=>q.words===m[2]),`scene cue "${m[2]}" exists in chapter ${+m[1]+1}`);
console.log(`Zidane volley film: ${words} words, ${text.length} chars, ${total.toFixed(2)} s, cues and script consistent.`);
