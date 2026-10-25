// Bug squad catch upgrade (Oct 25 2026, docs/BUG_CATCH_UPGRADE_OCT25.md; user: "improve the bug catching job and mechanism. add more
// detail to the movements of catching the bugs using the net and jar. improve the game play for this").
// Covers: the gentle difficulty ramp (bigger catch window early, rarer species a little harder, always bounded), the lock reach, the
// aim ring states, near-miss coaching copy, the capped catch streak (no coins), the hip jar's tip-in timeline (no allocation), the
// net's swing phases (continuous, a hit flick vs a miss follow-through), the firefly jar's screw lid and shake, the pose timing, and
// the wiring (aim ring uniform, Swing button glow, jar meter, reduced motion).
// usage: node tests/bug-catch-feel.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
const cache=new Map();class Ev{constructor(type){this.type=type;}}
const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,queueMicrotask,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,Number,String,Error,Symbol,TextEncoder,Event:Ev,CustomEvent:Ev,
 window:{addEventListener(){},removeEventListener(){},dispatchEvent:()=>true,matchMedia:()=>({matches:false})},document:{createElement:()=>({width:0,height:0,getContext:()=>null}),dispatchEvent:()=>true}});
function load(name){
 let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const r=id=>id==='three'?T:id.startsWith('@/')?load(id.slice(2)):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
const K=load('lib/town/jobs/bugCatch.ts'),NET=load('lib/town/jobs/bugNet.ts'),JAR=load('lib/town/jobs/bugJar.ts'),JM=load('lib/town/jobs/jobMoves.ts'),FX=load('lib/graphics/bugSpotFx.ts');

// ---- 1. The ramp: bigger early, smaller for rarer bugs, bounded ----
{const R=K.CATCH_RAMP,e=(caught,squad,rarity)=>K.catchEase({caught,squad,rarity});
 assert.equal(e(0,10),R.early,'first catch of a shift: the biggest window');
 for(let c=1;c<=R.steps;c++)assert(e(c,10)<e(c-1,10),'the window shrinks catch by catch');
 assert.equal(e(R.steps,10),1,'back to normal after the warm-up');assert.equal(e(20,10),1);
 assert.equal(e(10,0),R.newSquadEase,'a brand-new squad stays a little easier');assert.equal(e(10,R.newSquad),1);
 const order=['common','uncommon','rare','legendary'].map(r=>e(10,10,r));for(let i=1;i<order.length;i++)assert(order[i]<order[i-1],'rarer = a little harder');
 for(const c of [0,1,2,5,50])for(const s of [0,5,20])for(const r of [null,'common','legendary']){const v=e(c,s,r);assert(v>=R.floor&&v<=R.cap,`bounded ${c}/${s}/${r}: ${v}`);}
 assert(e(10,10,'legendary')>=.9,'fair for young kids: never under 0.9');
 // Lock reach scales with the ramp; taps reach further than auto-aim.
 assert(K.canLock(K.AUTO_AIM_RANGE,1)&&!K.canLock(K.AUTO_AIM_RANGE+.01,1));assert(K.canLock(K.AUTO_AIM_RANGE*1.25,1.3),'early: a bigger window');
 assert(!K.canLock(K.AUTO_AIM_RANGE*.95,.9),'legendary: step a little closer');assert(K.canLock(K.TAP_RANGE,1,true)&&!K.canLock(K.TAP_RANGE,1,false));
 // The sweep follows the ease (the old default unchanged).
 const c={x:0,y:1,z:0},b={x:K.NET_SWEEP_RADIUS*1.1,y:1,z:0};assert(!K.inSweep(c,b)&&K.inSweep(c,b,false,1.2),'the ease widens the sweep');
 assert.equal(K.swingResult([{id:'a',...b}],c,null,false),null);assert.equal(K.swingResult([{id:'a',...b}],c,null,false,1.2).id,'a');
 assert.equal(K.predictCatch(0,0,0,{x:0,y:1,z:3},false),K.predictCatch(0,0,0,{x:0,y:1,z:3},false,1),'default ease = the old rule');}

// ---- 2. The aim ring and near-miss coaching ----
{assert.equal(K.aimState(0,0,0,null),'far');assert.equal(K.aimState(0,0,0,{x:0,y:1,z:2}),'ready','in reach: green');
 assert.equal(K.aimState(0,0,0,{x:0,y:1,z:K.AUTO_AIM_RANGE+1}),'near','a few steps more: warm');assert.equal(K.aimState(0,0,0,{x:0,y:1,z:K.AUTO_AIM_RANGE*K.AIM_NEAR+1}),'far');
 assert.equal(K.aimState(0,0,0,{x:0,y:12,z:1}),'near','up high: not ready');
 assert.equal(K.aimState(0,0,0,{x:0,y:1,z:K.AUTO_AIM_RANGE+.5},1.3),'ready','early in a shift the ring turns green sooner');
 assert.equal(K.missKind(null,0),'none');assert.equal(K.missKind(11,0),'none');assert.equal(K.missKind(K.AUTO_AIM_RANGE+1,0),'close');
 assert.equal(K.missKind(K.AUTO_AIM_RANGE+4,0),'far');assert.equal(K.missKind(2,9),'high');
 assert.equal(K.stepsToReach(K.AUTO_AIM_RANGE+.2),1);assert.equal(K.stepsToReach(K.AUTO_AIM_RANGE+1.4),2);
 assert.match(K.missHint('close',1),/One more step/);assert.match(K.missHint('close',2),/2 more steps/);
 assert.match(K.missHint('far'),/ring turns green/);assert.match(K.missHint('high'),/up high/);assert.match(K.missHint('none'),/➤/);
 for(const k of ['close','far','high','none'])assert(K.missHint(k,3).length<70,'one short line');}

// ---- 3. The streak: capped, a whoosh keeps it, a miss resets it, no coins ----
{let s=0;for(let i=0;i<9;i++)s=K.streakAfter(s,'hit');assert.equal(s,K.STREAK.cap,'capped');
 assert.equal(K.streakAfter(3,'whiff'),3,'a swing with no bug near keeps it');assert.equal(K.streakAfter(4,'miss'),0);
 assert.equal(K.streakCheer(1),null);assert.match(K.streakCheer(2),/brace/);assert.match(K.streakCheer(3),/Hat-trick/);assert.match(K.streakCheer(99),/^5 in a row/);
 assert.equal(K.streakBurst(0),K.STREAK.burst);assert.equal(K.streakBurst(99),K.streakBurst(K.STREAK.cap),'sparkles bounded');assert(K.streakBurst(K.STREAK.cap)<=20);
 assert.equal(K.NEW_SPECIES_COINS,1,'economy unchanged');
 const js=read('lib/town/jobs/jobScene.ts');assert(!/coins:[^,]*streak/.test(js),'the streak never pays coins');}

// ---- 4. The hip jar's tip-in timeline (pure, no allocation) ----
{const J=K.JAR_TIP,out={lift:0,spin:0,tip:0,shake:0,pop:false};assert(J.open<J.tip&&J.tip<J.close&&J.close<J.end&&J.end<=1.2);
 for(const t of [-1,0,J.end,5]){const p=K.jarTip(t,out);assert(p===out,'writes into the given object');assert(p.lift===0&&p.spin===0&&p.tip===0&&p.shake===0,`rest at ${t}`);}
 assert(K.jarTip(J.open*.99,out).lift>.1,'the lid lifts off');assert(out.spin<-4,'unscrewing');
 assert(K.jarTip((J.open+J.tip)/2,out).tip>.5,'the jar tips toward the net');assert(K.jarTip(J.open+(J.tip-J.open)*.6,out).pop,'the bug drops in');
 assert(Math.abs(K.jarTip(J.close-.001,out).spin)<.05,'screwed back on');assert(Math.abs(K.jarTip(J.close+.04,out).shake)>0,'a little shake');
 let prev=null;for(let t=0;t<=J.end+.02;t+=1/120){const p=K.jarTip(t,out),v=[p.lift,p.spin,p.tip,p.shake];if(prev)assert(v.every((x,i)=>Math.abs(x-prev[i])<.8),`smooth at ${t.toFixed(3)}`);prev=v;}}

// ---- 5. The net: swing phases continuous, a hit flicks up, a miss follows through ----
{/* both hands at one point: the pole follows the swing aim alone (the rig's hand line is checked in bug-net-hold) */const hoop=new T.Vector3(),l={x:0,y:1.1,z:.25},r={x:0,y:1.1,z:.25};
 function run(outcome){const net=NET.createBugNet(x=>x,false),pts=[];net.reset();
  for(let t=0;t<=K.SWING.end;t+=1/60){if(outcome&&t>=K.SWING.hit&&net.outcomeKind!==outcome)net.outcome(outcome);net.layout(l,r,0,t,'swing',1/60,false);net.hoopCentre(hoop);pts.push({t,x:hoop.x,y:hoop.y,z:hoop.z,flip:net.flip});}
  return {pts,net};}
 for(const o of [null,'hit','miss']){const {pts}=run(o);for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],d=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z);assert(d<.4,`${o??'plain'} swing: no jump at ${b.t.toFixed(2)} (${d.toFixed(2)} m)`);}}
 const hit=run('hit'),miss=run('miss'),rec=K.SWING.sweepEnd+.15,at=(p,t)=>p.find(q=>q.t>=t);
 assert(at(hit.pts,rec).y>at(miss.pts,rec).y+.2,'a catch flicks the hoop up');assert(at(hit.pts,K.SWING.end-.05).flip>.5,'and the bag closes over it');
 assert(at(miss.pts,rec).flip<.2,'a miss: the bag stays open');
 // Ready dip: early in the wind-up the hoop dips a little before it rises.
 const plain=run(null).pts,y0=plain[1].y,dip=Math.min(...plain.filter(q=>q.t<K.SWING.windup*.4).map(q=>q.y));assert(dip<y0-.02,'the ready dip');
 // Reduced motion: still plays, no NaN.
 const net=NET.createBugNet(x=>x,false);for(let t=0;t<K.SWING.end;t+=.05){net.layout(l,r,0,t,'swing',.05,true);net.hoopCentre(hoop);assert(Number.isFinite(hoop.y));}}

// ---- 6. The firefly jar: lid snaps, screws on, shakes; unscrews before it opens ----
{const jar=JAR.createBugJar(x=>x),l={x:-.14,y:1.1,z:.3},r={x:.14,y:1.1,z:.3},step=(n,dt=1/60)=>{for(let i=0;i<n;i++)jar.layout(l,r,0,-1,'carry',dt,false);};
 jar.reset();step(30);assert(jar.lidAngle<-1.5&&jar.screw===0,'open while hunting');
 jar.close(true);let shook=false;for(let i=0;i<90;i++){step(1);if(jar.shaking>0)shook=true;}assert(Math.abs(jar.lidAngle)<.15,'shut');assert.equal(jar.screw,1,'screwed tight');assert(shook,'a little shake');assert.equal(jar.shaking,0,'the shake ends');
 const lid=jar.group.getObjectByName('job-jar-lid');assert(Math.abs(lid.rotation.y-Math.PI*3)<1e-6,'1.5 turns on');
 jar.close(false);step(6);assert(jar.screw>0&&Math.abs(jar.lidAngle)<.15,'it unscrews before the hinge opens');step(60);assert(jar.screw===0&&jar.lidAngle<-1.5,'then opens');
 jar.setFill(.5);const glow=jar.group.getObjectByName('job-jar-glow'),g0=glow.position.clone();step(10);assert(glow.position.distanceTo(g0)>1e-4,'the firefly flutters inside');assert(glow.position.length()<.08,'inside the glass');
 const j2=JAR.createBugJar(x=>x);j2.close(true);j2.layout(l,r,0,-1,'carry',1/60,true);assert.equal(j2.screw,1);assert.equal(j2.shaking,0,'reduced motion: no spin, no shake');
 j2.outcome('hit');assert.equal(j2.outcomeKind,'hit');j2.reset();assert.equal(j2.outcomeKind,null);}

// ---- 7. Pose timing, the aim ring uniform, the wiring ----
{assert.equal(JM.POSE_TIME.netswing,1,'the body swings about as long as the net');assert.equal(JM.POSE_TIME.jarcup,JM.POSE_TIME.netswing);
 const fx=FX.createBugSpotFx();fx.setReady(2);assert.equal(fx.halo.material.uniforms.uReady.value,1);fx.setReady(-1);assert.equal(fx.halo.material.uniforms.uReady.value,0);fx.dispose();
 const js=read('lib/town/jobs/jobScene.ts'),btn=read('components/JobActionButton.tsx'),hud=read('components/IslandJobs.tsx'),css=read('app/globals.css'),sw=read('lib/graphics/bugSwarm.ts');
 assert(/function tickAim\(/.test(js)&&/tickAim\(dt,p\)/.test(js),'the aim ring ticks on a shift');assert(/aimAcc>=\.125/.test(js),'at 8 Hz, not per frame');
 assert(/aimGlow=reducedMotion\?want/.test(js),'reduced motion: the ring snaps, no easing');assert(/readyBuzz=1\.5/.test(js),'the ready tap is throttled');
 assert(/'data-job-ready'/.test(btn)&&/data-job-ready\]/.test(css)&&/prefers-reduced-motion:reduce\)\{\.travel-actions \.job-action\[data-job-ready\]\{animation:none/.test(css),'Swing glows, calm with reduced motion');
 assert(/data-jar-meter/.test(hud)&&/in a row/.test(hud),'the jar meter and the streak in the pill');
 assert(/if\(!reducedMotion&&r\.def\.prop==='bug'\)jarT=0/.test(js),'the hip jar tip never starts with reduced motion');
 assert(/holdT>0\)\{[^}]*if\(!f\.reduced\)/.test(sw),'the locked bug trembles (not with reduced motion) but holds still');
 assert(/onMiss\(hits,S\.ease\)/.test(js)&&/missHint\(kind/.test(js),'misses coach the kid');}
console.log('PASS bug catch feel: ramp, lock reach, aim ring, near-miss copy, capped streak (no coins), jar tip-in, net phases, jar screw lid, wiring');
