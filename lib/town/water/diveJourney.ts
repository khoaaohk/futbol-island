/**
 * Explore v2 (Oct 21 2026): the reef JOURNEY of a zone (docs/swimming-research.md §10 "Explore v2"). User: "figure out how we can make
 * this experience more delightful". Each zone gets a gentle guided path through its four finds (diveSpots.ts), and along it eight
 * PICKUPS: four bits of litter to clear (kid-friendly reef clean-up) and four little reef treasures (a shell, a starfish, sea glass,
 * a lost kit badge). Swim through one and it is collected (no button). The reef's colour comes back as the zone fills up (reefHealth),
 * and at 100 % (every pickup and every find) the zone is RESTORED: a Real football fact card, a "Reef Keeper" sticker, a small coin
 * reward once ever (a `dive:` wallet run, metered by the Training meter) and the school swims into a football.
 *
 * Pure: no three.js, no DOM. Positions are room-local and derived from the zone's own data (its finds, its floor), never hard-coded,
 * so a zone moved on the island (its x / z) keeps its journey. No allocation in `reach` (the per-frame test).
 */
import {DIVE_ROOM_R,diveFloor,diveTaskFinds,type DiveSpot} from './diveSpots';

export type DivePickupKind='litter'|'treasure';
export type DivePickup={i:number;kind:DivePickupKind;name:string;x:number;y:number;z:number;color:string};
/** How close (3D, m) the diver's middle must pass to collect a pickup. */
export const PICKUP_RANGE=1.6;// Explore delight (Oct 21 2026): 1.35 -> 1.6 m, so slow drifting still collects
/** Where the journey starts (room-local; diveSession.ts DIVE_START). */
export const JOURNEY_START={x:0,z:13} as const;
export const LITTER=[{name:'an old can',color:'#9aa3a8'},{name:'a plastic bottle',color:'#bfe3e8'},{name:'a lost fishing net',color:'#6f8f7a'},{name:'a bottle cap',color:'#d9534f'}] as const;
export const TREASURES=[{name:'a spiral shell',color:'#f2b8a0'},{name:'a starfish',color:'#f28a3a'},{name:'sea glass',color:'#7fd6c2'},{name:'a lost kit badge',color:'#f2c14e'}] as const;
/** The reef's colour (saturation) at 0 % and its full colour at 100 % (diveRoom.ts uReef). */
export const REEF_DULL=.72;
/** Restoring a zone, once ever: coins (Training-metered), the sticker's name, and the card. A verified fact (UN Climate Neutral Now, 2018). */
export const REEF_RESTORE_COINS=3,REEF_STICKER='Reef Keeper';
export const REEF_RESTORE_CARD={title:'Reef restored!',label:'Real football fact' as const,
 text:'In 2018 Forest Green Rovers became the first football club to be certified carbon neutral by the United Nations. Looking after nature is part of the game too!',
 credit:'Wikipedia, “Forest Green Rovers F.C.”',story:'You cleared the litter and found every treasure here: the coral has all its colour back. Reef Keeper sticker earned!'};
export const DIVE_REEF_KEY='fi2-dive-reef-v1';
/** Explore delight (Oct 21 2026, diveDelight.ts / diveSparkle.ts) adds, all optional and small (≈ 200 bytes at most): `hearts` a zone's
 *  friendship hearts (1..3), `whale` the zones whose whale was met (its note and coin, once ever), `spark` today's sparkle spots found
 *  ({d: local date, m: bitmask by DIVE_SPOTS index}). */
export type DiveReefSave={version:1;zones:Record<string,number[]>;restored:string[];hearts?:Record<string,number>;whale?:string[];spark?:{d:string;m:number}};

/** The guided path: the start, then the finds in nearest-next order (the buddy fish leads along it). */
export function journeyPath(spot:DiveSpot){
 const left=diveTaskFinds(spot).map(f=>({x:f.x,z:f.z,id:f.id})),out:{x:number;z:number;id:string}[]=[{x:JOURNEY_START.x,z:JOURNEY_START.z,id:'start'}];
 while(left.length){const c=out[out.length-1];let b=0,bd=Infinity;left.forEach((p,i)=>{const d=Math.hypot(p.x-c.x,p.z-c.z);if(d<bd){bd=d;b=i;}});out.push(left.splice(b,1)[0]);}
 return out;
}
/** The zone's eight pickups: two on each leg of the path (a third and two thirds along, nudged to alternate sides), on the sand. */
export function journeyPickups(spot:DiveSpot):DivePickup[]{
 const path=journeyPath(spot),out:DivePickup[]=[];let li=0,ti=0;
 for(let s=0;s+1<path.length;s++){const a=path[s],b=path[s+1],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz)||1,nx=-dz/len,nz=dx/len;
  for(const [t,side] of [[.36,1],[.7,-1]] as const){
   let x=a.x+dx*t+nx*side*1.3,z=a.z+dz*t+nz*side*1.3;const r=Math.hypot(x,z),lim=DIVE_ROOM_R-2;if(r>lim){x*=lim/r;z*=lim/r;}
   const kind:DivePickupKind=out.length%2?'treasure':'litter',src=kind==='litter'?LITTER[li++%LITTER.length]:TREASURES[ti++%TREASURES.length];
   out.push({i:out.length,kind,name:src.name,x,y:diveFloor(x,z,spot.floor)+.28,z,color:src.color});}}
 return out;
}
/** The whole zone's tasks: every pickup and every find. */
export const journeyTotal=(spot:DiveSpot)=>journeyPickups(spot).length+diveTaskFinds(spot).length;
/** 0..1 how restored the reef is, from the counts. */
export const reefHealth=(picked:number,found:number,total:number)=>total>0?Math.min(1,(picked+found)/total):1;
/** The reef's saturation for a health (REEF_DULL .. 1). */
export const reefColour=(health:number)=>REEF_DULL+(1-REEF_DULL)*Math.max(0,Math.min(1,health));
/** The pickup in reach (index), or -1: a few distance checks, no allocation. `got` = already collected (by index). */
export function reach(pickups:readonly DivePickup[],got:readonly boolean[],x:number,y:number,z:number){
 for(let i=0;i<pickups.length;i++){if(got[i])continue;const p=pickups[i];if(Math.hypot(p.x-x,p.y-y,p.z-z)<PICKUP_RANGE)return i;}
 return -1;
}
/** The next thing to visit (the buddy's lead): the nearest uncollected pickup or unused find, or null when the zone is done. */
export function nextTarget(spot:DiveSpot,pickups:readonly DivePickup[],got:readonly boolean[],found:readonly string[],x:number,z:number,out:{x:number;z:number}){
 let bd=Infinity;
 for(let i=0;i<pickups.length;i++){if(got[i])continue;const d=Math.hypot(pickups[i].x-x,pickups[i].z-z);if(d<bd){bd=d;out.x=pickups[i].x;out.z=pickups[i].z;}}
 for(const f of diveTaskFinds(spot)){if(found.includes(f.id))continue;const d=Math.hypot(f.x-x,f.z-z);if(d<bd){bd=d;out.x=f.x;out.z=f.z;}}
 return bd<Infinity?out:null;
}
export function parseDiveReef(raw:unknown,spots:readonly DiveSpot[]):DiveReefSave{
 const out:DiveReefSave={version:1,zones:{},restored:[]};if(!raw||typeof raw!=='object')return out;
 const r=raw as {zones?:unknown;restored?:unknown};
 const zones=r.zones&&typeof r.zones==='object'?r.zones as Record<string,unknown>:{};
 for(const s of spots){const ids=zones[s.id];if(!Array.isArray(ids))continue;const n=journeyPickups(s).length;const ok=[...new Set(ids.filter((i):i is number=>Number.isInteger(i)&&i>=0&&i<n))].sort((a,b)=>a-b);if(ok.length)out.zones[s.id]=ok;}
 if(Array.isArray(r.restored))out.restored=[...new Set(r.restored.filter((id):id is string=>typeof id==='string'&&spots.some(s=>s.id===id)))];
 const d=raw as {hearts?:unknown;whale?:unknown;spark?:unknown};
 if(d.hearts&&typeof d.hearts==='object'){const h:Record<string,number>={};for(const s of spots){const n=(d.hearts as Record<string,unknown>)[s.id];if(Number.isInteger(n)&&(n as number)>0)h[s.id]=Math.min(3,n as number);}if(Object.keys(h).length)out.hearts=h;}
 if(Array.isArray(d.whale)){const w=[...new Set(d.whale.filter((id):id is string=>typeof id==='string'&&spots.some(s=>s.id===id)))];if(w.length)out.whale=w;}
 const sp=d.spark as {d?:unknown;m?:unknown}|undefined;
 if(sp&&typeof sp==='object'&&typeof sp.d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(sp.d)&&Number.isInteger(sp.m)&&(sp.m as number)>0)out.spark={d:sp.d,m:(sp.m as number)&((1<<spots.length)-1)};
 return out;
}
export function addPickup(save:DiveReefSave,spot:string,i:number):DiveReefSave{const have=save.zones[spot]??[];if(have.includes(i))return save;return {...save,zones:{...save.zones,[spot]:[...have,i].sort((a,b)=>a-b)}};}
export function setHearts(save:DiveReefSave,spot:string,n:number):DiveReefSave{return {...save,hearts:{...save.hearts,[spot]:Math.max(0,Math.min(3,n|0))}};}
export function markWhale(save:DiveReefSave,spot:string):DiveReefSave{return save.whale?.includes(spot)?save:{...save,whale:[...(save.whale??[]),spot]};}
export function markRestored(save:DiveReefSave,spot:string):DiveReefSave{return save.restored.includes(spot)?save:{...save,restored:[...save.restored,spot]};}
/** The wallet run for a zone's restore reward (`dive:` → Training meter), fixed so it pays once ever. */
export const reefRunId=(spot:string)=>`dive:${spot}:reef`;
