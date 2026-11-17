'use client';
import {useEffect,useState} from 'react';
import k from './keep.module.css';
/**
 * "On this page" (visual pass batch 3, Nov 17 2026; audit shared fix 6): the desktop side column of a guide page. It lists the
 * page's own h2s (read once from the DOM after load, so every template gets it without a list of its sections) and marks the one
 * being read. CSS shows it only from 1100 px wide (components/site/keep.module.css .toc) and puts it in the sticky right column
 * (app/(site)/site.module.css .main:has(>[data-toc])). The headings are the page's real ones: no-JS readers, phones and search
 * engines lose nothing. Heat: one IntersectionObserver, no timers, no scroll listener; it is disconnected on unmount.
 */
type H={id:string;text:string};
export default function OnThisPage({lang='en'}:{lang?:'en'|'es'}){
 const [list,setList]=useState<H[]>([]),[at,setAt]=useState('');
 useEffect(()=>{
  const hs=[...document.querySelectorAll<HTMLElement>('main h2[id]')].filter(h=>!h.closest('[data-toc]'));
  setList(hs.map(h=>({id:h.id,text:(h.textContent??'').trim()})).filter(h=>h.text));
  if(!('IntersectionObserver' in window)||!hs.length)return;
  const io=new IntersectionObserver(es=>{const v=es.filter(e=>e.isIntersecting).map(e=>e.target.id);if(v.length)setAt(v[v.length-1]);},{rootMargin:'-80px 0px -65% 0px'});
  hs.forEach(h=>io.observe(h));
  return ()=>io.disconnect();
 },[]);
 return <nav className={k.toc} aria-label={lang==='es'?'En esta página':'On this page'} data-toc="" data-empty={list.length<3||undefined}>
  <p className={k.tocH}>{lang==='es'?'En esta página':'On this page'}</p>
  <ol>{list.map(h=><li key={h.id}><a href={`#${h.id}`} aria-current={at===h.id?'location':undefined}>{h.text}</a></li>)}</ol>
 </nav>;
}
