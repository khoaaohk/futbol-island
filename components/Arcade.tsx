'use client';
import {DoneButton} from './DoneButton';
import shell from './ModalShell.module.css';
import dynamic from 'next/dynamic';
import {useEffect,useRef,useState} from 'react';
import {Icon} from './Icon';
import styles from './Arcade.module.css';
const loading=()=> <div className={styles.loading} role="status">Getting your game ready…</div>;
const Pinball=dynamic(()=>import('./games/SoccerPinballGame'),{ssr:false,loading});
const Tennis=dynamic(()=>import('./games/SoccerTennisGame'),{ssr:false,loading});
const Runner=dynamic(()=>import('./games/BreakawayRun'),{ssr:false,loading});
type Game='pinball'|'tennis'|'runner';
export type ArcadeProps={open:boolean;onOpenChange:(open:boolean)=>void;onPlayLive:()=>void};
const cards=[{id:'live',title:'Live Match',tag:'PHONE CONTROLLER',description:'Scan the QR code, grab your phone and join a full football match.',icon:'people'},{id:'pinball',title:'Futbol Pinball',tag:'QUICK PLAY',description:'Work the flippers. Beat the keeper. Keep the ball in play.',icon:'ball'},{id:'tennis',title:'Futbol Tennis',tag:'ONE BOUNCE',description:'Find your angle and send it back over the net.',icon:'swap'},{id:'runner',title:'Breakaway Run',tag:'ISLAND RUNNER',description:'Dodge tackles, collect boosts and race through the open goal.',icon:'run'}] as const;
export default function Arcade({open,onOpenChange,onPlayLive}:ArcadeProps){
 const [game,setGame]=useState<Game|null>(null),dialog=useRef<HTMLDialogElement>(null),restore=useRef<HTMLElement|null>(null),close=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const el=dialog.current;if(!el)return;if(open&&!el.open){restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;el.showModal();close.current?.focus();}else if(!open){setGame(null);if(el.open){el.close();restore.current?.focus({preventScroll:true});}}},[open]);
 const back=()=>{setGame(null);requestAnimationFrame(()=>close.current?.focus({preventScroll:true}));};
 const GameComponent=game==='pinball'?Pinball:game==='tennis'?Tennis:Runner;
 return <dialog ref={dialog} className={`${styles.dialog} ${game?styles.playing:''}`} aria-labelledby="arcade-title" onCancel={event=>{event.preventDefault();if(game)back();else onOpenChange(false);}} onClick={event=>{if(!game&&event.target===event.currentTarget)onOpenChange(false);}} onKeyDown={event=>{if(!game)event.stopPropagation();}} onKeyUp={event=>{if(!game)event.stopPropagation();}}>
 {game?<div className={styles.gameHost}><h2 className={styles.srOnly} id="arcade-title">{cards.find(card=>card.id===game)?.title}</h2><GameComponent onExit={back}/></div>:<section className={`${styles.menu} ${shell.shell} `}><header className={shell.header}><div><h2 id="arcade-title">The Arcade</h2></div><DoneButton ref={close} onDone={()=>onOpenChange(false)}/></header><div className={shell.body}><p className={styles.intro}>A little competition. A lot of football.<br/>Pick a game and make yourself at home.</p><div className={styles.grid}>{cards.map(card=><button className={styles.card} key={card.id} onClick={()=>{if(card.id==='live')onPlayLive();else setGame(card.id);}}><div className={styles.art} data-game={card.id}><Icon name={card.icon} size={56}/><span>{card.tag}</span></div><div className={styles.copy}><h3>{card.title}</h3><p>{card.description}</p><strong>Play <Icon name="arrow" size={18}/></strong></div></button>)}</div><p className={styles.note}>All games are free. Come back anytime.</p></div></section>}
 </dialog>;
}
