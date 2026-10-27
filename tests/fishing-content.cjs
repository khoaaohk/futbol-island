// Fishing content systems (Oct 15 2026, docs/fishing.md "Content systems", docs/fishing-research.md B3 B4 C1 C3 C5): night fish,
// islander requests, Island Legends, the four free lures, Fishbook rewards and the two boat captains. The Fishing Derby, photo mode,
// the record boards and the weather were REMOVED on 15 Oct 2026 (user: "too complicated"): this test asserts they are gone.
// Pure checks plus source scans (no browser). The coin guard-rails live in tests/economy.cjs §12.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
require('../scripts/economy-sim.cjs');// registers the .ts / '@/' require hooks
const ROOT=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
let checks=0;const ok=(c,m)=>{checks++;assert(c,m);};
const cat=require('../lib/town/fishing/fishCatalog.ts'),O=require('../lib/town/fishing/fishingOdds.ts'),N=require('../lib/town/fishing/nightFish.ts');
const TD=require('../lib/town/fishing/timeOfDay.ts'),LU=require('../lib/town/fishing/lures.ts'),L=require('../lib/town/fishing/legendary.ts');
const RQ=require('../lib/town/fishing/requests.ts');
const LOG=require('../lib/town/fishing/fishingLog.ts'),core=require('../lib/town/fishing/fishingCore.ts');
const MOOD=require('../lib/town/fishing/waterMood.ts'),S=require('../lib/saves/snapshot.ts'),CID=require('../lib/analytics/countIds.ts');
void core;
const {FISH,FISH_SPOTS,fishById}=cat;
const kidText=t=>!/%|percent|chance|odds|probab|\b1 in \d|https?:/i.test(t);

// ---- B3 night and sunset fish ----
ok(N.NIGHT_FISH.length>=3&&N.NIGHT_FISH.every(f=>FISH.includes(f)&&f.when),'night and sunset fish are Fishbook species');
for(const f of N.NIGHT_FISH){const at=O.timeSpotsFor(f.id);
 ok(at.length>0,`${f.id}: comes to at least one spot at its time`);
 ok(JSON.stringify([...at].sort())===JSON.stringify([...f.spots].sort()),`${f.id}: its spots list is exactly where it comes (the Fishbook's "Found at")`);
 ok(/^https:\/\//.test(f.club.source)&&kidText(f.club.fact)&&f.club.fact.length<=230,`${f.id}: a sourced, kid-safe fact`);
 ok(cat.FISH_SPOTS.every(s=>!(f.id in s.weights)),`${f.id}: not in a static table`);
 const day=O.catchWeights(cat.spotById(at[0]),0,{time:'day',lure:null,legends:[]});ok(!(f.id in day),`${f.id}: never by day`);
 const t=O.catchWeights(cat.spotById(at[0]),0,{time:f.when,lure:null,legends:[]});ok(t[f.id]>0,`${f.id}: comes at ${f.when}`);}
ok(O.catchWeights(FISH_SPOTS[0],0)===FISH_SPOTS[0].weights,'no context registered: fishingCore.rollCatch and every sim keep the neutral table');
{const boat=cat.spotById('deep-sea-boat');ok(O.catchWeights(boat,0,{time:'night',lure:null,legends:[]})===boat.weights,'the boats keep their own table at night');}
// a night roll through the live-roll path picks a night fish sometimes, never by day
{const s=cat.spotById('south-pier');let night=0,day=0;for(let i=0;i<4000;i++){const r=(i+.5)/4000;
  const pick=(ctx)=>{const w=Object.entries(O.catchWeights(s,0,ctx)),t=w.reduce((a,[,x])=>a+x,0);let p=r*t;for(const [id,x] of w){if(p<x)return id;p-=x;}return w[w.length-1][0];};
  if(fishById(pick({time:'night',lure:null,legends:[]})).when)night++;if(fishById(pick({time:'day',lure:null,legends:[]})).when)day++;}
 ok(night>0&&day===0,'night fish only come at night');}

// ---- Removed 15 Oct 2026 (user: "too complicated"): the derby, photo mode, the record boards, the weather and its rain ----
for(const f of ['lib/town/fishing/derby.ts','lib/town/fishing/photo.ts','lib/town/fishing/records.ts','lib/town/fishing/weather.ts','lib/town/fishing/rainStreaks.ts','components/FishingExtrasHud.tsx','components/FishingExtrasHud.module.css'])ok(!fs.existsSync(path.join(ROOT,f)),f+' is gone');
{const all=['lib/town/fishing','components','lib/saves','lib/analytics'].flatMap(d=>fs.readdirSync(path.join(ROOT,d)).filter(f=>/\.(ts|tsx|css)$/.test(f)&&f!=='legacyWords.ts').map(f=>d+'/'+f));
 for(const f of all){const src=read(f);ok(!/\bderby[A-Z_.:]|Derby|DERBY|fi2-fish-photos|fi2-fish-weather|rainStreaks|WEATHER_FAVORS|todaysWeather|isSpotRecord|REQUEST_UNLOCKS/.test(src.replace(/\/\/.*|\/\*[\s\S]*?\*\//g,'')),f+': no derby / photo / record board / weather code left (comments may say it was removed)');}}
ok(!S.DEVICE_KEYS.includes('fi2-fish-photos-v1')&&!S.DEVICE_KEYS.includes('fi2-fish-weather-v1'),'the photo and weather device keys are gone');
ok(!('weather' in O.NEUTRAL_CONTEXT)&&O.FAMILY_BOOST.weather===undefined,'the catch context has no weather');
// Old saves that still carry the removed fields are accepted and cleaned.
{const old=LOG.sanitizeLog({version:1,records:{'south-pier':[{f:'cod',s:80,t:1}]},derby:{best:9,points:40,played:3},lures:['panenka'],lure:'panenka',milestones:[25,75],legends:{},clues:['west-cove'],reqTotal:4});
 ok(!('records' in old)&&!('derby' in old)&&!('lures' in old)&&old.lure==='panenka'&&old.clues.join()==='west-cove'&&old.reqTotal===4&&old.milestones.join()==='25','an old save loads: the removed fields are dropped, the rest kept (the 75 % mark went with the lures)');}
// The day clock moved to timeOfDay.ts.
ok(TD.dayKey(Date.UTC(2026,9,15,12))==='2026-10-15'&&TD.hash01('a')!==TD.hash01('b')&&TD.hash01('x')>=0&&TD.hash01('x')<1&&['day','sunset','night'].includes(TD.readTimeOfDay()),'dayKey, hash01 and readTimeOfDay live in timeOfDay.ts');
// The night water mood stays (time of day only).
{const m=MOOD.moodParams('night'),d=MOOD.moodParams('day');ok(m.shallow.every((v,i)=>v<d.shallow[i])&&m.clear<d.clear&&m.floatGlow>0,'night water is darker and murkier, the float glows');
 const v=(x,y,z)=>({x,y,z,set(a,b,c){this.x=a;this.y=b;this.z=c;}}),u={uUwShallow:{value:v(.1,.4,.6)},uUwDeep:{value:v(0,.2,.3)},uUwClear:{value:1}};
 MOOD.applyWaterMood(u,'day');ok(u.uUwShallow.value.y===.4&&u.uUwClear.value===1,'daytime leaves the reef theme untouched');
 ok(/applyReefWater\(theme\);applyLiveWaterMood\(UW_UNIFORMS\)/.test(read('lib/town/fishing/fishingVisuals.ts')),'the water mood is applied once per session, right after the reef theme (uniforms only)');}

// ---- C3 lures: four, free from the start, choosable any time ----
ok(LU.LURES.length===4&&LU.LURES.every(l=>/^https:\/\//.test(l.source)&&kidText(l.fact)&&kidText(l.effect)),'four football lures with sourced facts');
for(const l of LU.LURES)ok(FISH_SPOTS.some(s=>{const a=s.weights,b=O.catchWeights(s,0,{time:'day',lure:l.id,legends:[]});return Object.keys(a).some(id=>Math.abs((b[id]??0)-a[id])>1e-9);}),`${l.id}: changes the mix somewhere`);
{const fresh=LOG.emptyLog();ok(!('lures' in fresh)&&fresh.lure===null,'no earned-lure list: every lure is available');
 for(const l of LU.LURES)ok(LOG.sanitizeLog({lure:l.id}).lure===l.id,`${l.id}: a new player can put it on`);ok(LOG.sanitizeLog({lure:'magic'}).lure===null,'an unknown lure is dropped');
 ok(!Object.values(LOG.MILESTONE_REWARDS).some(r=>'lure' in r)&&typeof LOG.REQUEST_UNLOCKS==='undefined','lures are no longer rewards (milestones give floats and the Golden Rod; requests pay coins and clues)');
 const store=read('lib/town/fishing/fishingLogStore.ts');ok(/export function chooseLure\(id:LureId\|null\)\{const next=id&&isLureId\(id\)\?id:null;update\(l=>\(\{\.\.\.l,lure:next\}\)\);/.test(store),'chooseLure takes any lure id, no ownership check');
 const hud=read('components/FishingLureButton.tsx');ok(!/disabled=/.test(hud)&&(hud.match(/data-lure=/g)||[]).length>=2&&/Real football fact/.test(hud)&&/l\.fact/.test(hud),'the lure panel: every lure is a live choice with its real football fact');
 ok(/for your next cast/.test(hud),'the note says the lure works from the next cast');}

// ---- C1 legends ----
ok(L.LEGEND_FISH.length===18&&new Set(L.LEGEND_FISH.map(f=>f.spots[0])).size===FISH_SPOTS.length,'one legend at each of the 18 spots');
for(const f of L.LEGEND_FISH){const info=L.LEGEND_INFO[f.id];
 ok(fishById(f.id)===f&&!FISH.includes(f)&&f.rarity==='legendary'&&f.shadow==='giant','legend '+f.id+': fought like a giant, not a Fishbook species');
 ok(L.fightProfileFor(f.id)==='legend'&&L.fightProfileFor('sardine')===undefined,'legend fight profile id for Agent A');
 ok(/^https:\/\//.test(f.club.source)&&kidText(f.club.fact)&&f.club.fact.length<=200&&kidText(info.story)&&kidText(info.clue),f.id+': sourced fact, kid-safe story and clue');}
ok(new Set(L.LEGEND_FISH.map(f=>f.name)).size===18,'every legend has its own name');

// ---- B4 requests ----
for(const day of ['2026-10-15','2026-10-16','2026-12-25']){const q=RQ.requestsForDay(day);
 ok(q.length===3&&new Set(q.map(x=>x.kind)).size===3&&new Set(q.map(x=>x.who)).size===3,day+': three different requests from three islanders');
 ok(JSON.stringify(q)===JSON.stringify(RQ.requestsForDay(day)),day+': the same on every device');
 for(const r of q){ok(kidText(r.text)&&kidText(r.thanks)&&kidText(RQ.requestHint(r)),'request text is kid-safe: '+r.text);ok(cat.spotById(r.clueSpot)&&L.legendForSpot(r.clueSpot),'each request points to a legend clue');
  if(r.kind==='species')ok(fishById(r.target)&&!fishById(r.target).when,'asks for a daytime fish');}}

// ---- the log: catches → clues, legends, requests, rewards ----
{const day='2026-10-15',reqs=RQ.requestsForDay(day);let log=LOG.emptyLog(),t=1;
 const land=(id,spot,size=30)=>{const r=LOG.logCatch(log,{id,size,spot,now:t++,day,speciesCaught:0});log=r.log;return r.effects;};
 ok(!('rank' in land('sardine','west-cove')),'a catch has no record rank any more');land('mackerel','west-cove');const e=land('sea-bass','west-cove');
 ok(e.newClues.includes('west-cove')&&LOG.legendsDue(log).includes('west-cove'),'3 different kinds at a spot reveal its legend');
 const lid=L.legendId('west-cove'),le=land(lid,'west-cove',300);ok(le.legend&&log.legends[lid]&&!LOG.legendsDue(log).includes('west-cove'),'a legend is caught once and released: it never comes back');
 ok(!(lid in O.catchWeights(cat.spotById('west-cove'),0,{time:'day',lure:null,legends:LOG.legendsDue(log)})),'no legend in the water after its release');
 // finish a species request
 const sp=reqs.find(r=>r.kind==='species');if(sp){const before=log.reqTotal,r=land(sp.target,fishById(sp.target).spots.find(id=>cat.spotById(id)&&!cat.spotById(id).deep));
  ok(r.requestsDone.some(q=>q.id===sp.id)&&log.reqTotal===before+1,'a species request finishes on the right catch');ok(r.unlocked.length===0,'a request unlocks nothing (it pays coins and a clue)');
  const again=land(sp.target,'west-cove');ok(!again.requestsDone.some(q=>q.id===sp.id),'a request pays once');}
 // milestones
 ok(LOG.MILESTONES.join()==='25,50,100'&&LOG.MILESTONE_REWARDS[25].float==='football'&&LOG.MILESTONE_REWARDS[50].float==='seagull'&&LOG.MILESTONE_REWARDS[100].rod&&LOG.MILESTONE_REWARDS[100].float==='golden','milestones: a quarter → football float, half → seagull float, all → Golden Rod + golden float');
 const q=LOG.claimMilestones(log,Math.ceil(FISH.length/4));ok(q.log.floats.includes('football')&&!q.log.floats.includes('seagull'),'a quarter of the Fishbook: the football float');
 const m=LOG.claimMilestones(q.log,Math.ceil(FISH.length/2));ok(m.log.floats.includes('seagull')&&!m.log.goldenRod,'half the Fishbook: the seagull float');
 const all=LOG.claimMilestones(m.log,FISH.length);ok(all.log.goldenRod&&all.log.rod==='golden'&&all.log.floats.includes('golden'),'the whole Fishbook: the Golden Rod');
 ok(LOG.claimMilestones(all.log,FISH.length).unlocked.length===0,'milestones are claimed once');
 ok(Object.values(LOG.MILESTONE_WORD).every(kidText),'milestones read as words, never percentages');
 // sanitize / merge / size
 const back=LOG.sanitizeLog(JSON.parse(JSON.stringify(all.log)));ok(JSON.stringify(back)===JSON.stringify(LOG.sanitizeLog(back)),'sanitize is stable');
 ok(back.goldenRod&&back.legends[lid]&&back.kinds['west-cove'].length>0,'the save round-trips');
 const junk=LOG.sanitizeLog({records:{'nowhere':[{f:'x',s:1}]},legends:{'legend-nowhere':1,sardine:2},lure:'magic',goldenRod:'yes',floats:['golden','x'],float:'golden'});
 ok(!('records' in junk)&&!Object.keys(junk.legends).length&&junk.lure===null&&!junk.goldenRod&&junk.floats.join()==='classic,golden'&&junk.float==='golden','bad saves are cleaned');
 const merged=LOG.mergeLogs(back,LOG.emptyLog());ok(merged.goldenRod&&merged.legends[lid]&&merged.reqTotal===back.reqTotal,'merging never loses anything');
 // a busy player's full log stays small
 let big=LOG.emptyLog();for(const s of FISH_SPOTS){for(const f of FISH.filter(x=>x.spots.includes(s.id)).slice(0,12)){big=LOG.logCatch(big,{id:f.id,size:f.size[1],spot:s.id,now:Date.now(),day,speciesCaught:FISH.length}).log;}big.legends[L.legendId(s.id)]=Date.now();}
 const bytes=JSON.stringify(big).length;ok(bytes<8*1024,'a full fishing log stays small ('+bytes+' bytes)');}

// ---- saves and analytics ----
ok(S.SYNC_KEYS.includes(LOG.FISHING_LOG_KEY),'the fishing log is synced progress');
for(const id of ['legend','clue','request','lure_panenka','lure_none','hook_spin','land','escape','miss','book'])ok(CID.isCountId('fi:'+id)&&CID.FIXED_COUNT_IDS.includes('fi:'+id),'count id fi:'+id);
for(const id of ['record','derby_start','derby_done','photo','lure'])ok(!CID.isCountId('fi:'+id),'count id fi:'+id+' is gone');
{const src=read('lib/town/fishing/fishingLogStore.ts')+read('components/FishingLureButton.tsx');for(const m of src.matchAll(/count\('([^']+)'/g))ok(CID.isCountId(m[1]),'registered count id '+m[1]);}

// ---- the boat captains ----
{const npcs=require('../lib/town/npcDialogues.ts').NPC_DIALOGUES,B=require('../lib/town/fishing/deepSeaBoatData.ts'),C=require('../lib/town/fishing/boatCaptains.ts');
 ok(C.BOAT_CAPTAINS.length===2&&C.BOAT_CAPTAINS.every(c=>npcs.includes(c)),'a captain on each boat, in the shared townsfolk list');
 ok(new Set(C.BOAT_CAPTAINS.map(c=>c.name)).size===2,'two different characters');
 C.BOAT_CAPTAINS.forEach((c,i)=>{const b=B.DEEP_SEA_BOATS[i],p=b.toLocal(c.x,c.z),dk=b.deck,stand=b.stand,local={x:p.x-b.standLocal.x,z:p.z};
  ok(Math.abs(local.x)<=dk.w/2-.3&&Math.abs(local.z)<=dk.d/2-.3,c.name+': stands on the open aft deck');
  ok(Math.hypot(c.x-stand.x,c.z-stand.z)>=2.2,c.name+': clear of the fishing stand (Fish wins the prompt there)');
  ok(p.z<0,c.name+': on the port side, away from the starboard cast, the camera and the float');
  ok(p.x>b.hull.x0+2.5,c.name+': away from the stern foam');
  ok(typeof c.floor==='function'&&Math.abs(c.floor()-b.deckY)<1e-9,c.name+': stands on the deck floor');
  ok(c.lines.length>=8&&c.lines.length<=12&&c.lines.every(l=>kidText(l)&&l.length<=220),c.name+': 8–12 short fish-and-football lines');
  ok(/deep/i.test(c.greeting)&&/hotspot|gulls|bait ball/i.test(c.greeting+c.topics.map(t=>t.answer).join(' ')),c.name+': the first chat explains the boat');
  ok(c.topics.some(t=>/Spin the reel/.test(t.followUp.answer)&&!/Easy reel/.test(t.followUp.answer)),c.name+': explains the spin fight');
  ok(c.topics.some(t=>/legend/i.test(t.question)&&t.answer.length>20),c.name+': tells of the boat\'s legend');});
 const src=read('lib/town/fishing/boatCaptains.ts');ok((src.match(/https:\/\//g)||[]).length>=15,'captain facts carry their sources in the code');
 const npcRt=read('lib/graphics/islandNpcs.ts');ok(/!definition\.floor\)for/.test(npcRt)&&/definition\.floor\?\.\(\)/.test(npcRt)&&/for\(const e of floored\)/.test(npcRt),'floor townsfolk idle in place and ride the deck height');}

// ---- kid-safe UI ----
for(const f of ['components/FishingLureButton.tsx','components/FishbookExtras.tsx']){const src=read(f);
 ok(!/<a\b|href=/.test(src),f+': no links');ok(!/\*\s*100|percent|%\s*[<'"`]|\bodds\b|RARITY_WEIGHT|\.weights\b/.test(src),f+': no odds, weights or percentages');}
ok(/data-shape-word/.test(read('components/Fishbook.tsx'))&&/shadowShapeWord/.test(read('components/Fishbook.tsx')),'the Fishbook shows the shape word');
ok(/<FishingLureButton className=\{styles\.action\}\/>/.test(read('components/FishingHost.tsx'))&&/<FishingCatchToast cardUp=/.test(read('components/FishingHost.tsx')),'the lure button and the catch toast are in the fishing HUD');
{const fb=read('components/FishbookExtras.tsx').replace(/\/\*[\s\S]*?\*\/|\/\/.*/g,'');ok(/\[\['fish','Fish'\],\['trophies','Trophies'\],\['requests','Requests'\]\]/.test(fb)&&!/RecordsPage|PhotosPage|weather|derby/i.test(fb),'Fishbook pages: Fish, Trophies, Requests');}
// Heat: nothing at rest. No intervals anywhere in the fishing content UI; the only timer is the toast's one timeout.
{const hud=read('components/FishingLureButton.tsx');ok(!/setInterval|requestAnimationFrame/.test(hud)&&(hud.match(/setTimeout/g)||[]).length===1,'no loops in the lure HUD; one toast timeout');}
console.log(`PASS fishing content: night & sunset fish (time-only water mood), 4 free lures, 18 legends, daily requests, Fishbook rewards (floats + Golden Rod), two boat captains; derby / photos / record boards / weather removed (${checks} checks)`);
