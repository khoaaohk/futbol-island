/**
 * The zipline runtime (Oct 14 2026; rules and positions: lib/town/zipline.ts; static props: lib/town/ziplineWorld.ts; HUD:
 * components/ZiplineHud.tsx). Summit Isle's lookout → the Coral Cay Hostel roof, one way, free (it is gravity: no fuel).
 *
 *  - The prompt: "Ride the zipline" by the launch tower (on foot, or on a scooter, bike or moped: the tap hops you off first, the
 *    fruit trees' way), through the HUD arbiter like every proximity prompt. E works too.
 *  - The ride, on Town's fixed 60 Hz tick (holdPlayer): clip on (a hop onto the launch spot, arms up to the handle), the ride along
 *    the sagging cable on a fixed speed profile (ZIP_RIDE.seconds whatever the frame rate), the landing (the swing settles, let go,
 *    a small hop onto the deck, landing dust). Input is locked; the stick only turns the camera to look around.
 *  - Animation while zipping: the rider hangs from the trolley with both arms up (the parachute pose: legs swinging), swings like a
 *    pendulum against the trolley's acceleration and braking, sways side to side and wobbles a little at speed; the trolley and its
 *    strap run on the cable; speed lines stream past; whooshes at the launch and at speed.
 *  - The camera follows from behind and a little to the east (the follow camera's side), looking down the cable over the sea to
 *    Coral Cay; it is a pure function of the drawn ride (interpolated between ticks like the player) plus an eased look offset, so
 *    it is smooth at any frame rate; it blends in from and back out to the follow camera.
 *  - The tab hiding (or the page going away) mid-ride finishes the ride at once on the roof deck: never stuck in the air.
 * Reduced motion: a calm camera (no side offset drift), a damped swing, no wobble, a third of the speed lines, no hop.
 *
 * Heat: nothing at rest. Off Summit Isle update() is one box test; near the tower a distance. The trolley (3 small meshes) and the
 * speed lines (ONE instanced mesh, one draw call) are built when a ride starts and disposed when it ends; no timers, no rAF, one
 * keydown and one visibilitychange listener.
 */
import * as T from 'three';
import {ZIP_RIDE,ZIP_LAUNCH,ZIP_LAND,ZIP_DECK,ZIP_DIR,ZIP_HANG,ZIP_TOP_SPEED,ZIP_NOTES,ridePoint,towerReach,nearTower,zipStore,zipActions,cableAt} from '../town/zipline';
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
 /** A whoosh (Town: sound.boost('forward')). */
 whoosh?:()=>void;
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
/** A tick's drawn state (interpolated between the last two ticks when drawn). */
type Snap={x:number;y:number;z:number;px:number;py:number;pz:number;swing:number;roll:number;yaw:number;speed:number};
const G=9.8,PENDULUM=1.5,ARRIVAL_WAIT=4;
const LINES=28;
const snap=():Snap=>({x:0,y:0,z:0,px:0,py:0,pz:0,swing:0,roll:0,yaw:0,speed:0});
const lerp=(a:number,b:number,k:number)=>a+(b-a)*k;
const smooth=(k:number)=>{const t=Math.max(0,Math.min(1,k));return t*t*(3-2*t);};

export function createZipline(scene:T.Scene,ports:Ports){
 let phase:Phase='idle',age=0,rideT=0,reduced=false;
 /** Clip-on start (feet), the swing's angle and rate, the last placed location (a map trip mid-ride ends it). */
 const from={x:0,y:0,z:0},placed={x:0,z:0};let swing=0,swingV=0,prevSpeed=0,whooshAt=0,hop=false,landed=false;
 let prev=snap(),cur=snap();const drawn=snap();
 /** Camera blend (0 = Town's follow camera, 1 = the ride camera) and the eased look-around offset (radians). */
 let blend=0,look=0,lookWant=0,camActive=false;
 const stats={rides:0,busyTicks:0,get phase(){return phase;},get blend(){return blend;}};
 // ---- the ride's meshes (built at the launch, disposed after)
 let root:T.Group|null=null,lines:T.InstancedMesh|null=null,trolley:T.Group|null=null;const geos:T.BufferGeometry[]=[],mats:T.Material[]=[];
 const linePos:{a:number;r:number;along:number}[]=[];
 /** A streak's place round the cable: beside and above the rider (never in the strip under their feet or down the camera's line
  *  of sight), from just behind them (3 m: they vanish before reaching the camera) to 36 m ahead. */
 const streak=(along:number)=>({a:-.45+Math.random()*(Math.PI+.9),r:2+Math.random()*4.5,along});
 function build(){
  dispose3d();root=new T.Group();root.name='zipline-ride';
  // The trolley: a steel body on the cable, an orange pulley, a strap down to the handle bar (re-sized each frame to the hands).
  trolley=new T.Group();trolley.name='zipline-trolley';
  const steel=new T.MeshStandardMaterial({color:'#4c5652',roughness:.6,metalness:.3}),orange=new T.MeshStandardMaterial({color:'#ef7d3c',roughness:.7}),strap=new T.MeshStandardMaterial({color:'#294f43',roughness:.9});mats.push(steel,orange,strap);
  const body=new T.BoxGeometry(.18,.22,.46),wheel=new T.TorusGeometry(.11,.04,6,12),bar=new T.CylinderGeometry(.03,.03,.62,8),band=new T.BoxGeometry(.05,1,.05);geos.push(body,wheel,bar,band);
  const b=new T.Mesh(body,steel);b.position.y=-.12;trolley.add(b);
  for(const z of [-.13,.13]){const w=new T.Mesh(wheel,orange);w.rotation.y=Math.PI/2;w.position.set(0,.02,z);trolley.add(w);}
  const s=new T.Mesh(band,strap);s.name='strap';trolley.add(s);
  const h=new T.Mesh(bar,orange);h.name='handle';h.rotation.z=Math.PI/2;trolley.add(h);
  trolley.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=false;o.receiveShadow=false;}});
  root.add(trolley);
  // Speed lines: thin white streaks in a loose tube round the rider, streaming back past them (one instanced draw).
  const n=reduced?Math.round(LINES/3):LINES,g=new T.BoxGeometry(.03,.03,2.2),m=new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0,depthWrite:false});geos.push(g);mats.push(m);
  lines=new T.InstancedMesh(g,m,n);lines.name='zipline-speed-lines';lines.frustumCulled=false;lines.castShadow=false;lines.receiveShadow=false;
  linePos.length=0;for(let i=0;i<n;i++)linePos.push(streak(-3+Math.random()*39));
  root.add(lines);scene.add(root);
 }
 function dispose3d(){if(root){root.removeFromParent();root=null;}lines?.dispose();lines=null;trolley=null;geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());geos.length=0;mats.length=0;}

 const yaw=ZIP_DIR.yaw;
 function startRide(){
  if(phase!=='idle'||!lastUpdate||!lastUpdate.canEnter||ports.busy?.())return false;
  const u=lastUpdate,d=towerReach(u.x,u.z,u.onFoot);if(d===null)return false;
  if(u.onFoot){clipOn();return true;}
  if(u.onRide&&ports.dismount()){phase='arriving';age=0;ports.haptic?.();return true;}
  return false;
 }
 function clipOn(){
  const p=ports.where();from.x=p.x;from.z=p.z;from.y=p.y;prev=snap();cur=snap();
  phase='clip';age=0;rideT=0;swing=swingV=0;prevSpeed=0;whooshAt=0;hop=false;landed=false;look=lookWant=0;stats.rides++;
  build();camActive=true;zipStore.set({riding:true,note:ZIP_NOTES.start,notes:zipStore.get().notes+1});
  if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('fi2-vending-cue',{detail:'select'}));ports.haptic?.();
  countZiplineRide();// admin analytics: a zipline ride
 }
 /** End of the ride (or an early finish): stand on the deck. */
 function finish(quiet:boolean){
  if(phase==='idle')return;
  const wasRiding=phase!=='arriving';phase='idle';age=0;
  if(wasRiding){ports.land(ZIP_LAND.x,ZIP_LAND.z,yaw);placed.x=ZIP_LAND.x;placed.z=ZIP_LAND.z;
   if(!quiet&&!landed)ports.touchdown?.(ZIP_LAND.x,ZIP_DECK.height,ZIP_LAND.z);
   zipStore.set({riding:false,note:quiet?'':ZIP_NOTES.land,notes:zipStore.get().notes+(quiet?0:1)});}
  else zipStore.set({riding:false});
  dispose3d();
  // The camera eases back to the follow camera (applyCamera), or snaps when the tab was hidden.
  if(quiet){blend=0;camActive=false;}
 }
 /** Stop without moving the player (a map trip moved them already). */
 function abandon(){phase='idle';dispose3d();blend=0;camActive=false;zipStore.set({riding:false});}

 /** The rider's state at this tick (feet, trolley pivot, swing, sway). */
 function sample(out:Snap,dt:number){
  if(phase==='clip'){const k=smooth(age/ZIP_RIDE.clip);
   out.x=lerp(from.x,ZIP_LAUNCH.x,k);out.z=lerp(from.z,ZIP_LAUNCH.z,k);out.y=lerp(from.y,ZIP_LAUNCH.y,k)+(reduced?0:.55*Math.sin(Math.PI*k));
   const c=cableAt(0);out.px=c.x;out.py=c.y;out.pz=c.z;out.swing=0;out.roll=0;out.speed=0;out.yaw=yaw;return;}
  const t=phase==='ride'?rideT:ZIP_RIDE.seconds,p=ridePoint(t),speed=phase==='ride'?p.speed:0;
  // Pendulum about the hands: the feet lag behind when the trolley speeds up and swing forward when it brakes.
  const acc=dt>0?(speed-prevSpeed)/dt:0;prevSpeed=speed;
  const damp=reduced?5:1.4,dts=Math.min(dt,1/30);
  // The trolley's push and brake reach the body softened (a kid's harness, not a rigid rod): 0.6 of it, 0.3 with reduced motion.
  swingV+=(-(G/PENDULUM)*Math.sin(swing)-damp*swingV+(acc*(reduced?.3:.6)/PENDULUM)*Math.cos(swing))*dts;swing+=swingV*dts;swing=Math.max(-.7,Math.min(.7,swing));
  const v=speed/ZIP_TOP_SPEED,tt=phase==='ride'?rideT:ZIP_RIDE.seconds+age;
  out.px=p.trolley.x;out.py=p.trolley.y;out.pz=p.trolley.z;out.speed=speed;
  out.swing=reduced?swing*.5:swing;
  out.roll=reduced?0:.06*Math.sin(tt*1.9)*(.4+v)+.03*Math.sin(tt*5.3)*v;
  out.yaw=yaw+(reduced?0:.1*Math.sin(tt*1.3)*v+.05*Math.sin(tt*4.1)*v*v);
  // The feet hang under the hands (pivot .3 below the trolley), swung by the pendulum.
  const L=ZIP_HANG-.3,fx=Math.sin(out.yaw),fz=Math.cos(out.yaw);
  out.x=out.px-fx*Math.sin(out.swing)*L;out.z=out.pz-fz*Math.sin(out.swing)*L;out.y=out.py-.3-Math.cos(out.swing)*L;
  if(phase==='land'){// let go: the swing fades, a small hop down onto the deck
   const k=Math.min(1,age/ZIP_RIDE.land),settle=1-smooth(k*1.6);out.swing*=settle;out.roll*=settle;
   out.x=lerp(ZIP_LAND.x,out.x,settle);out.z=lerp(ZIP_LAND.z,out.z,settle);
   out.y=ZIP_DECK.height+(reduced?0:.18*Math.sin(Math.PI*Math.min(1,k*1.4)))*(k<.72?1:0);}
 }
 let lastUpdate:ZiplineUpdate|null=null;

 function onKey(e:KeyboardEvent){if(e.key.toLowerCase()!=='e'||e.repeat||!promptShown)return;const el=e.target as HTMLElement|null;if(el&&(el.tagName==='INPUT'||el.tagName==='TEXTAREA'||el.isContentEditable))return;if(startRide())e.preventDefault();}
 function onHide(){if(typeof document!=='undefined'&&document.hidden&&phase!=='idle')finish(true);}
 if(typeof window!=='undefined'){window.addEventListener('keydown',onKey);window.addEventListener('pagehide',onHide);}
 if(typeof document!=='undefined'&&document.addEventListener)document.addEventListener('visibilitychange',onHide);
 zipActions.ride=()=>{startRide();};

 const anchor=new T.Vector3(),M=new T.Matrix4(),Q=new T.Quaternion(),P=new T.Vector3(),S=new T.Vector3(1,1,1),E=new T.Euler(0,0,0,'YXZ');
 const camPos=new T.Vector3(),camLook=new T.Vector3(),camQ=new T.Quaternion(),aimer=new T.PerspectiveCamera(),/* a camera: lookAt points its -z at the target */normalPos=new T.Vector3(),normalQ=new T.Quaternion();
 const handL=new T.Vector3(),handR=new T.Vector3();
 let promptShown=false;
 return {
  stats,
  /** Riding (clipping on, on the cable or landing): the host draws the rider here and hides the foot ring and the ball. */
  get active(){return phase==='clip'||phase==='ride'||phase==='land';},
  /** Hanging from the handle (arms up, the parachute pose). */
  get hanging(){return phase==='ride'||phase==='clip'&&age>ZIP_RIDE.clip*.45||phase==='land'&&age<ZIP_RIDE.land*.35;},
  /** The swing/wobble intensity for the pose (0…1). */
  get spin(){return phase==='ride'&&!reduced?Math.min(.45,Math.abs(drawn.swing)*.8+drawn.speed/ZIP_TOP_SPEED*.2):0;},
  get phase(){return phase;},
  get drawn():Readonly<Snap>{return drawn;},
  ride:startRide,
  /** Island tick (60 Hz), before anything moves the player: true = the zipline holds the player this tick (input locked; the
   *  stick turns the camera). */
  holdPlayer(input:{x:number;z:number;kick:boolean;juggle:boolean;shotPower?:number;charging?:boolean},keys:ReadonlySet<string>,dt:number){
   if(phase==='idle')return false;
   if(phase==='arriving'){age+=dt;if(age>ARRIVAL_WAIT){phase='idle';zipStore.set({riding:false});}return false;}
   stats.busyTicks++;
   // A map trip (or anything else) moved the player off the line: stop at once, leave them where they are.
   const w=ports.where();if(phase!=='clip'&&Math.hypot(w.x-placed.x,w.z-placed.z)>3){abandon();return false;}
   const kx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+input.x;
   lookWant=Math.max(-1,Math.min(1,kx))*1.15;
   input.kick=input.juggle=false;input.shotPower=0;input.charging=false;
   prev={...cur};age+=dt;
   if(phase==='clip'&&age>=ZIP_RIDE.clip){phase='ride';age=0;rideT=0;ports.whoosh?.();ports.haptic?.();}
   if(phase==='ride'){rideT=Math.min(ZIP_RIDE.seconds,rideT+dt);
    if(rideT-whooshAt>2.4&&ridePoint(rideT).speed>ZIP_TOP_SPEED*.55){whooshAt=rideT;ports.whoosh?.();}
    if(rideT>=ZIP_RIDE.seconds){phase='land';age=0;}}
   if(phase==='land'&&!landed&&age>=ZIP_RIDE.land*.72){landed=true;ports.touchdown?.(ZIP_LAND.x,ZIP_DECK.height,ZIP_LAND.z);ports.haptic?.();}
   if(phase==='land'&&age>=ZIP_RIDE.land){finish(false);return true;}
   sample(cur,dt);if(prev.x===0&&prev.z===0)prev={...cur};
   ports.place(cur.x,cur.z,cur.y);placed.x=cur.x;placed.z=cur.z;
   return true;
  },
  /** The rider's motion for player.update (wraps Town's): hanging = the parachute pose (arms up, legs swinging). */
  motion<M extends {parachute?:boolean;parachuteSpin?:number;parachuteJuggle?:unknown;facing?:number}>(m:M):M{
   if(phase==='idle'||phase==='arriving')return m;
   const hanging=this.hanging;
   return {...m,parachute:hanging||m.parachute,parachuteSpin:hanging?this.spin:m.parachuteSpin,parachuteJuggle:hanging?undefined:m.parachuteJuggle,facing:yaw};
  },
  /** After Town has placed the player (each frame): draw the rider on the cable (between the last two ticks), the trolley and strap,
   *  the speed lines. `blendTick` is Town's tick blend (accumulator × 60). */
  pose(player:T.Object3D,blendTick:number,dt:number,isReduced:boolean,hands?:(l:T.Vector3,r:T.Vector3)=>void){
   reduced=isReduced;
   if(phase==='idle'||phase==='arriving'){if(lines){dispose3d();}return;}
   const k=Math.max(0,Math.min(1,blendTick));
   drawn.x=lerp(prev.x,cur.x,k);drawn.y=lerp(prev.y,cur.y,k);drawn.z=lerp(prev.z,cur.z,k);drawn.px=lerp(prev.px,cur.px,k);drawn.py=lerp(prev.py,cur.py,k);drawn.pz=lerp(prev.pz,cur.pz,k);
   drawn.swing=lerp(prev.swing,cur.swing,k);drawn.roll=lerp(prev.roll,cur.roll,k);drawn.yaw=lerp(prev.yaw,cur.yaw,k);drawn.speed=lerp(prev.speed,cur.speed,k);
   player.rotation.order='YXZ';player.rotation.set(drawn.swing,drawn.yaw,drawn.roll);
   player.position.set(drawn.x,drawn.y,drawn.z);
   if(trolley){
    // Clipping on: the trolley waits on the cable at the launch; riding: it runs on the cable above the hands.
    trolley.position.set(drawn.px,drawn.py,drawn.pz);trolley.rotation.set(0,yaw,0);
    const strap=trolley.getObjectByName('strap'),handle=trolley.getObjectByName('handle');
    let handY=drawn.py-.3;
    if(hands&&this.hanging){hands(handL,handR);handY=(handL.y+handR.y)/2;}
    const len=Math.max(.12,drawn.py-.12-handY);
    if(strap){strap.scale.set(1,len,1);strap.position.set(0,-.12-len/2,0);}
    if(handle){handle.position.set(0,-.12-len,0);handle.visible=phase!=='land'||this.hanging;}
    if(strap)strap.visible=handle?.visible??true;
   }
   if(lines){const n=lines.count,v=drawn.speed,show=phase==='ride'&&v>5;lines.visible=show;
    if(show){const mat=lines.material as T.MeshBasicMaterial;mat.opacity=Math.min(.55,(v-5)/ZIP_TOP_SPEED)*(reduced?.5:1);
     const fx=ZIP_DIR.x,fz=ZIP_DIR.z,rx=-fz,rz=fx,cy=drawn.py-1.1;Q.setFromEuler(E.set(0,yaw,0));
     for(let i=0;i<n;i++){const l=linePos[i];l.along-=v*1.35*dt;if(l.along<-3)Object.assign(l,streak(l.along+39));
      const ox=Math.cos(l.a)*l.r,oy=Math.sin(l.a)*l.r*.6;P.set(drawn.px+fx*l.along+rx*ox,cy+oy,drawn.pz+fz*l.along+rz*ox);
      S.set(1,1,.5+v/ZIP_TOP_SPEED);M.compose(P,Q,S);lines.setMatrixAt(i,M);}
     lines.instanceMatrix.needsUpdate=true;}}
  },
  /** After the follow camera (and the other activities' cameras) are placed: the ride camera, blended in and back out. */
  applyCamera(camera:T.PerspectiveCamera,dt:number,isReduced:boolean){
   const riding=phase==='clip'||phase==='ride'||phase==='land';
   if(!riding&&!camActive)return;
   const target=riding?1:0,rate=isReduced?4:(riding?1.5:1.1);
   blend=target?Math.min(1,blend+dt*rate):Math.max(0,blend-dt*rate);
   if(!riding&&blend<=0){camActive=false;return;}
   look+=(lookWant-look)*(1-Math.exp(-dt*(isReduced?3:5)));if(!riding)lookWant=0;
   // Behind the trolley and a little to the east (the follow camera's side), above the cable, looking down it to Coral Cay.
   // Portrait phones see a narrow slice sideways: a smaller side angle and a step further back keep the rider in frame.
   const portrait=camera.aspect<1,a=yaw+Math.PI+(portrait?.1:isReduced?.2:.32)+look,back=(isReduced?9:8.5)+(portrait?1.5:0),up=(isReduced?3.4:2.9)+(portrait?.6:0);
   const px=riding?drawn.px:ZIP_LAND.x,py=riding?drawn.py:ZIP_DECK.height+ZIP_HANG,pz=riding?drawn.pz:ZIP_LAND.z;
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
   zipActions.ride=()=>{};zipStore.reset();dispose3d();phase='idle';},
 };
}
export type Zipline=ReturnType<typeof createZipline>;
