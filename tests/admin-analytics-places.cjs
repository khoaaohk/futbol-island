#!/usr/bin/env node
// Admin analytics, "Where on the island" (Oct 8 2026): the place lookup on known coordinates, the grid and its caps, the
// tracker's activity/place/cell accounting (idle excluded, menus excluded, no new timers or loops), ingest validation and
// clamping, payload size, region names and the per-country breakdown, the report merge, and the SQL (the live migration +
// 20261008_analytics_places.sql on a throwaway Postgres) matching the TypeScript reference. Nothing stores a route.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),os=require('os'),cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const loaded=new Map();
function resolve(from,id){
 const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);
 for(const f of [base,base+'.ts',base+'.tsx'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;
 throw Error('cannot resolve '+id+' from '+from);
}
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);
 if(file.endsWith('.json')){const v={default:JSON.parse(fs.readFileSync(file,'utf8'))};loaded.set(file,v);return v;}
 const m={exports:{}};loaded.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Buffer,URL,URLSearchParams,TextDecoder,Date,Math,JSON,process:{env:{}},console,
   require:id=>id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id)});
 loaded.set(file,m.exports);return m.exports;}
const IDS=load('lib/analytics/islandIds.ts'),P=load('lib/analytics/islandPlaces.ts'),C=load('lib/analytics/core.ts'),S=load('lib/analytics/store.ts'),
 I=load('lib/analytics/ingest.ts'),R=load('lib/analytics/report.ts'),T=load('lib/analytics/tracker.ts'),G=load('lib/analytics/regions.ts');
const CC=load('lib/town/coralCay.ts'),SIM=load('lib/town/simulation.ts'),MUS=load('lib/museum/museumDoors.ts');
const read=f=>fs.readFileSync(f,'utf8');
const J=x=>JSON.parse(JSON.stringify(x));
let passed=0;const skipped=[];const ok=(name,fn)=>Promise.resolve().then(fn).then(r=>{if(r==='skip')skipped.push(name);else passed++;},e=>{console.error('FAIL',name);throw e;});
const sum=o=>Object.values(o||{}).reduce((a,b)=>a+b,0);
/** The safety ping may split a scenario over several beats: add them up (that is what the server does too). */
function merged(sent){const out={e:0,ac:{},pl:{},c:{}};for(const b of sent.filter(s=>s.t==='beat')){out.e+=b.e;for(const k of ['ac','pl','c'])for(const [id,v] of Object.entries(b[k]||{}))out[k][id]=(out[k][id]||0)+v;}return out;}

const SID='PlaceSessionPlace0001';
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1';
function headers(extra={}){const h={host:'futbolisland.app','user-agent':UA,'x-forwarded-for':'203.0.113.9','x-vercel-ip-country':'US','x-vercel-ip-country-region':'CA',origin:'https://futbolisland.app',...extra};
 const m=new Map(Object.entries(h));return {get:k=>m.has(k.toLowerCase())?m.get(k.toLowerCase()):null};}
const T0=new Date('2026-10-08T10:00:00Z'),at=ms=>new Date(T0.getTime()+ms);
const ingest=(store,body,{now=T0}={})=>I.handleIngest({body:typeof body==='string'?body:JSON.stringify(body),headers:headers(),store,limiter:I.createLimiter({capacity:1e6}),now,vercelEnv:'production'});

// The same fake browser as tests/admin-analytics.cjs: manual clock, timers and events.
function env({pathname='/'}={}){
 const listeners={},timers=new Map(),store={};let id=0,t=0,seed=0;const sent=[];
 const w={location:{hostname:'futbolisland.app',pathname,search:''},addEventListener:(k,f)=>{(listeners[k]??=[]).push(f);},removeEventListener:(k,f)=>{listeners[k]=(listeners[k]||[]).filter(x=>x!==f);},
  setTimeout:(f,ms)=>{timers.set(++id,{f,at:t+ms,ms});return id;},clearTimeout:i=>{timers.delete(i);}};
 const d={visibilityState:'visible',referrer:'',addEventListener:w.addEventListener,removeEventListener:w.removeEventListener};
 const n={sendBeacon:(u,b)=>{sent.push(JSON.parse(b));return true;},maxTouchPoints:5};
 const e={window:w,document:d,navigator:n,storage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v;}},now:()=>t,random:k=>{seed++;return new Uint8Array(k).map((_,i)=>(i*7+seed*53)&255);}};
 return {e,sent,timers,
  advance(ms){const end=t+ms;for(;;){const due=[...timers].filter(([,x])=>x.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!due)break;t=due[1].at;timers.delete(due[0]);due[1].f();}t=end;},
  fire(k){for(const f of listeners[k]||[])f();},hide(){d.visibilityState='hidden';this.fire('visibilitychange');},
  /** `ms` of island frames, one per second, at a position that moves `dx` metres per frame; `input` fires a tap each second. */
  play(ms,x,z,mode,{input=false,dx=0}={}){for(let s=0;s<ms/1000;s++){T.islandFrame(x+dx*s,z,mode,P.placeAt);if(input)this.fire('pointerdown');this.advance(1000);}},
  get t(){return t;}};
}

(async()=>{
// 1. Place lookup on known coordinates, from the world's own constants.
await ok('zones',()=>{
 const L=CC.CAY_LANDMARKS,pa=P.placeAt;
 const cases=[[85,-35,'island_square'],[103,-48,'arcade'],[71,-55,'konbini'],[135,100,'field_11v11'],[11,-80,'field_7v7'],[160,-110,'field_9v9'],[11,18,'field_futsal'],
  [MUS.MUSEUM_DOOR.x,MUS.MUSEUM_DOOR.front,'museum'],[181,-177,'community_hall'],[161,-30,'coaches'],[230,60,'farmers_market'],[343,68,'east_jetty'],[290,98,'east_jetty'],
  [282.5,-93.5,'deep_sea_boat'],[L.starfishSandbar.x,L.starfishSandbar.z,'sandbars'],[L.turtleSandbar.x,L.turtleSandbar.z,'sandbars'],[L.plaza.x,L.plaza.z,'cay_town'],
  [L.roundabout.x,L.roundabout.z,'cay_town'],[L.cayKonbini.x,L.cayKonbini.z,'cay_konbini'],[L.beachSoccerCourt.x,L.beachSoccerCourt.z,'beach_court'],[L.farm.x,L.farm.z,'farm'],
  [L.hostel.x,L.hostel.z,'hostel'],[L.sharksBeach.x,L.sharksBeach.z,'sharks_beach'],[L.lifeguardTower.x,L.lifeguardTower.z,'coral_cay'],[80,-215,'north_beach'],
  [-60,60,'west_side'],[-63,94,'west_side'],[80,-105,'library_square'],[108,196,'south_pier'],[217,213,'ferry_dock'],[246,199,'ferry_dock'],[-140,0,'sea'],[400,-40,'sea'],[NaN,0,'sea']];
 for(const [x,z,want] of cases)assert.equal(pa(x,z),want,`placeAt(${x}, ${z})`);
 const cw=CC.causewayPoint(.3);assert.equal(pa(cw.x,cw.z),'causeway','a point on the causeway deck');
 // Every id the lookup can return is a fixed id, and every fixed id is reachable somewhere on the map.
 const seen=new Set();for(let x=-160;x<880;x+=4)for(let z=-320;z<300;z+=4){const p=pa(x,z);assert(IDS.PLACE_IDS.includes(p),p);seen.add(p);}
 assert.deepEqual([...IDS.PLACE_IDS].filter(p=>!seen.has(p)),[],'every place is reachable');
 assert.equal(new Set(IDS.PLACE_IDS).size,IDS.PLACE_IDS.length);assert.equal(new Set(IDS.ACTIVITY_IDS).size,IDS.ACTIVITY_IDS.length);
 assert(IDS.PLACE_IDS.every(p=>/^[a-z0-9_]+$/.test(p)&&IDS.PLACE_LABEL[p]),'ids are plain and labelled');
 const t0=process.hrtime.bigint();for(let i=0;i<20000;i++)pa(-100+(i*37)%900,-300+(i*53)%590);const ms=Number(process.hrtime.bigint()-t0)/1e6;
 assert(ms/20000<.1,'a lookup costs well under 0.1 ms (one runs every 5 s): '+ms.toFixed(1)+' ms');
});

// 2. The grid covers the whole flyable world (Coral Cay included) in 20 m cells.
await ok('grid',()=>{
 const g=IDS.GRID,B=SIM.FLIGHT_BOUNDS;
 assert.equal(g.size,20);assert.equal(IDS.CELL_COUNT,g.cols*g.rows);
 assert(g.x0<=B.minX&&g.x0+g.cols*g.size>=B.maxX&&g.z0<=B.minZ&&g.z0+g.rows*g.size>=B.maxZ,'grid ⊇ FLIGHT_BOUNDS '+JSON.stringify(J(B)));
 assert.equal(IDS.cellOf(g.x0,g.z0),0);assert.equal(IDS.cellOf(g.x0+g.cols*g.size-.01,g.z0+g.rows*g.size-.01),IDS.CELL_COUNT-1);
 for(const [x,z] of [[g.x0-.01,0],[0,g.z0-1],[g.x0+g.cols*g.size,0],[0,g.z0+g.rows*g.size],[NaN,0],[0,Infinity]])assert.equal(IDS.cellOf(x,z),-1,'outside: '+x+','+z);
 for(let i=0;i<IDS.CELL_COUNT;i+=7){const c=IDS.cellCenter(i);assert.equal(IDS.cellOf(c.x,c.z),i);}
 assert.equal(IDS.cellOf(85,-35),IDS.cellOf(99.9,-21),'same 20 m square');assert.notEqual(IDS.cellOf(85,-35),IDS.cellOf(100,-35));
});

// 3. The tracker's accounting: activity split (idle booked apart), place time and cells only in the world view.
await ok('tracker accounting',()=>{
 const x=env(),tr=T.startTracker(x.e);tr.pageview('/');
 x.play(30_000,85,-35,'walk',{input:true});                       // A: 30 s walking on Island Square
 x.play(20_000,135,100,'ride',{dx:2});                             // B: 20 s riding across Eleven Park (moving, no taps)
 x.play(0,343,68,'walk');T.islandFrame(343,68,'walk',P.placeAt);    // arrive at the jetty
 const offFish=T.enterActivity('fishing');x.play(120_000,343,68,'walk');offFish();// C: 120 s fishing, standing still, no taps
 x.fire('pointerdown');const offMenu=T.enterActivity('menu');x.advance(10_000);offMenu();// D: 10 s in a menu (the frame loop sleeps)
 x.hide();const beats=x.sent.filter(s=>s.t==='beat'),b=merged(x.sent);
 for(const one of beats){assert(Object.keys(one).every(k=>['a','ac','c','e','n','p','pl','s','t','v'].includes(k)),'only totals: no positions, no lists');assert.equal(C.validateEvent(JSON.stringify(one)).ok,true,'what the tracker sends passes validation');}
 assert.equal(b.e,180_000);
 assert.deepEqual(b.ac,{walk:30_000,ride:20_000,fishing:60_000,idle:60_000,menu:10_000},'fishing turns idle after 60 s without input or movement');
 assert.equal(sum(b.ac),b.e,'every foreground ms has exactly one activity');
 assert.deepEqual(b.pl,{island_square:30_000,field_11v11:20_000,east_jetty:60_000},'places leave out idle and menu time');
 const cell=(px,pz)=>String(IDS.cellOf(px,pz));
 assert.equal(b.c[cell(85,-35)],30,'six 5-s samples on the square');assert.equal(b.c[cell(343,68)],65,'the jetty until idle (13 samples)');
 assert.equal(Object.keys(b.c).filter(k=>![cell(85,-35),cell(343,68)].includes(k)).reduce((n,k)=>n+b.c[k],0),20,'the ride, spread over the squares it crossed');
 assert(Math.abs(sum(b.c)*1000-sum(b.pl))<=IDS.SAMPLE_MS,'cells agree with place time to within one sample');
 assert.equal(x.timers.size,0,'still no timers while hidden');tr.stop();
 // Passive activities (watching, reading, quizzes) are not cut at 60 s; the boat deck is "on a boat"; frames do nothing when off.
 const y=env(),t2=T.startTracker(y.e);t2.pageview('/');y.play(120_000,135,100,'lesson');y.play(10_000,282.5,-93.5,'walk',{input:true});y.hide();
 const b2=merged(y.sent);assert.deepEqual(b2.ac,{lesson:120_000,boat:10_000});assert.equal(b2.ac.idle,undefined);t2.stop();
 let calls=0;T.islandFrame(0,0,'walk',()=>{calls++;return 'town';});assert.equal(calls,0,'no tracker (dev, DNT, preview): islandFrame is a no-op');
 // Per frame: a comparison. The place lookup runs once per SAMPLE_MS however many frames there are.
 const z=env(),t3=T.startTracker(z.e);t3.pageview('/');calls=0;const look=(a,b)=>{calls++;return P.placeAt(a,b);};
 for(let i=0;i<600;i++){T.islandFrame(85,-35,'walk',look);z.advance(1000/60);}assert.equal(calls,2,'10 s of 60 fps frames → 2 samples');
 // Off the island the page decides: an arcade game, a museum exhibit.
 t3.pageview('/arcade');const g=T.enterActivity('arcade_tennis');z.fire('pointerdown');z.advance(20_000);g();z.advance(5_000);
 t3.pageview('/museum');const ex=T.enterActivity('exhibit_var-2018');z.advance(30_000);ex();T.enterActivity('nonsense')();z.hide();
 const b3=merged(z.sent);assert.equal(b3.ac.arcade_tennis,20_000);assert.equal(b3.ac.arcade_lobby,5_000);assert.equal(b3.ac['exhibit_var-2018'],30_000);
 assert.equal(b3.pl.island_square,10_000);assert.equal(Object.keys(b3.pl).length,1,'no place time off the island');t3.stop();
});

// 4. Caps: at most 64 cells per beat (the busiest), whole seconds; a cell visited twice is ONE total, not two entries.
await ok('cell caps and no sequence',()=>{
 const x=env(),tr=T.startTracker(x.e);tr.pageview('/');x.timers.clear();// one long beat (no safety ping; moving, so never idle)
 for(let i=0;i<100;i++){const px=-90+(i%17)*20,pz=-180+Math.floor(i/17)*20;x.play(i<10?10_000:5000,px,pz,'walk');}
 x.hide();const b=x.sent.find(s=>s.t==='beat');
 assert.equal(Object.keys(b.c).length,IDS.MAX_BEAT_CELLS,'capped at 64 cells');
 assert(Object.values(b.c).every(v=>Number.isInteger(v)&&v>0));
 assert(Object.values(b.c).filter(v=>v===10).length>=9,'the busiest cells are the ones kept');
 tr.stop();
 const y=env(),t2=T.startTracker(y.e);t2.pageview('/');
 y.play(15_000,85,-35,'walk',{input:true});y.play(15_000,135,100,'walk',{input:true});y.play(15_000,85,-35,'walk',{input:true});y.hide();
 const c=merged(y.sent).c;
 assert.equal(Object.keys(c).length,2,'A → B → A is two totals; the order is not kept anywhere');assert.equal(c[IDS.cellOf(85,-35)],30);
 t2.stop();
 const src=read('lib/analytics/tracker.ts').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');
 assert(!/localStorage|document\.cookie|setInterval|requestAnimationFrame/.test(src),'no storage, intervals or frame loops');
 assert(!/\.push\(\{?\s*x\b|positions|path\s*:\s*\[|trail/.test(src),'never keeps a list of positions');
 const sql=read('supabase/migrations/20261008_analytics_places.sql');
 assert(!/\b(x|z|lat|lng|position|positions|route|path_points|seq|sequence)\s+(real|double|numeric|integer|jsonb|text)/i.test(sql),'no position or sequence columns');
});

// 5. Ingest: fixed ids, cells inside the grid, per-beat caps, buckets ≤ the beat's time; clamped, never trusted.
await ok('ingest validation',async()=>{
 const beat=extra=>({v:1,t:'beat',s:SID,p:'/',e:30_000,...extra});
 const bad=[beat({pl:{bedroom:1000}}),beat({ac:{hacking:1000}}),beat({pl:[1,2]}),beat({ac:'walk'}),beat({c:{[IDS.CELL_COUNT]:5}}),beat({c:{'-1':5}}),beat({c:{'01':5}}),beat({c:{'5x':5}}),
  beat({c:{12:1.5}}),beat({c:{12:0}}),beat({c:Object.fromEntries(Array.from({length:65},(_,i)=>[i,1]))}),beat({pl:{island_square:100_000}}),beat({ac:{walk:-1}}),
  beat({c:{12:60}}),beat({pl:{island_square:Infinity}}),{v:1,t:'start',s:SID,p:'/',pl:{town:1}},{v:1,t:'start',s:SID,p:'/',c:{1:1}}];
 for(const b of bad)assert.equal(C.validateEvent(JSON.stringify(b)).ok,false,'rejects '+JSON.stringify(b).slice(0,90));
 assert.equal(C.validateEvent(JSON.stringify(beat({pl:{island_square:20_000,east_jetty:10_000},ac:{walk:25_000,idle:5000},c:{812:20,813:10}}))).ok,true);
 const store=S.createMemoryStore();await ingest(store,{t:'start',s:SID,p:'/'});
 for(const b of bad.slice(0,15))assert.equal((await ingest(store,b,{now:at(1000)})).status,400);
 assert.equal(store.data.beats.length,0,'nothing stored from bad payloads');
 // Within the tolerance but over the beat: scaled down so no split adds up to more than the beat's foreground time.
 await ingest(store,beat({e:30_000,pl:{island_square:30_000,east_jetty:3000},ac:{walk:33_000},c:{812:20,813:13}}),{now:at(60_000)});
 const s=store.data.beats[0];
 assert(sum(s.placeMs)<=30_000&&sum(s.activityMs)<=30_000&&sum(s.cells)<=30,'scaled to the beat: '+JSON.stringify(J(s)));
 assert.deepEqual(Object.keys(s.placeMs).sort(),['east_jetty','island_square']);
 // A beat claiming more than the 5-minute cap is clamped as a whole.
 await ingest(store,beat({e:3_000_000,pl:{town:3_000_000},ac:{walk:3_000_000}}),{now:at(400_000)});
 const big=store.data.beats[1];assert.equal(big.engagedMs,C.MAX_EVENT_ENGAGED_MS);assert.equal(big.placeMs.town,C.MAX_EVENT_ENGAGED_MS);
 assert.deepEqual(J(C.clampCells({1:5,2:5,99999:5,x:1,3:0},30_000)),{1:5,2:5});
 assert.deepEqual(J(C.clampCells(Object.fromEntries(Array.from({length:80},(_,i)=>[i,i+1])),300_000)),J(Object.fromEntries(Array.from({length:64},(_,i)=>[i+16,Math.floor((i+17)*300/((17+80)*64/2))]).filter(([,v])=>v>0))),'top 64 by time, scaled to the beat');
});

// 6. Payload size per beat.
await ok('payload size',()=>{
 const worst={v:1,t:'beat',s:'AbCdEfGhIjKlMnOpQrSt12',p:'/',e:300000,a:{island:250000,paths:50000},n:100,
  pl:Object.fromEntries(IDS.PLACE_IDS.map(p=>[p,299999])),ac:Object.fromEntries(IDS.ACTIVITY_IDS.map(a=>[a,299999])),
  c:Object.fromEntries(Array.from({length:IDS.MAX_BEAT_CELLS},(_,i)=>[IDS.CELL_COUNT-1-i,299]))};
 const typical={v:1,t:'beat',s:'AbCdEfGhIjKlMnOpQrSt12',p:'/',e:180000,a:{island:180000},n:0,pl:{island_square:60000,field_11v11:70000,east_jetty:40000},ac:{walk:90000,ride:40000,fishing:40000,idle:10000},
  c:Object.fromEntries(Array.from({length:30},(_,i)=>[700+i*3,6]))};
 const w=Buffer.byteLength(JSON.stringify(worst)),t=Buffer.byteLength(JSON.stringify(typical));
 assert(w<=C.MAX_BODY_BYTES,`worst case ${w} B ≤ ${C.MAX_BODY_BYTES}`);assert(t<800,'a typical 3-minute beat stays small: '+t);
 assert.equal(C.validateEvent(JSON.stringify(worst)).ok,true,'the worst case still fits and validates (the split is then scaled to the beat)');
 console.log(`  payload: typical 3-min beat ${t} B, worst case ${w} B (limit ${C.MAX_BODY_BYTES} B)`);
});

// Fixture for the aggregation + SQL groups.
const DAY='2026-10-05',iso=(h,m,s=0)=>`${DAY}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.000Z`;
const st=(id,hash,startedAt,extra={})=>({id,day:DAY,visitorHash:hash.repeat(32),startedAt,entryPath:'/',country:'US',region:'CA',device:'phone',source:'direct',referrerHost:null,utmSource:null,utmMedium:null,utmCampaign:null,...extra});
const FIX_STARTS=[st('plA_aaaaaaaaaaaaaaaa','a',iso(9,0)),st('plB_bbbbbbbbbbbbbbbb','b',iso(10,0),{country:'CA',region:'ON'}),st('plC_cccccccccccccccc','c',iso(11,0),{region:'TX'}),st('plD_dddddddddddddddd','d',iso(12,0))];
const bt=(sessionId,ts,engagedMs,placeMs,activityMs,cells)=>({sessionId,ts,engagedMs,pageviews:0,areaMs:{island:engagedMs},placeMs,activityMs,cells});
const FIX_BEATS=[
 bt('plA_aaaaaaaaaaaaaaaa',iso(9,3),180000,{island_square:100000,arcade:50000},{walk:150000,idle:30000},{812:60,813:40,700:50}),
 bt('plA_aaaaaaaaaaaaaaaa',iso(9,6),120000,{island_square:20000,east_jetty:90000},{fishing:90000,walk:30000},{812:20,1000:90}),
 bt('plB_bbbbbbbbbbbbbbbb',iso(10,3),150000,{beach_court:150000},{walk:50000,ride:100000},{1499:150}),
 bt('plC_cccccccccccccccc',iso(11,1),60000,{},{menu:60000},{}),
 {sessionId:'plD_dddddddddddddddd',ts:iso(12,1),engagedMs:40000,pageviews:0,areaMs:{island:40000}},// a beat from before the place split
];

// 7. Aggregation: per place totals + sessions that went there, activities, cells; merged over days; regions by country.
await ok('aggregation',async()=>{
 const r=C.rollupDay(DAY,C.deriveSessions(FIX_STARTS,FIX_BEATS));
 assert.deepEqual(J(r.placeMs),{island_square:120000,arcade:50000,east_jetty:90000,beach_court:150000});
 assert.deepEqual(J(r.placeSessions),{island_square:1,arcade:1,east_jetty:1,beach_court:1});
 assert.deepEqual(J(r.activityMs),{walk:230000,idle:30000,fishing:90000,ride:100000,menu:60000});
 assert.deepEqual(J(r.cells),{812:80,813:40,700:50,1000:90,1499:150});
 const r2=C.rollupDay('2026-10-06',C.deriveSessions([{...FIX_STARTS[1],id:'plE_eeeeeeeeeeeeeeee',day:'2026-10-06'}],[bt('plE_eeeeeeeeeeeeeeee','2026-10-06T10:01:00.000Z',60000,{island_square:60000},{walk:60000},{812:60})]));
 const legacy={...C.rollupDay('2026-10-04',[])};delete legacy.placeMs;delete legacy.placeSessions;delete legacy.activityMs;delete legacy.cells;// frozen before Oct 8
 const m=C.mergeRollups([r,r2,legacy]);
 assert.deepEqual(J(m.places[0]),{place:'island_square',ms:180000,sessions:2});
 assert.deepEqual(J(m.places.map(p=>p.place)),['island_square','beach_court','east_jetty','arcade']);
 assert.equal(m.activities[0].activity,'walk');assert.equal(m.activities[0].ms,290000);
 assert.deepEqual(J(m.cells.find(([i])=>i===812)),[812,140]);
 // The report carries places, activities, cells and the region names it needs.
 const store=S.createMemoryStore();for(const s of FIX_STARTS)store.data.starts[s.id]=s;store.data.beats.push(...FIX_BEATS);
 const rep=await R.buildReport(store,{from:DAY,to:DAY},new Date('2026-10-07T12:00:00Z'));
 assert.equal(rep.places.length,4);assert.equal(rep.cells.length,5);assert.deepEqual(J(rep.regionNames),{'US-CA':'California','US-TX':'Texas','CA-ON':'Ontario'});
 assert.deepEqual(J(C.emptyReport(DAY,DAY,new Date(),true).places),[]);
});

// 8. Region names (ISO 3166-2, Vercel's header codes) and the per-country breakdown.
await ok('regions',()=>{
 for(const [c,r,name] of [['US','CA','California'],['CA','ON','Ontario'],['GB','ENG','England'],['GB','SCT','Scotland'],['AU','NSW','New South Wales'],['MX','CMX','Ciudad de México'],
  ['ES','MD','Comunidad de Madrid'],['IE','D','Dublin'],['JP','13','Tokyo'],['BR','SP','São Paulo'],['DE','BE','Berlin'],['NG','LA','Lagos'],['us','ca','California']])assert.equal(G.regionName(c,r),name,`${c}-${r}`);
 assert.equal(G.regionName('US','ZZ'),'ZZ','unknown code: the code');assert.equal(G.regionName('ZZ','A1'),'A1','unknown country: the code');
 assert.deepEqual(J(G.regionNamesFor(['US-TX','GB-WLS','bad','US-ZZ'])),{'US-TX':'Texas','GB-WLS':'Wales','US-ZZ':'ZZ'});
 const rows=[{key:'US-CA',visitors:9,sessions:12,pageviews:20},{key:'US-TX',visitors:4,sessions:5,pageviews:6},{key:'CA-ON',visitors:6,sessions:6,pageviews:7},{key:'US-WY',visitors:4,sessions:4,pageviews:4},{key:'CA-BC',visitors:1,sessions:1,pageviews:1}];
 assert.deepEqual(J(C.regionCountries(rows)),[{country:'US',visitors:17,sessions:21},{country:'CA',visitors:7,sessions:7}]);
 const us=C.regionsOf(rows,'US',G.regionNamesFor(rows.map(r=>r.key)));
 assert.deepEqual(J(us.map(r=>[r.name,r.code,r.visitors])),[['California','CA',9],['Texas','TX',4],['Wyoming','WY',4]],'ALL of the country\'s regions, full names, by visitors');
 assert.deepEqual(J(C.regionsOf(rows,'CA',{}).map(r=>r.name)),['ON','BC'],'falls back to the code');
 // Every region of a country survives the daily trim (1000 keys, was 100), so the list really is all of them.
 const many=Array.from({length:150},(_,i)=>st('rg'+String(i).padStart(18,'0'),'e',iso(13,0),{region:String(i).padStart(3,'0')}));
 assert.equal(Object.keys(C.rollupDay(DAY,C.deriveSessions(many,[])).dims.region).length,150);
 const src=read('lib/analytics/regions.ts')+read('app/admin/RegionCard.tsx');
 assert(!/city|latitude|longitude/i.test(src.replace(/no city|never a city|No city|city or coordinates/g,'')),'region level only');
 assert(!/^import[^\n]*(regionNames\.json|analytics\/regions')/m.test(read('app/admin/RegionCard.tsx')+read('app/admin/AnalyticsDashboard.tsx')+read('app/admin/IslandSection.tsx')),'the names table stays on the server');
});

// 9. The SQL: live migration + the additive one on a throwaway Postgres; caps in SQL; rollup = the TypeScript reference.
await ok('sql',async()=>{
 const bin=n=>{for(const d of (process.env.PATH||'').split(':').concat(['/opt/homebrew/bin','/usr/local/bin','/usr/lib/postgresql/16/bin','/usr/lib/postgresql/15/bin','/usr/lib/postgresql/14/bin'])){const f=path.join(d,n);if(fs.existsSync(f))return f;}return null;};
 const initdb=bin('initdb'),pgctl=bin('pg_ctl'),psqlBin=bin('psql');
 if(process.env.SKIP_PG_TESTS||!initdb||!pgctl||!psqlBin){console.log('  SKIP sql: no local Postgres (initdb/pg_ctl/psql) found');return 'skip';}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fipgp-')),port=String(40000+(process.pid+7)%20000),quiet={stdio:['ignore','ignore','pipe']};
 try{
  cp.execFileSync(initdb,['-D',path.join(dir,'data'),'-U','postgres','--auth=trust','-E','UTF8','--locale=C'],quiet);
  cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-o',`-k ${dir} -p ${port} -c listen_addresses='' -c fsync=off -c TimeZone=UTC`,'-w','-l',path.join(dir,'log'),'start'],quiet);
  const args=['-h',dir,'-p',port,'-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-qAt'];
  const psql=(sql,{role}={})=>cp.execFileSync(psqlBin,[...args,'-c',(role?`set role ${role}; `:'')+sql],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const fails=(sql,role)=>{const r=cp.spawnSync(psqlBin,[...args,'-c',`set role ${role}; ${sql}`],{encoding:'utf8'});return r.status!==0?r.stderr:'';};
  psql('create role anon; create role authenticated; create role service_role bypassrls;');
  const runFile=f=>cp.execFileSync(psqlBin,[...args,'-f',f],{stdio:['ignore','ignore','pipe']});
  runFile('supabase/migrations/20261007_analytics.sql');
  // Live data from before the new migration keeps working.
  psql(`insert into analytics_sessions (id,day,visitor_hash,started_at,entry_path,device,source) values ('legacy_session_00001','${DAY}','${'f'.repeat(32)}','${iso(8,0)}','/','phone','direct')`);
  psql(`insert into analytics_beats (session_id,ts,engaged_ms,area_ms) values ('legacy_session_00001','${iso(8,1)}',30000,'{"island":30000}')`);
  runFile('supabase/migrations/20261008_analytics_places.sql');
  assert.equal(psql(`select place_ms::text||activity_ms::text||cells::text from analytics_beats where session_id='legacy_session_00001'`),'{}{}{}','existing rows read as empty');
  // Additive only: running it again is harmless too (idempotent), and the grants still hold.
  runFile('supabase/migrations/20261008_analytics_places.sql');
  runFile('supabase/migrations/20261009_analytics_counts.sql');// and the learning one after it, as in production
  for(const role of ['anon','authenticated'])assert.match(fails(`select analytics_ingest('{}'::jsonb)`,role),/permission denied/);
  assert.deepEqual(psql(`select column_name from information_schema.columns where table_name='analytics_beats' order by ordinal_position`).split('\n'),['id','session_id','ts','engaged_ms','pageviews','area_ms','place_ms','activity_ms','cells','counts'],'three new columns (+ counts, Oct 9), nothing else');
  // The SQL's enums and limits are the TypeScript ones.
  const sql=read('supabase/migrations/20261008_analytics_places.sql');
  const lists=[...sql.matchAll(/where key in \(([^)]*)\)/g)].map(m=>m[1].split(',').map(s=>s.trim().replace(/'/g,'')));
  assert.deepEqual(lists[1],[...IDS.PLACE_IDS]);assert.deepEqual(lists[2],[...IDS.ACTIVITY_IDS]);
  assert(sql.includes(`key::integer < ${IDS.CELL_COUNT}`)&&sql.includes(`limit ${IDS.MAX_BEAT_CELLS}`));
  assert(!/\bdrop\b|\btruncate\b|\bdelete from\b|rename/i.test(sql.replace(/--.*$/gm,'')),'no destructive statements');
  // Ingest caps in SQL (the last line, behind the server's own clamp).
  const today=new Date().toISOString().slice(0,10);
  psql(`select analytics_ingest('{"type":"start","session":"sqlplacesession00001","path":"/","day":"${today}","visitor_hash":"${'9'.repeat(32)}","device":"phone","source":"direct"}')`,{role:'service_role'});
  const cells70=Object.fromEntries(Array.from({length:70},(_,i)=>[String(i),i+1]));
  const p={type:'beat',session:'sqlplacesession00001',engaged_ms:30000,pageviews:0,area_ms:{island:30000},
   place_ms:{island_square:20000,bedroom:5000,east_jetty:99999,town:'12'},activity_ms:{walk:30000,hacking:1,idle:-5},cells:{...cells70,[IDS.CELL_COUNT]:5,'-3':5,'7.5':1,'0012':4}};
  psql(`select analytics_ingest('${JSON.stringify(p)}'::jsonb)`,{role:'service_role'});
  const row=JSON.parse(psql(`select json_build_object('p',place_ms,'a',activity_ms,'c',cells) from analytics_beats where session_id='sqlplacesession00001'`));
  assert.deepEqual(row.p,{island_square:20000,east_jetty:30000,town:12},'unknown ids dropped, each value ≤ the beat');
  assert.deepEqual(row.a,{walk:30000},'bad activities dropped');
  assert.equal(Object.keys(row.c).length,64,'64 cells at most');assert(Object.keys(row.c).every(k=>Number(k)<IDS.CELL_COUNT&&/^\d+$/.test(k)),'grid indices only');
  assert(Object.values(row.c).every(v=>v<=30),'a cell holds at most the beat\'s seconds');
  psql(`select analytics_ingest('{"type":"beat","session":"sqlplacesession00001","engaged_ms":1000,"place_ms":[1,2],"cells":"x"}'::jsonb)`,{role:'service_role'});
  assert.equal(psql(`select count(*) from analytics_beats where session_id='sqlplacesession00001' and place_ms='{}' and cells='{}'`),'1','non-object splits are ignored, the beat still counts');
  // Rollup = TypeScript reference (with a legacy beat and a legacy session in the mix).
  const q=v=>v===null?'null':`'${String(v).replace(/'/g,"''")}'`;
  psql('insert into analytics_sessions (id,day,visitor_hash,started_at,entry_path,country,region,device,source,referrer_host,utm_source,utm_medium,utm_campaign) values '+
   FIX_STARTS.map(s=>`(${[s.id,s.day,s.visitorHash,s.startedAt,s.entryPath,s.country,s.region,s.device,s.source,s.referrerHost,s.utmSource,s.utmMedium,s.utmCampaign].map(q).join(',')})`).join(','));
  psql('insert into analytics_beats (session_id,ts,engaged_ms,pageviews,area_ms,place_ms,activity_ms,cells) values '+FIX_BEATS.map(b=>`(${q(b.sessionId)},${q(b.ts)},${b.engagedMs},${b.pageviews},${q(JSON.stringify(b.areaMs))},${q(JSON.stringify(b.placeMs||{}))},${q(JSON.stringify(b.activityMs||{}))},${q(JSON.stringify(b.cells||{}))})`).join(','));
  const legacyStart={...st('legacy_session_00001','f',iso(8,0)),visitorHash:'f'.repeat(32),country:null,region:null};
  const ref=J(C.rollupDay(DAY,C.deriveSessions([...FIX_STARTS,legacyStart],[...FIX_BEATS,{sessionId:'legacy_session_00001',ts:iso(8,1),engagedMs:30000,pageviews:0,areaMs:{island:30000}}])));
  const got=JSON.parse(psql(`select analytics_day_rollup('${DAY}')`,{role:'service_role'}));
  assert.deepEqual(got,ref,'SQL day rollup = TypeScript reference');
  assert.deepEqual(got.placeSessions,{island_square:1,arcade:1,east_jetty:1,beach_court:1});
  assert.deepEqual(JSON.parse(psql(`select analytics_day_rollup('2026-09-01')`,{role:'service_role'})),J(C.rollupDay('2026-09-01',[])),'an empty day has the same shape');
  // 150 regions in one day all survive (1000-key trim in SQL too).
  psql(`insert into analytics_sessions (id,day,visitor_hash,started_at,entry_path,country,region,device,source) select 'rgn_'||lpad(g::text,16,'0'),'2026-09-02','${'e'.repeat(32)}','2026-09-02T10:00:00Z','/','US',lpad(g::text,3,'0'),'phone','direct' from generate_series(1,150) g`);
  assert.equal(psql(`select count(*) from jsonb_object_keys(analytics_day_rollup('2026-09-02')->'dims'->'region')`,{role:'service_role'}),'150');
  // Nightly finalize freezes the place totals for good, then raw rows go after 14 days.
  const add=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*86400000).toISOString().slice(0,10),fin=add(today,-5);
  psql(`update analytics_beats set ts=ts + ('${fin}'::date - '${DAY}'::date) * interval '1 day' where session_id in (select id from analytics_sessions where day='${DAY}')`);
  psql(`update analytics_sessions set day='${fin}', started_at=started_at + ('${fin}'::date - '${DAY}'::date) * interval '1 day' where day='${DAY}'`);
  assert(JSON.parse(psql(`select analytics_finalize('${today}')`,{role:'service_role'})).includes(fin));
  const frozen=JSON.parse(psql(`select data from analytics_daily where day='${fin}'`));
  assert.deepEqual(frozen.placeMs,ref.placeMs);assert.deepEqual(frozen.cells,ref.cells);assert.deepEqual(frozen.activityMs,ref.activityMs);
  psql(`select analytics_finalize('${add(fin,15)}')`,{role:'service_role'});
  assert.equal(psql(`select count(*) from analytics_beats b join analytics_sessions s on s.id=b.session_id where s.day='${fin}'`),'0','raw beats purged after 14 days');
  assert.deepEqual(JSON.parse(psql(`select data->'placeMs' from analytics_daily where day='${fin}'`)),ref.placeMs,'daily totals kept for good');
 }finally{
  try{cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-m','immediate','-w','stop'],quiet);}catch{}
  fs.rmSync(dir,{recursive:true,force:true});
 }
});

// 10. Wiring and heat budget: the island hooks into its existing frame; components mark what's open; no new loops.
await ok('wiring',()=>{
 const town=read('components/Town.tsx'),anim=town.slice(town.indexOf('function animate(now:number){'));
 assert(/islandFrame\(location\.x,location\.z,/.test(anim.slice(0,anim.indexOf('streetTraffic.update('))),'sampled from the existing animate() frame');
 const line=town.split('\n').find(l=>l.includes('islandFrame(location.x'));assert(!/requestAnimationFrame|setTimeout|setInterval|setState|set[A-Z]\w*\(/.test(line),'no timers or React state in the hook');
 assert(/useEffect\(\(\)=>panelActivity\?enterActivity\(panelActivity\):undefined,\[panelActivity\]\)/.test(town),'open panels: one effect, no extra renders');
 for(const [f,id] of [['components/PlayerPopUpBook.tsx',"'book'"],['components/CardFilmPlayer.tsx',"'films'"],['components/CardCollection.tsx',"'cards'"],['components/IslandQuests.tsx',"'paths'"],['components/ArcadeRoom.tsx','`arcade_${game}`'],['components/MuseumRoom.tsx','`exhibit_${experience}`']])
  assert(read(f).includes(`enterActivity(${id}`),f+' marks its activity');
 for(const g of IDS.ARCADE_GAMES)assert(IDS.ACTIVITY_IDS.includes('arcade_'+g),g);
 for(const e of IDS.MUSEUM_EXHIBITS)assert(IDS.ACTIVITY_IDS.includes('exhibit_'+e),e);
 const arcadeIds=[...read('lib/arcade/arcadeCatalog.ts').matchAll(/\{id:'([a-z]+)'/g)].map(m=>m[1]);assert.deepEqual(arcadeIds,[...IDS.ARCADE_GAMES],'arcade games match the catalog');
 const exp=read('components/museum/experiences/index.tsx').match(/const IDS=\[([^\]]*)\]/)[1].split(',').map(s=>s.trim().replace(/'/g,''));assert.deepEqual(exp,[...IDS.MUSEUM_EXHIBITS],'exhibits match the museum');
 // The heavy geometry stays out of the every-page tracker bundle.
 assert(!/^import[^\n]*(islandPlaces|lib\/town|\.\.\/town)/m.test(read('lib/analytics/tracker.ts')+read('lib/analytics/islandIds.ts')+read('lib/analytics/core.ts')),'tracker/core never import the island geometry');
 assert(/20261008_analytics_places\.sql/.test(read('app/admin/AnalyticsDashboard.tsx')),'the not-configured banner names the new migration');
 assert(/admin-analytics-places\.cjs/.test(read('package.json')),'part of npm test');
});

console.log(`admin-analytics-places: ${passed} groups passed${skipped.length?`, skipped: ${skipped.join(', ')}`:''}`);
})().catch(e=>{console.error(e);process.exit(1);});
