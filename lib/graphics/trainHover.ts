/**
 * The Island Line's green hover outline (Gameplay 2, owner Nov 24 2026): pointing at a train that stands at a platform (or brakes
 * in, Board-eligible within BOARD_EARLY s) within TRAIN_HOVER_RANGE m gives it the island's green building outline
 * (lib/graphics/buildingGlow.ts 'train': the car bounds, one glow per car on the car's own matrix) and makes "Board" the hovered
 * target (HUD distance -1). The train beats a station house under the same pointer (Town asks this first). Nothing while riding
 * or for a train running between stations.
 * Heat: ray tests only while the pointer is over the canvas and only against the (at most two) eligible trains' cars (one box
 * each, in the car's frame); the glows draw only while shown; no allocation per frame.
 */
import * as T from 'three';
import {createBuildingGlow} from './buildingGlow';
import {HALF_W,BODY_Y0,ROOF_TOP} from '../town/trainCarModel';
import {TRAIN_COUNT,TRAIN_CARS,CAR_LENGTH,TRAIN_LENGTH} from '../town/trainSchedule';
import {boardIn,BOARD_EARLY} from '../town/trainRide';
import {trackAt} from '../town/trainTrack';

export const TRAIN_HOVER_RANGE=45;
const HOVER_GRACE=600;
type St={s:number;at:number;next:number;t:number;doors:number;dwellLeft:number};
type Run={states:readonly St[];carMatrixOf(k:number,c:number,out:T.Matrix4):T.Matrix4};

/** Is train state st Board-eligible (standing with its doors usable, or braking in within BOARD_EARLY s)? */
export const trainBoardable=(st:St)=>boardIn(st,st.at>=0?st.at:st.next)<=BOARD_EARLY;

export function createTrainHover(scene:T.Object3D){
 const H=ROOF_TOP-BODY_Y0,lift=new T.Matrix4().makeTranslation(0,BODY_Y0,0);
 const cars=Array.from({length:TRAIN_CARS},(_,c)=>{const g=new T.Group();g.name='train-hover-'+c;g.matrixAutoUpdate=false;scene.add(g);return {g,glow:createBuildingGlow(g,HALF_W*2,CAR_LENGTH,H,'train')};});
 const box=new T.Box3(new T.Vector3(-HALF_W-.1,BODY_Y0-.6,-CAR_LENGTH/2-.1),new T.Vector3(HALF_W+.1,ROOF_TOP+.1,CAR_LENGTH/2+.1));
 const m=new T.Matrix4(),inv=new T.Matrix4(),local=new T.Ray(),hit=new T.Vector3(),mid={x:0,z:0,tx:1,tz:0};
 let hovered=-1,hoverUntil=0,shownK=-1,fade=0;
 const near=(run:Run,k:number,px:number,pz:number)=>{trackAt(run.states[k].s-TRAIN_LENGTH/2,mid);return Math.hypot(mid.x-px,mid.z-pz)<TRAIN_HOVER_RANGE;};
 /** The eligible train a ray hits (nearest), or -1. */
 function pick(ray:T.Raycaster,run:Run,px:number,pz:number){let best=-1,bd=Infinity;
  for(let k=0;k<TRAIN_COUNT;k++){const st=run.states[k];if(!trainBoardable(st)||!near(run,k,px,pz))continue;
   for(let c=0;c<TRAIN_CARS;c++){run.carMatrixOf(k,c,m);inv.copy(m).invert();local.copy(ray.ray).applyMatrix4(inv);if(local.intersectBox(box,hit)){const d=hit.distanceTo(local.origin);if(d<bd){bd=d;best=k;}}}}
  return best;}
 return {
  get hovered(){return hovered;},
  pick,
  /** Desktop hover (Town's frame; null ray: the pointer is off the canvas or hover is not allowed now, e.g. riding). */
  hover(ray:T.Raycaster|null,run:Run|null,px:number,pz:number,now:number){
   const k=ray&&run?pick(ray,run,px,pz):-1;if(k>=0){hovered=k;hoverUntil=now+HOVER_GRACE;}
   else if(!ray||!run||now>=hoverUntil||!trainBoardable(run.states[hovered]??run.states[0]))hovered=-1;return hovered;},
  /** Keep the outline on the hovered train's cars (it may still be braking in) and ease it in and out. */
  update(run:Run|null,dt:number,reduced:boolean){
   const k=run?hovered:-1;if(k>=0){shownK=k;fade=.6;}else fade-=dt;if(fade<=0&&k<0)return;// asleep once faded out
   for(let c=0;c<TRAIN_CARS;c++){const car=cars[c];if(run&&shownK>=0){run.carMatrixOf(shownK,c,m);car.g.matrix.multiplyMatrices(m,lift);car.g.matrixWorldNeedsUpdate=true;car.g.updateMatrixWorld(true);}
    car.glow.update(k>=0,dt,reduced);}},
  dispose(){for(const c of cars){c.glow.dispose();c.g.removeFromParent();}},
 };
}
export type TrainHover=ReturnType<typeof createTrainHover>;
