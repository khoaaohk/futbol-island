#!/usr/bin/env node
// Site pages to Play (Nov 20 2026, lib/analytics/siteFunnelIds.ts): the sf: ids are fixed, well formed, allowlisted and unique;
// a path maps to one fixed section (Spanish pages, the Coach app and Scan Trainer included; the home page, /play and unknown
// paths to none); a view counts once (also under React's double effect), a Play tap once per view; the per-tab marks give
// reached / reached-from-search / played with the freshness and once-per-tab rules; a real tracker beacon → ingest → memory
// store → report → the admin table; nothing personal in an id, a mark or a beacon; the home page funnel (mk:) is untouched.
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
const K=load('lib/analytics/countIds.ts'),SF=load('lib/analytics/siteFunnelIds.ts'),SR=load('lib/analytics/siteFunnelReport.ts'),MK=load('lib/analytics/marketingIds.ts'),
 T=load('lib/analytics/tracker.ts'),C=load('lib/analytics/core.ts'),S=load('lib/analytics/store.ts'),I=load('lib/analytics/ingest.ts'),R=load('lib/analytics/report.ts'),D=load('lib/analytics/daily.ts');
const read=f=>fs.readFileSync(f,'utf8');
const J=x=>JSON.parse(JSON.stringify(x)),deq=(a,b,msg)=>assert.deepStrictEqual(J(a),J(b),msg);
let passed=0;const ok=(name,fn)=>Promise.resolve().then(fn).then(()=>{passed++;},e=>{console.error('FAIL',name);throw e;});
const ORIGIN='https://futbolisland.app';
/** A sessionStorage stand-in. */
const session=()=>{const m={};return {m,getItem:k=>m[k]??null,setItem:(k,v)=>{m[k]=String(v);},removeItem:k=>{delete m[k];}};};
/** A document stand-in: click listeners, and a click on a link with this href (or on something that is not a link). */
function doc(){let ls=[];return {ls:()=>ls.length,addEventListener:(t,f)=>{assert.equal(t,'click');ls.push(f);},removeEventListener:(t,f)=>{ls=ls.filter(x=>x!==f);},
 click(href){const target=href===undefined?{closest:()=>null}:{closest:sel=>{assert.equal(sel,'a[href]');return {getAttribute:()=>href};}};for(const f of [...ls])f({target});}};}
function view(pathname,{ss=session(),d=doc(),now=1_000_000,fromSearch=false,perf=0}={}){
 const got=[];const stop=SF.watchSiteView(pathname,{document:d,origin:ORIGIN,session:ss,now:()=>now,count:id=>got.push(id),fromSearch:()=>fromSearch},perf);
 return {got,stop,ss,d};}

(async()=>{
await ok('sf: ids are fixed, well formed, allowlisted, unique and labelled; nothing personal in an id',()=>{
 const ids=SF.SITE_FUNNEL_COUNT_IDS;
 assert.equal(ids.length,SF.SF_SECTIONS.length*SF.SF_STAGES.length);assert.equal(ids.length,95,'19 sections × 5 steps');
 assert.equal(new Set(ids).size,ids.length);
 for(const id of ids){assert(K.COUNT_KEY_RE.test(id),id);assert(K.isCountId(id),id);assert(K.FIXED_COUNT_IDS.includes(id),id);
  assert(/^sf:(v|p|r|rs|d)_[a-z0-9]+(_[a-z0-9]+)?$/.test(id),id+' is a step and a section name only');
  assert(D.counterLabel(id)!==id,id+' has a label in the export');}
 assert.equal(new Set(K.FIXED_COUNT_IDS).size,K.FIXED_COUNT_IDS.length,'no duplicate fixed ids');
 for(const want of ['learn_rules','learn_terms','learn_drills','learn_lessons','learn_positions','learn_formations','learn_other','tools','games','videos','cards','fish','exhibits','books','library','about','safety','coach_app','scan_app'])
  for(const st of SF.SF_STAGES)assert(ids.includes(`sf:${st}_${want}`),want+' '+st);
 for(const bad of ['sf:v_home','sf:v_play','sf:v_privacy','sf:v_marketing','sf:v_learn','sf:x_tools','sf:v_tools:1','sf:v_Tools','sf:v_cards_45','sf:v_'])assert(!K.isCountId(bad),bad);
 assert(SF.SF_SECTIONS.every(([k,l])=>/^[a-z0-9_]{1,30}$/.test(k)&&l&&!/@|https?:/.test(l)),'section keys and plain labels');
});

await ok('a path maps to one fixed section; the home page, /play and unknown paths to none',()=>{
 const cases={'/learn':'learn_other','/learn/':'learn_other','/learn/soccer-rules':'learn_rules','/learn/soccer-rules/offside-rule-for-kids':'learn_rules','/learn/football-rules-for-kids':'learn_rules',
  '/learn/soccer-terms/yellow-card':'learn_terms','/learn/soccer-drills/rondo':'learn_drills','/learn/soccer-practice-plans':'learn_drills','/learn/lessons/7v7-1':'learn_lessons',
  '/learn/soccer-positions/striker':'learn_positions','/learn/soccer-formations':'learn_formations','/learn/9v9-soccer-formations/3-2-3':'learn_formations','/learn/7v7-soccer-formations':'learn_formations',
  '/learn/11v11-soccer-formations':'learn_formations','/learn/futsal-for-kids':'learn_other','/learn/soccer-ball-size-by-age':'learn_other','/learn/anything-new':'learn_other',
  '/tools':'tools','/tools/soccer-field-diagrams/7v7':'tools','/games/pinball':'games','/videos/x':'videos','/cards/45':'cards','/fish':'fish','/exhibits/a/b':'exhibits','/books/messi':'books',
  '/library':'library','/library/soccer-rules':'library','/about':'about','/safe-football-game-for-kids':'safety','/coach':'coach_app','/scan':'scan_app',
  '/es/learn/soccer-rules/heading-rules-for-kids':'learn_rules','/es/tools':'tools','/es/cards/3':'cards','/es':null,'/es/':null,
  '/CARDS/45':'cards','/cards/45?x=secret#frag':'cards',
  '/':null,'':null,'/play':null,'/play?from=x':null,'/privacy':null,'/marketing':null,'/admin':null,'/arcade':null,'/museum':null,'/shop':null,'/embed/scan':null,'/coffee':null,'/toString':null,'/constructor':null,'/learn/constructor':'learn_other'};
 for(const [p,want] of Object.entries(cases))assert.equal(SF.siteSectionOf(p),want,p);
 for(const bad of [null,undefined,5,{},'cards','https://futbolisland.app/cards'])assert.equal(SF.siteSectionOf(bad),null);
 // every section can be reached by some path, and every folder of app/(site) is either a section or deliberately left out
 const reach=new Set(Object.values(cases).filter(Boolean));for(const [k] of SF.SF_SECTIONS)assert(reach.has(k),k+' has a path');
 for(const dir of fs.readdirSync('app/(site)',{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name))
  assert(dir==='marketing'||SF.siteSectionOf('/'+dir),'app/(site)/'+dir+' is counted in a section');
 for(const dir of fs.readdirSync('app/(site)/learn',{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name))assert(String(SF.siteSectionOf('/learn/'+dir)).startsWith('learn_'),dir);
});

await ok('links to /play are recognised; other links are not',()=>{
 for(const h of ['/play','/play/','/play?lesson=7v7-1','/play#x',ORIGIN+'/play','play'])assert(SF.isPlayHref(h,ORIGIN),h);
 for(const h of ['/playground','/learn','/','','#play',null,undefined,'https://example.com/play','/es/play','/play/extra','mailto:a@b.c','http://[bad'])assert(!SF.isPlayHref(h,ORIGIN),String(h));
});

await ok('a view counts once (also under a double effect); a Play tap once per view; the mark is per tab and names only the section',()=>{
 const a=view('/learn/soccer-rules/offside-rule-for-kids',{perf:5000});
 deq(a.got,['sf:v_learn_rules']);assert.equal(a.d.ls(),1,'one click listener');
 a.d.click('/learn/soccer-terms');a.d.click(undefined);a.d.click('https://example.com/play');deq(a.got,['sf:v_learn_rules'],'other links count nothing');
 assert.equal(a.ss.getItem(SF.SF_PLAY_KEY),null);
 a.d.click('/play');a.d.click('/play?x=1');a.d.click('/play');
 deq(a.got,['sf:v_learn_rules','sf:p_learn_rules'],'three taps in one view = one Play tap');
 assert.equal(a.ss.getItem(SF.SF_PLAY_KEY),'learn_rules.1000000');deq(Object.keys(a.ss.m),[SF.SF_PLAY_KEY],'one mark, nothing else stored');
 assert(!/offside|soccer-rules|\//.test(a.ss.getItem(SF.SF_PLAY_KEY)),'the mark never holds the page');
 a.stop();assert.equal(a.d.ls(),0,'the listener is removed');
 // React strict mode: effect, cleanup, effect again within a second → one view
 const d=doc(),g=[];const env={document:d,origin:ORIGIN,session:session(),now:()=>1,count:id=>g.push(id),fromSearch:()=>false};
 const s1=SF.watchSiteView('/cards/45',env,9000);s1();const s2=SF.watchSiteView('/cards/45',env,9001);
 deq(g,['sf:v_cards']);assert.equal(d.ls(),1);d.click('/play');deq(g,['sf:v_cards','sf:p_cards']);s2();
 // the next page view counts again, with its own tap
 const s3=SF.watchSiteView('/cards/46',env,9002);d.click('/play');s3();deq(g,['sf:v_cards','sf:p_cards','sf:v_cards','sf:p_cards']);
 // coming back to the same page later is a new view
 SF.watchSiteView('/cards/46',env,20000)();assert.equal(g.filter(x=>x==='sf:v_cards').length,3);
 // pages outside every section: no count, no listener, no storage
 for(const p of ['/','/play','/privacy','/marketing','/admin','/arcade']){const v=view(p);assert.equal(v.stop,null,p);deq(v.got,[]);assert.equal(v.d.ls(),0);deq(v.ss.m,{});}
 // a search session marks the tap; a throwing storage or reader never breaks the click
 const s=view('/coach',{fromSearch:true,perf:40000});s.d.click('/play');assert.equal(s.ss.getItem(SF.SF_PLAY_KEY),'coach_app.1000000.s');deq(s.got,['sf:v_coach_app','sf:p_coach_app']);
 const g2=[];SF.watchSiteView('/scan',{document:d,origin:ORIGIN,session:{setItem(){throw Error('full');}},now:()=>1,count:id=>g2.push(id),fromSearch:()=>{throw Error('x');}},60000);
 d.click('/play');deq(g2,['sf:v_scan_app','sf:p_scan_app']);
});

await ok('reached and played: fresh marks only, used up once, once per tab; search arrivals are a part of reached',()=>{
 const run=(mark,now)=>{const ss=session(),g=[];if(mark)ss.setItem(SF.SF_PLAY_KEY,mark);SF.countSitePlayArrival(ss,now,id=>g.push(id));return {ss,g};};
 const t0=1_700_000_000_000;
 let r=run('learn_terms.'+t0,t0+4000);deq(r.g,['sf:r_learn_terms']);assert.equal(r.ss.getItem(SF.SF_PLAY_KEY),null,'the tap mark is used up');
 assert.equal(r.ss.getItem(SF.SF_REACHED_KEY),'learn_terms.'+(t0+4000));
 SF.countSitePlayArrival(r.ss,t0+5000,id=>r.g.push(id));deq(r.g,['sf:r_learn_terms'],'a second /play view counts nothing');
 SF.countSitePlayStart(r.ss,t0+60_000,id=>r.g.push(id));deq(r.g,['sf:r_learn_terms','sf:d_learn_terms']);
 assert.equal(r.ss.getItem(SF.SF_REACHED_KEY),null);assert.equal(r.ss.getItem(SF.SF_PLAYED_KEY),'1');
 SF.countSitePlayStart(r.ss,t0+61_000,id=>r.g.push(id));assert.equal(r.g.length,2,'played once');
 // the same tab taps Play on another page later: reached again, played stays once per tab
 r.ss.setItem(SF.SF_PLAY_KEY,'cards.'+(t0+100_000));SF.countSitePlayArrival(r.ss,t0+101_000,id=>r.g.push(id));SF.countSitePlayStart(r.ss,t0+102_000,id=>r.g.push(id));
 deq(r.g,['sf:r_learn_terms','sf:d_learn_terms','sf:r_cards']);assert.equal(r.ss.getItem(SF.SF_REACHED_KEY),null);
 // from search
 r=run('tools.'+t0+'.s',t0+1);deq(r.g,['sf:r_tools','sf:rs_tools']);assert.equal(r.ss.getItem(SF.SF_REACHED_KEY),'tools.'+(t0+1),'the arrival mark keeps no search flag');
 // stale, future, malformed and unknown marks count nothing and are removed
 for(const [m,now] of [['cards.'+t0,t0+MK.PLAY_FRESH_MS],['cards.'+(t0+5),t0],['cards',t0],['.'+t0,t0],['home.'+t0,t0],['play.'+t0,t0],['cards.abc',t0],['cards.'+t0+'.s.extra'.repeat(9),t0],['<script>.1',t0]]){
  r=run(m,now);deq(r.g,[],m);deq(r.ss.m,{},m+' leaves nothing behind');}
 assert.equal(SF.playMark('cards',t0+MK.PLAY_FRESH_MS-1,false),'cards.'+(t0+MK.PLAY_FRESH_MS-1));
 r=run('cards.'+t0,t0+MK.PLAY_FRESH_MS-1);deq(r.g,['sf:r_cards'],'just inside the window');
 // played too late after arriving: nothing
 SF.countSitePlayStart(r.ss,t0+3*MK.PLAY_FRESH_MS,id=>r.g.push(id));deq(r.g,['sf:r_cards']);assert.equal(r.ss.getItem(SF.SF_PLAYED_KEY),null);
 // no storage at all, or storage that throws: nothing, no error
 const g=[];SF.countSitePlayArrival(null,t0,id=>g.push(id));SF.countSitePlayStart(null,t0,id=>g.push(id));
 SF.countSitePlayArrival({getItem(){throw Error('x');},removeItem(){}},t0,id=>g.push(id));deq(g,[]);
 // the home page's marks are separate: an mk: tap gives no sf: count and the other way round
 const ss=session(),g3=[];ss.setItem(MK.MK_PLAY_KEY,String(t0));SF.countSitePlayArrival(ss,t0+1,id=>g3.push(id));deq(g3,[]);
 MK.countPlayArrival(ss,t0+1,id=>g3.push(id));deq(g3,['mk:reached']);
 assert(new Set([SF.SF_PLAY_KEY,SF.SF_REACHED_KEY,SF.SF_PLAYED_KEY,MK.MK_PLAY_KEY,MK.MK_REACHED_KEY,MK.MK_PLAYED_KEY]).size===6);
});

let seed=0;
function trackerEnv(pathname,referrer=''){
 const L={};let t=0;const sent=[],store={};
 const add=(k,f,o)=>{(L[k]??=[]).push({f,o});},rm=(k,f)=>{L[k]=(L[k]||[]).filter(x=>x.f!==f);};
 const w={location:{hostname:'futbolisland.app',origin:ORIGIN,pathname,search:''},addEventListener:add,removeEventListener:rm,setTimeout:()=>1,clearTimeout:()=>{}};
 const d={visibilityState:'visible',referrer,addEventListener:add,removeEventListener:rm};
 const n={sendBeacon:(u,b)=>{sent.push(JSON.parse(b));return true;},maxTouchPoints:0};
 return {w,d,sent,advance:ms=>{t+=ms;},
  e:{window:w,document:d,navigator:n,storage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v;}},now:()=>t,random:k=>{seed++;return new Uint8Array(k).map((_,i)=>(i*7+seed*53+(i===0?seed:0))&255);}},
  hide(){d.visibilityState='hidden';for(const x of L.visibilitychange||[])x.f({type:'visibilitychange'});}};
}
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
function hdr(extra={}){const m=new Map(Object.entries({host:'futbolisland.app','user-agent':UA,'x-forwarded-for':'203.0.113.7',origin:ORIGIN,...extra}));return {get:k=>m.get(k.toLowerCase())??null};}
const ingest=(store,body,now,h)=>I.handleIngest({body:JSON.stringify(body),headers:h,store,limiter:I.createLimiter({capacity:1e6}),now,vercelEnv:'production'});

await ok('tracker → beacon → ingest → report: per section views, taps, reached, played; exact; nothing personal sent or stored',async()=>{
 const store=S.createMemoryStore(),now=new Date('2026-11-20T18:00:00Z');
 // [first path, referrer, taps Play?, reaches, plays]
 const visits=[['/learn/soccer-rules/offside-rule-for-kids','https://www.google.com/search?q=secret+words',true,true,true],['/learn/soccer-rules','',true,true,false],['/learn/soccer-rules/handball','',false,false,false],
  ['/learn/soccer-rules/handball','',false,false,false],['/cards/45','',true,false,false],['/coach','',false,false,false],['/scan','https://chatgpt.com/',true,true,true],['/es/tools','',false,false,false]];
 let i=0;
 for(const [p,ref,tap,reach,play] of visits){
  const x=trackerEnv(p,ref),tr=T.startTracker(x.e);tr.pageview(p);
  assert.equal(T.sessionFromSearch(),!!ref,'the session start knows a search arrival');
  const ss=session(),d=doc();
  const stop=SF.watchSiteView(p,{document:d,origin:ORIGIN,session:ss,now:()=>now.getTime(),count:T.count,fromSearch:T.sessionFromSearch},100_000*(++i));
  if(tap)d.click('/play');stop();
  if(reach){tr.pageview('/play');SF.countSitePlayArrival(ss,now.getTime()+2000,T.count);}
  if(play)SF.countSitePlayStart(ss,now.getTime()+9000,T.count);
  x.advance(5000);x.hide();tr.stop();
  const all=JSON.stringify(x.sent);
  for(const bad of ['secret','google.com/search','fi-sf'])assert(!all.includes(bad),'not sent: '+bad);
  // the page itself rides only where it did before (the beat's path and the se: landing id), never in an sf: id
  for(const b of x.sent)for(const k of Object.keys(b.k||{}).filter(k=>k.startsWith('sf:')))assert(SF.SITE_FUNNEL_COUNT_IDS.includes(k)&&!/offside|handball|rules_/i.test(k.replace('learn_rules','')),k);
  for(const b of x.sent)for(const k of Object.keys(b.k||{}))assert(K.isCountId(k),k);
  for(const b of x.sent)assert.equal((await ingest(store,b,now,hdr({'x-forwarded-for':'203.0.113.'+(20+i)}))).reason,'ok');
 }
 // a forged or unknown section from a browser is dropped; DNT stores nothing
 const x=trackerEnv('/cards/1'),tr=T.startTracker(x.e);tr.pageview('/cards/1');const s=x.sent[0].s;
 assert.equal((await ingest(store,{v:1,t:'beat',s,p:'/cards/1',e:1000,k:{'sf:v_home':9,'sf:v_cards_45':9,'sf:z_cards':9}},now,hdr({'x-forwarded-for':'203.0.113.90'}))).reason,'ok');
 assert.equal((await ingest(store,{v:1,t:'beat',s,p:'/cards/1',e:1000,k:{'sf:v_cards':7}},now,hdr({dnt:'1'}))).reason,'dnt');tr.stop();
 const raw=JSON.stringify(store.data);for(const bad of ['secret','handball','sf:v_home','sf:v_cards_45','sf:z_cards','203.0.113'])assert(!raw.includes(bad),'not stored: '+bad);
 const day=C.dayIn('pacific',now),rep=await R.buildReport(store,{from:day,to:day},now),f=rep.siteFunnel;
 assert(f&&f.hasData);assert.equal(f.since,'2026-11-20');assert.equal(f.rows.length,SF.SF_SECTIONS.length,'every section is listed');
 const by=Object.fromEntries(f.rows.map(r=>[r.id,r]));
 deq([by.learn_rules.views,by.learn_rules.taps,by.learn_rules.reached,by.learn_rules.reachedSearch,by.learn_rules.played],[4,2,2,1,1]);
 assert.equal(by.learn_rules.tapRate,0.5);assert.equal(by.learn_rules.playedPer1000,250);
 deq([by.cards.views,by.cards.taps,by.cards.reached,by.cards.played],[1,1,0,0]);
 deq([by.scan_app.views,by.scan_app.taps,by.scan_app.reached,by.scan_app.reachedSearch,by.scan_app.played],[1,1,1,1,1]);
 deq([by.coach_app.views,by.coach_app.taps],[1,0]);deq([by.tools.views,by.tools.taps],[1,0],'a Spanish page counts with its section');
 deq([by.library.views,by.library.tapRate,by.library.playedPer1000],[0,null,null],'no views: no rate');
 assert.equal(f.rows[0].id,'learn_rules','sorted by views');for(let j=1;j<f.rows.length;j++)assert(f.rows[j-1].views>=f.rows[j].views);
 deq([f.total.views,f.total.taps,f.total.reached,f.total.reachedSearch,f.total.played],[8,4,3,2,2]);assert.equal(f.total.tapRate,0.5);assert.equal(f.total.playedPer1000,250);
 deq([f.home.views,f.home.taps,f.home.reached,f.home.played],[0,0,0,0],'the home page funnel counted nothing here');assert.equal(rep.marketing.views,0);
 assert.equal(rep.search.total,2,'search arrivals are still counted as before');
});

await ok('the report: home row from mk:, not in the total; empty without counts',()=>{
 const f=SR.buildSiteFunnel({counts:{'mk:view':200,'mk:play':40,'mk:reached':30,'mk:played':20,'sf:v_books':1000,'sf:p_books':50,'sf:r_books':40,'sf:rs_books':10,'sf:d_books':25,'sf:v_fish':10,'sf:v_nope':99}});
 deq([f.home.views,f.home.taps,f.home.reached,f.home.reachedSearch,f.home.played,f.home.playedPer1000],[200,40,30,null,20,100]);
 deq([f.total.views,f.total.taps,f.total.reached,f.total.reachedSearch,f.total.played],[1010,50,40,10,25]);deq(f.rows.slice(0,2).map(r=>r.id),['books','fish']);
 assert.equal(f.rows[0].playedPer1000,25);assert.equal(f.rows[0].tapRate,0.05);
 for(const empty of [{counts:{}},{counts:{'mk:view':5}},{}]){const e=SR.buildSiteFunnel(empty);assert.equal(e.hasData,false);assert.equal(e.total.tapRate,null);}
});

await ok('wiring: VisitTracker counts only while the tracker runs; the home page funnel code is unchanged; no new storage beyond the three per-tab marks',()=>{
 const vt=read('components/VisitTracker.tsx');
 assert(/if\(!pathname\|\|!tracker\.current\)return;\s*return watchSiteView\(pathname,/.test(vt),'a view is counted only with the tracker on');
 assert(/pathname==='\/play'&&tracker\.current\)countSitePlayArrival\(/.test(vt)&&/pathname==='\/play'&&view==='game'&&tracker\.current\)countSitePlayStart\(/.test(vt));
 assert(/countPlayArrival\(\(\(\)=>\{try\{return window\.sessionStorage;\}catch\{return null;\}\}\)\(\),Date\.now\(\),count\)/.test(vt),'mk:reached is counted as before');
 const src=read('lib/analytics/siteFunnelIds.ts');
 assert(!/localStorage|document\.cookie|fetch\(|sendBeacon|setInterval|setTimeout|requestAnimationFrame|location\.href|referrer/.test(src),'no cookie, localStorage, request, timer or URL read');
 deq([...new Set(src.match(/'fi-[a-z-]+'/g))].sort(),["'fi-sf-play'","'fi-sf-played'","'fi-sf-reached'"]);
 assert(/passive:true/.test(src));
 assert(!/sf:/.test(read('components/learn/PageStats.tsx'))&&!/siteFunnel/.test(read('lib/analytics/marketingIds.ts')),'the home page funnel is untouched');
 assert(/report\.siteFunnel=buildSiteFunnel\(merged\)/.test(read('lib/analytics/report.ts')));
 for(const f of ['app/admin/MarketingSection.tsx','app/admin/SeoSection.tsx'])assert(/<SiteFunnelSection report=\{report\}/.test(read(f)),f);
 assert(/sf:<step>_<section>/.test(read('lib/analytics/countIds.ts'))&&/sf:/.test(read('docs/seo/DISCOVERY.md')),'documented');
});

await ok('the admin table renders every section, the total and the home row with plain labels',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 const Sec=load('app/admin/SiteFunnelSection.tsx');
 const siteFunnel=SR.buildSiteFunnel({counts:{'mk:view':200,'mk:play':40,'mk:reached':30,'mk:played':20,'sf:v_books':1000,'sf:p_books':50,'sf:r_books':40,'sf:rs_books':10,'sf:d_books':25,'sf:v_learn_rules':1234,'sf:p_learn_rules':100}});
 const html=renderToStaticMarkup(React.createElement(Sec.default,{report:{siteFunnel},rangeText:'Nov 20',dayLabel:d=>d}));
 assert(html.includes('Site pages to Play')&&html.includes('data-site-funnel'));
 for(const c of ['Section','Views','Play taps','Tap rate','Reached /play','From search','Played','Played per 1,000 views'])assert(html.includes('>'+c+'</th>'),c);
 assert.equal((html.match(/data-sf-row=/g)||[]).length,SF.SF_SECTIONS.length+2,'every section + the total + the home page');
 assert(html.indexOf('data-sf-row="learn_rules"')<html.indexOf('data-sf-row="books"')&&html.indexOf('data-sf-row="books"')<html.indexOf('data-sf-row="total"')&&html.indexOf('data-sf-row="total"')<html.indexOf('data-sf-row="home"'));
 assert(/data-sf-row="learn_rules".*?<td data-k="views">1,234<\/td><td data-k="taps">100<\/td><td>8\.1%<\/td>/.test(html));
 assert(/data-sf-row="books".*?<td data-k="played">25<\/td><td>25<\/td>/.test(html));
 assert(/data-sf-row="library".*?<td data-k="views">0<\/td><td data-k="taps">0<\/td><td>—<\/td>/.test(html),'no views: a dash, not 0%');
 assert(/data-sf-row="home".*?<td data-k="reached-search">—<\/td>/.test(html));
 assert(!/sf:[a-z]+_|href=|\/marketing/.test(html),'no raw id, no link');
 const none=renderToStaticMarkup(React.createElement(Sec.default,{report:{},rangeText:'Nov 20',dayLabel:d=>d}));assert(none.includes('No view of a site page counted in this range yet'));
});

console.log(`admin-analytics-site-funnel: ${passed} checks passed`);
})().catch(e=>{console.error(e);process.exit(1);});
