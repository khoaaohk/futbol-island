const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const cache=new Map(),ctx=new Proxy({measureText:text=>({width:text.length*20}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}});
const document={createElement:()=>({width:0,height:0,getContext:()=>ctx})},window={innerHeight:800,matchMedia:()=>({matches:false}),addEventListener(){},removeEventListener(){}};
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{module:m,exports:m.exports,Math,Number,document,window,console,performance,require:id=>id.startsWith('.')?(id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):load(path.resolve(path.dirname(file),id+'.ts'))):require(id)});return m.exports;}
const {createFieldRuntime,LIVE_GAME_SPEED,liveGameSpeed,liveKickPhase,groundDribbleContact,teachingPoseAdvances}=load('lib/town/fieldRuntime.ts'),{teachingMotion,receivingPose}=load('lib/town/teachingMotion.ts'),{VENUES}=load('lib/town/venues.ts');
assert.equal(liveKickPhase(1),.36);assert(liveKickPhase(.9)>.42,'follow-through advances immediately');assert.equal(liveKickPhase(0),1);
for(const side of[-1,1])for(const speed of[0,1,3,5])for(let i=0;i<120;i++){const p=groundDribbleContact(0,0,0,side,i/30,speed,new T.Vector3());assert.equal(p.y,.295,'normal touches remain grounded');assert(Math.abs(p.x-side*.14)<1e-9);assert(p.z>=.5-1e-9&&p.z<=.62+1e-9);}
assert(!teachingPoseAdvances({playing:true,outcomePaused:true,outcomeProgress:.5},0));assert(!teachingPoseAdvances({playing:true,outcomeProgress:1},0));assert(teachingPoseAdvances({playing:false,outcomeProgress:.4},0));
const left=receivingPose({x:0,z:0},{x:-4,z:2},{x:0,z:-4}),right=receivingPose({x:0,z:0},{x:4,z:2},{x:0,z:-4});assert.equal(left.kickSide,-right.kickSide,'appropriate foot mirrors with incoming angle');
const scene=new T.Scene(),runtime=createFieldRuntime(scene),v=VENUES.find(v=>v.id==='9v9'),entry=runtime.entries.find(e=>e.venue.id===v.id),camera=new T.PerspectiveCamera(55,1,.1,1000);camera.position.set(v.x,100,v.z+100);camera.lookAt(v.x,0,v.z);camera.updateMatrixWorld();
const lesson=JSON.parse(fs.readFileSync('public/lessons/9v9.json')).find(l=>l.id==='nx9_twostrikers'),session={format:v.id,lesson,step:7,progress:.18,playing:false,quiz:false,question:0,answer:null,onStep(){}};
const render=p=>{session.progress=p;runtime.update(0,0,camera,session,true,v.id);return entry.ball.position.clone();};
const preparation=render(.12),released=render(.18);assert(preparation.distanceTo(released)>.01,'moving passer carries grounded ball before release');const anchors=entry.root.userData.teachingContacts,release=anchors.release.clone(),arrival=anchors.arrival.clone();const midpoint=render(.5),expected=release.clone().lerp(arrival,.5);assert(midpoint.distanceTo(expected)<1e-9,'pass flight uses release-frame origin even when passer runs away');assert(entry.root.userData.teachingContacts===anchors,'contact poses sampled once per beat');
const justBefore=render(.82-1e-6),at=render(.82),justAfter=render(.82+1e-6);assert(justBefore.distanceTo(at)<.001,'flight joins selected receiving boot at arrival');assert(justAfter.distanceTo(at)<.001,'receiver possession follows continuously after arrival');
const receiver=teachingMotion(lesson,v,7,.82).receiver,rig=entry.rigs.get(receiver),boot=rig.ballContact(rig.root.userData.contactSide,new T.Vector3());boot.y=.295;assert(at.distanceTo(boot)<.001,'rendered arrival is at the actual appropriate boot');
render(.99);const back=render(.5);assert(back.distanceTo(midpoint)<1e-9,'backward seek restores exact flight');
// Mirrored authored passes arrive at the selected visible foot, not always one side.
const selected=[];
for(const mirror of[-1,1]){
 const sx=135+mirror*40,fixture={id:'mirror-'+mirror,fmt:v.id,name:'Mirror',ball:{x:sx,y:250},offense:[{id:'a',x:sx,y:250,label:'A'},{id:'b',x:135,y:200,label:'B'}],defense:[],steps:[{desc:'Pass',ball:{x:135,y:200},moves:[]},{desc:'Continue',ball:{x:135,y:140},moves:[{id:'b',to:{x:135,y:140}}]}],questions:[]};
 const s={...session,lesson:fixture,step:0,progress:.82};runtime.update(0,0,camera,s,true,v.id);const r=entry.rigs.get('b'),side=r.root.userData.contactSide,p=r.ballContact(side,new T.Vector3()),wrong=r.ballContact(-side,new T.Vector3());p.y=wrong.y=.295;selected.push(side);assert(entry.ball.position.distanceTo(p)<1e-9);assert(entry.ball.position.distanceTo(wrong)>.05,'arrival visibly uses selected side, not opposite boot');
}
assert.equal(selected[0],-selected[1]);
// Live fixtures exercise actor metadata in the actual shared field pipeline.
runtime.setPaused(v.id,true);const keeper=Object.values(entry.sim.players).find(p=>p.isGK),other=Object.values(entry.sim.players).find(p=>!p.isGK);entry.sim.ball.owner=null;entry.sim.ball.x=keeper.x+1;entry.sim.ball.y=keeper.y;entry.sim.ball.target=keeper.id;
runtime.update(0,0,camera,null,true,v.id);let km=entry.rigs.get(keeper.id).root.userData.liveMotion;assert.equal(km.keeper,1);assert(km.keeperReach>0,'keeper reaches when ball is nearby');entry.sim.ball.x=keeper.x+150;entry.sim.ball.y=keeper.y+100;entry.sim.ball.target=null;runtime.update(0,0,camera,null,true,v.id);assert.equal(km.keeperReach,0,'keeper reach clears when ball leaves');
other.kick=1;entry.sim.passRelease={id:other.id,x:other.x,y:other.y,tx:other.x+10,ty:other.y+10,target:keeper.id};runtime.update(0,0,camera,null,true,v.id);const motion=entry.rigs.get(other.id).root.userData.liveMotion;assert.equal(motion.actionKind,'pass');other.kick=.9;runtime.update(0,0,camera,null,true,v.id);assert(motion.kick>.42);// The tactical kick timer is still active, but the passer must already be running.
other.vx=70;other.vy=0;other.kick=1-.35*LIVE_GAME_SPEED/.45;runtime.update(0,0,camera,null,true,v.id);
assert(other.kick>0);assert.equal(motion.kick,undefined,'post-pass recovery releases gait within .35 real seconds');assert.equal(motion.facing,undefined,'recovered passer follows travel instead of locked pass direction');
other.kick=0;runtime.update(0,0,camera,null,true,v.id);assert.equal(motion.actionKind,undefined,'completed action metadata clears');
// MatchSim R uses (-faceY,faceX), opposite the rig's positive local-side vector.
for(const [foot,side]of[['R',-1],['L',1]]){entry.sim.ball.owner=other.id;Object.assign(entry.sim.recv,{id:other.id,t:.1,dur:.2,faceX:0,faceY:1,foot});runtime.update(0,0,camera,null,true,v.id);assert.equal(entry.rigs.get(other.id).root.userData.contactSide,side);}
entry.sim.recv.id=null;entry.sim.ball.owner=other.id;other.kick=0;runtime.update(0,0,camera,null,true,v.id);const held=entry.ball.position.clone();entry.sim.launch(other.id,other.x+40,other.y-40,200,0,keeper.id);runtime.update(0,0,camera,null,true,v.id);assert(entry.ball.position.distanceTo(held)<1e-9,'live release starts at last grounded foot contact without root-centre pop');
// Intended live passes reach the same boot on both sides before ownership changes.
runtime.setPaused(v.id,false);other.kick=0;const liveSides=[];
for(const incoming of[-1,1]){
 for(const player of Object.values(entry.sim.players))if(player.team!==other.team){player.x=260;player.y=395;}
 other.vx=0;other.vy=-30;entry.sim.recv.id=null;entry.sim.ball.owner=null;entry.sim.ball.target=other.id;entry.sim.ball.intBy=null;entry.sim.ball.height=0;entry.sim.ball.x=other.x+incoming*entry.sim.receptionRadius;entry.sim.ball.y=other.y;entry.sim.ball.vx=-incoming*100;entry.sim.ball.vy=0;
 runtime.update(0,0,camera,null,true,v.id);const before=entry.ball.position.clone(),r=entry.rigs.get(other.id),side=r.root.userData.contactSide,chosen=r.ballContact(side,new T.Vector3());chosen.y=.295;liveSides.push(side);assert(before.distanceTo(chosen)<1e-9,'live approach reaches selected boot at control boundary');
 entry.sim.ball.owner=other.id;entry.sim.ball.target=null;entry.sim.startTrap(other.id);runtime.update(0,0,camera,null,true,v.id);assert.equal(r.root.userData.contactSide,side,'preview and committed reception choose same foot');assert(entry.ball.position.distanceTo(before)<1e-9,'ownership handoff has no arrival pop');
}
assert.equal(liveSides[0],-liveSides[1],'live mirrored arrivals use opposite appropriate feet');
entry.sim.ball.owner=keeper.id;entry.sim.recv.id=null;runtime.update(0,0,camera,null,true,v.id);const kr=entry.rigs.get(keeper.id),lh=new T.Vector3(),rh=new T.Vector3();kr.handPositions(lh,rh);lh.lerp(rh,.5);lh.y-=v.elevation??0;assert(entry.ball.position.distanceTo(lh)<1e-9,'keeper holds controlled ball between hands');assert(entry.ball.position.y>.6,'keeper possession is raised above the pitch');
// Live defending requests ball-facing footwork at containment pace, then releases into pursuit.
const attacker=Object.values(entry.sim.players).find(p=>p.team!==other.team&&!p.isGK);
entry.sim.ball.owner=attacker.id;entry.sim.ball.target=null;entry.sim.recv.id=null;entry.sim.ball.x=other.x;entry.sim.ball.y=other.y+12;other.kick=0;other.vx=0;other.vy=-35;
runtime.update(0,0,camera,null,true,v.id);
const defensive=entry.rigs.get(other.id).root.userData.liveMotion;
assert(defensive.jockey>0,'nearby defender adopts containment posture');assert(Math.abs(defensive.facing)<.001,'retreating defender keeps chest toward attacker');
other.vy=-84;runtime.update(0,0,camera,null,true,v.id);
assert.equal(defensive.jockey,0,'full-speed recovery releases containment stance');assert.equal(defensive.facing,undefined,'chasing defender turns into travel');assert.equal(defensive.runIntensity,1,'full tactical pace remains a sprint despite slow playback');
// A translating passer recovers actual alternating steps while its tactical timer remains active.
const {createPlayer}=load('lib/graphics/player.ts');
for(const side of[-1,1]){
 const runner=createPlayer('pass-recovery','home');runner.update(0,0,1/60,0,false,{facing:0});
 let low=Infinity,high=-Infinity,grounded=0;
 for(let frame=1;frame<=54;frame++){
  const elapsed=frame/60,remaining=Math.max(0,1-elapsed*LIVE_GAME_SPEED/.45),phase=liveKickPhase(remaining);
  runner.update(0,elapsed*2,1/60,elapsed,false,{kick:phase<1?phase:undefined,kickSide:side,actionKind:'pass'});
  if(elapsed>=.35){
   const a=runner.root.getObjectByName('left-ankle').getWorldPosition(new T.Vector3()),b=runner.root.getObjectByName('right-ankle').getWorldPosition(new T.Vector3());
   low=Math.min(low,a.z-b.z);high=Math.max(high,a.z-b.z);
   if(Math.abs(Math.min(a.y,b.y)-.075)<.006)grounded++;
  }
 }
 assert(low<-.15&&high>.15,'both feet resume alternating strides after either-foot pass');
 assert(grounded>=30,'recovering run has a grounded support foot');runner.dispose();
}
// Each format advances its own live clock; recovery still takes the same real time.
for(const format of ['futsal','7v7','9v9','11v11']){
 runtime.update(0,0,camera,null,true,format); // Flush any distant-match time before measuring.
 const match=runtime.entries.find(e=>e.venue.id===format),start=match.sim.stats.time;
 for(let frame=0;frame<60;frame++)runtime.update(1/60,frame/60,camera,null,true,format);
 assert(Math.abs(match.sim.stats.time-start-liveGameSpeed(format))<1e-8,format+' consumes its real-time pace');
 for(const elapsed of [.08,.16,.24,.32])assert(Math.abs(liveKickPhase(1-elapsed*liveGameSpeed(format)/.45,liveGameSpeed(format))-liveKickPhase(1-elapsed*LIVE_GAME_SPEED/.45))<1e-8,format+' preserves real-time strike recovery');
}
runtime.dispose();console.log('FIELD_CONTACT_MOTION_PASS live kick progression, grounded rolls, mirrored receiving feet, stable release, exact arrival, backward seek, outcome gating and live metadata');
// Dribble clearance follows facing through turns, for both feet and differently sized players.
for(const scale of [.94,1,1.08,1.12])for(const side of [-1,1])for(let i=0;i<120;i++){
 const yaw=i*.12,p=groundDribbleContact(3,-2,yaw,side,i*.07,3,new T.Vector3(),scale);
 const ahead=(p.x-3)*Math.sin(yaw)+(p.z+2)*Math.cos(yaw);
 assert(ahead>=.5*scale-1e-9,'dribble never falls inside the stride on a turn');
}
const dribbler=createPlayer('clearance','home');
for(let i=0;i<180;i++){
 const yaw=i*.02;dribbler.update(Math.sin(yaw)*3,Math.cos(yaw)*3,1/60,i/60,false,{facing:yaw,dribbling:true});
 const point=dribbler.ballContact(i%2?-1:1,new T.Vector3()),root=dribbler.root;
 assert((point.x-root.position.x)*Math.sin(root.rotation.y)+(point.z-root.position.z)*Math.cos(root.rotation.y)>=.5-1e-9,'lesson dribble contact stays ahead of the body');
}dribbler.dispose();console.log('DRIBBLE_CLEARANCE_PASS turns, both feet, body scales, lesson rig');
// The narrowed lane stays within 8cm of a boot-derived ball-centre contact,
// less than half the ball radius, while avoiding full-width foot switching.
// Visible touches must periodically meet an actual boot contact point, not a
// separately animated position far ahead. Include scale and heading changes.
for(const scale of [.94,1,1.12])for(const speed of [1.5,3,5]){
 const rig=createPlayer('dribble-touch','home');rig.root.scale.setScalar(scale);let touches=0,maxAhead=0;const ball=new T.Vector3(),toe=new T.Vector3();
 for(let i=0;i<240;i++){const t=i/60,yaw=.25*Math.sin(t);rig.update(Math.sin(yaw)*t*speed,t*speed,1/60,t,false,{facing:yaw,dribbling:true});rig.dribbleContact(ball);let gap=Infinity;for(const name of ['left-ankle','right-ankle']){rig.root.getObjectByName(name).localToWorld(toe.set(0,-.025,.405));gap=Math.min(gap,toe.distanceTo(ball));}if(i>30&&gap<.08*scale)touches++;const ahead=(ball.x-rig.root.position.x)*Math.sin(rig.root.rotation.y)+(ball.z-rig.root.position.z)*Math.cos(rig.root.rotation.y);maxAhead=Math.max(maxAhead,ahead/scale);assert(ahead>=.5*scale-1e-9);}
 assert(touches>3,`missing visible dribble touches: speed=${speed}, scale=${scale}, touches=${touches}`);assert(maxAhead<.95,`dribble too far ahead ${maxAhead}`);rig.dispose();
}
console.log('DRIBBLE_TOUCH_PASS 9 speed/scale trajectories meet actual boots');
