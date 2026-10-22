// Seam between the Arcade hub and the multiplayer room layer (docs/multiplayer-rooms-design.md Phase 3, "Arcade prep status").
// The hub registers itself here (arcadeRoomScene.ts) and the page reports its busy flags (ArcadeRoom.tsx). Until a layer attaches
// every call is a no-op that returns false: no behaviour change, no allocation, no timers. Kept free of three.js imports so the
// pure tests can load it; the host passes its own objects through as `unknown`-typed handles the layer casts.
import type {ArcadeCabinetId} from './arcadeCatalog';

export type ArcadeHubPose={x:number;z:number;yaw:number;moving:boolean;speed:number};
export interface ArcadeRoomHost{
 /** THREE.Scene / OrthographicCamera / the local rig's root (THREE.Object3D): the layer adds its avatar batch to `scene`. */
 readonly scene:unknown;readonly camera:unknown;readonly playerRoot:unknown;
 /** Room-local player pose, written into `out` (call every frame / beat without allocating). */
 pose(out:ArcadeHubPose):ArcadeHubPose;
 /** Same-room friend pose changed: keep the loop at the remote cadence (20 fps phone / 30 desktop) for `ms`, starting it if stopped. */
 wakeRemote(ms?:number):void;
 /** Party friends drawn in the hub: that many crowd visitors walk out (design: friends replace NPCs). */
 setFriendSlots(n:number):void;
 readonly covered:boolean;readonly sleeping:boolean;readonly mobile:boolean;
 readonly bounds:{readonly minX:number;readonly maxX:number;readonly minZ:number;readonly maxZ:number};
}
export interface ArcadeRoomLayer{
 /** A hub mounted (host) or was disposed (null: a game started, the page is leaving). */
 attach(host:ArcadeRoomHost|null):void;
 /** Called once per rendered hub frame before render. Return true while friends are still moving / fading (keeps remote cadence). */
 frame(dt:number,nowMs:number):boolean;
 /** Busy flags of the page changed (also fires while no hub exists, e.g. during a game). */
 busy?(state:Readonly<ArcadeBusyFlags>):void;
}
export type ArcadeBusyFlags={game:ArcadeCabinetId|null;list:boolean;hall:boolean};

let host:ArcadeRoomHost|null=null,layer:ArcadeRoomLayer|null=null;
const busyFlags:ArcadeBusyFlags={game:null,list:false,hall:false};
// Last hub pose survives the hub's disposal (a game replaces the room): the layer's beat sends Busy from here.
const lastPose:ArcadeHubPose={x:0,z:10.3,yaw:Math.PI,moving:false,speed:0};let hasLastPose=false;

/** Hub side: called from createArcadeRoomScene. Returns the unregister function (call it in dispose). */
export function registerArcadeHost(h:ArcadeRoomHost):()=>void{
 host=h;hasLastPose=false;layer?.attach(h);
 return()=>{if(host!==h)return;h.pose(lastPose);hasLastPose=true;host=null;layer?.attach(null);};
}
/** Hub side, per rendered frame: no-op (false) without a layer. */
export function arcadeLayerFrame(dt:number,nowMs:number):boolean{return layer!==null&&layer.frame(dt,nowMs);}
/** Page side: ArcadeRoom.tsx reports game / list / hall. */
export function setArcadeBusy(game:ArcadeCabinetId|null,list:boolean,hall:boolean){
 if(busyFlags.game===game&&busyFlags.list===list&&busyFlags.hall===hall)return;
 busyFlags.game=game;busyFlags.list=list;busyFlags.hall=hall;layer?.busy?.(busyFlags);
}

/** Layer side (the integrator): attach once per page; returns detach. */
export function attachArcadeLayer(l:ArcadeRoomLayer):()=>void{
 layer=l;l.attach(host);l.busy?.(busyFlags);
 return()=>{if(layer!==l)return;layer=null;host?.setFriendSlots(0);};
}
export const arcadeRoomHooks={
 get host(){return host;},get busy():Readonly<ArcadeBusyFlags>{return busyFlags;},get attached(){return layer!==null;},
 /** Live hub pose, or the last one before the hub was disposed (null when the page opened straight into a game). */
 pose(out:ArcadeHubPose):ArcadeHubPose|null{if(host)return host.pose(out);if(!hasLastPose)return null;out.x=lastPose.x;out.z=lastPose.z;out.yaw=lastPose.yaw;out.moving=false;out.speed=0;return out;},
 wake(ms?:number){host?.wakeRemote(ms);},
 setFriendSlots(n:number){host?.setFriendSlots(n);},
};
/** Tests only. */
export function resetArcadeRoomHooks(){host=null;layer=null;hasLastPose=false;busyFlags.game=null;busyFlags.list=busyFlags.hall=false;}
