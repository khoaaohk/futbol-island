#!/usr/bin/env node
// Admin sponsor Overview (Oct 20 2026; owner: "capture behaviour to sell sponsorships: how many games played, how many t-shirts
// designed, cleats designed, player cards found, videos/stories watched, books purchased, read duration, quizzes taken").
//  1. The `en:` ids: on the allowlist, the right shape, and the repeated lists match the real game data.
//  2. The call sites exist where the events happen, and stay privacy-safe (fixed keys only).
//  3. The pure helpers (lib/analytics/sponsor.ts): classification, totals, small-number suppression, "not tracked yet",
//     trends, change, CSV; the read-time buckets and clock.
//  4. The device / country split: TypeScript (lib/analytics/sponsorSplit.ts) = SQL (20261021_analytics_sponsor_split.sql) on a
//     throwaway Postgres, grants and the self-check row.
//  5. The dashboard wiring: tabs, the Overview, the route behind the admin session, no server modules in the client.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const {createLoader}=require('./summit-harness.cjs');
const load=createLoader();
const read=f=>fs.readFileSync(f,'utf8');
const MIGRATION='supabase/migrations/20261021_analytics_sponsor_split.sql',OK_ROW='OK, sponsor split installed';
let passed=0;const ok=async(name,fn)=>{try{const r=await fn();if(r!=='skip')passed++;}catch(e){console.error('FAIL',name);throw e;}};

(async()=>{
const K=load('lib/analytics/countIds.ts'),S=load('lib/analytics/sponsor.ts'),SP=load('lib/analytics/sponsorSplit.ts'),C=load('lib/analytics/core.ts');

await ok('ids: allowlisted, well formed, lists match the game',()=>{
 for(const id of K.ENGAGE_FIXED_IDS){assert(K.isCountId(id),id);assert(K.COUNT_KEY_RE.test(id),id);}
 assert(K.isCountId('en:cardn_1')&&K.isCountId('en:cardn_999'));
 for(const bad of ['en:cardn_0','en:cardn_1000','en:game_doom','en:bookbuy_nobody','en:jerseyp_tartan','en:read_5m'])assert(!K.isCountId(bad),bad);
 assert.equal(new Set(K.ENGAGE_FIXED_IDS).size,K.ENGAGE_FIXED_IDS.length,'no duplicates');
 const cab=[...read('lib/arcade/arcadeCatalog.ts').matchAll(/\{id:'([a-z]+)',name:/g)].map(m=>m[1]);
 assert.deepEqual([...K.ENGAGE_ARCADE_GAMES].sort(),cab.sort(),'arcade cabinets');
 const jersey=read('lib/shop/jersey.ts'),boots=read('lib/shop/boots.ts');
 assert.deepEqual([...K.ENGAGE_JERSEY_PATTERNS],/export type PatternId=([^;]+);/.exec(jersey)[1].split('|').map(s=>s.trim().replace(/'/g,'')),'jersey patterns');
 assert.deepEqual([...K.ENGAGE_BOOT_PATTERNS],/export type PatternKind=([^;]+);/.exec(boots)[1].split('|').map(s=>s.trim().replace(/'/g,'')),'boot patterns');
 assert.deepEqual([...K.ENGAGE_BOOT_MODELS],/export type BootModel=([^;]+);/.exec(boots)[1].split('|').map(s=>s.trim().replace(/'/g,'')),'boot models');
 const rewards=/export const REWARD_KINDS:readonly RewardKind\[\]=\[([^\]]+)\]/.exec(read('lib/town/cardRewards.ts'))[1].split(',').map(s=>s.trim().replace(/'/g,''));
 assert.deepEqual(K.ENGAGE_CARD_SOURCES.slice(0,rewards.length),rewards,'card offer kinds');
 const books=[...read('lib/books/catalog.ts').matchAll(/^ ([a-z]+): \{ itemId:/gm)].map(m=>m[1]);
 assert.deepEqual([...K.ENGAGE_BOOKS],books,'book keys');
 assert.equal(K.MAX_BEAT_COUNTS,64,'one beat still carries at most 64 ids');
});

await ok('call sites: where the events happen, fixed keys only',()=>{
 const has=(f,re,why)=>assert.match(read(f),re,`${f}: ${why}`);
 has('components/ArcadeRoom.tsx',/if\(!game\)return;countArcadeGame\(game\);return enterActivity/,'one play per launch');
 has('components/shop/JerseyStudio.tsx',/countDesignSave\('jersey'\);countJerseyStyle\(d\.pattern\);/,'the pattern only');
 has('components/shop/BootStudio.tsx',/countDesignSave\('boots'\);countBootStyle\(design\.model,design\.pattern\);/,'model + pattern only');
 has('lib/town/cardRewardStore.ts',/if\(addToCollection\(name\)\)countCardFound\(offer\.kind,cardTier\(name\),cardNumber\(name\)\)/,'new cards only');
 has('lib/arcade/arcadeWallet.ts',/&&addToCollection\(name\)\)countCardFound\('pack',null,cardNumber\(name\)\)/,'pack cards');
 has('lib/town/backpackStore.ts',/if\(addToCollection\(name\)\)\{last=name;countCardFound\('starter',null,cardNumber\(name\)\);\}/,'starter cards');
 has('components/CardFilmPlayer.tsx',/countFilmOpen\(\);return enterActivity\('films'\)/,'film open');
 has('components/CardFilmPlayer.tsx',/if\(!ended\)\{ended=true;countFilmEnd\(\);\}/,'film end once');
 has('components/PlayerPopUpBook.tsx',/countBookOpen\(bookId\);const stopClock=startReadClock\(\)/,'book open + clock');
 has('components/PlayerPopUpBook.tsx',/if\(next===story\.pages\.length-1&&!endCounted\.current\)\{endCounted\.current=true;countBookEnd\(bookId\);\}/,'last page once');
 has('components/VendingMachine.tsx',/if\(item\.storyId\)countBookBuy\(item\.storyId\);/,'the book key');
 const ev=read('lib/analytics/sponsorEvents.ts');
 assert(!/^import(?! type)[^\n]*(lib\/shop|books\/catalog|cardCollection|cardTiers)/m.test(ev)&&!/^import[^\n]*'\.\.\/(shop|books|town)/m.test(ev),'the event helpers read nothing about the game');
 assert(!/fetch\(|setInterval|setTimeout|localStorage/.test(ev),'no request, timer or storage');
});

await ok('read time: buckets and a foreground-only clock',()=>{
 const E=createLoader({tracker:{count:id=>E_counts.push(id)}})('lib/analytics/sponsorEvents.ts');var E_counts=[];
 assert.deepEqual([0,59_999,60_000,179_999,180_000,599_999,600_000].map(E.readBucket),['read_1m','read_1m','read_3m','read_3m','read_10m','read_10m','read_long']);
 for(const [b] of K.ENGAGE_READ_BUCKETS)assert(K.isCountId('en:'+b));
 let t=0,vis='visible';const ls=new Map();
 global.document={get visibilityState(){return vis;},addEventListener:(k,f)=>ls.set(k,f),removeEventListener:k=>ls.delete(k)};
 try{
  const stop=E.startReadClock(()=>t);t=100_000;vis='hidden';ls.get('visibilitychange')();t=900_000;vis='visible';ls.get('visibilitychange')();t=950_000;stop();stop();
  assert.deepEqual(E_counts,['en:read_3m'],'150 s visible (the hidden 800 s do not count), counted once');
  assert(!ls.size,'listener removed');
  E_counts.length=0;const quick=E.startReadClock(()=>t);t+=1500;quick();assert.deepEqual(E_counts,[],'an accidental open is not counted');
 }finally{delete global.document;}
});

// Synthetic sessions → day rollups (the real core.ts), then the sponsor report.
const session=(id,day,counts,o={})=>({id,day,visitorHash:id,startedAt:day+'T18:00:00Z',entryPath:'/',country:o.country??'US',region:null,device:o.device??'phone',source:'direct',
 referrerHost:null,utmSource:null,utmMedium:null,utmCampaign:null,flags:{},returning:null,hasCode:null,playerId:null,engagedMs:o.ms??120000,pageviews:2,lastSeenAt:day+'T18:10:00Z',
 areaMs:{island:o.ms??120000},placeMs:{},activityMs:o.book?{book:o.book}:{},cells:{},counts});
const many=(n,day,counts,o)=>Array.from({length:n},(_,i)=>session(`${day}-${i}-${Object.keys(counts).join()}`,day,counts,o));
const build=(days,prevDays=null,extra={})=>{
 const rollups=Object.entries(days).map(([d,ss])=>C.rollupDay(d,ss)),merged=C.mergeRollups(rollups);
 const prev=prevDays?(()=>{const r=Object.entries(prevDays).map(([d,ss])=>C.rollupDay(d,ss));return {from:r[0].day,to:r[r.length-1].day,merged:C.mergeRollups(r)};})():null;
 return S.buildSponsor({from:rollups[0].day,to:rollups[rollups.length-1].day,merged,rollups,prev,labels:{card:n=>n===7?'Lionel Messi':undefined,book:k=>k==='messi'?'Messi: Keep going, together':undefined,lesson:id=>id==='learn7_roles'?'Meet Your Team':undefined},...extra});
};
const M=(r,id)=>r.metrics.find(m=>m.id===id);

await ok('classification: one metric per counter, same rule as the SQL',()=>{
 const cases={'en:game_runner':'games','su:kick_play':'games','sh:save_jersey':'shirts','sh:save_boots':'cleats','en:card_ball':'cards','en:cardtier_icon':null,'en:cardn_7':null,
  'le:learn7_roles':'watched','en:film_end':'watched','en:bookend_messi':'watched','tu:finish':'watched','en:bookbuy_messi':'books','ls:learn7_roles':'quizzes',
  'lf:learn7_roles':null,'en:film_open':null,'sh:open_jersey':null,'en:bookopen_messi':null,'en:read_3m':null,'fi:land':null};
 for(const [id,m] of Object.entries(cases))assert.equal(S.sponsorMetricOf(id),m,id);
 assert.deepEqual([...S.SPONSOR_METRICS],['games','shirts','cleats','cards','watched','books','reading','quizzes'],'the eight cards, in order');
});

await ok('before the new build is live: old counters count, new ones say "not tracked yet" (never a fake 0)',()=>{
 const r=build({'2026-10-18':[...many(6,'2026-10-18',{'su:kick_play':2,'sh:save_jersey':1,'sh:open_jersey':2,'le:learn7_roles':1,'lo:learn7_roles':1,'ls:learn7_roles':1,'lf:learn7_roles':1},{book:90_000})]});
 assert.equal(r.engageLive,false);
 const g=M(r,'games');assert.equal(g.status,'partial');assert.equal(g.total,12,'Summit Kick only');assert.match(g.gap,/Not tracked yet: Island Strikers/);
 for(const id of ['cards','books'])assert.equal(M(r,id).status,'none',id),assert.equal(M(r,id).total,null,id);
 assert.equal(M(r,'shirts').status,'ok');assert.equal(M(r,'shirts').total,6);
 const shirt=M(r,'shirts');assert.equal(shirt.stats.find(s=>s.label==='Saved per open').value,0.5);assert(shirt.breakdowns.find(b=>b.id==='style').pending);
 assert.equal(M(r,'watched').status,'partial');assert.equal(M(r,'watched').total,6,'lesson videos only');
 assert.equal(M(r,'reading').status,'ok');assert.equal(M(r,'reading').total,9,'6 × 90 s = 9 minutes');
 assert.equal(M(r,'quizzes').total,6);assert.equal(M(r,'quizzes').stats.find(s=>s.label==='Finished per start').value,1);
 assert.equal(M(r,'quizzes').breakdowns[0].items[0].label,'Meet Your Team');
 const csv=S.sponsorCsv(r);assert.match(csv,/Player cards found,,not tracked yet/);assert.match(csv,/^Metric,Part,Total,Previous period,Change,Unit,Status,How it is counted$/m);
});

await ok('after it is live: every part counts, items by name, small numbers withheld, change vs before',()=>{
 const day='2026-10-21',prevDay='2026-10-20';
 const r=build({[day]:[...many(5,day,{'en:game_runner':2,'en:game_tennis':1,'en:card_ball':1,'en:cardtier_regular':1,'en:cardn_7':1,'en:bookbuy_messi':1,'en:bookopen_messi':2,'en:bookend_messi':1,'en:read_3m':1,'en:film_open':1,'en:film_end':1,'le:learn7_roles':1},{book:240_000}),
   ...many(2,day,{'en:game_pinball':3,'en:card_pack':1})]},
  {[prevDay]:many(5,prevDay,{'en:game_runner':1})});
 assert.equal(r.engageLive,true);
 const g=M(r,'games');assert.equal(g.status,'ok');
 assert.equal(g.total,21,'5×(2+1) + 2×3: the total rests on the busiest id (5 sessions), so the 2-session pinball still adds up');
 const byGame=g.breakdowns.find(b=>b.id==='parts').items;assert.deepEqual(byGame.map(i=>[i.label,i.value]),[['Breakaway Run',10],['Futbol Tennis',5],['Futbol Pinball',null]],'an item under 5 sessions is withheld');
 assert.equal(g.prev,5);assert.equal(S.change(g.total,g.prev),3.2);
 const cards=M(r,'cards');assert.equal(cards.total,7);assert.equal(cards.breakdowns.find(b=>b.id==='top').items[0].label,'Lionel Messi');
 assert.equal(M(r,'books').total,5);assert.equal(M(r,'books').breakdowns[0].items[0].label,'Messi: Keep going, together');assert.equal(M(r,'books').stats[0].value,500,'100 coins each');
 assert.equal(M(r,'watched').total,15,'lessons + films + books');assert.equal(M(r,'watched').stats.find(s=>s.label==='Finished per start').value,15/15);
 const rd=M(r,'reading');assert.equal(rd.total,20,'5 × 4 min');assert.equal(rd.stats.find(s=>s.label==='Average minutes per open').value,2,'20 min / 10 opens');
 assert.deepEqual(M(r,'reading').breakdowns.find(b=>b.id==='length').items.map(i=>[i.label,i.value]),[['1–3 minutes',5]]);
 const small=build({[day]:many(3,day,{'en:game_runner':4})});assert.equal(M(small,'games').total,null,'3 sessions: <5');assert.equal(M(small,'cleats').total,0,'a real zero stays 0');
 assert.equal(S.change(null,3),null);assert.equal(S.change(3,0),null,'no % change from nothing');
 const csv=S.sponsorCsv(r);assert.match(csv,/Games played,,21,5,320%,plays,ok,/);assert.match(csv,/,Futbol Pinball,<5,/);
 assert(!/Lionel|Messi/.test(JSON.stringify(r.metrics.map(m=>m.parts))),'parts carry no names');
});

await ok('trend: a range under a week uses the 7 days ending on it',()=>{
 const days={};for(let i=0;i<7;i++){const d=C.addDays('2026-10-15',i);days[d]=many(5,d,{'sh:save_boots':i+1});}
 const rollups=Object.entries(days).map(([d,ss])=>C.rollupDay(d,ss));
 const r=S.buildSponsor({from:'2026-10-21',to:'2026-10-21',merged:C.mergeRollups(rollups.slice(-1)),rollups:rollups.slice(-1),prev:null,trendRollups:rollups});
 assert.deepEqual(M(r,'cleats').trend,[5,10,15,20,25,30,35]);assert.equal(r.trendDays.length,7);assert.equal(M(r,'cleats').daily.length,1);assert.equal(M(r,'cleats').prev,null);
 assert.deepEqual(C.resolveRange({range:'all'},new Date('2026-10-20T20:00:00Z')),{from:'2026-10-07',to:'2026-10-20'},'All = since analytics began');
});

await ok('split: TypeScript reference, suppression into withheld',()=>{
 const ss=[...many(5,'2026-10-20',{'en:game_runner':2,'ls:a':1},{device:'phone',country:'US',book:120000}),...many(2,'2026-10-20',{'en:game_runner':1},{device:'tablet',country:'GB'})];
 const sp=SP.computeSplit(ss,'2026-10-20','2026-10-20');
 assert.deepEqual(sp.devices,[{key:'phone',sessions:5,metrics:{games:10,quizzes:5,reading:10}}]);
 assert.deepEqual(sp.withheld.devices,{sessions:2,metrics:{games:2}});assert.equal(sp.sessions,7);
 assert.deepEqual(SP.shapeSplit({from:'a',to:'b',sessions:7,devices:[{key:'phone',sessions:5,metrics:{games:10,quizzes:5,readingMs:600000}}],countries:[],withheld:{devices:{sessions:2,metrics:{games:2}},countries:{sessions:0,metrics:{}}}}).devices,sp.devices);
});

await ok('dashboard: tabs, overview, route behind the session, client bundle stays small',()=>{
 const dash=read('app/admin/AnalyticsDashboard.tsx'),ov=read('app/admin/SponsorOverview.tsx'),route=read('app/api/admin/sponsor-split/route.ts');
 assert(/\['overview','Overview'\],\['engagement','Engagement'\],\['players','Players'\],\['live','Live'\]/.test(dash),'four tabs');
 assert(dash.includes("{tab==='overview'&&<SponsorOverview report={report}"),'the overview is the first tab');
 assert(/\{id:'all',label:'All'\}/.test(dash),'All preset');
 assert(route.indexOf('status:401')>0&&route.indexOf('status:401')<route.indexOf('loadSponsorSplit('),'session check first');
 for(const s of ['Download CSV','How these are counted','Not tracked yet','20261021_analytics_sponsor_split.sql','By device and country'])assert(ov.includes(s),s);
 for(const f of ['app/admin/SponsorOverview.tsx','lib/analytics/sponsor.ts','lib/analytics/sponsorSplit.ts'])assert(!/^import(?! type)[^\n]*(learningText|sponsorLabels|sponsorAdmin|analytics\/store|'\.\/learning'|\/report')/m.test(read(f)),f+': no server data in the client');
 assert(/report\.sponsor=buildSponsor\(/.test(read('lib/analytics/report.ts')));
 assert(read('docs/admin-sponsor-insights.md').includes('20261021_analytics_sponsor_split.sql'),'the doc names the migration');
});

await ok('sql: the split on a throwaway Postgres matches the TypeScript',async()=>{
 const bin=n=>{for(const d of (process.env.PATH||'').split(':').concat(['/opt/homebrew/bin','/usr/local/bin','/usr/lib/postgresql/16/bin','/usr/lib/postgresql/15/bin','/usr/lib/postgresql/14/bin'])){const f=path.join(d,n);if(fs.existsSync(f))return f;}return null;};
 const initdb=bin('initdb'),pgctl=bin('pg_ctl'),psqlBin=bin('psql');
 if(process.env.SKIP_PG_TESTS||!initdb||!pgctl||!psqlBin){console.log('  SKIP sql: no local Postgres (initdb/pg_ctl/psql) found');return 'skip';}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fipgs-')),port=String(40000+(process.pid+911)%20000),quiet={stdio:['ignore','ignore','pipe']};
 try{
  cp.execFileSync(initdb,['-D',path.join(dir,'data'),'-U','postgres','--auth=trust','-E','UTF8','--locale=C'],quiet);
  cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-o',`-k ${dir} -p ${port} -c listen_addresses='' -c fsync=off -c TimeZone=UTC`,'-w','-l',path.join(dir,'log'),'start'],quiet);
  const args=['-h',dir,'-p',port,'-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-qAt'];
  const psql=(q,{role}={})=>cp.execFileSync(psqlBin,[...args,'-c',(role?`set role ${role}; `:'')+q],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const runFile=f=>cp.execFileSync(psqlBin,[...args,'-f',f],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split('\n').pop();
  psql('create role anon; create role authenticated; create role service_role bypassrls;');
  psql('alter default privileges in schema public grant all on tables to anon, authenticated, service_role; alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;');
  const files=fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort();
  assert.equal(files[files.length-1],path.basename(MIGRATION),'the newest migration');
  const results=files.map(f=>[f,runFile(path.join('supabase/migrations',f))]);
  assert.equal(results.find(([f])=>f===path.basename(MIGRATION))[1],OK_ROW,'self-check row');
  assert.equal(runFile(MIGRATION),OK_ROW,'safe to run twice');
  // Same rule in SQL and TypeScript for every id shape.
  const ids=['en:game_runner','su:kick_play','sh:save_jersey','sh:save_boots','sh:open_jersey','en:card_ball','en:cardtier_icon','en:cardn_7','le:learn7_roles','lo:learn7_roles',
   'en:film_end','en:film_open','en:bookend_messi','en:bookopen_messi','tu:finish','tu:open','en:bookbuy_messi','ls:learn7_roles','lf:learn7_roles','fi:land','en:read_3m'];
  for(const id of ids)assert.equal(psql(`select coalesce(analytics_sponsor_metric('${id}'),'')`)||null,S.sponsorMetricOf(id),id);
  const day=psql(`select (now() at time zone 'America/Los_Angeles')::date`);
  const q=s=>`'${s.replace(/'/g,"''")}'`,svc={role:'service_role'};
  const ingest=p=>psql(`select analytics_ingest(${q(JSON.stringify(p))}::jsonb)`,svc);
  const plan=[];
  for(let i=0;i<6;i++)plan.push({device:'phone',country:'US',counts:{'en:game_runner':2,'ls:learn7_roles':1,'le:learn7_roles':1},book:60000+i});
  for(let i=0;i<5;i++)plan.push({device:'desktop',country:'GB',counts:{'sh:save_jersey':1,'en:card_ball':2,'en:bookbuy_messi':1}});
  for(let i=0;i<2;i++)plan.push({device:'tablet',country:'FR',counts:{'en:game_tennis':3}});
  plan.forEach((p,i)=>{const id=('spons'+String(i).padStart(3,'0')).padEnd(20,'x');
   ingest({type:'start',session:id,path:'/',day,visitor_hash:String(i%10).repeat(32),device:p.device,country:p.country,source:'direct'});
   ingest({type:'beat',session:id,engaged_ms:120000,counts:p.counts,activity_ms:p.book?{book:p.book}:{}});});
  const sql=SP.shapeSplit(JSON.parse(psql(`select analytics_sponsor_split('${day}','${day}')`,svc)));
  const ts=SP.computeSplit(plan.map(p=>({device:p.device,country:p.country,counts:p.counts,activityMs:p.book?{book:p.book}:{}})),day,day);
  assert.deepEqual(sql.devices,ts.devices,'devices');assert.deepEqual(sql.countries,ts.countries,'countries');
  assert.deepEqual(sql.withheld,ts.withheld,'withheld');assert.equal(sql.sessions,13);
  assert.deepEqual(sql.devices.map(d=>d.key),['phone','desktop'],'the 2-session tablet row is withheld');
  assert.equal(sql.devices[0].metrics.reading,6,'six minutes of reading');
  for(const role of ['anon','authenticated'])assert.throws(()=>psql(`select analytics_sponsor_split('${day}','${day}')`,{role}),/permission denied/,role);
 }finally{try{cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-m','immediate','stop'],quiet);}catch{}fs.rmSync(dir,{recursive:true,force:true});}
});

console.log(`admin-sponsor: ${passed} checks passed`);
})().catch(e=>{console.error(e);process.exit(1);});
