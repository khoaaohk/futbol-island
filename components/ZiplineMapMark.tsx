import {ZIP_MAP} from '@/lib/town/zipline';
/** The Summit Isle → Coral Cay Hostel zipline on the island maps (minimap and travel map, Oct 14 2026): a dashed line from the tower
 *  on the summit's north-west shoulder to the hostel roof, a start badge with a little pulley at the tower and a dot at the roof.
 *  Static (world x/z straight onto the overview's SVG), part of the memoized terrain: no state, no re-render. */
const A=ZIP_MAP.from,B=ZIP_MAP.to;
export default function ZiplineMapMark({localMap}:{localMap:boolean}){
 const r=localMap?4.6:7.5,w=localMap?1.3:2;
 return <g aria-label="Zipline from Summit Isle to the Coral Cay Hostel roof" data-zipline-map="line" pointerEvents="none">
  <line x1={A.x} y1={A.z} x2={B.x} y2={B.z} stroke="#fff8e5" strokeWidth={w+1.6} strokeLinecap="round" opacity=".75"/>
  <line x1={A.x} y1={A.z} x2={B.x} y2={B.z} stroke="#c8552b" strokeWidth={w} strokeDasharray={localMap?'4 3':'7 5'} strokeLinecap="round"/>
  <circle cx={B.x} cy={B.z} r={r*.55} fill="#fff8e5" stroke="#c8552b" strokeWidth={w*.8}/>
  <g data-zipline-map="start" transform={`translate(${A.x} ${A.z})`}>
   <circle r={r} fill="#ef7d3c" stroke="#294f43" strokeWidth={localMap?1.2:1.8}/>
   {/* A pulley on its cable: the start of the ride. */}
   <path d={`M${-r*.62} ${-r*.12}L${r*.62} ${-r*.42}`} stroke="#fff8e5" strokeWidth={localMap?.9:1.4} strokeLinecap="round"/>
   <circle cy={-r*.2} r={r*.24} fill="#fff8e5"/>
   <path d={`M0 ${-r*.02}V${r*.42}M${-r*.28} ${r*.42}H${r*.28}`} stroke="#fff8e5" strokeWidth={localMap?.9:1.4} strokeLinecap="round"/>
  </g>
  {!localMap&&<text x={A.x-12} y={A.z-12} textAnchor="end" fill="#fff5d5" stroke="#294f43" strokeWidth="3" paintOrder="stroke" fontSize="10" fontWeight="800">ZIPLINE</text>}
 </g>;
}
