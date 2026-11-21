'use client';
import {BoardDialog,BoardsPanel} from '../arcade/BoardsPanel';
import {BOARD_RULES} from '@/lib/arcade/leaderboard';
import styles from './PopUpGame.module.css';
/** Pop-Up Shot's one all-time board in the shared board dialog; lazy, opened from the start and results cards. */
export default function PopUpScores({onClose}:{onClose:()=>void}){
 return <BoardDialog label="Pop-Up Shot high scores" title="High scores" onClose={onClose}>
  <p data-board-learn className={styles.boardLearn}>{BOARD_RULES.popup.learn}</p>
  <BoardsPanel game="popup"/>
 </BoardDialog>;
}
