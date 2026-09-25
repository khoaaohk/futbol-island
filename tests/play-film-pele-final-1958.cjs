// Pelé 1958 final iconic-play film: narration/script consistency, timing sanity, cue coverage, figure adapter and sources. Run: node tests/play-film-pele-final-1958.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const cache={};
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache[file])return cache[file].exports;const m={exports:{}};cache[file]=m;
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 new Function('module','exports','require',code)(m,m.exports,n=>{if(!n.startsWith('.'))return require(n);const b=path.resolve(path.dirname(file),n);return load([b,b+'.ts',b+'.json'].find(fs.existsSync));});return m.exports;}
const FILE='lib/plays/riso/pele-final-1958.ts';
const film=load(FILE).default;
const script=JSON.parse(fs.readFileSync('public/plays/narration/pele-final-1958/script.json','utf8'));
assert.equal(film.id,'pele-final-1958');assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');assert.equal(typeof film.draw,'function');assert.equal(typeof film.touch,'function');
assert.equal(film.chapters.length,4,'four chapters: live, chest replay, flick/volley replay, lesson');
assert.deepEqual(film.chapters.map(c=>({label:c.label,text:c.narration})),script.chapters,'script.json mirrors the film narration');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(words>=70&&words<=90,`70–90 words (${words})`);
assert.ok(/soft first touch buys you time and space\.$/i.test(text),'the narration ends with the lesson');
assert.ok(/blue/i.test(film.chapters[0].narration),'chapter 1 names Brazil\'s blue shirts');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=25&&total<=50,`about 25–50 s (${total.toFixed(1)})`);
const norm=s=>s.toLowerCase().replace(/[^a-z0-9é ]/g,'');
film.chapters.forEach((c,i)=>{let prev=-1;assert.ok(c.cues.length>=4,`ch${i+1} has ≥4 cue actions`);
 for(const q of c.cues){assert.ok(q.at>prev&&q.at<c.seconds,`ch${i+1} cue "${q.words}" ordered and inside the chapter`);prev=q.at;assert.ok(norm(c.narration).includes(norm(q.words)),`ch${i+1} cue "${q.words}" is spoken`);}
 if(c.audio)assert.ok(fs.existsSync(path.join('public',c.audio.split('?')[0])),`ch${i+1} audio file exists`);});
// every cue the scenes key their actions to must exist (a retime that renames a cue fails here, not silently on screen)
const src=fs.readFileSync(FILE,'utf8');let n=0;
for(const m of src.matchAll(/T\((\d),'([^']+)'\)/g)){n++;assert.ok(film.chapters[+m[1]].cues.some(q=>q.words===m[2]),`scene cue "${m[2]}" exists in chapter ${+m[1]+1}`);}
assert.ok(n>=20,`scenes key their action to the cues (${n})`);
// figures: all drawing goes through the one adapter onto the shared athlete library; sources are listed; no top-down camera
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called only inside drawPlayer()');
assert.ok(/function drawPlayer\(/.test(src)&&/from '\.\/athlete'/.test(src),'drawPlayer adapter over lib/plays/riso/athlete.ts');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src),'header lists sources and separates confirmed from inferred');
console.log(`Pelé 1958 film: ${words} words, ${text.length} chars, ${total.toFixed(2)} s, ${n} scene cue lookups, script and cues consistent.`);
