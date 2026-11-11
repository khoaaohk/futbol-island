'use client';
import {BoardDialog,BoardsPanel} from '../arcade/BoardsPanel';
import {BOARD_RULES} from '@/lib/arcade/leaderboard';
import styles from './AirFutbolGame.module.css';
/** Air Futbol's one board (the solo run against the machine) in the shared board dialog; lazy, opened from the start and results cards.
 *  Two-player matches never post here. */
export default function AirFutbolScores({onClose}:{onClose:()=>void}){
 return <BoardDialog label="Air Futbol high scores" title="High scores" onClose={onClose}>
  <p data-board-learn className={styles.boardLearn}>{BOARD_RULES.airhockey.learn}</p>
  <BoardsPanel game="airhockey"/>
 </BoardDialog>;
}
