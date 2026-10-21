/**
 * Explore delight (Oct 21 2026; docs/swimming-research.md §12 "Explore delight"). User: "Explore: a whale-shadow surprise, wave and
 * high-five emotes for each zone's friend, a daily sparkle spot, and slowing the glide near finds." This file holds the pure rules of
 * the whale and the zone friends (the sparkle spot is diveSparkle.ts, the find slow-down diveSession.ts `findSlow`).
 *
 * Pure: no three.js, no DOM, no timers. Teaching (AGENTS.md): the friend's wave and high five are the football greeting (a high five
 * and a handshake are how players show respect: fair play); the whale's note is a teamwork line (whales call to each other across the
 * sea, like teammates calling for the ball). Calm by design: nothing chases, nothing is scary, nothing can be lost.
 */
import {DIVE_ROOM_R,DIVE_SURFACE_Y,diveFloor,type DiveSpot} from './diveSpots';
import {journeyPath,journeyPickups} from './diveJourney';
import {diveLayout,diveLayoutFree} from './diveLayout';

export type DiveFriendKind='crab'|'octopus'|'seahorse'|'ray'|'jelly'|'puffer'|'turtle';
/** Each zone's friend: its kind (the room's friend model), its name, how it waves back, and how high it floats over the sand (m). */
export type DiveFriend={kind:DiveFriendKind;name:string;wave:string;lift:number};
export const DIVE_FRIENDS:Readonly<Record<string,DiveFriend>>={
 'captains-cup':{kind:'crab',name:'Captain Crab',wave:'waves a claw',lift:.12},
 'pauls-grotto':{kind:'octopus',name:'Otto the octopus',wave:'raises a tentacle',lift:.35},
 'kelp-trawler':{kind:'seahorse',name:'Sunny the seahorse',wave:'nods hello',lift:1.1},
 'ray-meadow':{kind:'ray',name:'Rae the ray',wave:'flaps hello',lift:.7},
 'moon-arch':{kind:'jelly',name:'Luna the moon jelly',wave:'pulses hello',lift:1.4},
 'ball-crate':{kind:'puffer',name:'Puff the pufferfish',wave:'puffs up hello',lift:1},
 'turtle-pool':{kind:'turtle',name:'Shelly the turtle',wave:'waves a flipper',lift:.8},
};
/** Emotes: usable within `range` m of the friend, `cooldown` s apart; the gesture lasts `dur` s, the high five's hands meet at `meet`
 *  s; a heart per emote up to `hearts` per zone, and at the last heart a sticker line and `coins` (once ever per zone, Training meter). */
export const EMOTE={range:4,cooldown:2,dur:1.2,meet:.5,hearts:3,coins:1} as const;
export type DiveEmote='wave'|'five';
export const emoteReady=(dist:number,cd:number)=>dist<=EMOTE.range&&cd<=0;
/** A heart for an emote: the new count (capped) and whether this one completed the friendship (the reward, once). */
export function emoteHeart(have:number,out:{n:number;done:boolean}={n:0,done:false}){const h=Math.max(0,Math.min(EMOTE.hearts,have|0));out.n=Math.min(EMOTE.hearts,h+1);out.done=h<EMOTE.hearts&&out.n===EMOTE.hearts;return out;}
export const friendRunId=(spot:string)=>`dive:${spot}:friend`;
export const FRIEND_STICKER='Reef Pal';
export const emoteNote=(f:DiveFriend,kind:DiveEmote)=>kind==='wave'?`You waved: ${f.name} ${f.wave}!`:`High five with ${f.name}!`;
export const friendDoneNote=(f:DiveFriend)=>`Best friends with ${f.name}: ${FRIEND_STICKER} sticker! Players high-five to show respect: that is fair play.`;
export const friendFarNote=(f:DiveFriend)=>`Swim closer to ${f.name} to say hi.`;
/** The emote's envelope (0..1) at t s: up quickly, held, down at the end. */
export const emoteAmount=(t:number)=>t<0||t>EMOTE.dur?0:Math.min(1,t/.18,(EMOTE.dur-t)/.3);

/** Where the friend lives (room-local): beside the first leg of the reef journey (start -> first find), on the far side from that
 *  leg's pickups, clear of the buoy, the finds, the wreck, the lanes and the pitch (diveLayoutFree); a few steps along if not free. */
export function friendHome(spot:DiveSpot,out:{x:number;y:number;z:number}={x:0,y:0,z:0}){
 const f=DIVE_FRIENDS[spot.id],path=journeyPath(spot),L=diveLayout(spot),picks=journeyPickups(spot);
 const free=(x:number,z:number)=>Math.hypot(x,z)<DIVE_ROOM_R-4&&diveLayoutFree(L,spot,x,z,.8,{lanes:false})&&picks.every(p=>Math.hypot(p.x-x,p.z-z)>1.6);
 let px=path[0].x,pz=path[0].z-5;
 search:for(let s=0;s+1<path.length;s++){const a=path[s],b=path[s+1],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz)||1,nx=-dz/len,nz=dx/len;
  for(const t of [.55,.45,.65,.35,.75])for(const side of [-1,1])for(const off of [2.4,3.2]){const x=a.x+dx*t+nx*side*off,z=a.z+dz*t+nz*side*off;if(free(x,z)){px=x;pz=z;break search;}}}
 out.x=px;out.z=pz;out.y=Math.min(DIVE_SURFACE_Y-.8,diveFloor(px,pz,spot.floor)+(f?.lift??.6));return out;
}

/** The whale's pass over the surface: 45-120 s after entering (`min` .. `max`), at most once a visit; once the zone's whale has been
 *  met (`seen`) only `repeat` of visits get one. `dur` s to cross `len` m of the ceiling; its note and the zone's 1 coin come once ever. */
export const WHALE={min:45,max:120,repeat:.4,dur:16,len:64,coins:1} as const;
/** When the whale comes this visit (s after entering), or -1: none. `a`, `b` are two random draws in [0, 1). */
export function whalePlan(a:number,b:number,seen:boolean){if(seen&&b>=WHALE.repeat)return -1;return WHALE.min+(WHALE.max-WHALE.min)*Math.max(0,Math.min(1,a));}
/** May the whale start now: its time has come, it has not passed this visit, and nothing else is going on (a pickup, an emote, a card). */
export const whaleGo=(t:number,at:number,done:boolean,busy:boolean)=>at>=0&&!done&&!busy&&t>=at;
/** Its place at u (0..1 along the pass through (cx, cz), heading yaw: forward (sin, cos)) and how dark its shadow is (0 at both ends). */
export function whalePose(u:number,cx:number,cz:number,yaw:number,out:{x:number;z:number;k:number}){
 const s=(Math.max(0,Math.min(1,u))-.5)*WHALE.len;out.x=cx+Math.sin(yaw)*s;out.z=cz+Math.cos(yaw)*s;const e=Math.sin(Math.PI*Math.max(0,Math.min(1,u)));out.k=e*e*(3-2*e);return out;}
export const whaleRunId=(spot:string)=>`dive:${spot}:whale`;
export const WHALE_NOTE='Whale friend! Whales call to each other across the sea, like teammates calling for the ball.';
