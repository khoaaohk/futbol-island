'use client';
import {useEffect,useRef,useState} from 'react';
import {BOARD_RULES,HALL_MACHINES,hallMachineOf,type BoardGame} from '@/lib/arcade/leaderboard';
import {BoardDialog,BoardsPanel} from './BoardsPanel';
import styles from './Leaderboard.module.css';

/**
 * The Hall of High Scores (lazy: loaded only when a Leaderboards button is tapped). One game's boards at a time, fetched when
 * that game is shown. Opened from the arcade room's header and from each game's start and full-time cards.
 * Nov 8 2026: tab order is BOARD_TAB_ORDER (each tier board right after its parent game), and the selected tab is scrolled
 * into view on open and on change (opening on Tennis or a tier board no longer hides the selected tab off the strip).
 */
export default function ArcadeBoards({game:initial,onClose}:{game?:BoardGame;onClose:()=>void}){
 const [game,setGame]=useState<BoardGame>(initial??HALL_MACHINES[0]);
 // Nov 10 2026 (owner): one chip per machine in the room; one board each.
 const machine=hallMachineOf(game);
 const chips=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const tabs=chips.current?.querySelectorAll<HTMLElement>('[aria-selected="true"]');if(!tabs?.length)return;
  let reduced=false;try{reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{}
  tabs.forEach(tab=>tab.scrollIntoView({inline:'nearest',block:'nearest',behavior:reduced?'instant':'smooth'}));
 },[game]);
 return <BoardDialog label="Hall of High Scores" title="High scores" onClose={onClose}>
  <div ref={chips}>
   {machine&&<div className={styles.chips} data-board-games role="tablist" aria-label="Choose a machine">{HALL_MACHINES.map(g=><button key={g} type="button" role="tab" className={styles.chip} data-board-chip aria-selected={g===machine} onClick={()=>setGame(g)}>{BOARD_RULES[g].name}</button>)}</div>}
   {/* Nov 11 2026 (owner: "keep it simple"): no row of mode boards. A card that opens the Hall on a mode board (after a Pro Cup or Daily run) shows that one board, named here; tapping the machine chip goes to its main board. */}
   {machine&&game!==machine&&<p className={styles.learn} data-board-mode>{BOARD_RULES[game].name}</p>}
  </div>
  <p className={styles.learn} data-board-learn>{BOARD_RULES[game].learn} Scores are {BOARD_RULES[game].unit}.</p>
  <BoardsPanel game={game}/>
 </BoardDialog>;
}
