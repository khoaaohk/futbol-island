'use client';
import {BoardDialog,BoardsPanel} from '../arcade/BoardsPanel';
import {BOARD_RULES} from '@/lib/arcade/leaderboard';
import styles from './TrophyDropGame.module.css';
/** Trophy Drop's one all-time board in the shared board dialog; lazy, opened from the start and results cards. */
export default function TrophyDropScores({onClose}:{onClose:()=>void}){
 return <BoardDialog label="Trophy Drop high scores" title="High scores" onClose={onClose}>
  <p data-board-learn className={styles.boardLearn}>{BOARD_RULES.trophydrop.learn}</p>
  <BoardsPanel game="trophydrop"/>
 </BoardDialog>;
}
