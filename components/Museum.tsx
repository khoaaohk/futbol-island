'use client';
import MuseumDoorSlide from './MuseumDoorSlide';

/**
 * The History Museum's island side (Oct 3 2026). The museum became a walk-in building (`/museum`, components/MuseumRoom.tsx),
 * a document boundary like the Konbini and the Arcade. Every way in still sets Town's `museumOpen` (a tap on the building, the
 * door's Enter prompt, the from-the-air Enter, and ENDGAME_OPEN {target:'museum'} from the graduation ceremony, the Ferry or the
 * Coaches Board); Town then saves the departure at the museum door, quiets the island and navigates. This component only plays
 * the doors swinging open over the island while that happens (the Sep 30 dialog's content and unlock rules moved into the room
 * unchanged: lib/endgame/museum.ts).
 */
export default function Museum({open}:{open:boolean;onOpenChange?:(open:boolean)=>void}){
 return open?<MuseumDoorSlide mode="enter"/>:null;
}
