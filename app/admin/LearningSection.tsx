'use client';
/**
 * "Learning" (Oct 9 2026): the lesson funnel per format, quiz item analysis (hardest / too easy, with distractor bars), the
 * welcome walkthrough, how far players get, Paths format share and graduations, warm-ups, and settings at start. Everything
 * comes from report.learning, built and small-number-suppressed on the server (lib/analytics/learning.ts): a null cell rests on
 * fewer than 5 sessions in the range and is shown as "<5" (or merged into a hidden remainder). The date range above scopes it.
 * Same cards, bars, tooltip and Table twins as the rest of /admin (dataviz method: one series in slot 1, thin marks, a legend
 * only where two series meet, status colour only with an icon and a label).
 */
import {useState,type CSSProperties} from 'react';
import type {Report} from '@/lib/analytics/core';
import {LESSON_STAGES} from '@/lib/analytics/countIds';
import type {Cell,FunnelLesson,LearningReport,QuestionRow} from '@/lib/analytics/learning';
import {BarList,ChartCard,Tip,fmtInt,fmtPct,useWidth,type BarRow,type TipState} from './charts';
import styles from './admin.module.css';

const EMPTY='No learning data in this range yet. It starts with the Oct 9 2026 release, and a visit’s numbers arrive after the player leaves the tab, or every few minutes while they play.';
const FORMAT_LABEL:Record<string,string>={'7v7':'7v7','9v9':'9v9','11v11':'11v11',futsal:'Futsal'};
const FUNNEL_STEP=LESSON_STAGES.map(([,l])=>l);
/** Classical test theory bands (docs/analytics-roadmap.md #2): first-try share outside 30–92% needs a look. */
const HARD=0.3,EASY=0.92,IMPLAUSIBLE=0.03;
/** "Rarely picked" (a distractor under 3%) only means something once there are enough first tries to tell. */
const RARE_MIN=30;
const show=(c:Cell)=>c===null?'<5':fmtInt(c);
const pctOf=(c:Cell,d:Cell)=>c===null||!d?null:c/d;
const bar=(key:string,label:string,c:Cell,detail?:string):BarRow=>({key,label,value:c??0,text:c===null?'<5':undefined,detail:c===null?'fewer than 5 sessions':detail});

export default function LearningSection({report}:{report:Report}){
 const L=report.learning,empty=!L||!L.hasData;
 return <section className={styles.island} aria-labelledby="learning-heading">
  <div className={styles.sectionHead}>
   <h2 id="learning-heading">Learning</h2>
   <p>Sessions that reached each step of a lesson, how each quiz question is answered on the first try, and where players are on their paths. Totals per lesson, question and step only: no answers typed, no player ids, no order of events. A visit’s numbers arrive after the player leaves the tab, or every few minutes while they play.</p>
   {L&&L.hidden>0&&<p className={styles.suppressNote}>Small numbers are hidden: {fmtInt(L.hidden)} {L.hidden===1?'cell rests':'cells rest'} on fewer than {L.min} sessions in this range and {L.hidden===1?'shows':'show'} as “&lt;{L.min}” or {L.hidden===1?'is':'are'} left out.</p>}
  </div>
  {empty?<ChartCard wide title="Lesson funnel" subtitle="Opened → watched to the end → quiz started → quiz finished → all right first try" empty emptyText={EMPTY} table={{columns:[],rows:[]}}><span/></ChartCard>:<>
   <div className={styles.grid}>{L.formats.map(f=><FunnelCard key={f.format} format={f.format} lessons={f.lessons} quiet={f.quiet} questions={L.questions}/>)}</div>
   <div className={styles.grid}>
    <QuestionsCard title="Hardest questions" subtitle={`Under 60% right on the first try, lowest first (under ${fmtPct(HARD)} is too hard for most)`} rows={[...L.questions].filter(q=>q.firstTry<0.6).sort((a,b)=>a.firstTry-b.firstTry||b.sessions-a.sessions).slice(0,6)}
     emptyText="No question is answered right on the first try by fewer than 60% of players in this range."/>
    <QuestionsCard title="Too easy" subtitle={`Over ${fmtPct(EASY)} right on the first try: they teach little`} rows={[...L.questions].filter(q=>q.firstTry>EASY).sort((a,b)=>b.firstTry-a.firstTry||b.sessions-a.sessions).slice(0,6)}
     emptyText={`No question is answered right on the first try by more than ${fmtPct(EASY)} of players in this range.`}/>
   </div>
   <div className={styles.grid}>
    <WalkthroughCard w={L.walkthrough}/>
    <SkipCard w={L.walkthrough}/>
    <ProgressCard p={L.progress}/>
    <PathsCard paths={L.paths}/>
    <SettingsCard s={L.settings}/>
    <VoicesCard s={L.settings}/>
   </div>
  </>}
 </section>;
}

/** Five slim columns, one per stage, scaled to the lesson's own "opened" (one series, slot 1). Withheld stages draw no mark. */
function MiniFunnel({lesson,onTip}:{lesson:FunnelLesson;onTip:(el:HTMLElement|null,l:FunnelLesson)=>void}){
 const top=Math.max(1,...lesson.stages.map(s=>s??0));
 return <span className={styles.miniFunnel} aria-hidden="true" onPointerEnter={e=>onTip(e.currentTarget,lesson)} onPointerLeave={()=>onTip(null,lesson)}>
  {lesson.stages.map((s,i)=><i key={i} data-drop={lesson.drop?.stage===i||undefined} style={{'--h':s===null?0:s/top} as CSSProperties}/>)}
 </span>;
}

function FunnelCard({format,lessons,quiet,questions}:{format:string;lessons:FunnelLesson[];quiet:number;questions:QuestionRow[]}){
 const [all,setAll]=useState(false),[open,setOpen]=useState<string|null>(null);
 const [wrap,width]=useWidth<HTMLDivElement>();const [tip,setTip]=useState<TipState>(null);
 const onTip=(el:HTMLElement|null,l:FunnelLesson)=>{if(!el||!wrap.current){setTip(null);return;}const box=wrap.current.getBoundingClientRect(),b=el.getBoundingClientRect();
  setTip({x:b.left-box.left+b.width/2,y:b.top-box.top,content:<><span style={{display:'block',fontWeight:700,marginBottom:4}}>{l.name}</span>{l.stages.map((s,i)=><span key={i} style={{display:'block',fontWeight:400}}><b style={{fontWeight:700}}>{show(s)}</b> {FUNNEL_STEP[i].toLowerCase()}</span>)}</>});};
 const shown=all?lessons:lessons.slice(0,8);
 return <ChartCard title={`${FORMAT_LABEL[format]} lesson funnel`} subtitle="Sessions at each step: opened, watched to the end, quiz started, finished, all right first try. Biggest drop first; tap a lesson for its questions."
  empty={!lessons.length} emptyText={quiet?`${quiet} ${quiet===1?'lesson has':'lessons have'} activity, each from fewer than 5 sessions in this range (hidden).`:EMPTY}
  table={{columns:['Lesson',...FUNNEL_STEP,'Biggest drop'],rows:lessons.map(l=>[l.name,...l.stages.map(show),l.drop?`${fmtPct(l.drop.share)} before “${FUNNEL_STEP[l.drop.stage].toLowerCase()}”`:'—'])}}>
  <div className={styles.plot} ref={wrap}>
   <div className={styles.funnelHead} aria-hidden="true"><span>Lesson</span><span>Opened → all right</span><span>Biggest drop</span></div>
   <ul className={styles.funnelList}>
    {shown.map(l=>{const qs=questions.filter(q=>q.lesson===l.id);return <li key={l.id}>
     <button type="button" className={styles.funnelRow} aria-expanded={open===l.id} onClick={()=>setOpen(o=>o===l.id?null:l.id)}
      aria-label={`${l.name}: ${l.stages.map((s,i)=>`${show(s)} ${FUNNEL_STEP[i].toLowerCase()}`).join(', ')}${l.drop?`. Biggest drop ${fmtPct(l.drop.share)} before ${FUNNEL_STEP[l.drop.stage].toLowerCase()}`:''}`}>
      <span className={styles.barLabel}>{l.name}</span>
      <MiniFunnel lesson={l} onTip={onTip}/>
      <span className={styles.funnelDrop}>{l.drop&&l.drop.share>0?<><b>−{fmtPct(l.drop.share)}</b> {FUNNEL_STEP[l.drop.stage].toLowerCase()}</>:'—'}</span>
     </button>
     {open===l.id&&<div className={styles.funnelQs}>{qs.length?qs.map(q=><QuestionItem key={q.index} q={q} compact/>):<p className={styles.note}>No question here has answers from 5 or more sessions in this range yet.</p>}</div>}
    </li>;})}
   </ul>
   {lessons.length>8&&<button type="button" className={styles.tableToggle} style={{justifySelf:'start'}} aria-expanded={all} onClick={()=>setAll(a=>!a)}>{all?'Show fewer':`Show all ${lessons.length} lessons`}</button>}
   {quiet>0&&<p className={styles.note}>{quiet} more {quiet===1?'lesson has':'lessons have'} activity from fewer than 5 sessions each (hidden).</p>}
   <Tip tip={tip} width={width}/>
  </div>
 </ChartCard>;
}

/** One question: its text, first-try share, and the share of first tries each option got (right answer vs the others). */
function QuestionItem({q,compact=false}:{q:QuestionRow;compact?:boolean}){
 const flag=q.firstTry<HARD?'Hard':q.firstTry>EASY?'Too easy':null;
 return <div className={styles.question}>
  {!compact&&<small className={styles.qMeta}>{FORMAT_LABEL[q.format]} · {q.lessonName} · Q{q.index+1}</small>}
  <p className={styles.qText}>{compact?`Q${q.index+1}. `:''}{q.text}</p>
  <p className={styles.qStat}><b>{fmtPct(q.firstTry)}</b> right on the first try · {fmtInt(q.attempts)} first tries from {fmtInt(q.sessions)} sessions{flag&&<span className={styles.qFlag}> · {flag}</span>}</p>
  <ul className={styles.options}>
   {q.options.map((o,i)=><li key={i} className={styles.option} data-correct={o.correct||undefined} tabIndex={0} aria-label={`${o.correct?'Right answer':'Option'}: ${o.text}. ${o.share===null?'fewer than 5 sessions':fmtPct(o.share)+' of first tries'}`}>
    <span className={styles.optText}>{o.correct&&<span className={styles.tick} aria-hidden="true">✓ </span>}{o.text}</span>
    <span className={styles.barTrack}><span className={styles.optFill} style={{width:`calc((100% - 64px) * ${o.share??0})`}}/><span className={styles.barValue}>{o.share===null?'<5':fmtPct(o.share)}{!o.correct&&o.share!==null&&o.share<IMPLAUSIBLE&&q.attempts>=RARE_MIN?' · rarely picked':''}</span></span>
   </li>)}
  </ul>
 </div>;
}

function QuestionsCard({title,subtitle,rows,emptyText}:{title:string;subtitle:string;rows:QuestionRow[];emptyText:string}){
 return <ChartCard title={title} subtitle={subtitle} empty={!rows.length} emptyText={emptyText}
  table={{columns:['Question','Lesson','First try right','First tries','Sessions',...['A','B','C','D'].map(x=>'Option '+x)],rows:rows.map(q=>[q.text,`${FORMAT_LABEL[q.format]} · ${q.lessonName}`,fmtPct(q.firstTry),q.attempts,q.sessions,...[0,1,2,3].map(i=>{const o=q.options[i];return o?`${o.correct?'✓ ':''}${o.text}: ${o.share===null?'<5':fmtPct(o.share)}`:'';})])}}>
  <ul className={styles.legend}><li><i className={styles.box} style={{'--key':'var(--s1)'} as CSSProperties}/>Right answer</li><li><i className={styles.box} style={{'--key':'var(--a-other)'} as CSSProperties}/>Other options</li></ul>
  <div className={styles.questions}>{rows.map(q=><QuestionItem key={`${q.lesson}:${q.index}`} q={q}/>)}</div>
 </ChartCard>;
}

function WalkthroughCard({w}:{w:LearningReport['walkthrough']}){
 const first=w.steps[0]?.seen??null;
 const rows=[...w.steps.map(s=>bar(s.id,`Saw “${s.label}”`,s.seen,pctOf(s.seen,first)!==null?`${fmtPct(pctOf(s.seen,first)!)} of those who saw Welcome`:undefined)),
  bar('explore','Pressed Explore at the end',w.explore,pctOf(w.explore,first)!==null?`${fmtPct(pctOf(w.explore,first)!)} of those who saw Welcome`:undefined),
  bar('lesson','Opened a lesson after',w.lesson,pctOf(w.lesson,first)!==null?`${fmtPct(pctOf(w.lesson,first)!)} of those who saw Welcome`:undefined)];
 const none=rows.every(r=>!r.value&&!r.text);
 return <ChartCard title="Welcome walkthrough" subtitle="Sessions that saw each step, finished it, and opened a lesson afterwards" empty={none} emptyText={EMPTY}
  table={{columns:['Step','Sessions','Of Welcome'],rows:rows.map(r=>[r.label,r.text??r.value,r.detail&&r.detail.includes('%')?r.detail.split(' ')[0]:'—'])}}>
  <BarList rows={rows} unit="sessions" share={false} limit={rows.length}/>
 </ChartCard>;
}

function SkipCard({w}:{w:LearningReport['walkthrough']}){
 const rows=w.steps.map(s=>bar(s.id,s.label,s.skipped,pctOf(s.skipped,s.seen)!==null?`${fmtPct(pctOf(s.skipped,s.seen)!)} of those who saw it`:undefined));
 return <ChartCard title="Where the walkthrough is skipped" subtitle="Sessions that pressed Skip, by the step they were on" empty={rows.every(r=>!r.value&&!r.text)} emptyText={EMPTY}
  table={{columns:['Step','Skipped (sessions)','Of those who saw it'],rows:rows.map(r=>[r.label,r.text??r.value,r.detail&&r.detail.includes('%')?r.detail.split(' ')[0]:'—'])}}>
  <BarList rows={rows} unit="sessions skipped here" share={false} limit={rows.length}/>
 </ChartCard>;
}

function ProgressCard({p}:{p:LearningReport['progress']}){
 const bands=p.bands.map((b,i)=>bar('p'+i,b.label,b.sessions)),grads=p.grads.map((b,i)=>bar('g'+i,b.label,b.sessions));
 return <ChartCard title="How far players get" subtitle="Lessons completed and paths graduated, saved on the device, when each session started" empty={!p.n} emptyText={EMPTY}
  table={{columns:['Group','Sessions','Share'],rows:[...bands.map(b=>['Lessons: '+b.label,b.text??b.value,b.text||!p.n?'—':fmtPct(b.value/p.n)]),...grads.map(b=>['Graduations: '+b.label,b.text??b.value,b.text||!p.n?'—':fmtPct(b.value/p.n)])]}}>
  <p className={styles.miniHead}>Lessons completed</p>
  <BarList rows={bands} unit="sessions" limit={bands.length}/>
  <p className={styles.miniHead}>Paths graduated</p>
  <BarList rows={grads} unit="sessions" limit={grads.length}/>
 </ChartCard>;
}

function PathsCard({paths}:{paths:LearningReport['paths']}){
 const launches=paths.launches.map(l=>({...bar(l.format,FORMAT_LABEL[l.format],l.sessions,l.launches===null?undefined:`${fmtInt(l.launches)} launches`)}));
 const grads=paths.grads.map(g=>bar(g.key,g.label.replace(/^(\w+) path$/,(_,f)=>`${FORMAT_LABEL[f]||f} path`),g.sessions));
 const r=paths.reviews,right=r.answered&&r.right!==null?r.right/r.answered:null;
 const none=paths.launches.every(l=>l.sessions===0)&&paths.grads.every(g=>g.sessions===0)&&r.answered===0&&r.done===0;
 return <ChartCard title="Paths, graduations and warm-ups" subtitle="Sessions that launched a Paths lesson by format, graduations earned, and the daily warm-up" empty={none} emptyText={EMPTY}
  table={{columns:['Measure','Sessions / count'],rows:[...launches.map(l=>['Paths launches: '+l.label,l.text??l.value]),...grads.map(g=>['Graduated: '+g.label,g.text??g.value]),
   ['Warm-up questions answered',show(r.answered)],['Warm-up right first time',show(r.right)],['Warm-ups finished (sessions)',show(r.done)]]}}>
  <p className={styles.miniHead}>Paths format share</p>
  <BarList rows={launches} unit="sessions" limit={launches.length}/>
  <p className={styles.miniHead}>Graduations earned</p>
  <BarList rows={grads} unit="sessions" share={false} limit={grads.length}/>
  <div className={styles.lengthStats}><span>Warm-up answers <b>{show(r.answered)}</b></span><span>Right first time <b>{right===null?'—':fmtPct(right)}</b></span><span>Warm-ups finished <b>{show(r.done)}</b></span></div>
 </ChartCard>;
}

function SettingsCard({s}:{s:LearningReport['settings']}){
 const share=(c:Cell)=>c===null?'<5':s.n?fmtPct(c/s.n):'0%';
 const voiceOff=s.bits.find(b=>b.key==='vo')!,others=s.bits.filter(b=>b.key!=='vo');
 return <ChartCard title="Settings at start" subtitle="Share of sessions that started with each setting" empty={!s.n} emptyText={EMPTY}
  table={{columns:['Setting','Sessions','Share'],rows:s.bits.map(b=>[b.label,show(b.sessions),share(b.sessions)])}}>
  <div className={styles.risk} role="note">
   <span className={styles.riskIcon} aria-hidden="true">!</span>
   <div><span className={styles.riskLabel}>Learning risk</span><b>{share(voiceOff.sessions)}</b><small>started with the lesson voice off, so they read the coach’s explanations or skip them ({show(voiceOff.sessions)} of {show(s.n)} sessions)</small></div>
  </div>
  <div className={styles.settingTiles}>{others.map(b=><div key={b.key}><span>{b.label}</span><b>{share(b.sessions)}</b></div>)}</div>
 </ChartCard>;
}

function VoicesCard({s}:{s:LearningReport['settings']}){
 const rows=s.voices.map(v=>bar(v.id,v.label,v.sessions));
 return <ChartCard title="Coach voice" subtitle="Which coach narrates, at session start (the voice may be switched off)" empty={!s.n} emptyText={EMPTY}
  table={{columns:['Coach voice','Sessions','Share'],rows:rows.map(r=>[r.label,r.text??r.value,r.text||!s.n?'—':fmtPct(r.value/s.n!)])}}>
  <BarList rows={rows} unit="sessions" limit={rows.length}/>
 </ChartCard>;
}
