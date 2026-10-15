'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import styles from './PullToRefresh.module.css';

/** Pull-down-to-refresh for the admin dashboard (touch only). Oct 15 2026.
 *  Reuses the caller's own reload function (`onRefresh`) — this never calls location.reload(), which would risk the
 *  signed-in admin session / the current date-range filter. Resistance 0.5x, capped at MAX_PULL; release past
 *  THRESHOLD to refresh. Transform + opacity only, no rAF loop (state only changes on touch events, never at rest).
 *  preventDefault() is called only once a downward pull from the top of the page is actually under way, so normal
 *  vertical scrolling and the charts'/tables' own horizontal touch scroll (touch-action:pan-y / overflow-x) are
 *  untouched. `overscroll-behavior-y:contain` on the admin page (admin.module.css .page) stops iOS/Chrome's native
 *  pull-to-refresh from firing at the same time as this one. */
const THRESHOLD=64,MAX_PULL=90,RESISTANCE=0.5;

export default function PullToRefresh({onRefresh,loading,updated}:{onRefresh:()=>Promise<void>|void;loading:boolean;updated:number|null}){
 const [distance,setDistance]=useState(0);
 const [dragging,setDragging]=useState(false);
 const [refreshing,setRefreshing]=useState(false);
 const pulling=useRef(false);
 const startY=useRef(0);
 const reduced=useRef(false);

 useEffect(()=>{
  try{reduced.current=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{/* ignore */}
 },[]);

 const reset=useCallback(()=>{pulling.current=false;startY.current=0;setDragging(false);setDistance(0);},[]);

 useEffect(()=>{
  const atTop=()=>(window.scrollY||document.documentElement.scrollTop||0)<=0;

  const onStart=(e:TouchEvent)=>{
   // Only begin from the very top of the page, on a single touch pointer, and never while a fetch is already running.
   if(refreshing||loading||e.touches.length!==1||!atTop())return;
   pulling.current=true;setDragging(true);startY.current=e.touches[0].clientY;
  };

  const onMove=(e:TouchEvent)=>{
   if(!pulling.current)return;
   const raw=e.touches[0].clientY-startY.current;
   if(raw<=0||!atTop()){reset();return;} // not actually pulling down from the top: let the page scroll normally
   e.preventDefault();
   setDistance(Math.min(raw*RESISTANCE,MAX_PULL));
  };

  const onEnd=()=>{
   if(!pulling.current){reset();return;}
   pulling.current=false;setDragging(false);
   setDistance(d=>{
    if(d>=THRESHOLD&&!refreshing&&!loading){
     setRefreshing(true);
     Promise.resolve(onRefresh()).finally(()=>setRefreshing(false));
    }
    return 0;
   });
   startY.current=0;
  };

  // touchmove can't be passive (it conditionally calls preventDefault); the others stay passive.
  window.addEventListener('touchstart',onStart,{passive:true});
  window.addEventListener('touchmove',onMove,{passive:false});
  window.addEventListener('touchend',onEnd,{passive:true});
  window.addEventListener('touchcancel',onEnd,{passive:true});
  return()=>{
   window.removeEventListener('touchstart',onStart);
   window.removeEventListener('touchmove',onMove);
   window.removeEventListener('touchend',onEnd);
   window.removeEventListener('touchcancel',onEnd);
  };
 },[onRefresh,loading,refreshing,reset]);

 const active=refreshing||distance>0;
 // Reduced motion: never translate (no bounce), reveal the spinner by opacity alone.
 const translateY=reduced.current?0:refreshing?0:Math.max(distance-40,-40);
 const opacity=refreshing?1:Math.min(1,distance/40);
 const hhmm=updated!=null?new Date(updated).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hourCycle:'h23'}):null;
 const label=refreshing?'Refreshing…':distance>=THRESHOLD?'Release to refresh':hhmm?`Updated ${hhmm}`:'Pull to refresh';

 return <div className={styles.indicator} data-dragging={dragging} aria-live="polite" aria-hidden={!active}
  style={{transform:`translate(-50%, ${translateY}px)`,opacity}}>
  <span className={`${styles.spinner} ${refreshing?styles.spin:''}`} aria-hidden="true"/>
  <span className={styles.label}>{label}</span>
 </div>;
}
