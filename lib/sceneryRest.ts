'use client';
import {useEffect,type RefObject} from 'react';

/** How long decorative looping art keeps moving after it appears or after the last interaction (phone heat). */
export const SCENERY_AWAKE_MS=6000;
/** Window event that wakes resting art without an input event (e.g. spin momentum): window.dispatchEvent(new Event(SCENERY_WAKE_EVENT)). */
export const SCENERY_WAKE_EVENT='fi-scenery-wake';
const WAKE_EVENTS=['pointerdown','pointermove','wheel','keydown','focusin'] as const;

/**
 * Rest for decorative CSS loops: the art moves for SCENERY_AWAKE_MS after mounting and after any interaction on the page
 * (pointer, wheel, key, focus, or SCENERY_WAKE_EVENT), then freezes on its current frame: `pausedClass` is added to the
 * element (its CSS sets animation-play-state: paused) and data-scenery="rest" (awake: "live"). One timer, no frame loop.
 */
export function useSceneryRest(ref:RefObject<HTMLElement>,pausedClass='paused'){
 useEffect(()=>{const el=ref.current;if(!el)return;let last=performance.now(),timer:ReturnType<typeof setTimeout>|undefined,resting=false;
  const rest=()=>{timer=undefined;const idle=performance.now()-last;if(idle<SCENERY_AWAKE_MS){timer=setTimeout(rest,SCENERY_AWAKE_MS-idle);return;}resting=true;el.classList.add(pausedClass);el.dataset.scenery='rest';};
  // Covered: a modal dialog this art is not inside (e.g. "Pick a card" over Paths) holds the input or focus. Its events must not wake
  // art nobody can see; the art rests at once instead (a modal makes the rest of the page inert, so focus and input are in the top one).
  const covered=(event:Event)=>{const node=event.target instanceof Element?event.target:document.activeElement;let top:Element|null=null;
   try{top=node?.closest('dialog:modal')??null;}catch{top=node?.closest('dialog[open]')??null;}return !!top&&!top.contains(el);};
  const wake=(event:Event)=>{if(covered(event)){clearTimeout(timer);timer=undefined;if(!resting){resting=true;el.classList.add(pausedClass);el.dataset.scenery='rest';}return;}
   last=performance.now();if(resting){resting=false;el.classList.remove(pausedClass);el.dataset.scenery='live';}if(!timer)timer=setTimeout(rest,SCENERY_AWAKE_MS);};
  for(const type of WAKE_EVENTS)window.addEventListener(type,wake,{capture:true,passive:true});window.addEventListener(SCENERY_WAKE_EVENT,wake);
  el.dataset.scenery='live';timer=setTimeout(rest,SCENERY_AWAKE_MS);
  return ()=>{clearTimeout(timer);for(const type of WAKE_EVENTS)window.removeEventListener(type,wake,{capture:true});window.removeEventListener(SCENERY_WAKE_EVENT,wake);el.classList.remove(pausedClass);};
 },[ref,pausedClass]);
}
