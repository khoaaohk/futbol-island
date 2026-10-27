'use client';
import type {ReactNode} from 'react';
import {BackButton} from '../BackButton';
import {Icon} from '../Icon';
import styles from './ArcadeTopBar.module.css';

/** Two-sided score (Island Strikers): Gold n · clock · n Blue, all inside the one pill. */
export type ArcadeVersus={gold:number;blue:number;clock:string};

/**
 * The one arcade score bar (owner, Oct 27 2026: "match the score bar at the top for all the games… keep the bar simple as
 * possible"; docs/ARCADE_CHROME_OCT27.md). Back on the left, ONE centre pill (the primary value plus at most one short word,
 * or Strikers' Gold n · clock · n Blue), Pause on the right. Same height, radius, colours and safe-area insets in every game
 * and layout; no second detail line. `overlay` floats it over a full-screen canvas (ArcadeGame3D, Pass Puzzles); Strikers keeps
 * it in flow above the pitch. Static markup only: the one-shot score bump is a CSS keyframe on a value change, no loop.
 */
export function ArcadeTopBar({game,onBack,backTitle,value,word,versus,bumpKey,live=false,met,pillHidden,paused,canPause,onPause,pauseLabel='Pause game',resumeLabel='Resume game',overlay=true,className}:{
 game:string;onBack:()=>void;backTitle?:string;value?:ReactNode;word?:string;versus?:ArcadeVersus;bumpKey?:string|number;live?:boolean;met?:boolean;pillHidden?:boolean;
 paused:boolean;canPause:boolean;onPause:()=>void;pauseLabel?:string;resumeLabel?:string;overlay?:boolean;className?:string}){
 const label=paused?resumeLabel:pauseLabel;
 return <header className={`${styles.bar}${className?` ${className}`:''}`} data-arcade-bar={game} data-overlay={overlay||undefined}>
  <BackButton label="Arcade" title={backTitle} onBack={onBack}/>
  {versus?<p className={styles.pill} data-arcade-pill="versus" aria-label={`Gold ${versus.gold}, Blue ${versus.blue}, ${versus.clock}`}>
    <span>Gold</span><b key={'g'+versus.gold} className={styles.bump} data-side="gold">{versus.gold}</b><time>{versus.clock}</time><b key={'b'+versus.blue} className={styles.bump} data-side="blue">{versus.blue}</b><span>Blue</span>
   </p>
   :value!==undefined?<p className={styles.pill} data-arcade-pill="" aria-live={live?'polite':'off'} data-met={met||undefined} data-hidden={pillHidden||undefined}><b key={bumpKey} className={bumpKey!==undefined?styles.bump:undefined}>{value}</b>{word&&<span>{word}</span>}</p>
   :<span aria-hidden="true"/>}
  <button type="button" className={styles.pause} data-arcade-pause onClick={onPause} disabled={!canPause} aria-label={label} data-tip={paused?'Resume':'Pause'}><Icon name={paused?'play':'pause'} size={22}/></button>
 </header>;
}
