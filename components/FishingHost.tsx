'use client';
/**
 * Island glue for fishing + the market stand (docs/fishing.md).
 * Fishing plays LIVE in the 3D island (lib/town/fishing/fishingWorld.ts + fishingRig.ts): this component only renders the
 * world prompts, a minimal HUD (Back, a one-line hint, a small lesson toast, the in-world catch label that the world positions
 * each frame, and the bottom row: Fishbook left, the big SPIN REEL in the centre, the lure right) and the lazily loaded Fishbook /
 * market stand dialogs.
 * 15 Oct 2026, the spin reel (user: "make it like Pokémon GO where they have to spin"): one big round control for the whole session.
 * It reads Cast (tap = quick cast, drag from it to aim), Wait…, Hook! (press hooks), and in the fight it is the reel: circle a
 * finger round its centre to wind in (the pointer handler turns angle deltas into a 0..1 spin rate, fishingSession.spin; the crank
 * follows the finger through one CSS variable, no React render per move), stop spinning when the fish runs, ease off in the red.
 * Space / Enter is a steady full spin. The tension arc and progress ring are CSS variables the world
 * writes (--tension / --progress). The derby, photo mode, the spot record boards and the weather were removed the same day (user:
 * "too complicated"); the swipe-to-turn steer went with the spin reel (a run now means "stop spinning and let it tire").
 * Other features can open the stand with `window.dispatchEvent(new CustomEvent(OPEN_MARKET_STAND))` (detail: {tab, place}; place 'farm' = the Coral Cay farm stand, produce only).
 */
import dynamic from 'next/dynamic';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {fishSellValue} from '@/lib/economy';
import {fishingSession,finishFishingTutorial,useFishingPrefs} from '@/lib/town/fishing/fishingStore';
import {sizeCompare} from '@/lib/town/fishing/fishingCard';
import {FULL_SPIN_S} from '@/lib/town/fishing/fishingFight';
import {RarityStars} from './RarityStars';
import {FishingTutorial,GhostHand,tutorialStep} from './FishingTutorial';
import {LEGEND_INFO,isLegendId} from '@/lib/town/fishing/legendary';
import {fishingCosmetics,useFishingLog} from '@/lib/town/fishing/fishingLogStore';
import {lureById} from '@/lib/town/fishing/lures';
import {FLOAT_SKINS} from '@/lib/town/fishing/fishingLog';
import {moodParams} from '@/lib/town/fishing/waterMood';
import {readTimeOfDay} from '@/lib/town/fishing/timeOfDay';
import {RARITY_LABEL,KEEPER_LESSONS,fishById,spotById} from '@/lib/town/fishing/fishCatalog';
import {creditConceptTick} from '@/lib/learning/reviewStore';
import {conceptForFish} from '@/lib/learning/conceptMap';
import styles from './FishingHost.module.css';
import {BackButton} from './BackButton';
import {Icon} from './Icon';
import {FishingCatchToast,FishingLureButton} from './FishingLureButton';
import {countFishbookOpen} from '@/lib/analytics/fishingEvents';
const MarketStand=dynamic(()=>import('./MarketStand'),{ssr:false});
type Place='rosa'|'farm';
const Fishbook=dynamic(()=>import('./Fishbook'),{ssr:false});
export const OPEN_MARKET_STAND='fi2-open-market-stand';
type Tab='fish'|'produce'|'beach'|'cards';
const useFishing=()=>useSyncExternalStore(fishingSession.subscribe,fishingSession.getView,fishingSession.getView);
/** The chosen float / rod (Fishbook rewards) and the float's glow after dark (the night water mood), set as a session starts (looks only). */
function pushLook(){try{const c=fishingCosmetics();fishingSession.setLook({floatColor:lureById(c.lure)?.color??(c.float==='classic'?null:FLOAT_SKINS[c.float]?.color??null),goldenRod:c.rod==='golden',floatGlow:moodParams(readTimeOfDay()).floatGlow});}catch{/* looks only */}}
const REEL_LABEL={ready:'Cast',casting:'Cast',floating:'Reel',approach:'Reel',nibble:'Reel',bite:'Hook!',reeling:'Reel',scared:'Wait…',escaped:'Wait…',caught:'Cast'} as const;
/** A full spin, in radians a second (one revolution per FULL_SPIN_S); the pointer's angular speed is measured against it. */
const FULL_SPIN=Math.PI*2/FULL_SPIN_S;
/** The finger must be this far from the reel's centre for its angle to mean anything. */
const SPIN_DEADZONE=10;
type Spin={id:number;cx:number;cy:number;a:number;t:number;rate:number};
/** Wrap an angle delta into (-π, π]. */
const wrap=(d:number)=>d>Math.PI?d-Math.PI*2:d< -Math.PI?d+Math.PI*2:d;

/** The drawn reel: a spool with a long crank whose arm and knob turn with the finger (`--spin`, set on the crank group by the pointer
 *  handler and on the reel). The whir (Oct 15 2026) is CSS only: the spool's wound line turns with the crank and two offset copies
 *  streak it as `--spin-rate` rises, three ghost knobs lag the real one by fixed angles on the `--spin-dir` side, a thin tick ring near
 *  the rim appears above ~60 % rate and the hub ring counter-rotates at half speed. Nothing shows at rest; reduced motion keeps the crank only. */
function ReelArt({crank}:{crank:React.RefObject<SVGGElement>}){
 return <svg className={styles.reelArt} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
  <circle cx="50" cy="50" r="41" className={styles.spoolRim}/>
  <circle cx="50" cy="50" r="33" className={styles.spoolFace}/>
  <g className={styles.spoolTurn}>
   <circle cx="50" cy="50" r="24" className={styles.spoolLine}/>
   <circle cx="50" cy="50" r="24" className={`${styles.spoolLine} ${styles.spoolGhost}`}/>
   <circle cx="50" cy="50" r="24" className={`${styles.spoolLine} ${styles.spoolGhost}`}/>
   <circle cx="50" cy="50" r="37.5" className={styles.whir}/>
   <circle cx="50" cy="50" r="37.5" className={`${styles.whir} ${styles.whirGhost}`}/>
  </g>
  <g className={styles.ghosts}>
   <g className={styles.ghost}><line x1="50" y1="34" x2="50" y2="8" className={styles.ghostArm}/><circle cx="50" cy="4" r="9" className={styles.ghostKnob}/></g>
   <g className={styles.ghost}><line x1="50" y1="34" x2="50" y2="8" className={styles.ghostArm}/><circle cx="50" cy="4" r="9" className={styles.ghostKnob}/></g>
   <g className={styles.ghost}><line x1="50" y1="26" x2="50" y2="8" className={styles.ghostArm}/><circle cx="50" cy="4" r="9" className={styles.ghostKnob}/></g>
  </g>
  <g ref={crank} className={styles.crank}>
   <line x1="50" y1="50" x2="50" y2="60" className={styles.crankStub}/>
   <circle cx="50" cy="61.5" r="4" className={styles.crankWeight}/>
   <line x1="50" y1="50" x2="50" y2="8" className={styles.crankArm}/>
   <line x1="48.6" y1="44" x2="48.6" y2="12" className={styles.crankShine}/>
   <circle cx="50" cy="4" r="9" className={styles.crankKnob}/>
   <circle cx="47" cy="1" r="3" className={styles.knobShine}/>
  </g>
  <circle cx="50" cy="50" r="11" className={styles.hubRing}/>
  <circle cx="50" cy="50" r="7" className={styles.hub}/>
 </svg>;
}

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
 // Space / Enter = the reel, Escape = Back, a tap on the water = the reel. Captured first so Space doesn't also kick the ball.
 // Aimed casting (Oct 14 2026, lib/town/fishing/fishingAim.ts): while the line is in (Cast showing), a press on the water aims
 // at that point and letting go casts there (drag to move the dotted arc); a mouse hovering the water previews the aim; the
 // arrow keys turn and lengthen the aim, and holding Space throws farther (a quick tap is a quick cast). Fishing has the canvas
 // to itself (the joystick and touch controls are hidden while fishing), so the aim drag never fights them.
 const phaseRef=useRef(view.phase);phaseRef.current=view.phase;
 const keyAim=useRef({u:0,v:.75,space:0});
 const fightRef=useRef(false);fightRef.current=view.phase==='reeling'&&view.fight;
 const reelEl=useRef<HTMLButtonElement>(null),crank=useRef<SVGGElement>(null),spin=useRef<Spin|null>(null),turn=useRef(0);const trailIdle=useRef(0);
 const prefs=useFishingPrefs(),lureNow=useFishingLog().lure;
 // The float takes the chosen lure's colour: a lure picked mid-session recolours it within a frame (setLook bumps lookRev).
 useEffect(()=>{if(view.active)pushLook();},[lureNow,view.active]);
 /** Space / Enter held = a steady full spin (the crank turns by CSS while the key is down; no render). */
 const keySpin=(on:boolean)=>{fishingSession.hold(on);reelEl.current?.toggleAttribute('data-key-spin',on);};
 // Leaving the fight (landed, escaped, Back) lets go of any held input.
 useEffect(()=>{if(view.phase!=='reeling'){spin.current=null;fishingSession.spinEnd();keySpin(false);}},[view.phase]);
 useEffect(()=>{
  if(!view.active||book||stand)return;
  const castable=()=>phaseRef.current==='ready'||phaseRef.current==='caught';
  const ndc=(e:PointerEvent)=>{const r=(e.target as HTMLCanvasElement).getBoundingClientRect();return {kind:'screen' as const,x:(e.clientX-r.left)/r.width*2-1,y:1-(e.clientY-r.top)/r.height*2};};
  const key=(e:KeyboardEvent)=>{const t=e.target;if(t instanceof Element&&t.closest('input,textarea,select,dialog,button:not([data-fish-reel])'))return;
   const k=keyAim.current;
   // The fight: hold Space / Enter for a steady full-rate spin. The hook's keydown keeps spinning until the key comes up.
   if(fightRef.current&&(e.key===' '||e.key==='Enter')){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)keySpin(e.type==='keydown');return;}
   if(castable()&&e.type==='keydown'&&/^Arrow(Left|Right|Up|Down)$/.test(e.key)){e.preventDefault();e.stopImmediatePropagation();
    if(e.key==='ArrowLeft')k.u=Math.max(-1,k.u-.2);else if(e.key==='ArrowRight')k.u=Math.min(1,k.u+.2);else if(e.key==='ArrowUp')k.v=Math.min(1,k.v+.15);else k.v=Math.max(0,k.v-.15);
    fishingSession.aim({kind:'polar',u:k.u,v:k.v});return;}
   if(e.key===' '||e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();
    if(castable()&&e.key===' '){// Hold Space for power along the current aim; a quick tap is a quick cast.
     if(e.type==='keydown'&&!e.repeat){k.space=performance.now();fishingSession.aim({kind:'polar',u:k.u,v:k.v,charge:k.space});}
     else if(e.type==='keyup'&&k.space){const held=performance.now()-k.space;k.space=0;if(held<200){fishingSession.aim(null);fishingSession.tap();}else fishingSession.castAimed();}
     return;}
    if(e.type==='keydown'&&!e.repeat){const hooking=phaseRef.current==='bite';fishingSession.tap();if(hooking&&fishingSession.getView().fight)keySpin(true);}}
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
  return()=>{keySpin(false);fishingSession.spinEnd();window.removeEventListener('pointercancel',cancel,true);window.removeEventListener('keydown',key,true);window.removeEventListener('keyup',key,true);window.removeEventListener('pointerdown',pdown,true);window.removeEventListener('pointerup',pup,true);window.removeEventListener('pointermove',pmove,true);canvas?.removeEventListener('pointerleave',leave as EventListener);fishingSession.aim(null);};
 },[view.active,book,stand]);// eslint-disable-line react-hooks/exhaustive-deps
 // The Cast face of the reel: a tap is a quick cast; drag from it to aim (sideways turns, up throws farther, down shorter), let go to cast.
 const castDrag=useRef<{x:number;y:number;id:number;moved:boolean}|null>(null);
 /** The spin: track the finger's angle round the reel's centre; wrap-safe deltas give a smoothed rate (0..1 of a full spin, either
  *  way round) and the crank's turn. Pointer maths only, in the handler: no React state per move. */
 const spinStart=(e:React.PointerEvent<HTMLButtonElement>)=>{const r=e.currentTarget.getBoundingClientRect();spin.current={id:e.pointerId,cx:r.left+r.width/2,cy:r.top+r.height/2,a:NaN,t:performance.now(),rate:0};try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* older browsers */}};
 const spinMove=(e:React.PointerEvent<HTMLButtonElement>)=>{const s=spin.current;if(!s||s.id!==e.pointerId)return false;
  const dx=e.clientX-s.cx,dy=e.clientY-s.cy;if(Math.hypot(dx,dy)<SPIN_DEADZONE)return true;
  const a=Math.atan2(dy,dx),now=performance.now();
  if(!Number.isNaN(s.a)){const d=wrap(a-s.a),dt=Math.max(.004,(now-s.t)/1000);s.rate+=(Math.min(1,Math.abs(d)/dt/FULL_SPIN)-s.rate)*.35;
   turn.current+=d;const deg=`${(turn.current*180/Math.PI).toFixed(1)}deg`;crank.current?.style.setProperty('--spin',deg);
   // The spin trail reads the same angle plus the rate and direction from the reel (CSS only; a 110 ms idle timer fades it when the finger stops).
   const rb=reelEl.current;if(rb){rb.style.setProperty('--spin',deg);rb.style.setProperty('--spin-rate',s.rate.toFixed(2));if(Math.abs(d)>.002)rb.style.setProperty('--spin-dir',d>0?'1':'-1');
    window.clearTimeout(trailIdle.current);trailIdle.current=window.setTimeout(()=>reelEl.current?.style.setProperty('--spin-rate','0'),110);}
   fishingSession.spin(s.rate,now);}
  s.a=a;s.t=now;return true;};
 const spinStop=(e:React.PointerEvent<HTMLButtonElement>)=>{const s=spin.current;if(!s||s.id!==e.pointerId)return false;spin.current=null;window.clearTimeout(trailIdle.current);reelEl.current?.style.setProperty('--spin-rate','0');fishingSession.spinEnd();suppressClick.current=true;return true;};
 // Pressing the reel: on the bite it hooks (on the press, not the release) and the same finger can start spinning at once; in the
 // fight it spins; while the line is in it is the Cast button.
 const reelDown=(e:React.PointerEvent<HTMLButtonElement>)=>{
  const fightNext=view.phase==='bite'||view.phase==='reeling'&&view.fight;
  if(view.phase==='bite'){fishingSession.tap();suppressClick.current=true;}
  if(fightNext){spinStart(e);return;}
  castDown(e);};
 const reelMove=(e:React.PointerEvent<HTMLButtonElement>)=>{if(spinMove(e))return;castMove(e);};
 const reelUp=(e:React.PointerEvent<HTMLButtonElement>)=>{if(spinStop(e))return;castUp(e);};
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
 const fighting=view.phase==='reeling'&&view.fight,castable=view.phase==='ready'||view.phase==='caught';
 // A3: the first-time tutorial (this device), finished on the first catch's "Got it" or Skip.
 const tutorial=view.active&&!prefs.tutorialDone&&!book&&!stand,tStep=tutorial?tutorialStep(view.phase):null;
 const size=view.caught?sizeCompare(view.caught.size):null;
 // A legend is caught once and released (legendary.ts): its own card, no coins, no basket.
 const legend=view.caught&&isLegendId(view.caught.id)?LEGEND_INFO[view.caught.id]:null;
 // RECORD: this player's biggest of the species (the Fishbook's `biggest`).
 const record=!!view.caught&&!legend&&view.caught.isBiggest;
 const reelLabel=fighting?(view.strain?'Ease!':view.run?'Stop!':'Spin!'):view.phase==='reeling'?'Reel':REEL_LABEL[view.phase];
 return <>
  <button type="button" className="store-enter-prompt" data-fish-enter aria-label="Fish" hidden onClick={e=>{const id=e.currentTarget.dataset.spot;if(id){pushLook();fishingSession.start(id);}}}>Fish</button>
  <button type="button" className="store-enter-prompt" data-market-enter aria-label="Sell at the market stand" hidden onClick={()=>{setTab(undefined);setPlace('rosa');setLoaded(l=>({...l,stand:true}));setStand(true);}}>Sell</button>
  {/* In-world catch label: positioned above the held-up fish by fishingWorld.ts. */}
  <div className={styles.catch} data-fish-catch hidden aria-live="polite" data-dismissed={dismissed===catchKey&&catchKey?'':undefined}>{fish&&view.caught&&<>
   <button type="button" className={styles.catchClose} aria-label="Dismiss" onClick={()=>setDismissed(catchKey)}><span aria-hidden="true">×</span></button>
   {/* A4: NEW (first of its kind) and RECORD (this player's biggest yet) stamps; A6: rarity stars as well as the word and colour. */}
   {legend?<p className={styles.stamps}><span className={styles.stamp} data-stamp="legend">Island legend!</span></p>:(view.caught.isNew||record)&&<p className={styles.stamps}>{view.caught.isNew&&<span className={styles.stamp} data-stamp="new">New!</span>}{record&&<span className={styles.stamp} data-stamp="record">Record!</span>}</p>}
   <p className={styles.catchTop}><b>{fish.name}</b>{fromBoat&&<em className={styles.catchWhere} data-fish-where>Deep sea boat</em>}</p>
   {legend?<p className={styles.catchMeta} data-rarity="legendary" data-fish-legend><RarityStars rarity="legendary" className={styles.stars}/> {legend.title} · caught once and released</p>
   :<p className={styles.catchMeta} data-rarity={fish.rarity}><RarityStars rarity={fish.rarity} className={styles.stars}/> {RARITY_LABEL[fish.rarity]} · {fishSellValue(fish)} coins{view.caught.inBasket?'':' · basket full'}</p>}
   {size&&<p className={styles.catchSize} data-fish-size data-unit={size.unit}><b>{view.caught.size} cm</b>: {size.text}</p>}
   <p className={styles.catchClub}><span>Real football fact</span>{fish.club.name}{fish.club.nickname?` · “${fish.club.nickname}”`:''}</p>
   <p className={styles.catchFact}>{fish.club.fact}</p>
  </>}</div>
  {view.active&&<div className={styles.hud} data-fishing-hud data-phase={view.phase}>
   <div className={styles.back}><BackButton ref={back} data-fish-stop onBack={()=>fishingSession.stop()}/></div>
   <div className={styles.message} role="status" data-fishing-message data-run={view.run||undefined} data-warn={view.warn||undefined}>
    <p className={styles.messageTitle}>{view.phase==='caught'&&fish&&<RarityStars rarity={fish.rarity} className={styles.stars} size={13}/>}{view.phase==='caught'&&fish?' ':''}{view.hint}</p>
    {toast&&view.phase!=='caught'&&view.phase!=='bite'&&view.phase!=='reeling'&&<button type="button" key={toast.key} className={styles.messageLesson} data-fishing-lesson data-expanded={expanded} aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}><span>{toast.text}</span></button>}
   </div>
   {/* B2: the white flash at the top of the leap (one-shot CSS, after the leap's rise; none with reduced motion). */}
   {view.phase==='caught'&&catchKey&&<div className={styles.leapFlash} key={catchKey} aria-hidden="true"/>}
   {tutorial&&<FishingTutorial phase={view.phase} onDone={finishFishingTutorial}/>}
   {/* Content toast (a request finished, a reward, a legend's clue or release): after the catch card, above the reel. */}
   <FishingCatchToast cardUp={view.phase==='caught'}/>
   <div className={styles.controls}>
    <button type="button" className={`${styles.action} ${styles.book}`} aria-label="Fishbook" title="Fishbook" onClick={()=>{countFishbookOpen();setLoaded(l=>({...l,book:true}));setBook(true);}}><Icon name="book" size={28}/></button>
    <button type="button" ref={reelEl} className={styles.reel} data-fish-reel data-phase={view.phase} data-fish-fight={fighting?'':undefined} data-strain={fighting&&view.strain||undefined} data-run={fighting&&view.run||undefined} data-warn={view.warn||undefined}
     aria-label={fighting?'Spin the reel to wind in':view.phase==='reeling'?'Tap to reel':REEL_LABEL[view.phase]} aria-disabled={waiting} onPointerDown={reelDown} onPointerMove={reelMove} onPointerUp={reelUp} onPointerCancel={e=>{castDrag.current=null;fishingSession.aim(null);spinStop(e);}} onContextMenu={e=>{if(fighting)e.preventDefault();}}
     onClick={()=>{if(suppressClick.current){suppressClick.current=false;return;}if(fighting)return;if(!waiting)fishingSession.tap();}}>
     {/* The tension arc (CSS: --tension written by the world, no render per frame); a notch marks the red zone. */}
     {fighting&&<span className={styles.arc} aria-hidden="true"><i className={styles.arcNotch}/></span>}
     {/* The progress ring (CSS: --progress), notched in FIGHT_NOTCHES quarters: a slip drops one notch. */}
     {fighting&&<span className={styles.ring} role="progressbar" aria-label="Reeled in" aria-valuetext={view.strain?'The line is tight: ease off':view.run?'It runs: stop spinning':'Winding in'} data-fish-progress><i style={{'--n':'292.5deg'} as React.CSSProperties}/><i style={{'--n':'0deg'} as React.CSSProperties}/><i style={{'--n':'67.5deg'} as React.CSSProperties}/></span>}
     {fighting&&view.slips>0&&<b key={`slip-${view.slips}`} className={styles.slipFlash} aria-hidden="true"/>}
     {/* The spin trail: a fading arc plus four dots behind the knob, driven by --spin / --spin-rate / --spin-dir (CSS only). */}
     <span className={styles.trail} aria-hidden="true"><b/><i/><i/><i/><i/></span>
     <ReelArt crank={crank}/>
     <span className={styles.reelLabel}>{reelLabel}</span>
     {tStep==='now'||tStep==='reel'?<span className={styles.ghostButton} data-ghost={tStep} aria-hidden="true"><GhostHand/></span>:null}
    </button>
    <FishingLureButton className={styles.action}/>
   </div>
  </div>}
  {loaded.book&&<Fishbook open={book} onClose={()=>setBook(false)}/>}
  {loaded.stand&&<MarketStand open={stand} initialTab={tab} place={place} onOpenChange={setStand}/>}
 </>;
}
