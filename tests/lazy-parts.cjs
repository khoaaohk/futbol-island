// Lazy-load pass (Oct 7 2026, docs/performance-guide.md "Load parts of the island when they are opened"): dialogs, the Paths panel,
// the fishing art/models, the pocket fish and the Konbini food art are not in the island's boot bundle, and the one idle warm-up
// is bounded and one-shot. usage: node tests/lazy-parts.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),Module=require('node:module');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const staticImports=src=>[...src.matchAll(/^import\s+(?!type\b)[^;]*?from\s*'([^']+)'/gm)].map(m=>m[1]);

// 1. Town: the lazy dialogs come from next/dynamic, never from a static import.
{const town=read('components/Town.tsx'),imports=staticImports(town);
 for(const part of ['CharacterCustomizer','VendingMachine','CoachesCentre','NpcConversation','IslandOnboarding','FieldLearning','CoachLesson','PositionGuide','IslandQuests','FishArt']){
  assert(!imports.includes('./'+part),`Town does not import ${part} statically`);
 }
 for(const part of ['CharacterCustomizer','VendingMachine','CoachesCentre','NpcConversation','IslandOnboarding','FieldLearning','CoachLesson'])
  assert.match(town,new RegExp(`\\b${part}=(?:stableMemo\\()?dynamic\\(\\(\\)=>import\\('\\./${part}'\\),\\{ssr:false\\}\\)`),`${part} loads with next/dynamic`);
 // Dialogs that stay mounted once opened (close animation, focus restore) mount the first time they are wanted.
 for(const [part,flag] of [['conversation','conversationOpen'],['onboarding','onboardingOpen'],['coaches','coachesOpen'],['customizer','customizerOpen']])
  assert(town.includes(`mountWhen('${part}',${flag})&&`),`${part} mounts on first open`);
 assert(town.includes("mountWhen('vending',storeOpen&&!isDrinkMachine(vendingId))&&<VendingMachine"),'the vending machine mounts on first open');
 assert.match(town,/\{fieldCatalog&&<FieldLearning /,'lessons mount only while a pitch menu is open (as before)');
 // The customizer used to grant the starter kit when it mounted at boot: Town still does, at the same moment.
 assert.match(town,/if\(!ready\|\|failed\)return;ensureStarterKit\(\);return prefetchOnIdle\(\[/,'starter kit still granted when the island is ready');
 // Prefetch triggers: one idle warm-up, the HUD focus, Paths opening, a new player's welcome.
 assert.match(town,/prefetchOnIdle\(\[loadPathsPanel,loadBottleLogo,loadCustomizer,loadFieldLearning,loadConversation,loadCoachLesson\],8000\)/);
 assert.match(town,/useEffect\(\(\)=>\{if\(!ready\)return;[^\n]*hudFocus==='vending'\?loadVending[^\n]*if\(part\)prefetchWhenIdle\(part\);\},\[hudFocus,ready\]\);/,'HUD-focus warming starts once the island is interactive, in an idle moment');assert.match(town,/hudFocus==='enter'\?loadCoaches/);
 assert.match(town,/if\(settingsOpen\)\{void import\('\.\/CardCollection'\);prefetchPart\(loadFieldLearning\);\}/);
 assert.match(town,/if\(!returningFromArcade&&shouldShowIslandOnboarding\(\)\)prefetchPart\(loadOnboarding\)/,'a new player\'s welcome loads with the island');}

// 2. The loaders point at the same modules the dynamic wrappers use (one chunk each).
{const parts=read('components/islandParts.ts');
 for(const [name,file] of [['loadPathsPanel','IslandQuests'],['loadBottleLogo','IslandBottle'],['loadCoinQuest','CoinQuest'],['loadCustomizer','CharacterCustomizer'],['loadVending','VendingMachine'],['loadCoaches','CoachesCentre'],['loadConversation','NpcConversation'],['loadOnboarding','IslandOnboarding'],['loadFieldLearning','FieldLearning'],['loadCoachLesson','CoachLesson']])
  assert(parts.includes(`export const ${name}=()=>import('./${file}');`),name);
 assert.equal(staticImports(parts).length,0,'islandParts has no static imports');}

// 2b. The customizer's Backpack tab (cards, Konbini collection, food art) loads when the customizer opens.
{const c=read('components/CharacterCustomizer.tsx');assert(!staticImports(c).includes('./Backpack'));
 assert.match(c,/const Backpack=dynamic\(\(\)=>import\('\.\/Backpack'\),\{ssr:false\}\);/);assert.match(c,/if\(open\)\{setMoveIndex\(0\);setView\('look'\);void import\('\.\/Backpack'\);\}/);}

// 3. Settings keeps its HUD buttons (and their animations) in the boot bundle; the panels behind them load on first touch.
{const s=read('components/IslandSettings.tsx'),imports=staticImports(s);
 for(const part of ['./IslandQuests','./CoinQuest','./IslandBottle'])assert(!imports.includes(part),`Settings does not import ${part} statically`);
 assert.match(s,/const IslandQuests=dynamicImport\(\(\)=>import\('\.\/IslandQuests'\),\{ssr:false\}\);/);
 assert.match(s,/const IslandBottleLogo=dynamicImport\(\(\)=>import\('\.\/IslandBottle'\)\.then\(m=>m\.IslandBottleLogo\),\{ssr:false\}\);/);
 assert.match(s,/data-hud-triggers aria-label="Island information" onPointerEnter=\{warmPanels\} onPointerDown=\{warmPanels\} onFocus=\{warmPanels\}>/,'touching the HUD buttons warms the panels');
 assert.match(s,/if\(open\)\{\n\s*warmPanels\(\);/,'opening Settings/Paths any other way warms them too');
 assert(!/immediate/.test(s),'no immediate press (the buttons keep their shrink-to-icon animation)');}

// 4. The pocket fish is FishArt's own sardine, inlined (FishArt stays out of the boot bundle).
{assert(!staticImports(read('components/IslandJobs.tsx')).includes('./FishArt'),'the HUD pocket does not import FishArt');
 const compile=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
 const prev={ts:require.extensions['.ts'],tsx:require.extensions['.tsx']};require.extensions['.ts']=require.extensions['.tsx']=compile;
 const resolve=Module._resolveFilename;Module._resolveFilename=function(req,...a){return resolve.call(this,req.startsWith('@/')?path.join(ROOT,req.slice(2)):req,...a);};
 try{
  const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
  const FishArt=require(path.join(ROOT,'components/FishArt.tsx')).default,PocketFishIcon=require(path.join(ROOT,'components/PocketFishIcon.tsx')).default;
  const {FISH}=require(path.join(ROOT,'lib/town/fishing/fishCatalog.ts'));const sardine=FISH.find(f=>f.id==='sardine');assert(sardine,'the sardine exists');
  assert.equal(renderToStaticMarkup(React.createElement(PocketFishIcon)),renderToStaticMarkup(React.createElement(FishArt,{fish:sardine,size:24})),'PocketFishIcon is FishArt\'s sardine at 24 px (re-copy it if the drawing changed)');
 }finally{require.extensions['.ts']=prev.ts;require.extensions['.tsx']=prev.tsx;Module._resolveFilename=resolve;}}

// 5. Fishing: the visuals and species models load by distance, before the 45 m build radius.
{const world=read('lib/town/fishing/fishingWorld.ts');
 assert(!staticImports(world).some(m=>/fishingVisuals|fishModels/.test(m)),'fishingWorld imports the visuals only as a type');
 assert.match(world,/import\('\.\/fishingVisuals'\)/);
 const prefetch=Number(world.match(/const VISUALS_PREFETCH=(\d+);/)?.[1]);assert(prefetch>=100,'the chunk is fetched well before 45 m');
 assert.match(world,/if\(!visualsModule&&nearAnySpot\(c\.x,c\.z,VISUALS_PREFETCH\)\)void loadFishingVisuals\(\);/);
 assert.match(world,/if\(!visuals&&around\)\{visuals=makeVisuals\(\);if\(visuals&&fishing\)visuals\.begin\(stand,cast,cast\.dir\);\}/,'a session that started first gets its visuals when the chunk lands');}

// 6. Konbini food art: drink layers are registered by foodArt itself; the drink machines' data module does not import it.
{assert(!staticImports(read('lib/town/drinkMachines.ts')).some(m=>/foodArt|drinkArt/.test(m)),'drinkMachines stays free of the canvas painters');
 assert.match(read('lib/konbini/foodArt.ts'),/for\(const d of DRINKS\)registerFoodLayers\(d\.id,drinkRevealLayers\(d\.art\),drinkCellShadow\(d\.art\)\);\s*$/);}

// 7. The idle warm-up: one-shot, ordered, idle callbacks only while visible, cancellable, no loops.
{const src=read('lib/ui/idlePrefetch.ts');assert(!/setInterval|requestAnimationFrame/.test(src),'no polling or frame loops');
 const out=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const timers=[],idles=[],listeners=[];let hidden=false;
 const doc={get hidden(){return hidden;},addEventListener:(t,fn)=>listeners.push([t,fn]),removeEventListener:(t,fn)=>{const i=listeners.findIndex(l=>l[1]===fn);if(i>=0)listeners.splice(i,1);}};
 const win={requestIdleCallback:(fn)=>{idles.push(fn);return idles.length;},cancelIdleCallback:id=>{idles[id-1]=null;}};
 const mod={exports:{}};vm.runInNewContext(out,{module:mod,exports:mod.exports,window:win,document:doc,Map,Promise,setTimeout:(fn,ms)=>{timers.push([fn,ms]);return timers.length;},clearTimeout:id=>{if(timers[id-1])timers[id-1][0]=null;}});
 const {prefetchPart,prefetchOnIdle,partStarted}=mod.exports;
 const flush=()=>new Promise(r=>setImmediate(r));
 (async()=>{
  const calls=[];const a=()=>{calls.push('a');return Promise.resolve();},b=()=>{calls.push('b');return Promise.resolve();},bad=()=>{calls.push('bad');return Promise.reject(new Error('offline'));};
  prefetchOnIdle([a,b],8000);assert.equal(timers.at(-1)[1],8000,'waits 8 s after the island is interactive');assert.equal(calls.length,0);
  hidden=true;timers.at(-1)[0]();assert.equal(idles.length,0,'a hidden tab schedules nothing');assert.equal(listeners.length,1,'it waits on one visibilitychange listener');
  hidden=false;listeners[0][1]();listeners.length=0;assert.equal(idles.length,1);idles[0]();await flush();assert.deepEqual(calls,['a']);
  assert.equal(idles.length,2,'next part in its own idle callback');idles[1]();await flush();assert.deepEqual(calls,['a','b']);
  assert.equal(idles.length,2,'then it stops for good');
  prefetchPart(a);prefetchPart(b);assert.deepEqual(calls,['a','b'],'a part is imported once, whatever triggers it');assert(partStarted(a));
  prefetchPart(bad);await flush();prefetchPart(bad);await flush();assert.deepEqual(calls.filter(c=>c==='bad').length,2,'a failed load can be retried');
  {const c=()=>{calls.push('c');return Promise.resolve();},before=idles.length;mod.exports.prefetchWhenIdle(c);assert.equal(idles.length,before+1,'a HUD trigger waits for an idle moment');assert(!calls.includes('c'));
   idles.at(-1)();await flush();assert(calls.includes('c'));mod.exports.prefetchWhenIdle(c);assert.equal(idles.length,before+1,'nothing is scheduled for a part already loaded');}
  const cancel=prefetchOnIdle([()=>{calls.push('late');return Promise.resolve();}],8000);const t=timers.at(-1);cancel();assert.equal(t[0],null,'cancel clears the start timer');
  console.log('PASS lazy parts: dialogs/Paths/lessons via next/dynamic and mounted on first use, HUD buttons kept, pocket fish = FishArt sardine, fishing art by distance, food art out of the drink data, one-shot visible-only idle warm-up');
 })().catch(e=>{console.error(e);process.exit(1);});}
