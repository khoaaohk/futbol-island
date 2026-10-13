#!/usr/bin/env node
// Admin analytics: Pacific-time days and the accuracy pass (Oct 12 2026).
//  1. the clock: Pacific days, DST (Mar 8 2026 has 23 hours, Nov 1 2026 has 25), presets today/yesterday/7d/30d/90d/custom;
//  2. hours and day membership across DST, the ingest's Pacific salt day;
//  3. END TO END by simulation: real tracker code in fake tabs (multiple tabs, hide + pagehide both firing, a session crossing
//     UTC midnight and one crossing Pacific midnight, a bounce, a bot, DNT, a school NAT burst) → beacons → the real ingest →
//     the memory store → the report, compared with the exact truth;
//  4. like-for-like comparisons (partial today vs the same time the day before; an estimated part-day for long ranges),
//     "Players per day" over complete days, UTC stand-in days and inexact-visitor days flagged, small-number suppression;
//  5. save codes: the complete-days comparison;
//  6. the SQL of 20261012_admin_pacific_time.sql on a throwaway Postgres: all migrations in order, self-check row, idempotent,
//     additive, service_role only, SQL = TypeScript on DST days, finalize/purge, and the whole report through the Supabase
//     store (PostgREST emulated over psql) = the same report from the memory store.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),os=require('os'),cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const read=f=>fs.readFileSync(f,'utf8');
const J=x=>JSON.parse(JSON.stringify(x));
// A wall clock the tracker reads through Date.now() (session idle timeout); everything else passes explicit instants.
let SIM=Date.parse('2026-10-20T15:00:00Z');
class SimDate extends Date{static now(){return SIM;}}
const loaded=new Map();
function resolve(from,id){const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);
 for(const f of [base,base+'.ts',base+'.tsx'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;throw Error('cannot resolve '+id+' from '+from);}
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);
 if(file.endsWith('.json')){const v={default:JSON.parse(read(file))};loaded.set(file,v);return v;}
 const m={exports:{}};loaded.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(read(file),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Buffer,URL,URLSearchParams,TextDecoder,Date:SimDate,Math,JSON,Promise,Response,Intl,process:{env:{}},console,require:id=>id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id)});
 loaded.set(file,m.exports);return m.exports;}
const C=load('lib/analytics/core.ts'),S=load('lib/analytics/store.ts'),I=load('lib/analytics/ingest.ts'),R=load('lib/analytics/report.ts'),T=load('lib/analytics/tracker.ts'),M=load('lib/saves/metrics.ts');
let passed=0;const skipped=[];
const ok=(name,fn)=>Promise.resolve().then(fn).then(r=>{if(r==='skip')skipped.push(name);else passed++;},e=>{console.error('FAIL',name);throw e;});
/** UTC instant of a Los Angeles wall-clock time (the offset given explicitly, so the test does not trust the code under test). */
const pt=(day,hm,off='-07:00')=>new Date(`${day}T${hm}:00${off}`);
const MIN=60_000,H=3_600_000;

(async()=>{
// 1. The clock.
await ok('pacific days and DST',()=>{
 assert.equal(C.pacificDay('2026-10-11T01:00:00Z'),'2026-10-10','6 pm PDT on Oct 10 is already Oct 11 in UTC');
 assert.equal(C.pacificDay('2026-10-11T06:59:59Z'),'2026-10-10');assert.equal(C.pacificDay('2026-10-11T07:00:00Z'),'2026-10-11','midnight PDT = 07:00 UTC');
 assert.equal(C.pacificDay('2026-12-15T07:59:59Z'),'2026-12-14');assert.equal(C.pacificDay('2026-12-15T08:00:00Z'),'2026-12-15','midnight PST = 08:00 UTC');
 assert.equal(new Date(C.dayStartMs('2026-10-12')).toISOString(),'2026-10-12T07:00:00.000Z');
 assert.equal(new Date(C.dayStartMs('2026-12-15')).toISOString(),'2026-12-15T08:00:00.000Z');
 assert.equal(new Date(C.dayStartMs('2026-10-12','utc')).toISOString(),'2026-10-12T00:00:00.000Z');
 // Spring forward: Sun Mar 8 2026 2 am PST → 3 am PDT. Fall back: Sun Nov 1 2026 2 am PDT → 1 am PST.
 assert.equal(C.hoursInDay('2026-03-08'),23);assert.equal(C.hoursInDay('2026-11-01'),25);assert.equal(C.hoursInDay('2026-10-12'),24);
 assert.equal(C.hoursInDay('2026-03-07'),24);assert.equal(C.hoursInDay('2026-03-09'),24);assert.equal(C.hoursInDay('2026-11-02'),24);assert.equal(C.hoursInDay('2026-11-01','utc'),24);
 assert.deepEqual(J(C.dayBounds('2026-11-01').map(t=>new Date(t).toISOString())),['2026-11-01T07:00:00.000Z','2026-11-02T08:00:00.000Z']);
 assert.deepEqual(J(C.dayBounds('2026-03-08').map(t=>new Date(t).toISOString())),['2026-03-08T08:00:00.000Z','2026-03-09T07:00:00.000Z']);
 assert.equal(C.pacificOffsetMs(Date.parse('2026-11-01T08:30:00Z')),-7*H,'1:30 am PDT');assert.equal(C.pacificOffsetMs(Date.parse('2026-11-01T09:30:00Z')),-8*H,'1:30 am PST (the second one)');
});

await ok('presets resolve in Pacific time',()=>{
 const R_=(q,now,mode)=>J(C.resolveRange(q,new Date(now),mode));
 // 6 pm PDT Oct 10 (01:00 UTC Oct 11): UTC would already say Oct 11.
 const eve='2026-10-11T01:00:00Z';
 assert.deepEqual(R_({range:'today'},eve),{from:'2026-10-10',to:'2026-10-10'});
 assert.deepEqual(R_({range:'yesterday'},eve),{from:'2026-10-09',to:'2026-10-09'});
 assert.deepEqual(R_({range:'7d'},eve),{from:'2026-10-04',to:'2026-10-10'});
 assert.deepEqual(R_({range:'30d'},eve),{from:'2026-09-11',to:'2026-10-10'});
 assert.deepEqual(R_({range:'90d'},eve),{from:'2026-07-13',to:'2026-10-10'});
 assert.deepEqual(R_({range:'custom',from:'2026-10-01',to:'2026-10-11'},eve),{from:'2026-10-01',to:'2026-10-10'},'a custom end after the Pacific today clamps to it');
 assert.deepEqual(R_({range:'custom',from:'2026-10-09',to:'2026-10-02'},eve),{from:'2026-10-02',to:'2026-10-09'},'reversed ranges swap');
 assert.deepEqual(R_({range:'custom',from:'bad',to:'2026-10-05'},eve),{from:'2026-10-04',to:'2026-10-05'},'a bad from falls back to 7 days back');
 assert.deepEqual(R_({range:'nonsense'},eve),{from:'2026-10-04',to:'2026-10-10'},'unknown preset = 7 days');
 assert.deepEqual(R_({range:'today'},eve,'utc'),{from:'2026-10-11',to:'2026-10-11'},'the pre-migration UTC clock');
 // Fall back (Nov 1 2026 has 25 hours).
 assert.deepEqual(R_({range:'today'},'2026-11-02T07:30:00Z'),{from:'2026-11-01',to:'2026-11-01'},'11:30 pm PST Nov 1 is still Nov 1');
 assert.deepEqual(R_({range:'yesterday'},'2026-11-02T08:30:00Z'),{from:'2026-11-01',to:'2026-11-01'},'12:30 am Nov 2: yesterday = the whole 25-hour Nov 1');
 assert.deepEqual(R_({range:'yesterday'},'2026-11-01T07:30:00Z'),{from:'2026-10-31',to:'2026-10-31'},'12:30 am PDT Nov 1');
 assert.deepEqual(R_({range:'7d'},'2026-11-04T20:00:00Z'),{from:'2026-10-29',to:'2026-11-04'},'a week across the change is 7 calendar days (169 hours)');
 // Spring forward (Mar 8 2026 has 23 hours).
 assert.deepEqual(R_({range:'today'},'2026-03-09T06:30:00Z'),{from:'2026-03-08',to:'2026-03-08'},'11:30 pm PDT Mar 8');
 assert.deepEqual(R_({range:'today'},'2026-03-09T07:30:00Z'),{from:'2026-03-09',to:'2026-03-09'},'12:30 am PDT Mar 9');
 assert.deepEqual(R_({range:'yesterday'},'2026-03-09T07:30:00Z'),{from:'2026-03-08',to:'2026-03-08'});
 assert.deepEqual(R_({range:'yesterday'},'2026-03-08T08:30:00Z'),{from:'2026-03-07',to:'2026-03-07'},'12:30 am PST Mar 8');
 const dash=read('app/admin/AnalyticsDashboard.tsx');
 assert(/\{id:'yesterday',label:'Yesterday'\}/.test(dash)&&/\{id:'today',label:'Today'\}/.test(dash),'the Today and Yesterday presets are on the dashboard');
 assert(/Pacific time/.test(dash)&&!/days and hours in UTC\{/.test(dash),'labels say Pacific time');
});

// 2. Hours and membership across DST; the ingest's salt day.
const hx=c=>c.repeat(32);
const st=(id,hash,startedAt,extra={})=>({id,day:C.pacificDay(startedAt),visitorHash:hx(hash),startedAt:new Date(startedAt).toISOString(),entryPath:'/',country:'US',region:'CA',device:'phone',source:'direct',referrerHost:null,utmSource:null,utmMedium:null,utmCampaign:null,flags:{},...extra});
const bt=(sessionId,ts,engagedMs,pageviews=0,extra={})=>({sessionId,ts:new Date(ts).toISOString(),engagedMs,pageviews,areaMs:{island:engagedMs},placeMs:{},activityMs:{},cells:{},counts:{},...extra});
// Nov 1 2026 (25 h) and Mar 8 2026 (23 h). One session per row; `day` = its salt day (one is labelled the UTC way to show an inexact day).
const DST_STARTS=[
 st('nov_a_000000000000001','a','2026-11-01T07:30:00Z'),// 12:30 am PDT Nov 1
 st('nov_b_000000000000001','b','2026-11-01T08:30:00Z',{flags:{p:1,s:2}}),// 1:30 am PDT
 st('nov_c_000000000000001','c','2026-11-01T09:30:00Z',{country:'GB',region:'ENG'}),// 1:30 am PST (the repeated hour)
 st('nov_d_000000000000001','a','2026-11-02T07:30:00Z',{device:'tablet'}),// 11:30 pm PST Nov 1 (same visitor as a)
 st('nov_e_000000000000001','e','2026-11-02T08:30:00Z'),// 12:30 am PST Nov 2
 st('mar_a_000000000000001','a','2026-03-08T08:30:00Z'),// 12:30 am PST Mar 8
 st('mar_b_000000000000001','b','2026-03-08T10:30:00Z',{entryPath:'/arcade'}),// 3:30 am PDT (2 am never happened)
 st('mar_c_000000000000001','c','2026-03-09T06:30:00Z',{day:'2026-03-09'}),// 11:30 pm PDT Mar 8, labelled with its UTC day (old salt)
];
const DST_BEATS=[
 bt('nov_a_000000000000001','2026-11-01T07:33:00Z',180000,1,{counts:{'st:view':1,'st:start':1},placeMs:{island_square:100000},activityMs:{walk:180000},cells:{'812':60}}),
 bt('nov_b_000000000000001','2026-11-01T08:40:00Z',300000,0,{counts:{'st:view':1}}),
 bt('nov_c_000000000000001','2026-11-01T09:31:00Z',8000),// a bounce
 bt('nov_d_000000000000001','2026-11-02T07:50:00Z',240000,2),
 bt('nov_d_000000000000001','2026-11-02T08:10:00Z',60000,1),// after Pacific midnight: stays with its session's day
 bt('nov_e_000000000000001','2026-11-02T08:35:00Z',90000),
 bt('mar_a_000000000000001','2026-03-08T08:35:00Z',120000),
 bt('mar_b_000000000000001','2026-03-08T10:40:00Z',300000,3),
 bt('mar_c_000000000000001','2026-03-09T06:45:00Z',200000),
];

await ok('hours and membership across DST',async()=>{
 const sessions=C.deriveSessions(DST_STARTS,DST_BEATS);
 const nov=C.rollupPacificDay('2026-11-01',sessions);
 assert.equal(nov.sessions,4,'12:30 am PDT, both 1:30 ams, and 11:30 pm PST');assert.equal(nov.visitors,3);assert.equal(nov.tz,'America/Los_Angeles');
 assert.equal(nov.engagedMs,180000+300000+8000+300000,'the beat after midnight counts with its session');assert.equal(nov.bounces,1);assert.equal(nov.exactVisitors,true);
 assert.equal(nov.countSessions['st:view'],2);
 const mar=C.rollupPacificDay('2026-03-08',sessions);
 assert.equal(mar.sessions,3);assert.equal(mar.exactVisitors,false,'a session salted for another day → visitors not exact');
 assert.equal(C.rollupPacificDay('2026-11-02',sessions).sessions,1);
 const h=C.hourlySeries('2026-11-01',DST_STARTS,DST_BEATS,'pacific');
 assert.equal(h.length,25,'25 hours on the fall-back day');assert.equal(new Set(h.map(p=>p.key)).size,25,'every hour has its own key');
 assert.equal(h[0].key,'2026-11-01T07:00:00.000Z');assert.equal(h[1].sessions,1,'1 am PDT');assert.equal(h[2].sessions,1,'1 am PST');assert.equal(h[24].sessions,1,'11 pm PST');
 assert.equal(h[24].pageviews,1+2,'the start and the beat before midnight; the 12:10 am beat is in Nov 2\'s hours');
 assert.equal(h.reduce((a,p)=>a+p.sessions,0),nov.sessions,'the hours add up to the day');
 const m=C.hourlySeries('2026-03-08',DST_STARTS,DST_BEATS,'pacific');
 assert.equal(m.length,23,'23 hours on the spring-forward day');assert.equal(m[2].key,'2026-03-08T10:00:00.000Z','index 2 = 3 am PDT');assert.equal(m[2].sessions,1);
 assert.equal(m.reduce((a,p)=>a+p.sessions,0),3);
 // The memory store answers the same, by start time (not the day label).
 const store=S.createMemoryStore();for(const s of DST_STARTS)store.data.starts[s.id]=s;store.data.beats.push(...DST_BEATS);
 assert.deepEqual(J(await store.hourly('2026-11-01')),J(h));
 const rep=await R.buildReport(store,{from:'2026-11-01',to:'2026-11-01'},new Date('2026-11-03T20:00:00Z'));
 assert.equal(rep.series.length,25);assert.deepEqual(J(rep.time.dstDays),[{day:'2026-11-01',hours:25}]);
 const rm=await R.buildReport(store,{from:'2026-03-07',to:'2026-03-09'},new Date('2026-03-10T20:00:00Z'));
 assert.deepEqual(J(rm.time.dstDays),[{day:'2026-03-08',hours:23}]);assert.deepEqual(J(rm.time.inexactVisitorDays),['2026-03-08']);
 // Today's hourly chart stops at the current Pacific hour (and a DST day counts real hours).
 const live=await R.buildReport(store,{from:'2026-11-01',to:'2026-11-01'},new Date('2026-11-01T09:45:00Z'));
 assert.equal(live.series.length,3,'1:45 am PST on Nov 1 is the 3rd hour of the day');assert.equal(live.time.partialToday,true);
});

// 3. End to end: tracker → beacon → ingest → store → report, against the truth.
const DEVICES={A:{ip:'198.51.100.10',ua:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'},
 B:{ip:'198.51.100.20',ua:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15'},
 C:{ip:'198.51.100.30',ua:'Mozilla/5.0 (Linux; Android 14; SM-X200) AppleWebKit/537.36 Chrome/128.0 Safari/537.36'},
 D:{ip:'198.51.100.40',ua:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0 Safari/537.36'},
 SCHOOL:{ip:'203.0.113.200',ua:'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'},
 BOT:{ip:'192.0.2.9',ua:'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'}};
function headersFor(dev,extra={}){const h={host:'futbolisland.app','user-agent':dev.ua,'x-forwarded-for':dev.ip,origin:'https://futbolisland.app','x-vercel-ip-country':'US','x-vercel-ip-country-region':'CA',...extra};
 const m=new Map(Object.entries(h).map(([k,v])=>[k.toLowerCase(),v]));return {get:k=>m.has(k.toLowerCase())?m.get(k.toLowerCase()):null};}
/** A world of fake tabs on one clock: every beacon is ingested at the instant it is sent. */
function world(store,{limiter=I.createLimiter()}={}){
 const timers=[];let tid=0,seed=1;const sent=[],pending=[];
 const tab=(dev,{nav={},pathname='/'}={})=>{
  const listeners={},storeKV={};
  const w={location:{hostname:'futbolisland.app',pathname,search:''},addEventListener:(k,f)=>{(listeners[k]??=[]).push(f);},removeEventListener:(k,f)=>{listeners[k]=(listeners[k]||[]).filter(x=>x!==f);},
   setTimeout:(f,ms)=>{const id=++tid;timers.push({id,f,at:SIM+ms});return id;},clearTimeout:id=>{const i=timers.findIndex(t=>t.id===id);if(i>=0)timers.splice(i,1);}};
  const d={visibilityState:'visible',referrer:'',addEventListener:w.addEventListener,removeEventListener:w.removeEventListener};
  const n={sendBeacon:(u,b)=>{const at=new Date(SIM);sent.push({dev,body:JSON.parse(b),at});pending.push(I.handleIngest({body:b,headers:headersFor(dev),store,limiter,now:at,vercelEnv:'production'}));return true;},maxTouchPoints:dev===DEVICES.B||dev===DEVICES.D?0:5,...nav};
  const tr=T.startTracker({window:w,document:d,navigator:n,storage:{getItem:k=>storeKV[k]??null,setItem:(k,v)=>{storeKV[k]=v;}},now:()=>SIM,random:k=>{seed++;return new Uint8Array(require('crypto').randomBytes(k));}});
  const fire=k=>{for(const f of listeners[k]||[])f();};
  return {tr,fire,storage:storeKV,
   open(p='/'){tr?.pageview(p);},
   /** Play for `ms` with a tap every 30 s. */
   play(ms){const end=SIM+ms;while(SIM<end){advance(Math.min(30_000,end-SIM));fire('pointerdown');}},
   /** Closing a tab fires visibilitychange→hidden AND pagehide: it must count once. */
   close(){d.visibilityState='hidden';fire('visibilitychange');fire('pagehide');tr?.stop();}};
 };
 function advance(ms){const end=SIM+ms;for(;;){timers.sort((a,b)=>a.at-b.at);const t=timers[0];if(!t||t.at>end)break;timers.shift();SIM=t.at;t.f();}SIM=end;}
 return {tab,advance,sent,settle:async()=>{const r=await Promise.all(pending.splice(0));return r;},at:t=>{SIM=t.getTime();}};
}

await ok('end to end: simulated traffic = the exact truth',async()=>{
 const D='2026-10-20';// a PDT day: midnight = 07:00 UTC; UTC midnight = 5 pm PDT
 const store=S.createMemoryStore(),w=world(store),results=[];
 // Device A, two tabs at once (09:00 for 5 min, 09:01 for 2 min): one visitor, two sessions.
 w.at(pt(D,'09:00'));const a1=w.tab(DEVICES.A);a1.open('/');
 w.advance(MIN);const a2=w.tab(DEVICES.A);a2.open('/');
 a2.play(2*MIN);a2.close();
 a1.play(2*MIN);a1.close();// a1: 09:00 → 09:05 = 5 min, a2: 2 min (both foreground in this simulation)
 // Device D: a 5-second bounce at noon.
 w.at(pt(D,'12:00'));const d1=w.tab(DEVICES.D);d1.open('/');w.advance(5000);d1.close();
 // A bot and a Do-Not-Track browser at noon: nothing.
 results.push(await I.handleIngest({body:JSON.stringify({v:1,t:'start',s:'BotBotBotBotBotBot0001',p:'/'}),headers:headersFor(DEVICES.BOT),store,limiter:I.createLimiter(),now:pt(D,'12:01'),vercelEnv:'production'}));
 assert.equal(w.tab(DEVICES.D,{nav:{doNotTrack:'1'}}).tr,null,'DNT: no tracker at all');
 assert.equal((await I.handleIngest({body:JSON.stringify({v:1,t:'start',s:'PreviewPreviewPreview1',p:'/'}),headers:headersFor(DEVICES.D),store,limiter:I.createLimiter(),now:pt(D,'12:02'),vercelEnv:'preview'})).reason,'non-production');
 // Device B: 4:50 pm for 20 min (crosses UTC midnight at 5 pm PDT), page view at 4:55; then a new tab at 5:30 pm for 3 min.
 w.at(pt(D,'16:50'));const b1=w.tab(DEVICES.B);b1.open('/');b1.play(5*MIN);b1.open('/arcade');b1.play(15*MIN);b1.close();
 w.at(pt(D,'17:30'));const b2=w.tab(DEVICES.B);b2.open('/');b2.play(3*MIN);b2.close();
 // A school: 30 iPads behind one NAT open the game within 30 seconds at 1 pm, play 1 minute.
 w.at(pt(D,'13:00'));const pads=[];for(let i=0;i<30;i++){const p=w.tab(DEVICES.SCHOOL);p.open('/');pads.push(p);w.advance(1000);}
 w.advance(MIN);for(const p of pads)p.close();
 // Device C: 11:50 pm for 20 min, across Pacific midnight.
 w.at(pt(D,'23:50'));const c1=w.tab(DEVICES.C);c1.open('/');c1.play(20*MIN);
 const liveAt=new Date(SIM+MIN);c1.close();
 results.push(...await w.settle());
 assert.equal(await store.live(new Date(liveAt.getTime()-C.LIVE_WINDOW_MS).toISOString()),1,'on now: the tab that just closed at 12:10 am (its last beat)');
 // Next day: device A again, 8 am, 1 minute.
 w.at(pt('2026-10-21','08:00'));const a3=w.tab(DEVICES.A);a3.open('/');a3.play(MIN);a3.close();
 results.push(...await w.settle());
 assert.equal(results.filter(r=>r.status===429).length,0,'nothing throttled (the school burst fits)');
 assert.equal(results.filter(r=>r.reason==='bot').length,1,'the bot is refused');
 // Exactly one beat per close despite visibilitychange + pagehide; no empty beacons.
 for(const s of w.sent)if(s.body.t==='beat')assert(s.body.e>0||s.body.n>0||s.body.k,'no empty beat');
 const engagedSent=w.sent.filter(s=>s.body.t==='beat').reduce((a,s)=>a+(s.body.e||0),0);
 // Truth for Oct 20 (Pacific): visitors A, B, C, D, school = 5; sessions a1 a2 d1 b1 b2 c1 + 30 pads = 36.
 const truth={visitors:5,sessions:36,pageviews:1+1+1+2+1+1+30,bounces:1,engagedMs:5*MIN+2*MIN+5000+20*MIN+3*MIN+20*MIN+30*61_000};
 const r=await R.buildReport(store,{from:D,to:D},new Date('2026-10-22T20:00:00Z'));
 assert.equal(r.totals.visitors,truth.visitors,'unique visitors (two tabs = one; 4:50 pm and 5:30 pm = one)');
 assert.equal(r.totals.sessions,truth.sessions);assert.equal(r.totals.pageviews,truth.pageviews);
 assert.equal(Math.round(r.totals.bounceRate*truth.sessions),truth.bounces,'only the 5-second visit bounces');
 // The pads' time: 1 min after their own 1–30 s stagger. Allow the tracker's per-pad stagger exactly.
 const padMs=pads.length*MIN+[...Array(30).keys()].reduce((a,i)=>a+(29-i)*1000,0)+30*1000;
 const exact=5*MIN+2*MIN+5000+20*MIN+3*MIN+20*MIN+padMs;
 assert.equal(r.totals.engagedMs,exact,'foreground time = what the tabs were open and used, counted once');
 assert.equal(engagedSent,exact+MIN,'every engaged ms the tabs sent (plus the next day\'s minute) reached the store once');
 assert.equal(r.series.length,24);assert.equal(r.series.reduce((a,p)=>a+p.sessions,0),truth.sessions,'the hours add up to the day');
 assert.equal(r.series[16].sessions,1);assert.equal(r.series[17].sessions,1,'5:30 pm PDT is hour 17 of the Pacific day');
 assert.equal(r.overview.current.perDay.value,5);
 const next=await R.buildReport(store,{from:'2026-10-21',to:'2026-10-21'},new Date('2026-10-22T20:00:00Z'));
 assert.equal(next.totals.sessions,1,'the session that crossed Pacific midnight stays on the day it started');assert.equal(next.totals.visitors,1);
 // The same traffic on the old UTC clock splits device B across two "days" and counts it twice in total.
 const u=S.createMemoryStore(undefined,{tz:'utc'});
 // Replay the same beacons through a UTC-clock store.
 for(const s of w.sent)await I.handleIngest({body:JSON.stringify(s.body),headers:headersFor(s.dev),store:u,limiter:I.createLimiter({capacity:1e6}),now:s.at,vercelEnv:'production'});
 const ur=await R.buildReport(u,{from:'2026-10-20',to:'2026-10-21'},new Date('2026-10-22T20:00:00Z'));
 const uB=Object.values(u.data.starts).filter(s=>s.startedAt>=pt(D,'16:00').toISOString()&&s.startedAt<pt(D,'18:00').toISOString());
 assert.equal(new Set(uB.map(s=>s.visitorHash)).size,2,'UTC salts: device B before and after 5 pm PDT = two visitors');
 assert.equal(new Set(Object.values(store.data.starts).filter(s=>s.startedAt>=pt(D,'16:00').toISOString()&&s.startedAt<pt(D,'18:00').toISOString()).map(s=>s.visitorHash)).size,1,'Pacific salts: one');
 assert.equal(ur.totals.sessions,truth.sessions+1,'same sessions either way (Oct 20–21 UTC holds the next day\'s one too)');
});

// 4. Comparisons and "Players per day".
await ok('like-for-like comparisons and players per day',async()=>{
 const store=S.createMemoryStore();let n=0;
 const add=(day,hm,hash,ms=60_000,counts={})=>{const id='cmp'+String(++n).padStart(18,'0'),at=pt(day,hm);store.data.starts[id]=st(id,hash,at);store.data.beats.push(bt(id,at.getTime()+30_000,ms,0,{counts}));};
 // Yesterday (Oct 19): 2 sessions before 10 am, 3 after. Today (Oct 20) at 10 am: 3 sessions so far.
 for(const [hm,h] of [['08:00','a'],['09:00','b'],['11:00','c'],['15:00','d'],['20:00','e']])add('2026-10-19',hm,h);
 for(const [hm,h] of [['07:00','a'],['08:00','b'],['09:30','c']])add('2026-10-20',hm,h);
 const now=pt('2026-10-20','10:00');
 const today=await R.buildReport(store,{from:'2026-10-20',to:'2026-10-20'},now);
 assert.equal(today.time.compare,'exact');assert.equal(today.overview.previous.sessions,2,'yesterday up to 10 am, not all of yesterday');
 assert.equal(today.overview.current.sessions,3);assert.equal(today.overview.current.perDay.value,3);assert.equal(today.overview.previous.perDay.value,2);
 // Before (Oct 11 behaviour) this compared 3 with all 5 of yesterday: −40% instead of +50%.
 const y=await R.buildReport(store,{from:'2026-10-19',to:'2026-10-19'},now);assert.equal(y.time.compare,'none');assert.equal(y.time.partialToday,false);
 // 7 days ending today: complete days only for players per day; the period before has nothing → "since tracking began".
 for(const d of ['2026-10-15','2026-10-16','2026-10-17','2026-10-18'])for(const h of ['a','b','c','d'])add(d,'12:00',h);
 const wk=await R.buildReport(store,{from:'2026-10-14',to:'2026-10-20'},now);
 assert.equal(wk.overview.current.perDay.days,5,'Oct 15–19: the 5 tracked complete days (Oct 14 was before tracking; today is not over)');
 assert.equal(wk.overview.current.perDay.value,(4*4+5)/5);
 assert.equal(wk.overview.previous.sessions,0);
 // With tracking before the range, zero days count as zeros.
 add('2026-10-08','12:00','z');
 const wk2=await R.buildReport(store,{from:'2026-10-14',to:'2026-10-20'},now);
 assert.equal(wk2.overview.current.perDay.days,6,'Oct 14–19, the empty Oct 14 included');assert.equal(wk2.overview.previous.perDay.days,6);
 assert.equal(wk2.overview.previous.perDay.value,1/6,'the same 6 positions a week earlier');
 // A 30-day range ending today: the period before ends on Sep 20, older than the raw window; its frozen day is scaled to the
 // share of yesterday's sessions that had started by 10 am (2 of 5).
 store.data.ptRollups['2026-09-20']=C.rollupPacificDay('2026-09-20',C.deriveSessions([st('old_00000000000000001','q',pt('2026-09-20','12:00')),st('old_00000000000000002','r',pt('2026-09-20','13:00')),st('old_00000000000000003','s',pt('2026-09-20','14:00')),st('old_00000000000000004','t',pt('2026-09-20','15:00')),st('old_00000000000000005','u',pt('2026-09-20','16:00'))],[]));
 const m=await R.buildReport(store,{from:'2026-09-21',to:'2026-10-20'},now);
 assert.equal(m.time.compare,'estimated');assert.equal(m.overview.previous.sessions,5*2/5,'5 sessions × 2/5');
 // Small-number suppression survives the scaling (a scaled 2 is still "<5").
 add('2026-10-20','09:45','f',60_000,{'st:restored':1});
 const sup=await R.buildReport(store,{from:'2026-10-20',to:'2026-10-20'},now);assert.equal(sup.overview.current.steps['st:restored'],null);
 // Report wiring: the notes and labels.
 const over=read('app/admin/OverviewSection.tsx');
 assert(/same time of day/.test(over)&&/complete day/.test(over)&&/Day-7 retention \(rolling\)/.test(over)&&!/Day-2 return/.test(over),'labels say what is compared');
});

await ok('UTC stand-in days, inexact visitors, visitor-days, banners',async()=>{
 const store=S.createMemoryStore(),now=pt('2026-10-20','10:00');
 // A UTC day frozen before the migration, older than the raw window.
 store.data.rollups['2026-09-30']={...C.rollupDay('2026-09-30',C.deriveSessions([{...st('utc_00000000000000001','a',new Date('2026-09-30T12:00:00Z')),day:'2026-09-30'}],[]))};
 const r=await R.buildReport(store,{from:'2026-09-29',to:'2026-10-01'},now);
 assert.deepEqual(J(r.time.utcDays),['2026-09-30']);assert.deepEqual(J(r.series.map(p=>!!p.utcDay)),[false,true,false]);assert.equal(r.totals.sessions,1);
 // Raw days are never replaced by a UTC stand-in.
 store.data.rollups['2026-10-19']=store.data.rollups['2026-09-30'];
 const r2=await R.buildReport(store,{from:'2026-10-19',to:'2026-10-19'},now);assert.equal(r2.totals.sessions,0);assert.deepEqual(J(r2.time.utcDays),[]);
 // UTC mode (migration not run): no stand-ins, the banner flag, the old frozen days read as they are.
 const u=S.createMemoryStore(undefined,{tz:'utc'});u.data.rollups['2026-09-30']=store.data.rollups['2026-09-30'];
 const ru=await R.buildReport(u,{from:'2026-09-29',to:'2026-10-01'},now);assert.equal(ru.storage.pacific,false);assert.equal(ru.time.mode,'utc');assert.equal(ru.totals.sessions,1);
 const dash=read('app/admin/AnalyticsDashboard.tsx'),region=read('app/admin/RegionCard.tsx');
 assert(/20261012_admin_pacific_time\.sql/.test(dash)&&/OK, admin pacific time installed/.test(dash)&&/storage\?\.pacific===false/.test(dash),'the banner names the file and the OK row');
 assert(/visitor-days/.test(dash)&&/Visitor-days/.test(region),'multi-day visitor columns say visitor-days');
 assert(!/ReadingNotes|How to read these numbers/.test(dash),'no "How to read these numbers" box (removed at the user\'s request, Oct 12 2026)');
});

// 5. Save codes: the like-for-like "new codes" comparison.
await ok('save codes compare complete days',async()=>{
 const NOW=new Date('2026-10-20T18:00:00Z'),T0='2026-10-20',D=k=>C.addDays(T0,k);const saves={};let i=0;
 const code=(c,u)=>{saves[String(++i).padStart(64,'0')]={createdOn:D(c),lastUsedOn:D(u),bytes:100,rev:1};};
 for(const c of [0,0,0,-1,-2,-6,-7,-8,-13,-14])code(c,c);
 const data={saves,throttle:{}},get=async(f,t)=>M.memorySaveMetrics(data,f,t,NOW);
 const week=await get(D(-6),T0);assert.equal(week.range.created,6);assert.equal(week.range.prev_created,3,'whole-week compare: today (3 so far) vs a full day');
 const c=await M.completeDays(week,get);
 assert.deepEqual(J(c),{from:D(-6),to:D(-1),days:6,created:3,prevCreated:2},'Oct 14–19 vs Oct 8–13');
 assert.equal(await M.completeDays(await get(D(-8),D(-2)),get),null,'a range that is over needs nothing extra');
 assert.equal(await M.completeDays(await get(T0,T0),get),null,'today alone has no complete day');
 assert(/completeDays\(/.test(read('lib/saves/metrics.ts'))&&/sc\?<Delta cur=\{sc\.created\}/.test(read('app/admin/OverviewSection.tsx')),'wired into the tile');
});

// 6. The SQL.
await ok('sql',async()=>{
 const bin=n=>{for(const d of (process.env.PATH||'').split(':').concat(['/opt/homebrew/bin','/usr/local/bin','/usr/lib/postgresql/16/bin','/usr/lib/postgresql/15/bin','/usr/lib/postgresql/14/bin'])){const f=path.join(d,n);if(fs.existsSync(f))return f;}return null;};
 const initdb=bin('initdb'),pgctl=bin('pg_ctl'),psqlBin=bin('psql');
 if(process.env.SKIP_PG_TESTS||!initdb||!pgctl||!psqlBin){console.log('  SKIP sql: no local Postgres (initdb/pg_ctl/psql) found');return 'skip';}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fipgp-')),port=String(40000+(process.pid+57)%20000),quiet={stdio:['ignore','ignore','pipe']};
 try{
  cp.execFileSync(initdb,['-D',path.join(dir,'data'),'-U','postgres','--auth=trust','-E','UTF8','--locale=C'],quiet);
  cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-o',`-k ${dir} -p ${port} -c listen_addresses='' -c fsync=off -c TimeZone=UTC`,'-w','-l',path.join(dir,'log'),'start'],quiet);
  const args=['-h',dir,'-p',port,'-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-qAt'];
  const psql=(sql,{role}={})=>cp.execFileSync(psqlBin,[...args,'-c',(role?`set role ${role}; `:'')+sql],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const fails=(sql,role)=>{const r=cp.spawnSync(psqlBin,[...args,'-c',`set role ${role}; ${sql}`],{encoding:'utf8'});return r.status!==0?r.stderr:'';};
  const runFile=f=>cp.execFileSync(psqlBin,[...args,'-f',f],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split('\n').pop();
  psql('create role anon; create role authenticated; create role service_role bypassrls;');
  psql('alter default privileges in schema public grant all on tables to anon, authenticated, service_role; alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;');
  const FILE='20261012_admin_pacific_time.sql',files=fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort();
  assert(files.includes(FILE)&&files.indexOf(FILE)>files.indexOf('20261009_analytics_start.sql'),'runs after the analytics migrations');
  // PostgREST over psql: /rpc/<fn> and the frozen-day tables, as the service role. A missing function answers 404.
  const lit=v=>v===null?'null':typeof v==='number'?String(v):'$q$'+v+'$q$';
  const pgFetch=async(url,init={})=>{const u=new URL(url),p=u.pathname.replace('/rest/v1/','');
   try{
    if(p.startsWith('rpc/')){const a=JSON.parse(init.body||'{}');return new Response(psql(`select to_json(${p.slice(4)}(${Object.entries(a).map(([k,v])=>`${k} => ${lit(v)}`).join(', ')}))`,{role:'service_role'})||'null',{status:200});}
    const from=u.searchParams.getAll('day').find(x=>x.startsWith('gte.')).slice(4),to=u.searchParams.getAll('day').find(x=>x.startsWith('lte.')).slice(4);
    return new Response(psql(`select coalesce(json_agg(json_build_object('day',day,'data',data) order by day),'[]') from ${p} where day between '${from}' and '${to}'`,{role:'service_role'}),{status:200});
   }catch(e){return new Response('{}',{status:/does not exist/.test(String(e.stderr))?404:400});}};
  const before=files.filter(f=>f<FILE);
  for(const f of before)runFile(path.join('supabase/migrations',f));
  assert.equal(await S.createSupabaseStore('http://pg.local','k',pgFetch).timeMode(),'utc','before the migration: UTC days');
  const cols=psql(`select string_agg(table_name||'.'||column_name,',' order by table_name,ordinal_position) from information_schema.columns where table_schema='public' and table_name <> 'analytics_daily_pt'`);
  const procs=psql(`select string_agg(p.oid::regprocedure::text||md5(p.prosrc),',' order by 1) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public'`);
  assert.equal(runFile(path.join('supabase/migrations',FILE)),'OK, admin pacific time installed','self-check row');
  assert.equal(runFile(path.join('supabase/migrations',FILE)),'OK, admin pacific time installed','idempotent');
  assert.equal(psql(`select string_agg(table_name||'.'||column_name,',' order by table_name,ordinal_position) from information_schema.columns where table_schema='public' and table_name <> 'analytics_daily_pt'`),cols,'no existing table or column changes');
  const procsAfter=psql(`select string_agg(p.oid::regprocedure::text||md5(p.prosrc),',' order by 1) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public'`);
  assert(procs.split(',').every(x=>procsAfter.split(',').includes(x)),'every existing function is left exactly as it was');
  const sql=read(path.join('supabase/migrations',FILE)),code=sql.replace(/--.*$/gm,'');
  assert(!/\bdrop\b|\btruncate\b|\brename\b|\balter table (?!public\.analytics_daily_pt)/i.test(code),'additive: no drops, renames or changes to existing tables');
  assert(!/create or replace function public\.(analytics_day_rollup|analytics_days|analytics_hourly|analytics_finalize|analytics_ingest|analytics_salt|analytics_live|save_admin_metrics)\(/.test(code),'no existing function is replaced');
  assert.match(sql.trim().split('\n').slice(-1)[0],/\) as missing\) x;$/,'the file ends with the self-check select');
  assert.equal(psql(`select relrowsecurity from pg_class where relname='analytics_daily_pt'`),'t');assert.equal(psql(`select count(*) from pg_policies where tablename='analytics_daily_pt'`),'0');
  for(const role of ['anon','authenticated']){
   for(const fn of ["analytics_pt_days(current_date - 1, current_date)","analytics_pt_day_rollup(current_date)","analytics_pt_hourly(current_date)","analytics_window_rollup(current_date, now() - interval '1 hour', now())","analytics_pt_finalize(current_date)","analytics_pacific_version()"])
    assert.match(fails(`select ${fn}`,role),/permission denied/,role+' '+fn);
   assert.match(fails('select * from analytics_daily_pt',role),/permission denied/,role+' table');
  }
  // A self-check that fails loudly; re-running repairs.
  psql('drop function public.analytics_pt_finalize(date)');
  assert.match(psql(sql.slice(sql.lastIndexOf('select case when missing'))),/^NOT INSTALLED: analytics_pt_finalize$/);
  assert.equal(runFile(path.join('supabase/migrations',FILE)),'OK, admin pacific time installed','re-running repairs it');
  // SQL = TypeScript on the DST fixture (Nov 1: 25 h, Mar 8: 23 h, an inexact day).
  const q=v=>v===null||v===undefined?'null':`'${String(v).replace(/'/g,"''")}'`;
  const insert=(starts,beats)=>{
   psql('insert into analytics_sessions (id,day,visitor_hash,started_at,entry_path,country,region,device,source,referrer_host,utm_source,utm_medium,utm_campaign,flags) values '+
    starts.map(s=>`(${[s.id,s.day,s.visitorHash,s.startedAt,s.entryPath,s.country,s.region,s.device,s.source,s.referrerHost,s.utmSource,s.utmMedium,s.utmCampaign,JSON.stringify(s.flags||{})].map(q).join(',')})`).join(','));
   if(beats.length)psql('insert into analytics_beats (session_id,ts,engaged_ms,pageviews,area_ms,place_ms,activity_ms,cells,counts) values '+beats.map(b=>`(${[b.sessionId,b.ts].map(q).join(',')},${b.engagedMs},${b.pageviews},${[b.areaMs,b.placeMs,b.activityMs,b.cells,b.counts].map(x=>q(JSON.stringify(x||{}))).join(',')})`).join(','));
  };
  insert(DST_STARTS,DST_BEATS);
  const sessions=C.deriveSessions(DST_STARTS,DST_BEATS);
  for(const day of ['2026-11-01','2026-11-02','2026-03-08','2026-03-07','2026-10-31']){
   assert.deepEqual(JSON.parse(psql(`select analytics_pt_day_rollup('${day}')`,{role:'service_role'})),J(C.rollupPacificDay(day,sessions)),'SQL Pacific day = TypeScript: '+day);
   assert.deepEqual(JSON.parse(psql(`select analytics_pt_hourly('${day}')`,{role:'service_role'})),J(C.hourlySeries(day,DST_STARTS,DST_BEATS,'pacific')),'SQL Pacific hours = TypeScript: '+day);
  }
  assert.equal(JSON.parse(psql(`select analytics_pt_hourly('2026-11-01')`,{role:'service_role'})).length,25);assert.equal(JSON.parse(psql(`select analytics_pt_hourly('2026-03-08')`,{role:'service_role'})).length,23);
  const lo='2026-11-01T07:00:00.000Z',hi='2026-11-01T09:00:00.000Z';
  assert.deepEqual(JSON.parse(psql(`select analytics_window_rollup('2026-11-01','${lo}','${hi}')`,{role:'service_role'})),J(C.rollupPacificDay('2026-11-01',sessions,Date.parse(lo),Date.parse(hi))),'SQL part-day window = TypeScript');
  // Live days, the whole report and the nightly finalize, relative to now (the functions read now()).
  const NOW=new Date(),today=C.pacificDay(NOW),dayAt=(k,h)=>new Date(C.dayStartMs(C.addDays(today,k))+h*H);
  const LS=[],LB=[];let n=0;
  const live=(k,h,hash,ms,extra={})=>{const id='live'+String(++n).padStart(17,'0'),at=dayAt(k,h);LS.push({...st(id,hash,at),...extra});if(ms)LB.push(bt(id,at.getTime()+60_000,ms,1,{counts:{'st:view':1}}));};
  for(let k=-16;k<=0;k++)for(let j=0;j<(k%3===0?6:2);j++)live(k,Math.min(23,1+j*3),String.fromCharCode(97+j),j===0?0:45_000*j);
  live(-1,17.5,'7',30_000,{day:C.addDays(today,0)});// a row salted for another day (the UTC way): yesterday is inexact
  live(0,0.01,'8',0);
  insert(LS,LB);
  const sb=S.createSupabaseStore('http://pg.local','service-key',pgFetch);
  assert.equal(await sb.timeMode(),'pacific','after the migration: Pacific days');
  const mem=S.createMemoryStore();for(const s of [...DST_STARTS,...LS])mem.data.starts[s.id]=s;mem.data.beats.push(...DST_BEATS,...LB);
  assert.deepEqual(J(await sb.computeDays(C.addDays(today,-30),today,NOW)),J(await mem.computeDays(C.addDays(today,-30),today,NOW)),'live Pacific days: SQL = memory (clamped to the last 14)');
  assert.equal((await sb.computeDays(C.addDays(today,-30),today,NOW))[0].day,C.addDays(today,-13));
  for(const range of [{from:today,to:today},{from:C.addDays(today,-1),to:C.addDays(today,-1)},{from:C.addDays(today,-6),to:today},{from:C.addDays(today,-29),to:today}]){
   const a=J(await R.buildReport(sb,range,NOW)),b=J(await R.buildReport(mem,range,NOW));
   for(const k of ['totals','series','dims','time','overview','storage','learning','start'])assert.deepEqual(a[k],b[k],`report through Supabase = memory: ${range.from}…${range.to} ${k}`);
  }
  const yRep=await R.buildReport(sb,{from:C.addDays(today,-1),to:C.addDays(today,-1)},NOW);assert.deepEqual(J(yRep.time.inexactVisitorDays),[C.addDays(today,-1)]);
  // Finalize: freezes final days (= the live rollup), purges raw rows before the Pacific day 14 days ago and old salts.
  psql(`insert into analytics_salts values ('${C.addDays(today,-1)}','x'),('${today}','y') on conflict (day) do nothing`);
  const want=J((await sb.computeDays(C.addDays(today,-13),C.addDays(today,-2),NOW)));
  const frozen=J(await sb.finalize(NOW)).frozen;
  const finalDays=C.dayList(C.addDays(today,-13),C.addDays(today,-1)).filter(d=>S.isFinal(d,NOW));
  assert.deepEqual(frozen,J(finalDays),'final days frozen');assert(frozen.includes(C.addDays(today,-2))===S.isFinal(C.addDays(today,-2),NOW));
  for(const r of want.filter(r=>frozen.includes(r.day)))assert.deepEqual(J((await sb.rollups(r.day,r.day))[0]),r,'frozen = live: '+r.day);
  assert.equal(psql(`select count(*) from analytics_sessions where started_at < '${new Date(C.dayStartMs(C.addDays(today,-14))).toISOString()}'`),'0','raw rows before the Pacific day 14 days ago are purged');
  assert(Number(psql(`select count(*) from analytics_sessions where started_at >= '${new Date(C.dayStartMs(C.addDays(today,-14))).toISOString()}'`))>0,'the rest stay');
  assert.equal(psql(`select string_agg(day::text,',') from analytics_salts`),today,'only the Pacific today\'s salt is left');
  assert.deepEqual(J(await sb.finalize(NOW)).frozen,[],'idempotent');
  // An old UTC-frozen day reads as a stand-in through the Supabase store too.
  psql(`insert into analytics_daily (day,data) values ('${C.addDays(today,-40)}', analytics_day_rollup('${C.addDays(today,-40)}'))`);
  const old=await R.buildReport(sb,{from:C.addDays(today,-41),to:C.addDays(today,-39)},NOW);assert.deepEqual(J(old.time.utcDays),[C.addDays(today,-40)]);
  // The other migrations still pass their own self-checks after this one.
  assert.equal(runFile('supabase/migrations/20261011_admin_save_metrics.sql'),'OK, admin save metrics installed');
 }finally{
  try{cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-m','immediate','-w','stop'],quiet);}catch{}
  fs.rmSync(dir,{recursive:true,force:true});
 }
});

console.log(`admin-analytics-pacific: ${passed} groups passed${skipped.length?`, skipped: ${skipped.join(', ')}`:''}`);
})().catch(e=>{console.error(e);process.exit(1);});
