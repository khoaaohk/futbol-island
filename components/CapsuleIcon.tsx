/**
 * A flat, outlined two-tone gashapon capsule (the energy bolt icon's style): top half in the toy's first colour, bottom half in
 * its second, a green outline and a small shine. Shared by the island machine's card (GashaponMachineFace) and the arcade
 * machines' card (GashaponPanel). Size it with CSS (width/height on the className).
 */
export function CapsuleIcon({top,bottom,className}:{top:string;bottom:string;className?:string}){
 return <svg className={className} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
  <circle cx="8" cy="8" r="6.6" fill={bottom} stroke="#244d40" strokeWidth="1.4"/>
  <path d="M1.5 8a6.5 6.5 0 0 1 13 0Z" fill={top} stroke="#244d40" strokeWidth="1.4" strokeLinejoin="round"/>
  <path d="M4.4 4.6a4.6 4.6 0 0 1 2.4-1.5" fill="none" stroke="#fff6e4" strokeWidth="1.2" strokeLinecap="round"/>
 </svg>;
}
