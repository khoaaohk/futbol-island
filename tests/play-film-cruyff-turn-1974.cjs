// Cruyff turn 1974 iconic-play film: narration/script consistency, timing sanity, cue coverage, the drag geometry, figure adapter and
// sources. Run: node tests/play-film-cruyff-turn-1974.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const cache={};
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache[file])return cache[file].exports;const m={exports:{}};cache[file]=m;
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 new Function('module','exports','require',code)(m,m.exports,n=>{if(!n.startsWith('.'))return require(n);const b=path.resolve(path.dirname(file),n);return load([b,b+'.ts',b+'.json'].find(fs.existsSync));});return m.exports;}
const FILE='lib/plays/riso/cruyff-turn-1974.ts';
const film=load(FILE).default;
const script=JSON.parse(fs.readFileSync('public/plays/narration/cruyff-turn-1974/script.json','utf8'));
assert.equal(film.id,'cruyff-turn-1974');assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');assert.equal(typeof film.draw,'function');assert.equal(typeof film.touch,'function');
assert.ok(film.chapters.length>=3&&film.chapters.length<=4,'3–4 chapters: live, slow-motion replay, lesson');
assert.deepEqual(film.chapters.map(c=>({label:c.label,text:c.narration})),script.chapters,'script.json mirrors the film narration');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(words>=70&&words<=90,`70–90 words (${words})`);
assert.ok(/fake the pass, drag the ball behind your standing leg, and turn away fast\.$/i.test(text),'the narration ends with the lesson');
assert.ok(/orange/i.test(film.chapters[0].narration)&&/Olsson/.test(film.chapters[0].narration)&&/1974/.test(film.chapters[0].narration),'chapter 1 names the orange shirts, Olsson and 1974');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=25&&total<=55,`about 25–55 s (${total.toFixed(1)})`);
const norm=s=>s.toLowerCase().replace(/[^a-z0-9 ]/g,'');
film.chapters.forEach((c,i)=>{let prev=-1;assert.ok(c.cues.length>=4,`ch${i+1} has ≥4 cue actions`);
 for(const q of c.cues){assert.ok(q.at>prev&&q.at<c.seconds,`ch${i+1} cue "${q.words}" ordered and inside the chapter`);prev=q.at;assert.ok(norm(c.narration).includes(norm(q.words)),`ch${i+1} cue "${q.words}" is spoken`);}
 if(c.audio)assert.ok(fs.existsSync(path.join('public',c.audio.split('?')[0])),`ch${i+1} audio file exists`);});
// every cue the scenes key their actions to must exist (a retime that renames a cue fails here, not silently on screen)
const src=fs.readFileSync(FILE,'utf8');let n=0;
for(const m of src.matchAll(/T\((\d),'([^']+)'\)/g)){n++;assert.ok(film.chapters[+m[1]].cues.some(q=>q.words===m[2]),`scene cue "${m[2]}" exists in chapter ${+m[1]+1}`);}
assert.ok(n>=25,`scenes key their action to the cues (${n})`);
// the timing hook: VOICE is NarrationTiming|null and goes through withTiming (the lead swaps in the Kokoro timing.json import)
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\([\s\S]*?,VOICE\)/.test(src),'VOICE timing hook passed into withTiming');
if(fs.existsSync('public/plays/narration/cruyff-turn-1974/timing.json'))assert.ok(/cruyff-turn-1974\/timing\.json/.test(src),'timing.json exists: wire it into VOICE');
// figures: all drawing goes through the one adapter onto the shared athlete library; sources listed; confirmed vs inferred; full-sheet framing
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called only inside drawPlayer()');
assert.ok(/function drawPlayer\(/.test(src)&&/from '\.\/athlete'/.test(src)&&/motionSmear\(/.test(src),'drawPlayer adapter over lib/plays/riso/athlete.ts with motion smear');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src),'header lists sources and separates confirmed from inferred');
assert.ok(/ROYAL-BLUE/.test(src),'Sweden\'s royal-blue change shirts are recorded');
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing (no sheet.safe)');
// the move itself: the drag takes the ball from in front of Cruyff to behind his standing (left) heel, and he turns 180° to the left
const {solve,posed,keyPoses,runCycle}=load('lib/plays/riso/athlete.ts');
const keysSrc=src.match(/const TURN_KEYS:[\s\S]*?\n\];/)[0];
const SHIELD=posed({lHipF:18,rHipF:10,lKnee:32,rKnee:28,lHipA:8,rHipA:8,lean:16,pitch:4,lShA:34,rShA:30,lElb:44,rElb:44,neckP:26});
const U_C=Number(src.match(/const U_C=([\d.]+)/)[1]),U_R=Number(src.match(/U_R=([\d.]+)/)[1]);
const KEYS=new Function('posed','runCycle','SHIELD','U_C','U_R',`${keysSrc.replace(/^const TURN_KEYS:\[number,Pose\]\[\]=/,'return ').replace(/;$/,'')}`)(posed,runCycle,SHIELD,U_C,U_R);
const at=u=>{const sk=solve(keyPoses(u,KEYS),{height:1.78,bulk:.88,thighs:.95}),F=sk.fr.rFt,l=Math.hypot(F[2],F[8]);return{sk,ball:[(sk.rAn[0]+sk.rToe[0])/2-F[2]/l*.16,(sk.rAn[2]+sk.rToe[2])/2-F[8]/l*.16]};};
const c=at(U_C),r=at(U_R),heel=c.sk.lHeel;
assert.ok(c.ball[0]>heel[0]+.05,`at contact the ball is in front of the standing heel (${c.ball[0].toFixed(2)} > ${heel[0].toFixed(2)})`);
assert.ok(r.ball[0]<heel[0]-.25,`at release the ball is behind the standing heel (${r.ball[0].toFixed(2)})`);
assert.ok(r.ball[1]<heel[2]-.02,'…and on the standing-leg (left) side');
console.log(`Cruyff 1974 film: ${words} words, ${total.toFixed(2)} s, ${n} scene cue lookups, drag ${c.ball.map(v=>v.toFixed(2))} → ${r.ball.map(v=>v.toFixed(2))} past heel ${heel[0].toFixed(2)},${heel[2].toFixed(2)}; consistent.`);
