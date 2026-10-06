// Pass-puzzle readable intent on the rig (lane A): "to me!" call, marker ready stance, one-shot
// reactions and the torso squash spring. Run: node tests/player-reactions.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set,Float64Array});return m.exports;}
const {createPlayer,profileFor}=load('lib/graphics/player.ts');
const DT=1/60,KINDS=['chest','thigh','header','stumble','deflect','slide','dejected'];
const J=(r,n)=>r.root.getObjectByName(n),W=(r,n)=>J(r,n).getWorldPosition(new T.Vector3());
const JOINTS=['player-pelvis','armor-torso','player-head','left-shoulder','right-shoulder','left-elbow','right-elbow','left-hip','right-hip','left-knee','right-knee'];
const poseVector=r=>{r.root.updateMatrixWorld(true);const v=[];for(const n of JOINTS){const o=J(r,n);v.push(o.rotation.x,o.rotation.y,o.rotation.z);}v.push(J(r,'player-pelvis').position.y*4);return v;};
const dist=(a,b)=>Math.sqrt(a.reduce((s,x,i)=>s+(x-b[i])**2,0));
// World-space gaze: how far the face points down (sin of the gaze pitch), whatever the spine does.
const gazeDown=r=>{r.root.updateMatrixWorld(true);const q=J(r,'player-head').getWorldQuaternion(new T.Quaternion());return -new T.Vector3(0,0,1).applyQuaternion(q).y;};
const everything=r=>{r.root.updateMatrixWorld(true);const v=[];r.root.traverse(o=>v.push(...o.matrixWorld.elements));return v;};
const speedFor=kind=>kind==='slide'?5:kind==='stumble'?3:0;
// Drives a rig: .6 s warm-up, then the reaction over `duration`; returns per-frame samples.
// `travel` picks the velocity profile (a slide decelerates), so a no-reaction twin can travel identically.
function react(kind,{duration=.8,travel=kind,speed=speedFor(travel),side=1,until=1,extra=()=>({}),id='r-'+kind,sampler=r=>r}={}){
 const r=createPlayer(id,'home',false),out=[];let x=0,z=0;const warm=36,frames=Math.round(until*duration/DT);
 for(let i=0;i<warm+frames;i++){
  const q=i<warm?undefined:Math.min(1,(i-warm)*DT/duration),v=travel==='slide'&&q!==undefined?speed*(1-.85*q):speed;z+=v*DT;
  const m={facing:0,kickSide:side,lookX:0,lookZ:z+3,runIntensity:v>0?Math.min(1,v/6):undefined,...extra(q,i)};
  if(q!==undefined&&kind){m.reaction=kind;m.reactionProgress=q;}
  r.update(x,z,DT,i*DT,false,m);if(q!==undefined)out.push({q,i,s:sampler(r,x,z)});
 }
 return {r,out};
}

// 1. Every reaction reaches its own, clearly different pose, and returns to the gait at the end.
{
 const peaks={},neutral={};
 const peakAt={chest:.35,thigh:.35,header:.25,stumble:.3,deflect:.25,slide:.4,dejected:.5};
 for(const kind of KINDS){
  const base=react(null,{speed:speedFor(kind),until:peakAt[kind],id:'r-'+kind});neutral[kind]=poseVector(base.r);base.r.dispose();
  const {r}=react(kind,{until:peakAt[kind]});peaks[kind]=poseVector(r);
  const d=dist(peaks[kind],neutral[kind]);assert(d>.8,kind+' departs clearly from the plain gait pose: '+d.toFixed(3));
  r.dispose();
 }
 for(let a=0;a<KINDS.length;a++)for(let b=a+1;b<KINDS.length;b++){
  const d=dist(peaks[KINDS[a]],peaks[KINDS[b]]);assert(d>.6,KINDS[a]+' and '+KINDS[b]+' are distinct poses: '+d.toFixed(3));
 }
 // Semantics a child should read: check the defining joint of each action.
 const at=(kind,q,fn,opts={})=>{const {r,out}=react(kind,{...opts,until:q,sampler:fn});const v=out[out.length-1].s;r.dispose();return v;};
 const pitch=r=>J(r,'player-pelvis').rotation.x+J(r,'armor-torso').rotation.x;
 const standPitch=at(null,.35,pitch);
 assert(at('chest',.35,pitch)<standPitch-.4,'chest: leans back to cushion');
 assert(at('chest',.35,r=>Math.min(J(r,'left-shoulder').rotation.x,J(r,'right-shoulder').rotation.x))>.4,'chest: both arms back');
 assert(at('chest',.35,gazeDown)>.2,'chest: eyes down on the ball');
 assert(at('thigh',.35,r=>W(r,'right-ankle').y)>.3,'thigh: the receiving thigh lifts the boot ~.3 m+');
 assert(at('thigh',.35,r=>W(r,'left-ankle').y)<.09,'thigh: the support boot stays on the pitch');
 const headLoad=at('header',.25,r=>J(r,'player-head').rotation.x),headSnap=at('header',.48,r=>J(r,'player-head').rotation.x);
 assert(headSnap>headLoad+.6,'header: the neck snaps from eyes-up to through the ball: '+headLoad.toFixed(2)+' -> '+headSnap.toFixed(2));
 assert(at('header',.25,r=>Math.max(W(r,'left-hand').y,W(r,'right-hand').y))>1.35,'header: arms up for balance');
 assert(at('stumble',.3,pitch,{speed:3})>at(null,.3,pitch,{speed:3})+.35,'stumble: lurches forward after a heavy touch');
 assert(Math.abs(at('deflect',.25,r=>J(r,'armor-torso').rotation.y))>.3,'deflect: shoulder turns into the ball');
 const slide=at('slide',.4,(r,x,z)=>({hip:W(r,'player-pelvis').y,lead:W(r,'right-ankle').z-z,trail:W(r,'left-ankle').z-z}));
 assert(slide.hip<.5,'slide: hips drop low to the grass: '+slide.hip.toFixed(2));
 assert(slide.lead>.55&&slide.lead>slide.trail+.5,'slide: leading leg long in front, trailing leg tucked: '+JSON.stringify(slide));
 const standGaze=at(null,.5,gazeDown),sad=at('dejected',.5,gazeDown);assert(sad>standGaze+.5,'dejected: head down '+standGaze.toFixed(2)+' -> '+sad.toFixed(2));
 // At the end of the action the body is back in its gait: compare with a twin that travelled identically
 // without reacting, after the host clears the reaction.
 const settle={};
 for(const kind of KINDS){
  const twin=react(null,{travel:kind,id:'end-'+kind}).r,{r}=react(kind,{id:'end-'+kind});
  let z=r.root.position.z;const v=kind==='slide'?speedFor(kind)*.15:speedFor(kind);
  for(let i=0;i<30;i++){z+=v*DT;for(const q of[r,twin])q.update(0,z,DT,2+i*DT,false,{facing:0,kickSide:1,lookX:0,lookZ:z+3,runIntensity:v>0?Math.min(1,v/6):undefined});}
  const d=dist(poseVector(r),poseVector(twin));settle[kind]=+d.toFixed(3);
  // .4 (A7, Oct 2026, was .35): at the slide's .75 m/s exit the gait now takes full-length, distance-matched steps, so
  // the same small phase offset from the twin reads as a larger joint distance (.27 -> .38); it still oscillates, never grows.
  assert(d<(kind==='slide'?.4:.35),kind+' settles back into the gait after the action: '+d.toFixed(3));
  r.dispose();twin.dispose();
 }
 console.log('REACTION_SETTLE',JSON.stringify(settle));
 console.log('REACTION_POSES_PASS',JSON.stringify(Object.fromEntries(KINDS.map(k=>[k,+dist(peaks[k],neutral[k]).toFixed(2)]))));
}

// 2. No foot slide during chest/thigh reactions, standing and on a slow move onto the ball.
{
 const feet=(r)=>({l:W(r,'left-ankle'),rt:W(r,'right-ankle')});
 const report={};
 for(const kind of['chest','thigh'])for(const speed of[0,1]){
  const {r,out}=react(kind,{speed,duration:.85,sampler:rr=>feet(rr)});
  let worst=0,grounded=0,minGrounded=2;
  for(let i=1;i<out.length;i++){
   let down=0;
   for(const k of['l','rt']){const a=out[i-1].s[k],b=out[i].s[k];if(Math.max(a.y,b.y)<.0765){down++;worst=Math.max(worst,Math.hypot(a.x-b.x,a.z-b.z));}}
   grounded+=down;minGrounded=Math.min(minGrounded,down);
  }
  // A boot resting on the pitch (sole height within 1.5 mm of the ground in both frames) never skates
  // (1.5 mm/frame allows IK rounding); standing, the body is never left without support.
  assert(worst<.0015,`${kind} at ${speed} m/s: a grounded boot slides ${worst.toFixed(4)} m in one frame`);
  if(speed===0)assert(minGrounded>=1,`${kind} standing: at least one boot always bears the weight`);
  report[kind+'@'+speed]={worst:+worst.toFixed(5),minGrounded};r.dispose();
 }
 // The thigh's support boot is world-locked for the whole touch, not just frame to frame.
 const {r,out}=react('thigh',{speed:0,sampler:rr=>W(rr,'left-ankle')});
 const s0=out[0].s,drift=Math.max(...out.map(o=>Math.hypot(o.s.x-s0.x,o.s.z-s0.z)));
 assert(drift<.005,'thigh support boot holds its spot on the grass: '+drift);r.dispose();
 console.log('REACTION_FEET_PASS',JSON.stringify(report),'thighSupportDrift',drift.toFixed(5));
}

// 3. Squash spring: volume preserving, one impulse per serial, settles and then sleeps.
{
 const r=createPlayer('squash','home',false),torso=J(r,'armor-torso');r.setProfile(profileFor('def',4));
 r.update(0,0,DT,0,false,{facing:0});const base=torso.scale.clone(),vol0=base.x*base.y*base.z;
 const ys=[];let settledAt=-1;
 for(let i=0;i<120;i++){
  r.update(0,0,DT,i*DT,false,{facing:0,squash:-3.5,squashSerial:1});
  const s=torso.scale,vol=s.x*s.y*s.z;assert(Math.abs(vol-vol0)<1e-9,'volume preserved at frame '+i+': '+vol/vol0);
  assert(Math.abs(s.x/base.x-s.z/base.z)<1e-12,'x and z share 1/sqrt(s)');
  ys.push(s.y/base.y);if(settledAt<0&&i>0&&s.y===base.y&&s.x===base.x)settledAt=i;
 }
 const low=Math.min(...ys),high=Math.max(...ys.slice(ys.indexOf(low)));
 assert(low<.93&&low>.8,'a receive squashes the torso ~7-20 %: '+low);
 assert(high>1&&high<1.04,'one soft rebound, no ringing: '+high);
 assert(settledAt>0&&settledAt<75,'settles (and snaps exactly to the rest scale) within ~1.2 s: frame '+settledAt);
 // Settled: the same serial never re-fires, and the rest scale is exactly the shape scale.
 for(let i=0;i<30;i++)r.update(0,0,DT,3+i*DT,false,{facing:0,squash:-3.5,squashSerial:1});
 assert.deepEqual(torso.scale.toArray(),base.toArray(),'the same serial applies once only');
 // A strike stretches (positive impulse); coarse frames stay bounded (substeps at <= 60 Hz).
 r.update(0,0,.1,4,false,{facing:0,squash:4,squashSerial:2});
 const stretched=torso.scale.y/base.y;assert(stretched>1&&stretched<1.26,'a strike stretches and a 100 ms frame stays bounded: '+stretched);
 for(let i=0;i<20;i++){r.update(0,0,.1,4+i*.1,false,{facing:0,squash:4,squashSerial:2});assert(torso.scale.toArray().every(Number.isFinite));}
 assert.deepEqual(torso.scale.toArray(),base.toArray(),'a coarse-frame spring settles too');
 // Profile changes while settled keep the shape scale.
 r.setProfile(profileFor('fwd',2));const fwdBase=torso.scale.clone();r.update(0,0,DT,9,false,{facing:0,squashSerial:2});
 assert.deepEqual(torso.scale.toArray(),fwdBase.toArray(),'a settled spring leaves the profile shape alone');
 // Paused frame (dt 0) holds the spring where it is.
 r.update(0,0,DT,10,false,{facing:0,squash:-3,squashSerial:3});const held=torso.scale.y;r.update(0,0,0,10,false,{facing:0,squash:-3,squashSerial:3});
 assert.equal(torso.scale.y,held,'a paused frame freezes the spring');
 r.dispose();
 console.log('SQUASH_SPRING_PASS',JSON.stringify({low:+low.toFixed(3),rebound:+high.toFixed(3),settledAt,stretched:+stretched.toFixed(3)}));
}

// 4. Absent (or neutral) fields: output identical to a rig that never heard of them.
{
 const scripts=[
  ['sprint',t=>[0,6],()=>({runIntensity:1})],
  ['brake',t=>[0,t<1.5?6:Math.max(0,6-30*(t-1.5))],()=>({runIntensity:1})],
  ['jockey',t=>[Math.sin(t)*2,-1],()=>({jockey:1,facing:0,backpedal:.8,stance:'ready'})],
  ['kick',t=>[0,2],t=>({kick:(t%1.2)/1.2,actionKind:'pass',kickSide:1})],
  ['receive',t=>[0,1],t=>({receive:Math.min(1,t),receiveProgress:t%1,kickSide:-1,lookX:0,lookZ:5})],
 ];
 for(const [name,vel,motion]of scripts)for(const reduced of[false,true]){
  const a=createPlayer('same-'+name,'home',false),b=createPlayer('same-'+name,'home',false);let x=0,z=0;
  for(let i=0;i<200;i++){const t=i*DT,[vx,vz]=vel(t);x+=vx*DT;z+=vz*DT;
   a.update(x,z,DT,t,reduced,motion(t));
   b.update(x,z,DT,t,reduced,{...motion(t),called:0,ready:0,reaction:undefined,reactionProgress:.4,squash:0,squashSerial:7});
   const va=everything(a),vb=everything(b);for(let k=0;k<va.length;k++)if(va[k]!==vb[k])assert.fail(`${name} reduced=${reduced}: neutral fields changed the pose at frame ${i}`);}
  a.dispose();b.dispose();
 }
 console.log('ABSENT_FIELDS_PASS identical transforms with absent vs neutral fields');
}

// 5. Blends: the call and the ready stance ease in/out; reactions cross-fade and fade when cleared (no snaps).
{
 const jump=(r,prev)=>{const v=poseVector(r);const d=prev?Math.max(...v.map((x,i)=>Math.abs(x-prev[i]))):0;return [v,d];};
 // "To me!" raises the ball-side hand high above the head.
 const r=createPlayer('call','home',false);let prev,worst=0,handTop=0,handPeak=0,handFrames=0;
 for(let i=0;i<120;i++){r.update(0,i*DT*2,DT,i*DT,false,{facing:0,lookX:1.5,lookZ:i*DT*2+5,called:i>=20&&i<80?1:0,runIntensity:.3});const [v,d]=jump(r,prev);prev=v;if(i>20)worst=Math.max(worst,d);if(i>=40&&i<80){const h=W(r,'right-hand').y-W(r,'player-head').y;handTop+=h;handPeak=Math.max(handPeak,h);handFrames++;}}
 handTop/=handFrames;
 // Ball at the rig's +x (right) side: the right hand waves up around head-top height and above.
 assert(handTop>.1&&handPeak>.18,'called: the ball-side hand is raised above the head: mean '+handTop.toFixed(2)+' peak '+handPeak.toFixed(2));
 assert(worst<.35,'called eases in and out without a snap: '+worst.toFixed(3));
 r.dispose();
 // The marker's graded ready stance sinks the hips like stance:'ready'.
 const still=m=>{const q=createPlayer('mark','away',false);for(let i=0;i<60;i++)q.update(0,0,DT,i*DT,false,{facing:0,...m});const y=J(q,'player-pelvis').position.y;q.dispose();return y;};
 const upright=still({}),half=still({ready:.5}),full=still({ready:1}),stance=still({stance:'ready'});
 assert(full<upright-.05&&half<upright-.02&&half>full,'ready: knees bend with the blend '+[upright,half,full].map(v=>v.toFixed(3)));
 assert(Math.abs(full-stance)<1e-9,'ready 1 equals the existing ready stance');
 // Cross-fade chest -> header mid-way, then clear the reaction mid-way: bounded per-frame change.
 const c=createPlayer('fade','home',false);prev=undefined;worst=0;
 for(let i=0;i<120;i++){const m={facing:0,kickSide:1};if(i>=10&&i<40){m.reaction='chest';m.reactionProgress=(i-10)/50;}else if(i>=40&&i<70){m.reaction='header';m.reactionProgress=(i-40)/60;}
  c.update(0,0,DT,i*DT,false,m);const [v,d]=jump(c,prev);prev=v;if(i>0)worst=Math.max(worst,d);}
 assert(worst<.3,'switching and clearing reactions cross-fades (max joint change/frame '+worst.toFixed(3)+')');
 c.dispose();
 // Reduced motion: calmer reactions, still readable, nothing oscillating.
 const calm=createPlayer('calm','home',false);for(let i=0;i<30;i++)calm.update(0,0,DT,i*DT,true,{facing:0,reaction:'chest',reactionProgress:i/60});
 const calmPitch=J(calm,'armor-torso').rotation.x;calm.dispose();assert(calmPitch<-.1&&calmPitch>-.4,'reduced motion keeps a smaller chest cushion: '+calmPitch);
 // Rides ignore reactions entirely.
 const ride=createPlayer('ride','home',false),plain=createPlayer('ride','home',false);
 for(let i=0;i<30;i++){ride.update(0,i*.1,DT,i*DT,false,{travelMode:'bike',reaction:'slide',reactionProgress:.4,called:1,squash:3,squashSerial:1});plain.update(0,i*.1,DT,i*DT,false,{travelMode:'bike'});}
 assert.deepEqual(everything(ride),everything(plain),'riding ignores reactions, calls and squash');ride.dispose();plain.dispose();
 console.log('REACTION_BLENDS_PASS',JSON.stringify({handTop:+handTop.toFixed(2),ready:[upright,half,full].map(v=>+v.toFixed(3)),crossfade:+worst.toFixed(3)}));
}
console.log('PLAYER_REACTIONS_PASS');
