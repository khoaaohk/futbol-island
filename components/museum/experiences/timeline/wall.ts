/**
 * timeline · springEasing, kept for the museum's shared doorway (ExperienceStage.tsx imports it from here). The time machine itself
 * (Oct 12 2026, anatomy display bench) moves with its own spring (machine.ts stepSpring).
 *
 * A spring as a CSS linear() easing, for one-shot Web Animations: damped-spring maths sampled once. Returns the easing and the
 * time the spring takes to settle.
 */
export function springEasing(k=170,c=20,m=1){
 let x=0,v=0;const h=1/240,pts:number[]=[];let t=0,still=0;
 while(t<2.5){for(let i=0;i<4;i++){const a=(-k*(x-1)-c*v)/m;v+=a*h;x+=v*h;t+=h;}pts.push(x);if(Math.abs(x-1)<.001&&Math.abs(v)<.01){if(++still>3)break;}else still=0;}
 const step=Math.max(1,Math.ceil(pts.length/60)),out=[0];for(let i=step-1;i<pts.length;i+=step)out.push(Math.round(pts[i]*1000)/1000);out[out.length-1]=1;
 return {easing:`linear(${out.join(',')})`,ms:Math.round(t*1000)};
}
