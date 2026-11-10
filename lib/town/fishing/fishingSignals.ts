/**
 * Tiny, boot-safe fishing signals (load-time pass, Nov 10 2026, docs/performance-guide.md "Rare activities load on demand").
 * FishingHost (the cast / reel / catch UI, the Fishbook and the market stand) is not in the island boot chunk:
 * components/FishingHostLazy.tsx mounts it when the player first comes within fishingWorld's prefetch range of a spot
 * (FISHING_NEAR_EVENT, once per page), when a fishing session starts, or when something asks for the market stand.
 */
/** Other features open the stand with `window.dispatchEvent(new CustomEvent(OPEN_MARKET_STAND))` (detail: {tab, place}). */
export const OPEN_MARKET_STAND='fi2-open-market-stand';
/** Fired once, the first time the player is within the fishing visuals' prefetch range (lib/town/fishing/fishingWorld.ts). */
export const FISHING_NEAR_EVENT='fi2-fishing-near';
let near=false;
export const fishingNearSeen=()=>near;
export function markFishingNear(){if(near)return;near=true;try{window.dispatchEvent(new Event(FISHING_NEAR_EVENT));}catch{/* no window (tests) */}}
