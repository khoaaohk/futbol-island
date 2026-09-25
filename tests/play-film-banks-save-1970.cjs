// Banks save iconic-play film: narration/script consistency, timing sanity, cue coverage and the sourced facts of the save.
// Run: node tests/play-film-banks-save-1970.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const cache={};
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache[file])return cache[file].exports;const m={exports:{}};cache[file]=m;
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 new Function('module','exports','require',code)(m,m.exports,n=>{if(!n.startsWith('.'))return require(n);const b=path.resolve(path.dirname(file),n);return load([b,b+'.ts',b+'.json'].find(fs.existsSync));});return m.exports;}
const mod=load('lib/plays/riso/banks-save-1970.ts'),film=mod.default,F=mod.FACTS;
const script=JSON.parse(fs.readFileSync('public/plays/narration/banks-save-1970/script.json','utf8'));
assert.equal(film.id,'banks-save-1970');assert.equal(film.audio.mode,'chapters');assert.equal(typeof film.draw,'function');
assert.equal(film.chapters.length,4,'four chapters');
assert.deepEqual(film.chapters.map(c=>({label:c.label,text:c.narration})),script.chapters,'script.json mirrors the film narration');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(words>=60&&words<=90,`60–90 words (${words})`);assert.ok(text.length<700,`under 700 characters (${text.length})`);
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=20&&total<=45,`film length (${total.toFixed(1)} s)`);
const norm=s=>s.toLowerCase().replace(/[^a-z0-9 ]/g,'');
film.chapters.forEach((c,i)=>{let prev=-1;for(const q of c.cues){assert.ok(q.at>prev&&q.at<c.seconds,`ch${i+1} cue "${q.words}" ordered and inside the chapter`);prev=q.at;assert.ok(norm(c.narration).includes(norm(q.words)),`ch${i+1} cue "${q.words}" is spoken`);}
 if(c.audio)assert.ok(fs.existsSync(path.join('public',c.audio.split('?')[0])),`ch${i+1} audio file exists`);});
// scenes read cues by index (Q(i)[k]): these counts must hold
assert.deepEqual(film.chapters.map(c=>c.cues.length),[4,4,5,3],'cue counts the scenes key their actions to');
// the save as the accounts describe it: Banks's right hand on the far-post side (he dived to his right from the near post), inside the
// goal mouth and below the bar; the header bounces about two yards in front of the line; the flick carries the ball over the bar
assert.ok(F.HAND[2]>34&&F.HAND[2]<F.farPost,`right hand toward the far post, inside it (z ${F.HAND[2].toFixed(2)})`);
assert.ok(F.HAND[1]>0&&F.HAND[1]<1.2,`low ball at the hand (${F.HAND[1].toFixed(2)} m)`);
const out=F.GOAL.x-F.BOUNCE[0];assert.ok(out>1.2&&out<2.6,`bounce about two yards out (${out.toFixed(2)} m)`);
assert.ok(F.HEAD_PT[1]>2.1&&F.HEAD_PT[1]<3.2,`Pelé meets the cross high (${F.HEAD_PT[1].toFixed(2)} m)`);
let over=false;for(let T=7.08;T<8;T+=.01){const b=F.ballAt(T);if(Math.abs(b[0]-F.GOAL.x)<.12)over=b[1]>F.GOAL.h+.15;}
assert.ok(over,'the flick carries the ball over the crossbar');
assert.ok(F.ballAt(6.8)[1]<F.HEAD_PT[1],'the header goes down');
console.log(`Banks save film: ${words} words, ${text.length} chars, ${total.toFixed(2)} s, cues, script and save geometry consistent.`);
