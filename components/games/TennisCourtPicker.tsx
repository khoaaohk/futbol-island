'use client';
import {TENNIS_COURTS,TENNIS_DRILL,tennisCourtTouches,type TennisTouchGuide} from '@/lib/games/soccerTennis';
import styles from './TennisCourtPicker.module.css';

/** Futbol Tennis court picker (round 3, Oct 26 2026): a compact row of court chips (number, stars, lock), the HARD
 * courts on their own short row, and ONE line about the chosen court (rival + modifier pills). The touch guide lives
 * behind the card's "How to play" chevron (TennisHowTo). Controlled: the card owns the chosen level. Static UI. */
const TOUCH_NAME:Record<TennisTouchGuide['touch'],string>={kick:'Kick',trap:'Trap',header:'Header',lob:'Lob',drop:'Drop',aim:'Aim'};
export const tennisStarText=(n:number)=>'★'.repeat(n)+'☆'.repeat(Math.max(0,3-n));
/** Short modifier pills for a court (kid words, ≤ 2 each). */
export function tennisCourtPills(level:number):string[]{const c=TENNIS_COURTS[level-1];if(!c)return [];const out:string[]=[];
 if(c.style==='drill')out.push('Targets');if(c.surface==='sand')out.push('Sand');if(c.surface==='clay')out.push('Clay');if(c.surface==='grass')out.push('Grass');
 if(c.wind)out.push('Wind');if(c.bounce>1.1)out.push('Bouncy');if(c.spin)out.push('Spin');if(c.sets)out.push('Best of 3');if(c.touches>1&&c.style!=='drill')out.push('2 touches');if(c.to<7)out.push(`First to ${c.to}`);
 return out.slice(0,3);}
const Lock=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>;

export function TennisCourtPicker({unlocked,level,stars,onPick}:{unlocked:number;level:number;stars:number[];onPick:(level:number)=>void}){
 const top=Math.max(1,Math.min(TENNIS_COURTS.length,unlocked)),court=TENNIS_COURTS[level-1]??TENNIS_COURTS[0],best=stars[level-1]??0;
 const chip=(i:number)=>{const n=i+1,locked=n>top,c=TENNIS_COURTS[i];
  return <button key={c.name} type="button" className={styles.chip} data-court={n} data-hard={c.hard||undefined} aria-pressed={n===level} disabled={locked}
   aria-label={`Court ${n}, ${c.name}${locked?', locked: win the court before it':`, ${stars[i]??0} of 3 stars`}`} onClick={()=>onPick(n)}>
   <b>{n}</b>{locked?<i className={styles.lock}><Lock/></i>:<i className={styles.chipStars} aria-hidden="true">{tennisStarText(stars[i]??0)}</i>}</button>;};
 const hardFrom=TENNIS_COURTS.findIndex(c=>c.hard);
 return <div className={styles.picker} data-testid="tennis-court-picker">
  <div className={styles.row} role="group" aria-label="Courts">{TENNIS_COURTS.slice(0,hardFrom).map((_,i)=>chip(i))}</div>
  <div className={styles.row} role="group" aria-label="Hard courts"><span className={styles.hardTag}>HARD</span>{TENNIS_COURTS.slice(hardFrom).map((_,i)=>chip(hardFrom+i))}</div>
  <div className={styles.info} data-hard={court.hard||undefined}>
   <strong>{level}. {court.name}</strong>
   <span className={styles.rival}><b>{court.rival}</b> {court.habit}</span>
   <span className={styles.pills}>{tennisCourtPills(level).map(p=><em key={p}>{p}</em>)}<em className={styles.best} aria-label={`Best: ${best} of 3 stars`}>{tennisStarText(best)}</em></span>
  </div>
 </div>;
}

/** The touch guide + one line on how to earn the stars, shown behind the card's "How to play" chevron. */
export function TennisHowTo({level,touch,help}:{level:number;touch:boolean;help:string}){
 const court=TENNIS_COURTS[level-1]??TENNIS_COURTS[0];
 const guide=tennisCourtTouches(level).map(g=>touch||g.touch!=='aim'?g:{...g,when:g.when.replace('Push the stick','Hold ← or →')});
 return <div className={styles.how} data-testid="tennis-how-to">
  <p className={styles.lesson}>{court.lesson}</p>
  <ul className={styles.touches} aria-label={`Touches on court ${level}`}>
   {guide.map(g=><li key={g.touch} data-touch={g.touch}><b>{TOUCH_NAME[g.touch]}</b><span>{g.when}</span></li>)}
  </ul>
  <p className={styles.starsHow}>{court.style==='drill'?`Stars: hit ${TENNIS_DRILL.stars.join(' · ')} targets`:`★ win · ★ 4 perfect touches · ★ ${court.star3}`}</p>
  <small>{help}</small>
 </div>;
}
