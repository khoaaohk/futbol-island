import {recordExploreActivity} from './exploreActivity';
type Point={x:number;z:number};
export function createJetpackActions(){
 const state={phase:'idle' as 'idle'|'dash'|'charge'|'blast'|'parachute'|'fall',age:0,scanAge:-1,scanYaw:0,scanSpeed:0,scanRadius:0,scanIntensity:0,juggleAge:-1,startHeight:0,yaw:0,target:null as Point|null};
 let fallSpeed=0,glideVX=0,glideVZ=0,spiralX=0,spiralZ=0,spiralRadius=0;
 const clearTricks=()=>{state.scanAge=-1;state.scanSpeed=0;state.scanRadius=0;state.scanIntensity=0;spiralX=spiralZ=spiralRadius=0;state.juggleAge=-1;};
 const parachuteAction=(action:number,yaw:number)=>{if(state.phase!=='parachute')return false;if(action===0){if(state.scanAge<0){state.scanAge=0;state.scanYaw=yaw;state.scanSpeed=.7;}}else{state.juggleAge=state.juggleAge<0?0:-1;}return true;};
 const cut=()=>{if(state.phase==='parachute'){clearTricks();state.phase='fall';state.age=0;fallSpeed=0;}};
 const crash=()=>{clearTricks();state.phase='fall';state.age=0;state.target=null;fallSpeed=0;glideVX=glideVZ=0;};
 const reset=()=>{clearTricks();state.phase='idle';state.age=0;state.target=null;glideVX=glideVZ=0;};
 function start(action:number,height:number,yaw:number,target:Point|null){if(state.phase!=='idle'||action===1&&!target)return;state.phase=action===0?'dash':'charge';state.age=0;state.startHeight=height;state.yaw=yaw;state.target=target;}
 function update(dt:number,p:Point,height:number,env:{blocked:(x:number,z:number)=>boolean;floor:(x:number,z:number)=>number;steer?:Point;scanHeld?:boolean;reducedMotion?:boolean;findLanding?:(x:number,z:number)=>Point|null}){
  if(state.phase==='idle')return {height,landed:false};state.age+=dt;if(state.scanAge>=0){state.scanAge+=dt;state.scanSpeed=env.scanHeld?Math.min(4.5,state.scanSpeed+dt*2.2):state.scanSpeed*Math.exp(-dt*7);state.scanYaw+=state.scanSpeed*dt;if(!env.scanHeld&&state.scanSpeed<.02){state.scanAge=-1;state.scanSpeed=0;}}if(state.juggleAge>=0)state.juggleAge+=dt;
  if(state.phase==='dash'){
   const distance=128*dt,steps=Math.max(1,Math.ceil(distance/.25));for(let i=0;i<steps;i++){const x=p.x+Math.sin(state.yaw)*distance/steps,z=p.z+Math.cos(state.yaw)*distance/steps;if(env.blocked(x,z)){reset();break;}p.x=x;p.z=z;}if(state.age>=.45)reset();
  }else if(state.phase==='charge'){if(state.age>=.65){state.phase='blast';state.age=0;}}
  else if(state.phase==='blast'){const t=Math.min(1,state.age/1.05);height=state.startHeight+180*t*t*(3-2*t);if(t===1){state.phase='parachute';recordExploreActivity('parachute');state.age=0;glideVX=glideVZ=0;}}
  else if(state.phase==='fall'){if(state.age<.65)return{height,landed:false};fallSpeed+=75*dt;const floor=env.floor(p.x,p.z);height=Math.max(floor,height-fallSpeed*dt);if(height<=floor){
    const landing=env.findLanding?env.findLanding(p.x,p.z):p;
    if(!landing)return {height:floor+.5,landed:false};
    p.x=landing.x;p.z=landing.z;const landingHeight=env.floor(p.x,p.z);
    reset();return{height:landingHeight,landed:true,crashed:true};
   }}
  else if(state.phase==='parachute'&&state.target){
   const input=env.steer??{x:0,z:0},length=Math.hypot(input.x,input.z);
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
   for(let i=0;i<steps;i++){const x=p.x+moveX/steps,z=p.z+moveZ/steps;if(env.blocked(x,z)){glideVX=glideVZ=0;break;}p.x=x;p.z=z;}
   spiralX=nextSpiralX;spiralZ=nextSpiralZ;
   if(state.scanAge<0&&spiralRadius<.001){state.scanRadius=spiralRadius=0;spiralX=spiralZ=0;}

   if(env.findLanding)state.target=env.findLanding(p.x,p.z)??state.target;
   const dx=state.target.x-p.x,dz=state.target.z-p.z,d=Math.hypot(dx,dz),floor=env.floor(state.target.x,state.target.z);
   if(height-floor<8&&d>.05){const step=Math.min(d,dt*8);const x=p.x+dx/d*step,z=p.z+dz/d*step;if(!env.blocked(x,z)){p.x=x;p.z=z;}}
   height=Math.max(floor+(d>.2?.5:0),height-dt*9);
   if(height<=floor&&d<.2){p.x=state.target.x;p.z=state.target.z;reset();return{height:floor,landed:true};}

  }
  return {height,landed:false};
 }
 return {state,start,update,reset,cut,crash,parachuteAction};
}
