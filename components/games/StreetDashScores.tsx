'use client';
import {BoardDialog,BoardsPanel} from '../arcade/BoardsPanel';
import {BOARD_RULES} from '@/lib/arcade/leaderboard';
import styles from './StreetDashGame.module.css';
/** Street Dash's one all-time board in the shared board dialog; lazy, opened from the start and results cards. */
export default function StreetDashScores({onClose}:{onClose:()=>void}){
 return <BoardDialog label="Street Dash high scores" title="High scores" onClose={onClose}>
  <p data-board-learn className={styles.boardLearn}>{BOARD_RULES.streetdash.learn}</p>
  <BoardsPanel game="streetdash"/>
 </BoardDialog>;
}
