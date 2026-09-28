// Iconic-play film: Park Ji-sung's winner v Portugal, World Cup, Incheon, 14 June 2002 (lib/plays/riso/park-portugal-2002.ts). Structural + solved-geometry checks, no browser; every chapter renders through a stub canvas at card sizes.
// usage: node tests/play-film-park-portugal-2002.cjs
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
const PLAYER='Park Ji-sung';
const ID=process.env.__ID__||'park-portugal-2002',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
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
assert.ok(/Incheon/.test(text)&&/2002/.test(text)&&/World Cup/.test(text)&&/Portugal/.test(text),'the match and date are narrated');
assert.ok(/Lee Young-pyo crosses from the left/.test(text)&&/on his chest/.test(text)&&/flick/.test(text)&&/left foot volley/.test(text)&&/keeper's legs/.test(text),'crosser + side, chest, flick, left foot, through the legs');
assert.ok(/control the ball with your chest, then shoot before the defender can block/.test(film.chapters[3].narration),'ends with the iconicPlays.json lesson');
assert.ok(/Control the ball with your chest, then shoot before the defender can block/i.test(lessonSrc.lesson),'lesson source still matches');
assert.ok(!/sent off|nine/.test(text),'no send-offs narrated');
assert.ok(/kor\(21,/.test(src)&&/kor\(10,/.test(src)&&/por\(11,/.test(src)&&/number:1,/.test(src),'Park 21, Lee 10, Conceição 11, Baía 1');
assert.ok(/shirt:'paper',shorts:R,socks:'paper'/.test(src)&&/shirt:R,shorts:G,socks:R/.test(src),'Korea white/red/white, Portugal red/green/red');
assert.equal(F.shotFoot,'l');
assert.ok(F.P0[2]<-15,`the cross comes from Korea's LEFT (z ${F.P0[2]})`);
{const l=F.leeContact();assert.ok(d3(l.lToe,F.P0)<.4,`Lee's boot at the ball (${d3(l.lToe,F.P0).toFixed(2)} m)`);}
{const p=F.park(F.TC);assert.ok(d3(p.chest,F.PCH)<.3,`ball on Park's chest at the trap (${d3(p.chest,F.PCH).toFixed(2)} m)`);assert.ok(F.PCH[1]>1.1&&F.PCH[1]<1.6,'chest height');
 assert.ok(F.PCH[2]>3&&F.PCH[0]>-16.5&&F.PCH[0]<-6,`received on the RIGHT side of the box (z ${F.PCH[2].toFixed(1)})`);}
assert.ok(d3(F.ballAt(F.TC-1e-4),F.PCH)<.05,'the cross arrives at his chest');
{const p=F.park(F.TF);assert.ok(d3(p.rToe,F.PFL)<.3||d3(p.rAn,F.PFL)<.3,`right boot at the ball for the flick (${d3(p.rToe,F.PFL).toFixed(2)} m)`);}
for(let T=F.TC;T<F.TF;T+=.02)assert.ok(F.ballAt(T)[1]>=.1,'the ball drops but does not bounce before the flick');
for(let T=F.TF;T<F.TS;T+=.02)assert.ok(F.ballAt(T)[1]>=.1,'in the air from the flick to the volley');
{const p=F.park(F.TS);assert.ok(d3(p.lLaces,F.PV)<.2,`LEFT laces on the ball for the volley (${d3(p.lLaces,F.PV).toFixed(2)} m)`);assert.ok(d3(p.lToe,F.PV)<d3(p.rToe,F.PV),'left boot nearer');assert.ok(F.PV[1]>.2,'a volley: the ball is off the ground');}
{const c=F.conceicao(F.TF);const b=F.ballAt(F.TF+.1);assert.ok(d3(c.lToe,b)>.25&&d3(c.rToe,b)>.25,'the flick beats Conceição');const c0=F.conceicao(F.TF-.1);assert.ok(d2([c0.pelvis[0],c0.pelvis[2]],[F.PFL[0],F.PFL[2]])<2.5,'Conceição is right on him');}
{const b=F.baia(F.TB),ball=F.ballAt(F.TB),zs=[b.lAn[2],b.rAn[2]].sort((a,c)=>a-c);assert.ok(ball[2]>zs[0]+.08&&ball[2]<zs[1]-.08,`through Baía's legs: ball z ${ball[2].toFixed(2)} between his ankles ${zs.map(z=>z.toFixed(2))}`);
 assert.ok(ball[1]<Math.min(b.lKn[1],b.rKn[1])+.1,`under his knees (ball y ${ball[1].toFixed(2)})`);}
for(let T=F.TS;T<=F.TG+.1;T+=.02){const k=F.baia(T),b=F.ballAt(T);assert.ok(d3(k.lHa,b)>.25&&d3(k.rHa,b)>.25,`Baía's hands never touch it (τ ${T.toFixed(2)})`);}
const g=F.ballAt(F.TG);assert.ok(Math.abs(g[0])<.05&&Math.abs(g[2])<3.5&&g[1]<.8,`in, low (z ${g[2].toFixed(2)}, y ${g[1].toFixed(2)})`);
// render every chapter (start, cue beats, passage) through the stub canvas: no draw errors at card sizes, reduced motion included
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});
 for(let k=0;k<6;k++)film.touch?.(acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0}),0,0,k*.15,7);}
console.log(`PASS ${ID}: 4 chapters, ${words} words, ${total.toFixed(1)}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
