// Signature film: Enzo Fernández, "the curler from range" — his curler v Mexico, World Cup 2022 (lib/plays/riso/enzo-fernandez-signature.ts).
// Structural checks, no browser: story shape (4 chapters: live, the shimmy in slow motion, the curl from behind the goal, lesson), narration = script.json,
// 70–90 words ending with the lesson, cue words are substrings in order and inside their chapter before the passage, length 20–42 s;
// every figure goes through the one drawPlayer() adapter on the shared athlete library; seeded randomness only; when timing.json (the
// voice generator's output) exists, the film must import it (every chapter has its audio file and its seconds cover the clip).
// Also renders every chapter through a stub canvas at the three card sizes so a draw error fails here, not in the card.
// usage: node tests/play-film-enzo-fernandez-signature.cjs
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

const ID='enzo-fernandez-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, slow replay of the shimmy, the curl, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Enzo Fernández/.test(text)&&/Messi/.test(text)&&/Mexico/.test(text)&&/Gutiérrez/.test(text)&&/Ochoa/.test(text),'the scorer, the assist, the opponent, the man he beat and the keeper are narrated');
assert.ok(/short corner/.test(text)&&/Right foot/.test(text)&&/far corner/.test(text)&&/two-nil/.test(text),'the confirmed beats: short corner, right foot, far corner, 2–0');
assert.ok(!/shorts|socks|left foot|87|minute|penalt|free.kick|outside the box/i.test(text),'unverified details, the wrong foot and the minute are not narrated');
const last=film.chapters[3].narration;
assert.ok(/open your body/.test(last)&&/inside of your foot/.test(last)&&/Curl the ball towards the far corner, away from the keeper's reach/.test(last),'ends with the lesson (the card\'s lesson line)');
for(const ch of film.chapters)for(const c of ch.cues){const w=c.words.split(/\s+/)[0];assert.ok(!/['’\-–]/.test(w),`cue "${c.words}" starts with a plain word (Kokoro splits contractions / hyphens)`);}
// the look contract: full-sheet framing, the voice hook, right foot, the real kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/strike\(STRIKE_CONTACT,\{foot:'r',power:\.6\}\)/.test(src)&&/strike\(Math\.min\(1,u\),\{foot:'r',power:\.6\}\)/.test(src),'Enzo strikes with his RIGHT foot (FIFA event data)');
assert.ok(/number:24,/.test(src)&&/number:14,/.test(src)&&/number:13,/.test(src),'Enzo 24, Gutiérrez 14, Ochoa 13');
assert.ok(/const ARG=.*pattern:'stripes',patternInk:'paper',shorts:K,socks:'paper'/.test(src),'Argentina: stripes, black shorts, white socks');
assert.ok(/const MEX=.*shirt:\[B,\.9\],shorts:'paper',socks:\[R,\.9\]/.test(src)&&/green:a\.role==='mex'/.test(src),'Mexico: green (blue + yellow overprint) shirts, white shorts, red socks');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=42,`length ${total}s`);
// the choreography: the right boot meets the ball at the strike, from the left corner of the area; the curl ends in the far top corner,
// bends (starts aimed outside the far post), and stays out of Ochoa's reach; Gutiérrez is on him at the shimmy
const toe=F.enRightToeAt(F.SHOT),sf=F.SHOT_FROM;assert.ok(Math.hypot(toe[0]-sf[0],toe[2]-sf[2])<.3,`right boot at the ball on the shot (${Math.hypot(toe[0]-sf[0],toe[2]-sf[2]).toFixed(2)} m)`);
assert.ok(sf[0]>86&&sf[0]<92&&sf[2]<-13&&sf[2]>-21,`shot from the left corner of the area (${sf[0].toFixed(1)}, ${sf[2].toFixed(1)})`);
const b0=F.ballAt(0);assert.ok(b0[0]>87&&b0[0]<90&&b0[2]<-18.5,'first touch on the left corner of the area');
const end=F.ballAt(F.IN_NET-.01);assert.ok(end[0]>104.8&&end[2]>1.5&&end[2]<3.66&&end[1]>1.6&&end[1]<2.44,`far TOP corner (${end.map(v=>v.toFixed(2))})`);
const early=F.curlAt(.15),dirE=Math.atan2(early[2]-sf[2],early[0]-sf[0]),dirT=Math.atan2(F.NET[2]-sf[2],F.NET[0]-sf[0]);assert.ok(dirE>dirT+.1,'the ball starts outside the line to the far corner and bends back in (right-foot curl)');
const g=F.posOf('Gutiérrez',1),e=F.posOf('Enzo',1);assert.ok(Math.hypot(g[0]-e[0],g[1]-e[1])<2.2,'Gutiérrez is on him at the shimmy');
let minD=1e9;for(let u=.8;u<=1;u+=.02){const b=F.curlAt(u),tau=F.SHOT+u*(F.IN_NET-F.SHOT);for(const h of F.ochoaReachAt(tau))minD=Math.min(minD,Math.hypot(b[0]-h[0],b[1]-h[1],b[2]-h[2]));}
assert.ok(minD>.25,`the curl beats Ochoa's glove (closest ${minD.toFixed(2)} m)`);assert.ok(minD<1.6,`but he leaps toward it (closest ${minD.toFixed(2)} m)`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MOMENT/.test(src),'sources + confirmed/inferred + why this moment listed at the top');
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
