// Island Line AAA audit 2 (Nov 24 2026; owner: "buggy and jittery", shots 51-55). Run: node tests/train-aaa2.cjs
//  1. ONE train clock per frame (trainSchedule trainFrameClock): the frame's timestamp, the same value for every caller that frame,
//     small corrections slewed (≤ 10 % of real time), big jumps snapped; Town feeds it to the trains, riders, friends, Kenji, passengers
//  2. the roof camera follows in the train's frame, re-placed after the trains move; no landing dust on a roof
//  3. first person turns: drag (canvas), ← / → keys; on phones the left half walks (the stick), the right half looks
//  4. the Driver's view after Seat; the cab partition is mostly glass (two big panes in the shared glass mesh)
const assert=require('node:assert/strict');
const {L,read}=require('./lib/tsLoad.cjs');
const S=L('lib/town/trainSchedule.ts');
{const a=S.trainFrameClock(1000),b=S.trainFrameClock(1000);assert.equal(a,b,'one value per frame timestamp');
 const c=S.trainFrameClock(1016.667);assert(Math.abs(c-a-.016667)<.003,'advances with the frame timestamps ('+(c-a).toFixed(4)+' s)');
 let last=c,steps=[];for(let i=2;i<200;i++){const t=S.trainFrameClock(1000+i*16.667);steps.push(t-last);last=t;}
 const mn=Math.min(...steps),mx=Math.max(...steps);assert(mn>.0149&&mx<.0184,'steady steps at 60 Hz: '+mn.toFixed(4)+'…'+mx.toFixed(4)+' s');}
const town=read('components/Town.tsx');
assert(/const ms=now-last;last=now;trainNowSec=trainFrameClock\(now\);/.test(town),'Town: the frame clock at the rAF timestamp');
assert(/trainFrame\.nowSec=trainNowSec===trainNowSec\?trainNowSec:undefined;/.test(town),'the trains run on it');
assert(/run\.seatPose\(k,j,p,trainNowSec===trainNowSec\?trainNowSec:trainClockSec\(\)\)/.test(town),'friends in their seats: the same clock (no shake against the car)');
assert(/kenjiFig\.update\(world\.trainRun\?\?null,camera,trainRide\.train,trainFrame\.dt,\(trainNowSec===trainNowSec\?trainNowSec:trainClockSec\(\)\)/.test(town),'Kenji: the same clock');
assert(/if\(roofCam\.on\)\{camera\.position\.set\(location\.x\+roofCam\.x,rooftop\.state\.height\+roofCam\.y,location\.z\+roofCam\.z\)/.test(town),'roof camera: re-placed from this frame\'s car');
assert(/landImpact>0&&!trainRide\.active&&roofRide\.k<0&&!roofRide\.hop/.test(town),'no landing dust on a moving roof (owner shot 54)');
console.log('train-aaa2 clock + roof: ok');
const R=L('lib/town/trainRide.ts'),ride=read('lib/town/trainRide.ts');
assert.deepEqual([...R.TRAIN_VIEWS],['seat','driver','front','back','left','right','above','inside'],'the Driver\'s view after Seat');assert.equal(R.TRAIN_VIEW_LABEL.driver,"Driver's view");
assert(R.DRIVER.yaw<=.62&&R.DRIVER.pitch<=.27,'a small look round (±35° / ±15°)');
assert(/keyYaw=turn\*FP_KEY_TURN\/ORBIT\.keyYaw/.test(ride)&&/keys\.has\('arrowright'\)\?1:0\)-\(keys\.has\('arrowleft'\)/.test(ride),'first person: ← / → turn (owner shot 51)');
assert(/standing&&e\.pointerType==='touch'&&e\.clientX<window\.innerWidth\*\.5/.test(ride),'phones, first person: the left half is the stick\'s');
assert(/if\(trainRideStore\.get\(\)\.standing\)zone\.right=Math\.min\(zone\.right,innerWidth\*\.5\)/.test(town),'…and the stick keeps to it');
console.log('train-aaa2 views + look: ok');
const CM=L('lib/town/trainCarModel.ts'),cm=read('lib/town/trainCarModel.ts');
{const m=cm.match(/const PART_WINS:readonly Hole\[\]=(\[[^;]+\]);/);assert(m,'the partition panes');const P=eval(m[1]);
 const w=P.reduce((a,h)=>a+h.z1-h.z0,0),hgt=P[0].y1-P[0].y0;assert(P.length===2&&w>2.2&&hgt>.85,'mostly glass: '+w.toFixed(2)+' m wide, '+hgt.toFixed(2)+' m tall (owner shot 53)');
 assert(P[1].z0-P[0].z1<=.12,'a narrow centre pillar');assert(/\.\.\.PART_WINS\.map\(h=>paneM\(/.test(cm),'in the shared glass mesh (no new draw)');}
console.log('train-aaa2 cab glass: ok');
