// Floating props + the west terrace wall face (polish Nov 27 2026).
// 1. Owner shot 196 (the marker buoys "sit rigid and flat"): coinHunt.ts floats every buoy on the boats' swell (boatSwell.ts
//    swellPose with BUOY_SWELL): a visible heave / roll, each buoy its own phase, still for reduced motion, the ball rides its buoy,
//    sat lower so the waterline cuts the float, and the boats' foam ring (slot BUOY_RING_SLOT) lit round the nearest one, gated to
//    the moving-water path like the boats'. The pond's lily pads keep their drift + bob (pondWater.ts).
// 2. Owner shots 193 / 200 (the terrace wall "has no base"): softBox.ts puffRun winds every run outward whichever way it runs, so the
//    west terrace wall's long face looks out over the lawn and reaches into the ground (it was culled, a slab hung in the air).
// usage: node tests/floating-props.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createLoader}=require('./summit-harness.cjs');const load=createLoader();const T=require('three');
const src=f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const S=load('lib/graphics/boatSwell.ts');
ok('buoy swell: visible heave and roll, own phase per spot, bounded',()=>{
 const pose={heave:0,pitch:0,roll:0};let hMax=0,rMax=0,pMax=0;const a=[],b=[];
 for(let i=0;i<400;i++){const t=i*.05;S.swellPose(600,-60,t,0,S.BUOY_SWELL,pose);hMax=Math.max(hMax,Math.abs(pose.heave));rMax=Math.max(rMax,Math.abs(pose.roll));pMax=Math.max(pMax,Math.abs(pose.pitch));a.push(pose.heave);
  S.swellPose(476,60,t,0,S.BUOY_SWELL,pose);b.push(pose.heave);}
 assert(hMax>.06&&hMax<=.1,'heave '+hMax.toFixed(3));assert(rMax>.03&&rMax<=.1&&pMax<=.08,`roll ${rMax.toFixed(3)} pitch ${pMax.toFixed(3)} rad`);
 assert(a.some((v,i)=>Math.abs(v-b[i])>.03),'two buoys are not in step');
 assert.equal(S.BOAT_RING_SLOTS,4);assert.equal(S.BUOY_RING_SLOT,3);});
ok('coinHunt: buoys float (own packed draw each), sit lower, the ball rides along, reduced motion still, the ring follows the nearest',()=>{
 const c=src('lib/graphics/coinHunt.ts');
 assert(/function floatBuoys\(/.test(c)&&/floatBuoys\(p,reduced\)/.test(c),'called from update');
 assert(/swellPose\(b\.x,b\.z,t,0,BUOY_SWELL,buoyPose\)/.test(c),'the boats swell, closed form, its own spot');
 assert(/if\(reduced\)\{b\.g\.position\.y=-BUOY_SINK;b\.g\.rotation\.set\(0,0,0\)/.test(c),'still for reduced motion');
 assert(/BUOY_SINK=\.12/.test(c)&&/g\.position\.set\(s\.x,-BUOY_SINK,s\.z\)/.test(c),'sits lower in the water');
 assert(/s\.buoy\?\(buoyHeave\.get\(s\.id\)\?\?0\)-BUOY_SINK/.test(c),'its ball rides with it');
 assert(/setBoatRing\(BUOY_RING_SLOT,buoys\[best\]\.x,buoys\[best\]\.z/.test(c)&&/setBoatRing\(BUOY_RING_SLOT,0,0,0,\.62,\.62,0\)/.test(c),'ring on the nearest, off when none / hunt off');
 assert(/^\s*if\(uWaterDetail>\.5\)/.test(S.BOAT_RING_GLSL.trimStart()),'the ring is off on the still path (Battery saver, hot tiers, reduced motion)');});
ok('pond lily pads drift and bob on the water clock',()=>{const p=src('lib/graphics/pondWater.ts');assert(/transformed\.xz\+=vec2\(sin\(t\*\.19\+aPad\)/.test(p)&&/transformed\.y\+=sin\(t\*1\.1/.test(p));});
ok('puffRun faces look out whichever way a run goes (crown up, outer face away from the body)',()=>{
 const B=load('lib/graphics/softBox.ts');
 for(const dir of [[1,0],[-1,0],[0,1],[0,-1],[.6,.8]]){const pts=[0,1,2,3].map(i=>({x:dir[0]*i*1.5,z:dir[1]*i*1.5,top:4.4,foot:-.5}));
  const run=B.puffRun(pts,{half:.42,shift:-.42,lip:.13,capH:.3,dome:.04,belly:.05,back:.4,courses:5});const g=run[0].geo,P=g.getAttribute('position'),ix=g.index;
  let up=0,down=0;const A=new T.Vector3(),Bv=new T.Vector3(),C=new T.Vector3(),n=new T.Vector3();
  for(let i=0;i<ix.count;i+=3){A.fromBufferAttribute(P,ix.getX(i));Bv.fromBufferAttribute(P,ix.getX(i+1));C.fromBufferAttribute(P,ix.getX(i+2));n.subVectors(Bv,A).cross(C.clone().sub(A));
   const cy=(A.y+Bv.y+C.y)/3;if(cy>4.35&&n.length()>1e-6){if(n.y>0)up++;else down++;}}
  assert(up>0&&down===0,`run ${dir}: crown triangles facing up ${up}, down ${down}`);}});
ok('west terrace wall: the face reaches 0.5 m into the lawn along the whole tall run; still inside the west triangle cap (tests/west-stadium.cjs)',()=>{
 const W=load('lib/town/westTerrain.ts'),E=load('lib/town/westElevation.ts');if(!load('lib/town/elevation.ts').elevationOn())return;
 const meshes=[];W.buildWestWalls({put:(g,c,x,y,z)=>{const m=new T.Mesh(g);m.position.set(x,y,z);meshes.push(m);return m;},obstacles:[]});
 // sample the ring 0.3 m outside the terrace: under every tall wall point some wall geometry reaches below the natural ground
 const o=E.terraceOutline(1.5),C=E.WEST_TERRACE;let tall=0,bad=0;
 for(const p of o){const d=Math.hypot(p.x-C.x,p.z-C.z)||1,gx=p.x+(p.x-C.x)/d*.3,gz=p.z+(p.z-C.z)/d*.3,g=E.westNatural(gx,gz);if(E.WEST.terrace-g<1.4||E.onWestStair(p.x,p.z,1.5))continue;tall++;
  let low=Infinity;for(const m of meshes){const P=m.geometry.getAttribute('position');for(let i=0;i<P.count;i++){const x=P.getX(i)+m.position.x,z=P.getZ(i)+m.position.z;if(Math.hypot(x-p.x,z-p.z)<1.6)low=Math.min(low,P.getY(i)+m.position.y);}}
  if(!(low<=g-.2))bad++;}
 assert(tall>40&&bad===0,`${bad} of ${tall} tall wall points have no face down into the lawn`);});
if(failed){console.log(failed+' failed');process.exit(1);}console.log('floating props + terrace wall face: ok');
