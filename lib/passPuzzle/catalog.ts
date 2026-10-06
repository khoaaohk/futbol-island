/**
 * Pass Puzzles catalog: every pack and puzzle in pack-map order, the route for each (the coach's route),
 * the star gates that open each pack, the daily-remix pool and the measured difficulty pips.
 */
import type {Scenario} from './types';
import {SCENARIOS,PACKS,SCENARIO_SOLUTIONS} from './scenarios';
import {CHALLENGE_PACK,CHALLENGE_SCENARIOS,CHALLENGE_SOLUTIONS} from './challenges';
import {EXTRA_PACKS,EXTRA_SCENARIOS,EXTRA_SOLUTIONS,type Step} from './packs';
import {YOUTH_SOLUTIONS} from './youth';
import type {DailyTemplate} from './daily';
import {DIFFICULTY} from './curve';

export type CatalogPack={id:string;order:number;title:string;blurb:string;gate:number};
/** Stars (across all packs) that open each pack on the map: skill, not coins, unlocks content. */
const CORE_GATES:Record<string,number>={'first-passes':0,'team-moves':3,'beat-the-press':10,'in-the-air':18,'match-problems':34};
export const ALL_PACKS:CatalogPack[]=[...PACKS.map(p=>({...p,gate:CORE_GATES[p.id]??0})),{...CHALLENGE_PACK,gate:CORE_GATES['match-problems']},...EXTRA_PACKS].sort((a,b)=>a.order-b.order);
export const ALL_SCENARIOS:Scenario[]=[...SCENARIOS,...CHALLENGE_SCENARIOS,...EXTRA_SCENARIOS];
export const ALL_SOLUTIONS:Record<string,{solution:Step[];naive:Step[]}>={
  ...Object.fromEntries(Object.entries(SCENARIO_SOLUTIONS).map(([k,v])=>[k,{solution:v.solution,naive:[v.naive]}])),
  ...Object.fromEntries(Object.entries(CHALLENGE_SOLUTIONS).map(([k,v])=>[k,{solution:v.solution,naive:[v.naive]}])),
  ...EXTRA_SOLUTIONS,
};
/** The route in the mode being played: with heading off, the youth route (headers become chest control). */
export function routeFor(id:string,heading:boolean):Step[]{
  const r=ALL_SOLUTIONS[id]?.solution??[];
  if(heading)return r;
  return YOUTH_SOLUTIONS[id]??r.map(s=>'kind' in s&&s.kind==='header'?{...s,kind:'pass-feet' as const}:s);
}
export const packGateOpen=(p:CatalogPack,totalStars:number)=>totalStars>=p.gate;
/** Ground-ball ideas that remix well (no headers, so they work in every mode). */
const DAILY_POOL=['fp-find-a-friend','fp-run-onto-it','fp-bend-it-round','tm-give-and-go','tm-third-friend','tm-pull-it-back','bp-through-the-gap','bp-in-behind','tr-make-the-run','tr-beat-the-trap','ca-break-fast','sp-lay-it-off'];
export const DAILY_TEMPLATES:Record<string,DailyTemplate>=Object.fromEntries(DAILY_POOL.map(id=>{const sc=ALL_SCENARIOS.find(s=>s.id===id)!,r=ALL_SOLUTIONS[id];return [id,{scenario:sc,solution:r.solution,naive:r.naive}];}));
/** 1–3 difficulty pips from the measured bot ratings (scripts/pass-puzzle-curve.cjs). */
export function pips(id:string):1|2|3{const r=DIFFICULTY[id]??50;return r<34?1:r<58?2:3;}
