/** Recognize deliberate continuous circles, ignoring ordinary steering and reversals. */
export function createSpinGesture(){
 let angle:number|null=null,total=0,last=0,cooldownUntil=0;
 const reset=()=>{angle=null;total=0;last=0;};
 return {reset,update(x:number,y:number,time:number,mobile:boolean){
  if(!mobile||time<cooldownUntil||Math.hypot(x,y)<.55){reset();return false;}
  const next=Math.atan2(y,x);if(angle===null||time-last>700){angle=next;total=0;last=time;return false;}
  const delta=Math.atan2(Math.sin(next-angle),Math.cos(next-angle));angle=next;last=time;
  if(Math.abs(delta)>1.2){total=0;return false;}
  if(total*delta<0&&Math.abs(delta)>.035)total=delta;else total+=delta;
  if(Math.abs(total)>=Math.PI*9){reset();cooldownUntil=time+8000;return true;}return false;
 }};
}
