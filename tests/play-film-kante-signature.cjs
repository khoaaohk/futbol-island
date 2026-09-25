// Iconic-play film: N'Golo Kanté's ball-winning sprint — the sliding tackle from behind on Kevin De Bruyne, Champions League final 2021
// (lib/plays/riso/kante-signature.ts). Structural checks, no browser: story shape (4 chapters: live, slow replay, second replay, lesson),
// narration = public/plays/narration/kante-signature/script.json, 70–90 words ending with the lesson, cue words in order inside their
// chapter and starting with a plain word (Kokoro timing), length 20–45 s; every figure through the one drawPlayer() adapter on the shared
// athlete library; the sourced facts (De Bruyne on the ball in the inside-left channel shaping to shoot, Kanté sliding in from behind and
// hooking it away before the shot); the voice hook; and every chapter drawn through a stub canvas at the three card sizes. The loader
// handles .ts and .json imports.
// usage: node tests/play-film-kante-signature.cjs
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

const ID='kante-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
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
assert.ok(/N'Golo Kanté/.test(text)&&/Kevin De Bruyne/.test(text)&&/Champions League final/.test(text)&&/player of the match/.test(text),'Kanté, De Bruyne, the final and his award are narrated');
const last=film.chapters[3].narration;
assert.ok(/ball-winning sprint/.test(last)&&/press straight away/.test(last)&&/right away/.test(last),'ends with the lesson (press straight away; the best time is right away)');
// the look contract: full-sheet framing, the voice hook, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming);/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook (null until the lead voices it) passed into withTiming');
assert.ok(/number:7,seed:7,/.test(src)&&/number:17,/.test(src)&&/number:16,/.test(src)&&/number:4,/.test(src),'Kanté 7, De Bruyne 17, Mendy 16, Christensen 4 (on for Silva at 39\')');
assert.ok(!/number:6,/.test(src),'Thiago Silva (6) had gone off by the 52nd minute');
assert.ok(/shirt:B,trim:'paper',shorts:B,socks:'paper'/.test(src)&&/shirt:\[B,\.4\],trim:'paper',shorts:'paper',socks:\[B,\.4\]/.test(src),'Chelsea blue/blue/white, City sky blue/white/sky blue');
assert.equal(JSON.stringify(film.chapters.map(c=>c.cues.length)),'[6,5,4,7]','cue counts the scenes key their actions to');
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
// the tackle as the source describes it: De Bruyne on the ball in City's inside-left channel (low Z here), shaping to shoot toward
// Chelsea's goal (X=0); Kanté slides in from BEHIND him and hooks the ball away before the right-foot shot; so no shot
const [bx,bz]=F.BALL_K;assert.ok(bx>16.5&&bx<30&&bz>13.84&&bz<30,`the set-up just outside the area, in the inside-left channel (${bx},${bz})`);
const dd=(p,b)=>Math.hypot(p[0]-b[0],p[2]-b[1]);
const kl=F.kanteFoot('l'),kr=F.kanteFoot('r');assert.ok(dd(kl,F.BALL_K)<.3&&dd(kr,F.BALL_K)>.5,`Kanté's sliding left boot is at the ball (left ${dd(kl,F.BALL_K).toFixed(2)} m, right ${dd(kr,F.BALL_K).toFixed(2)} m)`);
assert.ok(kl[1]<.3,`the boot is low at the ball (${kl[1].toFixed(2)} m)`);
const b0=F.ballAt(0);assert.ok(Math.hypot(b0[0]-bx,b0[2]-bz)<.05,'the ball is at the hook point at T=0');
const kd=F.kdbFoot('r',0);assert.ok(dd(kd,F.BALL_K)>.35,`De Bruyne's right boot is still in the backswing at the hook (${dd(kd,F.BALL_K).toFixed(2)} m from the ball)`);
assert.ok(F.T_KICK>0,'his shot would only have come after the hook');
// from behind: at the start of the slide Kanté is behind De Bruyne (further from Chelsea's goal) and he never overtakes him before it
const ks=F.kanteAt(F.T_SLIDE),kb=F.kdbAt(F.T_SLIDE);assert.ok(ks[0]>kb[0]+.3,`Kanté slides in from behind (${ks[0].toFixed(1)} vs ${kb[0].toFixed(1)})`);
for(let T=-7;T<F.T_SLIDE;T+=.25){const a=F.kanteAt(T),b=F.kdbAt(T);assert.ok(a[0]>b[0]-.2,`Kanté is chasing from behind at T=${T.toFixed(2)}`);}
// no bodies through each other: the pelvises keep apart through the tackle
let minD=9;for(let T=F.T_SLIDE;T<2.5;T+=.05){const a=F.pelvis('kante',T),b=F.pelvis('kdb',T);minD=Math.min(minD,Math.hypot(a[0]-b[0],a[2]-b[2]));}
assert.ok(minD>.55,`Kanté and De Bruyne never merge (closest pelvises ${minD.toFixed(2)} m)`);
// hooked away: after the hook the ball moves off, away from De Bruyne, and ends loose, not in the net
const b1=F.ballAt(1),kdb1=F.kdbAt(1);assert.ok(Math.hypot(b1[0]-kdb1[0],b1[2]-kdb1[1])>2.5,'the ball is gone from De Bruyne a second later');
const bl=F.ballAt(4);assert.ok(bl[0]>12&&bl[2]<40,'the ball ends loose outside the goal');
// a real sprint, not a teleport; everyone at human speeds
let top=0;for(let T=-7;T<F.T_SLIDE-.1;T+=.1)top=Math.max(top,F.speed('kante',T));assert.ok(top>6.5&&top<9.5,`Kanté sprints (${top.toFixed(1)} m/s)`);
for(const id of ['kdb','azpi','christensen','rudi','james','sterling','foden','jorginho','gundogan','bernardo','mahrez','chilwell','mount'])for(let T=-7.2;T<4;T+=.2)assert.ok(F.speed(id,T)<9.5,`${id} runs at a human speed at T=${T.toFixed(1)}`);
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
