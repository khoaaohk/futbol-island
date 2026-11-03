'use client';
import {useEffect} from 'react';
import {calmWanted,extPlaying,slowLink} from './LearnEnhance';

/**
 * The full-bleed montage's behaviour (Nov 3 2026). Renders nothing; it enhances the server-rendered LearnMontage.
 * Heat budget (AGENTS.md): no scroll listeners, no layout reads, no timers or per-frame work; IntersectionObserver + media events.
 *  - Plays (muted loop, inline) while >= 30 % of it is on screen and the tab is visible; pauses otherwise. It counts toward the
 *    page-wide cap of 2 clips (`data-montage-playing` on the page root, see EXT_PLAYING).
 *  - preload="none" in the HTML; raised to "auto" once the montage is within ~1.5 screens (the <source media> picks one file).
 *  - Save-Data / 2g / 3g: every source but the 854px one is removed before anything loads (those viewers are in calm mode too).
 *  - The button pauses / resumes; a viewer's pause sticks. The progress ring is a CSS animation over the clip's length (--dur,
 *    corrected from the file's own duration once known), paused with the clip; on `playing` / `seeked` (a loop restart) its
 *    currentTime is set to the clip's, so the ring stays in step. The poster crossfades to the clip once it really plays.
 *  - Calm mode (reduced motion, Save-Data, 2g/3g, Battery saver): nothing loads or plays by itself; the poster shows a Play button.
 */
const MAX_PLAYING=2;
const PLAY_AT=.3;
const NEAR='150% 0px 150% 0px';
const ME='data-montage-playing';

export default function MontageEnhance(){
 useEffect(()=>{
  const sec=document.querySelector<HTMLElement>('[data-montage]'),vid=sec?.querySelector<HTMLVideoElement>('video[data-mv]'),btn=sec?.querySelector<HTMLButtonElement>('[data-mv-btn]');
  if(!sec||!vid||!btn)return;
  const v:HTMLVideoElement=vid;
  const page=sec.closest<HTMLElement>('#learn-root')??document.body;
  const media=v.parentElement!,ring=btn.querySelector('[data-ring]');
  const offs:(()=>void)[]=[];
  let calm=calmWanted(),onScreen=false,near=false,userPaused=false,userStarted=false,last=-1;
  sec.setAttribute('data-js','');sec.toggleAttribute('data-calm',calm);
  if(slowLink()){const small=v.querySelector('source[data-size="s"]');
   if(small){v.querySelectorAll('source').forEach(x=>{if(x!==small)x.remove();});small.removeAttribute('media');}}

  const mark=(playing:boolean)=>{media.toggleAttribute('data-playing',playing);btn.toggleAttribute('data-playing',playing);
   btn.setAttribute('aria-label',`${playing?'Pause':'Play'} the island film`);};
  const raise=()=>{if(calm||!near||v.preload==='auto')return;v.preload='auto';if(v.paused&&v.readyState===0&&v.networkState!==2)v.load();};
  function evaluate(){
   const ok=onScreen&&document.visibilityState!=='hidden'&&!userPaused&&(calm?userStarted:true);
   // a tapped Play always plays; by itself the montage only takes a free slot of the page-wide 2
   const want=ok&&(userStarted||extPlaying(page,ME)<MAX_PLAYING);
   if(want){if(v.paused){if(v.preload!=='auto')v.preload='auto';const p=v.play();if(p)p.then(()=>mark(!v.paused),()=>mark(false));else mark(true);}}
   else if(!v.paused||media.hasAttribute('data-playing')){v.pause();mark(false);}
   const n=want?1:0;
   if(n!==last){last=n;page.setAttribute(ME,String(n));page.dispatchEvent(new Event('learn:panel'));}
  }

  const vis=new IntersectionObserver(es=>{for(const e of es)onScreen=e.isIntersecting&&e.intersectionRatio>=PLAY_AT;evaluate();},{threshold:[0,PLAY_AT,.6]});
  vis.observe(media);
  const ahead=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){near=true;raise();ahead.disconnect();}},{rootMargin:NEAR});
  ahead.observe(media);
  const onVis=()=>evaluate();
  document.addEventListener('visibilitychange',onVis);page.addEventListener('learn:panel',onVis);
  offs.push(()=>{vis.disconnect();ahead.disconnect();document.removeEventListener('visibilitychange',onVis);page.removeEventListener('learn:panel',onVis);});

  // ---- the ring: keep the CSS animation in step with the clip (on media events only, never per frame) ---------------------------
  const sync=()=>{if(!ring)return;for(const a of ring.getAnimations())a.currentTime=v.currentTime*1000;};
  const meta=()=>{if(Number.isFinite(v.duration)&&v.duration>0)media.style.setProperty('--dur',`${v.duration}s`);};
  v.addEventListener('playing',sync);v.addEventListener('seeked',sync);v.addEventListener('loadedmetadata',meta);
  offs.push(()=>{v.removeEventListener('playing',sync);v.removeEventListener('seeked',sync);v.removeEventListener('loadedmetadata',meta);});

  const onClick=()=>{
   if(media.hasAttribute('data-playing')){userPaused=true;userStarted=false;}else{userPaused=false;userStarted=true;}
   evaluate();};
  btn.addEventListener('click',onClick);offs.push(()=>btn.removeEventListener('click',onClick));

  try{const mq=matchMedia('(prefers-reduced-motion: reduce)');const on=()=>{calm=calmWanted();sec.toggleAttribute('data-calm',calm);raise();evaluate();};
   mq.addEventListener('change',on);offs.push(()=>mq.removeEventListener('change',on));}catch{}

  return ()=>{offs.forEach(f=>f());if(!v.paused)v.pause();page.removeAttribute(ME);};
 },[]);
 return null;
}
