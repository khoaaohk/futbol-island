import * as T from 'three';
/** Rolling without slip, from rendered ground travel. No idle spin or Euler-axis wobble. */
export function createGroundBallRoll(radius=.19){
 const previous=new T.Vector3(),axis=new T.Vector3(),turn=new T.Quaternion();let tracking=false;
 return (ball:T.Object3D,dt:number,enabled:boolean)=>{
  const dx=ball.position.x-previous.x,dz=ball.position.z-previous.z,distance=Math.hypot(dx,dz);
  if(enabled&&tracking&&dt>0&&distance>1e-7&&distance<1.5){
   axis.set(dz/distance,0,-dx/distance);turn.setFromAxisAngle(axis,distance/radius);ball.quaternion.premultiply(turn).normalize();
  }
  previous.copy(ball.position);tracking=enabled;
 };
}
