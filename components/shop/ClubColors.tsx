'use client';
import type {CSSProperties} from 'react';
import {CLUB_DEFAULT_CODE,CLUB_NO_BACKING,CLUB_PALETTE,bestClubCode,clubCode,clubColorsOf,clubHint,clubLuminance,clubReadabilityHex} from '@/lib/shop/dripKit';
import {countClubColor} from '@/lib/analytics/shopEvents';
import styles from './ClubColors.module.css';

/**
 * Drip FC art colours (Nov 15 2026, owner; lib/shop/dripKit.ts): the art colour and its backing for ONE placed piece, from the
 * club palette, plus "Club colours" (back to the club's own) and, when the pair would be hard to read on the item under it,
 * a gentle hint with "Best contrast". Nothing changes unless the player taps (owner: new pieces always start in club colours).
 * The studios pass their own swatch / chip classes so it matches each studio's step UI.
 */
export function ClubColors({title='Drip FC colours',code,under,itemWord,printed,printInk,onChange,swatchClass,lightClass,chipClass,paint}:{
 title?:string;
 /** The piece's code; undefined = club colours (a shirt print: the club's print, `printInk` straight on the shirt). */
 code:number|undefined;
 /** The item colours under the piece (boot zone, ball panels, shirt). */
 under:readonly string[];itemWord:string;
 /** A shirt print: backing is optional ("None" prints the art straight on). */
 printed?:boolean;printInk?:string;
 onChange:(code:number|undefined)=>void;
 swatchClass:string;lightClass?:string;chipClass:string;
 /** How the studio's swatch class takes its colour: background, or its CSS variable. */
 paint:'bg'|'--c'|'--sw';
}){
 const cur=code===undefined&&printed?{art:printInk??CLUB_PALETTE[2].hex,bg:null}:clubColorsOf(code);
 const c=code===undefined?(printed?undefined:CLUB_DEFAULT_CODE):code,artI=c===undefined?-1:c&15,bgI=c===undefined?CLUB_NO_BACKING:c>>4;
 const read=clubReadabilityHex(cur.art,cur.bg,under);
 const set=(next:number|undefined)=>{if(next===code)return;countClubColor();onChange(next===CLUB_DEFAULT_CODE&&!printed?undefined:next);};
 const style=(hex:string):CSSProperties=>(paint==='bg'?{background:hex}:{[paint]:hex}) as CSSProperties;
 const sw=(i:number,pressed:boolean,label:string,pick:()=>void)=>{const p=CLUB_PALETTE[i];
  return <button key={p.hex} type="button" className={`${swatchClass} ${lightClass&&clubLuminance(p.hex)>.55?lightClass:''}`} style={style(p.hex)} aria-pressed={pressed} aria-label={`${label}: ${p.name}`} title={p.name} onClick={pick}/>;};
 const artNow=artI>=0?artI:clubLuminance(cur.art)>.5?2:1;
 const isClub=code===undefined;
 return <div className={styles.box} role="group" aria-label={title}>
  <div className={styles.head}><span className={styles.title}>{title}</span>
   <button type="button" className={chipClass} aria-pressed={isClub} disabled={isClub} onClick={()=>set(undefined)}>Club colours</button></div>
  <div className={styles.row}><span className={styles.lab}>Art</span><div className={styles.sws}>
   {CLUB_PALETTE.map((_,i)=>sw(i,artI===i,'Art colour',()=>set(clubCode(i,bgI))))}</div></div>
  <div className={styles.row}><span className={styles.lab}>Background</span><div className={styles.sws}>
   {printed?<button type="button" className={`${chipClass} ${styles.none}`} aria-pressed={bgI===CLUB_NO_BACKING} onClick={()=>set(clubCode(artNow,CLUB_NO_BACKING))}>None</button>:null}
   {CLUB_PALETTE.map((_,i)=>sw(i,bgI===i,'Background colour',()=>set(clubCode(artNow===i?(i===2?0:2):artNow,i))))}</div></div>
  {read.ok?null:<p className={styles.hint} role="status"><span>{clubHint(read,itemWord)}</span>
   <button type="button" className={chipClass} onClick={()=>set(bestClubCode(under,printed&&bgI===CLUB_NO_BACKING))}>Best contrast</button></p>}
 </div>;
}
