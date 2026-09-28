import * as T from 'three';

/**
 * A small eased "shot" camera for the island (assistant-referee replays): blends the already-placed follow
 * camera toward a fixed framing and back, like the fishing/vending cameras. Applied by Town.tsx right after the follow camera.
 * Idle cost: one early return. The framing is recomputed only when the viewport aspect changes (portrait phones get a wider
 * field of view so the subject fits between the HUD elements). The camera's own fov is restored exactly when the shot ends.
 */
export type Shot={eye:T.Vector3Like;target:T.Vector3Like;fov:number;
 /** Optional waypoint the camera passes through on the way in (e.g. a doorway), so it never cuts through a roof. */
 via?:T.Vector3Like};
const easeInOut=(t:number)=>t<.5?2*t*t:1-(-2*t+2)**2/2;
const viewDir=new T.Vector3(-16,-23,-33).normalize();

export function createShotCamera(inSeconds=1.1,outSeconds=.9){
 let t=0,dir:0|1|-1=0,frame:((aspect:number)=>Shot)|null=null,shot:Shot|null=null,aspect=0,baseFov=0,arrived:(()=>void)|null=null,left:(()=>void)|null=null;
 const eye=new T.Vector3(),target=new T.Vector3(),via=new T.Vector3(),from=new T.Vector3(),look=new T.Vector3(),a=new T.Vector3(),b=new T.Vector3();
 function aim(nextAspect:number){if(!frame)return;aspect=nextAspect;shot=frame(nextAspect);eye.copy(shot.eye as T.Vector3);target.copy(shot.target as T.Vector3);if(shot.via)via.copy(shot.via as T.Vector3);}
 return {
  /** Ease in to `framing(aspect)`; `onArrive` fires once, when the shot is fully in. */
  begin(framing:(aspect:number)=>Shot,onArrive?:()=>void){frame=framing;aim(aspect||1.6);dir=1;arrived=onArrive??null;left=null;},
  /** Ease back to the follow camera; `onLeft` fires once, when the follow camera has control again. */
  end(onLeft?:()=>void){if(dir===0&&t===0){onLeft?.();return;}dir=-1;arrived=null;left=onLeft??null;},
  get active(){return dir!==0||t>0;},
  get progress(){return t;},
  apply(camera:T.PerspectiveCamera,dt:number,reduced:boolean){
   if(dir===0&&t===0)return false;
   if(!baseFov)baseFov=camera.fov;
   if(Math.abs(camera.aspect-aspect)>.01)aim(camera.aspect);
   const step=Math.min(dt,.05);t=reduced?(dir>=0?1:0):T.MathUtils.clamp(t+(dir>=0?step/inSeconds:-step/outSeconds),0,1);
   const k=easeInOut(t);
   // Where the follow camera is looking (its ground point), blended toward the shot's target.
   const hit=viewDir.y<-1e-3?-camera.position.y/viewDir.y:40;look.copy(camera.position).addScaledVector(viewDir,Math.min(hit,80)).lerp(target,k);
   from.copy(camera.position);
   if(shot?.via){a.lerpVectors(from,via,k);b.lerpVectors(via,eye,k);camera.position.lerpVectors(a,b,k);}else camera.position.lerpVectors(from,eye,k);
   camera.lookAt(look);
   const fov=T.MathUtils.lerp(baseFov,shot?.fov??baseFov,k);if(Math.abs(camera.fov-fov)>1e-3){camera.fov=fov;camera.updateProjectionMatrix();}
   if(t>=1&&arrived){const fn=arrived;arrived=null;fn();}
   if(dir<0&&t<=0){dir=0;if(camera.fov!==baseFov){camera.fov=baseFov;camera.updateProjectionMatrix();}baseFov=0;const fn=left;left=null;fn?.();}
   return true;
  },
 };
}
