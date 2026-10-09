'use client';
import type React from 'react';
import PlayerArt,{PlayerBackdrop,lookFor,photoFor,playerMaskStyle} from './PlayerArt';
import {countryArt} from '@/lib/town/countryArt';
import {hasPlayFilm} from '@/lib/plays/riso/registry';
import {cardDisplayName,isCoachCard} from '@/lib/town/cardCollection';
import styles from './MiniCard.module.css';
import holoStyles from './HoloMiniFoil.module.css';
import {PATTERN_INTENSITY,miniPatternUrl,type HoloPattern,type HoloTier} from '@/lib/graphics/holoFoil/patterns';

const pad=(n:number)=>String(n).padStart(3,'0');
/** The riso halftone ink: the flag's strongest colour, never its white or black (same rule as PlayerArt). */
const toneInk=(country?:string)=>countryArt(country).flag.find(c=>c!=='#ffffff'&&c!=='#000000')??'#e9798b';

export type MiniCardProps={name:string;number:number;era:'current'|'allTime';
 /** Collected: the card face. Not collected: face-down with No. and "???" (or the name, when `revealName`). */
 got:boolean;revealName?:boolean;
 /** `stack`: the small top card of a pitch stack (window, rarity and trim only). */
 compact?:boolean;
 /** Compact face-down card that still shows its No. (the scattered table). */numbered?:boolean;
 /** Lightest face for the table (with `compact`): the flag colours behind a single riso ink layer; no backdrop SVG, no halftone tone pass. */thumb?:boolean;
 className?:string;style?:React.CSSProperties;
 /** Dev flag, OFF by default (card lab, Oct 8 2026): a static position-pattern foil whose colours slide on hover/press only
  *  (CSS mask + one transform transition; no WebGL, no loop). The live hosts pass miniFoil(name) (lib/town/cardFoil.ts). */
 foil?:{pattern:HoloPattern;tier:HoloTier;intensity?:number}|null};

/**
 * A lightweight mini version of PlayerCard for the collection: tan grain stock, Star (gold) or Legend (purple)
 * rarity, No., the picture window, the name plate, and the player's flag trim and stripe. Static by design (phone
 * heat): the window is the flat country backdrop (four SVG paths, no filters) plus the riso photo's two mask layers (both halves
 * of one packed file, PlayerArt's playerMaskStyle),
 * or the flat PlayerArt when there is no photo. No parallax, glare or animation.
 */
export default function MiniCard({name,number,era,got,revealName=false,compact=false,numbered=false,thumb=false,className='',style,foil=null}:MiniCardProps){
 const legend=era==='allTime';
 if(!got)return <span className={`${styles.card} ${styles.down} ${compact?styles.compact:''} ${numbered?styles.numbered:''} ${className}`} style={style} aria-hidden="true">
  <span className={styles.downNo}>No. {pad(number)}</span>
  <span className={styles.downMark}/>
  <span className={`${styles.downName} ${revealName?styles.revealed:''}`}><span>{revealName?name:'???'}</span></span>
 </span>;
 const {country}=lookFor(name),[f1,f2,f3]=countryArt(country).flag,photo=photoFor(name);
 const flag={'--flag1':f1,'--flag2':f2,'--flag3':f3,...style} as React.CSSProperties;
 return <span className={`${styles.card} ${legend?styles.legend:styles.star} ${compact?styles.compact:''} ${thumb&&photo?styles.thumb:''} ${className}`} style={flag} data-holo={foil?'':undefined} aria-hidden="true">
  <span className={styles.top}><span className={styles.rarity}>{legend?'Legend':isCoachCard(name)?'Coach':'Star'}</span><span className={styles.no}>No. {pad(number)}</span></span>
  <span className={styles.window}>
   {photo&&thumb?<span className={styles.photo}><span className={styles.paper}/><span className={styles.ink} style={playerMaskStyle(photo.slug)}/></span>
   :photo?<>
    <PlayerBackdrop name={name} className={styles.backdrop}/>
    <span className={styles.photo}>
     <span className={styles.paper}/>
     <span className={styles.tone} style={{background:toneInk(country),...playerMaskStyle(photo.slug)}}/>
     <span className={styles.ink} style={playerMaskStyle(photo.slug)}/>
    </span>
   </>:<PlayerArt name={name}/>}
  </span>
  <span className={styles.plate}><span>{cardDisplayName(name)}</span></span>
  <span className={styles.stripe}/>
  {foil&&<span className={holoStyles.foil} data-tier={foil.tier} style={{'--holo-mask':`url("${miniPatternUrl(foil.pattern,foil.tier)}")`,'--holo-k':foil.intensity??PATTERN_INTENSITY[foil.pattern]} as React.CSSProperties}/>}
  {foil?.tier==='icon'&&<span className={holoStyles.etch}/>}
  {hasPlayFilm(name)&&<span className={styles.film} title="Has a Play Moment"><svg viewBox="0 0 24 24"><path d="M12 2.6l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg></span>}
 </span>;
}

/** A plain card back, for the fanned cards under a stack's top card. `mystery`: the full-size face-down card with "No. ???" and
 *  "???" (the binder's uncollected card with nothing that could identify the player; the Pick a card deck). `children` sit on the
 *  card and turn with it (the deck's foil shine). */
export function CardBack({className='',style,mystery=false,children}:{className?:string;style?:React.CSSProperties;mystery?:boolean;children?:React.ReactNode}){
 if(mystery)return <span className={`${styles.card} ${styles.down} ${className}`} style={style} aria-hidden="true">
  <span className={styles.downNo}>No. ???</span><span className={styles.downMark}/><span className={styles.downName}><span>???</span></span>{children}
 </span>;
 return <span className={`${styles.card} ${styles.down} ${styles.compact} ${styles.plainBack} ${className}`} style={style} aria-hidden="true"><span className={styles.downMark}/>{children}</span>;
}
