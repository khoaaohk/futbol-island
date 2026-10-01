/**
 * Job action animations (Sep 30 2026, docs/island-jobs.md "Actions and animations"). Heat: everything here is event-driven and
 * bounded. A tween is a closure that runs for a fixed time and is then dropped; particles are ONE instanced mesh (a fixed pool)
 * hidden when idle. `update` does nothing when no tween or particle is alive, and nothing exists outside a running job.
 * Reduced motion: callers pass `reduced` and skip arcs/wobbles (the end state is applied at once), so the mechanics still work.
 */
import * as T from 'three';
export type Tween={t:number;dur:number;fn:(k:number)=>void;end?:()=>void};
const PARTICLES=36;
export const ease={out:(k:number)=>1-(1-k)*(1-k),inOut:(k:number)=>k<.5?2*k*k:1-2*(1-k)*(1-k)};
/** A decaying wobble: 0 at k=0 and k=1, `cycles` swings that die away. */
export const wobble=(k:number,cycles=3)=>Math.sin(k*Math.PI*2*cycles)*(1-k)*(1-k);
export function createJobFx(root:T.Object3D){
 let tweens:Tween[]=[];
 const geo=new T.BoxGeometry(.09,.09,.09),mat=new T.MeshBasicMaterial({color:'#ffffff'});
 const parts=new T.InstancedMesh(geo,mat,PARTICLES);parts.name='job-fx-particles';parts.frustumCulled=false;parts.visible=false;root.add(parts);
 const hidden=new T.Matrix4().makeScale(0,0,0),m=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),c=new T.Color();
 for(let i=0;i<PARTICLES;i++){parts.setMatrixAt(i,hidden);parts.setColorAt(i,c.set('#ffffff'));}
 type P={x:number;y:number;z:number;vx:number;vy:number;vz:number;age:number;life:number;spin:number;size:number;float:boolean};
 const live:(P|null)[]=new Array(PARTICLES).fill(null);let cursor=0,alive=0;
 /** Throw `count` particles from (x,y,z). `float`: leaves drift down slowly instead of falling like soil. */
 function burst(x:number,y:number,z:number,color:string,count=8,speed=2.2,up=2.4,float=false,size=1){
  for(let n=0;n<count;n++){const i=cursor;cursor=(cursor+1)%PARTICLES;const a=Math.random()*Math.PI*2,s=speed*(.4+Math.random()*.6);
   if(!live[i])alive++;live[i]={x,y,z,vx:Math.cos(a)*s,vy:up*(.6+Math.random()*.6),vz:Math.sin(a)*s,age:0,life:float?1.1:.6,spin:(Math.random()-.5)*14,size:size*(.7+Math.random()*.6),float};
   parts.setColorAt(i,c.set(color));}
  if(parts.instanceColor)parts.instanceColor.needsUpdate=true;parts.visible=true;
 }
 function tween(dur:number,fn:(k:number)=>void,end?:()=>void){const tw={t:0,dur:Math.max(.001,dur),fn,end};tweens.push(tw);fn(0);return tw;}
 /** Move something along a throw arc from a to b (`height` = the extra rise at the middle of the throw). */
 function arc(set:(x:number,y:number,z:number,k:number)=>void,a:{x:number;y:number;z:number},b:{x:number;y:number;z:number},height:number,dur:number,end?:()=>void){
  return tween(dur,k=>set(a.x+(b.x-a.x)*k,a.y+(b.y-a.y)*k+4*height*k*(1-k),a.z+(b.z-a.z)*k,k),end);
 }
 function update(dt:number){
  const step=Math.min(dt,.05);
  if(tweens.length){const list=tweens;tweens=[];const keep:Tween[]=[];
   for(const tw of list){tw.t+=step;const k=Math.min(1,tw.t/tw.dur);tw.fn(k);if(k<1)keep.push(tw);else tw.end?.();}
   tweens=keep.concat(tweens);}
  if(alive){for(let i=0;i<PARTICLES;i++){const p=live[i];if(!p)continue;p.age+=step;if(p.age>=p.life){live[i]=null;alive--;parts.setMatrixAt(i,hidden);continue;}
    if(p.float){p.vy-=3*step;p.vx*=.96;p.vz*=.96;if(p.vy<-.8)p.vy=-.8;}else p.vy-=9.8*step;
    p.x+=p.vx*step;p.y+=p.vy*step;p.z+=p.vz*step;const s=p.size*(1-p.age/p.life*.5);
    m.compose(new T.Vector3(p.x,p.y,p.z),q.setFromEuler(e.set(p.age*p.spin,p.age*p.spin*.7,0)),new T.Vector3(s,p.float?s*.25:s,s));parts.setMatrixAt(i,m);}
   parts.instanceMatrix.needsUpdate=true;if(!alive)parts.visible=false;}
 }
 function clear(){for(const tw of tweens)tw.end?.();tweens=[];live.fill(null);alive=0;for(let i=0;i<PARTICLES;i++)parts.setMatrixAt(i,hidden);parts.instanceMatrix.needsUpdate=true;parts.visible=false;}
 return {burst,tween,arc,update,clear,get busy(){return tweens.length>0||alive>0;},
  dispose(){clear();parts.removeFromParent();parts.dispose();geo.dispose();mat.dispose();}};
}
export type JobFx=ReturnType<typeof createJobFx>;
