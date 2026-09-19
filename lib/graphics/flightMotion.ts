import { MathUtils } from 'three';
export type FlightPhase = 'takeoff' | 'cruise' | 'landing';
export type FlightPose = { bob:number; pitch:number; roll:number; compression:number; thrust:number; secondary:number; phase:FlightPhase; progress:number };
const smooth=(v:number)=>{const t=MathUtils.clamp(v,0,1);return t*t*(3-2*t);};
/** Reused output. Visual-only inertia; never modifies camera or collision position. */
export function createFlightMotion(){
 const pose:FlightPose={bob:0,pitch:0,roll:0,compression:0,thrust:1,secondary:0,phase:'cruise',progress:1};
 let lastVX=0,lastVZ=0,lastYaw=0,initialized=false,lean=0,bank=0;
 return {update(dt:number,time:number,vx:number,vz:number,yaw:number,phase:FlightPhase,progress:number,reduced:boolean){
  dt=MathUtils.clamp(dt,0,.1);progress=MathUtils.clamp(progress,0,1);
  const forward=vx*Math.sin(yaw)+vz*Math.cos(yaw),lateral=vx*Math.cos(yaw)-vz*Math.sin(yaw);
  const acceleration=initialized&&dt>0?((vx-lastVX)*Math.sin(yaw)+(vz-lastVZ)*Math.cos(yaw))/dt:0;
  const yawRate=initialized&&dt>0?Math.atan2(Math.sin(yaw-lastYaw),Math.cos(yaw-lastYaw))/dt:0;
  // Cruise into the direction of travel; braking stays nearly upright.
  lean=MathUtils.damp(lean,MathUtils.clamp(Math.max(0,forward)/34*.42+acceleration*.0018,-.08,.46),7,dt);
  bank=MathUtils.damp(bank,MathUtils.clamp(-lateral*.007-yawRate*.065,-.2,.2),6,dt);
  const launch=phase==='takeoff'?Math.sin(progress*Math.PI):0;
  // Existing descent touches down at .72, then settles over the final .28.
  const impact=phase==='landing'?Math.sin(smooth((progress-.65)/.35)*Math.PI):0;
  pose.phase=phase;pose.progress=progress;pose.compression=phase==='takeoff'?.13*(1-smooth(progress/.3)):.17*impact;
  pose.thrust=phase==='takeoff'?1.45:phase==='landing'?1.15+.35*impact:1;
  pose.bob=reduced?0:phase==='cruise'?Math.sin(time*3.1)*.19+Math.sin(time*5.3)*.055:0;
  pose.pitch=reduced?lean*.5:lean+Math.sin(time*3.5)*.045-launch*.075;
  pose.roll=reduced?bank*.5:bank+Math.sin(time*2.8)*.075;
  pose.secondary=reduced?0:Math.sin(time*5.3-.7)*.035+Math.sin(time*8.1)*.012;
  lastVX=vx;lastVZ=vz;lastYaw=yaw;initialized=true;return pose;
 },reset(){initialized=false;lean=bank=0;}};
}
