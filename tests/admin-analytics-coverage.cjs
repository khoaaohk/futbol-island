#!/usr/bin/env node
// Admin analytics coverage (Oct 16 2026): nothing the game sends is silently dropped by the SQL, and nothing it collects is left
// unshown in /admin. Every area / place / activity key the client can produce (the fixed lists AND the ids built at the call
// sites: museum exhibits, arcade cabinets, Town's frame and panels, the tracker's page defaults) must be in the LATEST
// analytics_ingest allow-lists (the newest supabase/migrations/*.sql that replaces it), and every learning-counter id the client
// can produce must match that function's counts regex. With a local Postgres, every migration is replayed in order and a session
// carrying EVERY one of those ids is ingested, then read back: none may be missing.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),vm=require('vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const loaded=new Map();
function resolve(from,id){
 const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);
 for(const f of [base,base+'.ts',base+'.tsx'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;
 throw Error('cannot resolve '+id+' from '+from);
}
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);
 if(file.endsWith('.json')){const v={default:JSON.parse(fs.readFileSync(file,'utf8'))};loaded.set(file,v);return v;}
 const m={exports:{}};loaded.set(file,m.exports);
 vm.runInNewContext('(function(module,exports,require){'+ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText+'\n})',
  {Buffer,URL,URLSearchParams,TextDecoder,Date,Math,JSON,process:{env:{}},console,performance:{now:()=>0}})(m,m.exports,id=>id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id));
 loaded.set(file,m.exports);return m.exports;}
const read=f=>fs.readFileSync(f,'utf8');
const J=x=>JSON.parse(JSON.stringify(x));
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):/\.tsx?$/.test(e.name)?[path.join(d,e.name)]:[]);
const SOURCES=['lib','components','app'].flatMap(walk).map(f=>[f,read(f)]);
let passed=0;const ok=(name,fn)=>Promise.resolve().then(fn).then(r=>{if(r!=='skip')passed++;},e=>{console.error('FAIL',name);throw e;});

const IDS=load('lib/analytics/islandIds.ts'),CID=load('lib/analytics/countIds.ts'),C=load('lib/analytics/core.ts'),P=load('lib/analytics/islandPlaces.ts');
const ARCADE=load('lib/arcade/arcadeCatalog.ts');

// The LATEST analytics_ingest: its three allow-lists (area, place, activity, in that order) and its counts regex.
const INGEST_FILES=fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')&&/create or replace function public\.analytics_ingest/.test(read('supabase/migrations/'+f))).sort();
const LATEST=INGEST_FILES[INGEST_FILES.length-1],LATEST_SQL=read('supabase/migrations/'+LATEST);
const LISTS=[...LATEST_SQL.matchAll(/where key in \(([^)]*)\)/g)].map(m=>m[1].split(',').map(s=>s.trim().replace(/'/g,'')));
const [SQL_AREAS,SQL_PLACES,SQL_ACTIVITIES]=LISTS;
const COUNT_RE_SRC=/jsonb_each_text\(case when jsonb_typeof\(p->'counts'\)[^\n]*\n\s*where key ~ '([^']+)'/.exec(LATEST_SQL)?.[1];
const SQL_COUNT_RE=new RegExp(COUNT_RE_SRC||'(?!)');

// ---- Everything the client can produce --------------------------------------------------------------------------------------
const literalsAfter=(src,re)=>[...src.matchAll(re)].map(m=>m[1]);
const town=read('components/Town.tsx'),tracker=read('lib/analytics/tracker.ts');
// Areas: the tracker's page → area map, and every enterArea('…') call.
const areaOfLine=/const areaOf=[^\n]*/.exec(tracker)[0];
const CLIENT_AREAS=new Set([...literalsAfter(areaOfLine,/\?'([a-z_]+)'/g),...literalsAfter(areaOfLine,/:'([a-z_]+)';/g),
 ...SOURCES.flatMap(([,s])=>literalsAfter(s,/enterArea\('([a-z_]+)'\)/g)),...C.AREAS]);
// Activities: the fixed list, the tracker's page defaults, Town's frame and panel ids, every enterActivity('…') literal, and the
// templated ones (exhibit_<museum experience>, arcade_<cabinet>).
const activityNowSrc=tracker.slice(tracker.indexOf('function activityNow'),tracker.indexOf('const inWorld'));
const frameLine=/islandFrame\(location\.x[^\n]*/.exec(town)[0],panelLine=/const panelActivity=[^\n]*/.exec(town)[0];
const experienceIds=JSON.parse('['+/const IDS=\[([^\]]*)\]/.exec(read('components/museum/experiences/index.tsx'))[1].replace(/'/g,'"')+']');
const CLIENT_ACTIVITIES=new Set([...IDS.ACTIVITY_IDS,
 ...literalsAfter(activityNowSrc,/return '([a-z_]+)'/g),...literalsAfter(activityNowSrc,/\?'([a-z_]+)'/g),
 ...literalsAfter(frameLine,/[?:]'([a-z_]+)'/g),...literalsAfter(panelLine,/[?=]'([a-z_]+)'/g),...literalsAfter(panelLine,/:'([a-z_]+)'/g),
 ...SOURCES.flatMap(([,s])=>literalsAfter(s,/enterActivity\('([a-z_-]+)'\)/g)),
 ...experienceIds.map(id=>'exhibit_'+id),...ARCADE.arcadeCabinets.map(c=>'arcade_'+c.id)]);
// Places: the fixed list and everything placeAt returns anywhere on the heat-map grid.
const CLIENT_PLACES=new Set(IDS.PLACE_IDS);
for(let x=IDS.GRID.x0;x<IDS.GRID.x0+IDS.GRID.cols*IDS.GRID.size;x+=2)for(let z=IDS.GRID.z0;z<IDS.GRID.z0+IDS.GRID.rows*IDS.GRID.size;z+=2)CLIENT_PLACES.add(P.placeAt(x,z));
// Counts: the fixed ids, every lesson stage / question / option id, every literal count('…') call, and the ids built at the
// call sites (Kit Shop kinds, fruit kinds × hand/ball, the four summit fishing spots, beach islands, IDP events).
const lessonIds=[];
for(const [,id,opts] of load('lib/analytics/learningIds.generated.ts').LESSON_TABLE){
 for(const [st] of CID.LESSON_STAGES)lessonIds.push(CID.lessonKey(st,id));
 [...opts].forEach((n,q)=>{lessonIds.push(CID.questionKey(id,q));for(let o=0;o<Number(n);o++)lessonIds.push(CID.optionKey(id,q,o));});
}
const shopKinds=literalsAfter(/export type ShopKind=([^;]*);/.exec(read('lib/analytics/shopEvents.ts'))[1],/'([a-z]+)'/g);
const fruitKinds=literalsAfter(/export type FruitKind=([^;]*);/.exec(read('lib/town/summitForage.ts'))[1],/'([a-z]+)'/g);
const summitEvents=read('lib/analytics/summitEvents.ts'),fishMap=/const FISH_SPOT_EVENT[^=]*=\{([^}]*)\}/.exec(summitEvents)[1];
const fishSpotIds=literalsAfter(read('lib/town/fishing/fishCatalog.ts'),/id:'(summit-[a-z-]+)'/g);
const beachIslands=[...new Set(literalsAfter(read('lib/town/beachcombing.ts'),/island:'([a-z]+)'/g))];
const BUILT_COUNTS=[...shopKinds.flatMap(k=>['sh:open_'+k,'sh:save_'+k,'sh:buy_'+k]),...fruitKinds.flatMap(k=>[`su:fruit_${k}:hand`,`su:fruit_${k}:ball`]),
 ...literalsAfter(fishMap,/:'([a-z]{1,2}:[a-z_]+)'/g),...beachIslands.map(i=>'bc:pickup_'+i),...CID.IDP_COUNT_EVENTS.map(([e])=>'ip:'+e)];
const LITERAL_COUNTS=SOURCES.filter(([f])=>!f.startsWith('lib/saves')).flatMap(([,s])=>literalsAfter(s,/\bcount\('([a-z]{1,2}:[^']*)'/g)).filter(id=>!/[_:]$/.test(id));// a prefix ('ob:seen:'+step): its full ids are in FIXED_COUNT_IDS
const CLIENT_COUNTS=new Set([...CID.FIXED_COUNT_IDS,...lessonIds,...BUILT_COUNTS,...LITERAL_COUNTS]);

(async()=>{

await ok('latest migration parsed',()=>{
 assert.equal(LATEST,'20261017_analytics_water.sql','the newest analytics_ingest (update this when a newer one lands)');
 assert.equal(LISTS.length,3,'three allow-lists: area, place, activity');
 assert(COUNT_RE_SRC,'the counts regex is found');
 assert.equal(COUNT_RE_SRC,CID.COUNT_KEY_RE.source,'SQL counts regex = lib/analytics/countIds.ts COUNT_KEY_RE');
 assert(LATEST_SQL.includes(`key::integer < ${IDS.CELL_COUNT}`)&&LATEST_SQL.includes(`limit ${IDS.MAX_BEAT_CELLS}`),'cells: the same grid and cap');
 assert(LATEST_SQL.includes(`limit ${CID.MAX_BEAT_COUNTS}`)&&LATEST_SQL.includes(`least(value::integer, ${CID.MAX_COUNT_VALUE})`),'counts: the same caps');
 assert(!/\bdrop\b|\btruncate\b|\bdelete from\b|rename/i.test(LATEST_SQL.replace(/--.*$/gm,'')),'no destructive statements');
 assert.match(LATEST_SQL.trim().split('\n').slice(-1)[0],/as status;$/,'ends with the self-check select');
});

await ok('every area/place/activity the client can send is allowed by the SQL',()=>{
 for(const a of CLIENT_AREAS){assert(C.AREAS.includes(a),'area not in core.ts AREAS: '+a);assert(SQL_AREAS.includes(a),`area dropped by ${LATEST}: ${a}`);}
 for(const p of CLIENT_PLACES){assert(IDS.PLACE_IDS.includes(p),'placeAt returns an unknown place: '+p);assert(SQL_PLACES.includes(p),`place dropped by ${LATEST}: ${p}`);}
 for(const a of CLIENT_ACTIVITIES){assert(IDS.ACTIVITY_IDS.includes(a),'activity not in islandIds.ts ACTIVITY_IDS (the tracker turns it into "other"): '+a);assert(SQL_ACTIVITIES.includes(a),`activity dropped by ${LATEST}: ${a}`);}
 // Every place in the list is reachable (no dead allow-list entries hiding a renamed place), and the museum/arcade ids agree.
 for(const p of IDS.PLACE_IDS)assert(CLIENT_PLACES.has(p),'place never returned by placeAt: '+p);
 assert.deepEqual(J([...experienceIds].sort()),J([...IDS.MUSEUM_EXHIBITS].sort()),'MUSEUM_EXHIBITS = the museum experiences');
 assert.deepEqual(J(ARCADE.arcadeCabinets.map(c=>c.id).sort()),J([...IDS.ARCADE_GAMES].sort()),'ARCADE_GAMES = the arcade cabinets');
 assert(CLIENT_ACTIVITIES.has('kit_shop')&&CLIENT_ACTIVITIES.has('kit_studio'),'the Kit Shop has its own activities (not "other")');
 // The server's own validation accepts a beat carrying every one of them at once (and the payload fits).
 const e=300_000,ms=k=>Object.fromEntries(k.map(x=>[x,1000]));
 const v=C.validateEvent(JSON.stringify({v:1,t:'beat',s:'CoverageSession000001',p:'/',e,a:ms(C.AREAS),pl:ms(IDS.PLACE_IDS),ac:ms(IDS.ACTIVITY_IDS)}));
 assert.equal(v.ok,true,'validateEvent: '+v.reason);
});

await ok('every count id the client can send matches the SQL regex and the allowlist',()=>{
 assert(CLIENT_COUNTS.size>500,'found the count ids ('+CLIENT_COUNTS.size+')');
 for(const id of CLIENT_COUNTS){
  assert(SQL_COUNT_RE.test(id),`count id dropped by the SQL regex in ${LATEST}: ${id}`);
  assert(CID.isCountId(id),'count id the tracker would ignore (not on the allowlist): '+id);
 }
 for(const s of fishSpotIds)assert(fishMap.includes(`'${s}'`),'summit fishing spot without a counter: '+s);
 assert.deepEqual(J(fruitKinds),J(CID.FORAGE_FRUIT_KINDS),'FORAGE_FRUIT_KINDS = summitForage FruitKind');
 assert.deepEqual(J(beachIslands.sort()),J(CID.BEACH_COUNT_EVENTS.map(([e])=>e).sort()),'BEACH_COUNT_EVENTS = the beachcombing islands');
 assert(LITERAL_COUNTS.includes('su:kick_play')&&LITERAL_COUNTS.includes('sb:cross'),'the literal call sites were scanned');
});

await ok('admin shows and labels every id (no raw ids, no unshown counters)',()=>{
 for(const p of IDS.PLACE_IDS)assert(IDS.PLACE_LABEL[p],'place label '+p);
 for(const a of IDS.ACTIVITY_IDS)assert(IDS.ACTIVITY_LABEL[a],'activity label '+a);
 const dash=read('app/admin/AnalyticsDashboard.tsx');for(const a of C.AREAS)assert(new RegExp(`\\b${a}:\\s*'`).test(dash),'area label '+a);
 // Every Summit Isle / Kit Shop / Sandbar / beach / tutorial counter is read by the report and rendered somewhere.
 const section=read('app/admin/SummitKitSection.tsx');
 for(const [e] of CID.SUMMIT_COUNT_EVENTS)assert(section.includes(`'su:${e}'`)||e.startsWith('fish_')&&section.includes(`'su:fish_'`),'Summit Isle counter not shown in /admin: su:'+e);
 assert(/shopRows\.filter/.test(section)&&/sandbarRows/.test(section)&&/beachRows/.test(section)&&/fruitRows/.test(section));
 const ov=read('lib/analytics/overview.ts');for(const g of ['SHOP_COUNT_EVENTS','SANDBAR_COUNT_EVENTS','SUMMIT_COUNT_EVENTS','BEACH_COUNT_EVENTS','FORAGE_FRUIT_KINDS'])assert(ov.includes(g+'.map('),'overview reads '+g);
 const L=load('lib/analytics/learning.ts').buildLearning({'tu:open':9,'tu:finish':4},{'tu:open':7,'tu:finish':3},{});
 assert.deepEqual(J(L.paths.tutorial),{open:7,finish:null},'the Island Tutorial: sessions, small numbers suppressed');
 assert(/paths\.tutorial/.test(read('app/admin/LearningSection.tsx')),'the Learning section shows the Island Tutorial');
 for(const [e] of CID.TUTORIAL_COUNT_EVENTS)assert(/countTutorial(Open|Finish)\(\)/.test(read('components/IslandTutorial.tsx'))&&CID.FIXED_COUNT_IDS.includes('tu:'+e));
});

await ok('nothing stale',()=>{
 const live=['lib/analytics/countIds.ts','lib/analytics/islandIds.ts','lib/analytics/overview.ts','lib/analytics/summitEvents.ts','app/admin/SummitKitSection.tsx','app/admin/IslandSection.tsx','app/admin/IslandHeatmap.tsx'].map(read).join('\n');
 assert(!/scope_open|glint_|countScope|countGlint/.test(live),'no telescope / glint counters');
 for(const id of CLIENT_COUNTS)assert(!/telescope|scope|glint/.test(id),'stale id '+id);
 for(const old of ['cards-1970','backpass-1992','my-balls','my-cards','my-kit','my-shirts'])assert(!IDS.MUSEUM_EXHIBITS.includes(old)&&!SQL_ACTIVITIES.includes('exhibit_'+old),'retired or collection-wing exhibit '+old);
 assert(!SQL_PLACES.some(p=>/deep_sea_boat_./.test(p))&&!IDS.PLACE_IDS.some(p=>/deep_sea_boat_./.test(p)),'both deep-sea boats fold into deep_sea_boat');
 // Old rows may still hold retired keys; the report only lists known ids, so they never show as raw ids.
 const merged=C.rollupDay('2026-10-16',[]);assert(merged,'rollup shape');
 assert(/\(PLACE_IDS as readonly string\[\]\)\.includes\(p\)/.test(read('lib/analytics/core.ts'))&&/\(ACTIVITY_IDS as readonly string\[\]\)\.includes\(a\)/.test(read('lib/analytics/core.ts')),'unknown place/activity keys are filtered out of the report');
});

// ---- The real SQL: replay every migration, ingest every id, read them back ----------------------------------------------------
await ok('sql round trip: nothing the client sends is dropped',async()=>{
 const bin=n=>{for(const d of (process.env.PATH||'').split(':').concat(['/opt/homebrew/bin','/usr/local/bin','/usr/lib/postgresql/16/bin','/usr/lib/postgresql/15/bin','/usr/lib/postgresql/14/bin'])){const f=path.join(d,n);if(fs.existsSync(f))return f;}return null;};
 const initdb=bin('initdb'),pgctl=bin('pg_ctl'),psqlBin=bin('psql');
 if(process.env.SKIP_PG_TESTS||!initdb||!pgctl||!psqlBin){console.log('  SKIP sql: no local Postgres (initdb/pg_ctl/psql) found');return 'skip';}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fipgc-')),port=String(40000+(process.pid+97)%20000),quiet={stdio:['ignore','ignore','pipe']};
 try{
  cp.execFileSync(initdb,['-D',path.join(dir,'data'),'-U','postgres','--auth=trust','-E','UTF8','--locale=C'],quiet);
  cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-o',`-k ${dir} -p ${port} -c listen_addresses='' -c fsync=off -c TimeZone=UTC`,'-w','-l',path.join(dir,'log'),'start'],quiet);
  const args=['-h',dir,'-p',port,'-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-qAt'];
  const psql=(q,{role}={})=>cp.execFileSync(psqlBin,[...args,'-c',(role?`set role ${role}; `:'')+q],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const runFile=f=>cp.execFileSync(psqlBin,[...args,'-f',f],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split('\n').pop();
  psql('create role anon; create role authenticated; create role service_role bypassrls;');
  psql('alter default privileges in schema public grant all on tables to anon, authenticated, service_role; alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;');
  const files=fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort(),at=files.indexOf(LATEST);
  assert(at>=0,'the analytics_ingest migration is in the folder');
  // Production today: everything before the newest analytics_ingest file has run; the additive files after it (Oct 17 2026:
  // the fishing summary function and other agents' additions, none of which replace analytics_ingest) are replayed afterwards.
  for(const f of files.slice(0,at))runFile(path.join('supabase/migrations',f));
  const day=new Date().toISOString().slice(0,10),q=s=>`'${s.replace(/'/g,"''")}'`;
  const ingest=p=>psql(`select analytics_ingest(${q(JSON.stringify(p))}::jsonb)`,{role:'service_role'});
  const start=s=>ingest({type:'start',session:s,path:'/',day,visitor_hash:'c'.repeat(32),device:'phone',source:'direct'});
  const E=300000,ms=k=>Object.fromEntries([...k].map(x=>[x,1000]));
  // Before the new file runs: the app keeps working, the new 'swim' activity is just not counted yet (the older keys still are).
  start('coveragepre000000001');
  ingest({type:'beat',session:'coveragepre000000001',engaged_ms:20000,area_ms:{shop:20000},activity_ms:{kit_shop:12000,swim:8000}});
  assert.equal(psql(`select area_ms::text||'|'||activity_ms::text from analytics_beats where session_id='coveragepre000000001'`),'{"shop": 20000}|{"kit_shop": 12000}','before 20261017_analytics_water: the beat counts, the new swim key is dropped (never an error)');
  assert.equal(runFile(path.join('supabase/migrations',LATEST)),'OK, water analytics installed','self-check row');
  assert.equal(runFile(path.join('supabase/migrations',LATEST)),'OK, water analytics installed','idempotent');
  for(const f of files.slice(at+1))assert.match(runFile(path.join('supabase/migrations',f)),/^OK/,f+': its self-check row');
  // After: one session carrying every id the client can produce.
  const S='coverageall000000001';start(S);
  ingest({type:'beat',session:S,engaged_ms:E,pageviews:1,area_ms:ms(CLIENT_AREAS)});
  ingest({type:'beat',session:S,engaged_ms:E,place_ms:ms(CLIENT_PLACES)});
  ingest({type:'beat',session:S,engaged_ms:E,activity_ms:ms(CLIENT_ACTIVITIES)});
  const counts=[...CLIENT_COUNTS];
  // Learning ids are many (every lesson × question × option); send them in the tracker's own MAX_BEAT_COUNTS chunks, under the
  // per-session beat cap, spread over as many sessions as needed.
  const per=CID.MAX_BEAT_COUNTS,beatsPerSession=250;let sess=0;
  for(let i=0,b=0;i<counts.length;i+=per,b++){
   if(b%beatsPerSession===0){sess++;start('coveragecnt'+String(sess).padStart(9,'0'));}
   ingest({type:'beat',session:'coveragecnt'+String(sess).padStart(9,'0'),engaged_ms:1000,counts:Object.fromEntries(counts.slice(i,i+per).map(id=>[id,1]))});
  }
  const keys=col=>new Set(psql(`select distinct k from analytics_beats b, jsonb_object_keys(b.${col}) k where b.session_id like 'coverage%'`).split('\n').filter(Boolean));
  const missing=(sent,got)=>[...sent].filter(k=>!got.has(k));
  assert.deepEqual(missing(CLIENT_AREAS,keys('area_ms')),[],'areas dropped by the SQL');
  assert.deepEqual(missing(CLIENT_PLACES,keys('place_ms')),[],'places dropped by the SQL');
  assert.deepEqual(missing(CLIENT_ACTIVITIES,keys('activity_ms')),[],'activities dropped by the SQL');
  assert.deepEqual(missing(CLIENT_COUNTS,keys('counts')),[],'count ids dropped by the SQL');
  // And the day rollups the dashboard reads carry them (the Pacific-time rollup, as /admin uses).
  const roll=JSON.parse(psql(`select analytics_pt_day_rollup((now() at time zone 'America/Los_Angeles')::date)`,{role:'service_role'}));
  for(const a of ['kit_shop','kit_studio','exhibit_throw-in','konbini_shop'])assert(roll.activityMs[a]>0,'rollup activity '+a);
  for(const id of ['tu:open','tu:finish','su:ball_find','su:cannon_hit','sh:spend','bc:pickup_summit'])assert(roll.counts[id]>0,'rollup count '+id);
  console.log(`  ingested ${CLIENT_AREAS.size} areas, ${CLIENT_PLACES.size} places, ${CLIENT_ACTIVITIES.size} activities, ${counts.length} count ids: none dropped`);
 }finally{
  try{cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-m','immediate','stop'],quiet);}catch{}
  fs.rmSync(dir,{recursive:true,force:true});
 }
});

console.log(`admin-analytics-coverage: ${passed} groups passed`);
})().catch(e=>{console.error(e);process.exit(1);});
