// Iconic-play film (signature move): Jorge Campos, the rushing sweeper-keeper, shown in a real match he played — Mexico 1–1 Bulgaria
// (Bulgaria won on penalties), 1994 World Cup round of 16, Giants Stadium, 5 July 1994 (lib/plays/riso/campos-signature.ts). The rush
// itself is an honest illustration ("Here's how he played"). Structural checks, no browser: story shape (4 chapters: live broadcast,
// slow replay behind Campos, side replay at the meeting point, lesson); narration = script.json; 70–90 words ending with the lesson;
// honesty wording; cues spoken, in order, inside their chapter, never starting with a contraction or hyphenated word; every scene cue
// lookup exists; figures only through the one drawPlayer() adapter on the shared athlete library; the contact read from Campos's solved
// toe mid-slide; No. 1 and 1.68 m; the kits that day (Mexico green/white/red, Bulgaria white/green/white); the unnamed striker; seeded
// randomness; full-sheet framing; sources + confirmed/inferred header; the VOICE constant. Renders every chapter through a stub canvas
// at the three card sizes.
// usage: node tests/play-film-campos-signature.cjs
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

const ID='campos-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const film=load(file).default;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');assert.equal(typeof film.draw,'function');assert.equal(typeof film.touch,'function');
assert.equal(film.chapters.length,4,'live broadcast, slow replay behind Campos, side replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>({label:c.label,text:c.narration}))),JSON.stringify(script.chapters),'script.json mirrors the film narration');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Not the tallest\? Quick feet and bravery help you win the ball first\.$/.test(text),'ends with the lesson');
assert.ok(/Here's how he played/.test(film.chapters[0].narration),'honest: the rush is how he played, not a claimed moment');
assert.ok(/1994/.test(text)&&/Mexico/.test(text)&&/Bulgaria/.test(text)&&/Jorge Campos/.test(text),'the real match and the keeper are named');
assert.ok(!/Stoichkov|Kostadinov|nil|one-all|minute/.test(text),'no invented scoreline, minute or named opponent for the illustrated rush');
assert.ok(!/(left|right) (foot|touchline|side)/.test(text)&&!/(yellow|pink|red) (kit|shirt)/.test(text),'unconfirmed feet, sides and kit colours are not narrated');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(!/['’-]/.test(c.words.split(/\s+/)[0]),`ch${i+1} cue "${c.words}" starts with a plain word (Kokoro splits contractions)`);
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=25&&total<=52,`length ${total}s`);
let n=0;for(const m of src.matchAll(/T\((\d),(['"])([^'"]+)\2\)/g)){n++;assert.ok(film.chapters[+m[1]].cues.some(q=>q.words===m[3]),`scene cue "${m[3]}" exists in chapter ${+m[1]+1}`);}
assert.ok(n>=28,`scenes key their action to the cues (${n})`);
for(const [i,ch] of film.chapters.entries())for(const q of ch.cues)assert.ok(src.includes(`T(${i},'${q.words}')`)||src.includes(`T(${i},"${q.words}")`),`cue "${q.words}" (ch${i+1}) drives a scene action`);
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(/const HIT:V3/.test(src)&&/sk\.rToe/.test(src)&&/slideTackle\(SC/.test(src),'the contact is read from Campos\'s solved toe mid-slide');
assert.ok(/const B1:V3/.test(src)&&/T_LINE/.test(src),'the ball bounces before the slide and is cleared over the touchline');
assert.ok(/number:1,/.test(src)&&/height:1\.68/.test(src),'Campos No. 1, 1.68 m');
assert.ok(/shirt:\[G,\.\d+\],shorts:'paper',socks:\[RD/.test(src),'Mexico green shirts, white shorts, red socks');
assert.ok(/shirt:'paper',shorts:\[G,\.\d+\],socks:'paper'/.test(src),'Bulgaria white shirts, green shorts, white socks');
assert.ok(/STRIKER:AthleteStyle=BUL\(null/.test(src),'the chasing striker is unnamed and unnumbered');
assert.ok(/Giants Stadium/.test(src)&&/5 July 1994/.test(src),'Giants Stadium, 5 July 1994');
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
