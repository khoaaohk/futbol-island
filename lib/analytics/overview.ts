/**
 * The investor overview of the admin report (Oct 11 2026), built on the SERVER from the range's merged totals and the same
 * totals for the period just before it (same length), plus a per-day series of the save-code moments on the title screen.
 * Same small-number rule as learning.ts / startReport.ts: a counter resting on fewer than MIN_SESSIONS sessions (in the range,
 * or on one day for the daily series) is sent as null and shown as "<5".
 *
 * Visitors are counted per day with a salt that is deleted every night, so the same person on two days cannot be linked (by
 * design). "Players per day" is therefore the average of the daily unique visitors; week- and month-wide unique players come
 * from save codes instead (lib/saves/metrics.ts, active codes in the last 7 / 30 days).
 * Oct 12 2026: the average is over complete days only (report.ts perDayOf); `perDay` carries it with how many days it used.
 */
import type {DailyRollup,Merged} from './core';
import {MIN_SESSIONS,type Cell} from './learning';
import {LESSON_TEXT} from './learningText.generated';
import {IDP_COUNT_EVENTS,LEARN_FORMATS,optionKey,questionKey} from './countIds';

/** Average daily unique visitors over `days` complete days (`visitorDays` = their sum). */
export type PerDay={value:number;days:number;visitorDays:number};
export type PeriodTotals={visitors:number;sessions:number;pageviews:number;engagedMs:number;medianMs:number;days:number;perDay:PerDay;
 /** sessions per id (save-code and engagement moments), suppressed */
 steps:Record<string,Cell>;
 lessonsFinished:Cell;quizzesStarted:Cell;perfectQuizzes:Cell;firstTry:{right:number;tries:number}|null;pathsLaunched:Cell;graduations:Cell};
export type DayCells={day:string;created:Cell;restored:Cell;returning:Cell;breaks:Cell;restoreFails:Cell};
export type Overview={min:number;from:string;to:string;prevFrom:string;prevTo:string;current:PeriodTotals;previous:PeriodTotals|null;daily:DayCells[];
 plan:{id:string;label:string;sessions:Cell}[]};

/** The title-screen and save-code steps the overview reads (startIds.ts). */
export const OVERVIEW_STEPS=['st:view','st:start','st:created','st:saved','st:play_ready','st:have','st:restored','st:play_restored','st:restore_fail','st:returning','st:play_returning','st:break','st:play_break'] as const;

const cellOf=(n:number|undefined):Cell=>{const v=n||0;return v>=MIN_SESSIONS?v:v>0?null:0;};
const sumPrefix=(rec:Record<string,number>,re:RegExp)=>Object.entries(rec).reduce((a,[k,v])=>re.test(k)?a+v:a,0);

export function periodTotals(m:Merged,days:number,perDay?:PerDay):PeriodTotals{
 const s=m.countSessions,c=m.counts;
 const steps=Object.fromEntries(OVERVIEW_STEPS.map(id=>[id,cellOf(s[id])]));
 // A counter total shows only when the sessions behind it reach MIN_SESSIONS.
 const guarded=(countRe:RegExp,sessRe:RegExp):Cell=>{const ss=sumPrefix(s,sessRe);return ss>=MIN_SESSIONS?sumPrefix(c,countRe):ss>0?null:0;};
 let right=0,tries=0;
 for(const [,id,,qs] of LESSON_TEXT)qs.forEach(([,,correct],i)=>{if((s[questionKey(id,i)]||0)<MIN_SESSIONS)return;tries+=c[questionKey(id,i)]||0;right+=c[optionKey(id,i,correct)]||0;});
 return {visitors:m.totals.visitors,sessions:m.totals.sessions,pageviews:m.totals.pageviews,engagedMs:m.totals.engagedMs,medianMs:m.totals.medianMs,days,steps,
  perDay:perDay??{value:days?m.totals.visitors/days:0,days,visitorDays:m.totals.visitors},
  lessonsFinished:guarded(/^lf:/,/^lf:/),quizzesStarted:guarded(/^ls:/,/^ls:/),perfectQuizzes:guarded(/^la:/,/^la:/),firstTry:tries?{right,tries}:null,
  pathsLaunched:guarded(new RegExp(`^pf:(${LEARN_FORMATS.join('|')})$`),new RegExp(`^pf:(${LEARN_FORMATS.join('|')})$`)),graduations:cellOf(sumPrefix(s,/^gr:/))};
}

export function buildOverview(cur:{merged:Merged;rollups:DailyRollup[];from:string;to:string;perDay?:PerDay},prev:{merged:Merged;days:number;from:string;to:string;perDay?:PerDay}|null):Overview{
 const daily=cur.rollups.map(r=>{const s=r.countSessions||{};
  return {day:r.day,created:cellOf(s['st:created']),restored:cellOf(s['st:restored']),returning:cellOf(s['st:returning']),breaks:cellOf(s['st:break']),restoreFails:cellOf(s['st:restore_fail'])};});
 return {min:MIN_SESSIONS,from:cur.from,to:cur.to,prevFrom:prev?.from??'',prevTo:prev?.to??'',
  current:periodTotals(cur.merged,cur.rollups.length,cur.perDay),previous:prev?periodTotals(prev.merged,prev.days,prev.perDay):null,daily,
  plan:IDP_COUNT_EVENTS.map(([id,label])=>({id,label,sessions:cellOf(cur.merged.countSessions['ip:'+id])}))};
}
