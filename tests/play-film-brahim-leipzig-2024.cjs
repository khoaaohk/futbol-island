// Iconic-play film: Brahim Díaz's slalom goal, RB Leipzig 0–1 Real Madrid, Champions League 2024 (lib/plays/riso/brahim-leipzig-2024.ts).
// Structural checks, no browser: story shape, narration = script.json, kits (flagged unconfirmed), the solved goal (picked up wide right,
// past Raum, Simons, Schlager in order, left-foot curl from outside the box into the far corner), cue timing on the recorded voice.
// usage: node tests/play-film-brahim-leipzig-2024.cjs
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

const ID='brahim-leipzig-2024',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
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
assert.ok(/Leipzig/.test(text)&&/RB Leipzig against Real Madrid/.test(text)&&/Brahim Díaz/.test(text)&&/Gulácsi/.test(text)&&/one-nil/.test(text),'place, match, scorer, keeper and score are narrated');
assert.ok(/out wide/.test(text)&&/spins away/.test(text)&&/left-footed/.test(text)&&/far corner/.test(text),'the confirmed details: out wide, the spin, the left foot, the far corner');
assert.ok(/keep the ball close with small touches/.test(film.chapters[3].narration)&&/past each defender\.$/.test(film.chapters[3].narration),'ends with the lesson');
assert.ok(/NOT confirmed for this match/.test(src)&&/neither confirmed for this match/.test(src),'both kits are flagged as unconfirmed');
assert.ok(/BD_ST=madrid\(\{number:21/.test(src)&&/leipzig\(\{number:22/.test(src)&&/leipzig\(\{number:20/.test(src)&&/leipzig\(\{number:24/.test(src),'Brahim 21, Raum 22, Simons 20, Schlager 24');
const F=load(file).FACTS;
assert.ok(F.PICK[2]>22,'he picks it up wide on the right (+z, near the touchline)');
{const order=[['Raum',F.T_SPIN],['Simons',F.T_SIM],['Schlager',F.T_SCH]];let prev=-1e9;for(const [n,t] of order){assert.ok(t>prev,`${n} is beaten in order`);prev=t;const d=F.defAt(n,t),b=F.ballAt(t);const dist=Math.hypot(d[0]-b[0],d[1]-b[2]);assert.ok(dist<1.6&&dist>.4,`${n} is right there but misses (${dist.toFixed(2)} m)`);}}
{const [x0]=F.posOf(0,F.T_PICK),[x1,z1]=F.posOf(0,0);assert.ok(x1>x0&&z1<F.PICK[2]-10,'he cuts inside toward goal');}
{const sk=F.heroAt(0),d=Math.hypot(sk.lToe[0]-F.C_BALL[0],sk.lToe[2]-F.C_BALL[2]),dr=Math.hypot(sk.rToe[0]-F.C_BALL[0],sk.rToe[2]-F.C_BALL[2]);assert.ok(d<.35&&dr>d,`his LEFT boot strikes it (${d.toFixed(2)} m)`);}
assert.ok(F.C_BALL[0]<-16.5,'shot from just outside the box');assert.ok(F.GOAL_PT[2]<-2.4&&F.GOAL_PT[1]>1.5,'far (left) corner, high');
{// the curl: at mid-flight the ball is outside the straight line toward the far post (on his left), then comes back in
 const a=F.C_BALL,b=F.GOAL_PT,m=F.ballAt(F.FLY/2),dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz),side=((m[0]-a[0])*dz-(m[2]-a[2])*dx)/l;assert.ok(side>.5,`the shot bends: starts left of the line (${side.toFixed(2)} m) and curls back in`);}
{let crossed=false;for(let a=0;a<1.5;a+=.005){const p=F.ballAt(a),q=F.ballAt(a+.005);if(p[0]<0&&q[0]>=0){crossed=true;assert.ok(q[2]<-2.2&&q[2]>-3.55&&q[1]<2.33,`inside the far post, under the bar (z ${q[2].toFixed(2)}, y ${q[1].toFixed(2)})`);break;}}assert.ok(crossed,'goal');}
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
