#!/usr/bin/env node
// Staff exclusion (Nov 13 2026; owner: "keep my own devices out of all analytics … retroactively"):
//  1. the device flag: a device that opened /admin is flagged (localStorage fi-staff=1, lib/analytics/staff.ts) and the tracker
//     sends nothing at all while the flag is on; the game's own saves never read it;
//  2. the memory store (local previews, tests) leaves excluded players out of computed days and the live count;
//  3. the admin API (/api/admin/staff) is behind the admin session and stores only short hashes;
//  4. the SQL (supabase/migrations/20261121_analytics_staff_exclusion.sql) on a throwaway Postgres: every read function goes
//     through the *_counted views (no raw-table read left), excluded players leave days, live, players, fishing and the day view,
//     removing the hash brings them back, the recompute rewrites only frozen days inside the raw window, and the fishing (fi:)
//     and lesson (lo:/le:/lf:) keys survive ingest → rollup (regression: Nov 13 2026 "fishing all zero").
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),crypto=require('crypto'),vm=require('vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const MIGRATION='supabase/migrations/20261121_analytics_staff_exclusion.sql',OK_ROW='OK, staff exclusion installed';
const loaded=new Map();
function resolve(from,id){const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);
 for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;throw Error('cannot resolve '+id+' from '+from);}
function load(file){file=path.resolve(ROOT,file);if(loaded.has(file))return loaded.get(file);
 if(file.endsWith('.css')){const v=new Proxy({},{get:(_,k)=>String(k)});loaded.set(file,v);return v;}
 if(file.endsWith('.json')){const v={default:JSON.parse(fs.readFileSync(file,'utf8'))};loaded.set(file,v);return v;}
 const m={exports:{}};loaded.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,
  {module:m,exports:m.exports,Buffer,URL,URLSearchParams,TextEncoder,TextDecoder,DataView,ArrayBuffer,Uint8Array,Uint32Array,Date,Math,JSON,Promise,Intl,process:{env:{}},console,setTimeout,clearTimeout,
   require:id=>id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id)});
 loaded.set(file,m.exports);return m.exports;}
let passed=0;const ok=(name,fn)=>Promise.resolve().then(fn).then(r=>{if(r!=='skip')passed++;},e=>{console.error('FAIL',name);throw e;});

(async()=>{
// ---- 1. the device flag and the tracker ------------------------------------------------------------------------------------
await ok('device flag: set by /admin, honoured by the tracker, ignored by the saves',()=>{
 const ST=load('lib/analytics/staff.ts'),T=load('lib/analytics/tracker.ts');
 const mem=()=>{const s={};return {getItem:k=>k in s?s[k]:null,setItem:(k,v)=>{s[k]=String(v);},removeItem:k=>{delete s[k];},s};};
 const ls=mem();
 assert.equal(ST.isStaffDevice(ls),false);
 ST.markStaffOnAdminLoad(ls);assert.equal(ST.isStaffDevice(ls),true,'opening /admin flags the device');assert.equal(ls.s[ST.STAFF_KEY],'1');
 ST.setStaffDevice(ls,false);assert.equal(ST.isStaffDevice(ls),false);ST.markStaffOnAdminLoad(ls);assert.equal(ST.isStaffDevice(ls),false,'an explicit "not mine" sticks across admin loads');
 ST.setStaffDevice(ls,true);assert.equal(ST.isStaffDevice(ls),true);
 assert.equal(ST.isStaffDevice({getItem(){throw Error('blocked');}}),false,'blocked storage: not staff, never throws');
 // The tracker: nothing at all is sent while the flag is on.
 const sent=[];const w={location:{hostname:'futbolisland.app',pathname:'/play',search:''},addEventListener(){},removeEventListener(){},setTimeout:()=>1,clearTimeout(){}};
 const env=staff=>({window:w,document:{visibilityState:'visible',referrer:'',addEventListener(){},removeEventListener(){}},navigator:{sendBeacon:(u,b)=>{sent.push(b);return true;}},
  storage:mem(),now:()=>0,random:k=>new Uint8Array(k).map((_,i)=>i*7&255),staff:()=>staff});
 assert.equal(T.skipReason(env(true)),'staff');assert.equal(T.startTracker(env(true)),null);assert.equal(sent.length,0);
 assert.equal(T.skipReason(env(false)),null);
 // VisitTracker passes the flag in (the tracker itself never touches localStorage), the admin page sets it, saves never read it.
 assert(/staff:\s*\(\)\s*=>\s*isStaffDevice\(/.test(read('components/VisitTracker.tsx')),'VisitTracker passes the staff flag');
 assert(/markStaffOnAdminLoad\(/.test(read('app/admin/AnalyticsDashboard.tsx'))||/markStaffOnAdminLoad\(/.test(read('app/admin/StaffDevice.tsx')),'the admin page flags the device');
 for(const f of fs.readdirSync('lib/saves'))if(f.endsWith('.ts'))assert(!/fi-staff|staff\.ts/.test(read('lib/saves/'+f)),'the save system never reads the staff flag: '+f);
});

// ---- 2. the memory store --------------------------------------------------------------------------------------------------
await ok('memory store: excluded players leave computed days and live',async()=>{
 const S=load('lib/analytics/store.ts'),P=load('lib/analytics/playerId.ts');
 const store=S.createMemoryStore();const now=new Date('2026-11-13T20:00:00Z');
 const A='a'.repeat(32),B='b'.repeat(32);
 const base={day:'2026-11-13',visitorHash:'v'.repeat(32),path:'/play',country:'US',region:'CA',device:'phone',source:'direct',referrerHost:null,utmSource:null,utmMedium:null,utmCampaign:null};
 await store.track({type:'start',session:'StaffSessionA00001',...base,playerId:A},now);
 await store.track({type:'start',session:'StaffSessionB00001',...base,visitorHash:'w'.repeat(32),playerId:B},now);
 for(const s of ['StaffSessionA00001','StaffSessionB00001'])await store.track({type:'beat',session:s,...base,engagedMs:60000,pageviews:1,areaMs:{island:60000},placeMs:{},activityMs:{},cells:{},counts:{'fi:land':2,'lo:learn7_roles':1}},new Date(now.getTime()+1000));
 const day=async()=>(await store.computeDays('2026-11-13','2026-11-13',new Date(now.getTime()+2000)))[0];
 assert.equal((await day()).sessions,2);assert.equal((await day()).counts['fi:land'],4);
 store.setExcluded([P.adminPid(A).slice(0,6)]);
 const d=await day();assert.equal(d.sessions,1);assert.equal(d.visitors,1);assert.equal(d.counts['fi:land'],2);assert.equal(d.staffExcluded,true);
 assert.equal(await store.live(new Date(now.getTime()-60000).toISOString()),1,'live leaves the staff session out');
 store.setExcluded([]);assert.equal((await day()).sessions,2,'removing the hash counts them again');
});

// ---- 3. the admin API and the page ---------------------------------------------------------------------------------------
await ok('admin API: session-guarded, short hashes only; the page has the switch and the player action',()=>{
 const route=read('app/api/admin/staff/route.ts');
 assert(/verifySession\(/.test(route)&&/unauthorized/.test(route),'admin session required');
 assert(/sameOrigin|origin/i.test(route),'a cross-site POST is refused');
 const SA=load('lib/analytics/staffAdmin.ts');
 assert.equal(SA.cleanPid('1537DA'),'1537da');assert.equal(SA.cleanPid('#1537da'),'1537da');assert.equal(SA.cleanPid('12345'),null);assert.equal(SA.cleanPid('zz37da'),null);assert.equal(SA.cleanPid('1'.repeat(13)),null);
 const ids=SA.devicePids({ph:'c'.repeat(64)},{salt:'s'.repeat(32)},Date.parse('2026-11-13T00:00:00Z'));
 assert.equal(ids.length,2,'this period and the one before');for(const p of ids)assert.match(p,/^[0-9a-f]{12}$/);
 assert.equal(SA.devicePids({},{salt:'s'.repeat(32)}).length,0);
 const page=read('app/admin/StaffDevice.tsx');
 assert(/This device is mine \(excluded from analytics\)/.test(page),'the switch line');
 assert(/Exclude this player/.test(read('app/admin/PlayersExplorer.tsx')),'the player card action');
 assert(/may include staff visits/.test(page+read('app/admin/AnalyticsDashboard.tsx')+read('lib/analytics/report.ts')),'the cut-off note');
});

// ---- 4. the SQL ------------------------------------------------------------------------------------------------------------
await ok('sql: views, filtered reads, recompute, and the fishing / lesson keys',async()=>{
 const mig=read(MIGRATION);
 // Every read function in the file reads raw rows only through the views (the writers are not in this file at all).
 const body=mig.replace(/--.*$/gm,'');
 for(const m of body.matchAll(/create or replace function (public\.[a-z_]+)\([\s\S]*?\$\$([\s\S]*?)\$\$/g)){
  if(/analytics_(pid|is_staff)$/.test(m[1]))continue;
  assert(!/\banalytics_(sessions|beats)\b(?!_)/.test(m[2]),m[1]+' reads a raw table directly');}
 for(const fn of ['analytics_ingest','analytics_finalize','analytics_pt_finalize'])assert(!new RegExp('function public\\.'+fn+'\\(').test(mig),fn+' untouched');
 assert(!/\bdelete\s+from\s+(public\.)?analytics_(sessions|beats)\b/i.test(body),'no raw row is deleted');
 const bin=n=>{for(const d of (process.env.PATH||'').split(':').concat(['/opt/homebrew/bin','/usr/local/bin','/usr/lib/postgresql/16/bin','/usr/lib/postgresql/15/bin','/usr/lib/postgresql/14/bin'])){const f=path.join(d,n);if(fs.existsSync(f))return f;}return null;};
 const initdb=bin('initdb'),pgctl=bin('pg_ctl'),psqlBin=bin('psql');
 if(process.env.SKIP_PG_TESTS||!initdb||!pgctl||!psqlBin){console.log('  SKIP sql: no local Postgres (initdb/pg_ctl/psql) found');return 'skip';}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fipgs-')),port=String(40000+(process.pid+1511)%20000),quiet={stdio:['ignore','ignore','pipe']};
 try{
  cp.execFileSync(initdb,['-D',path.join(dir,'data'),'-U','postgres','--auth=trust','-E','UTF8','--locale=C'],quiet);
  cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-o',`-k ${dir} -p ${port} -c listen_addresses='' -c fsync=off -c TimeZone=UTC`,'-w','-l',path.join(dir,'log'),'start'],quiet);
  const args=['-h',dir,'-p',port,'-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-qAt'];
  const psql=(q,{role}={})=>cp.execFileSync(psqlBin,[...args,'-c',(role?`set role ${role}; `:'')+q],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const runFile=f=>cp.execFileSync(psqlBin,[...args,'-f',f],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split('\n').pop();
  const fails=(sql,role)=>{const r=cp.spawnSync(psqlBin,[...args,'-c',`set role ${role}; ${sql}`],{encoding:'utf8'});return r.status!==0?r.stderr:'';};
  psql('create role anon; create role authenticated; create role service_role bypassrls;');
  psql('alter default privileges in schema public grant all on tables to anon, authenticated, service_role; alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;');
  for(const f of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort())if(f<path.basename(MIGRATION))runFile(path.join('supabase/migrations',f));
  runFile('docs/analytics-proposed/analytics_daily_people.sql');
  assert.equal(runFile(MIGRATION),OK_ROW,'self-check row');assert.equal(runFile(MIGRATION),OK_ROW,'safe to run twice');
  for(const role of ['anon','authenticated']){
   assert.match(fails('select count(*) from analytics_excluded',role),/permission denied/);
   assert.match(fails('select count(*) from analytics_sessions_counted',role),/permission denied/);
   assert.match(fails(`select analytics_recompute_rollups(current_date, current_date)`,role),/permission denied/);
  }
  assert.equal(psql(`select pid from analytics_excluded`),'1537da','the owner desktop is pre-loaded');
  const svc={role:'service_role'},q=s=>`'${s.replace(/'/g,"''")}'`;
  const today=psql(`select (now() at time zone 'America/Los_Angeles')::date`),yday=psql(`select (now() at time zone 'America/Los_Angeles')::date - 1`);
  const ingest=p=>psql(`select analytics_ingest(${q(JSON.stringify(p))}::jsonb)`,svc);
  const pid=p=>crypto.createHash('sha256').update(p+':futbol-island-player-v1').digest('hex').slice(0,12);
  const OWNER='0'.repeat(31)+'1',KID='9'.repeat(32);
  const session=(id,day,player,vh)=>{
   ingest({type:'start',session:id,path:'/play',day,visitor_hash:vh.repeat(32),device:'desktop',source:'direct',player_id:player,is_returning:true,has_code:true});
   ingest({type:'beat',session:id,engaged_ms:120000,area_ms:{island:120000},activity_ms:{fishing:60000},counts:{'fi:start':1,'fi:cast':2,'fi:land':3,'fi:land_common':3,'lo:learn7_roles':1,'le:learn7_roles':1,'lf:learn7_roles':1,'pm:s':1}});
   // Mid-day (an hour after midnight, or one minute after it when it is just past midnight now).
   psql(`update analytics_sessions set started_at=least(now() - interval '2 minutes', ('${day}'::date::timestamp at time zone 'America/Los_Angeles') + interval '1 hour') where id='${id}'`);
   psql(`update analytics_beats set ts=(select started_at from analytics_sessions where id='${id}') + interval '1 minute' where session_id='${id}'`);
  };
  session('StaffSqlOwnerToday01',today,OWNER,'a');session('StaffSqlKidToday0001',today,KID,'b');
  session('StaffSqlOwnerYday001',yday,OWNER,'a');session('StaffSqlKidYday00001',yday,KID,'b');
  const days=()=>JSON.parse(psql(`select analytics_pt_days('${yday}','${today}')`,svc));
  let D=days();
  assert.deepEqual(D.map(d=>d.sessions),[2,2],'nobody excluded yet (1537da is not these players)');
  // Regression (fishing / lessons "all zero", Nov 13 2026): every fi:, lo:, le:, lf: key survives ingest → rollup.
  for(const d of D){assert.equal(d.counts['fi:land'],6);assert.equal(d.counts['fi:cast'],4);assert.equal(d.countSessions['fi:start'],2);assert.equal(d.counts['lo:learn7_roles'],2);assert.equal(d.counts['le:learn7_roles'],2);assert.equal(d.staffExcluded,true);}
  psql(`insert into analytics_excluded (pid, label) values ('${pid(OWNER).slice(0,6)}', 'test owner')`,svc);
  D=days();
  assert.deepEqual(D.map(d=>d.sessions),[1,1],'the owner left both days');assert.deepEqual(D.map(d=>d.visitors),[1,1]);assert.deepEqual(D.map(d=>d.counts['fi:land']),[3,3]);
  assert.equal(+psql(`select analytics_live(now() - interval '3 days')`,svc),2,'live: only the kid (two sessions)');
  const pl=JSON.parse(psql(`select analytics_players('${yday}','${today}')`,svc));
  assert(!JSON.stringify(pl).includes(pid(OWNER)),'the player list leaves the owner out');assert(JSON.stringify(pl).includes(pid(KID)));
  const dayView=JSON.parse(psql(`select analytics_day_sessions('${today}')`,svc));assert.equal(dayView.sessions,1);
  const fish=JSON.parse(psql(`select analytics_fishing_sessions('${yday}','${today}')`,svc));assert.equal(fish.sessions,2,'fishing sessions: the kid on two days');
  const people=JSON.parse(psql(`select analytics_daily_people('${yday}','${today}')`,svc));assert.deepEqual(people.days.map(d=>d.players),[1,1]);
  // Recompute: a frozen day inside the raw window is rewritten from raw rows; one older than the window is skipped untouched.
  const old=psql(`select (now() at time zone 'America/Los_Angeles')::date - 20`);
  psql(`insert into analytics_daily_pt (day, data) values ('${yday}', '{"day":"x","sessions":99}'::jsonb), ('${old}', '{"day":"${old}","sessions":7}'::jsonb)`);
  const r=JSON.parse(psql(`select analytics_recompute_rollups('${old}','${today}')`,svc));
  assert.deepEqual(r.recomputed,[yday]);assert(r.skipped.includes(old)&&r.skipped.includes(today));
  assert.equal(+psql(`select (data->>'sessions')::int from analytics_daily_pt where day='${yday}'`),1);assert.equal(psql(`select data->>'staffExcluded' from analytics_daily_pt where day='${yday}'`),'true');
  assert.equal(+psql(`select (data->>'sessions')::int from analytics_daily_pt where day='${old}'`),7,'older than the raw window: untouched');
  assert.equal(JSON.parse(psql(`select analytics_recompute_rollups('${yday}','${yday}')`,svc)).recomputed.length,1,'idempotent');
  // Undo: remove the hash and everything counts again; no raw row was ever deleted.
  psql(`delete from analytics_excluded where label = 'test owner'`,svc);
  assert.deepEqual(days().map(d=>d.sessions),[2,2]);assert.equal(+psql(`select count(*) from analytics_sessions`),4);
 }finally{try{cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-m','immediate','-w','stop'],quiet);}catch{}fs.rmSync(dir,{recursive:true,force:true});}
});

// ---- 5. bounces, background tabs, prerenders and link previews (item 5) ---------------------------------------------------
await ok('a background or prerendered load is not a visit until shown; previews are bots; short visits hidden from Players',()=>{
 const T=load('lib/analytics/tracker.ts'),C=load('lib/analytics/core.ts');
 const mk=(vis,pre)=>{const L={},sent=[];const d={visibilityState:vis,prerendering:pre,referrer:'',addEventListener:(k,f)=>{(L[k]??=[]).push(f);},removeEventListener(){}};
  const w={location:{hostname:'futbolisland.app',pathname:'/play',search:''},addEventListener:(k,f)=>{(L[k]??=[]).push(f);},removeEventListener(){},setTimeout:()=>1,clearTimeout(){}};
  const st={};const e={window:w,document:d,navigator:{sendBeacon:(u,b)=>{sent.push(JSON.parse(b));return true;}},storage:{getItem:k=>st[k]??null,setItem:(k,v)=>{st[k]=v;}},now:()=>0,random:k=>new Uint8Array(k).map((_,i)=>(i*5+3)&255)};
  return {d,sent,fire:k=>(L[k]||[]).forEach(f=>f()),tr:T.startTracker(e)};};
 const bg=mk('hidden',false);bg.tr.pageview('/play');assert.equal(bg.sent.filter(s=>s.t==='start').length,0,'a background tab sends no start');
 bg.d.visibilityState='visible';bg.fire('visibilitychange');assert.equal(bg.sent.filter(s=>s.t==='start').length,1,'it starts when shown');bg.tr.stop();
 const pr=mk('visible',true);pr.tr.pageview('/play');assert.equal(pr.sent.length,0,'a prerender sends nothing');
 pr.d.prerendering=false;pr.fire('prerenderingchange');assert.equal(pr.sent.filter(s=>s.t==='start').length,1,'it starts on activation');pr.tr.stop();
 const fg=mk('visible',false);fg.tr.pageview('/play');assert.equal(fg.sent[0].t,'start','a visible load starts at once, as before');fg.tr.stop();
 for(const ua of ['facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)','WhatsApp/2.23.20.0 A','Mozilla/5.0 (compatible; Discordbot/2.0)','Slackbot-LinkExpanding 1.0','TelegramBot (like TwitterBot)',
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ChatGPT-User/1.0; +https://openai.com/bot)','Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/W.X.Y.Z Mobile Safari/537.36 (compatible; Google-InspectionTool/1.0;)','Mozilla/5.0 (compatible; Embedly/0.2)'])
  assert(C.isBot(ua),'bot: '+ua);
 for(const ua of ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Snapchat/12.90.0.46 (like Safari/8618.2.12.10.4)',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/470.0]','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36 Instagram 350.0.0'])
  assert(!C.isBot(ua),'a real in-app or desktop browser: '+ua);
 const PE=load('app/admin/PlayersExplorer.tsx');
 const rows=[{pid:'a'.repeat(12),seconds:0,sessions:1,daysPlayed:1,firstSeen:'2026-11-13T10:00:00Z',lastSeen:'2026-11-13T10:00:00Z',returning:true},{pid:'b'.repeat(12),seconds:4,sessions:1,daysPlayed:1,firstSeen:'2026-11-13T10:00:00Z',lastSeen:'2026-11-13T10:00:00Z',returning:true},
  {pid:'c'.repeat(12),seconds:5,sessions:1,daysPlayed:1,firstSeen:'2026-11-13T10:00:00Z',lastSeen:'2026-11-13T10:00:00Z',returning:true}];
 const f=o=>PE.filterPlayers(rows,{q:'',ret:'all',cohort:'all',sort:'last',from:'2026-11-13',...o}).map(p=>p.pid[0]).join('');
 assert.equal(f({short:false}),'c','under 5 s of play: not listed');assert.equal(f({short:true}).length,3,'"Show them" lists them');
});

console.log(`admin-analytics-staff: ${passed} groups passed`);
})().catch(e=>{console.error(e);process.exit(1);});
