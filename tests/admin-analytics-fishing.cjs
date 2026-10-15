#!/usr/bin/env node
// Fishing analytics (Oct 15 2026, the spin reel; lib/analytics/fishingEvents.ts, countIds.ts FISHING_COUNT_EVENTS,
// fishingAdminMetrics.ts, app/admin/FishingSection.tsx, supabase/migrations/20261017_analytics_fishing.sql): every id is
// registered and labelled; the Event API carries the fight stats the listener needs; the listener counts the right ids; the
// loader never throws and suppresses small numbers; /admin shows every id and names the migration; the SQL function answers
// "fights per session" on a throwaway Postgres (skipped without one).
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),vm=require('vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8'),J=x=>JSON.parse(JSON.stringify(x));
let passed=0;const ok=(name,fn)=>Promise.resolve().then(fn).then(r=>{if(r!=='skip')passed++;},e=>{console.error('FAIL',name);throw e;});
// A tiny module loader with a stub tracker that records count() calls.
const counted=[];const stubs=new Map([[path.resolve(ROOT,'lib/analytics/tracker.ts'),{count:(id,n=1)=>counted.push([id,n])}],
 [path.resolve(ROOT,'lib/town/jobs/islandWallet.ts'),{islandMarket:{gather:()=>1}}],[path.resolve(ROOT,'lib/town/exploreSignals.ts'),{signalExplore(){}}],[path.resolve(ROOT,'lib/analytics/summitEvents.ts'),{countSummitFishCatch(){}}]]);
const SANDBOX_ENV={};const cache=new Map();
function load(name){const file=path.resolve(ROOT,name);if(stubs.has(file))return stubs.get(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext('(function(exports,module,require){'+code+'\n})',{console,Set,Map,Math,Date,JSON,Promise,Object,Array,Number,String,Error,URL,process:{env:SANDBOX_ENV},performance:{now:()=>0},structuredClone,queueMicrotask,fetch:()=>{throw Error('no network in tests');}})(m.exports,m,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id));
 cache.set(file,m.exports);return m.exports;}
function resolve(from,id){const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);for(const f of [base+'.ts',base+'.tsx',base])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;throw Error('cannot resolve '+id+' from '+from);}
const CID=load('lib/analytics/countIds.ts'),FE=load('lib/analytics/fishingEvents.ts'),LU=load('lib/town/fishing/lures.ts'),F=load('lib/town/fishing/fishingFight.ts');
const lcg=seed=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};

(async()=>{
await ok('ids registered and labelled',()=>{
 const ids=CID.FISHING_COUNT_EVENTS.map(([e])=>'fi:'+e);
 assert(ids.length>=20,'the fishing ids ('+ids.length+')');
 for(const id of ids){assert(CID.isCountId(id)&&CID.COUNT_KEY_RE.test(id)&&CID.FIXED_COUNT_IDS.includes(id),id);}
 for(const [,label] of CID.FISHING_COUNT_EVENTS)assert(label.length>4&&!/%|chance|odds/.test(label),'label '+label);
 assert.deepEqual(J(CID.FISHING_LURE_IDS),J(LU.LURES.map(l=>l.id)),'FISHING_LURE_IDS = lures.ts LURES');
 for(const want of ['lure_panenka','lure_none','hook_spin','land','escape','miss','slips_0','slips_3plus','run_stopped','run_spun','spin_slow','spin_full','book','request','clue','legend'])assert(ids.includes('fi:'+want),'fi:'+want);
 for(const gone of ['record','derby_start','derby_done','photo','lure'])assert(!CID.isCountId('fi:'+gone),'retired id fi:'+gone);
});

await ok('the fight keeps its stats and the session puts them on the catch / escape events',()=>{
 const core=load('lib/town/fishing/fishingCore.ts'),sess=load('lib/town/fishing/fishingSession.ts'),cat=load('lib/town/fishing/fishCatalog.ts');
 // Runs stopped vs spun through, the average rate.
 const r=lcg(9),f=F.createFight({group:'shark',shape:'shark',rarity:'rare',size:[50,90]},70,r);F.setHold(f,true,.5);f.progress=f.runAt[0]+.001;F.stepFight(f,.02,r);assert(f.run,'a run');
 F.setHold(f,false);for(let i=0;i<120&&f.run;i++)F.stepFight(f,1/30,r);assert.equal(f.runsStopped,1);assert.equal(f.runsSpun,0);
 F.setHold(f,true,1);f.progress=f.runAt[0]+.001;F.stepFight(f,.02,r);assert(f.run,'a second run');for(let i=0;i<120&&f.run;i++)F.stepFight(f,1/30,r);assert.equal(f.runsSpun,1,'spun through (a slip or ran its course while spinning)');
 const st=F.fightStats(f);assert(st.spinAvg>.5&&st.spinAvg<=1&&st.slips>=0&&st.time>0&&st.runsStopped===1&&st.runsSpun===1,JSON.stringify(st));
 // The session: hook → catch carries fight stats; an idle escape after a hook says hooked:true with stats; a scare says hooked:false.
 const events=[];const api=sess.createFishingSession(()=>({isNew:true,isBiggest:false,inBasket:true}));api.onFishingEvent(e=>events.push(e));
 const spawn={approach:(rr,fish)=>{const pts=[];for(let i=0;i<=8;i++)pts.push({x:3-(3-cat.SHADOW_LENGTH[fish.shadow]*.5-.05)*i/8,z:0});return {points:pts,circles:false,angle:0};},out:{x:1,z:0}};
 const spot=cat.spotById('west-cove'),rr=lcg(11);const toBite=()=>{let n=0;while(api.session.phase!=='bite'&&n++<4000)api.handle(core.stepSession(api.session,spot,1/30,rr,spawn));};
 api.begin(spot.id);api.tap();toBite();api.tap();assert.equal(events.at(-1).type,'hook');assert(!('easyReel' in events.at(-1)),'no Easy reel flag on events any more');
 let n=0;while(api.session.phase==='reeling'&&n++<30*60){const fi=api.session.fight;if(fi)api.hold(!fi.run&&fi.tension<.85);api.handle(core.stepSession(api.session,spot,1/30,rr,spawn));}
 const c=events.find(e=>e.type==='catch');assert(c&&c.fight&&typeof c.fight.slips==='number'&&typeof c.fight.spinAvg==='number'&&c.fight.spinAvg>0,'the catch event carries the fight stats');
 // An idle escape after a spin hook.
 let k=0;while(api.session.phase!=='ready'&&api.session.phase!=='floating'&&k++<200)api.handle(core.stepSession(api.session,spot,.1,rr,spawn));if(api.session.phase!=='floating')api.tap();
 toBite();api.tap();k=0;while(api.session.phase==='reeling'&&k++<30*12)api.handle(core.stepSession(api.session,spot,1/30,rr,spawn));
 const esc=events.filter(e=>e.type==='escape').at(-1);assert(esc&&esc.hooked===true&&esc.how==='escaped'&&esc.fight,'an idle escape after a hook: hooked, with the fight stats');
 // A scare (tap on a nibble): not hooked.
 k=0;while(api.session.phase!=='nibble'&&api.session.phase!=='approach'&&k++<4000)api.handle(core.stepSession(api.session,spot,1/30,rr,spawn));api.tap();
 const sc=events.filter(e=>e.type==='escape').at(-1);assert(sc&&sc.hooked===false&&sc.how==='scared','a scare is not hooked');
});

await ok('the listener counts the right ids; the lure and Fishbook call sites',()=>{
 counted.length=0;
 FE.onFishingAnalyticsEvent({type:'hook'});
 FE.onFishingAnalyticsEvent({type:'catch',fight:{slips:0,runsStopped:2,runsSpun:0,spinAvg:.9,time:5}});
 FE.onFishingAnalyticsEvent({type:'escape',hooked:true,fight:{slips:4,runsStopped:0,runsSpun:1,spinAvg:.3,time:9}});
 FE.onFishingAnalyticsEvent({type:'escape',hooked:false});
 FE.onFishingAnalyticsEvent({type:'catch',fight:{slips:1,runsStopped:0,runsSpun:0,spinAvg:0,time:2}});
 FE.onFishingAnalyticsEvent({type:'bite'});
 FE.countLureChosen('knuckleball');FE.countLureChosen(null);FE.countLureChosen('magic');FE.countFishbookOpen();
 assert.deepEqual(J(counted),[['fi:hook_spin',1],['fi:land',1],['fi:slips_0',1],['fi:run_stopped',2],['fi:spin_full',1],
  ['fi:escape',1],['fi:slips_3plus',1],['fi:run_spun',1],['fi:spin_slow',1],['fi:miss',1],['fi:land',1],['fi:slips_1',1],
  ['fi:lure_knuckleball',1],['fi:lure_none',1],['fi:lure_none',1],['fi:book',1]]);
 for(const [id] of counted)assert(CID.isCountId(id),'unregistered id '+id);
 assert.equal(FE.spinBucket(.5),'fi:spin_mid');
 assert(/wireFishingAnalytics\(fishingSession\)/.test(read('lib/town/fishing/fishingLogStore.ts'))&&/countLureChosen\(next\)/.test(read('lib/town/fishing/fishingLogStore.ts')),'wired in the fishing log store');
 assert(/countFishbookOpen\(\)/.test(read('components/FishingHost.tsx')),'the Fishbook button counts');
 assert(!/setInterval|requestAnimationFrame|setTimeout/.test(read('lib/analytics/fishingEvents.ts')),'no timers');
});

await ok('the loader never throws, suppresses small numbers, and says when the migration is missing',async()=>{
 const M=load('lib/analytics/fishingAdminMetrics.ts');
 assert.equal((await M.loadFishingMetrics('2026-10-01','2026-10-07')).status,'not-configured','no env');
 SANDBOX_ENV.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';SANDBOX_ENV.SUPABASE_SERVICE_ROLE_KEY='k';
 try{
  const raw={from:'2026-10-01',to:'2026-10-07',window_days:14,sessions:12,fights:40,landed:30,buckets:{'1':6,'2-3':4,'4-6':2,'7+':0}};
  const r=await M.loadFishingMetrics('2026-10-01','2026-10-07',async(url,init)=>{assert(String(url).endsWith('/rest/v1/rpc/analytics_fishing_summary'));assert.equal(JSON.parse(init.body).p_from,'2026-10-01');return {ok:true,status:200,text:async()=>JSON.stringify(raw)};});
  assert.deepEqual(J(r),{status:'ok',sessions:12,fights:40,landed:30,buckets:{'1':6,'2-3':null,'4-6':null,'7+':0},windowDays:14},'buckets under 5 sessions suppressed');
  assert.deepEqual(J(M.shapeFishingMetrics({sessions:3,fights:9,landed:5,buckets:{'1':3}})),{status:'ok',sessions:null,fights:null,landed:null,buckets:null,windowDays:14},'under 5 fishing sessions: everything suppressed');
  assert.deepEqual(J(M.shapeFishingMetrics({sessions:0,fights:0,landed:0,buckets:{}})).sessions,0,'none is 0, not <5');
  assert.equal((await M.loadFishingMetrics('2026-10-01','2026-10-07',async()=>({ok:false,status:404,text:async()=>''}))).status,'needs-migration');
  assert.equal((await M.loadFishingMetrics('2026-10-01','2026-10-07',async()=>{throw Error('boom');})).status,'error');
 }finally{delete SANDBOX_ENV.NEXT_PUBLIC_SUPABASE_URL;delete SANDBOX_ENV.SUPABASE_SERVICE_ROLE_KEY;}
});

await ok('admin shows every id, names the migration, and the report carries the rows',()=>{
 const section=read('app/admin/FishingSection.tsx'),ov=read('lib/analytics/overview.ts');
 assert(ov.includes("FISHING_COUNT_EVENTS.map(")&&/fishing:CountRow\[\]/.test(ov),'overview reads the fishing rows');
 for(const [e] of CID.FISHING_COUNT_EVENTS){const id='fi:'+e;const shown=section.includes(`'${id}'`)||section.includes(`v('${e}')`)||['lure_','slips_','run_','spin_'].some(p=>e.startsWith(p)&&section.includes(`'fi:${p}'`));assert(shown,'fishing counter not shown in /admin: '+id);}
 assert(/20261017_analytics_fishing\.sql/.test(read('lib/analytics/fishingAdminMetrics.ts'))&&/FISHING_MIGRATION/.test(section)&&/needs-migration/.test(section),'the banner names the migration');
 assert(/FishingSection/.test(read('app/admin/AnalyticsDashboard.tsx')),'the dashboard mounts the section');
 for(const f of ['app/admin/page.tsx','app/api/admin/analytics/route.ts'])assert(read(f).includes('loadFishingMetrics'),f+' loads the fishing metrics');
 assert(/fishing\?:FishingAdminMetrics\|null/.test(read('lib/analytics/core.ts')),'Report.fishing');
 const O=load('lib/analytics/overview.ts');const merged={totals:{visitors:1,sessions:9,pageviews:9,engagedMs:1,medianMs:1},counts:{'fi:land':40,'fi:hook_spin':30,'fi:miss':2},countSessions:{'fi:land':6,'fi:hook_spin':5,'fi:miss':2},flags:{}};
 const o=O.buildOverview({merged,rollups:[],from:'2026-10-15',to:'2026-10-15'},null);
 const row=id=>o.fishing.find(r=>r.id===id);assert.equal(row('fi:land').value,40);assert.equal(row('fi:miss').value,null,'2 sessions: suppressed');assert.equal(row('fi:book').value,0);
 const sql=read('supabase/migrations/20261017_analytics_fishing.sql');
 assert(/create or replace function public\.analytics_fishing_summary\(p_from date, p_to date\)/.test(sql)&&/grant execute on function public\.analytics_fishing_summary\(date, date\) to service_role/.test(sql));
 assert(!/\bdrop\b|\btruncate\b|\bdelete from\b|rename|analytics_ingest\s*\(/i.test(sql.replace(/--.*$/gm,'')),'additive: no destructive statements, analytics_ingest untouched');
 assert.match(sql.trim().split('\n').slice(-1)[0],/as status;$/,'ends with the self-check select');
 assert(/fi:hook_spin|fi:land|fi:escape|fi:miss|fi:slips|fi:run_|fi:spin_|fi:lure_|fi:book/.test(read('docs/fishing.md')),'docs/fishing.md names the ids');
});

await ok('sql: fights per session on a throwaway Postgres',async()=>{
 const bin=n=>{for(const d of (process.env.PATH||'').split(':').concat(['/opt/homebrew/bin','/usr/local/bin','/usr/lib/postgresql/16/bin','/usr/lib/postgresql/15/bin','/usr/lib/postgresql/14/bin'])){const f=path.join(d,n);if(fs.existsSync(f))return f;}return null;};
 const initdb=bin('initdb'),pgctl=bin('pg_ctl'),psqlBin=bin('psql');
 if(process.env.SKIP_PG_TESTS||!initdb||!pgctl||!psqlBin){console.log('  SKIP sql: no local Postgres (initdb/pg_ctl/psql) found');return 'skip';}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fipgf-')),port=String(40000+(process.pid+131)%20000),quiet={stdio:['ignore','ignore','pipe']};
 try{
  cp.execFileSync(initdb,['-D',path.join(dir,'data'),'-U','postgres','--auth=trust','-E','UTF8','--locale=C'],quiet);
  cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-o',`-k ${dir} -p ${port} -c listen_addresses='' -c fsync=off -c TimeZone=UTC`,'-w','-l',path.join(dir,'log'),'start'],quiet);
  const args=['-h',dir,'-p',port,'-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-qAt'];
  const psql=(q,{role}={})=>cp.execFileSync(psqlBin,[...args,'-c',(role?`set role ${role}; `:'')+q],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const runFile=f=>cp.execFileSync(psqlBin,[...args,'-f',f],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split('\n').pop();
  psql('create role anon; create role authenticated; create role service_role bypassrls;');
  psql('alter default privileges in schema public grant all on tables to anon, authenticated, service_role; alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;');
  const files=fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort(),me='20261017_analytics_fishing.sql';
  for(const f of files.filter(f=>f<me))runFile(path.join('supabase/migrations',f));
  assert.equal(runFile(path.join('supabase/migrations',me)),'OK, fishing analytics installed','self-check row');
  assert.equal(runFile(path.join('supabase/migrations',me)),'OK, fishing analytics installed','idempotent');
  const day=new Date().toISOString().slice(0,10),q=s=>`'${s.replace(/'/g,"''")}'`;
  const ingest=p=>psql(`select analytics_ingest(${q(JSON.stringify(p))}::jsonb)`,{role:'service_role'});
  const start=s=>ingest({type:'start',session:s,path:'/',day,visitor_hash:'d'.repeat(32),device:'phone',source:'direct'});
  // fi:hook_easy is a retired id (Easy reel removed 15 Oct 2026); the already-run SQL migration still sums it, harmlessly, so old counts keep working.
  const fish=(s,spin,easy,land)=>{start(s);ingest({type:'beat',session:s,engaged_ms:60000,counts:{'fi:hook_spin':spin,'fi:hook_easy':easy,'fi:land':land,'fi:book':1}});};
  fish('fishsess0000000001',1,0,1);fish('fishsess0000000002',2,1,3);fish('fishsess0000000003',5,0,4);fish('fishsess0000000004',8,2,9);
  start('fishsess0000000005');ingest({type:'beat',session:'fishsess0000000005',engaged_ms:60000,counts:{'fi:book':2}});// opened the Fishbook, never fought
  const r=JSON.parse(psql(`select analytics_fishing_summary('${day}'::date,'${day}'::date)`,{role:'service_role'}));
  assert.equal(r.sessions,4,'sessions that fought');assert.equal(r.fights,19);assert.equal(r.landed,17);assert.deepEqual(r.buckets,{'1':1,'2-3':1,'4-6':1,'7+':1});assert.equal(r.window_days,14);
  const none=JSON.parse(psql(`select analytics_fishing_summary('2020-01-01'::date,'2020-01-02'::date)`,{role:'service_role'}));assert.equal(none.sessions,0);assert.equal(none.fights,0);
  assert.throws(()=>psql(`select analytics_fishing_summary('${day}'::date,'${day}'::date)`,{role:'anon'}),/permission denied/,'anon cannot call it');
  console.log('  sql: 4 fishing sessions, 19 fights, buckets 1/2-3/4-6/7+ each 1');
 }finally{
  try{cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-m','immediate','stop'],quiet);}catch{}
  fs.rmSync(dir,{recursive:true,force:true});
 }
});

console.log(`admin-analytics-fishing: ${passed} groups passed`);
})().catch(e=>{console.error(e);process.exit(1);});
