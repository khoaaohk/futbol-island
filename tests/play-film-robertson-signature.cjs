// Iconic-play film: Andrew Robertson's signature, the overlap and cross — Liverpool 3–1 Manchester City, Anfield, 10 Nov 2019, the
// 13th-minute goal (Trent's switch, Robertson's touch, sprint and cross, Salah's header) (lib/plays/riso/robertson-signature.ts).
// Structural checks, no browser: story shape (4 chapters: live, slow replay, second replay, lesson), narration = public/plays/narration/
// robertson-signature/script.json, 70–90 words ending with the lesson, cue words in order inside their chapter and never starting with a
// contraction or hyphenated word, length 20–45 s; every figure through the one drawPlayer() adapter on the shared athlete library; the
// play as the sources describe it (a long switch right to left, one touch, an early cross with the left foot, the header back across
// into the left-hand corner) and the lesson's overlap (outside the winger); the voice hook; and every chapter drawn through a stub canvas
// at the three card sizes. The loader handles .ts and .json imports.
// usage: node tests/play-film-robertson-signature.cjs
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

const ID='robertson-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
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
assert.ok(/Andy Robertson/.test(text)&&/Salah/.test(text)&&/Liverpool/.test(text)&&/Manchester City/.test(text)&&/2019/.test(text)&&/Anfield/.test(text),'Robertson, Salah, Liverpool, City, 2019 and Anfield are narrated');
assert.ok(/One touch/.test(text)&&/early/.test(text),'the sourced beats: one touch, the early cross');
assert.ok(!/\b(red|blue|black|navy|yellow)\b/i.test(text),'kit colours are unverified: never narrated');
assert.ok(!/Mané|Mane/.test(text),'Mané\'s part in this goal is inferred: not narrated');
const last=film.chapters[3].narration;
assert.ok(/Sprint past your winger on the outside/.test(last)&&/whip the ball in early/.test(last),'ends with the lesson');
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/ROBERTSON:AthleteStyle=lfc\(\{number:26,/.test(src)&&/SALAH:AthleteStyle=lfc\(\{number:11,/.test(src)&&/TRENT:AthleteStyle=lfc\(\{number:66,/.test(src),'Robertson 26, Salah 11, Trent 66');
assert.ok(/shirt:R,trim:'paper',shorts:R,socks:R/.test(src),'Liverpool all red at home');
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
// the play (Liverpool attack the goal at X = 0; the near touchline Z = 0 is Robertson's left wing)
const d2=(a,b)=>Math.hypot(a[0]-b[0],a[a.length-1]-b[b.length-1]);
const t0=F.trentAt(F.T_PASS),bt=F.TOUCH_AT;
assert.ok(t0[1]>50&&bt[2]<10,'the switch: from right-back (far side) to the left wing (near side)');
assert.ok(Math.hypot(t0[0]-bt[0],t0[1]-bt[2])>=50,`a long ball (${Math.hypot(t0[0]-bt[0],t0[1]-bt[2]).toFixed(1)} m ≈ 60 yards)`);
assert.ok(F.ballAt((F.T_PASS+F.T_TOUCH)/2)[1]>4,'the switch is lofted');
assert.ok(F.T_CROSS-F.T_TOUCH<2,'one touch, then the cross within two seconds');
assert.ok(F.BALL_X[0]>16.5,'an EARLY cross: from outside the box, before the byline');
assert.ok(F.T_NET-F.T_PASS<7,'about six seconds from the switch to the net');
const lt=F.leftToe(),rt=F.rightToe(),db=(p)=>Math.hypot(p[0]-F.BALL_X[0],p[2]-F.BALL_X[2]);
assert.ok(db(lt)<.2&&db(rt)>.3,`the LEFT boot whips the cross (left ${db(lt).toFixed(2)} m, right ${db(rt).toFixed(2)} m)`);
const bx=F.ballAt(F.T_CROSS);assert.ok(Math.hypot(bx[0]-F.BALL_X[0],bx[2]-F.BALL_X[2])<.05,'the ball is at the boot at the cross frame');
// the overlap (the lesson): Robertson on the OUTSIDE of his winger, and past him by the cross
for(let T=F.T_PASS;T<=F.T_CROSS;T+=.25){const r=F.robAt(T),m=F.maneAt(T);assert.ok(r[1]<m[1]-4,`Robertson outside Mané at T=${T.toFixed(2)}`);}
assert.ok(F.robAt(F.T_CROSS)[0]<F.maneAt(F.T_CROSS)[0],'Robertson has sprinted past his winger by the cross');
// Salah rushes in from inside-right, on Angeliño's blind side, and heads it back across into the left-hand (near-side) corner
const sh=F.salahHead(),bh=F.BALL_H;assert.ok(Math.hypot(sh[0]-bh[0],sh[1]-bh[1],sh[2]-bh[2])<.3,'the ball meets Salah\'s head');
const bs=F.ballAt(F.T_HEAD);assert.ok(Math.hypot(bs[0]-bh[0],bs[1]-bh[1],bs[2]-bh[2])<.05,'the ball is at the head at the header frame');
assert.ok(F.salahAt(0)[1]>40,'Salah starts inside-right (far side)');
assert.ok(F.angelAt(F.T_HEAD)[1]<F.salahAt(F.T_HEAD)[1]&&F.angelAt(F.T_HEAD)[0]>F.salahAt(F.T_HEAD)[0],'Salah goes in behind Angeliño (his blind side)');
assert.ok(F.BALL_NET[0]<0&&F.BALL_NET[2]>30.34&&F.BALL_NET[2]<34&&F.BALL_NET[1]<2.44,'in the net, the left-hand (near-side) half of the goal');
assert.ok(F.BALL_NET[2]<F.BALL_H[2],'the header goes back across');
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
