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
//  6. Phase B (Oct 22 2026): the two new cards (Minutes with friends, Emotes used) and their CSV rows; the weekly Sponsor report
//     (ISO weeks, ≥10 suppression, rounded reach, "not tracked yet", CSV with the draft banner, print CSS) and a fixture render
//     (SPONSOR_REPORT_OUT=<file.html> writes it for a screenshot).
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
 assert.deepEqual([...S.SPONSOR_METRICS],['games','shirts','cleats','cards','watched','books','reading','quizzes','social','emotes'],'the ten cards, in order (Phase B: + social, emotes)');
 for(const id of ['mp:min','em:pick','em:e0','mp:created'])assert.equal(S.sponsorMetricOf(id),null,id+': not in the SQL device split (Phase C)');
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
 assert(/\['overview','Overview'\],\['engagement','Engagement'\],\['players','Players'\],\['live','Live'\],\['report','Sponsor report'\]/.test(dash),'five tabs (Phase B: Sponsor report)');
 assert(dash.includes("{tab==='report'&&<SponsorReport week={week??isoWeekOf(tm?.today??report.to)} onWeek={setWeek}/>}"),'the report tab');
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
  assert(files.includes(path.basename(MIGRATION)),'the migration is in the folder');// newer files (e.g. 20261022_analytics_party_retention.sql) run after it
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

// ---- Phase B: Minutes with friends and Emotes used.
const partyDay=(day,n,extra={})=>many(n,day,{'mp:min':6,'mp:in':1,'mp:created':1,'em:pick':4,'em:e0':2,'em:e8':1,'em:e14':1,'em:reach_1':1,'em:to_npc':1,...extra},{ms:600000});
await ok('social + emotes cards: not tracked before the build, then totals, stats, suppression, CSV rows',()=>{
 const before=build({'2026-10-18':many(6,'2026-10-18',{'sh:save_jersey':1})});
 for(const id of ['social','emotes']){assert.equal(M(before,id).status,'none',id);assert.equal(M(before,id).total,null);assert.match(M(before,id).gap,/2026-10-22/);}
 assert.match(S.sponsorCsv(before),/Minutes with friends,,not tracked yet/);assert.match(S.sponsorCsv(before),/Emotes used,,not tracked yet/);
 const day='2026-10-23',sessions=[...partyDay(day,8,{'mp:peak_2':1,'mp:len_15m':1}),...many(4,day,{'en:game_runner':1})];
 const rollups=[C.rollupDay(day,sessions)],merged=C.mergeRollups(rollups);
 const r=S.buildSponsor({from:day,to:day,merged,rollups,prev:null,labels:{emote:n=>n===0?'Wave':undefined}});
 const so=M(r,'social'),em=M(r,'emotes');
 assert.equal(so.status,'ok');assert.equal(so.total,48,'8 sessions × 6 minutes');
 const stat=(m,l)=>m.stats.find(s=>s.label===l).value;
 assert.equal(stat(so,'Share of island minutes in a party'),48/(8*10+4*2),'of 88 island minutes');
 assert.equal(stat(so,'Average party size'),2,'8 parties of 2');assert.equal(stat(so,'Parties per active player'),8/12);assert.equal(stat(so,'Sessions in a party'),8);
 assert.deepEqual(so.breakdowns.find(b=>b.id==='size').items.map(i=>[i.label,i.value]),[['2 players',8]]);
 assert.equal(em.status,'ok');assert.equal(em.total,32,'8 × (2+1+1) by emote number');
 assert.equal(stat(em,'Emotes per active player'),32/12);assert.equal(stat(em,'Emote engagement (sessions that emoted)'),8/12);assert.equal(stat(em,'Emotes per emoting session'),4);
 assert.equal(em.breakdowns.find(b=>b.id==='top').items[0].label,'Wave');
 assert.deepEqual(em.breakdowns.find(b=>b.id==='parts').items.map(i=>i.key).sort(),['ride','wheel']);
 const small=S.buildSponsor({from:day,to:day,merged:C.mergeRollups([C.rollupDay(day,partyDay(day,3))]),rollups:[],prev:null});
 assert.equal(M(small,'social').total,null,'3 sessions: <5');assert.equal(M(small,'social').stats.find(s=>s.label==='Average party size').value,null);
 const csv=S.sponsorCsv(r);assert.match(csv,/^Minutes with friends,,48,,,minutes,ok,/m);assert.match(csv,/^Emotes used,,32,,,emotes,ok,/m);assert.match(csv,/^,On foot \(the wheel\),24,,,emotes,,/m);
 const ov=read('app/admin/SponsorOverview.tsx');assert(/const NO_SPLIT=new Set<SponsorMetricId>\(\['social','emotes'\]\)/.test(ov)&&/data-split-na/.test(ov),'no fake device split for the new cards');
});

// ---- The weekly Sponsor report.
const W=load('lib/analytics/sponsorReport.ts');
await ok('weekly report: ISO weeks, reach rounding, ≥10 suppression, not tracked yet, CSV and print',()=>{
 assert.equal(W.isoWeekOf('2026-10-22'),'2026-W43');assert.deepEqual(W.weekRange('2026-W43'),{from:'2026-10-19',to:'2026-10-25'});
 assert.equal(W.isoWeekOf('2027-01-01'),'2026-W53');assert.deepEqual(W.weekRange('2026-W53'),{from:'2026-12-28',to:'2027-01-03'});assert.equal(W.weekRange('2025-W53'),null);
 assert.equal(W.shiftWeek('2026-W53',1),'2027-W01');assert.equal(W.shiftWeek('2026-W43',-1),'2026-W42');assert.equal(W.validWeek('2026-43'),false);
 assert.deepEqual([4,9,10,14,15,994,995,1000,1049,1050,12345].map(W.roundReach),[0,10,10,10,20,990,1000,1000,1000,1100,12300]);
 // A week with 30 party sessions and a few small groups.
 const days={};for(let i=0;i<7;i++){const d=C.addDays('2026-10-19',i);days[d]=[...partyDay(d,i<3?4:2,{'mp:peak_3_4':1,'le:learn7_roles':1,'ls:learn7_roles':1,'mp:lesson':1}),...many(3,d,{'em:e45':1,'em:pick':1})];}
 const rollups=Object.entries(days).map(([d,ss])=>C.rollupDay(d,ss)),merged=C.mergeRollups(rollups);
 const prevMerged=C.mergeRollups([C.rollupDay('2026-10-12',partyDay('2026-10-12',12))]);
 const rep=W.buildSponsorWeekly({week:'2026-W43',now:new Date('2026-10-26T12:00:00Z'),merged,prev:prevMerged,players:437,prevPlayers:8,returning:{share:0.42,sessions:40},relay:null,emoteLabel:n=>({0:'Wave',8:'Dance',14:'Kickflip',45:'Juggle'})[n]});
 const K2=Object.fromEntries(rep.kpis.map(k=>[k.id,k]));
 assert.deepEqual(rep.kpis.map(k=>k.id),['reach','minutes','social','emotes','return','learning']);
 assert.equal(K2.reach.value,440,'rounded to 10');assert.equal(K2.reach.prev,null,'8 players last week: withheld');assert.equal(K2.reach.change,null);
 const sessions=merged.totals.sessions;assert.equal(sessions,41);assert.equal(K2.minutes.value,20*10+21*2,'10 min per party session, 2 min for the rest');assert.equal(K2.minutes.status,'ok');
 assert.equal(K2.social.value,20*6,'20 party sessions × 6 min');assert.equal(K2.social.prev,72);assert.equal(K2.social.change,(120-72)/72);
 const sub=(k,l)=>k.sub.find(s=>s.label===l);
 assert.equal(sub(K2.social,'Average party size').value,3.5,'20 parties of 3–4');assert.equal(sub(K2.social,'Sessions with friends').value,20/41);
 assert.equal(K2.emotes.value,(20*4+21)/20,'all picks ÷ emoting sessions');assert.equal(sub(K2.emotes,'Sessions that emoted').value,20/41);
 assert.equal(K2.return.value,0.42);assert.equal(K2.learning.value,20);assert.equal(sub(K2.learning,'Learning with friends').value,20);
 assert.deepEqual(rep.partySize.bands.map(b=>[b.key,b.value]),[['peak_1',0],['peak_2',0],['peak_3_4',20],['peak_5_8',0],['peak_9_12',0],['peak_13_20',0]]);assert.equal(rep.partySize.source,'client');
 assert.deepEqual(rep.topEmotes.map(b=>[b.label,b.value]),[['Wave',40],['Juggle',21],['Dance',20],['Kickflip',20]],'each emote with 10+ sessions');
 // Relay totals win for party size when the relay reports parties; a band under 10 parties is withheld.
 const RT=load('lib/analytics/relayStatsTypes.ts'),relay=RT.shapeRelayStats(RT.relayStatsFixture('2026-10-19',7)).totals;
 const withRelay=W.buildSponsorWeekly({week:'2026-W43',merged,prev:null,players:9,prevPlayers:null,returning:null,relay});
 assert.equal(withRelay.partySize.source,'relay');assert.equal(withRelay.partySize.bands.find(b=>b.key==='peak_13_20').value,0);assert(withRelay.partySize.bands.find(b=>b.key==='peak_9_12').value>=10);
 const WK=Object.fromEntries(withRelay.kpis.map(k=>[k.id,k]));assert.equal(WK.reach.value,null,'9 players: withheld');assert.equal(WK.reach.status,'withheld');assert.equal(WK.return.status,'unavailable');
 // Small week: every number under 10 sessions is withheld; before PARTY_SINCE the party KPIs say not tracked yet.
 const tiny=W.buildSponsorWeekly({week:'2026-W43',merged:C.mergeRollups([C.rollupDay('2026-10-20',partyDay('2026-10-20',6))]),prev:null,players:6,prevPlayers:null,returning:{share:0.5,sessions:6},relay:null});
 for(const k of tiny.kpis)assert(k.value===null||k.value===0,k.id+' withheld: '+k.value);
 assert(tiny.partySize.bands.every(b=>b.value===null||b.value===0));assert.deepEqual(tiny.topEmotes,[]);
 const old=W.buildSponsorWeekly({week:'2026-W40',merged:C.mergeRollups([C.rollupDay('2026-10-01',many(30,'2026-10-01',{'le:learn7_roles':1}))]),prev:null,players:null,prevPlayers:null,returning:null,relay:null});
 const OK2=Object.fromEntries(old.kpis.map(k=>[k.id,k]));for(const id of ['social','emotes'])assert.equal(OK2[id].status,'not_yet',id);
 assert.equal(OK2.reach.status,'unavailable');assert.equal(OK2.learning.value,30);
 // CSV: banner first, combined totals only, "<10" for withheld, the export line; never a player id, a day row or a code.
 const csv=W.sponsorWeeklyCsv(rep),lines=csv.trim().split('\n');
 assert.equal(lines[0],'Internal draft: do not share outside the company until the privacy policy wording is approved.');
 assert(lines.includes('"Aggregate, anonymous counts; groups under 10 withheld; no personal information."'),'export line');
 assert.match(csv,/^Reach,440,,,/m);assert.match(csv,/^Social engagement,120,72,67%,/m);assert.match(csv,/^ {2}Average party size,3\.5,,,/m);assert.match(csv,/^Return rate,42%,/m);
 assert(!/2026-10-2[0-5],|[0-9a-f]{12}|player_id|pid/.test(csv.replace('(2026-10-19 to 2026-10-25)','')),'no day rows or ids');
 assert.match(W.sponsorWeeklyCsv(tiny),/^Reach,<10,/m);assert.match(W.sponsorWeeklyCsv(old),/^Social engagement,not tracked yet,/m);
 // The tab: draft banner, CSV + Print, print CSS (A4 / two cards per row), and nothing server-side in the client.
 const tab=read('app/admin/SponsorReport.tsx');
 for(const x of ['Internal draft: do not share outside the company until the privacy policy wording is approved.','data-sponsor-report-csv','window.print()','@media print','@page{size:A4','grid-template-columns:repeat(2,minmax(0,1fr))!important'])assert(tab.includes(x),x);
 for(const f of ['app/admin/SponsorReport.tsx','lib/analytics/sponsorReport.ts'])assert(!/^import(?! type)[^\n]*(sponsorLabels|sponsorAdmin|analytics\/store|relayStatsAdmin|dayAdmin|\/report')/m.test(read(f)),f+': client-safe');
 const route=read('app/api/admin/sponsor-report/route.ts');
 assert(route.indexOf('status:401')>0&&route.indexOf('status:401')<route.indexOf('loadRangeMerged('),'session check first');
 assert(/if\(from<oldestRaw\)return null;/.test(route)&&!/rows/.test(route.replace(/raw rows/g,'')),'reach is a count: the player rows never leave the route');
 return rep;
});

await ok('weekly report: fixture render (desktop + phone screenshot input)',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 // A CSS-module stand-in whose class names are the plain names (so the raw stylesheet styles the render for the screenshot).
 const css=new Proxy({},{get:(_,k)=>k==='__esModule'?false:typeof k==='string'?k:undefined});
 const L=createLoader({'admin.module.css':css,'SponsorReport.module.css':css});
 const Tab=L('app/admin/SponsorReport.tsx').default;
 const days={};for(let i=0;i<7;i++){const d=C.addDays('2026-10-19',i);days[d]=[...partyDay(d,40+i*3,{'mp:peak_3_4':1,'mp:peak_2':1,'le:learn7_roles':2,'ls:learn7_roles':1,'lf:learn7_roles':1,'mp:lesson':1}),...many(60,d,{'em:e45':1,'em:pick':1,'le:learn7_roles':1},{ms:900000})];}
 const rollups=Object.entries(days).map(([d,ss])=>C.rollupDay(d,ss)),merged=C.mergeRollups(rollups);
 const prev=C.mergeRollups([C.rollupDay('2026-10-14',partyDay('2026-10-14',200))]);
 const RT=load('lib/analytics/relayStatsTypes.ts');
 const rep=W.buildSponsorWeekly({week:'2026-W43',now:new Date('2026-10-26T09:00:00Z'),merged,prev,players:1234,prevPlayers:1100,returning:{share:0.42,sessions:800},
  relay:RT.shapeRelayStats(RT.relayStatsFixture('2026-10-19',7)).totals,emoteLabel:n=>({0:'Wave',8:'Dance',14:'Kickflip (scooter)',45:'Juggle (juggler)'})[n]});
 const html=renderToStaticMarkup(React.createElement(Tab,{week:'2026-W43',onWeek:()=>{},initial:rep}));
 assert(/Sponsor report/.test(html)&&/Internal draft: do not share outside the company/.test(html)&&/data-kpi="reach"/.test(html)&&/1,200/.test(html),'reach rounded to 100 over 1,000');
 for(const id of ['reach','minutes','social','emotes','return','learning'])assert(html.includes(`data-kpi="${id}"`),id);
 assert(/Party size \(party service\)/.test(html)&&/Top emotes/.test(html)&&/Aggregate, anonymous counts; groups under 10 withheld; no personal information\./.test(html));
 assert(!/[23456789BCDFGHJKMNPQRSTVWXYZ]{6}/.test(html.replace(/<[^>]+>/g,' ')),'no code-shaped text');
 if(process.env.SPONSOR_REPORT_OUT){
  const raw=f=>read(f).replace(/\.([A-Za-z][\w-]*)/g,(m,c)=>'.'+c);// identity class names (the proxy above)
  fs.writeFileSync(process.env.SPONSOR_REPORT_OUT,`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>:root{--btn-font:Arial,sans-serif;--btn-radius:999px;--btn-rim-width:2px;--btn-rim:#183b34;--btn-mint:#bff0d4;--btn-mint-edge:#7cc9a0;--btn-ink:#183b34}body{margin:0}${raw('app/admin/admin.module.css')}${raw('app/admin/SponsorReport.module.css')}</style></head><body><main class="page">${html}</main></body></html>`);
 }
});

console.log(`admin-sponsor: ${passed} checks passed`);
})().catch(e=>{console.error(e);process.exit(1);});
