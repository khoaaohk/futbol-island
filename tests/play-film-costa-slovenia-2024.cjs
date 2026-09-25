// Iconic-play film: Diogo Costa's three shoot-out saves in a row, Portugal v Slovenia, Euro 2024 (lib/plays/riso/costa-slovenia-2024.ts).
// Structural checks, no browser: story shape (3 chapters: live with three kicks, slow replay of the Balkovec save, lesson); the solved saves
// (each kicker's boot on the ball, the ball meets Costa's leading glove, every kick was goal-bound, none went in, Balkovec's tipped round the
// post, the sides from the Guardian); the lesson (he walks back to the middle and does not move before the kick); narration = script.json,
// 70–90 words ending with the lesson, cue words in order; one drawPlayer() adapter on athlete.ts; seeded randomness; the timing hook.
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

const ID='costa-slovenia-2024',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const film=load(file).default;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,3,'live broadcast (three kicks), slow replay of one save, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Diogo Costa/.test(text)&&/Iličić/.test(text)&&/Balkovec/.test(text)&&/Verbič/.test(text)&&/Frankfurt/.test(text)&&/Portugal and Slovenia/.test(text),'keeper, the three kickers, the match and the place are narrated');
assert.ok(!/\b(left|right|black|shirt|kit|miss\w*|fail\w*|bad|poor)\b/i.test(text),'no dive sides, no kit, nothing unkind to the kickers in the narration');
const last=film.chapters[2].narration;
assert.ok(/reset/.test(last)&&/stay patient until the ball is kicked\.$/.test(last),'ends with the lesson (reset, stay patient until the kick)');
// the look contract
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/const portugal=.*shirt:\[R,\.9\d?\],shorts:\[G,\.9\d?\],socks:\[R,\.9\d?\]/.test(src),'Portugal in red shirts, green shorts, red socks');
assert.ok(/const slovenia=.*shirt:'paper',shorts:'paper',socks:'paper'/.test(src),'Slovenia all in white');
assert.ok(/COSTA_ST:AthleteStyle=\{shirt:\[K,\.9\d?\],shorts:\[K,\.9\d?\],socks:\[K,\.9\d?\].*gloves:\[R,.*number:22,numberInk:Y/.test(src),'Costa in black, 22, orange-red gloves');
assert.ok(/green:'#00a95c'/.test(src)&&/red:'#e8392f'/.test(src),'a Portugal ink set (deep red + green)');
// the three saves, solved from the bodies
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const F=load(file).FACTS,[A,Bk,C]=F.KICKS;
assert.equal(JSON.stringify(F.KICKS.map(k=>k.name)),JSON.stringify(['Iličić','Balkovec','Verbič']),'the three saves, in order');
assert.equal(JSON.stringify(F.KICKS.map(k=>k.number)),JSON.stringify([26,3,7]),'Iličić 26, Balkovec 3, Verbič 7');
assert.equal(A.foot,'l','Iličić is left-footed (confirmed)');
F.KICKS.forEach((k,i)=>{
 const toe=F.toeAt(i,0);assert.ok(Math.hypot(toe[0]-F.B0[0],toe[2]-F.B0[2])<.25,`${k.name}: the kicking boot is on the ball at contact (${Math.hypot(toe[0]-F.B0[0],toe[2]-F.B0[2]).toFixed(2)} m)`);
 const sk=F.costaAt(i,k.tSave),hd=d3(k.hand==='l'?sk.lHa:sk.rHa,k.H);
 assert.ok(hd<.3,`${k.name}: the ball meets Costa's glove at the save (${hd.toFixed(2)} m)`);
 const b=F.ballAt(i,k.tSave);assert.ok(d3(b,k.H)<.02,`${k.name}: the ball is at the save point at the save`);
 const u=-F.B0[0]/(k.H[0]-F.B0[0]),y=F.B0[1]+(k.H[1]-F.B0[1])*u,z=F.B0[2]+(k.H[2]-F.B0[2])*u;
 assert.ok(Math.abs(z)<3.6&&y<2.44&&y>0,`${k.name}: the kick was goal-bound (line at z ${z.toFixed(2)}, y ${y.toFixed(2)})`);
 assert.ok(k.tDive<.05&&k.tDive>-.2,`${k.name}: Costa goes as the ball is struck`);
 // no goal: wherever the ball crosses the goal line it is outside the posts or over the bar
 for(let a=0;a<3;a+=.005){const p=F.ballAt(i,k.tSave+a),q=F.ballAt(i,k.tSave+a+.005);if(p[0]<0&&q[0]>=0)assert.ok(Math.abs(q[2])>3.66+.11||q[1]>2.44,`${k.name}: the ball crosses the line outside the goal (z ${q[2].toFixed(2)})`);}
 const end=F.ballAt(i,k.tSave+2.5);assert.ok(end[0]<-1.5||Math.abs(end[2])>3.9,`${k.name}: no goal (${end[0].toFixed(2)}, ${end[2].toFixed(2)})`);});
assert.ok(A.side==='l'&&A.H[2]>.8&&A.H[1]<.8,"Iličić: low to Costa's left (+z) — the kicker's bottom right");
assert.ok(Bk.side==='r'&&Bk.kind==='tip'&&Bk.H[2]<-2.4,"Balkovec: to Costa's right (−z), near the post, tipped");
{let crossed=false;for(let a=0;a<2;a+=.005){const q=F.ballAt(1,Bk.tSave+a);if(q[0]>0){crossed=true;assert.ok(q[2]<-3.77,'Balkovec: tipped round the post (outside it)');break;}}assert.ok(crossed,'Balkovec: the tipped ball goes out behind the goal line');}
assert.ok(C.side==='r'&&C.H[2]<-.8,"Verbič: to Costa's right (\"down to his right\")");
const S=F.sched();assert.ok(S.cutB>S.t0[0]+A.tSave+.5&&S.cutC>S.t0[1]+Bk.tSave+.8&&S.cutB<S.cutC,'live: each save plays out before the broadcast cuts to the next kick');
// the lesson: he walks back to the middle, and is still (set) until the kick
{const tk=F.tKick(),m=F.lessonCosta(tk-.3),m2=F.lessonCosta(tk-.9);assert.ok(Math.hypot(m.pelvis[0]-F.MID[0],m.pelvis[2]-F.MID[2])<.5,'lesson: back in the middle of the line before the kick');
 assert.ok(d3(m.pelvis,m2.pelvis)<.2,'lesson: patient — no step before the ball is kicked');
 const l0=F.lessonCosta(.2);assert.ok(l0.pelvis[2]<-1.5,'lesson: starts where the last dive (to his right) left him');}
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=50,`length ${total}s`);
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src),'sources + confirmed/inferred listed at the top');
const timing=path.join(dir,'timing.json');
if(fs.existsSync(timing)){const T=JSON.parse(fs.readFileSync(timing,'utf8'));
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio once timing.json exists — import timing.json in ${ID}.ts (see the VOICE note)`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const d=T.chapters?.[i]?.seconds;if(typeof d==='number')assert.ok(ch.seconds>=d-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${d}`);});}
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});}
console.log(`PASS ${ID}: 3 chapters, ${words} words / ${text.length} chars, ${total}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
