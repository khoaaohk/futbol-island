// Iconic-play film: Vinícius Júnior's signature (the lightning burst from the left) — his goal v Dortmund, 2024 Champions League final
// (lib/plays/riso/vinicius-signature.ts). Structural checks, no browser: story shape, narration = public/plays/narration/vinicius-signature/script.json,
// cue words in order and inside their chapter, 25–55 s, 70–90 words; timing.json (once voiced) covers the audio; every chapter renders
// through a stub canvas; then the play's geometry against the written accounts (see the film header).
// usage: node tests/play-film-vinicius-signature.cjs
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

const mod=load(path.join(root,'lib/plays/riso/vinicius-signature.ts')),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,'vinicius-signature');assert.equal(film.audio.mode,'chapters');assert.equal(film.chapters.length,4,'live broadcast, low replay, behind-the-goal replay, lesson');
const dir=path.join(root,'public/plays/narration/vinicius-signature'),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const chars=film.chapters.reduce((a,c)=>a+c.narration.length,0),words=film.chapters.reduce((a,c)=>a+c.narration.split(/\s+/).length,0);
assert.ok(chars<700,`narration ${chars} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words`);
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=25&&total<=55,`length ${total}s (4 chapters)`);
// installed voice (optional until generated): files exist and chapter seconds cover each clip
const timing=path.join(dir,'timing.json');
if(fs.existsSync(timing)){const T=JSON.parse(fs.readFileSync(timing,'utf8')),list=T.chapters??Object.values(T);
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio once timing.json exists`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const d=list[i]?.duration??list[i]?.seconds;if(typeof d==='number')assert.ok(ch.seconds>=d-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${d}`);});}
// render every chapter (start, middle, passage) through the stub canvas: no draw errors at card sizes
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.2,.35,.55,.7,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});}
// the goal as the accounts describe it: Maatsen's blind pass from the Dortmund LEFT (+z) across the face of his own box; Bellingham steals
// it and rolls it to his LEFT into Vinícius's path; Vinícius, on the LEFT side of the area, takes ONE touch and sweeps it across Kobel.
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]),d2=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
assert.ok(F.TM<F.TI&&F.TI<F.TB&&F.TB<F.TT&&F.TT<F.TS&&F.TS<F.TG,'beats in order: pass, steal, lay-off, touch, finish, goal');
assert.ok(F.M0[2]>8&&F.M0[0]>-18&&F.M0[0]<-8,`Maatsen passes from the Dortmund left (+z) near his own box (x ${F.M0[0]}, z ${F.M0[2]})`);
assert.ok(F.IB0[2]<F.M0[2]-6&&F.IB0[0]<-16.5,`the pass goes back across the face of the box, outside it (x ${F.IB0[0]}, z ${F.IB0[2]})`);
const km=F.contact('maa',F.TM);assert.ok(d3(km.lToe,F.M0)<.35,`Maatsen's LEFT boot at the ball (${d3(km.lToe,F.M0).toFixed(2)} m)`);
const kb=F.contact('bel',F.TB);assert.ok(d3(kb.rToe,F.IB1)<.35,`Bellingham's right boot at the ball for the lay-off (${d3(kb.rToe,F.IB1).toFixed(2)} m)`);
const b=F.belAt(F.TI);assert.ok(d2([b.x,0,b.z],F.IB0)<1.4,`Bellingham is at the ball when he steals it (${d2([b.x,0,b.z],F.IB0).toFixed(2)} m)`);
assert.ok(F.RV[2]<F.IB1[2]-6,'the lay-off goes to Bellingham\'s LEFT (−z)');
const kt=F.contact('vin',F.TT);assert.ok(d3(kt.rToe,F.RV)<.35,`Vinícius's touch meets the lay-off (${d3(kt.rToe,F.RV).toFixed(2)} m)`);
const ks=F.contact('vin',F.TS);assert.ok(d3(ks.rToe,F.SP)<.35,`his RIGHT boot at the ball for the finish (inferred foot; ${d3(ks.rToe,F.SP).toFixed(2)} m)`);assert.ok(d3(ks.rToe,F.SP)<d3(ks.lToe,F.SP),'right boot nearer than the left');
assert.equal(F.shotFoot,'r');
assert.ok(F.RV[0]>-16.6&&F.RV[2]<-4&&F.RV[2]>-20,`he receives it on the left side of the penalty area (x ${F.RV[0]}, z ${F.RV[2]})`);
assert.ok(F.SP[0]>F.RV[0]+2&&d2(F.SP,F.RV)<4.5&&F.SP[2]<-4,`ONE touch down the inside-left channel toward goal (${d2(F.SP,F.RV).toFixed(1)} m)`);
for(let T=F.TT+.02;T<F.TS-.02;T+=.02){const v=F.vinAt(T),bl=F.ballAt(T);assert.ok(Math.hypot(v.x-bl[0],v.z-bl[2])<2.2,`the ball stays with him between touch and finish (τ ${T.toFixed(2)})`);}
// the change of speed: a jog before the steal, a sprint after it
const slow=F.speed('vin',F.TM),fast=F.speed('vin',F.TT+.2);assert.ok(slow<3.2&&fast>6,`jog (${slow.toFixed(1)} m/s) then burst (${fast.toFixed(1)} m/s)`);
// the finish: crosses the line on the FAR (+z) side, low, inside the posts; Kobel never touches it
const g=F.ballAt(F.TG);assert.ok(Math.abs(g[0])<.05&&g[2]>1&&g[2]<3.66-.11&&g[1]>.11&&g[1]<1.2,`the finish crosses the line low on the far side (z ${g[2].toFixed(2)}, y ${g[1].toFixed(2)})`);
for(let T=F.TS;T<F.TG;T+=.02)assert.ok(F.ballAt(T)[1]<2.2,'a low sweep, not a lob');
for(let T=F.TS-.5;T<=F.TG+.1;T+=.02){const a=F.kobelAt(T),bl=F.ballAt(T);assert.ok(d3(a.lHa,bl)>.3&&d3(a.rHa,bl)>.3&&d3(a.head,bl)>.35,`Kobel never touches the ball (τ ${T.toFixed(2)})`);}
const k0=F.kobelAt(F.TS);assert.ok(k0.pelvis[0]<-2.5,'Kobel has come off his line');
// the defenders are beaten: at the finish Ryerson and Hummels are behind the ball, more than a stride from Vinícius
for(const w of['rye','hum']){const p=F.defAt(w,F.TS),v=F.vinAt(F.TS);assert.ok(Math.hypot(p.x-v.x,p.z-v.z)>1.2,`${w} is left a step behind`);}
console.log(`PASS vinicius-signature: 4 chapters, ${words} words / ${chars} chars, ${total}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
