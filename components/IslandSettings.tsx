'use client';
import {IslandBottleLogo} from './IslandBottle';
import {BackButton} from './BackButton';
import {DoneButton} from './DoneButton';
import shell from './ModalShell.module.css';
import {Icon} from './Icon';

import {useEffect,useRef,useState,type KeyboardEvent} from 'react';
import {COACH_VOICES} from '@/lib/town/useLessonVoice';
import styles from './IslandSettings.module.css';
import IslandQuests from './IslandQuests';
import CoinQuest from './CoinQuest';

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
  const mapAfterClose=useRef(false),learnAfterClose=useRef(false),storeAfterClose=useRef(false),welcomeAfterClose=useRef(false);
  const [backward,setBackward]=useState(false);
  const [tab,setTab]=useState<'settings'|'about'|'quests'|'balls'|'exploration'|'shortcuts'>('settings');
  useEffect(()=>{const show=()=>{setTab('balls');setBackward(false);};window.addEventListener('fi2-open-coin-panel',show);return()=>window.removeEventListener('fi2-open-coin-panel',show);},[]);
  useEffect(()=>{if(pathsRequest){setTab('quests');setBackward(false);}},[pathsRequest]);
  useEffect(()=>{if(new URLSearchParams(location.search).get('panel')==='about'){setTab('about');onOpenChange(true);}},[]);
  const body=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(body.current)body.current.scrollTop=0;close.current?.focus({preventScroll:true});},[tab]);
  const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restoreFocus=useRef<HTMLElement|null>(null);
  useEffect(()=>{
    const element=dialog.current;if(!element)return;
    let timer:ReturnType<typeof setTimeout>|undefined;
    if(open){
      if(!element.open){restoreFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null;element.showModal();element.scrollLeft=0;close.current?.focus({preventScroll:true});}
    }else if(element.open){
      const finish=()=>{element.close();if(welcomeAfterClose.current){welcomeAfterClose.current=false;onRestartOnboarding?.();}else if(storeAfterClose.current){storeAfterClose.current=false;onOpenStore?.(storeItem.current);storeItem.current=undefined;}else if(learnAfterClose.current){learnAfterClose.current=false;onStartLearning();}else if(mapAfterClose.current){mapAfterClose.current=false;onOpenMap();}else if(restoreFocus.current?.isConnected)restoreFocus.current.focus({preventScroll:true});};
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)finish();else timer=setTimeout(finish,240);
    }
    return ()=>{if(timer)clearTimeout(timer);};
  },[open]);
  useEffect(()=>()=>{if(restoreFocus.current?.isConnected)restoreFocus.current.focus();},[]);
  const show=(next:'settings'|'about'|'quests'|'balls'|'exploration'|'shortcuts')=>{setBackward(false);setTab(next);onOpenChange(true);};
  const keyboard=(event:KeyboardEvent<HTMLDialogElement>)=>{
    event.stopPropagation();
    if(event.key==='Escape'){event.preventDefault();onOpenChange(false);return;}
    if(event.key!=='Tab')return;
    const controls=Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), [tabindex="0"]')??[]).filter(el=>el.checkVisibility()&&!el.closest('[inert]'));
    if(!controls?.length)return;
    const first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  };
  return <>
    <nav className={styles.triggers} aria-label="Island information">
      <button type="button" className={styles.circle} aria-label="Settings" aria-haspopup="dialog" aria-expanded={open&&tab==='settings'} onClick={()=>show('settings')}><Symbol kind="settings"/></button>
      <button type="button" className={`${styles.circle} ${styles.questsTrigger}`} data-tour="quests" aria-label="Paths" aria-haspopup="dialog" aria-expanded={open&&(tab==='quests'||tab==='balls'||tab==='exploration')} onClick={()=>show('quests')}><Icon name="bolt" size={24}/></button>
    </nav>
    <dialog ref={dialog} className={`${styles.dialog} ${styles.fullModal} ${tab==='balls'?styles.ballsModal:tab==='exploration'?styles.exploreModal:''} ${tab==='quests'||tab==='balls'||tab==='exploration'?styles.pathsModal:''} ${open?styles.entering:styles.leaving}`} aria-labelledby="island-settings-title" aria-modal="true" onKeyDown={keyboard} onKeyUp={e=>e.stopPropagation()} onCancel={e=>{e.preventDefault();onOpenChange(false);}} onClick={e=>{if(e.target===e.currentTarget)onOpenChange(false);}}>
      <section data-paths-host={tab==='quests'||tab==='balls'||tab==='exploration'?'true':undefined} className={`${styles.panel} ${shell.shell} ${tab==='quests'||tab==='balls'||tab==='exploration'?shell.white:shell.drawer}`}>
        <header className={`${styles.header} ${shell.header}`}>{tab==='quests'&&<IslandBottleLogo/>}{(tab==='balls'||tab==='exploration'||tab==='about'||tab==='shortcuts')&&<BackButton className={styles.headerBack} onBack={()=>{setBackward(true);setTab(tab==='about'||tab==='shortcuts'?'settings':'quests');}}/>}<div><h2 id="island-settings-title">{tab==='settings'?'Make it your island':tab==='quests'?'Island paths':tab==='balls'?'Ball hunt':tab==='exploration'?'Explore':tab==='shortcuts'?'Keyboard shortcuts':'About us'}</h2></div><DoneButton ref={close} className={`${styles.circle} ${styles.close}`} onDone={()=>onOpenChange(false)}/></header><div ref={body} className={shell.body}>{tab==='about'&&<p className={styles.aboutSubtitle}>A playful island for learning football together.</p>}
        <div key={tab} className={backward?styles.subpageBack:styles.subpage}>
        {(tab==='quests'||tab==='exploration')?<IslandQuests exploration={tab==='exploration'} onExplore={()=>{setBackward(false);setTab('exploration');}} onDiscover={()=>{setBackward(false);setTab('balls');}} onMap={()=>{mapAfterClose.current=true;onOpenChange(false);}} onStore={onOpenStore?()=>{storeAfterClose.current=true;onOpenChange(false);}:undefined} onLearn={()=>{learnAfterClose.current=true;onOpenChange(false);}}/>:tab==='balls'?<div className={styles.content}><CoinQuest onStore={()=>{storeItem.current='costume:matchday-fox';storeAfterClose.current=true;onOpenChange(false);}}/></div>:tab==='shortcuts'?<div className={styles.content}><dl id="desktop-keyboard-shortcuts" className={styles.shortcutList}>{[['WASD / ↑ ↓ ← →','Move'],['Space','Kick · hold for a stronger, higher shot'],['J','Juggle / stop juggling'],['R','Change ride'],['E','Talk to a nearby island character'],['M','Open / close map'],['Space / J','Use your ride’s two actions'],['Space / J in a truck','Speed up / honk'],['Esc','Close the map or current panel']].map(([key,action])=><div key={key}><dt><kbd>{key}</kbd></dt><dd>{action}</dd></div>)}</dl></div>:tab==='settings'?<div className={`${styles.content} ${styles.settingsJourney}`}>
          <p className={styles.settingsEyebrow}>YOUR ISLAND, YOUR WAY</p>
          <div className={styles.settingsEntries}><button className={`${styles.mapButton} ${styles.secondaryButton}`} onClick={()=>{setBackward(false);setTab('about');}}><span className={styles.entryCopy}><strong>About us</strong><small>Why we built Futbol Island.</small></span><span aria-hidden="true"><Icon name="arrow"/></span></button>
          <button type="button" className={`${styles.mapButton} ${styles.secondaryButton}`} onClick={()=>{mapAfterClose.current=true;onOpenChange(false);}}>Open full map <span aria-hidden="true"><Icon name="external"/></span></button>
          {onRestartOnboarding&&<div className={styles.walkthrough}><button type="button" className={`${styles.mapButton} ${styles.secondaryButton}`} onClick={()=>{welcomeAfterClose.current=true;onOpenChange(false);}}>See Walkthrough <span aria-hidden="true"><Icon name="arrow"/></span></button></div>}
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
          </section><section className={`${styles.mobileControls} ${styles.preferenceCard}`} aria-label="Mobile controls"><h3>Mobile controls</h3><button type="button" className={styles.toggle} aria-label="Flip controls" aria-pressed={controlsFlipped} onClick={()=>onControlsFlippedChange(!controlsFlipped)}><span><strong>Flip controls</strong><small>{controlsFlipped?'Move on the right. Map and actions on the left.':'Move on the left. Map and actions on the right.'}</small></span><span className={styles.switch} aria-hidden="true">{controlsFlipped?'On':'Off'}</span></button></section>

          
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
