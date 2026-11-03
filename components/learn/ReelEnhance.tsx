'use client';
import {useEffect} from 'react';
import {calmWanted} from './LearnEnhance';

/**
 * The "See it in action" carousel's behaviour (Nov 3 2026). Renders nothing; it enhances the server-rendered row in LearnReel.
 * Heat budget (AGENTS.md): no scroll listeners and no layout reads while scrolling; IntersectionObserver for everything, one
 * clip playing (two at most, shared with the page's other clips through `data-reel-playing` on the page root), all stopped on
 * unmount.
 *  - Active card = the one crossing a thin vertical strip just inside the left snap position (an IntersectionObserver whose root
 *    is the row; the strip is measured once at start and on resize, never while scrolling). Its caption turns dark (`data-active`).
 *  - Prev / next scroll by one card (smooth, instant in calm mode) and are disabled at the ends; the row takes Left / Right /
 *    Home / End when focused. The native swipe / trackpad scroll and the CSS scroll snap do the rest.
 *  - Clips: only the active card plays (muted loop), and only while >= 25 % of the row is on screen and the tab is visible.
 *    Its pause button stops it and the carousel stays paused until the button is pressed again. preload="none" until the row is
 *    within ~1.5 screens, then the active and the next card get preload="auto". Calm mode (reduced motion, Save-Data, 2g/3g,
 *    Battery saver): nothing starts or preloads by itself; each card shows a Play button that plays only that card (2 at most).
 */
const MAX_PLAYING=2;
const SHOW_AT=.25;
const NEAR='150% 0px 150% 0px';

export default function ReelEnhance(){
 useEffect(()=>{
  const sec=document.querySelector<HTMLElement>('[data-reel]'),row=sec?.querySelector<HTMLElement>('[data-reel-row]');
  if(!sec||!row)return;
  const page=sec.closest<HTMLElement>('#learn-root')??document.body;
  const cards=[...row.querySelectorAll<HTMLElement>('[data-reel-card]')];
  const vids=cards.map(c=>c.querySelector<HTMLVideoElement>('video[data-rv]'));
  const prev=sec.querySelector<HTMLButtonElement>('[data-reel-prev]'),next=sec.querySelector<HTMLButtonElement>('[data-reel-next]');
  const offs:(()=>void)[]=[];
  let calm=calmWanted(),active=0,onScreen=false,near=false,paused=false;
  const started:number[]=[];// calm mode: cards the viewer started, oldest first
  sec.setAttribute('data-js','');
  sec.toggleAttribute('data-calm',calm);

  const mark=(i:number,playing:boolean)=>{const v=vids[i];if(!v)return;const m=v.parentElement!,b=m.querySelector<HTMLButtonElement>('[data-rv-btn]');
   m.toggleAttribute('data-playing',playing);
   if(b){b.toggleAttribute('data-playing',playing);b.setAttribute('aria-label',`${playing?'Pause':'Play'} the clip: ${b.dataset.label??''}`);}};
  const raise=(i:number)=>{const v=vids[i];if(!v||calm||!near)return;
   if(v.preload!=='auto'){v.preload='auto';if(v.paused&&v.readyState===0&&v.networkState!==2)v.load();}};
  let lastCount=-1;
  function evaluate(){
   const ok=onScreen&&document.visibilityState!=='hidden';
   const want=new Set<number>(!ok?[]:calm?started.slice(-MAX_PLAYING):paused?[]:[active]);
   vids.forEach((v,i)=>{if(!v)return;
    if(want.has(i)){if(v.paused){if(v.preload!=='auto')v.preload='auto';const p=v.play();if(p)p.then(()=>mark(i,!v.paused),()=>mark(i,false));else mark(i,true);}}
    else if(!v.paused||v.parentElement!.hasAttribute('data-playing')){v.pause();mark(i,false);}});
   const count=[...want].filter(i=>vids[i]).length;
   if(count!==lastCount){lastCount=count;page.setAttribute('data-reel-playing',String(count));page.dispatchEvent(new Event('learn:panel'));}
  }
  const setActive=(i:number)=>{if(i===active&&cards[i].hasAttribute('data-active'))return;
   cards[active]?.removeAttribute('data-active');active=i;cards[i].setAttribute('data-active','');
   if(prev)prev.disabled=i<=0;if(next)next.disabled=i>=cards.length-1;
   raise(i);raise(i+1);evaluate();};
  setActive(0);

  // ---- active card: a 2px strip just inside the left snap edge, measured at start and on resize only ----------------------------
  let io:IntersectionObserver|null=null;
  const build=()=>{io?.disconnect();
   const pad=cards[0].offsetLeft,w=row.clientWidth,cw=cards[0].offsetWidth;// the row is the cards' offsetParent; card 0 sits at the snap edge
   const x=Math.round(Math.min(pad+cw*.45,w-4));
   io=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){setActive(cards.indexOf(e.target as HTMLElement));break;}},
    {root:row,rootMargin:`0px ${-(w-x-2)}px 0px ${-x}px`,threshold:0});
   cards.forEach(c=>io!.observe(c));};
  build();
  let rz=0;const ro=new ResizeObserver(()=>{if(rz)cancelAnimationFrame(rz);rz=requestAnimationFrame(()=>{rz=0;build();});});ro.observe(row);
  offs.push(()=>{io?.disconnect();ro.disconnect();if(rz)cancelAnimationFrame(rz);});

  // ---- on screen (plays) and near (preloads) -----------------------------------------------------------------------------------
  const vis=new IntersectionObserver(es=>{for(const e of es)onScreen=e.isIntersecting&&e.intersectionRatio>=SHOW_AT;evaluate();},{threshold:[0,SHOW_AT,.5]});
  vis.observe(row);
  const ahead=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){near=true;raise(active);raise(active+1);ahead.disconnect();}},{rootMargin:NEAR});
  ahead.observe(row);
  const onVis=()=>evaluate();document.addEventListener('visibilitychange',onVis);
  offs.push(()=>{vis.disconnect();ahead.disconnect();document.removeEventListener('visibilitychange',onVis);});

  // ---- calm mode can change (reduced motion toggled) -----------------------------------------------------------------------------
  try{const mq=matchMedia('(prefers-reduced-motion: reduce)');const on=()=>{calm=calmWanted();sec.toggleAttribute('data-calm',calm);started.length=0;evaluate();};
   mq.addEventListener('change',on);offs.push(()=>mq.removeEventListener('change',on));}catch{}

  // ---- prev / next / keys ------------------------------------------------------------------------------------------------------
  const go=(i:number)=>{const t=Math.max(0,Math.min(cards.length-1,i));if(t===active)return;
   // the target card's snap position (offsets read on a click / key press only, never while scrolling)
   const reduce=calm||matchMedia('(prefers-reduced-motion: reduce)').matches;
   row.scroll({left:cards[t].offsetLeft-cards[0].offsetLeft,behavior:reduce?'auto':'smooth'});};
  const onPrev=()=>go(active-1),onNext=()=>go(active+1);
  prev?.addEventListener('click',onPrev);next?.addEventListener('click',onNext);
  const onKey=(e:KeyboardEvent)=>{if(e.target!==row)return;
   const t=e.key==='ArrowRight'?active+1:e.key==='ArrowLeft'?active-1:e.key==='Home'?0:e.key==='End'?cards.length-1:null;
   if(t===null)return;e.preventDefault();go(t);};
  row.addEventListener('keydown',onKey);
  offs.push(()=>{prev?.removeEventListener('click',onPrev);next?.removeEventListener('click',onNext);row.removeEventListener('keydown',onKey);});

  // ---- play / pause buttons ------------------------------------------------------------------------------------------------------
  const onClick=(ev:Event)=>{const b=(ev.target as Element).closest?.('[data-rv-btn]');if(!b)return;
   const i=cards.findIndex(c=>c.contains(b));if(i<0||!vids[i])return;
   if(calm){const k=started.indexOf(i);if(k>=0)started.splice(k,1);else{started.push(i);while(started.length>MAX_PLAYING)started.shift();}}
   else{paused=!paused;if(!paused&&i!==active)go(i);}
   evaluate();};
  row.addEventListener('click',onClick);
  offs.push(()=>row.removeEventListener('click',onClick));

  return ()=>{offs.forEach(f=>f());vids.forEach(v=>{if(v&&!v.paused)v.pause();});page.removeAttribute('data-reel-playing');};
 },[]);
 return null;
}
