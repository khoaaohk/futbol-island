// Iconic-play film: Weston McKennie's late header v Mexico, 2021 CONCACAF Nations League final (lib/plays/riso/mckennie-signature.ts). Structural checks, no browser:
// story shape, narration = public/plays/narration/mckennie-signature/script.json, cue words are substrings in order, cues inside their
// chapter, length 25–55 s (4 chapters), < 700 narration characters; when timing.json (the voice generator's output) exists, every chapter's audio file
// exists and its seconds cover the clip. Also renders every chapter through a stub canvas so a draw error fails here, not in the card.
// usage: node tests/play-film-mckennie-signature.cjs
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

const mod=load(path.join(root,'lib/plays/riso/mckennie-signature.ts')),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,'mckennie-signature');assert.equal(film.audio.mode,'chapters');assert.equal(film.chapters.length,4,'live broadcast, behind-the-goal replay, side replay, lesson');
const dir=path.join(root,'public/plays/narration/mckennie-signature'),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
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
// the goal as the accounts describe it (see the film header): McKennie HEADS Reyna's corner (confirmed); the ball GRAZES Ochoa's fingertips
// and still goes in (confirmed). Inferred and only checked for consistency: the corner from the USA's right (+z), Reyna's right foot, the
// header ≈ 8.6 m out, a take-off before the ball arrives ("jump early"), forehead contact, the marker a step behind.
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
assert.equal(F.cornerFoot,'r','Reyna takes it with his right foot (inferred)');
const rc=F.reynaContact();assert.ok(d3(rc.rToe,F.P0)<.35,`his RIGHT boot is at the ball at the corner (${d3(rc.rToe,F.P0).toFixed(2)} m)`);assert.ok(d3(rc.rToe,F.P0)<d3(rc.lToe,F.P0),'right boot nearer the ball than the left');
assert.ok(F.P0[2]>33&&F.P0[2]<34.2&&F.P0[0]>-1.2&&F.P0[0]<0,`the corner is taken from a corner quadrant (x ${F.P0[0]}, z ${F.P0[2]})`);
for(let T=0;T<F.TF;T+=.02){const b=F.ballAt(T);assert.ok(b[0]<0&&b[2]<34,`the corner stays in play (τ ${T.toFixed(2)})`);}
let apex=0;for(let T=0;T<F.TF;T+=.02)apex=Math.max(apex,F.ballAt(T)[1]);assert.ok(apex>3&&apex<9,`a lofted corner (apex ${apex.toFixed(1)} m)`);
assert.ok(F.HP[0]>-11&&F.HP[0]<-6&&Math.abs(F.HP[1])<4,`he heads it centrally, between the six-yard box and the penalty spot (x ${F.HP[0]}, z ${F.HP[1]})`);
const m=F.mckennieAt(F.TF);assert.ok(m.air>.4,`he soars: in the air at contact (${m.air.toFixed(2)} m)`);
assert.ok(d3(m.face,F.HEAD_PT)<.2,`forehead on the ball (${d3(m.face,F.HEAD_PT).toFixed(2)} m)`);assert.ok(F.HEAD_PT[1]>2.3&&F.HEAD_PT[1]<3.1,`met high (${F.HEAD_PT[1].toFixed(2)} m)`);
assert.ok(d3(F.ballAt(F.TF),F.HEAD_PT)<1e-6,'the corner arrives at his head');
assert.ok(F.mckennieAt(F.TJ+.3).air>.1&&F.TJ+.3<F.TF-.1,'jump early: he is already off the ground well before the ball arrives');
const k=F.markerAt(F.TF);assert.ok(d3(m.head,F.HEAD_PT)<d3(k.head,F.HEAD_PT)-.4,'McKennie beats his marker to it');assert.ok(d3(m.pelvis,k.pelvis)>.7,'the two bodies do not overlap');
// the fingertips: Ochoa's glove is at the ball when it passes (≈ a ball's radius), never before the header
const o=F.ochoaAt(F.TT),gd=Math.min(d3(o.lHa,F.TOUCH_PT),d3(o.rHa,F.TOUCH_PT));assert.ok(gd<.25,`Ochoa's fingertips graze it (${gd.toFixed(2)} m)`);
for(let T=F.TF-1;T<F.TT-.12;T+=.02){const a=F.ochoaAt(T),b=F.ballAt(T);assert.ok(d3(a.lHa,b)>.3&&d3(a.rHa,b)>.3,`no touch before the fingertips (τ ${T.toFixed(2)})`);}
assert.ok(F.TOUCH_PT[0]<-.2,'the touch is in front of the goal line');
const g=F.ballAt(F.TG);assert.ok(Math.abs(g[0])<.05&&Math.abs(g[2])<3.66-.11&&g[1]>.11&&g[1]<2.44-.11,`it still goes in (z ${g[2].toFixed(2)}, y ${g[1].toFixed(2)})`);
for(let T=F.TF;T<F.TG;T+=.01){const b=F.ballAt(T);assert.ok(b[1]>.1&&b[1]<3.4,`the header stays in the air on its way in (τ ${T.toFixed(2)})`);}
console.log(`PASS mckennie-signature: 4 chapters, ${words} words / ${chars} chars, ${total}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
