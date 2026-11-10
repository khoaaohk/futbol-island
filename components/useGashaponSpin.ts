'use client';
/**
 * One gashapon machine's spin flow, shared by the island's machine face (components/GashaponMachineFace.tsx, round 5) and the
 * arcade room's panel (components/GashaponPanel.tsx). Rules unchanged from round 2 (docs/gashapon-design.md):
 *  - a spin is ONE store call with one spin id made per press; a failed save keeps that id (also across closing, `unsavedSpin`),
 *    so "Try again" can never charge twice; a 'busy' answer (a second press of the same spin) never clears it;
 *  - the daily cap and the price are checked before the store is called (a buzz and a message, no charge);
 *  - a finished spin is counted once (lib/analytics/gashaponEvents.ts);
 *  - Nov 10 2026: ONE in-flight guard (`inFlight`, a ref, so it holds within the same tick before React re-renders) shared by the
 *    Spin tap and the hand-turned knob (components/GashaponMachineFace.tsx): a race between them starts one spin, charges once.
 * The drop: with `tray` (the island) the live 3D machine (lib/gashapon/gashaponFace.ts gashaponFx) turns its knob, drops the
 * capsule down the chute and the player taps it in the tray to crack it; without a live machine (the arcade) a short timed
 * drop plays and the card shows by itself. Reduced motion: no travel, the capsule is straight in the tray / the card at once.
 * Also the keyboard: while mounted the controls own the keys (Escape closes, Tab cycles their buttons on keydown only, nothing
 * reaches the world) and focus goes back to the Spin control whenever it is ready again.
 */
import {useEffect,useRef,useState,type RefObject} from 'react';
import type {GashaponMachine} from '@/lib/gashapon/machines';
import {toysIn,type GashaponToy} from '@/lib/gashapon/toys';
import {GASHAPON_PRICE,GASHAPON_SPINS_PER_DAY,type SpinResult} from '@/lib/gashapon/store';
import {gashapon,gashaponPanel,newSpinId,toyOverlay,unsavedSpin,useGashapon} from '@/lib/gashapon/gashaponBrowser';
import {gashaponFx} from '@/lib/gashapon/gashaponFace';
import {countGashaponSpin} from '@/lib/analytics/gashaponEvents';
import {gashaponSound} from '@/lib/gashapon/gashaponSound';
import {useArcadeWallet} from '@/lib/arcade/arcadeWallet';
import {localPlayDay} from '@/lib/town/dailyPlay';

export type SpinPhase='idle'|'crank'|'drop'|'tray'|'open'|'reveal';
export type SpinShown={toy:GashaponToy;duplicate:boolean;refund:number;count:number};
export type SpinError={text:string;retry:boolean;kind:'cap'|'coins'|'save'|'other'};
export const RARITY_LABEL={common:'Common',uncommon:'Uncommon',rare:'Rare'} as const;
const reducedMotion=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{return false;}};

export function useGashaponSpin(machine:GashaponMachine,{root,spinButton,trayButton,tray=false}:{root:RefObject<HTMLElement|null>;spinButton:RefObject<HTMLButtonElement|null>;trayButton?:RefObject<HTMLButtonElement|null>;tray?:boolean}){
 const wallet=useArcadeWallet(),save=useGashapon();
 const [phase,setPhase]=useState<SpinPhase>('idle'),[shown,setShown]=useState<SpinShown|null>(null),[error,setError]=useState<SpinError|null>(()=>unsavedSpin.get(machine.id)?{text:'Your last capsule was not saved yet. Tap to open it (no extra coins).',retry:true,kind:'save'}:null);
 const inFlight=useRef(false),pending=useRef<string|null>(unsavedSpin.get(machine.id)),timers=useRef<number[]>([]),result=useRef<SpinShown|null>(null);
 const toys=toysIn(machine.id),found=toys.filter(t=>save.owned[t.id]).length;
 const today=save.day===localPlayDay(Date.now())?save.today:0,left=Math.max(0,GASHAPON_SPINS_PER_DAY-today);
 const busy=phase==='crank'||phase==='drop'||phase==='open';
 // Nov 10 2026: why a new spin cannot start (the controls disable and say so); a pending unsaved spin can always be retried.
 const blocked:'cap'|'coins'|null=busy||phase==='tray'?null:left<=0?'cap':!pending.current&&wallet.balance<GASHAPON_PRICE?'coins':null;
 const close=()=>{if(busy)return;gashaponPanel.close();};
 const later=(ms:number,fn:()=>void)=>{timers.current.push(window.setTimeout(fn,ms));};
 useEffect(()=>()=>{timers.current.forEach(t=>clearTimeout(t));timers.current=[];gashaponFx.cancel(machine.id);},[machine.id]);
 useEffect(()=>{const before=document.activeElement as HTMLElement|null;spinButton.current?.focus({preventScroll:true});return()=>{if(before?.isConnected&&!before.hidden)before.focus({preventScroll:true});};},[spinButton]);
 // The Spin control is disabled while the capsule drops, which drops keyboard focus to the page: put it back when it is ready
 // (the tray's capsule takes it while it waits to be opened).
 useEffect(()=>{if(toyOverlay.covering())return;if(phase==='tray'){trayButton?.current?.focus({preventScroll:true});return;}
  if((phase==='idle'||phase==='reveal')&&!root.current?.contains(document.activeElement))spinButton.current?.focus({preventScroll:true});},[phase,root,spinButton,trayButton]);
 // While open, the controls own the keyboard: Escape closes, Tab/Enter/Space work on their buttons, nothing reaches the world.
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(toyOverlay.covering())return;// the Toy Shelf / viewer on top own the keys
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(e.type==='keydown')close();return;}// keyup too would close the controls when Escape just closed the toy viewer on top
  if(e.key==='Tab'){if(e.type!=='keydown'){e.preventDefault();e.stopPropagation();return;}// keydown only: the keyup moved focus a second time (QA Nov 8: every Tab skipped a button)
   const f=[...(root.current?.querySelectorAll<HTMLElement>('button:not([disabled])')??[])].filter(b=>!b.closest('[hidden]'));if(f.length){const i=f.indexOf(document.activeElement as HTMLElement),n=e.shiftKey?(i<=0?f.length-1:i-1):(i<0||i===f.length-1?0:i+1);e.preventDefault();f[n].focus();}e.stopPropagation();return;}
  e.stopPropagation();};
  window.addEventListener('keydown',key,true);window.addEventListener('keyup',key,true);return()=>{window.removeEventListener('keydown',key,true);window.removeEventListener('keyup',key,true);};});

 const reveal=(res:SpinShown)=>{setShown(res);setPhase('reveal');gashaponSound.jingle(res.toy.rarity);};
 /** Starts one spin (true) or explains why not (false). Never two at once: `inFlight` until the store has answered. */
 async function spin():Promise<boolean>{
  if(busy||phase==='tray'||inFlight.current)return false;setError(null);
  if(left<=0){gashaponSound.buzz();setError({text:`That's ${GASHAPON_SPINS_PER_DAY} capsules today. The machines refill tomorrow!`,retry:false,kind:'cap'});return false;}
  if(!pending.current&&wallet.balance<GASHAPON_PRICE){gashaponSound.buzz();setError({text:`A capsule costs ${GASHAPON_PRICE} coins and you have ${wallet.balance}. Earn coins with jobs, games and lessons.`,retry:false,kind:'coins'});return false;}
  inFlight.current=true;gashaponSound.unlock();const reduced=reducedMotion();
  const spinId=pending.current??=newSpinId();
  setShown(null);result.current=null;setPhase('crank');if(!reduced)gashaponSound.crank();
  // The island's machine turns its own knob; the capsule lands in the tray (`arrived`) after the store answered.
  const live=tray&&gashaponFx.spin(machine.id,()=>{gashaponSound.clunk();setPhase(p=>p==='drop'?'tray':p);});
  const started=performance.now();let r:SpinResult;
  try{r=await gashapon.spin(machine.id,spinId);}catch{r={ok:false,spinId,reason:'save',message:'Something went wrong. Your coins are safe; try again.'};}
  inFlight.current=false;// the phase (crank / drop / tray / reveal) guards from here on
  const wait=live?0:Math.max(0,(reduced?0:520)-(performance.now()-started));
  if(!r.ok){
   // A failed save: the coins are recorded under this id, so the retry (same id) finishes the spin without a new charge.
   // 'busy': another press of this same spin is still running and will show its own result (never clear its id).
   if(r.reason==='busy')return true;
   if(r.reason==='save')unsavedSpin.set(machine.id,spinId);else{pending.current=null;unsavedSpin.clear(machine.id);}
   if(live)gashaponFx.cancel(machine.id);
   later(wait,()=>{setPhase('idle');gashaponSound.buzz();setError({text:r.ok?'':r.message,retry:!r.ok&&r.reason==='save',kind:!r.ok&&r.reason==='save'?'save':'other'});});return true;}
  pending.current=null;unsavedSpin.clear(machine.id);const res={toy:r.toy,duplicate:r.duplicate,refund:r.refund,count:r.count};result.current=res;
  if(!r.repeat)countGashaponSpin({machine:r.machine,toy:r.toy.id,rarity:r.toy.rarity,isNew:!r.duplicate,refund:r.refund,coins:GASHAPON_PRICE});// admin analytics (gs:*, totals only)
  if(live){setPhase('drop');gashaponFx.drop(machine.id);return true;}
  if(tray){// no live machine (a torn-down island, tests): a short timed drop into the tray
   later(wait+(reduced?0:560),()=>{gashaponSound.clunk();setPhase('tray');});return true;}
  if(reduced){later(wait,()=>reveal(res));return true;}
  later(wait,()=>{setPhase('drop');gashaponSound.clunk();});
  later(wait+560,()=>{setPhase('open');gashaponSound.pop();});
  later(wait+860,()=>reveal(res));
  return true;
 }
 /** Tap on the capsule in the tray: it cracks open, then the toy's card. */
 function openCapsule(){
  const res=result.current;if(phase!=='tray'||!res)return;
  gashaponSound.pop();const cracked=gashaponFx.crack(machine.id);setPhase('open');
  later(cracked&&!reducedMotion()?360:0,()=>reveal(res));
 }
 const spinLabel=busy?'Turning…':phase==='tray'?'Open your capsule':error?.retry?'Try again (no extra coins)':shown?`Spin again · ${GASHAPON_PRICE}`:`Spin · ${GASHAPON_PRICE}`;
 return {wallet,save,phase,shown,error,toys,found,left,busy,blocked,close,spin,openCapsule,spinLabel};
}
