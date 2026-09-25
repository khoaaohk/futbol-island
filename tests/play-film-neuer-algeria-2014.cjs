// Iconic-play film: Manuel Neuer sweeps far out of his box to head away Algeria's long ball a split second before Islam Slimani,
// Germany 2–1 Algeria (a.e.t.), 2014 World Cup round of 16, Estádio Beira-Rio, Porto Alegre, 30 June 2014, 70'
// (lib/plays/riso/neuer-algeria-2014.ts). Structural checks, no browser: story shape (4 chapters: live broadcast, slow replay behind Neuer,
// side replay at the meeting point, lesson); narration = script.json; 70–90 words ending with the lesson; cues spoken, in order and inside
// their chapter before the passage; every scene cue lookup exists; figures only through the one drawPlayer() adapter on the shared athlete
// library; the header point read from the solved skeleton (Neuer's head), the ball bouncing before it, out over the touchline for a throw-in;
// No. 1 / No. 13; the kits (Neuer navy, Germany white, Algeria light green); seeded randomness; full-sheet framing; sources +
// confirmed/inferred header; the VOICE constant; once the voice's timing.json exists the film must import it. Also renders every chapter
// through a stub canvas at the three card sizes.
// usage: node tests/play-film-neuer-algeria-2014.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{module:m,exports:m.exports,Math,WeakMap,Map,Set,DOMMatrix:globalThis.DOMMatrix??StubMatrix,DOMPoint:globalThis.DOMPoint,Path2D:StubPath,document:{createElement:()=>stubCanvas()},require:id=>{const base=path.resolve(path.dirname(file),id);return load([base+'.ts',base,base+'.json'].find(fs.existsSync));}});
 return m.exports;}
function StubPath(){}Object.assign(StubPath.prototype,{moveTo(){},lineTo(){},arc(){},rect(){},closePath(){},addPath(){},bezierCurveTo(){},quadraticCurveTo(){},ellipse(){}});
class StubMatrix{constructor(a){const[m0,m1,m2,m3,m4,m5]=a??[1,0,0,1,0,0];Object.assign(this,{a:m0,b:m1,c:m2,d:m3,e:m4,f:m5});}
 multiply(o){return new StubMatrix([this.a*o.a+this.c*o.b,this.b*o.a+this.d*o.b,this.a*o.c+this.c*o.d,this.b*o.c+this.d*o.d,this.a*o.e+this.c*o.f+this.e,this.b*o.e+this.d*o.f+this.f]);}
 translate(x,y){return this.multiply(new StubMatrix([1,0,0,1,x,y]));}scale(s){return this.multiply(new StubMatrix([s,0,0,s,0,0]));}rotate(d){const r=d*Math.PI/180;return this.multiply(new StubMatrix([Math.cos(r),Math.sin(r),-Math.sin(r),Math.cos(r),0,0]));}
 inverse(){const det=this.a*this.d-this.b*this.c;return new StubMatrix([this.d/det,-this.b/det,-this.c/det,this.a/det,(this.c*this.f-this.d*this.e)/det,(this.b*this.e-this.a*this.f)/det]);}
 transformPoint(p){return{x:this.a*p.x+this.c*p.y+this.e,y:this.b*p.x+this.d*p.y+this.f};}}
globalThis.DOMPoint??=class{constructor(x,y){this.x=x;this.y=y;}};
function stubCtx(){let m=new StubMatrix();const stack=[];const pat={setTransform(){}};return{canvas:{width:1,height:1},save(){stack.push(m);},restore(){m=stack.pop()??m;},setTransform(a,b,c,d,e,f){m=a instanceof StubMatrix?a:new StubMatrix(typeof a==='object'?[a.a,a.b,a.c,a.d,a.e,a.f]:[a,b,c,d,e,f]);},getTransform(){return m;},
 translate(x,y){m=m.translate(x,y);},scale(x){m=m.scale(x);},rotate(r){m=m.rotate(r*180/Math.PI);},clip(){},fill(){},stroke(){},fillRect(){},clearRect(){},drawImage(){},beginPath(){},moveTo(){},lineTo(){},arc(){},rect(){},closePath(){},putImageData(){},
 createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createPattern:()=>pat};}
function stubCanvas(){return{width:1,height:1,getContext:()=>stubCtx()};}
globalThis.document??={createElement:()=>stubCanvas()};

const ID='neuer-algeria-2014',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const film=load(file).default;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');assert.equal(typeof film.draw,'function');assert.equal(typeof film.touch,'function');
assert.equal(film.chapters.length,4,'live broadcast, slow replay behind Neuer, side replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>({label:c.label,text:c.narration}))),JSON.stringify(script.chapters),'script.json mirrors the film narration');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Read the through ball early, and a keeper can sweep up behind the defence\.$/.test(text),'ends with the lesson');
assert.ok(/white/.test(film.chapters[0].narration)&&/green/.test(film.chapters[0].narration)&&/Slimani/.test(film.chapters[0].narration)&&/Neuer/.test(film.chapters[0].narration)&&/nil-nil/.test(film.chapters[0].narration),'kits, the score, the striker and the keeper are narrated');
assert.ok(/before it bounces/.test(film.chapters[1].narration)&&/heads it/.test(film.chapters[2].narration)&&/split second/.test(film.chapters[2].narration)&&/throw-in/.test(film.chapters[2].narration),'the bounce, the header, the split second and the throw-in are narrated');
assert.ok(!/(left|right) (foot|touchline|side)/.test(text),'unconfirmed feet and sides are not narrated');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=25&&total<=52,`length ${total}s`);
// every cue the scenes key their actions to must exist (a retime that renames a cue fails here, not silently on screen)
let n=0;for(const m of src.matchAll(/T\((\d),(['"])([^'"]+)\2\)/g)){n++;assert.ok(film.chapters[+m[1]].cues.some(q=>q.words===m[3]),`scene cue "${m[3]}" exists in chapter ${+m[1]+1}`);}
assert.ok(n>=28,`scenes key their action to the cues (${n})`);
for(const [i,ch] of film.chapters.entries())for(const q of ch.cues)assert.ok(src.includes(`T(${i},'${q.words}')`)||src.includes(`T(${i},"${q.words}")`),`cue "${q.words}" (ch${i+1}) drives a scene action`);
// figures: the shared athlete library, through exactly one adapter; the kits and the header the sources give
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(/sk\.head/.test(src)&&/const HIT:V3/.test(src),'the header point is read from Neuer\'s solved head');
assert.ok(/const B1:V3/.test(src)&&/T_LINE/.test(src),'the ball bounces before the header and crosses the touchline (throw-in)');
assert.ok(/number:1,/.test(src)&&/ALG\(13,/.test(src),'Neuer 1, Slimani 13');
assert.ok(/NEUER:AthleteStyle=\{shirt:\[K,\.8\d\]/.test(src)&&/sleeves:'long'/.test(src),'Neuer in the navy long-sleeved kit');
assert.ok(/shirt:'paper',shorts:'paper',socks:'paper'/.test(src)&&/shirt:\[G,\.\d+\],shorts:\[G/.test(src),'Germany all white, Algeria light green');
assert.ok(/Beira-Rio/.test(src),'the Estádio Beira-Rio');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(!/\bs\.safe\b/.test(src),'full-sheet framing (never sheet.safe)');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src),'sources + confirmed/inferred listed at the top');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src),'VOICE constant for the Kokoro timing');
// installed voice (optional until generated): the film must import it, files exist and chapter seconds cover each clip
const timing=path.join(dir,'timing.json');
if(fs.existsSync(timing)){const Tm=JSON.parse(fs.readFileSync(timing,'utf8'));
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio once timing.json exists — import timing.json in ${ID}.ts (see the VOICE note)`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const d=Tm.chapters?.[i]?.seconds;if(typeof d==='number')assert.ok(ch.seconds>=d-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${d}`);});}
// render every chapter (start, cue beats, passage) through the stub canvas: no draw errors at card sizes, reduced motion and a touch included
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});film.touch(sheet,0,0,u*.8,7);sheet.press(i);frames++;}});}
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${text.length} chars, ${total}s, ${n} scene cue lookups, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
