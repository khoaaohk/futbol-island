'use client';
import {useCallback,useEffect,useRef,useState,type KeyboardEvent as ReactKeyboardEvent,type PointerEvent as ReactPointerEvent} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import {SPRING,coastStep,rubber,settled,springStep} from './motion';
import styles from './Experience.module.css';

/**
 * cards-1970 · the scrubbable replay clock (Oct 9 2026 motion pass). One requestAnimationFrame loop drives four modes:
 *  - play:   the replay runs (broadcast bullet time around the key moment on the first watch), then stops at the end;
 *  - coast:  after a flick the playhead keeps its release velocity and slows with friction;
 *  - spring: the playhead springs to a time (a tap on the film, a key press, the verdict) or rubber-bands back to an end;
 *  - idle:   NO loop. While a finger drags, the pointer events move the playhead directly, so nothing runs in between.
 * The loop stops as soon as the mode is idle, pauses while the tab is hidden and is cancelled on unmount (frames at rest: 0).
 * Reduced motion: no playback, no coast and no springs; time jumps straight to where the visitor puts it.
 */
type Mode='idle'|'play'|'coast'|'spring';
/** Broadcast bullet time: the clock runs at 45% around the key moment on the first watch. */
export const timeScale=(e:number,m:number)=>1-.55*Math.exp(-(((e-m)/.24)**2));
const BAND=.35;// how far (seconds) the playhead may stretch past an end

export function useClip({duration,moment,whistle,reduced,onEnd}:{duration:number;moment:number;whistle?:number;reduced:boolean;onEnd:()=>void}){
 const [raw,setRaw]=useState(reduced?moment:0);
 const s=useRef({x:reduced?moment:0,v:0,mode:'idle' as Mode,target:0,rate:1,whistled:false,last:0,raf:0});
 const end=useRef(onEnd);end.current=onEnd;
 const [playing,setPlaying]=useState(false);
 const tick=useCallback((now:number)=>{
  const st=s.current;st.raf=0;const dt=st.last?Math.min(.05,(now-st.last)/1000):1/60;st.last=now;
  if(st.mode==='play'){
   st.x+=dt*st.rate*(st.rate<1?1:timeScale(st.x,moment));
   if(whistle!=null&&!st.whistled&&st.x>=whistle){st.whistled=true;museumSfx.whistle();}
   if(st.x>=duration){st.x=duration;st.mode='idle';setPlaying(false);end.current();}
  }else if(st.mode==='coast'){
   [st.x,st.v]=coastStep(st.x,st.v,dt);
   if(st.x<0||st.x>duration){st.mode='spring';st.target=st.x<0?0:duration;}
   else if(Math.abs(st.v)<.04){st.v=0;st.mode='idle';}
  }else if(st.mode==='spring'){
   [st.x,st.v]=springStep(st.x,st.v,st.target,st.x<0||st.x>duration?SPRING.band:SPRING.snap,dt);
   if(settled(st.x,st.v,st.target)){st.x=st.target;st.v=0;st.mode='idle';}
  }
  setRaw(st.x);
  if(st.mode!=='idle'&&!document.hidden)st.raf=requestAnimationFrame(tick);// sleeps when idle
 },[duration,moment,whistle]);
 const wake=useCallback(()=>{const st=s.current;if(st.raf||st.mode==='idle'||document.hidden)return;st.last=0;st.raf=requestAnimationFrame(tick);},[tick]);
 useEffect(()=>{
  const vis=()=>{const st=s.current;if(document.hidden){cancelAnimationFrame(st.raf);st.raf=0;}else wake();};
  document.addEventListener('visibilitychange',vis);
  return ()=>{cancelAnimationFrame(s.current.raf);s.current.raf=0;document.removeEventListener('visibilitychange',vis);};
 },[wake]);
 const halt=useCallback(()=>{const st=s.current;cancelAnimationFrame(st.raf);st.raf=0;st.mode='idle';st.v=0;setPlaying(false);},[]);
 /** Play from the start (a fresh replay; slow = half speed, no bullet time). Reduced motion: the key still, then done. */
 const play=useCallback((rate=1)=>{const st=s.current;halt();
  if(reduced){st.x=moment;setRaw(moment);end.current();return;}
  st.x=0;st.rate=rate;st.whistled=false;st.mode='play';setPlaying(true);setRaw(0);wake();},[halt,reduced,moment,wake]);
 /** Spring the playhead to a time (keeps the current velocity, so it is interruptible mid-flight). */
 const springTo=useCallback((t:number)=>{const st=s.current;const target=Math.max(0,Math.min(duration,t));
  if(st.mode==='play')setPlaying(false);
  if(reduced){halt();st.x=target;setRaw(target);return;}
  st.mode='spring';st.target=target;wake();},[duration,reduced,halt,wake]);
 /** Direct manipulation: `to` is where the finger says (may be past an end: shown rubber-banded). */
 const dragTo=useCallback((to:number)=>{const st=s.current;
  if(st.mode!=='idle')halt();
  const x=to<0?-rubber(-to,BAND):to>duration?duration+rubber(to-duration,BAND):to;st.x=x;setRaw(x);},[duration,halt]);
 /** Let go with a velocity (seconds per second): coast, then settle; past an end, rubber-band back. */
 const release=useCallback((v:number)=>{const st=s.current;
  if(reduced){st.x=Math.max(0,Math.min(duration,st.x));st.v=0;setRaw(st.x);return;}
  st.v=Math.max(-6,Math.min(6,v));
  if(st.x<0||st.x>duration){st.mode='spring';st.target=st.x<0?0:duration;}
  else if(Math.abs(st.v)>.15)st.mode='coast';else{st.v=0;return;}
  wake();},[duration,reduced,wake]);
 /** Step by `d` seconds from where the playhead is heading (so fast key repeats add up while it springs). */
 const nudge=useCallback((d:number)=>{const st=s.current;springTo((st.mode==='spring'?st.target:Math.max(0,Math.min(duration,st.x)))+d);},[springTo,duration]);
 const t=Math.max(0,Math.min(duration,raw));
 return {t,raw,playing,play,springTo,nudge,dragTo,release,halt,get mode(){return s.current.mode;}};
}
export type Clip=ReturnType<typeof useClip>;

/** Pointer tracking for a drag that maps pixels to seconds; reports a smoothed velocity on release. */
export function useScrubDrag(clip:Clip,secondsPerPx:()=>number,onStart?:()=>void){
 const d=useRef<{id:number;x0:number;t0:number;lx:number;lt:number;v:number;moved:boolean}|null>(null);
 const down=(e:ReactPointerEvent<Element>,startAt?:number)=>{
  if(e.button!==0&&e.pointerType==='mouse')return;
  onStart?.();
  const t0=startAt??clip.raw;
  if(startAt!=null)clip.dragTo(startAt);
  d.current={id:e.pointerId,x0:e.clientX,t0,lx:e.clientX,lt:performance.now(),v:0,moved:false};
  (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
 };
 const move=(e:ReactPointerEvent<Element>)=>{const g=d.current;if(!g||g.id!==e.pointerId)return;
  const now=performance.now(),k=secondsPerPx(),dx=e.clientX-g.x0;if(Math.abs(dx)>3)g.moved=true;
  const inst=(e.clientX-g.lx)*k/Math.max(.008,(now-g.lt)/1000);g.v=g.v*.6+inst*.4;g.lx=e.clientX;g.lt=now;
  clip.dragTo(g.t0+dx*k);};
 const up=(e:ReactPointerEvent<Element>)=>{const g=d.current;if(!g||g.id!==e.pointerId)return;d.current=null;
  const idle=performance.now()-g.lt>90;clip.release(idle?0:g.v);return g.moved;};
 return {down,move,up};
}

/**
 * The film strip under the replay: a row of frame ticks, the playhead, and (after a miss) a glow where the moment is.
 * Drag the playhead or the strip (with momentum), tap to jump (spring), or use the arrow keys (role="slider").
 */
export function Scrubber({clip,duration,zone,disabled,label,onUserMove}:{clip:Clip;duration:number;zone:[number,number]|null;disabled?:boolean;label:string;onUserMove?:()=>void}){
 const track=useRef<HTMLDivElement>(null);
 const toT=(clientX:number)=>{const r=track.current!.getBoundingClientRect();return (clientX-r.left)/r.width*duration;};
 const drag=useScrubDrag(clip,()=>duration/(track.current?.getBoundingClientRect().width||300),onUserMove);
 const lastTick=useRef(-1);
 // A soft film-gate click every 0.1 s of film that passes under the playhead (sound only while it moves).
 useEffect(()=>{const f=Math.floor(clip.t*10);if(lastTick.current>=0&&f!==lastTick.current&&!clip.playing)museumSfx.tick();lastTick.current=f;},[clip.t,clip.playing]);
 const key=(e:ReactKeyboardEvent)=>{
  const big=e.shiftKey?.5:.1;let d:number|null=null,to:number|null=null;
  if(e.key==='ArrowRight'||e.key==='ArrowUp')d=big;else if(e.key==='ArrowLeft'||e.key==='ArrowDown')d=-big;
  else if(e.key==='PageUp')d=.5;else if(e.key==='PageDown')d=-.5;else if(e.key==='Home')to=0;else if(e.key==='End')to=duration;
  if(d==null&&to==null)return;e.preventDefault();e.stopPropagation();onUserMove?.();if(d!=null)clip.nudge(d);else clip.springTo(to!);};
 const p=clip.raw/duration;
 return <div className={styles.scrub} data-disabled={disabled||undefined}>
  <div ref={track} className={styles.film} role="slider" tabIndex={disabled?-1:0} aria-label={label} aria-disabled={disabled||undefined}
   aria-valuemin={0} aria-valuemax={Number(duration.toFixed(2))} aria-valuenow={Number(clip.t.toFixed(2))} aria-valuetext={`${clip.t.toFixed(1)} seconds of ${duration.toFixed(1)}`}
   onKeyDown={disabled?undefined:key}
   onPointerDown={disabled?undefined:e=>drag.down(e,toT(e.clientX))} onPointerMove={drag.move} onPointerUp={drag.up} onPointerCancel={drag.up}>
   <span className={styles.frames} aria-hidden="true"/>
   {zone&&<span className={styles.zone} aria-hidden="true" style={{left:`${zone[0]/duration*100}%`,width:`${(zone[1]-zone[0])/duration*100}%`}}/>}
   <span className={styles.fill} aria-hidden="true" style={{transform:`scaleX(${Math.max(0,Math.min(1,p)).toFixed(4)})`}}/>
   <span className={styles.head} aria-hidden="true" style={{left:`${(p*100).toFixed(3)}%`}} data-playing={clip.playing||undefined}><i/></span>
  </div>
 </div>;
}
