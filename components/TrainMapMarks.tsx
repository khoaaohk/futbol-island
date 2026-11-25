'use client';
// The Island Line on the maps (train Phase 3, Nov 23 2026; PLAN.md §5, §6): the track as one static polyline (every 4th 2 m row),
// the five station pins ("Fly there" on the travel map: MapDestination `station-<id>`), and on the open travel map only the three
// trains as live dots worked out from the shared timetable clock (lib/town/trainSchedule.ts). Heat: the line and pins are static
// SVG built once; the dots run ONE 2 Hz interval only while the travel map is open, writing three transforms straight to the DOM
// (no React render, nothing allocated per tick). No network: every player's map shows the same trains.
import {memo,useEffect,useRef} from 'react';
import {TRACK,TRAIN_STATIONS,trackAt,type TrainStation} from '@/lib/town/trainTrack';
import {TRAIN_COUNT,TRAIN_LENGTH,trainAt,newTrainState,trainClockSec} from '@/lib/town/trainSchedule';
import {LIVERIES} from '@/lib/town/trainLiveries';

const LINE_POINTS=(()=>{const out:string[]=[];for(let i=0;i<TRACK.n;i+=4)out.push(`${Math.round(TRACK.x[i]*10)/10},${Math.round(TRACK.z[i]*10)/10}`);out.push(out[0]);return out.join(' ');})();
/** Each station pin sits on the platform side, 7 m off the line (the label hangs further out on the full map). */
export const TRAIN_PINS=TRAIN_STATIONS.map(st=>{const c=trackAt(st.s),nx=c.tz*st.side,nz=-c.tx*st.side;return {st,x:c.x+nx*7,z:c.z+nz*7,lx:c.x+nx*22,lz:c.z+nz*22};});
const PINS=TRAIN_PINS;
type Dest=(id:`station-${TrainStation['id']}`,label:string)=>Record<string,unknown>;

/** The line and the five station pins (static; inside the memoized terrain). */
export const TrainLineMarks=memo(function TrainLineMarks({localMap,destination}:{localMap:boolean;destination:Dest}){
 return <g aria-label="Island Line railway" data-train-line="">
  <polyline points={LINE_POINTS} fill="none" stroke="#6d5a49" strokeWidth={localMap?2.6:4.2} strokeLinejoin="round" opacity=".9"/>
  <polyline points={LINE_POINTS} fill="none" stroke="#f3ead6" strokeWidth={localMap?1:1.6} strokeDasharray={localMap?'3 4':'5 6'} strokeLinejoin="round"/>
  {PINS.map(p=><g key={p.st.id} data-train-station={p.st.id} {...destination(`station-${p.st.id}`,`${p.st.name} station`)}>
   {!localMap&&<path d={`M${p.x} ${p.z}L${p.lx} ${p.lz}`} stroke="#294f43" strokeWidth="1.2"/>}
   <rect x={p.x-(localMap?4:6.5)} y={p.z-(localMap?4:6.5)} width={localMap?8:13} height={localMap?8:13} rx="2.5" fill="#fff8e5" stroke="#294f43" strokeWidth={localMap?1.2:1.8}/>
   <path d={`M${p.x-(localMap?2.2:3.6)} ${p.z+(localMap?1.4:2.2)}h${localMap?4.4:7.2}M${p.x-(localMap?1.6:2.6)} ${p.z-(localMap?1.6:2.6)}h${localMap?3.2:5.2}v${localMap?2.4:4}h-${localMap?3.2:5.2}z`} fill="none" stroke="#294f43" strokeWidth={localMap?.9:1.3}/>
   {!localMap&&<circle cx={p.x} cy={p.z} r="12" fill="transparent"/>}
   {!localMap&&<><rect className="map-place-label" x={p.lx-36} y={p.lz-9} width="72" height="18" rx="5" fill="#fff8e5" stroke="#73886b" strokeWidth="1"/>
    <text x={p.lx} y={p.lz+3.5} textAnchor="middle" fill="#294f43" fontSize="10" fontWeight="700">{p.st.name.toUpperCase()}</text></>}
  </g>)}
 </g>;
});

/** Station names drawn again in the map's top label layer (owner Nov 24: "SOUTH" sat under a building and the V marks), above every
 * building, marker and dot; pointer-transparent and aria-hidden like the other top labels (the tappable originals stay in the line layer). */
export const TrainLabelsTop=memo(function TrainLabelsTop(){
 return <g data-train-labels-top="">{PINS.map(p=><g key={p.st.id}><rect x={p.lx-36} y={p.lz-9} width="72" height="18" rx="5" fill="#fff8e5" stroke="#73886b" strokeWidth="1"/>
  <text x={p.lx} y={p.lz+3.5} textAnchor="middle" fill="#294f43" fontSize="10" fontWeight="700">{p.st.name.toUpperCase()}</text></g>)}</g>;
});

/** The three trains, live while `live` (the travel map is open). */
export const TrainMapDots=memo(function TrainMapDots({live}:{live:boolean}){
 const refs=useRef<(SVGGElement|null)[]>([]);
 useEffect(()=>{if(!live)return;const st=newTrainState(),at={x:0,z:0,tx:1,tz:0};
  const tick=()=>{const now=trainClockSec();for(let i=0;i<TRAIN_COUNT;i++){const el=refs.current[i];if(!el)continue;trainAt(i,now,st);trackAt(st.s-TRAIN_LENGTH/2,at);el.setAttribute('transform',`translate(${Math.round(at.x*10)/10} ${Math.round(at.z*10)/10})`);}};
  tick();const id=window.setInterval(tick,500);return()=>window.clearInterval(id);},[live]);
 if(!live)return null;
 return <g aria-label="Trains on the Island Line" pointerEvents="none" data-train-dots="">{Array.from({length:TRAIN_COUNT},(_,i)=><g key={i} ref={el=>{refs.current[i]=el;}} data-train-dot={i}>
  <rect x="-9" y="-6" width="18" height="12" rx="4" fill={LIVERIES[i%LIVERIES.length].lower} stroke="#fff8e5" strokeWidth="2"/><rect x="-6" y="-3.2" width="12" height="3.4" rx="1" fill={LIVERIES[i%LIVERIES.length].upper}/>
 </g>)}</g>;
});
