#!/usr/bin/env node
// Public island copy, policy and analytics (Nov 11 2026, phase 1; docs/multiplayer-public-island-plan-2026-11-11.md, Agent E).
//  1. Flag OFF (the live site): the privacy policy (rendered), the safety facts / FAQs, the /play description and the grown-ups'
//     line are exactly today's (tests/fixtures/mp-public-copy-off.json). NEXT_PUBLIC_PUBLIC_WORLD=1 alone (without
//     NEXT_PUBLIC_MULTIPLAYER=1) is still off.
//  2. Flag ON: the statements public play needs are present, the sentences that would be false are gone, nothing banned.
//  3. Every mp:pub_* id is allowlisted (client + SQL counts regex); the helpers are silent with the flag off and throttled on.
//  4. The holdout arm is stable per seed and ~10% over 10,000 seeds; its device key is classified and never synced.
//  5. The admin block and route: inert with the flag off, session first, the token server-only.
// usage: node tests/mp-public-copy.cjs            node tests/mp-public-copy.cjs --update   (re-pin the flag-off snapshot)
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const {createLoader}=require('./summit-harness.cjs');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const SNAP=path.join(__dirname,'fixtures/mp-public-copy-off.json');
const css=new Proxy({},{get:(_,k)=>typeof k==='string'?k:undefined});
const stub=()=>null;
const OVR={'PrivacyPolicy.module.css':css,'admin.module.css':css,
 'landing/Landing':{default:stub},'IslandLoadingStatic':{default:stub},'root/RootSwitch':{default:stub},'lib/rootView':{ROOT_VIEW_BOOT:''},
 'seo/JsonLd':{default:stub},'site/seo':{playLd:()=>({})},'islandBrushPreload':{preloadIslandBrush(){}}};
function withFlag(on,fn,{mp=on}={}){
 const keep={m:process.env.NEXT_PUBLIC_MULTIPLAYER,p:process.env.NEXT_PUBLIC_PUBLIC_WORLD};
 const set=(k,v)=>{if(v===undefined)delete process.env[k];else process.env[k]=v;};
 set('NEXT_PUBLIC_MULTIPLAYER',mp?'1':undefined);set('NEXT_PUBLIC_PUBLIC_WORLD',on?'1':undefined);
 try{return fn(createLoader(OVR));}finally{set('NEXT_PUBLIC_MULTIPLAYER',keep.m);set('NEXT_PUBLIC_PUBLIC_WORLD',keep.p);}
}
const surfaces=L=>{
 const S=L('lib/site/safety.ts');
 return {policy:renderToStaticMarkup(React.createElement(L('components/privacy/PrivacyPolicy.tsx').default)),
  safety:JSON.stringify({facts:S.SAFE_FACTS,faq:S.SAFE_FAQ,hub:S.HUB_COMMON_FAQ,trust:S.SAFE_TRUST_LINE}),
  play:JSON.stringify(L('app/play/page.tsx').metadata),
  // Verify pass (Nov 11 2026): the /learn hub words and the About grown-ups' privacy line, also flag-aware.
  // Only the entries the flag can change are pinned (the rest of the hub is other agents' copy and changes on its own).
  site:(()=>{const F=L('lib/site/learnFeatures.ts');return JSON.stringify({trust:F.LEARN_TOGETHER_TRUST,not:F.LEARN_TOGETHER_NOT,features:F.LEARN_FEATURES.filter(f=>f.id==='friends-safety'),faq:F.LEARN_FAQ.filter(f=>f.group==='together'),about:L('lib/site/aboutCopy.ts').GROWN_UPS.privacy});})()};
};
const text=h=>h.replace(/<[^>]+>/g,' ').replace(/&#x27;/g,'’').replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/\s+/g,' ');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
let n=0;const ok=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};

const OFF=withFlag(false,surfaces),ON=withFlag(true,surfaces);
if(process.argv.includes('--update')){
 fs.mkdirSync(path.dirname(SNAP),{recursive:true});
 fs.writeFileSync(SNAP,JSON.stringify({note:'Flag-off output of the policy, safety lists and /play metadata (tests/mp-public-copy.cjs --update).',
  sha:{policy:sha(OFF.policy),safety:sha(OFF.safety),play:sha(OFF.play),site:sha(OFF.site)},...OFF},null,1)+'\n');
 console.log('mp-public-copy: snapshot written');process.exit(0);
}
const snap=JSON.parse(fs.readFileSync(SNAP,'utf8'));

// ---- 1. flag off = today --------------------------------------------------------------------------------------------------
ok('flag off: the policy renders byte for byte as today',()=>{
 if(OFF.policy!==snap.policy){let i=0;while(OFF.policy[i]===snap.policy[i])i++;assert.fail('policy differs at '+i+': …'+OFF.policy.slice(Math.max(0,i-60),i+60));}
 assert.equal(sha(snap.policy),snap.sha.policy);
});
ok('flag off: safety facts, FAQs and /play metadata as today',()=>{
 assert.equal(OFF.safety,snap.safety);assert.equal(OFF.play,snap.play);assert.equal(OFF.site,snap.site,'learn hub + about line as today');
 const S=withFlag(false,L=>L('lib/site/safety.ts'));
 assert.deepEqual(S.SAFE_FACTS,S.SAFE_FACTS_TODAY);assert.deepEqual(S.SAFE_FAQ,S.SAFE_FAQ_TODAY);assert.deepEqual(S.HUB_COMMON_FAQ,S.HUB_COMMON_FAQ_TODAY);
});
ok('the public-world flag alone (multiplayer off) is still off',()=>{
 const half=withFlag(true,surfaces,{mp:false});assert.equal(half.policy,snap.policy);assert.equal(half.safety,snap.safety);assert.equal(half.play,snap.play);assert.equal(half.site,snap.site);
 assert.equal(withFlag(true,L=>L('lib/multiplayer/publicFlag.ts').publicWorldEnabled(),{mp:false}),false);
 assert.equal(withFlag(true,L=>L('lib/multiplayer/publicFlag.ts').publicWorldEnabled()),true);
 assert.match(read('lib/multiplayer/publicFlag.ts'),/process\.env\.NEXT_PUBLIC_PUBLIC_WORLD === '1'/,'read literally so Next inlines it');
});
const GU_OFF='No ads and no chat with other players. Printing a report or plan happens on this device.';
ok('flag off: the grown-ups line is today\'s (source pinned: the sheet is a client component with the whole game behind it)',()=>{
 const g=read('components/GrownUps.tsx');
 assert(g.includes(`<li>{publicWorldEnabled()?'`)&&g.includes(`':'${GU_OFF}'}</li>`),'one text child either way, the off branch is today\'s line');
 assert.equal(g.split(GU_OFF).length,2,'today\'s line once');
});

ok('flag on: the learn hub and About no longer say "never with strangers", "no public lobbies" or "Allowed or Off"',()=>{
 for(const re of [/never with strangers/,/no public lobbies/i,/Allowed or Off/])assert.doesNotMatch(ON.site,re);
 for(const re of [/Other players and friends, Friends only, or Off/,/name the game makes up/,/hide or report/])assert.match(ON.site,re);
 assert.notEqual(ON.site,OFF.site);
});

// ---- 2. flag on: what is true for public play ------------------------------------------------------------------------------
const P=text(ON.policy);
ok('flag on: the policy states what is true for public play',()=>{
 for(const re of [/other players and play with friends/i,/children playing Futbol Island at the same time can see each other/,
  /outdoors and in the Arcade, the Shop, the Museum and the Konbini/,/name the game makes up \(a colour and an animal\), which changes every visit/,
  /colours and shirt number/,/how they move/,/preset waves, cheers and football calls/,/never see the first name typed for a party/,/drawing/,
  /no free-text chat, no voice/,/on by default/,/finished the welcome tutorial/,/people button/,/Just me/,/Friends only/,/Other players and friends/,
  /Hide and Report/,/Following, In my way, Too many waves, or Something else/,/only how many reports were made each day for each reason/,
  /same Cloudflare service/,/Cloudflare runs the service for Play with friends and for seeing other players/,/about 15 MB of mobile data an hour \(our estimate/,
  /counts from playing with other players/,/reports by their reason/,/1 in 10 devices start as Just me/,/stop other players being shown/,
  /Reports about another player/,/in memory for about an hour/i])
  assert.match(P,re,re.source);
 assert(P.includes('Last updated '+withFlag(true,L=>L('components/privacy/PrivacyPolicy.tsx').POLICY_UPDATED_PUBLIC)+'.'),'the public date');
});
ok('flag on: the sentences that would be false are gone',()=>{
 for(const s of ['Friends in a party can only use preset emotes.','we keep privacy-protective settings on by default, and we do not nudge',
  'Cloudflare runs the party service for Play with friends: messages pass through it while a party is in use','7a. Play with friends (optional)'])
  assert(!P.includes(s),'still says: '+s);
 const S=withFlag(true,L=>L('lib/site/safety.ts'));
 const strangers=S.SAFE_FAQ.find(f=>f.q==='Can my child chat with strangers?').a;
 assert(!/Friends in a private party, started by a grown-up and joined by code, can only use preset emotes\./.test(strangers)&&/hide or report/.test(strangers)&&/switch other players off/.test(strangers));
 assert(/Other kids playing at the same time/.test(S.SAFE_FACTS.find(f=>f.title==='No open chat').text));
 assert(/Friends only, or Off/.test(S.SAFE_FACTS.find(f=>f.title==='Grown-ups stay in charge').text));
 assert(/switch other players off/.test(S.HUB_COMMON_FAQ.find(f=>f.q==='Is it safe for kids?').a));
 assert.equal(S.SAFE_FACTS.length,S.SAFE_FACTS_TODAY.length);assert.deepEqual(S.SAFE_FACTS.map(f=>f.title),S.SAFE_FACTS_TODAY.map(f=>f.title));
 const md=JSON.parse(ON.play);assert(md.description.length<=155&&!/\bsafe\b/i.test(md.description)&&/other players/.test(md.description));
 assert.equal(md.openGraph.description,md.description);
});
ok('no banned claims, and the child-facing copy never says "safe"',()=>{
 const S=withFlag(true,L=>L('lib/site/safety.ts')),C=withFlag(true,L=>L('lib/multiplayer/publicCopy.ts'));
 const gOn=/<li>\{publicWorldEnabled\(\)\?'([^']+)'/.exec(read('components/GrownUps.tsx'))[1];
 const all=[P,ON.safety,ON.play,gOn,...C.allPublicCopy()];
 for(const t of all)for(const b of S.BANNED_CLAIMS)assert(!b.test(t),`"${b.source}" in: ${t.slice(0,80)}`);
 for(const t of [...C.allPublicCopy(),gOn])assert(!/\bsafe(ly|ty)?\b/i.test(t),'never promise safety: '+t);
 assert.equal(C.PRESENCE_CHOICES.length,3);assert.equal(C.REPORT_REASONS.length,4);assert.equal(C.PLAY_LOCK_SETTINGS.length,3);
 assert.equal(C.publicCountLabel(0),'Nobody else right now');assert.equal(C.publicCountLabel(8),'8 on now');assert.equal(C.publicCountLabel(30),'30 on now');
 assert.equal(C.publicCountLabel(31),'lots on now');assert.equal(C.publicChoiceLabel(8),'With other players · 8 on now');
 assert.deepEqual(C.REPORT_REASONS.map(r=>r.id),[...withFlag(true,L=>L('lib/analytics/countIds.ts')).PUBLIC_REPORT_REASONS]);
});

// ---- 3. counters ---------------------------------------------------------------------------------------------------------
const IDS=['mp:pub_arm_on','mp:pub_arm_hold','mp:pub_connect','mp:pub_seen','mp:pub_min','mp:pub_switch_solo','mp:pub_switch_on','mp:pub_hide',
 'mp:pub_report_following','mp:pub_report_inmyway','mp:pub_report_waves','mp:pub_report_other','mp:pub_full','mp:pub_unreachable','mp:pub_hint','mp:pub_match_join'];
ok('every mp:pub_* id is allowlisted (client and the SQL counts regex)',()=>{
 const K=createLoader()('lib/analytics/countIds.ts');
 assert.deepEqual([...K.PUBLIC_FIXED_IDS].sort(),[...IDS].sort());
 const newest=fs.readdirSync('supabase/migrations').filter(f=>/analytics/.test(f)&&/analytics_ingest/.test(read('supabase/migrations/'+f))).sort().pop();
 const re=new RegExp(/where key ~ '(\^\[a-z\]\{1,2\}:[^']+)'/.exec(read('supabase/migrations/'+newest))[1]);
 for(const id of IDS){assert(K.isCountId(id),id);assert(K.FIXED_COUNT_IDS.includes(id),id);assert(K.COUNT_KEY_RE.test(id),id);assert(re.test(id),id+' passes '+newest);}
 assert.equal(new Set(K.FIXED_COUNT_IDS).size,K.FIXED_COUNT_IDS.length,'no duplicate fixed ids');
});
function events(on){
 const sent=[];
 const E=withFlag(on,()=>createLoader({...OVR,tracker:{count:id=>sent.push(id)}})('lib/analytics/publicEvents.ts'));
 return {E,sent,run:fn=>withFlag(on,()=>fn(E))};
}
const fire=E=>{E.countPublicArm('on');E.countPublicArm('hold');E.countPublicConnect();E.countPublicSeen();E.countPublicSwitch('solo');E.countPublicSwitch('public');
 E.countPublicHide();for(const r of ['following','inmyway','waves','other','bogus'])E.countPublicReport(r);E.countPublicFallback('full');E.countPublicFallback('unreachable');
 E.countPublicHint();E.countPublicMatchJoin();for(let t=0;t<=130_000;t+=1000)E.publicFrame(t,true,true);};
ok('helpers are silent with the flag off',()=>{const x=events(false);x.run(fire);assert.deepEqual(x.sent,[]);});
ok('helpers count with the flag on, once / capped per session, minutes from the frame',()=>{
 const x=events(true);x.run(E=>{fire(E);fire(E);for(let i=0;i<30;i++)E.countPublicConnect();});
 for(const id of IDS)assert(x.sent.includes(id),id+' sent');
 for(const id of ['mp:pub_seen','mp:pub_hint','mp:pub_arm_on','mp:pub_arm_hold'])assert.equal(x.sent.filter(s=>s===id).length,1,id+' once');
 assert.equal(x.sent.filter(s=>s==='mp:pub_connect').length,x.E.PUBLIC_EVENT_CAP,'capped');
 assert(x.sent.filter(s=>s==='mp:pub_min').length>=2,'whole minutes');
 assert(x.sent.every(s=>IDS.includes(s)),'nothing else');
 const src=read('lib/analytics/publicEvents.ts');assert(!/fetch\(|setInterval|setTimeout|requestAnimationFrame|localStorage/.test(src.replace(/\/\*[\s\S]*?\*\//g,'')),'no request, timer or storage');
});

// ---- 4. holdout ----------------------------------------------------------------------------------------------------------
ok('holdout: stable per seed, about 10% over 10,000 seeds, only the default mode',()=>{
 const H=createLoader()('lib/multiplayer/holdout.ts');
 const seed='0123456789abcdef0123456789abcdef';for(let i=0;i<5;i++)assert.equal(H.holdoutArmFor(seed),H.holdoutArmFor(seed));
 let hold=0;for(let i=0;i<10000;i++)if(H.holdoutArmFor(crypto.randomBytes(16).toString('hex'))==='hold')hold++;
 assert(hold>850&&hold<1150,'share '+hold/100+'%');
 const mem=new Map(),st={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)};
 H.resetHoldout();const a=H.holdoutArm(st,()=>seed);assert.equal(mem.get('fi2-holdout-v1'),seed);
 H.resetHoldout();assert.equal(H.holdoutArm(st,()=>'ffffffffffffffffffffffffffffffff'),a,'the stored seed wins');
 H.resetHoldout();assert.equal(H.holdoutArm(null),'on','no storage: today\'s default');
 H.resetHoldout();assert.equal(H.holdoutArm({getItem:()=>{throw new Error('blocked');},setItem(){}}),'on');
 assert.equal(H.holdoutDefaultMode('hold'),'solo');assert.equal(H.holdoutDefaultMode('on'),'public');
 const src=read('lib/multiplayer/holdout.ts');assert(!/fetch\(|lib\/analytics|lib\/saves|fi2-install-v1|sendBeacon/.test(src.replace(/\/\*[\s\S]*?\*\//g,'')),'the seed never leaves the device');
});
ok('holdout and presence keys are device-only, never synced',()=>{
 const S=createLoader()('lib/saves/snapshot.ts');
 for(const k of ['fi2-holdout-v1','fi2-presence-mode-v1','fi2-public-hint-v1']){assert(S.DEVICE_KEYS.includes(k),k);assert(!S.isSyncKey(k),k);}
 assert(read('docs/accounts-design.md').includes('`fi2-holdout-v1`'));
});

// ---- 5. admin ------------------------------------------------------------------------------------------------------------
ok('admin: the relay answers are read in one place; missing fields are "not reported", never zero',()=>{
 const A=createLoader()('lib/analytics/publicWorldAdmin.ts'),day='2026-11-11';
 const s=A.shapePublicWorld({days:{[day]:{'rl:report_following':2,'rl:report_too_many_waves':1,'rl:quarantine':1}}},{public:true,tokenSet:true,shards:[{shard:1,n:20},{shard:2,n:11}],total:31},day,true);
 assert.deepEqual(JSON.parse(JSON.stringify(s)),{status:'ok',day,canControl:true,open:true,worlds:2,players:31,reports:{following:2,inmyway:0,waves:1,other:0},quarantines:1});
 const e=A.shapePublicWorld({days:{}},null,day,false);assert(e.open===null&&e.worlds===null&&e.reports===null&&e.quarantines===null);
 // The relay's own ids (read only: multiplayer/** belongs to the relay agent).
 const core=read('multiplayer/relay/src/relayStatsCore.ts'),types=read('multiplayer/protocol/types.ts');
 for(const id of Object.values(A.RELAY_REPORT_IDS))assert(core.includes("'rl:report_'")&&new RegExp("'"+id.slice(10)+"'").test(types),id+' is a relay report id');
 assert(core.includes("'rl:quarantine'"),'rl:quarantine is a relay id');
 const C=createLoader()('lib/multiplayer/publicCopy.ts'),RR=/ReportReason = \{([^}]*)\}/.exec(types)[1];
 assert.deepEqual(C.REPORT_REASONS.map(r=>r.wire),['Following','InMyWay','TooManyWaves','SomethingElse'].map(k=>Number(new RegExp(k+': (\\d)').exec(RR)[1])),'wire ints = protocol ReportReason');
 assert.deepEqual(A.publicControlConfig({RELAY_STATS_URL:'https://r.example/stats',RELAY_CONTROL_TOKEN:'t'}),{url:'https://r.example/control',token:'t'});
 assert.equal(A.publicControlConfig({RELAY_STATS_URL:'https://r.example/stats'}),null);
});
(async()=>{
 const A=createLoader()('lib/analytics/publicWorldAdmin.ts'),calls=[];
 const env={RELAY_STATS_URL:'https://r.example/stats',RELAY_STATS_TOKEN:'s',RELAY_CONTROL_TOKEN:'c'};
 const r=await A.setPublicWorldOpen(false,{env,fetchImpl:async(u,o)=>{calls.push([u,o]);return {ok:true,status:200,text:async()=>'{"public":false}'};}});
 assert.deepEqual(r,{ok:true,status:'ok',open:false});assert.equal(calls[0][0],'https://r.example/control');
 assert.equal(calls[0][1].method,'POST');assert.equal(calls[0][1].headers.Authorization,'Bearer c');assert.equal(calls[0][1].body,'{"public":false}');
 assert.equal((await A.setPublicWorldOpen(true,{env:{}})).status,'not-configured');
 assert.equal((await A.setPublicWorldOpen(true,{env,fetchImpl:async()=>{throw new Error('down');}})).status,'error');
 assert.equal((await A.fetchPublicWorld({env,fetchImpl:async()=>({ok:false,status:401,text:async()=>''})})).status,'unauthorized');
 assert.equal((await A.fetchPublicWorld({env:{}})).status,'not-configured');
 const both=await A.fetchPublicWorld({env,now:Date.UTC(2026,10,11,12),fetchImpl:async u=>({ok:true,status:200,text:async()=>/control/.test(u)?'{"public":false,"shards":[],"total":0}':'{"days":{"2026-11-11":{"rl:report_in_my_way":3}}}'})});
 assert.equal(both.open,false);assert.equal(both.worlds,0);assert.equal(both.reports.inmyway,3);
 n++;// the kill switch posts {public} with the bearer, never throws
 ok('admin route: session first, same-origin POST, token server-only; the block is inert with the flag off',()=>{
  const route=read('app/api/admin/public-world/route.ts');
  assert(route.indexOf('status:401')<route.indexOf('fetchPublicWorld()'),'GET checks the session first');
  const post=route.slice(route.indexOf('export async function POST'));assert(post.indexOf('sameOrigin')<post.indexOf('authed()')&&post.indexOf('authed()')<post.indexOf('setPublicWorldOpen('));
  const client=read('app/admin/RelayHealth.tsx').replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
  assert(!/process\.env|relayStatsAdmin|from '@\/lib\/analytics\/publicWorldAdmin'/.test(client.replace(/import type[^;]*;/g,'')),'no server module or env in the client file');
  const render=(on,props)=>withFlag(on,()=>{const L=createLoader({...OVR,'LivePanel.module.css':css,'IslandTravelMap.module.css':css,'DoneButton.module.css':css,'Icon.module.css':css});
   return renderToStaticMarkup(React.createElement(L('app/admin/RelayHealth.tsx').default,props));});
  const RT=createLoader()('lib/analytics/relayStatsTypes.ts'),relay=RT.shapeRelayStats(RT.relayStatsFixture('2026-10-19',7));
  const off=render(false,{from:'2026-10-19',to:'2026-10-25',initial:relay});assert(!/data-public-world/.test(off)&&/data-relay-health/.test(off),'flag off: no public block');
  const st={status:'ok',day:'2026-11-11',open:true,worlds:2,players:31,reports:{following:2,inmyway:0,waves:1,other:0},quarantines:1,canControl:true};
  const on=render(false,{from:'2026-10-19',to:'2026-10-25',initial:relay,publicInitial:st});
  assert(/data-public-world="true" data-status="ok"/.test(on)&&/Players in public now/.test(on)&&/Following 2/.test(on)&&/Close public islands/.test(on),'the block renders');
 });
 console.log(`mp-public-copy: ${n} checks passed`);
})().catch(e=>{console.error(e);process.exit(1);});
