// Island Line Gameplay 3 (Nov 24 2026): walk inside the carriage and change seat, NPC passengers, interior finishing.
// Run: node tests/train-gameplay3.cjs
//  1. trainWalk (pure): the train frame through the gangway, the aisle / door bay / gangway widths, no walking through a bench or a cab
//  2. trainRide: Walk → stand in the aisle (train-relative, moves with the train), walk, the free seats glow, Sit near one (skip a
//     friend's seat), presence sends the new seat; Get off from standing at a stop (primary when by a door); the cluster
//  3. wiring: Town poses the rig in the train frame and gives it back to the world; the Walk button; the seat glow (one draw)
const assert=require('node:assert/strict');
const T=require('three');
const {L,read}=require('./lib/tsLoad.cjs');
const W=L('lib/town/trainWalk.ts'),CM=L('lib/town/trainCarModel.ts'),S=L('lib/town/trainSchedule.ts'),RN=L('lib/town/trainRunning.ts'),tt=L('lib/town/trainTrack.ts');
// ---- 1. the train frame and the floor
{const o={car:0,x:0,z:0},b={x:0,z:0};
 for(const [x,u] of [[.3,2],[-.2,-3],[.1,-9],[-.3,-15]]){W.toCar(x,u,o);W.fromCar(o.car,o.x,o.z,b);assert(Math.abs(b.x-x)<1e-9&&Math.abs(b.z-u)<1e-9,'toCar / fromCar round trip');}
 W.toCar(0,-9,o);assert.equal(o.car,1,'past the gangway: car 1');W.toCar(0,-3,o);assert.equal(o.car,0);
 assert(W.walkable(0,0)&&W.walkable(0,-6.2)&&W.walkable(0,-12),'the aisle and the gangway are floor');
 assert(!W.walkable(.9,1.4),'a bench (car 0) is not floor');assert(W.walkable(.9,CM.DOORS[1]),'a door bay is floor up to the doors');
 assert(!W.walkable(0,CM.CAB_Z),'not into the cab');assert(!W.walkable(0,-S.CAR_LENGTH-S.CAR_GAP-CM.CAB_Z),'not into car 1\'s cab');
 assert(!W.walkable(.4,-6.2),'the gangway is narrow');
 // a long walk down the train (u decreasing) stays on the floor and reaches car 1; pushing sideways slides along the bench fronts
 const p={x:0,u:4};for(let i=0;i<400;i++){W.stepWalk(p,.02*(i%2?1:-1)+.03,-.06);assert(W.walkable(p.x,p.u),`on the floor at ${p.x.toFixed(2)}, ${p.u.toFixed(2)}`);}
 assert(p.u<-14,'walked through the gangway into car 1');
 const q={x:0,u:1.4};for(let i=0;i<60;i++)W.stepWalk(q,.05,0);assert(Math.abs(q.x-W.AISLE_X)<1e-6,'stopped at the bench front');
 const d={x:0,u:CM.DOORS[1]};for(let i=0;i<60;i++)W.stepWalk(d,.05,0);assert(Math.abs(d.x-W.BAY_X)<1e-6,'walks up to the doors in a bay');
 for(let i=0;i<60;i++)W.stepWalk(d,0,.05);assert(W.walkable(d.x,d.u),'out of a bay along the wall: kept on the floor');
 // seats: the player seats' aisle spots, nearest free skips taken ones
 const a={x:0,z:0};for(let j=0;j<RN.TRAIN_SEATS;j++){W.seatAisle(j,a);assert(W.walkable(a.x,a.z),`seat ${j}'s aisle spot is floor`);}
 W.seatAisle(2,a);assert.equal(W.nearestFreeSeat(a.x,a.z,W.NEAR_SEAT,()=>false),2,'by seat 2: Sit takes seat 2');
 assert.notEqual(W.nearestFreeSeat(a.x,a.z,W.NEAR_SEAT,j=>j===2),2,'a friend in seat 2: skipped');
 assert(W.nearDoor(0,CM.DOORS[0])>=0&&W.nearDoor(0,1.45)<0,'by a door bay / mid bench');}
console.log('train-gameplay3 walk frame: ok');
// ---- 2. the ride: stand, walk, sit, get off
{const R=L('lib/town/trainRide.ts');
 // a fake straight train along +z at s: car 0's middle at z = s − 6, car 1 turned round behind it
 const states=[0,1,2].map(()=>({s:100,at:-1,doors:0,dwellLeft:0,next:0,t:0,v:0}));
 const carM=(k,c,out)=>{const z=states[k].s-c*(S.CAR_LENGTH+S.CAR_GAP)-S.CAR_LENGTH/2;out.identity();if(c%2)out.makeRotationY(Math.PI);out.setPosition(0,1,z);return out;};
 const m=new T.Matrix4(),v=new T.Vector3();
 const seatAt=(k,i,o)=>{const st=RN.SEAT_TABLE[i];carM(k,st.car,m);v.set(st.x,RN.CAR_FLOOR_Y,st.z).applyMatrix4(m);const e=m.elements;o.x=v.x;o.y=v.y;o.z=v.z;o.yaw=Math.atan2(st.side*e[0],st.side*e[2]);o.lean=st.lean;return o;};
 const run={states,ridden:new Uint8Array(3),seatPose:(k,j,o)=>seatAt(k,RN.PLAYER_SEATS[j],o),carMatrixOf:carM};
 const north=S.stopOf('north');Object.assign(states[1],{at:north,doors:1,dwellLeft:10});
 let seat=null,placed=null,friend=-1;const ride=R.createTrainRide({run:()=>run,place:(x,z,y)=>{placed={x,z,y};},seat:p=>{seat={...p};},taken:(k,j)=>j===friend,cue:()=>{},loadQuiz:async()=>[],pay:()=>{}});
 // board on North's platform
 const st0=tt.TRAIN_STATIONS[0],sp=R.platformSpot(0,st0.s,{x:0,y:0,z:0,yaw:0});
 // the fake train is not at North's coordinates: Board through want() needs the platform; use it and then drive the frames
 ride.want(sp.x,sp.z,sp.y,true);assert(ride.board()&&ride.active,'boarded');for(let i=0;i<40&&ride.walking>=0;i++)ride.frame(1/30,false);
 const j0=ride.seat;assert(j0>=0&&!ride.standing,'seated');
 let b=R.trainButtons(true,false,false,false,false);assert.equal(b.length,4,'four ride buttons: Get off, horn, Recenter, Walk');
 const walk=b.find(x=>x.id==='walk');assert(walk.slot==='extra'&&walk.icon==='walk'&&walk.enabled&&walk.key==='Q','Walk: the extra slot, person-walking icon, Q');
 assert.equal(R.trainKeyAction('KeyQ','q'),'walk');
 // Walk: stand up into the aisle (train-relative)
 Object.assign(states[1],{at:-1,doors:0,dwellLeft:0,next:0});ride.frame(1/30,false);
 ride.press('walk','tap');assert(ride.standing&&R.trainRideStore.get().standing,'Walk: standing');
 for(let i=0;i<20;i++)ride.frame(1/30,false);
 const a=ride.spot;assert(W.walkable(a.x,a.u),'standing in the aisle');assert(ride.gait.on,'Town poses the rig in the train frame');
 const wire0=ride.wire().seat;
 // moves with the train, no sliding: the train runs 10 m, the world spot runs 10 m, the train-frame spot stays
 const z0=seat.z,u0=a.u;states[1].s+=10;ride.frame(1/30,false);assert(Math.abs(seat.z-z0-10)<1e-6&&Math.abs(ride.spot.u-u0)<1e-9,'standing moves with the train');
 // walk toward the back (the camera looks along +u by default: pull back on the stick), into car 1
 for(let i=0;i<30*14;i++){ride.holdPlayer(0,1);ride.frame(1/30,false);assert(W.walkable(ride.spot.x,ride.spot.u),'every step on the floor');}
 assert(ride.spot.u<-8,`walked through the gangway into car 1 (u ${ride.spot.u.toFixed(2)})`);ride.holdPlayer(0,0);
 // the seats near you glow; by a free one, Sit (a friend's seat is skipped)
 const ca={x:0,z:0},target=RN.PLAYER_SEATS.findIndex(i=>RN.SEAT_TABLE[i].car===1);W.seatAisle(target,ca);
 friend=target;Object.assign(ride.spot,{x:ca.x,u:ca.z});for(let i=0;i<10;i++)ride.frame(1/30,false);
 assert.notEqual(ride.nearSeat,target,'a friend\'s seat: no Sit there');assert(ride.glows[target].w===0,'a friend\'s seat does not glow');
 friend=-1;for(let i=0;i<10;i++)ride.frame(1/30,false);
 assert.equal(ride.nearSeat,target,'by a free seat: Sit takes it');assert(ride.glows[target].w>.5,'the seat in reach glows');
 assert(R.trainRideStore.get().nearSeat,'the button turns into Sit');b=R.trainButtons(false,false,true,true,false);assert(b.find(x=>x.id==='walk').icon==='sit'&&b.find(x=>x.id==='walk').enabled);
 ride.press('walk','tap');for(let i=0;i<40&&ride.standing;i++)ride.frame(1/30,false);
 assert(!ride.standing&&ride.seat===target,'sat in the new seat');assert.equal(ride.wire().seat,target,'presence: the new seat code');assert.notEqual(wire0,target);
 assert(!ride.gait.on,'the rig is back in the world frame');
 // Get off from standing: only at a stop with the doors open; by a door bay Get off is the primary button
 ride.press('walk','tap');for(let i=0;i<20;i++)ride.frame(1/30,false);assert(ride.standing);
 assert.equal(ride.getOff(false),false,'between stops: no getting off while standing');
 Object.assign(ride.spot,{x:0,u:CM.DOORS[1]});const west=S.stopOf('west');Object.assign(states[1],{at:west,doors:1,dwellLeft:10});for(let i=0;i<3;i++)ride.frame(1/30,false);
 assert(R.trainRideStore.get().nearDoor&&R.trainRideStore.get().canGetOff,'by an open door at a stop');
 b=R.trainButtons(true,false,true,false,true);assert.equal(b.find(x=>x.id==='getoff').slot,'shoot','Get off is the primary by the door');assert.equal(b.find(x=>x.id==='horn').slot,'ride');
 assert.equal(R.trainButtons(true,false,false,false,false).find(x=>x.id==='getoff').slot,'ride','seated: Get off keeps its place');
 assert(ride.getOff(false)&&!ride.active&&placed,'got off from standing');assert(!R.trainRideStore.get().standing&&!ride.gait.on,'off: not standing');
 assert(R.platformAt(placed.x,placed.z,placed.y)>=0,'stepped onto the platform');
 ride.dispose();}
console.log('train-gameplay3 stand / walk / sit / get off: ok');
// ---- 3. wiring
{const town=read('components/Town.tsx'),css=read('app/globals.css'),icon=read('components/TravelIcon.tsx'),pose=L('lib/graphics/trainSeatPose.ts');
 assert(/player\.update\(trainGait\.on\?trainGait\.x:visualLocation\.x,trainGait\.on\?trainGait\.z:visualLocation\.z/.test(town),'the rig walks in the train frame');
 assert(/if\(trainGait\.on\)\{trainGait\.facing=NaN;trainRide\.gaitYaw=player\.root\.rotation\.y;player\.root\.position\.set\(gWx,gWy,gWz\)/.test(town),'and goes back to its world spot');
 assert(/className="touch-juggle touch-walk"/.test(town)&&/\.touch-juggle\.touch-walk/.test(css),'the Walk button (round, the cluster style)');
 assert(/trainSeatGlow\.update\(trainRide\.active\?trainRide\.glows:null\)/.test(town),'the seat glow follows the ride');assert(/ sit:'M/.test(icon),'a sit icon');
 const s=pose.trainStrapPose(1);assert(s.arms[1].w===1&&s.arms[1].sx< -2&&s.legs[0].w===0,'strap pose: a hand up, the rig keeps its feet');
 pose.swayStrapPose(s,.05);assert(s.pelvisRoll!==0);pose.swayStrapPose(s,0);assert.equal(s.pelvisRoll,0,'no sway with reduced motion (lean 0)');
 const C=L('lib/town/trainCamClear.ts');assert.equal(C.interiorClearFraction(0,1.3,0,0,1.6,-2),1,'inside the room: the full arm');
 const f=C.interiorClearFraction(0,1.3,0,2.4,1.3,0);assert(Math.abs(f-C.ROOM.x/2.4)<1e-9,'through the wall: pulled in to the room');}
console.log('train-gameplay3 wiring: ok');
// ---- 4. NPC passengers (lib/town/trainPassengers.ts)
{const PX=L('lib/town/trainPassengers.ts'),away=()=>true,NST=S.TRAIN_STOPS.length;
 assert(PX.CAST.length>=14&&PX.CAST.some(c=>c.prop==='ball'&&c.kid)&&PX.CAST.some(c=>c.prop==='scarf')&&PX.CAST.some(c=>c.prop==='bento')&&PX.CAST.some(c=>/Trainspotter/.test(c.role))&&PX.CAST.some(c=>c.boarder),'the cast: commuters, a kid with a ball, a scarf, a bento, a trainspotter, the station boarders');
 for(const c of PX.CAST)assert(c.topics.length>=2&&c.greeting&&c.name,'talkable: '+c.name);
 let seated=[],changes=[],standing=0;
 for(let k=0;k<3;k++)for(let seg=100;seg<160;seg++){const r=PX.rosterFor(k,seg,away);const seats=new Set();
  for(let c=0;c<2;c++){let n=0;for(let p=0;p<PX.SLOTS_PER_CAR;p++){const s=r.slots[c*PX.SLOTS_PER_CAR+p];if(!s.on)continue;
    if(s.standing){standing++;continue;}n++;assert(RN.NPC_SEATS.includes(s.seat)&&!RN.PLAYER_SEATS.includes(s.seat),'passengers sit in NPC seats only (players keep theirs)');assert.equal(RN.SEAT_TABLE[s.seat].car,c,'in their own car');assert(!seats.has(s.seat),'one passenger a seat');seats.add(s.seat);
    assert(PX.seatTaken(r,s.seat),'the seat table knows it is taken');}seated.push(n);}
  const casts=r.slots.filter(s=>s.on).map(s=>s.cast);assert.equal(new Set(casts).size,casts.length,'nobody rides twice in one train');
  let ch=0;for(let i=0;i<r.slots.length;i++){const a=r.slots[i],b=r.prev[i];if(a.on!==b.on||(a.on&&a.cast!==b.cast))ch++;}changes.push(ch);}
 const avg=seated.reduce((a,b)=>a+b,0)/seated.length;assert(avg>=3&&avg<=5,`3-5 seated a car on average (${avg.toFixed(2)})`);
 const cavg=changes.reduce((a,b)=>a+b,0)/changes.length;assert(cavg>=.9&&cavg<=2.3,`1-2 get on / off a stop on average (${cavg.toFixed(2)} a train)`);
 assert(standing>0,'busier runs: some stand at the straps');
 assert.deepEqual(PX.rosterFor(1,123,away).slots,PX.rosterFor(1,123,away).slots,'seeded: every client gets the same roster');
 const notAway=PX.rosterFor(0,120,()=>false);assert(notAway.slots.every(s=>!s.on||!PX.CAST[s.cast].boarder),'a station islander rides only while away from their platform');
 // the segment: standing at stop i already counts the roster riding on; leaving changes nothing
 const st={at:2,next:3,t:S.TRAIN_STOPS[2].arrive+3},run2={at:-1,next:3,t:S.TRAIN_STOPS[2].depart+3};assert.equal(PX.segOf(0,st.t,st),PX.segOf(0,run2.t,run2),'leaving a stop keeps the roster');
 // runtime: the heat gate and the draw
 const scene=new T.Scene(),cam=new T.PerspectiveCamera(60,1,.1,500);const pax=PX.createTrainPassengers(scene,{away});
 const states=[0,1,2].map(i=>({s:200+i*300,at:-1,next:1,t:60,doors:0,dwellLeft:0,v:10}));
 const carM=(k,c,out)=>{out.identity();if(c%2)out.makeRotationY(Math.PI);out.setPosition(states[k].s,1,-c*12.4);return out;};const run={states,carMatrixOf:carM};
 const look=(x,z)=>{cam.position.set(x,4,z+12);cam.lookAt(x,1,z-6);cam.updateMatrixWorld();};
 look(1000,0);pax.update(run,60,cam,-1,0,false);assert.equal(pax.shown,0,'no train near: nobody drawn');assert.equal(scene.getObjectByName('train-passengers'),undefined,'built only on first sight');
 look(200,0);pax.update(run,60,cam,-1,0,false);const near=pax.shown;assert(near>0,'a train in view nearby: its passengers');
 const mesh=scene.getObjectByName('train-passengers');assert(mesh&&mesh.isInstancedMesh&&scene.children.filter(o=>o.isMesh&&o.visible).length===1,'ONE instanced draw for all passengers');
 cam.position.set(200,4,40);cam.lookAt(200,4,80);cam.updateMatrixWorld();pax.update(run,60,cam,-1,0,false);assert.equal(pax.shown,0,'behind the camera: nobody');
 pax.update(run,60,cam,0,0,false);assert(pax.shown>0,'the train I ride: always drawn');
 look(200,0);pax.update(run,60,cam,0,4,false);assert(pax.shown<=4,`lowest tier: 1 a car (${pax.shown})`);pax.update(run,60,cam,0,3,false);assert(pax.shown<=4,'tier 3: 2 a car');
 pax.update(run,60,cam,0,0,false);const r0=pax.roster(0);const s0=r0.slots.find(s=>s.on&&!s.standing);
 const sp0={x:0,z:0};const seat=RN.SEAT_TABLE[s0.seat];const w=new T.Vector3(seat.side*1.0,RN.CAR_FLOOR_Y,seat.z).applyMatrix4(carM(0,seat.car,new T.Matrix4()));
 const npc=pax.nearest(0,w.x,w.z);assert(npc&&npc.topics.length>=2,'riding next to a passenger: Talk to them');assert.equal(pax.nearest(1,w.x,w.z),null,'only on the train I ride');void sp0;
 // a stop: the old riders walk out, then the new ones walk in, during the doors' open time
 const stop=1;Object.assign(states[0],{at:stop,next:2,t:S.TRAIN_STOPS[stop].arrive+1});const dwell=S.TRAIN_STOPS[stop].depart-S.TRAIN_STOPS[stop].arrive;
 const counts=[];for(const dw of [1,PX.OFF_FROM+1,PX.ON_FROM-.1,PX.ON_FROM+1,PX.ON_FROM+PX.WALK_S+.2]){states[0].dwellLeft=dwell-dw;states[0].t=S.TRAIN_STOPS[stop].arrive+dw;pax.update(run,S.TRAIN_STOPS[stop].arrive+dw,cam,0,0,false);counts.push(pax.shown);}
 assert(counts.every(n=>n>0),'the train never empties at a stop: '+counts.join(','));
 pax.dispose();assert.equal(scene.getObjectByName('train-passengers'),undefined,'disposed');}
console.log('train-gameplay3 passengers: ok');
// ---- 5. interior finishing: readable poster titles, the route map, door chime lamps lit only while the doors are open
{const P=CM.POSTERS;assert.equal(P.length,8,'four posters a side');for(const k of [0,1,2,3])assert.equal(P.filter(p=>p.kind===k).length,2,`poster ${k} on both sides`);
 for(const p of P)for(const [u,z] of [[.66,p.z0],[.84,p.z1]]){const c=CM.coveCorner(p.s,u,z,.02);assert(Math.abs(c[0])<CM.HALF_W&&c[1]>3.05&&c[1]<3.45,'title quads on the cove inside the car');}
 const run=read('lib/town/trainRunning.ts'),RN2=RN;assert.deepEqual([...RN2.POSTER_TITLES].map(t=>t.split(' ')[0]),['ISLAND','HISTORY','KIT','ISLAND'],'titles: Island League, History Museum, Kit Shop, Island Line');
 assert(/for\(let k=0;k<n;k\+\+\)\{const st=TRAIN_STOPS\[k\]\.station/.test(run)&&S.TRAIN_STOPS.length===5&&S.TRAIN_STOPS.some(s=>s.station.id==='north'),'the route map draws the 5 stops from the timetable (North at its new spot)');
 assert(/writeInside\(i,c,m4,!!api\.ridden\[i\]\|\|d3<CLOSE_RANGE,open>0\?side\*rev:0\)/.test(run),'titles only on ridden / close-up trains; chime lamps only on the side whose doors are open');
 assert(/if\(q\.chime&&q\.side!==openSide\)\{platePos\.fill\(0,o,o\+12\)/.test(run),'closed doors: the chime lamps collapse');
 assert(/const plates=new T\.Mesh\(plateGeo,boards\.mat\)/.test(run),'the same plates mesh and canvas: no new draw call or program');}
console.log('train-gameplay3 interior: ok');
