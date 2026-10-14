// var-2018 "The goal-line desk" (Oct 12 2026 rebuild, no people; user: "rebuild the video assistant referee. the characters
// don't look good moving. don't use the characters."): the case facts word for word and shown; the goal-line truth (at its
// deepest 6 cm of the first practice ball is still on the line: no goal); the ball is the star (off the bar, down near the line,
// spinning out); the line cam and top cam monitor at true scale, from the same numbers that move the ball; a goal-mouth bench with
// the VAR's instruments and NO figures (no anatomy/figure.ts); the shift scoring; and the exhibit contract (Room → ExperienceBack,
// data hooks, best key, onComplete only after the shift + quick check, one sleeping loop, reduced motion turn-based, lab route).
// usage: node tests/museum-exp-var-2018.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/var-2018',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),C=require(`../${dir}/content.ts`),G=require(`../${dir}/goalline.ts`),SC=require(`../${dir}/scoring.ts`),M=require(`../${dir}/model.ts`);
const src=read(`${dir}/Experience.tsx`),files=fs.readdirSync(path.join(root,dir)),all=files.filter(f=>/\.(tsx?|css)$/.test(f)).map(f=>read(`${dir}/${f}`)).join('\n');
const paper=read('components/museum/experiences/anatomy/PaperStage.tsx'),pcss=read('components/museum/experiences/anatomy/PaperStage.module.css'),loopSrc=read('components/museum/experiences/anatomy/paper-loop.ts');

// 1. Facts.
{const e=X.EXHIBITS.find(x=>x.id==='var-2018');
 assert.deepEqual(Object.values(C.CASE_FACTS).sort(),[...e.facts].sort());assert.equal(C.FOR_YOUR_GAME,e.forYourGame);
 for(const k of Object.keys(C.CASE_FACTS))assert.ok(src.includes(`CASE_FACTS.${k}`),`fact "${k}" is shown`);
 assert.ok(src.includes('{FOR_YOUR_GAME}')&&src.includes('PRACTICE_NOTE'));assert.match(C.IFAB_QUOTE,/final decision is always taken by the referee/);assert.match(src,/\{IFAB_QUOTE\}/);
 assert.match(src,/REAL_CASE\.story\[2\]/);assert.match(src,/REAL_CASE\.lesson/);assert.equal(C.CHECKS.filter(c=>c.yes).length,4);assert.match(src,/CHECKS\.map/);assert.match(src,/\{TOURNAMENT_NUMBERS\}/);
 console.log('PASS facts: the four case facts, the game line, the practice label, the IFAB quote, France v Australia, what VAR may check');}

// 2. Sources.
{const urls=C.SOURCES.map(s=>s.url);for(const u of urls)assert.match(u,/^https:\/\//);
 for(const s of X.EXHIBITS.find(x=>x.id==='var-2018').sources)assert.ok(urls.includes(s.url),'case source listed: '+s.url);
 for(const re of [/var-protocol/,/determining-the-outcome/,/si\.com.*griezmann/,/euronews.*griezmann/,/gulfnews.*var/])assert.ok(urls.some(u=>re.test(u)),'cited: '+re);
 assert.match(src,/list=\{\[\.\.\.SOURCES,\.\.\.exhibit\.sources\]\}/);assert.match(src,/<summary>Sources<\/summary>/);assert.ok(!/@gmail|khoa/i.test(all+JSON.stringify(C)));
 console.log('PASS sources: IFAB VAR protocol, Law 10, the 2018 reports, all with URLs');}

// 3. The goal-line truth, and the shift's replays.
{assert.equal(G.deepestFrame(),G.DEEP);assert.equal(G.TRUTH.ballOnLineCm,6);assert.equal(G.TRUTH.wholeBallOver,false);
 const first=M.FIRST;for(let f=0;f<=G.LAST;f++)assert.ok(Math.abs(M.zAt(first,f)-G.ballZ(f))<1e-12,'the first replay is the goal-line moment');
 assert.equal(G.clipTruth(first).goal,false);assert.equal(G.clipTruth(first).cm,6);
 const truths=G.CLIPS.map(c=>G.clipTruth(c).goal);assert.ok(truths.includes(true)&&truths.includes(false),'some goals, some not');
 for(const seed of [1,2,2018]){const s=M.makeShift(M.rng(seed));assert.equal(s.length,M.SHIFT_N);assert.equal(s[0].id,'first');assert.equal(new Set(s.map(c=>c.id)).size,5);}
 console.log('PASS goal-line truth: 6 cm still on the line at the deepest frame (no goal); a shift mixes goals and no goals');}

// 4. The ball is the star: it flies in, strikes the underside of the bar, lands on its deepest frame, and spins back out. The
//    monitor (line cam and top cam) reads the truth from the same numbers that move the ball, at every zoom.
{for(const c of [M.FIRST,...G.CLIPS]){const h=M.hitFrame(c),top=M.ballAt(c,h),land=M.ballAt(c,c.deep);
  assert.ok(Math.abs(top.z+11-(M.BAR-M.BAR_W))<1e-9,c.id+': the ball kisses the underside of the bar');
  assert.ok(Math.abs(land.z-11)<1e-9,c.id+': it lands on its deepest frame');
  for(let f=0;f<=G.LAST;f++){const b=M.ballAt(c,f);assert.ok(b.z>=11-1e-9&&b.z<=top.z+1e-9,'never under the turf or through the bar');}
  for(let f=c.deep+1;f<=G.LAST;f++)assert.ok(M.ballAt(c,f).x>M.ballAt(c,f-1).x,'then it spins back out');
  const mv=M.monitorOf({clip:c,frame:c.deep});assert.equal(mv.over,G.clipTruth(c).goal,c.id+' monitor agrees with the truth');
  assert.equal(Math.round(Math.abs(mv.near+G.LINE_W*100)),G.clipTruth(c).cm,c.id+' the measured cm match the truth');}
 const mon=M.monitorOf({clip:M.FIRST,frame:G.DEEP});assert.equal(mon.onLineCm,6,'the monitor reads 6 cm on the line');assert.equal(mon.over,false);
 for(const cam of ['line','top'])for(const z of M.ZOOMS)for(const a of [1.6,.9,2.4])for(const c of [M.FIRST,...G.CLIPS]){const b=M.ballAt(c,c.deep),w=M.monitorWindow(cam,z,a,b);
  assert.ok(Math.abs(w.w/w.h-a)<1e-9,'the window keeps the screen aspect');
  assert.ok(b.x-11>=w.x-1e-9&&b.x+11<=w.x+w.w+1e-9,`${cam} ×${z}: the whole ball is in the picture at the deepest frame`);
  assert.ok(-12>=w.x&&0<=w.x+w.w,`${cam} ×${z}: the whole line is in the picture`);
  if(cam==='line')assert.ok(-b.z-11>=w.y-1e-9&&-b.z+11<=w.y+w.h+1e-9,'line cam: the ball is in frame vertically');}
 const w1=M.monitorWindow('line',1,1.6,M.ballAt(M.FIRST,0)),w4=M.monitorWindow('line',4,1.6,M.ballAt(M.FIRST,G.DEEP));assert.ok(w1.y<=-M.BAR&&w1.y+w1.h>=0,'line cam ×1 shows the whole goal height');assert.ok(w4.w<w1.w/3,'the magnifier zooms');
 assert.equal(G.LINE_W,.12);assert.equal(G.BALL_R,.11);
 console.log('PASS the ball: off the bar, down on its deepest frame, spinning out; line cam and top cam read the truth in cm at every zoom');}

// 5. The bench draws with the anatomy kit and has NO people on it: no anatomy/figure.ts anywhere in this exhibit.
{for(const f of files.filter(f=>/\.(tsx?|css)$/.test(f))){const t=read(`${dir}/${f}`);
  assert.doesNotMatch(t,/from ['"][^'"]*figure['"]/,'no figure import in '+f);assert.doesNotMatch(t,/figure\.ts|figureItems|POSES|mixPose|runAt\(|joints\(|kit:'(light|grey|dark|keeper)'/,'no mannequin code in '+f);}
 for(const [w,h] of [[900,734],[358,450]]){const P=M.cameraFor(w,h),k=require('../components/museum/experiences/anatomy/iso-kit.ts');
  for(const c of [M.FIRST,...G.CLIPS])for(const f of [0,M.hitFrame(c),c.deep,G.LAST])for(const cam of ['line','top']){const v={clip:c,frame:f,cam,zoom:1,review:f/G.LAST,call:null};
   const parts=M.benchParts(P,v);assert.ok(parts.filter(p=>p.kind==='solid').length>=30,'a detailed bench');
   assert.ok(parts.some(p=>p.kind==='lens'&&p.on==='green'),'the chosen camera lights up');
   const a=M.ballItems(P,v);assert.equal(a.items.filter(i=>i.kind==='ball').length,1,'one thing moves: the ball');assert.ok(a.items.some(i=>i.kind==='ball'&&i.id==='ball'&&i.tone==='accent'),'the ball carries the accent');
   assert.ok(!a.items.some(i=>i.kind==='cap'),'no capsule limbs');assert.equal(!!a.hit,f>=M.hitFrame(c),'the bar shows the impact once hit');
   assert.ok(a.ball[0]>0&&a.ball[0]<w&&a.ball[1]>0&&a.ball[1]<h,'the ball is on the card');}
  assert.ok(M.signalPath(P,0)===''&&M.signalPath(P,1).length>20,'the review signal is traced on the screen');}
 console.log('PASS no people: goal-mouth bench, goal, line cam mast, top cam boom, cable and review screen; the ball is the only moving thing');}

// 6. Style, fill-screen layout, scoring and the contract.
{assert.equal(SC.clipPoints(0,true,0),150);assert.equal(SC.clipPoints(2,true,3),115);assert.equal(SC.clipPoints(null,false,9),0);assert.equal(SC.maxShift(5),750);
 assert.doesNotMatch(all,/pixeliso|PixelStage|Press Start|Pixelify|#000048|Mega ?Drive/i,'no pixel kit, fonts or dark cabinet');assert.match(all,/from '\.\.\/anatomy\/iso-kit'/);
 assert.match(pcss,/\.screen\{[^}]*height:100dvh[^}]*grid-template-rows:auto minmax\(0,1fr\) auto/,'play screen = 100dvh');assert.match(src,/viewBox=\{`0 0 \$\{box\.w\} \$\{box\.h\}`\}/,'viewBox = the card size');
 assert.match(src,/clipPoints\(off\.current,right,reduced\?0:nudges\.current\)/);assert.match(src,/ZOOMS/);assert.match(src,/REPLAY_FPS/);
 assert.match(src,/<Room id="var-2018"/);assert.match(paper,/<ExperienceBack onClose=\{onClose\}\/>/);assert.match(paper,/e\.key==='Escape'/);
 for(const h of ["'data-phase'","'data-frame'",'data-call="nogoal"','data-call="goal"','data-freeze','data-var-monitor','data-var-strip','data-next'])assert.ok(src.includes(h),'hook '+h);
 assert.match(src,/BEST_KEY='futbol\.museum\.var-2018\.shiftBest'/,'progress key kept');
 assert.equal((src.match(/cb\.current\?\.\(\)/g)||[]).length,1);assert.match(src,/<Ending reached onComplete=\{finish\}/);assert.match(src,/onDone=\{\(\)=>setChecked\(true\)\}/);
 assert.match(src,/useFrames\(/);assert.match(src,/if\(reduced\)\{setPhase\('frozen'\)/,'reduced motion: no roll, step the frames');
 for(const f of files.filter(f=>/\.tsx?$/.test(f)))assert.ok(!/requestAnimationFrame\(|setInterval\(/.test(read(`${dir}/${f}`)),'no own rAF/interval in '+f);
 assert.ok(fs.existsSync(path.join(root,'app/museum-lab/var-2018/page.tsx')));assert.match(read('components/museum/experiences/index.tsx'),/'var-2018':load/);
 console.log('PASS style + contract: anatomy Paper, no pixel kit, fills 100dvh, scoring, Back/Escape, data hooks, best key, onComplete once after the check, one sleeping loop, reduced = turn-based');}
