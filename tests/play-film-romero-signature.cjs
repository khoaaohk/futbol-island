// Iconic-play film: Cristian Romero's signature fearless slide tackle, shown in Tottenham v Manchester United, Europa League final 2025
// (lib/plays/riso/romero-signature.ts). Structural checks, no browser: story shape (4 chapters: live, slow replay, second replay, lesson),
// narration = public/plays/narration/romero-signature/script.json, 70–90 words ending with the lesson, cue words in order inside their chapter
// and never starting with a contraction or hyphenated word, length 20–45 s; every figure through the one drawPlayer() adapter on the shared
// athlete library; the signature as the lesson teaches it (the long ball drops, Romero is closer to it than the striker when he commits, the
// boot nearer the ball takes it first, the striker is not touched, the ball goes to a team-mate); the voice hook; and every chapter drawn through
// a stub canvas at the three card sizes. The loader handles .ts and .json imports.
// usage: node tests/play-film-romero-signature.cjs
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

const ID='romero-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
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
assert.ok(/Cristian Romero/.test(text)&&/Europa League final/.test(text)&&/Manchester United/.test(text)&&/Tottenham/.test(text)&&/Bilbao/.test(text),'Romero, the final, both clubs and Bilbao are narrated');
assert.ok(/Here is how/.test(text),'honest "how he did it" framing (no invented minute or specific tackle)');
assert.ok(/player of the match/.test(text),'the sourced honour: UEFA Player of the Match');
assert.ok(!/minute|goal!|Højlund|Hojlund|Maguire|Shaw/i.test(text),'no invented minute, scoreline or named United opponent');
const last=film.chapters[3].narration;
assert.ok(/slide only when you are sure you can reach the ball first/.test(last)&&/Stay on your feet/.test(last),'ends with the lesson (slide only when sure to reach it first; otherwise stay on your feet)');
assert.ok(/21 May 2025/.test(film.ageNote),'the match date is stated');
// the look contract: full-sheet framing, the voice hook, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:17,/.test(src)&&/number:23,/.test(src)&&/number:1,/.test(src),'Romero 17, Porro 23, Vicario 1');
assert.ok(/shirt:'paper',trim:K,shorts:'paper',socks:'paper'/.test(src)&&/shirt:R,trim:'paper',shorts:K,socks:K/.test(src),'Spurs white/navy trim/white/white, United red/black/black');
assert.equal(JSON.stringify(film.chapters.map(c=>c.cues.length)),'[6,5,5,5]','cue counts the scenes key their actions to');
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
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MATCH/.test(src),'sources, confirmed/inferred and why, at the top');
// the play: the long ball is struck by the launcher's right boot, is in the air, and drops beyond the pair
const lf0=F.launcherFoot();assert.ok(Math.hypot(lf0[0]-F.LAUNCH[0],lf0[2]-F.LAUNCH[1])<.3,`the long ball leaves the launcher's boot (${Math.hypot(lf0[0]-F.LAUNCH[0],lf0[2]-F.LAUNCH[1]).toFixed(2)} m)`);
assert.ok(F.ballAt(F.T_LAND/2)[1]>4,'a long ball: high in the air mid-flight');
assert.ok(F.LAUNCH[0]>F.BALL_T[0]+25,'played over the top from far upfield');
// the signature as the lesson teaches it: when he commits, he is closer to the ball than the striker; his boot gets there first
const r0=F.reach(F.T_SLIDE);assert.ok(r0.romero<r0.striker-.3,`a step closer when he slides (Romero ${r0.romero.toFixed(2)} m, striker ${r0.striker.toFixed(2)} m)`);
const lf=F.leftFoot(),rf=F.rightFoot(),d=(p)=>Math.hypot(p[0]-F.BALL_T[0],p[2]-F.BALL_T[1]);
assert.ok(d(lf)<.25&&d(rf)>.5,`the boot nearer the ball (left) takes it (left ${d(lf).toFixed(2)} m, right ${d(rf).toFixed(2)} m)`);
assert.ok(lf[1]<.22,`the boot is down at the ball: a slide (${lf[1].toFixed(2)} m)`);
const b=F.ballAt(F.T_CONTACT);assert.ok(Math.hypot(b[0]-F.BALL_T[0],b[2]-F.BALL_T[1])<.05,'the ball is at the boot at the contact frame');
const sc=F.strikerAt(F.T_CONTACT-.01);assert.ok(Math.hypot(sc[0]-F.BALL_T[0],sc[1]-F.BALL_T[1])>1,'the striker is still a stride away when the boot reaches the ball (ball first)');
for(let T=0;T<=F.T_SLIDE;T+=.1){const s=F.strikerAt(T),r=F.romeroAt(T);assert.ok(Math.hypot(s[0]-r[0],s[1]-r[1])>1,`no body overlap in the race (T=${T.toFixed(1)})`);}
const pb=F.ballAt(F.T_PORRO+.5);assert.ok(Math.hypot(pb[0]-F.PORRO_RECV[0],pb[2]-F.PORRO_RECV[1])<.1&&pb[2]>0,'poked away to Porro, still in play');
assert.ok(F.BALL_T[0]>16.5,'the tackle is outside the area (no penalty risk)');
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
