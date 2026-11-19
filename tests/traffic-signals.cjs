// Traffic lights, smarter driving and the merged vehicles (Nov 18 2026). Pure checks on lib/town/trafficSignals.ts and
// lib/town/trafficDriving.ts, then long simulated runs of lib/graphics/streetTraffic.ts on the island streets WITH lights
// (tests/traffic-junctions.cjs keeps covering the same streets without them), then the heat arithmetic of the new vehicle meshes.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),T=require('three');
function loader(){const modules=new Map(),ctx=new Proxy({measureText:t=>({width:t.length*20}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{})});
 return function load(file){file=path.resolve(file);if(modules.has(file))return modules.get(file);const m={exports:{}};modules.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,Float64Array,Int8Array,document:{createElement:()=>({getContext:()=>ctx})},require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;};}
const island=vm.runInNewContext(fs.readFileSync(path.join(__dirname,'traffic-junctions.cjs'),'utf8').match(/const island=(\[[^\n]*?\}\]);/)[1]);
function fixture(roads,lights=true){const load=loader(),S=load('lib/town/trafficSignals.ts'),heads=lights?S.signalHeadsForNodes(load('lib/town/roadNetwork.ts').buildRoadNetwork(roads)):[];
 return {traffic:load('lib/graphics/streetTraffic.ts').createStreetTraffic(new T.Scene(),[],roads,[],heads),S,D:load('lib/town/trafficDriving.ts'),V:load('lib/graphics/trafficVehicles.ts'),overlap:load('lib/town/trafficSeparation.ts').vehicleOverlap,heads};}
const far={x:900,y:40,z:900},still={vx:0,vz:0,reduced:true,onCrash(){}};
let checks=0;const ok=(name,fn)=>{fn();checks++;console.log('ok  ',name);};

// ---------------------------------------------------------------- 1. the signal model
ok('1. phases: opposing streets are never green or yellow together; both get a turn; the timing is as written',()=>{
 const {S}=fixture(island,false);let greenZ=0,greenX=0,yellowZ=0,allRed=0;const dt=.01;
 for(const offset of [0,3.7,11.5,S.signalOffset(-16,-37.5),S.signalOffset(124,-61)])for(let t=-50;t<200;t+=dt){const z=S.signalLight(t,offset,'z'),x=S.signalLight(t,offset,'x');
  assert(!(z!==S.RED&&x!==S.RED),`both streets open at t=${t.toFixed(2)} offset ${offset}`);
  if(offset===0&&t>=0&&t<S.SIGNAL_CYCLE-dt/2){if(z===S.GREEN)greenZ+=dt;if(x===S.GREEN)greenX+=dt;if(z===S.YELLOW)yellowZ+=dt;if(z===S.RED&&x===S.RED)allRed+=dt;}}
 assert(Math.abs(greenZ-S.SIGNAL_GREEN)<.05&&Math.abs(greenX-S.SIGNAL_GREEN)<.05,'each street has its full green');assert(Math.abs(yellowZ-S.SIGNAL_YELLOW)<.05,'yellow lasts SIGNAL_YELLOW');
 assert(Math.abs(allRed-2*S.SIGNAL_ALL_RED)<.05,'an all-red gap after each street');assert.equal(S.SIGNAL_CYCLE,2*(S.SIGNAL_GREEN+S.SIGNAL_YELLOW+S.SIGNAL_ALL_RED));
 // green is always followed by yellow, yellow by red, red by green
 let last=S.signalLight(0,0,'z');for(let t=0;t<100;t+=dt){const now=S.signalLight(t,0,'z');if(now!==last){assert.equal(now,last===S.GREEN?S.YELLOW:last===S.YELLOW?S.RED:S.GREEN,'order green, yellow, red');last=now;}}
});
ok('2. the stop decision: red stops, green goes, yellow stops only when that is comfortable, past the line always clears',()=>{
 const {S,D}=fixture(island,false),b=D.DRIVE.brake;
 assert.equal(S.signalStop(S.RED,5,6,b),true);assert.equal(S.signalStop(S.GREEN,5,6,b),false);assert.equal(S.signalStop(S.RED,-.1,6,b),false,'past the line: clear the junction');
 assert.equal(S.signalStop(S.YELLOW,20,6,b),true,'far enough to stop gently');assert.equal(S.signalStop(S.YELLOW,2,6,b),false,'too close: clear it');assert.equal(S.signalStop(S.YELLOW,2,1,b),true,'slow enough to stop even this close');
 assert(D.stopSpeed(0)===0&&D.stopSpeed(-3)===0&&Math.abs(D.stopSpeed(8)-Math.sqrt(2*b*8))<1e-9,'stopSpeed is the braking curve');
 assert(D.stepSpeed(0,6,1/60)<=D.DRIVE.accel/60+1e-9,'pulls away gently');assert(D.stepSpeed(6,0,1/60)>=6-D.DRIVE.hardBrake/60-1e-9,'never an instant stop');
 assert(D.turnSpeed(6,0)===6&&Math.abs(D.turnSpeed(6,Math.PI/2)-D.DRIVE.turn)<1e-9&&D.turnSpeed(6,Math.PI)<=D.DRIVE.uTurn+1e-9,'slower the sharper the bend');
 assert(D.personInLane(5,.5,0,12,1.5)&&!D.personInLane(5,3,0,12,1.5)&&D.personInLane(5,3,2,12,1.5)&&!D.personInLane(-2,0,0,12,1.5),'in the lane, on the kerb, stepping in, behind');
});

// ---------------------------------------------------------------- 2. the island with lights
ok('3. island with lights, 30 simulated minutes: red is obeyed, queues release on green, no deadlock, no contact, smooth speed and heading',()=>{
 const {traffic:a,S,D,overlap}=fixture(island),N=a.cars.length,ZONE=a.signals.stopZone,dt=1/60;
 const signalled=[...a.signals.offset].filter(o=>o>=0).length,flashing=a.signals.headNode.filter(n=>n<0).length;
 assert(signalled>=10,'the town junctions have working lights: '+signalled);assert(a.cayTraffic.ring.every(id=>a.signals.offset[id]<0)&&a.signals.offset[a.cayTraffic.spurEnd]<0,'the roundabout stays a yield roundabout');
 assert(flashing>0,'corners flash yellow');assert.equal(a.signals.lamps.mesh.count,a.signals.heads.length*3,'three lamps per head, one instanced mesh');
 const body=c=>({x:c.group.position.x,z:c.group.position.z,yaw:c.group.rotation.y,width:(c.pickup?2.1:1.9)-.2,length:(c.pickup?4.5:3.6)-.2});
 const prev=a.cars.map(c=>({p:c.group.position.clone(),v:c.v,yaw:c.group.rotation.y,remaining:c.length-c.distance,route:c.from+':'+c.to,heldAtRed:false})),idle=Array(N).fill(0),longest=Array(N).fill(0),travel=Array(N).fill(0);
 let ranRed=0,crossings=0,waitedAtRed=0,releasedOnGreen=0,hardStops=0,worstTurn=0,worstCayTurn=0,worstGap=Infinity,worstOverlap=0,lampErrors=0,redAge=0;
 // What a driver SEES (Nov 18 2026 verify pass): the head facing each approach, as painted. Passing 10.5 m from the junction centre
 // (where the stop line is) under a head that has shown red for longer than the all-red gap is running a red light, whether or not
 // the car has a stop line there. The short street inside a shared box has none, so its two heads flash yellow instead.
 const heads=a.signals.heads,headNode=a.signals.headNode,headFor=(n,f)=>{const A=a.nodes[n],F=a.nodes[f],ux=F.x-A.x,uz=F.z-A.z,l=Math.hypot(ux,uz);return heads.findIndex(h=>Math.abs(h.jx-A.x)<.6&&Math.abs(h.jz-A.z)<.6&&(Math.sin(h.yaw)*ux+Math.cos(h.yaw)*uz)/l>.9);};
 const pairs=[];for(const n of a.nodes)for(const id of n.links)if(id>n.id&&a.signals.offset[n.id]>=0&&a.signals.offset[id]>=0&&Math.hypot(a.nodes[id].x-n.x,a.nodes[id].z-n.z)<24)pairs.push([n.id,id]);
 assert(pairs.length>=1,'the island has two junctions that share a box');for(const [p,q] of pairs)for(const [n,f] of [[p,q],[q,p]]){const k=headFor(n,f);assert(k>=0&&headNode[k]===-1,'the head facing the short street inside a shared box flashes yellow');assert(a.nodes[n].links.filter(id=>id!==f).every(id=>{const o=headFor(n,id);return o<0||headNode[o]===n;}),'its other heads run the lights');}
 let passedHeads=0,passedRed=0,bothOpen=0,maxQueue=0,queueGapMin=Infinity,queueGapMax=0;const nodeDistance=a.cars.map(()=>Infinity);
 // The visitor hovers over the town (too high to be a pedestrian), so the lamps are in range and painted.
 const over={x:60,y:40,z:-40};
 for(let tick=0;tick<30*3600;tick++){a.update(dt,over,still);const clock=a.signals.clock;
  const queues=new Map();
  for(let i=0;i<N;i++){const c=a.cars[i],s=prev[i],d=c.group.position.distanceTo(s.p),route=c.from+':'+c.to,remaining=c.length-c.distance;travel[i]+=d;
   {const to=a.nodes[c.to],near=Math.hypot(c.group.position.x-to.x,c.group.position.z-to.z);if(route===s.route&&nodeDistance[i]>=10.5&&near<10.5){const k=headFor(c.to,c.from);if(k>=0&&headNode[k]>=0){passedHeads++;if(a.signals.lamps.shown[k]===S.RED){let age=0;while(age<30&&S.signalLight(clock-age,a.signals.offset[headNode[k]],heads[k].axis)===S.RED)age+=.05;if(age>S.SIGNAL_ALL_RED+.25)passedRed++;}}}nodeDistance[i]=near;
    if(c.signalNode>=0&&c.v<.05&&S.signalLight(clock,a.signals.offset[c.signalNode],c.axis)===S.RED){const q=queues.get(route);if(q)q.push(c);else queues.set(route,[c]);}}
idle[i]=d<1e-6?idle[i]+dt:0;longest[i]=Math.max(longest[i],idle[i]);
   // Speed is eased: never faster up than DRIVE.accel, never an instant stop except the footprint guard (counted).
   assert(c.v-s.v<=D.DRIVE.accel*dt+1e-9,`car ${i} jumped in speed`);if(s.v-c.v>D.DRIVE.hardBrake*dt+1e-9){assert.equal(c.v,0);hardStops++;}
   let turn=Math.abs(c.group.rotation.y-s.yaw);if(turn>Math.PI)turn=2*Math.PI-turn;if(c.group.position.x<228)worstTurn=Math.max(worstTurn,turn);else worstCayTurn=Math.max(worstCayTurn,turn);
   // The stop line is ZONE metres before the route's end. Crossing it on red is only allowed in the first moments of red (a car
   // that could not stop on yellow clearing the junction during the all-red gap).
   if(route===s.route&&c.signalNode>=0&&s.remaining>=ZONE&&remaining<ZONE){crossings++;const light=S.signalLight(clock,a.signals.offset[c.signalNode],c.axis);
    if(light===S.RED){let age=0;while(age<30&&S.signalLight(clock-age,a.signals.offset[c.signalNode],c.axis)===S.RED)age+=.05;redAge=Math.max(redAge,age);if(age>S.SIGNAL_ALL_RED)ranRed++;}}
   const red=c.signalNode>=0&&remaining>=ZONE&&remaining<ZONE+2&&c.v<.05&&S.signalLight(clock,a.signals.offset[c.signalNode],c.axis)===S.RED;
   if(red&&!s.heldAtRed)waitedAtRed++;if(s.heldAtRed&&!red&&c.v>0&&S.signalLight(clock,a.signals.offset[c.signalNode],c.axis)===S.GREEN)releasedOnGreen++;s.heldAtRed=red||(s.heldAtRed&&c.v<.05&&route===s.route);
   for(let j=i+1;j<N;j++){const o=a.cars[j],depth=overlap(body(c),body(o));worstOverlap=Math.max(worstOverlap,depth);assert(depth<.02,`vehicles ${i} and ${j} interpenetrate by ${depth.toFixed(3)} m at ${(tick/60).toFixed(1)} s`);
    // Following distance on a straight: same street, same way, one behind the other.
    if(c.from===o.from&&c.to===o.to&&c.distance>c.turnLength+4&&o.distance>o.turnLength+4){const along=(o.group.position.x-c.group.position.x)*c.dirX+(o.group.position.z-c.group.position.z)*c.dirZ,back=along>0?c:o,gap=Math.abs(along)-c.halfLength-o.halfLength;if(back.v>.01&&c.dirX*o.dirX+c.dirZ*o.dirZ>.99)worstGap=Math.min(worstGap,gap);}}
   s.p.copy(c.group.position);s.v=c.v;s.yaw=c.group.rotation.y;s.remaining=remaining;s.route=route;}
  for(const q of queues.values()){if(q.length>maxQueue)maxQueue=q.length;if(q.length<2)continue;q.sort((x,y)=>(x.length-x.distance)-(y.length-y.distance));for(let k=1;k<q.length;k++){const gap=(q[k].length-q[k].distance)-(q[k-1].length-q[k-1].distance)-q[k].halfLength-q[k-1].halfLength;queueGapMin=Math.min(queueGapMin,gap);queueGapMax=Math.max(queueGapMax,gap);}}
  if(tick%6===0){const open=new Map();heads.forEach((h,k)=>{if(headNode[k]<0||a.signals.lamps.shown[k]===S.RED)return;const o=open.get(headNode[k]);if(o&&o!==h.axis)bothOpen++;open.set(headNode[k],h.axis);});}
  if(tick%30===0)a.signals.heads.forEach((h,k)=>{const node=a.signals.headNode[k],shown=a.signals.lamps.shown[k];/* painted five times a second: a lamp may trail the model by one paint */if(node>=0&&shown!==S.signalLight(clock,a.signals.offset[node],h.axis)&&shown!==S.signalLight(clock-.21,a.signals.offset[node],h.axis))lampErrors++;});
 }
 console.log('     ',JSON.stringify({signalled,flashingHeads:flashing,crossings,ranRed,latestRedCrossing:+redAge.toFixed(2),waitedAtRed,releasedOnGreen,hardStops,longestStop:Math.max(...longest).toFixed(1),minTravel:Math.round(Math.min(...travel)),worstHeadingStepDeg:+(worstTurn*180/Math.PI).toFixed(2),worstCayHeadingStepDeg:+(worstCayTurn*180/Math.PI).toFixed(2),closestFollowingGap:+worstGap.toFixed(2),worstOverlap:+worstOverlap.toFixed(3),lampUploads:a.signals.lamps.stats.uploads}));
 assert(crossings>300,'cars keep crossing signalled junctions');assert.equal(ranRed,0,'no car crosses a stop line on red (after the all-red clearance)');
 assert(waitedAtRed>50&&releasedOnGreen>50,'cars wait at red and move off on green');
 console.log('     ',JSON.stringify({passedHeads,passedRed,bothOpen,maxQueue,queueGapMin:+queueGapMin.toFixed(2),queueGapMax:+queueGapMax.toFixed(2)}));
 assert(passedHeads>300&&passedRed===0,'no vehicle drives past a head that shows red: '+passedRed);assert.equal(bothOpen,0,'as painted, the two streets of a junction are never open together');
 assert(maxQueue>=2,'real queues form at red');assert(queueGapMin>1.2&&queueGapMax<2.2,`a queue holds its gaps: ${queueGapMin.toFixed(2)}..${queueGapMax.toFixed(2)} m`);
 assert(longest.every(t=>t<2*S.SIGNAL_CYCLE),`no deadlock: longest stop ${Math.max(...longest).toFixed(1)} s`);assert(travel.every(d=>d>30*60*1.2),'every vehicle keeps making progress');
 assert(worstTurn<.06,'town: the heading never snaps (it used to kink ~0.59 rad at both ends of every join)');
 // Coral Cay: the sharpest heading change left is the U-turn at the boulevard's dead end (a 2 m radius between the two lanes,
 // taken at walking pace). The causeway's entry to the roundabout is an ordinary right turn since it joins at the ring node its
 // arm really meets (lib/town/cayTraffic.ts, checked in tests/cay-traffic.cjs).
 assert(worstCayTurn<.13,'cay: no snap at the roundabout entries either');assert(worstGap>.6,'a following vehicle keeps its distance: '+worstGap.toFixed(2));
 assert.equal(lampErrors,0,'the lamps show what the signal model says');assert(a.signals.lamps.mesh.visible,'drawn while a signal is in range');
 {const uploads=a.signals.lamps.stats.uploads;for(let i=0;i<600;i++)a.update(dt,far,still);assert(!a.signals.lamps.mesh.visible&&a.signals.lamps.stats.uploads===uploads,'no lamp draw and no upload when every signal is over 130 m away (Coral Cay, the stadium)');}assert(a.signals.lamps.stats.uploads<30*60*5,'lamp colours upload only on a change');a.dispose();
});
ok('4. dense 3x3 grid with lights at every junction, 20 minutes: queues through every box, still no deadlock',()=>{
 const dense=[{x:48,z:-46,w:12,d:68,vertical:true},{x:88,z:-46,w:12,d:68,vertical:true},{x:124,z:-46,w:12,d:68,vertical:true},{x:86,z:-80,w:76,d:12,vertical:false},{x:86,z:-46,w:76,d:12,vertical:false},{x:86,z:-12,w:76,d:12,vertical:false}];
 const {traffic:a,S,overlap}=fixture(dense),N=a.cars.length,idle=Array(N).fill(0),longest=Array(N).fill(0),travel=Array(N).fill(0),prev=a.cars.map(c=>c.group.position.clone());
 const body=c=>({x:c.group.position.x,z:c.group.position.z,yaw:c.group.rotation.y,width:(c.pickup?2.1:1.9)-.2,length:(c.pickup?4.5:3.6)-.2});
 for(let tick=0;tick<20*3600;tick++){a.update(1/60,far,still);for(let i=0;i<N;i++){const c=a.cars[i],d=c.group.position.distanceTo(prev[i]);prev[i].copy(c.group.position);travel[i]+=d;idle[i]=d<1e-6?idle[i]+1/60:0;longest[i]=Math.max(longest[i],idle[i]);for(let j=i+1;j<N;j++)assert(overlap(body(c),body(a.cars[j]))<.02,'no contact');}}
 console.log('     ',JSON.stringify({longestStop:longest.map(v=>+v.toFixed(1)),minTravel:Math.round(Math.min(...travel))}));
 assert(longest.every(t=>t<3*S.SIGNAL_CYCLE),'no deadlock on the dense grid');assert(travel.every(d=>d>20*60*.6),'every vehicle keeps moving');a.dispose();
});

// ---------------------------------------------------------------- 3. people
ok('5. a vehicle stops for a person in its lane, short of them, and moves off gently when they have gone',()=>{
 const {traffic:a,D}=fixture(island,false),dt=1/60;for(let i=0;i<120;i++)a.update(dt,far,still);
 const car=a.cars.find(c=>!c.pickup&&c.length-c.distance>60&&c.distance>c.turnLength+2);assert(car,'a car on a long straight');
 const p={x:car.group.position.x+car.dirX*16,y:0,z:car.group.position.z+car.dirZ*16};let closest=Infinity,stopped=0;
 for(let i=0;i<600;i++){a.update(dt,p,still);const ahead=(p.x-car.group.position.x)*car.dirX+(p.z-car.group.position.z)*car.dirZ;closest=Math.min(closest,ahead-car.halfLength);if(car.v===0)stopped++;}
 assert.equal(car.v,0,'stopped');assert(stopped>300,'and stayed stopped');assert(closest>1.5&&closest<3.5,'bumper '+closest.toFixed(2)+' m short of the person');assert(car.group.userData.waiting,'marked waiting');
 let worst=0,last=car.v;for(let i=0;i<240;i++){a.update(dt,far,still);worst=Math.max(worst,(car.v-last)/dt);last=car.v;}
 assert(car.v>3,'drives on once the lane is clear: '+car.v.toFixed(2));assert(worst<=D.DRIVE.accel+1e-6,'moving off no harder than DRIVE.accel');
 // Someone walking toward the lane from the kerb is given way to before they are in it.
 const side={x:car.group.position.x+car.dirX*9+car.dirZ*4,y:0,z:car.group.position.z+car.dirZ*9-car.dirX*4},walk={...still,vx:-car.dirZ*1.4,vz:car.dirX*1.4},v0=car.v;
 for(let i=0;i<20;i++)a.update(dt,side,walk);assert(car.v<v0-.5,'slows for a person stepping into the lane');a.dispose();
});
ok('6. townsfolk: a vehicle stops for one standing in the lane, ignores one on the pavement, and edges past after DRIVE.patience',()=>{
 const {traffic:a,D}=fixture(island,false),dt=1/60;for(let i=0;i<120;i++)a.update(dt,far,still);
 const car=a.cars.find(c=>!c.pickup&&c.length-c.distance>70&&c.distance>c.turnLength+2);assert(car);
 const above=()=>({x:car.group.position.x+20,y:40,z:car.group.position.z});/* the visitor hovers near by: only vehicles within 100 m look for townsfolk */
 const kerb={position:{x:car.group.position.x+car.dirX*14+car.dirZ*3.2,y:0,z:car.group.position.z+car.dirZ*14-car.dirX*3.2}},people=[kerb],inter={...still,people};
 for(let i=0;i<120;i++)a.update(dt,above(),inter);assert(car.v>3,'someone on the pavement does not stop traffic');
 const person={position:{x:car.group.position.x+car.dirX*15,y:0,z:car.group.position.z+car.dirZ*15}};people.push(person);
 let closest=Infinity;const gap=()=>(person.position.x-car.group.position.x)*car.dirX+(person.position.z-car.group.position.z)*car.dirZ-car.halfLength;
 for(let i=0;i<360;i++){a.update(dt,above(),inter);closest=Math.min(closest,gap());}
 assert.equal(car.v,0,'stopped for the townsperson');assert(closest>1.2,'short of them: '+closest.toFixed(2));
 let top=0;for(let i=0;i<(D.DRIVE.patience+6)*60;i++){a.update(dt,above(),inter);if(gap()>-4)top=Math.max(top,car.v);}
 assert(gap()<-1,'it got past');assert(top>0&&top<=1.6+1e-9,'after waiting it edges past at walking pace instead of jamming the street: '+top.toFixed(2));a.dispose();
});

// ---------------------------------------------------------------- 4. the vehicles' heat arithmetic
ok('7. vehicles: one mesh, one material, one shadow caster each; every style under the old triangle count; lamps are one draw',()=>{
 const {traffic:a,V,heads}=fixture(island);let triangles=0,meshes=0,casters=0;const materials=new Set();
 for(const car of a.cars){const parts=[];car.group.traverse(o=>{if(o.isMesh&&o.name.endsWith('-body'))parts.push(o);});assert.equal(parts.length,1,'one body mesh');const mesh=parts[0],n=V.triangleCount(mesh.geometry);
  assert(n<=(car.pickup?V.OLD_TRIANGLES.pickup:V.OLD_TRIANGLES.car),`${mesh.name} ${car.index}: ${n} triangles`);triangles+=n;meshes++;if(mesh.castShadow)casters++;materials.add(mesh.material);
  assert(mesh.geometry.getAttribute('aPart')&&mesh.geometry.getAttribute('color'),'vertex colours and part tags');assert(mesh.material.vertexColors&&!mesh.material.map,'no texture');
  const box=mesh.geometry.boundingBox;assert(box.max.x<=(car.pickup?1.13:1.03)&&box.max.z<=(car.pickup?2.36:1.82)&&box.min.z>=-(car.pickup?2.32:1.82)&&box.min.y>=0,'inside its footprint, on the ground');
  const tags=new Set(mesh.geometry.getAttribute('aPart').array.filter((_,k)=>k%4===3));for(const part of Object.values(V.PART))assert(tags.has(part),'has part '+part);}
 console.log('     ',JSON.stringify({vehicles:meshes,triangles,was:9*V.OLD_TRIANGLES.car+2*V.OLD_TRIANGLES.pickup+48,shadowCasters:casters,materials:materials.size,lampInstances:heads.length*3}));
 assert.equal(meshes,11);assert.equal(casters,11,'was 44');assert(triangles<=3580*.75,'at least a quarter fewer triangles than the 3,580 before');
 const styles=new Set(V.CAR_STYLES);assert(styles.size>=6,'six looks');const counts=[...styles].map(s=>V.triangleCount(V.buildVehicleGeometry(s,'#bb6857')));assert(new Set(counts).size>=5,'the styles are different shapes');
 const lamp=a.signals.lamps.mesh;assert(lamp.isInstancedMesh&&!lamp.castShadow&&lamp.material.type==='MeshBasicMaterial','unlit, no shadow');assert(V.triangleCount(lamp.geometry.toNonIndexed())<=4,'a lamp is four triangles (was a 40-triangle cylinder)');
 // The wheel and lamp uniforms move; nothing else is uploaded per frame.
 const car=a.cars[0],spin0=car.look.wheel.x;for(let i=0;i<200;i++)a.update(1/60,{x:car.group.position.x+30,y:40,z:car.group.position.z},{vx:0,vz:0,reduced:false,onCrash(){}});assert.notEqual(car.look.wheel.x,spin0,'wheels turn');
 a.setTimeOfDay('night');assert(a.cars.every(c=>c.look.lamp.x>1),'headlamps on at night');a.setTimeOfDay('day');assert(a.cars.every(c=>c.look.lamp.x<.3));a.dispose();
 const src=fs.readFileSync('lib/town/world.ts','utf8');assert(!/signalLenses|signalColors/.test(src)&&/signalHeads\.push\(/.test(src),'world.ts no longer builds lens cylinders; it reports the heads');
 const town=fs.readFileSync('components/Town.tsx','utf8');assert(town.includes('createStreetTraffic(scene,world.obstacles,world.roads,rideRamps,world.signalHeads)')&&town.includes('streetTraffic.setTimeOfDay(timeRef.current)')&&town.includes('people:islandNpcs.entries'),'Town wiring');
});
ok('8. feel: the body leans OUT of a bend and dips under braking, on wheels that stay on the road; indicators on the turning side',()=>{
 const {traffic:a}=fixture(island),dt=1/60,still2={vx:0,vz:0,reduced:false,onCrash(){}},over={x:60,y:40,z:-40};
 let out=0,into=0,dive=0,rise=0,lift=0,blinkOK=0,blinkWrong=0,grounded=true;const last=a.cars.map(()=>({side:0,at:-9}));
 for(let tick=0;tick<8*3600;tick++){a.update(dt,over,still2);const clock=a.signals.clock;a.cars.forEach((c,i)=>{const p=c.group.position,r=c.group.rotation;if((p.x-over.x)**2+(p.z-over.z)**2>=10000)return;
   // +x is the vehicle's left (forward +z, up +y). yawRate > 0 turns left; leaning out lifts the left side: rotation.z > 0.
   if(Math.abs(c.yawRate)>.4&&c.v>1.5&&Math.abs(r.z)>.004){if(Math.sign(r.z)===Math.sign(c.yawRate))out++;else into++;}
   if(c.accel<-2&&Math.abs(r.x)>.004){if(r.x>0)dive++;else rise++;}if(c.accel>1.5&&r.x<-.004)lift++;
   if(p.y!==0||c.look.wheel.z!==r.x||c.look.lamp.w!==r.z)grounded=false;assert(Math.abs(r.x)<.04&&Math.abs(r.z)<.05,'the pitch and roll stay small');
   const z=c.look.lamp.z;if(z!==0){last[i].side=Math.sign(z);last[i].at=clock;}
   if(p.x<228&&Math.abs(c.yawRate)>.5&&c.v>1&&clock-last[i].at<.5){if(last[i].side===Math.sign(c.yawRate))blinkOK++;else blinkWrong++;}});}
 console.log('     ',JSON.stringify({leanOut:out,leanIn:into,noseDown:dive,noseUpBraking:rise,noseUpPullingAway:lift,indicatorRightSide:blinkOK,indicatorWrongSide:blinkWrong}));
 assert(out>500&&into===0,'the body rolls out of the bend, never into it');/* the pitch is a soft spring: for a few frames after pulling away turns into braking the nose is still on its way down */assert(dive>500&&rise<dive*.03&&lift>500,'nose down under braking, up pulling away');
 assert(grounded,'the body tilts on its wheels: the group stays at road height and the shader is given the same two angles to take back out of the wheels');
 assert(blinkOK>500&&blinkWrong===0,'the indicator that blinks is on the side the vehicle turns to');a.dispose();
 const src=fs.readFileSync('lib/graphics/trafficVehicles.ts','utf8');assert(src.includes('transformed.y+=aPart.z*uWheel.z-aPart.x*uLamp.w')&&src.includes('max(uLamp.z,0.):max(-uLamp.z,0.)'),'wheel vertices undo the body pitch and roll; one signed uniform drives both indicators');
});
ok('9. lamps: full colour (no tone mapping), darker unlit lamps at night, and they follow a kicked signal head with no extra draw',()=>{
 const {traffic:a,S}=fixture(island),lamps=a.signals.lamps,mesh=lamps.mesh,over={x:60,y:40,z:-40},c=new T.Color();
 assert(mesh.material.toneMapped===false&&mesh.material.fog===false&&!mesh.material.transparent,'unlit, opaque, no tone mapping, no fog');
 for(let i=0;i<30;i++)a.update(1/60,over,still);const k=a.signals.headNode.findIndex((n,i)=>n>=0&&lamps.shown[i]===S.RED);assert(k>=0);
 mesh.getColorAt(k*3,c);const litRed=c.r;mesh.getColorAt(k*3+2,c);const dimDay=c.g;assert(litRed>.9,'a lit lamp is at full strength');
 a.setTimeOfDay('night');for(let i=0;i<30;i++)a.update(1/60,over,still);mesh.getColorAt(k*3,c);assert(c.r===litRed);mesh.getColorAt(k*3+2,c);assert(c.g<dimDay*.6,'unlit lamps go darker at night, so the lit one stands out');
 // The sway: lib/graphics/propReactions.ts tells followers where a point of the reacting prop is this frame, then null at rest.
 const P=loader()('lib/graphics/propReactions.ts'),h=a.signals.heads[k],attribute=new T.BufferAttribute(new Float32Array([h.x,0,h.z,h.x,7,h.z,h.x,5.5,h.z]),3);
 const props=P.createPropReactions([{kind:'signal',parts:[{attribute,start:0,count:3}],min:{x:h.x-1,y:0,z:h.z-1},max:{x:h.x+1,y:7,z:h.z+1}}]);
 assert(props.follow('signal',h.x,h.z,move=>lamps.sway(k,move))&&!props.follow('signal',h.x+50,h.z,()=>{}),'followers attach to the prop whose bounds hold the point');
 const rest=Array.from(mesh.instanceMatrix.array.slice(k*48,k*48+48)),others=Array.from(mesh.instanceMatrix.array.slice(0,k*48));
 assert(props.hit(h.x,1,h.z,14,3),'the kick lands');let moved=0,follows=true;
 for(let i=0;i<30;i++){props.update(1/60);const m=mesh.instanceMatrix.array,vertex=attribute.array;moved=Math.max(moved,Math.hypot(m[k*48+12]-rest[12],m[k*48+14]-rest[14]));
  /* the head's own vertex at lamp height (index 2) and the top lamp move together, to within the lamp's 0.37 m offset from the head centre */if(Math.abs((m[k*48+12]-rest[12])-(vertex[6]-h.x))>.02||Math.abs((m[k*48+14]-rest[14])-(vertex[8]-h.z))>.02)follows=false;}
 assert(moved>.03,'the lamps move with the head: '+moved.toFixed(3));assert(follows,'by the same amount as the head they sit on');
 for(let i=0;i<60;i++)props.update(1/60);assert.deepEqual(Array.from(mesh.instanceMatrix.array.slice(k*48,k*48+48)),rest,'back exactly at rest when the sway ends');assert.deepEqual(Array.from(mesh.instanceMatrix.array.slice(0,k*48)),others,'no other lamp touched');
 assert(lamps.stats.sways>0&&lamps.stats.sways<=60,'instance positions are written only during the sway');a.dispose();
 const town=fs.readFileSync('components/Town.tsx','utf8');assert(town.includes("propReactions.follow('signal',h.x,h.z,move=>lamps.sway(i,move))"),'Town wires the lamps to the signal props');
});
console.log(`traffic-signals: ${checks} checks passed`);
