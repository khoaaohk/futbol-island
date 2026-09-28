import * as T from 'three';

/**
 * The low shoreline camera for live fishing (docs/fishing.md, framing reference docs/fishing-visuals-ref.png).
 * Camera-only framing adjustment; fishing visuals do not move this camera. Applied by Town.tsx right after the follow camera
 * (like vending.applyCamera); idle cost when not fishing: one early return.
 *
 * Framing target: from out over the water and off to one side, looking back at the angler. Landscape/desktop: the angler
 * sits in the upper-left third, the float is clear in the lower half, water fills the bottom. Portrait phones look more
 * straight back along the line (and from further) so the angler and the float both fit between the HUD elements.
 */
const easeInOut=(t:number)=>t<.5?2*t*t:1-(-2*t+2)**2/2;
export const CAMERA_IN_S=.9,CAMERA_OUT_S=.8;
type P={x:number;z:number};

export function createFishingCamera(){
 let t=0,dir:0|1|-1=0,arrived:(()=>void)|null=null,aspect=0,shot={stand:{x:0,z:0} as P,d:{x:0,z:1} as P,D:6},nudge:{lift?:number;out?:number;look?:number}={};
 const pos=new T.Vector3(),look=new T.Vector3(),follow=new T.Vector3(),mix=new T.Vector3(),viewDir=new T.Vector3(-16,-23,-33).normalize();
 const oFrom=new T.Vector3(),oTo=new T.Vector3(),v=new T.Vector3(),fwd=new T.Vector3(0,0,1),qa=new T.Quaternion(),qb=new T.Quaternion();
 function aim(a:number){
  aspect=a;const {stand,d,D}=shot,side={x:-d.z,z:d.x},k=T.MathUtils.clamp(a,.4,1.6),portrait=Math.max(0,1-k);
  const out=D*.75+4.5+portrait*(D*1.1+5)+(nudge.out??0),across=(D*.45+2.6)*T.MathUtils.clamp((k-.5)*2,0,1),lift=3.1+D*.1+portrait*2.2+(nudge.lift??0),f=.45-portrait*.12+portrait*(nudge.lift??0)*.14;
  look.set(stand.x+d.x*D*f,.25+portrait*.3+(nudge.look??0)*(1-portrait),stand.z+d.z*D*f);
  pos.set(look.x+d.x*out+side.x*across,lift,look.z+d.z*out+side.z*across);
 }
 return {
  /** Ease in toward the shot for an angler at `stand` casting along `d` (unit) to distance `D`; `onArrive` fires once there. */
  begin(stand:P,d:P,D:number,onArrive?:()=>void,spotNudge:{lift?:number;out?:number;look?:number}={}){shot={stand:{...stand},d:{...d},D};nudge=spotNudge;aim(aspect||1.6);dir=1;arrived=onArrive??null;},
  /** Ease back to the normal follow camera. */
  end(){dir=-1;arrived=null;},
  get easing(){return dir!==0||t>0;},
  /** Blend the already-placed follow camera toward the shot (an orbit: focus, direction and distance are blended). */
  apply(camera:T.PerspectiveCamera,dt:number,reduced:boolean){
   if(dir===0&&t===0)return false;
   if(Math.abs(camera.aspect-aspect)>.01)aim(camera.aspect);
   const step=Math.min(dt,.05);t=reduced?(dir>=0?1:0):T.MathUtils.clamp(t+(dir>=0?step/CAMERA_IN_S:-step/CAMERA_OUT_S),0,1);
   const k=easeInOut(t),hit=viewDir.y<-1e-3?-camera.position.y/viewDir.y:40;follow.copy(camera.position).addScaledVector(viewDir,Math.min(hit,80));
   mix.lerpVectors(follow,look,k);oFrom.copy(camera.position).sub(follow);oTo.copy(pos).sub(look);const len=T.MathUtils.lerp(oFrom.length(),oTo.length(),k);
   qa.setFromUnitVectors(fwd,oFrom.normalize());qb.setFromUnitVectors(fwd,oTo.normalize());qa.slerp(qb,k);
   camera.position.copy(mix).addScaledVector(v.copy(fwd).applyQuaternion(qa),len);camera.lookAt(mix);
   if(t>=1&&arrived){const fn=arrived;arrived=null;fn();}
   if(dir<0&&t<=0)dir=0;
   return true;
  },
 };
}
