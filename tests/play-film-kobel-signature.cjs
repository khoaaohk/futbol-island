// Iconic-play film: Gregor Kobel's signature, the keeper who starts attacks (lib/plays/riso/kobel-signature.ts) — his sourced 49th-minute
// fingertip save from Toni Kroos's curling free kick, Borussia Dortmund 0–2 Real Madrid, Champions League final, Wembley, 1 June 2024,
// then a lesson plate (catch, look up fast, throw to the free teammate). Structural checks, no browser: story shape (3 chapters), narration
// = public/plays/narration/kobel-signature/script.json, 70–90 words ending with the lesson, cue words in order and starting with plain
// words; every figure through the one drawPlayer() adapter; the play's contact points; the voice hook; every chapter drawn through a stub
// canvas at the three card sizes. The loader handles .ts and .json.
// usage: node tests/play-film-kobel-signature.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{module:m,exports:m.exports,Math,WeakMap,Map,DOMMatrix:globalThis.DOMMatrix??StubMatrix,DOMPoint:globalThis.DOMPoint,Path2D:StubPath,document:{createElement:()=>stubCanvas()},require:id=>{const base=path.resolve(path.dirname(file),id);return load([base+'.ts',base].find(fs.existsSync));}});
 return m.exports;}
// minimal canvas stubs: enough for the engine to run story.draw end to end (no pixels)
function StubPath(){this.ops=0;}Object.assign(StubPath.prototype,{moveTo(){},lineTo(){},arc(){},ellipse(){},rect(){},closePath(){},addPath(){},bezierCurveTo(){},quadraticCurveTo(){}});
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

const ID='kobel-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,3,'live broadcast, slow replay, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/Gregor Kobel/.test(text)&&/Toni Kroos/.test(text)&&/Wembley, 2024/.test(text)&&/Fingertips/.test(text)&&/Wide/.test(text),'Kobel, Kroos, Wembley 2024 and the sourced tip wide are narrated');
assert.ok(/This is how Kobel starts attacks/.test(text),'the lesson chapter is openly an explanation, not a claimed match moment');
const last=film.chapters[2].narration;
assert.ok(/After a save, look up fast, and pass to a free teammate\.$/.test(last),'ends with the lesson');
assert.ok(/1 June 2024/.test(film.ageNote)&&/0–2/.test(film.ageNote)&&/49th minute/.test(film.ageNote),'the match, date and minute are stated');
for(const ch of film.chapters)for(const c of ch.cues){const w=c.words.split(/\s+/)[0];assert.ok(!/[’'\-–]/.test(w),`cue "${c.words}" starts with a plain word`);}
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming);/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE timing hook passed into withTiming');
assert.ok(/number:1,/.test(src)&&/number:8,/.test(src),'Kobel 1, Kroos 8');
assert.ok(/shirt:\[Y,\.95\],shorts:\[K,\.92\],socks:\[Y,\.95\]/.test(src)&&/shirt:'paper',shorts:'paper',socks:'paper'/.test(src),'Dortmund yellow/black/yellow, Madrid all white');
assert.equal(JSON.stringify(film.chapters.map(c=>c.cues.length)),'[10,6,8]','cue counts the scenes key their actions to');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=25&&total<=55,`length ${total}s`);
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MATCH/.test(src),'sources, confirmed/inferred and why this match, at the top');
// the save
const d3=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);
const kc=F.kroos(0),foot=[(kc.rToe[0]+kc.rHeel[0])/2,(kc.rToe[1]+kc.rHeel[1])/2,(kc.rToe[2]+kc.rHeel[2])/2],lfoot=[(kc.lToe[0]+kc.lHeel[0])/2,0,(kc.lToe[2]+kc.lHeel[2])/2];
assert.ok(Math.hypot(foot[0]-F.P0[0],foot[2]-F.P0[2])<.4&&Math.hypot(foot[0]-F.P0[0],foot[2]-F.P0[2])<Math.hypot(lfoot[0]-F.P0[0],lfoot[2]-F.P0[2]),`Kroos's RIGHT boot strikes the free kick (${Math.hypot(foot[0]-F.P0[0],foot[2]-F.P0[2]).toFixed(2)} m)`);
assert.ok(F.P0[0]<-16.5&&F.P0[0]>-23,'the free kick is just outside the box ("the edge of the box")');
// over the wall: at the wall's line the ball is above every jumping head
let tw=0;for(let T=0;T<F.T_TIP;T+=.005)if(F.ballAt(T)[0]>=F.WALL_X){tw=T;break;}
const bw=F.ballAt(tw);for(let i=0;i<4;i++){const h=F.wallHead(i,tw);assert.ok(bw[1]-h[1]>.25||Math.abs(bw[2]-h[2])>.5,`over the wall (player ${i+1}: ball ${bw[1].toFixed(2)} m vs head ${h[1].toFixed(2)} m)`);}
assert.ok(bw[1]>2.2,`the ball clears the wall high (${bw[1].toFixed(2)} m)`);
// it curls toward Kroos's LEFT (−z) and dips toward the top corner
const mid=F.ballAt(F.T_TIP/2),straight=(F.P0[2]+F.TIP[2])/2;assert.ok(mid[2]>straight+.3,`it bends right → left (bow ${(mid[2]-straight).toFixed(2)} m)`);
assert.ok(F.TIP[2]<-2.4&&F.TIP[1]>1.7&&F.TIP[1]<2.33&&F.TIP[0]<0&&F.TIP[0]>-1.2,`the tip is inside the top corner on Kroos's left (${F.TIP.map(v=>v.toFixed(2))})`);
// Kobel's dive: to his RIGHT (−z), airborne, his leading hand meets the ball
const kb=F.kobel(F.T_TIP),hand=F.diveHand==='r'?kb.rHa:kb.lHa;
assert.ok(F.diveHand==='l'||F.diveHand==='r','his top hand reaches the ball');
assert.ok(d3(hand,F.TIP)<.3,`fingertips on the ball (${d3(hand,F.TIP).toFixed(2)} m)`);
assert.ok(kb.pelvis[1]>.9,`airborne at the touch (pelvis ${kb.pelvis[1].toFixed(2)} m)`);
assert.ok(kb.pelvis[2]<F.KOB_AT[1]&&F.KOB_AT[1]>-2,'he flies from his set position toward the far post (−z)');
assert.ok(F.T_DIVE>.2,'he waits on his toes before he goes');
// wide: past the post, behind the line
let cross=null;for(let T=F.T_TIP;T<F.T_TIP+1.5;T+=.005){const b=F.ballAt(T);if(b[0]>=0){cross=b;break;}}
assert.ok(cross&&cross[2]<-3.66-.11,`wide of the post as it crosses the line (z ${cross&&cross[2].toFixed(2)})`);
const end=F.ballAt(F.T_TIP+2.5);assert.ok(end[0]>0&&end[1]<.5,'it drops behind the goal line (a corner)');
// the lesson: catch, look, the free teammate, the throw
const L=F.lesson;
assert.equal(L.team(L.FREE),'bvb');for(const k of L.MARKED)assert.equal(L.team(k),'bvb');
const kl=L.kobel(0),gl=[(kl.lHa[0]+kl.rHa[0])/2,(kl.lHa[1]+kl.rHa[1])/2,(kl.lHa[2]+kl.rHa[2])/2];
assert.ok(d3(L.ballAt2(0),gl)<.35&&L.ballAt2(0)[1]>2.3,`he catches it high in both gloves (${d3(L.ballAt2(0),gl).toFixed(2)} m, ${L.ballAt2(0)[1].toFixed(2)} m up)`);
assert.ok(L.neckY(L.L_LOOK+.35)>.5&&L.neckY(L.L_LOOK+1)<-.5,'he looks up both ways before he throws');
const nearestReal=(k,l)=>{const p=L.pos(k,l);let m=1e9;for(let j=0;j<10;j++)if(L.team(j)==='real'){const q=L.pos(j,l);m=Math.min(m,Math.hypot(p[0]-q[0],p[1]-q[1]));}return m;};
assert.ok(nearestReal(L.FREE,L.T_REL)>8,`the right-back is free (${nearestReal(L.FREE,L.T_REL).toFixed(1)} m)`);
for(const k of L.MARKED)assert.ok(nearestReal(k,L.T_REL-.8)<2.6,`teammate ${k} is marked (${nearestReal(k,L.T_REL-.8).toFixed(1)} m)`);
const kr=L.kobel(L.T_REL);assert.ok(d3(kr.rHa,L.REL_PT)<.05&&kr.rHa[1]>1.9,'the overarm throw leaves his right hand high');
const rp=L.pos(L.FREE,L.T_REC);assert.ok(Math.hypot(L.ballAt2(L.T_REC)[0]-rp[0],L.ballAt2(L.T_REC)[2]-rp[1])<1,'the throw lands at the free teammate');
assert.ok(L.pos(L.FREE,L.T_REC+2.5)[0]<rp[0]-8,'and Dortmund are away up the pitch');
// installed voice (optional until generated)
const timing=path.join(dir,'timing.json');
if(fs.existsSync(timing)){const T=JSON.parse(fs.readFileSync(timing,'utf8'));
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio once timing.json exists — import timing.json in ${ID}.ts (see the VOICE note)`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const dd=T.chapters?.[i]?.seconds;if(typeof dd==='number')assert.ok(ch.seconds>=dd-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${dd}`);});}
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});sheet.press(i);frames++;}});}
console.log(`PASS ${ID}: 3 chapters, ${words} words / ${text.length} chars, ${total}s, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
