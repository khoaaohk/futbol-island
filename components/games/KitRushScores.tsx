'use client';
import {useState} from 'react';
import {BoardDialog,BoardsPanel} from '../arcade/BoardsPanel';
import {BOARD_RULES,type BoardGame} from '@/lib/arcade/leaderboard';
import styles from './KitRushGame.module.css';
/** Kit Rush's two boards (endless and Daily Rush) in the shared board dialog; lazy, opened from the start and results cards. */
export default function KitRushScores({daily,onClose}:{daily:boolean;onClose:()=>void}){
 const [game,setGame]=useState<BoardGame>(daily?'kitdaily':'kitrush');
 return <BoardDialog label="Kit Rush high scores" title="High scores" onClose={onClose}>
  <div className={styles.boardTabs} role="tablist" aria-label="Kit Rush boards" data-board-games>{(['kitrush','kitdaily'] as const).map(g=><button key={g} type="button" role="tab" aria-selected={game===g} data-board-chip onClick={()=>setGame(g)}>{BOARD_RULES[g].name}</button>)}</div>
  <p data-board-learn className={styles.boardLearn}>{BOARD_RULES[game].learn}</p>
  <BoardsPanel game={game}/>
 </BoardDialog>;
}
