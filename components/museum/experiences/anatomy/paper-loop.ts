'use client';
import {useEffect,useRef,type RefObject} from 'react';

/**
 * The anatomy Paper play loop (Oct 12 2026; shared by laws-1863, futsal-1989 and wwc-1991, add-only for any other exhibit).
 * The ONE place these exhibits keep a requestAnimationFrame chain, so the exhibit folders stay rAF-free (their tests check it).
 *
 *  - Nothing runs at rest: the chain starts on wake() and stops the moment tick() returns false.
 *  - Parked while the element is off-screen (IntersectionObserver) or the tab is hidden; resumed when it is back.
 *  - Disposed on unmount.
 *  - Reduced motion: wake() runs the tick synchronously to its end (≤ 3000 steps of 1/30 s), so every motion has a static end.
 */
export type PaperLoop={wake():void;stop():void;dispose():void;setVisible(v:boolean):void;readonly running:boolean};

export function createPaperLoop(tick:(dt:number)=>boolean,{reduced=false}:{reduced?:boolean}={}):PaperLoop{
 let id=0,last=0,wanted=false,visible=true,disposed=false,ticking=false,syncing=false,woke=false;
 const raf=typeof requestAnimationFrame==='function'?requestAnimationFrame:null;
 const frame=(now:number)=>{id=0;if(disposed||!visible)return;const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;
  ticking=true;woke=false;let more=false;try{more=tick(dt);}finally{ticking=false;}
  // one chain only: a wake() from inside the tick is folded into this frame's decision
  if((more||woke)&&wanted&&!disposed&&raf)id=raf(frame);else{wanted=false;last=0;}};
 const api:PaperLoop={
  wake(){if(disposed)return;
   if(reduced||!raf){if(syncing)return;syncing=true;try{let n=0;while(n++<3000&&tick(1/30)){/* straight to the end */}}finally{syncing=false;}return;}
   wanted=true;if(ticking){woke=true;return;}if(!id&&visible){last=0;id=raf(frame);}},
  stop(){wanted=false;woke=false;if(id&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(id);id=0;last=0;},
  dispose(){disposed=true;api.stop();},
  setVisible(v:boolean){visible=v;if(!v){if(id&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(id);id=0;last=0;}
   else if(wanted&&!id&&!disposed&&raf)id=raf(frame);},
  get running(){return !!id;},
 };
 return api;
}

/** The loop as a hook: one per mount, parked off-screen and in a hidden tab, disposed on unmount. `tick` may change per render. */
export function usePaperLoop(tick:(dt:number)=>boolean,el:RefObject<Element|null>,reduced:boolean):Pick<PaperLoop,'wake'|'stop'|'running'>{
 const latest=useRef(tick);latest.current=tick;
 const cur=useRef<PaperLoop|null>(null);
 useEffect(()=>{
  const l=createPaperLoop(dt=>latest.current(dt),{reduced});cur.current=l;
  let onScreen=true,io:IntersectionObserver|null=null;
  const vis=()=>l.setVisible(onScreen&&document.visibilityState!=='hidden');
  if(el.current&&typeof IntersectionObserver!=='undefined'){io=new IntersectionObserver(es=>{onScreen=!!es[es.length-1]?.isIntersecting;vis();});io.observe(el.current);}
  document.addEventListener('visibilitychange',vis);
  return()=>{io?.disconnect();document.removeEventListener('visibilitychange',vis);l.dispose();if(cur.current===l)cur.current=null;};
 },[el,reduced]);
 const proxy=useRef({wake:()=>cur.current?.wake(),stop:()=>cur.current?.stop(),get running(){return !!cur.current?.running;}});
 return proxy.current;
}

/**
 * The same loop under the names the other Paper exhibits were written against (Oct 12 2026 consolidation: there is ONE frame-loop
 * implementation, createPaperLoop above; these are thin adapters, not loops of their own).
 *  - useFrames(tick, el): cards-1970, var-2018, backpass-1992 ({wake, stop, running}); no reduced mode (those exhibits go
 *    turn-based themselves).
 *  - useFrameLoop(tick, el, reduced): hall-of-fame, timeline ({wake, stop, running()}); reduced = run to rest at once.
 *  - useRaf(tick, live): telstar-1970, laced-leather (returns wake); `live` (on screen and the tab visible, from useLive) parks it.
 */
export function useFrames(tick:(dt:number)=>boolean,el:RefObject<Element|null>){return usePaperLoop(tick,el,false);}
export function useFrameLoop(tick:(dt:number)=>boolean,el:RefObject<Element|null>,reduced:boolean){
 const l=usePaperLoop(tick,el,reduced);
 const api=useRef({wake:()=>l.wake(),stop:()=>l.stop(),running:()=>l.running});
 return api.current;
}
export function useRaf(tick:(dt:number)=>boolean,live:boolean){
 const latest=useRef(tick);latest.current=tick;
 const cur=useRef<PaperLoop|null>(null),liveRef=useRef(live);liveRef.current=live;
 useEffect(()=>{const l=createPaperLoop(dt=>latest.current(dt));l.setVisible(liveRef.current);cur.current=l;
  return()=>{l.dispose();if(cur.current===l)cur.current=null;};},[]);
 useEffect(()=>{cur.current?.setVisible(live);},[live]);
 const wake=useRef(()=>cur.current?.wake());
 return wake.current;
}
