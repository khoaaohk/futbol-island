#!/usr/bin/env node
// Admin analytics: the water (Oct 15 2026). The wa: counter ids are fixed and well-formed, the overview carries them, the admin
// "Water" section reads them, the 'swim' activity exists on the client and in the newest analytics_ingest migration, and the
// migration keeps every older key and ends with its self-check row. Companion to
// tests/admin-analytics-coverage.cjs (which replays every migration on a throwaway Postgres).
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const {createLoader}=require('./summit-harness.cjs');const load=createLoader();
const read=f=>fs.readFileSync(f,'utf8');
let passed=0;const ok=(name,fn)=>{try{fn();passed++;}catch(e){console.error('FAIL',name);throw e;}};
const CID=load('lib/analytics/countIds.ts'),IDS=load('lib/analytics/islandIds.ts');

ok('wa: ids are fixed, well-formed and on the allowlist',()=>{
 const ids=CID.WATER_COUNT_EVENTS.map(([e])=>'wa:'+e);
 assert(ids.length>=15);
 for(const id of ids){assert(CID.COUNT_KEY_RE.test(id),id);assert(CID.isCountId(id),id+' allowed');assert(CID.FIXED_COUNT_IDS.includes(id),id+' fixed');}
 for(const need of ['wa:first_wade','wa:first_swim','wa:swim_start','wa:splash_fall','wa:splash_roof','wa:splash_launch','wa:splash_dropin','wa:shore','wa:fast','wa:float','wa:time_10s','wa:time_30s','wa:time_60s','wa:time_120s','wa:time_long','wa:idle_cap','wa:lesson'])assert(ids.includes(need),need);
 assert.equal(new Set(CID.FIXED_COUNT_IDS).size,CID.FIXED_COUNT_IDS.length,'no duplicate fixed ids');
 assert(!CID.isCountId('wa:madeup'));
 // Every call site uses an id from the list (literal or built from the splash source / time bucket).
 const ev=read('lib/analytics/waterEvents.ts'),S=load('lib/town/water/waterState.ts');
 for(const lit of [...ev.matchAll(/count\('(wa:[a-z_0-9]+)'\)/g)].map(m=>m[1]))assert(ids.includes(lit),lit);
 for(const src of ['fall','roof','launch','dropin'])assert(ids.includes('wa:splash_'+src));
 for(const s of [0.1,10,30,60,120,999])assert(ids.includes('wa:'+S.swimTimeBucket(s)),'bucket '+s);
});
ok('the overview and the admin section carry the rows',()=>{
 const ov=read('lib/analytics/overview.ts');assert.match(ov,/water:WATER_COUNT_EVENTS\.map\(\(\[id,label\]\)=>countRow\(cur\.merged,'wa:'\+id,label\)\)/);assert.match(ov,/water:CountRow\[\];/);
 const sec=read('app/admin/WaterSection.tsx');assert(sec.includes("report.overview?.water"));assert(sec.includes('wa:swim_start')&&sec.includes('wa:idle_cap')&&sec.includes("startsWith('wa:splash_')")&&sec.includes("startsWith('wa:time_')"));
 const dash=read('app/admin/AnalyticsDashboard.tsx');assert(dash.includes("import WaterSection from './WaterSection'")&&dash.includes('<WaterSection report={report}/>'));
});
ok("the 'swim' activity: client list, Town's frame, the newest analytics_ingest",()=>{
 assert(IDS.ACTIVITY_IDS.includes('swim'));assert(IDS.ACTIVITY_LABEL.swim);
 const town=read('components/Town.tsx');assert.match(town,/islandFrame\(location\.x[^\n]*water\.inWater\?'swim':'walk'/);
 const files=fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')&&/create or replace function public\.analytics_ingest/.test(read('supabase/migrations/'+f))).sort();
 const latest=files[files.length-1];assert.equal(latest,'20261017_analytics_water.sql','the water migration is the newest analytics_ingest (update when a newer one lands)');
 const sql=read('supabase/migrations/'+latest),lists=[...sql.matchAll(/where key in \(([^)]*)\)/g)].map(m=>m[1].split(',').map(s=>s.trim().replace(/'/g,'')));
 const [areas,places,acts]=lists;
 assert(acts.includes('swim'),'swim allowed');
 // Nothing the previous ingest allowed is dropped.
 const prev=read('supabase/migrations/'+files[files.length-2]),plists=[...prev.matchAll(/where key in \(([^)]*)\)/g)].map(m=>m[1].split(',').map(s=>s.trim().replace(/'/g,'')));
 for(const [i,l] of plists.entries())for(const k of l)assert(lists[i].includes(k),`${files[files.length-2]} key kept: ${k}`);
 assert(acts.includes('kit_studio')&&places.includes('summit_isle'));
 assert.match(sql.trim().split('\n').pop(),/as status;$/);assert(sql.includes("'OK, water analytics installed'"));
 assert(!/\bdrop\b|\btruncate\b|\bdelete from\b/i.test(sql.replace(/--.*$/gm,'')),'no destructive statements');
});
console.log(`admin-analytics-water: ${passed} groups passed`);
