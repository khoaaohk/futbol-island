'use client';
import {useEffect,useId,useLayoutEffect,useRef,useState} from 'react';
import type React from 'react';
import MiniCard from './MiniCard';
import profiles from '@/lib/town/playerProfiles.json';
import {CARD_ENTRIES,readCollection} from '@/lib/town/cardCollection';
import {OPEN_CARDS_EVENT,chooseOfferCard,liveOffer} from '@/lib/town/cardRewardStore';
import {offerReason,type CardOffer as Offer} from '@/lib/town/cardRewards';
import styles from './CardOffer.module.css';

const ENTRY=new Map(CARD_ENTRIES.map(entry=>[entry.name,entry]));
const PROFILES=profiles as Record<string,{blurb:string;strengths:string[]}>;
const pad=(n:number)=>String(n).padStart(3,'0');
const first=(name:string)=>name.split(' ')[0];
const reducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** The full PlayerCard (the binder viewer's card) is heavier than MiniCard: its chunk loads only once an offer is open, and is kept
 *  in a module variable so the reveal never waits on a lazy wrapper's first suspended render (the binder's own pattern). */
type PlayerCardView=typeof import('./PlayerCard').default;
let playerCardView:PlayerCardView|null=null;
const loadPlayerCard=()=>import('./PlayerCard').then(module=>(playerCardView=module.default));
/** The chosen card's spin: one full turn about Y as it grows into the full card (transform only, ≈0.85 s, once). */
const SPIN_MS=850;
/** Where a card sits in the deck: in front, or behind to the right / left. */
const place=(i:number,active:number,n:number)=>{const d=((i-active)%n+n)%n;return d===0?'front':d===1?'right':'left';};

/**
 * "Pick a card": up to three face-up cards the child does not own yet, one large in front and the others behind it, dimmed.
 * The arrows, a swipe, the arrow keys, or a tap on a card behind bring a card to the front; under it are its position, one strength
 * and a clear "Choose [first name]" pill. The child must pick one there and then (user, Sep 24 2026): no "Choose later", and
 * Escape does nothing until a card is chosen (a reload re-opens the pending offer). A choice, not a gamble: every card is visible,
 * there are no odds, no timers and nothing to buy. Once chosen, the card spins once and settles as the full PlayerCard (hover tilt,
 * Flip for its back, Play for its film), with "Keep playing" and "See it in my binder" as the way out.
 * Phone heat: static MiniCards; the only motion is a short transform transition per card change, a one-shot fade when a card is
 * chosen and the one-shot spin (none with reduced motion). The PlayerCard's looping scenery is held still here (CSS).
 */
export default function CardOffer({offerId,complete=false,onClose}:{offerId:string|null;complete?:boolean;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),revealRef=useRef<HTMLDivElement>(null),uid=useId().replace(/:/g,'');
 const [offer,setOffer]=useState<Offer|null>(null),[chosen,setChosen]=useState<string|null>(null),[landed,setLanded]=useState(false),[active,setActive]=useState(0);
 const [count,setCount]=useState(0),[announce,setAnnounce]=useState('');
 const [PlayerCard,setPlayerCard]=useState<PlayerCardView|null>(()=>playerCardView);
 useEffect(()=>{if(!offerId)return;const live=liveOffer(offerId);if(!live){onClose();return;}setOffer(live);setChosen(null);setLanded(false);setActive(0);setAnnounce('');setCount(readCollection().length);
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[offerId]);
 useEffect(()=>{if(complete)setCount(readCollection().length);},[complete]);
 useEffect(()=>{if(!offerId||playerCardView)return;let live=true;loadPlayerCard().then(view=>{if(live)setPlayerCard(()=>view);}).catch(()=>{});return()=>{live=false;};},[offerId]);
 useEffect(()=>{const node=dialog.current,previous=document.activeElement as HTMLElement|null;if(node&&!node.open)node.showModal();
  return()=>{node?.close();if(previous?.isConnected)previous.focus({preventScroll:true});};},[]);
 // The Choose pill takes focus when an offer opens (arrow keys still turn the deck from there).
 useEffect(()=>{if(offer&&!chosen)requestAnimationFrame(()=>dialog.current?.querySelector<HTMLButtonElement>('[data-choose]')?.focus({preventScroll:true}));},[offer?.id]);// eslint-disable-line react-hooks/exhaustive-deps

 const cards=(offer?.cards??[]).filter(name=>ENTRY.has(name)),n=cards.length;
 const bring=(to:number)=>{if(chosen||n<2)return;const next=((to%n)+n)%n;if(next===active)return;setActive(next);
  const entry=ENTRY.get(cards[next]);if(entry)setAnnounce(`Card ${next+1} of ${n}: ${entry.name}, ${entry.roleLabel}.`);};
 /** Escape / cancel: only once the chosen card has landed (or on the collection-complete note); an open offer must be answered. */
 const dismiss=()=>{if(offer&&!landed)return;onClose();};
 const choose=(name:string)=>{if(!offer||chosen)return;if(!chooseOfferCard(offer.id,name))return;setChosen(name);setCount(c=>c+1);
  // In the binder already: close so the child sees the card land in its pocket. Elsewhere: the card spins into the full PlayerCard.
  const inBinder=!!document.querySelector('[aria-roledescription=binder]');
  const settle=()=>{if(inBinder)onClose();else{setLanded(true);requestAnimationFrame(()=>dialog.current?.querySelector<HTMLButtonElement>('[data-primary]')?.focus({preventScroll:true}));}};
  if(reducedMotion())settle();else setTimeout(settle,260);};
 // The spin: once, when the PlayerCard first shows. It turns the card's own flip layer (so the real back passes by mid-turn); when the
 // animation ends it is dropped and the card's CSS takes over at the same angle (360° = 0°).
 const spun=useRef(false);
 useLayoutEffect(()=>{if(!landed||!PlayerCard||spun.current)return;spun.current=true;if(reducedMotion())return;
  const flip=revealRef.current?.querySelector<HTMLElement>(':scope>div>div:first-child>div');
  flip?.animate([{transform:'rotateY(-360deg) scale(.62)'},{transform:'rotateY(-180deg) scale(.9)',offset:.55},{transform:'rotateY(0deg) scale(1)'}],{duration:SPIN_MS,easing:'cubic-bezier(.25,.75,.3,1)'});},[landed,PlayerCard]);

 // Swipe: a horizontal flick on the deck turns it (no drag loop: one pointerdown, one pointerup). A swipe never also counts as a tap.
 const swipe=useRef<{x:number;y:number;id:number}|null>(null),swiped=useRef(0);
 const onPointerDown=(event:React.PointerEvent)=>{if(chosen)return;swipe.current={x:event.clientX,y:event.clientY,id:event.pointerId};};
 const onPointerUp=(event:React.PointerEvent)=>{const s=swipe.current;swipe.current=null;if(!s||s.id!==event.pointerId)return;
  const dx=event.clientX-s.x,dy=event.clientY-s.y;if(Math.abs(dx)<36||Math.abs(dx)<Math.abs(dy)*1.2)return;swiped.current=performance.now();bring(active+(dx<0?1:-1));};
 const tapCard=(i:number)=>{if(performance.now()-swiped.current<350)return;if(i!==active)bring(i);};

 const onKeyDown=(event:React.KeyboardEvent<HTMLDialogElement>)=>{
  event.stopPropagation();
  if(event.key==='Escape'){
   // A card film playing in the reveal: let the dialog's cancel reach PlayerCard, which stops only the film.
   if(dialog.current?.querySelector('[data-playing],button[data-state=loading]'))return;
   event.preventDefault();dismiss();return;}
  if(!chosen&&n>1&&!(event.target as HTMLElement).closest('[role=tablist]')){
   const to=event.key==='ArrowRight'?active+1:event.key==='ArrowLeft'?active-1:event.key==='Home'?0:event.key==='End'?n-1:null;
   if(to!==null){event.preventDefault();bring(to);return;}}
  if(event.key!=='Tab')return;
  const controls=[...(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],[tabindex="0"]')??[])].filter(el=>el.tabIndex>=0&&el.getClientRects().length&&!el.closest('[aria-hidden=true]'));
  if(!controls.length)return;const head=controls[0],tail=controls[controls.length-1];
  if(event.shiftKey&&document.activeElement===head){event.preventDefault();tail.focus();}else if(!event.shiftKey&&document.activeElement===tail){event.preventDefault();head.focus();}
 };
 const total=CARD_ENTRIES.length,chosenEntry=chosen?ENTRY.get(chosen):undefined;
 const front=cards[Math.min(active,Math.max(0,n-1))],frontEntry=front?ENTRY.get(front):undefined,frontStrength=front?PROFILES[front]?.strengths?.[0]:undefined;
 const describe=(name:string)=>{const entry=ENTRY.get(name)!,strength=PROFILES[name]?.strengths?.[0];
  return `${name}: ${entry.roleLabel}, ${entry.era==='allTime'?'Legend':'Star'} card, number ${entry.number}${strength?`. Strength: ${strength}`:''}`;};
 const reveal=landed&&chosen&&chosenEntry&&PlayerCard;
 const countLine=<p className={styles.count}>{count<total?`${count} of ${total} collected. Collect them all to fill your binder!`:`All ${total} collected!`}</p>;

 return <dialog ref={dialog} className={styles.dialog} aria-labelledby={`${uid}-title`} aria-describedby={`${uid}-reason`} onCancel={event=>{event.preventDefault();dismiss();}} onKeyDown={onKeyDown} onKeyUp={event=>event.stopPropagation()}>
  <div className={styles.stage} data-chosen={chosen?'':undefined} data-landed={landed?'':undefined}>
   {complete&&!offer?<section className={styles.note}>
    <p className={styles.eyebrow}>Collection complete</p>
    <h2 id={`${uid}-title`}>Every card is in your binder!</h2>
    <p id={`${uid}-reason`}>You have all {total} players. Keep learning: open any card to study how that player plays their position.</p>
    <div className={styles.actions}><button type="button" data-primary="" className={styles.primary} onClick={onClose} autoFocus>Keep playing</button></div>
   </section>:offer&&<>
    <section className={styles.note}>
     <p className={styles.eyebrow}>{landed?'Added to your binder':'New card'}</p>
     <h2 id={`${uid}-title`}>{landed&&chosenEntry?`${chosenEntry.name} is yours`:'Pick a card'}</h2>
     <p id={`${uid}-reason`}>{landed&&chosenEntry?`No. ${pad(chosenEntry.number)} · ${chosenEntry.roleLabel}. Flip the card to study how ${first(chosenEntry.name)} plays.`:offerReason(offer,name=>ENTRY.get(name)?.roleLabel??'player')}</p>
    </section>
    {reveal?<div ref={revealRef} className={styles.reveal}>
     <PlayerCard name={chosen} role={chosenEntry.roleLabel.replace('Futsal ','')} era={chosenEntry.era} team="gold" format={chosenEntry.futsal?'futsal':'11v11'} firstName={first(chosen)} compact
      blurb={PROFILES[chosen]?.blurb??`${chosen} is one of the players to learn from as a ${chosenEntry.roleLabel.toLowerCase()}.`} strengths={PROFILES[chosen]?.strengths??[]}/>
    </div>:<>
     <div className={styles.deck} data-count={n} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={()=>{swipe.current=null;}}>
      <div className={styles.cards} role="group" aria-roledescription="carousel" aria-label={`${n} cards to choose from`}>
       {cards.map((name,i)=>{const entry=ENTRY.get(name)!,at=place(i,active,n),isFront=at==='front';
        return <div key={name} className={styles.choice} data-card="" data-pos={at} data-picked={chosen===name?'':undefined}
         role={isFront?'group':undefined} aria-roledescription={isFront?'card':undefined} aria-label={isFront?`Card ${i+1} of ${n}. ${describe(name)}`:undefined} aria-hidden={isFront?undefined:true}
         onClick={()=>tapCard(i)}>
         <MiniCard name={name} number={entry.number} era={entry.era} got className={styles.mini}/>
        </div>;})}
      </div>
      {n>1&&<>
       <button type="button" className={`${styles.arrow} ${styles.prev}`} aria-label="Previous card" disabled={!!chosen} onClick={()=>bring(active-1)}><Arrow dir={-1}/></button>
       <button type="button" className={`${styles.arrow} ${styles.next}`} aria-label="Next card" disabled={!!chosen} onClick={()=>bring(active+1)}><Arrow dir={1}/></button>
      </>}
     </div>
     {frontEntry&&<div className={styles.caption} aria-hidden="true">
      <span className={styles.where}>{n>1?`${active+1} of ${n}`:'1 card'}</span>
      <b>{frontEntry.roleLabel}</b>
      {frontStrength&&<small>{frontStrength}</small>}
     </div>}
    </>}
    <div className={styles.actions} data-row={landed||undefined}>
     {landed?<>
      <button type="button" data-primary="" className={styles.primary} onClick={onClose}>Keep playing</button>
      <button type="button" className={styles.secondary} onClick={()=>{onClose();window.dispatchEvent(new CustomEvent(OPEN_CARDS_EVENT));}}>See it in my binder</button>
     </>:frontEntry&&<button type="button" data-choose="" data-primary="" className={styles.primary} disabled={!!chosen} aria-describedby={`${uid}-front`} onClick={()=>choose(frontEntry.name)}>Choose {first(frontEntry.name)}</button>}
     {countLine}
    </div>
    {frontEntry&&!landed&&<p id={`${uid}-front`} className={styles.srOnly}>{describe(frontEntry.name)}</p>}
    <p className={styles.srOnly} aria-live="polite">{chosen?`${chosen} added to your binder.`:announce}</p>
   </>}
  </div>
 </dialog>;
}

/** The binder dock's page arrow (CardCollection), same path and stroke. */
function Arrow({dir}:{dir:1|-1}){return <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d={dir===1?'M7 3.5 14 10l-7 6.5':'M13 3.5 6 10l7 6.5'} fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;}
