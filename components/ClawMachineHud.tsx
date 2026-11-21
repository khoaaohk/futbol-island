'use client';
/**
 * The Claw Club's controls (Nov 21 2026). Walk up → "Play claw" above the machine → the camera zooms onto it (lib/claw/clawRoom.ts).
 * Zoomed: your coins, Done, then "Play · 10 coins" (the only arcade machine that costs coins; lib/claw/clawStore.ts). A paid try
 * shows the timer, a joystick (drag; arrow keys / WASD on a keyboard) and DROP (Space / Enter). The result card names the toy and
 * its one-line football fact; a repeat says how many you have and the coins back. Done before the drop gives the coins back.
 * 12 tries a day (clawStore.triesLeft, like the gashapon's 12 capsules): the room prompt and the zoomed HUD say how many are left;
 * at 0 the Play button reads "Back tomorrow" and nothing is charged.
 */
import {useCallback,useEffect,useRef,useState,useSyncExternalStore,type PointerEvent as RPointerEvent} from 'react';
import type {ClawRoom,ClawSnapshot} from '@/lib/claw/clawRoom';
import {clawStore,clawPending,newPlayId,settleOpenTry} from '@/lib/claw/clawBrowser';
import {CLAW_PRICE,CLAW_DAILY_MESSAGE,type ClawFinish} from '@/lib/claw/clawStore';
import {clawPrize} from '@/lib/claw/clawPrizes';
import {useArcadeWallet} from '@/lib/arcade/arcadeWallet';
import {openToyViewer} from '@/lib/gashapon/gashaponBrowser';
import {RARITY_LABEL} from './useGashaponSpin';
import styles from './ClawMachineHud.module.css';

export type ClawControls={room:ClawRoom;open():boolean;close():void;begin(playId:string,firm:boolean):boolean;abort():boolean;fastForward():void;setStick(x:number,y:number):void;drop():void};
const IDLE:ClawSnapshot={near:false,mode:'room',phase:'home',time:20,ready:false,failed:false,result:null,tries:0};
type Card=Extract<ClawFinish,{ok:true}>;

export default function ClawMachineHud({claw,blocked,onZoom}:{claw:ClawControls|null;blocked:boolean;onZoom?:(open:boolean)=>void}){
 const snap=useSyncExternalStore(useCallback((fn:()=>void)=>claw?claw.room.subscribe(fn):()=>{},[claw]),()=>claw?claw.room.getSnapshot():IDLE,()=>IDLE);
 const wallet=useArcadeWallet();
 const prompt=useRef<HTMLButtonElement|null>(null);
 const [busy,setBusy]=useState(false),[card,setCard]=useState<Card|null>(null),[note,setNote]=useState<string|null>(null),[retry,setRetry]=useState<{id:string;toy:string|null}|null>(null);
 const play=useRef<string|null>(null),finishing=useRef<string|null>(null);
 // the prompt follows the machine on screen (the room calls this each frame while you stand at the coin door)
 useEffect(()=>{if(!claw)return;claw.room.promptSink=(x,y,visible)=>{const b=prompt.current;if(!b)return;b.style.left=`${x}px`;b.style.top=`${y}px`;b.style.visibility=visible?'visible':'hidden';};return()=>{claw.room.promptSink=null;};},[claw]);
 const zoomed=snap.mode!=='room';
 useEffect(()=>{onZoom?.(zoomed);},[zoomed,onZoom]);useEffect(()=>()=>onZoom?.(false),[onZoom]);
 // a try left open by a closed tab is refunded when the machine opens next
 useEffect(()=>{if(!zoomed)return;void settleOpenTry().then(c=>{if(c>0)setNote(`Your last try didn’t finish, so its ${c} coins came back.`);});},[zoomed]);
 const finish=useCallback(async(id:string,toy:string|null)=>{
  if(finishing.current===id)return;finishing.current=id;const r=await clawStore.finish(id,toy);finishing.current=null;
  if(r.ok){clawPending.clear();play.current=null;setRetry(null);setCard(r);setNote(null);}else{setRetry({id,toy});setNote(r.message);}
 },[]);
 // the try ended in the machine: record it (a win goes to the Toy Shelf)
 useEffect(()=>{const id=play.current;if(!id||!snap.result||snap.phase!=='done')return;void finish(id,snap.result.toy);},[snap.result,snap.phase,finish]);
 const start=async()=>{
  if(!claw||busy||retry)return;setBusy(true);setNote(null);setCard(null);const id=newPlayId();
  const paid=await clawStore.pay(id);
  if(!paid.ok){setBusy(false);setNote(paid.reason);return;}
  clawPending.set(id);play.current=id;
  if(!claw.begin(id,clawStore.firmNext())){const back=await clawStore.refund(id);clawPending.clear();play.current=null;setNote(back?'The claw got stuck, so your coins came back.':'The claw got stuck. Try again.');}
  setBusy(false);
 };
 const leave=async()=>{
  if(!claw)return;const id=play.current;
  if(id&&snap.phase==='aim'&&claw.abort()){play.current=null;const back=await clawStore.refund(id);clawPending.clear();if(back)setNote(`No drop, no charge: ${back} coins back.`);}
  else if(id&&snap.phase!=='done'&&snap.phase!=='home')claw.fastForward();// the try plays out; its result is still saved
  setCard(null);claw.close();
 };
 // keyboard: Escape leaves the machine
 useEffect(()=>{if(!zoomed)return;const k=(e:KeyboardEvent)=>{if(e.code==='Escape'){e.preventDefault();void leave();}};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);});
 // ---- joystick ----
 const pad=useRef<HTMLDivElement>(null),knob=useRef<HTMLSpanElement>(null),pointer=useRef<number|null>(null);
 const paint=(x:number,y:number)=>{if(knob.current)knob.current.style.transform=`translate(${x}px,${y}px)`;};
 const move=(e:RPointerEvent<HTMLDivElement>)=>{if(pointer.current!==e.pointerId||!claw)return;const r=e.currentTarget.getBoundingClientRect(),T=r.width*.3;
  let dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;const d=Math.hypot(dx,dy);if(d>T){dx*=T/d;dy*=T/d;}paint(dx,dy);
  const dead=.12,nx=dx/T,ny=dy/T;claw.setStick(Math.abs(nx)<dead?0:nx,Math.abs(ny)<dead?0:ny);};
 const release=()=>{pointer.current=null;paint(0,0);claw?.setStick(0,0);};
 useEffect(()=>{if(snap.phase!=='aim')release();},[snap.phase]);// eslint-disable-line react-hooks/exhaustive-deps
 if(!claw)return null;
 const aiming=snap.phase==='aim'&&zoomed,running=play.current!==null&&!aiming&&snap.phase!=='done'&&snap.phase!=='home';
 const short=wallet.balance<CLAW_PRICE,firm=clawStore.firmNext(),left=clawStore.triesLeft(),out=left<=0;
 const triesText=out?'No tries left today':`${left} ${left===1?'try':'tries'} left today`;
 const prize=card?.toy?clawPrize(card.toy.id):undefined;
 return <>
  {snap.near&&!zoomed&&!blocked&&<button ref={prompt} type="button" className={`store-enter-prompt ${styles.prompt}`} data-claw-play data-claw-left={left} onClick={()=>{if(!claw.open())setNote('The claw machine is resting. Try again soon.');}}>{out?'Claw Club · back tomorrow':`Play claw · ${CLAW_PRICE} coins`}<span className={styles.promptTries}>{triesText}</span></button>}
  {zoomed&&<div className={styles.layer} data-claw-hud={snap.mode} data-phase={snap.phase}>
   <header className={styles.top}>
    <div className={styles.purse}><p className={styles.coins} data-claw-balance={wallet.balance}><span className={styles.coin} aria-hidden="true"/>{wallet.balance}<span className={styles.coinWord}> coins</span></p>
     <p className={styles.tries} data-claw-tries={left}>{triesText}</p></div>
    {aiming&&<p className={styles.timer} data-claw-timer={snap.time} data-low={snap.time<=5} aria-live="off">{snap.time}</p>}
    <button type="button" className={styles.done} onClick={()=>void leave()} data-claw-done>{aiming?'Done (coins back)':'Done'}</button>
   </header>
   {snap.ready&&!aiming&&!running&&!card&&<section className={styles.panel} data-claw-start>
    <h2 className={styles.title}>Claw Club</h2>
    <p className={styles.line}>Steer the claw over a toy, press DROP, and steer it home to the chute.</p>
    {out?<p className={styles.firm} data-claw-out>{CLAW_DAILY_MESSAGE}</p>:firm&&<p className={styles.firm} data-claw-firm>Lucky try: extra-firm grip this time!</p>}
    {retry?<button type="button" className={styles.primary} onClick={()=>void finish(retry.id,retry.toy)} data-claw-retry>Save my prize</button>
     :<button type="button" className={styles.primary} onClick={()=>void start()} disabled={busy||short||out} data-claw-pay>{busy?'Coin in…':out?'Back tomorrow':short?`Earn ${CLAW_PRICE} coins in the games`:`Play · ${CLAW_PRICE} coins`}</button>}
   </section>}
   {card&&<section className={styles.panel} data-claw-result={card.toy?.id??'miss'} aria-live="polite">
    {card.toy?<>
     <h2 className={styles.title}>{card.toy.name}!</h2>
     <p className={styles.meta}><span>{RARITY_LABEL[card.toy.rarity]}</span>{card.duplicate?<span data-claw-repeat>Repeat ({card.count} now){card.refund>0?` · +${card.refund} coins back`:''}</span>:<span className={styles.fresh} data-claw-new>New for your Toy Shelf</span>}</p>
     <p className={styles.fact} data-claw-fact>{prize?.fact}</p>
     <div className={styles.row}><button type="button" className={styles.secondary} onClick={()=>openToyViewer(card.toy!.id,'result')} data-claw-look>Look closer</button>
      <button type="button" className={styles.primary} onClick={()=>void start()} disabled={busy||short||out} data-claw-again>{out?'Back tomorrow':short?'Need coins':`Again · ${CLAW_PRICE}`}</button></div>
    </>:<>
     <h2 className={styles.title}>So close!</h2>
     <p className={styles.line}>Grab a toy in the middle, with the prongs around it, for a firm hold.{clawStore.firmNext()?' Your next try gets an extra-firm grip.':''}</p>
     <button type="button" className={styles.primary} onClick={()=>void start()} disabled={busy||short||out} data-claw-again>{out?'Back tomorrow':short?`Earn ${CLAW_PRICE} coins in the games`:`Try again · ${CLAW_PRICE} coins`}</button>
    </>}
   </section>}
   {note&&<p className={styles.note} role="status" data-claw-note>{note}</p>}
   {running&&<p className={styles.status} aria-live="polite">{snap.phase==='drop'?'Dropping…':snap.phase==='close'?'Grab!':snap.phase==='lift'?'Lifting…':snap.phase==='carry'?'Home to the chute…':'…'}</p>}
   {aiming&&<div className={styles.controls}>
    <div ref={pad} className={styles.pad} role="group" aria-label="Move the claw. Arrow keys or WASD also work." onContextMenu={e=>e.preventDefault()}
     onPointerDown={e=>{if(pointer.current!==null)return;e.preventDefault();pointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);move(e);}}
     onPointerMove={move} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release} data-claw-stick><span ref={knob} className={styles.knob}/></div>
    <button type="button" className={styles.drop} onPointerDown={e=>{e.preventDefault();claw.drop();}} onClick={()=>claw.drop()} data-claw-drop aria-label="Drop the claw (Space)">DROP</button>
   </div>}
  </div>}
  {!zoomed&&note&&snap.near&&<p className={`${styles.note} ${styles.roomNote}`} role="status">{note}</p>}
 </>;
}
