// STUB — owned by the creator-templates agent, who replaces this file. Contract: see types.ts.
import type {Template,TemplateId} from './types';
const stub:Template=(p,seed,field)=>({duration:6,field,actors:[{id:'star',role:'star',track:[[0,0,600],[6,0,150]]}],ball:[[0,0,580,0],[5,0,160,0],[6,0,0,20]],events:[]});
export const CREATOR_TEMPLATES:Partial<Record<TemplateId,Template>>={through_ball_assist:stub,cross_assist:stub,overlap_run:stub,skill_move:stub,interception_counter:stub};
