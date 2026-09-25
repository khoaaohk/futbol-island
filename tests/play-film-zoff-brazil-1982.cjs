// Iconic-play film: Dino Zoff v Brazil 1982, the save on the line from Oscar's header (lib/plays/riso/zoff-brazil-1982.ts). Structural
// checks, no browser: story shape (4 chapters: live, slow replay, goal-line replay, lesson), narration = public/plays/narration/zoff-brazil-1982/
// script.json, 70–90 words ending with the lesson, cue words in order inside their chapter, length 20–42 s; one drawPlayer() adapter on the
// shared athlete library; the sourced kits and the save's geometry (dive to his left, ball held on the line, never over); when timing.json
// exists the film must import it. Renders every chapter through a stub canvas at the three card sizes.
// usage: node tests/play-film-zoff-brazil-1982.cjs
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

const ID='zoff-brazil-1982',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, slow replay, goal-line replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Dino Zoff/.test(text)&&/Oscar/.test(text)&&/Brazil/.test(text)&&/on the line/.test(text),'the keeper, the header, the opponent and the line are narrated');
assert.ok(/to his left/.test(text),'Zoff dives to his left (the Guardian account)');
assert.ok(!/left foot|right foot/.test(text),'the unverified kicking foot is not narrated');
const last=film.chapters[3].narration;
assert.ok(/final whistle/.test(last)&&/body behind the ball/.test(last)&&/hold on/.test(last),'ends with the lesson (focus to the whistle, body behind the ball, hold on)');
// the look contract: full-sheet framing, the voice hook, the real kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/shirt:B,shorts:'paper',socks:B/.test(src),'Italy: blue shirts, white shorts, blue socks');
assert.ok(/shirt:Y,shorts:B,socks:'paper'/.test(src),'Brazil: yellow shirts, blue shorts, white socks');
assert.ok(/ZOFF_STYLE:AthleteStyle=\{shirt:\[K,\.3\],shorts:\[K,\.9\d?\]/.test(src)&&/sleeves:'long',number:1/.test(src),'Zoff: pale grey long-sleeved number 1, black shorts');
assert.ok(/side:'l'/.test(src),'the dive is to his left');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=42,`length ${total}s`);
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src),'sources + confirmed/inferred listed at the top');
// the save's geometry, as the accounts give it: the header from beyond the far post, Zoff plunging to his LEFT (+Z when facing −X), the
// ball held on the line — never wholly over it (goal line at X = 105, 0.12 m wide, ball radius 0.11)
const start=F.zoffState(0).place;
assert.ok(F.HEAD_PT[1]>2&&F.HEAD_PT[1]<3.2,`Oscar meets the cross high (${F.HEAD_PT[1].toFixed(2)} m)`);
assert.ok(F.HEAD_PT[2]>3.66,`the header is from beyond the far post (z ${F.HEAD_PT[2].toFixed(2)})`);
assert.ok(F.HANDS[2]>start.z+1&&F.HANDS[2]<3.66,`the save is to his left, inside the post (z ${F.HANDS[2].toFixed(2)})`);
assert.ok(F.HANDS[1]<.8,`the header comes in low (${F.HANDS[1].toFixed(2)} m)`);
assert.ok(F.GRAB[0]>104.8&&F.GRAB[0]<105.06,`grabbed right on the line (x ${F.GRAB[0].toFixed(2)})`);
let maxX=0;for(let T=0;T<9;T+=.01){const b=F.ballAt(T);maxX=Math.max(maxX,b[0]);assert.ok(Number.isFinite(b[0]+b[1]+b[2]),'ball finite');}
assert.ok(maxX<105.06+.11,`the ball never wholly crosses (max x ${maxX.toFixed(2)})`);
assert.ok(F.ballAt(F.SAVE_T-.01)[1]<F.HEAD_PT[1],'the header goes down');
// installed voice (optional until generated): the film must import it
const timing=path.join(dir,'timing.json');
if(fs.existsSync(timing)){const T=JSON.parse(fs.readFileSync(timing,'utf8'));
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio once timing.json exists — import timing.json in ${ID}.ts (see the VOICE note)`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const d=T.chapters?.[i]?.seconds;if(typeof d==='number')assert.ok(ch.seconds>=d-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${d}`);});}
// render every chapter through the stub canvas at the three card sizes, reduced motion included
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});}
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${text.length} chars, ${total}s, ${frames} frames drawn, grab x ${F.GRAB[0].toFixed(2)}${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
