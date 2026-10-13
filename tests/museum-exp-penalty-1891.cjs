// penalty-1891 museum experience (Oct 5 2026; modern gallery pass Oct 10 2026; arcade cabinet Oct 10 2026): real-scale numbers,
// the shot model teaches what it claims (corners beat the keeper's reach, low shots can't go over, harder = more wobble, 1891
// keeper 6 yards out), the case's facts and the cited history are shown, the abstract goal (frame, oval, sphere, spray) with
// drag/keys aim and the 1891 replay, the shared gallery pieces (wall label, quick check, ending → onComplete), the shared Back,
// heat (0 rAF on the page), and the 16-bit ARCADE CABINET framed on the page (Cabinet.tsx + scene.ts + motion.ts): the full
// shootout game on the shared model, lazy, asleep off-screen and at rest, disposed on unmount, crisp integer pixels, 390 px fit.
// usage: node tests/museum-exp-penalty-1891.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/penalty-1891/',read=f=>fs.readFileSync(path.join(root,dir,f),'utf8');
const M=require('../'+dir+'model.ts'),C=require('../'+dir+'content.ts'),X=require('../lib/endgame/museum.ts');
const exp=read('Experience.tsx'),css=read('Experience.module.css'),files=fs.readdirSync(path.join(root,dir));
const cab=read('Cabinet.tsx'),ccss=read('Cabinet.module.css'),scene=read('scene.ts'),motion=read('motion.ts');

// 1. Real measurements.
{assert.equal(M.GOAL_W,7.32);assert.equal(M.GOAL_H,2.44);assert.equal(M.MARK,11);assert.equal(M.SIX_YARDS,5.5);
 assert.ok(Math.abs(M.GOAL_ANGLE_DEG-36.8)<.1);assert.ok(Math.abs(M.flightTime('firm')-11/(80/3.6))<1e-9);
 assert.equal(M.keeperDepth('today'),0);assert.equal(M.keeperDepth('1891'),5.5);
 assert.match(exp,/const M=30,top=20,line=top\+GOAL_H\*M,spot=line\+MARK\*M/,'the hero is drawn to scale: goal and 11 m at one scale');
 console.log('PASS scale: 7.32 × 2.44 m goal, 11 m mark, 6-yard 1891 keeper, the hero drawn to scale');}

// 2. The model teaches what the captions say.
{const o=(era,p,x,y)=>M.odds(era,p,x,y);
 for(const p of ['soft','firm','blast']){const low=o('today',p,3.1,.3),mid=o('today',p,1.4,1.1);assert.ok(low.reach<mid.reach,p);}
 assert.ok(o('today','firm',3.1,.3).goal>o('today','firm',1.6,.9).goal,'low corner beats a shot near the keeper');
 assert.ok(o('today','firm',3.1,2.1).onTarget<o('today','firm',3.1,.3).onTarget,'a top-corner aim misses more often');
 assert.ok(M.POWERS.soft.wobble<M.POWERS.firm.wobble&&M.POWERS.firm.wobble<M.POWERS.blast.wobble,'harder shots wobble more');
 assert.ok(M.reach(M.keeperTime('today','blast')).a<M.reach(M.keeperTime('today','soft')).a,'harder shots give the keeper less time');
 assert.equal(M.shotResult('today','firm','left',5,1),'wide');assert.equal(M.shotResult('today','firm','left',0,3),'over');
 assert.equal(M.shotResult('today','firm','left',-2,1),'saved');assert.equal(M.shotResult('today','firm','right',-2,1),'goal');
 assert.equal(M.shotResult('today','firm','left',0,1),'goal');assert.equal(M.shotResult('today','firm','stay',0,1),'saved');
 assert.ok(Math.abs(M.DIVE_ODDS.left+M.DIVE_ODDS.right-.94)<1e-9);
 let flips=0;for(const w of M.WOBBLE.slice(0,120)){const l=M.landing(1.6,1,'firm',w);for(const d of ['left','right'])if(M.shotResult('today','firm',d,l.x,l.y)==='goal'&&M.shotResult('1891','firm',d,l.x,l.y)==='saved')flips++;}
 assert.ok(flips>0,'some goals today are saves in 1891 (the replay can teach it)');
 assert.match(C.compareText('1891','goal','saved'),/6 yards/);assert.match(C.compareText('today','saved','goal'),/1905/);
 console.log('PASS model: corners out of reach, low shots stay under the bar, power trades time for wobble, keeper guesses, 1891 saves more');}

// 3. Facts: the case's own facts and takeaway; the history steps; extra facts cited; the model labelled as a model.
{const e=X.EXHIBITS.find(x=>x.id==='penalty-1891');assert.match(exp,/exhibit\.facts\[0\]/);assert.match(exp,/\[\.\.\.exhibit\.facts,\.\.\.HISTORY\]/);
 assert.match(exp,/exhibit\.forYourGame/);assert.match(exp,/\[\.\.\.exhibit\.sources,\.\.\.SOURCES\]/);assert.ok(e.facts[1].includes('11 metres'));
 assert.equal(C.STORY.length,4,'four history steps');assert.match(exp,/STORY\.map\(\(b,i\)=><HistoryStep/);
 const all=[...C.HISTORY,...C.RESEARCH].join(' ');
 for(const s of ['Milford','1890','12 yards','6 yards','18 yards','1902','1905','14 September 1891','286','311','94%'])assert.ok(all.includes(s),'fact: '+s);
 const urls=C.SOURCES.map(s=>s.url).join(' ');
 for(const u of ['football-pitch-markings','William_McCrum','nature.com/articles/s41598-022-21508-6','263266318','mprapa/4477','wolves.co.uk','the-field-of-play'])assert.ok(urls.includes(u),'source: '+u);
 assert.ok(C.SOURCES.every(s=>/^https:\/\//.test(s.url)));assert.match(exp,/<summary>Sources<\/summary>/);assert.match(exp,/\{MODEL_NOTE\}/);
 assert.match(C.MODEL_NOTE,/simple model/);assert.match(C.MODEL_NOTE,/not measured/);
 assert.ok(!/@gmail|khoa/i.test(exp+JSON.stringify(C)),'no personal data');
 console.log('PASS facts: case facts + takeaway, four history steps, cited research, the model labelled as a model');}

// 4. The "Same kick, two rules" explainer was removed (user, Oct 10 2026): the arcade cabinet already plays it, 1891 switch included.
{assert.doesNotMatch(exp,/Same kick, two rules|aria-labelledby="pk-play"/);
 console.log('PASS explainer removed: the cabinet is the one place to take penalties');}

// 5. Modern gallery language + contract.
{assert.match(exp,/className=\{`\$\{g\.room\} \$\{s\.root\}`\}/);assert.match(exp,/'--accent':ACCENT\.red/);
 assert.match(exp,/<WallLabel as="h1" title="The penalty kick"/);assert.match(exp,/import StepCheck from '\.\.\/modern\/StepCheck'/);
 assert.match(exp,/\{\(checked\|\|played\)&&<Ending [^\n]*onComplete=\{onComplete\} reached=\{checked\|\|played\}\/>/,'the ending (and onComplete) only at a real end: the quick check done or a cabinet round finished');
 assert.ok(!/useEffect\([^\n]*onComplete\(/.test(exp+cab),'onComplete is never called on mount');assert.ok(!/onComplete/.test(cab),'the cabinet reports a round, the page owns the ending');
 assert.equal(C.CHECKS.length,3);
 assert.ok(!/from 'three'|import\('three'|Press Start|Pixelify|font-face|<canvas|image-rendering/i.test(exp.replace(/\/\*[\s\S]*?\*\//g,'')+css),'the page itself stays modern: the pixel art lives only in the cabinet');
 for(const f of ['StoryDrawer.tsx','StoryDrawer.module.css'])assert.ok(!files.includes(f),f+' removed (the page tells the story)');
 for(const f of ['Cabinet.tsx','Cabinet.module.css','scene.ts','motion.ts'])assert.ok(files.includes(f),f+' (the cabinet)');
 assert.ok(!/#[0-9a-f]{6}/i.test(css.replace(/#8c8a84/,'')),'no colours of its own beyond the keeper grey');
 assert.match(exp,/data-museum-experience="penalty-1891"/);assert.match(exp,/role="dialog" aria-modal="true"/);
 assert.match(exp,/import ExperienceBack from '\.\.\/ExperienceBack';/);assert.equal((exp.match(/<ExperienceBack/g)||[]).length,1);
 assert.ok(!/NavigationButton|immediate/.test(exp));assert.match(exp,/e\.key==='Escape'/);
 for(const m of css.matchAll(/min-height:(\d+)px/g))assert.ok(+m[1]>=44,'controls ≥ 44 px');
 assert.ok(!/(^|\})\s*(button|input|a|p|span|svg)[\s:{]/m.test(css),'every selector carries a local class');
 console.log('PASS modern gallery + contract: shared room, red accent, wall label, shared quick check + ending → onComplete, shared Back, 44 px');}

// 6. Heat: 0 rAF; one-shot WAAPI for the flight and the dive; timers cleared; reduced motion static.
{assert.ok(!/requestAnimationFrame|setInterval/.test(exp),'no rAF or polling');assert.ok(!/infinite/.test(css));
 assert.match(exp,/bEl\.animate\(/);assert.match(exp,/kEl\.animate\(/);assert.match(exp,/if\(reduced\|\|!bEl\|\|typeof bEl\.animate!=='function'\)\{done\(\);return;\}/,'reduced motion: no flight');
 assert.match(exp,/useEffect\(\(\)=>\(\)=>\{anims\.current\.forEach\(a=>a\.cancel\(\)\);timers\.current\.forEach\(clearTimeout\);\},\[\]\)/,'cancelled on unmount');
 for(const m of css.matchAll(/transition:([^;}]*)/g))assert.ok(!/\b(width|height|top|left|right|bottom|margin|padding|r|cx|cy)\b/.test(m[1].replace(/var\([^)]*\)/g,'')),'compositor-only transition: '+m[1]);
 assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);assert.ok(!/AudioContext\(/.test(exp));assert.match(exp,/museumSfx\./);
 console.log('PASS heat: 0 rAF, one-shot WAAPI flight + dive, timers/animations cancelled, compositor-only motion, reduced motion');}

// 7. The arcade cabinet: placement and links on the modern page, the full game, the shared model.
{const iCab=exp.indexOf('<Cabinet '),iStory=exp.indexOf('aria-labelledby="pk-story"'),iPlay=Infinity;
 assert.ok(iCab>0&&iCab<iStory&&iCab<iPlay,'the cabinet sits high: right after the opening, before the story and the explainer');
 assert.match(exp,/data-take-penalty onClick=\{toCabinet\}>Take a penalty →/);assert.match(exp,/cabSec\.current\?\.scrollIntoView\(/);assert.match(exp,/setCabWake\(n=>n\+1\)/);
 assert.match(cab,/\(phase==='intro'\?primary\.current:shootBtn\.current\)\?\.focus\(/,'"Take a penalty" focuses the cabinet');
 assert.match(exp,/title=\{<>Penalty, 16-bit <span[^>]*>· Play it<\/span><\/>\}/,'its own wall label');
 assert.match(exp,/onRound=\{\(\)=>setPlayed\(true\)\}/);assert.match(exp,/onStory=\{toStory\}/);
 // The game, all of it: cutscene beats + skip, drag aim with springs, hold-to-power, the keeper's dive (scene), the crowd, the
 // 1891 replay, five kicks, the score screen with the shot map, the other-rules count, a rotating quick check, Take five more.
 assert.match(cab,/STORY\[beat-1\]\.head/);assert.match(cab,/Skip: step up/);assert.match(cab,/Step up to the spot/);
 assert.match(cab,/stepSpring\(X,dt,170,24\)/);assert.match(cab,/rubber\(x,AIM_X\[0\],AIM_X\[1\],\.55\)/);
 assert.match(cab,/CHARGE_S=1\.15/);assert.match(cab,/const band=bandOf\(C\.target\)/);assert.match(cab,/onPointerDown=\{shootDown\} onPointerUp=\{shootUp\}/);
 assert.match(cab,/fire\(\{x:k\.x,y:k\.y,dive:k\.dive\},\{era:other,power:k\.power,replay:k\}\)/,'same kick, same dive, other rules');
 assert.match(cab,/ROUND=5/);assert.match(cab,/Take five more/);assert.match(cab,/Same five kicks under \{ERA_NAME\[otherEra\]\}/);
 assert.match(cab,/const c=CHECKS\[rounds%CHECKS\.length\]/,'one quick-check question per round, in turn');
 assert.match(cab,/museumSfx\.crowd\(\)/);assert.match(scene,/DIVE_KINDS/);assert.match(scene,/crowd|stadium/i);
 for(const h of ['data-cabinet','data-cab-start','data-cab-skip','data-cab-shoot','data-cab-score','data-cab-era-button','data-phase'])assert.ok(cab.includes(h),'hook '+h);
 // One model for both pieces (the numbers agree).
 assert.match(cab,/from '\.\/model'/);assert.match(scene,/from '\.\/model'/);assert.match(exp,/from '\.\/model'/);
 assert.ok(!/7\.32\s*[,;)]|=\s*11\b|GOAL_W\s*=/.test(cab.replace(/aria-label=\{`[^`]*`\}/g,'').replace(/\/\*\*[\s\S]*?\*\//g,'')),'no goal numbers of its own');
 console.log('PASS cabinet: high on the page, "Take a penalty" scrolls + focuses, full shootout (cutscene, aim, power, dive, replay, score screen, quick check), one shared model');}

// 8. Cabinet heat: lazy, asleep off-screen and at rest, disposed; crisp integer pixels; reduced motion; 390 px.
{assert.match(cab,/import type \{PenaltyScene,SceneState,Shot\} from '\.\/scene'/);assert.ok(!/^import [^t][^\n]*from '\.\/scene'/m.test(cab),'three.js is not in the page bundle');
 assert.match(cab,/if\(!near\)return;[^\n]*\n\s*import\('\.\/scene'\)/,'the stage loads only when the cabinet comes near');
 assert.match(cab,/new IntersectionObserver\(es=>\{for\(const e of es\)\{/);assert.match(cab,/scene\.current\?\.setAwake\(inView\.current\)/);assert.match(cab,/s\.setAwake\(inView\.current\)/);
 assert.match(cab,/return\(\)=>\{cancelled=true;scene\.current\?\.dispose\(\);scene\.current=null;\}/,'disposed on unmount');
 assert.match(cab,/return\(\)=>\{io\.disconnect\(\);pre\.disconnect\(\);\}/);assert.match(cab,/useEffect\(\(\)=>\(\)=>aimLoop\.current\?\.stop\(\),\[\]\)/);assert.match(cab,/useEffect\(\(\)=>\(\)=>powerLoop\.current\?\.stop\(\),\[\]\)/);
 assert.ok(!/setInterval|requestAnimationFrame/.test(cab),'no loop of its own: springs use motion.loop (stops at rest), the stage renders on demand');
 // scene.ts: asleep → never requests a frame; a shot fired asleep jumps to its end; the on-demand loop stops when nothing moves.
 assert.match(scene,/setAwake\(on\)\{if\(on===awake\)return;awake=on;if\(!on\)\{cancelAnimationFrame\(raf\);raf=0;last=0;\}else wake\(\);\}/);
 assert.match(scene,/const wake=\(\)=>\{if\(!raf&&!disposed&&!document\.hidden&&awake\)\{/);assert.match(scene,/raf=0;if\(disposed\|\|document\.hidden\|\|!awake\)return;/);
 assert.match(scene,/if\(opts\.reducedMotion\|\|document\.hidden\|\|!awake\)\{\/\/ jump/);assert.match(scene,/if\(busy\(\)\)raf=requestAnimationFrame\(frame\);else last=0;/);
 assert.match(scene,/dispose\(\)\{disposed=true;cancelAnimationFrame\(raf\);raf=0;ro\.disconnect\(\);document\.removeEventListener\('visibilitychange',onVis\);/);
 assert.match(scene,/renderer\.dispose\(\);renderer\.forceContextLoss\(\);/);
 // Crisp pixels: whole buffer pixels, nearest-neighbour upscale, the same scale rule in both files.
 assert.match(cab,/c\.style\.width=`\$\{Math\.floor\(w\/p\)\*p\}px`;c\.style\.height=`\$\{Math\.floor\(h\/p\)\*p\}px`/);assert.match(cab,/pixel:pxRef\.current\|\|undefined/);
 assert.match(scene,/const scaleOf=\(w:number,h:number\)=>opts\.pixel\?\?pixelScale\(w,h\)/);
 const rule=x=>(x.match(/Math\.max\(2,Math\.min\(4,Math\.round\(Math\.max\(w,h\)\/440\)\)\)/)||[]).length;assert.ok(rule(cab)===1&&rule(scene)===1,'one pixel rule');
 assert.match(ccss,/\.canvas\{[^}]*image-rendering:pixelated/);
 // Reduced motion: no hold-charge loop, no glide, the stage jumps (static screen, tap to shoot); sprite animations off.
 assert.match(cab,/if\(!reducedRef\.current\)runPower\(\)/);assert.match(cab,/if\(reducedRef\.current\)\{X\.x=X\.target=clamp/);assert.match(cab,/reducedMotion:reducedRef\.current/);
 assert.match(cab,/'Drag to aim · tap SHOOT'/);assert.match(ccss,/@media \(prefers-reduced-motion:reduce\)\{[^]*animation:none!important/);
 assert.ok(!/infinite/.test(ccss),'nothing loops forever');
 // Fits a 390 px phone: fluid width, a taller screen and the cutscene + deck under it below 700 px; ≥ 44 px controls.
 assert.match(ccss,/\.cab\{[^}]*width:100%;max-width:960px/);assert.match(ccss,/@media \(max-width:699px\)\{[^]*\.screen\{aspect-ratio:5\/6\}[^]*\.introCard\{position:static/);
 for(const m of ccss.matchAll(/min-height:(\d+)px/g))assert.ok(+m[1]>=44,'cabinet controls ≥ 44 px');
 assert.ok(!/(^|\})\s*(button|input|a|p|span|svg|canvas)[\s:{]/m.test(ccss),'every selector carries a local class');
 // Pixel fonts: self-hosted, files present (OFL).
 for(const f of ['press-start-2p-latin.woff2','pixelify-sans-latin.woff2','OFL-pressstart2p.txt','OFL-pixelifysans.txt']){assert.ok(fs.existsSync(path.join(root,'public/museum/experiences/penalty-1891/fonts',f)),f);}
 assert.match(ccss,/@font-face\{font-family:'PK Press Start';src:url\('\/museum\/experiences\/penalty-1891\/fonts\/press-start-2p-latin\.woff2'\)/);
 // Escape: the score screen closes first (capture), the page's Escape (leave) respects it.
 assert.match(cab,/window\.addEventListener\('keydown',k,true\)/);assert.match(exp,/if\(e\.defaultPrevented\)return;/);
 console.log('PASS cabinet heat: lazy three.js, IO sleep off-screen, 0 rAF at rest, disposed; integer pixels; reduced motion tap-to-shoot; 390 px fit; fonts');}

// 9. motion.ts in Node: the spring settles, the rubber band is bounded, and loop() stops by itself (no rAF at rest).
{const Mo=require('../'+dir+'motion.ts');const sp=Mo.spring(0);sp.target=1;let n=0;while(!Mo.stepSpring(sp,1/60,170,24)&&n<600)n++;assert.ok(n<300&&sp.x===1&&sp.v===0,'settles');
 assert.ok(Mo.rubber(99,-1,1,.5)<1.5&&Mo.rubber(-99,-1,1,.5)>-1.5&&Mo.rubber(.3,-1,1,.5)===.3,'rubber band');
 let q=[],t=0;global.requestAnimationFrame=f=>{q.push(f);return q.length;};global.cancelAnimationFrame=()=>{};
 const s2=Mo.spring(0);s2.target=1;const l=Mo.loop(dt=>!Mo.stepSpring(s2,dt,170,24));let frames=0;
 while(q.length&&frames<1000){const f=q.shift();t+=16.7;f(t);frames++;}
 assert.ok(frames<300&&q.length===0&&!l.running,'the chain stops when the spring rests: '+frames+' frames, then none');
 delete global.requestAnimationFrame;delete global.cancelAnimationFrame;
 console.log('PASS motion: spring settles in '+frames+' frames, rubber band bounded, loop stops at rest');}
