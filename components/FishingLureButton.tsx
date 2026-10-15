'use client';
/**
 * The lure button, its panel and the content toast (Oct 15 2026, docs/fishing.md "Content systems"), rendered inside the fishing
 * HUD by FishingHost.tsx. Event-driven (it re-renders on the fishing log and the view's phase, never per frame; no timers but the
 * toast's one timeout). Every lure is free and can be put on at any moment: it works from the next cast. The lure panel keeps each
 * lure's real football fact: that is the teaching hook. Kid-safe: no chances shown, no links.
 * This replaced FishingExtrasHud.tsx (lure / derby / photo / records / weather) on 15 Oct 2026: user decision, "too complicated".
 */
import {useEffect,useRef,useState} from 'react';
import styles from './FishingLureButton.module.css';
import {chooseLure,lastCatchEffects,useFishingLog} from '@/lib/town/fishing/fishingLogStore';
import {LURES,lureById} from '@/lib/town/fishing/lures';
import {fishById} from '@/lib/town/fishing/fishCatalog';
import {LEGEND_INFO,legendForSpot} from '@/lib/town/fishing/legendary';
import {FISH_REQUEST_COINS} from '@/lib/economy';

/** Oct 15 2026 (user: "fix the lure icon to be more centered and make sure the size is similar to other action btns"): the hook's
 *  bounding box is centred in the 24-box (eye top right at x 16.5, bend down to x 5.5, barb), drawn bold like components/Icon.tsx. */
const HOOK='M16.5 5.2v8.3a5.3 5.3 0 0 1-10.6 0v-2.9 M5.9 12.4l-1.9-2 M5.9 12.4l1.9-2 M16.5 5.2a1.9 1.9 0 1 0 0-.1';
const Svg=({d,size=26}:{d:string;size?:number})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d}/></svg>;

/** The round lure button (bottom right of the HUD; the island action size) and its panel above it. */
export function FishingLureButton({className}:{className:string}){
 const log=useFishingLog();const [open,setOpen]=useState(false);
 const lure=log.lure?lureById(log.lure):undefined;
 return <>
  <button type="button" className={`${className} ${styles.lure}`} data-fish-lure aria-label={lure?`Lure: ${lure.short}`:'Choose a lure'} title={lure?`Lure: ${lure.name}`:'Choose a lure'} aria-expanded={open} data-on={!!lure||undefined} style={lure?{'--lure':lure.color} as React.CSSProperties:undefined} onClick={()=>setOpen(v=>!v)}><Svg d={HOOK} size={32}/></button>{/* Oct 15 2026 (user): icon only, 28 px like the Fishbook button; the chosen lure shows as the button's tint, its name in the panel and the aria-label. */}
  {open&&<section className={styles.panel} aria-label="Lures" data-lure-panel>
   <h3>Lures</h3><p className={styles.note}>A lure changes which kinds of animal come, never how rare they are. Pick one for your next cast.</p>
   <ul className={styles.lures}>
    <li><button type="button" aria-pressed={!log.lure} data-lure="none" onClick={()=>{chooseLure(null);setOpen(false);}}><b>No lure</b><span>Any fish at this spot.</span></button></li>
    {LURES.map(l=><li key={l.id}><button type="button" aria-pressed={log.lure===l.id} data-lure={l.id} onClick={()=>{chooseLure(l.id);setOpen(false);}} style={{'--lure':l.color} as React.CSSProperties}>
     <b><i aria-hidden="true"/>{l.name}</b><span>{l.effect}</span><small className={styles.fact}><span>Real football fact</span>{l.fact}</small></button></li>)}
   </ul>
  </section>}
 </>;
}

/** One short toast for what a catch did (a request finished, a reward, a legend's clue, a legend released). It waits while the
 *  catch card is up (`cardUp`), then shows for 6 s. */
export function FishingCatchToast({cardUp}:{cardUp:boolean}){
 useFishingLog();
 const effects=lastCatchEffects(),seen=useRef(0);const [toast,setToast]=useState<{text:string;key:number}|null>(null);
 useEffect(()=>{if(!effects||effects.key===seen.current)return;seen.current=effects.key;const e=effects.effects,parts:string[]=[];
  if(e.legend){const f=fishById(effects.id);parts.push(`Released! ${f?.name??'The legend'} swims free again. It is on your Fishbook trophy page.`);}
  for(const q of e.requestsDone)parts.push(`${q.who}: ${q.thanks} +${FISH_REQUEST_COINS} coins`);
  for(const u of e.unlocked)parts.push(`You earned the ${u}!`);
  for(const s of e.newClues){const L=legendForSpot(s);if(L)parts.push(`Legend clue: ${LEGEND_INFO[L.id].clue}`);}
  if(parts.length)setToast({text:parts.join(' '),key:effects.key});
 },[effects]);
 useEffect(()=>{if(!toast||cardUp)return;const t=setTimeout(()=>setToast(null),6000);return()=>clearTimeout(t);},[toast?.key,cardUp]);// eslint-disable-line react-hooks/exhaustive-deps
 if(!toast||cardUp)return null;
 return <p className={styles.toast} key={toast.key} role="status" data-fish-toast>{toast.text}</p>;
}
