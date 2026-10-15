// Fishing content systems (Oct 15 2026, docs/fishing.md "Content systems", docs/fishing-research.md B3 B4 B5 C1–C6): night fish,
// islander requests, record boards, Island Legends, the Fishing Derby, lures, weather, Fishbook rewards, photo mode and the two
// boat captains. Pure checks plus source scans (no browser). The coin guard-rails live in tests/economy.cjs §12.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
require('../scripts/economy-sim.cjs');// registers the .ts / '@/' require hooks
const ROOT=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
let checks=0;const ok=(c,m)=>{checks++;assert(c,m);};
const cat=require('../lib/town/fishing/fishCatalog.ts'),O=require('../lib/town/fishing/fishingOdds.ts'),N=require('../lib/town/fishing/nightFish.ts');
const W=require('../lib/town/fishing/weather.ts'),LU=require('../lib/town/fishing/lures.ts'),L=require('../lib/town/fishing/legendary.ts');
const REC=require('../lib/town/fishing/records.ts'),RQ=require('../lib/town/fishing/requests.ts'),D=require('../lib/town/fishing/derby.ts');
const LOG=require('../lib/town/fishing/fishingLog.ts'),core=require('../lib/town/fishing/fishingCore.ts'),RAIN=require('../lib/town/fishing/rainStreaks.ts');
const MOOD=require('../lib/town/fishing/waterMood.ts'),S=require('../lib/saves/snapshot.ts'),CID=require('../lib/analytics/countIds.ts');
const {FISH,FISH_SPOTS,fishById}=cat;
const kidText=t=>!/%|percent|chance|odds|probab|\b1 in \d|https?:/i.test(t);

// ---- B3 night and sunset fish ----
ok(N.NIGHT_FISH.length>=3&&N.NIGHT_FISH.every(f=>FISH.includes(f)&&f.when),'night and sunset fish are Fishbook species');
for(const f of N.NIGHT_FISH){const at=O.timeSpotsFor(f.id);
 ok(at.length>0,`${f.id}: comes to at least one spot at its time`);
 ok(JSON.stringify([...at].sort())===JSON.stringify([...f.spots].sort()),`${f.id}: its spots list is exactly where it comes (the Fishbook's "Found at")`);
 ok(/^https:\/\//.test(f.club.source)&&kidText(f.club.fact)&&f.club.fact.length<=230,`${f.id}: a sourced, kid-safe fact`);
 ok(cat.FISH_SPOTS.every(s=>!(f.id in s.weights)),`${f.id}: not in a static table`);
 const day=O.catchWeights(cat.spotById(at[0]),0,{time:'day',weather:'clear',lure:null,legends:[]});ok(!(f.id in day),`${f.id}: never by day`);
 const t=O.catchWeights(cat.spotById(at[0]),0,{time:f.when,weather:'clear',lure:null,legends:[]});ok(t[f.id]>0,`${f.id}: comes at ${f.when}`);}
ok(O.catchWeights(FISH_SPOTS[0],0)===FISH_SPOTS[0].weights,'no context registered: fishingCore.rollCatch and every sim keep the neutral table');
{const boat=cat.spotById('deep-sea-boat');ok(O.catchWeights(boat,0,{time:'night',weather:'clear',lure:null,legends:[]})===boat.weights,'the boats keep their own table at night');}
// a night roll through the live-roll path picks a night fish sometimes, never by day
{const s=cat.spotById('south-pier');let night=0,day=0;for(let i=0;i<4000;i++){const r=(i+.5)/4000;
  const pick=(ctx)=>{const w=Object.entries(O.catchWeights(s,0,ctx)),t=w.reduce((a,[,x])=>a+x,0);let p=r*t;for(const [id,x] of w){if(p<x)return id;p-=x;}return w[w.length-1][0];};
  if(fishById(pick({time:'night',weather:'clear',lure:null,legends:[]})).when)night++;if(fishById(pick({time:'day',weather:'clear',lure:null,legends:[]})).when)day++;}
 ok(night>0&&day===0,'night fish only come at night');}

// ---- C4 weather ----
ok(W.weatherForDay('2026-10-15')===W.weatherForDay('2026-10-15'),'the same weather all day');
{const n={clear:0,breezy:0,overcast:0,rain:0};for(let d=0;d<365;d++){const k=W.dayKey(Date.UTC(2026,0,1)+d*864e5+12*36e5);n[W.weatherForDay(k)]++;}
 ok(n.clear>100&&n.rain>20&&n.rain<90&&n.breezy>50&&n.overcast>40,'a year has every weather, mostly clear, light rain least ('+JSON.stringify(n)+')');}
ok(Object.values(W.WEATHER_HINT).concat(Object.values(W.WEATHER_LABEL)).every(kidText),'weather words are hints, never odds');
ok(RAIN.rainVisible({fishing:true,weather:'rain',tier:0,reduced:false,waterDetail:2}),'rain streaks while fishing in the rain on a cool device');
for(const o of [{fishing:false},{weather:'overcast'},{tier:2},{tier:3},{reduced:true},{waterDetail:0}])ok(!RAIN.rainVisible({fishing:true,weather:'rain',tier:0,reduced:false,waterDetail:2,...o}),'no rain streaks: '+JSON.stringify(o));
{const src=read('lib/town/fishing/rainStreaks.ts');ok(/InstancedMesh\(geo,material,RAIN_COUNT\)/.test(src)&&RAIN.RAIN_COUNT<=64,'rain: one instanced draw of a few streaks');
 ok(!/setMatrixAt|for\(let i=0;i<RAIN_COUNT;i\+\+\)\{[^}]*update/.test(src),'rain: no per-streak CPU work per frame (the shader animates the fall)');
 const world=read('lib/town/fishing/fishingWorld.ts');ok(/if\(fishing\|\|rain\.drawing\)rain\.update/.test(world),'rain: nothing runs when not fishing');}
{const m=MOOD.moodParams('night','rain'),d=MOOD.moodParams('day','clear');ok(m.shallow.every((v,i)=>v<d.shallow[i])&&m.clear<d.clear&&m.floatGlow>0,'night rain water is darker and murkier, the float glows');
 const v=(x,y,z)=>({x,y,z,set(a,b,c){this.x=a;this.y=b;this.z=c;}}),u={uUwShallow:{value:v(.1,.4,.6)},uUwDeep:{value:v(0,.2,.3)},uUwClear:{value:1}};
 MOOD.applyWaterMood(u,'day','clear');ok(u.uUwShallow.value.y===.4&&u.uUwClear.value===1,'a clear day leaves the reef theme untouched');
 ok(/applyReefWater\(theme\);applyLiveWaterMood\(UW_UNIFORMS\)/.test(read('lib/town/fishing/fishingVisuals.ts')),'the water mood is applied once per session, right after the reef theme (uniforms only)');}

// ---- C3 lures ----
ok(LU.LURES.length===4&&LU.LURES.every(l=>/^https:\/\//.test(l.source)&&kidText(l.fact)&&kidText(l.effect)),'four football lures with sourced facts');
for(const l of LU.LURES)ok(FISH_SPOTS.some(s=>{const a=s.weights,b=O.catchWeights(s,0,{time:'day',weather:'clear',lure:l.id,legends:[]});return Object.keys(a).some(id=>Math.abs((b[id]??0)-a[id])>1e-9);}),`${l.id}: changes the mix somewhere`);

// ---- C1 legends ----
ok(L.LEGEND_FISH.length===18&&new Set(L.LEGEND_FISH.map(f=>f.spots[0])).size===FISH_SPOTS.length,'one legend at each of the 18 spots');
for(const f of L.LEGEND_FISH){const info=L.LEGEND_INFO[f.id];
 ok(fishById(f.id)===f&&!FISH.includes(f)&&f.rarity==='legendary'&&f.shadow==='giant','legend '+f.id+': fought like a giant, not a Fishbook species');
 ok(L.fightProfileFor(f.id)==='legend'&&L.fightProfileFor('sardine')===undefined,'legend fight profile id for Agent A');
 ok(/^https:\/\//.test(f.club.source)&&kidText(f.club.fact)&&f.club.fact.length<=200&&kidText(info.story)&&kidText(info.clue),f.id+': sourced fact, kid-safe story and clue');}
ok(new Set(L.LEGEND_FISH.map(f=>f.name)).size===18,'every legend has its own name');

// ---- B5 records ----
{let b={};for(const [f,s] of [['sardine',20],['cod',80],['mackerel',30],['tuna',150],['shrimp',6]]){b=REC.addRecord(b,'south-pier',{f,s,t:1}).board;}
 ok(b['south-pier'].length===3&&b['south-pier'][0].s===150&&b['south-pier'][2].s===30,'the 3 biggest per spot');
 ok(REC.wouldSetRecord(b,'south-pier',151)&&!REC.wouldSetRecord(b,'south-pier',150)&&REC.wouldSetRecord(b,'west-cove',1),'RECORD stamp API');
 ok(REC.recordRank(b,'south-pier',10)===0,'a small catch does not make the board');
 const m=REC.mergeRecords(b,{'south-pier':[{f:'octopus',s:99,t:2}]});ok(m['south-pier'].map(e=>e.s).join()==='150,99,80','tabs merge to the top 3');}

// ---- B4 requests ----
for(const day of ['2026-10-15','2026-10-16','2026-12-25']){const q=RQ.requestsForDay(day);
 ok(q.length===3&&new Set(q.map(x=>x.kind)).size===3&&new Set(q.map(x=>x.who)).size===3,day+': three different requests from three islanders');
 ok(JSON.stringify(q)===JSON.stringify(RQ.requestsForDay(day)),day+': the same on every device');
 for(const r of q){ok(kidText(r.text)&&kidText(r.thanks)&&kidText(RQ.requestHint(r)),'request text is kid-safe: '+r.text);ok(cat.spotById(r.clueSpot)&&L.legendForSpot(r.clueSpot),'each request points to a legend clue');
  if(r.kind==='species')ok(fishById(r.target)&&!fishById(r.target).when,'asks for a daytime fish');}}

// ---- the log: catches → records, clues, legends, requests, unlocks ----
{const day='2026-10-15',reqs=RQ.requestsForDay(day);let log=LOG.emptyLog(),t=1;
 const land=(id,spot,size=30)=>{const r=LOG.logCatch(log,{id,size,spot,now:t++,day,speciesCaught:0});log=r.log;return r.effects;};
 ok(land('sardine','west-cove').rank===1,'the first catch at a spot is its record');land('mackerel','west-cove');const e=land('sea-bass','west-cove');
 ok(e.newClues.includes('west-cove')&&LOG.legendsDue(log).includes('west-cove'),'3 different kinds at a spot reveal its legend');
 const lid=L.legendId('west-cove'),le=land(lid,'west-cove',300);ok(le.legend&&log.legends[lid]&&!LOG.legendsDue(log).includes('west-cove'),'a legend is caught once and released: it never comes back');
 ok(!(lid in O.catchWeights(cat.spotById('west-cove'),0,{time:'day',weather:'clear',lure:null,legends:LOG.legendsDue(log)})),'no legend in the water after its release');
 ok(!log.records['west-cove'].some(r=>r.f===lid),'a legend is not a record-board catch (released)');
 // finish a species request
 const sp=reqs.find(r=>r.kind==='species');if(sp){const before=log.reqTotal,r=land(sp.target,fishById(sp.target).spots.find(id=>cat.spotById(id)&&!cat.spotById(id).deep));
  ok(r.requestsDone.some(q=>q.id===sp.id)&&log.reqTotal===before+1,'a species request finishes on the right catch');ok(log.lures.includes('panenka'),'the first request earns the Panenka lure');
  const again=land(sp.target,'west-cove');ok(!again.requestsDone.some(q=>q.id===sp.id),'a request pays once');}
 // milestones
 const m=LOG.claimMilestones(log,Math.ceil(FISH.length/2));ok(m.log.lures.includes('nutmeg')&&m.log.lures.includes('rabona')&&!m.log.goldenRod,'half the Fishbook: the Nutmeg and Rabona lures');
 const all=LOG.claimMilestones(m.log,FISH.length);ok(all.log.goldenRod&&all.log.rod==='golden'&&all.log.floats.includes('golden')&&all.log.lures.includes('knuckleball'),'the whole Fishbook: the Golden Rod');
 ok(LOG.claimMilestones(all.log,FISH.length).unlocked.length===0,'milestones are claimed once');
 ok(Object.values(LOG.MILESTONE_WORD).every(kidText),'milestones read as words, never percentages');
 // sanitize / merge / size
 const back=LOG.sanitizeLog(JSON.parse(JSON.stringify(all.log)));ok(JSON.stringify(back)===JSON.stringify(LOG.sanitizeLog(back)),'sanitize is stable');
 ok(back.goldenRod&&back.legends[lid]&&back.records['west-cove'].length>0,'the save round-trips');
 const junk=LOG.sanitizeLog({records:{'nowhere':[{f:'x',s:1}]},legends:{'legend-nowhere':1,sardine:2},lures:['magic','panenka'],lure:'magic',goldenRod:'yes',derby:{best:-5,points:'x'}});
 ok(!junk.records.nowhere&&!Object.keys(junk.legends).length&&junk.lures.join()==='panenka'&&junk.lure===null&&!junk.goldenRod&&junk.derby.best===0,'bad saves are cleaned');
 const merged=LOG.mergeLogs(back,LOG.emptyLog());ok(merged.goldenRod&&merged.legends[lid]&&merged.reqTotal===back.reqTotal,'merging never loses anything');
 // a busy player's full log stays small
 let big=LOG.emptyLog();for(const s of FISH_SPOTS){for(const f of FISH.filter(x=>x.spots.includes(s.id)).slice(0,12)){big=LOG.logCatch(big,{id:f.id,size:f.size[1],spot:s.id,now:Date.now(),day,speciesCaught:FISH.length}).log;}big.legends[L.legendId(s.id)]=Date.now();}
 const bytes=JSON.stringify(big).length;ok(bytes<12*1024,'a full fishing log stays small ('+bytes+' bytes)');}

// ---- C2 derby ----
{let r=D.startDerby(0);for(const id of ['sardine','sardine','cod','mackerel'])r=D.derbyCatch(r,id);
 ok(r.score===4+3&&r.catches===4,'1 a catch + 1 for each new kind');for(let i=0;i<100;i++)r=D.derbyTick(r,1);ok(!r.done&&D.derbyLeft(r)===80,'the clock');
 r=D.derbyTick(r,200);ok(!r.done&&D.derbyLeft(r)===75,'a long gap (a sleeping tab) counts at most 5 s');for(let i=0;i<20;i++)r=D.derbyTick(r,5);ok(r.done&&D.derbyCatch(r,'tuna').score===r.score,'full time: no more points');
 ok(D.clockText(155)==='2:35'&&D.rivalScore('2026-10-15')>=6&&D.rivalScore('2026-10-15')<=11,'match clock and Tomás');
 ok(D.derbyTrophies(60).map(t=>t.id).join()==='bronze,silver','derby cups by total points');}

// ---- C6 photos (device only) ----
{const P=require('../lib/town/fishing/photo.ts'),img='data:image/jpeg;base64,'+'A'.repeat(70*1024);
 const list=Array.from({length:9},(_,i)=>({id:'p'+i,at:i,caption:'Cod',img}));const t=P.trimPhotos(list);
 ok(t.length<=P.PHOTO_MAX&&JSON.stringify(t).length<=P.PHOTO_BUDGET&&t[0].at===8,'photos: newest first, capped by count and bytes');
 ok(P.sanitizePhotos([{id:'x',at:1,img:'javascript:alert(1)'},{id:'y',at:2,img:'data:image/png;base64,AA',caption:'ok'}]).length===1,'only image data URLs');
 ok(S.DEVICE_KEYS.includes(P.PHOTO_KEY)&&!S.isSyncKey(P.PHOTO_KEY),'photos are a DEVICE key: never synced');}

// ---- saves and analytics ----
ok(S.SYNC_KEYS.includes(LOG.FISHING_LOG_KEY),'the fishing log is synced progress');
ok(S.DEVICE_KEYS.includes(W.WEATHER_PREF_KEY),'the weather switch is a device preference');
for(const id of ['legend','record','clue','request','derby_start','derby_done','lure','photo'])ok(CID.isCountId('fi:'+id)&&CID.FIXED_COUNT_IDS.includes('fi:'+id),'count id fi:'+id);
{const src=read('lib/town/fishing/fishingLogStore.ts')+read('components/FishingExtrasHud.tsx');for(const m of src.matchAll(/count\('([^']+)'/g))ok(CID.isCountId(m[1]),'registered count id '+m[1]);}

// ---- the boat captains ----
{const npcs=require('../lib/town/npcDialogues.ts').NPC_DIALOGUES,B=require('../lib/town/fishing/deepSeaBoatData.ts'),C=require('../lib/town/fishing/boatCaptains.ts');
 ok(C.BOAT_CAPTAINS.length===2&&C.BOAT_CAPTAINS.every(c=>npcs.includes(c)),'a captain on each boat, in the shared townsfolk list');
 ok(new Set(C.BOAT_CAPTAINS.map(c=>c.name)).size===2,'two different characters');
 C.BOAT_CAPTAINS.forEach((c,i)=>{const b=B.DEEP_SEA_BOATS[i],p=b.toLocal(c.x,c.z),dk=b.deck,stand=b.stand,local={x:p.x+2.4,z:p.z};
  ok(Math.abs(local.x)<=dk.w/2-.3&&Math.abs(local.z)<=dk.d/2-.3,c.name+': stands on the open aft deck');
  ok(Math.hypot(c.x-stand.x,c.z-stand.z)>=2.2,c.name+': clear of the fishing stand (Fish wins the prompt there)');
  ok(p.z<0,c.name+': on the port side, away from the starboard cast, the camera and the float');
  ok(p.x>B.BOAT_HULL.x0+2.5,c.name+': away from the stern foam');
  ok(typeof c.floor==='function'&&Math.abs(c.floor()-B.BOAT_DECK_Y)<1e-9,c.name+': stands on the deck floor');
  ok(c.lines.length>=8&&c.lines.length<=12&&c.lines.every(l=>kidText(l)&&l.length<=220),c.name+': 8–12 short fish-and-football lines');
  ok(/deep/i.test(c.greeting)&&/hotspot|gulls|bait ball/i.test(c.greeting+c.topics.map(t=>t.answer).join(' ')),c.name+': the first chat explains the boat');
  ok(c.topics.some(t=>/Reel/.test(t.followUp.answer)&&/Easy reel/.test(t.followUp.answer)),c.name+': explains the fight and Easy reel');
  ok(c.topics.some(t=>/legend/i.test(t.question)&&t.answer.length>20),c.name+': tells of the boat\'s legend');});
 const src=read('lib/town/fishing/boatCaptains.ts');ok((src.match(/https:\/\//g)||[]).length>=15,'captain facts carry their sources in the code');
 const npcRt=read('lib/graphics/islandNpcs.ts');ok(/!definition\.floor\)for/.test(npcRt)&&/definition\.floor\?\.\(\)/.test(npcRt)&&/for\(const e of floored\)/.test(npcRt),'floor townsfolk idle in place and ride the deck height');}

// ---- kid-safe UI ----
for(const f of ['components/FishingExtrasHud.tsx','components/FishbookExtras.tsx']){const src=read(f);
 ok(!/<a\b|href=/.test(src),f+': no links');ok(!/\*\s*100|percent|%\s*[<'"`]|\bodds\b|RARITY_WEIGHT|\.weights\b/.test(src),f+': no odds, weights or percentages');}
ok(/data-shape-word/.test(read('components/Fishbook.tsx'))&&/shadowShapeWord/.test(read('components/Fishbook.tsx')),'the Fishbook shows the shape word');
ok(/FishingExtrasHud/.test(read('components/FishingHost.tsx')),'the content HUD is hooked into the fishing HUD');
// Heat: nothing at rest. The HUD only renders while fishing; its one interval runs only during a derby.
{const hud=read('components/FishingExtrasHud.tsx');ok((hud.match(/setInterval/g)||[]).length===1&&/if\(!run\|\|run\.done\|\|!view\.active\)return;/.test(hud),'one 1 s timer, only while a derby runs');
 ok(/if\(!view\.active\)return null;/.test(hud),'nothing renders when not fishing');}
console.log(`PASS fishing content: night & sunset fish, weather (cheap rain gate, uniform-only water mood), 4 lures, 18 legends, record boards, daily requests, derby, Fishbook rewards, device-only photos, two boat captains (${checks} checks)`);
