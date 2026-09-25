// Iconic-play film: William Saliba's signature calm recovery tackle, shown through his tackle on Kylian Mbappé in Marseille 0-0 Paris
// Saint-Germain, Ligue 1, 24 October 2021, Stade Vélodrome (lib/plays/riso/saliba-signature.ts). Structural checks, no browser: story shape
// (4 chapters: live, slow replay, second replay, lesson), narration = public/plays/narration/saliba-signature/script.json, 70–90 words
// ending with the lesson, cue words in order inside their chapter, no cue starting with a contraction or hyphenated word, length 20–45 s;
// every figure through the one drawPlayer() adapter on the shared athlete library; the sourced facts (seven minutes left, no goals, Messi's
// pass, Mbappé away, Saliba on loan from Arsenal, a sliding tackle, no goal) and the geometry (Messi passes with his left foot, Saliba ends
// goal-side of Mbappé, his left toe on the ball, low, nothing of him touching Mbappé, the ball away over the near touchline, never a goal);
// the voice hook; and every chapter drawn through a stub canvas at the three card sizes. The loader handles .ts and .json imports.
// usage: node tests/play-film-saliba-signature.cjs
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


const ID='saliba-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, slow replay, second replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/William Saliba/.test(text)&&/2021/.test(text)&&/Marseille against Paris Saint-Germain/.test(text)&&/on loan from Arsenal/.test(text),'Saliba, the 2021 Classique and the Arsenal loan are narrated');
assert.ok(/Seven minutes left, no goals/.test(text)&&/Messi slides a pass through/.test(text)&&/Kylian Mbappé is away/.test(text)&&/slides in/.test(text)&&/No goal/.test(text),'the sourced beats: 83rd minute, 0-0, Messi\'s through ball, Mbappé clear, the sliding tackle, no goal');
const footage=film.chapters.slice(0,3).map(c=>c.narration).join(' ');
assert.ok(!/left foot|right foot|throw|white|navy|Neymar|Di Mar|L[oó]pez|Hakimi|ten men/i.test(footage),'the footage chapters name nothing inferred');
const last=film.chapters[3].narration;
assert.ok(/Use your speed to get goal-side first/.test(last)&&/Then take the ball calmly/.test(last),'ends with the lesson (speed to get goal-side, then take the ball calmly)');
assert.ok(/24 October 2021/.test(film.ageNote)&&/Vélodrome/.test(film.ageNote),'the match date and venue are stated');
// the look contract: full-sheet framing, the voice hook, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:2,/.test(src)&&/number:7,/.test(src)&&/number:30,/.test(src),'Saliba 2, Mbappé 7, Messi 30');
assert.ok(/shirt:'paper',shorts:'paper',socks:'paper'/.test(src)&&/shirt:\[K,\.95\],trim:R/.test(src),'Marseille all white, PSG navy with red trim');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(!/['’-]/.test(c.words.split(/\s+/)[0]),`ch${i+1} cue "${c.words}" starts with a plain word (Kokoro splits contractions and hyphens)`);
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=45,`length ${total}s`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MOMENT/.test(src),'sources, confirmed/inferred and why this moment, at the top');
assert.ok(/strike\(u,\{foot:'l'/.test(src),'Messi passes with his left foot');
// the moment: a counter from near halfway; Saliba catches up and is goal-side (nearer the goal than Mbappé) as he goes down; his LEFT toe
// reaches the ball low, outside the box; nothing of him touches Mbappé; the ball runs away over the near touchline; never a goal
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]),dG=p=>Math.hypot(p[0],p[1]-34);
assert.ok(F.PASS_FROM[0]>45&&F.PASS_FROM[0]<60,`Messi's pass from near halfway (${F.PASS_FROM})`);
assert.ok(F.BALL0[0]>16.5&&F.BALL0[0]<26,`the tackle is just outside the box (${F.BALL0})`);
const b0=F.ballAt(F.T_TACKLE);assert.ok(Math.hypot(b0[0]-F.BALL0[0],b0[2]-F.BALL0[1])<.05,'the ball is at the spot at the touch');
const toe=F.salibaToe();assert.ok(d3(toe,b0)<.3&&toe[1]<.35,`Saliba's left toe is on the ball at the touch (${d3(toe,b0).toFixed(2)} m, ${toe[1].toFixed(2)} m up)`);
assert.ok(F.salibaPelvisY()<.5,`he goes in low (pelvis ${F.salibaPelvisY().toFixed(2)} m)`);
const gsS=dG(F.at('saliba',F.LS)),gsM=dG(F.at('mbappe',F.LS));assert.ok(gsS<gsM-1,`goal-side as he goes down (Saliba ${gsS.toFixed(1)} m from goal, Mbappé ${gsM.toFixed(1)} m)`);
const early=Math.abs(F.at('saliba',F.T_PASS)[0]-F.at('mbappe',F.T_PASS)[0]);assert.ok(early<6,`it is a race from the pass (${early.toFixed(1)} m apart along the pitch)`);
assert.ok(Math.abs(F.OUT_AT[1])<1e-6&&F.OUT_AT[0]>5&&F.OUT_AT[0]<30,`the ball runs over the near touchline (x ${F.OUT_AT[0].toFixed(1)})`);
for(let T=-7;T<5;T+=.05){const b=F.ballAt(T);assert.ok(!(b[0]<0.5&&b[2]>30&&b[2]<38),`no goal at T=${T.toFixed(2)}`);}
let minGap=9,at=0;for(let T=-1.2;T<=1.6;T+=.02){const legs=F.mbappeLegs(T);for(const p of F.salibaBody(T))for(const q of legs){const g=d3(p,q);if(g<minGap){minGap=g;at=T;}}}
assert.ok(minGap>.2,`the ball, not the man: Saliba never touches Mbappé (closest ${minGap.toFixed(2)} m at T=${at.toFixed(2)})`);
const up=F.salibaPelvisY(F.T_TACKLE+2.2);assert.ok(up>.8,`afterwards he is straight back on his feet (pelvis ${up.toFixed(2)} m)`);
// installed voice (optional until generated): the film must import it, files exist and chapter seconds cover each clip
const timing=path.join(dir,'timing.json');
if(fs.existsSync(timing)){const T=JSON.parse(fs.readFileSync(timing,'utf8'));
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio once timing.json exists — import timing.json in ${ID}.ts (see the VOICE note)`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const dd=T.chapters?.[i]?.seconds;if(typeof dd==='number')assert.ok(ch.seconds>=dd-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${dd}`);});}
// render every chapter through the stub canvas at the three card sizes: no draw errors, reduced motion included
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});}
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${text.length} chars, ${total}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
