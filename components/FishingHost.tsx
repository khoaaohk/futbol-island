'use client';
/**
 * Island glue for fishing + the market stand (docs/fishing.md).
 * Fishing plays LIVE in the 3D island (lib/town/fishing/fishingWorld.ts + fishingRig.ts): this component only renders the
 * world prompts, a minimal HUD (Reel + Back, a one-line hint, a small lesson toast, the in-world catch label that the
 * world positions each frame) and the lazily loaded Fishbook / market stand dialogs.
 * Other features can open the stand with `window.dispatchEvent(new CustomEvent(OPEN_MARKET_STAND))` (detail: {tab}).
 */
import dynamic from 'next/dynamic';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {fishingSession} from '@/lib/town/fishing/fishingStore';
import {RARITY_LABEL,fishById} from '@/lib/town/fishing/fishCatalog';
import styles from './FishingHost.module.css';
import {BackButton} from './BackButton';
import {Icon} from './Icon';
const MarketStand=dynamic(()=>import('./MarketStand'),{ssr:false});
const Fishbook=dynamic(()=>import('./Fishbook'),{ssr:false});
export const OPEN_MARKET_STAND='fi2-open-market-stand';
type Tab='fish'|'produce'|'cards';
const useFishing=()=>useSyncExternalStore(fishingSession.subscribe,fishingSession.getView,fishingSession.getView);
const REEL_LABEL={ready:'Cast',casting:'Cast',floating:'Reel',approach:'Reel',nibble:'Reel',bite:'Hook!',reeling:'Reel',scared:'Wait…',escaped:'Wait…',caught:'Cast'} as const;

export default function FishingHost({onOpenChange,onDialogChange,paused=false}:{paused?:boolean;onOpenChange:(open:boolean)=>void;onDialogChange?:(open:boolean)=>void}){
 const view=useFishing();
 const back=useRef<HTMLButtonElement>(null);
 const [stand,setStand]=useState(false),[tab,setTab]=useState<Tab|undefined>(),[book,setBook]=useState(false),[loaded,setLoaded]=useState({stand:false,book:false});
 const [toast,setToast]=useState<{title:string;text:string;key:number}|null>(null),[expanded,setExpanded]=useState(false);
 // Card offers and other pop-ups wait while fishing, the Fishbook or the stand is open.
 useEffect(()=>{onOpenChange(view.active||stand||book);},[view.active,stand,book,onOpenChange]);
 // Only the dialogs pause the island; live fishing keeps the existing world loop running.
 useEffect(()=>{fishingSession.pause(stand||book||paused);onDialogChange?.(stand||book);return()=>fishingSession.pause(false);},[stand,book,paused,onDialogChange]);
 useEffect(()=>{const open=(e:Event)=>{setTab((e as CustomEvent<{tab?:Tab}>).detail?.tab);setLoaded(l=>({...l,stand:true}));setStand(true);};window.addEventListener(OPEN_MARKET_STAND,open);return()=>window.removeEventListener(OPEN_MARKET_STAND,open);},[]);
 // Lesson toast: one short line, gone after a few seconds (one timeout, no loop).
 // Lessons show only while waiting / nibbling / after a miss or the catch, never during the bite (the hint owns that moment).
 useEffect(()=>{if(!view.lesson)return;setToast(view.lesson);setExpanded(false);const t=setTimeout(()=>setToast(null),6500);return()=>clearTimeout(t);},[view.lesson]);
 useEffect(()=>{if(view.phase==='bite'||view.phase==='reeling'||view.phase==='casting')setToast(null);},[view.phase]);
 useEffect(()=>{if(!view.active)setToast(null);const app=document.querySelector('.town-app');if(!app)return;app.toggleAttribute('data-fishing',view.active);return()=>app.removeAttribute('data-fishing');},[view.active]);
 // Space / Enter = Reel, Escape = Back, a tap on the water = Reel. Captured first so Space doesn't also kick the ball.
 useEffect(()=>{
  if(!view.active||book||stand)return;
  const key=(e:KeyboardEvent)=>{const t=e.target;if(t instanceof Element&&t.closest('input,textarea,select,dialog,button:not([data-fish-reel])'))return;
   if(e.key===' '||e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();if(e.type==='keydown'&&!e.repeat)fishingSession.tap();}
   else if(e.key==='Escape'&&e.type==='keydown'){e.stopImmediatePropagation();back.current?.click();}};
  let down:{x:number;y:number}|null=null;
  const pdown=(e:PointerEvent)=>{down=e.target instanceof HTMLCanvasElement&&e.target.closest('.town-app')?{x:e.clientX,y:e.clientY}:null;};
  const pup=(e:PointerEvent)=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<12&&e.target instanceof HTMLCanvasElement)fishingSession.tap();down=null;};
  const cancel=()=>{down=null;};
  window.addEventListener('pointercancel',cancel,true);
  window.addEventListener('keydown',key,true);window.addEventListener('keyup',key,true);window.addEventListener('pointerdown',pdown,true);window.addEventListener('pointerup',pup,true);
  return()=>{window.removeEventListener('pointercancel',cancel,true);window.removeEventListener('keydown',key,true);window.removeEventListener('keyup',key,true);window.removeEventListener('pointerdown',pdown,true);window.removeEventListener('pointerup',pup,true);};
 },[view.active,book,stand]);
 const fish=view.caught?fishById(view.caught.id):undefined;
 const waiting=view.phase==='scared'||view.phase==='escaped'||view.phase==='casting';
 return <>
  <button type="button" className="store-enter-prompt" data-fish-enter aria-label="Fish" hidden onClick={e=>{const id=e.currentTarget.dataset.spot;if(id)fishingSession.start(id);}}>Fish</button>
  <button type="button" className="store-enter-prompt" data-market-enter aria-label="Sell at the market stand" hidden onClick={()=>{setTab(undefined);setLoaded(l=>({...l,stand:true}));setStand(true);}}>Sell</button>
  {/* In-world catch label: positioned above the held-up fish by fishingWorld.ts. */}
  <div className={styles.catch} data-fish-catch hidden aria-live="polite">{fish&&view.caught&&<>
   <p className={styles.catchTop}><b>{fish.name}</b>{view.caught.isNew&&<em>New!</em>}{view.caught.isBiggest&&<em>Biggest!</em>}</p>
   <p className={styles.catchMeta}>{RARITY_LABEL[fish.rarity]} · {view.caught.size} cm · {fish.price} coins{view.caught.inBasket?'':' · basket full'}</p>
   <p className={styles.catchClub}><span>Real football fact</span>{fish.club.name}{fish.club.nickname?` · “${fish.club.nickname}”`:''}</p>
   <p className={styles.catchFact}>{fish.club.fact}</p>
  </>}</div>
  {view.active&&<div className={styles.hud} data-fishing-hud data-phase={view.phase}>
   <div className={styles.back}><BackButton ref={back} data-fish-stop onBack={()=>fishingSession.stop()}/></div>
   <div className={styles.message} role="status" data-fishing-message>
    <p className={styles.messageTitle}>{view.hint}</p>
    {toast&&view.phase!=='caught'&&view.phase!=='bite'&&view.phase!=='reeling'&&<button type="button" key={toast.key} className={styles.messageLesson} data-fishing-lesson data-expanded={expanded} aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}><span>{toast.text}</span></button>}
   </div>
   <div className={styles.controls}>
    <button type="button" className={styles.book} aria-label="Fishbook" title="Fishbook" onClick={()=>{setLoaded(l=>({...l,book:true}));setBook(true);}}><Icon name="book" size={28}/></button>
    <button type="button" className={styles.reel} data-fish-reel data-phase={view.phase} aria-label={view.phase==='reeling'?'Tap to reel':REEL_LABEL[view.phase]} aria-disabled={waiting} onClick={()=>{if(!waiting)fishingSession.tap();}}>{REEL_LABEL[view.phase]}{view.phase==='reeling'&&<span className={styles.reelProgress} role="progressbar" aria-label="Fish reeled in" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(view.reelProgress*100)}><i style={{transform:`scaleX(${view.reelProgress})`}}/></span>}</button>
   </div>
  </div>}
  {loaded.book&&<Fishbook open={book} onClose={()=>setBook(false)}/>}
  {loaded.stand&&<MarketStand open={stand} initialTab={tab} onOpenChange={setStand}/>}
 </>;
}
