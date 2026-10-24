/** Controlled touches progress up the body, then return to the feet. */
export type JuggleTouch='foot'|'knee'|'shoulder'|'head'|'around-world';
export const JUGGLE_ROUTINE:readonly JuggleTouch[]=['foot','foot','knee','knee','shoulder','head','head','shoulder','knee','foot','around-world','foot'];
const COSTUME_JUGGLE_ROUTINE:readonly JuggleTouch[]=['foot','foot','foot','foot','around-world','foot'];
/** `headTop` (bean style, PlayerRig.headTop): the ball meets the crown instead of the classic head's authored height. */
export function juggleContact(kind:JuggleTouch,side:number,head?:JuggleHead,headTop?:number){
 if(head&&kind==='head')return {x:0,y:head.top+.3,z:.03};
 if(headTop!==undefined&&kind==='head')return {x:0,y:headTop+.2,z:.03};
 return kind==='head'?{x:0,y:2.04,z:.03}:kind==='shoulder'?{x:side*.28,y:1.63,z:.06}:kind==='knee'?{x:side*.108,y:1.02,z:.4}:{x:side*.108,y:.48,z:.45};
}

import type {CharacterCustomization} from './customization';
import type {FramePoint,FrameHit} from './goalCollisions';
import {SKY_MOVE,pickSkyKick,pickSkyTrap,skyKickTouch} from './skyKeepUpMoves';
export const SHOT_WINDUP=.46,SHOT_SPEED=38,WALL_JUGGLE_DISTANCE=8;
/**
 * The island shot's physics (Town.tsx kick → walkBall 'shot'), ONE source for the island and the Konbini's indoor ball
 * (lib/konbini/konbiniBall.ts, user Oct 1 2026: "kicking inside the store … should be just as fast, with the same bouncing-around
 * physics"). Launch = speed + chargeSpeed·charge (m/s) along the facing, lift + chargeLift·charge up; gravity in m/s²; a blocked
 * axis flips with wallBounce; a landing faster than bounceMinVy bounces with floorBounce; a struck object (env.hit) returns
 * hitBounce with a hitLift hop; drag per second is rollDrag, or loftDrag while a charged shot is more than loftHeight up; the
 * flight is integrated in substeps of at most `substep` metres; it is recalled under restSpeed within restHeight of the floor,
 * or after tapAge / chargedAge seconds; the recall blends to the feet at returnRate/s for returnTime s; `lead` = the ball's
 * distance ahead of the feet while winding up.
 */
export const ISLAND_SHOT={speed:SHOT_SPEED,chargeSpeed:22,lift:3.2,chargeLift:52,gravity:13,wallBounce:.78,floorBounce:.53,bounceMinVy:.8,
 hitBounce:.42,hitLift:2,rollDrag:.33,loftDrag:.1,loftHeight:.3,substep:.12,restSpeed:2,restHeight:.3,tapAge:2,chargedAge:9,returnRate:12,returnTime:.55,lead:.65,radius:.2} as const;
const S=ISLAND_SHOT;
const JUGGLE_CONTACT=.48,WALL_GRAVITY=26,WALL_KICK_TIME=.22,WALL_RECEIVE_TIME=.14;
const WALL_HEIGHT_RATIOS=[.45,.72,.9,.6,.95];
/**
 * COUNTED keep-ups (Oct 22 2026, owner: "the kickup on the main screen should act just like the one in the kombini where it
 * counts your kickups … if holding the button the kick is higher in the air"; lib/town/keepUps.ts). `keepUp()` (the island's
 * juggle button / J) starts a counted juggle: the same routine, arcs, signature styles and wall kicks as `juggle()`, but every
 * touch after the first needs a press while the ball comes down (the falling half of the flight, KEEPUP_ARM; at a wall: the
 * back half of the trip out, or the rebound coming back). A press arms the next touch; no press by the touch → the ball drops
 * ('drop': the shot physics, then the usual recall) and the run ends. `state.streak` is the live count (Town shows the pill).
 * Holding the press lifts the touch it arms (holdLift: up to 1.6× the arc, flight time × √lift) and the wall kick's height
 * ratio (still under the wall top − 0.25 m); a lifted foot/knee arc stays at or under KEEPUP_CEILING (the Solar lob's 3.04 m),
 * so indoor ceilings are unaffected. `juggle()` keeps the old automatic loop (emotes, jobs, tests).
 */
const KEEPUP_ARM=.45,KEEPUP_CEILING=3.04;
/** Hold → lift, ONE curve for the island and the Konbini (re-exported by lib/town/keepUps.ts; it lives here because the Node
 *  tests load this file on its own): nothing for a tap (< start ms), a linear ramp to maxLift × the rise at full ms, capped. */
export const KEEPUP_HOLD={start:250,full:600,maxLift:1.6} as const;
export function holdCharge(heldMs:number){const t=(heldMs-KEEPUP_HOLD.start)/(KEEPUP_HOLD.full-KEEPUP_HOLD.start);return Number.isFinite(t)?Math.max(0,Math.min(1,t)):0;}
export const holdLift=(heldMs:number)=>1+(KEEPUP_HOLD.maxLift-1)*holdCharge(heldMs);
/**
 * SKY keep-up (Oct 24 2026, owner: "allow the keep ups to be kicked up way in the air … by holding the btn down. when kicking up
 * way higher, like above the Konbini store height and a little higher, they can run and see a red mark where the ball is going to
 * land, to chase it and try to keep the keep-up going"). A counted touch whose press has been held past KEEPUP_SKY.start ms
 * (the normal lift is already full at KEEPUP_HOLD.full) becomes a sky kick, full at KEEPUP_SKY.full (~1 s): apex from minApex to
 * apex m over the player's feet (SKY_MAX_APEX: the Konbini roof height, lib/konbini/konbiniDoors.ts KONBINI_BUILDINGS.main.h 4.72 m, + 9 m; anywhere on the island), plain
 * ballistic flight under `gravity` (softer than 9.81: a full kick hangs ~4.2 s, time to run, under 5 s), drifting 1.5-2 m (minDrift…maxDrift) away
 * ahead of the player (± sideAngle, alternating) so it never lands back on them (owner follow-up: "lands about 5 feet in front …
 * the player must run over to chase it down"). predictSkyLanding gives the landing point (Town's red mark). The catch needs the
 * player AND a press (owner: "be within a small catch radius (~1 m) … then press/tap the keep-up button again"): a press once the
 * ball is coming down under armHigh over the feet (or a press held into that) arms the catch; it happens when the ball is between
 * catchLow and catchHigh over the feet within catchRadius: +1 and the run goes on (a press held ~1 s launches the next sky kick). Landing untouched → 'drop' and the run ends, as a miss does.
 * Exact constant-gravity integration (no drag), so the prediction is the real landing.
 */
export const KONBINI_ROOF=4.72;
/** THE tunable: the full-charge apex over the player's feet, anywhere on the island (owner, Oct 24: "noticeably HIGHER than the
 *  Konbini … roughly Konbini height + 8-10 m … not crazy, hang under ~5 s"). The Konbini roof is only the height reference. */
export const SKY_MAX_APEX=KONBINI_ROOF+9;
export const KEEPUP_SKY={start:650,full:1000,apex:SKY_MAX_APEX,minApex:3.6,gravity:6.2,minDrift:1.5,maxDrift:2,sideAngle:.35,catchRadius:1,catchHigh:1.75,catchLow:.1,armHigh:4.5} as const;
export function skyCharge(heldMs:number){const t=(heldMs-KEEPUP_SKY.start)/(KEEPUP_SKY.full-KEEPUP_SKY.start);return Number.isFinite(t)&&t>0?Math.min(1,t):0;}
/** The whole-press charge for the UI ring: 0 … 1 over the full ~1 s (the normal lift fills the first part, the sky kick the rest). */
export const keepUpChargeRing=(heldMs:number)=>Number.isFinite(heldMs)?Math.max(0,Math.min(1,heldMs/KEEPUP_SKY.full)):0;
/** Landing headings tried (× sideAngle, on the alternating side): ahead-side, other side, straight, wider; then the same at the short drift. */
const SKY_TRIES=[1,-1,0,2.5,-2.5,1,-1,0,2.5,-2.5] as const;
export type SkyLanding={x:number;y:number;z:number;t:number};
/** Where (and in how many seconds) a ball at x,y,z with velocity vx,vy,vz under `gravity` meets ground(x,z) (ball-centre height). No allocation. */
export function predictSkyLanding(x:number,y:number,z:number,vx:number,vy:number,vz:number,ground:(x:number,z:number)=>number,out:SkyLanding,gravity:number=KEEPUP_SKY.gravity){
 let gy=ground(x,z),t=0;
 for(let i=0;i<5;i++){const disc=vy*vy+2*gravity*(y-gy);t=disc>0?Math.max(0,(vy+Math.sqrt(disc))/gravity):0;const ng=ground(x+vx*t,z+vz*t);if(Math.abs(ng-gy)<1e-4){gy=ng;break;}gy=ng;}
 out.x=x+vx*t;out.z=z+vz*t;out.y=gy;out.t=t;return out;
}
/** The catch zone (the touch also needs an armed press): the ball coming down, between catchLow and catchHigh over the feet, within catchRadius. */
export function inSkyCatch(bx:number,by:number,bz:number,vy:number,p:{x:number;y:number;z:number}){return vy<0&&by<=p.y+KEEPUP_SKY.catchHigh&&by>=p.y+KEEPUP_SKY.catchLow&&Math.hypot(bx-p.x,bz-p.z)<=KEEPUP_SKY.catchRadius;}
export type WallJuggleTarget={x:number;z:number;top?:number};
type Player={x:number;z:number;y:number;yaw:number};
export type JuggleHead={bottom:number;top:number;front:number;width:number};
/** Sea (Sep 29 2026, lib/town/ballSea.ts): `sea` classifies a point; `splash` fires once when a shot lands in open water. */
export const BALL_SEA_LEVEL=-.43,BALL_FLOAT_TIME=2.1;
type Environment={sea?:(x:number,z:number)=>'land'|'sea'|'edge';splash?:(x:number,y:number,z:number)=>void;juggleHead?:JuggleHead;headTop?:number;moving?:boolean;ballStyle?:CharacterCustomization['ball'];floor:(x:number,z:number)=>number;blocked:(x:number,z:number,y:number)=>boolean;impact:(x:number,y:number,z:number)=>void;strike:()=>void;receive?:()=>void;hit?:(x:number,y:number,z:number,vx:number,vz:number)=>boolean;frame?:(from:FramePoint,to:FramePoint)=>FrameHit|null};
export function createWalkBall(){
 const state={x:0,y:.2,z:0,vx:0,vy:0,vz:0,charge:0,mode:'attached' as 'attached'|'charging'|'windup'|'shot'|'return'|'juggle'|'wall-juggle'|'drop'|'sky',age:0,kick:0,yaw:0,jugglePhase:0,juggleTouch:'foot' as JuggleTouch,juggleSide:1 as -1|1,bounce:0,wallTarget:null as WallJuggleTarget|null,wallPhase:'kick' as 'kick'|'outbound'|'returning'|'receive',wallAge:0,
  /** Seconds a shot has been floating in the sea (0 = not in the water). The ball stays in 'shot' mode while it floats. */
  floating:0,
  /** Counted keep-ups (keepUp()): on, the live count (0 = no run), the current touch's lift (1 = tap, ≤ 1.6 held). */
  counted:false,streak:0,keepLift:1,
  /** Sky keep-up: the predicted ground landing (ball-centre y) and seconds left; skyRing = the live press charge 0…1 (UI ring). */
  skyX:0,skyY:0,skyZ:0,skyLeft:0,skyRing:0,
  /** The rig (lib/town/skyKeepUpMoves.ts): the held sky charge 0…1 (wind-up), the last catch's trap / re-kick and seconds since it (−1 = none). */
  skyWind:0,skyTrap:0,skyKick:-1,skyTrapSide:1 as -1|1,skyMoveAge:-1};
 let armed=false,pressing=false,pressUsed=true,keptHold=false,holdAge=0,releaseMs=0,flightAge=0,touchIndex=0,skyAge=0,feetY=0;
 const skyLand:SkyLanding={x:0,y:0,z:0,t:0};
 /** The hold (ms) the next touch uses: the live press, or the one let go (armed / kept), then cleared. */
 const consumeHold=()=>{const ms=pressing?holdAge*1000:releaseMs;releaseMs=0;return ms;};
 const consumeLift=()=>holdLift(consumeHold());
 const endRun=()=>{state.counted=false;state.streak=0;state.keepLift=1;armed=false;keptHold=false;};
 let floatFrom=0;
 let shotAge=0,impactCooldown=0,wallDirection={x:0,z:1},wallLegTime=.4,contactHeight=.85,returnAge=0,receiveHeight=.85,normalTouchCycle=-1,blendAge=1,wallKickCount=0;
 let movingJuggle=false;
 let finishTarget:{x:number;y:number;z:number}|undefined;
 const frameFrom={x:0,y:0,z:0},frameTo={x:0,y:0,z:0};
 let nextWall:WallJuggleTarget|undefined;const blendStart={x:0,y:0,z:0};
 const attach=(p:Player,floor?:Environment['floor'],contact?:{x:number;z:number})=>{
  const dx=contact?contact.x-p.x:Math.sin(p.yaw),dz=contact?contact.z-p.z:Math.cos(p.yaw),length=Math.hypot(dx,dz)||1,sx=dx/length,sz=dz/length;let support=p.y;
  const lead=contact?length:state.mode==='attached'?.56:S.lead;
  state.x=p.x+sx*lead;state.z=p.z+sz*lead;
  if(floor){
   // The ball sits ahead of the feet, often over the next stair tread.
   // Sample its footprint, and shorten the touch beside a taller wall.
   for(let reach=lead;reach>=.049;reach-=.15){
    state.x=p.x+sx*reach;state.z=p.z+sz*reach;
    support=Math.max(p.y,floor(state.x,state.z),floor(state.x+.2,state.z),floor(state.x-.2,state.z),floor(state.x,state.z+.2),floor(state.x,state.z-.2));
    if(support<=p.y+1.1)break;
   }
   if(support>p.y+1.1)support=p.y;
  }
  state.y=support+.2;state.vx=state.vy=state.vz=0;
 };
 const reset=(p:Player)=>{endRun();state.floating=0;state.mode='attached';state.charge=0;state.wallTarget=null;nextWall=undefined;finishTarget=undefined;state.wallAge=state.age=state.kick=state.jugglePhase=0;blendAge=1;normalTouchCycle=-1;wallKickCount=0;attach(p);};
 const shoot=(p:Player,yaw:number,charge=0,finish?:{x:number;y:number;z:number})=>{if((state.mode==='windup'||state.mode==='shot')&&charge<=0)return;endRun();state.mode='windup';state.charge=Math.max(0,Math.min(1,charge));state.wallTarget=null;nextWall=undefined;finishTarget=finish;state.age=0;state.kick=0;state.yaw=finish?Math.atan2(finish.x-p.x,finish.z-p.z):yaw;attach({...p,yaw:state.yaw});};
 const beginCharge=(p:Player,yaw:number)=>{if(state.mode==='shot'||state.mode==='windup')return;reset(p);state.mode='charging';state.yaw=yaw;};
 const validWall=(p:Player,target?:WallJuggleTarget)=>{if(!target)return false;const distance=Math.hypot(target.x-p.x,target.z-p.z),facing=distance?((target.x-p.x)*Math.sin(p.yaw)+(target.z-p.z)*Math.cos(p.yaw))/distance:0;return Number.isFinite(distance)&&distance>=.8&&distance<=WALL_JUGGLE_DISTANCE&&facing>=-.1&&(target.top===undefined||Number.isFinite(target.top)&&target.top>p.y+.75);};
 const regularJuggle=()=>{flightAge=0;state.keepLift=1;blendStart.x=state.x;blendStart.y=state.y;blendStart.z=state.z;blendAge=0;state.mode='juggle';state.wallTarget=null;state.wallAge=state.age=state.kick=0;state.vx=state.vy=state.vz=0;normalTouchCycle=-1;};
 const updateWallTarget=(p:Player,target?:WallJuggleTarget)=>{
  if(state.mode!=='juggle'&&state.mode!=='wall-juggle')return;
  nextWall=validWall(p,target)?{...target!}:undefined;
  if(!nextWall){if(state.mode==='wall-juggle')regularJuggle();return;}
  if(state.mode==='juggle'&&blendAge>=.35&&!(state.counted&&skyCharge(pressing?holdAge*1000:releaseMs)>0)&&(state.jugglePhase<.12||state.jugglePhase>.9&&(!state.counted||armed))){if(state.counted&&state.jugglePhase>.9){armed=false;state.streak++;state.keepLift=consumeLift();}state.mode='wall-juggle';state.wallTarget={...nextWall};state.wallPhase='kick';state.wallAge=0;state.juggleSide=1;}
 };
 const juggle=(p:Player,target?:WallJuggleTarget)=>{if(state.mode==='juggle'||state.mode==='wall-juggle'){reset(p);return;}reset(p);state.mode='juggle';state.y=p.y+JUGGLE_CONTACT;updateWallTarget(p,target);};
 /** The window where a press arms the next counted touch: the ball coming down (juggle) or heading back from the wall. */
 const inWindow=()=>state.mode==='sky'?state.vy<0&&state.y<=feetY+KEEPUP_SKY.armHigh:state.mode==='juggle'?state.jugglePhase>=KEEPUP_ARM:state.mode==='wall-juggle'&&(state.wallPhase==='returning'||state.wallPhase==='outbound'&&state.wallAge>=wallLegTime*.5);
 /** A counted touch was missed (or the ball landed): it falls off the foot with the shot physics and comes back as usual. */
 const dropKeepUp=(p:Player)=>{endRun();state.mode='drop';state.age=0;shotAge=.6;state.charge=0;finishTarget=undefined;state.wallTarget=null;nextWall=undefined;state.kick=state.jugglePhase=0;state.vx=Math.sin(p.yaw)*.8;state.vz=Math.cos(p.yaw)*.8;state.vy=Math.min(state.vy,-1.5);};
 /**
  * Press (button down / J down): from the feet (or any non-counted mode) it starts a counted run with the first touch (count 1);
  * during a run it arms the next touch when the ball is in the window, or arms it later if still held when the window opens.
  * One press at a time (key auto-repeat is ignored until keepUpRelease).
  */
 const keepUp=(p:Player,target?:WallJuggleTarget)=>{
  if(pressing)return false;pressing=true;holdAge=0;pressUsed=false;keptHold=false;
  if(state.counted&&(state.mode==='juggle'||state.mode==='wall-juggle'||state.mode==='sky')){if(inWindow()){armed=true;pressUsed=true;}return true;}
  reset(p);state.mode='juggle';state.counted=true;state.streak=1;state.keepLift=1;flightAge=0;touchIndex=0;state.y=p.y+JUGGLE_CONTACT;
  // The starting press is not spent: a tap still needs a second press, but HOLDING it from the feet arms touch 2 (lifted / a sky kick).
  pressUsed=false;updateWallTarget(p,target);return true;
 };
 /** Release: an armed touch (or a held press let go early) keeps the lift this hold reached. */
 const keepUpRelease=()=>{if(!pressing)return;pressing=false;const ms=holdAge*1000,lift=holdLift(ms);if(armed)releaseMs=ms;
  // A HELD press let go before the window (kids let go early): it still arms the next touch, with the lift it reached. A tap does not.
  else if(state.counted&&!pressUsed&&lift>1){keptHold=true;releaseMs=ms;}};
 const skyGround=(env:Environment)=>(x:number,z:number)=>{const f=env.floor(x,z);return env.sea?.(x,z)==='sea'&&f<=.25?BALL_SEA_LEVEL+.1:f+S.radius;};
 /** A counted touch held past KEEPUP_SKY.start: the ball goes way up (KEEPUP_SKY), landing 1.5-2 m away for the player to chase.
  *  Works on any ground: the landing spot is probed (a few headings, then the short drift) and must be dry land, not inside a
  *  solid and not up on a roof / ledge the player cannot reach; no valid spot → false and the caller plays a normal lifted touch. */
 const launchSky=(p:Player,env:Environment,ms:number)=>{
  const K=KEEPUP_SKY,c=skyCharge(ms),g=K.gravity,apex=K.minApex+(K.apex-K.minApex)*c,side=touchIndex%2?1:-1,ground=skyGround(env);
  const vy=Math.sqrt(2*g*Math.max(.5,p.y+apex-state.y)),flight=(vy+Math.sqrt(vy*vy+2*g*Math.max(0,state.y-p.y-S.radius)))/g;
  const mode=state.mode;state.mode='sky';
  for(let i=0;i<SKY_TRIES.length;i++){
   const drift=i<5?K.minDrift+(K.maxDrift-K.minDrift)*c:K.minDrift,angle=p.yaw+side*K.sideAngle*SKY_TRIES[i];
   // Aim at a spot `drift` m from the player (not from the ball): it never lands back on them.
   const vx=(p.x+Math.sin(angle)*drift-state.x)/flight,vz=(p.z+Math.cos(angle)*drift-state.z)/flight;
   predictSkyLanding(state.x,state.y,state.z,vx,vy,vz,ground,skyLand);
   const f=env.floor(skyLand.x,skyLand.z);
   if((env.sea?.(skyLand.x,skyLand.z)??'land')!=='land'||f>p.y+1.1||f<p.y-2.5||env.blocked(skyLand.x,skyLand.z,skyLand.y+.1))continue;
   skyAge=0;state.keepLift=holdLift(ms);state.yaw=p.yaw;state.kick=.36;armed=false;state.wallTarget=null;state.vx=vx;state.vy=vy;state.vz=vz;
   state.skyX=skyLand.x;state.skyY=skyLand.y;state.skyZ=skyLand.z;state.skyLeft=skyLand.t;env.strike();return true;
  }
  state.mode=mode;return false;
 };
 const predictSky=(env:Environment)=>{predictSkyLanding(state.x,state.y,state.z,state.vx,state.vy,state.vz,skyGround(env),skyLand);state.skyX=skyLand.x;state.skyY=skyLand.y;state.skyZ=skyLand.z;state.skyLeft=skyLand.t;};
 /** Caught coming down: +1 and back to the counted juggle (or straight into another sky kick if the press is held that long). */
 const catchSky=(p:Player,env:Environment)=>{
  state.streak++;touchIndex++;armed=false;keptHold=false;const ms=consumeHold();if(pressing)pressUsed=true;env.receive?.();
  if(skyCharge(ms)>0&&launchSky(p,env,ms))return;
  // Trap with the part that fits the height / side, then re-kick (varied, never twice in a row): the ball waits at that part for
  // the trap (flightAge starts at −trap) and leaves from the matching routine touch.
  const h=state.y-p.y,lx=(state.x-p.x)*Math.cos(p.yaw)-(state.z-p.z)*Math.sin(p.yaw);state.skyTrapSide=lx>=0?1:-1;state.skyTrap=pickSkyTrap(h);
  state.skyKick=pickSkyKick(h,state.skyTrapSide,state.streak,state.skyKick);state.skyMoveAge=0;
  const want=skyKickTouch(state.skyKick),routine=env.juggleHead?COSTUME_JUGGLE_ROUTINE:JUGGLE_ROUTINE;for(let i=0;i<routine.length;i++)if(routine[(touchIndex+i)%routine.length]===want){touchIndex+=i;break;}
  state.keepLift=holdLift(ms);state.mode='juggle';flightAge=-SKY_MOVE.trap;blendStart.x=state.x;blendStart.y=state.y;blendStart.z=state.z;blendAge=0;state.vx=state.vy=state.vz=0;state.kick=0;normalTouchCycle=-1;
 };
 const recall=()=>{if(state.mode==='shot'||state.mode==='drop'){state.mode='return';state.age=0;state.floating=0;}};
 function update(dt:number,p:Player,env:Environment){
  state.age+=dt;state.bounce=Math.max(0,state.bounce-dt);impactCooldown=Math.max(0,impactCooldown-dt);
  const impact=()=>{state.bounce=.16;if(impactCooldown<=0){impactCooldown=.09;env.impact(state.x,state.y,state.z);}};
  if(pressing)holdAge+=dt;feetY=p.y;
  state.skyRing=state.counted&&pressing?keepUpChargeRing(holdAge*1000):0;state.skyWind=state.counted&&pressing?skyCharge(holdAge*1000):0;
  if(state.skyMoveAge>=0){state.skyMoveAge+=dt;if(state.skyMoveAge>SKY_MOVE.trap+SKY_MOVE.kick||!state.counted)state.skyMoveAge=-1;}
  if(state.counted&&(pressing||keptHold)&&!pressUsed&&inWindow()){armed=true;pressUsed=true;keptHold=false;}
  if(state.mode==='sky'){
   const g=KEEPUP_SKY.gravity;skyAge+=dt;state.kick=skyAge<.3?.36+skyAge/.3*.64:0;state.jugglePhase=0;
   let x=state.x+state.vx*dt,z=state.z+state.vz*dt;const y=state.y+state.vy*dt-g/2*dt*dt;state.vy-=g*dt;
   // A wall / building in the way (up or down): it rebounds like a shot off a wall, the run keeps going and the mark moves to the
   // rebound's landing (re-predicted once per hit, not per frame).
   if(state.vx||state.vz){let hit=false;if(env.blocked(x,state.z,y)){state.vx*=-S.wallBounce;x=state.x;hit=true;}if(env.blocked(x,z,y)){state.vz*=-S.wallBounce;z=state.z;hit=true;}
    if(hit){state.x=x;state.z=z;state.y=y;impact();predictSky(env);}}
   state.x=x;state.z=z;state.y=y;state.skyLeft=Math.max(0,state.skyLeft-dt);
   if(armed&&inSkyCatch(x,y,z,state.vy,p)){catchSky(p,env);return;}
   const ground=skyGround(env)(x,z);
   // Untouched: it lands; the shot physics take it from here (bounce / splash / recall) and the run ends, like any miss.
   if(y<=ground){state.y=ground+1e-3;endRun();state.mode='drop';state.age=0;shotAge=.6;state.charge=0;state.kick=0;finishTarget=undefined;}
   return;
  }
  if(state.mode==='wall-juggle'){
   if(!validWall(p,nextWall)){regularJuggle();return;}
   state.wallAge+=dt;
   if(state.wallPhase==='kick'){state.wallTarget={...nextWall!};const distance=Math.hypot(nextWall!.x-p.x,nextWall!.z-p.z);wallDirection={x:(nextWall!.x-p.x)/distance,z:(nextWall!.z-p.z)/distance};state.yaw=Math.atan2(wallDirection.x,wallDirection.z);}
   const target=state.wallTarget!,foot={x:p.x+wallDirection.x*.45+wallDirection.z*.108*state.juggleSide,z:p.z+wallDirection.z*.45-wallDirection.x*.108*state.juggleSide};
   if(state.wallPhase==='kick'){
    const top=target.top??p.y+2.4;contactHeight=JUGGLE_CONTACT;const progress=Math.min(1,state.wallAge/WALL_KICK_TIME);state.x=foot.x;state.z=foot.z;state.y=p.y+JUGGLE_CONTACT+(contactHeight-JUGGLE_CONTACT)*Math.sin(progress*Math.PI/2);state.kick=progress*.36;state.jugglePhase=(1-progress)*.25;
    if(progress>=1){const distance=Math.max(.1,Math.hypot(target.x-foot.x,target.z-foot.z)-.2),apex=Math.min(top-.25,p.y+Math.min(30,Math.max(contactHeight+.06,(top-p.y)*WALL_HEIGHT_RATIOS[wallKickCount%WALL_HEIGHT_RATIOS.length]*(state.counted?state.keepLift:1))));wallLegTime=Math.sqrt(2*Math.max(.04,apex-p.y-contactHeight)/WALL_GRAVITY);state.vx=wallDirection.x*distance/wallLegTime;state.vz=wallDirection.z*distance/wallLegTime;state.vy=WALL_GRAVITY*wallLegTime;wallKickCount++;state.wallPhase='outbound';state.wallAge=0;env.strike();}return;
   }
   if(state.wallPhase==='receive'){
    const progress=Math.min(1,state.wallAge/WALL_RECEIVE_TIME);state.x=foot.x;state.z=foot.z;state.y=p.y+receiveHeight-(receiveHeight-JUGGLE_CONTACT)*progress;state.vx=state.vy=state.vz=0;state.kick=0;state.jugglePhase=.75+progress*.25;
    if(progress>=1){state.wallPhase='kick';state.wallAge=0;state.juggleSide=state.juggleSide===1?-1:1;}return;
   }
   state.kick=state.wallPhase==='outbound'&&state.wallAge<.28?.36+state.wallAge/.28*.64:0;state.jugglePhase=state.wallPhase==='outbound'?.25+.25*Math.min(1,state.wallAge/wallLegTime):.5+.25*Math.min(1,state.wallAge/wallLegTime);
   const steps=Math.max(1,Math.ceil(Math.hypot(state.vx,state.vz)*dt/.08)),step=dt/steps;
   for(let i=0;i<steps;i++){
    if(state.wallPhase==='returning'){const remaining=Math.max(.015,wallLegTime-returnAge);state.vx=(foot.x-state.x)/remaining;state.vz=(foot.z-state.z)/remaining;state.vy=(p.y+contactHeight-state.y+WALL_GRAVITY/2*remaining*remaining)/remaining;returnAge+=step;}
    const x=state.x+state.vx*step,z=state.z+state.vz*step,y=state.y+state.vy*step-WALL_GRAVITY/2*step*step;state.vy-=WALL_GRAVITY*step;
    const reachedWall=(target.x-x)*wallDirection.x+(target.z-z)*wallDirection.z<=.2;
    if(state.wallPhase==='outbound'&&(env.blocked(x,z,y)||reachedWall)){state.vx=-state.vx;state.vz=-state.vz;state.wallPhase='returning';state.wallAge=0;returnAge=0;state.y=y;impact();}
    else{if(env.blocked(x,z,y)){impact();regularJuggle();return;}state.x=x;state.z=z;state.y=y;}
    if(env.hit?.(state.x,state.y,state.z,state.vx,state.vz)){impact();regularJuggle();return;}
    const received=(state.x-foot.x)*wallDirection.x+(state.z-foot.z)*wallDirection.z<=.06;
    if(state.wallPhase==='returning'&&(received||returnAge>=wallLegTime)){if(state.counted){if(!armed){dropKeepUp(p);return;}armed=false;state.streak++;touchIndex++;const ms=consumeHold();if(skyCharge(ms)>0&&launchSky(p,env,ms))return;state.keepLift=holdLift(ms);}receiveHeight=state.y-p.y;state.wallPhase='receive';state.wallAge=0;state.vx=state.vy=state.vz=0;env.receive?.();return;}
    if(state.y<env.floor(state.x,state.z)+.2){state.y=env.floor(state.x,state.z)+.2;impact();if(state.counted)dropKeepUp(p);else regularJuggle();return;}
   }
   if(state.wallAge>2)regularJuggle();return;
  }
  if(state.mode==='charging'){attach(p,env.floor);state.yaw=p.yaw;state.charge=Math.max(0,Math.min(1,(state.age-.18)/1.8));state.kick=0;return;}
  if(state.mode==='attached'){attach(p,env.floor);state.kick=0;return;}
  if(state.mode==='juggle'){
   // A counted run only re-blends when walking starts / stops (no free touch); the automatic loop restarts as before.
   if(movingJuggle!==!!env.moving){movingJuggle=!!env.moving;if(state.counted){blendStart.x=state.x;blendStart.y=state.y;blendStart.z=state.z;blendAge=0;}else regularJuggle();}
   attach(p);const style=env.ballStyle,period=style==='frost'?.8:style==='solar'?1.2:1.05;let cycle=state.age/period;
   if(state.counted){flightAge+=dt;const flight=period*Math.sqrt(state.keepLift);
    if(flightAge>=flight){if(!armed){dropKeepUp(p);return;}armed=false;flightAge-=flight;touchIndex++;state.streak++;const ms=consumeHold();if(skyCharge(ms)>0&&launchSky(p,env,ms))return;state.keepLift=holdLift(ms);}
    cycle=touchIndex+Math.min(.999,Math.max(0,flightAge)/(period*Math.sqrt(state.keepLift)));}
   const phase=cycle%1,touch=Math.floor(cycle),side=touch%2?1:-1;
   const routine=env.juggleHead?COSTUME_JUGGLE_ROUTINE:JUGGLE_ROUTINE;
   state.jugglePhase=phase;state.juggleSide=side;state.juggleTouch=movingJuggle?'foot':routine[touch%routine.length];
   const from=juggleContact(state.juggleTouch,side,env.juggleHead,env.headTop),to=juggleContact(movingJuggle?'foot':routine[(touch+1)%routine.length],-side,env.juggleHead,env.headTop),blend=phase*phase*(3-2*phase);
   // Signature juggles (equipmentActions): Cosmic "Orbital juggle" loops the ball once around a small horizontal orbit per touch
   // (zero offset at both contacts, so touches still meet the boot/knee/head); Solar "Solar flare juggle" is a 1.6 m lob, about the
   // real rise for its 1.2 s touch, from the boot and knee only (shoulder/head touches keep 1 m, so the highest point stays the
   // previous 3.04 m and indoor ceilings are unaffected). Around-the-world keeps its own low arc. A few trig ops per frame, no allocations.
   const orbit=style==='cosmic'&&state.juggleTouch!=='around-world'?.28:0,angle=phase*Math.PI*2;
   const x=from.x+(to.x-from.x)*blend+orbit*side*Math.sin(angle),z=from.z+(to.z-from.z)*blend+orbit*.5*(1-Math.cos(angle));
   state.x=p.x+Math.cos(p.yaw)*x+Math.sin(p.yaw)*z;state.z=p.z-Math.sin(p.yaw)*x+Math.cos(p.yaw)*z;
   const arc=state.juggleTouch==='around-world'?.5:style==='solar'?(from.y<1.5?1.6:1):style==='frost'?.5:.7,high=Math.max(from.y,to.y);
   state.y=p.y+from.y+(to.y-from.y)*phase+4*phase*(1-phase)*(state.counted&&state.keepLift>1?Math.min(arc*state.keepLift,Math.max(arc,KEEPUP_CEILING-high)):arc);
   blendAge+=dt;if(blendAge<.35){const t=blendAge/.35,blend=t*t*(3-2*t);state.x=blendStart.x+(state.x-blendStart.x)*blend;state.y=blendStart.y+(state.y-blendStart.y)*blend;state.z=blendStart.z+(state.z-blendStart.z)*blend;}
   // Keep foot-juggle arcs clear of the plush face.
   if(env.juggleHead){const h=env.juggleHead,cy=(h.top+h.bottom)/2,ry=(h.top-h.bottom)/2+.32,rx=h.width+.32,rz=h.front+.32,dx=state.x-p.x,dz=state.z-p.z;
    const localX=dx*Math.cos(p.yaw)-dz*Math.sin(p.yaw),localZ=dx*Math.sin(p.yaw)+dz*Math.cos(p.yaw),height=(state.y-p.y-cy)/ry;
    const remaining=1-height*height-(localX/rx)**2;
    if(remaining>0){const safeZ=Math.sqrt(remaining)*rz;if(localZ<safeZ){state.x+=Math.sin(p.yaw)*(safeZ-localZ);state.z+=Math.cos(p.yaw)*(safeZ-localZ);}}
   }
   state.y=Math.max(p.y+JUGGLE_CONTACT,state.y);if(touch!==normalTouchCycle&&blendAge>=.35){normalTouchCycle=touch;env.receive?.();}return;
  }
  if(state.mode==='windup'){attach({...p,yaw:state.yaw},env.floor);state.kick=Math.min(.36,state.age/SHOT_WINDUP*.36);if(state.age<SHOT_WINDUP)return;state.mode='shot';shotAge=0;state.age=0;state.vx=Math.sin(state.yaw)*(S.speed+S.chargeSpeed*state.charge);state.vz=Math.cos(state.yaw)*(S.speed+S.chargeSpeed*state.charge);state.vy=S.lift+S.chargeLift*state.charge;
   if(finishTarget){
    const dx=finishTarget.x-state.x,dz=finishTarget.z-state.z,d=Math.hypot(dx,dz),speed=S.speed+S.chargeSpeed*state.charge;
    const duration=-Math.log(Math.max(.01,1-.1*d/speed))/.1;
    state.vx=dx/Math.max(.001,d)*speed;state.vz=dz/Math.max(.001,d)*speed;
    state.vy=(finishTarget.y-state.y)/Math.max(.05,duration)+6.5*duration;
   }
   env.strike();}
  if(state.mode==='return'){const blend=1-Math.exp(-dt*S.returnRate);state.x+=(p.x+Math.sin(p.yaw)*S.lead-state.x)*blend;state.z+=(p.z+Math.cos(p.yaw)*S.lead-state.z)*blend;state.y+=(p.y+S.radius-state.y)*blend;state.kick=0;if(state.age>S.returnTime)reset(p);return;}
  // Floating in the sea: a slow drift and a small bob, then back to the player (sooner if they walk away). Runs only while wet.
  if(state.floating>0){state.floating+=dt;const damp=Math.exp(-1.6*dt);state.vx*=damp;state.vz*=damp;state.kick=0;
   const x=state.x+state.vx*dt,z=state.z+state.vz*dt;if(env.sea?.(x,z)==='sea'){state.x=x;state.z=z;}else state.vx=state.vz=0;
   state.y=BALL_SEA_LEVEL+.1+Math.sin(state.floating*3.4)*.05;
   if(state.floating>BALL_FLOAT_TIME||Math.hypot(state.x-p.x,state.z-p.z)>floatFrom+4)recall();return;}
  shotAge+=dt;state.kick=shotAge<.6?.36+shotAge/.6*.64:0;
  const steps=Math.max(1,Math.ceil(Math.hypot(state.vx,state.vz)*dt/S.substep)),step=dt/steps;
  for(let i=0;i<steps;i++){
   if(env.frame){
    frameFrom.x=state.x;frameFrom.y=state.y;frameFrom.z=state.z;
    frameTo.x=state.x+state.vx*step;frameTo.y=state.y+(state.vy-S.gravity*step)*step;frameTo.z=state.z+state.vz*step;
    const hit=env.frame(frameFrom,frameTo);
    if(hit){const dot=state.vx*hit.nx+state.vy*hit.ny+state.vz*hit.nz;
     state.vx-=1.72*dot*hit.nx;state.vy-=1.72*dot*hit.ny;state.vz-=1.72*dot*hit.nz;
     state.x=hit.x;state.y=hit.y;state.z=hit.z;finishTarget=undefined;impact();continue;
    }
   }
   const x=state.x+state.vx*step;if(env.blocked(x,state.z,state.y)){state.vx*=-S.wallBounce;impact();}else state.x=x;
   const z=state.z+state.vz*step;if(env.blocked(state.x,z,state.y)){state.vz*=-S.wallBounce;impact();}else state.z=z;
   if(env.hit?.(state.x,state.y,state.z,state.vx,state.vz)){state.vx*=-S.hitBounce;state.vz*=-S.hitBounce;state.vy=S.hitLift;impact();}
   state.vy-=S.gravity*step;state.y+=state.vy*step;let floor=env.floor(state.x,state.z)+S.radius;
   const ground=env.sea?.(state.x,state.z)??'land';if(ground==='edge'){recall();return;}
   if(ground==='sea'&&floor<=.25){floor=BALL_SEA_LEVEL+.1;if(state.y<floor){state.y=floor;state.vx*=.12;state.vz*=.12;state.vy=0;state.floating=1e-3;floatFrom=Math.hypot(state.x-p.x,state.z-p.z);finishTarget=undefined;env.splash?.(state.x,BALL_SEA_LEVEL,state.z);return;}continue;}
   if(state.y<floor){state.y=floor;if(state.vy<-S.bounceMinVy){state.vy=-state.vy*S.floorBounce;impact();}else state.vy=0;}
  }
  const drag=Math.exp(-(finishTarget||state.charge>0&&state.y>env.floor(state.x,state.z)+S.loftHeight?S.loftDrag:S.rollDrag)*dt);state.vx*=drag;state.vz*=drag;
  if(shotAge>(state.charge>0?S.chargedAge:S.tapAge)||Math.hypot(state.x-p.x,state.z-p.z)>(state.charge>0?360:65)||Math.hypot(state.vx,state.vz)<S.restSpeed&&state.y<=env.floor(state.x,state.z)+S.restHeight)recall();
 }
 const syncDribble=(p:Player,contact:{x:number;z:number},floor:Environment['floor'])=>{if(state.mode==='attached')attach(p,floor,contact);};
 return {state,reset,beginCharge,shoot,juggle,keepUp,keepUpRelease,get keepUpHeld(){return pressing;},updateWallTarget,recall,update,syncDribble};
}
