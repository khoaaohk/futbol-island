'use client';
import {BoardDialog,BoardsPanel} from '../arcade/BoardsPanel';
import {BOARD_RULES} from '@/lib/arcade/leaderboard';
import styles from './RollBallGame.module.css';
/** Roll It In's one all-time board in the shared board dialog; lazy, opened from the start and results cards. */
export default function RollBallScores({onClose}:{onClose:()=>void}){
 return <BoardDialog label="Roll It In high scores" title="High scores" onClose={onClose}>
  <p data-board-learn className={styles.boardLearn}>{BOARD_RULES.rollball.learn}</p>
  <BoardsPanel game="rollball"/>
 </BoardDialog>;
}
