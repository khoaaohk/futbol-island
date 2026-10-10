'use client';
/**
 * "Start page" (Oct 9 2026): who sees the title screen (at `/`; the old /start was removed) and what they tap there. Everything comes from report.start,
 * built and small-number-suppressed on the server (lib/analytics/startReport.ts): a null cell rests on fewer than 5 sessions in
 * the range and shows as "<5". Funnels are sessions per step (a step chart: one series in slot 1, bars scaled to the first
 * step, the drop from the step before printed beside each bar). Same cards, bars, tooltip and Table twins as the rest of /admin.
 */
import {useState} from 'react';
import type {Report,Row} from '@/lib/analytics/core';
import type {Cell} from '@/lib/analytics/learning';
import {funnelMath,type StartStep} from '@/lib/analytics/startReport';
import {BarList,ChartCard,Tip,fmtInt,fmtPct,useWidth,type BarRow,type TipState} from './charts';
import styles from './admin.module.css';

const EMPTY='No start-page visits in this range yet. Tap counts start with the Oct 9 2026 release; a visit’s numbers arrive after the visitor leaves the tab, or every few minutes.';
const NO_SPLIT='The start-page split by country, source and device needs the storage update (20261009_analytics_start.sql).';
const SOURCE_LABEL:Record<string,string>={direct:'Direct',search:'Search',social:'Social',referral:'Referral',campaign:'Campaign'};
const DEVICE_LABEL:Record<string,string>={phone:'Phone',tablet:'Tablet',desktop:'Desktop'};
const show=(c:Cell)=>c===null?'<5':fmtInt(c);
const bar=(key:string,label:string,c:Cell,detail?:string):BarRow=>({key,label,value:c??0,text:c===null?'<5':undefined,detail:c===null?'fewer than 5 sessions':detail});
const rowsBars=(rows:Row[],label:(k:string)=>string):BarRow[]=>rows.map(r=>({key:r.key,label:label(r.key),value:r.visitors,detail:`${fmtInt(r.sessions)} sessions`}));
const rowsTable=(rows:Row[],label:(k:string)=>string)=>({columns:['Name','Visitors','Sessions','Page views'],rows:rows.map(r=>[label(r.key),r.visitors,r.sessions,r.pageviews])});

/** Step chart: one row per step, the bar's length is its share of the first step, the drop from the previous step beside it. */
function Steps({steps,unit='sessions'}:{steps:StartStep[];unit?:string}){
 const [wrap,width]=useWidth<HTMLDivElement>();const [tip,setTip]=useState<TipState>(null);
 const math=funnelMath(steps.map(s=>s.sessions));
 const showTip=(el:HTMLElement,i:number)=>{if(!wrap.current)return;const box=wrap.current.getBoundingClientRect(),b=el.getBoundingClientRect(),m=math[i];
  setTip({x:b.left-box.left+b.width/2,y:b.top-box.top,content:<><strong>{show(steps[i].sessions)}</strong> {unit}{m.ofFirst!==null&&i>0?` · ${fmtPct(m.ofFirst)} of the first step`:''}<br/><span>{steps[i].label}{m.drop!==null?` · −${fmtPct(m.drop)} from the step before`:''}</span></>});};
 return <div className={styles.plot} ref={wrap}>
  <ol className={styles.steps}>
   {steps.map((s,i)=>{const m=math[i];return <li key={s.id} className={styles.step} tabIndex={0}
    aria-label={`${s.label}: ${show(s.sessions)} ${unit}${m.drop!==null?`, ${fmtPct(m.drop)} fewer than the step before`:''}`}
    onPointerEnter={e=>showTip(e.currentTarget,i)} onPointerLeave={()=>setTip(null)} onFocus={e=>showTip(e.currentTarget,i)} onBlur={()=>setTip(null)}>
    <span className={styles.stepLabel}>{s.label}</span>
    <span className={styles.barTrack}>{!!s.sessions&&<span className={styles.barFill} style={{width:`calc((100% - 64px) * ${i===0?1:(m.ofFirst??0)})`}}/>}<span className={styles.barValue}>{show(s.sessions)}</span></span>
    <span className={styles.stepDrop}>{i===0?'':m.drop===null?'—':<>−{fmtPct(m.drop)}</>}</span>
   </li>;})}
  </ol>
  <Tip tip={tip} width={width}/>
 </div>;
}
const stepsTable=(steps:StartStep[])=>{const m=funnelMath(steps.map(s=>s.sessions));return steps.map((s,i)=>[s.label,show(s.sessions),m[i].ofFirst===null?'—':fmtPct(m[i].ofFirst!),i===0||m[i].drop===null?'—':'−'+fmtPct(m[i].drop!)]);};

export default function StartSection({report,countryName}:{report:Report;countryName:(code:string)=>string}){
 const S=report.start,empty=!S||!S.hasData;
 const head=<div className={styles.sectionHead}>
  <h2 id="start-heading">Start page</h2>
  <p>Visitors who saw the title screen at futbolisland.app/ (sessions that showed it; before Oct 9 2026 also sessions that began on the old /start) and what they tap: Start and the save code, “I have a save code”, For grown-ups and its links, Donate and Privacy. Totals per button only: no typed text, no codes, no order of taps.</p>
  {S&&S.hidden>0&&<p className={styles.suppressNote}>Small numbers are hidden: {fmtInt(S.hidden)} {S.hidden===1?'cell rests':'cells rest'} on fewer than {S.min} sessions in this range and {S.hidden===1?'shows':'show'} as “&lt;{S.min}”.</p>}
 </div>;
 if(empty)return <section className={styles.island} aria-labelledby="start-heading">{head}
  <ChartCard wide title="Title-screen funnel" subtitle="Saw the title screen → Start → code made → code check → Play" empty emptyText={EMPTY} table={{columns:[],rows:[]}}><span/></ChartCard></section>;
 const v=S.visits,d=S.dims;
 const g=S.grown,p=S.privacy;
 const paidNote=g.paid===null?'<5':fmtInt(g.paid);
 return <section className={styles.island} aria-labelledby="start-heading">
  {head}
  <div className={styles.startTiles} aria-label="Start-page totals">
   <div><span>Visitors</span><b>{v.available?fmtInt(v.visitors):'—'}</b><small>{v.available?'unique per day, added up':'needs the storage update'}</small></div>
   <div><span>Sessions</span><b>{v.available?fmtInt(v.sessions):'—'}</b><small>saw the title screen</small></div>
   <div><span>Began on the old /start</span><b>{fmtInt(v.entered.sessions)}</b><small>{fmtInt(v.entered.visitors)} visitors</small></div>
   <div><span>Title screen views</span><b>{show(v.viewed)}</b><small>sessions that saw it</small></div>
  </div>
  {v.partial&&<p className={styles.note}>Some days in this range were saved before the start-page split, so its visitors, countries, sources and devices undercount those days.</p>}

  <div className={styles.grid}>
   <ChartCard wide title="Title-screen funnel" subtitle="Sessions at each step, the bar’s length as a share of the first step and the drop from the step before"
    table={{columns:['Step','Sessions','Of first step','Drop'],rows:S.funnels.flatMap(f=>[...stepsTable(f.steps).map(r=>[`${f.title}: ${r[0]}`,...r.slice(1)]),...f.side.map(s=>[`${f.title}: ${s.label}`,show(s.sessions),'—','—'])])}}>
    <div className={styles.funnels}>
     {S.funnels.map(f=><div key={f.id} className={styles.funnelBlock}>
      <p className={styles.miniHead}>{f.title}</p>
      <Steps steps={f.steps}/>
      {f.side.map(s=><p key={s.id} className={styles.note}>{s.label}: <b>{show(s.sessions)}</b> sessions</p>)}
      {f.id==='new'&&<p className={styles.note}>“Which word comes first?” right on the first pick: <b>{S.word.right===null||S.word.answered===null||!S.word.answered?show(S.word.right):fmtPct(S.word.right/S.word.answered)}</b> of {show(S.word.answered)} sessions.{S.tilt?<> Tilt button used in {show(S.tilt)} sessions.</>:null}</p>}
     </div>)}
    </div>
   </ChartCard>

   <ChartCard title="Countries" subtitle="Start-page visitors by country" empty={!d||!d.country.length} emptyText={d?'No start-page visits in this range yet.':NO_SPLIT} table={rowsTable(d?.country||[],countryName)}>
    <BarList rows={rowsBars(d?.country||[],countryName)} unit="visitors"/>
   </ChartCard>
   <ChartCard title="Where they come from" subtitle="Start-page visitors by source, referring site and campaign" empty={!d||!d.source.length} emptyText={d?'No start-page visits in this range yet.':NO_SPLIT}
    table={{columns:['Source','Visitors','Sessions','Page views'],rows:[...(d?.source||[]).map(r=>[SOURCE_LABEL[r.key]||r.key,r.visitors,r.sessions,r.pageviews]),...(d?.referrer||[]).map(r=>['Referrer: '+r.key,r.visitors,r.sessions,r.pageviews]),...(d?.campaign||[]).map(r=>['Campaign: '+r.key,r.visitors,r.sessions,r.pageviews])]}}>
    <BarList rows={rowsBars(d?.source||[],k=>SOURCE_LABEL[k]||k)} unit="visitors"/>
    {!!d?.referrer.length&&<><p className={styles.miniHead}>Referring sites</p><BarList rows={rowsBars(d.referrer,k=>k)} unit="visitors" limit={5}/></>}
    {!!d?.campaign.length&&<><p className={styles.miniHead}>Campaigns</p><BarList rows={rowsBars(d.campaign,k=>k)} unit="visitors" limit={5}/></>}
   </ChartCard>
   <ChartCard title="Devices" subtitle="Start-page visitors by device class" empty={!d||!d.device.length} emptyText={d?'No start-page visits in this range yet.':NO_SPLIT} table={rowsTable(d?.device||[],k=>DEVICE_LABEL[k]||k)}>
    <BarList rows={rowsBars(d?.device||[],k=>DEVICE_LABEL[k]||k)} unit="visitors"/>
   </ChartCard>

   <ChartCard title="For grown-ups" subtitle="Sessions that opened the sheet, tapped each link in it, and the donation steps"
    table={{columns:['Measure','Sessions','Taps'],rows:[['Opened For grown-ups',show(g.opened),'—'],...g.links.map(l=>['Link: '+l.label,show(l.sessions),show(l.clicks)]),
     ...stepsTable(g.donate).map(r=>['Donate: '+r[0],r[1],'—']),['Donate: cancelled the grown-up check',show(g.gateNo),'—'],...g.amounts.map(a=>[`Amount $${a.amount}`,show(a.sessions),show(a.clicks)]),['Donation completed (back from Stripe)',paidNote,'—']]}}>
    <p className={styles.miniHead}>Links tapped</p>
    <BarList rows={g.links.map(l=>bar(l.id,l.label,l.sessions,l.clicks===null?undefined:`${fmtInt(l.clicks)} taps`))} unit="sessions" share={false} limit={g.links.length}/>
    <p className={styles.miniHead}>Donate</p>
    <Steps steps={g.donate}/>
    <p className={styles.note}>Cancelled the grown-up check: <b>{show(g.gateNo)}</b>. A grown-up who passed the check in the last few minutes goes straight to the amounts.</p>
    <p className={styles.miniHead}>Amount chosen</p>
    <BarList rows={g.amounts.map(a=>bar('a'+a.amount,`$${a.amount}`,a.sessions,a.clicks===null?undefined:`${fmtInt(a.clicks)} taps`))} unit="sessions" limit={g.amounts.length}/>
    <div className={styles.lengthStats}><span>Donations completed <b>{paidNote}</b></span><span className={styles.note}>sessions back from Stripe on the title screen</span></div>
   </ChartCard>

   <ChartCard title="Privacy" subtitle="Sessions that opened the privacy policy, and the sections they jumped to from its contents"
    table={{columns:['Measure','Sessions'],rows:[['Opened from the Privacy link',show(p.fromLink)],['Opened from For grown-ups',show(p.fromGrown)],...p.sections.map(s=>['Contents: '+s.label,show(s.sessions)])]}}>
    <div className={styles.lengthStats}><span>From the Privacy link <b>{show(p.fromLink)}</b></span><span>From For grown-ups <b>{show(p.fromGrown)}</b></span></div>
    <p className={styles.miniHead}>Sections jumped to</p>
    {p.sections.some(s=>s.sessions!==0)?<BarList rows={p.sections.filter(s=>s.sessions!==0).map(s=>bar(s.id,s.label,s.sessions))} unit="sessions" limit={19}/>:<p className={styles.note}>No table-of-contents taps in this range.</p>}
   </ChartCard>
  </div>
 </section>;
}
