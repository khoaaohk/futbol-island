'use client';
import {useEffect,useSyncExternalStore} from 'react';
import {diveStore,diveLift} from '@/lib/town/water/diveRuntime';

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
 // Oct 20 2026 (user): swim up / down inside the dive zone. Icon-only, held (pointer down / up), the water buttons' look; Q / Z on desktop.
 const hold=(dir:'up'|'down',on:boolean)=>(e:React.PointerEvent<HTMLButtonElement>)=>{e.preventDefault();if(on)e.currentTarget.setPointerCapture?.(e.pointerId);diveLift[dir]=on;};
 const depthBtn=(dir:'up'|'down')=><button type="button" className="dive-depth-btn" data-dive-depth={dir} aria-label={dir==='up'?'Swim up (hold) · Q':'Swim down (hold) · Z'} title={dir==='up'?'Swim up · Q':'Swim down · Z'}
  onPointerDown={hold(dir,true)} onPointerUp={hold(dir,false)} onPointerCancel={hold(dir,false)} onLostPointerCapture={()=>{diveLift[dir]=false;}} onContextMenu={e=>e.preventDefault()}>
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={dir==='up'?'M5 15l7-7 7 7':'M5 9l7 7 7-7'}/></svg></button>;
 return <>
  {v.diving?<div className="dive-depth" data-dive-depth-pad role="group" aria-label="Swim up or down">{depthBtn('up')}{depthBtn('down')}</div>:null}
  <div className="dive-breath" data-dive-breath hidden role="meter" aria-label="Breath" aria-valuemin={0} aria-valuemax={100} aria-valuenow={100}>
   <i aria-hidden="true"/><span>Breath</span>
  </div>
  {v.note?<p className="dive-note" role="status" data-dive-note>{v.note}</p>:null}
  {v.card?<button type="button" className="dive-card" data-dive-card={v.card.id} onClick={()=>diveStore.set({card:null})}>
   <small>{v.card.label}</small><b>{v.card.title}</b><span>{v.card.text}</span>
   {v.card.credit?<span className="dive-card-credit">Source: {v.card.credit}</span>:null}
   {v.card.story?<span className="dive-card-story">{v.card.story}</span>:null}
   {v.card.coins>0?<span className="dive-card-coins">+{v.card.coins} coins</span>:null}
   <span className="dive-card-close">Tap to close</span>
  </button>:null}
 </>;
}
