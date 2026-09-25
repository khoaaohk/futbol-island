// Iconic-play film: Jamie Carragher's signature last-ditch slide, shown through his 112th-minute clearance for a corner, with cramp, in extra
// time of AC Milan v Liverpool, Champions League final, 25 May 2005, Istanbul (lib/plays/riso/carragher-signature.ts). Structural checks, no
// browser: story shape (4 chapters: live, slow replay, second replay, lesson), narration = public/plays/narration/carragher-signature/script.json,
// 70–90 words ending with the lesson, cue words in order inside their chapter, no cue starting with a contraction or hyphenated word, length
// 20–45 s; every figure through the one drawPlayer() adapter on the shared athlete library; the sourced facts (extra time, cramp, cleared for
// a corner, no goal) and the geometry (Carragher's toe on the ball, low, the ball over the goal line wide of the near post, nothing of him
// touching the Milan runner); the voice hook; and every chapter drawn through a stub canvas at the three card sizes.
// The loader handles .ts and .json imports.
// usage: node tests/play-film-carragher-signature.cjs
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

const ID='carragher-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, slow replay, second replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Jamie Carragher/.test(text)&&/2005/.test(text)&&/Champions League final/.test(text)&&/Istanbul/.test(text)&&/Liverpool against Milan/.test(text),'Carragher and the 2005 final are narrated');
assert.ok(/extra time/.test(text)&&/cramp/.test(text)&&/clears it for a corner/.test(text)&&/win on penalties/.test(text),'the sourced beats: extra time, cramp, cleared for a corner, Liverpool won on penalties');
const footage=film.chapters.slice(0,3).map(c=>c.narration).join(' ');
assert.ok(!/slide|sliding|tackle|cross\b|Serginho|Shevchenko|Kak/i.test(footage),'the footage chapters claim nothing unsourced (the source says "clears for a corner")');
const last=film.chapters[3].narration;
assert.ok(/Only slide when you.re sure/.test(last)&&/Timing matters more than power/.test(last),'ends with the lesson (only slide when sure; timing over power)');
assert.ok(/25 May 2005/.test(film.ageNote)&&/Istanbul/.test(film.ageNote),'the match date and venue are stated');
// the look contract: full-sheet framing, the voice hook, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:23,/.test(src)&&/number:1,/.test(src),'Carragher 23, Dudek 1');
assert.ok(/shirt:'paper',shorts:'paper',socks:'paper'/.test(src)&&/shirt:R,shorts:R,socks:R/.test(src),'Milan all white, Liverpool all red');
assert.equal(JSON.stringify(film.chapters.map(c=>c.cues.length)),'[7,4,4,5]','cue counts the scenes key their actions to');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(!/['’-]/.test(c.words.split(/\s+/)[0]),`ch${i+1} cue "${c.words}" starts with a plain word (Kokoro splits contractions and hyphens)`);
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=45,`length ${total}s`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MOMENT/.test(src),'sources, confirmed/inferred and why this moment, at the top');
// the moment: in Liverpool's box in front of the near post; Carragher's right toe reaches the ball low, at the last moment; the ball leaves over
// the goal line wide of the near post (a corner, no goal); nothing of him touches the Milan runner; afterwards he sits, stretching the leg
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
assert.ok(F.BALL0[0]>3&&F.BALL0[0]<10&&F.BALL0[1]>13.84&&F.BALL0[1]<30.34,`the touch is inside the box, in front of the near post (${F.BALL0})`);
const b0=F.ballAt(F.T_CLEAR);assert.ok(Math.hypot(b0[0]-F.BALL0[0],b0[2]-F.BALL0[1])<.05,'the ball is at the spot at the touch');
const toe=F.carraToe();assert.ok(d3(toe,b0)<.3&&toe[1]<.35,`Carragher's right toe is on the ball at the touch (${d3(toe,b0).toFixed(2)} m, ${toe[1].toFixed(2)} m up)`);
assert.ok(F.carraPelvisY()<.5,`he goes in low (pelvis ${F.carraPelvisY().toFixed(2)} m)`);
assert.ok(F.OUT_AT[0]===0&&F.OUT_AT[1]<30.34&&F.OUT_AT[1]>0,`the ball crosses the goal line wide of the near post: a corner (z ${F.OUT_AT[1].toFixed(2)})`);
for(let T=-8;T<4;T+=.05){const b=F.ballAt(T);assert.ok(!(b[0]<0&&b[2]>30.34&&b[2]<37.66),`no goal at T=${T.toFixed(2)}`);}
const br=F.ballAt(F.T_CLEAR+4);assert.ok(br[0]<0&&br[2]<30.34,'the ball ends behind the goal line on the near side');
let minGap=9,at=0;for(let T=-.8;T<=1.5;T+=.02){const legs=F.runnerLegs(T);for(const p of F.carraBody(T))for(const q of legs){const g=d3(p,q);if(g<minGap){minGap=g;at=T;}}}
assert.ok(minGap>.2,`the ball, not the man: Carragher never touches the runner (closest ${minGap.toFixed(2)} m at T=${at.toFixed(2)})`);
const sit=F.stretch(F.T_CLEAR+3);assert.ok(sit.pelvisY<.45&&d3(sit.hand,sit.toe)<.45,`afterwards he sits and pulls his toes back (hand to toe ${d3(sit.hand,sit.toe).toFixed(2)} m, pelvis ${sit.pelvisY.toFixed(2)} m)`);
// installed voice (optional until generated): the film must import it, files exist and chapter seconds cover each clip
const timing=path.join(dir,'timing.json');
if(fs.existsSync(timing)){const T=JSON.parse(fs.readFileSync(timing,'utf8'));
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio once timing.json exists — import timing.json in ${ID}.ts (see the VOICE note)`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const dd=T.chapters?.[i]?.seconds;if(typeof dd==='number')assert.ok(ch.seconds>=dd-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${dd}`);});}
// render every chapter through the stub canvas at the three card sizes: no draw errors, reduced motion included
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});}
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${text.length} chars, ${total}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
