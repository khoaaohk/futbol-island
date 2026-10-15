// offside-rules "The offside rule through time" (Oct 14 2026 redo: THE OFFSIDE LINE MACHINE). Checks: the case facts and sources;
// every control's effect on the machine (the era dial's detents and keys, the rule cams each era puts in the judge, the line gantry,
// the pass lever's sequence: lever, ball, cam lamps, flag; the carriages' rails and the level snap); the five rulebooks judging
// the SAME position; the tasks; the breakdown labels; the exhibit contract (Paper room → shared Back, ONE centred start button,
// StepCheck → Ending → onComplete once, the shared Paper loop only (0 rAF at rest, reduced motion runs to the end at once),
// 44 px targets, no emoji or glyph arrows, registered + lab route).
// usage: node tests/museum-exp-offside-rules.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const compile=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
require.extensions['.ts']=compile;require.extensions['.tsx']=compile;
const root=path.join(__dirname,'..'),dir='components/museum/experiences/offside-rules',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const code=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
const X=require('../lib/endgame/museum.ts'),M=require(`../${dir}/model.ts`),C=require(`../${dir}/content.ts`);
const files=fs.readdirSync(path.join(root,dir)).sort(),src=Object.fromEntries(files.map(f=>[f,read(`${dir}/${f}`)]));
const exp=src['Experience.tsx'],mach=src['Machine.tsx'],css=src['Experience.module.css'];

// 1. Facts and sources.
{const e=X.EXHIBITS.find(x=>x.id==='offside-rules');assert.ok(e,'case entry');assert.equal(e.gallery,'tactics');assert.equal(e.year,'1863');assert.equal(e.need,0);
 assert.ok(e.facts.length>=3&&e.forYourGame.length>10);const f=e.facts.join(' ');
 assert.match(f,/1863/);assert.match(f,/1866[^.]*three/);assert.match(f,/1925[^.]*two/);assert.match(f,/4,700[^.]*6,373/);assert.match(f,/Since 1990[^.]*level/);
 for(const s of [...e.sources,...C.SOURCES])assert.match(s.url,/^https:\/\//);
 assert.ok(e.sources.some(s=>/theifab\.com\/laws\/latest\/offside/.test(s.url)),'IFAB Law 11');assert.ok(e.sources.some(s=>/wiki\/Offside_\(association_football\)/.test(s.url)),'offside history');
 assert.deepEqual(C.MILESTONES.map(m=>m.when),['1863','1866','1907','1925','1990','Today']);
 assert.deepEqual(Object.keys(C.CAM_TEXT),['ball','count','half','level']);
 assert.deepEqual(Object.values(C.CAM_TEXT).map(c=>c.since),['Since 1863','Since 1866','Since 1907','Since 1990'],'each cam is dated by the law that added it');
 assert.ok(C.MODEL_NOTE.length>20,'the machine is labelled as a model');
 assert.match(exp,/exhibit\.facts\.map/);assert.match(exp,/exhibit\.forYourGame/);assert.match(exp,/\[\.\.\.SOURCES,\.\.\.exhibit\.sources\]/);assert.match(exp,/<summary>Sources<\/summary>/);
 console.log('PASS facts: 1863 strict, 1866 three, 1907 own half, 1925 two (4,700 to 6,373 goals), 1990 level onside, Law 11 today; cams dated; IFAB + Wikipedia');}

// 2. The era dial: five detents, drag snaps to the nearest, arrow keys click one at a time and stop at the ends.
{assert.deepEqual(M.ERAS.map(e=>e.id),['1863','1866','1907','1925','1990']);
 assert.deepEqual(M.ERAS.map(e=>M.dialAngle(e.id)),[-80,-40,0,40,80]);
 assert.equal(M.detentOf(-200),'1863');assert.equal(M.detentOf(-55),'1866');assert.equal(M.detentOf(-15),'1907');assert.equal(M.detentOf(19),'1907');assert.equal(M.detentOf(21),'1925');assert.equal(M.detentOf(95),'1990');
 assert.equal(M.stepEra('1863',-1),'1863');assert.equal(M.stepEra('1863',1),'1866');assert.equal(M.stepEra('1925',1),'1990');assert.equal(M.stepEra('1990',1),'1990');
 // what the dial does inside the judge: which cams sit in the drum
 const cams=e=>M.CAMS.filter(c=>M.camIn(e,c));
 assert.deepEqual(cams('1863'),['ball']);assert.deepEqual(cams('1866'),['ball','count']);assert.deepEqual(cams('1907'),['ball','count','half']);
 assert.deepEqual(cams('1925'),['ball','count','half']);assert.deepEqual(cams('1990'),['ball','count','half','level']);
 assert.deepEqual(M.ERAS.map(e=>e.need),[null,3,3,2,2],'the counting wheel shows 3, then 2 from 1925');
 assert.match(mach,/<FaceTop [^>]*text=\{String\(need\)\}/,'the wheel is engraved with the number the era needs');
 assert.match(mach,/camOffset\(P,v\.camIn\[c\]\)/,'a cam out of the law slides out of the drum');
 console.log('PASS era dial: 5 detents (drag snaps, keys click and stop at the ends); it swaps the cams: 1863 ball only, +count 1866, +halfway 1907, count 2 in 1925, +level 1990');}

// 3. The rulebooks: one position judged five ways. Board x: 0 = the attackers' own goal line, 100 = the goal they attack.
{const sc=(att,defs,ball=55)=>({ball,att,defs:[97,...defs]});const V=s=>M.ERAS.map(e=>M.judge(e.id,s).offside);
 assert.deepEqual(V(sc(52,[60,70,80],58)),[false,false,false,false,false],'behind the ball: onside always');
 assert.deepEqual(V(sc(64,[70,74,80])),[true,false,false,false,false],'four opponents ahead: only 1863 flags it');
 assert.deepEqual(V(sc(76,[70,74,80])),[true,true,true,false,false],'two opponents ahead: the 1925 space');
 {const s=sc(80,[70,74,80]),v=M.judgeAll(s);assert.deepEqual(v.map(x=>x.offside),[true,true,true,true,false],'level with the second-last: onside only since 1990');assert.match(v[4].reason,/1990/);assert.match(v[3].reason,/level did not count/);}
 assert.deepEqual(V(sc(86,[70,74,80])),[true,true,true,true,true],'beyond the second-last: offside in every era');
 {const s=sc(48,[40,44,46],30);assert.deepEqual(V(s),[true,true,false,false,false],'own half: the halfway stop arrived in 1907');assert.match(M.judge('1907',s).reason,/1907/);}
 assert.equal(M.judge('1990',sc(86,[70,74,80],86)).offside,false,'level with the BALL is onside');
 {const s={ball:55,att:85,defs:[70,88,90,60]};assert.equal(M.judge('1990',s).offside,false,'keeper off his line: two outfield players count');assert.equal(M.judge('1866',s).offside,true);}
 // the lamps: each cam in the stack reports, bottom to top
 {const v=M.judge('1990',sc(86,[70,74,80]));assert.deepEqual(v.cams.map(c=>c.cam),['ball','count','half','level']);assert.deepEqual(v.cams.map(c=>c.clears),[false,false,false,false]);}
 {const v=M.judge('1990',sc(80,[70,74,80]));assert.equal(v.cams.find(c=>c.cam==='level').clears,true,'the level shim lights green when level');}
 {const v=M.judge('1863',sc(60,[70,74,80]));assert.deepEqual(v.cams.map(c=>c.cam),['ball'],'1863 judges with the ball cam only');}
 // the line gantry: the ball (1863), the third-last (1866, 1907), the second-last (1925, 1990), never before halfway once the stop is in
 {const s=sc(66,[70,74,80]);assert.deepEqual(M.ERAS.map(e=>M.judge(e.id,s).line),[55,74,74,80,80]);}
 {const s=sc(48,[40,44,46],30);assert.equal(M.judge('1907',s).line,50,'the line never comes back past halfway after 1907');assert.equal(M.judge('1866',s).line,44);}
 console.log('PASS rulebooks: behind the ball, the 1925 space, level (1990), beyond, own half (1907), level with the ball, keeper off his line; cam lamps; the gantry line per era');}

// 4. Carriages, the pass lever, the breakdown.
{const s=M.START;assert.equal(M.snapLevel(79.4,{...s,defs:[96,80,74,70]}),80,'the striker clicks level with a defender');assert.equal(M.snapLevel(77,{...s,defs:[96,80,74,70]}),77);
 assert.equal(M.clampRail(10),40);assert.equal(M.clampRail(140),100);assert.equal(M.clampRail(72),72);
 // the pass: the lever swings, the ball rolls, each cam clicks in turn, then the flag
 const n=4,L=M.passLength(n);assert.ok(Math.abs(L-(M.PASS.lever+M.PASS.roll+n*M.PASS.cam+M.PASS.flag))<1e-9);
 const a=M.passAt(0,n),b=M.passAt(M.PASS.lever,n),c=M.passAt(M.PASS.lever+M.PASS.roll/2,n),d=M.passAt(M.PASS.lever+M.PASS.roll+.01,n),e=M.passAt(M.PASS.lever+M.PASS.roll+2.5*M.PASS.cam,n),f=M.passAt(L,n);
 assert.equal(a.roll,0);assert.equal(a.lit,0);assert.equal(b.lever,1,'the lever is fully pulled when the ball leaves');assert.ok(c.roll>.4&&c.roll<.6);assert.equal(c.lit,0,'no lamp before the ball arrives');
 assert.equal(d.roll,1);assert.equal(d.lit,1);assert.equal(e.lit,3);assert.equal(f.lit,4);assert.equal(f.flag,1);assert.equal(f.done,true);assert.ok(f.lever<.01,'the lever springs back');
 assert.equal(M.passAt(L,1).lit,1,'1863: one cam');
 // the view: the machine reads the same model the judge uses
 assert.match(exp,/v\.flag=P\.v\.offside\?q\.flag:0/,'the flag only rises for offside');assert.match(exp,/P\.v\.cams\.forEach\(\(r,i\)=>\{if\(i<q\.lit\)v\.lamps\[r\.cam\]=r\.clears;\}\)/,'lamps light in stack order');
 assert.match(exp,/v\.line=ease\(v\.line,pass\.current\?pass\.current\.v\.line:lineT/,'the gantry runs to the era line');
 assert.match(exp,/label="Open the judge"/);assert.match(exp,/data-cam-label=\{c\}/);assert.equal(C.CAM_TEXT.ball.n,'1');
 assert.match(mach,/const sleeveLift=\(open:number\)=>open\*/,'opening lifts the sleeve');assert.match(mach,/export const camZ=\(i:number,open:number\)=>[^;]*open\*GAP\*\(i\+1\)/,'and spreads the cams');
 console.log('PASS controls: carriages ride rails (40 to 100) and click level; the lever plays lever, ball, lamps one by one, flag; the judge opens (sleeve up, cams apart, labels)');}

// 5. Tasks and the start.
{assert.deepEqual(M.judgeAll(M.START).map(x=>x.offside),[true,false,false,false,false],'start: only the 1863 law flags it');
 for(const t of M.TASKS)if(t.test)assert.equal(t.test(M.START),false,'not done at the start: '+t.id);
 const mv=x=>({...M.START,att:x});assert.ok(M.TASKS[0].test(mv(90)));assert.ok(M.TASKS[1].test(mv(80)));assert.ok(M.TASKS[2].test(mv(77)));
 assert.equal(M.TASKS[3].id,'open');assert.match(exp,/if\(T\.open>\.5&&v\.open>\.9\)markOpen\(\)/,'opening the judge ticks the fourth task');
 assert.equal(C.QUIZ.length,3);for(const q of C.QUIZ)assert.ok(q.answer>=0&&q.answer<q.options.length&&q.why.length>10);
 console.log('PASS tasks: offside today, level, the 1925 space, open the judge; three quiz questions');}

// 6. Contract, heat, reduced motion, targets, style.
{assert.match(exp,/<PaperRoom id="offside-rules"/);assert.match(read('components/museum/experiences/anatomy/PaperRoom.tsx'),/<ExperienceBack onClose=\{onClose\}\/>/);
 assert.doesNotMatch(exp,/NavigationButton|<ExperienceBack/,'no Back of its own');
 assert.equal((code(exp).match(/<StartDock /g)||[]).length,1,'ONE start button (the StartDock)');assert.doesNotMatch(code(exp),/data-start[ =]|<Intro /,'no second start button');
 assert.match(read('components/museum/experiences/modern/startDock.module.css'),/\.dock\{[^}]*align-items:center/,'centred');
 assert.match(exp,/<StepCheck /);assert.match(exp,/<Ending reached=\{checked\} onComplete=\{onComplete\}/);assert.match(exp,/onDone=\{\(\)=>setChecked\(true\)\}/);
 assert.equal((code(exp).match(/onComplete/g)||[]).length,3,'onComplete only reaches the Ending');assert.doesNotMatch(exp,/onComplete(\?\.)?\(/,'never called directly');
 for(const [f,t] of Object.entries(src))assert.doesNotMatch(code(t),/requestAnimationFrame|setInterval|setTimeout|<canvas|getContext\(/,f+': no loop or timer of its own');
 assert.match(exp,/usePaperLoop\(dt=>\{/);assert.match(exp,/\},stageRef,reduced\);/,'the shared Paper loop, reduced motion passed in');
 assert.match(exp,/return moving;/,'the loop stops when nothing moves');
 // the shared loop: 0 frames at rest, runs while ticking, reduced motion runs to the end at once
 {let q=[];global.requestAnimationFrame=f=>{q.push(f);return q.length;};global.cancelAnimationFrame=()=>{};
  const {createPaperLoop}=require('../components/museum/experiences/anatomy/paper-loop.ts');
  let n=0;const l=createPaperLoop(()=>++n<5);assert.equal(q.length,0,'nothing scheduled at rest');l.wake();
  let frames=0;while(q.length&&frames<50){const f=q.shift();frames++;f(16*frames);}assert.equal(n,5);assert.equal(q.length,0,'stops itself at rest');
  let m=0;const r=createPaperLoop(()=>++m<40,{reduced:true});r.wake();assert.equal(m,40,'reduced motion: straight to the end, no frames');assert.equal(q.length,0);
  delete global.requestAnimationFrame;delete global.cancelAnimationFrame;}
 assert.match(css,/@media \(prefers-reduced-motion:reduce\)\{/);assert.match(exp,/'data-reduced':reduced\|\|undefined/);
 // targets: 44 px+ everywhere
 for(const m of css.matchAll(/min-height:(\d+)px/g))assert.ok(Number(m[1])>=44,'min-height '+m[1]);
 assert.match(mach,/r=\{Math\.max\(22,13\*k\)\} data-hit=\{id\}/,'carriage hit circles at least 44 px across');
 assert.match(mach,/r=\{Math\.max\(26,\(D\.r\+8\)\*s\*1\.05\)\} data-hit="dial"/);assert.match(mach,/r=\{Math\.max\(26,L\.len\*\.6\*s\)\} data-hit="lever"/);
 for(const h of ['data-hit="dial"','data-hit="lever"','data-hit={id}'])assert.ok(mach.includes(h),'hit '+h);
 assert.match(mach,/data-hit="dial" tabIndex=\{0\} role="slider"/);assert.match(mach,/data-hit="lever" tabIndex=\{0\} role="button"/);
 assert.match(exp,/if\(id==='dial'&&dir\)\{e\.preventDefault\(\);setEra\(stepEra/,'arrow keys turn the focused dial');assert.match(exp,/if\(id==='lever'&&\(e\.key===' '\|\|e\.key==='Enter'\)\)/,'Enter / Space pulls the lever');
 const EMOJI=/\p{Extended_Pictographic}|️/u,ARROW=/[▶▸◀◂►→←➡⬅✅❌✔✖⟲⟳]/u;
 for(const [f,t] of Object.entries(src)){assert.doesNotMatch(t,EMOJI,'no emoji in '+f);assert.doesNotMatch(code(t),ARROW,'no glyph arrows in '+f);}
 assert.match(exp,/<StepIcon kind="next"\/>/);
 assert.ok(fs.existsSync(path.join(root,'app/museum-lab/offside-rules/page.tsx')));assert.match(read('app/museum-lab/offside-rules/page.tsx'),/guardLabRoute\(\)/);
 const idx=read('components/museum/experiences/index.tsx');assert.match(idx,/'offside-rules':load\(\(\)=>import\('\.\/offside-rules\/Experience'\)\)/);assert.match(idx,/IDS=\[[^\]]*'offside-rules'/);
 assert.ok(!/@gmail|khoa/i.test(Object.values(src).join('\n')));
 console.log('PASS contract: Paper room + shared Back, one centred start, check then ending then onComplete once, shared loop only (0 frames at rest, reduced = instant), 44 px+, keys, no emoji, registered + lab');}
console.log('museum-exp-offside-rules: all passed');
