import type {NpcDefinition} from './npcDialogues';
/**
 * Rotating conversation openers (Oct 12 2026, townsfolk cast). The first chat with an islander opens with their greeting (the
 * wording gameplay relies on: news desks, ranking host, clips); each later chat this session opens with their next persona line
 * (lib/town/townsfolkCast.ts), then it wraps round. Topics and reply buttons are unchanged. Text only: NPC chat is not voiced.
 */
const visits=new Map<string,number>();
export const npcOpeners=(npc:Pick<NpcDefinition,'greeting'|'lines'>)=>[npc.greeting,...(npc.lines??[])];
export function npcOpener(npc:Pick<NpcDefinition,'id'|'greeting'|'lines'>){const all=npcOpeners(npc);return all[(visits.get(npc.id)??0)%all.length];}
/** Called when a chat closes, so the next one starts with the following line. */
export function markNpcVisited(id:string){visits.set(id,(visits.get(id)??0)+1);}
