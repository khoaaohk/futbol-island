'use client';
import {useEffect} from 'react';

/**
 * /learn's one behaviour island (Nov 2 2026). Renders nothing; it only enhances the server-rendered page, so every word is in the
 * HTML without JavaScript. Heat budget (AGENTS.md): no scroll listeners, no layout reads while scrolling, no per-frame loops, IntersectionObserver for everything, all of it stopped on unmount.
 *  1. Motion mode: `data-calm` on the page root when the viewer asked for reduced motion, has Save-Data on, is on a 2g/3g
 *     connection, or has the game's Battery saver on (localStorage 'fi2-battery-saver', the same key as lib/graphics/heatTier.ts).
 *     Calm = no fade/scale-in, no hero zoom, no blur on the sub-nav (CSS); clips never start or preload ahead by themselves
 *     (poster still + tap to play). Content is identical.
 *  2. Fallback for browsers without CSS scroll-driven animations (`animation-timeline: view()`): `data-lm-io` on the root, then
 *     each chapter's [data-reveal] block gets `data-in` when it enters (fade + scale in), and the hero ([data-par]) gets `--p`
 *     (0..1 scrolled past) computed from the IntersectionObserver entry's own rect (no getBoundingClientRect), written in one rAF.
 *  3. Clips (Nov 3: "start instantly" like apple.com, owner): a clip within ~1.5 screens of the viewport is raised from
 *     preload="none" to "auto" (and loaded) so it is buffered before it scrolls in (only the visible and the next chapter);
 *     it plays once >= 25 % visible, at most 2 at once (the most visible win), never while its friends panel is hidden, and pauses
 *     when the tab is hidden. The still underneath is the poster; the clip crossfades in once it plays (`data-playing`). Each clip
 *     has a pause / play button (also the only way to start one in calm mode).
 */
const MAX_PLAYING=2;
const PLAY_AT=.25;
const AHEAD='150% 0px 150% 0px';

/** Save-Data or a 2g / 3g connection (the montage then only ever loads its smallest file). */
export function slowLink(){
 const c=(navigator as Navigator&{connection?:{saveData?:boolean;effectiveType?:string}}).connection;
 return !!c&&(!!c.saveData||/^(slow-2g|2g|3g)$/.test(c.effectiveType??''));
}
/**
 * The page-wide cap of 2 playing clips is shared: the montage (MontageEnhance), the See it in action carousel (ReelEnhance) and the
 * Even more to explore slideshow (SlidesEnhance) each publish how many clips they play on the page root and fire `learn:panel`
 * when that changes; the page's own chapter clips (below) only fill what is left.
 */
export const EXT_PLAYING=['data-montage-playing','data-reel-playing','data-slides-playing'] as const;
export const extPlaying=(page:Element,except?:string)=>EXT_PLAYING.reduce((t,a)=>a===except?t:t+(Number(page.getAttribute(a))||0),0);

export function calmWanted(){
 try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return true;}catch{}
 const c=(navigator as Navigator&{connection?:{saveData?:boolean;effectiveType?:string}}).connection;
 if(c?.saveData)return true;
 if(c?.effectiveType&&/^(slow-2g|2g|3g)$/.test(c.effectiveType))return true;
 try{if(localStorage.getItem('fi2-battery-saver')==='on')return true;}catch{}
 return false;
}

export default function LearnEnhance({rootId}:{rootId:string}){
 useEffect(()=>{
  const root=document.getElementById(rootId);if(!root)return;
  const offs:(()=>void)[]=[];
  let calm=calmWanted();
  const applyCalm=()=>{if(calm)root.setAttribute('data-calm','');else root.removeAttribute('data-calm');};
  applyCalm();
  try{const mq=matchMedia('(prefers-reduced-motion: reduce)');const on=()=>{calm=calmWanted();applyCalm();evaluate();};mq.addEventListener('change',on);offs.push(()=>mq.removeEventListener('change',on));}catch{}
  const scrollDriven=typeof CSS!=='undefined'&&CSS.supports?.('animation-timeline: view()');
  if(!scrollDriven)root.setAttribute('data-lm-io','');

  // ---- 2. fallback reveals and parallax --------------------------------------------------------------------------------------
  if(!scrollDriven){
   const rev=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){e.target.setAttribute('data-in','');rev.unobserve(e.target);}},{rootMargin:'0px 0px -12% 0px'});
   root.querySelectorAll('[data-reveal]').forEach(el=>rev.observe(el));
   offs.push(()=>rev.disconnect());
   const pending=new Map<HTMLElement,number>();let raf=0;
   const flush=()=>{raf=0;pending.forEach((p,el)=>el.style.setProperty('--p',p.toFixed(3)));pending.clear();};
   const TH=Array.from({length:51},(_,i)=>i/50);
   const par=new IntersectionObserver(es=>{for(const e of es){const el=e.target as HTMLElement,r=e.boundingClientRect,vh=e.rootBounds?.height??innerHeight;
     const hero=el.dataset.par==='hero';
     const p=hero?Math.min(1,Math.max(0,-r.top/Math.max(1,r.height))):Math.min(1,Math.max(0,(vh-r.top)/(vh+r.height)));
     if(e.isIntersecting)el.setAttribute('data-vis','');else el.removeAttribute('data-vis');
     pending.set(el,p);}
    if(!raf)raf=requestAnimationFrame(flush);},{threshold:TH});
   root.querySelectorAll('[data-par]').forEach(el=>par.observe(el));
   offs.push(()=>{par.disconnect();if(raf)cancelAnimationFrame(raf);});
  }

  // ---- 3. clips -------------------------------------------------------------------------------------------------------------
  const vids=[...root.querySelectorAll<HTMLVideoElement>('video[data-lv]')];
  // Calm mode: the hero clip is preload="auto" in the HTML, so it is already downloading (3.5-7 MB) for a Save-Data / 2g / 3g /
  // reduced-motion / Battery saver viewer; drop it back to "none" and reset it, which stops the fetch (a tap on Play loads it).
  if(calm)for(const v of vids)if(v.preload==='auto'&&v.paused){v.preload='none';if(v.networkState!==v.NETWORK_EMPTY)v.load();}
  // 4:5 clips (Nov 3): Save-Data / 2g / 3g keep only the 720px file (its <source media> otherwise serves viewports <= 640px)
  if(slowLink())for(const v of vids){const small=v.querySelector('source[media="(max-width: 640px)"]');
   if(small){v.querySelectorAll('source').forEach(x=>{if(x!==small)x.remove();});small.removeAttribute('media');if(v.networkState!==v.NETWORK_EMPTY)v.load();}}
  // the See it in action carousel (ReelEnhance) runs its own clips; they count toward the same cap of 2 (it writes data-reel-playing
  // on the root and fires learn:panel whenever that changes)
  // (Nov 3: and the montage and the slideshow, see EXT_PLAYING)
  const reelPlaying=()=>extPlaying(root);
  const ratio=new Map<HTMLVideoElement,number>();
  const userPaused=new Set<HTMLVideoElement>(),userStarted=new Set<HTMLVideoElement>();
  const btnOf=(v:HTMLVideoElement)=>v.parentElement?.querySelector<HTMLButtonElement>('[data-lv-btn]')??null;
  const mark=(v:HTMLVideoElement,playing:boolean)=>{const b=btnOf(v);if(!b)return;b.toggleAttribute('data-playing',playing);
   b.setAttribute('aria-label',`${playing?'Pause':'Play'} the clip: ${b.dataset.label??''}`);v.parentElement?.toggleAttribute('data-playing',playing);};
  function evaluate(){
   const hidden=document.visibilityState==='hidden';
   const want=vids.filter(v=>!hidden&&(ratio.get(v)??0)>=PLAY_AT&&!v.closest('[data-panel]:not([data-on])')&&!userPaused.has(v)&&(!calm||userStarted.has(v)))
    .sort((a,b)=>(ratio.get(b)??0)-(ratio.get(a)??0)).slice(0,Math.max(0,MAX_PLAYING-reelPlaying()));
   for(const v of vids){
    if(want.includes(v)){if(v.paused){const p=v.play();if(p)p.then(()=>mark(v,true),()=>mark(v,false));else mark(v,true);}}
    else if(!v.paused){v.pause();mark(v,false);}
   }
  }
  if(vids.length){
   const io=new IntersectionObserver(es=>{for(const e of es)ratio.set(e.target as HTMLVideoElement,e.isIntersecting?e.intersectionRatio:0);evaluate();},{threshold:[0,PLAY_AT,.5,.75,1]});
   vids.forEach(v=>io.observe(v));
   // buffer ahead: once a clip is near (and the viewer is not in calm mode), let the browser fetch its first seconds
   const ahead=new IntersectionObserver(es=>{for(const e of es){const v=e.target as HTMLVideoElement;if(!e.isIntersecting||calm)continue;
     if(v.preload!=='auto'){v.preload='auto';if(v.paused&&v.readyState===0&&v.networkState!==2)v.load();}ahead.unobserve(v);}},{rootMargin:AHEAD});
   vids.forEach(v=>ahead.observe(v));
   const vis=()=>evaluate();document.addEventListener('visibilitychange',vis);
   root.addEventListener('learn:panel',vis);
   const click=(ev:Event)=>{const b=(ev.target as Element).closest?.('[data-lv-btn]');if(!b||!root.contains(b))return;
    const v=b.parentElement?.querySelector<HTMLVideoElement>('video[data-lv]');if(!v)return;
    if(v.paused){userPaused.delete(v);userStarted.add(v);ratio.set(v,Math.max(ratio.get(v)??0,.5));
     // a tapped clip always plays; if that makes three, the least visible other one stops
     const others=vids.filter(o=>o!==v&&!o.paused).sort((a,b)=>(ratio.get(a)??0)-(ratio.get(b)??0));
     if(others.length>=MAX_PLAYING-reelPlaying()&&others.length){others[0].pause();mark(others[0],false);userPaused.add(others[0]);}
     const p=v.play();if(p)p.then(()=>mark(v,true),()=>mark(v,false));else mark(v,true);}
    else{v.pause();mark(v,false);userPaused.add(v);userStarted.delete(v);}};
   root.addEventListener('click',click);
   offs.push(()=>{io.disconnect();ahead.disconnect();document.removeEventListener('visibilitychange',vis);root.removeEventListener('learn:panel',vis);root.removeEventListener('click',click);vids.forEach(v=>{if(!v.paused)v.pause();});});
  }

  // ---- 4. the sub-nav turns dark over dark chapters ----------------------------------------------------------------------------
  // Each dark chapter holds a [data-nav-dark] marker covering its near-black middle (not the paper fades). An IntersectionObserver
  // whose root is a thin strip at the top of the viewport (where the bar sits; percentage margins, so nothing is measured) sets
  // `data-dark` on the bar while a marker is under it. No scroll listeners, no layout reads.
  const nav=root.querySelector<HTMLElement>('[data-subnav]'),marks=[...root.querySelectorAll('[data-nav-dark]')];
  if(nav&&marks.length){
   const under=new Set<Element>();
   const navIo=new IntersectionObserver(es=>{for(const e of es){if(e.isIntersecting)under.add(e.target);else under.delete(e.target);}nav.toggleAttribute('data-dark',under.size>0);},
    {rootMargin:'-2% 0px -95% 0px'});
   marks.forEach(m=>navIo.observe(m));
   offs.push(()=>{navIo.disconnect();nav.removeAttribute('data-dark');});
  }

  // ---- 5. the sub-nav shows which chapter you are in ----------------------------------------------------------------------------
  // One IntersectionObserver over every chapter, its root a thin band across the middle of the viewport (percentage margins, nothing
  // measured). The current chapter maps to the last nav-linked chapter at or before it, so Explore stays selected through
  // "Fuel up"; the hero, montage and carousel (before the first nav chapter) select nothing. Sets aria-current + data-current only.
  const links=[...root.querySelectorAll<HTMLAnchorElement>('[data-subnav] a[href^="#"]')].filter(a=>a.hash.length>1);
  const chapters=[...root.querySelectorAll<HTMLElement>('section[id]')];
  if(links.length&&chapters.length){
   const idxOf=new Map(chapters.map((c,i)=>[c,i] as const));
   // every link to a chapter (the desktop list and the phone menu) gets aria-current; the desktop list's one moving pink chip
   // reads --i (the link's index) + data-has-current (learn.module.css). Written only when the chapter changes.
   const navAt=chapters.map(c=>links.some(a=>a.hash.slice(1)===c.id)?c.id:undefined);
   const list=root.querySelector<HTMLElement>('[data-sublinks]');
   const order=list?[...list.querySelectorAll('a')].map(a=>a.hash.slice(1)):[];
   const inBand=new Set<number>();
   let shown:string|undefined,raf=0;
   const setCurrent=()=>{
    const cur=inBand.size?Math.min(...inBand):-1;let id:string|undefined;
    for(let i=cur;i>=0&&!id;i--)id=navAt[i];
    if(id===shown)return;
    const from=shown;shown=id;
    for(const a of links){if(a.hash.slice(1)===id)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');}
    if(!list)return;
    cancelAnimationFrame(raf);
    if(!id){list.removeAttribute('data-has-current');return;}// fades out in place
    list.style.setProperty('--i',String(Math.max(0,order.indexOf(id))));
    if(from&&list.hasAttribute('data-has-current'))return;// slides from the old link (transform only)
    // first appearance: jump to the target while hidden, then fade + scale in there (two frames so the jump is styled first)
    list.setAttribute('data-snap','');list.removeAttribute('data-has-current');
    raf=requestAnimationFrame(()=>{raf=requestAnimationFrame(()=>{list.removeAttribute('data-snap');list.setAttribute('data-has-current','');});});
   };
   const secIo=new IntersectionObserver(es=>{for(const e of es){const i=idxOf.get(e.target as HTMLElement);if(i===undefined)continue;if(e.isIntersecting)inBand.add(i);else inBand.delete(i);}setCurrent();},
    {rootMargin:'-45% 0px -54% 0px'});
   chapters.forEach(c=>secIo.observe(c));
   offs.push(()=>{secIo.disconnect();cancelAnimationFrame(raf);links.forEach(a=>a.removeAttribute('aria-current'));list?.removeAttribute('data-has-current');list?.removeAttribute('data-snap');});
  }

  return ()=>offs.forEach(f=>f());
 },[rootId]);
 return null;
}
