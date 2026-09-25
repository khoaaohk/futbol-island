// Iconic-play film: Lauren James's signature, the curler from the edge — her goal v Denmark, Women's World Cup, Sydney, 28 July 2023
// (lib/plays/riso/lauren-james-signature.ts). Structural checks, no browser: story shape (4 chapters: live, low replay of the carry
// inside, replay from behind the goal, lesson), narration = public/plays/narration/lauren-james-signature/script.json, 70–90 words ending
// with the lesson, cue words in order inside their chapter, length 20–42 s; every figure goes through the one drawPlayer() adapter on the
// shared athlete library; seeded randomness only; the goal as the sources describe it (Daly's pass from the left, a right-footed shot from
// the edge of the box, left of centre, into the FAR corner past Christensen); when timing.json exists the film must import it. Also
// renders every chapter through a stub canvas at the three card sizes. The TS loader also loads .json imports (timing.json).
// usage: node tests/play-film-lauren-james-signature.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{module:m,exports:m.exports,Math,WeakMap,Map,DOMMatrix:globalThis.DOMMatrix??StubMatrix,DOMPoint:globalThis.DOMPoint,Path2D:StubPath,document:{createElement:()=>stubCanvas()},require:id=>{const base=path.resolve(path.dirname(file),id);return load([base+'.ts',base].find(fs.existsSync));}});
 return m.exports;}
function StubPath(){this.ops=0;}Object.assign(StubPath.prototype,{moveTo(){},ellipse(){},lineTo(){},arc(){},rect(){},closePath(){},addPath(){},bezierCurveTo(){},quadraticCurveTo(){}});
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

const ID='lauren-james-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, low replay, replay behind the goal, lesson');
assert.ok(/28 July 2023/.test(film.ageNote),'the real date is in the film');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Lauren James/.test(text)&&/Denmark/.test(text)&&/Rachel Daly/.test(text)&&/Lene Christensen/.test(text)&&/2023/.test(text)&&/Sydney/.test(text),'players, opponent, place and year are narrated');
assert.ok(/right foot/.test(text)&&/far corner/.test(text),'the right foot and the far corner are narrated');
assert.ok(!/red card|sent off|\bstamp|\bbann?ed\b/i.test(text+JSON.stringify(src.match(/\/\*\*[\s\S]*?\*\//)[0])),'kind: nothing about the later red card');
const last=film.chapters[3].narration;
assert.ok(/cut inside/.test(last)&&/stronger foot/.test(last)&&/curl the ball into the far corner!$/.test(last),'ends with the lesson (cut inside onto your stronger foot, curl it into the far corner)');
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'').replace(/never\s*\n\s*\*\s*sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:7,/.test(src)&&/number:9,/.test(src)&&/number:10,/.test(src)&&/number:1,/.test(src),'James 7, Daly 9, Toone 10, Christensen 1');
assert.ok(/shirt:'paper',trim:B,shorts:B,socks:'paper'/.test(src),'England in white shirts, blue shorts, white socks (the kit box)');
assert.ok(/shirt:R,trim:'paper',shorts:R,socks:R/.test(src),'Denmark all red');
assert.ok(/hairStyle:'ponytail'/.test(src)&&/build:W\(/.test(src),'women footballers: builds and ponytails');
assert.ok(/foot:'r',power:1/.test(src),'the strike is right-footed');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=42,`length ${total}s`);
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MOMENT/.test(src),'sources + confirmed/inferred + why this moment listed at the top');
// the goal as the sources describe it
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
assert.ok(F.BALL0[2]<-24,'Daly passes from wide on the left (−Z = the attackers\' left)');
assert.ok(d3(F.BALL0,[F.dalyAt(0)[0],.11,F.dalyAt(0)[1]])<1.2,'the pass leaves Daly\'s boot');
assert.ok(d3(F.RECV_PT,F.jamesToes(F.T_RECV).r)<.2,'James takes it on her right boot');
assert.ok(d3(F.SHOT_PT,F.jamesToes(F.T_SHOT).r)<.2,'the shot is off her RIGHT boot');
const dist=Math.hypot(F.GOAL.x-F.SHOT_PT[0],F.SHOT_PT[2]);assert.ok(dist>17&&dist<22,`from the edge of the box (${dist.toFixed(1)} m from goal centre)`);
assert.ok(F.GOAL.x-F.SHOT_PT[0]>16.5,'struck from outside the penalty area');
assert.ok(F.SHOT_PT[2]<-2.5&&F.SHOT_PT[2]>-7,'left of centre (FIFA shot map)');
assert.ok(F.TOP[2]>2.6&&F.TOP[2]<F.GOAL.z1&&F.TOP[1]>.6&&F.TOP[1]<1.5,'into the FAR corner (right-hand post), about 1 m up');
// the carry comes inside: she moves toward the centre between receiving and shooting
assert.ok(F.jamesAt(F.T_SHOT)[1]-F.jamesAt(F.T_RECV)[1]>7,'she carries it inside');
// the bend: at mid-flight the ball is outside the straight line toward the far-post side and ends inside the post
const mid=F.ballAt((F.T_SHOT+F.T_GOAL)/2);let inGoal=true;for(let T=F.T_SHOT;T<=F.T_GOAL;T+=.01){const b=F.ballAt(T);if(b[0]>104.9&&(Math.abs(b[2])>3.55||b[1]>2.35))inGoal=false;}
assert.ok(inGoal,'the ball crosses the line inside the frame');
const straightZ=F.SHOT_PT[2]+(F.TOP[2]-F.SHOT_PT[2])*((mid[0]-F.SHOT_PT[0])/(F.TOP[0]-F.SHOT_PT[0]));assert.ok(mid[2]>straightZ+.4,'the curl bulges out and bends back in');
// past Christensen: she dives but never touches it
let near=9;for(let T=F.T_SHOT;T<F.T_GOAL+.01;T+=.01){const b=F.ballAt(T);for(const h of F.keeperHands(T))near=Math.min(near,d3(b,h));}
assert.ok(near>.2&&near<1.6,`the shot flies past Christensen's glove (closest ${near.toFixed(2)} m)`);
const timing=path.join(dir,'timing.json');
if(fs.existsSync(timing)){const T=JSON.parse(fs.readFileSync(timing,'utf8'));
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio once timing.json exists — import timing.json in ${ID}.ts (see the LEAD note)`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const d=T.chapters?.[i]?.seconds;if(typeof d==='number')assert.ok(ch.seconds>=d-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${d}`);});}
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});}
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${text.length} chars, ${total}s, ${frames} frames drawn, shot ${dist.toFixed(1)} m, closest glove ${near.toFixed(2)} m${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
