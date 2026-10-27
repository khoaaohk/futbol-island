// The feel of fishing (Oct 15 2026, docs/fishing-research.md A1-A6, B1, B2, B6 + the deep-sea boats riding the swell), with the
// SPIN REEL of 15 Oct 2026 (user: "make it like Pokémon GO where they have to spin"): the tension-and-runs fight driven by a 0..1
// spin rate (kid-fair: never snaps, slips one notch, always lands; a run = stop spinning), time-to-land no faster
// than the old tap-to-reel (economy), bite telegraphs, the tutorial once per device, stamps / football sizes / rarity stars, no
// per-frame React renders, the draw budget, the event API, and the boat motion limits.
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

// ---- 1. Fight maths: the spin rate, tension, runs, slips, never snaps, always lands ----
{const r=lcg(3),cod=fishById('cod'),f=F.createFight(cod,60,r);
 F.setHold(f,true);ok(f.holding&&f.rate===1,'setHold with no rate is a full spin');F.stepFight(f,.5,r);ok(f.tension>.15&&f.progress>0,'spinning winds in and raises the tension');
 const t0=f.tension,p0=f.progress;F.setHold(f,false);ok(!f.holding&&f.rate===0,'let go: rate 0');F.stepFight(f,.3,r);ok(f.tension<t0,'stopping eases the tension');ok(f.progress<=p0&&f.progress>=0,'a slack line gives a little line back, never below zero');
 // Force a slip: progress drops one notch, tension resets, nothing is lost.
 f.progress=.5;f.tension=.999;F.setHold(f,true);const ev=F.stepFight(f,.05,r);
 ok(ev.includes('slip')&&Math.abs(f.progress-(.5-1/F.FIGHT_NOTCHES))<.02&&f.tension<.5&&f.stun>0,'a slip: back one notch, the line eases, a head-shake');
 f.progress=.1;f.tension=.999;f.stun=0;F.stepFight(f,.05,r);ok(f.progress===0,'a slip never goes below zero');}
// The spin rate scales winding and tension; it is capped at 1 (spinning faster than full gives nothing extra); junk rates are 0.
{const mk=rate=>{const f=F.createFight(fishById('cod'),60,lcg(3));F.setHold(f,true,rate);for(let i=0;i<10;i++)F.stepFight(f,.1,lcg(1));return f;};
 const full=mk(1),half=mk(.5),fast=mk(3),zero=mk(0),nan=mk(NaN);
 ok(Math.abs(half.progress*2-full.progress)<1e-9&&half.tension<full.tension,'half the spin rate winds half as much and strains less');
 ok(fast.rate===1&&fast.progress===full.progress&&fast.tension===full.tension,'faster than a full spin is capped at 1');
 ok(zero.rate===0&&!zero.holding&&zero.progress===0&&nan.rate===0,'rate 0 (or junk) is not spinning');
 ok(F.FULL_SPIN_S>=.5&&F.FULL_SPIN_S<=1,'a full spin is about one revolution a second or slower (a 6-year-old can reach it)');}
// Commons never run; crabs never run; legendary animals and sharks make 3-4+ runs; each family has its style.
for(const fish of FISH){const fi=F.createFight(fish,fish.size[1],lcg(5)),style=F.fightStyle(fish);
 if(fish.rarity==='common'&&fish.group!=='shark')ok(fi.runAt.length===0,`${fish.id}: a common never runs`);
 if(style==='steady')ok(fi.runAt.length===0,`${fish.id}: steady pullers never run`);
 if(fish.group==='shark')ok(style==='runner'&&fi.runAt.length>=3,`${fish.id}: sharks make long runs`);
 ok(F.FIGHT_WORD[style]&&F.SHAPE_WORD[F.shadowShape(fish)],`${fish.id}: a fight word and a shape word`);}
ok(F.fightStyle({group:'eel',shape:'eel'})==='wiggle'&&F.fightStyle({group:'ray',shape:'ray'})==='heavy'&&F.fightStyle({group:'crab',shape:'crab'})==='steady'&&F.fightStyle({group:'fish',shape:'billfish'})==='leaper','eels wiggle, rays are heavy, crabs steady, billfish leap');
ok(F.STYLE_TUNE.runner.runLen[0]>F.STYLE_TUNE.classic.runLen[1]&&F.STYLE_TUNE.wiggle.runLen[1]<F.STYLE_TUNE.zippy.runLen[0]+.01,'sharks run long, eels dart short');
ok(F.shadowShapeWord(fishById('shark'))==='Finned','the shape word for the Fishbook');
// A run: stop spinning and it tires sooner (RUN_TIRE) with the tension easing; spinning through it piles on tension and ends in a slip.
{const mk=()=>{const f=F.createFight({group:'shark',shape:'shark',rarity:'rare',size:[50,90]},70,lcg(9));F.setHold(f,true);f.progress=f.runAt[0]+.001;return f;};
 const a=mk(),b=mk();F.stepFight(a,.02,lcg(1));F.stepFight(b,.02,lcg(1));ok(a.run&&b.run&&F.running(a),'a run starts at its mark');ok(!('steer' in a)&&!('turned' in a.run)&&typeof F.counterDir==='undefined'&&typeof F.setSteer==='undefined','no steer, no counter, no turning any more');
 const len=a.run.len,pa=a.progress,pb=b.progress;F.setHold(a,false);let ta=0,slipB=false;for(let i=0;i<120&&a.run;i++){F.stepFight(a,1/30,lcg(2));ta+=1/30;}
 for(let i=0;i<120&&b.run;i++)slipB=F.stepFight(b,1/30,lcg(2)).includes('slip')||slipB;
 ok(Math.abs(ta-len/F.RUN_TIRE)<.08,`a run tires ${F.RUN_TIRE}× faster while the reel is still (${ta.toFixed(2)} s of a ${len.toFixed(2)} s run)`);
 ok(a.tension<.6&&a.slips===0&&pa-a.progress<1/F.FIGHT_NOTCHES,'stopping keeps the tension down: no slip, less than a notch of line lost');
 ok(slipB&&b.slips===1&&pb-b.progress>pa-a.progress,'spinning through a run piles on tension and ends in a slip (a notch lost)');
 const c=mk();F.stepFight(c,.02,lcg(1));for(let i=0;i<10;i++)F.stepFight(c,1/30,lcg(2));ok(Math.abs(c.side)>.1,'a run pulls the fish out to the side (the visuals)');}
// Kid-fair: whatever the child does (plays well, only spins, spins slowly), every fish lands in bounded time; nothing snaps.
// "kid": spins at the full rate, eases off in the red, stops spinning when it runs; "hold": spins through everything; "slow": a
// half-rate spin that never stops.
const POLICIES={kid:{stop:true,release:true,rate:1},hold:{stop:false,release:false,rate:1},slow:{stop:false,release:false,rate:.5}};
function play(fish,size,policy,seed){const r=lcg(seed),f=F.createFight(fish,size,r),P=POLICIES[policy];let rel=false,react=0;
 for(let i=0;i<30*90;i++){let on=P.release?(f.tension>.85?(rel=true,false):f.tension<.55?(rel=false,true):!rel):true;
  if(f.run){react+=1/30;if(P.stop&&react>.4)on=false;}else react=0;
  F.setHold(f,on,P.rate);
  if(F.stepFight(f,1/30,r).includes('landed'))return f;}
 return null;}
const landTimes={},slipCount={};
for(const fish of FISH)for(const policy of Object.keys(POLICIES)){const f=play(fish,(fish.size[0]+fish.size[1])/2,policy,fish.id.length*7+policy.length);
 ok(f&&f.time<60,`${fish.id} lands with "${policy}" play (${f&&f.time.toFixed(1)} s)`);(landTimes[policy]??={})[fish.id]=f.time;(slipCount[policy]??={})[fish.id]=f.slips;}
{const runners=FISH.filter(f=>f.rarity!=='common'),mean=(p)=>runners.reduce((n,f)=>n+landTimes[p][f.id],0)/runners.length,slips=(p)=>runners.reduce((n,f)=>n+slipCount[p][f.id],0);
 ok(mean('kid')<=mean('hold'),`playing it well (easing off, stopping in a run) is faster on average than spinning through (${mean('kid').toFixed(2)} s vs ${mean('hold').toFixed(2)} s)`);
 ok(slips('kid')<slips('hold'),`and slips less (${slips('kid')} vs ${slips('hold')} slips over the non-commons)`);
 ok(FISH.every(f=>landTimes.slow[f.id]>=landTimes.hold[f.id]-.05),'a slow spin never lands faster than a full one');}

// Island Legends (Agent B's legendary.ts): their own 'legend' fight: three runs with a leap each, a longer rest on a slip, and they land.
{const L=e.load('lib/town/fishing/legendary.ts'),leg=L.LEGEND_FISH[0];ok(F.fightStyle(leg)==='legend','legends fight with the legend profile');
 const fl=F.createFight(leg,(leg.size[0]+leg.size[1])/2,lcg(4));ok(fl.runAt.length===F.LEGEND_RUNS,'a legend makes exactly three runs');
 const evs=[];const r=lcg(8);for(let i=0;i<30*90;i++){F.setHold(fl,!fl.run&&fl.tension<.85);const ev=F.stepFight(fl,1/30,r);evs.push(...ev);if(ev.includes('landed'))break;}
 ok(evs.filter(x=>x==='leap').length===3&&evs.includes('landed'),'each run leaps and the legend lands');
 const f2=F.createFight(leg,leg.size[1],lcg(1));f2.tension=.999;F.setHold(f2,true);f2.progress=.5;F.stepFight(f2,.05,lcg(1));ok(f2.stun===F.LEGEND_REST,'a slipping legend rests longer');
 for(const policy of Object.keys(POLICIES))ok(play(leg,leg.size[1],policy,5),`a legend lands with "${policy}" play`);
 const host=src('components/FishingHost.tsx');ok(/isLegendId\(view\.caught\.id\)/.test(host)&&/caught once and released/.test(host)&&/data-stamp="legend"/.test(host),'a legend gets its own card: no coins, no basket');
 ok(!/Spot record|isSpotRecord|effects\.rank/.test(host),'no spot record stamp any more (the record boards were removed, 15 Oct 2026)');}

// ---- 2. Economy: the fight's time-to-land (a full spin, played well) never gets trivially short (coins per minute cannot rise; the old tap reel took ~1-1.3 s a catch and is gone) ----
{const rows=[];let worst=Infinity;
 for(const spot of FISH_SPOTS){const w=Object.entries(spot.weights),tot=w.reduce((n,[,x])=>n+x,0);let newT=0;
  for(const [id,x] of w){const fish=fishById(id),share=x/tot;
   let sum=0;for(let s=1;s<=6;s++)sum+=play(fish,fish.size[0]+(fish.size[1]-fish.size[0])*s/7,'kid',s*31+id.length).time;newT+=share*sum/6;}
  worst=Math.min(worst,newT);rows.push(`${spot.id} ${newT.toFixed(2)}s`);}
 ok(worst>=1.5,`every spot's mean time-to-land is at least 1.5 s (worst ${worst.toFixed(2)} s)`);
 for(const r of ['common','uncommon','rare','legendary']){const fs2=FISH.filter(f=>f.rarity===r&&f.group!=='shark');if(!fs2.length)continue;
  const neu=fs2.reduce((n,f)=>n+landTimes.kid[f.id],0)/fs2.length;ok(neu>=1.5,`${r}: fight ${neu.toFixed(2)} s`);console.log(`time to land, ${r}: fight ${neu.toFixed(2)} s`);}
 console.log('per spot (catch-weighted):',rows.slice(0,4).join(', '),'…');}

// ---- 3. The session: fight by default, the spin input (rate, fade, keyboard hold), the warning twang (A5), hints, no per-frame renders, the event API ----
const sess=e.load('lib/town/fishing/fishingSession.ts'),spawn={approach:(r,f)=>{const pts=[];for(let i=0;i<=8;i++)pts.push({x:3-(3-cat.SHADOW_LENGTH[f.shadow]*.5-.05)*i/8,z:0});return {points:pts,circles:false,angle:0};},out:{x:1,z:0}};
function recast(api,spot,r){for(let i=0;i<40&&api.session.phase!=='ready'&&api.session.phase!=='floating';i++)api.handle(core.stepSession(api.session,spot,.1,r,spawn));if(api.session.phase!=='floating')api.tap();}
function toBite(api,spot,r){let n=0;while(api.session.phase!=='bite'&&n++<4000)api.handle(core.stepSession(api.session,spot,1/30,r,{...spawn,roll:api.catchRoll??undefined}));}
{const cues=[],events=[];const api=sess.createFishingSession(()=>({isNew:true,isBiggest:false,inBasket:true}),(k,s)=>cues.push([k,s]));
 let renders=0;api.subscribe(()=>renders++);const off=api.onFishingEvent(x=>events.push(x));api.onFishingEvent(()=>{throw Error('bad listener');});
 const spot=cat.spotById('west-cove'),r=lcg(11);api.begin(spot.id);api.tap();toBite(api,spot,r);
 const bite=cues.find(c=>c[0]==='plunge');ok(bite&&typeof bite[1]==='number','the bite cue carries the shadow size (scaled haptic)');
 api.tap();ok(api.session.phase==='reeling'&&api.session.fight&&api.getView().fight,'hooking starts the fight by default');
 ok(api.getView().hint===sess.FIGHT_HINT&&/Spin the reel/.test(sess.FIGHT_HINT)&&/Stop spinning/.test(sess.RUN_HINT),'the fight hints: spin the reel; a run = stop spinning');ok(api.tap()===undefined&&api.session.fight.progress===0,'taps do not reel in the fight');
 ok(typeof api.steer==='undefined'&&typeof sess.TURNED_HINT==='undefined'&&typeof sess.runHint==='undefined','no steer in the session API, no turned hint');
 // The spin input: a finger's rate goes straight to the fight (capped), holds for SPIN_HOLD_MS, then fades; Space is a steady full spin.
 {let now=1000;api.spin(.6,now);ok(api.session.fight.rate===.6&&api.session.fight.holding&&api.spinRate===.6,'spin(rate) drives the fight');
  api.spin(2,now);ok(api.session.fight.rate===1,'a spin rate is capped at 1');api.spin(.6,now);
  api.tickSpin(now+sess.SPIN_HOLD_MS-1);ok(api.session.fight.rate===.6,'the rate holds between pointer moves');
  api.tickSpin(now+sess.SPIN_HOLD_MS+sess.SPIN_FADE_MS*.5);ok(api.session.fight.rate>0&&api.session.fight.rate<.6,'then fades once the finger stops');
  api.tickSpin(now+sess.SPIN_HOLD_MS+sess.SPIN_FADE_MS*2);ok(api.session.fight.rate===0&&!api.session.fight.holding,'and stops');
  api.spin(.4,now);api.hold(true);ok(api.session.fight.rate===1&&api.spinRate===1,'a held key is a full spin whatever the finger does');api.hold(false);ok(api.session.fight.rate===.4,'letting go of the key leaves the finger\'s rate');api.spinEnd();ok(api.session.fight.rate===0,'spinEnd stops');}
 const before=renders;let frames=0;
 while(api.session.phase==='reeling'&&frames++<30*60){const f=api.session.fight;if(f){if(f.run||f.tension>.85)api.hold(false);else if(f.tension<.5)api.hold(true);}
  api.handle(core.stepSession(api.session,spot,1/30,r,spawn));}
 ok(api.getView().phase==='caught','the fight lands the fish');
 ok(renders-before<frames/6+12,`the HUD re-renders on beats only (${renders-before} renders in ${frames} fight frames)`);
 const types=events.map(x=>x.type);ok(['cast','bite','hook','catch'].every(t=>types.includes(t)),`events in order: ${[...new Set(types)].join(',')}`);
 const c=events.find(x=>x.type==='catch');ok(c.fish&&c.size>0&&c.spot==='west-cove'&&c.at>0&&c.isNew===true&&c.rarity,'the catch event has fish, size, spot, time, record flags');
 ok(types.indexOf('hook')<types.indexOf('catch')&&types.indexOf('cast')<types.indexOf('bite'),'cast → bite → hook → catch');
 off();api.setOptions({lure:'panenka'});ok(api.options.lure==='panenka'&&!('derby' in api.options),'session options: the lure (no derby)');
 // A5: the twang comes before the idle escape, in both reels.
 for(const easy of [false]){recast(api,spot,r);toBite(api,spot,r);api.tap();const seen=[];
  for(let i=0;i<30*10&&api.session.phase==='reeling';i++){const ev=core.stepSession(api.session,spot,1/30,r,spawn);seen.push(...ev.map(x=>[x,i/30]));api.handle(ev);if(ev.includes('warn'))ok(api.getView().hint===sess.WARN_HINT,'the warning hint');}
  const warn=seen.find(x=>x[0]==='warn'),esc=seen.find(x=>x[0]==='escaped');ok(warn&&esc&&warn[1]<esc[1]-2,`fight: the twang (${warn&&warn[1].toFixed(1)} s) well before the escape (${esc&&esc[1].toFixed(1)} s)`);
  ok(cues.some(c=>c[0]==='twang'),'the twang cue');let k=0;while(api.session.phase!=='floating'&&api.session.phase!=='ready'&&k++<200)api.handle(core.stepSession(api.session,spot,.1,r,spawn));}
 // setCatchRoll: content can replace the catch roll (lures, night fish).
 api.setCatchRoll(()=> 'sardine');recast(api,spot,r);toBite(api,spot,r);ok(api.session.fish.id==='sardine','setCatchRoll picks the catch');api.setCatchRoll(null);
 // Holding while the fight is in a slip still never loses the fish; a held line never escapes.
 }
{const s=core.createSession();s.fish={id:'shark',size:90};s.phase='bite';s.window=1;core.tapSession(s,{fight:true,rand:lcg(2)});F.setHold(s.fight,true);let escaped=false;
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

// ---- 5. Tutorial once per device (A3), device keys ----
{const store=e.load('lib/town/fishing/fishingStore.ts'),snap=src('lib/saves/snapshot.ts'),doc=src('docs/accounts-design.md');
 ok(store.fishingPrefs().tutorialDone===false,'a new device sees the tutorial');store.finishFishingTutorial();ok(data.get('fi2-fish-tutorial-v1')==='1'&&store.fishingPrefs().tutorialDone,'finished once, remembered');
 store.resetFishingTutorial();ok(!store.fishingPrefs().tutorialDone,'the tutorial can be replayed');
 ok(/'fi2-fish-tutorial-v1'/.test(snap)&&/`fi2-fish-tutorial-v1`/.test(doc)&&!/easy-reel/.test(snap+doc),'the tutorial flag is a DEVICE key (snapshot + accounts design); the Easy reel key is gone');
 const host=src('components/FishingHost.tsx'),tut=src('components/FishingTutorial.tsx');
 ok(/!prefs\.tutorialDone/.test(host)&&/onDone=\{finishFishingTutorial\}/.test(host),'the HUD shows the tutorial until it is done');
 ok(['aim','watch','wait','now','reel'].every(k=>new RegExp(`${k}:'`).test(tut))&&/GhostHand/.test(host)&&/Spin the reel/.test(tut)&&!/swipe/i.test(tut),'the steps: aim, watch, wait, NOW, spin, with the ghost hand (no swipe)');
 ok(/ghostButton\[data-ghost=reel\]\{[^}]*ghostSpin/.test(src('components/FishingHost.module.css')),'the reel step\'s ghost hand circles the reel');
 ok(!/setTimeout|setInterval|requestAnimationFrame/.test(tut),'the tutorial has no timers');}

// ---- 6. Catch card: NEW / RECORD stamps, football sizes (A4), rarity stars (A6) ----
{const card=e.load('lib/town/fishing/fishingCard.ts');
 const s=cm=>card.sizeCompare(cm);
 ok(s(62).unit==='boot'&&/2 football boots/.test(s(62).text),'62 cm: about 2 boots');ok(s(22).unit==='ball'&&/as wide as a football/.test(s(22).text),'22 cm: a football');
 ok(s(160).unit==='goal'&&/fifth of a goal/.test(s(160).text),'160 cm: a fifth of a goal');ok(/half a football/.test(s(10).text)&&/smaller than half/.test(s(5).text),'small catches');
 ok(FISH.every(f=>s(f.size[0]).text&&s(f.size[1]).text),'every size has words');
 // QA 16 Oct 2026: 15-16.4 cm rounded to half a ball read "about half footballs across"; one coin read "1 coins".
 ok([15,15.5,16,16.4].every(cm=>s(cm).text==='about half a football across')&&FISH.every(f=>[f.size[0],f.size[1],(f.size[0]+f.size[1])/2].every(cm=>!/half footballs/.test(s(cm).text))),'no "half footballs"');
 {const h=src('components/FishingHost.tsx');ok(/if\(e\.key==='Escape'\)\{if\(e\.type==='keydown'\)\{[^}]*back\.current\?\.click\(\)/.test(h)&&h.indexOf("if(e.key==='Escape')")<h.indexOf("closest('button:not([data-fish-reel])')"),'Escape is Back even with a HUD button focused');
  ok(/<FishingCatchToast cardUp=\{view\.phase==='caught'&&dismissed!==catchKey\}/.test(h),'the content toast shows once the catch card is dismissed');}
 ok(/coin\{fishSellValue\(fish\)===1\?'':'s'\}/.test(src('components/FishingHost.tsx')),'the catch card says "1 coin"');
 ok(new Set(Object.values(card.RARITY_STARS)).size===4&&card.rarityStarText('rare')==='★★★☆','rarity is 1-4 stars');
 const host=src('components/FishingHost.tsx');
 ok(/data-stamp="new"/.test(host)&&/data-stamp="record"/.test(host)&&/view\.caught\.isBiggest/.test(host),'NEW and RECORD stamps on the card');
 ok(/<RarityStars rarity=\{fish\.rarity\}/.test(host)&&(host.match(/<RarityStars/g)||[]).length>=2,'rarity stars on the card and in the HUD');
 ok(/sizeCompare\(view\.caught\.size\)/.test(host),'the size in football units');
 ok(/leapFlash/.test(host)&&/prefers-reduced-motion[^}]*\.leapFlash\{display:none\}/.test(src('components/FishingHost.module.css')),'the leap flash, none with reduced motion');}

// ---- 7. No per-frame React work, the arc is CSS through refs; the draw budget; heat gates ----
{const host=src('components/FishingHost.tsx'),world=src('lib/town/fishing/fishingWorld.ts'),css=src('components/FishingHost.module.css'),vis=src('lib/town/fishing/fishingVisuals.ts');
 ok(/data-fish-fight=\{fighting\?'':undefined\}/.test(host)&&/arc\.style\.setProperty\('--tension'/.test(world)&&/arc\.style\.setProperty\('--progress'/.test(world),'the world writes --tension / --progress onto the reel');
 ok(/Math\.abs\(meter\.tension-arcShown\.t\)>\.004/.test(world),'only when the value moved');
 ok(/calc\(var\(--tension,0\) \* 270deg\)/.test(css)&&/calc\(var\(--progress,0\) \* 270deg\)/.test(css),'the tension arc and the progress ring are CSS');
 ok(!/requestAnimationFrame|setInterval/.test(host),'no loops in the HUD');
 // The spin reel (15 Oct 2026): pointer maths in the handler, the crank through one CSS variable, no React state per move; the big
 // reel is centred between the Fishbook (left) and the lure (right); the session's spin fade is ticked by the world.
 ok(/const wrap=\(d:number\)=>d>Math\.PI\?d-Math\.PI\*2:d< -Math\.PI\?d\+Math\.PI\*2:d/.test(host)&&/Math\.atan2\(dy,dx\)/.test(host)&&/fishingSession\.spin\(s\.rate,now\)/.test(host),'the HUD turns wrap-safe angle deltas into a spin rate');
 ok(/crank\.current\?\.style\.setProperty\('--spin'/.test(host)&&!/setSpin|useState<.*spin/i.test(host),'the crank follows the finger through a CSS variable, no state per move');
 ok(/session\.tickSpin\(c\.now\)/.test(world),'the world fades a stopped finger\'s spin');
 ok(/--fish-reel-size:200px/.test(css)&&/--fish-reel-size:160px/.test(css)&&/\.controls\{[^}]*justify-content:space-between/.test(css),'a 200 / 160 px reel centred between the two actions');
 ok(/aria-label="Fishbook"/.test(host)&&/<FishingLureButton/.test(host)&&host.indexOf('aria-label="Fishbook"')<host.indexOf('data-fish-reel data-phase')&&host.indexOf('data-fish-reel data-phase')<host.indexOf('<FishingLureButton className'),'Fishbook left, the reel, then the lure right');
 ok(!/steer|runArrow|Swipe|ratchet/.test(host.replace(/\/\*[\s\S]*?\*\/|\/\/.*|\{\/\*[\s\S]*?\*\/\}/g,''))&&!/runArrow/.test(css),'no swipe steer or run arrow left in the HUD');
 ok(/data-key-spin/.test(host)&&/prefers-reduced-motion:reduce\)\{[^@]*\.reel\[data-key-spin\] \.crank[^{}]*\{animation:none\}/.test(css),'Space spins the crank by CSS, not with reduced motion');
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
 ok(/deck\.height=deckY\+m\.heave/.test(boat),'the deck floor (and the angler on it) rides the heave');
 const world=src('lib/town/fishing/fishingWorld.ts');ok(/liveBoat\(\)\?\.kick\(\)/.test(world)&&/liveBoat\(\)\?\.lean\(/.test(world)&&/cam\.ride\(liveBoat\(\)\?\.motion\.heave\?\?0\)/.test(world),'a cast rocks it, a run leans it, the camera rides along');}

// ---- 6. Oct 15 2026 (user): see-through reel + spin trail, the float takes the lure's colour live, the Easy reel is gone ----
{const css=src('components/FishingHost.module.css'),host=src('components/FishingHost.tsx'),world=src('lib/town/fishing/fishingWorld.ts');
 ok(/\.controls \.reel\{background:rgba\(/.test(css)&&!/backdrop-filter/.test(css),'the reel face is translucent glass (no blur over the canvas)');
 ok(/\.trail\{[^}]*--spin-rate/.test(css)&&/scaleX\(var\(--spin-dir/.test(css)&&/\.trail[^{}]*\{display:none\}/.test(css),'the trail reads --spin-rate / --spin-dir and is hidden with reduced motion');
 ok(/setProperty\('--spin-rate'/.test(host)&&/setProperty\('--spin-dir'/.test(host)&&!/setSpin|useState<.*spin/i.test(host),'the handler writes --spin-rate / --spin-dir, no React state per move');
 ok(/lureById\(c\.lure\)\?\.color/.test(host)&&/useFishingLog\(\)\.lure/.test(host)&&/lookRev/.test(world),'the float takes the lure colour and re-applies when the lure changes mid-session');
 const api=e.load('lib/town/fishing/fishingSession.ts').createFishingSession(()=>({isNew:true,isBiggest:false,inBasket:true}));const rev=api.lookRev;api.setLook({floatColor:'#f2c14e'});ok(api.lookRev===rev+1&&api.look.floatColor==='#f2c14e','setLook bumps lookRev');
 ok(!/easyReel|setEasyReel|data-fish-easy|reelTarget|PULL_HINT/.test(host+src('lib/town/fishing/fishingSession.ts')+src('lib/town/fishing/fishingStore.ts')+src('components/FishingTutorial.tsx')),'the Easy reel is gone from the host, session, store and tutorial');}
console.log(`PASS fishing fight + feel: spin-rate tension fight (never snaps, slips a notch, always lands; a run = stop spinning),  time-to-land ≥ taps, bite "!" and haptics, fins and eels, the tutorial once, stamps / football sizes / stars, CSS arc + ring with no per-frame renders, draw budget, event API, boat swell (${checks} checks)`);
