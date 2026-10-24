// Owner bug (Oct 24 2026): "when my friend uses boost when flying, he is gone on his screen, but on mine he is still at the same
// spot". The real client socket (lib/multiplayer/connection.ts) wired to the real relay room (multiplayer/relay/src/roomCore.ts) on
// a fake clock: a jetpack boost (128 m/s for .45 s) and a sky dive blast (+180 m in 1.05 s) must reach the friend (the relay keeps
// the flyer's poses, never freezes them at the pre-boost spot, never kicks them) and end where the flyer really is.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),req=require('node:module').createRequire(ROOT+'/package.json'),cache=new Map();
const {loadTs}=require('../multiplayer/dev-relay/loadTs.cjs');
const env={NEXT_PUBLIC_MULTIPLAYER:'1',NEXT_PUBLIC_MULTIPLAYER_URL:'http://localhost:8790/'};
function resolveTs(from,id){const base=path.resolve(path.dirname(from),id);return fs.existsSync(base+'.ts')?base+'.ts':path.join(base,'index.ts');}
function load(file){if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
    {exports:mod.exports,module:mod,Math,Date,JSON,Number,Array,Object,Error,Map,Set,Float64Array,Uint8Array,Symbol,console,process:{env},performance:{now:()=>0},
     localStorage:{getItem:()=>null,setItem:()=>{}},require:id=>id.startsWith('.')?load(resolveTs(file,id)):req(id)});
  cache.set(file,mod.exports);return mod.exports;}
const conn=load(path.join(ROOT,'lib/multiplayer/connection.ts')),pr=load(path.join(ROOT,'lib/multiplayer/presence.ts'));
const P=loadTs(path.join(ROOT,'multiplayer/protocol/index.ts')),{RoomCore}=loadTs(path.join(ROOT,'multiplayer/relay/src/roomCore.ts'));
const {C,Mode,Zone,PROTOCOL_VERSION}=P;
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};

function world(){
  let now=1e6,seq=0,seed=7;const timers=[];
  const clock={now:()=>now,setTimeout:(fn,ms)=>{const h={id:++seq,at:now+ms,fn};timers.push(h);return h.id;},clearTimeout:id=>{const i=timers.findIndex(x=>x.id===id);if(i>=0)timers.splice(i,1);}};
  const random=k=>{const a=new Uint8Array(k);for(let i=0;i<k;i++){seed=(seed*1103515245+12345)&0x7fffffff;a[i]=(seed>>8)&255;}return a;};
  const room=new RoomCore({code:'K7MQ4R',createdAt:now,clock:{now:()=>now},random});
  // friend B: a raw peer (the host)
  const b={msgs:[],closed:null,send(s){b.msgs.push(JSON.parse(s));},close(c){b.closed=c;}};
  room.connect(b);room.message(b,JSON.stringify([C.Hello,PROTOCOL_VERSION,[1,2,3,4,5,6,7,8,9,10,11,12],null,null]));
  // flyer A: the real client connection over a fake socket into the same room
  const a={closed:null,errors:[],send(s){const m=JSON.parse(s);if(m[0]===P.S.Error)a.errors.push(m[1]);ws&&ws.onmessage&&ws.onmessage({data:s});},close(c){a.closed=c;}};
  let ws=null;
  class WS{constructor(){this.readyState=0;ws=this;}send(s){room.message(a,s);}close(){this.readyState=3;}}
  const c=conn.createPartyConnection({WebSocketImpl:WS,now:clock.now,random:()=>0.5,setTimeout:clock.setTimeout,clearTimeout:clock.clearTimeout,
    visibility:{hidden:()=>false,on:()=>()=>{}},storage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}});
  c.join('k7m-q4r',{look:JSON.parse(JSON.stringify(load(path.join(ROOT,'lib/multiplayer/look.ts')).lookToWire(load(path.join(ROOT,'lib/town/customization.ts')).DEFAULT_CUSTOMIZATION)))});
  ws.readyState=1;room.connect(a);ws.onopen&&ws.onopen();
  assert.equal(c.status,'live','A is live in the room');
  const idA=(()=>{let id=-1;room.members.forEach(m=>{if(m.peer===a)id=m.id;});return id;})();
  const relayPose=()=>{let p=null;room.members.forEach(m=>{if(m.id===idA)p=m.pose;});return p;};
  const run=(fn,seconds)=>{let lastTick=now;for(let ms=0;ms<seconds*1000;ms+=16){fn(ms/1000);now+=16;timers.sort((x,y)=>x.at-y.at);while(timers[0]&&timers[0].at<=now)timers.shift().fn();if(now-lastTick>=100){room.tick();lastTick=now;}}};
  return{c,a,b,room,relayPose,run,now:()=>now};
}
const body=(x,y,z,mode=Mode.Jetpack)=>[Math.round(x*10),Math.round(y*10),Math.round(z*10),0,0,mode,Zone.Main,0];

t('a jetpack boost reaches the friend: the relay keeps following, the friend ends where the flyer is',()=>{
  const w=world();let x=0,z=0;const y=28,stale=[];let lastX=null,lastChange=0;
  const watch=s=>{const p=w.relayPose();if(p&&p[0]!==lastX){lastX=p[0];lastChange=s;}};
  w.run(s=>{x=34*s;w.c.sendPose(body(x,y,z),w.now());watch(s);},2); // cruise 2 s
  let boostT=0;w.run(s=>{boostT=s;x+=(s<.45?128:0)*.016;w.c.sendPose(body(x,y,z),w.now());watch(2+s);if(2+s-lastChange>.6)stale.push(2+s);},6); // boost .45 s, then hover still
  const p=w.relayPose();
  assert.equal(w.a.closed,null,'never kicked');assert.deepEqual(w.a.errors,[],'no relay errors');
  assert.ok(Math.abs(p[0]/10-x)<1&&Math.abs(p[1]/10-y)<1,`friend sees the flyer at the real spot (relay ${p[0]/10}, real ${x.toFixed(1)})`);
  assert.ok(stale.filter(s=>s<2.6).length===0,`the friend's view of the flyer never froze during / right after the boost (stale at ${stale.slice(0,3)})`);
});

t('repeated boosts (every .5 s for 4 s) never freeze the flyer on the friend\'s screen',()=>{
  const w=world();let x=0;let lastX=null,lastChange=0,worst=0;
  w.run(s=>{const ph=s%.5;x+=(ph<.45?128:34)*.016;w.c.sendPose(body(x,28,0),w.now());const p=w.relayPose();if(p&&p[0]!==lastX){lastX=p[0];lastChange=s;}worst=Math.max(worst,s-lastChange);},4);
  w.run(s=>{w.c.sendPose(body(x,28,0),w.now());},8); // hover: the friend catches up
  const p=w.relayPose();
  assert.ok(worst<.6,`relay pose kept moving (worst stall ${worst.toFixed(2)} s)`);
  assert.ok(Math.abs(p[0]/10-x)<1,`caught up (relay ${p[0]/10}, real ${x.toFixed(1)})`);
});

t('the sky dive blast (+180 m, above WORLD_BOUNDS.maxY) never kicks the flyer and the friend follows',()=>{
  const w=world();let y=28;
  w.run(s=>{w.c.sendPose(body(0,y,0),w.now());},1);
  w.run(s=>{const k=Math.min(1,s/1.05);y=28+180*k*k*k*(k*(6*k-15)+10);w.c.sendPose(body(0,y,0),w.now());},1.2);
  w.run(s=>{y=Math.max(30,y-6*.016);w.c.sendPose(body(0,y,0),w.now());},20); // parachute down
  w.run(()=>w.c.sendPose(body(0,y,0),w.now()),3);
  assert.equal(w.a.closed,null,'never kicked for a y over 200 m');assert.deepEqual(w.a.errors,[],'no BadMessage error');
  const p=w.relayPose();assert.ok(Math.abs(p[1]/10-y)<1,`friend sees the landing height (relay ${p[1]/10}, real ${y.toFixed(1)})`);
});

t('governPose: clamps to WORLD_BOUNDS, passes slow moves, warps a big lag once per 5.3 s, else caps to the relay speed',()=>{
  const g=pr.poseGovernor(),B=P.WORLD_BOUNDS;
  const first=pr.governPose(g,[0,99999,0,0,0,Mode.Jetpack,Zone.Main,0],0);assert.equal(first[1],B.maxY);pr.commitPose(g,first,0);
  const slow=pr.governPose(g,[200,B.maxY,0,0,0,Mode.Jetpack,Zone.Main,0],1000);assert.equal(slow[0],200);assert.equal(slow[7],0);
  const jump=pr.governPose(g,[3000,B.maxY,0,0,0,Mode.Jetpack,Zone.Main,0],100);assert.equal(jump[7]&1,1,'a 300 m lag with a Warp free: Warp');pr.commitPose(g,jump,100);
  const far=pr.governPose(g,[6000,B.maxY,0,0,0,Mode.Jetpack,Zone.Main,0],200);assert.equal(far[7]&1,0,'no second Warp inside 5.3 s');
  assert.ok(far[0]>3000&&far[0]<3000+10*(34*1.5*.1+2),'capped under the relay limit');
  assert.ok(P.speedOk(jump,far,100),'the relay keeps the capped pose');
});

console.log(`mp-boost-pose: ${n} passed`);
