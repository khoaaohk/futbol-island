import type {BallHitTarget} from '../graphics/ballReactions';
/** A small forward cone helps thumb-stick aiming without selecting people behind the shooter. */
export function assistedShotYaw(player:{x:number;y:number;z:number},yaw:number,targets:BallHitTarget[],clear:(x:number,z:number)=>boolean=()=>true){
 let best=yaw,score=Infinity;
 for(const target of targets){const dx=target.x-player.x,dz=target.z-player.z,distance=Math.hypot(dx,dz);if(distance<.65||distance>24||Math.abs(target.y-player.y)>1.8)continue;const candidate=Math.atan2(dx,dz),delta=Math.atan2(Math.sin(candidate-yaw),Math.cos(candidate-yaw));if(Math.abs(delta)>.28)continue;
  const rank=Math.abs(delta)/.28+distance/48;if(rank>=score)continue;
  let visible=true;for(let d=.6;d<distance-.6;d+=.35){if(!clear(player.x+dx*d/distance,player.z+dz*d/distance)){visible=false;break;}}
  if(visible){score=rank;best=yaw+delta;}
 }
 return best;
}
