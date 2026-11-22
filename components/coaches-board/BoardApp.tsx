'use client';
import {useEffect,useState} from 'react';
import TacticsBoard from './TacticsBoard';
import s from './TacticsBoard.module.css';
import {AppHeader,HeaderBack} from '@/components/motion/AppHeader';
import {coachHref,noteAppEntry,openedFromCoach} from '@/components/motion/motion';
import '@/components/motion/motion.css';
/**
 * /board (Nov 22 2026): the in-game tactics board on its own page, full screen under the coach apps' shared header (owner: the
 * three coach apps look and behave the same): "Coach" on the left when the coach app opened it (?from=coach, remembered for the
 * session), the title centred, Exit on the right (back to the page the coach came from, else the tools hub). The board itself is
 * untouched; it simply gets no Back of its own.
 */
export default function BoardApp(){
 const [fromCoach,setFromCoach]=useState(false);
 useEffect(()=>{noteAppEntry('board');setFromCoach(openedFromCoach());},[]);
 return <div style={{position:'fixed',inset:0,zIndex:40,display:'flex',flexDirection:'column',background:'#fbf7ee'}} data-board-app="">
  <AppHeader lang="en" title="Tactics board" sub="Futbol Island" exitAria="Exit the coach app and go back to Futbol Island" exitData={{'data-board-exit':''}} exitHome="/tools/soccer-tactics-board"
   left={fromCoach?<HeaderBack label="Coach app Home" text="Home" onClick={()=>{window.location.assign(coachHref('en'));}} data={{'data-board-coach':''}}/>:null}/>
  <div style={{position:'relative',flex:1,minHeight:0}}><div className={s.fullscreen} style={{position:'absolute'}}><TacticsBoard/></div></div>
 </div>;
}
