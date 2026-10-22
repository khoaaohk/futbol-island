import {MUSEUM_ROOM,museumBusyFlag,museumBusyFlags,museumBusyText,clampToMuseum,type MuseumBusyFlags} from './museum';

/**
 * The museum page's side of the room party layer (docs/multiplayer-rooms-design.md Phase 2, "Museum prep status").
 *
 * museumScene.ts registers a source (its scene, camera, local rig, a pose reader, wake, sleeping, arrive) and calls `frame()` in
 * its tick before rendering; MuseumRoom.tsx writes its busy flags with `setBusy()`. Until a layer `attach()`es, every entry is a
 * no-op: `frame()` returns false (the loop sleeps exactly as before), nothing allocates, nothing is sent.
 *
 * Typed without three.js (generic `unknown` handles), so tests/mp-rooms-museum.cjs runs it in plain node.
 */
export interface RoomLocalPose{x:number;y:number;z:number;yaw:number;moving:boolean;busy:boolean;
 /** The local busy line ('' when walking): for the chip / debugging only, never on the wire. */
 activity:string}
export interface MuseumHookSource{
 scene:unknown;camera:unknown;player:unknown;
 /** Write the local player's room-local position / facing / moving into `out`. Called per beat or per frame: must not allocate. */
 readPose(out:RoomLocalPose):void;
 /** The museum loop's wake() (no-op while covered, hidden or disposed). */
 wake():void;
 /** true while the loop sleeps (no rAF pending). */
 sleeping():boolean;
 /** Re-aim the local walk-in (only while the arrival walk is still the target): pickMuseumSpawn's slot. */
 arrive(x:number,z:number):void;
}
export interface MuseumRoomLayer{
 /** Per rendered frame, before render. true = friends still settling: keep frames. */
 update(dt:number,nowMs:number,camera:unknown):boolean;
}
export const roomLocalPose=():RoomLocalPose=>({x:0,y:0,z:0,yaw:0,moving:false,busy:false,activity:''});

let source:MuseumHookSource|null=null,layer:MuseumRoomLayer|null=null;
const busy:MuseumBusyFlags=museumBusyFlags();

export const museumRoomHooks={
 descriptor:MUSEUM_ROOM,
 /** Scene side (museumScene.ts). A second register replaces the first (React strict-mode remounts). */
 register(s:MuseumHookSource){source=s;},
 unregister(s:MuseumHookSource){if(source===s)source=null;},
 /** Layer side (useRoomParty / createRoomParty). Attaching wakes the loop once so friends draw on the next frame. */
 attach(l:MuseumRoomLayer){layer=l;source?.wake();},
 detach(l:MuseumRoomLayer){if(layer===l)layer=null;},
 get attached(){return layer!==null;},
 get registered(){return source!==null;},
 /** {scene, camera, player} for the layer (null before the scene exists). */
 context():MuseumHookSource|null{return source;},
 /** Called by the museum tick before render. No layer: false (unchanged sleep rule). */
 frame(dt:number,nowMs:number,camera:unknown):boolean{return layer!==null&&layer.update(dt,nowMs,camera);},
 /** The local pose + busy for fillRoomBody (null before the scene exists). Writes `out`. */
 pose(out:RoomLocalPose):RoomLocalPose|null{
  if(!source)return null;source.readPose(out);out.busy=museumBusyFlag(busy)!==null;out.activity=museumBusyText(busy);return out;},
 /** MuseumRoom.tsx's flags (guideOpen, !!cert, balls!==false, experience, zoom?.id). */
 setBusy(guideOpen:boolean,cert:boolean,balls:boolean,experience:string|null,zoom:string|null){
  busy.guideOpen=guideOpen;busy.cert=cert;busy.balls=balls;busy.experience=experience;busy.zoom=zoom;},
 get busy():Readonly<MuseumBusyFlags>{return busy;},
 /** The layer calls this when a same-room friend's pose changed (design 3.2). Battery saver: the layer does not call it. */
 wake(){source?.wake();},
 sleeping(){return source?source.sleeping():true;},
 arrive(x:number,z:number){source?.arrive(x,z);},
 /** Clamp a friend's room-local point inside the walkable L (writes `out`). */
 clamp:clampToMuseum,
};
export type MuseumRoomHooks=typeof museumRoomHooks;
