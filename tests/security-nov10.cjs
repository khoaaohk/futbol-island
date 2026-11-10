#!/usr/bin/env node
// Security audit, Nov 10 2026: per-IP daily budgets trip before the site-wide caps, IPv6 /64 buckets, the admin lockout and
// session epoch, CSP report and error beacon parsing with caps, the leaderboard rate ceilings, and the admin "remove row" auth.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const {createLoader}=require('./summit-harness.cjs');
const load=createLoader({});
const read=f=>fs.readFileSync(f,'utf8');
const SV=load('lib/saves/server.ts'),ST=load('lib/saves/store.ts'),A=load('lib/analytics/adminAuth.ts'),R=load('lib/siteReports.ts');
const L=load('lib/arcade/leaderboard.ts'),BS=load('lib/arcade/leaderboardStore.ts'),BA=load('lib/arcade/leaderboardAdmin.ts');
let n=0;const ok=async(name,fn)=>{try{await fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const hdr=ip=>{const m=new Map(Object.entries({host:'futbolisland.app','x-forwarded-for':ip}));return {get:k=>m.get(k.toLowerCase())??null};};
const PEPPER='pepper-for-tests-0123456789abcdef0123456789';

(async()=>{
await ok('per-IP daily create budget trips long before the site-wide cap',async()=>{
 const store=ST.createMemorySaveStore();let t=Date.UTC(2026,10,10,0,0,0),i=0;
 const deps={store,pepper:PEPPER,email:null,minAnswerMs:0,now:()=>new Date(t)};
 const create=async ip=>(await SV.handleSave('create',{bytes:Buffer.from(JSON.stringify({snapshot:{format:1,game:'2026-10-10',keys:{}}})),contentType:'application/json',headers:hdr(ip)},deps)).status;
 let okCount=0;
 for(let h=0;h<4;h++){t=Date.UTC(2026,10,10,h,1);for(let k=0;k<ST.LIMITS.createPerIp;k++){const s=await create('198.51.100.9');if(s===200)okCount++;}}
 assert.equal(okCount,ST.LIMITS.createPerIpDay,'one IP gets its 150 a day, across hours');
 assert(ST.LIMITS.createPerIpDay<ST.LIMITS.createPerDay/10);
 assert.equal(await create('198.51.100.10'),200,'another source is unaffected');
 const g=Object.entries(store.data.throttle).filter(([k])=>k.startsWith('c:global|')).reduce((a,[,v])=>a+v,0);
 assert.equal(g,ST.LIMITS.createPerDay>g?g:-1,'global spend');assert.equal(g,okCount+1,'a blocked IP spends no global budget');
 assert(ST.LIMITS.mailPerIpDay<ST.LIMITS.mailPerDay/10&&ST.LIMITS.lookupPerIpDay<=ST.LIMITS.hardStop);
 const src=read('lib/saves/server.ts');
 assert(/'m:'\+bucket[\s\S]{0,80}'md:'\+bucket[\s\S]{0,80}'m:global'/.test(src),'mail: hour, day, then global');
 assert(/'ld:'\+bucket,LIMITS\.lookupPerIpDay/.test(src)&&/return padded\(\{status:200,body:route==='email'\?\{ok:true\}:FAIL\}\)/.test(src),'lookup budget answers like a wrong code');
});
await ok('IPv6 sources are bucketed by /64',()=>{
 assert.equal(SV.ipSource('2001:db8:1:2:aaaa::1'),SV.ipSource('2001:0db8:0001:0002:ffff:1:2:3'));
 assert.notEqual(SV.ipSource('2001:db8:1:2::1'),SV.ipSource('2001:db8:1:3::1'));
 assert.equal(SV.ipSource('203.0.113.7'),'203.0.113.7');assert.equal(SV.ipSource('::ffff:203.0.113.7'),'203.0.113.7');
 assert.equal(SV.ipBucket('salt','2001:db8:1:2::5'),SV.ipBucket('salt','2001:db8:1:2:9::9'));
});
await ok('admin lockout is per IP, the global ceiling is high; session epoch signs everyone out',()=>{
 const now=Date.UTC(2026,10,10),lock=A.createLockout();
 for(let i=0;i<200;i++)lock.fail('10.1.'+(i>>8)+'.'+(i&255),now);
 assert.equal(lock.locked('9.9.9.9',now),false,'200 spread-out failures do not lock the owner out');
 assert(A.GLOBAL_MAX_FAILS>=1000);lock.lockFor('7.7.7.7',now,3600e3);assert(lock.locked('7.7.7.7',now+3599e3)&&!lock.locked('7.7.7.7',now+3601e3));
 const env={ADMIN_PASSWORD:'a long admin password'};
 const t0=A.signSession(now,env,0);assert(A.verifySession(t0,now,env,0));assert(!A.verifySession(t0,now,env,1),'bumped epoch: old cookie refused');
 const t1=A.signSession(now,env,1);assert(A.verifySession(t1,now,env,1)&&!A.verifySession(t1,now,env,0));
 // Epoch 0 keeps the pre-Nov-10 key, so a deploy signs nobody out.
 const k=crypto.createHmac('sha256',env.ADMIN_PASSWORD).update('futbol-island admin session v1').digest(),payload=t0.slice(0,t0.lastIndexOf('.'));
 assert.equal(t0.slice(t0.lastIndexOf('.')+1),crypto.createHmac('sha256',k).update(payload).digest('base64url'));
 const s={...env,ADMIN_SESSION_SECRET:'x'.repeat(40)},ts=A.signSession(now,s,0);assert(A.verifySession(ts,now,s,0)&&!A.verifySession(ts,now,env,0),'ADMIN_SESSION_SECRET keys the cookie');
 const login=read('app/api/admin/login/route.ts');assert(/loginBudget\(ip\)\)\)?lockout\.lockFor/.test(login.replace(/\s/g,''))||/if\(!await loginBudget\(ip\)\)lockout\.lockFor/.test(login));
 const so=read('app/api/admin/signout-all/route.ts');assert(so.indexOf('sameOrigin(')<so.indexOf('verifySession(')&&so.indexOf('verifySession(')<so.indexOf('bumpSessionEpoch()'));
 for(const f of fs.readdirSync('app/api/admin')){const p=`app/api/admin/${f}/route.ts`;if(!fs.existsSync(p)||/login|logout/.test(f))continue;const src=read(p);
  assert(/loadSessionEpoch\(\)/.test(src)&&src.indexOf('loadSessionEpoch()')<src.indexOf('verifySession(cookies'),p+': epoch loaded before the session check');}
});
await ok('CSP reports: both formats, host and path only, capped',()=>{
 const old=JSON.stringify({'csp-report':{'document-uri':'https://futbolisland.app/play?party=ABCD#x','violated-directive':'script-src-elem','effective-directive':'script-src-elem','blocked-uri':'https://evil.example.com/x.js?token=1'}});
 assert.deepEqual(R.parseCspReports(old),[{directive:'script-src-elem',blocked:'evil.example.com',path:'/play'}]);
 const api=JSON.stringify([{type:'csp-violation',url:'https://futbolisland.app/a',user_agent:'Mozilla',body:{documentURL:'https://futbolisland.app/cards/45?x=1',effectiveDirective:'img-src',blockedURL:'data'}},{type:'deprecation',body:{}},{type:'csp-violation',body:{documentURL:'https://futbolisland.app/',effectiveDirective:'script-src',blockedURL:'inline'}}]);
 assert.deepEqual(R.parseCspReports(api),[{directive:'img-src',blocked:'data',path:'/cards/45'},{directive:'script-src',blocked:'inline',path:'/'}]);
 assert.equal(R.parseCspReports(JSON.stringify(Array.from({length:50},()=>({type:'csp-violation',body:{effectiveDirective:'img-src',blockedURL:'https://a.b/c'}})))).length,R.MAX_REPORTS_PER_REQUEST);
 assert.deepEqual(R.parseCspReports('x'.repeat(R.MAX_REPORT_BYTES+1)),[]);assert.deepEqual(R.parseCspReports('{bad'),[]);assert.deepEqual(R.parseCspReports('{"a":1}'),[]);
 assert.equal(R.cleanPath('/play/striker-volley-corner-4271'),'/play/*','a code-shaped segment is masked');
 const key=R.cspKey(R.parseCspReports(old)[0]);assert(!/\?|token|Mozilla|ABCD/.test(key));
 const cfg=read('next.config.mjs');assert(/'report-uri \/api\/csp-report'/.test(cfg)&&/'report-to csp'/.test(cfg)&&/Reporting-Endpoints/.test(cfg)&&/Content-Security-Policy-Report-Only/.test(cfg)&&!/key: 'Content-Security-Policy',/.test(cfg),'wired, still report-only');
 const route=read('app/api/csp-report/route.ts');assert(/MAX_REPORT_BYTES/.test(route)&&/limiter\.allow/.test(route)&&!/user-agent/i.test(route));
});
await ok('error beacon: scrubbed, keyed, capped; store and limiter caps',async()=>{
 const r=R.parseErrorReport(JSON.stringify({m:'TypeError: x is undefined for kid@example.com code striker-volley-corner-4271 at https://futbolisland.app/play?party=Z 12345\nstack line',f:'https://futbolisland.app/_next/static/chunks/app.js?v=9',l:77,r:'/play?x=1'}),'futbolisland.app');
 assert.match(r.key,/^[0-9a-f]{8}\|\/play$/);assert(!/kid@|striker|party=|12345|\?v=|stack/.test(r.label),r.label);assert.match(r.label,/@ chunks\/app\.js:77$/);
 assert.equal(R.parseErrorReport(JSON.stringify({m:'x',stack:'secret'})),null,'unknown keys refused');assert.equal(R.parseErrorReport('x'.repeat(3000)),null);
 assert.match(R.parseErrorReport(JSON.stringify({m:'boom',f:'https://evil.example/x.js',l:1,r:'/'}),'futbolisland.app').label,/@ other:1$/);
 const mem=R.createMemoryReportStore();for(let i=0;i<600;i++)await mem.hit('err','k'+i,'');assert.equal(mem.data.size,500,'500 keys a day');
 assert.equal(await mem.hit('err','k1',''),true,'existing keys still count');const top=await mem.top('err',7,20);assert.equal(top.rows.length,20);assert.equal(top.rows[0].n,2);
 const lim=R.createReportLimiter();let a=0;for(let i=0;i<30;i++)if(lim.allow('1.2.3.4',0))a++;assert.equal(a,20);assert(lim.allow('5.6.7.8',0));
 const beacon=read('components/ErrorBeacon.tsx');{const body=beacon.match(/JSON\.stringify\(\{(m:[^;]*?)\}\);/)[1];assert(/MAX=3/.test(beacon)&&/sendBeacon/.test(beacon)&&/doNotTrack/.test(beacon)&&!/stack|userAgent|href|search/.test(body),'body: m, f, l, r only');}
 assert(/<ErrorBeacon\/>/.test(read('app/layout.tsx')));
});
await ok('leaderboard rate ceilings from the games\' real scoring',()=>{
 const p=L.BOARD_RULES.pinball;assert.equal(p.perSecond,1200);assert.equal(p.base,3000);
 assert.equal(L.scorePlausible('pinball',3000+1200*200+1,200_000),'fast');assert.equal(L.scorePlausible('pinball',150_000,200_000),'ok','a great 200 s match fits');
 assert.equal(L.scorePlausible('pinball',p.max,300_000),'fast','the ceiling now needs a 5.5-minute wait (was 2.6): the admin Remove row covers a patient faker');
 assert.equal(L.BOARD_RULES.live.perSecond,25);assert.equal(L.scorePlausible('live',3200,200_000),'ok');assert.equal(L.scorePlausible('live',20_000,200_000),'fast');
 assert.equal(L.BOARD_RULES.pinderby.perSecond,2700);assert.equal(L.BOARD_RULES.pinfinal.perSecond,4400);
});
await ok('remove row: soft delete hides from boards and ranking; auth + migration fallback',async()=>{
 const st=BS.createMemoryBoardStore(),wk=L.weekOf(Date.UTC(2026,10,10)),add=(score,i)=>st.submit({game:'pinball',score,initials:'ACE',icon:'',nonce:crypto.randomBytes(16).toString('hex'),claimHash:null,replace:null,day:'2026-11-10',week:wk});
 const fake=await add(399_000);for(let i=0;i<10;i++)await add(1000+i);
 let list=await BA.handleAdminBoard('list',{query:new URLSearchParams('game=pinball')},st);assert.equal(list.status,200);assert.equal(list.body.rows[0].score,399000);
 assert.equal((await BA.handleAdminBoard('hide',{body:JSON.stringify({id:fake.id,hidden:true})},st)).status,200);
 const top=await st.top('pinball',wk);assert(!top.all.some(r=>r.score===399000),'hidden from the board');assert.equal(top.all.length,10);
 assert.equal((await add(1005)).ok,true,'a real score is no longer blocked by the hidden row');
 list=await BA.handleAdminBoard('list',{query:new URLSearchParams('game=pinball')},st);assert.equal(list.body.rows.find(r=>r.id===fake.id).hidden,true);
 assert.equal((await BA.handleAdminBoard('hide',{body:JSON.stringify({id:fake.id,hidden:false})},st)).status,200);assert((await st.top('pinball',wk)).all.some(r=>r.score===399000),'restored');
 for(const b of ['{}','{"id":"1","hidden":true}','{"id":1}','nope'])assert.equal((await BA.handleAdminBoard('hide',{body:b},st)).status,400,b);
 assert.equal((await BA.handleAdminBoard('hide',{body:'{"id":999,"hidden":true}'},st)).status,404);
 assert.equal((await BA.handleAdminBoard('list',{query:new URLSearchParams('game=nope')},st)).status,400);assert.equal((await BA.handleAdminBoard('list',{},null)).status,503);
 // Supabase before the migration: board_hide / board_admin_list 404 -> 409 "migration" and a board_top fallback list.
 const fetch404=async(url)=>/board_top/.test(url)?new Response(JSON.stringify({all:[{id:5,initials:'ZOE',icon:'',score:9,day:'2026-11-10'}],week:[]}),{status:200}):new Response('',{status:404});
 const sb=BS.createSupabaseBoardStore('https://x.supabase.co','k',fetch404);
 assert.equal((await BA.handleAdminBoard('hide',{body:'{"id":5,"hidden":true}'},sb)).status,409);
 const l2=await BA.handleAdminBoard('list',{query:new URLSearchParams('game=pinball')},sb);assert.equal(l2.body.hidable,false);assert.equal(l2.body.rows[0].initials,'ZOE');
 const route=read('app/api/admin/board/route.ts');
 assert(/async function authed\(\)\{await loadSessionEpoch\(\);return verifySession\(cookies\(\)\.get\(ADMIN_COOKIE\)\?\.value,Date\.now\(\)\);\}/.test(route));
 const post=route.slice(route.indexOf('export async function POST'));assert(post.indexOf('sameOrigin(')<post.indexOf('authed()')&&post.indexOf('authed()')<post.indexOf('handleAdminBoard('),'POST: origin, then session, then action');
 const get=route.slice(route.indexOf('export async function GET'),route.indexOf('export async function POST'));assert(get.indexOf('authed()')<get.indexOf('handleAdminBoard('));
 const sql=read('supabase/migrations/20261111_board_hidden_rows.sql');assert((sql.match(/hidden_at is null/g)||[]).length>=5&&/grant execute on function public\.board_hide\(bigint, boolean\), public\.board_admin_list\(text, integer\) to service_role/.test(sql));
});
console.log(`security-nov10: ${n} groups passed`);
})().catch(e=>{console.error(e);process.exit(1);});
