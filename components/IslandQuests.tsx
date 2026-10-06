'use client';
import {useEffect,useRef,useState} from 'react';
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
 // "How your journey works" opens downward only (user, Sep 25 2026): the card's min-height left spare space around the guide, so the
 // growing guide ate that space and its divider and title slid up. Opening locks the resting layout (the rows above the guide keep
 // their px heights, the guide keeps its top via a margin, min-height off), so only the text below the title grows the card. The lock
 // lifts once the guide has closed again (after its 280 ms reveal), or on a resize.
 const arrivalRef=useRef<HTMLElement>(null),guideRef=useRef<HTMLDivElement>(null);
 const unlockGuide=()=>{const card=arrivalRef.current,guide=guideRef.current;if(!card||!guide)return;
  card.style.removeProperty('grid-template-rows');card.style.removeProperty('min-height');guide.style.removeProperty('align-self');guide.style.removeProperty('margin-top');};
 const toggleHow=()=>{const card=arrivalRef.current,guide=guideRef.current;
  if(!howOpen&&card&&guide&&!card.style.gridTemplateRows){const top0=guide.getBoundingClientRect().top,rows=getComputedStyle(card).gridTemplateRows.split(' ');
   card.style.gridTemplateRows=[...rows.slice(0,-1),'auto'].join(' ');card.style.minHeight='0';guide.style.alignSelf='start';guide.style.marginTop='0px';
   guide.style.marginTop=`${Math.round((top0-guide.getBoundingClientRect().top)*100)/100}px`;}
  setHowOpen(v=>!v);};
 useEffect(()=>{if(howOpen)return;const t=setTimeout(unlockGuide,matchMedia('(prefers-reduced-motion: reduce)').matches?0:320);return ()=>clearTimeout(t);},[howOpen]);
 useEffect(()=>{addEventListener('resize',unlockGuide);return ()=>removeEventListener('resize',unlockGuide);},[]);
 const items=useExploreChecklist(),doneCount=items.filter(item=>item.complete).length;
 // Oct 4 2026 (user, clear path): Paths' landing card ("Start here" / "Up next") and the Warm-up row render in this slot ABOVE the
 // hero art (QuestLearningPath portals them here), so the next lesson is above the fold on a phone and after "Back to Paths".
 const [landingSlot,setLandingSlot]=useState<HTMLDivElement|null>(null);
 return <div className={styles.content}>
 {!exploration?<>
 <div ref={setLandingSlot} className={journey.landingSlot}/>
 <section ref={arrivalRef} className={journey.arrival} aria-label="Your island journey">
 <div className={journey.arrivalCopy}><h3>Have fun.<br/>Explore your island.</h3></div>
 <JourneyArrivalArt className={journey.arrivalArt}/>
 <div ref={guideRef} className={journey.guide}><button type="button" data-ui-sound={howOpen?'collapse':'expand'} aria-expanded={howOpen} aria-controls="island-journey-guide" onClick={toggleHow}>How your journey works <span aria-hidden="true">{howOpen?'−':'+'}</span></button><div className={journey.guideReveal} data-open={howOpen} id="island-journey-guide" aria-hidden={!howOpen}><div><p>Explore, find hidden balls, and learn futsal, 7v7, 9v9, and 11v11 through lessons, quizzes, and stories. Complete each play and quiz to unlock the next stop. Stories are optional.</p><p>Build your understanding of the game to prepare for the academy island. When it opens, the Matchday Ferry will take you to the next stage of your journey.</p></div></div></div>
 </section>
 <section className={journey.basecamp} aria-label="Island side quests"><div className={`${styles.pathSummaries} ${journey.sideQuests}`}>{onCards&&<CardsSummary onCards={onCards}/>}<BallHuntSummary onDiscover={onDiscover}/>
 <button type="button" className={styles.explorationSummary} onClick={onExplore} aria-haspopup="dialog"><span><strong>Explore</strong></span><span className={styles.explorationArrow}><Icon name="arrow" size={24}/></span><small>{doneCount} / {EXPLORE_ITEMS.length} <span data-count-word="">completed</span></small></button></div></section>
 <QuestLearningPath landingSlot={landingSlot}/>
 </>:<section className={styles.exploreChecklist} aria-label="Explore checklist">
  <h3 className={styles.exploreTitle}>Your island checklist</h3>
  <div className={styles.exploreIntro}><p>Activities check off automatically as you complete them.</p><strong>{doneCount} / {EXPLORE_ITEMS.length} completed</strong></div>
  <progress className={styles.exploreProgress} value={doneCount} max={EXPLORE_ITEMS.length} aria-label="Explore checklist progress"/>
  <ul className={styles.exploreList}>{items.map(item=><li key={item.id}><div className={styles.exploreRow} data-complete={item.complete}><span className={styles.exploreCopy}><strong>{item.title}</strong><small>{item.detail}</small></span><span className={styles.exploreIndicator} data-complete={item.complete} aria-label={item.complete?'Completed':item.target>1?`${item.value} of ${item.target} ${item.unit}`:'Not yet completed'}>{item.complete?<Icon name="check" size={20}/>:item.target>1?<><strong>{item.value}/{item.target}</strong><small>{item.unit}</small></>:<span className={styles.explorePending}/>}</span></div></li>)}</ul>
  <p className={styles.exploreSaved}>Your checklist saves in this browser.</p>
 </section>}
 </div>;
}
