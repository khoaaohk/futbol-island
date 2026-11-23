'use client';
import {useEffect,useState} from 'react';
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
 /* the coach app's language (round 4A, UX audit C9): ?lang=es from the coach app; the header follows it (the board itself has no
    Spanish words yet) */
 const [lang,setLang]=useState<'en'|'es'>('en');
 useEffect(()=>{noteAppEntry('board');try{if(new URLSearchParams(location.search).get('lang')==='es'){setLang('es');document.documentElement.lang='es';}}catch{/* none */}},[]);
 return <div className={web.web} data-board-app="" translate="no">
  <h1 className={web.srOnly}>{lang==='es'?'Pizarra táctica':'Tactics board'}</h1>
  <AppHeader lang={lang} title={lang==='es'?'Pizarra táctica':'Tactics board'} sub="Futbol Island" exitAria="" exit={false}
   left={<HeaderGoldBack lang={lang} onBack={()=>{window.location.assign(miniBackHref(lang,lang==='es'?'/es/tools/soccer-tactics-board':'/tools/soccer-tactics-board'));}} data={{'data-board-coach':''}}/>}/>
  <div style={{position:'relative',flex:1,minHeight:0}}><div className={s.fullscreen} style={{position:'absolute'}}><TacticsBoard/></div></div>
 </div>;
}
