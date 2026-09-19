export type Point = {x:number;z:number};
export const PASSER = {x:11,z:21};
export const DEFENDER = {x:11,z:15};
export type LessonPhase = 'intro' | 'watch' | 'practice' | 'passing' | 'complete';
export function passingLane(receiver:Point) {
  const dx=receiver.x-PASSER.x,dz=receiver.z-PASSER.z,length=Math.hypot(dx,dz);
  const t=Math.max(0,Math.min(1,((DEFENDER.x-PASSER.x)*dx+(DEFENDER.z-PASSER.z)*dz)/(length*length||1)));
  const clearance=Math.hypot(PASSER.x+t*dx-DEFENDER.x,PASSER.z+t*dz-DEFENDER.z);
  const onCourt=receiver.x>=3.8&&receiver.x<=18.2&&receiver.z>=6&&receiver.z<=12;
  return {open:onCourt&&length>=5&&length<=16&&clearance>1.5,clearance,onCourt};
}
