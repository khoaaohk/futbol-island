// Iconic-play film: Elliot Anderson, a labelled SIGNATURE-MOVE DEMO (win it and drive forward) (lib/plays/riso/elliot-anderson-signature.ts). Structural + demo-geometry checks; every chapter renders through a stub canvas.
// usage: node tests/play-film-elliot-anderson-signature.cjs
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
const PLAYER='Elliot Anderson';
const ID=process.env.__ID__||'elliot-anderson-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
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
assert.equal(F.demo,true);assert.ok(/Signature-move demo \(not a specific match\)/.test(film.ageNote),'labelled as a demo');
assert.ok(/WHY A DEMO/.test(src),'the header explains why this is a demo');
assert.equal(lessonSrc.kind,'signature','the card proposes a signature');
assert.ok(/played for England at the 2026 World Cup, where they won bronze/.test(text)&&/This is how he wins the ball and drives forward/.test(text),'the sourced fact, then "how he does it"');
assert.ok(/win the ball, lift your head, and carry it forward into the space in front of you/.test(film.chapters[3].narration),'ends with the iconicPlays.json lesson');
assert.ok(/Win the ball, lift your head,? and carry it forward into the space in front of you/i.test(lessonSrc.lesson),'lesson source still matches');
assert.ok(/eng\(8,/.test(src)&&/shirt:'paper',shorts:K,socks:'paper'/.test(src)&&/numberInk:R/.test(src),'England white, red number 8 (Commons photo)');
assert.ok(/number:null/.test(src),'demo opponents unnamed and unnumbered');
// the move the lesson teaches
{const p=F.passerContact();assert.ok(d3(p.rToe,F.PA)<.4,`the passer's boot at the ball (${d3(p.rToe,F.PA).toFixed(2)} m)`);}
{const cross=(F.PI[0]-F.PA[0])*(F.PB[1]-F.PA[2])-(F.PI[2]-F.PA[2])*(F.PB[0]-F.PA[0]);assert.ok(Math.abs(cross)<1e-6,'the interception is ON the pass line');}
{const e=F.ea(F.TW);assert.ok(d3(e.rToe,F.PI)<.3,`his right boot steps in on the ball (${d3(e.rToe,F.PI).toFixed(2)} m)`);}
{const r=F.posOf(2,F.TW);assert.ok(Math.hypot(r[0]-F.PI[0],r[1]-F.PI[2])>6,'the intended receiver never gets near it');}
{const a=F.ea(.2).neckP,b=F.ea(F.HEAD_UP+.5).neckP;assert.ok(b<a-.3,`he lifts his head during the carry (neck ${a.toFixed(2)} → ${b.toFixed(2)})`);}
{const p0=F.posOf(0,F.TW+.3),p1=F.posOf(0,3);assert.ok(p1[0]-p0[0]>10,`carries it forward into the space (${(p1[0]-p0[0]).toFixed(1)} m)`);
 for(let k=4;k<8;k++){const q=F.posOf(k,2);const e=F.posOf(0,2);assert.ok(!(q[0]>e[0]&&q[0]<e[0]+6&&Math.abs(q[1]-e[1])<2.5),`space in front stays open (player ${k})`);}}
for(let T=.4;T<3;T+=.1){const b=F.ballAt(T),e=F.posOf(0,T);assert.ok(Math.hypot(b[0]-e[0],b[2]-e[1])<3.2,`ball under control on the carry (τ ${T.toFixed(1)})`);}
// render every chapter (start, cue beats, passage) through the stub canvas: no draw errors at card sizes, reduced motion included
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});
 for(let k=0;k<6;k++)film.touch?.(acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0}),0,0,k*.15,7);}
console.log(`PASS ${ID}: 4 chapters, ${words} words, ${total.toFixed(1)}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
