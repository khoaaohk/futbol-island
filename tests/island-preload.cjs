// Title screen → island preload pass (Oct 9 2026): the ride-ramp planner's grid, buildTown's slices, the idle prefetch rules and
// the warm island (no rAF while warming, disposed when never used). See docs/performance-guide.md "Title-screen preload".
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const vm=require('node:vm');
const cjs=(file,requireMap={},extra={})=>{const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
 {exports:mod.exports,module:mod,Math,Map,Set,Object,Array,JSON,Number,String,Promise,setTimeout,clearTimeout,...extra,require:id=>{if(id in requireMap)return requireMap[id];throw new Error('unexpected import '+id+' in '+file);}});return mod.exports;};

// 1. planRideRamps: the obstacle grid returns a superset of the obstacles that can block a sample, so the plan is identical to the
//    old full scan. Same module twice: once with the real grid, once with a "grid" that returns every obstacle (the old behaviour).
{
 const grid=cjs('lib/town/obstacleGrid.ts');
 const insideObstacle=(x,z,o,padding=0)=>{if(o.w<=0||o.d<=0)return false;const dx=Math.abs(x-o.x),dz=Math.abs(z-o.z),r=o.cornerRadius??0;if(!r)return dx<o.w/2+padding&&dz<o.d/2+padding;
  const qx=Math.max(0,dx-(o.w/2-r)),qz=Math.max(0,dz-(o.d/2-r));return Math.hypot(qx,qz)<Math.max(0,r+padding);};
 const sim={blocked:(x,z,obs,radius=.32)=>Math.abs(x)>400||Math.abs(z)>400||obs.some(o=>insideObstacle(x,z,o,radius))};
 const deps=g=>({'./simulation':sim,'./obstacleGrid':g,'./shoreline':{onIsland:(x,z)=>Math.hypot(x,z)<380},'./venues':{fieldSurfaceHeight:(x,z)=>Math.hypot(x-40,z-40)<12?.3:0,VENUES:[{x:-60,z:20,width:30,length:20}]},'./travelModes':{TRAVEL_MODES:{}}});
 const fast=cjs('lib/town/rideRamps.ts',deps(grid));
 const full=cjs('lib/town/rideRamps.ts',deps({createObstacleGrid:items=>({query:()=>items})}));
 let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 let placed=0;for(let world=0;world<6;world++){
  const roads=Array.from({length:8},(_,i)=>{const vertical=i%2===0;return {x:-250+rnd()*500,z:-250+rnd()*500,w:vertical?8:120+rnd()*260,d:vertical?120+rnd()*260:8,vertical};});
  const obstacles=Array.from({length:600+world*300},()=>({x:-300+rnd()*600,z:-300+rnd()*600,w:rnd()*9,d:rnd()*9,...(rnd()<.25?{cornerRadius:rnd()*2}:{})}));
  const paths=Array.from({length:20},()=>({x:-300+rnd()*600,z:-300+rnd()*600,w:2+rnd()*30,d:2+rnd()*4}));
  const a=fast.planRideRamps(roads,obstacles,paths),b=full.planRideRamps(roads,obstacles,paths);
  assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),`ride-ramp plan ${world} matches the full scan`);placed+=a.length;
 }
 assert.ok(placed>=6,`the random worlds place ramps (${placed})`);
 assert.match(fs.readFileSync('lib/town/rideRamps.ts','utf8'),/createObstacleGrid\(obstacles\)/,'planRideRamps indexes the obstacles once');
}
console.log('island preload: ride ramps ok');

// 2. buildTown is the same build in slices: the sync API runs every slice; the batching pass visits in traverse order and removes
//    the originals in one pass per parent (no quadratic splice).
{
 const world=fs.readFileSync('lib/town/world.ts','utf8');
 assert.match(world,/export function buildTown\(scene: T\.Scene\) \{return runSteps\(buildTownSteps\(scene\)\);\}/,'buildTown = all slices at once');
 assert.match(world,/export function\* buildTownSteps\(scene: T\.Scene\) \{/);
 assert.ok((world.match(/\n\s*yield;/g)||[]).length>=8,'about a dozen slice points');
 assert.match(world,/town\.traverse\(o=>\{all\.push\(o\);\}\);for\(let i=0;i<all\.length;i\+\+\)\{batchObject\(all\[i\]\);if\(i%500===499\)yield;\}/,'batching: same order, sliced');
 assert.match(world,/const byParent=new Map<T\.Object3D,Set<T\.Object3D>>\(\)/,'originals leave their parents in one pass each');
 assert.doesNotMatch(world,/original\.forEach\(m=>\{m\.removeFromParent\(\)/,'no splice per mesh');
 const runSrc=world.match(/export function runSteps<R>\(steps:Generator<unknown,R,unknown>\):R\{[^\n]*\}/)[0];
 const runSteps=vm.runInNewContext('('+ts.transpileModule(runSrc.replace(/^export /,''),{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText.trim().replace(/;$/,'')+')');
 let n=0;assert.equal(runSteps((function*(){for(;n<4;n++)yield;return 'built';})()),'built');assert.equal(n,4,'runSteps runs every slice');
}

// 3. Stage a: the idle prefetch. Fake browser: counts rAF (must stay 0), idle callbacks, timers, imports and images.
function fakeBrowser({connection,hidden=false,readyState='complete',rIC=true}={}){
 const log={raf:0,idle:[],timers:[],imports:[],images:[],fetches:[],listeners:{},docListeners:{},links:[],dispose:0,steps:0};
 const timers=[];let now=0;
 const win={requestAnimationFrame(){log.raf++;throw new Error('no rAF on the title screen');},
  setTimeout:(fn,ms)=>{const t={fn,at:now+(ms||0),id:timers.length+1};timers.push(t);log.timers.push(ms);return t.id;},clearTimeout:id=>{const t=timers.find(t=>t.id===id);if(t)t.fn=null;},
  addEventListener:(type,fn)=>{(log.listeners[type]??=[]).push(fn);},removeEventListener:(type,fn)=>{log.listeners[type]=(log.listeners[type]||[]).filter(f=>f!==fn);}};
 if(rIC){win.requestIdleCallback=(fn,o)=>{log.idle.push(o?.timeout);const id=timers.length+1;timers.push({fn,at:now+1,id});return id;};win.cancelIdleCallback=id=>win.clearTimeout(id);}
 const doc={hidden,readyState,createElement:()=>({relList:{supports:k=>k==='prefetch'}}),querySelectorAll:()=>log.links,
  addEventListener:(type,fn)=>{(log.docListeners[type]??=[]).push(fn);},removeEventListener:(type,fn)=>{log.docListeners[type]=(log.docListeners[type]||[]).filter(f=>f!==fn);}};
 const flush=async(ms=60000)=>{for(let guard=0;guard<500;guard++){await new Promise(r=>setImmediate(r));const due=timers.filter(t=>t.fn&&t.at<=now+ms).sort((a,b)=>a.at-b.at)[0];if(!due)break;now=Math.max(now,due.at);const fn=due.fn;due.fn=null;fn();}};
 return {log,win,doc,flush,navigator:{connection},
  Image:function(){const img={};log.images.push(img);return img;},fetch:url=>{log.fetches.push(url);return Promise.resolve({ok:true,arrayBuffer:()=>Promise.resolve(new ArrayBuffer(0))});}};
}
function loadPreload(env,game){
 const src=fs.readFileSync('components/root/islandPreload.ts','utf8');
 return cjs('components/root/islandPreload.ts',{
  './gameLoader':{loadGameModule:()=>{env.log.imports.push('game');return Promise.resolve(game??null);}},
  './gamePrefetch':{FIRST_FRAME_IMAGES:['/vending/products/balls-x.webp']},
  '@/lib/boot/perfMarks':{bootMark:()=>{}}},
  {window:env.win,document:env.doc,navigator:env.navigator,Image:env.Image,fetch:env.fetch,performance:{now:()=>0},setTimeout:env.win.setTimeout,clearTimeout:env.win.clearTimeout,requestAnimationFrame:env.win.requestAnimationFrame,src});
}
(async()=>{
 // Network rules.
 {const env=fakeBrowser();const P=loadPreload(env);
  assert.equal(P.prefetchAllowed(undefined),true);assert.equal(P.prefetchAllowed({effectiveType:'4g'}),true);assert.equal(P.prefetchAllowed({effectiveType:'3g'}),true);
  assert.equal(P.prefetchAllowed({saveData:true,effectiveType:'4g'}),false,'Save-Data: no prefetch');
  assert.equal(P.prefetchAllowed({effectiveType:'2g'}),false,'2G: no prefetch');assert.equal(P.prefetchAllowed({effectiveType:'slow-2g'}),false,'slow-2G: no prefetch');}
 // Settled → idle → prefetch (the game's files via webpack prefetch, the first-frame picture), once, without rAF.
 {const env=fakeBrowser({connection:{effectiveType:'4g'}});env.log.imports.length=0;const P=loadPreload(env);env.log.imports.length=0;
  P.prefetchIslandWhenSettled();
  assert.deepEqual(env.log.timers,[P.SETTLE_MS],'waits for the title entrance first');assert.equal(env.log.idle.length,0);
  await env.flush();
  assert.deepEqual(env.log.idle,[4000],'then an idle callback with a timeout');
  assert.equal(env.log.images.length,1,'the first-frame picture');assert.equal(env.log.images[0].src,'/vending/products/balls-x.webp');assert.equal(env.log.images[0].fetchPriority,'low');
  assert.equal(env.log.raf,0,'no rAF');
  P.prefetchIslandWhenSettled();await env.flush();assert.equal(env.log.images.length,1,'once per page');}
 // Before load: waits for the load event.
 {const env=fakeBrowser({readyState:'loading'});const P=loadPreload(env);P.prefetchIslandWhenSettled();assert.equal(env.log.timers.length,0);assert.equal(env.log.listeners.load.length,1,'waits for load');}
 // Save-Data and 2G: nothing scheduled, nothing fetched.
 for(const connection of [{saveData:true},{effectiveType:'2g'},{effectiveType:'slow-2g'}]){
  const env=fakeBrowser({connection});const P=loadPreload(env);P.prefetchIslandWhenSettled();P.prefetchIslandNow();await env.flush();
  assert.equal(env.log.timers.length+env.log.idle.length+env.log.images.length+env.log.fetches.length,0,`no prefetch on ${JSON.stringify(connection)}`);}
 // Hidden tab: no work until it is visible again.
 {const env=fakeBrowser({hidden:true});const P=loadPreload(env);P.prefetchIslandWhenSettled();await env.flush();
  assert.equal(env.log.idle.length+env.log.images.length,0,'nothing while hidden');
  env.doc.hidden=false;for(const f of env.doc_listeners??env.log.docListeners.visibilitychange)f();await env.flush();assert.equal(env.log.images.length,1,'runs once visible');}
 // Safari (no rel=prefetch): the prefetch links' files are fetched at low priority instead.
 {const env=fakeBrowser();env.doc.createElement=()=>({relList:{supports:()=>false}});env.log.links.push({href:'http://x/_next/static/chunks/a.js'},{href:'http://x/_next/static/chunks/b.js'});
  const P=loadPreload(env);P.prefetchIslandNow();await env.flush();assert.deepEqual(env.log.fetches,['http://x/_next/static/chunks/a.js','http://x/_next/static/chunks/b.js']);}

 // 4. Stage b: warming on intent. A fake game module whose warm-up has 5 slices and one async compile.
 const fakeGame=env=>({warmIslandSteps:function*(){for(let i=0;i<5;i++){env.log.steps++;yield;}env.log.steps++;yield Promise.resolve();return true;},disposeWarmIsland:()=>{env.log.dispose++;},warmIslandInfo:()=>({phase:'ready'})});
 {const env=fakeBrowser({connection:{effectiveType:'4g'}});const P=loadPreload(env,fakeGame(env));
  P.warmIsland('create');await env.flush();
  assert.equal(env.log.steps,6,'Start builds every slice');assert.ok(env.log.idle.length>=6&&env.log.idle.every(t=>t===2000),'one idle callback per slice');
  assert.equal(env.log.raf,0,'no rAF while warming');
  await P.islandWarmSettled();
  assert.ok(env.log.timers.includes(P.UNUSED_MS),'an unused warm island is released later');assert.equal(env.log.listeners.pagehide.length,1,'… or on pagehide');
  P.releaseIslandWarm();assert.equal(env.log.dispose,1,'released: disposed');}
 {const env=fakeBrowser();const P=loadPreload(env,fakeGame(env));P.warmIsland('create');await env.flush();assert.equal(env.log.dispose,0);
  await env.flush(Infinity);assert.equal(env.log.dispose,1,'never played: disposed after UNUSED_MS');}
 {const env=fakeBrowser({rIC:false});const P=loadPreload(env,fakeGame(env));
  P.warmIsland('play');await env.flush();assert.equal(env.log.steps,6,'Play: eager slices');assert.equal(env.log.idle.length,0,'eager: a task per slice, not idle');
  assert.equal(env.log.raf,0,'no rAF while warming');}
 {const env=fakeBrowser({connection:{saveData:true}});const P=loadPreload(env,fakeGame(env));
  P.warmIsland('create');await env.flush();assert.equal(env.log.imports.filter(x=>x==='game').length,0,'Save-Data: Start does not download the game');
  P.warmIsland('play');await env.flush();assert.equal(env.log.steps,6,'… Play still warms (the game is needed now)');}
 {const env=fakeBrowser();const P=loadPreload(env,fakeGame(env));
  P.warmIsland('restore');await env.flush();assert.equal(env.log.steps,0,'restore: its Play reloads the page, so no scene is built');assert.equal(env.log.images.length,1,'… only the prefetch');}
 {const env=fakeBrowser({hidden:true});const P=loadPreload(env,fakeGame(env));
  P.warmIsland('create');await env.flush();assert.equal(env.log.steps,0,'no warming in a hidden tab');}
 // Idle warm-up switched to eager by Play mid-way: it finishes without waiting for idle time.
 {const env=fakeBrowser();const P=loadPreload(env,fakeGame(env));
  P.warmIsland('create');await new Promise(r=>setImmediate(r));P.warmIsland('play');await env.flush();assert.equal(env.log.steps,6);}

 // 5. The warm module: no frame loop, one compile, a released context when unused; Town takes it on mount.
 {const warm=fs.readFileSync('lib/town/islandWarm.ts','utf8'),code=warm.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm,'');
  assert.doesNotMatch(code,/requestAnimationFrame|setAnimationLoop|\.render\(/,'warming never renders or starts a loop');
  assert.equal((code.match(/compileAsync\(/g)||[]).length,1,'one shader warm-up');
  assert.match(code,/r\.dispose\(\);r\.forceContextLoss\(\);/,'unused: the WebGL context is released');
  assert.match(code,/if\(compiling\)void compiling\.then\(release\);else release\(\);/,'never under an in-flight compile');
  const town=fs.readFileSync('components/Town.tsx','utf8');
  assert.match(town,/const warm=takeWarmIsland\(\);/);assert.match(town,/renderer=warm\?\.renderer\?\?new T\.WebGLRenderer/);
  assert.match(town,/const scene=warm\?\.scene\?\?new T\.Scene\(\);/);assert.match(town,/const world=warm\?\.world\?\?buildTown\(scene\),vending=warm\?\.vending\?\?createVendingMachines\(/);
  const pill=fs.readFileSync('components/landing/WaterPill.tsx','utf8'),actions=fs.readFileSync('components/landing/TitleActions.tsx','utf8');
  assert.match(pill,/warmIsland\(apply\?'restore':'play'\);/,'Play warms (a restore only prefetches)');
  assert.match(actions,/data-track="st:start"[^>]*onClick=\{e=>\{warmIsland\('create'\);void open\('create'/,'Start warms, analytics attribute kept');
  assert.match(actions,/data-track="st:have"[^>]*onClick=\{e=>\{warmIsland\('restore'\);/);
  assert.match(actions,/useEffect\(\(\)=>prefetchIslandWhenSettled\(\),\[\]\);/,'the title schedules the idle prefetch');
  assert.doesNotMatch(fs.readFileSync('components/root/islandPreload.ts','utf8'),/^import .*(mediaUrl|vendingBallAtlas|three|islandWarm)/m,'the title bundle stays small (no media helper, atlas or game code)');
  assert.match(fs.readFileSync('components/root/gamePrefetch.ts','utf8'),/import\(\/\* webpackPrefetch: true \*\/ '\.\/Game'\)/);
  assert.doesNotMatch(fs.readFileSync('components/root/RootSwitch.tsx','utf8'),/islandPreload|warmIsland/,'an in-game tab never warms');}

 // 6. The tan sheet's wait cue: tan mode only, late, transform/opacity only, still under reduced motion.
 {const css=fs.readFileSync('components/IslandLoading.module.css','utf8');
  assert.match(css,/\.tanCue\{display:none\}/);
  assert.match(css,/:global\(html\[data-island-handoff=tan\]\) \.screen>\.tanCue\{display:block;[^}]*animation:tanCueIn \.45s \.9s/,'shown only in tan mode, after 0.9 s');
  for(const k of css.matchAll(/@keyframes tanCue\w+\{([\s\S]*?)\}\}/g))assert.doesNotMatch(k[1],/(width|height|top|left|background|margin)\s*:/,'cue keyframes: transform/opacity only');
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{[^\n]*\.tanCueBall,\.tanCueShadow\{animation:none\}/);}
 console.log('island preload ok');
})().catch(e=>{console.error(e);process.exit(1);});
