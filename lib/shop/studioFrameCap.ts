import {PHONE_FRAME_MS,frameCapSlot} from '../town/frameCap';
export {frameCapSlot};

/**
 * The studios' phone frame cap (Oct 13 2026, heat audit: the Jersey, Ball and Boot studios drew 60 fps on phones while you spun or
 * dragged, breaking the game's 30 fps phone rule). On a touch device (a coarse pointer, or a touch screen with no hover) every
 * studio frame sits on the island's 33.3 ms slot grid (lib/town/frameCap.ts frameCapSlot); a rAF that arrives early is skipped
 * and re-requested, so nothing runs at rest and the inertia, measured from the last RENDERED frame, stays frame-rate independent.
 * Desktop (a fine pointer with hover) returns 0: uncapped, as before.
 */
export function studioFrameMs():number{
 if(typeof window==='undefined'||typeof window.matchMedia!=='function')return 0;
 const coarse=window.matchMedia('(pointer:coarse)').matches;
 const touch=(navigator.maxTouchPoints||0)>0&&window.matchMedia('(hover:none)').matches;
 return coarse||touch?PHONE_FRAME_MS:0;
}
