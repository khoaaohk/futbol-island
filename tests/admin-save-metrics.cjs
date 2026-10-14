#!/usr/bin/env node
// Admin save-code metrics and the investor overview (Oct 11 2026): the metric definitions on the TypeScript twin
// (lib/saves/metrics.ts memorySaveMetrics), the period-over-period overview (lib/analytics/overview.ts via buildReport),
// small-number suppression, the "needs migration" path, the wiring in /admin, and the SQL of
// 20261011_admin_save_metrics.sql on a throwaway Postgres (all migrations in order, self-check row, idempotent, service_role
// only, SQL = TypeScript twin on the same rows). Aggregates only: nothing per code ever leaves.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),os=require('os'),cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const read=f=>fs.readFileSync(f,'utf8');
const J=x=>JSON.parse(JSON.stringify(x));
const loaded=new Map();
function resolve(from,id){const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);
 for(const f of [base,base+'.ts',base+'.tsx'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;throw Error('cannot resolve '+id+' from '+from);}
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);
 if(file.endsWith('.json')){const v={default:JSON.parse(read(file))};loaded.set(file,v);return v;}
 const m={exports:{}};loaded.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(read(file),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Buffer,URL,URLSearchParams,TextDecoder,Date,Math,JSON,Promise,Response,process:{env:{}},console,require:id=>id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id)});
 loaded.set(file,m.exports);return m.exports;}
const M=load('lib/saves/metrics.ts'),ST=load('lib/saves/store.ts'),C=load('lib/analytics/core.ts'),S=load('lib/analytics/store.ts'),R=load('lib/analytics/report.ts'),O=load('lib/analytics/overview.ts');
let passed=0;const skipped=[];
const ok=(name,fn)=>Promise.resolve().then(fn).then(r=>{if(r==='skip')skipped.push(name);else passed++;},e=>{console.error('FAIL',name);throw e;});

const NOW=new Date(),TODAY=NOW.toISOString().slice(0,10),D=n=>C.addDays(TODAY,n);
const hex=i=>i.toString(16).padStart(64,'0');
/** Fixture rows: [created (days from today), last used (days from today), bytes, rev]. */
const FIX=[[0,0,300,1],[0,0,500,2],[-1,-1,400,1],[-1,0,420,3],[-2,-2,200,1],[-3,0,800,5],[-8,-1,1000,9],[-8,-8,350,1],[-10,-2,650,4],[-31,-1,900,12],[-31,-31,250,1],
 [-40,-35,300,2],[-200,-190,700,3],[-360,-345,333,2],[-364,-364,111,1],[-15,-15,222,1]];
function memData(){const saves={};FIX.forEach(([c,u,b,r],i)=>{saves[hex(i+1)]={hash:hex(i+1),snapshot:{format:1,game:'',keys:{}},bytes:b,rev:r,createdOn:D(c),lastUsedOn:D(u),codeVersion:1,guardianId:null};});
 const win=(min,agoMs=0)=>Math.floor((NOW.getTime()-agoMs)/(min*60_000))*min*60_000,ip=x=>'ip:'+x.repeat(32);
 const throttle={[`f:${ip('a')}|${win(10)}`]:10,[`f:${ip('b')}|${win(10)}`]:4,[`f:global|${win(60)}`]:520,[`f:global|${win(60,3_600_000)}`]:30,[`f:global|${win(60,30*3_600_000)}`]:999,
  [`c:${ip('c')}|${win(60)}`]:61,[`c:global|${win(1440)}`]:75,[`m:${ip('d')}|${win(60)}`]:4,[`m:global|${win(1440)}`]:9};
 return {saves,throttle,salts:{}};}

(async()=>{
// 1. The definitions, on the TypeScript twin.
await ok('definitions',()=>{
 const m=M.memorySaveMetrics(memData(),D(-6),TODAY,NOW);
 assert.equal(m.total,FIX.length);
 assert.equal(m.active_1,4,'used today');assert.equal(m.active_7,9,'used in the last 7 days');assert.equal(m.active_30,11,'used in the last 30 days');
 assert.equal(m.returning,FIX.filter(([c,u])=>u>c).length,'returning = used on a later day');
 assert.equal(m.eligible,FIX.filter(([c])=>c<0).length);assert.equal(m.never_returned,FIX.filter(([c,u])=>c<0&&u===c).length);
 assert.equal(m.returning+m.never_returned,m.eligible,'every code made before today either came back or did not');
 assert.deepEqual(J(m.retention.d1),{eligible:14,kept:FIX.filter(([c,u])=>c<=-1&&u-c>=1).length});
 assert.deepEqual(J(m.retention.d7),{eligible:FIX.filter(([c])=>c<=-7).length,kept:FIX.filter(([c,u])=>c<=-7&&u-c>=7).length});
 assert.deepEqual(J(m.retention.d30),{eligible:FIX.filter(([c])=>c<=-30).length,kept:FIX.filter(([c,u])=>c<=-30&&u-c>=30).length});
 assert.equal(m.median_lifetime_days,M.median(FIX.map(([c,u])=>u-c)));assert.equal(m.median_age_days,M.median(FIX.map(([c])=>-c)));
 assert.equal(M.median([1,2,3,4]),2.5,'percentile_cont interpolates');assert.equal(M.median([]),0);
 assert.equal(m.expiring_30,2,'last used ~345 and ~364 days ago go within 30 days');assert.equal(m.expiring_90,2);assert.equal(m.idle_180,3);
 assert.equal(m.syncs,FIX.reduce((a,f)=>a+f[3]-1,0));assert.equal(m.total_bytes,FIX.reduce((a,f)=>a+f[2],0));assert.equal(m.avg_bytes,Math.round(m.total_bytes/FIX.length));
 assert.deepEqual(J(m.range),{created:FIX.filter(([c])=>c>=-6).length,returned:FIX.filter(([c,u])=>c>=-6&&u>c).length,prev_created:FIX.filter(([c])=>c>=-13&&c<=-7).length,prev_returned:FIX.filter(([c,u])=>c>=-13&&c<=-7&&u>c).length});
 assert.equal(m.by_day.length,7);assert.equal(m.by_day.reduce((a,r)=>a+r.created,0),m.range.created);assert.equal(m.by_day[6].day,TODAY);
 assert.equal(m.weeks.length,12);assert.equal(new Date(m.weeks[11].week+'T00:00:00Z').getUTCDay(),1,'weeks start on Monday');assert(m.weeks[11].week<=TODAY);
 assert.deepEqual(J(m.throttle),{failed_tries:550,ip_locks:1,breaker_hours:1,hard_stop_hours:0,create_cap_ip:1,create_cap_day:0,mail_cap_ip:1,mail_cap_day:0,creates:75},'only the last 24 hours count');
 // Ranges: reversed, future and over-long ranges are clamped as in SQL.
 const r=M.memorySaveMetrics(memData(),D(5),D(-2),NOW);assert.equal(r.from,D(-2));assert.equal(r.to,TODAY);
 const long=M.memorySaveMetrics(memData(),D(-900),TODAY,NOW);assert.equal(long.by_day.length,400);
 // Aggregates only: no hash, snapshot or bucket anywhere in the answer.
 const txt=JSON.stringify(m);assert(!/[0-9a-f]{32}/.test(txt)&&!/snapshot|ip:|hash/.test(txt),'nothing per code or per IP');
});

// 2. The admin block: statuses when something is missing, and the memory store path.
await ok('load',async()=>{
 assert.deepEqual(J(await M.loadSaveMetrics(D(-6),TODAY,NOW)),{status:'not-configured',data:null},'no store → not configured');
 // A missing function on Supabase answers 404 → "needs migration"; other errors → "error"; numbers as strings are normalised.
 await assert.rejects(M.supabaseSaveMetrics('https://x.supabase.co','k',D(-6),TODAY,async()=>new Response('{}',{status:404})),/needs-migration/);
 await assert.rejects(M.supabaseSaveMetrics('https://x.supabase.co','k',D(-6),TODAY,async()=>new Response('{}',{status:500})),/save metrics 500/);
 let sent;const got=await M.supabaseSaveMetrics('https://x.supabase.co/','k',D(-6),TODAY,async(u,i)=>{sent={u,i};return new Response(JSON.stringify({total:'12',median_age_days:'2.5',today:TODAY}),{status:200});});
 assert.equal(sent.u,'https://x.supabase.co/rest/v1/rpc/save_admin_metrics');assert.deepEqual(JSON.parse(sent.i.body),{p_from:D(-6),p_to:TODAY});assert.equal(got.total,12);assert.equal(got.median_age_days,2.5);assert.equal(got.today,TODAY);
 const mem=ST.createMemorySaveStore();Object.assign(mem.data,memData());
 assert.equal(M.memorySaveMetrics(mem.data,D(-6),TODAY,NOW).total,FIX.length,'reads the memory store as is');
});

// 3. The overview: this range vs the one before, suppression, the daily save-moment series.
await ok('overview',async()=>{
 const store=S.createMemoryStore(),day=D(-1),prevDay=D(-2);
 const add=(d,i,counts)=>{const id='s'+d+i;store.data.starts[id]={id,day:d,visitorHash:'v'+i,startedAt:d+'T10:00:00.000Z',entryPath:'/',country:'US',region:null,device:'phone',source:'direct',referrerHost:null,utmSource:null,utmMedium:null,utmCampaign:null,flags:{}};
  store.data.beats.push({sessionId:id,ts:d+'T10:05:00.000Z',engagedMs:60000,pageviews:1,areaMs:{island:60000},placeMs:{},activityMs:{},cells:{},counts});};
 for(let i=0;i<8;i++)add(day,i,{'st:view':1,'st:start':1,'st:created':1,...(i<6?{'st:restored':1}:{}),...(i<2?{'ip:open':1}:{})});
 for(let i=0;i<4;i++)add(prevDay,i,{'st:view':1,'st:restored':1});
 const rep=await R.buildReport(store,{from:day,to:day},NOW);
 const o=rep.overview;assert(o,'overview built');
 assert.equal(o.current.visitors,8);assert.equal(o.previous.visitors,4,'previous period = the day before');assert.equal(o.prevFrom,prevDay);
 assert.equal(o.current.steps['st:created'],8);assert.equal(o.current.steps['st:restored'],6);assert.equal(o.previous.steps['st:restored'],null,'4 sessions → withheld');
 assert.equal(o.plan.find(p=>p.id==='open').sessions,null,'2 sessions → withheld');
 assert.deepEqual(J(o.daily),[{day,created:8,restored:6,returning:0,breaks:0,restoreFails:0}]);
 const week=await R.buildReport(store,{from:D(-6),to:TODAY},NOW);assert.equal(week.overview.daily.length,7);assert.equal(week.overview.previous.days,7);
 assert.equal(week.overview.daily.find(r=>r.day===prevDay).restored,null,'a day under 5 is withheld too');
 assert(!/visitorHash|"v\d"/.test(JSON.stringify(o)),'no visitor ids in the overview');
});

// 4. Wiring: after the session check, the needs-migration banner, the section order, the presets.
await ok('wiring',()=>{
 const page=read('app/admin/page.tsx'),api=read('app/api/admin/analytics/route.ts'),dash=read('app/admin/AnalyticsDashboard.tsx'),saves=read('app/admin/SavesSection.tsx');
 assert(page.indexOf('verifySession(')<page.indexOf('loadSaveMetrics('),'page: metrics after the session check');
 assert(api.indexOf('status:401')<api.indexOf('loadSaveMetrics('),'route: metrics after the session check');
 assert(/20261011_admin_save_metrics\.sql/.test(saves)&&/OK, admin save metrics installed/.test(saves)&&/<SaveMetricsBanner saves=\{report\.saves\}\/>/.test(dash),'the banner names the file and the OK row');
 const order=['sec-headline','sec-engagement','sec-acquisition','sec-product','sec-health','sec-detail'].map(id=>dash.indexOf(`id="${id}"`));
 assert(order.every((v,i)=>v>0&&(i===0||v>order[i-1])),'sections in investor order');
 assert(dash.indexOf('<HeadlineTiles')<dash.indexOf('<EngagementTiles')&&dash.indexOf('<InvestorFunnel')<dash.indexOf('<PlanCard')&&dash.indexOf('<SaveHealthCard')<dash.indexOf('<StartSection report={report}'),'cards in their sections');
 assert(/cornerLeft[^\n]*BackButton/.test(dash)&&/cornerRight[^\n]*Log out/.test(dash),'Back top left, Log out top right');
 assert(/\{id:'90d',label:'90 days'\}/.test(dash)&&C.resolveRange({range:'90d'},NOW).from===C.addDays(C.pacificDay(NOW),-89),'90-day preset');
 for(const f of ['app/admin/SavesSection.tsx','app/admin/OverviewSection.tsx','app/admin/AnalyticsDashboard.tsx'])assert(!/^import(?! type)[^\n]*(saves\/(metrics|store|server)|analytics\/(overview|store|report))'/m.test(read(f)),f+': server modules stay out of the client bundle');
});

// 5. The SQL on a throwaway Postgres: all migrations in order, self-check, idempotent, service_role only, SQL = twin.
await ok('sql',async()=>{
 const bin=n=>{for(const d of (process.env.PATH||'').split(':').concat(['/opt/homebrew/bin','/usr/local/bin','/usr/lib/postgresql/16/bin','/usr/lib/postgresql/15/bin','/usr/lib/postgresql/14/bin'])){const f=path.join(d,n);if(fs.existsSync(f))return f;}return null;};
 const initdb=bin('initdb'),pgctl=bin('pg_ctl'),psqlBin=bin('psql');
 if(process.env.SKIP_PG_TESTS||!initdb||!pgctl||!psqlBin){console.log('  SKIP sql: no local Postgres (initdb/pg_ctl/psql) found');return 'skip';}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fipgm-')),port=String(40000+(process.pid+41)%20000),quiet={stdio:['ignore','ignore','pipe']};
 try{
  cp.execFileSync(initdb,['-D',path.join(dir,'data'),'-U','postgres','--auth=trust','-E','UTF8','--locale=C'],quiet);
  cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-o',`-k ${dir} -p ${port} -c listen_addresses='' -c fsync=off -c TimeZone=UTC`,'-w','-l',path.join(dir,'log'),'start'],quiet);
  const args=['-h',dir,'-p',port,'-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-qAt'];
  const psql=(sql,{role}={})=>cp.execFileSync(psqlBin,[...args,'-c',(role?`set role ${role}; `:'')+sql],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const fails=(sql,role)=>{const r=cp.spawnSync(psqlBin,[...args,'-c',`set role ${role}; ${sql}`],{encoding:'utf8'});return r.status!==0?r.stderr:'';};
  const runFile=f=>cp.execFileSync(psqlBin,[...args,'-f',f],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split('\n').pop();
  psql('create role anon; create role authenticated; create role service_role bypassrls;');
  psql('alter default privileges in schema public grant all on tables to anon, authenticated, service_role; alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;');
  const FILE='supabase/migrations/20261011_admin_save_metrics.sql';
  const files=fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort();
  assert(files.indexOf('20261011_admin_save_metrics.sql')>files.indexOf('20261010_game_saves.sql'),'runs after the save migration');
  const results=files.map(f=>runFile(path.join('supabase/migrations',f)));
  assert.equal(results[files.indexOf('20261011_admin_save_metrics.sql')],'OK, admin save metrics installed','self-check row');
  assert.equal(results[files.indexOf('20261010_game_saves.sql')],'OK, game saves installed','the save migration still passes');
  assert.equal(runFile(FILE),'OK, admin save metrics installed','idempotent');
  const sql=read(FILE);
  assert(!/\bdrop\b|\btruncate\b|\brename\b|\balter table\b|\binsert\b|\bupdate\b|\bdelete\b/i.test(sql.replace(/--.*$/gm,'').replace(/'[^']*'/g,"''")),'additive and read-only: no table changes, no writes');
  assert.match(sql.trim().split('\n').slice(-1)[0],/\) as missing\) x;$/,'the file ends with the self-check select');
  for(const role of ['anon','authenticated'])assert.match(fails(`select save_admin_metrics(current_date - 6, current_date)`,role),/permission denied/,role);
  assert.equal(psql(`select prosecdef from pg_proc where proname='save_admin_metrics'`),'t','security definer');
  // A self-check that FAILS loudly when the function is missing, and re-running repairs it.
  psql('drop function public.save_admin_metrics(date, date)');
  assert.match(psql(sql.slice(sql.lastIndexOf('select case when missing'))),/^NOT INSTALLED: save_admin_metrics$/);
  assert.equal(runFile(FILE),'OK, admin save metrics installed','re-running repairs it');
  // The same rows in both stores → the same answer (table_bytes is Postgres-only).
  const data=memData();
  for(const r of Object.values(data.saves))psql(`insert into game_saves (code_hash, snapshot, snapshot_bytes, rev, created_on, last_used_on) values (decode('${r.hash}','hex'), '{}', ${r.bytes}, ${r.rev}, '${r.createdOn}', '${r.lastUsedOn}')`);
  for(const [k,v] of Object.entries(data.throttle)){const i=k.lastIndexOf('|');psql(`insert into save_throttle (bucket, win, failures) values ('${k.slice(0,i)}', to_timestamp(${Number(k.slice(i+1))/1000}), ${v})`);}
  const lit=v=>v===null?'null':'$q$'+v+'$q$';
  const pgFetch=async(url,init)=>{const fn=url.split('/').pop(),a=JSON.parse(init.body);
   try{const out=psql(`select to_json(${fn}(${Object.entries(a).map(([k,v])=>`${k} => ${lit(v)}::date`).join(', ')}))`,{role:'service_role'});return new Response(out||'null',{status:200});}
   catch(e){return new Response('{}',{status:/does not exist/.test(String(e.stderr))?404:400});}};
  for(const [from,to] of [[D(-6),TODAY],[D(-29),TODAY],[TODAY,TODAY],[D(3),D(-2)],[D(-500),TODAY]]){
   const pg=await M.supabaseSaveMetrics('http://pg.local','service-key',from,to,pgFetch),mem=M.memorySaveMetrics(data,from,to,new Date());
   assert(pg.table_bytes>0,'table size from Postgres');
   assert.deepEqual({...J(pg),table_bytes:null},J(mem),`SQL = TypeScript twin for ${from}…${to}`);
  }
  // Missing function → 404 → "needs migration".
  psql('drop function public.save_admin_metrics(date, date)');
  await assert.rejects(M.supabaseSaveMetrics('http://pg.local','service-key',D(-6),TODAY,pgFetch),/needs-migration/);
 }finally{
  try{cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-m','immediate','-w','stop'],quiet);}catch{}
  fs.rmSync(dir,{recursive:true,force:true});
 }
});

console.log(`admin-save-metrics: ${passed} groups passed${skipped.length?`, skipped: ${skipped.join(', ')}`:''}`);
})().catch(e=>{console.error(e);process.exit(1);});
