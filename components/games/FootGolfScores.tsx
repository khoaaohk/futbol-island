'use client';
import {BoardDialog,BoardsPanel} from '../arcade/BoardsPanel';
import {BOARD_RULES} from '@/lib/arcade/leaderboard';
import styles from './FootGolfGame.module.css';
/** FootGolf Island's one all-time board (the nine-hole round's points) in the shared board dialog; lazy, opened from the start and results cards. */
export default function FootGolfScores({onClose}:{onClose:()=>void}){
 return <BoardDialog label="FootGolf Island high scores" title="High scores" onClose={onClose}>
  <p data-board-learn className={styles.boardLearn}>{BOARD_RULES.footgolf.learn}</p>
  <BoardsPanel game="footgolf"/>
 </BoardDialog>;
}
