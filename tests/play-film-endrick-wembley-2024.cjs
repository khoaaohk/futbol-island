// Iconic-play film: Endrick's winner v England at Wembley, 2024 friendly (lib/plays/riso/endrick-wembley-2024.ts). Structural checks, no browser:
// story shape, narration = public/plays/narration/endrick-wembley-2024/script.json, cue words are substrings in order, cues inside their
// chapter, length 25–55 s (4 chapters), < 700 narration characters; when timing.json (the voice generator's output) exists, every chapter's audio file
// exists and its seconds cover the clip. Also renders every chapter through a stub canvas so a draw error fails here, not in the card.
// usage: node tests/play-film-endrick-wembley-2024.cjs
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

const mod=load(path.join(root,'lib/plays/riso/endrick-wembley-2024.ts')),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,'endrick-wembley-2024');assert.equal(film.audio.mode,'chapters');assert.equal(film.chapters.length,4,'live broadcast, two replays, lesson');
const dir=path.join(root,'public/plays/narration/endrick-wembley-2024'),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const chars=film.chapters.reduce((a,c)=>a+c.narration.length,0),words=film.chapters.reduce((a,c)=>a+c.narration.split(/\s+/).length,0);
assert.ok(chars<700,`narration ${chars} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words`);
const timing=path.join(dir,'timing.json'),T=JSON.parse(fs.readFileSync(timing,'utf8'));
const norm=w=>w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;
  const first=norm(c.words.split(/\s+/)[0]);assert.ok(T.chapters[i].words.some(w=>norm(w.w)===first),`ch${i+1} cue "${c.words}" first word is a recorded word (Kokoro timing)`);
  assert.ok(T.chapters[i].words.some(w=>Math.abs(w.at-c.at)<1e-6),`ch${i+1} cue "${c.words}" sits on a recorded word onset`);}}
const total=storyDuration(film);assert.ok(total>=25&&total<=55,`length ${total}s (4 chapters)`);
film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);assert.ok(ch.seconds>=T.chapters[i].seconds-.05,`ch${i+1} seconds cover the clip`);});
const reg=fs.readFileSync(path.join(root,'lib/plays/riso/registry.ts'),'utf8');
assert.ok(/'Endrick':\(\)=>import\('\.\/endrick-wembley-2024'\)/.test(reg),'registered for Endrick');
assert.ok(!/PENDING=new Set<string>\(\[[^\]]*Endrick/.test(reg),'not pending');
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.2,.35,.55,.7,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});}
// the goal as the accounts describe it: a long ball over the top sends Vinícius clear; Pickford saves his shot; the ball falls to Endrick,
// who taps it in from close range.
const d3=F.d3;
let apex=0;for(let t=F.T_LONG;t<F.T_CTRL;t+=.02)apex=Math.max(apex,F.ballAt(t)[1]);assert.ok(apex>4,`a long ball over the top (apex ${apex.toFixed(1)} m)`);
assert.ok(d3(F.ballAt(F.T_LONG),F.ballAt(F.T_CTRL))>25,'a LONG ball');
const v=F.vinAt(F.T_CTRL);assert.ok(d3([v[0],0,v[1]],[F.ballAt(F.T_CTRL)[0],0,F.ballAt(F.T_CTRL)[2]])<1.2,'Vinícius collects it');
const k=F.keeperAt(F.T_SAVE),sp=F.ballAt(F.T_SAVE);assert.ok(Math.min(d3(k.lHa,sp),d3(k.rHa,sp))<.4,`Pickford's hands meet the shot (${Math.min(d3(k.lHa,sp),d3(k.rHa,sp)).toFixed(2)} m)`);
assert.ok(F.TAP[0]>-9&&Math.abs(F.TAP[2])<5,`the tap-in is from close range (x ${F.TAP[0]}, z ${F.TAP[2]})`);
assert.ok(d3(F.ballAt(-.001),F.TAP)<.05,'the rebound falls to the tap-in spot');
const ec=F.endrickContact();assert.ok(d3(ec.lToe,F.TAP)<.35,`his LEFT boot is at the ball (${d3(ec.lToe,F.TAP).toFixed(2)} m)`);
const g=F.ballAt(F.TS);assert.ok(Math.abs(g[0])<.05&&Math.abs(g[2])<3.55&&g[1]<2.33,'the tap-in crosses the line inside the goal');
for(let t=0;t<=F.TS;t+=.02){const a=F.keeperAt(t),b=F.ballAt(t);assert.ok(d3(a.lHa,b)>.3&&d3(a.rHa,b)>.3,`Pickford cannot reach the tap-in (τ ${t.toFixed(2)})`);}
assert.ok(!/right foot|left foot|header/i.test(film.chapters.map(c=>c.narration).join(' ')),'no inferred foot claimed');
console.log(`PASS endrick-wembley-2024: 4 chapters, ${words} words / ${chars} chars, ${total.toFixed(1)}s, ${frames} frames drawn, voice installed`);
