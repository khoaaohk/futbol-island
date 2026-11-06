// Quick goal reset, the view (owner Nov 5 2026; docs/join-live-game-design.md "Quick goal reset"; the sim side is matchSim GOAL_RESET).
// In a live match with a joined human: the scored ball fades out in the net (opacity + a slight shrink, GOAL_RESET.fade), then lands
// on the centre spot with the character's blue arrival (lib/graphics/characterArrival.ts: the same rings, beam, sparks, materials and
// 0.12 → 1 scale pop, scaled to the ball and shortened). A friend's screen gets the same through the snapshot flags (matchNet
// SNAP_FLAG.ballHidden + the reset serial). Reduced motion: a plain fade out and in, no effect. The character arrival has no sound,
// so neither has this. Heat: transform / opacity only; the faded material and the effect are made once, on the first reset.
import * as T from 'three';
import {createCharacterArrival} from '../graphics/characterArrival';
import {GOAL_RESET} from './match/matchSim';

/** The ball-sized arrival: the character effect × this scale, over this many seconds. */
export const BALL_ARRIVAL={scale:.6,duration:1.1,fadeIn:.3} as const;

export function createBallReset(root:T.Object3D,ball:T.Mesh,baseMat:T.Material){
 let seen=-1,fadeOut=0,arriveT=-1,mat:T.MeshStandardMaterial|null=null,fx:ReturnType<typeof createCharacterArrival>|null=null;
 const useFade=(o:number)=>{if(!mat){mat=(baseMat as T.MeshStandardMaterial).clone();mat.transparent=true;mat.depthWrite=true;}mat.opacity=o;if(ball.material!==mat)ball.material=mat;};
 const rest=()=>{if(ball.material!==baseMat)ball.material=baseMat;ball.scale.setScalar(1);ball.visible=true;};
 return {
  /** After the ball is placed for this frame. `dt` real seconds (0 when paused). */
  update(sim:{goalReset:{serial:number;hidden:boolean}},dt:number,reduced:boolean){
   const g=sim.goalReset;
   if(seen<0){seen=g.serial;}
   else if(g.serial!==seen){seen=g.serial;arriveT=0;fadeOut=0;if(!reduced){if(!fx){fx=createCharacterArrival(root,BALL_ARRIVAL.duration);fx.root.scale.setScalar(BALL_ARRIVAL.scale);}fx.restart();}}
   if(g.hidden){
    arriveT=-1;fadeOut=Math.min(GOAL_RESET.fade,fadeOut+dt);const u=fadeOut/GOAL_RESET.fade;
    if(u>=1){ball.visible=false;}else{ball.visible=true;useFade(1-u);ball.scale.setScalar(1-.35*u);}
    if(fx)fx.update(0,0,0,0,true,false);
    return;
   }
   if(arriveT<0){if(fadeOut>0||ball.material!==baseMat||!ball.visible){fadeOut=0;rest();}return;}
   arriveT+=dt;
   if(reduced||!fx){const u=Math.min(1,arriveT/BALL_ARRIVAL.fadeIn);ball.visible=true;ball.scale.setScalar(1);if(u<1)useFade(u);else{arriveT=-1;rest();}return;}
   const pop=fx.update(dt,ball.position.x,ball.position.y-.295,ball.position.z,false,true);
   ball.visible=true;ball.scale.setScalar(pop);useFade(Math.min(1,.25+arriveT/BALL_ARRIVAL.fadeIn));
   if(fx.getState().done){arriveT=-1;rest();}
  },
  /** A goal replay is drawing the ball (lib/town/goalReplay.ts): plain and whole, the fade / arrival state kept for after it. */
  show(){rest();if(fx)fx.update(0,0,0,0,true,false);},
  dispose(){fx?.dispose();mat?.dispose();rest();},
 };
}
