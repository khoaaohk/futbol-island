// Iconic-play film: Agüero's 93:20 title winner v QPR 2012 (lib/plays/riso/aguero-qpr-2012.ts).
// Structural checks, no browser: story shape (4 chapters: live, slow replay, second replay, lesson), narration = script.json, 60–100 words
// ending with the card's lesson, cue words in order inside their chapter before the passage, length 20–45 s; every figure goes through the
// one drawPlayer() adapter on the shared athlete library; seeded randomness only; the confirmed facts (match, foot, kit) are pinned in the
// source; when timing.json exists the film imports it. Then renders every chapter through a stub canvas at the three card sizes.
// usage: node tests/play-film-aguero-qpr-2012.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 vm.runInNewContext(code,{module:m,exports:m.exports,Math,WeakMap,Map,DOMMatrix:globalThis.DOMMatrix??StubMatrix,DOMPoint:globalThis.DOMPoint,Path2D:StubPath,document:{createElement:()=>stubCanvas()},require:id=>{const base=path.resolve(path.dirname(file),id);return load([base+'.ts',base,base+'.json'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile()));}});
 return m.exports;}
function StubPath(){this.ops=0;}Object.assign(StubPath.prototype,{moveTo(){},lineTo(){},arc(){},ellipse(){},rect(){},closePath(){},addPath(){},bezierCurveTo(){},quadraticCurveTo(){}});
class StubMatrix{constructor(a){const[m0,m1,m2,m3,m4,m5]=a??[1,0,0,1,0,0];Object.assign(this,{a:m0,b:m1,c:m2,d:m3,e:m4,f:m5});}
 multiply(o){return new StubMatrix([this.a*o.a+this.c*o.b,this.b*o.a+this.d*o.b,this.a*o.c+this.c*o.d,this.b*o.c+this.d*o.d,this.a*o.e+this.c*o.f+this.e,this.b*o.e+this.d*o.f+this.f]);}
 translate(x,y){return this.multiply(new StubMatrix([1,0,0,1,x,y]));}scale(s){return this.multiply(new StubMatrix([s,0,0,s,0,0]));}rotate(d){const r=d*Math.PI/180;return this.multiply(new StubMatrix([Math.cos(r),Math.sin(r),-Math.sin(r),Math.cos(r),0,0]));}
 inverse(){const det=this.a*this.d-this.b*this.c;return new StubMatrix([this.d/det,-this.b/det,-this.c/det,this.a/det,(this.c*this.f-this.d*this.e)/det,(this.b*this.e-this.a*this.f)/det]);}
 transformPoint(p){return{x:this.a*p.x+this.c*p.y+this.e,y:this.b*p.x+this.d*p.y+this.f};}}
globalThis.DOMPoint??=class{constructor(x,y){this.x=x;this.y=y;}};
function stubCtx(){let m=new StubMatrix();const stack=[];const pat={setTransform(){}};return{canvas:{width:1,height:1},save(){stack.push(m);},restore(){m=stack.pop()??m;},setTransform(a,b,c,d,e,f){m=a instanceof StubMatrix?a:new StubMatrix(typeof a==='object'?[a.a,a.b,a.c,a.d,a.e,a.f]:[a,b,c,d,e,f]);},getTransform(){return m;},
 translate(x,y){m=m.translate(x,y);},scale(x){m=m.scale(x);},rotate(r){m=m.rotate(r*180/Math.PI);},clip(){},fill(){},stroke(){},fillRect(){},clearRect(){},drawImage(){},beginPath(){},moveTo(){},lineTo(){},arc(){},ellipse(){},rect(){},closePath(){},putImageData(){},
 createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createPattern:()=>pat};}
function stubCanvas(){return{width:1,height:1,getContext:()=>stubCtx()};}
globalThis.document??={createElement:()=>stubCanvas()};

const ID='aguero-qpr-2012',NAME='Sergio Agüero',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const film=load(file).default;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, slow replay, second replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(words>=60&&words<=100,`narration ${words} words (60–100)`);
// the registry knows the film (and it is live once voiced)
const reg=fs.readFileSync(path.join(root,'lib/plays/riso/registry.ts'),'utf8');
assert.ok(reg.includes(`'${NAME}':()=>import('./${ID}')`),'registered in registry.ts');
const entry=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8'))[NAME];
assert.ok(entry,'iconicPlays entry exists');
// film-specific facts (confirmed in the sources listed at the top of the film)
assert.equal(entry.params.foot,'right');assert.equal(entry.params.side,'right');
assert.ok(/Manchester/.test(text)&&/2012/.test(text)&&/one-two/.test(text)&&/Balotelli/.test(text)&&/falling/.test(text)&&/One touch/.test(text)&&/steps past the defender/.test(text)&&/near corner/.test(text)&&/Ninety-three minutes and twenty seconds/.test(text),'the match, the one-two with Balotelli (falling), one touch, the step past the defender, the near corner and 93:20 are narrated');
assert.ok(!/left foot|right foot|shirt off/.test(text),'the foot and the shirt-off celebration are not narrated');
const last=film.chapters[3].narration;assert.ok(/never stop believing/i.test(last)&&/A quick one-two in the box can win a match in the last minute/.test(last),'ends with the lesson from iconicPlays.json');
assert.ok(/dribble\(ph,\{foot:'r'/.test(src)&&/strike\(Math\.min\(1,u\),\{foot:'r',power:1\}\)/.test(src)&&/bootRing\(s,r\.res\[AG\],'r'/.test(src),'Agüero controls and shoots with his RIGHT foot');
assert.ok(/number:16/.test(src)&&/number:45/.test(src),'Agüero 16, Balotelli 45');
assert.ok(/shirt:\[B,\.5\],trim:'paper',shorts:'paper'/.test(src)&&/NOT confirmed/.test(src),'City in sky blue and white; QPR kit flagged as not confirmed');
assert.ok(/const GIN:V3=\[105\.05,\.35,3\.1\]/.test(src),'the shot goes in at the near post (+z, his side)');
for(const ch of film.chapters)for(const c of ch.cues)assert.ok(!/^[^\s]*['’-]/.test(c.words),`cue "${c.words}" starts with a plain word`);
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(!/top-down|topDown/.test(src.replace(/never top-down/g,'')),'broadcast cameras only (never top-down)');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=45,`length ${total}s`);
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src),'sources + confirmed/inferred listed at the top');
const timing=path.join(dir,'timing.json');
if(fs.existsSync(timing)){const T=JSON.parse(fs.readFileSync(timing,'utf8'));
 assert.ok(new RegExp(`import timingJson from '\\.\\./\\.\\./\\.\\./public/plays/narration/${ID}/timing\\.json'`).test(src),'film imports its timing.json');
 assert.equal(T.voice,'kokoro_af_bella');assert.equal(T.speed,1);
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const d=T.chapters?.[i]?.seconds;if(typeof d==='number')assert.ok(ch.seconds>=d-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${d}`);
  // every cue's first word is a recorded word (no silent fallback to estimated timing)
  const norm=w=>w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');const toks=T.chapters[i].words.map(w=>norm(w.w));
  for(const c of ch.cues){const f=norm(c.words.split(/\s+/)[0]);assert.ok(toks.some((t,k)=>t===f||(f.startsWith(t)&&(t+(toks[k+1]||'')).startsWith(f))),`ch${i+1} cue "${c.words}" first word is in timing.json`);}});}
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});
  if(film.touch)film.touch(sheet,0,0,u,7);sheet.press(i);frames++;}});}
console.log(`PASS ${ID}: 4 chapters, ${words} words, ${total}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
