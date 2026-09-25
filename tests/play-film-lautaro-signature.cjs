// Iconic-play film: Lautaro Martínez, signature "the swivel-and-shoot finish" (lib/plays/riso/lautaro-signature.ts): his Copa América 2024
// final winner v Colombia plus a lesson demonstration of the swivel. Structural checks, no browser:
// story shape (4 chapters: live, slow replay of the run and shot, behind the goal, lesson), narration = script.json,
// 70–90 words ending with the lesson, cue words are substrings in order and inside their chapter before the passage, length 20–42 s;
// every figure goes through the one drawPlayer() adapter on the shared athlete library; seeded randomness only; when timing.json (the
// voice generator's output) exists, the film must import it (every chapter has its audio file and its seconds cover the clip).
// Also renders every chapter through a stub canvas at the three card sizes so a draw error fails here, not in the card.
// usage: node tests/play-film-lautaro-signature.cjs
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

const ID='lautaro-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, slow replay, behind the goal, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Lautaro/.test(text)&&/Paredes/.test(text)&&/Lo Celso/.test(text)&&/Cuesta/.test(text)&&/Vargas/.test(text),'the scorer, the build-up, the defender and the keeper are narrated');
assert.ok(/Copa América final/.test(text)&&/112th/.test(text)&&/Miami/.test(text),'the occasion, minute and place');
assert.ok(!/shorts|socks|right foot|left foot|top corner|near post|far post|swivel/i.test(text),'unverified details (foot, corner, kit) are not narrated, and the goal is not called a swivel');
const last=film.chapters[3].narration;
assert.ok(/turn/.test(last)&&/shoot before the defender can block/.test(last),'ends with the lesson (turn quickly, shoot before the defender can block)');
// cue gotcha: Kokoro splits contractions / hyphens, and withTiming matches a cue by its FIRST word in order
for(const ch of film.chapters)for(const c of ch.cues){const w=c.words.split(/\s+/)[0];assert.ok(!/['’-]/.test(w),`cue "${c.words}" starts with a plain word`);}
for(const ch of film.chapters){const toks=ch.narration.split(/\s+/).map(w=>w.toLowerCase().replace(/[^a-z0-9]/g,''));let from=0;
 for(const c of ch.cues){const first=c.words.split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g,''),k=ch.narration.slice(0).split(/\s+/).length;void k;
  const pos=ch.narration.indexOf(c.words),wi=ch.narration.slice(0,pos).split(/\s+/).filter(Boolean).length,hit=toks.indexOf(first,from);
  assert.equal(hit,wi,`cue "${c.words}": first-word matching lands on the cue itself (word ${hit} vs ${wi})`);from=hit+1;}}
// the look contract: full-sheet framing, the voice hook, the real kits, the number
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:22,/.test(src),'Lautaro wears 22');
assert.ok(/pattern:'stripes'/.test(src)&&/const COL=.*shirt:\[Y,\.95\],shorts:\[B,\.85\],socks:\[R,\.9\]/.test(src),'Argentina in stripes, Colombia yellow / blue / orange-red');
assert.ok(/INFERRED[\s\S]*WHICH FOOT/.test(src)&&/HONEST NOTE/.test(src),'the foot is marked inferred and the swivel honesty note is in the header');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=42,`length ${total}s`);
// the choreography: interception in midfield, the through ball reaches him in the box's channel, his boot meets the ball, the shot is in
const toe=F.rightToeAt(F.SHOT),sf=F.SHOT_FROM,gap=Math.hypot(toe[0]-sf[0],toe[2]-sf[2]);assert.ok(gap<.3,`right boot at the ball on the shot (${gap.toFixed(2)} m)`);
const bi=F.ballAt(F.T_INT);assert.ok(bi[0]>50&&bi[0]<62,`interception in midfield (X ${bi[0].toFixed(1)})`);
const lc=F.posOf('Lo Celso',F.T_TB),bt=F.ballAt(F.T_TB);assert.ok(Math.hypot(lc[0]-bt[0],lc[1]-bt[2])<1,'the through ball leaves Lo Celso');
const l0=F.posOf('Lautaro',0),r0=F.ballAt(0);assert.ok(Math.hypot(l0[0]-r0[0],l0[1]-r0[2])<1,'the through ball reaches Lautaro');
assert.ok(sf[0]>88.5&&Math.abs(sf[2])<20.16,'the shot is from inside the box');
const cu=F.posOf('Cuesta',F.SHOT),lau=F.posOf('Lautaro',F.SHOT);assert.ok(Math.hypot(cu[0]-lau[0],cu[1]-lau[1])<2.5&&cu[0]<lau[0],'Cuesta is close but behind him at the shot');
const net=F.ballAt(F.IN_NET+.01);assert.ok(net[0]>105&&Math.abs(net[2])<3.66&&net[1]<2.44,'the shot ends in the net');
// the lesson demo: he turns from back-to-goal to facing the goal, and his right boot is at the ball on the shot
const D=F.demo,y0=D.yawAt(-1),y1=D.yawAt(D.DSHOT);assert.ok(Math.cos(y0)<-.9&&Math.cos(y1)>.8,'the demo swivel: back to goal → facing goal');
const dt=D.rightToeAt(D.DSHOT),dg=Math.hypot(dt[0]-D.D_SHOT_FROM[0],dt[2]-D.D_SHOT_FROM[2]);assert.ok(dg<.35,`demo right boot at the ball (${dg.toFixed(2)} m)`);
const dn=D.ballAt(D.DSHOT+.33);assert.ok(dn[0]>105&&Math.abs(dn[2])<3.66,'the demo shot goes in');
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
