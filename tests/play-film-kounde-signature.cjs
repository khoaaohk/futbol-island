// Iconic-play film: Jules Koundé's signature recovery sprint and tackle, France v Belgium, Euro 2024 (lib/plays/riso/kounde-signature.ts).
// Structural checks, no browser: story shape (4 chapters: live, slow replay, second replay, lesson), narration = public/plays/narration/
// kounde-signature/script.json, 70–90 words ending with the lesson, cue words in order inside their chapter and never starting with a
// contraction or hyphenated word, length 20–45 s; every figure through the one drawPlayer() adapter on the shared athlete library; the
// signature as the lesson teaches it (beaten, sprints back, draws level on the inside, tackles FROM THE SIDE with the boot nearer the ball,
// ball out of play); the voice hook; and every chapter drawn through a stub canvas at the three card sizes. The loader handles .ts and .json.
// usage: node tests/play-film-kounde-signature.cjs
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

const ID='kounde-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
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
assert.ok(/Jules Koundé/.test(text)&&/Doku/.test(text)&&/France/.test(text)&&/Belgium/.test(text),'Koundé, Doku, France and Belgium are narrated');
assert.ok(/Here is how/.test(text),'honest "how he did it" framing (no invented minute or specific tackle)');
assert.ok(!/minute|goal!/i.test(text),'no invented minute or scoreline');
const last=film.chapters[3].narration;
assert.ok(/Never stop chasing/.test(last)&&/Sprint back/.test(last)&&/from the side, not from behind/.test(last),'ends with the lesson (never stop chasing, sprint back, from the side not from behind)');
// the look contract: full-sheet framing, the voice hook, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:5,/.test(src)&&/number:22,/.test(src)&&/number:16,/.test(src),'Koundé 5, Doku 22, Maignan 16');
assert.ok(/shirt:'paper',trim:B,shorts:B,socks:'paper'/.test(src)&&/shirt:R,trim:K,shorts:K,socks:R/.test(src),'France in white/blue/white, Belgium in red/black/red');
assert.equal(JSON.stringify(film.chapters.map(c=>c.cues.length)),'[6,6,6,5]','cue counts the scenes key their actions to');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  const first=c.words.split(/\s+/)[0];assert.ok(!/['’-]/.test(first),`ch${i+1} cue "${c.words}" starts with a plain word (Kokoro splits contractions/hyphens)`);
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=45,`length ${total}s`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src),'sources + confirmed/inferred listed at the top');
// the signature as the lesson teaches it
const dk0=F.dokuAt(.8),kd0=F.koundeAt(.8);assert.ok(dk0[0]<kd0[0],`Doku is past him early on (Doku x ${dk0[0].toFixed(1)} < Koundé x ${kd0[0].toFixed(1)})`);
let caught=false;for(let T=0;T<=F.T_SLIDE;T+=.1){const d=F.dokuAt(T),k=F.koundeAt(T);assert.ok(k[1]>d[1],`Koundé stays on the inside (T=${T.toFixed(1)})`);}
{const d=F.dokuAt(F.T_SLIDE-.05),k=F.koundeAt(F.T_SLIDE-.05);caught=Math.abs(k[0]-d[0])<1.5&&k[1]-d[1]<3.5;
 assert.ok(caught,`level with Doku, alongside, as he slides (dx ${(k[0]-d[0]).toFixed(2)} m, gap ${(k[1]-d[1]).toFixed(2)} m)`);}
const pel=F.pelvis(),dc=F.dokuAt(F.T_CONTACT-.01);
assert.ok(pel[0]<=dc[0]+.2,`from the side, not from behind: Koundé's hips are level with or ahead of Doku at contact (${pel[0].toFixed(2)} vs ${dc[0].toFixed(2)})`);
assert.ok(pel[2]>dc[1],'Koundé comes from the inside (the far side of Doku from the touchline)');
const lf=F.leftFoot(),rf=F.rightFoot(),d=(p)=>Math.hypot(p[0]-F.BALL_T[0],p[2]-F.BALL_T[1]);
assert.ok(d(lf)<.25&&d(rf)>.5,`the boot nearer the ball (left) takes it (left ${d(lf).toFixed(2)} m, right ${d(rf).toFixed(2)} m)`);
assert.ok(lf[1]<.22,`the boot is down at the ball: a slide (${lf[1].toFixed(2)} m)`);
const b=F.ballAt(F.T_CONTACT);assert.ok(Math.hypot(b[0]-F.BALL_T[0],b[2]-F.BALL_T[1])<.05,'the ball is at the boot at the contact frame');
assert.ok(F.BALL_T[0]<dc[0],'the ball is ahead of Doku when the boot reaches it');
const bo=F.ballAt(F.T_CONTACT+2.4);assert.ok(bo[2]<0,'the ball rolls out of play over the near touchline');
assert.ok(F.BALL_T[0]>16.5,'the tackle is outside the area (no penalty risk)');
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
