'use client';
import {BoardDialog,BoardsPanel} from '../arcade/BoardsPanel';
import {BOARD_RULES} from '@/lib/arcade/leaderboard';
import styles from './LineUpGame.module.css';
/** Line Up!'s one all-time board in the shared board dialog; lazy, opened from the start and results cards. */
export default function LineUpScores({onClose}:{onClose:()=>void}){
 return <BoardDialog label="Line Up! high scores" title="High scores" onClose={onClose}>
  <p data-board-learn className={styles.boardLearn}>{BOARD_RULES.lineup.learn}</p>
  <BoardsPanel game="lineup"/>
 </BoardDialog>;
}
