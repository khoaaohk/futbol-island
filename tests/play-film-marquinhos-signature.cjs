// Iconic-play film: Marquinhos's signature steal ("read the pass, steal the ball"), shown as "how he defends" in the Champions League final,
// Paris Saint-Germain 5-0 Inter, 31 May 2025, Munich (lib/plays/riso/marquinhos-signature.ts). Structural checks, no browser: story shape
// (4 chapters: live, slow replay, second replay, lesson), narration = public/plays/narration/marquinhos-signature/script.json, 70-90 words ending
// with the lesson, cue words in order inside their chapter, length 20-45 s; every figure through the one drawPlayer() adapter on the shared
// athlete library; the play's contact points (the Inter pass, Marquinhos's right boot on the lane in front of the striker, his pass upfield);
// he watches the passer before the pass; the voice hook; every chapter drawn through a stub canvas at the three card sizes. The loader
// handles .ts and .json imports.
// usage: node tests/play-film-marquinhos-signature.cjs
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

const ID='marquinhos-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
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
assert.ok(/Marquinhos/.test(text)&&/Munich/.test(text)&&/2025/.test(text)&&/Champions League final/.test(text)&&/Inter/.test(text),'Marquinhos, Munich, the 2025 final and Inter are narrated');
assert.ok(/Here’s how he defends/.test(text),'honest framing: the steal illustrates how he defends (brief fallback)');
assert.ok(/five–nil/.test(text)&&/first Champions League/.test(text),'the sourced facts: 5–0, their first Champions League');
assert.ok(!/Lautaro|Thuram|Barella|Çalhano|right foot|left foot/i.test(text),'no inferred names or feet are narrated');
const last=film.chapters[3].narration;
assert.ok(/Watch the passer’s eyes/.test(last)&&/step in front of the striker to steal it/.test(last),'ends with the lesson (watch the passer’s eyes, step in front of the striker)');
assert.ok(/31 May 2025/.test(film.ageNote),'the match date is stated');
// the look contract: full-sheet framing, the voice hook, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:5,/.test(src),'Marquinhos 5');
assert.ok(/shirt:\[K,\.95\],trim:R,shorts:\[K,\.95\],socks:\[K,\.95\]/.test(src)&&/shirt:Y,trim:K,shorts:Y,socks:Y/.test(src),'PSG all navy (red trim), Inter third kit all yellow');
assert.equal(JSON.stringify(film.chapters.map(c=>c.cues.length)),'[7,5,4,4]','cue counts the scenes key their actions to');
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
// the steal: the passer's right boot strikes the pass; the ball runs down the lane toward the striker; Marquinhos's RIGHT boot takes it on the
// lane before it reaches the striker (he has stepped in front of him); he is on his feet; then his right-foot pass runs on upfield
const dist2=(p,q)=>Math.hypot(p[0]-q[0],p[2]-q[1]);
const df=F.passerFeet(F.T_PASS);assert.ok(dist2(df.r,F.PASS_BALL)<.3&&dist2(df.r,F.PASS_BALL)<dist2(df.l,F.PASS_BALL),`the passer's right boot at the pass (${dist2(df.r,F.PASS_BALL).toFixed(2)} m)`);
const b0=F.ballAt(F.T_PASS);assert.ok(Math.hypot(b0[0]-F.PASS_BALL[0],b0[2]-F.PASS_BALL[1])<.05,'the ball is at the passer’s boot at the pass');
const lane=[F.ST_TARGET[0]-F.PASS_BALL[0],F.ST_TARGET[1]-F.PASS_BALL[1]],L=Math.hypot(...lane),ux=[(F.INT_XZ[0]-F.PASS_BALL[0])/L,(F.INT_XZ[1]-F.PASS_BALL[1])/L],along=ux[0]*lane[0]/L+ux[1]*lane[1]/L,off=Math.abs(ux[0]*lane[1]/L-ux[1]*lane[0]/L)*L;
assert.ok(along>.7&&along<1&&off<.05,`the steal is on the pass lane, short of the striker (along ${along.toFixed(2)}, off ${off.toFixed(2)} m)`);
const mf=F.marqFeet(F.T_INT),d=(p)=>Math.hypot(p[0]-F.INT[0],p[2]-F.INT[2]);
assert.ok(d(mf.r)<.2&&d(mf.l)>.5,`Marquinhos's right boot takes the ball (right ${d(mf.r).toFixed(2)} m, left ${d(mf.l).toFixed(2)} m)`);
const bi=F.ballAt(F.T_INT);assert.ok(Math.hypot(bi[0]-F.INT[0],bi[2]-F.INT[2])<.05,'the ball is at his boot at the steal');
assert.ok(mf.pelvisY>.7,`on his feet at the steal (pelvis ${mf.pelvisY.toFixed(2)} m)`);
const r=F.strikerAt(F.T_INT);assert.ok(Math.hypot(r[0]-F.INT_XZ[0],r[1]-F.INT_XZ[1])>1.4,'the striker is beaten to it');
const m=F.marqAt(-.3),rr=F.strikerAt(-.3);assert.ok(m[0]<rr[0],'before the pass he reads from goal-side of the striker');
assert.ok(F.marqAt(F.T_INT)[0]>F.strikerAt(F.T_INT)[0]-2.5&&Math.hypot(F.INT_XZ[0]-F.PASS_BALL[0],F.INT_XZ[1]-F.PASS_BALL[1])<Math.hypot(r[0]-F.PASS_BALL[0],r[1]-F.PASS_BALL[1]),'he steps in front: the steal is nearer the passer than the striker is');
assert.ok(F.marqAt(-.25)[0]>F.marqAt(-1.5)[0]+.5,'he moves early, before the pass is struck');
const ml=F.marqFeet(F.T_LONG);assert.ok(dist2(ml.r,F.LB)<.3,`his right boot strikes the pass upfield (${dist2(ml.r,F.LB).toFixed(2)} m)`);
const land=F.ballAt(F.T_LAND);assert.ok(land[0]>45,'the pass reaches the team-mate upfield');
const apex=F.ballAt((F.T_LONG+F.T_LAND)/2);assert.ok(apex[1]<2,'the pass is firm and low');
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
