import type {Play} from './types';

/** Undo/redo for the tactics board: plays are immutable, so history is a list of them. Bounded (60 steps back). */
export type History={past:Play[];now:Play;future:Play[];key?:string;at?:number};
export const HISTORY_LIMIT=60;
export const startHistory=(play:Play):History=>({past:[],now:play,future:[]});
/**
 * Records a new state. Edits with the same `key` within `windowMs` (e.g. a run of arrow-key nudges on one chip, or typing a
 * shirt number) merge into one undo step.
 */
export function commit(h:History,play:Play,key?:string,now=Date.now(),windowMs=900):History{
 if(play===h.now)return h;
 if(key&&h.key===key&&h.at!==undefined&&now-h.at<windowMs)return {...h,now:play,future:[],at:now};
 return {past:[...h.past,h.now].slice(-HISTORY_LIMIT),now:play,future:[],key,at:now};
}
export const undo=(h:History):History=>h.past.length?{past:h.past.slice(0,-1),now:h.past[h.past.length-1],future:[h.now,...h.future]}:h;
export const redo=(h:History):History=>h.future.length?{past:[...h.past,h.now],now:h.future[0],future:h.future.slice(1)}:h;
