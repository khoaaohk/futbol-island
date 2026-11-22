'use client';
import {useEffect} from 'react';
import TacticsBoard from './TacticsBoard';
import s from './TacticsBoard.module.css';
import {AppHeader,HeaderGoldBack} from '@/components/motion/AppHeader';
import {miniBackHref,noteAppEntry} from '@/components/motion/motion';
import web from './BoardWeb.module.css';
import '@/components/motion/motion.css';
/**
 * /board (Nov 22 2026): the in-game tactics board on its own page, full screen under the coach apps' shared header (owner: the
 * three coach apps look and behave the same): the gold Back on the left (the coach app's Home when it opened the board, else the
 * page the coach came from), the title centred, nothing on the right. The board itself is shared with the game and untouched: the
 * light chrome here is only a scope of its CSS variables (BoardWeb.module.css), and it gets no Back of its own.
 */
export default function BoardApp(){
 useEffect(()=>{noteAppEntry('board');},[]);
 return <div className={web.web} data-board-app="">
  <AppHeader lang="en" title="Tactics board" sub="Futbol Island" exitAria="" exit={false}
   left={<HeaderGoldBack lang="en" onBack={()=>{window.location.assign(miniBackHref('en','/tools/soccer-tactics-board'));}} data={{'data-board-coach':''}}/>}/>
  <div style={{position:'relative',flex:1,minHeight:0}}><div className={s.fullscreen} style={{position:'absolute'}}><TacticsBoard/></div></div>
 </div>;
}
