/**
 * Flat island-style pocket icons drawn in the same way as FishArt (flat fills, soft highlight strokes, #244d40 ink details,
 * one inline SVG, nothing to load). Used by the top-bar island pocket and the onboarding "Earn coins" step so both match;
 * the Ball hunt step (Find → Learn a tip → Costumes) uses the same family.
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

/** A hidden island ball lying in the grass: the Ball hunt's "Find". */
export function HuntBallArt({size=40}:{size?:number}){
 return <svg viewBox="0 0 48 48" width={size} height={size} role="img" aria-label="Ball">
  <ellipse cx="24" cy="43" rx="14" ry="2.6" fill="#6f9c55" opacity=".55"/>
  <defs><clipPath id="hunt-ball-clip"><circle cx="24" cy="23" r="18"/></clipPath></defs>
  <circle cx="24" cy="23" r="18" fill="#fff9ec"/>
  <g clipPath="url(#hunt-ball-clip)">
   <path d="M8 30c5 9 18 12 28 6" stroke="#d9cdb0" strokeWidth="5" fill="none" strokeLinecap="round"/>
   <path d="M24 16l7.1 5.2-2.7 8.3h-8.8l-2.7-8.3z" fill={INK}/>
   <path d="M24 16V8.5M31.1 21.2l7.2-2.3M28.4 29.5l4.4 6.1M19.6 29.5l-4.4 6.1M16.9 21.2l-7.2-2.3" stroke={INK} strokeWidth="2.2" strokeLinecap="round"/>
   <path d="M18.5 1.5h11L31 8.5l-7 3-7-3z" fill={INK}/>
   <path d="M39 13l6 2 1 9-6 1-3.2-6.3z" fill={INK}/><path d="M9 13l-6 2-1 9 6 1 3.2-6.3z" fill={INK}/>
   <path d="M35.5 34.5l5 .5-2 9-7 1-.6-6.5z" fill={INK}/><path d="M12.5 34.5l-5 .5 2 9 7 1 .6-6.5z" fill={INK}/>
  </g>
  <path d="M12 16c2-4.5 6-7.5 11-8.4" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".9"/>
 </svg>;
}

/** An open lesson book with a lit tip star: each found ball's "Learn a tip". */
export function TipBookArt({size=40}:{size?:number}){
 return <svg viewBox="0 0 48 48" width={size} height={size} role="img" aria-label="Tip book">
  <path d="M4 14c7-2 14-1 20 3 6-4 13-5 20-3v26c-7-2-14-1-20 3-6-4-13-5-20-3z" fill="#2e7867"/>
  <path d="M7 13c6-1.6 12-.6 17 3v24c-5-3.4-11-4.4-17-3z" fill="#fff4dc"/>
  <path d="M41 13c-6-1.6-12-.6-17 3v24c5-3.4 11-4.4 17-3z" fill="#f6e7c4"/>
  <path d="M24 16v24" stroke="#c9b58f" strokeWidth="1.6"/>
  <path d="M11 22c3-.6 6-.3 9 1M11 27.5c3-.6 6-.3 9 1M11 33c3-.6 6-.3 9 1M28 28.5c3-1.3 6-1.6 9-1M28 34c3-1.3 6-1.6 9-1" stroke="#c9b58f" strokeWidth="2" fill="none" strokeLinecap="round"/>
  <path d="m33 7 2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7z" fill="#f4c64a" stroke="#c9a032" strokeWidth="1" strokeLinejoin="round"/>
 </svg>;
}

/** An animal-ear costume hood with a club star badge: the club costumes the Ball hunt unlocks. */
export function CostumeHoodArt({size=40}:{size?:number}){
 return <svg viewBox="0 0 48 48" width={size} height={size} role="img" aria-label="Costume">
  <path d="M10 18 7 5l11 7zM38 18l3-13-11 7z" fill="#d9772f"/>
  <path d="M11 15.5 9.4 9l5 3.4zM37 15.5l1.6-6.5-5 3.4z" fill="#f0b1cc"/>
  <path d="M24 8c11 0 17 8 17 18v15c0 2-2 3-4 3H11c-2 0-4-1-4-3V26C7 16 13 8 24 8z" fill="#f08a2c"/>
  <ellipse cx="24" cy="27" rx="11" ry="10.5" fill="#fff4dc"/>
  <circle cx="19.5" cy="26" r="1.8" fill={INK}/><circle cx="28.5" cy="26" r="1.8" fill={INK}/>
  <path d="M21 31c1.8 1.6 4.2 1.6 6 0" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round"/>
  <path d="M12 17c2-4 5-6 9-7" stroke="#ffd29a" strokeWidth="3" fill="none" strokeLinecap="round"/>
  <circle cx="36" cy="38" r="4.4" fill="#f4c64a"/>
  <path d="m36 35.4.8 1.7 1.9.3-1.4 1.3.3 1.9-1.6-.9-1.6.9.3-1.9-1.4-1.3 1.9-.3z" fill="#fff4dc"/>
 </svg>;
}

/** A friendly padlock with a football keyhole and a gold star: the title screen's "made for kids, nothing collected" step (Oct 9 2026). */
export function SafeLockArt({size=40}:{size?:number}){
 return <svg viewBox="0 0 48 48" width={size} height={size} role="img" aria-label="Safe and private">
  <path d="M14 22v-6c0-6 4.5-10 10-10s10 4 10 10v6" stroke="#d9a93c" strokeWidth="5" fill="none" strokeLinecap="round"/>
  <path d="M17.5 13c1-3 3.4-4.6 6.5-4.6" stroke="#f4d98a" strokeWidth="2" fill="none" strokeLinecap="round"/>
  <rect x="7" y="20" width="34" height="24" rx="7" fill="#2e7867"/>
  <path d="M11 26c1-2.4 3-3.6 6-3.8" stroke="#6fb59c" strokeWidth="2.6" fill="none" strokeLinecap="round"/>
  <circle cx="24" cy="32" r="7.4" fill="#fff9ec"/>
  <path d="M24 28.2l3.3 2.4-1.3 3.9h-4l-1.3-3.9z" fill={INK}/>
  <path d="M24 28.2v-3M27.3 30.6l3-1M26 34.5l1.8 2.4M22 34.5l-1.8 2.4M20.7 30.6l-3-1" stroke={INK} strokeWidth="1.5" strokeLinecap="round"/>
  <path d="m38 4 1.7 3.4 3.8.6-2.8 2.7.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.7 3.8-.6z" fill="#f4c64a" stroke="#c9a032" strokeWidth="1" strokeLinejoin="round"/>
 </svg>;
}
