// /start title screen (Oct 9 2026, docs/performance-guide.md "Landing page /start"): the route is static; a save code is REQUIRED to
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
{const page=read('app/start/page.tsx');
 assert.match(page,/export const dynamic='force-static';/,'force-static');
 assert(!/^'use client'/.test(page)&&!/^'use client'/.test(landing),'page and Landing are server components');
 for(const f of ['app/start/page.tsx',...tsx])assert(!/\b(cookies|headers|useSearchParams)\s*\(|searchParams/.test(strip(read(f))),`${f} reads no request data`);
 assert.match(page,/canonical:'\/start'/);assert.match(page,/openGraph:\{title,description/,'Open Graph tags');
 const manifest=path.join(ROOT,'.next/prerender-manifest.json'),html=path.join(ROOT,'.next/server/app/start.html');
 if(fs.existsSync(manifest)&&fs.existsSync(html)){const m=JSON.parse(fs.readFileSync(manifest,'utf8'));assert(m.routes['/start'],'/start is prerendered (next build ○)');
  const h=fs.readFileSync(html,'utf8');assert.equal((h.match(/<h1[\s>]/g)||[]).length,1,'one h1 in the built page');
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
 assert.match(actions,/const onCreatePhase=\(p:string\)=>\{if\(p==='unavailable'\|\|p==='error'\)void leave\('break'\);\};/);
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
 assert.match(adapter,/if\(restored\)\{window\.history\.replaceState\(window\.history\.state,'','\/'\);/,'a restore reloads into the game, not /start');
 assert.match(adapter,/ onPlay=\{onPlay\}/,'the water loader runs before the save is applied');
 for(const f of tsx.filter(f=>!f.endsWith('saveCodeAdapter.tsx')))assert(!/from '@\/(lib|components)\/saves/.test(read(f)),`${f}: only the adapter imports the save code`);
 // The only storage use: handoffMotion.ts's one-shot hand-off flag for the reload path (sessionStorage.setItem(HANDOFF_STORAGE_KEY,'1')).
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
 assert.match(scene,/requestPermission\?\.\(\)\.then\(r=>\{if\(r==='granted'\)/,'iOS: through the Tilt button');
 assert.match(scene,/const calm=\(\)=>\{el\.dataset\.calm='';stopTilt\(\);\};/,'calm drops the tilt listener');
 // Trick cast: stills until the sprite strips land; no timed src swapping (it was not smooth).
 const art=read(`${DIR}/TitleArt.tsx`);assert.match(art,/import CAST_SIZES from '@\/public\/splash\/cast\.json';/,'sizes from cast.json, not hardcoded');
 assert.match(art,/const SLOTS=\[\{id:'trick-boy',cls:'boy'\},\{id:'trick-girl',cls:'girl'\}\] as const;/);
 assert.match(art,/pct:SIZES\[c\.id\]\.width\/513\*24/,'one px-per-metre scale');
 // Sprite strips: CSS steps() only, paused when calm / hidden, the still under reduced motion.
 assert.match(css,/\.spriteBox\[data-ready\] \.sprite\{animation:spriteRun var\(--dur\) steps\(var\(--frames\)\) infinite\}/,'the strip plays once decoded');
 assert.match(scene,/img\.decode\(\)\.then\(\(\)=>\{box\.dataset\.ready='';\}/);assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.spriteBox\{display:none\}\}/);
 assert.match(css,/:is\(\.palm,\.palmB,\.flag,\.glint,\.castLife,\.ballA,\.ballB,\.sun,\.sprite\)\{animation-play-state:paused\}/);
 // Ambient transforms run on <svg>/HTML boxes (compositor), not on elements inside an SVG (main-thread repaint every frame).
 assert(!/<(g|path)[^>]*className=\{[^}]*(palm|flag|glint)/.test(art),'no ambient class on SVG children');
 assert(!/srcset=|setTimeout\(\(\)=>frameStep/.test(scene),'no timed frame swaps');
 assert(!/hero-kick|'keeper'|hero-cheer/.test(art),'the title screen shows the trick cast only');
 // Ambient loops pause when calm or hidden; reduced motion is static; will-change only while moving.
 assert.match(css,/\.screen:is\(\[data-calm\],\[data-hidden\]\) :is\(\.palm,\.palmB,\.flag,\.glint,\.castLife,\.ballA,\.ballB,\.sun,\.sprite\)\{animation-play-state:paused\}/);
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
 assert.match(play,/onNavigate=\{\(\)=>\{if\(!HANDOFF_ENABLED\)\{setLaunching\(true\);router\.push\(GAME_HREF\);return;\}markHandoff\(\);router\.prefetch\(GAME_HREF\);setLaunching\(true\);\}\}/);
 assert.match(play,/HANDOFF_ENABLED\?<Handoff onDone=\{\(\)=>router\.push\(GAME_HREF\)\}\/>:<div className=\{styles\.launch\} data-landing-launch><IslandLoading\/><\/div>/,'off: the normal loader overlay');
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
 const key=(motion.match(/HANDOFF_STORAGE_KEY='([^']+)'/)||[])[1];assert(key&&loader.includes(`sessionStorage.getItem('${key}')`),'the reload path shares the key');
 // The restore path (a full reload into `/`) starts the game's loader settled too.
 assert.match(adapter,/if\(HANDOFF_ENABLED\)markReloadHandoff\(\);/,'the reload flag only when the hand-off is on');}

// 9. Play = the water loader, then the full-tan hand-off with no second loader (waterLaunch.ts, WaterPill.tsx, IslandLoading tan mode).
{const water=read(`${DIR}/waterLaunch.ts`),pill=read(`${DIR}/WaterPill.tsx`),restore=read('components/saves/SaveCodeRestore.tsx');
 // The level: rises, never fakes full before the game is ready, fills once ready (not before the minimum time).
 const src=ts.transpileModule(water.replace(/^'use client';/,'').replace(/export function waitForGame[\s\S]*?\n\}\n/,'').replace(/export function runWaterFill[\s\S]*$/,''),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const m={exports:{}};vm.runInNewContext(src,{module:m,exports:m.exports,Math,document:{},sessionStorage:{}});const L=m.exports;
 assert(L.waitingLevel(200)<L.waitingLevel(1500)&&L.waitingLevel(60000)<=.9,'waiting: rises and stays below 90 %');
 let lv=0;for(let t=0;t<30000;t+=16)lv=L.nextLevel(lv,t,.016,false);assert(lv<.91,'not ready: never full');
 lv=0;for(let t=0;t<600;t+=16)lv=L.nextLevel(lv,t,.016,true);assert(lv<.9,'ready early: still eases, no jump');
 for(let t=600;t<3000;t+=16)lv=L.nextLevel(lv,t,.016,true);assert(lv>.995,'ready: fills to the top');
 // Real progress: the game's own code (Town and its module graph) is what the water waits for.
 assert.match(water,/gamePromise\?\?=import\('\.\.\/Town'\)/);
 assert.match(water,/requestAnimationFrame\(frame\);\s*\}\);\s*\}/,'the fill loop ends when full');assert(!/setInterval/.test(water+pill),'no polling');
 // Order: fade links/buttons ([data-launch]) → fill → pill out, pink down, items away → sand covers the screen → tan flag → route.
 assert.match(pill,/screen\?\.setAttribute\('data-launch',''\);router\.prefetch\(GAME_HREF\);/);
 assert.match(pill,/runWaterFill\(fill\.current,\{reduced,onLevel:setLevel\}\)\s*\.then\(\(\)=>screen\?runTanExit\(screen,wrap\.current,\{reduced\}\):undefined\)\s*\.then\(\(\)=>\{if\(apply\)\{markTanReload\(\);apply\(\);\}else\{markTanHandoff\(\);router\.push\(GAME_HREF\);\}\}\);/);
 assert.match(pill,/data-landing-play="hero"/,'analytics: Play inside its data-title-card');
 assert.match(water,/const slide=\[\{transform:'none'\},\{transform:`translateY\(/,'pink slides down');
 assert.match(water,/qa\('\[data-x="cast"\]'\)\.forEach\(\(el,i\)=>hopAway\(el,40\+i\*70\)\)/,'any number of characters hop away, before the ground moves');
 assert.match(water,/q\('\[data-x="near"\]'\)\?\.animate\(slide,slideTiming\);q\('\[data-x="far"\]'\)\?\.animate\(slide,slideTiming\);/,'the dark hills ride down with the pink (their flat bottom is never exposed)');
 assert.match(water,/translate\(\$\{dx\}px,\$\{dy\}px\) scale\(\$\{vw\*2\/r\.width\},\$\{vh\*2\/r\.height\}\)/,'the sand expands like the loader tan wipe');
 for(const k of strip(water).matchAll(/\.animate\(\[([\s\S]*?)\],\{/g))assert(!/(width|height|top|left|background|filter)\s*:/.test(k[1]),`exit keyframes: transform/opacity only: ${k[1].slice(0,50)}`);
 assert.match(css,/@media\(prefers-reduced-motion:no-preference\)\{\.waterPill\[data-loading\] \.waterCrest\{animation:crestRoll/,'the crest rolls only while loading');
 assert.match(css,/\.screen\[data-launch\] :is\(\.grownRow,\.tilt,\.haveCode,\.quiet,\.breakChip,\.cardTitle,\.cardBody\)\{opacity:0;pointer-events:none\}/,'links and other buttons go first');
 assert.match(water,/if\(reduced\|\|!land\)\{/,'reduced motion: a plain fill, then a cross-fade to tan');
 // No intermediate loader: the game's IslandLoading starts as the same plain tan sheet; cold start (no flag) unchanged.
 const lcss=read('components/IslandLoading.module.css'),ltsx=read('components/IslandLoading.tsx');
 assert.match(lcss,/:global\(html\[data-island-handoff=tan\]\) \.screen\{background:#dfc587\}/);
 assert.match(lcss,/:global\(html\[data-island-handoff=tan\]\) \.screen>\*\{visibility:hidden\}/);
 assert.match(water,/export const TAN='#dfc587';/,'the same tan');
 assert.match(ltsx,/document\.documentElement\.dataset\.islandHandoff=v==='tan'\?'tan':'reload'/,'the reload path carries tan mode');
 assert.match(ltsx,/useEffect\(\(\)=>\(\)=>\{if\(exited\.current\)delete document\.documentElement\.dataset\.islandHandoff;\},\[\]\);/,'the flag lasts through the game loader\'s exit');
 assert.match(lcss,/\.art\{transform-origin:50% 100%;animation:coastArrive 3s/,'cold start unchanged');
 // The tan hold is as short as the island allows: no 3 s art minimum and an earlier fade, only in tan mode.
 const town=read('components/Town.tsx');
 assert.match(town,/setMinimumLoadElapsed\(true\),document\.documentElement\.dataset\.islandHandoff==='tan'\?0:3000\)/,'tan: no 3 s minimum; cold start keeps it');
 assert.match(lcss,/:global\(html\[data-island-handoff=tan\]\) \.exiting\{animation:loadingDepart \.45s \.95s ease-in-out both\}/);
 assert.match(lcss,/\.exiting\{animation:loadingDepart \.5s 1\.55s ease-in-out both\}/,'cold-start exit timing unchanged');
 assert.equal(water.match(/HANDOFF_KEY='([^']+)'/)[1],'fi2-island-handoff','the same key IslandLoading reads');
 // Restore: the smallest backward-compatible prop on the real component.
 assert.match(restore,/const play=\(\)=>\{if\(!found\)return;onDone\(true\);const apply=\(\)=>applyRestoredSave\(found\);if\(onPlay\)onPlay\(apply\);else apply\(\);\};/);
 assert.match(actions,/onPlay=\{apply=>\{applyRestore\.current=apply;void leave\('restored'\);\}\}/);}

// 7. Analytics counts /start as its own entry page.
assert.match(read('lib/analytics/core.ts'),/KNOWN_PATHS=\[[^\]]*'\/start'/);
console.log('landing ok');
