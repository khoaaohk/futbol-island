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
import {CAR_FLOOR_Y} from '../town/trainCarModel';
import type {NpcDefinition} from '../town/npcDialogues';

export const KENJI_RANGE=45,KENJI_SEAT_LIFT=.12;
type Run={states:readonly unknown[];carMatrixOf(k:number,c:number,out:T.Matrix4):T.Matrix4};
export function createKenjiFigure(scene:T.Scene){
 let rig:ReturnType<typeof createPlayer>|null=null,seat:ReturnType<typeof npcSeatPose>|undefined;
 const m=new T.Matrix4(),p=new T.Vector3(),pm=new T.Matrix4(),fr=new T.Frustum(),sph=new T.Sphere(),motion={facing:0,trick:undefined as ReturnType<typeof npcSeatPose>|undefined,called:0};
 const at={k:-1,x:0,y:0,z:0};let shown=false;
 function build(){
  const r=createPlayer('train-kenji','home');r.setAppearance({...DEFAULT_CUSTOMIZATION,character:KENJI_NPC.character,face:KENJI_NPC.face,clothing:KENJI_NPC.clothing,body:'balanced'});
  const d=npcDress(KENJI_NPC);d.outfit.shirt=d.outfit.shirt2=d.outfit.shorts='#1f3352';d.outfit.socks='#1f3352';d.outfit.boots='#1d1d1d';r.setBeanLook(d.look,d.outfit);
  r.root.name='train-kenji';scene.add(r.root);seat=npcSeatPose('bench',r.profileScale,beanShapeOf(r.root));motion.trick=seat;rig=r;}
 return {
  /** Every frame after the trains moved. ridingK: the train I ride (-1). clock: seconds (the idles' rhythm). */
  update(run:Run|null,camera:T.Camera,ridingK:number,dt:number,clock:number,reduced:boolean){
   at.k=-1;if(!run){if(rig)rig.root.visible=false;shown=false;return;}
   camera.updateMatrixWorld();pm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);fr.setFromProjectionMatrix(pm);
   const cx=camera.matrixWorld.elements[12],cy=camera.matrixWorld.elements[13],cz=camera.matrixWorld.elements[14];let best=-1,bd=KENJI_RANGE;
   for(let k=0;k<run.states.length;k++){run.carMatrixOf(k,0,m);p.set(KENJI_SEAT.x,CAR_FLOOR_Y+1,KENJI_SEAT.z).applyMatrix4(m);
    const d=Math.hypot(p.x-cx,p.y-cy,p.z-cz);if(k===ridingK){best=k;break;}sph.center.copy(p);sph.radius=1.5;if(d<bd&&fr.intersectsSphere(sph)){bd=d;best=k;}}
   if(best<0){if(rig)rig.root.visible=false;shown=false;return;}
   if(!rig)build();const r=rig!;run.carMatrixOf(best,0,m);const e=m.elements;p.set(KENJI_SEAT.x,CAR_FLOOR_Y+KENJI_SEAT_LIFT,KENJI_SEAT.z).applyMatrix4(m);
   const base=Math.atan2(e[8],e[10]);// facing the way the train runs (car 0's +z)
   // idles: a glance aside (~every 8 s) and pointing ahead at the signal (~every 11 s, "shisa kanko")
   const g=reduced?0:Math.sin(clock*.78),pt=reduced?0:(clock%11)/11;motion.facing=base+(g>.86?(g-.86)*4:0);motion.called=pt>.82&&pt<.95?1:0;
   r.root.visible=true;shown=true;r.update(p.x,p.z,Math.min(dt,.1),clock,reduced,motion as Parameters<typeof r.update>[5]);r.root.position.y=p.y;
   at.k=best;at.x=p.x;at.y=p.y;at.z=p.z;},
  /** Where Kenji is drawn this frame (k -1: nowhere). */
  get at(){return at;},get shown(){return shown;},
  /** His talk definition at his spot (Town's Talk slide-out). */
  npc():NpcDefinition{KENJI_NPC.x=at.x;KENJI_NPC.z=at.z;return KENJI_NPC;},
  dispose(){if(rig){rig.root.removeFromParent();rig.dispose();}rig=null;},
 };
}
export type KenjiFigure=ReturnType<typeof createKenjiFigure>;
