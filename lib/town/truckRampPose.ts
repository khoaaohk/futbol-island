import type {RideRamp} from './rideRamps';
/** Two axle support, with ballistic release instead of snapping off the lip. */
export function createTruckRampPose(ramps:RideRamp[]){
 const ground=ramps.filter(r=>!r.base);
 const state={height:0,pitch:0,velocity:0,airborne:false};
 function surface(x:number,z:number){let height=0;for(const r of ground){const dx=x-r.x,dz=z-r.z,along=dx*Math.sin(r.yaw)+dz*Math.cos(r.yaw),side=dx*Math.cos(r.yaw)-dz*Math.sin(r.yaw);if(along>=0&&along<=r.length&&Math.abs(side)<=r.width/2)height=Math.max(height,along/r.length*r.height);}return height;}
 function update(x:number,z:number,yaw:number,dt:number){
  if(dt<=0)return state;
  const sx=Math.sin(yaw),sz=Math.cos(yaw);
  // Sample both tire lanes, keeping the chassis above an oblique approach.
  const axle=(a:number)=>Math.max(surface(x+sx*a+sz*.83,z+sz*a-sx*.83),surface(x+sx*a-sz*.83,z+sz*a+sx*.83));
  const front=axle(1.05),rear=axle(-1.05),support=(front+rear)/2,pitch=Math.atan2(rear-front,2.1);
  const previous=state.height;
  const predicted=state.height+state.velocity*dt-10*dt*dt;
  if((!state.airborne&&Math.abs(support-previous)<.001)||support>=predicted-.015){state.height=support;state.velocity=Math.max(-8,Math.min(8,(support-previous)/dt));state.pitch=pitch;state.airborne=false;}
  else{state.height=predicted;state.velocity-=20*dt;state.airborne=true;state.pitch+=(0-state.pitch)*(1-Math.exp(-2*dt));}
  if(state.height<=0){state.height=0;state.velocity=0;state.pitch=0;state.airborne=false;}
  return state;
 }
 return {state,update};
}
