// Iconic-play film: Scott McTominay's signature, the late run and finish — Scotland 2–0 Spain, Hampden Park, 28 Mar 2023, the 7th-minute
// opener (Porro slips, Robertson's cut-back, McTominay's first-time left-foot finish off Iñigo Martínez) (lib/plays/riso/mctominay-signature.ts).
// Structural checks, no browser: story shape (4 chapters: live, slow replay, second replay, lesson), narration = public/plays/narration/
// mctominay-signature/script.json, 70–90 words ending with the lesson, cue words in order / inside their chapter / starting with a plain
// word; one drawPlayer() adapter on the shared athlete library; seeded randomness only; the solved play (left boots, the late run, the
// deflection); the voice hook; and every chapter drawn through a stub canvas at the three card sizes.
// usage: node tests/play-film-mctominay-signature.cjs
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

const ID='mctominay-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, slow replay, second replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Scott McTominay/.test(text)&&/Andy Robertson/.test(text)&&/Scotland/.test(text)&&/Spain/.test(text)&&/2023/.test(text)&&/Hampden Park/.test(text),'McTominay, Robertson, Scotland, Spain, 2023 and Hampden are narrated');
assert.ok(/slips/.test(text)&&/cuts it back/.test(text)&&/First time, left foot/.test(text)&&/flicks off a defender/.test(text),'the sourced beats: the slip, the cut-back, first time with the left foot, the deflection');
assert.ok(!/\b(red|blue|white|navy|yellow|pale)\b/i.test(text),'kit colours are unverified: never narrated');
assert.ok(!/Porro|Martínez|Martinez|Kepa/.test(text),'kid-friendly: the Spain players who erred are not named');
const last=film.chapters[3].narration;
assert.ok(/Time your run so you arrive in the box just as the ball does!$/.test(last),'ends with the lesson');
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/MCTOMINAY:AthleteStyle=sco\(\{number:4,/.test(src)&&/ROBERTSON:AthleteStyle=sco\(\{number:3,/.test(src),'McTominay 4, Robertson 3 (UEFA line-up)');
assert.ok(/height:1\.93/.test(src),'McTominay is tall (1.93 m)');
assert.equal(JSON.stringify(film.chapters.map(c=>c.cues.length)),'[5,5,4,4]','cue counts the scenes key their actions to');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(!/^[^\s]*[’'\-]/.test(c.words),`ch${i+1} cue "${c.words}" starts with a plain word (Kokoro)`);
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=45,`length ${total}s`);
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MOMENT/.test(src),'sources + why + confirmed/inferred listed at the top');
// the play (Scotland attack the goal at X = 0; the near touchline Z = 0 is Robertson's left wing, Porro's right)
const p0=F.porroAt(F.T_SLIP);assert.ok(p0[0]<6&&p0[1]<10,'Porro slips close to his byline, on the near (his right) side');
assert.ok(F.BALL_C[0]<4,'Robertson cuts it back from by the byline');
const d=(p,b)=>Math.hypot(p[0]-b[0],p[2]-b[2]);
assert.ok(d(F.robLeftToe(),F.BALL_C)<.2&&d(F.robRightToe(),F.BALL_C)>.3,'Robertson cuts it back with his LEFT foot');
assert.ok(d(F.leftToe(),F.BALL_S)<.2&&d(F.rightToe(),F.BALL_S)>.3,`McTominay shoots with his LEFT foot (left ${d(F.leftToe(),F.BALL_S).toFixed(2)} m, right ${d(F.rightToe(),F.BALL_S).toFixed(2)} m)`);
assert.ok(F.BALL_S[0]<16.5&&F.BALL_S[0]>7&&Math.abs(F.BALL_S[2]-34)<6,'the shot from the centre of the box');
const bs=F.ballAt(F.T_SHOT);assert.ok(Math.hypot(bs[0]-F.BALL_S[0],bs[2]-F.BALL_S[2])<.05,'the ball is at his boot at the shot frame');
assert.ok(F.ballAt((F.T_CUT+F.T_SHOT)/2)[1]<.6,'the cut-back is low');
assert.ok(F.ballAt((F.T_SHOT+F.T_DEF)/2)[1]<.6,'the shot is low');
// the late run: outside the box while Robertson has the ball, a burst into it, arriving on the spot with the ball
assert.ok(F.mctAt(F.T_STEAL)[0]>16.5&&F.mctAt(F.T_CUT)[0]>16.5,'he holds outside the box until the cut-back');
assert.ok(F.mctSpeed(F.T_SHOT-.5)>1.8*F.mctSpeed(-1),'then bursts in (late run)');
const ma=F.mctAt(F.T_SHOT-.02);assert.ok(Math.hypot(ma[0]-F.BALL_S[0],ma[1]-F.BALL_S[2])<1.2,'he arrives on the spot just as the ball does');
// the deflection off Martínez (on the ground) into the centre of the goal
assert.ok(d(F.martRightToe(),F.DEF_AT)<.25,'the shot clips Martínez\'s boot');
assert.ok(F.BALL_NET[0]<0&&Math.abs(F.BALL_NET[2]-34)<1,'into the centre of the goal');
// installed voice (optional until generated): the film must import it, files exist and chapter seconds cover each clip
const timing=path.join(dir,'timing.json');
if(fs.existsSync(timing)){const T=JSON.parse(fs.readFileSync(timing,'utf8'));
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio once timing.json exists — import timing.json in ${ID}.ts (see the VOICE note)`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const dd=T.chapters?.[i]?.seconds;if(typeof dd==='number')assert.ok(ch.seconds>=dd-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${dd}`);});}
// render every chapter through the stub canvas at the three card sizes: no draw errors, reduced motion included
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});}
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${text.length} chars, ${total}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
