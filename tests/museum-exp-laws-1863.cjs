// laws-1863 "Write the first Laws" (Oct 12 2026 anatomy Paper restyle of the Oct 10 game): the 1863 → today facts (laws.ts,
// sort.ts, refcalls.ts, story.ts) are kept and shown; THE RULE PRESS (tap a tray for ✓ / ✗, drag the lever, the card is stamped
// and slides into its tray) and REF THE MATCH (a peg film per moment on an 1863 or a today table-top pitch, a stopwatch to call
// it), drawn with the anatomy kit in the Paper theme (no pixel art); scoring; the exhibit contract (PaperRoom → ExperienceBack,
// data hooks, best key, onComplete only via the Ending after the quick check, no rAF in the exhibit, reduced motion
// turn-based, the full-screen card, lab route).
// usage: node tests/museum-exp-laws-1863.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/laws-1863/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),L=require('../'+dir+'laws.ts'),S=require('../'+dir+'sort.ts'),R=require('../'+dir+'refcalls.ts'),ST=require('../'+dir+'story.ts'),M=require('../'+dir+'model.ts');
const exp=read(dir+'Experience.tsx'),model=read(dir+'model.ts'),files=fs.readdirSync(path.join(root,dir)),room=read('components/museum/experiences/anatomy/PaperRoom.tsx'),css=read('components/museum/experiences/anatomy/paper.module.css'),loop=read('components/museum/experiences/anatomy/paper-loop.ts');

// 1. The case's facts, take-away and sources are shown; the story beats and every source list are used.
{const e=X.EXHIBITS.find(x=>x.id==='laws-1863');assert.ok(e&&e.facts.some(f=>/1886/.test(f)));
 assert.match(exp,/exhibit\.facts\.map/);assert.match(exp,/exhibit\.forYourGame/);assert.match(exp,/\[\.\.\.LAW_SOURCES,\.\.\.SORT_SOURCES,\.\.\.exhibit\.sources\]/);
 assert.match(exp,/beats=\{BEATS\}/);assert.equal(ST.BEATS.length,3);assert.match(ST.BEATS[1].when,/26 October 1863/);assert.match(exp,/MILESTONES\.map/);assert.match(exp,/Since 1886/);
 for(const s of [...L.LAW_SOURCES,...S.SORT_SOURCES])assert.match(s.url,/^https:\/\//);assert.ok(!/@gmail|khoa/i.test(exp+model));
 console.log('PASS case facts, take-away, story beats, milestones and all sources shown');}

// 2. The rule threads stay true and dated (laws.ts unchanged facts).
{const {THREADS,TODAY}=L;assert.equal(THREADS.length,6);
 for(const t of THREADS){assert.equal(t.versions[0].year,1863);assert.equal(t.versions.at(-1).year,TODAY);for(let i=1;i<t.versions.length;i++)assert.ok(t.versions[i].year>t.versions[i-1].year);}
 const at=(id,y)=>{const t=THREADS.find(x=>x.id===id);return t.versions[L.versionIndexAt(t,y)];};
 assert.match(at('goal',1863).text,/without any tape or bar/);assert.match(at('goal',1866).text,/tape/);assert.match(at('goal',1882).text,/crossbar/);
 assert.match(at('offside',1863).text,/out of play/);assert.match(at('throw',1873).text,/side opposite/);assert.match(at('fair',1863).text,/Neither tripping nor hacking/);
 console.log('PASS six rule threads, 1863 to today, dated and true');}

// 3. The press: six cards (three kept, three changed), the truth from sort.ts, the mechanism (pull → platen down, bar swings).
{for(const seed of [1,2,1863,77]){const r=M.pressRound(R.rng(seed));assert.equal(r.length,M.PRESS_N);assert.equal(r.filter(c=>c.kept).length,3);assert.equal(new Set(r.map(c=>c.id)).size,6);}
 assert.equal(S.SORT_CARDS.length,8);for(const c of S.SORT_CARDS)assert.equal(M.truthOf(c),c.kept?'kept':'changed');
 const by=id=>S.SORT_CARDS.find(c=>c.id===id);assert.ok(by('trip').kept&&!by('throw').kept&&/1873/.test(by('throw').now));
 assert.ok(M.platenZ(0)>M.platenZ(.5)&&M.platenZ(.5)>M.platenZ(1),'pulling lowers the platen');assert.ok(Math.abs(M.platenZ(1)-(M.BED_Z+M.CARD_T+M.DIE_T))<1e-9,'the die lands on the card');
 assert.notEqual(M.barAngle(0),M.barAngle(1),'the bar swings round');
 const s=M.pressInit();s.card=by('ends');s.stamped='changed';s.slide=1;const p=M.cardPos(s);assert.ok(Math.abs(p.x-M.TRAY.changed.x)<1e-9&&Math.abs(p.y-M.TRAY.changed.y)<1e-9,'the card lands in its tray');
 const mid={...s,slide:.5};assert.ok(M.cardPos(mid).z>M.BED_Z,'it hops on the way');assert.match(M.pressVerdict(6,6),/Every rule/);
 console.log('PASS the rule press: 3 kept + 3 changed per round, truth from sort.ts, pull lowers the platen, cards land in their trays');}

// 4. The match: a film for every moment, both rulebooks, a fuse, scoring with speed and streak.
{for(const e of R.REF_EVENTS){const f=M.FILMS[e.id];assert.ok(f,'film for '+e.id);assert.ok(f.T>=1.5&&f.T<=2.5);assert.ok(f.actors.length>=1&&f.ball.length>=1);
  for(const a of f.actors)for(let i=1;i<a.keys.length;i++)assert.ok(a.keys[i].t>=a.keys[i-1].t,e.id+' keys in order');}
 for(const seed of [3,1863,2026]){const r=R.makeRound(seed,M.MATCH_N);assert.equal(r.length,6);assert.ok(r.filter(c=>c.event.answer['1863']!==c.event.answer.today).length>=3,'the year matters');}
 assert.equal(R.REF_EVENTS.find(e=>e.id==='high').answer['1863'],1,'1863: a goal at any height');
 assert.equal(R.callPoints(true,0,0),150);assert.equal(R.callPoints(true,null,0),100,'untimed: no speed bonus');assert.equal(R.callPoints(false,0,5),0);assert.equal(R.CALL_MS,6000);
 assert.match(exp,/a\.t\*1000\/CALL_MS/,'the fuse burns for CALL_MS');assert.match(exp,/answer\(null\)/,'time out = no call');
 console.log('PASS ref the match: a peg film for each of the ten moments, both rulebooks, a 6 s fuse, speed + streak scoring');}

// 5. Both machines are drawn with the anatomy kit in the Paper theme: no pixel kit anywhere; 1863 has posts and flags, today the goal.
{const press=read(dir+'Press.tsx'),pitch=read(dir+'Pitch.tsx');
 for(const f of files.filter(f=>/\.tsx?$/.test(f)))assert.doesNotMatch(read(dir+f),/pixeliso/,'no pixel kit in '+f);
 for(const src of [press,pitch])assert.match(src,/from '\.\.\/anatomy\/paper-kit'/);
 assert.match(pitch,/era:old\?'1863':'today'/,'the goal frame follows the rulebook');assert.match(pitch,/if\(!old\)\{/,'lines only today');
 assert.match(press,/className="iso-hit"[\s\S]*onTray\(d\)/,'tap a tray to set the die');assert.match(press,/barAngle\(s\.pull\)/,'the lever follows the pull');
 assert.match(css,/--paper:#e0e0db/);assert.match(read('components/museum/experiences/anatomy/paper-kit.tsx'),/--anatomy-top:#f7f7f3/);
 console.log('PASS both machines on the anatomy Paper kit: no pixel art, 1863 posts + flags vs today goal + net + lines, tap a tray, drag the lever');}

// 6. Contract, full screen and heat.
{assert.match(exp,/<PaperRoom id="laws-1863"/);assert.match(room,/<ExperienceBack onClose=\{onClose\}\/>/);assert.match(room,/role="dialog" aria-modal="true"/);assert.match(exp,/k==='Escape'/);
 assert.match(exp,/'data-phase':phase/);assert.match(exp,/'data-era':/);assert.match(exp,/data-pull/);assert.match(exp,/data-option=\{j\}/);
 assert.match(exp,/BEST_KEY='futbol\.museum\.laws-1863\.refBest'/,'progress key kept');
 assert.equal((exp.match(/onComplete=\{onComplete\}/g)||[]).length,1,"onComplete only reaches the Ending");assert.doesNotMatch(exp,/onComplete(\?\.)?\(/,"never called directly");assert.match(exp,/<Ending reached=\{checked\} onComplete=\{onComplete\}/);assert.match(exp,/onDone=\{\(\)=>setChecked\(true\)\}/);
 assert.match(exp,/<StepCheck/);assert.match(exp,/<ScoreCover/);assert.match(exp,/<Intro /);assert.match(exp,/usePaperLoop\(/);
 assert.match(exp,/t:reduced\?f\.T:0,fuse:reduced\?null:1/,'reduced motion: last frame, no fuse');
 for(const f of files.filter(f=>/\.tsx?$/.test(f)))assert.ok(!/requestAnimationFrame\(|setInterval\(/.test(read(dir+f)),'no rAF/interval in '+f);
 assert.match(loop,/more=tick\(dt\)/);assert.match(loop,/else\{wanted=false;last=0;\}/,"the chain stops when tick returns false");assert.match(loop,/IntersectionObserver/);assert.match(loop,/dispose\(\)/);assert.match(loop,/reduced\|\|!raf/,'reduced: straight to the end');
 // the full-screen card: the first screen is 100dvh; the card takes the rest (flex:1) at full width.
 assert.match(css,/\.screen\{[^}]*height:100dvh/);assert.match(css,/\.card\{[^}]*flex:1 1 auto/);assert.match(css,/\.scroll\{[^}]*overflow-x:hidden/);
 for(const f of ['Glyph.tsx','RefMatch.tsx','Sorter.tsx','Experience.module.css'])assert.ok(!files.includes(f),f+' removed');
 assert.ok(fs.existsSync(path.join(root,'app/museum-lab/laws-1863/page.tsx')));assert.match(read('components/museum/experiences/index.tsx'),/'laws-1863':load/);
 console.log('PASS contract: PaperRoom + ExperienceBack, data hooks, best key, onComplete once via the Ending after the check, Paper loop only, reduced = turn-based, full-screen card, lab route');}
