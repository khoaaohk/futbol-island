// Island-side door hint for the Kit Shop (owner decision, docs/multiplayer-rooms-design.md §6 Q1; Phase 4): island friends see
// "2 in the Kit Shop" over the shop's double door while party friends are inside. Same mechanism as the Konbini hints
// (lib/konbini/konbiniDoors.ts KONBINI_DOOR_HINTS): Town passes it to createPartyRuntime's `doors`, which counts roster members
// with room === RoomCode.Shop (Hide applies) and redraws one sprite only when that count changes (never per frame).
import {RoomCode} from '../../multiplayer/protocol/rooms';
import {SHOP_DOOR,SHOP_CANOPY} from '../shop/shopDoors';

/** Over the entrance canopy (y 5.2), on the shopfront above the doors: clear of the DOM Enter prompt at the door. */
export const SHOP_DOOR_HINT:{room:number;x:number;y:number;z:number}={room:RoomCode.Shop,x:SHOP_DOOR.x,y:SHOP_CANOPY.y+1.4,z:SHOP_DOOR.front+.3};
// The words come from townBridge's doorHintText(n, RoomCode.Shop) = "2 in the Kit Shop" (roomText; the island bundle never loads the shop).
