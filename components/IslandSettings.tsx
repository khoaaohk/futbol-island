'use client';
import {IslandBottleLogo} from './IslandBottle';
import {BackButton} from './BackButton';
import {DoneButton} from './DoneButton';
import shell from './ModalShell.module.css';
import {Icon} from './Icon';

import {useEffect,useRef,useState,type KeyboardEvent} from 'react';
import {useSceneryRest} from '@/lib/sceneryRest';
import {batterySaverOn,setBatterySaver,subscribeHeatTier} from '@/lib/graphics/heatTier';
import {COACH_VOICES} from '@/lib/town/useLessonVoice';
import styles from './IslandSettings.module.css';
import IslandQuests from './IslandQuests';
import CoinQuest from './CoinQuest';
import dynamicImport from 'next/dynamic';
import {CardOfferDot,pendingPicksLabel,usePendingPicks} from './CardOfferBadges';
import {OPEN_CARDS_EVENT} from '@/lib/town/cardRewardStore';
const CardCollection=dynamicImport(()=>import('./CardCollection'),{ssr:false});
/** Ms until the Paths button's 3 s cycle is between swaps and shakes (250–2350 ms: one icon fully shown, button still), so a rest never
 * freezes a half-blurred icon or a tilted button. The icons' 3 s / 6 s delays keep them on the button's cycle. */
function hudSettle(nav:HTMLElement){const a=nav.querySelector('[data-tour=quests]')?.getAnimations()[0];const t=Number(a?.currentTime);if(!a||!Number.isFinite(t))return 0;const phase=t%3000;return phase>=250&&phase<=2350?0:(3250-phase)%3000;}
/** Steady gameplay input (heat pass 3): the joystick, ride/kick buttons and movement keys. While held, the Paths loops rest, so the
 * compositor follows the 30 fps island instead of running at display rate. Letting go leaves them resting (heat pass 4). Exported for tests. */
export const HUD_HOLD_KEYS=new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','j','shift']);
export const HUD_HOLD_SELECTOR='.touch-controls,.joystick,.touch-actions,.travel-actions,.town-scene';// .town-scene: canvas taps/drags (heat pass 4, audit F7)
export function hudHold(event:Event){if(event.type==='keydown')return HUD_HOLD_KEYS.has(String((event as globalThis.KeyboardEvent).key).toLowerCase());const target=event.target;return target instanceof Element&&!!target.closest(HUD_HOLD_SELECTOR);}

type TimeOfDay='day'|'sunset'|'night';
type Props={
  voiceEnabled:boolean;onVoiceChange:(enabled:boolean)=>void;
  coachVoice:string;onCoachVoiceChange:(voice:string)=>void;
  controlsFlipped:boolean;onControlsFlippedChange:(flipped:boolean)=>void;
  open:boolean;
  onOpenChange:(open:boolean)=>void;
  onOpenMap:()=>void;onStartLearning:()=>void;onOpenStore?:(itemId?:string)=>void;pathsRequest?:{nonce:number}|null;onRestartOnboarding?:()=>void;
  musicEnabled:boolean;
  musicVolume:number; soundVolume:number; onMusicVolumeChange:(value:number)=>void; onSoundVolumeChange:(value:number)=>void;
  onMusicChange:(enabled:boolean)=>void;
  soundMuted:boolean;
  onSoundMutedChange:(muted:boolean)=>void;
  timeOfDay:TimeOfDay;
  onTimeOfDayChange:(time:TimeOfDay)=>void;
};

function Symbol({kind}:{kind:'settings'|'about'|'close'}){
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind==='close'?<path d="m6 6 12 12M18 6 6 18"/>:kind==='about'?<><circle cx="12" cy="12" r="8.5"/><path d="M12 11v6M12 7.5v.1"/></>:<><path d="m9 3-.6 2.2-2 .9-2-.7-2 3.4 1.6 1.6v2.3L2.4 14l2 3.4 2-.7 2 .9L9 20h4l.6-2.4 2-.9 2 .7 2-3.4-1.6-1.3v-2.3l1.6-1.6-2-3.4-2 .7-2-.9L13 3z"/><circle cx="11" cy="11.5" r="3"/></>}
  </svg>;
}

export default function IslandSettings({voiceEnabled,onVoiceChange,coachVoice,onCoachVoiceChange,controlsFlipped,onControlsFlippedChange,open,onOpenChange,onOpenMap,onStartLearning,onOpenStore,pathsRequest,onRestartOnboarding,musicEnabled,musicVolume,soundVolume,onMusicVolumeChange,onSoundVolumeChange,onMusicChange,soundMuted,onSoundMutedChange,timeOfDay,onTimeOfDayChange}:Props){
  const storeItem=useRef<string|undefined>(undefined);
  const triggers=useRef<HTMLElement>(null);
  // The Paths button's loops (and, via globals.css, the field prompt's pulse) rest 6 s after the last input, on a clean frame (phone heat),
  // and while the child steers or holds a ride button (they wake when it is released).
  useSceneryRest(triggers,styles.hudRest,hudSettle,hudHold);
  // Battery saver (heat pass 4): read after mount (localStorage), and follow changes made elsewhere.
  const [saver,setSaver]=useState(false);useEffect(()=>{setSaver(batterySaverOn());return subscribeHeatTier(()=>setSaver(batterySaverOn()));},[]);
  useEffect(()=>{const sync=()=>{if(triggers.current)triggers.current.dataset.pageHidden=String(document.hidden);};sync();document.addEventListener('visibilitychange',sync);return()=>document.removeEventListener('visibilitychange',sync);},[]);
  const mapAfterClose=useRef(false),learnAfterClose=useRef(false),storeAfterClose=useRef(false),welcomeAfterClose=useRef(false);
  const [backward,setBackward]=useState(false);
  const [tab,setTab]=useState<'settings'|'about'|'quests'|'balls'|'exploration'|'shortcuts'|'cards'>('settings');
  useEffect(()=>{const show=()=>{setTab('balls');setBackward(false);};window.addEventListener('fi2-open-coin-panel',show);return()=>window.removeEventListener('fi2-open-coin-panel',show);},[]);
  useEffect(()=>{if(pathsRequest){setTab('quests');setBackward(false);}},[pathsRequest]);
  // "See it in my binder" after choosing a card: open Paths → Collect cards (the binder turns to the new card itself).
  useEffect(()=>{const show=()=>{setTab('cards');setBackward(false);onOpenChange(true);};window.addEventListener(OPEN_CARDS_EVENT,show);return()=>window.removeEventListener(OPEN_CARDS_EVENT,show);},[onOpenChange]);
  const picks=usePendingPicks();
  useEffect(()=>{if(new URLSearchParams(location.search).get('panel')==='about'){setTab('about');onOpenChange(true);}},[]);
  const body=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(body.current)body.current.scrollTop=0;close.current?.focus({preventScroll:true});},[tab]);
  const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restoreFocus=useRef<HTMLElement|null>(null);
  useEffect(()=>{
    const element=dialog.current;if(!element)return;
    let timer:ReturnType<typeof setTimeout>|undefined;
    if(open){
      if(body.current)body.current.scrollTop=0;
      if(!element.open){restoreFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null;element.showModal();element.scrollLeft=0;if(body.current)body.current.scrollTop=0;close.current?.focus({preventScroll:true});}
    }else if(element.open){
      const finish=()=>{element.close();if(welcomeAfterClose.current){welcomeAfterClose.current=false;onRestartOnboarding?.();}else if(storeAfterClose.current){storeAfterClose.current=false;onOpenStore?.(storeItem.current);storeItem.current=undefined;}else if(learnAfterClose.current){learnAfterClose.current=false;onStartLearning();}else if(mapAfterClose.current){mapAfterClose.current=false;onOpenMap();}else if(restoreFocus.current?.isConnected)restoreFocus.current.focus({preventScroll:true});};
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)finish();else timer=setTimeout(finish,240);
    }
    return ()=>{if(timer)clearTimeout(timer);};
  },[open]);
  useEffect(()=>()=>{if(restoreFocus.current?.isConnected)restoreFocus.current.focus();},[]);
  const show=(next:'settings'|'about'|'quests'|'balls'|'exploration'|'shortcuts'|'cards')=>{setBackward(false);setTab(next);onOpenChange(true);};
  const backPage=()=>{if(tab==='settings'||tab==='quests'){onOpenChange(false);return;}setBackward(true);setTab(tab==='about'||tab==='shortcuts'?'settings':'quests');};
  const keyboard=(event:KeyboardEvent<HTMLDialogElement>)=>{
    event.stopPropagation();
    if(event.key==='Escape'){event.preventDefault();backPage();return;}
    if(event.key!=='Tab')return;
    const controls=Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), [tabindex="0"]')??[]).filter(el=>el.checkVisibility()&&!el.closest('[inert]'));
    if(!controls?.length)return;
    const first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  };
  return <>
    <nav ref={triggers} className={styles.triggers} data-hud-triggers aria-label="Island information">
      <button type="button" className={styles.circle} aria-label="Settings" aria-haspopup="dialog" aria-expanded={open&&tab==='settings'} onClick={()=>show('settings')}><Symbol kind="settings"/></button>
      <button type="button" className={`${styles.circle} ${styles.questsTrigger}`} data-tour="quests" aria-label={`Paths${pendingPicksLabel(picks)}`} aria-haspopup="dialog" aria-expanded={open&&(tab==='quests'||tab==='balls'||tab==='exploration'||tab==='cards')} onClick={()=>show('quests')}><CardOfferDot/><span className={styles.pathIconCycle} aria-hidden="true">{['bolt','book','play'].map(name=><span key={name} data-path-icon={name}><Icon name={name} size={24}/></span>)}</span></button>
    </nav>
    <dialog ref={dialog} className={`${styles.dialog} ${styles.fullModal} ${tab==='balls'?styles.ballsModal:tab==='exploration'?styles.exploreModal:''} ${tab==='quests'||tab==='balls'||tab==='exploration'||tab==='cards'?styles.pathsModal:''} ${open?styles.entering:styles.leaving}`} aria-labelledby="island-settings-title" aria-modal="true" onKeyDown={keyboard} onKeyUp={e=>e.stopPropagation()} onCancel={e=>{e.preventDefault();backPage();}} onClick={e=>{if(e.target===e.currentTarget)onOpenChange(false);}}>
      <section data-paths-host={tab==='quests'||tab==='balls'||tab==='exploration'||tab==='cards'?'true':undefined} className={`${styles.panel} ${shell.shell} ${tab==='quests'||tab==='balls'||tab==='exploration'||tab==='cards'?shell.white:shell.drawer}`}>
        <header className={`${styles.header} ${shell.header}`}>{tab==='quests'&&<IslandBottleLogo/>}{(tab==='balls'||tab==='exploration'||tab==='cards'||tab==='about'||tab==='shortcuts')&&<BackButton ref={close} className={styles.headerBack} onBack={backPage}/>}<div><h2 id="island-settings-title" className={tab==='settings'?styles.settingsTitle:undefined}>{tab==='settings'?'Make it your island':tab==='quests'?'Island paths':tab==='balls'?'Ball hunt':tab==='cards'?'Collect cards':tab==='exploration'?'Explore':tab==='shortcuts'?'Keyboard shortcuts':'About us'}</h2></div>{/* Sub-pages use Back only; an invisible spacer keeps the title centred. */}{tab==='about'||tab==='shortcuts'||tab==='cards'||tab==='balls'||tab==='exploration'?<span className={`${styles.circle} ${styles.close}`} aria-hidden="true" style={{visibility:'hidden'}}/>:<DoneButton ref={close} className={`${styles.circle} ${styles.close}`} onDone={()=>onOpenChange(false)}/>}</header><div ref={body} className={shell.body}>{tab==='about'&&<p className={styles.aboutSubtitle}>A playful island for learning football together.</p>}
        <div key={tab} className={backward?styles.subpageBack:styles.subpage}>
        {(tab==='quests'||tab==='exploration')?<IslandQuests exploration={tab==='exploration'} onExplore={()=>{setBackward(false);setTab('exploration');}} onDiscover={()=>{setBackward(false);setTab('balls');}} onCards={()=>{setBackward(false);setTab('cards');}} onMap={()=>{mapAfterClose.current=true;onOpenChange(false);}} onStore={onOpenStore?()=>{storeAfterClose.current=true;onOpenChange(false);}:undefined} onLearn={()=>{learnAfterClose.current=true;onOpenChange(false);}}/>:tab==='cards'?<div className={styles.content}><CardCollection/></div>:tab==='balls'?<div className={styles.content}><CoinQuest onStore={()=>{storeItem.current='costume:matchday-fox';storeAfterClose.current=true;onOpenChange(false);}}/></div>:tab==='shortcuts'?<div className={styles.content}><dl id="desktop-keyboard-shortcuts" className={styles.shortcutList}>{[['WASD / ↑ ↓ ← →','Move'],['Space','Kick · hold for a stronger, higher shot'],['J','Juggle / stop juggling'],['R','Change ride'],['E','Talk to a nearby island character'],['M','Open / close map'],['Space / J','Use your ride’s two actions'],['Space / J in a truck','Speed up / honk'],['Esc','Close the map or current panel']].map(([key,action])=><div key={key}><dt><kbd>{key}</kbd></dt><dd>{action}</dd></div>)}</dl></div>:tab==='settings'?<div className={`${styles.content} ${styles.settingsJourney}`}>
          <p className={styles.settingsEyebrow}>YOUR ISLAND, YOUR WAY</p>
          <div className={styles.settingsEntries}><button className={`${styles.mapButton} ${styles.secondaryButton}`} onClick={()=>{setBackward(false);setTab('about');}}><span className={styles.entryCopy}><strong>About us</strong><small>Why we built Futbol Island.</small></span><span aria-hidden="true"><Icon name="arrow"/></span></button>
          <button type="button" className={`${styles.mapButton} ${styles.secondaryButton}`} onClick={()=>{mapAfterClose.current=true;onOpenChange(false);}}>Open full map <span aria-hidden="true"><Icon name="external"/></span></button>
          {onRestartOnboarding&&<div className={styles.walkthrough}><button type="button" className={`${styles.mapButton} ${styles.secondaryButton}`} onClick={()=>{welcomeAfterClose.current=true;onOpenChange(false);}}>See walkthrough <span aria-hidden="true"><Icon name="arrow"/></span></button></div>}
          <div className={styles.desktopShortcuts}><button type="button" className={`${styles.mapButton} ${styles.secondaryButton}`} onClick={()=>{setBackward(false);setTab('shortcuts');}}>Keyboard shortcuts <Icon name="arrow"/></button></div>
          </div><section className={styles.preferenceCard}><h3>Time of day</h3><p className={styles.copy}>Choose the light for your next lap.</p>
          <div className={styles.times} role="group" aria-label="Time of day">{(['day','sunset','night'] as const).map(time=><button type="button" key={time} aria-pressed={timeOfDay===time} onClick={()=>onTimeOfDayChange(time)}><span aria-hidden="true"><Icon name={time==='day'?'sun':time==='sunset'?'sunset':'moon'} size={24}/></span>{time[0].toUpperCase()+time.slice(1)}</button>)}</div>
          </section><section className={styles.preferenceCard}><h3>Island sounds</h3>
          <button type="button" className={styles.toggle} aria-label="Background music" aria-pressed={musicEnabled} onClick={()=>onMusicChange(!musicEnabled)}><span><strong>Background music</strong><small>A soundtrack for your travels.</small></span><span className={styles.switch} aria-hidden="true">{musicEnabled?'On':'Off'}</span></button>
          <label className={styles.volume}><span>Music volume <output>{Math.round(musicVolume*100)}%</output></span><input type="range" min="0" max="100" value={Math.round(musicVolume*100)} onChange={e=>onMusicVolumeChange(Number(e.target.value)/100)} aria-label="Music volume"/></label>
          <button type="button" className={styles.toggle} aria-label="Sound effects" aria-pressed={!soundMuted} onClick={()=>onSoundMutedChange(!soundMuted)}><span><strong>Sound effects</strong><small>Buttons, rides and island adventures.</small></span><span className={styles.switch} aria-hidden="true">{soundMuted?'Off':'On'}</span></button>
          <label className={styles.volume}><span>Sound effects volume <output>{Math.round(soundVolume*100)}%</output></span><input type="range" min="0" max="100" value={Math.round(soundVolume*100)} onChange={e=>onSoundVolumeChange(Number(e.target.value)/100)} aria-label="Sound effects volume"/></label>
          </section><section className={styles.preferenceCard}><h3>Lesson narration</h3>
          <button type="button" className={styles.toggle} aria-label="Lesson voice" aria-pressed={voiceEnabled} onClick={()=>onVoiceChange(!voiceEnabled)}><span><strong>Lesson voice</strong><small>Hear your coach explain each play.</small></span><span className={styles.switch} aria-hidden="true">{voiceEnabled?'On':'Off'}</span></button>
          <label className={styles.voiceSelect}>Coach voice<select aria-label="Coach voice" value={coachVoice} onChange={e=>onCoachVoiceChange(e.target.value)}>{COACH_VOICES.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
          </section><section className={`${styles.mobileControls} ${styles.preferenceCard}`} aria-label="Mobile controls"><h3>Mobile controls</h3><button type="button" className={styles.toggle} aria-label="Flip controls" aria-pressed={controlsFlipped} onClick={()=>onControlsFlippedChange(!controlsFlipped)}><span><strong>Flip controls</strong><small>{controlsFlipped?'Move on the right. Map and actions on the left.':'Move on the left. Map and actions on the right.'}</small></span><span className={styles.switch} aria-hidden="true">{controlsFlipped?'On':'Off'}</span></button></section><section className={styles.preferenceCard} aria-label="Battery"><h3>Battery</h3><button type="button" className={styles.toggle} aria-label="Battery saver" aria-pressed={saver} data-battery-saver onClick={()=>setBatterySaver(!saver)}><span><strong>Battery saver</strong><small>Keeps your device cooler with slightly softer graphics, a gentler frame rate and calm water.</small></span><span className={styles.switch} aria-hidden="true">{saver?'On':'Off'}</span></button></section>

          
        </div>:<div className={`${styles.content} ${styles.about}`}>
          <p>Walk, ride or fly between futsal, 7v7, 9v9 and 11v11 pitches. Watch plays in 3D, learn the tactics, and test what you know.</p>
          <p><strong>Why it’s free.</strong> Learning the concepts of the game shouldn’t cost money. Club soccer already prices too many kids out, so Futbol Island is free, always.</p>
          <section className={styles.support} aria-labelledby="support-island-title"><h3 id="support-island-title">Support Futbol Island</h3><p className={styles.intro}>The app is free. Tips grow the game.</p>
          <p>If it’s helped you and you’d like to chip in, feel free to buy us a coffee. Every dollar goes straight to non-profits growing the game in our community. We’re proud to support <a href="https://www.instagram.com/fc_yap/" target="_blank" rel="noopener noreferrer">FC YAP</a>, <a href="https://www.instagram.com/streetsoccersd/" target="_blank" rel="noopener noreferrer">Street Soccer San Diego</a>, and <a href="https://www.instagram.com/roninfutsal/" target="_blank" rel="noopener noreferrer">Ronin Futsal</a>.</p>
          <div className={styles.donations}>{[5,10,15,25].map(amount=><a key={amount} href={`/coffee/checkout?amount=${amount*100}&return=about`} target="_blank" rel="noopener noreferrer" aria-label={`Donate $${amount} through Stripe`}>${amount}</a>)}</div>
          <p className={styles.donationNote}>Choose an amount. You can increase the quantity at checkout. Secure by Stripe.</p></section>
          <section aria-labelledby="story-music-credit"><h3 id="story-music-credit">Story music</h3><p>“Wildflowers” by <a href="https://www.scottbuckley.com.au/library/wildflowers/" target="_blank" rel="noopener noreferrer">Scott Buckley</a>, released under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>. Excerpted, faded and mixed beneath Grit’s narration.</p><p>“Ascension” by <a href="https://www.scottbuckley.com.au/library/ascension/" target="_blank" rel="noopener noreferrer">Scott Buckley</a>, released under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>. Excerpted, faded and mixed beneath Regulating Emotions’ narration.</p></section>
        </div>}
        </div>
      </div></section>
    </dialog>
  </>;
}
