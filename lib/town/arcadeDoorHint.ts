// Island-side door hint for the Arcade (owner decision, docs/multiplayer-rooms-design.md §6 Q1): island friends see
// "2 in the Arcade" above the Arcade door. Pure and allocation-free: the island party runtime keeps one ArcadeDoorHint and calls
// arcadeDoorHint() when the roster changes (store flips), never per frame. The label text is a fixed template + a number (no free text).
import {ARCADE_DOOR} from './venues';
import {ARCADE_ROOM_CODE} from '../multiplayer/rooms/arcade';

export type ArcadeDoorHint={visible:boolean;count:number;text:string;x:number;y:number;z:number};
/** Hint anchor: above the island's Arcade door (lib/town/venues.ts ARCADE_DOOR), sign height. */
export const ARCADE_DOOR_HINT_Y=3.4;
export function createArcadeDoorHint():ArcadeDoorHint{return{visible:false,count:0,text:'',x:ARCADE_DOOR.x,y:ARCADE_DOOR_HINT_Y,z:ARCADE_DOOR.z};}
export function arcadeDoorHintText(count:number){return count>0?`${count} in the Arcade`:'';}
/** `rooms[i]` = roomOf(friend i's last pose) (RoomCode, -1 on the island). A LEGACY door pose (old client: Busy + Indoors + Activity.Arcade
 *  at the door) also means "in the Arcade": the caller passes ARCADE_ROOM_CODE for it (activityOf(...) === Activity.Arcade, which is 5 too).
 *  Hidden friends (Hide in the party list) should be left out by the caller. Writes into `out`. */
export function arcadeDoorHint(rooms:ArrayLike<number>,count:number,out:ArcadeDoorHint):ArcadeDoorHint{
 let n=0;for(let i=0;i<count&&i<rooms.length;i++)if(rooms[i]===ARCADE_ROOM_CODE)n++;
 if(n!==out.count||out.text===''&&n>0){out.count=n;out.text=arcadeDoorHintText(n);}
 out.visible=n>0;return out;
}
