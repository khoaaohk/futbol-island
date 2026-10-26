'use client';
import {useEffect,useSyncExternalStore} from 'react';
import {diveStore,diveLift,DIVE_CARD_HOLD} from '@/lib/town/water/diveRuntime';
import {toastLane,useToastLaneBusy} from '@/lib/ui/toastLane';
import {holdCardOffers} from '@/lib/town/cardOfferHold';

/** The find card's holder id (cardOfferHold.ts): a card choice earned by an explore ball waits until its lesson card closes. The
 *  runtime takes the hold as the card shows (no render race with CardOfferHost); this releases it when the card closes. */
const CARD_HOLD=DIVE_CARD_HOLD;

/**
 * The dive's HUD (water P2, Oct 16 2026; docs/swimming-research.md "P2 implemented: one spot"): the breath ring (the pace lesson:
 * the island's loop writes its `--breath` CSS variable at most 10 times a second, no React render per frame), the find card
 * (a Real football fact with its plain-text source, a Coaching idea or Island story, never a link) and the calm breath notes.
 * Renders only when the dive store changes (a find, a note, going under or coming up).
 */
/** Whether an edge chip has shown yet this page visit (the first one may wait longer for the welcome toast and lesson cards). */
let edgeChipSeen=false;
/** When the Say hi button last waved (a second tap within 2 s is the high five). */
let lastWave=0;
export default function DiveHud(){
 const v=useSyncExternalStore(diveStore.subscribe,diveStore.get,diveStore.server);
 // Calm HUD (Oct 21 2026, user: "only show one at a time"): the note takes the one toast lane too (a lesson card or the edge chip
 // showing first makes it wait; one that waited 6 s is dropped), and fades by itself after 4 s on screen. The find card holds the
 // lane while it shows (a blocking card: no note, chip or lesson starts over it).
 const noteBusy=useToastLaneBusy('dive-note'),card=!!v.card,note=v.note&&!noteBusy&&!card?v.note:'';
 useEffect(()=>{if(!note)return;if(!toastLane.request('dive-note'))return;const t=setTimeout(()=>diveStore.set({note:''}),4000);return ()=>{clearTimeout(t);toastLane.release('dive-note');};},[note]);
 useEffect(()=>{if(!v.note||note)return;toastLane.want('dive-note');const t=setTimeout(()=>{toastLane.cancel('dive-note');diveStore.set({note:''});},6000);return ()=>clearTimeout(t);},[v.note,note]);
 useEffect(()=>{if(!card)return;toastLane.hold('card',true);holdCardOffers(CARD_HOLD,true);return ()=>{toastLane.hold('card',false);holdCardOffers(CARD_HOLD,false);};},[card]);
 // Seamless Explore (Oct 21 2026): the edge chip ("Entering: …" / "Leaving the reef") clears itself after its 2.4 s fade.
 // Explore delight (Oct 21 2026, user rule "only one thing at a time"): the chip takes the HUD stack's toast lane while it shows, so the
 // one-time lesson card (SwimLessonToast, same lane) waits for it, and the chip waits for a card already showing. Never both at once.
 const laneBusy=useToastLaneBusy('dive-edge'),chip=v.banner&&!laneBusy&&!v.card?v.banner:'';
 useEffect(()=>{if(!chip)return;if(!toastLane.request('dive-edge'))return;const t=setTimeout(()=>diveStore.set({banner:''}),2400);return ()=>{clearTimeout(t);toastLane.release('dive-edge');};},[chip]);
 // A chip that waited 4 s behind other notes is stale (the arrival note already names the zone): it is dropped, never shown late.
 // Oct 21 2026 (user: go with the recommendation): the FIRST edge chip of a visit may wait 10 s (a fresh save queues the welcome toast and
 // the one-time lesson cards ahead of it); later chips keep the 4 s limit.
 useEffect(()=>{if(!v.banner||chip)return;const t=setTimeout(()=>diveStore.set({banner:''}),edgeChipSeen?4000:10000);return ()=>clearTimeout(t);},[v.banner,chip]);
 useEffect(()=>{if(chip)edgeChipSeen=true;},[chip]);
 // Oct 20 2026 (user): swim up / down inside the dive zone; later that day the reef became shallow, so these rise to the top (air) or dip lower over the reef, and the diver follows the seabed. Icon-only, held (pointer down / up), the water buttons' look; Q / Z on desktop.
 const hold=(dir:'up'|'down',on:boolean)=>(e:React.PointerEvent<HTMLButtonElement>)=>{e.preventDefault();if(on)e.currentTarget.setPointerCapture?.(e.pointerId);diveLift[dir]=on;};
 const depthBtn=(dir:'up'|'down')=><button type="button" className="dive-depth-btn" data-dive-depth={dir} aria-label={dir==='up'?'Rise toward the top (hold) · Q':'Dip lower over the reef (hold) · Z'} title={dir==='up'?'Rise · Q':'Dip lower · Z'}
  onPointerDown={hold(dir,true)} onPointerUp={hold(dir,false)} onPointerCancel={hold(dir,false)} onLostPointerCapture={()=>{diveLift[dir]=false;}} onContextMenu={e=>e.preventDefault()}>
  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={dir==='up'?'M5 15l7-7 7 7':'M5 9l7 7 7-7'}/></svg></button>;
 return <>
  {v.diving?<div className="dive-vignette" aria-hidden="true"/>:null}
  {v.diving?<div className="dive-depth" data-dive-depth-pad role="group" aria-label="Rise or dip lower">{depthBtn('up')}{depthBtn('down')}</div>:null}
  {/* The Dart button was removed (Oct 21 2026, user: "let's remove the dart action").
      The room's action grid (Calm HUD, Oct 21 2026, user: "move the emote btn to the left of the down btn ... a grid of 2 rows and 3
      columns"; cells in globals.css / docs/ui/HUD_STACK.md): ONE "Say hi" button at the bottom right (Oct 22 2026 layout: the right column, under Fly), only while the zone's friend is in
      reach (G / H on desktop still wave / high five). A tap waves; a second tap within 2 s is the high five. */}
  {v.diving&&v.friend?<div className="dive-emote" data-dive-emote role="group" aria-label={`Say hi to ${v.friend}`}>
   <button type="button" className="dive-emote-btn" data-dive-emote-btn="hi" aria-label={`Say hi to ${v.friend}: tap to wave, tap again for a high five · G / H`} title="Wave · G, then High five · H"
    onPointerDown={e=>{e.preventDefault();const t=performance.now(),again=t-lastWave<2000;if(again){diveLift.emote='five';lastWave=0;}else{diveLift.emote='wave';lastWave=t;}}} onContextMenu={e=>e.preventDefault()}>
    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 11V5a1.5 1.5 0 0 1 3 0v6M14 11V6.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 6.5-6 6.5-2.6 0-4.2-1.3-5.5-3.6L4 14a1.4 1.4 0 0 1 2.3-1.5L8 14.5"/><path d="M19 3.5c1 .8 1.6 1.9 1.7 3.1M3.5 5.5C4 4.4 4.9 3.6 6 3.2"/></svg></button>
  </div>:null}
  {/* The "Reef n/12" chip and its hearts were removed (Oct 21 2026, user: "remove this, we don't need it"); the journey, hearts and
      the restore card still count and save, and their rewards arrive as the one note / card in the toast lane. */}
  <div className="dive-breath" data-dive-breath hidden role="meter" aria-label="Breath" aria-valuemin={0} aria-valuemax={100} aria-valuenow={100}>
   <i aria-hidden="true"/><span>Breath</span>
  </div>
  {/* Explore delight: the edge chip and the note share one column (the chip on top), so neither can sit on the other. */}
  {chip||note?<div className="dive-msgs">
   {chip?<p className="dive-edge-chip" role="status" data-dive-edge key={chip}>{chip}</p>:null}
   {note&&!chip?<p className="dive-note" role="status" data-dive-note>{note}</p>:null}
  </div>:null}
  {v.card?<button type="button" className="dive-card" data-dive-card={v.card.id} onClick={()=>diveStore.set({card:null})}>
   <small>{v.card.lesson?`Mini lesson · ${v.card.label}`:v.card.label}</small><b>{v.card.title}</b><span>{v.card.text}</span>
   {v.card.credit?<span className="dive-card-credit">Source: {v.card.credit}</span>:null}
   {v.card.story?<span className="dive-card-story">{v.card.story}</span>:null}
   {v.card.coins>0?<span className="dive-card-coins">+{v.card.coins} coins</span>:null}
  </button>:null}
 </>;
}
