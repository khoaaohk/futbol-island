'use client';
import {useEffect} from 'react';

/**
 * /learn's one behaviour island (Nov 2 2026). Renders nothing; it only enhances the server-rendered page, so every word is in the
 * HTML without JavaScript. Heat budget (AGENTS.md): no scroll listeners, no layout reads while scrolling, no per-frame loops, IntersectionObserver for everything, all of it stopped on unmount.
 *  1. Motion mode: `data-calm` on the page root when the viewer asked for reduced motion, has Save-Data on, is on a 2g/3g
 *     connection, or has the game's Battery saver on (localStorage 'fi2-battery-saver', the same key as lib/graphics/heatTier.ts).
 *     Calm = no fade-up or hero parallax (CSS), clips never start by themselves (poster + tap to play). Content is identical.
 *  2. Fallback for browsers without CSS scroll-driven animations (`animation-timeline: view()`): `data-lm-io` on the root, then
 *     each section's [data-reveal] block gets `data-in` when it enters (soft fade-up), and the hero ([data-par]) gets `--p` (0..1 through the viewport) computed from the
 *     IntersectionObserver entry's own rect (no getBoundingClientRect), written in one rAF.
 *  3. Clips: play only while >= 50 % visible, at most 2 at once (the most visible win), pause when the tab is hidden; each clip
 *     has a pause / play button (also the only way to start one in calm mode).
 */
const MAX_PLAYING=2;

function calmWanted(){
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
  const ratio=new Map<HTMLVideoElement,number>();
  const userPaused=new Set<HTMLVideoElement>(),userStarted=new Set<HTMLVideoElement>();
  const btnOf=(v:HTMLVideoElement)=>v.parentElement?.querySelector<HTMLButtonElement>('[data-lv-btn]')??null;
  const mark=(v:HTMLVideoElement,playing:boolean)=>{const b=btnOf(v);if(!b)return;b.toggleAttribute('data-playing',playing);
   b.setAttribute('aria-label',`${playing?'Pause':'Play'} the clip: ${b.dataset.label??''}`);v.parentElement?.toggleAttribute('data-playing',playing);};
  function evaluate(){
   const hidden=document.visibilityState==='hidden';
   const want=vids.filter(v=>!hidden&&(ratio.get(v)??0)>=.5&&!userPaused.has(v)&&(!calm||userStarted.has(v)))
    .sort((a,b)=>(ratio.get(b)??0)-(ratio.get(a)??0)).slice(0,MAX_PLAYING);
   for(const v of vids){
    if(want.includes(v)){if(v.paused){const p=v.play();if(p)p.then(()=>mark(v,true),()=>mark(v,false));else mark(v,true);}}
    else if(!v.paused){v.pause();mark(v,false);}
   }
  }
  if(vids.length){
   const io=new IntersectionObserver(es=>{for(const e of es)ratio.set(e.target as HTMLVideoElement,e.isIntersecting?e.intersectionRatio:0);evaluate();},{threshold:[0,.5,.75,1]});
   vids.forEach(v=>io.observe(v));
   const vis=()=>evaluate();document.addEventListener('visibilitychange',vis);
   const click=(ev:Event)=>{const b=(ev.target as Element).closest?.('[data-lv-btn]');if(!b||!root.contains(b))return;
    const v=b.parentElement?.querySelector<HTMLVideoElement>('video[data-lv]');if(!v)return;
    if(v.paused){userPaused.delete(v);userStarted.add(v);ratio.set(v,Math.max(ratio.get(v)??0,.5));
     // a tapped clip always plays; if that makes three, the least visible other one stops
     const others=vids.filter(o=>o!==v&&!o.paused).sort((a,b)=>(ratio.get(a)??0)-(ratio.get(b)??0));
     if(others.length>=MAX_PLAYING){others[0].pause();mark(others[0],false);userPaused.add(others[0]);}
     const p=v.play();if(p)p.then(()=>mark(v,true),()=>mark(v,false));else mark(v,true);}
    else{v.pause();mark(v,false);userPaused.add(v);userStarted.delete(v);}};
   root.addEventListener('click',click);
   offs.push(()=>{io.disconnect();document.removeEventListener('visibilitychange',vis);root.removeEventListener('click',click);vids.forEach(v=>{if(!v.paused)v.pause();});});
  }

  return ()=>offs.forEach(f=>f());
 },[rootId]);
 return null;
}
