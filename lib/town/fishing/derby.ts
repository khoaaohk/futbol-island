/**
 * C2 (docs/fishing-research.md): the Fishing Derby. Three minutes of "stoppage time" at any fishing spot, started from the fishing
 * HUD. You play against your own best and against Rosa's nephew Tomás (a friendly made-up score for the day), never online.
 *
 * Score: 1 point per catch plus 1 bonus point the first time each kind is caught in this derby (variety, not size or luck of a big
 * fish, so small kids are not beaten by chance). Trophies come from total derby points over time.
 *
 * ECONOMY (docs/fishing-research.md §4 "C2 derby"): NO price bonus and no coins of its own. A derby catch is an ordinary catch: it
 * goes into the basket and sells at Rosa's through the same ladder, allowance and Training meter as any fish. Nothing here
 * imports or touches a price (tests/economy.cjs §12 checks the source).
 */
import {hash01} from './weather';
export const DERBY_SECONDS=180;
export type DerbyRun={startedAt:number;elapsed:number;score:number;catches:number;kinds:string[];done:boolean};
export const startDerby=(now:number):DerbyRun=>({startedAt:now,elapsed:0,score:0,catches:0,kinds:[],done:false});
/** Points one catch adds (1, plus 1 for a kind new to this derby). */
export const derbyPoints=(run:Pick<DerbyRun,'kinds'>,fishId:string)=>1+(run.kinds.includes(fishId)?0:1);
export function derbyCatch(run:DerbyRun,fishId:string):DerbyRun{
 if(run.done)return run;const pts=derbyPoints(run,fishId);
 return {...run,score:run.score+pts,catches:run.catches+1,kinds:run.kinds.includes(fishId)?run.kinds:[...run.kinds,fishId]};
}
/** Advance the clock by `dt` seconds of active fishing (paused dialogs do not count). */
export function derbyTick(run:DerbyRun,dt:number):DerbyRun{
 if(run.done)return run;const elapsed=Math.min(DERBY_SECONDS,run.elapsed+Math.max(0,Math.min(dt,5)));
 return {...run,elapsed,done:elapsed>=DERBY_SECONDS};
}
export const derbyLeft=(run:DerbyRun)=>Math.max(0,Math.ceil(DERBY_SECONDS-run.elapsed));
/** "2:35", match-clock style. */
export const clockText=(seconds:number)=>`${Math.floor(seconds/60)}:${String(Math.max(0,seconds)%60).padStart(2,'0')}`;
/** Rosa's nephew Tomás's score today (6–11, the same all day). */
export const rivalScore=(day:string)=>6+Math.floor(hash01('derby:'+day)*6);
export const RIVAL_NAME='Tomás';
/** Trophies at total derby points, Animal Crossing tourney style. */
export const DERBY_TROPHIES=[{id:'bronze',name:'Bronze Derby Cup',points:20},{id:'silver',name:'Silver Derby Cup',points:60},{id:'gold',name:'Gold Derby Cup',points:120}] as const;
export const derbyTrophies=(points:number)=>DERBY_TROPHIES.filter(t=>points>=t.points);
