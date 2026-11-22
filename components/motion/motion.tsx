'use client';
/**
 * One motion language for the coach app (/coach) and the Scan Trainer (/scan), Nov 22 2026 (owner: "more delightful transitions
 * from one screen to the next. Fade. Add animations."). CSS lives in ./motion.css (global: view-transition pseudo-elements cannot
 * live in a CSS module). No libraries: the View Transitions API where the browser has it, a CSS entrance otherwise.
 * Heat (AGENTS.md): every move is a one-shot of 120-350 ms on transform/opacity; nothing loops, nothing runs while hidden.
 * Reduced motion: no travel at all; screens swap instantly, sheets appear without sliding, numbers jump straight to their value.
 */
import {useCallback,useEffect,useRef,useState} from 'react';
import {flushSync} from 'react-dom';

export type Dir='forward'|'back'|'tab'|'fade';
type VTDoc=Document&{startViewTransition?:(cb:()=>void)=>{finished:Promise<void>}};

export const reducedMotion=()=>{try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{return false;}};
export const hasViewTransitions=()=>typeof document!=='undefined'&&typeof (document as VTDoc).startViewTransition==='function';

/**
 * Run a React state change as a screen transition. With the API: html[data-vt=<dir>] picks the keyframes in motion.css while the
 * transition runs; flushSync makes React paint the new screen inside the callback. Without it (or hidden tab, reduced motion):
 * the change happens at once and the caller's keyed screen wrapper plays the CSS entrance (data-enter).
 */
export function screenChange(dir:Dir,change:()=>void,after?:()=>void){
 const d=document as VTDoc,run=()=>{flushSync(change);after?.();};
 if(!hasViewTransitions()||reducedMotion()||document.visibilityState!=='visible'){run();return;}
 const root=document.documentElement;root.dataset.vt=dir;
 try{const t=d.startViewTransition!(run);
  t.finished.finally(()=>{if(root.dataset.vt===dir)delete root.dataset.vt;});
 }catch{delete root.dataset.vt;run();}
}

/** A bottom sheet that slides away before it unmounts: `value` keeps it in the DOM while `closing` plays the exit (240 ms, the CSS
 *  animation's length; a timeout rather than animationend so a skipped animation, e.g. a hidden tab, still closes it). */
export function useSheet<T>(initial:T|null=null){
 const [value,setValue]=useState<T|null>(initial),[closing,setClosing]=useState(false),timer=useRef<number>(0);
 useEffect(()=>()=>window.clearTimeout(timer.current),[]);
 const open=useCallback((v:T)=>{window.clearTimeout(timer.current);setClosing(false);setValue(v);},[]);
 const close=useCallback(()=>{/* reduced motion: the CSS fades instead of sliding, same length */
  setClosing(true);window.clearTimeout(timer.current);timer.current=window.setTimeout(()=>{setValue(null);setClosing(false);},240);},[]);
 return {value,closing,open,close};
}

/**
 * Swipe down to close, on the sheet's head (the grab bar and title): the panel follows the finger and lets go past 72 px or a flick.
 * Spread the returned handlers on the head element; pass the panel's ref so it can be moved.
 */
export function useSwipeDown(panel:React.RefObject<HTMLElement>,onClose:()=>void){
 const g=useRef<{y:number;t:number;dy:number}|null>(null);
 const set=(dy:number,anim:boolean)=>{const el=panel.current;if(!el)return;el.style.transition=anim?'transform 200ms cubic-bezier(.22,1,.36,1)':'none';el.style.transform=dy?`translateY(${dy}px)`:'';};
 return {
  onPointerDown:(e:React.PointerEvent<HTMLElement>)=>{if((e.target as HTMLElement).closest('button,a,input,select'))return;g.current={y:e.clientY,t:performance.now(),dy:0};try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* fine */}},
  onPointerMove:(e:React.PointerEvent<HTMLElement>)=>{const s=g.current;if(!s)return;s.dy=Math.max(0,e.clientY-s.y);set(s.dy,false);},
  onPointerUp:()=>{const s=g.current;g.current=null;if(!s)return;const v=s.dy/Math.max(1,performance.now()-s.t);
   if(s.dy>72||(s.dy>24&&v>.6)){const el=panel.current;if(el){el.style.transition='';el.style.transform='';}onClose();}else set(0,true);},
  onPointerCancel:()=>{g.current=null;set(0,true);},
  style:{touchAction:'none' as const},
 };
}

/** A number that ticks to its new value (about 320 ms, ease-out) when it changes; the first value shows at once. */
export function useCountUp(value:number,ms=320,from?:number){
 const [shown,setShown]=useState(from??value),prev=useRef(from??value);
 useEffect(()=>{const a=prev.current,b=value;prev.current=b;
  if(a===b||reducedMotion()||document.visibilityState!=='visible'){setShown(b);return;}
  let raf=0;const t0=performance.now();
  const step=(t:number)=>{const k=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-k,3);setShown(Math.round(a+(b-a)*e));if(k<1)raf=requestAnimationFrame(step);};
  raf=requestAnimationFrame(step);return ()=>{cancelAnimationFrame(raf);setShown(b);};
 },[value,ms]);
 return shown;
}
/** The same, as an element; `pop` adds a short scale tick each time the value changes. */
export function Tick({value,ms,from}:{value:number;ms?:number;from?:number}){
 const n=useCountUp(value,ms,from),first=useRef(true),[k,setK]=useState(0);
 useEffect(()=>{if(first.current){first.current=false;return;}setK(x=>x+1);},[value]);
 return <span className="fi-tick" key={k} data-tick={k>0?'':undefined}>{n}</span>;
}

/** Once per browser session (Home's tile entrance): true the first time this key is asked for. */
const once=new Map<string,boolean>();
export function useOncePerSession(key:string){
 const [first]=useState(()=>{if(typeof window==='undefined')return false;const hit=once.get(key);if(hit!==undefined)return hit;let v=false;
  try{v=!window.sessionStorage.getItem(key);window.sessionStorage.setItem(key,'1');}catch{v=false;}once.set(key,v);
  /* the answer holds for this page load (Strict Mode asks twice), then later mounts get false */
  window.setTimeout(()=>once.set(key,false),1000);return v;});
 return first&&!(typeof window!=='undefined'&&reducedMotion());
}

/* ---- one navigation across the coach apps (/coach, /scan, /board; owner Nov 22 2026) ----
   Left: back to the coach app's Home when this app was opened from it (?from=coach, remembered for the tab's session so a
   deep link from search still stands alone). Right: Exit, back to the page on the site the coach came from, else the tools hub. */
const FROM_KEY='fi-from-coach',ENTRY_KEY='fi-apps-entry',APPS=/^\/(es\/)?(coach|scan|board)(\/|$)/;
/** Call once on load in each app: remembers where on the site the coach came from and whether the coach app opened this one. */
export function noteAppEntry(app:'coach'|'scan'|'board'){
 try{const ss=window.sessionStorage;
  if(document.referrer){const r=new URL(document.referrer);if(r.origin===location.origin&&!APPS.test(r.pathname))ss.setItem(ENTRY_KEY,r.pathname+r.search);}
  if(app==='coach')ss.setItem(FROM_KEY,'1');
  else if(new URLSearchParams(location.search).get('from')==='coach')ss.setItem(FROM_KEY,'1');
  else if(!document.referrer||!APPS.test(new URL(document.referrer).pathname))ss.removeItem(FROM_KEY);
 }catch{/* storage blocked: Exit falls back to the tools hub */}
}
export const openedFromCoach=()=>{try{return new URLSearchParams(location.search).get('from')==='coach'||window.sessionStorage.getItem(FROM_KEY)==='1';}catch{return false;}};
export const exitHref=(lang:'en'|'es')=>{try{const e=window.sessionStorage.getItem(ENTRY_KEY);if(e)return e;}catch{/* none */}return lang==='es'?'/es/tools':'/tools';};
export const coachHref=(lang:'en'|'es')=>lang==='es'?'/coach?lang=es':'/coach';
