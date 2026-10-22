import {SHOP_ROOM,shopBusyFlag,shopBusyFlags,shopBusyText,shopStationAt,clampToShop,pickShopSpawn,shopCrowdCount,type ShopBusyFlags,type Spot} from './shop';

/**
 * The Kit Shop page's side of the room party layer (docs/multiplayer-rooms-design.md Phase 4; the Museum's museumHooks.ts pattern).
 *
 * lib/shop/shopScene.ts registers a source (its scene, camera, a pose reader, wake / wakeRemote, arrive, the local emote and the
 * shopper swap) and calls `frame()` in its tick before rendering, `pushOut()` in its collision, `meRing` for its foot shadow;
 * components/shop/ShopRoom.tsx writes its busy flags with `setBusy()` and hands `hostRef` to useRoomParty (the shared hook), which
 * creates the layer and attaches it here through `setFriendLayer`. Until a layer attaches every entry is a no-op: `frame()` returns
 * false (the shop sleeps exactly as before), `pushOut()` moves nothing, nothing allocates, nothing is sent.
 *
 * Typed without three.js (handles are `unknown`) so tests/mp-rooms-shop.cjs runs it in plain node.
 */
export interface ShopLocalPose{x:number;z:number;facing:number;speed:number;eating:boolean;zoomed:boolean}
export interface ShopHookSource{
 scene:unknown;camera:unknown;phone:boolean;reduced:boolean;
 /** Write the local player's room-local pose into `out` (no allocation). */
 readPose(out:ShopLocalPose):void;
 /** A same-room friend moved: frames without the local settle, at the remote rate (20 fps). No-op while covered / hidden. */
 wakeRemote():void;
 /** Re-aim the local walk-in (only while the arrival walk is still the target). */
 arrive(x:number,z:number):void;
 /** Play a wire emote on your own rig (no camera change); `face` turns you toward a friend (high five). */
 emote(kind:number,face?:{x:number;z:number}|null):void;
 /** n party friends are drawn here: that many shoppers step out (the rig count never rises). */
 setFriendSlots(n:number):void;
 sleeping():boolean;
}
export interface ShopRoomLayer{
 update(dt:number,nowMs:number,camera:never,hideFriends?:boolean):boolean;
 pushOut(p:{x:number;z:number},r:number):boolean;
 nearestFriend(x:number,z:number,maxM:number):{x:number;z:number}|null;
 friendsHere?():Iterable<{x:number;z:number}>;
 readonly meRing:boolean;readonly shown?:number;
 debugFriends?():unknown[];
 dispose?():void;
}
/** How long after the scene registers a friend already standing inside may still re-aim your walk-in (s). */
export const ARRIVE_WINDOW_MS=3000;

let source:ShopHookSource|null=null,layer:ShopRoomLayer|null=null,registeredAt=0,arrivalPending=false,slots=-1;
const busy:ShopBusyFlags=shopBusyFlags();
const pose:ShopLocalPose={x:0,z:0,facing:0,speed:0,eating:false,zoomed:false};
const spot:Spot={x:0,z:0,yaw:0};
const here:{x:number;z:number}[]=[];
const clock=()=>(typeof performance!=='undefined'?performance.now():Date.now());

/** The RoomPartyHost (components/party/useRoomParty.ts) the shared hook drives: a stable object forwarding to the scene. */
const host={
 get threeScene(){return source?.scene as never;},
 get phone(){return source?.phone??false;},
 get reduced(){return source?.reduced??false;},
 setFriendLayer(l:ShopRoomLayer|null){if(l)shopRoomHooks.attach(l);else if(layer)shopRoomHooks.detach(layer);},
 wakeRemote(){source?.wakeRemote();},
 /** A busy friend's kind from their spot: a STATION code (the shared hook passes numbers through). */
 stationAt:(x:number,z:number):number=>shopStationAt(x,z),
 localPose():ShopLocalPose{if(source)source.readPose(pose);pose.eating=false;pose.zoomed=false;return pose;},
 emote(kind:number,face?:{x:number;z:number}|null){source?.emote(kind,face);},
};

export const shopRoomHooks={
 descriptor:SHOP_ROOM,
 /** Scene side (shopScene.ts). A second register replaces the first (React strict-mode remounts). */
 register(s:ShopHookSource){source=s;registeredAt=clock();arrivalPending=true;slots=-1;},
 unregister(s:ShopHookSource){if(source===s){source=null;arrivalPending=false;}},
 /** Layer side. Attaching wakes the loop once so friends draw on the next frame. */
 attach(l:ShopRoomLayer){layer=l;source?.wakeRemote();},
 detach(l:ShopRoomLayer){if(layer!==l)return;layer=null;if(slots>0)source?.setFriendSlots(0);slots=-1;},
 get attached(){return layer!==null;},
 get registered(){return source!==null;},
 /** useRoomParty(shopRoomHooks.hostRef, RoomCode.Shop, ready, covered): null until the scene registers. */
 hostRef:{get current(){return source?host:null;}},
 /** Called by the shop tick before render. No layer: false (unchanged sleep rule). */
 frame(dt:number,nowMs:number,camera:unknown):boolean{
  if(!layer)return false;
  const keep=layer.update(dt,nowMs,camera as never);
  const shown=layer.shown??0;
  if(shown!==slots){slots=shown;source?.setFriendSlots(shown);}
  if(arrivalPending){
   if(nowMs-registeredAt>ARRIVE_WINDOW_MS)arrivalPending=false;
   else if(layer.friendsHere){here.length=0;for(const f of layer.friendsHere())here.push(f);
    if(here.length){arrivalPending=false;pickShopSpawn(spot,here,here.length);source?.arrive(spot.x,spot.z);}}
  }
  return keep;
 },
 /** The raw layer update (heat measurement only: `hide` draws without friends). No layer: false. */
 update(dt:number,nowMs:number,camera:unknown,hide=false):boolean{return layer!==null&&layer.update(dt,nowMs,camera as never,hide);},
 /** Busy friends' force fields as obstacles (no layer: nothing moves). */
 pushOut(p:{x:number;z:number},r:number):boolean{return layer!==null&&layer.pushOut(p,r);},
 /** The party draws your colour ring (the scene's own foot shadow then hides: one ring only). */
 get meRing(){return layer!==null&&layer.meRing;},
 get shown(){return layer?.shown??0;},
 debugFriends(){return layer?.debugFriends?.()??[];},
 /** ShopRoom.tsx's flags (studio, myKit, talking?.id). */
 setBusy(studio:string|null,myKit:boolean,talking:string|null){busy.studio=studio;busy.myKit=myKit;busy.talking=talking;},
 get busy():Readonly<ShopBusyFlags>{return busy;},
 get busyFlag(){return shopBusyFlag(busy);},
 get busyText(){return shopBusyText(busy);},
 /** The layer's network wake (design 3.2). Battery saver: the layer never calls it. */
 wake(){source?.wakeRemote();},
 sleeping(){return source?source.sleeping():true;},
 arrive(x:number,z:number){source?.arrive(x,z);},
 stationAt:shopStationAt,
 clamp:clampToShop,
 crowd:shopCrowdCount,
};
export type ShopRoomHooks=typeof shopRoomHooks;
