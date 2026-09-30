import {CAY_KONBINI_DOOR,CAY_KONBINI} from '../town/coralCay';
import {saveIslandReturnPosition,readIslandReturnPosition,type IslandReturnPosition} from '../arcade/islandReturnPosition';
import type {TravelMode} from '../town/travelModes';

/**
 * The two enterable Konbinis and the island ↔ Konbini document boundary (like the Arcade: leaving the island unloads it
 * completely, and the island reloads at the saved departure). Pure except save/read, which use the Arcade's tab-local
 * departure record (lib/arcade/islandReturnPosition.ts, read-only use of Astra's module).
 *
 * Door anchors:
 *  - main: Island Square's Konbini (lib/town/world.ts hub block: building centre 46+130, −5−118, shifted by (−105, +65) →
 *    x 71, front z −53; its sliding doors are centred 0.55 m west of the building centre).
 *  - cay: the Coral Cay Konbini's exported door anchor (lib/town/coralCay.ts CAY_KONBINI_DOOR, owned by the Coral Cay agent).
 * Both fronts face +z (south), so "facing out" is yaw 0.
 */
export type KonbiniDoor='main'|'cay';
export const KONBINI_DOORS:Record<KonbiniDoor,{x:number;front:number;label:string}>={
 main:{x:71-.55,front:-53,label:'Island Square Konbini'},
 cay:{x:CAY_KONBINI_DOOR.x,front:CAY_KONBINI_DOOR.z,label:'Coral Cay Konbini'},
};
/** Building footprints (x/z centre, width, depth, roof height) for the shared building highlight and the from-the-air Enter,
 *  registered in Town.tsx like the Arcade/Coaches Centre: main from world.ts's hub block, cay from CAY_KONBINI. */
export const KONBINI_BUILDINGS:Record<KonbiniDoor,{x:number;z:number;w:number;d:number;h:number}>={
 main:{x:71,z:-58,w:10,d:10,h:4.72},
 cay:{x:CAY_KONBINI.x,z:CAY_KONBINI.front-CAY_KONBINI.d/2,w:CAY_KONBINI.w,d:CAY_KONBINI.d,h:4.52},
};
/** Where the player stands outside, on foot, after leaving: 2.4 m out from the glass, facing away from the doors. */
export const KONBINI_EXIT_OFFSET=2.4;
export function konbiniExitPoint(door:KonbiniDoor){const d=KONBINI_DOORS[door];return {x:d.x,z:d.front+KONBINI_EXIT_OFFSET,yaw:0};}
/** The Enter prompt zone: a doorway-wide strip up to ~4.5 m in front of the glass (the neighbouring vending machine at
 *  3.7 m east keeps its own Go prompt). */
export function konbiniDoorNear(door:KonbiniDoor,x:number,z:number){const d=KONBINI_DOORS[door];return Math.abs(x-d.x)<1.6&&z>d.front-.5&&z<d.front+4.5;}
export function nearestKonbiniDoor(x:number,z:number):KonbiniDoor|null{return (Object.keys(KONBINI_DOORS) as KonbiniDoor[]).find(d=>konbiniDoorNear(d,x,z))??null;}
export const parseKonbiniDoor=(search:string):KonbiniDoor=>new URLSearchParams(search).get('door')==='cay'?'cay':'main';
export const konbiniUrl=(door:KonbiniDoor)=>`/konbini?door=${door}`;
export const KONBINI_RETURN_URL='/?from=konbini';

/** Departure record for this door: outside, facing out, keeping the ride the player walked up with (never flight: the
 *  prompt only shows on the ground). The camera sits at the island's normal follow offset. */
export function konbiniDeparture(door:KonbiniDoor,ride:TravelMode='walk'):IslandReturnPosition{
 const p=konbiniExitPoint(door);
 return {version:1,x:p.x,z:p.z,yaw:p.yaw,ride:ride==='jetpack'?'walk':ride,flightHeight:0,camera:{x:p.x+18,y:23,z:p.z+30}};
}
export function saveKonbiniDeparture(door:KonbiniDoor,ride:TravelMode='walk'){saveIslandReturnPosition(konbiniDeparture(door,ride));}
/** On exit, re-save for this door (a direct /konbini visit has no departure); keep the saved ride when it was this door's. */
export function refreshKonbiniDeparture(door:KonbiniDoor){
 const saved=readIslandReturnPosition(),p=konbiniExitPoint(door);
 const ride=saved&&Math.hypot(saved.x-p.x,saved.z-p.z)<1?saved.ride:'walk';
 saveKonbiniDeparture(door,ride);
}

// ---- Entry/exit state machine (tests/konbini.cjs) -------------------------------------------------------------------------
export type KonbiniPhase={at:'outside';door:KonbiniDoor|null}|{at:'entering';door:KonbiniDoor}|{at:'inside';door:KonbiniDoor}|{at:'exiting';door:KonbiniDoor};
export type KonbiniEvent={type:'near';door:KonbiniDoor|null}|{type:'enter'}|{type:'loaded';door:KonbiniDoor}|{type:'exit'}|{type:'returned'};
/** outside(near door) → entering (doors slide, island saves its departure and unloads) → inside → exiting → outside at that door. */
export function stepKonbini(state:KonbiniPhase,event:KonbiniEvent):KonbiniPhase{
 switch(event.type){
  case 'near':return state.at==='outside'?{at:'outside',door:event.door}:state;
  case 'enter':return state.at==='outside'&&state.door?{at:'entering',door:state.door}:state;
  case 'loaded':return state.at==='entering'||state.at==='outside'?{at:'inside',door:event.door}:state;
  case 'exit':return state.at==='inside'?{at:'exiting',door:state.door}:state;
  case 'returned':return state.at==='exiting'?{at:'outside',door:state.door}:state;
 }
}
