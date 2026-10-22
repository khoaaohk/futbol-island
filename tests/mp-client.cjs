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
const nm=L('names'),cfg=L('config'),conn=L('connection'),st=L('store'),ip=L('interp'),lk=L('look'),idx=L('index');
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

t('resume token reuse (reconnect and page reload) and 12 h TTL',()=>{
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
  // party persistence: the session lives as long as the party cap (12 h): kept after 31 min, ignored past 12 h
  assert.equal(conn.SESSION_TTL_MS,P.PARTY_MAX_MS);
  const e6=makeEnv({storage:e4.storage});e6.clock.advance(31*60*1000);e6.c.join('K7MQ4R',{look:LOOK});e6.last().open();assert.equal(e6.msgs(e6.last())[0][3],'tok-second-0123456789');
  const e7=makeEnv({storage:e4.storage});e7.clock.advance(P.PARTY_MAX_MS+40*60000);e7.c.join('K7MQ4R',{look:LOOK});e7.last().open();assert.equal(e7.msgs(e7.last())[0][3],null);
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

t('hidden (away) pose is sent once, emotes / pings off while hidden; emote limit 1 per 2 s; ping',()=>{
  const e=makeEnv();const s=goLive(e);
  e.c.sendPose(pose(500,0,2),e.clock.now());assert.equal(e.msgs(s).filter(m=>m[0]===1).length,1,'away is a flag change: sent once (design 4.4.1)');
  e.c.sendPose(pose(500,0,2),e.clock.now()+50);assert.equal(e.msgs(s).filter(m=>m[0]===1).length,1,'and not again while unchanged');
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

// ---- identity: colour only (no animals), colour in the store ----
t('Hello never sends an animal: reserved slot is null, old 5-element shape when there is no name',()=>{
  const e=makeEnv();e.c.join('k7m-q4r',{look:LOOK,animal:4,nick:'Emma'});e.last().open();
  assert.deepEqual(e.msgs(e.last())[0],[0,1,LOOK,null,null,null,'Emma'],'an animal option is ignored');assert.ok(P.parseClient(e.last().sent[0]),'validator accepts it');
  const e3=makeEnv();e3.c.join('k7m-q4r',{look:LOOK});e3.last().open();assert.equal(e3.msgs(e3.last())[0].length,5);
});
t('store exposes colour per member (no animal fields)',()=>{
  st.partyStore.reset();st.partyStore.apply(welcome(),1000);
  const m=st.partyStore.get().members[0];
  assert.equal(m.colourIdx,2);assert.equal(m.colourHex,nm.COLOUR_HEX[2]);assert.equal(m.name,'Green');
  assert.ok(!('animalIdx' in m)&&!('animalGlyph' in m));
  st.partyStore.reset();
});
t('names tables: hex per colour, first 6 assigned colours well separated',()=>{
  assert.equal(nm.COLOUR_HEX.length,P.NAME_COLOURS.length);assert.equal(nm.ANIMAL_GLYPH,undefined);
  assert.equal(new Set(nm.COLOUR_HEX).size,20);assert.equal(nm.COLOUR_HEX.length,P.PARTY_MAX,'a colour for each of the 20 seats');assert.ok(nm.COLOUR_HEX.every(h=>/^#[0-9A-F]{6}$/.test(h)));
  const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  const lin=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);};
  const lab=h=>{const [r,g,b]=rgb(h).map(lin);const f=t=>t>.008856?Math.cbrt(t):7.787*t+16/116;
    const X=f((.4124*r+.3576*g+.1805*b)/.95047),Y=f(.2126*r+.7152*g+.0722*b),Z=f((.0193*r+.1192*g+.9505*b)/1.08883);return[116*Y-16,500*(X-Y),200*(Y-Z)];};
  const first=P.COLOUR_ORDER.slice(0,6).map(i=>lab(nm.COLOUR_HEX[i]));
  for(let i=0;i<6;i++)for(let j=i+1;j<6;j++){const d=Math.hypot(first[i][0]-first[j][0],first[i][1]-first[j][1],first[i][2]-first[j][2]);assert.ok(d>=25,`colours ${i},${j} too close (${d.toFixed(1)})`);}
  // all 20: every pair is distinguishable (CIELAB distance), and the colour names are the 20 fallbacks ('Red', 'Teal', ...)
  const all=P.COLOUR_ORDER.map(i=>lab(nm.COLOUR_HEX[i]));let min=1e9;
  for(let i=0;i<20;i++)for(let j=i+1;j<20;j++){const d=Math.hypot(all[i][0]-all[j][0],all[i][1]-all[j][1],all[i][2]-all[j][2]);min=Math.min(min,d);assert.ok(d>=14,`colours ${i},${j} too close for 20 players (${d.toFixed(1)})`);}
  assert.equal(P.NAME_COLOURS.length,20);assert.equal(nm.colourName(7),'Teal');assert.equal(nm.colourName(0),'Red');assert.equal(nm.colourName(19),'Black');
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

t('bindConnection: messages -> store, Poses -> onPoses (+ store presence flips only)',()=>{
  st.partyStore.reset();const e=makeEnv();let emits=0;const off=st.partyStore.subscribe(()=>emits++);
  const got=[];const offP=idx.onPoses((id,body,at)=>got.push([id,body,at]));
  const unbind=idx.bindConnection(e.c,()=>42);
  const s=goLive(e);assert.equal(st.partyStore.get().status,'live');assert.equal(st.partyStore.get().code,'K7MQ4R');
  const em=emits;s.recv([23,1,1,10,0,20,0,3,0,0,0]);
  assert.equal(emits,em);assert.deepEqual(plain(got),[[1,[10,0,20,0,3,0,0,0],42]]);
  // a presence flip in a Poses batch reaches the store too (the party list's activity line), once
  s.recv([23,2,1,10,0,20,0,P.Activity.Quiz,P.Mode.Busy,0,0]);assert.equal(emits,em+1);assert.equal(st.partyStore.get().members.find(x=>x.id===1).presence,'busy');
  s.recv([23,3,1,10,0,20,0,P.Activity.Quiz,P.Mode.Busy,0,0]);assert.equal(emits,em+1,'unchanged: no emit');
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


// ---- first-name nick: Hello, store, never persisted ----
t('Hello carries the nick (7th field), re-sent on reconnect, normalised, dropped when bad',()=>{
  const e=makeEnv();e.c.join('k7m-q4r',{look:LOOK,nick:'EMMA'});e.last().open();
  assert.deepEqual(e.msgs(e.last())[0],[0,1,LOOK,null,null,null,'Emma']);assert.ok(P.parseClient(e.last().sent[0]),'validator accepts it');
  const e2=makeEnv();e2.c.join('k7m-q4r',{look:LOOK,nick:'Emma'});e2.last().open();
  assert.deepEqual(e2.msgs(e2.last())[0],[0,1,LOOK,null,null,null,'Emma'],'reserved animal slot is null');
  for(const bad of ['Emma Lou','12345','a',null,undefined,'']){const e3=makeEnv();e3.c.join('k7m-q4r',{look:LOOK,nick:bad});e3.last().open();assert.equal(e3.msgs(e3.last())[0].length,5,String(bad));}
  e.last().recv(welcome());e.last().drop();e.clock.advance(60000);e.last().open();
  assert.equal(e.msgs(e.last())[0][6],'Emma','reconnect Hello keeps the nick');
  // the host resets MY name: a later reconnect must not put it back
  e.last().recv(welcome());e.last().recv([31,1,null]);e.last().drop();e.clock.advance(60000);e.last().open();
  assert.equal(e.msgs(e.last())[0].length,5,'after a reset the nick is no longer sent');
  e.c.leave();const e4=makeEnv();e4.c.join('k7m-q4r',{look:LOOK});e4.last().open();assert.equal(e4.msgs(e4.last())[0].length,5);
});
t('store exposes nick, displayName, and Renamed clears it',()=>{
  st.partyStore.reset();
  st.partyStore.apply([20,1,1,'tok-abcdefghij012345',Date.now()+7200000,Date.now()+14400000,0,[[1,[2,3],LOOK,1,null,'Emma'],[2,[0,0],LOOK,0,null],[3,[1,1],LOOK,0,null,null]]],1000);
  let ms=st.partyStore.get().members;
  assert.equal(ms[0].nick,'Emma');assert.equal(ms[0].name,'Green');assert.equal(st.displayName(ms[0]),'Emma');
  assert.equal(ms[1].nick,null);assert.equal(st.displayName(ms[1]),'Red');assert.equal(ms[2].nick,null);
  st.partyStore.apply([31,1,null],2000);
  ms=st.partyStore.get().members;assert.equal(ms[0].nick,null);assert.equal(st.displayName(ms[0]),'Green');
  st.partyStore.apply([21,[4,[2,2],LOOK,0,null,'Zoë']],3000);
  assert.equal(st.partyStore.get().members.find(x=>x.id===4).nick,'Zoë');
  st.partyStore.reset();
});
t('nick module: memory only, normalised, clearable',()=>{
  const nk=L('nick');assert.equal(nk.getNick(),null);nk.setNick('EMMA');assert.equal(nk.getNick(),'Emma');nk.setNick('Emma Lou');assert.equal(nk.getNick(),null);
  nk.setNick('Zoe');nk.clearNick();assert.equal(nk.getNick(),null);
});
t('nick is never persisted or logged (source scan)',()=>{
  const files=['lib/multiplayer/nick.ts','lib/multiplayer/connection.ts','lib/multiplayer/store.ts','lib/multiplayer/townBridge.ts','components/party/NickField.tsx','components/party/PartyHost.tsx','components/party/JoinParty.tsx','lib/graphics/remoteAvatars.ts'];
  for(const f of files){const src=fs.readFileSync(path.join(ROOT,f),'utf8');
    assert.ok(!/localStorage|document\.cookie|indexedDB/.test(src),f+' touches persistent storage');
    assert.ok(!/console\.(log|info|warn|error|debug)/.test(src),f+' logs');
    for(const m of src.matchAll(/(?:session|local)Storage\.setItem\([^)]*\)/g))assert.ok(!/nick/i.test(m[0]),f+' stores the nick');}
  // connection.ts: the only sessionStorage write is writeSession(), whose payload is code / token / hostKey / time
  const c=fs.readFileSync(path.join(ROOT,'lib/multiplayer/connection.ts'),'utf8');
  assert.ok(!/setItem\([^)]*nick/.test(c)&&!/JSON\.stringify\(\{[^}]*nick/.test(c));
  const sess=JSON.stringify({code:'K7MQ4R',resumeToken:null,at:1});assert.ok(!/nick/i.test(sess));
  const e=makeEnv();e.c.join('k7m-q4r',{look:LOOK,nick:'Emma'});e.last().open();e.last().recv(welcome());
  assert.ok(!/Emma/.test(e.storage.getItem('fi-party-session')||''),'session storage payload has no nick');
});

// ---- presence (design 4.4.1) ----
const pr=L('presence');
t('townActivity: Town flags -> one Activity (priority: room > quiz > lesson > the rest)',()=>{
  const A=P.Activity,f=pr.townFlags();
  assert.equal(pr.townActivity(f),pr.NOT_BUSY,'playing');assert.equal(pr.isBusy(pr.NOT_BUSY),false);
  const one=(k,want)=>{const g=pr.townFlags();g[k]=true;assert.equal(pr.townActivity(g),want,k);};
  one('lesson',A.Lesson);one('learning',A.Lesson);one('quiz',A.Quiz);one('settings',A.Settings);one('map',A.Map);one('arcade',A.Arcade);one('museum',A.Museum);
  one('shop',A.Shop);one('konbini',A.Konbini);one('reef',A.Reef);one('fishing',A.Fishing);one('vending',A.Vending);one('zoom',A.Vending);one('chat',A.Chat);one('wardrobe',A.Wardrobe);one('other',A.None);
  const g=pr.townFlags();g.lesson=g.quiz=true;assert.equal(pr.townActivity(g),A.Quiz,'a quiz inside a lesson reads Quiz time');
  g.museum=true;assert.equal(pr.townActivity(g),A.Museum,'leaving for a room wins');
  assert.equal(pr.isRoom(A.Museum),true);assert.equal(pr.isRoom(A.Lesson),false);
  assert.equal(pr.presenceText('busy',A.Lesson),'Taking a lesson');assert.equal(pr.presenceText('busy',A.Quiz),'Quiz time');assert.equal(pr.presenceText('busy',A.Settings),'In Settings');
  assert.equal(pr.presenceText('indoors',A.Museum),'In the museum');assert.equal(pr.presenceText('busy',A.Reef),'Exploring the reef');assert.equal(pr.presenceText('away',A.Lesson),'Away');
  assert.equal(pr.presenceText('active',0),'');assert.equal(pr.presenceIcon('away',0),'\u{1F4A4}');
  for(let a=0;a<=P.ACTIVITY_MAX;a++){assert.ok(pr.presenceText('busy',a).length>0&&pr.presenceText('busy',a).length<=20,'short line '+a);assert.ok(pr.presenceIcon('busy',a),'one icon '+a);}
});
t('local pose source: Busy freezes at the last outdoor pose, rooms are Indoors, back far = one warp',()=>{
  const A=P.Activity,s=pr.localPoseState(),body=[0,0,0,0,0,13,0,0];
  const L0=(x,z,act=-1,extra={})=>Object.assign({x,y:0,z,facing:0,speed:2,mode:P.Mode.Walk,zone:P.Zone.Main,warp:false,hidden:false,activity:act},extra);
  pr.fillLocalBody(s,L0(10,10),body);assert.deepEqual(body.slice(0,8),[100,0,100,0,8,P.Mode.Walk,0,0]);
  // the lesson starts in the same frame it teleports the player to (11, 9): friends keep the last outdoor spot
  pr.fillLocalBody(s,L0(11,9,A.Lesson),body);assert.deepEqual(body.slice(0,8),[100,0,100,0,A.Lesson,P.Mode.Busy,0,0],'frozen, Busy, activity in the speed byte');
  pr.fillLocalBody(s,L0(5,9,A.Lesson),body);assert.deepEqual(body.slice(0,3),[100,0,100],'scripted lesson motion is never sent');
  pr.fillLocalBody(s,L0(5,9,A.Quiz),body);assert.equal(body[4],A.Quiz);assert.equal(body[7]&1,0,'no warp while busy');
  // back at (-7, 14): one warp, then normal
  pr.fillLocalBody(s,L0(-7,14),body);assert.equal(body[7]&1,1,'warp once on return far from the anchor');assert.equal(body[5],P.Mode.Walk);
  pr.fillLocalBody(s,L0(-7,14.1),body);assert.equal(body[7]&1,0);
  // Settings and back at the same spot: no warp
  pr.fillLocalBody(s,L0(-7,14.1,A.Settings),body);pr.fillLocalBody(s,L0(-7,14.1),body);assert.equal(body[7]&1,0,'same spot: no warp');
  // a room on another page: Zone.Indoors at the door
  pr.fillLocalBody(s,L0(30,40),body);pr.fillLocalBody(s,L0(30,40,A.Museum),body);assert.deepEqual([body[0],body[2],body[4],body[5],body[6]],[300,400,A.Museum,P.Mode.Busy,P.Zone.Indoors]);
  // in the sea: Busy keeps the Sea zone (the friend treads water inside the field)
  const s2=pr.localPoseState();pr.fillLocalBody(s2,L0(1,1,-1,{zone:P.Zone.Sea,mode:P.Mode.Swim}),body);pr.fillLocalBody(s2,L0(1,1,A.Settings,{zone:P.Zone.Sea}),body);assert.equal(body[6],P.Zone.Sea);
  // every body is a valid wire pose
  assert.ok(P.clampPose(body.slice()));
});
t('connection: tab hidden sends the last pose as away at once; visible again resends; beat hook samples without a timer',()=>{
  const e=makeEnv();const s=goLive(e);
  e.c.sendPose(pose(500),e.clock.now());const before=e.msgs(s).filter(m=>m[0]===1).length;
  e.setHidden(true);const ps=e.msgs(s).filter(m=>m[0]===1);assert.equal(ps.length,before+1,'away pose sent on hide');assert.equal(ps[ps.length-1][9]&2,2,'with the Hidden flag');
  e.setHidden(false);e.c.sendPose(pose(500),e.clock.now()+10);const ps2=e.msgs(s).filter(m=>m[0]===1);assert.equal(ps2[ps2.length-1][9]&2,0,'back: the next pose clears it');
  let calls=0;e.c.onBeforeBeat(()=>{calls++;e.c.sendPose(pose(500,P.Mode.Busy),e.clock.now());});
  e.clock.advance(conn.BEAT_MS+10);assert.equal(calls,1,'sampled on the 5 s beat');
  const last=e.msgs(s).filter(m=>m[0]===1).pop();assert.equal(last[7],P.Mode.Busy,'the Busy pose went out from the beat tick');
  const beats=e.msgs(s).filter(m=>m[0]===9).length;e.clock.advance(conn.BEAT_MS+10);assert.equal(e.msgs(s).filter(m=>m[0]===9).length,beats+1,'unchanged busy pose: only a beat every 5 s');
  e.c.onBeforeBeat(null);
});
t('store: presence + activity per member, emits only when they flip',()=>{
  st.partyStore.reset();st.partyStore.apply([20,1,1,'tok-abcdefghij012345',1,2,0,[[1,[2,0],LOOK,1,null],[2,[3,0],LOOK,0,[0,0,0,0,P.Activity.Quiz,P.Mode.Busy,0,0]]]],1);
  let m=st.partyStore.get().members.find(x=>x.id===2);assert.equal(m.presence,'busy');assert.equal(m.activity,P.Activity.Quiz);
  let emits=0;const off=st.partyStore.subscribe(()=>emits++);
  st.partyStore.apply([23,1,2,0,0,0,0,P.Activity.Quiz,P.Mode.Busy,0,0],2);assert.equal(emits,0,'same presence: no emit');
  st.partyStore.apply([23,2,2,0,0,0,0,P.Activity.Lesson,P.Mode.Busy,0,0],3);assert.equal(emits,1);assert.equal(st.partyStore.get().members.find(x=>x.id===2).activity,P.Activity.Lesson);
  st.partyStore.apply([23,3,2,0,0,0,0,0,P.Mode.Idle,0,2],4);m=st.partyStore.get().members.find(x=>x.id===2);assert.equal(m.presence,'away');assert.equal(m.away,true);
  st.partyStore.apply([23,4,2,0,0,0,0,P.Activity.Museum,P.Mode.Busy,P.Zone.Indoors,0],5);m=st.partyStore.get().members.find(x=>x.id===2);assert.equal(m.presence,'indoors');assert.equal(m.activity,P.Activity.Museum);
  st.partyStore.apply([23,5,2,0,0,0,0,4,P.Mode.Walk,0,0],6);m=st.partyStore.get().members.find(x=>x.id===2);assert.equal(m.presence,'active');assert.equal(m.activity,0,'a walking speed byte is not an activity');
  off();st.partyStore.reset();
});
t('interp carries flags + activity',()=>{
  const it=ip.createInterp({delayMs:0});it.push(7,[10,0,10,0,P.Activity.Settings,P.Mode.Busy,0,2|1],1000);
  const o={x:0,y:0,z:0,yaw:0,speed:0,mode:0,zone:0,fade:0};it.sample(7,1200,o);assert.equal(o.flags,2,'Hidden kept, Warp stripped');assert.equal(o.activity,P.Activity.Settings);
});


// ---- party persistence (docs/multiplayer-design.md "Party persistence") ----
t('persistence: auto-resume of the stored session on a fresh page / mount',()=>{
  const e=makeEnv();e.c.join('k7m-q4r',{look:LOOK,hostKey:'hostkey-abcdefgh',nick:'Emma'});e.last().open();e.last().recv(welcome('tok-keep-0123456789'));
  assert.equal(e.c.hasSession(),true);
  // a reload / room page round trip: a NEW connection object on the same tab storage; the island mount calls resume()
  const r=makeEnv({storage:e.storage});const seen=[];r.c.onStatus(x=>seen.push(x));
  assert.equal(r.c.resume({look:LOOK}),true);assert.equal(r.c.status,'reconnecting','Reconnecting chip, not a fresh join');
  r.last().open();const hello=r.msgs(r.last())[0];
  assert.deepEqual(hello.slice(3),['tok-keep-0123456789','hostkey-abcdefgh'],'resume token + host key');
  assert.equal(hello.length,5,'no name on a resume (the relay keeps it on the slot): the old 5-element Hello');
  r.last().recv(welcome('tok-keep-0123456789'));assert.equal(r.c.status,'live');assert.deepEqual(seen,['reconnecting','live']);
  assert.equal(r.c.code,'K7MQ4R');
  // resume is a no-op when there is nothing stored or already in a party
  assert.equal(r.c.resume({look:LOOK}),false,'already live');
  assert.equal(makeEnv().c.resume({look:LOOK}),false,'nothing stored');
});
t('persistence: unmount / dispose never leaves; only explicit endings clear the session',()=>{
  const e=makeEnv();const s=goLive(e,'tok-keep-0123456789');
  e.c.dispose();assert.ok(!e.msgs(s).some(m=>m[0]===P.C.Leave),'dispose sends no Leave');
  assert.ok(e.storage.getItem('fi-party-session'),'dispose keeps the stored session');
  // a plain drop / hidden tab keeps it
  const e2=makeEnv();const s2=goLive(e2);s2.drop();assert.ok(e2.storage.getItem('fi-party-session'),'drop keeps');
  // explicit: Leave, Ended, Kicked (error + 4003), ended 4004, replaced 4005
  const l=makeEnv();goLive(l);l.c.leave();assert.equal(l.storage.getItem('fi-party-session'),null);
  const en=makeEnv();goLive(en).recv([P.S.Ended,P.EndReason.HostEnded]);assert.equal(en.storage.getItem('fi-party-session'),null);
  const ex=makeEnv();goLive(ex).recv([P.S.Ended,P.EndReason.Expired]);assert.equal(ex.storage.getItem('fi-party-session'),null);
  const k=makeEnv();goLive(k).recv([P.S.Error,P.ErrorCode.Kicked]);assert.equal(k.storage.getItem('fi-party-session'),null);
  for(const code of [4003,4004,4005]){const z=makeEnv();goLive(z).dropWith(code);assert.equal(z.storage.getItem('fi-party-session'),null,'close '+code);}
});
t('persistence: a resume into a gone party gives up (~15 s) and clears; offline keeps it',()=>{
  const e=makeEnv();goLive(e,'tok-keep-0123456789');
  const r=makeEnv({storage:e.storage});r.c.resume({look:LOOK});
  for(let i=0;i<conn.RESUME_ATTEMPTS+1;i++){r.last().drop();r.clock.advance(20000);}
  assert.equal(r.c.status,'error');assert.equal(r.storage.getItem('fi-party-session'),null,'online: cleared (relay refused the upgrade)');
  // the relay answers an ended room with Error Expired + 4004 on a resume
  const e2=makeEnv();goLive(e2,'tok-keep-0123456789');const r2=makeEnv({storage:e2.storage});r2.c.resume({look:LOOK});r2.last().open();
  r2.last().recv([P.S.Error,P.ErrorCode.Expired]);assert.equal(r2.c.status,'error');assert.equal(r2.storage.getItem('fi-party-session'),null);
});
t('persistence: PartyHost resumes on mount and never leaves on unmount (source)',()=>{
  const host=fs.readFileSync(path.join(ROOT,'components/party/PartyHost.tsx'),'utf8');
  assert.ok(/connection\.resume\(\{ look: look\(\) \}\)/.test(host),'PartyHost calls resume on mount');
  // the only leave() calls: the grown-up switch Off, a failed join, the Leave button
  assert.equal((host.match(/\.leave\(\)/g)||[]).length,3);
  assert.ok(!/useEffect\(\(\) => \(\) => [^\n]*\.leave\(/.test(host),'no leave in an unmount cleanup');
  const bridge=fs.readFileSync(path.join(ROOT,'lib/multiplayer/townBridge.ts'),'utf8');
  const disp=bridge.slice(bridge.indexOf('dispose()'));assert.ok(!/conn\.(leave|dispose)\(/.test(disp),'runtime dispose keeps the shared connection');
});

console.log(`mp-client: ${n} groups passed`);
