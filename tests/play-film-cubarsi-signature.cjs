// Iconic-play film: Pau Cubarsí's signature, the line-breaking pass — his pass that released Fermín López beyond the Napoli defence in
// Barcelona 3–1 Napoli, Champions League round of 16, 12 March 2024 (lib/plays/riso/cubarsi-signature.ts). Structural checks, no browser:
// story shape (4 chapters: live, slow replay, second replay, lesson), narration = public/plays/narration/cubarsi-signature/script.json,
// 70–90 words ending with the lesson, cue words in order inside their chapter (none starting with a contraction), length 20–45 s; every
// figure through the one drawPlayer() adapter on the shared athlete library; the play's contact points (Cubarsí's right boot on the pass,
// the ball over both Napoli lines, López's right-foot control beyond the line, his LEFT-foot chip from outside the box over Meret and over
// the bar); the voice hook; every chapter drawn through a stub canvas at the three card sizes. The loader handles .ts and .json imports.
// usage: node tests/play-film-pique-signature.cjs
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


const ID='cubarsi-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
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
assert.ok(/Pau Cubarsí/.test(text)&&/Fermín López/.test(text)&&/Napoli/.test(text)&&/2024/.test(text)&&/seventeen/.test(text)&&/over the bar/.test(text)&&/three-one/.test(text)&&/Player of the Match/.test(text),
 'the sourced facts are narrated: Cubarsí 17 v Napoli 2024, López, the chance over the bar, 3–1, Player of the Match');
const last=film.chapters[3].narration;
assert.ok(/Look forward first/.test(last)&&/through the lines skips lots of defenders\.$/.test(last),'ends with the lesson (look forward first; a pass through the lines skips lots of defenders)');
assert.ok(/12 March 2024/.test(film.ageNote)&&/3–1/.test(film.ageNote),'the match and date are stated');
// the look contract: full-sheet framing, the voice hook, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming);/.test(src)&&/withTiming\(/.test(src)&&/\],VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:33,/.test(src)&&/number:32,/.test(src),'Cubarsí 33, López 32');
assert.ok(/shirt:B,pattern:'stripes',patternInk:\[R,\.9\],trim:\[R,\.8\],shorts:\[B,\.95\],socks:\[R,\.95\]/.test(src)&&/shirt:'paper',trim:\[B,\.6\],shorts:'paper',socks:'paper'/.test(src),'Barcelona blue-and-garnet stripes, blue shorts, garnet socks; Napoli all white');
assert.equal(JSON.stringify(film.chapters.map(c=>c.cues.length)),'[5,5,5,4]','cue counts the scenes key their actions to');
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
// the play
const d2=(p,q)=>Math.hypot(p[0]-q[0],p[2]-q[1]);
// Cubarsí: head up and a look toward the run before the pass; his RIGHT boot strikes it
let up=0,right=0;for(let T=-2.2;T<F.C_START;T+=.05){const[u,r]=F.lookAt(T);up=Math.max(up,u);right=Math.min(right,r);}
assert.ok(up>.8&&right<-.4,`he looks up and toward the run before passing (up ${up.toFixed(2)}, turn ${right.toFixed(2)})`);
const cf=F.cubarsiFeet(F.T_PASS);assert.ok(d2(cf.r,F.P0)<.3&&d2(cf.r,F.P0)<d2(cf.l,F.P0),`Cubarsí's right boot at the pass (${d2(cf.r,F.P0).toFixed(2)} m)`);
const b0=F.ballAt(F.T_PASS);assert.ok(Math.hypot(b0[0]-F.P0[0],b0[2]-F.P0[1])<.05,'the ball is at his boot at the pass');
assert.ok(F.P0[0]<52.5,'the pass is struck from his own half');
// the pass skips both Napoli lines: in the air as it crosses each line, and every skipped Napoli player is between passer and receiver
const flight=[];for(let T=F.T_PASS;T<=F.T_RCV;T+=.02)flight.push(F.ballAt(T));
for(const X of [F.MID_X,F.DEF_X]){const p=flight.find(b=>b[0]>=X);assert.ok(p&&p[1]>3,`the pass is over the line at x=${X} (${p&&p[1].toFixed(1)} m high)`);}
for(const id of F.SKIPPED){const n=F.at(id,F.T_PASS);assert.ok(n[0]>F.P0[0]+10&&n[0]<F.at('fermin',F.T_RCV)[0],`${id} is skipped by the pass`);}
assert.ok(F.SKIPPED.length>=7,'the pass skips the midfield three and the back four');
// López: onside at the pass (behind the last defender), then beyond the line; the right-foot control; the LEFT-foot chip outside the box
const lastDef=Math.max(F.at('n-lcb',F.T_PASS)[0],F.at('n-rcb',F.T_PASS)[0]),fx=F.at('fermin',F.T_PASS)[0];
assert.ok(fx<lastDef,`López onside at the pass (${fx.toFixed(1)} < ${lastDef.toFixed(1)})`);
assert.ok(F.RC[0]>lastDef+8,'he meets the ball well beyond the defence');
const fr=F.ferminFeet(F.T_RCV);assert.ok(Math.hypot(fr.r[0]-F.RCB[0],fr.r[1]-F.RCB[1],fr.r[2]-F.RCB[2])<.3,`López's raised right boot meets the dropping ball`);
const br=F.ballAt(F.T_RCV);assert.ok(Math.hypot(br[0]-F.RCB[0],br[1]-F.RCB[1],br[2]-F.RCB[2])<.05,'the pass arrives at his boot');
for(const id of ['n-lcb','n-rcb']){const n=F.at(id,F.T_RCV);assert.ok(Math.hypot(n[0]-F.RC[0],n[1]-F.RC[1])>4,`${id} beaten, still chasing`);}
const cs=F.ferminFeet(F.T_SHOT);assert.ok(d2(cs.l,F.CHB)<.3&&d2(cs.l,F.CHB)<d2(cs.r,F.CHB),`López's LEFT boot strikes the chip (${d2(cs.l,F.CHB).toFixed(2)} m)`);
assert.ok(F.CHB[0]<105-16.5,'the chip is from outside the box');
const mx=F.at('meret',F.T_SHOT);assert.ok(mx[0]<99&&mx[0]>F.CHB[0]+4,`Meret is off his line (x ${mx[0].toFixed(1)})`);
let overK=0;for(let T=F.T_SHOT;T<F.T_BAR;T+=.01){const b=F.ballAt(T);if(Math.abs(b[0]-mx[0])<.3)overK=b[1];}
assert.ok(overK>3,`the chip goes over the keeper (${overK.toFixed(1)} m)`);
const gb=F.ballAt(F.T_BAR);assert.ok(Math.abs(gb[0]-105)<.1&&gb[1]>2.44+.3&&gb[1]<4&&gb[2]>30.34&&gb[2]<37.66,`just over the bar, between the posts (${gb[1].toFixed(2)} m at z ${gb[2].toFixed(1)})`);
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
