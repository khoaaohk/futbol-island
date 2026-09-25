// Iconic-play film: Pernille Harder's signature dribble and shot — her equaliser in the Euro 2017 final, Netherlands 4-2 Denmark, Enschede,
// 6 August 2017 (lib/plays/riso/harder-signature.ts). Structural checks, no browser: story shape (4 chapters: live, rail-cam replay, replay
// behind the goal, lesson), narration = public/plays/narration/harder-signature/script.json, 70–90 words ending with the lesson, cue words
// in order inside their chapter and never starting with a contraction or hyphenated word (Kokoro splits them), length 20–45 s; every figure
// through the one drawPlayer() adapter on the shared athlete library; seeded randomness only; the goal as the accounts describe it (just
// inside her own half as the long ball is played down the right, the defence trailing, into the box, a low left-foot shot in at the near
// post, the keeper beaten); when timing.json exists the film must import it. Also renders every chapter through a stub canvas at the three
// card sizes so a draw error fails here, not in the card. The TS loader also loads .json imports (timing.json).
// usage: node tests/play-film-harder-signature.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{module:m,exports:m.exports,Math,WeakMap,Map,DOMMatrix:globalThis.DOMMatrix??StubMatrix,DOMPoint:globalThis.DOMPoint,Path2D:StubPath,document:{createElement:()=>stubCanvas()},require:id=>{const base=path.resolve(path.dirname(file),id);return load([base+'.ts',base].find(fs.existsSync));}});
 return m.exports;}
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

const ID='harder-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, rail-cam replay, replay behind the goal, lesson');
assert.ok(/6 August 2017/.test(film.ageNote)&&/Enschede/.test(film.ageNote),'the real date and place are in the film');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Pernille Harder/.test(text)&&/Denmark/.test(text)&&/Netherlands/.test(text)&&/2017/.test(text)&&/Euro final/.test(text),'the player, the teams, the final and the year are narrated');
assert.ok(/left-foot/.test(text)&&/near post/.test(text)&&/own half/.test(text)&&/offside/.test(text),'the own-half start and the left-foot near-post finish are narrated');
const last=film.chapters[3].narration;
assert.ok(/keep the ball close as you run/.test(last)&&/shoot before the defender recovers!$/.test(last),'ends with the lesson');
// the look contract
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:10,/.test(src)&&/number:9,/.test(src)&&/number:1,/.test(src),'Harder 10, Nadim 9, keeper 1');
assert.ok(/shirt:'paper',trim:K,shorts:\[K,\.95\],socks:'paper'/.test(src),'Denmark in white shirts, black shorts, white socks (the final)');
assert.ok(/shirt:O,trim:K,shorts:O/.test(src),'the Netherlands in orange shirts and shorts');
assert.ok(/hairStyle:'ponytail'/.test(src)&&/build:W\(/.test(src),'women footballers: builds and ponytails');
assert.ok(/foot:'l',power:1/.test(src),'the finish is left-footed');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  const first=c.words.split(/\s+/)[0];assert.ok(!/['’\-]/.test(first),`ch${i+1} cue "${c.words}" starts with a plain word (Kokoro splits contractions and hyphens)`);
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=45,`length ${total}s`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MOMENT/.test(src),'sources + confirmed/inferred + why this moment listed at the top');
// the goal as the accounts describe it
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
assert.ok(F.harderAt(0)[0]<52.5&&F.harderAt(0)[0]>47,`just inside her own half as the ball is played (X ${F.harderAt(0)[0].toFixed(1)})`);
assert.ok(F.LAND1[0]-F.BALL0[0]>30&&F.LAND1[2]>14,'a long pass down the right (the attackers\' right = +Z)');
assert.ok(d3(F.CATCH_PT,F.harderToes(F.T_CATCH).r)<.2,'her first touch is off her right boot');
assert.ok(d3(F.TOUCH2_PT,F.harderToes(F.T_TOUCH2).l)<.2,'the touch into the box is off her left boot');
assert.ok(d3(F.SHOT_PT,F.harderToes(F.T_SHOT).l)<.2,'the shot is off her left boot');
assert.ok(F.SHOT_PT[0]>88.5&&F.SHOT_PT[2]>0&&F.SHOT_PT[2]<20.16,'she has cut into the area, on the right');
const dist=Math.hypot(F.GOAL.x-F.SHOT_PT[0],F.GOAL.z1-F.SHOT_PT[2]);assert.ok(dist>10&&dist<20,`shot from ${dist.toFixed(1)} m`);
assert.ok(F.POST[2]>2.6&&F.POST[2]<F.GOAL.z1&&F.POST[1]<.6,'low, just inside the NEAR post');
// the defence trails: both chasing defenders are behind her from the catch to the shot, the nearest within a few metres (not recovered)
for(let T=F.T_CATCH;T<=F.T_SHOT;T+=.05){const h=F.harderAt(T);for(const g of [F.vanEsAt(T),F.vdgAt(T)])assert.ok(g[0]<h[0],`defender behind her at T ${T.toFixed(2)}`);}
const gap=Math.hypot(...[0,1].map(i=>F.harderAt(F.T_SHOT)[i]-F.vanEsAt(F.T_SHOT)[i]));assert.ok(gap>1.4&&gap<4.5,`nearest defender ${gap.toFixed(1)} m away at the shot`);
// the keeper is wrong-footed: moving toward the middle (−Z) as the shot is struck, and never touches the ball
assert.ok(F.keeperAt(F.T_SHOT)[1]<F.keeperAt(F.T_SHOT-.6)[1]-.4,'the keeper steps toward the middle before the shot');
let near=9;for(let T=F.T_SHOT;T<F.T_GOAL+.01;T+=.01){const b=F.ballAt(T);for(const h of F.keeperHands(T))near=Math.min(near,d3(b,h));}
assert.ok(near>.2,`the shot beats the keeper (closest glove ${near.toFixed(2)} m)`);
// installed voice (optional until generated)
const timing=path.join(dir,'timing.json');
if(fs.existsSync(timing)){const T=JSON.parse(fs.readFileSync(timing,'utf8'));
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio once timing.json exists — import timing.json in ${ID}.ts (see the VOICE note)`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const d=T.chapters?.[i]?.seconds;if(typeof d==='number')assert.ok(ch.seconds>=d-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${d}`);});}
// render every chapter through the stub canvas: no draw errors at card sizes, reduced motion included
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});}
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${text.length} chars, ${total}s, ${frames} frames drawn, shot ${dist.toFixed(1)} m, closest glove ${near.toFixed(2)} m, defender ${gap.toFixed(1)} m${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
