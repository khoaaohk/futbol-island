'use client';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import MiniCard from './MiniCard';
import {CARD_ENTRIES,cardNumber} from '@/lib/town/cardCollection';
import {legendFor} from '@/lib/arcade/legendPacks';
import {DoneButton} from './DoneButton';
import styles from './VendingCardReveal.module.css';

/** Static collection artwork; only entry and deliberate card changes animate.
 * Mounted after vending has put the island to sleep. No renderer or timers. */
export default function VendingCardReveal({cards,preview,origin,onClose}:{cards:string[];preview:boolean;origin:{x:number;y:number}|null;onClose:()=>void}){
 const [index,setIndex]=useState(0),panel=useRef<HTMLElement>(null),touch=useRef<{x:number;y:number}|null>(null),swiped=useRef(false),first=useRef(true),cardTarget=useRef<HTMLButtonElement>(null);
 const current=cards[index],legend=legendFor(current),entry=CARD_ENTRIES.find(c=>c.name===current);
 const step=(delta:number)=>{first.current=false;setIndex(i=>Math.max(0,Math.min(cards.length-1,i+delta)));};
 useEffect(()=>{const before=document.activeElement;panel.current?.focus();return()=>{if(before instanceof HTMLElement&&before.isConnected)before.focus({preventScroll:true});};},[]);
 useLayoutEffect(()=>{const r=cardTarget.current?.getBoundingClientRect();if(!r||!panel.current)return;panel.current.style.setProperty('--from-x',`${origin?origin.x-r.left-r.width/2:0}px`);panel.current.style.setProperty('--from-y',`${origin?origin.y-r.top-r.height/2:180}px`);},[origin]);
 return <section ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={preview?'Sample card pack':'Your card pack'} className={styles.reveal} data-vending-card-reveal
  onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();onClose();}else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.stopPropagation();step(e.key==='ArrowRight'?1:-1);}else if(e.key==='Tab'){const buttons=Array.from(panel.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')??[]),first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel.current)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===panel.current)){e.preventDefault();first?.focus();}}}}>
  <div className={styles.shade} aria-hidden="true"/>
  <div className={styles.content}>
   <header><span>{preview?'SAMPLE PACK':'YOUR COLLECTION'}</span><h2>{index+1} of {cards.length}</h2><DoneButton className={styles.close} onDone={onClose}/></header>
   <button ref={cardTarget} type="button" className={styles.cardTouch} aria-label={index<cards.length-1?`${current}. Show next card`:`${current}. Last card`} onClick={()=>{if(swiped.current){swiped.current=false;return;}step(1);}}
    onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);swiped.current=false;touch.current={x:e.clientX,y:e.clientY};}}
    onPointerUp={e=>{const start=touch.current;touch.current=null;if(start&&Math.abs(e.clientX-start.x)>45&&Math.abs(e.clientX-start.x)>Math.abs(e.clientY-start.y)){e.preventDefault();swiped.current=true;step(e.clientX<start.x?1:-1);}}}
    onPointerCancel={()=>{touch.current=null;}}>
    <span key={index} className={first.current?styles.firstCard:styles.nextCard}><MiniCard name={current} number={cardNumber(current)} era={legend?'allTime':entry?.era??'current'} got className={styles.card}/></span>
   </button>
   <div className={styles.caption} aria-live="polite"><strong>{current}</strong><span>{legend?`Legend · ${legend.theme}`:entry?.roleLabel??'Player card'}</span><p>{legend?.note??'Every player brings a different strength to the team.'}</p></div>
   <nav aria-label="Cards in this pack"><button type="button" disabled={index===0} onClick={()=>step(-1)}>Previous</button><span aria-hidden="true">{cards.map((_,i)=><i key={i} data-active={i===index||undefined}/>)}</span><button type="button" onClick={()=>index<cards.length-1?step(1):onClose()}>{index<cards.length-1?'Next card':'Keep shopping'}</button></nav>
   <small>{preview?'Sample cards — not saved.':'Saved to your player collection.'}</small>
  </div>
 </section>;
}
