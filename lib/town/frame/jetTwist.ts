import type * as T from 'three';
import type {createJetpackActions} from '@/lib/town/jetpackActions';

/* The jetpack blast / dash spin, one step of Town's frame loop (moved out of animate(), Nov 10 2026 split; same code, same
   place: after the wall splat, before the arrival scale). The context is one long-lived object Town builds once. */
export type JetTwistFrame={
  reduced:boolean;jetActions:Pick<ReturnType<typeof createJetpackActions>,'state'>;
  customizationRef:{readonly current:{readonly jetpack:string}};player:{readonly root:T.Object3D};vehicle:{readonly root:T.Object3D};
};

export function applyJetTwist(c:JetTwistFrame){
  const {reduced,jetActions,customizationRef,player,vehicle}=c;
  if(!reduced&&(jetActions.state.phase==='blast'||jetActions.state.phase==='dash')){const t=Math.min(1,jetActions.state.age/(jetActions.state.phase==='dash'?.45:1.05)),twist=Math.PI*(customizationRef.current.jetpack==='helicopter'?4:2)*t*t*(3-2*t);if(customizationRef.current.jetpack==='mini-plane'&&jetActions.state.phase==='blast'){player.root.rotateX(-twist);vehicle.root.rotateX(-twist);}else if(['flying-car','mini-plane'].includes(customizationRef.current.jetpack)){player.root.rotateZ(twist);vehicle.root.rotateZ(twist);}else if(customizationRef.current.jetpack==='rocketboard'){if(jetActions.state.phase==='blast'){player.root.rotateY(twist*1.5);vehicle.root.rotateY(twist*1.5);}else{player.root.rotateX(twist);vehicle.root.rotateX(twist);}}else if(customizationRef.current.jetpack==='ironman'){const surge=Math.sin(t*Math.PI)*.3;player.root.rotateX(-surge);vehicle.root.rotateX(-surge);}else{player.root.rotateY(twist);vehicle.root.rotateY(twist);}}
}
