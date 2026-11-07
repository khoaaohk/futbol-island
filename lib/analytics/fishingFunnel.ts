/**
 * The admin Fishing funnel (Nov 6 2026), built on the SERVER from the range's merged counters (core.ts mergeRollups: counts =
 * totals per id, countSessions = tab sessions with that id at least once), like liveMatchReport.ts. Ids: countIds.ts
 * FISHING_COUNT_EVENTS, sent by lib/analytics/fishingEvents.ts. Pure and client-safe (app/admin/FishingSection.tsx imports types).
 *
 * The funnel: Fish tapped (fi:start) → cast (fi:cast) → bite (fi:bite) → hooked (fi:hook_spin) → landed (fi:land), each as
 * sessions that reached the step and as event totals, with the drop-off from the step before. A session that tapped Fish but never
 * hooked a fish counts at the steps it reached (the raw-beat SQL summary only sees sessions that fought; this does not need it).
 * Plus misses too early vs too late, the rarity mix of landings (the rarity WORD only), basket full, new species, the tutorial
 * finished vs skipped, and fish sold.
 *
 * Exact counts (owner rule, Nov 5 2026 "dont show <5, show exact", the lm: precedent): every number is shown from the first session.
 * `since`: the day the funnel ids started (earlier days have no fi:start / fi:cast / fi:bite, so their drop-off would mislead).
 */
import type {Merged} from './core';
import {FISHING_COUNT_EVENTS,FISHING_RARITIES} from './countIds';

export const FUNNEL_SINCE='2026-11-06';
export type FunnelStep={id:string;label:string;sessions:number;total:number;
 /** Share of the step before's sessions that reached this one (null for the first step or when the step before is 0). */
 kept:number|null};
export type FishingFunnel={status:'not_yet'|'empty'|'ok';since:string;partial:boolean;
 steps:FunnelStep[];
 misses:{early:number;late:number;old:number};
 rarity:{id:string;label:string;value:number}[];
 basketFull:number;newSpecies:number;sold:number;
 tutorial:{done:number;skipped:number;rate:number|null};
 /** Every fishing counter's exact total in range (the section's cards read these instead of the suppressed overview rows). */
 rows:{id:string;label:string;value:number}[]};
const STEPS:[string,string][]=[['start','Fish tapped'],['cast','Cast'],['bite','Bite'],['hook_spin','Hooked'],['land','Landed']];
const RARITY_WORD:Record<string,string>={common:'Common',uncommon:'Good (uncommon)',rare:'Rare',legendary:'Legendary'};

export function buildFishingFunnel(m:Pick<Merged,'counts'|'countSessions'>,range:{from:string;to:string}):FishingFunnel{
 const c=(id:string)=>m.counts['fi:'+id]||0,s=(id:string)=>m.countSessions['fi:'+id]||0;
 let prev:number|null=null;
 const steps=STEPS.map(([id,label])=>{const sessions=s(id),kept=prev===null||!prev?null:sessions/prev;prev=sessions;return {id:'fi:'+id,label,sessions,total:c(id),kept};});
 const done=c('tutorial_done'),skipped=c('tutorial_skip');
 const any=steps.some(x=>x.total>0);
 return {status:range.to<FUNNEL_SINCE?'not_yet':any?'ok':'empty',since:FUNNEL_SINCE,partial:range.from<FUNNEL_SINCE&&range.to>=FUNNEL_SINCE,steps,
  misses:{early:c('miss_early'),late:c('miss_late'),old:c('miss')},
  rarity:FISHING_RARITIES.map(r=>({id:'fi:land_'+r,label:RARITY_WORD[r],value:c('land_'+r)})),
  basketFull:c('basket_full'),newSpecies:c('new_species'),sold:c('sold'),
  tutorial:{done,skipped,rate:done+skipped?done/(done+skipped):null},
  rows:FISHING_COUNT_EVENTS.map(([id,label])=>({id:'fi:'+id,label,value:c(id)}))};
}
