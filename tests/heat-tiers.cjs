// Heat pass 4 (docs/performance-guide.md): thermal fallback tiers, hysteresis, Battery saver and their island wiring.
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const store=new Map(),localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const cache={};
const load=path=>{if(cache[path])return cache[path];const m={exports:{}};cache[path]=m.exports;
 vm.runInNewContext(ts.transpileModule(read(path),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,localStorage,Math,require:n=>n==='./heatTier'?load('lib/graphics/heatTier.ts'):{}});
 return cache[path]=m.exports;};
const H=load('lib/graphics/heatTier.ts');
const {ThermalGovernor,TIERS,DEFAULT_GOVERNOR}=H;

/** Drive a governor with rendered frames for `ms` (30 fps slots): interval/work may depend on the current tier. */
function run(g,ms,frame,start=0){let t=start;const changes=[];while(t<start+ms){const f=frame(g.tier,t);t+=f.interval;const r=g.sample(t,f.interval,f.work,f.load??120,f.view??'');if(r!==-1)changes.push({t,tier:r});}return {t,changes};}
const healthy=()=>({interval:1000/30,work:9});
const throttled=()=>({interval:50,work:31});

// 1. A healthy phone never leaves tier 0: 30 fps for 20 minutes, AND the iPhone's normal ~50 ms frames while flying (cool, not throttling;
// absolute slowness is no longer a reason to lower quality), with noise and pixel-ratio-switch spikes.
{const g=new ThermalGovernor();const r=run(g,20*60e3,(tier,t)=>t%10000<34?{interval:60,work:24}:healthy());assert.equal(g.tier,0);assert.equal(r.changes.length,0);
 let seed=3;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 const g2=new ThermalGovernor();const r2=run(g2,20*60e3,()=>({interval:44+rnd()*14,work:12}));assert.equal(g2.tier,0,'a cool iPhone flying at ~50 ms stays at tier 0');assert.equal(r2.changes.length,0);}
// 2. Short bursts (2 s of missed slots every 8 s, e.g. a truck landing or a menu opening) never step down.
{const g=new ThermalGovernor();run(g,10*60e3,(tier,t)=>t%8000<2000?throttled():healthy());assert.equal(g.tier,0,'bursts are not a hot phone');}
// 3. The iPhone recording pattern (Sep 26 2026): frame medians creeping 51 → 99 ms over ~70 s, still rising after. It steps down one
// tier at a time, the first within ~40 s (14 s to learn + creep to 1.3× + 12 s sustained), and never past the lowest.
{const g=new ThermalGovernor();const r=run(g,240e3,(tier,t)=>({interval:Math.min(150,51+t/70000*48),work:14}));
 assert(r.changes.length>=2,`steps: ${r.changes.length}`);assert(r.changes[0].t<45000&&r.changes[0].t>20000,`tier 1 at ${r.changes[0].t}`);
 r.changes.forEach((c,i)=>assert.equal(c.tier,i+1,'one tier at a time'));assert(/throttling/.test(g.log[0].reason));
 for(let i=1;i<r.changes.length;i++)assert(r.changes[i].t-r.changes[i-1].t>=DEFAULT_GOVERNOR.dwellMs);}
// 4. Severe frames (p90 ≥ 100 ms at a stable load) step down even without a trend, one tier at a time.
{const g=new ThermalGovernor();const r=run(g,5*60e3,()=>({interval:120,work:14}));assert.deepEqual(r.changes.map(c=>c.tier),[1,2,3,4]);assert(/severe/.test(g.log[0].reason));}
// 5. A heavier scene is not a hot phone: a rising trend while the load or view keeps changing never accumulates.
{const g=new ThermalGovernor();run(g,4*60e3,(tier,t)=>({interval:Math.min(150,51+t/70000*48),work:14,load:Math.floor(t/5000)%2?120:300}));assert.equal(g.tier,0);
 const g2=new ThermalGovernor();run(g2,4*60e3,(tier,t)=>({interval:Math.min(150,51+t/70000*48),work:14,view:Math.floor(t/6000)%2?'11v11':''}));assert.equal(g2.tier,0);}
// 6. Gaps (sleep, background, a paused menu) are ignored and restart the window.
{const g=new ThermalGovernor();let t=0;for(let i=0;i<400;i++){t+=i%20===0?5000:50;g.sample(t,i%20===0?5000:50,31,120,'');}assert.equal(g.tier,0,'a 5 s gap every 20 frames never forms a sustained slowdown');}
// 7. Stepping back up: after the phone cools, one tier up after 75 s of calm (not 3 minutes), not sooner.
{const g=new ThermalGovernor();const a=run(g,60e3,(tier,t)=>({interval:51+Math.min(1,t/40000)*40,work:14}));assert.equal(g.tier,1,`tier after warming ${g.tier}`);
 const b=run(g,60e3,()=>({interval:44,work:12}),a.t);assert.equal(g.tier,1,'still tier 1 after 60 s of calm');
 const c=run(g,60e3,()=>({interval:44,work:12}),b.t);assert.equal(g.tier,0,'back to tier 0 after ~75 s of calm');assert(c.changes[0].t-a.t>=DEFAULT_GOVERNOR.calmMs);}
// 8. No oscillation: a phone whose frames creep up at tier 0 (heating) but are steady at tier 1 flaps at most a few times an hour,
// and each relapse doubles the calm needed (75 → 150 → 300 … s, up to 20 min).
{const g=new ThermalGovernor();let enteredZero=0,prevTier=0;const r=run(g,60*60e3,(tier,t)=>{if(tier===0&&prevTier!==0)enteredZero=t;prevTier=tier;return tier===0?{interval:50+Math.min(40,(t-enteredZero)/1000),work:14}:{interval:46,work:12};});
 const ups=r.changes.filter(c=>c.tier===0).map(c=>c.t),downs=r.changes.filter(c=>c.tier===1).map(c=>c.t);
 assert(r.changes.length<=12,`changes in an hour: ${r.changes.length}`);assert(downs.length>=2,'it does flap back down when the heat returns');
 for(let i=1;i<ups.length;i++)assert(ups[i]-downs[i]>=(ups[i-1]-downs[i-1])*1.5||ups[i]-downs[i]>=DEFAULT_GOVERNOR.maxCalmMs,'calm needed grows after each flap');
 for(let i=1;i<r.changes.length;i++)assert(r.changes[i].t-r.changes[i-1].t>=DEFAULT_GOVERNOR.dwellMs);assert(g.calmRequiredMs>DEFAULT_GOVERNOR.calmMs);}
// 9. The ladder (quality pass, user decision Sep 26 2026): tier 0 = the device default (phones 1.75), 1 = 1.5, 2 = 1.25 + film 1.5,
// 3 = still water, 4 = 24 fps. NO tier changes what is drawn per frame (flashing hotfix): shadows every frame, no distance hiding, ≥ 1.25.
assert.deepEqual({...TIERS[0]},{cap30Everywhere:false,maxPixelRatio:Infinity,shadowEvery:1,shadowSize:2048,npcDrawDistance:null,trafficDrawDistance:null,staticAmbience:false,filmDpr:2,frameMs:1000/30});
assert.equal(TIERS[1].maxPixelRatio,1.5);for(const t of [1,2,3,4])assert.equal(TIERS[t].shadowSize,1024,`tier ${t}: the phone's 1536² shadow map drops to 1024²`);assert.equal(TIERS[1].filmDpr,2);assert.equal(TIERS[2].maxPixelRatio,1.25);for(const t of [2,3,4])assert.equal(TIERS[t].filmDpr,1.25);assert.equal(TIERS[1].filmDpr,2);
for(const t of [0,1,2,3,4]){const x=TIERS[t];assert.equal(x.shadowEvery,1,`tier ${t}: shadows every frame`);assert.equal(x.npcDrawDistance,null);assert.equal(x.trafficDrawDistance,null);assert(x.maxPixelRatio>=1.25,`tier ${t}: pixel ratio ≥ 1.25 (thin limbs)`);}
for(const t of [1,2,3,4])assert(TIERS[t].cap30Everywhere);assert(TIERS[3].staticAmbience&&TIERS[4].staticAmbience&&!TIERS[2].staticAmbience);
assert.equal(TIERS[4].frameMs,1000/24);assert.equal(TIERS[3].frameMs,1000/30);assert.equal(H.LOWEST_TIER,4);
// 9b. Battery saver forces the lowest tier, persists per viewer, and hands control back when off; forced tiers (tests) win.
{const seen=[];const off=H.subscribeHeatTier(t=>seen.push(t));
 assert.equal(H.effectiveTier(),0);H.setGovernorTier(1);assert.equal(H.effectiveTier(),1);
 H.setBatterySaver(true);assert.equal(H.effectiveTier(),4);assert.equal(store.get('fi2-battery-saver'),'on');assert.equal(H.batterySaverOn(),true);
 H.setGovernorTier(0);assert.equal(H.effectiveTier(),4,'the governor cannot lift Battery saver');
 H.setBatterySaver(false);assert.equal(H.effectiveTier(),0);assert(!store.has('fi2-battery-saver'));
 H.forceHeatTier(2);assert.equal(H.effectiveTier(),2);assert.equal(H.filmDprCap(),1.25,'hot phones print films at 1.25 (Oct 1 2026, item E)');H.forceHeatTier(null);assert.equal(H.filmDprCap(),2);
 off();assert.deepEqual(seen,[1,4,4,0,2,0]);}
// 10. MotionResolution limit: phones cap the moving and sharp ratios; desktop (never switching) follows the limit and returns to sharp.
{const {MotionResolution}=load('lib/graphics/quality.ts');
 const p=new MotionResolution(2,true);assert.equal(p.update(0,true),1.5);p.setLimit(1.25);assert.equal(p.update(33,true),1.25);assert.equal(p.update(66,false),0);assert.equal(p.update(700,false),0,'still stays at the limit');p.setLimit(Infinity);assert.equal(p.update(733,false),2);
 const d=new MotionResolution(2,false);assert.equal(d.update(0,true),0,'desktop unchanged at tier 0');d.setLimit(1.5);assert.equal(d.update(33,false),1.5);assert.equal(d.update(66,true),0);d.setLimit(Infinity);assert.equal(d.update(99,false),2);assert.equal(d.update(133,false),0);}
// 11. Island adapter: tier effects applied and fully restored; nothing hidden per object at any tier.
{const {createIslandHeat}=load('lib/graphics/islandHeat.ts');
 let limit=Infinity,npc=null;const renderer={shadowMap:{autoUpdate:true,needsUpdate:false}},sun={shadow:{mapSize:{x:2048,set(x){this.x=x;}},map:{dispose(){}}}};
 const car=(i,x,pickup=false)=>({index:i,pickup,group:{visible:true,position:{x,z:0}}});const cars=[car(0,10),car(1,200),car(7,300,true),car(2,250)];
 const heat=createIslandHeat({renderer,sun,resolution:{setLimit:v=>limit=v},npcs:{setDrawDistance:v=>npc=v},traffic:{cars,rider:{index:2}},governed:true});
 for(const t of [0,1,2,3,4]){H.forceHeatTier(t);for(let i=0;i<6;i++){renderer.shadowMap.needsUpdate=false;heat.beforeRender({x:0,z:0});}
  assert.equal(renderer.shadowMap.autoUpdate,true,`tier ${t}: shadows every frame`);assert(cars.every(c=>c.group.visible),`tier ${t}: no car hidden`);assert.equal(npc,null);assert.equal(sun.shadow.mapSize.x,t===0?2048:1024,`tier ${t}: shadow map (tier 0 = the device size, tiers 1+ ≤ 1024²)`);}
 H.forceHeatTier(1);assert.equal(limit,1.5);assert(heat.cap30);H.forceHeatTier(2);assert.equal(limit,1.25);assert.equal(heat.staticAmbience,false);H.forceHeatTier(3);assert(heat.staticAmbience);assert.equal(heat.frameMs,1000/30);H.forceHeatTier(4);assert.equal(heat.frameMs,1000/24);
 H.forceHeatTier(0);assert.equal(limit,Infinity);assert.equal(heat.frameMs,1000/30);heat.dispose();H.forceHeatTier(null);}
// 12. Wiring (source checks).
{const town=read('components/Town.tsx'),film=read('components/CardFilmPlayer.tsx'),settings=read('components/IslandSettings.tsx'),npcs=read('lib/graphics/islandNpcs.ts');
 assert.match(town,/const heat=createIslandHeat\(\{renderer,sun,resolution:motionResolution,npcs:islandNpcs,traffic:streetTraffic,governed:quality\.phone\}\);\(window as unknown as \{__fi2:Record<string,unknown>\}\)\.__fi2\.heat=heat;/);
 assert.match(town,/if\(idleFrame\|\|coarse\|\|heat\.cap30\)\{const slot=frameCapSlot\(now,lastRendered,Math\.max\(idleFrame,heat\.frameMs\)\)/);
 assert.match(town,/heat\.beforeRender\(location[^;]*\);renderer\.render\(scene,camera\);renderStats\.rendered\+\+;heat\.afterRender\(now,ms,performance\.now\(\)-now,renderer\.info\.render\.calls,learning\?\?''\);/);
 assert.match(town,/world\.updateWater\(active&&!learning\?dt:0,reduced\|\|heat\.staticAmbience\)/);assert.match(town,/return\(\)=>\{[^\n]{0,120}heat\.dispose\(\);/,'heat control disposed with the island');
 assert.match(film,/let cap=Math\.min\([^;]*filmDprCap\(\)\)/,'card film cap follows the heat tier');
 assert.match(settings,/aria-label="Battery saver" aria-pressed=\{saver\}[^>]*onClick=\{\(\)=>setBatterySaver\(!saver\)\}/);assert.match(settings,/Keeps your device cooler/);
 assert.match(npcs,/entry\.rig\.root\.visible=(!isThinned\(entry\)&&)?distance<\(drawLimit\?\?\(desktop\?96:72\)\)/);}
// 13. At the 24 fps tier a healthy phone is calm (samples are normalised to the active frame slot) and steps back up.
{H.forceHeatTier(null);H.setGovernorTier(0);const {createIslandHeat}=load('lib/graphics/islandHeat.ts');
 const heat=createIslandHeat({renderer:{shadowMap:{autoUpdate:true,needsUpdate:false}},sun:{shadow:{mapSize:{x:2048,set(){}},map:null}},resolution:{setLimit(){}},npcs:{setDrawDistance(){}},traffic:{cars:[],rider:{index:-1}},governed:true});
 let t=0;while(heat.tier<4&&t<600e3){const iv=150;t+=iv;heat.afterRender(t,iv,30,120,'');}assert.equal(heat.tier,4,'severe frames reach the lowest tier');assert.equal(heat.frameMs,1000/24);
 for(let i=0;i<24*120;i++){t+=1000/24;heat.afterRender(t,1000/24,8,120,'');}
 assert(heat.tier<4,`a healthy 24 fps phone steps back up (tier ${heat.tier})`);heat.dispose();H.setGovernorTier(0);}
console.log('PASS heat tiers: cool phone (30 fps or the iPhone\'s ~50 ms flying) stays tier 0, bursts/load changes/gaps ignored, rising trend or severe frames step down one tier at a time, 75 s calm to step up, flaps back off, tier 0 = default quality, Battery saver forces tier 3, no tier hides or flickers anything per frame, adapter applies and restores');
