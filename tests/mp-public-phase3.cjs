#!/usr/bin/env node
// Public island PHASE 3 (Nov 12 2026; docs/multiplayer/PHASE3-VERIFY.md). Pins:
//  0. The shimmer fix: a card never opens over a note still animating out (toastLane.settle, EXIT_GAP_MS = HudStack's exit).
//  1. Protocol + relay: Cap.Goal (world only), C.Goal [61] / S.Goal [43, n]; the world counts its kids' team goals today (UTC day),
//     rate-limited per member, never from a quarantined member, sent at the 1 Hz hint pass only on change; kept as {day, n} only.
//  2. islandLife: Match o'clock (first 10 min of each UTC hour, rotating pitch), the goal count, busy pitches from rosters (not me),
//     glowFields; nothing outside a world.
//  3. The note: Match o'clock once per hour, the goal-reached note once per day; through the lane; copy reviewed in publicCopy.
//  4. Wiring + heat: Town only behind publicWorldEnabled(); no new timers, polling or loops; glows static and set on change only.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const {createLoader}=require('./summit-harness.cjs');
const {loadTs}=require('../multiplayer/dev-relay/loadTs.cjs');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const code=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
let n=0;const ok=async(name,fn)=>{try{await fn();n++;}catch(e){console.error('FAIL',name);throw e;}};

(async()=>{
// ---- 0. shimmer -------------------------------------------------------------------------------------------------------------
await ok('a card waits for the last note\'s exit animation (the shimmer overlap), then opens',async()=>{
 const {toastLane:L,EXIT_GAP_MS}=createLoader({react:{useSyncExternalStore:()=>false}})('lib/ui/toastLane.ts');
 const hud=read('components/HudStack.tsx');
 assert.equal(EXIT_GAP_MS,+/HUD_EXIT_MS=(\d+)/.exec(hud)[1]+80,'the gap = the exit animation + its clone removal');
 L.reset();assert.equal(L.settle('pub-card'),true,'nothing left recently: no wait');
 assert.equal(L.request('reef'),true);L.release('reef');
 assert.equal(L.settle('pub-card'),false,'the shimmer is still fading out');assert(L.held,'a short quiet hold covers the gap');
 assert.equal(L.request('pub-card'),false);
 await new Promise(r=>setTimeout(r,EXIT_GAP_MS+40));
 assert(!L.held,'the gap ends on its own');assert.equal(L.settle('pub-card'),true);assert.equal(L.request('pub-card'),true,'then the card');
 L.reset();
 for(const [f,id] of [['components/party/PublicFirstCard.tsx','FIRST_CARD_LANE'],['components/party/PeopleButton.tsx','HINT_LANE'],['components/party/IslandLifeToast.tsx','LIFE_LANE']])
  assert(new RegExp(`!toastLane\\.settle\\(${id}\\) \\|\\| !toastLane\\.request\\(${id}\\)`).test(read(f)),f+' settles before it takes the lane');
 assert.doesNotMatch(code(read('lib/ui/toastLane.ts')),/setInterval|requestAnimationFrame/);
});

// ---- 1. protocol + relay -----------------------------------------------------------------------------------------------------
const P=loadTs(path.join(ROOT,'multiplayer/protocol/index.ts'));
const {RoomCore}=loadTs(path.join(ROOT,'multiplayer/relay/src/roomCore.ts'));
const {C,S,Cap,CAPS_WORLD,CAPS_ALL,PROTOCOL_VERSION,ISLAND_GOAL,Mode,Zone}=P;
await ok('protocol: Cap.Goal is a world bit; C.Goal / S.Goal parse; no free text',()=>{
 assert.equal(Cap.Goal,2048);assert.ok(CAPS_WORLD&Cap.Goal);assert.equal(CAPS_ALL&Cap.Goal,0,'a party never gets it');
 assert.equal(C.Goal,61);assert.equal(S.Goal,43);assert.deepEqual({...ISLAND_GOAL,rate:[...ISLAND_GOAL.rate]},{target:50,max:9999,rate:[0.1,3]});
 assert.ok(P.parseClient('[61]'));assert.equal(P.parseClient('[61,1]'),null);assert.equal(P.parseClient('[61,"x"]'),null);
 assert.ok(P.parseServer('[43,12]'));assert.equal(P.parseServer('[43,-1]'),null);assert.equal(P.parseServer('[43,10000]'),null);assert.equal(P.parseServer('[43,"a"]'),null);
});
let seed=7;const random=k=>{const a=new Uint8Array(k);for(let i=0;i<k;i++){seed=(seed*1103515245+12345)&0x7fffffff;a[i]=(seed>>8)&255;}return a;};
const LOOK=[1,2,3,4,5,6,7,8,9,10,11,12];
function room(kind='world',t0=Date.UTC(2026,10,12,9,0,0)){
 const clock={t:t0,now(){return this.t;}},r=new RoomCore({code:'pub-1',createdAt:t0,clock,random,kind});
 const W={clock,room:r,kept:[]};r.onGoal=g=>W.kept.push(g);
 let half=false;W.run=ms=>{for(let e=0;e<ms;e+=100){clock.t+=100;half=!half;if(half)r.halfTick();else r.tick();}};
 return W;
}
function join(W,caps=CAPS_WORLD){
 const p={msgs:[],send(x){p.msgs.push(JSON.parse(x));},close(){}};p.of=op=>p.msgs.filter(m=>m[0]===op);
 W.room.connect(p,false,{ipKey:null,held:false});W.room.message(p,JSON.stringify([C.Hello,PROTOCOL_VERSION,LOOK,null,null]));
 const sc=p.of(S.Caps)[0];if(sc&&caps)W.room.message(p,JSON.stringify([C.Caps,sc[1]&caps]));
 W.room.message(p,JSON.stringify([C.Pose,1,0,0,0,0,0,Mode.Walk,Zone.Main,0]));return p;
}
const last=(p,op)=>{const l=p.of(op);return l.length?l[l.length-1]:undefined;};
await ok('relay: a world counts team goals, sends S.Goal on change at the 1 Hz pass, keeps {day, n} only',()=>{
 const W=room(),a=join(W),b=join(W),old=join(W,CAPS_WORLD&~Cap.Goal);
 assert.deepEqual(last(a,S.Goal),[S.Goal,0],'the first S.Goal right after C.Caps');
 W.room.message(a,'[61]');W.room.message(b,'[61]');
 assert.equal(W.room.goalCount,2);assert.deepEqual(W.kept.map(g=>g.n),[1,2]);assert.deepEqual(Object.keys(W.kept[1]).sort(),['day','n'],'a count only');
 const before=a.of(S.Goal).length;W.run(1200);
 assert.deepEqual(last(a,S.Goal),[S.Goal,2]);assert.deepEqual(last(b,S.Goal),[S.Goal,2]);assert.equal(a.of(S.Goal).length,before+1,'once per change');
 W.run(3000);assert.equal(a.of(S.Goal).length,before+1,'nothing while it stays the same');
 assert.equal(old.of(S.Goal).length,0,'a client without Cap.Goal never gets it');W.room.message(old,'[61]');assert.equal(W.room.goalCount,2,'nor counts');
});
await ok('relay: rate limit per member, quarantine ignored, a party ignores it, a new UTC day starts at 0, restore today only',()=>{
 const W=room(),a=join(W);for(let i=0;i<10;i++)W.room.message(a,'[61]');
 assert.equal(W.room.goalCount,ISLAND_GOAL.rate[1],'burst 3, then one per 10 s');
 W.clock.t+=10_000;W.room.message(a,'[61]');assert.equal(W.room.goalCount,4);
 const Q=room(),q=join(Q);Q.room.members.forEach(m=>{m.quarantined=true;});Q.room.message(q,'[61]');assert.equal(Q.room.goalCount,0,'quarantined: ignored');
 const Pt=room('party');assert.equal(Pt.room.goalCount,0);
 const W2=room('world',Date.UTC(2026,10,12,23,59,0)),c=join(W2);W2.room.message(c,'[61]');assert.equal(W2.room.goalCount,1);
 W2.clock.t+=120_000;assert.equal(W2.room.goalCount,0,'midnight UTC: a new day');W2.run(1200);assert.deepEqual(last(c,S.Goal),[S.Goal,0]);
 const W3=room();W3.room.restoreGoal({day:Math.floor(W3.clock.t/86400000),n:17});assert.equal(W3.room.goalCount,17,'a woken world keeps today');
 const W4=room();W4.room.restoreGoal({day:Math.floor(W4.clock.t/86400000)-1,n:17});assert.equal(W4.room.goalCount,0,'yesterday is dropped');
 W4.room.restoreGoal({day:'x',n:'y'});assert.equal(W4.room.goalCount,0);
 const pr=read('multiplayer/relay/src/partyRoom.ts');
 assert(/core\.onGoal = \(g\) => \{ void this\.state\.storage\.put\('goal', g\); \}/.test(pr)&&/core\.restoreGoal\(goal\)/.test(pr),'the DO keeps {day, n} under "goal"');
 assert.doesNotMatch(read('multiplayer/relay/wrangler.toml'),/goal/i,'no new binding, migration or secret');
});

// ---- 2. islandLife ---------------------------------------------------------------------------------------------------------
const L=createLoader()('lib/multiplayer/islandLife.ts');
await ok('Match o\'clock: the first 10 minutes of each UTC hour, one pitch per hour, rotating',()=>{
 const h=Date.UTC(2026,10,12,15,0,0);
 assert.deepEqual({...L.matchOClock(h)},{on:true,field:L.MATCH_OCLOCK_FIELDS[Math.floor(h/3600000)%4],hour:Math.floor(h/3600000)});
 assert.equal(L.matchOClock(h+9*60000+59000).on,true);assert.equal(L.matchOClock(h+10*60000).on,false);assert.equal(L.matchOClock(h-1).on,false);
 const f=new Set();for(let i=0;i<4;i++)f.add(L.matchOClock(h+i*3600000).field);assert.equal(f.size,4,'four pitches in turn');
 assert(!L.MATCH_OCLOCK_FIELDS.includes('11v11'));
});
await ok('islandLife: goal count, busy pitches (not me), glows; all cleared outside a world',()=>{
 L.islandLife.reset();
 const subs=new Set(),st=new Set();const c={kind:'world',status:'live',sent:0,onMessage(f){subs.add(f);return()=>subs.delete(f);},onStatus(f){st.add(f);return()=>st.delete(f);},sendGoal(){c.sent++;return true;}};
 const recv=m=>subs.forEach(f=>f(m));let changes=0;const off=L.islandLife.subscribe(()=>changes++);
 const detach=L.attachIslandLife(c,()=>5);
 assert.equal(L.islandLife.get().inWorld,true);
 recv([43,12]);assert.equal(L.islandLife.get().goal,12);const ch=changes;recv([43,12]);assert.equal(changes,ch,'same count: no re-render');
 recv([40,0,4,5,5,0,1]);assert.deepEqual(L.islandLife.get().busy,[],'only me on the beach court: not busy');
 recv([40,0,4,5,5,0,1,9,1,2]);assert.deepEqual(L.islandLife.get().busy,['beach'],'another kid on it');
 recv([40,0,0,9,9,0,0]);assert.deepEqual(L.islandLife.get().busy,['7v7','beach']);
 recv([40,0,0,-1]);assert.deepEqual(L.islandLife.get().busy,['beach'],'an empty roster');
 L.lifeFrame(0,Date.UTC(2026,10,12,16,30,0));assert.deepEqual(L.glowFields(),['beach'],'not Match o\'clock: busy only');
 L.lifeFrame(500,Date.UTC(2026,10,12,17,2,0),3);assert.equal(L.islandLife.get().clock.on,false,'sampled at most once a second');
 L.lifeFrame(1000,Date.UTC(2026,10,12,17,2,0),0);assert.equal(L.islandLife.get().clock.on,true);
 assert.deepEqual(L.glowFields(),['beach'],'owner Nov 12: nobody else online, no Match o\'clock glow');
 L.lifeFrame(2000,Date.UTC(2026,10,12,17,2,0),2);assert.equal(L.islandLife.get().company,true);
 assert.deepEqual(L.glowFields(),[...new Set(['beach',L.islandLife.get().clock.field])].sort(),'plus the Match o\'clock pitch');
 assert.equal(L.noteTeamGoal(),true);assert.equal(c.sent,1);
 c.kind='party';st.forEach(f=>f());
 assert.deepEqual({inWorld:L.islandLife.get().inWorld,goal:L.islandLife.get().goal,busy:L.islandLife.get().busy},{inWorld:false,goal:null,busy:[]});
 assert.deepEqual(L.glowFields(),[],'no glow outside a world');assert.equal(L.noteTeamGoal(),false,'nothing sent outside a world');
 recv([43,30]);assert.equal(L.islandLife.get().goal,null,'a party frame is ignored');
 detach();off();
});

// ---- 3. the note -----------------------------------------------------------------------------------------------------------
await ok('the note: Match o\'clock once an hour (pitch name, goal or a tip); the goal-reached note once a day, first',()=>{
 const T=createLoader({'CostumeMilestoneToast.module.css':{},'HudStack':{default:()=>null},'publicNear':{publicNear:{subscribe:()=>()=>{},busy:()=>false}}})('components/party/IslandLifeToast.tsx');
 const C=createLoader()('lib/multiplayer/publicCopy.ts');
 const hour=Math.floor(Date.UTC(2026,10,12,17,2,0)/3600000),s={inWorld:true,company:true,goal:23,busy:[],clock:{on:true,field:'beach',hour}};
 T.resetLifeToast();
 const a=T.lifeNote(s,Date.now());assert.equal(a.kind,'clock');assert.equal(a.title,'It’s Match o’clock!');
 assert.equal(a.body,'Kids are meeting at Sharks Beach Court. Follow the gold light and join the match.');assert.equal(a.extra,'Island goal today: 23 of 50 goals');
 assert(C.MATCH_OCLOCK_TIPS.includes(T.lifeNote({...s,goal:null},Date.now()).extra),'no count yet: a football tip');
 assert.equal(T.lifeNote({...s,inWorld:false},Date.now()),null,'nothing outside a world');
 assert.equal(T.lifeNote({...s,company:false},Date.now()),null,'owner Nov 12: no Match o\'clock note on an empty island');
 assert.equal(T.lifeNote({...s,clock:{...s.clock,on:false}},Date.now()),null);
 const g=T.lifeNote({...s,goal:50},Date.now());assert.equal(g.kind,'goal','the goal reached goes first');assert.equal(g.body,'Kids on this island scored 50 goals today. Great teamwork!');
 assert.equal(C.ISLAND_GOAL_COPY.line(61,50),'Island goal today: 50 of 50 goals','never over the target');
 const src=read('components/party/IslandLifeToast.tsx');assert(/shownKeys\.add\(n\.key\)/.test(src),'each note once (per hour / per day, this visit)');
 const all=C.allPublicCopy();for(const x of [a.title,a.body,a.extra,g.title,g.body,...C.MATCH_OCLOCK_TIPS])assert(all.includes(x),'reviewed copy: '+x);
 for(const x of all)assert(!/\bsafe(ly|ty)?\b/i.test(x)&&!/[\u{1F300}-\u{1FAFF}]/u.test(x),x);
});

// ---- 4. wiring + heat ------------------------------------------------------------------------------------------------------
await ok('Town wiring behind the flag; no new timers, polling or loops; glows static',()=>{
 const town=read('components/Town.tsx');
 assert(/const offLife=attachIslandLife\(partyConnection\(\),\(\)=>partyStore\.get\(\)\.you\?\?-1\);/.test(town),'attached inside the publicWorldEnabled() effect');
 assert(/offEvents\(\);offLife\(\);pub\.dispose\(\)/.test(town));
 assert(/if\(publicWorldEnabled\(\)\)\{const lm=liveJoin\.onMatch;liveJoin\.onMatch=e=>\{lm\?\.\(e\);if\(e\.type==='goal'&&e\.mine\)noteTeamGoal\(\);\};\}/.test(town),'my team\'s goal, flag on only');
 assert(/const activityGlows=publicWorldEnabled\(\)\?createActivityGlows\(scene\):null;/.test(town));
 assert(/if\(publicWorld\.current\)\{const t=performance\.now\(\);lifeFrame\(t,Date\.now\(\),publicCount\(\)\);activityGlows\?\.frame\(camera,t\);/.test(town),'the clock and the glow fade ride the existing public frame');
 assert(/\{publicWorldEnabled\(\)&&ready&&!failed&&<IslandLifeToast blocked=\{toastBlocked\}\/>\}/.test(town));
 assert(town.includes('liveJoin.onMatch=e=>liveMatch.on(e)'),'the live-match analytics hook is unchanged');
 for(const f of ['lib/multiplayer/islandLife.ts','lib/graphics/activityGlow.ts','components/party/IslandLifeToast.tsx'])assert.doesNotMatch(code(read(f)),/setInterval|requestAnimationFrame|fetch\(|localStorage/,f);
 const glow=code(read('lib/graphics/activityGlow.ts'));assert(/if \(k === key\) return;/.test(glow),'set() does nothing unless the list changed');
 assert.doesNotMatch(read('components/FriendMapDots.tsx'),/islandLife|activityGlow/,'never on the map');
 const panel=read('components/party/PresenceChoice.tsx');assert(!/data-island-goal/.test(panel),'no island-goal count line in the Who\'s here panel (owner, Nov 13 2026)');
});

console.log(`mp-public-phase3 ok (${n} groups)`);
})().catch(e=>{console.error(e);process.exit(1);});
