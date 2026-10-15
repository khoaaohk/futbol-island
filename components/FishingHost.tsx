'use client';
/**
 * Island glue for fishing + the market stand (docs/fishing.md).
 * Fishing plays LIVE in the 3D island (lib/town/fishing/fishingWorld.ts + fishingRig.ts): this component only renders the
 * world prompts, a minimal HUD (Reel + Back, a one-line hint, a small lesson toast, the in-world catch label that the
 * world positions each frame) and the lazily loaded Fishbook / market stand dialogs.
 * Other features can open the stand with `window.dispatchEvent(new CustomEvent(OPEN_MARKET_STAND))` (detail: {tab, place}; place 'farm' = the Coral Cay farm stand, produce only).
 */
import dynamic from 'next/dynamic';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {fishSellValue} from '@/lib/economy';
import {fishingSession} from '@/lib/town/fishing/fishingStore';
import {RARITY_LABEL,KEEPER_LESSONS,fishById,spotById} from '@/lib/town/fishing/fishCatalog';
import {creditConceptTick} from '@/lib/learning/reviewStore';
import {conceptForFish} from '@/lib/learning/conceptMap';
import styles from './FishingHost.module.css';
import {BackButton} from './BackButton';
import {Icon} from './Icon';
const MarketStand=dynamic(()=>import('./MarketStand'),{ssr:false});
type Place='rosa'|'farm';
const Fishbook=dynamic(()=>import('./Fishbook'),{ssr:false});
export const OPEN_MARKET_STAND='fi2-open-market-stand';
type Tab='fish'|'produce'|'beach'|'cards';
const useFishing=()=>useSyncExternalStore(fishingSession.subscribe,fishingSession.getView,fishingSession.getView);
const REEL_LABEL={ready:'Cast',casting:'Cast',floating:'Reel',approach:'Reel',nibble:'Reel',bite:'Hook!',reeling:'Reel',scared:'Wait…',escaped:'Wait…',caught:'Cast'} as const;

export default function FishingHost({onOpenChange,onDialogChange,paused=false}:{paused?:boolean;onOpenChange:(open:boolean)=>void;onDialogChange?:(open:boolean)=>void}){
 const view=useFishing();
 const back=useRef<HTMLButtonElement>(null);
 const [stand,setStand]=useState(false),[tab,setTab]=useState<Tab|undefined>(),[place,setPlace]=useState<Place>('rosa'),[book,setBook]=useState(false),[loaded,setLoaded]=useState({stand:false,book:false});
 const [toast,setToast]=useState<{title:string;text:string;key:number}|null>(null),[expanded,setExpanded]=useState(false);
 // Card offers and other pop-ups wait while fishing, the Fishbook or the stand is open.
 useEffect(()=>{onOpenChange(view.active||stand||book);},[view.active,stand,book,onOpenChange]);
 // Only the dialogs pause the island; live fishing keeps the existing world loop running.
 useEffect(()=>{fishingSession.pause(stand||book||paused);onDialogChange?.(stand||book);return()=>fishingSession.pause(false);},[stand,book,paused,onDialogChange]);
 useEffect(()=>{const open=(e:Event)=>{const d=(e as CustomEvent<{tab?:Tab;place?:Place}>).detail;setPlace(d?.place==='farm'?'farm':'rosa');setTab(d?.tab);setLoaded(l=>({...l,stand:true}));setStand(true);};window.addEventListener(OPEN_MARKET_STAND,open);return()=>window.removeEventListener(OPEN_MARKET_STAND,open);},[]);
 // Lesson toast: one short line, gone after a few seconds (one timeout, no loop).
 // Lessons show only while waiting / nibbling / after a miss or the catch, never during the bite (the hint owns that moment).
 useEffect(()=>{if(!view.lesson)return;{const beat=Object.entries(KEEPER_LESSONS).find(([,l])=>l.title===view.lesson!.title)?.[0];if(beat)creditConceptTick(conceptForFish(beat),'fish:keeper');}/* Lane 3: keeper timing → the keeper lesson (once ever) */setToast(view.lesson);setExpanded(false);const t=setTimeout(()=>setToast(null),6500);return()=>clearTimeout(t);},[view.lesson]);
 useEffect(()=>{if(view.phase==='bite'||view.phase==='reeling'||view.phase==='casting')setToast(null);},[view.phase]);
 useEffect(()=>{if(!view.active)setToast(null);const app=document.querySelector('.town-app');if(!app)return;app.toggleAttribute('data-fishing',view.active);return()=>app.removeAttribute('data-fishing');},[view.active]);
 // Space / Enter = Reel, Escape = Back, a tap on the water = Reel. Captured first so Space doesn't also kick the ball.
 // Aimed casting (Oct 14 2026, lib/town/fishing/fishingAim.ts): while the line is in (Cast showing), a press on the water aims
 // at that point and letting go casts there (drag to move the dotted arc); a mouse hovering the water previews the aim; the
 // arrow keys turn and lengthen the aim, and holding Space throws farther (a quick tap is a quick cast). Fishing has the canvas
 // to itself (the joystick and touch controls are hidden while fishing), so the aim drag never fights them.
 const phaseRef=useRef(view.phase);phaseRef.current=view.phase;
 const keyAim=useRef({u:0,v:.75,space:0});
 useEffect(()=>{
  if(!view.active||book||stand)return;
  const castable=()=>phaseRef.current==='ready'||phaseRef.current==='caught';
  const ndc=(e:PointerEvent)=>{const r=(e.target as HTMLCanvasElement).getBoundingClientRect();return {kind:'screen' as const,x:(e.clientX-r.left)/r.width*2-1,y:1-(e.clientY-r.top)/r.height*2};};
  const key=(e:KeyboardEvent)=>{const t=e.target;if(t instanceof Element&&t.closest('input,textarea,select,dialog,button:not([data-fish-reel])'))return;
   const k=keyAim.current;
   if(castable()&&e.type==='keydown'&&/^Arrow(Left|Right|Up|Down)$/.test(e.key)){e.preventDefault();e.stopImmediatePropagation();
    if(e.key==='ArrowLeft')k.u=Math.max(-1,k.u-.2);else if(e.key==='ArrowRight')k.u=Math.min(1,k.u+.2);else if(e.key==='ArrowUp')k.v=Math.min(1,k.v+.15);else k.v=Math.max(0,k.v-.15);
    fishingSession.aim({kind:'polar',u:k.u,v:k.v});return;}
   if(e.key===' '||e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();
    if(castable()&&e.key===' '){// Hold Space for power along the current aim; a quick tap is a quick cast.
     if(e.type==='keydown'&&!e.repeat){k.space=performance.now();fishingSession.aim({kind:'polar',u:k.u,v:k.v,charge:k.space});}
     else if(e.type==='keyup'&&k.space){const held=performance.now()-k.space;k.space=0;if(held<200){fishingSession.aim(null);fishingSession.tap();}else fishingSession.castAimed();}
     return;}
    if(e.type==='keydown'&&!e.repeat)fishingSession.tap();}
   else if(e.key==='Escape'&&e.type==='keydown'){e.stopImmediatePropagation();back.current?.click();}};
  let down:{x:number;y:number;aim:boolean}|null=null;
  const onCanvas=(e:PointerEvent)=>e.target instanceof HTMLCanvasElement&&!!e.target.closest('.town-app');
  const pdown=(e:PointerEvent)=>{down=onCanvas(e)?{x:e.clientX,y:e.clientY,aim:castable()&&e.button<=0}:null;if(down?.aim)fishingSession.aim(ndc(e));};
  const pmove=(e:PointerEvent)=>{if(!onCanvas(e))return;
   if(down?.aim)fishingSession.aim(ndc(e));
   else if(!down&&e.pointerType==='mouse'&&castable())fishingSession.aim(ndc(e));};
  const pup=(e:PointerEvent)=>{const d=down;down=null;if(!d)return;
   if(d.aim){if(onCanvas(e)){fishingSession.aim(ndc(e));fishingSession.castAimed();}else fishingSession.aim(null);return;}
   if(Math.hypot(e.clientX-d.x,e.clientY-d.y)<12&&e.target instanceof HTMLCanvasElement)fishingSession.tap();};
  const leave=(e:PointerEvent)=>{if(e.pointerType==='mouse'&&!down)fishingSession.aim(null);};
  const cancel=()=>{if(down?.aim)fishingSession.aim(null);down=null;};
  window.addEventListener('pointercancel',cancel,true);
  window.addEventListener('keydown',key,true);window.addEventListener('keyup',key,true);window.addEventListener('pointerdown',pdown,true);window.addEventListener('pointerup',pup,true);window.addEventListener('pointermove',pmove,true);
  const canvas=document.querySelector('.town-app canvas');canvas?.addEventListener('pointerleave',leave as EventListener);
  return()=>{window.removeEventListener('pointercancel',cancel,true);window.removeEventListener('keydown',key,true);window.removeEventListener('keyup',key,true);window.removeEventListener('pointerdown',pdown,true);window.removeEventListener('pointerup',pup,true);window.removeEventListener('pointermove',pmove,true);canvas?.removeEventListener('pointerleave',leave as EventListener);fishingSession.aim(null);};
 },[view.active,book,stand]);
 // The Cast button: a tap is a quick cast; drag from it to aim (sideways turns, up throws farther, down shorter), let go to cast.
 const castDrag=useRef<{x:number;y:number;id:number;moved:boolean}|null>(null);
 const castDown=(e:React.PointerEvent<HTMLButtonElement>)=>{if(!(view.phase==='ready'||view.phase==='caught'))return;castDrag.current={x:e.clientX,y:e.clientY,id:e.pointerId,moved:false};try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* older browsers */}};
 const castMove=(e:React.PointerEvent<HTMLButtonElement>)=>{const d=castDrag.current;if(!d||d.id!==e.pointerId)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(!d.moved&&Math.hypot(dx,dy)<10)return;d.moved=true;
  fishingSession.aim({kind:'polar',u:Math.max(-1,Math.min(1,dx/110)),v:Math.max(0,Math.min(1,.75-dy/140))});};
 const castUp=(e:React.PointerEvent<HTMLButtonElement>)=>{const d=castDrag.current;if(!d||d.id!==e.pointerId)return;castDrag.current=null;if(d.moved){e.preventDefault();fishingSession.castAimed();suppressClick.current=true;}};
 const suppressClick=useRef(false);
 const fish=view.caught?fishById(view.caught.id):undefined;
 // Catches from the moored boat say where they came from (docs/fishing.md "Deep Sea Boat").
 const fromBoat=!!(view.spotId&&spotById(view.spotId)?.boat);
 // The catch card can be dismissed; a new catch (different fish or size) shows it again.
 const catchKey=view.caught?`${view.caught.id}-${view.caught.size}`:'';const [dismissed,setDismissed]=useState('');
 const waiting=view.phase==='scared'||view.phase==='escaped'||view.phase==='casting';
 return <>
  <button type="button" className="store-enter-prompt" data-fish-enter aria-label="Fish" hidden onClick={e=>{const id=e.currentTarget.dataset.spot;if(id)fishingSession.start(id);}}>Fish</button>
  <button type="button" className="store-enter-prompt" data-market-enter aria-label="Sell at the market stand" hidden onClick={()=>{setTab(undefined);setPlace('rosa');setLoaded(l=>({...l,stand:true}));setStand(true);}}>Sell</button>
  {/* In-world catch label: positioned above the held-up fish by fishingWorld.ts. */}
  <div className={styles.catch} data-fish-catch hidden aria-live="polite" data-dismissed={dismissed===catchKey&&catchKey?'':undefined}>{fish&&view.caught&&<>
   <button type="button" className={styles.catchClose} aria-label="Dismiss" onClick={()=>setDismissed(catchKey)}><span aria-hidden="true">×</span></button>
   <p className={styles.catchTop}><b>{fish.name}</b>{view.caught.isNew&&<em>New!</em>}{view.caught.isBiggest&&<em>Biggest!</em>}{fromBoat&&<em className={styles.catchWhere} data-fish-where>Deep sea boat</em>}</p>
   <p className={styles.catchMeta}>{RARITY_LABEL[fish.rarity]} · {view.caught.size} cm · {fishSellValue(fish)} coins{view.caught.inBasket?'':' · basket full'}</p>
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
    <button type="button" className={styles.reel} data-fish-reel data-phase={view.phase} data-pulling={view.pulling||undefined} aria-label={view.phase==='reeling'?'Tap to reel':REEL_LABEL[view.phase]} aria-disabled={waiting} onPointerDown={castDown} onPointerMove={castMove} onPointerUp={castUp} onPointerCancel={()=>{castDrag.current=null;fishingSession.aim(null);}} onClick={()=>{if(suppressClick.current){suppressClick.current=false;return;}if(!waiting)fishingSession.tap();}}>{view.phase==='reeling'&&view.pulling?'Pull!':REEL_LABEL[view.phase]}{view.phase==='reeling'&&<span className={styles.reelProgress} role="progressbar" aria-label="Reeled in" aria-valuemin={0} aria-valuemax={view.reelTarget} aria-valuenow={view.reelDone} aria-valuetext={`${view.reelDone} of ${view.reelTarget} pulls`} data-reel-meter style={{'--reel-steps':Math.max(1,view.reelTarget)} as React.CSSProperties}><i style={{transform:`scaleX(${view.reelProgress})`}}/>{/* One-shot flash per pull (polish, Oct 14 2026): re-keyed on each step, no loop. */}<b key={view.reelDone} className={styles.reelFlash} aria-hidden="true"/></span>}</button>
   </div>
  </div>}
  {loaded.book&&<Fishbook open={book} onClose={()=>setBook(false)}/>}
  {loaded.stand&&<MarketStand open={stand} initialTab={tab} place={place} onOpenChange={setStand}/>}
 </>;
}
