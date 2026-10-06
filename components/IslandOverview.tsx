import {useEffect,useRef,useMemo,memo,useState} from 'react';
import {ARCADE_DOOR,COACHES_DOOR,VENUES,type Format} from '@/lib/town/venues';
import {MUSEUM_DOOR} from '@/lib/museum/museumDoors';
/** The History Museum's door on the map (Oct 5 2026, user: "add museum to the map"); the label hangs just below it. */
const MUSEUM_MAP_POINT={x:MUSEUM_DOOR.x,z:MUSEUM_DOOR.front} as const;
import {ISLAND_SHORE,SHORE_SAND,INTERIOR_GRASS,INTERIOR_GRASS_COLOR,NORTH_BEACH_UMBRELLAS,NORTH_BEACH_PATHS,onIsland} from '@/lib/town/shoreline';
import {FLIGHT_BOUNDS,FLIGHT_WATER_MARGIN} from '@/lib/town/simulation';
import {onLand} from '@/lib/town/landmass';
import {CAY_SHORE,CAY_SAND,CAY_LAWN,CAUSEWAY_PATH,CAUSEWAY_BEACHES,SANDBARS,FARM,HOSTEL,ROUNDABOUT,CAY_HOMES,HOSTEL_PATHS,CAY_PLAZA,BEACH_COURT,COURT_BEACH,CAY_HUTS,CAY_HUT_RADIUS,CORAL_CAY_ARRIVAL} from '@/lib/town/coralCay';
import {FLIGHT_OUTLINE_PATH} from '@/lib/town/flightOutline.data';
import {VENDING_MACHINES} from '@/lib/town/vendingCatalog';
import {FISH_SPOTS,MARKET_STAND} from '@/lib/town/fishing/fishCatalog';
import {JOBS} from '@/lib/town/jobs/jobCatalog';
import {EAST_PIER,JETTY_PATH,PIER_TARGET_SPOTS} from '@/lib/town/eastPier';
import {placeJobMarkers} from '@/lib/town/mapMarkers';
// East Jetty (eastPier.ts): the straight stone walkway from the market seawall curling into its spiral, drawn from the same
// centre-line samples movement uses (every 3rd sample, fixed precision: static string built once).
const PIER=EAST_PIER,JETTY_POINTS=JETTY_PATH.filter((p,i)=>p.x>=EAST_PIER.wallX&&(i%3===0||i===JETTY_PATH.length-1)).map(p=>`${Math.round(p.x*100)/100},${Math.round(p.z*100)/100}`).join(' ');
/** SVG point text with fixed precision: the shoreline comes from trig, which differs in the last digits between Node (SSR)
 *  and WebKit/V8 in the browser, so unrounded values caused a hydration mismatch. 0.01 map units is far below a pixel. */
const svgPoint=(p:{x:number;z:number})=>`${Math.round(p.x*100)/100},${Math.round(p.z*100)/100}`;
// Coral Cay (coralCay.ts): its flight corridor, cay and sandbars share the main island's margin styling. Static strings, built once.
const SANDBAR_POINTS:Record<string,string>=Object.fromEntries(SANDBARS.map(s=>[s.id,s.outline.map(svgPoint).join(' ')]));
const CAY_POINTS=CAY_SHORE.map(svgPoint).join(' '),CAUSEWAY_POINTS=CAUSEWAY_PATH.map(svgPoint).join(' '),BEACH_POINTS=CAUSEWAY_BEACHES.map(b=>b.map(svgPoint).join(' '));
// Static markers share the memoized terrain: no additional frame updates.
// Machines standing side by side (each Konbini's snack machine and its drinks machine, 1.8 m apart) share one marker, so the
// "V"s never stack; the first machine listed (the Konbini's own) keeps the marker's id and the Island Square trip.
const VENDING_MARKERS=VENDING_MACHINES.reduce<{id:string;x:number;z:number;names:string[];ids:string[]}[]>((list,m)=>{
 const near=list.find(o=>Math.hypot(o.x-m.x,o.z-m.z)<6);if(near){near.names.push(m.name);near.ids.push(m.id);}else list.push({id:m.id,x:m.x,z:m.z,names:[m.name],ids:[m.id]});return list;},[]);
/** Job board markers ("J", full map only): one per board in JOBS (new jobs appear by themselves), nudged clear of the V/F
 *  markers, field names and Rosa's label (lib/town/mapMarkers.ts). Static, computed once. */
const JOB_MARKERS=placeJobMarkers(JOBS,[...VENDING_MARKERS,...FISH_SPOTS],VENUES,MARKET_STAND,[{x:ARCADE_DOOR.x,z:ARCADE_DOOR.z+30,w:64,h:20},{x:MUSEUM_MAP_POINT.x,z:MUSEUM_MAP_POINT.z+28,w:74,h:20}]);// the full map's ARCADE and MUSEUM labels
export type MapFootprint={x:number;z:number;w:number;d:number;cornerRadius?:number};
export type MapDestination=Format|'square'|'store'|'coaches'|'cay'|'museum';
function IslandOverview({roads,buildings,position,markerPosition,onSelect,active=true,frames}:{roads:MapFootprint[];buildings:MapFootprint[];position?:{x:number;z:number};markerPosition?:{x:number;z:number};onSelect?:(destination:MapDestination)=>void;active?:boolean;frames?:(listener:(x:number,z:number)=>void)=>()=>void}){
 // The map is drawn in the browser only (after hydration): its world-space coordinates come from trig, and WebKit and the
 // server's V8 disagree in the last digit, which made React report a hydration mismatch on every Safari load (Sep 30 2026).
 const [mounted,setMounted]=useState(false);useEffect(()=>setMounted(true),[]);
 const destination=(id:MapDestination,label:string)=>onSelect?{role:'button',tabIndex:0,'aria-label':`Travel to ${label}`,className:'map-destination',onClick:()=>onSelect(id),onKeyDown:(event:React.KeyboardEvent<SVGGElement>)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();onSelect(id);}}}:{'aria-label':label};
 const b=FLIGHT_BOUNDS,w=b.maxX-b.minX,h=b.maxZ-b.minZ;
 const previous=useRef(position);
 const jumped=!!(position&&previous.current&&Math.hypot(position.x-previous.current.x,position.z-previous.current.z)>25);
 useEffect(()=>{previous.current=position;},[position]);
 // Heat pass 3: with a frame source (Town's rendered frames) the layer moves on the island's own frames and has no CSS transition,
 // so a moving minimap adds no compositor frames of its own. React then leaves the transform to this writer.
 const layer=useRef<HTMLDivElement>(null),latest=useRef(position);latest.current=position;
 useEffect(()=>{const el=layer.current;if(!frames||!el)return;let last='';const write=(x:number,z:number)=>{const t=`translate(${(b.minX-8-x)/(w+16)*100}%, ${(b.minZ-8-z)/(h+16)*100}%)`;if(t!==last){last=t;el.style.transform=t;}};
  if(latest.current)write(latest.current.x,latest.current.z);return frames(write);},[frames,b.minX,b.minZ,w,h]);
 const radius=position&&!onLand(position.x,position.z)?95:65;
 const shorePoints=ISLAND_SHORE.map(p=>svgPoint(p)).join(' ');
 const view=position?`${-radius} ${-radius} ${radius*2} ${radius*2}`:`${b.minX-8} ${b.minZ-8} ${w+16} ${h+16}`;
 const localMap=!!position;
 const terrain=useMemo(()=> <>
  <rect x={b.minX-8} y={b.minZ-8} width={w+16} height={h+16} fill="#83b5ac"/>
  {/* The flyable region traced from flightBlocked (lib/town/flightOutline.ts): main margin, the winding Coral Cay corridor,
      sandbar halos and cay margin as ONE outline, so the map can never disagree with the rule. */}
  <g aria-label="Offshore flight area" data-flight-margin={FLIGHT_WATER_MARGIN} opacity={localMap?.25:1}>
   <path d={FLIGHT_OUTLINE_PATH} fill={localMap?'#e5dcc3':'#99c8bd'} stroke={localMap?'#526659':'#d5e9dd'} strokeWidth="3" strokeLinejoin="round"/>
  </g>
  {localMap&&<g aria-label="Flight boundary" pointerEvents="none" data-flight-boundary="traced"><path d={FLIGHT_OUTLINE_PATH} style={{fill:'none',stroke:'#795433',strokeWidth:3,strokeLinejoin:'round'}}/></g>}
  <polygon points={shorePoints} fill="#e1d3ae" stroke="#f1d6a1" strokeWidth="5"/>
  <polygon aria-label="Interior grass" points={INTERIOR_GRASS.map(p=>svgPoint(p)).join(' ')} fill={INTERIOR_GRASS_COLOR}/>
  <g aria-label="Ferry dock"><path d="M210 190H238L235 204L226.5 215H210Z" fill="#b98f62" stroke="#91704d" strokeWidth=".7"/><rect x="202" y="190.5" width="8" height="5" fill="#b98f62"/><rect aria-label="Ferry boarding ramp" x="234" y="204" width="10" height="3.2" fill="#b98f62" stroke="#fff0cf" strokeWidth=".3"/><rect x="242" y="190.5" width="8" height="17" rx="2" fill="#477c6a"/><rect x="243" y="194" width="6" height="10" fill="#fff0cf"/></g>
  {SHORE_SAND.map((p,i)=>{const next=SHORE_SAND[(i+1)%SHORE_SAND.length];return <polygon key={'sand'+i} points={[p.outer,next.outer,next.inner,p.inner].map(p=>svgPoint(p)).join(' ')} fill="#f1d6a1"/>;})}
  {NORTH_BEACH_PATHS.map((r,i)=><rect key={'beach-path'+i} x={r.x-r.w/2} y={r.z-r.d/2} width={r.w} height={r.d} fill="#eddfbb"/>)}
  {NORTH_BEACH_UMBRELLAS.map((p,i)=><circle key={'umbrella'+i} cx={p.x} cy={p.z} r={localMap?2.5:2} fill={i%2?'#477c6a':'#bd7657'}/>)}
  <g aria-label="North Beach"><text x="80" y="-214" textAnchor="middle" fontSize={localMap?9:11} fill="#76583a" fontWeight="700">NORTH BEACH</text></g>
  <rect x="43" y="207" width="167" height="8" fill="#b98f62"/>
  <rect aria-label="East market boardwalk" x="210" y="30" width="28" height="160" fill="#b98f62"/>
  <g aria-label="East Jetty" data-east-pier="spiral"><polyline points={JETTY_POINTS} fill="none" stroke="#bca987" strokeWidth={PIER.flankHalf*2} strokeLinejoin="round" strokeLinecap="round"/><polyline points={JETTY_POINTS} fill="none" stroke="#e2d5b5" strokeWidth={PIER.railHalf*2} strokeLinejoin="round"/><circle cx={PIER.cx} cy={PIER.cz} r={PIER.plazaEdge} fill="#e2d5b5" stroke="#bca987" strokeWidth="1"/><g aria-label="East Jetty lighthouse" data-lighthouse="true" transform={`translate(${PIER.cx} ${PIER.cz})`}><circle r={localMap?4:5.5} fill="#fff8e5" stroke="#294f43" strokeWidth={localMap?1:1.4}/><path d={localMap?"M-1.3 2.6L-.8 -1.6H.8L1.3 2.6Z":"M-1.8 3.6L-1.1 -2.2H1.1L1.8 3.6Z"} fill="#bf6658"/><rect x={localMap?-1:-1.4} y={localMap?-2.8:-3.8} width={localMap?2:2.8} height={localMap?1.2:1.6} fill="#f4cc7c"/></g>
   <circle aria-label="Jetty shooting challenge ring" cx={PIER_TARGET_SPOTS[0].x} cy={PIER_TARGET_SPOTS[0].z} r={localMap?2.6:3.5} fill="none" stroke="#ef7d3c" strokeWidth={localMap?1.2:1.8}/>
   {!localMap&&<text x={(PIER.wallX+PIER.cx)/2} y={PIER.z-PIER.flankHalf-3} textAnchor="middle" fill="#fff5d5" stroke="#294f43" strokeWidth="3" paintOrder="stroke" fontSize="11" fontWeight="700">EAST JETTY</text>}</g>
  <g aria-label="Beach volleyball court"><rect x="60" y="190" width="24" height="16" fill="#e8d5a3"/><rect x="64" y="194" width="16" height="8" fill="none" stroke="#fff4d5" strokeWidth=".6"/><path d="M72 193.4v9.2" stroke="#477c6a" strokeWidth=".8"/></g>
  {/* Coral Cay: direct children like the main island's land, roads and umbrellas, so the minimap's local styling applies alike. */}
  {BEACH_POINTS.map((points,i)=><polygon key={'causeway-beach'+i} points={points} fill="#f1d6a1"/>)}
  <polyline aria-label="Coral Cay causeway" data-coral-cay="causeway" points={CAUSEWAY_POINTS} fill="none" stroke="#8c927a" strokeWidth="12" strokeLinejoin="round" opacity={localMap?.5:1}/>
  {SANDBARS.map(s=><rect key={s.id+'-spur'} x={s.spur.x-2} y={Math.min(s.spur.z0,s.spur.z1)} width={4} height={Math.abs(s.spur.z1-s.spur.z0)} fill="#b98f62"/>)}
  {SANDBARS.map(s=><polygon key={s.id} aria-label={s.name} points={SANDBAR_POINTS[s.id]} fill="#f1d6a1" stroke="#e1d3ae" strokeWidth="1.5"/>)}
  {SANDBARS.map(s=><circle key={s.id+'-umbrella'} cx={s.x+2} cy={s.z-s.side*4} r={localMap?2.5:2} fill="#bd7657"/>)}
  <polygon aria-label="Coral Cay" data-coral-cay="shore" points={CAY_POINTS} fill="#e1d3ae" stroke="#f1d6a1" strokeWidth="5"/>
  {CAY_SAND.map((p,i)=>{const next=CAY_SAND[(i+1)%CAY_SAND.length];return <polygon key={'cay-sand'+i} points={[p.outer,next.outer,next.inner,p.inner].map(svgPoint).join(' ')} fill="#f1d6a1"/>;})}
  <polygon aria-label="Coral Cay lawn" points={CAY_LAWN.map(svgPoint).join(' ')} fill={INTERIOR_GRASS_COLOR}/>
  <polyline points={CAUSEWAY_POINTS} fill="none" stroke="#8c927a" strokeWidth="12" strokeLinejoin="round" opacity={localMap?.5:1}/>
  <g aria-label="Coral Cay roundabout" data-coral-cay="roundabout"><circle cx={ROUNDABOUT.x} cy={ROUNDABOUT.z} r={(ROUNDABOUT.roadOuter+ROUNDABOUT.roadInner)/2} fill="none" stroke="#8c927a" strokeWidth={ROUNDABOUT.roadOuter-ROUNDABOUT.roadInner}/><circle cx={ROUNDABOUT.x} cy={ROUNDABOUT.z} r={ROUNDABOUT.island} fill={INTERIOR_GRASS_COLOR}/></g>
  <rect aria-label="Coral Cay plaza" x={CAY_PLAZA.x-CAY_PLAZA.w/2} y={CAY_PLAZA.z-CAY_PLAZA.d/2} width={CAY_PLAZA.w} height={CAY_PLAZA.d} fill="#eddfbb"/>
  <g aria-label="Beach soccer court" data-coral-cay="court"><polygon points={COURT_BEACH.map(svgPoint).join(' ')} fill="#f1d6a1"/><rect x={BEACH_COURT.x-BEACH_COURT.length/2} y={BEACH_COURT.z-BEACH_COURT.width/2} width={BEACH_COURT.length} height={BEACH_COURT.width} fill="none" stroke="#4a8bb0" strokeWidth="1"/><text x={BEACH_COURT.x} y={BEACH_COURT.z-BEACH_COURT.width/2-(localMap?3:6)} textAnchor="middle" fill="#fff5d5" stroke="#294f43" strokeWidth="3" paintOrder="stroke" fontSize={localMap?9:11} fontWeight="700">BEACH SOCCER</text></g>
  <g aria-label="Coral Cay Farm" data-coral-cay="farm"><polygon points={FARM.fence.map(svgPoint).join(' ')} fill="#a99466" stroke="#8b6a4a" strokeWidth="1"/>{Array.from({length:7},(_,i)=><rect key={'farm-row'+i} x={FARM.crops.x0} y={-126+i*4.8} width={FARM.crops.x1-FARM.crops.x0} height={1.6} fill="#739568"/>)}{/* Label sits east of centre so the farm's two job J marks (west gate boards) never cover it. */}<text x={(FARM.fence[0].x+FARM.fence[1].x)/2+12} y={-104} textAnchor="middle" fill="#fff5d5" stroke="#294f43" strokeWidth="3" paintOrder="stroke" fontSize={localMap?9:11} fontWeight="700">FARM</text></g>
  <g aria-label="Coral Cay Hostel and homes" data-coral-cay="hostel">{HOSTEL_PATHS.map(([x,z,w,d],i)=><rect key={'hp'+i} x={x-w/2} y={z-d/2} width={w} height={d} fill="#eddfbb"/>)}<rect x={HOSTEL.x-HOSTEL.w/2} y={HOSTEL.z-HOSTEL.d/2} width={HOSTEL.w} height={HOSTEL.d} rx="1" fill="#be8d65"/>{CAY_HOMES.map((h,i)=>h.style==='hut'?<circle key={'home'+i} cx={h.x} cy={h.z} r={2.2} fill="#be8d65"/>:<rect key={'home'+i} x={h.x-2.6} y={h.z-2.3} width={5.2} height={4.6} rx=".8" fill="#be8d65"/>)}<text x={HOSTEL.x} y={HOSTEL.z-HOSTEL.d/2-(localMap?3:6)} textAnchor="middle" fill="#fff5d5" stroke="#294f43" strokeWidth="3" paintOrder="stroke" fontSize={localMap?9:11} fontWeight="700">HOSTEL</text></g>
  {CAY_HUTS.map((h,i)=><circle key={'hut'+i} cx={h.x} cy={h.z} r={CAY_HUT_RADIUS} fill="#be8d65"/>)}
  {roads.map((r,i)=><rect key={'road'+i} x={r.x-r.w/2} y={r.z-r.d/2} width={r.w} height={r.d} fill="#8c927a"/>)}
  {buildings.map((r,i)=><rect key={'building'+i} x={r.x-r.w/2} y={r.z-r.d/2} width={r.w} height={r.d} rx={r.cornerRadius??1} fill="#be8d65"/>)}
  {VENUES.map(v=><g key={v.id} {...destination(v.id,v.id+' field')}><rect x={v.x-v.width/2} y={v.z-v.length/2} width={v.width} height={v.length} fill={v.surface} stroke="#fff0cc" strokeWidth="1.5"/><text x={v.x} y={v.z+4} textAnchor="middle" fill="#fff5d5" stroke="#294f43" strokeWidth="3" paintOrder="stroke" fontSize={localMap?10:22} fontWeight="700">{v.id}</text></g>)}
  {([{id:'square',label:'ARCADE',point:ARCADE_DOOR,dx:0,dy:localMap?19:30,width:localMap?42:64},{id:'coaches',label:'COACHES',point:COACHES_DOOR,dx:localMap?27:29,dy:localMap?1:3,width:localMap?46:74},{id:'cay',label:'CORAL CAY',point:CORAL_CAY_ARRIVAL,dx:0,dy:localMap?-19:-32,width:localMap?56:88},{id:'museum',label:'MUSEUM',point:MUSEUM_MAP_POINT,dx:0,dy:localMap?18:28,width:localMap?48:74}] as const).map(({id,label,point,dx,dy,width})=><g key={id} {...destination(id,id==='coaches'?'Coaches Centre':id==='cay'?'Coral Cay':id==='museum'?'History Museum':'Arcade')}>
   <path d={`M${point.x} ${point.z} L${point.x+dx} ${point.z+dy}`} fill="none" stroke="#294f43" strokeWidth="1.2"/>
   <circle cx={point.x} cy={point.z} r={localMap?4.5:6} fill="#f9ca70" stroke="#294f43" strokeWidth="1.5"/>
   {!localMap&&<circle cx={point.x} cy={point.z} r="11" fill="transparent"/>}
   <rect className="map-place-label" x={point.x+dx-width/2} y={point.z+dy-(localMap?7:11)} width={width} height={localMap?14:22} rx="5" fill="#fff8e5" stroke="#73886b" strokeWidth="1"/>
   <text x={point.x+dx} y={point.z+dy+(localMap?3:4)} textAnchor="middle" fill="#294f43" fontSize={localMap?8:12} fontWeight="700">{label}</text>
  </g>)}
  {/* V / F / J are plain marks, never buttons (Sep 30 2026, user: "the legend above is enough"): the map key explains them with
      a tap tooltip (IslandTravelMap). The Island Square V used to be a "vending machines" trip; the ARCADE label goes there. */}
  <g className="map-vending-markers" pointerEvents="none">{VENDING_MARKERS.map(m=><g key={m.id} aria-label={`${m.names.join(' and ')} vending machine${m.names.length>1?'s':''}`} data-vending-marker={m.id} data-vending-machines={m.ids.join(' ')}>
   <circle cx={m.x} cy={m.z} r={localMap?5.4:9.5} fill="#fff8e5" stroke="#294f43" strokeWidth={localMap?1.3:1.8}/>
   <text x={m.x} y={m.z+(localMap?2.7:4.6)} textAnchor="middle" fill="#294f43" fontSize={localMap?7.6:13} fontWeight="900" style={{stroke:'none'}}>V</text>
  </g>)}</g>
  <g className="map-fishing-markers" pointerEvents="none">{FISH_SPOTS.map(spot=><g key={spot.id} aria-label={`${spot.name} fishing spot`} data-fishing-marker={spot.id}>
   <circle cx={spot.x} cy={spot.z} r={localMap?5.4:9.5} fill="#b9e1df" stroke="#294f43" strokeWidth={localMap?1.3:1.8}/>
   <text x={spot.x} y={spot.z+(localMap?2.7:4.6)} textAnchor="middle" fill="#294f43" fontSize={localMap?7.6:13} fontWeight="900" style={{stroke:'none'}}>F</text>
  </g>)}</g>
  {/* Island job boards (G-13, Sep 30 2026): one "J" per JOBS board on the full travel map only (the minimap stays uncluttered). Static, in the memoized terrain. */}
  {!localMap&&<g className="map-job-markers" pointerEvents="none">{JOB_MARKERS.map(job=><g key={job.id} aria-label={`${job.title} job`} data-job-marker={job.id}>
   <circle cx={job.x} cy={job.z} r="9.5" fill="#f4cc7c" stroke="#294f43" strokeWidth="1.8"/>
   <text x={job.x} y={job.z+4.6} textAnchor="middle" fill="#294f43" fontSize="13" fontWeight="900" style={{stroke:'none'}}>J</text>
  </g>)}</g>}
  <g aria-label="Rosa’s Market · Sell fish, produce and cards" data-market-marker="rosa" pointerEvents="none">
   <title>Rosa’s Market · Sell fish, produce and cards</title>
   <path d={`M${MARKET_STAND.x} ${MARKET_STAND.z}h-${localMap?13:24}`} stroke="#294f43" strokeWidth="1.2"/>
   <circle cx={MARKET_STAND.x} cy={MARKET_STAND.z} r={localMap?4:6} fill="#de9075" stroke="#294f43" strokeWidth="1.5"/>
   <rect x={MARKET_STAND.x-(localMap?87:126)} y={MARKET_STAND.z-(localMap?7:11)} width={localMap?74:102} height={localMap?14:22} rx="5" fill="#f4c2a4" stroke="#294f43" strokeWidth="1"/>
   <text x={MARKET_STAND.x-(localMap?50:75)} y={MARKET_STAND.z+(localMap?3:4)} textAnchor="middle" fill="#294f43" fontSize={localMap?8:11} fontWeight="800">ROSA’S MARKET</text>
  </g>
  {!localMap&&markerPosition&&<g aria-label="Your position" transform={`translate(${markerPosition.x} ${markerPosition.z})`}><circle r="14" fill="#7b4fd6" opacity=".28"/><circle r="9" fill="#7b4fd6" stroke="#fff7db" strokeWidth="2.5"/><circle r="3.2" fill="#fff7db"/></g>}
 </>,[roads,buildings,onSelect,markerPosition,localMap]);
 if(position)return <div className="island-overview local-overview" role="img" aria-label="Nearby streets and fields around your current position" style={{position:'relative',overflow:'hidden',background:'transparent'}}>
  <div ref={layer} className="minimap-layer" data-frame-driven={frames?'true':undefined} style={frames?{width:`${(w+16)/(radius*2)*100}%`,height:`${(h+16)/(radius*2)*100}%`,transition:'none'}:{width:`${(w+16)/(radius*2)*100}%`,height:`${(h+16)/(radius*2)*100}%`,transform:`translate(${(b.minX-8-position.x)/(w+16)*100}%, ${(b.minZ-8-position.z)/(h+16)*100}%)`,transitionDuration:jumped?'0ms':undefined}}>
   <svg viewBox={`${b.minX-8} ${b.minZ-8} ${w+16} ${h+16}`} width="100%" height="100%" aria-hidden="true"><g className="minimap-terrain">{terrain}</g></svg>
  </div>
  <svg className="minimap-player" viewBox={view} aria-hidden="true"><g aria-label="Your position"><circle cx={0} cy={0} r="4.5" fill="#314f43"/><circle cx={0} cy={0} r="3" fill="#fff0cf" stroke="#fff0cf" strokeWidth="1"/></g></svg>
 </div>;
 if(!mounted)return null;
 return <svg className="island-overview" viewBox={view} style={{background:'#83b5ac'}} role={onSelect?'group':'img'} aria-label="Island map with vending machines, fishing spots, Rosa’s Market, Arcade, Coaches Centre, football fields and Coral Cay">{terrain}</svg>;
}

export default memo(IslandOverview,(a,b)=>a.roads===b.roads&&a.buildings===b.buildings&&a.markerPosition===b.markerPosition&&a.onSelect===b.onSelect&&a.active===b.active&&a.frames===b.frames&&(b.active===false||a.position===b.position));
