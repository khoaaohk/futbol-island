// Iconic-play film: Alexis Mac Allister, signature "setting the tempo" — his pass for Di María's goal, 2022 World Cup final
// (lib/plays/riso/mac-allister-signature.ts). Structural checks, no browser: story shape (4 chapters: live, chase replay, replay behind the
// passer, training-pitch lesson); the solved play (Messi's flick, Álvarez's right-foot pass into Mac Allister's run, his right-foot pass from
// the right across to Di María on the left, Di María's LEFT-foot finish across goal into the far/right corner over the diving Lloris, Koundé
// missing the pass); narration = public/plays/narration/mac-allister-signature/script.json, 70–90 words ending with the lesson, cue words
// are substrings in order and inside their chapter before the passage, length 20–42 s; every figure goes through the one drawPlayer()
// adapter on the shared athlete library; seeded randomness only; when timing.json exists the film must import it.
// Also renders every chapter through a stub canvas at the three card sizes so a draw error fails here, not in the card.
// usage: node tests/play-film-mac-allister-signature.cjs
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

const ID='mac-allister-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const film=load(file).default;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, chase replay, replay behind the passer, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Mac Allister/.test(text)&&/Messi/.test(text)&&/Álvarez/.test(text)&&/Di María/.test(text)&&/World Cup final/.test(text)&&/left foot/.test(text),'passer, the chain, the finisher, the match and the left foot are narrated');
assert.ok(!/shirt|keeper|Lloris|Molina|lay/i.test(text),'inferred details (keeper kit, the first touches) are never narrated');
const last=film.chapters[3].narration;
assert.ok(/safe passes/.test(last)&&/speed it up/.test(last)&&/one quick pass forward!$/.test(last),'ends with the lesson (safe passes, then one quick forward pass)');
assert.ok(!/Mac Allister|Messi|Di María|Álvarez/.test(last),'the lesson is a demonstration, not the match');
// the look contract: full-sheet card-window framing, broadcast cameras (no top-down), the real kits, the voice hook
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:20/.test(src)&&/number:11/.test(src)&&/number:10/.test(src)&&/number:9,/.test(src)&&/number:26/.test(src)&&/number:5,/.test(src)&&/number:1,/.test(src),'Mac Allister 20, Di María 11, Messi 10, Álvarez 9, Molina 26, Koundé 5, Lloris 1');
assert.ok(/pattern:'stripes'/.test(src)&&/shorts:K,socks:'paper'/.test(src),'Argentina in the stripes, black (navy) shorts, white socks');
assert.ok(/const FRA=.*shirt:\[K,\.9\d?\],shorts:\[K/.test(src),'France in navy shirts and shorts');
assert.ok(/MV_SHOT:Move=\{[^}]*foot:'l'/.test(src),'Di María shoots with his LEFT foot (confirmed)');
// the play, solved from the bodies
const F=load(file).FACTS,I=F.IDX,d2=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const b0=F.ballAt(F.SHOT),lt=F.toeAt(I.DIM,F.SHOT,'l'),rt=F.toeAt(I.DIM,F.SHOT,'r');
assert.ok(d2(b0,lt)<.25,`Di María's LEFT boot is on the ball at the shot (${d2(b0,lt).toFixed(2)} m)`);assert.ok(d2(b0,rt)>d2(b0,lt)+.2,'…not his right');
const bc=F.ballAt(F.CROSS),mt=F.toeAt(I.MAC,F.CROSS,'r');assert.ok(d2(bc,mt)<.25,`Mac Allister's right boot is on the ball at his pass (${d2(bc,mt).toFixed(2)} m)`);
const bt=F.ballAt(F.THRU),at=F.toeAt(I.ALV,F.THRU,'r');assert.ok(d2(bt,at)<.25,`Álvarez's right boot is on the ball at his pass (${d2(bt,at).toFixed(2)} m)`);
assert.ok(F.CROSS_PS[2]>F.DIM_RX[1]+8,'the pass goes from the right (+Z) across to the left (−Z)');
assert.ok(F.CROSS_PS[0]>84&&F.CROSS_PS[0]<89,'Mac Allister passes as he arrives at the edge of the box');
assert.ok(F.SHOT_FROM[0]>88.5&&Math.abs(F.SHOT_FROM[2])<20.16,'Di María shoots from inside the box');
assert.ok(F.SHOT_FROM[2]<-3,'…on the left side');
const bn=F.ballAt(F.IN_NET-.01);assert.ok(bn[0]>104.8&&bn[2]>0&&bn[2]<3.66&&bn[1]<2.44,`into the far (+Z, right) side of the goal, under the bar (${bn.map(v=>v.toFixed(2))})`);
// over the diving Lloris: where the ball crosses his X it is above his body
{const sk=F.skAt(I.LLO,.3);let tau=0;while(F.ballAt(tau)[0]<sk.pelvis[0]&&tau<1)tau+=.01;const b=F.ballAt(tau),sk2=F.skAt(I.LLO,tau);
 const top=Math.max(sk2.lHa[1],sk2.rHa[1],sk2.head[1],sk2.chest[1]);const near=Math.min(...['lHa','rHa','head','chest'].map(j=>Math.hypot(sk2[j][0]-b[0],sk2[j][1]-b[1],sk2[j][2]-b[2])));
 assert.ok(near>.25,`the ball passes Lloris untouched (${near.toFixed(2)} m from his nearest hand/head)`);assert.ok(b[1]>.35,`lifted over his low dive (ball ${b[1].toFixed(2)} m, his top ${top.toFixed(2)} m)`);}
// Koundé stretches but never reaches the pass
{let mn=9;for(let tau=F.CROSS;tau<-.6;tau+=.02){const b=F.ballAt(tau);for(const f of ['l','r']){mn=Math.min(mn,d2(b,F.toeAt(I.KOU,tau,f)));}}assert.ok(mn>.3,`Koundé misses the pass (closest boot ${mn.toFixed(2)} m)`);}
// Messi flicks it on toward Álvarez on the right (+Z) and forward (+X)
assert.ok(F.THRU_PS[2]>F.FLICK_PS[2]+6&&F.THRU_PS[0]>F.FLICK_PS[0],'Messi flicks it forward to the right, to Álvarez');
assert.ok(F.FLICK_PS[1]>.15,'…before it touches the ground');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(/^[A-Za-z]/.test(c.words)&&!/^\S*['’-]/.test(c.words),`ch${i+1} cue "${c.words}" starts with a plain word`);
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=42,`length ${total}s`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MOMENT/.test(src),'sources + why + confirmed/inferred listed at the top');
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
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${text.length} chars, ${total}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
