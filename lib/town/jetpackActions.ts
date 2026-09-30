import {recordExploreActivity} from './exploreActivity';
type Point={x:number;z:number};
// Parachute safety limits. A glide must always finish: after PARACHUTE_SETTLE_ASSIST s without descending or closing on
// the landing spot, steering is released and the final approach ignores props (latched until touchdown, so it always
// closes in); only if even that makes no progress for PARACHUTE_SETTLE_LIMIT s does it touch down on the (already
// validated) landing spot. PARACHUTE_MAX_AGE caps any glide (a full 180 m blast descends in ~20 s).
// Heat (code review Sep 29 2026, finding 2): the glide re-aims its landing spot only after moving PARACHUTE_REAIM_METRES or
// every PARACHUTE_REAIM_SECONDS, not every frame (findLanding can scan far rings over open sea).
export const PARACHUTE_REAIM_METRES=2,PARACHUTE_REAIM_SECONDS=.25;
export const PARACHUTE_SETTLE_ASSIST=1,PARACHUTE_SETTLE_LIMIT=2.5,PARACHUTE_MAX_AGE=60;
// A canopy may not glide into a surface taller than the rider (less 1 m of clearance), but moving onto ground no higher
// than the ground already under the rider is always allowed. Before this, the rule compared against the rider's height
// alone, so at touchdown height (floor + .5) the ground itself counted as a wall and the glide was pinned in place.
export function parachuteTooTall(floor:(x:number,z:number)=>number,from:Point,x:number,z:number,height:number){const next=floor(x,z);return next>height-1&&next>floor(from.x,from.z)+.35;}
export function createJetpackActions(){
 const state={phase:'idle' as 'idle'|'dash'|'charge'|'blast'|'parachute'|'fall',age:0,scanAge:-1,scanYaw:0,scanSpeed:0,scanRadius:0,scanIntensity:0,juggleAge:-1,startHeight:0,yaw:0,target:null as Point|null};
 let aimX=NaN,aimZ=NaN,aimAge=0,fallSpeed=0,glideVX=0,glideVZ=0,spiralX=0,spiralZ=0,spiralRadius=0,settleAge=0,bestD=Infinity,bestH=Infinity,assistAge=-1;
 const clearTricks=()=>{state.scanAge=-1;state.scanSpeed=0;state.scanRadius=0;state.scanIntensity=0;spiralX=spiralZ=spiralRadius=0;state.juggleAge=-1;};
 const parachuteAction=(action:number,yaw:number)=>{if(state.phase!=='parachute')return false;if(action===0){if(state.scanAge<0){state.scanAge=0;state.scanYaw=yaw;state.scanSpeed=.7;}}else{state.juggleAge=state.juggleAge<0?0:-1;}return true;};
 const cut=()=>{if(state.phase==='parachute'){clearTricks();state.phase='fall';state.age=0;fallSpeed=0;}};
 const crash=()=>{clearTricks();state.phase='fall';state.age=0;state.target=null;fallSpeed=0;glideVX=glideVZ=0;};
 const reset=()=>{clearTricks();aimX=aimZ=NaN;aimAge=0;settleAge=0;bestD=bestH=Infinity;assistAge=-1;state.phase='idle';state.age=0;state.target=null;glideVX=glideVZ=0;};
 function start(action:number,height:number,yaw:number,target:Point|null){if(state.phase!=='idle'||action===1&&!target)return;state.phase=action===0?'dash':'charge';state.age=0;state.startHeight=height;state.yaw=yaw;state.target=target;}
 function update(dt:number,p:Point,height:number,env:{blocked:(x:number,z:number)=>boolean;floor:(x:number,z:number)=>number;steer?:Point;scanHeld?:boolean;reducedMotion?:boolean;findLanding?:(x:number,z:number)=>Point|null}){
  if(state.phase==='idle')return {height,landed:false};state.age+=dt;if(state.scanAge>=0){state.scanAge+=dt;state.scanSpeed=env.scanHeld?Math.min(4.5,state.scanSpeed+dt*2.2):state.scanSpeed*Math.exp(-dt*7);state.scanYaw+=state.scanSpeed*dt;if(!env.scanHeld&&state.scanSpeed<.02){state.scanAge=-1;state.scanSpeed=0;}}if(state.juggleAge>=0)state.juggleAge+=dt;
  if(state.phase==='dash'){
   const distance=128*dt,steps=Math.max(1,Math.ceil(distance/.25));for(let i=0;i<steps;i++){const x=p.x+Math.sin(state.yaw)*distance/steps,z=p.z+Math.cos(state.yaw)*distance/steps;if(env.blocked(x,z)){reset();break;}p.x=x;p.z=z;}if(state.age>=.45)reset();
  }else if(state.phase==='charge'){if(state.age>=.65){state.phase='blast';state.age=0;}}
  else if(state.phase==='blast'){const t=Math.min(1,state.age/1.05);height=state.startHeight+180*t*t*(3-2*t);if(t===1){state.phase='parachute';recordExploreActivity('parachute');state.age=0;glideVX=glideVZ=0;settleAge=0;bestD=bestH=Infinity;assistAge=-1;}}
  else if(state.phase==='fall'){if(state.age<.65)return{height,landed:false};fallSpeed+=75*dt;const floor=env.floor(p.x,p.z);height=Math.max(floor,height-fallSpeed*dt);if(height<=floor){
    const landing=env.findLanding?env.findLanding(p.x,p.z):p;
    if(!landing)return {height:floor+.5,landed:false};
    p.x=landing.x;p.z=landing.z;const landingHeight=env.floor(p.x,p.z);
    reset();return{height:landingHeight,landed:true,crashed:true};
   }}
  else if(state.phase==='parachute'&&state.target){
   const blocked=(x:number,z:number)=>env.blocked(x,z)||parachuteTooTall(env.floor,p,x,z,height);
   const input=assistAge>=0?{x:0,z:0}:env.steer??{x:0,z:0},length=Math.hypot(input.x,input.z);
   const response=1-Math.exp(-dt*5);glideVX+=(input.x/Math.max(1,length)*13-glideVX)*response;glideVZ+=(input.z/Math.max(1,length)*13-glideVZ)*response;
   // Widen around the steered glide center, then return smoothly on release.
   // The height gate brings the orbit to zero before the landing approach.
   const clearance=state.scanAge>=0||spiralRadius>0?height-Math.max(env.floor(p.x,p.z),env.floor(state.target.x,state.target.z)):20,gateT=Math.max(0,Math.min(1,(clearance-8)/12)),heightGate=gateT*gateT*(3-2*gateT);
   state.scanIntensity=env.reducedMotion?0:state.scanSpeed/4.5*heightGate;
   const targetRadius=!env.reducedMotion&&env.scanHeld&&state.scanAge>=0?3.2*state.scanSpeed/4.5:0;
   spiralRadius+=(targetRadius-spiralRadius)*(1-Math.exp(-dt*(env.scanHeld?2:4)));
   state.scanRadius=spiralRadius*heightGate;
   const radius=state.scanRadius,nextSpiralX=Math.sin(state.scanYaw)*radius,nextSpiralZ=Math.cos(state.scanYaw)*radius;
   const moveX=glideVX*dt+nextSpiralX-spiralX,moveZ=glideVZ*dt+nextSpiralZ-spiralZ,steps=Math.max(1,Math.ceil(Math.hypot(moveX,moveZ)/.25));
   // Blocked glide steps slide along whichever axis stays clear, so thin poles and prop corners deflect the canopy.
   const tryStep=(x:number,z:number)=>{if(blocked(x,z))return false;p.x=x;p.z=z;return true;};
   for(let i=0;i<steps;i++){const sx=moveX/steps,sz=moveZ/steps;if(tryStep(p.x+sx,p.z+sz))continue;const slidX=tryStep(p.x+sx,p.z),slidZ=tryStep(p.x,p.z+sz);if(!slidX)glideVX=0;if(!slidZ)glideVZ=0;if(!slidX&&!slidZ)break;}
   spiralX=nextSpiralX;spiralZ=nextSpiralZ;
   if(state.scanAge<0&&spiralRadius<.001){state.scanRadius=spiralRadius=0;spiralX=spiralZ=0;}

   // Never retarget to a roof above the canopy: that used to snap the rider upward and could oscillate at roof edges.
   aimAge+=dt;if(env.findLanding&&(aimAge>=PARACHUTE_REAIM_SECONDS||!(Math.hypot(p.x-aimX,p.z-aimZ)<PARACHUTE_REAIM_METRES))){aimX=p.x;aimZ=p.z;aimAge=0;const next=env.findLanding(p.x,p.z);if(next&&env.floor(next.x,next.z)<=height)state.target=next;}
   let dx=state.target.x-p.x,dz=state.target.z-p.z,d=Math.hypot(dx,dz);const floor=env.floor(state.target.x,state.target.z);
   // The approach starts within 8 m of the landing spot's floor or of whatever the canopy is crossing (a roof it must
   // leave to reach a lower spot), so holding height over a roof can never hold the approach off.
   if(height-Math.max(floor,env.floor(p.x,p.z))<8&&d>.05){const step=Math.min(d,dt*8),x=p.x+dx/d*step,z=p.z+dz/d*step;
    // The landing spot came from findLanding (a safe touchdown), so once the hover has stalled the approach may pass props.
    if(assistAge>=0||!blocked(x,z)){p.x=x;p.z=z;}else if(!blocked(x,p.z))p.x=x;else if(!blocked(p.x,z))p.z=z;
    dx=state.target.x-p.x;dz=state.target.z-p.z;d=Math.hypot(dx,dz);}
   // Glide slope: short of the spot the canopy holds up to ~0.9 m per metre of remaining distance (capped just under the 8 m
   // approach height, never below .5 m), so a long final approach glides in instead of skimming the ground. It also stays
   // .5 m over whatever is under the rider, so a canopy short of the spot never sinks into a roof or prop it is crossing.
   const under=env.floor(p.x,p.z);height=Math.max(floor+(d>.2?Math.min(7.5,Math.max(.5,d*.9)):0),d>.2?under+.5:0,height-dt*9);
   // Time without a new lowest height or a new closest approach counts toward the settle limits; any record resets them.
   // (Records, not frame deltas: a joystick held into a pole makes the canopy shuttle back and forth without arriving.)
   const progressed=height<bestH-1e-3||d<bestD-.05;bestH=Math.min(bestH,height);bestD=Math.min(bestD,d);
   settleAge=d>.2&&!progressed?settleAge+dt:0;
   // The assist latches until touchdown, so a stalled approach cannot flicker between assisted and blocked frames.
   if(assistAge>=0)assistAge+=dt;else if(settleAge>=PARACHUTE_SETTLE_ASSIST)assistAge=0;
   if(height<=floor&&d<.2||assistAge>=0&&settleAge>=PARACHUTE_SETTLE_LIMIT||state.age>=PARACHUTE_MAX_AGE){p.x=state.target.x;p.z=state.target.z;reset();return{height:floor,landed:true};}

  }
  return {height,landed:false};
 }
 return {state,start,update,reset,cut,crash,parachuteAction};
}
