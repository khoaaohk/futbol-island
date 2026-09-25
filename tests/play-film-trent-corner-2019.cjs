// Iconic-play film: Trent Alexander-Arnold's quick corner, Liverpool 4–0 Barcelona 2019 (lib/plays/riso/trent-corner-2019.ts). Structural checks,
// no browser: story shape (4 chapters: live, slow replay, behind-the-goal replay, lesson), narration = public/plays/narration/trent-corner-2019/script.json,
// 70–90 words ending with the lesson, cue words are substrings in order and inside their chapter before the passage, length 25–50 s;
// the solved contacts (Trent's RIGHT boot at the corner, Origi's RIGHT boot meets the low cross, the finish goes in, Barcelona facing away);
// every figure goes through the one drawPlayer() adapter on the shared athlete library; seeded randomness only; when timing.json (the
// voice generator's output) exists, the film must import it (every chapter has its audio file and its seconds cover the clip).
// Also renders every chapter through a stub canvas at the three card sizes so a draw error fails here, not in the card.
// usage: node tests/play-film-trent-corner-2019.cjs
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

const ID='trent-corner-2019',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, slow replay, behind-the-goal replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Trent/.test(text)&&/Origi/.test(text)&&/Barcelona/.test(text)&&/Corner taken quickly\.\.\. Origi!/.test(text),'the taker, the scorer, the opponent and the famous call are narrated');
assert.ok(!/Kop|right foot|left foot|right-hand|left-hand/i.test(text),'inferred details (which corner, which end, which foot) are not narrated');
const last=film.chapters[3].narration;
assert.ok(/switched on/.test(last)&&/set piece/.test(last)&&/scan/.test(last)&&/isn't ready/.test(last)&&/play it quickly/.test(last),'ends with the lesson (stay switched on at set pieces, scan, play quickly when they are not ready)');
// the look contract: full-sheet card-window framing, broadcast cameras (no top-down), the real kits, the voice hook
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:66/.test(src)&&/number:27/.test(src),'Trent wears 66, Origi 27');
assert.ok(/shirt:R,shorts:R,socks:R/.test(src)&&/shirt:Y,shorts:Y/.test(src),'Liverpool all red, Barcelona fluorescent yellow');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=25&&total<=55,`length ${total}s`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src),'sources + confirmed/inferred listed at the top');
// the solved play
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
assert.equal(F.cornerFoot,'r');assert.equal(F.finishFoot,'r');
assert.ok(F.P0[2]>33&&F.P0[2]<34.2&&F.P0[0]>-1.2&&F.P0[0]<0,`the corner is taken from the corner quadrant (x ${F.P0[0]}, z ${F.P0[2]})`);
const tc=F.trentContact();assert.ok(d3(tc.rToe,F.P0)<.35,`Trent's RIGHT boot is at the ball (${d3(tc.rToe,F.P0).toFixed(2)} m)`);assert.ok(d3(tc.rToe,F.P0)<d3(tc.lToe,F.P0),'right boot nearer the ball than the left');
for(let T=-6.4;T<=0;T+=.1)assert.ok(d3(F.ballAt(T),F.P0)<1e-6,`the ball waits in the quadrant while he walks away (τ ${T.toFixed(1)})`);
const oc=F.origiContact();assert.ok(d3(oc.rToe,F.C_BALL)<.3,`Origi's RIGHT boot meets the cross (${d3(oc.rToe,F.C_BALL).toFixed(2)} m)`);
assert.ok(d3(F.ballAt(F.TF-1e-4),F.C_BALL)<.05,'the cross arrives at Origi');
assert.ok(F.C_BALL[0]>-7.5&&F.C_BALL[0]<-4.5&&Math.abs(F.C_BALL[2])<4,`Origi on the edge of the six-yard box (x ${F.C_BALL[0].toFixed(1)}, z ${F.C_BALL[2].toFixed(1)})`);
let apex=0;for(let T=0;T<F.TF;T+=.02)apex=Math.max(apex,F.ballAt(T)[1]);assert.ok(apex<1.2,`a LOW cross (apex ${apex.toFixed(2)} m)`);
const g=F.ballAt(F.TG);assert.ok(Math.abs(g[0])<.05&&Math.abs(g[2])<3.66-.11&&g[1]>0&&g[1]<2.44-.11,`the finish crosses the line inside the goal (z ${g[2].toFixed(2)}, y ${g[1].toFixed(2)})`);
// switched off: before the corner every Barcelona player faces away from the ball (more than 90° off)
for(const T of [-4,-2,-.2]){const f=F.barcaFacing(T);assert.ok(f.length>=8,'at least 8 Barcelona players drawn');
 f.forEach((p,i)=>{const fx=Math.cos(p.yaw),fz=-Math.sin(p.yaw),bx=F.P0[0]-p.x,bz=F.P0[2]-p.z,l=Math.hypot(bx,bz);assert.ok((fx*bx+fz*bz)/l<.2,`Barcelona player ${i+1} is not facing the corner at τ ${T} (switched off)`);});}
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
