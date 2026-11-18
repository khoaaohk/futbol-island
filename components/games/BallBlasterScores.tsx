'use client';
import {BoardDialog,BoardsPanel} from '../arcade/BoardsPanel';
import {BOARD_RULES} from '@/lib/arcade/leaderboard';
import styles from './BallBlasterGame.module.css';
/** Ball Blaster's one all-time board in the shared board dialog; lazy, opened from the start and results cards. */
export default function BallBlasterScores({onClose}:{onClose:()=>void}){
 return <BoardDialog label="Ball Blaster high scores" title="High scores" onClose={onClose}>
  <p data-board-learn className={styles.boardLearn}>{BOARD_RULES.ballblaster.learn}</p>
  <BoardsPanel game="ballblaster"/>
 </BoardDialog>;
}
