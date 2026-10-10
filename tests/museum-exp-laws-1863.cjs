// laws-1863 "The Living Rulebook": facts, the year-by-year rule threads, the word diff, Back, heat and sources.
// usage: node tests/museum-exp-laws-1863.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/laws-1863/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),L=require('../'+dir+'laws.ts');
const exp=read(dir+'Experience.tsx'),css=read(dir+'Experience.module.css');

// 1. The case's own facts, take-it-to-your-game line and sources are all shown.
{const e=X.EXHIBITS.find(x=>x.id==='laws-1863');assert.ok(e);
 assert.match(exp,/exhibit\.facts\.join/,'the three case facts are printed in the standfirst');
 assert.match(exp,/exhibit\.forYourGame/,'take it to your game');
 assert.match(exp,/exhibit\.sources/,'the case sources are listed');
 assert.ok(e.facts.some(f=>/1886/.test(f))&&/1886/.test(exp),'IFAB 1886 shown on the masthead');
 console.log('PASS case facts, your-game line and case sources');}

// 2. The threads: true, dated, in order, ending with today's Laws; the key history is there.
{const {THREADS,MILESTONES,TODAY}=L;assert.equal(THREADS.length,6);
 for(const t of THREADS){assert.equal(t.versions[0].year,1863,t.id+' starts in 1863');assert.ok(t.versions[0].old);assert.equal(t.versions.at(-1).year,TODAY,t.id+' ends today');
  for(let i=1;i<t.versions.length;i++)assert.ok(t.versions[i].year>t.versions[i-1].year,t.id+' in date order');
  for(const v of t.versions){assert.ok(v.text.length>20&&v.why.length>20);assert.ok(MILESTONES.some(m=>m.year===v.year),`${t.id} ${v.year} is a stop on the year rule`);}}
 const at=(id,y)=>{const t=THREADS.find(x=>x.id===id);return t.versions[L.versionIndexAt(t,y)];};
 assert.match(at('goal',1863).text,/without any tape or bar/);assert.match(at('goal',1866).text,/tape/);assert.match(at('goal',1882).text,/crossbar/);
 assert.match(at('goal',TODAY).text,/7\.32 metres.*2\.44 metres.*whole ball crosses the whole goal line/);
 assert.match(at('offside',1863).text,/nearer to the opponent’s goal line is out of play/);assert.match(at('offside',1866).text,/three/);assert.match(at('offside',1925).text,/two/);assert.match(at('offside',1990).text,/Level/);
 assert.match(at('hands',1863).text,/fair catch/);assert.match(at('hands',1871).text,/goalkeeper/);assert.match(at('hands',1912).text,/penalty area/);
 assert.match(at('hands',1992).why,/Since 1992, a goalkeeper may not pick up the ball when a team-mate deliberately kicks it back to them/,'quotes the back-pass case');
 assert.match(at('players',1863).text,/say nothing of how many players/);assert.match(at('players',1897).text,/eleven/);assert.match(at('players',TODAY).text,/fewer than seven/);
 assert.match(at('throw',1863).text,/first player who touches it/);assert.match(at('throw',1873).text,/side opposite to the one that kicked it out/,'1873: the throw goes to the other team (no more race)');assert.ok(!/both hands/.test(at('throw',1882).text),'two hands only from 1883');assert.match(at('throw',1883).text,/both hands/);
 assert.match(at('fair',1863).text,/Neither tripping nor hacking/);assert.match(at('fair',1891).why,/William McCrum/);assert.match(at('fair',1970).why,/1970 World Cup in Mexico/);assert.match(at('fair',2018).why,/2018, in Russia/);
 assert.equal(L.milestoneAt(1924).year,1912);assert.equal(L.yearLabel(TODAY),'Today');assert.equal(L.eraOf(1863),'letterpress');assert.equal(L.eraOf(1925),'book');assert.equal(L.eraOf(1990),'modern');
 console.log('PASS six rules, 1863 to today, dated and true');}

// 3. The word morph keeps unchanged words and only rewrites the rest.
{const d=L.diffWords('at least three of his opponents','at least two of his opponents');
 assert.deepEqual(d.map(t=>t.kind),['same','same','del','add','same','same','same']);
 assert.equal(d.filter(t=>t.kind!=='del').map(t=>t.w).join(' '),'at least two of his opponents');
 for(const t of L.THREADS)for(let i=1;i<t.versions.length;i++){const d=L.diffWords(t.versions[i-1].text,t.versions[i].text);assert.equal(d.filter(x=>x.kind!=='del').map(x=>x.w).join(' '),t.versions[i].text.split(/\s+/).join(' '));}
 console.log('PASS word diff rebuilds every new rule exactly');}

// 4. Contract: root, Back, keyboard, sound.
{assert.match(exp,/data-museum-experience="laws-1863"/);assert.match(exp,/role="dialog" aria-modal="true"/);assert.match(css,/\.root\{[^}]*position:fixed;inset:0;z-index:20/);
 assert.match(exp,/import ExperienceBack from '\.\.\/ExperienceBack'/,'uses the shared ExperienceBack');assert.match(exp,/<ExperienceBack onClose=\{onClose\}\/>/);
 assert.ok(!/NavigationButton/.test(exp),'no local NavigationButton Back');assert.ok(!/\.back\{/.test(css),'no local Back wrapper/positioning');
 assert.equal((exp.match(/<ExperienceBack/g)||[]).length,1,'exactly one Back');
 assert.match(exp,/key==='Escape'/);assert.match(exp,/type="range"/);assert.match(exp,/aria-valuetext/);
 assert.match(exp,/museumSfx\.stamp\(\)/,'sound goes through museumSfx (respects mute)');assert.ok(!/new AudioContext/.test(exp));
 assert.ok(/min-width:44px;min-height:44px/.test(css)&&/\.step\{[^}]*width:48px;height:48px/.test(css),'controls ≥ 44 px');
 assert.ok(!/(^|\})\s*(button|input|a|p|span)[\s:{]/m.test(css),'every CSS-module selector carries a local class');
 assert.match(css,/\.ruler\{[^}]*touch-action:none/,'the year rule owns its drag on touch');assert.match(exp,/setPointerCapture/,'pointer-captured drag');
 assert.match(css,/\.pageBtn\{width:44px;height:44px/,'deck dots are 44 px targets');assert.match(css,/@media \(hover:hover\)/,'hover styles only where hover exists');
 console.log('PASS contract: fixed dialog root, shared ExperienceBack, Escape, accessible slider, touch drag, 44 px targets, muted-aware sound');}

// 5. Heat: no animation loop, no polling, timers cleared, reduced motion honoured, sources cited.
{assert.ok(!/requestAnimationFrame|setInterval/.test(exp),'no render loop or polling: only one-shot CSS animations');
 assert.ok((exp.match(/return\(\)=>clearTimeout\(t\)/g)||[]).length>=1,'the morph clean-up timer is cleared');
 assert.match(exp,/removeEventListener\('keydown'/);assert.match(exp,/removeEventListener\('change'/);
 assert.ok(!/infinite/.test(css),'no infinite CSS animation');assert.match(css,/prefers-reduced-motion:reduce/);assert.match(exp,/prefers-reduced-motion: reduce/);
 assert.ok(L.LAW_SOURCES.length>=12&&L.LAW_SOURCES.every(s=>/^https:\/\//.test(s.url)));
 for(const u of ['wikisource.org/wiki/Laws_of_the_Game_(1863)','theifab.com/laws/latest/offside/','theifab.com/laws/latest/the-players/'])assert.ok(L.LAW_SOURCES.some(s=>s.url.includes(u)),u+' cited');
 assert.match(exp,/<summary>Sources<\/summary>/);
 console.log('PASS heat: no loop, no polling, timers and listeners cleaned up; sources cited');}

// 6. Oct 9 2026 styles + motion pass: "Still a rule?" sorter, Victorian print styling, spring physics that sleep.
{const S=require('../'+dir+'sort.ts'),SP=require('../'+dir+'spring.ts'),sorter=read(dir+'Sorter.tsx'),spring=read(dir+'spring.ts');
 // The cards: eight 1863 Laws, true to the 1863 text, sorted against today's IFAB Laws; half kept, half changed.
 assert.equal(S.SORT_CARDS.length,8);assert.equal(S.SORT_CARDS.filter(c=>c.kept).length,4,'four survived, four changed');
 const by=id=>S.SORT_CARDS.find(c=>c.id===id);
 assert.ok(by('kickoff').kept&&/Law 8/.test(by('kickoff').now),'1863 Law III: the side that lost the goal kicks off — still Law 8');
 assert.ok(!by('ends').kept&&/half-time/.test(by('ends').now),'1863 Law III: change ends after each goal — now only at half-time');
 assert.ok(by('ten').kept&&/9\.15/.test(by('ten').now),'1863 Law II: 10 yards at kick-off — 9.15 m today');
 assert.ok(!by('height').kept&&/1866/.test(by('height').now)&&/1882/.test(by('height').now));
 assert.ok(by('trip').kept&&/Law 12/.test(by('trip').now));assert.ok(by('nails').kept&&/Law 4/.test(by('nails').now));
 assert.ok(!by('offside').kept&&!by('throw').kept&&/Law 15/.test(by('throw').now));
 for(const c of S.SORT_CARDS){assert.ok(c.then.length>20&&c.now.length>20&&c.short.length<34);if(c.thread)assert.ok(L.THREADS.some(t=>t.id===c.thread),c.id+' opens a real rule');if(c.year)assert.ok(L.MILESTONES.some(m=>m.year===c.year),c.id+' opens a year on the rule');}
 for(const u of ['Laws_of_the_Game_(1863)_(as_submitted_for_adoption)','the-players-equipment','the-start-and-restart-of-play'])assert.ok(S.SORT_SOURCES.some(s=>s.url.includes(u)),u+' cited');
 assert.ok(!L.LAW_SOURCES.some(s=>/Laws_of_the_Game_\(1863\)'?$/.test(s.url)),'the deleted Wikisource page is no longer cited');
 assert.match(exp,/\.\.\.SORT_SOURCES/,'sorter sources are listed');
 assert.match(S.sortVerdict(8,8),/Every one/);assert.match(S.sortVerdict(3,8),/surprised/);
 // The mechanic: drag/flick, keyboard and buttons; a live verdict; the wrong guess hops to the right tray (FLIP); see it in the rulebook.
 assert.match(sorter,/onPointerDown=\{down\} onPointerMove=\{move\} onPointerUp=\{up\} onPointerCancel=\{up\} onKeyDown=\{key\}/);assert.match(sorter,/setPointerCapture/);
 assert.match(sorter,/e\.key==='ArrowLeft'/);assert.match(sorter,/onClick=\{\(\)=>throwTo\('changed'\)\}/);assert.match(sorter,/onClick=\{\(\)=>throwTo\('kept'\)\}/);
 assert.match(sorter,/aria-live="polite"/);assert.match(sorter,/x<-w\*\.3\|\|vx<-650/,'past 30% or a flick');assert.match(sorter,/P\.x\.v=vx;P\.y\.v=vy/,'release velocity carried into the spring');
 assert.match(sorter,/rubber\(e\.clientY-d\.y0/,'vertical rubber band');assert.match(sorter,/el\.animate\(\[\{transform:`translate\(\$\{dx\}px,\$\{dy\}px\)`\}/,'FLIP');
 assert.match(sorter,/setPlaced\(list=>list\.map\(x=>x\.id===c\.id\?\{\.\.\.x,side:truth\(c\)\}:x\)\)/,'a wrong guess moves to the right tray');
 assert.match(exp,/<Sorter reduced=\{reduced\} onSee=\{see\}\/>/);assert.match(exp,/const see=useCallback/);
 assert.match(css,/\.slip\[data-top\]\{[^}]*touch-action:pan-y/,'the slip drag never fights page scroll');
 // Heat: the springs sleep. The only loop lives in spring.ts and stops itself when every spring rests; unmount stops it.
 assert.match(spring,/if\(tick\(dt\)\)raf=requestAnimationFrame\(f\);else stopped=true;/);assert.match(sorter,/useEffect\(\(\)=>\(\)=>\{anim\.current\?\.stop\(\);timers\.current\.forEach\(clearTimeout\);\},\[\]\)/);
 assert.ok(!/requestAnimationFrame|setInterval/.test(sorter),'no loop in the component itself');assert.match(sorter,/if\(reduced\|\|!el\|\|!bin\)\{commit\(c,guess\);return;\}/,'reduced motion: no throw');
 {const s=SP.spring(0);s.target=200;s.v=-900;let t=0,rest=false;while(!rest&&t<4){rest=SP.stepSpring(s,1/60,190,22,.5);t+=1/60;}assert.ok(rest&&s.x===200&&t<2,'the throw spring settles exactly and stops');}
 // Thin line art in motion (Oct 9 2026 restyle): one hairline, one accent, drawings that draw on, morph and draw off.
 {const LN=require('../'+dir+'lines.ts'),D=require('../'+dir+'drawings.ts'),lm=read(dir+'LineMorph.tsx');
  assert.ok(!fs.existsSync(path.join(root,'public/museum/experiences/laws-1863/fonts')),'the old print fonts are gone');
  assert.ok(!/font-face|LW Wood|LW Old|laws1863-ink|laws1863-hatch|feTurbulence/.test(css+exp),'no wood type, ink filter or hatching left');
  assert.match(css,/\.ln\{fill:none;stroke:var\(--ink\);stroke-width:var\(--sw\);vector-effect:non-scaling-stroke/,'one non-scaling hairline');
  assert.match(css,/--sw:1\.25px/);assert.match(css,/@media \(min-resolution:2dppx\)\{\.root\{--sw:1\.1px\}\}/,'weight tuned for DPR');
  assert.equal((css.match(/--accent:#/g)||[]).length,1,'exactly one accent colour');
  assert.match(css,/@keyframes draw\{from\{stroke-dashoffset:1\}to\{stroke-dashoffset:0\}\}/,'lines draw themselves on');assert.match(css,/@keyframes undraw/,'and off');
  assert.match(lm,/pathLength=\{st\.dash\?undefined:1\}/,'normalised path length for the draw-on');
  // Morph maths: resample keeps the ends and the count; mix interpolates; every rule has a drawing for every version.
  const r=LN.resample([[0,0],[10,0],[10,10]],5);assert.equal(r.length,5);assert.deepEqual(r[0],[0,0]);assert.deepEqual(r[4],[10,10]);
  assert.deepEqual(LN.mix([[0,0]],[[10,20]],.5),[[5,10]]);assert.match(LN.toPath([[0,0],[1,1],[2,0]],true),/^M0 0C/);
  for(const t of L.THREADS)for(let i=0;i<t.versions.length;i++){const d=D.ruleDrawing(t.id,i);assert.ok(Object.keys(d).length>=4,`${t.id} ${i} has a drawing`);
   assert.ok(Object.values(d).every(st=>st.pts.length>=2&&st.pts.every(p=>p.every(Number.isFinite))),`${t.id} ${i} strokes are finite`);}
  // The goal's top morphs: no bar in 1863, a sagging tape in 1866, a straight crossbar in 1882 (same stroke, so it morphs).
  assert.ok(!D.ruleDrawing('goal',0).bar&&D.ruleDrawing('goal',1).bar.smooth&&D.ruleDrawing('goal',2).bar.pts.length===2);
  assert.ok(D.ruleDrawing('players',1).a10&&!D.ruleDrawing('players',0).a10,'the eleventh player draws on in 1897');
  assert.ok(D.ruleDrawing('fair',2).card&&!D.ruleDrawing('fair',1).card,'the card appears in 1970');
  for(const c of S.SORT_CARDS){const st=D.CARD_STORY[c.id];assert.ok(st&&st.length===2,c.id+' has a two-state line story');}
  // The museum's own Hairline engine, read-only, for the masthead figure.
  assert.match(exp,/import\('\.\.\/timeline\/hairline\/figures'\)/);assert.match(exp,/mountFigure\(h,FIGURES\['laws-1863'\],true\)/);assert.match(exp,/f\?\.destroy\(\)/);
  // Heat: the morph loop only runs when points really move, and stops at rest; reduced motion shows finished drawings.
  assert.match(lm,/if\(reduced\|\|!moves\)\{write\(1\);return;\}/);assert.match(lm,/return !rest;/);assert.match(lm,/anim\.current\?\.stop\(\);timers\.current\.forEach\(clearTimeout\)/);
  assert.match(lm,/io\.disconnect\(\)/,'draw-on when seen, observer released');
  assert.ok(!/requestAnimationFrame|setInterval/.test(lm),'the only loop is spring.ts');
  const rm=css.slice(css.lastIndexOf('@media (prefers-reduced-motion:reduce){\n .ln'));assert.match(rm,/stroke-dasharray:none!important;stroke-dashoffset:0!important/,'reduced motion: finished drawings');
  // The verdict marks are lines that draw with the lean.
  assert.match(sorter,/className=\{s\.mark\} data-side="kept"/);assert.match(css,/\.sorter\[data-lean=kept\] \.mark\[data-side=kept\] svg\{stroke-dashoffset:0\}|\.sorter\[data-lean=changed\] \.mark\[data-side=changed\] svg,\.sorter\[data-lean=kept\] \.mark\[data-side=kept\] svg\{stroke-dashoffset:0\}/);
 }
 console.log('PASS styles+motion: "Still a rule?" sorter (8 checked Laws, drag/flick/keys, FLIP, springs that sleep), thin line art: draw-on, morph, Hairline masthead');}
