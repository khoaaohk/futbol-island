// Freestyle tricks (Oct 4 2026; lib/graphics/freestyleTricks.ts, freestyleRoutine.ts, courtFreestyle.ts, trickPose.ts,
// docs/player-moves/MOVES.md § G). Run: node tests/freestyle-tricks.cjs
// Covers: the trick data (names, football purposes, categories); every trick's ball path on BOTH feet (continuous, never under
// the floor, starts and ends on the sole at TRICK_REST); every contact on the SOLVED bean townsperson rig (the touching boot,
// thigh, chest, neck or head meets the ball) and no sinking of the ball into the body between contacts; the rig's ground guard
// never has to lift a trick pose; the routines (tiled with no gaps or overlaps, foot continuity across segments and the loop,
// pair windows aligned on both partners, varied); the runtime (shared clock, partner fallback, reduced motion, tags).
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript'),T=require('three');
const loaded=new Map();
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Math,console,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+(fs.existsSync(path.resolve(path.dirname(file),id+'.ts'))?'.ts':'.tsx'))):require(id)});
 loaded.set(file,m.exports);return m.exports;}
const CS=load('lib/graphics/characterStyle.ts');
const {createPlayer}=load('lib/graphics/player.ts'),FT=load('lib/graphics/freestyleTricks.ts'),FR=load('lib/graphics/freestyleRoutine.ts'),CF=load('lib/graphics/courtFreestyle.ts');
const {npcDress}=load('lib/town/beanLooks.ts'),{NPC_DIALOGUES}=load('lib/town/npcDialogues.ts'),{DEFAULT_CUSTOMIZATION}=load('lib/town/customization.ts');
const R=FT.TRICK_R,REST=FT.TRICK_REST,DT=1/60;
const {FREESTYLE_TRICKS:TRICKS}=FT;

// ---------------------------------------------------------------- 1. data
assert(TRICKS.length>=24,'at least 24 named tricks');
assert.equal(new Set(TRICKS.map(t=>t.id)).size,TRICKS.length,'unique ids');
const NEW=['toeStall','instepCatch','aroundWorldIn','crossover','heelFlick','thighFoot','chestJuggles','neckStall','shoulderRoll','sitJuggle','sitCatch','lieJuggle','sitToStand','soleRolls','toeTaps','insideOutside','pairVolley','pairHeader','pairGround'];
for(const k of NEW)assert(FT.trickById(k),k+' exists');
for(const c of ['sit','upper','lower','ground','pair'])assert(TRICKS.filter(t=>t.category===c).length>=3,c+': at least three tricks');
for(const t of TRICKS){
 assert(t.label.length>2&&t.purpose.length>25&&/[.]$/.test(t.purpose),t.id+': a name and a one-line football purpose');
 assert(t.seconds>2.5&&t.seconds<16,t.id+': a readable length');
 assert.equal(t.pair,t.category==='pair',t.id+': only pair tricks use the partner');
 const last=t.beats[t.beats.length-1];assert(last.hold&&last.c==='sole'&&last.s===1,t.id+': ends with the trick foot on the ball');
}

// ---------------------------------------------------------------- 2. the bean townsperson rig (as islandNpcs dresses it)
const freestylers=NPC_DIALOGUES.filter(d=>d.freestyle!==undefined);
CS.setCharacterStyle('bean'); // the island's townsfolk render in the bean style
function npcRig(d){const rig=createPlayer('town-npc-'+d.id,'home');
 rig.setAppearance({...DEFAULT_CUSTOMIZATION,character:d.character,face:d.face,clothing:d.clothing,body:d.body??'balanced'});const dr=npcDress(d);rig.setBeanLook(dr.look,dr.outfit);rig.update(0,0,0,0,true);return rig;}
const byId=Object.fromEntries(freestylers.map(d=>[d.id,d]));
const kei=npcRig(byId['court-kei']),teo=npcRig(byId['court-nico']);
const ctxOf=rig=>FT.createTrickCtx({legs:1,pelvisRest:.88,headTop:rig.headTop,ground:rig.root.userData.beanBody.ground});
const ctx=ctxOf(kei),pctx=ctxOf(teo);ctx.partner=pctx;pctx.partner=ctx;ctx.partnerD=pctx.partnerD=5.1;
assert(ctx.headTop>1.4&&ctx.headTop<2.1&&ctx.ground.length>=8,'bean measurements available');

// Body model for contact and penetration checks: capsules / spheres from the solved joints (rig frame, root at the origin).
const V=()=>new T.Vector3(),J=(r,n)=>r.root.getObjectByName(n);
const W=(o,x=0,y=0,z=0)=>o.localToWorld(new T.Vector3(x,y,z));
function segDist(p,a,b){const ab=b.clone().sub(a),t=Math.max(0,Math.min(1,p.clone().sub(a).dot(ab)/ab.lengthSq()));return p.distanceTo(a.clone().addScaledVector(ab,t));}
function body(rig,c){
 rig.root.updateMatrixWorld(true);const parts=[];
 const torso=J(rig,'armor-torso');for(let k=0;k<c.ground.length;k+=2)parts.push({name:'torso',kind:'s',a:W(torso,0,c.ground[k],0),r:c.ground[k+1]});
 parts.push({name:'head',kind:'s',a:W(torso,0,c.headTop-c.pelvisRest-.17,.02),r:.16});
 for(const side of ['left','right']){const σ=side==='left'?-1:1,hip=J(rig,side+'-hip'),knee=J(rig,side+'-knee'),ankle=J(rig,side+'-ankle'),sh=J(rig,side+'-shoulder'),el=J(rig,side+'-elbow');
  parts.push({name:'thigh'+σ,kind:'c',a:W(hip),b:W(knee),r:.085},{name:'shin'+σ,kind:'c',a:W(knee),b:W(ankle),r:.065},{name:'boot'+σ,kind:'c',a:W(ankle,0,-.03,-.03),b:W(ankle,0,-.03,.16),r:.06},
   {name:'arm'+σ,kind:'c',a:W(sh),b:W(el),r:.06},{name:'forearm'+σ,kind:'c',a:W(el),b:W(el,0,-.265,0),r:.05});}
 return parts;
}
const gap=(p,part)=>(part.kind==='s'?p.distanceTo(part.a):segDist(p,part.a,part.b))-part.r-R;
// The trick frame is the rig's ROOT frame: measure joints with the root at the origin, unturned (the host owns the heading).
function pose(rig,frame){rig.update(0,0,DT,0,false,{trick:frame.pose,facing:0});rig.root.position.set(0,0,0);rig.root.rotation.set(0,0,0);return rig.root.getObjectByName('player-pelvis').position.y;}
const CONTACT_PART={laces:'boot',sole:'boot',heel:'boot',inside:'boot',outside:'boot',scoop:'boot',thigh:'thigh',chest:'torso',neck:'torso',head:'head'};

// ---------------------------------------------------------------- 3. every trick, both feet: path, contacts, no sinking
const report=[];
for(const t of TRICKS)for(const side of [1,-1])for(const role of t.pair?['lead','follow']:['solo']){
 const frame=FT.createTrickFrame(),label=`${t.id} side ${side} ${role}`;
 // freshly posed rig per trick (no carry-over from the previous one)
 const rig=npcRig(byId['court-kei']);let prev=null,worstGap=Infinity,contacts=0,maxStep=0;
 const n=Math.ceil(t.seconds/DT);
 for(let f=0;f<=n;f++){
  const τ=Math.min(t.seconds,f*DT);FT.sampleTrick(t,τ,side,ctx,frame,role);const b=frame.ball,p=new T.Vector3(b.x,b.y,b.z);
  assert(Number.isFinite(b.x+b.y+b.z),label+': finite ball');
  assert(b.y>=R-.002,`${label}: ball above the floor at ${τ.toFixed(2)} s (${b.y.toFixed(3)})`);
  if(prev){const step=p.distanceTo(prev);maxStep=Math.max(maxStep,step);assert(step<.2,`${label}: continuous ball path at ${τ.toFixed(2)} s (step ${step.toFixed(3)} m)`);}
  prev=p;
  if(f===0||f===n){assert(p.distanceTo(new T.Vector3(REST.x,REST.y,REST.z))<.01,`${label}: starts and ends at TRICK_REST`);}
  if(f%3&&f!==n)continue;
  const py=pose(rig,frame);assert(Math.abs(py-frame.pose.pelvisY)<.02,`${label}: the ground guard (almost) never lifts the pose (${τ.toFixed(2)} s, ${(py-frame.pose.pelvisY).toFixed(3)} m)`);
  const parts=body(rig,ctx);
  // The ball never sinks into the body (a few cm of soft contact allowed: bean surfaces are rounder than the capsules).
  for(const part of parts){const g=gap(p,part);if(g<worstGap)worstGap=g;assert(g>-.07,`${label}: ball clear of ${part.name} at ${τ.toFixed(2)} s (gap ${g.toFixed(3)})`);}
 }
 // Contacts on the solved rig: the touching part meets the ball (gap within ±5 cm).
 for(const c of FT.trickContacts(t)){
  if(c.c==='ground')continue;if((role==='follow')!==(c.who==='F'))continue;
  FT.sampleTrick(t,c.t+.0001,side,ctx,frame,role);pose(rig,frame);
  const b=frame.ball,p=role==='follow'?null:new T.Vector3(b.x,b.y,b.z);
  if(!p){// the follower touches the shared ball: the leader's ball mapped into its frame
   const lead=FT.createTrickFrame();FT.sampleTrick(t,c.t+.0001,side,pctx,lead,'lead');var q=new T.Vector3(-lead.ball.x,lead.ball.y,ctx.partnerD-lead.ball.z);}
  const ball=p??q,want=CONTACT_PART[c.c],σ=c.s*side,parts=body(rig,ctx).filter(x=>x.name===want||x.name===want+σ);
  const g=Math.min(...parts.map(x=>gap(ball,x)));contacts++;
  assert(Math.abs(g)<.05,`${label}: ${c.c} contact at ${c.t.toFixed(2)} s meets the ball (gap ${g.toFixed(3)} m)`);
 }
 report.push(`${label}: ${contacts} contacts, closest ${worstGap.toFixed(3)} m, max step ${maxStep.toFixed(3)} m`);
}

// ---------------------------------------------------------------- 4. routines
const ids=freestylers.map(d=>d.id);
const routines={};
for(const [a,b] of FR.FREESTYLE_PAIRS){const [ra,rb]=FR.buildPairRoutines(a,b,byId[a].freestyle,byId[b].freestyle);routines[a]=ra;routines[b]=rb;}
for(const id of ids)routines[id]??=FR.buildSoloRoutine(id,byId[id].freestyle);
for(const id of ids){
 const r=routines[id],segs=r.segs;
 assert(r.cycle>=90,id+': a long, varied cycle ('+r.cycle.toFixed(0)+' s)');
 assert.equal(segs[0].start,0,id+': starts at 0');
 for(let i=0;i<segs.length;i++){const s=segs[i],n=segs[(i+1)%segs.length];
  assert(s.dur>.5,`${id}: segment ${i} long enough`);
  if(i<segs.length-1)assert(Math.abs(s.start+s.dur-n.start)<1e-9,`${id}: no gap or overlap after segment ${i}`);
  else assert(Math.abs(s.start+s.dur-r.cycle)<1e-9,id+': the last segment ends at the loop point');
  assert.equal(s.to,n.side,`${id}: the resting foot carries over after segment ${i} (including the loop)`);
  if(s.kind!=='idle')assert.equal(s.dur,s.trick.seconds,`${id}: trick segment ${i} plays at its own speed`);
 }
 const kinds=new Set(segs.filter(s=>s.trick&&s.kind==='trick').map(s=>s.trick.id)),all=new Set(segs.filter(s=>s.trick).map(s=>s.trick.id));
 assert(kinds.size>=5&&all.size>=7,`${id}: varied loop (${kinds.size} solo tricks, ${all.size} with pair tricks)`);
 for(const k of kinds)assert(!FT.trickById(k).pair,id+': solo segments are solo tricks');
}
for(const [a,b] of FR.FREESTYLE_PAIRS){
 const pa=routines[a].segs.filter(s=>s.kind==='pair'),pb=routines[b].segs.filter(s=>s.kind==='pair');
 assert.equal(routines[a].cycle,routines[b].cycle,'partners share one cycle');assert(pa.length>=3,'pair tricks in every cycle');
 assert.equal(pa.length,pb.length);
 for(let i=0;i<pa.length;i++){assert.equal(pa[i].start,pb[i].start,'pair windows start together');assert.equal(pa[i].trick,pb[i].trick);assert.equal(pa[i].side,pb[i].side);
  assert.deepEqual([pa[i].role,pb[i].role].sort(),['follow','lead'],'one leads, one follows');}
 assert.equal(new Set(pa.map(s=>s.trick.id)).size,3,'all three pair tricks appear');
}
// Ball continuity over a whole routine through the runtime (including the loop point), on the shared clock.
function runtime(d,rig){const fs=CF.createCourtFreestyle(rig,d.freestyle,d.id);return fs;}
{
 const A=runtime(byId['court-nico'],teo),Bn=runtime(byId['court-kei'],kei);
 CF.linkFreestylePair(A,Bn,{x:82,z:-61.5},{x:81,z:-56.5});
 assert(Math.abs(A.ctx.partnerD-5.099)<.01);assert(Math.abs(A.facing??0)<1e-9,'no forced facing before a pair window');
 const cyc=A.routine.cycle;let prevA=null,prevB=null,tags=new Set(),pairFacing=0,clock=0;
 for(let f=0;f<=Math.ceil((cyc+3)/(1/30));f++){clock=f/30;A.prepare(1/30,true,false,clock);Bn.prepare(1/30,true,false,clock);
  for(const [fs,prevKey] of [[A,'a'],[Bn,'b']]){const p=fs.ball.position.clone(),prev=prevKey==='a'?prevA:prevB;if(prev)assert(p.distanceTo(prev)<.35,`${fs.id}: ball continuous through the routine at ${clock.toFixed(2)} s`);if(prevKey==='a')prevA=p;else prevB=p;}
  if(A.tag)tags.add(A.tag);if(A.facing!==undefined){pairFacing++;assert(Math.abs(A.facing-Math.atan2(-1,5))<1e-9,'faces the partner in a pair window');}
 }
 assert(tags.size>=8,'Teo shows many trick names over one loop ('+tags.size+')');assert(pairFacing>0,'Teo plays pair windows');
 // Busy partner: a pair window starting while the partner is inactive is played solo (keep-ups), with no forced facing.
 const w=A.routine.segs.find(s=>s.kind==='pair');Bn.prepare(0,false,false,w.start+.1);A.prepare(0,true,false,w.start+.1);
 assert.equal(A.trick.id,'keepUps');assert.equal(A.facing,undefined);
 // Reduced motion / inactive: no trick pose, the ball rests in front, no tag.
 A.prepare(1/30,true,true,10);assert.equal(A.motion.trick,undefined);assert.equal(A.tag,null);assert.deepEqual(A.ball.position.toArray(),[REST.x,REST.y,REST.z]);
 A.prepare(1/30,false,false,10);assert.equal(A.motion.trick,undefined);
 // Paused: the same clock gives the same frame.
 A.prepare(0,true,false,42);const s1=A.ball.position.clone();A.prepare(0,true,false,42);assert(A.ball.position.equals(s1),'deterministic on the clock');
 A.dispose();Bn.dispose();
}
// Solo freestylers keep their own seeded start in the loop.
assert.notEqual(routines['cay-lua'].offset,routines['pier-ollie'].offset);

// ---------------------------------------------------------------- 5. rig option: optional and fading
{
 const a=createPlayer('fade-a','home'),b=createPlayer('fade-a','home');
 for(let i=0;i<30;i++){a.update(0,0,DT,i*DT,false,{facing:0});b.update(0,0,DT,i*DT,false,{facing:0});}
 const f=FT.createTrickFrame();FT.sampleTrick(FT.trickById('sitJuggle'),5,1,ctx,f);
 for(let i=0;i<20;i++)a.update(0,0,DT,(30+i)*DT,false,{facing:0,trick:f.pose});
 const sitY=J(a,'player-pelvis').position.y;assert(sitY<.3,'the trick pose seats the rig ('+sitY.toFixed(3)+')');
 for(let i=0;i<60;i++){a.update(0,0,DT,(50+i)*DT,false,{facing:0});}
 assert(J(a,'player-pelvis').position.y>.8,'after the trick it fades back to standing');
}
console.log(report.join('\n'));
console.log(`PASS ${TRICKS.length} freestyle tricks on both feet (contacts on the solved bean rig, no sinking, no floor), ${ids.length} routines tiled and looping, pairs aligned`);
