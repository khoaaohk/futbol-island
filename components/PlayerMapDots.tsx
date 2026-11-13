'use client';
// Other players on the travel map (Nov 13 2026; owner: "2 on now" but nobody near and no way to find them). One soft, unnamed dot per
// 25 m cell where other players of my public world are (the relay's S.Map: counts only, no ids, names or exact spots), with a count
// badge above one. Drawn under the friend dots (a world has none: party friends never share a public world) and under "You".
// Kid safety: not tappable, no tooltip, no travel target; the cell I stand in is left out (lib/town/playerMarks.ts).
// Heat: nothing runs while the map is closed; while it is open the dots re-render only when the cells change (at most every 5 s).
import {memo,useEffect,useState} from 'react';
import {multiplayerEnabled} from '@/lib/multiplayer/config';
import {mapDots} from '@/lib/multiplayer/mapDots';
import {publicDraw} from '@/lib/graphics/remotePublic';
import {FLIGHT_BOUNDS} from '@/lib/town/simulation';
import {playerBadge,playerDots} from '@/lib/town/playerMarks';
import type {MapCell} from '@/multiplayer/protocol';

const NONE:readonly MapCell[]=[];
const read=()=>publicDraw.isPublic()?mapDots.get():NONE;

/** The latest cells while `live` (the map is open) in a public world; [] (and no listener) otherwise. */
export function useMapCells(live:boolean):readonly MapCell[]{
 const [cells,setCells]=useState<readonly MapCell[]>(NONE);
 useEffect(()=>{
  if(!live||!multiplayerEnabled()){setCells(NONE);return;}
  const sync=()=>setCells(read());sync();
  return mapDots.subscribe(sync);
 },[live]);
 return cells;
}

/** True while the open map has other players to show: the key then lists "Players". */
export function usePlayersOnMap(live:boolean):boolean{return useMapCells(live).length>0;}

function PlayerMapDots({live,me}:{live:boolean;me?:{x:number;z:number}}){
 const cells=useMapCells(live);
 if(!cells.length)return null;
 const dots=playerDots(cells,me??null,FLIGHT_BOUNDS);
 if(!dots.length)return null;
 return <g className="map-player-dots" data-player-dots="" pointerEvents="none" aria-hidden="true">{dots.map(d=>{const b=playerBadge(d.n);
  return <g key={d.key} data-player-dot={d.n} transform={`translate(${d.x} ${d.z})`}>
   <circle r="13" fill="#fff7db" opacity=".28"/>
   <circle r="5.5" fill="#fff7db" stroke="#294f43" strokeWidth="1.6" opacity=".92"/>
   {b&&<g transform="translate(7 -7)"><rect x={b.length>1?-7.5:-5.5} y="-5.5" width={b.length>1?15:11} height="11" rx="5.5" fill="#294f43"/><text y="3.4" textAnchor="middle" fill="#fff7db" fontSize="8.5" fontWeight="900" style={{fontFamily:'Arial,Helvetica,sans-serif'}}>{b}</text></g>}
  </g>;})}</g>;
}
export default memo(PlayerMapDots);
