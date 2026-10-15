// Summit Isle tree kick (Oct 15 2026, user: "update animation for kicking these trees and all trees on the mountain island").
// Pure checks on lib/town/summitTreeKick.ts, the `treekick` pose and the runtime in lib/graphics/fruitTrees.ts:
//  1. every baked site kind (round tree, palm, all seven orchard forms) is kickable: a Kick press in front of it within reach goes to
//     it, not to one behind or out of reach; the stance is clear of its collider and on the real character rig the striking toe
//     meets the bark at the pose's contact (a few cm), at kicking height
//  2. the runtime: the press is taken (no shot), the pose is the kick at the trunk, at contact a thunk + rustle, a sway impulse on
//     just that tree's shader id that decays over 2–3 swings back to exactly 0, pooled leaves; a fruiting tree drops fruit by the
//     shake's rules; the first kick shows the teaching line once per device
//  3. cooldown: mashing Kick on one tree adds one impulse per 0.6 s; a kick on another tree hands the single-tree sway over
//  4. heat: the particle pool and the fruit mesh are reused (no new mesh or material after any number of kicks), nothing at rest
//     (no rAF, timers, instance uploads), reduced motion skips the sway and leaves but keeps the cue; a ball on any tree sways it
//  5. wiring: Town's forage block passes the shot hold and yaw and plays `how.kind`; jobMoves lists the pose
// usage: node tests/summit-tree-kick.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createLoader,browser}=require('./summit-harness.cjs');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const env=browser();const T=require('three');
const load=createLoader({'three':T});
const S=load('lib/town/summitIsle.ts'),W=load('lib/town/summitIsleWorld.ts'),F=load('lib/town/summitForage.ts'),K=load('lib/town/summitTreeKick.ts'),Sim=load('lib/town/simulation.ts');
const JP=load('lib/graphics/jobPoses.ts'),JM=load('lib/town/jobs/jobMoves.ts'),PL=load('lib/graphics/player.ts'),RT=load('lib/graphics/fruitTrees.ts');

// ---- Build the island (stub tools, like tests/summit-forage.cjs) for its trees, palms and colliders.
const town=new T.Group(),mk=g=>{const m=new T.Mesh(g,new T.MeshStandardMaterial());town.add(m);return m;};
const tools={box:(w,h,d,c,x,y,z)=>{const m=mk(new T.BoxGeometry(w,h,d));m.position.set(x,y,z);return m;},cylinder:(r,h,c,x,y,z)=>{const m=mk(new T.CylinderGeometry(r,r,h,10));m.position.set(x,y,z);return m;},
 sign:(t,w,h,x,y,z)=>{const m=mk(new T.PlaneGeometry(w,h));m.position.set(x,y,z);return m;},town,obstacles:[],assets:[],surfaceAreas:[]};
W.buildSummitIsle(tools);
const sites=W.SUMMIT_TREE_SITES.map(s=>({...s,top:{...s.top}})),obstacles=tools.obstacles;
const ground=(x,z)=>S.summitGround(x,z)-S.SUMMIT_VISUAL_DROP;
const kinds=new Set(sites.map(s=>s.form??s.kind));for(const k of ['tree','palm','round','oval','umbrella','lobed','columnar','banana','papaya'])assert(kinds.has(k),'the island bakes a '+k);

// ---- 1. Every site kind is kickable; the stance and the toe on the bark.
assert.equal(JM.POSE_TIME.treekick,.8,'a short, bounded kick');assert(JM.HANDS_POSES.has('treekick')&&JP.TREE_KICK_CONTACT>0&&JP.TREE_KICK_CONTACT<1,'the ball is set aside; contact mid-pose');
/** The striking toe on the real rig at the pose's contact: forward reach and height over the ground (root at the origin, facing +z). */
function toeAtContact(){
 const rig=PL.createPlayer('you','home',true,true);let t=0;
 for(let i=0;i<30;i++){t+=1/60;rig.update(0,0,1/60,t,false,{job:{kind:'treekick',progress:JP.TREE_KICK_CONTACT}});}
 rig.root.updateWorldMatrix(true,true);const ankle=rig.root.getObjectByName('right-ankle'),plant=rig.root.getObjectByName('left-ankle');
 const toe=rig.root.worldToLocal(ankle.localToWorld(new T.Vector3(0,-.025,.062+.145))),heel=rig.root.worldToLocal(plant.localToWorld(new T.Vector3(0,-.025,.062)));rig.dispose();// rig-local: +z forward
 return {reach:toe.z,height:toe.y,plantZ:heel.z};
}
const toe=toeAtContact();
console.log(`  rig: at contact the right toe reaches ${toe.reach.toFixed(3)} m forward, ${toe.height.toFixed(2)} m up; the left boot plants at z ${toe.plantZ.toFixed(2)}`);
assert(Math.abs(toe.reach-K.TREE_KICK.toeReach)<=.06,`TREE_KICK.toeReach (${K.TREE_KICK.toeReach}) matches the rig (${toe.reach.toFixed(3)})`);
assert(toe.height>.12&&toe.height<.45,'the boot strikes low on the trunk, not the ground or the canopy');assert(Math.abs(toe.plantZ)<.3,'the standing boot stays planted beside the target');
const perKind=new Map();
for(const s of sites){const form=s.form??s.kind;
 for(const a of [0,Math.PI/2,Math.PI,-Math.PI/2]){const st=K.kickStance(s,a);
  // Clear of the trunk's collider for the walker, facing the trunk; the toe lands on the bark (the stance gap closed by the lean).
  assert(!Sim.insideObstacle(st.root.x,st.root.z,Sim.trunkCollider(s.x,s.z,s.rig.baseR),F.WALKER_RADIUS),`${form} ${s.tid}: the stance is clear of the trunk collider`);
  const gap=Math.hypot(st.root.x-s.x,st.root.z-s.z)-s.rig.baseR,contact=toe.reach+st.lean-gap;
  assert(Math.abs(contact)<=.07,`${form} ${s.tid}: the toe meets the bark (${(contact*100).toFixed(1)} cm ${contact<0?'short':'in'})`);
  const fx=Math.sin(st.face),fz=Math.cos(st.face);assert(Math.abs(fx*Math.cos(a)+fz*Math.sin(a)+1)<1e-9,'faces the trunk');
  // A press from the stance facing the trunk goes to this trunk; facing away, or from 3 m out, it is a normal shot.
  assert.equal(K.kickTarget(sites,st.root.x,st.root.z,st.face),s,`${form} ${s.tid}: the press goes to it`);
  assert.equal(K.kickTarget([s],st.root.x,st.root.z,st.face+Math.PI),null,'not when facing away');
  assert.equal(K.kickTarget([s],s.x+Math.cos(a)*(s.rig.baseR+K.TREE_KICK.reach+.5),s.z+Math.sin(a)*(s.rig.baseR+K.TREE_KICK.reach+.5),st.face),null,'not from out of reach');}
 perKind.set(form,(perKind.get(form)??0)+1);}
// The nearest trunk ahead wins when two are in the cone.
{const a=sites[0],b={...a,x:a.x+1,z:a.z};const st=K.kickStance(a,0);assert.equal(K.kickTarget([b,a],st.root.x,st.root.z,st.face),a,'the nearer trunk');}
console.log(`  kickable: ${sites.length} sites (${[...perKind].map(([k,n])=>k+' '+n).join(', ')})`);
assert.equal(K.TREE_KICK.cooldown,.6);assert(K.TREE_KICK.impulse.palm<=K.TREE_KICK.impulse.tree,'palms get no bigger impulse (their rig bends more at the top)');
assert(K.TREE_KICK_LESSON.length<160&&/laces/.test(K.TREE_KICK_LESSON)&&/standing foot/.test(K.TREE_KICK_LESSON),'a one-line coaching note about a laces strike');
for(const s of sites){const L=K.kickLeaves(s);assert(L.count>=3&&L.count<=5,'3–5 leaves or fronds');}

// ---- 2–4. The runtime.
const sway={tree:{value:0},pivot:{value:new T.Vector3()},axis:{value:new T.Vector3()},angle:{value:0},height:{value:5},bend:{value:1}};
function rig(opts={}){
 const store=new Map(),calls={pose:[],cue:[],take:0,shook:[]};let clock=opts.now??new Date(2026,9,15,10,0,0).getTime(),seed=7,press=null,seen=!!opts.seen,yaw=0;
 const scene=new T.Scene();
 const f=RT.createSummitForage(scene,{obstacles,sites:()=>sites,sway,budgetMs:Infinity,pose:(p,how)=>calls.pose.push({p,how}),gather:()=>1,cue:k=>calls.cue.push(k),shook:(x,z)=>calls.shook.push({x,z}),
  kick:{pressed:()=>press,take:()=>{calls.take++;press=null;}},yaw:()=>yaw,lessonSeen:()=>seen,lessonMark:()=>{seen=true;},busy:()=>!!opts.busy,
  now:()=>clock,random:()=>{seed=(seed*16807)%2147483647;return seed/2147483647;},read:()=>store.get(F.FORAGE_SAVE_KEY)??null,write:v=>store.set(F.FORAGE_SAVE_KEY,v)});
 const el={hidden:true},camera=new T.PerspectiveCamera(50,390/844,.1,500);
 const ctx=(x,z,extra={})=>({dt:1/60,x,z,onFoot:true,canEnter:true,frozen:false,reduced:!!opts.reduced,camera,width:390,height:844,focusKey:'forage',ui:()=>el,place:()=>{},hide:(e,h)=>{e.hidden=h;},...extra});
 const r={f,scene,calls,ctx,tick:ms=>{clock+=ms;},press:()=>{press={at:clock};},face:a=>{yaw=a;},get seen(){return seen;},
  run:(x,z,frames,extra)=>{for(let i=0;i<frames;i++){clock+=1000/60;f.update(ctx(x,z,extra));}},
  /** Run until the sway rests, counting its swings (sign changes of the angle) and its peak. */
  settle:(x,z)=>{let swings=0,last=0,peak=0,n=0;for(;n<60*6;n++){clock+=1000/60;f.update(ctx(x,z));const a=sway.angle.value;peak=Math.max(peak,Math.abs(a));if(last!==0&&a!==0&&Math.sign(a)!==Math.sign(last))swings++;if(a!==0)last=a;if(n>5&&a===0&&!f.busy)break;}return {swings,peak,frames:n};}};
 return r;
}
const meshes=o=>{let n=0,mats=new Set();o.traverse(c=>{if(c.isMesh){n++;const m=Array.isArray(c.material)?c.material:[c.material];m.forEach(x=>mats.add(x));}});return {n,mats:mats.size};};
/** A site without fruit today (not a fruit tree, or bare), standing in front of it. */
const bareSite=(f,kind)=>{const v=f.view(),fruiting=new Set(v.trees.map(t=>t.tid));return sites.find(s=>s.kind===kind&&!fruiting.has(s.tid)&&S.onSummitIsle(s.x,s.z));};
{const r=rig(),f=r.f;
 assert.equal(f.update(r.ctx(103,-8)),null);assert.equal(f.stats.built,false,'built only near Summit Isle');
 const L0=S.SUMMIT_LANDMARKS.sandbarLanding;f.update(r.ctx(L0.x,L0.z));assert(f.stats.built&&f.view().sites===sites.length,'every baked tree and palm is known to the runtime');
 const before=meshes(r.scene);
 const site=bareSite(f,'tree'),st=K.kickStance(site,0);r.face(st.face);
 // A press with no trunk ahead is left alone (a normal shot); turned to the trunk it is taken.
 r.face(st.face+Math.PI);r.press();r.run(st.root.x,st.root.z,2);assert.equal(r.calls.take,0,'facing away: the press stays a shot');assert.equal(r.calls.pose.length,0);
 r.face(st.face);r.press();r.run(st.root.x+.4,st.root.z,1);
 assert.equal(r.calls.take,1,'a trunk ahead: the press is taken (no shot)');const p=r.calls.pose[0];assert(p&&p.how.kind==='treekick','the kick pose');
 assert(Math.abs(p.p.x-site.x)<1e-9&&Math.abs(p.p.z-site.z)<1e-9,'at the trunk');assert(p.how.lead>0&&p.how.lead<=K.TREE_KICK.maxLead,'steps to the stance first');
 assert(Math.hypot(p.how.stand.x-st.root.x,p.how.stand.z-st.root.z)<1e-9,'the stance from kickStance');assert.equal(f.view().kicking,true);assert.equal(f.update(r.ctx(st.root.x,st.root.z)),null,'no forage prompt while kicking');
 r.press();r.run(st.root.x,st.root.z,1);assert.equal(r.calls.take,1,'a press mid-kick is ignored');
 // Up to contact: nothing yet; at contact the thunk, the rustle, the impulse on just this tree, leaves.
 const frames=Math.ceil((p.how.lead+JM.POSE_TIME.treekick*JP.TREE_KICK_CONTACT)*60);
 r.run(st.root.x,st.root.z,frames-9);assert.equal(r.calls.cue.length,0,"quiet until the boot lands");assert.equal(sway.angle.value,0);
 r.run(st.root.x,st.root.z,12);
 assert.deepEqual(r.calls.cue.slice(0,2),['thunk','rustle'],'a thunk and a rustle at contact');assert.equal(sway.tree.value,site.tid,'the sway marks this tree');
 assert(sway.pivot.value.x===site.x&&sway.pivot.value.z===site.z&&sway.height.value===site.rig.sway.h,'about its base, with its rig');
 assert.equal(r.calls.shook.length,1,'the hidden-ball hook fires');assert.equal(f.stats.kickImpulses,1);
 const fx=r.scene.getObjectByName('job-fx-particles');assert(fx&&fx.visible,'leaves from the pooled particles');
 assert(r.seen&&F.forageStore.get().note===K.TREE_KICK_LESSON&&F.forageStore.get().tip,'the first kick shows the coaching line');
 const o=r.settle(st.root.x,st.root.z);
 console.log(`  kick: peak tilt ${(o.peak*180/Math.PI).toFixed(1)}°, ${o.swings} swings, at rest after ${(o.frames/60).toFixed(2)} s`);
 assert(o.peak>.04&&o.peak<.25,'a visible but modest tilt');assert(o.swings>=3&&o.swings<=6,'2–3 oscillations before it rests');
 assert.equal(sway.angle.value,0,'settles to exactly 0');assert.equal(sway.tree.value,0,'and unmarks the tree');r.run(st.root.x,st.root.z,40);assert(!fx.visible,'the leaves are gone (they outlive the sway by a moment)');
 assert.equal(f.busy,false);const after=meshes(r.scene);assert.deepEqual(after,before,'no new mesh or material for the kick');
 // At rest: nothing uploads, no frame loop or timer.
 const v0=fx.instanceMatrix.version;r.run(st.root.x,st.root.z,60);assert.equal(fx.instanceMatrix.version,v0,'no particle uploads at rest');
 assert.equal(env.counts.raf,0);assert.equal(env.counts.timeout,0);assert.equal(env.counts.interval,0);
 // Cooldown: within 0.6 s of a strike the same tree takes no second impulse (a ball straight after the boot: the cue only).
 r.press();r.run(st.root.x,st.root.z,1);assert.equal(r.calls.pose.length,2,'a second kick plays');
 r.run(st.root.x,st.root.z,Math.ceil((r.calls.pose[1].how.lead+JM.POSE_TIME.treekick*JP.TREE_KICK_CONTACT)*60)+2);assert.equal(f.stats.kickImpulses,2);
 const hits=f.stats.ballHits,at={x:site.x-site.rig.baseR-.2,y:site.y+.5,z:site.z};r.tick(200);
 assert.equal(f.ballHit(at.x,at.y,at.z,12,0),true,'a ball right after the boot is swallowed');assert.equal(f.stats.ballHits,hits,'no second impulse within the cooldown');
 r.tick(500);assert.equal(f.ballHit(at.x,at.y,at.z,12,0),true);assert.equal(f.stats.ballHits,hits+1,'past the cooldown it counts');
 r.settle(st.root.x,st.root.z);
 // A second tree hands the sway over: only one tree is ever marked.
 const palm=bareSite(f,'palm'),sp=K.kickStance(palm,Math.PI/2);r.face(sp.face);r.press();r.run(sp.root.x,sp.root.z,1);const pp=r.calls.pose.at(-1);assert.equal(pp.how.kind,'treekick');
 r.run(sp.root.x,sp.root.z,Math.ceil((pp.how.lead+JM.POSE_TIME.treekick*JP.TREE_KICK_CONTACT)*60)+2);
 assert.equal(sway.tree.value,palm.tid,'the palm sways');assert.equal(sway.bend.value,palm.rig.sway.bend,'bending more at the top');
 // The pose ends while the palm still sways; kick the first tree: the single-tree uniform hands over.
 r.run(sp.root.x,sp.root.z,Math.ceil(JM.POSE_TIME.treekick*(1-JP.TREE_KICK_CONTACT)*60)+2);assert.notEqual(sway.angle.value,0,'the palm is still swaying');
 r.face(st.face);r.press();r.run(st.root.x,st.root.z,1);const pk=r.calls.pose.at(-1);assert.notEqual(pk,pp,'the kick starts');
 r.run(st.root.x,st.root.z,Math.ceil((pk.how.lead+JM.POSE_TIME.treekick*JP.TREE_KICK_CONTACT)*60)+2);
 assert.equal(sway.tree.value,site.tid,'handed over to the newest kick');assert.equal(f.view().swayTree,site.tid);
 r.settle(st.root.x,st.root.z);assert.equal(sway.tree.value,0);
 assert.deepEqual(meshes(r.scene),before,'still no new mesh or material');
 // A ball on a tree that is not a fruit tree sways it too (every site, not only the forage pool).
 const pool=new Set(f.view().pool),other=sites.find(s=>!pool.has(`${s.kind}-${Math.round(s.x)}-${Math.round(s.z)}`))??site;
 r.tick(700);assert.equal(f.ballHit(other.x-other.rig.baseR-.2,other.y+.5,other.z,12,0),true,'a ball hits it');r.run(other.x+2,other.z,2);assert.equal(sway.tree.value,other.tid,'it sways');
 r.settle(other.x+2,other.z);
 f.dispose();}
// A fruiting tree: the kick drops fruit by the shake's rules (1–3) and the fruit swings with the canopy.
{const r=rig({seen:true}),f=r.f;const L0=S.SUMMIT_LANDMARKS.sandbarLanding;f.update(r.ctx(L0.x,L0.z));
 const v=f.view(),t=v.trees.find(x=>x.hanging>=2),site=sites.find(s=>s.tid===t.tid),st=K.kickStance(site,0);r.face(st.face);
 r.press();r.run(st.root.x,st.root.z,1);assert.equal(r.calls.pose[0].how.kind,'treekick','a fruit tree takes the kick too');
 r.run(st.root.x,st.root.z,Math.ceil((r.calls.pose[0].how.lead+JM.POSE_TIME.treekick*JP.TREE_KICK_CONTACT)*60)+2);
 assert(f.stats.dropped>=1&&f.stats.dropped<=3,`1–3 fruit drop (${f.stats.dropped})`);assert.equal(sway.tree.value,site.tid);assert.equal(F.forageStore.get().note,'','the note shows once per device');
 r.settle(st.root.x,st.root.z);f.dispose();}
// Reduced motion: no sway or leaves, the cue still plays.
{const r=rig({reduced:true,seen:true}),f=r.f;const L0=S.SUMMIT_LANDMARKS.sandbarLanding;f.update(r.ctx(L0.x,L0.z));
 const site=bareSite(f,'tree'),st=K.kickStance(site,0);r.face(st.face);r.press();r.run(st.root.x,st.root.z,1);
 r.run(st.root.x,st.root.z,Math.ceil((r.calls.pose[0].how.lead+JM.POSE_TIME.treekick*.6*JP.TREE_KICK_CONTACT)*60)+3);
 assert(r.calls.cue.includes('thunk'),'the cue plays');assert.equal(sway.angle.value,0,'no sway');assert.equal(sway.tree.value,0);
 const fx=r.scene.getObjectByName('job-fx-particles');assert(!fx.visible,'no leaves');f.dispose();}
// Busy (a job, a kick game): the press is left alone.
{const r=rig({busy:true,seen:true}),f=r.f;const L0=S.SUMMIT_LANDMARKS.sandbarLanding;f.update(r.ctx(L0.x,L0.z));
 const site=bareSite(f,'tree'),st=K.kickStance(site,0);r.face(st.face);r.press();r.run(st.root.x,st.root.z,2);assert.equal(r.calls.take,0);assert.equal(r.calls.pose.length,0);f.dispose();}

// ---- 5. Wiring.
{const town=read('components/Town.tsx'),jm=read('lib/town/jobs/jobMoves.ts');
 assert(town.includes("kick:{pressed:()=>shotHold.current,take:cancelShotHold},yaw:()=>player.root.rotation.y"),'Town hands the shot hold and the heading to the forage runtime');
 assert(town.includes("jobMoves.start(how.kind??'treeshake'"),'the pose kind comes from the runtime (push or kick)');
 assert(/'treekick'/.test(jm)&&jm.includes('treekick:.8'),'jobMoves knows the kick pose');
 assert(read('lib/graphics/jobPoses.ts').includes('treekick:[')&&/export const TREE_KICK_CONTACT=/.test(read('lib/graphics/jobPoses.ts')),'the keyframes and the contact');
 assert(!/new T\.(Mesh|InstancedMesh|.*Material)\(/.test(read('lib/town/summitTreeKick.ts')),'the rules file builds nothing');}
console.log(`PASS Summit Isle tree kick: ${sites.length} kickable sites (${perKind.size} kinds), the kick pose at the bark, sway + leaves + thunk through the existing sway uniform, particle pool and cues, 0.6 s cooldown, single-tree handover, nothing at rest`);
