// Iconic-play film: Carles Puyol's header, Germany 0–1 Spain, 2010 World Cup semi-final, Durban, 7 July 2010 (lib/plays/riso/puyol-header-2010.ts).
// Structural checks, no browser: story shape (4 chapters: live broadcast, slow replay, behind the goal, lesson); narration = script.json; 70–90
// words ending with the lesson; cues spoken, in order and inside their chapter before the passage; every scene cue lookup exists; figures only
// through the one drawPlayer() adapter on the shared athlete library; the kits, numbers and feet the sources give; the corner from Spain's
// left, the header ≈ 10 yards out at the top of his leap after a long run from deep; seeded randomness; full-sheet framing; sources +
// confirmed/inferred header; the VOICE constant (and, once timing.json exists, that the film imports it). Also renders every chapter through
// a stub canvas at the three card sizes.
// usage: node tests/play-film-puyol-header-2010.cjs
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

const ID='puyol-header-2010',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');assert.equal(typeof film.draw,'function');assert.equal(typeof film.touch,'function');
assert.equal(film.chapters.length,4,'live broadcast, slow replay, behind the goal, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>({label:c.label,text:c.narration}))),JSON.stringify(script.chapters),'script.json mirrors the film narration');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Attack the ball at its highest point, and head it hard!$/.test(text),'ends with the lesson');
assert.ok(/in red/.test(film.chapters[0].narration)&&/in white/.test(film.chapters[0].narration)&&/Xavi/.test(film.chapters[0].narration)&&/Durban/.test(film.chapters[0].narration),'kits, venue and the corner-taker are narrated');
assert.ok(/starts far/.test(film.chapters[1].narration)&&/highest point/.test(film.chapters[2].narration)&&/Neuer/.test(film.chapters[2].narration),'the long run, the highest point and Neuer are narrated');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=25&&total<=52,`length ${total}s`);
// every cue the scenes key their action to must exist (a retime that renames a cue fails here, not silently on screen)
let n=0;for(const m of src.matchAll(/CUE\((\d),'([^']+)'\)/g)){n++;assert.ok(film.chapters[+m[1]].cues.some(q=>q.words.startsWith(m[2])),`scene cue "${m[2]}" exists in chapter ${+m[1]+1}`);}
assert.ok(n>=25,`scenes key their action to the cues (${n})`);
for(const [i,ch] of film.chapters.entries())for(const q of ch.cues)assert.ok(new RegExp("CUE\\("+i+",'"+q.words.split(/\s+/)[0].replace(/[^A-Za-z-]/g,'')).test(src),`ch${i+1} cue "${q.words}" drives something on screen`);
// figures: the shared athlete library, through exactly one adapter; the kits and feet the sources give
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(/shirt:R,shorts:\[B,[.0-9]+\],socks:R/.test(src),'Spain: red shirts, blue shorts, red socks');
assert.ok(/shirt:'paper',shorts:\[K,[.0-9]+\],socks:'paper'/.test(src),'Germany: white shirts, black shorts, white socks');
assert.ok(/number:5,hairStyle:'curly'/.test(src)&&/height:1\.78/.test(src),'Puyol: No. 5, long curly hair, 1.78 m');assert.ok(/number:8,/.test(src),'Xavi wears 8');
assert.ok(/header\(/.test(src)&&/strike\(STRIKE_CONTACT,\{foot:'r'\}\)/.test(src),'header() and a right-foot corner');
assert.ok(/arch/i.test(src)&&/function arch\(/.test(src),'Moses Mabhida drawn with its arch');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(!/\bs\.safe\b/.test(src),'full-sheet framing (never sheet.safe)');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src),'sources + confirmed/inferred listed at the top');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src),'VOICE constant for the Kokoro timing');
// the goal as the accounts describe it: Xavi's corner from Spain's LEFT (−z); Puyol's run from deep; he climbs highest and heads it from ≈ 10 yards
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
assert.equal(F.cornerFoot,'r');
const xc=F.xaviContact();assert.ok(d3(xc.rToe,F.P0)<.35,`Xavi's RIGHT boot is at the ball at the corner (${d3(xc.rToe,F.P0).toFixed(2)} m)`);assert.ok(d3(xc.rToe,F.P0)<d3(xc.lToe,F.P0),'right boot nearer the ball than the left');
assert.ok(F.P0[2]<-33&&F.P0[2]>-34.2&&F.P0[0]>-1.2&&F.P0[0]<0,`the corner is taken from Spain's left (x ${F.P0[0]}, z ${F.P0[2]})`);
const hx=Math.hypot(F.HP[0],F.HP[1]);assert.ok(hx>7.5&&hx<11,`he heads it from ≈ 10 yards (${hx.toFixed(1)} m)`);
const rs=F.runStart(),runLen=Math.hypot(rs[0]-F.HP[0],rs[1]-F.HP[1]);assert.ok(rs[0]<-16.5&&runLen>12,`his run starts deep, outside the box (x ${rs[0].toFixed(1)}, ${runLen.toFixed(1)} m run)`);
const p=F.puyolAt(F.TF);assert.ok(p.air>.45,`he is high in the air at contact (${p.air.toFixed(2)} m)`);
assert.ok(d3(p.face,F.HEAD_PT)<.2,`forehead on the ball (${d3(p.face,F.HEAD_PT).toFixed(2)} m)`);
assert.ok(d3(F.ballAt(F.TF),F.HEAD_PT)<1e-6,'the corner arrives at his forehead');
assert.ok(p.head[1]>F.markerAt(F.TF).head[1]+.15,`he rises above the taller marker (${p.head[1].toFixed(2)} vs ${F.markerAt(F.TF).head[1].toFixed(2)} m)`);
let apex=0;for(let T=0;T<F.TF;T+=.02)apex=Math.max(apex,F.ballAt(T)[1]);assert.ok(apex>3.5&&apex<8,`a curled, lofted corner (apex ${apex.toFixed(1)} m)`);
const g=F.ballAt(F.TG);assert.ok(Math.abs(g[0])<.05&&Math.abs(g[2])<3.55&&g[1]<2.33&&g[1]>0,`the header crosses the line inside the goal (z ${g[2].toFixed(2)}, y ${g[1].toFixed(2)})`);
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
