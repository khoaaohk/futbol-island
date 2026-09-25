// Iconic-play film: Gerard Piqué's signature, the calm pass out of defence, shown as "how he played from the back" in Real Madrid 2–6
// Barcelona, La Liga, 2 May 2009 (lib/plays/riso/pique-signature.ts). Structural checks, no browser: story shape (4 chapters: live, slow
// replay, second replay, lesson), narration = public/plays/narration/pique-signature/script.json, 70–90 words ending with the lesson, cue
// words in order inside their chapter, length 20–45 s; every figure through the one drawPlayer() adapter on the shared athlete library; the
// play's contact points (the Madrid pass, Piqué's right boot on the lane before the striker, the calm touch and look, his pass along the
// grass to Xavi); the voice hook; every chapter drawn through a stub canvas at the three card sizes. The loader handles .ts and .json imports.
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

const ID='pique-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
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
assert.ok(/Gerard Piqué/.test(text)&&/Xavi/.test(text)&&/2009/.test(text)&&/six-two/.test(text)&&/even scored/.test(text),'Piqué, Xavi and the sourced 2009 six-two (he scored) are narrated');
assert.ok(/Here’s how he played from the back/.test(text),'honest framing: the move illustrates how he played (brief fallback)');
const last=film.chapters[3].narration;
assert.ok(/take a breath/.test(last)&&/pass it to a teammate/.test(last)&&/Don’t just boot it!$/.test(last),'ends with the lesson (win it, take a breath, pass to a teammate, don’t just boot it)');
assert.ok(/2 May 2009/.test(film.ageNote)&&/2–6/.test(film.ageNote),'the match and date are stated');
// the look contract: full-sheet framing, the voice hook, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming);/.test(src)&&/withTiming\(/.test(src)&&/\],VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:3,/.test(src)&&/number:5,/.test(src)&&/number:6,/.test(src),'Piqué 3, Puyol 5, Xavi 6');
assert.ok(/shirt:B,pattern:'stripes',patternInk:\[R,\.9\]/.test(src)&&/shirt:'paper',trim:K,shorts:'paper',socks:'paper'/.test(src),'Barcelona blue-and-red stripes, Madrid all white');
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
// the play: the Madrid pass off a right boot; Piqué's RIGHT boot takes it on the lane before the striker; a calm touch; the look (head
// turns both ways) before the pass; his right-foot pass rolls ALONG THE GRASS to Xavi's feet (never lofted); Xavi is free
const dist2=(p,q)=>Math.hypot(p[0]-q[0],p[2]-q[1]);
const df=F.passerFeet(F.T_PASS);assert.ok(dist2(df.r,F.PASS_BALL)<.3&&dist2(df.r,F.PASS_BALL)<dist2(df.l,F.PASS_BALL),`the passer's right boot at the pass (${dist2(df.r,F.PASS_BALL).toFixed(2)} m)`);
const b0=F.ballAt(F.T_PASS);assert.ok(Math.hypot(b0[0]-F.PASS_BALL[0],b0[2]-F.PASS_BALL[1])<.05,'the ball is at the passer’s boot at the pass');
const lane=[F.ST_TARGET[0]-F.PASS_BALL[0],F.ST_TARGET[1]-F.PASS_BALL[1]],L=Math.hypot(...lane),ux=[(F.INT_XZ[0]-F.PASS_BALL[0])/L,(F.INT_XZ[1]-F.PASS_BALL[1])/L],along=ux[0]*lane[0]/L+ux[1]*lane[1]/L,off=Math.abs(ux[0]*lane[1]/L-ux[1]*lane[0]/L)*L;
assert.ok(along>.7&&along<1&&off<.05,`the interception is on the pass lane, short of the striker (along ${along.toFixed(2)}, off ${off.toFixed(2)} m)`);
const pf=F.piqueFeet(F.T_INT),d=(p)=>Math.hypot(p[0]-F.INT[0],p[2]-F.INT[2]);
assert.ok(d(pf.r)<.2&&d(pf.l)>.5,`Piqué’s right boot takes the ball (right ${d(pf.r).toFixed(2)} m, left ${d(pf.l).toFixed(2)} m)`);
const bi=F.ballAt(F.T_INT);assert.ok(Math.hypot(bi[0]-F.INT[0],bi[2]-F.INT[2])<.05,'the ball is at Piqué’s boot at the interception');
assert.ok(pf.pelvisY>.7,`Piqué on his feet at the interception (pelvis ${pf.pelvisY.toFixed(2)} m)`);
const st=F.strikerAt(F.T_INT);assert.ok(Math.hypot(st[0]-F.INT_XZ[0],st[1]-F.INT_XZ[1])>1.4,'the striker is beaten to it');
const pt=F.piqueFeet(F.T_TOUCH);assert.ok(dist2(pt.r,F.R1)<.9||dist2(pt.l,F.R1)<.9,`Piqué is at the ball for the calm touch (${Math.min(dist2(pt.r,F.R1),dist2(pt.l,F.R1)).toFixed(2)} m)`);
let lookL=0,lookR=0;for(let T=F.T_TOUCH;T<F.S_START;T+=.05){lookL=Math.max(lookL,F.scanAt(T));lookR=Math.min(lookR,F.scanAt(T));}
assert.ok(lookL>.6&&lookR<-.6,`he looks both ways before passing (${lookL.toFixed(2)}, ${lookR.toFixed(2)})`);
assert.ok(F.T_P2-F.T_INT>3,'no panic: over three seconds between winning it and passing it');
const pp=F.piqueFeet(F.T_P2);assert.ok(dist2(pp.r,F.LB)<.3,`Piqué's right boot strikes the pass (${dist2(pp.r,F.LB).toFixed(2)} m)`);
let hi=0;for(let T=F.T_P2;T<=F.T_RCV;T+=.05)hi=Math.max(hi,F.ballAt(T)[1]);assert.ok(hi<.2,`the pass stays on the grass (max ${hi.toFixed(2)} m)`);
const br=F.ballAt(F.T_RCV);assert.ok(Math.hypot(br[0]-F.XR[0],br[2]-F.XR[1])<.05,'the pass arrives at Xavi');
const xf=F.xaviFeet(F.T_RCV);assert.ok(dist2(xf.r,F.XR)<.9,`Xavi’s feet at the ball (${dist2(xf.r,F.XR).toFixed(2)} m)`);
const xa=F.xaviAt(F.T_RCV),pa=F.piqueAt(F.T_RCV);assert.ok(Math.hypot(xa[0]-F.XR[0],xa[1]-F.XR[1])<Math.hypot(pa[0]-F.XR[0],pa[1]-F.XR[1]),'Xavi is on the far side of the ball from Piqué');
for(const T of [F.T_P2,F.T_RCV]){const s=F.strikerAt(T);assert.ok(Math.hypot(s[0]-xa[0],s[1]-xa[1])>6,'Xavi is free');}
assert.ok(F.xaviAt(F.T_RCV+3)[0]>F.XR[0]+4,'Barcelona away on the attack');
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
