import {castPoint,inOpenWater} from './fishingCore';
import type {FishSpot} from './fishCatalog';

/**
 * Aimed casting, hotspots and spooked water (Oct 14 2026, user: "update the fishing to be able to cast in certain spots to try
 * and catch bigger fish. not cast in the same spot"). Pure rules (no three.js, no DOM) so tests run them directly.
 *
 * - The AIM AREA is the water the fishing camera frames in front of the angler: along the spot's own cast direction from the
 *   nearest clear landing (castPoint `min`) out to the spot's usual reach (its float), and a little to each side (narrower on
 *   portrait phones, where the camera looks straight out). Every landing is clamped into it and checked for open water with a
 *   margin (`landable`), so a float never lands on sand, rocks, a pier, a hull or out of view.
 * - QUICK CAST (the Cast button, a quick Space tap): a sensible landing near the usual float, a little different each time.
 * - HOTSPOTS: 1-3 patches per spot where the water "changes" (a dark drop-off, ripples and bubbles, birds diving, a reef edge, a
 *   passing shadow; on the deep-sea boats a bait ball, birds and a dark upwelling). Placed fresh for each session and every
 *   few minutes (`HOTSPOT_RESEED`), drifting slowly. A cast on one raises the big/rare odds (fishingOdds.ts, capped).
 * - SPOOKED WATER: casting again within a few metres of the last casts makes the bite slower and the fish smaller (fishingCore
 *   biteWait / rollSize) and cancels a hotspot's boost there; it recovers over SPOOK_RECOVER seconds.
 */
export type Vec={x:number;z:number};
export type Landing=Vec&{dir:Vec;distance:number};
export type AimArea={stand:Vec;dir:Vec;min:number;max:number;phone:boolean;base:Landing};
/** Half-width of the aim area `a` metres out (desktop / landscape, and portrait phones). */
export const aimLateral=(area:Pick<AimArea,'phone'>,a:number)=>Math.max(0,Math.min(a*.62,area.phone?1.2+.22*a:2+.4*a));
/** Margin round a landing that must be open water too (so the float never hugs rocks and a fish can swim in round it). */
export const LAND_MARGIN=1.4;
export const landable=(x:number,z:number,inWater:(x:number,z:number)=>boolean=inOpenWater)=>inWater(x,z)&&inWater(x+LAND_MARGIN,z)&&inWater(x-LAND_MARGIN,z)&&inWater(x,z+LAND_MARGIN)&&inWater(x,z-LAND_MARGIN);

export function aimArea(spot:FishSpot,stand:Vec,phone=false):AimArea{
 const c=castPoint(spot,stand),base:Landing={x:c.x,z:c.z,dir:c.dir,distance:c.distance};
 return {stand:{...stand},dir:c.dir,min:Math.min(c.min,c.distance),max:c.distance,phone,base};
}
const toAB=(area:AimArea,p:Vec)=>{const dx=p.x-area.stand.x,dz=p.z-area.stand.z;return {a:dx*area.dir.x+dz*area.dir.z,b:dx*area.dir.z-dz*area.dir.x};};
const fromAB=(area:AimArea,a:number,b:number)=>({x:area.stand.x+area.dir.x*a+area.dir.z*b,z:area.stand.z+area.dir.z*a-area.dir.x*b});
const landing=(area:AimArea,p:Vec):Landing=>{const dx=p.x-area.stand.x,dz=p.z-area.stand.z,d=Math.hypot(dx,dz)||1;return {x:p.x,z:p.z,dir:{x:dx/d,z:dz/d},distance:d};};
/** Aim polar: `u` −1..1 across the area (left to right as the angler faces), `v` 0..1 from the nearest to the farthest landing. */
export const aimPolar=(area:AimArea,u:number,v:number)=>{const a=area.min+(area.max-area.min)*Math.max(0,Math.min(1,v));return fromAB(area,a,aimLateral(area,a)*Math.max(-1,Math.min(1,u)));};
/** Where the float would land for a target point: clamped into the aim area and onto open water (or the spot's usual float). */
export function clampAim(area:AimArea,target:Vec,inWater:(x:number,z:number)=>boolean=inOpenWater):Landing{
 const q=toAB(area,target),a=Math.max(area.min,Math.min(area.max,q.a)),lat=aimLateral(area,a),b=Math.max(-lat,Math.min(lat,q.b));
 // Step the sideways offset back toward the centre line, then the distance back toward the float, until it is good water.
 for(let k=0;k<=8;k++){const bb=b*(1-k/8);for(let j=0;j<=6;j++){const aa=a+(area.base.distance-a)*j/6,p=fromAB(area,aa,bb*(aimLateral(area,aa)/Math.max(1e-6,lat)));
  if(landable(p.x,p.z,inWater))return landing(area,p);}}
 return area.base;
}
/** A quick cast: near the usual float, a little shorter or to one side each time (rand: 0..1 source). */
export function quickCast(area:AimArea,rand:()=>number,inWater:(x:number,z:number)=>boolean=inOpenWater):Landing{
 const a=area.max-(area.max-area.min)*.3*rand(),b=(rand()*2-1)*Math.min(1.6,aimLateral(area,a)*.5);
 return clampAim(area,fromAB(area,a,b),inWater);
}

// ---- Hotspots ----
export type HotspotKind='dropoff'|'ripples'|'birds'|'reef-edge'|'shadow'|'baitball'|'upwelling';
export type Hotspot={kind:HotspotKind;x:number;z:number;r:number;
 /** Slow drift: the centre goes round a small circle (radius m, period s, phase rad). */
 drift:{rad:number;period:number;phase:number}};
/** Shore spots read the reef and the surface; the deep-sea boats read the open sea. */
export const SHORE_HOTSPOTS:readonly HotspotKind[]=['dropoff','ripples','birds','reef-edge','shadow'];
export const DEEP_HOTSPOTS:readonly HotspotKind[]=['baitball','birds','upwelling'];
/** Hotspots move to new water every few minutes (and every session). */
export const HOTSPOT_RESEED=180;
export const hotspotSeed=(spotId:string,nowS:number,session=0)=>{let h=2166136261;const s=spotId+':'+Math.floor(nowS/HOTSPOT_RESEED)+':'+session;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0)%2147483646+1;};
export function planHotspots(spot:Pick<FishSpot,'id'|'deep'>,area:AimArea,seed:number,inWater:(x:number,z:number)=>boolean=inOpenWater):Hotspot[]{
 let s=Math.abs(Math.floor(seed))%2147483646+1;const r=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};
 const kinds=[...(spot.deep?DEEP_HOTSPOTS:SHORE_HOTSPOTS)],want=spot.deep?2+Math.floor(r()*2):1+Math.floor(r()*3),out:Hotspot[]=[];
 const rad=spot.deep?3.2:2.6,span=area.max-area.min;
 for(let t=0;t<160&&out.length<want;t++){
  // From a third of the way out to the far end; never right on the quick cast's usual landing (it would be free).
  const a=area.min+span*(.25+r()*.75),b=(r()*2-1)*aimLateral(area,a)*.85,p=fromAB(area,a,b);
  if(span<2.5&&out.length)break;
  if(!landable(p.x,p.z,inWater)||out.some(h=>Math.hypot(h.x-p.x,h.z-p.z)<rad*(t<100?2.2:1.8)))continue;
  if(Math.hypot(p.x-area.base.x,p.z-area.base.z)<rad*.9&&t<60)continue;
  const kind=kinds.splice(Math.floor(r()*kinds.length),1)[0]??'ripples';
  out.push({kind,x:p.x,z:p.z,r:rad,drift:{rad:.8+r()*.8,period:110+r()*80,phase:r()*Math.PI*2}});
 }
 return out;
}
/** A hotspot's centre at time `t` seconds (slow drift; a still point under reduced motion is fine too). */
export const hotspotAt=(h:Hotspot,t:number):Vec=>{const a=h.drift.phase+t/h.drift.period*Math.PI*2;return {x:h.x+Math.cos(a)*h.drift.rad,z:h.z+Math.sin(a)*h.drift.rad};};
/** How squarely a landing hits a hotspot (0..1): full inside 60 % of its radius, fading to 0 at the edge. */
export function hotAt(hotspots:readonly Hotspot[],x:number,z:number,t:number){
 let best=0;for(const h of hotspots){const c=hotspotAt(h,t),d=Math.hypot(c.x-x,c.z-z),k=1-Math.max(0,Math.min(1,(d-h.r*.6)/(h.r*.4)));if(k>best)best=k;}
 return best;
}

// ---- Spooked water ----
export const SPOOK_RADIUS=2.5,SPOOK_RECOVER=90,SPOOK_MEMORY=6;
export type CastMark={x:number;z:number;t:number};
/** 0..1: one recent cast within SPOOK_RADIUS gives 0.6, two give 1; each fades back to calm over SPOOK_RECOVER seconds. */
export function spookAt(history:readonly CastMark[],x:number,z:number,now:number){
 let sum=0;for(const c of history){const age=now-c.t;if(age<0||age>=SPOOK_RECOVER)continue;const d=Math.hypot(c.x-x,c.z-z);if(d>=SPOOK_RADIUS)continue;
  sum+=.6*(1-age/SPOOK_RECOVER)*(1-Math.max(0,(d-SPOOK_RADIUS*.6)/(SPOOK_RADIUS*.4)));}
 return Math.min(1,sum);
}
/** Remember a cast (keeps the last SPOOK_MEMORY). */
export const rememberCast=(history:CastMark[],x:number,z:number,now:number)=>{history.push({x,z,t:now});if(history.length>SPOOK_MEMORY)history.splice(0,history.length-SPOOK_MEMORY);return history;};
/** Shown when a cast lands in spooked water. */
export const SPOOKED_HINT='The fish here are spooked, try another spot!';
/** Shown when a cast lands on a hotspot (no odds, just the water reading). */
export const HOTSPOT_HINT='Good read! The water changes here. Watch for a shadow…';
/** The teaching line while the line is in (light touch). */
export const READ_WATER_HINT='Read the water: fish gather where the water changes.';
