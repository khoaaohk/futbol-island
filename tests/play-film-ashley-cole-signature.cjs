// Iconic-play film: Ashley Cole's signature, shutting down Luís Figo, England v Portugal 2006 (lib/plays/riso/ashley-cole-signature.ts).
// Structural checks, no browser: story shape (4 chapters: live, slow replay, second replay, lesson), narration = public/plays/narration/
// ashley-cole-signature/script.json, 70–90 words ending with the lesson, cue words in order inside their chapter, length 20–45 s; every figure
// through the one drawPlayer() adapter on the shared athlete library; the signature as the lesson describes it (Cole goalside and INSIDE
// Figo through the duel, a standing tackle with the left boot, the ball won); the voice hook; and every chapter drawn through a stub canvas
// at the three card sizes. The loader handles .ts and .json imports.
// usage: node tests/play-film-ashley-cole-signature.cjs
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

const ID='ashley-cole-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
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
assert.ok(/Ashley Cole/.test(text)&&/Figo/.test(text)&&/England/.test(text)&&/Portugal/.test(text)&&/2006/.test(text),'Cole, Figo, England, Portugal and 2006 are narrated');
assert.ok(/Here’s how he did it/.test(text),'the honest "how he did it" framing for the technique replays');
assert.ok(!/Ronaldo/.test(text),'Ronaldo was on the other wing that day (Observer ratings): not narrated');
const last=film.chapters[3].narration;
assert.ok(/Stay close/.test(last)&&/stay on your feet/.test(last)&&/down the line/.test(last),'ends with the lesson (stay close, stay on your feet, show the winger down the line)');
// the look contract: full-sheet framing, the voice hook, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/COLE:AthleteStyle=england\(\{number:3,/.test(src)&&/FIGO:AthleteStyle=portugal\(\{number:7,/.test(src),'Cole wears 3, Figo 7');
assert.ok(/shirt:'paper',trim:R,shorts:\[K,\.9\],socks:'paper'/.test(src)&&/shirt:R,trim:\[K,\.6\],shorts:R,socks:R/.test(src),'England white/navy/white, Portugal all red');
assert.equal(JSON.stringify(film.chapters.map(c=>c.cues.length)),'[5,5,4,4]','cue counts the scenes key their actions to');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=45,`length ${total}s`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MOMENT/.test(src),'sources + why + confirmed/inferred listed at the top');
// the signature: Cole goalside (nearer England's goal, X = 105) and INSIDE (further from the near touchline) all through the duel, so
// the only way open is down the line; a STANDING tackle with the left boot (the one toward the line); the ball ends up with Cole
for(let T=1.6;T<=F.T_CONTACT;T+=.2){const m=F.coleAt(T),f=F.figoAt(T);assert.ok(m[0]>f[0],`Cole goalside at T=${T.toFixed(1)}`);assert.ok(m[1]>f[1]+.3,`Cole inside Figo at T=${T.toFixed(1)}`);
 if(T>2.4&&T<F.T_KNOCK){const d=Math.hypot(m[0]-f[0],m[1]-f[1]);assert.ok(d>1.2&&d<3.2,`stay close, but not too close: ${d.toFixed(2)} m at T=${T.toFixed(1)}`);}}
const lt=F.leftFoot(),rt=F.rightFoot(),d=(p)=>Math.hypot(p[0]-F.BALL_T[0],p[2]-F.BALL_T[1]);
assert.ok(d(lt)<.25&&d(rt)>.5,`the left boot takes the ball (left ${d(lt).toFixed(2)} m, right ${d(rt).toFixed(2)} m)`);
assert.ok(lt[2]<F.LUNGE_AT[1],'the poke reaches toward the touchline (his left)');
assert.ok(F.pelvisY()>.6,`on his feet at the tackle, hips at ${F.pelvisY().toFixed(2)} m (no slide)`);
assert.ok(F.BALL_T[1]>0&&F.BALL_T[1]<8,'the duel is on the near touchline (Cole\'s left wing)');
const b=F.ballAt(F.T_CONTACT);assert.ok(Math.hypot(b[0]-F.BALL_T[0],b[2]-F.BALL_T[1])<.05,'the ball is at the boot at the contact frame');
const fc=F.figoAt(F.T_CONTACT);assert.ok(fc[0]<F.BALL_T[0],'Figo is behind the ball when Cole gets there first');
const br=F.ballAt(F.COLLECT);assert.ok(Math.hypot(br[0]-F.BALL_REST[0],br[2]-F.BALL_REST[1])<.3&&F.BALL_REST[0]<F.BALL_T[0],'the ball is poked up the pitch, away from Figo');
const cc=F.coleAt(F.COLLECT);assert.ok(Math.hypot(cc[0]-F.BALL_REST[0],cc[1]-F.BALL_REST[1])<1,'Cole collects it');
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
