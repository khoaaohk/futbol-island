/**
 * The smart Welcome back suggestion's admin reading (Nov 14 2026, docs/welcome-suggestions.md): built on the SERVER from the
 * range's merged daily totals, like holdoutReport.ts. Totals only (the ws: counters, lib/analytics/countIds.ts WELCOME_COUNT_IDS):
 * per kind shown / tapped / acted, and per holdout arm the notes shown and the share that came back within 7 days. Pure and
 * client-safe (the admin card, app/admin/WelcomeSuggestCard.tsx, imports the types only).
 */
import type {Merged} from './core';
import {WELCOME_ARMS} from './countIds';
import {WELCOME_KINDS} from '../welcome/kinds';

export type WelcomeKindRow={kind:string;shown:number;tapped:number;acted:number;tapShare:number|null};
export type WelcomeArmRow={arm:typeof WELCOME_ARMS[number];notes:number;back7:number;backShare:number|null};
export type WelcomeReport={status:'empty'|'ok';kinds:WelcomeKindRow[];arms:WelcomeArmRow[];none:number;
 totals:{shown:number;tapped:number;acted:number}};
const round2=(x:number)=>Math.round(x*100)/100;

export function buildWelcome(m:Pick<Merged,'counts'>):WelcomeReport{
 const C=m.counts,v=(id:string)=>C[id]||0;
 const kinds=WELCOME_KINDS.map(k=>{const shown=v('ws:s_'+k),tapped=v('ws:t_'+k),acted=v('ws:a_'+k);
  return {kind:k,shown,tapped,acted,tapShare:shown>0?round2(Math.min(1,tapped/shown)):null};}).filter(r=>r.shown||r.tapped||r.acted);
 const arms=WELCOME_ARMS.map(arm=>{const notes=v('ws:arm_'+arm),back7=v('ws:back_'+arm);return {arm,notes,back7,backShare:notes>0?round2(Math.min(1,back7/notes)):null};});
 const totals=kinds.reduce((a,r)=>({shown:a.shown+r.shown,tapped:a.tapped+r.tapped,acted:a.acted+r.acted}),{shown:0,tapped:0,acted:0});
 return {status:arms.some(a=>a.notes>0)||totals.shown>0?'ok':'empty',kinds,arms,none:v('ws:none'),totals};
}
