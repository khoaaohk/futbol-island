const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set});return m.exports;}
const {createPlayer,ROLE_PROFILES}=load('lib/graphics/player.ts');
const DT=1/60,joint=(r,n)=>r.root.getObjectByName(n),world=(r,n)=>joint(r,n).getWorldPosition(new T.Vector3());
const pitch=r=>joint(r,'player-pelvis').rotation.x+joint(r,'armor-torso').rotation.x;
// Drive a rig through a velocity script at 60 fps and record both boots, the pelvis height and the body pitch.
function drive(role,frames,velocity,motion,scale=1){
 const r=createPlayer('seams-'+role,'home',false);if(role!=='plain')r.setProfile(ROLE_PROFILES[role]);if(scale!==1)r.root.scale.multiplyScalar(scale);
 const h=r.root.scale.y,out=[];let x=0,z=0;
 for(let i=0;i<frames;i++){const t=i*DT,[vx,vz]=velocity(t);x+=vx*DT;z+=vz*DT;r.update(x,z,DT,t,false,motion(t,i));r.root.updateMatrixWorld(true);
  out.push({left:world(r,'left-ankle'),right:world(r,'right-ankle'),pelvis:world(r,'player-pelvis').y/h,pitch:pitch(r),h});}
 r.dispose();return out;
}
// Largest one-frame move of a boot that is on the pitch in both frames (a skid or a pop), and the largest pelvis-height step.
function seams(s,from=20){let foot=0,pelvis=0;for(let i=Math.max(1,from);i<s.length;i++){const a=s[i-1],b=s[i],ground=.085*b.h;
 for(const k of['left','right'])if(a[k].y<ground&&b[k].y<ground)foot=Math.max(foot,Math.hypot(b[k].x-a[k].x,b[k].z-a[k].z));
 pelvis=Math.max(pelvis,Math.abs(b.pelvis-a.pelvis));}return {foot,pelvis};}

// 1-2. Jog, sprint, stops, cuts, plants and a running kick: no grounded boot jumps more than ~6 cm in a frame
// (the gait lift-off, lock releases and plant reaches all blend) and the hips move at most ~2.5 cm per frame.
const report={};
{
 const scenarios={
  jog:[()=>[0,3],()=>({facing:0,runIntensity:.35})],
  sprint:[()=>[0,6.5],()=>({facing:0,runIntensity:1})],
  sidewaysSprint:[()=>[6,2],()=>({facing:0,runIntensity:1})],
  standingStart:[t=>[0,t<1?0:5],()=>({})],
  stop:[t=>[0,t<1.5?6:Math.max(0,6-25*(t-1.5))],t=>({runIntensity:t<1.5?1:.5})],
  requestedStop:[t=>[0,t<1.5?5:Math.max(0,5-12*(t-1.5))],t=>({runIntensity:t<1.5?1:.9,brake:t>1.5&&t<2.2?1:0})],
  cut90:[t=>t<1.2?[0,5]:[5,0],()=>({runIntensity:1})],
  cut90Facing:[t=>t<1.2?[0,5]:[5,0],t=>({runIntensity:1,facing:t<1.2?0:Math.PI/2})],
  plant:[()=>[0,4],t=>({facing:0,runIntensity:.8,plant:t>1&&t<1.05?1:0})],
  kickOnTheRun:[()=>[0,4],t=>({facing:0,runIntensity:.8,kickSide:1,actionKind:'pass',kick:t>1&&t<1.6?(t-1)/.6:undefined})],
  receiveOnTheRun:[()=>[0,4],t=>({facing:0,runIntensity:.8,kickSide:-1,receive:t>1&&t<1.6?Math.sin((t-1)/.6*Math.PI):0})],
 };
 for(const role of['plain','fwd','def','gk'])for(const [name,[velocity,motion]]of Object.entries(scenarios)){
  const result=seams(drive(role,200,velocity,motion));report[role+' '+name]={foot:+result.foot.toFixed(3),pelvis:+result.pelvis.toFixed(3)};
  assert(result.foot<.06,`${role} ${name}: a grounded boot jumps ${result.foot.toFixed(3)} m in one frame`);
  assert(result.pelvis<.025,`${role} ${name}: the pelvis height pops ${result.pelvis.toFixed(3)} m in one frame`);
 }
 // The user's rig is host-scaled (1.12): world locks convert through the root scale.
 const you=seams(drive('you',200,t=>[0,t<1?0:5],()=>({brake:0}),1.12));report['you standingStart x1.12']={foot:+you.foot.toFixed(3),pelvis:+you.pelvis.toFixed(3)};
 assert(you.foot<.06,'the scaled user rig starts without skating: '+you.foot);
 console.log('SEAMS_PASS',JSON.stringify(report));
}

// 3. Kicking on the run: the support boot stays world-planted or re-steps through the air. It never drags.
{
 for(const kickSide of[1,-1]){
  const s=drive('plain',160,()=>[0,4],t=>({facing:0,runIntensity:.8,kickSide,actionKind:'shot',kick:t>1&&t<1.6?(t-1)/.6:undefined}));
  const support=kickSide===1?'left':'right';let drag=0,grounded=0;
  for(let i=61;i<96;i++){const a=s[i-1][support],b=s[i][support];if(b.y<.085){grounded++;if(a.y<.085)drag=Math.max(drag,Math.hypot(b.x-a.x,b.z-a.z));}}
  assert(drag<.02,`kick side ${kickSide}: the support boot drags ${drag.toFixed(3)} m in a frame`);
  assert(grounded>12,`kick side ${kickSide}: the support boot bears weight through the kick (${grounded} grounded frames)`);
 }
 console.log('KICK_SUPPORT_PASS');
}

// 4. The ready stance is a set position: at sprint speed it has faded out (no lunge), while standing it still crouches.
{
 const mean=(a,f)=>a.slice(90).reduce((n,v)=>n+f(v),0)/(a.length-90);
 for(const role of['plain','def','gk']){
  const ready=drive(role,180,()=>[0,6.5],()=>({facing:0,runIntensity:1,stance:'ready'})),plain=drive(role,180,()=>[0,6.5],()=>({facing:0,runIntensity:1}));
  assert(Math.abs(mean(ready,v=>v.pelvis)-mean(plain,v=>v.pelvis))<.01,role+' ready stance does not crouch at sprint speed');
  assert(Math.abs(mean(ready,v=>v.pitch)-mean(plain,v=>v.pitch))<.02,role+' ready stance adds no lunge lean at sprint speed');
  const still=drive(role,90,()=>[0,0],()=>({facing:0,stance:'ready'})),stand=drive(role,90,()=>[0,0],()=>({facing:0}));
  assert(still[89].pelvis<stand[89].pelvis-.04,role+' ready stance still crouches when set');
 }
 console.log('READY_FADE_PASS');
}

// 5. Braking sits back: an explicit brake request overrides the run lean even at full run intensity,
// and a paused (dt 0) frame keeps the brake instead of snapping back to the run lean.
{
 for(const role of['plain','mid','fwd','def']){
  for(const request of[.6,1]){
   const s=drive(role,150,()=>[0,5],t=>({facing:0,runIntensity:1,brake:t>1?request:0}));
   const worst=Math.max(...s.slice(80).map(v=>v.pitch));
   assert(worst<0,`${role} brake ${request}: the torso pitches back (worst ${worst.toFixed(3)} rad)`);
   let onset=0;for(let i=60;i<80;i++)onset=Math.max(onset,Math.abs(s[i].pitch-s[i-1].pitch));
   assert(onset<.15,`${role} brake ${request}: the sit-back loads over several frames (${onset.toFixed(3)} rad/frame)`);
  }
 }
 const r=createPlayer('seams-hold','home',false);let z=0;
 for(let i=0;i<90;i++){z+=5*DT;r.update(0,z,DT,i*DT,false,{facing:0,runIntensity:1,brake:i>60?1:0});}
 const braking=pitch(r),sunk=joint(r,'player-pelvis').position.y;
 for(let i=0;i<10;i++)r.update(0,z,0,1.5,false,{facing:0,runIntensity:1,brake:1});
 assert(braking<-.05&&Math.abs(pitch(r)-braking)<1e-9,'a held frame keeps the braking pitch');
 assert(Math.abs(joint(r,'player-pelvis').position.y-sunk)<1e-9,'a held frame keeps the braking sink');r.dispose();
 console.log('BRAKE_SIT_BACK_PASS');
}

// 6. Balance arms: bent elbows, hands low and wide beside the hips, never both arms reaching straight ahead.
{
 const arm=(r,side)=>{const s=world(r,side+'-shoulder'),e=world(r,side+'-elbow'),hand=joint(r,side+'-elbow').localToWorld(new T.Vector3(0,-.265,0));
  const upper=e.clone().sub(s).normalize(),fore=hand.clone().sub(e).normalize(),yaw=r.root.rotation.y;
  return {bend:Math.acos(T.MathUtils.clamp(upper.dot(fore),-1,1)),drop:s.y-hand.y,ahead:(hand.x-s.x)*Math.sin(yaw)+(hand.z-s.z)*Math.cos(yaw),out:Math.abs((hand.x-r.root.position.x)*Math.cos(yaw)-(hand.z-r.root.position.z)*Math.sin(yaw))};};
 const measured={};
 for(const [name,velocity,motion,frames]of[['brake',()=>[0,4],t=>({facing:0,runIntensity:.8,brake:t>1?1:0}),90],['backpedal',()=>[0,-2],()=>({facing:0,backpedal:1}),90],['ready',()=>[0,0],()=>({facing:0,stance:'ready'}),90]]){
  const r=createPlayer('seams-arms','home',false);let x=0,z=0;
  for(let i=0;i<frames;i++){const t=i*DT,[vx,vz]=velocity(t);x+=vx*DT;z+=vz*DT;r.update(x,z,DT,t,false,motion(t));}
  r.root.updateMatrixWorld(true);
  for(const side of['left','right']){const a=arm(r,side);measured[name+' '+side]=Object.fromEntries(Object.entries(a).map(([k,v])=>[k,+v.toFixed(3)]));
   assert(a.bend>.8,`${name} ${side}: the elbow is bent (${(a.bend*57.3).toFixed(0)} deg), not a straight arm`);
   assert(a.drop>.22,`${name} ${side}: the hand sits low (${a.drop.toFixed(3)} m below the shoulder)`);
   assert(a.ahead<.3,`${name} ${side}: the hand is not reaching forward (${a.ahead.toFixed(3)} m ahead)`);
   assert(a.out>.38,`${name} ${side}: the hand is out wide for balance (${a.out.toFixed(3)} m from the midline)`);}
  r.dispose();
 }
 // Keepers keep their own reach arms.
 const gk=createPlayer('seams-gk','home',false);gk.setProfile(ROLE_PROFILES.gk);for(let i=0;i<60;i++)gk.update(0,-i*.03,DT,i*DT,false,{facing:0,stance:'ready',backpedal:1,keeper:1,keeperReach:.6});
 assert(joint(gk,'left-shoulder').rotation.x<-.6&&Math.abs(joint(gk,'left-elbow').rotation.x+.65)<1e-9,'keeper reach still owns the arms');gk.dispose();
 console.log('BALANCE_ARMS_PASS',JSON.stringify(measured));
}
console.log('PLAYER_SEAMS_PASS boot seams, pelvis steps, running-kick support, ready fade, brake sit-back and hold, balance arms');
