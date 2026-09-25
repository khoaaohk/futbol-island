// Iconic-play film: Petr Čech saves Arjen Robben's extra-time penalty, 2012 Champions League final (lib/plays/riso/cech-robben-2012.ts).
// Structural checks, no browser: story shape (4 chapters: live, slow replay from behind Robben, replay behind the goal, lesson), narration =
// public/plays/narration/cech-robben-2012/script.json, 70–90 words ending with the lesson, cue words in order and inside their chapter before
// the passage; every figure goes through the one drawPlayer() adapter on the shared athlete library; seeded randomness only; the kits of the
// night (Čech in white with his headguard, Bayern all red, Chelsea blue); when timing.json exists the film must import it. The save itself is
// checked against the accounts: Robben's LEFT boot on the ball (inferred foot), a LOW shot to ČECH'S LEFT (+z) that his glove meets, a
// loose ball he smothers. Also renders every chapter through a stub canvas at the three card sizes so a draw error fails here, not in the card.
// usage: node tests/play-film-cech-robben-2012.cjs
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

const ID='cech-robben-2012',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, slow replay, replay behind the goal, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Robben/.test(text)&&/Čech/.test(text)&&/Munich/.test(text)&&/Extra time/.test(text),'the taker, the keeper, the place and the moment are narrated');
assert.ok(/to his left/.test(text)&&/low/.test(text)&&/rebound/.test(text),'the confirmed facts: to his left, low, the rebound');
assert.ok(!/right foot|left foot|foul|trip/i.test(text),'the inferred foot is not narrated; kid-friendly (no foul talk)');
const last=film.chapters[3].narration;
assert.ok(/homework/.test(last)&&/Stay big/.test(last)&&/push off strongly/.test(last)&&/rebound/.test(last),'ends with the lesson (homework, stay big, push off strongly, follow the rebound)');
// the look contract: full-sheet framing, the voice hook, kits of the night
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.equal(F.shotFoot,'l','Robben shoots with his left foot (inferred: his stronger foot)');
assert.equal(F.cechStyle.shirt,'paper');assert.equal(F.cechStyle.shorts,'paper');assert.equal(F.cechStyle.number,1);assert.equal(F.cechStyle.sleeves,'long');
assert.ok(/function headguard\(/.test(src)&&/HEADGUARD=new Set<AthleteStyle>\(\[CECH\]\)/.test(src),'Čech wears his headguard');
assert.equal(F.robbenStyle.shirt,'red');assert.equal(F.robbenStyle.shorts,'red');assert.equal(F.robbenStyle.socks,'red');assert.equal(F.robbenStyle.number,10);assert.equal(F.robbenStyle.hairStyle,'bald');
assert.equal(F.drogbaStyle.shirt,'blue');assert.equal(F.drogbaStyle.socks,'paper');assert.equal(F.drogbaStyle.number,11);
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=25&&total<=55,`length ${total}s (4 chapters; estimated until the voice exists)`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src),'sources + confirmed/inferred listed at the top');
// the save as the accounts describe it (see the film header)
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const rc=F.robbenContact();assert.ok(d3(rc.lToe,F.SPOT)<.3,`Robben's LEFT boot is at the ball on the spot (${d3(rc.lToe,F.SPOT).toFixed(2)} m)`);assert.ok(d3(rc.lToe,F.SPOT)<d3(rc.rToe,F.SPOT),'left boot nearer the ball than the right');
assert.ok(Math.abs(F.SPOT[0]+11)<1e-9&&Math.abs(F.SPOT[2])<1e-9,'the kick is from the penalty spot, 11 m out');
assert.ok(F.HIT[2]>1.8&&F.HIT[2]<3.5,`the shot goes to Čech's LEFT (+z), toward the bottom corner (z ${F.HIT[2].toFixed(2)})`);
assert.ok(F.HIT[1]<.45,`a LOW shot — "didn't go high enough" (y ${F.HIT[1].toFixed(2)})`);
let apex=0;for(let T=0;T<F.TF;T+=.01)apex=Math.max(apex,F.ballAt(T)[1]);assert.ok(apex<.5,`it stays low all the way (apex ${apex.toFixed(2)} m)`);
const cs=F.cechAt(F.TF);assert.ok(Math.min(d3(cs.lHa,F.HIT),d3(cs.rHa,F.HIT))<.25,`his glove meets the ball (${Math.min(d3(cs.lHa,F.HIT),d3(cs.rHa,F.HIT)).toFixed(2)} m)`);
assert.ok(Math.abs(F.SAVE0)<.12,`he waits for the kick: the dive starts at the strike (${F.SAVE0.toFixed(2)} s)`);
const c0=F.cechAt(-1);assert.ok(Math.abs(Math.cos(c0.yaw)+1)<1e-6,'Čech faces out of his goal (yaw π: his left is +z)');assert.ok(Math.abs(c0.pelvis[2])<.2,'he starts in the middle of his goal');
assert.ok(cs.pelvis[2]>.8,'he dives to his LEFT (+z)');
for(let T=F.TF+.05;T<F.T_GRAB;T+=.05){const b=F.ballAt(T);assert.ok(b[0]<0,'the ball never crosses the line');}
assert.ok(d3(F.ballAt(F.TF),F.HIT)<1e-6,'the shot arrives at the glove');
const g=F.cechAt(F.T_GRAB+.6),b=F.ballAt(F.T_GRAB+.6);assert.ok(d3(b,g.chest)<.55,`he smothers the rebound: the ball is in his arms (${d3(b,g.chest).toFixed(2)} m from his chest)`);
assert.ok(d3(F.robbenAt(F.T_GRAB).pelvis,F.BREST)>1.2,'Čech gets to the loose ball first');
// installed voice (optional until generated): the film must import it, files exist and chapter seconds cover each clip
const timing=path.join(dir,'timing.json');
if(fs.existsSync(timing)){const T=JSON.parse(fs.readFileSync(timing,'utf8')),list=T.chapters??Object.values(T);
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio once timing.json exists — import timing.json in ${ID}.ts (see the VOICE note)`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const d=list[i]?.duration??list[i]?.seconds;if(typeof d==='number')assert.ok(ch.seconds>=d-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${d}`);});}
// render every chapter (start, cue beats, passage) through the stub canvas: no draw errors at card sizes, reduced motion included
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});}
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${text.length} chars, ${total}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
