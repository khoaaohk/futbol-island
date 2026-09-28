// Iconic-play film: Filippo Inzaghi's second goal v Liverpool, 2007 Champions League final (lib/plays/riso/inzaghi-final-2007.ts). Structural checks, no
// browser: story shape, narration = public/plays/narration/<id>/script.json, cue words in order and timed to the Kokoro voice, length, every
// chapter drawn through a stub canvas at card sizes; then the goal as the accounts describe it (see the film header).
// usage: node tests/play-film-inzaghi-final-2007.cjs
const ID='inzaghi-final-2007';
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
// the goal: Kaká's threaded pass; Inzaghi ONSIDE on the last defender's shoulder when it is played and away first; he takes it round Reina
// (who dives and never touches it) and rolls it into the empty net.
const kc=F.kakaContact();assert.ok(d3(kc.rToe,F.P0)<.35,`Kaká's boot at the ball (${d3(kc.rToe,F.P0).toFixed(2)} m)`);
const i0=F.inzaghiAt(0).pelvis;assert.ok(i0[0]<=F.LINE_X,`onside when the pass is played (Inzaghi x ${i0[0].toFixed(2)} ≤ line ${F.LINE_X})`);assert.ok(F.LINE_X-i0[0]<.8,'but right on the shoulder of the line');
const others=F.defendersAt(0);assert.ok(others.every(p=>p[0]<=F.LINE_X+1e-6),'the drawn line is the last defender');
assert.ok(d3(F.ballAt(F.TR),F.R0)<.05,'the pass reaches him');const ir=F.inzaghiAt(F.TR).pelvis;assert.ok(Math.hypot(ir[0]-F.R0[0],ir[2]-F.R0[2])<1.4,'he is on it');
const dr=F.defendersAt(F.TR)[0];assert.ok(ir[0]-dr[0]>2,'the defender is left behind');
for(let T=0;T<F.TR;T+=.05)assert.ok(F.ballAt(T)[1]<.12,'a ground pass');
for(let T=1.5;T<=F.T_GL;T+=.02){const r=F.reinaAt(T),b=F.ballAt(T);for(const p of[r.lHa,r.rHa,r.lToe,r.rToe])assert.ok(d3(p,b)>.3,`Reina never touches it (τ ${T.toFixed(2)})`);}
const fc=F.inzaghiAt(F.T_FIN);assert.ok(d3(fc.rToe,F.ballAt(F.T_FIN))<.4,`the finish off his right boot (${d3(fc.rToe,F.ballAt(F.T_FIN)).toFixed(2)} m)`);
const g=F.ballAt(F.T_GL);assert.ok(Math.abs(g[0])<.05&&Math.abs(g[2])<3.55&&g[1]<.2,'rolled in along the ground');
const rp=F.reinaAt(F.T_FIN).pelvis;assert.ok(rp[0]<-3,'the net is empty: Reina is out of his goal');
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${chars} chars, ${total}s, ${frames} frames drawn, voice installed`);
