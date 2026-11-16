'use client';
import {useEffect,useRef,useState} from 'react';
import g from './games.module.css';
/**
 * A silent gameplay loop for /games (Nov 16 2026). The server HTML is only the poster <img> (real size, so nothing shifts) and a
 * Play/Pause button; the <video> element is created on the client, and only when it may play:
 *  - `auto` (the hub's hero): once the poster is on screen, never with prefers-reduced-motion or Save-Data (they keep the poster).
 *  - otherwise: on hover (mouse) or on a tap of the button.
 * It pauses whenever it leaves the screen or the tab is hidden, and only ONE clip on the page plays at a time (starting one
 * pauses the others: AGENTS.md, no simultaneous video players). Muted, playsInline, loop, preload="none"; no sound ever.
 */
const PLAYING=new Set<HTMLVideoElement>();
const quiet=()=>typeof window!=='undefined'&&(matchMedia('(prefers-reduced-motion: reduce)').matches||(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData===true);
export default function LoopClip({name,poster,mp4,webm,w,h,pw,ph,alt,auto=false,priority=false,className}:{name:string;poster:string;mp4:string;webm?:string;w:number;h:number;pw:number;ph:number;alt:string;auto?:boolean;priority?:boolean;className?:string}){
 const box=useRef<HTMLDivElement>(null),vid=useRef<HTMLVideoElement>(null);
 const [want,setWant]=useState(false),[on,setOn]=useState(false),[playing,setPlaying]=useState(false);
 const seen=useRef(false),userPaused=useRef(false);
 useEffect(()=>{const el=box.current;if(!el)return;
  // the hero comes back to life when it scrolls back on screen or the tab returns, unless the reader paused it
  const resume=()=>{if(!auto||quiet()||userPaused.current)return;const v=vid.current;if(!v){setWant(true);return;}if(v.paused){for(const o of PLAYING)if(o!==v)o.pause();v.play().catch(()=>{});}};
  const io=new IntersectionObserver(([e])=>{seen.current=e.isIntersecting;
   if(!e.isIntersecting){vid.current?.pause();return;}
   resume();
  },{threshold:.35});
  io.observe(el);
  const vis=()=>{if(document.hidden)vid.current?.pause();else if(seen.current)resume();};document.addEventListener('visibilitychange',vis);
  return ()=>{io.disconnect();document.removeEventListener('visibilitychange',vis);const v=vid.current;if(v)PLAYING.delete(v);};
 },[auto]);
 useEffect(()=>{if(want)setOn(true);},[want]);
 useEffect(()=>{const v=vid.current;if(!on||!v)return;
  const play=()=>{for(const o of PLAYING)if(o!==v)o.pause();v.play().catch(()=>setPlaying(false));};
  if(seen.current||!auto)play();
 },[on,auto]);
 const toggle=()=>{const v=vid.current;if(!on){setOn(true);return;}if(!v)return;if(v.paused){userPaused.current=false;for(const o of PLAYING)if(o!==v)o.pause();v.play().catch(()=>{});}else{userPaused.current=true;v.pause();}};
 const hover=(enter:boolean)=>{if(auto||!matchMedia('(hover: hover) and (pointer: fine)').matches||quiet())return;if(enter){if(!on)setOn(true);else toggle();}else vid.current?.pause();};
 return <div ref={box} className={`${g.clip}${className?' '+className:''}`} onMouseEnter={()=>hover(true)} onMouseLeave={()=>hover(false)} data-playing={playing||undefined}>
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img src={poster} alt={alt} width={pw} height={ph} loading={priority?'eager':'lazy'} decoding={priority?'sync':'async'}/>
  {on&&<video ref={vid} muted playsInline loop preload="none" width={w} height={h} aria-hidden="true" tabIndex={-1}
   onPlay={e=>{PLAYING.add(e.currentTarget);setPlaying(true);}} onPause={e=>{PLAYING.delete(e.currentTarget);setPlaying(false);}}>
   {/* MP4 first: H.264 is hardware-decoded on phones (cooler) and these MP4s are the smaller files; WebM is the fallback */}
   <source src={mp4} type="video/mp4"/>{webm&&<source src={webm} type="video/webm"/>}
  </video>}
  <button type="button" className={g.clipBtn} onClick={toggle} aria-label={`${playing?'Pause':'Play'} video: ${name}`} aria-pressed={playing}>
   <span aria-hidden="true" className={playing?g.iconPause:g.iconPlay}/>
  </button>
 </div>;
}
