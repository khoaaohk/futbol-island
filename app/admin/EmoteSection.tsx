'use client';
/**
 * "Emotes" (Oct 22 2026, Phase A of docs/analytics-multiplayer-plan.md §5): emotes played by emote (the wheel set and the ride,
 * flying, swimming and townsperson sets), where (context), what answered (a townsperson, friends in a party, nobody), the
 * per-visit reach and the button → wheel → pick conversion. From report.emotes (lib/analytics/partyReport.ts), small-number
 * suppressed on the server ("<5"). Preset emote numbers only: never who an emote was aimed at.
 */
import type {Report} from '@/lib/analytics/core';
import type {Cell} from '@/lib/analytics/learning';
import type {EmoteRow,PartyRow} from '@/lib/analytics/partyReport';
import {BarList,ChartCard,fmtInt,fmtPct,type BarRow} from './charts';
import {Steps} from './StartSection';
import styles from './admin.module.css';

const show=(c:Cell)=>c===null?'<5':fmtInt(c);
const pct=(x:number|null)=>x===null?'—':fmtPct(x);
const bars=(rows:PartyRow[]):BarRow[]=>rows.map(r=>({key:r.id,label:r.label,value:r.value??0,text:r.value===null?'<5':undefined,detail:r.value===null?'fewer than 5 sessions':undefined}));
const GROUPS:[EmoteRow['group'],string][]=[['wheel','On foot (the wheel)'],['ride','On a ride'],['fly','Flying'],['swim','Swimming'],['npc','With a townsperson (skaters, scooters, jugglers)']];
const EMPTY='No emotes in this range yet. Counts arrive after the player leaves the tab, or every few minutes while they play.';

export default function EmoteSection({report}:{report:Report}){
 const E=report.emotes;
 const head=<div className={styles.sectionHead}>
  <h2 id="emotes-heading">Emotes</h2>
  <p>The preset emotes: which ones are played, where (on foot, on a ride, flying, swimming), whether a townsperson answered or it went to
   friends in a party, and how many visits use them. Preset emotes only: never who an emote was aimed at.</p>
  {E&&E.hidden>0&&<p className={styles.suppressNote}>Small numbers are hidden: {fmtInt(E.hidden)} {E.hidden===1?'cell rests':'cells rest'} on fewer than {E.min} sessions and {E.hidden===1?'shows':'show'} as “&lt;{E.min}”.</p>}
  {E&&E.partial&&<p className={styles.note}>Counting started {E.since}: days before it show nothing for this section.</p>}
 </div>;
 if(!E||E.status!=='ok')return <section className={styles.island} aria-labelledby="emotes-heading" data-emote-section data-status={E?.status??'none'}>{head}
  <ChartCard wide title="Emotes" subtitle="Emotes played, by emote and context" empty
   emptyText={E?.status==='not_yet'||!E?`Not tracked yet: emote counting starts ${E?.since??'with the Oct 22 2026 build'}.`:EMPTY} table={{columns:[],rows:[]}}><span/></ChartCard></section>;
 const byGroup=GROUPS.map(([g,title])=>({g,title,rows:E.byEmote.filter(r=>r.group===g)}));
 return <section className={styles.island} aria-labelledby="emotes-heading" data-emote-section data-status="ok">
  {head}
  <div className={styles.startTiles} aria-label="Emote headline">
   <div><span>Emotes played</span><b>{show(E.picks)}</b><small>every accepted pick</small></div>
   <div><span>Visits that emoted</span><b>{show(E.emotingSessions)}</b><small>{pct(E.emotingShare)} of {fmtInt(E.sessions)} sessions</small></div>
   <div><span>Per emoting visit</span><b>{E.perEmoter===null?'—':E.perEmoter.toFixed(1)}</b><small>emotes per visit that used them</small></div>
   <div><span>Townsperson answered</span><b>{pct(E.npcRate)}</b><small>of emotes played</small></div>
   <div><span>Wheel → pick</span><b>{pct(E.wheelConv)}</b><small>{show(E.wheelOpens)} wheel opens · {show(E.wheelNoPick)} closed with no pick · button seen in {show(E.btnSessions)} visits</small></div>
   <div><span>Streaks</span><b>{show(E.streaks)}</b><small>3+ emotes inside a minute (at most one a minute)</small></div>
   <div><span>Emote camera</span><b>{show(E.cam)}</b><small>times the camera zoomed in on an emote</small></div>
   <div><span>Friends’ emotes seen</span><b>{show(E.seen)}</b><small>a friend’s emote shown on screen in a party</small></div>
  </div>
  <div className={styles.grid}>
   {byGroup.map(({g,title,rows})=><ChartCard key={g} title={title} subtitle="Times played" table={{columns:['Emote','Times'],rows:rows.map(r=>[r.label,show(r.value)])}}>
    <BarList rows={rows.map(r=>({key:'e'+r.wire,label:r.label,value:r.value??0,text:r.value===null?'<5':undefined,detail:r.value===null?'fewer than 5 sessions':undefined}))} unit="times" limit={rows.length}/>
   </ChartCard>)}
   <ChartCard title="Where" subtitle="Context of each emote" table={{columns:['Context','Times'],rows:E.contexts.map(r=>[r.label,show(r.value)])}}>
    <BarList rows={bars(E.contexts)} unit="times" limit={E.contexts.length}/>
   </ChartCard>
   <ChartCard title="Who answered" subtitle="A party emote can also wake a townsperson, so these can add up to more than all emotes" table={{columns:['Target','Times'],rows:E.targets.map(r=>[r.label,show(r.value)])}}>
    <BarList rows={bars(E.targets)} unit="times" share={false} limit={E.targets.length}/>
   </ChartCard>
   <ChartCard title="Emotes per visit" subtitle="Sessions whose emotes reached each mark (cumulative)" table={{columns:['Mark','Sessions'],rows:E.reach.map(s=>[s.label,show(s.sessions)])}}>
    <Steps steps={E.reach}/>
   </ChartCard>
   {(E.variants??[]).map(v=>{const any=v.rows.some(r=>r.value!==0);
    return <ChartCard key={v.family} title={v.title} subtitle="Which move played, yours (a townsperson’s for reactions)" empty={!any} emptyText="None yet in this range (counted from the Oct 22 2026 Phase B build)."
     table={{columns:['Move','Times'],rows:v.rows.map(r=>[r.label,show(r.value)])}}>
     <BarList rows={v.rows.map(r=>({key:r.key,label:r.label,value:r.value??0,text:r.value===null?'<5':undefined,detail:r.value===null?'fewer than 5 sessions':undefined}))} unit="times" limit={v.rows.length}/>
    </ChartCard>;})}
  </div>
 </section>;
}
