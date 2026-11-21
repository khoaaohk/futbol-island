'use client';
import {BoardDialog,BoardsPanel} from '../arcade/BoardsPanel';
import {BOARD_RULES} from '@/lib/arcade/leaderboard';
import styles from './KeepyUppyGame.module.css';
/** Keepy-Uppy Beat's one all-time board in the shared board dialog; lazy, opened from the start and results cards. */
export default function KeepyUppyScores({onClose}:{onClose:()=>void}){
 return <BoardDialog label="Keepy-Uppy Beat high scores" title="High scores" onClose={onClose}>
  <p data-board-learn className={styles.boardLearn}>{BOARD_RULES.keepyuppy.learn}</p>
  <BoardsPanel game="keepyuppy"/>
 </BoardDialog>;
}
