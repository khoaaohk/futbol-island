// Iconic-play film (signature move): Jan Oblak, the unbeatable one-on-one, shown in a real match he played — Bayern Munich 2–1 Atlético
// Madrid (Atlético through on away goals), Champions League semi-final second leg, Allianz Arena, 3 May 2016 (lib/plays/riso/oblak-signature.ts).
// The one-on-one itself is an honest illustration ("Here's how he did it"). Structural checks, no browser: story shape (4 chapters: live
// broadcast, slow replay over the striker's shoulder, low front-left replay, lesson); narration = script.json; 70–90 words ending with the
// lesson; honesty wording; cues spoken, in order, inside their chapter, never starting with a contraction or hyphenated word; every scene cue
// lookup exists; figures only through the one drawPlayer() adapter on the shared athlete library; the block read from Oblak's solved left
// glove mid-dive, and he goes down only as the shot is struck; No. 13 and 1.88 m; Bayern all red; the unnamed striker; seeded randomness;
// full-sheet framing; sources + confirmed/inferred header; the VOICE constant. Renders every chapter through a stub canvas at the three
// card sizes.
// usage: node tests/play-film-oblak-signature.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{module:m,exports:m.exports,Math,WeakMap,Map,Set,DOMMatrix:globalThis.DOMMatrix??StubMatrix,DOMPoint:globalThis.DOMPoint,Path2D:StubPath,document:{createElement:()=>stubCanvas()},require:id=>{const base=path.resolve(path.dirname(file),id);return load([base+'.ts',base,base+'.json'].find(fs.existsSync));}});
 return m.exports;}
function StubPath(){}Object.assign(StubPath.prototype,{moveTo(){},lineTo(){},arc(){},rect(){},closePath(){},addPath(){},bezierCurveTo(){},quadraticCurveTo(){},ellipse(){}});
class StubMatrix{constructor(a){const[m0,m1,m2,m3,m4,m5]=a??[1,0,0,1,0,0];Object.assign(this,{a:m0,b:m1,c:m2,d:m3,e:m4,f:m5});}
 multiply(o){return new StubMatrix([this.a*o.a+this.c*o.b,this.b*o.a+this.d*o.b,this.a*o.c+this.c*o.d,this.b*o.c+this.d*o.d,this.a*o.e+this.c*o.f+this.e,this.b*o.e+this.d*o.f+this.f]);}
 translate(x,y){return this.multiply(new StubMatrix([1,0,0,1,x,y]));}scale(s){return this.multiply(new StubMatrix([s,0,0,s,0,0]));}rotate(d){const r=d*Math.PI/180;return this.multiply(new StubMatrix([Math.cos(r),Math.sin(r),-Math.sin(r),Math.cos(r),0,0]));}
 inverse(){const det=this.a*this.d-this.b*this.c;return new StubMatrix([this.d/det,-this.b/det,-this.c/det,this.a/det,(this.c*this.f-this.d*this.e)/det,(this.b*this.e-this.a*this.f)/det]);}
 transformPoint(p){return{x:this.a*p.x+this.c*p.y+this.e,y:this.b*p.x+this.d*p.y+this.f};}}
globalThis.DOMPoint??=class{constructor(x,y){this.x=x;this.y=y;}};
function stubCtx(){let m=new StubMatrix();const stack=[];const pat={setTransform(){}};return{canvas:{width:1,height:1},save(){stack.push(m);},restore(){m=stack.pop()??m;},setTransform(a,b,c,d,e,f){m=a instanceof StubMatrix?a:new StubMatrix(typeof a==='object'?[a.a,a.b,a.c,a.d,a.e,a.f]:[a,b,c,d,e,f]);},getTransform(){return m;},
 translate(x,y){m=m.translate(x,y);},scale(x){m=m.scale(x);},rotate(r){m=m.rotate(r*180/Math.PI);},clip(){},fill(){},stroke(){},fillRect(){},clearRect(){},drawImage(){},beginPath(){},moveTo(){},lineTo(){},arc(){},rect(){},closePath(){},putImageData(){},
 createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createPattern:()=>pat};}
function stubCanvas(){return{width:1,height:1,getContext:()=>stubCtx()};}
globalThis.document??={createElement:()=>stubCanvas()};

const ID='oblak-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const film=load(file).default;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');assert.equal(typeof film.draw,'function');assert.equal(typeof film.touch,'function');
assert.equal(film.chapters.length,4,'live broadcast, replay over the striker\'s shoulder, low front-left replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>({label:c.label,text:c.narration}))),JSON.stringify(script.chapters),'script.json mirrors the film narration');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Stay on your feet as long as you can, so the attacker has to move first\.$/.test(text),'ends with the lesson');
assert.ok(/Here's how he did it/.test(film.chapters[0].narration),'honest: the one-on-one is how he did it, not a claimed moment');
assert.ok(/2016/.test(text)&&/Munich/.test(text)&&/Bayern/.test(text)&&/Jan Oblak/.test(text)&&/man of the match/.test(text),'the real match, the keeper and his award are named');
assert.ok(!/Müller|Muller|Lewandowski|Costa|Coman|Vidal|Alonso|minute|nil|one-nil|penalty/i.test(text),'no invented minute, scoreline or named attacker for the illustrated chance');
assert.ok(!/(left|right) (foot|glove|hand|side|post)/.test(text)&&!/(yellow|green|black|navy|red|blue) (kit|shirt)/i.test(text),'unconfirmed feet, sides and kit colours are not narrated');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(!/['’-]/.test(c.words.split(/\s+/)[0]),`ch${i+1} cue "${c.words}" starts with a plain word (Kokoro splits contractions)`);
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=25&&total<=52,`length ${total}s`);
let n=0;for(const m of src.matchAll(/T\((\d),(['"])([^'"]+)\2\)/g)){n++;assert.ok(film.chapters[+m[1]].cues.some(q=>q.words===m[3]),`scene cue "${m[3]}" exists in chapter ${+m[1]+1}`);}
assert.ok(n>=27,`scenes key their action to the cues (${n})`);
for(const [i,ch] of film.chapters.entries())for(const q of ch.cues)assert.ok(src.includes(`T(${i},'${q.words}')`)||src.includes(`T(${i},"${q.words}")`),`cue "${q.words}" (ch${i+1}) drives a scene action`);
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(/const HIT:V3/.test(src)&&/sk\.lHa/.test(src)&&/solve\(dive\(UC\)/.test(src),'the block is read from Oblak\'s solved left glove mid-dive');
assert.ok(/const D0=TF-UC\*DUR/.test(src)&&/SS=-STRIKE_CONTACT\*SDUR/.test(src),'Oblak goes down only as the shot is struck; the striker moves first');
assert.ok(/number:13,/.test(src)&&/height:1\.88/.test(src),'Oblak No. 13, 1.88 m');
assert.ok(/shirt:\[RD,\.\d+\],shorts:\[RD,\.\d+\],socks:\[RD/.test(src),'Bayern all red');
assert.ok(/STRIKER:AthleteStyle=FCB\(\d+,\{build:ST_B\}\)/.test(src)&&/number:null/.test(src),'the striker is unnamed and unnumbered');
assert.ok(/Allianz Arena/.test(src)&&/3 May 2016/.test(src),'Allianz Arena, 3 May 2016');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(!/\bs\.safe\b/.test(src),'full-sheet framing (never sheet.safe)');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src),'sources + confirmed/inferred listed at the top');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/,VOICE\);/.test(src),'VOICE constant passed into withTiming');
// geometry sanity: the block is in front of the goal, between the posts, low; the shot would have gone in
{const m=src.match(/keeperDive\(clamp\(u\),\{side:'l'/);assert.ok(m,'Oblak dives to his left (+z)');}
// installed voice (optional until generated): the film must import it, files exist and chapter seconds cover each clip
const timing=path.join(dir,'timing.json');
if(fs.existsSync(timing)){const Tm=JSON.parse(fs.readFileSync(timing,'utf8'));
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio once timing.json exists — import timing.json in ${ID}.ts (see the VOICE note)`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const d=Tm.chapters?.[i]?.seconds;if(typeof d==='number')assert.ok(ch.seconds>=d-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${d}`);});}
// render every chapter (start, cue beats, passage) through the stub canvas: no draw errors at card sizes, reduced motion and a touch included
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});film.touch(sheet,0,0,u*.8,7);sheet.press(i);frames++;}});}
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${text.length} chars, ${total}s, ${n} scene cue lookups, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
