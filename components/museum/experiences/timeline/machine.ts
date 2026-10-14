/**
 * timeline · the display bench's maths (Oct 10 2026; Oct 12 2026 anatomy restyle). Pure, so tests/museum-exp-timeline.cjs
 * checks it without a browser.
 *
 * The machine has one continuous position `pos` measured in eras (0 = the first case, n−1 = the last). The carriage's HANDWHEEL (the crank) drives it:
 * one full turn of the handle moves ERAS_PER_TURN eras, forward clockwise as seen on the machine's side, back the other way. A drag
 * on the machine itself (or the year rail) moves it directly; past either end it rubber-bands; a release projects the flick's
 * velocity forward and settles on the nearest era with a spring (the kit's stepSpring). The odometer shows the year in between,
 * interpolated between the real years of the two eras either side, so the counter rolls through time as you crank.
 */
export const clampN=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export const ERAS_PER_TURN=1.5;

/** Rubber band: past an end the machine moves less and less (Apple's 0.55 coefficient), in eras. */
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
/** The smallest signed step between two angles (radians), so a turn past ±π never jumps. */
export const angleStep=(a:number,b:number)=>{let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d;};
/** Crank angle change → change in eras (turning "forward" = decreasing angle as drawn = later in time). */
export const crankToEras=(dTheta:number)=>-dTheta/(2*Math.PI)*ERAS_PER_TURN;

/** A year on the real-time rail: numbers as they are; "Before the 1960s" sits just before 1960; "Today" is this year. */
export function realYear(year:string,now=new Date().getFullYear()){
 if(/today/i.test(year))return now;
 const m=year.match(/\d{4}/);if(!m)return now;
 return /before/i.test(year)?Number(m[0])-.6:Number(m[0]);
}
/** The span the year rail covers, padded a little at both ends. */
export const span=(now=new Date().getFullYear())=>[1855,now+5] as const;
/** Each era's place on the year rail, 0…1, at its real year (the gaps between cases are the real gaps). */
export function tickXs(years:readonly string[],now=new Date().getFullYear()){const [y0,y1]=span(now);return years.map(y=>(realYear(y,now)-y0)/(y1-y0));}
/** The machine position → where the thumb sits on the rail (between two ticks it slides in proportion). */
export function posToFrac(pos:number,xs:readonly number[]){
 const n=xs.length;if(n<2)return 0;const p=clampN(pos,0,n-1),i=Math.min(n-2,Math.floor(p));return xs[i]+(xs[i+1]-xs[i])*(p-i);
}
/** A point on the rail → a machine position (the inverse; two eras in the same year share their spot). */
export function fracToPos(f:number,xs:readonly number[]){
 const n=xs.length;if(n<2)return 0;if(f<=xs[0])return 0;if(f>=xs[n-1])return n-1;
 for(let i=0;i<n-1;i++){const a=xs[i],b=xs[i+1];if(f>=a&&f<=b)return b-a<1e-6?i+.5:i+(f-a)/(b-a);}
 return n-1;
}
/** The odometer: the year the machine is passing through at `pos` (whole years, between the real years either side). */
export function odometer(pos:number,years:readonly string[],now=new Date().getFullYear()){
 const n=years.length,p=clampN(pos,0,n-1),i=Math.min(n-2,Math.floor(p)),a=realYear(years[i],now),b=realYear(years[Math.min(n-1,i+1)],now);
 return Math.floor(a+(b-a)*(p-i));
}
/** "Find it" missions: travel the machine to the right case. Prompts use the cases' own titles; no new facts. */
export const CHALLENGES:readonly {id:string;ask:string}[]=[
 {id:'stadiums',ask:'the stadiums of the world'},
 {id:'worldcup-1930',ask:'the first World Cup'},
 {id:'var-2018',ask:'the video referee'},
];
/** Years between two case years, or null when either is not a single year ("Before the 1960s", "Today"). */
export function yearsBetween(a:string,b:string){return /^\d{4}$/.test(a)&&/^\d{4}$/.test(b)?Number(b)-Number(a):null;}
/** Warmer / colder for a mission: which way to crank from era i to the target t. */
export const direction=(i:number,t:number)=>i<t?'later':i>t?'earlier':'here';

/** A damped spring on the bench position (fixed 1/120 s sub-steps; snaps exactly onto the target so the loop can stop). */
export type Spring={x:number;v:number;target:number};
export const spring=(x=0):Spring=>({x,v:0,target:x});
export function stepSpring(s:Spring,dt:number,k=170,c=26,eps=.0005){
 const n=Math.max(1,Math.ceil(dt*120)),h=dt/n;
 for(let i=0;i<n;i++){const a=-k*(s.x-s.target)-c*s.v;s.v+=a*h;s.x+=s.v*h;}
 if(Math.abs(s.x-s.target)<eps&&Math.abs(s.v)<eps*10){s.x=s.target;s.v=0;return true;}
 return false;
}
