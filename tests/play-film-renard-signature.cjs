// Iconic-play film: Wendie Renard's signature towering header from a corner, France 4-0 South Korea, Women's World Cup 2019 opener
// (lib/plays/riso/renard-signature.ts). Structural checks, no browser: story shape, narration = public/plays/narration/renard-signature/script.json,
// cue words are substrings in order, cues inside their chapter, length 25–55 s (4 chapters), 70–90 words; when timing.json (the voice
// generator's output) exists, every chapter's audio file exists and its seconds cover the clip. Also renders every chapter through a stub
// canvas so a draw error fails here, not in the card. usage: node tests/play-film-renard-signature.cjs
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

const mod=load(path.join(root,'lib/plays/riso/renard-signature.ts')),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,'renard-signature');assert.equal(film.audio.mode,'chapters');assert.equal(film.chapters.length,4,'live broadcast, slow replay, behind-the-goal replay, lesson');
const dir=path.join(root,'public/plays/narration/renard-signature'),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
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
// the goal as the accounts describe it (see the film header): Majri's corner from the LEFT (−z; inferred left foot → an out-swinger), met
// by Renard on/near the penalty spot at the top of her leap, powered over her marker Hwang Bo-ram, into the right corner (+z) past a
// stationary keeper.
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
assert.equal(F.cornerFoot,'l','Majri takes it with her left foot (inferred)');
const mc=F.majriContact();assert.ok(d3(mc.lToe,F.P0)<.35,`her LEFT boot is at the ball at the corner (${d3(mc.lToe,F.P0).toFixed(2)} m)`);assert.ok(d3(mc.lToe,F.P0)<d3(mc.rToe,F.P0),'left boot nearer the ball than the right');
assert.ok(F.P0[2]<-33&&F.P0[2]>-34.2&&F.P0[0]>-1.2&&F.P0[0]<0,`the corner is taken from France's LEFT (−z) corner quadrant (x ${F.P0[0]}, z ${F.P0[2]})`);
assert.ok(Math.hypot(F.HP[0]+11,F.HP[1])<1,`she heads it on the penalty spot (x ${F.HP[0]}, z ${F.HP[1]})`);
const r=F.renardAt(F.TF);assert.ok(r.air>.25,`she is in the air at contact (${r.air.toFixed(2)} m)`);
assert.ok(d3(r.face,F.HEAD_PT)<.2,`forehead on the ball (${d3(r.face,F.HEAD_PT).toFixed(2)} m)`);assert.ok(F.HEAD_PT[1]>2.1&&F.HEAD_PT[1]<2.9,`headed high, at the top of her leap (${F.HEAD_PT[1].toFixed(2)} m)`);
// top of her leap: her head is at (about) its highest around contact
let top=-1,topT=0;for(let T=F.TF-.6;T<=F.TF+.6;T+=.02){const h=F.renardAt(T).head[1];if(h>top){top=h;topT=T;}}assert.ok(Math.abs(topT-F.TF)<.2,`contact near the top of her leap (peak at τ ${topT.toFixed(2)}, contact ${F.TF})`);
assert.ok(d3(F.ballAt(F.TF),F.HEAD_PT)<1e-6,'the corner arrives at her forehead');
let apex=0;for(let T=0;T<F.TF;T+=.02)apex=Math.max(apex,F.ballAt(T)[1]);assert.ok(apex>3.5&&apex<7,`a lifted corner (apex ${apex.toFixed(1)} m)`);
// an out-swinger: the ball bends AWAY from goal (its x falls below a straight line from the flag to her head)
const mid=F.ballAt(F.TF/2),lin=F.P0[0]+(F.HEAD_PT[0]-F.P0[0])/2;assert.ok(mid[0]>lin,'out-swinging: it starts toward goal and bends away to the spot');
// the header goes DOWN toward goal, into the right corner (+z), low
const g=F.ballAt(F.TG);assert.ok(Math.abs(g[0])<.05&&g[2]>1.5&&g[2]<3.66-.11&&g[1]>.11&&g[1]<1.2,`the header crosses the line low in the RIGHT corner (z ${g[2].toFixed(2)}, y ${g[1].toFixed(2)})`);
assert.ok(g[1]<F.HEAD_PT[1]-1,'headed down: it crosses the line well below where she met it');
assert.ok((F.TG-F.TF)<.8,'a powered header: goal-line in under .8 s from the spot');
// over the head of the defender
const m=F.markerAt(F.TF);assert.ok(d3(m.head,F.HEAD_PT)>.5,'her marker is beaten to the ball');
for(let T=F.TF;T<=F.TF+.2;T+=.02){const b=F.ballAt(T),mh=F.markerAt(T).head;if(Math.abs(b[0]-mh[0])<.4)assert.ok(b[1]>mh[1]+.15,`the header goes over Hwang Bo-ram's head (τ ${T.toFixed(2)})`);}
// a stationary keeper: she never touches it and barely moves
const k0=F.keeperAt(F.TF-.5).pelvis;for(let T=F.TF-1;T<=F.TG+.1;T+=.02){const a=F.keeperAt(T),b=F.ballAt(T);assert.ok(d3(a.lHa,b)>.3&&d3(a.rHa,b)>.3,`the keeper never touches the ball (τ ${T.toFixed(2)})`);assert.ok(Math.hypot(a.pelvis[0]-k0[0],a.pelvis[2]-k0[2])<.35,'the keeper stays where she is');}
console.log(`PASS renard-signature: 4 chapters, ${words} words / ${chars} chars, ${total}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
