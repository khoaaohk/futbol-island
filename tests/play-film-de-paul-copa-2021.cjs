// Iconic-play film: Rodrigo De Paul's long pass for Di María's goal, Argentina 1–0 Brazil, Copa América final 2021 (lib/plays/riso/de-paul-copa-2021.ts).
// Structural checks, no browser: story shape, narration = script.json, kits, the solved play (right boot on the pass from his own half, over
// and behind Lodi on Argentina's right, Di María's left-foot touch and chip over the advancing Ederson, under the bar), cue timing on the recorded voice.
// usage: node tests/play-film-de-paul-copa-2021.cjs
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

const ID='de-paul-copa-2021',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const film=load(file).default;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live, slow replay, over-the-top replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(words>=70&&words<=105,`narration ${words} words (70–105)`);
assert.ok(/Rio de Janeiro/.test(text)&&/Argentina against Brazil/.test(text)&&/Rodrigo De Paul/.test(text)&&/Di María/.test(text)&&/Renan Lodi/.test(text)&&/Ederson/.test(text),'place, match, passer, scorer, defender and keeper are narrated');
assert.ok(!/\b(mistake|error|sloppy|bad|poor|fault)\b/i.test(text),'nothing unkind about Lodi');
assert.ok(/look up early/.test(film.chapters[3].narration)&&/one long pass can find him\.$/.test(film.chapters[3].narration),'ends with the lesson');
assert.ok(/const argentina=.*shirt:'paper',pattern:'stripes',patternInk:\[B,\.55\],shorts:K,socks:'paper'/.test(src),'Argentina in sky-blue-and-white stripes, black shorts, white socks');
assert.ok(/const brazil=.*shirt:\[Y,\.95\],shorts:\[B,\.95\],socks:'paper'/.test(src),'Brazil yellow shirts, blue shorts');
assert.ok(/DP_ST=argentina\(\{number:7/.test(src)&&/DIM_ST=argentina\(\{number:11/.test(src)&&/number:16/.test(src)&&/number:23/.test(src),'De Paul 7, Di María 11, Lodi 16, Ederson 23');
const F=load(file).FACTS,d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
{const sk=F.heroAt(F.T_PASS),d=Math.hypot(sk.rToe[0]-F.DPB[0],sk.rToe[2]-F.DPB[2]),dl=Math.hypot(sk.lToe[0]-F.DPB[0],sk.lToe[2]-F.DPB[2]);assert.ok(d<.35&&dl>d,`De Paul's RIGHT boot strikes the pass (${d.toFixed(2)} m)`);}
assert.ok(F.DPB[0]<-52.5,'the pass is hit from his own half');assert.ok(Math.hypot(F.L1[0]-F.DPB[0],F.L1[2]-F.DPB[2])>35,'a long pass (> 35 m)');
assert.ok(F.L1[2]>6&&F.TCH[2]>6,"it lands on Argentina's right (+z), behind Brazil's left-back");
{const [lx,lz]=F.lodiAt(F.T_L1-.3);let over=false;for(let a=F.T_PASS;a<F.T_L1;a+=.01){const b=F.ballAt(a);if(Math.abs(b[0]-lx)<.5&&b[1]>2.2)over=true;}
 const lb=F.ballAt(F.T_L1);assert.ok(lb[0]>lx,'the pass drops behind Lodi');const b2=F.ballAt((F.T_L1+F.T_TCH)/2);assert.ok(b2[1]>.8,'it bounces up past his stretch');}
{const sk=F.dimAt(F.T_TCH),d=Math.hypot(sk.lToe[0]-F.TCH[0],sk.lToe[2]-F.TCH[2]);assert.ok(d<.4,`Di María's LEFT boot takes the touch (${d.toFixed(2)} m)`);}
{const sk=F.dimAt(0),d=Math.hypot(sk.lToe[0]-F.C_BALL[0],sk.lToe[2]-F.C_BALL[2]),dr=Math.hypot(sk.rToe[0]-F.C_BALL[0],sk.rToe[2]-F.C_BALL[2]);assert.ok(d<.35&&dr>d,`Di María chips with his LEFT boot (${d.toFixed(2)} m)`);}
{const [ex]=F.ederAt(0);let h=0;for(let a=0;a<F.FLY;a+=.005){const b=F.ballAt(a);if(Math.abs(b[0]-ex)<.3)h=Math.max(h,b[1]);}assert.ok(h>2.6,`the chip goes over the advancing Ederson (${h.toFixed(2)} m)`);assert.ok(ex<-4,'Ederson has come off his line');}
{let crossed=false;for(let a=0;a<2;a+=.005){const p=F.ballAt(a),q=F.ballAt(a+.005);if(p[0]<0&&q[0]>=0){crossed=true;assert.ok(Math.abs(q[2])<3.55&&q[1]<2.33,'the chip goes in under the bar, inside the posts');break;}}assert.ok(crossed,'goal');}
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
