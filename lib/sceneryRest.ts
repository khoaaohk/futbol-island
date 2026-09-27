'use client';
import {useEffect,type RefObject} from 'react';

/** How long decorative looping art keeps moving after it appears or after the last interaction (phone heat). */
export const SCENERY_AWAKE_MS=6000;
/** Window event that wakes resting art without an input event (e.g. spin momentum): window.dispatchEvent(new Event(SCENERY_WAKE_EVENT)). */
export const SCENERY_WAKE_EVENT='fi-scenery-wake';
const WAKE_EVENTS=['pointerdown','pointermove','wheel','keydown','focusin'] as const;
const RELEASE_EVENTS=['pointerup','pointercancel','keyup'] as const;

/**
 * Rest for decorative CSS loops: the art moves for SCENERY_AWAKE_MS after mounting and after any interaction on the page
 * (pointer, wheel, key, focus, or SCENERY_WAKE_EVENT), then freezes on its current frame: `pausedClass` is added to the
 * element (its CSS sets animation-play-state: paused) and data-scenery="rest" (awake: "live"). One timer, no frame loop.
 * `settle(el)` (optional) returns how many ms to wait before freezing, so a loop can rest on a clean frame (0 = now).
 * `hold(event)` (optional, heat pass 3): true for a pointerdown/keydown that starts steady gameplay input (joystick, ride
 * buttons, movement keys). While any such pointer or key is held, the art rests instead of waking (its moves would keep the
 * compositor at display rate over a 30 fps island). Heat pass 4: releasing it does NOT wake the art either. The iPhone timeline showed
 * every gameplay tap's release restarting the loops (8–28 animationstart/s and the 24 px Paths icon repainting 10–25×/s while flying).
 * The art wakes only on other input (menus, HUD buttons, focus) or SCENERY_WAKE_EVENT.
 */
export function useSceneryRest(ref:RefObject<HTMLElement>,pausedClass='paused',settle?:(el:HTMLElement)=>number,hold?:(event:Event)=>boolean){
 useEffect(()=>{const el=ref.current;if(!el)return;let last=performance.now(),timer:ReturnType<typeof setTimeout>|undefined,resting=false;const holds=new Set<string>();
  const rest=()=>{timer=undefined;const idle=performance.now()-last;if(idle<SCENERY_AWAKE_MS){timer=setTimeout(rest,SCENERY_AWAKE_MS-idle);return;}const wait=settle?.(el)??0;if(wait>0){timer=setTimeout(rest,wait);return;}resting=true;el.classList.add(pausedClass);el.dataset.scenery='rest';};
  // Covered: a modal dialog this art is not inside (e.g. "Pick a card" over Paths) holds the input or focus. Its events must not wake
  // art nobody can see; the art rests at once instead (a modal makes the rest of the page inert, so focus and input are in the top one).
  const covered=(event:Event)=>{const node=event.target instanceof Element?event.target:document.activeElement;let top:Element|null=null;
   // Also an in-page modal layer ([role=dialog][aria-modal=true], e.g. the message bottle drawn over Paths inside its <dialog>).
   try{top=node?.closest('dialog:modal,[role=dialog][aria-modal=true]')??null;}catch{top=node?.closest('dialog[open],[role=dialog][aria-modal=true]')??null;}return !!top&&!top.contains(el);};
  // Held gameplay input: rest now (after settle); a settle wait already pending is kept, so moves do not re-query it.
  const hush=()=>{last=-Infinity;if(resting||timer&&holding)return;clearTimeout(timer);timer=undefined;holding=true;rest();};let holding=false;
  const holdId=(event:Event)=>'pointerId' in event?'p'+(event as PointerEvent).pointerId:'key' in event?'k'+String((event as KeyboardEvent).key).toLowerCase():'';
  const wake=(event:Event)=>{if(covered(event)){clearTimeout(timer);timer=undefined;if(!resting){last=-Infinity;rest();}return;}
   if(hold){const id=holdId(event);if((event.type==='pointerdown'||event.type==='keydown')&&id&&hold(event))holds.add(id);if(id&&holds.has(id)){hush();return;}}
   holding=false;last=performance.now();if(resting){resting=false;el.classList.remove(pausedClass);el.dataset.scenery='live';}if(!timer)timer=setTimeout(rest,SCENERY_AWAKE_MS);};
  // A released gameplay pointer/key only ends the hold; the art stays at rest (see the doc comment).
  const release=(event:Event)=>{if(holds.delete(holdId(event))&&!holds.size)holding=false;};
  const drop=()=>{holds.clear();holding=false;};
  for(const type of WAKE_EVENTS)window.addEventListener(type,wake,{capture:true,passive:true});window.addEventListener(SCENERY_WAKE_EVENT,wake);
  if(hold){for(const type of RELEASE_EVENTS)window.addEventListener(type,release,{capture:true,passive:true});window.addEventListener('blur',drop);}
  el.dataset.scenery='live';timer=setTimeout(rest,SCENERY_AWAKE_MS);
  return ()=>{clearTimeout(timer);for(const type of WAKE_EVENTS)window.removeEventListener(type,wake,{capture:true});window.removeEventListener(SCENERY_WAKE_EVENT,wake);if(hold){for(const type of RELEASE_EVENTS)window.removeEventListener(type,release,{capture:true});window.removeEventListener('blur',drop);}el.classList.remove(pausedClass);};
 },[ref,pausedClass,settle,hold]);
}
