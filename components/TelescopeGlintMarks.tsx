'use client';
import {useTelescope} from '@/lib/town/telescopeProgress';
import {pendingGlints} from '@/lib/town/telescope';
/** Glints spotted through the Summit Isle telescope and not yet collected: gold sparkle marks on the island maps (minimap and
 *  travel map), where you walk to collect them (lib/town/telescope.ts). Re-renders only when the saved hunt changes. */
export default function TelescopeGlintMarks({localMap}:{localMap:boolean}){
 const save=useTelescope(),list=pendingGlints(save);
 if(!list.length)return null;
 const r=localMap?4.2:7;
 return <g className="map-telescope-glints" pointerEvents="none" aria-label="Telescope glints to collect">{list.map(g=><g key={g.id} aria-label={`Telescope glint at ${g.name}`} data-telescope-glint={g.id} transform={`translate(${g.at.x} ${g.at.z})`}>
  <circle r={r*1.25} fill="#fff8e5" stroke="#294f43" strokeWidth={localMap?1:1.6}/>
  <path d={`M0 ${-r}L${r*.28} ${-r*.28}L${r} 0L${r*.28} ${r*.28}L0 ${r}L${-r*.28} ${r*.28}L${-r} 0L${-r*.28} ${-r*.28}Z`} fill="#e9a53f" stroke="#294f43" strokeWidth={localMap?.5:.8}/>
 </g>)}</g>;
}
