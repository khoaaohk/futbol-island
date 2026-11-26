// The main island's WEST side (the stadium district) on a raised terrace: the second region of the island elevation system
// (elevation.ts). Owner, Nov 25 2026: "raise up the western side of the island where the stadium is so it's higher", then
// "higher and above the ground more". Registered here; world.ts draws it (westTerrain.ts: lawn patch, terrace top, retaining wall).
//
//  - THE TERRACE (WEST_TERRACE, one rounded rectangle, WEST.terrace m up, exactly level): the stadium bowl, its apron and ring
//    walk, a promenade on the west (over West station) and the top of Stadium Plaza. It is NOT read off the grid: inside its
//    outline the height is the constant, so its edge is a true vertical face: the RETAINING WALL, as tall as the terrace stands
//    above the natural ground at its foot (nothing where the ground reaches the terrace by itself: north, east, the park).
//  - THE NATURAL GROUND (the 2 m grid, smooth): 0 on every pin, rising to the terrace's level away from them:
//      the Island Line (WEST.clear m either side of the rail; it loops the district just inside the beach), West station and the
//      three beaches stay at today's height: a green embankment WEST.railBand m wide climbs from them;
//      the pond stays at its level in a hollow (a sunken garden): banks WEST.pondBand m wide round it, open to the south;
//      the town (x > WEST.town) is untouched: the whole east side is one long hillside (WEST.ramp m, about 7% with eased ends:
//      level across Stadium Plaza because it depends on x alone), so the plaza walks up from the town to the gate.
//  - STAIRS (WEST_STAIRS): straight flights through the wall, a ramp in the height function (the drawn treads sit on it).
import {INTERIOR_GRASS} from './shoreline';
import {TRACK} from './trainTrack';
import {PARK_POND,POND_RIM,pondQ} from './westParkLayout';
import {createRegion,registerRegion,elevationOn,smooth,insidePolygon,ringDistance,padDistance,boxDistance,type Pad,type Region} from './elevation';

export const WEST={terrace:4.2,clear:7.5,railBand:24,pondClear:1,pondBand:20,town:-60,ramp:60} as const;
/** The terrace's outline: the bowl's apron (x -277.5..-132.5, z -122.5..62.5) plus an 11.5 m promenade on the west, 4.5 m of
 *  verge north and east and 1 m on the south (the ring walk is a balcony over the pond). */
export const WEST_TERRACE:Pad={x:-208.5,z:-31.75,w:161,d:190.5,r:45};
const box={minX:-316,maxX:-58,minZ:-206,maxZ:130};
/** West station (the building x -303..-293, z -36..-20, its platform and forecourt, the stair's landing): pinned with the line. */
export const WEST_STATION_PIN={x:-299,z:-30,w:13,d:36};
const trackNear=(()=>{const out:number[]=[];for(let i=0;i<TRACK.n;i++){const x=TRACK.x[i],z=TRACK.z[i];if(x<box.maxX+30&&z>box.minZ-30&&z<box.maxZ+30)out.push(x,z);}return out;})();
function trackDistance(x:number,z:number){let best=Infinity;for(let i=0;i<trackNear.length;i+=2){const d=(trackNear[i]-x)**2+(trackNear[i+1]-z)**2;if(d<best)best=d;}return Math.sqrt(best);}
/** Metres outside the pond's stone rim (negative inside), along the radius. */
const pondDistance=(x:number,z:number)=>{const q=pondQ(x,z,POND_RIM);return (q-1)*Math.hypot(x-PARK_POND.x,z-PARK_POND.z)/Math.max(q,1e-6);};
/** A ramp's ease: constant grade with eased ends (peak 1.25 x the mean). */
const ease=(t:number)=>{const a=.2;t=Math.max(0,Math.min(1,t));return t<a?t*t/(2*a*(1-a)):t<1-a?(t-a/2)/(1-a):1-(1-t)*(1-t)/(2*a*(1-a));};
/** The ground beside (and, as a smooth extension, under) the terrace. */
function natural(x:number,z:number){
 if(x>=WEST.town||!insidePolygon(INTERIOR_GRASS,x,z))return 0;
 const rail=Math.min(ringDistance(INTERIOR_GRASS,x,z),trackDistance(x,z)-WEST.clear,boxDistance(x,z,WEST_STATION_PIN));if(rail<=0)return 0;
 const pond=pondDistance(x,z)-WEST.pondClear;if(pond<=0)return 0;
 return WEST.terrace*smooth(rail/WEST.railBand)*smooth(pond/WEST.pondBand)*ease((WEST.town-x)/WEST.ramp);
}
const grid=createRegion({id:'west',box,depth:natural,profile:d=>d,capSlope:1});
/** A flight of stairs through the wall: from its top (x, z) down along (dx, dz), `w` wide, falling `slope` per metre until it meets
 *  the natural ground (at most `len` m). `inset`: the top stands this far INSIDE the terrace's edge (a notch cut into the
 *  terrace, its sides retained by the wall), so the foot lands short of whatever stands below. */
export type Stair={id:string;x:number;z:number;dx:number;dz:number;w:number;slope:number;len:number;inset:number};
const EDGE={west:WEST_TERRACE.x-WEST_TERRACE.w/2,south:WEST_TERRACE.z+WEST_TERRACE.d/2};
export const WEST_STAIRS:readonly Stair[]=[
 // West station: off the promenade where the west trail comes down, landing beside the station building's south end (the
 // building stands x -303..-293, z -36..-20; the stair's foot is at x -293.4).
 {id:'station',x:EDGE.west+4,z:-18.5,dx:-1,dz:0,w:9,slope:.5,len:9,inset:4},
 // The pond: off the ring walk's south edge down into the sunken garden.
 {id:'pond',x:-182,z:EDGE.south,dx:0,dz:1,w:5,slope:.42,len:10.5,inset:0},
];
/** Along / across a stair's axis. */
export const stairLocal=(s:Stair,x:number,z:number)=>{const ax=x-s.x,az=z-s.z;return {t:ax*s.dx+az*s.dz,a:-ax*s.dz+az*s.dx};};
const inNotch=(x:number,z:number)=>{for(const s of WEST_STAIRS){if(!s.inset)continue;const {t,a}=stairLocal(s,x,z);if(t>0&&t<=s.inset&&Math.abs(a)<s.w/2)return true;}return false;};
export const onWestTerrace=(x:number,z:number)=>padDistance(x,z,WEST_TERRACE)<=0&&!inNotch(x,z);
function stairHeight(x:number,z:number){let h=0;for(const s of WEST_STAIRS){const {t,a}=stairLocal(s,x,z);if(t<0||t>s.len||Math.abs(a)>s.w/2)continue;const v=WEST.terrace-s.slope*t;if(v>h)h=v;}return h;}
/** In a stair's footprint (+ margin)? Paving laid over the ground keeps under the treads there. */
export const onWestStair=(x:number,z:number,margin=0)=>WEST_STAIRS.some(s=>{const {t,a}=stairLocal(s,x,z);return t>-margin&&t<s.len+margin&&Math.abs(a)<s.w/2+margin&&stairHeight(x,z)>grid.ground(x,z)-.05;});
/** The natural ground alone (what the lawn patch draws; the wall's foot). */
export const westNatural=(x:number,z:number)=>grid.ground(x,z);
export function westGround(x:number,z:number){
 if(!elevationOn()||x<box.minX||x>box.maxX||z<box.minZ||z>box.maxZ)return 0;
 if(onWestTerrace(x,z))return WEST.terrace;
 const g=grid.ground(x,z),s=stairHeight(x,z);return s>g?s:g;
}
export const WEST_BOX=box;
export const WEST_REGION:Region=registerRegion({...grid,ground:westGround,slope:(x,z)=>Math.hypot(westGround(x+1,z)-westGround(x-1,z),westGround(x,z+1)-westGround(x,z-1))/2,peak:()=>elevationOn()?WEST.terrace:0});
/** The stadium's base: every absolute height in the bowl (stands, roofs, rails, lights, the pitch) stands this much higher. */
export const STADIUM_BASE=elevationOn()?WEST.terrace:0;
/** The terrace's outline as a closed polyline, one point about every `step` m, clockwise seen from above (x east, z south). */
/** The terrace's outline as a closed polyline (arcs every `step` m; the straights are single edges), clockwise seen from above
 *  (x east, z south: the outside is on the right of travel), with each inset stair's notch cut in. */
export function terraceOutline(step=1){const {x,z,w,d}=WEST_TERRACE,r=WEST_TERRACE.r??0,a=w/2-r,b=d/2-r,n=Math.max(4,Math.ceil(Math.PI/2*r/step)),pts:{x:number;z:number}[]=[];
 for(const [cx,cz,a0] of [[a,b,0],[-a,b,Math.PI/2],[-a,-b,Math.PI],[a,-b,Math.PI*1.5]] as const)for(let i=0;i<=n;i++){const t=a0+i/n*Math.PI/2;pts.push({x:x+cx+Math.cos(t)*r,z:z+cz+Math.sin(t)*r});}
 for(const s of WEST_STAIRS){if(!s.inset)continue;const mx=s.x+s.dx*s.inset,mz=s.z+s.dz*s.inset;
  for(let i=0;i<pts.length;i++){const p=pts[i],q=pts[(i+1)%pts.length],ex=q.x-p.x,ez=q.z-p.z,l=Math.hypot(ex,ez),u=((mx-p.x)*ex+(mz-p.z)*ez)/(l*l);if(l<s.w||u<0||u>1||Math.hypot(p.x+ex*u-mx,p.z+ez*u-mz)>.01)continue;
   const tx=ex/l,tz=ez/l,h=s.w/2;pts.splice(i+1,0,{x:mx-tx*h,z:mz-tz*h},{x:s.x-tx*h,z:s.z-tz*h},{x:s.x+tx*h,z:s.z+tz*h},{x:mx+tx*h,z:mz+tz*h});break;}}
 return pts;}
