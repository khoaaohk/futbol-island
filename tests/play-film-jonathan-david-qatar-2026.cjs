// Iconic-play film: Jonathan David's volley, Canada 6–0 Qatar, World Cup 2026 (lib/plays/riso/jonathan-david-qatar-2026.ts).
// Structural checks, no browser: story shape, narration = script.json, kits, the solved goal (Buchanan's left-foot shot from the right
// deflects up, David's first-time right-foot volley inside the right of the box, bottom-right corner), cue timing on the recorded voice.
// usage: node tests/play-film-jonathan-david-qatar-2026.cjs
// The TS loader handles .json imports (timing.json once the voice exists). usage: node tests/play-film-costa-slovenia-2024.cjs
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

const ID='jonathan-david-qatar-2026',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const film=load(file).default;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live, slow replay, behind-the-goal replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(words>=70&&words<=100,`narration ${words} words (70–100)`);
assert.ok(/Vancouver/.test(text)&&/Canada against Qatar/.test(text)&&/Tajon Buchanan/.test(text)&&/Jonathan David/.test(text)&&/hat-trick/.test(text)&&/first ever World Cup game/.test(text),'place, match, Buchanan, David, the hat-trick and the first win are narrated');
assert.ok(/right-footed volley/.test(text)&&/bottom corner/.test(text)&&/deflects/.test(text),'the confirmed details: deflection, right-footed volley, bottom corner');
assert.ok(/keep moving in the box/.test(film.chapters[3].narration)&&/before the defender can block it\.$/.test(film.chapters[3].narration),'ends with the lesson');
assert.ok(/const canada=.*shirt:\[K,\.95\],shorts:K,socks:K/.test(src),'Canada all black');
assert.ok(/const qatar=.*shirt:'paper',shorts:'paper',socks:\[R,\.95\]/.test(src),'Qatar white shirts and shorts, maroon socks');
assert.ok(/JD_ST=canada\(\{number:10/.test(src)&&/canada\(\{number:17/.test(src)&&/number:1,numberInk:'paper'/.test(src),'David 10, Buchanan 17, Abunada 1');
const F=load(file).FACTS;
{const sk=F.heroAt(0),d=Math.hypot(sk.rToe[0]-F.VP[0],sk.rToe[1]-F.VP[1],sk.rToe[2]-F.VP[2]),dl=Math.hypot(sk.lToe[0]-F.VP[0],sk.lToe[1]-F.VP[1],sk.lToe[2]-F.VP[2]);assert.ok(d<.3&&dl>d,`his RIGHT boot volleys it (${d.toFixed(2)} m)`);}
assert.ok(F.VP[1]>.3,'a volley: the ball is off the ground at contact');assert.ok(F.VP[0]>-16.5&&F.VP[2]>3,'inside the box, on its right-hand side');
{let air=true;for(let a=F.T_DF+.05;a<-.05;a+=.02)if(F.ballAt(a)[1]<.2)air=false;assert.ok(air,'the deflection loops up and never bounces before the volley (first time)');}
{const b=F.buchAt(F.T_BU),d=Math.hypot(b.lToe[0]-F.BU[0],b.lToe[2]-F.BU[2]);assert.ok(d<.35,`Buchanan shoots with his LEFT foot (${d.toFixed(2)} m)`);assert.ok(F.BU[2]>6,'Buchanan came in from the right');}
{let crossed=false;for(let a=0;a<1;a+=.005){const p=F.ballAt(a),q=F.ballAt(a+.005);if(p[0]<0&&q[0]>=0){crossed=true;assert.ok(q[2]>2.2&&q[2]<3.55&&q[1]<.9,`into the bottom-right corner (z ${q[2].toFixed(2)}, y ${q[1].toFixed(2)})`);break;}}assert.ok(crossed,'goal');}
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=50,`length ${total}s`);
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src),'sources + confirmed/inferred listed at the top');
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=timingJson as NarrationTiming/.test(src)&&/withTiming\(/.test(src),'recorded voice timing is wired in');
const timing=path.join(dir,'timing.json');assert.ok(fs.existsSync(timing),'timing.json exists');
{const T=JSON.parse(fs.readFileSync(timing,'utf8'));
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio&&fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const d=T.chapters?.[i]?.seconds;assert.ok(ch.seconds>=d-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${d}`);
  // every cue landed on a recorded word (not the estimate)
  for(const c of ch.cues)assert.ok(T.chapters[i].words.some(w=>Math.abs(w.at-c.at)<1e-6),`ch${i+1} cue "${c.words}" matched a recorded word`);});}
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});}
console.log(`PASS ${ID}: ${film.chapters.length} chapters, ${words} words, ${total}s, ${frames} frames drawn, voice installed`);
