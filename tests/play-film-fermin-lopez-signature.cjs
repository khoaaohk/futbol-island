// Iconic-play film: Fermín López's signature, the surprise run and shot — his tap-in from Juan Miranda's driven cross from the left in the
// Olympic men's final, France 3–5 Spain (a.e.t.), Parc des Princes, 9 August 2024 (lib/plays/riso/fermin-lopez-signature.ts), plus the
// labelled "How he does it" training-pitch demonstration of the lesson. Structural checks, no browser: story shape (3 chapters: live,
// slow replay, the lesson demo), narration = public/plays/narration/fermin-lopez-signature/script.json, 70–90 words ending with the lesson,
// cue words in order inside their chapter (none starting with a contraction or hyphen), length 20–45 s; every figure through the one
// drawPlayer() adapter on the shared athlete library; the play's contact points (Miranda's LEFT boot on the cross from the left, the low
// driven ball, Fermín's RIGHT boot at close range, free of markers, the ball in between the posts); the demo (pass, run past the ball-watching
// defender, the return ball, the goal); the voice hook; every chapter drawn through a stub canvas at the three card sizes. The loader
// handles .ts and .json imports.
// usage: node tests/play-film-fermin-lopez-signature.cjs
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


const ID='fermin-lopez-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,3,'live broadcast, slow replay, the lesson demonstration');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Fermín López/.test(text)&&/Juan Miranda/.test(text)&&/Olympic final, 2024/.test(text)&&/Paris/.test(text)&&/from the left/.test(text)&&/Two-one to Spain/.test(text)&&/second goal of the final/.test(text)&&/gold, five-three/.test(text),
 'the sourced facts are narrated: Olympic final 2024 in Paris, Miranda from the left, Fermín, 2–1, his second of the final, gold 5–3');
assert.ok(!/right foot|left foot|header/i.test(text),'unconfirmed details (feet) are not narrated');
assert.equal(film.chapters[2].label,'How he does it','the demonstration is plainly labelled');
const last=film.chapters[2].narration;
assert.ok(/keep running forward after you pass/.test(last)&&/The return ball can find you free!$/.test(last),'ends with the lesson');
assert.ok(/9 August 2024/.test(film.ageNote)&&/3–5/.test(film.ageNote)&&/demonstration/.test(film.ageNote),'match, date and the demo are stated');
// the look contract: full-sheet framing, the voice hook, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming);/.test(src)&&/withTiming\(/.test(src)&&/\],VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:11,/.test(src)&&/number:3,/.test(src)&&/number:9,/.test(src),'Fermín 11, Miranda 3, Ruiz 9');
assert.ok(/shirt:\[Y,\.62\],trim:\[K,\.55\],shorts:\[Y,\.62\],socks:\[Y,\.62\]/.test(src)&&/shirt:B,trim:\[R,\.7\],shorts:'paper',socks:R/.test(src),'Spain pale yellow all over; France blue, white, red');
assert.equal(JSON.stringify(film.chapters.map(c=>c.cues.length)),'[5,5,6]','cue counts the scenes key their actions to');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(!/['’-]/.test(c.words.split(/\s+/)[0]),`ch${i+1} cue "${c.words}" starts with a plain word (Kokoro splits contractions and hyphens)`);
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=45,`length ${total}s`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MOMENT/.test(src),'sources, confirmed/inferred and why this moment, at the top');
// the play
const d2=(p,q)=>Math.hypot(p[0]-q[0],p[2]-q[1]);
// Miranda: the cross from the LEFT (Spain attack +X, so their left is the far side, high Z), struck with his left boot
assert.ok(F.XB[1]>54.16&&F.XB[0]>88.5,'the cross comes from the left channel near the box');
const mf=F.mirandaFeet(F.T_X);assert.ok(d2(mf.l,F.XB)<.3&&d2(mf.l,F.XB)<d2(mf.r,F.XB),`Miranda's left boot at the cross (${d2(mf.l,F.XB).toFixed(2)} m)`);
const bx=F.ballAt(F.T_X);assert.ok(Math.hypot(bx[0]-F.XB[0],bx[2]-F.XB[1])<.05,'the ball is at his boot at the cross');
let hi=0;for(let T=F.T_X;T<=F.T_TAP;T+=.02)hi=Math.max(hi,F.ballAt(T)[1]);assert.ok(hi<.6,`a driven, low cross (${hi.toFixed(2)} m)`);
// Fermín: right boot at the tap, close range (~2.4 m out, central), unmarked; the ball crosses the line between the posts, under the bar
const ff=F.ferminFeet(F.T_TAP);assert.ok(d2(ff.r,F.TAP)<.3&&d2(ff.r,F.TAP)<d2(ff.l,F.TAP),`Fermín's right boot at the tap (${d2(ff.r,F.TAP).toFixed(2)} m)`);
const bt=F.ballAt(F.T_TAP);assert.ok(Math.hypot(bt[0]-F.TAP[0],bt[2]-F.TAP[1])<.05,'the cross arrives at his boot');
assert.ok(105-F.TAP[0]<3.5&&Math.abs(F.TAP[1]-34)<3,'close range, central (FIFA X 97.7 %, Y 48.5 %)');
for(const id of F.ids.filter(i=>i.startsWith('f-'))){const p=F.at(id,F.T_TAP);assert.ok(Math.hypot(p[0]-F.TAP[0],p[1]-F.TAP[1])>2.6,`${id} is not on him at the tap`);}
assert.ok(F.at('fermin',-7)[0]<70,'he starts the run from midfield');
let crossed=null;for(let T=F.T_TAP;T<=F.T_GOAL+.2;T+=.01){const b=F.ballAt(T);if(b[0]>=105){crossed=b;break;}}
assert.ok(crossed&&crossed[2]>30.6&&crossed[2]<37.4&&crossed[1]<2.3,'into the goal between the posts');
const r0=F.restesFeet(F.DIVE_START).pelvis,r1=F.restesFeet(F.DIVE_START+F.DIVE_DUR*.8).pelvis;assert.ok(r1[2]<r0[2]-.8,`Restes dives across toward the finish (${(r1[2]-r0[2]).toFixed(2)} m)`);
// the celebration: he wheels away toward Miranda
const c0=F.at('fermin',.5),c1=F.at('fermin',3.4),m1=F.at('miranda',3.4);assert.ok(Math.hypot(c1[0]-m1[0],c1[1]-m1[1])<Math.hypot(c0[0]-m1[0],c0[1]-m1[1])-4,'he wheels away toward Miranda');
// the demo: YOU's right boot on the pass, the ball reaches the mate, YOU runs past the defender (who is watching the ball), the return ball
// meets YOU in space, the shot goes in
const D=F.demo,yf=D.youFeet(D.D_PASS);assert.ok(Math.hypot(yf.r[0]-D.DP0[0],yf.r[2]-D.DP0[1])<.3,'demo: the pass off the right boot');
const bm=D.dBall(D.D_MRX);assert.ok(Math.hypot(bm[0]-D.MATE_P[0],bm[2]-D.MATE_P[1])<.05,'demo: the pass reaches the teammate');
const mf2=D.mateFeet(D.D_RET);assert.ok(Math.hypot(mf2.r[0]-D.MATE_P[0],mf2.r[2]-D.MATE_P[1])<.3,'demo: the return pass off the mate\'s right boot');
const fwd=D.defFacing((D.D_MRX+D.D_RET)/2),dp=D.at('def',(D.D_MRX+D.D_RET)/2),tm=[D.MATE_P[0]-dp[0],D.MATE_P[1]-dp[1]];
assert.ok(fwd[0]*tm[0]+fwd[1]*tm[1]>.5*Math.hypot(...tm),'demo: the defender faces the ball at the teammate');
const ys=D.at('you',D.D_SHOT-.4),ds=D.at('def',D.D_SHOT-.4);assert.ok(ys[0]>ds[0]&&Math.hypot(ys[0]-ds[0],ys[1]-ds[1])>2,'demo: YOU is past the defender, free');
const yr=D.youFeet(D.D_SHOT);assert.ok(Math.hypot(yr.r[0]-D.RXP[0],yr.r[2]-D.RXP[1])<.3,'demo: the return ball finds YOU, first-time shot off the right boot');
const g=D.dBall(D.D_GOAL);assert.ok(g[0]>=D.DGX&&Math.abs(g[2]-D.DGZ)<2.5&&g[1]<2,'demo: into the small goal');
for(const mu of [0,1,2,3,4]){const a=D.at('you',mu),b=D.at('def',mu),c=D.at('mate',mu);assert.ok(Math.hypot(a[0]-b[0],a[1]-b[1])>1&&Math.hypot(c[0]-b[0],c[1]-b[1])>1,`demo: nobody overlaps at μ ${mu}`);}
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
console.log(`PASS ${ID}: 3 chapters, ${words} words / ${text.length} chars, ${total}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
