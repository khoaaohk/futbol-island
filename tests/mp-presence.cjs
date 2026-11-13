// Public island client (Nov 11 2026, docs/multiplayer-public-island-plan-2026-11-11.md, contract docs/multiplayer/WORLD-HANDOFF.md):
// presence mode resolution, the three-way grown-up lock, the world connection (lobby, caps, no nick / Ping / Hit / Rename, Quiet rate,
// close codes, Full re-ask, silent fallback + retry schedule), the lazy-connect driver, switching, Hide / Report + the emote cap, and
// room pages resuming the same shard. Mock WebSocket, fake fetch, fake clock. No network.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),req=require('node:module').createRequire(ROOT+'/package.json'),outs=new Map();
function resolveTs(from,id){const base=path.resolve(path.dirname(from),id);return fs.existsSync(base+'.ts')?base+'.ts':path.join(base,'index.ts');}
function js(file){if(!outs.has(file))outs.set(file,ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText);return outs.get(file);}
const memStore=()=>{const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),map:m};};
/** A fresh copy of every module (module-level state reset), sharing one fake browser. */
function world(env={NEXT_PUBLIC_MULTIPLAYER:'1',NEXT_PUBLIC_MULTIPLAYER_URL:'http://127.0.0.1:8790',NEXT_PUBLIC_PUBLIC_WORLD:'1'}){
  const cache=new Map(),local=memStore(),session=memStore(),win=new EventTarget();
  const g={Math,Date,JSON,Number,Array,Object,Error,Map,Set,Promise,Float64Array,Uint8Array,Int16Array,Symbol,console,URL,process:{env},
    performance:{now:()=>0},localStorage:local,sessionStorage:session,window:win,Event,crypto:undefined};
  function load(file){if(cache.has(file))return cache.get(file).exports;const mod={exports:{}};cache.set(file,mod);
    vm.runInNewContext(js(file),{...g,exports:mod.exports,module:mod,require:id=>id.startsWith('.')?load(resolveTs(file,id)):id.startsWith('@/')?load(resolveTs(path.join(ROOT,'x'),'./'+id.slice(2))):req(id)});
    return mod.exports;}
  const L=p=>load(path.join(ROOT,p+'.ts'));
  return{L,local,session,env,P:L('multiplayer/protocol/index'),conn:L('lib/multiplayer/connection'),pm:L('lib/multiplayer/presenceMode'),pw:L('lib/multiplayer/publicWorld'),
    st:L('lib/multiplayer/store'),sg:L('lib/multiplayer/strangers'),sm:L('lib/multiplayer/sharedMatch'),idx:L('lib/multiplayer/index'),al:L('lib/multiplayerAllowed'),ho:L('lib/multiplayer/holdout')};}

function makeClock(){let now=1e6,seq=0;const timers=[],delays=[];
  return{now:()=>now,delays,setTimeout:(fn,ms)=>{const h={id:++seq,at:now+ms,fn};timers.push(h);delays.push(ms);return h.id;},
    clearTimeout:id=>{const i=timers.findIndex(x=>x.id===id);if(i>=0)timers.splice(i,1);},
    advance(ms){const end=now+ms;for(;;){timers.sort((a,b)=>a.at-b.at);const nx=timers[0];if(!nx||nx.at>end)break;timers.shift();now=Math.max(now,nx.at);nx.fn();}now=end;},
    pending:()=>timers.length};}
const flush=async()=>{for(let i=0;i<6;i++)await new Promise(r=>setImmediate(r));};
/** The page: one connection (with a fake socket / fetch / clock), bound to the store like roomParty.partyConnection(). */
function page(W,opts={}){
  const clock=opts.clock||makeClock(),sockets=[],calls=[];let lobby=opts.lobby||(()=>({status:200,body:{open:true,shard:1,n:3}}));
  class WS{constructor(url){this.url=url;this.readyState=0;this.sent=[];sockets.push(this);}send(s){this.sent.push(s);}close(){this.readyState=3;}
    open(){this.readyState=1;this.onopen&&this.onopen();}recv(m){this.onmessage&&this.onmessage({data:JSON.stringify(m)});}
    drop(code){this.readyState=3;this.onclose&&this.onclose(code===undefined?undefined:{code});}}
  let hidden=false;const vsubs=[];
  const fetch=url=>{calls.push(url);const r=lobby(url);if(r==='neterr')return Promise.reject(new Error('offline'));return Promise.resolve({ok:r.status===200,status:r.status,json:()=>Promise.resolve(r.body)});};
  const c=W.conn.createPartyConnection({WebSocketImpl:WS,now:clock.now,random:()=>0.5,setTimeout:clock.setTimeout,clearTimeout:clock.clearTimeout,
    visibility:{hidden:()=>hidden,on:fn=>{vsubs.push(fn);return()=>{};}},storage:opts.storage||memStore(),tabStorage:opts.tab||W.session,locks:null,fetch,online:()=>true});
  W.idx.bindConnection(c,clock.now);W.pw.attachWorldConnection(c);
  return{c,clock,sockets,calls,last:()=>sockets[sockets.length-1],setLobby(f){lobby=f;},setHidden(h){hidden=h;vsubs.forEach(f=>f());},
    msgs:s=>s.sent.map(x=>JSON.parse(x)),all(){return sockets.flatMap(s=>s.sent.map(x=>JSON.parse(x)));}};}
const LOOK=[0,1,2,3,4,5,6,7,8,9,10,0];
const pose=(x=0,z=0)=>[x,0,z,0,0,1,0,0];
const wWelcome=(you=21,others=[[22,[3,0]],[23,[5,7]]],tok='wtok-abcdefghij0123')=>[20,1,you,tok,0,0,0,[[you,[2,4],LOOK,0,pose()],...others.map(([id,n])=>[id,n,LOOK,0,pose(10,10)])]];
async function live(p,W,{caps=1995}={}){p.c.joinWorld({look:LOOK});await flush();p.last().open();p.last().recv(wWelcome());p.last().recv([32,caps]);return p.last();}

let n=0;const T=[];const t=(name,fn)=>T.push([name,fn]);

// ---- 1. the decision table ----
t('resolvePresence: flag, each lock value, tutorial, stored choice, party wins, relay closed / unavailable',()=>{
  const W=world(),R=i=>W.pm.resolvePresence({flag:true,lock:'all',tutorialDone:true,relay:'open',party:false,choice:'public',...i});
  const eq=(i,mode,reason)=>assert.deepEqual(JSON.parse(JSON.stringify(R(i))),{mode,reason},JSON.stringify(i));
  eq({},'public',null);
  eq({flag:false},'solo','flag');
  eq({lock:'friends'},'solo','locked-friends');
  eq({lock:'off'},'solo','locked-off');
  eq({tutorialDone:false},'solo','tutorial');
  eq({choice:'solo'},'solo',null);
  eq({choice:'solo',tutorialDone:false},'solo',null);
  eq({relay:'closed'},'solo','closed');
  eq({relay:'unavailable'},'solo','unavailable');
  eq({relay:'unknown'},'public',null);
  eq({party:true},'party',null);
  eq({party:true,flag:false},'party',null);          // a party needs only the party flag
  eq({party:true,lock:'friends'},'party',null);      // "Friends only" still allows parties
  eq({party:true,choice:'solo',relay:'closed'},'party',null);
  eq({party:true,lock:'off'},'solo','locked-off');   // a grown-up's Off beats everything
});

t('store: holdout default when nothing is stored (on -> public, hold -> solo), a stored choice wins, flag off never makes a seed',()=>{
  const seedFor=arm=>{const W=world();for(let i=0;;i++){const s=i.toString(16).padStart(32,'0');if(W.ho.holdoutArmFor(s)===arm)return s;}};
  const on=seedFor('on'),hold=seedFor('hold');
  let W=world();W.local.setItem('fi2-holdout-v1',on);let s=W.pm.presence.get();assert.equal(s.choice,'public');assert.equal(s.defaulted,true);
  W=world();W.local.setItem('fi2-holdout-v1',hold);s=W.pm.presence.get();assert.equal(s.choice,'solo');assert.equal(s.defaulted,true);
  W=world();W.local.setItem('fi2-holdout-v1',hold);W.local.setItem('fi2-presence-mode-v1','others');s=W.pm.presence.get();assert.equal(s.choice,'public');assert.equal(s.defaulted,false);
  W=world();W.local.setItem('fi2-presence-mode-v1','solo');assert.equal(W.pm.presence.get().choice,'solo');
  W=world({NEXT_PUBLIC_MULTIPLAYER:'1'});s=W.pm.presence.get();assert.equal(s.mode,'solo');assert.equal(s.reason,'flag');assert.equal(W.local.getItem('fi2-holdout-v1'),null,'no seed without the flag');
  W=world();W.local.setItem('fi2-holdout-v1',on);const ev=[];W.pm.presence.onEvent(e=>ev.push(e));W.pm.presence.setChoice('solo');
  assert.equal(W.local.getItem('fi2-presence-mode-v1'),'solo');W.pm.presence.setChoice('public');assert.equal(W.local.getItem('fi2-presence-mode-v1'),'others');
  assert.deepEqual(ev.map(e=>e.type+':'+e.to),['switch:solo','switch:public']);
  W.pm.presence.setChoice('public');assert.equal(ev.length,2,'no count for a tap that changes nothing');
  W.pm.presence.setTutorialDone(true);W.pm.presence.setRelay('open');assert.equal(W.pm.presence.get().mode,'public');
  W.al.setMultiplayerLock('friends');assert.equal(W.pm.presence.get().reason,'locked-friends','the lock is re-read without a subscriber');
  W.al.setMultiplayerLock('all');W.pm.presence.setRelay('closed');assert.equal(W.pm.presence.get().reason,'closed');
  assert.equal(W.pm.worldResumeAllowed(),true);W.pm.presence.setChoice('solo');assert.equal(W.pm.worldResumeAllowed(),false);
});

t('grown-up lock: three values in the same key, old Allowed / Off still read the same, every old export works',()=>{
  const W=world(),A=W.al;
  for(const [raw,v] of [[null,'all'],['off','off'],['OFF','off'],['friends','friends'],['allowed','all'],['on','all'],['garbage','all']])assert.equal(A.parseLock(raw),v,String(raw));
  assert.equal(A.multiplayerLock(),'all');assert.equal(A.multiplayerAllowed(),true);assert.equal(A.publicAllowed(),true);
  W.local.setItem(A.ALLOWED_KEY,'off');assert.equal(A.multiplayerLock(),'off');assert.equal(A.multiplayerAllowed(),false);// an old build's Off
  A.setMultiplayerAllowed(true);assert.equal(W.local.getItem(A.ALLOWED_KEY),null,'Allowed = no key, as before');
  A.setMultiplayerLock('friends');assert.equal(W.local.getItem(A.ALLOWED_KEY),'friends');assert.equal(A.multiplayerAllowed(),true,'parties allowed');assert.equal(A.publicAllowed(),false);
  A.setMultiplayerAllowed(false);assert.equal(W.local.getItem(A.ALLOWED_KEY),'off');
  let hits=0;const off=A.subscribeMultiplayerAllowed(()=>hits++);A.setMultiplayerLock('all');off();A.setMultiplayerLock('off');assert.equal(hits,1);
});

// ---- 2. the world connection ----
t('world join: lobby first, 5-element Hello with no nick, caps never above the offer, generated names in the store',async()=>{
  const W=world(),p=page(W);W.L('lib/multiplayer/nick').setNick('Emma');
  assert.equal(p.c.joinWorld({look:LOOK}),true);await flush();
  assert.deepEqual(p.calls,['http://127.0.0.1:8790/world']);assert.equal(p.c.worldCount,3,'the lobby n before the socket');
  assert.equal(p.last().url,'ws://127.0.0.1:8790/world/1/ws');p.last().open();
  assert.deepEqual(p.msgs(p.last())[0],[0,1,LOOK,null,null],'no nick, no host key, 5 elements');
  p.last().recv(wWelcome());p.last().recv([32,1995|4|32|16]);// a relay offering Rename + Hit too: never answered beyond CAPS_WORLD
  const capsOut=p.msgs(p.last()).find(m=>m[0]===11);assert.equal(capsOut[1],1995);
  assert.equal(p.c.kind,'world');assert.equal(p.c.status,'live');assert.equal(p.c.code,null);
  const s=W.st.partyStore.get();assert.equal(s.kind,'world');
  assert.deepEqual(s.members.map(m=>[m.id,m.name,m.nick]),[[21,W.P.worldNameFor([2,4]),null],[22,W.P.worldNameFor([3,0]),null],[23,W.P.worldNameFor([5,7]),null]]);
  assert.ok(/ /.test(s.members[2].name),'colour + animal');
  p.last().recv([42,6]);assert.equal(p.c.worldCount,5,'S.World counts me: others = n - 1');assert.equal(W.pw.publicCount(),5);assert.equal(W.pw.isPublic(),true);
  p.last().recv([22,23,4]);assert.deepEqual(W.st.partyStore.get().members.map(m=>m.id),[21,22],'S.Left Far: gone quietly');
});

t('no nick, Ping, Hit, Rename or host frame is ever sent in a world (every frame inspected)',async()=>{
  const W=world(),p=page(W);W.L('lib/multiplayer/nick').setNick('Emma');const ws=await live(p,W);
  assert.equal(p.c.sendPing(0,1,2),false);assert.equal(p.c.sendHit(22,10),false);assert.equal(p.c.rename('Bob'),null);
  p.c.host.kick(22);p.c.host.lock(true);p.c.host.rotate();p.c.host.end();p.c.host.nameLock(22,true);
  p.c.sendEmote(3);p.c.sendPose(pose(5,5),1000);p.clock.advance(6000);
  assert.equal(p.c.report(22,1),true);p.last().drop(4001);await flush();p.clock.advance(1500);await flush();p.last().open();
  const frames=p.all(),kinds=new Set(frames.map(m=>m[0]));
  for(const k of [3,4,5,6,7,10,13,16,17])assert.ok(!kinds.has(k),'frame '+k+' sent');
  for(const m of frames)for(const v of m.flat(3))if(typeof v==='string')assert.ok(/^wtok-/.test(v),'only the resume token is text: '+v);
  assert.ok(frames.some(m=>m[0]===60&&m[1]===22&&m[2]===1),'C.Report [60, id, reason]');
  assert.deepEqual(p.msgs(p.last())[0],[0,1,LOOK,'wtok-abcdefghij0123',null],'reconnect: same slot, still no nick');
  void ws;
});

t('S.Quiet: 5 Hz while nobody is within 40 m, back to ~10 Hz when someone is',async()=>{
  const W=world(),p=page(W);const ws=await live(p,W);
  const run=(ms,t0)=>{const before=ws.sent.length;for(let t=t0;t<t0+ms;t+=16)p.c.sendPose(pose(Math.round(t/32),0),t);return p.msgs(ws).slice(before).filter(m=>m[0]===1).length;};
  ws.recv([41,0]);assert.equal(p.c.near,0);const quiet=run(2000,10000);
  ws.recv([41,2]);assert.equal(p.c.near,2);const busy=run(2000,20000);
  assert.ok(quiet>=9&&quiet<=11,'5 Hz: '+quiet);assert.ok(busy>=18&&busy<=23,'~10 Hz: '+busy);
  assert.equal(W.pw.othersNear(),true);
});

t('close codes: 4007 closed, 4008 idle (same shard later), 4005 replaced, Full asks the lobby again once, 404 / open:false quietly',async()=>{
  let W=world(),p=page(W);const ev=[];p.c.onWorld(e=>ev.push(e.type==='fallback'?e.why:e.type));
  let ws=await live(p,W);ws.drop(4007);
  assert.equal(p.c.status,'idle');assert.equal(p.c.kind,null);assert.ok(ev.includes('closed'));assert.equal(W.session.getItem('fi2-world-session-v1'),null);assert.equal(p.clock.pending(),0,'no retry timer');
  W=world();p=page(W);ev.length=0;p.c.onWorld(e=>ev.push(e.type==='fallback'?e.why:e.type));
  p.setLobby(()=>({status:200,body:{open:true,shard:7,n:0}}));ws=await live(p,W);ws.drop(4008);assert.deepEqual(ev.slice(-1),['idle']);assert.equal(p.clock.pending(),0);
  p.c.joinWorld({look:LOOK});await flush();assert.equal(p.calls[p.calls.length-1],'http://127.0.0.1:8790/world?in=7','idle: back to the same world');
  W=world();p=page(W);ev.length=0;p.c.onWorld(e=>ev.push(e.type==='fallback'?e.why:e.type));ws=await live(p,W);ws.drop(4005);assert.deepEqual(ev.slice(-1),['replaced']);
  // Full: S.Error Full -> GET /world again without ?in=, once; still full -> Just me
  W=world();p=page(W);ev.length=0;p.c.onWorld(e=>ev.push(e.type==='fallback'?e.why:e.type));
  p.setLobby(()=>({status:200,body:{open:true,shard:2,n:23}}));p.c.joinWorld({look:LOOK});await flush();p.last().open();
  p.last().recv([29,2]);await flush();assert.equal(p.calls.length,2);assert.equal(p.calls[1],'http://127.0.0.1:8790/world');
  p.last().open();p.last().recv([29,2]);await flush();assert.equal(p.calls.length,2,'asked once only');assert.deepEqual(ev.slice(-1),['full']);assert.equal(p.c.status,'idle');
  // an old relay (404) and a closed one (open:false): Just me, no fast retry
  for(const [r,why] of [[{status:404,body:null},'unavailable'],[{status:200,body:{open:false}},'closed'],[{status:429,body:{}},'unavailable']]){
    W=world();p=page(W);ev.length=0;p.c.onWorld(e=>ev.push(e.type==='fallback'?e.why:e.type));p.setLobby(()=>r);
    p.c.joinWorld({look:LOOK});await flush();assert.deepEqual(ev,[why]);assert.equal(p.sockets.length,0);assert.equal(p.clock.pending(),0);assert.equal(p.c.status,'idle');}
});

t('silent fallback: network errors retry 1/2/4/8/15 s (fake timers), then Just me with no error status',async()=>{
  const W=world(),p=page(W);const ev=[];p.c.onWorld(e=>e.type==='fallback'&&ev.push(e.why));p.setLobby(()=>'neterr');
  const statuses=[];p.c.onStatus(s=>statuses.push(s));
  p.c.joinWorld({look:LOOK});await flush();
  for(let i=0;i<5;i++){p.clock.advance(20000);await flush();}
  assert.deepEqual(p.clock.delays.slice(0,5),[1000,2000,4000,8000,15000]);assert.equal(p.calls.length,6);
  assert.deepEqual(ev,['unreachable']);assert.equal(p.c.status,'idle');assert.ok(!statuses.includes('error'),'never an error status');assert.equal(p.clock.pending(),0);
  // a socket that keeps dropping uses the same schedule
  const W2=world(),p2=page(W2);const ev2=[];p2.c.onWorld(e=>e.type==='fallback'&&ev2.push(e.why));await live(p2,W2);
  for(let i=0;i<6;i++){p2.last().drop(1006);await flush();p2.clock.advance(20000);await flush();}
  assert.deepEqual(ev2,['unreachable']);
});

t('emote cap (6 per minute per stranger), hidden strangers send nothing to the scene, a reused id with a new name is not hidden',async()=>{
  const W=world(),p=page(W);const ws=await live(p,W);const got=[];p.c.onMessage(m=>{if(m[0]===24||m[0]===34)got.push(m);});
  for(let i=0;i<8;i++){ws.recv([24,22,1]);p.clock.advance(1000);}
  assert.equal(got.length,6,'6 of 8 in a minute');p.clock.advance(60000);ws.recv([24,22,1]);assert.equal(got.length,7,'a new minute');
  got.length=0;W.pw.hideMember(23);ws.recv([24,23,1]);ws.recv([34,23,6]);assert.equal(got.length,0,'no emote, no ask from a hidden member');
  assert.ok(W.pw.hidden().has(23));
  ws.recv([22,23,4]);ws.recv([21,[23,[5,7],LOOK,0,pose()]]);assert.ok(W.pw.hidden().has(23),'Far and back (same name): still hidden');
  ws.recv([22,23,4]);ws.recv([21,[23,[9,1],LOOK,0,pose()]]);assert.ok(!W.pw.hidden().has(23),'same id, new name: another kid');
  W.pw.hideMember(22);W.pw.unhideMember(22);assert.ok(!W.pw.hidden().has(22));
  const ev=[];W.pm.presence.onEvent(e=>ev.push(e));assert.equal(W.pw.reportMember(22,1),true);assert.ok(W.pw.hidden().has(22),'hidden at once');
  assert.deepEqual(ev.map(e=>e.type+':'+(e.reason||'')),['report:inmyway']);
  assert.deepEqual(p.msgs(ws).filter(m=>m[0]===60),[[60,22,1]]);
  assert.equal(W.pw.reportMember(22,9),false,'a bad reason sends nothing');
  // verify pass: a report cannot be undone (Show again is a no-op and the id is flagged reported); a plain hide can
  assert.equal(W.pw.reported(22),true);W.pw.unhideMember(22);assert.ok(W.pw.hidden().has(22),'a reported player stays hidden');
  // an old relay without Cap.Report: hidden, nothing sent
  const W2=world(),p2=page(W2);const ws2=await live(p2,W2,{caps:1995&~1024});assert.equal(W2.pw.reportMember(22,0),false);assert.ok(W2.pw.hidden().has(22));assert.ok(!p2.msgs(ws2).some(m=>m[0]===60));
});

t('room pages: resume the same shard and slot through the tab session (?in=), never when not allowed; a party session wins',async()=>{
  const W=world(),island=page(W);island.setLobby(()=>({status:200,body:{open:true,shard:3,n:2}}));await live(island,W);
  island.setHidden(true);// a page change hides the page first: the session's clock is refreshed
  const raw=JSON.parse(W.session.getItem('fi2-world-session-v1'));assert.deepEqual(Object.keys(raw).sort(),['at','resumeToken','shard']);assert.equal(raw.shard,3);
  const room=page(W,{clock:island.clock,lobby:()=>({status:200,body:{open:true,shard:3,n:2}})});
  assert.equal(room.c.hasWorldSession(),true);assert.equal(room.c.resume({look:LOOK}),false,'world:false: no world resume');
  assert.equal(W.pw.resumeRoomConnection(room.c,LOOK,true),true);await flush();
  assert.equal(room.calls[0],'http://127.0.0.1:8790/world?in=3','the lobby keeps me in my world');room.last().open();
  assert.deepEqual(room.msgs(room.last())[0],[0,1,LOOK,'wtok-abcdefghij0123',null],'the stored token: same slot and name');
  // not allowed (Just me / Friends only): the slot is forgotten
  const room2=page(W,{clock:island.clock});assert.equal(W.pw.resumeRoomConnection(room2.c,LOOK,false),false);assert.equal(W.session.getItem('fi2-world-session-v1'),null);
  // past the 2 min grace: nothing to resume
  const W3=world(),a=page(W3);await live(a,W3);a.clock.advance(W3.P.WORLD_AWAY_GRACE_MS+1000);const b=page(W3,{clock:a.clock});assert.equal(b.c.hasWorldSession(),false);
  // a stored party wins over the world slot
  const W4=world(),dev=memStore(),c4=page(W4,{storage:dev});await live(c4,W4);
  dev.setItem('fi2-party-session-v1',JSON.stringify({code:'K7MQ4R',resumeToken:'ptok-abcdefghij0123',at:c4.clock.now()}));
  const r4=page(W4,{storage:dev,clock:c4.clock});r4.c.resume({look:LOOK,world:true});assert.equal(r4.last().url,'ws://127.0.0.1:8790/party/K7MQ4R/ws');
});

// ---- 3. the driver ----
function driver(W,p,o={}){const ev=[];W.pm.presence.onEvent(e=>ev.push(e));
  const d=W.pw.createPublicWorld({conn:p.c,look:()=>LOOK,now:p.clock.now,setTimeout:p.clock.setTimeout,clearTimeout:p.clock.clearTimeout,idle:fn=>fn(),pendingParty:o.pending||(()=>false)});
  return{d,ev};}
function onSeed(W){W.local.setItem('fi2-presence-mode-v1','others');}

t('lazy connect: island ready + tutorial done + first input + 3 s, nothing before; no timer in solo',async()=>{
  const W=world();onSeed(W);const p=page(W);const {d,ev}=driver(W,p);
  d.noteInput();d.tutorialDone(true);p.clock.advance(10000);await flush();assert.equal(p.calls.length,0,'island not ready');
  const W2=world();onSeed(W2);const p2=page(W2);const r=driver(W2,p2);
  r.d.islandReady(true);r.d.noteInput();p2.clock.advance(10000);await flush();assert.equal(p2.calls.length,0,'tutorial not done');assert.equal(W2.pm.presence.get().reason,'tutorial');
  // the input during the tutorial counts as the first one: 3 s after the tutorial ends, one lobby call
  r.d.tutorialDone(true);p2.clock.advance(2999);await flush();assert.equal(p2.calls.length,0);p2.clock.advance(1);await flush();assert.equal(p2.calls.length,1,'one lobby call');
  p2.last().open();p2.last().recv(wWelcome());p2.last().recv([32,1995]);
  assert.equal(W2.pm.presence.get().connected,true);assert.equal(W2.pm.presence.get().mode,'public');
  assert.deepEqual(r.ev.map(e=>e.type),['arm','connect','seen']);
  // a fresh page: input first, then 3 s exactly
  const W3=world();onSeed(W3);const p3=page(W3);const r3=driver(W3,p3);r3.d.islandReady(true);r3.d.tutorialDone(true);
  p3.clock.advance(60000);await flush();assert.equal(p3.calls.length,0,'no input yet');assert.equal(p3.clock.pending(),0,'nothing waits for input on a timer');
  r3.d.noteInput();p3.clock.advance(2999);await flush();assert.equal(p3.calls.length,0);p3.clock.advance(1);await flush();assert.equal(p3.calls.length,1);
  // solo: no timers at all
  const W4=world();W4.local.setItem('fi2-presence-mode-v1','solo');const p4=page(W4);const r4=driver(W4,p4);r4.d.islandReady(true);r4.d.tutorialDone(true);r4.d.noteInput();r4.d.noteInput();
  p4.clock.advance(60000);await flush();assert.equal(p4.calls.length,0);assert.equal(p4.clock.pending(),0,'solo: no timer');
  void d;void ev;
});

t('back from a room page (world slot held): the island resumes the world at once, no input or 3 s gate; never in solo',async()=>{
  const W=world();onSeed(W);const room=page(W);room.setLobby(()=>({status:200,body:{open:true,shard:3,n:2}}));await live(room,W);room.setHidden(true);
  const isl=page(W,{clock:room.clock,lobby:()=>({status:200,body:{open:true,shard:3,n:2}})});assert.equal(isl.c.hasWorldSession(),true);
  const r=driver(W,isl);r.d.tutorialDone(true);await flush();assert.equal(isl.calls.length,0,'not before the island is interactive');
  r.d.islandReady(true);await flush();assert.equal(isl.calls.length,1,'resumed with no input and no wait');assert.equal(isl.calls[0],'http://127.0.0.1:8790/world?in=3');
  isl.last().open();assert.deepEqual(isl.msgs(isl.last())[0],[0,1,LOOK,'wtok-abcdefghij0123',null],'the same slot');
  // Just me: the held slot does not reconnect
  const W2=world();W2.local.setItem('fi2-presence-mode-v1','solo');const room2=page(W2);await live(room2,W2);room2.setHidden(true);
  const isl2=page(W2,{clock:room2.clock});const r2=driver(W2,isl2);r2.d.tutorialDone(true);r2.d.islandReady(true);await flush();assert.equal(isl2.calls.length,0);
});

t('silent fallback in the driver: unreachable / closed -> Just me (reason), retried on an input only after 2 min; a tap retries at once',async()=>{
  const W=world();onSeed(W);const p=page(W);const {d,ev}=driver(W,p);p.setLobby(()=>({status:404,body:null}));
  d.islandReady(true);d.tutorialDone(true);d.noteInput();p.clock.advance(3000);await flush();
  assert.equal(p.calls.length,1);let s=W.pm.presence.get();assert.equal(s.mode,'solo');assert.equal(s.reason,'unavailable');assert.equal(s.choice,'public','the choice is kept');
  assert.deepEqual(ev.filter(e=>e.type==='fallback').map(e=>e.why),['unreachable']);assert.equal(p.clock.pending(),0,'no timer while waiting');
  p.clock.advance(60000);d.noteInput();await flush();assert.equal(p.calls.length,1,'not before 2 min');
  p.setLobby(()=>({status:200,body:{open:false}}));p.clock.advance(61000);d.noteInput();await flush();assert.equal(p.calls.length,2,'the slow retry');
  assert.equal(W.pm.presence.get().reason,'closed');
  p.setLobby(()=>({status:200,body:{open:true,shard:1,n:4}}));d.setMode('public');await flush();assert.equal(p.calls.length,3,'a tap on With other players asks again now');
  p.last().open();p.last().recv(wWelcome());p.last().recv([32,1995]);assert.equal(W.pm.presence.get().mode,'public');
  // kill switch while connected: 4007 -> Just me, reopened -> back on the next input after 2 min
  p.last().drop(4007);await flush();assert.equal(W.pm.presence.get().reason,'closed');p.clock.advance(121000);d.noteInput();await flush();assert.equal(p.calls.length,4);
  // idle 4008: back on the next real input, same world
  p.last().open();p.last().recv(wWelcome());p.last().recv([32,1995]);p.last().drop(4008);await flush();assert.equal(p.calls.length,4);
  d.noteInput();await flush();assert.equal(p.calls[4],'http://127.0.0.1:8790/world?in=1');
});

t('switching without reload: solo -> public -> solo (Leave), public -> party -> back to public, lock Friends only leaves, a pending party wins',async()=>{
  const W=world();onSeed(W);const p=page(W);const {d,ev}=driver(W,p);d.islandReady(true);d.tutorialDone(true);d.noteInput();p.clock.advance(3000);await flush();
  let ws=p.last();ws.open();ws.recv(wWelcome());ws.recv([32,1995]);
  d.setMode('solo');assert.deepEqual(p.msgs(ws).slice(-1),[[8]],'Leave sent');assert.equal(ws.readyState,3);assert.equal(p.c.kind,null);assert.equal(W.st.partyStore.get().members.length,0,'strangers gone at once');
  assert.equal(W.pm.presence.get().mode,'solo');assert.equal(p.clock.pending(),0,'solo: no timers');
  d.setMode('public');await flush();ws=p.last();assert.ok(/\/world\/1\/ws$/.test(ws.url));ws.open();ws.recv(wWelcome());ws.recv([32,1995]);
  assert.deepEqual(ev.filter(e=>e.type==='switch').map(e=>e.to),['solo','public']);
  // public -> party: Leave on the world socket, then the party socket
  p.c.join('K7MQ4R',{look:LOOK,nick:'Emma'});assert.deepEqual(p.msgs(ws).slice(-1),[[8]]);assert.ok(/\/party\/K7MQ4R\/ws$/.test(p.last().url));
  assert.equal(W.pm.presence.get().mode,'party');p.last().open();assert.equal(p.msgs(p.last())[0][6],'Emma','the party still gets the typed name');
  p.last().recv([20,1,1,'ptok-abcdefghij0123',0,0,0,[[1,[2,0],LOOK,1,null,'Emma']]]);
  p.c.leave();await flush();assert.equal(W.pm.presence.get().mode,'public','back to the remembered choice');assert.ok(/\/world/.test(p.calls[p.calls.length-1]));
  ws=p.last();ws.open();ws.recv(wWelcome());ws.recv([32,1995]);
  // the grown-up sets Friends only: Leave, solo, reason
  W.al.setMultiplayerLock('friends');assert.deepEqual(p.msgs(ws).slice(-1),[[8]]);assert.equal(W.pm.presence.get().reason,'locked-friends');
  W.al.setMultiplayerLock('all');await flush();ws=p.last();ws.open();ws.recv(wWelcome());ws.recv([32,1995]);
  // a shared match is exposed for the warning
  W.sm.setSharedMatch(true);assert.equal(W.pw.inSharedMatch(),true);assert.equal(W.pm.presence.get().sharedMatch,true);assert.ok(ev.some(e=>e.type==='match_join'));
  // a pending party link: no world at all
  const W2=world();onSeed(W2);const p2=page(W2);const r=driver(W2,p2,{pending:()=>true});r.d.islandReady(true);r.d.tutorialDone(true);r.d.noteInput();p2.clock.advance(5000);await flush();
  assert.equal(p2.calls.length,0);assert.equal(W2.pm.presence.get().mode,'party');
});

t('heat: the driver adds one one-shot timer (the 3 s gate), the world socket only the party beat; dispose keeps the socket',async()=>{
  const src=fs.readFileSync(path.join(ROOT,'lib/multiplayer/publicWorld.ts'),'utf8');
  assert.ok(!/setInterval|requestAnimationFrame/.test(src));assert.equal((src.match(/\bst\(/g)||[]).length,1,'one timer site');
  for(const f of ['presenceMode.ts','strangers.ts','sharedMatch.ts'])assert.ok(!/setTimeout|setInterval|requestAnimationFrame/.test(fs.readFileSync(path.join(ROOT,'lib/multiplayer',f),'utf8')),f);
  const W=world();onSeed(W);const p=page(W);const {d}=driver(W,p);d.islandReady(true);d.tutorialDone(true);d.noteInput();p.clock.advance(3000);await flush();
  const ws=p.last();ws.open();ws.recv(wWelcome());ws.recv([32,1995]);assert.equal(p.clock.pending(),1,'only the 5 s beat');
  d.dispose();assert.equal(ws.readyState,1,'a page change keeps the socket');
});

(async()=>{for(const [name,fn] of T){try{await fn();n++;}catch(e){console.error('FAIL',name);throw e;}}console.log(`mp-presence: ${n} checks passed`);})().catch(e=>{console.error(e);process.exit(1);});
