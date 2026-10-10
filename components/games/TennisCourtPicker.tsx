'use client';
import {useEffect,useState} from 'react';
import {TENNIS_COURTS,TENNIS_DRILL,tennisCourtTouches,type TennisTouchGuide} from '@/lib/games/soccerTennis';
import {readTennisStars} from '@/lib/arcade/tennisFeel';
import styles from './TennisCourtPicker.module.css';

/** Futbol Tennis court card: pick an unlocked court, see your best stars on each, the rival's habit,
 * and the touches this court uses with WHEN to use each one. Static UI, no animation loop. */
const TOUCH_NAME:Record<TennisTouchGuide['touch'],string>={kick:'Kick',trap:'Trap',header:'Header',lob:'Lob',drop:'Drop',aim:'Aim'};
const starText=(n:number)=>'★'.repeat(n)+'☆'.repeat(Math.max(0,3-n));
export function TennisCourtPicker({unlocked,touch,className,onPick}:{unlocked:number;touch:boolean;className?:string;onPick:(level:number)=>void}){
 const top=Math.max(1,Math.min(TENNIS_COURTS.length,unlocked)),[level,setLevel]=useState(top),[stars,setStars]=useState<number[]>(()=>TENNIS_COURTS.map(()=>0));
 // Stars live in localStorage: read after mount so the server render and the first client render match.
 useEffect(()=>{setStars(readTennisStars());},[]);
 useEffect(()=>{setLevel(top);},[top]);
 const court=TENNIS_COURTS[level-1],best=stars[level-1]??0,total=stars.reduce((a,b)=>a+b,0);
 const guide=tennisCourtTouches(level).map(g=>touch||g.touch!=='aim'?g:{...g,when:g.when.replace('Push the stick','Hold ← or →')});
 return <div className={styles.picker} data-testid="tennis-court-picker">
  <label className={className}>Choose court <select value={level} onChange={e=>{const next=Number(e.target.value);setLevel(next);onPick(next);}}>
   {TENNIS_COURTS.map((c,i)=><option key={c.name} value={i+1} disabled={i+1>top}>{i+1}. {c.name}{i+1>top?' · win to unlock':stars[i]?` ${starText(stars[i])}`:''}</option>)}
  </select></label>
  <div className={styles.rival}><b>{court.rival}</b><span>{court.habit}</span></div>
  <ul className={styles.touches} aria-label={`Touches on court ${level}`}>
   {guide.map(g=><li key={g.touch} data-touch={g.touch}><b>{TOUCH_NAME[g.touch]}</b><span>{g.when}</span></li>)}
  </ul>
  <p className={styles.stars}><span aria-label={`Best: ${best} of 3 stars`}>{starText(best)}</span>{best>=3?'All stars on this court!':court.style==='drill'?`Stars: hit ${TENNIS_DRILL.stars.join(' · ')} targets`:`Stars: win · 4 perfect touches · ${court.star3}`}{total>0&&<small>{total} / {TENNIS_COURTS.length*3} stars on the circuit</small>}</p>
 </div>;
}
