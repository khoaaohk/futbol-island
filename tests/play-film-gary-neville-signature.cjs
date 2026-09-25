// Iconic-play film: Gary Neville, "the overlap in the FA Cup final" (signature) — his overlap and chipped cross for Ronaldo's header v Millwall, FA Cup
// final, Cardiff, 22 May 2004 (lib/plays/riso/gary-neville-signature.ts). Structural checks, no browser: story shape (4 chapters), narration =
// public/plays/narration/gary-neville-signature/script.json, 70–90 words ending with the iconicPlays.json lesson, kid-friendly, cue words in
// order and inside their chapter (every cue starts with a plain word — Kokoro splits contractions/hyphens); one drawPlayer() adapter on the
// shared athlete library; the goal's solved geometry (Keane's pass into the box on United's RIGHT, Neville's run outside Ronaldo and his
// marker, a right-footed chipped cross back across to the FAR post, Ronaldo in front of Wise, a downward header past an untouched Marshall);
// when timing.json exists the film must import it; every chapter renders through a stub canvas at card sizes.
// usage: node tests/play-film-gary-neville-signature.cjs
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

const ID='gary-neville-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, flank replay, behind-the-goal replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Cardiff/.test(text)&&/2004/.test(text)&&/FA Cup final/.test(text)&&/Millwall/.test(text),'the match and date are narrated');
assert.ok(/Roy Keane passes/.test(text)&&/Gary Neville/.test(text)&&/Ronaldo/.test(text)&&/outside/.test(text),'passer, crosser, scorer and the overlap');
assert.ok(!/Beckham/.test(text),'the narration never claims a Beckham moment it cannot source');
assert.ok(!/\b(yellow|card|cards|booked|foul|fouls|suspended)\b/i.test(text),'kid-friendly: no bookings or fouls narrated');
const last=film.chapters[3].narration;
assert.ok(/give your winger a pass option on the outside, so they have a choice/.test(last),'ends with the lesson (iconicPlays.json)');
const lesson=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'))['Gary Neville'];
assert.equal(lesson.kind,'signature');assert.ok(/pass option on the outside so they have a choice/i.test(lesson.lesson),'lesson source still matches');
// the look contract: full-sheet framing, broadcast cameras, the real kits, the voice hook
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:2,/.test(src)&&/number:7,/.test(src)&&/number:16,/.test(src)&&/number:19,/.test(src),'Neville 2, Ronaldo 7, Keane 16, Wise 19');
assert.ok(/shirt:R,shorts:'paper',socks:'paper'/.test(src),'United in red shirts, white shorts, white socks');
assert.ok(/shirt:B,/.test(src)&&/sleeves/.test(src),'Millwall in blue with white sleeves');
assert.ok(/boots:Y/.test(src),'Ronaldo\'s gold boots');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(/^[A-Za-z0-9]+(\s|$)/.test(c.words),`ch${i+1} cue "${c.words}" starts with a plain word (Kokoro)`);
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=25&&total<=55,`length ${total}s`);
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src),'sources + confirmed/inferred listed at the top');
// the goal as the accounts describe it
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]),d2=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
assert.equal(F.crossFoot,'r');
const kc=F.keaneContact(),kb=F.ballAt(F.KP);assert.ok(d3(kc.rToe,kb)<.4,`Keane's right boot at the ball for the pass (${d3(kc.rToe,kb).toFixed(2)} m)`);
assert.ok(F.NB[0]>-16.5&&F.NB[2]>0&&F.NB[2]<20.16,`Neville is played in INSIDE the box on the RIGHT (x ${F.NB[0]}, z ${F.NB[2]})`);
const nc=F.nevilleContact();assert.ok(d3(nc.rToe,F.P0)<.35,`his RIGHT boot is at the ball for the cross (${d3(nc.rToe,F.P0).toFixed(2)} m)`);assert.ok(d3(nc.rToe,F.P0)<d3(nc.lToe,F.P0),'right boot nearer the ball');
assert.ok(F.P0[2]>12&&F.P0[0]>-16.5,`the cross comes from the right of the box (z ${F.P0[2]})`);
// the overlap: Neville starts behind Ronaldo on the wing and ends outside and beyond him, while Ryan follows Ronaldo inside
{const n0=F.nevilleAt(-7),r0=F.ronaldoAt(-7).pelvis,n1=F.nevilleAt(F.NR),r1=F.ronaldoAt(F.NR).pelvis;
 assert.ok(n0[0]<r0[0]-8,'Neville starts deep behind his winger');assert.ok(n1[0]>r0[0]+8&&n1[1]>r1[2]+8,'…and runs past the wing spot his winger left, OUTSIDE him');
 const y1=F.ryanAt(F.NR);assert.ok(d2(y1,[r1[0],r1[2]])<d2(y1,n1),'Ronaldo\'s marker follows him inside, not Neville');}
let apex=0;for(let T=0;T<F.TF;T+=.02)apex=Math.max(apex,F.ballAt(T)[1]);assert.ok(apex>2.8&&apex<7,`a chipped cross (apex ${apex.toFixed(1)} m)`);
assert.ok(F.HEAD_PT[2]<-1.5&&F.HEAD_PT[2]>-4.5&&F.HEAD_PT[0]>-7&&F.HEAD_PT[0]<-3.5,'met at the FAR post');
const r=F.ronaldoAt(F.TF);assert.ok(r.air>.2,`Ronaldo in the air at contact (${r.air.toFixed(2)} m)`);assert.ok(d3(r.face,F.HEAD_PT)<.2,`forehead on the ball (${d3(r.face,F.HEAD_PT).toFixed(2)} m)`);
assert.ok(d3(F.ballAt(F.TF),F.HEAD_PT)<1e-6,'the cross arrives at his forehead');
{const w=F.wiseAt(F.TF);assert.ok(d3(w.head,F.HEAD_PT)>.7,'Wise is beaten to it');assert.ok(w.pelvis[2]<r.pelvis[2],'Ronaldo steps in FRONT of Wise (ball side)');}
assert.ok(F.ballAt(F.TF+.1)[1]<F.HEAD_PT[1],'a downward header');assert.ok(Math.abs(F.BN[1]-.11)<.01&&F.BN[0]<0,'it bounces before the line');
const g=F.ballAt(F.TG);assert.ok(Math.abs(g[0])<.05&&Math.abs(g[2])<3.66-.11&&g[1]>.11&&g[1]<2.44-.11,`crosses the line inside the posts (z ${g[2].toFixed(2)}, y ${g[1].toFixed(2)})`);
for(let T=F.TF-1;T<=F.TG+.1;T+=.02){const a=F.marshallAt(T),b=F.ballAt(T);assert.ok(d3(a.lHa,b)>.3&&d3(a.rHa,b)>.3,`Marshall never touches the ball (τ ${T.toFixed(2)})`);}
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
