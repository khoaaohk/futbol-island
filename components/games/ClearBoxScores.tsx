'use client';
import {BoardDialog,BoardsPanel} from '../arcade/BoardsPanel';
import {BOARD_RULES} from '@/lib/arcade/leaderboard';
import styles from './ClearBoxGame.module.css';
/** Clear the Box's one all-time board in the shared board dialog; lazy, opened from the start and results cards. */
export default function ClearBoxScores({onClose}:{onClose:()=>void}){
 return <BoardDialog label="Clear the Box high scores" title="High scores" onClose={onClose}>
  <p data-board-learn className={styles.boardLearn}>{BOARD_RULES.clearbox.learn}</p>
  <BoardsPanel game="clearbox"/>
 </BoardDialog>;
}
