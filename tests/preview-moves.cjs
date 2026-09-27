// Character preview moves (Make it yours arrows + /skill-lab?skill=showcase): lib/graphics/previewMoves.ts and
// lib/graphics/celebrations.ts. Run: node tests/preview-moves.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const ROOT=path.resolve(__dirname,'..'),loaded=new Map();
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set,Float64Array,URLSearchParams});return m.exports;}
const style=load(path.join(ROOT,'lib/graphics/characterStyle.ts'));
const {createPlayer}=load(path.join(ROOT,'lib/graphics/player.ts'));
const PM=load(path.join(ROOT,'lib/graphics/previewMoves.ts')),C=load(path.join(ROOT,'lib/graphics/celebrations.ts')),SM=load(path.join(ROOT,'lib/graphics/skillMoves.ts'));
const {PREVIEW_MOVES,stepMoveIndex,moveCaption,createPreviewDriver,moveSeconds}=PM;
const DT=1/60,W=(r,n)=>r.root.getObjectByName(n).getWorldPosition(new T.Vector3());

// 1. The list: order (showcase first, then the in-place moves), labels, wrap-around arrows, caption.
assert.equal(PREVIEW_MOVES.map(m=>m.id).join(),['showcase','idle','walk','run','keepUps','soleRoll','flickUp','stepover','insideCut','outsideCut','cruyff','dragBack','fakeShot','nutmeg','rainbow',
 'chipShot','finesseShot','trivela','toePoke','knuckleball','volley','header','bicycle','scissor','blockTackle','pokeTackle','keeperDive','keeperThrow','keeperRoll','keeperPunt','celebrate','thankPasser','airplane','kneeSlide'].join());
// Grouped: every move but the showcase names its group, and each group is one run of arrows (no group comes back).
{const g=PREVIEW_MOVES.slice(1).map(m=>m.group);assert(g.every(Boolean),'every move has a group');const runs=g.filter((x,i)=>i===0||x!==g[i-1]);assert.equal(new Set(runs).size,runs.length,'groups are contiguous: '+runs.join());
 assert.equal(runs.join(),'Movement,Ball mastery,Dribbles,Shooting,Defending,Goalkeeping,Celebrations');}
assert.equal(PREVIEW_MOVES[0].label,'Skills showcase');
const n=PREVIEW_MOVES.length;
assert.equal(stepMoveIndex(0,-1),n-1,'prev from the first wraps to the last');
assert.equal(stepMoveIndex(n-1,1),0,'next from the last wraps to the first');
assert.equal(stepMoveIndex(3,1),4);assert.equal(stepMoveIndex(3,-1),2);
{const b=PREVIEW_MOVES.findIndex(m=>m.id==='bicycle');assert.equal(moveCaption(b),`Shooting · Bicycle kick ${b+1}/${n}`);assert.equal(moveCaption(0),`Skills showcase 1/${n}`);}
assert(new Set(PREVIEW_MOVES.map(m=>m.label)).size===n,'labels are unique');

// A rig + probe like the preview's (parent space = world here).
function rigFor(st){style.setCharacterStyle(st);const r=createPlayer('you','home');style.setCharacterStyle(undefined);return r;}
function probeFor(r){const a=new T.Vector3(),b=new T.Vector3();return {ankle:(side,out)=>{r.root.getObjectByName(side<0?'left-ankle':'right-ankle').getWorldPosition(a);out.x=a.x;out.y=a.y;out.z=a.z;return out;},hands:out=>{r.handPositions(a,b);out.x=(a.x+b.x)/2;out.y=(a.y+b.y)/2;out.z=(a.z+b.z)/2;return out;},get headTop(){return r.headTop;},get juggleHead(){return r.juggleHead;}};}
const finite=o=>Object.values(o).every(v=>v===undefined||typeof v!=='number'||Number.isFinite(v));
const MOVE_FIELDS=new Set(['facing','lookX','lookZ','lookY','stance','keeper','keeperReach','ready','samplePose','runIntensity','dribbling','skill','turnSmoothing','move','jump','reaction','reactionProgress','dive','juggle','juggleTouch','kickSide']);

/** Plays a move on a real rig; records every frame. */
function play(id,{st='bean',dt=DT,max=40}={}){
 const r=rigFor(st),probe=probeFor(r),d=createPreviewDriver();d.set(id);const frames=[];let t=0;
 for(let i=0;i<30;i++)r.update(0,0,DT,i*DT,false,{facing:0});
 while(t<max){const f=d.step(dt,probe);r.update(f.x,f.z,dt,30*DT+t,false,f.motion);if(f.celebrate>=0)C.applyCelebrationArms(r.root,f.celebrate);r.root.updateMatrixWorld(true);
  frames.push({t,step:f.step,x:f.x,z:f.z,ball:{...f.ball},vis:f.ballVisible,motion:JSON.parse(JSON.stringify(f.motion)),cel:f.celebrate,
   R:W(r,'right-ankle'),L:W(r,'left-ankle'),RK:W(r,'right-knee'),LK:W(r,'left-knee'),head:W(r,'player-head'),hands:probe.hands({x:0,y:0,z:0}),yaw:r.root.rotation.y,
   HL:(()=>{const a=new T.Vector3(),b=new T.Vector3();r.handPositions(a,b);return [a,b];})()});
  t+=dt;if(f.done)break;}
 r.dispose();return frames;
}

// 2. Every move: valid motion fields, finite numbers, the ball hidden where no ball belongs, and it finishes.
const played={};
for(const m of PREVIEW_MOVES){
 const frames=play(m.id);played[m.id]=frames;const tag=m.id;
 assert(frames.length>0&&frames.length<40*60,`${tag}: settles into its idle`);
 for(const f of frames){
  for(const k of Object.keys(f.motion))assert(MOVE_FIELDS.has(k),`${tag}: unexpected motion field ${k}`);
  assert(finite(f.motion)&&Number.isFinite(f.x)&&Number.isFinite(f.z)&&Number.isFinite(f.ball.x+f.ball.y+f.ball.z),`${tag}: finite`);
  if(f.motion.skill)assert(f.motion.skill.progress>=0&&f.motion.skill.progress<=1&&Math.abs(f.motion.skill.side)===1,`${tag}: skill field`);
  if(f.motion.move)assert(f.motion.move.progress>=0&&f.motion.move.progress<=1&&Math.abs(f.motion.move.side)===1,`${tag}: move field`);
  if(f.motion.dive)assert(f.motion.dive.progress>=0&&f.motion.dive.progress<=1&&Math.abs(f.motion.dive.dir)===1,`${tag}: dive field`);
  if(f.motion.jump)assert(f.motion.jump.progress>=0&&f.motion.jump.progress<=1&&f.motion.jump.height>0&&f.motion.jump.height<=.8,`${tag}: jump field`);
  if(f.motion.juggle!==undefined)assert(f.motion.juggle>=0&&f.motion.juggle<1,`${tag}: juggle phase`);
  if(f.vis)assert(f.ball.y>=.189,`${tag}: ball above the grass (${f.ball.y.toFixed(3)})`);
  // In place: the root stays near the middle of the stage.
  assert(Math.hypot(f.x,f.z)<1.6,`${tag} t=${f.t.toFixed(2)}: stays in place (${f.x.toFixed(2)}, ${f.z.toFixed(2)})`);
 }
 if(!m.ball)assert(frames.every(f=>!f.vis),`${tag}: ball hidden`);
 else assert(frames.some(f=>f.vis),`${tag}: ball shown`);
 const last=frames[frames.length-1];assert(Math.hypot(last.x,last.z)<.05,`${tag}: ends back in the middle`);
}
for(const id of ['walk','run','celebrate'])assert(played[id].every(f=>!f.vis),id+': no ball');
// Walk/run: treadmill, feet cycling with the root pinned.
for(const id of ['walk','run']){const fr=played[id].filter(f=>f.step==='gait');assert(fr.every(f=>f.x===0&&f.z===0),id+': root pinned');
 const zs=fr.map(f=>f.R.z-f.L.z);assert(Math.max(...zs)>.2&&Math.min(...zs)<-.2,`${id}: the feet cycle (${Math.min(...zs).toFixed(2)}..${Math.max(...zs).toFixed(2)})`);}

// 3. The ball meets the limb at contact.
const near=(frames,pred)=>frames.find(pred);
const MP=load(path.join(ROOT,'lib/graphics/player.ts')).MOVE_PHASE;
for(const st of ['bean','classic']){
 const fr=st==='bean'?played:Object.fromEntries(['volley','bicycle','scissor','header','keeperDive','soleRoll','keepUps'].map(id=>[id,play(id,{st})]));
 for(const kind of ['volley','bicycle','scissor']){
  const c=near(fr[kind],f=>f.motion.move&&f.motion.move.progress>=MP[kind].contact);
  const boot=c.motion.move.side<0?c.L:c.R,d=boot.distanceTo(new T.Vector3(c.ball.x,c.ball.y,c.ball.z));
  assert(d<.3,`${st} ${kind}: ball at the kicking boot at contact (${d.toFixed(2)} m)`);
 }
 const h=near(fr.header,f=>f.motion.jump&&f.motion.jump.progress>=.47),hd=h.head.distanceTo(new T.Vector3(h.ball.x,h.ball.y,h.ball.z));
 assert(hd<.42,`${st} header: ball at the forehead at the jump peak (${hd.toFixed(2)})`);
 const dv=fr.keeperDive.filter(f=>f.motion.dive&&f.motion.dive.progress>=.3);
 for(const f of dv.slice(0,50)){const g=Math.hypot(f.hands.x-f.ball.x,f.hands.y-f.ball.y,f.hands.z-f.ball.z);assert(g<.2,`${st} dive p=${f.motion.dive.progress.toFixed(2)}: ball in the gloves (${g.toFixed(2)})`);}
 for(const f of fr.soleRoll.filter(f=>f.motion.move&&f.motion.move.progress>.25&&f.motion.move.progress<.75)){const boot=f.motion.move.side<0?f.L:f.R,g=Math.hypot(boot.x-f.ball.x,boot.z-f.ball.z);assert(g<.14&&boot.y>.3,`${st} sole roll: sole on top of the ball (${g.toFixed(2)})`);}
 // Keep-ups: at each touch (the ball turns from falling to rising) it is at that limb: boot, knee or head.
 const ku=fr.keepUps;let touches=0;
 for(let i=2;i<ku.length;i++){const a=ku[i-2],b=ku[i-1],c=ku[i];if(b.motion.juggle===undefined||!(b.ball.y<a.ball.y&&c.ball.y>b.ball.y))continue;
  // the touch frame: nearest frame where the limb was highest near this bounce
  const kind=c.motion.juggleTouch,side=c.motion.kickSide,ball=new T.Vector3(b.ball.x,b.ball.y,b.ball.z);let best=9;
  for(const f of ku.slice(Math.max(0,i-8),i+6)){const limb=kind==='head'?f.head:kind==='knee'?(side<0?f.LK:f.RK):(side<0?f.L:f.R);best=Math.min(best,limb.distanceTo(new T.Vector3(f.ball.x,f.ball.y,f.ball.z)));}
  touches++;assert(best<(kind==='head'?.45:kind==='knee'?.33:.3),`${st} keep-ups ${kind}: ball at the limb (${best.toFixed(2)})`);void ball;}
 assert(touches>=3,st+' keep-ups: touches happen');
}

// 3b. Batch 2 moves (skillMoves.ts, played through the preview driver on the solved bean and classic rigs):
// every boot contact meets the ball, a keeper's ball stays in the hands until the release, each move stays on the
// stage, and the ball-less celebrations never show one.
const BATCH2=['insideCut','outsideCut','fakeShot','nutmeg','chipShot','finesseShot','trivela','toePoke','knuckleball','blockTackle','pokeTackle','keeperThrow','keeperRoll','keeperPunt','thankPasser','airplane','kneeSlide'];
const RELEASE={keeperThrow:.5,keeperRoll:.46,keeperPunt:.3};
for(const st of ['bean','classic'])for(const id of BATCH2){
 const fr=st==='bean'?played[id]:play(id,{st}),spec=SM.SKILL_MOVES[id];
 assert(fr.some(f=>f.motion.skill&&f.motion.skill.type===id),`${st} ${id}: the skill plays`);
 const sides=new Set(fr.filter(f=>f.motion.skill).map(f=>f.motion.skill.side));
 if(PREVIEW_MOVES.find(m=>m.id===id).loops>1)assert(sides.size===2,`${st} ${id}: both feet on alternate loops`);
 for(const c of spec.contacts)for(const side of sides){
  // The frame nearest the contact (a swinging boot moves several cm per frame).
  const cand=fr.filter(f=>f.motion.skill&&f.motion.skill.type===id&&f.motion.skill.side===side);assert(cand.length,`${st} ${id}: contact frame`);
  const f=cand.reduce((a,b)=>Math.abs(b.motion.skill.progress-c.p)<Math.abs(a.motion.skill.progress-c.p)?b:a);
  const legSide=c.leg==='s'?side:-side,an=legSide<0?f.L:f.R,off=SM.skillSurfaceOffset(c.surface,legSide*side),ox=off[0]*side,oz=off[2],y=f.yaw;
  const pt=new T.Vector3(an.x+ox*Math.cos(y)+oz*Math.sin(y),an.y+off[1],an.z-ox*Math.sin(y)+oz*Math.cos(y)),d=pt.distanceTo(new T.Vector3(f.ball.x,f.ball.y,f.ball.z));
  assert(d<.1,`${st} ${id} side ${side}: ${c.leg} ${c.surface} meets the ball at ${c.p} (${d.toFixed(3)} m)`);
 }
 if(RELEASE[id]){const carry=fr.filter(f=>f.motion.skill&&f.motion.skill.type===id&&f.motion.skill.progress>.08&&f.motion.skill.progress<RELEASE[id]);assert(carry.length>10,id+': carry frames');
  let worst=0;for(const f of carry){const b=new T.Vector3(f.ball.x,f.ball.y,f.ball.z);worst=Math.max(worst,Math.min(b.distanceTo(f.HL[0]),b.distanceTo(f.HL[1])));}
  assert(worst<.36,`${st} ${id}: the ball stays in the hands until the release (worst ${worst.toFixed(2)} m from a hand)`);
  assert(fr.filter(f=>f.step==='idle'&&f.vis&&f.motion.keeperReach>.6).length>5,`${st} ${id}: takes the ball into the hands first`);}
 if(!spec.ball)assert(fr.every(f=>!f.vis),`${st} ${id}: no ball`);
}

// 4. Skills showcase: one chained sequence, 12–25 s, ball handed over continuously (no teleports at any seam).
const secs=moveSeconds('showcase');assert(secs>=12&&secs<=25,`showcase lasts ${secs.toFixed(1)} s`);
{
 const d=createPreviewDriver();d.set('showcase');const fine=1/480;let prev=null,prevStep='',seams=0,maxSeam=0,t=0;const order=[];
 while(!d.finished&&t<30){const f=d.step(fine);if(f.step!==prevStep){order.push(f.step==='skill'?f.motion.skill.type:f.step==='ground'?f.motion.move.kind:f.step);}
  if(prev){const j=Math.hypot(f.ball.x-prev.x,f.ball.y-prev.y,f.ball.z-prev.z);assert(f.ballVisible||!prev.vis,'showcase: the ball never vanishes mid-sequence');
   if(f.step!==prevStep){seams++;maxSeam=Math.max(maxSeam,j);assert(j<.03,`showcase seam ${prevStep}→${f.step}: ball jumps ${j.toFixed(3)} m`);}
   assert(j<.05,`showcase t=${t.toFixed(2)} (${f.step}): ball jump ${j.toFixed(3)} m in 1/480 s`);}
  prev={x:f.ball.x,y:f.ball.y,z:f.ball.z,vis:f.ballVisible};prevStep=f.step;t+=fine;}
 assert(seams>=15,'showcase: many chained steps');
 const moves=order.filter(s=>s!=='reset');
 assert.equal(moves.slice(0,11).join(),['dribble','bodyFeint','stepover','insideCut','dragBack','cruyffTurn','fakeShot','soleRoll','flickJuggle','rainbowFlick','celebrate'].join(),'showcase order: '+moves.join(','));
 const sc=played.showcase;assert(sc.filter(f=>f.step!=='idle').every(f=>f.vis),'showcase: ball in play throughout');
 // Root continuity too (no teleports): the root moves < 5 cm per frame.
 for(let i=1;i<sc.length;i++)assert(Math.hypot(sc[i].x-sc[i-1].x,sc[i].z-sc[i-1].z)<.08,`showcase root jump at ${sc[i].t.toFixed(2)}`);
}
// Switching moves mid-way never teleports the root (a reset step walks back first).
{const d=createPreviewDriver();d.set('stepover');for(let i=0;i<50;i++)d.step(DT);const a={x:d.frame.x,z:d.frame.z};const f0=d.step(0);const before={x:f0.x,z:f0.z};d.set('walk');const f=d.step(DT);assert(Math.hypot(f.x-before.x,f.z-before.z)<.08,'switch: no root jump');void a;}

// 5. Reduced motion: a still key pose per move, the same every time, at the move's key moment.
for(const m of PREVIEW_MOVES){const d=createPreviewDriver(),a=d.still(m.id),s1=JSON.stringify(a.motion),b=createPreviewDriver().still(m.id);assert.equal(JSON.stringify(b.motion),s1,m.id+': still pose is deterministic');}
{const d=createPreviewDriver();let f=d.still('bicycle');assert(f.motion.move&&Math.abs(f.motion.move.progress-MP.bicycle.contact)<.02,'still bicycle at contact');
 f=d.still('keeperDive');assert(f.motion.dive&&Math.abs(f.motion.dive.progress-.3)<.02,'still dive at the save');
 f=d.still('celebrate');assert(f.celebrate>0&&f.motion.jump===undefined,'still celebration: arms up, no jump');
 f=d.still('walk');assert(f.motion.samplePose&&f.motion.samplePose.distance>0,'still walk: mid-stride');
 f=d.still('header');assert(f.motion.jump&&Math.abs(f.motion.jump.progress-.47)<.02&&f.motion.reaction==='header','still header at the peak');
 f=d.still('showcase');assert(f.motion.skill,'still showcase: a skill pose');}

// 6. Celebration helper: two hops, arms up in a V, then back to the rig's own arms.
assert(C.celebrationJump(.1)&&C.celebrationJump(.5)&&!C.celebrationJump(.8),'two hops');
assert(C.celebrationArms(.2).w>.99&&C.celebrationArms(.2).left.sx<-2.6,'arms up in the V');
assert(C.celebrationArms(.999).w<.01,'arms released at the end');
{const r=rigFor('bean');r.update(0,0,DT,0,false,{facing:0});C.applyCelebrationArms(r.root,.2);r.root.updateMatrixWorld(true);const hand=new T.Vector3(),o=new T.Vector3();r.handPositions(hand,o);assert(hand.y>1.75&&o.y>1.75,`hands above the head (${hand.y.toFixed(2)}, ${o.y.toFixed(2)})`);r.dispose();}
console.log(`preview moves ✓ (${n} moves, showcase ${secs.toFixed(1)} s)`);
