/**
 * Modern gallery tokens (Oct 10 2026, docs/museum-modern-style.md). The museum's exhibits share one quiet language: a warm
 * gallery-white ground, ink type, hairlines and ONE primary accent per exhibit. Import these instead of re-typing hex values.
 * Additive only: other exhibits use this file too, so add, never rename or remove.
 */
export const GROUND='#f6f4ef',INK='#1d1d1b',MUTED='#6b6a66',HAIR='#d9d6cf';
export const ACCENT={red:'#e4322b',blue:'#2a5bd7',yellow:'#f2c230',green:'#1f8a5b',black:'#1d1d1b'} as const;
export type AccentName=keyof typeof ACCENT;
/** The app's grotesque sans stack (Swiss / International style). */
export const SANS='"Helvetica Neue",Helvetica,Arial,var(--btn-font,Arial),sans-serif';
/** A damped spring (stiffness k, damping ratio z < 1) sampled into a CSS linear() easing, for one-shot WAAPI reveals. */
export function springLinear(k=220,z=.78,span=.9,n=32){
 const w0=Math.sqrt(k),wd=w0*Math.sqrt(1-z*z),pts:string[]=[];
 for(let i=0;i<=n;i++){const t=i/n*span,x=1-Math.exp(-z*w0*t)*(Math.cos(wd*t)+z*w0/wd*Math.sin(wd*t));pts.push((i===n?1:x).toFixed(3));}
 return `linear(${pts.join(',')})`;
}
export const prefersReducedMotion=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
/** One-shot staggered reveal (transform + opacity only): children fade up 10 px, 60 ms apart. No loop; skipped when reduced. */
export function revealStagger(root:Element|null,selector='[data-reveal]',step=60){
 if(!root||prefersReducedMotion())return;const ease=springLinear();
 root.querySelectorAll<HTMLElement>(selector).forEach((el,i)=>{try{el.animate([{transform:'translateY(10px)',opacity:0},{transform:'none',opacity:1}],{duration:620,delay:i*step,easing:ease,fill:'backwards'});}catch{}});
}
