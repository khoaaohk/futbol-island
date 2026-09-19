'use client';
import {useEffect,useRef,type RefObject} from 'react';
/** One layout read per gesture; viewport/layout changes invalidate it on demand. */
export function useJoystickBounds(element:RefObject<HTMLElement>,enabled:boolean){
 const bounds=useRef<DOMRect|null>(null);
 useEffect(()=>{
  bounds.current=null;if(!enabled)return;
  const invalidate=()=>{bounds.current=null;},observer=new ResizeObserver(invalidate);
  if(element.current)observer.observe(element.current);
  window.addEventListener('resize',invalidate);window.addEventListener('orientationchange',invalidate);window.addEventListener('scroll',invalidate,true);
  window.visualViewport?.addEventListener('resize',invalidate);window.visualViewport?.addEventListener('scroll',invalidate);
  return()=>{observer.disconnect();invalidate();window.removeEventListener('resize',invalidate);window.removeEventListener('orientationchange',invalidate);window.removeEventListener('scroll',invalidate,true);window.visualViewport?.removeEventListener('resize',invalidate);window.visualViewport?.removeEventListener('scroll',invalidate);};
 },[element,enabled]);
 return bounds;
}
