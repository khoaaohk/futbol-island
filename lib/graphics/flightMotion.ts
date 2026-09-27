import { MathUtils } from 'three';
import { createFlightPoses, ORBIT_POSE, type FlightAction, type FlightStyle } from './flightPoses';
export type FlightPhase = 'takeoff' | 'cruise' | 'landing';
export type FlightPose = { bob:number; pitch:number; roll:number; compression:number; thrust:number; secondary:number; phase:FlightPhase; progress:number; acceleration?:number; turn?:number; style?:FlightStyle };
const smooth=(v:number)=>{const t=MathUtils.clamp(v,0,1);return t*t*(3-2*t);};
/** Reused output. Visual-only inertia; never modifies camera or collision position. */
export function createFlightMotion(){
 const pose:FlightPose={bob:0,pitch:0,roll:0,compression:0,thrust:1,secondary:0,phase:'cruise',progress:1};
 let lastVX=0,lastVZ=0,lastYaw=0,initialized=false,lean=0,bank=0,drive=0,steer=0,orbitBank=0;
 const poses=createFlightPoses();
 /** Optional x/z/height/action/kind enable the expressive Superman/glide/dive/climb/hover poses (flightPoses.ts). */
 return {poses,update(dt:number,time:number,vx:number,vz:number,yaw:number,phase:FlightPhase,progress:number,reduced:boolean,x?:number,z?:number,height?:number,action:FlightAction='idle',kind='classic'){
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
  drive=MathUtils.damp(drive,MathUtils.clamp(acceleration/25,-1,1),5,dt);steer=MathUtils.damp(steer,MathUtils.clamp(yawRate/2,-1,1),7,dt);pose.acceleration=drive;pose.turn=steer;
  pose.phase=phase;pose.progress=progress;pose.compression=phase==='takeoff'?.13*(1-smooth(progress/.3)):.17*impact;
  pose.thrust=phase==='takeoff'?1.45:phase==='landing'?1.15+.35*impact:1;
  pose.bob=reduced?0:phase==='cruise'?Math.sin(time*3.1)*.19+Math.sin(time*5.3)*.055:0;
  pose.pitch=reduced?lean*.5:lean+Math.sin(time*3.5)*.045-launch*.075;
  pose.roll=reduced?bank*.5:bank+Math.sin(time*2.8)*.075;
  if(x!==undefined&&z!==undefined&&height!==undefined){
   // Expressive poses: lie flat for Superman, bank harder with the body, lift so the chest (not the feet) stays on the flight line.
   const style=poses.update(dt,x,z,height,phase,progress,steer,drive,action,kind,reduced),w=style.total;
   pose.style=w>1e-4?style:undefined;
   if(w>1e-4){
    pose.pitch=pose.pitch*(1-w)+style.pitch;
    pose.roll+=MathUtils.clamp(bank*1.3*w,-.26,.26);
    pose.bob*=1-.6*(w-style.weights[6]); // flat poses glide steadier than the upright hover bob
    pose.bob+=(1-Math.cos(pose.pitch))*.9*w;
    // Banked orbit (sustained circling): roll toward the turn centre in proportion to turn rate × speed,
    // like a coordinated turn (tan φ = v·ω/g) but softened as tanh(v·ω/28) and capped at ~31°. Slow circling
    // or hovering while turning only tips gently. Blended by the orbit weight, so straight flight is untouched.
    const o=style.weights[ORBIT_POSE];
    if(o>1e-4){
     const speed=Math.hypot(vx,vz),cap=reduced?.28:.55;
     orbitBank=MathUtils.damp(orbitBank,-cap*Math.tanh(speed*steer*2/28),4,dt);
     pose.roll=pose.roll*(1-o)+(orbitBank+(reduced?0:Math.sin(time*2.8)*.03))*o;
    }else orbitBank=pose.roll;
   }
  }else pose.style=undefined;
  pose.secondary=reduced?0:Math.sin(time*5.3-.7)*.035+Math.sin(time*8.1)*.012;
  lastVX=vx;lastVZ=vz;lastYaw=yaw;initialized=true;return pose;
 },reset(){initialized=false;lean=bank=drive=steer=orbitBank=0;poses.reset();}};
}
