// Iconic-play film: Robert Lewandowski's five goals in nine minutes, Bayern 5–1 Wolfsburg, 22 September 2015 (lib/plays/riso/lewandowski-five-2015.ts).
// Structural checks, no browser: story shape (4 chapters: live montage, slow replay of goal 5, replay of goal 1, lesson), narration =
// public/plays/narration/lewandowski-five-2015/script.json, 70–90 words ending with the lesson, cue words in order inside their chapter;
// one drawPlayer() adapter on the shared athlete library; seeded randomness; the five goals as the accounts give them (minutes, the slide,
// 20 yards, post + save + tap-in, the bounce and volley, Götze's cross and the airborne scissor volley, every kicking boot on the ball,
// every ball inside the frame); when timing.json exists the film must import it. Also renders every chapter through a stub canvas.
// usage: node tests/play-film-lewandowski-five-2015.cjs
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

const ID='lewandowski-five-2015',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live montage, slow replay of goal 5, replay of goal 1, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Wolfsburg/.test(text)&&/Lewandowski/.test(text)&&/Götze/.test(text)&&/Five goals in nine minutes/.test(text),'opponent, scorer, the assist and the feat are narrated');
assert.ok(!/right foot|left foot|green/i.test(text),'unverified details (foot, Wolfsburg kit) are never narrated');
const last=film.chapters[3].narration;
assert.ok(/stay ready/.test(last)&&/right place/.test(last)&&/quick and simple/.test(last),'ends with the lesson (stay ready, right place, quick and simple)');
// the look contract: full-sheet framing, the voice hook, one adapter, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:9,/.test(src),'Lewandowski wears 9');assert.ok(/number:19,/.test(src)&&/number:11,/.test(src),'Götze 19, Douglas Costa 11');
assert.ok(/shirt:R,shorts:R,socks:R/.test(src),'Bayern all red at home');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=46,`length ${total}s`);
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src),'sources + confirmed/inferred listed at the top');
// the five goals as the accounts give them (positions and feet inferred, see the film header)
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
assert.equal(JSON.stringify(F.GOALS.map(g=>g.minute)),'[51,52,55,57,60]','51, 52, 55, 57, 60 minutes');
assert.equal(F.LEW_NUMBER,9);
F.GOALS.forEach((g,gi)=>{
 // every kick: the kicking boot is on the ball at contact, and nearer than the other boot
 g.kicks.forEach((k,ki)=>{const b=g.ballAt(k.at),bt=g.bootAt(ki,k.at),toe=k.foot==='l'?bt.lToe:bt.rToe,other=k.foot==='l'?bt.rToe:bt.lToe;
  assert.ok(d3(toe,b)<.3,`goal ${gi+1} kick ${ki+1}: the ${k.foot} boot is on the ball (${d3(toe,b).toFixed(2)} m)`);assert.ok(d3(toe,b)<d3(other,b),`goal ${gi+1} kick ${ki+1}: kicking boot nearer the ball`);});
 const fin=g.kicks[g.kicks.length-1];assert.equal(fin.who,0,`goal ${gi+1} is finished by Lewandowski`);
 // the ball crosses the line inside the frame and ends in the net
 const P=g.ballAt(g.tIn);assert.ok(Math.abs(P[0])<.05&&Math.abs(P[2])<3.66-.11&&P[1]<2.44-.11&&P[1]>0,`goal ${gi+1} crosses the line inside the goal (${P.map(v=>v.toFixed(2))})`);
 const E=g.ballAt(g.tIn+2);assert.ok(E[0]>.3,`goal ${gi+1} ends in the net`);
 for(let T=fin.at+.02;T<g.tIn;T+=.02)assert.ok(g.ballAt(T)[0]<0,'the shot is still on its way before tIn');});
assert.equal(F.GOALS[0].kicks[1].kind,'slide','goal 1: sliding home from close range');
{const g=F.GOALS[0],c=g.ballAt(g.kicks[1].at);assert.ok(c[0]>-7.5,`goal 1 from about six yards (x ${c[0].toFixed(1)})`);}
assert.ok(/Douglas Costa/.test(F.GOALS[1].actor(2)),'goal 2: Costa\'s assist');
{const g=F.GOALS[1],c=g.ballAt(0);assert.ok(c[0]<-16&&c[0]>-21,`goal 2 from about 20 yards (x ${c[0].toFixed(1)})`);}
{const g=F.GOALS[2];assert.equal(g.kicks.length,3,'goal 3: three attempts');const p=g.ballAt(g.postAt);assert.ok(Math.abs(p[0])<.2&&Math.abs(Math.abs(p[2])-3.66)<.3,'goal 3: the first hits the post');
 const d=g.dives[0],gl=g.gloveAt(d.at),b=g.ballAt(d.at);assert.ok(Math.min(d3(gl.lHa,b),d3(gl.rHa,b))<.35,'goal 3: the follow-up is saved by the keeper\'s glove');}
{const g=F.GOALS[3];let low=9;for(let T=-1;T<0;T+=.02)low=Math.min(low,g.ballAt(T)[1]);assert.ok(low<.15,'goal 4: the cross bounces before the volley');assert.equal(g.kicks[1].kind,'volley');}
{const g=F.GOALS[4];assert.ok(/Götze/.test(g.actor(2)),'goal 5: Götze\'s cross');assert.equal(g.kicks[1].kind,'scissor','goal 5: the scissor-kick volley');
 const b=g.bootAt(1,0);assert.ok(b.air>.3,`goal 5: both feet off the ground at contact (air ${b.air.toFixed(2)} m)`);}
// installed voice (optional until generated): the film must import it, files exist and chapter seconds cover each clip
const timing=path.join(dir,'timing.json');
if(fs.existsSync(timing)){const T=JSON.parse(fs.readFileSync(timing,'utf8')),list=T.chapters??Object.values(T);
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio once timing.json exists — import timing.json in ${ID}.ts (see the VOICE note)`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const d=list[i]?.duration??list[i]?.seconds;if(typeof d==='number')assert.ok(ch.seconds>=d-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${d}`);});}
// render every chapter (start, cue beats, passage) through the stub canvas: no draw errors at card sizes, reduced motion included
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.1,.2,.3,.35,.45,.5,.6,.7,.8,.9,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});}
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${text.length} chars, ${total}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
