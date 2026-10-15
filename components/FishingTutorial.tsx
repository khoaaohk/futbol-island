'use client';
/**
 * The first-time fishing tutorial (Oct 15 2026, docs/fishing-research.md A3): on this device's first fishing session a small
 * card walks through the beats one at a time (aim, watch the shadow, wait through the nibbles, NOW on the bite, then reel),
 * with a dotted "ghost hand" showing the gesture. It ends on the first catch (or Skip) and is remembered per device
 * (fi2-fish-tutorial-v1, a DEVICE key in lib/saves/snapshot.ts). DOM + one-shot / short CSS animations only; no timers.
 * The reel step offers the Easy reel option (tap instead of the tension fight).
 */
import type {SessionPhase} from '@/lib/town/fishing/fishingCore';
import styles from './FishingHost.module.css';

export type TutorialStep='aim'|'watch'|'wait'|'now'|'reel'|'miss'|'done';
export function tutorialStep(phase:SessionPhase):TutorialStep{
 switch(phase){
  case 'ready':return 'aim';
  case 'casting':case 'floating':case 'approach':return 'watch';
  case 'nibble':return 'wait';
  case 'bite':return 'now';
  case 'reeling':return 'reel';
  case 'scared':case 'escaped':return 'miss';
  default:return 'done';
 }
}
const NUM:Record<TutorialStep,string>={aim:'1/4',watch:'2/4',wait:'3/4',now:'3/4',reel:'4/4',miss:'',done:''};
export const TUTORIAL_TEXT:Record<TutorialStep,string>={
 aim:'Drag on the water to aim, then let go to cast.',
 watch:'Watch the water for a fish shadow.',
 wait:'Wait… wait… a nibble is just a feint!',
 now:'NOW! Tap Hook!',
 reel:'Hold Reel to wind in. When it runs, swipe the other way!',
 miss:'Oops! Another fish will come. Wait for the big splash.',
 done:'You did it! Easy reel can be turned on or off any time.',
};
export const EASY_REEL_TEXT='Tap Reel again and again!';

/** The card under the status message. `ghost` hands for the water (aim) are drawn here; the button hands live in the Reel button. */
export function FishingTutorial({phase,easyReel,onEasyReel,onDone}:{phase:SessionPhase;easyReel:boolean;onEasyReel:(on:boolean)=>void;onDone:()=>void}){
 const step=tutorialStep(phase),text=step==='reel'&&easyReel?EASY_REEL_TEXT:TUTORIAL_TEXT[step];
 return <>
  <div className={styles.tutorial} data-fish-tutorial data-step={step} role="status">
   {NUM[step]&&<span className={styles.tutorialNum}>{NUM[step]}</span>}
   <p>{text}</p>
   {step==='reel'&&<button type="button" className={styles.tutorialEasy} role="switch" aria-checked={easyReel} onClick={()=>onEasyReel(!easyReel)}>{easyReel?'Easy reel is on':'Too tricky? Easy reel'}</button>}
   <button type="button" className={styles.tutorialSkip} data-fish-tutorial-done onClick={onDone}>{step==='done'?'Got it':'Skip'}</button>
  </div>
  {step==='aim'&&<span className={styles.ghostWater} aria-hidden="true"><GhostHand/></span>}
 </>;
}
/** The dotted ghost hand (a pointing finger), drawn in currentColor. */
export function GhostHand(){
 return <svg width="44" height="52" viewBox="0 0 44 52" aria-hidden="true" focusable="false"><path d="M15 4c2.2 0 4 1.8 4 4v15l2-.4V18c0-2 1.6-3.5 3.5-3.5S28 16 28 18v5.4l1.6-.2c.4-1.7 1.9-2.9 3.6-2.9 2 0 3.7 1.7 3.7 3.7v2.2c1.9.2 3.4 1.8 3.4 3.8V38c0 6.6-5.4 12-12 12h-4.8c-4.2 0-8-2.3-10.1-6L4.2 34.8c-1-1.8-.4-4.1 1.4-5.1 1.6-.9 3.6-.5 4.8.9L11 32V8c0-2.2 1.8-4 4-4z" fill="#fffdf4" stroke="#244d40" strokeWidth="2.4" strokeDasharray="4 3" strokeLinejoin="round"/></svg>;
}
