'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {BackButton} from './BackButton';
import {DoneButton} from './DoneButton';
import ParentGate from './ParentGate';
import IdpPlan from './IdpPlan';
import shell from './ModalShell.module.css';
import styles from './GrownUps.module.css';
import {useQuestEvidence} from '@/lib/town/questProgress';
import {useQuizCompletions} from '@/lib/town/quizProgress';
import {useCoinProgress} from '@/lib/town/coinProgress';
import {COIN_QUEST} from '@/lib/town/coinQuest';
import {useLearning} from '@/lib/town/learningProgress';
import {LEARNING_JOURNEYS,learningStatus} from '@/lib/town/learningJourneys';
import {batterySaverOn,setBatterySaver,subscribeHeatTier} from '@/lib/graphics/heatTier';
import {IDP_KEY,goalById,homeworkStatus,loadIdp,type IdpState} from '@/lib/coaches/idp';
import {STAGE_LABELS,STAGE_ORDER,graduateBadge,summarizeProgress} from '@/lib/grownups/progress';
import {PRACTICE_SAFETY,practiceFor} from '@/lib/grownups/practice';
import {progressReportHtml} from '@/lib/grownups/report';
import {printHtml} from '@/lib/grownups/printHtml';
import {loadPlayFormat,savePlayFormat} from '@/lib/grownups/prefs';
import type {Format} from '@/lib/town/venues';
import {useGraduations} from '@/lib/endgame/graduationStore';
import {useReviewState} from '@/lib/learning/reviewStore';
import {GRADUATION_FORMATS,GRAD_TITLES} from '@/lib/endgame/graduationModel';

export type GrownUpSettings={musicEnabled:boolean;onMusicChange:(v:boolean)=>void;soundMuted:boolean;onSoundMutedChange:(v:boolean)=>void;voiceEnabled:boolean;onVoiceChange:(v:boolean)=>void};
const FORMAT_NAMES:Record<Format,string>={'7v7':'7v7','9v9':'9v9','11v11':'11v11',futsal:'Futsal'};

/**
 * "For grown-ups" (G-09): behind the shared ParentGate. Progress summary, what's next, practice at home, the coach plan (IDP),
 * a printable report, parent settings and "About this game for parents". Static DOM only, lazy-loaded by GrownUpsHost.
 */
export default function GrownUps({open,view:initialView,onClose,onLaunch,settings}:{open:boolean;view?:'home'|'plan';onClose:()=>void;onLaunch:()=>void;settings?:GrownUpSettings}){
 const dialog=useRef<HTMLDialogElement>(null),nav=useRef<HTMLButtonElement>(null),restore=useRef<HTMLElement|null>(null),body=useRef<HTMLDivElement>(null);
 const [unlocked,setUnlocked]=useState(false),[view,setView]=useState<'home'|'plan'>(initialView??'home');
 useEffect(()=>{setView(initialView??'home');},[initialView,open]);
 useEffect(()=>{const el=dialog.current;if(!el)return;
  if(open&&!el.open){restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;el.showModal();nav.current?.focus({preventScroll:true});}
  else if(!open&&el.open){el.close();setUnlocked(false);if(restore.current?.isConnected)restore.current.focus({preventScroll:true});}
 },[open]);
 useEffect(()=>{if(body.current)body.current.scrollTop=0;},[view,unlocked]);
 const back=()=>{if(view==='plan'&&unlocked)setView('home');else onClose();};
 return <dialog ref={dialog} className={styles.dialog} data-grownups aria-labelledby="grownups-title" onCancel={e=>{e.preventDefault();back();}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()}>
  <section className={`${shell.shell} ${shell.drawer} ${styles.panel}`}>
   <header className={shell.header}>{view==='plan'&&unlocked?<BackButton ref={nav} onBack={()=>setView('home')}/>:null}<div><h2 id="grownups-title">{view==='plan'&&unlocked?'Coach plan':'For grown-ups'}</h2></div>{view==='plan'&&unlocked?<span aria-hidden="true" style={{visibility:'hidden',width:44}}/>:<DoneButton ref={nav} onDone={onClose}/>}</header>
   <div ref={body} className={shell.body}>
    {!unlocked?<ParentGate.Guard reason="Progress, the coach plan and settings for parents, carers and coaches." onCancel={onClose}><Unlock onUnlock={()=>setUnlocked(true)}/></ParentGate.Guard>
    :view==='plan'?<IdpPlan onLaunch={()=>{onClose();onLaunch();}}/>
    :<Home settings={settings} onPlan={()=>setView('plan')}/>}
   </div>
  </section>
 </dialog>;
}
function Unlock({onUnlock}:{onUnlock:()=>void}){useEffect(()=>{onUnlock();},[onUnlock]);return null;}

function useIdp(){const [s,setS]=useState<IdpState|null>(null);useEffect(()=>{setS(loadIdp());const f=(e:StorageEvent)=>{if(e.key===IDP_KEY||e.key===null)setS(loadIdp());};window.addEventListener('storage',f);return()=>window.removeEventListener('storage',f);},[]);return s;}

function Home({settings,onPlan}:{settings?:GrownUpSettings;onPlan:()=>void}){
 const evidence=useQuestEvidence(),answers=useQuizCompletions(),coins=useCoinProgress(),learning=useLearning(),idp=useIdp(),grads=useGraduations(),review=useReviewState();
 const badges=useMemo(()=>[...GRADUATION_FORMATS.filter(f=>grads.formats[f]).map(f=>graduateBadge(GRAD_TITLES[f])),...(grads.finale?['Matchday Ferry finale']:[])],[grads]);
 const [preferred,setPreferred]=useState<Format|null>(null);useEffect(()=>{setPreferred(loadPlayFormat());},[]);
 const steps=useMemo(()=>new Set(evidence.steps),[evidence]);
 const summary=useMemo(()=>summarizeProgress({steps,answers,badges,reviews:review.lessons,balls:{found:coins.collected.length,total:COIN_QUEST.length},preferred,
  journeys:LEARNING_JOURNEYS.flatMap(j=>{const r=learning.journeys[j.id];return r?[{title:j.title,status:learningStatus(r).label}]:[];})}),[steps,answers,badges,review,coins.collected.length,preferred,learning]);
 const goal=idp?.plan?goalById(idp.plan.goalId):undefined,hw=goal?homeworkStatus(goal,steps,answers):null;
 const practice=useMemo(()=>practiceFor([...summary.recent,...(goal?goal.lessons.map(id=>({id})):[]),...summary.nextUp]),[summary,goal]);
 const [name,setName]=useState('');
 const report=useMemo(()=>progressReportHtml(summary,{firstName:name,printedAt:Date.now(),practice,focus:goal&&hw?{title:goal.title,tryIt:goal.tryIt,parentCue:goal.parentCue,homework:`${hw.done} of ${hw.total} linked lessons done`}:null}),[summary,name,practice,goal,hw]);
 const understood=summary.totals.understood;
 return <div className={styles.home}>
  <nav className={styles.jump} aria-label="Sections">{[['gu-progress','Progress'],['gu-next','Next'],['gu-practice','At home'],['gu-plan','Coach plan'],['gu-report','Report'],['gu-settings','Settings'],['gu-about','About']].map(([id,label])=><a key={id} href={`#${id}`} onClick={e=>{e.preventDefault();document.getElementById(id)?.scrollIntoView({block:'start'});}}>{label}</a>)}</nav>
  <section id="gu-progress" className={styles.card} aria-labelledby="gu-progress-t" data-progress-summary>
   <h3 id="gu-progress-t">What they’ve learned</h3>
   <div className={styles.stats}>
    <div><b data-stat="paths">{summary.pathsComplete.length}<small>/4</small></b><span>paths complete</span></div>
    <div><b data-stat="understood">{understood}</b><span>lessons understood</span></div>
    <div><b data-stat="balls">{summary.balls.found}<small>/{summary.balls.total}</small></b><span>hidden balls found</span></div>
   </div>
   <ul className={styles.formats}>{summary.formats.map(f=><li key={f.format} data-format={f.format}>
    <div className={styles.formatHead}><b>{FORMAT_NAMES[f.format]}</b>{f.pathComplete?<span className={styles.badge}>Path complete</span>:<small>{f.coreComplete}/{f.coreTotal} path lessons</small>}</div>
    <div className={styles.bar} role="img" aria-label={`${f.coreComplete} of ${f.coreTotal} path lessons understood`}><i style={{width:`${f.coreTotal?100*f.coreComplete/f.coreTotal:0}%`}}/></div>
    <small>{f.stages.introduced} introduced · {f.stages.applied+f.stages.remembered} applied or remembered · Go deeper {f.depthComplete}/{f.depthTotal}</small>
   </li>)}</ul>
   <details className={styles.stages}><summary>Lessons by stage</summary><ul>{STAGE_ORDER.map(k=><li key={k} data-stage={k}><b>{STAGE_LABELS[k].label}: {summary.totals[k]}</b> <small>{STAGE_LABELS[k].detail}</small></li>)}</ul></details>
   {summary.badges.length>0&&<p className={styles.badges}>{summary.badges.map(b=><span key={b} className={styles.badge}>{b}</span>)}</p>}
   {summary.journeys.length>0&&<p className={styles.muted}>Learning journeys: {summary.journeys.map(j=>`${j.title} (${j.status})`).join(' · ')}</p>}
   <p className={styles.muted}>“Understood” means the lesson quiz was passed on this device (every question answered correctly); “Applied” and “Remembered” come from later spaced reviews. It shows the idea has landed in the app, not how well someone plays. We don’t track time played.</p>
  </section>
  <section id="gu-next" className={styles.card} aria-labelledby="gu-next-t">
   <h3 id="gu-next-t">Learning next</h3>
   <div className={styles.two}><div><h4>Up next on the island</h4><ul>{summary.nextUp.length?summary.nextUp.map(l=><li key={l.format+l.id}>{FORMAT_NAMES[l.format]} · {l.name}</li>):<li>Every path lesson is complete.</li>}</ul></div>
   <div><h4>Learning lately</h4><ul>{summary.recent.length?summary.recent.map(l=><li key={l.format+l.id}>{l.name} <small>({STAGE_LABELS[l.stage].label})</small></li>):<li>Nothing started yet. The 7v7 path is the gentlest start.</li>}</ul></div></div>
  </section>
  <section id="gu-practice" className={styles.card} aria-labelledby="gu-practice-t">
   <h3 id="gu-practice-t">Try it at home</h3><p className={styles.muted}>Short games tied to what they’ve been learning. A ball and a couple of cones (or shoes) is all you need.</p>
   <div className={styles.practice}>{practice.map(p=><article key={p.id} data-practice={p.id}><b>{p.title}</b><small>{p.setup}</small><p>{p.howTo}</p><span>Ask: “{p.talk}”</span></article>)}</div>
   <p className={styles.muted}>{PRACTICE_SAFETY}</p>
  </section>
  <section id="gu-plan" className={styles.card} aria-labelledby="gu-plan-t">
   <h3 id="gu-plan-t">Coach plan (IDP)</h3>
   {goal&&hw?<><p><b>Current focus:</b> {goal.title}</p><p className={styles.muted}>Island homework: {hw.done} of {hw.total} linked lessons done · review by {new Date(idp!.plan!.reviewAt).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</p></>
   :<p className={styles.muted}>One focus to work on with a coach, linked island lessons that tick themselves off, the player’s own reflection and a coach note. Saved on this device only.</p>}
   <button type="button" className={styles.primary} data-open-plan onClick={onPlan}>{goal?'Open the plan':'Start a plan'}</button>
  </section>
  <section id="gu-report" className={styles.card} aria-labelledby="gu-report-t">
   <h3 id="gu-report-t">Progress report</h3>
   <p className={styles.muted}>A one-page summary to print, or save as a PDF from the print window. It has no name unless you type one here, and the name isn’t saved.</p>
   <div className={styles.inline}><label htmlFor="gu-name" className={styles.srOnly}>First name for the report (optional)</label><input id="gu-name" value={name} maxLength={24} autoComplete="off" placeholder="First name on the report (optional)" onChange={e=>setName(e.target.value)}/><button type="button" className={styles.primary} data-print-report onClick={()=>printHtml(report)}>Print or save PDF</button></div>
   <iframe className={styles.preview} title="Progress report preview" srcDoc={report} loading="lazy" data-report-preview/>
  </section>
  <section id="gu-settings" className={styles.card} aria-labelledby="gu-settings-t">
   <h3 id="gu-settings-t">Settings</h3>
   <label className={styles.select}><span><b>Which game do they play?</b><small>Orders the report and sets the coach plan’s wording: 7v7 simplest, 11v11 the full four corners.</small></span>
    <select value={preferred??''} onChange={e=>{const f=(e.target.value||null) as Format|null;setPreferred(f);savePlayFormat(f);}}><option value="">Not set</option>{(['7v7','9v9','11v11','futsal'] as Format[]).map(f=><option key={f} value={f}>{FORMAT_NAMES[f]}</option>)}</select></label>
   {settings&&<><Toggle label="Sound effects" detail="Buttons, rides and island sounds." on={!settings.soundMuted} set={v=>settings.onSoundMutedChange(!v)}/>
   <Toggle label="Background music" detail="The island soundtrack." on={settings.musicEnabled} set={settings.onMusicChange}/>
   <Toggle label="Lesson voice" detail="A coach reads each play aloud. Helpful for younger readers." on={settings.voiceEnabled} set={settings.onVoiceChange}/></>}
   <BatteryToggle/>
  </section>
  <section id="gu-about" className={styles.card} aria-labelledby="gu-about-t" data-about-parents>
   <h3 id="gu-about-t">About this game for parents</h3>
   <h4>What it teaches</h4>
   <p>Futbol Island teaches how football is played: positions, team shape, passing options, defending and restarts, for futsal, 7v7, 9v9 and 11v11. Children watch plays move in 3D, answer short quizzes that explain the “why”, find hidden balls that each carry a football idea, and watch illustrated stories about the feelings side of the game.</p>
   <h4>How progress works</h4>
   <p>Lessons unlock in order along each path. Coins and cards are earned in the game; nothing in the game is bought with real money. There are no leaderboards and no streaks to keep.</p>
   <h4>Privacy</h4>
   <ul>
    <li>No accounts and no sign-up. We never ask a child for a name, age, email or photo.</li>
    <li>Progress, plans and notes are saved only in this browser on this device. Clearing this site’s data in the browser deletes them.</li>
    <li>No ads and no chat with other players.</li>
    <li>The website counts visits with a privacy-friendly counter (Vercel Web Analytics): no cookies and no personal identifiers, just page views. It never receives progress, plans, notes or names.</li>
    <li>Printing a report or plan happens on this device. Nothing is uploaded.</li>
   </ul>
  </section>
 </div>;
}

function Toggle({label,detail,on,set}:{label:string;detail:string;on:boolean;set:(v:boolean)=>void}){
 return <button type="button" className={styles.toggle} aria-pressed={on} onClick={()=>set(!on)}><span><b>{label}</b><small>{detail}</small></span><span className={styles.switch} aria-hidden="true">{on?'On':'Off'}</span></button>;
}
function BatteryToggle(){
 const [on,setOn]=useState(false);useEffect(()=>{setOn(batterySaverOn());return subscribeHeatTier(()=>setOn(batterySaverOn()));},[]);
 return <Toggle label="Battery saver" detail="Keeps the device cooler with slightly softer graphics, a gentler frame rate and calm water." on={on} set={v=>setBatterySaver(v)}/>;
}
