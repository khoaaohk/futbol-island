#!/usr/bin/env node
// Admin analytics, "Learning" (Oct 9 2026): the counter allowlist (generated from the real lessons) and its validation, the
// tracker's overflow carry and byte budget, countSessions, small-number suppression, that no text or id is ever stored, the
// "storage needs update" banner, the start flags, the wiring, and the SQL (all three migrations in order on a throwaway
// Postgres) matching the TypeScript reference, including the migration's own self-check row.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),os=require('os'),cp=require('child_process');
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
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Buffer,URL,URLSearchParams,TextDecoder,Date,Math,JSON,process:{env:{}},console,
   require:id=>id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id)});
 loaded.set(file,m.exports);return m.exports;}
const K=load('lib/analytics/countIds.ts'),C=load('lib/analytics/core.ts'),S=load('lib/analytics/store.ts'),I=load('lib/analytics/ingest.ts'),
 R=load('lib/analytics/report.ts'),T=load('lib/analytics/tracker.ts'),LN=load('lib/analytics/learning.ts'),F=load('lib/analytics/startFlags.ts'),
 E=load('lib/analytics/learnEvents.ts'),TXT=load('lib/analytics/learningText.generated.ts');
const read=f=>fs.readFileSync(f,'utf8');
const J=x=>JSON.parse(JSON.stringify(x));
let passed=0;const skipped=[];const ok=(name,fn)=>Promise.resolve().then(fn).then(r=>{if(r==='skip')skipped.push(name);else passed++;},e=>{console.error('FAIL',name);throw e;});
const LESSONS=Object.fromEntries(['7v7','9v9','11v11','futsal'].map(f=>[f,JSON.parse(read(`public/lessons/${f}.json`))]));
const ALL=Object.entries(LESSONS).flatMap(([f,ls])=>ls.map(l=>({...l,f})));
const L0=LESSONS['7v7'][0],L1=LESSONS['futsal'][2];

const SID='LearnSessionLearn0001';
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
function headers(){const h={host:'futbolisland.app','user-agent':UA,'x-forwarded-for':'203.0.113.7','x-vercel-ip-country':'US','x-vercel-ip-country-region':'CA',origin:'https://futbolisland.app'};
 const m=new Map(Object.entries(h));return {get:k=>m.has(k.toLowerCase())?m.get(k.toLowerCase()):null};}
const T0=new Date('2026-10-09T10:00:00Z'),at=ms=>new Date(T0.getTime()+ms);
const ingest=(store,body,{now=T0}={})=>I.handleIngest({body:typeof body==='string'?body:JSON.stringify(body),headers:headers(),store,limiter:I.createLimiter({capacity:1e6}),now,vercelEnv:'production'});

// Fake browser (manual clock, timers and events), as in tests/admin-analytics-places.cjs.
function env({flags}={}){
 const listeners={},timers=new Map(),store={};let id=0,t=0,seed=0;const sent=[];
 const w={location:{hostname:'futbolisland.app',pathname:'/',search:''},addEventListener:(k,f)=>{(listeners[k]??=[]).push(f);},removeEventListener:(k,f)=>{listeners[k]=(listeners[k]||[]).filter(x=>x!==f);},
  setTimeout:(f,ms)=>{timers.set(++id,{f,at:t+ms,ms});return id;},clearTimeout:i=>{timers.delete(i);}};
 const d={visibilityState:'visible',referrer:'',addEventListener:w.addEventListener,removeEventListener:w.removeEventListener};
 const n={sendBeacon:(u,b)=>{sent.push({raw:b,...JSON.parse(b)});return true;},maxTouchPoints:0};
 const e={window:w,document:d,navigator:n,storage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v;}},now:()=>t,random:k=>{seed++;return new Uint8Array(k).map((_,i)=>(i*7+seed*53)&255);},flags};
 return {e,sent,timers,advance(ms){const end=t+ms;for(;;){const due=[...timers].filter(([,x])=>x.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!due)break;t=due[1].at;timers.delete(due[0]);due[1].f();}t=end;},
  fire(k){for(const f of listeners[k]||[])f();},hide(){d.visibilityState='hidden';this.fire('visibilitychange');}};
}
const strip=({raw,...b})=>b;

(async()=>{
// 1. The allowlist is generated from the real lessons, is fresh, and accepts exactly the real lesson/question/option indices.
await ok('allowlist',()=>{
 cp.execFileSync(process.execPath,['scripts/gen-learning-ids.cjs','--check'],{stdio:'pipe'});
 const table=load('lib/analytics/learningIds.generated.ts').LESSON_TABLE;
 assert.equal(table.length,ALL.length,'every lesson of the four formats');
 for(const l of ALL){assert.deepEqual(J(table.find(x=>x[1]===l.id)),[l.f,l.id,l.questions.map(q=>q.options.length).join('')]);}
 for(const [st] of K.LESSON_STAGES)assert(K.isCountId(`${st}:${L0.id}`),st);
 const last=L0.questions.length-1,opts=L0.questions[last].options.length;
 assert(K.isCountId(`q:${L0.id}:${last}`));assert(K.isCountId(`o:${L0.id}:${last}:${opts-1}`));
 for(const bad of [`q:${L0.id}:${last+1}`,`o:${L0.id}:0:${L0.questions[0].options.length}`,`o:${L0.id}:0`,'lo:no_such_lesson','lo:','zz:'+L0.id,`lo:${L0.id}:1`,'ob:seen:bedroom','pf:5v5','gr:12v12',
  'q:'+L0.id+':-1','q:'+L0.id+':01x','lo:'+L0.id+' ','LO:'+L0.id,'rv:what','ob:explore:1',`o:${L0.id}:0:0:0`,'x'.repeat(80),'',null,42])assert.equal(K.isCountId(bad),false,'rejects '+bad);
 for(const id of K.FIXED_COUNT_IDS)assert(K.isCountId(id)&&K.COUNT_KEY_RE.test(id),id);
 const total=K.FIXED_COUNT_IDS.length+ALL.length*5+ALL.reduce((n,l)=>n+l.questions.length+l.questions.reduce((m,q)=>m+q.options.length,0),0);
 console.log(`  ids: ${ALL.length} lessons × 5 stages, ${ALL.reduce((n,l)=>n+l.questions.length,0)} questions, ${ALL.reduce((n,l)=>n+l.questions.reduce((m,q)=>m+q.options.length,0),0)} options, ${K.FIXED_COUNT_IDS.length} fixed → ${total} ids`);
 // The fixed lists mirror the code they describe.
 const onb=[...read('components/IslandOnboarding.tsx').matchAll(/\{id:'([a-z]+)',eyebrow:/g)].map(m=>m[1]);assert.deepEqual(onb,J(K.ONBOARDING_STEPS.map(s=>s[0])),'walkthrough steps');
 const voices=[...read('lib/town/useLessonVoice.ts').match(/COACH_VOICES=\[(.*?)\] as const/)[1].matchAll(/\['([a-z_]+)','([^']+)'\]/g)].map(m=>[m[1],m[2]]);
 assert.deepEqual(voices,J(K.COACH_VOICE_IDS),'coach voices');
 assert.deepEqual(J(K.LEARN_FORMATS),J([...load('lib/endgame/graduationModel.ts').GRADUATION_FORMATS].sort((a,b)=>K.LEARN_FORMATS.indexOf(a)-K.LEARN_FORMATS.indexOf(b))),'formats');
});

// 2. Server validation: shape and caps reject the beat; a well-formed id that is not (or no longer) allowlisted is dropped.
await ok('validation',async()=>{
 const beat=extra=>({v:1,t:'beat',s:SID,p:'/',e:30_000,...extra});
 const many=Object.fromEntries(ALL.slice(0,65).map(l=>['lo:'+l.id,1]));
 const bad=[beat({k:[1]}),beat({k:'lo'}),beat({k:{['lo:'+L0.id]:0}}),beat({k:{['lo:'+L0.id]:51}}),beat({k:{['lo:'+L0.id]:1.5}}),beat({k:{['lo:'+L0.id]:'1'}}),beat({k:{'<script>':1}}),
  beat({k:{'lo:sam smith':1}}),beat({k:many}),{v:1,t:'start',s:SID,p:'/',k:{['lo:'+L0.id]:1}},beat({f:{p:1}}),{v:1,t:'start',s:SID,p:'/',f:{p:4}},{v:1,t:'start',s:SID,p:'/',f:{s:16}},
  {v:1,t:'start',s:SID,p:'/',f:{name:1}},{v:1,t:'start',s:SID,p:'/',f:{p:'1'}},{v:1,t:'start',s:SID,p:'/',f:[1]},{v:1,t:'start',s:SID,p:'/',f:{v:-1}}];
 for(const b of bad)assert.equal(C.validateEvent(JSON.stringify(b)).ok,false,'rejects '+JSON.stringify(b).slice(0,80));
 assert.equal(C.validateEvent(JSON.stringify(beat({k:Object.fromEntries(ALL.slice(0,64).map(l=>['lo:'+l.id,50]))}))).ok,true,'64 ids at 50 each is the cap');
 assert.equal(C.validateEvent(JSON.stringify({v:1,t:'start',s:SID,p:'/',f:{p:3,g:4,s:15,v:3}})).ok,true);
 const store=S.createMemoryStore();
 assert.equal((await ingest(store,{v:1,t:'start',s:SID,p:'/',f:{p:2,g:1,s:5,v:2}})).reason,'ok');
 assert.deepEqual(J(store.data.starts[SID].flags),{p:2,g:1,s:5,v:2});
 for(const b of bad.slice(0,9))assert.equal((await ingest(store,b,{now:at(1000)})).status,400);
 assert.equal(store.data.beats.length,0,'nothing stored from bad payloads');
 const r=await ingest(store,beat({k:{['lo:'+L0.id]:2,'lo:removed_lesson':3,[`q:${L0.id}:9`]:1,'ob:seen:welcome':1}}),{now:at(60_000)});
 assert.equal(r.reason,'ok','the beat (and its time) is kept');
 assert.deepEqual(J(store.data.beats[0].counts),{['lo:'+L0.id]:2,'ob:seen:welcome':1},'unknown or out-of-range ids are dropped, not the beat');
 // A count-only beat (a hide draining leftovers) is stored; an empty one is not.
 assert.equal((await ingest(store,{v:1,t:'beat',s:SID,p:'/',k:{'rv:q':1}},{now:at(70_000)})).reason,'ok');
 assert.equal((await ingest(store,{v:1,t:'beat',s:SID,p:'/',k:{'lo:removed_lesson':1}},{now:at(71_000)})).reason,'empty-beat');
 assert.deepEqual(J(C.clampCounts({['lo:'+L0.id]:999,['ls:'+L0.id]:-1,x:1})),{['lo:'+L0.id]:K.MAX_COUNT_VALUE});
});

// 3. The tracker: counts ride in the beat; the busiest 64 go first and the rest carry; a hide drains; nothing when off.
await ok('tracker overflow carry',()=>{
 T.count('lo:'+L0.id);// no tracker running (dev, DNT, preview…): a no-op
 const x=env({flags:()=>({p:1,g:0,s:4,v:1})}),tr=T.startTracker(x.e);tr.pageview('/');
 const start=x.sent.find(b=>b.t==='start');assert.deepEqual(J(start.f),{p:1,g:0,s:4,v:1},'flags ride on the start');
 assert.deepEqual(J(tr.state().counts),{},'the no-op before start left nothing');
 const timersBefore=x.timers.size;
 const ids=ALL.slice(0,90).map(l=>'lo:'+l.id);
 ids.forEach((id,i)=>T.count(id,i<10?3:1));T.count('ls:'+L0.id,70);T.count('nonsense:id');T.count('lo:'+L0.id,0);T.count('lo:'+L0.id,1.5);
 assert.equal(x.timers.size,timersBefore,'counting adds no timer');
 x.fire('pointerdown');x.advance(30_000);
 {const due=Math.min(...[...x.timers.values()].map(v=>v.at));x.advance(due-x.e.now());}// exactly one safety ping beat
 const first=x.sent.filter(b=>b.t==='beat')[0];
 assert.equal(Object.keys(first.k).length,K.MAX_BEAT_COUNTS,'64 ids per beat');
 assert.equal(first.k['ls:'+L0.id],K.MAX_COUNT_VALUE,'busiest first, capped at 50 (the other 20 carry)');
 assert(ids.slice(0,10).every(id=>first.k[id]===3),'the busier ids go first');
 const carried=tr.state().counts;assert.equal(carried['ls:'+L0.id],20);assert.equal(Object.keys(carried).length,90+1-K.MAX_BEAT_COUNTS+1,'the overflow is carried, not dropped');
 x.advance(10_000);x.hide();
 const beats=x.sent.filter(b=>b.t==='beat');
 const total={};for(const b of beats)for(const [k,v] of Object.entries(b.k||{}))total[k]=(total[k]||0)+v;
 assert.equal(total['ls:'+L0.id],70);for(const [i,id] of ids.entries())assert.equal(total[id],i<10?3:1,id);
 assert.equal(total['nonsense:id'],undefined);assert.deepEqual(J(tr.state().counts),{},'drained on hide');
 for(const b of beats){assert(Buffer.byteLength(b.raw)<=T.BEACON_BUDGET,'under the budget');assert.equal(C.validateEvent(b.raw).ok,true,'every beat validates')}
 assert(T.BEACON_BUDGET<C.MAX_BODY_BYTES);
 tr.stop();
 // Byte budget: a beat already heavy with places/activities/cells gets fewer count ids, and the rest carry (never over 4096).
 const y=env(),t2=T.startTracker(y.e);t2.pageview('/');y.timers.clear();// one long beat (no safety ping)
 const P=load('lib/analytics/islandPlaces.ts'),IDS=load('lib/analytics/islandIds.ts');
 for(let x=-150;x<860;x+=40)for(let z=-310;z<300;z+=40){T.islandFrame(x,z,'walk',P.placeAt);y.fire('pointerdown');y.advance(5000);}// every place, 64 cells
 for(const a of IDS.ACTIVITY_IDS){const off=T.enterActivity(a);y.fire('pointerdown');y.advance(1000);off();}
 for(const l of ALL)for(let q=0;q<l.questions.length;q++)T.count(`o:${l.id}:${q}:0`,l.id.length>=20?2:1);// the longest ids are the busiest
 const before=y.sent.length;y.hide();const yb=y.sent.filter(b=>b.t==='beat'),onHide=y.sent.slice(before);
 for(const b of yb){assert(Buffer.byteLength(b.raw)<=T.BEACON_BUDGET,`beat ${Buffer.byteLength(b.raw)} B`);assert.equal(C.validateEvent(b.raw).ok,true);}
 assert(onHide.length<=1+T.MAX_DRAIN_BEATS,'a hide sends at most two extra count-only beats');
 assert(onHide.length>1&&!onHide[1].e&&!onHide[1].pl,'the extra ones carry counts only');
 console.log(`  heavy beat: ${Buffer.byteLength(onHide[0].raw)} B with ${Object.keys(onHide[0].k||{}).length} count ids; ${onHide.length-1} drain beat(s), ${Object.keys(t2.state().counts).length} ids still carried`);t2.stop();
 // The byte guard itself: with little room left, fewer ids go and the rest stay for the next beat.
 const z=env(),t3=T.startTracker(z.e);t3.pageview('/');for(const l of ALL.slice(0,40))T.count('lo:'+l.id);
 const part=T.takeCounts(300);assert(Buffer.byteLength(JSON.stringify({k:part}))<=300,'fits the room');assert(Object.keys(part).length<40&&Object.keys(part).length>5);
 assert.equal(Object.keys(t3.state().counts).length,40-Object.keys(part).length,'the rest carry');assert.equal(T.takeCounts(5),null,'no room, nothing taken');t3.stop();
});

// 4. Payload sizes.
await ok('payload size',()=>{
 const typical={v:1,t:'beat',s:'AbCdEfGhIjKlMnOpQrSt12',p:'/',e:180000,a:{island:180000},n:0,pl:{field_7v7:120000,island_square:40000},ac:{lesson:60000,quiz:70000,walk:30000,idle:20000},
  c:Object.fromEntries(Array.from({length:12},(_,i)=>[300+i,10])),k:Object.fromEntries([['lo',1],['le',1],['ls',1],['lf',1]].map(([s,v])=>[`${s}:${L0.id}`,v]).concat(L0.questions.flatMap((q,i)=>[[`q:${L0.id}:${i}`,1],[`o:${L0.id}:${i}:${q.correct}`,1]])))};
 const start={v:1,t:'start',s:'AbCdEfGhIjKlMnOpQrSt12',p:'/',tp:1,f:{p:2,g:1,s:6,v:0}};
 const tb=Buffer.byteLength(JSON.stringify(typical)),sb=Buffer.byteLength(JSON.stringify(start)),kb=Buffer.byteLength(JSON.stringify({k:typical.k}));
 assert.equal(C.validateEvent(JSON.stringify(typical)).ok,true);assert(tb<1100,'typical beat with one lesson + quiz: '+tb);
 console.log(`  payload: start with flags ${sb} B; typical 3-min beat with one lesson + ${L0.questions.length}-question quiz ${tb} B (counts part ${kb} B); tracker budget ${T.BEACON_BUDGET} B, server limit ${C.MAX_BODY_BYTES} B`);
});

// Fixture for aggregation / SQL: three sessions, one with flags, counts spread over several beats.
const DAY='2026-10-05',iso=(h,m,s=0)=>`${DAY}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.000Z`;
const st=(id,hash,startedAt,flags)=>({id,day:DAY,visitorHash:hash.repeat(32),startedAt,entryPath:'/',country:'US',region:'CA',device:'phone',source:'direct',referrerHost:null,utmSource:null,utmMedium:null,utmCampaign:null,...(flags?{flags}:{})});
const FIX_STARTS=[st('lnA_aaaaaaaaaaaaaaaa','a',iso(9,0),{p:1,g:0,s:5,v:2}),st('lnB_bbbbbbbbbbbbbbbb','b',iso(10,0),{p:3,g:4,s:0,v:0}),st('lnC_cccccccccccccccc','c',iso(11,0)),st('lnD_dddddddddddddddd','d',iso(12,0),{p:0})];
const bt=(sessionId,ts,counts)=>({sessionId,ts,engagedMs:60000,pageviews:0,areaMs:{island:60000},placeMs:{},activityMs:{},cells:{},...(counts?{counts}:{})});
const lo='lo:'+L0.id,q0=`q:${L0.id}:0`,o0=`o:${L0.id}:0:${L0.questions[0].correct}`;
const FIX_BEATS=[bt('lnA_aaaaaaaaaaaaaaaa',iso(9,2),{[lo]:1,[q0]:1,[o0]:1}),bt('lnA_aaaaaaaaaaaaaaaa',iso(9,4),{[lo]:1,'ob:seen:welcome':1}),// A opens the lesson twice
 bt('lnB_bbbbbbbbbbbbbbbb',iso(10,2),{[lo]:3,'gr:finale':1}),bt('lnC_cccccccccccccccc',iso(11,1)),bt('lnD_dddddddddddddddd',iso(12,1),{'rv:q':2,'rv:ok':1})];

// 5. countSessions: sessions with an id ≥ 1 (not beats, not the sum), and flag tallies per session.
await ok('countSessions',()=>{
 const r=C.rollupDay(DAY,C.deriveSessions(FIX_STARTS,FIX_BEATS));
 assert.equal(r.counts[lo],5,'5 opens in total');assert.equal(r.countSessions[lo],2,'from 2 sessions');
 assert.equal(r.countSessions['rv:q'],1);assert.equal(r.counts['rv:q'],2);
 assert.deepEqual(J(r.flags),{n:3,p1:1,p3:1,p0:1,g0:1,g4:1,v2:1,v0:1,sm:1,vo:1},'sessions per flag value; s=5 → sound muted + voice off');
 const m=C.mergeRollups([r,r,{...C.rollupDay('2026-10-01',[])},(()=>{const o=C.rollupDay('2026-09-30',[]);delete o.counts;delete o.countSessions;delete o.flags;return o;})()]);
 assert.equal(m.counts[lo],10);assert.equal(m.countSessions[lo],4,'summed over days (a session belongs to one day)');assert.equal(m.flags.n,6);
});

// 6. Suppression: anything resting on < 5 sessions is withheld (null) or merged away, and counted in `hidden`.
await ok('suppression',()=>{
 const id=L0.id,s={},c={};const set=(k,sess,cnt=sess)=>{s[k]=sess;c[k]=cnt;};
 set('lo:'+id,40);set('le:'+id,30);set('ls:'+id,4);set('lf:'+id,0);set('la:'+id,0);// ls rests on 4 sessions
 set('lo:'+L1.id,3);set('le:'+L1.id,2);// a quiet lesson
 const QI=L0.questions.findIndex(x=>x.options.length>=3),q=L0.questions[QI],wrong=(q.correct+1)%q.options.length,rare=(q.correct+2)%q.options.length;
 set(`q:${id}:${QI}`,20,24);set(`o:${id}:${QI}:${q.correct}`,12,14);set(`o:${id}:${QI}:${wrong}`,6,7);set(`o:${id}:${QI}:${rare}`,2,3);
 set(`q:${id}:1`,3,3);// a question from 3 sessions: not listed
 set('ob:seen:welcome',9);set('ob:skip:welcome',2);set('pf:7v7',7,9);set('pf:9v9',1,1);
 const L=LN.buildLearning(c,s,{n:30,p0:20,p1:6,p2:4,vo:3,sm:8,v0:30});
 const f7=L.formats.find(f=>f.format==='7v7'),row=f7.lessons.find(l=>l.id===id);
 assert.deepEqual(J(row.stages),[40,30,null,0,0],'the 4-session stage is withheld');
 assert.deepEqual(J(row.drop),{stage:1,share:0.25});
 assert.equal(L.formats.find(f=>f.format==='futsal').quiet,1,'a lesson whose every stage is under 5 is merged into a hidden count');
 assert(!L.formats.find(f=>f.format==='futsal').lessons.length);
 assert.equal(L.questions.length,1,'only questions with ≥ 5 sessions');const qr=L.questions[0];
 assert.equal(qr.text,q.q);assert.equal(qr.firstTry,14/24);assert.equal(qr.options[wrong].share,7/24);assert.equal(qr.options[rare].share,null,'an option picked by 2 sessions is hidden');
 assert.equal(qr.hiddenOptions,1);
 assert.equal(L.walkthrough.steps[0].seen,9);assert.equal(L.walkthrough.steps[0].skipped,null);
 assert.equal(L.progress.bands[2].sessions,null);assert.equal(L.settings.bits.find(b=>b.key==='vo').sessions,null);assert.equal(L.settings.bits.find(b=>b.key==='sm').sessions,8);
 assert.equal(L.paths.launches.find(p=>p.format==='7v7').launches,9);assert.equal(L.paths.launches.find(p=>p.format==='9v9').launches,null);
 assert(L.hidden>=8,'hidden cells are counted for the note: '+L.hidden);
 // Nothing under 5 sessions survives anywhere in what is sent to the browser (numbers 1-4 only appear as derived shares).
 const json=JSON.stringify(L);assert(!/"(seen|skipped|sessions)":[1-4][,}]/.test(json),'no raw small cells');
 const src=read('app/admin/LearningSection.tsx');assert(/<5/.test(src)&&/fewer than/.test(src),'the dashboard says what is hidden');
});

// 7. No text and no ids: the browser sends indices; the store keeps fixed ids and small integers only.
await ok('no text or ids stored',async()=>{
 const store=S.createMemoryStore();const sid='NoTextSessionNoText1';
 await ingest(store,{v:1,t:'start',s:sid,p:'/',f:{p:1,g:0,s:0,v:0}});
 const k={['lo:'+L0.id]:1};L0.questions.forEach((q,i)=>{k[`q:${L0.id}:${i}`]=1;k[`o:${L0.id}:${i}:${(q.correct+1)%q.options.length}`]=1;});
 await ingest(store,{v:1,t:'beat',s:sid,p:'/',e:60000,a:{island:60000},k},{now:at(60_000)});
 const dump=JSON.stringify(store.data);
 for(const q of L0.questions){assert(!dump.includes(q.q.slice(0,24)),'no question text');for(const o of q.options)if(o.length>12)assert(!dump.includes(o),'no option text: '+o);}
 assert(!dump.includes(L0.name),'no lesson name');assert(!/203\.0\.113|Mozilla|Chrome/.test(dump),'no IP or UA');
 assert(Object.values(store.data.beats[0].counts).every(v=>Number.isInteger(v)),'totals only');
 assert(Object.keys(store.data.starts[sid].flags).every(k=>['p','g','s','v'].includes(k)));
 // Call sites pass indices, never q.options[...] or text; the tracker and its helpers never touch answer text.
 const fl=read('components/FieldLearning.tsx');assert(/countFirstTry\(chosen\.id,question,index\)/.test(fl));
 assert(!/count\w*\([^)]*(\.options\[|\.q\b|\.text|\.name)/.test(fl+read('components/LearningReview.tsx')+read('components/IslandOnboarding.tsx')),'never text');
 // The text table stays on the server: no client module imports it.
 for(const f of ['lib/analytics/tracker.ts','lib/analytics/learnEvents.ts','lib/analytics/countIds.ts','lib/analytics/startFlags.ts','app/admin/LearningSection.tsx','app/admin/AnalyticsDashboard.tsx','app/admin/charts.tsx'])
  assert(!/^import(?! type)[^\n]*(learningText|analytics\/learning')/m.test(read(f)),f+' keeps the text on the server');
 const tsrc=read('lib/analytics/tracker.ts').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');
 assert(!/localStorage|document\.cookie|setInterval|requestAnimationFrame/.test(tsrc),'tracker: no storage, intervals or frame loops');
 const ev=read('lib/analytics/learnEvents.ts').replace(/\/\*[\s\S]*?\*\//g,'');assert(!/setTimeout|setInterval|requestAnimationFrame|useState|fetch|sendBeacon|localStorage/.test(ev),'call sites: map increments only');
 // Start flags read the game's own saves (keys still match the writers) and never the last-visit day.
 const sf=read('lib/analytics/startFlags.ts').replace(/\/\*[\s\S]*?\*\//g,'');assert(!/last-visit|welcomeBack|setItem/.test(sf),'no returning-visitor signal, nothing written');
 assert.equal(F.FLAG_KEYS.quiz,read('lib/town/quizProgress.ts').match(/QUIZ_STORAGE_KEY='([^']+)'/)[1]);
 assert.equal(F.FLAG_KEYS.graduations,read('lib/endgame/graduationStore.ts').match(/GRADUATION_KEY='([^']+)'/)[1]);
 const town=read('components/Town.tsx');for(const k of ['soundMuted','music','voice','controls','coach'])assert(town.includes(`'${F.FLAG_KEYS[k]}'`),'Town writes '+F.FLAG_KEYS[k]);
 const ls=new Map(Object.entries({[F.FLAG_KEYS.quiz]:JSON.stringify(LESSONS['7v7'].slice(0,5).flatMap(l=>l.questions.map((_,i)=>`7v7:${l.id}:${i}`)).concat(['7v7:'+LESSONS['7v7'][6].id+':0'])),
  [F.FLAG_KEYS.graduations]:JSON.stringify({version:1,formats:{'7v7':{at:1,seen:true},futsal:{at:2,seen:true}},finale:null}),[F.FLAG_KEYS.soundMuted]:'true',[F.FLAG_KEYS.voice]:'false',[F.FLAG_KEYS.coach]:'kokoro_am_michael'}));
 assert.deepEqual(J(F.readStartFlags({getItem:k=>ls.get(k)??null})),{p:2,g:2,s:5,v:2},'5 complete lessons → 4–11 band; 2 graduations; muted + voice off; Michael');
 assert.deepEqual(J(F.readStartFlags({getItem:()=>null})),{p:0,g:0,s:0,v:0},'a new device');
 assert.deepEqual(J(F.readStartFlags({getItem:()=>{throw Error('blocked');}})),{p:0,g:0,s:0,v:0},'storage errors are harmless');
});

// 8. The banner: an old schema (or a live day computed without the learning keys) asks for the migration by name.
await ok('schema-version banner',async()=>{
 const mem=S.createMemoryStore();for(const s of FIX_STARTS)mem.data.starts[s.id]=s;mem.data.beats.push(...FIX_BEATS);
 const now=new Date('2026-10-07T12:00:00Z');
 const fine=await R.buildReport(mem,{from:DAY,to:DAY},now);
 assert.deepEqual(J(fine.storage),{schema:C.SCHEMA_VERSION,needsUpdate:false});assert.equal(fine.learning.hasData,true);
 const old={...mem,schemaVersion:async()=>2};assert.equal((await R.buildReport(old,{from:DAY,to:DAY},now)).storage.needsUpdate,true,'schema 2 → banner');
 const stale={...mem,schemaVersion:async()=>3,computeDays:async(f,t,n)=>(await mem.computeDays(f,t,n)).map(r=>{const o={...r};delete o.counts;delete o.countSessions;delete o.flags;return o;})};
 assert.equal((await R.buildReport(stale,{from:DAY,to:DAY},now)).storage.needsUpdate,true,'a day with visits but no counts key → banner');
 // The Supabase store reads a missing function (404) as schema 2.
 const sb=S.createSupabaseStore('https://x.supabase.co','k',async()=>({ok:false,status:404,text:async()=>''}));assert.equal(await sb.schemaVersion(),2);
 const sb3=S.createSupabaseStore('https://x.supabase.co','k',async()=>({ok:true,status:200,text:async()=>'3'}));assert.equal(await sb3.schemaVersion(),3);
 const dash=read('app/admin/AnalyticsDashboard.tsx');
 assert(/storage\?\.needsUpdate/.test(dash)&&/20261009_analytics_counts\.sql/.test(dash)&&/OK, counts installed \(analytics schema 3\)/.test(dash),'the banner names the file and the OK row');
 assert(/data starts with this release|starts with the Oct 9 2026 release/i.test(read('app/admin/LearningSection.tsx'))&&/after the player leaves the tab, or every few minutes/.test(read('app/admin/LearningSection.tsx')),'empty-state copy');
});

// 9. Wiring: one map increment at each existing moment; the hooks the plan names.
await ok('wiring',()=>{
 const fl=read('components/FieldLearning.tsx');
 for(const re of [/const select=\(lesson:FieldLesson\)=>\{countLessonOpened\(lesson\.id\)/,/countLessonStage\('ls',chosen\.id\)/,/countLessonStage\('lf',chosen\.id\)/,/countLessonStage\('la',chosen\.id\)/,/useEffect\(\(\)=>\{if\(finished&&chosen\)countLessonStage\('le',chosen\.id\);\},\[finished,chosen\]\)/])assert(re.test(fl),String(re));
 assert(/countWalkthroughStep\(steps\[step\]\.id\)/.test(read('components/IslandOnboarding.tsx'))&&/countWalkthroughSkip/.test(read('components/IslandOnboarding.tsx'))&&/countWalkthroughExplore\(\)/.test(read('components/IslandOnboarding.tsx')));
 assert(/countPathLaunch\(detail\.format\)/.test(read('components/Town.tsx')));
 assert(/countGraduation\(f\)/.test(read('lib/endgame/graduationSync.ts'))&&/countGraduation\('finale'\)/.test(read('components/MatchdayFinale.tsx')));
 assert(/countReview\(correct\)/.test(read('components/LearningReview.tsx'))&&/countReviewDone\(\)/.test(read('components/LearningReview.tsx')));
 // The holo-card work in progress is untouched by this change.
 for(const f of ['components/PlayerCard.tsx','components/MiniCard.tsx','components/CardCollection.tsx','components/CardOffer.tsx'])assert(!/analytics\/learnEvents|countLesson/.test(read(f)),f);
 assert(/admin-analytics-learning\.cjs/.test(read('package.json')),'part of npm test');
 // The walkthrough → lesson link is per page lifetime, once.
 const x=env(),tr=T.startTracker(x.e);tr.pageview('/');E.countLessonOpened(L0.id);assert.equal(tr.state().counts['ob:lesson'],undefined,'no walkthrough, no link');
 E.countWalkthroughStep('welcome');E.countLessonOpened(L0.id);E.countLessonOpened(L1.id);assert.equal(tr.state().counts['ob:lesson'],1);tr.stop();
});

// 10. The SQL: all three migrations in order; additive; caps; the self-check row; rollup = TypeScript reference; frozen for good.
await ok('sql',async()=>{
 const bin=n=>{for(const d of (process.env.PATH||'').split(':').concat(['/opt/homebrew/bin','/usr/local/bin','/usr/lib/postgresql/16/bin','/usr/lib/postgresql/15/bin','/usr/lib/postgresql/14/bin'])){const f=path.join(d,n);if(fs.existsSync(f))return f;}return null;};
 const initdb=bin('initdb'),pgctl=bin('pg_ctl'),psqlBin=bin('psql');
 if(process.env.SKIP_PG_TESTS||!initdb||!pgctl||!psqlBin){console.log('  SKIP sql: no local Postgres (initdb/pg_ctl/psql) found');return 'skip';}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fipgl-')),port=String(40000+(process.pid+13)%20000),quiet={stdio:['ignore','ignore','pipe']};
 try{
  cp.execFileSync(initdb,['-D',path.join(dir,'data'),'-U','postgres','--auth=trust','-E','UTF8','--locale=C'],quiet);
  cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-o',`-k ${dir} -p ${port} -c listen_addresses='' -c fsync=off -c TimeZone=UTC`,'-w','-l',path.join(dir,'log'),'start'],quiet);
  const args=['-h',dir,'-p',port,'-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-qAt'];
  const psql=(sql,{role}={})=>cp.execFileSync(psqlBin,[...args,'-c',(role?`set role ${role}; `:'')+sql],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const fails=(sql,role)=>{const r=cp.spawnSync(psqlBin,[...args,'-c',`set role ${role}; ${sql}`],{encoding:'utf8'});return r.status!==0?r.stderr:'';};
  const runFile=f=>cp.execFileSync(psqlBin,[...args,'-f',f],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  psql('create role anon; create role authenticated; create role service_role bypassrls;');
  runFile('supabase/migrations/20261007_analytics.sql');runFile('supabase/migrations/20261008_analytics_places.sql');
  // Live data from before: a session and a beat, and the old ingest ignoring the new keys (the app ships before the migration).
  const today=new Date().toISOString().slice(0,10);
  psql(`select analytics_ingest('{"type":"start","session":"oldsession0000000001","path":"/","day":"${today}","visitor_hash":"${'1'.repeat(32)}","device":"phone","source":"direct","flags":{"p":1}}')`,{role:'service_role'});
  psql(`select analytics_ingest('{"type":"beat","session":"oldsession0000000001","engaged_ms":5000,"counts":{"lo:${L0.id}":1}}')`,{role:'service_role'});
  assert.equal(psql(`select count(*) from analytics_beats where session_id='oldsession0000000001'`),'1','the old ingest still stores the beat');
  assert.match(fails('select analytics_schema_version()','service_role'),/does not exist/,'before: no version function (the dashboard reads that as 2)');
  // The migration, and its self-check row.
  assert.equal(runFile('supabase/migrations/20261009_analytics_counts.sql'),'OK, counts installed (analytics schema 3)','self-check row');
  assert.equal(runFile('supabase/migrations/20261009_analytics_counts.sql'),'OK, counts installed (analytics schema 3)','idempotent: running it again is harmless');
  assert.equal(psql(`select counts::text||(select flags::text from analytics_sessions where id='oldsession0000000001') from analytics_beats where session_id='oldsession0000000001'`),'{}{}','existing rows read as empty');
  assert.deepEqual(psql(`select column_name from information_schema.columns where table_name='analytics_beats' order by ordinal_position`).split('\n'),['id','session_id','ts','engaged_ms','pageviews','area_ms','place_ms','activity_ms','cells','counts']);
  assert.equal(psql(`select column_name from information_schema.columns where table_name='analytics_sessions' order by ordinal_position desc limit 1`),'flags');
  assert.equal(psql('select analytics_schema_version()',{role:'service_role'}),'3','this file installs 3 (20261009_analytics_start.sql then 4)');
  for(const role of ['anon','authenticated'])for(const fn of [`analytics_ingest('{}'::jsonb)`,'analytics_schema_version()',`analytics_day_rollup(current_date)`])assert.match(fails(`select ${fn}`,role),/permission denied/,role+' '+fn);
  const sql=read('supabase/migrations/20261009_analytics_counts.sql');
  assert(!/\bdrop\b|\btruncate\b|\bdelete from\b|rename/i.test(sql.replace(/--.*$/gm,'')),'no destructive statements');
  assert(sql.includes(K.COUNT_KEY_RE.source.replace(/\\/g,'')),'the same id shape as countIds.ts');assert(sql.includes('limit 64')&&sql.includes('least(value::integer, 50)'));
  // A self-check that FAILS loudly when something is missing.
  psql(`create or replace function analytics_schema_version() returns integer language sql immutable as $$ select 2 $$`);
  assert.match(psql(sql.slice(sql.lastIndexOf('select case when missing'))),/^NOT INSTALLED: analytics_schema_version\(\) = 3$/);
  runFile('supabase/migrations/20261009_analytics_counts.sql');
  // The start-page migration on top (as in production), so the rollup has every key the TypeScript reference has.
  assert.equal(runFile('supabase/migrations/20261009_analytics_start.sql'),'OK, start page installed (analytics schema 4)');
  // Caps in SQL: flags sanitised, counts shape-checked, ≤ 64 (busiest), each ≤ 50.
  psql(`select analytics_ingest('{"type":"start","session":"sqllearnsession00001","path":"/","day":"${today}","visitor_hash":"${'9'.repeat(32)}","device":"phone","source":"direct","flags":{"p":3,"g":9,"s":15,"v":"2","name":"sam"}}')`,{role:'service_role'});
  assert.deepEqual(JSON.parse(psql(`select flags from analytics_sessions where id='sqllearnsession00001'`)),{p:3,s:15,v:2},'known keys and ranges only');
  const many=Object.fromEntries(ALL.slice(0,70).map((l,i)=>['lo:'+l.id,i+1]));many['bad key']=5;many['lo:'+L1.id+':x:y:z']=5;many['ls:'+L0.id]=999;many['le:'+L0.id]='x';
  psql(`select analytics_ingest('${JSON.stringify({type:'beat',session:'sqllearnsession00001',engaged_ms:30000,counts:many})}'::jsonb)`,{role:'service_role'});
  const got=JSON.parse(psql(`select counts from analytics_beats where session_id='sqllearnsession00001'`));
  assert.equal(Object.keys(got).length,64,'64 at most');assert.equal(got['ls:'+L0.id],50,'capped at 50');assert(!('bad key' in got)&&!(('le:'+L0.id) in got));
  assert.equal(got['lo:'+ALL[0].id],undefined,'the quietest are the ones left out');
  psql(`select analytics_ingest('{"type":"beat","session":"sqllearnsession00001","engaged_ms":1000,"counts":[1,2]}'::jsonb)`,{role:'service_role'});
  assert.equal(psql(`select count(*) from analytics_beats where session_id='sqllearnsession00001' and counts='{}'`),'1','a non-object is ignored, the beat still counts');
  // Rollup = TypeScript reference.
  const q=v=>v===null||v===undefined?'null':`'${String(v).replace(/'/g,"''")}'`;
  psql('insert into analytics_sessions (id,day,visitor_hash,started_at,entry_path,country,region,device,source,flags) values '+
   FIX_STARTS.map(s=>`(${[s.id,s.day,s.visitorHash,s.startedAt,s.entryPath,s.country,s.region,s.device,s.source,JSON.stringify(s.flags||{})].map(q).join(',')})`).join(','));
  psql('insert into analytics_beats (session_id,ts,engaged_ms,pageviews,area_ms,counts) values '+FIX_BEATS.map(b=>`(${q(b.sessionId)},${q(b.ts)},${b.engagedMs},${b.pageviews},${q(JSON.stringify(b.areaMs))},${q(JSON.stringify(b.counts||{}))})`).join(','));
  const ref=J(C.rollupDay(DAY,C.deriveSessions(FIX_STARTS,FIX_BEATS)));
  const sqlRoll=JSON.parse(psql(`select analytics_day_rollup('${DAY}')`,{role:'service_role'}));
  assert.deepEqual(sqlRoll,ref,'SQL day rollup = TypeScript reference');
  assert.equal(sqlRoll.countSessions[lo],2);assert.deepEqual(sqlRoll.flags,ref.flags);
  assert.deepEqual(JSON.parse(psql(`select analytics_day_rollup('2026-09-01')`,{role:'service_role'})),J(C.rollupDay('2026-09-01',[])),'an empty day has the same shape');
  // Through the real ingest path too: TS ingest → memory store vs the same events → SQL ingest, same rollup.
  const mem=S.createMemoryStore(),D2=today,sid='e2eLearnSession00001',now=new Date();
  const evs=[{v:1,t:'start',s:sid,p:'/',f:{p:2,g:0,s:4,v:1}},{v:1,t:'beat',s:sid,p:'/',e:60000,a:{island:60000},k:{[lo]:1,[q0]:1,[o0]:1,'ob:seen:welcome':1}},{v:1,t:'beat',s:sid,p:'/',e:30000,a:{island:30000},k:{[lo]:1,'pf:7v7':1}}];
  for(const ev of evs){await ingest(mem,ev,{now});const st0=mem.data.starts[sid],last=ev.t==='start'?null:mem.data.beats[mem.data.beats.length-1];
   psql(`select analytics_ingest('${JSON.stringify(ev.t==='start'?{type:'start',session:sid,path:'/',day:D2,visitor_hash:st0.visitorHash,device:st0.device,source:st0.source,country:st0.country,region:st0.region,flags:st0.flags}
    :{type:'beat',session:sid,engaged_ms:last.engagedMs,pageviews:last.pageviews,area_ms:last.areaMs,counts:last.counts})}'::jsonb)`,{role:'service_role'});}
  const tsDay=J((await mem.computeDays(D2,D2,now))[0]),sqlDay=JSON.parse(psql(`select analytics_day_rollup('${D2}')`,{role:'service_role'}));
  for(const k of ['counts','countSessions'])for(const id of Object.keys(tsDay[k]))assert.equal(sqlDay[k][id],tsDay[k][id],k+' '+id);
  // Nightly finalize freezes the learning totals for good.
  const add=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*86400000).toISOString().slice(0,10),fin=add(today,-5);
  psql(`update analytics_beats set ts=ts + ('${fin}'::date - '${DAY}'::date) * interval '1 day' where session_id in (select id from analytics_sessions where day='${DAY}')`);
  psql(`update analytics_sessions set day='${fin}', started_at=started_at + ('${fin}'::date - '${DAY}'::date) * interval '1 day' where day='${DAY}'`);
  assert(JSON.parse(psql(`select analytics_finalize('${today}')`,{role:'service_role'})).includes(fin));
  const frozen=JSON.parse(psql(`select data from analytics_daily where day='${fin}'`));
  assert.deepEqual(frozen.counts,ref.counts);assert.deepEqual(frozen.countSessions,ref.countSessions);assert.deepEqual(frozen.flags,ref.flags);
 }finally{
  try{cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-m','immediate','-w','stop'],quiet);}catch{}
  fs.rmSync(dir,{recursive:true,force:true});
 }
});

console.log(`admin-analytics-learning: ${passed} groups passed${skipped.length?`, skipped: ${skipped.join(', ')}`:''}`);
})().catch(e=>{console.error(e);process.exit(1);});
