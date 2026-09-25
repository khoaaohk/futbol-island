// Iconic-play film: Vitinha's signature, "keep it moving with quick passes" (pass and move), shown in one real, sourced moment: PSG's third
// goal in the Champions League final, Paris Saint-Germain 5-0 Inter, 31 May 2025, Munich (lib/plays/riso/vitinha-signature.ts) — the give
// into Dembélé, the run on, the back-flick into his path, the charge, the through ball rolled in front of Doué, first time into the far corner.
// Structural checks, no browser: story shape (4 chapters: live, slow replay, second replay, lesson), narration =
// public/plays/narration/vitinha-signature/script.json, 70-90 words ending with the lesson, cue words in order inside their chapter (each
// starting with a plain word), length 20-45 s; every figure through the one drawPlayer() adapter on the shared athlete library; the contact
// points (the give, the heel flick, the touches of the carry, the through ball, Doué's first-time strike, in at the far post past the keeper);
// the voice hook; every chapter drawn through a stub canvas at the three card sizes. The loader handles .ts and .json imports.
// usage: node tests/play-film-vitinha-signature.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{module:m,exports:m.exports,Math,WeakMap,Map,DOMMatrix:globalThis.DOMMatrix??StubMatrix,DOMPoint:globalThis.DOMPoint,Path2D:StubPath,document:{createElement:()=>stubCanvas()},require:id=>{const base=path.resolve(path.dirname(file),id);return load([base+'.ts',base].find(fs.existsSync));}});
 return m.exports;}
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

const ID='vitinha-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
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
assert.ok(/Vitinha/.test(text)&&/Dembélé/.test(text)&&/Doué/.test(text)&&/Munich/.test(text)&&/2025/.test(text)&&/Champions League final/.test(text)&&/Inter/.test(text),'Vitinha, Dembélé, Doué, Munich, the 2025 final and Inter are narrated');
assert.ok(/keeps running/.test(text)&&/flicks it back/.test(text)&&/rolls it/.test(text)&&/First time, far corner/.test(text)&&/racing down the right/.test(text),'the sourced actions: the run on, the flick back, the rolled pass, first time into the far corner, Doué on the right');
assert.ok(/five–nil/.test(text)&&/first Champions League/.test(text),'the sourced facts: 5–0, their first Champions League');
assert.ok(!/right foot|left foot|heel|Sommer|Dimarco|minute|63/i.test(text),'no inferred feet, Inter players or minute are narrated');
const last=film.chapters[3].narration;
assert.ok(/pass and move/.test(last)&&/Give it, then find a new space to get it back/.test(last),'ends with the lesson (pass and move: give it, find a new space, get it back)');
assert.ok(/31 May 2025/.test(film.ageNote),'the match date is stated');
// the look contract: full-sheet framing, the voice hook, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:17,/.test(src)&&/number:10,/.test(src)&&/number:14,/.test(src),'Vitinha 17, Dembélé 10, Doué 14');
assert.ok(/shirt:\[K,\.95\],trim:R,shorts:\[K,\.95\],socks:\[K,\.95\]/.test(src)&&/shirt:Y,trim:K,shorts:Y,socks:Y/.test(src),'PSG all navy (red trim), Inter third kit all yellow');
assert.equal(JSON.stringify(film.chapters.map(c=>c.cues.length)),'[6,5,4,5]','cue counts the scenes key their actions to');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  const w0=c.words.split(/\s+/)[0];assert.ok(/^[A-Za-z]+$/.test(w0),`ch${i+1} cue "${c.words}" starts with a plain word (Kokoro matching)`);
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=45,`length ${total}s`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MOMENT/.test(src),'sources, confirmed/inferred and why this moment, at the top');
// the play
const d2=(p,q)=>Math.hypot(p[0]-q[0],p[2]-q[2]),g0=[F.G0[0],.11,F.G0[1]];
// 1 the give: Vitinha's boot, into Dembélé, who faces his own goal
const vg=F.vitFeet(F.T_GIVE);assert.ok(d2(vg.r,g0)<.3&&d2(vg.r,g0)<d2(vg.l,g0),`Vitinha's boot plays the give (${d2(vg.r,g0).toFixed(2)} m)`);
assert.ok(d2(F.ballAt(F.T_GIVE),g0)<.05,'the ball is at his boot at the give');
const dm=F.dembAt(F.T_FLICK);assert.ok(Math.cos(dm.yaw)<-.8,'Dembélé has come short, facing his own goal, back to Inter’s');
// 2 the back-flick: his heel, ball on forward into space
const df=F.dembFeet(F.T_FLICK);assert.ok(d2(df.rHeel,F.FL)<.3&&d2(df.rHeel,F.FL)<d2(df.lHeel,F.FL),`the flick is off Dembélé's heel (${d2(df.rHeel,F.FL).toFixed(2)} m)`);
assert.ok(df.pelvisY>.7,'Dembélé on his feet at the flick');
assert.ok(F.FL[0]>F.dembAt(F.T_FLICK).at[0],'the heel is behind him, on the side of Inter’s goal');
// Vitinha moves: after the give he is past Dembélé before he gets the ball back
assert.ok(F.vitAt(F.T_GIVE)[0]<F.DB_AT[0]-7,'Vitinha gives it from behind Dembélé');
const tc=F.touches();assert.ok(tc.length>=3,`${tc.length} touches on the carry`);
assert.ok(tc[0].at[0]>F.DB_AT[0]+2&&Math.abs(tc[0].at[0]-52.5)<3.5,`he gets it back in a new space ahead of Dembélé, at the halfway line (x ${tc[0].at[0].toFixed(1)})`);
assert.ok(tc[0].T-F.T_FLICK>.35&&tc[0].T-F.T_FLICK<1.1,'the flick runs on into his path');
for(const t of tc){const fe=F.vitFeet(t.T),b=F.ballAt(t.T);assert.ok(d2(fe.r,b)<.3&&d2(fe.r,b)<d2(fe.l,b),`touch at ${t.T.toFixed(2)}s on his boot (${d2(fe.r,b).toFixed(2)} m)`);}
const sp=(F.vitAt(-1.2)[0]-F.vitAt(-2.2)[0]);assert.ok(sp>4.5,`he charges into Inter's half at full speed (${sp.toFixed(1)} m/s)`);
// 3 the through ball: rolled, to Vitinha's right, just in front of Doué
const vp=[F.VP[0],.11,F.VP[1]],vf=F.vitFeet(0);assert.ok(d2(vf.r,vp)<.3&&d2(vf.r,vp)<d2(vf.l,vp),`his boot rolls the through ball (${d2(vf.r,vp).toFixed(2)} m)`);
assert.ok(F.VP[0]>52.5,'played inside Inter’s half');
for(const u of [.25,.5,.75])assert.ok(F.ballAt(F.T_SH*u)[1]<.2,'the pass is rolled along the grass');
assert.ok(F.SHP[2]<F.VP[1]-5,'to Vitinha’s right (the right channel)');
assert.ok(F.doueAt(0)[1]<22&&F.doueAt(0)[0]<F.SHP[0]-4,'Doué is running down the right channel, the ball played ahead of him');
// 4 the finish: first time, right instep, far corner, past the keeper
const ds=F.doueFeet(F.T_SH),bs=F.ballAt(F.T_SH);assert.ok(d2(ds.r,bs)<.3&&d2(ds.r,bs)<d2(ds.l,bs),`Doué meets it first time with his right boot (${d2(ds.r,bs).toFixed(2)} m)`);
const cv=F.coverAt(F.T_SH),da=F.doueAt(F.T_SH);assert.ok(Math.hypot(cv[0]-da[0],cv[1]-da[1])<4,'a retreating defender closing at his back');
const g=F.ballAt(F.T_GOAL);assert.ok(Math.abs(g[0]-105)<.05&&g[2]>34&&g[2]<37.5&&g[1]<.6,'in low at the far post, between the posts');
const kp=F.keeperAt();assert.ok(g[2]-kp[1]>3,'across the keeper, into the far corner');
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
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${text.length} chars, ${total}s, ${tc.length} touches, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
