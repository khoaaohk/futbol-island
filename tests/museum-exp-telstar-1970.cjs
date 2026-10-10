// telstar-1970 full-screen experience ("The broadcast", Oct 5 2026): the case's facts reach the screen, Back is the shared
// ExperienceBack (shared, fixed position; no local NavigationButton Back), the 3D picture is lazy-loaded, sleeps and disposes, and every added fact is sourced.
// usage: node tests/museum-exp-telstar-1970.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/telstar-1970/',read=f=>fs.readFileSync(path.join(root,dir+f),'utf8');
const X=require('../lib/endgame/museum.ts');
const stitch=read('stitch.ts'),benchC=read('StitchBench.tsx'),exp=read('Experience.tsx'),scene=read('tvScene.ts'),css=read('Experience.module.css'),card=read('TestCard.tsx'),room=read('Room.tsx');
const e=X.EXHIBITS.find(x=>x.id==='telstar-1970');

// 1. Facts: the case's three facts and its "take it to your game" line are all shown (read from the exhibit, unchanged).
{assert.equal(e.facts.length,3);
 for(const i of [0,1,2])assert.match(exp,new RegExp(`exhibit\\.facts\\[${i}\\]`),`fact ${i+1} is captioned`);
 assert.match(exp,/exhibit\.forYourGame/,'the take-it-to-your-game line is captioned');
 assert.match(e.facts[1],/32 panels were black and white/);
 // The added facts, each one tied to a cited source below.
 assert.match(exp,/named after Telstar, a ball-shaped satellite/);assert.doesNotMatch(exp,/star of television/,'the name came from the satellite (Wikipedia, Adidas Telstar)');assert.match(exp,/launched in 1962/);assert.match(exp,/Only 20 Telstars were made/);assert.match(exp,/Select, made one in 1962/);assert.match(exp,/12 black pentagons .*20 white hexagons/);assert.match(exp,/live around the world by satellite/);
 assert.match(exp,/pretend/i,'the pretend match is labelled as such (real history vs game fiction)');
 console.log('PASS facts: 3 case facts + the game line + 3 sourced extras, pretend match labelled');}

// 2. Sources: the case's own plus the extras, shown in a Sources list with URLs.
{assert.match(exp,/exhibit\.sources/);assert.match(exp,/<summary>Sources<\/summary>/);
 for(const url of ['https://en.wikipedia.org/wiki/Telstar_1','https://www.sciencemuseum.org.uk/objects-and-stories/telstar-intelsat-and-first-global-satellite-broadcast','https://americanhistory.si.edu/collections/object/nmah_682185','https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls'])
  assert.ok(exp.includes(url),'cites '+url);
 assert.ok(e.sources.some(s=>/Adidas_Telstar/.test(s.url))&&e.sources.some(s=>/1970_FIFA_World_Cup/.test(s.url)),'case sources: Adidas Telstar and the 1970 World Cup');
 console.log('PASS sources: case sources + Telstar 1, Science Museum, Smithsonian, ball list');}

// 3. Contract: dialog root, the shared ExperienceBack (no local NavigationButton Back), Escape, 44 px controls.
{assert.match(exp,/role="dialog" aria-modal="true"/);assert.match(exp,/data-museum-experience="telstar-1970"/);
 assert.match(exp,/import ExperienceBack from '\.\.\/ExperienceBack'/);assert.match(exp,/<ExperienceBack onClose=\{onClose\}\/>/);
 assert.equal((exp.match(/<ExperienceBack /g)||[]).length,1,'exactly one Back');
 assert.doesNotMatch(exp,/NavigationButton/,'no local NavigationButton Back');assert.doesNotMatch(exp,/immediate/,'never immediate');
 assert.match(css,/\.top\{[^}]*padding-left:96px/,'the header keeps clear of the fixed Back corner');
 assert.match(exp,/e\.key==='Escape'/);
 assert.match(css,/\.root\{position:fixed;inset:0;z-index:20/);
 for(const m of css.matchAll(/(?:width|height|min-height):(\d+)px/g))if(/knob|power|pager|action/.test(css.slice(Math.max(0,m.index-120),m.index)))assert.ok(+m[1]>=44||+m[1]<20,'controls ≥ 44 px ('+m[0]+')');
 for(const sel of css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/@media[^{]*\{/g,'').split('}').map(s=>s.split('{')[0].trim()).filter(s=>s&&!s.startsWith('@')&&!/^(from|to|\d+%)/.test(s)))
  for(const part of sel.split(','))assert.match(part,/\.[a-zA-Z]/,`CSS module selector "${part}" has a local class`);
 console.log('PASS contract: dialog root, shared ExperienceBack (no local Back), Escape, pure CSS module selectors');}

// 4. Heat: lazy 3D, render on demand, sleeps, hidden tab, capped resolution, disposal; reuses the gallery's exact Telstar.
{assert.match(exp,/import\('\.\/tvScene'\)/,'the 3D picture is lazy-loaded');
 assert.match(exp,/import type \{BallKind,Shot,TvScene\} from '\.\/tvScene'/,'only types are imported eagerly');
 assert.match(scene,/import \{createBallMaterial\} from '@\/lib\/museum\/wcBalls\/ballViewer'/);assert.match(scene,/wcBalls\/designs\/1970-telstar/);
 assert.match(scene,/if\(roll\|\|held\|\|spinning\|\|panning\|\|omega\.lengthSq\(\)>0\)frame=requestAnimationFrame\(step\);else last=0;/,'the loop sleeps when nothing moves');
 assert.match(scene,/document\.hidden/,'stops while the tab is hidden');assert.match(scene,/setPixelRatio\(1\)/);assert.match(scene,/560\/w/,'TV-resolution cap');
 for(const d of ['m.dispose()','pitchMat.dispose()','pitchGeo.dispose()','ballGeo.dispose()','renderer.dispose()','ro.disconnect()','cancelAnimationFrame(frame)'])assert.ok(scene.includes(d),'dispose: '+d);
 assert.match(exp,/scene\.current\?\.dispose\(\)/,'disposed on unmount');assert.match(exp,/clearTimeout/,'timers cleared on unmount');
 assert.match(css,/prefers-reduced-motion/);
 // Polish pass: the floor is measured with a ResizeObserver (no polling), the power-off collapse is a one-shot WAAPI animation
 // skipped under reduced motion, and the rolling bar / flash / lower-third are finite (iteration 1 or timed exit).
 assert.match(exp,/new ResizeObserver\(measure\)/);assert.match(exp,/ro\.disconnect\(\)/);
 assert.match(exp,/if\(reduced\|\|!el\|\|typeof el\.animate!=='function'\)\{off\(\);return;\}/,'power-off animation skipped under reduced motion');
 assert.match(css,/animation:roll \.5s linear 1/);assert.match(css,/animation:flash \.32s ease-out 1/);assert.match(css,/animation:lowerOut [^;]*forwards/);
 for(const m of css.matchAll(/animation:[^;}]*infinite/g))assert.match(m[0],/snow/,'only the tuning snow loops, and only while tuning: '+m[0]);assert.doesNotMatch(css,/infinite[^}]*beckon|beckon[^;]*infinite/,'the power-button glow does not loop forever');
 assert.doesNotMatch(exp+scene+card+room,/setInterval/,'no polling');assert.doesNotMatch(exp+scene+card+css+room,/https?:\/\/(?!en\.wikipedia|www\.sciencemuseum|www\.britannica|americanhistory)/,'no external asset requests');
 console.log('PASS heat: lazy three, on-demand loop that sleeps and disposes, capped resolution, no polling');}

// 5. "How it's made" (Oct 9 2026 motion pass): the visitor stitches the Telstar on the TV, panel by panel.
{const S=require('../components/museum/experiences/telstar-1970/stitch.ts');
 const P=S.buildPanels();assert.equal(P.length,32,'32 panels');
 assert.equal(P.filter(p=>p.kind==='pent').length,12,'12 pentagons');assert.equal(P.filter(p=>p.kind==='hex').length,20,'20 hexagons');
 assert.ok(P.every(p=>p.pts.length===(p.kind==='pent'?5:6)*4),'outlines: 5 or 6 sides, each edge curved in 4');
 assert.ok(P.every(p=>Math.abs(Math.hypot(...p.c)-1)<1e-9),'centres on the unit sphere');
 // the panels tile the sphere: every pair of centres is at least a panel apart
 let minD=9;for(let i=0;i<32;i++)for(let j=i+1;j<32;j++)minD=Math.min(minD,Math.hypot(P[i].c[0]-P[j].c[0],P[i].c[1]-P[j].c[1],P[i].c[2]-P[j].c[2]));assert.ok(minD>.6,'no duplicate panels');
 // mechanic + feedback: drag a piece, tap a piece, wrong shape bounces back with a reason, finish with a stagger
 assert.match(benchC,/pieceDown\(/);assert.match(benchC,/bench\.current\?\.place\(k,/,'tap / keyboard sends a piece');assert.match(benchC,/onKeyDown=\{key\}/,'arrow keys turn the ball');
 assert.match(exp,/That gap has \$\{n\.sides\} sides\. It needs a \$\{n\.name\}\./,'the wrong shape says why');
 assert.match(exp,/Stitch the rest/);assert.match(exp,/aria-live="polite"><span>/,'the tally is announced');
 assert.match(exp,/12 black, 20 white/,'the takeaway counts the panels');assert.match(exp,/Skip to the match/,'a way past it on a revisit');
 // motion: momentum + friction, spring-followed piece, overshoot pop, stagger; loop sleeps, stops when hidden, disposes
 assert.match(stitch,/Math\.exp\(-dt\*\(spinUp\?1\.1:2\.6\)\)/,'flick momentum with friction');
 assert.match(stitch,/f\.vx\+=\(k\*\(f\.tx-f\.x\)-c\*f\.vx\)\*dt/,'the flying piece follows a spring');
 assert.match(stitch,/p\.popV\+=\(260\*\(1-p\.pop\)-15\*p\.popV\)\*dt/,'panels pop in on an underdamped spring');
 assert.match(stitch,/if\(moving&&!document\.hidden\)raf=requestAnimationFrame\(frame\);else last=0;/,'the bench loop sleeps when settled');
 assert.match(stitch,/visibilitychange/);assert.match(stitch,/opts\.coarse\?1\.5:2/,'DPR ≤ 1.5 on touch');
 assert.match(stitch,/dispose\(\)\{disposed=true;cancelAnimationFrame\(raf\);raf=0;ro\.disconnect\(\);document\.removeEventListener\('visibilitychange',vis\)/);
 assert.match(benchC,/return\(\)=>\{b\.dispose\(\)/,'disposed on unmount');
 assert.match(stitch,/if\(reduced\)\{for\(const i of left\)commit\(i\);return;\}/,'reduced motion: the rest lands at once');
 assert.match(css,/\.piece\{[^}]*touch-action:none/,'dragging a piece never scrolls the page');assert.match(css,/\.benchCanvas\{[^}]*touch-action:none/);
 assert.doesNotMatch(stitch+benchC,/setInterval|view-transition/,'no polling, no global view transitions');
 // layout fix: the TV's knobs are no longer pushed under the guide on a 1440 px desktop
 assert.match(css,/calc\(min\(100vw - 48px,1280px\) - 380px - 32px - 166px\)/,'screen width leaves room for the knob column');
 console.log('PASS how it is made: 12 + 20 = 32 panels, drag/tap/keys, wrong-shape feedback, springs + momentum, sleeping loop');}

// 6. Story pass (Oct 9 2026): a cold open that poses the question, a Full time closedown card on the TV and a three-question
//    quiz of the night with a why after every answer; CSS-only motion, finite, off under reduced motion.
{const ft=read('FullTime.tsx');
 assert.match(exp,/import \{ColdOpen,EndCard,Quiz,QUIZ\} from '\.\/FullTime'/);assert.match(exp,/power==='off'&&<ColdOpen\/>/,'the cold open shows while the TV is off');
 assert.match(exp,/Blow for full time: quiz of the night/);assert.match(exp,/<EndCard rows=\{endRows\}/,'the closedown card shows the visitor’s own scores');
 assert.match(ft,/COLD_OPEN=\[/);assert.equal((ft.match(/\{q:'/g)||[]).length,3,'three quiz questions');
 assert.match(ft,/right:0,/);assert.match(ft,/right:1,/);assert.match(ft,/right:2,/,'right answers in different places');
 assert.match(ft,/A TV satellite from 1962/);assert.match(ft,/32: 12 black and 20 white/);assert.match(ft,/same grey as the grass/);
 assert.match(exp,/exhibit\.forYourGame/);assert.doesNotMatch(ft,/setTimeout|setInterval|requestAnimationFrame/,'no timers or loops in the ending');
 assert.match(css,/\.coldOpen li\{opacity:0;animation:lineIn [^;]* 1 forwards/,'cold open lines reveal once');
 assert.match(css,/@media \(prefers-reduced-motion:reduce\)\{\n \.coldOpen li,\.endCard,\.endCard p,\.quizQ,\.quizOpt,\.quizWhy,\.quizScore\{animation:none;opacity:1\}/,'reduced motion: all shown at once');
 console.log('PASS story: cold open, Full time closedown card, quiz of the night (3 questions with a why), CSS-only motion');}
