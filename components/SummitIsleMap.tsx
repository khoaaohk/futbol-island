import {INTERIOR_GRASS_COLOR} from '@/lib/town/shoreline';
import {SUMMIT_SHORE,SUMMIT_LAWN,SUMMIT_TERRACE,SUMMIT_PITCH,SUMMIT_FENCE,SUMMIT_PATHS,SUMMIT_PATH_WIDTH,SANDBAR_PATH,SANDBAR_NAME,SUMMIT_NAME,SUMMIT_CENTER,sandbarHalfWidth,summitContour,type IslePoint} from '@/lib/town/summitIsle';
// Summit Isle on the island maps (IslandOverview: the travel map and the minimap), Oct 12 2026. Drawn like Coral Cay: sand and
// grass, then the green peak as stepped contour tints every 8 m (they follow its spurs and gullies, packed tight near the top), the
// summit's flat with the Summit 5s pitch on it (labelled "5v5" like the other pitches), the trails and the slim sandbar. Static
// strings with fixed precision (SSR and every browser agree), built once at import.
const pt=(p:IslePoint)=>`${Math.round(p.x*100)/100},${Math.round(p.z*100)/100}`;
const pts=(list:IslePoint[])=>list.map(pt).join(' ');
const SHORE=pts(SUMMIT_SHORE.filter((_,i)=>i%2===0)),LAWN=pts(SUMMIT_LAWN),TERRACE_PTS=pts(SUMMIT_TERRACE);
const CONTOURS=[8,16,24,32,40,48].map((h,i)=>({h,fill:['#73a07a','#6e9b74','#68956d','#638f67','#5f8a63','#7d8f74'][i],points:pts(summitContour(h,144))}));
const PATHS=SUMMIT_PATHS.map(p=>pts(p.filter((_,i)=>i%2===0||i===p.length-1)));
const SANDBAR=(()=>{const side=(sign:number)=>SANDBAR_PATH.map((p,i)=>{const q=SANDBAR_PATH[Math.min(SANDBAR_PATH.length-1,i+1)],o=SANDBAR_PATH[Math.max(0,i-1)],tx=q.x-o.x,tz=q.z-o.z,l=Math.hypot(tx,tz)||1,w=sandbarHalfWidth(p.s)*sign;return {x:p.x+tz/l*w,z:p.z-tx/l*w};});
 return pts([...side(1),...side(-1).reverse()]);})();
const P=SUMMIT_PITCH,F=SUMMIT_FENCE;
/** `pitchProps`: the travel-map button props for the Summit 5s (IslandOverview's destination helper, Oct 13 2026: "make the 5v5
 *  field clickable to be transported there"); a transparent pad round the fence keeps the tap target generous. */
export default function SummitIsleMap({localMap,pitchProps}:{localMap:boolean;pitchProps?:Record<string,unknown>}){
 return <g aria-label={SUMMIT_NAME} data-summit-isle="island">
  <polygon aria-label={SANDBAR_NAME} data-summit-isle="sandbar" points={SANDBAR} fill="#f1d6a1" stroke="#e1d3ae" strokeWidth="1.5"/>
  <polygon data-summit-isle="shore" points={SHORE} fill="#f1d6a1" stroke="#e1d3ae" strokeWidth="4"/>
  <polygon aria-label="Summit Isle grass" points={LAWN} fill={INTERIOR_GRASS_COLOR}/>
  <g aria-label="Summit Isle mountain (50 m)" data-summit-isle="mountain">
   {CONTOURS.map(c=><polygon key={c.h} points={c.points} fill={c.fill} stroke="#4c7550" strokeWidth={localMap?.45:.8} strokeOpacity=".6"/>)}
   <polygon aria-label="Summit" points={TERRACE_PTS} fill="#94b98f" stroke="#4c7550" strokeWidth={localMap?.8:1.2}/></g>
  {PATHS.map((p,i)=><polyline key={'summit-path'+i} points={p} fill="none" stroke="#dcdbb8" strokeWidth={SUMMIT_PATH_WIDTH} strokeLinejoin="round" strokeLinecap="round"/>)}
  <g aria-label="Summit 5s pitch (5v5)" data-summit-isle="pitch" {...pitchProps}>
   <rect data-summit-isle="pitch-tap" x={P.x-F.halfX-14} y={P.z-F.halfZ-14} width={F.halfX*2+28} height={F.halfZ*2+28} fill="transparent"/>
   <rect x={P.x-F.halfX} y={P.z-F.halfZ} width={F.halfX*2} height={F.halfZ*2} fill="none" stroke="#9d805b" strokeWidth=".8"/>
   <rect x={P.x-P.length/2} y={P.z-P.width/2} width={P.length} height={P.width} fill="#6e9678" stroke="#fff0cc" strokeWidth="1.5"/>
   <text x={P.x} y={P.z+(localMap?3.5:5.5)} textAnchor="middle" fill="#fff5d5" stroke="#294f43" strokeWidth="3" paintOrder="stroke" fontSize={localMap?10:16} fontWeight="700">5v5</text>
  </g>
  {!localMap&&<text x={SUMMIT_CENTER.x-92} y={SUMMIT_CENTER.z+48} textAnchor="middle" fill="#fff5d5" stroke="#294f43" strokeWidth="3" paintOrder="stroke" fontSize="11" fontWeight="700">SUMMIT ISLE</text>}
  {localMap&&<text x={SUMMIT_CENTER.x} y={SUMMIT_CENTER.z+54} textAnchor="middle" fontSize="9" fill="#76583a" fontWeight="700">SUMMIT ISLE</text>}
 </g>;
}
