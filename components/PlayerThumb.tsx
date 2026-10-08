'use client';
import PlayerArt,{lookFor,photoFor,playerMaskStyle} from './PlayerArt';
import {countryArt} from '@/lib/town/countryArt';
import styles from './PlayerThumb.module.css';

/** Flag white prints as island cream and flag black as deep ink, as on the cards. */
const paint=(c:string)=>c==='#ffffff'?'#fff1d3':c==='#000000'?'#26302c':c;
/** The riso halftone ink: the flag's strongest colour, never its white or black (same rule as the card). */
const toneInk=(flag:readonly string[])=>flag.find(c=>c!=='#ffffff'&&c!=='#000000')??'#e9798b';

/**
 * Small, static riso photo thumbnail for lists: the player's flag as simple bands, a cream paper arch, then
 * the card's two photo masks (flag-colour halftone + deep-green ink) zoomed to head and shoulders so the face
 * reads at 44–64 px. No animation, no SVG filters: three CSS layers. Falls back to the drawn avatar when the
 * player has no photo yet.
 */
export default function PlayerThumb({name,size=56,team='gold',className}:{name:string;size?:number;team?:'gold'|'blue';className?:string}){
 const photo=photoFor(name);
 if(!photo)return <PlayerArt name={name} team={team} size={size}/>;
 const flag=countryArt(lookFor(name).country).flag,[a,b,c]=flag.map(paint);
 // Two equal colours either side (e.g. Spain, Denmark) read as two bands; otherwise three.
 const bands=a===c?`linear-gradient(160deg,${a} 0 38%,${b} 38% 62%,${a} 62%)`:`linear-gradient(160deg,${a} 0 34%,${b} 34% 67%,${c} 67%)`;
 // Both layers use the one packed mask file; the .tone / .ink class picks its half.
 const mask=playerMaskStyle(photo.slug);
 return <span className={`${styles.thumb} ${className??''}`} style={{width:size,height:size,background:bands}} aria-hidden="true">
  <span className={styles.paper}/>
  <span className={`${styles.mask} ${styles.tone}`} style={{...mask,background:toneInk(flag)}}/>
  <span className={`${styles.mask} ${styles.ink}`} style={mask}/>
 </span>;
}
