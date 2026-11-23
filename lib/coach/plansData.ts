import {createHash} from 'node:crypto';
import {PLANS,type Plan} from '@/lib/site/plans';
import type {Drill,SkillId} from '@/lib/site/drills';
import type {GridScene} from '@/lib/site/grid';
import {esPlan,type EsDrill} from '@/lib/i18n/es/drillsRegistry';
import {STAGE_ES} from '@/lib/i18n/es/drills';
import {toEs} from '@/lib/i18n/esPaths';
/**
 * Practice plans for the coach app (round 4A, Nov 22 2026; owner: "keep them in the app"). Built at build time from the SAME
 * registry the site's /learn/soccer-practice-plans pages use (lib/site/plans.ts and its Spanish words), trimmed to what the app
 * shows, and served as one static JSON file (app/coach/plans-data/route.ts) that the app fetches only when the coach opens
 * Practice plans (no cost on the dashboard). Server only.
 */
export type CoachDrill={slug:string;name:string;skill:SkillId;steps:string[];cues:string[];scene:GridScene;desc:string;path:string};
export type CoachPlanRow={minutes:number;stage:string;activity:string;purpose:string;start:number;end:number;drill?:string};
export type CoachPlan={slug:string;age:string;name:string;h1:string;goal:string;minutes:number;players:string;field:string;rows:CoachPlanRow[];equipment:string[];notes:string[];swap:{sign:string;instead:string};drills:string[];path:string};
export type CoachPlans={plans:CoachPlan[];drills:Record<string,CoachDrill>};
const drillOf=(d:Drill|EsDrill,path:string):CoachDrill=>({slug:d.slug,name:d.name,skill:d.skill,steps:[...d.steps],cues:[...d.cues],scene:d.scene,desc:d.answer,path});
function pack(lang:'en'|'es'):CoachPlans{
 const drills:Record<string,CoachDrill>={},plans:CoachPlan[]=[];
 for(const en of PLANS){
  const p=(lang==='es'?esPlan(en.slug):en) as Plan&{esPath?:string;drills:(Drill|EsDrill)[]};
  for(const d of p.drills)drills[d.slug]??=drillOf(d,lang==='es'?toEs(d.path):d.path);
  plans.push({slug:p.slug,age:p.age,name:p.name,h1:p.h1,goal:p.goal,minutes:p.minutes,players:p.players,field:p.field,
   rows:p.rows.map(r=>({minutes:r.minutes,stage:lang==='es'?STAGE_ES[r.stage]??r.stage:r.stage,activity:r.activity,purpose:r.purpose,start:r.start,end:r.end,...(r.drill?{drill:r.drill.slug}:{})})),
   equipment:[...p.equipment],notes:[...p.notes],swap:{...p.swap},drills:p.drills.map(d=>d.slug),path:lang==='es'?toEs(en.path):en.path});
 }
 return {plans,drills};
}
let memo:{en:CoachPlans;es:CoachPlans}|null=null;
export const coachPlans=()=>memo??=(memo={en:pack('en'),es:pack('es')});
/** A short content hash: the app asks for /coach/plans-data?v=<it>, so the coach app's cache-first service worker gets new plans after a deploy. */
export const coachPlansVersion=()=>createHash('sha1').update(JSON.stringify(coachPlans())).digest('hex').slice(0,10);
