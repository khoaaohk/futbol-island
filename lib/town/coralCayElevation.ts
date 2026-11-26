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
import {TRACK} from './trainTrack';
import {createRegion,registerRegion,smooth,insidePolygon,ringDistance,boxDistance,type Pad} from './elevation';

export const DUNE={rise:1.7,band:12} as const;
export const INTERIOR={rise:1.3,reach:46} as const;
export const ROAD={band:30,half:9,blend:14} as const;
/** The rise starts this far from the rail's centre line / the pinned areas' edges. */
export const TRACK_CLEAR=7.5,FLAT_CLEAR=2.5;
const UNDULATION=.18;

const lawnBox=(()=>{let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;for(const p of CAY_LAWN){minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minZ=Math.min(minZ,p.z);maxZ=Math.max(maxZ,p.z);}return {minX,maxX,minZ,maxZ};})();
/** Track samples near the lawn (the line runs along the cay's south and west beaches). */
const trackNear=(()=>{const out:number[]=[];for(let i=0;i<TRACK.n;i++){const x=TRACK.x[i],z=TRACK.z[i];if(x>lawnBox.minX-20&&x<lawnBox.maxX+20&&z>lawnBox.minZ-20&&z<lawnBox.maxZ+20)out.push(x,z);}return out;})();
function trackDistance(x:number,z:number){let best=Infinity;for(let i=0;i<trackNear.length;i+=2){const d=(trackNear[i]-x)**2+(trackNear[i+1]-z)**2;if(d<best)best=d;}return Math.sqrt(best);}

/** Terraces [x, z, w, d]: buildings (with a walk-round margin), the plaza, the farm's barn, stand and windmill. */
export const CAY_PADS:Pad[]=[
 ...CAY_HOUSES.map(([x,z,w,d])=>({x,z:z+.25,w:w+1,d:d+1.5})),// stepped up the rising boulevard
 {x:CAY_PLAZA.x,z:CAY_PLAZA.z,w:CAY_PLAZA.w,d:CAY_PLAZA.d},
 {x:HOSTEL.x,z:HOSTEL.z+2,w:HOSTEL.w+3,d:HOSTEL.d+7},
 ...CAY_HOMES.map(h=>({x:h.x,z:h.z,w:9,d:8})),
 ...CAY_HUTS.map(h=>({x:h.x,z:h.z,w:CAY_HUT_RADIUS*2+1.5,d:CAY_HUT_RADIUS*2+1.5})),
 {x:FARM.barn.x,z:FARM.barn.z,w:FARM.barn.w+3,d:FARM.barn.d+3},{x:FARM.stand.x,z:FARM.stand.z,w:FARM.stand.w+2,d:FARM.stand.d+3},
 {x:(FARM.windmill.x+FARM.tank.x)/2,z:(FARM.windmill.z+FARM.tank.z)/2,w:9,d:5},
];
/** Metres into the raised ground: 0 on the beach and on everything pinned at sea level. */
function depth(x:number,z:number){
 if(!insidePolygon(CAY_LAWN,x,z))return 0;
 let d=ringDistance(CAY_LAWN,x,z);
 d=Math.min(d,insidePolygon(COURT_BEACH,x,z)?0:ringDistance(COURT_BEACH,x,z)-FLAT_CLEAR);
 d=Math.min(d,Math.hypot(x-ROUNDABOUT.x,z-ROUNDABOUT.z)-ROUNDABOUT.walkOuter-FLAT_CLEAR);
 d=Math.min(d,boxDistance(x,z,{x:CAY_KONBINI.x,z:CAY_KONBINI.z,w:CAY_KONBINI.w,d:CAY_KONBINI.d+6})-FLAT_CLEAR);
 d=Math.min(d,trackDistance(x,z)-TRACK_CLEAR);
 return Math.max(0,d);
}
function profile(d:number,x:number,z:number){
 const onRoad=x<CAY_PLAZA.x?1-smooth((Math.abs(z-CAY_BOULEVARD.z)-ROAD.half)/ROAD.blend):0,band=DUNE.band+(ROAD.band-DUNE.band)*onRoad;
 const wave=UNDULATION*smooth((d-band)/12)*(Math.sin((x-CAY_CENTER.x)*.085+1.3)*Math.cos((z-CAY_CENTER.z)*.07-.4)+.5*Math.sin((x+z)*.13));
 return DUNE.rise*smooth(d/band)+INTERIOR.rise*smooth((d-band*.6)/INTERIOR.reach)+wave;
}
export const CAY_REGION=registerRegion(createRegion({id:'coral-cay',box:lawnBox,depth,profile,pads:CAY_PADS,padBlend:6,
 ribbons:[{path:[{x:WELCOME_ARCH.x-6,z:CAY_BOULEVARD.z},{x:CAY_PLAZA.x-CAY_PLAZA.w/2,z:CAY_BOULEVARD.z}],half:7,blend:4}]}));
/** Ground height on Coral Cay (m above the old flat ground). 0 with the flag off, on the beach, the court, the roundabout, the line. */
export const cayGround=CAY_REGION.ground;
export const caySlope=CAY_REGION.slope;
export const cayPeak=CAY_REGION.peak;
export const CAY_ELEVATION_BOX=lawnBox;
