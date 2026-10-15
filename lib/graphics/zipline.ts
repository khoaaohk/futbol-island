/**
 * The zipline runtime (Oct 14 2026; rules and positions: lib/town/zipline.ts; static props: lib/town/ziplineWorld.ts; HUD:
 * components/ZiplineHud.tsx, and the three ride actions in Town's action cluster). Summit Isle's lookout → the Coral Cay Hostel
 * roof, one way, free (it is gravity: no fuel).
 *
 *  - The prompt: "Ride the zipline" by the launch tower (on foot, or on a scooter, bike or moped: the tap hops you off first, the
 *    fruit trees' way), through the HUD arbiter like every proximity prompt. E works too.
 *  - The ride, on Town's fixed 60 Hz tick (holdPlayer): clip on (a hop onto the launch spot, arms up to the handle), the ride along
 *    the sagging cable on a fixed speed profile (ZIP_RIDE.seconds whatever the frame rate), the landing (legs reach for the deck,
 *    feet down, let go). The stick only turns the camera (and the rider's head) to look around.
 *  - The grip (user, after riding it: "the arms are not on the handle"): the handle bar hangs from the trolley on a short strap and
 *    the BODY is placed from the bar: the bar's point in the rider's own frame (ZIP_GRIP) is put exactly on the drawn bar, and
 *    player.ts solves both arms onto it (two-bone, in the chest's frame), so both mittens close round the bar at the same two
 *    points every frame, whatever the swing, the spin or the body's motion.
 *  - The body moves with the ride (user: "the body needs to animate with the movements more"), all from the tick's physics:
 *    a pendulum about the trolley swung by the push and the brake; a sideways pendulum swung by gusts that grow with speed; a
 *    little bounce of the strap over the cable's sag (the vertical acceleration through a damped spring) and a cable buzz at
 *    speed; legs kicking/cycling off the tower, trailing the swing, tucking at top speed and stretching out to reach the deck;
 *    a lean back at the launch; the torso twisting against the sway; the head looking ahead and down at the water (and where the
 *    stick looks).
 *  - Three ride actions take the HUD's Kick / Juggle / Ride slots while riding (user: "remove the actions and change those to
 *    three different actions that are more related to the zipline"): Tuck (hold: knees up, up to 14 % faster before the brake,
 *    never above 30 m/s, extra speed lines and wind), Spin (a 360° turn on the swivel, a whoosh) and Wave (one hand lets go and
 *    waves; the other never leaves the bar). Space / Q / E, or 1 / 2 / 3. None can stop, slow or move the ride or its landing.
 *  - The camera follows from behind and a little to the east (the follow camera's side), looking down the cable over the sea to
 *    Coral Cay; it is a pure function of the drawn ride (interpolated between ticks like the player) plus an eased look offset, so
 *    it is smooth at any frame rate; it blends in from and back out to the follow camera.
 *  - The tab hiding (or the page going away) mid-ride finishes the ride at once on the roof deck: never stuck in the air.
 * Reduced motion: a calm camera, a damped swing (half), no sideways sway or cable buzz, a half bounce, gentler legs, a slower spin,
 * a third of the speed lines, no hop.
 *
 * Heat: nothing at rest. Off Summit Isle update() is one box test; near the tower a distance. The trolley (a few small meshes) and
 * the speed lines (ONE instanced mesh, one draw call) are built when a ride starts and disposed when it ends; the ride's maths runs
 * only while riding, on preallocated typed arrays and vectors (no allocation per tick or frame); no timers, no rAF, one keydown and
 * one visibilitychange listener.
 */
import * as T from 'three';
import {ZIP_RIDE,ZIP_LAUNCH,ZIP_LAND,ZIP_DECK,ZIP_DIR,ZIP_TOP_SPEED,ZIP_NOTES,ZIP_GRIP,ZIP_STRAP,ZIP_TROLLEY_DROP,ZIP_TUCK,ZIP_SPIN,ZIP_WAVE,
 towerReach,nearTower,zipStore,zipActions,cableInto,cableGrade,rideProgress,rideSpeed,tuckRate,zipKeyAction,
 type ZipActionId,type ZipRigPose,type ZipPoint} from '../town/zipline';
import {countZiplineRide} from '../analytics/summitEvents';

type Ports={
 /** Put the player's feet at (x, y, z) this tick (location and the rooftop height; velocity 0). */
 place:(x:number,z:number,y:number)=>void;
 /** The ride is over: stand on the roof deck at (x, z) (the rooftop reset finds the deck's height), the ball at the feet. */
 land:(x:number,z:number,yaw:number)=>void;
 /** Off a scooter, bike or moped (the usual switch to walking): true when it happened. */
 dismount:()=>boolean;
 /** Where the player's feet are now (the clip-on starts there; a map trip mid-ride is noticed). */
 where:()=>{x:number;z:number;y:number};
 /** Touchdown on the deck: the host's landing dust and thud. */
 touchdown?:(x:number,y:number,z:number)=>void;
 /** A whoosh (Town: sound.boost('forward')): the launch, at speed, a tuck. */
 whoosh?:()=>void;
 /** The spin's swish (Town: sound.boost('up')); the whoosh when absent. */
 swish?:()=>void;
 haptic?:()=>void;
 /** Something else holds the player (a job, a kick round, a pose): no ride now. */
 busy?:()=>boolean;
};
export type ZiplineUpdate={
 x:number;z:number;
 /** On foot on the ground; or on a ground ride ('ride'), which hops off first. */
 onFoot:boolean;onRide:boolean;canEnter:boolean;reduced:boolean;
 camera:T.Camera;width:number;height:number;
 focusKey:string|null;
 ui:<E extends HTMLElement>(selector:string)=>E|null|undefined;place:(el:HTMLElement,x:number,y:number)=>void;hide:(el:HTMLElement,hidden:boolean)=>void;
};
type Phase='idle'|'arriving'|'clip'|'ride'|'land';
/** A tick's drawn state, as one flat typed array (interpolated between the last two ticks when drawn; copied, never allocated). */
const F={X:0,Y:1,Z:2,PX:3,PY:4,PZ:5,SWING:6,ROLL:7,YAW:8,SPEED:9,SPIN:10,BOUNCE:11,W:12,DROP:13,SX:14,SY:15,SZ:16,BARY:17,BARZ:18,WAVE:19,WPH:20,PELY:21,PELZ:22,TX:23,TY:24,TZ:25,HX:26,HY:27,SPREAD:28,HIPL:29,HIPR:30,KNL:31,KNR:32,ANL:33,ANR:34,TUCK:35,N:36} as const;
const G=9.8,PENDULUM=1.5,ARRIVAL_WAIT=4;
const LINES=28,LINES_TUCK=44;
const lerp=(a:number,b:number,k:number)=>a+(b-a)*k;
const smooth=(k:number)=>{const t=Math.max(0,Math.min(1,k));return t*t*(3-2*t);};
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
/** Exponential approach, frame-rate independent. */
const ease=(v:number,to:number,rate:number,dt:number)=>v+(to-v)*(1-Math.exp(-rate*dt));

export function createZipline(scene:T.Scene,ports:Ports){
 let phase:Phase='idle',age=0,rideT=0,reduced=false;
 /** Clip-on start (feet), the last placed location (a map trip mid-ride ends it). */
 const from={x:0,y:0,z:0},placed={x:0,z:0};
 /** The tick's physics: the fore-aft swing and the sideways sway (angle, rate), the strap's bounce, the last speeds. */
 let swing=0,swingV=0,roll=0,rollV=0,bounce=0,bounceV=0,prevSpeed=0,prevVy=0,whooshAt=0,landed=false,fresh=true;
 /** The actions: tuck held, its eased amount and the time rate it gives; the spin's and the wave's clocks (−1 = none). */
 let tuckHeld=false,tuckW=0,rate=1,tuckWhooshAt=-9,spinT=-1,spinDur:number=ZIP_SPIN.seconds,waveT=-1,cyclePhase=0;
 const prev=new Float64Array(F.N),cur=new Float64Array(F.N),draw=new Float64Array(F.N);
 /** The drawn ride for the camera and tests (named fields; filled from `draw`). */
 const drawn={x:0,y:0,z:0,px:0,py:0,pz:0,swing:0,roll:0,yaw:0,speed:0,spin:0,tuck:0,wave:0};
 /** The rider's pose for player.ts (filled in place each frame). */
 const rig:ZipRigPose={w:0,barY:ZIP_GRIP.y,barZ:ZIP_GRIP.z,half:ZIP_GRIP.half,free:1,wave:0,wavePhase:0,py:.94,pz:0,pike:0,tx:0,ty:0,tz:0,hx:0,hy:0,spread:0,
  hipL:0,hipR:0,kneeL:0,kneeR:0,ankleL:0,ankleR:0};
 /** Camera blend (0 = Town's follow camera, 1 = the ride camera) and the eased look-around offset (radians). */
 let blend=0,look=0,lookWant=0,camActive=false;
 const stats={rides:0,busyTicks:0,spins:0,waves:0,tucks:0,get phase(){return phase;},get blend(){return blend;},get rate(){return rate;}};
 // ---- the ride's meshes (built at the launch, disposed after)
 let root:T.Group|null=null,lines:T.InstancedMesh|null=null,trolley:T.Group|null=null,handle:T.Group|null=null,straps:T.Mesh[]=[];const geos:T.BufferGeometry[]=[],mats:T.Material[]=[];
 const linePos:{a:number;r:number;along:number}[]=[];
 /** A streak's place round the cable: beside and above the rider (never in the strip under their feet or down the camera's line
  *  of sight), from just behind them (3 m: they vanish before reaching the camera) to 36 m ahead. */
 const streak=(l:{a:number;r:number;along:number},along:number)=>{l.a=-.45+Math.random()*(Math.PI+.9);l.r=2+Math.random()*4.5;l.along=along;return l;};
 function build(){
  dispose3d();root=new T.Group();root.name='zipline-ride';
  // The trolley: a steel body on the cable and an orange pulley pair. The handle (a separate group, placed from the body's swing):
  // an orange T-bar with two dark grip sleeves where the hands close, hung from the trolley's underside by a V of webbing.
  trolley=new T.Group();trolley.name='zipline-trolley';
  const steel=new T.MeshStandardMaterial({color:'#4c5652',roughness:.6,metalness:.3}),orange=new T.MeshStandardMaterial({color:'#ef7d3c',roughness:.7}),strap=new T.MeshStandardMaterial({color:'#294f43',roughness:.9}),grip=new T.MeshStandardMaterial({color:'#2b3431',roughness:.95});mats.push(steel,orange,strap,grip);
  const body=new T.BoxGeometry(.18,.22,.46),wheel=new T.TorusGeometry(.11,.04,6,12),bar=new T.CylinderGeometry(ZIP_GRIP.radius,ZIP_GRIP.radius,ZIP_GRIP.length,10),sleeve=new T.CylinderGeometry(ZIP_GRIP.radius+.006,ZIP_GRIP.radius+.006,.13,10),
   cap=new T.SphereGeometry(ZIP_GRIP.radius+.008,8,6),band=new T.BoxGeometry(.045,1,.012);geos.push(body,wheel,bar,sleeve,cap,band);
  const b=new T.Mesh(body,steel);b.position.y=-.12;trolley.add(b);
  for(const z of [-.13,.13]){const w=new T.Mesh(wheel,orange);w.rotation.y=Math.PI/2;w.position.set(0,.02,z);trolley.add(w);}
  handle=new T.Group();handle.name='zipline-handle';
  // The bar lies along the handle's x (the rider's left-right).
  const h=new T.Mesh(bar,orange);h.name='handle';h.rotation.z=Math.PI/2;handle.add(h);
  for(const s of [-1,1]){const g=new T.Mesh(sleeve,grip);g.rotation.z=Math.PI/2;g.position.x=s*ZIP_GRIP.half;handle.add(g);const c=new T.Mesh(cap,orange);c.position.x=s*ZIP_GRIP.length/2;handle.add(c);}
  straps=[0,1].map(i=>{const m=new T.Mesh(band,strap);m.name='strap'+i;root!.add(m);return m;});
  for(const o of [trolley,handle,...straps])o.traverse(x=>{if(x instanceof T.Mesh){x.castShadow=false;x.receiveShadow=false;}});
  root.add(trolley,handle);
  // Speed lines: thin white streaks in a loose tube round the rider, streaming back past them (one instanced draw); a tuck adds more.
  const n=reduced?Math.round(LINES_TUCK/3):LINES_TUCK,g=new T.BoxGeometry(.03,.03,2.2),m=new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0,depthWrite:false});geos.push(g);mats.push(m);
  lines=new T.InstancedMesh(g,m,n);lines.name='zipline-speed-lines';lines.frustumCulled=false;lines.castShadow=false;lines.receiveShadow=false;
  linePos.length=0;for(let i=0;i<n;i++)linePos.push(streak({a:0,r:0,along:0},-3+Math.random()*39));
  root.add(lines);scene.add(root);
 }
 function dispose3d(){if(root){root.removeFromParent();root=null;}lines?.dispose();lines=null;trolley=null;handle=null;straps=[];geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());geos.length=0;mats.length=0;}

 const yaw=ZIP_DIR.yaw;
 function startRide(){
  if(phase!=='idle'||!lastUpdate||!lastUpdate.canEnter||ports.busy?.())return false;
  const u=lastUpdate,d=towerReach(u.x,u.z,u.onFoot);if(d===null)return false;
  if(u.onFoot){clipOn();return true;}
  if(u.onRide&&ports.dismount()){phase='arriving';age=0;ports.haptic?.();return true;}
  return false;
 }
 function resetActions(){tuckHeld=false;tuckW=0;rate=1;tuckWhooshAt=-9;spinT=-1;waveT=-1;cyclePhase=0;}
 function clipOn(){
  const p=ports.where();from.x=p.x;from.z=p.z;from.y=p.y;prev.fill(0);cur.fill(0);draw.fill(0);fresh=true;
  phase='clip';age=0;rideT=0;swing=swingV=roll=rollV=bounce=bounceV=0;prevSpeed=prevVy=0;whooshAt=0;landed=false;look=lookWant=0;resetActions();stats.rides++;
  build();camActive=true;zipStore.set({riding:true,note:ZIP_NOTES.start,notes:zipStore.get().notes+1});
  if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('fi2-vending-cue',{detail:'select'}));ports.haptic?.();
  countZiplineRide();// admin analytics: a zipline ride
 }
 /** End of the ride (or an early finish): stand on the deck. */
 function finish(quiet:boolean){
  if(phase==='idle')return;
  const wasRiding=phase!=='arriving';phase='idle';age=0;resetActions();
  if(wasRiding){ports.land(ZIP_LAND.x,ZIP_LAND.z,yaw);placed.x=ZIP_LAND.x;placed.z=ZIP_LAND.z;
   if(!quiet&&!landed)ports.touchdown?.(ZIP_LAND.x,ZIP_DECK.height,ZIP_LAND.z);
   zipStore.set({riding:false,note:quiet?'':ZIP_NOTES.land,notes:zipStore.get().notes+(quiet?0:1)});}
  else zipStore.set({riding:false});
  dispose3d();
  // The camera eases back to the follow camera (applyCamera), or snaps when the tab was hidden.
  if(quiet){blend=0;camActive=false;}
 }
 /** Stop without moving the player (a map trip moved them already). */
 function abandon(){phase='idle';resetActions();dispose3d();blend=0;camActive=false;zipStore.set({riding:false});}

 // ---- The ride's three actions (HUD buttons, keys). None touches the ride's path, speed past the brake, or its landing.
 function press(id:ZipActionId,p:'tap'|'down'|'up'){
  const riding=phase==='clip'||phase==='ride';
  if(id==='tuck'){
   if(p==='up'||!riding){tuckHeld=false;return;}
   if(!tuckHeld){tuckHeld=true;stats.tucks++;if(phase==='ride'&&rideT-tuckWhooshAt>1.5){tuckWhooshAt=rideT;ports.whoosh?.();}}
   return;}
  if(p==='up'||phase!=='ride')return;
  if(id==='spin'){const dur=reduced?ZIP_SPIN.reduced:ZIP_SPIN.seconds;
   if(spinT>=0||rideT+dur*(1+ZIP_TUCK.boost)+ZIP_SPIN.lastGap>ZIP_RIDE.seconds)return;
   spinT=0;spinDur=dur;stats.spins++;(ports.swish??ports.whoosh)?.();ports.haptic?.();return;}
  if(id==='wave'){if(waveT>=0||rideT+ZIP_WAVE.seconds*(1+ZIP_TUCK.boost)+ZIP_WAVE.lastGap>ZIP_RIDE.seconds)return;
   waveT=0;stats.waves++;ports.haptic?.();}
 }

 // ---- Placing the body from the bar (the tick, for the location, and every frame, for the drawing): the pivot under the trolley
 // swings by (swing, roll) about the cable's line; the strap (+ its bounce) hangs the bar from it; the body hangs from the bar,
 // turned by the spin; while clipping on and letting go it blends to standing at (SX, SY, SZ).
 const qP=new T.Quaternion(),qB=new T.Quaternion(),qS=new T.Quaternion(),qYaw=new T.Quaternion(),eP=new T.Euler(0,0,0,'YXZ'),Yup=new T.Vector3(0,1,0);
 const vPivot=new T.Vector3(),vBar=new T.Vector3(),vRoot=new T.Vector3(),vTmp=new T.Vector3(),vStand=new T.Vector3();
 function placeBody(s:Float64Array,sy:number,sz:number,pos:T.Vector3,quat:T.Quaternion){
  qP.setFromEuler(eP.set(s[F.SWING],s[F.YAW],s[F.ROLL],'YXZ'));
  vPivot.set(s[F.PX],s[F.PY]-ZIP_TROLLEY_DROP,s[F.PZ]);
  vBar.set(0,-(ZIP_STRAP+s[F.BOUNCE]),0).applyQuaternion(qP).add(vPivot);
  qB.copy(qP).multiply(qS.setFromAxisAngle(Yup,s[F.SPIN]));
  vRoot.set(0,s[F.BARY]*sy,s[F.BARZ]*sz).applyQuaternion(qB);vRoot.subVectors(vBar,vRoot);
  const k=s[F.DROP];
  if(k>0){vStand.set(s[F.SX],s[F.SY],s[F.SZ]);vRoot.lerp(vStand,k);qB.slerp(qYaw.setFromAxisAngle(Yup,yaw),k);}
  pos.copy(vRoot);quat.copy(qB);
 }
 /** The bar's middle and its direction (the rider's left → right) after placeBody (the strap's ends; tests). */
 const barMid=new T.Vector3(),barDir=new T.Vector3(1,0,0),qBar=new T.Quaternion();
 function barFrom(s:Float64Array){qP.setFromEuler(eP.set(s[F.SWING],s[F.YAW],s[F.ROLL],'YXZ'));vPivot.set(s[F.PX],s[F.PY]-ZIP_TROLLEY_DROP,s[F.PZ]);
  barMid.set(0,-(ZIP_STRAP+s[F.BOUNCE]),0).applyQuaternion(qP).add(vPivot);qBar.copy(qP).multiply(qS.setFromAxisAngle(Yup,s[F.SPIN]));barDir.set(1,0,0).applyQuaternion(qBar);}
 const tickPos=new T.Vector3(),tickQ=new T.Quaternion(),trolleyAt:ZipPoint={x:0,y:0,z:0};

 /** The rider's state at this tick: the trolley, the swing and sway, the bounce, the actions, and the body's pose. */
 function sample(out:Float64Array,dt:number){
  const dts=Math.min(dt,1/30),top=ZIP_TOP_SPEED;
  out[F.YAW]=yaw;out[F.SPIN]=0;
  let tau=1,speed=0,launch=0,cycle=0,approach=0,W=1,drop=0,clipHop=0;
  if(phase==='clip'){const u=age/ZIP_RIDE.clip,k=smooth(u);cableInto(0,trolleyAt);
   out[F.SX]=lerp(from.x,ZIP_LAUNCH.x,k);out[F.SZ]=lerp(from.z,ZIP_LAUNCH.z,k);clipHop=reduced?0:.35*Math.sin(Math.PI*Math.min(1,u*1.25));out[F.SY]=lerp(from.y,ZIP_LAUNCH.y,k)+clipHop;
   // Walk onto the spot and hop up: the arms reach for the bar, the body leaves the ground and hangs.
   W=smooth((u-.3)/.45);drop=1-smooth((u-.2)/.6);tau=0;cycle=reduced?0:.6*smooth((u-.55)/.3);launch=0;}
  else{const t=phase==='ride'?rideT:ZIP_RIDE.seconds;tau=t/ZIP_RIDE.seconds;cableInto(rideProgress(tau),trolleyAt);
   if(phase==='ride'){const base=rideSpeed(tau);rate=Math.min(ease(rate,tuckRate(tau,base,tuckHeld),ZIP_TUCK.ease,dt),Math.max(1,ZIP_TUCK.maxSpeed/Math.max(1,base)));speed=base*rate;
    launch=smooth(rideT/.15)*(1-smooth((rideT-.35)/.6));cycle=smooth(rideT/.25)*(1-smooth((rideT-.9)/1.4));approach=smooth((tau-.86)/.12);}
   else{rate=1;const k=Math.min(1,age/ZIP_RIDE.land);approach=1;W=1-smooth((k-.3)/.45);drop=smooth((k-.25)/.55);
    out[F.SX]=ZIP_LAND.x;out[F.SZ]=ZIP_LAND.z;out[F.SY]=ZIP_DECK.height;}}
  out[F.PX]=trolleyAt.x;out[F.PY]=trolleyAt.y;out[F.PZ]=trolleyAt.z;out[F.SPEED]=speed;
  const v=speed/top,tt=phase==='ride'?rideT:phase==='land'?ZIP_RIDE.seconds+age:age;
  // Pendulum about the trolley: the feet lag behind when it speeds up and swing forward when it brakes. The push and the brake
  // reach the body softened (a kid's harness, not a rigid rod): 0.6 of it, 0.3 with reduced motion.
  const acc=dt>0&&phase==='ride'?(speed-prevSpeed)/dt:0;prevSpeed=speed;
  const damp=reduced?5:1.4;
  swingV+=(-(G/PENDULUM)*Math.sin(swing)-damp*swingV+(acc*(reduced?.3:.6)/PENDULUM)*Math.cos(swing))*dts;swing=clamp(swing+swingV*dts,-.7,.7);
  // Sideways: gusts that grow with speed swing the body on the same pendulum (none with reduced motion). A spin's start gives it a
  // small kick; one hand off the bar tips the body toward the hand that holds.
  const wave=waveT>=0?smooth(waveT/ZIP_WAVE.seconds/.15)*(1-smooth((waveT/ZIP_WAVE.seconds-.82)/.18)):0;
  if(reduced){roll=rollV=0;}
  else{const gust=v*(.9*Math.sin(tt*1.1)+.55*Math.sin(tt*2.3+1.3)+.25*Math.sin(tt*4.7+.4));
   rollV+=(-(G/PENDULUM)*Math.sin(roll)-1.6*rollV+gust/PENDULUM)*dts;roll=clamp(roll+rollV*dts,-.22,.22);}
  // The strap's bounce: the trolley's vertical acceleration over the sag through a damped spring (heavier → longer), and a buzz
  // of the cable at speed. It fades into the landing so the feet meet the deck.
  const vy=phase==='ride'?speed*cableGrade(rideProgress(tau)):0,ay=dt>0&&phase==='ride'?(vy-prevVy)/dt:0;prevVy=vy;
  const om=8.8,ze=.3,want=clamp(ay*.022,-.05,.07)*(reduced?.5:1);
  bounceV+=(om*om*(want-bounce)-2*ze*om*bounceV)*dts;bounce+=bounceV*dts;
  const fade=1-approach;
  out[F.SWING]=(reduced?swing*.5:swing);out[F.ROLL]=roll+(reduced?0:.1*wave);
  out[F.YAW]=yaw+(reduced?0:.06*Math.sin(tt*1.3)*v);
  out[F.BOUNCE]=(bounce+(reduced?0:.012*Math.sin(tt*13)*v))*fade;
  // ---- The actions' clocks (real time: none of them touches rideT).
  tuckW=ease(tuckW,tuckHeld&&phase==='ride'&&tau<.9?1:0,reduced?4:6,dt);
  let flare=0;
  if(spinT>=0){spinT+=dt;const u=Math.min(1,spinT/spinDur);out[F.SPIN]=Math.PI*2*(u*u*(3-2*u));flare=Math.sin(Math.PI*u);if(u>=1){spinT=-1;out[F.SPIN]=0;}}
  if(waveT>=0){waveT+=dt;if(waveT>=ZIP_WAVE.seconds)waveT=-1;}
  // ---- The body. Legs: hanging loose (toes down), trailing the swing, kicking/cycling off the tower, tucked at top speed (and
  // while Tuck is held), flared through a spin, stretched out to reach for the deck.
  const amp=reduced?.45:1,autoTuck=smooth((v-.72)/.22)*(1-approach),tuck=Math.max(tuckW,autoTuck*.35);
  cyclePhase+=dt*(reduced?5:8.5);
  const trail=clamp(swingV*.12,-.25,.25)*amp;
  for(let i=0;i<2;i++){const ph=cyclePhase+i*Math.PI;
   let hip=-.12+trail+cycle*(-.35+.5*Math.sin(ph))*amp-.55*launch,knee=.32+cycle*(.35+.55*Math.max(0,Math.cos(ph)))*amp+.25*launch,ankle=.28+cycle*.2*Math.sin(ph)*amp;
   hip=lerp(hip,-1.55,tuck);knee=lerp(knee,2.05,tuck)+.3*flare;ankle=lerp(ankle,.45,tuck);
   hip=lerp(hip,-.62+(i?.06:-.06),approach);knee=lerp(knee,.12,approach);ankle=lerp(ankle,-.12,approach);
   out[i?F.HIPR:F.HIPL]=hip;out[i?F.KNR:F.KNL]=knee;out[i?F.ANR:F.ANL]=ankle;}
  out[F.SPREAD]=.06+.2*flare*amp;
  // Torso: a lean back off the tower, curled in a tuck, twisting with the sway and toward a wave, bending against the roll.
  out[F.TX]=-.22*launch+.24*tuck+.08*approach;
  out[F.TY]=(reduced?0:.1*Math.sin(tt*.8)*v+.04*Math.sin(tt*2.1)*v)+.14*wave;
  out[F.TZ]=-roll*.6;
  // Head: ahead and down at the water (more at speed), up with the launch, down at the deck coming in; it turns where the stick
  // looks, and toward the beach with a wave.
  out[F.HX]=.16+.18*v-.25*launch-.08*tuck+.3*approach;out[F.HY]=look*.7+.3*wave;
  out[F.PELY]=.94;out[F.PELZ]=0;
  // The bar in the body's frame: a pull up in a tuck and at the launch.
  out[F.BARY]=ZIP_GRIP.y-ZIP_GRIP.pull*tuck-.04*launch;out[F.BARZ]=ZIP_GRIP.z+.03*tuck;
  out[F.WAVE]=wave;out[F.WPH]=(waveT>=0?waveT:0)*(reduced?5:9);out[F.TUCK]=tuckW;
  out[F.W]=W;out[F.DROP]=drop;
  if(phase!=='clip'&&phase!=='land'){out[F.SX]=out[F.SY]=out[F.SZ]=0;}
  // The location (feet, unscaled body) for the host: the camera, the minimap, the rooftop height.
  placeBody(out,1,1,tickPos,tickQ);out[F.X]=tickPos.x;out[F.Y]=phase==='land'?Math.max(ZIP_DECK.height,tickPos.y):tickPos.y;out[F.Z]=tickPos.z;
 }
 let lastUpdate:ZiplineUpdate|null=null;
 /** The drawn state at tick blend k (between the last two ticks). The spin snaps across its wrap (2π → 0). */
 function interp(k:number){
  for(let i=0;i<F.N;i++)draw[i]=prev[i]+(cur[i]-prev[i])*k;
  if(Math.abs(cur[F.SPIN]-prev[F.SPIN])>Math.PI)draw[F.SPIN]=cur[F.SPIN];
  drawn.x=draw[F.X];drawn.y=draw[F.Y];drawn.z=draw[F.Z];drawn.px=draw[F.PX];drawn.py=draw[F.PY];drawn.pz=draw[F.PZ];drawn.swing=draw[F.SWING];drawn.roll=draw[F.ROLL];
  drawn.yaw=draw[F.YAW];drawn.speed=draw[F.SPEED];drawn.spin=draw[F.SPIN];drawn.tuck=draw[F.TUCK];drawn.wave=draw[F.WAVE];
  const r=rig;r.w=draw[F.W];r.barY=draw[F.BARY];r.barZ=draw[F.BARZ];r.half=ZIP_GRIP.half;r.free=1;r.wave=draw[F.WAVE];r.wavePhase=draw[F.WPH];
  r.py=draw[F.PELY];r.pz=draw[F.PELZ];r.pike=0;r.tx=draw[F.TX];r.ty=draw[F.TY];r.tz=draw[F.TZ];r.hx=draw[F.HX];r.hy=draw[F.HY];r.spread=draw[F.SPREAD];
  r.hipL=draw[F.HIPL];r.hipR=draw[F.HIPR];r.kneeL=draw[F.KNL];r.kneeR=draw[F.KNR];r.ankleL=draw[F.ANL];r.ankleR=draw[F.ANR];
 }

 function onKey(e:KeyboardEvent){if(e.key.toLowerCase()!=='e'||e.repeat||!promptShown)return;const el=e.target as HTMLElement|null;if(el&&(el.tagName==='INPUT'||el.tagName==='TEXTAREA'||el.isContentEditable))return;if(startRide())e.preventDefault();}
 function onHide(){if(typeof document!=='undefined'&&document.hidden&&phase!=='idle')finish(true);}
 if(typeof window!=='undefined'){window.addEventListener('keydown',onKey);window.addEventListener('pagehide',onHide);}
 if(typeof document!=='undefined'&&document.addEventListener)document.addEventListener('visibilitychange',onHide);
 zipActions.ride=()=>{startRide();};zipActions.press=press;

 const anchor=new T.Vector3(),M=new T.Matrix4(),Q=new T.Quaternion(),P=new T.Vector3(),S=new T.Vector3(1,1,1),E=new T.Euler(0,0,0,'YXZ');
 const camPos=new T.Vector3(),camLook=new T.Vector3(),camQ=new T.Quaternion(),aimer=new T.PerspectiveCamera(),/* a camera: lookAt points its -z at the target */normalPos=new T.Vector3(),normalQ=new T.Quaternion();
 const strapEnd=new T.Vector3(),strapMid=new T.Vector3();
 let promptShown=false;
 return {
  stats,
  /** Riding (clipping on, on the cable or landing): the host draws the rider here and hides the foot ring and the ball. */
  get active(){return phase==='clip'||phase==='ride'||phase==='land';},
  /** Hanging from the handle (both hands on the bar, more than half way). */
  get hanging(){return (phase==='clip'||phase==='ride'||phase==='land')&&cur[F.W]>.5;},
  get phase(){return phase;},
  get drawn():Readonly<typeof drawn>{return drawn;},
  /** The rider's pose as last drawn (player.ts reads it through motion()). */
  get rigPose():Readonly<ZipRigPose>{return rig;},
  /** The drawn bar: its middle and its direction (left → right hand), world space. */
  get bar(){return {mid:barMid,dir:barDir};},
  ride:startRide,
  press,
  /** Town's keydown/keyup while riding: Space or 1 tuck (hold), Q or 2 spin, E or 3 wave. The ride owns R and J too (no ride
   *  change or juggle in the air). True = handled (the host stops there). */
  key(e:{code:string;key:string;repeat:boolean;preventDefault():void},down:boolean){
   if(phase!=='clip'&&phase!=='ride'&&phase!=='land')return false;
   const id=zipKeyAction(e.code,e.key),k=e.key.toLowerCase();
   if(!id){if(k==='r'||k==='j'){e.preventDefault();return true;}return false;}
   e.preventDefault();
   if(id==='tuck'){if(down&&!e.repeat)press('tuck','down');else if(!down)press('tuck','up');}
   else if(down&&!e.repeat)press(id,'tap');
   return true;
  },
  /** Island tick (60 Hz), before anything moves the player: true = the zipline holds the player this tick (input locked; the
   *  stick turns the camera). */
  holdPlayer(input:{x:number;z:number;kick:boolean;juggle:boolean;shotPower?:number;charging?:boolean},keys:ReadonlySet<string>,dt:number){
   if(phase==='idle')return false;
   if(phase==='arriving'){age+=dt;if(age>ARRIVAL_WAIT){phase='idle';zipStore.set({riding:false});}return false;}
   stats.busyTicks++;
   // A map trip (or anything else) moved the player off the line: stop at once, leave them where they are.
   const w=ports.where();if(phase!=='clip'&&Math.hypot(w.x-placed.x,w.z-placed.z)>3){abandon();return false;}
   const kx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+input.x;
   lookWant=clamp(kx,-1,1)*1.15;
   input.kick=input.juggle=false;input.shotPower=0;input.charging=false;
   prev.set(cur);age+=dt;
   if(phase==='clip'&&age>=ZIP_RIDE.clip){phase='ride';age=0;rideT=0;ports.whoosh?.();ports.haptic?.();}
   else if(phase==='ride'){rideT=Math.min(ZIP_RIDE.seconds,rideT+dt*rate);
    if(rideT-whooshAt>2.4&&rideSpeed(rideT/ZIP_RIDE.seconds)*rate>ZIP_TOP_SPEED*.55){whooshAt=rideT;ports.whoosh?.();}
    if(rideT>=ZIP_RIDE.seconds){phase='land';age=0;tuckHeld=false;}}
   if(phase==='land'&&!landed&&age>=ZIP_RIDE.land*.72){landed=true;ports.touchdown?.(ZIP_LAND.x,ZIP_DECK.height,ZIP_LAND.z);ports.haptic?.();}
   if(phase==='land'&&age>=ZIP_RIDE.land){finish(false);return true;}
   sample(cur,dt);if(fresh){prev.set(cur);fresh=false;}
   ports.place(cur[F.X],cur[F.Z],cur[F.Y]);placed.x=cur[F.X];placed.z=cur[F.Z];
   return true;
  },
  /** The rider's motion for player.update (Town's, changed in place): hanging = the zipline pose (both hands solved onto the bar;
   *  the parachute's gating keeps the walk's own layers out of it) until the hands let go on the deck. `blendTick` = Town's tick
   *  blend, so the pose and pose() draw the same instant. */
  motion<M extends {parachute?:boolean;parachuteSpin?:number;parachuteJuggle?:unknown;facing?:number;zipline?:ZipRigPose}>(m:M,blendTick=1):M{
   if(phase==='idle'||phase==='arriving')return m;
   interp(Math.max(0,Math.min(1,blendTick)));
   if(rig.w<=0)return m;
   m.zipline=rig;m.parachute=rig.w>=.999;m.parachuteSpin=0;m.parachuteJuggle=undefined;m.facing=yaw;
   return m;
  },
  /** After Town has placed the player (each frame): draw the rider from the bar (between the last two ticks), the trolley, the
   *  handle and its straps, the speed lines. `blendTick` is Town's tick blend (accumulator × 60). */
  pose(player:T.Object3D,blendTick:number,dt:number,isReduced:boolean){
   reduced=isReduced;
   if(phase==='idle'||phase==='arriving'){if(lines){dispose3d();}return;}
   interp(Math.max(0,Math.min(1,blendTick)));
   placeBody(draw,player.scale.y,player.scale.z,player.position,player.quaternion);
   barFrom(draw);
   if(trolley&&handle){
    // The trolley runs on the cable; the handle hangs from its underside, swung with the body (and turned by the spin's swivel).
    trolley.position.set(draw[F.PX],draw[F.PY],draw[F.PZ]);trolley.rotation.set(0,yaw,0);
    handle.position.copy(barMid);handle.quaternion.copy(qBar);
    vPivot.set(draw[F.PX],draw[F.PY]-ZIP_TROLLEY_DROP,draw[F.PZ]);
    for(let i=0;i<straps.length;i++){const st=straps[i];strapEnd.copy(barDir).multiplyScalar((i?1:-1)*(ZIP_GRIP.length/2-.04)).add(barMid);
     vTmp.subVectors(strapEnd,vPivot);const len=Math.max(.02,vTmp.length());strapMid.addVectors(strapEnd,vPivot).multiplyScalar(.5);
     st.position.copy(strapMid);st.quaternion.setFromUnitVectors(Yup,vTmp.divideScalar(len));st.scale.set(1,len,1);}
   }
   if(lines){const v=drawn.speed,tk=drawn.tuck,show=phase==='ride'&&v>5;lines.visible=show;
    if(show){const mat=lines.material as T.MeshBasicMaterial,base=reduced?Math.round(LINES/3):LINES,max=linePos.length;
     lines.count=Math.min(max,Math.round(base+(max-base)*tk));
     mat.opacity=Math.min(.55,(v-5)/ZIP_TOP_SPEED)*(1+.5*tk)*(reduced?.5:1);
     const fx=ZIP_DIR.x,fz=ZIP_DIR.z,rx=-fz,rz=fx,cy=drawn.py-1.1,n=lines.count;Q.setFromEuler(E.set(0,yaw,0));
     for(let i=0;i<n;i++){const l=linePos[i];l.along-=v*(1.35+.35*tk)*dt;if(l.along<-3)streak(l,l.along+39);
      const ox=Math.cos(l.a)*l.r,oy=Math.sin(l.a)*l.r*.6;P.set(drawn.px+fx*l.along+rx*ox,cy+oy,drawn.pz+fz*l.along+rz*ox);
      S.set(1,1,(.5+v/ZIP_TOP_SPEED)*(1+.8*tk));M.compose(P,Q,S);lines.setMatrixAt(i,M);}
     lines.instanceMatrix.needsUpdate=true;}}
  },
  /** After the follow camera (and the other activities' cameras) are placed: the ride camera, blended in and back out. */
  applyCamera(camera:T.PerspectiveCamera,dt:number,isReduced:boolean){
   const riding=phase==='clip'||phase==='ride'||phase==='land';
   if(!riding&&!camActive)return;
   const target=riding?1:0,rateC=isReduced?4:(riding?1.5:1.1);
   blend=target?Math.min(1,blend+dt*rateC):Math.max(0,blend-dt*rateC);
   if(!riding&&blend<=0){camActive=false;return;}
   look+=(lookWant-look)*(1-Math.exp(-dt*(isReduced?3:5)));if(!riding)lookWant=0;
   // Behind the trolley and a little to the east (the follow camera's side), above the cable, looking down it to Coral Cay.
   // Portrait phones see a narrow slice sideways: a smaller side angle and a step further back keep the rider in frame.
   const portrait=camera.aspect<1,a=yaw+Math.PI+(portrait?.1:isReduced?.2:.32)+look,back=(isReduced?9:8.5)+(portrait?1.5:0),up=(isReduced?3.4:2.9)+(portrait?.6:0);
   const px=riding?drawn.px:ZIP_LAND.x,py=riding?drawn.py:ZIP_DECK.height+2.2,pz=riding?drawn.pz:ZIP_LAND.z;
   camPos.set(px+Math.sin(a)*back,py+up,pz+Math.cos(a)*back);
   const ahead=22,lx=px+Math.sin(yaw+look*.6)*ahead,lz=pz+Math.cos(yaw+look*.6)*ahead;camLook.set(lx,py-6.5,lz);
   aimer.position.copy(camPos);aimer.up.set(0,1,0);aimer.lookAt(camLook);camQ.copy(aimer.quaternion);
   const e=smooth(blend);normalPos.copy(camera.position);normalQ.copy(camera.quaternion);
   camera.position.lerpVectors(normalPos,camPos,e);camera.quaternion.slerpQuaternions(normalQ,camQ,e);camera.updateMatrixWorld();
  },
  /** Per frame (Town's HUD block): the prompt by the tower; the arrival after hopping off a ride. Off the tower: one box test. */
  update(c:ZiplineUpdate):{key:string;distance:number}|null{
   lastUpdate=c;reduced=c.reduced;
   const prompt=c.ui<HTMLButtonElement>('[data-zipline-ride]');
   if(phase==='arriving'&&c.onFoot)clipOn();
   if(phase!=='idle'||!nearTower(c.x,c.z)){if(promptShown&&prompt)c.hide(prompt,true);promptShown=false;return null;}
   const d=c.canEnter&&(c.onFoot||c.onRide)&&!ports.busy?.()?towerReach(c.x,c.z,c.onFoot):null;
   const want=d===null?null:{key:'zipline',distance:d};
   if(prompt){let hidden=!(want&&c.focusKey==='zipline');
    if(!hidden){anchor.set(ZIP_LAUNCH.x,ZIP_LAUNCH.y+2.8,ZIP_LAUNCH.z).project(c.camera);hidden=anchor.z< -1||anchor.z>1;
     if(!hidden)c.place(prompt,T.MathUtils.clamp((anchor.x+1)*c.width/2,95,c.width-95),T.MathUtils.clamp((1-anchor.y)*c.height/2,90,c.height-160));}
    c.hide(prompt,hidden);promptShown=!hidden;}
   return want;
  },
  /** Tests and debug: finish now (as the tab hiding does). */
  finishNow(){finish(true);},
  dispose(){if(typeof window!=='undefined'){window.removeEventListener('keydown',onKey);window.removeEventListener('pagehide',onHide);}
   if(typeof document!=='undefined'&&document.removeEventListener)document.removeEventListener('visibilitychange',onHide);
   zipActions.ride=()=>{};zipActions.press=()=>{};zipStore.reset();dispose3d();phase='idle';resetActions();},
 };
}
export type Zipline=ReturnType<typeof createZipline>;
