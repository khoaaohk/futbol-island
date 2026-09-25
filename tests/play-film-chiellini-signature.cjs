// Iconic-play film: Giorgio Chiellini's signature block, shown through his block of Raheem Sterling's pass in the 96th minute of the
// UEFA Euro 2020 final, Italy v England, Wembley, 11 July 2021 (lib/plays/riso/chiellini-signature.ts). Structural checks, no browser:
// story shape (4 chapters: live, slow replay, second replay, lesson), narration = public/plays/narration/chiellini-signature/script.json,
// 70–90 words ending with the lesson, cue words in order inside their chapter, length 20–45 s; every figure through the one drawPlayer()
// adapter on the shared athlete library; the sourced facts (Sterling in from the left, into the box, the pass for Kane in the middle,
// blocked by Chiellini, behind for a corner); a clean moment (no shirt-pull, no foul); the voice hook; and every chapter drawn through a
// stub canvas at the three card sizes. The loader handles .ts and .json imports.
// usage: node tests/play-film-chiellini-signature.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{module:m,exports:m.exports,Math,WeakMap,Map,DOMMatrix:globalThis.DOMMatrix??StubMatrix,DOMPoint:globalThis.DOMPoint,Path2D:StubPath,document:{createElement:()=>stubCanvas()},require:id=>{const base=path.resolve(path.dirname(file),id);return load([base+'.ts',base].find(fs.existsSync));}});
 return m.exports;}
// minimal canvas stubs: enough for the engine to run story.draw end to end (no pixels)
function StubPath(){this.ops=0;}Object.assign(StubPath.prototype,{moveTo(){},ellipse(){},lineTo(){},arc(){},rect(){},closePath(){},addPath(){},bezierCurveTo(){},quadraticCurveTo(){}});
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

const ID='chiellini-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
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
assert.ok(/Giorgio Chiellini/.test(text)&&/Sterling/.test(text)&&/Henderson/.test(text)&&/Kane/.test(text)&&/Euro 2020 final/.test(text)&&/Wembley/.test(text)&&/extra time/.test(text),'Chiellini, Sterling, Henderson, Kane and the Euro 2020 final are narrated');
assert.ok(/on the left/.test(text)&&/into the box/.test(text)&&/Corner/.test(text)&&/Blocked/.test(text),'the sourced beats: in from the left, into the box, blocked, corner');
assert.ok(!/shirt|pull|foul|slide|sliding|Saka/.test(text),'a clean moment: no shirt-pull, no foul, no invented slide');
const last=film.chapters[3].narration;
assert.ok(/teamwork/.test(last)&&/talk to your partner/.test(last)&&/cover each other/.test(last),'ends with the lesson (talk to your partner, cover each other)');
assert.ok(/11 July 2021/.test(film.ageNote)&&/96th minute/.test(film.ageNote),'the match date and minute are stated');
// the look contract: full-sheet framing, the voice hook, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:3,/.test(src)&&/number:19,/.test(src)&&/number:10,/.test(src)&&/number:9,/.test(src)&&/number:8,/.test(src),'Chiellini 3, Bonucci 19, Sterling 10, Kane 9, Henderson 8');
assert.ok(/shirt:\[B,\.95\],shorts:\[K,\.9\],socks:\[B,\.95\]/.test(src)&&/shirt:'paper',shorts:'paper',socks:'paper'/.test(src),'Italy blue/dark blue/blue, England all white');
assert.equal(JSON.stringify(film.chapters.map(c=>c.cues.length)),'[7,5,4,5]','cue counts the scenes key their actions to');
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
// the moment as the accounts describe it: Sterling (England attacking toward X=0, their left = the near side, Z < 34) passes from inside the
// box toward Kane in the middle; the pass meets Chiellini, then goes behind the goal line wide of the posts (a corner)
const inBox=([x,z])=>x>0&&x<16.5&&z>13.84&&z<54.16;
assert.ok(inBox(F.PASS_BALL)&&F.PASS_BALL[1]<30.34,`Sterling passes from inside the box, on England's left (${F.PASS_BALL})`);
assert.ok(inBox(F.KANE_SPOT)&&F.KANE_SPOT[1]>30.34&&F.KANE_SPOT[1]<37.66,'the pass is aimed at Kane in the middle');
const sf=F.sterlingFeet(),dp=(p)=>Math.hypot(p[0]-F.PASS_BALL[0],p[2]-F.PASS_BALL[1]);
assert.ok(dp(sf.r)<.3&&dp(sf.r)<dp(sf.l),`Sterling's passing boot is at the ball (right ${dp(sf.r).toFixed(2)} m, left ${dp(sf.l).toFixed(2)} m)`);
const b0=F.ballAt(F.T_PASS);assert.ok(Math.hypot(b0[0]-F.PASS_BALL[0],b0[2]-F.PASS_BALL[1])<.05,'the ball is at Sterling’s boot at the pass');
const lt=F.leftFoot(),rt=F.rightFoot(),d=(p)=>Math.hypot(p[0]-F.BLOCK[0],p[2]-F.BLOCK[2]);
assert.ok(d(lt)<.2&&d(rt)>.5,`Chiellini’s left boot meets the pass (left ${d(lt).toFixed(2)} m, right ${d(rt).toFixed(2)} m)`);
const bb=F.ballAt(F.T_BLOCK);assert.ok(Math.hypot(bb[0]-F.BLOCK[0],bb[2]-F.BLOCK[2])<.05,'the ball is at Chiellini’s boot at the block');
assert.ok(F.pelvisY()>.6,`Chiellini blocks on his feet (a stretch, not a slide; pelvis ${F.pelvisY().toFixed(2)} m)`);
assert.ok(rt[1]<.12,'his standing boot is planted on the grass');
assert.ok(F.OUT_AT[0]===0&&(F.OUT_AT[1]<30.34-.5||F.OUT_AT[1]>37.66+.5),`deflected behind, wide of the posts: a corner (z ${F.OUT_AT[1].toFixed(2)})`);
const br=F.ballAt(F.T_BLOCK+3);assert.ok(br[0]<0,'the ball ends behind Italy’s goal line');
// teamwork: at the pass Bonucci is out at Sterling while Chiellini covers the lane toward Kane (between the ball and Kane)
const bo=F.bonucciAt(F.T_PASS),st=F.sterlingAt(F.T_PASS),ch=F.chielliniAt(F.T_PASS);
assert.ok(Math.hypot(bo[0]-st[0],bo[1]-st[1])<3,`Bonucci is out at Sterling (${Math.hypot(bo[0]-st[0],bo[1]-st[1]).toFixed(2)} m)`);
assert.ok(ch[1]>F.PASS_BALL[1]&&ch[1]<F.KANE_SPOT[1],'Chiellini covers the middle, between the ball and Kane');
for(let T=-3;T<F.T_BLOCK+2;T+=.25){const a=F.chielliniAt(T),b=F.sterlingAt(T),c=F.bonucciAt(T);assert.ok(Math.hypot(a[0]-b[0],a[1]-b[1])>1.2&&Math.hypot(a[0]-c[0],a[1]-c[1])>1.2&&Math.hypot(b[0]-c[0],b[1]-c[1])>1.1,`no two heroes overlap at T=${T.toFixed(2)}`);}
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
