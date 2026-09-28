/**
 * Flat island-style pocket icons drawn in the same way as FishArt (flat fills, soft highlight strokes, #244d40 ink details,
 * one inline SVG, nothing to load). Used by the top-bar island pocket and the onboarding "Earn coins" step so both match.
 */
const INK='#244d40';

/** A half-time orange with a leaf: the island's fruit & veg icon. */
export function FruitArt({size=40,color='#f08a2c'}:{size?:number;color?:string}){
 return <svg viewBox="0 0 48 48" width={size} height={size} role="img" aria-label="Fruit">
  <circle cx="24" cy="27" r="17" fill={color}/>
  <path d="M13 31c3 6 10 9 17 7" stroke="#c9661a" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".55"/>
  <path d="M15 21c2-4 6-6 10-6" stroke="#ffd29a" strokeWidth="3.4" fill="none" strokeLinecap="round"/>
  <path d="M24 11c1-4 3-6 5-7" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round"/>
  <path d="M25 11c3-6 11-7 14-4-3 5-9 6-14 4z" fill="#6f9c55"/>
  <path d="M27 10c3-2 6-3 9-3" stroke="#a9cf86" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
 </svg>;
}

/** A job-board clipboard with a training cone and a tick: island jobs (set out cones, rake leaves, ball kid). */
export function JobsArt({size=40}:{size?:number}){
 return <svg viewBox="0 0 48 48" width={size} height={size} role="img" aria-label="Jobs">
  <rect x="8" y="7" width="30" height="37" rx="4" fill="#b8643a"/>
  <rect x="11.5" y="11" width="23" height="29.5" rx="2" fill="#fff4dc"/>
  <rect x="16" y="4.5" width="14" height="7" rx="2.5" fill="#d9a93c"/>
  <circle cx="23" cy="8" r="1.6" fill={INK}/>
  <path d="M15 19l2.6 2.6L22 17" stroke="#4f9a74" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M25 19.5h6.5M15 27h8M15 33h6" stroke="#c9b58f" strokeWidth="2.4" strokeLinecap="round"/>
  <path d="M36.5 25 43 42h-13z" fill="#f08a2c"/>
  <path d="M33.4 34h6.2" stroke="#fff4dc" strokeWidth="2.6" strokeLinecap="round"/>
  <rect x="28" y="41" width="17" height="3.4" rx="1.7" fill="#d9772f"/>
 </svg>;
}
