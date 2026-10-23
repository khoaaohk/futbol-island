// Ride ground contact (owner, Oct 23 2026: "can we also fix these. looks like it's going into the ground too much"): the bike, scooter and moped
// tyres touch the ground and never sink into it, at rest, in every frame of the 15 ride emotes and in every frame of the ride tricks, for every
// ride variant (scripts/check-ride-ground.cjs builds the real meshes); plus the pure math (lib/town/rideGround.ts) and the wiring.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {measure,load}=require('../scripts/check-ride-ground.cjs');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const MAX_SINK=.02;
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};

t('meshes: no tyre goes more than 2 cm under the ground (idle, every emote frame, every trick frame, every variant)',()=>{
 const rows=measure(),worst={};
 for(const r of rows){assert(r.y>=-MAX_SINK,`${r.mode} ${r.variant} ${r.what} frame ${r.frame}: tyre ${(r.y*100).toFixed(1)} cm into the ground`);if(!worst[r.mode]||r.y<worst[r.mode].y)worst[r.mode]=r;}
 for(const m of ['scooter','bike','moped'])assert(rows.some(r=>r.mode===m&&r.what==='idle'),m);
 assert(rows.filter(r=>r.what.startsWith('emote')).length>30*4*100,'every emote frame measured');
 for(const r of rows.filter(r=>r.what==='idle'))assert(Math.abs(r.y)<.005,`${r.mode} ${r.variant} rests on the ground (${r.y.toFixed(3)})`);
 console.log('  worst tyre:',Object.values(worst).map(r=>`${r.mode} ${(r.y*100).toFixed(2)} cm`).join(', '));
});

t('math: rideGroundLift puts the lowest tyre point exactly on the ground; pitch about the axle keeps that axle in place',()=>{
 const G=load('lib/town/rideGround.ts'),R=load('lib/town/rideEmotes.ts');
 for(const ride of ['scooter','bike','moped'])for(const pitch of [-.9,-.4,0,.3,.7])for(const roll of [0,.2,-.4]){
  const lift=G.rideGroundLift(ride,pitch,roll);assert(lift>=0);assert(Math.abs(Math.min(0,G.rideWheelLow(ride,pitch,roll))+lift)<1e-9);
 }
 assert.equal(G.rideGroundLift('bike',0,0),0);
 const src=read('lib/town/rideEmotes.ts');for(const [ride,w] of Object.entries(G.RIDE_WHEELS))assert(src.includes(`${ride}: [${w.rear}, ${w.front}, ${w.radius}]`.replace(/0\./g,'.')),'rideEmotes AXLE matches RIDE_WHEELS for '+ride);
 const buf=new Float32Array(R.RT_CH),o={x:0,y:0,z:0},E=R.RIDE_EMOTE;
 for(const [emote,a,side] of [[E.BikeWheelie,1.5,-1],[E.BikeStoppie,1.3,1],[E.MopedWheelie,1,-1],[E.ScooterPivot,1.4,1]]){
  const sc=R.rideScriptFor(emote),p=R.sampleRideTrick(emote,a,buf),ride=sc.ride;
  assert(Math.abs(p[R.RT.PIVOT]-G.rideAxleZ(ride,side))<1e-6,sc.label+' pivots on its axle');assert(Math.abs(p[R.RT.PIVY]-G.rideAxleY(ride))<1e-6);
  // The axle (local y = PIVY, z = PIVOT) maps to itself under the pitch + root offset.
  const th=p[R.RT.PITCH],y=p[R.RT.PIVY],z=p[R.RT.PIVOT];R.trickRootOffset(p,0,o);
  assert(Math.abs(y*Math.cos(th)-z*Math.sin(th)+o.y-p[R.RT.LIFT]-y)<1e-6,sc.label+' axle height kept');
 }
});

t('wiring: emotes, tricks, friends and the landing squash keep the tyres up; no allocation in the per-frame math',()=>{
 const town=read('components/Town.tsx'),tricks=read('lib/town/rideTricks.ts'),emotes=read('lib/town/rideEmotes.ts'),ctx=read('lib/town/emoteContexts.ts'),ground=read('lib/town/rideGround.ts'),veh=read('lib/graphics/vehicle.ts');
 assert(!/vehicle\.root\.position\.y-=\.05\*sq/.test(town),'the landing squash does not drop the ride into the ground');
 assert(/vehicle\.root\.scale\.y\*=1-\.12\*sq;/.test(town),'it still squashes on its springs');
 assert(/pose\.lift=Math\.max\(pose\.lift,rideGroundLift\(mode,pose\.pitch,pose\.roll\)/.test(tricks),'ride tricks lift the lowered tyre');
 assert(/py \* \(1 - Math\.cos\(th\)\)/.test(emotes)&&/- py \* Math\.sin\(th\)/.test(emotes),'trickRootOffset turns about the axle');
 assert(/p\[RT\.PIVY\] \* \(1 - Math\.cos\(p\[RT\.PITCH\]\)\)/.test(ctx),'a friend\'s ride trick lifts about the axle too');
 assert(/TorusGeometry\(\.255,\.065,6,16\),rubber,0,\.32,z\)/.test(veh),'mountain tyre outer radius = the wheel radius');
 const body=ground.replace(/^\s*\/\/.*$/gm,'').replace(/export const RIDE_WHEELS[\s\S]*?\};/,'');assert(!/new |\[\s*[-\d.]/.test(body),'rideGround.ts allocates nothing per call');
});
console.log(`RIDE_GROUND_PASS: ${n} checks (tyres within ${MAX_SINK*100} cm of the ground for idle, all 30 emotes and the tricks, every variant)`);
