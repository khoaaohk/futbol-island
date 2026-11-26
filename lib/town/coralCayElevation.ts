// Coral Cay's raised interior (Nov 25 2026, owner: "raise up the grass and interior parts of the island more"): the first
// region of the island elevation system (elevation.ts: read that header first). Behind `?elev=1`.
//
// The beach stays at sea level. From the dune line (the lawn's edge, CAY_LAWN) the ground rises in a soft dune band (DUNE.rise
// over DUNE.band metres, an S curve: level at the sand, steepest half way, level on top), then climbs gently to the interior
// (INTERIOR.rise more over INTERIOR.reach metres) with a slow undulation, so it never reads as a table top.
// PINNED at sea level: the roundabout and its Konbini (the causeway's landfall: traffic nodes, the walk-in store's doors), the
// beach-soccer court and its sand (a pitch stays flat), the Island Line and its station (the track keeps its height: the rise
// starts TRACK_CLEAR metres from the rail, so the line runs along the foot of the dune like a shallow cutting).
// TERRACES (pads): every building (the three shops step up the rising boulevard, a short grass bank between them), the plaza, the farm's barn, stand and windmill. RIBBON: the boulevard (level across, a
// stretched ROAD.band so cars, scooters and bikes climb about a 7% grade).
import {CAY_LAWN,CAY_CENTER,COURT_BEACH,ROUNDABOUT,CAY_KONBINI,CAY_BOULEVARD,CAY_PLAZA,CAY_HOUSES,CAY_HUTS,CAY_HUT_RADIUS,HOSTEL,CAY_HOMES,FARM,WELCOME_ARCH} from './coralCay';
import {TRACK,TRAIN_STATIONS,trackAt} from './trainTrack';
import {createRegion,registerRegion,smooth,insidePolygon,ringDistance,boxDistance,type Pad} from './elevation';

// Nov 26 2026 (owner: "raise up the grass and interior parts of the island more"; stage 1's 1.7 + 1.3 m read mostly through shading
// from the ~32 degree play camera): about twice the height. The band is wider so the open bank is no steeper than before.
export const DUNE={rise:3.1,band:15} as const;
export const INTERIOR={rise:.6,reach:46} as const;
/** The plaza's terrace (the boulevard climbs to it; the Guesthouse shares it) and the Surf Shop's, half way up. The shops are
 *  5 m apart, so the grass banks between their terraces are short and steep (retaining banks, not walks). */
export const PLAZA_LEVEL=3.6,SURF_LEVEL=1.95;
/** The knoll east of the plaza (the island's top: the plaza-to-court path climbs over it). */
export const KNOLL={x:622,z:-160,r:30,rise:1.7} as const;
export const ROAD={band:36,half:9,blend:14,ease:.3} as const;
/** The hostel green: the hostel, three cottages and the two paths between them stand on ONE terrace. (Per-cottage pads 3 m apart at
 *  different heights tipped the 2.2 m paths between them sideways: the walked grid is 2 m, so a terrace step needs ~4 m of bank.)
 *  The rail passes 12 m west and north of it, so the green is the cay's low terrace; the cottage in the rail's corner (index 2)
 *  stands lower still, a short bank behind it, and the bungalow above the green (index 4) a step up toward the plaza. */
export const HOSTEL_GREEN={x:569.25,z:-106.5,w:29.5,d:17} as const,GREEN_LEVEL=1.4;
const HOME_LEVELS:(number|undefined)[]=[GREEN_LEVEL,GREEN_LEVEL,.55,GREEN_LEVEL,3,undefined];
/** The rise starts this far from the rail's centre line / the pinned areas' edges. */
export const TRACK_CLEAR=6.5,FLAT_CLEAR=2.5;
/** The lawn's own verge: the first metres of grass behind the beach stay level (the drawn lawn's ear-cut rim: coralCayTerrain.ts). */
export const EDGE_CLEAR=3;
const UNDULATION=.3;
/** Pins win (elevation.ts): no ground stands higher than this x its distance to pinned ground (the hostel is 12 m from the west rail). */
export const CAP_SLOPE=.42;

const lawnBox=(()=>{let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;for(const p of CAY_LAWN){minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minZ=Math.min(minZ,p.z);maxZ=Math.max(maxZ,p.z);}return {minX,maxX,minZ,maxZ};})();
/** Track samples near the lawn (the line runs along the cay's south and west beaches). */
const trackNear=(()=>{const out:number[]=[];for(let i=0;i<TRACK.n;i++){const x=TRACK.x[i],z=TRACK.z[i];if(x>lawnBox.minX-20&&x<lawnBox.maxX+20&&z>lawnBox.minZ-20&&z<lawnBox.maxZ+20)out.push(x,z);}return out;})();
function trackDistance(x:number,z:number){let best=Infinity;for(let i=0;i<trackNear.length;i+=2){const d=(trackNear[i]-x)**2+(trackNear[i+1]-z)**2;if(d<best)best=d;}return Math.sqrt(best);}

/** Coral Cay station's house stands behind the platform, 5.5 to 10 m from the rail: past the rail's own clearance, so it is pinned
 *  by its footprint (the lawn rises behind it, never under its floor). */
export const CAY_STATION_HOUSE=(()=>{const st=TRAIN_STATIONS.find(s=>s.id==='cay');if(!st)return null;const p=trackAt(st.s),at=(k:number)=>({x:p.x+p.tz*k,z:p.z-p.tx*k}),a=at(7.75),b=at(-7.75),c=insidePolygon(CAY_LAWN,a.x,a.z)?a:b;
 return {x:c.x,z:c.z,w:9.2*Math.abs(p.tx)+5.4*Math.abs(p.tz),d:9.2*Math.abs(p.tz)+5.4*Math.abs(p.tx)};})();
/** Terraces [x, z, w, d]: buildings (with a walk-round margin), the plaza, the farm's barn, stand and windmill. */
export const CAY_PADS:Pad[]=[
 ...CAY_HOUSES.map(([x,z,w,d],i)=>({x,z:z+.25,w:w+1,d:d+1.5,...(i?{level:i===1?SURF_LEVEL:PLAZA_LEVEL}:{})})),// stepped up the rising boulevard (the café stands at the roundabout's level)
 {x:CAY_PLAZA.x,z:CAY_PLAZA.z,w:CAY_PLAZA.w,d:CAY_PLAZA.d,level:PLAZA_LEVEL},
 {x:HOSTEL.x,z:HOSTEL.z+2,w:HOSTEL.w+1.5,d:HOSTEL.d+7,level:GREEN_LEVEL},
 // A cottage's footprint: 5.4 x 4.6 m and a porch on its +z side.
 ...CAY_HOMES.map((h,i)=>({x:h.x,z:h.z+.65,w:6.4,d:6.5,...(HOME_LEVELS[i]===undefined?{}:{level:HOME_LEVELS[i]})})),
 {...HOSTEL_GREEN,level:GREEN_LEVEL},
 ...CAY_HUTS.map(h=>({x:h.x,z:h.z,w:CAY_HUT_RADIUS*2+1.5,d:CAY_HUT_RADIUS*2+1.5})),
 {x:FARM.barn.x,z:FARM.barn.z,w:FARM.barn.w+3,d:FARM.barn.d+3},{x:FARM.stand.x,z:FARM.stand.z,w:FARM.stand.w+2,d:FARM.stand.d+3},
 {x:(FARM.windmill.x+FARM.tank.x)/2,z:(FARM.windmill.z+FARM.tank.z)/2,w:9,d:5},
];
/** Metres into the raised ground: 0 on the beach and on everything pinned at sea level. */
function depth(x:number,z:number){
 if(!insidePolygon(CAY_LAWN,x,z))return 0;
 let d=ringDistance(CAY_LAWN,x,z)-EDGE_CLEAR;
 d=Math.min(d,insidePolygon(COURT_BEACH,x,z)?0:ringDistance(COURT_BEACH,x,z)-FLAT_CLEAR);
 d=Math.min(d,Math.hypot(x-ROUNDABOUT.x,z-ROUNDABOUT.z)-ROUNDABOUT.walkOuter-FLAT_CLEAR);
 d=Math.min(d,boxDistance(x,z,{x:CAY_KONBINI.x,z:CAY_KONBINI.z,w:CAY_KONBINI.w,d:CAY_KONBINI.d+6})-FLAT_CLEAR);
 d=Math.min(d,trackDistance(x,z)-TRACK_CLEAR);
 if(CAY_STATION_HOUSE)d=Math.min(d,boxDistance(x,z,CAY_STATION_HOUSE)-FLAT_CLEAR);
 return Math.max(0,d);
}
function profile(d:number,x:number,z:number){
 // The boulevard (west of the plaza): close to a straight ramp from the roundabout to the plaza's terrace (ROAD.ease of an S curve
 // on a straight line), so its steepest grade stays near the mean; the dune beside it blends into that ramp over ROAD.blend.
 const onRoad=x<CAY_PLAZA.x?1-smooth((Math.abs(z-CAY_BOULEVARD.z)-ROAD.half)/ROAD.blend):0;
 const wave=UNDULATION*smooth((d-DUNE.band)/12)*(Math.sin((x-CAY_CENTER.x)*.085+1.3)*Math.cos((z-CAY_CENTER.z)*.07-.4)+.5*Math.sin((x+z)*.13));
 const foot=smooth(d/DUNE.band),knoll=KNOLL.rise*smooth(1-Math.hypot(x-KNOLL.x,z-KNOLL.z)/KNOLL.r);
 const open=DUNE.rise*foot+INTERIOR.rise*smooth((d-DUNE.band*.6)/INTERIOR.reach)+knoll*foot+wave;
 if(onRoad<=0)return open;
 const t=Math.max(0,Math.min(1,d/ROAD.band)),ramp=PLAZA_LEVEL*(t+(smooth(t)-t)*ROAD.ease);
 return open+(ramp-open)*onRoad;
}
export const CAY_REGION=registerRegion(createRegion({id:'coral-cay',box:lawnBox,depth,profile,pads:CAY_PADS,padBlend:8,capSlope:CAP_SLOPE,
 ribbons:[{path:[{x:WELCOME_ARCH.x-6,z:CAY_BOULEVARD.z},{x:CAY_PLAZA.x-CAY_PLAZA.w/2,z:CAY_BOULEVARD.z}],half:7,blend:4}]}));
/** Ground height on Coral Cay (m above the old flat ground). 0 with the flag off, on the beach, the court, the roundabout, the line. */
export const cayGround=CAY_REGION.ground;
export const caySlope=CAY_REGION.slope;
export const cayPeak=CAY_REGION.peak;
export const CAY_ELEVATION_BOX=lawnBox;
