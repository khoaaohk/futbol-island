// The Island Line, Phase 3 (Nov 23 2026; plan .claude/worktrees/_recovery-nov20/train/PLAN.md §5 Riding, §6, §8, §9.3): riding,
// the map and multiplayer. Run: node tests/train-ride.cjs
//  1. the wire (multiplayer/protocol/seat.ts): a train seat code fits an Idle pose the relay accepts; a plain Idle never reads as one
//  2. presence: fillLocalBody sends the seat code and the last stop's seat; the interpolator marks riders still
//  3. platforms: every station's step-off spot is on its platform; the Board offer only with a train at the platform, doors open
//  4. the built trains: seat poses inside the car, on the floor, facing the aisle; the open variant; plates; the causeway barrier
//  5. wiring: Town (prompt, cluster, camera, fast travel off first, station travel), map (line, pins, dots only while open), quiz coins
const assert=require('node:assert/strict');
const {L,read}=require('./lib/tsLoad.cjs');
const P=L('multiplayer/protocol/index.ts'),pres=L('lib/multiplayer/presence.ts'),tt=L('lib/town/trainTrack.ts'),S=L('lib/town/trainSchedule.ts');
// 0. Polish (Nov 24 2026, AAA audit #8): the ride camera's clearance (lib/town/trainCamClear.ts, pure). The portrait ride spot on the
// platform side (9.1 m out, 3.5 m back, ~2.7 m over the rider's head) is inside each station house's roof volume; the spring arm stops
// short of it; nowhere else on the open line pulls in; the tube keeps the camera inside; a camera in a truss is lifted over its chord.
{const near=(a,b,e,m)=>assert(Math.abs(a-b)<=e,`${m}: ${a} vs ${b}`);const C=L('lib/town/trainCamClear.ts'),TL=L('lib/town/trainLayout.ts'),V=L('lib/town/venues.ts'),lay=TL.trainLayout().profile,G=V.fieldSurfaceHeight;
 for(const st of tt.TRAIN_STATIONS){const h=TL.stationSpot(st,0,1),c=TL.stationSpot(st,-3.5,9.1),hy=h.y+1.6,cy=h.y+4.3,f=C.camClearFraction(h.x,hy,h.z,c.x,cy,c.z,G);
  if(st.id!=='south')assert(C.camBlocked(c.x,cy,c.z,G),`${st.id}: the old portrait spot is in the roof`);
  assert(f<1&&f>=.15,`${st.id}: pulled in (${f})`);for(let i=0;i<=40;i++){const k=f*i/40;assert(!C.camBlocked(h.x+(c.x-h.x)*k,hy+(cy-hy)*k,h.z+(c.z-h.z)*k,G),`${st.id}: clear all the way to the camera`);}}
 let pulled=0;for(let s=0;s<tt.TRACK.length;s+=5){if(tt.inTunnelS(s-12)||tt.inTunnelS(s+12)||tt.TRAIN_STATIONS.some(st=>Math.abs(tt.wrapS(st.s-s+tt.TRACK.length/2)-tt.TRACK.length/2)<14))continue;
  const q=tt.trackAt(s),m=tt.leftNormal(q.tx,q.tz),bed=tt.bedAt(lay,s);for(const sg of [-1,1])if(C.camClearFraction(q.x,bed+2.5,q.z,q.x+m.x*9*sg,bed+5,q.z+m.z*9*sg,G)<1)pulled++;}
 assert.equal(pulled,0,'the open line keeps the full framing');
 const mid=(tt.TUNNEL.west.s+tt.TUNNEL.east.s)/2,t=tt.trackAt(mid),n=tt.leftNormal(t.tx,t.tz),f=C.camClearFraction(t.x,tt.TUNNEL_BED+2.5,t.z,t.x+n.x*9,tt.TUNNEL_BED+5,t.z+n.z*9);
 const x=t.x+n.x*9*f,z=t.z+n.z*9*f,y=tt.TUNNEL_BED+2.5+2.5*f;assert(Math.hypot(x-t.x,z-t.z)<tt.TUNNEL_HALF_WIDTH-.4&&y<tt.TUNNEL_BED+5.6,`tunnel: inside the tube (f ${f})`);
 const ms=(tt.SOUTH_BRIDGE.spanA+tt.SOUTH_BRIDGE.spanB)/2,b=tt.trackAt(ms),bn=tt.leftNormal(b.tx,b.tz),bb=tt.bedAt(lay,ms);
 near(C.trussLift(b.x+bn.x*C.TRUSS_OFFSET,bb+1.5,b.z+bn.z*C.TRUSS_OFFSET),C.TRUSS_H+.35-1.5,.01,'in the truss: lifted over the top chord');assert.equal(C.trussLift(b.x+bn.x*5,bb+1.5,b.z+bn.z*5),0,'clear of it: no lift');
 const W=read('lib/town/trainWorld.ts');assert(new RegExp(`TRUSS_OFFSET=${C.TRUSS_OFFSET},TRUSS_H=${C.TRUSS_H}\\b`).test(W)&&/const ew=4\.8,ed=hd\/2\+1\.25,rh=1\.9,ry=y0\+H\+\.14/.test(W)&&/H=2\.9,y0=top/.test(W),'clearance volumes match trainWorld.ts (roof, truss)');
 const R=read('lib/town/trainRide.ts');assert(/camClearFraction\(hx,hy,hz,camPos\.x,camPos\.y,camPos\.z,ports\.ground\)/.test(R)&&/f<arm\?14:2\.5/.test(R),'ride camera: spring arm, in fast, out slow');
 assert(/ground:fieldSurfaceHeight\}\)/.test(read('components/Town.tsx')),'Town passes the ground');
 // beside a house the camera first comes down under the eaves (a person on the platform at the window): pulled in less, never far off
 for(const st of tt.TRAIN_STATIONS){const h=TL.stationSpot(st,0,1.1),c=TL.stationSpot(st,-3.5,10.2),hy=h.y+1.8;let cy=hy+2.35;const k=C.camCeiling(c.x,c.z);
  assert(k.w>.99,`${st.id}: under the eaves`);cy+=(Math.min(cy,k.y)-cy)*k.w;const f=C.camClearFraction(h.x,hy,h.z,c.x,cy,c.z,G);assert(f>=(st.id==='south'?.2:.35),`${st.id}: framed from the platform (${f})`);}
 for(let s=0;s<tt.TRACK.length;s+=7){if(tt.TRAIN_STATIONS.some(st=>Math.abs(tt.wrapS(st.s-s+tt.TRACK.length/2)-tt.TRACK.length/2)<20))continue;const q=tt.trackAt(s),m=tt.leftNormal(q.tx,q.tz);
  for(const sg of [-1,1])assert.equal(C.camCeiling(q.x+m.x*9*sg,q.z+m.z*9*sg).w,0,`no eaves cap away from the stations (s ${s})`);}}
// 1. wire
for(let k=0;k<3;k++)for(let j=0;j<8;j++){const q=P.trainSeatCode(k,j);assert(q>=2&&q<=25,`code ${q}`);assert(q/4<8,'under the interpolator fast-mover speed (8 m/s); the relay checks distance, not this byte');assert.equal(P.trainWire(P.Mode.Idle,q),k*8+j);}
assert.equal(P.trainWire(P.Mode.Idle,0),-1);assert.equal(P.trainWire(P.Mode.Idle,1),-1,'the stadium seat marker is not a train');assert.equal(P.trainWire(P.Mode.Walk,10),-1,'walking at 2.5 m/s is not riding');
// 2. presence
{const st=pres.localPoseState(),body=[0,0,0,0,0,0,0,0];
 pres.fillLocalBody(st,{x:170,y:1,z:-200,facing:0,speed:0,mode:P.Mode.Idle,zone:P.Zone.Main,warp:false,hidden:false,train:{train:2,seat:5,x:168.5,y:1.9,z:-204.2,yaw:1}},body);
 assert.equal(body[5],P.Mode.Idle);assert.equal(body[4],P.trainSeatCode(2,5));assert.equal(body[0],1685);assert.equal(body[2],-2042);
 pres.fillLocalBody(st,{x:170,y:1,z:-200,facing:0,speed:.1,mode:P.Mode.Idle,zone:P.Zone.Main,warp:false,hidden:false},body);assert.equal(P.trainWire(body[5],body[4]),-1,'off the train: a plain pose');
 const I=L('lib/multiplayer/interp.ts'),ip=I.createInterp?I.createInterp():null;
 if(ip){ip.push(7,[1685,19,-2042,0,P.trainSeatCode(1,3),P.Mode.Idle,P.Zone.Main,0],1000);const out={x:0,y:0,z:0,yaw:0,speed:9,mode:0,zone:0,fade:0};ip.sample(7,1400,out);assert.equal(out.train,11,'the rider code reaches the island runtime');assert.equal(out.speed,0,'a rider is drawn still (no walk)');}}
// 3. platforms
const R=L('lib/town/trainRide.ts');
for(let i=0;i<tt.TRAIN_STATIONS.length;i++){const st=tt.TRAIN_STATIONS[i];for(const du of [-12,0,12]){const sp=R.platformSpot(i,st.s+du,{x:0,y:0,z:0,yaw:0});assert.equal(R.platformAt(sp.x,sp.z,sp.y),i,`${st.id} step-off spot (${du}) is on its platform`);}
 const c=tt.trackAt(st.s);assert.equal(R.platformAt(c.x,c.z,0),-1,`${st.id}: the track itself is not the platform`);}
for(const st of tt.TRAIN_STATIONS)assert(R.STOP_FACTS[st.id]&&R.nextStopLine(S.stopOf(st.id)).startsWith(`Next stop: ${st.name}. Did you know?`),`${st.id} announcement`);
{// a fake run: train 1 at the North stop with its doors open
 const north=S.stopOf('north'),states=[0,1,2].map(i=>({s:0,at:-1,doors:0,dwellLeft:0,next:0}));const run={states,ridden:new Uint8Array(3),seatPose:(k,j,o)=>{const sp=R.platformSpot(0,tt.TRAIN_STATIONS[0].s+j,{x:0,y:0,z:0,yaw:0});o.x=sp.x;o.y=sp.y+1;o.z=sp.z;o.yaw=0;return o;}};
 // Nov 25 2026 (owner): Board from the scooter, bike and moped as well as on foot, never from the jetpack; boarding from a vehicle
 // switches to walking (the dismount port) in the same press; Get off leaves you on foot.
 for(const m of ['walk','scooter','bike','moped'])assert(R.canBoardFrom(m),`Board offered from ${m}`);assert(!R.canBoardFrom('jetpack'),'no Board from the jetpack');
 {const T=read('components/Town.tsx');assert(/trainRide\.want\([^;]*canBoardFrom\(rideRef\.current\)/.test(T),'Town gates Board with canBoardFrom');assert(/dismount:\(\)=>\{if\(rideRef\.current!=='walk'\)selectRide\('walk'\);\}/.test(T),'Town: the dismount is the travel-mode switch to walk');}
 let mode='moped',dismounts=0;
 let placed=null,seated=0,paid=[];const ride=R.createTrainRide({run:()=>run,dismount:()=>{dismounts++;mode='walk';},place:(x,z,y)=>{placed={x,z,y};},seat:()=>{seated++;},taken:()=>false,cue:()=>{},loadQuiz:async()=>[{id:'q:1',q:'How long is a half?',options:['45 min','20 min'],correct:0,explain:'Two halves of 45.'}],pay:id=>paid.push(id)});
 const sp=R.platformSpot(0,tt.TRAIN_STATIONS[0].s,{x:0,y:0,z:0,yaw:0});
 assert.equal(ride.want(sp.x,sp.z,sp.y,R.canBoardFrom('jetpack')),null,'jetpack: no Board');
 assert.equal(ride.want(sp.x,sp.z,sp.y,true),null,'no train: no Board');
 Object.assign(states[1],{at:north,doors:1,dwellLeft:8});const w=ride.want(sp.x,sp.z,sp.y,true);assert(w&&w.key===R.TRAIN_BOARD_KEY,'a train at the platform, doors open: Board');
 assert.equal(ride.want(sp.x,sp.z,sp.y,false),null,'not on foot / busy: no Board');ride.want(sp.x,sp.z,sp.y,true);
 ride.want(sp.x,sp.z,sp.y,R.canBoardFrom(mode));
 assert(ride.board()&&ride.active&&ride.train===1,'boarded train 1 (from the moped, one press)');assert(dismounts===1&&mode==='walk','the moped was stowed (on foot) as the ride began');assert.equal(R.trainRideStore.get().riding,true);
 ride.frame(1/30,false);assert(seated>0,'the seat drives the player');assert.equal(run.ridden[1],1,'the ridden train draws its open variant');assert(ride.wire()&&ride.wire().train===1,'presence: the train seat');
 assert(ride.trick(),'the bench pose');assert(ride.holdPlayer(.4),'input locked while riding');
 Object.assign(states[1],{at:-1,doors:0,dwellLeft:0,next:0});ride.frame(1/30,false);assert(/^Next stop: West Beach\. Did you know\?/.test(R.trainRideStore.get().note),'leaving: the next-stop announcement');
 assert.equal(ride.getOff(false),false,'no getting off between stops');assert.equal(R.trainRideStore.get().canGetOff,false);
 (async()=>{await new Promise(r=>setTimeout(r,5));for(let k=0;k<7*30;k++)ride.frame(1/30,false);const q=R.trainRideStore.get().quiz;assert(q&&q.id==='q:1','one quiz question on the run');
  ride.answer(1);assert.equal(paid.length,0,'a wrong answer pays nothing');assert.equal(R.trainRideStore.get().quiz.picked,1);
  Object.assign(states[1],{at:S.stopOf('west'),doors:1,dwellLeft:10});ride.frame(1/30,false);assert.equal(R.trainRideStore.get().quiz,null,'the quiz closes at the stop');assert(R.trainRideStore.get().canGetOff,'Get off at the stop');
  assert(ride.getOff(false)&&!ride.active&&placed&&R.platformAt(placed.x,placed.z,placed.y)===tt.TRAIN_STATIONS.findIndex(s=>s.id==='west'),'got off onto the West Beach platform');
  assert(mode==='walk'&&dismounts===1,'Get off: still on foot (the vehicle is not restored)');
  ride.want(sp.x,sp.z,sp.y,true);states[1].at=-1;ride.dispose();
 })().catch(e=>{console.error(e);process.exit(1);});}
// 5. wiring
{const town=read('components/Town.tsx'),ov=read('components/IslandOverview.tsx'),mm=read('components/TrainMapMarks.tsx'),br=read('lib/multiplayer/townBridge.ts'),run=read('lib/town/trainRunning.ts');
 assert(/trainRide\.finish\(\);\/\* fast travel while riding: off the train first/.test(town),'fast travel gets off first');
 assert(/destination\.startsWith\('station-'\)/.test(town)&&/station-\$\{TrainStation\['id'\]\}/.test(ov),'station-* map destinations');
 assert(/<TrainMapDots live=\{friends\}\/>/.test(ov)&&/if\(!live\)return;/.test(mm)&&/setInterval\(tick,500\)/.test(mm),'train dots only while the travel map is open (2 Hz)');
 assert(/trainSeat\?\.\(id, code, p\)/.test(br),'riders posed from the shared clock (no new messages)');
 assert(/trainRide\.applyCamera\(camera/.test(town)&&/trainRide\.trick\(\)\?\?stadiumSit\.trick\(\)/.test(town),'ride camera + the bench pose');
 assert(/causewayBarrier\.closed=world\.trainRun\.crossingClosed/.test(town),'causeway traffic stops at the barrier');
 assert(!/new T\.(PointLight|SpotLight|DirectionalLight)/.test(run+read('lib/town/trainRide.ts')),'no new lights');
 {const tr=read('lib/town/trainRide.ts');assert(/if\(quizIn>=0&&dt>0\)\{quizIn-=Math\.max\(dt,wd\)/.test(tr)&&/const wallS=\(\)=>/.test(tr),'Nov 24: the quiz delay runs on the wall clock (a capped frame dt at 2-4 fps let the train reach the stop first), paused frames hold it');}
 assert(/train:2\b/.test(read('lib/economy.ts'))&&/earnForTrainQuiz/.test(town),'quiz coins (learning, once per question)');}
// 4. the built trains (the real world in Node, no WebGL)
(async()=>{const {loadIslandWorld}=require('../scripts/island-world-load.cjs');const {T,L:LW}=await loadIslandWorld(require('node:path').join(__dirname,'..'));
 const scene=new T.Scene(),w=LW('lib/town/world.ts').buildTown(scene),run=w.trainRun,TRN=LW('lib/town/trainRunning.ts');assert(run,'trains built');
 const cam=new T.PerspectiveCamera(50,1,1,500),player={x:0,y:0,z:0};
 const north=tt.TRAIN_STATIONS[0],p=tt.trackAt(north.s);cam.position.set(p.x+30,20,p.z+40);cam.lookAt(p.x,0,p.z);cam.updateMatrixWorld(true);player.x=p.x+20;player.z=p.z+20;
 const now=S.TRAIN_STOPS[S.stopOf('north')].arrive+5;// train 0 standing at North
 run.update({dt:1/30,camera:cam,player,nowSec:now});const st=run.states[0];assert.equal(st.at,S.stopOf('north'),'train 0 at North');
 const sp={x:0,y:0,z:0,yaw:0},bed=run.states&&w.train?0:0;void bed;
 for(let j=0;j<TRN.TRAIN_SEATS;j++){run.seatPose(0,j,sp);const h=tt.trackNearest(sp.x,sp.z,4);assert(h&&h.d<1.2,`seat ${j} inside the car (${h&&h.d.toFixed(2)} m off the centre line)`);
  const fx=Math.sin(sp.yaw),fz=Math.cos(sp.yaw),cx=tt.trackAt(h.s);const toward=(cx.x-sp.x)*fx+(cx.z-sp.z)*fz;assert(toward>0,`seat ${j} faces the aisle`);
  const sp2={x:0,y:0,z:0,yaw:0};run.seatPose(0,j,sp2,now);assert(Math.hypot(sp2.x-sp.x,sp2.z-sp.z)<.6,`seat ${j}: the clock pose matches the drawn one`);}
 const geo=TRN.buildCarGeometry(TRN.LIVERIES[0],true);assert(geo.triangles>run.triangles&&geo.triangles<run.triangles+400,`open variant ${geo.triangles} tris (closed ${run.triangles})`);
 run.ridden[0]=1;run.update({dt:1/30,camera:cam,player,nowSec:now+.05});const d=run.drawn;assert(d.plates,'destination plates drawn near');assert.equal(d.ridden,1);
 let n=0;scene.traverse(o=>{if(o.name==='train-plates'){n++;assert.equal(o.material,scene.getObjectByName('train-board-north').material,'plates use the board material (no new program)');}});assert.equal(n,1,'one plate mesh for every cab');
 const ci=tt.TRAIN_CROSSINGS.findIndex(c=>c.id==='causeway');assert(ci>=0&&typeof run.crossingClosed(ci)==='boolean');
 console.log('train-ride: ok');
})().catch(e=>{console.error(e);process.exit(1);});
