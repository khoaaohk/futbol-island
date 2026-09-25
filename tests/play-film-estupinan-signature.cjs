// Iconic-play film (signature "the overlap and cross"): Pervis Estupiñán arrives from left-back to score from Mitoma's lay-off, Wolves 1-4
// Brighton, Molineux, 19 Aug 2023 (lib/plays/riso/estupinan-signature.ts). Structural checks, no browser: story shape (3 chapters: live, slow
// replay, "How he does it" demo), narration = public/plays/narration/estupinan-signature/script.json, 70-90 words ending with the lesson, cue
// words are substrings in order and inside their chapter before the passage, no cue starts with a contraction/hyphenated word or with
// "Estupiñán", length 20-42 s; the overlap and the cross live only in the demo chapter; every figure goes through the one drawPlayer() adapter
// on the shared athlete library; seeded randomness only; when timing.json exists the film must import it. Also renders every chapter through
// a stub canvas at the three card sizes.
// usage: node tests/play-film-estupinan-signature.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{module:m,exports:m.exports,Math,WeakMap,Map,DOMMatrix:globalThis.DOMMatrix??StubMatrix,DOMPoint:globalThis.DOMPoint,Path2D:StubPath,document:{createElement:()=>stubCanvas()},require:id=>{const base=path.resolve(path.dirname(file),id);return load([base+'.ts',base].find(fs.existsSync));}});
 return m.exports;}
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

const ID='estupinan-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const film=load(file).default;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,3,'live broadcast, slow replay, "How he does it" demo');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70-90)`);
assert.ok(/Estupiñán/.test(text)&&/Molineux/.test(text)&&/Brighton/.test(text)&&/Mitoma/.test(text),'the player, the ground, the club and the winger are narrated');
assert.ok(/second half/.test(text)&&/Welbeck/.test(text)&&/saved/.test(text)&&/lays it back/.test(text)&&/Low left foot, into the corner/.test(text)&&/no one follows/.test(text)&&/four to one/.test(text),'the confirmed facts: second half, Welbeck, the parry, the lay-off, the low left foot, untracked, 4-1');
const match=film.chapters.slice(0,2).map(c=>c.narration).join(' ');
assert.ok(!/overlap|cross|outside|far (post|corner)|near (post|corner)|right foot|keeper's (left|right)|left wing|channel/i.test(match),'no overlap/cross and no inferred side/post in the match chapters');
assert.ok(!/Wolves|gold|stripes|Matheus/i.test(text),'the opponent, the kits and the untracking player are not narrated');
const last=film.chapters[2];
assert.equal(last.label,'How he does it','the demo chapter is clearly labelled');
assert.ok(/Time your overlap so you arrive just as your winger is ready to pass!$/.test(last.narration),'ends with the lesson');
for(const ch of film.chapters)for(const c of ch.cues){const w0=c.words.split(/\s+/)[0];assert.ok(!/['’-]/.test(w0),`cue "${c.words}" starts with a plain word`);assert.ok(!/^Estupi/i.test(w0),`cue "${c.words}" does not start with Estupiñán`);}
// the look contract: full-sheet framing, the kits, the voice hook, the left foot, the demo apart from the match
assert.ok(!/\.safe\b/.test(src),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming);/.test(src)&&/,VOICE\);/.test(src),'VOICE left null and passed into withTiming');
assert.ok(/strike\(clamp\(v\),\{foot:'l',power:\.8\}\)/.test(src),'the finish is drawn with the LEFT foot (confirmed: "low left-footer")');
assert.ok(/number:30,/.test(src)&&/number:22,/.test(src),'Estupiñán wears 30, Mitoma 22');
assert.ok(/shirt:\[B,\.92\],pattern:'stripes',patternInk:'paper',shorts:\[B,\.92\],socks:\[B,\.92\]/.test(src),'Brighton in the home blue-and-white stripes, blue shorts, blue socks (the photo)');
assert.ok(/shirt:\[Y,\.95\],shorts:\[K,\.9\],socks:\[Y,\.95\]/.test(src),'Wolves in gold shirts, black shorts, gold socks');
assert.ok(/19 August 2023/.test(src)&&/Molineux/.test(src),'the match and date are stated');
assert.ok(/DEMONSTRATION/.test(src)&&/TRAIN_FB:AthleteStyle/.test(src)&&/trainingGround\(s,c\)/.test(src),'the overlap and cross is a separate training-pitch demonstration');
const ch1to2=src.slice(src.indexOf('// ================= chapter 1'),src.indexOf('// ================= chapter 3'));
assert.ok(!/TRAIN_|DSIM|CROSS|airTrail/.test(ch1to2),'no overlap/cross marks in the match chapters');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=42,`length ${total}s`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src),'sources + confirmed/inferred listed at the top');
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
