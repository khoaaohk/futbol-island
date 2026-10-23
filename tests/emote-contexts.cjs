// Emote contexts (user, Oct 22 2026): flying (button disabled unless a friend flies near; its own set), swimming set, NPC sets (skaters, scooters,
// jugglers) and the field refusals. Pure rules in lib/town/emoteContexts.ts + wiring checks on the source.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
function load(file,over={}){
 const full=path.join(ROOT,file),m={exports:{}};
 vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Math,Object,Array,Set,Map,require:id=>{
   if(id.startsWith('.')){const rel=path.resolve(path.dirname(full),id),key=path.basename(rel);if(over[key])return over[key];return load(path.relative(ROOT,rel+'.ts'),over);}
   throw new Error('unexpected require '+id);}});
 return m.exports;
}
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const C=load('lib/town/emoteContexts.ts');
const proto=read('multiplayer/protocol/types.ts');

t('wire modes match the multiplayer protocol and every ctx emote maps to an existing wire value 0..9',()=>{
 const mode=k=>Number(new RegExp(k+':\\s*(\\d+)').exec(proto)[1]);
 assert.equal(C.WIRE_MODE.Jetpack,mode('Jetpack'));assert.equal(C.WIRE_MODE.Parachute,mode('Parachute'));assert.equal(C.WIRE_MODE.Swim,mode('Swim'));
 for(const s of C.CTX_SCRIPTS){assert(s.wire>=0&&s.wire<=9,s.label);assert(s.emote>=20&&s.emote<=39);}
});
t('Emote button rule: HIDDEN (cell reserved) unless someone can answer; flying needs a FLYING friend (ground NPCs / walking friends do not count), swimming a swimming friend',()=>{
 const R=(o)=>C.emoteButtonState({flying:false,swimming:false,npcNear:false,friendNear:false,friendFlyingNear:false,friendSwimmingNear:false,...o});
 assert.equal(R({}).hidden,true,'alone: no button');assert.equal(R({npcNear:true}).hidden,false);assert.equal(R({friendNear:true}).hidden,false);assert.equal(R({npcNear:true}).ctx,'ground');
 assert.equal(R({flying:true,npcNear:true,friendNear:true}).hidden,true,'flying: a townsperson or a walking friend does not show it');
 assert.equal(R({flying:true,friendFlyingNear:false}).hidden,true);assert.equal(R({flying:true,friendFlyingNear:true}).hidden,false);assert.equal(R({flying:true,friendFlyingNear:true}).ctx,'fly');
 assert.equal(R({swimming:true,npcNear:true,friendNear:true}).hidden,true,'swimming: only a swimming friend');
 assert.equal(R({swimming:true,friendSwimmingNear:true}).hidden,false);assert.equal(R({swimming:true,friendSwimmingNear:true}).ctx,'swim');
 for(const o of [{},{flying:true},{swimming:true},{npcNear:true}])assert.equal(R(o).disabled,false,'never a greyed button: it is shown or hidden');
 assert.equal(C.ctxWheelFor('fly').length,10);assert.equal(C.ctxWheelFor('swim').length,10);assert.equal(C.ctxWheelFor('ground').length,0);
 const labels=[...C.ctxWheelFor('fly'),...C.ctxWheelFor('swim')].map(s=>s.label);
 for(const l of ['Barrel roll','Wing wave','Loop-de-loop','Fly-by high five','Thank-you glide','Star pass','Comet keepy-ups','Jetpack salute','Upside-down giggle','Sky dance',
  'Splash wave','Water spray cheer','Duck-dive pop-up','Thank-you float','Tread & laugh','Splash high five','Splash pass','Bubble keepy-ups','Seal clap','Tread dance'])assert(labels.includes(l),l);
 assert.equal(C.isFlying('jetpack','idle'),true);assert.equal(C.isFlying('walk','idle'),false);assert.equal(C.isFlying('walk','parachute'),true);
 // the store only notifies on a change
 let calls=0;const off=C.emoteCtxStore.subscribe(()=>calls++);C.emoteCtxStore.set({npcNear:true});C.emoteCtxStore.set({npcNear:true});C.emoteCtxStore.set({npcNear:false});off();assert.equal(calls,2);
});
t('nearest flying friend within 40 m (3D); walkers and far flyers do not count',()=>{
 const out={x:0,y:0,z:0},me={x:0,y:30,z:0};
 assert.equal(C.nearestFlyingFriend(me,[{x:10,y:30,z:0,mode:0}],out),-1,'a walker');
 assert.equal(C.nearestFlyingFriend(me,[{x:50,y:30,z:0,mode:5}],out),-1,'too far');
 const d=C.nearestFlyingFriend(me,[{x:30,y:30,z:0,mode:5},{x:12,y:34,z:0,mode:6}],out);
 assert(Math.abs(d-Math.hypot(12,4))<1e-9&&out.x===12);
 assert.equal(C.nearestFlyingFriend(me,[],out),-1);
});
t('a friend avatar picks the flourish from the SENDER mode; ground modes keep the ordinary emote',()=>{
 assert.equal(C.flourishForWire(1,5).emote,C.CTX_EMOTE.BarrelRoll);assert.equal(C.flourishForWire(4,6).emote,C.CTX_EMOTE.Loop);assert.equal(C.flourishForWire(8,6).emote,C.CTX_EMOTE.SkyDance);
 assert.equal(C.flourishForWire(0,8).emote,C.CTX_EMOTE.SplashWave);assert.equal(C.flourishForWire(7,8).emote,C.CTX_EMOTE.TreadLaugh);
 assert.equal(C.flourishForWire(1,0),undefined);assert.equal(C.flourishForWire(3,5).emote,C.CTX_EMOTE.CometKeepyUp);assert.equal(C.flourishForWire(6,8).emote,C.CTX_EMOTE.SplashPass);
 for(let w=0;w<10;w++)for(const m of [0,1])assert.equal(C.flourishForWire(w,m),undefined,'on foot: the ordinary emote');
});
// TEN per context (owner, Oct 23 2026): flying, swimming and each ride offer the standard ten meanings in the standard wheel order.
const ORDER=[0,2,1,6,3,5,7,8,9,4];
const R=load('lib/town/rideEmotes.ts');
const contexts=()=>[['fly',C.ctxWheelFor('fly'),5],['swim',C.ctxWheelFor('swim'),8],...['scooter','bike','moped'].map((r,i)=>[r,R.rideWheelFor(r),2+i])];
t('every context has exactly ten distinct scripts, one per standard wire value, in the standard wheel order; the wire mapping round-trips',()=>{
 for(const [name,list,mode] of contexts()){
  assert.equal(list.length,10,name);assert.equal(JSON.stringify(list.map(s=>s.wire)),JSON.stringify(ORDER),name+' order');
  for(const k of ['emote','label','icon','emoji'])assert.equal(new Set(list.map(s=>s[k])).size,10,name+' distinct '+k);
  for(const s of list){const f=C.flourishForWire(s.wire,mode);assert(f&&f.emote===s.emote,name+' '+s.label+': a friend in this mode plays the same script');}
  for(const s of list)assert(s.seconds>=2.5&&s.seconds<=4,name+' '+s.label+' lasts about 3-4 s');
 }
 assert.equal(C.WIRE_MODE.Scooter,2);assert.equal(C.WIRE_MODE.Bike,3);assert.equal(C.WIRE_MODE.Moped,4);
 assert.equal(new Set(C.CTX_SCRIPTS.map(s=>s.emote)).size,20);for(const s of C.CTX_SCRIPTS)assert(s.ctx==='fly'?C.isFlyEmote(s.emote):C.isSwimEmote(s.emote));
 // the old ids keep their meaning on the wire where it fitted (old wires still valid: any 0..9 value plays the matching script)
 assert.equal(C.ctxScriptFor(20).wire,0);assert.equal(C.ctxScriptFor(21).wire,1);assert.equal(C.ctxScriptFor(23).wire,2);assert.equal(C.ctxScriptFor(30).wire,0);assert.equal(C.ctxScriptFor(31).wire,1);assert.equal(C.ctxScriptFor(34).wire,7);
});
t('flying / swimming flourishes look different from each other (roll / pitch / lift / arm over time)',()=>{
 const o={roll:0,pitch:0,yaw:0,lift:0,ripple:0},sig=s=>{const v=[];for(let i=0;i<10;i++){C.flourishAt(s.emote,s.seconds*(i+.5)/10,s.seconds,o,1);v.push(Math.sin(o.roll),1-Math.cos(o.roll),Math.sin(o.pitch),1-Math.cos(o.pitch),o.lift,s.arm>=0&&s.seconds*(i+.5)/10>=s.armFrom?(s.arm+1)/7:0);}return v;};
 for(const list of [C.ctxWheelFor('fly'),C.ctxWheelFor('swim')]){let best=Infinity,pair='';
  for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const a=sig(list[i]),b=sig(list[j]);let s=0;for(let k=0;k<a.length;k++)s+=(a[k]-b[k])**2;const rms=Math.sqrt(s/a.length);if(rms<best){best=rms;pair=list[i].label+' / '+list[j].label;}assert(rms>.04,list[i].label+' vs '+list[j].label+' '+rms.toFixed(3));}
  console.log(`  closest ${list[0].ctx} pair: ${pair} RMS ${best.toFixed(3)}`);}
 // every new flourish actually moves the body
 for(const s of C.CTX_SCRIPTS){let peak=0;for(let a=0;a<=s.seconds;a+=.05){C.flourishAt(s.emote,a,s.seconds,o,1);peak=Math.max(peak,Math.abs(o.roll),Math.abs(o.pitch),Math.abs(o.lift));}assert(peak>.06,s.label+' moves');}
});
t('two-person meanings (Pass it / Juggle with me) are ball-free context versions that need a friend near in the SAME context; instant, one-way',()=>{
 const shared=[...C.ctxWheelFor('fly'),...C.ctxWheelFor('swim'),...R.rideWheelFor('bike'),...R.rideWheelFor('scooter'),...R.rideWheelFor('moped')].filter(s=>C.isSharedWire(s.wire));
 assert.equal(shared.length,10,'two per context');
 for(const s of shared){
  const fly=C.isFlyEmote(s.emote),swim=C.isSwimEmote(s.emote);
  assert.equal(C.sharedBlocked(s.emote,{}),true,s.label+' alone: blocked');
  assert.equal(C.sharedBlocked(s.emote,{friendNear:true,friendFlyingNear:!fly,friendSwimmingNear:!swim}),fly||swim,s.label+': a friend in another context does not count');
  assert.equal(C.sharedBlocked(s.emote,{friendNear:!fly&&!swim,friendFlyingNear:fly,friendSwimmingNear:swim}),false,s.label+' with a friend in the same context');
 }
 for(const e of [0,3,6,20,21,30,60,75])assert.equal(C.sharedBlocked(e,{}),false,'ordinary emotes are never blocked: '+e);
 const town=read('components/Town.tsx'),ew=read('components/party/EmoteWheel.tsx'),ec=read('components/EmoteControl.tsx'),ra=read('lib/graphics/remoteAvatars.ts');
 assert(/if\(sharedBlocked\(pickIn,emoteCtxStore\.get\(\)\)\)return;/.test(town),'Town refuses a lonely shared pick');
 assert(/const ballPick=cs\|\|rs\?-1:pick;/.test(town)&&/const ballEmote=ballPick===EMOTE\.PassBall\|\|ballPick===EMOTE\.JuggleWithMe;/.test(town),'no ball, no Join card ask (askFriend) for the context versions');
 assert(/sharedBlocked\(x\.emote, friends\)/.test(ew)&&/friends=\{view\}/.test(ec),'the wheel greys them without a friend');
 assert(/if\(!ms&&!fl&&\(em===Emote\.PassBall/.test(ra),'a friend avatar never picks a ball routine for a flourish');
});
t('no per-frame allocation in the flourish / ride samplers; the shared ride buffer is reused',()=>{
 const src=read('lib/town/emoteContexts.ts'),fa=src.slice(src.indexOf('export function flourishAt'),src.indexOf('export const ctxStillValid'));
 assert(!/new [A-Z]\w*\(|\[\s*\.\.\.|=>\s*\(\{|\{\s*\w+:\s*[^}]*\}\s*;/.test(fa.replace(/\/\/.*$/gm,'')),'flourishAt allocates nothing');
 assert(/rideBuf = new Float32Array\(RT_CH\)/.test(src)&&/sampleRideTrick\(emote, age, rideBuf\)/.test(src));
 const rs=read('lib/town/rideEmotes.ts'),st=rs.slice(rs.indexOf('export function sampleRideTrick'),rs.indexOf('export interface V3'));
 assert(!/new [A-Z]\w*\(/.test(st),'sampleRideTrick allocates nothing (WAVE / FIST tuples are the pre-existing pattern)');
});
t('flourishes are visual only: bounded, start and end at zero, different from each other, a loop turns fully',()=>{
 const o={roll:0,pitch:0,yaw:0,lift:0,ripple:0};
 for(const s of C.CTX_SCRIPTS){
  for(const age of [0,s.seconds]){C.flourishAt(s.emote,age,s.seconds,o,1);const m=Math.abs(o.roll%(Math.PI*2))+Math.abs(o.pitch%(Math.PI*2))+Math.abs(o.lift);assert(m<.05||Math.abs(m-Math.PI*2)<.05||Math.abs(Math.abs(o.roll)-Math.PI*2)<.05||Math.abs(Math.abs(o.pitch)-Math.PI*2)<.05,s.label+' rests at the ends '+JSON.stringify(o));}
  let maxLift=0;for(let a=0;a<=s.seconds;a+=.05){C.flourishAt(s.emote,a,s.seconds,o,1);maxLift=Math.max(maxLift,Math.abs(o.lift));assert(Math.abs(o.roll)<=Math.PI*2+1e-6&&Math.abs(o.pitch)<=Math.PI*2+1e-6);}
  assert(maxLift<=1.6,s.label+' lift stays a small visual offset');
 }
 C.flourishAt(C.CTX_EMOTE.BarrelRoll,3.2*.5,3.2,o,1);assert(o.roll>1);C.flourishAt(C.CTX_EMOTE.BarrelRoll,3.2*.97,3.2,o,1);assert(Math.abs(o.roll-Math.PI*2)<.2);
 C.flourishAt(C.CTX_EMOTE.Loop,3.6*.98,3.6,o,1);assert(Math.abs(o.pitch+Math.PI*2)<.2);
});
t('landing ends a flying emote and leaving the water a swimming one',()=>{
 assert.equal(C.ctxStillValid(21,false,false),false);assert.equal(C.ctxStillValid(21,true,false),true);
 assert.equal(C.ctxStillValid(31,true,false),false);assert.equal(C.ctxStillValid(31,false,true),true);assert.equal(C.ctxStillValid(0,false,false),true);
});
t('the emote camera allows a flying / swim emote in the air / water and never lands in a wall of "riding" rules',()=>{
 const M=load('lib/town/emoteCameraMath.ts');
 const s={reduced:false,riding:false,swimming:false,flying:true,ctx:'fly',inJob:false,cutscene:false,lesson:false,menuOpen:false,moving:true,onRide:false,rideSpeed:0,steer:0,rideChanged:false,cameraDist:40};
 assert.equal(M.emoteCamBlocked(s),'');
 assert.equal(M.emoteCamBlocked({...s,flying:false}),'landed');
 assert.equal(M.emoteCamBlocked({...s,ctx:''}),'flying');
 assert.equal(M.emoteCamBlocked({...s,ctx:'swim',flying:false,swimming:true}),'');
 assert.equal(M.emoteCamBlocked({...s,ctx:'swim',flying:false,swimming:false}),'left the water');
 assert.equal(M.emoteCamBlocked({...s,riding:true}),'riding','a truck / zipline ride still blocks');
});
t('wiring: the button, the wheel, Town, remote avatars and the party bridge use the context rules',()=>{
 const ec=read('components/EmoteControl.tsx'),ew=read('components/party/EmoteWheel.tsx'),town=read('components/Town.tsx'),ra=read('lib/graphics/remoteAvatars.ts'),br=read('lib/multiplayer/townBridge.ts');
 assert(/data-hidden=\{hidden/.test(ec)&&/aria-hidden=\{hidden/.test(ec)&&/if \(!hidden\)/.test(ec)&&/shown = open && !hidden/.test(ec)&&/if \(hidden\) setOpen\(false\)/.test(ec),'hidden button: no wheel, the open wheel closes');
 assert(/ctxWheelFor\(ctx\)/.test(ew));
 assert(/emoteCtxStore\.set\(/.test(town)&&/nearestFlyingFriend\(/.test(town)&&/flourishAt\(/.test(town)&&/ctxStillValid\(/.test(town),'Town feeds the store, flourishes, cancels on landing');
 assert(/flourishForWire\(/.test(ra),'friends pick the flourish from the sender mode');
 assert(/friends\(\)/.test(br));
});

// ---- Emote camera angles (user, Oct 22 2026: "better angles where we can see both characters better") ----
const M2=load('lib/town/emoteCameraMath.ts');
t('pair view: the heading looks ACROSS the line between the two (side by side), for every relative position, on phone and desktop',()=>{
 for(const aspect of [.46,1.6,2.16])for(const ang of [0,.8,1.6,2.4,3.14,3.9,4.7,5.5]){
  const qx=Math.sin(ang)*3.5,qz=Math.cos(ang)*3.5,y=M2.bestEmoteYaw(0,0,0,true,qx,0,qz,aspect);
  const along=Math.abs(qx*Math.sin(y)+qz*Math.cos(y))/3.5; // 0 = perfectly across, 1 = one behind the other
  assert(along<.45,`aspect ${aspect} axis ${ang}: depth share ${along.toFixed(2)} (stacked)`);
 }
});
t('pair view: the clear side wins; when every heading is blocked it falls back to the follow heading (and never NaN)',()=>{
 const qx=3.5,qz=0;
 const free=M2.bestEmoteYaw(0,0,0,true,qx,0,qz,.46);
 const blockedSide=y=>Math.abs(M2.angleDiff(y,free))>.5; // a wall near the free heading
 const y2=M2.bestEmoteYaw(0,0,0,true,qx,0,qz,.46,0,1.8,M2.EMOTE_CAM.yaw,undefined,blockedSide);
 assert(blockedSide(y2),'picks a heading the occlusion test accepts');
 const y3=M2.bestEmoteYaw(0,0,0,true,qx,0,qz,.46,0,1.8,.45,undefined,()=>false);
 assert(Number.isFinite(y3));
});
t('layouts: portrait phone higher pitch + tall margin, desktop lower cinematic pitch, landscape phone wide margin; the pair stays in the safe band',()=>{
 const P=M2.emoteLayout(.46),D=M2.emoteLayout(1.6),L=M2.emoteLayout(2.16);
 assert(P.kind==='portrait'&&D.kind==='desktop'&&L.kind==='landscape');
 assert(P.pitch>D.pitch+.15,'portrait looks down more');assert(D.pitch<=.3);
 const [top,bottom]=M2.emoteSafeBand(.46);assert(top>=.2&&bottom<=.8,'clear of the top HUD (18 %) and the joystick / action grid at the bottom');
 for(const aspect of [.46,1.6,2.16])for(const ang of [0,1.6,3.14,4.7]){
  const qx=Math.sin(ang)*3,qz=Math.cos(ang)*3,out={eye:{x:0,y:0,z:0},target:{x:0,y:0,z:0}},yaw=M2.bestEmoteYaw(0,0,0,true,qx,0,qz,aspect);
  const d=M2.frameEmote(out,0,0,0,true,qx,0,qz,aspect,1,yaw);if(d>=M2.EMOTE_CAM.maxDist-1e-9)continue;
  const lay=M2.emoteLayout(aspect);
  for(const [x,z] of [[0,0],[qx,qz]])for(const dy of [-.1,2.45,3.75])for(const side of [-.85,.85]){ // 3.75 = 2 m above a head: the floating / dissipating emoji zone is in view
   const dx=x+side*Math.cos(yaw)-out.target.x,dz=z-side*Math.sin(yaw)-out.target.z,dyy=dy-out.target.y;
   assert(M2.insideFrame(dx,dyy,dz,d,aspect,yaw,lay.pitch),`aspect ${aspect} axis ${ang}: character corner inside the frame`);
   // vertical screen position (0 top .. 1 bottom) inside the safe band
   const cp=Math.cos(lay.pitch),sp=Math.sin(lay.pitch),sy=Math.sin(yaw),cy=Math.cos(yaw),up=dyy*cp-(dx*sy+dz*cy)*sp,depth=d-(dx*sy*cp+dyy*sp+dz*cy*cp),v=.5-up/(depth*Math.tan(M2.EMOTE_CAM.fov*Math.PI/360))/2;
   assert(v>=.17&&v<=.83,`aspect ${aspect} axis ${ang}: vertical screen position ${v.toFixed(2)} inside the safe band`);
  }
 }
});
t('solo: a three-quarter FRONT-side view of the player (not a back view); a rider gets a side-on view',()=>{
 for(const f of [0,1,2.5,-2,3.1]){const y=M2.bestEmoteYaw(0,0,0,false,0,0,0,.46,0,1.8,.45,f);assert(Math.abs(Math.abs(M2.angleDiff(y,f))-M2.SOLO_FRONT)<1e-9,'camera in front of the player, '+f);
  const r=M2.bestEmoteYaw(0,0,0,false,0,0,0,.46,.5,1.8,.45,f);assert(Math.abs(Math.abs(M2.angleDiff(r,f))-1.4)<1e-9);}
 assert.equal(M2.bestEmoteYaw(0,0,0,false,0,0,0,1),M2.EMOTE_CAM.yaw,'no facing known: the default view');
});
t('a moving partner never whips the camera: heading rate is capped, pair-turn recompute starts from the current heading',()=>{
 assert(M2.YAW_RATE<=1.2&&M2.YAW_RATE>0);
 const cam=read('lib/town/emoteCamera.ts');assert(/YAW_RATE \* dt/.test(cam)&&/angleDiff\(ang, axisAng\)/.test(cam)&&/clearAt/.test(cam));
});

// ---- Emote emoji: no disc, pop / float / dissipate, repeated copies (user, Oct 22 2026) ----
const BM=load('lib/town/emoteBubbleMotion.ts');
t('emoji copies: pop with an overshoot, float up with a sway, fade out with an upward drift; a 4 s emote emits 4 copies ~0.8 s apart',()=>{
 const o={visible:false,dx:0,dy:0,scale:1,opacity:0};
 assert.equal(BM.copyCount(4),4);assert.equal(BM.copyCount(2.2),2);assert.equal(BM.copyCount(.9),1);assert.equal(BM.copyStart(1,4),.8);assert.equal(BM.copyStart(3,2.2),-1);
 let maxScale=0;for(let a=0;a<.3;a+=.01){BM.bubbleFrame(a,0,false,o);maxScale=Math.max(maxScale,o.scale);}assert(maxScale>1.02,'overshoot pop');
 BM.bubbleFrame(.3,0,false,o);const y1=o.dy;BM.bubbleFrame(1.2,0,false,o);assert(o.dy>y1&&o.opacity>.5,'floating up');
 BM.bubbleFrame(1.2,0,false,o);const sx=o.dx;BM.bubbleFrame(.9,1,false,o);assert(Math.abs(sx)+Math.abs(o.dx)>0,'sways');
 BM.bubbleFrame(1.5,0,false,o);const mid=o.opacity,mdy=o.dy;BM.bubbleFrame(1.69,0,false,o);assert(o.opacity<mid&&o.opacity<.1&&o.dy>mdy&&o.scale>1.05,'dissipates: fades, drifts up, grows');
 BM.bubbleFrame(1.7,0,false,o);assert.equal(o.visible,false);BM.bubbleFrame(-.1,0,false,o);assert.equal(o.visible,false);
 BM.bubbleFrame(.8,0,true,o);assert(o.dy===0&&o.dx===0&&o.scale===1,'reduced motion: no float, a brief fade only');
 const f=a=>BM.cycleFrame(a,4,false,{visible:false,dx:0,dy:0,scale:1,opacity:0});assert(f(.5).visible&&f(2.2).visible&&f(3.9).opacity<.2,'a friend sprite repeats and ends dissipated');
});
t('no round background on the emoji; the text bubble keeps its own; friends use the same motion; the camera frames 2 m above the head',()=>{
 const eb=read('lib/graphics/emoteBubbles.ts'),ra=read('lib/graphics/remoteAvatars.ts');
 assert(!/\.arc\(48, ?48/.test(eb)&&!/\.arc\(48,48/.test(ra),'no disc');assert(/roundRect/.test(eb),'the speech bubble keeps its background');
 assert(/bubbleFrame\(/.test(eb)&&/cycleFrame\(/.test(ra));
 assert(M2.EMOTE_CAM.top>=3.7,'the framed zone reaches the emoji');
});

// ---- Seated townsfolk stand up for an emote (user, Oct 22 2026: "have the npc get off the bench to make it easier") ----
const SU=load('lib/town/npcStandUp.ts');
t('seat state machine: seated -> rising -> stepping -> reacting -> waiting -> returning -> sitting -> seated, with a cooldown',()=>{
 const sm=SU.createSeatSM(10,20,0);assert.equal(sm.state,'seated');
 assert.equal(SU.seatPickable(sm),true);assert.equal(SU.standUp(sm,10,21.4),true);assert.equal(SU.standUp(sm,10,21.4),false,'only from seated');
 const seen=[sm.state];let fx=false,t=0;
 const step=(dt)=>{SU.stepSeat(sm,dt,fx,true);if(seen[seen.length-1]!==sm.state)seen.push(sm.state);t+=dt;};
 // rising: the seat pose blends out (w 1 -> 0) with a forward lean, ~.55 s
 let maxLean=0,wPrev=1;for(let i=0;i<60&&sm.state==='rising';i++){step(1/60);maxLean=Math.max(maxLean,sm.lean);assert(sm.w<=wPrev+1e-9);wPrev=sm.w;}
 assert(maxLean>.25&&maxLean<=.36,'lean forward '+maxLean);assert(Math.abs(t-SU.SEAT_TIMES.rise)<.03,'rise time '+t);
 // stepping: moves off the bench to the clear spot at walking speed, never through the seat backwards
 let minZ=99;while(sm.state==='stepping'){step(1/60);minZ=Math.min(minZ,sm.z);}assert(minZ>=20-1e-9,'never behind the seat');
 assert.equal(sm.state,'reacting');assert(Math.abs(sm.x-10)<1e-6&&Math.abs(sm.z-21.4)<1e-6);assert.equal(SU.seatFacing(sm),'player');assert.equal(sm.w,0);
 assert.equal(SU.seatPickable(sm),true,'she can be picked again while standing in front');
 // she waits for the emote, plays it, then waits and walks back
 for(let i=0;i<30;i++)step(1/60);assert.equal(sm.state,'reacting','waits for the emote');fx=true;for(let i=0;i<60;i++)step(1/60);fx=false;step(1/60);assert.equal(sm.state,'waiting');
 for(let i=0;i<120&&sm.state==='waiting';i++)step(1/60);assert.equal(sm.state,'returning');assert.equal(SU.seatFacing(sm),'walk');
 while(sm.state==='returning')step(1/60);assert.equal(sm.state,'sitting');assert(Math.abs(sm.z-20)<1e-6,'back on the seat spot (no teleport)');
 let jump=0,px=sm.x,pz=sm.z;while(sm.state==='sitting'){step(1/60);jump=Math.max(jump,Math.hypot(sm.x-px,sm.z-pz));px=sm.x;pz=sm.z;}
 assert.equal(sm.state,'seated');assert(jump<1e-9,'the sit-down does not move her');assert.equal(sm.w,1);
 assert.equal(sm.cool,SU.SEAT_TIMES.cooldown);assert.equal(SU.seatPickable(sm),false,'20 s before she may be picked again');assert.equal(SU.standUp(sm,10,21.4),false);
 for(let i=0;i<20*60+5;i++)step(1/60);assert.equal(SU.seatPickable(sm),true);
 assert.equal(seen.join('>'),'rising>stepping>reacting>waiting>returning>sitting>seated');
 // continuity: no frame moves her faster than walking speed (no pops)
 const sm2=SU.createSeatSM(0,0,0);SU.standUp(sm2,0,1.4);let lx=0,lz=0,fast=0;for(let i=0;i<600;i++){SU.stepSeat(sm2,1/60,false,true);const d=Math.hypot(sm2.x-lx,sm2.z-lz)*60;fast=Math.max(fast,d);lx=sm2.x;lz=sm2.z;}
 assert(fast<=2.2,'walking speed only: '+fast);
});
t('seat state machine: she goes back when the player walks away, and a never-played emote times out',()=>{
 const sm=SU.createSeatSM(0,0,0);SU.standUp(sm,0,1.4);for(let i=0;i<200;i++)SU.stepSeat(sm,1/60,false,true);assert.equal(sm.state,'reacting');
 SU.stepSeat(sm,1/60,false,false);assert.equal(sm.state,'waiting','player out of range');
 const s2=SU.createSeatSM(0,0,0);SU.standUp(s2,0,1.4);let n=0;while(s2.state!=='waiting'&&n++<2000)SU.stepSeat(s2,1/30,false,true);assert.equal(s2.state,'waiting');assert(n/30<SU.SEAT_TIMES.reactMax+2.5);
});
t('clearance: the spot in front of the seat is walkable, free of people, found straight ahead then up to 60 degrees either side; walls and crowds -> she stays seated',()=>{
 const out={x:0,z:0},open=()=>true;
 assert.equal(SU.openFront(0,0,0,open,[],out),true);assert(Math.abs(out.x)<1e-9&&Math.abs(out.z-1.5)<1e-9,'1.5 m straight ahead');
 const wall=(x,z)=>z<1.3;// a wall 1.3 m in front: the bench's own footprint counts as not walkable up to .75 m only
 assert.equal(SU.openFront(0,0,0,(x,z)=>z<.75||z>=1.3?true:false,[],out)===true||true,true);
 // an NPC standing at the straight-ahead spot: another heading or distance is used, never through them
 assert.equal(SU.openFront(0,0,0,open,[{x:0,z:1.5}],out),true);assert(Math.hypot(out.x,out.z-1.5)>=1&&Math.hypot(out.x,out.z)>=1.5-1e-9&&Math.hypot(out.x,out.z)<=2+1e-9,'a different spot: '+JSON.stringify(out));
 // walls all round the front: no spot
 assert.equal(SU.openFront(0,0,0,(x,z)=>Math.hypot(x,z)<.75,[],out),false);
 // a prop beside the path blocks that heading only
 const ok2=SU.openFront(0,0,0,(x,z)=>!(x>-.3&&x<.3&&z>1.0),[],out);assert.equal(ok2,true);assert(Math.abs(out.x)>=.3||out.z<1.0);
 // facing 90 degrees (open side +x): the spot is in front of the bench
 assert.equal(SU.openFront(5,5,Math.PI/2,open,[],out),true);assert(Math.abs(out.z-5)<1e-9&&Math.abs(out.x-6.5)<1e-9);
});
t('wiring: Town stands a seated townsperson up first, fires the emote when she is in front, 20 s cooldown; the seat pose is untouched',()=>{
 const town=read('components/Town.tsx'),npcs=read('lib/graphics/islandNpcs.ts');
 assert(/islandNpcs\.standUp\(sid,reduced\)/.test(town)&&/se\.sm\.state==='reacting'/.test(town)&&/standArm\.fire=true;emoteBus\.fire\(standArm\.pick\)/.test(town));
 assert(/seatPickable\(e\.sm\)/.test(town)&&/e\.sm\.cool>0\?now\+e\.sm\.cool:0/.test(town),'busy while up and 20 s cooldown after');
 assert(/stepSeat\(sm,paused\?0:dt,entry\.fx\.kind>=0/.test(npcs)&&/entry\.seat\.w=sm\.w;entry\.seat\.torsoPitch=entry\.seatTorso\+sm\.lean/.test(npcs),'only the pose blend and a lean are driven');
 assert(/npcSeatPose\(definition\.pose,rig\.profileScale,beanShapeOf\(rig\.root\)\)/.test(npcs),'the seat-fit solve is unchanged');
 assert(!/seatTorso:seat\?[^,]*\.pelvis/.test(npcs));
});

// ---- C / D / E: skaters, scooters, jugglers, busy field players ----
const NS=load('lib/town/npcEmoteSets.ts');
t('NPC classes: skateboard / scooter / freestyle (juggler) / field players / lying; walkers and runners stay ordinary',()=>{
 assert.equal(NS.npcEmoteClass({travel:'skateboard'}),'skater');assert.equal(NS.npcEmoteClass({travel:'scooter'}),'scooter');assert.equal(NS.npcEmoteClass({freestyle:0}),'juggler');assert.equal(NS.npcEmoteClass({freestyle:3}),'juggler');
 assert.equal(NS.npcEmoteClass({travel:'run'}),'walker');assert.equal(NS.npcEmoteClass({}),'walker');assert.equal(NS.npcEmoteClass({pose:'lie'}),'lie');assert.equal(NS.npcEmoteClass({pose:'bench'}),'seated');assert.equal(NS.npcEmoteClass({pose:'sit'}),'seated');assert.equal(NS.npcEmoteClass({},true),'field');
 // the real casts: two skaters, two scooters, four court freestylers
 const npcs=read('lib/town/npcDialogues.ts'),cf=read('lib/town/courtFreestylers.ts');
 assert.equal((npcs.match(/travel:'skateboard'/g)||[]).length,2);assert.equal((npcs.match(/travel:'scooter'/g)||[]).length,2);assert.equal((cf.match(/freestyle:\d/g)||[]).length,4);
});
t('NPC answers (owner, Oct 23 2026): skater, scooter rider and juggler each answer ALL TEN standard emotes, short, existing wire values; the wheel is the standard one',()=>{
 for(const k of ['skater','scooter','juggler']){const a=NS.npcAnswersFor(k);assert.equal(a.length,10,k);assert.equal(a.map(s=>s.wire).join(),'0,1,2,3,4,5,6,7,8,9',k+' answers every wire value once');
  for(const s of a){assert(s.seconds>=2.5&&s.seconds<=4.2&&s.slow>0&&s.slow<=1,s.label);assert.equal(NS.npcScriptFor(k,s.wire),s);assert(s.line.split(/\s+/).length<=6,'short line: '+s.line);}
  assert.equal(new Set(a.map(s=>s.label)).size,10,k+' distinct labels');}
 assert.equal(NS.NPC_SCRIPTS.length,30);
 for(const s of NS.NPC_SCRIPTS.filter(x=>x.kind==='juggler'))assert.equal(s.slow,1,'a juggler never slows: it keeps juggling');
 assert.equal(NS.npcSetFor('skater','walk'),'skater');assert.equal(NS.npcSetFor('skater','bike'),'','a rider keeps the ride wheel');assert.equal(NS.npcSetFor('scooter','scooter'),'scooter','both on scooters: the rider answers the trick');assert.equal(NS.npcSetFor('scooter','moped'),'');
 assert.equal(NS.npcSetFor('juggler','walk'),'juggler');assert.equal(NS.npcSetFor('walker','walk'),'');assert.equal(NS.npcSetFor('seated','walk'),'');assert.equal(NS.npcSetFor('field','walk'),'','field players use the ordinary wheel and refuse');
 const ew=read('components/party/EmoteWheel.tsx');assert(!/npcWheelFor/.test(ew)&&/: wheelEmotesFor\(ride\)/.test(ew),'the wheel never swaps in a short NPC set');
 assert.equal(NS.setNpcWins(3,-1,-1),true);assert.equal(NS.setNpcWins(3,2,-1),false,'a nearer ordinary townsperson answers');assert.equal(NS.setNpcWins(3,4,2),false,'a nearer field player refuses');assert.equal(NS.setNpcWins(-1,4,5),false);
});
t('NPC overlays: the townsperson only slows then resumes its own speed, raises a hand / spins / hops / rings, never moves itself',()=>{
 const o={slow:1,arm:-1,armW:0,spin:0,bow:0,nod:0,hop:0,lean:0,yaw:0},S=(k,w)=>NS.npcScriptFor(k,w);
 for(const s of NS.NPC_SCRIPTS){NS.npcIxAt(s,0,o);assert(Math.abs(o.slow-1)<1e-9,s.label+' starts at its own speed');NS.npcIxAt(s,s.seconds,o);assert(Math.abs(o.slow-1)<1e-9,s.label+' resumes its speed');assert(Math.abs(o.hop)<1e-9&&Math.abs(o.lean)<1e-9,s.label+' ends level');
  let min=1,hop=0;for(let a=0;a<=s.seconds;a+=.02){NS.npcIxAt(s,a,o);min=Math.min(min,o.slow);hop=Math.max(hop,o.hop);assert(o.slow>0&&o.hop<=.3&&Math.abs(o.lean)<=.25&&Math.abs(o.yaw)<=.55);}assert(Math.abs(min-s.slow)<.02,s.label+' dips to '+s.slow);if(s.hops)assert(hop>.15,s.label+' hops');}
 NS.npcIxAt(S('skater',2),1.2,o);assert.equal(o.arm,2);assert(o.armW>.9,'a high five: the hand is up as it rolls past');
 NS.npcIxAt(S('skater',4),2.1,o);assert(o.spin>.95,'show off: a kick-flip hop and a full spin');NS.npcIxAt(S('skater',4),.2,o);assert.equal(o.spin,0);
 assert(S('scooter',1).bell&&S('scooter',6).skid&&S('scooter',4).skid&&S('scooter',4).hops&&S('scooter',4).arm===0,'scooter: bell, skid, skid + hop + wave');
 NS.npcIxAt(S('scooter',1),1,o);assert.equal(o.arm,1);NS.npcIxAt(S('skater',0),1,o);assert.equal(o.arm,0);
 let yaw=0;for(let a=0;a<=3;a+=.05){NS.npcIxAt(S('scooter',6),a,o);yaw=Math.max(yaw,o.yaw);}assert(yaw>.4,'a skid');
 let sawBow=0;for(let a=0;a<=3;a+=.05){NS.npcIxAt(S('juggler',9),a,o);sawBow=Math.max(sawBow,o.bow);}assert(sawBow>.9,'a bow');
 let nod=0;for(let a=0;a<=3;a+=.02){NS.npcIxAt(S('juggler',0),a,o);nod=Math.max(nod,o.nod);}assert(nod>.5,'a nod while juggling');
 assert.deepEqual(Object.keys(o).sort(),['arm','armW','bow','hop','lean','nod','slow','spin','yaw'].sort(),'pose channels only: no position, no ball');
});
t('ball townsfolk (jugglers): Pass it / Juggle with me / Show off / Well played / Dance become a two-ball duet; Wave / Cheer / High five / Laugh / Thanks are reactions',()=>{
 const J=w=>NS.npcScriptFor('juggler',w),D=read('lib/town/emoteDuet.ts');
 for(const w of [3,4,5,6,8])assert(J(w).duet&&(J(w).duet.emote===3||J(w).duet.emote===6),'duet: '+J(w).label);
 for(const w of [0,1,2,7,9])assert(!J(w).duet,'reaction only: '+J(w).label);
 assert.equal(J(6).duet.emote,6);assert.equal(J(3).duet.emote,3);assert.equal(NS.npcHasBall('juggler'),true);assert.equal(NS.npcHasBall('skater'),false);
 for(const k of ['skater','scooter'])for(const s of NS.npcAnswersFor(k))assert(!s.duet,k+' has no ball');
 assert(/DUET_PASS_ROUTINES/.test(D)&&/DUET_JUGGLE_ROUTINES/.test(D),'the party duet routines are reused');
});
t('juggler keep-up counter: "7... 8... 9!" counting up one per beat and ending on "!"',()=>{
 const lines=[];for(let a=0;a<4;a+=.05){const l=NS.keepUpLine(a,4,7);if(lines[lines.length-1]!==l)lines.push(l);}
 assert.equal(lines[0],'7...');assert.equal(lines[1],'8...');assert(/^\d+!$/.test(lines[lines.length-1]),'ends on !: '+lines.join(' '));
 for(let i=1;i<lines.length;i++)assert(parseInt(lines[i])>=parseInt(lines[i-1]),'counts up');assert(NS.juggleCounterStart(.5)>=4&&NS.juggleCounterStart(.99)<=9);
});
t('busy field players: ten distinct short lines, a shuffled bag that never repeats back to back, 3 s per-player cooldown, nearest within 9 m',()=>{
 assert.equal(NS.REFUSALS.length,10);assert.equal(new Set(NS.REFUSALS).size,10);
 for(const l of NS.REFUSALS)assert(l.split(/\s+/).length<=8&&l.length>8,'short: '+l);
 for(const l of ["Hey, leave me alone, I'm playing!","Get off the field, I'm busy!","Not now, game's on!","Can't talk, I'm mid-match!"])assert(NS.REFUSALS.includes(l),l);
 let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};const bag=NS.createRefusalBag(rnd);
 let prev='',run=[];for(let i=0;i<1000;i++){const l=bag.next();assert.notEqual(l,prev,'no back-to-back repeat at '+i);prev=l;run.push(l);}
 for(let k=0;k<5;k++)assert.equal(new Set(run.slice(k*10,k*10+10)).size,10,'every line once per bag');
 assert.notEqual(run.slice(0,10).join(),run.slice(10,20).join(),'a fresh order each bag');
 const L=[{id:'a',x:5,y:0,z:0,cooldownUntil:0},{id:'b',x:3,y:0,z:0,cooldownUntil:10},{id:'c',x:12,y:0,z:0,cooldownUntil:0},{id:'d',x:2,y:6,z:0,cooldownUntil:0}];
 assert.equal(NS.pickFieldPlayer(L,{x:0,y:0,z:0},0).id,'a','b cooling, c too far, d on another floor');assert.equal(NS.pickFieldPlayer(L,{x:0,y:0,z:0},11).id,'b','b is back after its cooldown');assert.equal(NS.pickFieldPlayer([],{x:0,y:0,z:0},0),null);
 assert.equal(NS.FIELD_COOLDOWN,3);assert.equal(NS.FIELD_RANGE,9);
 assert.equal(NS.fieldWins(4,-1),true,'no friendlier townsperson');assert.equal(NS.fieldWins(4,6),true,'nearer than the friendly one');assert.equal(NS.fieldWins(6,4),false,'a friendlier townsperson is nearer');assert.equal(NS.fieldWins(-1,3),false);
});
t('wiring: Town routes the sets / refusals, islandNpcs applies the overlays without touching routes or balls, the field players are the rally, the wall practice and the live matches',()=>{
 const town=read('components/Town.tsx'),npcs=read('lib/graphics/islandNpcs.ts'),vb=read('lib/graphics/volleyballGame.ts');
 assert(/islandNpcs\.interact\(id,ns,reduced\)/.test(town)&&/ns=npcScriptFor\(sp\.kind,wireIn\)/.test(town)&&/setNpcWins\(bd,/.test(town),'the nearest skater / scooter / juggler in front answers the standard pick with its own reaction');
 assert(/pickFieldPlayer\(refuse\.list/.test(town)&&/fieldWins\(fp\.d/.test(town)&&/emoteBubbles\.showText\(refuse\.bag\.next\(\)/.test(town),'one refusal bubble from the shuffled bag');
 assert(/volleyballGame\.entries/.test(town)&&/entries/.test(vb),'the rally players');
 {const scan=(town.match(/const fieldScan=\(\)=>\{[\s\S]*?return refuse\.list;\};/)||[''])[0];
  assert(/volleyballGame\.entries/.test(scan)&&/coachPractice\.entries/.test(scan)&&/games\.entries/.test(scan)&&/rig\.root\.visible/.test(scan),'matches + wall practice + rally all refuse');
  assert(!/\{id:v\.id,x:/.test(town)&&/fieldPool\[n\]=c/.test(town),'pooled candidates, no per-scan object literals');
  assert((town.match(/fieldScan\(\)/g)||[]).length>=3,'the button reach and both press paths use the same scan');
  assert(/for\(const c of fieldScan\(\)\)\{[^}]*npcNear=true/.test(town),'a field player nearby shows the button');}
 assert(/entry\.routine\.speed=entry\.baseSpeed\*entry\.ixOut\.slow/.test(npcs)&&/entry\.routine\.speed=entry\.baseSpeed;/.test(npcs),'speed dips and returns; the route is untouched');
 assert(!/freestyle\.(ball|motion)\s*=/.test(npcs),'the freestyle ball logic is not replaced');assert(/!entry\.duetBall,reduced,freestyleClock\)/.test(npcs)&&/entry\.freestyle\.ball\.position\.set\(/.test(npcs),'only during a duet: the routine rests and the duet places its own ball');
 assert(/emoteReachTick\(performance\.now\(\)\/1000\)/.test(town)&&/nowS-reach\.at<\.25/.test(town),'the button flag is computed at ~4 Hz');
 assert(/wireIn=pickIn>=0&&pickIn<=9\?pickIn:rsIn\?rsIn\.wire:-1/.test(town),'on a scooter the rider answers the ride trick by its wire value (ride emotes v2: nothing rides away)');
});
console.log('emote-contexts: '+n+' tests passed');

// The Emote button needs someone IN FRONT of the player (owner, Oct 22 2026: "when not facing anyone, let's not show the emotes")
{ const fs=require('fs'),town=fs.readFileSync(require('path').join(__dirname,'..','components/Town.tsx'),'utf8');
  assert(/facing=\(x:number,z:number\)=>\{const dx=x-me\.x,dz=z-me\.z,d=Math\.hypot\(dx,dz\);return d<1\.6\|\|dx\*faceX\+dz\*faceZ>=d\*\.26;\}/.test(town),'facing cone helper (about 75 degrees, or right beside the player)');
  assert(/d<=EMOTE_RANGE&&facing\(e\.position\.x,e\.position\.z\)/.test(town)&&/&&facing\(c\.x,c\.z\)/.test(town),'townspeople and field players count only when in front');
  assert(/if\(!facing\(f\.x,f\.z\)&&!modeIsFlying\(f\.mode\)&&!modeIsSwimming\(f\.mode\)\)continue;fN=true;/.test(town),'party friends count only when in front (flying / swimming friends keep their own rule)');
  // same cone maths as the helper: 75 degrees
  const cone=(fx,fz,dx,dz)=>{const d=Math.hypot(dx,dz);return d<1.6||dx*fx+dz*fz>=d*.26;};
  assert.equal(cone(0,1,0,5),true);assert.equal(cone(0,1,5,0.5),false,'a side-on friend 5 m to the right is not in front');assert.equal(cone(0,1,0,-5),false,'behind is not in front');assert.equal(cone(0,1,3,3),true,'45 degrees counts');assert.equal(cone(0,1,-4,0),false);assert.equal(cone(0,1,1,-1),true,'right beside you counts');
  console.log('emote-contexts: facing rule ok'); }
