'use client';
/**
 * The island HUD stack (docs/ui/HUD_STACK.md): one flex column hanging under the coins bar. Town renders the column and provides
 * it here; HUD pieces that live in other components (the job panel, toasts, the ball-hunt hint, Spot it, welcome-back) portal
 * into it with <HudSlot>. The slot order is CSS `order` on data-hud-slot (globals.css), so nothing measures or repositions
 * anything per frame. Outside the island (no provider) a slot renders in place, as before.
 *
 * Exit animation (Oct 21 2026, user: "when exiting this screen, have it animate out like it animates in"): the slot pieces that
 * animate in (hudStackIn in globals.css) now animate out too. React removes a closed card at once, so on unmount the slot clones
 * its last DOM node, pins the clone where the card was (absolute, so the pieces below do not jump) and plays hudStackOut on it;
 * the clone is inert (no ids, aria-hidden, no pointer events) and removed after the animation. Reduced motion: no clone.
 */
import {createContext,cloneElement,isValidElement,useContext,useId,useLayoutEffect,useRef,type ReactElement,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
export const HudStackContext=createContext<HTMLElement|null>(null);
/** The slot pieces that animate (the same set globals.css gives hudStackIn). */
const ANIMATED='[data-hud-slot="toast"],[data-job-intro],[data-job-done],[data-spot-it],[data-welcome-back]';
export const HUD_EXIT_MS=260;
export default function HudSlot({children}:{children:ReactNode}){
 const host=useContext(HudStackContext),uid=useId(),node=useRef<HTMLElement|null>(null);
 useLayoutEffect(()=>{
  if(!host)return;
  const mine=host.querySelector<HTMLElement>(`[data-hud-uid="${CSS.escape(uid)}"]`);
  node.current=mine;
  return()=>{
   const el=node.current;node.current=null;
   if(!el||!el.matches(ANIMATED))return;
   try{
    if(typeof window==='undefined'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const hr=host.getBoundingClientRect(),r=el.getBoundingClientRect();
    if(!r.width||!r.height)return;
    const clone=el.cloneNode(true) as HTMLElement;
    clone.removeAttribute('data-hud-uid');clone.removeAttribute('id');clone.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
    clone.querySelectorAll('button,a,input,select,textarea,[tabindex]').forEach(n=>{n.setAttribute('tabindex','-1');n.setAttribute('disabled','');});
    clone.setAttribute('aria-hidden','true');clone.setAttribute('data-hud-exit','');clone.removeAttribute('role');
    clone.style.cssText=`position:absolute;top:${r.top-hr.top}px;left:${r.left-hr.left}px;width:${r.width}px;margin:0;pointer-events:none;`;
    host.appendChild(clone);
    window.setTimeout(()=>clone.remove(),HUD_EXIT_MS+80);
   }catch{/* an exit animation is only polish */}
  };
 },[host,uid]);
 if(!host)return <>{children}</>;
 const tagged=isValidElement(children)?cloneElement(children as ReactElement<Record<string,unknown>>,{'data-hud-uid':uid}):children;
 return createPortal(tagged,host);
}
