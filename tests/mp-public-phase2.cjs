#!/usr/bin/env node
// Public island PHASE 2 (Nov 12 2026; docs/multiplayer/PHASE2-VERIFY.md). Pins:
//  1. Default on: with the flag on, nothing stored = "With other players" (holdout arm 'on'); a brand-new player stays Just me until
//     the tour is done; the grown-up lock (friends / off) and Just me always win; flag off = Just me.
//  2. New vs existing: fi2-public-since-v1 is decided once ('old' when the tour was already done on the first flag-on visit) and kept;
//     the first-time card is for new players only, the people-button hint for old players only, never both, once each.
//  3. Live count: "8 on now", "lots on now" above 24, nothing at 0; read from presence.count (socket counts), no timer or poll added.
//  4. Holdout reading: off by default (needs NEXT_PUBLIC_PUBLIC_HOLDOUT_READING=1 on top of the public flags); then per-arm totals
//     only; ids allowlisted (client + SQL regex); the admin report answers 'off' and reads nothing while off.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const {createLoader}=require('./summit-harness.cjs');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const code=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
let n=0;const ok=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const ENV=['NEXT_PUBLIC_MULTIPLAYER','NEXT_PUBLIC_PUBLIC_WORLD','NEXT_PUBLIC_PUBLIC_HOLDOUT_READING'];
function withEnv(vals,fn){
 const keep=ENV.map(k=>process.env[k]);
 ENV.forEach((k,i)=>{if(vals[i])process.env[k]='1';else delete process.env[k];});
 try{return fn();}finally{ENV.forEach((k,i)=>{if(keep[i]===undefined)delete process.env[k];else process.env[k]=keep[i];});}
}

// ---- 1. default on --------------------------------------------------------------------------------------------------------
ok('default on for everyone; the tour runs in Just me; the lock and Just me win; flag off = Just me',()=>{
 const P=createLoader()('lib/multiplayer/presenceMode.ts'),H=createLoader()('lib/multiplayer/holdout.ts');
 const base={flag:true,lock:'all',tutorialDone:true,relay:'open',party:false,choice:H.holdoutDefaultMode('on')};
 assert.equal(base.choice,'public','nothing stored + arm on = With other players');
 assert.deepEqual({...P.resolvePresence(base)},{mode:'public',reason:null});
 assert.deepEqual({...P.resolvePresence({...base,tutorialDone:false})},{mode:'solo',reason:'tutorial'},'brand-new: the tour in Just me');
 assert.deepEqual({...P.resolvePresence({...base,lock:'friends'})},{mode:'solo',reason:'locked-friends'});
 assert.deepEqual({...P.resolvePresence({...base,lock:'off'})},{mode:'solo',reason:'locked-off'});
 assert.deepEqual({...P.resolvePresence({...base,lock:'off',party:true})},{mode:'solo',reason:'locked-off'},'Off beats a party');
 assert.deepEqual({...P.resolvePresence({...base,choice:'solo'})},{mode:'solo',reason:null},'Just me wins');
 assert.deepEqual({...P.resolvePresence({...base,flag:false})},{mode:'solo',reason:'flag'},'flag off');
 assert(/const choice: PresenceChoice = stored \?\? \(flag \? holdoutDefaultMode\(\) : 'solo'\);/.test(read('lib/multiplayer/presenceMode.ts')),'the default comes from the arm only with the flag on');
});

// ---- 2. new vs existing ---------------------------------------------------------------------------------------------------
function nearModule(){
 const mem=new Map();
 global.localStorage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};
 const N=createLoader({'lib/multiplayer':{onPoses:()=>()=>{},partyStore:{get:()=>({members:[],you:0})}},'publicWorld':{isPublic:()=>false},'strangers':{isHiddenStranger:()=>false}})('components/party/publicNear.ts');
 return {N,mem};
}
ok('fi2-public-since-v1: decided once on the first flag-on visit, then kept',()=>{
 let {N,mem}=nearModule();
 assert.equal(N.playerSince(()=>false),'new');assert.equal(mem.get('fi2-public-since-v1'),'new');
 N.resetPlayerSince();assert.equal(N.playerSince(()=>true),'new','a new player who finished the tour later stays new');
 ({N,mem}=nearModule());
 assert.equal(N.playerSince(()=>true),'old');assert.equal(mem.get('fi2-public-since-v1'),'old');
 N.resetPlayerSince();assert.equal(N.playerSince(()=>false),'old');
 global.localStorage={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}};
 N.resetPlayerSince();assert.equal(N.playerSince(()=>true),'old','blocked storage: this visit only, never throws');
 delete global.localStorage;
 const S=createLoader()('lib/saves/snapshot.ts');
 assert(S.DEVICE_KEYS.includes('fi2-public-since-v1')&&!S.isSyncKey('fi2-public-since-v1'),'device key, never synced');
 assert(read('docs/accounts-design.md').includes('`fi2-public-since-v1`'));
});
ok('first-time card for new players only; the hint for old players only; once each, never both',()=>{
 const first=code(read('components/party/PublicFirstCard.tsx')),btn=code(read('components/party/PeopleButton.tsx'));
 assert(/done\.current = seenMark\('card'\) \|\| seenMark\('hint'\) \|\| playerSince\(\(\) => !shouldShowIslandOnboarding\(\)\) === 'old';/.test(first),'card: new players, once, not after the hint');
 assert(/setExisting\(playerSince\(\(\) => !shouldShowIslandOnboarding\(\)\) === 'old'\)/.test(btn),'hint: old players');
 assert(/const want = existing && pub && !hint && !seenMark\('hint'\) && !seenMark\('card'\);/.test(btn),'hint: once, in a live world, not after the card');
 assert(/toastLane\.request\(HINT_LANE\)/.test(btn)&&/setMark\('hint'\); setHint\(true\);/.test(btn),'through the one-message lane, marked when shown');
 assert(/data-public-hint data-public-hint-ok onClick=\{\(e\) => \{ e\.stopPropagation\(\); close\(\); \}\}/.test(btn),'dismissible with a tap on the note (does not also open the panel)');
 assert(/if \(hint\) close\(\); openPartyMenu\(\);/.test(btn),'a tap on the people button closes it too');
 assert(/createPortal\(/.test(btn),'portalled: the HUD row markup (first / last child ordering) is unchanged');
 const C=createLoader()('lib/multiplayer/publicCopy.ts');
 assert(/Just me/.test(C.PUBLIC_EXISTING_HINT.solo)&&/people|tap here/.test(C.PUBLIC_EXISTING_HINT.solo),'says how to switch to Just me');
 const all=C.allPublicCopy();for(const v of Object.values(C.PUBLIC_EXISTING_HINT))assert(all.includes(v),'scanned: '+v);
 assert(!/\bNew\b/.test(Object.values(C.PUBLIC_EXISTING_HINT).join(' ')),'no "New" chip wording');
 assert.equal(C.PUBLIC_FIRST_CARD.solo,'To play on your own, tap the people button.','the plan\'s wording');
});

// ---- 3. live count --------------------------------------------------------------------------------------------------------
ok('live count badge: "8 on now", "lots" above 24, nothing at 0; socket counts only',()=>{
 const C=createLoader()('lib/multiplayer/publicCopy.ts');
 assert.equal(C.peopleBadge(0),null);assert.equal(C.peopleBadge(-3),null);assert.equal(C.peopleBadge(NaN),null);
 assert.equal(C.peopleBadge(1),'1 on now');assert.equal(C.peopleBadge(8),'8 on now');assert.equal(C.peopleBadge(24),'24 on now');assert.equal(C.peopleBadge(25),'lots on now');
 assert.equal(C.publicCountLabel(0),'Nobody else right now','the panel line at 0');
 const btn=code(read('components/party/PeopleButton.tsx'));
 assert(/const others = pub \? ps\.count \?\? 0 : 0;/.test(btn)&&/const count = !partyLive && pub \? peopleBadge\(others\) : null;/.test(btn),'from presence.count, only in a live world');
 assert(!/setInterval|requestAnimationFrame|fetch\(/.test(btn),'no poll, loop or request');
 assert.equal((btn.match(/setTimeout\(/g)||[]).length,1,'only the hint\'s own close (as in phase 1)');
 assert(/\{partyLive && <span data-party-badge aria-hidden="true" style=\{BADGE\}>\{party\.members\.length\}<\/span>\}/.test(btn),'party badge unchanged');
 assert(/\.peopleCount\{position:absolute/.test(read('components/party/party.module.css')));
});

// ---- 4. holdout reading ---------------------------------------------------------------------------------------------------
const HX=['mp:pub_hx_on_min','mp:pub_hx_on_back','mp:pub_hx_hold_min','mp:pub_hx_hold_back'];
ok('holdout ids allowlisted (client and the SQL counts regex), apart from the phase 1 list',()=>{
 const K=createLoader()('lib/analytics/countIds.ts');
 assert.deepEqual([...K.HOLDOUT_FIXED_IDS].sort(),[...HX].sort());
 for(const id of HX)assert(!K.PUBLIC_FIXED_IDS.includes(id),id);
 const newest=fs.readdirSync('supabase/migrations').filter(f=>/analytics/.test(f)&&/analytics_ingest/.test(read('supabase/migrations/'+f))).sort().pop();
 const re=new RegExp(/where key ~ '(\^\[a-z\]\{1,2\}:[^']+)'/.exec(read('supabase/migrations/'+newest))[1]);
 for(const id of HX){assert(K.isCountId(id),id);assert(K.FIXED_COUNT_IDS.includes(id),id);assert(re.test(id),id);}
});
function events(env){
 const sent=[];
 const E=withEnv(env,()=>createLoader({tracker:{count:id=>sent.push(id)}})('lib/analytics/publicEvents.ts'));
 return {sent,run:fn=>withEnv(env,()=>fn(E))};
}
const play=E=>{E.countPublicArm('hold',true);E.countPublicArm('hold',true);for(let t=0;t<=190_000;t+=1000)E.holdoutFrame(t,true);};
ok('holdout reading OFF by default: arm totals as in phase 1, no per-arm outcomes',()=>{
 for(const env of [[1,1,0],[0,0,1],[1,0,1]]){const x=events(env);x.run(play);assert(!x.sent.some(s=>HX.includes(s)),'nothing per arm '+env);}
 const x=events([1,1,0]);x.run(play);assert.deepEqual(x.sent,['mp:pub_arm_hold'],'phase 1 arm total only');
});
ok('holdout reading ON: returning visit once, whole minutes in the starting arm, nothing else',()=>{
 const x=events([1,1,1]);x.run(play);
 assert.equal(x.sent.filter(s=>s==='mp:pub_hx_hold_back').length,1,'once per tab');
 assert.equal(x.sent.filter(s=>s==='mp:pub_hx_hold_min').length,3,'3 whole minutes in 190 s');
 assert(!x.sent.some(s=>/hx_on_/.test(s)),'the starting arm only');
 const y=events([1,1,1]);y.run(E=>{E.countPublicArm('on',false);for(let t=0;t<=70_000;t+=1000)E.holdoutFrame(t,false);});
 assert(!y.sent.some(s=>HX.includes(s)),'a first visit is not returning; a hidden tab adds no minutes');
 const src=code(read('lib/analytics/publicEvents.ts'));assert(!/fetch\(|setInterval|setTimeout|requestAnimationFrame|localStorage/.test(src),'no request, timer or storage');
 const town=read('components/Town.tsx');
 assert(town.includes("case 'arm':countPublicArm(e.arm,e.back)")&&/publicFrame\(t,othersNear\(\)\);holdoutFrame\(t\);/.test(town),'Town: the arm event and the existing frame');
 assert(/emitPresenceEvent\(\{ type: 'arm', arm, back: holdoutReturning\(\) \}\)/.test(read('lib/multiplayer/publicWorld.ts')));
});
ok('holdoutReturning: true only when the seed was already on the device',()=>{
 const H=createLoader()('lib/multiplayer/holdout.ts'),seed='0123456789abcdef0123456789abcdef';
 const mem=new Map(),st={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)};
 H.resetHoldout();H.holdoutArm(st,()=>seed);assert.equal(H.holdoutReturning(),false,'made now');
 H.resetHoldout();H.holdoutArm(st,()=>seed);assert.equal(H.holdoutReturning(),true,'found');
});
ok('admin reading: off answers "off" and reads nothing; on gives exact per-arm totals',()=>{
 const R=createLoader()('lib/analytics/holdoutReport.ts');
 const trap=new Proxy({},{get(){throw new Error('read while off');}});
 assert.deepEqual(JSON.parse(JSON.stringify(withEnv([1,1,0],()=>R.buildHoldout({counts:trap})))),{status:'off',arms:[],holdShare:null});
 const r=R.buildHoldout({counts:{'mp:pub_arm_on':90,'mp:pub_arm_hold':10,'mp:pub_hx_on_min':450,'mp:pub_hx_hold_min':30,'mp:pub_hx_on_back':45,'mp:pub_hx_hold_back':4}},true);
 assert.equal(r.status,'ok');assert.equal(r.holdShare,0.1);
 assert.deepEqual(JSON.parse(JSON.stringify(r.arms)),[{arm:'on',visits:90,returning:45,minutes:450,minutesPerVisit:5,returningShare:0.5},{arm:'hold',visits:10,returning:4,minutes:30,minutesPerVisit:3,returningShare:0.4}]);
 assert.equal(R.buildHoldout({counts:{}},true).status,'empty');
 assert(/report\.holdout=buildHoldout\(merged\);/.test(read('lib/analytics/report.ts')));
 const dash=read('app/admin/AnalyticsDashboard.tsx'),card=read('app/admin/HoldoutCard.tsx');
 assert(/report\.holdout&&report\.holdout\.status!=='off'&&<div className=\{dd\.mx\}><HoldoutCard h=\{report\.holdout\}\/><\/div>/.test(dash),'hidden while off');
 assert(/if\(!h\|\|h\.status==='off'\)return null;/.test(card)&&!/fetch\(/.test(card),'the card fetches nothing');
 assert(/process\.env\.NEXT_PUBLIC_PUBLIC_HOLDOUT_READING === '1'/.test(read('lib/multiplayer/publicFlag.ts')),'its own build flag');
});
console.log(`mp-public-phase2: ${n} checks passed`);
