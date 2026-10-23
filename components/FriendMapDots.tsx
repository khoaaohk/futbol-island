'use client';
// Friends on the map (Oct 23 2026, owner: "on the map, can we show where friends are?"): one dot per party friend in their party
// colour (the ring / name tag colour) with their first initial, drawn above the map's marks and below the "You" marker.
// Heat: no protocol change and no new messages. Positions come from the party store's last island spots (store.ts spot(), mutated in
// place as poses arrive; the relay's 1 Hz beacon keeps far friends fresh). Nothing runs while the dots are not live (map closed /
// minimap collapsed / no party): when live, a pose, roster or Hide change only arms ONE timer, and the dots re-render at most every
// `everyMs` and only if a friend appeared, left, changed state or moved `minMove` m. No frame loop, no per-frame allocation.
import {memo,useEffect,useState} from 'react';
import {multiplayerEnabled} from '@/lib/multiplayer/config';
import {onPoses,partyStore} from '@/lib/multiplayer';
import {hiddenFriends,onFriendFilters} from '@/lib/multiplayer/roomParty';
import {roomText} from '@/lib/multiplayer/presence';
import {FLIGHT_BOUNDS} from '@/lib/town/simulation';
import {friendDots,friendDotsChanged,friendDotText,type FriendDot,type FriendDoor} from '@/lib/town/friendMarks';
import {KONBINI_DOOR_HINTS} from '@/lib/konbini/konbiniDoors';
import {MUSEUM_DOOR_HINT} from '@/lib/museum/museumDoors';
import {SHOP_DOOR_HINT} from '@/lib/town/shopDoorHint';
import {ARCADE_DOOR_HINT} from '@/lib/town/arcadeDoorHint';

/** The island doors of the rooms (Town's ROOM_DOOR_HINTS): a friend in a room is drawn at its building's door. */
const DOORS:FriendDoor[]=[...KONBINI_DOOR_HINTS,MUSEUM_DOOR_HINT,SHOP_DOOR_HINT,ARCADE_DOOR_HINT].map(d=>({room:d.room,x:d.x,z:d.z}));
const NONE:FriendDot[]=[];
const partyLive=()=>{const s=partyStore.get().status;return s==='live'||s==='reconnecting';};
function readDots():FriendDot[]{if(!partyLive())return NONE;const s=partyStore.get();return friendDots(s.members,s.you,partyStore.spot,hiddenFriends(),DOORS,FLIGHT_BOUNDS);}

/** The party's dots while `live`; [] (and no listeners at all) otherwise or with multiplayer off. */
export function useFriendDots(live:boolean,minMove:number,everyMs:number):FriendDot[]{
 const [dots,setDots]=useState<FriendDot[]>(NONE);
 useEffect(()=>{
  if(!live||!multiplayerEnabled()){setDots(NONE);return;}
  let timer:ReturnType<typeof setTimeout>|undefined,shown=NONE;
  const flush=()=>{timer=undefined;const next=readDots();if(friendDotsChanged(shown,next,minMove)){shown=next;setDots(next);}};
  const kick=()=>{if(timer===undefined)timer=setTimeout(flush,everyMs);};
  flush();
  const offStore=partyStore.subscribe(kick),offPoses=onPoses(kick),offFilters=onFriendFilters(kick);
  return()=>{clearTimeout(timer);offStore();offPoses();offFilters();};
 },[live,minMove,everyMs]);
 return dots;
}

/** True while a party is live with at least one other member: the travel map's key then lists "Friends". */
export function usePartyHasFriends(live:boolean):boolean{
 const [has,setHas]=useState(false);
 useEffect(()=>{if(!live||!multiplayerEnabled()){setHas(false);return;}
  const read=()=>{const s=partyStore.get();setHas(partyLive()&&s.members.some(m=>m.id!==s.you));};read();return partyStore.subscribe(read);},[live]);
 return has;
}

type Props={mode:'full'|'mini';live:boolean;
 /** Full map: a dot was tapped / focused / hovered (el = the dot), or the pointer left it (el = null). */
 onTip?:(dot:FriendDot,text:string,el:Element|null)=>void};
function FriendMapDots({mode,live,onTip}:Props){
 const full=mode==='full';
 // Full map (only while open): ~3 Hz, half-metre steps. Minimap: 2 Hz at most, and only for a step of 1 m or more.
 const dots=useFriendDots(live,full?.5:1,full?300:500);
 if(!dots.length)return null;
 const r=full?8.5:5,k=r/7.5; // full map: just under You (r 9 + its halo); minimap: about a V / E mark
 return <g className="map-friend-dots" data-friend-dots={mode}>{dots.map(d=>{const text=friendDotText(d,d.indoors&&d.room>=0?roomText(d.room).replace(/^In /,'in '):undefined);
  const tap=full&&onTip?{role:'button',tabIndex:0,'aria-label':`${d.name}: ${text}`,'data-legend-tip':'friend',style:{cursor:'pointer',outline:'none'/* the name bubble is the focus cue (a g's outline is a square) */},
   onClick:(e:React.MouseEvent<SVGGElement>)=>{e.stopPropagation();onTip(d,text,e.currentTarget);},
   onFocus:(e:React.FocusEvent<SVGGElement>)=>onTip(d,text,e.currentTarget),
   onPointerEnter:(e:React.PointerEvent<SVGGElement>)=>{if(e.pointerType==='mouse')onTip(d,text,e.currentTarget);},
   onPointerLeave:(e:React.PointerEvent<SVGGElement>)=>{if(e.pointerType==='mouse'&&document.activeElement!==e.currentTarget)onTip(d,text,null);},
   onKeyDown:(e:React.KeyboardEvent<SVGGElement>)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onTip(d,text,e.currentTarget);}}}:{pointerEvents:'none' as const};
  return <g key={d.id} data-friend-dot={d.id} data-friend-presence={d.presence} transform={`translate(${Math.round(d.x*10)/10} ${Math.round(d.z*10)/10})`} opacity={d.dim?.5:undefined} {...tap}>
   {full&&<circle r={r*1.9} fill="transparent"/>/* a finger-sized hit area */}
   <circle r={r+1.3*k} fill="#294f43"/>
   <circle r={r} fill={d.hex} stroke="#fff7db" strokeWidth={1.8*k}/>
   <text y={4.4*k} textAnchor="middle" fill="#ffffff" stroke="#294f43" strokeWidth={2.2*k} paintOrder="stroke" fontSize={12*k} fontWeight="900" style={{fontFamily:'Arial,Helvetica,sans-serif'}}>{d.initial}</text>
   {d.indoors&&<g data-friend-door="" transform={`translate(${r*.8} ${r*.55})`}><rect x={-3*k} y={-4*k} width={6*k} height={8*k} rx={1.2*k} fill="#8b5a3c" stroke="#fff7db" strokeWidth={.9*k}/><circle cx={1.4*k} cy={.4*k} r={.7*k} fill="#f4cc7c"/></g>}
  </g>;})}</g>;
}
export default memo(FriendMapDots);
