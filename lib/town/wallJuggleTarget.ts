export const WALL_JUGGLE_DISTANCE=8;
/** Start facing a wall; once the drill is running, follow adjoining walls around corners. */
export function findWallJuggleTarget(player:{x:number;z:number},yaw:number,isWall:(x:number,z:number)=>boolean|number,followWalls=false){
 const angles=followWalls?[0,.26,-.26,.52,-.52,.78,-.78,1.05,-1.05,1.31,-1.31,Math.PI/2,-Math.PI/2]:[0];
 for(const offset of angles){const dx=Math.sin(yaw+offset),dz=Math.cos(yaw+offset);
  for(let i=1;i<=WALL_JUGGLE_DISTANCE/.05;i++){const distance=i*.05,x=player.x+dx*distance,z=player.z+dz*distance,wall=isWall(x,z);if(wall){if(distance>=.8)return{x,z,...(typeof wall==='number'?{top:wall}:{})};break;}}
 }
 return null;
}
