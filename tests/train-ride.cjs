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
 let placed=null,seated=0,paid=[];const ride=R.createTrainRide({run:()=>run,place:(x,z,y)=>{placed={x,z,y};},seat:()=>{seated++;},taken:()=>false,cue:()=>{},loadQuiz:async()=>[{id:'q:1',q:'How long is a half?',options:['45 min','20 min'],correct:0,explain:'Two halves of 45.'}],pay:id=>paid.push(id)});
 const sp=R.platformSpot(0,tt.TRAIN_STATIONS[0].s,{x:0,y:0,z:0,yaw:0});
 assert.equal(ride.want(sp.x,sp.z,sp.y,true),null,'no train: no Board');
 Object.assign(states[1],{at:north,doors:1,dwellLeft:8});const w=ride.want(sp.x,sp.z,sp.y,true);assert(w&&w.key===R.TRAIN_BOARD_KEY,'a train at the platform, doors open: Board');
 assert.equal(ride.want(sp.x,sp.z,sp.y,false),null,'not on foot / busy: no Board');ride.want(sp.x,sp.z,sp.y,true);
 assert(ride.board()&&ride.active&&ride.train===1,'boarded train 1');assert.equal(R.trainRideStore.get().riding,true);
 ride.frame(1/30,false);assert(seated>0,'the seat drives the player');assert.equal(run.ridden[1],1,'the ridden train draws its open variant');assert(ride.wire()&&ride.wire().train===1,'presence: the train seat');
 assert(ride.trick(),'the bench pose');assert(ride.holdPlayer(.4),'input locked while riding');
 Object.assign(states[1],{at:-1,doors:0,dwellLeft:0,next:0});ride.frame(1/30,false);assert(/^Next stop: West Beach\. Did you know\?/.test(R.trainRideStore.get().note),'leaving: the next-stop announcement');
 assert.equal(ride.getOff(false),false,'no getting off between stops');assert.equal(R.trainRideStore.get().canGetOff,false);
 (async()=>{await new Promise(r=>setTimeout(r,5));for(let k=0;k<7*30;k++)ride.frame(1/30,false);const q=R.trainRideStore.get().quiz;assert(q&&q.id==='q:1','one quiz question on the run');
  ride.answer(1);assert.equal(paid.length,0,'a wrong answer pays nothing');assert.equal(R.trainRideStore.get().quiz.picked,1);
  Object.assign(states[1],{at:S.stopOf('west'),doors:1,dwellLeft:10});ride.frame(1/30,false);assert.equal(R.trainRideStore.get().quiz,null,'the quiz closes at the stop');assert(R.trainRideStore.get().canGetOff,'Get off at the stop');
  assert(ride.getOff(false)&&!ride.active&&placed&&R.platformAt(placed.x,placed.z,placed.y)===tt.TRAIN_STATIONS.findIndex(s=>s.id==='west'),'got off onto the West Beach platform');
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
