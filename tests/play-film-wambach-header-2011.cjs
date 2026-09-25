// Iconic-play film: Abby Wambach header v Brazil 2011 (lib/plays/riso/wambach-header-2011.ts). Structural checks, no browser:
// story shape, narration = public/plays/narration/wambach-header-2011/script.json, cue words are substrings in order, cues inside their
// chapter, length 25–55 s (4 chapters), < 700 narration characters; when timing.json (the voice generator's output) exists, every chapter's audio file
// exists and its seconds cover the clip. Also renders every chapter through a stub canvas so a draw error fails here, not in the card.
// usage: node tests/play-film-wambach-header-2011.cjs
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

const mod=load(path.join(root,'lib/plays/riso/wambach-header-2011.ts')),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,'wambach-header-2011');assert.equal(film.audio.mode,'chapters');assert.equal(film.chapters.length,4,'live broadcast, slow replay, the shootout, lesson');
const dir=path.join(root,'public/plays/narration/wambach-header-2011'),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
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
// the goal as the accounts describe it (see the film header): a LEFT-footed cross from deep on the LEFT (−z) to the far post; Wambach at the
// edge of the six-yard box, in the air, meets it with her head; it goes into the net; Andréia is off her line and does not touch it; Solo saves.
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
assert.equal(F.crossFoot,'l','Rapinoe crosses with her left foot');
const rc=F.rapinoeContact();assert.ok(d3(rc.lToe,F.P0)<.35,`her LEFT boot is at the ball at the cross (${d3(rc.lToe,F.P0).toFixed(2)} m)`);assert.ok(d3(rc.lToe,F.P0)<d3(rc.rToe,F.P0),'left boot nearer the ball than the right');
assert.ok(F.P0[2]<-20&&F.P0[0]<-30,`cross from deep on the left wing (x ${F.P0[0]}, z ${F.P0[2]})`);
const flight=Math.hypot(F.HEAD_PT[0]-F.P0[0],F.HEAD_PT[2]-F.P0[2]);assert.ok(flight>35&&flight<55,`a long cross (${flight.toFixed(1)} m)`);
assert.ok(F.HP[1]>1.5&&F.HP[1]<3.66,'the far post side (the post away from the crosser), inside the post');
assert.ok(F.HP[0]>-7&&F.HP[0]<-5,`at the edge of the six-yard box (x ${F.HP[0]})`);
const w=F.wambachAt(F.TF);assert.ok(w.air>.35,`she is in the air at contact (${w.air.toFixed(2)} m)`);
assert.ok(d3(w.face,F.HEAD_PT)<.2,`forehead on the ball (${d3(w.face,F.HEAD_PT).toFixed(2)} m)`);assert.ok(F.HEAD_PT[1]>2&&F.HEAD_PT[1]<2.8,`headed high (${F.HEAD_PT[1].toFixed(2)} m)`);
assert.ok(d3(F.ballAt(F.TF),F.HEAD_PT)<1e-6,'the cross arrives at her forehead');
const g=F.ballAt(F.TG);assert.ok(Math.abs(g[0])<.05&&Math.abs(g[2])<3.66-.11&&g[1]<2.44-.11&&g[1]>0,'the header crosses the line inside the goal');
for(let T=F.TF-1;T<=F.TF+.3;T+=.02){const a=F.andreiaAt(T),b=F.ballAt(T);assert.ok(d3(a.lHa,b)>.3&&d3(a.rHa,b)>.3,`Andréia never touches the ball (τ ${T.toFixed(2)})`);}
assert.ok(d3(F.penBall(F.T_HAND),F.HAND_S)<1e-6,'the penalty meets Solo\'s glove');const po=F.penBall(F.T_HAND+.5);assert.ok(Math.abs(po[2])>3.66||po[0]<0,'the save goes wide, not in');
// NYT: "Solo dived to her right". She faces −x, so her right is −z: the glove, and the parry, are on that side.
assert.equal(F.diveSide,'r','Solo dives to her right');assert.ok(F.HAND_S[2]<F.SOLO_P[1]-1,`her glove is out to her right, −z (${F.HAND_S[2].toFixed(2)})`);assert.ok(po[2]<0,'parried away on her right');
// kits, from FIFA's Tactical Line-up sheet: "Brazil (BRA) Shirt: yellow Shorts: white Socks: white"; "USA (USA) Shirt: black Shorts: black
// Socks: black" (black prints as solid navy, the darkest ink); Solo's keeper kit (not on the sheet) = the Solo film's red with navy trim.
const ink=v=>Array.isArray(v)?v[0]:v,cov=v=>Array.isArray(v)?v[1]:1,Kt=F.kits;
for(const part of ['shirt','shorts','socks']){assert.equal(ink(Kt.usa[part]),'navy',`USA ${part} black (navy)`);assert.ok(cov(Kt.usa[part])>=.9,`USA ${part} solid`);
 assert.equal(ink(Kt.solo[part]),'red',`Solo ${part} red, as the Solo film`);}
assert.equal(ink(Kt.brazil.shirt),'yellow','Brazil yellow shirts');assert.equal(Kt.brazil.shorts,'paper','Brazil white shorts');assert.equal(Kt.brazil.socks,'paper','Brazil white socks');
assert.equal(Kt.usa.numberInk,'paper','USA numbers read on the black');assert.equal(Kt.wambach.number,20,'Wambach 20');assert.equal(Kt.rapinoe.number,15,'Rapinoe 15');
assert.equal(ink(Kt.wambach.shirt),'navy','Wambach in the black USA strip');
console.log(`PASS wambach-header-2011: 4 chapters, ${words} words / ${chars} chars, ${total}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
