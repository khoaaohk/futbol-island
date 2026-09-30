'use client';
import {useEffect,useRef,type RefObject} from 'react';

/**
 * Modal focus handling for the Konbini's overlays (code review Sep 29 2026, finding 16), the same pattern as
 * components/PlayerPopUpBook.tsx: focus moves into the dialog on open, Escape closes it wherever focus is, Tab / Shift+Tab stay
 * inside it, and focus returns to what had it before. One capture-phase keydown listener while open; nothing else runs.
 */
const FOCUSABLE='button:not([disabled]),a[href],summary,input:not([disabled]),[tabindex="0"]';
export function useModalFocus(root:RefObject<HTMLElement>,onEscape:()=>void){
 const escape=useRef(onEscape);escape.current=onEscape;
 useEffect(()=>{
  const before=document.activeElement instanceof HTMLElement?document.activeElement:null;
  root.current?.focus({preventScroll:true});
  const key=(e:KeyboardEvent)=>{const el=root.current;if(!el)return;
   if(e.key==='Escape'){e.preventDefault();e.stopPropagation();escape.current();return;}
   if(e.key!=='Tab')return;
   const nodes=Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(n=>n.getClientRects().length>0);if(!nodes.length){e.preventDefault();el.focus();return;}
   const first=nodes[0],last=nodes[nodes.length-1],inside=el.contains(document.activeElement);
   if(e.shiftKey&&(document.activeElement===first||document.activeElement===el||!inside)){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&(document.activeElement===last||!inside)){e.preventDefault();first.focus();}
  };
  document.addEventListener('keydown',key,true);
  return()=>{document.removeEventListener('keydown',key,true);if(before?.isConnected)before.focus({preventScroll:true});};
 },[root]);
}
