// Iconic-play film: Daniel Passarella's signature, "the defender who scores headers" — his headed assist for Leopoldo Luque's diving header,
// the 4–0 in Argentina 6–0 Peru, 1978 World Cup, Rosario, 21 June 1978 (lib/plays/riso/passarella-signature.ts). Structural checks, no
// browser: story shape (3 chapters: live, low replay from behind the far post, lesson), narration = public/plays/narration/passarella-signature/
// script.json, 70–90 words ending with the lesson from lib/town/iconicPlays.json, cue words are substrings in order and inside their chapter
// before the passage, length 20–42 s; every figure goes through the one drawPlayer() adapter on the shared athlete library; seeded randomness
// only; the solved geometry matches the accounts (the corner from the corner spot, Passarella's header in the box at a jumping height for a
// 1.73 m player, Luque's diving header low, the ball in between the posts under the bar); when timing.json exists the film must import it.
// The loader also handles .json imports. Also renders every chapter through a stub canvas at the three card sizes so a draw error fails here.
// usage: node tests/play-film-passarella-signature.cjs
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

const ID='passarella-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,3,'live broadcast, low replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Daniel Passarella/.test(text)&&/Leopoldo Luque/.test(text)&&/Rosario, World Cup 1978/.test(text)&&/World Cup/.test(text)&&/Peru/.test(text),'the players, the place and the match are narrated');
assert.ok(/heads it on/.test(text)&&!/Passarella scores|Passarella's goal/i.test(text),'honest: Passarella heads it on, Luque scores');
assert.ok(!/corner/i.test(film.chapters[0].narration+film.chapters[1].narration),'the delivery (inferred) is not named in the match narration');
assert.ok(!/fix|brib|scandal/i.test(text),'kid-friendly: the controversy is not narrated');
const entry=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'))['Daniel Passarella'];
assert.equal(entry.kind,'signature');assert.ok(/header/i.test(entry.title));
const last=film.chapters[2].narration;
assert.ok(/Defenders can score too/.test(last)&&/strong header\.$/.test(last),'ends with the lesson (defenders can score too, attack set pieces with a strong header)');
// the look contract: full-sheet card-window framing, broadcast cameras (no top-down), the real kits and numbers, the voice hook
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:19,/.test(src)&&/number:14,/.test(src)&&/number:21,/.test(src)&&/number:4,/.test(src),'Passarella 19, Luque 14, Quiroga 21, Bertoni / Chumpitaz 4');
assert.ok(/shirt:'paper',pattern:'stripes',patternInk:\[B,\.62\],shorts:\[K,\.9\],socks:\[K,\.9\]/.test(src),'Argentina stripes, black shorts, black socks');
assert.ok(/shirt:\[R,\.95\],shorts:'paper',socks:'paper'/.test(src),'Peru red / white / white');
assert.ok(/QUIROGA_ST:AthleteStyle=\{shirt:\[B,\.95\],shorts:\[K,\.9\]/.test(src),'Quiroga blue jersey, black shorts (photo)');
assert.ok(/height:1\.73/.test(src),'Passarella 1.73 m');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=42,`length ${total}s`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MOMENT/.test(src),'sources, confirmed/inferred and why this moment listed at the top');
// the play as the accounts describe it (the delivery is inferred): the corner from the corner spot; Passarella's header inside the box at
// a jumping height for a 1.73 m player; Luque's diving header low and close in; the ball in between the posts under the bar; the keeper beaten
const v=a=>a.map(x=>x.toFixed(2)).join(',');
assert.ok(Math.hypot(F.CORNER_PT[0],F.CORNER_PT[2]+34)<1.1&&F.CORNER_PT[2]>-34&&F.CORNER_PT[0]<0,`the corner is struck from inside the corner quarter-circle (${v(F.CORNER_PT)})`);
assert.ok(F.P_H[0]>-16.5&&Math.abs(F.P_H[2])<20.16,`Passarella heads it inside the box (${v(F.P_H)})`);
assert.ok(F.P_H[1]>1.95&&F.P_H[1]<2.6,`at a jumping height for a 1.73 m player (${F.P_H[1].toFixed(2)} m)`);
assert.ok(F.L_H[1]>.35&&F.L_H[1]<1.1,`Luque's header is a low diving header (${F.L_H[1].toFixed(2)} m)`);
assert.ok(F.L_H[0]>-8&&Math.abs(F.L_H[2])<5,`Luque heads it in close to goal (${v(F.L_H)})`);
let cross=null;for(let T=F.T_LU;T<F.T_IN+.3;T+=.005){const b=F.ballAt(T);if(b[0]>=0){cross=b;break;}}
assert.ok(cross&&Math.abs(cross[2])<3.66-.11&&cross[1]<2.44-.11,`the ball crosses the line between the posts under the bar (${cross&&v(cross)})`);
const kz=F.keeperAt(F.T_IN)[1];assert.ok(Math.abs(kz-cross[2])>1.5,`the keeper is beaten (keeper z ${kz.toFixed(2)}, ball z ${cross[2].toFixed(2)})`);
for(let T=-1.4;T<0;T+=.05)assert.ok(F.ballAt(T)[1]>=.1,'the corner is in the air');
const lt=F.luqueAt(F.T_LU);assert.ok(Math.hypot(lt[0]-F.L_H[0],lt[1]-F.L_H[2])<1.6,'Luque is at the ball when he heads it');
const pt=F.passAt(0);assert.ok(Math.hypot(pt[0]-F.P_H[0],pt[1]-F.P_H[2])<.8,'Passarella is under the ball when he heads it');
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
console.log(`PASS ${ID}: 3 chapters, ${words} words / ${text.length} chars, ${total}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
