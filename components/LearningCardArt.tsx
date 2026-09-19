/** Original pitch illustration for a learning card, not a portrait or official player collectible. */
export default function LearningCardArt({size=64}:{size?:number}){
 return <svg width={size} height={size} viewBox="0 0 88 88" aria-hidden="true" style={{flexShrink:0}}><rect width="88" height="88" rx="15" fill="#397e79"/><g fill="none" stroke="#e8e9c3" strokeWidth="1.5"><rect x="12" y="12" width="64" height="64" rx="2"/><path d="M12 44h64M32 12v13h24V12M32 76V63h24v13"/><circle cx="44" cy="44" r="10"/></g><path d="M29 62Q52 57 59 33m-10 6 10-6 2 12" fill="none" stroke="#f6ce75" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="29" cy="62" r="6" fill="#fff5d3"/></svg>;
}
