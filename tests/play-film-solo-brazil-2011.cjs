// Iconic-play film: Hope Solo saves Daiane's penalty, Brazil v USA shootout, 2011 Women's World Cup quarter-final (lib/plays/riso/solo-brazil-2011.ts).
// Structural checks, no browser: story shape (4 chapters: live, keeper's-eye replay, close replay, lesson), narration = public/plays/narration/
// solo-brazil-2011/script.json, 70–90 words ending with the lesson, cue words are substrings in order and inside their chapter before the
// passage, length 25–55 s; every figure goes through the one drawPlayer() adapter on the shared athlete library; seeded randomness only; the
// sourced facts (Solo dives to HER RIGHT, the ball meets her glove and goes wide of the post, the kits from FIFA's line-up sheet); when
// timing.json exists the film must import it. Also renders every chapter through a stub canvas at the three card sizes.
// usage: node tests/play-film-solo-brazil-2011.cjs
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

const ID='solo-brazil-2011',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, keeper-eye replay, close replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Hope Solo/.test(text)&&/Daiane/.test(text)&&/Brazil/.test(text)&&/Dresden/.test(text),'the keeper, the taker, the opponent and the place are narrated');
assert.ok(/her right/.test(film.chapters[0].narration),'Solo dives to her right (NYT)');
assert.ok(/five to three/.test(text),'the shootout score 5–3');
const last=film.chapters[3].narration;
assert.ok(/calm and big/.test(last)&&/Read the kicker/.test(last)&&/strong hands/.test(last),'ends with the lesson (calm and big, read the kicker, strong hands)');
// the look contract: full-sheet framing, the voice hook, the kits from FIFA's line-up sheet
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/const usa=[^\n]*shirt:\[K,\.95\],shorts:\[K,\.95\],socks:\[K,\.95\]/.test(src),'the USA all in black (navy ink)');
assert.ok(/const brazil=[^\n]*shirt:Y,shorts:'paper',socks:'paper'/.test(src),'Brazil yellow shirts, white shorts and socks');
assert.ok(/number:3,/.test(src),'Daiane wears 3');
assert.ok(/hairStyle:'ponytail'/.test(src)&&/B_SOLO:Build=\{height:1\.75/.test(src),'women footballers: ponytails; Solo 1.75 m');
// the sourced geometry: Solo faces the field (−x), so her right is −z; the ball meets her right glove, then goes wide of the right post
assert.equal(F.diveSide,'r');
assert.ok(F.HAND[2]<-1.2,`her right glove at full stretch is well to her right (z ${F.HAND[2].toFixed(2)})`);
const atHand=F.ballAt(F.T_HAND),dh=Math.hypot(atHand[0]-F.HAND[0],atHand[1]-F.HAND[1],atHand[2]-F.HAND[2]);
assert.ok(dh<.22,`ball meets the glove (${dh.toFixed(2)} m)`);
const hs=F.soloAt(F.T_HAND),dg=Math.hypot(atHand[0]-hs.rHa[0],atHand[1]-hs.rHa[1],atHand[2]-hs.rHa[2]);assert.ok(dg<.25,`in the film Solo's right glove is on the ball at the save (${dg.toFixed(2)} m)`);
const later=F.ballAt(F.T_HAND+.5);assert.ok(later[2]<-3.9&&later[0]<.2,`parried wide of the right post, not into the goal (${later.map(v=>v.toFixed(2))})`);
for(let sg=0;sg<=3;sg+=.05){const b=F.ballAt(sg);assert.ok(!(b[0]>0&&Math.abs(b[2])<3.66),`the ball never crosses the goal line inside the posts (σ ${sg.toFixed(2)})`);}
const dc=F.daianeContact(),toe=Math.hypot(dc.rToe[0]-(F.SPOT[0]-.1),dc.rToe[2]-F.SPOT[2]);assert.ok(toe<.3,`Daiane's RIGHT toe at the ball at contact (${toe.toFixed(2)} m)`);
assert.ok(/strike\(STRIKE_CONTACT,\{power:POWER\}\)/.test(src)&&!/foot:'l'/.test(src),'Daiane strikes with her right foot (inferred; not narrated)');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=25&&total<=55,`length ${total}s`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src),'sources + confirmed/inferred listed at the top');
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
