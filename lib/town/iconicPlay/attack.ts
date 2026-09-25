// STUB — owned by the attack-templates agent, who replaces this file. Contract: see types.ts.
import type {Template,TemplateId} from './types';
const stub:Template=(p,seed,field)=>({duration:6,field,actors:[{id:'star',role:'star',track:[[0,0,600],[6,0,150]]}],ball:[[0,0,580,0],[5,0,160,0],[6,0,0,20]],events:[]});
export const ATTACK_TEMPLATES:Partial<Record<TemplateId,Template>>={solo_dribble_goal:stub,long_range_goal:stub,free_kick_goal:stub,header_goal:stub,volley_goal:stub,bicycle_kick:stub,chip_goal:stub,penalty_goal:stub};
