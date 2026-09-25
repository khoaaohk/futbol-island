// Iconic-play film: Emiliano Martínez's 123rd-minute save from Kolo Muani, 2022 World Cup final (lib/plays/riso/martinez-save-2022.ts). Structural
// checks, no browser: story shape (4 chapters: live, slow replay, replay from behind the goal, lesson); the solved save geometry (left leg, low shot
// toward the goal's right, the ball meets the shin, the body covers more goal once he has come out), narration = public/plays/narration/martinez-save-2022/script.json,
// 70–90 words ending with the lesson, cue words are substrings in order and inside their chapter before the passage, length 20–42 s;
// every figure goes through the one drawPlayer() adapter on the shared athlete library; seeded randomness only; when timing.json (the
// voice generator's output) exists, the film must import it (every chapter has its audio file and its seconds cover the clip).
// Also renders every chapter through a stub canvas at the three card sizes so a draw error fails here, not in the card.
// usage: node tests/play-film-martinez-save-2022.cjs
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

const ID='martinez-save-2022',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const film=load(file).default;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, slow replay, behind-the-goal replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Martínez/.test(text)&&/Kolo Muani/.test(text)&&/Otamendi/.test(text)&&/World Cup final/.test(text)&&/left leg/.test(text),'keeper, shooter, the beaten defender, the match and the left leg are narrated');
assert.ok(!/purple|violet|pink|shirt/i.test(text),'the unverified keeper kit colour is never narrated');
assert.ok(!/penalt|yellow card|booked/i.test(text),'kid-appropriate: the shoot-out gamesmanship is not narrated');
const last=film.chapters[3].narration;
assert.ok(/close the angle/.test(last)&&/make yourself big/.test(last)&&/arms and legs wide/.test(last)&&/wide!$/.test(last),'ends with the lesson (close the angle, make yourself big, spread arms and legs)');
// the look contract: full-sheet card-window framing, broadcast cameras (no top-down), the real kits, the voice hook, left foot
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:23/.test(src)&&/number:12/.test(src)&&/number:19/.test(src),'Martínez 23, Kolo Muani 12, Otamendi 19');
assert.ok(/pattern:'stripes'/.test(src)&&/shorts:K,socks:'paper'/.test(src),'Argentina in the stripes, black (navy) shorts, white socks');
assert.ok(/const FRA=.*shirt:\[K,\.9\d?\],shorts:\[K/.test(src),'France in navy shirts and shorts');
assert.ok(/foot:'r'/.test(src),'the shot is struck with the right foot (inferred)');
// the save, solved from the bodies
const F=load(file).FACTS;
assert.ok(Math.abs(F.BLOCK[0]-F.SETP[0])<1.6&&F.BLOCK[2]<F.SETP[1]-.4,'the block point is out to Martínez\'s LEFT (−Z) side of his set spot');
const skB=F.mtzAt(F.T_BLOCK),shin=[0,1,2].map(i=>(skB.lKn[i]+skB.lAn[i]*2)/3),dShin=Math.hypot(shin[0]-F.BLOCK[0],shin[1]-F.BLOCK[1],shin[2]-F.BLOCK[2]);
assert.ok(dShin<.45,`the ball meets his left shin at the block (${dShin.toFixed(2)} m)`);
const rShin=[0,1,2].map(i=>(skB.rKn[i]+skB.rAn[i])/2);assert.ok(Math.hypot(rShin[0]-F.BLOCK[0],rShin[2]-F.BLOCK[2])>dShin+.3,'…not his right');
const b0=F.ballAt(0),kt=F.kmToeAt(0);assert.ok(Math.hypot(b0[0]-kt[0],b0[2]-kt[2])<.25,'Kolo Muani\'s right boot is on the ball at the shot');
const zLine=F.SHOT_FROM[2]+(F.BLOCK[2]-F.SHOT_FROM[2])*F.SHOT_FROM[0]/(F.SHOT_FROM[0]-F.BLOCK[0]);
assert.ok(zLine<0&&zLine>-3.66,`the shot was goal-bound, low to the goal\'s right (−Z) inside the post (${zLine.toFixed(2)})`);
assert.ok(F.ballAt(.1)[1]<.5,'a low shot');
const cov=F.cover(.04),w=cov.hi-cov.lo;assert.ok(w>4.5,`spread and out, his body hides ${w.toFixed(2)} m of the 7.32 m goal`);
assert.ok(F.ballAt(1)[0]>F.BLOCK[0],'the ball rebounds out, away from goal');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=42,`length ${total}s`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src),'sources + confirmed/inferred listed at the top');
// installed voice (optional until generated): the film must import it, files exist and chapter seconds cover each clip
const timing=path.join(dir,'timing.json');
if(fs.existsSync(timing)){const T=JSON.parse(fs.readFileSync(timing,'utf8'));
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio once timing.json exists — import timing.json in ${ID}.ts (see the VOICE note)`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const d=T.chapters?.[i]?.seconds;if(typeof d==='number')assert.ok(ch.seconds>=d-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${d}`);});}
// render every chapter (start, cue beats, passage) through the stub canvas: no draw errors at card sizes, reduced motion included
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});}
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${text.length} chars, ${total}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
