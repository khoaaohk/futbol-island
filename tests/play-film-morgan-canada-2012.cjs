// Iconic-play film: Alex Morgan header v Canada 2012 (Olympic semi-final) (lib/plays/riso/morgan-canada-2012.ts). Structural checks, no browser:
// story shape, narration = public/plays/narration/morgan-canada-2012/script.json, cue words are substrings in order, cues inside their
// chapter, length 25–55 s (4 chapters), < 700 narration characters; when timing.json (the voice generator's output) exists, every chapter's audio file
// exists and its seconds cover the clip. Also renders every chapter through a stub canvas so a draw error fails here, not in the card.
// usage: node tests/play-film-morgan-canada-2012.cjs
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

const mod=load(path.join(root,'lib/plays/riso/morgan-canada-2012.ts')),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,'morgan-canada-2012');assert.equal(film.audio.mode,'chapters');assert.equal(film.chapters.length,4,'live broadcast, slow replay, behind-the-goal replay, lesson');
const dir=path.join(root,'public/plays/narration/morgan-canada-2012'),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
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
  const d=list[i]?.duration;if(typeof d==='number')assert.ok(ch.seconds>=d-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${d}`);});}
// render every chapter (start, middle, passage) through the stub canvas: no draw errors at card sizes
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.2,.35,.55,.7,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});}
// the goal as the accounts describe it (see the film header): O'Reilly crosses (drawn from the USA's right, her right foot — inferred);
// Morgan, in the air in front of Wambach and Tancredi, meets it with her head; it loops over McLeod's hand into the TOP RIGHT corner.
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
assert.equal(F.crossFoot,'r','O\'Reilly crosses with her right foot (inferred)');
const oc=F.oreillyContact();assert.ok(d3(oc.rToe,F.P0)<.35,`her RIGHT boot is at the ball at the cross (${d3(oc.rToe,F.P0).toFixed(2)} m)`);assert.ok(d3(oc.rToe,F.P0)<d3(oc.lToe,F.P0),'right boot nearer the ball than the left');
assert.ok(F.P0[2]>15&&F.P0[0]<-15,`crossed from out wide on the USA's right (x ${F.P0[0]}, z ${F.P0[2]})`);
const flight=Math.hypot(F.HEAD_PT[0]-F.P0[0],F.HEAD_PT[2]-F.P0[2]);assert.ok(flight>20&&flight<40,`a long cross (${flight.toFixed(1)} m)`);
assert.ok(F.HP[0]>-11&&F.HP[0]<-6&&Math.abs(F.HP[1])<2,`Morgan in the middle of the box (x ${F.HP[0]}, z ${F.HP[1]})`);
const m=F.morganAt(F.TF);assert.ok(m.air>.35,`she climbs high: in the air at contact (${m.air.toFixed(2)} m)`);
assert.ok(d3(m.face,F.HEAD_PT)<.2,`forehead on the ball (${d3(m.face,F.HEAD_PT).toFixed(2)} m)`);assert.ok(F.HEAD_PT[1]>2&&F.HEAD_PT[1]<2.9,`headed high (${F.HEAD_PT[1].toFixed(2)} m)`);
assert.ok(d3(F.ballAt(F.TF),F.HEAD_PT)<1e-6,'the cross arrives at her forehead');
// the ball "felt just short, right in front of" Tancredi (on Wambach): Morgan is nearer the crosser's line than Wambach / Tancredi
const w=F.wambachAt(F.TF).pelvis,tn=F.tancrediAt(F.TF);assert.ok(F.HP[1]>w[2]+1&&F.HP[1]>tn.z+1,'Morgan in front of Wambach and Tancredi (the ball drops short of them)');
// Sesselmann has left her to close down O'Reilly
const se=F.sesselmannAt(0);assert.ok(Math.hypot(se.x-F.P0[0],se.z-F.P0[2])<5&&Math.hypot(se.x-F.HP[0],se.z-F.HP[1])>15,'Sesselmann out closing O\'Reilly, far from Morgan');
const g=F.ballAt(F.TG);assert.ok(Math.abs(g[0])<.05&&g[2]>1.8&&g[2]<3.66-.11&&g[1]>1.6&&g[1]<2.44-.11,`the header goes in the TOP RIGHT corner (z ${g[2].toFixed(2)}, y ${g[1].toFixed(2)})`);
// a looping header: it rises after contact and drops in
let top=0;for(let T=F.TF;T<=F.TG;T+=.02)top=Math.max(top,F.ballAt(T)[1]);assert.ok(top>F.HEAD_PT[1]+.5,`it loops up (apex ${top.toFixed(2)} m)`);
// over McLeod: she never touches it, and when it passes her it is above her reach
let minD=9;for(let T=F.TF-1;T<=F.TG+.05;T+=.02){const a=F.mcleodAt(T),b=F.ballAt(T);minD=Math.min(minD,d3(a.lHa,b),d3(a.rHa,b));}
assert.ok(minD>.3,`McLeod never touches the ball (closest ${minD.toFixed(2)} m)`);
{let T=F.TF;while(F.ballAt(T)[0]<F.mcleodAt(T).pelvis[0]&&T<F.TG)T+=.01;const a=F.mcleodAt(T),b=F.ballAt(T);assert.ok(b[1]>Math.max(a.lHa[1],a.rHa[1])+.2,`over her hand as it passes her (ball ${b[1].toFixed(2)} m, hand ${Math.max(a.lHa[1],a.rHa[1]).toFixed(2)} m)`);}
console.log(`PASS morgan-canada-2012: 4 chapters, ${words} words / ${chars} chars, ${total}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
