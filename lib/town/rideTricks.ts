import type {TravelMode} from './travelModes';
import type {CharacterCustomization} from './customization';
export const RIDE_ACTIONS={scooter:['Spin 360','Jump'],bike:['Front wheelie','Back wheelie'],moped:['Stand up','Jump']} as const;
export const GROUND_SIGNATURES:Record<string,string>={mint:'Smooth carve',stunt:'Double spin hop',comet:'Comet corkscrew',bmx:'Bunny hop',road:'Sprint tuck',mountain:'Trail wheel lift',retro:'Style lean',delivery:'Double delivery bounce',sport:'Power wheelie'};
export const GROUND_SECONDARY:Record<string,string>={mint:'Glide hop',stunt:'Spin jump',comet:'Star hop',bmx:'Nose manual',road:'Slalom',mountain:'Rock hop',retro:'Parade stand',delivery:'Cargo balance',sport:'Stoppie'};
export function groundActionLabels(mode:'scooter'|'bike'|'moped',value:CharacterCustomization):readonly [string,string]{const variant=value[mode];return [GROUND_SIGNATURES[variant]??RIDE_ACTIONS[mode][0],GROUND_SECONDARY[variant]??RIDE_ACTIONS[mode][1]];}
export function isHeldRideAction(mode:TravelMode,variant:string,action:number){return mode==='bike'&&((!GROUND_SIGNATURES[variant])||variant==='bmx'&&action===1||variant==='mountain'&&action===0)||mode==='moped'&&variant==='sport';}
export function createRideTricks(){
 const state={mode:'walk' as TravelMode,action:0,age:0,duration:0,active:false};
 const reset=()=>{state.active=false;state.age=state.duration=0;};
 function start(mode:TravelMode,action:number){if(!['scooter','bike','moped'].includes(mode)||state.active)return;Object.assign(state,{mode,action,age:0,duration:mode==='bike'||mode==='moped'&&action===0?1.8:.95,active:true});}
 function update(dt:number,mode:TravelMode,reduced:boolean,variant='classic',held=false){
  const pose={lift:0,pitch:0,yaw:0,stand:0,roll:0};if(mode!==state.mode){reset();return pose;}if(!state.active)return pose;
  state.age+=dt;if(held&&isHeldRideAction(mode,variant,state.action))state.age=Math.min(state.age,state.duration*.5);const t=Math.min(1,state.age/state.duration),envelope=Math.sin(Math.PI*t)**2;
  if(GROUND_SIGNATURES[variant]){
   const scale=reduced?.2:1;
   if(state.action===1){
    if(variant==='mint'){pose.lift=Math.sin(Math.PI*t)*.4*scale;pose.pitch=-envelope*.12*scale;}
    if(variant==='stunt'){pose.yaw=reduced?0:Math.PI*2*(t*t*(3-2*t));pose.lift=Math.sin(Math.PI*t)*1.2*scale;}
    if(variant==='comet'){pose.lift=Math.sin(Math.PI*t)*1.35*scale;pose.pitch=Math.sin(t*Math.PI*2)*.4*scale;}
    if(variant==='bmx'){pose.pitch=envelope*.58*scale;pose.lift=.56*Math.sin(Math.abs(pose.pitch));}
    if(variant==='road')pose.roll=Math.sin(Math.PI*t*4)*envelope*.3*scale;
    if(variant==='mountain'){pose.lift=Math.sin(Math.PI*t)*.95*scale;pose.roll=Math.sin(Math.PI*t*2)*.25*scale;}
    if(variant==='retro')pose.stand=envelope*scale;
    if(variant==='delivery'){pose.roll=Math.sin(Math.PI*t*2)*envelope*.25*scale;pose.stand=envelope*.25*scale;}
    if(variant==='sport'){pose.pitch=envelope*.75*scale;pose.lift=.55*Math.sin(Math.abs(pose.pitch));}
   }else{
   if(variant==='mint')pose.roll=Math.sin(t*Math.PI*2)*envelope*.42*scale;
   if(variant==='stunt'){pose.yaw=reduced?0:Math.PI*4*(t*t*(3-2*t));pose.lift=Math.sin(Math.PI*t)*.65*scale;}
   if(variant==='comet'){pose.roll=reduced?0:Math.PI*2*(t*t*(3-2*t));pose.lift=Math.sin(Math.PI*t)*1.1*scale;}
   if(variant==='bmx'){pose.lift=Math.sin(Math.PI*t)*.85*scale;pose.pitch=Math.sin(Math.PI*t*2)*.28*scale;}
   if(variant==='road')pose.pitch=envelope*.32*scale;
   if(variant==='mountain'){pose.pitch=-envelope*.7*scale;pose.lift=.6*Math.sin(Math.abs(pose.pitch));}
   if(variant==='retro'){pose.roll=-envelope*.4*scale;pose.stand=envelope*.45*scale;}
   if(variant==='delivery')pose.lift=Math.sin(Math.PI*t*2)**2*.55*scale;
   if(variant==='sport'){pose.pitch=-envelope*.95*scale;pose.lift=.62*Math.sin(Math.abs(pose.pitch));}
   }
  }
  else if(mode==='scooter'&&state.action===0){pose.yaw=reduced?0:Math.PI*2*(t*t*(3-2*t));pose.lift=Math.sin(Math.PI*t)*(reduced?.08:.35);}
  else if(mode==='bike'){pose.pitch=(state.action===0?-1:1)*envelope*(reduced?.2:.6);pose.lift=.56*Math.sin(Math.abs(pose.pitch))+.3*(1-Math.cos(pose.pitch));}
  else if(mode==='moped'&&state.action===0)pose.stand=envelope;
  else pose.lift=4*t*(1-t)*(reduced?.16:1.35);
  if(t>=1)reset();return pose;
 }
 return {state,start,update,reset};
}
