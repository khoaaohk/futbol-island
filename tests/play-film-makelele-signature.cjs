// Iconic-play film: Claude Makélélé's signature, the steal in front of the defence (the screening holding midfielder), shown as "how he did
// it" in the setting of the 2006 World Cup final, Italy v France, Berlin (lib/plays/riso/makelele-signature.ts). Structural checks, no
// browser: story shape (4 chapters: live, slow replay, second replay, lesson), narration = public/plays/narration/makelele-signature/script.json,
// 70–90 words ending with the lesson, cue words in order inside their chapter, length 20–45 s; every figure through the one drawPlayer()
// adapter on the shared athlete library; honesty (no invented minute or scoreline for the move); the geometry of the signature (he stays
// between the ball and his goal and in front of Totti, moves before the pass, his right boot meets it on the lane in front of Totti, on his
// feet, then a simple short pass to Vieira); the voice hook; and every chapter drawn through a stub canvas at the three card sizes.
// The loader handles .ts and .json imports.
// usage: node tests/play-film-makelele-signature.cjs
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

const ID='makelele-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
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
assert.ok(/Claude Makélélé/.test(text)&&/Berlin/.test(text)&&/2006/.test(text)&&/World Cup final/.test(text)&&/Totti/.test(text)&&/Vieira/.test(text),'Makélélé, Berlin, 2006, the final, Totti and Vieira are narrated');
assert.ok(/Here’s how Claude Makélélé played/.test(text),'honest framing: how he did it, not a logged moment');
assert.ok(!/red card|sent off|head-?butt|Zidane/i.test(text),'kid-friendly: the sending-off is not narrated');
assert.ok(!/minute|\d+\s*[–-]\s*\d+|scores|penalt|won the/i.test(text),'no invented minute or scoreline for the move');
const last=film.chapters[3].narration;
assert.ok(/Stay between the ball and your goal/.test(last)&&/pass it simply\.$/.test(last),'ends with the lesson (stay between the ball and your goal, pass it simply)');
assert.ok(/9 July 2006/.test(film.ageNote)&&/How he played/.test(film.ageNote)&&/Berlin/.test(film.ageNote),'the match date is stated, and that it is how he played');
// the look contract: full-sheet framing, the voice hook, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/MAKELELE:AthleteStyle=france\(DARK,\{number:6,/.test(src)&&/VIEIRA:AthleteStyle=france\(DARK,\{number:4,/.test(src)&&/TOTTI:AthleteStyle=italy\(LIGHT,\{number:10,/.test(src)&&/number:16,/.test(src)&&/number:15,/.test(src)&&/number:5,/.test(src),'Makélélé 6, Vieira 4, Totti 10, Barthez 16, Thuram 15, Gallas 5');
assert.ok(/shirt:B,trim:'paper',shorts:'paper',socks:B/.test(src)&&/shirt:'paper',trim:\[B,\.6\],shorts:'paper',socks:'paper'/.test(src),'Italy blue/white/blue, France all white');
assert.ok((src.match(/italy\([^)]*number:/g)||[]).length===1,'only Totti carries an Italy number (the rest of the move is an illustration)');
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
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MOMENT/.test(src),'sources, confirmed/inferred and why this moment, at the top');
// the signature: Italy attack toward France's goal (X=0); before the pass Makélélé is on the line from the ball to his goal and in front of
// Totti; he moves before it is struck; his right boot meets it on the lane, in front of Totti; on his feet; then a simple short pass
const d2=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const pf=F.passerFoot();assert.ok(d2([pf[0],pf[2]],F.P0)<.3,`the passer's right boot is at the ball (${d2([pf[0],pf[2]],F.P0).toFixed(2)} m)`);
assert.ok(F.R[0]<F.P0[0],'Italy pass toward France’s goal');
const off=(p,a,b)=>((p[0]-a[0])*(b[1]-a[1])-(p[1]-a[1])*(b[0]-a[0]))/d2(a,b);
for(const T of [-2.5,-1.5,-.5,0]){const m=F.makAt(T),b=F.ballAt(T),bb=[b[0],b[2]],tt=F.tottiAt(T);
 assert.ok(Math.abs(off(m,bb,F.GOAL_C))<2.2,`T=${T}: Makélélé on the line from the ball to his goal (${off(m,bb,F.GOAL_C).toFixed(2)} m off)`);
 assert.ok(m[0]<bb[0]&&m[0]>tt[0],`T=${T}: Makélélé between the ball and Totti (x ${m[0].toFixed(1)} between ${tt[0].toFixed(1)} and ${bb[0].toFixed(1)})`);}
const moved=d2(F.makAt(-4),F.makAt(F.T_READ));assert.ok(F.T_READ<0&&moved>1.5,`Makélélé shuffles across before the pass (${moved.toFixed(2)} m)`);
const b0=F.ballAt(F.T_INT);assert.ok(Math.hypot(b0[0]-F.INTERCEPT[0],b0[2]-F.INTERCEPT[2])<.05,'the ball is at his boot at the interception');
const rt=F.rightFoot(),lt=F.leftFoot(),d=(p)=>Math.hypot(p[0]-F.INTERCEPT[0],p[2]-F.INTERCEPT[2]);
assert.ok(d(rt)<.2&&d(lt)>.4,`his right boot meets the pass (right ${d(rt).toFixed(2)} m, left ${d(lt).toFixed(2)} m)`);
assert.ok(F.pelvisY()>.7,`on his feet at the interception, not on the grass (pelvis ${F.pelvisY().toFixed(2)} m)`);
assert.ok(lt[1]<.12,'his standing boot is planted on the grass');
const lane=off([F.INTERCEPT[0],F.INTERCEPT[2]],F.P0,F.R);assert.ok(Math.abs(lane)<.05,'the interception is on the pass lane');
const fw=F.tottiAt(F.T_INT);assert.ok(d2(fw,F.P0)>d2([F.INTERCEPT[0],F.INTERCEPT[2]],F.P0)+1,'he gets there in front of Totti');
for(let T=0;T<=F.T_INT+2;T+=.1){const b=F.ballAt(T),f=F.tottiAt(T);assert.ok(Math.hypot(b[0]-f[0],b[2]-f[1])>1,`Totti never gets the ball (T=${T.toFixed(1)})`);}
const pp=F.passFoot();assert.ok(d2([pp[0],pp[2]],F.BALL2)<.3,`his right boot at the ball for the simple pass (${d2([pp[0],pp[2]],F.BALL2).toFixed(2)} m)`);
const bj=F.ballAt(F.T_P2+1.05),plen=d2(F.BALL2,F.J);assert.ok(d2([bj[0],bj[2]],F.J)<1&&plen<12,`his short pass (${plen.toFixed(1)} m) reaches Vieira`);
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
