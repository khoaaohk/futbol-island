// Iconic-play film: Mike Maignan's "flying fingertip save" — the diving stop from Kevin De Bruyne's low, rasping shot, France 1-0 Belgium,
// Euro 2024 round of 16, 1 July 2024, Düsseldorf (lib/plays/riso/maignan-signature.ts). Structural checks, no browser:
// story shape (4 chapters: live, slow replay, goal-line replay, lesson), narration = public/plays/narration/maignan-signature/script.json,
// 70-90 words ending with the lesson, cue words are substrings in order and inside their chapter before the passage, no cue starts with a
// contraction or hyphenated word, length 20-42 s; every figure goes through the one drawPlayer() adapter on the shared athlete library;
// seeded randomness only; the save really is the save (a low shot from just outside the box that was going in, the push off the foot
// nearest the ball, a long low flight, the glove on the ball short of the line, pushed away round the post and never in); the lesson
// boot is the near foot; when timing.json exists the film must import it. Also renders every chapter through a stub canvas at the three
// card sizes so a draw error fails here, not in the card.
// usage: node tests/play-film-maignan-signature.cjs
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

const ID='maignan-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
const {solve}=load(path.join(root,'lib/plays/riso/athlete.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, slow replay, goal-line replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Maignan/.test(text)&&/France/.test(text)&&/Belgium/.test(text)&&/De Bruyne/.test(text)&&/seven minutes/.test(text)&&/low, rasping shot/.test(text),'the keeper, both teams, the shooter and the confirmed shot are narrated');
assert.ok(!/\b(left foot|right foot|left hand|right hand|fingertips?|corner|post)\b/.test(text),'inferred details (foot, hand, side, where it went) stay out of the narration');
const last=film.chapters[3].narration;
assert.ok(/push off hard with the foot nearest the ball/.test(last)&&/dive further/.test(last),'ends with the lesson (push off the near foot to dive further)');
// the look contract
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:16,/.test(src),'Maignan wears 16');
assert.ok(/shirt:'paper',trim:B,shorts:B,socks:'paper'/.test(src),'France in white shirts, blue shorts, white socks');
assert.ok(/shirt:R,trim:K,shorts:K,socks:R/.test(src),'Belgium in red shirts, black shorts, red socks');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(!/^[^\s]*['’-]/.test(c.words),`ch${i+1} cue "${c.words}" starts with a plain word (Kokoro splits contractions/hyphens)`);
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=42,`length ${total}s`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MOMENT/.test(src),'sources + confirmed/inferred + why this moment listed at the top');
// the shot: from just outside the box, low, and it was going in
const my=v=>[v[0],v[1],-v[2]],B={height:1.91,bulk:1.06},place=(x,z,f)=>({x,z:-z,yaw:Math.atan2(f[1],f[0])});
assert.ok(F.SHOT_FROM[0]<105-16.5&&F.SHOT_FROM[0]>105-21,`shot from just outside the penalty area (${(105-F.SHOT_FROM[0]).toFixed(1)} m out)`);
const u=(105-F.SHOT_FROM[0])/(F.CONTACT[0]-F.SHOT_FROM[0]),zLine=F.SHOT_FROM[2]+(F.CONTACT[2]-F.SHOT_FROM[2])*u;
assert.ok(zLine>F.GOAL.z0+.11&&zLine<F.GOAL.z1-.11,`the shot was going in (crosses the line at z ${zLine.toFixed(2)})`);
assert.ok(F.CONTACT[1]<.5,'a low shot');assert.ok(F.T_C<.8,'rasping: it reaches him in under .8 s');
// the dive: push off the near (left) foot, fly low and long, the left glove on the ball, short of the line
const skP=solve(F.maignanDive(F.DIVE_PUSH),B,place(F.DIVE_AT[0],F.DIVE_AT[1],F.FACE),1.1),skC=solve(F.maignanDive(F.DIVE_C),B,place(F.DIVE_AT[0],F.DIVE_AT[1],F.FACE),1.1);
const pP=F.maignanDive(F.DIVE_PUSH),deg=r=>r*180/Math.PI;
assert.ok(deg(pP.lKnee)<25&&deg(pP.rKnee)>70,`at the push the near (left) leg drives straight (${deg(pP.lKnee).toFixed(0)}°) while the other knee drives up (${deg(pP.rKnee).toFixed(0)}°)`);
const pL=F.maignanDive(.16);assert.ok(deg(pL.lKnee)>deg(pL.rKnee)+15,'the near (left) foot loads first');
const lHa=my(skC.lHa),rHa=my(skC.rHa),pel=my(skC.pelvis);
assert.ok(my(skP.lToe)[2]<F.DIVE_AT[1],'the push foot is on the ball side');
assert.ok(Math.hypot(lHa[0]-F.HAND_AT[0],lHa[2]-F.HAND_AT[2])<.02,'the left glove is at the touch spot');
assert.ok(Math.hypot(lHa[0]-F.CONTACT[0],lHa[1]-F.CONTACT[1],lHa[2]-F.CONTACT[2])<.3,'the ball is on the glove');
assert.ok(lHa[2]>F.CONTACT[2],'the glove is on the goal-centre side of the ball (it pushes it wide)');
assert.ok(lHa[2]<=rHa[2]+.05,'the left hand is the leading hand');
assert.ok(F.CONTACT[0]+.11<105,'the ball has not crossed the line');
assert.ok(F.DIVE_AT[1]-lHa[2]>2.4,`a long flying reach (${(F.DIVE_AT[1]-lHa[2]).toFixed(2)} m)`);
assert.ok(Math.min(skC.lAn[1],skC.rAn[1])>.1&&pel[1]<.9,'airborne and low at the touch');
assert.ok(F.T_J0>0&&F.T_J0<F.T_C,'he moves after the shot is struck');
for(let T=-8;T<8;T+=.02){const b=F.ballAt(T);assert.ok(b[0]<105-.11||b[2]<F.GOAL.z0-.11||b[2]>F.GOAL.z1+.11||b[1]>F.GOAL.h+.11,`the ball never goes in (T=${T.toFixed(2)})`);}
assert.ok(F.OUT[0]>105&&F.OUT[2]<F.GOAL.z0,'pushed away round the post');
// the lesson: the glowing boot is the near foot, the ball never goes in
assert.ok(F.L_BOOT[2]<F.L_AT[1]&&F.L_HAND[2]<F.L_BOOT[2],'the lesson boot is the foot nearest the ball');
for(let L=-.6;L<1;L+=.01){const b=F.lessonBall(L);assert.ok(b[0]<105-.11||b[2]<F.GOAL.z0-.11,'the lesson ball stays out');}
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
