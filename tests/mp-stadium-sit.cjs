// West Stadium phase 5 (docs/stadium/PLAN.md): other players see a seated player in their seat. The seated pose on the v1 wire
// (multiplayer/protocol/seat.ts: Mode.Idle + speed byte SEAT_SPEED_Q at the seat), through the UNCHANGED relay (RoomCore), an old
// client's fallback (a still Idle friend), no interpolation slide / extrapolation while seated, the seat snap + occupied seats
// (lib/town/stadiumSeatShare.ts), and the remote draw hooks. usage: node tests/mp-stadium-sit.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),T=require('three');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const cache=new Map();
function load(file,over={}){
 const full=path.join(root,file);if(!Object.keys(over).length&&cache.has(full))return cache.get(full);
 const m={exports:{}};if(!Object.keys(over).length)cache.set(full,m.exports);
 const out=ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(out,{module:m,exports:m.exports,process:{env:{}},document:{createElement:()=>({getContext:()=>null,width:0,height:0})},
  Date,Math,Number,Set,Map,Float64Array,Float32Array,Uint8Array,Uint16Array,Uint32Array,Promise,JSON,Array,Object,Error,Symbol,performance:{now:()=>0},
  require:id=>{
   if(id==='three')return T;
   if(id.startsWith('.')){const rel=path.resolve(path.dirname(full),id),key=path.basename(rel);if(over[key])return over[key];
    for(const ext of ['.ts','/index.ts'])if(fs.existsSync(rel+ext))return load(path.relative(root,rel+ext),over);}
   return require(id);
  }});
 if(!Object.keys(over).length)cache.set(full,m.exports);
 return m.exports;
}
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const P=load('multiplayer/protocol/index.ts'),{Mode,Zone,C,S,SEAT_SPEED_Q,seatedWire,clampPose,speedOk,MAX_SPEED_MS,presenceOf}=P;
const seats=load('lib/town/stadiumSeats.ts'),share=load('lib/town/stadiumSeatShare.ts'),pres=load('lib/multiplayer/presence.ts'),ip=load('lib/multiplayer/interp.ts');
const {STANDS,standWorld,ROWS,ROW_DEPTH,SEAT_ROOT,rowHeight}=seats;
// A real seat: west stand, row 3, near the middle of the stand.
const W=STANDS.find(s=>s.id==='west'),row=3,spot=standWorld(W,W.inner+row*ROW_DEPTH+SEAT_ROOT,(W.from+W.to)/2);
const seat=seats.nearestSeat(spot.x,spot.z,rowHeight(row));
t('test seat exists',()=>{assert.ok(seat&&seat.row===row,'a west seat');assert.ok(ROWS>row);});

// 1. The sender: fillLocalBody sends the seat exactly (x, row height, z, facing the pitch), mode Idle, speed byte SEAT_SPEED_Q.
const body=[0,0,0,0,0,Mode.Idle,Zone.Main,0];
const local=(o)=>({x:seat.x+.3,y:seat.y+.1,z:seat.z,facing:1,speed:0,mode:Mode.Idle,zone:Zone.Main,warp:false,hidden:false,activity:-1,...o});
t('seated body',()=>{
 const st=pres.localPoseState();pres.fillLocalBody(st,local({seat}),body);
 assert.deepEqual(body.slice(0,3),[Math.round(seat.x*10),Math.round(seat.y*10),Math.round(seat.z*10)],'the seat spot');
 assert.equal(body[3],Math.round(((seat.yaw%(2*Math.PI))+2*Math.PI)%(2*Math.PI)/(2*Math.PI)*256)&255,'facing the pitch');
 assert.equal(body[4],SEAT_SPEED_Q);assert.equal(body[5],Mode.Idle);assert.equal(body[6],Zone.Main);assert.equal(body[7],0);
 assert.ok(seatedWire(body[5],body[4],body[6]));
});
t('a plain Idle never reads as seated',()=>{
 const st=pres.localPoseState();pres.fillLocalBody(st,local({speed:.14}),body);// round(.14*4) = 1 = SEAT_SPEED_Q
 assert.equal(body[4],0);assert.ok(!seatedWire(body[5],body[4],body[6]));
 pres.fillLocalBody(st,local({speed:.14,mode:Mode.Walk}),body);assert.equal(body[4],1,'a walker keeps its speed byte');assert.ok(!seatedWire(body[5],body[4],body[6]));
 assert.ok(!seatedWire(Mode.Busy,SEAT_SPEED_Q,Zone.Main)&&!seatedWire(Mode.Idle,SEAT_SPEED_Q,Zone.Indoors),'busy and room poses are never seated');
});
t('busy wins over seated',()=>{
 const st=pres.localPoseState();pres.fillLocalBody(st,local({seat,activity:P.Activity.Settings}),body);assert.equal(body[5],Mode.Busy);
});

// 2. The deployed relay already accepts it: clampPose (the relay's validator, unchanged) and a RoomCore round trip.
t('relay accepts the seated pose',()=>{
 const st=pres.localPoseState();pres.fillLocalBody(st,local({seat}),body);
 assert.deepEqual(Array.from(clampPose(body.slice())),body.slice(),'clampPose keeps it as is');
 const walkUp=[body[0]+12,body[1],body[2],0,8,Mode.Walk,Zone.Main,0];assert.ok(speedOk(walkUp,body,200),'the 1.2 m snap onto the seat passes the Idle speed cap');
 assert.ok(MAX_SPEED_MS[Mode.Idle]>0);
});
t('RoomCore relays it unchanged',()=>{
 const {loadTs}=require('../multiplayer/dev-relay/loadTs.cjs');
 const R=loadTs(path.join(root,'multiplayer/protocol/index.ts')),{RoomCore}=loadTs(path.join(root,'multiplayer/relay/src/roomCore.ts'));
 let sd=7;const random=k=>{const a=new Uint8Array(k);for(let i=0;i<k;i++){sd=(sd*1103515245+12345)&0x7fffffff;a[i]=(sd>>8)&255;}return a;};
 const clock={t:1e6,now(){return this.t;}},room=new RoomCore({code:'K7MQ4R',createdAt:clock.t,clock,random});
 const peer=()=>{const p={msgs:[],closed:null,send(x){p.msgs.push(JSON.parse(x));},close(c){p.closed=c;}};p.of=op=>p.msgs.filter(m=>m[0]===op);return p;};
 const join=key=>{const p=peer();room.connect(p);room.message(p,JSON.stringify([R.C.Hello,R.PROTOCOL_VERSION,[1,2,3,4,5,6,7,8,9,10,11,12],null,key]));return p;};
 const host=join(room.hostKey),a=join(null),ia=a.of(R.S.Welcome)[0][2];
 const last=id=>{const ms=host.of(R.S.Poses);for(let j=ms.length-1;j>=0;j--){const m=ms[j];for(let k=2;k<m.length;k+=9)if(m[k]===id)return m.slice(k+1,k+9);}return null;};
 room.message(a,JSON.stringify([R.C.Pose,1,body[0]+12,body[1],body[2],0,8,R.Mode.Walk,R.Zone.Main,0]));room.tick();
 clock.t+=200;room.message(a,JSON.stringify([R.C.Pose,2,...body]));room.tick();
 assert.deepEqual(last(ia),body,'the seated pose reaches the other player as sent');
 assert.equal(a.closed,null);assert.equal(a.of(R.S.Error).length,0,'no error');
});

// 3. An old client (no seat.ts): reads Idle at 0.25 m/s, active, still (remoteAvatars' walk threshold is 0.3 m/s) on the seat row.
t('old client fallback: a still Idle friend',()=>{
 assert.equal(body[5],Mode.Idle);assert.ok(body[4]*.25<.3,'below the walk-cycle threshold');
 assert.equal(presenceOf(body[5],body[6],body[7]),'active');assert.equal(P.activityOf(body[5],body[4]),0,'no busy activity');
 assert.match(read('lib/graphics/remoteAvatars.ts'),/moving=!shield&&!sat&&pose\.speed>\.3/,'the walk threshold the fallback relies on');
});

// 4. Interp: a seated friend sits exactly on the seat; walking in never slides or extrapolates past it.
t('no slide, no extrapolation while seated',()=>{
 const I=ip.createInterp({delayMs:100,extrapolateMs:250}),out={};
 const walk=(i)=>[body[0]+40-i*8,body[1],body[2],0,12,Mode.Walk,Zone.Main,0];// 3 m/s toward the seat at 10 Hz
 let tm=1000;for(let i=0;i<4;i++){I.push(1,walk(i),tm);tm+=100;}
 I.push(1,body.slice(),tm);
 // between the last walk pose and the seated one: held on the walk pose (no Hermite slide into the seat)
 I.sample(1,tm+100-50,out);assert.equal(out.seated,false);assert.ok(Math.abs(out.x-walk(3)[0]/10)<1e-9,'held, not sliding');
 // once the seated pose is due, and long after it (no new poses): exactly on the seat, no extrapolation
 for(const dt of [100,150,300,900]){I.sample(1,tm+dt,out);assert.equal(out.seated,true,'seated at +'+dt);assert.equal(out.speed,0);
  assert.ok(Math.abs(out.x-body[0]/10)<1e-9&&Math.abs(out.z-body[2]/10)<1e-9&&Math.abs(out.y-body[1]/10)<1e-9,'on the seat at +'+dt);}
 // standing up: held seated until the standing pose is due, then off
 const up=[body[0]+6,body[1],body[2],0,0,Mode.Idle,Zone.Main,0];I.push(1,up,tm+1000);
 I.sample(1,tm+1000+100-30,out);assert.equal(out.seated,true);assert.ok(Math.abs(out.x-body[0]/10)<1e-9);
 I.sample(1,tm+2000,out);assert.equal(out.seated,false,'standing once the stand-up pose is due (the member delay grows after a 1 s gap)');
});

// 5. Seat sharing: a seated friend snaps exactly onto a real seat and takes it; nearestSeat then offers another one.
t('seat snap and occupied seats',()=>{
 share.clearRemoteSeats();share.beginSeatFrame();
 const p={x:body[0]/10,y:body[1]/10,z:body[2]/10,yaw:0,seated:true};
 const s=share.seatFriend(3,p);assert.ok(s&&s.id===seat.id,'their seat');assert.equal(p.x,seat.x);assert.equal(p.z,seat.z);assert.equal(p.y,seat.y);assert.equal(p.yaw,seat.yaw);
 assert.ok(share.remoteSeatsTaken().has(seat.id));
 const mine=seats.nearestSeat(seat.x,seat.z,seat.y,share.remoteSeatsTaken());assert.ok(mine&&mine.id!==seat.id,'I am offered the next seat');
 assert.ok(Math.hypot(mine.x-seat.x,mine.z-seat.z)<1.3,'a neighbour seat');
 // a second friend claiming the same seat this frame is drawn standing (never two in one seat)
 const q={x:body[0]/10,y:body[1]/10,z:body[2]/10,yaw:0,seated:true};assert.equal(share.seatFriend(4,q),null);assert.equal(q.seated,false);
 // off any seat (an older client slowing to a stop on the grass): not seated
 const g={x:-150,y:0,z:0,yaw:0,seated:true};assert.equal(share.seatFriend(5,g),null);assert.equal(g.seated,false);
 // next frame without them: the seat is free again
 share.beginSeatFrame();assert.ok(!share.remoteSeatsTaken().has(seat.id));
 assert.equal(seats.nearestSeat(seat.x,seat.z,seat.y,share.remoteSeatsTaken()).id,seat.id);
 const r={x:1,y:2,z:3,yaw:0,seated:false};assert.equal(share.seatFriend(6,r),null);assert.deepEqual([r.x,r.y,r.z],[1,2,3],'standing friends untouched');
});

// 6. Wiring (source): the island bridge runs every friend through seatFriend; the Sit prompt skips taken seats; the remote rig wears
// the bench pose with a lower tag; rooms never do.
t('wiring',()=>{
 const tb=read('lib/multiplayer/townBridge.ts'),ra=read('lib/graphics/remoteAvatars.ts'),sit=read('lib/town/stadiumSit.ts'),town=read('components/Town.tsx');
 assert.match(tb,/beginSeatFrame\(\); core\.sample\(nowMs, seatFriend\)/);
 assert.match(sit,/nearestSeat\(x,z,height,remoteSeatsTaken\(\)\)/);
 assert.match(town,/partyPitch,stadiumSit\.seated\?stadiumSit\.seat:null\)/);
 assert.match(ra,/motion\.trick=sat\?SEAT_POSE:undefined/);assert.match(ra,/SEAT_POSE=npcSeatPose\('bench'\)/);
 assert.ok(!/seatFriend/.test(read('lib/multiplayer/roomParty.ts')),'rooms keep their own sample');
 const RA=load('lib/graphics/remoteAvatars.ts',{player:{},playerBatch:{},heatTier:{},celebrations:{},emotePose:{},customization:{},look:{}});
 assert.equal(RA.drawnSeated({seated:true},false),true);assert.equal(RA.drawnSeated({seated:true},true),false,'inside the force field they stand');
 assert.equal(RA.drawnSeated({},false),false);assert.ok(RA.SEATED_LABEL_DROP>.2&&RA.SEATED_LABEL_DROP<.8,'the tag sits a little lower');
});
console.log(`mp-stadium-sit: ${n} checks passed`);
