#!/usr/bin/env node
// Admin analytics: Play with friends and emotes (Oct 22 2026, Phase A of docs/analytics-multiplayer-plan.md). The mp: / em: ids are
// fixed, well-formed and allowlisted; the emote numbers match the real emote tables; PartyHost's Track names equal partyEvents'
// list and every id has a writer; bucket edges; once-per-session thresholds; the report maths and suppression; "Not tracked yet";
// a privacy scan; the Town / EmoteControl wiring; the privacy policy's sponsor wording; and a fixture render of both admin sections.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const {createLoader}=require('./summit-harness.cjs');
const read=f=>fs.readFileSync(f,'utf8');
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"])\/\/.*$/gm,'$1');
let passed=0;const ok=(name,fn)=>{try{fn();passed++;}catch(e){console.error('FAIL',name);throw e;}};
const K=createLoader()('lib/analytics/countIds.ts');
const MP=K.PARTY_FIXED_IDS,EM=K.EMOTE_FIXED_IDS;
/** partyEvents / emoteEvents on a recording tracker stub. */
function fresh(){
 const log=[],hooks=[];
 const L=createLoader({tracker:{count:id=>log.push(id),onPageHide:fn=>{hooks.push(fn);return()=>{};}}});
 return {log,hooks,P:L('lib/analytics/partyEvents.ts'),E:L('lib/analytics/emoteEvents.ts'),LE:L('lib/analytics/learnEvents.ts')};
}

ok('mp: and em: ids are fixed, well-formed and on the allowlist',()=>{
 assert(MP.length>=70&&EM.length>=44+15,`${MP.length} / ${EM.length}`);
 for(const id of [...MP,...EM]){assert(K.COUNT_KEY_RE.test(id),id);assert(K.isCountId(id),id);assert(K.FIXED_COUNT_IDS.includes(id),id);}
 assert.equal(new Set(K.FIXED_COUNT_IDS).size,K.FIXED_COUNT_IDS.length,'no duplicate fixed ids');
 for(const bad of ['mp:madeup','mp:fail_teapot','mp:peak_21','em:e19','em:e25','em:e55','em:ctx_car','em:move_15','em:reach_2','mp_party_created','mp:code','em:to_alex',
  'em:dance_10','em:show_10','em:react_4','em:hf_20','em:wave_6','em:laugh_6','em:keepup_3','em:pass_6','em:juggle_6','mp:ping_here','mp:first_guest'])assert(!K.isCountId(bad),bad);
 for(const id of ['em:dance_0','em:dance_9','em:hf_19','em:react_3','em:keepup_2','em:e50','em:e54','em:ctx_walk','em:move_0','em:move_14','em:streak','em:cam','em:seen','mp:lesson','mp:quiz','mp:quiz_done','mp:first_party','mp:first_host','mp:name_bad','mp:ping_meet','mp:ping_follow'])assert(K.isCountId(id),id);
 assert.deepEqual(K.EMOTE_WIRE_IDS.length,44);
 const head=read('lib/analytics/countIds.ts').split('*/')[0];assert(/mp:<event>/.test(head)&&/em:<event>/.test(head),'families documented in the header');
});

ok('EMOTE_WIRE_IDS match the real emote tables (source scan; ShowOff, not Space)',()=>{
 const nums=(file,name)=>{const m=new RegExp(`export const ${name}\\s*=\\s*\\{([\\s\\S]*?)\\}`).exec(read(file));assert(m,name);return [...m[1].matchAll(/(\w+):\s*(\d+)/g)].map(x=>[x[1],Number(x[2])]);};
 const wheel=nums('lib/town/emoteReact.ts','EMOTE'),ride=nums('lib/town/rideEmotes.ts','RIDE_EMOTE'),ctx=nums('lib/town/emoteContexts.ts','CTX_EMOTE'),npc=nums('lib/town/npcEmoteSets.ts','NPC_SET'),move=nums('lib/town/moveEmotes.ts','MOVE_EMOTE');
 const all=[...wheel,...ride,...ctx,...npc,...move].map(([,n])=>n).sort((a,b)=>a-b);
 assert.deepEqual(all,[...K.EMOTE_WIRE_IDS].sort((a,b)=>a-b));
 assert.deepEqual(Object.fromEntries(wheel),{Wave:0,Cheer:1,HighFive:2,JuggleWithMe:3,ShowOff:4,WellPlayed:5,PassBall:6,Laugh:7,Dance:8,Thanks:9});
 // The admin labels (emoteLabels.ts repeats the ten wheel labels so the server never loads the character graphics).
 const src=read('lib/town/emoteReact.ts'),local=Object.fromEntries([...src.matchAll(/\{emote: EMOTE\.(\w+), icon: '[^']*', label: '([^']+)'\}/g)].map(m=>[Object.fromEntries(wheel)[m[1]],m[2]]));
 const Lab=createLoader()('lib/analytics/emoteLabels.ts');
 assert.deepEqual(Object.fromEntries(Object.entries(Lab.WHEEL_EMOTE_LABELS).map(([k,v])=>[Number(k),v])),local);
 const labels=Lab.emoteLabels();for(const n of K.EMOTE_WIRE_IDS)assert(labels[n]&&labels[n].label,'label for '+n);
 assert.equal(labels[45].group,'npc');assert.equal(labels[22].group,'fly');assert.equal(labels[33].group,'swim');assert.equal(labels[14].group,'ride');assert.equal(labels[52].group,'walk');assert.equal(labels[50].label,'Wave on the move');
});

ok('EMOTE_VARIANT_COUNTS match the CURRENT variant tables (10 dances, 10 show-offs, 4 reactions, 20 handshakes, 6 wave / cheer / laugh, ball routines)',()=>{
 const L=createLoader(),D=L('lib/town/emoteDance.ts'),S=L('lib/town/emoteShowOff.ts'),H=L('lib/town/emoteHandshakes.ts'),B=L('lib/town/emoteBody.ts'),BP=L('lib/town/emoteBallPlay.ts'),MV=L('lib/town/moveEmotes.ts');
 assert.deepEqual({...K.EMOTE_VARIANT_COUNTS},{dance:D.DANCES.length,show:S.SHOW_OFFS.length,react:S.SHOW_OFF_REACTIONS.length,hf:H.HANDSHAKES.length,
  wave:B.BODY_VARIANTS[0].length,cheer:B.BODY_VARIANTS[1].length,laugh:B.BODY_VARIANTS[7].length,pass:BP.PASS_ROUTINES.length,juggle:BP.JUGGLE_ROUTINES.length,keepup:BP.JUGGLE_SOLO_ROUTINES.length,move:MV.MOVE_SCRIPTS.reduce((n,x)=>n+x.variants.length,0)});
 assert.deepEqual(Object.keys(B.BODY_VARIANTS).map(Number),[0,1,7],'wave / cheer / laugh are the body emotes');
 const hook=L('lib/town/emoteVariantHook.ts');assert.deepEqual({...hook.BODY_VARIANT_FAMILY},{0:'wave',1:'cheer',7:'laugh'});
 const VL=L('lib/analytics/emoteVariantLabels.ts').emoteVariantLabels();
 for(const [f,n] of Object.entries(K.EMOTE_VARIANT_COUNTS))assert.equal(VL[f].length,n,'labels for '+f);
 assert.equal(VL.dance[0],'The floss');
 // The graphics report the pick (never analytics); Town counts only the local player's (and a townsperson's show-off reaction).
 const imp=/(?:import[^'"`]*from\s*)['"`]([^'"`]+)['"`]/g;
 for(const f of ['lib/town/emoteVariantHook.ts','lib/graphics/dancePose.ts','lib/graphics/showOffPose.ts','lib/graphics/bodyEmotePose.ts'])
  for(const m of read(f).matchAll(imp))assert(!/analytics/.test(m[1]),f+' imports '+m[1]);
 assert(/if \(family\) emitEmoteVariant\(family, v, root\)/.test(read('lib/graphics/dancePose.ts')));
 assert(/pickMove\(root, kind, age, reactBag, 'react'\)\] : SHOW_OFFS\[pickMove\(root, kind, age, showBag, 'show'\)/.test(read('lib/graphics/showOffPose.ts')));
 assert(/if \(s\.role === BODY_ROLE\.Self\) emitEmoteVariant\(BODY_VARIANT_FAMILY\[kind\], s\.v, root\)/.test(read('lib/graphics/bodyEmotePose.ts')));
 const seen=[];hook.onEmoteVariant((f,v,r)=>seen.push([f,v,r]));hook.emitEmoteVariant('dance',3,'me');hook.onEmoteVariant(null);hook.emitEmoteVariant('dance',4,'me');
 assert.deepEqual(seen,[['dance',3,'me']]);
});

ok("PartyHost's Track names equal partyEvents' list, and each has a call site",()=>{
 const {P}=fresh(),host=read('components/party/PartyHost.tsx');
 const m=/type Track =([\s\S]*?);/.exec(host);assert(m,'Track union');
 const names=[...m[1].matchAll(/'([a-z_]+)'/g)].map(x=>x[1]);
 assert.deepEqual([...names].sort(),[...P.PARTY_TRACK_EVENTS].sort());
 const sites=strip(host)+strip(read('components/party/PartyInvite.tsx'))+strip(read('components/Town.tsx'));
 for(const n of names)assert(new RegExp(`'${n}'`).test(sites),'call site for '+n);
 assert(!/mp_party_|mp_join_failed/.test(host),'old off-grammar names gone');
 assert(/onShared=\{\(r\) => track\.current\?\.\(r\)\}/.test(host)&&/onShared\?\.\('share_tap'\)/.test(read('components/party/PartyInvite.tsx')));
 assert(/onWrong=\{\(\) => track\.current\?\.\('gate_wrong'\)\}/.test(host)&&/recordGateWrong\(\);onWrong\?\.\(\);/.test(read('components/ParentGate.tsx')));
});

ok('party / ParentGate / invite / townBridge import no analytics',()=>{
 const importRe=/(?:import[^'"`]*from\s*|import\s*\(\s*|require\s*\(\s*)['"`]([^'"`]+)['"`]/g;
 for(const f of ['components/party/PartyHost.tsx','components/party/PartyInvite.tsx','lib/multiplayer/townBridge.ts','components/landing/JoinFriends.tsx'])
  for(const x of read(f).matchAll(importRe))assert(!/lib\/analytics/.test(x[1]),`${f} imports ${x[1]}`);
});

ok('every mp: and em: id has a writer (full simulation emits exactly the allowlist)',()=>{
 const f0=fresh(),{log,P,E}=f0;fresh.last=f0.LE;let t=0;
 for(const e of ['open','sheet','open_link','gate_show','gate_skip','gate_ok','gate_back','gate_wrong','name_ok','create_tap','created','join_tap',
  'share_tap','share_ok','copy_ok','share_fail','new_code','lock','unlock','kick','name_reset','hide','mute','tab_code','tab_list','end_tap'])P.countParty(e,undefined,t);
 for(const r of [...K.PARTY_FAIL_REASONS,'teapot'])P.countParty('fail',r,t);
 P.countParty('fail_create','rate');P.countParty('fail_create','offline');
 const MIN=60000,party=(peak,len,ffAt,end='end')=>{t+=1e9;P.countParty('live_host',undefined,t);if(ffAt!==null)P.countParty('members',String(peak),t+ffAt);P.countParty(end,undefined,t+len);};
 party(1,4*MIN,null);party(2,10*MIN,0.5*MIN);party(4,20*MIN,3*MIN);party(8,45*MIN,10*MIN);party(12,2*60*MIN,30*MIN);party(20,4*60*MIN,2*60*MIN,'leave');
 t+=1e9;P.countParty('live_guest','link',t);P.countParty('ended',undefined,t+1);P.countParty('live_guest','typed',t+2);P.countParty('kicked',undefined,t+3);
 P.countParty('live_host',undefined,t+4);for(let i=0;i<130;i++)P.accruePartyMs(MIN);
 // Phase B (P1): a refused name character, the map pings (no UI sends one yet), learning while live (learnEvents' twins).
 P.countParty('name_bad');P.countPartyPing(0);P.countPartyPing(1);P.countPartyPing(7);
 const LE=fresh.last,lid=K.lessonsOf('7v7')[0];LE.countLessonOpened(lid);LE.countLessonStage('ls',lid);LE.countLessonStage('lf',lid);
 const emitted=new Set(log.filter(id=>id.startsWith('mp:')));
 assert.deepEqual([...emitted].sort(),[...MP].sort());
 for(const n of K.EMOTE_WIRE_IDS)E.countEmote({wire:n,ctx:'ground',npc:false,party:false,refused:false});
 for(const c of K.EMOTE_CONTEXTS)E.countEmote({wire:0,ctx:c,npc:true,party:true,refused:false});
 E.countEmote({wire:0,ctx:'ground',npc:false,party:false,refused:true});
 E.countEmoteUi('btn');E.countEmoteUi('wheel');E.countEmoteUi('wheel_close');
 for(let i=0;i<5;i++)E.countEmote({wire:99,ctx:'car',npc:false,party:false,refused:false});// unknown wire / context: only the generic ids (and past 50 picks)
 for(const [f,n] of Object.entries(K.EMOTE_VARIANT_COUNTS))for(let i=0;i<n+1;i++)E.countEmoteVariant(f,i);// one past the end is dropped
 E.countEmoteVariant('teapot',0);E.countEmoteCam();E.countEmoteSeen();
 assert.deepEqual([...new Set(log.filter(id=>id.startsWith('em:')))].sort(),[...EM].sort());
 for(const id of log)assert(K.isCountId(id),'emitted id allowlisted: '+id);
 P.countParty('teapot');P.countParty('members','x');assert(!log.includes('mp:teapot'));
});

ok('bucket edges',()=>{
 const {P}=fresh(),MIN=60000;
 assert.equal(P.lenBucket(5*MIN-1000),'len_5m');assert.equal(P.lenBucket(5*MIN),'len_15m');assert.equal(P.lenBucket(15*MIN),'len_30m');
 assert.equal(P.lenBucket(60*MIN-1),'len_60m');assert.equal(P.lenBucket(180*MIN-1),'len_3h');assert.equal(P.lenBucket(180*MIN),'len_long');
 assert.equal(P.peakBucket(1),'peak_1');assert.equal(P.peakBucket(2),'peak_2');assert.equal(P.peakBucket(4),'peak_3_4');assert.equal(P.peakBucket(5),'peak_5_8');
 assert.equal(P.peakBucket(12),'peak_9_12');assert.equal(P.peakBucket(13),'peak_13_20');assert.equal(P.peakBucket(20),'peak_13_20');
 assert.equal(P.ffBucket(59_999),'ff_1m');assert.equal(P.ffBucket(MIN),'ff_5m');assert.equal(P.ffBucket(60*MIN),'ff_long');
 const {E}=fresh();assert.equal(E.emoteCtx('walk',false,false),'ground');assert.equal(E.emoteCtx('scooter',false,false),'scooter');
 assert.equal(E.emoteCtx('jetpack',true,false),'fly');assert.equal(E.emoteCtx('walk',false,true),'swim');assert.equal(E.emoteCtx('jetpack',false,false),'ground');
});

ok('threshold and once-per-session counters fire once; host-only bands; pagehide flush',()=>{
 const {log,hooks,P,E}=fresh(),n=id=>log.filter(x=>x===id).length,MIN=60000;
 P.countParty('live_host',undefined,0);for(let i=0;i<200;i++)P.accruePartyMs(MIN);P.countParty('end',undefined,1);
 P.countParty('live_host',undefined,10);P.accruePartyMs(MIN);P.countParty('end',undefined,11);
 assert.equal(n('mp:in'),1);assert.equal(n('mp:min'),201);for(const m of K.PARTY_MIN_REACH)assert.equal(n('mp:min_reach_'+m),1,'reach '+m);
 for(let i=0;i<3;i++){P.countParty('name_ok');P.countParty('tab_code');P.countParty('tab_list');}
 assert.equal(n('mp:name_ok'),1);assert.equal(n('mp:tab_code'),1);assert.equal(n('mp:tab_list'),1);
 // Guests never send size / length bands; End then the remote 'ended' is not double counted; no minutes off-party.
 const before=log.length;P.countParty('live_guest','typed',20);P.countParty('members','5',21);P.countParty('leave',undefined,22);P.countParty('ended',undefined,23);
 const g=log.slice(before);assert(!g.some(x=>/peak_|len_|ff_/.test(x)),g.join());assert.equal(g.filter(x=>x==='mp:ended').length,0);P.accruePartyMs(10*MIN);assert.equal(n('mp:min'),201);
 // Peak follows the largest roster; the first friend once.
 P.countParty('live_host',undefined,100);P.countParty('members','3',100+2*MIN);P.countParty('members','7',100+3*MIN);P.countParty('members','2',100+4*MIN);
 assert.equal(n('mp:ff_5m'),1);
 // Frame sampling: ~5 s gate, capped gaps, nothing while hidden.
 P.partyFrame(0,true);P.partyFrame(1000,true);P.partyFrame(5000,true);P.partyFrame(10000,true);P.partyFrame(10000+600000,true);
 // Tab closing with the party live: the hook (registered by watchPartyEnd) sends the bands once.
 const off=P.watchPartyEnd();assert.equal(hooks.length,1);hooks[0]();hooks[0]();off();
 assert.equal(n('mp:peak_5_8'),1);
 for(let i=0;i<60;i++)E.countEmote({wire:2,ctx:'ground',npc:i%2===0,party:false,refused:false});
 for(const r of K.EMOTE_REACH)assert.equal(n('em:reach_'+r),1);
 E.countEmoteUi('btn');E.countEmoteUi('btn');assert.equal(n('em:btn'),1);assert.equal(n('em:to_npc'),30);assert.equal(n('em:solo'),30);
 // Streak: 3 picks inside 60 s → one streak; more inside the same minute add none; a slow fourth adds none.
 const s0=fresh(),sn=id=>s0.log.filter(x=>x===id).length,pick=t=>s0.E.countEmote({wire:0,ctx:'ground',npc:false,party:false,refused:false},t);
 pick(0);pick(10_000);assert.equal(sn('em:streak'),0);pick(20_000);assert.equal(sn('em:streak'),1);pick(30_000);pick(40_000);assert.equal(sn('em:streak'),1,'once per minute');
 pick(200_000);pick(300_000);assert.equal(sn('em:streak'),1,'spread out: no streak');pick(310_000);assert.equal(sn('em:streak'),1,'two quick ones are not a streak');pick(320_000);assert.equal(sn('em:streak'),2,'a later burst of three counts again');
 // First party / first host: once per device (fi2-mp-firsts-v1); learning twins only while a party is live.
 const f1=fresh(),fn=id=>f1.log.filter(x=>x===id).length;
 f1.LE.countLessonOpened('a');f1.LE.countLessonStage('ls','a');assert.equal(fn('mp:lesson')+fn('mp:quiz'),0,'not in a party: no twin');
 f1.P.countParty('live_guest','typed',0);f1.LE.countLessonOpened('a');f1.LE.countLessonStage('le','a');f1.LE.countLessonStage('ls','a');f1.LE.countLessonStage('lf','a');f1.LE.countLessonStage('la','a');
 assert.deepEqual([fn('mp:lesson'),fn('mp:quiz'),fn('mp:quiz_done')],[1,1,1]);assert(!f1.log.some(x=>/^mp:.*a$/.test(x)&&x!=='mp:quiz_done'&&x!=='mp:lesson'&&x!=='mp:quiz'),'never the lesson id in an mp: id');
 f1.P.countParty('leave',undefined,1);f1.P.countParty('live_host',undefined,2);f1.P.countParty('end',undefined,3);f1.P.countParty('live_host',undefined,4);
 assert.deepEqual([fn('mp:first_party'),fn('mp:first_host')],[1,1],'once each per device');
 const pf=read('lib/analytics/partyFirsts.ts');assert(/PARTY_FIRSTS_KEY='fi2-mp-firsts-v1'/.test(pf)&&createLoader()('lib/saves/snapshot.ts').DEVICE_KEYS.includes('fi2-mp-firsts-v1'),'a device key, never synced');
 const tr=read('lib/analytics/tracker.ts');assert(/const onHide=\(e\?:Event\)=>\{if\(e\?\.type==='pagehide'\)for\(const f of pageHideHooks\)/.test(tr),'tracker pagehide hook before the final beat');
});

// A merged-rollup fixture: 200 sessions, some cells under 5.
function fixture(){
 const counts={},countSessions={};const set=(id,c,s=c)=>{counts[id]=c;countSessions[id]=s;};
 set('mp:open',80,60);set('mp:gate_show',50,45);set('mp:gate_ok',40,40);set('mp:name_ok',38);set('mp:create_tap',30);set('mp:created',28,25);set('mp:live_host',27,25);
 set('mp:ff_1m',6);set('mp:ff_5m',9);set('mp:ff_none',3);set('mp:open_link',20);set('st:friends',3);set('mp:join_tap',22);set('mp:live_guest',40,35);set('mp:live_guest_link',15);
 set('mp:in',55);set('mp:fail_not_found',7,6);set('mp:fail_full',2);set('mp:share_ok',12,10);set('mp:copy_ok',6,6);
 set('mp:peak_1',3,3);set('mp:peak_2',10,10);set('mp:peak_3_4',8,8);set('mp:peak_5_8',5,5);set('mp:len_5m',6);set('mp:len_15m',12);set('mp:len_30m',8);
 set('mp:min',900,50);set('mp:min_reach_5',40);set('mp:min_reach_15',25);set('mp:min_reach_30',12);set('mp:min_reach_60',4);
 set('em:pick',600,90);set('em:reach_1',90);set('em:reach_5',50);set('em:reach_20',10);set('em:btn',150);set('em:wheel',300,100);set('em:wheel_close',60,40);
 set('em:to_npc',240,70);set('em:to_party',50,20);set('em:solo',300,80);set('em:refused',3,3);set('em:e0',200,60);set('em:e8',90,30);set('em:e45',4,4);set('em:ctx_ground',500,85);set('em:ctx_fly',30,10);
 return {counts,countSessions,totals:{sessions:200},areas:[{area:'island',ms:3000*60000}]};
}
const R=createLoader()('lib/analytics/partyReport.ts'),labels=createLoader()('lib/analytics/emoteLabels.ts').emoteLabels();
const RANGE={from:'2026-10-22',to:'2026-10-28'};

ok('partyReport: funnel maths, suppression, derived numbers, Not tracked yet',()=>{
 const p=R.buildParty(fixture(),RANGE,[{day:'2026-10-22',counts:{'mp:min':400},countSessions:{'mp:min':20},areaMs:{island:1000*60000}},{day:'2026-10-23',counts:{'mp:min':10},countSessions:{'mp:min':2},areaMs:{island:60000*50}}]);
 assert.equal(p.status,'ok');assert.equal(p.partial,false);assert.equal(p.inParty,55);assert.equal(p.inShare,55/200);
 assert.deepEqual(p.host.map(s=>s.sessions),[60,45,40,38,30,25,25,15]);
 const g=Object.fromEntries(p.guest.map(s=>[s.id,s.sessions]));assert.equal(g['mp:open_any'],83);assert.equal(g['st:friends'],null,'<5 sessions hidden');
 const math=R.funnelMath(p.host.map(s=>s.sessions));assert.equal(math[1].drop,1-45/60);
 const f=Object.fromEntries(p.failures.map(r=>[r.id,r.value]));assert.equal(f['mp:fail_not_found'],7);assert.equal(f['mp:fail_full'],null);assert.equal(f['mp:fail_rate'],0);
 const pk=Object.fromEntries(p.peak.map(r=>[r.id,r.value]));assert.equal(pk['mp:peak_1'],null,'<5 parties hidden');assert.equal(pk['mp:peak_2'],10);assert.equal(pk['mp:peak_5_8'],5);
 assert.equal(p.histParties,26);assert(Math.abs(p.avgSize-(3*1+10*2+8*3.5+5*6.5)/26)<1e-9);assert.equal(p.medianSize,'2 players');assert.equal(p.medianLen,'5–15 min');
 assert.equal(p.minutes,900);assert.equal(p.islandMinutes,3000);assert.equal(p.minuteShare,0.3);assert.equal(p.joinsPerParty,40/28);
 assert.deepEqual(p.minReach.map(s=>s.sessions),[40,25,12,null,0]);
 assert.deepEqual(p.daily,[{day:'2026-10-22',party:400,solo:600},{day:'2026-10-23',party:null,solo:50}]);
 assert.equal(p.invites.perParty,18/28);assert.equal(p.invites.linkConv,15/20);
 assert(p.hidden>=4);
 const before=R.buildParty(fixture(),{from:'2026-10-01',to:'2026-10-21'});assert.equal(before.status,'not_yet');
 const empty=R.buildParty({counts:{},countSessions:{},totals:{sessions:10},areas:[]},RANGE);assert.equal(empty.status,'empty');assert.equal(empty.inShare,0);
 assert.equal(R.buildParty(fixture(),{from:'2026-10-15',to:'2026-10-22'}).partial,true);
 const e=R.buildEmotes(fixture(),RANGE,labels);
 assert.equal(e.status,'ok');assert.equal(e.picks,600);assert.equal(e.emotingSessions,90);assert.equal(e.perEmoter,600/90);assert.equal(e.npcRate,240/600);assert.equal(e.wheelConv,1-60/300);
 const by=Object.fromEntries(e.byEmote.map(r=>[r.wire,r]));assert.equal(by[0].label,'Wave');assert.equal(by[8].value,90);assert.equal(by[45].value,null);assert.equal(by[45].group,'npc');assert.equal(by[4].label,'Show off');
 assert.deepEqual(e.targets.map(r=>r.value),[240,50,300,null]);assert.equal(R.buildEmotes(fixture(),{from:'2026-10-01',to:'2026-10-02'}).status,'not_yet');
 const rep=read('lib/analytics/report.ts');assert(/report\.party=buildParty\(merged,range,rollups\);report\.emotes=buildEmotes\(merged,range,emoteLabels\(\),emoteVariantLabels\(\)\)/.test(rep));
 assert(/party\?:PartyReport\|null;\n emotes\?:EmoteReport\|null;/.test(read('lib/analytics/core.ts')));
});

ok('privacy scan: ids and the event modules carry no code, name or key',()=>{
 for(const id of [...MP,...EM])assert(!/[23456789BCDFGHJKMNPQRSTVWXYZ]{6}/.test(id),'code-alphabet run in '+id);
 for(const f of ['lib/analytics/partyEvents.ts','lib/analytics/emoteEvents.ts']){
  const s=strip(read(f));
  for(const bad of [/getNick/,/\bcode\b/i,/hostKey/,/members\s*\[[^\]]*\]\s*\.name/,/\bnick/i,/\bname\b/,/localStorage|sessionStorage|fetch\(|Date\.now\(\)\s*\)/])assert(!bad.test(s),`${f} matches ${bad}`);
 }
 // The bucket PartyHost passes is a fixed string: a fail reason, 'link' / 'typed', the member COUNT, or a share result. Never the code.
 const host=strip(read('components/party/PartyHost.tsx'));
 for(const m of host.matchAll(/track\.current\?\.\(([^;]*?)\)(?:;|\s*\})/g))assert(!/code|nick|name\b|hostKey|\.id\b/.test(m[1].replace(/'[a-z_]+'/g,'')),'track args: '+m[1]);
});

ok('Town, EmoteControl and the title screen are wired',()=>{
 const town=read('components/Town.tsx');
 assert(/<PartyHost [^>]*onTrack=\{countParty\}/.test(town),'onTrack on PartyHost');
 assert(/onHiddenChange=\{onHiddenFriends\} onMutedChange=\{onMutedFriends\}/.test(town)&&/if\(s\.size>hiddenN\)countParty\('hide'\)/.test(town));
 const bus=town.slice(town.indexOf('emoteBus.set(pickIn=>{'),town.indexOf('// High five + emote camera'));
 assert(/countEmote\(\{wire:pickIn,ctx:emoteCtx\(rideRef\.current,flyNow,swimNow\),npc:!!emoteNpc,party:toParty,refused:!!refV\}\)/.test(bus),'countEmote after the pick is accepted');
 assert(/const toParty=multiplayerEnabled\(\)&&partyConnection\(\)\.status==='live';/.test(bus));
 assert(/islandFrame\(location\.x[^\n]*\n\s*partyFrame\(performance\.now\(\)\);/.test(town),'party minutes on the frame sample path');
 assert(/useEffect\(\(\)=>watchPartyEnd\(\),\[\]\)/.test(town));
 const ec=read('components/EmoteControl.tsx');for(const k of ['btn','wheel','wheel_close'])assert(ec.includes(`countEmoteUi('${k}')`),k);
 assert(/trackStart\('st:friends'\)/.test(read('components/landing/TitleActions.tsx')));
 const SI=createLoader()('lib/analytics/startIds.ts');assert(SI.START_COUNT_IDS.includes('st:friends'));
 const dash=read('app/admin/AnalyticsDashboard.tsx');assert(/<WaterSection report=\{report\}\/>\n\s*<FriendsSection report=\{report\}\/>\n\s*<EmoteSection report=\{report\}\/>/.test(dash),'mounted on the Engagement tab');
 const pkg=JSON.parse(read('package.json'));assert(pkg.scripts.test.includes('node tests/admin-analytics-party.cjs'),'in the test chain');
});

ok('privacy policy: says we collect, names sponsors and totals, never claims to sell',()=>{
 const pp=read('components/privacy/PrivacyPolicy.tsx'),text=pp.replace(/^[\s\S]*?export default function/,'').replace(/<[^>]+>/g,' ');
 assert(/\[LAWYER\][\s\S]*sections for the review/.test(pp)&&/must be reviewed by a lawyer/.test(pp),'[LAWYER] review comment lists the changed sections');
 assert(/counts from Play with friends, from fixed lists/.test(text)&&/preset emotes/.test(text),'§7 Play with friends bullet');
 assert(/collect[^.]*anonymous usage data/i.test(text),'says it collects anonymous usage data');
 assert(/sponsors?/i.test(text)&&/combined[^.]*totals/i.test(text),'sponsors get combined totals');
 assert(/two purposes only/i.test(text));
 assert(/small groups|too small to stay anonymous/i.test(text),'small groups left out');
 assert(/do not sell/i.test(text)&&!/\bwe (may |might |will |can )?(sell|rent)\b/i.test(text),'never claims to sell');
 assert(!/almost no personal details|do not share any information|we collect nothing|or share information for money/i.test(text),'old wording gone');
 assert(/never stored, logged or counted/.test(text),'the first name stays out of analytics');
 assert(/14 days/.test(text)&&/Do Not Track/.test(text));
 const about=read('lib/site/aboutCopy.ts');assert(/anonymous usage data/.test(about)&&/sponsors/.test(about)&&/nothing is sold/.test(about));
 assert(/sponsors/.test(read('public/llms.txt')));
});

ok('fixture render: Friends & parties and Emotes sections',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 const css=new Proxy({},{get:(_,k)=>typeof k==='string'?k:undefined});
 const L=createLoader({'admin.module.css':css,'IslandTravelMap.module.css':css});
 const Friends=L('app/admin/FriendsSection.tsx').default,Emote=L('app/admin/EmoteSection.tsx').default;
 const rollups=[{day:'2026-10-22',counts:{'mp:min':400},countSessions:{'mp:min':20},areaMs:{island:1000*60000}}];
 const report={party:R.buildParty(fixture(),RANGE,rollups),emotes:R.buildEmotes(fixture(),RANGE,labels)};
 const f=renderToStaticMarkup(React.createElement(Friends,{report})),e=renderToStaticMarkup(React.createElement(Emote,{report}));
 assert(/Friends &amp; parties/.test(f)&&/Host funnel/.test(f)&&/Party size/.test(f)&&/data-status="ok"/.test(f)&&/&lt;5/.test(f),'friends section');
 assert(/Emotes played/.test(e)&&/Wave/.test(e)&&/Show off/.test(e)&&/Who answered/.test(e)&&/&lt;5/.test(e),'emote section');
 for(const html of [f,e])assert(!/[23456789BCDFGHJKMNPQRSTVWXYZ]{3}-[23456789BCDFGHJKMNPQRSTVWXYZ]{3}/.test(html),'no party code shape');
 const old={party:R.buildParty(fixture(),{from:'2026-10-01',to:'2026-10-21'}),emotes:R.buildEmotes(fixture(),{from:'2026-10-01',to:'2026-10-21'})};
 assert(/Not tracked yet/.test(renderToStaticMarkup(React.createElement(Friends,{report:old}))));
 assert(/Not tracked yet/.test(renderToStaticMarkup(React.createElement(Emote,{report:old}))));
 if(process.env.PARTY_FIXTURE_OUT)fs.writeFileSync(process.env.PARTY_FIXTURE_OUT,JSON.stringify(report));
});

ok('Phase B wiring: Town, townBridge (analytics-free callback), NickField, the variant hook',()=>{
 const town=read('components/Town.tsx'),bus=town.slice(town.indexOf('emoteBus.set(pickIn=>{'),town.indexOf('// High five + emote camera'));
 assert(/if\(emoteFx\.v>=0\)countEmoteVariant\('hf',emoteFx\.v\);if\(ballEmote\)countEmoteVariant\(pick===EMOTE\.PassBall\?'pass':emoteNpc\?'juggle':'keepup',passOut\.routine\);/.test(bus),'handshake + ball routine after the pick');
 assert(/if\(emoteCam\.begin\([^;]*\)\)countEmoteCam\(\);/.test(bus),'em:cam only when the camera engaged');
 assert(/onEmoteVariant\(\(family,v,root\)=>\{if\(family==='react'\|\|root===player\.root\)countEmoteVariant\(family,v\);\}\);/.test(town),'only your own picks (and a reaction to yours)');
 assert(/emoteBus\.set\(null\);onEmoteVariant\(null\);/.test(town),'listener cleared on unmount');
 assert(/reducedMotion:\(\)=>reduced,onEmoteSeen:countEmoteSeen\}\)/.test(town),'em:seen through the runtime option');
 const tb=read('lib/multiplayer/townBridge.ts');
 assert(/onEmoteSeen\?: \(\) => void/.test(tb)&&/if \(e\.id !== s\.you && avatars\.emote\(e\.id, e\.emote\)\) ctx\.onEmoteSeen\?\.\(\);/.test(tb),'callback only, when the emote is really shown');
 assert(/emote\(id:MemberId,e:Emote\):boolean;/.test(read('lib/graphics/remoteAvatars.ts')));
 const nf=read('components/party/NickField.tsx');assert(/if \(t !== raw\.slice\(0, NICK_MAX\)\) onRejected\?\.\(\);/.test(nf)&&/onRejected\?: \(\) => void/.test(nf),'a count, never the text');
 assert(/onRejected=\{\(\) => track\.current\?\.\('name_bad'\)\}/.test(read('components/party/PartyHost.tsx'))&&/onNameRejected=\{\(\) => track\.current\?\.\('name_bad'\)\}/.test(read('components/party/PartyHost.tsx')));
 assert(/onRejected=\{onNameRejected\}/.test(read('components/party/JoinParty.tsx')));
 const le=read('lib/analytics/learnEvents.ts');assert(/import \{partyLive\} from '\.\/partyEvents';/.test(le)&&/lo:'mp:lesson',ls:'mp:quiz',lf:'mp:quiz_done'/.test(le));
 // Pings: allowlisted with a helper; no UI sends one yet (lib/multiplayer/connection.ts sendPing has no caller).
 const callers=['components','lib','app'].flatMap(d=>{const out=[];const walk=x=>{for(const f of fs.readdirSync(x)){const q=path.join(x,f);if(fs.statSync(q).isDirectory())walk(q);else if(/\.(ts|tsx)$/.test(f)&&/sendPing\(/.test(read(q)))out.push(q);}};walk(d);return out;});
 assert.deepEqual(callers,['lib/multiplayer/connection.ts'],'when a ping UI lands, wire countPartyPing at its call site and update this check');
});

// The party relay's /stats contract (lib/analytics/relayStatsTypes.ts) and the admin loader / route.
const RT=createLoader()('lib/analytics/relayStatsTypes.ts');
ok('relay stats: contract in step with the protocol and the client bands; tolerant, privacy-safe parser',()=>{
 const types=read('multiplayer/protocol/types.ts'),ec=/export const ErrorCode = \{([\s\S]*?)\}/.exec(types)[1];
 const snake=n=>n==='RateLimited'?'rate':n.replace(/([a-z])([A-Z])/g,'$1_$2').toLowerCase();
 const codes=[...ec.matchAll(/(\w+):\s*(\d+)/g)].sort((a,b)=>a[2]-b[2]).map(m=>snake(m[1]));
 assert.deepEqual([...RT.RELAY_ERROR_CODES],codes,'every protocol ErrorCode, in order');
 assert.deepEqual([...RT.RELAY_SIZE_BUCKETS],K.PARTY_PEAK_BUCKETS.map(([b])=>b),'size bands = the client peak bands');
 assert.deepEqual([...RT.RELAY_LEN_BUCKETS],K.PARTY_LEN_BUCKETS.map(([b])=>b),'length bands = the client length bands');
 const fx=RT.relayStatsFixture('2026-10-19',7),r=RT.shapeRelayStats(fx);
 assert.equal(r.status,'ok');assert.equal(r.days.length,7);assert.equal(r.totals.roomsCreated,fx.days.reduce((a,d)=>a+d.roomsCreated,0));
 assert.equal(r.totals.peakParties,Math.max(...fx.days.map(d=>d.peakParties)),'peaks are the highest day, not a sum');
 assert.deepEqual(RT.shapeRelayStats(JSON.parse(JSON.stringify(fx))),r,'round trip');
 // Every field the type names is in the fixture (the relay produces this exact shape).
 const fields=['day','roomsCreated','roomsEnded','peakParties','peakPlayers','lenBuckets','sizeBuckets','connects','reconnects','failedJoins','kicks','rotations','locks','rateLimitCloses','msgsPerPartyBuckets','errorsByCode'];
 assert.deepEqual(Object.keys(fx.days[0]).sort(),[...fields].sort());assert.deepEqual(Object.keys(r.days[0]).sort(),[...fields].sort());
 // Unknown keys never pass through (a code, a name or an address sent by mistake is dropped); junk numbers become 0.
 const bad=RT.shapeRelayStats({v:1,days:[{day:'2026-10-20',code:'K7QXMB',name:'Alex',ip:'1.2.3.4',roomsCreated:-3,kicks:'9',errorsByCode:{full:2,K7QXMB:1}}],live:{parties:2,players:5,code:'K7QXMB'}});
 const js=JSON.stringify(bad);assert(!/K7QXMB|Alex|1\.2\.3\.4/.test(js),js);assert.equal(bad.days[0].roomsCreated,0);assert.equal(bad.days[0].kicks,0);assert.equal(bad.days[0].errorsByCode.full,2);
 assert.deepEqual(RT.shapeRelayStats(null).days,[]);assert.equal(RT.shapeRelayStats({days:[{day:'not-a-day'}]}).days.length,0);
 const h=RT.relayHealth(r.totals);assert(h.connectSuccess>0.9&&h.connectSuccess<1);assert(h.avgSize>2&&h.avgSize<4);
 });

console.log(`admin-analytics-party: ${passed} groups passed`);

(async()=>{
 const A=createLoader()('lib/analytics/relayStatsAdmin.ts'),AD=createLoader()('lib/analytics/relayStatsAdapt.ts');
 // The REAL contract: a relay-native /stats answer produced by relayStatsCore (Map-backed KV, as tests/mp-relay-stats.cjs does)
 // -> adaptRelayNative -> the parser. The relay's bucket ids must be the client's / the admin's.
 const {loadTs}=require('../multiplayer/dev-relay/loadTs.cjs'),SC=loadTs(path.join(ROOT,'multiplayer/relay/src/relayStatsCore.ts'));
 const kvm=new Map(),kv={get:async k=>kvm.has(k)?JSON.parse(JSON.stringify(kvm.get(k))):undefined,put:async(k,v)=>{kvm.set(k,JSON.parse(JSON.stringify(v)));},delete:async k=>kvm.delete(k),
  list:async(o={})=>new Map([...kvm].filter(([k])=>k.startsWith(o.prefix||'')).map(([k,v])=>[k,JSON.parse(JSON.stringify(v))]))};
 const T0=Date.UTC(2026,9,22,12,0,0);let clock=T0;const core=new SC.RelayStatsCore(kv,()=>clock);
 assert.deepEqual([...SC.PEAK_BUCKETS],K.PARTY_PEAK_BUCKETS.map(([b])=>b),'relay size bands = the client peak bands');
 assert.deepEqual([...SC.LEN_BUCKETS],K.PARTY_LEN_BUCKETS.map(([b])=>b),'relay length bands = the client length bands');
 assert.deepEqual([...SC.MSG_BUCKETS],RT.RELAY_MSG_BUCKETS.map(([b])=>b),'relay message bands = the admin message bands');
 assert.deepEqual([...SC.ERR_NAMES],[...RT.RELAY_ERROR_CODES],'relay error names = the admin codes');
 await core.created();await core.created();await core.players(5);
 await core.ended({endReason:0,peak:11,lenMs:200*60000,joins:4,resumes:2,kicks:1,rotates:2,locks:3,nameResets:0,rateCloses:1,msgs:12000,fails:{not_found:2,full:1,closed:1,locked:2,bad_name:1,rate_limited:3,expired:1},errs:{full:2,bad_version:4,kicked:1}},4);
 await core.inc('rl:origin_refused',2);await core.inc('rl:join_rate',1);await core.inc('rl:create_rate',1);
 clock=T0+86400000;await core.created();
 const native=await core.stats('2026-10-22','2026-10-23');
 const adapted=AD.adaptRelayNative(native,Date.UTC(2026,9,23,12,0,0)),rr=RT.shapeRelayStats(adapted),d0=rr.days[0];
 assert.equal(adapted.v,1);assert.equal(rr.days.length,2);assert.equal(d0.day,'2026-10-22');
 assert.equal(d0.roomsCreated,2);assert.equal(d0.roomsEnded,1);assert.equal(d0.peakParties,2);assert.equal(d0.peakPlayers,5);
 assert.equal(d0.connects,4);assert.equal(d0.reconnects,2);assert.equal(d0.kicks,1);assert.equal(d0.rotations,2);assert.equal(d0.locks,3);assert.equal(d0.rateLimitCloses,1);
 assert.equal(d0.sizeBuckets.peak_9_12,1);assert.equal(d0.lenBuckets.len_long,1);assert.equal(d0.msgsPerPartyBuckets.k10_50k,1);
 assert.deepEqual(d0.failedJoins,{not_found:2,full:1,expired:1,locked:3,bad_version:4,bad_name:1,rate:5,origin:2});
 assert.equal(d0.errorsByCode.full,2);assert.equal(d0.errorsByCode.bad_version,4);assert.equal(d0.errorsByCode.kicked,1);
 assert.deepEqual(rr.live,{parties:native.live.parties,players:native.live.players,at:'2026-10-23T12:00:00.000Z'},'live gets generatedAt');
 assert.equal(rr.totals.roomsCreated,3);
 for(const d of rr.days){assert.deepEqual(Object.keys(d.lenBuckets),K.PARTY_LEN_BUCKETS.map(([b])=>b));assert.deepEqual(Object.keys(d.sizeBuckets),K.PARTY_PEAK_BUCKETS.map(([b])=>b));}
 // Tolerant: the already-adapted shape passes through; junk and hostile keys never reach the report.
 assert.deepEqual(RT.shapeRelayStats(AD.adaptRelayNative(RT.relayStatsFixture('2026-10-19',3))),RT.shapeRelayStats(RT.relayStatsFixture('2026-10-19',3)));
 assert.equal(AD.adaptRelayNative(null),null);
 const evil=JSON.stringify(RT.shapeRelayStats(AD.adaptRelayNative({from:'2026-10-22',to:'2026-10-22',days:{'2026-10-22':{'rl:created':1,'rl:K7QXMB':9,'name:Alex':3,'ip:1.2.3.4':2}},live:{parties:1,players:2,code:'K7QXMB',ip:'1.2.3.4'}})));
 assert(!/K7QXMB|Alex|1\.2\.3\.4/.test(evil),evil);
 // Through the loader with a native answer.
 {const env0={RELAY_STATS_URL:'https://relay.example/stats',RELAY_STATS_TOKEN:'sekrit-token-123'};A.resetRelayStatsCache();
  const nr=await A.loadRelayStats('2026-10-22','2026-10-23',{fetchImpl:async()=>({status:200,ok:true,text:async()=>JSON.stringify(native)}),env:env0,now:Date.UTC(2026,9,23,12)});
  assert.equal(nr.status,'ok');assert.equal(nr.totals.connects,4);assert.equal(nr.live.at,'2026-10-23T12:00:00.000Z');A.resetRelayStatsCache();}
 globalThis.__nativeRelay=rr;
 // Not configured: no request at all, and a clear status.
 let calls=[];const fake=(status,body)=>async(url,init)=>{calls.push({url,init});return {status,ok:status>=200&&status<300,text:async()=>JSON.stringify(body)};};
 let r=await A.loadRelayStats('2026-10-19','2026-10-25',{fetchImpl:fake(200,{}),env:{}});
 assert.equal(r.status,'not-configured');assert.equal(calls.length,0);
 assert.equal(A.relayStatsConfig({RELAY_STATS_URL:'ftp://x',RELAY_STATS_TOKEN:'t'}),null,'http(s) only');
 // Configured: the bearer token goes in the header only; the range in the query; the answer never carries the token; cached 60 s.
 const env={RELAY_STATS_URL:'https://relay.example/stats',RELAY_STATS_TOKEN:'sekrit-token-123'};
 r=await A.loadRelayStats('2026-10-19','2026-10-25',{fetchImpl:fake(200,RT.relayStatsFixture('2026-10-19',7)),env,now:1000});
 assert.equal(r.status,'ok');assert.equal(calls.length,1);assert.equal(calls[0].init.headers.Authorization,'Bearer sekrit-token-123');
 assert.equal(calls[0].url,'https://relay.example/stats?from=2026-10-19&to=2026-10-25');assert(!JSON.stringify(r).includes('sekrit'),'token never in the answer');
 await A.loadRelayStats('2026-10-19','2026-10-25',{fetchImpl:fake(200,{}),env,now:1000+59_000});assert.equal(calls.length,1,'cached for 60 s');
 await A.loadRelayStats('2026-10-19','2026-10-25',{fetchImpl:fake(200,RT.relayStatsFixture()),env,now:1000+61_000});assert.equal(calls.length,2,'refreshed after 60 s');
 A.resetRelayStatsCache();
 assert.equal((await A.loadRelayStats('2026-10-01','2026-10-02',{fetchImpl:fake(401,{}),env})).status,'unauthorized');
 assert.equal((await A.loadRelayStats('2026-10-03','2026-10-04',{fetchImpl:fake(500,{}),env})).status,'error');
 assert.equal((await A.loadRelayStats('2026-10-05','2026-10-06',{fetchImpl:async()=>{throw new Error('down');},env})).status,'error','never throws');
 assert.equal((await A.loadRelayStats('2026-10-19','2026-10-25',{env:{RELAY_STATS_FIXTURE:'1',NODE_ENV:'development'}})).days.length,7,'local fixture mode');
 // The route: session check first; the token is server-only (no NEXT_PUBLIC_, never in a client file).
 const route=read('app/api/admin/party-stats/route.ts');
 assert(route.indexOf('status:401')>0&&route.indexOf('status:401')<route.indexOf('loadRelayStats('),'session check first');
 const clientFiles=['app/admin/RelayHealth.tsx','app/admin/LivePanel.tsx','app/admin/FriendsSection.tsx','lib/analytics/relayStatsTypes.ts','app/admin/AnalyticsDashboard.tsx'];
 for(const f of clientFiles){const t=read(f);assert(!/RELAY_STATS_TOKEN|relayStatsAdmin/.test(t.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'').replace(/'Relay stats not configured[^']*'/g,'').replace(/'The relay refused[^']*'/g,'')),f+' never sees the token');}
 assert(!/NEXT_PUBLIC_RELAY_STATS/.test(['lib','app','components'].map(d=>cpGrep(d)).join('')),'never NEXT_PUBLIC_');
 // Fixture render: the Health block (ok and not configured), Parties now, and the emote variant tables.
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 const css=new Proxy({},{get:(_,k)=>typeof k==='string'?k:undefined});
 const L=createLoader({'admin.module.css':css,'LivePanel.module.css':css,'IslandTravelMap.module.css':css,'DoneButton.module.css':css,'Icon.module.css':css});
 const Friends=L('app/admin/FriendsSection.tsx').default,Emote=L('app/admin/EmoteSection.tsx').default,PartiesNow=L('app/admin/LivePanel.tsx').PartiesNow;
 const rep={from:'2026-10-19',to:'2026-10-25',party:R.buildParty(fixture(),RANGE,[]),emotes:R.buildEmotes(fixture(),RANGE,labels,createLoader()('lib/analytics/emoteVariantLabels.ts').emoteVariantLabels())};
 const okRelay=RT.shapeRelayStats(RT.relayStatsFixture('2026-10-19',7));
 const nativeRelay=globalThis.__nativeRelay;
 const f=renderToStaticMarkup(React.createElement(Friends,{report:rep,relay:okRelay}));
 assert(/data-relay-health="true" data-status="ok"/.test(f)&&/Connect success/.test(f)&&/Refusals by error code/.test(f)&&/Messages per party/.test(f)&&/Learning together/.test(f)&&/First parties/.test(f),'health block');
 {const fn=renderToStaticMarkup(React.createElement(Friends,{report:rep,relay:nativeRelay}));assert(/data-relay-health="true" data-status="ok"/.test(fn)&&/Connect success/.test(fn),'health block from adapted native data');
  const pnn=renderToStaticMarkup(React.createElement(PartiesNow,{data:nativeRelay}));assert(/Parties now/.test(pnn)&&/>1</.test(pnn),'parties now from adapted native data');}
 const nc=renderToStaticMarkup(React.createElement(Friends,{report:rep,relay:RT.emptyRelayStats('not-configured','2026-10-19','2026-10-25')}));
 assert(/Relay stats not configured/.test(nc),'not configured state');
 const pn=renderToStaticMarkup(React.createElement(PartiesNow,{data:okRelay}));assert(/Parties now/.test(pn)&&/>7</.test(pn)&&/>23</.test(pn),'parties now');
 assert(/relay stats not configured/.test(renderToStaticMarkup(React.createElement(PartiesNow,{data:RT.emptyRelayStats('not-configured')}))));
 const e=renderToStaticMarkup(React.createElement(Emote,{report:rep}));assert(/Dance moves/.test(e)&&/Streaks/.test(e)&&/Friends’ emotes seen/.test(e),'variant tables + new tiles');
 for(const html of [f,nc,pn,e])assert(!/sekrit|Bearer/.test(html));
 console.log('admin-analytics-party: relay loader, route and renders passed');
})().catch(e=>{console.error(e);process.exit(1);});
function cpGrep(dir){let out='';const walk=x=>{for(const f of fs.readdirSync(x)){const q=path.join(x,f);if(fs.statSync(q).isDirectory())walk(q);else if(/\.(ts|tsx)$/.test(f))out+=read(q);}};walk(dir);return out;}
