/** Allocation-free, critically damped response for bounded local joint angles/offsets.
 * Exact integration for a held target: no overshooting Euler integrator at phone frame rates.
 * Each channel owns a value and velocity in the rig's fixed-size buffer.
 */
export function poseResponse(state: Float64Array, channel: number, target: number, dt: number, rate: number, reset: boolean): number {
  const index=channel*2;
  if(reset){state[index]=target;state[index+1]=0;return target;}
  if(dt<=0)return state[index];
  const error=state[index]-target,velocity=state[index+1],impulse=velocity+rate*error,decay=Math.exp(-rate*dt);
  state[index]=target+(error+impulse*dt)*decay;
  state[index+1]=(velocity-rate*impulse*dt)*decay;
  return state[index];
}

/** Track continuous authored movement directly. Only changes of intent create an
 * offset, preserving incoming velocity and letting that offset decay analytically.
 * Six values per channel: output, velocity, previous target, target velocity, offset, offset velocity.
 */
export function inertialResponse(state:Float64Array,channel:number,target:number,dt:number,rate:number,reset:boolean,transition:boolean):number{
 const i=channel*6;
 if(reset){state[i]=state[i+2]=target;state[i+1]=state[i+3]=state[i+4]=state[i+5]=0;return target;}
 if(dt<=0)return state[i];
 rate*=.65; // Decay only the transition offset; continuous motion retains its full excursion.
 const velocity=transition?state[i+3]:(target-state[i+2])/dt;
 if(transition){state[i+4]=state[i]-target;state[i+5]=state[i+1]-velocity;}
 const error=state[i+4],impulse=state[i+5]+rate*error,decay=Math.exp(-rate*dt);
 state[i+4]=(error+impulse*dt)*decay;state[i+5]=(state[i+5]-rate*impulse*dt)*decay;
 const value=target+state[i+4];state[i+1]=(value-state[i])/dt;state[i]=value;state[i+2]=target;state[i+3]=velocity;
 return value;
}
