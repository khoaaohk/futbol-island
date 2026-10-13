// var-2018 "The VAR room" (Oct 12 2026 anatomy Paper rebuild): the case facts word for word and shown; the goal-line truth
// (at its deepest 6 cm of the first practice ball is still on the line: no goal); the goal-mouth bench, the goal-line camera and
// its monitor (true scale, from the same numbers that move the ball), drawn with the anatomy kit and no pixel kit; a play area
// that fills the screen; the shift scoring; and the exhibit contract (Room → ExperienceBack, data hooks, best key, onComplete
// only after the shift + quick check, one sleeping loop, reduced motion turn-based, lab route).
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

// 4. The camera: locks only on the ball; its monitor reads the truth from the same numbers that move the ball.
{const b=M.ballAt(M.FIRST,G.DEEP),v={clip:M.FIRST,frame:G.DEEP,cam:{x:b.x,y:b.y},review:0,call:null};assert.ok(M.camOnBall(v));
 assert.ok(!M.camOnBall({...v,cam:{x:400,y:300}}),'off the ball: no lock');
 const mon=M.monitorOf(v);assert.equal(mon.onLineCm,6,'the monitor reads 6 cm on the line');assert.equal(mon.over,false);
 for(const c of G.CLIPS){const mv=M.monitorOf({...v,clip:c,frame:c.deep});assert.equal(mv.over,G.clipTruth(c).goal,c.id+' monitor agrees with the truth');}
 assert.equal(G.LINE_W,.12);assert.equal(G.BALL_R,.11);
 for(const [w,h] of [[900,734],[358,450]]){const P=M.cameraFor(w,h),s=require('../components/museum/experiences/anatomy/iso-kit.ts').iso([b.x,b.y,0],P),f=M.floorAt(P,s[0],s[1]);
  assert.ok(Math.abs(f.x-b.x)<1e-6&&Math.abs(f.y-b.y)<1e-6,'dragging on the pitch maps back to the floor');assert.ok(s[0]>0&&s[0]<w&&s[1]>0&&s[1]<h,'the ball is on the card');}
 console.log('PASS goal-line camera: locks only on the ball, its monitor reads 6 cm and agrees with every clip; drag maps to the floor');}

// 5. The bench and players draw (anatomy kit), the referee walks to the review screen.
{for(const [w,h] of [[900,734],[358,450]]){const P=M.cameraFor(w,h);for(const c of [M.FIRST,...G.CLIPS])for(const f of [0,c.deep,G.LAST]){const v={clip:c,frame:f,cam:{x:0,y:0},review:f/G.LAST,call:null};
  const parts=M.benchParts(P,v);assert.ok(parts.filter(p=>p.kind==='solid').length>=20,'a detailed bench');const a=M.actorItems(P,v);assert.ok(a.items.length>40);assert.ok(a.items.some(i=>i.kind==='ball'&&i.id==='ball'&&i.tone==='accent'),'the ball carries the accent');}}
 console.log('PASS goal-mouth bench, goal, camera mast, review screen and paper players draw at desktop and phone sizes');}

// 6. Style, fill-screen layout, scoring and the contract.
{assert.equal(SC.clipPoints(0,true,0),150);assert.equal(SC.clipPoints(2,true,3),115);assert.equal(SC.clipPoints(null,false,9),0);assert.equal(SC.maxShift(5),750);
 assert.doesNotMatch(all,/pixeliso|PixelStage|Press Start|Pixelify|#000048|Mega ?Drive/i,'no pixel kit, fonts or dark cabinet');assert.match(all,/from '\.\.\/anatomy\/iso-kit'/);
 assert.match(pcss,/\.screen\{[^}]*height:100dvh[^}]*grid-template-rows:auto minmax\(0,1fr\) auto/,'play screen = 100dvh');assert.match(src,/viewBox=\{`0 0 \$\{box\.w\} \$\{box\.h\}`\}/,'viewBox = the card size');
 assert.match(src,/clipPoints\(off\.current,right,reduced\?0:nudges\.current\)/);assert.match(src,/REPLAY_FPS/);
 assert.match(src,/<Room id="var-2018"/);assert.match(paper,/<ExperienceBack onClose=\{onClose\}\/>/);assert.match(paper,/e\.key==='Escape'/);
 for(const h of ["'data-phase'","'data-frame'",'data-call="nogoal"','data-call="goal"','data-freeze','data-var-monitor','data-var-strip','data-next'])assert.ok(src.includes(h),'hook '+h);
 assert.match(src,/BEST_KEY='futbol\.museum\.var-2018\.shiftBest'/,'progress key kept');
 assert.equal((src.match(/cb\.current\?\.\(\)/g)||[]).length,1);assert.match(src,/<Ending reached onComplete=\{finish\}/);assert.match(src,/onDone=\{\(\)=>setChecked\(true\)\}/);
 assert.match(src,/useFrames\(/);assert.match(src,/if\(reduced\)\{setPhase\('frozen'\)/,'reduced motion: no roll, step the frames');
 for(const f of files.filter(f=>/\.tsx?$/.test(f)))assert.ok(!/requestAnimationFrame\(|setInterval\(/.test(read(`${dir}/${f}`)),'no own rAF/interval in '+f);
 assert.ok(fs.existsSync(path.join(root,'app/museum-lab/var-2018/page.tsx')));assert.match(read('components/museum/experiences/index.tsx'),/'var-2018':load/);
 console.log('PASS style + contract: anatomy Paper, no pixel kit, fills 100dvh, scoring, Back/Escape, data hooks, best key, onComplete once after the check, one sleeping loop, reduced = turn-based');}
