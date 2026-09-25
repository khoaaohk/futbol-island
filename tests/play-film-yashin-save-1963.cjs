// Yashin "Black Spider" iconic-play film: narration/script consistency, timing sanity, cue coverage and the sourced facts of the punch.
// Run: node tests/play-film-yashin-save-1963.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const cache={};
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache[file])return cache[file].exports;const m={exports:{}};cache[file]=m;
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 new Function('module','exports','require',code)(m,m.exports,n=>{if(!n.startsWith('.'))return require(n);const b=path.resolve(path.dirname(file),n);return load([b,b+'.ts',b+'.json'].find(fs.existsSync));});return m.exports;}
const mod=load('lib/plays/riso/yashin-save-1963.ts'),film=mod.default,F=mod.FACTS;
const script=JSON.parse(fs.readFileSync('public/plays/narration/yashin-save-1963/script.json','utf8'));
assert.equal(film.id,'yashin-save-1963');assert.equal(film.audio.mode,'chapters');assert.equal(typeof film.draw,'function');
assert.equal(film.chapters.length,4,'four chapters');
assert.deepEqual(film.chapters.map(c=>({label:c.label,text:c.narration})),script.chapters,'script.json mirrors the film narration');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(words>=70&&words<=90,`70–90 words (${words})`);assert.ok(text.length<700,`under 700 characters (${text.length})`);
assert.match(film.chapters[3].narration,/shout loud, come for the ball with confidence\. Your area is your home!$/,'ends with the lesson');
const total=film.chapters.reduce((a,c)=>a+c.seconds,0);assert.ok(total>=20&&total<=52,`film length (estimated onsets run slow until the voice exists) (${total.toFixed(1)} s)`);
const norm=s=>s.toLowerCase().replace(/[^a-z0-9 ]/g,'');
film.chapters.forEach((c,i)=>{let prev=-1;for(const q of c.cues){assert.ok(q.at>prev&&q.at<c.seconds,`ch${i+1} cue "${q.words}" ordered and inside the chapter`);prev=q.at;assert.ok(norm(c.narration).includes(norm(q.words)),`ch${i+1} cue "${q.words}" is spoken`);}
 if(c.audio)assert.ok(fs.existsSync(path.join('public',c.audio.split('?')[0])),`ch${i+1} audio file exists`);});
assert.deepEqual(film.chapters.map(c=>c.cues.length),[6,4,3,4],'cue counts the scenes key their actions to');
assert.match(film.ageNote,/23 October 1963/,'the real date is in the film');
// the punch as Giller describes it: a power drive from Greaves outside the six-yard box, Yashin OFF his line, one fist, the ball punched
// back up the pitch toward the halfway line; then the two meet (the hug)
const s=F.shotFrom(),f=F.fist();
const dist=Math.hypot(f[0]-s[0],f[2]-s[2]);assert.ok(dist>10&&dist<20,`a drive from distance (${dist.toFixed(1)} m)`);
assert.ok(F.GOAL.x-s[0]>12,`struck from outside the six-yard box (${(F.GOAL.x-s[0]).toFixed(1)} m out)`);
const speed=dist/(F.CONTACT_T-F.SHOT_T);assert.ok(speed>18&&speed<35,`a power drive (${speed.toFixed(1)} m/s)`);
assert.ok(F.GOAL.x-f[0]>2.5,`Yashin meets it well off his line (${(F.GOAL.x-f[0]).toFixed(2)} m)`);
assert.ok(f[1]>1.2&&f[1]<2.5,`punched at chest/head height (${f[1].toFixed(2)} m)`);
assert.ok(f[2]>F.GOAL.z0&&f[2]<F.GOAL.z1,'in front of the goal mouth');
const ya=F.yashinAt(0);assert.ok(F.GOAL.x-ya[0]<1.5,'on his line before Greaves attacks');
const b0=F.ballAt(F.CONTACT_T-.01),b1=F.ballAt(F.CONTACT_T+.3);assert.ok(b1[0]<b0[0]-3,'the punch sends it back up the pitch');
assert.ok(Math.abs(F.LAND1[0]-52.5)<15,`lands toward the halfway line (x ${F.LAND1[0]})`);
let apex=0;for(let T=F.CONTACT_T;T<4.9;T+=.02)apex=Math.max(apex,F.ballAt(T)[1]);assert.ok(apex>5,`high back over the players (${apex.toFixed(1)} m)`);
const g=F.greavesAt(6.5),y=F.yashinAt(6.5);assert.ok(Math.hypot(g[0]-y[0],g[1]-y[1])<1.1,'Greaves and Yashin together for the hug');
console.log(`Yashin film: ${words} words, ${text.length} chars, ${total.toFixed(2)} s; cues, script and punch geometry consistent (drive ${dist.toFixed(1)} m at ${speed.toFixed(0)} m/s, fist ${(F.GOAL.x-f[0]).toFixed(1)} m out at ${f[1].toFixed(2)} m).`);
