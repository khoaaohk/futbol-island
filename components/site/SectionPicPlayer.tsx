'use client';
import {useEffect} from 'react';
/**
 * Plays the Library's drawn section pictures (lib/site/sectionImage.tsx SectionSvg, svg[data-pic-anim="<seconds>"]) once as each
 * enters view (Nov 20 2026 night, owner: "also if these could animate that would be nice"). One IntersectionObserver for the page
 * (threshold 0.4), no scroll listener, no rAF: entering view sets [data-play] (the CSS in components/site/sectionPic.module.css
 * runs), one timeout removes it when the last move ends, so at rest no animation exists. Replays when the picture comes back into
 * view after leaving, and on hover with a fine pointer. Leaving view mid-play stops it at once. Nothing under reduced motion.
 */
export default function SectionPicPlayer(){
 useEffect(()=>{
  if(typeof IntersectionObserver==='undefined'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const pics=[...document.querySelectorAll<SVGSVGElement>('svg[data-pic-anim]')],timers=new Map<Element,number>(),hover=matchMedia('(hover: hover) and (pointer: fine)').matches;
  const stop=(el:Element)=>{clearTimeout(timers.get(el));timers.delete(el);el.removeAttribute('data-play');};
  const play=(el:SVGSVGElement)=>{if(timers.has(el))return;
   el.removeAttribute('data-play');void el.getBoundingClientRect();el.setAttribute('data-play','');
   timers.set(el,window.setTimeout(()=>stop(el),(Number(el.dataset.picAnim)||2.5)*1000));};
  // plays when 40% is on screen, once per visit: it must leave the screen entirely before it plays again
  const away=new Set<Element>(pics);
  const io=new IntersectionObserver(es=>{for(const e of es){const el=e.target as SVGSVGElement;
   if(!e.isIntersecting){stop(el);away.add(el);}else if(e.intersectionRatio>=.4&&away.has(el)){away.delete(el);play(el);}}},{threshold:[0,.4]});
  const enter=(e:Event)=>play(e.currentTarget as SVGSVGElement);
  for(const el of pics){io.observe(el);if(hover)el.addEventListener('pointerenter',enter);}
  return ()=>{io.disconnect();for(const el of pics){stop(el);el.removeEventListener('pointerenter',enter);}};
 },[]);
 return null;
}
