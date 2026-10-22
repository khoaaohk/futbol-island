#!/usr/bin/env node
// Play with friends retention and virality (Oct 22 2026, Phase C of docs/analytics-multiplayer-plan.md §6, §7 RTT, §10).
//  1. The Phase C ids: allowlisted, well formed, no code-alphabet run, kept apart from Phase A's list.
//  2. OFF BY DEFAULT: with NEXT_PUBLIC_ANALYTICS_PARTY_RETENTION unset the client sends nothing new (no mp:guest_new / rtt /
//     reconnect / min_away, no RTT probe beat), the loader never calls Supabase and the admin card renders nothing.
//  3. Switched on: mp:guest_new only for a new-device session (the tracker's rt mark) and once; RTT bands; reconnect cap;
//     background minutes with the per-stretch cap.
//  4. The connection measures the median heartbeat round trip and counts recovered drops (no protocol change), the store exposes
//     them without emitting, PartyHost passes only a fixed band; the party code imports no analytics.
//  5. The reference aggregation (lib/analytics/partyRetention.ts): cohorts, D1 / D7 windows, suppression under 10, organic vs
//     invited, k-factor; no player id anywhere in the output.
//  6. SQL = TypeScript on a throwaway Postgres (20261022_analytics_party_retention.sql), grants, RLS, the weekly snapshot, and a
//     static check of the SQL (service_role only, no player id in the output, suppression < 10).
//  7. Route, loader states, the card (fixture render; RETENTION_HTML_OUT writes a page for a screenshot), the docs and the policy note.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const {createLoader}=require('./summit-harness.cjs');
const read=f=>fs.readFileSync(f,'utf8');
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:])\/\/.*$/gm,'$1');
const MIGRATION='supabase/migrations/20261022_analytics_party_retention.sql',OK_ROW='OK, party retention installed';
const SWITCH='NEXT_PUBLIC_ANALYTICS_PARTY_RETENTION';
delete process.env[SWITCH];
let passed=0;const ok=async(name,fn)=>{try{const r=await fn();if(r!=='skip')passed++;}catch(e){console.error('FAIL',name);throw e;}};

/** Fresh analytics modules with a recording tracker (count / onPageHide / sessionStartRt). */
function fresh(rt=0){
 const log=[],hooks=[];const tracker={count:(id,n=1)=>{for(let i=0;i<n;i++)log.push(id);},onPageHide:f=>{hooks.push(f);return()=>{};},sessionStartRt:()=>rt};
 const L=createLoader({'tracker':tracker,'./tracker':tracker});
 return {log,hooks,R:L('lib/analytics/partyRetentionEvents.ts'),P:L('lib/analytics/partyEvents.ts'),set rt(v){rt=v;}};
}

(async()=>{
const K=createLoader()('lib/analytics/countIds.ts');
const PR=createLoader({'regions':{regionName:()=>null}})('lib/analytics/partyRetention.ts');

await ok('ids: allowlisted, well formed, apart from Phase A',()=>{
 assert.deepEqual([...K.PARTY_RETENTION_IDS].sort(),['mp:guest_new','mp:min_away','mp:reconnect','mp:rtt_150_300','mp:rtt_300p','mp:rtt_80_150','mp:rtt_lt80']);
 for(const id of K.PARTY_RETENTION_IDS){assert(K.isCountId(id),id);assert(K.COUNT_KEY_RE.test(id),id);assert(!K.PARTY_FIXED_IDS.includes(id),'not in Phase A: '+id);
  assert(!/[23456789BCDFGHJKMNPQRSTVWXYZ]{6}/.test(id),'code-alphabet run in '+id);}
});

await ok('off by default: nothing new is sent, no probe, no admin card',async()=>{
 assert.equal(process.env[SWITCH],undefined);
 const {log,R,P}=fresh(0);
 assert.equal(R.partyRetentionOn(),false);
 P.countParty('live_guest','link',0);P.countParty('rtt','rtt_lt80');P.countParty('reconnect','3');
 R.partyVisibility(true,0,true);R.partyVisibility(false,10*60000,true);
 assert.deepEqual(log.filter(id=>K.PARTY_RETENTION_IDS.includes(id)),[],'no Phase C id while off');
 assert.deepEqual(log.filter(id=>id.startsWith('mp:')).sort(),['mp:first_party','mp:in','mp:live_guest','mp:live_guest_link'],'exactly what Phase A and B send');
 // The visibility listener is not even installed while off.
 let added=0;global.document={visibilityState:'visible',addEventListener:()=>{added++;},removeEventListener:()=>{}};
 R.watchPartyAway(()=>true)();assert.equal(added,0);delete global.document;
 // Connection: the default probe interval reads the same switch and is 0 when unset.
 assert(/rttProbeMs = deps\.rttProbeMs \?\? \(process\.env\.NEXT_PUBLIC_ANALYTICS_PARTY_RETENTION === '1' \? RTT_PROBE_MS : 0\)/.test(read('lib/multiplayer/connection.ts')));
 // Loader: 'off' without any network call.
 let calls=0;const off=await PR.loadPartyRetention('2026-10-10','2026-10-20',{fetchImpl:()=>{calls++;throw new Error('no');}});
 assert.equal(off.status,'off');assert.equal(calls,0);
 // The card renders nothing while off.
 const {card}=renderCard();assert.equal(card,'');
});

await ok('switched on: guest_new / rtt / reconnect / min_away',()=>{
 process.env[SWITCH]='1';
 try{
  const f=fresh(0),{log,R,P}=f,n=id=>log.filter(x=>x===id).length;
  P.countParty('live_guest','link',0);P.countParty('ended',undefined,1);P.countParty('live_guest','typed',2);
  assert.equal(n('mp:guest_new'),1,'once per session');
  const g=fresh(1);g.P.countParty('live_guest','link',0);assert.equal(g.log.includes('mp:guest_new'),false,'a returning device is not new');
  const h=fresh(null);h.P.countParty('live_guest','link',0);assert.equal(h.log.includes('mp:guest_new'),false,'unknown is not new');
  const host=fresh(0);host.P.countParty('live_host',undefined,0);assert.equal(host.log.includes('mp:guest_new'),false,'hosts are not guests');
  for(const b of ['rtt_lt80','rtt_80_150','rtt_150_300','rtt_300p','rtt_9000','K7MQ4R'])P.countParty('rtt',b);
  assert.deepEqual(log.filter(x=>x.startsWith('mp:rtt')),['mp:rtt_lt80','mp:rtt_80_150','mp:rtt_150_300','mp:rtt_300p'],'only the four bands');
  P.countParty('reconnect','2');P.countParty('reconnect','99');P.countParty('reconnect','x');P.countParty('reconnect','0');
  assert.equal(n('mp:reconnect'),22,'2 + capped 20');
  const MIN=60000;
  R.partyVisibility(true,0,true);R.partyVisibility(false,2.5*MIN,true);assert.equal(n('mp:min_away'),2);
  R.partyVisibility(true,10*MIN,true);R.partyVisibility(false,10*MIN+0.6*MIN,true);assert.equal(n('mp:min_away'),3,'carries the half minute');
  R.partyVisibility(true,20*MIN,true);R.partyVisibility(false,200*MIN,true);assert.equal(n('mp:min_away'),33,'one stretch counts at most 30 min');
  R.partyVisibility(true,300*MIN,false);R.partyVisibility(false,310*MIN,false);assert.equal(n('mp:min_away'),33,'not in a party: nothing');
  R.partyVisibility(true,400*MIN,true);R.partyVisibility(false,405*MIN,false);assert.equal(n('mp:min_away'),33,'party ended while away: nothing');
  for(const id of log)assert(K.isCountId(id),id);
 }finally{delete process.env[SWITCH];}
});

await ok('connection: median RTT from heartbeat echoes, recovered drops, probe; store + PartyHost band',()=>{
 const vm=require('node:vm'),ts=require('typescript'),req=require('node:module').createRequire(ROOT+'/package.json'),cache=new Map();
 const env={NEXT_PUBLIC_MULTIPLAYER:'1',NEXT_PUBLIC_MULTIPLAYER_URL:'http://localhost:8790/'};
 const resolveTs=(from,id)=>{const b=path.resolve(path.dirname(from),id);return fs.existsSync(b+'.ts')?b+'.ts':path.join(b,'index.ts');};
 const load=file=>{if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
  vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
   {exports:mod.exports,module:mod,Math,Date,JSON,Number,Array,Object,Error,Map,Set,Float64Array,Uint8Array,Symbol,console,process:{env},performance:{now:()=>0},
    require:id=>id.startsWith('.')?load(resolveTs(file,id)):req(id)});cache.set(file,mod.exports);return mod.exports;};
 const conn=load(path.join(ROOT,'lib/multiplayer/connection.ts')),idx=load(path.join(ROOT,'lib/multiplayer/index.ts')),st=load(path.join(ROOT,'lib/multiplayer/store.ts'));
 const make=(probe)=>{let now=1e6,seq=0;const timers=[],sockets=[];
  const clock={now:()=>now,setTimeout:(fn,ms)=>{const h={id:++seq,at:now+ms,fn};timers.push(h);return h.id;},clearTimeout:id=>{const i=timers.findIndex(x=>x.id===id);if(i>=0)timers.splice(i,1);},
   advance(ms){const end=now+ms;for(;;){timers.sort((a,b)=>a.at-b.at);const nx=timers[0];if(!nx||nx.at>end)break;timers.shift();now=Math.max(now,nx.at);nx.fn();}now=end;}};
  class WS{constructor(){this.readyState=0;this.sent=[];sockets.push(this);}send(s){this.sent.push(JSON.parse(s));}close(){this.readyState=3;}
   open(){this.readyState=1;this.onopen&&this.onopen();}recv(m){this.onmessage&&this.onmessage({data:JSON.stringify(m)});}drop(){this.readyState=3;this.onclose&&this.onclose();}}
  const m=new Map(),storage={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};
  const c=conn.createPartyConnection({WebSocketImpl:WS,now:clock.now,random:()=>0.5,setTimeout:clock.setTimeout,clearTimeout:clock.clearTimeout,
   visibility:{hidden:()=>false,on:()=>()=>{}},storage,...(probe===undefined?{}:{rttProbeMs:probe})});
  return {c,clock,sockets,last:()=>sockets[sockets.length-1]};};
 const LOOK=JSON.parse(JSON.stringify(load(path.join(ROOT,'lib/multiplayer/look.ts')).lookToWire(load(path.join(ROOT,'lib/town/customization.ts')).DEFAULT_CUSTOMIZATION)));
 const welcome=[20,1,1,'tok-abcdefghij012345',Date.now()+7200000,Date.now()+14400000,0,[[1,[2,3],LOOK,1,null]]];
 const e=make();e.c.join('k7m-q4r',{look:LOOK});let s=e.last();s.open();s.recv(welcome);
 assert.equal(e.c.rttMs,null,'no sample yet');
 let carry=0;const echo=(ms)=>{e.clock.advance(5000-carry);carry=ms;const b=s.sent.filter(x=>x[0]===9).pop();assert(b,'a beat went out');e.clock.advance(ms);s.recv([30,b[1]]);};
 echo(40);echo(120);echo(60);assert.equal(e.c.rttMs,60,'median of 40/120/60');
 s.recv([30,1]);assert.equal(e.c.rttMs,60,'an echo that does not match the last beat is ignored');
 assert.equal(e.c.reconnects,0);
 assert.equal(e.c.status,'live');s.drop();e.clock.advance(2000);s=e.last();s.open();s.recv(welcome);assert.equal(e.c.reconnects,1,'one drop recovered');
 // The store reads health on demand (no emit); bindConnection registers the source.
 let emits=0;const off=st.partyStore.subscribe(()=>emits++);const unbind=idx.bindConnection(e.c);const before=emits;
 assert.deepEqual(JSON.parse(JSON.stringify(st.partyStore.health())),{rttMs:60,reconnects:1});assert.equal(emits,before,'health() never emits');
 unbind();off();assert.deepEqual(JSON.parse(JSON.stringify(st.partyStore.health())),{rttMs:null,reconnects:0});
 e.c.join('k7m-q4r',{look:LOOK});assert.equal(e.c.rttMs,null,'join resets');assert.equal(e.c.reconnects,0);
 // Probe: off by default (a moving player sends no beat); with rttProbeMs a beat goes out at least that often.
 const movingBeats=(probe)=>{const x=make(probe);x.c.join('k7m-q4r',{look:LOOK});const w=x.last();w.open();w.recv(welcome);
  for(let i=0;i<120;i++){x.c.sendPose([i*10,0,0,0,0,0,0,0],x.clock.now());x.clock.advance(500);}return w.sent.filter(m=>m[0]===9).length;};
 assert.equal(movingBeats(undefined),0,'no probe while the switch is off');
 const pb=movingBeats(30000);assert(pb>=1&&pb<=3,'probe beats in 60 s: '+pb);
 // PartyHost: the band edges, and only fixed strings reach onTrack.
 const host=read('components/party/PartyHost.tsx');
 const band=new Function('return '+/export const rttBand = (\(ms: number\): string => [^;]+);/.exec(host)[1].replace('(ms: number): string','(ms)'))();
 assert.deepEqual([0,79,80,149,150,299,300,5000].map(band),['rtt_lt80','rtt_lt80','rtt_80_150','rtt_80_150','rtt_150_300','rtt_150_300','rtt_300p','rtt_300p']);
 assert(/track\.current\?\.\('rtt', rttBand\(h\.rttMs\)\)/.test(host)&&/track\.current\?\.\('reconnect', String\(h\.reconnects\)\)/.test(host));
 for(const site of ["track.current?.('leave'); trackHealth();","track.current?.('end'); trackHealth();","track.current?.('ended'); trackHealth();","track.current?.('kicked'); trackHealth();"])assert(host.includes(site),site);
 const importRe=/(?:import[^'"`]*from\s*|import\s*\(\s*|require\s*\(\s*)['"`]([^'"`]+)['"`]/g;
 for(const f of ['components/party/PartyHost.tsx','lib/multiplayer/connection.ts','lib/multiplayer/store.ts','lib/multiplayer/index.ts'])
  for(const x of read(f).matchAll(importRe))assert(!/lib\/analytics|deviceMarks/.test(x[1]),`${f} imports ${x[1]}`);
});

// ---- the reference aggregation ----
const TODAY='2026-10-22',d=n=>PR.addDays(TODAY,n),hex=(p,i)=>(p+String(i).padStart(3,'0')).padEnd(32,'0').replace(/[^0-9a-f]/g,'a');
function plan(){
 const s=[],add=(pid,day,returning,counts={})=>s.push({day,playerId:pid,returning,counts});
 for(let i=0;i<12;i++){const p=hex('a',i);add(p,d(-10),false,{'mp:in':1,'mp:open_link':1,...(i<11?{'mp:guest_new':1}:{})});if(i<7)add(p,d(-9),true);if(i<9)add(p,d(-5),true);}
 for(let i=0;i<15;i++){const p=hex('b',i);add(p,d(-9),false,i===0?{'mp:created':1}:{});if(i<3)add(p,d(-8),true);if(i<5)add(p,d(-6),true);if(i===14)add(p,d(-3),true,{'mp:in':1});}
 for(let i=0;i<5;i++)add(hex('c',i),d(-1),false);// cohort yesterday: D1 window not finished (today is not complete)
 for(let i=0;i<4;i++)add(hex('e',i),d(0),true,{'mp:in':1});// today only
 add(hex('f',0),d(-20),false,{'mp:in':1});// outside the 14 days of raw rows
 for(let i=0;i<3;i++)add(null,d(-4),false,{'mp:open_link':1});// no player key: counted as sessions, never as a player
 return s;
}
await ok('reference aggregation: cohorts, windows, suppression, split, k; no player id',()=>{
 const r=PR.computeRetention(plan(),d(-30),d(0),TODAY);
 assert.equal(r.from,d(-14));assert.equal(r.to,TODAY);assert.equal(r.lastCompleteDay,d(-1));
 assert.deepEqual(r.groups.party,{players:16,d1Eligible:12,d1Rate:0.5833,d7Eligible:12,d7Rate:0.75},'today’s party players count, but their windows are not finished');
 assert.deepEqual(r.groups.solo,{players:20,d1Eligible:15,d1Rate:0.2,d7Eligible:15,d7Rate:0.4},'party later than the first day stays solo; yesterday’s cohort waits');
 assert.deepEqual(r.newPlayers,{sessions:35,invited:15,organic:20});
 assert.deepEqual(r.virality,{guestNew:11,created:null,k:null},'one party started is under 10');
 // Suppression: a range holding only the party cohort's first day.
 const small=PR.computeRetention(plan().filter(x=>x.day===d(-10)).slice(0,9),d(-10),d(-10),TODAY);
 assert.deepEqual(small.groups.party,{players:null,d1Eligible:null,d1Rate:null,d7Eligible:null,d7Rate:null});
 assert.deepEqual(small.newPlayers,{sessions:null,invited:null,organic:null});
 const keys=[];const walk=o=>{if(o&&typeof o==='object')for(const [k,v] of Object.entries(o)){keys.push(k);walk(v);}};walk(r);
 assert(!keys.some(k=>/player_?id|^pid$|session_?id|^id$/i.test(k)),'no id key: '+keys.join(','));
 assert(!/[0-9a-f]{32}/.test(JSON.stringify(r)),'no 32-hex id value');
 // shapeRetention keeps only known keys and re-applies the floor.
 const sh=PR.shapeRetention({from:'a',to:'b',last_complete_day:'c',groups:{party:{players:9,d1_eligible:9,d1_rate:0.5,player_id:'x'},solo:{players:30,d1_eligible:30,d1_rate:0.4,d7_eligible:3,d7_rate:1}},
  new_players:{sessions:40,invited:12,organic:28},virality:{guest_new:12,created:24},pid:'deadbeef'},[{week_start:'2026-10-05',data:{players:120,minutes:8,party_players:30}}]);
 assert.deepEqual(sh.groups.party,{players:null,d1Eligible:null,d1Rate:null,d7Eligible:null,d7Rate:null});
 assert.equal(sh.groups.solo.d7Rate,null);assert.equal(sh.virality.k,0.5);assert.equal(sh.weekly[0].minutes,null);
 assert(!JSON.stringify(sh).includes('deadbeef')&&!JSON.stringify(sh).includes('player_id'));
});

await ok('sql (static): service_role only, aggregates only, suppression under 10, legal flag',()=>{
 const sql=read(MIGRATION),body=sql.replace(/--.*$/gm,'');
 assert(/LEGAL SIGN-OFF REQUIRED/.test(sql)&&/NEXT_PUBLIC_ANALYTICS_PARTY_RETENTION=1/.test(sql),'header flags the legal review and the switch');
 for(const fn of ['analytics_party_retention\\(date, date\\)','analytics_sponsor_week_snapshot\\(\\)','analytics_sponsor_weekly_read\\(integer\\)','analytics_sponsor_round\\(bigint\\)']){
  assert(new RegExp(`revoke all on function public\\.${fn} from public, anon, authenticated;`).test(body),'revoke '+fn);
  assert(new RegExp(`grant execute on function public\\.${fn} to service_role;`).test(body),'grant '+fn);
 }
 assert(!/grant[^;]*(anon|authenticated)/.test(body),'never granted to anon / authenticated');
 assert(/enable row level security/.test(body)&&/revoke all on table public\.analytics_sponsor_weekly from public, anon, authenticated;/.test(body));
 assert(!/create policy/i.test(body),'no policy: service_role (bypassrls) only');
 const ret=/create or replace function public\.analytics_party_retention[\s\S]*?\$\$;/.exec(body)[0];
 const out=ret.slice(ret.lastIndexOf('select jsonb_build_object('));
 assert(!/player_id|'pid'|session_id|'id'/.test(out),'the output names no player or session id');
 const outKeys=[...out.matchAll(/'([a-z_0-9]+)'\s*,/g)].map(m=>m[1]);
 assert(outKeys.length>=10&&outKeys.every(k=>!/player_?id|pid/.test(k)),outKeys.join(','));
 assert.equal((ret.match(/>= 10/g)||[]).length,10,'every count and rate is floored at 10');
});

await ok('sql: the retention on a throwaway Postgres matches the TypeScript',async()=>{
 const bin=n=>{for(const dir of (process.env.PATH||'').split(':').concat(['/opt/homebrew/bin','/usr/local/bin','/usr/lib/postgresql/16/bin','/usr/lib/postgresql/15/bin','/usr/lib/postgresql/14/bin'])){const f=path.join(dir,n);if(fs.existsSync(f))return f;}return null;};
 const initdb=bin('initdb'),pgctl=bin('pg_ctl'),psqlBin=bin('psql');
 if(process.env.SKIP_PG_TESTS||!initdb||!pgctl||!psqlBin){console.log('  SKIP sql: no local Postgres (initdb/pg_ctl/psql) found');return 'skip';}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fipgr-')),port=String(40000+(process.pid+1733)%20000),quiet={stdio:['ignore','ignore','pipe']};
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
  assert.equal(results.find(([f])=>f===path.basename(MIGRATION))[1],OK_ROW,'self-check row');
  assert.equal(runFile(MIGRATION),OK_ROW,'safe to run twice');
  const today=psql(`select (now() at time zone 'utc')::date`),D=n=>PR.addDays(today,n);
  const q=s=>`'${s.replace(/'/g,"''")}'`,svc={role:'service_role'};
  const ingest=p=>psql(`select analytics_ingest(${q(JSON.stringify(p))}::jsonb)`,svc);
  // The same plan, re-dated to the database's today.
  const rows=plan().map(x=>({...x,day:PR.addDays(today,Math.round((Date.parse(x.day)-Date.parse(TODAY))/86400000))}));
  rows.forEach((x,i)=>{const id=('reten'+String(i).padStart(3,'0')).padEnd(20,'x');
   ingest({type:'start',session:id,path:'/',day:x.day,visitor_hash:String(i%10).repeat(32),device:'phone',source:'direct',is_returning:x.returning,...(x.playerId?{player_id:x.playerId}:{})});
   ingest({type:'beat',session:id,engaged_ms:120000,counts:x.counts});});
  const cmp=(from,to)=>{
   const sql=PR.shapeRetention(JSON.parse(psql(`select analytics_party_retention('${from}','${to}')`,svc)));
   const tsr=PR.computeRetention(rows,from,to,today);
   assert.deepEqual(sql,tsr,`${from}..${to}`);return sql;};
  const all=cmp(D(-30),D(0));assert.equal(all.groups.party.players,16);assert.equal(all.newPlayers.invited,15);
  cmp(D(-10),D(-10));cmp(D(-9),D(-2));cmp(D(-2),D(-12));
  const raw=psql(`select analytics_party_retention('${D(-30)}','${D(0)}')`,svc);
  assert(!/[0-9a-f]{32}/.test(raw)&&!/player_id|"pid"|session_id|"id"/.test(raw),'no id in the raw answer');
  for(const role of ['anon','authenticated']){
   assert.throws(()=>psql(`select analytics_party_retention('${today}','${today}')`,{role}),/permission denied/,role);
   assert.throws(()=>psql(`select analytics_sponsor_week_snapshot()`,{role}),/permission denied/,role);
   assert.throws(()=>psql(`select * from analytics_sponsor_weekly`,{role}),/permission denied/,role);
  }
  // Weekly snapshot: finished weeks still inside the raw rows, stored once, never overwritten; rounded the sponsor way.
  const n1=Number(psql('select analytics_sponsor_week_snapshot()',svc)),n2=Number(psql('select analytics_sponsor_week_snapshot()',svc));
  assert.equal(n1,1,'exactly one finished week lies fully inside the raw rows');assert.equal(n2,0,'idempotent');
  const weekly=PR.shapeWeekly(JSON.parse(psql('select analytics_sponsor_weekly_read(12)',svc)));
  assert.equal(weekly.length,n1);for(const w of weekly){assert.equal(new Date(w.weekStart+'T00:00:00Z').getUTCDay(),1,'a Monday');
   for(const k of ['sessions','players','partyPlayers','partySessions','minutes'])assert(w[k]===null||(w[k]>=10&&w[k]%10===0),k+'='+w[k]);}
  assert.equal(psql(`select concat_ws(',', coalesce(analytics_sponsor_round(9)::text, 'null'), analytics_sponsor_round(14), analytics_sponsor_round(995), analytics_sponsor_round(1049), analytics_sponsor_round(1051))`,svc),'null,10,1000,1000,1100');
 }finally{try{cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-m','immediate','stop'],quiet);}catch{}fs.rmSync(dir,{recursive:true,force:true});}
});

await ok('route, loader states, card render, docs and policy',async()=>{
 const route=read('app/api/admin/party-retention/route.ts');
 assert(/verifySession\(cookies\(\)\.get\(ADMIN_COOKIE\)\?\.value,Date\.now\(\)\)/.test(route)&&/status:401/.test(route)&&/validDay\(from\)/.test(route),'same admin auth as the other routes');
 const res=(status,json)=>async()=>({status,ok:status<400,text:async()=>JSON.stringify(json)});
 const envBak={u:process.env.NEXT_PUBLIC_SUPABASE_URL,k:process.env.SUPABASE_SERVICE_ROLE_KEY};
 try{
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  assert.equal((await PR.loadPartyRetention('2026-10-01','2026-10-02',{on:true,now:1})).status,'not-configured');
  process.env.NEXT_PUBLIC_SUPABASE_URL='https://x.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='k';
  assert.equal((await PR.loadPartyRetention('2026-10-03','2026-10-04',{on:true,now:1,fetchImpl:res(404,null)})).status,'needs-migration');
  assert.equal((await PR.loadPartyRetention('2026-10-05','2026-10-06',{on:true,now:1,fetchImpl:res(500,null)})).status,'error');
  const seen=[];const good=await PR.loadPartyRetention('2026-10-07','2026-10-08',{on:true,now:1,fetchImpl:async(url)=>{seen.push(url.split('/rpc/')[1]);
   return {status:200,ok:true,text:async()=>JSON.stringify(url.endsWith('weekly_read')?[{week_start:'2026-10-05',data:{players:40}}]:url.endsWith('snapshot')?1:{groups:{party:{players:12}},new_players:{},virality:{}})};}});
  assert.equal(good.status,'ok');assert.equal(good.groups.party.players,12);assert.equal(good.weekly[0].players,40);
  assert.deepEqual(seen,['analytics_party_retention','analytics_sponsor_week_snapshot','analytics_sponsor_weekly_read']);
 }finally{if(envBak.u===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;else process.env.NEXT_PUBLIC_SUPABASE_URL=envBak.u;
  if(envBak.k===undefined)delete process.env.SUPABASE_SERVICE_ROLE_KEY;else process.env.SUPABASE_SERVICE_ROLE_KEY=envBak.k;}
 // Card: types only from the server module; mounted with one line; fixture render.
 const cardSrc=read('app/admin/PartyRetentionCard.tsx');
 assert(/^import type \{[^}]+\} from '@\/lib\/analytics\/partyRetention';$/m.test(cardSrc)&&!/^import (?!type)[^\n]*partyRetention'/m.test(cardSrc),'types only');
 assert(/<PartyRetentionCard from=\{report\.from\} to=\{report\.to\}\/>/.test(read('app/admin/AnalyticsDashboard.tsx')));
 process.env[SWITCH]='1';
 try{
  const {view,card}=renderCard({...PR.computeRetention(plan(),'2026-10-01','2026-10-22',TODAY),weekly:PR.shapeWeekly([{week_start:'2026-10-12',data:{players:340,party_players:60,minutes:5200}},{week_start:'2026-10-05',data:{players:290,party_players:null,minutes:4100}}])});
  assert(card.includes('Loading'),'switched on: the card renders (and would fetch)');
  assert(/Friends &amp; coming back/.test(view)&&/58%/.test(view)&&/75%/.test(view)&&/20%/.test(view)&&/&lt;10/.test(view)&&/data-status="ok"/.test(view)&&/data-retention-weekly/.test(view)&&/5,200/.test(view),'fixture render');
  const missing=renderCard({...PR.emptyRetention('needs-migration')}).view;
  assert(/Not available yet/.test(missing)&&/20261022_analytics_party_retention\.sql/.test(missing),'graceful not-migrated state');
  assert(!/[0-9a-f]{32}/.test(view),'no id in the card');
 }finally{delete process.env[SWITCH];}
 // Docs, policy, test chain.
 const doc=read('docs/analytics-multiplayer-plan.md');
 assert(/Supabase steps for the owner/.test(doc)&&doc.includes('20261022_analytics_party_retention.sql')&&doc.includes(SWITCH),'owner steps in the plan');
 const pp=read('components/privacy/PrivacyPolicy.tsx');
 assert(/\[LAWYER\] Oct 22 2026 PHASE C, NOT LIVE/.test(pp)&&/LINKS PARTY PLAY TO THE ANONYMOUS PLAYER/.test(pp),'[LAWYER] flag');
 const live=pp.replace(/^[\s\S]*?export default function/,'');assert(!/come back\s+the next day or within a week/.test(live),'the live policy text is unchanged');
 assert(JSON.parse(read('package.json')).scripts.test.includes('node tests/admin-party-retention.cjs'),'in the test chain');
});

function renderCard(data){
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 const css=new Proxy({},{get:(_,k)=>k==='__esModule'?false:typeof k==='string'?k:undefined});// class name = the CSS-module key (so the fixture page can use the real stylesheet)
 const C=createLoader({'admin.module.css':css,'IslandTravelMap.module.css':css})('app/admin/PartyRetentionCard.tsx');
 const card=renderToStaticMarkup(React.createElement(C.default,{from:'2026-10-01',to:'2026-10-22'}));
 const view=data?renderToStaticMarkup(React.createElement(C.PartyRetentionView,{data})):'';
 if(data&&data.status==='ok'&&process.env.RETENTION_HTML_OUT){
  const style=read('app/admin/admin.module.css');
  fs.writeFileSync(process.env.RETENTION_HTML_OUT,`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${style}</style><main class="page" style="padding:16px">${view}</main>`);
 }
 return {card,view};
}

console.log(`admin-party-retention: ${passed} checks passed`);
})().catch(e=>{console.error(e);process.exit(1);});
