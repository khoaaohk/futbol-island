'use client';
import {useLayoutEffect,useRef} from 'react';
import IslandLoading from '../IslandLoading';
import {runHandoff} from './handoffMotion';
import styles from './Title.module.css';

/**
 * The game's own loading screen, mounted (invisible, already settled) the moment Play is pressed: handoff.ts measures it, morphs
 * the title screen onto it, fades it in, then `onDone` switches the route to `/`, whose loader is the same picture.
 * Loaded on demand (PlayButton warms this chunk on idle).
 */
export default function Handoff({onDone}:{onDone:()=>void}){
 const wrap=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  const el=wrap.current;if(!el)return;
  const screen=document.querySelector<HTMLElement>('[data-title-scene]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let live=true;
  const done=()=>{if(live)onDone();};
  if(!screen){void el.animate([{opacity:0},{opacity:1}],{duration:160,fill:'forwards'}).finished.then(done,done);return()=>{live=false;};}
  void runHandoff(screen,el,{reduced}).then(done,done);
  return()=>{live=false;};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 return <div ref={wrap} className={styles.launch} data-landing-launch style={{opacity:0}} aria-hidden="true"><IslandLoading/></div>;
}
