/**
 * The island's day clock for fishing content (Oct 15 2026; moved out of the removed weather.ts when the weather, the derby, photo
 * mode and the record boards were taken out: user decision, "too complicated"). Pure, safe anywhere (no window: sunset).
 *  - readTimeOfDay: the player's own Day / Sunset / Night setting (IslandSettings.tsx → localStorage `fi2-time-of-day`), never the
 *    real clock, so kids who only play after school still meet the night fish (nightFish.ts);
 *  - dayKey: the local day (YYYY-MM-DD) that the islander requests roll over on (requests.ts);
 *  - hash01: a small stable hash so every device sees the same requests on the same day.
 */
export type TimeOfDay='day'|'sunset'|'night';
export const TIME_KEY='fi2-time-of-day';
export function readTimeOfDay():TimeOfDay{try{const t=localStorage.getItem(TIME_KEY);if(t==='day'||t==='sunset'||t==='night')return t;}catch{/* no storage */}return 'sunset';}
/** Local day key (YYYY-MM-DD) for a timestamp. */
export const dayKey=(now:number)=>{const d=new Date(now);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
/** A small stable hash of a string (FNV-1a plus a final mix), 0..1. */
export function hash01(s:string){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}
 // A final avalanche (murmur3's), so nearby keys (consecutive days) spread evenly.
 h^=h>>>16;h=Math.imul(h,0x85ebca6b)>>>0;h^=h>>>13;h=Math.imul(h,0xc2b2ae35)>>>0;h^=h>>>16;return (h>>>0)/2**32;}
