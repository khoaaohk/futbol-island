// Iconic-play film: Marc-André ter Stegen's signature, passing out from the back — his assist for Suárez, Getafe 0–2 Barcelona, La Liga,
// 28 September 2019 (lib/plays/riso/ter-stegen-signature.ts). Structural checks, no browser: story shape (4 chapters: live, slow replay,
// second replay, lesson), narration = public/plays/narration/ter-stegen-signature/script.json, 70–90 words ending with the lesson, cue words
// in order and starting with plain words; every figure through the one drawPlayer() adapter; the play's contact points (the Getafe long ball,
// the chest control outside the box, his right-foot long pass, Suárez's first-time right-foot lob from outside the box over Soria into the
// centre of the goal); the voice hook; every chapter drawn through a stub canvas at the three card sizes. The loader handles .ts and .json.
// usage: node tests/play-film-ter-stegen-signature.cjs
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

const ID='ter-stegen-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
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
assert.ok(/Marc-André ter Stegen/.test(text)&&/Suárez/.test(text)&&/2019/.test(text)&&/Getafe/.test(text)&&/chests it/.test(text),'ter Stegen, Suárez, Getafe 2019 and the sourced chest control are narrated');
const last=film.chapters[3].narration;
assert.ok(/extra player/.test(last)&&/Stay calm/.test(last)&&/find a free teammate\.$/.test(last),'ends with the lesson (extra player, stay calm, find a free teammate)');
assert.ok(/28 September 2019/.test(film.ageNote)&&/0–2/.test(film.ageNote),'the match and date are stated');
// cue-word gotcha: no cue starts with a contraction or a hyphenated word
for(const ch of film.chapters)for(const c of ch.cues){const w=c.words.split(/\s+/)[0];assert.ok(!/[’'\-]/.test(w),`cue "${c.words}" starts with a plain word`);}
// the look contract: full-sheet framing, the voice hook, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming);/.test(src)&&/withTiming\(/.test(src)&&/\],VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:1,/.test(src)&&/number:9,/.test(src),'ter Stegen 1, Suárez 9');
assert.ok(/shirt:K,trim:\[B,\.9\],shorts:K,socks:K/.test(src)&&/shirt:B,trim:'paper'/.test(src),'Barcelona near-black away, Getafe blue');
assert.equal(JSON.stringify(film.chapters.map(c=>c.cues.length)),'[8,6,5,5]','cue counts the scenes key their actions to');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=45,`length ${total}s`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MATCH/.test(src),'sources, confirmed/inferred and why this match, at the top');
// the play
const d2=(p,q)=>Math.hypot(p[0]-q[0],p[2]-q[1]),d3=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);
const kf=F.kickerFeet(F.T_LB);assert.ok(d2(kf.r,F.LB0)<.3,`the Getafe long ball off a right boot (${d2(kf.r,F.LB0).toFixed(2)} m)`);
let hiL=0;for(let T=F.T_LB;T<0;T+=.05)hiL=Math.max(hiL,F.ballAt(T)[1]);assert.ok(hiL>6,`the long ball goes over the top (max ${hiL.toFixed(1)} m)`);
const tb=F.tsBody(0),b0=F.ballAt(0);
assert.ok(F.CH[0]>16.5+.5,'the chest control is OUTSIDE his box (no hands allowed)');
assert.ok(d3(b0,F.CHB)<.02&&Math.abs(b0[1]-tb.chest[1])<.15&&d3(b0,tb.chest)<.4,`the ball meets his chest (${d3(b0,tb.chest).toFixed(2)} m from the chest joint, height ${b0[1].toFixed(2)})`);
assert.ok(tb.pelvisY>.7,'on his feet at the chest control');
assert.ok(Math.hypot(F.runnerAt(0)[0]-F.CH[0],F.runnerAt(0)[1]-F.CH[1])>1.5,'the Getafe runner is beaten to it');
const ts0=F.tsAt(-2.7),tsC=F.tsAt(0);assert.ok(tsC[0]-ts0[0]>8,'he races out a long way');
for(let T=.42;T<F.T_P;T+=.1)assert.ok(F.ballAt(T)[1]<.5,'after the chest the ball is down on the grass');
assert.ok(F.upAt(F.T_UP+.5)>.9,'head up before the strike');
const tp=F.tsBody(F.T_P);assert.ok(d2(tp.r,F.PB)<.3&&d2(tp.r,F.PB)<d2(tp.l,F.PB),`his right boot strikes the long pass (${d2(tp.r,F.PB).toFixed(2)} m)`);
let hi=0;for(let T=F.T_P;T<F.T_L;T+=.05)hi=Math.max(hi,F.ballAt(T)[1]);assert.ok(hi>8,`the pass is long and lofted (max ${hi.toFixed(1)} m)`);
assert.ok(F.LAND[0]-F.PB[0]>55,'the other way, sixty metres upfield');
const sf=F.suarezFeet(F.T_R);assert.ok(d3(F.ballAt(F.T_R),F.SR)<.02&&Math.hypot(sf.r[0]-F.SR[0],sf.r[1]-F.SR[1],sf.r[2]-F.SR[2])<.35,`Suárez's right boot meets it first time (${d3(sf.r,F.SR).toFixed(2)} m)`);
assert.ok(F.SR[0]<105-16.5,'the lob is struck from outside the box');
for(const id of ['g-cb1','g-cb2']){const p=F.defAt(id,F.T_R);assert.ok(Math.hypot(p[0]-F.SR[0],p[1]-F.SR[2])>3,`${id} is beaten (one-on-one)`);}
const g=F.ballAt(F.T_G);assert.ok(Math.abs(g[0]-105)<.05&&g[1]<2.3&&Math.abs(g[2]-34)<2,`into the centre of the goal, under the bar (${g.map(v=>v.toFixed(2))})`);
let over=1e9;for(let T=F.T_R;T<F.T_G;T+=.02){const b=F.ballAt(T),s=F.soriaBody(T);if(Math.abs(b[0]-s.chest[0])<1)over=Math.min(over,b[1]-Math.max(s.rHa[1],s.chest[1]+.8));}
assert.ok(over>.4&&over<1e9,`the lob is over Soria's hand (${over.toFixed(2)} m clear)`);
// installed voice (optional until generated)
const timing=path.join(dir,'timing.json');
if(fs.existsSync(timing)){const T=JSON.parse(fs.readFileSync(timing,'utf8'));
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio once timing.json exists — import timing.json in ${ID}.ts (see the VOICE note)`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const dd=T.chapters?.[i]?.seconds;if(typeof dd==='number')assert.ok(ch.seconds>=dd-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${dd}`);});}
// render every chapter through the stub canvas at the three card sizes
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});}
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${text.length} chars, ${total}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
