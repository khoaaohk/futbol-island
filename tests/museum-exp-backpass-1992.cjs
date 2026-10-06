// backpass-1992 · The Time-Wasting Machine (Oct 5 2026): the case's facts reach the room, the extra history is sourced, Back is
// the shared fixed ExperienceBack (no local NavigationButton), the simulation teaches the rule (old law wastes time, new law forces the feet
// and punishes handling), and the animation loop sleeps, stops when hidden and is cleaned up on unmount.
// usage: node tests/museum-exp-backpass-1992.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/backpass-1992/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const exp=read(dir+'Experience.tsx'),css=read(dir+'Experience.module.css');
const X=require('../lib/endgame/museum.ts'),S=require('../'+dir+'sim.ts'),C=require('../'+dir+'content.ts');
const ex=X.EXHIBITS.find(e=>e.id==='backpass-1992');

// 1. Contract and content.
{assert.match(exp,/export default function Experience/);
 assert.match(exp,/data-museum-experience="backpass-1992"/);assert.match(exp,/role="dialog" aria-modal="true"/);
 assert.match(css,/\.root\{[^}]*position:fixed;inset:0;z-index:20/);
 assert.match(exp,/import ExperienceBack from '\.\.\/ExperienceBack'/);assert.match(exp,/<ExperienceBack onClose=\{onClose\}\/>/,'the shared fixed Back');
 assert.doesNotMatch(exp,/NavigationButton/,'no local NavigationButton Back');assert.doesNotMatch(exp,/immediate/,'Back always animates');
 assert.match(exp,/e\.key!=='Escape'/,'Escape leaves');
 for(const i of [0,1,2])assert.match(exp,new RegExp(`exhibit\\.facts\\[${i}\\]`),`case fact ${i} is shown in the ticker`);
 assert.match(exp,/exhibit\.facts\.map/);assert.match(exp,/exhibit\.forYourGame/);
 assert.equal(ex.facts[0],'Since 1992, a goalkeeper may not pick up the ball when a team-mate deliberately kicks it back to them.');
 const hist=C.HISTORY.map(h=>h.text).join(' ');
 for(const f of ['2.21 goals a game','Packie Bonner','six minutes','indirect free kick','1997','throw-in','eight seconds','corner kick','header'])assert.ok(hist.includes(f),`history mentions ${f}`);
 const urls=[...ex.sources,...C.EXTRA_SOURCES].map(s=>s.url);
 for(const u of ['https://en.wikipedia.org/wiki/Back-pass_rule','https://www.theifab.com/laws/latest/fouls-and-misconduct/','https://en.wikipedia.org/wiki/1990_FIFA_World_Cup','https://en.wikipedia.org/wiki/Packie_Bonner'])assert.ok(urls.includes(u),'cited: '+u);
 assert.ok(C.EXTRA_SOURCES.some(s=>/skysports\.com/.test(s.url)&&/eight-second/i.test(s.title)),'the 2025 eight-second law is cited');
 assert.match(exp,/\.\.\.exhibit\.sources,\.\.\.EXTRA_SOURCES/);assert.match(exp,/<summary>Sources<\/summary>/);
 assert.match(C.FICTION_NOTE,/game we made/);assert.match(exp,/FICTION_NOTE/);
 assert.doesNotMatch(exp+read(dir+'content.ts'),/@gmail|khoa/i);
 console.log('PASS content: case facts, sourced history, Back/Escape contract, fiction labelled');}

// 2. The simulation teaches the rule.
{const run=(w,secs)=>{let ev=[];for(let t=0;t<secs;t+=1/60){const e=S.step(w,1/60);if(e)ev.push(e);}return ev;};
 const o=S.createWorld('old');assert.ok(S.passBack(o));assert.ok(!S.passBack(o),'one pass-back at a time');
 const oe=run(o,8);assert.ok(oe.includes('catch'),'old law: the keeper picks it up');assert.equal(o.phase,'idle');
 assert.ok(o.wasted>=24,'old law: the hold wastes ~25 match seconds a time ('+o.wasted.toFixed(1)+')');assert.equal(o.chances,0,'nobody may challenge');
 assert.ok(!S.pickUp(o)&&!S.footPass(o,'W'),'old world has no choices');
 const n=S.createWorld('new');S.passBack(n);run(n,S.DUR.back+.05);assert.equal(n.phase,'feet','new law: ball at the keeper’s feet');assert.equal(n.chances,1);
 assert.equal(S.freeTarget(n),'W');assert.ok(S.footPass(n,'W'));run(n,4);assert.equal(n.goodPasses,1);assert.equal(n.phase,'idle');assert.ok(n.wasted<1,'feet: no time wasted');
 assert.equal(n.marked,'W','the marker switches sides each round');
 S.passBack(n);run(n,S.DUR.back+.05);S.footPass(n,'W');const ie=run(n,4);assert.ok(ie.includes('intercepted'),'passing to the marked player is intercepted');
 S.passBack(n);run(n,S.DUR.back+.05);assert.ok(S.pickUp(n));assert.equal(n.handballs,1);assert.equal(n.phase,'foul');run(n,5);assert.equal(n.phase,'idle');
 S.passBack(n);const te=run(n,8);assert.ok(te.includes('stolen'),'too slow: the striker steals it');
 assert.equal(S.clockText(88*60+5),'88:05');
 console.log('PASS sim: old law wastes time, new law forces quick feet, handling is whistled, the marked pass is cut out');}

// 3. Heat: the loop sleeps when idle, stops when hidden, is cancelled and released on unmount; capped pixel ratio; no timers.
{assert.match(exp,/if\(busy&&document\.visibilityState==='visible'\)raf\.current=requestAnimationFrame\(frame\)/,'loop only while a world is busy');
 assert.match(exp,/visibilitychange/);assert.match(exp,/cancelAnimationFrame\(raf\.current\);raf\.current=0;/);
 assert.match(exp,/ro\.disconnect\(\)/);assert.match(exp,/removeEventListener\('visibilitychange'/);assert.match(exp,/c\.width=1;c\.height=1;/,'canvas bitmaps released');
 assert.match(exp,/coarse\?1\.5:2/,'pixel ratio ≤ 1.5 on touch');
 assert.doesNotMatch(exp,/setInterval|setTimeout/,'no timers or polling');
 assert.match(exp,/prefers-reduced-motion: reduce/);assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/env\(safe-area-inset-top\)/);assert.match(css,/min-height:44px/);
 assert.match(css,/@media \(prefers-reduced-motion:reduce\)\{[^]*\.sting\{animation:stingFade/,'reduced motion: stingers only fade');
 assert.match(exp,/if\(reduced\|\|typeof d\.startViewTransition!=='function'\)\{fn\(\);return;\}/,'view transition guarded');
 assert.match(exp,/if\(!c\|\|reduced\.current\|\|typeof c\.animate!=='function'\)return;/,'impact animations skip under reduced motion');
 assert.match(exp,/fullTime&&/,'the full-time card ends the match');
 console.log('PASS heat: sleeping loop, hidden-tab stop, cleanup, DPR cap, reduced motion, safe areas');}
