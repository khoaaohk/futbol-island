// Iconic-play film: Freddie Ljungberg's curler v Chelsea, 2002 FA Cup final (lib/plays/riso/ljungberg-cup-final-2002.ts). Structural checks, no
// browser: story shape, narration = public/plays/narration/<id>/script.json, cue words in order and timed to the Kokoro voice, length, every
// chapter drawn through a stub canvas at card sizes; then the goal as the accounts describe it (see the film header).
// usage: node tests/play-film-ljungberg-cup-final-2002.cjs
const ID='ljungberg-cup-final-2002';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{module:m,exports:m.exports,Math,WeakMap,Map,DOMMatrix:globalThis.DOMMatrix??StubMatrix,DOMPoint:globalThis.DOMPoint,Path2D:StubPath,document:{createElement:()=>stubCanvas()},require:id=>{const base=path.resolve(path.dirname(file),id);return load([base+'.ts',base].find(fs.existsSync));}});
 return m.exports;}
// minimal canvas stubs: enough for the engine to run story.draw end to end (no pixels)
function StubPath(){this.ops=0;}Object.assign(StubPath.prototype,{moveTo(){},ellipse(){},lineTo(){},arc(){},rect(){},closePath(){},addPath(){},bezierCurveTo(){},quadraticCurveTo(){}});
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
const mod=load(path.join(root,'lib/plays/riso/'+ID+'.ts')),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.audio.mode,'chapters');assert.equal(film.chapters.length,4,'live broadcast, replay, second replay, lesson');
const dir=path.join(root,'public/plays/narration/'+ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const chars=film.chapters.reduce((a,c)=>a+c.narration.length,0),words=film.chapters.reduce((a,c)=>a+c.narration.split(/\s+/).length,0);
assert.ok(chars<700,`narration ${chars} chars`);assert.ok(words>=70&&words<=92,`narration ${words} words`);
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=25&&total<=55,`length ${total}s (4 chapters)`);
// the recorded voice: files exist, chapter seconds cover each clip, and every cue's first word is a recorded word (no silent fallback)
const timing=path.join(dir,'timing.json');assert.ok(fs.existsSync(timing),'timing.json (Kokoro voice) installed');
{const T=JSON.parse(fs.readFileSync(timing,'utf8')),norm=w=>w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const d=T.chapters[i].seconds;assert.ok(ch.seconds>=d-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${d}`);
  const toks=T.chapters[i].words.map(w=>norm(w.w));for(const c of ch.cues){const f=norm(c.words.split(/\s+/)[0]);assert.ok(toks.some(t=>t===f||f.startsWith(t)),`ch${i+1} cue "${c.words}" first word is recorded`);
   assert.ok(T.chapters[i].words.some(w=>Math.abs(w.at-c.at)<1e-6),`ch${i+1} cue "${c.words}" is timed to a recorded word onset (${c.at})`);}});}
// render every chapter (start, middle, passage) through the stub canvas: no draw errors at card sizes
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.2,.35,.55,.7,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});}
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
// the goal: a run from inside his own half on the LEFT (−z), past Terry's sliding tackle (he is in the air over it, the ball never touches
// Terry), a RIGHT-foot curl from the edge of the area aimed outside the far post that bends back in to the FAR (+z) corner, past Cudicini.
assert.equal(F.shotFoot,'r','right foot (inferred: his stronger foot)');
const kc=F.ljungbergContact();assert.ok(d3(kc.rToe,F.P0)<.35,`his RIGHT boot is at the ball (${d3(kc.rToe,F.P0).toFixed(2)} m)`);assert.ok(d3(kc.rToe,F.P0)<d3(kc.lToe,F.P0),'right boot nearer the ball than the left');
assert.ok(F.P0[0]<-16.5&&F.P0[0]>-19.5&&F.P0[2]<-3&&F.P0[2]>-9,`shot from the edge of the area, left of centre (x ${F.P0[0]}, z ${F.P0[2]})`);
const start=F.ljungbergAt(-7.2);assert.ok(start.pelvis[0]<-52.5,`the run starts inside his own half (x ${start.pelvis[0].toFixed(1)})`);
for(let T=-7.2;T<-.5;T+=.1){const b=F.ballAt(T),p=F.ljungbergAt(T).pelvis;assert.ok(Math.hypot(b[0]-p[0],b[2]-p[2])<2.6,`the ball stays at his feet on the run (τ ${T.toFixed(1)})`);assert.ok(b[2]<0,`on the left (τ ${T.toFixed(1)})`);}
for(let T=F.T_SLIDE;T<F.T_SLIDE+1.4;T+=.02){const t=F.terryAt(T),b=F.ballAt(T);assert.ok(d3(t.lToe,b)>.3&&d3(t.rToe,b)>.3,`Terry's slide never touches the ball (τ ${T.toFixed(2)})`);
 const l=F.ljungbergAt(T);for(const toe of[l.lToe,l.rToe])for(const tt of[t.lToe,t.rToe])assert.ok(d3(toe,tt)>.18,`no boot-on-boot contact (τ ${T.toFixed(2)})`);}
assert.ok(F.ljungbergAt(F.T_HOP).air>.25,`he skips over the leg (${F.ljungbergAt(F.T_HOP).air.toFixed(2)} m in the air)`);
for(let T=-4.3;T<-2.6;T+=.02){const m=F.midAt(T),b=F.ballAt(T);assert.ok(d3(m.lToe,b)>.3&&d3(m.rToe,b)>.3,`the first man's lunge misses (τ ${T.toFixed(2)})`);}
assert.ok(F.AIM_Z>3.66+.5,`aimed outside the far post (aim line crosses at z ${F.AIM_Z.toFixed(2)})`);assert.ok(F.CURL[2]<0,'right-foot curl bends to his left (−z)');
const g=F.ballAt(F.TG);assert.ok(Math.abs(g[0])<.05&&g[2]>1.8&&g[2]<3.66-.11&&g[1]>.2&&g[1]<2.44-.11,`in at the FAR side (z ${g[2].toFixed(2)}, y ${g[1].toFixed(2)})`);
let maxZ=-9;for(let T=0;T<F.TG;T+=.01)maxZ=Math.max(maxZ,F.ballAt(T)[2]);assert.ok(maxZ<3.66-.11,'it never goes outside the post: it bends back in');
for(let T=0;T<F.TG;T+=.02)assert.ok(F.ballAt(T)[0]<0,'in play until the line');
for(let T=-.5;T<=F.TG+.05;T+=.02){const a=F.cudiciniAt(T),b=F.ballAt(T);assert.ok(d3(a.lHa,b)>.3&&d3(a.rHa,b)>.3,`Cudicini never touches it (τ ${T.toFixed(2)})`);}
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${chars} chars, ${total}s, ${frames} frames drawn, voice installed`);
