'use client';
import {useEffect,useState} from 'react';
import {FORMAT_PATH_LAUNCH,type PathLesson} from '@/lib/paths/formatPaths';
import {useQuestEvidence} from '@/lib/town/questProgress';
import {useQuizCompletions} from '@/lib/town/quizProgress';
import {endLearningPreview} from '@/lib/town/learningProgress';
import type {Format} from '@/lib/town/venues';
import {CORNERS,IDP_FORMATS,IDP_KEY,IDP_NOTE_MAX,IDP_STRENGTH_MAX,REFLECTION_TAGS,addNote,chooseGoal,cornerLabel,emptyIdp,endPlan,goalById,goalsFor,homeworkStatus,idpCopy,loadIdp,reflectionPrompt,removeNote,reviewDue,reviewPlan,saveIdp,setStrength,showsFourCorners,type Corner,type IdpGoal,type IdpState,type NoteKind,type ReflectionTag} from '@/lib/coaches/idp';
import {idpPlanHtml} from '@/lib/coaches/idpPrint';
import {loadPlayFormat} from '@/lib/grownups/prefs';
import {printHtml} from '@/lib/grownups/printHtml';
import styles from './IdpPlan.module.css';

const day=(at:number)=>new Date(at).toLocaleDateString(undefined,{month:'short',day:'numeric'});
const CORNER_IDS=Object.keys(CORNERS) as Corner[];
/** Homework reads the path saves live, so a linked lesson finished anywhere on the island ticks itself off here. */
function useHomework(goal:IdpGoal|null|undefined){
 const evidence=useQuestEvidence(),answers=useQuizCompletions();
 return goal?homeworkStatus(goal,new Set(evidence.steps),answers):null;
}

/** IDP (coach plan): one focus, linked island homework, strength, player reflection, coach note, grown-up cue. Local to this device. */
export default function IdpPlan({onLaunch}:{onLaunch:()=>void}){
 const [state,setState]=useState<IdpState>(emptyIdp);
 const [choosing,setChoosing]=useState(false),[confirmEnd,setConfirmEnd]=useState(false);
 const [format,setFormat]=useState<Format>('7v7');
 useEffect(()=>{const s=loadIdp();setState(s);setFormat(s.plan?goalById(s.plan.goalId)!.format:loadPlayFormat()??'7v7');
  const sync=(e:StorageEvent)=>{if(e.key===IDP_KEY||e.key===null)setState(loadIdp());};
  window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[]);
 const commit=(next:IdpState)=>{setState(next);saveIdp(next);};
 const plan=state.plan,goal=plan&&goalById(plan.goalId);
 const homework=useHomework(goal);
 const snapshot=homework?{done:homework.done,total:homework.total}:undefined;
 if(!plan||!goal||choosing)return <Chooser format={format} setFormat={setFormat} current={plan?.goalId} onCancel={plan?()=>setChoosing(false):undefined} onChoose={id=>{commit(chooseGoal(state,id,Date.now(),snapshot));setChoosing(false);}}/>;
 const now=Date.now(),due=reviewDue(plan,now),copy=idpCopy(goal.format);
 return <div className={styles.plan} data-idp-plan>
  <p className={styles.local}>Saved on this device only. Nothing is sent to anyone, and there are no accounts. Print it to share with your coach or family.</p>
  {due&&<div className={styles.due} role="status"><strong>Review together.</strong> {copy.review}<div className={styles.row}><button type="button" className={styles.primary} onClick={()=>commit(reviewPlan(state,Date.now()))}>Keep this focus</button><button type="button" className={styles.ghost} onClick={()=>setChoosing(true)}>Adapt or choose a new focus</button></div></div>}
  <article className={styles.focus}>
   <span className={styles.corner} data-corner={goal.corner}>{cornerLabel(goal.format,goal.corner)}</span>
   <h3>{goal.title}</h3><p>{goal.why}</p>
   <div className={styles.try}><b>{copy.tryIt}</b><span>{goal.tryIt}</span></div>
   <p className={styles.meta}>Started {day(plan.setAt)} · {due?'Review due':`Review by ${day(plan.reviewAt)}`}{plan.reviews?.length?` · Reviewed ${plan.reviews.length}×`:''}</p>
  </article>
  {showsFourCorners(goal.format)&&<section className={styles.corners} aria-label="Four corners">{CORNER_IDS.map(c=><div key={c} className={styles.cornerCell} data-corner={c} data-focus={c===goal.corner||undefined}><b>{cornerLabel(goal.format,c)}</b><small>{c===goal.corner?'Focus':plan.strength?.corner===c?'Strength':' '}</small></div>)}</section>}
  <Strength state={state} commit={commit} format={goal.format} title={copy.strength} hint={copy.strengthHint}/>
  <Lessons goal={goal} title={copy.homework} onLaunch={onLaunch}/>
  <div className={styles.notes}>
   <Notes kind="player" title={goal.format==='7v7'?'How did it go?':'My reflection'} hint={reflectionPrompt(goal.format)} format={goal.format} state={state} commit={commit}/>
   <Notes kind="coach" title="Coach’s note" hint={copy.coachHint} format={goal.format} state={state} commit={commit}/>
  </div>
  <aside className={styles.grownup}><b>How home can help</b><span>{goal.parentCue}</span><small>Ask about what they noticed. Try not to score or coach from the sideline.</small></aside>
  <PrintPlan state={state} homework={homework}/>
  {confirmEnd?<div className={styles.confirm} role="alertdialog" aria-labelledby="idp-end-title"><p id="idp-end-title"><strong>End this plan?</strong> Its notes will be cleared.</p><div className={styles.row}><button type="button" className={styles.ghost} autoFocus onClick={()=>setConfirmEnd(false)}>Keep my plan</button><button type="button" className={styles.primary} onClick={()=>{setConfirmEnd(false);commit(endPlan(state,Date.now(),snapshot));}}>End plan</button></div></div>
  :<div className={styles.row}><button type="button" className={styles.ghost} onClick={()=>setChoosing(true)}>Change focus</button><button type="button" className={styles.ghost} onClick={()=>setConfirmEnd(true)}>End plan</button></div>}
 </div>;
}

function Chooser({format,setFormat,current,onChoose,onCancel}:{format:Format;setFormat:(f:Format)=>void;current?:string;onChoose:(id:string)=>void;onCancel?:()=>void}){
 return <div className={styles.plan} data-idp-chooser>
  <p className={styles.lead}>{idpCopy(format).lead}</p>
  <div className={styles.formats} role="tablist" aria-label="Format">{IDP_FORMATS.map(f=><button key={f.format} type="button" role="tab" aria-selected={f.format===format} className={styles.format} onClick={()=>setFormat(f.format)}><b>{f.label}</b><small>{f.note}</small></button>)}</div>
  <div className={styles.goals}>{goalsFor(format).map(g=><button key={g.id} type="button" className={styles.goal} data-goal={g.id} aria-pressed={g.id===current} onClick={()=>onChoose(g.id)}>
   <span className={styles.corner} data-corner={g.corner}>{cornerLabel(format,g.corner)}</span>
   <b>{g.title}</b><small>{g.why}</small>{g.id===current&&<em>Current focus</em>}
  </button>)}</div>
  {onCancel&&<div className={styles.row}><button type="button" className={styles.ghost} onClick={onCancel}>Keep my current focus</button></div>}
 </div>;
}

function Strength({state,commit,format,title,hint}:{state:IdpState;commit:(s:IdpState)=>void;format:Format;title:string;hint:string}){
 const s=state.plan?.strength;const [text,setText]=useState(s?.text??'');
 useEffect(()=>{setText(s?.text??'');},[s?.text]);
 return <section className={styles.strength} aria-labelledby="idp-strength">
  <h4 id="idp-strength">{title}</h4><small>{hint}</small>
  <div className={styles.chips} role="group" aria-label={title}>{CORNER_IDS.map(c=><button key={c} type="button" className={styles.chip} data-corner={c} aria-pressed={s?.corner===c} onClick={()=>commit(setStrength(state,s?.corner===c?null:{corner:c,text}))}>{cornerLabel(format,c)}</button>)}</div>
  {s&&<form className={styles.inline} onSubmit={e=>{e.preventDefault();commit(setStrength(state,{corner:s.corner,text}));}}>
   <label className={styles.srOnly} htmlFor="idp-strength-text">A few words about this strength</label>
   <input id="idp-strength-text" value={text} maxLength={IDP_STRENGTH_MAX} placeholder={format==='7v7'?'Like: I never give up':'In a few words'} onChange={e=>setText(e.target.value)}/>
   <button type="submit" className={styles.ghost} disabled={text.trim()===(s.text??'')}>Save</button>
  </form>}
 </section>;
}

function Lessons({goal,title,onLaunch}:{goal:IdpGoal;title:string;onLaunch:()=>void}){
 const hw=useHomework(goal)!;
 const open=(l:PathLesson,s:typeof hw.lessons[number])=>{endLearningPreview();onLaunch();
  window.dispatchEvent(new CustomEvent(FORMAT_PATH_LAUNCH,{detail:{format:goal.format,lessonId:l.id,step:s.complete?0:s.step,quiz:!s.complete&&s.quiz,question:s.complete?0:s.question,nonce:Date.now()}}));};
 return <section className={styles.lessons} aria-labelledby="idp-watch" data-homework={`${hw.done}/${hw.total}`}><h4 id="idp-watch">{title} <span className={styles.count}>{hw.done} of {hw.total} done</span></h4>
  {hw.lessons.map(s=><div key={s.lesson.id} className={styles.lesson} data-lesson={s.lesson.id} data-done={s.complete||undefined}>
   <div><b>{s.complete?'✓ ':''}{s.lesson.name}</b><small>{s.complete?'Done: every quiz question answered.':`Explored on the island: ${s.watched}/${s.lesson.steps} play steps · ${s.correct}/${s.lesson.questions} quiz answers`}</small></div>
   <button type="button" className={styles.primary} onClick={()=>open(s.lesson,s)}>{s.complete?'Watch again':s.watched||s.correct?'Continue':'Watch'}</button>
  </div>)}
  <small className={styles.caveat}>Ticks itself off when the lesson is finished on the island. Exploring shows you’ve seen the idea. Your coach sees whether it happens in games.</small>
 </section>;
}

function Notes({kind,title,hint,format,state,commit}:{kind:NoteKind;title:string;hint:string;format:Format;state:IdpState;commit:(s:IdpState)=>void}){
 const [text,setText]=useState(''),[tag,setTag]=useState<ReflectionTag|undefined>();
 const notes=(state.plan?.notes??[]).filter(n=>n.kind===kind).slice().reverse();
 const id=`idp-${kind}`;
 return <section className={styles.note} data-kind={kind} aria-labelledby={`${id}-t`}><h4 id={`${id}-t`}>{title}</h4>
  <form onSubmit={e=>{e.preventDefault();const next=addNote(state,kind,text,Date.now(),tag);if(next!==state){commit(next);setText('');setTag(undefined);}}}>
   {kind==='player'&&<div className={styles.chips} role="group" aria-label="Quick answer">{(Object.keys(REFLECTION_TAGS) as ReflectionTag[]).map(t=><button key={t} type="button" className={styles.chip} aria-pressed={tag===t} onClick={()=>setTag(tag===t?undefined:t)}>{format==='7v7'?REFLECTION_TAGS[t].kid:REFLECTION_TAGS[t].label}</button>)}</div>}
   <label htmlFor={id}>{hint}{kind==='player'?' (optional)':''}</label>
   <textarea id={id} value={text} maxLength={IDP_NOTE_MAX} rows={2} onChange={e=>setText(e.target.value)}/>
   <button type="submit" className={styles.primary} disabled={!text.trim()&&!tag}>Save</button>
  </form>
  {kind==='player'&&tag==='want-help'&&<small className={styles.caveat}>Tell your coach or a grown-up you trust. This note stays on this device; nobody else sees it automatically.</small>}
  {notes.length>0&&<ul>{notes.map(n=><li key={n.id}><time dateTime={new Date(n.at).toISOString()}>{day(n.at)}</time><span>{n.tag&&<b>{REFLECTION_TAGS[n.tag].label}. </b>}{n.text}</span><button type="button" aria-label={`Delete note from ${day(n.at)}`} onClick={()=>commit(removeNote(state,n.id))}>×</button></li>)}</ul>}
 </section>;
}

function PrintPlan({state,homework}:{state:IdpState;homework:ReturnType<typeof homeworkStatus>|null}){
 const [name,setName]=useState('');
 const print=()=>printHtml(idpPlanHtml(state,{firstName:name,printedAt:Date.now(),homework:(homework?.lessons??[]).map(l=>({name:l.lesson.name,done:l.complete,detail:l.complete?'done':`${l.correct}/${l.lesson.questions} quiz answers`}))}));
 return <section className={styles.share} aria-labelledby="idp-print"><h4 id="idp-print">Print or save the plan</h4>
  <small>Prints a one-page plan to hand to a coach or keep on the fridge. Use “Save as PDF” in the print window to keep a copy.</small>
  <div className={styles.inline}><label htmlFor="idp-print-name" className={styles.srOnly}>First name for the printout (optional)</label><input id="idp-print-name" value={name} maxLength={24} autoComplete="off" placeholder="First name on the page (optional)" onChange={e=>setName(e.target.value)}/><button type="button" className={styles.primary} data-idp-print onClick={print}>Print plan</button></div>
  <small>The name is only used for this printout. It isn’t saved.</small>
 </section>;
}
