// Iconic-play film: Willian Pacho, signature "the recovery sprint" (lib/plays/riso/pacho-signature.ts). Structural checks, no browser:
// story shape (4 chapters: the real 2025 Champions League final whistle — confirmed things only; a labelled 'How he does it' demonstration
// live; its slow replay; the lesson), narration = script.json, 70–90 words ending with the lesson, no invented play narrated in the real
// match, cue words plain-word substrings in order before the passage, length 20–42 s; every figure goes through the one drawPlayer() adapter
// on the shared athlete library; seeded randomness only; the solved demo geometry (the chip over his head, the drop-step to the ball's side,
// a real sprint, goal-side on the ball-to-goal line BEFORE the poke, his boot on the ball); when timing.json exists the film must import it.
// Also renders every chapter through a stub canvas at the three card sizes so a draw error fails here, not in the card.
// usage: node tests/play-film-pacho-signature.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{module:m,exports:m.exports,Math,WeakMap,Map,DOMMatrix:globalThis.DOMMatrix??StubMatrix,DOMPoint:globalThis.DOMPoint,Path2D:StubPath,document:{createElement:()=>stubCanvas()},require:id=>{const base=path.resolve(path.dirname(file),id);return load([base+'.ts',base].find(fs.existsSync));}});
 return m.exports;}
// minimal canvas stubs: enough for the engine to run story.draw end to end (no pixels)
function StubPath(){this.ops=0;}Object.assign(StubPath.prototype,{moveTo(){},lineTo(){},arc(){},ellipse(){},rect(){},closePath(){},addPath(){},bezierCurveTo(){},quadraticCurveTo(){}});
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


const ID='pacho-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'real match, demonstration live, demonstration replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Munich/.test(text)&&/Champions League final/.test(text)&&/Inter/.test(text)&&/Willian Pacho/.test(text)&&/first Ecuadorian/.test(text),'venue, final, opponent, player and the sourced first-Ecuadorian fact are narrated');
// honesty: nothing invented inside the real match; the move is a labelled demonstration
const real=film.chapters[0].narration;
assert.ok(!/tackle|block|clear|sprint|turn|poke|steal|wins it|minute/i.test(real),'no invented recovery/tackle narrated inside the real match');
assert.ok(/One reporter said he was world class at tracking back\./.test(real),'the reporter line (Sporting News) is quoted as a quote');
assert.equal(film.chapters[1].label,'How he does it','the recovery sprint is a clearly labelled demonstration');
assert.ok(/^Watch how he does it\./.test(film.chapters[1].narration),'the demonstration is announced as a demonstration');
assert.ok(!/left foot|right foot|Barella|Thuram|Munich|Inter/i.test(film.chapters.slice(1).map(c=>c.narration).join(' ')),'the demonstration names no foot, no opponent and no match');
assert.ok(/If an attacker gets past you, turn and sprint back goal side first\. Then try to win the ball\.$/.test(film.chapters[3].narration),'ends with the lesson');
// the demonstration chapters never draw the Munich arena or match kits; the real chapter never draws the ball or the demo
const sceneSrc=(n)=>{const a=src.indexOf(`const ch${n}:Scene`),b=src.indexOf('};',a);return src.slice(a,b);};
assert.ok(/stadium\(/.test(sceneSrc(1))&&!/drawDemo|demoBall|drawBall/.test(sceneSrc(1)),'ch1: the arena and the celebration only, no ball, no play');
for(const n of [2,3,4])assert.ok(/trainingGround\(/.test(sceneSrc(n))&&!/stadium\(|bigScreen\(/.test(sceneSrc(n)),`ch${n}: the training pitch, not the match`);
// the look contract: full-sheet framing, the voice hook, the real kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming);/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE null, passed into withTiming');
assert.ok(/shirt:\[K,\.95\],trim:R,shorts:\[K,\.95\],socks:\[K,\.95\]/.test(src),'PSG all dark navy (kit box)');
assert.ok(/shirt:Y,trim:K,shorts:Y,socks:Y/.test(src),'Inter all yellow, the 2024–25 third kit (kit box)');
assert.ok(/number:51,skin:SKIN_D/.test(src)&&/height:1\.88/.test(src),'Pacho No. 51, 1.88 m, dark skin (card data)');
assert.ok(F.celebrationPacho().hero,'Pacho is the hero figure of the celebration');
// solved demonstration geometry
const d2=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]),d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
assert.ok(d3(F.passerToe(),F.B0)<.3,`the passer's boot meets the chip (${d3(F.passerToe(),F.B0).toFixed(2)} m)`);
{const p0=F.pacAt(0).place;let over=false;for(let u=0;u<F.U_LAND;u+=.02){const b=F.chipBall(u);if(Math.abs(b[0]-p0.x)<.4&&b[1]>2.6)over=true;}assert.ok(over,'the chip goes OVER his head (> 2.6 m as it passes him)');}
assert.ok(F.LAND[0]>F.pacAt(0).place.x+5,'the chip lands behind him (between him and his goal)');
assert.ok(F.TURN<-Math.PI/2,'he drop-steps to his right, the side the ball goes (yaw turns clockwise)');
{let vmax=0;for(let u=1;u<3.6;u+=.05)vmax=Math.max(vmax,F.pacSpeed(u));assert.ok(vmax>7&&vmax<9.8,`a real sprint (${vmax.toFixed(1)} m/s peak)`);}
// the race: the attacker is ahead (nearer the goal) when he collects; Pacho is goal-side (nearer the goal, on the ball–goal line) before the poke
const toGoal=(p)=>Math.hypot(p[0],p[1]);
{const a=F.attackerAt(2.25),p=F.pacAt(2.25).place;assert.ok(toGoal(a)<toGoal([p.x,p.z]),'the attacker gets past him first');}
for(const u of [F.U_B,4.5,4.8,F.U_TK-.1]){const p=F.pacAt(u).place,b=F.chipBall(u),P=[p.x,p.z],Bv=[b[0],b[2]];
 assert.ok(toGoal(P)<toGoal(Bv)-1,`u=${u}: goal-side — nearer the goal than the ball`);
 const t=Math.max(0,Math.min(1,(P[0]*Bv[0]+P[1]*Bv[1])/(Bv[0]**2+Bv[1]**2))),dl=d2(P,[Bv[0]*t,Bv[1]*t]);assert.ok(dl<1.2,`u=${u}: on the ball-to-goal line (${dl.toFixed(2)} m off)`);}
{const u=F.U_B-.9,p=F.pacAt(u).place,a=F.attackerAt(u);assert.ok(toGoal([p.x,p.z])<toGoal(a),'he overtakes on the inside line before braking');}
assert.ok(d3(F.pokeToe(),F.TK)<.35,`his boot meets the ball at the poke (${d3(F.pokeToe(),F.TK).toFixed(2)} m)`);
assert.ok(F.U_TK>F.U_B+.8,'he gets goal-side FIRST, then tries to win the ball');
for(const c of film.chapters)for(const q of c.cues)assert.ok(/^[A-Za-zÀ-ÿ]+(\s|$)/.test(q.words)&&!/^[^\s]*['’–-]/.test(q.words),`cue "${q.words}" starts with a plain word (Kokoro splits contractions/hyphens)`);
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=42,`length ${total}s`);
// the live demonstration runs in real time long enough to show the poke
{const S=film.chapters[1].seconds;let tp=-1;for(let t=0;t<=S;t+=.01)if(tp<0&&F.tau2(t)>=F.U_TK)tp=t;
 assert.ok(F.RATE2>=1&&F.RATE2<=1.2,`ch2 runs at (near) real time (×${F.RATE2})`);
 assert.ok(tp>0&&tp<S-.65,`ch2 shows the poke before the passage (poke at ${tp.toFixed(2)} s of ${S} s)`);
 const b=film.chapters[1].cues.find(c=>c.words.startsWith('The ball goes')).at,bo=F.chipBall(F.tau2(b));assert.ok(bo[1]>2.5,'the chip is in the air over him on "The ball goes over"');}
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
