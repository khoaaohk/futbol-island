// The Island Line, Phase 3 (Nov 23 2026; plan .claude/worktrees/_recovery-nov20/train/PLAN.md §5 Riding, §6, §8, §9.3): riding,
// the map and multiplayer. Run: node tests/train-ride.cjs
//  1. the wire (multiplayer/protocol/seat.ts): a train seat code fits an Idle pose the relay accepts; a plain Idle never reads as one
//  2. presence: fillLocalBody sends the seat code and the last stop's seat; the interpolator marks riders still
//  3. platforms: every station's step-off spot is on its platform; the Board offer only with a train at the platform, doors open
//  4. the built trains: seat poses inside the car, on the floor, facing the aisle; the open variant; plates; the causeway barrier
//  5. wiring: Town (prompt, cluster, camera, fast travel off first, station travel), map (line, pins, dots only while open), no ride quiz
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
 const R=read('lib/town/trainRide.ts');assert(/camClearFraction\(hx,hy,hz,camPos\.x,camPos\.y,camPos\.z,ports\.ground(,true)?\)/.test(R)&&/f<arm\?14:2\.5/.test(R),'ride camera: spring arm, in fast, out slow');
 assert(/ground:fieldSurfaceHeight\}\)/.test(read('components/Town.tsx')),'Town passes the ground');
 // beside a house the camera first comes down under the eaves (a person on the platform at the window): pulled in less, never far off
 for(const st of tt.TRAIN_STATIONS){const h=TL.stationSpot(st,0,1.1),c=TL.stationSpot(st,-3.5,10.2),hy=h.y+1.8;let cy=hy+2.35;const k=C.camCeiling(c.x,c.z);
  assert(k.w>.99,`${st.id}: under the eaves`);cy+=(Math.min(cy,k.y)-cy)*k.w;const f=C.camClearFraction(h.x,hy,h.z,c.x,cy,c.z,G);assert(f>=(st.id==='south'?.2:.35),`${st.id}: framed from the platform (${f})`);}
 for(let s=0;s<tt.TRACK.length;s+=7){if(tt.TRAIN_STATIONS.some(st=>Math.abs(tt.wrapS(st.s-s+tt.TRACK.length/2)-tt.TRACK.length/2)<20))continue;const q=tt.trackAt(s),m=tt.leftNormal(q.tx,q.tz);
  for(const sg of [-1,1])assert.equal(C.camCeiling(q.x+m.x*9*sg,q.z+m.z*9*sg).w,0,`no eaves cap away from the stations (s ${s})`);}}
// 1. wire (Nov 24 2026: all 28 seats a train + standing riders; old clients see an Idle pose under 8 m/s at the last platform)
{const seen=new Set(),b={q:0,yaw:0};
 for(let k=0;k<3;k++)for(let j=0;j<28;j++){const c=P.riderSeatCode(k,j);P.riderBytes(c,b);assert(b.q>=2&&b.q<=31&&b.yaw>=0&&b.yaw<=255,`seat bytes ${b.q},${b.yaw}`);assert(b.q/4<8,'under the interpolator fast-mover speed (8 m/s)');
  const w=P.trainWire(P.Mode.Idle,b.q,b.yaw);assert.equal(w,c,'seat round trip');assert.equal(P.riderTrain(w),k);assert.equal(P.riderSeat(w),j);assert(!seen.has(b.q*256+b.yaw));seen.add(b.q*256+b.yaw);}
 const o={u:0,x:0,yaw:0};
 for(let k=0;k<3;k++)for(let u=-16.8;u<=4.4;u+=.37)for(const x of [-.98,-.4,0,.35,.98])for(const yaw of [0,Math.PI/2,Math.PI,-Math.PI/2]){const c=P.riderStandCode(k,u,x,yaw);P.riderBytes(c,b);assert(b.q>=5&&b.q<=31,`stand speed byte ${b.q}`);
  const w=P.trainWire(P.Mode.Idle,b.q,b.yaw);assert.equal(w,c,'stand round trip');assert.equal(P.riderTrain(w),k);assert.equal(P.riderSeat(w),-1);assert(P.riderStand(w,o));
  assert(Math.abs(o.u-u)<=.1+1e-9&&Math.abs(o.x-x)<=.2+1e-9,`spot ${u},${x} -> ${o.u},${o.x}`);assert(Math.abs(Math.atan2(Math.sin(o.yaw-yaw),Math.cos(o.yaw-yaw)))<1e-6,'facing');
  const key=b.q*256+b.yaw;assert(!seen.has(key)||true);}
 assert.equal(P.trainWire(P.Mode.Idle,0,0),-1);assert.equal(P.trainWire(P.Mode.Idle,1,5),-1,'the stadium seat marker is not a train');assert.equal(P.trainWire(P.Mode.Walk,10,3),-1,'walking at 2.5 m/s is not riding');
 assert.equal(P.trainWire(P.Mode.Idle,2,28),-1,'a seated byte past seat 27 is nothing');assert.equal(P.trainWire(P.Mode.Idle,32,0),-1,'past the last standing code');
 // the roof lane (Nov 24 2026): the 144 spare standing states; it round-trips, never collides with the aisle, and an OLD client's
 // trainWire (aisle states < 2160 only) rejects it: they draw a plain Idle pose (a walker moving with the train)
 const ro={u:0,yaw:0},roofKeys=new Set();assert.equal(P.TRAIN_ROOF_ST0+P.TRAIN_ROOF_UN*4,P.TRAIN_STAND_CODES*256,'the roof lane fills the spare states exactly');
 for(let k=0;k<3;k++)for(let u=-18.2;u<=P.TRAIN_ROOF_U0+(P.TRAIN_ROOF_UN-1)*P.TRAIN_ROOF_DU+1e-9;u+=.29)for(const yaw of [0,Math.PI/2,Math.PI,-Math.PI/2,.3]){const c=P.riderRoofCode(k,u,yaw);P.riderBytes(c,b);assert(b.q>=5&&b.q<=31&&b.q/4<8,`roof speed byte ${b.q}`);
  const w=P.trainWire(P.Mode.Idle,b.q,b.yaw);assert.equal(w,c,'roof round trip');assert.equal(P.riderTrain(w),k);assert.equal(P.riderSeat(w),-1);assert(!P.riderStand(w,o),'a roof code is not an aisle spot');
  assert(P.riderRoof(w,ro)&&Math.abs(ro.u-u)<=P.TRAIN_ROOF_DU/2+1e-9,`roof spot ${u} -> ${ro.u}`);const want=Math.round(yaw/(Math.PI/2))*Math.PI/2;assert(Math.abs(Math.atan2(Math.sin(ro.yaw-want),Math.cos(ro.yaw-want)))<1e-6,'roof facing');
  const st=((b.q-5)%9)*256+b.yaw;assert(st>=2160&&st<2304,'an old client (aisle states only) reads a plain pose');roofKeys.add(b.q*256+b.yaw);}
 assert.equal(roofKeys.size,3*144,'every roof state used, none shared');
 for(let k=0;k<3;k++)for(let st=0;st<2160;st+=13){const c=k*P.TRAIN_RIDER_SPAN+28+st;assert(!P.riderRoof(c,ro),'an aisle code is not on the roof');}
 // old relay / old clients: the pose stays a valid v1 Idle pose (clampPose) with a speed under the fast-mover brake
 for(const c of [P.riderSeatCode(2,27),P.riderStandCode(2,4.4,.98,3),P.riderRoofCode(2,5.8,3)]){P.riderBytes(c,b);assert(P.clampPose([1685,19,-2042,b.yaw,b.q,P.Mode.Idle,P.Zone.Main,0]),'the relay accepts it');}}
// 2. presence
{const st=pres.localPoseState(),body=[0,0,0,0,0,0,0,0],b={q:0,yaw:0};
 pres.fillLocalBody(st,{x:170,y:1,z:-200,facing:0,speed:0,mode:P.Mode.Idle,zone:P.Zone.Main,warp:false,hidden:false,train:{train:2,seat:12,x:168.5,y:1.9,z:-204.2,yaw:1}},body);
 assert.equal(body[5],P.Mode.Idle);assert.equal(P.trainWire(body[5],body[4],body[3]),P.riderSeatCode(2,12),'a high seat (12) goes out');assert.equal(body[0],1685);assert.equal(body[2],-2042);
 pres.fillLocalBody(st,{x:170,y:1,z:-200,facing:0,speed:0,mode:P.Mode.Idle,zone:P.Zone.Main,warp:false,hidden:false,train:{train:1,seat:3,x:168.5,y:1.9,z:-204.2,yaw:1,standing:true,u:-3.1,sx:.4,face:Math.PI}},body);
 const w=P.trainWire(body[5],body[4],body[3]),o={u:0,x:0,yaw:0};assert(P.riderStand(w,o)&&P.riderTrain(w)===1&&Math.abs(o.u+3.1)<.11&&Math.abs(o.x-.4)<.01,'standing goes out');
 pres.fillLocalBody(st,{x:170,y:1,z:-200,facing:0,speed:0,mode:P.Mode.Idle,zone:P.Zone.Main,warp:false,hidden:false,train:{train:2,seat:0,x:171.2,y:6.1,z:-199.4,yaw:.5,standing:false,u:-9.4,sx:0,face:Math.PI/2,roof:true}},body);
 {const w=P.trainWire(body[5],body[4],body[3]),r={u:0,yaw:0};assert(P.riderRoof(w,r)&&P.riderTrain(w)===2&&Math.abs(r.u+9.4)<=.35&&Math.abs(r.yaw-Math.PI/2)<1e-6,'a roof rider goes out');
  assert.equal(body[0],1712,'sent where I really am (on the moving roof)');assert.equal(body[1],61);assert.equal(body[2],-1994);assert(P.clampPose(body.slice()),'the relay accepts it');}
 pres.fillLocalBody(st,{x:170,y:1,z:-200,facing:0,speed:.1,mode:P.Mode.Idle,zone:P.Zone.Main,warp:false,hidden:false},body);assert.equal(P.trainWire(body[5],body[4],body[3]),-1,'off the train: a plain pose');
 const I=L('lib/multiplayer/interp.ts'),ip=I.createInterp?I.createInterp():null;
 if(ip){P.riderBytes(P.riderSeatCode(1,12),b);ip.push(7,[1685,19,-2042,b.yaw,b.q,P.Mode.Idle,P.Zone.Main,0],1000);const out={x:0,y:0,z:0,yaw:0,speed:9,mode:0,zone:0,fade:0};ip.sample(7,1400,out);assert.equal(out.train,P.riderSeatCode(1,12),'the rider code reaches the island runtime');assert.equal(out.speed,0,'a rider is drawn still by the interpolator');
  const sc=P.riderStandCode(0,-8,0,0),sc2=P.riderStandCode(0,-6,0,0);P.riderBytes(sc,b);ip.push(8,[1685,19,-2042,b.yaw,b.q,P.Mode.Idle,P.Zone.Main,0],1000);P.riderBytes(sc2,b);ip.push(8,[1685,19,-2042,b.yaw,b.q,P.Mode.Idle,P.Zone.Main,0],1100);
  for(const t of [1300,1500,1700]){ip.sample(8,t,out);assert(out.train===sc||out.train===sc2,'the standing code is read raw, never a blend of two yaw bytes');}}}
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
 let placed=null,seated=0;const ride=R.createTrainRide({run:()=>run,dismount:()=>{dismounts++;mode='walk';},place:(x,z,y)=>{placed={x,z,y};},seat:()=>{seated++;},taken:()=>false,cue:()=>{}});
 const sp=R.platformSpot(0,tt.TRAIN_STATIONS[0].s,{x:0,y:0,z:0,yaw:0});
 assert.equal(ride.want(sp.x,sp.z,sp.y,R.canBoardFrom('jetpack')),null,'jetpack: no Board');
 assert.equal(ride.want(sp.x,sp.z,sp.y,true),null,'no train: no Board');
 Object.assign(states[1],{at:north,doors:1,dwellLeft:8});const w=ride.want(sp.x,sp.z,sp.y,true);assert(w&&w.key===R.TRAIN_BOARD_KEY,'a train at the platform, doors open: Board');
 assert.equal(ride.want(sp.x,sp.z,sp.y,false),null,'not on foot / busy: no Board');ride.want(sp.x,sp.z,sp.y,true);
 ride.want(sp.x,sp.z,sp.y,R.canBoardFrom(mode));
 assert(ride.board()&&ride.active&&ride.train===1,'boarded train 1 (from the moped, one press)');assert(dismounts===1&&mode==='walk','the moped was stowed (on foot) as the ride began');assert.equal(R.trainRideStore.get().riding,true);
 ride.frame(1/30,false);assert(ride.walking>=0,'Board walks you to the door first');for(let i=0;i<40&&ride.walking>=0;i++)ride.frame(1/30,false);assert.equal(ride.walking,-1,'the walk takes under 1 s');assert(seated>0,'the seat drives the player');assert.equal(run.ridden[1],1,'the ridden train draws its open variant');assert(ride.wire()&&ride.wire().train===1,'presence: the train seat');
 assert(ride.trick(),'the bench pose');assert(ride.holdPlayer(.4),'input locked while riding');
 Object.assign(states[1],{at:-1,doors:0,dwellLeft:0,next:0});ride.frame(1/30,false);assert(/^Next stop: West Beach\. Did you know\?/.test(R.trainRideStore.get().note),'leaving: the next-stop announcement');
 assert.equal(ride.getOff(false),false,'no getting off between stops');assert.equal(R.trainRideStore.get().canGetOff,false);
 (async()=>{await new Promise(r=>setTimeout(r,5));for(let k=0;k<7*30;k++)ride.frame(1/30,false);assert(!('TRAIN_QUIZ' in R)&&!('quiz' in R.trainRideStore.get())&&!('answer' in R.trainRideActions),'owner Nov 25: the ride quiz is deleted (no card, no state)');
  Object.assign(states[1],{at:S.stopOf('west'),doors:1,dwellLeft:10});ride.frame(1/30,false);assert(R.trainRideStore.get().canGetOff,'Get off at the stop');
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
 {const tr=read('lib/town/trainRide.ts'),hud=read('components/TrainRideHud.tsx');assert(!/quizBank|loadQuiz|quizIn|askQuiz/.test(tr)&&!/loadQuiz|earnForTrainQuiz|trainRideActions\.answer/.test(town)&&!/data-train-quiz/.test(hud),'no quiz library loaded for the train, no quiz card');}
 assert(!/train:2\b/.test(read('lib/economy.ts'))&&!/earnForTrainQuiz/.test(town+read('lib/town/cardRewardTriggers.ts')),'no quiz coins');}
// 4. the built trains (the real world in Node, no WebGL)
(async()=>{const {loadIslandWorld}=require('../scripts/island-world-load.cjs');const {T,L:LW}=await loadIslandWorld(require('node:path').join(__dirname,'..'));
 const scene=new T.Scene(),w=LW('lib/town/world.ts').buildTown(scene),run=w.trainRun,TRN=LW('lib/town/trainRunning.ts');assert(run,'trains built');
 const cam=new T.PerspectiveCamera(50,1,1,500),player={x:0,y:0,z:0};
 const north=tt.TRAIN_STATIONS[0],p=tt.trackAt(north.s);cam.position.set(p.x+30,20,p.z+40);cam.lookAt(p.x,0,p.z);cam.updateMatrixWorld(true);player.x=p.x+20;player.z=p.z+20;
 const now=S.TRAIN_STOPS[S.stopOf('north')].arrive+5;// train 0 standing at North
 run.update({dt:1/30,camera:cam,player,nowSec:now});const st=run.states[0];assert.equal(st.at,S.stopOf('north'),'train 0 at North');
 const sp={x:0,y:0,z:0,yaw:0},bed=run.states&&w.train?0:0;void bed;
 for(let j=0;j<TRN.TRAIN_SEATS;j++){run.seatPose(0,j,sp);const h=tt.trackNearest(sp.x,sp.z,4);assert(h&&h.d<1.2,`seat ${j} inside the car (${h&&h.d.toFixed(2)} m off the centre line)`);
  const fx=Math.sin(sp.yaw),fz=Math.cos(sp.yaw),cx=tt.trackAt(h.s);const toward=(cx.x-sp.x)*fx+(cx.z-sp.z)*fz;assert(toward<0,`seat ${j} faces out of its window (Gameplay 2)`);
  const sp2={x:0,y:0,z:0,yaw:0};run.seatPose(0,j,sp2,now);assert(Math.hypot(sp2.x-sp.x,sp2.z-sp.z)<.6,`seat ${j}: the clock pose matches the drawn one`);}
 // Gameplay 2: ONE seat table, ≥ 8 seats a car (4 a side on the wall benches), players on 8 of them (the wire's 8), the rest for NPCs;
 // every seat lies on a bench run, each side's seats are ≥ .7 m apart, and the lean points the way the train runs.
 {const CM=LW('lib/town/trainCarModel.ts');assert(TRN.SEATS_PER_CAR===CM.SEAT_SLOTS_Z.length*2&&TRN.SEATS_PER_CAR>=8&&TRN.SEAT_TABLE.length===TRN.SEATS_PER_CAR*S.TRAIN_CARS,'≥ 8 seats a car');
  assert.equal(TRN.TRAIN_SEATS,28,'all 28 seats a train for players (the wire, multiplayer/protocol/seat.ts)');assert.equal(TRN.TRAIN_SEATS,P.TRAIN_WIRE_SEATS);assert.equal(TRN.NPC_SEATS.length,20,'NPCs keep off the 8 by the middle doors');
  for(let c=0;c<S.TRAIN_CARS;c++)for(const side of [-1,1]){const zs=TRN.SEAT_TABLE.filter(q=>q.car===c&&q.side===side).map(q=>q.z).sort((a,b)=>a-b);assert.equal(zs.length,CM.SEAT_SLOTS_Z.length,'every bench slot');
   for(let i=1;i<zs.length;i++)assert(zs[i]-zs[i-1]>=.65,`car ${c} side ${side}: seats ${(zs[i]-zs[i-1]).toFixed(2)} m apart`);
   for(const z of zs)assert(CM.BENCHES.some(([a,b])=>z>a+.3&&z<b-.3),'on a bench');}
  for(const q of TRN.SEAT_TABLE){assert(Math.abs(q.x)<CM.BENCH_BACK&&Math.abs(q.x)>CM.BENCH_FRONT,'root under the seat');assert.equal(q.lean,-q.side*(q.car%2?-1:1),'lean: the way the train runs');}
  // the pose: head and shoulders in the window band, knees on the seat inside the wall, feet on the board
  const K=LW('lib/graphics/trainSeatPose.ts').KNEEL,top=CM.WIN_Y1-CM.CAR_FLOOR_Y,sill=CM.WIN_Y0-CM.CAR_FLOOR_Y;
  assert(K.pelvisY+(1.89-.88)*Math.cos(K.pitch)<top+.02,'head top under the window top');assert(K.pelvisY+.5>sill,'shoulders over the sill');
  assert(TRN.RIDER_ROOT_X+K.ankleZ>CM.BENCH_FRONT-.1,'feet on the seat front');assert(TRN.RIDER_ROOT_X+.42<CM.BENCH_BACK,'knees short of the backrest');
  const R4=read('lib/town/trainRide.ts'),RA=read('lib/graphics/remoteAvatars.ts');assert(/tricks\[\(pose\.lean\?\?1\)>0\?1:0\]/.test(R4),'local rider: the window pose by lean');
  assert(/\(pose\.train\?\?-1\)>=0\?TRAIN_POSES\[\(pose\.lean\?\?1\)>0\?1:0\]:SEAT_POSE/.test(RA)&&/q\.lean=pose\.lean/.test(RA),'friends riding: the same pose');}
 const geo=TRN.buildCarGeometry(TRN.LIVERIES[0],true);assert(geo.triangles>run.triangles&&geo.triangles<run.triangles+2000/* Looks 2: +~700 for the round flanged wheels (16 sides) */,`close-up variant ${geo.triangles} tris (closed ${run.triangles})`);
 run.ridden[0]=1;run.update({dt:1/30,camera:cam,player,nowSec:now+.05});const d=run.drawn;assert(d.plates,'destination plates drawn near');assert.equal(d.ridden,1);
 let n=0;scene.traverse(o=>{if(o.name==='train-plates'){n++;assert.equal(o.material,scene.getObjectByName('train-board-north').material,'plates use the board material (no new program)');}});assert.equal(n,1,'one plate mesh for every cab');
 const ci=tt.TRAIN_CROSSINGS.findIndex(c=>c.id==='causeway');assert(ci>=0&&typeof run.crossingClosed(ci)==='boolean');
 // Gameplay 2 (owner, Nov 24 2026): solid trains (one oriented box per car: block and slide, never inside) and Conductor Kenji.
 {const m=new T.Matrix4();run.carMatrixOf(0,0,m);const e=m.elements,c={x:e[12],y:e[13],z:e[14]},bx={x:e[0],z:e[2]},bz={x:e[8],z:e[10]};
  // inside car 0, 0.5 m off its centre line: pushed out sideways to HALF_W + PLAYER_R in one frame
  const inside={x:c.x+bx.x*.5+bz.x*1.5,y:c.y,z:c.z+bx.z*.5+bz.z*1.5};/* POLISH 4: between two doors (an open doorway at a stop now lets you walk in) */const r=run.update({dt:1/30,camera:cam,player:inside,nowSec:now+.1});
  const ox=inside.x+r.nudgeX-c.x,oz=inside.z+r.nudgeZ-c.z,lat=ox*bx.x+oz*bx.z;assert(Math.abs(Math.abs(lat)-(1.4+TRN.PLAYER_R))<.02,`pushed out of the car to its side (${lat.toFixed(2)})`);
  // walking into the side: pushed straight back out (no pass-through), the along-car motion kept (slide)
  const side={x:c.x+bx.x*1.6+bz.x*2,y:c.y,z:c.z+bx.z*1.6+bz.z*2};const r2=run.update({dt:1/30,camera:cam,player:side,nowSec:now+.15});
  const along=r2.nudgeX*bz.x+r2.nudgeZ*bz.z,out=r2.nudgeX*bx.x+r2.nudgeZ*bx.z;assert(Math.abs(along)<1e-6&&out>0,'side contact: pushed out across only (slide along)');
  const rider=run.update({dt:1/30,camera:cam,player:inside,nowSec:now+.2,riding:0});assert(!rider.nudgeX&&!rider.nudgeZ,'riders are not pushed');
  const far={x:c.x+50,y:c.y,z:c.z+50};const r3=run.update({dt:1/30,camera:cam,player:far,nowSec:now+.25});assert(!r3.nudgeX&&!r3.nudgeZ,'clear of the cars: untouched');}
 {const K=L('lib/town/trainConductor.ts');assert(K.KENJI_WARN.includes('Train coming! Hop off the track!')&&K.KENJI_WARN.includes('Beep beep! Coming through!'),'the owner warning lines');
  assert.notEqual(K.kenjiWarn(0),K.kenjiWarn(1),'lines rotate');assert(/^Conductor Kenji: /.test(K.kenjiWarn(5)));
  const Rn=read('lib/town/trainRunning.ts');assert(/clock-kenjiQuiet>WARN_COOLDOWN/.test(Rn),'a cooldown between warnings');
  assert(/ahead&&who===0/.test(Rn),'Kenji only warns the local player (remote players: the horn)');
  assert(/kenjiBubble\.show\(0,tr\.say,KENJI\.bubbleS\)/.test(read('components/Town.tsx')),'Town shows the bubble at the cab');}
 // Owner, Nov 24 2026: a stopped train never waits either: standing in front of train 0 at North, Kenji warns once when it is due
 // within WARN_S s, the train leaves on time (no lag) and its front knocks the player clear.
 {const st0=run.states[0],ahead=tt.trackAt(st0.s+6),me={x:ahead.x,y:tt.bedAt(LW('lib/town/trainLayout.ts').trainLayout().profile,st0.s+6)+.4,z:ahead.z};const said=[];let tt0=now+.3,knock=null,lag=0;
  for(let i=0;i<30*30&&!knock;i++){tt0+=1/30;const r=run.update({dt:1/30,camera:cam,player:me,nowSec:tt0});if(r.say)said.push([i/30,r.say]);if(r.knock)knock=r;lag=Math.max(lag,run.runner.behind(0));}
  assert(said.length===1,`one warning per approach (${JSON.stringify(said)})`);assert(knock&&knock.knock==='track'&&knock.knockV>0,'knocked by the front, the train moving');assert(lag<1e-6,'left on time');
  const m=new T.Matrix4();run.carMatrixOf(0,0,m);const e=m.elements;assert(Math.abs(knock.knockX*e[8]+knock.knockZ*e[10])<1e-6,'thrown across the line, not along it');}
 console.log('train-ride: ok');
})().catch(e=>{console.error(e);process.exit(1);});

// Gameplay 2 (owner, Nov 24 2026): easier boarding. The zone (platform ± 2 m, ≤ 4 m back from the edge), Board ~4 s before the doors
// open with the press queued, the door hold (runner), "Boarding now" on the board, the pulse (not with reduced motion), Town wiring.
{const R2=L('lib/town/trainRide.ts'),S2=L('lib/town/trainSchedule.ts'),st0=tt.TRAIN_STATIONS[0],c0=tt.trackAt(st0.s),n0=tt.leftNormal(c0.tx,c0.tz),top=tt.bedAt(require('./lib/tsLoad.cjs').L('lib/town/trainLayout.ts').trainLayout().profile,st0.s)+tt.STATION_PLATFORM_Y;
 const at=(du,v)=>{const c=tt.trackAt(st0.s+du);const n=tt.leftNormal(c.tx,c.tz);return {x:c.x+n.x*st0.side*v,z:c.z+n.z*st0.side*v};};
 {const p=at(tt.STATION_HALF+1.5,3);assert.equal(R2.boardZoneAt(p.x,p.z,top),0,'1.5 m past the platform end: in the Board zone');}
 {const p=at(tt.STATION_HALF+3,3);assert.equal(R2.boardZoneAt(p.x,p.z,top),-1,'3 m past it: not');}
 {const p=at(0,R2.PLATFORM_EDGE+3.8);if(st0.id!=='south')assert.equal(R2.boardZoneAt(p.x,p.z,top),0,'3.8 m back from the edge: in');}
 const stop=S2.stopOf(st0.id),T0=S2.TRAIN_STOPS[stop];
 assert.equal(R2.boardIn({at:-1,next:stop,t:T0.arrive-1,doors:0,dwellLeft:0},stop),1+S2.DOOR_DELAY+S2.DOOR_MOVE*.5,'braking in: seconds until the doors are open');
 assert(R2.boardIn({at:-1,next:stop,t:T0.arrive-1,doors:0,dwellLeft:0},stop)<=R2.BOARD_EARLY,'Board shows ~4 s before the doors open');
 assert.equal(R2.boardIn({at:stop,next:stop+1,t:T0.arrive+3,doors:1,dwellLeft:8},stop),0,'open: now');
 assert.equal(R2.boardIn({at:stop,next:stop+1,t:T0.depart-1,doors:0,dwellLeft:1},stop),Infinity,'closing: no');
 // queued press: the doors open → on board at the next want()
 const states=[0,1,2].map(()=>({s:0,at:-1,doors:0,dwellLeft:0,next:0,t:0}));const run={states,ridden:new Uint8Array(3),seatPose:(k,j,o)=>{o.x=c0.x;o.y=top+1;o.z=c0.z;o.yaw=0;return o;},
  doorSpot:(k,x,z,o)=>{const p=at(0,1.95);o.x=p.x;o.z=p.z;o.y=top;o.yaw=0;o.car=0;o.door=1;return o;}};
 const ride=R2.createTrainRide({run:()=>run,place:()=>{},seat:()=>{},taken:()=>false,cue:()=>{}});const me=at(-8,3);
 Object.assign(states[2],{at:-1,next:stop,t:T0.arrive-1.5});assert(ride.want(me.x,me.z,top,true),'braking in: Board shows');
 assert(ride.board()&&!ride.active&&ride.queued===2,'a press while it brakes in is queued');assert.equal(ride.waiting,2,'waiting on the platform: this client holds its doors');
 Object.assign(states[2],{at:stop,doors:.3,dwellLeft:12.5,t:T0.arrive+2});ride.want(me.x,me.z,top,true);assert(!ride.active,'doors still opening: waiting');
 Object.assign(states[2],{doors:1,dwellLeft:11});assert.equal(ride.want(me.x,me.z,top,true),null);assert(ride.active&&ride.train===2&&ride.walking>=0,'doors open: boarded, walking to the door');
 assert.equal(ride.waiting,2,'walking aboard: doors held');ride.dispose();
 // the runner's door hold: time stands still before the doors shut, at most DOOR_HOLD s, then it leaves; the lag is caught up
 const r=S2.createTrainRunner(),o=S2.newTrainState();let now=T0.depart-4,closeAt=-1;r.step(0,now,0,NaN,o,true);
 for(let i=0;i<300;i++){now+=1/30;r.step(0,now,1/30,NaN,o,true);if(closeAt<0&&o.doors<1)closeAt=now;}
 assert(closeAt-(T0.depart-S2.DOOR_DELAY-S2.DOOR_MOVE)>S2.DOOR_HOLD-.3&&closeAt-(T0.depart-S2.DOOR_DELAY-S2.DOOR_MOVE)<S2.DOOR_HOLD+.3,`doors held ~${S2.DOOR_HOLD} s (${(closeAt-(T0.depart-S2.DOOR_DELAY-S2.DOOR_MOVE)).toFixed(2)})`);
 assert(r.behind(0)>0&&r.behind(0)<=S2.DOOR_HOLD+.1,'the hold leaves a small lag');for(let i=0;i<120*30;i++){now+=1/30;r.step(0,now,1/30,NaN,o,false);}assert(r.behind(0)<.05,'caught up within the next lap part');
 assert.equal(S2.waitText({wait:0,here:true}),'Boarding now');
 const css=read('components/TrainRideHud.module.css'),hud=read('components/TrainRideHud.tsx'),T=read('components/Town.tsx');
 assert(/\.board\{animation:boardPulse/.test(css)&&/prefers-reduced-motion:reduce\)\{\.board\{animation:none\}/.test(css)&&/styles\.board/.test(hud),'Board pulses, not with reduced motion');
 assert(/trainFrame\.boardHold=trainRide\.waiting/.test(T),'Town passes the door hold');
 assert(/runner\.step\(i,now,dt,NaN,st,f\.boardHold===i\)/.test(read('lib/town/trainRunning.ts')),'trainRunning holds the boarder\'s train');}
console.log('train-ride gameplay2: ok');

// Gameplay 2 (owner, Nov 24 2026): the green hover outline on a Board-eligible train (lib/graphics/trainHover.ts, buildingGlow 'train').
{const TH=L('lib/graphics/trainHover.ts'),THREE=require('three'),S3=L('lib/town/trainSchedule.ts'),stop=0,T0=S3.TRAIN_STOPS[stop];
 const scene=new THREE.Scene(),h=TH.createTrainHover(scene);const p0=tt.trackAt(0);
 const states=[{s:12.2,at:stop,next:1,t:T0.arrive+4,doors:1,dwellLeft:9},{s:0,at:-1,next:stop,t:T0.arrive+100,doors:0,dwellLeft:0},{s:0,at:-1,next:stop,t:T0.arrive-1,doors:0,dwellLeft:0}];
 const run={states,carMatrixOf:(k,c,o)=>o.makeTranslation(1000*k,0,-c*12.4+(k===2?500:0))};
 const ray=k=>{const r=new THREE.Raycaster();r.set(new THREE.Vector3(1000*k-10,2.5,0),new THREE.Vector3(1,0,0));return r;};
 const far=TH.TRAIN_HOVER_RANGE+50;
 assert(TH.trainBoardable(states[0])&&!TH.trainBoardable(states[1])&&TH.trainBoardable(states[2]),'eligible: standing with doors open, braking in; not running');
 // place the player next to train 0's middle (trackAt(s - length/2)) so the 45 m range passes
 const mid=tt.trackAt(states[0].s-S3.TRAIN_LENGTH/2);assert.equal(h.pick(ray(0),run,mid.x,mid.z),0,'pointing at a standing train: picked');
 assert.equal(h.pick(ray(0),run,mid.x+far,mid.z),-1,`beyond ${TH.TRAIN_HOVER_RANGE} m: not`);
 states[1].s=states[0].s;assert.equal(h.pick(ray(1),run,mid.x,mid.z),-1,'a running train: never');
 assert.equal(h.hover(ray(0),run,mid.x,mid.z,0),0,'hover');h.update(run,1/60,false);assert(scene.getObjectByName('train-hover-0').children[0].visible,'the outline shows');
 assert.equal(h.hover(null,run,mid.x,mid.z,100),-1,'no pointer: gone');h.dispose();
 const G=read('lib/graphics/buildingGlow.ts'),T=read('components/Town.tsx'),R3=read('lib/town/trainRide.ts');
 assert(/kind==='train'\?\[/.test(G),"buildingGlow 'train' shape");
 assert(/stampPrompt\.hover\(hoverPoint&&canEnter&&!overGasha&&!overTrain&&/.test(T),'the train beats the station house under the pointer');
 assert(/!trainRide\.active\?characterRay:null/.test(T),'no outline while riding');
 assert(/distance:hoverK===i\?-1:/.test(R3),'the hovered train makes Board the hovered target');
 assert(/trainHover\.pick\(characterRay,run,location\.x,location\.z\)[^;]*;if\(tk>=0\)\{[^}]*trainRide\.board\(\)/.test(T),'a tap on the train is Board');}
console.log('train-ride hover: ok');

// Gameplay 2 (owner, Nov 24 2026): the free ride camera. Default framing unchanged at rest; drag orbits 360° and stays (no spring
// back); pitch is clamped (a little under horizontal … ~60° down); wheel zooms within limits; Recenter eases home; keys turn it;
// the tunnel eases it to the default and restores it; reduced motion: no inertia; HUD presses never drag.
{const THREE=require('three'),R6=L('lib/town/trainRide.ts'),O=R6.ORBIT,st0=tt.TRAIN_STATIONS[2],s0=st0.s+40;
 const ev={};globalThis.window={innerWidth:1000,innerHeight:700,addEventListener:(t,f)=>{ev[t]=f;},removeEventListener:()=>{}};
 const states=[{s:s0,at:-1,doors:0,dwellLeft:0,next:0,t:0},{s:0,at:-1,doors:0,dwellLeft:0,next:0,t:0},{s:0,at:-1,doors:0,dwellLeft:0,next:0,t:0}];
 const pose0=tt.trackAt(s0-6);const run={states,ridden:new Uint8Array(3),seatPose:(k,j,o)=>{o.x=pose0.x;o.y=2;o.z=pose0.z;o.yaw=0;o.lean=1;return o;}};
 const ride=R6.createTrainRide({run:()=>run,place:()=>{},seat:()=>{},taken:()=>false,cue:()=>{}});
 // board without a platform: drive the internals through a fake platform-free path (riding state via board on a fake stop)
 Object.assign(states[0],{at:S.stopOf(tt.TRAIN_STATIONS[0].id),doors:1,dwellLeft:10});const sp=R6.platformSpot(0,tt.TRAIN_STATIONS[0].s,{x:0,y:0,z:0,yaw:0});
 const T0s=tt.TRAIN_STATIONS[0].s;Object.assign(states[0],{s:T0s+12});ride.want(sp.x,sp.z,sp.y,true);assert(ride.board(),'boarded');for(let i=0;i<40&&ride.walking>=0;i++)ride.frame(1/30,false);
 const cam=new THREE.PerspectiveCamera(50,1.6,.1,500);const step=(n=1,red=false)=>{for(let i=0;i<n;i++){ride.frame(1/30,red);ride.applyCamera(cam,1/30,red);}return cam.position.clone();};
 states[0].s=T0s+40;states[0].at=-1;step(60);const home=step(1);
 const canvas={tagName:'CANVAS'},btn={tagName:'BUTTON'};let ts=10000;const P=(t,x,y,target=canvas,id=1)=>{ts+=16;ev[t]({target,button:0,pointerId:id,clientX:x,clientY:y,timeStamp:ts});};
 P('pointerdown',500,350,btn);P('pointermove',900,350,btn);P('pointerup',900,350,btn);assert(step(5).distanceTo(home)<.05,'a press on a HUD button never drags the camera');
 P('pointerdown',500,350);for(let x=500;x<=980;x+=40)P('pointermove',x,350);ts+=500;P('pointerup',980,350);const moved=step(30);assert(moved.distanceTo(home)>2,'drag orbits the camera');
 assert(R6.trainRideStore.get().moved,'Recenter enabled');const kept=step(90);assert(kept.distanceTo(moved)<.05,'it stays where it is left (no spring back)');
 // drag all the way round: 360° allowed (keeps going, no soft limit)
 let a0=Math.atan2(kept.x-pose0.x,kept.z-pose0.z);P('pointerdown',100,350);for(let x=100;x<=1000;x+=50)P('pointermove',x,350);for(let x=0;x<=1000;x+=50)P('pointermove',x+1000,350);ts+=500;P('pointerup',2000,350);step(5);
 // pitch clamp: drag far down / up
 P('pointerdown',500,0);for(let y=0;y<=3000;y+=100)P('pointermove',500,y);ts+=500;P('pointerup',500,3000);const top=step(5);const head=new THREE.Vector3(pose0.x,2+1.25,pose0.z),d=top.clone().sub(head);
 assert(Math.atan2(d.y,Math.hypot(d.x,d.z))<=O.pitchMax+.02,'no steeper than ~60° down');
 P('pointerdown',500,3000);for(let y=3000;y>=-3000;y-=100)P('pointermove',500,y);ts+=500;P('pointerup',500,-3000);const low=step(5).sub(head);assert(Math.atan2(low.y,Math.hypot(low.x,low.z))>=O.pitchMin-.02,'no lower than a little under horizontal');
 // zoom (wheel) within limits
 const dist=()=>step(3).distanceTo(head);for(let i=0;i<40;i++)ev.wheel({target:canvas,deltaY:-200});const near=dist();for(let i=0;i<40;i++)ev.wheel({target:canvas,deltaY:200});const far=dist();assert(far>near*3,`wheel zooms (${near.toFixed(1)} → ${far.toFixed(1)} m)`);
 // Recenter eases home
 ride.press('recenter','tap');step(1);const mid=step(2);assert(mid.distanceTo(home)>.3,'eases, not a snap');step(150);assert(step(1).distanceTo(home)<.2&&!R6.trainRideStore.get().moved,'Recenter: back to the default framing');
 // double tap recenters too
 P('pointerdown',500,350);for(let x=500;x<=900;x+=40)P('pointermove',x,350);ts+=500;P('pointerup',900,350);step(10);P('pointerdown',300,300);P('pointerup',300,300);P('pointerdown',305,302);P('pointerup',305,302);step(200);assert(step(1).distanceTo(home)<.2,'double tap recenters');
 // keys turn it (held), reduced motion: no inertia after a flick
 ride.holdPlayer(0,0,new Set(['arrowright']));step(30);ride.holdPlayer(0,0,new Set());const kk=step(1);assert(kk.distanceTo(home)>1,'arrows / WASD turn the camera');
 P('pointerdown',500,350);P('pointermove',560,350);P('pointermove',620,350);P('pointerup',620,350);const r1=step(1,true),r2=step(20,true);assert(r1.distanceTo(r2)<.05,'reduced motion: no inertia');
 // tunnel: the orbit eases to the default framing inside and comes back after
 const mid2=(tt.TUNNEL.west.s+tt.TUNNEL.east.s)/2;const out1=step(1);states[0].s=mid2+12;step(150);const inT=cam.position.clone();ride.press('recenter','tap');step(200);const inHome=step(1);
 assert(inT.distanceTo(inHome)<.3,'in the tunnel the camera is at the default framing');
 const R7=read('lib/town/trainRide.ts');assert(/camClearFraction\(hx,hy,hz,camPos\.x,camPos\.y,camPos\.z,ports\.ground(,true)?\)/.test(R7),'the free camera keeps the clearance spring arm');
 assert(/el\.tagName!=='CANVAS'\)return/.test(R7),'only canvas presses drag');assert(/trainButtons\(trainCanGetOff,trainMoved[,)]/.test(read('components/Town.tsx'))&&/recenter:'M12/.test(read('components/TravelIcon.tsx')),'Recenter in the ride cluster');
 ride.dispose();delete globalThis.window;}
console.log('train-ride camera: ok');
// Gameplay 2 + visuals merge: the kneeling legs solve onto the cushion (knee over the seat top, short of the backrest)
{const P=L('lib/graphics/trainSeatPose.ts'),TP=L('lib/graphics/trickPose.ts'),CM=L('lib/town/trainCarModel.ts'),TRN2=require('./lib/tsLoad.cjs').L('lib/town/trainRunning.ts');
 for(const lean of [-1,1]){const o=P.trainRiderPose(lean);for(const side of [-1,1]){const out={};TP.solveTrickLeg(o,side,o.legs[side>0?1:0],1,out);
  const t=TP.TRICK_RIG.thigh,ky=o.pelvisY-t*Math.cos(out.hipX)*Math.cos(out.hipZ),kz=-t*Math.sin(out.hipX);
  assert(ky>CM.BENCH_TOP-CM.CAR_FLOOR_Y+.03&&ky<CM.BENCH_TOP-CM.CAR_FLOOR_Y+.16,`knee on the cushion (${ky.toFixed(2)})`);assert(TRN2.RIDER_ROOT_X+kz<CM.BENCH_BACK-.03,`knee short of the backrest (${(TRN2.RIDER_ROOT_X+kz).toFixed(2)})`);}}}
console.log('train-ride kneel: ok');
{const town=require('fs').readFileSync(require('path').join(__dirname,'..','components/Town.tsx'),'utf8');require('assert')(/if\(travel\.current\)\{trainRide\.finish\(\);[^\n]*?roofRide\.k=-1;roofRide\.hop=false;roofLanding=-1;/.test(town),'owner Nov 25: map travel from a train roof ends the roof ride');console.log('train-ride roof travel ok');}
{const town=require('fs').readFileSync(require('path').join(__dirname,'..','components/Town.tsx'),'utf8'),A=require('assert');const off=/trainRide\.finish\(\);[^\n]{0,60}?roofRide\.k=-1;roofRide\.hop=false;roofLanding=-1;/;
 // owner Nov 25 2026 ("standing on the train, unable to transport"): every teleport-style travel takes you off the train and its roof
 // first (the seat / aisle walk / roof ride re-place you each frame otherwise); scripts/check-train-travel.cjs plays each path in Chrome
 for(const [name,re] of [['field travel',/if\(fieldTravel\.current\)\{([^\n]*)/],['go fishing',/if\(goFish\.current&&!travel\.current\)\{([^\n]*)/],['map travel',/if\(travel\.current\)\{([^\n]*)/],['a lesson',/const command=lessonCommand\.current;lessonCommand\.current=null;([^\n]*)/]]){const m=town.match(re);A(m&&off.test(m[1].slice(0,260)),`${name} from the train ends the ride and any roof ride first`);}
 console.log('train-ride travel off the train ok');}
{const map=require('fs').readFileSync(require('path').join(__dirname,'..','components/IslandTravelMap.tsx'),'utf8'),A=require('assert');
 // owner Nov 25 2026 (phone, from the train): an off-screen station's edge chip lying over a place's pin on screen passes the tap to that pin
 A(/data-station-chip=[^\n]*onClick=\{e=>\{const pin=e\.detail>0\?pinUnder\(e\.clientX,e\.clientY\):null;if\(pin\)\{pin\.dispatchEvent/.test(map)&&/const pinUnder=[^\n]*elementsFromPoint[^\n]*\.map-destination/.test(map),'a station chip over a visible pin travels to that place');
 console.log('train-ride map chip over a pin ok');}
