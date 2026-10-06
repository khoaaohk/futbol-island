/**
 * The living room around the 1970 set (polish pass, Oct 5 2026): the teak stand the TV stands on, and a floor lamp for wide
 * screens. Static SVG, drawn once; light comes from the upper left, like the lamp glow and the screen's glass highlight.
 */
export function Stand({className}:{className?:string}){
 return <svg className={className} viewBox="0 0 400 44" preserveAspectRatio="none" aria-hidden="true" focusable="false">
  <defs>
   <linearGradient id="tvStandTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9a6a40"/><stop offset=".5" stopColor="#6e4527"/><stop offset="1" stopColor="#3f2614"/></linearGradient>
   <linearGradient id="tvStandLeg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8a5a34"/><stop offset=".6" stopColor="#5c3820"/><stop offset="1" stopColor="#3a2212"/></linearGradient>
  </defs>
  {/* back legs: shorter, darker, set in */}
  <path d="M112 9 L120 9 L114 36 L109 36 Z" fill="#2c1a0e"/>
  <path d="M280 9 L288 9 L291 36 L286 36 Z" fill="#2c1a0e"/>
  {/* front legs: tapered and splayed, with brass feet */}
  <path d="M66 9 L82 9 L66 40 L58 40 Z" fill="url(#tvStandLeg)"/>
  <path d="M318 9 L334 9 L342 40 L334 40 Z" fill="url(#tvStandLeg)"/>
  <rect x="56.5" y="39" width="10" height="4" rx="1.5" fill="#c9a25a"/>
  <rect x="333.5" y="39" width="10" height="4" rx="1.5" fill="#c9a25a"/>
  {/* the plinth */}
  <rect x="44" y="0" width="312" height="11" rx="3" fill="url(#tvStandTop)"/>
  <rect x="44" y="0" width="312" height="1.5" fill="#c08a58" opacity=".55"/>
 </svg>;
}

export function Lamp({className}:{className?:string}){
 return <svg className={className} viewBox="0 0 120 420" aria-hidden="true" focusable="false">
  <defs>
   <linearGradient id="tvLampShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#f2b35a"/><stop offset=".55" stopColor="#d9822e"/><stop offset="1" stopColor="#8e4a17"/></linearGradient>
   <radialGradient id="tvLampGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ffcf7a" stopOpacity=".55"/><stop offset="1" stopColor="#ffcf7a" stopOpacity="0"/></radialGradient>
  </defs>
  <ellipse cx="60" cy="78" rx="60" ry="46" fill="url(#tvLampGlow)"/>
  <rect x="57.5" y="70" width="5" height="330" rx="2.5" fill="#2a1d14"/>
  <rect x="57.5" y="70" width="1.6" height="330" fill="#6b5237"/>
  <ellipse cx="60" cy="408" rx="34" ry="8" fill="#1d140d"/>
  <ellipse cx="60" cy="404" rx="30" ry="6" fill="#3a291b"/>
  <path d="M30 18 L90 18 L108 82 L12 82 Z" fill="url(#tvLampShade)"/>
  <path d="M12 82 L108 82 L106 86 L14 86 Z" fill="#7a3e12"/>
  <ellipse cx="60" cy="84" rx="44" ry="5" fill="#ffe0a0" opacity=".7"/>
 </svg>;
}
