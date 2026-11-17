'use client';
import {useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {DoneButton} from '../DoneButton';
import {ownServerIds,type BoardGame} from '@/lib/arcade/leaderboard';
import {fetchIslandBoards,readLocalBoards,type IslandBoards} from '@/lib/arcade/boardClient';
import {BoardTable} from './BoardTable';
import styles from './Leaderboard.module.css';

/** The modal shell every board screen uses: top layer above the game canvas, Escape and backdrop close it, keys stay inside. */
export function BoardDialog({label,title,gold,closeLabel,onClose,children,onKeyDown}:{label:string;title:string;gold?:boolean;closeLabel?:string;onClose:()=>void;children:ReactNode;onKeyDown?:(e:React.KeyboardEvent<HTMLDialogElement>)=>void}){
 const dialog=useRef<HTMLDialogElement>(null),done=useRef<HTMLButtonElement>(null),closeRef=useRef(onClose);closeRef.current=onClose;
 useEffect(()=>{const restore=document.activeElement as HTMLElement|null;const d=dialog.current;try{if(d&&!d.open)d.showModal();}catch{d?.setAttribute('open','');}(d?.querySelector<HTMLElement>('[data-autofocus]')??done.current)?.focus({preventScroll:true});return()=>{try{d?.close();}catch{}restore?.focus?.({preventScroll:true});};},[]);
 // Keys and taps stay in the dialog: the game underneath listens on window (Escape leaves a game, Space kicks).
 return <dialog ref={dialog} className={styles.dialog} data-arcade-board={gold?'entry':'boards'} aria-label={label} onCancel={e=>{e.preventDefault();closeRef.current();}} onClick={e=>{if(e.target===e.currentTarget)closeRef.current();}}
  onKeyDown={e=>{e.stopPropagation();onKeyDown?.(e);}} onKeyUp={e=>e.stopPropagation()} onPointerDown={e=>e.stopPropagation()}>
  <header className={styles.head} data-board-head><h2 data-board-title data-gold={gold||undefined}>{title}</h2><DoneButton ref={done} label={closeLabel} onDone={()=>closeRef.current()}/></header>
  <div className={styles.body} data-board-body>{children}</div>
 </dialog>;
}

/**
 * Nov 17 2026 (owner: "for the high score only have all time. remove this week and device."): one board per game, the island
 * ALL-TIME board (up to 20 rows, five in view, the rest scroll), fetched when shown, never polled. No tab row. Scores still save
 * on the device silently (lib/arcade/boardClient.ts postScore); the device store only feeds the YOU tags here.
 * `fresh`: the island row just posted, highlighted gold and scrolled into view.
 */
export function BoardsPanel({game,island:given,fresh}:{game:BoardGame;island?:IslandBoards|null;fresh?:{id?:number}}){
 const [island,setIsland]=useState<IslandBoards|null|undefined>(given??undefined);
 useEffect(()=>{if(given){setIsland(given);return;}let live=true;setIsland(undefined);void fetchIslandBoards(game).then(v=>{if(live)setIsland(v);});return()=>{live=false;};},[game,given]);
 const mine=useMemo(()=>ownServerIds(readLocalBoards(),game),[game,fresh?.id]);// re-read after a save
 return <>
  {island===undefined?<p className={styles.empty} data-board-empty role="status">Loading the island board…</p>
   :island===null?<p className={styles.empty} data-board-empty>The island board can’t be reached right now. Your scores are still saved.</p>
   :<BoardTable game={game} rows={island.all.map(r=>({...r,key:'i'+r.id}))} mine={r=>r.id!==undefined&&mine.has(r.id)} fresh={fresh?.id?'i'+fresh.id:null}
     empty="No island scores yet. Be the first!"/>}
  {island&&<p className={styles.note} data-board-note>The best scores ever played on Futbol Island. Players show three letters only.</p>}
 </>;
}
