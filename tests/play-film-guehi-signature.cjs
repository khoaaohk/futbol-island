// Iconic-play film: Marc Guéhi's signature, "the perfectly timed block" — his tackle on and then block from Dušan Vlahović, Serbia 0–1
// England, UEFA Euro 2024, Gelsenkirchen, 16 June 2024 (lib/plays/riso/guehi-signature.ts). Structural checks, no browser: story shape
// (3 chapters: live, low reverse-angle replay, lesson), narration = public/plays/narration/guehi-signature/script.json, 70–90 words ending
// with the lesson from lib/town/iconicPlays.json, only confirmed facts narrated, cue words plain and in order inside their chapter before
// the passage, length 20–42 s; every figure goes through the one drawPlayer() adapter on the shared athlete library; seeded randomness only;
// the solved geometry (the poke at Vlahović's feet, a left-footed shot from outside the box that was on target, Guéhi between ball and goal,
// on his feet, square to the ball, blocking at shin height, the ball never going in); when timing.json exists the film must import it. The
// loader also handles .json imports. Also renders every chapter through a stub canvas at the three card sizes so a draw error fails here.
// usage: node tests/play-film-guehi-signature.cjs
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

const ID='guehi-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,3,'live broadcast, low reverse-angle replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Marc Guéhi/.test(text)&&/Vlahović/.test(text)&&/Serbia/.test(text)&&/Gelsenkirchen, 2024/.test(text),'the players, the place and the match are narrated');
assert.ok(/wins a tackle/.test(text)&&/Moments later/.test(text),'only what the Guardian describes: a tackle, then moments later a blocked shot');
assert.ok(!/final|minute|[0-9]+(st|nd|rd|th)\b|left foot|right foot|goal!/i.test(text),'no invented minute, scoreline or foot is narrated (the Euro 2024 final is the Cucurella film)');
const entry=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'))['Marc Guéhi'];
assert.equal(entry.kind,'signature');assert.ok(/perfectly timed block/.test(entry.title));
const last=film.chapters[2].narration;
assert.ok(/Stay on your feet/.test(last)&&/block the shot with your body facing the ball!$/.test(last),'ends with the lesson from iconicPlays.json');
// cue words never start with a contraction, a hyphenated or an accented word (Kokoro splits them, the cue would silently not match)
for(const ch of film.chapters)for(const c of ch.cues){const w=c.words.split(/\s+/)[0];assert.ok(/^[A-Za-z]+$/.test(w),`cue "${c.words}" starts with a plain word`);}
// the look contract: full-sheet card-window framing, broadcast cameras (no top-down), the real kits and numbers, the voice hook
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:6,/.test(src)&&/number:7,/.test(src)&&/number:20,/.test(src)&&/number:1,/.test(src),'Guéhi 6, Vlahović 7, Milinković-Savić 20, Pickford 1');
assert.ok(/shirt:'paper',shorts:'paper',socks:'paper'/.test(src),'England all white (kit box)');
assert.ok(/shirt:R,shorts:R,socks:R/.test(src),'Serbia all red (kit box)');
assert.ok(/vlahStrike=.*foot:'l'/.test(src),'Vlahović shoots with his left (inferred, never narrated)');
const app=JSON.parse(fs.readFileSync(path.join(root,'lib/town/playerAppearance.json'),'utf8'))['Marc Guéhi'];assert.equal(app.country,'England');
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
// the geometry: the poke is Guéhi's (his toe reaches the ball by Vlahović), the shot comes from outside the box, Guéhi is between the ball
// and the goal and blocks it standing up, square to the ball, at shin height; the shot was on target; the ball never goes in
const vT=F.vlahAt(F.T_TACK),gT=F.guehiAt(F.T_TACK);
assert.ok(Math.hypot(F.POKE_PT[0]-vT[0],F.POKE_PT[2]-vT[1])<1.4,`the poke reaches the ball at Vlahović's feet (${F.POKE_PT.map(v=>v.toFixed(2))})`);
assert.ok(gT[0]>vT[0],'Guéhi is goal-side of Vlahović at the tackle');
assert.ok(F.SHOT_PT[0]<-16.5&&F.SHOT_PT[0]>-23,`the shot from just outside the box (x ${F.SHOT_PT[0].toFixed(2)})`);
const d=Math.hypot(F.BLK_PT[0]-F.SHOT_PT[0],F.BLK_PT[2]-F.SHOT_PT[2]);assert.ok(d>1.8&&d<3.6,`blocked ${d.toFixed(2)} m from the boot`);
assert.ok(F.BLK_PT[0]>F.SHOT_PT[0],'the block is between the ball and the goal');
assert.ok(F.BLK_PT[1]>.2&&F.BLK_PT[1]<.6,`at shin height (${F.BLK_PT[1].toFixed(2)} m)`);
{const k=(0-F.SHOT_PT[0])/(F.BLK_PT[0]-F.SHOT_PT[0]),z=F.SHOT_PT[2]+(F.BLK_PT[2]-F.SHOT_PT[2])*k,y=F.SHOT_PT[1]+(F.BLK_PT[1]-F.SHOT_PT[1])*k;
 assert.ok(Math.abs(z)<3.66&&y<2.44,`the shot was on target: it would have crossed the line at z ${z.toFixed(2)}, y ${y.toFixed(2)}`);}
const {sk,yaw}=F.guehiSkel(F.T_BLK),face=[Math.cos(yaw),-Math.sin(yaw)],toShot=[F.SHOT_PT[0]-sk.pelvis[0],F.SHOT_PT[2]-sk.pelvis[2]],l=Math.hypot(...toShot);
assert.ok((face[0]*toShot[0]+face[1]*toShot[1])/l>.93,'his body faces the ball at the block');
assert.ok(sk.pelvis[1]>.75&&Math.min(sk.lAn[1],sk.rAn[1])<.2,`he stays on his feet (pelvis ${sk.pelvis[1].toFixed(2)} m)`);
const va=F.vlahSkel(0).sk;assert.ok(Math.hypot(va.lToe[0]-F.SHOT_PT[0],va.lToe[2]-F.SHOT_PT[2])<.05,'the ball leaves Vlahović\'s LEFT boot');
for(let T=-7;T<5;T+=.01){const b=F.ballAt(T);assert.ok(!(b[0]>F.GOAL.x-.1&&Math.abs(b[2])<3.66&&b[1]<2.44),`the ball never goes in (T ${T.toFixed(2)})`);}
assert.ok(F.ballAt(F.T_BLK+2)[0]<F.BLK_PT[0]-4,'the block sends it back out, away from goal');
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
