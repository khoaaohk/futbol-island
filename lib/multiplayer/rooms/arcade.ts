// Arcade hub room descriptor for the room party layer (docs/multiplayer-rooms-design.md §3, Phase 3).
// PREP ONLY: written against the tiny LOCAL `RoomDescriptor` below, which mirrors the design doc. The shared layer
// (lib/multiplayer/roomParty.ts, branch mp-rooms-phase1) owns the real type; the integrator maps names as listed in
// docs/multiplayer-rooms-design.md "Arcade prep status". Pure data + pure helpers: no three.js, no DOM, no allocation in the
// per-frame helpers (they write into caller-owned `out` objects).
import {arcadeCabinets,arcadeHubCabinets,type ArcadeCabinetId} from '../../arcade/arcadeCatalog';

export type RoomBounds={minX:number;maxX:number;minZ:number;maxZ:number};
export type RoomPoint={x:number;z:number};
export type RoomArea={id:string;kind:'cabinet'|'counter'|'table'|'machine'|'lounge'|'door';x:number;z:number;r:number;label:string;
 /** cabinet only: where the player stands to play (the busy pose spot; force field centre). */
 standX?:number;standZ?:number;standYaw?:number};
/** A busy source: an existing UI flag of the room page. `anchor:'station'` = the friend is drawn at the station named by the flag's
 *  value (the cabinet of the running game); `'here'` = at the spot where they stood when the overlay opened. */
export type RoomBusy={flag:string;priority:number;anchor:'station'|'here';label:string;receiverLabel:string};
export interface RoomDescriptor{
 code:number;name:string;route:string;
 /** room-local metres (wire x/z = metres * 10 via roomBody); floor at y 0. */
 scale:number;floorY:number;
 /** the local player's movement clamp (arcadeRoomScene tick) = the clamp for friends' interpolated poses. */
 bounds:RoomBounds;
 door:RoomPoint&{yaw:number};spawn:RoomPoint&{yaw:number};spawnSlots:readonly RoomPoint[];
 exit:{halfWidth:number;z:number};
 areas:readonly RoomArea[];
 /** receivers label a busy friend by the nearest station within this radius (design §2.2). */
 stationRadius:number;
 busy:readonly RoomBusy[];
 /** busy flags of the page that are NOT busy (kept so the source-scan test proves every flag was classified). */
 notBusy:readonly string[];
 caps:{friendsMax:number;npcBasePhone:number;npcBaseDesktop:number;replaceNpcs:boolean;fieldRadius:number};
 wake:{sleepsWhenIdle:boolean;idleFps:number;localFpsPhone:number;localFpsDesktop:number;remoteFpsPhone:number;remoteFpsDesktop:number;remoteSettleMs:number};
}

/** RoomCode.Arcade (design §2.2: = Activity.Arcade so old clients still print the room). */
export const ARCADE_ROOM_CODE=5;
const STAND=1.8; // arcadeRoomScene walkTo(): the cabinet's play spot is 1.8 m in front of it
const hub=arcadeHubCabinets();
// Prize counter transform, mirrored from arcadeRoomProps.ts `place(10,-9.6,13,-2,-Math.PI/3)` (tests re-derive it from the source).
const PRIZE={fromX:10,fromZ:-9.6,toX:13,toZ:-2,yaw:-Math.PI/3};
function prizePoint(x:number,z:number):RoomPoint{const dx=x-PRIZE.fromX,dz=z-PRIZE.fromZ,c=Math.cos(PRIZE.yaw),s=Math.sin(PRIZE.yaw);return{x:PRIZE.toX+dx*c+dz*s,z:PRIZE.toZ-dx*s+dz*c};}
const counter=prizePoint(10,-6.1);

export const ARCADE_GAME_LABEL:Readonly<Record<ArcadeCabinetId,string>>=Object.fromEntries(arcadeCabinets.map(c=>[c.id,`Playing ${c.name}`])) as Record<ArcadeCabinetId,string>;

export const ARCADE_ROOM:RoomDescriptor={
 code:ARCADE_ROOM_CODE,name:'the Arcade',route:'/arcade',scale:1,floorY:0,
 bounds:{minX:-14,maxX:14,minZ:-11,maxZ:12},
 door:{x:0,z:12,yaw:Math.PI},spawn:{x:0,z:10.3,yaw:Math.PI},
 // Around the door, inside bounds, clear of the exit trigger (|x|<2.1 && z>11.5) and >= 0.9 m apart (crowd body separation 0.84 m).
 // Slot 0 is today's default start; the next 8 cover playerBatch capacity 8.
 spawnSlots:[{x:0,z:10.3},{x:-1.2,z:10.3},{x:1.2,z:10.3},{x:-2.4,z:10.1},{x:2.4,z:10.1},{x:-.6,z:9.2},{x:.6,z:9.2},{x:-1.8,z:9.2},{x:1.8,z:9.2}],
 exit:{halfWidth:2.1,z:11.5},
 areas:[
  ...hub.map(c=>({id:c.id,kind:'cabinet' as const,x:c.x,z:c.z,r:1.25,label:c.name,standX:c.x+Math.sin(c.yaw)*STAND,standZ:c.z+Math.cos(c.yaw)*STAND,standYaw:c.yaw+Math.PI})),
  {id:'prize-counter',kind:'counter',x:counter.x,z:counter.z,r:1.2,label:'At the prize counter'},
  {id:'air-hockey',kind:'table',x:-10,z:-1,r:2.4,label:'Watching air hockey'},
  {id:'claw',kind:'machine',x:-12,z:8,r:1.6,label:'At the claw machine'},
  {id:'vending',kind:'machine',x:12,z:8,r:1.4,label:'At the drinks machine'},
  {id:'lounge-north',kind:'lounge',x:-13,z:-6,r:2,label:'Sitting in the lounge'},
  {id:'lounge-south',kind:'lounge',x:-13,z:2.5,r:2,label:'Sitting in the lounge'},
  {id:'door',kind:'door',x:0,z:12,r:2.1,label:'At the door'},
 ],
 stationRadius:2.5,
 // ArcadeRoom.tsx: a running `game` replaces the hub (single player); `hall` = Hall of High Scores overlay; `list` = Coins panel.
 // The kind is not on the wire (design §2.2): receivers see "Playing <game>" when the pose sits on a cabinet's stand spot, else
 // the shared non-cabinet line (list and hall cannot be told apart by a receiver).
 busy:[
  {flag:'game',priority:3,anchor:'station',label:'Playing <game>',receiverLabel:'Playing <game>'},
  {flag:'hall',priority:2,anchor:'here',label:'Looking at high scores',receiverLabel:'Looking at high scores'},
  {flag:'list',priority:1,anchor:'here',label:'Choosing a game',receiverLabel:'Looking at high scores'},
 ],
 notBusy:['socialNear','revealed','entryDone','minimumLoadingDone','exiting','queryReady','near','ready','failed'],
 caps:{friendsMax:8,npcBasePhone:3,npcBaseDesktop:5,replaceNpcs:true,fieldRadius:.8},
 // The hub never fully sleeps while visible (15 fps floor; arcadeRoomScene tick). Remote-only motion: 20/30 fps for 300 ms.
 wake:{sleepsWhenIdle:false,idleFps:15,localFpsPhone:30,localFpsDesktop:60,remoteFpsPhone:20,remoteFpsDesktop:30,remoteSettleMs:300},
};

const cabinetAreas=ARCADE_ROOM.areas.filter(a=>a.kind==='cabinet');
/** Busy flags of ArcadeRoom.tsx, in priority order. */
export type ArcadeBusyState={game:ArcadeCabinetId|null;list:boolean;hall:boolean};
export type ArcadeBusyPose={busy:boolean;flag:''|'game'|'hall'|'list';game:ArcadeCabinetId|null;x:number;z:number;yaw:number;label:string};
export function createArcadeBusyPose():ArcadeBusyPose{return{busy:false,flag:'',game:null,x:0,z:0,yaw:0,label:''};}
const ON_CABINET=.35;
/** Sender side: the pose to send for the hub's busy state. `here` = last hub pose (or null when the page opened straight into a game
 *  via ?game=). Writes into `out` (no allocation). A running game puts the friend exactly on that cabinet's stand spot; an overlay
 *  keeps the spot but nudges it off any stand spot so receivers never mislabel it as "Playing". */
export function arcadeBusyPose(state:ArcadeBusyState,here:{x:number;z:number;yaw:number}|null,out:ArcadeBusyPose):ArcadeBusyPose{
 const sx=here?here.x:ARCADE_ROOM.spawn.x,sz=here?here.z:ARCADE_ROOM.spawn.z,syaw=here?here.yaw:ARCADE_ROOM.spawn.yaw;
 if(state.game){for(let i=0;i<cabinetAreas.length;i++){const a=cabinetAreas[i];if(a.id!==state.game)continue;out.busy=true;out.flag='game';out.game=state.game;out.x=a.standX!;out.z=a.standZ!;out.yaw=a.standYaw!;out.label=ARCADE_GAME_LABEL[state.game];return out;}}
 out.game=null;out.x=sx;out.z=sz;out.yaw=syaw;
 if(state.hall||state.list){out.busy=true;out.flag=state.hall?'hall':'list';out.label=state.hall?'Looking at high scores':'Choosing a game';
  for(let i=0;i<cabinetAreas.length;i++){const a=cabinetAreas[i],dx=out.x-a.standX!,dz=out.z-a.standZ!,d=Math.hypot(dx,dz);if(d<ON_CABINET+.25){const k=(ON_CABINET+.25)/Math.max(d,1e-3);out.x=a.standX!+(d>1e-3?dx:0)*k;out.z=a.standZ!+(d>1e-3?dz:ON_CABINET+.25);}}
  return out;}
 out.busy=false;out.flag='';out.label='';return out;
}
/** Receiver side: the line for a friend busy in the Arcade at room-local x/z (station lookup, design §2.2). Never allocates. */
export function arcadeBusyLabel(x:number,z:number):string{
 for(let i=0;i<cabinetAreas.length;i++){const a=cabinetAreas[i];if(Math.hypot(x-a.standX!,z-a.standZ!)<=ON_CABINET)return ARCADE_GAME_LABEL[a.id as ArcadeCabinetId];}
 return 'Looking at high scores';
}
/** Receiver side: the cabinet a busy friend is playing (force field centre), or null. */
export function arcadeBusyCabinet(x:number,z:number):ArcadeCabinetId|null{for(let i=0;i<cabinetAreas.length;i++){const a=cabinetAreas[i];if(Math.hypot(x-a.standX!,z-a.standZ!)<=ON_CABINET)return a.id as ArcadeCabinetId;}return null;}
/** Nearest area within the station radius (walking friends: optional "At the claw machine" lines). */
export function arcadeAreaAt(x:number,z:number):RoomArea|null{let best:RoomArea|null=null,bd=ARCADE_ROOM.stationRadius;for(let i=0;i<ARCADE_ROOM.areas.length;i++){const a=ARCADE_ROOM.areas[i],d=Math.hypot(x-a.x,z-a.z)-a.r;if(d<bd){bd=d;best=a;}}return best;}

/** Clamp a friend's interpolated room-local pose to the hub floor (the local player's clamp). */
export function clampArcade(p:{x:number;z:number}):typeof p{const b=ARCADE_ROOM.bounds;p.x=p.x<b.minX?b.minX:p.x>b.maxX?b.maxX:p.x;p.z=p.z<b.minZ?b.minZ:p.z>b.maxZ?b.maxZ:p.z;return p;}

/** Spawn when several people enter at once: the first slot around the door not taken by a friend (0.9 m). `friends` is a flat
 *  [x0,z0,x1,z1,...] of same-room friends' current room-local positions; `count` how many pairs to read. Writes into `out`. */
export function pickArcadeSpawn(friends:ArrayLike<number>,count:number,out:RoomPoint):RoomPoint{
 const slots=ARCADE_ROOM.spawnSlots;
 for(let s=0;s<slots.length;s++){let free=true;for(let f=0;f<count;f++)if(Math.hypot(friends[f*2]-slots[s].x,friends[f*2+1]-slots[s].z)<.9){free=false;break;}if(free){out.x=slots[s].x;out.z=slots[s].z;return out;}}
 // Every slot busy: stagger behind the last row (still inside bounds and off the exit trigger).
 out.x=((count%5)-2)*.95;out.z=8.3;return out;
}
/** Walk-in for a friend who just arrived (first same-room pose): from the door to their first pose over `seconds`. The layer can use it
 *  instead of the plain Warp fade. t in seconds since arrival; writes into `out`; returns false once finished. */
export function arcadeWalkIn(toX:number,toZ:number,t:number,out:RoomPoint&{yaw:number},seconds=.9):boolean{
 const d=ARCADE_ROOM.door,p=Math.min(1,Math.max(0,t/seconds)),e=p*p*(3-2*p),sz=d.z-.4;
 out.x=d.x+(toX-d.x)*e;out.z=sz+(toZ-sz)*e;out.yaw=Math.atan2(toX-d.x,toZ-sz);return p<1;
}
/** Island door hint target (lib/town/arcadeDoorHint.ts uses it): which NPCs a friend replaces is the crowd's job. */
export function arcadeCrowdBase(phone:boolean){return phone?ARCADE_ROOM.caps.npcBasePhone:ARCADE_ROOM.caps.npcBaseDesktop;}
/** NPC count while `friendsShown` friends are drawn (design §4: max(0, base - friendsShown)). */
export function arcadeCrowdCount(phone:boolean,friendsShown:number){return Math.max(0,arcadeCrowdBase(phone)-Math.max(0,friendsShown|0));}
