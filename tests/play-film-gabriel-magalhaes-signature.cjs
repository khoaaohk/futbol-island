// Iconic-play film (signature): Gabriel Magalhães — "the corner-kick header", shown by his North London derby winner, Tottenham 0–1 Arsenal,
// Premier League, Tottenham Hotspur Stadium, 15 September 2024 (lib/plays/riso/gabriel-magalhaes-signature.ts).
// Structural checks, no browser: story shape (4 chapters: live broadcast, slow replay on the goal line, behind the corner-taker, lesson);
// narration = script.json; 70–90 words ending with the iconicPlays lesson; cues spoken, in order, inside their chapter before the passage,
// each starting with a plain word (Kokoro splits contractions / hyphens); every scene cue lookup exists; figures only through the one
// drawPlayer() adapter on the shared athlete library; the kits from the photo; a LEFT-foot inswinger from Arsenal's right; Gabriel waiting
// behind Romero and moving late, rising above him; Vicario boxed in, never near the ball; the ghost (early, standing still) under the ball;
// seeded randomness; full-sheet framing; sources + confirmed/inferred header; the VOICE constant. Renders every chapter through a stub
// canvas at the three card sizes.
// usage: node tests/play-film-gabriel-magalhaes-signature.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{module:m,exports:m.exports,Math,WeakMap,Map,Set,DOMMatrix:globalThis.DOMMatrix??StubMatrix,DOMPoint:globalThis.DOMPoint,Path2D:StubPath,document:{createElement:()=>stubCanvas()},require:id=>{const base=path.resolve(path.dirname(file),id);return load([base+'.ts',base,base+'.json'].find(fs.existsSync));}});
 return m.exports;}
function StubPath(){}Object.assign(StubPath.prototype,{moveTo(){},lineTo(){},arc(){},rect(){},closePath(){},addPath(){},bezierCurveTo(){},quadraticCurveTo(){},ellipse(){}});
class StubMatrix{constructor(a){const[m0,m1,m2,m3,m4,m5]=a??[1,0,0,1,0,0];Object.assign(this,{a:m0,b:m1,c:m2,d:m3,e:m4,f:m5});}
 multiply(o){return new StubMatrix([this.a*o.a+this.c*o.b,this.b*o.a+this.d*o.b,this.a*o.c+this.c*o.d,this.b*o.c+this.d*o.d,this.a*o.e+this.c*o.f+this.e,this.b*o.e+this.d*o.f+this.f]);}
 translate(x,y){return this.multiply(new StubMatrix([1,0,0,1,x,y]));}scale(s){return this.multiply(new StubMatrix([s,0,0,s,0,0]));}rotate(d){const r=d*Math.PI/180;return this.multiply(new StubMatrix([Math.cos(r),Math.sin(r),-Math.sin(r),Math.cos(r),0,0]));}
 inverse(){const det=this.a*this.d-this.b*this.c;return new StubMatrix([this.d/det,-this.b/det,-this.c/det,this.a/det,(this.c*this.f-this.d*this.e)/det,(this.b*this.e-this.a*this.f)/det]);}
 transformPoint(p){return{x:this.a*p.x+this.c*p.y+this.e,y:this.b*p.x+this.d*p.y+this.f};}}
globalThis.DOMPoint??=class{constructor(x,y){this.x=x;this.y=y;}};
function stubCtx(){let m=new StubMatrix();const stack=[];const pat={setTransform(){}};return{canvas:{width:1,height:1},save(){stack.push(m);},restore(){m=stack.pop()??m;},setTransform(a,b,c,d,e,f){m=a instanceof StubMatrix?a:new StubMatrix(typeof a==='object'?[a.a,a.b,a.c,a.d,a.e,a.f]:[a,b,c,d,e,f]);},getTransform(){return m;},
 translate(x,y){m=m.translate(x,y);},scale(x){m=m.scale(x);},rotate(r){m=m.rotate(r*180/Math.PI);},clip(){},fill(){},stroke(){},fillRect(){},clearRect(){},drawImage(){},beginPath(){},moveTo(){},lineTo(){},arc(){},rect(){},closePath(){},putImageData(){},
 createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createPattern:()=>pat};}
function stubCanvas(){return{width:1,height:1,getContext:()=>stubCtx()};}
globalThis.document??={createElement:()=>stubCanvas()};


const ID='gabriel-magalhaes-signature',file=path.join(root,'lib/plays/riso',ID+'.ts'),src=fs.readFileSync(file,'utf8');
const mod=load(file),film=mod.default,F=mod.FACTS;
const {chapterStarts,storyDuration,resolveFrame}=load(path.join(root,'lib/paths/riso/story.ts'));
const {acquireSheet}=load(path.join(root,'lib/paths/riso/sheet.ts'));
assert.equal(film.id,ID);assert.equal(film.format,'11v11');assert.equal(film.audio.mode,'chapters');assert.equal(typeof film.draw,'function');assert.equal(typeof film.touch,'function');
assert.equal(film.chapters.length,4,'live broadcast, slow replay, behind the corner, lesson');
const dir=path.join(root,'public/plays/narration',ID),script=JSON.parse(fs.readFileSync(path.join(dir,'script.json'),'utf8'));
assert.equal(JSON.stringify(film.chapters.map(c=>({label:c.label,text:c.narration}))),JSON.stringify(script.chapters),'script.json mirrors the film narration');
const text=film.chapters.map(c=>c.narration).join(' '),words=text.split(/\s+/).length;
assert.ok(words>=70&&words<=90,`narration ${words} words (70–90)`);
const plays=JSON.parse(fs.readFileSync(path.join(root,'lib/town/iconicPlays.json'),'utf8')),entry=plays['Gabriel Magalhães'];
assert.equal(entry.kind,'signature');assert.ok(/header/i.test(entry.title),'the signature is the corner header');
assert.ok(/Start your run late, and attack the ball\. Don't wait for it!$/.test(text),'ends with the iconicPlays lesson ("Start your run late and attack the ball, don’t wait for it.")');
const c0=film.chapters[0].narration;
assert.ok(/Tottenham in white/.test(c0)&&/Arsenal in black/.test(c0)&&/Bukayo Saka/.test(c0)&&/sixty-four/.test(c0)&&/2024/.test(c0),'kits, corner-taker, minute and year are narrated');
assert.ok(/Romero/.test(film.chapters[1].narration)&&/Vicario/.test(film.chapters[1].narration)&&/boxed in/.test(film.chapters[1].narration)&&/rises highest/.test(film.chapters[2].narration),'Romero, Vicario boxed in and the leap are narrated');
assert.ok(!/left|right|in-?swing|out-?swing|near post|far post/i.test(text),'the inferred corner side / swing is never narrated');
for(const [i,ch] of film.chapters.entries()){let from=0,prev=-1;assert.ok(ch.cues.length>=4,`ch${i+1} has ≥ 4 cue actions`);
 for(const c of ch.cues){const k=ch.narration.indexOf(c.words,from);assert.ok(k>=0,`ch${i+1} cue "${c.words}" is in the narration, in order`);from=k+c.words.length;
  const w0=c.words.split(/\s+/)[0];assert.ok(!/['’-]/.test(w0),`ch${i+1} cue "${c.words}" starts with a plain word (Kokoro splits contractions and hyphens)`);
  assert.ok(c.at>prev&&c.at<ch.seconds-.65,`ch${i+1} cue "${c.words}" at ${c.at} inside the chapter before its passage`);prev=c.at;}
 // no cue is a prefix of an earlier cue in the same chapter (CUE() matches by startsWith)
 ch.cues.forEach((q,j)=>ch.cues.slice(0,j).forEach(p=>assert.ok(!p.words.startsWith(q.words),`ch${i+1} cue "${q.words}" is not shadowed by "${p.words}"`)));}
const total=storyDuration(film);assert.ok(total>=25&&total<=52,`length ${total}s`);
let n=0;for(const m of src.matchAll(/CUE\((\d),(["'])([^"']+)\2\)/g)){n++;assert.ok(film.chapters[+m[1]].cues.some(q=>q.words.startsWith(m[3])),`scene cue "${m[3]}" exists in chapter ${+m[1]+1}`);}
assert.ok(n>=25,`scenes key their action to the cues (${n})`);
for(const [i,ch] of film.chapters.entries())for(const q of ch.cues){const w=q.words.split(/\s+/)[0];assert.ok(src.includes(`CUE(${i},'${w}`)||src.includes(`CUE(${i},"${w}`),`ch${i+1} cue "${q.words}" drives something on screen`);}
// figures: the shared athlete library, through exactly one adapter; the kits from the photo
assert.ok(/from '\.\/athlete'/.test(src),'uses lib/plays/riso/athlete.ts');
assert.equal((src.match(/drawAthlete\(/g)||[]).length,1,'drawAthlete is called in one place (the drawPlayer adapter)');
assert.ok(/function drawPlayer\(/.test(src),'drawPlayer adapter exists');
assert.ok(/shirt:\[K,\.92\],shorts:\[K,\.92\],socks:\[K,\.92\]/.test(src),'Arsenal: the black away strip (navy ink)');
assert.ok(/shirt:'paper',shorts:\[K,\.92\],socks:'paper'/.test(src),'Tottenham: white shirts, navy shorts, white socks');
assert.ok(/GAB_ST=ars\(\{number:6,/.test(src)&&/SAKA_ST=ars\(\{number:7,/.test(src)&&/ROM_ST=tot\(\{number:17,/.test(src),'Gabriel 6, Saka 7, Romero 17');
assert.ok(/VIC_ST:AthleteStyle=\{shirt:\[Y/.test(src)&&/number:1,/.test(src),'Vicario: 1, yellow');
assert.ok(/header\(/.test(src)&&/strike\(STRIKE_CONTACT,\{foot:'l'\}\)/.test(src),'header() and a left-foot corner');
assert.ok(!/Math\.random/.test(src),'seeded randomness only');
assert.ok(!/\bs\.safe\b/.test(src),'full-sheet framing (never sheet.safe)');
assert.ok(/SOURCES/.test(src)&&/CONFIRMED/.test(src)&&/INFERRED/.test(src)&&/WHY THIS MOMENT/.test(src),'sources + why-this-moment + confirmed/inferred listed at the top');
assert.ok(/const VOICE:NarrationTiming\|null=/.test(src)&&/,VOICE\);/.test(src),'VOICE constant passed into withTiming');
// the goal as the accounts describe it
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
assert.equal(F.cornerFoot,'l');
const sc=F.sakaContact();assert.ok(d3(sc.lToe,F.P0)<.35,`Saka's LEFT boot is at the ball (${d3(sc.lToe,F.P0).toFixed(2)} m)`);assert.ok(d3(sc.lToe,F.P0)<d3(sc.rToe,F.P0),'left boot nearer the ball than the right');
assert.ok(F.P0[2]>33&&F.P0[2]<34.2&&F.P0[0]>-1.2&&F.P0[0]<0,`the corner from Arsenal's right (x ${F.P0[0]}, z ${F.P0[2]})`);
// inswinger: the ball's path bends toward the goal line (x) relative to the straight chord
{const mid=F.ballAt(F.TF/2),ch=[(F.P0[0]+F.HEAD_PT[0])/2,(F.P0[2]+F.HEAD_PT[2])/2];assert.ok(mid[0]<ch[0]-.3,`inswinging: mid-flight the ball is out beyond the chord and curls in (${mid[0].toFixed(2)} vs ${ch[0].toFixed(2)})`);}
assert.ok(-F.HP[0]<6&&Math.abs(F.HP[1])<9.16,`he meets it inside the six-yard box (${F.HP[0]}, ${F.HP[1]})`);
const g=F.gabAt(F.TF);assert.ok(g.air>.4,`he is high in the air at contact (${g.air.toFixed(2)} m)`);
assert.ok(d3(g.face,F.HEAD_PT)<.2,`forehead on the ball (${d3(g.face,F.HEAD_PT).toFixed(2)} m)`);
assert.ok(d3(F.ballAt(F.TF),F.HEAD_PT)<1e-6,'the corner arrives at his forehead');
const ro=F.romeroAt(F.TF);assert.ok(g.head[1]>ro.head[1]+.3,`he rises above Romero (${g.head[1].toFixed(2)} vs ${ro.head[1].toFixed(2)} m)`);
const w0=F.gabPos(F.TM-.3),rp=F.romeroAt(F.TM-.3).pelvis;assert.ok(Math.hypot(w0[0]-rp[0],w0[1]-rp[2])<3.2&&w0[0]<rp[0],`he waits just behind Romero (${Math.hypot(w0[0]-rp[0],w0[1]-rp[2]).toFixed(2)} m)`);
assert.ok(F.TM>0&&F.TM<F.TF,'he moves LATE — only once the corner is in the air');
const p0=F.gabPos(F.TM-.4),p1=F.gabPos(F.TM-.05);assert.ok(Math.hypot(p1[0]-p0[0],p1[1]-p0[1])<.15,'still behind Romero until the late move');
for(let T=F.TF-.6;T<F.TG;T+=.02){const b=F.ballAt(T),v=F.vicarioAt(T);assert.ok(Math.min(d3(v.lHa,b),d3(v.rHa,b))>.8,`Vicario, boxed in, never gets near it (τ ${T.toFixed(2)})`);}
assert.ok(F.vicarioAt(F.TF).pelvis[0]>-1.6,'Vicario stays on his line');
const gh=F.ghostAt(F.TF);assert.ok(gh.head[1]<g.head[1]-.25,`the early, standing jumper's head is under Gabriel's (${gh.head[1].toFixed(2)} vs ${g.head[1].toFixed(2)} m)`);
assert.ok(Math.hypot(F.ghostAt(-1).x-F.ghostAt(F.TJ-.1).x,F.ghostAt(-1).z-F.ghostAt(F.TJ-.1).z)<.05,'the ghost stands still on the spot');
let apex=0;for(let T=0;T<F.TF;T+=.02)apex=Math.max(apex,F.ballAt(T)[1]);assert.ok(apex>3.5&&apex<9,`a lofted corner (apex ${apex.toFixed(1)} m)`);
const gl=F.ballAt(F.TG);assert.ok(Math.abs(gl[0])<.05&&Math.abs(gl[2])<3.55&&gl[1]<2.33&&gl[1]>0,`the header crosses the line inside the goal (z ${gl[2].toFixed(2)}, y ${gl[1].toFixed(2)})`);
assert.ok(F.HEAD_PT[1]>gl[1]+1,'powered DOWN');
// installed voice (optional until generated): the film must import it, files exist and chapter seconds cover each clip
const timing=path.join(dir,'timing.json');
if(fs.existsSync(timing)){const Tm=JSON.parse(fs.readFileSync(timing,'utf8'));
 film.chapters.forEach((ch,i)=>{assert.ok(ch.audio,`ch${i+1} has audio once timing.json exists — import timing.json in ${ID}.ts (see the VOICE note)`);assert.ok(fs.existsSync(path.join(root,'public',ch.audio.split('?')[0])),`ch${i+1} audio file ${ch.audio}`);
  const d=Tm.chapters?.[i]?.seconds;if(typeof d==='number')assert.ok(ch.seconds>=d-.05,`ch${i+1} seconds ${ch.seconds} cover audio ${d}`);});}
// render every chapter (start, cue beats, passage) through the stub canvas: no draw errors at card sizes, reduced motion and a touch included
let frames=0;
for(const [w,h] of [[360,240],[300,180],[346,364]]){const ctx=stubCtx(),starts=chapterStarts(film);
 film.chapters.forEach((ch,i)=>{for(const u of [0,.15,.35,.5,.62,.8,.93,.97]){const t=ch.seconds*u,f=resolveFrame(film,starts[i]+t,i),sheet=acquireSheet(ctx,w,h,1.5,film.spec,{bottom:0,right:0});
  film.draw({sheet,time:starts[i]+t,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:u===.35,width:w,height:h});film.touch(sheet,0,0,u*.8,7);sheet.press(i);frames++;}});}
console.log(`PASS ${ID}: 4 chapters, ${words} words / ${text.length} chars, ${total}s, ${n} scene cue lookups, ${frames} frames drawn${fs.existsSync(timing)?', voice installed':' (voice pending)'}`);
