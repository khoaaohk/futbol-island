'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {isCertificateId,type CertificateId} from '@/lib/endgame/certificate';
import {museumSfx} from '@/lib/museum/museumSound';
import ExperienceBack from '../ExperienceBack';
import WallLabel from '../modern/WallLabel';
import {ISO_CSS} from '../anatomy/iso-kit';
import type {ExperienceProps} from '../types';
import {COPY,PLINTHS,SOURCES} from './hallData';
import {LEGEND_SOURCES,STYLE_NOTES} from './legends';
import {lessonNames,readPathProgress,type PathProgress} from './progress';
import Arena from './Arena';
import YourHall from './YourHall';
import s from './Experience.module.css';

/**
 * Hall of Fame (Oct 12 2026, anatomy restyle: isometric technical illustration in the Paper theme, one accent (red) for the
 * ball and the legend you play; replaces the pixel cabinets). The first screen IS the game and fills the viewport:
 *  1. Legends Arena (Arena.tsx): six positions, a woman and a man from the game's cards for each; play their position's move
 *     on a model pitch (board.ts) as a timed or aimed skill game, three tries, a score and stars per legend, the job and one
 *     sourced fact. Every position played → the final whistle's quick check ("whose job?") → the shared Ending → onComplete
 *     (once).
 *  2. Your Hall (YourHall.tsx), scrolled to below: the player's four paths as plinths stepping up, a cup on each graduated one,
 *     certificates opened by the host, "Same idea, different space", and the Matchday Ferry; the case's words verbatim.
 * Heat: static drawings are built once per size; the arena's one loop runs only while a try is live (asleep off-screen,
 * cancelled on unmount); progress is read from storage once. Escape closes the room (after the host's certificate, if open).
 */
const sfx=()=>{try{museumSfx.reveal();}catch{/* sound is optional */}};
/** Development only: /museum-lab/hall-of-fame?earned=grad:futsal,grad:7v7,diploma previews earned states (the lab passes none). */
function devEarned(earned:readonly CertificateId[]):readonly CertificateId[]{
 if(process.env.NODE_ENV==='production'||typeof location==='undefined')return earned;
 const q=new URLSearchParams(location.search).get('earned');return q==null?earned:q.split(',').filter(isCertificateId);
}

export default function Experience({exhibit,onClose,earned:given,openCertificate,onComplete}:ExperienceProps){
 const root=useRef<HTMLElement>(null);
 const [earned,setEarned]=useState(given);useEffect(()=>setEarned(devEarned(given)),[given]);
 const [progress,setProgress]=useState<Record<string,PathProgress>>(lessonNames);
 const has=useMemo(()=>new Set<CertificateId>(earned),[earned]);
 const count=PLINTHS.filter(p=>has.has(`grad:${p.format}`)).length;
 const completed=useRef(false);
 const complete=useCallback(()=>{if(completed.current)return;completed.current=true;onComplete?.();},[onComplete]);
 useEffect(()=>{setProgress(readPathProgress());root.current?.focus({preventScroll:true});},[]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key!=='Escape'||e.defaultPrevented)return;if(document.querySelector('dialog[open]'))return;/* the host's certificate is on top: let it close first */
  e.preventDefault();onClose();};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);},[onClose]);
 const openCert=(id:CertificateId)=>{sfx();openCertificate(id);};

 return <section ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${exhibit.title}: ${count} of 4 paths graduated`} data-museum-experience="hall-of-fame" data-earned={count} className={s.root}>
  <style dangerouslySetInnerHTML={{__html:ISO_CSS}}/>
  <ExperienceBack onClose={onClose}/>
  <div className={s.scroll} data-hof-scroll>
   <div className={s.screen} data-hof-screen>
    <header className={s.head}>
     <WallLabel as="h1" title={COPY.title} meta={<>{COPY.kicker} · {COPY.fact1} <b>{count===0?'Your first one is waiting.':count>=4?'All 4 are here!':`${count} of 4 so far.`}</b></>}/>
    </header>
    <Arena onDone={complete}/>
   </div>
   <section className={s.block} aria-label="Your Hall"><YourHall earned={has} progress={progress} openCert={openCert}/></section>
   <details className={s.sources}>
    <summary>Sources and what’s game fiction</summary>
    <p>{COPY.gameNote} The pitches and moves are games about each position’s job, not replays of real matches.</p>
    <p>{STYLE_NOTES}</p>
    <ul>{[...SOURCES,...LEGEND_SOURCES].map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noreferrer">{x.title}</a></li>)}</ul>
   </details>
  </div>
 </section>;
}
