// Coral Cay elevation PILOT (Nov 25 2026, owner: "raise up the grass and interior parts of the island more"). Behind the dev flag
// `?elev=1` (read once from the URL when this module loads in the browser); OFF by default, and then cayGround is 0 everywhere after one
// comparison, so today's island is unchanged.
//
// The beach stays at sea level. From the dune line (the lawn's edge, coralCay.ts CAY_LAWN) the ground rises in a soft dune
// band (DUNE.rise over DUNE.band metres, an S curve: level at the sand, steepest half way, level again on top), then climbs
// gently to the interior (INTERIOR.rise more over INTERIOR.reach metres) with a slow undulation so it never reads as a table top.
// Kept at sea level: the roundabout and its Konbini (the causeway's landfall: traffic nodes, the walk-in store's doors), the
// beach-soccer court and its sand (COURT_BEACH: a pitch stays flat), the Island Line and its station (the track keeps its
// height on the sand; the rise starts TRACK_CLEAR metres from the rail, so the line reads as running along the foot of the dune).
// Level pads (each at its own height) carry every building, the plaza and the farm's barn, so nothing stands on a slope.
// Along the boulevard the dune band is stretched to ROAD.band metres, so cars, scooters and bikes climb a gentle grade.
//
// Pure data (no three.js). The height is DEFINED by a 2 m grid (bilinear), sampled once from the analytic profile on the first
// query: the drawn lawn (coralCayWorld.ts), the walked height (venues.ts fieldSurfaceHeight) and every prop read this one function.
import {CAY_LAWN,CAY_CENTER,COURT_BEACH,ROUNDABOUT,CAY_KONBINI,CAY_BOULEVARD,CAY_PLAZA,CAY_HOUSES,CAY_HUTS,CAY_HUT_RADIUS,HOSTEL,CAY_HOMES,FARM,type CayPoint} from './coralCay';
import {TRACK} from './trainTrack';

export const DUNE={rise:1.35,band:10} as const;
export const INTERIOR={rise:1.15,reach:46} as const;
export const ROAD={band:26,half:9,blend:14} as const;
/** The rise starts this far from the rail's centre line / the flat areas' edges. */
export const TRACK_CLEAR=7.5,FLAT_CLEAR=2.5;
const UNDULATION=.16,PAD_BLEND=6,STEP=2;

let enabled=typeof window!=='undefined'&&/[?&]elev=1(&|$)/.test(window.location.search);
/** Dev flag (`?elev=1`). Tests call this directly (before anything asks for a height). */
export function setCayElevation(on:boolean){enabled=on;}
export const cayElevationOn=()=>enabled;

const smooth=(t:number)=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
function inside(poly:readonly CayPoint[],x:number,z:number){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)c=!c;}return c;}
function ringDistance(poly:readonly CayPoint[],x:number,z:number){let best=Infinity;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1)));best=Math.min(best,Math.hypot(x-a.x-t*dx,z-a.z-t*dz));}return best;}
const boxDistance=(x:number,z:number,b:{x:number;z:number;w:number;d:number})=>Math.hypot(Math.max(0,Math.abs(x-b.x)-b.w/2),Math.max(0,Math.abs(z-b.z)-b.d/2));

const lawnBox=(()=>{let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;for(const p of CAY_LAWN){minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minZ=Math.min(minZ,p.z);maxZ=Math.max(maxZ,p.z);}return {minX,maxX,minZ,maxZ};})();
/** Track samples near the lawn (the line runs along the cay's south and west beaches). */
const trackNear=(()=>{const out:number[]=[];for(let i=0;i<TRACK.n;i++){const x=TRACK.x[i],z=TRACK.z[i];if(x>lawnBox.minX-20&&x<lawnBox.maxX+20&&z>lawnBox.minZ-20&&z<lawnBox.maxZ+20)out.push(x,z);}return out;})();
function trackDistance(x:number,z:number){let best=Infinity;for(let i=0;i<trackNear.length;i+=2){const d=(trackNear[i]-x)**2+(trackNear[i+1]-z)**2;if(d<best)best=d;}return Math.sqrt(best);}

/** Level pads [x, z, w, d]: buildings (with a walk-round margin), the plaza, the farm's barn and stand. */
export const CAY_PADS:{x:number;z:number;w:number;d:number}[]=[
 ...CAY_HOUSES.map(([x,z,w,d])=>({x,z:z+1.5,w:w+3,d:d+6})),// + the shop front's pavement
 {x:CAY_PLAZA.x,z:CAY_PLAZA.z,w:CAY_PLAZA.w,d:CAY_PLAZA.d},
 {x:HOSTEL.x,z:HOSTEL.z+2,w:HOSTEL.w+3,d:HOSTEL.d+7},
 ...CAY_HOMES.map(h=>({x:h.x,z:h.z,w:9,d:8})),
 ...CAY_HUTS.map(h=>({x:h.x,z:h.z,w:CAY_HUT_RADIUS*2+1.5,d:CAY_HUT_RADIUS*2+1.5})),
 {x:FARM.barn.x,z:FARM.barn.z,w:FARM.barn.w+3,d:FARM.barn.d+3},{x:FARM.stand.x,z:FARM.stand.z,w:FARM.stand.w+2,d:FARM.stand.d+3},
 {x:(FARM.windmill.x+FARM.tank.x)/2,z:(FARM.windmill.z+FARM.tank.z)/2,w:9,d:5},
];

/** Metres into the raised ground: 0 on the beach and on everything kept at sea level. */
function depthIn(x:number,z:number){
 if(!inside(CAY_LAWN,x,z))return 0;
 let d=ringDistance(CAY_LAWN,x,z);
 d=Math.min(d,inside(COURT_BEACH,x,z)?0:ringDistance(COURT_BEACH,x,z)-FLAT_CLEAR);
 d=Math.min(d,Math.hypot(x-ROUNDABOUT.x,z-ROUNDABOUT.z)-ROUNDABOUT.walkOuter-FLAT_CLEAR);
 d=Math.min(d,boxDistance(x,z,{x:CAY_KONBINI.x,z:CAY_KONBINI.z,w:CAY_KONBINI.w,d:CAY_KONBINI.d+6})-FLAT_CLEAR);
 d=Math.min(d,trackDistance(x,z)-TRACK_CLEAR);
 return Math.max(0,d);
}
/** The analytic profile before the pads. */
function base(x:number,z:number){
 const d=depthIn(x,z);if(d<=0)return 0;
 // The boulevard climbs a stretched band (a gentle grade for traffic and rides).
 const onRoad=x<CAY_PLAZA.x?1-smooth((Math.abs(z-CAY_BOULEVARD.z)-ROAD.half)/ROAD.blend):0,band=DUNE.band+(ROAD.band-DUNE.band)*onRoad;
 const dune=DUNE.rise*smooth(d/band),top=smooth((d-band*.6)/INTERIOR.reach);
 const wave=UNDULATION*smooth((d-band)/12)*(Math.sin((x-CAY_CENTER.x)*.085+1.3)*Math.cos((z-CAY_CENTER.z)*.07-.4)+.5*Math.sin((x+z)*.13));
 return dune+INTERIOR.rise*top+wave;
}
/** Each pad's level: the lowest analytic ground under it (half way between its centre and its lowest corner, so a pad on the dune neither digs a pit nor makes a wall). */
let padLevels:number[]|null=null;
const padLevel=(i:number)=>(padLevels??=CAY_PADS.map(p=>{const c=base(p.x,p.z),low=Math.min(c,...[-1,1].flatMap(a=>[-1,1].map(b=>base(p.x+a*p.w/2,p.z+b*p.d/2))));return (c+low)/2;}))[i];
function raw(x:number,z:number){
 let h=base(x,z);if(h<=0)return 0;
 for(let i=0;i<CAY_PADS.length;i++){const d=boxDistance(x,z,CAY_PADS[i]);if(d<PAD_BLEND)h+=(padLevel(i)-h)*(1-smooth(d/PAD_BLEND));}
 return h;
}

type Grid={x0:number;z0:number;nx:number;nz:number;h:Float32Array;peak:number};
let grid:Grid|null=null;
function build():Grid{
 const x0=Math.floor(lawnBox.minX)-STEP,z0=Math.floor(lawnBox.minZ)-STEP,nx=Math.ceil((lawnBox.maxX-x0)/STEP)+2,nz=Math.ceil((lawnBox.maxZ-z0)/STEP)+2,h=new Float32Array(nx*nz);let peak=0;
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const v=raw(x0+i*STEP,z0+j*STEP);h[j*nx+i]=v;if(v>peak)peak=v;}
 return {x0,z0,nx,nz,h,peak};
}
/** Ground height on Coral Cay (m above the old flat ground). 0 with the flag off, on the beach, the court, the roundabout, the line. */
export function cayGround(x:number,z:number){
 if(!enabled||x<lawnBox.minX||x>lawnBox.maxX||z<lawnBox.minZ||z>lawnBox.maxZ)return 0;
 const g=grid??=build(),fx=(x-g.x0)/STEP,fz=(z-g.z0)/STEP,i=Math.floor(fx),j=Math.floor(fz);if(i<0||j<0||i>=g.nx-1||j>=g.nz-1)return 0;
 const tx=fx-i,tz=fz-j,o=j*g.nx+i,a=g.h[o],b=g.h[o+1],c=g.h[o+g.nx],d=g.h[o+g.nx+1];
 return (a+(b-a)*tx)*(1-tz)+(c+(d-c)*tx)*tz;
}
export function caySlope(x:number,z:number){const e=1;return Math.hypot(cayGround(x+e,z)-cayGround(x-e,z),cayGround(x,z+e)-cayGround(x,z-e))/(2*e);}
/** The highest ground (for the camera / flight envelope and the notes). 0 with the flag off. */
export const cayPeak=()=>enabled?(grid??=build()).peak:0;
export const CAY_ELEVATION_BOX=lawnBox;

/** Build-time lift (world.ts `put`): while Coral Cay's scenery is being built with the flag on, every piece is placed on the
 *  raised ground at its own spot, or at `anchor` (one height for a whole prop: a palm, a house, a table). `pieces` collects what
 *  was built, so the flat ground layers (paths, paving, soil) can be draped over the terrain afterwards (coralCayTerrain.ts). */
export const cayBuild:{active:boolean;anchor:number|null;pieces:{mesh:unknown;lift:number;anchored:boolean}[]}={active:false,anchor:null,pieces:[]};
export const cayBuildLift=(x:number,z:number)=>cayBuild.active?cayBuild.anchor??cayGround(x,z):0;
/** Run `build` with every piece it places standing at (x, z)'s ground height. */
export function cayAnchored<R>(x:number,z:number,build:()=>R):R{if(!cayBuild.active||cayBuild.anchor!==null)return build();cayBuild.anchor=cayGround(x,z);try{return build();}finally{cayBuild.anchor=null;}}
