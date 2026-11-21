'use client';
import {BoardDialog,BoardsPanel} from '../arcade/BoardsPanel';
import {BOARD_RULES} from '@/lib/arcade/leaderboard';
import styles from './SafeHandsGame.module.css';
/** Safe Hands' one all-time board in the shared board dialog; lazy, opened from the start and results cards. */
export default function SafeHandsScores({onClose}:{onClose:()=>void}){
 return <BoardDialog label="Safe Hands high scores" title="High scores" onClose={onClose}>
  <p data-board-learn className={styles.boardLearn}>{BOARD_RULES.safehands.learn}</p>
  <BoardsPanel game="safehands"/>
 </BoardDialog>;
}
