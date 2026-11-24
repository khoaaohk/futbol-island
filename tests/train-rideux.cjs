// Island Line ride UX (owner, Nov 24 2026). Run: node tests/train-rideux.cjs
//  1. easy exit: the "Get off at <Station>" pill shows EXIT_EARLY s before the doors open until they start to close (never between
//     stops); a press while braking in is queued and steps you out as they open; the step-out walk ends on the platform facing away
//     from the train in under 1 s; the doors are held for a rider at a stop; "Doors closing" + the chime EXIT_WARN s before they shut
const assert=require('node:assert/strict');
const T=require('three');
const {L,read}=require('./lib/tsLoad.cjs');
const S=L('lib/town/trainSchedule.ts'),RN=L('lib/town/trainRunning.ts'),tt=L('lib/town/trainTrack.ts'),R=L('lib/town/trainRide.ts');
// a fake straight train along +z at s (as train-gameplay3): car 0's middle at z = s − 6, car 1 turned round behind it; doors on +x
const states=[0,1,2].map(()=>({s:100,at:-1,doors:0,dwellLeft:0,next:0,t:0,v:0}));
const carM=(k,c,out)=>{const z=states[k].s-c*(S.CAR_LENGTH+S.CAR_GAP)-S.CAR_LENGTH/2;out.identity();if(c%2)out.makeRotationY(Math.PI);out.setPosition(0,1,z);return out;};
const m=new T.Matrix4(),v=new T.Vector3();
const seatAt=(k,i,o)=>{const st=RN.SEAT_TABLE[i];carM(k,st.car,m);v.set(st.x,RN.CAR_FLOOR_Y,st.z).applyMatrix4(m);const e=m.elements;o.x=v.x;o.y=v.y;o.z=v.z;o.yaw=Math.atan2(st.side*e[0],st.side*e[2]);o.lean=st.lean;return o;};
let held=0;
const run={states,ridden:new Uint8Array(3),seatPose:(k,j,o)=>seatAt(k,RN.PLAYER_SEATS[j],o),carMatrixOf:carM,runner:{doorHeldFor:()=>held},
 doorSpot:(k,x,z,out)=>{if(states[k].at<0)return null;out.x=1.95;out.z=Math.round((z-states[k].s)/3)*3+states[k].s;out.y=1;out.yaw=-Math.PI/2;out.car=0;out.door=0;return out;}};
const north=S.stopOf('north'),west=S.stopOf('west');
let placed=null,cues=[];const ride=R.createTrainRide({run:()=>run,place:(x,z,y,yaw)=>{placed={x,z,y,yaw};},seat:()=>{},taken:()=>false,cue:n=>cues.push(n),loadQuiz:async()=>[],pay:()=>{}});
Object.assign(states[1],{at:north,doors:1,dwellLeft:10});const sp=R.platformSpot(0,tt.TRAIN_STATIONS[0].s,{x:0,y:0,z:0,yaw:0});
ride.want(sp.x,sp.z,sp.y,true);assert(ride.board(),'boarded');for(let i=0;i<40&&ride.walking>=0;i++)ride.frame(1/30,false);
// between stops: no pill, a press only notes
const arriveT=S.TRAIN_STOPS[west].arrive;
Object.assign(states[1],{at:-1,doors:0,dwellLeft:0,next:west,t:arriveT-30});ride.frame(1/30,false);
assert.equal(R.trainRideStore.get().exitTo,'','no pill between stops');assert.equal(ride.requestExit(),false,'no exit between stops');
// braking in, ~4 s before the doors open: the pill names the station; a press queues
states[1].t=arriveT-(R.EXIT_EARLY-S.DOOR_DELAY-S.DOOR_MOVE*.5)+.2;ride.frame(1/30,false);
assert.equal(R.trainRideStore.get().exitTo,tt.TRAIN_STATIONS.find(s=>s.id==='west').name,'the pill shows braking in');
assert(R.trainButtons(false,false,false,false,false,'West Beach').find(b=>b.id==='getoff').enabled,'the cluster Get off is active too');
assert(R.trainButtons(false,false,false,false,false,'West Beach').find(b=>b.id==='getoff').label==='Get off at West Beach');
assert.equal(R.trainKeyAction('Enter','Enter'),'getoff','Enter gets off');
ride.press('getoff','tap');assert(ride.exitQueued&&R.trainRideStore.get().exitQueued,'queued: Doors opening…');assert(ride.active,'still on board');
// at the stop, doors still opening: still queued; the rider holds the doors
Object.assign(states[1],{at:west,doors:.2,dwellLeft:20});ride.frame(1/30,false);assert(ride.exitQueued&&ride.exiting<0,'waits for the doors');
assert.equal(ride.waiting,1,'a rider at a stop holds the doors');
states[1].doors=1;ride.frame(1/30,false);assert(ride.exiting>=0,'doors open: the step-out walk starts');assert.equal(R.trainRideStore.get().exitTo,'','the pill goes');
let n=0;while(ride.active&&n<60){ride.frame(1/30,false);n++;}
assert(!ride.active&&placed,'off the train');assert(n/30<1,`the walk takes under 1 s (${(n/30).toFixed(2)} s)`);
assert(placed.x>1.95+1,'out on the platform, clear of the doorway');assert(Math.abs(Math.sin(placed.yaw)-1)<1e-6,'facing away from the train');
// the doors-closing warning: the chime + the note EXIT_WARN s before the doors start to shut (the hold counted)
ride.want(sp.x,sp.z,sp.y,true);Object.assign(states[1],{at:north,doors:1,dwellLeft:10});ride.want(sp.x,sp.z,sp.y,true);assert(ride.board());for(let i=0;i<40&&ride.walking>=0;i++)ride.frame(1/30,false);
cues=[];held=0;Object.assign(states[1],{at:west,doors:1,dwellLeft:2.9});ride.frame(1/30,false);assert(!R.trainRideStore.get().closing,'held doors: not closing yet');
held=.5;ride.frame(1/30,false);assert(R.trainRideStore.get().closing&&cues.includes('train-chime')&&R.trainRideStore.get().note===R.TRAIN_NOTES.closing,'Doors closing + chime');
// doors closing (under half open): the pill goes; leaving: no pill
Object.assign(states[1],{doors:.3,dwellLeft:1.6});ride.frame(1/30,false);assert.equal(R.trainRideStore.get().exitTo,'','doors closing: no pill');
Object.assign(states[1],{at:-1,doors:0,dwellLeft:0,next:S.stopOf('south'),t:S.TRAIN_STOPS[west].depart+1});ride.frame(1/30,false);assert.equal(R.trainRideStore.get().exitTo,'');assert.equal(ride.waiting,-1,'running: no hold');
ride.dispose();
// wiring: the pill in the HUD, the cluster gets exitTo, E talks to Kenji only when there is no pill
{const H=read('components/TrainRideHud.tsx'),Tn=read('components/Town.tsx');assert(/data-train-exit/.test(H)&&/Doors opening…/.test(H),'the HUD pill');
 assert(/trainButtons\(trainCanGetOff,trainMoved,trainStanding,trainNearSeat,trainNearDoor,trainExitTo\)/.test(Tn),'Town passes the pill station');
 assert(/!trainRideStore\.get\(\)\.exitTo\)\{/.test(Tn),'E gets off (not Talk) while the pill shows');}
console.log('train-rideux exit: ok');
// 2. the HUD while riding: no fuel readout, no settings gear, no Paths button (its spot kept for the camera button); coins stay
{const Tn=read('components/Town.tsx'),G=read('app/globals.css');
 assert(/data-train-riding=\{trainRiding\?'':undefined\} className=\{'town-app'/.test(Tn),'the town-app carries data-train-riding while riding');
 assert(/\.town-app\[data-train-riding\] \[data-job-wallet\] \[data-fuel\]\{display:none\}/.test(G),'no fuel readout');
 assert(/\.town-app\[data-train-riding\] nav\[data-hud-triggers\]>button\[data-tour=quests\]\{visibility:hidden/.test(G),'no Paths button (spot kept)');
 assert(/\.town-app\[data-train-riding\] nav\[data-hud-triggers\]>button\[aria-label=Settings\]\{display:none\}/.test(G),'no settings gear');
 assert(!/data-train-riding\][^{]*\[data-job-wallet\]\{/.test(G),'the coins stay');
 assert(/data-tour="quests" aria-label=\{`Paths/.test(read('components/IslandSettings.tsx')),'the pink lightning is the Paths button');}
console.log('train-rideux hud: ok');
// 3. camera views: the button / C cycles Seat → Front → Back → Left → Right → Above → Inside; Inside stands you up (the cutaway,
//    the wall facing the camera lowered), any other view sits you back down; each change eases (VIEW_EASE) and toasts; per-view limits
{Object.assign(states[1],{at:north,doors:1,dwellLeft:10,s:100});const ride2=R.createTrainRide({run:()=>run,place:()=>{},seat:()=>{},taken:()=>false,cue:()=>{},loadQuiz:async()=>[],pay:()=>{}});
 run.roofCut=new Uint8Array(3);run.cutDir=new Float32Array(2);
 ride2.want(sp.x,sp.z,sp.y,true);assert(ride2.board());for(let i=0;i<40&&ride2.walking>=0;i++)ride2.frame(1/30,false);
 Object.assign(states[1],{at:-1,doors:0,dwellLeft:0,next:west,t:S.TRAIN_STOPS[west].arrive-40});
 const cam=new T.PerspectiveCamera(50,16/9,.1,2000);const step=(n=1)=>{for(let i=0;i<n;i++){ride2.frame(1/30,false);ride2.applyCamera(cam,1/30,false);}};step(20);
 assert.equal(R.trainKeyAction('KeyC','c'),'camera','C changes the camera');assert.equal(ride2.view,'seat','boarding: the seat view');
 const seen=[];let n0=R.trainRideStore.get().viewNo;
 for(let i=0;i<R.TRAIN_VIEWS.length-1;i++){ride2.press('camera','tap');assert(ride2.viewEase<1||ride2.view==='inside','the change eases');step(Math.ceil(R.VIEW_EASE*30)+40);seen.push(ride2.view);
  assert(R.trainRideStore.get().viewNo>n0,'a toast for each change');n0=R.trainRideStore.get().viewNo;
  if(ride2.view!=='inside'&&ride2.view!=='seat'){const look=new T.Vector3(0,0,-1).applyQuaternion(cam.quaternion);assert(Number.isFinite(cam.position.x)&&Math.abs(look.length()-1)<1e-6,`${ride2.view}: a camera`);}}
 assert.deepEqual(seen,['front','back','left','right','above','inside'],'the cycle order');
 assert(ride2.standing,'Inside: standing in the aisle');assert.equal(run.roofCut[1],1,'the cutaway is on');assert(Math.hypot(run.cutDir[0],run.cutDir[1])>.99,'the wall facing the camera is lowered');
 // the Inside camera: ~41° down from one side of the car, square to the aisle (the arcade / museum framing), never first person
 {const d=new T.Vector3(0,0,-1).applyQuaternion(cam.quaternion),pitch=Math.asin(-d.y);assert(pitch>.55&&pitch<.95,`Inside: looking down ~41° (${pitch.toFixed(2)})`);
  const along=Math.abs(d.z)/Math.hypot(d.x,d.z);assert(along<.3,`Inside: square to the car (along ${along.toFixed(2)})`);
  const me=ride2.wire();assert(Math.hypot(cam.position.x-me.x,cam.position.z-me.z)>4,'Inside: third person, off to the side');}
 ride2.press('camera','tap');step(60);assert.equal(ride2.view,'seat','back round to the seat view');assert(!ride2.standing,'any other view sits you down');
 step(60);assert.equal(run.roofCut[1],0,'seated: no cutaway');
 // Walk (the cluster's 'extra' slot) is the Inside view
 ride2.press('walk','tap');step(20);assert(ride2.standing&&ride2.view==='inside','Walk → the Inside view');
 assert(ride2.setView('left'),'pick Left from the menu');step(60);assert(!ride2.standing&&ride2.view==='left','picking Left sits you down');
 // per-view limits: the side views turn at most OUTSIDE.left.yaw; zoom within its range
 for(let i=0;i<200;i++)ride2.holdPlayer(1,0);step(120);ride2.holdPlayer(0,0);
 ride2.press('recenter','tap');step(90);assert.equal(R.trainRideStore.get().moved,false,'Recenter: back to the view default');
 ride2.dispose();}
{const H=read('components/TrainRideHud.tsx'),Tn=read('components/Town.tsx');assert(/data-train-cam\b/.test(H)&&/role="menu"/.test(H)&&/HOLD_MS/.test(H)&&/data-train-cam-toast/.test(H),'the camera button, its hold menu and toast');
 assert(/trainRideActions\.view=v=>\{if\(trainRide\.setView\(v\)\)wakeLoop\(\);\}/.test(Tn),'Town: the menu picks a view');
 const C=read('components/TrainRideHud.module.css'),J=read('components/LiveJoinHud.module.css');const face=/border:3px solid #fff2cd;border-radius:50%;background:var\(--island-control-face,#f4cc7c\)/;assert(face.test(C)&&face.test(J),'the live-join camera button look');
 const tv=read('lib/graphics/trafficVehicles.ts');assert(/transformed\.x\*fiS>\$\{CUT_WALL_X/.test(tv),'the low wall in the vehicle shader');
 const rn=read('lib/town/trainRunning.ts');assert(/glass\.car\(m4,cutS\)/.test(rn)&&/if\(low\)dm\.multiply\(lowLeaf\)/.test(rn),'panes and door leaves on the cut side');}
console.log('train-rideux camera: ok');
// 4. near-camera fade: a body the camera is within FADE_NEAR m of is hidden, shown again past FADE_FAR (hysteresis); Town applies it
//    to me and Conductor Kenji while riding, after the camera, before the render
{assert(R.FADE_NEAR>=.6&&R.FADE_FAR<=1.2&&R.FADE_NEAR<R.FADE_FAR,'0.6 … 1.2 m');
 assert.equal(R.bodyDist(0,1,0,0,0,0),0,'inside the body');assert(Math.abs(R.bodyDist(0,3,0,0,0,0)-(3-1.35))<1e-9,'over the head');assert(Math.abs(R.bodyDist(.9,.8,0,0,0,0)-.9)<1e-9,'beside it');
 assert(R.nearHide(false,.5)&&!R.nearHide(false,.9)&&R.nearHide(true,.9)&&!R.nearHide(true,1.3),'hysteresis');
 const Tn=read('components/Town.tsx');const i=Tn.indexOf('meNearHid=nearHide(meNearHid'),j=Tn.indexOf('renderer.render(scene,camera)');
 assert(i>0&&j>i&&/if\(meNearHid\)player\.root\.visible=false/.test(Tn)&&/if\(kenjiNearHid\)kr\.visible=false/.test(Tn),'Town hides me / Kenji near the camera before the render');}
console.log('train-rideux fade: ok');
// 5. the side shot on a station's platform side rises over the station house (a little extra elevation) instead of pulling in
{const C=L('lib/town/trainCamClear.ts'),TL=L('lib/town/trainLayout.ts'),V=L('lib/town/venues.ts'),lay=TL.trainLayout().profile;
 for(const st of tt.TRAIN_STATIONS){const nose=st.s+S.TRAIN_LENGTH/2,o=R.OUTSIDE[st.side>0?'left':'right'],sl=tt.wrapS(nose-o.at),c=tt.trackAt(sl),hy=tt.bedAt(lay,sl)+o.lh,ca=Math.cos(o.az),sa=Math.sin(o.az);
  let got=-1;for(let x=0;x<=1.2;x+=.1){const e2=o.el+x,ce=Math.cos(e2)*o.dist;if(C.camClearFraction(c.x,hy,c.z,c.x+(ca*c.tx+sa*c.tz)*ce,hy+Math.sin(e2)*o.dist,c.z+(ca*c.tz-sa*c.tx)*ce,V.fieldSurfaceHeight)>=1){got=x;break;}}
  assert(got>=0&&got<=.6,`${st.id}: the platform-side shot clears the station house with ${got.toFixed(1)} rad more elevation`);}
 assert(/liftWant=x;break;/.test(read('lib/town/trainRide.ts')),'the outside camera rises over a station roof');}
console.log('train-rideux station side: ok');
