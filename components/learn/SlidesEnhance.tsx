'use client';
import {useEffect} from 'react';
import {calmWanted,extPlaying} from './LearnEnhance';

/**
 * The "Even more to explore" slideshow's behaviour (Nov 3 2026). Renders nothing; it enhances the server-rendered LearnSlides.
 * Heat budget (AGENTS.md): no scroll listeners, no layout reads while scrolling, no timers driving motion; IntersectionObserver
 * for everything; transform / opacity only (CSS). One clip at most, counted in the page-wide cap of 2 (`data-slides-playing`).
 *  - Active slide = the one crossing a 2px strip in the middle of the row (an IntersectionObserver whose root is the row; the strip
 *    is measured at start and on resize only). It gets `data-active` (neighbours dim to .55 and scale to .94 in CSS) and its dot
 *    `aria-current` (the dot stretches into a bar).
 *  - Auto-advance: the active dot's bar fills over 6 s as a CSS transform animation, which only runs while the section carries
 *    `data-run` (>= 50 % of it on screen, tab visible, not paused, not hovered with a mouse, no keyboard focus inside, not calm);
 *    its `animationend` moves to the next slide (last -> first). No setInterval: a paused / off-screen slideshow does nothing.
 *  - Moving: native swipe / trackpad scroll + CSS snap; dots, Left / Right / Home / End on the focused row, and auto-advance call
 *    row.scroll({left, behavior}) (smooth, instant in calm / reduced motion), with offsets read on that click / key / step only.
 *  - Clips: only the active slide's clip plays (muted loop) while >= 30 % of the section is on screen; neighbours show posters.
 *    preload="none" until the section is within ~1.5 screens, then the active and the next clip get "auto". The pause button stops
 *    both the clip and the auto-advance until pressed again.
 *  - Calm mode (reduced motion, Save-Data, 2g/3g, Battery saver): no auto-advance, nothing preloads or plays by itself; every slide
 *    shows a Play button that plays only that slide.
 */
const MAX_PLAYING=2;
const PLAY_AT=.3;
const RUN_AT=.5;
const NEAR='150% 0px 150% 0px';
const ME='data-slides-playing';

export default function SlidesEnhance(){
 useEffect(()=>{
  const sec=document.querySelector<HTMLElement>('[data-slides]'),row=sec?.querySelector<HTMLElement>('[data-slide-row]');
  if(!sec||!row)return;
  const page=sec.closest<HTMLElement>('#learn-root')??document.body;
  const cards=[...row.querySelectorAll<HTMLElement>('[data-slide]')];
  const vids=cards.map(c=>c.querySelector<HTMLVideoElement>('video[data-sv]'));
  const dots=[...sec.querySelectorAll<HTMLButtonElement>('[data-dot]')];
  const toggle=sec.querySelector<HTMLButtonElement>('[data-slides-toggle]');
  const n=cards.length,offs:(()=>void)[]=[];
  let calm=calmWanted(),active=0,seen=0,near=false,paused=false,hover=false,focus=false,target=-1,started=-1,last=-1,tgtTimer=0;
  sec.setAttribute('data-js','');
  sec.toggleAttribute('data-calm',calm);

  const mark=(i:number,playing:boolean)=>{const v=vids[i];if(!v)return;const m=v.parentElement!,b=m.querySelector<HTMLButtonElement>('[data-sv-btn]');
   m.toggleAttribute('data-playing',playing);
   if(b){b.toggleAttribute('data-playing',playing);b.setAttribute('aria-label',`${playing?'Pause':'Play'} the clip: ${b.dataset.label??''}`);}};
  const raise=(i:number)=>{const v=vids[i];if(!v||calm||!near)return;
   if(v.preload!=='auto'){v.preload='auto';if(v.paused&&v.readyState===0&&v.networkState!==2)v.load();}};
  function evaluate(){
   const hidden=document.visibilityState==='hidden';
   sec!.toggleAttribute('data-run',n>1&&!calm&&!paused&&!hover&&!focus&&!hidden&&seen>=RUN_AT);
   const ok=!hidden&&seen>=PLAY_AT&&target<0;
   let want=!ok?-1:calm?started:paused?-1:active;
   // by itself a slide only takes a free slot of the page-wide 2; a tapped one (calm) always plays
   if(want>=0&&!calm&&extPlaying(page,ME)>=MAX_PLAYING)want=-1;
   vids.forEach((v,i)=>{if(!v)return;
    if(i===want){if(v.paused){if(v.preload!=='auto')v.preload='auto';const p=v.play();if(p)p.then(()=>mark(i,!v.paused),()=>mark(i,false));else mark(i,true);}}
    else if(!v.paused||v.parentElement!.hasAttribute('data-playing')){v.pause();mark(i,false);}});
   const c=want>=0&&vids[want]?1:0;
   if(c!==last){last=c;page.setAttribute(ME,String(c));page.dispatchEvent(new Event('learn:panel'));}
  }
  const setActive=(i:number)=>{
   if(i===target){target=-1;clearTimeout(tgtTimer);}
   if(i!==active||!cards[i].hasAttribute('data-active')){
    cards[active]?.removeAttribute('data-active');dots[active]?.removeAttribute('aria-current');
    active=i;cards[i].setAttribute('data-active','');dots[i]?.setAttribute('aria-current','true');
    raise(i);raise((i+1)%n);}
   evaluate();};

  // ---- active slide: a 2px strip in the middle of the row, measured at start and on resize only ------------------------------
  let io:IntersectionObserver|null=null;
  const build=()=>{io?.disconnect();
   const half=Math.max(0,Math.floor(row.clientWidth/2)-1);
   io=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){setActive(cards.indexOf(e.target as HTMLElement));break;}},
    {root:row,rootMargin:`0px ${-half}px 0px ${-half}px`,threshold:0});
   cards.forEach(c=>io!.observe(c));};
  build();
  let rz=0;const ro=new ResizeObserver(()=>{if(rz)cancelAnimationFrame(rz);rz=requestAnimationFrame(()=>{rz=0;build();});});ro.observe(row);
  offs.push(()=>{io?.disconnect();ro.disconnect();if(rz)cancelAnimationFrame(rz);clearTimeout(tgtTimer);});

  // ---- how much of the section is on screen (of itself, or of the viewport when it is taller), from the IO entry's own rects ---
  const TH=Array.from({length:11},(_,i)=>i/10);
  const vis=new IntersectionObserver(es=>{for(const e of es){const vh=e.rootBounds?.height||1;
    seen=e.isIntersecting?e.intersectionRect.height/Math.max(1,Math.min(e.boundingClientRect.height,vh)):0;}evaluate();},{threshold:TH});
  vis.observe(sec);
  const ahead=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){near=true;raise(active);raise((active+1)%n);ahead.disconnect();}},{rootMargin:NEAR});
  ahead.observe(sec);
  const onVis=()=>evaluate();
  document.addEventListener('visibilitychange',onVis);page.addEventListener('learn:panel',onVis);
  offs.push(()=>{vis.disconnect();ahead.disconnect();document.removeEventListener('visibilitychange',onVis);page.removeEventListener('learn:panel',onVis);});

  // ---- go to a slide (wraps), keys, dots, auto-advance --------------------------------------------------------------------------
  const go=(i:number)=>{const t=((i%n)+n)%n;if(t===active&&target<0)return;
   const reduce=calm||matchMedia('(prefers-reduced-motion: reduce)').matches;
   // clips wait until the scroll lands on the target (a smooth pass over the slides between plays nothing)
   target=t;clearTimeout(tgtTimer);tgtTimer=window.setTimeout(()=>{target=-1;evaluate();},1600);
   const c=cards[t];row.scroll({left:c.offsetLeft+c.offsetWidth/2-row.clientWidth/2,behavior:reduce?'auto':'smooth'});
   evaluate();};
  const onKey=(e:KeyboardEvent)=>{if(e.target!==row)return;
   const t=e.key==='ArrowRight'?active+1:e.key==='ArrowLeft'?active-1:e.key==='Home'?0:e.key==='End'?n-1:null;
   if(t===null)return;e.preventDefault();go(t);};
  row.addEventListener('keydown',onKey);
  const onDot=(e:Event)=>{const d=(e.target as Element).closest?.('[data-dot]');const i=dots.indexOf(d as HTMLButtonElement);if(i>=0)go(i);};
  dots[0]?.parentElement?.addEventListener('click',onDot);
  const onEnd=(e:AnimationEvent)=>{const d=(e.target as Element).closest?.('[data-dot]');if(d&&d===dots[active]&&(e.target as Element).hasAttribute('data-fill'))go(active+1);};
  sec.addEventListener('animationend',onEnd);
  offs.push(()=>{row.removeEventListener('keydown',onKey);dots[0]?.parentElement?.removeEventListener('click',onDot);sec.removeEventListener('animationend',onEnd);});

  // ---- pause: the button, a mouse over the row, keyboard focus inside --------------------------------------------------------
  const setPaused=(p:boolean)=>{paused=p;if(toggle){toggle.toggleAttribute('data-paused',p);toggle.setAttribute('aria-label',p?'Play the slideshow':'Pause the slideshow');}evaluate();};
  const onToggle=()=>setPaused(!paused);
  toggle?.addEventListener('click',onToggle);
  const onEnter=(e:PointerEvent)=>{if(e.pointerType==='mouse'){hover=true;evaluate();}};
  const onLeave=(e:PointerEvent)=>{if(e.pointerType==='mouse'){hover=false;evaluate();}};
  row.addEventListener('pointerenter',onEnter);row.addEventListener('pointerleave',onLeave);
  const onFocusIn=(e:FocusEvent)=>{const t=e.target as HTMLElement;focus=t!==toggle&&!!t.matches?.(':focus-visible');evaluate();};
  const onFocusOut=(e:FocusEvent)=>{if(!sec.contains(e.relatedTarget as Node|null)){focus=false;evaluate();}};
  sec.addEventListener('focusin',onFocusIn);sec.addEventListener('focusout',onFocusOut);
  offs.push(()=>{toggle?.removeEventListener('click',onToggle);row.removeEventListener('pointerenter',onEnter);row.removeEventListener('pointerleave',onLeave);
   sec.removeEventListener('focusin',onFocusIn);sec.removeEventListener('focusout',onFocusOut);});

  // ---- calm: each slide's own Play button ------------------------------------------------------------------------------------
  const onPlay=(ev:Event)=>{const b=(ev.target as Element).closest?.('[data-sv-btn]');if(!b)return;
   const i=cards.findIndex(c=>c.contains(b));if(i<0||!vids[i])return;
   started=started===i?-1:i;evaluate();};
  row.addEventListener('click',onPlay);offs.push(()=>row.removeEventListener('click',onPlay));

  try{const mq=matchMedia('(prefers-reduced-motion: reduce)');const on=()=>{calm=calmWanted();sec.toggleAttribute('data-calm',calm);started=-1;evaluate();};
   mq.addEventListener('change',on);offs.push(()=>mq.removeEventListener('change',on));}catch{}

  setActive(0);
  return ()=>{offs.forEach(f=>f());vids.forEach(v=>{if(v&&!v.paused)v.pause();});page.removeAttribute(ME);sec.removeAttribute('data-run');};
 },[]);
 return null;
}
