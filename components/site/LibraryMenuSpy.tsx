'use client';
import {useEffect} from 'react';
/**
 * A left rail's highlight (Nov 20 2026): marks the rail (or phone bar) link of the band in the middle of the screen with data-on; once the page's
 * footer is on screen (scrolled to the end) the last link is marked, since a short last band never reaches the middle. When the
 * rail's list is taller than the window, or the phone bar's chips are wider than it, the marked link is scrolled into view inside the list (never the window). Two
 * IntersectionObservers and one click handler on the menu, no scroll listener; renders nothing. Without script the rail is plain anchor links.
 */
export default function LibraryMenuSpy({menu}:{menu:string}){
 useEffect(()=>{
  const nav=document.getElementById(menu);if(!nav||!('IntersectionObserver' in window))return;
  const links=[...nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];if(!links.length)return;
  const list=links[0].closest('ul');let mid='',end=false,hold=0;
  const show=(a:HTMLAnchorElement)=>{
   if(!list)return;const r=a.getBoundingClientRect(),b=list.getBoundingClientRect();
   if(list.scrollHeight>list.clientHeight+1){if(r.top<b.top)list.scrollTop-=b.top-r.top+8;else if(r.bottom>b.bottom)list.scrollTop+=r.bottom-b.bottom+8;}
   /* the phone/tablet bar: one row of chips; the lit chip is kept in view with room for the next one */
   if(list.scrollWidth>list.clientWidth+1){if(r.left<b.left+16)list.scrollLeft-=b.left+16-r.left;else if(r.right>b.right-48)list.scrollLeft+=r.right-(b.right-48);}
  };
  const paint=()=>{if(hold)return;const id=end?links[links.length-1].hash.slice(1):mid;
   links.forEach(a=>{if(a.hash==='#'+id){if(!a.hasAttribute('data-on')){a.setAttribute('data-on','');show(a);}}else a.removeAttribute('data-on');});};
  const io=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting)mid=e.target.id;paint();},{rootMargin:'-45% 0px -50% 0px'});
  links.forEach(a=>{const s=document.getElementById(a.hash.slice(1));if(s)io.observe(s);});
  const foot=document.querySelector('footer'),io2=foot?new IntersectionObserver(es=>{end=es[es.length-1].isIntersecting;paint();}):null;
  if(foot&&io2)io2.observe(foot);
  /* a tap on a chip or a rail entry glides to its band and lights at once (owner, Nov 20 2026 evening: "tapping and clicking
     smooth scrolls down"); the band lands under the header and the phone bar (scroll-margin-top). Reduced motion: a plain jump. */
  const tap=(e:MouseEvent)=>{const a=(e.target as Element).closest?.('a[href^="#"]') as HTMLAnchorElement|null;if(!a||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey)return;
   const t=document.getElementById(a.hash.slice(1));if(!t)return;e.preventDefault();
   const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
   t.scrollIntoView({behavior:still?'auto':'smooth',block:'start'});history.replaceState(null,'',a.hash);
   /* the tapped entry stays lit while the page glides past the bands between (one short timer per tap) */
   clearTimeout(hold);hold=0;mid=t.id;end=false;paint();hold=window.setTimeout(()=>{hold=0;},still?0:900);};
  nav.addEventListener('click',tap);
  return ()=>{io.disconnect();io2?.disconnect();nav.removeEventListener('click',tap);clearTimeout(hold);};
 },[menu]);
 return null;
}
