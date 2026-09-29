import {useEffect,useRef,useId,useMemo,memo} from 'react';
import {ARCADE_DOOR,COACHES_DOOR,VENUES,type Format} from '@/lib/town/venues';
import {ISLAND_SHORE,SHORE_SAND,INTERIOR_GRASS,INTERIOR_GRASS_COLOR,NORTH_BEACH_UMBRELLAS,NORTH_BEACH_PATHS,onIsland} from '@/lib/town/shoreline';
import {FLIGHT_BOUNDS,FLIGHT_WATER_MARGIN} from '@/lib/town/simulation';
import {VENDING_MACHINES} from '@/lib/town/vendingCatalog';
import {FISH_SPOTS,MARKET_STAND} from '@/lib/town/fishing/fishCatalog';
/** SVG point text with fixed precision: the shoreline comes from trig, which differs in the last digits between Node (SSR)
 *  and WebKit/V8 in the browser, so unrounded values caused a hydration mismatch. 0.01 map units is far below a pixel. */
const svgPoint=(p:{x:number;z:number})=>`${Math.round(p.x*100)/100},${Math.round(p.z*100)/100}`;
// Static markers share the memoized terrain: no additional frame updates.
const VENDING_MARKERS=VENDING_MACHINES;
export type MapFootprint={x:number;z:number;w:number;d:number;cornerRadius?:number};
export type MapDestination=Format|'square'|'store'|'coaches';
function IslandOverview({roads,buildings,position,markerPosition,onSelect,active=true,frames}:{roads:MapFootprint[];buildings:MapFootprint[];position?:{x:number;z:number};markerPosition?:{x:number;z:number};onSelect?:(destination:MapDestination)=>void;active?:boolean;frames?:(listener:(x:number,z:number)=>void)=>()=>void}){
 const destination=(id:MapDestination,label:string)=>onSelect?{role:'button',tabIndex:0,'aria-label':`Travel to ${label}`,className:'map-destination',onClick:()=>onSelect(id),onKeyDown:(event:React.KeyboardEvent<SVGGElement>)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();onSelect(id);}}}:{'aria-label':label};
 const boundaryMask=useId();
 const b=FLIGHT_BOUNDS,w=b.maxX-b.minX,h=b.maxZ-b.minZ;
 const previous=useRef(position);
 const jumped=!!(position&&previous.current&&Math.hypot(position.x-previous.current.x,position.z-previous.current.z)>25);
 useEffect(()=>{previous.current=position;},[position]);
 // Heat pass 3: with a frame source (Town's rendered frames) the layer moves on the island's own frames and has no CSS transition,
 // so a moving minimap adds no compositor frames of its own. React then leaves the transform to this writer.
 const layer=useRef<HTMLDivElement>(null),latest=useRef(position);latest.current=position;
 useEffect(()=>{const el=layer.current;if(!frames||!el)return;let last='';const write=(x:number,z:number)=>{const t=`translate(${(b.minX-8-x)/(w+16)*100}%, ${(b.minZ-8-z)/(h+16)*100}%)`;if(t!==last){last=t;el.style.transform=t;}};
  if(latest.current)write(latest.current.x,latest.current.z);return frames(write);},[frames,b.minX,b.minZ,w,h]);
 const radius=position&&!onIsland(position.x,position.z)?95:65;
 const shorePoints=ISLAND_SHORE.map(p=>svgPoint(p)).join(' ');
 const view=position?`${-radius} ${-radius} ${radius*2} ${radius*2}`:`${b.minX-8} ${b.minZ-8} ${w+16} ${h+16}`;
 const localMap=!!position;
 const terrain=useMemo(()=> <>
  <rect x={b.minX-8} y={b.minZ-8} width={w+16} height={h+16} fill="#83b5ac"/>
  <g aria-label="Offshore flight area" data-flight-margin={FLIGHT_WATER_MARGIN} opacity={localMap?.25:1}>
   <polygon points={shorePoints} fill={localMap?'none':'#99c8bd'} stroke={localMap?'#526659':'#d5e9dd'} strokeWidth={FLIGHT_WATER_MARGIN*2} strokeLinejoin="round"/>
   <polygon points={shorePoints} fill={localMap?'none':'#99c8bd'} stroke={localMap?'#e5dcc3':'#99c8bd'} strokeWidth={FLIGHT_WATER_MARGIN*2-3} strokeLinejoin="round"/>
  </g>
  {localMap&&<g aria-label="Flight boundary" pointerEvents="none"><rect x={b.minX-8} y={b.minZ-8} width={w+16} height={h+16} mask={`url(#${boundaryMask})`} style={{fill:'#795433',fillOpacity:1,stroke:'none'}}/></g>}
  <polygon points={shorePoints} fill="#e1d3ae" stroke="#f1d6a1" strokeWidth="5"/>
  <polygon aria-label="Interior grass" points={INTERIOR_GRASS.map(p=>svgPoint(p)).join(' ')} fill={INTERIOR_GRASS_COLOR}/>
  <g aria-label="Ferry dock"><path d="M210 190H238L235 204L226.5 215H210Z" fill="#b98f62" stroke="#91704d" strokeWidth=".7"/><rect x="202" y="190.5" width="8" height="5" fill="#b98f62"/><rect aria-label="Ferry boarding ramp" x="234" y="204" width="10" height="3.2" fill="#b98f62" stroke="#fff0cf" strokeWidth=".3"/><rect x="242" y="190.5" width="8" height="17" rx="2" fill="#477c6a"/><rect x="243" y="194" width="6" height="10" fill="#fff0cf"/></g>
  {SHORE_SAND.map((p,i)=>{const next=SHORE_SAND[(i+1)%SHORE_SAND.length];return <polygon key={'sand'+i} points={[p.outer,next.outer,next.inner,p.inner].map(p=>svgPoint(p)).join(' ')} fill="#f1d6a1"/>;})}
  {NORTH_BEACH_PATHS.map((r,i)=><rect key={'beach-path'+i} x={r.x-r.w/2} y={r.z-r.d/2} width={r.w} height={r.d} fill="#eddfbb"/>)}
  {NORTH_BEACH_UMBRELLAS.map((p,i)=><circle key={'umbrella'+i} cx={p.x} cy={p.z} r={localMap?2.5:2} fill={i%2?'#477c6a':'#bd7657'}/>)}
  <g aria-label="North Beach"><text x="80" y="-214" textAnchor="middle" fontSize={localMap?9:11} fill="#76583a" fontWeight="700">NORTH BEACH</text></g>
  <rect x="43" y="207" width="167" height="8" fill="#b98f62"/>
  <rect aria-label="East market boardwalk" x="210" y="30" width="28" height="160" fill="#b98f62"/>
  <g aria-label="Beach volleyball court"><rect x="60" y="190" width="24" height="16" fill="#e8d5a3"/><rect x="64" y="194" width="16" height="8" fill="none" stroke="#fff4d5" strokeWidth=".6"/><path d="M72 193.4v9.2" stroke="#477c6a" strokeWidth=".8"/></g>
  {roads.map((r,i)=><rect key={'road'+i} x={r.x-r.w/2} y={r.z-r.d/2} width={r.w} height={r.d} fill="#8c927a"/>)}
  {buildings.map((r,i)=><rect key={'building'+i} x={r.x-r.w/2} y={r.z-r.d/2} width={r.w} height={r.d} rx={r.cornerRadius??1} fill="#be8d65"/>)}
  {VENUES.map(v=><g key={v.id} {...destination(v.id,v.id+' field')}><rect x={v.x-v.width/2} y={v.z-v.length/2} width={v.width} height={v.length} fill={v.surface} stroke="#fff0cc" strokeWidth="1.5"/><text x={v.x} y={v.z+4} textAnchor="middle" fill="#fff5d5" stroke="#294f43" strokeWidth="3" paintOrder="stroke" fontSize={localMap?10:22} fontWeight="700">{v.id}</text></g>)}
  {([{id:'square',label:'ARCADE',point:ARCADE_DOOR,dx:0,dy:localMap?19:30,width:localMap?42:64},{id:'coaches',label:'COACHES',point:COACHES_DOOR,dx:localMap?27:29,dy:localMap?1:3,width:localMap?46:74}] as const).map(({id,label,point,dx,dy,width})=><g key={id} {...destination(id,id==='coaches'?'Coaches Centre':'Arcade')}>
   <path d={`M${point.x} ${point.z} L${point.x+dx} ${point.z+dy}`} fill="none" stroke="#294f43" strokeWidth="1.2"/>
   <circle cx={point.x} cy={point.z} r={localMap?4.5:6} fill="#f9ca70" stroke="#294f43" strokeWidth="1.5"/>
   {!localMap&&<circle cx={point.x} cy={point.z} r="11" fill="transparent"/>}
   <rect className="map-place-label" x={point.x+dx-width/2} y={point.z+dy-(localMap?7:11)} width={width} height={localMap?14:22} rx="5" fill="#fff8e5" stroke="#73886b" strokeWidth="1"/>
   <text x={point.x+dx} y={point.z+dy+(localMap?3:4)} textAnchor="middle" fill="#294f43" fontSize={localMap?8:12} fontWeight="700">{label}</text>
  </g>)}
  {/* The travel map's "Vending machine" trip lands at the Island Square machine (STORE_DOOR), so that marker is the tappable destination. */}
  <g className="map-vending-markers" pointerEvents="none">{VENDING_MARKERS.map(m=>{const trip=onSelect&&m.id==='plaza';return <g key={m.id} {...(trip?{...destination('store',`${m.name} vending machine in Island Square`),pointerEvents:'auto'}:{'aria-label':`${m.name} vending machine`})} data-vending-marker={m.id}>
   {trip&&<circle cx={m.x} cy={m.z} r="15" fill="transparent"/>}
   <circle cx={m.x} cy={m.z} r={localMap?5.4:9.5} fill="#fff8e5" stroke="#294f43" strokeWidth={localMap?1.3:1.8}/>
   <text x={m.x} y={m.z+(localMap?2.7:4.6)} textAnchor="middle" fill="#294f43" fontSize={localMap?7.6:13} fontWeight="900" style={{stroke:'none'}}>V</text>
  </g>;})}</g>
  <g className="map-fishing-markers" pointerEvents="none">{FISH_SPOTS.map(spot=><g key={spot.id} aria-label={`${spot.name} fishing spot`} data-fishing-marker={spot.id}>
   <title>{`${spot.name} · Fishing`}</title>
   <circle cx={spot.x} cy={spot.z} r={localMap?5.4:9.5} fill="#b9e1df" stroke="#294f43" strokeWidth={localMap?1.3:1.8}/>
   <text x={spot.x} y={spot.z+(localMap?2.7:4.6)} textAnchor="middle" fill="#294f43" fontSize={localMap?7.6:13} fontWeight="900" style={{stroke:'none'}}>F</text>
  </g>)}</g>
  <g aria-label="Rosa’s Market · Sell fish, produce and cards" data-market-marker="rosa" pointerEvents="none">
   <title>Rosa’s Market · Sell fish, produce and cards</title>
   <path d={`M${MARKET_STAND.x} ${MARKET_STAND.z}h-${localMap?13:24}`} stroke="#294f43" strokeWidth="1.2"/>
   <circle cx={MARKET_STAND.x} cy={MARKET_STAND.z} r={localMap?4:6} fill="#de9075" stroke="#294f43" strokeWidth="1.5"/>
   <rect x={MARKET_STAND.x-(localMap?87:126)} y={MARKET_STAND.z-(localMap?7:11)} width={localMap?74:102} height={localMap?14:22} rx="5" fill="#f4c2a4" stroke="#294f43" strokeWidth="1"/>
   <text x={MARKET_STAND.x-(localMap?50:75)} y={MARKET_STAND.z+(localMap?3:4)} textAnchor="middle" fill="#294f43" fontSize={localMap?8:11} fontWeight="800">ROSA’S MARKET</text>
  </g>
  {!localMap&&markerPosition&&<g aria-label="Your position" transform={`translate(${markerPosition.x} ${markerPosition.z})`}><circle r="8" fill="#ffc45b" stroke="#294f43" strokeWidth="2"/><circle r="3" fill="#fff7db"/></g>}
  {!localMap&&<text x={(b.minX+b.maxX)/2} y={b.maxZ+5} textAnchor="middle" fill="#25483e" fontSize="11">Light water · Flight area</text>}
 </>,[roads,buildings,onSelect,markerPosition,localMap,boundaryMask]);
 const boundaryDefs=<defs><mask id={boundaryMask} maskUnits="userSpaceOnUse" x={b.minX-8} y={b.minZ-8} width={w+16} height={h+16}>
   <polygon points={shorePoints} fill="white" stroke="white" strokeWidth={FLIGHT_WATER_MARGIN*2} strokeLinejoin="round"/>
   <polygon points={shorePoints} fill="black" stroke="black" strokeWidth={FLIGHT_WATER_MARGIN*2-6} strokeLinejoin="round"/>
  </mask></defs>;
 if(position)return <div className="island-overview local-overview" role="img" aria-label="Nearby streets and fields around your current position" style={{position:'relative',overflow:'hidden',background:'transparent'}}>
  <div ref={layer} className="minimap-layer" data-frame-driven={frames?'true':undefined} style={frames?{width:`${(w+16)/(radius*2)*100}%`,height:`${(h+16)/(radius*2)*100}%`,transition:'none'}:{width:`${(w+16)/(radius*2)*100}%`,height:`${(h+16)/(radius*2)*100}%`,transform:`translate(${(b.minX-8-position.x)/(w+16)*100}%, ${(b.minZ-8-position.z)/(h+16)*100}%)`,transitionDuration:jumped?'0ms':undefined}}>
   <svg viewBox={`${b.minX-8} ${b.minZ-8} ${w+16} ${h+16}`} width="100%" height="100%" aria-hidden="true">{boundaryDefs}<g className="minimap-terrain">{terrain}</g></svg>
  </div>
  <svg className="minimap-player" viewBox={view} aria-hidden="true"><g aria-label="Your position"><circle cx={0} cy={0} r="4.5" fill="#314f43"/><circle cx={0} cy={0} r="3" fill="#fff0cf" stroke="#fff0cf" strokeWidth="1"/></g></svg>
 </div>;
 return <svg className="island-overview" viewBox={view} style={{background:'#83b5ac'}} role={onSelect?'group':'img'} aria-label="Island map with vending machines, fishing spots, Rosa’s Market, Arcade, Coaches Centre and football fields">{terrain}</svg>;
}

export default memo(IslandOverview,(a,b)=>a.roads===b.roads&&a.buildings===b.buildings&&a.markerPosition===b.markerPosition&&a.onSelect===b.onSelect&&a.active===b.active&&a.frames===b.frames&&(b.active===false||a.position===b.position));
