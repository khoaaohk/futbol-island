'use client';
import {useEffect,useSyncExternalStore} from 'react';
import {diveStore} from '@/lib/town/water/diveRuntime';

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
 return <>
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
