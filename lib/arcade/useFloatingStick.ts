'use client';
import {useRef,type PointerEvent} from 'react';
import {paintJoystick} from '@/lib/town/joystickFeedback';
import {clampAnchor,stickTravel} from '@/lib/town/floatingStick';
import {shapeStick} from '@/lib/town/walkControl';

/** Floating arcade stick (Oct 27 2026): the same behaviour as Island Strikers' stick (components/LiveArcadeMatch.tsx
 *  stickDown / moveStick / releaseStick), packaged for the other arcade games. A press anywhere in the zone anchors the ring
 *  under the thumb (clamped inside the zone), the knob follows within the ring's travel, the vector goes through Strikers'
 *  dead zone (shapeStick), and on release the ring glides home. onMove gets (x, y) with y down-positive, 0,0 on release. */
export function useFloatingStick(onMove:(x:number,y:number)=>void,enabled:()=>boolean){
 const joy=useRef<HTMLDivElement>(null),id=useRef<number|null>(null),rect=useRef<DOMRect|null>(null),travel=useRef(36),glide=useRef(0),shaped=useRef({x:0,z:0});
 const move=useRef(onMove);move.current=onMove;
 const floatHome=()=>{const el=joy.current;if(!el?.dataset.anchored)return;delete el.dataset.anchored;delete el.dataset.active;clearTimeout(glide.current);
  const calm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;el.style.transition=calm?'none':'translate .32s cubic-bezier(.22,.8,.24,1),opacity .2s ease-out';
  if(!calm)el.dataset.gliding='true';el.style.translate='';glide.current=window.setTimeout(()=>{el.style.transition='';delete el.dataset.gliding;},340);};
 const moveStick=(e:{pointerId:number;clientX:number;clientY:number})=>{if(e.pointerId!==id.current)return;const r=rect.current;if(!r)return;
  const T=travel.current,dx=e.clientX-r.x-r.width/2,dy=e.clientY-r.y-r.height/2,k=Math.min(1,T/Math.max(1,Math.hypot(dx,dy))),px=dx*k,py=dy*k;
  shapeStick(px/T,py/T,shaped.current);paintJoystick(joy.current,px,py,T);move.current(shaped.current.x,shaped.current.z);};
 const release=(e?:{pointerId:number})=>{if(e&&e.pointerId!==id.current)return;const was=id.current!==null;id.current=null;rect.current=null;floatHome();paintJoystick(joy.current,0,0,travel.current);if(was)move.current(0,0);};
 const down=(e:PointerEvent<HTMLDivElement>)=>{const el=joy.current,z=e.currentTarget;if(!enabled()||id.current!==null||!el||e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();
  clearTimeout(glide.current);el.style.transition='none';delete el.dataset.gliding;el.style.translate='';// a glide home may still be running: snap first so the rect below is the true rest spot
  const home=el.getBoundingClientRect(),r=home.width/2,zr=z.getBoundingClientRect(),cs=getComputedStyle(z),pad=(v:string)=>parseFloat(v)||0;
  const a=clampAnchor(e.clientX,e.clientY,{left:zr.left+pad(cs.paddingLeft),top:zr.top+pad(cs.paddingTop),right:zr.right-pad(cs.paddingRight),bottom:zr.bottom-pad(cs.paddingBottom)},r);
  el.style.translate=`${a.x-home.left-r}px ${a.y-home.top-r}px`;el.dataset.anchored='true';el.dataset.active='true';
  rect.current=new DOMRect(a.x-r,a.y-r,r*2,r*2);travel.current=stickTravel(r*2);id.current=e.pointerId;try{z.setPointerCapture(e.pointerId);}catch{}moveStick(e);};
 return {joy,release,zone:{onPointerDown:down,onPointerMove:moveStick,onPointerUp:release,onPointerCancel:release,onLostPointerCapture:release}};
}
