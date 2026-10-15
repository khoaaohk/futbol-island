// The feel of fishing (Oct 15 2026, docs/fishing-research.md A1-A6, B1, B2, B6 + the deep-sea boats riding the swell):
// the tension-and-runs fight (kid-fair: never snaps, slips one notch, always lands), Easy reel kept, time-to-land no faster than the
// old tap-to-reel (economy), bite telegraphs, the tutorial once per device, stamps / football sizes / rarity stars, no per-frame
// React renders, the draw budget, the event API, and the boat motion limits.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),T=require('three');
const ROOT=path.resolve(__dirname,'..');
const data=new Map();
function environment(){
 const cache=new Map();
 const localStorage={getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
 const window={addEventListener(){},removeEventListener(){}};
 const context=vm.createContext({console,Set,Map,Math,Date,JSON,Promise,Object,Array,Number,String,Error,URL,localStorage,window,structuredClone,queueMicrotask,
  matchMedia:()=>({matches:false}),Float32Array,Float64Array,Uint8Array,Uint16Array,Int32Array});
 // The market basket and the explore signal are stubbed (tests/fishing.cjs covers them).
 const stubs=new Map([[path.resolve(ROOT,'lib/town/jobs/islandWallet.ts'),{islandMarket:{gather:()=>1}}],[path.resolve(ROOT,'lib/town/exploreSignals.ts'),{signalExplore(){}}],[path.resolve(ROOT,'lib/analytics/summitEvents.ts'),{countSummitFishCatch(){}}]]);
 function load(name){const file=path.resolve(ROOT,name);if(stubs.has(file))return stubs.get(file);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id));
  cache.set(file,mod.exports);return mod.exports;}
 return {load};
}
const e=environment(),src=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
let checks=0;const ok=(c,m)=>{assert(c,m);checks++;};
const lcg=seed=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};
const F=e.load('lib/town/fishing/fishingFight.ts'),core=e.load('lib/town/fishing/fishingCore.ts'),cat=e.load('lib/town/fishing/fishCatalog.ts');
const {FISH,FISH_SPOTS,fishById}=cat;

// ---- 1. Fight maths: tension, runs, slips, never snaps, always lands ----
{const r=lcg(3),cod=fishById('cod'),f=F.createFight(cod,60,r);
 f.holding=true;F.stepFight(f,.5,r);ok(f.tension>.15&&f.progress>0,'holding winds in and raises the tension');
 const t0=f.tension,p0=f.progress;f.holding=false;F.stepFight(f,.3,r);ok(f.tension<t0,'letting go eases the tension');ok(f.progress<=p0&&f.progress>=0,'a slack line gives a little line back, never below zero');
 // Force a slip: progress drops one notch, tension resets, nothing is lost.
 f.progress=.5;f.tension=.999;f.holding=true;const ev=F.stepFight(f,.05,r);
 ok(ev.includes('slip')&&Math.abs(f.progress-(.5-1/F.FIGHT_NOTCHES))<.02&&f.tension<.5&&f.stun>0,'a slip: back one notch, the line eases, a head-shake');
 f.progress=.1;f.tension=.999;f.stun=0;F.stepFight(f,.05,r);ok(f.progress===0,'a slip never goes below zero');}
// Commons never run; crabs never run; legendary animals and sharks make 3-4+ runs; each family has its style.
for(const fish of FISH){const fi=F.createFight(fish,fish.size[1],lcg(5)),style=F.fightStyle(fish);
 if(fish.rarity==='common'&&fish.group!=='shark')ok(fi.runAt.length===0,`${fish.id}: a common never runs`);
 if(style==='steady')ok(fi.runAt.length===0,`${fish.id}: steady pullers never run`);
 if(fish.group==='shark')ok(style==='runner'&&fi.runAt.length>=3,`${fish.id}: sharks make long runs`);
 ok(F.FIGHT_WORD[style]&&F.SHAPE_WORD[F.shadowShape(fish)],`${fish.id}: a fight word and a shape word`);}
ok(F.fightStyle({group:'eel',shape:'eel'})==='wiggle'&&F.fightStyle({group:'ray',shape:'ray'})==='heavy'&&F.fightStyle({group:'crab',shape:'crab'})==='steady'&&F.fightStyle({group:'fish',shape:'billfish'})==='leaper','eels wiggle, rays are heavy, crabs steady, billfish leap');
ok(F.STYLE_TUNE.runner.runLen[0]>F.STYLE_TUNE.classic.runLen[1]&&F.STYLE_TUNE.wiggle.runLen[1]<F.STYLE_TUNE.zippy.runLen[0]+.01,'sharks run long, eels dart short');
ok(F.shadowShapeWord(fishById('shark'))==='Finned','the shape word for the Fishbook');
// A countered run is turned; an uncountered one steals line and piles on tension.
{const mk=()=>{const f=F.createFight({group:'shark',shape:'shark',rarity:'rare',size:[50,90]},70,lcg(9));f.holding=true;f.progress=f.runAt[0]+.001;return f;};
 const a=mk(),b=mk();F.stepFight(a,.02,lcg(1));F.stepFight(b,.02,lcg(1));ok(a.run&&b.run,'a run starts at its mark');ok(F.counterDir(a)===-a.run.dir,'the counter is the other way');
 a.steer=F.counterDir(a);let turned=false;for(let i=0;i<60&&a.run;i++)turned=F.stepFight(a,1/30,lcg(2)).includes('turned')||turned;
 for(let i=0;i<20;i++)F.stepFight(b,1/30,lcg(2));ok(turned,'swiping the other way turns the run');ok(Math.abs(b.side)>Math.abs(a.side),'an unturned run pulls the fish out to the side');}
// Kid-fair: whatever the child does (plays well, only holds, never counters, taps), every fish lands in bounded time; nothing snaps.
const POLICIES={kid:{counter:true,release:true},hold:{counter:false,release:false},nocounter:{counter:false,release:true}};
function play(fish,size,policy,seed){const r=lcg(seed),f=F.createFight(fish,size,r),P=POLICIES[policy];let rel=false,react=0;
 for(let i=0;i<30*90;i++){f.holding=P.release?(f.tension>.85?(rel=true,false):f.tension<.55?(rel=false,true):!rel):true;
  if(f.run&&!f.run.turned){react+=1/30;if(P.counter&&react>.5)f.steer=-f.run.dir;}else{react=0;f.steer=0;}
  if(F.stepFight(f,1/30,r).includes('landed'))return f;}
 return null;}
const landTimes={};
for(const fish of FISH)for(const policy of Object.keys(POLICIES)){const f=play(fish,(fish.size[0]+fish.size[1])/2,policy,fish.id.length*7+policy.length);
 ok(f&&f.time<45,`${fish.id} lands with "${policy}" play (${f&&f.time.toFixed(1)} s)`);(landTimes[policy]??={})[fish.id]=f.time;}
ok(FISH.filter(f=>f.rarity!=='common').every(f=>landTimes.kid[f.id]<=landTimes.hold[f.id]+.05),'playing it well (easing off, turning runs) is never slower than holding through');

// Island Legends (Agent B's legendary.ts): their own 'legend' fight: three runs with a leap each, a longer rest on a slip, and they land.
{const L=e.load('lib/town/fishing/legendary.ts'),leg=L.LEGEND_FISH[0];ok(F.fightStyle(leg)==='legend','legends fight with the legend profile');
 const fl=F.createFight(leg,(leg.size[0]+leg.size[1])/2,lcg(4));ok(fl.runAt.length===F.LEGEND_RUNS,'a legend makes exactly three runs');
 const evs=[];const r=lcg(8);fl.holding=true;for(let i=0;i<30*90;i++){if(fl.run&&!fl.run.turned)fl.steer=-fl.run.dir;else fl.steer=0;fl.holding=fl.tension<.85;const ev=F.stepFight(fl,1/30,r);evs.push(...ev);if(ev.includes('landed'))break;}
 ok(evs.filter(x=>x==='leap').length===3&&evs.includes('landed'),'each run leaps and the legend lands');
 const f2=F.createFight(leg,leg.size[1],lcg(1));f2.tension=.999;f2.holding=true;f2.progress=.5;F.stepFight(f2,.05,lcg(1));ok(f2.stun===F.LEGEND_REST,'a slipping legend rests longer');
 for(const policy of Object.keys(POLICIES))ok(play(leg,leg.size[1],policy,5),`a legend lands with "${policy}" play`);
 const host=src('components/FishingHost.tsx');ok(/isLegendId\(view\.caught\.id\)/.test(host)&&/caught once and released/.test(host)&&/data-stamp="legend"/.test(host),'a legend gets its own card: no coins, no basket');
 ok(/fx\.effects\.rank===1/.test(host)&&/Spot record!/.test(host),'the RECORD stamp also shows a new spot record (B\'s record board)');}

// ---- 2. Economy: the fight's time-to-land is no faster than the old tap-to-reel (coins per minute cannot rise) ----
// Old model: a child tapping Reel at 3.5 taps a second (REEL_TAP_GAP caps it at ~8), the taps reelTapsFor() asks for.
{const TAP_HZ=3.5;let worstRatio=Infinity;const rows=[];
 for(const spot of FISH_SPOTS){const w=Object.entries(spot.weights),tot=w.reduce((n,[,x])=>n+x,0);let oldT=0,newT=0;
  for(const [id,x] of w){const fish=fishById(id),mid=(fish.size[0]+fish.size[1])/2,share=x/tot;
   oldT+=share*core.reelTapsFor(fish,mid)/TAP_HZ;
   let sum=0;for(let s=1;s<=6;s++)sum+=play(fish,fish.size[0]+(fish.size[1]-fish.size[0])*s/7,'kid',s*31+id.length).time;newT+=share*sum/6;}
  worstRatio=Math.min(worstRatio,newT/oldT);rows.push(`${spot.id} ${oldT.toFixed(2)}→${newT.toFixed(2)}s`);}
 ok(worstRatio>=1,`every spot's mean time-to-land is ≥ the old tap reel (worst ratio ${worstRatio.toFixed(2)})`);
 for(const r of ['common','uncommon','rare','legendary']){const fs2=FISH.filter(f=>f.rarity===r&&f.group!=='shark');if(!fs2.length)continue;
  const old=fs2.reduce((n,f)=>n+core.reelTapsFor(f,(f.size[0]+f.size[1])/2)/TAP_HZ,0)/fs2.length,neu=fs2.reduce((n,f)=>n+landTimes.kid[f.id],0)/fs2.length;
  ok(neu>=old,`${r}: fight ${neu.toFixed(2)} s ≥ taps ${old.toFixed(2)} s`);console.log(`time to land, ${r}: taps ${old.toFixed(2)} s → fight ${neu.toFixed(2)} s`);}
 console.log('per spot (catch-weighted):',rows.slice(0,4).join(', '),'…');}

// ---- 3. The session: fight by default, Easy reel kept, the warning twang (A5), hints, no per-frame renders, the event API ----
const sess=e.load('lib/town/fishing/fishingSession.ts'),spawn={approach:(r,f)=>{const pts=[];for(let i=0;i<=8;i++)pts.push({x:3-(3-cat.SHADOW_LENGTH[f.shadow]*.5-.05)*i/8,z:0});return {points:pts,circles:false,angle:0};},out:{x:1,z:0}};
function recast(api,spot,r){for(let i=0;i<40&&api.session.phase!=='ready'&&api.session.phase!=='floating';i++)api.handle(core.stepSession(api.session,spot,.1,r,spawn));if(api.session.phase!=='floating')api.tap();}
function toBite(api,spot,r){let n=0;while(api.session.phase!=='bite'&&n++<4000)api.handle(core.stepSession(api.session,spot,1/30,r,{...spawn,roll:api.catchRoll??undefined}));}
{const cues=[],events=[];const api=sess.createFishingSession(()=>({isNew:true,isBiggest:false,inBasket:true}),(k,s)=>cues.push([k,s]));
 let renders=0;api.subscribe(()=>renders++);const off=api.onFishingEvent(x=>events.push(x));api.onFishingEvent(()=>{throw Error('bad listener');});
 const spot=cat.spotById('west-cove'),r=lcg(11);api.begin(spot.id);api.tap();toBite(api,spot,r);
 const bite=cues.find(c=>c[0]==='plunge');ok(bite&&typeof bite[1]==='number','the bite cue carries the shadow size (scaled haptic)');
 api.tap();ok(api.session.phase==='reeling'&&api.session.fight&&api.getView().fight,'hooking starts the fight by default');
 ok(api.getView().hint===sess.FIGHT_HINT,'the fight hint');ok(api.tap()===undefined&&api.session.fight.progress===0,'taps do not reel in the fight');
 const before=renders;api.hold(true);let frames=0;
 while(api.session.phase==='reeling'&&frames++<30*60){const f=api.session.fight;if(f){if(f.tension>.85)api.hold(false);else if(f.tension<.5)api.hold(true);api.steer(F.counterDir(f));}
  api.handle(core.stepSession(api.session,spot,1/30,r,spawn));}
 ok(api.getView().phase==='caught','the fight lands the fish');
 ok(renders-before<frames/6+12,`the HUD re-renders on beats only (${renders-before} renders in ${frames} fight frames)`);
 const types=events.map(x=>x.type);ok(['cast','bite','hook','catch'].every(t=>types.includes(t)),`events in order: ${[...new Set(types)].join(',')}`);
 const c=events.find(x=>x.type==='catch');ok(c.fish&&c.size>0&&c.spot==='west-cove'&&c.at>0&&c.isNew===true&&c.rarity,'the catch event has fish, size, spot, time, record flags');
 ok(types.indexOf('hook')<types.indexOf('catch')&&types.indexOf('cast')<types.indexOf('bite'),'cast → bite → hook → catch');
 off();api.setOptions({lure:'panenka',derby:true});ok(api.options.lure==='panenka'&&api.options.derby,'session options: lure and derby');
 // Easy reel: the original tap rules.
 api.setOptions({easyReel:true});recast(api,spot,r);toBite(api,spot,r);api.tap();ok(api.session.phase==='reeling'&&!api.session.fight&&!api.getView().fight,'Easy reel keeps tap-to-reel');
 let n=0;while(api.session.phase==='reeling'&&n++<200){api.handle(core.stepSession(api.session,spot,.2,r,spawn));api.tap();}ok(api.session.phase==='caught','Easy reel lands by tapping');
 // A5: the twang comes before the idle escape, in both reels.
 for(const easy of [true,false]){api.setOptions({easyReel:easy});recast(api,spot,r);toBite(api,spot,r);api.tap();const seen=[];
  for(let i=0;i<30*10&&api.session.phase==='reeling';i++){const ev=core.stepSession(api.session,spot,1/30,r,spawn);seen.push(...ev.map(x=>[x,i/30]));api.handle(ev);if(ev.includes('warn'))ok(api.getView().hint===sess.WARN_HINT,'the warning hint');}
  const warn=seen.find(x=>x[0]==='warn'),esc=seen.find(x=>x[0]==='escaped');ok(warn&&esc&&warn[1]<esc[1]-2,`${easy?'Easy reel':'fight'}: the twang (${warn&&warn[1].toFixed(1)} s) well before the escape (${esc&&esc[1].toFixed(1)} s)`);
  ok(cues.some(c=>c[0]==='twang'),'the twang cue');let k=0;while(api.session.phase!=='floating'&&api.session.phase!=='ready'&&k++<200)api.handle(core.stepSession(api.session,spot,.1,r,spawn));}
 // setCatchRoll: content can replace the catch roll (lures, night fish).
 api.setOptions({easyReel:false});api.setCatchRoll(()=> 'sardine');recast(api,spot,r);toBite(api,spot,r);ok(api.session.fish.id==='sardine','setCatchRoll picks the catch');api.setCatchRoll(null);
 // Holding while the fight is in a slip still never loses the fish; a held line never escapes.
 }
{const s=core.createSession();s.fish={id:'shark',size:90};s.phase='bite';s.window=1;core.tapSession(s,{fight:true,rand:lcg(2)});s.fight.holding=true;let escaped=false;
 for(let i=0;i<30*60&&s.phase==='reeling';i++)escaped=core.stepSession(s,FISH_SPOTS[0],1/30,lcg(i),spawn).includes('escaped')||escaped;ok(!escaped&&s.phase==='caught','holding through every slip still lands a shark (never snaps, never escapes)');}

// ---- 4. Bite telegraphs (A1), silhouettes (A2), haptics ----
{const store=e.load('lib/town/fishing/fishingStore.ts');
 ok(store.hapticFor('tick')===6&&store.hapticFor('plunge',0)===14&&store.hapticFor('plunge',4)===30&&store.hapticFor('plunge',2)>store.hapticFor('plunge',1),'a 6 ms nibble tick; the bite pulse grows 14 → 30 ms with the shadow');
 const ov=src('lib/town/fishing/fishingOverlay.ts'),vis=src('lib/town/fishing/fishingVisuals.ts');
 ok(/bang:12,fin:13,wake:14/.test(ov)&&/The bite's "!"/.test(ov),'the "!", fin and wake are kinds in the overlay\'s one draw');
 ok(/overlay\.mark\('bang',cast\.x,SURFACE\+1\.05,cast\.z/.test(vis)&&/b\.kind==='under'/.test(vis),'the "!" shows over the float for the bite window');
 ok(/overlay\.mark\('fin'/.test(vis)&&/shKind==='shark'/.test(vis),'sharks show a dorsal fin and wake on the approach');
 ok(/kind==='eel'/.test(vis),'eels have a long thin silhouette');
 const {createFishingOverlay}=e.load('lib/town/fishing/fishingOverlay.ts'),o=createFishingOverlay(new T.Scene());o.begin();o.mark('bang',0,0,0,1);o.mark('fin',0,0,0,1);o.mark('wake',0,0,0,1);o.frame(1/30,false,0);
 ok(o.mesh.count>=3,'marks are drawn');o.frame(1/30,false,0);const after=o.mesh.count;o.end();for(let i=0;i<60;i++)o.frame(1/30,false,i);ok(after===0&&!o.mesh.visible,'marks last one frame; the overlay sleeps after');o.dispose();}

// GLSL sanity: a // comment never swallows code on the same line (it hid the wake's declarations once: "'crest' : undeclared").
for(const f of ['lib/town/fishing/fishingOverlay.ts','lib/town/fishing/deepSeaBoat.ts','lib/town/fishing/fishingVisuals.ts']){const code=src(f);
 for(const m of code.matchAll(/\/\*\s*glsl\s*\*\/`([\s\S]*?)`/g))for(const line of m[1].split('\n')){const i=line.indexOf('//');if(i>=0)ok(!/;/.test(line.slice(i)),`${f}: no code after a GLSL // comment: ${line.slice(i,i+60)}`);}}

// ---- 5. Tutorial once per device (A3), Easy reel remembered, device keys ----
{const store=e.load('lib/town/fishing/fishingStore.ts'),snap=src('lib/saves/snapshot.ts'),doc=src('docs/accounts-design.md');
 ok(store.fishingPrefs().tutorialDone===false,'a new device sees the tutorial');store.finishFishingTutorial();ok(data.get('fi2-fish-tutorial-v1')==='1'&&store.fishingPrefs().tutorialDone,'finished once, remembered');
 store.setEasyReel(true);ok(data.get('fi2-fish-easy-reel-v1')==='1'&&store.fishingSession.options.easyReel,'Easy reel remembered and applied');store.setEasyReel(false);
 store.resetFishingTutorial();ok(!store.fishingPrefs().tutorialDone,'the tutorial can be replayed');
 ok(/'fi2-fish-tutorial-v1','fi2-fish-easy-reel-v1'/.test(snap)&&/`fi2-fish-tutorial-v1`/.test(doc)&&/`fi2-fish-easy-reel-v1`/.test(doc),'both are DEVICE keys (snapshot + accounts design)');
 const host=src('components/FishingHost.tsx'),tut=src('components/FishingTutorial.tsx');
 ok(/!prefs\.tutorialDone/.test(host)&&/onDone=\{finishFishingTutorial\}/.test(host),'the HUD shows the tutorial until it is done');
 ok(['aim','watch','wait','now','reel'].every(k=>new RegExp(`${k}:'`).test(tut))&&/GhostHand/.test(host),'the steps: aim, watch, wait, NOW, reel, with the ghost hand');
 ok(!/setTimeout|setInterval|requestAnimationFrame/.test(tut),'the tutorial has no timers');}

// ---- 6. Catch card: NEW / RECORD stamps, football sizes (A4), rarity stars (A6) ----
{const card=e.load('lib/town/fishing/fishingCard.ts');
 const s=cm=>card.sizeCompare(cm);
 ok(s(62).unit==='boot'&&/2 football boots/.test(s(62).text),'62 cm: about 2 boots');ok(s(22).unit==='ball'&&/as wide as a football/.test(s(22).text),'22 cm: a football');
 ok(s(160).unit==='goal'&&/fifth of a goal/.test(s(160).text),'160 cm: a fifth of a goal');ok(/half a football/.test(s(10).text)&&/smaller than half/.test(s(5).text),'small catches');
 ok(FISH.every(f=>s(f.size[0]).text&&s(f.size[1]).text),'every size has words');
 ok(new Set(Object.values(card.RARITY_STARS)).size===4&&card.rarityStarText('rare')==='★★★☆','rarity is 1-4 stars');
 const host=src('components/FishingHost.tsx');
 ok(/data-stamp="new"/.test(host)&&/data-stamp="record"/.test(host)&&/view\.caught\.isBiggest/.test(host),'NEW and RECORD stamps on the card');
 ok(/<RarityStars rarity=\{fish\.rarity\}/.test(host)&&(host.match(/<RarityStars/g)||[]).length>=2,'rarity stars on the card and in the HUD');
 ok(/sizeCompare\(view\.caught\.size\)/.test(host),'the size in football units');
 ok(/leapFlash/.test(host)&&/prefers-reduced-motion[^}]*\.leapFlash\{display:none\}/.test(src('components/FishingHost.module.css')),'the leap flash, none with reduced motion');}

// ---- 7. No per-frame React work, the arc is CSS through refs; the draw budget; heat gates ----
{const host=src('components/FishingHost.tsx'),world=src('lib/town/fishing/fishingWorld.ts'),css=src('components/FishingHost.module.css'),vis=src('lib/town/fishing/fishingVisuals.ts');
 ok(/data-fish-fight=\{fighting\?'':undefined\}/.test(host)&&/arc\.style\.setProperty\('--tension'/.test(world)&&/arc\.style\.setProperty\('--progress'/.test(world),'the world writes --tension / --progress onto the Reel button');
 ok(/Math\.abs\(meter\.tension-arcShown\.t\)>\.004/.test(world),'only when the value moved');
 ok(/calc\(var\(--tension,0\) \* 270deg\)/.test(css)&&/scaleX\(var\(--progress,0\)\)/.test(css),'the arc and the progress bar are CSS');
 ok(!/requestAnimationFrame|setInterval/.test(host),'no loops in the HUD');
 ok((vis.match(/new T\.(Mesh|InstancedMesh|Line)\(/g)||[]).length<=8,'fishing visuals still own ≤ 8 drawables');
 ok((src('lib/town/fishing/fishingOverlay.ts').match(/new T\.(Mesh|InstancedMesh)\(/g)||[]).length===1,'the overlay is still ONE draw');
 ok((src('lib/town/fishing/deepSeaBoat.ts').match(/new T\.Mesh\(/g)||[]).length===1,'the boat is still ONE draw (the foam lap is in its shader)');
 ok(/const meter=fishing\?session\.fightMeter:null/.test(world),'fight work only while fishing');
 ok(/leapPath/.test(vis)&&/if\(!reduced&&landingAge<1\)/.test(vis),'the leap (none with reduced motion)');
 const V=e.load('lib/town/fishing/fishingVisuals.ts');let prev=-1,flat=0;for(let i=0;i<=100;i++){const u=V.leapPath(i/100);ok(u>=prev-1e-9,'the leap path only moves forward');if(i/100>.43&&i/100<.57)flat=Math.max(flat,Math.abs(u-.5));prev=u;}
 ok(flat<=.011&&V.LEAP_S*V.LEAP_HOLD>.12&&V.LEAP_S*V.LEAP_HOLD<.2,`a ~150 ms freeze at the top (${(V.LEAP_S*V.LEAP_HOLD*1000).toFixed(0)} ms)`);}

// ---- 8. The deep-sea boats ride the swell: limits, camera stabilisation, calm at rest ----
{const M=e.load('lib/town/fishing/boatMotion.ts');
 const run=(o,secs=60,dt=1/60,extra)=>{const r=M.createBoatRide();let max={heave:0,pitch:0,roll:0,yaw:0};for(let i=0;i<secs/dt;i++){const m=M.stepBoatMotion(r,dt,i*dt,.3,{...o,...(extra?extra(i*dt):{})});for(const k in max)max[k]=Math.max(max[k],Math.abs(m[k]));}return {max,r};};
 const idle=run({fishing:false,reduced:false}),fish=run({fishing:true,reduced:false},60,1/60,t=>({kick:Math.abs(t%7)<1/60,lean:Math.sin(t*.7)})),red=run({fishing:true,reduced:true},30,1/60,()=>({kick:true,lean:1}));
 ok(idle.max.heave>.02&&idle.max.heave<=.05&&idle.max.roll<.025,`idle bob is small (heave ${idle.max.heave.toFixed(3)} m)`);
 ok(fish.max.heave>idle.max.heave&&fish.max.heave<=M.BOAT_LIMITS.heave&&fish.max.roll<=M.BOAT_LIMITS.tilt&&fish.max.pitch<=M.BOAT_LIMITS.tilt,`fishing: more motion within limits (heave ${fish.max.heave.toFixed(3)} m, roll ${(fish.max.roll*57.3).toFixed(1)}°)`);
 ok(red.max.roll===0&&red.max.pitch===0&&red.max.heave<=.013,'reduced motion: a very small heave only');
 {const r=M.createBoatRide();M.stepBoatMotion(r,1/60,0,0,{fishing:true,reduced:false,kick:true});let peak=0;for(let i=0;i<120;i++)peak=Math.max(peak,Math.abs(r.rollKick));for(let i=0;i<600;i++)M.stepBoatMotion(r,1/60,0,0,{fishing:false,reduced:false});ok(M.boatSettled(r),'the cast rock settles: nothing left at rest');}
 {const r=M.createBoatRide(),a=M.stepBoatMotion(r,1/60,10,0,{fishing:false,reduced:false}),b=M.stepBoatMotion(r,1/60,10,0,{fishing:false,reduced:false});ok(Math.abs(a.heave-b.heave)<1e-9,'the water clock frozen (still water): the boat holds still');}
 const {createFishingCamera}=e.load('lib/town/fishing/fishingCamera.ts'),cam=createFishingCamera(),camera=new T.PerspectiveCamera(40,390/844,.1,1000);
 cam.begin({x:0,z:0},{x:0,z:1},12);for(let i=0;i<120;i++)cam.apply(camera,1/60,false);let maxOff=0;
 for(let i=0;i<600;i++){cam.ride(Math.sin(i/60*Math.PI*2/5.6)*M.BOAT_SWELL.fishing.heave);cam.apply(camera,1/60,false);maxOff=Math.max(maxOff,Math.abs(cam.rideOffset));}
 ok(maxOff>0&&maxOff<=M.BOAT_SWELL.fishing.heave*M.CAMERA_RIDE+1e-6,`the camera follows only ${(maxOff*100).toFixed(1)} cm of the ${(M.BOAT_SWELL.fishing.heave*100).toFixed(0)} cm heave (stabilised)`);
 const camR=createFishingCamera();camR.begin({x:0,z:0},{x:0,z:1},12);camR.ride(.07);camR.apply(camera,1/60,true);ok(camR.rideOffset===0,'reduced motion: the camera does not ride');
 const boat=src('lib/town/fishing/deepSeaBoat.ts');
 ok(/let bob=riding\|\|d<BOB_RANGE/.test(boat)&&/frustum\.intersectsSphere/.test(boat)&&/boatSettled\(ride\)/.test(boat),'the boat moves only near and on screen (or while fished from), and sleeps once settled');
 ok(/fw\.y=\$\{WATERLINE_Y/.test(boat)&&/foam>\.5/.test(boat),'the foam collar is pinned to the sea in the vertex shader (no new draw)');
 ok(/deck\.height=BOAT_DECK_Y\+m\.heave/.test(boat),'the deck floor (and the angler on it) rides the heave');
 const world=src('lib/town/fishing/fishingWorld.ts');ok(/liveBoat\(\)\?\.kick\(\)/.test(world)&&/liveBoat\(\)\?\.lean\(/.test(world)&&/cam\.ride\(liveBoat\(\)\?\.motion\.heave\?\?0\)/.test(world),'a cast rocks it, a run leans it, the camera rides along');}

console.log(`PASS fishing fight + feel: tension fight (never snaps, slips a notch, always lands), Easy reel, time-to-land ≥ taps, bite "!" and haptics, fins and eels, the tutorial once, stamps / football sizes / stars, CSS arc with no per-frame renders, draw budget, event API, boat swell (${checks} checks)`);
