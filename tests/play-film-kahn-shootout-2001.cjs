// Iconic-play film: Oliver Kahn's three shoot-out saves, 2001 Champions League final (lib/plays/riso/kahn-shootout-2001.ts). Structural
// checks, no browser: story shape (3 chapters: live with three kicks, slow replay of the winning save, lesson); the solved saves (each
// kicker's boot on the ball, the ball meets Kahn's glove, every kick was goal-bound, none went in, Carboni's tip onto the bar, the sides);
// narration = public/plays/narration/kahn-shootout-2001/script.json, 70–90 words ending with the lesson, cue words in order and inside
// their chapter before the passage; every figure goes through the one drawPlayer() adapter on the shared athlete library; seeded
// randomness only; when timing.json exists, the film must import it. Also renders every chapter through a stub canvas at three card sizes.
// usage: node tests/play-film-kahn-shootout-2001.cjs
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

const ID='kahn-shootout-2001',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const film=load(file).default;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,3,'live broadcast (three kicks), slow replay of the winning save, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Oliver Kahn/.test(text)&&/Zahovič/.test(text)&&/Carboni/.test(text)&&/Pellegrino/.test(text)&&/Champions League final/.test(text)&&/Milan/.test(text),'keeper, the three kickers, the match and the place are narrated');
assert.ok(!/\b(left|grey|gray|shirt|kit)\b/i.test(text),'unverified details (dive side, keeper kit) are never narrated');
const last=film.chapters[2].narration;
assert.ok(/stay strong and confident/.test(last)&&/one penalty at a time\.$/.test(last),'ends with the lesson (strong and confident, one penalty at a time)');
// the look contract
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/const bayern=.*shirt:\[R,\.9\d?\],shorts:\[R,\.9\d?\],socks:'paper'/.test(src),'Bayern in red shirts, red shorts, white socks');
assert.ok(/const valencia=.*shirt:'paper',shorts:\[K,\.9\d?\],socks:'paper'/.test(src),'Valencia in white shirts, black (navy) shorts, white socks');
assert.ok(/number:1,numberInk:'paper',shade/.test(src),'Kahn wears 1');
// the three saves, solved from the bodies
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const F=load(file).FACTS,[A,Bk,C]=F.KICKS;
assert.equal(JSON.stringify(F.KICKS.map(k=>k.name)),JSON.stringify(['Zahovič','Carboni','Pellegrino']),'the three saves, in order');
assert.equal(JSON.stringify(F.KICKS.map(k=>k.number)),JSON.stringify([8,15,2]),'Zahovič 8, Carboni 15, Pellegrino 2');
assert.equal(JSON.stringify(F.KICKS.map(k=>k.foot)),JSON.stringify(['r','l','r']),'kicking feet (inferred): Zahovič right, Carboni left, Pellegrino right');
F.KICKS.forEach((k,i)=>{
 const toe=F.toeAt(i,0);assert.ok(Math.hypot(toe[0]-F.B0[0],toe[2]-F.B0[2])<.25,`${k.name}: the kicking boot is on the ball at contact (${Math.hypot(toe[0]-F.B0[0],toe[2]-F.B0[2]).toFixed(2)} m)`);
 const sk=F.kahnAt(i,k.tSave),hd=k.hand==='both'?Math.min(d3(sk.lHa,k.H),d3(sk.rHa,k.H)):d3(k.hand==='l'?sk.lHa:sk.rHa,k.H);
 assert.ok(hd<.3,`${k.name}: the ball meets Kahn's glove at the save (${hd.toFixed(2)} m)`);
 const b=F.ballAt(i,k.tSave);assert.ok(d3(b,k.H)<.02,`${k.name}: the ball is at the save point at the save`);
 const u=-F.B0[0]/(k.H[0]-F.B0[0]),y=F.B0[1]+(k.H[1]-F.B0[1])*u,z=F.B0[2]+(k.H[2]-F.B0[2])*u;
 assert.ok(Math.abs(z)<3.66&&y<2.44&&y>0,`${k.name}: the kick was goal-bound (line at z ${z.toFixed(2)}, y ${y.toFixed(2)})`);
 assert.ok(k.tDive<.05&&k.tDive>-.2,`${k.name}: Kahn goes as the ball is struck`);
 const end=F.ballAt(i,k.tSave+2.5);assert.ok(end[0]<-1.5,`${k.name}: no goal — the ball ends up out in front (${end[0].toFixed(2)})`);});
assert.ok(A.H[2]<-.8&&A.side==='r'&&A.H[1]<1.2,'Zahovič: low to Kahn\'s right (−z), Kahn dives right');
assert.ok(C.H[2]>.4&&C.H[2]<2.2&&C.side==='l','Pellegrino: near the middle, a little to Kahn\'s left (+z), Kahn reads it');
const skB=F.kahnAt(1,Bk.tSave);assert.ok(Bk.kind==='tip'&&Bk.side==='l'&&Bk.H[2]<skB.pelvis[2],'Carboni: Kahn dives left but the ball is on his other side ("despite going the wrong way")');
assert.ok(Bk.H[1]>1.6,`Carboni: a high shot (${Bk.H[1].toFixed(2)} m)`);
{let top=0;for(let a=0;a<.4;a+=.01){const p=F.ballAt(1,Bk.tSave+a);if(p[0]>-.3)top=Math.max(top,p[1]);}assert.ok(top>2.3&&top<2.5,`Carboni: the fingertips push it onto the crossbar (${top.toFixed(2)} m)`);}
const S=F.sched();assert.ok(S.cutB>S.t0[0]+A.tSave+.5&&S.cutC>S.t0[1]+Bk.tSave+.8&&S.cutB<S.cutC,'live: each save plays out before the broadcast cuts to the next kick');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=48,`length ${total}s`);
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
console.log(`PASS ${ID}: 3 chapters, ${words} words / ${text.length} chars, ${total}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
