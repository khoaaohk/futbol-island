import {findFloorPath,type FloorPoint} from '../konbini/konbiniPath';

/**
 * The walk-in Kit Shop floor plan (Oct 12 2026, user: "for the boots store, player should be able to walk inside. there should be
 * npcs here along with clerk"). Pure data and maths, so tests/shop-room.cjs runs it in node. The room grew 1.5 m toward the street
 * (front 3 → 4.5) for an entrance with glass doors; the walls, niches, boot lightbox and ball cubbies keep their places.
 *
 * Collision is the Museum/Konbini recipe: axis-aligned boxes pushed out by the body radius, plus the room clamp; the clerk's
 * corner behind the counter is one closed box (counter + side panels + back cabinet), so nobody walks or gets stuck behind it.
 * Tap-to-walk reuses the Konbini's grid A* (lib/konbini/konbiniPath.ts, a 16 × 12.8 m grid at z −6…6.8): the shop floor
 * (z −7…4.5) maps into it with a +1 m shift.
 */
export type ShopStation='jersey'|'boots'|'ball';
export const SHOP_STATIONS:readonly ShopStation[]=['jersey','boots','ball'];
export const ROOM={halfW:8,back:-7,front:4.5,h:4.6} as const;
export const DOOR={x:0,half:1.2} as const;
/** Centre island counter (the till) and the clerk standing behind it, facing the door. */
export const COUNTER={x:0,z:-.5,w:3.8,d:1.3} as const;
export const CLERK={x:0,z:-1.75,yaw:0} as const;
/** The clerk's corner: counter, two low side panels and the back cabinet, one closed box. */
export const CLERK_ZONE={minX:-2.05,maxX:2.05,minZ:-2.6,maxZ:.25} as const;
export const PODIUMS:Record<ShopStation,{x:number;z:number}>={jersey:{x:-3.9,z:-4.5},boots:{x:3.9,z:-4.5},ball:{x:6,z:-.4}};
export const BENCH={x:-4.6,z:2.1,w:2.5,d:.68} as const;
export const PLANTS:readonly [number,number][]=[[-7.2,3.7],[7.2,3.4]];
/** Wall fixtures' fronts: folded-shirt shelves (west), ball cubbies (east), niches and boot shelves (back). */
export const SHELVES_WEST={minX:-ROOM.halfW,maxX:-7.55,minZ:-6.15,maxZ:-.65} as const;
export const CUBBIES_EAST={minX:7.45,maxX:ROOM.halfW,minZ:-6.25,maxZ:.25} as const;
export const BACK_FACE=ROOM.back+.55;
/**
 * Wall signs (world units; `aspect` = atlas height / width, see SIGN in shopScene.ts). The west wall's KIT SHOP wordmark and the
 * DESIGN YOUR OWN KIT strip above the shirt shelves used to share the same plane AND overlap by ~0.3 m (z-fighting, the wordmark's
 * plate covering the strip's lettering). They now stack with a clear gap, under the ceiling and above the top shirt stacks;
 * tests/shop-signs.cjs keeps it that way.
 */
export const WALL_SIGNS={
 jersey:{width:4.4,aspect:96/512,x:-4,y:4.12,z:ROOM.back+.03},
 boots:{width:4.4,aspect:96/512,x:3.95,y:4.12,z:ROOM.back+.03},
 ball:{width:3.8,aspect:96/512,x:ROOM.halfW-.03,y:3.95,z:-3},
 logo:{width:4.6,aspect:150/640,x:-ROOM.halfW+.03,y:4.0,z:-3.4},
 tagline:{width:4.2,aspect:96/512,x:-ROOM.halfW+.03,y:2.92,z:-3.4},
} as const;
/** Top of the folded-shirt stacks on the west shelves (top shelf 2.25 + three 0.075 m layers). */
export const SHELF_STACK_TOP=2.25+.06+2*.075+.035;

export type Box={minX:number;maxX:number;minZ:number;maxZ:number};
const rect=(x:number,z:number,w:number,d:number):Box=>({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});
export function shopObstacles():Box[]{
 const o:Box[]=[{...CLERK_ZONE}];
 for(const s of SHOP_STATIONS)o.push(rect(PODIUMS[s].x,PODIUMS[s].z,1,1));
 o.push(rect(BENCH.x,BENCH.z,BENCH.w,BENCH.d));
 for(const [x,z] of PLANTS)o.push(rect(x,z,.8,.8));
 o.push({...SHELVES_WEST},{...CUBBIES_EAST});
 // The front sill either side of the doors (the walls themselves are the room clamp).
 o.push({minX:-ROOM.halfW-1,maxX:DOOR.x-DOOR.half,minZ:ROOM.front-.1,maxZ:ROOM.front+1},{minX:DOOR.x+DOOR.half,maxX:ROOM.halfW+1,minZ:ROOM.front-.1,maxZ:ROOM.front+1});
 return o;
}
export const BODY_R=.3,WALL_M=.1;
/** Inside the room (the door gap lets you step out the front) and clear of every obstacle by the body radius. */
export function shopBlocked(x:number,z:number,obstacles:readonly Box[],r=BODY_R){
 if(Math.abs(x)>ROOM.halfW-WALL_M-r||z<BACK_FACE+r)return true;
 if(z>ROOM.front-WALL_M-r&&!(Math.abs(x-DOOR.x)<=DOOR.half-.15&&z<=ROOM.front+.6))return true;
 for(const o of obstacles)if(x>o.minX-r&&x<o.maxX+r&&z>o.minZ-r&&z<o.maxZ+r)return true;
 return false;
}
/** Push a body out of the obstacles (two passes) and clamp it to the room: the museum's collide(). */
export function shopCollide(p:{x:number;z:number},obstacles:readonly Box[],r=BODY_R){
 for(let pass=0;pass<2;pass++)for(const o of obstacles){if(p.x>o.minX-r&&p.x<o.maxX+r&&p.z>o.minZ-r&&p.z<o.maxZ+r){
  const dl=p.x-(o.minX-r),dr=o.maxX+r-p.x,db=p.z-(o.minZ-r),df=o.maxZ+r-p.z,mn=Math.min(dl,dr,db,df);
  if(mn===dl)p.x=o.minX-r;else if(mn===dr)p.x=o.maxX+r;else if(mn===db)p.z=o.minZ-r;else p.z=o.maxZ+r;}}
 const inDoor=Math.abs(p.x-DOOR.x)<DOOR.half-.15;
 p.x=Math.max(-ROOM.halfW+WALL_M+r,Math.min(ROOM.halfW-WALL_M-r,p.x));
 p.z=Math.max(BACK_FACE+r,Math.min(inDoor?ROOM.front+.6:ROOM.front-WALL_M-r,p.z));
 return p;
}
/** Tap-to-walk: the Konbini's A* (16 × 12.8 m grid, z −6…6.8) with the shop floor shifted +1 m in z. */
export function findShopPath(from:FloorPoint,to:FloorPoint,blocked:(x:number,z:number)=>boolean):FloorPoint[]{
 return findFloorPath({x:from.x,z:from.z+1},{x:to.x,z:to.z+1},(x,z)=>blocked(x,z-1)).map(p=>({x:p.x,z:p.z-1}));
}

/** Somewhere to stand and act: a station wall, the clerk at the till, or a shopper. `a`–`b` is where you stand; `face` what you
 *  look at; `anchor` where the prompt pill floats (world). `box` is the tap volume. */
export type ShopPoi={id:string;kind:'station'|'npc';station?:ShopStation;npc?:string;label:string;a:FloorPoint;b:FloorPoint;face:FloorPoint;
 /** Where a tap or "Show me" walks you (default: the closest point on a–b). */
 stand?:FloorPoint;
 anchor:{x:number;y:number;z:number};box:{minX:number;maxX:number;minZ:number;maxZ:number;h:number}};
export const STATION_PROMPT:Record<ShopStation,string>={jersey:'Design a jersey',boots:'Design boots',ball:'Design a ball'};
export function stationPois():ShopPoi[]{
 return [
  {id:'jersey',kind:'station',station:'jersey',label:STATION_PROMPT.jersey,a:{x:-6.9,z:-4.9},b:{x:-1,z:-4.9},face:{x:-3.9,z:-7},stand:{x:-3.9,z:-3.4},anchor:{x:-3.9,y:1.6,z:-4.5},
   box:{minX:-7.9,maxX:-.3,minZ:-7.3,maxZ:-3.6,h:4.7}},
  {id:'boots',kind:'station',station:'boots',label:STATION_PROMPT.boots,a:{x:1,z:-4.9},b:{x:6.8,z:-4.9},face:{x:3.9,z:-7},stand:{x:3.9,z:-3.4},anchor:{x:3.9,y:1.6,z:-4.5},
   box:{minX:.3,maxX:7.4,minZ:-7.3,maxZ:-3.6,h:4.7}},
  {id:'ball',kind:'station',station:'ball',label:STATION_PROMPT.ball,a:{x:6.4,z:-3.4},b:{x:6.4,z:1.6},face:{x:8,z:-1.4},stand:{x:4.95,z:-.4},anchor:{x:6,y:1.6,z:-.4},
   box:{minX:5.4,maxX:8.3,minZ:-3.3,maxZ:2.6,h:4.7}},
 ];
}
/** The till: stand at the counter's front and talk to the clerk. */
export function clerkPoi(name:string):ShopPoi{
 return {id:'clerk',kind:'npc',npc:'clerk',label:`Talk to ${name}`,a:{x:-1.5,z:.65},b:{x:1.5,z:.65},face:{x:CLERK.x,z:CLERK.z},anchor:{x:CLERK.x,y:2.25,z:CLERK.z},
  box:{minX:-.5,maxX:.5,minZ:CLERK.z-.4,maxZ:CLERK.z+.4,h:2}};
}
/** Distance from a point to the segment a–b, and the closest point on it. */
export function segPoint(p:Pick<ShopPoi,'a'|'b'>,x:number,z:number){const dx=p.b.x-p.a.x,dz=p.b.z-p.a.z,l=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-p.a.x)*dx+(z-p.a.z)*dz)/l));
 return {x:p.a.x+dx*t,z:p.a.z+dz*t};}
export const NEAR_STATION=1.75,NEAR_NPC=1.5;
