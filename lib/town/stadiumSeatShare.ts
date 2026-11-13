// West Stadium, phase 5 (Nov 12 2026, docs/stadium/PLAN.md): seats other players sit in. Pure (no three.js).
// The island's party runtime (townBridge.ts) runs every sampled friend through seatFriend(): a pose that says "seated" on the wire
// (multiplayer/protocol/seat.ts) is checked against the seat grid (it must sit on a real seat), snapped exactly onto it (x, row
// height, z, facing the pitch) and its seat marked taken. nearestSeat(..., remoteSeatsTaken()) then never offers that seat, so two
// players never snap into the same one; a local crowd (phase 3b) should leave remoteSeatsTaken() empty too.
// Heat: one nearestSeat() (a few dozen comparisons) per friend only when their seated spot changes; otherwise a Set add per frame.
import {nearestSeat,type Seat} from './stadiumSeats';

/** How far (m) a seated pose may sit from a seat's centre (the wire keeps decimetres). */
export const SEAT_MATCH_M=.35;
const taken=new Set<string>();
type Memo={x:number;y:number;z:number;seat:Seat|null};
const memo=new Map<number,Memo>();

/** Seat ids other players sit in right now (read-only; refilled every frame the party samples). */
export function remoteSeatsTaken():ReadonlySet<string>{return taken;}
/** Start of a party sample frame: forget last frame's seats (friends who left or stood up). */
export function beginSeatFrame(){taken.clear();}
/** The party ended / the runtime is disposed. */
export function clearRemoteSeats(){taken.clear();memo.clear();}
/** The seat at a seated pose's spot, or null (not on a seat: drawn as a plain idle friend). */
export function seatAt(x:number,y:number,z:number):Seat|null{return nearestSeat(x,z,y,undefined,SEAT_MATCH_M);}
/** One sampled friend (mutates p): a seated pose on a real seat snaps onto it and takes it; one off any seat stops being seated. */
export function seatFriend(id:number,p:{x:number;y:number;z:number;yaw:number;seated?:boolean}):Seat|null{
 if(!p.seated)return null;
 let m=memo.get(id);
 if(!m){m={x:NaN,y:NaN,z:NaN,seat:null};memo.set(id,m);}
 if(m.x!==p.x||m.y!==p.y||m.z!==p.z){m.x=p.x;m.y=p.y;m.z=p.z;m.seat=seatAt(p.x,p.y,p.z);}
 const s=m.seat;
 if(!s||taken.has(s.id)){p.seated=false;return null;}// an older client slowing to a stop, or a seat already shown taken this frame
 taken.add(s.id);p.x=s.x;p.y=s.y;p.z=s.z;p.yaw=s.yaw;
 return s;
}
