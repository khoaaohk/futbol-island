// Multiplayer client (lib/multiplayer): Hello/resume/backoff/hidden-tab/throttle on a mock WebSocket + fake clock, store emit
// discipline, interpolation accuracy + extrapolation cap + no-allocation sample, and the Look wire round trip. No network.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),req=require('node:module').createRequire(ROOT+'/package.json'),cache=new Map(),store=new Map();
const env={NEXT_PUBLIC_MULTIPLAYER:'1',NEXT_PUBLIC_MULTIPLAYER_URL:'http://localhost:8790/'};
function resolveTs(from,id){const base=path.resolve(path.dirname(from),id);return fs.existsSync(base+'.ts')?base+'.ts':path.join(base,'index.ts');}
function load(file){if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
    {exports:mod.exports,module:mod,Math,Date,JSON,Number,Array,Object,Error,Map,Set,Float64Array,Uint8Array,Symbol,console,process:{env},performance:{now:()=>0},
     localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},require:id=>id.startsWith('.')?load(resolveTs(file,id)):req(id)});
  cache.set(file,mod.exports);return mod.exports;}
const L=p=>load(path.join(ROOT,'lib/multiplayer',p+'.ts'));
const P=load(path.join(ROOT,'multiplayer/protocol/index.ts'));
const cfg=L('config'),conn=L('connection'),st=L('store'),ip=L('interp'),lk=L('look'),idx=L('index');
const CUST=load(path.join(ROOT,'lib/town/customization.ts'));
const plain=x=>JSON.parse(JSON.stringify(x));
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};

// ---- mocks ----
function makeClock(){let now=1e6,seq=0;const timers=[];const delays=[];
  return{now:()=>now,delays,
    setTimeout:(fn,ms)=>{const h={id:++seq,at:now+ms,fn};timers.push(h);delays.push(ms);return h.id;},
    clearTimeout:id=>{const i=timers.findIndex(x=>x.id===id);if(i>=0)timers.splice(i,1);},
    advance(ms){const end=now+ms;for(;;){timers.sort((a,b)=>a.at-b.at);const nx=timers[0];if(!nx||nx.at>end)break;timers.shift();now=Math.max(now,nx.at);nx.fn();}now=end;},
    pending:()=>timers.length};}
function makeEnv(opts={}){const clock=makeClock();const sockets=[];
  class WS{constructor(url){this.url=url;this.readyState=0;this.sent=[];sockets.push(this);}
    send(s){this.sent.push(s);}close(){if(this.readyState===3)return;this.readyState=3;}
    open(){this.readyState=1;this.onopen&&this.onopen();}
    recv(m){this.onmessage&&this.onmessage({data:typeof m==='string'?m:JSON.stringify(m)});}
    drop(){this.readyState=3;this.onclose&&this.onclose();}
    dropWith(code){this.readyState=3;this.onclose&&this.onclose({code});}}
  let hidden=false;const vsubs=[];
  const vis={hidden:()=>hidden,on:fn=>{vsubs.push(fn);return()=>{}}};
  const storage=opts.storage||(()=>{const m=new Map();return{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};})();
  const c=conn.createPartyConnection({WebSocketImpl:WS,now:clock.now,random:opts.random||(()=>0.5),setTimeout:clock.setTimeout,clearTimeout:clock.clearTimeout,visibility:vis,storage});
  return{c,clock,sockets,storage,setHidden(h){hidden=h;vsubs.forEach(f=>f());},last:()=>sockets[sockets.length-1],
    msgs:s=>s.sent.map(x=>JSON.parse(x))};}
const LOOK=plain(lk.lookToWire(CUST.DEFAULT_CUSTOMIZATION));
const welcome=(tok='tok-abcdefghij012345')=>[20,1,1,tok,Date.now()+7200000,Date.now()+14400000,0,[[1,[2,3],LOOK,1,null]]];
const pose=(x,mode=0,flags=0,yaw=0)=>[x,0,0,yaw,0,mode,0,flags];
function goLive(e,tok){e.c.join('k7m-q4r',{look:LOOK});const s=e.last();s.open();s.recv(welcome(tok));return s;}

// ---- config ----
t('config',()=>{
  assert.equal(cfg.multiplayerEnabled(),true);
  assert.equal(cfg.relayHttpUrl(),'http://localhost:8790');
  assert.equal(cfg.relayWsUrl('K7MQ4R'),'ws://localhost:8790/party/K7MQ4R/ws');
  assert.equal(cfg.relayWsUrl('bad/../x'),null);
  env.NEXT_PUBLIC_MULTIPLAYER_URL='https://party.example.app';assert.equal(cfg.relayWsUrl('K7MQ4R'),'wss://party.example.app/party/K7MQ4R/ws');
  env.NEXT_PUBLIC_MULTIPLAYER_URL='http://localhost:8790/';
  env.NEXT_PUBLIC_MULTIPLAYER='0';assert.equal(cfg.multiplayerEnabled(),false);assert.equal(cfg.relayHttpUrl(),null);assert.equal(cfg.relayWsUrl('K7MQ4R'),null);
  delete env.NEXT_PUBLIC_MULTIPLAYER;assert.equal(cfg.multiplayerEnabled(),false);
  env.NEXT_PUBLIC_MULTIPLAYER='1';
});

// ---- connection ----
t('connect + Hello shape',()=>{
  const e=makeEnv();assert.equal(e.c.status,'idle');
  e.c.join('k7m-q4r',{look:LOOK});
  assert.equal(e.c.status,'connecting');assert.equal(e.sockets.length,1);
  assert.equal(e.last().url,'ws://localhost:8790/party/K7MQ4R/ws');
  assert.equal(e.last().sent.length,0,'nothing before open');
  e.last().open();
  const hello=e.msgs(e.last())[0];
  assert.deepEqual(hello,[0,1,LOOK,null,null]);
  assert.ok(P.parseClient(e.last().sent[0]),'Hello passes the protocol validator');
  e.last().recv(welcome());assert.equal(e.c.status,'live');
  // host key is passed through
  const e2=makeEnv();e2.c.join('K7MQ4R',{look:LOOK,hostKey:'hk_1234567890abcdef'});e2.last().open();
  assert.equal(e2.msgs(e2.last())[0][4],'hk_1234567890abcdef');
  // invalid code -> error, no socket
  const e3=makeEnv();e3.c.join('!!',{look:LOOK});assert.equal(e3.c.status,'error');assert.equal(e3.sockets.length,0);
});

t('reconnect schedule 1,2,4,8,15,15 s with +/-30% jitter bounds',()=>{
  for(const [r,f] of [[0,0.7],[0.5,1],[1,1.3]]){
    const e=makeEnv({random:()=>r});e.c.join('K7MQ4R',{look:LOOK});
    const want=[1000,2000,4000,8000,15000,15000];
    for(let i=0;i<want.length;i++){
      const before=e.sockets.length;e.clock.delays.length=0;
      e.last().drop();
      assert.equal(e.c.status,'reconnecting');
      assert.equal(e.clock.delays[0],Math.round(want[i]*f),`attempt ${i} r=${r}`);
      e.clock.advance(Math.round(want[i]*f)-1);assert.equal(e.sockets.length,before,'not early');
      e.clock.advance(1);assert.equal(e.sockets.length,before+1,'retried on time');
    }
  }
  // random jitter always inside bounds
  const e=makeEnv({random:Math.random});e.c.join('K7MQ4R',{look:LOOK});
  for(let i=0;i<12;i++){e.clock.delays.length=0;e.last().drop();const d=e.clock.delays[0],b=[1000,2000,4000,8000,15000][Math.min(i,4)];assert.ok(d>=b*0.7-1&&d<=b*1.3+1,`${d} vs ${b}`);e.clock.advance(20000);}
  // success resets the schedule
  const e4=makeEnv();e4.c.join('K7MQ4R',{look:LOOK});e4.last().drop();e4.clock.advance(1000);e4.last().drop();e4.clock.advance(2000);
  e4.last().open();e4.last().recv(welcome());e4.clock.delays.length=0;e4.last().drop();assert.equal(e4.clock.delays[0],1000);
});

t('resume token reuse (reconnect and page reload) and 30 min TTL',()=>{
  const e=makeEnv();const s1=goLive(e,'tok-abcdefghij012345');
  const sess=JSON.parse(e.storage.getItem('fi-party-session'));
  assert.equal(sess.code,'K7MQ4R');assert.equal(sess.resumeToken,'tok-abcdefghij012345');assert.equal(typeof sess.at,'number');
  s1.drop();e.clock.advance(1000);const s2=e.last();assert.notEqual(s2,s1);s2.open();
  assert.equal(e.msgs(s2)[0][3],'tok-abcdefghij012345','Hello after reconnect carries the token');
  // reload: a new connection object, same sessionStorage
  const e2=makeEnv({storage:e.storage});e2.c.join('K7MQ4R',{look:LOOK});e2.last().open();
  assert.equal(e2.msgs(e2.last())[0][3],'tok-abcdefghij012345');
  // other code -> no token
  const e3=makeEnv({storage:e.storage});e3.c.join('BCDFGH',{look:LOOK});e3.last().open();assert.equal(e3.msgs(e3.last())[0][3],null);
  // hostKey kept in the session
  const e4=makeEnv();e4.c.join('K7MQ4R',{look:LOOK,hostKey:'hostkey-abcdefgh'});e4.last().open();e4.last().recv(welcome('tok-second-0123456789'));
  assert.equal(JSON.parse(e4.storage.getItem('fi-party-session')).hostKey,'hostkey-abcdefgh');
  const e5=makeEnv({storage:e4.storage});e5.c.join('K7MQ4R',{look:LOOK});e5.last().open();assert.deepEqual(e5.msgs(e5.last())[0].slice(3),['tok-second-0123456789','hostkey-abcdefgh']);
  // stale (> 30 min) is ignored
  const e6=makeEnv({storage:e.storage});e6.clock.advance(31*60*1000);e6.c.join('K7MQ4R',{look:LOOK});e6.last().open();assert.equal(e6.msgs(e6.last())[0][3],null);
  // leave clears the session
  e.c.leave();assert.equal(e.storage.getItem('fi-party-session'),null);assert.equal(e.c.status,'idle');
});

t('hidden tab: close after 15 s, no retry while hidden, resume on visible',()=>{
  const e=makeEnv();const s=goLive(e);
  e.setHidden(true);e.clock.advance(14900);assert.equal(s.readyState,1,'still open at 14.9 s');
  e.clock.advance(200);assert.equal(s.readyState,3,'closed after 15 s');
  const count=e.sockets.length;e.clock.advance(120000);assert.equal(e.sockets.length,count,'no reconnect while hidden');
  assert.equal(e.c.status,'reconnecting');
  e.setHidden(false);assert.equal(e.sockets.length,count+1,'resumes immediately on visible');
  e.last().open();assert.equal(e.msgs(e.last())[0][3],'tok-abcdefghij012345');
  // back within 15 s: nothing closes
  const e2=makeEnv();const s2=goLive(e2);e2.setHidden(true);e2.clock.advance(10000);e2.setHidden(false);e2.clock.advance(30000);assert.equal(s2.readyState,1);assert.equal(e2.sockets.length,1);
  // network drop while hidden: retry timer fires but must not connect
  const e3=makeEnv();const s3=goLive(e3);e3.setHidden(true);s3.drop();e3.clock.advance(60000);assert.equal(e3.sockets.length,1);
  e3.setHidden(false);assert.equal(e3.sockets.length,2);
});

t('send throttle: walking 10 s -> 45-55 poses; standing 10 s -> <= 3 messages after Hello',()=>{
  const e=makeEnv();const s=goLive(e);const base=s.sent.length;
  for(let ms=0;ms<=10000;ms+=16){e.c.sendPose(pose(Math.round(ms*0.014)),e.clock.now());e.clock.advance(16);}
  const poses=e.msgs(s).filter(m=>m[0]===1);
  assert.ok(poses.length>=45&&poses.length<=55,`walking sent ${poses.length}`);
  assert.deepEqual(poses.map(m=>m[1]).slice(0,3),[0,1,2],'seq increments');
  assert.ok(P.parseClient(JSON.stringify(poses[0])),'pose passes validator');
  const e2=makeEnv();const s2=goLive(e2);
  for(let ms=0;ms<=10000;ms+=16){e2.c.sendPose(pose(500),e2.clock.now());e2.clock.advance(16);}
  assert.ok(s2.sent.length-1<=3,`standing sent ${s2.sent.length-1} after Hello`);
  assert.ok(e2.msgs(s2).some(m=>m[0]===9),'Beat sent');
  // standing with tiny speed changes: <= 1 Hz
  const e3=makeEnv();const s3=goLive(e3);
  for(let ms=0;ms<10000;ms+=16){e3.c.sendPose([500,0,0,0,(ms>>7)&3,0,0,0],e3.clock.now());e3.clock.advance(16);}
  assert.ok(e3.msgs(s3).filter(m=>m[0]===1).length<=11);
  // mode / zone change and Warp are immediate
  const e4=makeEnv();const s4=goLive(e4);e4.c.sendPose(pose(500),e4.clock.now());e4.clock.advance(10);
  e4.c.sendPose(pose(500,2),e4.clock.now());e4.clock.advance(10);e4.c.sendPose([500,0,0,0,0,2,1,0],e4.clock.now());e4.clock.advance(10);e4.c.sendPose([9000,0,0,0,0,2,1,1],e4.clock.now());
  assert.equal(e4.msgs(s4).filter(m=>m[0]===1).length,4);
  // small moves under 0.15 m and yaw < 8 deg are suppressed; yaw > 8 deg is sent
  const e5=makeEnv();const s5=goLive(e5);const np=()=>e5.msgs(s5).filter(m=>m[0]===1).length;
  e5.c.sendPose(pose(500),e5.clock.now());e5.clock.advance(300);
  e5.c.sendPose(pose(501),e5.clock.now());e5.c.sendPose([500,0,0,5,0,0,0,0],e5.clock.now());
  assert.equal(np(),1,'0.1 m and 7 degrees are under the move thresholds (idle gate is 1 Hz)');
  e5.c.sendPose([500,0,0,7,0,0,0,0],e5.clock.now());
  assert.equal(np(),2,'7 units = 9.8 degrees is sent');
});

t('never sends while hidden flag set; emote limit 1 per 2 s; ping',()=>{
  const e=makeEnv();const s=goLive(e);
  e.c.sendPose(pose(500,0,2),e.clock.now());assert.equal(e.msgs(s).filter(m=>m[0]===1).length,0);
  assert.equal(e.c.sendEmote(1),false);assert.equal(e.c.sendPing(0,1,1),false);
  e.c.sendPose(pose(500),e.clock.now());e.clock.advance(100);
  assert.equal(e.c.sendEmote(1),true);assert.equal(e.c.sendEmote(1),false);e.clock.advance(1999);assert.equal(e.c.sendEmote(2),false);e.clock.advance(1);assert.equal(e.c.sendEmote(2),true);
  assert.deepEqual(e.msgs(s).filter(m=>m[0]===2),[[2,1],[2,2]]);
  assert.equal(e.c.sendPing(1,12.34,-5.6),true);assert.deepEqual(e.msgs(s).filter(m=>m[0]===3)[0],[3,1,123,-56]);
  // host commands + leave
  e.c.host.kick(3);e.c.host.lock(true);e.c.host.rotate();e.c.host.end();e.c.leave();
  assert.deepEqual(e.msgs(s).slice(-5),[[4,3],[5,1],[6],[7],[8]]);
  // no sends before live
  const e2=makeEnv();e2.c.join('K7MQ4R',{look:LOOK});e2.last().open();e2.c.sendPose(pose(1),e2.clock.now());assert.equal(e2.last().sent.length,1);
});

t('fatal errors stop retries; Ended clears the session; onMessage fan-out',()=>{
  const e=makeEnv();const seen=[];const off=e.c.onMessage(m=>seen.push(m[0]));
  e.c.join('K7MQ4R',{look:LOOK});e.last().open();e.last().recv([29,2]);
  assert.equal(e.c.status,'error');assert.deepEqual(seen,[29]);e.clock.advance(60000);assert.equal(e.sockets.length,1);
  const e2=makeEnv();const s=goLive(e2);s.recv([28,0]);assert.equal(e2.c.status,'ended');assert.equal(e2.storage.getItem('fi-party-session'),null);
  off();
  // garbage is ignored
  const e3=makeEnv();const s3=goLive(e3);s3.recv('not json');s3.recv([99]);assert.equal(e3.c.status,'live');
  e3.c.dispose();assert.equal(s3.readyState,3);
});

// ---- store ----
t('store emits only on membership/status/emote/ping/error, never on Poses',()=>{
  st.partyStore.reset();let emits=0;const off=st.partyStore.subscribe(()=>emits++);
  st.partyStore.apply(welcome(),1000);assert.equal(emits,1);
  let s=st.partyStore.get();assert.equal(s.status,'live');assert.equal(s.you,1);assert.equal(s.isHost,true);assert.equal(s.members[0].name,P.nameFor([2,3]));
  st.partyStore.apply([21,[2,[0,1],LOOK,0,[100,0,100,0,0,0,0,0]]],1100);assert.equal(emits,2);assert.equal(st.partyStore.get().members.length,2);
  const before=emits,snap=st.partyStore.get();
  for(let i=0;i<100;i++)st.partyStore.apply([23,i,1,1000+i,0,500,0,4,0,0,0,2,1100+i,0,500,0,4,0,0,0,0],2000+i);
  assert.equal(emits,before,'0 emits for 100 Poses');assert.equal(st.partyStore.get(),snap,'state object unchanged');
  st.partyStore.apply([23,200,2,1,0,1,0,0,0,4,0],3000);assert.equal(emits,before+1,'a zone change is visible state');
  assert.equal(st.partyStore.get().members[1].zone,4);
  st.partyStore.apply([24,2,1],4000);assert.deepEqual(plain(st.partyStore.get().lastEmote),{id:2,emote:1,at:4000});
  st.partyStore.apply([25,2,0,100,-50],4000);assert.deepEqual(plain(st.partyStore.get().pings[0]),{id:2,kind:0,x:10,z:-5,until:12000});
  st.partyStore.apply([26,2],4100);assert.equal(st.partyStore.get().isHost,false);assert.equal(st.partyStore.get().members[1].isHost,true);
  st.partyStore.apply([27,'BCDFGH',99],4200);assert.equal(st.partyStore.get().code,'BCDFGH');
  st.partyStore.apply([29,5],4300);assert.equal(st.partyStore.get().error,5);
  st.partyStore.apply([22,2,0],4400);assert.equal(st.partyStore.get().members.length,1);
  const e=emits;st.partyStore.apply([30,5],4500);assert.equal(emits,e,'Beat is silent');
  st.partyStore.apply([28,0],4600);assert.equal(st.partyStore.get().status,'ended');
  off();st.partyStore.reset();assert.equal(st.partyStore.get().status,'idle');
});

t('bindConnection: messages -> store, Poses -> onPoses only',()=>{
  st.partyStore.reset();const e=makeEnv();let emits=0;const off=st.partyStore.subscribe(()=>emits++);
  const got=[];const offP=idx.onPoses((id,body,at)=>got.push([id,body,at]));
  const unbind=idx.bindConnection(e.c,()=>42);
  const s=goLive(e);assert.equal(st.partyStore.get().status,'live');assert.equal(st.partyStore.get().code,'K7MQ4R');
  const em=emits;s.recv([23,1,1,10,0,20,0,3,0,0,0]);
  assert.equal(emits,em);assert.deepEqual(plain(got),[[1,[10,0,20,0,3,0,0,0],42]]);
  unbind();offP();off();st.partyStore.reset();
});

t('S.Code (Rotate) updates the code, the session and the next reconnect URL (#1)',()=>{
  const e=makeEnv();const s=goLive(e);
  s.recv([27,'B8CD2F',Date.now()+7200000]);
  assert.equal(e.c.code,'B8CD2F');assert.equal(JSON.parse(e.storage.getItem('fi-party-session')).code,'B8CD2F');
  s.drop();e.clock.advance(5000);
  assert.equal(e.sockets.length,2);assert.ok(e.last().url.includes('/B8CD2F/ws'),'redial uses the new code: '+e.last().url);
});
t('terminal close codes 4003 / 4004 / 4005 never reconnect (#15)',()=>{
  for(const [cc,st] of [[4003,'error'],[4004,'ended'],[4005,'idle']]){
    const e=makeEnv();const s=goLive(e);s.dropWith(cc);
    assert.equal(e.c.status,st,'status for '+cc);e.clock.advance(60000);assert.equal(e.sockets.length,1,'no redial after '+cc);
    assert.equal(e.storage.getItem('fi-party-session'),null,'session cleared');
  }
  const e=makeEnv();const s=goLive(e);s.dropWith(1006);e.clock.advance(5000);assert.equal(e.sockets.length,2,'an ordinary drop still reconnects');
});
t('pose seq is not masked to 16 bits and restarts at 0 on a new join (#7)',()=>{
  const e=makeEnv();const s=goLive(e);
  for(let i=0;i<3;i++)e.c.sendPose(pose(i*100),1000+i*300);
  assert.deepEqual(e.msgs(s).filter(m=>m[0]===1).map(m=>m[1]),[0,1,2]);
  assert.ok(!/0xffff/.test(fs.readFileSync(path.join(ROOT,'lib/multiplayer/connection.ts'),'utf8').replace(/\/\/.*$/gm,'')),'no 0xffff mask on seq');
});
t('partyStore.setLocked is optimistic and only emits on change (#5)',()=>{
  st.partyStore.reset();let n=0;const off=st.partyStore.subscribe(()=>n++);
  st.partyStore.setLocked(true);assert.equal(st.partyStore.get().locked,true);assert.equal(n,1);st.partyStore.setLocked(true);assert.equal(n,1);off();st.partyStore.reset();
});
t('bindConnection is idempotent per connection (#4): second bind adds no subscription, unbinding is reference counted',()=>{
  st.partyStore.reset();const e=makeEnv();let applied=0;const off=st.partyStore.subscribe(()=>applied++);
  const u1=idx.bindConnection(e.c,()=>1),u2=idx.bindConnection(e.c,()=>1);
  const s=goLive(e);applied=0;s.recv([23,1,1,10,0,20,0,3,0,0,0]);
  s.recv([24,1,2]);// an Emote: applied once, not twice
  assert.equal(applied,1,'one store update per message');
  u1();u1();s.recv([24,1,3]);assert.equal(applied,2,'still bound while one binder remains (double unbind of the same handle counts once)');
  u2();s.recv([24,1,4]);assert.equal(applied,2,'fully unbound');off();st.partyStore.reset();
});

// ---- interp ----
const R=()=>({x:0,y:0,z:0,yaw:0,speed:0,mode:0,zone:0,fade:0});
t('interp: straight walk at 5 Hz, error < 0.05 m',()=>{
  const it=ip.createInterp(),out=R();let maxErr=0,samples=0;
  const T0=10000;
  for(let i=0;i<=40;i++){ // 1 m/s: 2 dm per 200 ms push, along x, a little z drift
    const tt=T0+i*200;it.push(3,[i*2,0,i,0,4,0,0,0],tt);
    for(let k=0;k<20;k++){const now=tt+k*10,rt=now-250;if(rt<T0+400)continue;
      assert.ok(it.sample(3,now,out));const ex=(rt-T0)/1000;maxErr=Math.max(maxErr,Math.abs(out.x-ex),Math.abs(out.z-ex/2));samples++;}}
  assert.ok(samples>500);assert.ok(maxErr<0.05,`max error ${maxErr}`);assert.equal(out.fade,1);assert.equal(out.speed,1);
  assert.equal(it.sample(99,1,out),false);it.drop(3);assert.equal(it.sample(3,50000,out),false);
});

t('interp: extrapolation stops after 250 ms and eases',()=>{
  const it=ip.createInterp(),out=R();
  for(let i=0;i<4;i++)it.push(1,[i*10,0,0,64,4,0,0,0],1000+i*200); // 1 m/s... 1 m per 200 ms = 5 m/s
  // last snapshot at 1600; render time = now - 250
  const at=dt=>{it.sample(1,1600+250+dt,out);return out.x;};
  const x0=at(0),xa=at(100),xb=at(250),xc=at(260),xd=at(2000);
  assert.ok(Math.abs(x0-3)<1e-6,'starts at the snapshot');
  assert.ok(xa>x0&&xb>xa,'moves during the cap');
  assert.equal(xb,xc);assert.equal(xb,xd);
  assert.ok(xb-x0<=5*0.25+1e-9,'never beyond plain extrapolation');
  assert.ok(xb-x0>5*0.25*0.4,'but it did extrapolate');
  assert.ok(at(249)-at(240)<at(10)-at(0),'slows down near the cap (ease to stop)');
  assert.equal(out.yaw,64*2*Math.PI/256);
});

t('interp: warp / >25 m jump fades 1->0->1 over 300 ms, arrival fades in',()=>{
  const it=ip.createInterp(),out=R();
  it.push(1,[0,0,0,0,0,0,0,0],1000);it.push(1,[20,0,0,0,0,0,0,0],1200);
  it.sample(1,1000+250+200,out);assert.equal(out.fade,1);
  it.sample(1,1000+250-100,out);assert.equal(out.fade,0,'before the first snapshot: hidden');
  it.push(1,[3000,0,0,0,0,0,0,0],1400); // 300 m jump
  const f=ms=>{it.sample(1,ms+250,out);return out.fade;};
  assert.equal(f(1400-150),1);assert.ok(Math.abs(f(1400-75)-0.5)<1e-9);assert.equal(f(1400),0);assert.ok(Math.abs(f(1400+75)-0.5)<1e-9);assert.equal(f(1400+150),1);
  it.sample(1,1399+250,out);assert.ok(out.x<=2.01,'holds the old place until the cut');
  it.sample(1,1400+250,out);assert.equal(out.x,300);
  // explicit Warp flag on a short hop
  it.push(1,[3010,0,0,0,0,0,0,1],1600);assert.equal(f(1600),0);
});

t('interp: sample() allocates nothing',()=>{
  const it=ip.createInterp(),out=R();for(let i=0;i<4;i++)it.push(1,[i*2,0,0,0,4,0,0,0],1000+i*200);
  for(let i=0;i<20000;i++)it.sample(1,1500+(i%900),out);
  // heapUsed is noisy without --expose-gc (unrelated garbage from earlier groups): the best of 6 rounds must stay flat
  let grew=Infinity,ok=0;for(let r=0;r<6&&grew>=1.5e6;r++){if(global.gc)global.gc();const h0=process.memoryUsage().heapUsed;
  ok=0;for(let i=0;i<300000;i++)if(it.sample(1,1500+(i%900),out))ok++;
  grew=Math.min(grew,process.memoryUsage().heapUsed-h0);}
  assert.equal(ok,300000);assert.ok(grew<1.5e6,`heap grew ${grew} bytes over 300k samples`);
  const src=ip.createInterp.toString();
  const body=src.slice(src.indexOf('function sample'),src.indexOf('return { push'));
  assert.ok(!/\bnew\b|=\s*\[|=\s*\{|\bslice\b|\.map\(|\.concat/.test(body),'sample body has no allocating constructs');
});

// ---- look ----
t('look round trip: default + 3 presets, bounds, unknown -> 0',()=>{
  const cases=[CUST.DEFAULT_CUSTOMIZATION,...CUST.LOOK_PRESETS.filter((_,i)=>i%3===1).slice(0,3).map(p=>CUST.applyLook(CUST.DEFAULT_CUSTOMIZATION,p.id))];
  assert.equal(cases.length,3+1);
  for(const c of cases){const w=lk.lookToWire(c);
    assert.equal(w.length,P.LOOK_LEN);assert.ok(w.every(v=>Number.isInteger(v)&&v>=0&&v<=63));assert.equal(w[11],0);
    assert.deepEqual(plain(lk.wireToLook(w)),plain(c));
    assert.ok(P.parseClient(JSON.stringify([0,1,w,null,null])),'valid in Hello');}
  const w=lk.lookToWire({...CUST.DEFAULT_CUSTOMIZATION,hair:'not-a-hair',eyes:'ovals'});
  assert.equal(w[4],0);assert.equal(w[2],1);
  assert.deepEqual(plain(lk.wireToLook([63,63,63,63,63,63,63,63,63,63,63,63])),plain(CUST.DEFAULT_CUSTOMIZATION),'out-of-range indexes keep defaults');
  assert.deepEqual(plain(lk.wireToLook(null)),plain(CUST.DEFAULT_CUSTOMIZATION));
  // the preset really changed something
  assert.notDeepEqual(plain(cases[1]),plain(cases[0]));
});

t('privacy: no forbidden imports or storage keys in lib/multiplayer',()=>{
  for(const f of fs.readdirSync(path.join(ROOT,'lib/multiplayer'))){
    const src=fs.readFileSync(path.join(ROOT,'lib/multiplayer',f),'utf8');
    assert.ok(!/lib\/saves|lib\/analytics|\.\.\/saves|\.\.\/analytics|deviceMarks|fi2-install-v1|fi2-save-code-v1|localStorage/.test(src),f);}
});

console.log(`mp-client: ${n} groups passed`);
