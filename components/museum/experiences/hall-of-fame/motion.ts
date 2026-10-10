/**
 * Hall of Fame motion (Oct 9 2026): a spring that runs on requestAnimationFrame ONLY while it settles (it stops itself at rest,
 * and can be cancelled), a timed glide for the part of a move that plays by itself, and the same spring sampled into a CSS
 * linear() easing for one-shot Web Animations (the print flying in, a seal stamping down). Reduced motion lands at once.
 */
export const reduced=()=>typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Frames run by this file since load (the browser test reads it to prove nothing runs at rest). */
export const motionStats={frames:0};

/** Spring `x` to `to` (velocity-aware: pass the release velocity in units/s). Calls set(x) every frame; done() at rest. */
export function springTo(from:number,to:number,set:(x:number)=>void,o:{v?:number;k?:number;c?:number;done?:()=>void}={}):()=>void{
 const k=o.k??170,c=o.c??22;let x=from,v=o.v??0,raf=0,last=performance.now();
 if(reduced()){set(to);o.done?.();return()=>{};}
 const frame=(now:number)=>{motionStats.frames++;const dt=Math.min(.05,(now-last)/1e3);last=now;const n=Math.max(1,Math.ceil(dt*240)),h=dt/n;
  for(let i=0;i<n;i++){const a=-k*(x-to)-c*v;v+=a*h;x+=v*h;}
  if(Math.abs(x-to)<.0008&&Math.abs(v)<.01){set(to);raf=0;o.done?.();return;}
  set(x);raf=requestAnimationFrame(frame);};
 raf=requestAnimationFrame(frame);
 return()=>{if(raf)cancelAnimationFrame(raf);raf=0;};
}
/** A timed glide (ease-out) for motion nobody is touching, e.g. the cross after the run. Stops itself. */
export function glide(from:number,to:number,ms:number,set:(x:number)=>void,done?:()=>void):()=>void{
 if(reduced()){set(to);done?.();return()=>{};}
 const t0=performance.now();let raf=0;
 const frame=(now:number)=>{motionStats.frames++;const u=Math.min(1,(now-t0)/ms),e=1-Math.pow(1-u,3);set(from+(to-from)*e);
  if(u<1)raf=requestAnimationFrame(frame);else{raf=0;done?.();}};
 raf=requestAnimationFrame(frame);return()=>{if(raf)cancelAnimationFrame(raf);raf=0;};
}
/** The spring sampled into a CSS linear() easing, with the time it takes to settle. */
export function springEasing(k=170,c=20){
 let x=0,v=0,t=0,still=0;const h=1/240,pts:number[]=[];
 while(t<2.5){for(let i=0;i<4;i++){const a=-k*(x-1)-c*v;v+=a*h;x+=v*h;t+=h;}pts.push(x);if(Math.abs(x-1)<.001&&Math.abs(v)<.01){if(++still>3)break;}else still=0;}
 const step=Math.max(1,Math.ceil(pts.length/60)),out=[0];for(let i=step-1;i<pts.length;i+=step)out.push(Math.round(pts[i]*1000)/1000);out[out.length-1]=1;
 return {easing:`linear(${out.join(',')})`,ms:Math.round(t*1000)};
}
/** FLIP: play `el` from the rectangle it had (`first`) to where it is now, on a spring. */
export function flipFrom(el:HTMLElement,first:DOMRect,o:{k?:number;c?:number;reverse?:boolean}={}):Animation|null{
 if(reduced())return null;const last=el.getBoundingClientRect();if(!last.width||!first.width)return null;
 const dx=first.left-last.left,dy=first.top-last.top,s=first.width/last.width,e=springEasing(o.k??190,o.c??23);
 const a=[{transformOrigin:'0 0',transform:`translate(${dx}px,${dy}px) scale(${s})`},{transformOrigin:'0 0',transform:'none'}];
 return el.animate(o.reverse?a.reverse():a,{duration:o.reverse?320:e.ms,easing:o.reverse?'cubic-bezier(.4,0,.6,1)':e.easing,fill:o.reverse?'forwards':'none'});
}
