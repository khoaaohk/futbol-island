'use client';
import {useEffect,useSyncExternalStore} from 'react';
import {diveStore,diveLift} from '@/lib/town/water/diveRuntime';
import {toastLane,useToastLaneBusy} from '@/lib/ui/toastLane';

/**
 * The dive's HUD (water P2, Oct 16 2026; docs/swimming-research.md "P2 implemented: one spot"): the breath ring (the pace lesson:
 * the island's loop writes its `--breath` CSS variable at most 10 times a second, no React render per frame), the find card
 * (a Real football fact with its plain-text source, a Coaching idea or Island story, never a link) and the calm breath notes.
 * Renders only when the dive store changes (a find, a note, going under or coming up).
 */
export default function DiveHud(){
 const v=useSyncExternalStore(diveStore.subscribe,diveStore.get,diveStore.server);
 // A note fades by itself after a few seconds (one timer while one shows; none at rest).
 useEffect(()=>{if(!v.note)return;const t=setTimeout(()=>diveStore.set({note:''}),5000);return ()=>clearTimeout(t);},[v.note]);
 // Seamless Explore (Oct 21 2026): the edge chip ("Entering: …" / "Leaving the reef") clears itself after its 2.4 s fade.
 // Explore delight (Oct 21 2026, user rule "only one thing at a time"): the chip takes the HUD stack's toast lane while it shows, so the
 // one-time lesson card (SwimLessonToast, same lane) waits for it, and the chip waits for a card already showing. Never both at once.
 const laneBusy=useToastLaneBusy('dive-edge'),chip=v.banner&&!laneBusy?v.banner:'';
 useEffect(()=>{if(!chip)return;if(!toastLane.request('dive-edge'))return;const t=setTimeout(()=>diveStore.set({banner:''}),2400);return ()=>{clearTimeout(t);toastLane.release('dive-edge');};},[chip]);
 // A chip that waited 4 s behind other notes is stale (the arrival note already names the zone): it is dropped, never shown late.
 useEffect(()=>{if(!v.banner||chip)return;const t=setTimeout(()=>diveStore.set({banner:''}),4000);return ()=>clearTimeout(t);},[v.banner,chip]);
 // Oct 20 2026 (user): swim up / down inside the dive zone; later that day the reef became shallow, so these rise to the top (air) or dip lower over the reef, and the diver follows the seabed. Icon-only, held (pointer down / up), the water buttons' look; Q / Z on desktop.
 const hold=(dir:'up'|'down',on:boolean)=>(e:React.PointerEvent<HTMLButtonElement>)=>{e.preventDefault();if(on)e.currentTarget.setPointerCapture?.(e.pointerId);diveLift[dir]=on;};
 const depthBtn=(dir:'up'|'down')=><button type="button" className="dive-depth-btn" data-dive-depth={dir} aria-label={dir==='up'?'Rise toward the top (hold) · Q':'Dip lower over the reef (hold) · Z'} title={dir==='up'?'Rise · Q':'Dip lower · Z'}
  onPointerDown={hold(dir,true)} onPointerUp={hold(dir,false)} onPointerCancel={hold(dir,false)} onLostPointerCapture={()=>{diveLift[dir]=false;}} onContextMenu={e=>e.preventDefault()}>
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={dir==='up'?'M5 15l7-7 7 7':'M5 9l7 7 7-7'}/></svg></button>;
 return <>
  {v.diving?<div className="dive-vignette" aria-hidden="true"/>:null}
  {v.diving?<div className="dive-depth" data-dive-depth-pad role="group" aria-label="Rise or dip lower">{depthBtn('up')}{depthBtn('down')}</div>:null}
  {/* Explore v2 (Oct 21 2026): a quick burst forward (tap; F / Shift on desktop), and the zone's journey progress (pickups + finds). */}
  {v.diving?<button type="button" className="dive-dart-btn" data-dive-dart aria-label="Dart: a quick burst forward · F" title="Dart · F"
   onPointerDown={e=>{e.preventDefault();diveLift.dart=true;}} onContextMenu={e=>e.preventDefault()}>
   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h9M9 7l5 5-5 5M15 7l5 5-5 5"/></svg></button>:null}
  {/* Explore delight (Oct 21 2026): wave / high five the zone's friend (shown only while it is within reach; G / H on desktop). */}
  {v.diving&&v.friend?<div className="dive-emote" data-dive-emote role="group" aria-label={`Say hi to ${v.friend}`}>
   <button type="button" className="dive-emote-btn" data-dive-emote-btn="wave" aria-label={`Wave to ${v.friend} · G`} title="Wave · G" onPointerDown={e=>{e.preventDefault();diveLift.emote='wave';}} onContextMenu={e=>e.preventDefault()}>
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 11V5a1.5 1.5 0 0 1 3 0v6M14 11V6.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 6.5-6 6.5-2.6 0-4.2-1.3-5.5-3.6L4 14a1.4 1.4 0 0 1 2.3-1.5L8 14.5"/><path d="M19 3.5c1 .8 1.6 1.9 1.7 3.1M3.5 5.5C4 4.4 4.9 3.6 6 3.2"/></svg></button>
   <button type="button" className="dive-emote-btn" data-dive-emote-btn="five" aria-label={`High five ${v.friend} · H`} title="High five · H" onPointerDown={e=>{e.preventDefault();diveLift.emote='five';}} onContextMenu={e=>e.preventDefault()}>
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 21v-9.5a1.5 1.5 0 0 1 3 0V10V4.5a1.5 1.5 0 0 1 3 0V10V5.5a1.5 1.5 0 0 1 3 0v5V8a1.5 1.5 0 0 1 3 0v6c0 4-2.7 7-6.5 7H7"/><path d="M4 9l-1.5-1M4.5 5.5 3 3.5M8 2.5V1"/></svg></button>
  </div>:null}
  {v.diving&&v.reef?<p className="dive-reef" data-dive-reef data-restored={v.restored?'':undefined} role="status" aria-label={`Reef ${v.reef}${v.restored?', restored':''}${v.hearts?`, ${v.hearts} of 3 friendship hearts`:''}`}><i aria-hidden="true">{v.restored?'★':'✦'}</i>Reef {v.reef}{v.hearts?<b className="dive-hearts" data-dive-hearts={v.hearts} aria-hidden="true">{'♥'.repeat(v.hearts)}{'♡'.repeat(Math.max(0,3-v.hearts))}</b>:null}</p>:null}
  <div className="dive-breath" data-dive-breath hidden role="meter" aria-label="Breath" aria-valuemin={0} aria-valuemax={100} aria-valuenow={100}>
   <i aria-hidden="true"/><span>Breath</span>
  </div>
  {/* Explore delight: the edge chip and the note share one column (the chip on top), so neither can sit on the other. */}
  {chip||v.note?<div className="dive-msgs">
   {chip?<p className="dive-edge-chip" role="status" data-dive-edge key={chip}>{chip}</p>:null}
   {v.note?<p className="dive-note" role="status" data-dive-note>{v.note}</p>:null}
  </div>:null}
  {v.card?<button type="button" className="dive-card" data-dive-card={v.card.id} onClick={()=>diveStore.set({card:null})}>
   <small>{v.card.label}</small><b>{v.card.title}</b><span>{v.card.text}</span>
   {v.card.credit?<span className="dive-card-credit">Source: {v.card.credit}</span>:null}
   {v.card.story?<span className="dive-card-story">{v.card.story}</span>:null}
   {v.card.coins>0?<span className="dive-card-coins">+{v.card.coins} coins</span>:null}
   <span className="dive-card-close">Tap to close</span>
  </button>:null}
 </>;
}
