// Iconic-play film: Sun Wen v Norway, Women's World Cup semi-final, 4 July 1999 — her signature clever finish (lib/plays/riso/sun-wen-signature.ts).
// Structural checks, no browser: story shape (4 chapters: live, replay behind her, replay behind the goal, lesson), narration =
// public/plays/narration/sun-wen-signature/script.json, 70–90 words ending with the lesson, cue words in order inside their chapter,
// length 20–42 s; every figure goes through the one drawPlayer() adapter on the shared athlete library; seeded randomness only; the goal as
// the match reports describe it (Liu's ball from about 35 yards into Jin's run, Jin's shot from 12 yards, Nordby's kick save, Sun traps the
// rebound, turns and scores with her left foot, in space); when timing.json exists the film must import it. Also renders every chapter
// through a stub canvas at the three card sizes so a draw error fails here, not in the card. The TS loader also loads .json imports.
// usage: node tests/play-film-sun-wen-signature.cjs
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

const ID='sun-wen-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, replay behind her, replay behind the goal, lesson');
assert.ok(/4 July 1999/.test(film.ageNote)&&/Norway/.test(film.ageNote),'the real match and date are in the film');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Sun Wen/.test(text)&&/Norway/.test(text)&&/Liu Ailing/.test(text)&&/Jin Yan/.test(text)&&/1999/.test(text),'the players, the opponent and the year are narrated');
assert.ok(/left foot/.test(text)&&/traps it/.test(text)&&/turns hard/.test(text),'the trap, the turn and the left-foot finish are narrated');
const last=film.chapters[3].narration;
assert.ok(/find space/.test(last)&&/not looking/.test(last)&&/finish quickly!$/.test(last),'ends with the lesson (find space where the defenders are not looking, finish quickly)');
// the look contract: full-sheet card-window framing, broadcast cameras (no top-down), the real kits, the voice hook
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:9,/.test(src),'Sun Wen wears 9');
assert.ok(/shirt:'paper',trim:R,shorts:'paper',socks:'paper'/.test(src),'China all in white with red trim (the AP photo)');
assert.ok(/hairStyle:'ponytail'/.test(src)&&/build:W\(/.test(src),'women footballers: builds and hair styles');
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
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]),yd=m=>m/.9144;
const passYd=yd(F.GOAL.x-F.BALL0[0]);assert.ok(passYd>30&&passYd<40,`Liu's ball from about 35 yards (${passYd.toFixed(1)} yd)`);
const jinYd=yd(Math.hypot(F.GOAL.x-F.JSHOT_PT[0],F.JSHOT_PT[2]));assert.ok(jinYd>10.5&&jinYd<14,`Jin's shot from about 12 yards (${jinYd.toFixed(1)} yd)`);
assert.ok(d3(F.JSHOT_PT,F.jinToes(F.T_JSHOT).r)<.2,'Jin shoots off her boot');
assert.ok(d3(F.SAVE_PT,F.nordbyToes(F.T_SAVE).r)<.2&&F.SAVE_PT[1]<.5,'a KICK save: the shot meets Nordby\'s boot');
assert.ok(d3(F.TRAP_PT,F.sunToes(F.T_TRAP).l)<.2,'Sun traps the rebound with her boot');
assert.ok(d3(F.SHOT_PT,F.sunToes(F.T_SHOT).l)<.2,'the shot is off her left boot');
assert.ok(F.LOW[0]>F.GOAL.x&&Math.abs(F.LOW[2])<F.GOAL.z1&&F.LOW[1]<F.GOAL.h,'into the goal');
// the space: no Norway outfield player within 4 m of Sun when she traps it
const[sx,sz]=F.sunAt(F.T_TRAP);let close=99;for(const[x,z] of F.norwayAt(F.T_TRAP))close=Math.min(close,Math.hypot(x-sx,z-sz));
assert.ok(close>4,`Sun is in space at the trap (nearest defender ${close.toFixed(1)} m)`);
// Nordby got up but was beaten: the shot never touches her gloves
let near=9;for(let T=F.T_SHOT;T<F.T_GOAL+.01;T+=.01){const b=F.ballAt(T);for(const h of F.nordbyHands(T))near=Math.min(near,d3(b,h));}
assert.ok(near>.3,`the shot beats Nordby (closest glove ${near.toFixed(2)} m)`);
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
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${text.length} chars, ${total}s, ${frames} frames drawn, Jin ${jinYd.toFixed(1)} yd, pass ${passYd.toFixed(1)} yd, space ${close.toFixed(1)} m, closest glove ${near.toFixed(2)} m${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
