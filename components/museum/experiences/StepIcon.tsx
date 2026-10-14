/**
 * Museum step / play icons as thin line SVGs (Oct 14 2026, user: "remove the emojis and use icons that fit with the rest of the
 * app and museum"). Characters like ◀ ▶ render as blue emoji tiles on iPhones; these draw in the button's ink instead.
 */
type Kind='prev'|'next'|'prev10'|'next10'|'play';
const PATHS:Record<Kind,string>={prev:'M14.5 6l-6 6 6 6',next:'M9.5 6l6 6-6 6',prev10:'M12 6l-6 6 6 6M18 6l-6 6 6 6',next10:'M6 6l6 6-6 6M12 6l6 6-6 6',play:'M8 5.5v13l10-6.5z'};
export default function StepIcon({kind,size=20}:{kind:Kind;size?:number}){
 return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false" style={{display:'block',flex:'none'}}>
  <path d={PATHS[kind]} fill={kind==='play'?'currentColor':'none'} stroke="currentColor" strokeWidth={kind==='play'?1.5:2.2} strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
