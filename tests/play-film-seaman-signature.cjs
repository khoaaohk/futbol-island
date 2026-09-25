// Iconic-play film: David Seaman's "safe pair of hands" — the one-handed save from Paul Peschisolido, Arsenal 1-0 Sheffield United, FA Cup
// semi-final, 13 April 2003, Old Trafford (lib/plays/riso/seaman-signature.ts). Structural checks, no browser:
// story shape (4 chapters: live, slow replay, behind-goal replay, lesson), narration = public/plays/narration/seaman-signature/script.json,
// 70-90 words ending with the lesson, cue words are substrings in order and inside their chapter before the passage, length 20-42 s;
// every figure goes through the one drawPlayer() adapter on the shared athlete library; seeded randomness only; the save really is the
// save (a backwards leap from the near post, the RIGHT glove behind the ball, the ball short of the line and scooped back out); the lesson
// ball slips into the body and stays out; when timing.json exists the film must import it. Also renders every chapter through a stub
// canvas at the three card sizes so a draw error fails here, not in the card.
// usage: node tests/play-film-seaman-signature.cjs
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

const ID='seaman-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
const {solve}=load(path.join(root,'lib/plays/riso/athlete.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, slow replay, behind-goal replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Seaman/.test(text)&&/Arsenal/.test(text)&&/Sheffield United/.test(text)&&/Peschisolido/.test(text)&&/right hand/.test(text),'the keeper, both teams, the header and the right hand are narrated');
assert.ok(!/Nayim|Ronaldinho|mistake|error|Zaragoza|Brazil/.test(text),'kind: none of his mistakes in the narration');
const last=film.chapters[3].narration;
assert.ok(/get your body behind the ball/.test(last)&&/even if it slips/.test(last)&&/will not go in/.test(last),'ends with the lesson (body behind the ball: even if it slips, it stays out)');
// the look contract
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:1,/.test(src)&&/hairStyle:'ponytail'/.test(src),'Seaman wears 1 and his ponytail');
assert.ok(/shirt:R,pattern:'stripes',patternInk:'paper'/.test(src)&&/shirt:\[Y,\.6\],trim:K,shorts:K/.test(src),'Sheffield United in red-and-white stripes, Arsenal in gold and navy');
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
// the save: from the near post he leaps sideways and BACKWARDS, and at contact his RIGHT glove is behind the ball, the ball short of the line
const sk=solve(F.seamanSave(F.SAVE_C),{height:1.93,bulk:1.08},{x:F.DIVE_AT[0],z:-F.DIVE_AT[1],yaw:Math.atan2(F.FACE[1],F.FACE[0])},1.1),my=v=>[v[0],v[1],-v[2]];
const rHa=my(sk.rHa),lHa=my(sk.lHa);
assert.ok(Math.hypot(rHa[0]-F.HAND_AT[0],rHa[1]-F.HAND_AT[1],rHa[2]-F.HAND_AT[2])<.02,'the right glove is at the contact spot');
assert.ok(Math.hypot(rHa[0]-F.CONTACT[0],rHa[1]-F.CONTACT[1],rHa[2]-F.CONTACT[2])<.25,'the ball is in the right glove');
assert.ok(rHa[0]>F.CONTACT[0],'the glove is behind the ball (goal side)');
assert.ok(F.CONTACT[0]+.11<105,'the ball has not crossed the line');
assert.ok(F.CONTACT[2]>34&&F.CONTACT[2]<F.GOAL.z1,'the header was going into the far half of the goal');
assert.ok(F.DIVE_AT[1]<33.2&&F.DIVE_AT[1]>F.GOAL.z0,`he starts at his near post (z ${F.DIVE_AT[1].toFixed(2)})`);
const pel=my(sk.pelvis);assert.ok(pel[0]>F.DIVE_AT[0]+.3,'he goes backwards toward his line');assert.ok(Math.min(sk.lAn[1],sk.rAn[1])>.2,'airborne at the touch');
assert.ok(rHa[1]>lHa[1]||rHa[2]>lHa[2],'the right hand is the one reaching');
const dHead=Math.hypot(F.CONTACT[0]-F.HEAD_PT[0],F.CONTACT[2]-F.HEAD_PT[2]);assert.ok(dHead>4&&dHead<7,`close-range header, about six yards (${dHead.toFixed(1)} m)`);
assert.ok(F.T_C-F.T_HEAD<.5&&F.T_C>F.T_HEAD,'the header reaches him in under half a second');
assert.ok(F.OUT[0]<F.CONTACT[0]-1,'scooped back out, away from the goal');
for(let T=-8;T<8;T+=.05)assert.ok(F.ballAt(T)[0]+.11<105.05||Math.abs(F.ballAt(T)[2]-34)>3.8,`the ball never goes in (T=${T.toFixed(2)})`);
// the lesson: the ball goes through the hands into the body and drops in front of him, never over the line
assert.ok(F.L_BODY[0]>F.L_HANDS[0],'the body is behind the hands');
for(let L=0;L<2.2;L+=.02)assert.ok(F.lessonBall(L)[0]<105,'the lesson ball stays out');
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
