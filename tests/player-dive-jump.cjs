// Keeper dive, jumping header and the upgraded slide (docs/bean-characters/CONTRACT.md, lane B).
// Run: node tests/player-dive-jump.cjs
// Parity: with no `dive`/`jump` field every joint must match the rig from before lane B, frame for frame
// (tests/fixtures/player-motion-parity.json, written from that rig with --write-golden PLAYER_TS=<old file>).
// 2026-09-28: only the "keeper" hash was re-recorded (the other nine are unchanged). It is the one scenario that
// steps sideways, and the sideways-gait fix in lib/graphics/player.ts ("a lead boot in its last 3 cm sets down as
// soon as the trailing one lifts off") lands the lead boot one frame earlier, so both boots are never airborne.
// No dive or jump code changed: every dive/jump/slide assertion below passes before and after.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto'),T=require('three');
const ROOT=path.resolve(__dirname,'..'),GRAPHICS=path.join(ROOT,'lib/graphics');
const loaded=new Map();
function load(file,relativeDir){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);const dir=relativeDir??path.dirname(file);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(dir,n+'.ts')):require(n),console,Math,Map,WeakMap,Set,Float64Array,URLSearchParams});return m.exports;}
const style=load(path.join(GRAPHICS,'characterStyle.ts'));
const PLAYER=process.env.PLAYER_TS?path.resolve(process.env.PLAYER_TS):path.join(GRAPHICS,'player.ts');
const {createPlayer,profileFor,DIVE_PHASE,JUMP_PHASE,DIVE_KINDS}=load(PLAYER,GRAPHICS);
const DT=1/60,GOLDEN=path.join(__dirname,'fixtures/player-motion-parity.json');
const J=(r,n)=>r.root.getObjectByName(n),W=(r,n)=>J(r,n).getWorldPosition(new T.Vector3());
const JOINTS=['player-pelvis','armor-torso','player-lumbar','player-chest','player-head','left-shoulder','right-shoulder','left-elbow','right-elbow','left-hand','right-hand','left-hip','right-hip','left-knee','right-knee','left-ankle','right-ankle'];
const jointState=r=>{const v=[];for(const n of JOINTS){const o=J(r,n);v.push(o.position.x,o.position.y,o.position.z,o.quaternion.x,o.quaternion.y,o.quaternion.z,o.quaternion.w,o.scale.x,o.scale.y,o.scale.z);}v.push(r.root.position.x,r.root.position.z,r.root.rotation.y);return v;};

// ---------------------------------------------------------------- 1. parity with the pre-dive rig
// Every behaviour the rig had before (gait, sprint + brake, cut + plant, backpedal/jockey/ready, kicks,
// receives, the upright reactions, "to me!", squash, keeper reach, profiles) with no dive/jump field.
const SCENARIOS={
 sprintBrake:{role:'fwd',frames:170,m:(i,s)=>{const v=i<70?Math.min(7,i*.12):Math.max(0,7-(i-70)*.2);s.z+=v*DT;return {facing:0,runIntensity:v/7,brake:i>70&&v>0?1:0};}},
 cutPlant:{role:'mid',frames:150,m:(i,s)=>{const h=i<70?0:Math.min(1.5,(i-70)*.12);s.x+=Math.sin(h)*5*DT;s.z+=Math.cos(h)*5*DT;return {facing:h,runIntensity:.7,intentHeading:i>60?1.5:0,plant:i>66&&i<78?1:0};}},
 backpedalJockey:{role:'def',frames:160,m:(i,s)=>{s.z-=(i<120?2.2:0)*DT;s.x+=.4*Math.sin(i*.06)*DT;return {facing:Math.PI,backpedal:i<120?.9:0,jockey:.8,stance:i>120?'ready':undefined,lookX:0,lookZ:s.z-2};}},
 shot:{role:'fwd',frames:120,m:(i,s)=>{const v=i<60?3:Math.max(0,3-(i-60)*.1);s.z+=v*DT;const k=i<50?undefined:Math.min(1,(i-50)/45);return {facing:0,runIntensity:v/7,kick:k,actionKind:'shot',powerKick:true,shotPower:.8,kickSide:-1,strikeX:-.14,strikeZ:.65};}},
 pass:{role:'mid',frames:100,m:(i,s)=>{const k=i<30?undefined:Math.min(1,(i-30)/40);return {facing:0,kick:k,actionKind:'pass',kickSide:1,strikeX:.14,strikeZ:.6};}},
 receive:{role:'mid',frames:100,m:(i,s)=>({facing:.3,receive:i>20&&i<80?1:0,receiveProgress:Math.max(0,Math.min(1,(i-40)/30)),kickSide:1,lookX:.2,lookZ:2,lookY:.3})},
 reactions:{role:'mid',frames:260,m:(i,s)=>{const k=['chest','thigh','header','deflect','dejected'][Math.floor(i/52)]??undefined,q=(i%52)/52;return {facing:0,reaction:k,reactionProgress:q,kickSide:i%104<52?1:-1,squash:-2,squashSerial:1+Math.floor(i/52)};}},
 calledSquash:{role:'npc',frames:120,m:(i,s)=>{s.x+=1.2*DT;return {facing:1.2,called:i>20&&i<90?1:0,lookX:s.x-3,lookZ:1,squash:i<60?3:-3,squashSerial:i<60?1:2};}},
 keeper:{role:'gk',frames:140,m:(i,s)=>{s.x+=Math.sin(i*.05)*2*DT;return {facing:Math.PI,keeper:1,keeperReach:Math.max(0,Math.sin(i*.04)),stance:'ready',lookX:s.x,lookZ:-4};}},
 walkIdle:{role:'you',frames:140,m:(i,s)=>{s.z+=(i<80?1.3:0)*DT;return {runIntensity:i<80?.2:0,scanYaw:.4*Math.sin(i*.05)};}},
};
function runScenario(name){
 const sc=SCENARIOS[name],r=createPlayer('parity-'+name,name.length%2?'home':'away',false),s={x:0,z:0},h=crypto.createHash('sha256');
 r.setProfile(profileFor(sc.role,name.length*7));
 for(let i=0;i<sc.frames;i++){const m=sc.m(i,s);r.update(s.x,s.z,DT,i*DT,false,m);if(i%2===0)h.update(jointState(r).map(v=>(Math.abs(v)<5e-10?0:v).toFixed(8)).join(','));}
 r.dispose();return h.digest('hex');
}
if(process.argv.includes('--write-golden')){
 const out={};for(const name of Object.keys(SCENARIOS))out[name]=runScenario(name);
 fs.mkdirSync(path.dirname(GOLDEN),{recursive:true});fs.writeFileSync(GOLDEN,JSON.stringify(out,null,1)+'\n');console.log('wrote',GOLDEN);process.exit(0);
}
{
 const golden=JSON.parse(fs.readFileSync(GOLDEN,'utf8'));
 for(const st of ['classic','bean']){style.setCharacterStyle(st);
  for(const name of Object.keys(SCENARIOS))assert.equal(runScenario(name),golden[name],`${name} (${st}): no dive/jump field ⇒ identical joints to the pre-dive rig`);}
 style.setCharacterStyle(undefined);
}

// ---------------------------------------------------------------- helpers
// Lowest visible vertex (classic meshes are real geometry) and, for the bean style (vertex-shader tubes and a
// lathe body), the conservative bean shape: body capsule r .31 along the torso, limb tubes along the joints.
const BOOT=/-ankle$/;
function lowest(r){
 r.root.updateMatrixWorld(true);let body=Infinity,boot=Infinity;const v=new T.Vector3();
 r.root.traverse(o=>{if(!o.isMesh)return;for(let q=o;q;q=q.parent)if(!q.visible)return;const pos=o.geometry.attributes.position,isBoot=BOOT.test(o.parent?.name??'');
  for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);if(isBoot)boot=Math.min(boot,v.y);else body=Math.min(body,v.y);}});
 return {body,boot};
}
function beanLowest(r){
 r.root.updateMatrixWorld(true);let low=Infinity;const p=new T.Vector3(),q=new T.Vector3();
 const seg=(a,b,ra,rb)=>{for(let k=0;k<=8;k++){const t=k/8;p.lerpVectors(a,b,t);low=Math.min(low,p.y-(ra+(rb-ra)*t));}};
 // Bean lathe (prototype bean.js, widest build): torso-local y −.13 … 1.02, radius .32·(1−|2u−1|^2.2)^(1/2.2).
 const torso=J(r,'armor-torso');for(let k=0;k<=20;k++){const u=k/20;p.set(0,-.13+u*1.15,0);torso.localToWorld(p);low=Math.min(low,p.y-.32*Math.pow(Math.max(0,1-Math.pow(Math.abs(2*u-1),2.2)),1/2.2));}
 for(const s of ['left','right']){
  const sh=W(r,s+'-shoulder'),el=W(r,s+'-elbow'),hand=J(r,s+'-elbow').localToWorld(new T.Vector3(0,-.265,0));seg(sh,el,.058,.05);seg(el,hand,.05,.045);low=Math.min(low,hand.y-.06);
  const hip=W(r,s+'-hip'),kn=W(r,s+'-knee'),an=W(r,s+'-ankle');seg(hip,kn,.068,.06);seg(kn,an,.06,.05);
 }
 return low;
}
const finite=r=>{let ok=true;r.root.updateMatrixWorld(true);r.root.traverse(o=>{for(const e of o.matrixWorld.elements)if(!Number.isFinite(e))ok=false;});return ok;};
const handsOf=r=>[J(r,'left-elbow').localToWorld(new T.Vector3(0,-.265,0)),J(r,'right-elbow').localToWorld(new T.Vector3(0,-.265,0))];
const torsoUp=r=>new T.Vector3(0,1,0).applyQuaternion(J(r,'armor-torso').getWorldQuaternion(new T.Quaternion()));
// Flat-footed standing depth of a boot for a profile: the classic sole rests a few mm into the pitch surface
// in the ordinary gait (more for longer legs/taller profiles). A pushing or landing boot may sit ≤ 6 mm deeper (sole contact).
const flatBoot=(role,seed)=>{const r=createPlayer('stand-'+role,'home',false);r.setProfile(profileFor(role,seed));for(let i=0;i<40;i++)r.update(0,0,DT,i*DT,false,{facing:0});const b=lowest(r).boot;r.dispose();return b;};
const standingBoot=flatBoot('gk',4),fwdBoot=flatBoot('fwd',9),defBoot=flatBoot('def',5);
// Runs a full keeper dive in place (the host keeps the root still), returning per-frame samples.
function dive(dir,height,{st='classic',dur=1.6,reduced=false,tail=24}={}){
 style.setCharacterStyle(st);const r=createPlayer('gk-'+st+dir+height,'home',false);r.setProfile(profileFor('gk',4));style.setCharacterStyle(undefined);
 for(let i=0;i<40;i++)r.update(0,0,DT,i*DT,false,{facing:0,keeper:1,stance:'ready',kickSide:1});
 const frames=[],n=Math.round(dur/DT);
 for(let i=0;i<=n+tail;i++){const p=i/n,m={facing:0,keeper:1,stance:'ready',kickSide:1,dive:p<=1?{progress:p,dir,height}:undefined};
  r.update(0,0,DT,(40+i)*DT,reduced,m);
  const low=lowest(r),up=torsoUp(r),[lh,rh]=handsOf(r);
  frames.push({p,low,bean:st==='bean'?beanLowest(r):undefined,pelvis:W(r,'player-pelvis'),head:W(r,'player-head'),hands:[lh,rh],ankles:[W(r,'left-ankle'),W(r,'right-ankle')],up,squash:J(r,'armor-torso').scale.y,finite:finite(r),joints:jointState(r)});
 }
 return {r,frames};
}
const at=(frames,p)=>frames.reduce((a,b)=>Math.abs(b.p-p)<Math.abs(a.p-p)?b:a);

// ---------------------------------------------------------------- 2. keeper dive
for(const dir of [-1,1])for(const height of [0,.5,1]){
 const {r,frames}=dive(dir,height),tag=`dive dir ${dir} h ${height}`;
 const stand=frames[0],set=at(frames,.09),contact=at(frames,DIVE_PHASE.contact),lying=at(frames,.52),done=frames[frames.length-1];
 assert(frames.every(f=>f.finite),tag+': no NaN/Infinity in any matrix');
 // Set: the keeper sinks into his set position before the push-off.
 assert(set.pelvis.y<stand.pelvis.y-.04,tag+': sets low before the push-off');
 // Flight: airborne and stretched, rolled toward the ball, a clear gap under the body at mid-flight.
 const mid=at(frames,(DIVE_PHASE.lift+DIVE_PHASE.land)/2+.02);
 assert(mid.low.body>.05+.12*height,tag+`: airborne with a clear gap to the grass mid-flight (${mid.low.body.toFixed(3)})`);
 assert(Math.min(mid.low.boot,mid.low.body)>.03,tag+': boots off the grass in flight');
 assert(contact.up.x*dir>.8,tag+`: body rolled toward the ball at contact (up.x ${contact.up.x.toFixed(2)})`);
 // Hands lead: both gloves beyond the head toward the ball; the top hand over the bottom one.
 for(const h of contact.hands)assert((h.x-contact.head.x)*dir>.05,tag+': both hands lead the dive past the head');
 const [top,bottom]=dir>0?[contact.hands[0],contact.hands[1]]:[contact.hands[1],contact.hands[0]];
 assert(top.y>bottom.y+.3,tag+': top hand over, bottom hand under');
 // Land on the side and rest on the grass (touching, not clipping), then get up.
 assert(Math.abs(lying.up.y)<.35&&lying.up.x*dir>.9,tag+': lying on the side after landing');
 assert(lying.low.body<.08&&lying.low.body>=0,tag+`: the body rests on the grass (${lying.low.body.toFixed(3)})`);
 // Root trajectory (the pelvis is the body root): dip, flight arc, low while lying, back to standing height.
 const lift=at(frames,DIVE_PHASE.lift),landF=at(frames,DIVE_PHASE.land+.06);
 const peak=frames.filter(f=>f.p>DIVE_PHASE.lift&&f.p<DIVE_PHASE.land).reduce((a,b)=>b.pelvis.y>a.pelvis.y?b:a);
 assert(peak.pelvis.y>landF.pelvis.y+.15,tag+': the hips arc through the air before landing');
 assert(landF.pelvis.y<stand.pelvis.y-.2,tag+': the hips come down onto the grass');
 assert(Math.abs(done.pelvis.y-stand.pelvis.y)<.02&&Math.abs(done.up.y-1)<.02,tag+': back up in the ready stance');
 // Landing squash fires once on impact.
 const after=frames.filter(f=>f.p>DIVE_PHASE.land&&f.p<DIVE_PHASE.land+.12);
 assert(Math.min(...after.map(f=>f.squash))<.95,tag+': landing squash fires');
 assert(frames.filter(f=>f.p<DIVE_PHASE.land).every(f=>Math.abs(f.squash-1)<1e-9),tag+': no squash before the landing');
 // Nothing below the pitch at any frame (boots no deeper than they stand in the ready stance).
 for(const f of frames){assert(f.low.body>=0,tag+` p=${f.p.toFixed(2)}: body/limbs below the pitch (${f.low.body.toFixed(4)})`);assert(f.low.boot>=standingBoot-.006,tag+` p=${f.p.toFixed(2)}: boot below its flat standing depth (${f.low.boot.toFixed(4)})`);}
 // Smooth: no pelvis pop larger than a hard fall per frame.
 for(let i=1;i<frames.length;i++)assert(frames[i].pelvis.distanceTo(frames[i-1].pelvis)<.09,tag+` p=${frames[i].p.toFixed(2)}: pelvis jumps ${frames[i].pelvis.distanceTo(frames[i-1].pelvis).toFixed(3)} m in one frame`);
 r.dispose();
}
// Foot locks release: planted in the set, both boots travel with the body during the flight.
{
 const {r,frames}=dive(1,.5),stand=frames[0],mid=at(frames,.3);
 for(let i=0;i<2;i++)assert(mid.ankles[i].distanceTo(stand.ankles[i])>.3,'dive: boot '+i+' released from its lock during the flight');
 // Take-off foot: the near boot (dive side, +x here) power-steps out toward the ball and is the last to leave the
 // grass; the far knee drives across first.
 const pre=at(frames,DIVE_PHASE.lift-.012),stepped=at(frames,DIVE_PHASE.push);
 assert((stepped.ankles[1].x-stand.ankles[1].x)>.08,'dive: the near boot steps out toward the ball');
 assert(pre.ankles[1].y<.17&&pre.ankles[0].y>pre.ankles[1].y+.15,`dive: near boot drives last, far knee first (${pre.ankles[1].y.toFixed(2)} / ${pre.ankles[0].y.toFixed(2)})`);
 r.dispose();
}
// Bean style: the wider round body (conservative shape) also stays on or above the grass, both directions.
for(const dir of [-1,1])for(const height of [0,1]){
 const {r,frames}=dive(dir,height,{st:'bean'});
 for(const f of frames)assert(f.bean>=-.002,`bean dive dir ${dir} h ${height} p=${f.p.toFixed(2)}: bean body/limb below the pitch (${f.bean.toFixed(4)})`);
 const lying=at(frames,.52);assert(lying.bean<.1,`bean dive dir ${dir}: rests on the grass while lying (${lying.bean.toFixed(3)})`);
 r.dispose();
}
// Reduced motion keeps the save (roll, land, get up) but a calmer flight; still never below the pitch.
{
 const full=dive(1,.5),calm=dive(1,.5,{reduced:true}),pk=f=>Math.max(...f.frames.filter(x=>x.p>DIVE_PHASE.lift&&x.p<DIVE_PHASE.land).map(x=>x.pelvis.y));
 assert(pk(calm)<pk(full),'reduced motion: a lower flight arc');
 for(const f of calm.frames)assert(f.low.body>=0,'reduced dive stays above the pitch');
 full.r.dispose();calm.r.dispose();
}
// Clearing the field mid-dive fades out (~.15 s) instead of snapping.
{
 const r=createPlayer('gk-cut','home',false);for(let i=0;i<30;i++)r.update(0,0,DT,i*DT,false,{facing:0,keeper:1});
 for(let i=0;i<30;i++)r.update(0,0,DT,(30+i)*DT,false,{facing:0,keeper:1,dive:{progress:i/96,dir:1,height:.5}});
 const before=W(r,'player-pelvis');r.update(0,0,DT,60*DT,false,{facing:0,keeper:1});const after=W(r,'player-pelvis');
 assert(before.distanceTo(after)<.12,'cleared dive fades instead of snapping: '+before.distanceTo(after).toFixed(3));
 for(let i=0;i<20;i++)r.update(0,0,DT,(61+i)*DT,false,{facing:0,keeper:1});
 assert(Math.abs(torsoUp(r).y-1)<.05,'cleared dive has fully faded out');r.dispose();
}
// A diving keeper travelling sideways (host root travel) keeps facing the shooter when no facing is given.
{
 const r=createPlayer('gk-slide','home',false);for(let i=0;i<30;i++)r.update(0,0,DT,i*DT,false,{facing:0,keeper:1});
 let x=0;for(let i=0;i<60;i++){x+=(i>12&&i<32?4:0)*DT;r.update(x,0,DT,(30+i)*DT,false,{keeper:1,dive:{progress:i/96,dir:1,height:.5}});}
 assert(Math.abs(r.root.rotation.y)<.05,'diving keeper does not turn to face his own sideways travel');r.dispose();
}

// ---------------------------------------------------------------- 2b. keeper save types, take-off foot and hands
if(DIVE_KINDS){
 const handsMid=f=>f.hands[0].clone().add(f.hands[1]).multiplyScalar(.5),gap=f=>f.hands[0].distanceTo(f.hands[1]);
 function save(kind,outcome,dir,height,st='classic'){
  style.setCharacterStyle(st);const r=createPlayer('gk-'+kind+outcome+dir+st,'home',false);r.setProfile(profileFor('gk',4));style.setCharacterStyle(undefined);
  for(let i=0;i<40;i++)r.update(0,0,DT,i*DT,false,{facing:0,keeper:1,stance:'ready',kickSide:1});
  const frames=[],n=Math.round(1.6/DT);
  for(let i=0;i<=n+20;i++){const p=i/n;r.update(0,0,DT,(40+i)*DT,false,{facing:0,keeper:1,stance:'ready',kickSide:1,dive:p<=1?{progress:p,dir,height,kind,outcome}:undefined});
   const [lh,rh]=handsOf(r);frames.push({p,low:lowest(r),bean:st==='bean'?beanLowest(r):undefined,hands:[lh,rh],ankles:[W(r,'left-ankle'),W(r,'right-ankle')],chest:W(r,'player-chest'),head:W(r,'player-head'),pelvis:W(r,'player-pelvis'),up:torsoUp(r),finite:finite(r)});}
  r.dispose();return frames;
 }
 const HEIGHT={side:.5,collapse:0,tip:1,spring:.5,smother:.2,stand:.8};
 for(const kind of Object.keys(DIVE_KINDS))for(const outcome of ['catch','parry','tip'])for(const dir of [-1,1]){
  const K=DIVE_KINDS[kind],f=save(kind,outcome,dir,HEIGHT[kind]),tag=`${kind}/${outcome} dir ${dir}`,c=at(f,K.contact),stand=f[0];
  assert(f.every(x=>x.finite),tag+': finite');
  for(const x of f){assert(x.low.body>=0,`${tag} p=${x.p.toFixed(2)}: below the pitch (${x.low.body.toFixed(4)})`);assert(x.low.boot>=standingBoot-.006,`${tag} p=${x.p.toFixed(2)}: boot too deep`);}
  for(let i=1;i<f.length;i++)assert(f[i].pelvis.distanceTo(f[i-1].pelvis)<(kind==='collapse'?.13:.1),`${tag} p=${f[i].p.toFixed(2)}: pelvis pops`);
  assert(Math.abs(f[f.length-1].pelvis.y-stand.pelvis.y)<.02,tag+': back in the set position');
  const near=dir<0?0:1,far=1-near;
  if(K.roll>0){
   // Take-off foot: the near boot (dive side) is planted and drives last; the far knee lifts first (no knee drive in a collapse).
   const pre=at(f,K.lift-.012);assert(pre.ankles[near].y<.17,`${tag}: near boot still on the grass before the lift (${pre.ankles[near].y.toFixed(2)})`);
   if(kind!=='collapse')assert(pre.ankles[far].y>pre.ankles[near].y+.12,`${tag}: far knee drives first`);
   assert((at(f,K.push).ankles[near].x-stand.ankles[near].x)*dir>.05,`${tag}: near boot steps toward the ball`);
   // At contact the gloves lead toward the ball, beyond the head.
   // (A spring save stays more upright: its gloves reach up-and-across, so their midpoint leads.)
   if(outcome!=='tip')for(const h of kind==='spring'?[handsMid(c)]:c.hands)assert((h.x-c.head.x)*dir>0,`${tag}: gloves lead past the head`);
   if(outcome==='tip'){const top=c.hands[far];assert(top.y>c.head.y&&(top.x-c.pelvis.x)*dir>.3,`${tag}: the top hand reaches up for the tip`);}
  }
  if(kind==='tip'&&outcome!=='catch')assert(Math.max(c.hands[0].y,c.hands[1].y)>1.5,tag+': a top-corner save reaches above 1.5 m');
  if(kind==='smother')assert(gap(c)>1.4&&c.pelvis.y<stand.pelvis.y-.2,tag+': spread low and wide at the feet');
  // Catch: the gloves meet behind the ball (a ball's width apart), then hold it against the chest.
  if(outcome==='catch'&&kind!=='smother'){
   assert(gap(c)<.5,`${tag}: gloves together at contact (${gap(c).toFixed(2)})`);
   const held=at(f,Math.min(K.contact+.15,K.rise-.02)),mid=handsMid(held);
   assert(gap(held)>.3&&gap(held)<.55,`${tag}: the ball fits between the gloves (${gap(held).toFixed(2)})`);
   assert(mid.distanceTo(held.chest)<.55,`${tag}: the ball is held in at the chest (${mid.distanceTo(held.chest).toFixed(2)})`);
  }
  if(kind==='stand'&&outcome==='catch')assert(handsMid(c).y>stand.head.y-.2,tag+': W catch at the forehead for a high ball');
 }
 // Basket catch at the chest for a mid-height ball at the body.
 {const f=save('stand','catch',1,.3),c=at(f,DIVE_KINDS.stand.contact),m=handsMid(c);assert(m.y<c.chest.y+.25&&m.y>c.chest.y-.35,'basket catch at the chest');}
 // Bean style: every save type stays on or above the pitch.
 for(const kind of Object.keys(DIVE_KINDS))for(const dir of [-1,1]){const f=save(kind,'catch',dir,HEIGHT[kind],'bean');for(const x of f)assert(x.bean>=-.002,`bean ${kind} dir ${dir} p=${x.p.toFixed(2)}: below the pitch`);}
 // Live: the save type follows the shot, the hands follow the sim's outcome, and a tip goes over the bar for a corner.
 const choreo=load(path.join(ROOT,'lib/town/match/choreo.ts')),{MatchSim}=load(path.join(ROOT,'lib/town/match/matchSim.ts'));
 for(const k of Object.keys(DIVE_KINDS))assert.equal(choreo.DIVE_KIND_CONTACT[k],DIVE_KINDS[k].contact,'choreo contact for '+k);
 const kinds={},outcomes={};let tips=0,tipsOver=0,tipGoals=0,caught=0,inGloves=0;
 for(const fmt of ['11v11','7v7'])for(let seed=0;seed<5;seed++){
  const rate=.32,sim=new MatchSim(300+seed*37,fmt);sim.windupScale=rate;const ch=choreo.createChoreo(),was=new Map(),m={};let seen=0,watchTip=null;
  for(let i=0,n=Math.round(5*60/rate*60);i<n;i++){const wasShot=sim.shotActive;sim.step(rate/60);ch.consume(sim,1/60);
   for(const id of sim.ids){if(!sim.players[id].isGK)continue;for(const k in m)delete m[k];ch.apply(id,m,0);if(m.dive&&!was.get(id)){kinds[m.dive.kind]=(kinds[m.dive.kind]??0)+1;outcomes[m.dive.outcome]=(outcomes[m.dive.outcome]??0)+1;}was.set(id,!!m.dive);}
   for(let q=Math.max(seen+1,sim.touchSerial-7);q<=sim.touchSerial;q++){const ev=sim.touches[(q-1)%8];if(ev.serial!==q)continue;
    if(ev.kind==='parry'&&sim.ball.height>sim.venue.goalHeight){tips++;watchTip={t:sim.stats.time,goals:sim.score.gold+sim.score.blue};}
    if(ev.kind==='receive'&&sim.players[ev.id].isGK&&wasShot){caught++;for(const k in m)delete m[k];ch.apply(ev.id,m,0);if(!m.dive||m.dive.outcome==='catch')inGloves++;}}
   seen=sim.touchSerial;
   if(watchTip&&sim.stats.time-watchTip.t>1.2){if(sim.restart&&sim.restart.kind==='corner'||sim.msg==='Corner!')tipsOver++;if(sim.score.gold+sim.score.blue>watchTip.goals)tipGoals++;watchTip=null;}
  }
 }
 assert(Object.keys(kinds).length>=5,'live: several save types occur ('+JSON.stringify(kinds)+')');
 assert((outcomes.catch??0)>0&&(outcomes.parry??0)>0,'live: catches and parries');
 assert(tipsOver>=tips*.8&&tipGoals===0,`live: tipped balls go over the bar for a corner (${tipsOver}/${tips}, goals ${tipGoals})`);
 // Deterministic tip: a high shot the keeper reaches with a deflection rolled → up over the bar, a corner, never a goal.
 for(const fmt of ['11v11','7v7','futsal'])for(const side of [-1,1]){
  const sim=new MatchSim(11,fmt);sim.windupScale=.32;for(let i=0;i<60;i++)sim.step(1/30);
  const gk=sim.ids.find(id=>sim.players[id].isGK&&sim.players[id].y<200),g=sim.players[gk];
  sim.possession=sim.players[gk].team==='gold'?'blue':'gold';sim.restart=null;sim.goalHold=0;
  sim.ball.owner=null;sim.ball.target=null;sim.ball.intBy=null;sim.ball.x=g.x+side*6;sim.ball.y=g.y+30;sim.ball.vx=-side*14;sim.ball.vy=-320;sim.ball.height=1.8;
  sim.ballIsShot=true;sim.shotIsGoal=false;sim.ballFlight=0;sim.saveRoll=.1;sim.lastKick.shotHeight=1.25;sim.lastKick.fromY=g.y+30;sim.lastKick.goalY=4;
  assert.equal(sim.saveOutcome,'tip',fmt+': a high deflected shot is a tip');
  const goals=sim.score.gold+sim.score.blue,serial=sim.touchSerial;let tipped=false,corner=false;
  for(let i=0;i<120;i++){sim.step(1/60);for(let q=serial+1;q<=sim.touchSerial;q++){const ev=sim.touches[(q-1)%8];if(ev.kind==='parry'&&ev.id===gk)tipped=true;}if(sim.restart&&sim.restart.kind==='corner')corner=true;}
  assert(tipped,fmt+' '+side+': the keeper tips it');
  assert(corner&&sim.score.gold+sim.score.blue===goals,fmt+' '+side+': over the bar for a corner, not a goal');
 }
 assert(caught>0&&inGloves===caught,'live: every caught SHOT shows catching hands');
}

// ---------------------------------------------------------------- 3. jumping header
function jump(height,{header=true,st='classic',run=0}={}){
 style.setCharacterStyle(st);const r=createPlayer('jump-'+st+height,'away',false);r.setProfile(profileFor('fwd',9));style.setCharacterStyle(undefined);
 let z=0;for(let i=0;i<40;i++){z+=run*DT;r.update(0,z,DT,i*DT,false,{facing:0,runIntensity:run/7});}
 const frames=[],n=Math.round(.95/DT);
 for(let i=0;i<=n+20;i++){const p=i/n;z+=run*(1-Math.min(1,p*1.5))*DT;
  const m={facing:0,runIntensity:run/7,jump:p<=1?{progress:p,height}:undefined};
  if(header&&p>.12&&p<=1){m.reaction='header';m.reactionProgress=Math.min(1,(p-.12)/.6);}
  r.update(0,z,DT,(40+i)*DT,false,m);
  frames.push({p,low:lowest(r),bean:st==='bean'?beanLowest(r):undefined,pelvis:W(r,'player-pelvis'),head:W(r,'player-head'),ankles:[W(r,'left-ankle'),W(r,'right-ankle')],knee:J(r,'left-knee').rotation.x+J(r,'right-knee').rotation.x,squash:J(r,'armor-torso').scale.y,headPitch:J(r,'player-head').rotation.x,finite:finite(r)});
 }
 return {r,frames};
}
for(const height of [.2,.45]){
 const {r,frames}=jump(height),tag='jump '+height,stand=frames[0];
 assert(frames.every(f=>f.finite),tag+': no NaN');
 const load=at(frames,.18),peak=at(frames,JUMP_PHASE.peak),landed=at(frames,JUMP_PHASE.land+.05),done=frames[frames.length-1];
 assert(load.pelvis.y<stand.pelvis.y-.08,tag+': loads (knees bend) before the take-off');
 assert(Math.abs(peak.pelvis.y-stand.pelvis.y-height)<.08,tag+`: the root lifts by the jump height at the peak (${(peak.pelvis.y-stand.pelvis.y).toFixed(3)})`);
 const top=frames.reduce((a,b)=>b.pelvis.y>a.pelvis.y?b:a);assert(Math.abs(top.p-JUMP_PHASE.peak)<.05,tag+': the peak is at the header contact');
 assert(peak.knee>stand.knee+.5,tag+': legs tucked in the air');
 assert(Math.min(...peak.ankles.map(a=>a.y))>.075+height*.6,tag+': both boots off the grass at the peak');
 // Landing squash on both feet.
 for(const a of landed.ankles)assert(a.y<.1,tag+': lands on both feet');
 assert(landed.pelvis.y<stand.pelvis.y-.05,tag+': knees give on landing');
 const post=frames.filter(f=>f.p>JUMP_PHASE.land&&f.p<JUMP_PHASE.land+.15);assert(Math.min(...post.map(f=>f.squash))<.95,tag+': landing squash fires');
 const pre=frames.filter(f=>f.p>JUMP_PHASE.takeoff&&f.p<JUMP_PHASE.takeoff+.1);assert(Math.max(...pre.map(f=>f.squash))>1.02,tag+': take-off stretch');
 assert(Math.abs(done.pelvis.y-stand.pelvis.y)<.02,tag+': back to standing');
 for(const f of frames){assert(f.low.body>=0,tag+` p=${f.p.toFixed(2)}: body below the pitch`);assert(f.low.boot>=fwdBoot-.006,tag+` p=${f.p.toFixed(2)}: boot below its standing depth (${f.low.boot.toFixed(4)})`);}
 r.dispose();
}
// The header reaction rides on the jump: the head snaps through the ball at the peak.
{
 const withHeader=jump(.4),plain=jump(.4,{header:false});
 const a=at(withHeader.frames,JUMP_PHASE.peak+.04),b=at(plain.frames,JUMP_PHASE.peak+.04);
 assert(Math.abs(a.pelvis.y-b.pelvis.y)<.03,'header + jump: the same flight');
 assert(Math.abs(a.headPitch-b.headPitch)>.15,'header + jump: the header pose shows on top of the jump');
 withHeader.r.dispose();plain.r.dispose();
 const running=jump(.35,{run:4});for(const f of running.frames){assert(f.finite&&f.low.body>=0,'running jump stays finite and above the pitch');}
 const bean=jump(.45,{st:'bean'});for(const f of bean.frames)assert(f.bean>=-.002,'bean jump above the pitch p='+f.p.toFixed(2));
 running.r.dispose();bean.r.dispose();
}

// ---------------------------------------------------------------- 4. slide tackle: low hips, lean back, lead leg along the grass
for(const st of ['classic','bean'])for(const side of [-1,1]){
 style.setCharacterStyle(st);const r=createPlayer('slide-'+st+side,'home',false);r.setProfile(profileFor('def',5));style.setCharacterStyle(undefined);
 let z=0;for(let i=0;i<40;i++){z+=5*DT;r.update(0,z,DT,i*DT,false,{facing:0,runIntensity:.8});}
 const n=Math.round(.95/DT);let best=null;
 for(let i=0;i<=n+15;i++){const q=Math.min(1,i/n);z+=5*(1-.85*q)*DT;r.update(0,z,DT,(40+i)*DT,false,{facing:0,kickSide:side,runIntensity:.6,reaction:i<=n?'slide':undefined,reactionProgress:q});
  const low=lowest(r);assert(low.body>=0,`slide ${st} ${side} q=${q.toFixed(2)}: body below the pitch (${low.body.toFixed(4)})`);assert(low.boot>=defBoot-.006,`slide ${st} q=${q.toFixed(2)}: boot too deep (${low.boot.toFixed(4)})`);
  if(st==='bean'){const b=beanLowest(r);assert(b>=-.002,`bean slide q=${q.toFixed(2)} above the pitch (${b.toFixed(4)})`);}
  assert(finite(r),'slide finite');
  if(Math.abs(q-.35)<.5/n){const up=torsoUp(r),lead=W(r,side<0?'left-ankle':'right-ankle');best={pelvis:W(r,'player-pelvis').y,lean:Math.atan2(-up.z,up.y),leadY:lead.y,leadZ:lead.z-z};}
 }
 assert(best.pelvis<.4,`slide ${st}: hips low (${best.pelvis.toFixed(2)})`);
 assert(best.lean>.6,`slide ${st}: torso leans back (${best.lean.toFixed(2)} rad)`);
 assert(best.leadY<.18&&best.leadZ>.6,`slide ${st}: lead leg long along the grass (${best.leadY.toFixed(2)}, ${best.leadZ.toFixed(2)})`);
 r.dispose();
}
// The stumble (a heavy touch: arms flung out, lurching) never puts a hand, knee or the body below the pitch.
for(const st of ['classic','bean'])for(const side of [-1,1]){
 style.setCharacterStyle(st);const r=createPlayer('stumble-'+st+side,'away',false);style.setCharacterStyle(undefined);
 let z=0;for(let i=0;i<40;i++){z+=3.5*DT;r.update(0,z,DT,i*DT,false,{facing:0,runIntensity:.5,dribbling:true});}
 for(let i=0;i<=66;i++){z+=2.5*DT;r.update(0,z,DT,(40+i)*DT,false,{facing:0,runIntensity:.4,kickSide:side,reaction:'stumble',reactionProgress:Math.min(1,i/60)});
  const low=lowest(r);assert(low.body>=0,`stumble ${st} ${side}: body below the pitch (${low.body.toFixed(4)})`);if(st==='bean')assert(beanLowest(r)>=-.002,'bean stumble above the pitch');}
 r.dispose();
}

// ---------------------------------------------------------------- 5. live matches: choreo + sim wiring
{
 const {MatchSim}=load(path.join(ROOT,'lib/town/match/matchSim.ts')),choreo=load(path.join(ROOT,'lib/town/match/choreo.ts'));
 assert.equal(choreo.DIVE_CONTACT,DIVE_PHASE.contact,'choreo times the dive contact where the rig reaches the ball');
 assert.equal(choreo.JUMP_PEAK,JUMP_PHASE.peak,'choreo times the header at the rig\'s jump peak');
 for(const fmt of ['11v11','futsal']){
  const rate=fmt==='futsal'?.48:.32,v=load(path.join(ROOT,'lib/town/venues.ts')).venueById(fmt),sx=v.width/250,sz=v.length/380;
  let saves=0,timed=0,aimed=0,dives=0,headers=0,jumpTimed=0,landed=0,landings=0,stale=0;const m={};
  for(let seed=0;seed<3;seed++){
   const sim=new MatchSim(270+seed*41,fmt);sim.windupScale=rate;const ch=choreo.createChoreo();let seen=0,watch=null,prevObj=null,prevId=null,prevP=-1;
   for(let i=0,n=Math.round(4*60/rate*60);i<n;i++){
    const cross=!!sim.aerial?.header;sim.step(rate/60);ch.consume(sim,1/60);
    for(let q=Math.max(seen+1,sim.touchSerial-7);q<=sim.touchSerial;q++){const ev=sim.touches[(q-1)%8];if(ev.serial!==q)continue;const p=sim.players[ev.id];
     if(p.isGK&&(ev.kind==='receive'||ev.kind==='parry')&&sim.keeperDive&&sim.keeperDive.id===ev.id){
      saves++;for(const k in m)delete m[k];ch.apply(ev.id,m,0);
      if(m.dive&&m.dive.progress>.2&&m.dive.progress<.45)timed++;
      // The dive goes toward the ball: the rig's +x is (cos f, −sin f) for the facing f the choreo sets.
      const kd=sim.keeperDive,ox=(kd.x-p.x)*sx,oz=(kd.y-p.y)*sz;
      if(m.dive&&Math.sign(ox*Math.cos(m.facing)-oz*Math.sin(m.facing))===m.dive.dir)aimed++;
      watch={id:ev.id,x:kd.x,y:kd.y};
     }
     if(ev.kind==='receive'&&ev.height>=1.45&&!p.isGK&&cross){headers++;for(const k in m)delete m[k];ch.apply(ev.id,m,0);if(m.jump&&Math.abs(m.jump.progress-JUMP_PHASE.peak)<.12&&m.reaction==='header')jumpTimed++;}
    }
    seen=sim.touchSerial;
    // The keeper lands where he met the ball (the sim carries him there over the flight).
    if(watch&&!sim.keeperDive){landings++;const g=sim.players[watch.id];if(Math.hypot(g.x-watch.x,g.y-watch.y)<1.5)landed++;watch=null;}
    // Reused objects while a dive runs; cleared once it ends.
    const gk=sim.ids.find(id=>sim.players[id].isGK&&ch.diveOf(id)!==undefined);
    if(gk){for(const k in m)delete m[k];ch.apply(gk,m,0);if(m.dive&&prevId===gk&&prevObj&&m.dive!==prevObj&&m.dive.progress>prevP)stale++;if(m.dive&&(prevId!==gk||!prevObj||m.dive!==prevObj))dives++;prevObj=m.dive;prevP=m.dive?.progress??-1;prevId=gk;}
    else if(prevId){for(const k in m)delete m[k];m.dive={progress:.5,dir:1};ch.apply(prevId,m,0);if(m.dive!==undefined)stale++;prevId=null;prevObj=null;}
   }
  }
  assert(saves>20&&dives>=saves*.8,`${fmt}: keepers dive for saves at distance (${dives} dives, ${saves} saves)`);
  assert(timed>=saves*.85,`${fmt}: the hands meet the ball at full stretch (${timed}/${saves} timed)`);
  assert(aimed>=saves*.9,`${fmt}: the dive goes toward the ball (${aimed}/${saves})`);
  assert(landings>0&&landed>=landings*.9,`${fmt}: the keeper lands where he met the ball (${landed}/${landings})`);
  assert.equal(stale,0,`${fmt}: dive motion objects are reused and cleared`);
  if(fmt==='11v11')assert(headers>0&&jumpTimed>=headers*.8,`11v11: crosses are headed at the top of a jump (${jumpTimed}/${headers})`);
 }
}
console.log('player-dive-jump: parity, dive (sequence, root arc, hands lead, landing squash, ground), jump + header, slide, live dive/jump wiring — all passed');
