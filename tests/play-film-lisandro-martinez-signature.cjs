// Iconic-play film: Lisandro Martínez's signature brave challenge — his sliding block on Miguel Borja in extra time of the Copa América 2024
// final, Argentina v Colombia (lib/plays/riso/lisandro-martinez-signature.ts). Structural checks, no browser: story shape (4 chapters: live,
// slow replay, second replay, lesson), narration = public/plays/narration/lisandro-martinez-signature/script.json, 70–90 words ending with the
// lesson, cue words in order inside their chapter and never starting with a contraction or hyphenated word, length 20–45 s; every figure through
// the one drawPlayer() adapter on the shared athlete library; the play as the sources describe it (a flick, Borja onside and alone in the box,
// a shot at the keeper's left post, Lisandro arriving from behind and sliding his left leg into its path, the ball out wide of the post for a
// corner, no body overlap); the voice hook; and every chapter drawn through a stub canvas at the three card sizes. The loader handles .ts and
// .json imports.
// usage: node tests/play-film-lisandro-martinez-signature.cjs
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

const ID='lisandro-martinez-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, slow replay, second replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(script.film,ID);
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Lisandro Martínez/.test(text)&&/Copa América final/.test(text)&&/Miguel Borja/.test(text)&&/Colombia/.test(text)&&/Miami/.test(text)&&/extra time/.test(text),'Lisandro, the final, Borja, Colombia, Miami and extra time are narrated');
assert.ok(/from behind/.test(text)&&/corner/.test(text)&&/one metre seventy-five/.test(text),'sourced facts: from behind, out for a corner, 1.75 m');
assert.ok(!/minute|goal!|one-nil|Carrascal|Emiliano|left post/i.test(text),'no minute, scoreline or unverified detail narrated');
const last=film.chapters[3].narration;
assert.ok(/^You don't need to be the tallest\./.test(last)&&/Good timing and bravery win duels/.test(last)&&/be brave!$/.test(last),'ends with the lesson');
assert.ok(/14 July 2024/.test(film.ageNote),'the match date is stated');
// the look contract: full-sheet framing, the voice hook, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming);/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook (null until voiced) passed into withTiming');
assert.ok(/number:25,/.test(src)&&/number:9,/.test(src)&&/number:8,/.test(src)&&/number:23,/.test(src)&&/number:13,/.test(src),'Lisandro 25, Borja 9, Carrascal 8, Emiliano 23, Romero 13');
assert.ok(/shirt:\[B,\.5\],pattern:'stripes',patternInk:'paper'/.test(src)&&/shirt:\[Y,\.95\],shorts:\[B,\.85\],socks:\[R,\.9\]/.test(src),'Argentina sky-blue/white stripes; Colombia yellow/blue/orange-red');
assert.ok(/height:1\.75/.test(src),'Lisandro drawn 1.75 m');
assert.equal(JSON.stringify(film.chapters.map(c=>c.cues.length)),'[8,5,4,5]','cue counts the scenes key their actions to');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  const first=c.words.split(/\s+/)[0];assert.ok(!/['’-]/.test(first),`ch${i+1} cue "${c.words}" starts with a plain word (Kokoro splits contractions/hyphens)`);
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=45,`length ${total}s`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MOMENT/.test(src),'sources, confirmed/inferred and why, at the top');
// the play as the sources describe it
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const cf=F.carrascalFoot();assert.ok(dist([cf[0],cf[2]],F.FLICK)<.3,`Carrascal's flick leaves his boot (${dist([cf[0],cf[2]],F.FLICK).toFixed(2)} m)`);
const bf=F.borjaFoot();assert.ok(dist([bf[0],bf[2]],F.SHOT_AT)<.3,`Borja's shot leaves his right boot (${dist([bf[0],bf[2]],F.SHOT_AT).toFixed(2)} m)`);
assert.ok(F.SHOT_AT[0]<16.5&&Math.abs(F.SHOT_AT[1]-34)<20.16,'Borja shoots from inside the box');
const defs0=F.defendersAt(0),lastLine=Math.min(...defs0,F.lisandroAt(0)[0]);assert.ok(F.borjaAt(0)[0]>=lastLine,`Borja onside at the flick (Borja x ${F.borjaAt(0)[0].toFixed(1)}, second-last defender x ${lastLine.toFixed(1)})`);
assert.ok(F.lisandroAt(0)[0]>F.borjaAt(0)[0]+.5,'Lisandro comes from behind: upfield of Borja when the ball is flicked');
assert.ok(F.lisandroAt(F.T_RECV)[0]>F.borjaAt(F.T_RECV)[0],'Borja is still a step ahead when he takes the ball');
const lf=F.leftFoot(),rf=F.rightFoot(),d=(p)=>Math.hypot(p[0]-F.BLOCK[0],p[2]-F.BLOCK[1]);
assert.ok(d(lf)<.25&&d(rf)>.5,`the slide's left leg is on the shot (left ${d(lf).toFixed(2)} m, right ${d(rf).toFixed(2)} m)`);
assert.ok(lf[1]<.25,`the boot is down on the grass: a slide (${lf[1].toFixed(2)} m)`);
const bc=F.ballAt(F.T_CONTACT);assert.ok(Math.hypot(bc[0]-F.BLOCK[0],bc[2]-F.BLOCK[1])<.05,'the ball is at his leg at the contact frame');
// the shot was on target for the left post (the far post: +Z), and would have gone in without the block
const zAt0=F.SHOT_AT[1]+(F.BLOCK[1]-F.SHOT_AT[1])*(F.SHOT_AT[0]/(F.SHOT_AT[0]-F.BLOCK[0]));assert.ok(zAt0>34&&zAt0<37.66,`the shot's line reaches the goal inside the left post (z ${zAt0.toFixed(2)})`);
// the block sends it out over the goal line, wide of the left post: a corner
const bl=F.ballAt(F.T_LINE);assert.ok(Math.abs(bl[0])<.25&&bl[2]>37.9,`crosses the goal line wide of the post (x ${bl[0].toFixed(2)}, z ${bl[2].toFixed(2)})`);
assert.ok(F.OUT2[0]<0,'it ends behind the goal line (a corner)');
for(let T=-2;T<=F.T_CONTACT;T+=.05){const a=F.lisandroAt(T),b=F.borjaAt(T);assert.ok(dist(a,b)>.7,`no body overlap in the chase (T=${T.toFixed(2)}: ${dist(a,b).toFixed(2)} m)`);}
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
