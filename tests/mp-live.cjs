// Multiplayer live feel (Oct 23 2026): relay v1.2 caps handshake, ~10 Hz timestamped near poses (S.Live), friends' balls (C.Ball),
// the live clock + interpolator delay, readable name labels, friends' balls and flying friends' jet plumes in remoteAvatars.
// Node only (no browser, no network): protocol + RoomCore with a fake clock, the connection on a mock socket, the avatar layer with stubs.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),T=require('three');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {loadTs}=require(path.join(root,'multiplayer/dev-relay/loadTs.cjs'));
const P=loadTs(path.join(root,'multiplayer/protocol/index.ts'));
const {RoomCore}=loadTs(path.join(root,'multiplayer/relay/src/roomCore.ts'));
const {C,S,Cap,BallState,Mode,Zone}=P;
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
// sandboxed TS loader with module overrides (as tests/mp-avatars.cjs)
const stubCanvas={getContext:()=>null,width:0,height:0};
function load(file,over={},env={}){
 const m={exports:{}},full=path.join(root,file);
 const out=ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(out,{module:m,exports:m.exports,process:{env},document:{createElement:()=>({...stubCanvas})},Date,Math,Number,Set,Map,Float64Array,Float32Array,Int32Array,Uint8Array,Promise,JSON,Array,Object,Error,console,
  require:id=>{
   if(id==='three')return T;
   if(id.startsWith('.')){const rel=path.resolve(path.dirname(full),id),key=path.basename(rel);if(over[key])return over[key];
    for(const ext of ['.ts','/index.ts'])if(fs.existsSync(rel+ext))return load(path.relative(root,rel+ext),over,env);}
   return require(id);
  }});
 return m.exports;
}
const LOOK=new Array(12).fill(0);
const pose=(x,z,mode=Mode.Run)=>[x,0,z,0,8,mode,Zone.Main,0];

// ---------------------------------------------------------------- protocol
t('protocol: new frames parse, bad ones do not, old frames unchanged',()=>{
 const j=JSON.stringify;
 assert.deepEqual(P.parseClient(j([C.Caps,3])),[11,3]);
 assert.deepEqual(P.parseClient(j([C.Ball,BallState.Free,1000,5,-200])),[12,3,1000,5,-200]);
 for(const b of [[11],[11,-1],[11,256],[11,1.5],[12,4,0,0,0],[12,3,99999,0,0],[12,3,0,0],[12,3,0,3000,0],[12,'3',0,0,0]])assert.equal(P.parseClient(j(b)),null,j(b));
 assert.deepEqual(P.parseServer(j([S.Caps,3])),[32,3]);
 const live=[S.Live,1760000000000,[4,...pose(10,20),35,5,...pose(30,40),0],[4,BallState.Free,12,3,22,10]];
 assert.ok(P.parseServer(j(live)),'S.Live parses');
 for(const b of [[33,1,[],[]].slice(0,3),[33,1,[1,2,3],[]],[33,1,[],[1,2,3]],[33,1,[40,...pose(1,1),0],[]],[33,1,[4,...pose(1,1),-1],[]],[33,1,[],[4,5,0,0,0,0]],[33,-1,[],[]]])
  assert.equal(P.parseServer(j(b)),null,j(b));
 assert.equal(P.C.Caps,11);assert.equal(P.C.Ball,12);assert.equal(P.S.Caps,32);assert.equal(P.S.Live,33);
 assert.ok(j([C.Ball,3,-4000,-400,-6000]).length<40,'a ball frame is tiny');
 // a full 19-friend S.Live with balls stays far below the 8 KB server cap
 const ps=[],bs=[];for(let i=0;i<19;i++){ps.push(i,-4000,-400,-6000,255,255,13,4,3,60000);bs.push(i,3,-4000,-400,-6000,60000);}
 const big=j([33,Number.MAX_SAFE_INTEGER,ps,bs]);assert.ok(big.length<2600,big.length+' B');assert.ok(P.parseServer(big));
 assert.deepEqual([P.RATE.pose,P.RATE.ball].map(x=>[...x]),[[12,16],[12,16]],'relay pose bucket 12 / s for ~10 Hz poses; ball bucket 12 / s');
});

// ---------------------------------------------------------------- relay core
function room(){
 let now=1e6;const clock={now:()=>now,adv:(ms)=>{now+=ms;}};let r=1;
 const core=new RoomCore({code:'K7MQ4R',createdAt:now,clock,random:(k)=>{const a=new Uint8Array(k);for(let i=0;i<k;i++)a[i]=(r=(r*48271)%2147483647)&255;return a;}});
 const peer=()=>{const p={got:[],closed:null,send(s){p.got.push(JSON.parse(s));},close(c){p.closed=c;},of(k){return p.got.filter(m=>m[0]===k);}};return p;};
 const join=(caps=0)=>{const p=peer();core.connect(p,false);core.message(p,JSON.stringify([C.Hello,1,LOOK,null,null]));if(caps)core.message(p,JSON.stringify([C.Caps,caps]));return p;};
 let seq=0;const send=(p,body)=>core.message(p,JSON.stringify([C.Pose,seq++,...body]));
 return {core,clock,join,send,peer};
}
t('relay: S.Caps after every Welcome; an old client (no C.Caps) keeps getting exactly S.Poses at 5 Hz',()=>{
 const R=room(),a=R.join(),b=R.join(Cap.Live|Cap.Ball);
 assert.deepEqual(a.of(S.Caps),[[32,P.CAPS_ALL]],'the relay offers its caps right after Welcome');
 assert.equal(a.got.findIndex(m=>m[0]===S.Caps),a.got.findIndex(m=>m[0]===S.Welcome)+1);
 R.clock.adv(100);R.send(b,pose(100,100));R.core.halfTick();
 assert.equal(a.of(S.Poses).length+a.of(S.Live).length,0,'half ticks never reach an old client');
 R.core.tick();assert.equal(a.of(S.Poses).length,1);assert.equal(a.of(S.Live).length,0,'an old client never gets S.Live');
 assert.equal(a.of(S.Poses)[0].length,2+9);
});
t('relay: a Live client gets the nearest 4 within 40 m at 10 Hz, timestamped, never the same pose twice',()=>{
 const R=room(),me=R.join(Cap.Live),fr=[];
 R.send(me,pose(0,0));
 for(let i=0;i<6;i++)fr.push(R.join());
 R.core.tick();me.got.length=0;
 R.clock.adv(30);fr.forEach((p,i)=>R.send(p,pose(20+i*20,0))); // 2, 4, 6, 8, 10, 12 m
 R.clock.adv(40);R.core.halfTick();
 const h=me.of(S.Live);assert.equal(h.length,1,'one frame');
 const ids=[];for(let i=0;i<h[0][2].length;i+=10)ids.push(h[0][2][i]);
 assert.equal(ids.length,4,'nearest 4 only');
 assert.equal(h[0][1],R.clock.now(),'relay clock');assert.equal(h[0][2][9],40,'age = ms since the relay got that pose');
 me.got.length=0;R.core.tick();
 const full=me.of(S.Live);assert.equal(full.length,1);assert.equal(full[0][2].length/10,2,'the 5 Hz tick sends only the two not yet sent');
 me.got.length=0;R.core.halfTick();R.core.tick();assert.equal(me.got.length,0,'nothing new: nothing sent');
 // far friends (> 40 m) wait for the 5 Hz tick
 const far=R.join();me.got.length=0;R.clock.adv(100);R.send(far,pose(500,0));R.core.halfTick();assert.equal(me.of(S.Live).length,0,'50 m: not on the half tick');
 R.core.tick();assert.equal(me.of(S.Live).length,1,'50 m: on the full tick');
});
t('relay: balls go to Ball clients in the same room within 80 m; None inside a force field; no bad count without caps',()=>{
 const R=room(),me=R.join(Cap.Live|Cap.Ball),old=R.join(),kid=R.join(Cap.Live|Cap.Ball);
 R.send(me,pose(0,0));R.send(old,pose(10,0));R.send(kid,pose(30,0));R.core.tick();me.got.length=0;old.got.length=0;
 R.core.message(kid,JSON.stringify([C.Ball,BallState.Feet,30,2,0]));R.core.halfTick();
 const l=me.of(S.Live);assert.equal(l.length,1);assert.deepEqual(l[0][3].slice(0,5),[2,BallState.Feet,30,2,0].map((v,i)=>i===0?l[0][3][0]:v));
 assert.equal(old.got.length,0,'an old client never hears balls');
 me.got.length=0;R.core.message(kid,JSON.stringify([C.Ball,BallState.Feet,30,2,0]));R.core.halfTick();assert.equal(me.got.length,0,'unchanged ball: not resent');
 // a shot far away: out of range (80 m) for me
 R.clock.adv(100);R.core.message(kid,JSON.stringify([C.Ball,BallState.Free,2000,5,0]));R.core.halfTick();assert.equal(me.of(S.Live).length,0,'200 m away: not sent');
 R.clock.adv(100);R.core.message(kid,JSON.stringify([C.Ball,BallState.Free,300,5,0]));R.core.halfTick();assert.equal(me.of(S.Live).length,1,'back in range: sent');
 // busy (Mode.Busy = force field): the relay turns the ball into None
 me.got.length=0;R.clock.adv(100);R.send(kid,[30,0,0,0,0,Mode.Busy,Zone.Main,0]);R.clock.adv(100);R.core.message(kid,JSON.stringify([C.Ball,BallState.Feet,30,2,0]));R.core.halfTick();
 const b=me.of(S.Live).flatMap(m=>m[3]);assert.equal(b[1],BallState.None,'busy: no ball shown');
 // an old client that somehow sends C.Ball without caps is ignored, never counted as a bad frame
 for(let i=0;i<8;i++){R.clock.adv(100);R.core.message(old,JSON.stringify([C.Ball,1,0,0,0]));}
 assert.equal(old.closed,null,'not kicked');
});

// ---------------------------------------------------------------- client connection
const conn=load('lib/multiplayer/connection.ts',{config:{relayWsUrl:()=>'ws://x/'}},{NEXT_PUBLIC_MULTIPLAYER:'1'});
function client(){
 let now=1e6;const timers=[];const sockets=[];
 class WS{constructor(){this.readyState=0;this.sent=[];sockets.push(this);}send(s){this.sent.push(JSON.parse(s));}close(){this.readyState=3;}}
 const c=conn.createPartyConnection({WebSocketImpl:WS,now:()=>now,random:()=>.5,setTimeout:(fn,ms)=>{timers.push({fn,at:now+ms});return timers.length;},clearTimeout:()=>{},
  visibility:{hidden:()=>false,on:()=>()=>{}},storage:null,locks:null,url:()=>'ws://x/'});
 c.join('K7MQ4R',{look:LOOK,nick:'Emma'});
 const ws=sockets[0];ws.readyState=1;ws.onopen();
 const recv=m=>ws.onmessage({data:JSON.stringify(m)});
 recv([20,1,1,'tok-abcdefghij012345',Date.now()+7200000,Date.now()+14400000,0,[[1,[2,0],LOOK,1,null,'Emma']]]);
 return {c,ws,recv,adv:ms=>{now+=ms;},get now(){return now;}};
}
t('client: C.Caps only after S.Caps; ~10 Hz moving poses with a v1.2 relay, 5 Hz without',()=>{
 const run=(withCaps)=>{const k=client();if(withCaps)k.recv([32,3]);
  assert.deepEqual(k.ws.sent.filter(m=>m[0]===C.Caps),withCaps?[[11,3]]:[],'C.Caps only as an answer');
  let x=0;const before=k.ws.sent.length;for(let f=0;f<60;f++){k.adv(1000/60);x+=1;k.c.sendPose([x,0,0,0,8,Mode.Run,Zone.Main,0],k.now);}
  return k.ws.sent.slice(before).filter(m=>m[0]===C.Pose).length;};
 const old=run(false),live=run(true);
 assert.ok(old>=4&&old<=6,'old relay: ~5 poses a second ('+old+')');
 assert.ok(live>=9&&live<=11,'v1.2 relay: ~10 poses a second ('+live+')');
 assert.equal(conn.LIVE_MOVE_GAP_MS,90);
});
t('client: sendBall needs Cap.Ball, throttles to 10 Hz, skips unchanged, clamps to the world bounds',()=>{
 const k=client();k.c.sendBall(BallState.Feet,1,0,1,k.now);assert.equal(k.ws.sent.filter(m=>m[0]===C.Ball).length,0,'old relay: no ball frames, ever');
 k.recv([32,3]);
 k.c.sendBall(BallState.Feet,1,0,1,k.now);k.adv(16);k.c.sendBall(BallState.Feet,1.5,0,1,k.now);k.adv(200);k.c.sendBall(BallState.Feet,3,0,1,k.now);
 assert.equal(k.ws.sent.filter(m=>m[0]===C.Ball).length,1,'Feet: only on a change of state');
 let sent=0;for(let f=0;f<60;f++){k.adv(1000/60);k.c.sendBall(BallState.Free,f*.4,1,0,k.now);}
 sent=k.ws.sent.filter(m=>m[0]===C.Ball).length-1;assert.ok(sent>=9&&sent<=11,'a moving Free ball: ~10 a second ('+sent+')');
 k.adv(500);k.c.sendBall(BallState.Free,99999,-999,0,k.now);const last=k.ws.sent[k.ws.sent.length-1];
 assert.deepEqual(last,[12,3,P.WORLD_BOUNDS.maxX,P.WORLD_BOUNDS.minY,0],'clamped: the relay never sees a bad ball frame');
 for(const m of k.ws.sent.filter(m=>m[0]===C.Ball))assert.ok(P.parseClient(JSON.stringify(m)),'every ball frame parses');
});

// ---------------------------------------------------------------- live clock + interpolation
const LC=load('lib/multiplayer/liveClock.ts');
const IP=load('lib/multiplayer/interp.ts',{},{});
t('live clock: jittered arrivals map back onto the sender timeline; delay = base + jitter, slewed; legacy delay without S.Live',()=>{
 const c=LC.createLiveClock();assert.equal(c.live,false);assert.equal(c.delay(0),LC.LEGACY_DELAY_MS);
 let seed=7;const rnd=()=>((seed=(seed*16807)%2147483647)/2147483647);
 const mapped=[];
 for(let i=0;i<200;i++){const serverT=1e9+i*100,local=5000+i*100+40+rnd()*35;mapped.push(c.map(serverT,0,local));}
 for(let i=101;i<200;i++){const d=mapped[i]-mapped[i-1];assert.ok(Math.abs(d-100)<6,'spacing kept (the offset only creeps 0.5 ms / s): '+d.toFixed(2));}
 assert.ok(c.live&&c.jitter>5&&c.jitter<40,'jitter '+c.jitter.toFixed(1));
 let d=0;for(let k=0;k<400;k++)d=c.delay(k*16);
 assert.ok(d>=LC.LIVE_BASE_DELAY_MS&&d<=LC.LIVE_BASE_DELAY_MS+40,'delay '+d);
 const c2=LC.createLiveClock();c2.delay(0);c2.map(1e9,0,1000);const d1=c2.delay(16);assert.ok(Math.abs(d1-LC.LEGACY_DELAY_MS)<=16*.04+1e-9,'slews, never jumps');
 assert.ok(LC.LEGACY_DELAY_MS>=360,'an old 5 Hz relay + 5 Hz sender: snapshots up to 400 ms apart are covered');
 c.reset();assert.equal(c.live,false);
});
t('interp: setDelay applies; 8 slots hold 500 ms of 10 Hz snapshots (no extrapolation at the max live delay)',()=>{
 const it=IP.createInterp({delayMs:250}),out={};
 for(let i=0;i<10;i++)it.push(1,[i*10,0,0,0,40,Mode.Run,Zone.Main,0],1000+i*100);
 it.setDelay(500);assert.ok(it.sample(1,1900,out));assert.ok(Math.abs(out.x-4)<.01,'500 ms behind the newest: interpolated, x '+out.x);
 it.setDelay(250);it.sample(1,1900,out);assert.ok(Math.abs(out.x-6.5)<.01,'x '+out.x);
 assert.match(read('lib/multiplayer/interp.ts'),/const SLOTS = 8;/);
});

// ---------------------------------------------------------------- avatars: label, posing tier, balls, jets
function avatars(){
 const state={posed:0};
 const over={
  player:{createPlayer:()=>({root:new T.Group(),setAppearance(){},setBeanLook(){},setExpression(){},update(){state.posed++;},dispose(){}})},
  playerBatch:{playerBatch:()=>({begin(){},draw(){},end(){},dispose(){}})},
  heatTier:{effectiveTier:()=>0,batterySaverOn:()=>false},
  celebrations:{applyCelebrationArms(){},celebrationMotion(){},applyRideEmote(){}},emotePose:{applyEmoteArms(){},emoteBody(){return {called:0,jump:undefined};}},
  customization:{beanLookFor:()=>({}),playerOutfit:()=>({})},look:{wireToLook:l=>l},
 };
 const mod=load('lib/graphics/remoteAvatars.ts',over);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(50,1,.1,500);camera.position.set(0,22,30);camera.lookAt(0,0,0);
 const a=mod.createRemoteAvatars(scene,{phone:true,maxFor:()=>5,groundAt:()=>0});
 return {mod,a,scene,camera,state};
}
t('label: one sprite + one texture per friend, letters bigger than a townsfolk name tag',()=>{
 const {mod}=avatars();
 const npcText=43/512*3.5;// islandNpcs.ts: 43 px name on a 512 px canvas drawn 3.5 m wide
 assert.ok(mod.labelTextWorldHeight()>npcText*1.2,'friend name '+mod.labelTextWorldHeight().toFixed(2)+' m vs townsfolk '+npcText.toFixed(2)+' m (was 0.16 m)');
 const src=read('lib/graphics/remoteAvatars.ts');
 assert.equal((src.match(/makeLabelTexture\(/g)||[]).length,3,'made on upsert / rename only (definition + 2 calls)');
 assert.ok(!/makeLabelTexture/.test(src.slice(src.indexOf('update(dt,poses,camera,reduced,local,balls){'),src.indexOf('dispose(){'))),'never per frame');
});
t('posing tier: a friend next to me poses every frame even with the camera 35 m back',()=>{
 const {a,camera,state}=avatars();a.upsert(1,LOOK,'Ayako',{hex:'#E69F00'});
 const poses=new Map([[1,{x:3,y:0,z:0,yaw:0,speed:4,mode:Mode.Run,zone:Zone.Main,fade:1}]]);
 for(let f=0;f<5;f++)a.update(.016,poses,camera,false,{x:0,y:0,z:0,hex:'#0072B2'});state.posed=0;
 for(let f=0;f<30;f++)a.update(.016,poses,camera,false,{x:0,y:0,z:0,hex:'#0072B2'});
 assert.equal(state.posed,30,'every frame (was 10 Hz: the camera distance picked the far tier)');
});
t('balls: at most 4 meshes sharing one geometry + material, Feet at the feet, Free where sent, none when hidden / busy / no state',()=>{
 const {a,mod,camera,scene}=avatars();const poses=new Map(),balls=new Map();
 for(let i=1;i<=6;i++){a.upsert(i,LOOK,'F'+i,{hex:'#E69F00'});poses.set(i,{x:i*2-6,y:0,z:0,yaw:0,speed:0,mode:Mode.Idle,zone:Zone.Main,fade:1});balls.set(i,{state:BallState.Feet,x:0,y:0,z:0});}
  a.update(.016,poses,camera,false,null,balls);
 const meshes=[];scene.traverse(o=>{if(o.name==='remote-ball')meshes.push(o);});
 assert.equal(meshes.length,mod.BALL_MAX);assert.equal(mod.BALL_MAX,4);assert.equal(a.ballsShown,4,'6 friends with balls: the nearest 4');
 const geo=meshes[0].geometry,mat=meshes[0].material;assert.equal(geo.name,'classic-ball');assert.equal(mat.name,'classic-ball');
 for(const m of meshes){assert.equal(m.geometry,geo);assert.equal(m.material,mat);assert.equal(m.castShadow,false);}
 const out={x:0,y:0,z:0};
 assert.ok(mod.friendBallSpot(BallState.Feet,{x:0,y:0,z:0},{x:1,y:2,z:3,yaw:0,mode:Mode.Run},0,0,out));assert.deepEqual([out.x,+out.y.toFixed(2),+out.z.toFixed(2)],[1,2.19,3.55]);
 assert.ok(mod.friendBallSpot(BallState.Free,{x:9,y:1,z:8},{x:1,y:2,z:3,yaw:0,mode:Mode.Jetpack},0,0,out));assert.deepEqual([out.x,out.y,out.z],[9,1,8]);
 assert.equal(mod.friendBallSpot(BallState.Feet,{x:0,y:0,z:0},{x:1,y:2,z:3,yaw:0,mode:Mode.Bike},0,0,out),false,'on a bike: no ball at the feet');
 for(const b of balls.values())b.state=BallState.None;a.update(.016,poses,camera,false,null,balls);assert.equal(a.ballsShown,0);
 balls.get(1).state=BallState.Feet;a.setHidden(new Set([1]));a.update(.016,poses,camera,false,null,balls);assert.equal(a.ballsShown,0,'hidden friend: no ball');
 a.setHidden(new Set());poses.get(1).mode=Mode.Busy;poses.get(1).speed=0;for(let f=0;f<3;f++)a.update(.016,poses,camera,false,null,balls);assert.equal(a.ballsShown,0,'busy (force field): no ball');
 a.update(.016,poses,camera,false,null,null);assert.equal(a.ballsShown,0,'no ball map (rooms / old relay): nothing');
 a.dispose();assert.ok(!scene.getObjectByName('remote-ball'),'meshes removed');
});
t('jets: a flying friend gets the blue plume from ONE shared pool, at most 3 friends, nothing under reduced motion',()=>{
 const {a,camera,scene}=avatars();const poses=new Map();
 for(let i=1;i<=5;i++){a.upsert(i,LOOK,'F'+i,{hex:'#E69F00'});poses.set(i,{x:i*2-6,y:6,z:0,yaw:0,speed:8,mode:Mode.Jetpack,zone:Zone.Main,fade:1});}
 for(let f=0;f<20;f++)a.update(.016,poses,camera,false,null);
 assert.equal(a.jetsShown,3,'nearest 3 flying friends');
 const plume=scene.getObjectByName('remote-jet-plumes');assert.ok(plume&&plume.isInstancedMesh&&plume.visible&&plume.count>0,'drawn: '+(plume&&plume.count));
 assert.ok(plume.count<=120,'hard cap');const cols=plume.instanceColor;assert.ok(cols,'blue / teal colours like the local pack');
 let meshes=0;scene.traverse(o=>{if(o.name==='remote-jet-plumes')meshes++;});assert.equal(meshes,1,'one draw call for every friend');
 for(const p of poses.values())p.mode=Mode.Run;for(let f=0;f<60;f++)a.update(.016,poses,camera,false,null);
 assert.equal(a.jetsShown,0);assert.equal(plume.visible,false,'landed: the plume fades and the mesh hides');
 for(const p of poses.values())p.mode=Mode.Jetpack;for(let f=0;f<5;f++)a.update(.016,poses,camera,true,null);assert.equal(plume.count,0,'reduced motion: no particles');
 const src=read('lib/graphics/remoteJets.ts');assert.equal((src.match(/new T\.InstancedMesh/g)||[]).length,1);
 const end=src.slice(src.indexOf('end(dt, reduced) {'),src.indexOf('dispose()'));assert.ok(!/\bnew\s|=>|\.map\(|\.filter\(/.test(end),'end() allocates nothing');
});
t('wiring: Town sends its ball (friends draw the classic ball); the bridge passes balls; the relay steps at 10 Hz',()=>{
 const town=read('components/Town.tsx'),bridge=read('lib/multiplayer/townBridge.ts'),core=read('lib/multiplayer/roomParty.ts'),idx=read('lib/multiplayer/index.ts');
 assert.match(town,/party\.ball\(/);assert.doesNotMatch(town,/setBallLook/,'friends never borrow the local (skinned) ball');assert.match(town,/groundAt:fieldSurfaceHeight/);
 assert.match(bridge,/avatars\.update\(dt, poses, camera, ctx\.reducedMotion\(\), showRing \? ring : null, core\.balls\)/);
 assert.match(core,/interp\.setDelay\(delay\); ballInterp\.setDelay\(delay\)/);assert.match(idx,/liveClock\.map\(/);
 assert.match(read('multiplayer/relay/src/partyRoom.ts'),/const TICK_MS = 100;[\s\S]*core\.halfTick\(\)/);
 assert.match(read('multiplayer/dev-relay/server.mjs'),/room\.halfTick\(\)/);
});
console.log('mp-live: '+n+' groups passed');
