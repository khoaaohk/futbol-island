/**
 * Explore delight (Oct 21 2026; docs/swimming-research.md §12): the DAILY SPARKLE SPOT. Each local calendar day every zone hides one
 * soft glittering patch on its seabed (a seeded pick from the date and the zone id, so it is the same all day and moves tomorrow),
 * clear of the buoy, the start, the finds, the wreck, the pitch, the arch, the rocks and the journey's pickups. Swim into it: a bubble
 * burst, a tiny treasure (a shell or a pearl) and one "Today's sparkle" line; 1 coin once per day per zone (`dive:<zone>:sparkle:<date>`,
 * Training-metered). Remembered in `fi2-dive-reef-v1` as {d: date, m: bitmask of zones} (diveJourney.ts).
 *
 * Pure: no three.js, no DOM. The facts are general, true ocean / reef facts for young kids (<= 120 characters), none repeated from
 * the finds (diveSpots.ts) or the journey card.
 */
import {DIVE_ROOM_R,DIVE_SPOTS,diveFloor,type DiveSpot} from './diveSpots';
import {journeyPickups} from './diveJourney';
import {diveLayout,diveLayoutFree} from './diveLayout';

export const SPARKLE_FACTS=[
 'An octopus has three hearts, and its blood is blue.',
 'Coral looks like rock, but it is made of tiny animals called polyps.',
 'A seahorse dad carries the babies in a pouch until they hatch.',
 'Parrotfish nibble coral and turn it into fine white sand.',
 'A starfish can grow back an arm it has lost.',
 'Clownfish live safely among the stinging arms of sea anemones.',
 'The blue whale is the biggest animal that has ever lived on Earth.',
] as const;
export const SPARKLE_TREASURES=['a tiny pearl','a pink shell'] as const;
/** reach: how close (m, across the sand) the diver's middle must pass; high: and how high over the sand (m); see: the shimmer shows
 *  within this (m); coins: once per day per zone; gap: clearance from everything else (m). */
export const SPARKLE={reach:1.9,high:2.8,see:12,coins:1,gap:2.2} as const;

/** The local calendar day, YYYY-MM-DD. */
export function localDate(d:Date=new Date()){const p=(n:number)=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;}
/** FNV-1a: a stable 32-bit hash of a string. */
export function hashStr(s:string){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return h>>>0;}
function rng(seed:number){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}

export type SparkleSpot={x:number;y:number;z:number;fact:string;treasure:string};
/** Today's sparkle spot in a zone (room-local; y on the sand). Deterministic for (date, zone). */
export function sparkleSpot(spot:DiveSpot,date:string):SparkleSpot{
 const h=hashStr(date+'|'+spot.id),r=rng(h),L=diveLayout(spot),picks=journeyPickups(spot),g=SPARKLE.gap;
 const free=(x:number,z:number)=>diveLayoutFree(L,spot,x,z,g,{lanes:false,keep:.8})&&Math.hypot(x,z)<DIVE_ROOM_R-4&&picks.every(p=>Math.hypot(p.x-x,p.z-z)>g)&&L.rocks.every(k=>Math.hypot(k.x-x,k.z-z)>k.s+g);
 let x=0,z=-6;
 for(let k=0;k<200;k++){const a=r()*Math.PI*2,d=4+r()*(DIVE_ROOM_R-10),cx=Math.cos(a)*d,cz=Math.sin(a)*d;if(free(cx,cz)){x=cx;z=cz;break;}}
 return {x,z,y:diveFloor(x,z,spot.floor),fact:SPARKLE_FACTS[h%SPARKLE_FACTS.length],treasure:SPARKLE_TREASURES[(h>>>8)%SPARKLE_TREASURES.length]};
}
/** In the sparkle: across the sand within `reach`, and not higher than `high` over it. */
export const sparkleReach=(s:Pick<SparkleSpot,'x'|'y'|'z'>,x:number,y:number,z:number)=>Math.hypot(s.x-x,s.z-z)<SPARKLE.reach&&y-s.y<SPARKLE.high;
export const sparkleRunId=(spot:string,date:string)=>`dive:${spot}:sparkle:${date}`;
/** A zone's bit in the save's day mask (its index in DIVE_SPOTS; -1 when unknown). */
export const sparkleBit=(spot:string,spots:readonly DiveSpot[]=DIVE_SPOTS)=>spots.findIndex(s=>s.id===spot);
export type SparkleSave={d:string;m:number};
/** Already found today in this zone? (a save from another day counts as none) */
export function sparkleDone(save:SparkleSave|undefined,spot:string,date:string){const b=sparkleBit(spot);return !!save&&b>=0&&save.d===date&&((save.m>>>b)&1)===1;}
/** Mark it found today (a new day starts a fresh mask). */
export function markSparkle(save:SparkleSave|undefined,spot:string,date:string):SparkleSave{const b=sparkleBit(spot);const m=save&&save.d===date?save.m:0;return {d:date,m:b>=0?(m|(1<<b))>>>0:m};}
export const sparkleCardTitle=(treasure:string)=>`Today’s sparkle: ${treasure}!`;
