'use client';
import {useEffect,useState} from 'react';
import {FORMAT_PATHS,FORMAT_PATH_LAUNCH,lessonEvidence,type PathLesson} from '@/lib/paths/formatPaths';
import {useQuestEvidence} from '@/lib/town/questProgress';
import {useQuizCompletions} from '@/lib/town/quizProgress';
import {endLearningPreview} from '@/lib/town/learningProgress';
import type {Format} from '@/lib/town/venues';
import {CORNERS,IDP_FORMATS,IDP_KEY,IDP_NOTE_MAX,addNote,chooseGoal,emptyIdp,endPlan,goalById,goalsFor,loadIdp,reflectionPrompt,removeNote,reviewDue,reviewPlan,saveIdp,type IdpGoal,type IdpState,type NoteKind} from '@/lib/coaches/idp';
import styles from './IdpPlan.module.css';

const day=(at:number)=>new Date(at).toLocaleDateString(undefined,{month:'short',day:'numeric'});
function findLesson(format:Format,id:string):PathLesson|undefined{const p=FORMAT_PATHS.find(p=>p.format===format);return p&&[...p.chapters.flatMap(c=>c.lessons),...p.depth].find(l=>l.id===id);}

/** P0 IDP: one focus, linked island lessons, player reflection, coach note, grown-up cue. Local to this device. */
export default function IdpPlan({onLaunch}:{onLaunch:()=>void}){
 const [state,setState]=useState<IdpState>(emptyIdp);
 const [choosing,setChoosing]=useState(false);
 const [format,setFormat]=useState<Format>('7v7');
 useEffect(()=>{const s=loadIdp();setState(s);if(s.plan)setFormat(goalById(s.plan.goalId)!.format);
  const sync=(e:StorageEvent)=>{if(e.key===IDP_KEY||e.key===null)setState(loadIdp());};
  window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[]);
 const commit=(next:IdpState)=>{setState(next);saveIdp(next);};
 const plan=state.plan,goal=plan&&goalById(plan.goalId);
 if(!plan||!goal||choosing)return <Chooser format={format} setFormat={setFormat} current={plan?.goalId} onCancel={plan?()=>setChoosing(false):undefined} onChoose={id=>{commit(chooseGoal(state,id,Date.now()));setChoosing(false);}}/>;
 const now=Date.now(),due=reviewDue(plan,now);
 return <div className={styles.plan}>
  <p className={styles.local}>My plan · saved on this device only. Nothing is sent to anyone.</p>
  {due&&<div className={styles.due} role="status"><strong>Time to review.</strong> It’s been about six weeks. Keep working on this focus, or pick a new one with your coach.<div className={styles.row}><button type="button" className={styles.primary} onClick={()=>commit(reviewPlan(state,Date.now()))}>Keep this focus</button><button type="button" className={styles.ghost} onClick={()=>setChoosing(true)}>Choose a new focus</button></div></div>}
  <article className={styles.focus}>
   <span className={styles.corner} data-corner={goal.corner}>{goal.format==='7v7'?CORNERS[goal.corner].kid:CORNERS[goal.corner].label}</span>
   <h3>{goal.title}</h3><p>{goal.why}</p>
   <div className={styles.try}><b>Try it at training</b><span>{goal.tryIt}</span></div>
   <p className={styles.meta}>Started {day(plan.setAt)} · {due?'Review due':`Review by ${day(plan.reviewAt)}`}</p>
  </article>
  <Lessons goal={goal} onLaunch={onLaunch}/>
  <div className={styles.notes}>
   <Notes kind="player" title="My reflection" hint={reflectionPrompt(goal.format)} state={state} commit={commit}/>
   <Notes kind="coach" title="Coach’s note" hint="Coach: write one moment you saw and one next step." state={state} commit={commit}/>
  </div>
  <aside className={styles.grownup}><b>For a grown-up</b><span>{goal.parentCue}</span><small>Ask about what they noticed. Try not to score or coach from the sideline.</small></aside>
  <div className={styles.row}><button type="button" className={styles.ghost} onClick={()=>setChoosing(true)}>Change focus</button><button type="button" className={styles.ghost} onClick={()=>{if(window.confirm('End this plan? Its notes will be cleared.'))commit(endPlan(state,Date.now()));}}>End plan</button></div>
 </div>;
}

function Chooser({format,setFormat,current,onChoose,onCancel}:{format:Format;setFormat:(f:Format)=>void;current?:string;onChoose:(id:string)=>void;onCancel?:()=>void}){
 return <div className={styles.plan}>
  <p className={styles.lead}>Pick <b>one</b> thing to get better at with your coach. You’ll watch it on the island, try it at training, and say what you noticed.</p>
  <div className={styles.formats} role="tablist" aria-label="Format">{IDP_FORMATS.map(f=><button key={f.format} type="button" role="tab" aria-selected={f.format===format} className={styles.format} onClick={()=>setFormat(f.format)}><b>{f.label}</b><small>{f.note}</small></button>)}</div>
  <div className={styles.goals}>{goalsFor(format).map(g=><button key={g.id} type="button" className={styles.goal} aria-pressed={g.id===current} onClick={()=>onChoose(g.id)}>
   <span className={styles.corner} data-corner={g.corner}>{format==='7v7'?CORNERS[g.corner].kid:CORNERS[g.corner].label}</span>
   <b>{g.title}</b><small>{g.why}</small>{g.id===current&&<em>Current focus</em>}
  </button>)}</div>
  {onCancel&&<div className={styles.row}><button type="button" className={styles.ghost} onClick={onCancel}>Keep my current focus</button></div>}
 </div>;
}

function Lessons({goal,onLaunch}:{goal:IdpGoal;onLaunch:()=>void}){
 const evidence=useQuestEvidence(),answers=useQuizCompletions(),steps=new Set(evidence.steps);
 const lessons=goal.lessons.flatMap(id=>{const l=findLesson(goal.format,id);return l?[l]:[];});
 const open=(l:PathLesson)=>{const s=lessonEvidence(goal.format,l,steps,answers);endLearningPreview();onLaunch();
  window.dispatchEvent(new CustomEvent(FORMAT_PATH_LAUNCH,{detail:{format:goal.format,lessonId:l.id,step:s.complete?0:s.step,quiz:!s.complete&&s.quiz,question:s.complete?0:s.question,nonce:Date.now()}}));};
 return <section className={styles.lessons} aria-labelledby="idp-watch"><h4 id="idp-watch">Watch it on the island</h4>
  {lessons.map(l=>{const s=lessonEvidence(goal.format,l,steps,answers);return <div key={l.id} className={styles.lesson}>
   <div><b>{l.name}</b><small>Explored on the island: {s.watched}/{l.steps} play steps · {s.correct}/{l.questions} quiz answers</small></div>
   <button type="button" className={styles.primary} onClick={()=>open(l)}>{s.complete?'Watch again':s.watched||s.correct?'Continue':'Watch'}</button>
  </div>;})}
  <small className={styles.caveat}>Exploring shows you’ve seen the idea. Your coach sees whether it happens in games.</small>
 </section>;
}

function Notes({kind,title,hint,state,commit}:{kind:NoteKind;title:string;hint:string;state:IdpState;commit:(s:IdpState)=>void}){
 const [text,setText]=useState('');
 const notes=(state.plan?.notes??[]).filter(n=>n.kind===kind).slice().reverse();
 const id=`idp-${kind}`;
 return <section className={styles.note} data-kind={kind} aria-labelledby={`${id}-t`}><h4 id={`${id}-t`}>{title}</h4>
  <form onSubmit={e=>{e.preventDefault();const next=addNote(state,kind,text,Date.now());if(next!==state){commit(next);setText('');}}}>
   <label htmlFor={id}>{hint}</label>
   <textarea id={id} value={text} maxLength={IDP_NOTE_MAX} rows={2} onChange={e=>setText(e.target.value)}/>
   <button type="submit" className={styles.primary} disabled={!text.trim()}>Save</button>
  </form>
  {notes.length>0&&<ul>{notes.map(n=><li key={n.id}><time dateTime={new Date(n.at).toISOString()}>{day(n.at)}</time><span>{n.text}</span><button type="button" aria-label={`Delete note from ${day(n.at)}`} onClick={()=>commit(removeNote(state,n.id))}>×</button></li>)}</ul>}
 </section>;
}
