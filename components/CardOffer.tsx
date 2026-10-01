'use client';
import {useEffect,useId,useLayoutEffect,useRef,useState} from 'react';
import type React from 'react';
import {CardBack} from './MiniCard';
import {photoFor} from './PlayerArt';
import {DoneButton} from './DoneButton';
import navStyles from './DoneButton.module.css';
import viewerStyles from './CardCollection.module.css';
import profiles from '@/lib/town/playerProfiles.json';
import {CARD_ENTRIES,readCollection} from '@/lib/town/cardCollection';
import {OPEN_CARDS_EVENT,chooseOfferCard,liveOffer} from '@/lib/town/cardRewardStore';
import {offerReason,type CardOffer as Offer} from '@/lib/town/cardRewards';
import styles from './CardOffer.module.css';
import {SCENERY_AWAKE_MS} from '@/lib/sceneryRest';

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
/** The unpack (user, Sep 25 2026: "choose a card to unpack the card and show"). The deck's cards are face-down mystery cards; the
 *  chosen one lifts forward while the other two slide away (LIFT_MS, CSS), then turns over into the full PlayerCard (FLY_MS), about
 *  1.4 s in all, and a tap skips straight to the reveal. The turn is a FLIP from the deck to the reveal, half a Y turn:
 *  - the mystery back turns 0→−90° from its own (lifted) deck rect, speeding up into edge-on (EDGE), and hides there;
 *  - the PlayerCard's front takes over at edge-on (90°) and turns on to 0° with a small overshoot, so the child sees the back open
 *    straight onto the player (the card's to-front direction), with the card's own foil turn light (glint: the glare sweep on the
 *    arriving face, the edge catch light and the sparks) timed to edge-on;
 *  - both boxes follow one path: centre and HEIGHT lerp from the lifted back's to the PlayerCard's (the same easing up to the swap),
 *    and heights match at the swap (the only size visible then), so the aspect ratios (5:7 mini, 5:7.6 full) never jump.
 *  The size and position are the individual `translate`/`scale` properties on the card, applied AFTER its own perspective() (a 2D
 *  scale of the projected card, never a skew); the turn is rotateY alone on the flip layer (no scale mixed into the 3D transform).
 *  The back gets the same lens for its size (perspective 1400 px × its height / the card's). A small lift settles the landing. */
const LIFT_MS=340,FLY_MS=1050,EDGE=.4,SWAP=.45,LENS=1400;
const TO_EDGE='cubic-bezier(.45,0,.85,.55)',FROM_EDGE='cubic-bezier(.2,.65,.35,1)',TURN_IN='cubic-bezier(.25,1.25,.45,1)';
/** When PlayerCard's turn light meets the card edge-on after a burst starts (its --edge-in: desktop / phones and tablets). */
const glintLead=()=>window.matchMedia('(hover: none), (pointer: coarse)').matches?305:80;
/** Before the turn: the PlayerCard module (always awaited; preloaded when the offer opens) and the chosen card's fonts and images.
 *  Nothing about the player is requested before the pick (the backs carry no portrait): the riso masks start loading here, during
 *  the lift, and sit in fixed-size boxes, so they cannot reflow the card; their decode is waited on only briefly (under the lift),
 *  and the flight's paused two-frame lead-in covers the first raster. */
const decode=(src:string)=>{const img=new Image();img.src=src;return img.decode().catch(()=>{});};
const warm=(name:string)=>{const photo=photoFor(name);
 const assets=Promise.all([decode('/stories/films/assets/entry-grain.png'),...(photo?[decode(`/players/${photo.slug}-ink.webp`),decode(`/players/${photo.slug}-tone.webp`)]:[]),document.fonts?.ready]);
 return Promise.all([playerCardView??loadPlayerCard(),Promise.race([assets,new Promise(done=>setTimeout(done,LIFT_MS+60))])]).then(([view])=>view);};
/** Where a card sits in the deck: in front, or behind to the right / left. */
const place=(i:number,active:number,n:number)=>{const d=((i-active)%n+n)%n;return d===0?'front':d===1?'right':'left';};

/**
 * "Pick a card": up to three FACE-DOWN mystery cards the child does not own yet (user, Sep 25 2026), one large in front and the
 * others behind it, dimmed. The arrows, a swipe, the arrow keys, or a tap on a card behind bring a card to the front; above it is
 * "1 of 3" and under it an "Open this card" pill. Nothing identifies a player before the pick: no name, portrait, number, position,
 * label or image request (the backs are the binder's uncollected card with "???"). The child must pick one there and then (user,
 * Sep 24 2026): no "Choose later", and Escape does nothing until a card is chosen (a reload re-opens the pending offer, in the same
 * order). Every card on offer is a new one; there are no odds, rarities, timers or anything to buy. Once chosen, the card unpacks
 * (LIFT_MS + FLY_MS, tap to skip) and settles as the full PlayerCard in the binder
 * viewer's own layout (user, Sep 24 2026): the viewer's top bar (Done top left, Play top centre, Flip top right) and its card size.
 * "Added to your binder!" sits above the card in the brush font, and "See it in my binder" right under it (user, Sep 25 2026:
 * simple, no slide-up sheet); stars twinkle around the card.
 * Done shrinks to its check and returns to the game.
 * Phone heat: static card backs; the only motion is a short transform transition per card change, a one-shot hover shine, the
 * one-shot lift and slide-away when a card is chosen and the one-shot turn (a 180 ms crossfade with reduced motion). The
 * PlayerCard's looping scenery is held still here (CSS).
 */
export default function CardOffer({offerId,complete=false,onClose}:{offerId:string|null;complete?:boolean;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),revealRef=useRef<HTMLDivElement>(null),uid=useId().replace(/:/g,'');
 const [offer,setOffer]=useState<Offer|null>(null),[chosen,setChosen]=useState<string|null>(null),[landed,setLanded]=useState(false),[active,setActive]=useState(0);
 const [count,setCount]=useState(0),[announce,setAnnounce]=useState('');
 const [PlayerCard,setPlayerCard]=useState<PlayerCardView|null>(()=>playerCardView);
 const [flipped,setFlipped]=useState(false),[flying,setFlying]=useState(false),[glint,setGlint]=useState(0);
 /** The unpack's running animations (a tap finishes them) and whether the child has already tapped to skip. */
 const flight=useRef<Animation[]>([]),skipped=useRef(false);
 const doneRef=useRef<HTMLButtonElement>(null),rootRef=useRef<HTMLDivElement>(null),sheetRef=useRef<HTMLElement>(null);
 useEffect(()=>{if(!offerId)return;const live=liveOffer(offerId);if(!live){onClose();return;}setOffer(live);setChosen(null);setLanded(false);setFlying(false);setActive(0);skipped.current=false;setAnnounce('');setCount(readCollection().length);setFlipped(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[offerId]);
 useEffect(()=>{if(complete)setCount(readCollection().length);},[complete]);
 useEffect(()=>{if(!offerId||playerCardView)return;let live=true;loadPlayerCard().then(view=>{if(live)setPlayerCard(()=>view);}).catch(()=>{});return()=>{live=false;};},[offerId]);
 useEffect(()=>{const node=dialog.current,previous=document.activeElement as HTMLElement|null;if(node&&!node.open)node.showModal();
  // Closed by a tap or click: return focus without a ring (the Choose → Done focus chain would otherwise carry one over).
  let pointer=false;const input=(event:Event)=>{pointer=event.type==='pointerdown';};node?.addEventListener('pointerdown',input,true);node?.addEventListener('keydown',input,true);
  // An offer that opened on its own (after a lesson's "Got it", or a reload) has no opener left, so focus goes to the Paths
  // button (where set-aside offers wait) instead of falling to <body>. Only when nothing else has taken focus.
  return()=>{node?.removeEventListener('pointerdown',input,true);node?.removeEventListener('keydown',input,true);node?.close();
   const options:FocusOptions&{focusVisible?:boolean}={preventScroll:true,focusVisible:pointer?false:undefined};
   if(previous?.isConnected&&previous!==document.body)previous.focus(options);
   if(document.activeElement&&document.activeElement!==document.body)return;const paths=document.querySelector<HTMLElement>('[data-tour="quests"]');if(paths?.getClientRects().length)paths.focus(options);};},[]);
 // The Choose pill takes focus when an offer opens (arrow keys still turn the deck from there).
 useEffect(()=>{if(offer&&!chosen)requestAnimationFrame(()=>dialog.current?.querySelector<HTMLButtonElement>('[data-choose]')?.focus({preventScroll:true}));},[offer?.id]);// eslint-disable-line react-hooks/exhaustive-deps

 const cards=(offer?.cards??[]).filter(name=>ENTRY.has(name)),n=cards.length;
 const bring=(to:number)=>{if(chosen||n<2)return;const next=((to%n)+n)%n;if(next===active)return;setActive(next);setAnnounce(`Mystery card ${next+1} of ${n}.`);};
 /** A tap (or Escape) during the unpack jumps to the reveal: the running turn finishes at once, or, still lifting, it never starts. */
 const skip=()=>{if(!chosen||landed)return;skipped.current=true;for(const anim of flight.current)anim.finish();};
 /** Escape / cancel: only once the chosen card has landed (or on the collection-complete note); an open offer must be answered. */
 const dismiss=()=>{if(offer&&!landed){skip();return;}onClose();};
 /** Opens the front card. Which player that is was fixed when the offer was drawn (the three are shuffled then), so the pick among
  *  the three is the child's, blind; only the chosen card is ever shown. The card is granted here, before any motion. */
 const choose=()=>{if(!offer||chosen)return;const name=cards[Math.min(active,n-1)];if(!name||!chooseOfferCard(offer.id,name))return;setChosen(name);setCount(c=>c+1);
  // Always unpacks into the reveal, in the binder too (the binder turns to the card's pocket behind the dialog, on CARD_ADDED).
  const settle=()=>{setLanded(true);requestAnimationFrame(()=>doneRef.current?.focus({preventScroll:true}));};
  // Reduced motion: no lift or turn, the reveal crossfades in (below). Otherwise the card lifts (CSS) while the PlayerCard and its
  // images get ready, then turns over.
  if(reducedMotion()){settle();return;}
  Promise.all([warm(name),new Promise(done=>setTimeout(done,LIFT_MS))]).then(([view])=>{setPlayerCard(()=>view);if(skipped.current)settle();else setFlying(true);},()=>settle());};

 // Top-bar Flip (the binder viewer's): it presses PlayerCard's own Flip (hidden here), so the turn is the card's foil turn.
 const flipCard=()=>{revealRef.current?.querySelector<HTMLButtonElement>('button[aria-pressed]')?.click();};
 // The note under the card: its measured height is the room the card leaves under itself (--sheet-h). Measured on resize only.
 const showViewer=(landed||flying)&&!!chosen;
 // A layout effect (before the flight's): the card's final size depends on it, so it is right before the flight is measured.
 useLayoutEffect(()=>{const sheet=sheetRef.current,root=rootRef.current;if(!showViewer||!sheet||!root)return;
  const set=()=>root.style.setProperty('--sheet-h',`${sheet.offsetHeight}px`);set();if(typeof ResizeObserver==='undefined')return;
  const observer=new ResizeObserver(set);observer.observe(sheet);return()=>observer.disconnect();},[showViewer]);
 // The turn (see FLY_MS). The deck stays mounted under the reveal until the card lands. Built paused in the commit that mounts the
 // PlayerCard (so its host-spin check sees the turn and shows the rim rings for it), played two frames later once that first paint is
 // done, then dropped: when it finishes the card's CSS takes over at the same pose (0°) and nothing keeps running. A tap finishes it.
 useLayoutEffect(()=>{if(!flying||!PlayerCard)return;
  const card=revealRef.current?.querySelector<HTMLElement>(':scope>div>div:first-child'),flip=card?.firstElementChild as HTMLElement|null,stage=card?.parentElement;
  const mini=dialog.current?.querySelector<HTMLElement>('[data-picked]>span:first-child');
  const land=()=>{flight.current=[];setLanded(true);setFlying(false);requestAnimationFrame(()=>doneRef.current?.focus({preventScroll:true}));};
  if(!card||!flip||!stage||!mini||skipped.current){land();return;}
  // The back's rect includes its lift (a CSS scale on its deck slot), so its own moves are divided by that scale.
  // Zero-size guard (Sep 30 2026: "Invalid keyframe … scale(NaN)/scale(Infinity)" in landscape): a card or mini that is hidden or not
  // laid out yet measures 0, and every ratio below divides by it. No card size: no flight, it just lands. No mini: the card turns in
  // place (it starts from its own rect) and the mini is left alone.
  const sized=(v:number)=>Number.isFinite(v)&&v>0,b=card.getBoundingClientRect(),ch=card.offsetHeight;
  if(!sized(ch)||!sized(b.height)){land();return;}
  const ma=mini.getBoundingClientRect(),mh=mini.offsetHeight,hasMini=sized(ma.height)&&sized(ma.width)&&sized(mh),a=hasMini?ma:b,lift=hasMini?a.height/mh:1;
  const dx=a.left+a.width/2-(b.left+b.width/2),dy=a.top+a.height/2-(b.top+b.height/2),h=(p:number)=>a.height+(ch-a.height)*p;
  const at=(p:number)=>({translate:`${(dx*(1-p)).toFixed(2)}px ${(dy*(1-p)).toFixed(2)}px`,scale:(h(p)/ch).toFixed(4)});
  const miniAt=(p:number,deg:number)=>`translate(${(-dx*p/lift).toFixed(2)}px,${(-dy*p/lift).toFixed(2)}px) scale(${(h(p)/a.height).toFixed(4)}) perspective(${(LENS*mh/ch).toFixed(1)}px) rotateY(${deg}deg)`;
  const timing:KeyframeAnimationOptions={duration:FLY_MS,easing:'linear'};
  const anims=[
   card.animate([{...at(0),offset:0,easing:TO_EDGE},{...at(SWAP),offset:EDGE,easing:FROM_EDGE},{translate:'0 -4px',scale:'1.03',offset:.84,easing:'ease-in-out'},{translate:'0 0',scale:'1',offset:1}],timing),
   flip.animate([{transform:'rotateY(90deg)',offset:0},{transform:'rotateY(90deg)',offset:EDGE,easing:TURN_IN},{transform:'rotateY(0deg)',offset:1}],timing),
   stage.animate([{opacity:0},{opacity:0,offset:EDGE},{opacity:1,offset:EDGE},{opacity:1}],timing),
   ...(hasMini?[mini.animate([{transform:miniAt(0,0),opacity:1,offset:0,easing:TO_EDGE},{transform:miniAt(SWAP,-90),opacity:1,offset:EDGE},{transform:miniAt(SWAP,-90),opacity:0,offset:EDGE},{transform:miniAt(SWAP,-90),opacity:0}],{...timing,fill:'forwards'})]:[])];
  for(const anim of anims)anim.pause();flight.current=anims;
  // The card's own turn light meets the edge-on moment (its sweep starts glintLead() ms after the burst).
  let glintTimer:ReturnType<typeof setTimeout>|undefined;
  let raf=requestAnimationFrame(()=>{raf=requestAnimationFrame(()=>{for(const anim of anims)anim.play();glintTimer=setTimeout(()=>setGlint(g=>g+1),Math.max(0,FLY_MS*EDGE-glintLead()));});});
  anims[0].finished.then(land,()=>{});
  return()=>{cancelAnimationFrame(raf);clearTimeout(glintTimer);for(const anim of anims)anim.cancel();};
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[flying,PlayerCard]);
 // Reduced motion: no flight; the reveal fades in over the deck's place (180 ms, opacity only; Web Animations, since the app's global
 // reduced-motion rule turns CSS animations off).
 useLayoutEffect(()=>{if(showViewer&&reducedMotion())rootRef.current?.animate([{opacity:0},{opacity:1}],{duration:180,easing:'ease-out'});},[showViewer]);

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
   // After the reveal, Escape is Done (it shrinks to its check first, like a tap).
   event.preventDefault();if(landed&&doneRef.current){doneRef.current.click();return;}dismiss();return;}
  if(!chosen&&n>1&&!(event.target as HTMLElement).closest('[role=tablist]')){
   const to=event.key==='ArrowRight'?active+1:event.key==='ArrowLeft'?active-1:event.key==='Home'?0:event.key==='End'?n-1:null;
   if(to!==null){event.preventDefault();bring(to);return;}}
  if(event.key!=='Tab')return;
  const controls=[...(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],[tabindex="0"]')??[])].filter(el=>el.tabIndex>=0&&el.getClientRects().length&&!el.closest('[aria-hidden=true],[inert]'));
  if(!controls.length)return;const head=controls[0],tail=controls[controls.length-1];
  if(event.shiftKey&&document.activeElement===head){event.preventDefault();tail.focus();}else if(!event.shiftKey&&document.activeElement===tail){event.preventDefault();head.focus();}
 };
 const total=CARD_ENTRIES.length,chosenEntry=chosen?ENTRY.get(chosen):undefined;
 const openBinder=()=>{onClose();window.dispatchEvent(new CustomEvent(OPEN_CARDS_EVENT));};

 return <dialog ref={dialog} className={styles.dialog} aria-labelledby={`${uid}-title`} aria-describedby={`${uid}-reason`} onCancel={event=>{event.preventDefault();dismiss();}} onKeyDown={onKeyDown} onKeyUp={event=>event.stopPropagation()}
  onPointerDown={chosen&&!landed?skip:undefined}>
  {showViewer&&chosenEntry?
   /* The reveal is the binder viewer (CardCollection): its top bar (Done left, Play centre, Flip right) and its card size. */
   <div ref={rootRef} className={`${viewerStyles.viewer} ${styles.reveal}`} data-flying={flying?'':undefined}>
    <div className={viewerStyles.viewerBar}>
     <DoneButton ref={doneRef} className={viewerStyles.viewerBack} onDone={onClose}/>
     {PlayerCard&&<button type="button" className={`${viewerStyles.viewerFlip} ${navStyles.button}`} data-navigation="done" aria-pressed={flipped} onClick={flipCard}><span className={navStyles.label}>Flip</span></button>}
    </div>
    <div ref={revealRef} className={`${viewerStyles.cardHost} ${styles.host}`}>
     {/* Above the card, large, in the island's brush font (user, Sep 25 2026). */}
     <h2 id={`${uid}-title`} className={styles.added}>Added to your binder!</h2>
     {PlayerCard&&<PlayerCard name={chosen} role={chosenEntry.roleLabel.replace('Futsal ','')} era={chosenEntry.era} team="gold" format={chosenEntry.futsal?'futsal':'11v11'} firstName={first(chosen)} compact glint={glint}
      blurb={PROFILES[chosen]?.blurb??`${chosen} is one of the players to learn from as a ${chosenEntry.roleLabel.toLowerCase()}.`} strengths={PROFILES[chosen]?.strengths??[]} onFlipChange={setFlipped}/>}
     {/* The same twinkling stars as the deck, around the revealed card while it is on screen (user, Sep 25 2026). */}
     {PlayerCard&&landed&&<Sparkles className={`${styles.sparkles} ${styles.revealSparkles}`}/>}
    </div>
    {/* Under the card (user, Sep 25 2026: simple, no slide-up): whose card it is and the way to the binder. */}
    <section ref={sheetRef} className={styles.below}>
     <p id={`${uid}-reason`} className={styles.srOnly}>{chosenEntry.name} is yours. No. {pad(chosenEntry.number)} · {chosenEntry.roleLabel}. Flip the card to study how {first(chosenEntry.name)} plays.</p>
     <button type="button" className={styles.primary} onClick={openBinder}>See it in my binder</button>
    </section>
   </div>:null}
  {!landed&&<div className={styles.stage} {...(flying?{inert:''}:{}) as Record<string,string>} data-chosen={chosen?'':undefined} data-landed={landed?'':undefined}>
   {complete&&!offer?<section className={styles.note}>
    <p className={styles.eyebrow}>Collection complete</p>
    <h2 id={`${uid}-title`}>Every card is in your binder!</h2>
    <p id={`${uid}-reason`}>You have all {total} players. Keep learning: open any card to study how that player plays their position.</p>
    <div className={styles.actions}><button type="button" data-primary="" className={styles.primary} onClick={onClose} autoFocus>Keep playing</button></div>
   </section>:offer&&<>
    <section className={styles.note}>
     <p className={styles.eyebrow}>New card</p>
     <h2 id={`${uid}-title`}>Pick a card</h2>
     <p id={`${uid}-reason`}>{offerReason(offer,name=>ENTRY.get(name)?.roleLabel??'player')}<br/>{count<total?`${count} of ${total} collected. Collect them all!`:`All ${total} collected!`}</p>
    </section>
    <div className={styles.deck} data-count={n} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={()=>{swipe.current=null;}}>
     <div className={styles.cards} role="group" aria-roledescription="carousel" aria-label={`${n} mystery cards to choose from`}>
      {/* Face-down (user, Sep 25 2026): keyed and labelled by place only, so no name reaches the DOM before the pick. */}
      {cards.map((name,i)=>{const at=place(i,active,n),isFront=at==='front';
       return <div key={i} className={styles.choice} data-card="" data-pos={at} data-picked={chosen===name?'':undefined}
        role={isFront?'group':undefined} aria-roledescription={isFront?'card':undefined} aria-label={isFront?`Mystery card ${i+1} of ${n}`:undefined} aria-hidden={isFront?undefined:true}
        onClick={()=>tapCard(i)}>
        <CardBack mystery className={styles.mini}><span className={styles.shine}/></CardBack>
       </div>;})}
     </div>
     {/* Sparkling stars around the front card (user, Sep 25 2026: keep twinkling while the card is in view; many sizes).
         Compositor-only, only while the offer is open and before choosing; none with reduced motion. */}
     {!chosen&&<Sparkles className={styles.sparkles}/>}
     {/* Above the card: which card (never who); Open 52px below it. */}
     {n>0&&<div className={styles.caption} aria-hidden="true">
      <span className={styles.where}>{n>1?`${active+1} of ${n}`:'1 card'}</span>
      <b>Mystery card</b>
      <small>Who&rsquo;s inside? Open a card to find out.</small>
     </div>}
     {n>0&&<button type="button" data-choose="" data-primary="" className={`${styles.primary} ${styles.choose}`} disabled={!!chosen} aria-describedby={`${uid}-front`} onClick={choose}>Open this card</button>}
     {n>1&&<>
      <button type="button" className={`${styles.arrow} ${styles.prev}`} aria-label="Previous card" disabled={!!chosen} onClick={()=>bring(active-1)}><Arrow dir={-1}/></button>
      <button type="button" className={`${styles.arrow} ${styles.next}`} aria-label="Next card" disabled={!!chosen} onClick={()=>bring(active+1)}><Arrow dir={1}/></button>
     </>}
    </div>
    {n>0&&<p id={`${uid}-front`} className={styles.srOnly}>Mystery card {active+1} of {n}, face down. Open it to find out which player is inside.</p>}
   </>}
  </div>}
  {offer&&<p className={styles.srOnly} aria-live="polite">{chosen?`${chosen} added to your binder.`:announce}</p>}
 </dialog>;
}

/** The binder dock's page arrow (CardCollection), same path and stroke. */
/** Star spots around the front card: x, y as fractions of the card (outside its edge), delay, size. */
/** The twinkling stars. They twinkle for SCENERY_AWAKE_MS (6 s) when they appear, then rest for good (frozen on their current
 * frame, compositor idle). Oct 1 2026 heat pass (user approved, items C and G): taps, tilts and swipes no longer wake them. Touch-
 * tilting the reveal kept them at 60 fps nonstop, and each deck swipe remounted them for another 6 s. */
function Sparkles({className}:{className:string}){const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=ref.current;if(!el)return;el.dataset.scenery='live';const t=setTimeout(()=>{el.classList.add(styles.sparklesRest);el.dataset.scenery='rest';},SCENERY_AWAKE_MS);return ()=>clearTimeout(t);},[]);
 return <div ref={ref} className={className} data-sparkles aria-hidden="true">{SPARKS.map(([x,y,d,z],i)=><span key={i} style={{'--x':x,'--y':y,'--d':`${d}s`,'--z':z} as React.CSSProperties}>✦</span>)}</div>;}
const SPARKS:[number,number,number,number][]=[[-0.08,0.11,1.6,0.52],[1.09,0.15,0.1,0.96],[0.06,-0.06,0.2,0.54],[0.13,1.07,0.3,0.67],[-0.13,0.34,1.4,0.85],[1.07,0.41,2.1,0.74],[0.26,-0.04,0.7,1.27],[0.26,1.06,1.5,0.82],[-0.07,0.51,0.1,0.66],[1.10,0.53,0.8,1.04],[0.49,-0.05,1.9,1.15],[0.45,1.06,1.3,1.33],[-0.09,0.72,2.4,0.57],[1.12,0.67,0.4,0.94],[0.60,-0.07,1.8,1.02],[0.75,1.05,1.7,1.04],[-0.10,0.87,2.0,1.39],[1.11,0.86,0.1,1.15]];
function Arrow({dir}:{dir:1|-1}){return <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d={dir===1?'M7 3.5 14 10l-7 6.5':'M13 3.5 6 10l7 6.5'} fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;}
