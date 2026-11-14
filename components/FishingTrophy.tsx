'use client';
/**
 * The trophy card (Nov 14 2026, docs/fishing.md "Bite cue, water and trophy moments"): after a Rare or Legendary catch's slow-motion
 * close-up (fishingSpectacle.ts CLOSEUP_S), a comic-print card in the arcade house style (components/games/comic) shows the fish
 * drawn large, its name, size and where it was caught, with "Save picture" (a PNG drawn on the client, lib/town/fishing/trophyImage.ts)
 * and "Keep fishing". Common and Good catches never see it (they keep the quick catch card). It waits for the close-up with a CSS
 * delay (none with reduced motion, which has no close-up) and never blocks the reel: closing it, or casting again, removes it.
 */
import {useEffect,useRef,useState} from 'react';
import FishArt from './FishArt';
import {ComicBurst,ComicButton,ComicCard,comicTokens} from './games/comic';
import type {FishSpecies} from '@/lib/town/fishing/fishCatalog';
import {saveTrophy,trophyWord,type TrophySpec} from '@/lib/town/fishing/trophyImage';
import comic from './games/comic/comic.module.css';
import styles from './FishingTrophy.module.css';

export default function FishingTrophy({fish,sizeCm,sizeText,spot,onClose}:{fish:FishSpecies;sizeCm:number;sizeText:string;spot:string;onClose:()=>void}){
 const art=useRef<HTMLDivElement>(null);
 const [busy,setBusy]=useState(false),[status,setStatus]=useState('');
 const legendary=fish.rarity==='legendary';
 const date=new Date().toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'});
 const spec:TrophySpec={fishName:fish.name,legendary,sizeCm,sizeText,spot,date};
 useEffect(()=>{const k=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.stopPropagation();onClose();}};window.addEventListener('keydown',k,true);return ()=>window.removeEventListener('keydown',k,true);},[onClose]);
 const save=async()=>{if(busy)return;setBusy(true);setStatus('Making your picture…');
  const r=await saveTrophy(spec,art.current?.querySelector('[data-trophy-art] svg')??null);setBusy(false);
  setStatus(r==='saved'?'Saved as a picture!':r==='shared'?'Shared!':r==='cancelled'?'':'That didn’t work this time. Try again.');};
 return <div className={`${comicTokens} ${styles.layer}`} data-fish-trophy data-rarity={fish.rarity}>
  <ComicCard label={`Trophy catch: ${fish.name}`} badge={legendary?'Legendary':'Rare'} badgeTone={legendary?'sun':'teal'} best={`${sizeCm} cm`} title={fish.name} wrapProps={{className:`${comic.cardWrap} ${styles.wrap}`}} className={`${comic.card} ${styles.card}`}>
   <div className={styles.art} ref={art} data-tone={legendary?'sun':'teal'}>
    <ComicBurst word={trophyWord(legendary)} className={styles.burst} size={24} tilt={-4} color="#f0452e"/>
    <span className={styles.fish} data-trophy-art><FishArt fish={fish} size={240}/></span>
   </div>
   <p className={styles.size}>{sizeText}</p>
   <p className={styles.where}>Caught at {spot} · {date}</p>
   <div className={styles.actions}>
    <ComicButton variant="primary" onClick={save} disabled={busy} data-trophy-save>Save picture</ComicButton>
    <ComicButton onClick={onClose} data-trophy-close>Keep fishing</ComicButton>
   </div>
   <p className={styles.status} role="status">{status}</p>
  </ComicCard>
 </div>;
}
