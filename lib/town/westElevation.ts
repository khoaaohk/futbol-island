// The main island's WEST side (the stadium district) on a terrace: the second region of the island elevation system
// (elevation.ts). DEFINED and tested here (tests/elevation.cjs), NOT YET REGISTERED: nothing reads it until the drawn side is
// built (see .claude/worktrees/_recovery-nov20/elevation/NOTE.md, WEST PLAN, step 1: call registerRegion(WEST_REGION) there).
//
// Profile (owner, Nov 25 2026: "raise up the western side of the island where the stadium is so it's higher"):
//  - The Island Line loops round the district just inside the beach (north z -205, west x -305, south z 126). It is PINNED: the
//    rails, West station and the three beaches stay at today's height, and the ground rises WEST.clear metres inside the rail,
//    so from the beach and the train the district stands on a green embankment (BANK.rise over BANK.band metres).
//  - The stadium bowl, its ring walk and apron and the west two thirds of Stadium Plaza are ONE terrace at WEST.terrace metres
//    (the pitch stays flat: give STADIUM_VENUE `elevation` this level). Beyond the bank the park climbs gently to it.
//  - Stadium Plaza's east end is a RIBBON (level across its 44 m, graded along): the walk-up from the town at 0 (x WEST.town).
//  - The pond stays where it is, in a hollow (pinned with its rim): its water, depth and swimming code keep their heights.
import {INTERIOR_GRASS} from './shoreline';
import {TRACK} from './trainTrack';
import {STADIUM_PLAZA,BOWL_RING,PARK_POND} from './westParkLayout';
import {createRegion,smooth,insidePolygon,ringDistance,type Pad} from './elevation';

export const WEST={terrace:2.7/* the most the pins allow: the bowl's south-west corner is 16 m from the rail (higher needs a retaining wall there) */,clear:7.5,town:-58,pondClear:1} as const;
export const BANK={rise:2.2,band:16} as const;
const CLIMB={rise:.5,reach:60} as const;// the park settles at the terrace's level (2.7 m), so the bowl is the high ground
const box={minX:-316,maxX:WEST.town,minZ:-206,maxZ:130};
const trackNear=(()=>{const out:number[]=[];for(let i=0;i<TRACK.n;i++){const x=TRACK.x[i],z=TRACK.z[i];if(x<box.maxX+30&&z>box.minZ-30&&z<box.maxZ+30)out.push(x,z);}return out;})();
function trackDistance(x:number,z:number){let best=Infinity;for(let i=0;i<trackNear.length;i+=2){const d=(trackNear[i]-x)**2+(trackNear[i+1]-z)**2;if(d<best)best=d;}return Math.sqrt(best);}
const pondDistance=(x:number,z:number)=>(Math.hypot((x-PARK_POND.x)/PARK_POND.rx,(z-PARK_POND.z)/PARK_POND.rz)-1.12)*Math.min(PARK_POND.rx,PARK_POND.rz);
function depth(x:number,z:number){
 if(x>=WEST.town||!insidePolygon(INTERIOR_GRASS,x,z))return 0;
 return Math.max(0,Math.min(ringDistance(INTERIOR_GRASS,x,z),trackDistance(x,z)-WEST.clear,WEST.town-x,pondDistance(x,z)-WEST.pondClear));
}
const profile=(d:number)=>BANK.rise*smooth(d/BANK.band)+CLIMB.rise*smooth((d-BANK.band*.6)/CLIMB.reach);
const plazaSplit=STADIUM_PLAZA.minX+(STADIUM_PLAZA.maxX-STADIUM_PLAZA.minX)*.45,plazaZ=(STADIUM_PLAZA.minZ+STADIUM_PLAZA.maxZ)/2,plazaD=STADIUM_PLAZA.maxZ-STADIUM_PLAZA.minZ;
export const WEST_PADS:Pad[]=[
 // The bowl and its ring walk (not the whole apron: its south edge is 2 m from the pond's rim; see NOTE.md, WEST PLAN, the pond).
 {x:BOWL_RING.x,z:BOWL_RING.z,w:BOWL_RING.w,d:BOWL_RING.d,r:BOWL_RING.r,level:WEST.terrace},
 {x:(STADIUM_PLAZA.minX-4+plazaSplit)/2,z:plazaZ,w:plazaSplit-STADIUM_PLAZA.minX+4,d:plazaD,level:WEST.terrace},
];
/** Not registered yet (see the header): `WEST_REGION.ground` is the height the west side WILL have. */
export const WEST_REGION=createRegion({id:'west',box,depth,profile,pads:WEST_PADS,padBlend:10,capSlope:.4,/* the bowl's south-west corner is 16 m from the rail: a 22 degree embankment there */
 ribbons:[{path:[{x:plazaSplit,z:plazaZ},{x:WEST.town,z:plazaZ}],half:plazaD/2,blend:8}]});
