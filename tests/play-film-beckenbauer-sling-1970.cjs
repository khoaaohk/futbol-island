// Iconic-play film: Franz Beckenbauer brings it out, West Germany v England 1970 (lib/plays/riso/beckenbauer-sling-1970.ts). Structural
// checks, no browser: story shape (4 chapters: live, slow replay, second replay, lesson), narration = public/plays/narration/
// beckenbauer-sling-1970/script.json, 70–90 words ending with the lesson, cue words in order inside their chapter, length 20–45 s; every
// figure through the one drawPlayer() adapter on the shared athlete library; the sourced facts of the goal (he takes the loose ball and
// carries it forward, the RIGHT foot, from outside the area, low, under Bonetti, into the far corner); the voice hook; and every chapter
// drawn through a stub canvas at the three card sizes. The loader handles .ts and .json imports.
// usage: node tests/play-film-beckenbauer-sling-1970.cjs
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

const ID='beckenbauer-sling-1970',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, slow replay, second replay, lesson');
assert.ok(/14 June 1970/.test(film.ageNote)&&/León/.test(film.ageNote),'the real date and place are in the film');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Franz Beckenbauer/.test(text)&&/England/.test(text)&&/West Germany/.test(text)&&/right foot/.test(text),'Beckenbauer, both teams and the right foot are narrated');
assert.ok(!/libero|sling/i.test(text),'no claim he was the libero in 1970, no dwelling on injury');
const last=film.chapters[3].narration;
assert.ok(/Win the ball/.test(last)&&/lift your head/.test(last)&&/carry it into midfield/.test(last),'ends with the lesson (win the ball, lift your head, carry it into midfield)');
// the look contract: full-sheet framing, the voice hook, the kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/FRANZ:AthleteStyle=germany\(\[K,\.8\],\{number:4,/.test(src)&&/MULLERY:AthleteStyle=england\([^)]*number:4,/.test(src),'Beckenbauer and Mullery both wear 4');
assert.ok(/shirt:'paper',trim:K,shorts:K,socks:'paper'/.test(src),'West Germany: white shirts, black trim, black shorts, white socks');
assert.ok(/shirt:R,trim:R,shorts:'paper',socks:R/.test(src),'England: red shirts, white shorts, red socks');
assert.equal(JSON.stringify(film.chapters.map(c=>c.cues.length)),'[8,5,4,6]','cue counts the scenes key their actions to');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=45,`length ${total}s`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MOMENT/.test(src),'sources, confirmed/inferred and why this moment listed at the top');
// the goal as the accounts describe it: he takes the loose ball and carries it forward a long way; the RIGHT boot on the ball (not the
// left) from OUTSIDE the England area; a low shot that passes under Bonetti's dive and ends inside the far post, in the net
const g=F.franzAt(F.T_GET),s0=F.SHOT_AT;
assert.ok(s0[0]-g[0]>25,`a long carry forward (${(s0[0]-g[0]).toFixed(1)} m)`);
assert.ok(F.BALL_S[0]<105-16.5,`the shot from outside the area (${F.BALL_S.map(v=>v.toFixed(2))})`);
const rt=F.rightFoot(),lt=F.leftFoot(),d=(p)=>Math.hypot(p[0]-F.BALL_S[0],p[2]-F.BALL_S[1]);
assert.ok(d(rt)<.25&&d(lt)>.35,`the right boot strikes the ball (right ${d(rt).toFixed(2)} m, left ${d(lt).toFixed(2)} m)`);
const b=F.ballAt(F.T_SHOT);assert.ok(Math.hypot(b[0]-F.BALL_S[0],b[2]-F.BALL_S[1])<.05,'the ball is at the boot at the contact frame');
for(let T=F.T_SHOT+.05;T<F.T_LINE;T+=.1)assert.ok(F.ballAt(T)[1]<.4,`a low shot (T=${T.toFixed(2)})`);
const k=F.keeperAt(F.T_UNDER),bu=F.ballAt(F.T_UNDER);
assert.ok(Math.hypot(k.pelvis[0]-bu[0],k.pelvis[2]-bu[2])<.7&&k.pelvis[1]>bu[1]+.2,'the ball goes under the diving keeper');
const ib=F.ballAt(F.T_LINE+1),mid=(30.34+37.66)/2;
assert.ok(ib[0]>105&&ib[2]>mid&&ib[2]<37.66,'in the net, inside the far post');
assert.ok(F.BALL_S[1]<mid,'shot from the near side, across to the far corner');
// installed voice (optional until generated): the film must import it, files exist and chapter seconds cover each clip
const timing=path.join(dir,'timing.json');
if(fs.existsSync(timing)){const T=JSON.parse(fs.readFileSync(timing,'utf8'));
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio once timing.json exists — import timing.json in ${ID}.ts (see the VOICE note)`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const dd=T.chapters?.[i]?.seconds;if(typeof dd==='number')assert.ok(ch.seconds>=dd-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${dd}`);});}
// render every chapter through the stub canvas at the three card sizes: no draw errors, reduced motion included
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});}
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${text.length} chars, ${total}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
