'use client';
import {useEffect,useRef,useState} from 'react';
/**
 * Modern gallery hooks (Oct 10 2026). Additive shared piece.
 * - useReduced: prefers-reduced-motion, live.
 * - useSeen: marks an element `data-in` the first time it is ~30% on screen (one IntersectionObserver, released at once), so the
 *   shared `.draw` hairlines draw on and reveals run once. Reduced motion / no IO: in at once.
 */
export function useReduced(){
 const [r,setR]=useState(false);
 useEffect(()=>{if(typeof matchMedia!=='function')return;const q=matchMedia('(prefers-reduced-motion: reduce)');setR(q.matches);const on=()=>setR(q.matches);q.addEventListener('change',on);return()=>q.removeEventListener('change',on);},[]);
 return r;
}
export function useSeen<T extends Element>(threshold=.3){
 const ref=useRef<T>(null),[seen,setSeen]=useState(false);
 useEffect(()=>{const el=ref.current;if(!el)return;
  if(typeof IntersectionObserver==='undefined'||(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)){setSeen(true);return;}
  const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){setSeen(true);io.disconnect();}},{threshold});io.observe(el);return()=>io.disconnect();},[threshold]);
 return [ref,seen] as const;
}
