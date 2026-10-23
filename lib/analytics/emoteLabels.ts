/**
 * Emote names for the admin "Emotes" section (server side, the sponsorLabels.ts pattern): the beat only carries `em:e<n>` (a
 * local emote number), so the words are looked up here from the real tables. lib/town/emoteReact.ts is not imported (it pulls in
 * the character graphics); its ten wheel labels are repeated below and tests/admin-analytics-party.cjs checks they match.
 */
import {RIDE_SCRIPTS} from '../town/rideEmotes';
import {CTX_SCRIPTS} from '../town/emoteContexts';
import {NPC_SET_LABELS} from '../town/npcEmoteSets';
import {MOVE_SCRIPTS} from '../town/moveEmotes';

/** lib/town/emoteReact.ts EMOTE (0–9) and LOCAL_EMOTES labels. */
export const WHEEL_EMOTE_LABELS:Record<number,string>={0:'Wave',1:'Cheer',2:'High five',3:'Juggle with me',4:'Show off',5:'Well played',6:'Pass it',7:'Laugh',8:'Dance',9:'Thanks'};
export type EmoteGroup='wheel'|'ride'|'fly'|'swim'|'npc'|'walk';
export function emoteLabels():Record<number,{label:string;group:EmoteGroup}>{
 const out:Record<number,{label:string;group:EmoteGroup}>={};
 for(const [n,label] of Object.entries(WHEEL_EMOTE_LABELS))out[Number(n)]={label,group:'wheel'};
 for(const r of RIDE_SCRIPTS)out[r.emote]={label:`${r.label} (${r.ride})`,group:'ride'};
 for(const c of CTX_SCRIPTS)out[c.emote]={label:c.label,group:c.ctx==='fly'?'fly':'swim'};
 for(const [n,s] of Object.entries(NPC_SET_LABELS))out[Number(n)]={label:`${s.label} (${s.kind})`,group:'npc'};/* older beats: townsfolk answers now count under the standard ten */
 for(const s of MOVE_SCRIPTS)out[s.emote]={label:s.label,group:'walk'};
 return out;
}
