import {EXHIBITS} from '../../endgame/museum';
import {ROOM,WING,FLOOR,CASE_PLACES,GALLERY_ORDER,museumPois,museumBlocked,museumObstacles,type Obstacle} from '../../museum/museumLayout';
import {MUSEUM_DOOR_HINT as DOOR_HINT} from '../../museum/museumDoors';
import {RoomCode,ROOM_BOUNDS} from '../roomPos';

/**
 * The History Museum as a shared room (docs/multiplayer-rooms-design.md Phase 2, "Museum prep status"). Pure data + pure helpers,
 * no three.js, no network: the room party layer (lib/multiplayer/roomParty.ts, Phase 1) reads this descriptor; the museum page
 * side (scene / camera / local pose / wake) is lib/multiplayer/rooms/museumHooks.ts.
 *
 * `RoomDescriptor` stays local and tiny; Phase 2 (Oct 22 2026) maps it onto the Phase 1 layer (lib/multiplayer/roomPos.ts,
 * roomParty.ts, components/party/useRoomParty.ts):
 *   code -> RoomCode.Museum (6, = Activity.Museum)       bounds -> ROOM_BOUNDS[RoomCode.Museum] (encodeRoomPose / clampToRoom)
 *   areas -> clampToMuseum (the receiver's L clamp)       door/spawns -> pickMuseumSpawn + museumRoomHooks.arrive (MuseumRoom.tsx)
 *   wake -> createRoomParty's wake + the scene's 20 fps   caps.fieldR -> ROOM_FIELD_SCALE (drawn dome ~0.8 m; obstacle ROOM_FIELD_R)
 *   busy -> useRoomParty's busy (fillRoomBody Busy)       stationText -> museumStationCode + presence defineStationLines
 * Coordinates are the museum's own metres (museumLayout.ts): x east, z toward the door (+z = front), scale 1.
 */
export type Rect={minX:number;maxX:number;minZ:number;maxZ:number};
export type Spot={x:number;z:number;yaw:number};
export type BusyFlag='experience'|'cert'|'balls'|'guideOpen'|'zoom';
export interface RoomDescriptor{
 /** RoomCode carried in the speed byte while zone = Indoors (design 2.2). */
 code:number;
 id:'museum';name:string;
 /** Room metres per wire unit's metre (1: the wire's x/z are room metres * 10, as on the island). */
 scale:number;
 /** The whole floor's AABB (the walkable L sits inside it). */
 bounds:Rect;
 /** The walkable parts of the L (union = the floor). */
 areas:readonly {id:string;rect:Rect}[];
 /** Galleries (sub-areas), walking order. */
 galleries:readonly {id:string;rect:Rect}[];
 /** The door (local): where a friend appears and walks in from. `inside` = today's arrival point (the local walk-in target). */
 door:{x:number;z:number;yaw:number;inside:{x:number;z:number}};
 /** Arrival slots round the door, slot 0 = today's arrival point. */
 spawns:readonly Spot[];
 /** Loop wake (design 3.2): same-room pose changes wake the sleeping loop; remote-only frames at `remoteFpsPhone` on phones;
  *  keep frames `settleMs` after the last change; Battery saver never wakes on network. */
 wake:{remote:boolean;remoteFpsPhone:number;settleMs:number;batterySaver:boolean};
 /** Friend rigs at once: min(remoteCap(tier), max). The busy force field radius in rooms (design 4: r 0.8 in rooms). */
 caps:{max:number;fieldR:number;stationR:number};
 /** The busy table (design 3.4): which page flag makes you Busy, in precedence order, and what friends read. */
 busy:readonly {flag:BusyFlag;text:string}[];
}

export const MUSEUM_ROOM_CODE:number=RoomCode.Museum;// 6 = Activity.Museum (multiplayer/protocol/presence.ts)
const M=.6;// collide()'s wall margin (museumScene.ts)
const D=ROOM.halfD;
const rectOf=(pts:readonly {x:number;z:number}[],pad:number):Rect=>{let a=Infinity,b=-Infinity,c=Infinity,d=-Infinity;for(const p of pts){a=Math.min(a,p.x);b=Math.max(b,p.x);c=Math.min(c,p.z);d=Math.max(d,p.z);}return {minX:a-pad,maxX:b+pad,minZ:c-pad,maxZ:d+pad};};

/** Today's local walk-in target (museumScene.ts: `target={x:ROOM.doorX,z:D-1.6}`). */
export const MUSEUM_ARRIVAL={x:ROOM.doorX,z:D-1.6} as const;
/** Arrival slots: an outer arc (r 1.6 round the door sill, slot 0 = MUSEUM_ARRIVAL) then an inner arc (r 2.6). All face in (yaw π). */
function spawnSlots():Spot[]{
 const out:Spot[]=[],cx=ROOM.doorX,cz=D;
 for(const [r,degs] of [[1.6,[0,-32,32,-64,64]],[2.6,[-16,16,-44,44]]] as const)for(const a of degs){const t=a*Math.PI/180;out.push({x:+(cx+Math.sin(t)*r).toFixed(3),z:+(cz-Math.cos(t)*r).toFixed(3),yaw:Math.PI});}
 return out;
}
export const MUSEUM_SPAWNS:readonly Spot[]=spawnSlots();

export const MUSEUM_BUSY:readonly {flag:BusyFlag;text:string}[]=[
 {flag:'experience',text:'Looking at <exhibit>'},// a full-screen experience (ExperienceStage): the exhibit's title
 {flag:'cert',text:'Looking at a certificate'},
 {flag:'balls',text:'Looking at World Cup balls'},
 {flag:'guideOpen',text:'Talking to Ada'},
 {flag:'zoom',text:'Looking at <exhibit>'},// exhibit zoom (MuseumZoomView.id; 'timeline' = the timeline wall)
];

export const MUSEUM_ROOM:RoomDescriptor={
 code:MUSEUM_ROOM_CODE,id:'museum',name:'History Museum',scale:1,
 bounds:ROOM_BOUNDS[RoomCode.Museum],// = FLOOR (tests/mp-rooms-museum.cjs)
 areas:[{id:'hall',rect:{minX:WING.x1,maxX:ROOM.halfW,minZ:-D,maxZ:D}},{id:'wing',rect:{minX:WING.x0,maxX:WING.x1,minZ:WING.z0,maxZ:WING.z1}}],
 galleries:GALLERY_ORDER.map(id=>({id,rect:rectOf(EXHIBITS.filter(e=>e.gallery===id&&CASE_PLACES[e.id]).map(e=>CASE_PLACES[e.id]),1.2)})),
 door:{x:ROOM.doorX,z:D+.2,yaw:Math.PI,inside:MUSEUM_ARRIVAL},
 spawns:MUSEUM_SPAWNS,
 wake:{remote:true,remoteFpsPhone:20,settleMs:300,batterySaver:false},
 caps:{max:5,fieldR:.8,stationR:2.5},
 busy:MUSEUM_BUSY,
};

// ---- Busy (sender side) ------------------------------------------------------------------------------------------------------
/** The page's busy state (MuseumRoom.tsx flags, written in place by museumHooks.setBusy). `balls` is a boolean here
 *  (MuseumRoom's `balls!==false`: '' = the gallery open with no ball picked). */
export interface MuseumBusyFlags{guideOpen:boolean;cert:boolean;balls:boolean;experience:string|null;zoom:string|null}
export const museumBusyFlags=():MuseumBusyFlags=>({guideOpen:false,cert:false,balls:false,experience:null,zoom:null});
const LOOKING:Record<string,string>={timeline:'Looking at the timeline'};
for(const e of EXHIBITS)LOOKING[e.id]=`Looking at ${e.title}`;
/** The first busy flag set (MUSEUM_BUSY order), or null when walking about. */
export function museumBusyFlag(f:MuseumBusyFlags):BusyFlag|null{
 if(f.experience)return 'experience';if(f.cert)return 'cert';if(f.balls)return 'balls';if(f.guideOpen)return 'guideOpen';if(f.zoom)return 'zoom';return null;
}
/** The local line (no allocation: table strings). '' = not busy. */
export function museumBusyText(f:MuseumBusyFlags):string{
 const k=museumBusyFlag(f);if(!k)return '';
 if(k==='experience')return LOOKING[f.experience!]??'Looking at an exhibit';
 if(k==='zoom')return LOOKING[f.zoom!]??'Looking at an exhibit';
 for(const b of MUSEUM_BUSY)if(b.flag===k)return b.text;
 return '';
}

// ---- Station line (receiver side: the kind of busy is not on the wire, design 2.2) ---------------------------------------------
type Station={a:{x:number;z:number};b:{x:number;z:number};text:string};
const STATIONS:Station[]=museumPois().map(p=>({a:p.a,b:p.b,text:p.id==='guide'?'Talking to Ada':p.id==='wc-balls'?'Looking at World Cup balls':LOOKING[p.id]??`Looking at ${p.label}`}));
export const MUSEUM_IDLE_TEXT='In the museum';
/** Index of the nearest look-at spot within `caps.stationR` of (x,z), or -1. */
function museumStationIndex(x:number,z:number):number{
 let best=MUSEUM_ROOM.caps.stationR,at=-1;
 for(let i=0;i<STATIONS.length;i++){const s=STATIONS[i],dx=s.b.x-s.a.x,dz=s.b.z-s.a.z,l=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-s.a.x)*dx+(z-s.a.z)*dz)/l)),d=Math.hypot(s.a.x+dx*t-x,s.a.z+dz*t-z);if(d<best){best=d;at=i;}}
 return at;
}
/** What a busy friend at room-local (x,z) is doing: the nearest look-at spot within `caps.stationR`, else MUSEUM_IDLE_TEXT. */
export function museumStationText(x:number,z:number):string{
 const i=museumStationIndex(x,z);return i<0?MUSEUM_IDLE_TEXT:STATIONS[i].text;
}
/** Local station codes (never on the wire): MUSEUM_STATION_BASE + the spot's index; nothing near = Activity.Museum ("In the museum"). */
export const MUSEUM_STATION_BASE=120;
export function museumStationCode(x:number,z:number):number{
 const i=museumStationIndex(x,z);return i<0?MUSEUM_ROOM_CODE:MUSEUM_STATION_BASE+i;
}
/** The station lines for presence.defineStationLines (registered once when the museum's party layer attaches). */
export function museumStationLines():Record<number,readonly [string,string]>{
 const out:Record<number,readonly [string,string]>={};
 STATIONS.forEach((s,i)=>{out[MUSEUM_STATION_BASE+i]=[s.text,s.text==='Talking to Ada'?'\u{1F4AC}':s.text==='Looking at World Cup balls'?'\u26BD':'\u{1F3DB}\uFE0F'];});
 return out;
}

// ---- Bounds ---------------------------------------------------------------------------------------------------------------------
/** Clamp a friend's room-local point inside the L, exactly as museumScene.ts collide() clamps the local player (the door gap lets
 *  an arriving / leaving friend stand on the sill). Writes `out` (no allocation). */
export function clampToMuseum<P extends {x:number;z:number}>(out:P,x:number,z:number):P{
 x=Math.min(ROOM.halfW-M,Math.max(FLOOR.minX+M,x));
 const zMax=x<WING.x1?WING.z1-M:Math.abs(x-ROOM.doorX)<ROOM.doorHalf-.15?D+.5:D-M;
 out.x=x;out.z=Math.min(zMax,Math.max(-D+M,z));return out;
}
let obstacles:Obstacle[]|null=null;
/** Walkable for a body of radius r (museumLayout's rule; the obstacle list is built once). */
export const museumWalkable=(x:number,z:number,r=.3)=>!museumBlocked(x,z,obstacles??=museumObstacles(),r);

// ---- Arrival ---------------------------------------------------------------------------------------------------------------------
/** The first spawn slot with nobody within `clear` m (friends already standing about, or other arrivals); all taken: the slot
 *  `seed` picks (e.g. the member's slot index), so simultaneous arrivals still spread. Writes `out`. */
export function pickMuseumSpawn(out:Spot,occupied:ArrayLike<{x:number;z:number}>,seed=0,clear=.7):Spot{
 for(const s of MUSEUM_SPAWNS){let free=true;for(let i=0;i<occupied.length;i++){const o=occupied[i];if(Math.hypot(o.x-s.x,o.z-s.z)<clear){free=false;break;}}
  if(free){out.x=s.x;out.z=s.z;out.yaw=s.yaw;return out;}}
 const s=MUSEUM_SPAWNS[((seed%MUSEUM_SPAWNS.length)+MUSEUM_SPAWNS.length)%MUSEUM_SPAWNS.length];out.x=s.x;out.z=s.z;out.yaw=s.yaw;return out;
}

// ---- Island door hint (owner: island friends see "2 in the Museum" at the door) -----------------------------------------------------
/** World position of the hint: above the entrance canopy (museumExterior.ts: canopy 4 m high, 0.6 m deep) at the door anchor. */
export const MUSEUM_DOOR_HINT=DOOR_HINT;
/** "2 in the Museum" (null when nobody is in). Counted from the roster: members whose roomOf(pose) === MUSEUM_ROOM_CODE. */
export function museumDoorHintText(n:number):string|null{return n>0?`${n} in the Museum`:null;}
