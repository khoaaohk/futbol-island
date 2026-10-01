'use client';
import {useEffect,useRef} from 'react';
import {DoneButton} from './DoneButton';
import {Icon} from './Icon';
import shell from './ModalShell.module.css';
import npcStyles from './NpcConversation.module.css';
import slide from './DrawerSlide.module.css';
import room from './KonbiniRoom.module.css';
import {DRAWER_SLIDE_OUT_MS,showDrawer} from './drawerSlide';
import {MAGAZINES,STAMP_CARD_SIZE,STAMP_STEPS,stampReward} from '@/lib/konbini/konbiniContent';
import {SHOP_NAMES,type KonbiniShop} from '@/lib/konbini/food';

/**
 * The Konbini stamp card as a SLIDE-OUT (user, Oct 1 2026: "the stamp card needs to be a slide-out like the NPCs … applied to
 * mobile … clearer instructions on how to get the stamps"). It is the NPC conversation's drawer: the same <dialog>, DrawerSlide
 * motion, ModalShell header with Done, NpcConversation.module.css bubbles and reply buttons, so desktop slides in from the right
 * and phones (portrait and landscape) get the full-width sheet exactly like a chat.
 *
 * The rule it explains is the real one (KonbiniRoom magazine dialog + foodStore.stampMagazine): open a magazine on the magazine
 * table by the front window, read its tips, answer its question: the FIRST answer, right or wrong, stamps that magazine. Each
 * store stocks its own STAMPS_PER_SHOP magazines (konbiniContent MAGAZINES, shop main | cay); the full card pays the learning
 * "explore" reward (LEARN_COINS.explore) once ever.
 */
export default function KonbiniStampCard({open,onOpenChange,shop,stamps,paid,clerk,onShowMagazines}:{open:boolean;onOpenChange:(open:boolean)=>void;shop:KonbiniShop;stamps:readonly string[];paid:boolean;
 /** The cashier who hands you the card (the speaker of the instructions). */
 clerk:string;
 /** "Show me the magazine table": closes the card and zooms onto this store's table. */
 onShowMagazines:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restore=useRef<HTMLElement|null>(null);
 // The NPC conversation's open/close: showDrawer, then on close the slide-out plays before the dialog closes and focus returns.
 useEffect(()=>{const el=dialog.current;if(!el)return;let timer:ReturnType<typeof setTimeout>|undefined;
  if(open){if(!el.open){restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;showDrawer(el,close.current);}}
  else if(el.open){const finish=()=>{el.close();restore.current?.focus({preventScroll:true});};if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)finish();else timer=setTimeout(finish,DRAWER_SLIDE_OUT_MS);}
  return()=>{if(timer)clearTimeout(timer);};},[open]);
 const have=stamps.length,shops:KonbiniShop[]=shop==='cay'?['cay','main']:['main','cay'];
 return <dialog ref={dialog} className={`${npcStyles.dialog} ${slide.drawer} ${open?`${npcStyles.entering} ${slide.entering}`:`${npcStyles.leaving} ${slide.leaving}`}`} aria-labelledby="konbini-stamp-title" aria-modal="true" data-konbini-stamp-card={open||undefined}
  onCancel={e=>{e.preventDefault();onOpenChange(false);}} onClick={e=>{if(e.target===e.currentTarget)onOpenChange(false);}} onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();onOpenChange(false);}}} onKeyUp={e=>e.stopPropagation()}>
  <section className={`${npcStyles.panel} ${slide.panel} ${shell.shell} ${shell.drawer}`}>
   <header className={`${npcStyles.header} ${shell.header}`}><div><h2 id="konbini-stamp-title">Stamp card</h2></div><DoneButton ref={close} className={npcStyles.close} onDone={()=>onOpenChange(false)}/></header>
   <div className={`${shell.body} ${npcStyles.body}`}>
    <p className={shell.context} data-konbini-stamp-count={have}>{have}/{STAMP_CARD_SIZE} stamps · Konbini magazines</p>
    <div className={npcStyles.transcript}>
     <div className={npcStyles.message} data-konbini-stamp-steps><span className={npcStyles.speaker}>{clerk}: how to get a stamp</span>
      <ol className={room.stampSteps}>{STAMP_STEPS(shop).map(s=><li key={s}>{s}</li>)}</ol>
      <p data-konbini-stamp-reward><b>{stampReward(paid)}</b></p></div>
     {shops.map(s=>{const list=MAGAZINES.filter(m=>m.shop===s),got=list.filter(m=>stamps.includes(m.id)).length;
      return <div key={s} className={npcStyles.message} data-konbini-stamp-shop={s}><span className={npcStyles.speaker}>{SHOP_NAMES[s]}{s===shop?' · you’re here':''} · {got}/{list.length}</span>
       <ul className={room.stamps} aria-label={`${SHOP_NAMES[s]} magazines`}>{list.map(m=>{const on=stamps.includes(m.id);
        return <li key={m.id} data-on={on||undefined} data-konbini-stamp={m.id} aria-label={`${m.headline} (${m.title}): ${on?'stamped':'not stamped yet'}`}><b aria-hidden="true">{on?'★':''}</b><small aria-hidden="true">{m.title}</small></li>;})}</ul></div>;})}
    </div>
    <div className={npcStyles.suggestions} role="group" aria-label="Stamp card actions">
     <button type="button" data-konbini-stamp-go onClick={onShowMagazines}>Show me the magazine table <Icon name="arrow"/></button>
     <button type="button" className={npcStyles.goodbye} onClick={()=>onOpenChange(false)}>Got it, thanks!</button>
    </div>
   </div>
  </section>
 </dialog>;
}
