// Iconic-play film: João Neves's signature ("the tireless ball-winner"), shown through PSG's second goal v Inter Miami, Club World Cup last 16,
// 29 June 2025, Atlanta (lib/plays/riso/joao-neves-signature.ts): the press robs Busquets, Ruiz rolls it across, Neves side-foots into the
// empty net. Structural checks, no browser: story shape (4 chapters: live, slow replay, second replay, lesson), narration =
// public/plays/narration/joao-neves-signature/script.json, 70-90 words ending with the lesson, cue words in order inside their chapter and
// starting with a plain word (Kokoro), length 20-45 s; every figure through the one drawPlayer() adapter on the shared athlete library; the
// play's contact points (the defender's pass, Neves's right boot on the ball at the win, Ruiz's square, Neves's side-foot into the net); the
// voice hook; every chapter drawn through a stub canvas at the three card sizes. The loader handles .ts and .json imports.
// usage: node tests/play-film-joao-neves-signature.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{module:m,exports:m.exports,Math,WeakMap,Map,DOMMatrix:globalThis.DOMMatrix??StubMatrix,DOMPoint:globalThis.DOMPoint,Path2D:StubPath,document:{createElement:()=>stubCanvas()},require:id=>{const base=path.resolve(path.dirname(file),id);return load([base+'.ts',base].find(fs.existsSync));}});
 return m.exports;}
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

const ID='joao-neves-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
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
assert.ok(/João Neves/.test(text)&&/Atlanta/.test(text)&&/2025/.test(text)&&/Club World Cup/.test(text)&&/Inter Miami/.test(text)&&/Busquets/.test(text)&&/Ruiz/.test(text),'Neves, Atlanta, the 2025 Club World Cup, Inter Miami, Busquets and Ruiz are narrated');
assert.ok(/empty net/.test(text)&&/four–nil/.test(text)&&/player of the match/.test(text),'the sourced facts: empty net, 4–0, player of the match');
assert.ok(!/Neves (robs|wins|steals|tackles)|right foot|left foot|Ustari|Messi/i.test(text),'the unconfirmed ball-winner, the feet and inferred names are not narrated');
const last=film.chapters[3].narration;
assert.ok(/press quickly/.test(last)&&/first few seconds/.test(last)&&/win it back/.test(last),'ends with the lesson (press quickly, the first few seconds)');
assert.ok(/29 June 2025/.test(film.ageNote),'the match date is stated');
// the look contract: full-sheet framing, the voice hook, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:87,/.test(src)&&/number:5,/.test(src)&&/number:8,/.test(src),'Neves 87, Busquets 5, Ruiz 8');
assert.ok(/shirt:\[K,\.95\],trim:R,shorts:\[K,\.95\],socks:\[K,\.95\]/.test(src)&&/shirt:\[R,\.5\],trim:K,shorts:\[R,\.5\],socks:\[R,\.5\]/.test(src),'PSG all navy (red trim), Inter Miami all pink');
assert.equal(JSON.stringify(film.chapters.map(c=>c.cues.length)),'[6,6,5,5]','cue counts the scenes key their actions to');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  const first=c.words.split(/\s+/)[0];assert.ok(!/[’'\-–]/.test(first),`ch${i+1} cue "${c.words}" starts with a plain word (Kokoro splits contractions and hyphens)`);
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
const cf=F.cbFeet(F.T_PASS);assert.ok(d2(cf.r,F.CB_BALL)<.3&&d2(cf.r,F.CB_BALL)<d2(cf.l,F.CB_BALL),`the defender's right boot plays the pass in (${d2(cf.r,F.CB_BALL).toFixed(2)} m)`);
const b0=F.ballAt(F.T_REC);assert.ok(Math.hypot(b0[0]-F.B_REC[0],b0[2]-F.B_REC[1])<.05,'the ball reaches Busquets');
const bb=F.busqAt(F.T_REC);assert.ok(Math.hypot(bb[0]-F.B_REC[0],bb[1]-F.B_REC[1])<1,'Busquets is on the ball when it arrives');
// the press: Neves is sprinting when the pass is played and covers the ground to the ball in about a second and a half
const n0=F.nevesAt(F.T_PASS),n1=F.nevesAt(F.T_PASS+.4);assert.ok(Math.hypot(n1[0]-n0[0],n1[1]-n0[1])/.4>5.5,'Neves is sprinting the moment the pass is played');
assert.ok(Math.hypot(n0[0]-F.W_XZ[0],n0[1]-F.W_XZ[1])>7,'he starts the press from a real distance (not already on the man)');
const nf=F.nevesFeet(F.T_WIN),dw=p=>Math.hypot(p[0]-F.W[0],p[2]-F.W[2]);
assert.ok(dw(nf.r)<.2&&dw(nf.l)>.4,`Neves's right boot is on the ball at the win (right ${dw(nf.r).toFixed(2)} m, left ${dw(nf.l).toFixed(2)} m)`);
assert.ok(nf.pelvisY>.65,`on his feet at the win (pelvis ${nf.pelvisY.toFixed(2)} m)`);
const bw=F.ballAt(F.T_WIN);assert.ok(Math.hypot(bw[0]-F.W[0],bw[2]-F.W[2])<.05,'the ball is at his boot at the win');
assert.ok(F.T_WIN-F.T_REC<1,'the ball is won within a second of Busquets receiving it (the first few seconds)');
const br=F.ballAt(F.T_RZ);assert.ok(Math.hypot(br[0]-F.RZ[0],br[2]-F.RZ[1])<.05,'the loose ball runs to Ruiz');
// Ruiz's square (right boot), the keeper out of his goal, Neves's side-foot (right boot) into the net
const rf=F.ruizFeet(F.T_SQ);assert.ok(d2(rf.r,F.SQ_BALL)<.3,`Ruiz's right boot rolls it across (${d2(rf.r,F.SQ_BALL).toFixed(2)} m)`);
const k=F.keeperAt(F.T_SHOT);assert.ok(k[0]<100.5&&Math.abs(k[1]-34)>4,'the keeper is out, away from the goal mouth: an empty net');
const sf=F.nevesFeet(F.T_SHOT);assert.ok(d2(sf.r,F.N_SHOT)<.3,`Neves's right boot side-foots it (${d2(sf.r,F.N_SHOT).toFixed(2)} m)`);
const run=Math.hypot(F.N_SHOT[0]-F.W_XZ[0],F.N_SHOT[1]-F.W_XZ[1])/(F.T_SHOT-F.T_WIN);assert.ok(run>5&&run<8.5,`he keeps running from the win to the shot (${run.toFixed(1)} m/s)`);
const g=F.ballAt(F.T_GOAL);assert.ok(g[0]>105&&g[2]>30.4&&g[2]<37.6&&g[1]<2.4,'the ball crosses the line inside the goal');
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
