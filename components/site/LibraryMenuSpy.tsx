'use client';
import {useEffect} from 'react';
/**
 * A section menu's highlight (Nov 20 2026; the Library, /games and the guide pages' rails). Marks the link of the band in the
 * middle of the screen with data-on; once the page's footer is on screen the last link is marked (a short last band never
 * reaches the middle). Two IntersectionObservers, no window scroll listener, no animation loop; renders nothing. Without
 * script the menu is plain anchor links with their own chip backgrounds.
 *
 * Phone/tablet chip bar (owner, Nov 20 2026 evening: "have that scroll and snap animation when moving through so the btns have
 * more detail"): ONE pill (an aria-hidden <li data-pill>) slides from the old chip to the new one, like the home bar's pink chip:
 * width is set at once and the move is a FLIP transform (translate + scaleX back to 1) on a spring. The bar then glides the lit
 * chip to its centre with scrollTo on the bar only, debounced so a fast page scroll gives one glide; after the reader touches or
 * swipes the bar the auto-centre waits 1.5 s. Edge fades show only where there is more to scroll (an IntersectionObserver on
 * the first and last chip, rooted in the bar). A tap glides the page to its band and holds the pill on the tapped chip.
 * Reduced motion: no spring, no glide.
 */
export default function LibraryMenuSpy({menu}:{menu:string}){
 useEffect(()=>{
  const nav=document.getElementById(menu);if(!nav||!('IntersectionObserver' in window))return;
  const still=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const links=[...nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  if(!links.length){
   /* a rail of page links (the guide pages, components/site/shell/RailNav.tsx): the pill sits on the current page's chip and the
      bar (or rail) starts with it in view; nothing moves after that */
   const a=nav.querySelector<HTMLAnchorElement>('a[aria-current="page"]'),ul=nav.querySelector('ul');if(!ul)return;
   const pl=document.createElement('li');pl.setAttribute('data-pill','');pl.setAttribute('aria-hidden','true');ul.prepend(pl);ul.setAttribute('data-pill-on','');
   const put=()=>{if(!a)return;pl.style.width=a.offsetWidth+'px';pl.style.height=a.offsetHeight+'px';pl.style.transform=`translate(${a.offsetLeft}px,${a.offsetTop}px)`;pl.style.opacity='1';};
   pl.style.transition='none';put();
   if(a){if(ul.scrollWidth>ul.clientWidth+1)ul.scrollLeft=Math.max(0,a.offsetLeft-(ul.clientWidth-a.offsetWidth)/2);
    if(ul.scrollHeight>ul.clientHeight+1)ul.scrollTop=Math.max(0,a.offsetTop-(ul.clientHeight-a.offsetHeight)/2);}
   const ends=[...ul.querySelectorAll('a')],f=ends[0],z=ends[ends.length-1];
   const eo=new IntersectionObserver(es=>{for(const e of es)ul.toggleAttribute(e.target===f?'data-more-left':'data-more-right',e.intersectionRatio<.98);},{root:ul,threshold:[.98,1]});
   if(f&&z){eo.observe(f);eo.observe(z);}
   const rz='ResizeObserver' in window?new ResizeObserver(put):null;rz?.observe(ul);
   return ()=>{eo.disconnect();rz?.disconnect();pl.remove();ul.removeAttribute('data-pill-on');};
  }
  const list=links[0].closest('ul');if(!list)return;
  let mid='',end=false,top=false,hold=0,centre=0,pauseUntil=0,lit:HTMLAnchorElement|null=null;
  const pill=document.createElement('li');pill.setAttribute('data-pill','');pill.setAttribute('aria-hidden','true');list.prepend(pill);list.setAttribute('data-pill-on','');
  const place=(a:HTMLAnchorElement,from:HTMLAnchorElement|null)=>{
   const x=a.offsetLeft,y=a.offsetTop,w=a.offsetWidth,h=a.offsetHeight;
   pill.style.transition='none';pill.style.width=w+'px';pill.style.height=h+'px';
   if(from&&!still()){const s=from.offsetWidth/w;pill.style.transform=`translate(${from.offsetLeft}px,${from.offsetTop}px) scaleX(${s})`;void pill.offsetWidth;pill.style.transition='';}
   pill.style.transform=`translate(${x}px,${y}px)`;pill.style.opacity='1';
  };
  const glide=(a:HTMLAnchorElement)=>{
   if(list.scrollHeight>list.clientHeight+1){const r=a.getBoundingClientRect(),b=list.getBoundingClientRect();if(r.top<b.top)list.scrollTop-=b.top-r.top+8;else if(r.bottom>b.bottom)list.scrollTop+=r.bottom-b.bottom+8;}
   if(list.scrollWidth>list.clientWidth+1&&Date.now()>=pauseUntil)list.scrollTo({left:Math.max(0,a.offsetLeft-(list.clientWidth-a.offsetWidth)/2),behavior:still()?'auto':'smooth'});
  };
  const paint=(now=false)=>{if(hold&&!now)return;const id=end?links[links.length-1].hash.slice(1):mid||(top&&links[0].hash==='#top'?'top':'');
   const a=links.find(x=>x.hash==='#'+id)??null;if(a===lit)return;
   links.forEach(x=>{if(x===a)x.setAttribute('data-on','');else x.removeAttribute('data-on');});
   if(a){place(a,lit);clearTimeout(centre);centre=window.setTimeout(()=>glide(a),now?0:180);}else pill.style.opacity='0';
   lit=a;};
  const io=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting)mid=e.target.id;paint();},{rootMargin:'-45% 0px -50% 0px'});
  links.forEach(a=>{const s=document.getElementById(a.hash.slice(1));if(s)io.observe(s);});
  const foot=document.querySelector('footer'),io2=foot?new IntersectionObserver(es=>{end=es[es.length-1].isIntersecting;paint();}):null;
  if(foot&&io2)io2.observe(foot);
  /* "Overview" (owner, Nov 20 2026 evening; Spanish "Resumen"): server-rendered with data-on, so there is no flash before this runs. The
     head block (#top) is watched like a section (the middle line above), so Overview is lit while the head covers the middle of the
     screen and a section takes over as soon as its heading reaches the top half (Nov 20 2026 night: before, any strip of the hero left
     on screen kept Overview lit over the first section). This observer only covers the first moments, before anything has crossed
     the middle line. */
  /* Nov 20 2026 night: the head counts only while it reaches below the line a tapped section lands on (its scroll-margin-top: under
     the header, and the chip bar below 1280 px), so after a tap on the first section the hero's last strip under the bar does not
     light Overview again */
  const head=document.getElementById('top'),land=head?Math.max(68,parseFloat(getComputedStyle(head).scrollMarginTop)||0)+4:68;
  const io4=head?new IntersectionObserver(es=>{top=es[es.length-1].isIntersecting;paint();},{rootMargin:`-${land}px 0px 0px 0px`}):null;
  if(head&&io4)io4.observe(head);
  /* edge fades: is the first / last chip fully inside the bar? */
  const first=links[0],last=links[links.length-1];
  const io3=new IntersectionObserver(es=>{for(const e of es){const full=e.intersectionRatio>.98;list.toggleAttribute(e.target===first?'data-more-left':'data-more-right',!full);}},{root:list,threshold:[.98,1]});
  io3.observe(first);io3.observe(last);
  const touch=()=>{pauseUntil=Date.now()+1500;};
  list.addEventListener('pointerdown',touch,{passive:true});list.addEventListener('wheel',touch,{passive:true});
  const ro='ResizeObserver' in window?new ResizeObserver(()=>{if(lit)place(lit,null);}):null;ro?.observe(list);
  /* a tap glides the page to the band (scroll-margin-top keeps it under the header and bar) and holds the pill on the tapped chip */
  const tap=(e:MouseEvent)=>{const a=(e.target as Element).closest?.('a[href^="#"]') as HTMLAnchorElement|null;if(!a||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey)return;
   const t=document.getElementById(a.hash.slice(1));if(!t)return;e.preventDefault();
   t.scrollIntoView({behavior:still()?'auto':'smooth',block:'start'});history.replaceState(null,'',a.hash);
   clearTimeout(hold);hold=0;pauseUntil=0;mid=t.id;end=false;top=t.id==='top';paint(true);hold=window.setTimeout(()=>{hold=0;},still()?0:900);};
  nav.addEventListener('click',tap);
  return ()=>{io.disconnect();io2?.disconnect();io3.disconnect();io4?.disconnect();ro?.disconnect();nav.removeEventListener('click',tap);list.removeEventListener('pointerdown',touch);list.removeEventListener('wheel',touch);
   clearTimeout(hold);clearTimeout(centre);pill.remove();list.removeAttribute('data-pill-on');};
 },[menu]);
 return null;
}
