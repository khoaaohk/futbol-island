// Island Line roof riding + the train bonk (owner, Nov 24 2026). Run: node tests/train-roof.cjs
//  1. trainRoof (pure): the roof profile, the walk clamped to the roof, the roof units solid, the gap stepped over, the portal bump
//  2. trainRunning.roofAt: a point over a moving car's roof is found, train-relative; the pose moves with the train at speed
//  3. trainBonk: the throw lands on its spot, lines rotate without repeats (scanning lines in every pool), the line cooldown, the tip once
//  4. wiring: Town attaches from falls / the jetpack / Land, the tunnel bonk, the landing ring over roofs, never waits (no hold)
const assert=require('node:assert/strict');
const {L,read}=require('./lib/tsLoad.cjs');
const R=L('lib/town/trainRoof.ts'),B=L('lib/town/trainBonk.ts'),tt=L('lib/town/trainTrack.ts');
{assert(Math.abs(R.roofY(0)-3.75)<1e-9&&R.roofY(.9)<3.75&&R.roofY(.9)>3.6,'roof profile');
 assert(R.roofStandable(0,4.5)&&!R.roofStandable(0,-2.7)&&!R.roofStandable(0,1.7)&&!R.roofStandable(0,-.5),'AC units and the pantograph are solid');
 assert(!R.roofStandable(1.2,3),'not past the roof edge');assert(R.roofStandable(0,-6.2),'the gap between the cars is stepped over');
 const p={x:0,u:5};for(let i=0;i<200;i++)R.roofStep(p,0,-.05);assert(p.u>2.52,'walking back stops at the AC lid');
 const q={x:.85,u:5};for(let i=0;i<600;i++)R.roofStep(q,0,-.05);assert(q.u<-17,'beside the units (|x| .85) the whole train is walkable');
 for(let i=0;i<100;i++)R.roofStep(q,.05,0);assert(Math.abs(q.x-R.ROOF_HALF)<1e-9,'clamped to the roof edge');
 const s={x:0,u:-2.6};R.roofSettle(s);assert(R.roofStandable(s.x,s.u),'a landing on a roof unit slides off it');
 const w=tt.TUNNEL.west.s;assert(R.roofHitsPortal(w+6-.5,0)&&!R.roofHitsPortal(w-10,0),'bonked just short of the west portal');}
{const b=B.createTrainBonk(7),o={x:0,y:0,z:0};const line=b.start('tunnel',0,5,0,4,0,-1,0,false);assert(line&&B.bonkPool('tunnel').includes(line),'a tunnel line');
 let ph,n=0;do{ph=b.step(1/60,o);n++;}while(ph==='flying'&&n<500);assert.equal(ph,'landed');assert(Math.abs(o.x-4)<1e-6&&Math.abs(o.y)<1e-6&&Math.abs(o.z+1)<1e-6,'lands on the spot');
 assert.equal(b.start('track',0,0,0,3,0,0,0,false),null,'inside the cooldown: no line (still thrown)');while(b.step(1/60,o)!=='idle');
 for(let i=0;i<300;i++)b.step(1/60,o);assert(b.start('track',0,0,0,3,0,0,0,true),'a line after the cooldown');assert(b.pose().flip===0,'reduced motion: no flip');
 const L2=B.createBonkLines(3),seen=new Set(),pool=B.bonkPool('track');let last='';for(let i=0;i<pool.length;i++){const l=L2.next('track');assert.notEqual(l,last);seen.add(l);last=l;}
 assert.equal(seen.size,pool.length,'every line once before a repeat');assert(B.SCAN_LINES.every(l=>B.bonkPool('side').includes(l)),'scanning lines in every pool');
 const t=B.createTrainBonk(1);assert(t.tip('tunnel')&&!t.tip('tunnel'),'the safety tip once');}
{const Tn=read('components/Town.tsx'),Rn=read('lib/town/trainRunning.ts');
 assert(/runner\.step\(i,now,dt,NaN,st,/.test(Rn),'trains never hold for people');
 assert(/roofHitsPortal\(st\.s,roofRide\.u\)/.test(Tn)&&/startBonk\('tunnel'/.test(Tn),'the tunnel bonk');
 assert(/roofAt\(location\.x,location\.z,roofO,\.15\)/.test(Tn),'falls land on roofs');assert(/roofLanding=roofO\.k/.test(Tn),'Land over a roof');
 assert(/landingPreview=roofPreview/.test(Tn),'the landing ring over a roof');}
console.log('train-roof pure: ok');
(async()=>{const {loadIslandWorld}=require('../scripts/island-world-load.cjs');const {T,L:LW}=await loadIslandWorld(require('node:path').join(__dirname,'..'));
 const scene=new T.Scene(),w=LW('lib/town/world.ts').buildTown(scene),run=w.trainRun,S=LW('lib/town/trainSchedule.ts'),R2=LW('lib/town/trainRoof.ts');
 const cam=new T.PerspectiveCamera(50,1,.1,2000);const now=S.trainClockSec();let k=-1;for(let i=0;i<3;i++){const x=S.trainAt(i,now);if(x.at<0&&x.v>8)k=i;}
 if(k<0){console.log('train-roof live: skipped (no train at speed now)');return;}
 const m=new T.Matrix4(),o={k:-1,x:0,u:0,y:0},p={x:0,y:0,z:0,yaw:0,lean:0};let t=now;
 const step=()=>{t+=1/30;const q=tt.trackAt(run.states[k].s);cam.position.set(q.x+20,30,q.z+20);cam.lookAt(q.x,0,q.z);cam.updateMatrixWorld();run.update({dt:1/30,camera:cam,player:{x:p.x,y:p.y,z:p.z},nowSec:t,onRoof:true});};
 step();run.carMatrixOf(k,0,m);const e=m.elements;assert(run.roofAt(e[12]+e[8]*4,e[14]+e[10]*4,o)&&o.k===k&&Math.abs(o.u-4)<.05&&Math.abs(o.x)<.05,'roofAt finds car 0, 4 m ahead of its middle');
 assert(Math.abs(o.y-(e[13]+3.75))<.08,'at roof height');assert(!run.roofAt(e[12]+e[0]*2,e[14]+e[2]*2,o),'beside the car: no roof');
 let maxJump=0,prev=null;for(let i=0;i<60;i++){step();run.standAt(k,.3,4,0,p,undefined,R2.roofY(.3));run.roofAt(p.x,p.z,o);assert(o.k===k&&Math.abs(o.u-4)<.05,'still on the same roof spot');if(prev)maxJump=Math.max(maxJump,Math.abs(Math.hypot(p.x-prev.x,p.z-prev.z)-run.states[k].v/30));prev={x:p.x,z:p.z};}
 assert(maxJump<.05,`moves with the train, no jitter (${maxJump.toFixed(3)} m)`);
 const r=run.update({dt:1/30,camera:cam,player:{x:p.x,y:p.y,z:p.z},nowSec:t+1/30,onRoof:true});assert(!r.knock&&!r.nudgeX,'a roof rider is never knocked or pushed');
 console.log('train-roof live: ok');})().catch(e=>{console.error(e);process.exit(1);});
