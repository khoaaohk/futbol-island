/**
 * IDP motion kit (docs/idp/DESIGN.md §6). The same damped-spring maths as the museum's worldcup-1930 kit, kept separate so
 * neither feature depends on the other. Nothing here runs a loop: springs are SAMPLED into Web Animations keyframes (the
 * compositor plays them and they end), and CSS uses the matching `linear()` easing. At rest the IDP has zero rAF callbacks
 * and zero running animations (tests/coaches-idp-browser.cjs measures it).
 */
export function springSamples(k=260,c=22,v0=0):number[]{
 const s={x:0,v:v0},out=[0];
 for(let i=0;i<240;i++){const n=4,h=1/60/n;for(let j=0;j<n;j++){const a=-k*(s.x-1)-c*s.v;s.v+=a*h;s.x+=s.v*h;}out.push(s.x);if(Math.abs(s.v)<.016&&Math.abs(s.x-1)<.002)break;}
 out[out.length-1]=1;return out;
}
/** CSS `linear()` easing for a spring (used in the CSS modules as --idp-spring); a few decimals is plenty. */
export function springEasing(k=260,c=22){const p=springSamples(k,c);const step=Math.max(1,Math.floor(p.length/40));const pts=p.filter((_,i)=>i%step===0||i===p.length-1);return `linear(${pts.map(v=>+v.toFixed(3)).join(',')})`;}
export const prefersReducedMotion=()=>typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Cancel every animation on an element and its subtree (so a quick tap interrupts cleanly instead of stacking). */
export function settle(el:Element|null){if(!el)return;try{for(const a of el.getAnimations({subtree:true}))a.finish();}catch{}}
/**
 * FLIP with a spring: animate `el` from where it WAS (`from`) to where it is now. Interruptible: a newer flip on the same
 * element replaces this one. Skipped under reduced motion (the element is simply in its new place).
 */
export function flipFrom(el:HTMLElement,from:DOMRect,o:{k?:number;c?:number;scale?:boolean}={}){
 if(prefersReducedMotion())return;
 const to=el.getBoundingClientRect();if(!to.width||!to.height)return;
 const dx=from.left-to.left,dy=from.top-to.top,sx=o.scale?from.width/to.width:1,sy=o.scale?from.height/to.height:1;
 if(Math.abs(dx)<.5&&Math.abs(dy)<.5&&Math.abs(sx-1)<.01&&Math.abs(sy-1)<.01)return;
 const p=springSamples(o.k??240,o.c??24);
 try{for(const a of el.getAnimations())if((a as Animation&{id:string}).id==='idp-flip')a.cancel();
  const anim=el.animate(p.map(t=>({transform:`translate(${dx*(1-t)}px,${dy*(1-t)}px) scale(${sx+(1-sx)*t},${sy+(1-sy)*t})`,transformOrigin:'0 0'})),{duration:p.length*1000/60,easing:'linear'});
  anim.id='idp-flip';}catch{}
}
/** Remember rects of every [data-flip] inside `root`, keyed by its value (call just before a DOM change). */
export function measureFlips(root:Element|null):Map<string,DOMRect>{
 const m=new Map<string,DOMRect>();if(!root)return m;
 root.querySelectorAll<HTMLElement>('[data-flip]').forEach(el=>{const r=el.getBoundingClientRect();if(r.width)m.set(el.dataset.flip!,r);});return m;
}
/** After the change: every [data-flip] that existed before flies from its old place (one shared element per key). */
export function playFlips(root:Element|null,before:Map<string,DOMRect>,o?:{scale?:boolean}){
 if(!root||!before.size)return;
 root.querySelectorAll<HTMLElement>('[data-flip]').forEach(el=>{const r=before.get(el.dataset.flip!);if(r)flipFrom(el,r,o);});
}
