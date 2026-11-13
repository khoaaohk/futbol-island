#!/usr/bin/env node
// Admin analytics: live matches (Nov 5 2026, docs/join-live-game-design.md "Analytics"). The lm: ids are fixed, well-formed and
// allowlisted; the events (pitch visit deduped per visit, join with a coarse role, leave with foreground seconds, the 2 h cap,
// the tab-hidden bank, the pagehide leave, friends as a band); the report maths (visits, joins, rate, players, avg / median
// seconds, suppression); a privacy scan (no PII field can be sent); and the Town / runtime / dashboard wiring.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const {createLoader}=require('./summit-harness.cjs');
const read=f=>fs.readFileSync(f,'utf8');
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"])\/\/.*$/gm,'$1');
let passed=0;const ok=(name,fn)=>{try{fn();passed++;}catch(e){console.error('FAIL',name);throw e;}};
const K=createLoader()('lib/analytics/countIds.ts');
const hooks=[];
const L=createLoader({tracker:{count:()=>{},onPageHide:fn=>{hooks.push(fn);return()=>{};}}});
const E=L('lib/analytics/liveMatchEvents.ts'),R=L('lib/analytics/liveMatchReport.ts');

/** A recording counter on a fake clock and a fake visibility. */
function rig(){
 const log={},st={t:1_000_000,vis:true,listeners:0},fns=new Set();
 const a=E.createLiveMatchAnalytics({count:(id,n=1)=>{assert(K.isCountId(id),'allowlisted: '+id);assert(Number.isInteger(n)&&n>=1,id+' '+n);log[id]=(log[id]||0)+n;},now:()=>st.t,visible:()=>st.vis,
  listen:fn=>{fns.add(fn);st.listeners++;return()=>{fns.delete(fn);st.listeners--;};}});
 const hide=v=>{st.vis=!v;for(const f of fns)f();};
 return {a,log,st,adv:s=>{st.t+=s*1000;},hide};
}

ok('lm: ids are fixed, well-formed, allowlisted and unique',()=>{
 const ids=K.LIVE_MATCH_COUNT_IDS;
 assert.equal(ids.length,K.LIVE_MATCH_FORMATS.length*K.LM_FORMAT_EVENTS.length+K.LM_REACH.length);
 assert.deepEqual([...K.LIVE_MATCH_FORMATS],['7v7','futsal','9v9','11v11','beach','stadium']);
 for(const id of ids){assert(K.COUNT_KEY_RE.test(id),id);assert(K.isCountId(id),id);assert(K.FIXED_COUNT_IDS.includes(id),id);}
 assert.equal(new Set(K.FIXED_COUNT_IDS).size,K.FIXED_COUNT_IDS.length,'no duplicate fixed ids');
 for(const need of ['lm:7v7_visit','lm:futsal_join','lm:9v9_leave','lm:11v11_min','lm:beach_sec','lm:7v7_role_gk','lm:beach_len_2h','lm:9v9_with_4p','lm:futsal_end_hide','lm:reach_10'])assert(ids.includes(need),need);
 for(const bad of ['lm:5v5_join','lm:7v7_name','lm:7v7_slot_cb','lm:7v7_role_striker','lm:reach_2','lm:7v7_with_5'])assert(!K.isCountId(bad),bad);
 assert(/lm:<format>_<event>/.test(read('lib/analytics/countIds.ts').split('*/')[0]),'family documented in the header');
 // The runtime's formats are exactly the analytics formats.
 const town=read('lib/town/liveJoin.ts');for(const f of K.LIVE_MATCH_FORMATS)assert(town.includes(`'${f}':{enabled:true`),f+' joinable');
});

ok('bands and roles',()=>{
 assert.equal(E.lenBand(0),'len_1m');assert.equal(E.lenBand(59),'len_1m');assert.equal(E.lenBand(60),'len_3m');assert.equal(E.lenBand(299),'len_5m');
 assert.equal(E.lenBand(3599),'len_60m');assert.equal(E.lenBand(3600),'len_2h');assert.equal(E.lenBand(7200),'len_2h');
 assert.deepEqual([0,1,2,3,4,9].map(E.withBand),['with_0','with_1','with_2_3','with_2_3','with_4p','with_4p']);
 assert.equal(E.roleOf('def'),'def');assert.equal(E.roleOf('fwd'),'fwd');assert.equal(E.roleOf('cb'),'mid');assert.equal(E.roleOf(null),'mid');assert.equal(E.roleOf('fwd',true),'gk');
});

ok('pitch visit: once per visit, not per frame or per bar flicker',()=>{
 const {a,log,adv}=rig();
 a.venue('7v7');assert(a.barShown('7v7'));
 for(let i=0;i<20;i++){assert(!a.barShown('7v7'));adv(5);}// the bar hides and shows with the HUD focus: same visit
 a.venue(null);adv(30);a.venue('7v7');assert(!a.barShown('7v7'),'back within a minute: same visit');
 a.venue(null);adv(61);a.venue('7v7');assert(a.barShown('7v7'),'away over a minute: a new visit');
 a.venue('futsal');assert(a.barShown('futsal'));assert(!a.barShown('futsal'));
 assert(!a.barShown('arcade'),'not a live format');
 assert.deepEqual(log,{'lm:7v7_visit':2,'lm:futsal_visit':1});
});

ok('join and leave: role, exact foreground seconds, length band, friends band, how it ended, reach',()=>{
 const {a,log,st,adv,hide}=rig();
 a.on({type:'join',format:'9v9',role:'def',others:0});assert.equal(st.listeners,1,'one visibility listener while open');
 adv(125);a.on({type:'others',others:2});adv(10);
 a.on({type:'leave',reason:'leave',others:1});assert.equal(st.listeners,0,'listener removed on leave');
 assert.equal(log['lm:9v9_join'],1);assert.equal(log['lm:9v9_role_def'],1);assert.equal(log['lm:9v9_leave'],1);
 assert.equal(log['lm:9v9_min']*60+log['lm:9v9_sec'],135,'135 s to the second');assert.equal(log['lm:9v9_len_3m'],1);
 assert.equal(log['lm:9v9_with_2_3'],1,'busiest head count kept');assert.equal(log['lm:9v9_end_leave'],1);assert.equal(log['lm:reach_1'],1);
 // A hidden stretch is not play, and minutes are banked when the tab hides.
 a.on({type:'join',format:'beach',role:'gk',others:0});adv(90);hide(true);assert.equal(log['lm:beach_min'],1,'banked on hide');
 adv(600);hide(false);adv(30);a.on({type:'leave',reason:'forced',others:0});
 assert.equal(log['lm:beach_min']*60+(log['lm:beach_sec']||0),120);assert.equal(log['lm:beach_role_gk'],1);assert.equal(log['lm:beach_end_forced'],1);assert.equal(log['lm:beach_with_0'],1);
 // The cap: a tab left on the pitch for 5 h books 2 h.
 a.on({type:'join',format:'11v11',role:'fwd',others:0});adv(5*3600);a.on({type:'leave',reason:'leave',others:0});
 assert.equal(log['lm:11v11_min']*60+(log['lm:11v11_sec']||0),E.LM_CAP_S);assert.equal(log['lm:11v11_len_2h'],1);assert.equal(log['lm:reach_3'],1);
 // A leave with no open match, or an unknown format, sends nothing.
 const before=JSON.stringify(log);a.on({type:'leave',reason:'leave',others:0});a.on({type:'join',format:'5v5',role:'mid',others:0});assert.equal(JSON.stringify(log),before);
});

ok('the tab closing mid-match books it (pagehide hook), once',()=>{
 assert.equal(hooks.length,0);const off=E.watchLiveMatchEnd();assert.equal(hooks.length,1);
 const src=strip(read('lib/analytics/liveMatchEvents.ts'));
 assert.match(src,/onPageHide\(\(\)=>\{if\(liveMatch\.state\(\)\.open\)liveMatch\.on\(\{type:'leave',reason:'hide'/);
 const {a,log,adv}=rig();a.on({type:'join',format:'futsal',role:'mid',others:0});adv(42);a.on({type:'leave',reason:'hide',others:0});a.on({type:'leave',reason:'leave',others:0});
 assert.equal(log['lm:futsal_end_hide'],1);assert.equal(log['lm:futsal_leave'],1,'the runtime leave after it is ignored');assert.equal(log['lm:futsal_sec'],42);off();
});

/** A merged fixture: sessions behind each id (S) and totals (C). */
function fixture(){
 const C={},S={};const put=(id,c,s)=>{C[id]=c;S[id]=s;};
 put('lm:7v7_visit',40,30);put('lm:7v7_join',20,10);put('lm:7v7_leave',20,10);put('lm:7v7_min',90,10);put('lm:7v7_sec',300,8);
 // 20 matches: 4 under 1 min, 6 at 1-3, 6 at 3-5, 4 at 5-10 → the 10th match sits in 1-3 min at its far edge.
 put('lm:7v7_len_1m',4,4);put('lm:7v7_len_3m',6,6);put('lm:7v7_len_5m',6,5);put('lm:7v7_len_10m',4,4);
 put('lm:7v7_with_0',14,8);put('lm:7v7_with_1',6,5);put('lm:7v7_role_mid',12,8);put('lm:7v7_role_gk',3,3);
 put('lm:futsal_visit',3,3);put('lm:futsal_join',1,1);put('lm:futsal_leave',1,1);put('lm:futsal_min',2,1);
 put('lm:reach_1',11,11);put('lm:reach_3',4,4);
 return {counts:C,countSessions:S,totals:{sessions:200}};
}
ok('report maths: visits, joins, rate, players, avg / median seconds, longest band, suppression',()=>{
 const m=fixture(),days=['2026-11-05','2026-11-06','2026-11-07','2026-11-08','2026-11-09','2026-11-10','2026-11-11'];
 const rollups=days.map((day,i)=>i===0?{day,counts:{'lm:7v7_join':20,'lm:7v7_min':90,'lm:7v7_sec':300,'lm:7v7_visit':40},countSessions:{'lm:7v7_join':10,'lm:7v7_min':10,'lm:7v7_visit':30}}:{day,counts:{},countSessions:{}});
 const r=R.buildLiveMatches(m,{from:'2026-11-05',to:'2026-11-11'},rollups);
 assert.equal(r.status,'ok');assert.equal(r.days,7);
 const s=r.formats.find(f=>f.format==='7v7');
 assert.equal(s.visits,40);assert.equal(s.joins,20);assert.equal(s.joinRate,.5);assert.equal(s.players,10);assert.equal(s.playsPerPlayer,2);
 assert.equal(s.seconds,90*60+300);assert.equal(s.minutes,95);assert.equal(s.avgSec,Math.round((90*60+300)/20));
 assert.equal(s.medianSec,180,'10th of 20 at the top of 1-3 min');assert.equal(R.bandMedian([0,0,10,0,0,0,0,0]),240,'linear inside the band');assert.equal(R.bandMedian([0,0,0,0,0,0,0,0]),null,'no matches');assert(R.bandMedian([1,1,1,0,0,0,0,0])>0,'exact from the first matches (owner Nov 5 2026)');
 assert.equal(s.longestBand,'5–10 min');assert.equal(s.medianBand,'1–3 min');
 assert.equal(s.shared,6);assert.equal(s.sharedRate,.3);
 assert.equal(s.roles.find(x=>x.id==='lm:7v7_role_gk').value,3,'3 sessions: exact, never <5');assert.equal(s.roles.find(x=>x.id==='lm:7v7_role_mid').value,12);
 const fu=r.formats.find(f=>f.format==='futsal');
 assert.equal(fu.visits,3);assert.equal(fu.joins,1);assert.equal(fu.joinRate,1/3);assert.equal(fu.seconds,120);
 assert.equal(r.formats.find(f=>f.format==='beach').joins,0,'nothing is 0');
 assert.equal(r.totals.players,11);assert.equal(r.totals.joins,21,'the sum is exact');assert.equal(r.totals.playShare,11/200);
 assert.equal(r.totals.reach.find(x=>x.id==='lm:reach_3').value,4);
 assert.equal(r.hidden,0,'nothing is hidden');
 assert.equal(r.daily.length,7);assert.equal(r.daily[0].joins['7v7'],20);assert.equal(r.daily[0].minutes['7v7'],95);assert.equal(r.daily[1].joins['7v7'],0);
 // Without futsal the totals add up, and matches per week is joins over the range's days × 7.
 const m2=fixture();for(const k of Object.keys(m2.counts))if(k.startsWith('lm:futsal'))delete m2.counts[k],delete m2.countSessions[k];
 const r2=R.buildLiveMatches(m2,{from:'2026-11-05',to:'2026-11-11'},rollups);
 assert.equal(r2.totals.joins,20);assert.equal(r2.totals.visits,40);assert.equal(r2.totals.joinRate,.5);assert.equal(r2.totals.matchesPerWeek,20);assert.equal(r2.totals.minutes,95);assert.equal(r2.totals.medianSec,180);
 // Audit Nov 6 2026: a range reaching back before counting began (LM_SINCE) rates per week, and shares sessions, over the days
 // since then only (it used to divide 20 joins by all 14 days: 10 a week instead of 70).
 const pre=['2026-10-23','2026-10-24','2026-10-25','2026-10-26','2026-10-27','2026-10-28','2026-10-29','2026-10-30','2026-10-31','2026-11-01','2026-11-02','2026-11-03','2026-11-04'];
 const wide=[...pre.map(day=>({day,counts:{},countSessions:{},sessions:1000})),{day:'2026-11-05',counts:{},countSessions:{},sessions:150},{day:'2026-11-06',counts:{},countSessions:{},sessions:50}];
 const r3=R.buildLiveMatches({...m2,totals:{sessions:13200}},{from:'2026-10-23',to:'2026-11-06'},wide);
 assert.equal(r3.partial,true);assert.equal(r3.days,2,'Nov 5–6');assert.equal(r3.totals.matchesPerWeek,20/2*7);
 assert.equal(r3.sessions,200,'sessions since Nov 5');assert.equal(r3.totals.playShare,11/200);
 assert(read('app/admin/LiveMatchesSection.tsx').includes("'Every count is exact (no small-number hiding).'"),'no "<5" promise when nothing is hidden');
 assert.equal(R.buildLiveMatches({counts:{},countSessions:{},totals:{sessions:0}},{from:'2026-10-01',to:'2026-10-07'}).status,'not_yet');
 assert.equal(R.buildLiveMatches({counts:{},countSessions:{},totals:{sessions:3}},{from:'2026-11-05',to:'2026-11-07'}).status,'empty');
});

ok('privacy: only fixed ids and numbers leave the tab; the runtime hands over format, role and a head count only',()=>{
 const ev=strip(read('lib/analytics/liveMatchEvents.ts'));
 assert(!/\b(name|nick|code|slot|team|side|score|email|ip)\b\s*[:=]/i.test(ev),'no PII field in the events module');
 assert(!/fetch\(|sendBeacon|localStorage|sessionStorage|setInterval|setTimeout|requestAnimationFrame/.test(ev),'no request, storage, timer or frame loop of its own');
 for(const m of ev.matchAll(/env\.count\(([^,)]+)/g))assert(/^(lmId\(|'lm:reach_')/.test(m[1].trim()),'count id built from the allowlist: '+m[1]);
 const rt=strip(read('lib/town/liveJoinRuntime.ts')),calls=[...rt.matchAll(/api\.onMatch\?\.\((\{[^}]*\})\)/g)].map(m=>m[1]);
 // Nov 6 2026 (deliberate): + goal, replay shown and replay skipped (countIds.ts LM_MATCH_EVENTS), each a transition with a yes/no.
 assert.equal(calls.length,6,'join, others, leave, goal, replay, replay skipped');
 for(const c of calls){const keys=[...c.matchAll(/([a-z]+):/g)].map(m=>m[1]);for(const k of keys)assert(['type','format','role','others','reason','mine','skipped'].includes(k),'payload key '+k);}
 assert(!/lib\/analytics/.test(rt.match(/^import[^\n]*$/gm).join('\n')),'the runtime imports no analytics (Town wires it)');
 // A real event's object carries numbers and fixed words only.
 const {a,log,adv}=rig();a.on({type:'join',format:'7v7',role:'fwd',others:3,name:'Alex',code:'ABCD'});adv(61);a.on({type:'leave',reason:'leave',others:3});
 for(const [id,n] of Object.entries(log)){assert(K.LIVE_MATCH_COUNT_IDS.includes(id),id);assert.equal(typeof n,'number');assert(!/alex|abcd/i.test(id));}
});

ok('wiring: Town, the runtime, the report, the dashboard tab',()=>{
 const town=read('components/Town.tsx');
 assert(town.includes("import {liveMatch,watchLiveMatchEnd} from '@/lib/analytics/liveMatchEvents'"));
 assert(town.includes('liveJoin.onMatch=e=>liveMatch.on(e)'));assert(town.includes('useEffect(()=>watchLiveMatchEnd(),[])'));
 assert.match(town,/if\(button\.hidden&&button\.hasAttribute\('data-live-bar'\)\)liveMatch\.barShown\(v\.id\)/);
 assert.match(town,/if\(visibleVenue!==lmVenue\)\{lmVenue=visibleVenue;liveMatch\.venue\(visibleVenue\);\}/);
 assert(read('components/FieldPathCard.tsx').includes('data-live-bar=""'));
 const rt=read('lib/town/liveJoinRuntime.ts');
 assert.match(rt,/api\.onMatch\?\.\(\{type:'join',format:f,role:view\.keeper\?'gk':simOf\(f\)\?\.players\[slot\]\?\.role\?\?null,others:othersOn\(f\),\.\.\.slotsOn\(f\)\}\)/);// Nov 6 2026: + the AI / human slot counts
 assert.match(rt,/api\.onMatch\?\.\(\{type:'leave',reason:byUser\?'leave':'forced',others:othersOn\(format\)\}\);left=games\.leaveMatch/);
 assert(read('lib/analytics/report.ts').includes('report.liveMatches=buildLiveMatches(merged,range,rollups)'));
 assert(read('lib/analytics/core.ts').includes('liveMatches?:LiveMatchReport|null'));
 const dash=read('app/admin/AnalyticsDashboard.tsx');// Nov 6 2026 (deliberate): the tabs live in lib/analytics/metricIndex.ts (DASH_TABS) and the section carries its metric-index id.
 assert(read('lib/analytics/metricIndex.ts').includes("['matches','Live matches']")&&dash.includes("{tab==='matches'&&<div className={dd.mx} data-metric=\"matches.section\"><LiveMatchesSection report={report}"));
 const sec=read('app/admin/LiveMatchesSection.tsx');assert(sec.includes('report.liveMatches')&&!/IslandBrush/.test(sec));
});
ok('fixture render: the Live matches section (data, empty, not tracked yet)',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 const css=new Proxy({},{get:(_,k)=>typeof k==='string'?k:undefined});
 const S=createLoader({'admin.module.css':css,'IslandTravelMap.module.css':css})('app/admin/LiveMatchesSection.tsx');
 const days=['2026-11-05','2026-11-06'],rollups=days.map(day=>({day,counts:{'lm:7v7_join':10,'lm:7v7_min':40},countSessions:{'lm:7v7_join':6,'lm:7v7_min':6}}));
 const el=lm=>renderToStaticMarkup(React.createElement(S.default,{report:{liveMatches:lm},rangeText:'Nov 5 – Nov 6',dayLabel:d=>d.slice(5)}));
 const html=el(R.buildLiveMatches(fixture(),{from:days[0],to:days[1]},rollups));
 for(const want of ['Live matches','Pitch visits','Matches joined','By format','Matches by day','How often','Match length','Position picked','With friends','How matches ended','Beach soccer','11v11','Every count is exact'])assert(html.includes(want),want);
 assert(!html.includes('&lt;5'),'exact counts (owner Nov 5 2026): no "<5" anywhere on the tab (audit Nov 6 2026: the header still promised one)');
 assert.equal(S.fmtSec(135),'2 min 15 s');assert.equal(S.fmtSec(38),'38 s');assert.equal(S.fmtSec(4320),'1 h 12 min');assert.equal(S.fmtSec(null),'—');
 assert(/No live matches in this range yet/.test(el(R.buildLiveMatches({counts:{},countSessions:{},totals:{sessions:0}},{from:'2026-11-05',to:'2026-11-06'}))));
 assert(/Not tracked yet/.test(el(R.buildLiveMatches({counts:{},countSessions:{},totals:{sessions:0}},{from:'2026-10-01',to:'2026-10-02'}))));
});
console.log(`admin-analytics-live-matches: ${passed} groups passed`);
