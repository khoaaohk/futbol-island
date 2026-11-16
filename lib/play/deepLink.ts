import {PATHS_IN_ORDER} from '../paths/pathContinue';
import {GO_FISHING_SPOTS} from '../town/fishing/fishingReach';
import type {WelcomeAction} from '../welcome/hooks';
/**
 * "Play this in the game" deep links (Nov 15 2026, owner items 8 and 11): the reading pages link to `/play?go=<where>`, and the
 * island, once it is ready, does the same thing the Welcome back card does (lib/welcome/act.ts actWelcome, the game's EXISTING
 * events). Only two destinations exist, and anything else is ignored:
 *   go=lesson:<lessonId>  a lesson that is in a Paths format (launches it, like a tap in Paths)
 *   go=fish:<spotId>      a shore fishing spot (travels there, like "Go fishing"); go=fish alone = the nearest spot
 * Pure and safe: a strict shape check, a length cap, and a lookup in the game's own lists. An unknown id returns null and the
 * game simply opens as usual. Town.tsx reads it once after boot and removes the param from the address bar.
 */
export const GO_PARAM='go';
const SHAPE=/^(lesson|fish)(?::([A-Za-z0-9_-]{1,64}))?$/;
/** The Paths format that holds this lesson id, or null. */
export function lessonFormat(id:string):string|null{
 for(const p of PATHS_IN_ORDER)if([...p.chapters.flatMap(c=>c.lessons),...p.depth].some(l=>l.id===id))return p.format;
 return null;
}
export const isShoreSpot=(id:string)=>GO_FISHING_SPOTS.some(s=>s.id===id);
export function parseGo(raw:string|null|undefined):WelcomeAction|null{
 if(typeof raw!=='string'||raw.length>80)return null;
 const m=SHAPE.exec(raw);if(!m)return null;
 const [,kind,id]=m;
 if(kind==='lesson'){if(!id)return null;const format=lessonFormat(id);return format?{to:'lesson',format,lessonId:id}:null;}
 if(!id)return {to:'fish'};
 return isShoreSpot(id)?{to:'fish',spots:[id]}:null;
}
