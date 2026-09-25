'use client';
import type React from 'react';
import PlayerArt,{PlayerBackdrop,lookFor,photoFor} from './PlayerArt';
import {countryArt} from '@/lib/town/countryArt';
import {hasPlayFilm} from '@/lib/plays/riso/registry';
import styles from './MiniCard.module.css';

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
 className?:string;style?:React.CSSProperties};

/**
 * A lightweight mini version of PlayerCard for the collection: tan grain stock, Star (gold) or Legend (purple)
 * rarity, No., the picture window, the name plate, and the player's flag trim and stripe. Static by design (phone
 * heat): the window is the flat country backdrop (four SVG paths, no filters) plus the riso photo's two mask layers,
 * or the flat PlayerArt when there is no photo. No parallax, glare or animation.
 */
export default function MiniCard({name,number,era,got,revealName=false,compact=false,numbered=false,thumb=false,className='',style}:MiniCardProps){
 const legend=era==='allTime';
 if(!got)return <span className={`${styles.card} ${styles.down} ${compact?styles.compact:''} ${numbered?styles.numbered:''} ${className}`} style={style} aria-hidden="true">
  <span className={styles.downNo}>No. {pad(number)}</span>
  <span className={styles.downMark}/>
  <span className={`${styles.downName} ${revealName?styles.revealed:''}`}><span>{revealName?name:'???'}</span></span>
 </span>;
 const {country}=lookFor(name),[f1,f2,f3]=countryArt(country).flag,photo=photoFor(name);
 const flag={'--flag1':f1,'--flag2':f2,'--flag3':f3,...style} as React.CSSProperties;
 return <span className={`${styles.card} ${legend?styles.legend:styles.star} ${compact?styles.compact:''} ${thumb&&photo?styles.thumb:''} ${className}`} style={flag} aria-hidden="true">
  <span className={styles.top}><span className={styles.rarity}>{legend?'Legend':'Star'}</span><span className={styles.no}>No. {pad(number)}</span></span>
  <span className={styles.window}>
   {photo&&thumb?<span className={styles.photo}><span className={styles.paper}/><span className={styles.ink} style={{WebkitMaskImage:`url(/players/${photo.slug}-ink.webp)`,maskImage:`url(/players/${photo.slug}-ink.webp)`}}/></span>
   :photo?<>
    <PlayerBackdrop name={name} className={styles.backdrop}/>
    <span className={styles.photo}>
     <span className={styles.paper}/>
     <span className={styles.tone} style={{background:toneInk(country),WebkitMaskImage:`url(/players/${photo.slug}-tone.webp)`,maskImage:`url(/players/${photo.slug}-tone.webp)`}}/>
     <span className={styles.ink} style={{WebkitMaskImage:`url(/players/${photo.slug}-ink.webp)`,maskImage:`url(/players/${photo.slug}-ink.webp)`}}/>
    </span>
   </>:<PlayerArt name={name}/>}
  </span>
  <span className={styles.plate}><span>{name}</span></span>
  <span className={styles.stripe}/>
  {hasPlayFilm(name)&&<span className={styles.film} title="Has a Play Moment"><svg viewBox="0 0 24 24"><path d="M12 2.6l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg></span>}
 </span>;
}

/** A plain card back, for the fanned cards under a stack's top card. */
export function CardBack({className='',style}:{className?:string;style?:React.CSSProperties}){
 return <span className={`${styles.card} ${styles.down} ${styles.compact} ${styles.plainBack} ${className}`} style={style} aria-hidden="true"><span className={styles.downMark}/></span>;
}
