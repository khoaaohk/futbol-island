#!/usr/bin/env node
// Investor page visits (Nov 5 2026): /marketing only. The mm: ids are fixed, well formed and allowlisted (the server-only place
// and hour ids are NOT on the client allowlist); the place mapping (US state / us / o_<country> / other) from Vercel's geo
// headers, unknown and missing headers included; the stay bands, the 30 min cap and visibility-aware booking; a real tracker
// beacon → ingest → memory store → report (place, Pacific hour, stay per place; DNT stores nothing; nothing else is added);
// the report maths (average, band median, bounce, weekday × hour); a privacy scan; the wiring; the section's static render.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const loaded=new Map();
function resolve(from,id){
 const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);
 for(const f of [base,base+'.ts',base+'.tsx'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;
 throw Error('cannot resolve '+id+' from '+from);
}
const builtin=id=>{const r=require(id);return require('module').isBuiltin(id)?{...r,default:r}:r;};
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);
 if(file.endsWith('.json')){const v=JSON.parse(fs.readFileSync(file,'utf8'));const m={default:v};loaded.set(file,m);return m;}
 if(file.endsWith('.css')){const p=new Proxy({},{get:(_,k)=>k==='__esModule'?false:String(k)});const m={default:p};loaded.set(file,m);return m;}
 const m={exports:{}};loaded.set(file,m.exports);
 const ctx={module:m,exports:m.exports,Buffer,URL,URLSearchParams,TextDecoder,TextEncoder,Date,Math,JSON,Intl,process:{env:{},cwd:()=>ROOT},console,setTimeout,clearTimeout,
  require:id=>id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):builtin(id)};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,ctx);
 loaded.set(file,m.exports);return m.exports;}
const K=load('lib/analytics/countIds.ts'),MV=load('lib/analytics/marketingVisit.ts'),G=load('lib/analytics/marketingVisitGeo.ts'),MR=load('lib/analytics/marketingVisitReport.ts'),
 T=load('lib/analytics/tracker.ts'),C=load('lib/analytics/core.ts'),S=load('lib/analytics/store.ts'),I=load('lib/analytics/ingest.ts'),R=load('lib/analytics/report.ts');
const read=f=>fs.readFileSync(f,'utf8');
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"])\/\/.*$/gm,'$1');
const J=x=>JSON.parse(JSON.stringify(x)),deq=(a,b,msg)=>assert.deepStrictEqual(J(a),J(b),msg);
let passed=0;const ok=(name,fn)=>Promise.resolve().then(fn).then(()=>{passed++;},e=>{console.error('FAIL',name);throw e;});

(async()=>{
await ok('mm: ids are fixed, well formed, allowlisted and unique; server-only ids are not on the client allowlist',()=>{
 const ids=MV.MARKETING_VISIT_COUNT_IDS;
 deq(ids,['mm:view','mm:min','mm:sec10','mm:sec1','mm:t_0_10','mm:t_10_30','mm:t_30_60','mm:t_60_180','mm:t_180_600','mm:t_600']);
 for(const id of ids){assert(K.COUNT_KEY_RE.test(id),id);assert(K.isCountId(id),id);assert(K.FIXED_COUNT_IDS.includes(id),id);}
 assert.equal(new Set(K.FIXED_COUNT_IDS).size,K.FIXED_COUNT_IDS.length,'no duplicate fixed ids');
 for(const bad of ['mm:g_us_ca','mm:gm_us_ca','mm:gx_o_de','mm:h_1_09','mm:city_la','mm:ip'])assert(!K.isCountId(bad),bad+' cannot come from a browser');
 // Every server-made id fits the SQL counts regex (no hyphens), and the set is bounded: 51 states + us + 26² countries + other.
 for(const g of ['us_ca','us_dc','us','o_de','other'])for(const p of ['mm:g_','mm:gm_','mm:gx_'])assert(K.COUNT_KEY_RE.test(p+g),p+g);
 for(let d=0;d<7;d++)for(let h=0;h<24;h++)assert(K.COUNT_KEY_RE.test(G.hourId(d,h)));
 assert.equal(G.US_STATES.length,51);assert(/mm:<event>/.test(read('lib/analytics/countIds.ts').split('*/')[0]),'family documented in the header');
});

await ok('place mapping: US state, US without a state, other country, unknown / missing / malformed headers',()=>{
 assert.equal(G.geoOf('US','CA'),'us_ca');assert.equal(G.geoOf('us','tx'),'us_tx');assert.equal(G.geoOf('US','DC'),'us_dc');
 assert.equal(G.geoOf('US',null),'us');assert.equal(G.geoOf('US','ZZ'),'us','not a state');assert.equal(G.geoOf('US','PR'),'us','territories are not states');
 assert.equal(G.geoOf('DE','BY'),'o_de','outside the US: country only, never the region');assert.equal(G.geoOf('CA','ON'),'o_ca');
 for(const [c,r] of [[null,null],['',''],['XX','CA'],['USA','CA'],['1','2'],[undefined,'CA']])assert.equal(G.geoOf(c,r),'other',`${c}/${r}`);
 for(const g of ['us_ca','us','o_de','other'])assert(G.isGeo(g),g);for(const g of ['us_zz','o_deu','city','us-ca',''])assert(!G.isGeo(g),g);
 deq(MR.placeLabel('us_ca'),{label:'California',code:'US-CA'});deq(MR.placeLabel('us'),{label:'United States (state unknown)',code:'US'});
 assert.equal(MR.placeLabel('o_de').label,'Germany');assert.equal(MR.placeLabel('other').label,'Unknown place');
});

await ok('Pacific weekday and hour; the ingest adds place, hour and stay per place from the beat only',()=>{
 deq(G.pacificSlot(Date.parse('2026-11-05T17:30:00Z')),{dow:4,hour:9},'Thursday 9:30 PST');
 deq(G.pacificSlot(Date.parse('2026-07-05T06:59:00Z')),{dow:6,hour:23},'Saturday 11:59 pm PDT');
 deq(G.pacificSlot(Date.parse('2026-11-06T08:00:00Z')),{dow:6-1,hour:0},'Friday midnight');
 const now=new Date('2026-11-05T17:30:00Z');
 deq(G.addVisitGeo({'mm:view':1,'mm:min':2,'mm:sec10':3,'mm:sec1':4},{country:'US',region:'CA'},now),
  {'mm:view':1,'mm:min':2,'mm:sec10':3,'mm:sec1':4,'mm:g_us_ca':1,'mm:h_4_09':1,'mm:gm_us_ca':2,'mm:gx_us_ca':3},'2 min 34 s → 2 min + 3 tens');
 deq(G.addVisitGeo({'mm:sec10':5,'mm:sec1':7},{country:'DE',region:'BY'},now),{'mm:sec10':5,'mm:sec1':7,'mm:gm_o_de':1},'57 s rounds to 1 min, no hour without a view');
 deq(G.addVisitGeo({'mk:view':1},{country:'US',region:'CA'},now),{'mk:view':1},'the tour page at / gets nothing');
 const full={};for(let i=0;i<64;i++)full['x:'+i]=1;full['mm:view']=1;delete full['x:0'];
 assert.equal(Object.keys(G.addVisitGeo(full,{country:'US',region:'CA'},now)).length,64,'never past MAX_BEAT_COUNTS ids');
});

await ok('the watcher: one view, visibility-aware exact seconds, a band once, the 30 min cap, the pagehide booking',()=>{
 deq([0,9.9,10,29,30,59,60,179,180,599,600,1799,5000].map(MV.stayBand),['0_10','0_10','10_30','10_30','30_60','30_60','60_180','60_180','180_600','180_600','600','600','600']);
 deq(MV.splitSeconds(754),{min:12,sec10:3,sec1:4});
 const rig=()=>{const log={},L=new Set(),hooks=new Set(),st={t:0};const d={visibilityState:'visible',addEventListener:(k,f)=>L.add(f),removeEventListener:(k,f)=>L.delete(f)};
  const stop=MV.watchMarketingVisit({document:d,now:()=>st.t,count:(id,n=1)=>{assert(K.isCountId(id),id);log[id]=(log[id]||0)+n;},onPageHide:f=>{hooks.add(f);return()=>hooks.delete(f);}});
  return {log,st,stop,L,hooks,vis:v=>{d.visibilityState=v?'visible':'hidden';for(const f of [...L])f();}};};
 const secs=l=>60*(l['mm:min']||0)+10*(l['mm:sec10']||0)+(l['mm:sec1']||0);
 let r=rig();r.st.t=7_400;r.vis(false);deq(r.log,{'mm:view':1,'mm:sec1':7,'mm:t_0_10':1},'a 7 s bounce');
 r.st.t=600_000;r.vis(true);r.st.t=665_000;r.vis(false);assert.equal(secs(r.log),72,'hidden time is not counted');assert.equal(r.log['mm:t_0_10'],1,'the band is booked once');
 r.stop();assert.equal(r.L.size,0);assert.equal(r.hooks.size,0,'listeners removed');
 r=rig();r.st.t=3*3600_000;for(const f of r.hooks)f();assert.equal(secs(r.log),MV.MM_CAP_S,'capped at 30 min');assert.equal(r.log['mm:t_600'],1);assert.equal(r.log['mm:min'],30);
 r.stop();assert.equal(secs(r.log),MV.MM_CAP_S,'stop after pagehide books nothing more');
 r=rig();r.st.t=95_000;r.stop();deq(r.log,{'mm:view':1,'mm:min':1,'mm:sec10':3,'mm:sec1':5,'mm:t_60_180':1},'leaving the route books the stay');
});

// ---- the real pipeline: tracker beacon → ingest (with geo headers) → memory store → report ----
let seed=0;
function trackerEnv(){
 const L={};let t=0;const sent=[],store={};
 const add=(k,f,o)=>{(L[k]??=[]).push({f,o});},rm=(k,f)=>{L[k]=(L[k]||[]).filter(x=>x.f!==f);};
 const w={location:{hostname:'futbolisland.app',origin:'https://futbolisland.app',pathname:'/marketing',search:''},addEventListener:add,removeEventListener:rm,setTimeout:()=>1,clearTimeout:()=>{}};
 const d={visibilityState:'visible',referrer:'',addEventListener:add,removeEventListener:rm};
 const n={sendBeacon:(u,b)=>{sent.push(JSON.parse(b));return true;},maxTouchPoints:0};
 return {w,d,sent,now:()=>t,advance:ms=>{t+=ms;},
  e:{window:w,document:d,navigator:n,storage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v;}},now:()=>t,random:k=>{seed++;return new Uint8Array(k).map((_,i)=>(i*7+seed*53+(i===0?seed:0))&255);}},
  // capture listeners first, as at the target in a browser
  fire(k){const ls=[...(L[k]||[])];for(const x of ls.filter(x=>x.o?.capture))x.f({type:k});for(const x of ls.filter(x=>!x.o?.capture))x.f({type:k});}};
}
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
function hdr(extra={}){const m=new Map(Object.entries({host:'futbolisland.app','user-agent':UA,'x-forwarded-for':'203.0.113.7',origin:'https://futbolisland.app',...extra}));return {get:k=>m.get(k.toLowerCase())??null};}
const ingest=(store,body,now,h)=>I.handleIngest({body:JSON.stringify(body),headers:h,store,limiter:I.createLimiter({capacity:1e6}),now,vercelEnv:'production'});

await ok('beacon → ingest → report: place, Pacific hour and stay; no IP or city stored; DNT stores nothing',async()=>{
 const store=S.createMemoryStore(),now=new Date('2026-11-05T17:30:00Z');// Thursday 9:30 am PT
 const visits=[['US','CA',40],['US','CA',100],['US','TX',5],['DE','BY',700],[null,null,20]];
 for(const [i,[cc,rr,sec]] of visits.entries()){
  const x=trackerEnv(),tr=T.startTracker(x.e);tr.pageview('/marketing');
  const stop=MV.watchMarketingVisit({document:x.d,now:x.now,count:T.count,onPageHide:T.onPageHide});
  x.advance(sec*1000);x.d.visibilityState='hidden';x.fire('visibilitychange');stop();tr.stop();
  const beat=x.sent.find(b=>b.t==='beat'&&b.k);assert(beat&&beat.k['mm:view']===1,'the hide beat carries mm:view');
  for(const k of Object.keys(beat.k))assert(!/^mm:(g|gm|gx|h)_/.test(k),'the browser never sends a place or an hour');
  const h=hdr({'x-forwarded-for':'203.0.113.'+(20+i),...(cc?{'x-vercel-ip-country':cc,'x-vercel-ip-country-region':rr,'x-vercel-ip-city':'Los%20Angeles','x-vercel-ip-latitude':'34.05'}:{})});
  for(const b of x.sent)assert.equal((await ingest(store,b,now,h)).reason,'ok');
 }
 // A forged place / hour id from a browser is dropped; DNT stores nothing.
 const x=trackerEnv(),tr=T.startTracker(x.e);tr.pageview('/marketing');const s=x.sent[0].s;
 assert.equal((await ingest(store,{v:1,t:'beat',s,p:'/marketing',e:1000,k:{'mm:g_us_ny':9,'mm:h_0_03':9}},now,hdr({'x-forwarded-for':'203.0.113.90'}))).reason,'ok');
 assert.equal((await ingest(store,{v:1,t:'beat',s,p:'/marketing',e:1000,k:{'mm:view':1}},now,hdr({dnt:'1','x-vercel-ip-country':'US','x-vercel-ip-country-region':'NY'}))).reason,'dnt');
 tr.stop();
 const raw=JSON.stringify(store.data);
 for(const bad of ['203.0.113','Los Angeles','Los%20Angeles','34.05','us_ny','mm:h_0_03'])assert(!raw.includes(bad),'not stored: '+bad);
 const day=C.dayIn('pacific',now),rep=await R.buildReport(store,{from:day,to:day},now),v=rep.marketingVisits;
 assert(v&&v.hasData);assert.equal(v.views,5);assert.equal(v.seconds,40+100+5+700+20);assert.equal(v.avgSec,173);
 deq(v.places.map(p=>[p.geo,p.visits,p.seconds,p.avgSec]),[['us_ca',2,140,70],['o_de',1,700,700],['other',1,20,20],['us_tx',1,10,10]],'5 s rounds to one ten');
 assert.equal(v.places[0].label,'California');assert.equal(v.places[0].share,0.4);
 assert.equal(v.grid[4][9],5,'Thursday 9 am PT');assert.equal(v.hours[9],5);assert.equal(v.timed,5);
 deq(v.bands.map(b=>b.visits),[1,1,1,1,0,1]);assert.equal(v.bounceRate,0.2);assert.equal(v.medianBand,'30 s – 1 min');
 assert.equal(rep.marketing.views,0,'the tour page at / counted nothing');
});

await ok('report maths: average, band median, bounce, places sorted, weekday × hour, daily series, exact numbers',()=>{
 const counts={'mm:view':100,'mm:min':150,'mm:sec10':40,'mm:sec1':33,'mm:t_0_10':30,'mm:t_10_30':10,'mm:t_30_60':20,'mm:t_60_180':20,'mm:t_180_600':15,'mm:t_600':5,
  'mm:g_us_ca':3,'mm:gm_us_ca':4,'mm:gx_us_ca':3,'mm:g_us_ny':60,'mm:gm_us_ny':90,'mm:g_o_gb':37,'mm:g_us_zz':4,'mm:h_1_09':7,'mm:h_3_09':3,'mm:h_6_22':1};
 const v=MR.buildMarketingVisits({counts},[{day:'2026-11-04',counts:{'mm:view':60}},{day:'2026-11-05',counts:{}}]);
 assert.equal(v.seconds,150*60+400+33);assert.equal(v.avgSec,Math.round(9433/100));
 assert.equal(v.medianSec,45,'the 50th of 100 is halfway into 30–60 s');assert.equal(v.medianBand,'30 s – 1 min');
 assert.equal(MR.bandMedianSec([0,0,0,0,0,4]),1200,'10 min+ runs to the 30 min cap');assert.equal(MR.bandMedianSec([0,0,0,0,0,0]),null);
 assert.equal(v.bounceRate,0.3);assert.equal(v.bounced,30);assert.equal(v.banded,100);
 deq(v.places.map(p=>p.geo),['us_ny','o_gb','us_ca'],'sorted by visits; an unknown state id is ignored');
 assert.equal(v.places[2].visits,3,'exact under 5');assert.equal(v.places[2].avgSec,Math.round((240+30)/3));assert.equal(v.places[1].avgSec,0);
 assert.equal(v.grid.length,7);assert(v.grid.every(r=>r.length===24));assert.equal(v.hours[9],10);assert.equal(v.hours[22],1);assert.equal(v.timed,11);
 deq(v.daily,[{day:'2026-11-04',views:60},{day:'2026-11-05',views:0}]);
 const e=MR.buildMarketingVisits({counts:{}},[]);assert.equal(e.hasData,false);assert.equal(e.avgSec,null);assert.equal(e.medianSec,null);assert.equal(e.bounceRate,null);
});

await ok('privacy: no PII field, no request, storage or timer of its own; ids built from fixed parts only',()=>{
 const mv=strip(read('lib/analytics/marketingVisit.ts')),geo=strip(read('lib/analytics/marketingVisitGeo.ts'));
 for(const src of [mv,geo]){assert(!/\b(name|email|ip|city|latitude|longitude|postal|referrer)\b\s*[:=]/i.test(src),'no PII field');
  assert(!/fetch\(|sendBeacon|localStorage|sessionStorage|setInterval|setTimeout|requestAnimationFrame/.test(src),'no request, storage, timer or frame loop');}
 assert(!/x-vercel-ip-(city|latitude|longitude|postal)|forwarded-for/.test(geo+strip(read('lib/analytics/ingest.ts')).match(/addVisitGeo\([^\n]*/)[0]),'only country and region headers are read for the place');
 for(const m of mv.matchAll(/count\(([^,)]+)/g))assert(/^'mm:(view|min|sec10|sec1|t_)'/.test(m[1].trim()),'count id from the fixed set: '+m[1]);
});

await ok('wiring: VisitTracker on /marketing only, the ingest, the report, the Marketing tab',()=>{
 const vt=read('components/VisitTracker.tsx').replace(/\s+/g,'');
 assert(vt.includes("if(pathname!==MM_PATH||!tracker.current)return;returnwatchMarketingVisit({document,now:()=>performance.now(),count,onPageHide});"));
 assert.equal(MV.MM_PATH,'/marketing');
 assert(!/'use client'|<script|useEffect/.test(read('app/(site)/marketing/page.tsx')),'the page itself stays script-free');
 assert(read('lib/analytics/ingest.ts').includes("if(!start)clean.counts=addVisitGeo(clean.counts,{country:headers.get('x-vercel-ip-country'),region:headers.get('x-vercel-ip-country-region')},now);"));
 assert(read('lib/analytics/report.ts').includes('report.marketingVisits=buildMarketingVisits(merged,rollups)'));
 assert(read('lib/analytics/core.ts').includes('marketingVisits?:MarketingVisitReport|null'));
 const sec=read('app/admin/MarketingSection.tsx');assert((sec.match(/\{visits\}<\/>/g)||[]).length===2,'rendered with and without tour-page data');
 assert(!/IslandBrush/.test(read('app/admin/MarketingVisitsSection.tsx')));
 assert(/\.mvHeat\{[^}]*min-width:640px/.test(read('app/admin/admin.module.css')),'the heat table scrolls sideways inside its card on a phone');
});

await ok('static render: data, empty state, inside the Marketing tab (desktop and 390 px share one markup; the CSS adapts)',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 const Sec=load('app/admin/MarketingVisitsSection.tsx'),Tab=load('app/admin/MarketingSection.tsx').default;
 const counts={'mm:view':12,'mm:min':10,'mm:sec10':5,'mm:sec1':2,'mm:t_0_10':4,'mm:t_30_60':5,'mm:t_180_600':3,'mm:g_us_ca':7,'mm:gm_us_ca':6,'mm:g_o_de':5,'mm:gm_o_de':4,'mm:h_4_09':9,'mm:h_4_10':3};
 const marketingVisits=MR.buildMarketingVisits({counts},[{day:'2026-11-05',counts:{'mm:view':12}}]);
 const html=renderToStaticMarkup(React.createElement(Sec.default,{report:{marketingVisits},rangeText:'Nov 5',dayLabel:d=>d}));
 for(const s of ['Investor page visits','futbolisland.app/marketing','Average stay','Median stay','Bounced','Where they came from','California','Germany','How long they stayed',
  'Visits by hour of day','Pacific time','Visits by day','Day of week and hour','Thu','Under 10 s','10 min or more'])assert(html.includes(s),s);
 assert(/data-k="mv-views">12</.test(html));assert(/data-k="mv-bounce">33%</.test(html),'4 of 12');assert(!html.includes('&lt;5'),'exact numbers');
 assert(html.includes('data-bin="4"'),'the busiest cell is the darkest bin');
 assert.equal(Sec.fmtStay(135),'2 min 15 s');assert.equal(Sec.fmtStay(38),'38 s');assert.equal(Sec.fmtStay(4320),'1 h 12 min');assert.equal(Sec.fmtStay(null),'—');
 assert.equal(Sec.hourLabel(0),'12a');assert.equal(Sec.hourLabel(13),'1p');assert.equal(Sec.heatBin(0,9),null);assert.equal(Sec.heatBin(9,9),4);assert.equal(Sec.heatBin(1,9),0);
 const none=renderToStaticMarkup(React.createElement(Sec.default,{report:{},rangeText:'Nov 5',dayLabel:d=>d}));assert(none.includes('No visits to /marketing in this range yet'));
 const tab=renderToStaticMarkup(React.createElement(Tab,{report:{marketingVisits},rangeText:'Nov 5',dayLabel:d=>d}));
 assert(tab.includes('No marketing-page visits in this range yet')&&tab.includes('Investor page visits'),'shown even when / has no data');
 const css=read('app/admin/admin.module.css');assert(css.includes('.grid{grid-template-columns:minmax(0,1fr)}'),'cards stack under 900 px');
 assert(/\.tableScroll\{overflow-x:auto/.test(css));
});
console.log(`admin-analytics-marketing-visits: ${passed} groups passed`);
})().catch(e=>{console.error(e);process.exit(1);});
