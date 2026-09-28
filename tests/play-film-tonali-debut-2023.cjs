// Iconic-play film: Sandro Tonali's goal on his Premier League debut, Newcastle 5-1 Aston Villa, 12 Aug 2023 (lib/plays/riso/tonali-debut-2023.ts). Structural + solved-geometry checks, no browser; every chapter renders through a stub canvas at card sizes.
// usage: node tests/play-film-tonali-debut-2023.cjs
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
const PLAYER='Sandro Tonali';
const ID=process.env.__ID__||'tonali-debut-2023',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
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
assert.ok(/Newcastle/.test(text)&&/2023/.test(text)&&/Aston Villa/.test(text)&&/first Premier League game/.test(text),'the match and the debut are narrated');
assert.ok(/wins the ball in midfield/.test(text)&&/Anthony Gordon crosses from the left/.test(text)&&/slides in and volleys/.test(text),'interception, Gordon from the left, the sliding volley');
assert.ok(!/\b(left|right) foot\b/.test(text),'the volleying foot is not in any account read, so it is never narrated');
assert.ok(/arrive late in the box\. A midfielder's run is the hardest one for defenders to follow/.test(film.chapters[3].narration),'ends with the iconicPlays.json lesson');
assert.ok(/Arrive late in the box: a midfielder.s run is the hardest one for defenders to follow/i.test(lessonSrc.lesson),'lesson source still matches');
assert.ok(/nuf\(8,/.test(src)&&/nuf\(10,/.test(src)&&/nuf\(7,/.test(src),'Tonali 8, Gordon 10, Joelinton 7');
assert.ok(/shirt:'paper',pattern:'stripes',patternInk:K,shorts:K,socks:K/.test(src),'Newcastle black-and-white stripes, black shorts');
assert.ok(/shirt:P,shorts:'paper'/.test(src)&&/sleeves:a\.sleeves\?B/.test(src),'Villa claret (red ink) with sky-blue sleeves, white shorts');
assert.ok(/INFERRED[\s\S]*VOLLEYING FOOT/.test(src),'the unverified foot is declared inferred');
assert.ok(F.TIP[0]<-40&&Math.abs(F.TIP[2])<10,'the interception is in central midfield');
{const t=F.posOf(0,F.TI);assert.ok(d2(t,[F.TIP[0],F.TIP[2]])<2,'Tonali makes the interception');}
assert.ok(F.P0[2]<-18&&F.P0[0]>-16,`the cross comes from the LEFT wing (z ${F.P0[2]})`);
{const g=F.gordonContact();assert.ok(Math.min(d3(g.rToe,F.P0),d3(g.lToe,F.P0))<.4,`Gordon's boot at the ball (${d3(g.rToe,F.P0).toFixed(2)} m)`);}
{const j=F.joelintonContact();assert.ok(d3(j.rToe,F.JP)<.45,`Joelinton plays the one-two (${d3(j.rToe,F.JP).toFixed(2)} m)`);}
{const t=F.tonali(F.TC);assert.ok(d3(t.rLaces,F.PC)<.2,`Tonali's boot meets the cross (${d3(t.rLaces,F.PC).toFixed(2)} m)`);assert.ok(t.pelvis[1]<.6,`sliding (pelvis ${t.pelvis[1].toFixed(2)} m)`);
 assert.ok(F.PC[0]>-12&&F.PC[0]<-5&&Math.abs(F.PC[2])<6,`inside the box, central (x ${F.PC[0].toFixed(1)}, z ${F.PC[2].toFixed(1)})`);}
assert.ok(d3(F.ballAt(F.TC-1e-4),F.PC)<.05,'the cross arrives on his boot');
{const run=d2(F.posOf(0,F.TI),F.posOf(0,F.TC));assert.ok(run>35,`a late run from deep (${run.toFixed(0)} m)`);
 for(let k=5;k<=9;k++){const a=F.posOf(k,F.TC),b=F.posOf(0,F.TC);assert.ok(d2(a,b)>2,`untracked: Villa player ${k} not on him at the volley (${d2(a,b).toFixed(1)} m)`);}}
const g=F.ballAt(F.TG);assert.ok(Math.abs(g[0])<.05&&Math.abs(g[2])<3.5&&g[1]<2.3,`in the goal (z ${g[2].toFixed(2)}, y ${g[1].toFixed(2)})`);
for(let T=F.TC;T<=F.TG+.1;T+=.02){const k=F.emi(T),b=F.ballAt(T);assert.ok(d3(k.lHa,b)>.25&&d3(k.rHa,b)>.25,`Martínez never touches it (τ ${T.toFixed(2)})`);}
// render every chapter (start, cue beats, passage) through the stub canvas: no draw errors at card sizes, reduced motion included
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});
 for(let k=0;k<6;k++)film.touch?.(acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0}),0,0,k*.15,7);}
console.log(`PASS ${ID}: 4 chapters, ${words} words, ${total.toFixed(1)}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
