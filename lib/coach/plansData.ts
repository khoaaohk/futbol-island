import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {PLANS,type Plan} from '@/lib/site/plans';
import type {Drill,SkillId} from '@/lib/site/drills';
import type {GridScene} from '@/lib/site/grid';
import {esPlan,type EsDrill} from '@/lib/i18n/es/drillsRegistry';
import {STAGE_ES} from '@/lib/i18n/es/drills';
import {toEs} from '@/lib/i18n/esPaths';
import {APP_LANGS,type AppLang} from '@/lib/i18n/appLangs';
/**
 * Practice plans for the coach app (round 4A, Nov 22 2026; owner: "keep them in the app"). Built at build time from the SAME
 * registry the site's /learn/soccer-practice-plans pages use (lib/site/plans.ts and its Spanish words), trimmed to what the app
 * shows, and served as one static JSON file (app/coach/plans-data/route.ts) that the app fetches only when the coach opens
 * Practice plans (no cost on the dashboard). Server only.
 */
export type CoachDrill={slug:string;name:string;skill:SkillId;steps:string[];cues:string[];scene:GridScene;desc:string;path:string};
export type CoachPlanRow={minutes:number;stage:string;activity:string;purpose:string;start:number;end:number;drill?:string};
export type CoachPlan={slug:string;age:string;name:string;h1:string;goal:string;minutes:number;players:string;field:string;rows:CoachPlanRow[];equipment:string[];notes:string[];swap:{sign:string;instead:string};drills:string[];path:string};
/** `en`: true when this language has no plan translation yet and the app shows the English plans with a note. */
export type CoachPlans={plans:CoachPlan[];drills:Record<string,CoachDrill>;en?:true};
const drillOf=(d:Drill|EsDrill,path:string):CoachDrill=>({slug:d.slug,name:d.name,skill:d.skill,steps:[...d.steps],cues:[...d.cues],scene:d.scene,desc:d.answer,path});
/** the site's Spanish plans keep the English field line (lib/site/plans.ts has no Spanish twin for it); the app says it in Spanish */
const FIELD_ES:Readonly<Record<string,string>>={
 '4v4 with no goalkeepers, on about 30 x 20 yards':'4v4 sin porteros, en unos 27 x 18 m',
 'Up to 7v7 with goalkeepers; a 7v7 field is 55 to 65 yards long':'Hasta 7v7 con porteros; una cancha de 7v7 mide de 50 a 60 m de largo',
 'Up to 9v9 with goalkeepers; a 9v9 field is 70 to 80 yards long':'Hasta 9v9 con porteros; una cancha de 9v9 mide de 65 a 75 m de largo'};
function pack(lang:'en'|'es'):CoachPlans{
 const drills:Record<string,CoachDrill>={},plans:CoachPlan[]=[];
 for(const en of PLANS){
  const p=(lang==='es'?esPlan(en.slug):en) as Plan&{esPath?:string;drills:(Drill|EsDrill)[]};
  for(const d of p.drills)drills[d.slug]??=drillOf(d,lang==='es'?toEs(d.path):d.path);
  plans.push({slug:p.slug,age:p.age,name:p.name,h1:p.h1,goal:p.goal,minutes:p.minutes,players:p.players,field:lang==='es'?FIELD_ES[p.field]??p.field:p.field,
   rows:p.rows.map(r=>({minutes:r.minutes,stage:lang==='es'?STAGE_ES[r.stage]??r.stage:r.stage,activity:r.activity,purpose:r.purpose,start:r.start,end:r.end,...(r.drill?{drill:r.drill.slug}:{})})),
   equipment:[...p.equipment],notes:[...p.notes],swap:{...p.swap},drills:p.drills.map(d=>d.slug),path:lang==='es'?toEs(en.path):en.path});
 }
 return {plans,drills};
}
/** The eight languages after EN/ES (round 4F, Nov 22 2026): lib/coach/plans/<lang>.json is a flat map of the English strings'
 *  keys (p.<plan>.name, p.<plan>.rows.<i>.purpose, d.<drill>.steps.<i>, d.<drill>.scene.caption ...; the keys are listed by
 *  planKeys below and checked by tests/coach-app.cjs). Any missing or empty key falls back to the English string. App only:
 *  the public /learn pages stay EN/ES. */
export const PLAN_TEXT_LANGS=APP_LANGS.filter(l=>l!=='en'&&l!=='es');
type Flat=Record<string,string>;
function readText(lang:string):Flat|null{
 try{return JSON.parse(readFileSync(join(process.cwd(),'lib/coach/plans',`${lang}.json`),'utf8')) as Flat;}catch{return null;}
}
/** every translatable string of the English pack, by key (the shape of lib/coach/plans/<lang>.json) */
export function planKeys(en:CoachPlans):Flat{
 const o:Flat={};
 for(const p of en.plans){const k=`p.${p.slug}.`;
  for(const f of ['name','h1','goal','players','field'] as const)o[k+f]=p[f];
  p.rows.forEach((r,i)=>{o[`${k}rows.${i}.stage`]=r.stage;o[`${k}rows.${i}.activity`]=r.activity;o[`${k}rows.${i}.purpose`]=r.purpose;});
  p.equipment.forEach((x,i)=>{o[`${k}equipment.${i}`]=x;});p.notes.forEach((x,i)=>{o[`${k}notes.${i}`]=x;});
  o[k+'swap.sign']=p.swap.sign;o[k+'swap.instead']=p.swap.instead;}
 for(const d of Object.values(en.drills)){const k=`d.${d.slug}.`;
  o[k+'name']=d.name;o[k+'desc']=d.desc;d.steps.forEach((x,i)=>{o[`${k}steps.${i}`]=x;});d.cues.forEach((x,i)=>{o[`${k}cues.${i}`]=x;});
  o[k+'scene.title']=d.scene.title;o[k+'scene.caption']=d.scene.caption;}
 return o;
}
function translate(en:CoachPlans,lang:string):CoachPlans{
 const t=readText(lang);if(!t)return {...en,en:true};
 const g=(k:string,v:string)=>{const x=t[k];return typeof x==='string'&&x.trim()?x:v;};
 const plans=en.plans.map(p=>{const k=`p.${p.slug}.`;return {...p,name:g(k+'name',p.name),h1:g(k+'h1',p.h1),goal:g(k+'goal',p.goal),
  players:g(k+'players',p.players),field:g(k+'field',p.field),
  rows:p.rows.map((r,i)=>({...r,stage:g(`${k}rows.${i}.stage`,r.stage),activity:g(`${k}rows.${i}.activity`,r.activity),purpose:g(`${k}rows.${i}.purpose`,r.purpose)})),
  equipment:p.equipment.map((x,i)=>g(`${k}equipment.${i}`,x)),notes:p.notes.map((x,i)=>g(`${k}notes.${i}`,x)),
  swap:{sign:g(k+'swap.sign',p.swap.sign),instead:g(k+'swap.instead',p.swap.instead)}};});
 const drills:Record<string,CoachDrill>={};
 for(const [slug,d] of Object.entries(en.drills)){const k=`d.${slug}.`;
  drills[slug]={...d,name:g(k+'name',d.name),desc:g(k+'desc',d.desc),steps:d.steps.map((x,i)=>g(`${k}steps.${i}`,x)),cues:d.cues.map((x,i)=>g(`${k}cues.${i}`,x)),
   scene:{...d.scene,title:g(k+'scene.title',d.scene.title),caption:g(k+'scene.caption',d.scene.caption)}};}
 return {plans,drills};
}
let memo:Record<AppLang,CoachPlans>|null=null;
export const coachPlans=():Record<AppLang,CoachPlans>=>{
 if(memo)return memo;
 const en=pack('en'),o={en,es:pack('es')} as Record<AppLang,CoachPlans>;
 for(const l of PLAN_TEXT_LANGS)o[l]=translate(en,l);
 return memo=o;
};
/** A short content hash: the app asks for /coach/plans-data?v=<it>, so the coach app's cache-first service worker gets new plans after a deploy. */
export const coachPlansVersion=()=>createHash('sha1').update(JSON.stringify(coachPlans())).digest('hex').slice(0,10);
