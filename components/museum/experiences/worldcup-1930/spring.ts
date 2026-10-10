/**
 * Tiny spring kit for worldcup-1930 (Oct 9 2026 motion pass). No library: a damped spring integrated with fixed sub-steps
 * (stable at any frame rate), a rubber-band curve for dragging past a limit, and FLIP keyframes sampled from the same spring
 * so tap-driven moves feel like the drag-driven ones. Nothing here runs a loop on its own; callers step it inside their own
 * rAF, which they stop as soon as `settled` says so.
 */
export type Spring1={x:number;v:number};
/** Advance a spring toward `to` by dt seconds. k = stiffness, c = damping. Returns true once it has settled. */
export function stepSpring(s:Spring1,to:number,dt:number,k=320,c=30,eps=.01):boolean{
 const n=Math.max(1,Math.ceil(dt*240)),h=dt/n;
 for(let i=0;i<n;i++){const a=-k*(s.x-to)-c*s.v;s.v+=a*h;s.x+=s.v*h;}
 if(Math.abs(s.v)<eps*8&&Math.abs(s.x-to)<eps){s.x=to;s.v=0;return true;}
 return false;
}
/** Past a limit, movement gets heavier the further you pull (iOS-style). `dim` = the most you can ever pull past it. */
export function rubber(x:number,min:number,max:number,dim:number){
 if(x<min){const d=min-x;return min-dim*(1-1/(d/dim*.55+1));}
 if(x>max){const d=x-max;return max+dim*(1-1/(d/dim*.55+1));}
 return x;
}
/** Progress samples (0 → 1, with overshoot) of a unit spring at 60 fps, until settled. v0 is in "units per second". */
export function springSamples(k=260,c=22,v0=0):number[]{
 const s={x:0,v:v0},out=[0];for(let i=0;i<240;i++){const done=stepSpring(s,1,1/60,k,c,.002);out.push(s.x);if(done)break;}
 out[out.length-1]=1;return out;
}
/** FLIP: animate an element from where it WAS (`from`, a rect measured before the DOM change) to where it is now. */
export function flip(el:HTMLElement,from:DOMRect,opts:{k?:number;c?:number;scale?:boolean}={}){
 const to=el.getBoundingClientRect();const dx=from.left-to.left,dy=from.top-to.top,sx=opts.scale&&to.width?from.width/to.width:1,sy=opts.scale&&to.height?from.height/to.height:1;
 if(Math.abs(dx)<.5&&Math.abs(dy)<.5&&Math.abs(sx-1)<.01)return;
 const p=springSamples(opts.k??260,opts.c??22);
 try{el.animate(p.map(t=>({transform:`translate(${dx*(1-t)}px,${dy*(1-t)}px) scale(${sx+(1-sx)*t},${sy+(1-sy)*t})`,transformOrigin:'0 0'})),{duration:p.length*1000/60,easing:'linear'});}catch{}
}
