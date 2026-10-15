'use client';
import {useEffect,useRef,useState} from 'react';
import dynamicImport from 'next/dynamic';
import {BallHuntSummary} from './CoinQuest';
import {CardsSummary} from './CardsSummary';
import QuestLearningPath from './QuestLearningPath';
import {Icon} from './Icon';
import {EXPLORE_ITEMS,useExploreChecklist} from '@/lib/town/exploreChecklist';
import styles from './IslandSettings.module.css';
import journey from './IslandJourney.module.css';
import JourneyArrivalArt from './JourneyArrivalArt';
import {enterActivity,enterArea} from '@/lib/analytics/tracker';
import {primeTutorialNarration} from '@/lib/tutorial/tutorialAudio';
// The tutorial (scenes, art, player) is its own chunk: the Paths panel only pays for it when the button is used.
const loadTutorial=()=>import('./IslandTutorial');
const preloadTutorial=()=>{void loadTutorial();};
const IslandTutorial=dynamicImport(loadTutorial,{ssr:false});
export default function IslandQuests({onDiscover,onExplore,onCards,exploration=false}:{onLearn:()=>void;onMap:()=>void;onStore?:()=>void;onDiscover:()=>void;onExplore?:()=>void;onCards?:()=>void;exploration?:boolean}){
 useEffect(()=>enterArea('paths'),[]);
 useEffect(()=>enterActivity('paths'),[]);// …and as an activity (it opens over the Settings menu)// admin analytics: foreground time while Paths is open (a module variable, no render)
 // Oct 13 2026 (user): the journey-guide expander became "Island Tutorial": a narrated riso walkthrough that plays inside this card
 // (same box), closes with ×/Esc back to the card, and returns focus to the button. Its code loads only when it is opened (or hinted at).
 const [tutorial,setTutorial]=useState(false),primed=useRef<HTMLAudioElement|null>(null),tutorialButton=useRef<HTMLButtonElement>(null),returnFocus=useRef(false);
 const openTutorial=()=>{primed.current=primeTutorialNarration('welcome');setTutorial(true);};
 const closeTutorial=()=>{returnFocus.current=true;primed.current=null;setTutorial(false);};
 useEffect(()=>{if(!tutorial&&returnFocus.current){returnFocus.current=false;tutorialButton.current?.focus({preventScroll:true});}},[tutorial]);
 // The "Island Tutorial" row's CTA animation (user, Oct 13 2026): a brief pop/ring/nudge, a fresh remount (`key`) each time it
 // should play so the finite CSS animation-iteration-count restarts. It plays once the row scrolls into view, and again on
 // hover/focus; it pauses (via the data-page-hidden attribute, no re-render) while the tab is hidden.
 const guideRow=useRef<HTMLDivElement>(null),ctaPulse=useRef<HTMLSpanElement>(null),ctaSeen=useRef(false);
 // Replays the finite CSS pulse IN PLACE (Web Animations API), never by remounting: remounting the label under a finger between
 // pointerdown and pointerup made the browser drop the tap, so "Island Tutorial" didn't open on phones (Oct 15 2026 QA).
 const bumpCta=()=>{const el=ctaPulse.current;if(!el||typeof el.getAnimations!=='function')return;for(const a of el.getAnimations({subtree:true})){a.cancel();a.play();}};
 useEffect(()=>{
  const node=guideRow.current;if(!node)return;
  const onVisibility=()=>{if(node)node.dataset.pageHidden=String(document.hidden);};
  onVisibility();document.addEventListener('visibilitychange',onVisibility);
  const io=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{
   if(entries[0]?.isIntersecting&&!ctaSeen.current){ctaSeen.current=true;bumpCta();}
  },{threshold:.6});
  io?.observe(node);
  return()=>{document.removeEventListener('visibilitychange',onVisibility);io?.disconnect();};
 },[]);
 const items=useExploreChecklist(),doneCount=items.filter(item=>item.complete).length;
 // Oct 4 2026 (user, clear path): Paths' landing card ("Start here" / "Up next") and the Warm-up row render in this slot ABOVE the
 // hero art (QuestLearningPath portals them here), so the next lesson is above the fold on a phone and after "Back to Paths".
 const [landingSlot,setLandingSlot]=useState<HTMLDivElement|null>(null);
 return <div className={styles.content}>
 {!exploration?<>
 <div ref={setLandingSlot} className={journey.landingSlot}/>
 <section className={journey.arrival} data-tutorial={tutorial||undefined} aria-label="Your island journey">
 {tutorial?<IslandTutorial onClose={closeTutorial} primed={primed.current}/>:<>
 <div className={journey.arrivalCopy}><h3>Have fun.<br/>Explore your island.</h3></div>
 <JourneyArrivalArt className={journey.arrivalArt}/>
 <div ref={guideRow} className={journey.guide}><button ref={tutorialButton} type="button" data-ui-sound="expand" data-island-tutorial-open="" onClick={openTutorial} onPointerEnter={e=>{preloadTutorial();if(e.pointerType==='mouse')bumpCta();}} onFocus={()=>{preloadTutorial();bumpCta();}}>
  <span className={journey.ctaPulse} ref={ctaPulse}><span className={journey.ctaLabel}>Island Tutorial</span><span className={journey.ctaIcon} aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg></span></span>
 </button></div>
 </>}
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
