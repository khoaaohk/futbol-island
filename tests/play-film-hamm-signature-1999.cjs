// Iconic-play film: Mia Hamm v Denmark, Women's World Cup opener, 19 June 1999 — her signature dribble and shot (lib/plays/riso/hamm-signature-1999.ts).
// Structural checks, no browser: story shape (4 chapters: live, replay in front of her, replay behind the goal, lesson), narration =
// public/plays/narration/hamm-signature-1999/script.json, 70–90 words ending with the lesson, cue words in order inside their chapter,
// length 20–42 s; every figure goes through the one drawPlayer() adapter on the shared athlete library; seeded randomness only; the goal as
// the match reports describe it (chest trap in the right side of the box, the pop over Pedersen, a left-footed shot from 12–15 yards into
// the near top corner over Larsen's hand); when timing.json exists the film must import it. Also renders every chapter through a stub
// canvas at the three card sizes so a draw error fails here, not in the card. The TS loader also loads .json imports (timing.json).
// usage: node tests/play-film-hamm-signature-1999.cjs
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

const ID='hamm-signature-1999',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, replay in front of her, replay behind the goal, lesson');
assert.ok(/19 June 1999/.test(film.ageNote),'the real date is in the film');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Mia Hamm/.test(text)&&/Denmark/.test(text)&&/Brandi Chastain/.test(text)&&/Katrine Pedersen/.test(text)&&/1999/.test(text),'the players, the opponent and the year are narrated');
assert.ok(/Left foot/.test(text)&&/chest/.test(text),'the chest trap and the left-foot finish are narrated');
const last=film.chapters[3].narration;
assert.ok(/run at defenders/.test(last)&&/confidence/.test(last)&&/see the gap/.test(last)&&/finish!$/.test(last),'ends with the lesson (run at defenders with confidence, finish when you see the gap)');
// the look contract: full-sheet card-window framing, broadcast cameras (no top-down), the real kits, the voice hook
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:9,/.test(src)&&/number:6,/.test(src)&&/number:14,/.test(src)&&/number:1,/.test(src),'Hamm 9, Chastain 6, Pedersen 14, Larsen 1');
assert.ok(/shirt:R,trim:'paper',shorts:K,socks:R/.test(src),'USA in red shirts, navy shorts, red socks (the match photos)');
assert.ok(/shirt:'paper',trim:R,shorts:R,socks:'paper'/.test(src),'Denmark in white shirts, red shorts, white socks');
assert.ok(/hairStyle:'ponytail'/.test(src)&&/build:W\(/.test(src),'women footballers: builds and ponytails');
assert.ok(/foot:'l',power:1/.test(src),'the finish is left-footed');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=42,`length ${total}s`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MOMENT/.test(src),'sources + confirmed/inferred + why this moment listed at the top');
// the goal as the reports describe it
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const ch=F.hammToes(F.T_CHEST).chest;assert.ok(d3(F.CHEST_PT,ch)<.35&&F.CHEST_PT[1]>1&&F.CHEST_PT[1]<1.6,`the long ball meets her chest (${F.CHEST_PT.map(v=>v.toFixed(2))})`);
assert.ok(F.CHEST_PT[0]>88.5&&F.CHEST_PT[2]>3&&F.CHEST_PT[2]<20.16,'the trap is in the right side of the penalty area (+Z, the attackers\' right)');
assert.ok(F.BALL0[0]<F.CHEST_PT[0]-25,'a long pass');
assert.ok(d3(F.POP_PT,F.hammToes(F.T_POP).r)<.2,'the pop is off her right boot');
assert.ok(d3(F.SHOT_PT,F.hammToes(F.T_SHOT).l)<.2,'the shot is off her left boot');
const dist=Math.hypot(F.GOAL.x-F.SHOT_PT[0],F.GOAL.z1-F.SHOT_PT[2])/.9144;assert.ok(dist>11&&dist<16,`shot from 12–15 yards (${dist.toFixed(1)} yd)`);
assert.ok(F.TOP[2]>2.6&&F.TOP[2]<F.GOAL.z1&&F.TOP[1]>1.9&&F.TOP[1]<F.GOAL.h,'into the NEAR top corner, just under the bar');
// the pop goes over Pedersen: when the ball passes her, it is above her head height
let over=false;for(let T=F.T_POP;T<F.T_POP+.66;T+=.01){const b=F.ballAt(T),p=F.pedersenAt(T);if(Math.hypot(b[0]-p[0],b[2]-p[1])<.6){assert.ok(b[1]>1.25,`over Pedersen (ball ${b[1].toFixed(2)} m at T ${T.toFixed(2)})`);over=true;}}
assert.ok(over,'the pop passes over Pedersen');
// over Larsen's outstretched hand: never touches her gloves
let near=9;for(let T=F.T_SHOT;T<F.T_GOAL+.01;T+=.01){const b=F.ballAt(T);for(const h of F.larsenHands(T))near=Math.min(near,d3(b,h));}
assert.ok(near>.16&&near<1.2,`the shot flies just past Larsen's hand (closest ${near.toFixed(2)} m)`);
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
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${text.length} chars, ${total}s, ${frames} frames drawn, shot ${dist.toFixed(1)} yd, closest glove ${near.toFixed(2)} m${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
