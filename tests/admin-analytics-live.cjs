#!/usr/bin/env node
// Admin analytics: live sessions and where players come from (Oct 15 2026; user: "on click 3 on now, opens slide out to show all
// that info", "how much time they have spent so far", "if they are a returning user with saved codes or not").
//  1. The tracker: the referrer HOST only, the ?from= / utm_source tag sanitised (the game's own return trips are not tags), the
//     two yes/no marks on a start; the server accepts them on a start only; ?from=flyer shows the title screen.
//  2. The pure shapes and labels (lib/analytics/live.ts) and the server cache (lib/analytics/liveAdmin.ts).
//  3. The SQL (supabase/migrations/20261018_analytics_live.sql) on a throwaway Postgres: every migration replayed, sessions with
//     geo / referrer / tags / marks and beats of different ages, the 2 / 5 / 15 min windows, sid ≠ raw id, time, counts, totals,
//     the sources summary's suppression, grants and the self-check row (twice).
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const {createLoader}=require('./summit-harness.cjs');
const load=createLoader({regions:{regionName:(c,r)=>({'US-CA':'California','US-TX':'Texas'})[c+'-'+r]||r}});
const read=f=>fs.readFileSync(f,'utf8');
const MIGRATION='supabase/migrations/20261018_analytics_live.sql';
let passed=0;const ok=async(name,fn)=>{try{const r=await fn();if(r!=='skip')passed++;}catch(e){console.error('FAIL',name);throw e;}};

(async()=>{
const T=load('lib/analytics/tracker.ts'),C=load('lib/analytics/core.ts'),I=load('lib/analytics/ingest.ts'),S=load('lib/analytics/store.ts'),
 F=load('lib/analytics/deviceMarks.ts'),L=load('lib/analytics/live.ts'),LA=load('lib/analytics/liveAdmin.ts');

await ok('tracker: referrer host and campaign tag sanitiser',()=>{
 assert.equal(T.referrerHost('https://www.instagram.com/p/abc?igsh=secret','futbolisland.app'),'www.instagram.com','host only: no path, no query');
 assert.equal(T.referrerHost('https://futbolisland.app/arcade','futbolisland.app'),null,'our own site is not a referrer');
 assert.equal(T.referrerHost('android-app://com.google/x','futbolisland.app'),null,'http(s) only');
 assert.equal(T.referrerHost('',''),null);assert.equal(T.referrerHost('not a url','x'),null);
 assert.equal(T.campaignTag('?from=flyer'),'flyer');
 assert.equal(T.campaignTag('?from=Flyer-2026'),'flyer-2026','lower case, dashes kept');
 for(const r of ['arcade','konbini','museum','shop'])assert.equal(T.campaignTag('?from='+r),null,'a return trip is not a tag: '+r);
 assert.equal(T.campaignTag('?from=museum&utm_source=newsletter'),'newsletter','a return trip falls through to utm_source');
 assert.equal(T.campaignTag('?from=a_b'),null,'letters, digits and dashes only');
 assert.equal(T.campaignTag('?from=<script>'),null);
 assert.equal(T.campaignTag('?from='+'x'.repeat(25)),null,'at most 24');
 assert.equal(T.campaignTag('?from='+'x'.repeat(24)),'x'.repeat(24));
 assert.equal(T.campaignTag(''),null);assert.equal(T.campaignTag('?utm_source=ig'),'ig');
});

await ok('tracker: the start carries the tag as the source and the two marks; nothing else',()=>{
 const sent=[],store={},w={location:{hostname:'futbolisland.app',pathname:'/',search:'?from=flyer'},addEventListener(){},removeEventListener(){},setTimeout:()=>1,clearTimeout(){}};
 const d={visibilityState:'visible',referrer:'https://l.instagram.com/?u=https%3A%2F%2Ffutbolisland.app',addEventListener(){},removeEventListener(){}};
 const n={sendBeacon:(u,b)=>{sent.push(JSON.parse(b));return true;},maxTouchPoints:0};
 const t=T.startTracker({window:w,document:d,navigator:n,storage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v;}},now:()=>0,random:k=>new Uint8Array(k).map((_,i)=>i*13),
  marks:()=>({returning:true,hasCode:false})});
 t.pageview('/');
 const s=sent.find(b=>b.t==='start');assert(s,'a start was sent');
 assert.equal(s.r,'l.instagram.com');assert.deepEqual(s.u,{source:'flyer'});assert.equal(s.rt,1);assert.equal(s.hc,0);
 assert(!JSON.stringify(s).includes('fi2-'),'no storage keys or values leave the tab');
 assert(C.validateEvent(JSON.stringify(s)).ok,'the server accepts it');
 assert.equal(C.validateEvent(JSON.stringify({v:1,t:'beat',s:s.s,p:'/',e:1000,rt:1})).ok,false,'marks only on a start');
 assert.equal(C.validateEvent(JSON.stringify({...s,hc:2})).ok,false,'marks are 0 or 1');
 const vt=read('components/VisitTracker.tsx');assert.match(vt,/marks:\(\)=>\{try\{return readDeviceMarks\(window\.localStorage\);\}catch\{return null;\}\}/);
});

await ok('readDeviceMarks: yes/no from the game\'s own keys (which still match the code that writes them)',()=>{
 const st=o=>({getItem:k=>o[k]??null});
 assert.deepEqual(F.readDeviceMarks(st({})),{returning:false,hasCode:false},'a first visit');
 assert.deepEqual(F.readDeviceMarks(st({'fi2-last-visit-day-v1':'2026-10-14'})),{returning:true,hasCode:false});
 assert.deepEqual(F.readDeviceMarks(st({'futbol-island-quiz-progress-v1':'["7v7:a:0"]'})),{returning:true,hasCode:false});
 assert.deepEqual(F.readDeviceMarks(st({'fi2-save-code-v1':'happy-blue-tiger-427'})),{returning:true,hasCode:true});
 assert.deepEqual(F.readDeviceMarks(st({'fi2-save-code-v1':'not a code'})),{returning:false,hasCode:false});
 assert.equal(F.readDeviceMarks(null),null);
 assert.equal(F.readDeviceMarks({getItem:()=>{throw new Error('blocked');}}).returning,false,'blocked storage: no');
 assert.match(read('lib/town/welcomeBack.ts'),new RegExp(`LAST_VISIT_KEY='${F.MARK_KEYS.lastVisit}'`));
 assert.match(read('lib/town/welcomeBack.ts'),new RegExp(`quest:'${F.MARK_KEYS.quest}',quiz:'${F.MARK_KEYS.quiz}'`));
 assert.match(read('lib/saves/snapshot.ts'),new RegExp(`SAVE_CODE_KEY='${F.MARK_KEYS.code}'`));
});

await ok('ingest: the marks reach the store on a start (memory store), unknown stays null',async()=>{
 const mem=S.createMemoryStore(),lim=I.createLimiter({capacity:1e6}),now=new Date();
 const h=(o={})=>({get:k=>({'user-agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile/15E148','host':'futbolisland.app','x-vercel-ip-country':'US','x-vercel-ip-country-region':'CA','x-vercel-ip-city':'San%20Diego',...o})[k]??null});
 const go=(body,hd)=>I.handleIngest({body:JSON.stringify(body),headers:hd||h(),store:mem,limiter:lim,now,vercelEnv:'production'});
 assert.equal((await go({v:1,t:'start',s:'liveMemA000000000001',p:'/',r:'instagram.com',u:{source:'flyer'},rt:1,hc:1})).reason,'ok');
 assert.equal((await go({v:1,t:'start',s:'liveMemB000000000001',p:'/'},h({'x-vercel-ip-country':null,'x-vercel-ip-country-region':null}))).reason,'ok');
 const a=mem.data.starts.liveMemA000000000001,b=mem.data.starts.liveMemB000000000001;
 assert.equal(a.returning,true);assert.equal(a.hasCode,true);assert.equal(a.country,'US');assert.equal(a.region,'CA');assert.equal(a.referrerHost,'instagram.com');assert.equal(a.utmSource,'flyer');assert.equal(a.source,'campaign');
 assert(!JSON.stringify(a).includes('Diego'),'never the city');
 assert.equal(b.returning,null);assert.equal(b.hasCode,null);assert.equal(b.country,null,'local dev without the headers: null');
 assert.match(read('lib/analytics/store.ts'),/is_returning:ev\.returning\?\?null,has_code:ev\.hasCode\?\?null/,'the Supabase store sends them');
});

await ok('rootView: ?from=flyer shows the title screen; the return trips still open the game',()=>{
 const R=load('lib/rootView.ts');
 assert.equal(R.isInGame('?from=flyer'),false);assert.equal(R.isInGame('?from=arcade'),true);assert.equal(R.isInGame('?panel=about'),true);
 assert.deepEqual([...R.GAME_FROM],[...T.RETURN_FROM],'one list of return trips');
 assert.match(read('next.config.mjs'),new RegExp(`value: '\\^\\(${T.RETURN_FROM.join('\\|')}\\)\\$'`),'= the next.config.mjs rewrite (unknown values fall through to the start page)');
});

await ok('live.ts: shapes, labels, time',()=>{
 assert.equal(L.flagOf('US'),'🇺🇸');assert.equal(L.flagOf('gb'),'');assert.equal(L.flagOf(null),'');
 assert.equal(L.fmtSpent(45),'45 s');assert.equal(L.fmtSpent(720),'12 min');assert.equal(L.fmtSpent(3900),'1 h 05');assert.equal(L.fmtSpent(11400),'3 h 10');
 assert.equal(L.fmtAgo(new Date(1000).toISOString(),5000),'just now');assert.equal(L.fmtAgo(new Date(0).toISOString(),180000),'3 min ago');
 assert.equal(L.sourceLabel('flyer'),'flyer QR');assert.equal(L.sourceLabel(null),'direct');assert.equal(L.sourceLabel('instagram.com'),'instagram.com');
 assert.equal(L.timeLine({activities:{walk:480,fishing:240,idle:900,ride:10},areas:{}}),'island 8 min · fishing 4 min','idle and tiny slices left out');
 const r=L.shapeLive({minutes:5,sessions:1,by_area:[{key:'fishing',n:1}],by_country:[{country:'US',n:1,regions:[{region:'CA',n:1}]}],by_source:[{key:'flyer',n:1}],
  rows:[{sid:'ab12cd',started_at:'2026-10-15T10:00:00Z',last_seen:'2026-10-15T10:05:00Z',seconds_active:240,device:'phone',country:'US',region:'CA',returning:true,has_code:null,counts:{fish:2,bogus:9},areas:{island:'240'}}]},(c,x)=>c+'/'+x);
 assert.equal(r.rows[0].regionName,'US/CA');assert.equal(r.byCountry[0].regions[0].name,'US/CA');assert.equal(r.rows[0].counts.fish,2);assert(!('bogus' in r.rows[0].counts));
 assert.equal(r.rows[0].returning,true);assert.equal(r.rows[0].hasCode,null);assert.equal(r.rows[0].areas.island,240);
 assert.equal(L.shapeLive({rows:[{sid:'<p>zz9f'}]}).rows[0].sid,'9f','sid: hex only');
 const s=L.shapeSources({sessions:6,countries:[{country:'US',n:3,regions:[{region:'CA',n:null}]}],returning:{new:null,returning:4,unknown:0},code:{with:3}});
 assert.equal(s.countries[0].regions[0].n,null);assert.equal(s.returning.returning,4);assert.equal(s.code.without,null);
});

await ok('liveAdmin: not configured, needs migration, 5 s cache, windows',async()=>{
 const env={u:process.env.NEXT_PUBLIC_SUPABASE_URL,k:process.env.SUPABASE_SERVICE_ROLE_KEY};
 delete process.env.NEXT_PUBLIC_SUPABASE_URL;delete process.env.SUPABASE_SERVICE_ROLE_KEY;
 assert.equal((await LA.loadLive(5)).status,'not-configured');
 process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='service';
 let calls=0;const f404=async()=>{calls++;return {ok:false,status:404,text:async()=>''};};
 assert.equal((await LA.loadLive(2,{fetchImpl:f404,now:0})).status,'needs-migration');
 const fok=async(url,init)=>{calls++;assert.match(url,/\/rest\/v1\/rpc\/analytics_live_sessions$/);assert.equal(JSON.parse(init.body).p_minutes,15);
  return {ok:true,status:200,text:async()=>JSON.stringify({minutes:15,sessions:1,rows:[{sid:'abcdef',country:'US',region:'TX'}]})};};
 calls=0;const a=await LA.loadLive(15,{fetchImpl:fok,now:1000}),b=await LA.loadLive(15,{fetchImpl:fok,now:5999});
 assert.equal(calls,1,'cached for 5 s');assert.equal(a,b);assert.equal(a.rows[0].regionName,'Texas');
 await LA.loadLive(15,{fetchImpl:fok,now:6001});assert.equal(calls,2,'fresh after 5 s');
 assert.equal(LA.liveMinutes('7'),5);assert.equal(LA.liveMinutes('2'),2);
 const route=read('app/api/admin/live/route.ts');assert.match(route,/if\(!verifySession\(cookies\(\)\.get\(ADMIN_COOKIE\)\?\.value,Date\.now\(\)\)\)return Response\.json\(\{error:'unauthorized'\},\{status:401/);
 if(env.u)process.env.NEXT_PUBLIC_SUPABASE_URL=env.u;else delete process.env.NEXT_PUBLIC_SUPABASE_URL;if(env.k)process.env.SUPABASE_SERVICE_ROLE_KEY=env.k;else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

await ok('the panel and the day section are wired',()=>{
 const dash=read('app/admin/AnalyticsDashboard.tsx'),panel=read('app/admin/LivePanel.tsx');
 assert.match(dash,/<button type="button" ref=\{liveTile\}[^>]*data-live-tile[^>]*onClick=\{\(\)=>setLiveOpen\(true\)\}/,'the tile is a button');
 assert(dash.includes('<LivePanel open={liveOpen} onClose={closeLive} countryName={countryName}/>')&&dash.includes('<SourcesSection report={report} countryName={countryName}/>'));
 assert.match(panel,/document\.visibilityState!=='visible'/,'polls only while visible');assert.match(panel,/POLL_MS=10_000/);
 assert.match(panel,/e\.key==='Escape'/);assert.match(panel,/<DoneButton ref=\{done\} onDone=\{onClose\}/);assert(panel.includes('Nobody right now.'));
 for(const p of ['app/admin/page.tsx','app/api/admin/analytics/route.ts'])assert.match(read(p),/report\.sources=await loadSources\(report\.from,report\.to\);/,p);
 const pp=read('components/privacy/PrivacyPolicy.tsx');assert(pp.includes('a yes or no each, never the code')&&pp.includes('as an anonymous session'),'the privacy page says so');
});

// ---- The SQL ---------------------------------------------------------------------------------------------------------------
await ok('sql: live sessions and the sources summary on a throwaway Postgres',async()=>{
 const bin=n=>{for(const d of (process.env.PATH||'').split(':').concat(['/opt/homebrew/bin','/usr/local/bin','/usr/lib/postgresql/16/bin','/usr/lib/postgresql/15/bin','/usr/lib/postgresql/14/bin'])){const f=path.join(d,n);if(fs.existsSync(f))return f;}return null;};
 const initdb=bin('initdb'),pgctl=bin('pg_ctl'),psqlBin=bin('psql');
 if(process.env.SKIP_PG_TESTS||!initdb||!pgctl||!psqlBin){console.log('  SKIP sql: no local Postgres (initdb/pg_ctl/psql) found');return 'skip';}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fipgl-')),port=String(40000+(process.pid+311)%20000),quiet={stdio:['ignore','ignore','pipe']};
 try{
  cp.execFileSync(initdb,['-D',path.join(dir,'data'),'-U','postgres','--auth=trust','-E','UTF8','--locale=C'],quiet);
  cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-o',`-k ${dir} -p ${port} -c listen_addresses='' -c fsync=off -c TimeZone=UTC`,'-w','-l',path.join(dir,'log'),'start'],quiet);
  const args=['-h',dir,'-p',port,'-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-qAt'];
  const psql=(q,{role}={})=>cp.execFileSync(psqlBin,[...args,'-c',(role?`set role ${role}; `:'')+q],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const runFile=f=>cp.execFileSync(psqlBin,[...args,'-f',f],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split('\n').pop();
  psql('create role anon; create role authenticated; create role service_role bypassrls;');
  psql('alter default privileges in schema public grant all on tables to anon, authenticated, service_role; alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;');
  const files=fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort();
  assert(files.includes(path.basename(MIGRATION)));
  const results=files.map(f=>[f,runFile(path.join('supabase/migrations',f))]);
  assert.equal(results.find(([f])=>f===path.basename(MIGRATION))[1],'OK, live sessions installed','self-check row');
  assert.equal(runFile(MIGRATION),'OK, live sessions installed','safe to run twice');

  const day=psql(`select (now() at time zone 'utc')::date`),q=s=>`'${s.replace(/'/g,"''")}'`;
  const ingest=p=>psql(`select analytics_ingest(${q(JSON.stringify(p))}::jsonb)`,{role:'service_role'});
  const H1='a'.repeat(32),H2='b'.repeat(32);
  const start=(id,o)=>ingest({type:'start',session:id,path:'/',day,visitor_hash:H2,device:'phone',source:'direct',...o});
  const beat=(id,ago,o)=>{ingest({type:'beat',session:id,engaged_ms:60000,...o});psql(`update analytics_beats set ts=now()-interval '${ago} seconds' where id=(select max(id) from analytics_beats)`);};
  const startedAgo=(id,s)=>psql(`update analytics_sessions set started_at=now()-interval '${s} seconds' where id='${id}'`);
  // A: on the flyer, fishing now after the arcade; a new device without a code. F: the same device earlier today.
  start('liveSessionA00000001',{visitor_hash:H1,country:'US',region:'CA',source:'campaign',utm_source:'flyer',is_returning:false,has_code:false});startedAgo('liveSessionA00000001',360);
  beat('liveSessionA00000001',240,{engaged_ms:120000,area_ms:{arcade:120000},activity_ms:{arcade_runner:100000,idle:20000},counts:{'su:kick_play':1}});
  beat('liveSessionA00000001',60,{engaged_ms:60000,area_ms:{island:60000},activity_ms:{fishing:40000,walk:20000},counts:{'fi:land':2,'su:ball_find':1,'lo:press_7v7':1,'lf:press_7v7':1,'wa:swim_start':3,'su:easel_save':1,'su:fruit_mango:hand':2,'fi:miss':4}});
  start('liveSessionF00000001',{visitor_hash:H1,country:'US',region:'CA',source:'campaign',utm_source:'flyer'});startedAgo('liveSessionF00000001',7200);
  beat('liveSessionF00000001',6000,{engaged_ms:300000,area_ms:{island:300000}});
  // B: from Instagram, returning with a code, last beat 4 min ago. C: Canada, direct, last beat 12 min ago. D: 20 min ago (gone).
  start('liveSessionB00000001',{country:'US',region:'TX',source:'social',referrer_host:'instagram.com',is_returning:true,has_code:true});startedAgo('liveSessionB00000001',600);
  beat('liveSessionB00000001',240,{area_ms:{museum:60000},activity_ms:{museum_hall:60000}});
  start('liveSessionC00000001',{country:'CA',region:'ON'});startedAgo('liveSessionC00000001',840);beat('liveSessionC00000001',720,{area_ms:{island:60000},activity_ms:{swim:60000}});
  start('liveSessionD00000001',{country:'GB',region:'ENG'});startedAgo('liveSessionD00000001',1800);beat('liveSessionD00000001',1200,{area_ms:{island:60000}});
  // E: just arrived (no beat yet), no geo headers (local dev), an older tab without the marks; a non-boolean mark is ignored.
  start('liveSessionE00000001',{is_returning:'yes'});startedAgo('liveSessionE00000001',30);
  assert.equal(psql(`select coalesce(is_returning::text,'null') from analytics_sessions where id='liveSessionE00000001'`),'null','only a jsonb boolean is kept');

  const live=m=>JSON.parse(psql(`select analytics_live_sessions(${m})`,{role:'service_role'}));
  const ids=m=>live(m).rows.map(r=>r.sid);
  const sid=id=>crypto.createHash('sha256').update(id+':futbol-island-live-v1').digest('hex').slice(0,6);
  assert.deepEqual(ids(2).sort(),[sid('liveSessionA00000001'),sid('liveSessionE00000001')].sort(),'2 min: A and E');
  assert.deepEqual(ids(5).sort(),['A','B','E'].map(x=>sid(`liveSession${x}00000001`)).sort(),'5 min: A, B and E');
  assert.deepEqual(ids(15).sort(),['A','B','C','E'].map(x=>sid(`liveSession${x}00000001`)).sort(),'15 min: A, B, C and E');
  assert.equal(JSON.parse(psql(`select analytics_live_sessions()`,{role:'service_role'})).minutes,5,'default 5');
  assert.equal(live(999).minutes,60,'clamped');
  assert.equal(Number(psql(`select analytics_live(now() - interval '5 minutes')`,{role:'service_role'})),live(5).sessions,'the tile and the panel agree');
  const L15=live(15),txt=JSON.stringify(L15);
  for(const raw of ['liveSessionA00000001','liveSessionB00000001',H1,H2])assert(!txt.includes(raw),'never a raw id or visitor hash: '+raw);
  for(const r of L15.rows)assert.match(r.sid,/^[0-9a-f]{6}$/);
  const A=L15.rows.find(r=>r.sid===sid('liveSessionA00000001'));
  assert.equal(A.seconds_active,180,'foreground time: the beats\' engaged time, not wall clock');
  assert(A.span_seconds>=290&&A.span_seconds<=310,'span: start to the last beat');
  assert.equal(A.country,'US');assert.equal(A.region,'CA');assert.equal(A.campaign,'flyer');assert.equal(A.returning,false);assert.equal(A.has_code,false);
  assert.equal(A.area,'island');assert.equal(A.activity,'fishing');assert.equal(A.previous_area,'arcade');assert.equal(A.spot,'fishing');
  assert.deepEqual(A.counts,{balls:1,fish:2,lessons:1,quizzes:1,swims:3,paintings:1,fruit:2,kicks:1},'counts');
  assert.deepEqual(A.areas,{arcade:120,island:60});assert.deepEqual(A.activities,{arcade_runner:100,idle:20,fishing:40,walk:20});
  assert.equal(A.device_today_sessions,2);assert.equal(A.device_today_seconds,480,'same device today: this session + the earlier one');
  const B=L15.rows.find(r=>r.sid===sid('liveSessionB00000001'));assert.equal(B.referrer_host,'instagram.com');assert.equal(B.returning,true);assert.equal(B.has_code,true);assert.equal(B.previous_area,null);
  const E=L15.rows.find(r=>r.sid===sid('liveSessionE00000001'));assert.equal(E.spot,null);assert.equal(E.seconds_active,0);assert.equal(E.country,null);assert.equal(E.returning,null);
  assert.equal(L15.sessions,4);
  assert.deepEqual(L15.by_area,[{key:'fishing',n:1},{key:'museum',n:1},{key:'starting',n:1},{key:'swim',n:1}]);
  assert.deepEqual(L15.by_country,[{country:'US',n:2,regions:[{region:'CA',n:1},{region:'TX',n:1}]},{country:'(unknown)',n:1,regions:[]},{country:'CA',n:1,regions:[{region:'ON',n:1}]}]);
  assert.deepEqual(L15.by_source,[{key:'direct',n:2},{key:'flyer',n:1},{key:'instagram.com',n:1}]);

  // The day view: aggregates only, rows under 3 sessions hidden.
  const sum=JSON.parse(psql(`select analytics_sources_summary('${day}','${day}')`,{role:'service_role'}));
  assert.equal(sum.sessions,6);assert.equal(sum.min_sessions,3);
  assert.deepEqual(sum.countries,[{country:'US',n:3,regions:[{region:'CA',n:null},{region:'TX',n:null}]}],'US 3 shown; its regions under 3 hidden');
  assert.equal(sum.countries_suppressed,3,'CA, GB and unknown: 1 each');
  assert.deepEqual(sum.sources,[{key:'direct',n:3}]);assert.equal(sum.sources_suppressed,3,'flyer 2, instagram 1');
  assert.deepEqual(sum.returning,{new:null,returning:null,unknown:4});assert.deepEqual(sum.code,{with:null,without:null,unknown:4});
  assert(!JSON.stringify(sum).includes('liveSession'),'no ids');
  assert.equal(JSON.parse(psql(`select analytics_sources_summary('${day}'::date - 30,'${day}'::date - 20)`,{role:'service_role'})).sessions,0,'an empty range');
  for(const fn of [`analytics_live_sessions(5)`,`analytics_sources_summary('${day}','${day}')`])for(const role of ['anon','authenticated'])
   assert.throws(()=>psql(`select ${fn}`,{role}),/permission denied/,`${role} cannot run ${fn}`);
  const sql=read(MIGRATION).replace(/--.*$/gm,'');
  assert(!/\bdrop\b|\btruncate\b|\bdelete from\b|rename/i.test(sql),'no destructive statements');
  assert(!/x-vercel-ip-city|city/i.test(sql),'never the city');
  // Nothing the previous ingest allowed is dropped.
  const ing=fs.readdirSync('supabase/migrations').filter(f=>/create or replace function public\.analytics_ingest/.test(read('supabase/migrations/'+f))).sort();
  assert.equal(ing[ing.length-1],path.basename(MIGRATION));
  const lists=s=>[...s.matchAll(/where key in \(([^)]*)\)/g)].map(m=>m[1]);
  assert.deepEqual(lists(read(MIGRATION)),lists(read('supabase/migrations/'+ing[ing.length-2])),'the same allow-lists as '+ing[ing.length-2]);
 }finally{
  try{cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-m','immediate','stop'],quiet);}catch{}
  fs.rmSync(dir,{recursive:true,force:true});
 }
});

console.log(`admin-analytics-live: ${passed} groups passed`);
})().catch(e=>{console.error(e);process.exit(1);});
