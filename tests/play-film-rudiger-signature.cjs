// Iconic-play film: Antonio Rüdiger's never-give-up tackle — the last-ditch block on Phil Foden, Champions League final 2021
// (lib/plays/riso/rudiger-signature.ts). Structural checks, no browser: story shape (4 chapters: live, slow replay, second replay, lesson),
// narration = public/plays/narration/rudiger-signature/script.json, 70–90 words ending with the lesson, cue words in order inside their
// chapter and starting with a plain word (Kokoro timing), length 20–45 s; every figure through the one drawPlayer() adapter on the shared
// athlete library; the sourced facts (Foden free in the box, a shot across Mendy, blocked by Rüdiger's stretched leg, the ball into
// Mendy's arms); the voice hook; and every chapter drawn through a stub canvas at the three card sizes. The loader handles .ts and .json imports.
// usage: node tests/play-film-rudiger-signature.cjs
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

const ID='rudiger-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
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
assert.ok(/Antonio Rüdiger/.test(text)&&/Phil Foden/.test(text)&&/De Bruyne/.test(text)&&/Mendy/.test(text)&&/Champions League final/.test(text),'Rüdiger, Foden, De Bruyne, Mendy and the final are narrated');
const last=film.chapters[3].narration;
assert.ok(/never-give-up tackle/.test(last)&&/Chase every ball/.test(last)&&/Hard work wins it back/.test(last),'ends with the lesson (chase every ball, hard work wins it back)');
// the look contract: full-sheet framing, the voice hook, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:2,/.test(src)&&/number:47,/.test(src)&&/number:17,/.test(src)&&/number:16,/.test(src),'Rüdiger 2, Foden 47, De Bruyne 17, Mendy 16');
assert.ok(/shirt:B,trim:'paper',shorts:B,socks:'paper'/.test(src)&&/shirt:\[B,\.4\],trim:'paper',shorts:'paper',socks:\[B,\.4\]/.test(src),'Chelsea blue/blue/white, City sky blue/white/sky blue');
assert.equal(JSON.stringify(film.chapters.map(c=>c.cues.length)),'[6,5,4,6]','cue counts the scenes key their actions to');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  const first=c.words.split(/\s+/)[0];assert.ok(/^[A-Za-z0-9]+$/.test(first),`ch${i+1} cue "${c.words}" starts with a plain word (Kokoro splits contractions, hyphens, accents)`);
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=45,`length ${total}s`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MOMENT/.test(src),'sources, confirmed/inferred and why this moment listed at the top');
// the block as the sources describe it: Foden free inside Chelsea's penalty area on City's left (the near side here), shooting across Mendy
// toward the far (bottom right) corner; Rüdiger's stretched (left) leg meets the ball; the ball balloons into Mendy's arms
const inBox=([x,z])=>x>0&&x<16.5&&z>13.84&&z<54.16;
assert.ok(inBox(F.SHOT_AT)&&F.SHOT_AT[1]<34,`the shot from inside the area, left of centre (${F.SHOT_AT.map(v=>v.toFixed(2))})`);
assert.ok(inBox(F.BALL_B),'the block inside the area');
const aim=[F.BALL_B[0]-F.SHOT_AT[0],F.BALL_B[1]-F.SHOT_AT[1]];assert.ok(aim[0]<0&&aim[1]>0,'the shot goes goalward and across (toward the far post)');
const zAtLine=F.SHOT_AT[1]+aim[1]*(-F.SHOT_AT[0]/aim[0]);assert.ok(zAtLine>33&&zAtLine<37.66,`the shot aims inside the far post (${zAtLine.toFixed(2)})`);
const dd=(p,b)=>Math.hypot(p[0]-b[0],p[2]-b[1]);
const rl=F.rudiFoot('l'),rr=F.rudiFoot('r');assert.ok(dd(rl,F.BALL_B)<.25&&dd(rr,F.BALL_B)>.5,`Rüdiger's stretched left boot blocks (left ${dd(rl,F.BALL_B).toFixed(2)} m, right ${dd(rr,F.BALL_B).toFixed(2)} m)`);
assert.ok(rl[1]<.3,`the boot is low at the ball (${rl[1].toFixed(2)} m)`);
const fl=F.fodenFoot('l'),fr=F.fodenFoot('r');assert.ok(dd(fl,F.SHOT_AT)<.25&&dd(fr,F.SHOT_AT)>.3,`Foden strikes with his left (left ${dd(fl,F.SHOT_AT).toFixed(2)} m, right ${dd(fr,F.SHOT_AT).toFixed(2)} m)`);
const b0=F.ballAt(F.T_SHOT),b1=F.ballAt(F.T_BLOCK);assert.ok(Math.hypot(b0[0]-F.SHOT_AT[0],b0[2]-F.SHOT_AT[1])<.05&&Math.hypot(b1[0]-F.BALL_B[0],b1[2]-F.BALL_B[1])<.05,'the ball is at the boots at the shot and block frames');
let apex=0;for(let T=F.T_BLOCK;T<F.T_CATCH;T+=.05)apex=Math.max(apex,F.ballAt(T)[1]);assert.ok(apex>1.8&&apex<4.5,`the ball balloons up off the block (apex ${apex.toFixed(2)} m)`);
const bc=F.ballAt(F.T_CATCH);assert.ok(Math.hypot(bc[0]-F.CATCH_PT[0],bc[1]-F.CATCH_PT[1],bc[2]-F.CATCH_PT[2])<.05&&bc[0]<3,'the ball drops into Mendy\'s hands at his goal');
const bh=F.ballAt(F.T_CATCH+1.2);assert.ok(bh[0]<3.5&&bh[1]>.6,'and stays in his arms');
// never give up: Rüdiger starts on the far side of the play, well behind the ball, and sprints back (goalside only at the end)
const r0=F.rudiAt(0),f0=F.fodenAt(0);assert.ok(r0[1]>f0[1]+10,'Rüdiger starts across on the far side of the box');
let top=0;for(let T=-1.5;T<F.T_BLOCK-.45;T+=.1)top=Math.max(top,F.speed('rudi',T));assert.ok(top>5.5&&top<9.5,`a real sprint, not a teleport (${top.toFixed(1)} m/s)`);
for(const id of ['foden','kdb','silva','azpi','james','sterling','kante','jorginho','chilwell','mahrez','gundogan'])for(let T=-1.7;T<8;T+=.2)assert.ok(F.speed(id,T)<9.5,`${id} runs at a human speed at T=${T.toFixed(1)}`);
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
