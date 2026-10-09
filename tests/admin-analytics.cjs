#!/usr/bin/env node
// Admin analytics (Oct 7 2026): ingest validation, no PII stored, DNT/GPC respected, daily-rotating visitor hash, admin and
// cron auth, the append-only start/beat model and its caps, the tracker's flush model and heat budget, the nightly roll-up,
// and the SQL aggregation (the migration runs on a throwaway local Postgres and must match the TypeScript reference).
// Node only (vm + TypeScript transpile, the same loader as heat-pass6). The SQL group is skipped when no `initdb` is found.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),os=require('os'),cp=require('child_process');
const loaded=new Map();
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Buffer,URL,URLSearchParams,TextDecoder,Date,Math,JSON,process:{env:{}},console,
   require:id=>id.endsWith('.json')?{default:JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id),'utf8'))}:id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});
 loaded.set(file,m.exports);return m.exports;}
const C=load('lib/analytics/core.ts'),S=load('lib/analytics/store.ts'),I=load('lib/analytics/ingest.ts'),R=load('lib/analytics/report.ts'),A=load('lib/analytics/adminAuth.ts'),T=load('lib/analytics/tracker.ts');
const read=f=>fs.readFileSync(f,'utf8');
const J=x=>JSON.parse(JSON.stringify(x));// values from the vm realm → this realm, for deepEqual
let passed=0;const skipped=[];const ok=(name,fn)=>Promise.resolve().then(fn).then(r=>{if(r==='skip')skipped.push(name);else passed++;},e=>{console.error('FAIL',name);throw e;});

const SID='AbCdEfGhIjKlMnOpQrSt12';
const IP='203.0.113.77',UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1';
function headers(extra={}){const h={host:'futbolisland.app','user-agent':UA,'x-forwarded-for':IP+', 10.0.0.1','x-vercel-ip-country':'GB','x-vercel-ip-country-region':'ENG','x-vercel-ip-city':'London','x-vercel-ip-latitude':'51.5','x-vercel-ip-longitude':'-0.12',origin:'https://futbolisland.app',...extra};
 const m=new Map(Object.entries(h).map(([k,v])=>[k.toLowerCase(),v]));return {get:k=>m.has(k.toLowerCase())?m.get(k.toLowerCase()):null};}
const T0=new Date('2026-10-07T10:00:00Z');
const ingest=(store,body,{h={},now=T0,limiter=I.createLimiter(),vercelEnv='production'}={})=>I.handleIngest({body:typeof body==='string'?body:JSON.stringify(body),headers:headers(h),store,limiter,now,vercelEnv});
const at=ms=>new Date(T0.getTime()+ms);

(async()=>{
// 1. Payload validation: anything off-schema is rejected, never repaired.
await ok('validation',async()=>{
 const bad=['','not json','[]','null','{"t":"start","s":"'+SID+'"}',JSON.stringify({t:'click',s:SID,p:'/'}),JSON.stringify({t:'pv',s:SID,p:'/'}),JSON.stringify({t:'start',s:'short',p:'/'}),
  JSON.stringify({t:'start',s:SID+'!',p:'/'}),JSON.stringify({t:'start',s:SID,p:'arcade'}),JSON.stringify({t:'start',s:SID,p:'/',email:'kid@example.com'}),JSON.stringify({t:'beat',s:SID,p:'/',e:-5}),
  JSON.stringify({t:'beat',s:SID,p:'/',e:1e12}),JSON.stringify({t:'beat',s:SID,p:'/',e:5000,a:{bedroom:5000}}),JSON.stringify({t:'beat',s:SID,p:'/',n:1.5}),JSON.stringify({t:'beat',s:SID,p:'/',n:101}),
  JSON.stringify({t:'start',s:SID,p:'/',e:100}),JSON.stringify({t:'start',s:SID,p:'/',n:1}),JSON.stringify({t:'beat',s:SID,p:'/',e:100,r:'google.com'}),
  JSON.stringify({t:'start',s:SID,p:'/',u:{source:'x',name:'Sam'}}),JSON.stringify({t:'start',s:SID,p:'/',tp:7}),JSON.stringify({t:'start',s:SID,p:'/',r:'x'.repeat(300)}),
  JSON.stringify({t:'start',s:SID,p:'/'+'a'.repeat(250)})];
 for(const b of bad)assert.equal(C.validateEvent(b).ok,false,'rejects '+b.slice(0,60));
 assert.equal(C.validateEvent(JSON.stringify({t:'start',s:SID,p:'/',pad:'x'.repeat(5000)})).reason,'too-large');
 assert.equal(C.validateEvent(JSON.stringify({v:1,t:'start',s:SID,p:'/arcade',r:'google.com',u:{source:'newsletter'},tp:1})).ok,true);
 assert.equal(C.validateEvent(JSON.stringify({v:1,t:'beat',s:SID,p:'/',e:30000,a:{island:20000,paths:10000},n:3})).ok,true);
 const store=S.createMemoryStore();
 for(const b of bad.slice(1))assert.equal((await ingest(store,b)).status,400);
 assert.equal((await ingest(store,'{}',{h:{'content-length':'999999'}})).status,413);
 assert.equal(Object.keys(store.data.starts).length,0,'nothing stored from bad payloads');
 assert.equal((await ingest(store,{t:'start',s:SID,p:'/'},{h:{origin:'https://evil.example'}})).status,403,'cross-origin beacons are refused');
});

// 2. No PII reaches the store; the stored rows are exactly the allowed fields.
await ok('no PII',async()=>{
 const store=S.createMemoryStore();
 const r=await ingest(store,{v:1,t:'start',s:SID,p:'/arcade?name=Sam#x',r:'https://www.google.com/search?q=sam+smith+age+9',u:{source:'News Letter',medium:'email',campaign:'Spring<script>'},tp:0});
 assert.equal(r.status,204);assert.equal(r.reason,'ok');
 const s=store.data.starts[SID];
 assert.deepEqual(Object.keys(s).sort(),['country','day','device','entryPath','flags','id','referrerHost','region','source','startedAt','utmCampaign','utmMedium','utmSource','visitorHash'].sort());
 assert.equal(s.entryPath,'/arcade');assert.equal(s.referrerHost,'google.com');assert.equal(s.source,'campaign');
 assert.equal(s.utmSource,'news-letter');assert.equal(s.utmCampaign,null,'an unsafe utm value is dropped, not stored');
 assert.equal(s.country,'GB');assert.equal(s.region,'ENG');assert.equal(s.device,'phone');assert.match(s.visitorHash,/^[0-9a-f]{32}$/);
 await ingest(store,{v:1,t:'beat',s:SID,p:'/museum?who=sam',e:20000,a:{museum:20000},n:2},{now:at(25000)});
 assert.deepEqual(Object.keys(store.data.beats[0]).sort(),['activityMs','areaMs','cells','counts','engagedMs','pageviews','placeMs','sessionId','ts']);
 const dump=JSON.stringify(store.data);
 for(const pii of [IP,'203.0.113','iPhone','Mozilla','London','51.5','-0.12','sam','Sam','q=','search?','name=','who=','#x','<script>'])assert(!dump.includes(pii),'stored data must not contain '+pii);
 assert.equal(C.sanitizePath('/coffee/checkout?amount=5'),'/coffee');assert.equal(C.sanitizePath('/users/sam'),'/other');assert.equal(C.sanitizePath('/admin'),'/other');
 assert.equal(C.sanitizeHost('futbolisland.app','futbolisland.app'),null,'own host is internal');assert.equal(C.sanitizeHost('bad host!'),null);
 assert.equal(C.sanitizeCountry('XX'),null);assert.equal(C.sanitizeRegion('Greater London'),null);
});

// 3. Do-Not-Track / GPC, preview deployments, bots and a missing store all store nothing.
await ok('dnt',async()=>{
 const store=S.createMemoryStore(),ev={t:'start',s:SID,p:'/'};
 assert.equal((await ingest(store,ev,{h:{dnt:'1'}})).reason,'dnt');
 assert.equal((await ingest(store,ev,{h:{'sec-gpc':'1'}})).reason,'dnt');
 assert.equal((await ingest(store,ev,{vercelEnv:'preview'})).reason,'non-production');
 assert.equal((await ingest(store,ev,{h:{'user-agent':'Mozilla/5.0 (compatible; Googlebot/2.1)'}})).reason,'bot');
 assert.equal((await ingest(store,ev,{h:{'user-agent':'Mozilla/5.0 HeadlessChrome/120'}})).reason,'bot');
 assert.equal((await I.handleIngest({body:JSON.stringify(ev),headers:headers(),store:null,limiter:I.createLimiter()})).reason,'not-configured');
 assert.equal(Object.keys(store.data.starts).length,0);assert.equal(Object.keys(store.data.salts).length,0,'DNT requests do not even create a salt');
});

// 4. The visitor hash rotates daily; old salts and raw rows are purged by the nightly finalize.
await ok('hash rotation',async()=>{
 const store=S.createMemoryStore();
 const d1=new Date('2026-10-07T23:59:00Z'),d2=new Date('2026-10-08T00:01:00Z');
 await ingest(store,{t:'start',s:'Session1Session1Sess',p:'/'},{now:d1});
 await ingest(store,{t:'start',s:'Session2Session2Sess',p:'/'},{now:d1});
 await ingest(store,{t:'start',s:'Session3Session3Sess',p:'/'},{now:d2});
 const ss=store.data.starts;
 assert.equal(ss.Session1Session1Sess.visitorHash,ss.Session2Session2Sess.visitorHash,'same visitor, same day: one hash');
 assert.notEqual(ss.Session1Session1Sess.visitorHash,ss.Session3Session3Sess.visitorHash,'same visitor, next day: a new hash');
 assert.notEqual(await store.salt('2026-10-07'),await store.salt('2026-10-08'));
 assert.notEqual(I.visitorHash('a',IP,UA,'h'),I.visitorHash('b',IP,UA,'h'));
 assert.notEqual(I.visitorHash('a',IP,UA,'h'),I.visitorHash('a',IP,UA,'other-host'));
 await store.finalize(new Date('2026-10-08T02:30:00Z'));
 assert.deepEqual(Object.keys(store.data.salts),['2026-10-08'],'only today\'s salt survives the nightly purge');
 // Retention: raw rows older than 14 days go; the frozen rollup of that day stays.
 const old=S.createMemoryStore();await ingest(old,{t:'start',s:SID,p:'/'},{now:new Date('2026-09-20T10:00:00Z')});
 await ingest(old,{t:'beat',s:SID,p:'/',e:40000},{now:new Date('2026-09-20T10:01:00Z')});
 assert.equal(J((await old.finalize(new Date('2026-09-22T02:30:00Z'))).frozen).includes('2026-09-20'),true);
 await old.finalize(new Date('2026-10-07T02:30:00Z'));
 assert.equal(Object.keys(old.data.starts).length,0);assert.equal(old.data.beats.length,0);
 assert.equal(old.data.rollups['2026-09-20'].sessions,1);assert.equal(old.data.rollups['2026-09-20'].engagedMs,40000);
 assert.equal(C.RETENTION_DAYS,14);
});

// 5. Append-only writes and abuse caps.
await ok('caps',async()=>{
 const store=S.createMemoryStore(),limiter=I.createLimiter();
 const codes=[];for(let i=0;i<30;i++)codes.push((await ingest(store,{t:'start',s:SID,p:'/'},{limiter})).status);
 assert.equal(codes.filter(c=>c===204).length,20);assert.equal(codes.filter(c=>c===429).length,10);
 assert.equal((await ingest(store,{t:'start',s:SID,p:'/'},{limiter,now:at(4000)})).status,204,'the bucket refills');
 assert.equal(Object.keys(store.data.starts).length,1,'a repeated start is ignored, not double counted');
 const lim=I.createLimiter({maxKeys:3});for(const k of ['a','b','c','d','e'])lim.allow(k,0);assert(lim.size()<=3,'limiter memory is bounded');
 // Beats: clamped per event, never create sessions, only within 24 h, capped per session; empty beats are not written.
 const s2=S.createMemoryStore();
 await ingest(s2,{t:'start',s:SID,p:'/'});
 await ingest(s2,{t:'beat',s:SID,p:'/',e:3_000_000,a:{island:3_000_000}},{now:at(1000)});
 assert.equal(s2.data.beats[0].engagedMs,C.MAX_EVENT_ENGAGED_MS,'one beat carries at most 5 minutes');
 await ingest(s2,{t:'beat',s:SID,p:'/',e:30000,a:{island:20000,paths:20000},n:2},{now:at(200_000)});
 assert.deepEqual(J(s2.data.beats[1].areaMs),{island:15000,paths:15000},'area split scaled to the event total');
 assert.equal((await ingest(s2,{t:'beat',s:SID,p:'/',e:0},{now:at(201_000)})).reason,'empty-beat');
 await ingest(s2,{t:'beat',s:'NoSuchSessionNoSuch1',p:'/',e:30000},{now:at(300_000)});
 await ingest(s2,{t:'beat',s:SID,p:'/',e:30000},{now:at(C.BEAT_WINDOW_MS+1000)});
 assert.equal(s2.data.beats.length,2,'orphan and late beats are dropped');
 const derived=C.deriveSessions(Object.values(s2.data.starts),s2.data.beats)[0];
 assert.equal(derived.engagedMs,200_000+C.ENGAGED_SLACK_MS,'sum of beats (330 s), capped at the last beat 200 s after the start + 60 s');assert.equal(derived.pageviews,3,'1 + the beats\' page views');
 const forged=C.deriveSessions([{...s2.data.starts[SID]}],[{sessionId:SID,ts:at(2000).toISOString(),engagedMs:300000,pageviews:0,areaMs:{}}])[0];
 assert.equal(forged.engagedMs,2000+C.ENGAGED_SLACK_MS,'a forged beat cannot claim more than wall-clock time since the start + 60 s');
 // Per-visitor-hash session cap per day (a school's shared NAT still fits).
 const s3=S.createMemoryStore(),big=I.createLimiter({capacity:1e6});
 for(let i=0;i<C.SESSION_CAP_PER_VISITOR_DAY+5;i++)await ingest(s3,{t:'start',s:'Cap'+String(i).padStart(17,'0'),p:'/'},{limiter:big});
 assert.equal(Object.keys(s3.data.starts).length,C.SESSION_CAP_PER_VISITOR_DAY);
 const s4=S.createMemoryStore();await ingest(s4,{t:'start',s:SID,p:'/'});
 for(let i=0;i<C.BEAT_CAP_PER_SESSION+3;i++)await s4.track({type:'beat',session:SID,engagedMs:1000,pageviews:0,areaMs:{}},at(i));
 assert.equal(s4.data.beats.length,C.BEAT_CAP_PER_SESSION);
});

// 6. Admin and cron auth.
await ok('auth',async()=>{
 const env={ADMIN_PASSWORD:'correct horse battery'};
 assert.equal(A.adminPassword({ADMIN_PASSWORD:'short'}),null,'short passwords leave admin off');assert.equal(A.adminPassword({}),null);
 assert.equal(A.passwordMatches('correct horse battery',env.ADMIN_PASSWORD),true);
 assert.equal(A.passwordMatches('correct horse batterz',env.ADMIN_PASSWORD),false);assert.equal(A.passwordMatches('',env.ADMIN_PASSWORD),false);
 assert(/timingSafeEqual\(sha\(input\),sha\(actual\)\)/.test(read('lib/analytics/adminAuth.ts')),'constant-time compare of equal-length digests');
 const now=Date.now(),tok=A.signSession(now,env);
 assert.equal(A.verifySession(tok,now+1000,env),true);
 assert.equal(A.verifySession(tok,now+A.SESSION_TTL_MS+1,env),false,'expires');
 assert.equal(A.verifySession(tok,now,{ADMIN_PASSWORD:'another long password'}),false,'a new password signs everyone out');
 assert.equal(A.verifySession(tok.slice(0,-2)+(tok.endsWith('AA')?'BB':'AA'),now,env),false,'tampered signature');
 const [exp,nonce,sig]=tok.split('.');assert.equal(A.verifySession(`${Number(exp)+9e9}.${nonce}.${sig}`,now,env),false,'tampered expiry');
 assert.equal(A.verifySession(undefined,now,env),false);assert.equal(A.verifySession(tok,now,{}),false,'no password, no admin');
 const o=A.cookieOptions();assert.equal(o.httpOnly,true);assert.equal(o.secure,true);assert.equal(o.sameSite,'strict');
 const lock=A.createLockout();for(let i=0;i<4;i++)lock.fail('1.2.3.4',now);assert.equal(lock.locked('1.2.3.4',now),false);
 lock.fail('1.2.3.4',now);assert.equal(lock.locked('1.2.3.4',now),true,'locked after 5 failures');assert.equal(lock.locked('5.6.7.8',now),false);
 assert.equal(lock.locked('1.2.3.4',now+15*60_000+1),false,'the lock lifts after 15 minutes');
 const g=A.createLockout();for(let i=0;i<50;i++)g.fail('10.0.0.'+i,now);assert.equal(g.locked('9.9.9.9',now),true,'global ceiling against spread-out guessing');
 assert.equal(A.sameOrigin('https://futbolisland.app','futbolisland.app'),true);assert.equal(A.sameOrigin('https://evil.app','futbolisland.app'),false);assert.equal(A.sameOrigin(null,'x'),false);
 const secret='0123456789abcdef-cron';
 assert.equal(A.cronAuthorized(`Bearer ${secret}`,secret),true);assert.equal(A.cronAuthorized(`Bearer ${secret}x`,secret),false);
 assert.equal(A.cronAuthorized(null,secret),false);assert.equal(A.cronAuthorized('Bearer short','short'),false,'no (or a weak) CRON_SECRET: the cron refuses');
 assert.equal(A.cronAuthorized('Bearer undefined',undefined),false);
 // Server-side enforcement in the page and every admin/cron route.
 const page=read('app/admin/page.tsx'),api=read('app/api/admin/analytics/route.ts'),login=read('app/api/admin/login/route.ts'),cron=read('app/api/cron/analytics/route.ts');
 assert(page.indexOf('verifySession(')>0&&page.indexOf('verifySession(')<page.indexOf('buildReport('),'the page checks the session before building a report');
 assert(/if\(!verifySession\(cookies\(\)\.get\(ADMIN_COOKIE\)\?\.value,Date\.now\(\)\)\)return Response\.json\(\{error:'unauthorized'\},\{status:401/.test(api)&&api.indexOf('status:401')<api.indexOf('buildReport('),'the data route answers 401 without a session');
 assert(/sameOrigin\(/.test(login)&&/lockout\.locked\(/.test(login)&&/passwordMatches\(/.test(login),'login: origin check, lockout, constant-time compare');
 assert(cron.indexOf('cronAuthorized(')>0&&cron.indexOf('cronAuthorized(')<cron.indexOf('finalize('),'cron: secret checked before any work');
 assert(/robots:\{index:false,follow:false/.test(read('app/admin/layout.tsx')),'noindex metadata');
 assert(/source: '\/admin', headers: \[\{ key: 'X-Robots-Tag', value: 'noindex, nofollow' \}/.test(read('next.config.mjs')),'X-Robots-Tag header');
 assert(!/\/admin/.test(read('components/Town.tsx'))&&!/\/admin/.test(read('components/IslandSettings.tsx')),'not linked from the game');
 assert(!/NavigationButton[^>]*immediate|BackButton[^>]*immediate/.test(read('app/admin/AnalyticsDashboard.tsx')),'nav buttons keep the shrink-to-icon animation');
});

// Shared fixture for the aggregation and SQL groups: one day of sessions and beats with every rule exercised.
const DAY='2026-10-05',iso=(h,m,s=0,ms=0)=>`${DAY}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(3,'0')}Z`;
const hx=c=>c.repeat(32);
const st=(id,hash,startedAt,extra={})=>({id,day:DAY,visitorHash:hash,startedAt,entryPath:'/',country:'GB',region:'ENG',device:'phone',source:'direct',referrerHost:null,utmSource:null,utmMedium:null,utmCampaign:null,...extra});
const FIX_STARTS=[
 st('sessA_aaaaaaaaaaaaaa',hx('a'),iso(9,15)),// bounce: no beats
 st('sessB_bbbbbbbbbbbbbb',hx('a'),iso(9,20)),// same visitor, three beats
 st('sessC_cccccccccccccc',hx('b'),iso(18,0),{country:'US',region:'CA',device:'desktop',source:'search',referrerHost:'google.com'}),
 st('sessD_dddddddddddddd',hx('c'),iso(23,58),{source:'campaign',utmSource:'newsletter',utmMedium:'email',utmCampaign:'spring',entryPath:'/museum'}),// beat crosses midnight
 st('sessE_eeeeeeeeeeeeee',hx('d'),iso(12,0),{country:null,region:null,device:'tablet'}),// forged beat larger than elapsed
 st('sessF_ffffffffffffff',hx('e'),iso(14,0),{region:null,referrerHost:'myclub.org',utmCampaign:'only-campaign',source:'campaign'}),
 {...st('sessX_xxxxxxxxxxxxxx',hx('f'),'2026-10-04T20:00:00.000Z'),day:'2026-10-04'},// another day
];
const bt=(sessionId,ts,engagedMs,pageviews=0,areaMs={})=>({sessionId,ts,engagedMs,pageviews,areaMs});
const FIX_BEATS=[
 bt('sessB_bbbbbbbbbbbbbb',iso(9,23),180000,1,{island:150000,paths:30000}),
 bt('sessB_bbbbbbbbbbbbbb',iso(9,26),150000,0,{island:150000}),
 bt('sessB_bbbbbbbbbbbbbb',iso(9,27,30,250),40000,2,{arcade:40000}),
 bt('sessC_cccccccccccccc',iso(18,10),300000,0,{arcade:300000}),
 bt('sessC_cccccccccccccc',iso(18,15),280000,1,{arcade:280000}),
 bt('sessD_dddddddddddddd','2026-10-06T00:03:00.000Z',250000,3,{museum:250000}),
 bt('sessE_eeeeeeeeeeeeee',iso(12,0,5),300000,0,{island:300000}),
 bt('sessF_ffffffffffffff',iso(14,0,9,500),9000,0,{}),
 bt('sessX_xxxxxxxxxxxxxx','2026-10-04T20:05:00.000Z',60000,0,{island:60000}),
];

// 7. Aggregation maths (the TypeScript reference the SQL must match).
await ok('aggregation',async()=>{
 const sessions=C.deriveSessions(FIX_STARTS,FIX_BEATS),by=Object.fromEntries(sessions.map(s=>[s.id,s]));
 assert.equal(by.sessA_aaaaaaaaaaaaaa.engagedMs,0);assert.equal(by.sessA_aaaaaaaaaaaaaa.pageviews,1);
 assert.equal(by.sessB_bbbbbbbbbbbbbb.engagedMs,370000);assert.equal(by.sessB_bbbbbbbbbbbbbb.pageviews,4);
 assert.equal(by.sessE_eeeeeeeeeeeeee.engagedMs,65000,'capped at 5 s elapsed + 60 s');
 const r=C.rollupDay(DAY,sessions);
 assert.equal(r.sessions,6);assert.equal(r.visitors,5);assert.equal(r.pageviews,1+4+2+4+1+1);assert.equal(r.bounces,2,'A (no beats) and F (9.5 s, one page)');
 assert.equal(r.engagedMs,0+370000+580000+250000+65000+9000);
 assert.deepEqual(J(r.dims.country.GB),{s:4,v:3,pv:10});assert.deepEqual(J(r.dims.country['(unknown)']),{s:1,v:1,pv:1});
 assert.deepEqual(Object.keys(r.dims.region).sort(),['GB-ENG','US-CA']);
 assert.deepEqual(Object.keys(r.dims.campaign).sort(),['only-campaign · — / —','spring · newsletter / email']);
 assert.deepEqual(J(r.areaMs),{island:300000+300000,paths:30000,arcade:40000+580000,museum:250000});
 assert.equal(r.hist.reduce((a,b)=>a+b,0),6);assert.equal(r.hist[0],1);assert.equal(r.hist[C.lengthBucket(9000)],1);assert.equal(C.lengthBucket(9_999),1);assert.equal(C.lengthBucket(10_000),2);
 const m=C.mergeRollups([r,C.rollupDay('2026-10-06',[]),C.rollupDay('2026-10-04',sessions)]);
 assert.equal(m.totals.sessions,7);assert.equal(m.totals.visitors,6,'visitors are summed daily uniques');
 assert.equal(m.totals.avgMs,Math.round((r.engagedMs+60000)/7));assert.equal(m.totals.bounceRate,2/7);
 assert.deepEqual(J(m.dims.country.map(x=>[x.key,x.visitors,x.sessions])),[['GB',4,5],['(unknown)',1,1],['US',1,1]]);
 assert.equal(C.histMedianMs(C.LENGTH_EDGES.map(()=>0)),0);
 const h=C.LENGTH_EDGES.map(()=>0);h[C.lengthBucket(60_000)]=2;assert.equal(C.histMedianMs(h),75_000,'interpolates inside the bucket (60–90 s, halfway)');
 const h2=C.LENGTH_EDGES.map(()=>0);for(const ms of [5000,9000,30000,30000,120000,600000])h2[C.lengthBucket(ms)]++;
 assert.equal(C.histMedianMs(h2),37_500,'six sessions: the 3rd falls halfway into the 30–45 s bucket');
 assert.deepEqual(J(C.displayDistribution(h2).map(b=>b.sessions)),[2,0,2,1,0,1,0,0]);
 const hours=C.hourlySeries(DAY,FIX_STARTS,FIX_BEATS);
 assert.equal(hours.length,24);assert.deepEqual(J(hours[9]),{key:DAY+'T09',visitors:1,sessions:2,pageviews:2+3});
 assert.deepEqual(J(hours[23]),{key:DAY+'T23',visitors:1,sessions:1,pageviews:1},'the next day\'s beat is not counted on this day');
 const now=new Date('2026-10-07T12:00:00Z');
 assert.deepEqual(J(C.resolveRange({range:'today'},now)),{from:'2026-10-07',to:'2026-10-07'});
 assert.deepEqual(J(C.resolveRange({range:'7d'},now)),{from:'2026-10-01',to:'2026-10-07'});
 assert.deepEqual(J(C.resolveRange({range:'30d'},now)),{from:'2026-09-08',to:'2026-10-07'});
 assert.deepEqual(J(C.resolveRange({range:'custom',from:'2026-10-09',to:'2026-10-02'},now)),{from:'2026-10-02',to:'2026-10-07'},'future end clamps to today, reversed ranges swap');
 assert.deepEqual(J(C.resolveRange({range:'custom',from:'2020-01-01',to:'2026-10-07'},now)),{from:'2025-10-07',to:'2026-10-07'},'custom ranges cap at 366 days');
 assert.equal(C.classifySource('duckduckgo.com',null),'search');assert.equal(C.classifySource('l.facebook.com',null),'social');assert.equal(C.classifySource('t.co',null),'social');
 assert.equal(C.classifySource('myclub.org',null),'referral');assert.equal(C.classifySource(null,{}),'direct');assert.equal(C.classifySource('google.com',{campaign:'x'}),'campaign');
 assert.equal(C.deviceClass('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)'),'tablet');assert.equal(C.deviceClass('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',true),'tablet');
 assert.equal(C.deviceClass('Mozilla/5.0 (Linux; Android 14; SM-X200)'),'tablet');assert.equal(C.deviceClass('Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile'),'phone');
 assert.equal(C.deviceClass('Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),'desktop');
 // The report reads aggregates only: frozen rollups + computed raw days; one-day ranges are hourly; "on now" is 5 minutes.
 const store=S.createMemoryStore();
 for(const s of FIX_STARTS)store.data.starts[s.id]=s;store.data.beats.push(...FIX_BEATS);
 const rep=await R.buildReport(store,{from:'2026-10-04',to:'2026-10-07'},now);
 assert.equal(rep.configured,true);assert.equal(rep.granularity,'day');assert.equal(rep.series.length,4);assert.equal(rep.totals.sessions,7);
 assert.deepEqual(J(rep.series.map(p=>p.sessions)),[1,6,0,0]);
 const one=await R.buildReport(store,{from:DAY,to:DAY},now);assert.equal(one.granularity,'hour');assert.equal(one.series.length,24);assert.deepEqual(J(one.series),J(hours));
 store.data.starts.live_session_000001={...st('live_session_000001',hx('9'),'2026-10-07T11:00:00.000Z'),day:'2026-10-07'};
 store.data.beats.push(bt('live_session_000001','2026-10-07T11:56:00.000Z',1000));
 assert.equal((await R.buildReport(store,{from:'2026-10-07',to:'2026-10-07'},now)).live,1,'on now = an event in the last 5 minutes');
 assert.equal((await R.buildReport(store,{from:'2026-10-07',to:'2026-10-07'},now)).series.length,13,'today stops at the current hour');
 assert.equal((await R.buildReport(store,{from:'2026-10-07',to:'2026-10-07'},new Date('2026-10-07T12:02:00Z'))).live,0);
 assert.equal((await R.buildReport(null,{from:'2026-10-07',to:'2026-10-07'},now)).configured,false,'no store: not configured');
 const file=path.join(os.tmpdir(),`fi-analytics-${process.pid}.json`);const fstore=S.createMemoryStore(file);await fstore.salt('2026-10-07');
 assert.equal(Object.keys(S.createMemoryStore(file).data.salts).length,1,'the local file store persists');fs.unlinkSync(file);
 const rpt=read('lib/analytics/report.ts'),sto=read('lib/analytics/store.ts');
 assert(!/MAX_ROWS|Range-Unit|analytics_sessions\?select=\*/.test(sto),'the Supabase store never pages raw rows into the function');
 assert(!/\.sessions\(|\.pageviews\(/.test(rpt),'the report reads aggregates only');
});

// 8. Nightly roll-up (cron) and the ingest route doing no maintenance.
await ok('cron rollup',async()=>{
 const store=S.createMemoryStore();
 for(const s of FIX_STARTS)store.data.starts[s.id]=s;store.data.beats.push(...FIX_BEATS);
 assert.equal(S.isFinal(DAY,new Date('2026-10-07T01:59:00Z')),false);assert.equal(S.isFinal(DAY,new Date('2026-10-07T02:00:00Z')),true,'final at D+2 02:00 UTC');
 const r1=await store.finalize(new Date('2026-10-06T02:30:00Z'));
 assert.deepEqual(J(r1.frozen).filter(d=>d>='2026-10-04'),['2026-10-04'],'D-2 freezes; D-1 waits for late beats');
 const r2=await store.finalize(new Date('2026-10-07T02:30:00Z'));assert.deepEqual(J(r2.frozen),[DAY]);
 assert.deepEqual(J(store.data.rollups[DAY]),J(C.rollupDay(DAY,C.deriveSessions(FIX_STARTS,FIX_BEATS))));
 assert.deepEqual(J((await store.finalize(new Date('2026-10-07T03:00:00Z'))).frozen),[],'idempotent');
 // Frozen days are read from the rollup, not recomputed.
 store.data.beats.push(bt('sessA_aaaaaaaaaaaaaa',iso(9,16),100000));
 assert.equal((await R.buildReport(store,{from:DAY,to:DAY},new Date('2026-10-07T12:00:00Z'))).totals.engagedMs,store.data.rollups[DAY].engagedMs);
 const vercel=JSON.parse(read('vercel.json'));
 assert((vercel.crons||[]).some(c=>c.path==='/api/cron/analytics'&&c.schedule==='30 2 * * *'),'the nightly analytics cron is scheduled (other crons may sit beside it)');
 const visit=read('app/api/visit/route.ts');
 assert(!/maintain|finalize|rollup/i.test(visit.replace(/\/\*[\s\S]*?\*\//g,'')),'/api/visit does one insert and nothing else');
});

// 9. Tracker: privacy switches, the flush model and the heat budget.
await ok('tracker',async()=>{
 function env({nav={},search='',host='futbolisland.app',pathname='/',referrer='',visibility='visible',store={}}={}){
  const listeners={},timers=new Map();let id=0,t=0,seed=0;const sent=[];
  const w={location:{hostname:host,pathname,search},addEventListener:(k,f)=>{(listeners[k]??=[]).push(f);},removeEventListener:(k,f)=>{listeners[k]=(listeners[k]||[]).filter(x=>x!==f);},
   setTimeout:(f,ms)=>{timers.set(++id,{f,at:t+ms,ms});return id;},clearTimeout:i=>{timers.delete(i);}};
  const d={visibilityState:visibility,referrer,addEventListener:w.addEventListener,removeEventListener:w.removeEventListener};
  const n={sendBeacon:(u,b)=>{assert.equal(u,'/api/visit');sent.push(JSON.parse(b));return true;},maxTouchPoints:5,...nav};
  const storage={getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v;}};
  const e={window:w,document:d,navigator:n,storage,now:()=>t,random:k=>{seed++;return new Uint8Array(k).map((_,i)=>(i*7+seed*53)&255);}};
  return {e,sent,timers,store,d,
   advance(ms){const end=t+ms;for(;;){const due=[...timers].filter(([,x])=>x.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!due)break;t=due[1].at;timers.delete(due[0]);due[1].f();}t=end;},
   fire(k){for(const f of listeners[k]||[])f();},hide(){d.visibilityState='hidden';this.fire('visibilitychange');},show(){d.visibilityState='visible';this.fire('visibilitychange');}};
 }
 for(const [nav,label] of [[{doNotTrack:'1'},'DNT'],[{globalPrivacyControl:true},'GPC'],[{webdriver:true},'Playwright']]){const x=env({nav});assert.equal(T.startTracker(x.e),null,label+' sends nothing');}
 const pre=env({search:'?preview=all'});assert.equal(T.startTracker(pre.e),null);assert.equal(T.skipReason({...pre.e,window:{...pre.e.window,location:{hostname:'futbolisland.app',pathname:'/arcade',search:''}}}),'preview','preview mode sticks for the tab');
 assert.equal(T.startTracker(env({host:'localhost'}).e),null,'local dev sends nothing');assert.equal(T.startTracker(env({pathname:'/motion-lab'}).e),null,'labs send nothing');
 assert.equal(T.startTracker(env({pathname:'/admin'}).e),null,'admin visits are not counted');
 const x=env({search:'?utm_source=club&utm_campaign=autumn',referrer:'https://www.google.com/search?q=futbol'});
 const tr=T.startTracker(x.e);tr.pageview('/');
 assert.equal(x.sent.length,1);const start=x.sent[0];
 assert.deepEqual(Object.keys(start).sort(),['p','r','s','t','tp','u','v']);assert.equal(start.t,'start');assert.equal(start.r,'www.google.com','host only');assert.deepEqual(start.u,{source:'club',campaign:'autumn'});
 assert.equal(C.validateEvent(JSON.stringify(start)).ok,true,'what the tracker sends passes validation');
 assert(!x.store['fi-visit'].includes('google'),'sessionStorage holds only the id and a timestamp');
 assert.equal(x.timers.size,1,'one safety timer while visible');
 const delay=[...x.timers.values()][0].ms;assert(delay>=144_000&&delay<=216_000,'safety ping is 3 min ±20%: '+delay);
 x.advance(60_000);tr.pageview('/arcade');tr.pageview('/museum');
 assert.equal(x.sent.length,1,'route changes send nothing on their own');
 const off=T.enterArea('paths');x.advance(20_000);off();
 x.hide();assert.equal(x.sent.length,2);const b1=x.sent[1];
 assert.equal(b1.t,'beat');assert.equal(b1.e,80_000);assert.equal(b1.n,2,'page views ride along in the beat');
 assert.deepEqual(b1.a,{island:60_000,paths:20_000},'Paths time is attributed while the menu is open');
 assert.equal(C.validateEvent(JSON.stringify(b1)).ok,true);
 assert.equal(x.timers.size,0,'no timers while hidden');
 x.advance(10*60_000);assert.equal(x.sent.length,2,'nothing sent while hidden');
 x.fire('pagehide');assert.equal(x.sent.length,2,'no empty beacon');
 x.show();assert.equal(x.timers.size,1);
 // Visible and used: about one safety beat per 3 minutes.
 for(let i=0;i<9;i++){x.advance(60_000);x.fire('pointerdown');}
 const beats=x.sent.filter(s=>s.t==='beat').length-1;assert(beats>=2&&beats<=4,'~3 safety beats in 9 busy minutes, got '+beats);
 // Idle: after 10 minutes without input the timer stops and the time stops counting.
 x.advance(30*60_000);assert.equal(x.timers.size,0,'idle tabs hold no timer');
 x.hide();const total=x.sent.slice(2).reduce((n,s)=>n+(s.e||0),0);assert(total<=9*60_000+10*60_000+1000,'idle time is not counted: '+total);
 x.show();x.fire('pointerdown');assert.equal(x.timers.size,1,'input wakes the ping');
 tr.stop();assert.equal(x.timers.size,0);
 // A whole 10-minute session costs a handful of writes.
 const z=env();const tz=T.startTracker(z.e);tz.pageview('/');for(let i=0;i<10;i++){z.advance(60_000);z.fire('pointerdown');if(i===4)tz.pageview('/arcade');}z.hide();z.fire('pagehide');tz.stop();
 assert(z.sent.length>=3&&z.sent.length<=6,'3–6 writes for a 10-minute session, got '+z.sent.length);
 // A tab hidden for over 30 minutes starts a fresh session on return.
 const y=env();const t2=T.startTracker(y.e);t2.pageview('/');const first=y.sent[0].s;y.hide();
 const saved=JSON.parse(y.store['fi-visit']);y.store['fi-visit']=JSON.stringify({...saved,at:saved.at-31*60_000});y.show();
 assert.equal(y.sent.slice(-1)[0].t,'start');assert.notEqual(y.sent.slice(-1)[0].s,first);t2.stop();
 const src=read('lib/analytics/tracker.ts');
 assert(!/localStorage|document\.cookie|setInterval|requestAnimationFrame/.test(src.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'')),'no localStorage, cookies, intervals or frame loops');
 const comp=read('components/VisitTracker.tsx');assert(/return null;/.test(comp)&&!/useState/.test(comp),'the component never re-renders on its own');
});

// 10. The SQL itself, on a throwaway local Postgres: RLS/grants, caps, and aggregates equal to the TypeScript reference.
await ok('sql',async()=>{
 const bin=n=>{for(const d of (process.env.PATH||'').split(':').concat(['/opt/homebrew/bin','/usr/local/bin','/usr/lib/postgresql/16/bin','/usr/lib/postgresql/15/bin','/usr/lib/postgresql/14/bin'])){const f=path.join(d,n);if(fs.existsSync(f))return f;}return null;};
 const initdb=bin('initdb'),pgctl=bin('pg_ctl'),psqlBin=bin('psql');
 if(process.env.SKIP_PG_TESTS||!initdb||!pgctl||!psqlBin){console.log('  SKIP sql: no local Postgres (initdb/pg_ctl/psql) found');return 'skip';}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fipg-')),port=String(40000+process.pid%20000);
 const quiet={stdio:['ignore','ignore','pipe']};
 try{
  cp.execFileSync(initdb,['-D',path.join(dir,'data'),'-U','postgres','--auth=trust','-E','UTF8','--locale=C'],quiet);
  cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-o',`-k ${dir} -p ${port} -c listen_addresses='' -c fsync=off -c TimeZone=UTC`,'-w','-l',path.join(dir,'log'),'start'],quiet);
  const args=['-h',dir,'-p',port,'-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-qAt'];
  const psql=(sql,{role}={})=>cp.execFileSync(psqlBin,[...args,'-c',(role?`set role ${role}; `:'')+sql],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const fails=(sql,role)=>{const r=cp.spawnSync(psqlBin,[...args,'-c',`set role ${role}; ${sql}`],{encoding:'utf8'});return r.status!==0?r.stderr:'';};
  psql('create role anon; create role authenticated; create role service_role bypassrls;');// as in Supabase: only service_role bypasses RLS
  // The live migration, then the additive ones on top, in order (as in production).
  for(const f of ['supabase/migrations/20261007_analytics.sql','supabase/migrations/20261008_analytics_places.sql','supabase/migrations/20261009_analytics_counts.sql'])cp.execFileSync(psqlBin,[...args,'-f',f],{stdio:['ignore','ignore','pipe']});
  // RLS and grants: the public roles get nothing; the service role gets the functions.
  for(const role of ['anon','authenticated']){
   assert.match(fails('select count(*) from analytics_sessions',role),/permission denied/);
   assert.match(fails('insert into analytics_beats (session_id) values (\'x\')',role),/permission denied/);
   assert.match(fails('select analytics_salt(current_date)',role),/permission denied/);
   assert.match(fails(`select analytics_ingest('{}'::jsonb)`,role),/permission denied/);
  }
  assert.equal(psql(`select bool_and(relrowsecurity) from pg_class where relname in ('analytics_sessions','analytics_beats','analytics_daily','analytics_salts')`),'t');
  // Salts rotate and are created once per day.
  const s1=psql(`select analytics_salt('2026-10-07')`,{role:'service_role'}),s1b=psql(`select analytics_salt('2026-10-07')`,{role:'service_role'}),s2=psql(`select analytics_salt('2026-10-08')`,{role:'service_role'});
  assert.match(s1,/^[0-9a-f]{64}$/);assert.equal(s1,s1b);assert.notEqual(s1,s2);
  // Fixture rows, inserted as they would be stored, then the aggregates compared with the TypeScript reference.
  const q=v=>v===null?'null':`'${String(v).replace(/'/g,"''")}'`;
  psql('insert into analytics_sessions (id,day,visitor_hash,started_at,entry_path,country,region,device,source,referrer_host,utm_source,utm_medium,utm_campaign) values '+
   FIX_STARTS.map(s=>`(${[s.id,s.day,s.visitorHash,s.startedAt,s.entryPath,s.country,s.region,s.device,s.source,s.referrerHost,s.utmSource,s.utmMedium,s.utmCampaign].map(q).join(',')})`).join(','));
  psql('insert into analytics_beats (session_id,ts,engaged_ms,pageviews,area_ms) values '+FIX_BEATS.map(b=>`(${q(b.sessionId)},${q(b.ts)},${b.engagedMs},${b.pageviews},${q(JSON.stringify(b.areaMs))})`).join(','));
  const ref=J(C.rollupDay(DAY,C.deriveSessions(FIX_STARTS,FIX_BEATS)));
  assert.deepEqual(JSON.parse(psql(`select analytics_day_rollup('${DAY}')`,{role:'service_role'})),ref,'SQL day rollup = TypeScript reference');
  assert.deepEqual(JSON.parse(psql(`select analytics_day_rollup('2026-10-04')`,{role:'service_role'})),J(C.rollupDay('2026-10-04',C.deriveSessions(FIX_STARTS,FIX_BEATS))));
  assert.deepEqual(JSON.parse(psql(`select analytics_day_rollup('2026-09-01')`,{role:'service_role'})),J(C.rollupDay('2026-09-01',[])),'an empty day has the same shape');
  assert.deepEqual(JSON.parse(psql(`select analytics_hourly('${DAY}')`,{role:'service_role'})),J(C.hourlySeries(DAY,FIX_STARTS,FIX_BEATS)),'SQL hourly = TypeScript reference');
  assert.equal(psql(`select analytics_live('${iso(18,12)}')`,{role:'service_role'}),'2','live: sessions with an event since the cut-off (C at 18:15, D at 23:58)');
  // Live ingest: caps, clamps, orphans, the 24 h window.
  const today=new Date().toISOString().slice(0,10),hash=hx('7');
  psql(`do $$ begin for i in 1..155 loop perform analytics_ingest(jsonb_build_object('type','start','session','capcapcapcapcap'||lpad(i::text,6,'0'),'path','/','day','${today}','visitor_hash','${hash}','device','phone','source','direct')); end loop; end $$;`,{role:'service_role'});
  assert.equal(psql(`select count(*) from analytics_sessions where visitor_hash='${hash}'`),'150','150 sessions per visitor hash per day');
  psql(`select analytics_ingest('{"type":"start","session":"capcapcapcapcap000001","path":"/","day":"${today}","visitor_hash":"${hx('8')}","device":"phone","source":"direct"}')`,{role:'service_role'});
  assert.equal(psql(`select visitor_hash from analytics_sessions where id='capcapcapcapcap000001'`),hash,'a repeated start is ignored');
  const beat=(sid,e)=>psql(`select analytics_ingest('{"type":"beat","session":"${sid}","engaged_ms":${e},"pageviews":2,"area_ms":{"island":${e},"bedroom":5}}')`,{role:'service_role'});
  beat('capcapcapcapcap000002',999999);beat('NoSuchSessionNoSuch1',1000);
  assert.equal(psql(`select engaged_ms||' '||pageviews||' '||area_ms::text from analytics_beats where session_id='capcapcapcapcap000002'`),'300000 2 {"island": 300000}','clamped, unknown areas dropped');
  assert.equal(psql(`select count(*) from analytics_beats where session_id='NoSuchSessionNoSuch1'`),'0','orphan beats are dropped');
  psql(`update analytics_sessions set started_at=now()-interval '25 hours' where id='capcapcapcapcap000003'`);beat('capcapcapcapcap000003',1000);
  assert.equal(psql(`select count(*) from analytics_beats where session_id='capcapcapcapcap000003'`),'0','no beats after 24 h');
  psql(`do $$ begin for i in 1..305 loop perform analytics_ingest('{"type":"beat","session":"capcapcapcapcap000004","engaged_ms":1000}'::jsonb); end loop; end $$;`,{role:'service_role'});
  assert.equal(psql(`select count(*) from analytics_beats where session_id='capcapcapcapcap000004'`),'300','300 beats per session');
  const fnSrc=read('supabase/migrations/20261007_analytics.sql');assert(!/for update|\bupdate (public\.)?analytics_/i.test(fnSrc),'no row locks or updates on the write path');
  // Nightly finalize: freezes final days (rollup = reference), skips not-final ones, purges raw > 14 days and old salts.
  const add=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
  // fin: a final day (>= 2 days old, inside the 14-day raw window) that no fixture session already uses, so the test holds on any date.
  const used=new Set(psql(`select coalesce(string_agg(distinct day::text,','),'') from analytics_sessions`).split(',').filter(Boolean));
  const fin=[-5,-6,-7,-8,-9].map(n=>add(today,n)).find(d=>!used.has(d)&&d!==DAY)||add(today,-5),young=add(today,-1),old=add(today,-20);
  psql(`update analytics_beats set ts=ts + ('${fin}'::date - '${DAY}'::date) * interval '1 day' where session_id in (select id from analytics_sessions where day='${DAY}')`);
  psql(`update analytics_sessions set day='${fin}', started_at=started_at + ('${fin}'::date - '${DAY}'::date) * interval '1 day' where day='${DAY}'`);
  psql(`insert into analytics_sessions (id,day,visitor_hash,started_at,entry_path,device,source) values ('young_session_000001','${young}','${hx('1')}','${young}T10:00:00Z','/','phone','direct'),('old_session_00000001','${old}','${hx('2')}','${old}T10:00:00Z','/','phone','direct')`);
  psql(`insert into analytics_beats (session_id,ts,engaged_ms) values ('old_session_00000001','${old}T10:01:00Z',5000)`);
  psql(`insert into analytics_salts values ('${add(today,-1)}','old'),('${add(today,-3)}','older') on conflict (day) do nothing`); // the fixed test DAY can be today-1 on a later date
  const before=JSON.parse(psql(`select analytics_day_rollup('${fin}')`,{role:'service_role'}));
  const frozen=JSON.parse(psql(`select analytics_finalize('${today}')`,{role:'service_role'}));
  assert(frozen.includes(fin)&&!frozen.includes(young)&&!frozen.includes(today),'freezes final days only: '+frozen.join(','));
  assert.deepEqual(JSON.parse(psql(`select data from analytics_daily where day='${fin}'`)),before);
  assert.equal(before.sessions,6);assert.equal(before.engagedMs,ref.engagedMs,'the frozen day matches the reference after the date shift');
  assert.equal(psql(`select count(*) from analytics_sessions where day='${old}'`),'0','raw rows older than 14 days are purged');
  assert.equal(psql(`select count(*) from analytics_beats where session_id='old_session_00000001'`),'0','their beats cascade');
  assert.equal(psql(`select count(*) from analytics_salts where day < '${today}'`),'0','no salt from before today is left');
  assert.equal(psql(`select analytics_finalize('${today}')`,{role:'service_role'}),'[]','idempotent');
  assert.equal(JSON.parse(psql(`select analytics_days('${add(today,-30)}','${add(today,5)}')`,{role:'service_role'}))[0].day,add(today,-14),'computed days are clamped to the raw window');
 }finally{
  try{cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-m','immediate','-w','stop'],quiet);}catch{}
  fs.rmSync(dir,{recursive:true,force:true});
 }
});

// 11. Wiring: production-only mount, Vercel Analytics kept, migration locks the tables down.
await ok('wiring',async()=>{
 const layout=read('app/layout.tsx');
 assert(!/@vercel\/analytics|<Analytics\/>/.test(layout),'Vercel Web Analytics removed Oct 7 2026; the first-party counter replaces it');
 assert(/const VISITS = process\.env\.VERCEL_ENV === 'production'/.test(layout)&&/\{VISITS && <VisitTracker/.test(layout),'the tracker mounts on production deployments only');
 const sql=read('supabase/migrations/20261007_analytics.sql');
 for(const t of ['analytics_sessions','analytics_beats','analytics_daily','analytics_salts'])assert(new RegExp(`alter table public\\.${t}\\s+enable row level security`).test(sql),t+' has RLS');
 assert(!/create policy/i.test(sql),'no policies: anon and authenticated get nothing');
 assert(/revoke all on public\.analytics_sessions, public\.analytics_beats, public\.analytics_daily, public\.analytics_salts from anon, authenticated/.test(sql));
 assert(/from public, anon, authenticated;\ngrant execute on function [^;]* to service_role;/.test(sql),'functions callable by the service role only');
 assert(!/\b(ip|user_agent|city|latitude|longitude|email)\b\s+(text|inet)/i.test(sql),'no PII columns');
 assert(!/NEXT_PUBLIC_[A-Z_]*SERVICE/.test(read('lib/analytics/store.ts')),'the service key is never public');
 assert(!/analytics\/(store|ingest|adminAuth|report)/.test(read('components/VisitTracker.tsx')+read('app/admin/AnalyticsDashboard.tsx')+read('app/admin/charts.tsx')),'server modules stay out of client bundles');
});
console.log(`admin-analytics: ${passed} groups passed${skipped.length?`, skipped: ${skipped.join(', ')}`:''}`);
})().catch(e=>{console.error(e);process.exit(1);});
