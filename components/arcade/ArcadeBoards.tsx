'use client';
import {useState} from 'react';
import {BOARD_GAMES,BOARD_RULES,type BoardGame} from '@/lib/arcade/leaderboard';
import {BoardDialog,BoardsPanel} from './BoardsPanel';
import styles from './Leaderboard.module.css';

/**
 * The Hall of High Scores (lazy: loaded only when a Leaderboards button is tapped). One game's boards at a time, fetched when
 * that game is shown. Opened from the arcade room's header and from each game's start and full-time cards.
 */
export default function ArcadeBoards({game:initial,onClose}:{game?:BoardGame;onClose:()=>void}){
 const [game,setGame]=useState<BoardGame>(initial??'runner');
 return <BoardDialog label="Hall of High Scores" title="High scores" onClose={onClose}>
  <div className={styles.chips} role="tablist" aria-label="Choose a game">{BOARD_GAMES.map(g=><button key={g} type="button" role="tab" className={styles.chip} aria-selected={g===game} onClick={()=>setGame(g)}>{BOARD_RULES[g].name}</button>)}</div>
  <p className={styles.learn}>{BOARD_RULES[game].learn} Scores are {BOARD_RULES[game].unit}.</p>
  <BoardsPanel game={game}/>
 </BoardDialog>;
}
