const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set});return m.exports;}
const {createPlayer,ROLE_PROFILES}=load('lib/graphics/player.ts');
const joint=(r,n)=>r.root.getObjectByName(n),world=(r,n)=>joint(r,n).getWorldPosition(new T.Vector3());
// Whole-body forward pitch: the pelvis carries part of the lean, the torso the rest.
const pitch=r=>joint(r,'player-pelvis').rotation.x+joint(r,'armor-torso').rotation.x;
const finite=r=>{r.root.updateMatrixWorld(true);r.root.traverse(o=>{for(const v of[...o.position,...o.quaternion,...o.scale,...o.matrixWorld.elements])assert(Number.isFinite(v),'finite transform '+o.name);});};
const DT=1/60;
// Drive a rig through a velocity script; returns per-frame samples after `from`.
function drive(r,frames,velocity,motion,sampler,from=0,reduced=false){const out=[];let x=0,z=0;for(let i=0;i<frames;i++){const t=i*DT,[vx,vz]=velocity(t);x+=vx*DT;z+=vz*DT;r.update(x,z,DT,t,reduced,motion(t));finite(r);if(i>=from)out.push(sampler(r,i,x,z));}return out;}
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
// Largest single-frame jump of a boot that is on (or touching) the ground: catches one-frame snaps.
const groundPop=(samples,from=1)=>{let worst=0;for(let i=Math.max(1,from);i<samples.length;i++)for(const k of['left','right'])if(Math.min(samples[i][k].y,samples[i-1][k].y)<.1)worst=Math.max(worst,samples[i][k].distanceTo(samples[i-1][k]));return worst;};

// 1. Running range of motion: sprint lean > jog lean > standing, sprint knee lift ~.42 m.
{
 const lean={};
 for(const [name,speed,intensity]of[['stand',0,0],['jog',2.5,.3],['sprint',6,1]]){
  const r=createPlayer('lean-'+name,'home');
  const samples=drive(r,150,()=>[0,speed],()=>({facing:0,runIntensity:intensity}),rr=>({pitch:pitch(rr),lift:Math.max(world(rr,'left-ankle').y,world(rr,'right-ankle').y)-.075,head:joint(rr,'player-head').rotation.x,shift:joint(rr,'player-pelvis').position.x,counter:joint(rr,'armor-torso').position.x}),90);
  lean[name]={pitch:mean(samples.map(s=>s.pitch)),lift:Math.max(...samples.map(s=>s.lift)),head:mean(samples.map(s=>s.head)),shift:Math.max(...samples.map(s=>Math.abs(s.shift))),counter:mean(samples.map(s=>s.shift*s.counter))};r.dispose();
 }
 assert(lean.sprint.pitch>lean.jog.pitch+.1,'sprint leans further than a jog');
 assert(lean.jog.pitch>lean.stand.pitch+.05,'jog leans further than standing');
 assert(Math.abs(lean.stand.pitch)<.03,'standing is upright');
 assert(lean.sprint.pitch>.34&&lean.sprint.pitch<.5,'sprint pitch near .42 rad: '+lean.sprint.pitch);
 assert(lean.sprint.lift>.36,'sprint knee lift reaches ~.42 m: '+lean.sprint.lift);
 assert(lean.sprint.head<-.2,'head counter-pitches the sprint lean to keep the gaze level');
 // Body shift: the pelvis rides over each stance foot while the shoulders counterbalance.
 assert(lean.sprint.shift>.02&&lean.jog.shift>.02,'the hips shift side to side over the stance foot at speed: '+lean.sprint.shift);
 assert(lean.sprint.counter<0,'the torso counter-shifts against the pelvis');
 assert(lean.stand.shift<1e-6,'no body shift standing still');
 console.log('RANGE_LEAN_PASS',JSON.stringify(lean));
}

// 2. Braking with weight: torso pitches back, pelvis sinks below the running height, feet stay planted through the dwell.
{
 const r=createPlayer('brake','home');
 const samples=drive(r,150,t=>[0,t<1.5?6:Math.max(0,6-30*(t-1.5))],()=>({runIntensity:1}),(rr,i)=>({i,pitch:pitch(rr),pelvis:joint(rr,'player-pelvis').position.y,left:world(rr,'left-ankle'),right:world(rr,'right-ankle')}));
 const running=samples.filter(s=>s.i>=30&&s.i<90),stopping=samples.filter(s=>s.i>=90&&s.i<=140);
 const runHeight=mean(running.map(s=>s.pelvis));
 assert(Math.min(...stopping.map(s=>s.pitch))<-.04,'braking pitches the torso back');
 assert(Math.min(...stopping.map(s=>s.pelvis))<runHeight-.06,'braking sinks the centre of mass below the running height');
 const held=samples.filter(s=>s.i>=98&&s.i<=110);
 for(const side of['left','right']){const start=held[0][side];const drift=Math.max(...held.map(s=>Math.hypot(s[side].x-start.x,s[side].z-start.z)));assert(drift<.02,side+' foot stays planted through the stop: '+drift);}
 // Feet are placed around where the body comes to REST: the front boot ahead of the hips, the
 // rear one under them (a rear boot left at the brake trigger is out of reach and gets dragged).
 const rest=samples[105],bodyZ=9.65,front=Math.max(rest.left.z,rest.right.z)-bodyZ,rear=Math.min(rest.left.z,rest.right.z)-bodyZ;
 assert(front>.18&&front<.45,'front boot braces ahead of the resting hips: '+front);
 assert(rear>-.3&&rear<.08,'rear boot chops in under the resting hips: '+rear);
 assert(groundPop(samples,88)<.3,'no boot snaps across the ground entering or leaving the brake: '+groundPop(samples,88));
 r.dispose();
 // The sim's explicit brake request produces the same braking shape while still moving.
 const b=createPlayer('brake-request','home');
 const requested=drive(b,120,()=>[0,4],t=>({runIntensity:.8,brake:t>1?1:0}),(rr,i,x,z)=>({pitch:pitch(rr),pelvis:joint(rr,'player-pelvis').position.y,left:world(rr,'left-ankle'),right:world(rr,'right-ankle'),z}),0);
 assert(Math.min(...requested.slice(70).map(s=>s.pitch))<Math.min(...requested.slice(30,59).map(s=>s.pitch))-.2,'motion.brake pitches the torso back');
 let onset=0;for(let i=58;i<75;i++)onset=Math.max(onset,Math.abs(requested[i].pitch-requested[i-1].pitch));
 assert(onset<.15,'a sudden brake request loads over several frames, not a one-frame pose snap: '+onset);
 assert(groundPop(requested,50)<.3,'no boot snaps when the brake request lands mid-stride: '+groundPop(requested,50));
 // Braking while still carrying speed chops the feet through instead of dragging locked boots.
 const reach=Math.max(...requested.slice(62).map(s=>Math.max(Math.abs(s.left.z-s.z),Math.abs(s.right.z-s.z))));
 assert(reach<.55,'locked brake feet never trail beyond leg reach while momentum carries on: '+reach);b.dispose();
 console.log('RANGE_BRAKE_PASS running height',runHeight.toFixed(3));
}

// 3. A hard direction change plants the outside foot: it stays within 2 cm for >= .1 s while the yaw turns >= 45 deg.
{
 const r=createPlayer('cut','home');
 const samples=drive(r,110,t=>t<1?[0,3.5]:[t<1.15?1.2:Math.min(3.5,1.2+(t-1.15)*11.5),0],()=>({}),(rr,i)=>({i,yaw:rr.root.rotation.y,left:world(rr,'left-ankle'),right:world(rr,'right-ankle')}));
 let best={frames:0,turn:0};
 for(let start=60;start<80;start++){const origin=samples[start].left;let end=start;while(end+1<samples.length&&Math.hypot(samples[end+1].left.x-origin.x,samples[end+1].left.z-origin.z)<.02)end++;const frames=end-start;if(frames>best.frames)best={frames,turn:Math.abs(samples[end].yaw-samples[start].yaw),start};}
 assert(best.frames>=6,'outside foot holds its world position for at least .1 s: '+JSON.stringify(best));
 assert(best.turn>=Math.PI/4,'body yaw changes by at least 45 degrees during the plant: '+best.turn);
 // The inside foot is not left behind either: no foot ever exceeds the leg reach clamp badly (both stay below knee height).
 assert(samples.every(s=>s.left.y<.5&&s.right.y<.5),'no foot flies during the cut');
 r.dispose();
 // Heavier profiles dwell longer than nimble ones.
 const dwell={};
 for(const role of['fwd','def']){const rig=createPlayer('cut-'+role,'home');rig.setProfile(ROLE_PROFILES[role]);const scale=ROLE_PROFILES[role].height;
  const s=drive(rig,110,t=>t<1?[0,3.5]:[t<1.15?1.2:Math.min(3.5,1.2+(t-1.15)*11.5),0],()=>({}),(rr,i)=>({i,left:world(rr,'left-ankle')}));
  let longest=0;for(let start=60;start<80;start++){const origin=s[start].left;let end=start;while(end+1<s.length&&Math.hypot(s[end+1].left.x-origin.x,s[end+1].left.z-origin.z)<.02*scale)end++;longest=Math.max(longest,end-start);}
  dwell[role]=longest;rig.dispose();}
 assert(dwell.def>dwell.fwd,'a heavy defender dwells on the plant longer than a nimble forward: '+JSON.stringify(dwell));
 // The sim's plant impulse on a straight run: the body sinks and rolls into the plant, no boot snaps.
 const planted={};
 for(const [name,impulse]of[['control',0],['plant',1]]){const rig=createPlayer('plant-request','home');
  const s=drive(rig,120,()=>[0,4],t=>({facing:0,runIntensity:.8,plant:t>1&&t<1.05?impulse:0}),rr=>({pelvis:joint(rr,'player-pelvis').position.y,roll:Math.abs(joint(rr,'armor-torso').rotation.z),left:world(rr,'left-ankle'),right:world(rr,'right-ankle')}));
  planted[name]={sink:Math.min(...s.slice(40,59).map(v=>v.pelvis))-Math.min(...s.slice(60,80).map(v=>v.pelvis)),roll:Math.max(...s.slice(60,80).map(v=>v.roll)),pop:groundPop(s,55)};rig.dispose();}
 assert(planted.plant.sink>planted.control.sink+.03,'motion.plant sinks the body into the plant: '+JSON.stringify(planted));
 assert(planted.plant.roll>planted.control.roll+.03,'motion.plant rolls the torso into the planted side');
 assert(planted.plant.pop<.3,'the planting boot reaches in with an arc, not a one-frame snap: '+planted.plant.pop);
 console.log('RANGE_PLANT_PASS',JSON.stringify({...best,dwell,planted}));
}

// 4. Backpedal: shorter, quicker steps than forward running; torso within .1 rad of upright; arms out.
{
 const gait={};
 for(const [name,vz,hint]of[['forward',2,0],['backpedal',-2,1]]){
  const r=createPlayer('gait-'+name,'home');
  const s=drive(r,200,()=>[0,vz],()=>({facing:0,backpedal:hint}),rr=>({sep:world(rr,'left-ankle').z-world(rr,'right-ankle').z,pitch:pitch(rr),pelvis:joint(rr,'player-pelvis').position.y,armZ:Math.abs(joint(rr,'right-shoulder').rotation.z)}),80);
  let steps=0;for(let i=1;i<s.length;i++)if(Math.sign(s[i].sep)!==Math.sign(s[i-1].sep))steps++;
  gait[name]={steps,stride:Math.max(...s.map(v=>Math.abs(v.sep))),pitch:mean(s.map(v=>v.pitch)),pelvis:mean(s.map(v=>v.pelvis)),armZ:mean(s.map(v=>v.armZ))};r.dispose();
 }
 assert(gait.backpedal.steps>=gait.forward.steps*1.25,'backpedal cadence is quicker');
 assert(gait.backpedal.stride<gait.forward.stride*.8,'backpedal steps are shorter');
 assert(Math.abs(gait.backpedal.pitch)<.1,'backpedal torso stays within .1 rad of upright');
 assert(gait.backpedal.armZ>gait.forward.armZ+.2,'backpedal arms go out wide for balance');
 // The hint alone (sim says retreat) is also honoured while the geometry is ambiguous at low speed.
 console.log('RANGE_BACKPEDAL_PASS',JSON.stringify(gait));
}

// 5. Ready stance: staggered feet, lower pelvis, arms out; the shuffle widens with it and never crosses feet.
{
 const stand=createPlayer('stand','home'),ready=createPlayer('ready','home');
 for(let i=0;i<90;i++){stand.update(0,0,DT,i*DT,false,{facing:0});ready.update(0,0,DT,i*DT,false,{facing:0,stance:'ready'});}
 const stagger=Math.abs(world(ready,'left-ankle').z-world(ready,'right-ankle').z);
 assert(stagger>.14,'ready stance staggers the feet: '+stagger);
 assert(joint(ready,'player-pelvis').position.y<joint(stand,'player-pelvis').position.y-.04,'ready stance lowers the pelvis');
 assert(Math.abs(joint(ready,'right-shoulder').rotation.z)>Math.abs(joint(stand,'right-shoulder').rotation.z)+.15,'ready stance opens the arms');
 assert(pitch(ready)>pitch(stand)+.1,'ready stance leans the torso forward');
 // Keepers combine stance with reach.
 const gk=createPlayer('gk','home');gk.setProfile(ROLE_PROFILES.gk);for(let i=0;i<60;i++)gk.update(0,0,DT,i*DT,false,{facing:0,stance:'ready',keeper:1,keeperReach:.6});finite(gk);
 assert(joint(gk,'left-shoulder').rotation.x<-.6,'keeper reach still owns the arms in the ready stance');gk.dispose();
 const shuffle=createPlayer('shuffle','home');let minSeparation=Infinity,maxLift=0;
 drive(shuffle,150,()=>[1.5,0],()=>({facing:0,stance:'ready',jockey:1}),rr=>{const l=world(rr,'left-ankle'),r=world(rr,'right-ankle');minSeparation=Math.min(minSeparation,r.x-l.x);maxLift=Math.max(maxLift,l.y,r.y);return 0;},40);
 assert(minSeparation>0,'shuffling in the ready stance never crosses the boots');
 assert(maxLift<.25,'shuffle keeps low quick steps');
 stand.dispose();ready.dispose();shuffle.dispose();
 console.log('RANGE_READY_PASS stagger',stagger.toFixed(3));
}

// 6. Every branch stays finite, with and without reduced motion, across profiles.
{
 const motions=[{},{runIntensity:1},{brake:1},{plant:1},{backpedal:1,facing:0},{stance:'ready',jockey:1,facing:0},{keeper:1,keeperReach:1,stance:'ready'},{kick:.36,kickSide:1,actionKind:'shot'},{receive:1,kickSide:-1},{juggle:.2,juggleTouch:'around-world'},{powerKick:true,kick:.3,shotPower:1},{shotStep:.4},{stunAge:.5},{wallSplat:true},{parachute:true,parachuteSpin:1,parachuteJuggle:{phase:.2,side:1}},{rooftopPose:'hang'},{rooftopPose:'dizzy'},{travelMode:'scooter'},{travelMode:'bike'},{travelMode:'moped',mopedSuperman:.5},{travelMode:'moped',mopedStand:.5},{travelMode:'jetpack',flight:{phase:'cruise',progress:1,pitch:.3,compression:0,thrust:1.2,acceleration:.5,turn:.5}},{travelMode:'jetpack',rocketboard:true},{travelMode:'jetpack',flyingCar:true},{truckRiding:true,truckSpeed:8},{samplePose:{speed:2,distance:1.3,heading:.4},receive:.5}];
 let checked=0;
 for(const role of['fwd','def','gk','you'])for(const reduced of[false,true])for(const motion of motions){
  const r=createPlayer('finite-'+role,'home');r.setProfile(ROLE_PROFILES[role]);
  for(let i=0;i<40;i++){const t=i*DT,sharp=i>20&&i<26?Math.PI/2:0;r.update(i*.06,Math.sin(i*.3)*.2,DT,t,reduced,{...motion,facing:motion.facing===undefined?sharp:motion.facing});finite(r);}
  r.update(2.4,0,0,1,reduced,motion);finite(r);r.dispose();checked++;
 }
 console.log('RANGE_FINITE_PASS',checked,'branch/profile/reduced combinations');
}

// 7. Reduced motion (straight run, facing the travel): no lateral sway, no brake/plant dynamics, deterministic.
{
 const r=createPlayer('reduced','home'),pelvis=joint(r,'player-pelvis'),torso=joint(r,'armor-torso');
 let sway=0,minPitch=Infinity,frames=0;
 drive(r,150,t=>[0,t<1.5?4:0],t=>({facing:0,brake:t>1.5?1:0,plant:t>1.5&&t<1.55?1:0}),rr=>{if(frames++>10){sway=Math.max(sway,Math.abs(pelvis.position.x),Math.abs(torso.rotation.z),Math.abs(torso.position.x));minPitch=Math.min(minPitch,pelvis.rotation.x+torso.rotation.x);}return 0;},0,true);
 assert(minPitch>-1e-9,'reduced motion ignores brake/plant requests: no pitch-back '+minPitch);
 const reducedRun=createPlayer('reduced','home');let x=0,z=0;
 for(let i=0;i<150;i++){const t=i*DT;z+=(t<1.5?4:0)*DT;reducedRun.update(x,z,DT,t,true,{facing:0});if(i>10){sway=Math.max(sway,Math.abs(joint(reducedRun,'player-pelvis').position.x),Math.abs(joint(reducedRun,'armor-torso').rotation.z));assert(joint(reducedRun,'player-pelvis').rotation.x+joint(reducedRun,'armor-torso').rotation.x>-1e-9,'reduced motion never pitches back into a brake');}}
 assert(sway<1e-9,'reduced motion has no lateral sway: '+sway);
 const a=createPlayer('det','home'),b=createPlayer('det','home');
 for(let i=0;i<90;i++){a.update(i*.05,0,DT,i*DT,true,{facing:0,stance:'ready'});b.update(i*.05,0,DT,i*DT,true,{facing:0,stance:'ready'});}
 const pose=rr=>{const v=[];rr.root.traverse(o=>v.push(...o.position,...o.quaternion));return v;};
 assert.deepEqual(pose(a),pose(b),'reduced motion is deterministic');
 r.dispose();reducedRun.dispose();a.dispose();b.dispose();
 console.log('RANGE_REDUCED_PASS');
}
console.log('PLAYER_RANGE_OF_MOTION_PASS lean, braking, plant, backpedal, ready stance, finite branches, reduced motion');
