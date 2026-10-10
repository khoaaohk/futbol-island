'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {CALM_MS,clamp,pointerTarget,settled,springStep,tiltTarget,type Axis} from './motion';
import styles from './Title.module.css';

type OrientationCtor={requestPermission?:()=>Promise<'granted'|'denied'>};

/**
 * The title screen's motion controller (Oct 9 2026). Everything visual is CSS; this only:
 *  - drives the parallax: each [data-depth] layer is moved by a spring towards a target from the pointer (desktop), device tilt
 *    (phones, only after a user gesture; iOS asks through the Tilt button), a horizontal touch drag, or the scroll position;
 *    the frame loop runs only while the spring moves and stops when it settles (0 rAF at rest);
 *  - sets data-calm after CALM_MS without input (the ambient CSS loops pause) and data-hidden while the tab is hidden;
 *  - sets data-moving while the spring runs (will-change only then).
 * prefers-reduced-motion: nothing is attached; the CSS shows the finished, still scene.
 */
export default function TitleScene({children,className}:{children:ReactNode;className?:string}){
 const root=useRef<HTMLElement>(null);
 const [,setTiltOn]=useState(false);
 useEffect(()=>{
  const el=root.current;if(!el)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){el.dataset.calm='';return;}
  // Trick-cast sprite strips: each starts once its strip image has decoded (the still shows until then).
  for(const box of el.querySelectorAll<HTMLElement>('[data-sprite]')){const img=box.querySelector('img');
   if(img)img.decode().then(()=>{box.dataset.ready='';},()=>{});}
  const layers=[...el.querySelectorAll<HTMLElement>('[data-depth]')].map(node=>({node,d:Number(node.dataset.depth)||0}));
  const ax:Axis={x:0,v:0},ay:Axis={x:0,v:0};
  const target={x:0,y:0},base={x:0,y:0};let scrollY=0;
  let raf=0,last=0;
  const paint=()=>{for(const {node,d} of layers)node.style.transform=`translate3d(${(ax.x*d).toFixed(2)}px,${(ay.x*d*.6).toFixed(2)}px,0)`;};
  const frame=(t:number)=>{const dt=last?(t-last)/1000:1/60;last=t;
   const tx=target.x,ty=clamp(target.y+scrollY);
   Object.assign(ax,springStep(ax,tx,dt));Object.assign(ay,springStep(ay,ty,dt));paint();
   if(settled(ax,tx)&&settled(ay,ty)){ax.x=tx;ay.x=ty;ax.v=ay.v=0;paint();raf=0;last=0;delete el.dataset.moving;return;}
   raf=requestAnimationFrame(frame);};
  const kick=()=>{if(raf||document.hidden||'exit' in el.dataset||'launch' in el.dataset)return;el.dataset.moving='';raf=requestAnimationFrame(frame);};
  // Idle calm: one timer, re-armed by input at most once a second.
  let calmTimer:ReturnType<typeof setTimeout>|undefined,lastWake=0;
  const calm=()=>{el.dataset.calm='';stopTilt();};
  const wake=()=>{const now=performance.now();if(now-lastWake<1000&&!('calm' in el.dataset))return;lastWake=now;
   delete el.dataset.calm;clearTimeout(calmTimer);calmTimer=setTimeout(calm,CALM_MS);};
  // The entrance plays first; the calm countdown starts with it.
  calmTimer=setTimeout(calm,CALM_MS+1500);
  // Desktop pointer.
  const fine=matchMedia('(pointer: fine)').matches;
  const onMove=(e:PointerEvent)=>{if(e.pointerType!=='mouse')return;const t=pointerTarget(e.clientX,e.clientY,innerWidth,innerHeight);target.x=-t.x;target.y=-t.y*.7;wake();kick();};
  const onLeave=()=>{target.x=0;target.y=0;kick();};
  // Touch drag (horizontal; vertical stays native scroll).
  let drag:{id:number;x:number}|null=null;
  const onDown=(e:PointerEvent)=>{wake();if(e.pointerType==='mouse')return;drag={id:e.pointerId,x:e.clientX};armTilt();};
  const onDrag=(e:PointerEvent)=>{if(!drag||e.pointerId!==drag.id||tilting)return;target.x=clamp((e.clientX-drag.x)/160);kick();};
  const onUp=(e:PointerEvent)=>{if(!drag||e.pointerId!==drag.id)return;drag=null;if(!tilting){target.x=0;kick();}};
  // Scroll: a gentle vertical drift as the page moves to the footer.
  const onScroll=()=>{scrollY=clamp(window.scrollY/(innerHeight*.9))*.8;wake();kick();};
  // Device tilt, only after a gesture: Android starts on the first touch; iOS through the Tilt button (permission).
  let tilting=false,armed=false,g0=NaN,b0=NaN;
  const onTilt=(e:DeviceOrientationEvent)=>{if(e.gamma==null||e.beta==null)return;if(Number.isNaN(g0)){g0=e.gamma;b0=e.beta;}
   const next=tiltTarget(e.gamma,e.beta,g0,b0,base);if(next===base)return;base.x=next.x;base.y=next.y;target.x=-base.x;target.y=-base.y*.7;wake();kick();};
  const startTilt=()=>{if(tilting)return;tilting=true;g0=b0=NaN;window.addEventListener('deviceorientation',onTilt);setTiltOn(true);};
  function stopTilt(){if(!tilting)return;tilting=false;window.removeEventListener('deviceorientation',onTilt);armed=false;setTiltOn(false);}
  const Orientation=(window as unknown as {DeviceOrientationEvent?:OrientationCtor}).DeviceOrientationEvent;
  const needsPermission=!!Orientation&&typeof Orientation.requestPermission==='function';
  function armTilt(){if(armed||fine||!Orientation)return;armed=true;if(!needsPermission)startTilt();}
  const onVisibility=()=>{if(document.hidden){el.dataset.hidden='';cancelAnimationFrame(raf);raf=0;last=0;}else{delete el.dataset.hidden;kick();}};
  if(fine){window.addEventListener('pointermove',onMove,{passive:true});document.documentElement.addEventListener('pointerleave',onLeave);}
  el.addEventListener('pointerdown',onDown,{passive:true});window.addEventListener('pointermove',onDrag,{passive:true});
  window.addEventListener('pointerup',onUp,{passive:true});window.addEventListener('pointercancel',onUp,{passive:true});
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('keydown',wake);
  document.addEventListener('visibilitychange',onVisibility);
  return()=>{cancelAnimationFrame(raf);clearTimeout(calmTimer);stopTilt();
   window.removeEventListener('pointermove',onMove);document.documentElement.removeEventListener('pointerleave',onLeave);
   el.removeEventListener('pointerdown',onDown);window.removeEventListener('pointermove',onDrag);
   window.removeEventListener('pointerup',onUp);window.removeEventListener('pointercancel',onUp);
   window.removeEventListener('scroll',onScroll);window.removeEventListener('keydown',wake);document.removeEventListener('visibilitychange',onVisibility);};
 },[]);
 return <section ref={root} className={className} data-title-scene>
  {children}
  {/* The Tilt button (iOS motion permission) was removed (user, Oct 9 2026); tilt still starts on a touch where no permission is needed. */}
 </section>;
}
