/**
 * Pass Puzzles feel helpers: small pure rules the arcade view uses for its moment-to-moment beats
 * (where a failed move is marked on the pitch, the HUD's progress toward the taught move).
 */
import type {PuzzleEvent,PuzzleState} from './types';

/** Where a failed attempt was stopped, for the on-pitch mark: the deciding event, the ball out of play, or where it died. */
export function stopPoint(world:{state:PuzzleState},events:PuzzleEvent[]):{at:{x:number;z:number};kind:'cut'|'out'|'save'|'offside'}|null{
 const r=world.state.result;if(!r||r.outcome==='success'||r.reason==='too-few-passes')return null;
 const e=[...events].reverse().find(e=>['intercept','deflect','save','parry','offside','out'].includes(e.type));
 if(r.reason==='offside'){const a=e?.type==='offside'&&e.attacker!=null?world.state.attackers[e.attacker]:undefined;return a?{at:{x:a.p.x,z:a.p.z},kind:'offside'}:null;}
 if(e&&e.type!=='offside')return{at:{x:e.at.x,z:e.at.z},kind:e.type==='out'?'out':e.type==='save'||e.type==='parry'?'save':'cut'};
 const b=world.state.ball.p;return Number.isFinite(b.x+b.z)?{at:{x:b.x,z:b.z},kind:r.reason==='out'?'out':'cut'}:null;}

/** The HUD counter: passes made toward the taught move ("1/2 passes"), and whether the move's passes are done. */
export function passProgress(passes:number,need:number):{count:string;label:string;met:boolean}{
 const n=Math.max(0,passes|0);
 if(need>0)return{count:`${Math.min(n,need)}/${need}`,label:need===1?'pass':'passes',met:n>=need};
 return{count:String(n),label:n===1?'pass':'passes',met:false};
}
