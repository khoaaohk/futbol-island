'use client';
/**
 * The Summit Isle painting easel's UI (Oct 14 2026): the world-anchored "Paint the view" prompt and, once seated, a slim painter's
 * tray. The paper is the easel's own 3D board ("the painting portion should be on the easel, not two separate"): a finger or the
 * mouse on the board paints on it (lib/graphics/paintEasel.ts maps the screen point to the paper through the board's plane and
 * shows the paper as the board's texture). The view stays the star: the tray is one compact row at the bottom of a phone, or a small
 * palette board beside the easel on a wide screen; "Just look" hides it and pulls the camera back to the full view. No score.
 *
 * Tools: a round brush, a soft watercolour wash, a fill bucket, an eraser, and "pick a colour" (from the painting, from the view
 * under bare paper, or from the view itself: the snapshots the runtime took when you sat down); three sizes; twelve colours from the
 * scene; undo, clear (tap twice), the picture style (the pink button, Oct 15 2026: Blank paper → Trace → Pastel → Watercolour →
 * Sketch → Oil paint → Comic → Dots, lib/town/paintStyles.ts; its name shows briefly as you tap), Save (the last few on this device
 * only) and "My paintings" (keep painting one, hang it on the easel in the world, or delete it with a second tap).
 * Done (top right) saves unsaved work and leaves; Escape does the same.
 *
 * The art styles put the whole view, made into that kind of picture, under the paint: a starting canvas to paint over (the
 * eraser only takes off your own paint, so the picture shows through again; the fill bucket fills the picture's shapes), saved
 * together with your paint (what you see is what you save). Trace stays a faint guide and is not saved, like tracing paper.
 *
 * Heat: drawing happens only on pointer events, coalesced into one requestAnimationFrame while a finger is down (none at rest), and
 * each drawn frame tells the runtime once (`painted`): the board uploads at most once per island frame. No timers, no polling.
 *
 * Load-time pass (Nov 10 2026, docs/performance-guide.md): only the prompt is in the island boot chunk. The tray (./PaintEaselStudio.tsx)
 * loads when the prompt is touched or the child sits down; if its chunk cannot load, the easel lets the child stand up again
 * (the activity is just not available this time) and the next sit-down retries.
 */
import {useCallback,useSyncExternalStore} from 'react';
import {easelStore,easelActions} from '@/lib/town/paintEaselStore';
import {useLazyPart} from '@/lib/ui/useLazyPart';

export const loadEaselStudio=()=>import('./PaintEaselStudio');

export default function PaintEasel(){
 const v=useSyncExternalStore(easelStore.subscribe,easelStore.get,easelStore.server);
 const failed=useCallback(()=>{if(easelStore.get().seated)easelActions.exit();},[]);
 const Studio=useLazyPart(loadEaselStudio,v.seated,failed);
 return <>
  <button type="button" className="store-enter-prompt" data-easel-open aria-label="Paint the view" hidden onPointerDown={()=>{void loadEaselStudio().catch(()=>undefined);}} onClick={()=>easelActions.open()}>Paint the view</button>
  {v.seated&&v.sheet&&Studio&&<Studio v={v} sheet={v.sheet}/>}
 </>;
}
