/**
 * Daily puzzle: a local, seeded remix of a learned idea. The date picks a template puzzle, mirrors it
 * (left/right) and nudges every outfield player by up to 0.6 m; the remix is only offered after its
 * taught route still solves it and the tempting shortcut still fails (both checked with the real engine,
 * a few tens of milliseconds, once per day on demand). No network, no streaks, no pressure.
 */
import type {Scenario,Kick,Vec2} from './types';
import {coachRun} from './coach';
import {isCall,type Step} from './packs';

export type DailyTemplate={scenario:Scenario;solution:Step[];naive:Step[]};
export type DailyPuzzle={scenario:Scenario;solution:Step[];dateKey:string;template:string;mirrored:boolean};

/** Deterministic PRNG (mulberry32) from a string seed. */
export function seeded(seed:string){let h=1779033703^seed.length;for(let i=0;i<seed.length;i++){h=Math.imul(h^seed.charCodeAt(i),3432918353);h=h<<13|h>>>19;}
  return ()=>{h|=0;h=h+0x6D2B79F5|0;let t=Math.imul(h^h>>>15,1|h);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export const dateKey=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

const mx=(p:Vec2,m:boolean):Vec2=>({x:m?-p.x:p.x,z:p.z});
function mirrorStep(s:Step,m:boolean):Step{
  if(isCall(s))return {call:{attacker:s.call.attacker,to:mx(s.call.to,m)}};
  const k:Kick={...s,target:mx(s.target,m),curl:m?-(s.curl||0):s.curl};return k;
}
/** Remix a template: mirror, then nudge outfield players (not the carrier: the ball stays put). */
export function remix(t:DailyTemplate,rand:()=>number,mirrored:boolean,id:string):{scenario:Scenario;solution:Step[];naive:Step[]}{
  const s=t.scenario,j=()=>(rand()-.5)*1.2;
  const sc:Scenario={...s,id,pack:'daily',
    attackers:s.attackers.map((a,i)=>{const p=mx(a,mirrored),n=i===s.carrier?{x:0,z:0}:{x:j(),z:j()};
      return {x:p.x+n.x,z:p.z+n.z,run:a.run?{...a.run,path:a.run.path.map(q=>{const r=mx(q,mirrored);return {x:r.x+n.x,z:r.z+n.z};})}:undefined};}),
    defenders:s.defenders.map(d=>{const p=mx(d,mirrored);return {...d,x:p.x+j()*.6,z:p.z+j()*.6};}),
    keeper:s.keeper?{...s.keeper,x:mirrored?-s.keeper.x:s.keeper.x}:undefined,
    require:{...s.require,zone:s.require.zone?{...s.require.zone,...mx(s.require.zone,mirrored)}:undefined}};
  // Feet passes snap to the (moved) teammate when drawn, so their targets follow the jitter for free.
  return {scenario:sc,solution:t.solution.map(x=>mirrorStep(x,mirrored)),naive:t.naive.map(x=>mirrorStep(x,mirrored))};
}
/** Today's puzzle (or null if no remix validated, which the tests prove does not happen for the pool). */
export function dailyPuzzle(templates:Record<string,DailyTemplate>,date:Date,tries=8):DailyPuzzle|null{
  const key=dateKey(date),ids=Object.keys(templates).sort();if(!ids.length)return null;
  const rand=seeded('fi-pass-puzzle-'+key),pick=ids[Math.floor(rand()*ids.length)],t=templates[pick],mirrored=rand()<.5;
  for(let n=0;n<=tries;n++){
    const r=n===tries?remix(t,()=>.5,mirrored,`daily-${key}`):remix(t,rand,mirrored,`daily-${key}`);
    if(!coachRun(r.scenario,r.solution).ok)continue;
    if(r.naive.length&&coachRun(r.scenario,r.naive).ok)continue;
    return {scenario:{...r.scenario,title:`Daily: ${t.scenario.title}`},solution:r.solution,dateKey:key,template:pick,mirrored};
  }
  return null;
}
