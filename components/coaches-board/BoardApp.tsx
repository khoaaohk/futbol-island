'use client';
import TacticsBoard from './TacticsBoard';
import s from './TacticsBoard.module.css';
/**
 * /board (Nov 22 2026): the in-game tactics board on its own page, full screen. Back leaves for the board's guide page, or for the
 * coach app when it was opened from there (/board?from=coach). The board itself is untouched.
 */
export default function BoardApp(){
 const back=()=>{const from=new URLSearchParams(window.location.search).get('from');window.location.assign(from==='coach'?'/coach':'/tools/soccer-tactics-board');};
 return <div className={s.fullscreen} data-board-app=""><TacticsBoard onBack={back}/></div>;
}
