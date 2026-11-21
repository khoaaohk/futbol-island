// Arcade roof neon flicker (Nov 21 2026, owner: "make the arcade sign blink and animate so it flickers a little bit to draw more
// attention"). A step scheduler, not an animation loop: it holds a time for its next change and does nothing until then. Each
// change is a few numbers (a slow "breathing" multiplier and one brightness per letter of A-R-C-A-D-E) that lib/town/world.ts
// writes into the sign's existing material colour, halo opacity and the letters' slice of the tube colour buffer. No new mesh,
// material, texture, light or shader (docs/performance-guide.md, "Arcade neon flicker").
//
// Look: mostly steady, a very slow breathing of brightness, and every 2-6 s a quick dip (one or two letters or the whole word for
// 60-150 ms, sometimes a short double flick). Stronger at night, subtle by day.
// Safety (WCAG 2.3.1): at most 2 dips per event and events at least 2 s apart, so never more than 3 dips in any second; the caller
// passes on=false for reduced motion, the static-ambience heat tiers, other scenes/menus, and a far or off-screen sign.

export type NeonMode='day'|'sunset'|'night'|string;
export const NEON_LETTERS=6;
/** Camera-to-sign distance (m) beyond which the sign holds steady (the Island Square and its streets are well inside). */
export const NEON_FLICKER_DISTANCE=110;
/** While held steady, how often the caller re-checks whether the sign is near and on screen. */
export const NEON_IDLE_CHECK_MS=500;
/** Breathing is stepped, not per frame: one value at most every 250 ms (≤ 2.5 % per step, too small to read as a step). */
export const NEON_BREATH_STEP_MS=250;
export const NEON_BREATH_PERIOD_MS=5600;
/** Quiet gap between flicker events (ms). */
export const NEON_GAP_MS:readonly [number,number]=[2000,6000];
/** A gap longer than this since the scheduled change (tab hidden, frame held) restarts the schedule instead of catching up. */
const STALE_MS=1000;
/** breath: the slow dip below full (b swings between 1 − 2·breath and 1); dip: a dipped letter's brightness range. */
export const NEON_STRENGTH:Record<'day'|'sunset'|'night',{breath:number;dip:readonly [number,number]}>={
 day:{breath:.03,dip:[.5,.65]},
 sunset:{breath:.05,dip:[.3,.45]},
 night:{breath:.08,dip:[.12,.3]},
};
const strengthOf=(mode:NeonMode)=>mode==='night'?NEON_STRENGTH.night:mode==='sunset'?NEON_STRENGTH.sunset:NEON_STRENGTH.day;

/** Small seeded PRNG (mulberry32) so the tests are deterministic. */
export function neonRandom(seed:number){let a=seed>>>0;return ()=>{a=a+0x6d2b79f5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}

type Step={at:number;mask:number;level:number};
const ALL=(1<<NEON_LETTERS)-1;

export type NeonFlicker={
 /** Current output: breathing multiplier (≤ 1) and each letter's brightness (1 = steady). */
 readonly breath:number;readonly letters:Float32Array;
 /** Letters changed by the last step (bit i = letter i); breathChanged likewise. Read after step() returns true. */
 readonly dirty:number;readonly breathChanged:boolean;
 /** The next time anything can change; the caller does no work at all before it. */
 readonly nextAt:number;
 /** Counters for the budget note: steps that changed something, and flicker events started. */
 readonly stats:{changes:number;events:number;dips:number};
 /** Times (ms) at which a dip started, for the tests (kept to the last 64). */
 readonly dipTimes:number[];
 due(now:number):boolean;
 step(now:number,on:boolean,mode:NeonMode):boolean;
};

export function createNeonFlicker(seed=1):NeonFlicker{
 const rnd=neonRandom(seed),between=(a:number,b:number)=>a+(b-a)*rnd();
 const letters=new Float32Array(NEON_LETTERS).fill(1),queue:Step[]=[],dipTimes:number[]=[],stats={changes:0,events:0,dips:0};
 let breath=1,dirty=0,breathChanged=false,nextAt=0,asleep=true,nextEvent=0,nextBreath=0;
 const dipAt=(t:number)=>{stats.dips++;dipTimes.push(t);if(dipTimes.length>64)dipTimes.shift();};
 // One flicker event: a list of (time, letters, level) steps that always ends back at full brightness.
 const plan=(now:number,mode:NeonMode)=>{
  const s=strengthOf(mode),r=rnd(),one=1<<Math.floor(rnd()*NEON_LETTERS);
  let mask:number;
  if(r<.45)mask=one;
  else if(r<.65){const i=Math.floor(rnd()*(NEON_LETTERS-1));mask=3<<i;}
  else if(r<.85)mask=ALL;
  else mask=rnd()<.6?one:ALL;
  const level=between(s.dip[0],s.dip[1]);let t=now;
  queue.push({at:t,mask,level});dipAt(t);t+=between(60,150);queue.push({at:t,mask,level:1});
  if(r>=.85){t+=between(80,130);queue.push({at:t,mask,level:Math.min(1,level+.08)});dipAt(t);t+=between(60,100);queue.push({at:t,mask,level:1});}
  stats.events++;return t;
 };
 const set=(mask:number,level:number)=>{for(let i=0;i<NEON_LETTERS;i++)if(mask&1<<i&&letters[i]!==level){letters[i]=level;dirty|=1<<i;}};
 const api:NeonFlicker={
  get breath(){return breath;},letters,get dirty(){return dirty;},get breathChanged(){return breathChanged;},get nextAt(){return nextAt;},stats,dipTimes,
  due:now=>now>=nextAt,
  step(now,on,mode){
   if(now<nextAt)return false;
   dirty=0;breathChanged=false;
   if(!on){
    nextAt=now+NEON_IDLE_CHECK_MS;if(asleep)return false;
    asleep=true;queue.length=0;set(ALL,1);if(breath!==1){breath=1;breathChanged=true;}
    stats.changes++;return true;
   }
   if(asleep||now-nextAt>STALE_MS){
    // Waking (or back from a hidden tab): start at full brightness and wait a moment before the first flick.
    if(queue.length){queue.length=0;set(ALL,1);}
    asleep=false;nextEvent=now+between(800,2500);nextBreath=now;
   }
   while(queue.length&&queue[0].at<=now){const q=queue.shift()!;set(q.mask,q.level);}
   if(!queue.length&&now>=nextEvent){const end=plan(now,mode);nextEvent=end+between(NEON_GAP_MS[0],NEON_GAP_MS[1]);while(queue.length&&queue[0].at<=now){const q=queue.shift()!;set(q.mask,q.level);}}
   if(now>=nextBreath){
    const amp=strengthOf(mode).breath,b=Math.round((1-amp*(1+Math.sin(now*2*Math.PI/NEON_BREATH_PERIOD_MS)))*100)/100;
    if(b!==breath){breath=b;breathChanged=true;}nextBreath=now+NEON_BREATH_STEP_MS;
   }
   nextAt=Math.min(queue.length?queue[0].at:Infinity,nextEvent,nextBreath);
   const changed=dirty!==0||breathChanged;if(changed)stats.changes++;return changed;
  },
 };
 return api;
}
