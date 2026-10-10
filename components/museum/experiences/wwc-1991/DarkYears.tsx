'use client';
import React,{useCallback,useEffect,useRef,useState,type MutableRefObject} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import {BANS,DARK_FROM,DARK_TO,type Ban} from './data';
import {Again,FirstStar,Pause,Play} from './icons';
import styles from './wwc.module.css';

/** Beat 1, "Shut out": scrub (or play) 1920 → 1991. Each country's ban is a red paper shutter pulled across its lane; when the
 *  ban ends, the shutter is cut free and lifts away, until the first Women's World Cup star is cut and lights up. The play button is the only loop: rAF at 10 years a second, stopping at 1991, on
 *  pause, when the tab hides and on unmount. */
const status=(b:Ban,y:number)=>y<b.from?'none':y<b.to?'banned':'lifted';
const LABEL={none:'No ban yet',banned:'Banned',lifted:'Ban lifted'} as const;
export type Dark=ReturnType<typeof useDarkYears>;
export function useDarkYears(reduced:MutableRefObject<boolean>){
 const [year,setYearRaw]=useState(DARK_FROM),[playing,setPlaying]=useState(false);
 const yRef=useRef<number>(DARK_FROM);yRef.current=year;
 const setYear=useCallback((y:number)=>{const v=Math.max(DARK_FROM,Math.min(DARK_TO,Math.round(y)));if(v===DARK_TO&&yRef.current!==DARK_TO)museumSfx.reveal();setYearRaw(v);},[]);
 useEffect(()=>{if(!playing)return;let raf=0,last=performance.now(),acc=yRef.current;
  const tick=(now:number)=>{acc=Math.min(DARK_TO,acc+Math.min(.1,(now-last)/1000)*10);last=now;setYear(acc);if(acc>=DARK_TO){setPlaying(false);return;}raf=requestAnimationFrame(tick);};
  raf=requestAnimationFrame(tick);const vis=()=>{if(document.hidden)setPlaying(false);};document.addEventListener('visibilitychange',vis);
  return()=>{cancelAnimationFrame(raf);document.removeEventListener('visibilitychange',vis);};},[playing,setYear]);
 const play=useCallback(()=>{if(reduced.current){setYear(DARK_TO);return;}if(yRef.current>=DARK_TO)setYearRaw(DARK_FROM);setPlaying(true);},[reduced,setYear]);
 const pause=useCallback(()=>setPlaying(false),[]);
 return {year,setYear,playing,play,pause};
}

const pct=(y:number)=>(y-DARK_FROM)/(DARK_TO-DARK_FROM)*100;
/** The story beats on the way to 1991, in order: each ban starting and ending, then the first star. */
const EVENTS=[{y:DARK_FROM,c:'England',t:'53,000 fans watch Dick, Kerr Ladies play in England.'},
 ...BANS.flatMap(b=>[{y:b.from,c:b.country,t:`${b.country} bans women’s football.`},{y:b.to,c:b.country,t:`${b.country} lifts its ban.`}]),
 {y:DARK_TO,c:'',t:'The first FIFA Women’s World Cup, in China.'}].sort((a,b)=>a.y-b.y);
export const eventAt=(y:number)=>EVENTS.filter(e=>e.y<=y).at(-1)??EVENTS[0];
const DECADES=[1930,1940,1950,1960,1970,1980];

export function DarkStage({d,onLit}:{d:Dark;onLit:()=>void}){
 const banned=BANS.filter(b=>status(b,d.year)==='banned').length;
 const lit=d.year>=DARK_TO,ev=eventAt(d.year);
 return <div className={styles.dark} data-lit={lit||undefined}>
  <p className={styles.beatKick}>Beat 1 · Shut out</p>
  <div className={styles.dhead}>
   <div className={styles.yearRow}>{lit&&<FirstStar className={`${styles.dStar} ${styles.ignite}`}/>}<p className={styles.dyear} data-lit={lit||undefined} aria-hidden="true">{d.year}</p></div>
   {lit?<p className={styles.event} aria-live="polite"><span>1991</span>The first FIFA Women’s World Cup, in China.</p>
    :<p key={ev.y+ev.t} className={styles.event} aria-live="polite"><span>{ev.y}</span>{ev.t}</p>}
  </div>
  <div className={styles.tracks}>
   <p className={styles.srOnly} aria-live="polite">{banned?`${d.year}: banned in ${banned} of these countries.`:`${d.year}: no ban in these countries.`}</p>
   {BANS.map(b=>{const s=status(b,d.year),fill=Math.max(0,Math.min(1,(d.year-b.from)/(b.to-b.from)));return <div key={b.country} className={styles.track} data-s={s}>
    <b>{b.country}</b>
    <div className={styles.lane} aria-hidden="true">
     {DECADES.map(y=><i key={y} className={styles.grid} style={{left:`${pct(y)}%`}}/>)}
     <span className={styles.banGhost} style={{left:`${pct(b.from)}%`,width:`${pct(b.to)-pct(b.from)}%`}}/>
     <span className={styles.ban} data-s={s} style={{left:`${pct(b.from)}%`,width:`${pct(b.to)-pct(b.from)}%`}}><span className={styles.banFill} style={{clipPath:`inset(-6px ${((1-(s==='none'?0:fill))*100).toFixed(1)}% -6px 0)`}}/><em>{b.from}–{String(b.to).slice(2)}</em></span>
     <span className={styles.cursor} style={{left:`${pct(d.year)}%`}}/>
    </div>
    <span className={styles.chip} data-s={s}>{LABEL[s]}</span>
   </div>;})}
   <div className={styles.track}><span/><div className={styles.scrub}>
    <input className={styles.range} type="range" min={DARK_FROM} max={DARK_TO} step={1} value={d.year} aria-label="Year" aria-valuetext={`${d.year}`}
     style={{'--p':`${pct(d.year)}%`} as React.CSSProperties} onChange={ev=>{d.pause();d.setYear(+ev.target.value);}}/>
    <div className={styles.ticks} aria-hidden="true">{[DARK_FROM,1940,1960].map(y=><span key={y} style={{left:`${pct(y)}%`}}>{y}</span>)}<span style={{left:'100%'}} data-gold>1991</span></div>
   </div><span/></div>
  </div>
  {lit&&<div className={styles.lit}><p>The bans are lifted. The first Women’s World Cup is cut.</p>
   <button type="button" className={`${styles.btn} ${styles.gold}`} data-museum-own-cue onClick={onLit}>Next: China 1991 →</button></div>}
 </div>;
}

export function DarkPanel({d,onLit}:{d:Dark;onLit:()=>void}){
 const focus=eventAt(d.year).c;
 return <div>
  <p className={styles.lead}>For years, some countries <b>shut women out</b> of football. Drag the year slider, or press play, and watch the bans start and end before the first Women’s World Cup.</p>
  <div className={styles.row}><button type="button" className={`${styles.btn} ${d.year>=DARK_TO?'':styles.gold}`} onClick={()=>d.playing?d.pause():d.play()}>{d.playing?<><Pause/>Pause</>:d.year>=DARK_TO?<><Again/>Play again</>:<><Play/>Play through time</>}</button>
   <span className={styles.grow}/>{d.year>=DARK_TO&&<button type="button" className={`${styles.btn} ${styles.gold} ${styles.pop}`} data-museum-own-cue onClick={onLit}>Next: China 1991 →</button>}</div>
  <ul className={styles.dtext}>
   {BANS.map(b=>{const s=status(b,d.year);return <li key={b.country} data-s={s} data-focus={(focus===b.country||(!focus&&b===BANS[0]))||undefined}><b>{b.country}, {b.from}–{b.to}.</b> {b.banned} {s==='lifted'?b.after:s==='banned'?b.who:b.before??''}</li>;})}
  </ul>
 </div>;
}
