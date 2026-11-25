/**
 * Conductor Kenji in the cab (owner, Nov 24 2026: "can we see the conductor and talk to him"): ONE figure, the island's own NPC rig
 * (createPlayer + npcDress, like every townsperson; never the bean passenger mesh), in navy with a navy cap, seated on the driver's
 * seat of the leading cab (lib/town/trainConductor.ts KENJI_SEAT), seen through the windscreen and the partition window.
 * Small idles (none with reduced motion): a glance to the side now and then, and "shisa kanko", pointing ahead at the signal.
 * Heat (AGENTS.md): built on first sight; drawn only for the ridden train, or the nearest train within KENJI_RANGE m (the passengers'
 * DETAIL_RANGE) whose cab is on screen; one rig (~5 draws) at most; nothing allocated per frame.
 */
import * as T from 'three';
import {createPlayer} from './player';
import {npcSeatPose} from './npcSeatPose';
import {beanShapeOf} from './beanGearFit';
import {DEFAULT_CUSTOMIZATION} from '../town/customization';
import {npcDress} from '../town/beanLooks';
import {KENJI_NPC,KENJI_SEAT} from '../town/trainConductor';
import {kenjiWrapNpc} from '../town/trainWraps';// WRAPS (train-wraps)
import {CAR_FLOOR_Y} from '../town/trainCarModel';
import type {NpcDefinition} from '../town/npcDialogues';

export const KENJI_RANGE=45,KENJI_SEAT_LIFT=.12;
/** RIDE 3 (owner shot 45, Nov 24 2026: he filled the partition window, head at the cab roof): drawn at this share of his rig's
 *  size, seated a little further back toward the desk (KENJI_BACK m along the car's +z). */
export const KENJI_SCALE=.82,KENJI_BACK=-.1;
type Run={states:readonly unknown[];carMatrixOf(k:number,c:number,out:T.Matrix4):T.Matrix4};
export function createKenjiFigure(scene:T.Scene){
 let rig:ReturnType<typeof createPlayer>|null=null,seat:ReturnType<typeof npcSeatPose>|undefined;
 const m=new T.Matrix4(),p=new T.Vector3(),pm=new T.Matrix4(),cq=new T.Quaternion(),yq=new T.Quaternion(),dummyS=new T.Vector3(),dummyP=new T.Vector3(),UP=new T.Vector3(0,1,0),fr=new T.Frustum(),sph=new T.Sphere(),motion={facing:0,trick:undefined as ReturnType<typeof npcSeatPose>|undefined,called:0};
 const at={k:-1,x:0,y:0,z:0};let shown=false;
 function build(){
  const r=createPlayer('train-kenji','home');r.setAppearance({...DEFAULT_CUSTOMIZATION,character:KENJI_NPC.character,face:KENJI_NPC.face,clothing:KENJI_NPC.clothing,body:'balanced'});
  const d=npcDress(KENJI_NPC);d.outfit.shirt=d.outfit.shirt2=d.outfit.shorts='#1f3352';d.outfit.socks='#1f3352';d.outfit.boots='#1d1d1d';r.setBeanLook(d.look,d.outfit);
  r.root.name='train-kenji';scene.add(r.root);r.root.scale.multiplyScalar(KENJI_SCALE);seat=npcSeatPose('bench',r.profileScale,beanShapeOf(r.root));motion.trick=seat;rig=r;}
 return {
  /** Every frame after the trains moved. ridingK: the train I ride (-1). clock: seconds (the idles' rhythm). */
  update(run:Run|null,camera:T.Camera,ridingK:number,dt:number,clock:number,reduced:boolean){
   at.k=-1;if(!run){if(rig)rig.root.visible=false;shown=false;return;}
   camera.updateMatrixWorld();pm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);fr.setFromProjectionMatrix(pm);
   const cx=camera.matrixWorld.elements[12],cy=camera.matrixWorld.elements[13],cz=camera.matrixWorld.elements[14];let best=-1,bd=KENJI_RANGE;
   for(let k=0;k<run.states.length;k++){run.carMatrixOf(k,0,m);p.set(KENJI_SEAT.x,CAR_FLOOR_Y+1,KENJI_SEAT.z).applyMatrix4(m);
    const d=Math.hypot(p.x-cx,p.y-cy,p.z-cz);if(k===ridingK){best=k;break;}sph.center.copy(p);sph.radius=1.5;if(d<bd&&fr.intersectsSphere(sph)){bd=d;best=k;}}
   if(best<0){if(rig)rig.root.visible=false;shown=false;return;}
   if(!rig)build();const r=rig!;run.carMatrixOf(best,0,m);p.set(KENJI_SEAT.x,CAR_FLOOR_Y+KENJI_SEAT_LIFT,KENJI_SEAT.z+KENJI_BACK).applyMatrix4(m);
   // idles: a glance aside (~every 8 s) and pointing ahead at the signal (~every 11 s, "shisa kanko")
   const g=reduced?0:Math.sin(clock*.78),pt=reduced?0:(clock%11)/11;motion.facing=g>.86?(g-.86)*4:0;motion.called=pt>.82&&pt<.95?1:0;
   // RIDE 3 (owner shot 45: he jittered): the rig is animated in the CAR's frame (a fixed spot, facing car 0's +z plus his glance:
   // no travel speed, no turn smoothing chasing the curve), then placed rigidly with the leading car's final matrix of this frame,
   // the same matrix the car is drawn with (pitch on the grades and the curve lean included).
   r.root.visible=true;shown=true;r.update(0,0,Math.min(dt,.1),clock,reduced,motion as Parameters<typeof r.update>[5]);
   m.decompose(dummyP,cq,dummyS);r.root.quaternion.copy(cq).multiply(yq.setFromAxisAngle(UP,r.root.rotation.y));r.root.position.copy(p);
   at.k=best;at.x=p.x;at.y=p.y;at.z=p.z;},
  /** Where Kenji is drawn this frame (k -1: nowhere). */
  get at(){return at;},get shown(){return shown;},
  /** The drawn rig's root (null before the first build): Town's near-camera fade hides it for a frame. */
  get root(){return rig?rig.root:null;},
  /** His talk definition at his spot (Town's Talk slide-out). */
  npc():NpcDefinition{KENJI_NPC.x=at.x;KENJI_NPC.z=at.z;return kenjiWrapNpc(at.k,KENJI_NPC)/* WRAPS: the train's theme */;},
  dispose(){if(rig){rig.root.removeFromParent();rig.dispose();}rig=null;},
 };
}
export type KenjiFigure=ReturnType<typeof createKenjiFigure>;
