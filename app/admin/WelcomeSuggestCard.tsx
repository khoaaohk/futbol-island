'use client';
/**
 * "Welcome back suggestions" (Nov 14 2026, docs/welcome-suggestions.md; Players and retention tab): the smart Welcome back note's
 * suggestion, totals only, from report.welcome (lib/analytics/welcomeReport.ts). Per kind: shown, tapped, acted (the player got
 * there). Per holdout arm (10% of devices get the plain line only): notes shown and the share back within 7 days, so the two
 * return rates can be compared. The existing ChartCard + BarList (no new chart type).
 */
import type {WelcomeReport} from '@/lib/analytics/welcomeReport';
import {BarList,ChartCard,fmtInt,fmtPct} from './charts';
import styles from './admin.module.css';

export const WELCOME_KIND_LABEL:Record<string,string>={fish_set:'Fish: finish a set',fish_day:'Fish: fish of the day',fish_visitor:'Fish: visitor leaving',
 fish_sunset:'Fish: sunset spot',fish_go:'Fish: go fishing',lesson_grad:'Lesson: 1 to graduate',lesson_streak:'Lesson: keep the streak',lesson_next:'Lesson: next up',
 lesson_weekend:'Lesson: weekend',arcade_pennant:'Arcade: pennant day',arcade_near:'Arcade: almost your best',arcade_daily:'Arcade: today’s challenge',arcade_go:'Arcade: favourite game',
 kit_news:'Kit Shop: new',kit_design:'Kit Shop: design',cross_fish_lesson:'Cross: fisher → lesson',cross_arcade_lesson:'Cross: arcade → passing lesson',
 cross_lesson_arcade:'Cross: learner → Pass Puzzle',cross_roam_fish:'Cross: explorer → fishing',cross_kit_arcade:'Cross: Kit Shop → Kit Rush'};
const pct=(x:number|null)=>x===null?'—':fmtPct(x);

export default function WelcomeSuggestCard({data}:{data:WelcomeReport|null|undefined}){
 const kinds=data?.kinds??[],arms=data?.arms??[],t=data?.totals??{shown:0,tapped:0,acted:0};
 const on=arms.find(a=>a.arm==='on'),hold=arms.find(a=>a.arm==='hold');
 return <div data-welcome-suggest-card data-status={data?.status??'none'}>
  <ChartCard title="Welcome back suggestions" subtitle={`Shown ${fmtInt(t.shown)} · tapped ${fmtInt(t.tapped)} · acted ${fmtInt(t.acted)}. The one line in the Welcome back note, picked on each device from what that player plays. Totals only.`}
   empty={!data||data.status==='empty'} emptyText="No Welcome back notes in this range yet."
   table={{columns:['Kind','Shown','Tapped','Acted','Tap share'],rows:kinds.map(k=>[WELCOME_KIND_LABEL[k.kind]??k.kind,k.shown,k.tapped,k.acted,pct(k.tapShare)])}}>
   <BarList unit="shown" share={false} rows={kinds.map(k=>({key:k.kind,label:WELCOME_KIND_LABEL[k.kind]??k.kind,value:k.shown,
    detail:`${fmtInt(k.tapped)} tapped · ${fmtInt(k.acted)} acted · ${pct(k.tapShare)}`}))}/>
   <p className={styles.note} data-welcome-holdout>Back within 7 days: with suggestions {pct(on?.backShare??null)} of {fmtInt(on?.notes??0)} notes · holdout (plain line, 10% of devices) {pct(hold?.backShare??null)} of {fmtInt(hold?.notes??0)} notes{data?.none?` · ${fmtInt(data.none)} notes had nothing to suggest`:''}.</p>
  </ChartCard>
 </div>;
}
