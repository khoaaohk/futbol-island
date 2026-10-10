/**
 * The emaki's motion maths (Oct 9 2026), pure so tests/museum-exp-timeline.cjs can check it without a browser.
 *
 * The scroll has one continuous position `pos` measured in eras (0 = the first case, n−1 = the last). A finger drags it 1:1,
 * past either end it rubber-bands, and a release projects the flick's velocity forward and settles on the nearest era with a
 * spring (engine.ts stepS), so a hard flick travels several eras and a gentle one only one. The year rule below the scroll can
 * show the eras evenly spaced or at their real years ("zoom out to the decades"); `mix` blends the two layouts.
 */
export const clampN=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));

/** Rubber band: past an end the scroll moves less and less (Apple's 0.55 coefficient), in eras. */
export function rubber(raw:number,max:number,d=1){
 if(raw<0)return -(1-1/(-raw*.55/d+1))*d;
 if(raw>max)return max+(1-1/((raw-max)*.55/d+1))*d;
 return raw;
}
/** Where a release lands: the velocity (eras per second) carries it on, then it snaps to an era. A quick flick always moves one. */
export function projectSnap(pos:number,v:number,n:number){
 let t=Math.round(pos+v*.28);
 if(Math.abs(v)>1.2)t=v>0?Math.max(t,Math.floor(pos)+1):Math.min(t,Math.ceil(pos)-1);
 return clampN(t,0,n-1);
}
/** Velocity from the last ~100 ms of [time ms, pos] samples, in eras per second. */
export function velocity(samples:readonly (readonly [number,number])[]){
 if(samples.length<2)return 0;const a=samples[0],b=samples[samples.length-1],dt=(b[0]-a[0])/1e3;
 return dt>.004?clampN((b[1]-a[1])/dt,-40,40):0;
}

/** A year on the real-time rule: numbers as they are; "Before the 1960s" sits just before 1960; "Today" is this year. */
export function realYear(year:string,now=new Date().getFullYear()){
 if(/today/i.test(year))return now;
 const m=year.match(/\d{4}/);if(!m)return now;
 return /before/i.test(year)?Number(m[0])-.6:Number(m[0]);
}
/** The span the real-time rule covers, padded a little at both ends. */
export const span=(now=new Date().getFullYear())=>[1855,now+5] as const;
/** Each era's place on the rule, 0…1: evenly spaced (mix 0) or at its real year (mix 1). */
export function tickXs(years:readonly string[],mix:number,now=new Date().getFullYear()){
 const n=years.length,[y0,y1]=span(now);
 return years.map((y,i)=>{const even=n>1?i/(n-1):0,real=(realYear(y,now)-y0)/(y1-y0);return even+(real-even)*mix;});
}
/** Decade marks for the real-time rule. */
export const decades=(now=new Date().getFullYear())=>{const out:number[]=[];for(let y=1860;y<=now;y+=10)out.push(y);return out;};
/** The scroll position → where the thumb sits on the rule (between two ticks it slides in proportion). */
export function posToFrac(pos:number,xs:readonly number[]){
 const n=xs.length;if(n<2)return 0;const p=clampN(pos,0,n-1),i=Math.min(n-2,Math.floor(p));return xs[i]+(xs[i+1]-xs[i])*(p-i);
}
/** A point on the rule → a scroll position (the inverse; two eras in the same year share their spot). */
export function fracToPos(f:number,xs:readonly number[]){
 const n=xs.length;if(n<2)return 0;if(f<=xs[0])return 0;if(f>=xs[n-1])return n-1;
 for(let i=0;i<n-1;i++){const a=xs[i],b=xs[i+1];if(f>=a&&f<=b)return b-a<1e-6?i+.5:i+(f-a)/(b-a);}
 return n-1;
}

/** "Find it" challenges: the visitor unrolls the scroll to the right case. Prompts use the cases' own titles; no new facts. */
export const CHALLENGES:readonly {id:string;ask:string}[]=[
 {id:'cards-1970',ask:'the yellow and red cards'},
 {id:'worldcup-1930',ask:'the first World Cup'},
 {id:'var-2018',ask:'the video referee'},
];
/** Years between two case years, or null when either is not a single year ("Before the 1960s", "Today"). */
export function yearsBetween(a:string,b:string){return /^\d{4}$/.test(a)&&/^\d{4}$/.test(b)?Number(b)-Number(a):null;}

/**
 * A spring as a CSS linear() easing, for one-shot Web Animations (unrolling, rolling up, a seal stamping down): the same
 * damped-spring maths as the scroll, sampled once, so the WAAPI motion matches the hand-driven one. Returns the easing and the
 * time the spring takes to settle.
 */
export function springEasing(k=170,c=20,m=1){
 let x=0,v=0;const h=1/240,pts:number[]=[];let t=0,still=0;
 while(t<2.5){for(let i=0;i<4;i++){const a=(-k*(x-1)-c*v)/m;v+=a*h;x+=v*h;t+=h;}pts.push(x);if(Math.abs(x-1)<.001&&Math.abs(v)<.01){if(++still>3)break;}else still=0;}
 const step=Math.max(1,Math.ceil(pts.length/60)),out=[0];for(let i=step-1;i<pts.length;i+=step)out.push(Math.round(pts[i]*1000)/1000);out[out.length-1]=1;
 return {easing:`linear(${out.join(',')})`,ms:Math.round(t*1000)};
}
