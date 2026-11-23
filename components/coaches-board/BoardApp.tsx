'use client';
import {useEffect,useState} from 'react';
import TacticsBoard from './TacticsBoard';
import s from './TacticsBoard.module.css';
import {AppHeader,HeaderGoldBack} from '@/components/motion/AppHeader';
import {goMiniBack,noteAppEntry} from '@/components/motion/motion';
import {BOARD_WORDS} from '@/lib/coach/lang/board';
import {isFormat,type Format} from '@/lib/coaches/board/types';
import web from './BoardWeb.module.css';
import {isAppLang,LOCALE,siteLang,type AppLang} from '@/lib/i18n/appLangs';
/** the board's name in the ten app languages (the coach app's `boardName`) */
const BOARD_TITLE:Readonly<Record<AppLang,string>>={en:'Tactics board',es:'Pizarra táctica',pt:'Prancheta tática',fr:'Tableau tactique',de:'Taktiktafel',
 it:'Lavagna tattica',nl:'Tactiekbord',pl:'Tablica taktyczna',fi:'Taktiikkataulu',ja:'作戦ボード'};
import '@/components/motion/motion.css';
/**
 * /board (Nov 22 2026): the in-game tactics board on its own page, full screen under the coach apps' shared header (owner: the
 * three coach apps look and behave the same): the gold Back on the left (the coach app's Home when it opened the board, else the
 * page the coach came from), the title centred, the board's Save on the right (Nov 23 2026; no "Futbol Island" line under the title). The board itself is shared with the game and untouched: the
 * light chrome here is only a scope of its CSS variables (BoardWeb.module.css), and it gets no Back of its own.
 */
export default function BoardApp(){
 /* the coach app's language (round 4A, UX audit C9; round 4E: all ten): ?lang= from the coach app; the header follows it (round 4G:
    the board's own words too, passed in; the game passes none and keeps English) */
 const [langQ,setLang]=useState<AppLang|null>(null),lang=langQ??'en';
 /* the header's right slot: the board puts its Save there (owner, Nov 23 2026: "move Save to the top right, opposite Back") */
 const [saveSlot,setSaveSlot]=useState<HTMLDivElement|null>(null);
 /* ?format= (Nov 23 2026): /board?format=8v8, and the coach app's "Show on the tactics board" opens its team's format */
 const [format,setFormat]=useState<Format|undefined>(undefined);
 useEffect(()=>{noteAppEntry('board');let l:AppLang='en';try{const sp=new URLSearchParams(location.search),q=sp.get('lang'),f=sp.get('format');if(isFormat(f))setFormat(f);if(isAppLang(q)&&q!=='en'){l=q;document.documentElement.lang=LOCALE[q];}}catch{/* none */}setLang(l);},[]);
 const title=BOARD_TITLE[lang],guide=siteLang(lang)==='es'?'/es/tools/soccer-tactics-board':'/tools/soccer-tactics-board';
 return <div className={web.web} data-board-app="" translate="no">
  <h1 className={web.srOnly}>{title}</h1>
  <AppHeader lang={lang} title={title} exitAria="" exit={false} right={<div ref={setSaveSlot} className={web.saveSlot} data-board-save-slot=""/>}
   left={<HeaderGoldBack lang={lang} onBack={()=>goMiniBack(lang,guide)} data={{'data-board-coach':''}}/>}/>
  <div style={{position:'relative',flex:1,minHeight:0}}><div className={s.fullscreen} style={{position:'absolute'}}>{/* the board mounts once the language is known, so a new play is named in it ("Mi jugada", not "My play") */}{langQ&&<TacticsBoard words={BOARD_WORDS[langQ]} saveSlot={saveSlot} format={format}/>}</div></div>
 </div>;
}
