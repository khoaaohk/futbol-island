// Rounded vehicles + boats rocking in place (Nov 26 2026; lib/graphics/vehicleSwitch.ts, `?vehicles=0` = before). Node = ON.
// The ferry's rounded body holds the old walkable deck and stays one mesh; the deep-sea boats rock with the far swell and the WHOLE
// deck follows (heightAt), within limits; the water ring is gated to the moving-water path; the street cars stay under their caps.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createLoader}=require('./summit-harness.cjs');const load=createLoader();const T=require('three');
const src=f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const F=load('lib/town/ferryModel.ts'),FB=load('lib/town/ferryBoarding.ts'),S=load('lib/graphics/boatSwell.ts'),V=load('lib/graphics/trafficVehicles.ts');
ok('ferry: the rounded hull contains the old walkable deck (inside the rails) and its foam collar sits on the water',()=>{
 const D=FB.FERRY_DECK;for(let z=-D.d/2+.5;z<=D.d/2-.5;z+=.25)assert(F.ferryHalfBeam(z)>=3.94,`half-beam ${F.ferryHalfBeam(z).toFixed(2)} at z ${z}`);
 const g=F.buildFerryGeometry(),p=g.getAttribute('position'),f=g.getAttribute('foam'),n=p.count/3;assert(n<2200,`${n} triangles`);
 let foam=0;for(let i=0;i<p.count;i++)if(f.getX(i)>.5){foam++;assert(Math.abs(p.getY(i)+.43)<1e-6);}assert(foam>0);
 let deck=false;for(let i=0;i<p.count;i++)if(Math.abs(p.getY(i)-D.height)<1e-6)deck=true;assert(deck,'deck top at the walk height');
 const w=src('lib/town/world.ts');assert(/new T\.Mesh\(buildFerryGeometry\(\),fm\)/.test(w)&&/if\(!ferryRound\)box\(w,\.07,d/.test(w),'one body mesh; the old rail boxes only with the switch off');});
ok('swell pose: bounded, its own phase per boat, moored much less, no allocation',()=>{
 const o={heave:0,pitch:0,roll:0};let mx={heave:0,pitch:0,roll:0},mm={heave:0,pitch:0,roll:0};
 for(let t=0;t<60;t+=.1){S.swellPose(335,-5,t,Math.PI/2,S.SWELL_AMP.sea,o);for(const k in mx)mx[k]=Math.max(mx[k],Math.abs(o[k]));S.swellPose(246,199,t,Math.PI/2,S.SWELL_AMP.moored,o);for(const k in mm)mm[k]=Math.max(mm[k],Math.abs(o[k]));}
 assert(mx.heave>.05&&mx.heave<=.071&&mx.roll>.015&&mx.roll<=.045&&mx.pitch<=.019,JSON.stringify(mx));
 assert(mm.heave<=mx.heave*.51&&mm.roll<=mx.roll*.35,JSON.stringify(mm));
 const a=S.swellPose(335,-5,10,Math.PI/2,S.SWELL_AMP.sea,{heave:0,pitch:0,roll:0}).heave,b=S.swellPose(385,185,10,Math.PI/2,S.SWELL_AMP.sea,{heave:0,pitch:0,roll:0}).heave;assert(Math.abs(a-b)>1e-3,'different phase');
 const body=src('lib/graphics/boatSwell.ts');const fn=body.slice(body.indexOf('export function swellPose'),body.indexOf('export const BOAT_RING_SLOTS'));assert(!/new |\[|\{\.\.\./.test(fn.replace(/\/\/.*$/gm,'').replace(/SWELL_K\[\d\]/g,'')),'no allocation');});
ok('deep-sea boat: rocks with the swell inside ROCK_LIMITS, the whole deck follows the pose, reduced motion = the small heave only',()=>{
 const G=load('lib/town/fishing/deepSeaBoat.ts'),Dd=load('lib/town/fishing/deepSeaBoatData.ts'),LD=load('lib/town/landableDecks.ts'),W=load('lib/graphics/waterSurface.ts');
 const b=Dd.DEEP_SEA_BOATS[0],scene=new T.Scene(),camera=new T.PerspectiveCamera(50,1,.1,1000);camera.position.set(b.mooring.x,20,b.mooring.z+25);camera.lookAt(b.mooring.x,0,b.mooring.z);camera.updateMatrixWorld();
 const boat=G.createDeepSeaBoat(scene,b);let maxRoll=0,maxPitch=0,maxHeave=0,spread=0;
 for(let i=0;i<900;i++){W.WATER_UNIFORMS.uWaterTime.value=i/30;boat.update({x:b.mooring.x,z:b.mooring.z+10,camera,elapsed:i/30,reduced:false,dt:1/30});const m=boat.motion;
  maxRoll=Math.max(maxRoll,Math.abs(m.roll));maxPitch=Math.max(maxPitch,Math.abs(m.pitch));maxHeave=Math.max(maxHeave,Math.abs(m.heave));
  assert(Math.abs(m.heave)<=G.ROCK_LIMITS.heave+1e-9&&Math.abs(m.roll)<=G.ROCK_LIMITS.tilt+1e-9&&Math.abs(m.pitch)<=G.ROCK_LIMITS.tilt+1e-9);
  const p1=b.toWorld(-4.5,1.2),p2=b.toWorld(-.4,-1.2),h1=LD.landableDeckHeight(p1.x,p1.z),h2=LD.landableDeckHeight(p2.x,p2.z);
  const want=(lx,lz)=>b.deckY+m.heave+lx*m.pitch-lz*m.roll;assert(Math.abs(h1-want(-4.5,1.2))<1e-9&&Math.abs(h2-want(-.4,-1.2))<1e-9);spread=Math.max(spread,Math.abs(h1-h2));}
 assert(maxRoll>.02&&maxHeave>.06,`visible rocking: roll ${(maxRoll*57.3).toFixed(1)} deg, heave ${maxHeave.toFixed(3)} m`);assert(spread>.05,'the deck tilts under the feet: '+spread.toFixed(3));
 for(let i=0;i<300;i++){W.WATER_UNIFORMS.uWaterTime.value=i/30;boat.update({x:b.mooring.x,z:b.mooring.z+10,camera,elapsed:i/30,reduced:true,dt:1/30});}
 assert(boat.motion.roll===0&&boat.motion.pitch===0&&Math.abs(boat.motion.heave)<=.013,'reduced motion: no rocking');
 assert.equal(S.BOAT_RING_UNIFORMS.uBoatRingS.value[1].z,1,'its water ring is lit while built');boat.dispose();assert.equal(S.BOAT_RING_UNIFORMS.uBoatRingS.value[1].z,0,'and off when dropped');});
ok('water ring: gated to the moving-water path (Battery saver / low heat tiers / reduced motion drop it), compiled only with the switch on',()=>{
 assert(/^\s*if\(uWaterDetail>\.5\)/.test(S.BOAT_RING_GLSL.trimStart())&&S.BOAT_RING_SLOTS===3);
 const w=src('lib/graphics/waterSurface.ts');assert(/\$\{rings\?BOAT_RING_GLSL:''\}/.test(w)&&/\(rings\?'-rings':''\)/.test(w));});
ok('street vehicles: rounded and still under their caps (one mesh, one material each: unchanged)',()=>{
 for(const s of ['sedan','hatch','taxi','wagon','van','jeep']){const n=V.triangleCount(V.buildVehicleGeometry(s,'#bb6857'));assert(n<=V.ROUND_TRIANGLES.car&&n>V.OLD_TRIANGLES.car-120,s+' '+n);}
 for(const v of [0,1]){const n=V.triangleCount(V.buildVehicleGeometry('pickup','#bb6857',{variant:v}));assert(n<=V.ROUND_TRIANGLES.pickup,'pickup '+n);}});
if(failed){console.log(failed+' failed');process.exit(1);}console.log('vehicles-round: 5 checks passed');
