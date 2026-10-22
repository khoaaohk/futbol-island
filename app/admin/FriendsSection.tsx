'use client';
/**
 * "Friends & parties" (Oct 22 2026, Phase A of docs/analytics-multiplayer-plan.md §3–§4, §6): the Play with friends funnel (host
 * and guest lanes), join failures, party size / length / first-friend bands, minutes played with friends vs solo, invites and the
 * party controls. Everything comes from report.party, built and small-number-suppressed on the server (lib/analytics/partyReport.ts):
 * a null cell rests on fewer than 5 sessions (or, in the party bands, fewer than 5 parties) and shows as "<5". Totals and bands
 * only: never a code, a name or who played with whom. Internal only: no sponsor export in Phase A.
 */
import type {Report} from '@/lib/analytics/core';
import type {Cell} from '@/lib/analytics/learning';
import type {PartyRow} from '@/lib/analytics/partyReport';
import {BarList,ChartCard,LineChart,fmtInt,fmtPct,type BarRow} from './charts';
import {Steps} from './StartSection';
import RelayHealth from './RelayHealth';
import type {RelayStatsReport} from '@/lib/analytics/relayStatsTypes';
import styles from './admin.module.css';

const show=(c:Cell)=>c===null?'<5':fmtInt(c);
const pct=(x:number|null)=>x===null?'—':fmtPct(x);
const bars=(rows:PartyRow[],unit='sessions'):BarRow[]=>rows.map(r=>({key:r.id,label:r.label,value:r.value??0,text:r.value===null?'<5':undefined,detail:r.value===null?`fewer than 5 ${unit}`:undefined}));
const table=(rows:PartyRow[],col='Count')=>({columns:['Item',col],rows:rows.map(r=>[r.label,show(r.value)])});
const EMPTY='No Play with friends activity in this range yet. Counts arrive after the player leaves the tab, or every few minutes while they play.';

/** `relay`: tests / previews pass the relay's stats directly; otherwise RelayHealth fetches them for the report's range. */
export default function FriendsSection({report,relay}:{report:Report;relay?:RelayStatsReport|null}){
 const P=report.party;
 const health=<RelayHealth from={report.from} to={report.to} initial={relay}/>;
 const head=<div className={styles.sectionHead}>
  <h2 id="friends-heading">Friends &amp; parties</h2>
  <p>Play with friends: how often the card is opened, parties started and joined (and why a join did not work), party sizes and lengths
   in broad bands, minutes played together, invites shared. Totals and bands only: never a party code, a name or who played with whom.
   Party sizes and lengths come from the host’s device when the party ends (approximate: a closed-down host tab sends none).</p>
  {P&&P.hidden>0&&<p className={styles.suppressNote}>Small numbers are hidden: {fmtInt(P.hidden)} {P.hidden===1?'cell rests':'cells rest'} on fewer than {P.min} sessions (or {P.minParties} parties) and {P.hidden===1?'shows':'show'} as “&lt;{P.min}”.</p>}
  {P&&P.partial&&<p className={styles.note} data-party-partial>Counting started {P.since}: days before it show nothing for this section.</p>}
 </div>;
 if(!P||P.status!=='ok')return <section className={styles.island} aria-labelledby="friends-heading" data-friends-section data-status={P?.status??'none'}>{head}
  <ChartCard wide title="Play with friends" subtitle="Funnel, party sizes and minutes together" empty
   emptyText={P?.status==='not_yet'||!P?`Not tracked yet: Play with friends counting starts ${P?.since??'with the Oct 22 2026 build'}.`:EMPTY} table={{columns:[],rows:[]}}><span/></ChartCard>{health}</section>;
 const inv=P.invites;
 const daysWith=P.daily.filter(d=>d.party!==null);
 return <section className={styles.island} aria-labelledby="friends-heading" data-friends-section data-status="ok">
  {head}
  <div className={styles.startTiles} aria-label="Friends and parties headline">
   <div><span>Played in a party</span><b>{show(P.inParty)}</b><small>{pct(P.inShare)} of {fmtInt(P.sessions)} sessions</small></div>
   <div><span>Parties started</span><b>{show(P.parties)}</b><small>{P.joinsPerParty===null?'—':P.joinsPerParty.toFixed(1)} guests joined per party</small></div>
   <div><span>Minutes with friends</span><b>{show(P.minutes)}</b><small>{pct(P.minuteShare)} of {fmtInt(P.islandMinutes)} island minutes</small></div>
   <div><span>Party size</span><b>{P.avgSize===null?'—':`≈${P.avgSize.toFixed(1)}`}</b><small>{P.medianSize?`median band: ${P.medianSize}`:`needs ${P.minParties}+ parties`}</small></div>
   <div><span>Party length</span><b>{P.medianLen??'—'}</b><small>median band{P.histParties?` over ${fmtInt(P.histParties)} parties`:''}</small></div>
   <div><span>Invites</span><b>{show(inv.shared===null||inv.copied===null?null:inv.shared+inv.copied)}</b><small>{show(inv.shared)} shared · {show(inv.copied)} copied · {inv.perParty===null?'—':inv.perParty.toFixed(1)} per party</small></div>
   <div><span>Invite link → joined</span><b>{pct(inv.linkConv)}</b><small>{show(inv.linkOpens)} link opens · {show(inv.linkJoins)} joined from a link</small></div>
  </div>
  <div className={styles.grid}>
   <ChartCard title="Host funnel" subtitle="Sessions per step: opened → grown-up check → name → Start → code → live → a friend joined" table={{columns:['Step','Sessions'],rows:P.host.map(s=>[s.label,show(s.sessions)])}}>
    <Steps steps={P.host}/>
   </ChartCard>
   <ChartCard title="Guest funnel" subtitle="Sessions per step: opened (HUD, invite link or title screen) → Join → live" table={{columns:['Step','Sessions'],rows:P.guest.map(s=>[s.label,show(s.sessions)])}}>
    <Steps steps={P.guest}/>
   </ChartCard>
   <ChartCard title="Why a join or start failed" subtitle="Failed joins by reason, and failed starts" table={table(P.failures)}>
    <BarList rows={bars(P.failures)} unit="times" share={false} limit={P.failures.length}/>
   </ChartCard>
   <ChartCard title="Party size" subtitle={`Most players at once, one per party (host’s device; bands under ${P.minParties} parties hidden)`} table={table(P.peak,'Parties')}>
    <BarList rows={bars(P.peak,'parties')} unit="parties" limit={P.peak.length}/>
   </ChartCard>
   <ChartCard title="Party length" subtitle="How long each party ran, one per party" table={table(P.len,'Parties')}>
    <BarList rows={bars(P.len,'parties')} unit="parties" limit={P.len.length}/>
   </ChartCard>
   <ChartCard title="Time to the first friend" subtitle="From the host going live to the first friend arriving" table={table(P.firstFriend,'Parties')}>
    <BarList rows={bars(P.firstFriend,'parties')} unit="parties" limit={P.firstFriend.length}/>
   </ChartCard>
   <ChartCard title="Minutes with friends per visit" subtitle="Sessions whose party minutes reached each mark (cumulative)" table={{columns:['Mark','Sessions'],rows:P.minReach.map(s=>[s.label,show(s.sessions)])}}>
    <Steps steps={P.minReach}/>
   </ChartCard>
   <ChartCard title="Minutes: with friends vs solo" subtitle="Per day: party minutes and the rest of the island minutes" empty={!daysWith.length}
    emptyText="Every day is under 5 party sessions on its own, so the days are not shown one by one."
    table={{columns:['Day','With friends','Solo'],rows:P.daily.map(d=>[d.day,show(d.party),fmtInt(d.solo)])}}>
    <LineChart labels={P.daily.map(d=>d.day.slice(5))} ariaLabel="Minutes with friends and solo per day"
     series={[{key:'party',label:'With friends',color:'var(--s1)'},{key:'solo',label:'Solo',color:'var(--s2)'}]}
     values={{party:P.daily.map(d=>d.party??0),solo:P.daily.map(d=>d.solo)}}/>
   </ChartCard>
   <ChartCard title="Party controls" subtitle="New code, close / open, remove, hide, mute, the Code / List tabs, End and Leave, refused name characters, map pings" table={table(P.controls)}>
    <BarList rows={bars(P.controls)} unit="times" share={false} limit={P.controls.length}/>
   </ChartCard>
   <ChartCard title="Learning together" subtitle="Lessons and quizzes started while in a party (on the learner’s own device)" table={table(P.learning)}>
    <BarList rows={bars(P.learning)} unit="times" share={false} limit={P.learning.length}/>
   </ChartCard>
   <ChartCard title="First parties" subtitle="The first party (and first hosted party) on a device; repeat hosting = parties started minus first hosts"
    table={{columns:['Item','Count'],rows:[['First party on a device',show(P.firsts.party)],['First hosted party on a device',show(P.firsts.host)],['Repeat hosting',show(P.firsts.repeatHosting)]]}}>
    <BarList rows={[{key:'fp',label:'First party on a device',value:P.firsts.party??0,text:P.firsts.party===null?'<5':undefined},{key:'fh',label:'First hosted party',value:P.firsts.host??0,text:P.firsts.host===null?'<5':undefined},
     {key:'rh',label:'Repeat hosting',value:P.firsts.repeatHosting??0,text:P.firsts.repeatHosting===null?'<5':undefined}]} unit="parties" share={false} limit={3}/>
   </ChartCard>
  </div>
  {health}
 </section>;
}
