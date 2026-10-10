'use client';
import {useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import dynamic from 'next/dynamic';
import {NavigationButton} from '../DoneButton';
import {warmGame} from './playLaunch';
import {enterGame} from '@/lib/rootView';
import {markHandoff} from './handoffMotion';
import styles from './Title.module.css';

/** The hand-off into the game's own loading screen (Handoff.tsx + handoff.ts): the title screen morphs into IslandLoading, then `/`
 *  switches to the game in place (enterGame), whose loader starts in the same state. */
const Handoff=dynamic(()=>import('./Handoff'),{ssr:false});
/** With the hand-off off: the game's normal loading screen, shown the moment Play is pressed (as before the hand-off work). */
const IslandLoading=dynamic(()=>import('../IslandLoading'),{ssr:false});
/** OFF (user, Oct 9 2026: "ignore the second loader for now"): Play switches `/` to the game (enterGame) with the game's normal loader.
 *  The morph-into-IslandLoading hand-off stays in Handoff.tsx / handoffMotion.ts for reuse. */
export const HANDOFF_ENABLED=false;

/**
 * Play: straight into the game, no code needed (a save code is optional and never blocks play). The shared NavigationButton keeps
 * its shrink-to-icon press (never `immediate`); reduced motion skips the shrink as it does everywhere.
 * `size`: 'bar' is the 76x44 navigation pill; 'hero' is the same button, wider and taller (the shared tokens, not a new style).
 */
export default function PlayButton({size='bar',label='Play',className=''}:{size?:'bar'|'hero';label?:string;className?:string}){
 const [launching,setLaunching]=useState(false);
 const warm=()=>warmGame();
 const style=size==='hero'?{'--navigation-width':'min(240px, 100%)','--btn-height':'56px'} as CSSProperties:undefined;
 return <>
  <NavigationButton label={label} data-landing-play={size} className={`${styles.play} ${size==='hero'?styles.playHero:''} ${className}`} style={style}
   onPointerEnter={warm} onFocus={warm} onTouchStart={warm}
   onNavigate={()=>{if(!HANDOFF_ENABLED){enterGame();return;}warm();markHandoff();setLaunching(true);}}/>
  {launching&&createPortal(HANDOFF_ENABLED?<Handoff onDone={enterGame}/>:<div className={styles.launch} data-landing-launch><IslandLoading/></div>,document.body)}
 </>;
}
