#!/usr/bin/env node
// Admin analytics: live sessions and where players come from (Oct 15 2026; user: "on click 3 on now, opens slide out to show all
// that info", "how much time they have spent so far", "if they are a returning user with saved codes or not").
//  1. The tracker: the referrer HOST only, the ?from= / utm_source tag sanitised (the game's own return trips are not tags), the
//     two yes/no marks on a start; the server accepts them on a start only; ?from=flyer shows the title screen.
//  2. The pure shapes and labels (lib/analytics/live.ts) and the server cache (lib/analytics/liveAdmin.ts).
//  3. The SQL (supabase/migrations/20261018_analytics_live.sql) on a throwaway Postgres: every migration replayed, sessions with
//     geo / referrer / tags / marks and beats of different ages, the 2 / 5 / 15 min windows, sid ≠ raw id, time, counts, totals,
//     the sources summary's suppression, grants and the self-check row (twice).
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const {createLoader}=require('./summit-harness.cjs');
const load=createLoader({regions:{regionName:(c,r)=>({'US-CA':'California','US-TX':'Texas'})[c+'-'+r]||r}});
const read=f=>fs.readFileSync(f,'utf8');
const MIGRATION='supabase/migrations/20261018_analytics_live.sql';
let passed=0;const ok=async(name,fn)=>{try{const r=await fn();if(r!=='skip')passed++;}catch(e){console.error('FAIL',name);throw e;}};

(async()=>{
const T=load('lib/analytics/tracker.ts'),C=load('lib/analytics/core.ts'),I=load('lib/analytics/ingest.ts'),S=load('lib/analytics/store.ts'),
 F=load('lib/analytics/deviceMarks.ts'),L=load('lib/analytics/live.ts'),LA=load('lib/analytics/liveAdmin.ts');

await ok('tracker: referrer host and campaign tag sanitiser',()=>{
 assert.equal(T.referrerHost('https://www.instagram.com/p/abc?igsh=secret','futbolisland.app'),'www.instagram.com','host only: no path, no query');
 assert.equal(T.referrerHost('https://futbolisland.app/arcade','futbolisland.app'),null,'our own site is not a referrer');
 assert.equal(T.referrerHost('android-app://com.google/x','futbolisland.app'),null,'http(s) only');
 assert.equal(T.referrerHost('',''),null);assert.equal(T.referrerHost('not a url','x'),null);
 assert.equal(T.campaignTag('?from=flyer'),'flyer');
 assert.equal(T.campaignTag('?from=Flyer-2026'),'flyer-2026','lower case, dashes kept');
 for(const r of ['arcade','konbini','museum','shop'])assert.equal(T.campaignTag('?from='+r),null,'a return trip is not a tag: '+r);
 assert.equal(T.campaignTag('?from=museum&utm_source=newsletter'),'newsletter','a return trip falls through to utm_source');
 assert.equal(T.campaignTag('?from=a_b'),null,'letters, digits and dashes only');
 assert.equal(T.campaignTag('?from=<script>'),null);
 assert.equal(T.campaignTag('?from='+'x'.repeat(25)),null,'at most 24');
 assert.equal(T.campaignTag('?from='+'x'.repeat(24)),'x'.repeat(24));
 assert.equal(T.campaignTag(''),null);assert.equal(T.campaignTag('?utm_source=ig'),'ig');
});

await ok('tracker: the start carries the tag as the source and the two marks; nothing else',()=>{
 const sent=[],store={},w={location:{hostname:'futbolisland.app',pathname:'/',search:'?from=flyer'},addEventListener(){},removeEventListener(){},setTimeout:()=>1,clearTimeout(){}};
 const d={visibilityState:'visible',referrer:'https://l.instagram.com/?u=https%3A%2F%2Ffutbolisland.app',addEventListener(){},removeEventListener(){}};
 const n={sendBeacon:(u,b)=>{sent.push(JSON.parse(b));return true;},maxTouchPoints:0};
 const t=T.startTracker({window:w,document:d,navigator:n,storage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v;}},now:()=>0,random:k=>new Uint8Array(k).map((_,i)=>i*13),
  marks:()=>({returning:true,hasCode:false})});
 t.pageview('/');
 const s=sent.find(b=>b.t==='start');assert(s,'a start was sent');
 assert.equal(s.r,'l.instagram.com');assert.deepEqual(s.u,{source:'flyer'});assert.equal(s.rt,1);assert.equal(s.hc,0);
 assert(!JSON.stringify(s).includes('fi2-'),'no storage keys or values leave the tab');
 assert(C.validateEvent(JSON.stringify(s)).ok,'the server accepts it');
 assert.equal(C.validateEvent(JSON.stringify({v:1,t:'beat',s:s.s,p:'/',e:1000,rt:1})).ok,false,'marks only on a start');
 assert.equal(C.validateEvent(JSON.stringify({...s,hc:2})).ok,false,'marks are 0 or 1');
 const vt=read('components/VisitTracker.tsx');assert.match(vt,/marks:\(\)=>\{try\{return readDeviceMarks\(window\.localStorage\);\}catch\{return null;\}\}/);
});

await ok('readDeviceMarks: yes/no from the game\'s own keys (which still match the code that writes them)',()=>{
 const st=o=>({getItem:k=>o[k]??null});
 assert.deepEqual(F.readDeviceMarks(st({})),{returning:false,hasCode:false},'a first visit');
 assert.deepEqual(F.readDeviceMarks(st({'fi2-last-visit-day-v1':'2026-10-14'})),{returning:true,hasCode:false});
 assert.deepEqual(F.readDeviceMarks(st({'futbol-island-quiz-progress-v1':'["7v7:a:0"]'})),{returning:true,hasCode:false});
 assert.deepEqual(F.readDeviceMarks(st({'fi2-save-code-v1':'happy-blue-tiger-427'})),{returning:true,hasCode:true});
 assert.deepEqual(F.readDeviceMarks(st({'fi2-save-code-v1':'not a code'})),{returning:false,hasCode:false});
 assert.equal(F.readDeviceMarks(null),null);
 assert.equal(F.readDeviceMarks({getItem:()=>{throw new Error('blocked');}}).returning,false,'blocked storage: no');
 assert.match(read('lib/town/welcomeBack.ts'),new RegExp(`LAST_VISIT_KEY='${F.MARK_KEYS.lastVisit}'`));
 assert.match(read('lib/town/welcomeBack.ts'),new RegExp(`quest:'${F.MARK_KEYS.quest}',quiz:'${F.MARK_KEYS.quiz}'`));
 assert.match(read('lib/saves/snapshot.ts'),new RegExp(`SAVE_CODE_KEY='${F.MARK_KEYS.code}'`));
});

await ok('ingest: the marks reach the store on a start (memory store), unknown stays null',async()=>{
 const mem=S.createMemoryStore(),lim=I.createLimiter({capacity:1e6}),now=new Date();
 const h=(o={})=>({get:k=>({'user-agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile/15E148','host':'futbolisland.app','x-vercel-ip-country':'US','x-vercel-ip-country-region':'CA','x-vercel-ip-city':'San%20Diego',...o})[k]??null});
 const go=(body,hd)=>I.handleIngest({body:JSON.stringify(body),headers:hd||h(),store:mem,limiter:lim,now,vercelEnv:'production'});
 assert.equal((await go({v:1,t:'start',s:'liveMemA000000000001',p:'/',r:'instagram.com',u:{source:'flyer'},rt:1,hc:1})).reason,'ok');
 assert.equal((await go({v:1,t:'start',s:'liveMemB000000000001',p:'/'},h({'x-vercel-ip-country':null,'x-vercel-ip-country-region':null}))).reason,'ok');
 const a=mem.data.starts.liveMemA000000000001,b=mem.data.starts.liveMemB000000000001;
 assert.equal(a.returning,true);assert.equal(a.hasCode,true);assert.equal(a.country,'US');assert.equal(a.region,'CA');assert.equal(a.referrerHost,'instagram.com');assert.equal(a.utmSource,'flyer');assert.equal(a.source,'campaign');
 assert(!JSON.stringify(a).includes('Diego'),'never the city');
 assert.equal(b.returning,null);assert.equal(b.hasCode,null);assert.equal(b.country,null,'local dev without the headers: null');
 assert.match(read('lib/analytics/store.ts'),/is_returning:ev\.returning\?\?null,has_code:ev\.hasCode\?\?null/,'the Supabase store sends them');
});

await ok('play mode (Nov 13 2026): the beat carries one letter, the server keeps only s / w / p, stored as pm:<letter>',async()=>{
 const K=load('lib/analytics/countIds.ts');
 // The tracker: the island's reader rides the existing beat (no extra request); a bad value or a throwing reader sends nothing.
 const sent=[],w={location:{hostname:'futbolisland.app',pathname:'/play',search:''},addEventListener(){},removeEventListener(){},setTimeout:()=>1,clearTimeout(){}};
 const hooks={},d={visibilityState:'visible',referrer:'',addEventListener:(e,f)=>{hooks[e]=f;},removeEventListener(){}};
 let clock=0;const t=T.startTracker({window:w,document:d,navigator:{sendBeacon:(u,b)=>{sent.push(JSON.parse(b));return true;},maxTouchPoints:0},storage:null,now:()=>clock,random:k=>new Uint8Array(k).map((_,i)=>i*7)});
 t.pageview('/play');
 let mode='w';const off=T.setPlayModeSource(()=>mode);
 const beat=()=>{clock+=5000;d.visibilityState='hidden';hooks.visibilitychange?.();d.visibilityState='visible';hooks.visibilitychange?.();return sent.filter(b=>b.t==='beat').pop();};
 const before=sent.length;let b=beat();assert(b,'a beat was sent');assert.equal(b.m,'w','the mode rides the beat');assert.equal(sent.length-before,1,'no extra request');
 assert(C.validateEvent(JSON.stringify(b)).ok,'the server accepts it');
 mode='p';assert.equal(beat().m,'p');mode='s';assert.equal(beat().m,'s');
 mode='solo';assert(!('m' in beat()),'off the list: not sent');
 T.setPlayModeSource(()=>{throw new Error('x');});assert.equal(T.playModeNow(),null,'a reader that throws: nothing');
 off();T.setPlayModeSource(()=>'w')();assert.equal(T.playModeNow(),null,'cleanup removes the reader');
 assert(!sent.some(x=>x.t==='start'&&'m' in x),'never on a start');
 // The server allowlist: only s / w / p on a beat; anything else is dropped unread and the beat still counts.
 const base={v:1,t:'beat',s:'liveModeA00000000001',p:'/play',e:4000};
 for(const m of ['s','w','p'])assert.equal(C.validateEvent(JSON.stringify({...base,m})).event.m,m);
 for(const m of ['x','solo','',1,null,{w:1},['w']]){const v=C.validateEvent(JSON.stringify({...base,m}));assert(v.ok,'still a beat: '+JSON.stringify(m));assert(!('m' in v.event),'dropped: '+JSON.stringify(m));}
 const st=C.validateEvent(JSON.stringify({v:1,t:'start',s:'liveModeA00000000001',p:'/',m:'w'}));assert(st.ok&&!('m' in st.event),'not on a start');
 assert.deepEqual([...K.PLAY_MODES],['s','w','p']);assert.equal(K.isCountId('pm:w'),false,'ingest-only: a tab cannot send pm: in k');
 assert.deepEqual(C.clampCounts({'pm:w':1,'fi:land':1}),{'fi:land':1});
 assert.equal(K.playModeOf({'fi:land':2,'pm:p':1}),'p');assert.equal(K.playModeOf({}),null);assert.equal(K.playModeOf(null),null);
 // The ingest stores the letter as the counter pm:<letter> = 1 in the beat's existing counts (no migration); a forged pm: in k is gone.
 const mem=S.createMemoryStore(),lim=I.createLimiter({capacity:1e6}),now=new Date();
 const h={get:k=>({'user-agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile/15E148','host':'futbolisland.app'})[k]??null};
 const go=body=>I.handleIngest({body:JSON.stringify(body),headers:h,store:mem,limiter:lim,now,vercelEnv:'production'});
 assert.equal((await go({v:1,t:'start',s:'liveModeA00000000001',p:'/play'})).reason,'ok');
 assert.equal((await go({...base,m:'w',k:{'pm:s':3}})).reason,'ok');
 assert.equal((await go({...base,m:'bogus'})).reason,'ok');
 assert.equal((await go({v:1,t:'beat',s:'liveModeA00000000001',p:'/play',m:'p'})).reason,'empty-beat','the mode alone is not worth a write');
 const bs=mem.data.beats.filter(x=>x.sessionId==='liveModeA00000000001');
 assert.deepEqual(bs[0].counts,{'pm:w':1});assert.deepEqual(bs[1].counts,{},'an off-list letter stores nothing (and an island beat carries no page key)');
 // Town registers the reader: a party is 'p', the shared island connected is 'w', anything else 's'. Nothing about who.
 const town=read('components/Town.tsx');
 // Nov 13 2026: the CHOSEN mode from the first beat (public chosen but not yet connected, or held by the tutorial, is 'w'; a party
 // code waiting in the URL is 'p'); not only once the socket is connected.
 assert(town.includes(`if(partyLive())return 'p';if(!multiplayerEnabled())return 's';const pr=publicPresence.get();`)&&town.includes(`return pr.party||hasPendingParty()?'p':publicWorldEnabled()&&(pr.mode==='public'||pr.reason==='tutorial')?'w':'s';}),[]);`),'Town.tsx reads the chosen mode');
 assert(!/setPlayModeSource\([^\n]*\.connected/.test(town),'not only once connected');
});

await ok('first ping (Nov 13 2026): a new session and the island registering its mode send one early beat with the page and the mode',async()=>{
 const sent=[],timers=[],w={location:{hostname:'futbolisland.app',pathname:'/play',search:''},addEventListener(){},removeEventListener(){},setTimeout:(f,ms)=>{timers.push({f,ms});return timers.length;},clearTimeout(id){if(timers[id-1])timers[id-1].f=null;}};
 const d={visibilityState:'visible',referrer:'',addEventListener(){},removeEventListener(){}};
 let clock=0;const t=T.startTracker({window:w,document:d,navigator:{sendBeacon:(u,b)=>{sent.push(JSON.parse(b));return true;},maxTouchPoints:0},storage:null,now:()=>clock,random:k=>new Uint8Array(k).map((_,i)=>i*7)});
 const fire=ms=>{for(const x of timers)if(x.f&&x.ms===ms){const f=x.f;x.f=null;f();}};
 t.pageview('/play');assert.equal(sent.length,1,'the start');assert.equal(T.EARLY_BEAT_MS,3000);assert(!timers.some(x=>x.f&&x.ms===T.EARLY_BEAT_MS),'an island start waits for the island to say its mode');
 const off=T.setPlayModeSource(()=>'w');assert.equal(timers.filter(x=>x.f&&x.ms===T.EARLY_BEAT_MS).length,1,'the island registering asks for one');const off1=T.setPlayModeSource(()=>'w');assert.equal(timers.filter(x=>x.f&&x.ms===T.EARLY_BEAT_MS).length,1,'at most one pending');
 clock=3000;fire(T.EARLY_BEAT_MS);const b=sent.filter(x=>x.t==='beat');assert.equal(b.length,1,'one early beat');assert.equal(b[0].m,'w','the mode from the first ping');assert.equal(b[0].p,'/play');
 assert(C.validateEvent(JSON.stringify(b[0])).ok,'the server accepts it');assert(!('m' in sent[0]),'still never on the start');
 // The island mounting later in a running session (home, then the island) asks for one too.
 off();off1();clock=60_000;const off2=T.setPlayModeSource(()=>'s');clock=63_000;fire(T.EARLY_BEAT_MS);assert.equal(sent.filter(x=>x.t==='beat').pop().m,'s');off2();
 t.stop();
 // A new session off the island (a Learn guide) sends its early beat too, so the card says where from the first ping.
 {const sent2=[],tm=[],w2={...w,location:{hostname:'futbolisland.app',pathname:'/learn/soccer-drills',search:''},setTimeout:(f,ms)=>{tm.push({f,ms});return tm.length;},clearTimeout(){}};
  let c2=0;const t2=T.startTracker({window:w2,document:d,navigator:{sendBeacon:(u,b)=>{sent2.push(JSON.parse(b));return true;},maxTouchPoints:0},storage:null,now:()=>c2,random:k=>new Uint8Array(k).map((_,i)=>i*7)});
  t2.pageview('/learn/soccer-drills');c2=3000;for(const x of tm)if(x.ms===T.EARLY_BEAT_MS)x.f();const b2=sent2.filter(x=>x.t==='beat');assert.equal(b2.length,1);assert.equal(b2[0].p,'/learn/soccer-drills');assert(!('m' in b2[0]),'no mode off the island');t2.stop();}
});

await ok('page keys (Nov 13 2026): a fixed allowlist of route families, unknown is Other page, never a URL or query; ingest-made pg:<key>',async()=>{
 const PK=load('lib/analytics/pageKeys.ts'),K=load('lib/analytics/countIds.ts');
 const cases={'/':'home','/play':'play','/play?from=arcade&party=ABCD':'play','/island-return':'play','/arcade':'arcade','/marketing':'marketing','/marketing/overview':'marketing',
  '/learn/9v9-soccer-formations':'learn_9v9_soccer_formations','/learn/soccer-drills/rondo-4v1':'learn_soccer_drills','/learn/made-up':'learn','/LEARN/Soccer-Rules#x':'learn_soccer_rules',
  '/privacy':'privacy','/safe-football-game-for-kids':'parents','/cards/12':'cards','/museum':'museum','/admin':'other','/secret/x?code=ABC':'other','':'other','x':'other'};
 for(const [p,k] of Object.entries(cases))assert.equal(PK.pageKeyOf(p),k,p);assert.equal(PK.pageKeyOf(null),'other');
 assert.equal(PK.pageLabel('learn_9v9_soccer_formations'),'Learn: 9v9 formations');assert.equal(PK.pageLabel('marketing'),'Marketing page');assert.equal(PK.pageLabel('home'),'Home');
 assert.equal(PK.pageLabel('nope'),'Other page');assert.equal(PK.pageLabel(null),'Other page');assert.equal(PK.pageLabel('parents'),'Parents\u2019 guide');
 for(const k of PK.PAGE_KEYS){assert(K.COUNT_KEY_RE.test(PK.pageCountId(k)),k);assert.equal(K.isCountId(PK.pageCountId(k)),false,'ingest-only: a tab cannot send pg: in k');assert(PK.PAGE_LABEL[k],k);}
 assert.deepEqual(C.clampCounts({'pg:home':1,'fi:land':1}),{'fi:land':1},'a forged pg: in k is dropped');
 assert.equal(PK.pageKeyIn({'fi:land':1,'pg:arcade':1}),'arcade');assert.equal(PK.pageKeyIn({'pg:zzz':1}),'other');assert.equal(PK.pageKeyIn({}),null);assert.equal(PK.pageKeyIn(null),null);
 assert.equal(PK.entryPageKey('/other'),'other');assert.equal(PK.entryPageKey('/play'),'play');assert.equal(PK.entryPageKey(null),null);
 // Every public route of the app has its own key (a new route shows as Other page until it is added here).
 const routes=[];const walk=(dir,url)=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(!e.isDirectory())continue;const seg=e.name;if(/^(api|admin)$|-lab$|^\[/.test(seg))continue;
  const u=/^\(.*\)$/.test(seg)?url:url+'/'+seg;if(fs.existsSync(path.join(dir,seg,'page.tsx')))routes.push(u||'/');walk(path.join(dir,seg),u);}};walk('app','');
 assert(routes.length>20);for(const r of routes)assert.notEqual(PK.pageKeyOf(r),'other','route has a key: '+r);
 // The ingest stores it on every beat (no migration: the SQL accepts any id of COUNT_KEY_RE's shape); never on a start.
 const mem=S.createMemoryStore(),lim=I.createLimiter({capacity:1e6}),now=new Date();
 const h={get:k=>({'user-agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile/15E148','host':'futbolisland.app'})[k]??null};
 const go=body=>I.handleIngest({body:JSON.stringify(body),headers:h,store:mem,limiter:lim,now,vercelEnv:'production'});
 assert.equal((await go({v:1,t:'start',s:'livePageA00000000001',p:'/learn/9v9-soccer-formations'})).reason,'ok');
 assert.equal((await go({v:1,t:'beat',s:'livePageA00000000001',p:'/learn/9v9-soccer-formations',e:4000})).reason,'ok');
 assert.equal((await go({v:1,t:'beat',s:'livePageA00000000001',p:'/somewhere/new',e:4000})).reason,'ok');
 assert.equal((await go({v:1,t:'beat',s:'livePageA00000000001',p:'/play'})).reason,'empty-beat','the page alone is not worth a write');
 const bs=mem.data.beats.filter(x=>x.sessionId==='livePageA00000000001');
 assert.deepEqual(bs.map(b=>b.counts),[{'pg:learn_9v9_soccer_formations':1},{'pg:other':1}]);
 const sql=read('supabase/migrations/20261119_analytics_stadium.sql'),re=new RegExp(/where key ~ '(\^\[a-z\]\{1,2\}:[^']+)'/.exec(sql)[1]);
 for(const k of PK.PAGE_KEYS)assert(re.test(PK.pageCountId(k)),k+' passes the SQL counts regex');
 const pol=read('components/privacy/PrivacyPolicy.tsx');assert(pol.includes('which page the visitor is on, both from a fixed list of pages and page groups')&&pol.includes('never a full web address'),'the privacy page says so');
});

await ok('rootView: ?from=flyer shows the title screen; the return trips still open the game',()=>{
 const R=load('lib/rootView.ts');
 assert.equal(R.isInGame('?from=flyer'),false);assert.equal(R.isInGame('?from=arcade'),true);assert.equal(R.isInGame('?panel=about'),true);
 assert.deepEqual([...R.GAME_FROM].filter(x=>x!=='e2e'),[...T.RETURN_FROM],'one list of return trips (plus the Playwright suite\'s ?from=e2e, which opens the game but is no return trip)');assert(R.isInGame('?from=e2e'),'?from=e2e opens the game');
 assert.match(read('next.config.mjs'),new RegExp(`value: '\\^\\(${T.RETURN_FROM.join('\\|')}\\)\\$'`),'= the next.config.mjs rewrite (unknown values fall through to the start page)');
});

await ok('live.ts: shapes, labels, time',()=>{
 assert.equal(L.flagOf('US'),'🇺🇸');assert.equal(L.flagOf('gb'),'');assert.equal(L.flagOf(null),'');
 assert.equal(L.fmtSpent(45),'45 s');assert.equal(L.fmtSpent(720),'12 min');assert.equal(L.fmtSpent(3900),'1 h 05');assert.equal(L.fmtSpent(11400),'3 h 10');
 assert.equal(L.fmtAgo(new Date(1000).toISOString(),5000),'just now');assert.equal(L.fmtAgo(new Date(0).toISOString(),180000),'3 min ago');
 assert.equal(L.sourceLabel('flyer'),'flyer QR');assert.equal(L.sourceLabel(null),'direct');assert.equal(L.sourceLabel('instagram.com'),'instagram.com');
 assert.equal(L.timeLine({activities:{walk:480,fishing:240,idle:900,ride:10},areas:{}}),'island 8 min · fishing 4 min','idle and tiny slices left out');
 const r=L.shapeLive({minutes:5,sessions:1,by_area:[{key:'fishing',n:1}],by_country:[{country:'US',n:1,regions:[{region:'CA',n:1}]}],by_source:[{key:'flyer',n:1}],
  rows:[{sid:'ab12cd',started_at:'2026-10-15T10:00:00Z',last_seen:'2026-10-15T10:05:00Z',seconds_active:240,device:'phone',country:'US',region:'CA',returning:true,has_code:null,counts:{fish:2,bogus:9},areas:{island:'240'}}]},(c,x)=>c+'/'+x);
 assert.equal(r.rows[0].regionName,'US/CA');assert.equal(r.byCountry[0].regions[0].name,'US/CA');assert.equal(r.rows[0].counts.fish,2);assert(!('bogus' in r.rows[0].counts));
 assert.equal(r.rows[0].returning,true);assert.equal(r.rows[0].hasCode,null);assert.equal(r.rows[0].areas.island,240);
 assert.equal(L.shapeLive({rows:[{sid:'<p>zz9f'}]}).rows[0].sid,'9f','sid: hex only');
 assert.equal(r.rows[0].mode,null,'no mode: unknown');assert.equal(L.shapeLive({rows:[{sid:'ab',mode:'p'}]}).rows[0].mode,'p');assert.equal(L.shapeLive({rows:[{sid:'ab',mode:'party'}]}).rows[0].mode,null);
 assert.deepEqual(L.modeTally([{mode:'s'},{mode:'w'},{mode:'p'},{mode:'w'},{mode:null}]),[{key:'w',n:2},{key:'s',n:1},{key:'p',n:1},{key:'unknown',n:1}]);
 assert.deepEqual(L.modeTally([{mode:'s'}]),[{key:'s',n:1}],'modes with nobody left out');
 // Nov 13 2026: off the island is not "unknown"; a just-arrived session off the island is "Not on island yet".
 assert.equal(L.modeKey({mode:null,area:'other',page:'home'}),'off');assert.equal(L.modeKey({mode:'w',area:'arcade',page:'arcade'}),'off','an old island letter on a later arcade beat');
 assert.equal(L.modeKey({mode:null,area:null,page:'learn'}),'yet');assert.equal(L.modeKey({mode:null,area:null,page:'play'}),'unknown');assert.equal(L.modeKey({mode:null,area:null,page:null}),'unknown');
 assert.equal(L.modeKey({mode:null,area:'island',page:'play'}),'unknown','an island session with no letter (an old client)');assert.equal(L.modeKey({mode:'p',area:'paths',page:'play'}),'p','the paths story is on the island');
 assert.deepEqual(L.modeTally([{mode:'w',area:'island'},{mode:null,area:'other',page:'home'},{mode:null,area:null,page:'marketing'},{mode:null,area:'island'}]),[{key:'w',n:1},{key:'unknown',n:1}],'off-island not counted as unknown');
 assert.equal(L.modeLabel('off'),'Off island');assert.equal(L.modeLabel('yet'),'Not on island yet');
 assert.equal(L.placeLine({mode:null,area:'other',page:'marketing',activity:null,spot:'other'}),'Marketing page');assert.equal(L.placeLine({mode:'w',area:'island',page:'play',activity:'fishing',spot:'fishing'}),'fishing');
 assert.equal(L.placeLine({mode:null,area:'other',page:null,activity:null,spot:'other'}),'Other page','no page known: Other page');
 assert.equal(L.shapeLive({rows:[{sid:'ab',entry_path:'/arcade'}]}).rows[0].page,'arcade','the start entry page until a beat says');assert.equal(L.shapeLive({rows:[{sid:'ab'}]}).rows[0].page,null);
 {const rows=[{mode:null,area:'other',page:'home',spot:'other'},{mode:null,area:'other',page:'marketing',spot:'other'},{mode:null,area:'other',page:'home',spot:'other'},{mode:null,area:null,page:'learn_soccer_drills',spot:null},{mode:'w',area:'island',page:'play',spot:'island'}];
  const wt=L.whereTally({byArea:[{key:'other',n:4},{key:'island',n:1},{key:'starting',n:1}],rows});
  assert.deepEqual(wt,[{key:'pg:home',n:2},{key:'island',n:1},{key:'other',n:1},{key:'pg:learn_soccer_drills',n:1},{key:'pg:marketing',n:1}],'other page split by page; the uncovered rest stays');
  assert.equal(L.whereLabel('pg:home'),'Home');assert.equal(L.whereLabel('pg:learn_soccer_drills'),'Learn: Drills');assert.equal(L.whereLabel('island'),'island');}
 assert.equal(L.modeLabel('w'),'Public');assert.equal(L.modeLabel('s'),'Just me');assert.equal(L.modeLabel('p'),'Party');assert.equal(L.modeLabel('unknown'),'Mode unknown');assert.equal(L.modeLabel(null),'Mode unknown');
 const s=L.shapeSources({sessions:6,countries:[{country:'US',n:3,regions:[{region:'CA',n:null}]}],returning:{new:null,returning:4,unknown:0},code:{with:3}});
 assert.equal(s.countries[0].regions[0].n,null);assert.equal(s.returning.returning,4);assert.equal(s.code.without,null);
});

await ok('liveAdmin: not configured, needs migration, 5 s cache, windows',async()=>{
 const env={u:process.env.NEXT_PUBLIC_SUPABASE_URL,k:process.env.SUPABASE_SERVICE_ROLE_KEY};
 delete process.env.NEXT_PUBLIC_SUPABASE_URL;delete process.env.SUPABASE_SERVICE_ROLE_KEY;
 assert.equal((await LA.loadLive(5)).status,'not-configured');
 process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='service';
 let calls=0;const f404=async()=>{calls++;return {ok:false,status:404,text:async()=>''};};
 assert.equal((await LA.loadLive(2,{fetchImpl:f404,now:0})).status,'needs-migration');
 let beatReads=0;const fok=async(url,init)=>{
  if(url.includes('/rest/v1/analytics_beats?')){beatReads++;assert.equal(init.method,'GET');assert.match(url,/select=session_id,counts&ts=gte\.[^&]+&order=ts\.desc,id\.desc&limit=2000$/);
   return {ok:true,status:200,text:async()=>JSON.stringify([{session_id:'liveRowX000000000001',counts:{'fi:land':1}},{session_id:'liveRowX000000000001',counts:{'pm:p':1,'pg:learn_soccer_drills':1}},{session_id:'liveRowX000000000001',counts:{'pm:s':1,'pg:play':1}}])};}
  calls++;assert.match(url,/\/rest\/v1\/rpc\/analytics_live_sessions$/);assert.equal(JSON.parse(init.body).p_minutes,15);
  return {ok:true,status:200,text:async()=>JSON.stringify({minutes:15,sessions:2,rows:[{sid:'abcdef',country:'US',region:'TX'},{sid:LA.liveSid('liveRowX000000000001')}]})};};
 calls=0;const a=await LA.loadLive(15,{fetchImpl:fok,now:1000}),b=await LA.loadLive(15,{fetchImpl:fok,now:5999});
 assert.equal(calls,1,'cached for 5 s');assert.equal(a,b);assert.equal(a.rows[0].regionName,'Texas');
 assert.equal(beatReads,1,'one beat read per cache miss');assert.equal(a.rows[0].mode,null,'no beat with a mode: Mode unknown');
 assert.equal(a.rows[1].mode,'p','the newest beat that carries a mode (an older one said s)');
 assert.equal(a.rows[1].page,'learn_soccer_drills','the newest beat with a page key');assert.equal(a.rows[0].page,null);
 assert.equal(LA.liveSid('liveSessionA00000001'),crypto.createHash('sha256').update('liveSessionA00000001:futbol-island-live-v1').digest('hex').slice(0,6),'the SQL sid');
 assert(!JSON.stringify(a).includes('liveRowX'),'never the raw session id');
 const fbad=async url=>url.includes('analytics_beats')?{ok:false,status:500,text:async()=>''}:{ok:true,status:200,text:async()=>JSON.stringify({rows:[{sid:'abcdef'}]})};
 assert.equal((await LA.loadLive(2,{fetchImpl:fbad,now:50_000})).rows[0].mode,null,'a failed beat read: rows still shown, Mode unknown');
 const fthrow=async url=>{if(url.includes('analytics_beats'))throw new Error('net');return {ok:true,status:200,text:async()=>JSON.stringify({rows:[{sid:'abcdef'}]})};};
 assert.equal((await LA.loadLive(5,{fetchImpl:fthrow,now:60_000})).status,'ok','a beat read that throws never breaks the panel');
 await LA.loadLive(15,{fetchImpl:fok,now:6001});assert.equal(calls,2,'fresh after 5 s');
 assert.equal(LA.liveMinutes('7'),5);assert.equal(LA.liveMinutes('2'),2);
 const route=read('app/api/admin/live/route.ts');assert.match(route,/if\(!verifySession\(cookies\(\)\.get\(ADMIN_COOKIE\)\?\.value,Date\.now\(\)\)\)return Response\.json\(\{error:'unauthorized'\},\{status:401/);
 if(env.u)process.env.NEXT_PUBLIC_SUPABASE_URL=env.u;else delete process.env.NEXT_PUBLIC_SUPABASE_URL;if(env.k)process.env.SUPABASE_SERVICE_ROLE_KEY=env.k;else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

await ok('the panel and the day section are wired',()=>{
 const dash=read('app/admin/AnalyticsDashboard.tsx'),panel=read('app/admin/LivePanel.tsx');
 assert.match(dash,/<button type="button" ref=\{liveTile\}[^>]*data-live-tile[^>]*onClick=\{\(\)=>openPanel\(\{mode:'live'\}\)\}/,'the tile is a button');
 assert(dash.includes('<LivePanel view={panel} onClose={closeLive} countryName={countryName}/>')&&dash.includes('<SourcesSection report={report} countryName={countryName}/>'));
 assert.match(panel,/document\.visibilityState!=='visible'/,'polls only while visible');assert.match(panel,/POLL_MS=10_000/);
 assert.match(panel,/e\.key==='Escape'/);assert.match(panel,/<DoneButton ref=\{done\} onDone=\{onClose\}/);assert(panel.includes('Nobody right now.'));
 assert(panel.includes('<LiveModeStrip rows={data!.rows}/>'),'the MODE strip with the Where / Country / Source strips');
 assert(panel.indexOf('<LiveModeStrip')<panel.indexOf('<Strip label="Source" items={tallyItems(data!.bySource')&&panel.indexOf('<LiveModeStrip')>panel.indexOf('<Strip label="Where" items={whereTally(data!).map('),'at the top, before the cards');
 assert(panel.indexOf('<Strip label="Where" items={whereTally(data!).map(')>0,'the WHERE strip splits "other page" into pages');
 // Render: the badge next to New / Returning on live cards, the unknown fallback, none on day cards, and the strip's counts.
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),css=new Proxy({},{get:(_,k)=>typeof k==='string'?k:undefined});
 const P=createLoader({'LivePanel.module.css':css,'DoneButton.module.css':css,'Icon.module.css':css,'IslandTravelMap.module.css':css})('app/admin/LivePanel.tsx');
 const row=o=>L.shapeLive({rows:[{sid:'ab12cd',started_at:'2026-11-13T10:00:00Z',last_seen:'2026-11-13T10:05:00Z',returning:false,has_code:true,...o}]}).rows[0];
 const card=(o,clock='ago')=>renderToStaticMarkup(React.createElement(P.SessionCard,{r:row(o),now:Date.parse('2026-11-13T10:06:00Z'),countryName:c=>c,clock}));
 for(const [m,word] of [['w','Public'],['s','Just me'],['p','Party']]){const h=card({mode:m});
  assert(h.includes(`data-mode="${m}"`)&&h.includes(`>${word}</span>`),'badge '+word);assert(h.indexOf('>New</span>')<h.indexOf(`>${word}</span>`)&&h.indexOf('>Save code</span>')<h.indexOf(`>${word}</span>`),'next to New / Save code');}
 {const h=card({});assert(h.includes('data-mode="unknown"')&&h.includes('>Mode unknown</span>'),'older sessions: Mode unknown');}
 {const h=card({area:'island',entry_path:'/play'});assert(h.includes('>Mode unknown</span>'),'an island session from an old client (no letter): Mode unknown');}
 // Nov 13 2026: off the island says where instead (owner: "other page" + "Mode unknown" on a phone that just arrived).
 {const h=card({area:'other',entry_path:'/'});assert(h.includes('data-mode="off"')&&h.includes('>Off island</span>')&&!h.includes('Mode unknown'),'off island');assert(h.includes('<b>Home</b>'),'the page as the place line');}
 {const h=card({area:'arcade',activity:'arcade_live',entry_path:'/arcade'});assert(h.includes('>Off island</span>')&&h.includes('<b>Arcade: Kit Rush</b>'),'the arcade game');}
 {const h=card({entry_path:'/other'});assert(h.includes('data-mode="yet"')&&h.includes('>Not on island yet</span>'),'just arrived off the island');assert(h.includes('<b>Other page</b>'));}
 {const h=card({entry_path:'/play'});assert(h.includes('>Mode unknown</span>'),'just arrived on the island and no beat yet (the early beat comes 3 s later)');}
 {const r=row({area:'other'});r.page='learn_9v9_soccer_formations';const h=renderToStaticMarkup(React.createElement(P.SessionCard,{r,now:Date.parse('2026-11-13T10:06:00Z'),countryName:c=>c,clock:'ago'}));assert(h.includes('<b>Learn: 9v9 formations</b>'),'a Learn guide');}
 {const h=card({mode:'w'},'time');assert(!h.includes('data-mode='),'day / player cards: no mode badge');}
 const strip=renderToStaticMarkup(React.createElement(P.LiveModeStrip,{rows:[{mode:'w'},{mode:'w'},{mode:'s'},{mode:'p'},{mode:null},{mode:null,area:'other',page:'home'},{mode:null,area:null,page:'marketing'}]}));
 assert(/aria-label="Mode"/.test(strip)&&strip.includes('<b>Public 2</b>')&&strip.includes('<b>Just me 1</b>')&&strip.includes('<b>Party 1</b>')&&strip.includes('<b>Mode unknown 1</b>')&&!strip.includes('Off island'),'strip counts (off-island sessions are not unknown)');
 assert(strip.indexOf('Public 2')<strip.indexOf('Just me 1')&&strip.indexOf('Just me 1')<strip.indexOf('Party 1'),'Public · Just me · Party order');
 assert.match(panel,/\{clock==='ago'&&\(mk==='w'\|\|mk==='s'\|\|mk==='p'\?<span className=\{styles\.badge\} data-kind=\{'mode-'\+mk\}[^>]*>\{LIVE_MODE_LABEL\[mk\]\}<\/span>/,'the badge next to New / Returning, live cards only');
 assert.match(panel,/data-kind="mode-unknown"[^>]*>\{MODE_UNKNOWN\}<\/span>/,'the unknown fallback');
 {const pol=read('components/privacy/PrivacyPolicy.tsx');assert(pol.includes('how the island is being played at the moment')&&pol.includes('Never who with'),'the privacy page lists the mode');}
 for(const p of ['app/admin/page.tsx','app/api/admin/analytics/route.ts'])assert.match(read(p),/report\.sources=await loadSources\(report\.from,report\.to\);/,p);
 const pp=read('components/privacy/PrivacyPolicy.tsx');assert(pp.includes('a yes or no each, never the code')&&pp.includes('as an anonymous session'),'the privacy page says so');
});

// ---- The SQL ---------------------------------------------------------------------------------------------------------------
await ok('sql: live sessions and the sources summary on a throwaway Postgres',async()=>{
 const bin=n=>{for(const d of (process.env.PATH||'').split(':').concat(['/opt/homebrew/bin','/usr/local/bin','/usr/lib/postgresql/16/bin','/usr/lib/postgresql/15/bin','/usr/lib/postgresql/14/bin'])){const f=path.join(d,n);if(fs.existsSync(f))return f;}return null;};
 const initdb=bin('initdb'),pgctl=bin('pg_ctl'),psqlBin=bin('psql');
 if(process.env.SKIP_PG_TESTS||!initdb||!pgctl||!psqlBin){console.log('  SKIP sql: no local Postgres (initdb/pg_ctl/psql) found');return 'skip';}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fipgl-')),port=String(40000+(process.pid+311)%20000),quiet={stdio:['ignore','ignore','pipe']};
 try{
  cp.execFileSync(initdb,['-D',path.join(dir,'data'),'-U','postgres','--auth=trust','-E','UTF8','--locale=C'],quiet);
  cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-o',`-k ${dir} -p ${port} -c listen_addresses='' -c fsync=off -c TimeZone=UTC`,'-w','-l',path.join(dir,'log'),'start'],quiet);
  const args=['-h',dir,'-p',port,'-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-qAt'];
  const psql=(q,{role}={})=>cp.execFileSync(psqlBin,[...args,'-c',(role?`set role ${role}; `:'')+q],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const runFile=f=>cp.execFileSync(psqlBin,[...args,'-f',f],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split('\n').pop();
  psql('create role anon; create role authenticated; create role service_role bypassrls;');
  psql('alter default privileges in schema public grant all on tables to anon, authenticated, service_role; alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;');
  const files=fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort();
  assert(files.includes(path.basename(MIGRATION)));
  const results=files.map(f=>[f,runFile(path.join('supabase/migrations',f))]);
  assert.equal(results.find(([f])=>f===path.basename(MIGRATION))[1],'OK, live sessions installed','self-check row');
  assert.equal(runFile(MIGRATION),'OK, live sessions installed','safe to run twice');

  const day=psql(`select (now() at time zone 'utc')::date`),q=s=>`'${s.replace(/'/g,"''")}'`;
  const ingest=p=>psql(`select analytics_ingest(${q(JSON.stringify(p))}::jsonb)`,{role:'service_role'});
  const H1='a'.repeat(32),H2='b'.repeat(32);
  const start=(id,o)=>ingest({type:'start',session:id,path:'/',day,visitor_hash:H2,device:'phone',source:'direct',...o});
  const beat=(id,ago,o)=>{ingest({type:'beat',session:id,engaged_ms:60000,...o});psql(`update analytics_beats set ts=now()-interval '${ago} seconds' where id=(select max(id) from analytics_beats)`);};
  const startedAgo=(id,s)=>psql(`update analytics_sessions set started_at=now()-interval '${s} seconds' where id='${id}'`);
  // A: on the flyer, fishing now after the arcade; a new device without a code. F: the same device earlier today.
  start('liveSessionA00000001',{visitor_hash:H1,country:'US',region:'CA',source:'campaign',utm_source:'flyer',is_returning:false,has_code:false});startedAgo('liveSessionA00000001',360);
  beat('liveSessionA00000001',240,{engaged_ms:120000,area_ms:{arcade:120000},activity_ms:{arcade_runner:100000,idle:20000},counts:{'su:kick_play':1}});
  beat('liveSessionA00000001',60,{engaged_ms:60000,area_ms:{island:60000},activity_ms:{fishing:40000,walk:20000},counts:{'fi:land':2,'su:ball_find':1,'lo:press_7v7':1,'lf:press_7v7':1,'wa:swim_start':3,'su:easel_save':1,'su:fruit_mango:hand':2,'fi:miss':4}});
  start('liveSessionF00000001',{visitor_hash:H1,country:'US',region:'CA',source:'campaign',utm_source:'flyer'});startedAgo('liveSessionF00000001',7200);
  beat('liveSessionF00000001',6000,{engaged_ms:300000,area_ms:{island:300000}});
  // B: from Instagram, returning with a code, last beat 4 min ago. C: Canada, direct, last beat 12 min ago. D: 20 min ago (gone).
  start('liveSessionB00000001',{country:'US',region:'TX',source:'social',referrer_host:'instagram.com',is_returning:true,has_code:true});startedAgo('liveSessionB00000001',600);
  beat('liveSessionB00000001',240,{area_ms:{museum:60000},activity_ms:{museum_hall:60000}});
  start('liveSessionC00000001',{country:'CA',region:'ON'});startedAgo('liveSessionC00000001',840);beat('liveSessionC00000001',720,{area_ms:{island:60000},activity_ms:{swim:60000}});
  start('liveSessionD00000001',{country:'GB',region:'ENG'});startedAgo('liveSessionD00000001',1800);beat('liveSessionD00000001',1200,{area_ms:{island:60000}});
  // E: just arrived (no beat yet), no geo headers (local dev), an older tab without the marks; a non-boolean mark is ignored.
  start('liveSessionE00000001',{is_returning:'yes'});startedAgo('liveSessionE00000001',30);
  assert.equal(psql(`select coalesce(is_returning::text,'null') from analytics_sessions where id='liveSessionE00000001'`),'null','only a jsonb boolean is kept');

  const live=m=>JSON.parse(psql(`select analytics_live_sessions(${m})`,{role:'service_role'}));
  const ids=m=>live(m).rows.map(r=>r.sid);
  const sid=id=>crypto.createHash('sha256').update(id+':futbol-island-live-v1').digest('hex').slice(0,6);
  assert.deepEqual(ids(2).sort(),[sid('liveSessionA00000001'),sid('liveSessionE00000001')].sort(),'2 min: A and E');
  assert.deepEqual(ids(5).sort(),['A','B','E'].map(x=>sid(`liveSession${x}00000001`)).sort(),'5 min: A, B and E');
  assert.deepEqual(ids(15).sort(),['A','B','C','E'].map(x=>sid(`liveSession${x}00000001`)).sort(),'15 min: A, B, C and E');
  assert.equal(JSON.parse(psql(`select analytics_live_sessions()`,{role:'service_role'})).minutes,5,'default 5');
  assert.equal(live(999).minutes,60,'clamped');
  assert.equal(Number(psql(`select analytics_live(now() - interval '5 minutes')`,{role:'service_role'})),live(5).sessions,'the tile and the panel agree');
  const L15=live(15),txt=JSON.stringify(L15);
  for(const raw of ['liveSessionA00000001','liveSessionB00000001',H1,H2])assert(!txt.includes(raw),'never a raw id or visitor hash: '+raw);
  for(const r of L15.rows)assert.match(r.sid,/^[0-9a-f]{6}$/);
  const A=L15.rows.find(r=>r.sid===sid('liveSessionA00000001'));
  assert.equal(A.seconds_active,180,'foreground time: the beats\' engaged time, not wall clock');
  assert(A.span_seconds>=290&&A.span_seconds<=310,'span: start to the last beat');
  assert.equal(A.country,'US');assert.equal(A.region,'CA');assert.equal(A.campaign,'flyer');assert.equal(A.returning,false);assert.equal(A.has_code,false);
  assert.equal(A.area,'island');assert.equal(A.activity,'fishing');assert.equal(A.previous_area,'arcade');assert.equal(A.spot,'fishing');
  assert.deepEqual(A.counts,{balls:1,fish:2,lessons:1,quizzes:1,swims:3,paintings:1,fruit:2,kicks:1},'counts');
  assert.deepEqual(A.areas,{arcade:120,island:60});assert.deepEqual(A.activities,{arcade_runner:100,idle:20,fishing:40,walk:20});
  assert.equal(A.device_today_sessions,2);assert.equal(A.device_today_seconds,480,'same device today: this session + the earlier one');
  const B=L15.rows.find(r=>r.sid===sid('liveSessionB00000001'));assert.equal(B.referrer_host,'instagram.com');assert.equal(B.returning,true);assert.equal(B.has_code,true);assert.equal(B.previous_area,null);
  const E=L15.rows.find(r=>r.sid===sid('liveSessionE00000001'));assert.equal(E.spot,null);assert.equal(E.seconds_active,0);assert.equal(E.country,null);assert.equal(E.returning,null);
  assert.equal(L15.sessions,4);
  assert.deepEqual(L15.by_area,[{key:'fishing',n:1},{key:'museum',n:1},{key:'starting',n:1},{key:'swim',n:1}]);
  assert.deepEqual(L15.by_country,[{country:'US',n:2,regions:[{region:'CA',n:1},{region:'TX',n:1}]},{country:'(unknown)',n:1,regions:[]},{country:'CA',n:1,regions:[{region:'ON',n:1}]}]);
  assert.deepEqual(L15.by_source,[{key:'direct',n:2},{key:'flyer',n:1},{key:'instagram.com',n:1}]);

  // The day view: aggregates only, rows under 3 sessions hidden.
  const sum=JSON.parse(psql(`select analytics_sources_summary('${day}','${day}')`,{role:'service_role'}));
  assert.equal(sum.sessions,6);assert.equal(sum.min_sessions,3);
  assert.deepEqual(sum.countries,[{country:'US',n:3,regions:[{region:'CA',n:null},{region:'TX',n:null}]}],'US 3 shown; its regions under 3 hidden');
  assert.equal(sum.countries_suppressed,3,'CA, GB and unknown: 1 each');
  assert.deepEqual(sum.sources,[{key:'direct',n:3}]);assert.equal(sum.sources_suppressed,3,'flyer 2, instagram 1');
  assert.deepEqual(sum.returning,{new:null,returning:null,unknown:4});assert.deepEqual(sum.code,{with:null,without:null,unknown:4});
  assert(!JSON.stringify(sum).includes('liveSession'),'no ids');
  assert.equal(JSON.parse(psql(`select analytics_sources_summary('${day}'::date - 30,'${day}'::date - 20)`,{role:'service_role'})).sessions,0,'an empty range');
  for(const fn of [`analytics_live_sessions(5)`,`analytics_sources_summary('${day}','${day}')`])for(const role of ['anon','authenticated'])
   assert.throws(()=>psql(`select ${fn}`,{role}),/permission denied/,`${role} cannot run ${fn}`);
  const sql=read(MIGRATION).replace(/--.*$/gm,'');
  assert(!/\bdrop\b|\btruncate\b|\bdelete from\b|rename/i.test(sql),'no destructive statements');
  assert(!/x-vercel-ip-city|city/i.test(sql),'never the city');
  // Nothing the previous ingest allowed is dropped.
  const ing=fs.readdirSync('supabase/migrations').filter(f=>/create or replace function public\.analytics_ingest/.test(read('supabase/migrations/'+f))).sort();
  // Oct 16 2026: 20261019_analytics_day_sessions.sql replaces the ingest again (tests/admin-analytics-day.cjs checks that one).
  const at=ing.indexOf(path.basename(MIGRATION));assert(at>0,'this file replaces the ingest');
  const lists=s=>[...s.matchAll(/where key in \(([^)]*)\)/g)].map(m=>m[1]);
  assert.deepEqual(lists(read(MIGRATION)),lists(read('supabase/migrations/'+ing[at-1])),'the same allow-lists as '+ing[at-1]);
 }finally{
  try{cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-m','immediate','stop'],quiet);}catch{}
  fs.rmSync(dir,{recursive:true,force:true});
 }
});

console.log(`admin-analytics-live: ${passed} groups passed`);
})().catch(e=>{console.error(e);process.exit(1);});
