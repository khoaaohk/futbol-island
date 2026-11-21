'use client';
import {BoardDialog,BoardsPanel} from '../arcade/BoardsPanel';
import {BOARD_RULES} from '@/lib/arcade/leaderboard';
import styles from './FlickItGame.module.css';
/** Flick It's one all-time board (the Tour's total) in the shared board dialog; lazy, opened from the start and results cards. */
export default function FlickItScores({onClose}:{onClose:()=>void}){
 return <BoardDialog label="Flick It high scores" title="High scores" onClose={onClose}>
  <p data-board-learn className={styles.boardLearn}>{BOARD_RULES.flickit.learn}</p>
  <BoardsPanel game="flickit"/>
 </BoardDialog>;
}
