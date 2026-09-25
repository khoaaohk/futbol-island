// Iconic-play film: Ousmane Dembélé's signature, "the two-footed dribble", shown in one real, sourced moment: PSG's second goal in the
// Champions League final, Paris Saint-Germain 5-0 Inter, 31 May 2025, Munich (lib/plays/riso/dembele-signature.ts) — his gallop, head up,
// and the curled cross-field switch to Doué, who chests it and scores off Dimarco. Structural checks, no browser: story shape (4 chapters:
// live, slow replay, second replay, lesson), narration = public/plays/narration/dembele-signature/script.json, 70-90 words ending with the
// lesson, cue words in order inside their chapter (each starting with a plain word), length 20-45 s; every figure through the one
// drawPlayer() adapter on the shared athlete library; the contact points (the feeder's pass, touches on BOTH of Dembélé's boots, his pass,
// Doué's chest and strike, the flick off Dimarco's back, in between the posts); the voice hook; every chapter drawn through a stub canvas at
// the three card sizes. The loader handles .ts and .json imports.
// usage: node tests/play-film-dembele-signature.cjs
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

const ID='dembele-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
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
assert.ok(/Dembélé/.test(text)&&/Munich/.test(text)&&/2025/.test(text)&&/Champions League final/.test(text)&&/Inter/.test(text)&&/Doué/.test(text),'Dembélé, Doué, Munich, the 2025 final and Inter are narrated');
assert.ok(/head up/.test(text)&&/curls it across/.test(text)&&/chests it/.test(text)&&/flicks off a defender/.test(text),'the sourced actions: head up, the curled switch, the chest, the deflection');
assert.ok(/five–nil/.test(text)&&/first Champions League/.test(text),'the sourced facts: 5–0, their first Champions League');
assert.ok(!/right foot|left foot|Dimarco|Sommer|beats|beat /i.test(text),'no inferred feet or beaten players are narrated (the deflection is unnamed)');
const last=film.chapters[3].narration;
assert.ok(/practise with both feet/.test(last)&&/defenders never know which way you’ll go/.test(last),'ends with the lesson (both feet, defenders never know which way)');
assert.ok(/31 May 2025/.test(film.ageNote),'the match date is stated');
// the look contract: full-sheet framing, the voice hook, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:10,/.test(src)&&/number:14,/.test(src)&&/number:32,/.test(src),'Dembélé 10, Doué 14, Dimarco 32');
assert.ok(/shirt:\[K,\.95\],trim:R,shorts:\[K,\.95\],socks:\[K,\.95\]/.test(src)&&/shirt:Y,trim:K,shorts:Y,socks:Y/.test(src),'PSG all navy (red trim), Inter third kit all yellow');
assert.equal(JSON.stringify(film.chapters.map(c=>c.cues.length)),'[6,5,4,4]','cue counts the scenes key their actions to');
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
const tf=F.T_FEED(),ff=F.feederFeet(tf),fb=[F.feederBall[0],.11,F.feederBall[1]];
assert.ok(d2(ff.r,fb)<.3&&d2(ff.r,fb)<d2(ff.l,fb),`the feeder's right boot plays the pass (${d2(ff.r,fb).toFixed(2)} m)`);
const tc=F.touches();assert.ok(tc.length>=5,`${tc.length} touches on the gallop`);
assert.ok(tc.filter(t=>t.foot==='l').length>=2&&tc.filter(t=>t.foot==='r').length>=2,'touches on BOTH boots (the two-footed dribble)');
for(const t of tc){const fe=F.dembFeet(t.T),b=F.ballAt(t.T),on=t.foot==='l'?fe.l:fe.r,off=t.foot==='l'?fe.r:fe.l;
 assert.ok(d2(on,b)<.3&&d2(on,b)<d2(off,b),`touch at ${t.T.toFixed(2)}s on the ${t.foot} boot (${d2(on,b).toFixed(2)} m)`);}
assert.ok(tc[0].T>-5.6&&tc[tc.length-1].T<F.S_START,'the touches run from his first touch to the pass');
const df=F.dembFeet(0),lb=[F.LB[0],.11,F.LB[1]];assert.ok(d2(df.r,lb)<.3&&d2(df.r,lb)<d2(df.l,lb),`his boot strikes the switch (${d2(df.r,lb).toFixed(2)} m)`);
assert.ok(df.pelvisY>.7,'on his feet at the pass');
assert.ok(F.dembAt(-4)[1]>44&&F.dembAt(0)[1]>40,'he carries it on the far side (the left of the attack)');
assert.ok(F.backerAt(-1)[0]>F.dembAt(-1)[0]+3,'the defender backs off in front of him');
const apex=F.ballAt(F.T_CH/2);assert.ok(apex[1]>3,`the switch is lofted (${apex[1].toFixed(1)} m)`);
assert.ok(F.CH[2]<F.LB[1]-15&&F.CH[0]>88,'it crosses to the right edge of Inter’s box');
const dc=F.doueFeet(F.T_CH),bc=F.ballAt(F.T_CH);assert.ok(Math.hypot(dc.chest[0]-bc[0],dc.chest[1]-bc[1],dc.chest[2]-bc[2])<.4,'the ball meets Doué’s chest');
assert.ok(F.ballAt(F.T_BN)[1]<.15,'it drops and bounces');
const ds=F.doueFeet(F.T_SH),bs=F.ballAt(F.T_SH);assert.ok(d2(ds.r,bs)<.3,`Doué’s right boot hits it at the top of the bounce (${d2(ds.r,bs).toFixed(2)} m, ${bs[1].toFixed(2)} m up)`);
assert.ok(F.ballAt(F.T_SH-.08)[1]<bs[1],'the ball is still rising just before the strike (top of the bounce)');
const dm=F.dimarco(F.T_SH),dmh=[Math.cos(dm.yaw),Math.sin(dm.yaw)],away=[dm.at[0]-F.SHP[0],dm.at[1]-F.SHP[2]];
assert.ok(dmh[0]*away[0]+dmh[1]*away[1]>0,'Dimarco has turned his back to the shot');
assert.ok(Math.hypot(F.DF[0]-dm.at[0],F.DF[2]-dm.at[1])<.4,'the ball flicks off him');
const g=F.ballAt(F.T_GOAL);assert.ok(Math.abs(g[0]-105)<.05&&g[2]>30.5&&g[2]<37.5&&g[1]<2.3,'in between the posts, under the bar');
const kp=F.keeperAt();assert.ok(Math.abs(g[2]-kp[1])>1.2,'the deflection goes past the keeper');
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
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${text.length} chars, ${total}s, ${tc.length} touches (${tc.map(t=>t.foot).join('')}), ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
