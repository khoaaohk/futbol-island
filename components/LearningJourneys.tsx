'use client';
import {pathText} from '@/lib/paths/pathText';
import {useState} from 'react';
import {LEARNING_JOURNEYS,learningStatus,nextLearningStage,type LearningId} from '@/lib/town/learningJourneys';
import {useLearning,launchLearning,favoriteLearning} from '@/lib/town/learningProgress';
import styles from './IslandPassport.module.css';
export default function LearningJourneys({onStories,onStore,compact=false}:{onStories?:(club:string)=>void;onStore?:(id:string)=>void;compact?:boolean}){
 const progress=useLearning(),[selected,setSelected]=useState<LearningId|null>(progress.active??null),[now]=useState(()=>Date.now());
 const ordered=[...LEARNING_JOURNEYS].sort((a,b)=>Number(b.id===progress.active)-Number(a.id===progress.active));
 return <section className={styles.learning} aria-label="My game">
 <h3>{compact?'futbo paths':'My game'}</h3><p>Help an island teammate read the game. Watch it, make a decision, then try a different situation.</p>
 {ordered.map(j=>{const r=progress.journeys[j.id],status=learningStatus(r),next=r?nextLearningStage(r,now):0,open=selected===j.id;
 return <article key={j.id} className={styles.learningCard} data-learning-quest={j.id}>
 <span className={styles.badge}>{j.concept} · {status.label}</span><h4>{j.title}</h4><p>{pathText(j.situation)}</p>
 <small>{status.detail}</small><progress max={4} value={r?.completed.filter(s=>s<4).length??0} aria-label={`${j.title} episode progress`}/>
 <div className={styles.learningActions}><button className={styles.primary} onClick={()=>launchLearning(j.id,compact?'quests':'passport')}>{next!==null&&next>=4?'Try a new review':next===null?'Practice again':r?'Continue path':'Try the play'} →</button><button className={styles.secondary} aria-expanded={open} onClick={()=>setSelected(open?null:j.id)}>{open?'Hide details':'Your playbook'}</button></div>
 {open&&<div className={styles.learningDetails}><p><strong>Your objective:</strong> {pathText(j.objective)}</p><p>{r?.completed.includes(3)?next!==null&&next>=4?'A new situation is ready. Can you spot the idea again?':'Your episode is complete. Return later for a different situation, or keep practicing now. Your first new review appears after about two days.':'Watch the example, try with help, then make two decisions in changed situations. You can leave and resume at any time.'}</p>
 {r&&<><button className={styles.secondary} onClick={()=>favoriteLearning(j.id)} aria-pressed={!!r.favorite}>{r.favorite?'★ Saved favorite':'☆ Save favorite'}</button><p>{r.attempts.length} answers saved · {r.attempts.filter(a=>a.attemptNumber===1&&a.correct&&!a.assistance.length).length} independent first answers</p></>}
 <div className={styles.learningActions}>{r?.completed.filter(s=>s<4).map(s=><button key={s} className={styles.secondary} onClick={()=>launchLearning(j.id,'playbook',s)}>Replay {['example','guided play','first situation','changed situation'][s]}</button>)}</div>
 <div className={styles.learningActions}>{onStories&&<button className={styles.secondary} onClick={()=>onStories(j.club)}>Club story & players</button>}</div></div>}
 </article>})}
 <p className={styles.note}>Island teammates are original characters. Your futbo progress is separate from club culture stamps. No missed-day penalties. Progress saves in this browser.</p>
 </section>;
}
