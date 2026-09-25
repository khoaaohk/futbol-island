// Signature film: João Pedro, "the curler from the edge" — his first Chelsea goal, a curler v Fluminense, Club World Cup semi-final 2025
// (lib/plays/riso/joao-pedro-signature.ts). Structural checks, no browser: story shape (4 chapters: live, the touch in slow motion, the curl
// from behind the goal, lesson), narration = script.json, 70–90 words ending with the lesson, cue words are substrings in order and inside
// their chapter before the passage; every figure goes through the one drawPlayer() adapter on the shared athlete library; seeded randomness
// only; the curl's geometry (right foot, left of the D, top right corner, right-to-left bend, beats the keeper); when timing.json exists the
// film must import it. Also renders every chapter through a stub canvas at the three card sizes so a draw error fails here, not in the card.
// usage: node tests/play-film-joao-pedro-signature.cjs
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

const ID='joao-pedro-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');
assert.equal(film.chapters.length,4,'live broadcast, slow replay of the touch, the curl from behind the goal, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>c.narration)),JSON.stringify(script.chapters.map(c=>c.text)),'film narration = script.json');
assert.equal(JSON.stringify(film.chapters.map(c=>c.label)),JSON.stringify(script.chapters.map(c=>c.label)),'labels = script.json');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(text.length<700,`narration ${text.length} chars`);assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
assert.ok(/João Pedro/.test(text)&&/Neto/.test(text)&&/Thiago Silva/.test(text)&&/Fluminense/.test(text)&&/Fábio/.test(text),'the scorer, the crosser, the man who half-cleared, the opponent and the keeper are narrated');
assert.ok(/top corner/.test(text)&&/One touch/.test(text)&&/No celebration/.test(text)&&/sorry/.test(text),'the confirmed beats: one touch, top corner, no celebration, the apology');
assert.ok(!/right foot|left foot|shorts|socks|18|minute|header|headed|free.kick|penalt/i.test(text),'unverified details (the shooting foot, the kind of clearance) and the minute are not narrated');
const last=film.chapters[3].narration;
assert.ok(/open your body/.test(last)&&/curl the ball so it bends away from the keeper/.test(last),'ends with the lesson (the card\'s lesson line)');
for(const ch of film.chapters)for(const c of ch.cues){const w=c.words.split(/\s+/)[0];assert.ok(!/['’\-–]/.test(w)&&!/^Jo[aã]o$/.test(w),`cue "${c.words}" starts with a plain word (Kokoro splits contractions / hyphens; never "João")`);}
// the look contract: full-sheet framing, the voice hook, the real kits
assert.ok(!/\.safe\b/.test(src.replace(/never sheet\.safe/g,'')),'full-sheet framing: never sheet.safe');
assert.ok(/const VOICE:NarrationTiming\|null=(null|timingJson as NarrationTiming);/.test(src)&&/withTiming\(/.test(src)&&/,VOICE\);/.test(src),'VOICE left null, passed into withTiming');
assert.ok(/strike\(STRIKE_CONTACT,\{foot:'r',power:\.7\}\)/.test(src)&&/strike\(Math\.min\(1,u\),\{foot:'r',power:\.7\}\)/.test(src),'he strikes with his RIGHT foot (card; inferred)');
assert.ok(/number:20,/.test(src)&&/number:3,/.test(src)&&/number:1,/.test(src)&&/number:7,/.test(src),'João Pedro 20, Thiago Silva 3, Fábio 1, Neto 7');
assert.ok(/const CHE=.*shirt:\[Y,\.16\],shorts:\[K,\.8\],socks:\[Y,\.16\]/.test(src),'Chelsea away: cream shirt and socks, dark green-grey shorts');
assert.ok(/const FLU=.*pattern:'stripes',patternInk:\[R,\.95\],shorts:'paper',socks:'paper'/.test(src)&&/team:a\.role==='flu'\?'flu'/.test(src),'Fluminense home: striped tricolour shirt, white shorts, white socks');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}}
const total=storyDuration(film);assert.ok(total>=20&&total<=44,`length ${total}s`);
// the choreography: the right boot meets the ball at the strike, just left of the D; the curl ends in the TOP RIGHT corner (the +z post,
// his right), bends RIGHT-TO-LEFT (it leaves on a line outside the far post and swerves back in), and beats Fábio; Silva's head meets the cross
const toe=F.jpRightToeAt(F.SHOT),sf=F.SHOT_FROM;assert.ok(Math.hypot(toe[0]-sf[0],toe[2]-sf[2])<.3,`right boot at the ball on the shot (${Math.hypot(toe[0]-sf[0],toe[2]-sf[2]).toFixed(2)} m)`);
assert.ok(sf[0]>86&&sf[0]<90&&sf[2]<-7.3&&sf[2]>-11,`shot from the edge of the box, left of the D (${sf[0].toFixed(1)}, ${sf[2].toFixed(1)})`);
const d=Math.hypot(F.NET[0]-sf[0],F.NET[2]-sf[2]);assert.ok(d>17&&d<23,`about 20 m out (${d.toFixed(1)} m)`);
const end=F.ballAt(F.IN_NET-.01);assert.ok(end[0]>104.8&&end[2]>1.5&&end[2]<3.66&&end[1]>1.6&&end[1]<2.44,`TOP RIGHT corner (${end.map(v=>v.toFixed(2))})`);
const early=F.curlAt(.15),dirE=Math.atan2(early[2]-sf[2],early[0]-sf[0]),dirT=Math.atan2(F.NET[2]-sf[2],F.NET[0]-sf[0]);assert.ok(dirE>dirT+.1,'the ball starts outside the line to the far corner (toward +z, his right) and bends back right-to-left');
let peak=0,peakU=0;for(let u=0;u<=1;u+=.02){const y=F.curlAt(u)[1];if(y>peak){peak=y;peakU=u;}}assert.ok(peakU>.45&&peakU<.95&&peak>F.NET[1]+.1&&peak<3.4,`it rises then dips into the corner (peak ${peak.toFixed(2)} m at u ${peakU.toFixed(2)})`);
const b0=F.ballAt(-.02);assert.ok(b0[1]<.6,'the half-clearance drops to him');
const hd=F.silvaHeadAt(F.T_HEAD),hb=F.ballAt(F.T_HEAD);assert.ok(Math.hypot(hd[0]-hb[0],hd[1]-hb[1],hd[2]-hb[2])<.6,`Silva's head meets the cross (${Math.hypot(hd[0]-hb[0],hd[1]-hb[1],hd[2]-hb[2]).toFixed(2)} m)`);
let minD=1e9;for(let u=.75;u<=1;u+=.02){const b=F.curlAt(u),tau=F.SHOT+u*(F.IN_NET-F.SHOT);for(const h of F.fabioReachAt(tau))minD=Math.min(minD,Math.hypot(b[0]-h[0],b[1]-h[1],b[2]-h[2]));}
assert.ok(minD>.3,`the curl beats Fábio's glove (closest ${minD.toFixed(2)} m)`);assert.ok(minD<2.4,`but he goes for it (closest ${minD.toFixed(2)} m)`);
// figures: the shared athlete library, through exactly one adapter
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MOMENT/.test(src),'sources + confirmed/inferred + why this moment listed at the top');
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
