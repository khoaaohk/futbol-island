/**
 * East Jetty lighthouse ladder (Oct 26 2026; owner: "add a simple LADDER on one side of the lighthouse tower going up to the top
 * gallery … far less visual busyness than the removed spiral"). A straight, slim, white ladder stands off the tower's camera
 * side (bearing LADDER.bearing, south-south-east: the fixed follow camera looks at it, so the climber is never behind the tower
 * and the camera never needs to pass the tower), from the plaza to a gate in the gallery railing.
 *
 * Pure and allocation-free: createLadder() is one state machine per player that rooftopTravel.ts runs at the start of each
 * walking tick; while it owns the player (phase ≠ 'off') rooftopTravel's normal walking is skipped. Town.tsx reads `state` for
 * the climbing pose (lib/graphics/ladderPose.ts), the facing, sounds and the Climb / Climb down prompt.
 *
 * - Get on at the foot: walk to it and push the stick toward the tower (screen-up), or tap Climb. Rides cannot climb: pushing a
 *   ride into the foot raises `rideBlocked` (Town says "Park your ride to climb") and nothing else happens.
 * - On the ladder: stick up climbs, down descends, speed follows the stick. HOLDING down (firmly, > LADDER.slideHold s) slides:
 *   hands on the side rails, the speed ramps to LADDER.slideMax; let go and the hands grip again (a quick brake).
 * - At the top: step through the gate onto the gallery (topOut). From the gallery: at the gate, push out (screen-down) or tap
 *   Climb down: you back out through the gate onto the ladder (topIn), facing it, and climb down.
 * - At the foot: a short landing (a squat after a fast slide), then you step back onto the plaza.
 */
import {LIGHTHOUSE as L} from './lighthouseGallery';

export type LadderPhase='off'|'mount'|'climb'|'slide'|'topOut'|'topIn'|'land';
const B=L.openAt;// the railing's gate (lighthouseGallery.ts)
export const LADDER={
 /** Bearing of the ladder round the tower (radians: 0 = +x east, π/2 = +z south); outward unit normal (nx, nz). */
 bearing:B,nx:Math.cos(B),nz:Math.sin(B),
 /** The rails' plane (m from the axis: just outside the 3.2 m gallery deck), half the rail spacing, rung spacing (m). */
 r:L.ladderR,half:L.ladderHalf,rungStep:.3,
 /** How far out from the rails the climber's root stands (m), where you stand to get on (m from the axis), the gate's half
  *  width in the gallery railing (radians: 0.9 m at 3.2 m). */
 standOff:.34,footR:4.25,gateHalf:L.openHalf,
 /** Climb speed at full stick (m/s), the slide's top speed and ramp (m/s, m/s²), how long down is held before a slide (s). */
 climbSpeed:1.8,slideMax:7,slideAccel:8,slideHold:.35,
 /** Phase lengths (s): getting on at the foot, stepping out onto / back off the gallery, the landing (a fast slide's is longer). */
 mountTime:.3,topTime:.7,landTime:.3,landSlideTime:.55,
 /** The step-out point on the gallery (m from the axis). */
 deckR:2.5,
 /** The rails stand this far above the gallery deck at the gate (grab handles). */
 railAbove:L.ladderAbove,
} as const;
const A=LADDER;
const clamp=(v:number,a:number,b:number)=>v<a?a:v>b?b:v;
/** The climber's root on the ladder (x, z): off the rails toward the plaza. */
export const ladderX=L.cx+A.nx*(A.r+A.standOff),ladderZ=L.cz+A.nz*(A.r+A.standOff);
/** Where you stand to get on, and the gate's middle on the gallery. */
export const footX=L.cx+A.nx*A.footR,footZ=L.cz+A.nz*A.footR,gateX=L.cx+A.nx*A.deckR,gateZ=L.cz+A.nz*A.deckR;
/** Facing toward the tower (the rig's heading: x = sin, z = cos). */
export const LADDER_FACING=Math.atan2(-A.nx,-A.nz);
/** Near enough the foot to get on (height under 0.4 m). */
export const nearLadderFoot=(x:number,z:number,h:number,reach=.8)=>h<.4&&Math.hypot(x-footX,z-footZ)<reach;
/** On the gallery by the gate (at the deck's height). */
export function atLadderGate(x:number,z:number,h:number,reach=.95){return Math.abs(h-L.top)<.05&&Math.hypot(x-gateX,z-gateZ)<reach;}
/** Is the bearing of (dx, dz) from the axis inside the railing's gate (shrunk by m radians)? */
export function inGate(dx:number,dz:number,m=0){let a=Math.atan2(dz,dx)-B;a-=Math.PI*2*Math.round(a/(Math.PI*2));return Math.abs(a)<=A.gateHalf-m;}
export type LadderState={phase:LadderPhase;y:number;speed:number;t:number;cycle:number;holdDown:number;impact:number;
 /** Where a phase started (x, z) and the tick's progress through mount / topOut / topIn / land (0…1). */
 fromX:number;fromZ:number;k:number;
 /** Bumped when a ride pushes into the foot (Town says "Park your ride to climb"); a rung was passed (sound); a slide began. */
 rideBlocked:number;rungs:number;slides:number;landed:number};

export function createLadder(){
 const state:LadderState={phase:'off',y:0,speed:0,t:0,cycle:0,holdDown:0,impact:0,fromX:0,fromZ:0,k:0,rideBlocked:0,rungs:0,slides:0,landed:0};
 let request=false,rideHeld=false,lastRung=0;
 const begin=(phase:LadderPhase,x:number,z:number)=>{state.phase=phase;state.t=0;state.k=0;state.fromX=x;state.fromZ=z;state.speed=0;state.holdDown=0;};
 /** The stick's push toward the tower (+1) or away from it (−1), scaled by how far it is pushed (≤ 1), from a world-space input. */
 const axisOf=(ix:number,iz:number)=>{const l=Math.hypot(ix,iz);return l<1e-6?0:clamp(-(ix*A.nx+iz*A.nz)/l,-1,1)*Math.min(1,l);};
 /** Runs one tick. Returns true while the ladder owns the player (p and the returned height are set; v is zeroed). */
 function step(dt:number,p:{x:number;z:number},v:{x:number;z:number},ix:number,iz:number,mode:string,height:number,falling:boolean):boolean{
  // Getting on needs the stick MOSTLY toward the tower at the foot (or out through the gate at the top): walking past never does.
  const axis=axisOf(ix,iz),push=Math.min(1,Math.hypot(ix,iz)),aim=push>1e-6?axis/push:0;
  if(state.phase==='off'){
   const req=request;request=false;
   if(falling)return false;
   if(mode!=='walk'){const pushing=nearLadderFoot(p.x,p.z,height,1.4)&&aim>.7&&push>.3;if(pushing&&!rideHeld)state.rideBlocked++;rideHeld=pushing;return false;}
   rideHeld=false;
   if(nearLadderFoot(p.x,p.z,height,req?1.6:.8)&&(req||aim>.7&&push>.3)){begin('mount',p.x,p.z);state.y=0;state.impact=0;}
   else if(atLadderGate(p.x,p.z,height,req?1.4:.95)&&(req||aim<-.7&&push>.3)){begin('topIn',p.x,p.z);state.y=L.top;state.impact=0;}
   else return false;
  }
  v.x=v.z=0;state.t+=dt;
  switch(state.phase){
   case 'mount':{const k=state.k=clamp(state.t/A.mountTime,0,1);p.x=state.fromX+(ladderX-state.fromX)*k;p.z=state.fromZ+(ladderZ-state.fromZ)*k;state.y=0;if(k>=1)begin('climb',ladderX,ladderZ);break;}
   case 'topIn':{const k=state.k=clamp(state.t/A.topTime,0,1),e=k*k*(3-2*k);p.x=state.fromX+(ladderX-state.fromX)*e;p.z=state.fromZ+(ladderZ-state.fromZ)*e;state.y=L.top;if(k>=1){begin('climb',ladderX,ladderZ);state.y=L.top-.02;}break;}
   case 'topOut':{const k=state.k=clamp(state.t/A.topTime,0,1),e=k*k*(3-2*k);p.x=ladderX+(gateX-ladderX)*e;p.z=ladderZ+(gateZ-ladderZ)*e;state.y=L.top;
    if(k>=1){state.phase='off';state.landed++;return false;}break;}
   case 'climb':{p.x=ladderX;p.z=ladderZ;
    if(axis>.15){state.holdDown=0;state.speed=A.climbSpeed*axis;}
    else if(axis<-.15){state.holdDown+=dt;state.speed=A.climbSpeed*axis;if(state.holdDown>A.slideHold&&axis<-.6&&state.y>.6){state.phase='slide';state.slides++;}}
    else{state.holdDown=0;state.speed=0;}
    const y0=state.y;state.y=clamp(state.y+state.speed*dt,0,L.top);state.cycle+=(state.y-y0)/(2*A.rungStep);// signed: a planted foot stays on its rung both ways (ladderPose.ts)
    if(state.y>=L.top&&state.speed>0){begin('topOut',ladderX,ladderZ);state.y=L.top;}
    else if(state.y<=0&&state.speed<0){state.impact=0;begin('land',ladderX,ladderZ);state.y=0;}
    break;}
   case 'slide':{p.x=ladderX;p.z=ladderZ;
    if(axis<-.15)state.speed=Math.max(-A.slideMax,state.speed-A.slideAccel*dt);
    else{state.speed=Math.min(0,state.speed+16*dt);if(state.speed===0){state.phase='climb';state.holdDown=0;}}
    state.y=Math.max(0,state.y+state.speed*dt);
    if(state.y<=0){state.impact=clamp(-state.speed/A.slideMax,0,1);begin('land',ladderX,ladderZ);state.y=0;}
    break;}
   case 'land':{const dur=state.impact>.3?A.landSlideTime:A.landTime,k=state.k=clamp(state.t/dur,0,1);p.x=ladderX+(footX-ladderX)*k*k;p.z=ladderZ+(footZ-ladderZ)*k*k;state.y=0;
    if(k>=1){state.phase='off';state.landed++;return false;}break;}
  }
  const rung=Math.floor(state.y/A.rungStep);if(rung!==lastRung){if(state.phase==='climb')state.rungs++;lastRung=rung;}
  return true;
 }
 return {state,step,
  /** The Climb / Climb down button: get on at the next tick when near the foot or the gate. */
  request(){request=true;},
  /** Leave the ladder at once (a ride or Fly was chosen): the caller owns the player from here. */
  cancel(){if(state.phase!=='off'){state.phase='off';state.speed=0;}},
  get active(){return state.phase!=='off';}};
}
export type Ladder=ReturnType<typeof createLadder>;
