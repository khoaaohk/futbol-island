'use client';
import {useEffect} from 'react';
/**
 * A left rail's highlight (Nov 20 2026): marks the rail link of the band in the middle of the screen with data-on; once the page's
 * footer is on screen (scrolled to the end) the last link is marked, since a short last band never reaches the middle. When the
 * rail's list is taller than the window, the marked link is scrolled into view inside the list (never the window). Two
 * IntersectionObservers, no scroll listener; renders nothing. Without script the rail is plain anchor links.
 */
export default function LibraryMenuSpy({menu}:{menu:string}){
 useEffect(()=>{
  const nav=document.getElementById(menu);if(!nav||!('IntersectionObserver' in window))return;
  const links=[...nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];if(!links.length)return;
  const list=links[0].closest('ul');let mid='',end=false;
  const show=(a:HTMLAnchorElement)=>{
   if(!list||list.scrollHeight<=list.clientHeight+1)return;
   const r=a.getBoundingClientRect(),b=list.getBoundingClientRect();
   if(r.top<b.top)list.scrollTop-=b.top-r.top+8;else if(r.bottom>b.bottom)list.scrollTop+=r.bottom-b.bottom+8;
  };
  const paint=()=>{const id=end?links[links.length-1].hash.slice(1):mid;
   links.forEach(a=>{if(a.hash==='#'+id){if(!a.hasAttribute('data-on')){a.setAttribute('data-on','');show(a);}}else a.removeAttribute('data-on');});};
  const io=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting)mid=e.target.id;paint();},{rootMargin:'-45% 0px -50% 0px'});
  links.forEach(a=>{const s=document.getElementById(a.hash.slice(1));if(s)io.observe(s);});
  const foot=document.querySelector('footer'),io2=foot?new IntersectionObserver(es=>{end=es[es.length-1].isIntersecting;paint();}):null;
  if(foot&&io2)io2.observe(foot);
  return ()=>{io.disconnect();io2?.disconnect();};
 },[menu]);
 return null;
}
