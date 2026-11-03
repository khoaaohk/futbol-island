'use client';
import {useEffect} from 'react';

/**
 * "Questions grown-ups ask" open and close with an animation (owner, Nov 3 2026). The server renders plain <details>/<summary> (works with JS
 * off); here a click on a summary is taken over: opening sets [open] then, next frame, data-x (the body grid row goes 0fr -> 1fr and fades in);
 * closing removes data-x, waits for the transition, then removes [open]. Calm mode / reduced motion toggles at once. Runs on click only.
 */
export default function FaqEnhance({selector}:{selector:string}){
 useEffect(()=>{
  const list=document.querySelector(selector);if(!list)return;
  list.setAttribute('data-ready','');
  const calm=()=>!!list.closest('[data-calm]')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const timers=new WeakMap<Element,number>();
  const onClick=(e:Event)=>{
   const sum=(e.target as Element).closest('summary');if(!sum||!list.contains(sum))return;
   const d=sum.parentElement as HTMLDetailsElement;e.preventDefault();
   clearTimeout(timers.get(d));
   if(!d.open){
    d.open=true;
    if(calm()){d.setAttribute('data-x','');return;}
    requestAnimationFrame(()=>requestAnimationFrame(()=>d.setAttribute('data-x','')));
   }else{
    d.removeAttribute('data-x');
    if(calm()){d.open=false;return;}
    timers.set(d,window.setTimeout(()=>{d.open=false;},320));
   }
  };
  list.addEventListener('click',onClick);
  return()=>{list.removeEventListener('click',onClick);list.removeAttribute('data-ready');};
 },[selector]);
 return null;
}
