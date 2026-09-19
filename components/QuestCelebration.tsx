'use client';
import {useEffect,useRef,type CSSProperties} from 'react';
import {journeyById,learningStatus,nextLearningStage,isJourneyComplete,type LearningId,type JourneyRecord} from '@/lib/town/learningJourneys';
import {dismissLearningCelebration,launchLearning} from '@/lib/town/learningProgress';
import styles from './IslandPassport.module.css';
const LEARNED={support:'A new angle can open a passing lane. Look at the defender before choosing your next position.',width:'Width creates different options. Check where your teammate already is before making your run.',movement:'Read the marker, change direction and time your arrival with the pass.'};
export default function QuestCelebration({id,stage,record,onStore}:{id:LearningId;stage:number;record:JourneyRecord;onStore:(item:string)=>void}){
 const j=journeyById(id)!,earned=isJourneyComplete(record),status=learningStatus(record),next=nextLearningStage(record),heading=useRef<HTMLHeadingElement>(null),panel=useRef<HTMLElement>(null);
 useEffect(()=>{heading.current?.focus({preventScroll:true});panel.current?.scrollIntoView({block:'start'});},[id,stage]);
 return <section ref={panel} className={styles.celebration} aria-labelledby="quest-celebration-title" data-quest-celebration={id}>
 <div className={styles.confetti} aria-hidden="true">{Array.from({length:18},(_,i)=><i key={i} style={{'--x':`${8+i*4.9}%`,'--delay':`${i%5*.07}s`,'--turn':`${i*47}deg`,'--color':['#e6b955','#739568','#60a9b4'][i%3]} as CSSProperties}/>)}</div>
 <div className={styles.questMedal} aria-hidden="true"><svg viewBox="0 0 64 64" width="68" height="68" fill="none"><path d="m18 42-4 18 18-9 18 9-4-18" fill="#548167"/><circle cx="32" cy="27" r="23" fill="#f1c661" stroke="#fff1bc" strokeWidth="4"/><path d="m21 27 8 8 15-16" stroke="#294f43" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
 <small>{j.title}</small><h3 id="quest-celebration-title" ref={heading} tabIndex={-1}>{stage>=4?'Review complete!':stage===3&&earned?'Path complete!':'One step stronger!'}</h3>
 <p>{LEARNED[id]}</p><span className={styles.badge}>{status.label}</span><p className={styles.note}>{status.detail}</p>
 <div className={styles.learningActions}>{next!==null&&<button className={styles.primary} onClick={()=>{dismissLearningCelebration();launchLearning(id,'celebration');}}>Continue path →</button>}<button className={styles.secondary} onClick={dismissLearningCelebration}>Back to my playbook</button></div>
 </section>;
}
