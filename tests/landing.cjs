// The title screen at `/` (Oct 9 2026, docs/performance-guide.md "Title screen at /"; /start was removed): the route is static; a save code is REQUIRED to
// play (no Play until a code is made or restored, except the "saving is taking a break" outage state, and the returning-code fast
// path); the real save components are used through one adapter; motion stays heat-safe (spring rAF stops at rest, ambient loops
// calm after 8 s and pause when hidden, tilt only after a gesture, reduced motion is static); no WebGL; accessibility basics.
// usage: node tests/landing.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const DIR='components/landing',files=fs.readdirSync(path.join(ROOT,DIR)).map(f=>`${DIR}/${f}`),tsx=files.filter(f=>/\.tsx?$/.test(f));
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
function load(file){const out=ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const m={exports:{}};vm.runInNewContext(out,{module:m,exports:m.exports,require:()=>{throw new Error('no imports expected');},Math});return m.exports;}
const actions=read(`${DIR}/TitleActions.tsx`),scene=read(`${DIR}/TitleScene.tsx`),landing=read(`${DIR}/Landing.tsx`),adapter=read(`${DIR}/saveCodeAdapter.tsx`),css=read(`${DIR}/Title.module.css`);

// 1. The route is static: force-static, no request data, server components; after a build it is prerendered.
{const page=read('app/page.tsx'),rootFiles=['app/page.tsx','components/root/RootSwitch.tsx','components/root/Game.tsx','components/root/gameLoader.ts','components/root/useRootView.ts','lib/rootView.ts','components/IslandLoadingStatic.tsx'];
 assert.match(page,/export const dynamic='force-static';/,'force-static');
 assert(!/^'use client'/.test(page)&&!/^'use client'/.test(landing),'page and Landing are server components');
 for(const f of [...rootFiles,...tsx])assert(!/\b(cookies|headers|useSearchParams)\s*\(|searchParams/.test(strip(read(f))),`${f} reads no request data`);
 assert.match(page,/canonical:'\/'/);assert.match(page,/openGraph:\{title,description,url:'\/'/,'Open Graph tags point at /');
 const manifest=path.join(ROOT,'.next/prerender-manifest.json'),html=path.join(ROOT,'.next/server/app/index.html'),buildId=path.join(ROOT,'.next/BUILD_ID');
 // Only a build made after this page changed tells us anything (the repo's .next can be an older build).
 const fresh=fs.existsSync(buildId)&&fs.existsSync(html)&&fs.statSync(buildId).mtimeMs>fs.statSync(path.join(ROOT,'app/page.tsx')).mtimeMs;
 if(fresh&&fs.existsSync(manifest)){const m=JSON.parse(fs.readFileSync(manifest,'utf8'));assert(m.routes['/'],'/ is prerendered (next build ○)');assert(!m.routes['/start'],'no /start route');
  const h=fs.readFileSync(html,'utf8');assert.equal((h.match(/<h1[\s>]/g)||[]).length,1,'one h1 in the built page');
  assert(h.includes('data-root-landing')&&h.includes('data-root-game')&&h.includes('data-root-loader'),'both screens are prerendered');
  assert(h.indexOf('dataset.rootView')<h.indexOf('data-root-landing'),'the pre-paint flag runs before either screen');
  assert(!/<link[^>]+rel="preload"[^>]+\/splash\/(hero|keeper|cat|rival)/.test(h),'no loader-cast preloads for title-screen visitors');
  if(h.includes('data-title-state'))assert(!h.includes('data-landing-play'),'no Play in the static HTML: it appears only after a code (or a saving break)');}
 assert.match(read('next.config.mjs'),/destination: '\/island-return'/,'the /?from= rewrite is untouched');}

// 2. A save code is required to play.
{assert(!/PlayButton/.test(strip(landing)),'no Play on the title screen itself');
 const block=name=>{const i=actions.indexOf(`{state==='${name}'&&`);assert(i>0,`state ${name} renders`);const j=actions.indexOf('</div>}',i);return actions.slice(i,j);};
 assert(!/PlayButton|data-landing-play/.test(block('new')),'new players see Start and "I have a save code", no Play');
 assert.match(block('new'),/data-title-start/);assert.match(block('new'),/data-title-restore/);
 // Every Play is the gold water pill (WaterPill): returning (tap), ready / restored (straight from the save flow), break (tap).
 assert.match(block('returning'),/<WaterPill card="returning" label="Play"/);
 assert.match(block('ready'),/<WaterPill card="ready" label="Play" sub="You’re all set!" autoStart\/>/);
 assert.match(block('restored'),/<WaterPill card="restored" label="Play" sub="Welcome back!" autoStart apply=\{\(\)=>applyRestore\.current\?\.\(\)\}\/>/);
 assert.match(block('break'),/<WaterPill card="break" label="Play"\/>/);
 assert.equal((strip(actions).match(/<WaterPill /g)||[]).length,4,'Play appears only in returning, ready, restored and break');
 assert(!/PlayButton/.test(strip(actions)),'the title screen no longer uses the nav-button Play');
 for(const f of tsx)assert(!/Play without a code|No code\? You can still play|showNotNow/.test(strip(read(f))),`${f}: no skip-the-code path`);
 // Returning fast path: a stored code goes straight to Welcome back + Play.
 assert.match(actions,/const have=m\.getLocalCode\(\);setCode\(have\);setState\(have\?'returning':'new'\);/,'stored code → returning');
 // Only these reach 'ready': the create component's onDone(code) after "I saved it".
 assert.match(actions,/const created=\(c:string\|null\)=>\{\s*if\(!c\)\{void leave\('break'\);return;\}/,'no code → break, never ready');
 assert.match(actions,/void leave\('ready'\)/);
 // The outage state: unavailable / server down / create error / restore "play today" → the distinct break card with Play.
 assert.match(actions,/const ok=await saves\.isSavingAvailable\(\)\.catch\(\(\)=>false\);/,'checks availability (a failed check counts as unavailable)');
 assert.match(actions,/if\(!ok\)\{pendingMorph\.current=el\.getBoundingClientRect\(\);setState\('break'\);return;\}/);
 assert.match(actions,/const onCreatePhase=\(p:string\)=>\{(?:setCreatePhase\(p\);)?if\(p==='unavailable'\|\|p==='error'\)void leave\('break'\);\};/);
 assert.match(actions,/onDone=\{restored=>\{if\(!restored\)void leave\('break'\);\}\}/);
 assert.match(actions,/\.then\(m=>\{[\s\S]*?\},\(\)=>\{if\(live\)setState\('break'\);\}\)/,'the save module failing to load is a saving break, not a lock-out');
 assert.match(block('break'),/Saving is taking a break/);assert.match(block('break'),/You can still play today/);
 assert.match(block('break'),/styles\.breakCard/);assert.match(css,/\.breakCard::before\{[^}]*background:var\(--deep\);border:3px dashed var\(--gold\)/,'the outage card looks different');}

// 3. The real save components, through one adapter, in required mode; no save logic of our own.
{assert.match(adapter,/import RealCreate from '@\/components\/saves\/SaveCodeCreate';/);
 assert.match(adapter,/import RealRestore from '@\/components\/saves\/SaveCodeRestore';/);
 assert.match(adapter,/export \{isSavingAvailable,getLocalCode\} from '@\/lib\/saves\/client';/);
 assert.match(adapter,/<RealCreate required autoStart /,'create: required (no "Not now"), starts on the Start tap');
 assert.match(adapter,/<RealRestore required /);
 assert.match(adapter,/if\(restored\)\{window\.history\.replaceState\(window\.history\.state,'','\/'\);/,'a restore reloads a bare / (no ?coffee=thanks counted twice)');
 assert.match(adapter,/ onPlay=\{onPlay\}/,'the water loader runs before the save is applied');
 for(const f of tsx.filter(f=>!f.endsWith('saveCodeAdapter.tsx')))assert(!/from '@\/(lib|components)\/saves/.test(read(f)),`${f}: only the adapter imports the save code`);
 // The only storage use: the one-shot hand-off flags for the reload path (handoffMotion.ts / waterLaunch.ts); the in-game flag is
 // lib/rootView.ts's.
 for(const f of files)assert(!/localStorage|sessionStorage|indexedDB|sendBeacon|\/api\/save/.test(strip(read(f)).replace("sessionStorage.setItem(HANDOFF_STORAGE_KEY,'1')",'').replace("sessionStorage.setItem(HANDOFF_KEY,'tan')",'')),`${f}: no save logic or storage of its own`);
 assert.match(actions,/import\('\.\/saveCodeAdapter'\)/,'loaded on demand');
 const create=read('components/saves/SaveCodeCreate.tsx');assert.match(create,/required/,'the real create supports required mode');
 assert.match(create,/Which word comes first\?/,'the code screen has the first-word check');}

// 4. Motion is heat-safe.
{const M=load(`${DIR}/motion.ts`);
 assert.equal(M.CALM_MS,8000,'ambient calms after 8 s');
 let a={x:0,v:0},n=0;while(!M.settled(a,1)&&n<600){a=M.springStep(a,1,1/60);n++;}
 assert(n<180,`the spring settles in under 3 s (${n} frames)`);assert(Math.abs(a.x-1)<.01);
 let over=0;a={x:0,v:0};for(let i=0;i<120;i++){a=M.springStep(a,1,1/60);over=Math.max(over,a.x);}assert(over>1&&over<1.15,'a spring, not linear: one small overshoot');
 assert.equal(M.springStep({x:0,v:0},1,5).x,M.springStep({x:0,v:0},1,1/30).x,'a slow frame is clamped');
 const prev={x:.5,y:.5};assert.equal(M.tiltTarget(9.1,9.1,0,0,prev),prev,'tilt noise under the deadband is ignored');
 const i=M.invert({left:10,top:20,width:100,height:50},{left:0,top:0,width:200,height:100});assert.deepEqual([i.x,i.y,i.sx,i.sy],[10,20,.5,.5],'FLIP inverse');
 // The frame loop only runs while the spring moves, and stops at rest / when hidden.
 assert.match(scene,/if\(settled\(ax,tx\)&&settled\(ay,ty\)\)\{[^}]*raf=0;/,'rAF ends when settled');
 assert.match(scene,/const kick=\(\)=>\{if\(raf\|\|document\.hidden\|\|'exit' in el\.dataset\|\|'launch' in el\.dataset\)return;/);
 assert.match(scene,/if\(document\.hidden\)\{el\.dataset\.hidden='';cancelAnimationFrame\(raf\)/,'hidden tab: no frames');
 assert.match(scene,/if\(matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches\)\{el\.dataset\.calm='';return;\}/,'reduced motion attaches nothing');
 assert.equal((scene.match(/requestAnimationFrame\(/g)||[]).length,2,'rAF is requested only by kick and the running frame');
 assert(!/setInterval/.test(scene+actions),'no polling');
 // Tilt only after a gesture.
 assert.equal((scene.match(/addEventListener\('deviceorientation'/g)||[]).length,1);
 assert.match(scene,/const startTilt=\(\)=>\{if\(tilting\)return;tilting=true;g0=b0=NaN;window\.addEventListener\('deviceorientation'/);
 assert.match(scene,/const onDown=\(e:PointerEvent\)=>\{[^\n]*armTilt\(\);\};/,'Android: after the first touch');
 assert.doesNotMatch(scene,/className=\{styles\.tilt\}/,'no Tilt button on the title screen (user)');
 assert.match(scene,/const calm=\(\)=>\{el\.dataset\.calm='';stopTilt\(\);\};/,'calm drops the tilt listener');
 // Trick cast: stills until the sprite strips land; no timed src swapping (it was not smooth).
 const art=read(`${DIR}/TitleArt.tsx`);assert.match(art,/import CAST_SIZES from '@\/public\/splash\/cast\.json';/,'sizes from cast.json, not hardcoded');
 assert.match(art,/const SLOTS=\[\{id:'trick-boy',cls:'boy'\},\{id:'trick-girl',cls:'girl'\}\] as const;/);
 assert.match(art,/pct:SIZES\[c\.id\]\.width\/513\*24/,'one px-per-metre scale');
 // Sprite strips: CSS steps() only, paused when calm / hidden, the still under reduced motion.
 // Grid sheets (Oct 9 2026, trick medleys): the picture steps down the rows over the whole loop, the img steps across the columns once per
 // row, so each frame is one whole cell; a one-row strip is rows 1. Every sheet stays ≤ 16384 px and its cells tile it exactly.
 assert.match(css,/\.spriteBox\[data-ready\] \.sprite\{animation:spriteRows var\(--dur\) steps\(var\(--rows\)\) infinite\}/,'the sheet plays once decoded');
 assert.match(css,/\.spriteBox\[data-ready\] \.sprite img\{animation:spriteRun calc\(var\(--dur\) \/ var\(--rows\)\) steps\(var\(--cols\)\) infinite\}/);
 assert.match(css,/@keyframes spriteRows\{from\{transform:translateY\(0\)\}to\{transform:translateY\(-100%\)\}\}/);assert.match(css,/@keyframes spriteRun\{from\{transform:translateX\(0\)\}to\{transform:translateX\(-100%\)\}\}/);
 assert.match(art,/width:`\$\{c\.strip\.cols\*100\}%`,height:`\$\{c\.strip\.rows\*100\}%`/,'the picture is cols × rows cells');
 assert.match(art,/cols:s\.cols\?\?s\.frames,rows:s\.rows\?\?1/,'a strip without cols/rows is one row');
 {const casts=JSON.parse(read('public/splash/cast.json'));
  for(const id of ['trick-boy','trick-girl']){const st=casts[id].strip;if(!st)continue;const cols=st.cols??st.frames,rows=st.rows??1;
   assert.equal(cols*rows,st.frames,`${id}: cols × rows = frames`);assert(st.fps>=11&&st.fps<=16,`${id}: real-time fps`);
   assert(Math.abs(st.cell[0]/st.cell[1]-casts[id].width/casts[id].height)<.01&&Math.abs(st.smCell[0]/st.smCell[1]-casts[id].width/casts[id].height)<.01,`${id}: cells keep the still's aspect`);
   for(const [f,[cw,ch]] of [[`${id}-strip.avif`,st.cell],[`${id}-strip-sm.avif`,st.smCell]]){const b=fs.readFileSync(path.join(ROOT,'public/splash',f)),i=b.indexOf('ispe');
    assert.deepEqual([b.readUInt32BE(i+8),b.readUInt32BE(i+12)],[cw*cols,ch*rows],`${f}: the grid is exactly cols × rows cells`);assert(Math.max(cw*cols,ch*rows)<=16384,`${f} ≤ 16384 px`);}}}
 assert.match(scene,/img\.decode\(\)\.then\(\(\)=>\{box\.dataset\.ready='';\}/);assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.spriteBox\{display:none\}\}/);
 assert.match(css,/:is\(\.palm,\.palmB,\.flag,\.glint,\.castLife,\.ballA,\.ballB,\.sun,\.sprite,\.sprite img\)\{animation-play-state:paused\}/);
 // Ambient transforms run on <svg>/HTML boxes (compositor), not on elements inside an SVG (main-thread repaint every frame).
 assert(!/<(g|path)[^>]*className=\{[^}]*(palm|flag|glint)/.test(art),'no ambient class on SVG children');
 assert(!/srcset=|setTimeout\(\(\)=>frameStep/.test(scene),'no timed frame swaps');
 assert(!/hero-kick|'keeper'|hero-cheer/.test(art),'the title screen shows the trick cast only');
 // Ambient loops pause when calm or hidden; reduced motion is static; will-change only while moving.
 assert.match(css,/\.screen:is\(\[data-calm\],\[data-hidden\]\) :is\(\.palm,\.palmB,\.flag,\.glint,\.castLife,\.ballA,\.ballB,\.sun,\.sprite,\.sprite img\)\{animation-play-state:paused\}/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.page \*,\.page \*::before,\.page \*::after\{animation:none!important;transition:none!important\}\}/);
 assert.match(css,/\.screen\[data-moving\] \.layer\{will-change:transform\}/);assert(!/will-change/.test(strip(css).replace('.screen[data-moving] .layer{will-change:transform}','')),'no permanent will-change');
 for(const m of css.matchAll(/@keyframes \w+\{([\s\S]*?)\}\}/g))assert(!/(?:^|[{;])\s*(width|height|top|left|right|bottom|margin|padding)\s*:/.test(m[1]),`keyframes animate transform/opacity only: ${m[0].slice(0,40)}`);
 assert(!/::view-transition/.test(css),'no global view-transition rules in a CSS module');}

// 5. No WebGL, canvas, video or audio on the page.
{for(const f of files){const s=strip(read(f));assert(!/webgl|getContext\(|<canvas|from 'three'|@babylonjs|HoloFoil|PlayerCard|<video|<audio|autoPlay/i.test(s),`${f}: no WebGL, canvas or media`);}}

// 6. Accessibility basics.
{const all=tsx.map(read).join('\n');
 assert.equal((all.match(/<h1[\s>]/g)||[]).length,1,'one h1');assert.match(landing,/<h1 className=\{styles\.title\} aria-label="Futbol Island">/,'the split title keeps its name');
 for(const f of tsx){const s=read(f);for(const m of s.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)){const [,attrs,body]=m;
  assert(/aria-label=/.test(attrs)||body.replace(/<[^>]+>/g,'').replace(/\{[^}]*\}/g,'x').trim().length>0,`${f}: button labelled: ${m[0].slice(0,80)}`);}}
 assert.match(read(`${DIR}/PlayButton.tsx`),/<NavigationButton label=\{label\}/,'Play has its label');
 assert(!/\bimmediate\b/.test(strip(read(`${DIR}/PlayButton.tsx`))),'nav buttons keep the shrink-to-icon press');
 assert.match(actions,/role="dialog" aria-modal="true" aria-labelledby="save-sheet-title"/);assert.match(actions,/e\.key==='Escape'/);
 // Contrast: text/background token pairs meet WCAG AA (4.5:1), light and dark.
 const tokens=b=>Object.fromEntries([...b.matchAll(/--([\w-]+):(#[0-9a-f]{6})\b/gi)].map(m=>[m[1],m[2]]));
 const light=tokens(css.slice(css.indexOf('.page{'),css.indexOf('@media(prefers-color-scheme:dark)')));
 const db=css.slice(css.indexOf('@media(prefers-color-scheme:dark)'));const dark={...light,...tokens(db.slice(0,db.indexOf('}}')))};
 const lum=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
 const ratio=(a,b)=>{const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+.05)/(y+.05);};
 for(const [scheme,t] of [['light',light],['dark',dark]])for(const [fg,bg] of [['on-sea','sea'],['on-pink','pink'],['on-deep','deep'],['deep-soft','deep'],['ink','paper'],['ink-soft','paper']]){
  assert(t[fg]&&t[bg],`${scheme} ${fg}/${bg}`);const r=ratio(t[fg],t[bg]);assert(r>=4.5,`${scheme} ${fg} on ${bg}: ${r.toFixed(2)} < 4.5`);}
 // Text inputs (the real restore boxes) are 16px or more.
 assert.match(read('components/saves/SaveCode.module.css'),/\.input\{[^}]*font:700 (1[6-9]|[2-9]\d)px/,'restore inputs ≥16px');}

// 8. Play hands off into the game's own loading screen (handoffMotion.ts, Handoff.tsx, IslandLoading's flag).
{const play=read(`${DIR}/PlayButton.tsx`),hand=read(`${DIR}/Handoff.tsx`),motion=read(`${DIR}/handoffMotion.ts`),loader=read('components/IslandLoading.tsx'),loaderCss=read('components/IslandLoading.module.css');
 // Order: mark the hand-off (html flag + [data-exit] + synced track) BEFORE the hidden loader mounts; the route switches only when
 // the sequence has shown the loader.
 // The morph hand-off is switched OFF (user, Oct 9 2026): Play shows the game's normal loader and navigates, as before.
 assert.match(play,/export const HANDOFF_ENABLED=false;/,'hand-off off');
 // `/` switches to the game in place (enterGame), never a navigation.
 assert.match(play,/onNavigate=\{\(\)=>\{if\(!HANDOFF_ENABLED\)\{enterGame\(\);return;\}warm\(\);markHandoff\(\);setLaunching\(true\);\}\}/);
 assert.match(play,/HANDOFF_ENABLED\?<Handoff onDone=\{enterGame\}\/>:<div className=\{styles\.launch\} data-landing-launch><IslandLoading\/><\/div>/,'off: the normal loader overlay');
 assert(!/useRouter|router\.(push|prefetch)/.test(strip(play)),'no route change');
 assert.match(hand,/<IslandLoading\/>/,'the hand-off target is the real IslandLoading');assert.match(hand,/style=\{\{opacity:0\}\}/,'mounted hidden');
 assert.match(motion,/document\.querySelector<HTMLElement>\('\[data-title-scene\]'\)\?\.setAttribute\('data-exit',''\)/);
 assert.match(motion,/document\.documentElement\.dataset\.islandHandoff=/);
 // Sequence: bottom row first, then the actions, then the track; the art morphs after; the loader fades in last.
 const delay=re=>Number((css.match(re)||[])[1]??0);
 assert(delay(/\.screen\[data-exit\] \.grownRow\{animation:exitDown \.22s/)===0||/\.screen\[data-exit\] \.grownRow\{animation:exitDown \.22s cubic/.test(css),'links out first');
 assert.match(css,/\.screen\[data-exit\] \.actions\{animation:exitDown \.3s \.07s/,'then the buttons');
 assert.match(css,/\.screen\[data-exit\] \.track\{display:block;animation:trackIn \.24s \.2s/,'then the loader track under the title');
 assert.match(css,/\.track\{display:none\}/,'no hidden infinite track animation at rest');
 assert.match(motion,/const reveal=loaderWrap\.animate\(\[\{opacity:0\},\{opacity:1\}\],\{delay:900,duration:260/,'one ~1.3 s sequence, loader last');
 // Compositor-only, run once, no frame loop.
 for(const m of strip(motion).matchAll(/\.animate\(\[([\s\S]*?)\],\{/g))assert(!/(width|height|top|left|background|filter)\s*:/.test(m[1]),`keyframes: transform/opacity only: ${m[1].slice(0,60)}`);
 assert(!/requestAnimationFrame|setInterval/.test(strip(motion)+strip(hand)),'no frame loop or polling');
 assert(!/iterations:\s*Infinity/.test(motion),'nothing left running');
 assert.match(motion,/if\(reduced\)\{await loaderWrap\.animate\(\[\{opacity:0\},\{opacity:1\}\],\{duration:160/,'reduced motion: a quick cross-fade');
 assert.match(scene,/const kick=\(\)=>\{if\(raf\|\|document\.hidden\|\|'exit' in el\.dataset\|\|'launch' in el\.dataset\)return;/,'parallax stops for the hand-off');
 // IslandLoading: the flag only removes the entrance replay and syncs the track; cold start (no flag) is unchanged.
 assert.match(loaderCss,/:global\(html\[data-island-handoff\]\) \.screen:not\(\.exiting\) \.art,:global\(html\[data-island-handoff\]\) \.screen:not\(\.exiting\) \.castMember\{animation:none\}/);
 assert.match(loaderCss,/\.art\{transform-origin:50% 100%;animation:coastArrive 3s/,'the cold-start entrance is still there');
 assert.match(loader,/if\(!Number\.isFinite\(start\)\|\|start<=1\)return;/,'no flag: no track change');
 const key=(motion.match(/HANDOFF_STORAGE_KEY='([^']+)'/)||[])[1];assert(key&&read('components/islandLoadingBoot.ts').includes(`sessionStorage.getItem('${key}')`),'the reload path shares the key');
 assert.match(loader,/import \{HANDOFF_BOOT,takeLoaderContinuation\} from '\.\/islandLoadingBoot';/);
 // The restore path (a full reload into `/`) starts the game's loader settled too.
 assert.match(adapter,/if\(HANDOFF_ENABLED\)markReloadHandoff\(\);/,'the reload flag only when the hand-off is on');}

// 9. Play = the water loader, then the full-tan hand-off with no second loader (waterLaunch.ts, WaterPill.tsx, IslandLoading tan mode).
{const water=read(`${DIR}/waterLaunch.ts`),pill=read(`${DIR}/WaterPill.tsx`),restore=read('components/saves/SaveCodeRestore.tsx');
 // The level: rises, never fakes full before the game is ready, fills once ready (not before the minimum time).
 const src=ts.transpileModule(water.replace(/^'use client';/,'').replace(/export function waitForGame[\s\S]*?\n\}\n/,'').replace(/export function runWaterFill[\s\S]*$/,''),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const m={exports:{}};vm.runInNewContext(src,{module:m,exports:m.exports,Math,document:{},sessionStorage:{},require:id=>{if(id==='../root/islandPreload')return {islandWarmSettled:()=>Promise.resolve()};assert.equal(id,'../root/gameLoader');return {loadGame:()=>Promise.resolve(null)};}});const L=m.exports;
 assert(L.waitingLevel(200)<L.waitingLevel(1500)&&L.waitingLevel(60000)<=.9,'waiting: rises and stays below 90 %');
 let lv=0;for(let t=0;t<30000;t+=16)lv=L.nextLevel(lv,t,.016,false);assert(lv<.91,'not ready: never full');
 lv=0;for(let t=0;t<600;t+=16)lv=L.nextLevel(lv,t,.016,true);assert(lv<.9,'ready early: still eases, no jump');
 for(let t=600;t<3000;t+=16)lv=L.nextLevel(lv,t,.016,true);assert(lv>.995,'ready: fills to the top');
 // Real progress: the game's own code (Town and its module graph) is what the water waits for.
 assert.match(water,/return Promise\.race\(\[loadGame\(\)\.then\(\(\)=>islandWarmSettled\(\)\)/,'… and the island warm-up (components/root/islandPreload.ts)');assert.match(read('components/root/gameLoader.ts'),/promise\?\?=import\('\.\/Game'\)/);
 assert.match(read('components/root/Game.tsx'),/import Town from '@\/components\/Town';/,'the game chunk is Town and its module graph');
 assert.match(water,/requestAnimationFrame\(frame\);\s*\}\);\s*\}/,'the fill loop ends when full');assert(!/setInterval/.test(water+pill),'no polling');
 // Order: fade links/buttons ([data-launch]) → fill → pill out, pink down, items away → sand covers the screen → tan flag → route.
 assert.match(pill,/screen\?\.setAttribute\('data-launch',''\);/);assert(!/useRouter|router\./.test(strip(pill)),'no navigation: `/` switches in place');
 assert.match(pill,/runWaterFill\(fill\.current,\{reduced,onLevel:setLevel\}\)\s*\.then\(\(\)=>screen\?runTanExit\(screen,wrap\.current,\{reduced\}\):undefined\)\s*\.then\(\(\)=>\{(?:bootMark\('[a-z-]+'\);)?if\(apply\)\{rememberInGame\(\);markTanReload\(\);apply\(\);\}else\{markTanHandoff\(\);enterGame\(\);\}\}\);/);
 assert.match(pill,/data-landing-play="hero"/,'analytics: Play inside its data-title-card');
 assert.match(water,/const slide=\[\{transform:'none',opacity:1\},.*translateY\(.*opacity:0\}\]/,'pink slides down and fades');
 {const d=+water.match(/slideTiming:KeyframeAnimationOptions=\{delay:(\d+),duration:(\d+)/)[1],u=+water.match(/slideTiming:KeyframeAnimationOptions=\{delay:\d+,duration:(\d+)/)[1];
  assert.ok(d+u<=820,'the ground is gone before the sand expands');}
 assert.match(water,/qa\('\[data-x="cast"\]'\)\.forEach\(\(el,i\)=>hopAway\(el,i\*50\)\)/,'any number of characters hop away, before the ground moves');
 assert.match(water,/q\('\[data-x="near"\]'\)\?\.animate\(slide,slideTiming\);q\('\[data-x="far"\]'\)\?\.animate\(slide,slideTiming\);/,'the dark hills ride down with the pink (their flat bottom is never exposed)');
 assert.match(water,/\{transform:`scale\(\$\{k\}\)`\}/,'the sand grows in place, outward in every direction (user)');
 assert.doesNotMatch(water,/translate\(\$\{dx\}px/,'…without drifting to the screen centre');
 for(const k of strip(water).matchAll(/\.animate\(\[([\s\S]*?)\],\{/g))assert(!/(width|height|top|left|background|filter)\s*:/.test(k[1]),`exit keyframes: transform/opacity only: ${k[1].slice(0,50)}`);
 assert.match(css,/@media\(prefers-reduced-motion:no-preference\)\{\.waterPill\[data-loading\] \.waterCrest\{animation:crestRoll/,'the crest rolls only while loading');
 assert.match(css,/\.screen\[data-launch\] :is\(\.grownRow,\.tilt,\.haveCode,\.quiet,\.breakChip,\.cardTitle,\.cardBody\)\{opacity:0;pointer-events:none\}/,'links and other buttons go first');
 assert.match(water,/if\(reduced\|\|!land\)\{/,'reduced motion: a plain fill, then a cross-fade to tan');
 // No intermediate loader: the game's IslandLoading starts as the same plain tan sheet; cold start (no flag) unchanged.
 const lcss=read('components/IslandLoading.module.css'),ltsx=read('components/IslandLoading.tsx');
 assert.match(lcss,/:global\(html\[data-island-handoff=tan\]\) \.screen\{background:#dfc587\}/);
 assert.match(lcss,/:global\(html\[data-island-handoff=tan\]\) \.screen>\*\{visibility:hidden\}/);
 assert.match(water,/export const TAN='#dfc587';/,'the same tan');
 assert.match(read('components/islandLoadingBoot.ts'),/document\.documentElement\.dataset\.islandHandoff=v==='tan'\?'tan':'reload'/,'the reload path carries tan mode');
 assert.match(read('components/IslandLoadingStatic.tsx'),/<script dangerouslySetInnerHTML=\{\{__html:HANDOFF_BOOT\}\}\/>/,'… also when `/` paints the static loader first');
 assert.match(ltsx,/useEffect\(\(\)=>\(\)=>\{if\(exited\.current\)delete document\.documentElement\.dataset\.islandHandoff;\},\[\]\);/,'the flag lasts through the game loader\'s exit');
 assert.match(lcss,/\.art\{transform-origin:50% 100%;animation:coastArrive 3s/,'cold start unchanged');
 // The tan hold is as short as the island allows: no 3 s art minimum and an earlier fade, only in tan mode.
 const town=read('components/Town.tsx');
 assert.match(town,/const tanHandoff=\(\)=>document\.documentElement\.dataset\.islandHandoff==='tan';/);
 assert.match(town,/setMinimumLoadElapsed\(true\),tanHandoff\(\)\?0:3000\)/,'tan: no 3 s minimum; cold start keeps it');
 // Preload pass (Oct 9 2026): the tan sheet cross-fades as soon as the first frame is drawn; arrival with it, HUD as it ends.
 assert.match(lcss,/:global\(html\[data-island-handoff=tan\]\) \.exiting\{animation:loadingDepart \.5s \.05s ease-in-out both\}/);
 assert.match(town,/returningFromArcade\?1050:tanHandoff\(\)\?600:2050\)/,'tan: ready (HUD) when the 0.5 s fade ends');
 assert.match(town,/\?80:tanHandoff\(\)\?0:1500\)/,'tan: the arrival starts with the fade');
 assert.match(lcss,/\.exiting\{animation:loadingDepart \.5s 1\.55s ease-in-out both\}/,'cold-start exit timing unchanged');
 assert.equal(water.match(/HANDOFF_KEY='([^']+)'/)[1],'fi2-island-handoff','the same key IslandLoading reads');
 // Restore: the smallest backward-compatible prop on the real component.
 assert.match(restore,/const play=\(\)=>\{if\(!found\)return;onDone\(true\);const apply=\(\)=>applyRestoredSave\(found\);if\(onPlay\)onPlay\(apply\);else apply\(\);\};/);
 assert.match(actions,/onPlay=\{apply=>\{applyRestore\.current=apply;void leave\('restored'\);\}\}/);}

// 7. Analytics: the title screen is counted by what it shows (st:view while `/` shows it), not by a path; the old /start stays a
// known path only so its past sessions still show.
assert.match(read('lib/analytics/core.ts'),/isStartSession=[^\n]*\(s\.counts\?\.\['st:view'\]\|\|0\)>0/);
assert.match(read('components/VisitTracker.tsx'),/if\(pathname!=='\/'\|\|view!=='landing'\|\|!tracker\.current\)return;return watchStart\(window\);/);

// 10. `/` = the title screen first, then the game in place (lib/rootView.ts, components/root/*); /start is gone.
{const rv=read('lib/rootView.ts'),page=read('app/page.tsx'),sw=read('components/root/RootSwitch.tsx'),css=read('app/globals.css');
 // The pre-paint rule, run as the browser runs it: fresh → title screen; a tab in the game, ?from=, ?panel= → the game.
 const BOOT=JSON.parse('"'+(rv.match(/ROOT_VIEW_BOOT=`([^`]*)`/)[1]).replace(/\$\{IN_GAME_KEY\}/g,'fi2-in-game').replace(/\$\{JSON\.stringify\(GAME_QUERY_KEYS\)\}/g,"['from','panel']").replace(/"/g,'\\"')+'"');
 const boot=(search,stored={},nav='navigate')=>{const html={dataset:{}};vm.runInNewContext(BOOT,{document:{documentElement:html},location:{search},URLSearchParams,
  performance:{getEntriesByType:()=>[{type:nav}]},sessionStorage:{getItem:k=>stored[k]??null}});return html.dataset.rootView;};
 assert.equal(boot(''),'landing','a fresh session sees the title screen');
 assert.equal(boot('?coffee=thanks'),'landing','the title screen\'s own donation return stays on it');
 assert.equal(boot('',{'fi2-in-game':'1'},'reload'),'landing','a reload shows the title screen and its water-fill Play, never the old loader (user)');
 assert.equal(boot('',{'fi2-in-game':'1'},'navigate'),'landing','…and so does visiting the address again');
 assert.equal(boot('',{'fi2-island-handoff':'tan'},'reload'),'game','the game\'s own hand-off reload (a restored save) lands in the game');
 assert.equal(boot('?from=arcade'),'game','/?from=arcade goes straight to the game');
 assert.equal(boot('?panel=about&coffee=thanks'),'game','the game\'s About return opens the game');
 assert.equal(boot('',null),'landing');
 {const html={dataset:{}};vm.runInNewContext(BOOT,{document:{documentElement:html},location:{search:''},URLSearchParams,sessionStorage:{getItem:()=>{throw new Error('blocked');}}});assert.equal(html.dataset.rootView,'landing','storage blocked: the title screen');}
 // The client rule is the same one.
 const out=ts.transpileModule(rv,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const store={};const R={exports:{}};vm.runInNewContext(out,{module:R,exports:R.exports,URLSearchParams,location:{search:''},sessionStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v;}}});
 const V=R.exports;assert.equal(V.isInGame(''),false);assert.equal(V.isInGame('?from=museum'),true);assert.equal(V.isInGame('?coffee=thanks'),false);
 let heard=0;const off=V.subscribeRootView(()=>heard++);V.rememberInGame();assert.equal(heard,0,'remembering (before a restore reload) does not switch the page');
 assert.equal(store['fi2-in-game'],'1');V.enterGame();assert.equal(heard,1,'Play switches it');assert.equal(V.rootViewSnapshot(),'game');off();
 // Decided before first paint, static, both screens prerendered; the game is its own chunk.
 assert.match(page,/<script dangerouslySetInnerHTML=\{\{__html:ROOT_VIEW_BOOT\}\}\/>\s*<RootSwitch landing=\{<Landing\/>\} loader=\{<IslandLoadingStatic\/>\}\/>/,'the flag script comes before both screens');
 assert.match(css,/html\[data-root-view=game\] \[data-root-landing\],html:not\(\[data-root-view=game\]\) \[data-root-game\]\{display:none\}/,'one screen shows, from the first paint');
 for(const f of ['app/page.tsx','components/root/RootSwitch.tsx','components/root/useRootView.ts','components/root/gameLoader.ts','components/IslandLoadingStatic.tsx','components/islandLoadingBoot.ts','lib/rootView.ts',...files.filter(f=>!f.endsWith('/Handoff.tsx')/* loaded on demand by the unused PlayButton */)])
  assert(!/^\s*import [^;]*from '(@\/components|\.\.?)\/(Town|IslandLoading|root\/Game)'/m.test(read(f)),`${f}: no static import of the game or the client loader (first load stays light)`);
 assert(!/^'use client'/.test(read('components/IslandLoadingStatic.tsx'))&&!/^'use client'/.test(read('components/LoadingBeanCast.tsx')),'the placeholder loader is plain HTML (no JS)');
 assert.match(read('components/IslandLoadingStatic.tsx'),/<LoadingBeanCast lite\/>/,'no cast preloads or inline images for title-screen visitors');
 // Play: one synchronous swap (the game was loaded by the water fill); a reload continues the placeholder's animations.
 assert.match(sw,/const Loaded=Game\?\?\(view==='game'\?loadedGame\(\):null\);/);
 assert.match(sw,/continueLoaderFrom\(placeholderStart\(\)\);flushSync\(\(\)=>setGame\(\(\)=>G\)\);/);
 assert.match(sw,/\{view!=='game'&&<div data-root-landing="">\{landing\}<\/div>\}/);assert.match(sw,/\{view!=='landing'&&<div data-root-game="">/);
 assert.match(read('components/IslandLoading.tsx'),/const from=takeLoaderContinuation\(\);\s*if\(from!==null&&screen\.current\)for\(const a of screen\.current\.getAnimations\(\{subtree:true\}\)\)a\.startTime=from;/);
 // Every way into Town marks the tab: /, /?from= (island-return) and a restored save's reload.
 assert.match(read('components/Town.tsx'),/useEffect\(\(\)=>\{rememberInGame\(\);\},\[\]\);/);
 assert.match(read('components/root/Game.tsx'),/<Town\/><DevUnlock\/><SaveSync\/>/,'DevUnlock and SaveSync come with the game, as before');
 // /start is gone: no route, no redirect, nothing links to it.
 assert(!fs.existsSync(path.join(ROOT,'app/start')),'no app/start route');
 assert(!/source:\s*'\/start'/.test(read('next.config.mjs')),'no /start redirect: it 404s like any unknown path');
 const code=[];const walk=d=>{for(const e of fs.readdirSync(path.join(ROOT,d),{withFileTypes:true})){const f=`${d}/${e.name}`;if(e.isDirectory())walk(f);else if(/\.(tsx?|mjs|json)$/.test(e.name))code.push(f);}};
 for(const d of ['app','components','lib'])walk(d);code.push('next.config.mjs');
 const strip2=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:])\/\/.*$/gm,'$1');
 // Analytics keeps '/start' as a path KEY for sessions recorded before it was removed (not a link).
 const ANALYTICS_KEYS=['app/admin/AnalyticsDashboard.tsx','lib/analytics/core.ts','lib/analytics/startReport.ts'];
 for(const f of code.filter(f=>!ANALYTICS_KEYS.includes(f)))assert(!/[`'"](https:\/\/futbolisland\.app)?\/start(?=[?#`'"\/])/.test(strip2(read(f))),`${f} links to /start`);
 assert.match(read('app/coffee/checkout/route.ts'),/'start'\?'\/\?coffee=thanks'/,'the title screen\'s donation returns to /?coffee=thanks');}
console.log('landing ok');
