'use client';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import s from './learn.module.css';

/**
 * "Find a feature" (Nov 2 2026): every feature as a small tile, filtered by group chips. Server-rendered with every tile shown,
 * so the list reads fine without JavaScript. The chosen group is kept in the URL hash (#find-<group>) so a link can open a filter.
 * Tiles move to their new places with a FLIP transition (transform + opacity only; skipped when the page is calm). Layout reads
 * happen once per tap, never while scrolling.
 */
export type FinderGroup={id:string;title:string;count:number};
export type FinderItem={id:string;title:string;hook:string;group:string};

const HASH=/^#find-([a-z]+)$/;
const isCalm=(el:Element|null)=>!!el?.closest('[data-calm]')||(typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches);

export default function FeatureFinder({groups,items}:{groups:FinderGroup[];items:FinderItem[]}){
 const [group,setGroup]=useState('all');
 const list=useRef<HTMLUListElement>(null);
 const before=useRef<Map<string,DOMRect>|null>(null);
 useEffect(()=>{
  const m=HASH.exec(location.hash);
  if(m&&groups.some(g=>g.id===m[1])){setGroup(m[1]);requestAnimationFrame(()=>list.current?.closest('section')?.scrollIntoView({block:'start'}));}
 },[groups]);
 const choose=(g:string)=>{
  if(g===group)return;
  const ul=list.current;
  if(ul&&!isCalm(ul)){const m=new Map<string,DOMRect>();ul.querySelectorAll<HTMLElement>('li[data-id]:not([hidden])').forEach(li=>m.set(li.dataset.id!,li.getBoundingClientRect()));before.current=m;}
  setGroup(g);
  try{history.replaceState(null,'',g==='all'?location.pathname+location.search:`#find-${g}`);}catch{}
 };
 useLayoutEffect(()=>{
  const ul=list.current,prev=before.current;before.current=null;
  if(!ul||!prev)return;
  ul.querySelectorAll<HTMLElement>('li[data-id]:not([hidden])').forEach(li=>{
   const was=prev.get(li.dataset.id!),now=li.getBoundingClientRect();
   const from=was?`translate3d(${was.left-now.left}px,${was.top-now.top}px,0)`:'translate3d(0,12px,0) scale(.96)';
   li.animate([{transform:from,opacity:was?1:0},{transform:'none',opacity:1}],{duration:360,easing:'cubic-bezier(.2,.7,.2,1)'});
  });
 },[group]);
 const total=items.length;
 return <>
  <div className={s.chips} role="group" aria-label="Show features by group">
   <button type="button" className={s.chip} aria-pressed={group==='all'} onClick={()=>choose('all')}>All <span className={s.chipN}>{total}</span></button>
   {groups.map(g=><button key={g.id} type="button" className={s.chip} data-g={g.id} aria-pressed={group===g.id} onClick={()=>choose(g.id)}>{g.title} <span className={s.chipN}>{g.count}</span></button>)}
  </div>
  <p className={s.srOnly} aria-live="polite">{group==='all'?`Showing all ${total} features`:`Showing ${items.filter(i=>i.group===group).length} features in ${groups.find(g=>g.id===group)?.title}`}</p>
  <ul className={s.tiles} ref={list}>
   {items.map(i=><li key={i.id} data-id={i.id} data-g={i.group} hidden={group!=='all'&&i.group!==group}>
    <a className={s.tile} href={`#f-${i.id}`}><span className={s.tileT}>{i.title}</span><span className={s.tileH}>{i.hook}</span></a>
   </li>)}
  </ul>
 </>;
}
