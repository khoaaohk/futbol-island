// laced-leather · The Weather Machine (Oct 5 2026): the exhibit's facts appear word for word, the added numbers are the sourced
// ones, Back is the shared ExperienceBack (no local NavigationButton Back), the canvas loop sleeps/stops/disposes, and sources are cited.
// usage: node tests/museum-exp-laced-leather.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/laced-leather/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),F=require('../'+dir+'facts.ts');
const exp=read(dir+'Experience.tsx'),machine=read(dir+'machine.ts'),balls=read(dir+'ballRender.ts'),css=read(dir+'Experience.module.css');
const e=X.EXHIBITS.find(x=>x.id==='laced-leather');

// 1. The case's own facts and "take it to your game" line are shown (quoted from exhibit.facts, not retyped).
{assert.equal(e.facts.length,3);
 assert.match(exp,/fact\(0\)\.split\('\. '\)\[0\]/,'fact 1, first sentence (brown leather with laces)');
 assert.match(exp,/fact\(0\)\.split\('\. '\)\.slice\(1\)/,'fact 1, second sentence (they soaked up rain and got heavy)');
 assert.ok(e.facts[0].split('. ').length===2&&/soaked up rain and got heavy/.test(e.facts[0].split('. ')[1]),'the split lands on the rain sentence');
 assert.match(exp,/\{fact\(1\)\}/,'size 5 fact');assert.match(exp,/\{fact\(2\)\}/,'youth sizes fact');
 assert.match(exp,/exhibit\.forYourGame/,'take it to your game');
 console.log('PASS facts: the three case facts and the take-it-to-your-game line are quoted from the exhibit');}

// 2. Added numbers are the sourced ones.
{assert.equal(F.LEATHER.dry,410);assert.equal(F.LEATHER.wet,595);assert.equal(F.LEATHER.soakMinutes,90);assert.equal(F.LEATHER.ballYear,1966);
 assert.equal(F.LEATHER_GAIN,185);assert.equal(F.LEATHER_GAIN_PCT,45);
 assert.deepEqual([F.SIZES['5'].minG,F.SIZES['5'].maxG],[410,450],'Law 2 weight');assert.equal(F.SIZES['5'].around,'68–70 cm','Law 2 circumference');
 assert.ok(e.facts[1].includes(F.SIZES['5'].around)&&e.facts[1].includes(F.SIZES['5'].weight),'size 5 numbers match the case fact');
 assert.deepEqual([F.SIZES['4'].minG,F.SIZES['4'].maxG,F.SIZES['3'].minG,F.SIZES['3'].maxG],[350,390,300,320]);
 assert.ok(F.SIZES['3'].cm<F.SIZES['4'].cm&&F.SIZES['4'].cm<F.SIZES['5'].cm,'drawn to scale, smallest to largest');
 assert.deepEqual(F.AGE_CHOICES.map(a=>a.size),['3','4','5']);
 assert.match(machine,/SIZES\[input\.right\]\.cm\/SIZES\['5'\]\.cm/,'the right-hand ball is drawn to scale');
 assert.match(machine,/LEATHER\.dry\+\(LEATHER\.wet-LEATHER\.dry\)\*soak/,'the needle runs from the lab dry weight to the lab soaked weight');
 assert.match(exp,/lab/i,'the numbers are labelled as a lab test');
 console.log('PASS numbers: 410 g dry → 595 g after 90 min (+185 g, 45%), size 5/4/3 specs, drawn to scale');}

// 3. Sources cited with URLs.
{const urls=F.EXTRA_SOURCES.map(s=>s.url);
 assert.ok(urls.includes('https://www.nature.com/articles/s41598-023-45489-2'),'the 2023 Scientific Reports lab test');
 assert.ok(urls.some(u=>/size-charts\.com/.test(u))&&urls.some(u=>/nike\.com/.test(u)),'youth size guides');
 for(const s of [...e.sources,...F.EXTRA_SOURCES])assert.match(s.url,/^https:\/\//);
 assert.match(exp,/<summary>Sources<\/summary>/);assert.match(exp,/\[\.\.\.exhibit\.sources,\.\.\.EXTRA_SOURCES\]/);
 console.log('PASS sources: IFAB Law 2, Wikipedia, Scientific Reports 2023 and size guides, listed with URLs');}

// 4. Host contract + controls.
{assert.match(exp,/data-museum-experience="laced-leather"/);assert.match(exp,/role="dialog" aria-modal="true"/);
 assert.match(css,/\.root\{[^}]*position:fixed;inset:0;z-index:20/);
 assert.match(exp,/import ExperienceBack from '\.\.\/ExperienceBack'/);assert.match(exp,/<ExperienceBack onClose=\{onClose\}\/>/,'the shared Back');
 assert.doesNotMatch(exp,/NavigationButton/,'no local NavigationButton Back');assert.doesNotMatch(css,/\.back\{/,'no local Back wrapper or positioning');
 assert.match(machine,/backR=phone\?92:100,backB=phone\?60:64/,'the lightbox keeps clear of the Back corner');
 assert.doesNotMatch(exp,/immediate/,'never immediate');assert.match(exp,/e\.key==='Escape'/);
 assert.match(css,/min-height:4[48]px/);assert.match(css,/:active\{transform:scale\(\.9\d\)\}/,'press-shrink');
 assert.match(css,/safe-area-inset/);assert.match(css,/prefers-reduced-motion/);
 for(const sel of css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/@[^{]+\{/g,'').split('}').map(r=>r.split('{')[0].trim()).filter(Boolean).flatMap(s=>s.split(',')))
  if(!/^(from|to|\d+%)$/.test(sel.trim()))assert.match(sel,/\.[a-zA-Z]/,`CSS module selector "${sel.trim()}" has a local class`);
 console.log('PASS contract: fixed full-screen dialog, shared ExperienceBack, Escape, 44 px+ press-shrink controls, safe areas');}

// 5. Heat: the loop sleeps when settled, stops when hidden, and everything is disposed.
{assert.match(machine,/if\(moving&&!document\.hidden\)raf=requestAnimationFrame\(frame\)/,'loop only continues while something moves');
 assert.match(machine,/visibilitychange/);assert.match(machine,/if\(document\.hidden\)\{cancelAnimationFrame\(raf\)/,'hidden tab stops the loop');
 assert.match(machine,/dispose\(\)\{disposed=true;cancelAnimationFrame\(raf\);raf=0;ro\.disconnect\(\);document\.removeEventListener\('visibilitychange',vis\)/);
 assert.match(machine,/opts\.coarse\?1\.5:2/,'pixel ratio ≤ 1.5 on coarse pointers');assert.match(machine,/parts\.length<260/,'bounded particles');
 assert.match(exp,/return\(\)=>\{m\.dispose\(\)/,'disposed on unmount');assert.match(exp,/prefers-reduced-motion: reduce/);
 assert.doesNotMatch(exp+machine+balls,/setInterval|<audio|<video|autoplay/i,'no polling, no media');
 assert.doesNotMatch(balls,/requestAnimationFrame|setInterval/,'ball sprites are rendered on demand, never in a loop of their own');
 assert.match(balls,/while\(cache\.size>10\)/,'bounded sprite cache');assert.match(machine,/clearBallCache\(\);plate=null;canvas\.width=canvas\.height=0/,'sprite cache and the cached sepia plate freed on dispose');
 assert.match(machine,/if\(opts\.reduced\)\{if\(!near/,'reduced motion: a still rain curtain, no particles');
 assert.match(css,/animation:cue[^;]*\b3\}/,'idle cue pulses 3 times and stops');
 console.log('PASS heat: sleeping rAF loop, stops when hidden, disposed on unmount, DPR ≤ 1.5 on touch, bounded particles');}

// 6. Plate IV "Head it" (Oct 9 2026 motion pass): a pendulum header rig the visitor drives, with the sourced numbers and quotes.
{assert.deepEqual(Object.keys(F.HEAD_BALLS),['wet','dry','modern']);
 assert.equal(F.HEAD_BALLS.wet.g,F.LEATHER.wet,'soaked = the lab weight');assert.equal(F.HEAD_BALLS.dry.g,F.LEATHER.dry);
 assert.ok(F.HEAD_BALLS.modern.g>=F.SIZES['5'].minG&&F.HEAD_BALLS.modern.g<=F.SIZES['5'].maxG,'the modern ball is inside Law 2');
 assert.equal(F.HEAD_MORE_PCT,40,'595 / 430 → about 40 % more push at the same speed');
 assert.equal(F.YEATS.quote,'The ball had a lace in it and if you headed the lace, you had prints all over your head.','Ron Yeats, word for word');
 assert.match(F.HEAD_STUDY,/slow headers/);assert.match(F.HEAD_STUDY,/fast headers/,'the 2023 result is told both ways, not overstated');
 const urls=F.EXTRA_SOURCES.map(s=>s.url);for(const u of ['https://lfchistory.net/articles/4667','https://www.readingrefs.org.uk/ftm/ftmpages/FTM124.html'])assert.ok(urls.includes(u),'cites '+u);
 assert.equal(new Set([...e.sources,...F.EXTRA_SOURCES].map(s=>s.url)).size,e.sources.length+F.EXTRA_SOURCES.length,'no duplicate source URLs (React keys)');
 assert.match(exp,/replica/i,'the lab ball is labelled a replica');assert.doesNotMatch(exp,/real leather World Cup ball/,'not called the real ball');
 // the mechanic: grab → pull → let go on the canvas, and a keyboard/button path that runs the same swing
 assert.match(exp,/m\.grab\(x,y\)/);assert.match(exp,/machine\.current\?\.pull\(/);assert.match(exp,/machine\.current\?\.letGo\(\)/);
 assert.match(exp,/autoSwing\(\)\}>Pull back and let go/,'a button for keyboards and anyone who cannot drag');
 assert.match(exp,/aria-live="polite"/,'results announced');assert.match(exp,/compared&&/,'a takeaway once two balls are compared');
 // motion: velocity-aware springs, a real pendulum, a hit-stop, rubber-banding, and the loop still sleeps
 assert.match(machine,/hd\.om\+=-\(G\/H\.L\)\*Math\.sin\(hd\.th\)\*h/,'pendulum physics');
 assert.match(machine,/hitStop/);assert.match(machine,/raw\*=\.18/,'rubber-band when pushed into the head');
 assert.match(machine,/\(hd\.print>0&&!opts\.reduced\)/,'the lace print fade keeps the loop awake only while it fades');
 assert.match(machine,/if\(opts\.reduced\)\{\/\/ reduced motion: no swing/,'reduced motion: the result without the swing');
 assert.match(css,/\.paper\{[^}]*pointer-events:none/,'the print-speckle overlay never blocks input');
 console.log('PASS head it: pendulum rig, sourced quotes, fair-test framing, button + drag, sleeping loop, reduced-motion result');}
