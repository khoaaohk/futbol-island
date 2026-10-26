/** Island Strikers body language (Oct 25 2026 upgrade, docs/ARCADE_STRIKERS_UPGRADE_OCT25.md). Pure, allocation-free timing for
 * the goal celebration and the full-time outro; strikerScene feeds the results to the island rig's skill/reaction poses and
 * tests/striker-celebrate.cjs checks the choreography. Football lesson: a goal is a team's, so the scorer thanks the passer. */
import type {SkillMove} from '../graphics/skillMoves';

export type StrikerCelebrationRole='scorer'|'assister'|'partner'|'mate';
export type StrikerMovePose={type:SkillMove;progress:number};
const clamp01=(v:number)=>Math.max(0,Math.min(1,v));
const goalPose:StrikerMovePose={type:'airplane',progress:0};

/** Goal celebration move for one scoring-team outfielder `elapsed` seconds into the pause, or null (arms-up only).
 * Scorer: airplane, then thank the passer (assisted goal) or knee slide (solo). Passer: high five. Solo goal: the nearest
 * teammate high-fives as before. Everyone else fist-bumps, staggered by `slot` so the team does not move as one. */
export function strikerCelebration(role:StrikerCelebrationRole,elapsed:number,assisted:boolean,slot:number,pause:number):StrikerMovePose|null{
 if(role==='scorer'){
  if(elapsed<.9){goalPose.type='airplane';goalPose.progress=Math.min(.8,elapsed/.9*.8);return goalPose;}
  goalPose.type=assisted?'thankPasser':'kneeSlide';goalPose.progress=clamp01((elapsed-.9)/Math.max(.1,pause-.9));return goalPose;}
 const start=role==='mate'?.75+slot*.12:.7;
 if(elapsed<=start)return null;
 goalPose.type=role==='mate'?'fistBump':'highFive';goalPose.progress=clamp01((elapsed-start)/Math.max(.1,pause-start));return goalPose;}

/** Seconds of full-time body language after the final whistle (the loop renders only this long, then sleeps). */
export const STRIKER_OUTRO=2.6;
export type StrikerOutroPose={celebrate:number;reaction:''|'dejected';skill:SkillMove|'';progress:number};
const outro:StrikerOutroPose={celebrate:0,reaction:'',skill:'',progress:0};

/** Pose for one player `t` seconds into the outro. winner: 0 Gold, 1 Blue, -1 draw. */
export function strikerOutroPose(team:number,keeper:boolean,star:boolean,winner:number,t:number,slot:number):StrikerOutroPose{
 outro.celebrate=0;outro.reaction='';outro.skill='';outro.progress=0;
 if(winner<0){// A draw: shake on it. Fist bumps all round, keepers included, staggered.
  const start=.2+slot*.15;if(t>start){outro.skill='fistBump';outro.progress=clamp01((t-start)/1.35);}return outro;}
 if(team!==winner){outro.reaction='dejected';outro.progress=Math.min(.9,t/1.2);return outro;}
 outro.celebrate=Math.sin(clamp01(t/STRIKER_OUTRO)*Math.PI);
 if(keeper)return outro;
 if(star){if(t<1.5){outro.skill='airplane';outro.progress=Math.min(.8,t/1.5*.8);}else{outro.skill='kneeSlide';outro.progress=clamp01((t-1.5)/(STRIKER_OUTRO-1.5));}outro.celebrate=0;return outro;}
 const start=.35+slot*.18;if(t>start){outro.skill='highFive';outro.progress=clamp01((t-start)/1.5);}
 return outro;}

/** The winning side's star for the outro: its top scorer, else its first outfielder. -1 on a draw. */
export function strikerOutroStar(players:readonly {id:number;team:number;keeper:boolean}[],goalsBy:readonly number[],winner:number){
 if(winner<0)return -1;let best=-1,goals=-1;
 for(const p of players){if(p.team!==winner||p.keeper)continue;const g=goalsBy[p.id]??0;if(g>goals){goals=g;best=p.id;}}
 return best;}
