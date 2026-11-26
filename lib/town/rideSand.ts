// Riding on sand (owner, Nov 25 2026: "add animation for when riding on the sand that it kicks up the sand. also when riding on the
// sand it slows down the speed of each a bit compared to riding normally"). Pure: the sand test for a ground ride's wheels, the
// eased speed/acceleration scale, and the spray strength. The spray itself rides the ride-splash pool (lib/graphics/rideSplash.ts
// `sand()`): same InstancedMesh, same program, one draw only while grains are alive.
//
// Sand = the main island's beach ring (onIsland and outside INTERIOR_GRASS), Coral Cay's sand ring (inside CAY_SHORE, outside the
// lawn; the beach court included), the two cay sandbars (their walk outline, not the boardwalk spur), Summit Isle's beach band and
// its sandbar. Never sand: roads (the world's road rects, the cay boulevard and causeway included), paved / built surface areas
// (paths, the café patio, courts, pitches, gardens, the farm) and the railway (within RIDE_SAND.trackClear of the track: the level
// crossings and the ballast). A 'sand' surface area (the beach court, the west park's sand paths, the sandbar plots) always counts.
import {onIsland,INTERIOR_GRASS} from './shoreline';
import {CAY_SHORE,CAY_LAWN,CAY_CENTER,SANDBARS} from './coralCay';
import {onSummitIsle,onSummitSandbar,SUMMIT_CENTER,SUMMIT_BOX,coastRadius,beachWidth} from './summitIsle';
import {trackNearest} from './trainTrack';

export const RIDE_SAND={
 /** Top speed on sand: 15 % lower (owner asked for "a bit"; brief 12–18 %). */
 speed:.85,
 /** Acceleration on sand (the wheels dig in): 20 % softer. Braking is unchanged. */
 accel:.8,
 /** Seconds to ease fully in or out at the sand's edge (smoothstep on a linear blend: never a jerk). */
 ease:.3,
 /** m: closer than this to the railway is ballast / a level crossing, never sand. */
 trackClear:2.6,
 /** m: the cached answer is reused while the rider stays within this of the last sample (a few lookups per second at speed). */
 reuse:.45,
 /** Spray: no grains under `minSpeed` m/s (standing / creeping), full at `fullSpeed`; a turn (rad/s) adds up to `turnGain`
  *  at `fullTurn`, a hard brake (m/s²) up to `brakeGain` at `fullBrake`. (The grain rate, colour and life: rideSplash.ts RIDE_SPLASH.sand*.) */
 minSpeed:2,fullSpeed:16,fullTurn:2.2,turnGain:.7,fullBrake:14,brakeGain:.8,
} as const;

type Rect={x:number;z:number;w:number;d:number};
type Pt={x:number;z:number};
const inPoly=(poly:readonly Pt[],x:number,z:number)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)c=!c;}return c;};
const bounds=(poly:readonly Pt[])=>{let x0=Infinity,x1=-Infinity,z0=Infinity,z1=-Infinity;for(const p of poly){x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);z0=Math.min(z0,p.z);z1=Math.max(z1,p.z);}return {x0,x1,z0,z1};};
const inB=(b:{x0:number;x1:number;z0:number;z1:number},x:number,z:number)=>x>=b.x0&&x<=b.x1&&z>=b.z0&&z<=b.z1;
const cayB=bounds(CAY_SHORE),lawnB=bounds(CAY_LAWN),barB=SANDBARS.map(s=>bounds(s.walk));

/** The natural ground is sand here (no paving test). */
export function naturalSand(x:number,z:number):boolean{
 if(onIsland(x,z))return !inPoly(INTERIOR_GRASS,x,z);
 if(inB(cayB,x,z)&&Math.hypot(x-CAY_CENTER.x,z-CAY_CENTER.z)<120&&inPoly(CAY_SHORE,x,z))return !(inB(lawnB,x,z)&&inPoly(CAY_LAWN,x,z));
 for(let i=0;i<SANDBARS.length;i++)if(inB(barB[i],x,z)&&inPoly(SANDBARS[i].walk,x,z))return true;
 if(x>SUMMIT_BOX.minX&&x<SUMMIT_BOX.maxX&&z>SUMMIT_BOX.minZ&&z<SUMMIT_BOX.maxZ){
  if(onSummitSandbar(x,z))return true;
  if(!onSummitIsle(x,z))return false;const dx=x-SUMMIT_CENTER.x,dz=z-SUMMIT_CENTER.z,a=Math.atan2(dz,dx);return Math.hypot(dx,dz)>=coastRadius(a)-beachWidth(a);}
 return false;
}

/** The sand test with the paved surfaces taken out. `paved`: road rects and non-sand surface areas; `sandy`: 'sand' surface areas. */
export function createRideSand(paved:readonly Rect[],sandy:readonly Rect[]=[]){
 const CELL=16,grid=new Map<number,Rect[]>(),key=(i:number,j:number)=>i*100003+j;
 for(const r of paved){for(let i=Math.floor((r.x-r.w/2)/CELL);i<=Math.floor((r.x+r.w/2)/CELL);i++)for(let j=Math.floor((r.z-r.d/2)/CELL);j<=Math.floor((r.z+r.d/2)/CELL);j++){const k=key(i,j),l=grid.get(k);if(l)l.push(r);else grid.set(k,[r]);}}
 const inRect=(r:Rect,x:number,z:number)=>Math.abs(x-r.x)<=r.w/2&&Math.abs(z-r.z)<=r.d/2;
 function at(x:number,z:number):boolean{
  const l=grid.get(key(Math.floor(x/CELL),Math.floor(z/CELL)));if(l)for(const r of l)if(inRect(r,x,z))return false;
  const h=trackNearest(x,z,RIDE_SAND.trackClear+.5);if(h&&h.d<RIDE_SAND.trackClear)return false;
  for(const r of sandy)if(inRect(r,x,z))return true;
  return naturalSand(x,z);
 }
 return {at};
}

/** One rider's eased sand blend (0 = hard ground, 1 = fully on sand) with a cached lookup. */
export function createSandEase(at:(x:number,z:number)=>boolean){
 let lx=NaN,lz=NaN,on=false,raw=0;
 const out={blend:0,on:false,speed:1,accel:1};
 return {
  out,
  /** Advance by dt at (x, z); `active` false (walking, flying, swimming) eases straight back out. */
  step(dt:number,x:number,z:number,active=true){
   if(!active)on=false;else if(!(Math.abs(x-lx)<RIDE_SAND.reuse&&Math.abs(z-lz)<RIDE_SAND.reuse)){on=at(x,z);lx=x;lz=z;}
   const k=Math.min(1,Math.max(0,dt)/RIDE_SAND.ease);raw=on?Math.min(1,raw+k):Math.max(0,raw-k);
   const b=raw*raw*(3-2*raw);out.blend=b;out.on=on;out.speed=1-(1-RIDE_SAND.speed)*b;out.accel=1-(1-RIDE_SAND.accel)*b;return out;},
  reset(){lx=lz=NaN;on=false;raw=0;out.blend=0;out.on=false;out.speed=out.accel=1;},
 };
}

const smooth=(a:number,b:number,x:number)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
/** Spray strength 0…~2 from speed (m/s), turn rate (rad/s) and deceleration (m/s², + = slowing); 0 when slow or stopped. */
export function sandSprayStrength(speed:number,turn:number,brake:number){
 if(!(speed>RIDE_SAND.minSpeed))return 0;const s=smooth(RIDE_SAND.minSpeed,RIDE_SAND.fullSpeed,speed);
 return s*(1+RIDE_SAND.turnGain*smooth(0,RIDE_SAND.fullTurn,Math.abs(turn))+RIDE_SAND.brakeGain*smooth(0,RIDE_SAND.fullBrake,brake));
}
