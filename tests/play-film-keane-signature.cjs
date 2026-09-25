// Iconic-play film: Roy Keane, "the midfield ball-winner" (signature) — his header v Juventus, Champions League semi-final second leg,
// Turin, 21 April 1999 (lib/plays/riso/keane-signature.ts). Structural checks, no browser: story shape (4 chapters), narration =
// public/plays/narration/keane-signature/script.json, 70–90 words ending with the iconicPlays.json lesson, kid-friendly (no bookings), cue
// words in order and inside their chapter; one drawPlayer() adapter on the shared athlete library; the goal's solved geometry (right-footed
// corner from United's left to the near post, forehead on the ball in the air, glance inside the far post, Peruzzi untouched, the point at
// Beckham and the run back); when timing.json exists the film must import it; every chapter renders through a stub canvas at card sizes.
// usage: node tests/play-film-keane-signature.cjs
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

const ID='keane-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, slow replay, behind-the-goal replay + back to work, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Turin/.test(text)&&/1999/.test(text)&&/semi-final/.test(text)&&/Juventus/.test(text)&&/two–nil down/.test(text),'the match, date and the 0–2 deficit are narrated');
assert.ok(/Captain Roy Keane/.test(text)&&/Beckham/.test(text)&&/far corner/.test(text)&&/three–two/.test(text),'the captain, the corner-taker, the finish and the result');
assert.ok(!/yellow|card|booked|foul|suspend/i.test(text),'kid-friendly: no bookings, fouls or suspensions narrated');
const last=film.chapters[3].narration;
assert.ok(/first to every loose ball/.test(last)&&/simple pass to a teammate/.test(last),'ends with the lesson (iconicPlays.json: first to every loose ball, simple pass)');
const lesson=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'))['Roy Keane'];
assert.equal(lesson.kind,'signature');assert.ok(/first to every loose ball/i.test(lesson.lesson),'lesson source still matches');
// the look contract: full-sheet framing, broadcast cameras, the real kits, the voice hook
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:16/.test(src)&&/number:7,/.test(src),'Keane wears 16, Beckham 7');
assert.ok(/shirt:R,shorts:'paper',socks:'paper'/.test(src),'United in red shirts, white shorts, white socks');
assert.ok(/pattern:'stripes',patternInk:K/.test(src),'Juventus in black-and-white stripes');
assert.ok(/foot:'r'/.test(src),'Beckham takes the corner with his right foot');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=25&&total<=55,`length ${total}s`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src),'sources + confirmed/inferred listed at the top');
// the goal as the accounts describe it: Beckham's corner from United's LEFT (−z) to the NEAR post; Keane in the air, first to it between
// Zidane and Pessotto; a glance into the FAR corner past Peruzzi (no touch); then he points to Beckham and runs back toward halfway.
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
assert.equal(F.cornerFoot,'r');
const bc=F.beckhamContact();assert.ok(d3(bc.rToe,F.P0)<.35,`his RIGHT boot is at the ball (${d3(bc.rToe,F.P0).toFixed(2)} m)`);assert.ok(d3(bc.rToe,F.P0)<d3(bc.lToe,F.P0),'right boot nearer the ball');
assert.ok(F.P0[2]<-33&&F.P0[2]>-34.2&&F.P0[0]>-1.2&&F.P0[0]<0,`the corner is from United's LEFT (−z) quadrant (z ${F.P0[2]})`);
assert.ok(F.HP[0]>-7&&F.HP[0]<-3&&F.HP[1]<-1.5&&F.HP[1]>-5,`he meets it at the NEAR post, ≈ 5 m out (x ${F.HP[0]}, z ${F.HP[1]})`);
const k=F.keaneAt(F.TF);assert.ok(k.air>.25,`he is in the air at contact (${k.air.toFixed(2)} m)`);
assert.ok(d3(k.face,F.HEAD_PT)<.2,`forehead on the ball (${d3(k.face,F.HEAD_PT).toFixed(2)} m)`);
assert.ok(d3(F.ballAt(F.TF),F.HEAD_PT)<1e-6,'the corner arrives at his forehead');
let apex=0;for(let T=0;T<F.TF;T+=.02)apex=Math.max(apex,F.ballAt(T)[1]);assert.ok(apex>2.5&&apex<6,`a fizzed corner (apex ${apex.toFixed(1)} m)`);
const mid=F.ballAt(F.TF/2),lin=F.P0[0]+(F.HEAD_PT[0]-F.P0[0])/2;assert.ok(mid[0]<lin,'in-swinging: it bends back toward goal');
const g=F.ballAt(F.TG);assert.ok(Math.abs(g[0])<.05&&g[2]>1.2&&g[2]<3.66-.11&&g[1]>.11&&g[1]<2.44-.11,`the glance crosses the line inside the FAR post (z ${g[2].toFixed(2)}, y ${g[1].toFixed(2)})`);
for(const m of ['zidane','pessotto'])assert.ok(d3(F.markerAt(m,F.TF).head,F.HEAD_PT)>.6,`${m} is beaten to the ball`);
for(let T=F.TF-1;T<=F.TG+.1;T+=.02){const a=F.peruzziAt(T),b=F.ballAt(T);assert.ok(d3(a.lHa,b)>.3&&d3(a.rHa,b)>.3,`Peruzzi never touches the ball (τ ${T.toFixed(2)})`);}
{const T=(F.PT0+F.PT1)/2,kk=F.keaneAt(T),b=F.beckhamAt(T),toB=Math.atan2(-(b[1]-kk.pelvis[2]),b[0]-kk.pelvis[0]);let dy=Math.abs(kk.yaw-toB)%(2*Math.PI);if(dy>Math.PI)dy=2*Math.PI-dy;
 assert.ok(dy<.35,`he faces Beckham while pointing (${dy.toFixed(2)} rad)`);assert.ok(kk.rHa[1]>kk.pelvis[1]+.25,'his right arm is raised, pointing');}
assert.ok(F.keaneAt(12).pelvis[0]<F.keaneAt(F.PT1).pelvis[0]-15,'then he runs back toward the halfway line');
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
