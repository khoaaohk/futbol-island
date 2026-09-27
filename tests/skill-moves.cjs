// Skill moves (lib/graphics/skillMoves.ts, docs/player-moves/MOVES.md, contract "Skill moves lane").
// Run: node tests/skill-moves.cjs
// Covers: the reaction-channel layout, every move's phase data, boot-ball contact on the SOLVED rig, the
// weight-bearing boot staying planted, ground guard (classic meshes and the bean shape), limbs within reach,
// per-move key poses, fade-out, reduced motion, the host helpers, and parity when `skill` is absent.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto'),T=require('three');
const ROOT=path.resolve(__dirname,'..'),GRAPHICS=path.join(ROOT,'lib/graphics');
const loaded=new Map();
function load(file,relativeDir){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);const dir=relativeDir??path.dirname(file);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(dir,n+'.ts')):require(n),console,Math,Map,WeakMap,Set,Float64Array,Float32Array,URLSearchParams});return m.exports;}
const style=load(path.join(GRAPHICS,'characterStyle.ts'));
const {createPlayer,profileFor,REACT}=load(path.join(GRAPHICS,'player.ts'));
const S=load(path.join(GRAPHICS,'skillMoves.ts'));
const DT=1/60,R=S.SKILL_BALL_RADIUS;
const J=(r,n)=>r.root.getObjectByName(n),W=(r,n)=>J(r,n).getWorldPosition(new T.Vector3());

// ---------------------------------------------------------------- 1. data
assert.deepEqual({...S.SKILL_CHANNELS},{...REACT},'skill channels mirror the rig\'s REACT layout');
assert(S.SKILL_TYPES.length>=29,'at least 29 skill moves');
const BATCH2=['insideCut','outsideCut','fakeShot','nutmeg','chipShot','trivela','toePoke','finesseShot','knuckleball','blockTackle','pokeTackle','keeperThrow','keeperRoll','keeperPunt','airplane','kneeSlide','thankPasser'];
for(const k of ['bodyFeint','stepover','scissors','cruyffTurn','dragBack','croqueta','elastico','roulette','rainbowFlick','shield','shoulderCharge','scan',...BATCH2])assert(S.SKILL_TYPES.includes(k),k+' exists');
for(const k of S.SKILL_TYPES)assert(['dribble','shoot','defend','keeper','celebrate','vision'].includes(S.SKILL_MOVES[k].group),k+': a teaching group');
for(const k of BATCH2)assert.equal(S.SKILL_MOVES[k].ball,!['airplane','kneeSlide','thankPasser'].includes(k),k+': only the celebrations are ball-less');
for(const k of S.SKILL_TYPES){
 const s=S.SKILL_MOVES[k];
 assert(s.seconds>.5&&s.seconds<3,k+': a readable duration');
 assert(0<s.phases[0]&&s.phases[0]<s.phases[1]&&s.phases[1]<s.phases[2]&&s.phases[2]<1,k+': anticipation < action < follow-through < recovery');
 for(const c of s.contacts)assert(c.p>=s.phases[0]&&c.p<=s.phases[2],k+`: contact ${c.p} between the anticipation and the recovery`);
 assert(s.teach.length>20&&s.label&&s.trigger,k+': teaching line, label and trigger');
 assert([1,2,3].includes(s.priority),k+': priority');
 assert.equal(!!s.ball,S.skillBall(k,.5,1)!==false,k+': ball flag matches skillBall');
}

// ---------------------------------------------------------------- helpers
function beanLowest(r){
 r.root.updateMatrixWorld(true);let low=Infinity;const p=new T.Vector3();
 const seg=(a,b,ra,rb)=>{for(let k=0;k<=8;k++){const t=k/8;p.lerpVectors(a,b,t);low=Math.min(low,p.y-(ra+(rb-ra)*t));}};
 const torso=J(r,'armor-torso');for(let k=0;k<=20;k++){const u=k/20;p.set(0,-.13+u*1.15,0);torso.localToWorld(p);low=Math.min(low,p.y-.32*Math.pow(Math.max(0,1-Math.pow(Math.abs(2*u-1),2.2)),1/2.2));}
 for(const s of ['left','right']){
  const sh=W(r,s+'-shoulder'),el=W(r,s+'-elbow'),hand=J(r,s+'-elbow').localToWorld(new T.Vector3(0,-.265,0));seg(sh,el,.058,.05);seg(el,hand,.05,.045);low=Math.min(low,hand.y-.06);
  const hip=W(r,s+'-hip'),kn=W(r,s+'-knee');seg(hip,kn,.068,.06);
 }
 return low;
}
function classicLowest(r){
 r.root.updateMatrixWorld(true);let body=Infinity;const v=new T.Vector3();
 r.root.traverse(o=>{if(!o.isMesh)return;for(let q=o;q;q=q.parent)if(!q.visible)return;if(/-ankle$/.test(o.parent?.name??''))return;const pos=o.geometry.attributes.position;for(let i=0;i<pos.count;i+=3){v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);body=Math.min(body,v.y);}});
 return body;
}
const finite=r=>{let ok=true;r.root.updateMatrixWorld(true);r.root.traverse(o=>{for(const e of o.matrixWorld.elements)if(!Number.isFinite(e))ok=false;});return ok;};
// Boot surface point (ankle + the surface offset in the body's heading frame).
function surfacePoint(r,legSide,surface,moveSide){
 const an=W(r,legSide<0?'left-ankle':'right-ankle'),off=S.skillSurfaceOffset(surface,legSide*moveSide),yaw=r.root.rotation.y,ox=off[0]*moveSide,oz=off[2];
 return new T.Vector3(an.x+ox*Math.cos(yaw)+oz*Math.sin(yaw),an.y+off[1],an.z-ox*Math.sin(yaw)+oz*Math.cos(yaw));
}
// Plays one move with a host driving root + facing + ball through applySkill (start at (sx,0) facing `yaw`).
function play(type,side,{st='classic',reduced=false,yaw=0,role='mid',tail=24,sample}={}){
 style.setCharacterStyle(st);const r=createPlayer('skill-'+type+side+st,'home',false);r.setProfile(profileFor(role,5));style.setCharacterStyle(undefined);
 const start={x:1.5,z:-2,yaw},root={x:start.x,z:start.z},ball={x:0,y:0,z:0},m={facing:yaw};
 for(let i=0;i<40;i++)r.update(start.x,start.z,DT,i*DT,reduced,{facing:yaw});
 const spec=S.SKILL_MOVES[type],n=Math.round(spec.seconds/DT),frames=[];
 for(let i=0;i<=n+tail;i++){
  const p=i/n;let alive=true;
  if(p<=1)alive=S.applySkill(m,type,p,side,start,root,ball);else{m.skill=undefined;}
  r.update(root.x,root.z,DT,(40+i)*DT,reduced,m);
  const f={p,i,alive,finite:finite(r),root:{...root},yaw:r.root.rotation.y,ball:{...ball},ankles:[W(r,'left-ankle'),W(r,'right-ankle')],hips:[W(r,'left-hip'),W(r,'right-hip')],pelvis:W(r,'player-pelvis'),head:W(r,'player-head'),
   torsoQ:J(r,'armor-torso').getWorldQuaternion(new T.Quaternion()),knees:[J(r,'left-knee').rotation.x,J(r,'right-knee').rotation.x],squash:J(r,'armor-torso').scale.y,
   kneeW:[W(r,'left-knee'),W(r,'right-knee')],shoulders:[W(r,'left-shoulder'),W(r,'right-shoulder')],handsW:(()=>{const a=new T.Vector3(),b=new T.Vector3();r.handPositions(a,b);return [a,b];})()};
  for(const c of spec.contacts)if(p<=1&&Math.abs(p-c.p)<.5/n){const legSide=c.leg==='s'?side:-side;f.contact=(f.contact??[]);f.contact.push({c,err:surfacePoint(r,legSide,c.surface,side).distanceTo(new T.Vector3(ball.x,ball.y,ball.z))});}
  if(sample)sample(r,f);
  frames.push(f);
 }
 return {r,frames,spec,n};
}
const at=(frames,p)=>frames.reduce((a,b)=>Math.abs(b.p-p)<Math.abs(a.p-p)?b:a);
const upOf=q=>new T.Vector3(0,1,0).applyQuaternion(q);
// Rig-local x of a world direction (the rig's +x for yaw y is (cos y, −sin y)).
const localX=(v,yaw)=>v.x*Math.cos(yaw)-v.z*Math.sin(yaw);

// ---------------------------------------------------------------- 2. every move, both feet, both styles
const standY={};
for(const st of ['classic','bean']){
 const r=createPlayer('stand','home',false);style.setCharacterStyle(st);style.setCharacterStyle(undefined);for(let i=0;i<40;i++)r.update(0,0,DT,i*DT,false,{facing:0});standY[st]=Math.min(W(r,'left-ankle').y,W(r,'right-ankle').y);r.dispose();
}
for(const type of S.SKILL_TYPES)for(const side of [1,-1])for(const st of ['classic','bean']){
 const tag=`${type} side ${side} ${st}`;
 const {r,frames,spec,n}=play(type,side,{st,yaw:.6,sample:(r,f)=>{f.low=st==='bean'?beanLowest(r):classicLowest(r);}});
 assert(frames.every(f=>f.finite),tag+': no NaN');
 // Boot meets ball at every contact (solved rig, not just the keyframes).
 for(const c of spec.contacts){const f=frames.find(f=>f.contact?.some(x=>x.c===c));assert(f,tag+': contact frame sampled');const e=f.contact.find(x=>x.c===c).err;assert(e<.07,tag+`: ${c.leg} ${c.surface} meets the ball at ${c.p} (${e.toFixed(3)} m)`);}
 // Ground guard: nothing under the pitch; boots never below their flat standing depth.
 const low=Math.min(...frames.map(f=>f.low));assert(low>-.006,tag+`: body and limbs stay above the pitch (${low.toFixed(3)})`);
 const boot=Math.min(...frames.flatMap(f=>f.ankles.map(a=>a.y)));assert(boot>standY.classic-.004,tag+`: boots never sink (${boot.toFixed(3)})`);
 // Limbs never overstretch or fold backwards (noodle limbs cannot break).
 for(const f of frames){for(let i=0;i<2;i++){assert(f.ankles[i].distanceTo(f.hips[i])<.83*1.06*1.02+.01,tag+': leg within reach');assert(f.knees[i]>-.02&&f.knees[i]<2.95,tag+': knee bends the right way');}}
 // Weight-bearing boot is world-planted while the move holds it (pivots included): no skating.
 // (Ankle travel between frames while both are within 1.5 cm of standing height. The rig's own kick-support re-step,
 // a low quick shuffle, measures up to ~6 cm; a real skid is 10–40 cm.)
 let skate=0;for(let i=1;i<frames.length;i++){if(frames[i].p>1)break;for(let k=0;k<2;k++){const a=frames[i].ankles[k],b=frames[i-1].ankles[k];if(a.y<.09&&b.y<.09)skate=Math.max(skate,Math.hypot(a.x-b.x,a.z-b.z));}}
 assert(skate<.075,tag+`: grounded boots do not skate (${skate.toFixed(3)} m/frame)`);
 // Recovers: after the host clears the field the pose fades (~.15 s) and the root holds still.
 const last=frames[frames.length-1];assert(Math.abs(upOf(last.torsoQ).y)>.95,tag+': upright again after the move');
 assert.equal(frames.find(f=>f.p>=1)?.alive,false,tag+': applySkill reports the end');
 // Squash fires on a contact (ball moves) or the charge.
 const q=S.SKILL_MOVES[type];if(type!=='scan'&&type!=='shield')assert(frames.some(f=>Math.abs(f.squash-1)>.01),tag+': squash impulse');
 r.dispose();
}

// ---------------------------------------------------------------- 3. key poses per move (classic, right foot, facing +z)
{
 const K=(type,side=1)=>play(type,side,{yaw:0});
 // Body feint: the shoulder drops toward the fake side, then the exit goes the other way.
 for(const side of [1,-1]){const {frames}=K('bodyFeint',side),dip=at(frames,.4),end=at(frames,1);
  assert(localX(upOf(dip.torsoQ),0)*side>.2,`bodyFeint ${side}: chest leans to the fake side at the dip`);
  assert((end.root.x-1.5)*side<-.4,`bodyFeint ${side}: exit goes the other way`);}
 // Stepover: the active boot passes OVER the ball (sole above the ball top) without touching it.
 {const {frames}=K('stepover');const over=frames.filter(f=>f.p>.26&&f.p<.35);
  assert(over.some(f=>f.ankles[1].y-.075>R*2-.075+.02),'stepover: the boot rises over the top of the ball');
  const clear=Math.min(...frames.filter(f=>f.p>.18&&f.p<.44).map(f=>Math.hypot(f.ankles[1].x-f.ball.x,f.ankles[1].y-f.ball.y,f.ankles[1].z-f.ball.z)));
  assert(clear>R+.05,`stepover: the circling boot never hits the ball (${clear.toFixed(3)})`);}
 // Cruyff turn: faces the other way by the end; the ball ends up behind where he started.
 {const {frames}=K('cruyffTurn');const end=at(frames,1);assert(Math.abs(Math.abs(end.yaw)-Math.PI)<.25,`cruyff: turned ~180° (${end.yaw.toFixed(2)})`);assert(end.ball.z< -2-.8,'cruyff: ball goes back the way he came');
  const kick=at(frames,.22);assert(kick.ankles[1].z-kick.pelvis.z<-.15&&kick.ankles[1].y>.25,'cruyff: the kicking leg winds back first (the fake)');}
 // Drag-back: sole on top of the ball, then it rolls back under the body.
 {const {frames}=K('dragBack');const top=at(frames,.26);assert(top.ankles[1].y>.4,'dragBack: sole on top of the ball');assert(at(frames,.46).ball.z<top.ball.z-.3,'dragBack: the ball rolls back');}
 // La Croqueta: the ball crosses from one foot to the other.
 {const {frames}=K('croqueta');assert(at(frames,.3).ball.x-at(frames,.56).ball.x>.3,'croqueta: the ball crosses between the feet');}
 // Elastico: out, then back in with the same boot.
 {const {frames}=K('elastico');const a=at(frames,.28).ball.x,b=at(frames,.5).ball.x,c=at(frames,1).ball.x;assert(b>a+.08&&c<b-.5,'elastico: out, then snapped back across');}
 // Roulette: a full turn.
 {const {frames}=K('roulette');let turned=0;for(let i=1;i<frames.length;i++){turned+=Math.atan2(Math.sin(frames[i].yaw-frames[i-1].yaw),Math.cos(frames[i].yaw-frames[i-1].yaw));}assert(Math.abs(turned)>5.8,`roulette: spins a full circle (${turned.toFixed(2)})`);}
 // Rainbow flick: rolled up the back of the calf, flicked over the head, lands in front.
 {const {frames}=K('rainbowFlick');const calf=at(frames,.36);
  assert(calf.ball.y>.35&&calf.ball.z<calf.ankles[1].z,'rainbow: ball rolled up the back of the calf (behind the heel)');
  const flick=at(frames,.5);assert(flick.ankles[1].y>.3&&flick.ankles[1].z<flick.pelvis.z,'rainbow: the heel flicks up behind');
  // Up the back, clear of the round body, then over the head (the bean crown is ~.25 above the head joint).
  const over=frames.filter(f=>f.p>.43&&f.p<.9&&Math.abs(f.ball.z-f.head.z)<.2);assert(over.length&&over.every(f=>f.ball.y>f.head.y+.25+R),'rainbow: the ball clears the head');
  assert(frames.filter(f=>f.p>.43&&f.p<.6&&f.ball.y>1&&f.ball.y<1.7).every(f=>f.ball.z<f.pelvis.z-.35),'rainbow: it rises behind the back, not through the body');
  assert(frames.filter(f=>f.p>.8&&f.p<.97&&f.ball.y<1.2).every(f=>f.ball.z>f.pelvis.z+.4),'rainbow: it drops in front of the chest');
  const land=at(frames,.97);assert(Math.abs(land.ball.y-R)<.04&&land.ball.z>land.root.z+.3,'rainbow: lands in front of the player');}
 // Shield: low and wide, the arm out; turned away from the defender side.
 {const {frames}=K('shield');const stand=frames[0],hold=at(frames,.5);assert(hold.pelvis.y<stand.pelvis.y-.08,'shield: hips low');assert(Math.abs(hold.ankles[0].x-hold.ankles[1].x)>.45,'shield: wide base');}
 // Shoulder charge: leans into the opponent with the arm tucked in (fair charge).
 {const r=createPlayer('charge','home',false);const m={},root={x:0,z:0},start={x:0,z:0,yaw:0};for(let i=0;i<30;i++)r.update(0,0,DT,i*DT,false,{facing:0});
  const n=Math.round(S.SKILL_MOVES.shoulderCharge.seconds/DT);let lean=0,hand=9;for(let i=0;i<=n;i++){S.applySkill(m,'shoulderCharge',i/n,1,start,root);r.update(root.x,root.z,DT,i*DT,false,m);if(Math.abs(i/n-.36)<.02){lean=upOf(J(r,'armor-torso').getWorldQuaternion(new T.Quaternion())).x;const h=J(r,'right-elbow').localToWorld(new T.Vector3(0,-.265,0)),sh=W(r,'right-shoulder');hand=Math.hypot(h.x-sh.x,h.z-sh.z);}}
  assert(lean>.25,`shoulderCharge: leans into the opponent (${lean.toFixed(2)})`);assert(hand<.3,'shoulderCharge: the arm stays in (no pushing)');r.dispose();}
 // Scan: the chest (where the bean face lives) turns over each shoulder, the head further; legs untouched.
 {const {frames}=K('scan');const a=at(frames,.3),b=at(frames,.76);const yawOf=q=>{const f=new T.Vector3(0,0,1).applyQuaternion(q);return Math.atan2(f.x,f.z);};
  assert(yawOf(a.torsoQ)>.45&&yawOf(b.torsoQ)<-.45,'scan: looks over one shoulder, then the other');
  assert(frames.every(f=>f.ankles.every(x=>x.y<.09)),'scan: feet stay on the grass');}
}

// ---------------------------------------------------------------- 3b. batch 2 key poses (classic, facing +z, both feet)
{
 const K=(type,side=1,opt={})=>play(type,side,{yaw:0,...opt});
 const B=f=>new T.Vector3(f.ball.x,f.ball.y,f.ball.z);
 for(const side of [1,-1]){
  // Inside cut: the ball is cut across the body and he leaves toward the other foot's side; outside cut: the active side.
  {const {frames}=K('insideCut',side),end=at(frames,1);assert(end.yaw*side<-.9,`insideCut ${side}: turns toward the other foot (${end.yaw.toFixed(2)})`);assert((end.ball.x-1.5)*side<-.9,`insideCut ${side}: the ball goes across the body`);}
  {const {frames}=K('outsideCut',side),end=at(frames,1);assert(end.yaw*side>.8,`outsideCut ${side}: turns toward the active foot`);assert((end.ball.x-1.5)*side>.9,`outsideCut ${side}: the ball goes away with the outside`);}
  // Fake shot: a real back-swing, the boot swings through close to the ball without moving it, then the cut.
  {const {frames}=K('fakeShot',side),ank=f=>f.ankles[side<0?0:1],wind=at(frames,.3);
   assert(ank(wind).z-wind.pelvis.z<-.25&&ank(wind).y>.3,`fakeShot ${side}: the leg winds back like a shot`);
   const sell=frames.filter(f=>f.p<.54);assert(sell.every(f=>B(f).distanceTo(B(frames[0]))<1e-6),`fakeShot ${side}: the ball does not move during the fake`);
   const near=Math.min(...frames.filter(f=>f.p>.4&&f.p<.52).map(f=>ank(f).distanceTo(B(f))));assert(near<.45,`fakeShot ${side}: the boot swings through over the ball (${near.toFixed(2)})`);
   const end=at(frames,1);assert(end.yaw*side<-1.1,`fakeShot ${side}: cuts away from the fake`);}
  // Nutmeg: the ball goes straight on (through the legs) while he runs round and collects it.
  {const {frames}=K('nutmeg',side),end=at(frames,1);assert(end.ball.z-frames[0].ball.z>2,`nutmeg ${side}: the ball goes straight on through`);
   assert(Math.max(...frames.map(f=>Math.abs(f.ball.x-1.5)))<.2,`nutmeg ${side}: in a straight line`);
   assert(Math.max(...frames.map(f=>Math.abs(f.root.x-1.5)))>.7,`nutmeg ${side}: he runs round the defender`);
   const gap=end.ball.z-end.root.z;assert(gap>.3&&gap<.8&&Math.abs(end.ball.x-end.root.x)<.3,`nutmeg ${side}: collects it in front (${gap.toFixed(2)})`);}
  // Chip: the ball rises high (over a keeper) and drops well out; the body leans back after the stab.
  {const {frames}=K('chipShot',side),apex=Math.max(...frames.map(f=>f.ball.y));assert(apex>1.8&&apex<3.2,`chipShot ${side}: a high floated arc (${apex.toFixed(2)} m)`);
   assert(at(frames,1).ball.z-frames[0].ball.z>6,`chipShot ${side}: drops well out`);assert(new T.Vector3(0,0,1).dot(upOf(at(frames,.42).torsoQ))<.05,`chipShot ${side}: leans back`);}
  // Curl and trivela bend opposite ways: the inside of the foot bows the flight toward the kicking side and curls it
  // back across; the outside of the foot bows it the other way and swerves it toward the kicking side.
  for(const [type,sign] of [['finesseShot',1],['trivela',-1]]){const {frames,spec}=K(type,side),c=spec.contacts[0].p,a=at(frames,c),e=at(frames,.9),m=at(frames,c+(.9-c)/2);
   const mid=(a.ball.x+e.ball.x)/2;assert((m.ball.x-mid)*side*sign>.7,`${type} ${side}: the flight bends (${(m.ball.x-mid).toFixed(2)})`);assert((e.ball.x-a.ball.x)*side*sign<-.8,`${type} ${side}: finishes on the other side`);}
  // Toe poke: no back-lift (the boot never goes behind the hips) and a low, hard ball.
  {const {frames}=K('toePoke',side),ank=f=>f.ankles[side<0?0:1];assert(frames.filter(f=>f.p<.3).every(f=>ank(f).z>f.pelvis.z-.06),`toePoke ${side}: no back-lift`);
   assert(Math.max(...frames.map(f=>f.ball.y))<.55,`toePoke ${side}: a low shot`);}
  // Knuckleball: a short stab (the boot stops low after contact) and a flight that darts side to side.
  {const {frames,spec}=K('knuckleball',side),c=spec.contacts[0].p,ank=f=>f.ankles[side<0?0:1];assert(frames.filter(f=>f.p>c&&f.p<.6).every(f=>ank(f).y<.4),`knuckleball ${side}: almost no follow-through`);
   const fl=frames.filter(f=>f.p>c&&f.p<.9);let turns=0;for(let i=2;i<fl.length;i++){const a=fl[i-1].ball.x-fl[i-2].ball.x,b=fl[i].ball.x-fl[i-1].ball.x;if(a*b<0&&Math.abs(a)+Math.abs(b)>1e-3)turns++;}assert(turns>=2,`knuckleball ${side}: the flight wobbles (${turns} darts)`);}
  // Block tackle: the ball arrives at pace and stops dead at the boot; the defender is low.
  {const {frames,spec}=K('blockTackle',side),c=spec.contacts[0].p,b=at(frames,c-.08),a=at(frames,c),z=at(frames,c+.3);
   assert((b.ball.z-a.ball.z)/(.08*spec.seconds)>2,`blockTackle ${side}: the ball comes in at pace`);assert(B(z).distanceTo(B(a))<.2,`blockTackle ${side}: it stops at the block`);
   assert(a.pelvis.y<frames[0].pelvis.y-.08,`blockTackle ${side}: low, knees bent`);}
  // Poke tackle: the toe pokes the ball away to the side while the standing boot stays planted.
  {const {frames,spec}=K('pokeTackle',side),c=spec.contacts[0].p;assert((at(frames,.8).ball.x-at(frames,c).ball.x)*side>.5,`pokeTackle ${side}: poked away`);}
  // Keeper: the ball stays in the hands (active hand for the throw and roll) until the release.
  for(const [type,rel] of [['keeperThrow',.5],['keeperRoll',.46],['keeperPunt',.27]]){const {frames}=K(type,side);
   const worst=Math.max(...frames.filter(f=>f.p>.1&&f.p<=rel).map(f=>Math.min(B(f).distanceTo(f.handsW[0]),B(f).distanceTo(f.handsW[1]))));
   assert(worst<.3,`${type} ${side}: the ball stays in the hands until the release (${worst.toFixed(2)} m)`);}
  {const {frames}=K('keeperThrow',side);assert(at(frames,.36).ball.z<at(frames,.36).pelvis.z-.1&&at(frames,.36).ball.y>1.3,`keeperThrow ${side}: the ball goes back behind the head`);
   assert(at(frames,.5).ball.y>1.6,`keeperThrow ${side}: released high over the top`);assert(at(frames,1).ball.z>8,`keeperThrow ${side}: a long throw`);}
  {const {frames}=K('keeperRoll',side);assert(at(frames,.46).ball.y<.3&&frames.filter(f=>f.p>.5).every(f=>Math.abs(f.ball.y-R)<.02),`keeperRoll ${side}: released at the grass and rolls without bouncing`);
   assert(at(frames,.42).pelvis.y<frames[0].pelvis.y-.2,`keeperRoll ${side}: bends low`);}
  {const {frames,spec}=K('keeperPunt',side),c=spec.contacts[0].p;assert(at(frames,c).ball.y>.35,`keeperPunt ${side}: struck before it bounces`);assert(frames.filter(f=>f.p>c&&f.p<1).every(f=>f.ball.y>.4),`keeperPunt ${side}: kicked up and away`);}
 }
 // Celebrations: wings out level, a slide on both knees with the arms up, a point and a clap for the passer.
 {const {frames}=K('airplane'),f=at(frames,.4),span=f.handsW[0].distanceTo(f.handsW[1]);assert(span>1&&f.handsW.every((h,i)=>Math.abs(h.y-f.shoulders[i].y)<.25),`airplane: arms out like wings (${span.toFixed(2)} m)`);
  let turned=0;for(let i=1;i<frames.length;i++)turned+=Math.atan2(Math.sin(frames[i].yaw-frames[i-1].yaw),Math.cos(frames[i].yaw-frames[i-1].yaw));assert(turned>3.5,'airplane: banks round a circle');}
 {const {frames}=K('kneeSlide'),f=at(frames,.5);assert(f.kneeW.every(k=>k.y<.2)&&f.handsW.every(h=>h.y>f.head.y),'kneeSlide: on both knees, arms up');assert(at(frames,.5).root.z-at(frames,.35).root.z>.2,'kneeSlide: slides on the grass');}
 {const {frames}=K('thankPasser'),p=at(frames,.4),a=at(frames,.56),c=at(frames,.6),fw=(h,f)=>(h.x-f.pelvis.x)*Math.sin(f.yaw)+(h.z-f.pelvis.z)*Math.cos(f.yaw);
  assert(p.handsW.every(h=>fw(h,p)>.35),'thankPasser: both arms point at the passer');assert(c.handsW[0].distanceTo(c.handsW[1])<a.handsW[0].distanceTo(a.handsW[1])-.25,'thankPasser: a clap');}
}

// ---------------------------------------------------------------- 4. reduced motion, scan while running, host helpers
for(const type of ['stepover','cruyffTurn','rainbowFlick']){const {frames,spec}=play(type,1,{reduced:true});assert(frames.every(f=>f.finite),type+' reduced: finite');
 for(const c of spec.contacts){const f=frames.find(f=>f.contact?.some(x=>x.c===c));assert(f.contact.find(x=>x.c===c).err<.08,type+' reduced: boot still meets the ball');}}
{
 // Scan overlays a jog: the gait keeps going (feet alternate) while the chest turns.
 const r=createPlayer('scan-run','home',false),m={runIntensity:.4,facing:0};let z=0;for(let i=0;i<60;i++){z+=3*DT;r.update(0,z,DT,i*DT,false,m);}
 const n=Math.round(S.SKILL_MOVES.scan.seconds/DT);let lifts=0,prev=null;for(let i=0;i<=n;i++){z+=3*DT;m.skill={type:'scan',progress:i/n,side:1};r.update(0,z,DT,(60+i)*DT,false,m);const hi=W(r,'left-ankle').y>W(r,'right-ankle').y;if(prev!==null&&hi!==prev)lifts++;prev=hi;}
 assert(lifts>=4,'scan while jogging: the legs keep running');r.dispose();
}
{
 const f=S.skillFrame('cruyffTurn',1,-1);assert(Math.abs(f.heading-Math.PI)<1e-9&&f.x>0,'skillFrame mirrors the side');
 const out={x:0,z:0};S.skillToWorld({x:10,z:5,yaw:Math.PI/2},{x:0,z:1},1,out);assert(Math.abs(out.x-11)<1e-9&&Math.abs(out.z-5)<1e-9,'skillToWorld: +z is the facing direction');
 const m={};const root={x:0,z:0},ball={x:0,y:0,z:0};S.applySkill(m,'bodyFeint',.3,1,{x:0,z:0,yaw:0},root,ball);const obj=m.skill;S.applySkill(m,'bodyFeint',.4,1,{x:0,z:0,yaw:0},root,ball);assert.equal(m.skill,obj,'applySkill reuses the motion object');
 assert.equal(S.skillBall('scan',.5,1),false,'body-only moves have no ball');
 for(const k of S.SKILL_TYPES)for(let p=0;p<=1;p+=.05){const b=S.skillBall(k,p,1);if(b)assert(Number.isFinite(b.x+b.y+b.z)&&b.y>=R-1e-6,k+': ball path finite and on or above the grass');const fr=S.skillFrame(k,p,1);assert(Number.isFinite(fr.x+fr.z+fr.heading),k+': frame finite');}
}

// ---------------------------------------------------------------- 5. parity when absent
// No `skill` field ⇒ the rig is frame-for-frame the rig of tests/fixtures/player-motion-parity.json (lane B's golden;
// the skill lane's arm-swing and plant-step fine-tunes are in it, see the contract). Same scenarios as player-dive-jump.
{
 const JOINTS=['player-pelvis','armor-torso','player-lumbar','player-chest','player-head','left-shoulder','right-shoulder','left-elbow','right-elbow','left-hand','right-hand','left-hip','right-hip','left-knee','right-knee','left-ankle','right-ankle'];
 const jointState=r=>{const v=[];for(const n of JOINTS){const o=J(r,n);v.push(o.position.x,o.position.y,o.position.z,o.quaternion.x,o.quaternion.y,o.quaternion.z,o.quaternion.w,o.scale.x,o.scale.y,o.scale.z);}v.push(r.root.position.x,r.root.position.z,r.root.rotation.y);return v;};
 const SC={
  sprintBrake:{role:'fwd',frames:170,m:(i,s)=>{const v=i<70?Math.min(7,i*.12):Math.max(0,7-(i-70)*.2);s.z+=v*DT;return {facing:0,runIntensity:v/7,brake:i>70&&v>0?1:0};}},
  pass:{role:'mid',frames:100,m:(i,s)=>{const k=i<30?undefined:Math.min(1,(i-30)/40);return {facing:0,kick:k,actionKind:'pass',kickSide:1,strikeX:.14,strikeZ:.6};}},
  walkIdle:{role:'you',frames:140,m:(i,s)=>{s.z+=(i<80?1.3:0)*DT;return {runIntensity:i<80?.2:0,scanYaw:.4*Math.sin(i*.05)};}},
 };
 const golden=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/player-motion-parity.json'),'utf8'));
 for(const [name,sc] of Object.entries(SC)){
  const r=createPlayer('parity-'+name,name.length%2?'home':'away',false),s={x:0,z:0},h=crypto.createHash('sha256');r.setProfile(profileFor(sc.role,name.length*7));
  for(let i=0;i<sc.frames;i++){const m=sc.m(i,s);m.skill=undefined;r.update(s.x,s.z,DT,i*DT,false,m);if(i%2===0)h.update(jointState(r).map(v=>(Math.abs(v)<5e-10?0:v).toFixed(8)).join(','));}
  assert.equal(h.digest('hex'),golden[name],name+': no skill field ⇒ identical joints to the parity fixture');r.dispose();
 }
}
console.log('skill-moves: data, contacts on the solved rig, planted support, ground guard, reach, key poses, fade-out, reduced motion, helpers, parity — all passed');
