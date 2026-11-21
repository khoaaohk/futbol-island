'use client';
import {useEffect,useRef,type ReactNode} from 'react';
/**
 * The list holder for small real cards (GameCard.tsx CardThumbGrid, Nov 20 2026). A card's portrait is a CSS mask (~30 KB each),
 * and CSS images load even off screen, so a row's masks stay off (GameCard.module.css, `li:not([data-near])`) until the row comes
 * within about a screen of the viewport: one IntersectionObserver per list marks it `data-near` once, then forgets it. The first
 * rows are marked on the server, so the first screen needs no script. No animation, no scroll handler.
 */
export default function LazyCardList({className,children}:{className:string;children:ReactNode}){
 const list=useRef<HTMLUListElement>(null);
 useEffect(()=>{const ul=list.current;if(!ul)return;const rest=[...ul.children].filter(li=>!(li as HTMLElement).dataset.near) as HTMLElement[];
  if(!rest.length)return;
  if(typeof IntersectionObserver==='undefined'){for(const li of rest)li.dataset.near='';return;}
  const io=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){(e.target as HTMLElement).dataset.near='';io.unobserve(e.target);}},{rootMargin:'500px 0px'});
  for(const li of rest)io.observe(li);return ()=>io.disconnect();},[]);
 return <ul ref={list} className={className} data-lazy="">{children}</ul>;
}
