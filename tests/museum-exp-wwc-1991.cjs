// wwc-1991 · "The first Women's World Cup" (Oct 12 2026: drawn with the anatomy kit in the Paper theme, no pixel art; was a pixel game, Oct 10 2026; user: every exhibit but penalty-1891,
// worldcup-1930 and the ball display becomes an immersive mini-game the child ACTS in; docs/museum-pixel-iso.md). Replaces the
// Oct 5–10 constellation / paper-cut / modern-gallery versions. Checks: the verified facts and sources are kept and shown; the
// gates machine follows the real bans; the Akers game teaches the real winner (win the back pass, go round the keeper, score)
// and every chance can be scored, a straight run cannot; the scenes draw in the museum palette only with pickable parts; the
// shared contract (Back, Escape, data hooks, onComplete once at the real end); heat (no rAF outside the kit's loop, nothing at
// rest) and reduced motion.
// usage: node tests/museum-exp-wwc-1991.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/wwc-1991/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const D=require('../'+dir+'data.ts'),M=require('../'+dir+'model.ts'),X=require('../lib/endgame/museum.ts');
const exp=read(dir+'Experience.tsx'),model=read(dir+'model.ts'),css=read(dir+'wwc.module.css'),pcss=read('components/museum/experiences/anatomy/paper.module.css'),room=read('components/museum/experiences/anatomy/PaperRoom.tsx'),gates=read(dir+'Gates.tsx'),fin=read(dir+'Final.tsx');
const norm=s=>s.replace(/[’']/g,"'");

// 1. The verified facts (data.ts) are kept, and the experience shows them.
{const e=X.EXHIBITS.find(x=>x.id==='wwc-1991');
 assert.match(exp,/exhibit\.facts\.map/);assert.match(exp,/exhibit\.facts\[0\]/);assert.match(exp,/exhibit\.facts\[1\]/);assert.match(exp,/exhibit\.facts\[2\]/);
 assert.equal(D.TAKE_IT,e.forYourGame);assert.match(exp,/exhibit\.forYourGame/);assert.match(exp,/TAKE_IT/);
 assert.deepEqual(D.EDITIONS.map(x=>x.year),[1991,1995,1999,2003,2007,2011,2015,2019,2023,2027]);assert.deepEqual(D.EDITIONS.map(x=>x.teams),[12,12,16,16,16,16,24,24,32,32]);
 assert.deepEqual(D.titles(),[['USA',4],['Germany',2],['Norway',1],['Japan',1],['Spain',1]]);assert.match(exp,/EDITIONS\.map/,'every World Cup since is listed');
 const F=D.FINAL_1991;assert.equal(F.length,80);assert.equal(F.date,'30 November 1991');assert.equal(F.crowd,'63,000');
 assert.deepEqual(F.goals.map(g=>[g.min,g.team,g.who]),[[20,'USA','Michelle Akers'],[29,'Norway','Linda Medalen'],[78,'USA','Michelle Akers']]);assert.match(F.goals[2].how,/back pass/);
 assert.deepEqual(D.BANS.map(b=>[b.country,b.from,b.to]),[['England',1921,1971],['Brazil',1941,1979],['West Germany',1955,1970]]);
 assert.match(norm(D.BANS[0].before),/53,000 fans watched Dick, Kerr Ladies/);
 const C=D.CHINA_1991;assert.equal(C.dates,'16 to 30 November 1991');assert.match(C.opener,/Ma Li scored the first goal/);assert.match(C.minutes,/80 minutes/);
 assert.equal(D.TEAMS_1991.length,12);assert.equal(new Set(D.TEAMS_1991.map(t=>t.from)).size,6);
 for(const k of ['CHINA_1991.trial','CHINA_1991.opener','CHINA_1991.minutes','CHINA_1991.officialName','FINAL_1991.goals.map','BANS.map'])assert.ok(exp.includes(k),'shown: '+k);
 const urls=D.SOURCES.map(s=>s.url);assert.ok(urls.length>=20&&urls.every(u=>/^https:\/\//.test(u)));
 for(const k of ['1991_FIFA_Women%27s_World_Cup_final','Michelle_Akers','Bans_of_women','Decree-law_3,199','dick,-kerr','1988_FIFA'])assert.ok(urls.some(u=>u.toLowerCase().includes(k.toLowerCase())),'source '+k);
 assert.match(exp,/\[\.\.\.exhibit\.sources,\.\.\.SOURCES\]/);assert.match(exp,/<summary>Sources<\/summary>/);
 assert.match(exp,/drawn for teaching and squeezed onto one screen/,'the game spots are labelled as drawn for teaching');
 console.log('PASS facts: data.ts kept (editions, final, bans, China 1991, 12 teams, sources) and shown');}

// 2. The gates machine follows the real bans.
{const L=M.locked;
 assert.equal(L('ENG',1920),false,'1920: Dick, Kerr Ladies play');assert.equal(L('ENG',1921),true);assert.equal(L('ENG',1970),true);assert.equal(L('ENG',1971),false);
 assert.equal(L('BRA',1940),false);assert.equal(L('BRA',1941),true);assert.equal(L('BRA',1979),false);assert.equal(L('GER',1955),true);assert.equal(L('GER',1970),false);
 assert.equal(L('FIFA',1990),true);assert.equal(L('FIFA',1991),false,'the World Cup gate opens in 1991');
 for(const y of [1920,1950,1985,1991])assert.equal(M.yearAtX(M.xAtYear(y)),y,'lever position ↔ year');
 const g=M.newGates();g.year=1960;M.settleGates(g);assert.ok(g.open.ENG<.05&&g.open.BRA<.05&&g.open.GER<.05,'1960: all three gates locked');
 g.year=1975;M.settleGates(g);assert.ok(g.open.ENG>.95&&g.open.GER>.95&&g.open.BRA<.05,'1975: England and Germany open, Brazil still banned');
 g.year=1991;M.settleGates(g);assert.ok(g.reached&&g.open.FIFA>.95);
 assert.match(M.gateNews(1941).text,/Brazil, 1941/);assert.match(M.gateNews(1971).text,/England, 1971: The ban lasted 50 years/);assert.equal(M.gateNews(1991).kind,'good');
 console.log('PASS gates: England 1921–71, Brazil 1941–79, West Germany 1955–70 lock and unlock; the World Cup gate opens in 1991');}

// 3. The Akers game teaches the real winner, and is fair.
{assert.equal(M.CHANCES.length,5);assert.equal(M.ROUND,5);
 const sp=M.CHANCES.map(c=>c.speed);assert.ok(sp.every((v,i)=>!i||v>sp[i-1]),'each back pass is faster');
 for(const c of M.CHANCES){assert.ok(c.to.x<c.def.x&&Math.abs(c.to.x-c.keeper.x)<1.2,'every pass goes BACK to the keeper');assert.ok(c.to.y>M.POST_A&&c.to.y<M.POST_B);}
 M.CHANCES.forEach((c,i)=>{const p=M.simulate(c,M.demoRun(c));assert.equal(p.outcome,'goal','Show me scores chance '+(i+1));const pt=M.pointsOf(p);assert.ok(pt.round===50&&pt.press>0&&pt.total>150,'…round the keeper, pressing early: '+JSON.stringify(pt));});
 M.CHANCES.forEach((c,i)=>{const p=M.simulate(c,M.cleanRun(c.akers,[{x:-.5,y:M.MID}]));assert.notEqual(p.outcome,'goal','running straight at goal ignores the pass: chance '+(i+1));});
 {const c=M.CHANCES[0],p=M.simulate(c,M.cleanRun(c.akers,[{x:c.akers.x-.5,y:c.akers.y}]));assert.equal(p.outcome,'keeper','standing still: the keeper collects the back pass');}
 {const c=M.CHANCES[0],run=M.demoRun(c),a=M.simulate(c,run),b=M.simulate(c,run);assert.deepEqual([a.outcome,a.t],[b.outcome,b.t],'deterministic (reduced motion = the same result at once)');}
 assert.equal(M.GOAL_PTS+M.PRESS_PTS+M.ROUND_PTS,200);assert.deepEqual(M.pointsOf({outcome:'saved',press:1,roundK:true}),{total:0,press:0,round:0,goal:0});
 const r=M.cleanRun({x:0,y:0},[{x:10,y:0}]);assert.ok(r.length>30&&Math.abs(Math.hypot(r[1].x-r[0].x,r[1].y-r[0].y)-.25)<1e-9,'the finger path is resampled evenly');
 assert.ok(M.cleanRun({x:0,y:0},[{x:200,y:0}]).length<=161,'a run is at most 40 m');
 assert.ok(Math.abs(M.REAL_PASS.from.x-17)<1e-9&&Math.abs(M.REAL_PASS.to.x-3.5)<1e-9,'the real spots (AKERS_PLAY) are kept for the record');
 console.log('PASS Akers game: 5 faster back passes; Show me scores each (+press, +round the keeper); straight runs and standing still fail; deterministic');}

// 4. The drawing: anatomy Paper kit, no pixel art; the rail carries the bans; the final draws the pass, the run and the trail.
{for(const f of fs.readdirSync(path.join(root,dir)).filter(f=>/\.tsx?$/.test(f)))assert.doesNotMatch(read(dir+f),/pixeliso/,'no pixel kit in '+f);
 for(const src of [gates,fin])assert.match(src,/from '\.\.\/anatomy\/paper-kit'/);
 assert.match(gates,/BANS\.map/);assert.match(gates,/locked\(gt\.id,g\.year\)/);assert.match(gates,/data-slider=\{g\.year\}/);
 assert.match(fin,/data-pass/);assert.match(fin,/data-run/);assert.match(fin,/data-peg="akers"/);assert.match(fin,/data-peg="keeper"/);
 console.log('PASS drawing: anatomy Paper gates (bans on the rail, padlocks, slider) and final (pass, run, Akers / keeper)');}

// 5. The shared contract.
{assert.match(exp,/export default function Experience\(\{exhibit,onClose,onComplete\}:ExperienceProps\)/);
 assert.match(exp,/<PaperRoom id="wwc-1991"/);assert.match(room,/role="dialog" aria-modal="true" aria-label=\{ariaLabel\} data-museum-experience=\{id\}/);
 assert.match(room,/import ExperienceBack from '\.\.\/ExperienceBack'/);assert.match(room,/<ExperienceBack onClose=\{onClose\}\/>/);assert.doesNotMatch(exp,/NavigationButton|immediate/);
 assert.match(exp,/k==='Escape'\)\{e\.preventDefault\(\);onClose\(\)/);
 for(const h of ['data-phase','data-chance','data-result','data-score','data-wwc-to-final','data-wwc-go','data-wwc-next','data-wwc-year','data-museum-own-cue'])assert.ok(exp.includes(h),'hook '+h);
 assert.match(exp,/<Intro /);assert.match(exp,/<ScoreCover /);assert.match(exp,/<StepCheck key=\{games\} items=\{\[CHECK\]\}/);assert.equal(D.QUIZ[2].choices[D.QUIZ[2].right],'She chased a back pass and won it');
 // onComplete: only from the quick check (after five chances), and only once.
 assert.equal((exp.match(/onComplete=\{onComplete\}/g)||[]).length,1,"onComplete only reaches the Ending");assert.doesNotMatch(exp,/onComplete(\?\.)?\(/,"never called directly");assert.match(exp,/<Ending reached=\{checked\} onComplete=\{onComplete\}/);assert.match(exp,/onDone=\{\(\)=>setChecked\(true\)\}/);
 assert.match(exp,/phase==='score'\?<ScoreCover/,'the check lives on the score cover');
 assert.match(exp,/usePaperLoop/);assert.match(exp,/onPointerDown=\{onDown\}/);assert.match(exp,/ArrowLeft/);
 assert.match(pcss,/-webkit-touch-callout:none/);assert.match(pcss,/\.screen\{[^}]*height:100dvh/);assert.match(pcss,/\.card\{[^}]*flex:1 1 auto/);
 for(const f of ['AkersGame.tsx','China91.tsx','DarkYears.tsx','FinalReplay.tsx','Quiz.tsx','shapes.tsx','spring.ts','icons.tsx'])assert.ok(!fs.existsSync(path.join(root,dir+f)),'old version gone: '+f);
 assert.ok(fs.existsSync(path.join(root,'app/museum-lab/wwc-1991/page.tsx')),'the museum-lab preview route stays');
 console.log('PASS contract: Back/Escape, data hooks, intro → game → score screen + quick check, onComplete once at the real end');}

// 6. Heat and reduced motion.
{const all=exp+model+gates+fin;assert.doesNotMatch(all,/requestAnimationFrame|setInterval/,'no own loop: only the shared Paper loop');
 assert.match(exp,/usePaperLoop\([\s\S]*?stageRef,reduced\)/,'the loop sleeps off-screen (observed)');
 assert.match(exp,/return moving;/,'the gate loop stops when the gates are still');assert.match(exp,/if\(!more\)\{finish\(\);return false;\}/,'the run loop stops at the whistle');
 assert.match(exp,/useReduced\(\)/);assert.match(exp,/Draw her run: it plays at once/,'reduced motion: the run resolves at once');
 // The loop the hook builds: no frames at rest; reduced = settles synchronously.
 const LP=require('../components/museum/experiences/anatomy/paper-loop.ts');let n=0;const l=LP.createPaperLoop(()=>++n<5,{reduced:true});l.wake();assert.equal(n,5);assert.ok(!l.running);
 console.log('PASS heat: no rAF of its own, loops stop when still, sleep off-screen; reduced motion resolves turn by turn');}
