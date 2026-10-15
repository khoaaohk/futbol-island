// formations-history "Formations through time" (Oct 14 2026 redo: THE TACTICS MACHINE, an anatomy-kit pegboard instrument).
// Covers: the case facts and sources; the ERA SELECTOR's six shapes (each reads back as its numbers and sits in every green zone);
// the WIDTH and DEPTH sliders (squeezing or stretching sends the right needle out of the green, with the right words); the GAP
// needle and stacked pegs; the LIFT lever (lines → trays, counted from your own goal = the formation; lever ↔ lift); the BUILD
// switch (the swarm fails, a built 3-4-3 passes, pegs snap to the 4 m holes); the exhibit contract (PaperRoom + Back, ONE
// centred start, StepCheck → Ending → onComplete once, no rAF in the folder (shared paper-loop only, reduced motion passed),
// 44 px hit targets, keyboard on every control and peg, no emoji, registered + lab route).
// usage: node tests/museum-exp-formations-history.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/formations-history',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),M=require(`../${dir}/model.ts`),C=require(`../${dir}/content.ts`);
const files=fs.readdirSync(path.join(root,dir)),src=read(`${dir}/Experience.tsx`),mc=read(`${dir}/Machine.tsx`),all=files.map(f=>read(`${dir}/${f}`)).join('\n');

// 1. Facts and sources.
{const e=X.EXHIBITS.find(x=>x.id==='formations-history');assert.ok(e);assert.equal(e.gallery,'tactics');assert.equal(e.year,'1880s');assert.equal(e.need,0);
 const t=e.facts.join(' ');for(const re of [/2-3-5[^.]*1880/,/Herbert Chapman[^.]*WM/,/1925 offside/,/Brazil[^.]*1958[^.]*4-2-4/,/4-4-2[^.]*1990s/,/4-3-3|4-2-3-1/,/2-3-1 in 7v7/])assert.match(t,re);
 for(const s of [...e.sources,...C.SOURCES])assert.match(s.url,/^https:\/\//);
 for(const re of [/Formation_\(association_football\)/,/Herbert_Chapman/,/1958_FIFA_World_Cup/])assert.ok(e.sources.some(s=>re.test(s.url)),'source '+re);
 assert.ok(new Set(C.QUIZ.map(q=>q.answer)).size>1,'answers are not all in one place');
 assert.match(src,/exhibit\.facts\.map/);assert.match(src,/exhibit\.forYourGame/);assert.match(src,/\[\.\.\.SOURCES,\.\.\.exhibit\.sources\]/);
 assert.match(read('lib/paths/lessonGoals.ts'),/2-3-1/,'7v7 2-3-1 is the game’s own');assert.match(read('lib/paths/formatPaths.json'),/3-2-3/);
 console.log('PASS facts: 2-3-5 (1880), Chapman’s WM after 1925, Brazil’s 4-2-4 (1958), 4-4-2 (1990s), 4-3-3 / 4-2-3-1 today, youth shapes; sourced');}

// 2. The ERA SELECTOR: six detents, six shapes, each balanced.
{assert.deepEqual(M.ERAS.map(h=>h.shape),['2-3-5','3-2-2-3','4-2-4','4-4-2','4-3-3','4-2-3-1']);
 assert.deepEqual(M.ERAS.map(h=>h.when),['1880s','1920s–30s','1958','1990s','Today','Today']);
 assert.equal(M.ERA_ANGLES.length,M.ERAS.length);M.ERA_ANGLES.forEach((a,i)=>{assert.equal(M.eraIndex(a),i);assert.equal(M.eraIndex(a+12),i,'a detent catches a near turn');});
 for(const h of M.ERAS){assert.equal(h.pts.length,10,h.id);assert.equal(M.shapeOf(h.pts),h.shape,h.id+' reads back');const r=M.readShape(h.pts);
  assert.ok(r.all,`${h.shape} sits in every green zone: ${JSON.stringify([r.width,r.depth,r.gap])}`);assert.equal(h.lines.length,r.lines.length,h.id+' names every line');
  for(const p of h.pts)assert.ok(p.x>0&&p.x<100&&p.y>0&&p.y<64);}
 console.log('PASS era knob: six detents → 2-3-5 · WM · 4-2-4 · 4-4-2 · 4-3-3 · 4-2-3-1, each reads back and balances');}

// 3. The WIDTH and DEPTH sliders and the three needles.
{const base=M.ERAS[4].pts,wf=t=>M.factorOf(t,M.WIDTH_RANGE),df=t=>M.factorOf(t,M.DEPTH_RANGE);
 assert.ok(Math.abs(wf(M.tOf(1,M.WIDTH_RANGE))-1)<1e-9);assert.ok(Math.abs(df(M.tOf(1,M.DEPTH_RANGE))-1)<1e-9,'the sliders start at the shape as drawn');
 const narrow=M.readShape(M.warp(base,wf(0),1));assert.equal(narrow.ok.width,false);assert.match(narrow.say,/narrow/i);assert.ok(narrow.width<M.readShape(base).width);
 const flat=M.readShape(M.warp(base,1,df(0)));assert.equal(flat.ok.depth,false);assert.match(flat.say,/flat/i);
 const long=M.readShape(M.warp(base,1,df(1)));assert.equal(long.ok.depth,false);assert.match(long.say,/stretched/i);
 assert.equal(M.readShape(M.warp(base,1,1)).all,true);
 const hole=M.readShape(base.map((p,i)=>i>=4&&i<7?{x:p.x+18,y:p.y}:p));assert.equal(hole.ok.cover,false,'an empty midfield opens a gap');
 const stacked=M.readShape(base.map((p,i)=>i===1?{x:base[0].x+1,y:base[0].y+2}:p));assert.match(stacked.say,/on top of each other/);
 for(const k of ['width','depth','gap'])assert.ok(M.GAUGE_FULL[k]>=M.ZONES[k][1],'each dial shows its whole green zone');
 assert.match(mc,/zone:\[zones\[i\]\[0\]\/full\[i\]/,'the dials draw the green zones');
 console.log('PASS sliders + needles: squeeze → too narrow, compress → too flat, stretch → too stretched; gaps and stacked pegs fail COVER');}

// 4. The LIFT lever and the HISTORY / BUILD switch.
{assert.equal(M.liftOfLever(M.LIFT_ANGLES[0]),0);assert.equal(M.liftOfLever(M.LIFT_ANGLES[1]),1);assert.equal(M.leverOfLift(.5),0);
 assert.match(mc,/zLine=\(li:number\)=>\(li\+1\)\*LIFT_STEP\*v\.lift/,'each line rides its own tray, higher from your own goal');assert.match(mc,/data-tray=/);assert.match(mc,/data-line-tag=/);
 for(const h of M.ERAS){const ls=M.linesOf(h.pts);assert.equal(ls.map(l=>l.length).join('-'),h.shape,'counting the trays gives the formation');}
 assert.deepEqual(M.lineNames(3),['Defence','Midfield','Attack']);
 const sw=M.readShape(M.swarm());assert.equal(sw.all,false,'the swarm is not a shape');assert.equal(sw.ok.width,false);
 const built=[[18,10],[18,32],[18,54],[40,6],[40,24],[40,40],[40,58],[62,12],[66,32],[62,52]].map(([x,y])=>M.snapHole({x:x+1.3,y:y-1.1}));
 for(const p of built){assert.equal(p.x%M.HOLE,0);assert.equal(p.y%M.HOLE,0);}
 const rb=M.readShape(built);assert.equal(rb.shape,'3-4-3');assert.ok(rb.all,'a built 3-4-3 balances: '+rb.say);assert.equal(M.KNOWN['3-4-3'],'a 3-4-3');
 assert.deepEqual(Object.keys(M.SWITCH_ANGLES),['history','build']);assert.match(src,/st\.built=swarm\(\)/,'BUILD starts from the swarm');
 assert.match(src,/st\.mode==='build'&&s0\.moved|s0\.mode==='build'&&s0\.moved/,'only your own moves count');
 console.log('PASS lever + switch: lift 0 ↔ 1; trays read the formation; BUILD starts as a swarm, pegs snap to 4 m holes, a built 3-4-3 balances');}

// 5. Tasks, contract, heat, accessibility, style.
{assert.deepEqual(M.TASKS.map(t=>t.id),['eras','squeeze','lines','build']);for(const t of ['eras','squeeze','lines','build'])assert.ok(src.includes(`tick('${t}')`),'task '+t);
 assert.match(src,/disabled=\{!allDone\}/);
 assert.match(src,/<PaperRoom id="formations-history"/);assert.equal((src.match(/<StartDock /g)||[]).length,1,'ONE start button (StartDock)');assert.doesNotMatch(src,/data-start[ =]/);
 assert.match(src,/<StepCheck/);assert.match(src,/<Ending reached=\{checked\} onComplete=\{onComplete\}/);assert.doesNotMatch(src,/onComplete(\?\.)?\(/);
 assert.doesNotMatch(all,/requestAnimationFrame|setInterval\(/,'no frame loop of its own');assert.match(src,/usePaperLoop\([\s\S]*?,cardRef,reduced\)/);assert.match(src,/return mv;\},cardRef,reduced\)/);
 for(const c of ['knob','width','depth','lever','switch'])assert.ok(mc.includes(`c:'${c}'`),'hit target '+c);
 assert.equal((mc.match(/r:Math\.max\(24,/g)||[]).length,5);assert.match(mc,/c:`peg\$\{i\}`,at:[^}]*r:Math\.max\(22,/,'pegs: 44 px targets');
 assert.match(mc,/tabIndex=\{0\}/);for(const k of ['ArrowRight','ArrowLeft','ArrowUp','Enter','Home','End'])assert.ok(src.includes(`'${k}'`),'key '+k);
 const emoji=/[←↑↓-⇿⌀-⏿■-➿⬀-⯿\u{1F000}-\u{1FAFF}️]/u;for(const f of files)assert.doesNotMatch(read(`${dir}/${f}`),emoji,'no emoji / glyph arrows in '+f);
 assert.ok(fs.existsSync(path.join(root,'app/museum-lab/formations-history/page.tsx')));
 const idx=read('components/museum/experiences/index.tsx');assert.match(idx,/'formations-history':load\(/);assert.match(idx,/IDS=\[[^\]]*'formations-history'/);
 assert.ok(!/@gmail|khoa/i.test(all));
 console.log('PASS contract: four tasks open the check; PaperRoom + Back, one centred start, check → ending → onComplete once, shared loop only, reduced motion, 44 px, keys, no emoji, registered + lab');}
console.log('museum-exp-formations-history: all passed');
