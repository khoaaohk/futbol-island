/**
 * Island Line station life (train Phase 4, Nov 23 2026): the station islanders (lib/town/stationNpcs.ts) react to the trains.
 *  - A train pulling in: everyone on that platform turns to face it for a few seconds (islandNpcs.reactToTruck, the same "look at
 *    that" the townsfolk give a passing truck).
 *  - The BOARDERS step onto a train once its doors are open (hidden: islandNpcs.setAway) and step off a later train at the same
 *    platform. Local only (no presence, nothing sent), never while you are talking to them or standing next to them.
 * Cost: one pass over the 3 trains a frame (an integer compare each); work only on an arrival. No allocation per frame.
 */
import {TRAIN_COUNT,TRAIN_STOPS,DOOR_DELAY,DOOR_MOVE,type TrainState} from './trainSchedule';
import {trackAt} from './trainTrack';
import {STATION_NPCS,STATION_BOARDERS} from './stationNpcs';

type Npcs={reactToTruck(id:string,x:number,z:number):void;setAway(id:string,on:boolean):void;isAway(id:string):boolean};
/** Arrivals are only acted on within REACT_RANGE m of the player (beyond the NPC draw distance nothing shows anyway). */
export const REACT_RANGE=120;
/** A boarder steps on (or off) this long after the train stops: the doors are fully open. */
export const BOARD_AFTER=DOOR_DELAY+DOOR_MOVE+.4;
const byStation=new Map<string,{id:string;x:number;z:number}[]>();
for(const n of STATION_NPCS){const l=byStation.get(n.station)??[];l.push({id:n.id,x:n.x,z:n.z});byStation.set(n.station,l);}
export function createStationLife(npcs:Npcs){
 const prevAt=new Int8Array(TRAIN_COUNT).fill(-1),pt={x:0,z:0,tx:0,tz:0};
 const pending=STATION_BOARDERS.map(b=>({...b,due:-1}));
 return {
  /** states: the trains this frame; now: seconds (performance clock); talking: the NPC in conversation (or hovered). */
  update(states:readonly TrainState[],now:number,player:{x:number;z:number},talking:string|null){
   for(let i=0;i<TRAIN_COUNT&&i<states.length;i++){const at=states[i].at;if(at===prevAt[i])continue;prevAt[i]=at;if(at<0)continue;
    const station=TRAIN_STOPS[at]?.station;if(!station)continue;const list=byStation.get(station.id);if(!list)continue;
    if(Math.hypot(list[0].x-player.x,list[0].z-player.z)>REACT_RANGE)continue;
    trackAt(states[i].s-12,pt);for(const n of list)if(!npcs.isAway(n.id))npcs.reactToTruck(n.id,pt.x,pt.z);
    for(const b of pending)if(b.station===station.id&&b.due<0)b.due=now+BOARD_AFTER;}
   for(const b of pending){if(b.due<0||now<b.due)continue;b.due=-1;
    const n=STATION_NPCS.find(x=>x.id===b.id)!;if(talking===b.id||Math.hypot(n.x-player.x,n.z-player.z)<4)continue;// never vanish mid-chat or under your nose
    npcs.setAway(b.id,!npcs.isAway(b.id));}
  },
 };
}
