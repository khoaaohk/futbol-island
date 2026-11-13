#!/usr/bin/env node
// The /admin trend rebuild (Nov 6 2026): lib/analytics/dashboard.ts, dashboardAdmin.ts, dailyMath.ts, memoryPeople.ts,
// metricIndex.ts, the new live-match counters, and the new UI (OverviewStory, TrendTiles, PlayersExplorer, DefinitionsPanel)
// rendered on the server with react-dom/server.
//  1. dashboard == daily layer == export: on the audit's synthetic dataset (13 Pacific days, DST, 00:05 / 23:55 sessions) every
//     dashboard series totals exactly what the layer and the Daily CSV say, and the rendered Overview tiles carry those values;
//  2. range / compare: untracked previous periods are refused (never a fake 0), partial today is left out, funnels use the same
//     days, movers need a base, anomalies are robust;
//  3. metric index: every old number's id is a rendered data-metric (source scan of every tab + the rendered Overview);
//  4. drill-in privacy: the players / player payloads carry no name, IP, user agent, code or raw id;
//  5. the people function absent: "needs the people function", no number; present (memory stand-in): equals a plain recount;
//  6. live matches: goals, replays and slots are counted, reported, in the layer and on the tab.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),os=require('os');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const read=f=>fs.readFileSync(f,'utf8');
const loaded=new Map();
const cssProxy=new Proxy({},{get:(_,k)=>k==='__esModule'?false:String(k)});
function resolve(from,id){const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);
 for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;throw Error('cannot resolve '+id+' from '+from);}
const env={};
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);
 if(file.endsWith('.css')){loaded.set(file,{default:cssProxy});return loaded.get(file);}
 if(file.endsWith('.json')){const v={__esModule:true,default:JSON.parse(read(file))};loaded.set(file,v);return v;}
 const m={exports:{}};loaded.set(file,m.exports);
 const out=ts.transpileModule(read(file),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 vm.runInNewContext(out,{module:m,exports:m.exports,Buffer,URL,URLSearchParams,TextEncoder,TextDecoder,Date,Math,JSON,Promise,Intl,fetch:async()=>{throw Error('no network in tests');},
  process:{env},console,setTimeout,clearTimeout,
  require:id=>{if(id.endsWith('.css'))return {__esModule:true,default:cssProxy};if(id==='next/navigation')return {useRouter:()=>({push(){},refresh(){}})};
   return id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id);}});
 loaded.set(file,m.exports);return m.exports;}
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const C=load('lib/analytics/core.ts'),S=load('lib/analytics/store.ts'),D=load('lib/analytics/daily.ts'),DA=load('lib/analytics/dailyAdmin.ts'),
 DB=load('lib/analytics/dashboard.ts'),DBA=load('lib/analytics/dashboardAdmin.ts'),M=load('lib/analytics/dailyMath.ts'),MP=load('lib/analytics/memoryPeople.ts'),
 X=load('lib/analytics/exportCsv.ts'),MI=load('lib/analytics/metricIndex.ts'),K=load('lib/analytics/countIds.ts'),LME=load('lib/analytics/liveMatchEvents.ts'),
 LMR=load('lib/analytics/liveMatchReport.ts'),DAY=load('lib/analytics/day.ts');
const OverviewStory=load('app/admin/OverviewStory.tsx').default,TT=load('app/admin/TrendTiles.tsx'),PE=load('app/admin/PlayersExplorer.tsx');
let passed=0;const ok=(name,fn)=>Promise.resolve().then(fn).then(()=>{passed++;},e=>{console.error('FAIL',name);throw e;});
const J=x=>JSON.parse(JSON.stringify(x));
const deq=(a,b,m)=>assert.deepStrictEqual(J(a),J(b),m);
const close=(a,b,m,eps=1e-6)=>assert(a===b||(a!==null&&b!==null&&Math.abs(a-b)<=eps*Math.max(1,Math.abs(b))),`${m}: ${a} vs ${b}`);

// ---- the audit's synthetic dataset (as tests/admin-analytics-daily.cjs), plus keyed player ids that repeat across days ---------
function seedStore(nowMs){
 let seed=20261106;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};const pick=a=>a[Math.floor(rnd()*a.length)];
 const dayStart=d=>Date.parse(d+'T00:00:00Z')+(d<'2026-11-01'?7:d==='2026-11-01'?7:8)*3600e3;
 const days=[];for(let t=Date.parse('2026-10-25T00:00:00Z');t<=Date.parse('2026-11-06T00:00:00Z');t+=86400e3)days.push(new Date(t).toISOString().slice(0,10));
 const starts={},beats=[];let sid=0;const id=()=>('audit'+String(++sid).padStart(12,'0')).slice(0,20);
 const LM=['7v7','futsal','9v9','11v11','beach','stadium'];
 for(const day of days){const lo=dayStart(day),hi=dayStart(days[days.indexOf(day)+1]||'2026-11-07');const nVis=8+Math.floor(rnd()*10);
  for(let v=0;v<nVis;v++){const vh='vh_'+day+'_'+v,ns=1+Math.floor(rnd()*3);
   for(let k=0;k<ns;k++){let t=lo+Math.floor(rnd()*(hi-lo-2*3600e3));if(v===0&&k===0)t=lo+5*60e3;if(v===1&&k===0)t=hi-5*60e3;if(t>=nowMs-60e3)continue;
    const s=id(),engaged=1000*Math.floor(5+rnd()*600);
    starts[s]={id:s,day,visitorHash:vh,startedAt:new Date(t).toISOString(),entryPath:'/play',country:pick(['US','US','GB','CA']),region:'CA',device:pick(['phone','desktop','tablet']),
     source:'direct',referrerHost:null,utmSource:null,utmMedium:null,utmCampaign:null,flags:{},returning:rnd()<.4,hasCode:rnd()<.5,playerId:'p'+v};
    const c={};const add=(key,n=1)=>{c[key]=(c[key]||0)+n;};
    if(rnd()<.3)add('en:game_'+pick(['live','runner','tennis','pinball','puzzle']));if(rnd()<.1)add('su:kick_play');
    if(rnd()<.4)add('en:card_'+pick(['ball','npc','quiz','explore','pack','starter']),1+Math.floor(rnd()*3));
    if(rnd()<.3)add('ls:learn7_roles');if(rnd()<.25)add('le:learn7_roles');if(rnd()<.1)add('en:film_end');if(rnd()<.05)add('tu:finish');
    if(rnd()<.3){add('em:pick');add('em:reach_1');add('em:e'+pick([1,2,3,61,21,31,41,51,52,53]));}
    if(rnd()<.2){add('mp:in');add('mp:min',1+Math.floor(rnd()*8));}
    if(day>='2026-11-05'&&rnd()<.5){const f=pick(LM);add(`lm:${f}_visit`);if(rnd()<.7){add(`lm:${f}_join`);add('lm:reach_1');add(`lm:${f}_role_mid`);add(`lm:${f}_leave`);add(`lm:${f}_min`,2);add(`lm:${f}_sec`,30);add(`lm:${f}_len_3m`);add(`lm:${f}_with_0`);add(`lm:${f}_end_leave`);
     if(day>='2026-11-06'){add(`lm:${f}_goal_for`,2);add(`lm:${f}_goal_against`);add(`lm:${f}_replay`,3);add(`lm:${f}_replay_skip`);add(`lm:${f}_slots_human`);add(`lm:${f}_slots_bot`,9);}}}
    if(rnd()<.15){add('mm:view');add('mm:min',1);add('mm:sec10',2);add('mm:sec1',3);add('mm:t_60_180');add('mm:g_us_ca');add('mm:gm_us_ca',1);add('mm:gx_us_ca',2);add('mm:h_4_10');}
    if(rnd()<.2){add('fi:land');if(day==='2026-11-06'){add('fi:start');add('fi:cast');}}
    const half=Math.floor(engaged/2),keys=Object.keys(c),c1={},c2={};keys.forEach((key,i)=>{(i%2?c2:c1)[key]=c[key];});
    beats.push({sessionId:s,ts:new Date(t+half+1000).toISOString(),engagedMs:half,pageviews:0,areaMs:{island:half},activityMs:{fishing:Math.floor(half/3)},counts:c1});
    beats.push({sessionId:s,ts:new Date(t+engaged+2000).toISOString(),engagedMs:engaged-half,pageviews:0,areaMs:{island:engaged-half},counts:c2});}}}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fi-dash-')),file=path.join(dir,'store.json');
 fs.writeFileSync(file,JSON.stringify({salts:{},starts,beats,rollups:{},ptRollups:{}}));
 return {file,dir,days,starts};
}
const render=(el)=>renderToStaticMarkup(el);
const attr=(html,name)=>[...html.matchAll(new RegExp(`${name}="([^"]*)"`,'g'))].map(m=>m[1]);

(async()=>{
const NOW=new Date('2026-11-06T20:00:00Z');// 12:00 Pacific
const syn=seedStore(NOW.getTime());
let store,full,layer,dash,week;
try{
 store=S.createMemoryStore(syn.file);
 full={from:'2026-10-25',to:'2026-11-06'};
 ({layer}=await DA.loadDailyLayer(store,full,NOW,{people:false}));
 dash=await DBA.loadDashboard(store,full,NOW);
 week=await DBA.loadDashboard(store,{from:'2026-10-31',to:'2026-11-06'},NOW);

// 1. dashboard == layer == export --------------------------------------------------------------------------------------------
await ok('every dashboard series totals exactly what the daily layer says (sum, ratio and mean-of-complete-days rules)',()=>{
 const keys=Object.keys(dash.series);assert(keys.length>100,'the dashboard carries its series: '+keys.length);
 for(const k of keys){const ls=D.seriesByKey(layer,k);if(!ls){assert(k.startsWith('people.'),'only people series are extra: '+k);continue;}
  const ds=DB.seriesOf(dash,k);close(DB.aggregate(ds,ds.points).value,D.totalOf(ls).value,k);
  assert.equal(ds.trackedSince,ls.trackedSince,k+' trackedSince');assert.equal(ds.points.length,ls.points.length,k+' days');
  ds.points.forEach((p,i)=>{close(p.value,ls.points[i].value===null?null:Math.round(ls.points[i].value*1e6)/1e6,k+' '+p.day);assert.equal(!!p.partial,!!ls.points[i].partial);});}
 for(const k of DB.DASH_KEYS.filter(k=>!k.startsWith('people.')))assert(dash.series[k],'dashboard key exists in the layer: '+k);
});
await ok('dashboard == export: the Daily CSV adds up to the same totals as the dashboard for every sum series',()=>{
 const rows=X.dailyCsv(layer).trim().split('\n').slice(1).map(l=>l.split(','));const by=new Map();
 for(const r of rows){const key=[r[1],r[2],r[3]].filter(Boolean).join('.');if(r[4]!=='')by.set(key,(by.get(key)||0)+Number(r[4]));}
 let n=0;for(const s of Object.values(dash.series)){if(s.agg!=='sum'||!by.has(s.key))continue;const ds=DB.seriesOf(dash,s.key);close(DB.aggregate(ds,ds.points).value,by.get(s.key),'csv '+s.key,1e-5);n++;}
 assert(n>60,'compared '+n+' series');
 // the headline numbers the owner reads first, against the layer the export writes
 for(const k of [DB.K.sessions,DB.K.players,DB.K.avgSession,DB.K.mpp,DB.K.cards,DB.K.social,DB.K.lmJoins])close(DB.kpi(dash,k).value,D.totalOf(D.seriesByKey(layer,k)).value,k);
});
await ok('the rendered Overview shows the layer’s numbers (tiles, takeaway, minutes-per-player formula)',()=>{
 const html=render(React.createElement(OverviewStory,{data:dash,compare:true,onDef(){},onPlayers(){}}));
 const vals=new Map([...html.matchAll(/data-series="([^"]+)" data-value="([^"]*)"/g)].map(m=>[m[1],m[2]]));
 for(const k of [DB.K.players,DB.K.sessions,DB.K.avgSession,DB.K.mpp,DB.K.lmJoins,DB.K.fishLanded,DB.K.cards,DB.K.social]){
  assert(vals.has(k),'tile rendered: '+k);close(Number(vals.get(k)),D.totalOf(D.seriesByKey(layer,k)).value,'tile '+k);}
 const tot=D.totalOf(D.seriesByKey(layer,'audience.sessions')).value;
 assert(html.includes(new Intl.NumberFormat('en-US').format(tot)+' sessions'),'the takeaway quotes the session total');
 const mpp=D.seriesByKey(layer,DB.K.mpp),num=mpp.points.reduce((a,p)=>a+(p.num||0),0)/60000,den=mpp.points.reduce((a,p)=>a+(p.den||0),0);
 assert(/data-mpp-formula/.test(html)&&html.includes(DB.fmtNum(den)+' player-days'),'minutes per player says how it is computed');close(num/den,D.totalOf(mpp).value,'mpp = minutes ÷ player-days');
 assert(!/&lt;5|<5/.test(html.replace(/<[^>]+>/g,' ')),'no "<5" on the rebuilt Overview (exact numbers)');
 for(const id of ['overview.players_per_day','overview.sessions','overview.avg_session','overview.minutes_per_player','overview.where_time_goes','overview.cohorts','overview.what_changed','overview.when','overview.main_chart'])assert(attr(html,'data-metric').includes(id),'rendered '+id);
});

// 2. range / compare logic ----------------------------------------------------------------------------------------------------
await ok('compare: offered only when the previous period is fully tracked; "not tracked before" otherwise; today left out',()=>{
 const c=DB.compareState(dash);assert.equal(c.ok,false,'13 days from the first day with data: nothing before');assert.match(c.reason,/^Not tracked before Oct 25/);
 const w=DB.compareState(week);assert.equal(w.ok,true,'Oct 31 – Nov 6: the previous 6 complete days are tracked');deq(w,{ok:true,from:'2026-10-25',to:'2026-10-30',days:6});
 const p=DB.kpi(week,DB.K.sessions).prev;assert.equal(p.status,'ok');assert.equal(p.curTo,'2026-11-05','today (partial) is left out of the comparison');
 // a series that started counting inside the range: its own previous period is not tracked, even when sessions are
 assert.equal(DB.kpi(week,DB.K.lmJoins).prev.status,'not-tracked');assert.equal(DB.kpi(week,DB.K.lmJoins).prev.trackedSince,'2026-11-05');
 const html=render(React.createElement(TT.TrendTile,{data:week,seriesKey:DB.K.lmJoins,compare:true,onDef(){}}));assert.match(html,/not tracked before Nov 5/);
 assert(!/data-tone="good"[^>]*>[^<]*new/.test(html));
 // takeaway with and without a comparison
 assert.match(DB.takeaway(week,true),/^Players per day (up|down) [\d.]+% to [\d.]+ vs the 6 days before; sessions (up|down)/);
 assert.match(DB.takeaway(dash,true),/players a day over 12 complete days, [\d,]+ sessions/,'no fake comparison when the previous period is untracked');
 // the pure arithmetic: a null day inside the previous period refuses it
 const s={agg:'sum',trackedSince:'2026-10-01',points:[{day:'2026-10-05',value:3},{day:'2026-10-06',value:4}],prior:[{day:'2026-10-03',value:1},{day:'2026-10-04',value:null}]};
 assert.equal(M.previousPeriod(s,'2026-10-05','2026-10-06','2026-10-20').status,'not-tracked');
 s.prior[1].value=2;const pp=M.previousPeriod(s,'2026-10-05','2026-10-06','2026-10-20');assert.equal(pp.status,'ok');assert.equal(pp.value,3);assert.equal(pp.change,(7-3)/3);
});
await ok('funnels use the same days for every step; movers need a base; unusual days are robust (MAD) and skip the first tracked day',()=>{
 const f=DB.funnels(dash);
 assert.equal(f.fishing.since,'2026-11-06','fish landed counts since Oct 15, Fish tapped since Nov 6: the funnel starts Nov 6');
 const landNov6=D.seriesByKey(layer,'fishing.funnel_sessions.land').points.find(p=>p.day==='2026-11-06').value;assert.equal(f.fishing[4].value,landNov6);
 assert(f.fishing.every((st,i)=>i===0||st.value===null||f.fishing[0].value===null||st.value<=f.fishing[0].value*10),'no step out-counts by days');
 assert.equal(f.matches[0].value,D.totalOf(D.seriesByKey(layer,DB.K.lmVisits)).value);
 for(const m of DB.movers(week))assert(m.prev>=DB.MOVER_MIN_BASE||DB.seriesOf(week,m.key).agg!=='sum',m.key);
 const pts=[5,6,5,7,6,5,6,40,6,5].map((value,i)=>({day:'2026-10-'+String(10+i),value}));
 const fl=DB.robustFlags(pts);assert.equal(fl.length,1);assert.equal(fl[0].day,'2026-10-17');assert(fl[0].z>2);
 assert.equal(DB.robustFlags(pts.slice(0,6)).length,0,'fewer than 7 days: no flags');
 assert.equal(DB.robustFlags(pts.map(p=>({...p,value:p.value===40?6.6:p.value}))).length,0,'within 20% of the median: not news');
 for(const a of DB.anomalies(dash))assert.notEqual(a.day,DB.seriesOf(dash,a.key).trackedSince,'first tracked day skipped');
 const wk=DB.weekly(DB.seriesOf(dash,DB.K.sessions));assert(wk.some(w=>w.partial),'the week holding today is partial');
 assert.equal(wk.reduce((a,w)=>a+w.value,0),D.totalOf(D.seriesByKey(layer,'audience.sessions')).value,'weeks add up to the range');
});

// 3. metric index ----------------------------------------------------------------------------------------------------------------
await ok('metric index: every old number has an id, a tab, and a rendered data-metric in its new place',()=>{
 const ids=MI.METRIC_INDEX.map(m=>m.id);assert.equal(new Set(ids).size,ids.length,'ids are unique');
 const tabs=new Set(MI.DASH_TABS.map(t=>t[0]));
 for(const m of MI.METRIC_INDEX){assert(tabs.has(m.tab),m.id+' tab');if(m.def)assert(dash.series[m.def]||m.def.startsWith('people.'),m.id+' definition series '+m.def);}
 // every audit inventory row (docs/analytics-audit-2026-11-06.md) maps to an id
 const audit=read('docs/analytics-audit-2026-11-06.md'),need={'Players':'overview.players','Players per day':'overview.players_per_day','Returning sessions':'overview.returning_sessions','Avg session':'overview.avg_session',
  'Sessions (CSV)':'overview.sessions','Games played':'overview.games','Cards found':'overview.cards_found','Videos & stories':'overview.watched','Quizzes taken':'overview.quizzes','Minutes with friends':'overview.friends_minutes',
  'Emotes used':'overview.emotes','T-shirts / cleats':'overview.kit','Change vs prior N days':'overview.change_vs_prior','Player-days, ≈ a day':'players.headline','Visitors/sessions/page views chart':'players.visitors_chart',
  'Median visit / average / bounce':'engagement.time_on_site','Pitch visits / joins / players':'matches.section','a week, play share':'matches.section','Minutes, average, median':'matches.section',
  'views, avg time, bounce, play funnel':'marketing.section','Investor page visits, avg stay, places, hours':'marketing.visits','On now':'live.on_now','weekly KPIs':'report.weekly',
  'Island, Learning, Summit, Fishing, Water, Friends, Emotes, Party retention':'engagement.island'};
 for(const [label,id] of Object.entries(need)){assert(audit.includes('| '+label+' |'),'audit row '+label);assert(ids.includes(id),label+' → '+id);}
 for(const id of ['engagement.learning','engagement.summit_kit','engagement.fishing','engagement.water','engagement.friends','engagement.emotes','engagement.party_retention','players.sources_section','players.region','players.save_health'])assert(ids.includes(id),id);
 // every id is carried by a data-metric in the admin sources (each tab's JSX), and the Overview's by the rendered story
 const src=fs.readdirSync('app/admin').filter(f=>f.endsWith('.tsx')).map(f=>read('app/admin/'+f)).join('\n');
 // data-metric="id" in JSX, or metric="id" / metric:'id' handed to a TrendTile (which renders it as data-metric)
 const inSrc=new Set([...src.matchAll(/(?:data-metric|\bmetric)(?:="|:')([^"']+)["']/g)].map(m=>m[1]));
 assert(/data-metric=\{metric\}/.test(read('app/admin/TrendTiles.tsx')),'a tile renders its metric id');
 const missing=ids.filter(id=>!inSrc.has(id));deq(missing,[],'ids without a data-metric');
 const dashSrc=read('app/admin/AnalyticsDashboard.tsx');
 for(const m of MI.METRIC_INDEX){const at=Math.max(dashSrc.indexOf(`data-metric="${m.id}"`),dashSrc.indexOf(`metric:'${m.id}'`));if(at<0)continue;const before=dashSrc.slice(0,at),tabAt=before.lastIndexOf("{tab==='");
  assert.equal(before.slice(tabAt+8,before.indexOf("'",tabAt+8)),m.tab,m.id+' renders on its tab');}
 // the old hashes still open a tab
 for(const old of ['overview','engagement','players','matches','marketing','live','report'])assert(tabs.has(MI.OLD_TAB[old]),old);
});

// 4. drill-in privacy ---------------------------------------------------------------------------------------------------------------
await ok('players and player payloads: anonymous ids, counts and coarse places only (no name, IP, user agent, code, raw id)',async()=>{
 const BAD=/(^|_)(name|ip|ua|user_?agent|email|code_?value|visitor_?hash|player_?id|session_?id|nick)$/i;
 const keysDeep=(o,acc=new Set())=>{if(Array.isArray(o))o.forEach(x=>keysDeep(x,acc));else if(o&&typeof o==='object')for(const [k,v] of Object.entries(o)){acc.add(k);keysDeep(v,acc);}return acc;};
 const data=JSON.parse(read(syn.file));
 const list=MP.memoryPlayers(data,'2026-10-25','2026-11-06',NOW),shaped=DAY.shapePlayers(list);
 assert(list.rows.length>3,'players listed');for(const k of keysDeep(list))assert(!BAD.test(k),'list key '+k);for(const k of keysDeep(shaped))assert(!BAD.test(k),'shaped list key '+k);
 const json=JSON.stringify(list);for(const s of Object.values(syn.starts))assert(!json.includes(s.id)&&!json.includes(s.visitorHash),'no raw session id / visitor hash');
 assert(!/"p\d+"/.test(json),'no raw player id');
 for(const r of shaped.rows)assert.match(r.pid,/^[0-9a-f]{12}$/);
 const one=MP.memoryPlayer(data,shaped.rows[0].pid,NOW),sp=DAY.shapePlayer(one);
 for(const k of keysDeep(one))assert(!BAD.test(k)||k==='region','player key '+k);
 assert.equal(sp.pid,shaped.rows[0].pid);assert.equal(sp.sessions,shaped.rows[0].sessions);assert.equal(sp.seconds,shaped.rows[0].seconds);
 for(const r of sp.rows)assert.match(r.sid,/^[0-9a-f]{6}$/);
 const pv=PE.playerView(sp,Array.from({length:14},(_,i)=>C.addDays('2026-11-06',i-13)));
 assert.equal(pv.perDay.reduce((a,b)=>a+b,0),sp.rows.length,'sessions per day add up');for(const k of keysDeep(pv))assert(!BAD.test(k),'view key '+k);
 // the list filters (search by id prefix, returning, first-seen cohort, sort)
 const all=shaped.rows,pre=all[1].pid.slice(0,3);
 assert(PE.filterPlayers(all,{q:'#'+pre,ret:'all',cohort:'all',sort:'last',from:'2026-10-25'}).every(p=>p.pid.startsWith(pre)));
 assert(PE.filterPlayers(all,{q:'',ret:'returning',cohort:'all',sort:'minutes',from:'2026-10-25'}).every((p,i,a)=>p.returning===true&&(i===0||a[i-1].seconds>=p.seconds)));
 assert.equal(PE.filterPlayers(all,{q:'',ret:'all',cohort:'before',sort:'last',from:'2026-10-25'}).length,0,'nobody first seen before the data');
 // the routes stay admin-only and validate the id
 for(const f of ['app/api/admin/player/route.ts','app/api/admin/players/route.ts','app/api/admin/dashboard/route.ts'])assert(read(f).indexOf('verifySession(')>0&&read(f).indexOf('verifySession(')<read(f).indexOf('Response.json(await'),f+' checks the session first');
 assert(/PID_RE\.test\(pid\)/.test(read('app/api/admin/player/route.ts')));
 const ui=read('app/admin/PlayersExplorer.tsx');assert(!/userAgent|\.ip\b|visitorHash|playerId/.test(ui),'the drill-in reads no raw field');
});

// 5. the people function absent / present ---------------------------------------------------------------------------------------------
await ok('without the people function: "needs the people function", a dash, no fake 0; with it: equals a plain recount',async()=>{
 const none=DBA.compactLayer(layer,{peopleStatus:'needs-sql',cohorts:[],medianSessionMs:null,now:NOW});
 assert(!Object.keys(none.series).some(k=>k.startsWith('people.')),'no people series');
 const html=render(React.createElement(OverviewStory,{data:none,compare:true,onDef(){},onPlayers(){},fallback:{players:null,returning:null}}));
 assert(/data-people-missing/.test(html)&&/needs the people function/i.test(html)&&html.includes('analytics_daily_people.sql'),'the not-installed state names the file');
 assert(/data-metric="overview.players" data-people-missing[^>]*>(<[^>]+>)*Players[^<]*<\/span><b>—<\/b>/.test(html),'a dash, not 0');
 assert(/D30: not available/.test(html)&&/raw rows are kept 14 days/.test(html),'D30 says why');
 const fb=render(React.createElement(OverviewStory,{data:none,compare:false,onDef(){},onPlayers(){},fallback:{players:42,returning:.375}}));
 assert(fb.includes('<b>42</b>')&&fb.includes('<b>37.5%</b>'),'the older range totals still show until it exists');
 // present: the memory stand-in = a plain recount of the raw rows (distinct player ids per Pacific day; D1)
 const data=JSON.parse(read(syn.file)),pp=MP.memoryDailyPeople(data,'2026-10-25','2026-11-06',NOW);
 const PT=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}),byDay={};
 for(const s of Object.values(data.starts)){const d=PT.format(new Date(s.startedAt));(byDay[d]??={p:new Set(),n:0,r:0}).p.add(s.playerId);byDay[d].n++;if(s.returning===true)byDay[d].r++;}
 for(const d of pp.days){assert.equal(d.players,byDay[d.day].p.size,d.day+' players');assert.equal(d.sessions,byDay[d.day].n);assert.equal(d.returning,byDay[d.day].r);}
 const first=pp.cohorts[0];assert.equal(first.day,'2026-10-25');assert(first.d1!==null&&first.d7!==null);
 assert.equal(pp.cohorts.find(c=>c.day==='2026-11-05')?.d1??null,null,'D1 of yesterday: not yet (today has not ended)');
 assert.equal(dash.people.status,'ok');assert(dash.series['people.players_distinct'],'lights up when the function answers');
 const pd=DB.seriesOf(dash,'people.players_distinct');assert.equal(pd.points.find(p=>p.day==='2026-10-30').value,byDay['2026-10-30'].p.size);
 const ct=DB.cohortTable(dash);assert.equal(ct.rows.length,pp.cohorts.filter(c=>c.day>='2026-10-25').length);
 // the SQL stays proposed (not a migration)
 assert(!fs.readdirSync('supabase/migrations').some(f=>/daily_people/.test(f)),'the people SQL is not in supabase/migrations');
 assert(/ANALYTICS_LOCAL_PEOPLE/.test(read('lib/analytics/memoryPeople.ts')),'a local preview can show the not-installed state');
});

// 6. live matches: goals, replays, slots -------------------------------------------------------------------------------------------
await ok('live matches: goals for / against, replays shown / skipped and AI / human slots are counted, reported and charted',()=>{
 const log={};let t=0;const a=LME.createLiveMatchAnalytics({count:(id,n=1)=>{log[id]=(log[id]||0)+n;},now:()=>t,visible:()=>true,listen:()=>()=>{}});
 a.on({type:'goal',mine:true});assert.deepEqual(J(log),{},'no goal outside a match');
 a.on({type:'join',format:'9v9',role:'mid',others:0,bots:17,humans:1});a.on({type:'goal',mine:true});a.on({type:'goal',mine:false});a.on({type:'replay'});a.on({type:'replay',skipped:true});t+=90_000;a.on({type:'leave',reason:'leave',others:0});
 for(const [id,n] of [['lm:9v9_goal_for',1],['lm:9v9_goal_against',1],['lm:9v9_replay',1],['lm:9v9_replay_skip',1],['lm:9v9_slots_bot',17],['lm:9v9_slots_human',1]])assert.equal(log[id],n,id);
 for(const id of Object.keys(log))assert(K.LIVE_MATCH_COUNT_IDS.includes(id),'allowlisted '+id);
 a.on({type:'join',format:'7v7',role:'gk',others:0,bots:99,humans:-3});assert.equal(log['lm:7v7_slots_bot'],22,'capped at 22');assert.equal(log['lm:7v7_slots_human'],undefined,'no negative slots');
 const merged=(()=>{const rs=[];for(const d of ['2026-11-05','2026-11-06']){const x=C.rollupDay(d,[]);x.counts={};x.countSessions={};rs.push(x);}rs[1].counts={'lm:9v9_join':2,'lm:9v9_goal_for':3,'lm:9v9_slots_bot':34,'lm:9v9_slots_human':2};rs[1].countSessions={'lm:9v9_join':2,'lm:9v9_goal_for':1,'lm:9v9_slots_bot':2,'lm:9v9_slots_human':2};rs[0].counts={'lm:9v9_join':5};rs[0].countSessions={'lm:9v9_join':3};return rs;})();
 const rep=LMR.buildLiveMatches(C.mergeRollups(merged),{from:'2026-11-05',to:'2026-11-06'},merged),f=rep.formats.find(x=>x.format==='9v9');
 assert.equal(f.goalsFor,3);assert.equal(f.botsPerJoin,17,'slots ÷ the joins since slots were sent (Nov 6), not all 7 joins');assert.equal(rep.totals.humansPerJoin,1);
 const lmG=D.seriesByKey(layer,'live_matches.goals.all');assert(lmG,'goals in the layer');assert.equal(lmG.trackedSince,'2026-11-06');
 assert(D.totalOf(lmG).value>0&&D.totalOf(D.seriesByKey(layer,'live_matches.bot_slots.all')).value>0);
 assert(/data-metric="matches.goals_replays_slots"/.test(read('app/admin/LiveMatchesSection.tsx')));
 assert(!layer.gaps.some(g=>/no lm: counter exists for goals/.test(g.why)),'the gap is closed');
});
}finally{fs.rmSync(syn.dir,{recursive:true,force:true});}

// 7. the page and the UI rules ------------------------------------------------------------------------------------------------------
await ok('page, route and UI rules: 30-day default built in parallel, export and compare in the header, no brush font, 44px, no chart library',()=>{
 const page=read('app/admin/page.tsx'),dsh=read('app/admin/AnalyticsDashboard.tsx'),css=read('app/admin/dash.module.css');
 assert(page.includes('initialRange="today"')&&/loadDashboard\(/.test(page)&&page.indexOf('verifySession(')<page.indexOf('loadDashboard('),'the server renders the trends after the session check');
 assert(/fetch\(`\/api\/admin\/dashboard\?\$\{q\}`/.test(dsh)&&/fetch\(`\/api\/admin\/analytics\?\$\{q\}`/.test(dsh),'both reads per range change');
 assert(dsh.indexOf("fetch(`/api/admin/dashboard")<dsh.indexOf("fetch(`/api/admin/analytics"),'started together (the trend fetch is not awaited first)');
 assert(/data-compare-toggle/.test(dsh)&&/data-header-export/.test(dsh)&&/<ExportControl/.test(dsh)&&/data-refresh/.test(dsh),'header: compare, refresh, export');
 assert(/\{id:'14d',label:'14 days'\}/.test(dsh)&&C.resolveRange({range:'14d'},NOW).from===C.addDays(C.pacificDay(NOW),-13),'14-day preset');
 for(const f of ['app/admin/dash.module.css','app/admin/OverviewStory.tsx','app/admin/DashCharts.tsx','app/admin/TrendTiles.tsx','app/admin/PlayersExplorer.tsx','app/admin/DefinitionsPanel.tsx'])assert(!/IslandBrush/.test(read(f)),f+' no brush font');
 assert(/\.compare\{[^}]*min-height:44px/.test(css)&&/\.search\{[^}]*min-height:44px/.test(css)&&/\.pRow\{[^}]*min-height:48px/.test(css),'44 px targets');
 const pkg=JSON.parse(read('package.json'));assert(!Object.keys({...pkg.dependencies,...pkg.devDependencies}).some(d=>/chart|d3|recharts|plotly|nivo|victory/i.test(d)),'no chart library');
 for(const f of ['app/admin/OverviewStory.tsx','app/admin/DashCharts.tsx','app/admin/TrendTiles.tsx','app/admin/PlayersExplorer.tsx','lib/analytics/dashboard.ts','lib/analytics/dailyMath.ts'])
  assert(!/^import(?! type)[^\n]*(analytics\/(store|daily'|dailyAdmin|dashboardAdmin|memoryPeople|countIds|report)|['"]crypto['"])/m.test(read(f)),f+': server modules stay out of the client bundle');
 assert(/role="img" aria-label=/.test(read('app/admin/DashCharts.tsx')),'charts have accessible names');
});
console.log(`admin-dashboard: ${passed} groups passed`);
})().catch(e=>{console.error(e);process.exit(1);});
