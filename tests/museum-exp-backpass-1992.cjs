// backpass-1992 · The Time-Wasting Machine (Oct 5 2026): the case's facts reach the room, the extra history is sourced, Back is
// the shared fixed ExperienceBack (no local NavigationButton), the simulation teaches the rule (old law wastes time, new law forces the feet
// and punishes handling), and the animation loop sleeps, stops when hidden and is cleaned up on unmount.
// usage: node tests/museum-exp-backpass-1992.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/backpass-1992/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const exp=read(dir+'Experience.tsx'),css=read(dir+'Experience.module.css'),film=read(dir+'Film.tsx');
const X=require('../lib/endgame/museum.ts'),S=require('../'+dir+'sim.ts'),C=require('../'+dir+'content.ts'),SP=require('../'+dir+'spring.ts');
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
 assert.doesNotMatch(exp+film,/startViewTransition|view-transition/,'no View Transitions (FLIP + WAAPI instead)');assert.doesNotMatch(css,/::view-transition/);
 assert.match(exp,/function flipFrom\(el:HTMLElement,from:DOMRect,delay:number,reduced:boolean\)\{\n if\(reduced\|\|/,'FLIP hand-off from the tape to the match, skipped under reduced motion');
 assert.match(exp,/if\(!c\|\|reduced\.current\|\|typeof c\.animate!=='function'\)return;/,'impact animations skip under reduced motion');
 assert.match(exp,/fullTime&&/,'the full-time card ends the match');
 console.log('PASS heat: sleeping loop, hidden-tab stop, cleanup, DPR cap, reduced motion, safe areas');}

// 4. The tape (Oct 9 2026): the five-beat VHS story the visitor drives, a deterministic clip, physical controls, no loop at rest.
{const old=S.clipAt('old',S.CLIP_LEN),nw=S.clipAt('new',S.CLIP_LEN);
 assert.ok(old.wasted>=24,'old tape: the hold wastes ~25 s ('+old.wasted.toFixed(1)+')');assert.equal(old.chances,0,'old tape: nobody may challenge');
 assert.ok(nw.wasted<1,'new tape: no time wasted');assert.ok(nw.goodPasses>=2,'new tape: the ball keeps moving (two quick passes)');
 for(let t=0;t<=S.CLIP_LEN;t+=.05){assert.ok(!S.clipAt('new',t).held,'new tape: the keeper never handles the back-pass');}
 assert.ok([...Array(60)].some((_,i)=>S.clipAt('old',i*.1).phase==='hold'),'old tape: the keeper holds it');
 assert.strictEqual(S.clipAt('old',2.5),S.clipAt('old',2.5),'scrubbing is deterministic (same frame for the same time)');
 assert.equal(S.clipAt('old',-3),S.clipAt('old',0));assert.equal(S.clipAt('old',99),S.clipAt('old',S.CLIP_LEN),'clamped to the tape');
 const keys=S.clipKeys('old');assert.ok(keys.some(k=>S.clipAt('old',k).phase==='hold'),'reduced motion can step onto the hold');assert.ok(Math.abs(keys[keys.length-1]-S.CLIP_LEN)<.02);
 // the motion kit
 let sp={x:0,v:0};for(let i=0;i<240;i++)sp=SP.springStep(sp,1,1/60);assert.ok(SP.settled(sp,1),'spring settles');
 let peak=0;sp={x:0,v:0};for(let i=0;i<120;i++){sp=SP.springStep(sp,1,1/60,320,15);peak=Math.max(peak,sp.x);}assert.ok(peak>1,'underdamped spring overshoots');
 assert.ok(SP.rubber(-50,0,6.2)>-.6&&SP.rubber(80,0,6.2)<6.2+.6&&SP.rubber(3,0,6.2)===3,'rubber band is bounded and leaves the inside alone');
 assert.ok(Math.abs(SP.coast({x:0,v:2},1).v)<2,'momentum decays');const ss=SP.springSamples();assert.equal(ss.frames[ss.frames.length-1].p,1);assert.ok(ss.ms>100&&ss.ms<1500);
 assert.ok(Math.abs(SP.angleDiff(Math.PI-.1,-Math.PI+.1)+.2)<1e-9,'angle wraps');
 // the story, the style and the controls
 assert.match(exp,/import Film from '\.\/Film'/);assert.match(exp,/mode==='film'\?<Film/,'the room opens on the tape');
 for(const w of ['PLAY','PAUSE','JOG','1992 tape','REW','SP'])assert.ok(film.includes(w),'VHS: '+w);
 assert.match(film,/facts\[1\]/);assert.match(film,/facts\[2\]/);assert.match(film,/\{forYourGame\}/,'the takeaway shows the case facts and the game line');
 assert.match(film,/role="slider" tabIndex=\{0\}/);assert.match(film,/onKeyDown=\{dialKey\}/,'the jog dial works by keyboard');
 for(const l of ['Rewind','Play','Pause','Fast forward'])assert.match(film,new RegExp(`aria-label="${l}"`),l+' button');
 assert.match(film,/aria-live="polite"/,'live feedback');assert.match(film,/aria-pressed=\{era===m\}/,'tape choice is a pressed state');
 assert.match(film,/touch-action|onPointerDown/);assert.match(css,/\.jog\{[^}]*touch-action:none/,'the dial owns its gesture');assert.match(css,/\.filmCanvas\{[^}]*touch-action:pan-y/,'dragging the tape never fights vertical scroll');
 assert.match(css,/\.vcrBtn\{min-height:46px/);assert.match(css,/\.tapeBtn\{min-height:44px/);assert.match(css,/\.vcrBtn:active\{transform/);
 // heat
 assert.match(film,/if\(busy&&document\.visibilityState==='visible'\)raf\.current=requestAnimationFrame\(frame\)/,'the tape loop runs only while something moves');
 assert.match(film,/visibilitychange/);assert.match(film,/cancelAnimationFrame\(raf\.current\);raf\.current=0;if\(c\)\{c\.width=1;c\.height=1;\}/,'cancelled and released on unmount');
 assert.match(film,/coarse\?1\.5:2/,'pixel ratio ≤ 1.5 on touch');assert.doesNotMatch(film,/setInterval|setTimeout/,'no timers');
 assert.match(film,/if\(reduced\.current\)\{stepKey\(1\);return;\}/,'reduced motion: PLAY steps key frames, no playback loop');
 assert.match(film,/let NOISE:string\|null=null;/,'the tape grain is pre-rendered once');assert.match(css,/@media \(prefers-reduced-motion:reduce\)\{[^]*\.tracking\{display:none\}/);
 assert.doesNotMatch(film,/@gmail|khoa/i);
 console.log('PASS tape: five VHS beats, deterministic clip (old '+old.wasted.toFixed(0)+' s wasted, new 0 s, '+nw.goodPasses+' passes), springs, keyboard, sleeping loop');}

// 5. Ref's call (Oct 9 2026): a four-call quick check at the end of the tape.
{const quiz=read(dir+'Quiz.tsx');
 assert.match(film,/\{beat===5&&<Quiz\/>\}/,'the quiz follows the takeaway');
 const calls=[...quiz.matchAll(/\{q:'([^']+)',options:\[([^\]]+)\],answer:(\d)/g)];assert.equal(calls.length,4,'four calls');
 const by=k=>calls.find(c=>c[1].includes(k));assert.ok(by('KICKS')[2].split("','")[+by('KICKS')[3]].includes('No'),'kicked back: no hands');
 assert.ok(by('HEADS')[2].split("','")[+by('HEADS')[3]].includes('Yes'),'headed back: hands allowed (the law is about kicks)');
 assert.ok(by('throw-in')[2].split("','")[+by('throw-in')[3]].includes('No'),'1997: no hands from a team-mate’s throw-in');
 assert.ok(!/requestAnimationFrame|setInterval|setTimeout/.test(quiz),'no loop in the quiz');assert.match(quiz,/prefers-reduced-motion: reduce/);
 assert.match(C.HISTORY.map(h=>h.text).join(' '),/almost six minutes/);assert.ok(C.EXTRA_SOURCES.some(s=>/balls\.ie/.test(s.url)),'the Bonner line is cited to a source that says it');
 console.log('PASS ref’s call: four calls (kick no, header yes, why, 1997 throw-in), no loop, reduced motion');}
