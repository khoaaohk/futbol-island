// Iconic-play film: James Rodríguez's chest-and-volley v Uruguay, 2014 World Cup (lib/plays/riso/james-volley-2014.ts). Structural checks, no browser:
// story shape, narration = public/plays/narration/<id>/script.json, cue words in order and timed to the Kokoro voice, length, every chapter
// drawn through a stub canvas at card sizes; then the goal as the accounts describe it (see the film header).
// usage: node tests/play-film-james-volley-2014.cjs
const ID='james-volley-2014';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{module:m,exports:m.exports,Math,WeakMap,Map,DOMMatrix:globalThis.DOMMatrix??StubMatrix,DOMPoint:globalThis.DOMPoint,Path2D:StubPath,document:{createElement:()=>stubCanvas()},require:id=>{const base=path.resolve(path.dirname(file),id);return load([base+'.ts',base].find(fs.existsSync));}});
 return m.exports;}
// minimal canvas stubs: enough for the engine to run story.draw end to end (no pixels)
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
const mod=load(path.join(root,'lib/plays/riso/'+ID+'.ts')),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.audio.mode,'chapters');assert.equal(film.chapters.length,4,'live broadcast, replay, second replay, lesson');
const dir=path.join(root,'public/plays/narration/'+ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const chars=film.chapters.reduce((a,c)=>a+c.narration.length,0),words=film.chapters.reduce((a,c)=>a+c.narration.split(/\s+/).length,0);
assert.ok(chars<700,`narration ${chars} chars`);assert.ok(words>=70&&words<=92,`narration ${words} words`);
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=25&&total<=55,`length ${total}s (4 chapters)`);
// the recorded voice: files exist, chapter seconds cover each clip, and every cue's first word is a recorded word (no silent fallback)
const timing=path.join(dir,'timing.json');assert.ok(fs.existsSync(timing),'timing.json (Kokoro voice) installed');
{const T=JSON.parse(fs.readFileSync(timing,'utf8')),norm=w=>w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const d=T.chapters[i].seconds;assert.ok(ch.seconds>=d-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${d}`);
  const toks=T.chapters[i].words.map(w=>norm(w.w));for(const c of ch.cues){const f=norm(c.words.split(/\s+/)[0]);assert.ok(toks.some(t=>t===f||f.startsWith(t)),`ch${i+1} cue "${c.words}" first word is recorded`);
   assert.ok(T.chapters[i].words.some(w=>Math.abs(w.at-c.at)<1e-6),`ch${i+1} cue "${c.words}" is timed to a recorded word onset (${c.at})`);}});}
// render every chapter (start, middle, passage) through the stub canvas: no draw errors at card sizes
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.2,.35,.55,.7,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});}
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
// the goal: Aguilar's header forward to him, back to goal about 25 yards out; a look over the shoulder first; chest; he turns to face goal;
// a LEFT-foot volley before the ball lands; it dips, grazes Muslera's right-hand fingertips as he leaps to HIS right (−z), and goes in off the
// underside of the bar.
assert.equal(F.shotFoot,'l','left foot (sourced)');
assert.ok(d3(F.aguilarAt(-1.05).face,F.HEAD_A)<.25,'the ball starts on Aguilar\'s head');
const j0=F.jamesAt(-.3);assert.ok(Math.cos(j0.yaw)<-.9,'back to goal before the chest (facing −x)');
const dist=Math.hypot(F.JP[0],F.JP[1]);assert.ok(dist>18&&dist<24.5,`about 25 yards out (${dist.toFixed(1)} m)`);assert.ok(F.JP[0]<-16.5,'just outside the area');
const look=F.jamesAt(F.T_LOOK),fwd=[look.face[0]-look.head[0],look.face[2]-look.head[2]];assert.ok(fwd[0]>-.02,'the quick look: his face turns back toward goal');
const jc=F.jamesAt(0);assert.ok(d3(jc.chest,F.ballAt(0))<.35,`ball on his chest (${d3(jc.chest,F.ballAt(0)).toFixed(2)} m)`);
let pop=0;for(let T=0;T<F.TV;T+=.02){const b=F.ballAt(T);pop=Math.max(pop,b[1]);assert.ok(b[1]>.3,`the ball never touches the ground before the volley (τ ${T.toFixed(2)})`);}assert.ok(pop>F.CHEST_PT[1],'it pops up off the chest');
const jv=F.jamesAt(F.TV);assert.ok(Math.cos(jv.yaw)>.7,'turned to face goal for the volley');
assert.ok(d3(jv.lToe,F.PV)<.35,`his LEFT boot meets it (${d3(jv.lToe,F.PV).toFixed(2)} m)`);assert.ok(d3(jv.lToe,F.PV)<d3(jv.rToe,F.PV),'left boot nearer than the right');
assert.ok(F.PV[1]>.25,`a volley: the ball is in the air (${F.PV[1].toFixed(2)} m)`);
let apex=0,tA=0;for(let T=F.TV;T<F.TG;T+=.01){const b=F.ballAt(T);if(b[1]>apex){apex=b[1];tA=T;}}assert.ok(apex>F.GOAL_PT[1]+.1&&tA<F.TG-.1,`it dips: rises to ${apex.toFixed(2)} m then drops to the bar`);
const g=F.ballAt(F.TG);assert.ok(Math.abs(g[0])<.05&&g[1]>2.2&&g[1]<2.34&&g[2]<0&&g[2]>-3.55,`underside of the bar, on the attackers' left (y ${g[1].toFixed(2)}, z ${g[2].toFixed(2)})`);
assert.ok(F.ballAt(F.TG+.5)[0]>.3,'then into the net');
let md=9;for(let T=F.TV;T<=F.TG;T+=.01){const a=F.musleraAt(T),b=F.ballAt(T);md=Math.min(md,d3(a.rHa,b));assert.ok(d3(a.lHa,b)>.1,'left glove never on it');}
assert.ok(md>.04&&md<.3,`it grazes his right-hand fingertips (closest ${md.toFixed(2)} m) but he cannot stop it`);
assert.ok(F.musleraAt(F.TG).pelvis[2]<-.5,'Muslera leaps to HIS right (−z)');
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${chars} chars, ${total}s, ${frames} frames drawn, voice installed`);
