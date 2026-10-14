'use client';
import {useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {DoneButton} from '../DoneButton';
import {ownServerIds,type BoardGame} from '@/lib/arcade/leaderboard';
import {fetchIslandBoards,readLocalBoards,type IslandBoards} from '@/lib/arcade/boardClient';
import {BOARD_TABS,BoardTable,type BoardTab} from './BoardTable';
import styles from './Leaderboard.module.css';

/** The modal shell every board screen uses: top layer above the game canvas, Escape and backdrop close it, keys stay inside. */
export function BoardDialog({label,title,gold,closeLabel,onClose,children,onKeyDown}:{label:string;title:string;gold?:boolean;closeLabel?:string;onClose:()=>void;children:ReactNode;onKeyDown?:(e:React.KeyboardEvent<HTMLDialogElement>)=>void}){
 const dialog=useRef<HTMLDialogElement>(null),done=useRef<HTMLButtonElement>(null),closeRef=useRef(onClose);closeRef.current=onClose;
 useEffect(()=>{const restore=document.activeElement as HTMLElement|null;const d=dialog.current;try{if(d&&!d.open)d.showModal();}catch{d?.setAttribute('open','');}(d?.querySelector<HTMLElement>('[data-autofocus]')??done.current)?.focus({preventScroll:true});return()=>{try{d?.close();}catch{}restore?.focus?.({preventScroll:true});};},[]);
 // Keys and taps stay in the dialog: the game underneath listens on window (Escape leaves a game, Space kicks).
 return <dialog ref={dialog} className={styles.dialog} aria-label={label} onCancel={e=>{e.preventDefault();closeRef.current();}} onClick={e=>{if(e.target===e.currentTarget)closeRef.current();}}
  onKeyDown={e=>{e.stopPropagation();onKeyDown?.(e);}} onKeyUp={e=>e.stopPropagation()} onPointerDown={e=>e.stopPropagation()}>
  <header className={styles.head}><h2 data-gold={gold||undefined}>{title}</h2><DoneButton ref={done} label={closeLabel} onDone={()=>closeRef.current()}/></header>
  <div className={styles.body}>{children}</div>
 </dialog>;
}

/**
 * The three boards for one game: the island this week, the island all-time (fetched when shown, never polled) and this
 * device. `fresh`: the entry just saved (island row id and/or the device entry's seq), highlighted gold.
 */
export function BoardsPanel({game,tab:initialTab='week',island:given,fresh}:{game:BoardGame;tab?:BoardTab;island?:IslandBoards|null;fresh?:{id?:number;seq?:number}}){
 const [tab,setTab]=useState<BoardTab>(initialTab),[island,setIsland]=useState<IslandBoards|null|undefined>(given??undefined);
 useEffect(()=>{setTab(initialTab);},[game,initialTab]);
 useEffect(()=>{if(given){setIsland(given);return;}let live=true;setIsland(undefined);void fetchIslandBoards(game).then(v=>{if(live)setIsland(v);});return()=>{live=false;};},[game,given]);
 const local=useMemo(()=>readLocalBoards(),[game,fresh?.seq,fresh?.id]);// re-read after a save
 const mine=ownServerIds(local,game);
 const deviceRows=(local.boards[game]??[]).map(e=>({key:'d'+e.seq,initials:e.initials,icon:e.icon,score:e.score,day:e.day}));
 const islandRows=(tab==='all'?island?.all:island?.weekly)??[];
 return <>
  <div className={styles.tabs} role="tablist" aria-label="Which board">{BOARD_TABS.map(t=><button key={t.id} type="button" role="tab" className={styles.chip} aria-selected={tab===t.id} onClick={()=>setTab(t.id)}>{t.label}</button>)}</div>
  {tab==='device'?<BoardTable game={game} rows={deviceRows} fresh={fresh?.seq?'d'+fresh.seq:null} empty="No scores on this device yet. Play a game to start the board!"/>
   :island===undefined?<p className={styles.empty} role="status">Loading the island board…</p>
   :island===null?<p className={styles.empty}>The island board can’t be reached right now. Your scores still save on this device.</p>
   :<BoardTable game={game} rows={islandRows.map(r=>({...r,key:'i'+r.id}))} mine={r=>r.id!==undefined&&mine.has(r.id)} fresh={fresh?.id?'i'+fresh.id:null}
     empty={tab==='week'?'No island scores yet this week. Be the first!':'No island scores yet. Be the first!'}/>}
  {tab!=='device'&&island&&<p className={styles.note}>{tab==='week'?'The week board starts fresh every Monday.':'The best scores ever played on Futbol Island.'} Players show three letters only.</p>}
 </>;
}
