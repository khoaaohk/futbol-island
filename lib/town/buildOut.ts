import {venueById} from './venues';
/** This 7v7 pitch's build-out line is halfway between the penalty-area edge
 * and halfway. Shared by the markings and the match's 270 × 400 coordinates. */
export const SEVEN_PENALTY_DEPTH=10;
export function sevenBuildOutLocalZ(side:-1|1){
 const half=venueById('7v7').length/2;
 return side*(half-SEVEN_PENALTY_DEPTH)/2;
}
export function sevenBuildOutY(team:'gold'|'blue'){
 return 200+sevenBuildOutLocalZ(team==='gold'?1:-1)/venueById('7v7').length*380;
}
export function behindBuildOut(y:number,team:'gold'|'blue',clearance=0){
 const line=sevenBuildOutY(team);
 return team==='gold'?y<=line-clearance:y>=line+clearance;
}
export function retreatBuildOutY(y:number,team:'gold'|'blue',clearance=4){
 const line=sevenBuildOutY(team);
 return team==='gold'?Math.min(y,line-clearance):Math.max(y,line+clearance);
}
