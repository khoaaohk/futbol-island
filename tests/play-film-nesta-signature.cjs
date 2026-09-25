// Iconic-play film: Alessandro Nesta's signature clean slide tackle, shown through his 44th-minute hook off Ciro Ferrara's toe, Juventus v
// AC Milan, Champions League final, 28 May 2003, Old Trafford (lib/plays/riso/nesta-signature.ts). Structural checks, no browser: story
// shape (4 chapters: live, slow replay, second replay, lesson), narration = public/plays/narration/nesta-signature/script.json, 70–90 words
// ending with the lesson, cue words in order inside their chapter, length 20–45 s; every figure through the one drawPlayer() adapter on the
// shared athlete library; the sourced facts (Ferrara two yards out, the ball hooked off his toe, no goal) and the clean-tackle geometry (Nesta's
// toe on the ball, nothing of him touching Ferrara); the voice hook; and every chapter drawn through a stub canvas at the three card sizes.
// The loader handles .ts and .json imports.
// usage: node tests/play-film-nesta-signature.cjs
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

const ID='nesta-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
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
assert.ok(/Alessandro Nesta/.test(text)&&/Ciro Ferrara/.test(text)&&/2003/.test(text)&&/Champions League final/.test(text)&&/Manchester/.test(text),'Nesta, Ferrara and the 2003 final are narrated');
assert.ok(/two yards/.test(text)&&/hooks it off his toe/.test(text)&&/half-time/.test(text),'the sourced beats: just before half-time, two yards out, hooked off his toe');
const footage=film.chapters.slice(0,3).map(c=>c.narration).join(' ');
assert.ok(!/slide|sliding|corner/i.test(footage),'the footage chapters claim no unsourced slide or corner (the source says "hooking")');
const last=film.chapters[3].narration;
assert.ok(/leg low/.test(last)&&/take the ball/.test(last)&&/not the player/.test(last),'ends with the lesson (slide, leg low, take the ball, not the player)');
assert.ok(/28 May 2003/.test(film.ageNote)&&/Old Trafford/.test(film.ageNote),'the match date and venue are stated');
// the look contract: full-sheet framing, the voice hook, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:13,/.test(src)&&/number:2,/.test(src)&&/number:12,/.test(src),'Nesta 13, Ferrara 2, Dida 12');
assert.ok(/shirt:'paper',shorts:'paper',socks:'paper'/.test(src)&&/pattern:'stripes',patternInk:\[K,\.95\],shorts:\[K,\.95\],socks:\[K,\.95\]/.test(src),'Milan all white, Juventus stripes with black shorts and socks');
assert.equal(JSON.stringify(film.chapters.map(c=>c.cues.length)),'[8,5,4,5]','cue counts the scenes key their actions to');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=45,`length ${total}s`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MOMENT/.test(src),'sources, confirmed/inferred and why this moment, at the top');
// the moment as the account describes it: in Milan's goalmouth, about two yards out; the ball arrives, Nesta's toe is on it, it leaves away
// from goal; Ferrara's swing finds nothing, and nothing of Nesta touches Ferrara's legs (the ball, not the player)
const d2=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
assert.ok(F.BALL0[0]>1.2&&F.BALL0[0]<2.8&&F.BALL0[1]>30.34&&F.BALL0[1]<37.66,`the ball drops about two yards out, in front of goal (${F.BALL0})`);
const b0=F.ballAt(F.T_HOOK);assert.ok(Math.hypot(b0[0]-F.BALL0[0],b0[2]-F.BALL0[1])<.05,'the ball is at the spot at the hook');
const toe=F.nestaToe();assert.ok(Math.hypot(toe[0]-b0[0],toe[1]-b0[1],toe[2]-b0[2])<.3&&toe[1]<.35,`Nesta's right toe is on the ball at the hook (${d2(toe,b0).toFixed(2)} m, ${toe[1].toFixed(2)} m up)`);
assert.ok(F.nestaPelvisY()<.5,`Nesta goes in low (pelvis ${F.nestaPelvisY().toFixed(2)} m)`);
const fb=F.ballAt(F.T_F),ft=F.ferraraRightToe();assert.ok(d2(ft,fb)>.5,`Ferrara's swing finds no ball (${d2(ft,fb).toFixed(2)} m)`);
assert.ok(d2(F.ferraraRightToe(),[F.BALL0[0],0,F.BALL0[1]])<.7,'Ferrara was about to hit it: his right boot swings through the spot');
let minGap=9,at=0;for(let T=-.6;T<=1.2;T+=.02){const legs=F.ferraraLegs(T);for(const p of F.nestaBody(T))for(const q of legs){const g=Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);if(g<minGap){minGap=g;at=T;}}}
assert.ok(minGap>.2,`the ball, not the player: Nesta never touches Ferrara's legs (closest ${minGap.toFixed(2)} m at T=${at.toFixed(2)})`);
const br=F.ballAt(F.T_HOOK+3);assert.ok(br[0]>0&&(br[2]<30.34||br[2]>37.66||br[0]>2.5),'no goal: the ball ends outside the goal, in play');
for(let T=0;T<3;T+=.1){const b=F.ballAt(T);assert.ok(!(b[0]<0&&b[2]>30.34&&b[2]<37.66),`no goal at T=${T.toFixed(1)}`);}
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
