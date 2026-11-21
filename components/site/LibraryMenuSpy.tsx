'use client';
import {useEffect} from 'react';
/**
 * The Library menu's highlight (Nov 20 2026): marks the menu link of the band in the middle of the screen with data-on. One
 * IntersectionObserver, no scroll listener; renders nothing. Without script the menu is plain anchor links.
 */
export default function LibraryMenuSpy({menu}:{menu:string}){
 useEffect(()=>{
  const nav=document.getElementById(menu);if(!nav||!('IntersectionObserver' in window))return;
  const links=[...nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  const on=(id:string)=>links.forEach(a=>{if(a.hash==='#'+id)a.setAttribute('data-on','');else a.removeAttribute('data-on');});
  const io=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting)on(e.target.id);},{rootMargin:'-45% 0px -50% 0px'});
  links.forEach(a=>{const s=document.getElementById(a.hash.slice(1));if(s)io.observe(s);});
  return ()=>io.disconnect();
 },[menu]);
 return null;
}
