'use client';
import {useEffect,useRef,useState} from 'react';
import {BOARD_RULES,type BoardGame,type BoardRow} from '@/lib/arcade/leaderboard';
import {BoardIcon,boardIconLabel} from './BoardIcon';
import styles from './Leaderboard.module.css';

/** Rows the board area shows at once (owner, Nov 17 2026: "show top 5 and then scroll to see more"); the rest scroll inside it. */
export const BOARD_VISIBLE_ROWS=5;
/**
 * One board: rank, picture, three letters, score. `mine` rows get a YOU tag; `fresh` is the entry just posted.
 * Nov 17 2026: the list sits in a scroll area exactly BOARD_VISIBLE_ROWS rows tall (Leaderboard.module.css .scroller). It is
 * focusable (arrow keys / Page Down scroll it), a fade at its foot shows more rows wait below and goes once the end is reached,
 * and the fresh row is scrolled into view inside the area only (the dialog itself never jumps).
 */
export function BoardTable({game,rows,mine,fresh,empty}:{game:BoardGame;rows:(BoardRow&{key:string})[];mine?:(r:BoardRow&{key:string})=>boolean;fresh?:string|null;empty:string}){
 const box=useRef<HTMLDivElement>(null),[end,setEnd]=useState(true);
 const more=rows.length>BOARD_VISIBLE_ROWS;
 const measure=()=>{const b=box.current;if(b)setEnd(b.scrollTop+b.clientHeight>=b.scrollHeight-2);};
 useEffect(()=>{const b=box.current;if(!b)return;
  // Exactly five rows tall, measured (the CSS max-height is the fallback before this runs).
  const fifth=b.querySelectorAll<HTMLElement>('li')[BOARD_VISIBLE_ROWS-1];b.style.maxHeight=more&&fifth?`${fifth.offsetTop+fifth.offsetHeight}px`:'';
  const li=fresh?b.querySelector<HTMLElement>('[data-new]'):null;
  if(li)b.scrollTop=Math.max(0,li.offsetTop-(b.clientHeight-li.offsetHeight)/2);
  measure();
 },[fresh,rows.length,more]);
 if(!rows.length)return <p className={styles.empty} data-board-empty>{empty}</p>;
 const unit=BOARD_RULES[game].unit;
 return <div className={styles.scrollWrap} data-board-more={more&&!end||undefined}>
  <div ref={box} className={styles.scroller} data-board-scroll tabIndex={more?0:undefined} role={more?'region':undefined} aria-label={more?`Top ${rows.length}. Scroll for more.`:undefined} onScroll={measure}>
  <ol className={styles.rows} data-board-rows aria-label={`Top ${rows.length}, ${unit}`}>{rows.map((r,i)=>{const own=mine?.(r)??false,now=fresh===r.key;
  return <li key={r.key} data-rank={i+1} data-mine={own||undefined} data-new={now||undefined} aria-current={now?'true':undefined}>
   <span className={styles.rank} data-board-rank>#{i+1}</span><span className={styles.pic} data-board-pic>{r.icon&&<BoardIcon id={r.icon} size={24} label={boardIconLabel(r.icon)}/>}</span>
   <span className={styles.who} data-board-who aria-label={r.initials.split('').join(' ')}>{r.initials}{own&&<b className={styles.you} data-board-you>YOU</b>}</span>
   <span className={styles.pts} data-board-pts>{r.score.toLocaleString('en-US')}</span></li>;})}</ol>
  </div>
  {more&&<p className={styles.moreHint} data-board-hint aria-hidden="true">{end?`That’s all ${rows.length}`:'Scroll for more ↓'}</p>}
 </div>;
}
