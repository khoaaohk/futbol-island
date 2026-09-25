// Iconic-play film: Nuno Mendes's signature, "the flying left-back overlap", shown in one real, sourced moment: Portugal's second goal in
// the Nations League final, Portugal 2-2 Spain (5-3 pens), 8 June 2025, Munich (lib/plays/riso/nuno-mendes-signature.ts) — his run up the
// left past Lamine Yamal, the deflected cross looping behind Cucurella, Ronaldo's volley. Structural checks, no browser: story shape (4
// chapters: live, slow replay, second replay, lesson), narration = public/plays/narration/nuno-mendes-signature/script.json, 70-90 words
// ending with the lesson, cue words in order inside their chapter (each starting with a plain word), length 20-45 s; every figure through
// the one drawPlayer() adapter on the shared athlete library; the contact points (the winger's pass, the overlap on the outside, Mendes's
// left-boot touches and cross, the flick off the defender's boot, the loop behind Cucurella, Ronaldo's right-foot volley, in); the voice
// hook; every chapter drawn through a stub canvas at the three card sizes. The loader handles .ts and .json imports.
// usage: node tests/play-film-nuno-mendes-signature.cjs
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

const ID='nuno-mendes-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
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
assert.ok(/Nuno Mendes/.test(text)&&/Munich/.test(text)&&/2025/.test(text)&&/Nations League final/.test(text)&&/Spain/.test(text)&&/Yamal/.test(text)&&/Ronaldo/.test(text)&&/Cucurella/.test(text),'Mendes, Yamal, Ronaldo, Cucurella, Munich, the 2025 Nations League final and Spain are narrated');
assert.ok(/left wing/.test(text)&&/past Lamine Yamal/.test(text)&&/flicks off a defender/.test(text)&&/drops behind Cucurella/.test(text)&&/holds him off/.test(text)&&/volleys it in/.test(text),'the sourced actions: up the left past Yamal, the deflection, the drop behind Cucurella, held off, the volley');
assert.ok(/on penalties/.test(text),'the sourced result: won on penalties');
assert.ok(!/right foot|left foot|Neto|Mingueza|Simón|Simon|Le Normand|Huijsen|pass(es|ed)? (it )?to him/i.test(text),'no inferred feet, passer, deflecting player or keeper is narrated');
const last=film.chapters[3].narration;
assert.ok(/sprint past your winger/.test(last)&&/on the outside/.test(last)&&/easy pass/.test(last),'ends with the lesson (past your winger, on the outside, an easy pass)');
assert.ok(/8 June 2025/.test(film.ageNote),'the match date is stated');
// the look contract: full-sheet framing, the voice hook, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:25,/.test(src)&&/number:7,/.test(src)&&/number:19,/.test(src)&&/number:24,/.test(src)&&/number:23,/.test(src),'Mendes 25, Ronaldo 7, Yamal 19, Cucurella 24, Simón 23');
assert.ok(/shirt:\[R,\.95\],trim:G,shorts:\[G,\.95\],socks:\[R,\.95\]/.test(src)&&/shirt:\[Y,\.72\],trim:G,shorts:\[Y,\.72\],socks:\[Y,\.72\]/.test(src),'Portugal red / dark green / red, Spain all pale lime-yellow');
assert.equal(JSON.stringify(film.chapters.map(c=>c.cues.length)),'[5,5,4,4]','cue counts the scenes key their actions to');
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
const d2=(p,q)=>Math.hypot(p[0]-q[0],p[2]-q[2]);
const tf=F.T_FEED(),wf=F.wingerFeet(tf),fb=[F.feedBall[0],.11,F.feedBall[1]];
assert.ok(d2(wf.l,fb)<.3&&d2(wf.l,fb)<d2(wf.r,fb),`the winger's boot plays the pass (${d2(wf.l,fb).toFixed(2)} m)`);
// the overlap: Mendes starts behind the winger, passes him on the OUTSIDE (higher Z = nearer the left touchline), and is ahead when the ball arrives
const behind=F.mendesAt(-6),wb=F.wingerAt(-6);assert.ok(behind[0]<wb[0]-10,'Mendes starts deep, behind the winger');
let passT=null;for(let T=-6;T<-1;T+=.02){if(F.mendesAt(T)[0]>=F.wingerAt(T)[0]){passT=T;break;}}
assert.ok(passT!==null,'he runs past the winger');const mp=F.mendesAt(passT),wp=F.wingerAt(passT);
assert.ok(mp[1]>wp[1]+2.5&&mp[1]<68,`on the outside: ${mp[1].toFixed(1)} vs the winger ${wp[1].toFixed(1)} (touchline at 68) at ${passT.toFixed(2)}s`);
const tc=F.touches();assert.ok(tc.length>=2,`${tc.length} touches before the cross`);
assert.ok(tc[0].T>tf+.5,'the pass is played into his path before he gets there');
for(const t of tc){const fe=F.mendesFeet(t.T),b=F.ballAt(t.T);assert.ok(d2(fe.l,b)<.3&&d2(fe.l,b)<d2(fe.r,b),`touch at ${t.T.toFixed(2)}s on the left boot (${d2(fe.l,b).toFixed(2)} m)`);}
const mf=F.mendesFeet(0),lb=[F.LB[0],.11,F.LB[1]];assert.ok(d2(mf.l,lb)<.3&&d2(mf.l,lb)<d2(mf.r,lb),`his left boot crosses (${d2(mf.l,lb).toFixed(2)} m)`);
assert.ok(mf.pelvisY>.7,'on his feet at the cross');assert.ok(F.LB[1]>60,'the cross comes from the left touchline');
const ya=F.yamalAt(0),ma=F.mendesAt(0);assert.ok(ma[0]-ya[0]>3.5,`he has escaped Yamal (${(ma[0]-ya[0]).toFixed(1)} m clear)`);
const ym=F.yamalAt(-4.6),mm=F.mendesAt(-4.6);assert.ok(Math.hypot(ym[0]-mm[0],ym[1]-mm[1])<2.2,'Yamal was with him before the sprint');
const bf=F.blockerFeet(F.T_DF);assert.ok(d2(bf.r,F.DF)<.35,`the cross flicks off the defender's boot (${d2(bf.r,F.DF).toFixed(2)} m)`);
let apex=0;for(let T=F.T_DF;T<F.T_V;T+=.02)apex=Math.max(apex,F.ballAt(T)[1]);assert.ok(apex>3.5,`it loops up (${apex.toFixed(1)} m)`);
const cu=F.cucuAt(F.T_V);assert.ok(F.VP[2]<cu[1]-.8,'it drops behind Cucurella (further from the crosser)');
const ro=F.ronaldoAt(F.T_V);assert.ok(Math.hypot(ro[0]-cu[0],ro[1]-cu[1])<3.2,'Ronaldo is holding Cucurella off');
const rf=F.ronaldoFeet(F.T_V),bv=F.ballAt(F.T_V);assert.ok(Math.hypot(rf.r[0]-bv[0],rf.r[2]-bv[2])<.3&&Math.hypot(rf.r[0]-bv[0],rf.r[2]-bv[2])<Math.hypot(rf.l[0]-bv[0],rf.l[2]-bv[2]),`Ronaldo's right boot volleys it (${Math.hypot(rf.r[0]-bv[0],rf.r[2]-bv[2]).toFixed(2)} m, ${bv[1].toFixed(2)} m up)`);
assert.ok(bv[1]>.25,'a volley: the ball is off the ground');assert.ok(105-F.VP[0]<7,'from close range');
const g=F.ballAt(F.T_GOAL);assert.ok(Math.abs(g[0]-105)<.05&&g[2]>30.5&&g[2]<37.5&&g[1]<2.3,'in between the posts, under the bar');
assert.ok(Math.abs(g[2]-F.keeperAt()[1])>1.5,'past the keeper');
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
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${text.length} chars, ${total}s, ${tc.length} touches, overlap at ${passT.toFixed(2)}s, loop ${apex.toFixed(1)} m, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
