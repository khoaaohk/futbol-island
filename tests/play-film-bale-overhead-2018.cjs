// Iconic-play film: Gareth Bale's overhead kick, Champions League final, Kyiv, 26 May 2018 (lib/plays/riso/bale-overhead-2018.ts). Structural + solved-geometry checks, no browser; every chapter renders through a stub canvas at card sizes.
// usage: node tests/play-film-bale-overhead-2018.cjs
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
const PLAYER='Gareth Bale';
const ID=process.env.__ID__||'bale-overhead-2018',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, two replay angles, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(words>=60&&words<=100,`narration ${words} words (60–100)`);
assert.ok(!/\b(yellow card|red card|booked|foul|fouls|suspended|injur\w*|blunder|mistake|error)\b/i.test(text),'kid-friendly: no bookings, fouls, injuries or blunders narrated');
const lessonSrc=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'))[PLAYER];
assert.ok(lessonSrc,'card exists in iconicPlays.json');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(/^[A-Za-z0-9]+(\s|$)/.test(c.words),`ch${i+1} cue "${c.words}" starts with a plain word (Kokoro)`);
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=25&&total<=55,`length ${total}s`);
assert.ok(/from '\.\/athlete'/.test(src)||/from '\.\/broadcast-pitch'/.test(src),'uses the shared athlete library (directly or through broadcast-pitch.ts)');
assert.ok(!/drawAthlete\(/.test(src),'every figure goes through the one drawPlayer adapter (broadcast-pitch.ts)');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(!/\.safe\b/.test(src),'full-sheet framing: never sheet.safe');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src),'sources + confirmed/inferred listed at the top');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src),'VOICE timing hook passed into withTiming');
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]),d2=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
// timing: every cue's first word must be a recorded token (else withTiming silently falls back)
const timing=path.join(dir,'timing.json');
if(fs.existsSync(timing)){const T=JSON.parse(fs.readFileSync(timing,'utf8'));const norm=w=>w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio once timing.json exists — import timing.json in ${ID}.ts`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const d=T.chapters?.[i]?.seconds;if(typeof d==='number')assert.ok(ch.seconds>=d-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${d}`);
  const toks=T.chapters[i].words.map(w=>norm(w.w));for(const c of ch.cues){const first=norm(c.words.split(/\s+/)[0]);assert.ok(toks.includes(first),`ch${i+1} cue "${c.words}" first word is a recorded token`);
   assert.ok(T.chapters[i].words.some(w=>Math.abs(w.at-c.at)<1e-6),`ch${i+1} cue "${c.words}" is timed from the voice (${c.at})`);}});}
// the match, the lesson and the goal as the accounts describe it
assert.ok(/Kyiv/.test(text)&&/2018/.test(text)&&/Champions League final/.test(text)&&/Liverpool/.test(text),'the match and date are narrated');
assert.ok(/Marcelo crosses from the left/.test(text)&&/left foot/.test(text)&&/top corner/.test(text),'crosser + side, the left foot, the top corner');
assert.ok(/be brave when the ball is in the air, and keep your eyes on it as you kick/.test(film.chapters[3].narration),'ends with the iconicPlays.json lesson');
assert.ok(/brave when the ball is in the air and keep your eyes on it as you kick/i.test(lessonSrc.lesson),'lesson source still matches');
assert.ok(!/Karius/.test(text),'the keeper is never named (no blame narrated)');
assert.ok(/number:11,/.test(src)||/rm\(11,/.test(src),'Bale 11');assert.ok(/rm\(12,/.test(src)&&/lfc\(66,/.test(src)&&/rm\(14,/.test(src),'Marcelo 12, Alexander-Arnold 66, Casemiro 14');
assert.ok(/shirt:'paper',shorts:'paper',socks:'paper'/.test(src)&&/shirt:R,shorts:R,socks:R/.test(src),'Madrid all white, Liverpool all red');
assert.equal(F.kickFoot,'l');assert.equal(F.crossFoot,'r');
assert.ok(F.P0[2]<-15&&F.P0[0]>-30,`the cross comes from Madrid's LEFT (z ${F.P0[2]})`);
{const m=F.marceloContact();assert.ok(d3(m.rToe,F.P0)<.4,`Marcelo's RIGHT boot at the ball for the cross (${d3(m.rToe,F.P0).toFixed(2)} m)`);assert.ok(d3(m.rToe,F.P0)<d3(m.lToe,F.P0),'right boot nearer');}
{const c=F.baleContact();assert.ok(d3(c.lLaces,F.PC)<.2,`Bale's LEFT laces on the ball at contact (${d3(c.lLaces,F.PC).toFixed(2)} m)`);assert.ok(d3(c.lToe,F.PC)<d3(c.rToe,F.PC),'left boot nearer the ball than the right');
 assert.ok(c.air>.3,`in the air at contact (${c.air.toFixed(2)} m)`);assert.ok(c.head[1]<c.pelvis[1]+.25,'body tipped back near horizontal (overhead)');
 const face=[Math.cos(c.yaw),-Math.sin(c.yaw)];assert.ok(face[0]<-.7,`back to goal: he faces out of the box (facing x ${face[0].toFixed(2)})`);
 assert.ok(F.PC[1]>1.5&&F.PC[1]<2.6,`contact above head height (${F.PC[1].toFixed(2)} m)`);assert.ok(F.PC[0]>-13.5&&F.PC[0]<-10&&Math.abs(F.PC[2])<3,'around the penalty spot');}
let apex=0;for(let T=0;T<F.TC;T+=.02)apex=Math.max(apex,F.ballAt(T)[1]);assert.ok(apex>3&&apex<7,`a looping cross (apex ${apex.toFixed(1)} m)`);
assert.ok(d3(F.ballAt(F.TC-1e-4),F.PC)<.05,'the cross arrives on his boot');
const g=F.ballAt(F.TG);assert.ok(Math.abs(g[0])<.05&&g[2]<-2&&g[2]>-3.66+.11&&g[1]>1.8&&g[1]<2.44-.11,`TOP LEFT corner, under the bar (z ${g[2].toFixed(2)}, y ${g[1].toFixed(2)})`);
for(let T=F.TC;T<=F.TG+.1;T+=.02){const k=F.karius(T),b=F.ballAt(T);assert.ok(d3(k.lHa,b)>.3&&d3(k.rHa,b)>.3,`Karius never reaches it (τ ${T.toFixed(2)})`);}
{const c0=F.casemiroAt(-3.6);assert.ok(c0[0]<-35,'Casemiro plays the chip from deep');const t0=F.taaAt(-.2);assert.ok(d2(t0,[F.P0[0],F.P0[2]])<3,'Alexander-Arnold closes Marcelo');}
// render every chapter (start, cue beats, passage) through the stub canvas: no draw errors at card sizes, reduced motion included
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});
 for(let k=0;k<6;k++)film.touch?.(acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0}),0,0,k*.15,7);}
console.log(`PASS ${ID}: 4 chapters, ${words} words, ${total.toFixed(1)}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
