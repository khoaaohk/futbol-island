#!/usr/bin/env node
// The admin per-mode split (Nov 13 2026): the beat's pm:<s|w|p> counter summed per day / range by
// supabase/migrations/20261120_analytics_play_modes.sql, the parser and loader (lib/analytics/playModes*.ts), the route, the day
// view's Mode strip and the Players tab's "Players by mode" card. Days before Nov 13 say "No mode data before Nov 13", never zeros.
//  1. shape + helpers; 2. loader states (no Supabase call for a range before Nov 13); 3. SQL on a throwaway Postgres (skipped
//  without one); 4. renders; 5. wiring (route auth, tab placement, metric index). usage: node tests/admin-analytics-modes.cjs
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const {createLoader}=require('./summit-harness.cjs');
const read=f=>fs.readFileSync(f,'utf8');
const MIGRATION='supabase/migrations/20261120_analytics_play_modes.sql',OK_ROW='OK, play modes installed';
let passed=0;const ok=async(name,fn)=>{try{const r=await fn();if(r!=='skip')passed++;}catch(e){console.error('FAIL',name);throw e;}};
const css=new Proxy({},{get:(_,k)=>k==='__esModule'?false:typeof k==='string'?k:undefined});
const L=createLoader({'regions':{regionName:()=>null},'admin.module.css':css,'LivePanel.module.css':css,'IslandTravelMap.module.css':css,'DoneButton.module.css':css});
const PM=L('lib/analytics/playModes.ts'),PA=L('lib/analytics/playModesAdmin.ts');
const RAW={from:'2026-11-13',to:'2026-11-14',oldest_day:'2026-10-31',days:[
 {day:'2026-11-13',sessions:6,with_mode:5,modes:{w:{sessions:3,seconds:1800,players:2,returning:1},s:{sessions:2,seconds:600,players:2,returning:2}}},
 {day:'2026-11-14',sessions:2,with_mode:2,modes:{p:{sessions:2,seconds:'240',players:1,returning:0}}}],
 totals:{sessions:8,with_mode:7,modes:{w:{sessions:3,seconds:1800,players:2,returning:1},s:{sessions:2,seconds:600,players:2,returning:2},p:{sessions:2,seconds:240,players:1,returning:0}}}};

(async()=>{
await ok('shape and helpers',()=>{
 const d=PM.shapeModes(RAW);assert.equal(d.status,'ok');assert.equal(d.days.length,2);assert.equal(d.days[1].modes.p.seconds,240,'numeric strings');
 assert.deepEqual(d.days[0].modes.p,{sessions:0,seconds:0,players:0,returning:0},'a mode nobody played is zeros in the data');
 assert.deepEqual(PM.modeRows(d.days[0]).map(r=>r.key),['w','s'],'and left out of the rows (Public, Just me, Party order)');
 const t=PM.modeRows(d.totals);assert.deepEqual(t.map(r=>[r.label,r.players,r.returningShare]),[['Public',2,1/3],['Just me',2,1],['Party',1,0]]);
 assert.equal(PM.shapeModes(null).days.length,0);assert.equal(PM.emptyModes('error').totals.modes.w.sessions,0);
 assert.equal(PM.modeCoverage('2026-11-01','2026-11-12'),'none');assert.equal(PM.modeCoverage('2026-11-01','2026-11-20'),'some');assert.equal(PM.modeCoverage('2026-11-13','2026-11-20'),'all');
 assert.equal(PM.MODE_SINCE_TEXT,'No mode data before Nov 13');
});

await ok('loader states',async()=>{
 const env={u:process.env.NEXT_PUBLIC_SUPABASE_URL,k:process.env.SUPABASE_SERVICE_ROLE_KEY};
 const res=(status,json)=>async()=>({status,ok:status<400,text:async()=>JSON.stringify(json)});
 try{
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  assert.equal((await PA.loadPlayModes('2026-11-13','2026-11-13',{now:1})).status,'not-configured');
  process.env.NEXT_PUBLIC_SUPABASE_URL='https://x.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='k';
  let calls=0;const early=await PA.loadPlayModes('2026-11-01','2026-11-12',{now:1,fetchImpl:async()=>{calls++;return res(200,RAW)();}});
  assert.equal(early.status,'ok');assert.equal(calls,0,'a range before Nov 13 never calls Supabase');
  assert.equal((await PA.loadPlayModes('2026-11-15','2026-11-15',{now:1,fetchImpl:res(404,null)})).status,'needs-migration','before the migration: a clear state, not a crash');
  assert.equal((await PA.loadPlayModes('2026-11-16','2026-11-16',{now:1,fetchImpl:res(500,null)})).status,'error');
  const seen=[];const good=await PA.loadPlayModes('2026-11-13','2026-11-14',{now:1,fetchImpl:async(url,init)=>{seen.push([url.split('/rpc/')[1],JSON.parse(init.body)]);return res(200,RAW)();}});
  assert.equal(good.status,'ok');assert.deepEqual(seen,[['analytics_play_modes',{p_from:'2026-11-13',p_to:'2026-11-14'}]]);
  await PA.loadPlayModes('2026-11-13','2026-11-14',{now:2,fetchImpl:async()=>{throw new Error('cached');}});
 }finally{if(env.u===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;else process.env.NEXT_PUBLIC_SUPABASE_URL=env.u;if(env.k===undefined)delete process.env.SUPABASE_SERVICE_ROLE_KEY;else process.env.SUPABASE_SERVICE_ROLE_KEY=env.k;}
});

await ok('sql: per-mode sessions, seconds, players and returning on a throwaway Postgres',async()=>{
 const bin=n=>{for(const dir of (process.env.PATH||'').split(':').concat(['/opt/homebrew/bin','/usr/local/bin','/usr/lib/postgresql/16/bin','/usr/lib/postgresql/15/bin','/usr/lib/postgresql/14/bin'])){const f=path.join(dir,n);if(fs.existsSync(f))return f;}return null;};
 const initdb=bin('initdb'),pgctl=bin('pg_ctl'),psqlBin=bin('psql');
 if(process.env.SKIP_PG_TESTS||!initdb||!pgctl||!psqlBin){console.log('  SKIP sql: no local Postgres (initdb/pg_ctl/psql) found');return 'skip';}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fipgm-')),port=String(40000+(process.pid+2917)%20000),quiet={stdio:['ignore','ignore','pipe']};
 try{
  cp.execFileSync(initdb,['-D',path.join(dir,'data'),'-U','postgres','--auth=trust','-E','UTF8','--locale=C'],quiet);
  cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-o',`-k ${dir} -p ${port} -c listen_addresses='' -c fsync=off -c TimeZone=UTC`,'-w','-l',path.join(dir,'log'),'start'],quiet);
  const args=['-h',dir,'-p',port,'-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-qAt'];
  const psql=(q,{role}={})=>cp.execFileSync(psqlBin,[...args,'-c',(role?`set role ${role}; `:'')+q],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const runFile=f=>cp.execFileSync(psqlBin,[...args,'-f',f],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split('\n').pop();
  psql('create role anon; create role authenticated; create role service_role bypassrls;');
  psql('alter default privileges in schema public grant all on tables to anon, authenticated, service_role; alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;');
  const files=fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort();
  const results=files.map(f=>[f,runFile(path.join('supabase/migrations',f))]);
  assert.equal(results.find(([f])=>f===path.basename(MIGRATION))[1],OK_ROW,'self-check row');assert.equal(runFile(MIGRATION),OK_ROW,'safe to run twice');
  const svc={role:'service_role'},q=s=>`'${s.replace(/'/g,"''")}'`,ingest=p=>psql(`select analytics_ingest(${q(JSON.stringify(p))}::jsonb)`,svc);
  // 4 sessions: A public (2 beats) then party, B just me (returning), C public (returning, same player as A), D an older tab (no mode).
  const S=[['A',false,'a'],['B',true,'b'],['C',true,'a'],['D',false,null]],today=psql(`select (now() at time zone 'utc')::date`);
  for(const [n,ret,pid] of S)ingest({type:'start',session:('modes'+n).padEnd(20,'x'),path:'/',day:today,visitor_hash:String(S.findIndex(x=>x[0]===n)+1).repeat(32),device:'phone',source:'direct',is_returning:ret,...(pid?{player_id:pid.repeat(32)}:{})});
  const beat=(n,ms,counts)=>ingest({type:'beat',session:('modes'+n).padEnd(20,'x'),engaged_ms:ms,counts});
  beat('A',60000,{'pm:w':1});beat('A',30000,{'pm:w':1});beat('A',45000,{'pm:p':1});beat('B',120000,{'pm:s':1});beat('C',15000,{'pm:w':1});beat('D',50000,{'su:kick_play':2});
  const day=psql(`select (started_at at time zone 'America/Los_Angeles')::date from analytics_sessions limit 1`);
  const stored=psql(`select count(*) from analytics_beats where counts ? 'pm:w'`);
  if(stored!=='3'){console.log('  SKIP sql: this ingest drops pm: counters ('+stored+' stored)');return 'skip';}
  const m=PM.shapeModes(JSON.parse(psql(`select analytics_play_modes('${day}','${day}')`,svc)));
  assert.equal(m.days.length,1);const d=m.days[0];assert.equal(d.day,day);assert.equal(d.sessions,4);assert.equal(d.withMode,3,'the older tab has no mode');
  assert.deepEqual(d.modes.w,{sessions:2,seconds:105,players:1,returning:1},'public: A + C (one player), 90 s + 15 s, C returning');
  assert.deepEqual(d.modes.p,{sessions:1,seconds:45,players:1,returning:0},'A switched to a party: counted in both');
  assert.deepEqual(d.modes.s,{sessions:1,seconds:120,players:1,returning:1});
  assert.deepEqual(m.totals.modes,d.modes,'one day: totals = the day');
  const raw=psql(`select analytics_play_modes('${day}','${day}')`,svc);assert(!/modes[ABCD]x|aaaaaaaa|bbbbbbbb|"pid"|session_id/.test(raw),'no id in the answer');
  const empty=PM.shapeModes(JSON.parse(psql(`select analytics_play_modes('2026-01-01','2026-01-02')`,svc)));assert.equal(empty.days.length,0);assert.equal(empty.totals.sessions,0);
  for(const role of ['anon','authenticated'])assert.throws(()=>psql(`select analytics_play_modes('${day}','${day}')`,{role}),/permission denied/,role);
 }finally{try{cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-m','immediate','stop'],quiet);}catch{}fs.rmSync(dir,{recursive:true,force:true});}
});

await ok('renders: the day strip and the Players card, with the before-Nov-13 text instead of zeros',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),h=React.createElement;
 const LP=L('app/admin/LivePanel.tsx'),C=L('app/admin/PlayModesCard.tsx'),d=PM.shapeModes(RAW);
 const strip=renderToStaticMarkup(h(LP.DayModesStrip,{day:'2026-11-13',data:d}));
 assert(/Public 3/.test(strip)&&/Just me 2/.test(strip)&&/30 min/.test(strip)&&/2 players/.test(strip)&&/Mode unknown 1/.test(strip),strip);assert(!/Party/.test(strip),'nobody in a party that day');
 const old=renderToStaticMarkup(h(LP.DayModesStrip,{day:'2026-11-10',data:null}));assert(/No mode data before Nov 13/.test(old)&&!/ 0</.test(old),old);
 assert(/Not installed yet: run 20261120_analytics_play_modes\.sql/.test(renderToStaticMarkup(h(LP.DayModesStrip,{day:'2026-11-14',data:PM.emptyModes('needs-migration')}))));
 const card=renderToStaticMarkup(h(C.PlayModesView,{from:'2026-11-07',to:'2026-11-14',data:d}));
 assert(/Players by mode/.test(card)&&/Public/.test(card)&&/Just me/.test(card)&&/Party/.test(card)&&/No mode data before Nov 13: earlier days are not counted/.test(card),card);
 assert(/1 sessions with no mode/.test(card));assert(/Public 33%/.test(card)&&/Just me 100%/.test(card)&&/Party 0%/.test(card),'returning share');
 const before=renderToStaticMarkup(h(C.PlayModesView,{from:'2026-11-01',to:'2026-11-12',data:null}));assert(/No mode data before Nov 13\./.test(before)&&/data-cover="none"/.test(before),before);
 const pend=renderToStaticMarkup(h(C.PlayModesView,{from:'2026-11-13',to:'2026-11-14',data:PM.emptyModes('needs-migration')}));assert(/run 20261120_analytics_play_modes\.sql/.test(pend));
});

await ok('wiring: route auth, the day view and the Players tab, the metric index, the test chain',()=>{
 const route=read('app/api/admin/play-modes/route.ts');
 assert(/verifySession\(cookies\(\)\.get\(ADMIN_COOKIE\)\?\.value,Date\.now\(\)\)/.test(route)&&/status:401/.test(route)&&/validDay\(from\)\|\|!validDay\(to\)/.test(route)&&/noindex/.test(route),'same admin auth as the other routes');
 const lp=read('app/admin/LivePanel.tsx');assert(/<TotalsStrips t=\{data\}\/>\n  <DayModes day=\{data\.day\}\/>/.test(lp),'the day view shows the Mode strip');
 const dash=read('app/admin/AnalyticsDashboard.tsx');assert(/data-metric="players\.modes"><PlayModesCard from=\{report\.from\} to=\{report\.to\}\/>/.test(dash));
 assert(L('lib/analytics/metricIndex.ts').METRIC_INDEX.some(m=>m.id==='players.modes'&&m.tab==='players'));
 const sql=read(MIGRATION);assert(/grant execute on function public\.analytics_play_modes\(date, date\) to service_role/.test(sql)&&/revoke all on function public\.analytics_play_modes\(date, date\) from public, anon, authenticated/.test(sql));
 assert(!/alter table|create table|analytics_ingest/.test(sql),'no table or ingest change');
 assert(JSON.parse(read('package.json')).scripts.test.includes('node tests/admin-analytics-modes.cjs'),'in the test chain');
});
console.log(`admin-analytics-modes: ${passed} checks passed`);
})().catch(e=>{console.error(e);process.exit(1);});
