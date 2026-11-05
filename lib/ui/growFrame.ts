// The grow-out-of-the-button modal morph (Play with friends / Join with a code in components/party/PartyHost.tsx; the live
// match picker in lib/town/liveJoinRuntime.ts grows out of the pitch bar's Play the same way).
/** Grow timing: card reveals out of the HUD button in ~300 ms, content fades in over the last 60%; shrink back in ~200 ms. */
export const GROW_IN_MS = 300;
export const GROW_OUT_MS = 200;
/** One grow keyframe: the card is clipped to a button-sized rounded box (constant corner radius, never stretched) and moved so that
 *  box sits over the HUD button; `box` null is the resting card. Translate + clip only: nothing is scaled, so no oval. */
export function growFrame(box: DOMRect | null, el: HTMLElement): Keyframe {
  const r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 24;
  if (!box) return { transform: 'none', clipPath: `inset(0px round ${r}px)` };
  const c = el.getBoundingClientRect();
  const ix = Math.max(0, (c.width - box.width) / 2), iy = Math.max(0, (c.height - box.height) / 2);
  const dx = box.left + box.width / 2 - (c.left + c.width / 2), dy = box.top + box.height / 2 - (c.top + c.height / 2);
  return { transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`, clipPath: `inset(${iy.toFixed(1)}px ${ix.toFixed(1)}px round ${Math.min(r, box.width / 2)}px)` };
}


