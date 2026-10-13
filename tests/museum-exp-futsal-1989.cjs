// futsal-1989 · "Futsal's World Cup" (Oct 12 2026: drawn with the anatomy kit in the Paper theme, no pixel art; was a pixel game, Oct 10 2026; user: every exhibit but penalty-1891,
// worldcup-1930 and the ball display becomes an immersive mini-game the child ACTS in; docs/museum-pixel-iso.md). Replaces the
// Oct 5–10 cordel / modern-gallery versions. Checks: the verified facts and sources are kept and shown; the drop rig's physics
// lands inside the Laws' bounce bands; the rondo teaches WHY the ball is low (the futsal ball can be passed hard and still
// trapped with the sole, the grass ball only in a narrow soft window, and soft passes get cut out); the scenes draw in the
// museum palette only; the shared contract; heat and reduced motion.
// usage: node tests/museum-exp-futsal-1989.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/futsal-1989/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),C=require('../'+dir+'content.ts'),M=require('../'+dir+'model.ts');
const exp=read(dir+'Experience.tsx'),model=read(dir+'model.ts'),css=read('components/museum/experiences/anatomy/paper.module.css'),rig=read(dir+'Rig.tsx'),court=read(dir+'Court.tsx');

// 1. Facts and sources.
{const e=X.EXHIBITS.find(x=>x.id==='futsal-1989');
 assert.match(e.facts[0],/Montevideo, Uruguay, in 1930.*Juan Carlos Ceriani/);assert.match(e.facts[1],/Netherlands in 1989, and Brazil won it/);assert.match(e.facts[2],/low-bounce ball/);
 assert.match(exp,/const \[ceriani,brazil,lowBall\]=exhibit\.facts;/);for(const v of ['{ceriani}','{brazil}','{lowBall}','{exhibit.forYourGame}'])assert.ok(exp.includes(v),v+' is shown');
 const more=C.MORE_FACTS.map(f=>f.text).join(' ');
 for(const f of ['Brazil beat the hosts, the Netherlands, 2–1','Rotterdam','16 teams','between 50 and 65 cm','62–64 cm around','400–440 g','120–165 cm','38–42 m long and 20–25 m wide','100–110 m long and 64–75 m wide','basketball, handball and water polo','defender (fixo), two wingers (alas) and a forward (pivô)','switch positions at any time'])
  assert.ok(more.includes(f),'kept fact: '+f);
 assert.match(exp,/MORE_FACTS\.map/);
 for(const u of ['https://www.fifa.com/en/articles/brazil-netherlands-first-final-1989','https://inside.fifa.com/innovation/standards/footballs/fifa-quality-programme-for-footballs','https://www.theifab.com/laws/latest/the-field-of-play/'])assert.ok(C.NEW_SOURCES.some(s=>s.url===u),'cited: '+u);
 assert.ok(e.sources.some(s=>/Futsal-Laws-of-the-Game/.test(s.url))&&e.sources.some(s=>/wiki\/Futsal$/.test(s.url)));
 assert.match(exp,/\[\.\.\.exhibit\.sources,\.\.\.NEW_SOURCES\]/);assert.match(exp,/<summary>Sources<\/summary>/);
 assert.match(C.MODEL_NOTE,/game model.*not a measurement of real matches/);assert.match(exp,/MODEL_NOTE/);
 console.log('PASS facts: case facts, the Laws’ numbers, court sizes, positions and 1989 kept and shown; sources cited; model labelled');}

// 2. The drop rig: real gravity, each ball's bounce band from the Laws.
{assert.equal(C.BALL.drop,200);const d=M.settleDrop(M.newDrop());const f=M.reboundCm(d.balls.futsal),g=M.reboundCm(d.balls.grass);
 assert.ok(f>=C.BALL.futsal.lo&&f<=C.BALL.futsal.hi,'futsal rebound in Law 2’s 50–65 cm: '+f);assert.ok(g>=C.BALL.grass.lo&&g<=C.BALL.grass.hi,'grass rebound in 120–165 cm: '+g);
 assert.ok(d.balls.futsal.rest&&d.balls.grass.rest,'both come to rest (the loop can stop)');assert.ok(d.balls.grass.bounces>d.balls.futsal.bounces*2,'the grass ball keeps hopping');
 assert.ok(d.t<8,'the drop is over in seconds: '+d.t.toFixed(1));assert.equal(M.stepDrop(M.newDrop(),1/30),false,'nothing moves before DROP');
 console.log(`PASS drop rig: futsal ${f} cm (50–65), grass ${g} cm (120–165), both rest`);}

// 3. The rondo teaches why the ball is low.
{assert.ok(M.E.futsal<.6&&M.E.grass>.8);
 const maxHard=k=>M.CONTROL/(M.E[k]*M.SOLE);assert.ok(maxHard('futsal')>11&&maxHard('grass')<7.5,'the futsal ball can be passed far harder and still trapped');
 const seq=[1,3,2,0,1,3,2,0,1,3];const run=(k,v)=>M.playScript(k,seq.map(m=>[m,v]));
 for(const v of [7,8,9,10]){const r=run('futsal',v);assert.equal(r.passes,10,`futsal ball at ${v} m/s: ten traps (${r.passes}, ${r.why})`);}
 for(const v of [8,9,10]){const r=run('grass',v);assert.equal(r.passes,0,`grass ball at ${v} m/s squirts off the sole`);assert.equal(r.why,'bounced');}
 {const r=run('grass',6.8);assert.ok(r.passes>=8,'the grass ball works only in a soft window: '+r.passes);}
 {const r=run('futsal',5);assert.ok(r.lost>0&&r.why==='intercepted','soft passes get cut out');}
 // The press: hold the ball too long and you are tackled (real time only).
 {const r=M.newRondo('futsal',false);for(let i=0;i<30*6&&r.state==='hold';i++)M.stepRondo(r,1/30);assert.equal(r.why,'tackled');assert.ok(r.t>M.HOLD_MAX,'never before the hold clock runs out');}
 // A real-time round ends on the clock; reduced motion is turn-based (no clock, no press, the loop waits for each pass).
 {const r=M.newRondo('futsal',false);r.defs=[{x:30,y:30},{x:30,y:-30}];for(let i=0;i<2000&&M.stepRondo(r,1/30);i++){/* hold until time */}assert.ok(r.state==='over'||r.why==='tackled');}
 {const r=M.newRondo('futsal',true);assert.equal(M.stepRondo(r,1/30),false,'reduced: nothing runs while you hold the ball');assert.equal(r.clock,M.ROUND_S);}
 assert.equal(M.aim(M.newRondo('futsal'),3,-2.9).mate,1,'aim assist snaps onto the ala');assert.equal(M.powerOf(0),3);assert.equal(M.powerOf(100),12);
 console.log('PASS rondo: futsal ball traps at 7–10 m/s, grass ball bounces off above ~7, soft passes cut out, the press tackles, reduced = turn-based');}

// 4. The drawing: anatomy Paper kit, no pixel art; the rig shows each Law band; the court's aim turns dashed when too hard.
{for(const f of fs.readdirSync(path.join(root,dir)).filter(f=>/\.tsx?$/.test(f)))assert.doesNotMatch(read(dir+f),/pixeliso/,'no pixel kit in '+f);
 for(const src of [rig,court])assert.match(src,/from '\.\.\/anatomy\/paper-kit'/);
 assert.match(rig,/BALL\.futsal\.lo,BALL\.futsal\.hi/);assert.match(rig,/data-rebound=\{kind\}/);assert.match(rig,/onGuess\(kind\)/,'tap a ball to guess');
 assert.match(court,/soleOut\(r\.kind,aimV\.power\)>CONTROL/);assert.match(court,/strokeDasharray=\{hard\?/);
 console.log('PASS drawing: anatomy Paper rig (Law bands, rebound collars, guess) and court (aim turns dashed when too hard)');}

// 5. Contract.
{assert.match(exp,/export default function Experience\(\{exhibit,onClose,onComplete\}:ExperienceProps\)/);assert.match(exp,/<PaperRoom id="futsal-1989"/);assert.match(read('components/museum/experiences/anatomy/PaperRoom.tsx'),/data-museum-experience=\{id\}[\s\S]*role="dialog" aria-modal="true"|role="dialog" aria-modal="true"[\s\S]*data-museum-experience=\{id\}/);
 assert.match(read('components/museum/experiences/anatomy/PaperRoom.tsx'),/<ExperienceBack onClose=\{onClose\}\/>/);assert.doesNotMatch(exp,/NavigationButton|immediate/);assert.match(exp,/k==='Escape'\)\{e\.preventDefault\(\);onClose\(\)/);
 for(const h of ['data-phase','data-ball','data-passes','data-lost','data-drop','data-guess','data-futsal-drop','data-futsal-to-rondo','data-futsal-kickoff','data-futsal-score','data-museum-own-cue'])assert.ok(exp.includes(h),'hook '+h);
 assert.match(exp,/<Intro /);assert.match(exp,/<ScoreCover /);assert.match(exp,/<StepCheck key=\{games\} items=\{\[CHECK\]\}/);
 assert.equal((exp.match(/onComplete=\{onComplete\}/g)||[]).length,1,"onComplete only reaches the Ending");assert.doesNotMatch(exp,/onComplete(\?\.)?\(/,"never called directly");assert.match(exp,/<Ending reached=\{checked\} onComplete=\{onComplete\}/);
 assert.match(exp,/both&&!playing\?<button[^>]*data-futsal-score/,'the score screen (and its check) comes after both balls are played');
 assert.match(css,/-webkit-touch-callout:none/);assert.match(css,/\.screen\{[^}]*height:100dvh/);assert.match(css,/\.card\{[^}]*flex:1 1 auto/);
 for(const f of ['futsal.module.css','BounceLab.tsx','Match.tsx','Rotation.tsx','SoleTrap.tsx','sim.ts','Quiz.tsx','draw.ts','forms.tsx','spring.ts','trap.module.css'])assert.ok(!fs.existsSync(path.join(root,dir+f)),'old version gone: '+f);
 assert.ok(fs.existsSync(path.join(root,'app/museum-lab/futsal-1989/page.tsx')));
 console.log('PASS contract: Back/Escape, data hooks, intro → drop → rondo (both balls) → score + quick check, onComplete once');}

// 6. Heat.
{assert.doesNotMatch(exp+model+rig+court,/requestAnimationFrame|setInterval/);assert.match(exp,/usePaperLoop\([\s\S]*?stageRef,reduced\)/);
 assert.match(exp,/if\(!more\)endDrop\(\);return more;/,'the drop loop stops when both balls rest');assert.match(exp,/if\(!more&&r\.state==='over'\)endRound\(\);return more;/,'the round loop stops at full time');
 assert.match(exp,/if\(reduced\)\{settleDrop\(drop\.current\);endDrop\(\);/,'reduced motion: the drop lands at once');assert.match(exp,/newRondo\(k,reduced\)/,'reduced motion: turn-based rondo');
 console.log('PASS heat: no own rAF, loops stop when still, sleep off-screen; reduced motion resolves at once');}
