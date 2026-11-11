#!/usr/bin/env node
// The daily data layer and the comprehensive export (Nov 6 2026): lib/analytics/daily.ts, exportCsv.ts, zip.ts,
// dailyAdmin.ts, app/api/admin/export/route.ts and the Overview's export control.
//  1. coverage: every counter id in countIds.ts is a daily series (or a documented "not exported" family), every id has an
//     introduction day (countSince.generated.ts), every Overview card is a series;
//  2. the audit's synthetic dataset (13 Pacific days, DST, 00:05 / 23:55 sessions; docs/analytics-audit-2026-11-06.md): daily
//     totals = the report's totals = an independent recount;
//  3. Pacific day boundaries (00:05, 23:55, the Nov 1 DST change), partial today, trackedSince nulls, previous periods, weeks;
//  4. the CSVs parse, carry exact counts (no "<"), the ZIP is valid, the route is admin-only, the UI control is wired.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),os=require('os'),cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const read=f=>fs.readFileSync(f,'utf8');
const loaded=new Map();
function resolve(from,id){const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);
 for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;throw Error('cannot resolve '+id+' from '+from);}
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);
 if(file.endsWith('.json')){const v={default:JSON.parse(read(file))};loaded.set(file,v);return v;}
 const m={exports:{}};loaded.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(read(file),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Buffer,URL,URLSearchParams,TextEncoder,TextDecoder,DataView,ArrayBuffer,Uint8Array,Uint32Array,Date,Math,JSON,Promise,Intl,process:{env:{}},console,
   require:id=>id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id)});
 loaded.set(file,m.exports);return m.exports;}
const C=load('lib/analytics/core.ts'),S=load('lib/analytics/store.ts'),R=load('lib/analytics/report.ts'),K=load('lib/analytics/countIds.ts'),
 D=load('lib/analytics/daily.ts'),X=load('lib/analytics/exportCsv.ts'),Z=load('lib/analytics/zip.ts'),DA=load('lib/analytics/dailyAdmin.ts'),SP=load('lib/analytics/sponsor.ts'),
 CS=load('lib/analytics/countSince.generated.ts');
let passed=0;const ok=(name,fn)=>Promise.resolve().then(fn).then(()=>{passed++;},e=>{console.error('FAIL',name);throw e;});
const J=x=>JSON.parse(JSON.stringify(x));
/** deepEqual across the vm realm (arrays made inside the loaded modules have another Array prototype). */
const deq=(a,b,m)=>assert.deepStrictEqual(J(a),J(b),m);
/** A tiny RFC 4180 parser (quotes, doubled quotes, commas and newlines inside quotes). */
function parseCsv(text){const rows=[];let row=[],f='',q=false;for(let i=0;i<text.length;i++){const ch=text[i];
 if(q){if(ch==='"'){if(text[i+1]==='"'){f+='"';i++;}else q=false;}else f+=ch;}
 else if(ch==='"')q=true;else if(ch===','){row.push(f);f='';}else if(ch==='\n'){row.push(f);rows.push(row);row=[];f='';}else f+=ch;}
 if(f||row.length){row.push(f);rows.push(row);}return rows;}
const emptyRoll=day=>C.rollupDay(day,[]);
/** A rollup for `day` with `sessions` sessions, `visitors` visitors and counters. */
function roll(day,{sessions=0,visitors=0,engagedMs=0,counts={},countSessions}={}){const r=emptyRoll(day);r.sessions=sessions;r.visitors=visitors;r.engagedMs=engagedMs;r.counts={...counts};r.countSessions=countSessions?{...countSessions}:Object.fromEntries(Object.keys(counts).map(k=>[k,1]));return r;}

// ---- the synthetic dataset (the audit's seed.cjs, inline: deterministic, ground truth by plain loops) --------------------------
function seedStore(nowMs){
 let seed=20261106;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};const pick=a=>a[Math.floor(rnd()*a.length)];
 const dayStart=d=>Date.parse(d+'T00:00:00Z')+(d<'2026-11-01'?7:d==='2026-11-01'?7:8)*3600e3;
 const days=[];for(let t=Date.parse('2026-10-25T00:00:00Z');t<=Date.parse('2026-11-06T00:00:00Z');t+=86400e3)days.push(new Date(t).toISOString().slice(0,10));
 const starts={},beats=[],truth={days:{},counts:{},countSessions:{},sessions:0,engagedMs:0};let sid=0;const id=()=>('audit'+String(++sid).padStart(12,'0')).slice(0,20);
 const LM=['7v7','futsal','9v9','11v11','beach'];
 for(const day of days){const lo=dayStart(day),hi=dayStart(days[days.indexOf(day)+1]||'2026-11-07');const nVis=8+Math.floor(rnd()*10),visitors=new Set();let sessions=0,eng=0;
  for(let v=0;v<nVis;v++){const vh='vh_'+day+'_'+v,ns=1+Math.floor(rnd()*3);
   for(let k=0;k<ns;k++){let t=lo+Math.floor(rnd()*(hi-lo-2*3600e3));if(v===0&&k===0)t=lo+5*60e3;if(v===1&&k===0)t=hi-5*60e3;if(t>=nowMs-60e3)continue;
    const s=id(),engaged=1000*Math.floor(5+rnd()*600);
    starts[s]={id:s,day,visitorHash:vh,startedAt:new Date(t).toISOString(),entryPath:'/play',country:pick(['US','US','GB','CA']),region:'CA',device:pick(['phone','desktop','tablet']),
     source:'direct',referrerHost:null,utmSource:null,utmMedium:null,utmCampaign:null,flags:{},returning:rnd()<.4,hasCode:rnd()<.5,playerId:'p'+v};
    const c={};const add=(key,n=1)=>{c[key]=(c[key]||0)+n;};
    if(rnd()<.3)add('en:game_'+pick(['live','runner','tennis','pinball','puzzle']));if(rnd()<.1)add('su:kick_play');
    if(rnd()<.4)add('en:card_'+pick(['ball','npc','quiz','explore','pack','starter']),1+Math.floor(rnd()*3));
    if(rnd()<.3)add('ls:learn7_roles');if(rnd()<.25)add('le:learn7_roles');if(rnd()<.1)add('en:film_end');if(rnd()<.05)add('tu:finish');
    if(rnd()<.3){add('em:pick');add('em:reach_1');add('em:e'+pick([1,2,3,61,21,31,41,51,52,53]));}
    if(rnd()<.2){add('mp:in');add('mp:min',1+Math.floor(rnd()*8));}
    if(day>='2026-11-05'&&rnd()<.5){const f=pick(LM);add(`lm:${f}_visit`);if(rnd()<.7){add(`lm:${f}_join`);add('lm:reach_1');add(`lm:${f}_role_mid`);add(`lm:${f}_leave`);add(`lm:${f}_min`,2);add(`lm:${f}_sec`,30);add(`lm:${f}_len_3m`);add(`lm:${f}_with_0`);add(`lm:${f}_end_leave`);}}
    if(rnd()<.15){add('mm:view');add('mm:min',1);add('mm:sec10',2);add('mm:sec1',3);add('mm:t_60_180');add('mm:g_us_ca');add('mm:gm_us_ca',1);add('mm:gx_us_ca',2);add('mm:h_4_10');}
    const half=Math.floor(engaged/2),keys=Object.keys(c),c1={},c2={};keys.forEach((key,i)=>{(i%2?c2:c1)[key]=c[key];});
    beats.push({sessionId:s,ts:new Date(t+half+1000).toISOString(),engagedMs:half,pageviews:0,areaMs:{island:half},counts:c1});
    beats.push({sessionId:s,ts:new Date(t+engaged+2000).toISOString(),engagedMs:engaged-half,pageviews:0,areaMs:{island:engaged-half},counts:c2});
    sessions++;eng+=engaged;visitors.add(vh);
    for(const [key,n] of Object.entries(c)){truth.counts[key]=(truth.counts[key]||0)+n;truth.countSessions[key]=(truth.countSessions[key]||0)+1;}}}
  truth.days[day]={sessions,visitors:visitors.size,engagedMs:eng};truth.sessions+=sessions;truth.engagedMs+=eng;}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fi-daily-')),file=path.join(dir,'store.json');
 fs.writeFileSync(file,JSON.stringify({salts:{},starts,beats,rollups:{},ptRollups:{}}));
 return {file,dir,days,truth};
}

(async()=>{
// 1. Coverage ----------------------------------------------------------------------------------------------------------------
const empty=D.buildDailyLayer({rollups:[emptyRoll('2026-11-05'),emptyRoll('2026-11-06')],from:'2026-11-05',to:'2026-11-06',today:'2026-11-06'});
await ok('every counter id in countIds.ts is a daily series (or a documented not-exported family)',()=>{
 const keys=new Set(empty.series.map(s=>s.key));
 const missing=K.FIXED_COUNT_IDS.filter(id=>!keys.has(`counters.${id}.total`)||!keys.has(`counters.${id}.sessions`));
 deq(missing,[],'counter ids without a daily series');
 // Ids the allowlist accepts by shape (not in FIXED_COUNT_IDS): each must belong to a dynamic family that is exported or listed as not exported.
 const lesson=K.lessonsOf('7v7')[0];
 for(const id of [`lo:${lesson}`,`le:${lesson}`,`ls:${lesson}`,`lf:${lesson}`,`la:${lesson}`,`q:${lesson}:0`,`o:${lesson}:0:0`,'en:cardn_12']){
  assert(K.isCountId(id),id+' is a counter id');const fam=D.DYNAMIC_FAMILIES.find(f=>f.re.test(id));assert(fam,id+' belongs to a dynamic family');
  assert(fam.exported||D.NOT_EXPORTED.some(n=>n.family===fam.family),fam.family+' is exported or documented as not exported');}
 // Nothing else: an id the allowlist accepts that is neither fixed nor in a family would be invisible.
 for(const id of ['xx:new_thing','fi:not_a_counter'])assert(!K.isCountId(id));
 deq(empty.notExported.map(n=>n.family),D.NOT_EXPORTED.map(n=>n.family));
});
await ok('every counter id has an introduction day (re-run scripts/gen-count-since.cjs after adding counters)',()=>{
 const intro=new Set(Object.values(CS.COUNT_SINCE).flat());
 deq(K.FIXED_COUNT_IDS.filter(id=>!intro.has(id)),[],'run: node scripts/gen-count-since.cjs');
 for(const [id,day] of [['fi:start','2026-11-06'],['fi:land','2026-10-15'],['lm:7v7_join','2026-11-05'],['mm:view','2026-11-05'],['mk:view','2026-11-03'],['en:game_live','2026-10-20'],['mp:min','2026-10-22']])
  assert.equal(D.introducedOn(id),day,id);
 assert.equal(D.introducedOn('le:learn7_roles'),'2026-10-08');assert.equal(D.introducedOn('en:cardn_7'),'2026-10-20');assert.equal(D.introducedOn('zz:nope'),null);
});
await ok('every Overview card and its parts, the where-time-goes areas and the live-match formats are series',()=>{
 const keys=new Set(empty.series.map(s=>s.key));
 for(const d of SP.SPONSOR_DEFS){assert(keys.has('engagement.'+d.id),d.id);if(d.parts.length>1)for(const p of d.parts)assert(keys.has(`engagement.${d.id}.${p.key}`),d.id+'.'+p.key);}
 assert(keys.has('engagement.emotes.walk'),'walking / running emotes (audit fix 2)');
 for(const p of ['island','matches','fishing','arcade','learning','friends'])assert(keys.has('time.where_time_goes.'+p),p);
 for(const a of C.AREAS)assert(keys.has('time.area_minutes.'+a),a);
 for(const f of [...K.LIVE_MATCH_FORMATS,'all'])for(const m of ['pitch_visits','joins','leaves','match_seconds','players'])assert(keys.has(`live_matches.${m}.${f}`),m+f);
 for(const st of ['start','cast','bite','hook_spin','land'])assert(keys.has('fishing.funnel_sessions.'+st)&&keys.has('fishing.funnel_events.'+st),st);
 for(const k of ['audience.players_per_day','audience.sessions','audience.avg_session_minutes','audience.session_minutes','audience.minutes_per_player','kit.designs_saved.jersey','kit.purchases.boots','marketing.investor_visits','marketing.tour_views','learning.first_try.right'])assert(keys.has(k),k);
 assert(empty.gaps.some(g=>/D30/.test(g.metric))&&empty.gaps.some(g=>/goals/.test(g.metric))&&empty.gaps.some(g=>/Returning/.test(g.metric)),'tracking gaps listed');
});

// 2. The synthetic dataset: daily totals = report totals = truth --------------------------------------------------------------
const NOW=new Date('2026-11-06T20:00:00Z');// 12:00 Pacific
const syn=seedStore(NOW.getTime());let layer,report;
try{
 const store=S.createMemoryStore(syn.file),range={from:'2026-10-25',to:'2026-11-06'};
 report=await R.buildReport(store,range,NOW);
 ({layer}=await DA.loadDailyLayer(store,range,NOW,{people:false}));
}finally{fs.rmSync(syn.dir,{recursive:true,force:true});}
const T=k=>{const s=D.seriesByKey(layer,k);assert(s,'series '+k);return D.totalOf(s).value;};
const sum=re=>Object.entries(syn.truth.counts).reduce((a,[k,v])=>re.test(k)?a+v:a,0);
await ok('synthetic: daily totals equal the report (Overview, Live matches, Investor page) and the independent recount',()=>{
 const sp=report.sponsor,m=id=>sp.metrics.find(x=>x.id===id).total;
 assert.equal(T('audience.sessions'),report.totals.sessions);assert.equal(T('audience.sessions'),syn.truth.sessions);
 const complete=syn.days.filter(d=>d!=='2026-11-06'),perDay=complete.reduce((a,d)=>a+syn.truth.days[d].visitors,0)/complete.length;
 assert.equal(T('audience.players_per_day'),sp.kpis.perDay,'players per day = the Overview tile (audit fix 1)');assert(Math.abs(T('audience.players_per_day')-perDay)<1e-9);
 assert.equal(T('audience.players_per_day'),report.overview.current.perDay.value,'= the Players tab');
 assert(Math.abs(T('audience.avg_session_minutes')*60000-sp.kpis.avgSessionMs)<1e-6);assert(Math.abs(T('audience.session_minutes')-syn.truth.engagedMs/60000)<1e-9);
 for(const [id,re] of [['games',/^(en:game_|su:kick_play$)/],['cards',/^en:card_/],['watched',/^(le:|en:film_end$|tu:finish$)/],['quizzes',/^ls:/],['social',/^mp:min$/],['emotes',/^em:e\d+$/]]){
  assert.equal(T('engagement.'+id),m(id),id+' = the Overview card');assert.equal(T('engagement.'+id),sum(re),id+' = truth');}
 assert.equal(T('engagement.emotes'),sum(/^em:pick$/),'emotes = em:pick (walking included)');assert.equal(T('engagement.emotes.walk'),sum(/^em:e5\d$/));
 const lm=report.liveMatches.totals;
 assert.equal(T('live_matches.joins.all'),lm.joins);assert.equal(T('live_matches.pitch_visits.all'),lm.visits);assert.equal(T('live_matches.players.all'),lm.players);
 assert.equal(Math.round(T('live_matches.match_seconds.all')/60),lm.minutes);assert.equal(T('live_matches.joins.all'),sum(/^lm:.*_join$/));
 assert.equal(T('marketing.investor_visits'),report.marketingVisits.views);assert.equal(Math.round(T('marketing.investor_avg_stay_seconds')),report.marketingVisits.avgSec);
 assert.equal(T('marketing.investor_visits_by_place.us_ca'),sum(/^mm:g_us_ca$/));
 assert(Math.abs(T('time.area_minutes.island')*60000-report.areas.find(a=>a.area==='island').ms)<1e-6);
 // Every raw counter: its total = truth, its sessions = truth.
 for(const [id,n] of Object.entries(syn.truth.counts)){const s=D.seriesByKey(layer,`counters.${id}.total`);if(!s)continue;assert.equal(D.totalOf(s).value,n,id);assert.equal(D.totalOf(D.seriesByKey(layer,`counters.${id}.sessions`)).value,syn.truth.countSessions[id],id+' sessions');}
 // Per day = truth.
 const ses=D.seriesByKey(layer,'audience.sessions');for(const p of ses.points)assert.equal(p.value,syn.truth.days[p.day].sessions,p.day);
});
await ok('synthetic: hours of the day sum to the sessions; the investor grid to the visits',()=>{
 assert.equal(layer.hours.sessions.status,'ok');assert.equal(layer.hours.sessions.hours.reduce((a,h)=>a+h.sessions,0),T('audience.sessions'));
 assert.equal(layer.hours.investor.total,sum(/^mm:h_/));assert.equal(layer.hours.investor.grid[4][10],sum(/^mm:h_4_10$/));
});

// 3. Pacific days, partial today, trackedSince, previous periods, weeks ----------------------------------------------------------
await ok('Pacific day boundaries: 00:05 and 23:55, and the Nov 1 DST change (25 hours)',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fi-daily-pt-')),file=path.join(dir,'s.json');
 // UTC instants written out by hand (PDT = UTC-7 until 2 am Nov 1, then PST = UTC-8): not computed by the code under test.
 const at=[['a','2026-10-31T07:05:00Z','2026-10-31'],['b','2026-11-01T06:55:00Z','2026-10-31'],['c','2026-11-01T07:05:00Z','2026-11-01'],
  ['d','2026-11-01T08:30:00Z','2026-11-01'],/* 1:30 am PDT */['e','2026-11-01T09:30:00Z','2026-11-01'],/* 1:30 am PST, the repeated hour (clocks went back at 09:00Z) */
  ['f','2026-11-02T07:55:00Z','2026-11-01'],/* 23:55 PST */['g','2026-11-02T08:05:00Z','2026-11-02']];
 const starts={},beats=[];
 for(const [id,iso,day] of at){const sid=('pt'+id).padEnd(20,'0');starts[sid]={id:sid,day,visitorHash:'v'+id,startedAt:iso,entryPath:'/play',country:'US',region:'CA',device:'phone',source:'direct',referrerHost:null,utmSource:null,utmMedium:null,utmCampaign:null,flags:{}};
  beats.push({sessionId:sid,ts:new Date(Date.parse(iso)+60000).toISOString(),engagedMs:60000,pageviews:0,areaMs:{island:60000},counts:{'em:pick':1}});}
 fs.writeFileSync(file,JSON.stringify({salts:{},starts,beats,rollups:{},ptRollups:{}}));
 try{const store=S.createMemoryStore(file),now=new Date('2026-11-03T20:00:00Z');
  const {layer:L}=await DA.loadDailyLayer(store,{from:'2026-10-31',to:'2026-11-02'},now,{people:false});
  deq(J(D.seriesByKey(L,'audience.sessions').points).map(p=>[p.day,p.value]),[['2026-10-31',2],['2026-11-01',4],['2026-11-02',1]]);
  deq(D.seriesByKey(L,'counters.em:pick.total').points.map(p=>p.value),[2,4,1]);
  assert.equal(C.hoursInDay('2026-11-01'),25);
  const h=L.hours.sessions.hours;assert.equal(h[1].sessions,2,'both 1:30 am sessions (PDT and PST) are hour 1');assert.equal(h[0].sessions,3,'00:05 on Oct 31, Nov 1 and Nov 2');assert.equal(h[23].sessions,2);
  assert.equal(L.partialDay,null,'a range that ended yesterday has no partial day');assert(L.series.every(s=>s.points.every(p=>!p.partial)));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
await ok('partial today: flagged, kept in sums, left out of averages and comparisons',()=>{
 const days=C.dayList('2026-10-30','2026-11-06');
 const rolls=days.map((d,i)=>roll(d,{sessions:10,visitors:i===days.length-1?2:10,engagedMs:600000,counts:{'em:pick':3}}));
 const L=D.buildDailyLayer({rollups:rolls,from:'2026-11-03',to:'2026-11-06',today:'2026-11-06'});
 assert.equal(L.partialDay,'2026-11-06');
 const pl=D.seriesByKey(L,'audience.players_per_day');deq(J(pl.points).map(p=>!!p.partial),[false,false,false,true]);
 assert.equal(D.totalOf(pl).value,10,'average of complete days: today (2 so far) left out');
 assert.equal(D.totalOf(D.seriesByKey(L,'audience.sessions')).value,40,'sums include today so far');
 const pp=D.previousPeriod(D.seriesByKey(L,'audience.sessions'),'2026-11-03','2026-11-06','2026-11-06');
 assert.equal(pp.status,'ok');deq([pp.from,pp.to,pp.curFrom,pp.curTo,pp.value,pp.current,pp.change],['2026-10-31','2026-11-02','2026-11-03','2026-11-05',30,30,0],'3 complete days vs the 3 before');
 const avg=D.seriesByKey(L,'audience.avg_session_minutes');assert.equal(D.totalOf(avg).value,1,'ratio: Σ ms ÷ Σ sessions, in minutes');
});
await ok('trackedSince: earlier days are null (never 0), introduction vs first data, previous period not tracked',()=>{
 const days=C.dayList('2026-10-07','2026-11-06');
 const rolls=days.map(d=>roll(d,{sessions:5,visitors:5,counts:d>='2026-11-06'?{'fi:start':4}:d>='2026-10-20'?{'en:game_live':1}:{}}));
 rolls[0].sessions=0;rolls[0].visitors=0;// the first day had no session: audience series start Oct 8
 // a counter that has data BEFORE its commit day (the build ran before the commit): first data wins
 rolls.find(r=>r.day==='2026-11-04').counts['lm:7v7_join']=2;rolls.find(r=>r.day==='2026-11-04').countSessions['lm:7v7_join']=1;
 // a day frozen before counters existed: null even inside the tracked span
 delete rolls.find(r=>r.day==='2026-10-25').counts;
 const L=D.buildDailyLayer({rollups:rolls,from:'2026-10-30',to:'2026-11-06',today:'2026-11-06'});
 const fi=D.seriesByKey(L,'counters.fi:start.total');
 assert.equal(fi.trackedSince,'2026-11-06');assert.equal(fi.sinceFrom,'introduced');
 deq(fi.points.map(p=>p.value),[null,null,null,null,null,null,null,4],'not tracked before Nov 6: null, never 0');
 const pf=D.previousPeriod(fi,'2026-11-06','2026-11-06','2026-11-06');assert.equal(pf.status,'not-tracked');assert.equal(pf.trackedSince,'2026-11-06');
 const lm=D.seriesByKey(L,'counters.lm:7v7_join.total');assert.equal(lm.trackedSince,'2026-11-04');assert.equal(lm.sinceFrom,'first-data');
 deq(lm.points.map(p=>p.value),[null,null,null,null,null,2,0,0]);
 const g=D.seriesByKey(L,'counters.en:game_live.total');assert.equal(g.trackedSince,'2026-10-20');assert.equal(g.prior.find(p=>p.day==='2026-10-25').value,null,'a frozen day without counters is null');
 assert.equal(g.prior.find(p=>p.day==='2026-10-22').value,1);
 const pg=D.previousPeriod(g,'2026-10-30','2026-11-06','2026-11-06');assert.equal(pg.status,'not-tracked','the previous 7 days include the frozen day without counters');
 const ses=D.seriesByKey(L,'audience.sessions');assert.equal(ses.trackedSince,'2026-10-08');assert.equal(ses.sinceFrom,'first-session');
 assert.equal(D.previousPeriod(ses,'2026-10-08','2026-10-10','2026-11-06').status,'not-tracked','nothing before the first session');
 assert.equal(D.previousPeriod(ses,'2026-10-30','2026-11-06','2026-11-06').status,'ok');
 const gamesTotal=D.seriesByKey(L,'engagement.games');assert.equal(gamesTotal.trackedSince,'2026-10-14');assert.equal(gamesTotal.fullSince,'2026-11-10','Summit Kick from Oct 14, arcade games from Oct 20, Squad Snake (the sixth cabinet, en:game_snake) from Nov 10 2026');
 // weeks: Mon Nov 2 – Sun Nov 8 holds Nov 2..6 (5 days, partial)
 const wk=D.weekly(ses);deq(J(wk).map(w=>[w.week,w.days,w.value,w.complete,w.partial]),[['2026-10-26',3,15,false,false],['2026-11-02',5,25,false,true]]);
 const wd=D.byWeekday(ses);assert.equal(wd.length,7);assert.equal(wd[5].label,'Fri');assert.equal(wd[5].days,1,'Fri Oct 30 (today, Fri Nov 6, is partial and left out)');assert.equal(wd[5].value,5);
});

// 4. The CSVs, the ZIP, the route and the UI ----------------------------------------------------------------------------------
await ok('daily CSV: tidy columns, parses, exact counts (no "<"), equals the layer',()=>{
 const text=X.dailyCsv(layer),rows=parseCsv(text);
 deq(rows[0],['date','section','metric','part','value','unit','tracked_since','partial_day']);
 assert(!text.includes('<'),'no masking');assert(rows.slice(1).every(r=>r.length===8),'8 columns everywhere');
 const v=(sec,met,part)=>rows.filter(r=>r[1]===sec&&r[2]===met&&r[3]===part);
 const ses=v('audience','sessions','');assert.equal(ses.length,13);assert.equal(ses.reduce((a,r)=>a+Number(r[4]),0),syn.truth.sessions);
 deq(ses.map(r=>r[7]),[...Array(12).fill('false'),'true'],'today is the partial day');
 const one=v('counters','tu:finish','total');assert.equal(one.reduce((a,r)=>a+Number(r[4]),0),sum(/^tu:finish$/),'small counts are exact');
 assert(one.some(r=>r[4]==='1')||one.some(r=>Number(r[4])>0&&Number(r[4])<5),'a value under 5 is printed as it is');
 assert.equal(v('counters','fi:start','total').length,0,'a counter with no data in the range is not listed (Definitions lists it)');
 assert.equal(v('engagement','emotes','walk').reduce((a,r)=>a+Number(r[4]),0),sum(/^em:e5\d$/));
});
await ok('definitions CSV: every series, how it is counted, source, tracked since; gaps and not-exported families',()=>{
 const rows=parseCsv(X.definitionsCsv(layer)),head=rows[0];
 for(const c of ['metric','how_counted','window','source','tracked_since'])assert(head.includes(c),c);
 const keys=new Set(rows.map(r=>r[3]));for(const s of layer.series)assert(keys.has(s.key),s.key);
 assert(rows.some(r=>r[0]==='tracking_gap'&&/D30/.test(r[1])));assert(rows.some(r=>r[0]==='not_exported'&&/^q:/.test(r[1])));
 assert(rows.find(r=>r[3]==='counters.fi:start.total')[13].startsWith('no'),'listed in Definitions even with no rows');
});
await ok('summary CSV: exact totals, labelled windows, "not tracked before" instead of a zero previous period',()=>{
 const text=X.summaryCsv(layer,{playersDistinct:42,returningShare:0.375,medianSessionMs:null}),rows=parseCsv(text);
 assert(!/<5/.test(text),'no <5');
 const r=label=>rows.find(x=>x[0]===label&&x[1]==='');
 assert.equal(r('Sessions')[2],String(syn.truth.sessions));assert.equal(r('Games played')[2],String(sum(/^(en:game_|su:kick_play$)/)));
 assert.equal(r('Players per day (average of daily unique visitors, complete days)')[2],report.sponsor.kpis.perDay.toFixed(2));
 assert.equal(r('Sessions')[5],'not tracked before 2026-10-25','no previous period before the first session (audit fix 3)');
 assert.equal(r('Sessions')[6],'');assert.equal(r('Sessions')[7],'');
 assert.match(r('Players (distinct player ids: save code, else device)')[4],/last 14 days/);assert.equal(r('Players (distinct player ids: save code, else device)')[2],'42');
 assert.equal(r('Returning sessions (share of sessions with the mark)')[2],'37.5%');
 const lm=rows.find(x=>x[0]==='Matches joined'&&x[1]==='all formats');assert.match(lm[4],/^2026-11-05 to 2026-11-06 \(not tracked before 2026-11-05\)/);
 assert.match(rows[0][3],/today/);
 // The Overview's old client-side CSV still works (unchanged format).
 assert.match(SP.sponsorCsv(report.sponsor),/^Futbol Island engagement,2026-10-25 to 2026-11-06/);
});
await ok('ZIP: valid stored archive (CRC-32, central directory), opens with unzip',()=>{
 assert.equal(Z.crc32(new TextEncoder().encode('123456789')),0xcbf43926,'CRC-32 check value');
 const files=[{name:'a.csv',text:'x,y\n1,2\n'},{name:'b.csv',text:'é,ü\n'}],zip=Z.storeZip(files,new Date('2026-11-06T12:00:00'));
 assert.equal(Buffer.from(zip.slice(0,4)).readUInt32LE(0),0x04034b50);assert.equal(Buffer.from(zip.slice(-22,-18)).readUInt32LE(0),0x06054b50);
 const unzip=['/usr/bin/unzip','/opt/homebrew/bin/unzip'].find(f=>fs.existsSync(f));
 if(unzip){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fi-zip-')),f=path.join(dir,'t.zip');fs.writeFileSync(f,zip);
  try{assert.match(cp.execFileSync(unzip,['-t',f],{encoding:'utf8'}),/No errors detected/);assert.equal(cp.execFileSync(unzip,['-p',f,'b.csv'],{encoding:'utf8'}),'é,ü\n');}finally{fs.rmSync(dir,{recursive:true,force:true});}}
});
await ok('the route is admin-only and read-only; the Overview has the export control',()=>{
 const route=read('app/api/admin/export/route.ts');
 assert.match(route,/verifySession\(cookies\(\)\.get\(ADMIN_COOKIE\)\?\.value,Date\.now\(\)\)\)return Response\.json\(\{error:'unauthorized'\},\{status:401/);
 for(const k of ['summary','daily','definitions','hours','zip','json'])assert(route.includes(`'${k}'`),k);
 assert(!/\.(insert|upsert|update|delete)\(|track\(|finalize\(/.test(route+read('lib/analytics/dailyAdmin.ts')),'reads only');
 const ui=read('app/admin/ExportControl.tsx'),ov=read('app/admin/SponsorOverview.tsx');
 assert(ov.includes('<ExportControl'),'mounted on the Overview');assert(ov.includes('data-sponsor-csv'),'the old Download CSV stays');
 for(const k of ['summary','daily','definitions','zip'])assert(ui.includes(`'${k}'`),k);
 assert(ui.includes('type="date"')&&ui.includes('/api/admin/export?'),'a date range and the route');
 assert(!/IslandBrush/.test(ui+read('app/admin/ExportControl.module.css')),'no brush font on buttons');
 assert.match(read('app/admin/ExportControl.module.css'),/min-height:44px/,'44 px targets');
 assert(read('docs/analytics-roadmap.md').includes('## Daily data layer and export (Nov 6 2026)'));
});

console.log(`admin-analytics-daily: ${passed} passed`);
})().catch(e=>{console.error(e);process.exit(1);});
