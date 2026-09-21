'use client';
import {useState} from 'react';
import {BallHuntSummary} from './CoinQuest';
import QuestLearningPath from './QuestLearningPath';
import {Icon} from './Icon';
import {EXPLORE_ITEMS,useExploreChecklist} from '@/lib/town/exploreChecklist';
import styles from './IslandSettings.module.css';
import journey from './IslandJourney.module.css';
export default function IslandQuests({onDiscover,onExplore,exploration=false}:{onLearn:()=>void;onMap:()=>void;onStore?:()=>void;onDiscover:()=>void;onExplore?:()=>void;exploration?:boolean}){
 const [howOpen,setHowOpen]=useState(false);
 const items=useExploreChecklist(),doneCount=items.filter(item=>item.complete).length;
 return <div className={styles.content}>
 {!exploration?<>
 <section className={journey.arrival} aria-label="Your island journey">
 <div className={journey.arrivalCopy}><h3>Have fun.<br/>Explore your island.</h3><p>Find your game. Every play takes you somewhere new.</p></div>
 <svg className={journey.arrivalArt} viewBox="0 0 420 300" aria-hidden="true"><circle cx="320" cy="65" r="48" fill="#ffd03e"/><path d="M16 174C72 112 145 107 230 145S355 171 394 146Q416 132 416 163L409 248Q407 280 373 284C253 295 146 278 51 287Q16 291 13 259L8 204Q7 187 16 174Z" fill="#1255ee"/><path d="M16 236Q110 150 260 220T410 208" fill="none" stroke="#faf2da" strokeWidth="13" strokeLinecap="round"/><path d="M38 174Q18 111 91 101Q137 62 194 119Q254 143 197 185Q100 238 38 174Z" fill="#ffd03e"/><path d="M60 158Q49 112 104 121Q136 95 170 136Q207 161 167 176Q94 204 60 158" fill="#087451"/><path d="M100 178Q138 166 125 147T176 135" fill="none" stroke="#fff0cc" strokeWidth="9" strokeLinecap="round"/><g transform="translate(334 181) rotate(-12)"><ellipse cx="0" cy="61" rx="38" ry="8" fill="#073e38" opacity=".15"/><circle r="43" fill="#fff2d3"/><path d="M0-17L17-5L11 15H-11L-17-5Z M-14-40L-8-29L-26-19L-38-20 M36-24L25-18L30 4L42 9 M25 35L18 24L-5 30L-8 42 M-39 17L-27 12L-14 30L-20 38" fill="#173e37"/><path d="M0-17L-8-29M17-5L30 4M11 15L18 24M-11 15L-27 12M-17-5L-26-19" fill="none" stroke="#173e37" strokeWidth="2"/></g><path d="M180 167Q204 241 293 204" fill="none" stroke="#faf2da" strokeWidth="3" strokeDasharray="5 9"/><circle cx="125" cy="148" r="9" fill="#fa8bd2"/><path d="M121 123v-34l26 9-26 10" fill="#ff6230" stroke="#173e37" strokeWidth="3"/></svg>
 <div className={journey.guide}><button type="button" data-ui-sound={howOpen?'collapse':'expand'} aria-expanded={howOpen} aria-controls="island-journey-guide" onClick={()=>setHowOpen(v=>!v)}>How your journey works <span aria-hidden="true">{howOpen?'−':'+'}</span></button><div className={journey.guideReveal} data-open={howOpen} id="island-journey-guide" aria-hidden={!howOpen}><div><p>Explore, find hidden balls, and learn futsal, 7v7, 9v9, and 11v11 through lessons, quizzes, and stories. Complete each play and quiz to unlock the next stop. Stories are optional.</p><p>Build your understanding of the game to prepare for the academy island. When it opens, the Matchday Ferry will take you to the next stage of your journey.</p></div></div></div>
 </section>
 <section className={journey.basecamp} aria-label="Island side quests"><div className={journey.sectionLabel}><span>01 / BASE CAMP</span><p>Take a detour. Discover your island.</p></div><div className={`${styles.pathSummaries} ${journey.sideQuests}`}><BallHuntSummary onDiscover={onDiscover}/>
 <button type="button" className={styles.explorationSummary} onClick={onExplore} aria-haspopup="dialog"><span><strong>Explore</strong></span><span className={styles.explorationArrow}><Icon name="arrow" size={24}/></span><small>{doneCount} / {EXPLORE_ITEMS.length} completed</small></button></div></section>
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
