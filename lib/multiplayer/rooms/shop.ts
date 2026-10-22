import {ROOM,DOOR,BENCH,WALL_M,BODY_R,stationPois,clerkPoi,segPoint,shopBlocked,shopObstacles,type Box,type ShopStation} from '../../shop/shopLayout';
import {SHOP_CLERK,SHOP_SHOPPER_CAP} from '../../shop/shopCast';
import {STATION,defineStationText} from '../presence';

/**
 * The Kit Shop as a shared room (docs/multiplayer-rooms-design.md Phase 4, client side). Pure data + pure helpers, no three.js, no
 * network: the shop page mounts the shared room layer (components/party/useRoomParty.ts -> lib/multiplayer/roomParty.ts) through
 * lib/multiplayer/rooms/shopHooks.ts; this file is what that layer and the island need to know about the shop.
 *
 * Same shape as the Museum / Arcade descriptors (lib/multiplayer/rooms/museum.ts, arcade.ts). Coordinates are the shop's own
 * metres (lib/shop/shopLayout.ts): x east, z toward the doors (+z = front), the floor x -8..8, z -7..4.5, scale 1.
 * Wire: room code 7 (= RoomCode.Shop = Activity.Shop, so old clients print "In the Kit Shop" / "In the shop" while Busy); poses
 * are the shared room encoding (roomBody, y in the reserved band) against the CURRENT relay (v1): entry Warp + one retry 5.5 s later
 * (presence.ts entryWarp), no new message. Outfits: a friend's look comes from their Hello (join / resume) only; live try-on in a
 * studio is not shared in v1 (relay v1.1 re-broadcasts the look on a resume Hello, so a new outfit shows after the next page change).
 */
export type Rect={minX:number;maxX:number;minZ:number;maxZ:number};
export type Spot={x:number;z:number;yaw:number};
/** The shop page's busy flags (components/shop/ShopRoom.tsx: `covered=!!studio||myKit||!!talking`). */
export type ShopBusyFlag='studio'|'myKit'|'talking';
export interface ShopRoomDescriptor{
 code:number;id:'shop';name:string;scale:number;
 /** The floor's AABB (the room clamp: shopCollide's walls). */
 bounds:Rect;
 /** Named parts of the floor: the three studio stands, the till, the bench corner, the door and the open floor. */
 areas:readonly {id:string;rect:Rect}[];
 /** The doors (local): where a friend appears; `inside` = today's arrival point (the local walk-in target). */
 door:{x:number;z:number;yaw:number;inside:{x:number;z:number}};
 /** Arrival slots round the doors, slot 0 = today's arrival point. */
 spawns:readonly Spot[];
 wake:{remote:boolean;remoteFpsPhone:number;settleMs:number;batterySaver:boolean};
 /** Friend rigs at once (min with remoteCap); busy force field radius in rooms; station lookup radius. */
 caps:{max:number;fieldR:number;stationR:number};
 /** The busy table (design 3.4), in precedence order: the page flag, what friends read, the local station code it reads as. */
 busy:readonly {flag:ShopBusyFlag;text:string;station:number}[];
}

export const SHOP_ROOM_CODE=7;// = RoomCode.Shop = Activity.Shop (multiplayer/protocol)
const r2=(v:number)=>Math.round(v*1000)/1000;
/** Today's local walk-in target (shopScene.ts: `target={x:DOOR.x,z:ROOM.front-1.8}`). */
export const SHOP_ARRIVAL={x:DOOR.x,z:ROOM.front-1.8} as const;
/** Nine arrival slots round the doors: an arc r 1.8 (slot 0 = SHOP_ARRIVAL) then an arc r 2.8; all face in (yaw π). */
function spawnSlots():Spot[]{
 const out:Spot[]=[],cx=DOOR.x,cz=ROOM.front;
 for(const [r,degs] of [[1.8,[0,-32,32,-64,64]],[2.8,[-16,16,-44,44]]] as const)for(const a of degs){const t=a*Math.PI/180;out.push({x:r2(cx+Math.sin(t)*r),z:r2(cz-Math.cos(t)*r),yaw:Math.PI});}
 return out;
}
export const SHOP_SPAWNS:readonly Spot[]=spawnSlots();

/** The clerk's name comes from the shop's cast (Femi). */
export const SHOP_CLERK_TEXT=`Talking to ${SHOP_CLERK.def.name}`;
export const SHOP_BUSY:readonly {flag:ShopBusyFlag;text:string;station:number}[]=[
 {flag:'studio',text:'Designing a kit',station:STATION.ShopDesign},// a studio overlay (jersey / boots / ball): at the studio stand
 {flag:'talking',text:SHOP_CLERK_TEXT,station:STATION.ShopClerk},// the chat drawer (the till: the clerk)
 {flag:'myKit',text:'Looking at my kit',station:STATION.ShopKit},// the My kit panel (anywhere on the floor)
];
// The words / icons friends read over a busy friend's field (local codes, never on the wire).
defineStationText(STATION.ShopDesign,'Designing a kit','\u{1F3A8}');
defineStationText(STATION.ShopClerk,SHOP_CLERK_TEXT,'\u{1F4AC}');
defineStationText(STATION.ShopKit,'Looking at my kit','\u{1F455}');

const STANDS=stationPois();
const TILL=clerkPoi(SHOP_CLERK.def.name);
const rectAround=(pts:readonly {x:number;z:number}[],pad:number):Rect=>({minX:r2(Math.min(...pts.map(p=>p.x))-pad),maxX:r2(Math.max(...pts.map(p=>p.x))+pad),minZ:r2(Math.min(...pts.map(p=>p.z))-pad),maxZ:r2(Math.max(...pts.map(p=>p.z))+pad)});
const BOUNDS:Rect={minX:-ROOM.halfW,maxX:ROOM.halfW,minZ:ROOM.back,maxZ:ROOM.front};

export const SHOP_ROOM:ShopRoomDescriptor={
 code:SHOP_ROOM_CODE,id:'shop',name:'Kit Shop',scale:1,
 bounds:BOUNDS,
 areas:[
  ...STANDS.map(p=>({id:`studio-${p.station as ShopStation}`,rect:rectAround(p.stand?[p.a,p.b,p.stand]:[p.a,p.b],.6)})),
  {id:'till',rect:rectAround([TILL.a,TILL.b],.6)},
  {id:'bench',rect:{minX:r2(BENCH.x-BENCH.w/2-.6),maxX:r2(BENCH.x+BENCH.w/2+.6),minZ:r2(BENCH.z-BENCH.d/2-.6),maxZ:r2(BENCH.z+BENCH.d/2+.6)}},
  {id:'door',rect:{minX:DOOR.x-DOOR.half,maxX:DOOR.x+DOOR.half,minZ:ROOM.front-2,maxZ:ROOM.front}},
  {id:'floor',rect:{minX:-ROOM.halfW,maxX:ROOM.halfW,minZ:.25,maxZ:ROOM.front}},
 ],
 door:{x:DOOR.x,z:ROOM.front+.4,yaw:Math.PI,inside:SHOP_ARRIVAL},
 spawns:SHOP_SPAWNS,
 wake:{remote:true,remoteFpsPhone:20,settleMs:300,batterySaver:false},
 caps:{max:5,fieldR:.8,stationR:2.5},
 busy:SHOP_BUSY,
};

// ---- Busy (sender side) ------------------------------------------------------------------------------------------------------
export interface ShopBusyFlags{studio:string|null;myKit:boolean;talking:string|null}
export const shopBusyFlags=():ShopBusyFlags=>({studio:null,myKit:false,talking:null});
/** The first busy flag set (SHOP_BUSY order), or null when walking about. */
export function shopBusyFlag(f:ShopBusyFlags):ShopBusyFlag|null{if(f.studio)return 'studio';if(f.talking)return 'talking';if(f.myKit)return 'myKit';return null;}
/** The local line ('' = not busy). A chat with a shopper reads "Chatting" (only the clerk is at a fixed spot). */
export function shopBusyText(f:ShopBusyFlags):string{
 const k=shopBusyFlag(f);if(!k)return '';
 if(k==='talking'&&f.talking!==SHOP_CLERK.def.id)return 'Chatting';
 for(const b of SHOP_BUSY)if(b.flag===k)return b.text;return '';
}

// ---- Station (receiver side: the kind of busy is not on the wire, design 2.2) ------------------------------------------------
/** What a busy friend at room-local (x, z) is doing, as a local STATION code: at a studio stand (within 1.75 m of its wall, the
 *  scene's NEAR_STATION) "Designing a kit"; at the till "Talking to Femi"; anywhere else "Looking at my kit". */
export function shopStationAt(x:number,z:number):number{
 let best=1.75,code:number=STATION.ShopKit;
 for(const p of STANDS){const s=segPoint(p,x,z),d=Math.hypot(s.x-x,s.z-z);if(d<best){best=d;code=STATION.ShopDesign;}}
 {const s=segPoint(TILL,x,z),d=Math.hypot(s.x-x,s.z-z);if(d<Math.min(best,1.5)){code=STATION.ShopClerk;}}
 return code;
}

// ---- Bounds ---------------------------------------------------------------------------------------------------------------------
/** Clamp a friend's room-local point to the floor exactly as shopCollide clamps the local player (the door gap lets an arriving /
 *  leaving friend stand on the sill). Writes `out`. */
export function clampToShop<P extends {x:number;z:number}>(out:P,x:number,z:number):P{
 const r=BODY_R,inDoor=Math.abs(x-DOOR.x)<DOOR.half-.15;
 out.x=Math.max(-ROOM.halfW+WALL_M+r,Math.min(ROOM.halfW-WALL_M-r,x));
 out.z=Math.max(ROOM.back+.55+r,Math.min(inDoor?ROOM.front+.6:ROOM.front-WALL_M-r,z));
 return out;
}
let obstacles:Box[]|null=null;
export const shopWalkable=(x:number,z:number,r=BODY_R)=>!shopBlocked(x,z,obstacles??=shopObstacles(),r);

// ---- Arrival ---------------------------------------------------------------------------------------------------------------------
/** The first spawn slot with nobody within `clear` m; all taken: the slot `seed` picks. Writes `out`. */
export function pickShopSpawn(out:Spot,occupied:ArrayLike<{x:number;z:number}>,seed=0,clear=.7):Spot{
 for(const s of SHOP_SPAWNS){let free=true;for(let i=0;i<occupied.length;i++){const o=occupied[i];if(Math.hypot(o.x-s.x,o.z-s.z)<clear){free=false;break;}}
  if(free){out.x=s.x;out.z=s.z;out.yaw=s.yaw;return out;}}
 const s=SHOP_SPAWNS[((seed%SHOP_SPAWNS.length)+SHOP_SPAWNS.length)%SHOP_SPAWNS.length];out.x=s.x;out.z=s.z;out.yaw=s.yaw;return out;
}

// ---- Crowd (heat-neutral: friends replace shoppers) ------------------------------------------------------------------------------
/** Shoppers to keep with `friends` party friends drawn here: the rig count never rises. */
export function shopCrowdCount(friends:number,base=SHOP_SHOPPER_CAP):number{return Math.max(0,base-Math.max(0,friends|0));}

// ---- Island door hint ('2 in the Kit Shop' over the shop door: lib/shop/shopDoors.ts SHOP_DOOR_HINT, drawn by townBridge) -------
export function shopDoorHintText(n:number):string{return n>0?`${n} in the Kit Shop`:'';}
