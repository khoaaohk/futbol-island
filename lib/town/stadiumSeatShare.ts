// West Stadium, phase 5 (Nov 12 2026, docs/stadium/PLAN.md): seats other players sit in. Pure (no three.js).
// The island's party runtime (townBridge.ts) runs every sampled friend through seatFriend(): a pose that says "seated" on the wire
// (multiplayer/protocol/seat.ts) is checked against the seat grid (it must sit on a real seat), snapped exactly onto it (x, row
// height, z, facing the pitch) and its seat marked taken. nearestSeat(..., remoteSeatsTaken()) then never offers that seat, so two
// players never snap into the same one; the local crowd clears its fans round remoteSeatSpots() (QA Nov 13: fans were drawn inside a seated friend).
// Seat race (Nov 13 2026, owner): two players who tap the same seat at the same instant both got it. Each side now knows its own
// seat (setMySeat, from stadiumSit) and, when a friend's seated pose lands on MY seat within SEAT_CLAIM_MS of my sitting down, both
// screens apply the same rule with NO relay change: the LOWER member id keeps the seat. The loser's stadiumSit reads seatLost() and
// hops to the nearest free seat with a short toast; the winner draws the loser standing until their next pose moves them. A true race
// is shorter than one pose round trip, so both sides are inside the window and agree. Past the window I keep my seat (I was there
// first: the newcomer's screen showed it taken, so a late overlap only comes from a friend I could not see, who then yields by id).
// Heat: one nearestSeat() (a few dozen comparisons) per friend only when their seated spot changes; otherwise a Set add per frame.
import {nearestSeat,type Seat} from './stadiumSeats';

/** How far (m) a seated pose may sit from a seat's centre (the wire keeps decimetres). */
export const SEAT_MATCH_M=.35;
const taken=new Set<string>();
/** The seats in `taken` (the crowd clears its fans round them). */
const spots:Seat[]=[];
type Memo={x:number;y:number;z:number;seat:Seat|null};
const memo=new Map<number,Memo>();
type SeatPose={x:number;y:number;z:number;yaw:number;seated?:boolean};
/** Who holds each seat this frame (and their pose before the snap, to put a deposed holder back). Pooled: no allocation per frame. */
type Hold={id:number;p:SeatPose;x:number;y:number;z:number;yaw:number};
const holder=new Map<string,Hold>(),pool:Hold[]=[];let used=0;
/** How long (ms) after I sit a friend's seated pose on my seat counts as a race (tie-broken by member id). */
export const SEAT_CLAIM_MS=4000;
let mine:Seat|null=null,mineAt=NaN,me=-1,now=0,lostTo=-1;
/** My seat (stadiumSit, every movement tick: null while standing or rising). A new seat restarts the claim window. */
export function setMySeat(s:Seat|null){if((s?.id??null)!==(mine?.id??null)){mine=s;mineAt=NaN;lostTo=-1;}}
/** A friend won my seat (their member id) and I should move: returns it once, then -1. */
export function seatLost():number{const id=lostTo;lostTo=-1;return id;}
/** Who keeps a seat both claim (pure; both screens compute the same): the lower member id. */
export function seatWinner(a:number,b:number):number{return Math.min(a,b);}

/** Seat ids other players sit in right now (read-only; refilled every frame the party samples). */
export function remoteSeatsTaken():ReadonlySet<string>{return taken;}
/** Start of a party sample frame: forget last frame's seats (friends who left or stood up). */
export function beginSeatFrame(nowMs=0,you:number|null=null){taken.clear();holder.clear();used=0;spots.length=0;now=nowMs;me=you??-1;if(mine&&mineAt!==mineAt&&nowMs>0)mineAt=nowMs;}
/** The seats other players sit in right now (read-only; the crowd keeps its fans out of them). */
export function remoteSeatSpots():readonly Seat[]{return spots;}
/** The party ended / the runtime is disposed. */
export function clearRemoteSeats(){taken.clear();holder.clear();used=0;spots.length=0;memo.clear();lostTo=-1;me=-1;}
/** The seat at a seated pose's spot, or null (not on a seat: drawn as a plain idle friend). */
export function seatAt(x:number,y:number,z:number):Seat|null{return nearestSeat(x,z,y,undefined,SEAT_MATCH_M);}
/** One sampled friend (mutates p): a seated pose on a real seat snaps onto it and takes it; one off any seat stops being seated. */
export function seatFriend(id:number,p:SeatPose):Seat|null{
 if(!p.seated)return null;
 let m=memo.get(id);
 if(!m){m={x:NaN,y:NaN,z:NaN,seat:null};memo.set(id,m);}
 if(m.x!==p.x||m.y!==p.y||m.z!==p.z){m.x=p.x;m.y=p.y;m.z=p.z;m.seat=seatAt(p.x,p.y,p.z);}
 const s=m.seat;
 if(!s){p.seated=false;return null;}// an older client slowing to a stop
 if(mine&&s.id===mine.id&&me>=0&&id!==me){// the seat race: a friend in MY seat
  const race=mineAt===mineAt&&now-mineAt<=SEAT_CLAIM_MS;
  if(race&&seatWinner(id,me)===id){if(lostTo<0||id<lostTo)lostTo=id;}// they keep it: I move (stadiumSit), they are drawn seated
  else{p.seated=false;return null;}// I keep it: they are drawn standing until they move on
 }
 // QA Nov 14 2026 (round 4): 3+ claimants. "First sampled this frame keeps it" let a screen draw the lowest id standing for a round
 // trip when a higher id came first in its member order. The lowest id holds a seat on every screen: a lower newcomer deposes the
 // holder, who goes back to its own (unsnapped) spot, standing.
 const h=holder.get(s.id);
 if(h){
  if(h.id<id){p.seated=false;return null;}
  h.p.seated=false;h.p.x=h.x;h.p.y=h.y;h.p.z=h.z;h.p.yaw=h.yaw;
 }
 const e=h??(pool[used]??(pool[used]={id:0,p,x:0,y:0,z:0,yaw:0}));
 if(!h){used++;holder.set(s.id,e);taken.add(s.id);spots.push(s);}
 e.id=id;e.p=p;e.x=p.x;e.y=p.y;e.z=p.z;e.yaw=p.yaw;
 p.x=s.x;p.y=s.y;p.z=s.z;p.yaw=s.yaw;
 return s;
}
