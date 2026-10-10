/**
 * wwc-1991's own little spring kit (Oct 9 2026 motion pass). No library. A damped spring integrated in fixed 1/240 s sub-steps
 * (stable at any frame rate, interruptible: it keeps its velocity when the target moves), a rubber-band curve for pulling past
 * an edge, and FLIP keyframes SAMPLED from the same spring so tapped changes move like dragged ones. Nothing here owns a loop:
 * callers step it inside their own rAF and stop as soon as it reports settled.
 */
export type Spring1={x:number;v:number};
/** Advance toward `to` by dt seconds (k stiffness, c damping). Returns true once settled (then snaps exactly onto `to`). */
export function stepSpring(s:Spring1,to:number,dt:number,k=320,c=30,eps=.002):boolean{
 const n=Math.max(1,Math.ceil(dt*240)),h=dt/n;
 for(let i=0;i<n;i++){const a=-k*(s.x-to)-c*s.v;s.v+=a*h;s.x+=s.v*h;}
 if(Math.abs(s.v)<eps*10&&Math.abs(s.x-to)<eps){s.x=to;s.v=0;return true;}
 return false;
}
/** Past [min, max] the pull gets heavier the further you go; `dim` is the most you can ever get past the edge. */
export function rubber(x:number,min:number,max:number,dim:number){
 if(x<min){const d=min-x;return min-dim*(1-1/(d/dim*.55+1));}
 if(x>max){const d=x-max;return max+dim*(1-1/(d/dim*.55+1));}
 return x;
}
/** A unit spring (0 → 1, with its overshoot) sampled at 60 fps until it settles. v0 = starting velocity in units per second. */
export function springSamples(k=260,c=22,v0=0):number[]{
 const s={x:0,v:v0},out=[0];for(let i=0;i<240;i++){const done=stepSpring(s,1,1/60,k,c,.001);out.push(s.x);if(done)break;}
 out[out.length-1]=1;return out;
}
/** FLIP: animate `el` from a rect measured BEFORE a DOM change to where it sits now, on spring-sampled WAAPI keyframes. */
export function flip(el:Element,from:DOMRect,opts:{k?:number;c?:number;scale?:boolean}={}){
 const to=el.getBoundingClientRect();const dx=from.left-to.left,dy=from.top-to.top;
 const sx=opts.scale&&to.width?from.width/to.width:1,sy=opts.scale&&to.height?from.height/to.height:1;
 if(Math.abs(dx)<.5&&Math.abs(dy)<.5&&Math.abs(sx-1)<.01&&Math.abs(sy-1)<.01)return;
 const p=springSamples(opts.k??260,opts.c??22);
 try{(el as HTMLElement).animate(p.map(t=>({transform:`translate(${dx*(1-t)}px,${dy*(1-t)}px) scale(${sx+(1-sx)*t},${sy+(1-sy)*t})`,transformOrigin:'0 0'})),
  {duration:p.length*1000/60,easing:'linear'});}catch{/* WAAPI missing: the element is already in place */}
}
/** A spring "pop" (scale from `from` to 1) as WAAPI keyframes, for success moments. */
export function pop(el:Element|null,from=.6,k=380,c=18){
 if(!el)return;const p=springSamples(k,c);
 try{(el as HTMLElement).animate(p.map(t=>({transform:`scale(${from+(1-from)*t})`})),{duration:p.length*1000/60,easing:'linear'});}catch{}
}
