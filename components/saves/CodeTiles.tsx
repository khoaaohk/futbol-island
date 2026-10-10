'use client';
import {codeFromNormal,pictureFor} from '@/lib/saves/code';
import styles from './SaveCode.module.css';

/** The code as four tiles: three words, each with its small picture, then the number. `masked` hides all but the first word. */
export default function CodeTiles({code,masked=false,hint=-1}:{code:string;masked?:boolean;hint?:number}){
 const c=codeFromNormal(code);if(!c)return null;
 const label=masked?`Save code starting with ${c.words[0]}, the rest hidden`:`Save code: ${c.words.join(', ')}, ${c.number}`;
 return <div className={styles.tilesWrap}><div className={styles.tiles} role="img" aria-label={label} data-save-code={masked?undefined:code}>
  {c.words.map((w,i)=>{const hide=masked&&i>0;return <span key={i} className={`${styles.tile} ${hide?styles.hidden:''} ${hint===i?styles.hint:''}`} aria-hidden="true"><i>{hide?'':pictureFor(w)??''}</i><b>{hide?'•••':w}</b></span>;})}
  <span className={`${styles.tile} ${styles.number} ${masked?styles.hidden:''}`} aria-hidden="true"><i/><b>{masked?'•••':c.number}</b></span>
 </div></div>;
}
