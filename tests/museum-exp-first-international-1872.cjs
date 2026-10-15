// first-international-1872 "The first international" (Oct 14 2026 redo: THE MATCH ANALYSER, an anatomy-kit instrument).
// Covers: the case facts and sources (30 Nov 1872, Hamilton Crescent, Partick, 0-0, 4,000, England 1-1-8 v Scotland 2-2-6, all
// Queen's Park, The Graphic's "adepts in passing"); every control's effect in the model (the STYLE LEVER picks the team and the
// move, the CRANK winds the move through, the PASS-LENGTH KNOB decides the passes: 10 m stuck, 20 m a chance, 30/40 m cut out,
// the GAIN/TIME dials, LIFT THE LINES racks each line, the SCOREBOARD's real 0-0); the exhibit contract (PaperRoom + Back, ONE
// centred start, StepCheck → Ending → onComplete once, no rAF in the folder (shared paper-loop only, reduced motion passed), 44 px
// hit targets, keyboard on every control, no emoji, registered + lab route).
// usage: node tests/museum-exp-first-international-1872.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/first-international-1872',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),M=require(`../${dir}/model.ts`),C=require(`../${dir}/content.ts`);
const files=fs.readdirSync(path.join(root,dir)),src=read(`${dir}/Experience.tsx`),an=read(`${dir}/Analyser.tsx`),all=files.map(f=>read(`${dir}/${f}`)).join('\n');

// 1. Facts and sources.
{const e=X.EXHIBITS.find(x=>x.id==='first-international-1872');assert.ok(e);assert.equal(e.gallery,'firsts');assert.equal(e.year,'1872');assert.equal(e.need,0);
 const t=e.facts.join(' ');for(const re of [/30 November 1872/,/Hamilton Crescent/,/Partick/,/0–0/,/4,000/,/1-1-8/,/2-2-6/,/Queen’s Park/,/adepts in passing/])assert.match(t,re);
 for(const s of [...e.sources,...C.SOURCES])assert.match(s.url,/^https:\/\//);
 for(const re of [/1872_Scotland_v_England_football_match/,/Hamilton_Crescent/,/Passing_\(association_football\)/])assert.ok(e.sources.some(s=>re.test(s.url)),'source '+re);
 assert.match(C.GRAPHIC_QUOTE,/adepts in passing the ball/);assert.equal(C.STORY.length,4);assert.match(C.MODEL_NOTE,/made-up moves.*0–0/);
 for(const q of C.QUIZ){assert.ok(q.answer>=0&&q.answer<q.options.length);}assert.ok(new Set(C.QUIZ.map(q=>q.answer)).size>1,'answers are not all in one place');
 assert.match(src,/exhibit\.facts\.map/);assert.match(src,/exhibit\.forYourGame/);assert.match(src,/\[\.\.\.SOURCES,\.\.\.exhibit\.sources\]/);assert.match(src,/MODEL_NOTE/);
 console.log('PASS facts: 30 Nov 1872, Hamilton Crescent (Partick), 0–0, 4,000, 1-1-8 v 2-2-6, Queen’s Park, “adepts in passing”; sourced; the model note');}

// 2. The real line-ups, and LIFT THE LINES.
{const rows=team=>['back','half','fwd'].map(r=>M.PLAYERS.filter(p=>p.team===team&&p.role===r).length);
 assert.equal(M.PLAYERS.length,22);assert.deepEqual(rows('scotland'),[2,2,6]);assert.deepEqual(rows('england'),[1,1,8]);
 assert.equal(M.shapeOf('scotland'),'2-2-6');assert.equal(M.shapeOf('england'),'1-1-8');
 for(const team of ['scotland','england']){const xs=M.LINES[team].map(l=>M.RACK_X[team][l.role]);assert.deepEqual([...xs].sort((a,b)=>a-b),xs,'rack rows read from the keeper up');
  const zs=M.LINES[team].map(l=>M.LIFT_LEVEL[l.role]);assert.deepEqual([...zs].sort((a,b)=>a-b),zs,'each line rides higher');}
 const i=M.PLAYERS.findIndex(p=>p.id==='e7');assert.equal(M.rackOf(i).x,M.RACK_X.england.fwd);
 assert.match(an,/LIFT_LEVEL\[pl\.role\]\*LIFT_H\*lift/,'pieces rise with the slider');assert.match(an,/data-line-tag/,'each lifted line is labelled');
 assert.match(an,/'Goalkeeper':`\$\{ln\.n\} \$\{ln\.name\}`/);
 console.log('PASS lines: Scotland 2-2-6, England 1-1-8; LIFT THE LINES racks keeper → backs → half-backs → forwards, rising, labelled');}

// 3. The STYLE LEVER, the CRANK and the PASS-LENGTH KNOB.
{assert.equal(M.styleOfLever(M.LEVER_ANGLES.dribble),'dribble');assert.equal(M.styleOfLever(M.LEVER_ANGLES.pass),'pass');
 assert.equal(M.STYLE_TEAM.dribble,'england');assert.equal(M.STYLE_TEAM.pass,'scotland');
 // the crank: three turns wind the whole move; quarter-turn detents
 assert.equal(M.fracOfCrank(0),0);assert.equal(M.fracOfCrank(360*M.TURNS),1);assert.equal(M.fracOfCrank(540),.5);assert.equal(M.snapCrank(100),90);assert.equal(M.snapCrank(-50),0);
 const d=M.dribblePlay();assert.equal(d.outcome.kind,'lost');assert.ok(d.snaps.some(s=>s.event==='pickup'),'backing up: a teammate picks up the loose ball');
 assert.ok(d.snaps.filter(s=>s.event==='tackle').length>=2);assert.equal(d.snaps.at(-1).event,'clear');
 const f0=M.frameAt(d,0),fh=M.frameAt(d,.5),f1=M.frameAt(d,1);assert.equal(f0.gain,0);assert.ok(fh.gain>0&&fh.gain<=f1.gain,'GAIN grows as you crank');assert.ok(f1.time>fh.time&&fh.time>0,'TIME runs');
 assert.ok(Math.abs(M.frameAt(d,1).pos[0].x-d.snaps.at(-1).pos[0].x)<1e-9);
 // the knob: four detents, each a different lesson
 assert.deepEqual([...M.PASS_LENGTHS],[10,20,30,40]);assert.equal(M.knobIndex(M.KNOB_ANGLES[1]+10),1);
 const P=M.PASS_LENGTHS.map(n=>M.passPlay(n));
 assert.equal(P[0].outcome.kind,'lost');assert.equal(P[0].outcome.passes,0);assert.equal(P[0].snaps.at(-1).event,'stuck','10 m: nobody in reach');
 assert.equal(P[1].outcome.kind,'chance','20 m: short sure passes reach a chance');assert.ok(P[1].outcome.passes>=4);
 assert.equal(P[2].snaps.at(-1).event,'cut','30 m: a hopeful long kick is cut out');assert.equal(P[3].snaps.at(-1).event,'cut','40 m: cut out at once');
 for(const p of P)for(let k=1;k<p.snaps.length;k++){const s=p.snaps[k];if(s.event==='pass'||s.event==='chance')assert.ok(M.dist(p.snaps[k-1].ball,s.ball)<=p.len+2,'no pass longer than the knob');}
 // the lesson: passing goes further, faster
 assert.ok(P[1].outcome.gain>d.outcome.gain&&P[1].outcome.seconds<d.outcome.seconds,`passing ${P[1].outcome.gain} m in ${P[1].outcome.seconds} s beats dribbling ${d.outcome.gain} m in ${d.outcome.seconds} s`);
 const mid=M.frameAt(P[1],.5);assert.ok(mid.air>=0);assert.ok(M.frameAt(P[1],1).gain>=50);
 assert.equal(M.playOf('dribble',40).style,'dribble');assert.equal(M.playOf('pass',20).outcome.kind,'chance');
 console.log(`PASS controls: lever picks England (dribble) or Scotland (pass); crank 3 turns, ¼-turn detents; knob 10 stuck · 20 chance · 30/40 cut out; dials: passing ${P[1].outcome.gain} m in ${P[1].outcome.seconds} s v dribbling ${d.outcome.gain} m in ${d.outcome.seconds} s`);}

// 4. The tasks and the scoreboard.
{assert.deepEqual(M.TASKS.map(t=>t.id),['dribble','pass','lines','score']);
 assert.match(src,/tick\('dribble'\)/);assert.match(src,/o\.kind==='chance'[^;]*;[^;]*;tick\('pass'\)/);assert.match(src,/tick\('lines'\)/);assert.match(src,/tick\('score'\)/);
 assert.match(src,/Full time: Scotland 0, England 0/);assert.match(an,/data-shown=\{f>=1\?'0':'-'\}/,'the flip cards show 0 and 0 once flipped');
 assert.match(src,/disabled=\{!allDone\}/,'the quick check opens after the four tasks');
 console.log('PASS tasks: dribble, a passing chance, lift the lines, flip the scoreboard to 0–0; then the quick check');}

// 5. Contract, heat, accessibility, style.
{assert.match(src,/<PaperRoom id="first-international-1872"/);assert.match(read('components/museum/experiences/anatomy/PaperRoom.tsx'),/<ExperienceBack/);
 assert.equal((src.match(/<StartDock /g)||[]).length,1,'ONE start button (StartDock)');assert.doesNotMatch(src,/data-start[ =]/);
 assert.match(src,/<StepCheck/);assert.match(src,/<Ending reached=\{checked\} onComplete=\{onComplete\}/);assert.doesNotMatch(src,/onComplete(\?\.)?\(/);
 assert.doesNotMatch(all,/requestAnimationFrame|setInterval\(/,'no frame loop of its own');assert.match(src,/usePaperLoop\([\s\S]*?,cardRef,reduced\)/,'the shared loop, reduced motion = land at once');
 assert.match(src,/return mv;\}/,'the loop stops when nothing moves');
 for(const c of ['crank','knob','lever','slider','board'])assert.ok(an.includes(`c:'${c}'`),'hit target '+c);
 assert.equal((an.match(/r:Math\.max\(2[46],/g)||[]).length,5,'every hit target is at least 48 px across');
 assert.match(an,/tabIndex=\{0\}/);assert.match(an,/onKeyDown=\{e=>onKey\(H\.c,e\)\}/);for(const k of ['ArrowRight','ArrowLeft','Enter','Home','End'])assert.ok(src.includes(`'${k}'`),'key '+k);
 const emoji=/[←↑↓-⇿⌀-⏿■-➿⬀-⯿\u{1F000}-\u{1FAFF}️]/u;for(const f of files)assert.doesNotMatch(read(`${dir}/${f}`),emoji,'no emoji / glyph arrows in '+f);
 assert.ok(fs.existsSync(path.join(root,'app/museum-lab/first-international-1872/page.tsx')));
 const idx=read('components/museum/experiences/index.tsx');assert.match(idx,/'first-international-1872':load\(/);assert.match(idx,/IDS=\[[^\]]*'first-international-1872'/);
 assert.ok(!/@gmail|khoa/i.test(all));
 console.log('PASS contract: PaperRoom + Back, one centred start, check → ending → onComplete once, shared loop only (0 rAF at rest), reduced motion, 48 px targets, keys, no emoji, registered + lab');}
console.log('museum-exp-first-international-1872: all passed');
