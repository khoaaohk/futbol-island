#!/usr/bin/env node
// Admin analytics, "Start page" (Oct 9 2026): the start-page ids are allowlisted and match the page; the ONE delegated click
// listener maps data-track ids (and Play by its card) and nothing else; the outcome hooks; the funnel maths; the /start traffic
// subset (TypeScript and, on a throwaway Postgres, the SQL of 20261009_analytics_start.sql incl. its self-check row);
// small-number suppression; and that no free text ever reaches a beat.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),os=require('os'),cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const G={location:{pathname:'/',search:''}};// the page the browser modules think they are on (the title screen is at `/`)
const loaded=new Map();
function resolve(from,id){
 const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);
 for(const f of [base,base+'.ts',base+'.tsx'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;
 throw Error('cannot resolve '+id+' from '+from);
}
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);
 if(file.endsWith('.json')){const v={default:JSON.parse(fs.readFileSync(file,'utf8'))};loaded.set(file,v);return v;}
 const m={exports:{}};loaded.set(file,m.exports);
 const ctx={module:m,exports:m.exports,Buffer,URL,URLSearchParams,TextDecoder,Date,Math,JSON,process:{env:{}},console,
  require:id=>id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id)};
 Object.defineProperty(ctx,'location',{get:()=>G.location});
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,ctx);
 loaded.set(file,m.exports);return m.exports;}
const K=load('lib/analytics/countIds.ts'),SI=load('lib/analytics/startIds.ts'),C=load('lib/analytics/core.ts'),S=load('lib/analytics/store.ts'),I=load('lib/analytics/ingest.ts'),
 R=load('lib/analytics/report.ts'),T=load('lib/analytics/tracker.ts'),SE=load('lib/analytics/startEvents.ts'),SR=load('lib/analytics/startReport.ts');
const read=f=>fs.readFileSync(f,'utf8');
const J=x=>JSON.parse(JSON.stringify(x));
let passed=0;const skipped=[];const ok=(name,fn)=>Promise.resolve().then(fn).then(r=>{if(r==='skip')skipped.push(name);else passed++;},e=>{console.error('FAIL',name);throw e;});
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
function headers(){const m=new Map(Object.entries({host:'futbolisland.app','user-agent':UA,'x-forwarded-for':'203.0.113.9','x-vercel-ip-country':'US',origin:'https://futbolisland.app'}));return {get:k=>m.has(k.toLowerCase())?m.get(k.toLowerCase()):null};}
const ingest=(store,body,now)=>I.handleIngest({body:JSON.stringify(body),headers:headers(),store,limiter:I.createLimiter({capacity:1e6}),now,vercelEnv:'production'});
// Fake browser (manual clock), as in tests/admin-analytics-learning.cjs.
function env(){
 const listeners={},timers=new Map(),store={};let id=0,t=0,seed=0;const sent=[];
 const w={location:{hostname:'futbolisland.app',pathname:'/',search:''},addEventListener:(k,f,o)=>{(listeners[k]??=[]).push({f,o});},removeEventListener:(k,f)=>{listeners[k]=(listeners[k]||[]).filter(x=>x.f!==f);},
  setTimeout:(f,ms)=>{timers.set(++id,{f,at:t+ms});return id;},clearTimeout:i=>{timers.delete(i);}};
 const d={visibilityState:'visible',referrer:'',addEventListener:w.addEventListener,removeEventListener:w.removeEventListener};
 const n={sendBeacon:(u,b)=>{sent.push({raw:b,...JSON.parse(b)});return true;},maxTouchPoints:0};
 return {w,listeners,sent,e:{window:w,document:d,navigator:n,storage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v;}},now:()=>t,random:k=>{seed++;return new Uint8Array(k).map((_,i)=>(i*7+seed*53)&255);}},
  advance(ms){t+=ms;},fire(k,ev){for(const {f} of listeners[k]||[])f(ev);},hide(){d.visibilityState='hidden';this.fire('visibilitychange');}};
}
/** A minimal element: attributes + parent, with closest() for [attr] selectors (what the listener uses). */
function el(attrs={},parent=null){return {attrs,parent,getAttribute(k){return k in this.attrs?this.attrs[k]:null;},
 closest(sel){const a=sel.match(/^\[([a-z-]+)\]$/)[1];for(let e=this;e;e=e.parent)if(a in e.attrs)return e;return null;}};}
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');

(async()=>{
// 1. The ids: on the counter allowlist, the right shape, and in step with the page they describe.
await ok('ids allowlisted',()=>{
 assert.equal(new Set(SI.START_COUNT_IDS).size,SI.START_COUNT_IDS.length,'no duplicates');
 for(const id of SI.START_COUNT_IDS){assert(K.isCountId(id),id);assert(K.COUNT_KEY_RE.test(id),id);assert(K.FIXED_COUNT_IDS.includes(id),id);}
 assert(SI.START_COUNT_IDS.length<=K.MAX_BEAT_COUNTS,'every start id fits one beat');
 for(const bad of ['st:foo','sg:amt_7','sp:pp-short','sg:Street Soccer','st:view:1','st:','sg:<b>','sp:open ','ST:view'])assert.equal(K.isCountId(bad),false,bad);
 // Every data-track in the start page's files is an allowlisted id (the literal ones; the computed ones are checked below).
 const files=['components/landing/TitleActions.tsx','components/landing/GrownUps.tsx','components/about/AboutGrownUps.tsx','components/landing/Donate.tsx','components/landing/TitleScene.tsx'];
 const literal=files.flatMap(f=>[...read(f).matchAll(/data-track="([^"]+)"/g)].map(m=>m[1]));
 assert.deepEqual(literal.sort(),['sg:donate','sg:instagram','sg:open','sg:privacy','sg:wsv','sp:open','st:have','st:other_code','st:start'].sort());
 for(const id of literal)assert(SI.isStartId(id),id);
 // Computed ids: the non-profits, the amounts and the privacy contents match their sources.
 const np=[...read('components/DonationLinks.tsx').match(/NONPROFITS=\[(.*?)\] as const/)[1].matchAll(/name:'([^']+)'/g)].map(m=>SI.nonprofitSlug(m[1]));
 assert.deepEqual(np,J(SI.START_NONPROFITS),'non-profit slugs');
 assert.deepEqual(read('components/DonationLinks.tsx').match(/DONATION_AMOUNTS=\[([^\]]+)\]/)[1].split(',').map(Number),J(SI.START_AMOUNTS),'amount tiers');
 assert(/data-track=\{'sg:'\+nonprofitSlug\(n\.name\)\}/.test(read('components/landing/Donate.tsx'))&&/data-track=\{'sg:amt_'\+a\}/.test(read('components/landing/Donate.tsx')));
 const toc=[...read('components/privacy/PrivacyPolicy.tsx').matchAll(/<PolicyToc href="#pp-([a-z]+)">/g)].map(m=>m[1]);
 assert.deepEqual(toc,J(SI.PRIVACY_SECTION_IDS),'privacy contents');assert.deepEqual(Object.keys(SR.PRIVACY_SECTION_LABEL),toc);
 assert(/data-track=\{'sp:'\+href\.replace\(\/\^#pp-\/,''\)\}/.test(read('components/privacy/PolicyToc.tsx')));
 // The Play buttons are counted by their card: every card that holds a Play has an allowlisted st:play_<card>.
 const ta=read('components/landing/TitleActions.tsx');
 for(const card of ['returning','ready','break'])assert(new RegExp(`data-title-card(=\\{?"${card}"|=\\{?'${card}')`).test(ta)||ta.includes(`data-title-card="${card}"`),card),assert(SI.isStartId('st:play_'+card));
 assert(/data-landing-play/.test(read('components/landing/PlayButton.tsx')),'PlayButton keeps its data-landing-play hook');
 // The server keeps them (and drops a well-formed id that is not on the list).
 const v=C.validateEvent(JSON.stringify({v:1,t:'beat',s:'StartSessionStart0001',p:'/start',e:5000,k:Object.fromEntries(SI.START_COUNT_IDS.map(id=>[id,1]))}));assert(v.ok);
 assert.deepEqual(Object.keys(C.clampCounts({'st:view':1,'st:foo':2,'sg:amt_10':1})),['st:view','sg:amt_10']);
 assert.equal(C.SCHEMA_VERSION,4);
});

// 2. The delegated listener: one passive capture listener; data-track ids and Play-by-card only; nothing when the tracker is off.
await ok('delegated listener',()=>{
 const card=el({'data-title-card':'ready'}),play=el({'data-landing-play':'hero'},card),inner=el({},play);
 assert.equal(SE.clickId(inner),'st:play_ready');
 assert.equal(SE.clickId(el({},el({'data-landing-play':'hero'},el({'data-title-card':'mystery'})))),null,'an unknown card counts nothing');
 assert.equal(SE.clickId(el({},el({'data-track':'sg:amt_10'}))),'sg:amt_10','the nearest marked ancestor');
 assert.equal(SE.clickId(el({'data-track':'Hello <b>world</b>'})),null,'free text in data-track is ignored');
 assert.equal(SE.clickId(el({'data-track':'st:view'},el({'data-track':'sg:open'}))),'st:view');
 assert.equal(SE.clickId(el({})),null);assert.equal(SE.clickId(null),null);assert.equal(SE.clickId({}),null);
 // With a running tracker: the view, ?coffee=thanks, clicks, one listener, then a beat carrying the totals.
 const x=env();x.w.location.search='?coffee=thanks';const tr=T.startTracker(x.e);tr.pageview('/');
 const stop=SE.watchStart(x.w);
 const clicks=x.listeners.click;assert.equal(clicks.length,1,'one click listener');assert.deepEqual(J(clicks[0].o),{capture:true,passive:true});
 assert.equal(x.listeners.scroll,undefined);
 for(const t of [el({'data-track':'sg:open'}),el({'data-track':'sg:open'}),el({},el({'data-track':'sp:retention'})),inner,el({'data-track':'nope'})])x.fire('click',{target:t});
 assert.deepEqual(J(tr.state().counts),{'st:view':1,'sg:paid':1,'sg:open':2,'sp:retention':1,'st:play_ready':1});
 x.fire('pointerdown');x.advance(20_000);x.hide();
 const beat=x.sent.filter(b=>b.t==='beat').pop();assert.deepEqual(J(beat.k),{'sg:open':2,'st:view':1,'sg:paid':1,'sp:retention':1,'st:play_ready':1});
 assert.equal(C.validateEvent(beat.raw).ok,true);
 stop();assert.equal(x.listeners.click.length,0,'removed when the title screen goes (Play, or leaving /)');tr.stop();
 // Tracker off (DNT, bots, preview…): watchStart and trackStart change nothing.
 const y=env();y.e.navigator.doNotTrack='1';assert.equal(T.startTracker(y.e),null);SE.trackStart('st:start');
 const z=env(),t2=T.startTracker(z.e);t2.pageview('/');assert.deepEqual(J(t2.state().counts),{},'nothing left over from the off tracker');
 // VisitTracker mounts it while `/` shows the title screen (not the game: lib/rootView.ts), after the tracker started.
 const vt=read('components/VisitTracker.tsx');assert(/useEffect\(\(\)=>\{if\(pathname!=='\/'\|\|view!=='landing'\|\|!tracker\.current\)return;return watchStart\(window\);\},\[pathname,view\]\)/.test(vt));
 assert(/const pathname=usePathname\(\),view=useRootView\(\);/.test(vt));
 // No timers, frames, requests or page reads in the listener module.
 const src=strip(read('lib/analytics/startEvents.ts'));
 assert(!/setTimeout|setInterval|requestAnimationFrame|fetch\(|sendBeacon|localStorage|textContent|innerText|\.value\b|getAttribute\('href'\)|MutationObserver/.test(src),'map increments only');
 t2.stop();
});

// 3. Outcome hooks: phases count on a real change only, and only while the title screen shows (watchStart mounted).
await ok('outcome hooks',()=>{
 const x=env(),tr=T.startTracker(x.e);tr.pageview('/');
 SE.trackStart('st:start');assert.deepEqual(J(tr.state().counts),{},'before the title screen shows: nothing');
 const stop=SE.watchStart(x.w);
 for(const p of ['checking','making','making','code','code'])SE.startCreatePhase(p);// re-renders repeat a phase
 SE.startCreatePhase('checking');SE.startCreatePhase('code');// a code that already existed: not "created"
 for(const p of ['checking','enter','loading','enter','loading','grownup','enter','loading','welcome','welcome'])SE.startRestorePhase(p);
 SE.startWordPick(true);SE.startWordPick(false);SE.startTitleState('returning');SE.startTitleState('break');SE.startTitleState('ready');
 assert.deepEqual(J(tr.state().counts),{'st:view':1,'st:created':1,'st:restore_fail':2,'st:restored':1,'st:word':2,'st:word_ok':1,'st:returning':1,'st:break':1});
 stop();SE.startWordPick(true);SE.trackStart('sg:paid');// Play → the game at the same `/`: CodeShown inside the game is not counted
 assert.equal(tr.state().counts['st:word'],2);assert.equal(tr.state().counts['sg:paid'],undefined);tr.stop();
 // The wiring at each moment.
 const ad=read('components/landing/saveCodeAdapter.tsx');
 assert(/onPhase=\{p=>\{startCreatePhase\(p\);onPhase\?\.\(p\);\}\}/.test(ad)&&/onPhase=\{p=>\{startRestorePhase\(p\);onPhase\?\.\(p\);\}\}/.test(ad));
 assert(/if\(c\)trackStart\('st:saved'\)/.test(ad)&&/if\(restored\)trackStart\('st:play_restored'\);if\(restored\)\{window\.history\.replaceState\(window\.history\.state,'','\/'\)/.test(ad),'counted first, then the address is reset to a bare / (a ?coffee=thanks is not counted again after the reload)');
 assert(/useEffect\(\(\)=>\{startTitleState\(state\);\},\[state\]\)/.test(read('components/landing/TitleActions.tsx')));
 assert(/onCancel=\{\(\)=>\{trackStart\('sg:gate_no'\);setStep\('closed'\);\}\} onPass=\{\(\)=>\{trackStart\('sg:gate_ok'\);setStep\('open'\);\}\}/.test(read('components/landing/Donate.tsx')));
 assert(/if\(picked===null\)startWordPick\(w===c\.words\[0\]\)/.test(read('components/saves/SaveCodeCreate.tsx')),'a boolean, never the word');
 assert(/return=\$\{returnTo\}/.test(read('components/landing/Donate.tsx'))&&/donateReturn="start"/.test(read('components/landing/GrownUps.tsx'))&&/'start'\?'\/\?coffee=thanks'/.test(read('app/coffee/checkout/route.ts')),'Stripe success returns to the title screen at /?coffee=thanks');
 assert(/start page are tapped \(for example Start, For grown-ups or Donate\), counted as totals/.test(read('components/privacy/PrivacyPolicy.tsx')),'privacy policy §7');
 assert(/admin-analytics-start\.cjs/.test(read('package.json')),'part of npm test');
});

// 4. Funnel maths.
await ok('funnel maths',()=>{
 assert.deepEqual(J(SR.funnelMath([100,60,45,45,30])),[{ofFirst:1,drop:null},{ofFirst:0.6,drop:0.4},{ofFirst:0.45,drop:0.25},{ofFirst:0.45,drop:0},{ofFirst:0.3,drop:1-30/45}]);
 assert.deepEqual(J(SR.funnelMath([20,null,8])),[{ofFirst:1,drop:null},{ofFirst:null,drop:null},{ofFirst:0.4,drop:null}],'a withheld step has no share and breaks the drop');
 assert.deepEqual(J(SR.funnelMath([10,12])),[{ofFirst:1,drop:null},{ofFirst:1,drop:0}],'a later step above the first is capped, never a negative drop');
 assert.deepEqual(J(SR.funnelMath([0,0])),[{ofFirst:null,drop:null},{ofFirst:null,drop:null}]);
});

// Fixture: four sessions; A enters on /start; B enters on / and views /start later (st:view); C on / only; D on /start, another day.
const DAY='2026-10-05',iso=(h,m)=>`${DAY}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00.000Z`;
const st=(id,hash,startedAt,o={})=>({id,day:DAY,visitorHash:hash.repeat(32),startedAt,entryPath:'/',country:'US',region:'CA',device:'phone',source:'direct',referrerHost:null,utmSource:null,utmMedium:null,utmCampaign:null,flags:{},...o});
const FIX_STARTS=[st('stA_aaaaaaaaaaaaaaaa','a',iso(9,0),{entryPath:'/start',country:'GB',region:null,device:'desktop',source:'social',referrerHost:'instagram.com'}),
 st('stB_bbbbbbbbbbbbbbbb','b',iso(10,0),{source:'campaign',utmSource:'flyer',utmMedium:'print',utmCampaign:'fall'}),st('stC_cccccccccccccccc','c',iso(11,0)),
 st('stE_eeeeeeeeeeeeeeee','a',iso(12,0),{entryPath:'/start',country:'GB',region:null,device:'tablet'})];
const bt=(sessionId,ts,counts,pageviews=0)=>({sessionId,ts,engagedMs:30000,pageviews,areaMs:{other:30000},placeMs:{},activityMs:{},cells:{},counts});
const FIX_BEATS=[bt('stA_aaaaaaaaaaaaaaaa',iso(9,1),{'st:view':1,'st:start':1,'st:created':1},1),bt('stB_bbbbbbbbbbbbbbbb',iso(10,5),{'st:view':1,'sg:open':2},2),
 bt('stC_cccccccccccccccc',iso(11,1),{'lo:x':1}),bt('stE_eeeeeeeeeeeeeeee',iso(12,1),{})];

// 5. /start filtering: the subset is the sessions that entered on /start or viewed it, with the same dims rules.
await ok('start filtering',async()=>{
 const sessions=C.deriveSessions(FIX_STARTS,FIX_BEATS);
 assert.deepEqual(sessions.map(C.isStartSession),[true,true,false,true]);
 const r=C.rollupDay(DAY,sessions);
 assert.deepEqual({v:r.start.visitors,s:r.start.sessions,pv:r.start.pageviews},{v:2,s:3,pv:2+3+1},'A and E share a visitor hash');
 assert.deepEqual(J(r.start.dims.country),{GB:{s:2,v:1,pv:3},US:{s:1,v:1,pv:3}});
 assert.deepEqual(Object.keys(r.start.dims.device).sort(),['desktop','phone','tablet']);
 assert.deepEqual(J(r.start.dims.referrer),{'instagram.com':{s:1,v:1,pv:2}});assert.deepEqual(Object.keys(r.start.dims.campaign),['fall · flyer / print']);
 assert.equal(r.dims.device.phone.s,2,'the all-traffic dims are untouched (B and C)');
 // Merge + report: days that carry the subset, partial ranges, and the fallback before the storage update.
 const legacy={...C.rollupDay('2026-10-04',[])};delete legacy.start;
 const m=C.mergeRollups([r,legacy]);assert.equal(m.start.sessions,3);assert.equal(m.start.days,1);assert.equal(m.start.dims.country[0].key,'GB');
 const rep=SR.buildStart(m,4,2);assert.equal(rep.visits.available,true);assert.equal(rep.visits.partial,true);assert.equal(rep.visits.entered.sessions,2);
 assert.equal(SR.buildStart(m,3,2).dims,null,'schema 3 (no update yet): no start-only split, but taps still show');
 const mem=S.createMemoryStore();for(const s of FIX_STARTS)mem.data.starts[s.id]=s;mem.data.beats.push(...FIX_BEATS);
 const full=await R.buildReport(mem,{from:DAY,to:DAY},new Date('2026-10-07T12:00:00Z'));
 assert.equal(full.start.visits.sessions,3);assert.equal(full.storage.needsUpdate,false);assert(full.start.hasData);
 const old=await R.buildReport({...mem,schemaVersion:async()=>3},{from:DAY,to:DAY},new Date('2026-10-07T12:00:00Z'));
 assert.equal(old.storage.needsUpdate,true,'schema 3 → the banner');assert.equal(old.start.dims,null);
 const dash=read('app/admin/AnalyticsDashboard.tsx');assert(/20261009_analytics_start\.sql/.test(dash)&&/OK, start page installed \(analytics schema 4\)/.test(dash)&&/<StartSection report=\{report\}/.test(dash));
});

// 6. Suppression: anything resting on < 5 sessions is withheld.
await ok('suppression',()=>{
 const sess={'st:view':40,'st:start':20,'st:created':4,'st:saved':12,'sg:open':9,'sg:wsv':3,'sg:amt_10':6,'sg:paid':2,'sp:open':5,'sp:short':1},cnt={...sess,'sg:wsv':3,'sg:amt_10':8};
 const merged={counts:cnt,countSessions:sess,start:{visitors:30,sessions:41,pageviews:80,days:1,dims:{country:[],source:[],referrer:[],campaign:[],device:[]}},dims:{entry:[{key:'/start',visitors:25,sessions:33,pageviews:60}]}};
 const r=SR.buildStart(merged,4,1);
 const nf=r.funnels.find(f=>f.id==='new').steps.map(s=>s.sessions);assert.deepEqual(J(nf),[40,20,null,12,0]);
 const wsv=r.grown.links.find(l=>l.id==='wsv');assert.equal(wsv.sessions,null);assert.equal(wsv.clicks,null,'taps behind < 5 sessions are withheld too');
 const a10=r.grown.amounts.find(a=>a.amount===10);assert.equal(a10.sessions,6);assert.equal(a10.clicks,8);
 assert.equal(r.grown.paid,null);assert.equal(r.privacy.fromLink,5);assert.equal(r.privacy.sections[0].sessions,null);
 assert.equal(r.hidden,5,'created, wsv (sessions + taps), paid, the short-version section');
 assert(!/"(sessions|clicks|viewed|paid|opened|fromLink|fromGrown|answered|right|tilt|gateNo)":[1-4][,}]/.test(JSON.stringify(r)),'no raw small cells');
 assert(/<5/.test(read('app/admin/StartSection.tsx'))&&/fewer than/.test(read('app/admin/StartSection.tsx')),'the dashboard says what is hidden');
});

// 7. No free text reaches a beat: only allowlisted ids, whatever the page puts in data-track; sources read attributes only.
await ok('no free text',async()=>{
 const x=env(),tr=T.startTracker(x.e);tr.pageview('/');const stop=SE.watchStart(x.w);
 for(const t of ['striker-volley-corner-427','<img src=x>','mum@example.com','st:view; drop table','sg:amt_10 ','x'.repeat(200)])x.fire('click',{target:el({'data-track':t})});
 T.count('st:not_an_id');T.count('Hello');
 x.fire('pointerdown');x.advance(5000);x.hide();stop();tr.stop();
 const raw=x.sent.map(b=>b.raw).join('\n');
 assert(!/striker|img|example|drop table|xxxxx|Hello|not_an_id/.test(raw),'nothing typed or free-form leaves the tab');
 for(const b of x.sent.filter(b=>b.k))for(const k of Object.keys(b.k))assert(SI.isStartId(k),k);
 const store=S.createMemoryStore(),now=new Date();
 await ingest(store,{v:1,t:'start',s:'NoTextStartSession01',p:'/start'},now);
 assert.equal((await ingest(store,{v:1,t:'beat',s:'NoTextStartSession01',p:'/start',e:3000,k:{'st:view':1,'st:junk':1}},now)).reason,'ok');
 assert.deepEqual(J(store.data.beats[0].counts),{'st:view':1});
 for(const f of ['components/landing/GrownUps.tsx','components/about/AboutGrownUps.tsx','components/landing/Donate.tsx','components/landing/TitleActions.tsx','components/landing/TitleScene.tsx'])
  for(const m of read(f).matchAll(/data-track=\{([^}]+)\}/g))assert(/^'s[gtp]:(amt_)?'\+(nonprofitSlug\(n\.name\)|a)$/.test(m[1]),f+': '+m[1]);
});

// 8. The SQL: four migrations in order; additive; the self-check row; the start subset = the TypeScript reference.
await ok('sql',async()=>{
 const bin=n=>{for(const d of (process.env.PATH||'').split(':').concat(['/opt/homebrew/bin','/usr/local/bin','/usr/lib/postgresql/16/bin','/usr/lib/postgresql/15/bin','/usr/lib/postgresql/14/bin'])){const f=path.join(d,n);if(fs.existsSync(f))return f;}return null;};
 const initdb=bin('initdb'),pgctl=bin('pg_ctl'),psqlBin=bin('psql');
 if(process.env.SKIP_PG_TESTS||!initdb||!pgctl||!psqlBin){console.log('  SKIP sql: no local Postgres (initdb/pg_ctl/psql) found');return 'skip';}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fipgs-')),port=String(40000+(process.pid+29)%20000),quiet={stdio:['ignore','ignore','pipe']};
 try{
  cp.execFileSync(initdb,['-D',path.join(dir,'data'),'-U','postgres','--auth=trust','-E','UTF8','--locale=C'],quiet);
  cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-o',`-k ${dir} -p ${port} -c listen_addresses='' -c fsync=off -c TimeZone=UTC`,'-w','-l',path.join(dir,'log'),'start'],quiet);
  const args=['-h',dir,'-p',port,'-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-qAt'];
  const psql=(sql,{role}={})=>cp.execFileSync(psqlBin,[...args,'-c',(role?`set role ${role}; `:'')+sql],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const fails=(sql,role)=>{const r=cp.spawnSync(psqlBin,[...args,'-c',`set role ${role}; ${sql}`],{encoding:'utf8'});return r.status!==0?r.stderr:'';};
  const runFile=f=>cp.execFileSync(psqlBin,[...args,'-f',f],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  psql('create role anon; create role authenticated; create role service_role bypassrls;');
  for(const f of ['20261007_analytics.sql','20261008_analytics_places.sql','20261009_analytics_counts.sql'])runFile('supabase/migrations/'+f);
  const cols=psql(`select string_agg(table_name||'.'||column_name,',' order by table_name,ordinal_position) from information_schema.columns where table_name like 'analytics_%'`);
  // Start-page taps already flow before this migration (the ingest checks only the id shape).
  const today=new Date().toISOString().slice(0,10);
  psql(`select analytics_ingest('{"type":"start","session":"sqlstartsession00001","path":"/start","day":"${today}","visitor_hash":"${'5'.repeat(32)}","device":"phone","source":"direct"}')`,{role:'service_role'});
  psql(`select analytics_ingest('{"type":"beat","session":"sqlstartsession00001","engaged_ms":4000,"counts":{"st:view":1,"sg:street_soccer_san_diego":2,"sp:retention":1}}')`,{role:'service_role'});
  assert.deepEqual(JSON.parse(psql(`select counts from analytics_beats where session_id='sqlstartsession00001'`)),{'st:view':1,'sg:street_soccer_san_diego':2,'sp:retention':1});
  assert.equal(runFile('supabase/migrations/20261009_analytics_start.sql'),'OK, start page installed (analytics schema 4)','self-check row');
  assert.equal(runFile('supabase/migrations/20261009_analytics_start.sql'),'OK, start page installed (analytics schema 4)','idempotent');
  assert.equal(psql(`select string_agg(table_name||'.'||column_name,',' order by table_name,ordinal_position) from information_schema.columns where table_name like 'analytics_%'`),cols,'no table or column changes');
  assert.equal(psql('select analytics_schema_version()',{role:'service_role'}),String(C.SCHEMA_VERSION));
  for(const role of ['anon','authenticated'])for(const fn of ['analytics_schema_version()','analytics_day_rollup(current_date)'])assert.match(fails(`select ${fn}`,role),/permission denied/,role+' '+fn);
  const sql=read('supabase/migrations/20261009_analytics_start.sql');
  assert(!/\bdrop\b|\btruncate\b|\bdelete from\b|rename|alter table/i.test(sql.replace(/--.*$/gm,'')),'no destructive or table statements');
  psql(`create or replace function analytics_schema_version() returns integer language sql immutable as $$ select 3 $$`);
  assert.match(psql(sql.slice(sql.lastIndexOf('select case when missing'))),/^NOT INSTALLED: analytics_schema_version\(\) = 4$/,'the self-check fails loudly');
  runFile('supabase/migrations/20261009_analytics_start.sql');
  // Rollup = TypeScript reference (every key, the start subset included).
  const q=v=>v===null||v===undefined?'null':`'${String(v).replace(/'/g,"''")}'`;
  psql('insert into analytics_sessions (id,day,visitor_hash,started_at,entry_path,country,region,device,source,referrer_host,utm_source,utm_medium,utm_campaign) values '+
   FIX_STARTS.map(s=>`(${[s.id,s.day,s.visitorHash,s.startedAt,s.entryPath,s.country,s.region,s.device,s.source,s.referrerHost,s.utmSource,s.utmMedium,s.utmCampaign].map(q).join(',')})`).join(','));
  psql('insert into analytics_beats (session_id,ts,engaged_ms,pageviews,area_ms,counts) values '+FIX_BEATS.map(b=>`(${q(b.sessionId)},${q(b.ts)},${b.engagedMs},${b.pageviews},${q(JSON.stringify(b.areaMs))},${q(JSON.stringify(b.counts||{}))})`).join(','));
  const ref=J(C.rollupDay(DAY,C.deriveSessions(FIX_STARTS,FIX_BEATS))),got=JSON.parse(psql(`select analytics_day_rollup('${DAY}')`,{role:'service_role'}));
  assert.deepEqual(got,ref,'SQL day rollup = TypeScript reference');assert.equal(got.start.sessions,3);
  assert.deepEqual(JSON.parse(psql(`select analytics_day_rollup('2026-09-01')`,{role:'service_role'})),J(C.rollupDay('2026-09-01',[])),'an empty day has the same shape');
  // Frozen for good by the nightly finalize.
  const add=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*86400000).toISOString().slice(0,10),fin=add(today,-5);
  psql(`update analytics_beats set ts=ts + ('${fin}'::date - '${DAY}'::date) * interval '1 day' where session_id in (select id from analytics_sessions where day='${DAY}')`);
  psql(`update analytics_sessions set day='${fin}', started_at=started_at + ('${fin}'::date - '${DAY}'::date) * interval '1 day' where day='${DAY}'`);
  assert(JSON.parse(psql(`select analytics_finalize('${today}')`,{role:'service_role'})).includes(fin));
  assert.deepEqual(JSON.parse(psql(`select data->'start' from analytics_daily where day='${fin}'`)),ref.start);
 }finally{
  try{cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-m','immediate','-w','stop'],quiet);}catch{}
  fs.rmSync(dir,{recursive:true,force:true});
 }
});

console.log(`admin-analytics-start: ${passed} groups passed${skipped.length?`, skipped: ${skipped.join(', ')}`:''}`);
})().catch(e=>{console.error(e);process.exit(1);});
