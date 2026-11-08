'use client';
import {useEffect,useRef,useState} from 'react';
import {BOARD_RULES,BOARD_TAB_ORDER,type BoardGame} from '@/lib/arcade/leaderboard';
import {BoardDialog,BoardsPanel} from './BoardsPanel';
import styles from './Leaderboard.module.css';

/**
 * The Hall of High Scores (lazy: loaded only when a Leaderboards button is tapped). One game's boards at a time, fetched when
 * that game is shown. Opened from the arcade room's header and from each game's start and full-time cards.
 * Nov 8 2026: tab order is BOARD_TAB_ORDER (each tier board right after its parent game), and the selected tab is scrolled
 * into view on open and on change (opening on Tennis or a tier board no longer hides the selected tab off the strip).
 */
export default function ArcadeBoards({game:initial,onClose}:{game?:BoardGame;onClose:()=>void}){
 const [game,setGame]=useState<BoardGame>(initial??'runner');
 const chips=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const tab=chips.current?.querySelector<HTMLElement>('[aria-selected="true"]');if(!tab)return;
  let reduced=false;try{reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{}
  tab.scrollIntoView({inline:'nearest',block:'nearest',behavior:reduced?'instant':'smooth'});
 },[game]);
 return <BoardDialog label="Hall of High Scores" title="High scores" onClose={onClose}>
  <div ref={chips} className={styles.chips} role="tablist" aria-label="Choose a game">{BOARD_TAB_ORDER.map(g=><button key={g} type="button" role="tab" className={styles.chip} aria-selected={g===game} onClick={()=>setGame(g)}>{BOARD_RULES[g].name}</button>)}</div>
  <p className={styles.learn}>{BOARD_RULES[game].learn} Scores are {BOARD_RULES[game].unit}.</p>
  <BoardsPanel game={game}/>
 </BoardDialog>;
}
