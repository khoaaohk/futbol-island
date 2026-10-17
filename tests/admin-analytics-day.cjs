#!/usr/bin/env node
// Admin analytics: players by day and by player (Oct 16 2026; user: "for players today, can we have that be clickable and into
// more detail and list each user. same as the on now", then "i basically want to know by individual level").
//  1. The player key: a save code, else a random install id kept as the device key fi2-install-v1; sent on a start only; the
//     server keeps only a keyed one-way id (lib/analytics/playerId.ts), never the code, the code hash or the raw install id.
//  2. The pure shapes (lib/analytics/day.ts), the server loaders and their 30 s cache (lib/analytics/dayAdmin.ts), the routes,
//     the panel wiring and the privacy text.
//  3. The SQL (supabase/migrations/20261019_analytics_day_sessions.sql) on a throwaway Postgres: every migration replayed, sessions
//     on two Pacific days, the day listing and its totals, `partial` for a day older than the kept rows, the players list, one
//     player's sessions, the live read through the shared helper, grants and the self-check row (twice).
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const {createLoader}=require('./summit-harness.cjs');
const load=createLoader({regions:{regionName:(c,r)=>({'US-CA':'California','CA-ON':'Ontario'})[c+'-'+r]||r}});
const read=f=>fs.readFileSync(f,'utf8');
const MIGRATION='supabase/migrations/20261019_analytics_day_sessions.sql',OK_ROW='OK, day sessions installed';
let passed=0;const ok=async(name,fn)=>{try{const r=await fn();if(r!=='skip')passed++;}catch(e){console.error('FAIL',name);throw e;}};
let CODE='';

(async()=>{
const T=load('lib/analytics/tracker.ts'),C=load('lib/analytics/core.ts'),I=load('lib/analytics/ingest.ts'),S=load('lib/analytics/store.ts'),
 F=load('lib/analytics/deviceMarks.ts'),P=load('lib/analytics/playerId.ts'),D=load('lib/analytics/day.ts'),DA=load('lib/analytics/dayAdmin.ts'),
 SV=load('lib/saves/server.ts'),SN=load('lib/saves/snapshot.ts'),CO=load('lib/saves/code.ts');
let seed=7;CODE=CO.formatCode(CO.generateCode(m=>{seed=(seed*48271)%2147483647;return seed%m;}));assert(CO.isNormalCode(CODE),CODE);

await ok('readPlayerKey: the code when one is active, else one install id made once and kept',()=>{
 const mem=o=>({o,getItem:k=>o[k]??null,setItem:(k,v)=>{o[k]=v;}});
 const rnd=n=>new Uint8Array(n).map((_,i)=>i*17+3);
 assert.deepEqual(F.readPlayerKey(mem({'fi2-save-code-v1':CODE}),rnd),{pc:CODE});
 const st=mem({});const a=F.readPlayerKey(st,rnd);
 assert.match(a.pi,/^[0-9a-f]{32}$/);assert.equal(st.o['fi2-install-v1'],a.pi,'kept in fi2-install-v1');
 assert.deepEqual(F.readPlayerKey(st,()=>new Uint8Array(16)),a,'made once: the same id next time');
 assert.equal(F.readPlayerKey(mem({'fi2-save-code-v1':'not a code'}),rnd).pi.length,32,'a broken code falls back to the install id');
 assert.equal(F.readPlayerKey(null,rnd),null);
 assert.equal(F.readPlayerKey({getItem:()=>null,setItem:()=>{throw new Error('full');}},rnd),null,'storage that cannot keep it: nothing sent');
 assert.equal(SN.INSTALL_ID_KEY,'fi2-install-v1');
 assert(SN.DEVICE_KEYS.includes('fi2-install-v1')&&!SN.isSyncKey('fi2-install-v1'),'a device key: never synced into a save');
 assert.match(read('lib/saves/client.ts'),/write\(SAVE_CODE_KEY,null\);write\(SAVE_SYNC_KEY,null\);write\(INSTALL_ID_KEY,null\);/,'deleting the save removes it');
 assert.match(read('components/VisitTracker.tsx'),/player:\(\)=>\{try\{return readPlayerKey\(window\.localStorage,/);
});

await ok('tracker + validateEvent: one player key, on a start only',()=>{
 const sent=[],w={location:{hostname:'futbolisland.app',pathname:'/',search:''},addEventListener(){},removeEventListener(){},setTimeout:()=>1,clearTimeout(){}};
 const d={visibilityState:'visible',referrer:'',addEventListener(){},removeEventListener(){}};
 const n={sendBeacon:(u,b)=>{sent.push(JSON.parse(b));return true;},maxTouchPoints:0},store={};
 const t=T.startTracker({window:w,document:d,navigator:n,storage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v;}},now:()=>0,random:k=>new Uint8Array(k).map((_,i)=>i),
  player:()=>({pi:'0123456789abcdef0123456789abcdef'})});
 t.pageview('/');
 const s=sent.find(b=>b.t==='start');assert.equal(s.pi,'0123456789abcdef0123456789abcdef');assert.equal(s.pc,undefined);
 assert(C.validateEvent(JSON.stringify(s)).ok);
 const base={v:1,t:'start',s:s.s,p:'/'};
 assert(C.validateEvent(JSON.stringify({...base,pc:CODE})).ok);
 for(const bad of [{pc:CODE,pi:s.pi},{pc:'DROP TABLE'},{pi:'xyz'},{pi:'A'.repeat(32)},{pc:7}])assert.equal(C.validateEvent(JSON.stringify({...base,...bad})).ok,false,JSON.stringify(bad));
 assert.equal(C.validateEvent(JSON.stringify({v:1,t:'beat',s:s.s,p:'/',e:1000,pi:s.pi})).ok,false,'never on a beat');
});

await ok('playerId: keyed, one-way, never the code, the code hash or the install id',()=>{
 const sec={pepper:'pepper-for-tests-0123456789',salt:'salt-for-analytics-0123456789'};
 const a=P.derivePlayerId({pc:CODE},sec),b=P.derivePlayerId({pc:CODE},sec),i=P.derivePlayerId({pi:'0123456789abcdef0123456789abcdef'},sec);
 assert.match(a,/^[0-9a-f]{32}$/);assert.equal(a,b,'stable for one code');assert.match(i,/^[0-9a-f]{32}$/);assert.notEqual(a,i);
 const norm=CO.formatCode(CO.parseCode(CODE)),ch=SV.codeHash(sec.pepper,norm);
 assert.equal(norm,CODE,'a code as the game stores it');
 assert(!ch.includes(a)&&!a.includes(ch.slice(0,32)),'not the save store\'s key');
 assert.notEqual(i,'0123456789abcdef0123456789abcdef');
 assert.equal(a,crypto.createHmac('sha256',sec.salt).update('c:'+ch).digest('hex').slice(0,32),'HMAC(analytics salt, code hash)');
 assert.notEqual(P.derivePlayerId({pc:CODE},{...sec,salt:'another-salt-0123456789abc'}),a,'a different salt, a different id');
 assert.notEqual(P.derivePlayerId({pc:CODE},{pepper:sec.pepper}),null,'without ANALYTICS_PLAYER_SALT: a salt derived from the pepper');
 assert.notEqual(P.playerSalt({pepper:sec.pepper}),sec.pepper,'never the pepper itself');
 assert.equal(P.derivePlayerId({pc:CODE},{}),null,'no secret: no id');
 assert.equal(P.derivePlayerId({pi:'0123456789abcdef0123456789abcdef'},{}),null);
 assert.equal(P.derivePlayerId({pc:CODE},{salt:sec.salt}),null,'a code needs the pepper (its own keyed hash)');
 assert.equal(P.derivePlayerId({pi:'nope'},sec),null);
 assert.equal(P.derivePlayerId({pc:'happy-blue-tiger-4271'},sec),null,'not a stored code (no fuzzy matching here)');
});

await ok('ingest: the start keeps only the derived id (memory store)',async()=>{
 const mem=S.createMemoryStore(),lim=I.createLimiter({capacity:1e6}),now=new Date(),secrets={pepper:'pepper-for-tests-0123456789',salt:'salt-for-analytics-0123456789'};
 const h={get:k=>({'user-agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile/15E148','host':'futbolisland.app'})[k]??null};
 const go=b=>I.handleIngest({body:JSON.stringify(b),headers:h,store:mem,limiter:lim,now,vercelEnv:'production',secrets});
 assert.equal((await go({v:1,t:'start',s:'dayMemA0000000000001',p:'/',pc:CODE,hc:1,rt:1})).reason,'ok');
 assert.equal((await go({v:1,t:'start',s:'dayMemB0000000000001',p:'/',pi:'0123456789abcdef0123456789abcdef'})).reason,'ok');
 assert.equal((await go({v:1,t:'start',s:'dayMemC0000000000001',p:'/'})).reason,'ok');
 const txt=JSON.stringify(mem.data);
 for(const raw of [CODE,'0123456789abcdef0123456789abcdef',SV.codeHash(secrets.pepper,CODE)])assert(!txt.includes(raw),'never stored: '+raw.slice(0,12));
 assert.equal(mem.data.starts.dayMemA0000000000001.playerId,P.derivePlayerId({pc:CODE},secrets));
 assert.match(mem.data.starts.dayMemB0000000000001.playerId,/^[0-9a-f]{32}$/);assert.equal(mem.data.starts.dayMemC0000000000001.playerId,null);
 assert.match(read('lib/analytics/store.ts'),/player_id:ev\.playerId\?\?null/,'the Supabase store sends it');
});

await ok('day.ts shapes and day helpers',()=>{
 const row={sid:'ab12cd',started_at:'2026-10-16T17:00:00Z',last_seen:'2026-10-16T17:20:00Z',seconds_active:600,device:'phone',country:'US',region:'CA',pid:'0123456789ab',counts:{fish:1}};
 const d=D.shapeDay({day:'2026-10-16',partial:false,sessions:1,players:1,visitors:1,seconds:600,by_area:[{key:'island',n:1,seconds:600}],by_device:[{key:'phone',n:1}],
  returning:{new:1,returning:0,unknown:0},code:{with:0,without:1,unknown:0},rows:[row,{...row,sid:'ff00ff',pid:'<b>'}]},(c,r)=>c+'/'+r);
 assert.equal(d.rows[0].pid,'0123456789ab');assert.equal(d.rows[1].pid,null,'pid: 12 hex only');assert.equal(d.rows[0].regionName,'US/CA');
 assert.deepEqual(d.byArea,[{key:'island',n:1,seconds:600}]);assert.equal(d.returning.new,1);assert.equal(d.code.without,1);
 const old=D.shapeDay({day:'2026-09-01',partial:true,sessions:7,players:null,returning:null,code:null,by_area:[{key:'island',n:null,seconds:500}]});
 assert.equal(old.partial,true);assert.equal(old.players,null);assert.equal(old.returning,null);assert.equal(old.byArea[0].n,null);
 const ps=D.shapePlayers({players:2,rows:[{pid:'0123456789ab',sessions:2,days_played:2,devices:['phone',7],areas:[{key:'island',seconds:60}]},{pid:'bad'}]});
 assert.equal(ps.rows.length,1,'rows without a valid pid dropped');assert.deepEqual(ps.rows[0].devices,['phone']);
 const p=D.shapePlayer({pid:'0123456789ab',sessions:2,days_played:2,rows:[row]});assert.equal(p.pid,'0123456789ab');assert.equal(p.rows.length,1);
 assert.equal(D.shapePlayer({pid:null}).pid,null);
 assert.equal(D.addDays('2026-11-01',1),'2026-11-02');assert.equal(D.addDays('2026-03-01',-1),'2026-02-28');
 assert.match(D.pacificDay(Date.UTC(2026,9,16,5)),/^2026-10-15$/,'5 am UTC is still the evening before in Los Angeles');
 assert.equal(D.clockPT('2026-10-16T17:05:00Z'),'10:05 am');
});

await ok('dayAdmin: not configured, needs migration, 30 s cache, bad input',async()=>{
 const env={u:process.env.NEXT_PUBLIC_SUPABASE_URL,k:process.env.SUPABASE_SERVICE_ROLE_KEY};
 delete process.env.NEXT_PUBLIC_SUPABASE_URL;delete process.env.SUPABASE_SERVICE_ROLE_KEY;
 assert.equal((await DA.loadDay('2026-10-16')).status,'not-configured');
 process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='service';
 assert.equal((await DA.loadDay('2026-10-01',{fetchImpl:async()=>({ok:false,status:404,text:async()=>''}),now:0})).status,'needs-migration');
 let calls=0;const fok=async(url,init)=>{calls++;const fn=url.split('/').pop(),body=JSON.parse(init.body);
  if(fn==='analytics_day_sessions'){assert.equal(body.p_day,'2026-10-16');return {ok:true,status:200,text:async()=>JSON.stringify({day:'2026-10-16',sessions:1,rows:[{sid:'abcdef',country:'CA',region:'ON'}]})};}
  if(fn==='analytics_players'){assert.deepEqual(body,{p_from:'2026-10-10',p_to:'2026-10-16',p_limit:500});return {ok:true,status:200,text:async()=>JSON.stringify({players:3})};}
  assert.equal(fn,'analytics_player_sessions');assert.equal(body.p_pid,'0123456789ab');return {ok:true,status:200,text:async()=>JSON.stringify({pid:'0123456789ab',sessions:4})};};
 const a=await DA.loadDay('2026-10-16',{fetchImpl:fok,now:1000}),b=await DA.loadDay('2026-10-16',{fetchImpl:fok,now:30_999});
 assert.equal(calls,1,'cached 30 s');assert.equal(a,b);assert.equal(a.rows[0].regionName,'Ontario');
 await DA.loadDay('2026-10-16',{fetchImpl:fok,now:31_001});assert.equal(calls,2,'fresh after 30 s');
 assert.equal((await DA.loadPlayers('2026-10-10','2026-10-16',{fetchImpl:fok,now:0})).players,3);
 assert.equal((await DA.loadPlayer('0123456789ab',{fetchImpl:fok,now:0})).sessions,4);
 const before=calls;assert.equal((await DA.loadPlayer('nope',{fetchImpl:fok})).pid,null);assert.equal(calls,before,'a bad pid never reaches the database');
 assert.equal(DA.validDay('2026-10-16'),true);assert.equal(DA.validDay('2026-13-99'),false);assert.equal(DA.validDay("2026-10-16' or 1=1"),false);
 for(const r of ['day-sessions','players','player']){const src=read(`app/api/admin/${r}/route.ts`);
  assert.match(src,/if\(!verifySession\(cookies\(\)\.get\(ADMIN_COOKIE\)\?\.value,Date\.now\(\)\)\)return Response\.json\(\{error:'unauthorized'\},\{status:401/,r+': admin only');
  assert.match(src,/status:400/,r+': bad input refused');}
 if(env.u)process.env.NEXT_PUBLIC_SUPABASE_URL=env.u;else delete process.env.NEXT_PUBLIC_SUPABASE_URL;if(env.k)process.env.SUPABASE_SERVICE_ROLE_KEY=env.k;else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

await ok('the tiles, the one slide-out and the privacy text are wired',()=>{
 const dash=read('app/admin/AnalyticsDashboard.tsx'),panel=read('app/admin/LivePanel.tsx'),ov=read('app/admin/OverviewSection.tsx');
 assert(dash.includes("<HeadlineTiles report={report} onOpenDay={day=>openPanel({mode:'day',day})}/>"),'the players hero tile opens the day view');
 assert(dash.includes("onClick={()=>openPanel({mode:'players',from:report.from,to:report.to})}"),'the players tile opens the players list');
 assert.match(ov,/role:'button',tabIndex:0/);assert.match(ov,/onClick:\(\)=>onOpenDay\(report\.to\)/);
 assert.equal((dash.match(/<LivePanel /g)||[]).length,1,'one slide-out for every view');
 for(const s of ["mode:'day'","mode:'players'","mode:'player'",'data-pull-ignore','POLL_MS=10_000','if(!isLive)return;','Previous day','Next day','Find a player id','player #{pid.slice(0,6)}'])assert(panel.includes(s),s);
 assert.match(panel,/<SessionCard [^>]*clock="ago" onPlayer=\{openPlayer\}/,'the On now cards link to the player');
 const pp=read('components/privacy/PrivacyPolicy.tsx');
 assert(pp.includes('random player number')&&pp.includes('one-way from the code')&&pp.includes('look back at each day’s visits'),'the privacy page says so');
 assert(!pp.includes('would let us follow one child'),'the old promise is gone (it is no longer true)');
 assert(read('docs/accounts-design.md').includes('`fi2-install-v1`'));
});

// ---- The SQL ---------------------------------------------------------------------------------------------------------------
await ok('sql: day sessions, players and one player on a throwaway Postgres',async()=>{
 const bin=n=>{for(const d of (process.env.PATH||'').split(':').concat(['/opt/homebrew/bin','/usr/local/bin','/usr/lib/postgresql/16/bin','/usr/lib/postgresql/15/bin','/usr/lib/postgresql/14/bin'])){const f=path.join(d,n);if(fs.existsSync(f))return f;}return null;};
 const initdb=bin('initdb'),pgctl=bin('pg_ctl'),psqlBin=bin('psql');
 if(process.env.SKIP_PG_TESTS||!initdb||!pgctl||!psqlBin){console.log('  SKIP sql: no local Postgres (initdb/pg_ctl/psql) found');return 'skip';}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fipgd-')),port=String(40000+(process.pid+733)%20000),quiet={stdio:['ignore','ignore','pipe']};
 try{
  cp.execFileSync(initdb,['-D',path.join(dir,'data'),'-U','postgres','--auth=trust','-E','UTF8','--locale=C'],quiet);
  cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-o',`-k ${dir} -p ${port} -c listen_addresses='' -c fsync=off -c TimeZone=UTC`,'-w','-l',path.join(dir,'log'),'start'],quiet);
  const args=['-h',dir,'-p',port,'-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-qAt'];
  const psql=(q,{role}={})=>cp.execFileSync(psqlBin,[...args,'-c',(role?`set role ${role}; `:'')+q],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const runFile=f=>cp.execFileSync(psqlBin,[...args,'-f',f],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split('\n').pop();
  psql('create role anon; create role authenticated; create role service_role bypassrls;');
  psql('alter default privileges in schema public grant all on tables to anon, authenticated, service_role; alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;');
  const files=fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort();
  assert.equal(files.filter(f=>f>path.basename(MIGRATION)).join(),'20261020_admin_save_returning_range.sql','only the save-metrics range migration (a separate function) runs after it');
  const results=files.map(f=>[f,runFile(path.join('supabase/migrations',f))]);
  assert.equal(results.find(([f])=>f===path.basename(MIGRATION))[1],OK_ROW,'self-check row');
  assert.equal(runFile(MIGRATION),OK_ROW,'safe to run twice');

  const today=psql(`select (now() at time zone 'America/Los_Angeles')::date`),yday=psql(`select (now() at time zone 'America/Los_Angeles')::date - 1`);
  const q=s=>`'${s.replace(/'/g,"''")}'`,svc={role:'service_role'};
  const ingest=p=>psql(`select analytics_ingest(${q(JSON.stringify(p))}::jsonb)`,svc);
  const P1='1'.repeat(32),P2='2'.repeat(32);
  const pid=p=>crypto.createHash('sha256').update(p+':futbol-island-player-v1').digest('hex').slice(0,12);
  const sid=id=>crypto.createHash('sha256').update(id+':futbol-island-live-v1').digest('hex').slice(0,6);
  // A session that started `h` hours after Pacific midnight on `day`, with one beat `m` minutes after its start.
  const session=(id,day,h,o,b,m=10)=>{
   ingest({type:'start',session:id,path:'/',day,visitor_hash:'a'.repeat(32),device:'phone',source:'direct',...o});
   if(b)ingest({type:'beat',session:id,engaged_ms:60000,...b});
   psql(`update analytics_sessions set started_at=('${day}'::date::timestamp at time zone 'America/Los_Angeles') + interval '${h} hours' where id='${id}'`);
   psql(`update analytics_beats set ts=(select started_at from analytics_sessions where id='${id}') + interval '${m} minutes' where session_id='${id}'`);
  };
  // Today: T1 player 1 (code, returning, flyer, California), T2 player 2 (new, no code, Instagram, Ontario, desktop), T3 an older
  // tab (no player id, no marks). Yesterday: Y1 player 1 on a tablet in Britain, Y2 player 2. One just before today (yesterday 23:30).
  session('daySessionT000000001',today,1,{player_id:P1,country:'US',region:'CA',source:'campaign',utm_source:'flyer',is_returning:true,has_code:true},
   {engaged_ms:180000,area_ms:{island:120000,arcade:60000},activity_ms:{fishing:100000,walk:20000,arcade_runner:60000},counts:{'fi:land':2}},20);
  session('daySessionT000000002',today,0.5,{player_id:P2,country:'CA',region:'ON',device:'desktop',source:'social',referrer_host:'instagram.com',is_returning:false,has_code:false},
   {area_ms:{museum:60000},activity_ms:{museum_hall:60000}});
  session('daySessionT000000003',today,0.1,{},null);
  session('daySessionY000000001',yday,9,{player_id:P1,country:'GB',region:'ENG',device:'tablet',is_returning:true,has_code:true},{engaged_ms:120000,area_ms:{island:120000},counts:{'su:ball_find':3}});
  session('daySessionY000000002',yday,23.5,{player_id:P2,country:'CA',region:'ON',device:'desktop'},{area_ms:{island:60000}});

  const day=(d,l)=>JSON.parse(psql(`select analytics_day_sessions('${d}'${l?`,${l}`:''})`,svc));
  const T=day(today);
  assert.equal(T.partial,false);assert.equal(T.sessions,3);assert.equal(T.players,2);assert.equal(T.seconds,240);assert.equal(T.visitors,1);
  assert.deepEqual(T.rows.map(r=>r.sid),['daySessionT000000001','daySessionT000000002','daySessionT000000003'].map(sid),'newest start first');
  const t1=T.rows[0];
  assert.equal(t1.pid,pid(P1));assert.equal(t1.seconds_active,180);assert.equal(t1.campaign,'flyer');assert.equal(t1.has_code,true);assert.equal(t1.returning,true);
  assert.deepEqual(t1.areas,{island:120,arcade:60});assert.equal(t1.counts.fish,2);assert.equal(T.rows[2].pid,null,'an older tab: no player');
  assert.equal(Date.parse(t1.last_seen)-Date.parse(t1.started_at),20*60000,'ended = the last beat');
  assert.deepEqual(T.returning,{new:1,returning:1,unknown:1});assert.deepEqual(T.code,{with:1,without:1,unknown:1});
  assert.deepEqual(T.by_device,[{key:'phone',n:2},{key:'desktop',n:1}]);
  assert.deepEqual(T.by_area,[{key:'arcade',n:1,seconds:60},{key:'island',n:1,seconds:120},{key:'museum',n:1,seconds:60}].sort((a,b)=>b.seconds-a.seconds||a.key.localeCompare(b.key)));
  assert.deepEqual(T.by_source,[{key:'direct',n:1},{key:'flyer',n:1},{key:'instagram.com',n:1}]);
  assert.deepEqual(T.by_country,[{country:'(unknown)',n:1,regions:[]},{country:'CA',n:1,regions:[{region:'ON',n:1}]},{country:'US',n:1,regions:[{region:'CA',n:1}]}]);
  assert.equal(day(today,1).rows.length,1);assert.equal(day(today,1).truncated,true);
  const Y=day(yday);assert.equal(Y.sessions,2,'yesterday 23:30 Pacific is yesterday (the day boundary is Los Angeles midnight)');assert.equal(Y.players,2);
  // A day older than the kept rows: the frozen rollup's totals only.
  const old=psql(`select (now() at time zone 'America/Los_Angeles')::date - 20`);
  psql(`insert into analytics_daily_pt (day, data) values ('${old}', ${q(JSON.stringify({day:old,visitors:5,sessions:7,engagedMs:600000,areaMs:{island:500000,arcade:400},
   dims:{country:{US:{s:5,v:4,pv:9},'(unknown)':{s:2,v:1,pv:2}},region:{'US-CA':{s:3,v:3,pv:5}},source:{direct:{s:7,v:5,pv:11}},device:{phone:{s:6,v:4,pv:9},tablet:{s:1,v:1,pv:2}}},tz:'America/Los_Angeles'}))}::jsonb)`);
  const O=day(old);
  assert.equal(O.partial,true);assert.deepEqual(O.rows,[]);assert.equal(O.sessions,7);assert.equal(O.visitors,5);assert.equal(O.seconds,600);assert.equal(O.players,null);
  assert.deepEqual(O.by_area,[{key:'island',n:null,seconds:500}],'under a second dropped');
  assert.deepEqual(O.by_country,[{country:'US',n:5,regions:[{region:'CA',n:3}]},{country:'(unknown)',n:2,regions:[]}]);
  assert.deepEqual(O.by_device,[{key:'phone',n:6},{key:'tablet',n:1}]);assert.equal(O.returning,null);assert.equal(O.code,null);
  const O2=day(psql(`select (now() at time zone 'America/Los_Angeles')::date - 30`));assert.equal(O2.partial,true);assert.equal(O2.sessions,0,'nothing kept at all');

  const pl=JSON.parse(psql(`select analytics_players('${yday}','${today}')`,svc));
  assert.equal(pl.players,2);assert.equal(pl.sessions,5);assert.equal(pl.unattributed,1);assert.equal(pl.partial,false);
  assert.deepEqual(pl.rows.map(r=>r.pid),[pid(P1),pid(P2)],'last seen first (player 1 played later today)');
  const p1=pl.rows[0];
  assert.equal(p1.sessions,2);assert.equal(p1.days_played,2);assert.equal(p1.seconds,300);assert.deepEqual(p1.devices,['phone','tablet']);
  assert.deepEqual(p1.countries,['GB','US']);assert.deepEqual(p1.regions,['GB-ENG','US-CA']);assert.deepEqual(p1.sources,['direct','flyer']);
  assert.equal(p1.has_code,true);assert.equal(p1.returning,true);assert.deepEqual(p1.areas,[{key:'island',seconds:240},{key:'arcade',seconds:60}]);
  assert.equal(p1.counts.fish,2);assert.equal(p1.counts.balls,3);
  assert.equal(Date.parse(p1.first_seen),Date.parse(Y.rows.find(r=>r.pid===pid(P1)).started_at));
  assert.equal(JSON.parse(psql(`select analytics_players('${today}','${today}', 1)`,svc)).rows.length,1);
  assert.equal(JSON.parse(psql(`select analytics_players('${old}','${today}')`,svc)).partial,true,'a range reaching past the kept rows');

  const one=JSON.parse(psql(`select analytics_player_sessions('${pid(P1)}')`,svc));
  assert.equal(one.pid,pid(P1));assert.equal(one.sessions,2);assert.equal(one.days_played,2);assert.equal(one.seconds,300);assert.equal(one.partial,false);
  assert.deepEqual(one.rows.map(r=>r.sid),[sid('daySessionT000000001'),sid('daySessionY000000001')],'newest first');
  assert.deepEqual(one.by_device,[{key:'phone',n:1},{key:'tablet',n:1}]);assert.deepEqual(one.code,{with:2,without:0,unknown:0});
  for(const bad of ['zzzzzzzzzzzz','0123',`${pid(P1)}' or '1'='1`]){const x=JSON.parse(psql(`select analytics_player_sessions(${q(bad)})`,svc));assert.equal(x.pid,null);assert.deepEqual(x.rows,[]);}
  // Live goes through the shared helper and carries the player too.
  ingest({type:'start',session:'daySessionL000000001',path:'/',day:today,visitor_hash:'a'.repeat(32),device:'phone',source:'direct',player_id:P2});
  const live=JSON.parse(psql(`select analytics_live_sessions(5)`,svc));
  assert.equal(live.sessions,1);assert.equal(live.rows[0].pid,pid(P2));assert.equal(live.rows[0].sid,sid('daySessionL000000001'));
  assert.equal(Number(psql(`select analytics_live(now() - interval '5 minutes')`,svc)),live.sessions,'the tile and the panel still agree');

  const all=JSON.stringify([T,Y,O,pl,one,live]);
  for(const raw of [P1,P2,'daySessionT000000001','a'.repeat(32)])assert(!all.includes(raw),'never a raw id or hash: '+raw.slice(0,12));
  for(const fn of [`analytics_day_sessions('${today}')`,`analytics_players('${today}','${today}')`,`analytics_player_sessions('${pid(P1)}')`,`analytics_session_rows(array['x'])`,`analytics_rows_totals('[]')`,`analytics_live_sessions(5)`])
   for(const role of ['anon','authenticated'])assert.throws(()=>psql(`select ${fn}`,{role}),/permission denied/,`${role} cannot run ${fn}`);
  const sql=read(MIGRATION).replace(/--.*$/gm,'');
  assert(!/\bdrop\b|\btruncate\b|\bdelete from\b|rename/i.test(sql),'no destructive statements');
  const ing=files.filter(f=>/create or replace function public\.analytics_ingest/.test(read('supabase/migrations/'+f)));
  const lists=s=>[...s.matchAll(/where key in \(([^)]*)\)/g)].map(m=>m[1]);
  assert.deepEqual(lists(read(MIGRATION)),lists(read('supabase/migrations/'+ing[ing.length-2])),'the same allow-lists as '+ing[ing.length-2]);
 }finally{
  try{cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-m','immediate','stop'],quiet);}catch{}
  fs.rmSync(dir,{recursive:true,force:true});
 }
});

console.log(`admin-analytics-day: ${passed} groups passed`);
})().catch(e=>{console.error(e);process.exit(1);});
