'use client';
import {useState} from 'react';
import {BallHuntSummary} from './CoinQuest';
import {CardsSummary} from './CardsSummary';
import QuestLearningPath from './QuestLearningPath';
import {Icon} from './Icon';
import {EXPLORE_ITEMS,useExploreChecklist} from '@/lib/town/exploreChecklist';
import styles from './IslandSettings.module.css';
import journey from './IslandJourney.module.css';
import JourneyArrivalArt from './JourneyArrivalArt';
export default function IslandQuests({onDiscover,onExplore,onCards,exploration=false}:{onLearn:()=>void;onMap:()=>void;onStore?:()=>void;onDiscover:()=>void;onExplore?:()=>void;onCards?:()=>void;exploration?:boolean}){
 const [howOpen,setHowOpen]=useState(false);
 const items=useExploreChecklist(),doneCount=items.filter(item=>item.complete).length;
 return <div className={styles.content}>
 {!exploration?<>
 <section className={journey.arrival} aria-label="Your island journey">
 <div className={journey.arrivalCopy}><h3>Have fun.<br/>Explore your island.</h3></div>
 <JourneyArrivalArt className={journey.arrivalArt}/>
 <div className={journey.guide}><button type="button" data-ui-sound={howOpen?'collapse':'expand'} aria-expanded={howOpen} aria-controls="island-journey-guide" onClick={()=>setHowOpen(v=>!v)}>How your journey works <span aria-hidden="true">{howOpen?'−':'+'}</span></button><div className={journey.guideReveal} data-open={howOpen} id="island-journey-guide" aria-hidden={!howOpen}><div><p>Explore, find hidden balls, and learn futsal, 7v7, 9v9, and 11v11 through lessons, quizzes, and stories. Complete each play and quiz to unlock the next stop. Stories are optional.</p><p>Build your understanding of the game to prepare for the academy island. When it opens, the Matchday Ferry will take you to the next stage of your journey.</p></div></div></div>
 </section>
 <section className={journey.basecamp} aria-label="Island side quests"><div className={`${styles.pathSummaries} ${journey.sideQuests}`}>{onCards&&<CardsSummary onCards={onCards}/>}<BallHuntSummary onDiscover={onDiscover}/>
 <button type="button" className={styles.explorationSummary} onClick={onExplore} aria-haspopup="dialog"><span><strong>Explore</strong></span><span className={styles.explorationArrow}><Icon name="arrow" size={24}/></span><small>{doneCount} / {EXPLORE_ITEMS.length} <span data-count-word="">completed</span></small></button></div></section>
 <QuestLearningPath/>
 </>:<section className={styles.exploreChecklist} aria-label="Explore checklist">
  <h3 className={styles.exploreTitle}>Your island checklist</h3>
  <div className={styles.exploreIntro}><p>Activities check off automatically as you complete them.</p><strong>{doneCount} / {EXPLORE_ITEMS.length} completed</strong></div>
  <progress className={styles.exploreProgress} value={doneCount} max={EXPLORE_ITEMS.length} aria-label="Explore checklist progress"/>
  <ul className={styles.exploreList}>{items.map(item=><li key={item.id}><div className={styles.exploreRow} data-complete={item.complete}><span className={styles.exploreCopy}><strong>{item.title}</strong><small>{item.detail}</small></span><span className={styles.exploreIndicator} data-complete={item.complete} aria-label={item.complete?'Completed':item.target>1?`${item.value} of ${item.target} ${item.unit}`:'Not yet completed'}>{item.complete?<Icon name="check" size={20}/>:item.target>1?<><strong>{item.value}/{item.target}</strong><small>{item.unit}</small></>:<span className={styles.explorePending}/>}</span></div></li>)}</ul>
  <p className={styles.exploreSaved}>Your checklist saves in this browser.</p>
 </section>}
 </div>;
}
