// Signature film: Vozinha — set your feet, spring either way (lib/plays/riso/vozinha-signature.ts).
// Structural checks, no browser: chapter 1 narrates only confirmed facts of Spain 0–0 Cape Verde (World Cup 2026) and no single save;
// chapters 2–4 are a labelled demonstration (bib striker, no match named) whose saves are solved from the keeper's body; cue timing.
// usage: node tests/play-film-vozinha-signature.cjs
// The TS loader handles .json imports (timing.json once the voice exists). usage: node tests/play-film-costa-slovenia-2024.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{module:m,exports:m.exports,Math,WeakMap,Map,DOMMatrix:globalThis.DOMMatrix??StubMatrix,DOMPoint:globalThis.DOMPoint,Path2D:StubPath,document:{createElement:()=>stubCanvas()},require:id=>{const base=path.resolve(path.dirname(file),id);return load([base+'.ts',base].find(fs.existsSync));}});
 return m.exports;}
// minimal canvas stubs: enough for the engine to run story.draw end to end (no pixels)
function StubPath(){this.ops=0;}Object.assign(StubPath.prototype,{moveTo(){},lineTo(){},arc(){},rect(){},closePath(){},addPath(){},bezierCurveTo(){},quadraticCurveTo(){}});
class StubMatrix{constructor(a){const[m0,m1,m2,m3,m4,m5]=a??[1,0,0,1,0,0];Object.assign(this,{a:m0,b:m1,c:m2,d:m3,e:m4,f:m5});}
 multiply(o){return new StubMatrix([this.a*o.a+this.c*o.b,this.b*o.a+this.d*o.b,this.a*o.c+this.c*o.d,this.b*o.c+this.d*o.d,this.a*o.e+this.c*o.f+this.e,this.b*o.e+this.d*o.f+this.f]);}
 translate(x,y){return this.multiply(new StubMatrix([1,0,0,1,x,y]));}scale(s){return this.multiply(new StubMatrix([s,0,0,s,0,0]));}rotate(d){const r=d*Math.PI/180;return this.multiply(new StubMatrix([Math.cos(r),Math.sin(r),-Math.sin(r),Math.cos(r),0,0]));}
 inverse(){const det=this.a*this.d-this.b*this.c;return new StubMatrix([this.d/det,-this.b/det,-this.c/det,this.a/det,(this.c*this.f-this.d*this.e)/det,(this.b*this.e-this.a*this.f)/det]);}
 transformPoint(p){return{x:this.a*p.x+this.c*p.y+this.e,y:this.b*p.x+this.d*p.y+this.f};}}
globalThis.DOMPoint??=class{constructor(x,y){this.x=x;this.y=y;}};
function stubCtx(){let m=new StubMatrix();const stack=[];const pat={setTransform(){}};return{canvas:{width:1,height:1},save(){stack.push(m);},restore(){m=stack.pop()??m;},setTransform(a,b,c,d,e,f){m=a instanceof StubMatrix?a:new StubMatrix(typeof a==='object'?[a.a,a.b,a.c,a.d,a.e,a.f]:[a,b,c,d,e,f]);},getTransform(){return m;},
 translate(x,y){m=m.translate(x,y);},scale(x){m=m.scale(x);},rotate(r){m=m.rotate(r*180/Math.PI);},clip(){},fill(){},stroke(){},fillRect(){},clearRect(){},drawImage(){},beginPath(){},moveTo(){},lineTo(){},arc(){},rect(){},closePath(){},putImageData(){},
 createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createPattern:()=>pat};}
function stubCanvas(){const c={width:1,height:1,getContext:()=>stubCtx()};return c;}
globalThis.document??={createElement:()=>stubCanvas()};

const ID='vozinha-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const film=load(file).default;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live (confirmed moments), demonstration, replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(words>=70&&words<=100,`narration ${words} words (70–100)`);
// honesty: chapter 1 states only confirmed facts; the technique is labelled as a demonstration
const c1=film.chapters[0].narration;
assert.ok(/2026 World Cup/.test(c1)&&/Atlanta/.test(c1)&&/Spain against Cape Verde/.test(c1)&&/forty-year-old/.test(c1)&&/seven saves/.test(c1)&&/nil-nil/.test(c1)&&/teammates run to hug him/.test(c1),'chapter 1: the confirmed facts (venue, teams, age 40, seven saves, 0–0, the teammates)');
assert.ok(!/\b(left|right|dive|dives|tip|punch|header|penalty)\b/i.test(c1),'chapter 1 describes no single save (none is sourced)');
assert.ok(/^Watch how he does it\./.test(film.chapters[1].narration),'the demonstration is announced as "how he does it"');
assert.ok(!/Spain|Cape Verde|Atlanta/.test(film.chapters.slice(1).map(c=>c.narration).join(' ')),'chapters 2–4 never name the match');
assert.equal(film.chapters[1].label,'How he does it');
assert.ok(/demonstration/i.test(film.theme)&&/not a match recreation/.test(film.theme),'the film theme labels it a demonstration');
assert.ok(/number:null/.test(src)&&/const BIB:AthleteStyle=/.test(src),'the demonstration striker wears a plain bib, no number');
assert.ok(/stay on your toes/.test(film.chapters[3].narration)&&/set your feet before the shot/.test(film.chapters[3].narration)&&/spring either way\.$/.test(film.chapters[3].narration),'ends with the card lesson');
// kits in chapter 1 (confirmed)
assert.ok(/const capeVerde=.*shirt:'paper',shorts:'paper',socks:'paper'/.test(src),'Cape Verde all white');
assert.ok(/const spain=.*shirt:\[R,\.95\],shorts:K,socks:\[R,\.95\]/.test(src),'Spain red shirts, navy shorts, red socks');
assert.ok(/number:1,numberInk:K,build:VOZ_B/.test(src),'Vozinha wears 1');
// the demonstration saves, solved from the body
const F=load(file).FACTS,d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);F.setMode('demo');
{const b=F.ballAt(F.TA),sk=F.keeperAt(F.TA);assert.ok(d3(b,F.HA)<.02,'shot A reaches the glove at the save');assert.ok(Math.min(d3(sk.lHa,F.HA),d3(sk.rHa,F.HA))<.05,'his glove is on it');
 assert.ok(F.HA[2]>1.6&&F.HA[1]<.7,"shot A: low to his left (+z; he faces −x)");}
{const b=F.ballAt(F.S2+F.TB),sk=F.keeperAt(F.S2+F.TB);assert.ok(d3(b,F.HB)<.02,'shot B reaches the glove');assert.ok(Math.min(d3(sk.lHa,F.HB),d3(sk.rHa,F.HB))<.05,'his glove is on it');
 assert.ok(F.HB[2]<-1.6&&F.HB[1]>1.5,'shot B: high to his right (−z)');}
for(const [B0,H] of [[F.BA,F.HA],[F.BB,F.HB]]){const u=-B0[0]/(H[0]-B0[0]),z=B0[2]+(H[2]-B0[2])*u,y=B0[1]+(H[1]-B0[1])*u;assert.ok(Math.abs(z)<3.66&&y<2.44,`each shot was on target (z ${z.toFixed(2)}, y ${y.toFixed(2)})`);}
// set before the shot: no movement between τ −0.35 and the strike (for both shots)
for(const t0 of [0,F.S2]){const a=F.keeperAt(t0-.35),b=F.keeperAt(t0-.02);assert.ok(d3(a.pelvis,b.pelvis)<.03,`set: still before shot at ${t0}`);const p0=F.posOf(0,t0-.35),p1=F.posOf(0,t0);assert.ok(Math.hypot(p0[0]-p1[0],p0[1]-p1[1])<.03,'no step in the set');
 let lo=9,hi=-9;for(let a=t0-3;a<t0-.5;a+=.05){const z=F.posOf(0,a)[1];lo=Math.min(lo,z);hi=Math.max(hi,z);}assert.ok(hi-lo>.3&&hi-lo<.8,`small quick steps before that (${(hi-lo).toFixed(2)} m side to side)`);}
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=50,`length ${total}s`);
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src),'sources + confirmed/inferred listed at the top');
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=timingJson as NarrationTiming/.test(src)&&/withTiming\(/.test(src),'recorded voice timing is wired in');
const timing=path.join(dir,'timing.json');assert.ok(fs.existsSync(timing),'timing.json exists');
{const T=JSON.parse(fs.readFileSync(timing,'utf8'));
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio&&fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const d=T.chapters?.[i]?.seconds;assert.ok(ch.seconds>=d-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${d}`);
  // every cue landed on a recorded word (not the estimate)
  for(const c of ch.cues)assert.ok(T.chapters[i].words.some(w=>Math.abs(w.at-c.at)<1e-6),`ch${i+1} cue "${c.words}" matched a recorded word`);});}
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});}
console.log(`PASS ${ID}: ${film.chapters.length} chapters, ${words} words, ${total}s, ${frames} frames drawn, voice installed`);
