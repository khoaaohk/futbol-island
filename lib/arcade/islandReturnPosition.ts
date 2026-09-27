import { FLIGHT_BOUNDS } from '../town/simulation';
import { TRAVEL_MODES, type TravelMode } from '../town/travelModes';

export const ISLAND_RETURN_POSITION_KEY='fi2-arcade-departure-v1';
export type IslandReturnPosition={version:1;x:number;z:number;yaw:number;ride:TravelMode;flightHeight:number;camera?:{x:number;y:number;z:number}};
type SessionStore=Pick<Storage,'getItem'|'setItem'>;
const finite=(value:unknown):value is number=>typeof value==='number'&&Number.isFinite(value);
export function validIslandReturnPosition(value:unknown):value is IslandReturnPosition{
  if(!value||typeof value!=='object')return false;
  const p=value as IslandReturnPosition;
  if(p.version!==1||!finite(p.x)||!finite(p.z)||!finite(p.yaw)||!finite(p.flightHeight)||p.flightHeight<0||p.flightHeight>512)return false;
  if(p.x<FLIGHT_BOUNDS.minX||p.x>FLIGHT_BOUNDS.maxX||p.z<FLIGHT_BOUNDS.minZ||p.z>FLIGHT_BOUNDS.maxZ||!Object.hasOwn(TRAVEL_MODES,p.ride))return false;
  return !p.camera||(finite(p.camera.x)&&finite(p.camera.y)&&finite(p.camera.z)&&Math.abs(p.camera.x)<1000&&Math.abs(p.camera.z)<1000&&p.camera.y>=-100&&p.camera.y<1000);
}
/** Tab-local continuity across the deliberate island/arcade document boundary. */
export function readIslandReturnPosition(storage?:SessionStore):IslandReturnPosition|null{
  try{const value:unknown=JSON.parse((storage??window.sessionStorage).getItem(ISLAND_RETURN_POSITION_KEY)??'null');return validIslandReturnPosition(value)?value:null;}catch{return null;}
}
export function saveIslandReturnPosition(position:IslandReturnPosition,storage?:SessionStore){
  if(!validIslandReturnPosition(position))return;
  try{(storage??window.sessionStorage).setItem(ISLAND_RETURN_POSITION_KEY,JSON.stringify(position));}catch{/* Storage restrictions must never prevent leaving the island. */}
}
