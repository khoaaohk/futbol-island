// Ride emotes v2 (owner, Oct 22 2026: "fix the emotes for the scooter, bikes, and moped. don't have them ride away. it's impacting the zoom and
// going out of frame. create emotes using the different bike, scooter, and moped types so they are all different and unique").
// Pure checks on lib/town/rideEmotes.ts (15 in-place tricks, the brake, the pose sampler), the friend path (emoteContexts.flourishForWire),
// the camera framing (emoteCameraMath.rideWideFor), the rider body writer (lib/graphics/rideEmotePose.ts) and source scans of the wiring.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const cache={};
function load(file){
 if(cache[file])return cache[file];const full=path.join(ROOT,file),m={exports:{}};cache[file]=m.exports;
 vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Math,Object,Float32Array,Number,Array,require:id=>{if(id.startsWith('.'))return load(path.relative(ROOT,path.resolve(path.dirname(full),id))+'.ts');throw new Error('unexpected require '+id);}});
 return cache[file]=m.exports;
}
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const R=load('lib/town/rideEmotes.ts'),EB=load('lib/town/emoteBounds.ts').EMOTE_BOUNDS,CX=load('lib/town/emoteContexts.ts'),CM=load('lib/town/emoteCameraMath.ts');
const RT=R.RT,STEP=1/60,buf=new Float32Array(R.RT_CH),V=()=>({x:0,y:0,z:0});
const sample=(sc,a)=>R.sampleRideTrick(sc.emote,a,buf);
/** Points on the ride (local x, y, z; z forward) the bounds and the camera must keep: the rider's head and hands, both wheels, the bars / tail. */
const pointsFor=sc=>{const L=R.RIDE_LENGTH[sc.ride]/2;return [[0,2.05,0,false],[.45,1.9,0,false],[-.45,1.9,0,false],[0,.35,L,true],[0,.35,-L,true],[0,1.25,L*.7,true],[0,.6,-L,true]];};

t('15 tricks, five per vehicle, ids 60-74, all different names, icons, emoji',()=>{
 assert.equal(R.RIDE_SCRIPTS.length,15);
 for(const r of ['moped','scooter','bike'])assert.equal(R.rideScriptsFor(r).length,5,r);
 assert.equal(JSON.stringify(R.RIDE_SCRIPTS.map(s=>s.emote)),JSON.stringify(Array.from({length:15},(_,i)=>60+i)));
 for(const k of ['label','icon','emoji'])assert.equal(new Set(R.RIDE_SCRIPTS.map(s=>s[k])).size,15,k);
 const names=R.RIDE_SCRIPTS.map(s=>s.label).join(' | ');
 for(const want of ['Burnout donut','Wheelie pop','Kickstand salute','Rev it up','Beep beep','Tail-whip','Hop 180','Flamingo wave','Kick bounce','Nose pivot','Ring-a-ding','Wheelie','Bunny hop','Stoppie','No hands!'])assert(names.includes(want),want);
});

t('in place: every trick keeps its root inside EMOTE_BOUNDS.rootRadius and every point under maxHeight; it starts and ends at rest',()=>{
 const o=V(),q=V();let worstR=0,worstH=0,worstFoot=0;
 for(const sc of R.RIDE_SCRIPTS)for(const yaw of [0,1.1,-2.4]){
  for(let a=0;a<=sc.seconds+1e-9;a+=STEP){
   const p=sample(sc,a);R.trickRootOffset(p,yaw,o);const r=Math.hypot(o.x,o.z);worstR=Math.max(worstR,r);
   assert(r<=EB.rootRadius,`${sc.label} root ${r.toFixed(2)} m at ${a.toFixed(2)} s`);
   for(const [x,y,z,veh] of pointsFor(sc)){R.trickPoint(p,yaw,x,y,z,q,veh);worstH=Math.max(worstH,q.y);assert(q.y<=EB.maxHeight,`${sc.label} too high ${q.y.toFixed(2)}`);
    if(veh&&y<.5){const d=Math.hypot(q.x,q.z)-R.RIDE_LENGTH[sc.ride]/2;worstFoot=Math.max(worstFoot,d);assert(d<=EB.rootRadius,`${sc.label} wheel leaves the footprint by ${d.toFixed(2)}`);}}
  }
  for(const a of [0,sc.seconds]){const p=sample(sc,a);assert(Math.abs(p[RT.PITCH])<.02&&Math.abs(p[RT.ROLL])<.02&&Math.abs(p[RT.LIFT])<.02&&Math.abs(Math.sin(p[RT.YAW]))<.02&&Math.cos(p[RT.YAW])>.99&&Math.cos(p[RT.VYAW])>.99,`${sc.label} at rest at ${a}`);}
 }
 console.log(`  worst root travel ${worstR.toFixed(2)} m (limit ${EB.rootRadius}), highest point ${worstH.toFixed(2)} m (limit ${EB.maxHeight}), wheels ${Math.max(0,worstFoot).toFixed(2)} m past the footprint`);
});

t('smooth: no pose jumps between frames (60 fps)',()=>{
 const prev=new Float32Array(R.RT_CH);
 for(const sc of R.RIDE_SCRIPTS){prev.set(sample(sc,0));for(let a=STEP;a<=sc.seconds;a+=STEP){const p=sample(sc,a);
  for(const c of [RT.PITCH,RT.ROLL,RT.LIFT,RT.YAW,RT.VYAW,RT.RLIFT])assert(Math.abs(p[c]-prev[c])<.25,`${sc.label} jump on ${c} at ${a.toFixed(2)}`);prev.set(p);}}
});

t('brake first: 0.4-0.8 s, speed eases to exactly zero before the trick, about a metre of travel',()=>{
 assert.equal(R.brakeSeconds(0),0);assert.equal(R.brakeSeconds(.2),0,'already still: the trick starts at once');
 for(const v0 of [1,2.5,4.5,6,8,12]){
  const T=R.brakeSeconds(v0);assert(T>=.4&&T<=.8,`v0 ${v0}: ${T}`);
  let d=0,last=v0;for(let a=0;a<T;a+=1/240){const v=R.brakeSpeed(v0,T,a);assert(v<=last+1e-9,'never speeds up');last=v;d+=v/240;}
  assert.equal(R.brakeSpeed(v0,T,T),0);assert(Math.abs(d-R.brakeDistance(v0))<.05,'distance v0*T/3');
  if(v0<=8)assert(d<=1.1,`v0 ${v0} stops in ${d.toFixed(2)} m`);
 }
 const town=read('components/Town.tsx');
 assert(/const v=braking\?brakeSpeed\(r\.v0,r\.brake,r\.age\):0;velocity\.x=r\.dx\*v;velocity\.z=r\.dz\*v;/.test(town),'Town brakes then holds the ride still');
 assert(/input\.current\.x=input\.current\.z=0;const v=braking/.test(town),'no synthetic stick: the trick never steers');
 assert(/const ta=r\.age-r\.brake;r\.on=ta>=0;/.test(town)&&/emoteFx\.dur=cs\?cs\.seconds:rs\?rsBrake\+rs\.seconds/.test(town),'the trick (and the zoom hold) start after the brake');
 assert(!/stickFor|headingAfter|RIDE_SPEED_CAP/.test(town+read('lib/town/rideEmotes.ts')),'the old driving helpers are gone');
});

// Variety: each trick as a time series of the vehicle transform + the rider's weighted joints (8 frames), RMS distance between every pair.
const FRAMES=8;
function signature(sc){const v=[];for(let i=0;i<FRAMES;i++){const p=sample(sc,sc.seconds*(i+.5)/FRAMES);
 v.push(p[RT.PITCH]*2,p[RT.ROLL]*2,Math.sin(p[RT.YAW]),1-Math.cos(p[RT.YAW]),p[RT.LIFT]*2,Math.sin(p[RT.VYAW]),1-Math.cos(p[RT.VYAW]),p[RT.RLIFT]*2,p[RT.WHEEL]/16,p[RT.STAND],p[RT.PUFF]*.5,
  p[RT.RSX]*p[RT.RW]/3,p[RT.RSZ]*p[RT.RW]/3,p[RT.REX]*p[RT.RW]/3,p[RT.LSX]*p[RT.LW]/3,p[RT.LSZ]*p[RT.LW]/3,p[RT.LEX]*p[RT.LW]/3,p[RT.HY]*p[RT.HW],p[RT.HX],p[RT.CX],p[RT.CZ],
  p[RT.LHX]*p[RT.LLW]/2,p[RT.LHZ]*p[RT.LLW]/2,p[RT.LKN]*p[RT.LLW]/2,p[RT.RHX]*p[RT.RLW]/2,p[RT.RHZ]*p[RT.RLW]/2,p[RT.RKN]*p[RT.RLW]/2);}return v;}
t('unique: every trick differs from the other 14 (pose + vehicle state over time), within and across vehicles',()=>{
 const sig=R.RIDE_SCRIPTS.map(signature);let best=Infinity,pair='';
 for(let i=0;i<sig.length;i++)for(let j=i+1;j<sig.length;j++){let s=0;for(let k=0;k<sig[i].length;k++)s+=(sig[i][k]-sig[j][k])**2;const rms=Math.sqrt(s/sig[i].length);
  if(rms<best){best=rms;pair=R.RIDE_SCRIPTS[i].label+' / '+R.RIDE_SCRIPTS[j].label;}
  assert(rms>.06,`${R.RIDE_SCRIPTS[i].label} vs ${R.RIDE_SCRIPTS[j].label}: RMS ${rms.toFixed(3)}`);}
 console.log(`  closest pair: ${pair} RMS ${best.toFixed(3)}`);
 // each trick shows real motion (not a static pose)
 for(const sc of R.RIDE_SCRIPTS){const s=signature(sc);let peak=0;for(const x of s)peak=Math.max(peak,Math.abs(x));assert(peak>.15,sc.label+' moves');}
});
t('each vehicle uses what it really has',()=>{
 const peak=(e,c)=>{const sc=R.rideScriptFor(e);let m=0;for(let a=0;a<=sc.seconds;a+=.02)m=Math.max(m,Math.abs(sample(sc,a)[c]));return m;},E=R.RIDE_EMOTE;
 assert(peak(E.MopedRev,RT.PUFF)>0&&peak(E.MopedDonut,RT.PUFF)>0&&peak(E.MopedDonut,RT.WHEEL)>10,'the engine: exhaust puffs, a burnout');
 assert(Math.abs(sample(R.rideScriptFor(E.MopedDonut),2.9)[RT.YAW])>4,'the donut goes round');assert.equal(sample(R.rideScriptFor(E.MopedDonut),1.5)[RT.YPIV]>.3,true,'about the front wheel');
 assert(peak(E.MopedSalute,RT.STAND)>.9,'stands up on the kickstand');assert(peak(E.MopedHorn,RT.LIFT)>.05,'the horn bounce');
 assert(peak(E.ScooterTailWhip,RT.VYAW)>6&&peak(E.ScooterTailWhip,RT.YAW)===0,'tail-whip: the deck spins, not the rider');
 assert(Math.abs(sample(R.rideScriptFor(E.ScooterHop180),1.5)[RT.YAW]-Math.PI)<.05,'hop 180: facing back mid-way');
 assert(peak(E.ScooterOneFoot,RT.RLW)>.9&&peak(E.ScooterKick,RT.RLW)>.9,'the back foot: flamingo and kick-push');
 assert(sample(R.rideScriptFor(E.ScooterPivot),1.4)[RT.PITCH]>.2,'nose pivot: back wheel up');
 const wh=sample(R.rideScriptFor(E.BikeWheelie),1.5);assert(wh[RT.PITCH]<-.5&&wh[RT.PIVOT]<0,'wheelie: front up about the back axle');
 const st=sample(R.rideScriptFor(E.BikeStoppie),1.3);assert(st[RT.PITCH]>.4&&st[RT.PIVOT]>0,'stoppie: back up about the front axle');
 assert(peak(E.BikeBunnyHop,RT.LIFT)>.5,'bunny hop leaves the ground');
 const nh=sample(R.rideScriptFor(E.BikeNoHands),1.6);assert(nh[RT.RW]>.9&&nh[RT.LW]>.9&&nh[RT.RSX]<-2&&nh[RT.LSX]<-2,'no hands: both arms up');
 assert.equal(R.rideScriptFor(E.BikeBell).cues.map(c=>c.cue).join(),'bell,bell');assert(R.rideScriptFor(E.MopedHorn).cues.every(c=>c.cue==='horn'));
});

t('friends: the same trick from the sender ride mode, existing wire values only; Wave stays a wave',()=>{
 const M={scooter:2,bike:3,moped:4};const out={roll:0,pitch:0,yaw:0,lift:0,ripple:0};
 for(const sc of R.RIDE_SCRIPTS){
  assert(![0,3,6].includes(sc.wire),sc.label);const f=CX.flourishForWire(sc.wire,M[sc.ride]);assert(f&&f.emote===sc.emote&&f.arm===sc.emote&&f.seconds===sc.seconds,sc.label);
  const mid=sc.seconds/2;CX.flourishAt(sc.emote,mid,sc.seconds,out,1);const p=sample(sc,mid);assert.equal(out.pitch,p[RT.PITCH]);assert.equal(out.roll,p[RT.ROLL]);
 }
 for(const m of [2,3,4])assert.equal(CX.flourishForWire(0,m),undefined,'Wave (0) on a ride: the ordinary wave');
 assert.equal(CX.flourishForWire(1,0),undefined,'on foot: no ride trick');assert(CX.flourishForWire(1,5),'flying flourishes unchanged');
 assert.equal(CX.flourishForWire(4,3).emote,R.RIDE_EMOTE.BikeWheelie);assert.equal(CX.flourishForWire(4,2).emote,R.RIDE_EMOTE.ScooterTailWhip);assert.equal(CX.flourishForWire(4,4).emote,R.RIDE_EMOTE.MopedDonut);
 const proto=read('multiplayer/protocol/types.ts');assert(/Scooter: 2, Bike: 3, Moped: 4/.test(proto),'protocol ride modes');
 const cel=read('lib/graphics/celebrations.ts'),ra=read('lib/graphics/remoteAvatars.ts');
 assert(/if\(emote>=60\)\{applyRideTrickBody\(root,emote,age,w\);return;\}/.test(cel),'applyRideEmote poses the whole rider for a trick');
 assert(/applyRideEmote\(rig\.root,fs0\.arm,e\.emoteAge/.test(ra)&&/flourishAt\(fs0\.emote,e\.emoteAge,fs0\.seconds,FL,1\)/.test(ra),'the friend path (remoteAvatars, untouched) already plays it');
});

t('rider body writer: blends named joints, both arms only where the trick needs them, no allocation',()=>{
 const P=load('lib/graphics/rideEmotePose.ts'),names=['right-shoulder','right-elbow','left-shoulder','left-elbow','player-head','player-chest','left-hip','left-knee','right-hip','right-knee'];
 const mk=()=>{const j={};for(const k of names)j[k]={rotation:{x:.1,y:.05,z:.02}};return {j,root:{getObjectByName:k=>j[k]}};};
 for(const sc of R.RIDE_SCRIPTS){let any=false;for(const u of [.25,.45,.65]){const {j,root}=mk();P.applyRideTrickBody(root,sc.emote,sc.seconds*u,1);if(names.some(k=>j[k].rotation.x!==.1||j[k].rotation.y!==.05||j[k].rotation.z!==.02))any=true;}assert(any,sc.label+' moves the rider');
  const {j,root}=mk();P.applyRideTrickBody(root,sc.emote,sc.seconds*.45,1);const p=sample(sc,sc.seconds*.45);if(p[RT.LW]===0)assert(j['left-shoulder'].rotation.x===.1&&j['left-elbow'].rotation.x===.1,sc.label+': the left hand stays on the bar');}
 const {j,root}=mk();P.applyRideTrickBody(root,R.RIDE_EMOTE.BikeNoHands,1.6,1);assert(j['left-shoulder'].rotation.x<-2&&j['right-shoulder'].rotation.x<-2);
 const src=read('lib/graphics/rideEmotePose.ts');assert(!/new [A-Z]\w*\(/.test(src.slice(src.indexOf('export function applyRideTrickBody'))),'no allocation per call');
});

t('camera: the vehicle footprint is framed, the whole trick stays inside a portrait phone frame (solo and with a townsperson)',()=>{
 assert(CM.rideWideFor('moped')>CM.rideWideFor('bike')&&CM.rideWideFor('bike')>CM.rideWideFor('scooter')&&CM.rideWideFor('scooter')>=0);
 assert.equal(CM.rideWideFor('jetpack'),CM.EMOTE_CAM.rideWide);
 const out={eye:V(),target:V()},q=V(),o=V();
 for(const aspect of [390/844,1.78])for(const sc of R.RIDE_SCRIPTS)for(const facing of [0,2.2]){
  const wide=CM.rideWideFor(sc.ride),yaw=CM.bestEmoteYaw(0,0,0,false,0,0,0,aspect,wide,1.8,CM.EMOTE_CAM.yaw,facing),pitch=CM.emoteLayout(aspect).pitch;
  const dist=CM.frameEmote(out,0,0,0,false,0,0,0,aspect,1,yaw,wide,pitch);
  for(let a=0;a<=sc.seconds;a+=.1){const p=sample(sc,a);for(const [x,y,z,veh] of pointsFor(sc)){R.trickPoint(p,facing,x,y,z,q,veh);
   assert(CM.insideFrame(q.x-out.target.x,q.y-out.target.y,q.z-out.target.z,dist,aspect,yaw,pitch),`${sc.label} leaves the ${aspect<1?'phone':'desktop'} frame at ${a.toFixed(1)} s`);}}
  // with a townsperson 3 m ahead
  const nx=Math.sin(facing)*3,nz=Math.cos(facing)*3,y2=CM.bestEmoteYaw(0,0,0,true,nx,0,nz,aspect,wide,1.8,CM.EMOTE_CAM.yaw,facing),d2=CM.frameEmote(out,0,0,0,true,nx,0,nz,aspect,1,y2,wide,pitch);
  for(let a=0;a<=sc.seconds;a+=.2){const p=sample(sc,a);for(const [x,y,z,veh] of pointsFor(sc)){R.trickPoint(p,facing,x,y,z,q,veh);assert(CM.insideFrame(q.x-out.target.x,q.y-out.target.y,q.z-out.target.z,d2,aspect,y2,pitch),`${sc.label} pair frame`);}}
 }
 const cam=read('lib/town/emoteCamera.ts'),town=read('components/Town.tsx');
 assert(/wide = riding \? \(ride \? rideWideFor\(ride\) : EMOTE_CAM\.rideWide\) : 0/.test(cam));
 assert(/camera\.aspect,onRideNow,ballEmote,emoteYaw0,onRideNow\?rideRef\.current:''\)\)countEmoteCam\(\)/.test(town),'Town passes the vehicle');
 assert(/const pe=id\?emoteNpc:null,/.test(town),'pair framing with the townsperson (nothing rides away now)');
 assert(/emoteCam\.track\(rideScript\.s\?location\.x:pv\.x,pv\.y,rideScript\.s\?location\.z:pv\.z,/.test(town),'the camera follows the ride, not the trick sway');
});

t('Town wiring: pose on both roots, rider body, stand, wheel spin, smoke, cues, NPC answers without stepping, analytics ids',()=>{
 const town=read('components/Town.tsx');
 assert(/if\(rideScript\.on&&!reduced\)\{[^}]*trickRootOffset\(p,player\.root\.rotation\.y,rideScript\.off\)[^}]*vehicle\.root\.rotation\.y\+=p\[RT\.YAW\]\+p\[RT\.VYAW\];\}/.test(town),'rider + vehicle posed together; tail-whip = vehicle only');
 assert(/if\(rideScript\.on&&rideScript\.s\)applyRideTrickBody\(player\.root,rideScript\.s\.emote,0,1,rideScript\.pose\)/.test(town));
 assert(/mopedStand:Math\.max\(trickPose\.stand,rideScript\.on&&!reduced\?rideScript\.pose\[RT\.STAND\]:0\)/.test(town));
 assert(/Math\.hypot\(velocity\.x,velocity\.z\)\+\(rideScript\.on&&!reduced\?rideScript\.pose\[RT\.WHEEL\]:0\)/.test(town)&&/rideScript\.on&&rideScript\.pose\[RT\.PUFF\]>0/.test(town));
 assert(/c==='horn'\)sound\.honk\(\)/.test(town)&&/c==='rev'\)sound\.boost\('forward'\)/.test(town)&&/while\(r\.cue<sc\.cues\.length&&ta>=sc\.cues\[r\.cue\]\.at\)rideCue\(/.test(town));
 assert(/emoteFx\.kind=rs\?rs\.emote:pick;/.test(town)&&/emoteFx\.v=cs\|\|ns\|\|rs\?-1:/.test(town),'a trick runs under its own id: no air five / cheer hop side effects');
 assert(/const npcPick=rs\?rs\.npc:pick;/.test(town)&&/!rs&&Math\.hypot\(velocity\.x,velocity\.z\)<4/.test(town),'townsfolk wave / cheer back, no stepping');
 for(const sc of R.RIDE_SCRIPTS)assert([0,1].includes(sc.npc));
 const K=load('lib/analytics/countIds.ts'),L=load('lib/analytics/emoteLabels.ts').emoteLabels();
 for(const sc of R.RIDE_SCRIPTS){assert(K.EMOTE_WIRE_IDS.includes(sc.emote));assert.equal(L[sc.emote].label,`${sc.label} (${sc.ride})`);assert.equal(L[sc.emote].group,'ride');}
 assert(!K.EMOTE_WIRE_IDS.includes(10)&&!K.EMOTE_WIRE_IDS.includes(18),'the retired travelling rides');
 assert(/\['ride','On a ride',60,74\]/.test(read('lib/analytics/sponsor.ts')));
});
console.log(`ride-emotes: ${n} checks passed`);
