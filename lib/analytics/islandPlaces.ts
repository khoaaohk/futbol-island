/**
 * World x/z → one fixed place id (islandIds.ts PLACES). Called by the island's analytics sample once every ~5 s, never per
 * frame: a few rectangle/circle tests in priority order, with the island's own land tests (shoreline, Coral Cay, East Jetty)
 * only where a box can't tell. Pure; the zones are drawn from the same constants the 3D world and the travel map use.
 */
import {VENUES} from '@/lib/town/venues';
import {ARCADE_DOOR} from '@/lib/town/venues';
import {MUSEUM_DOOR} from '@/lib/museum/museumDoors';
import {onIsland} from '@/lib/town/shoreline';
import {onLand} from '@/lib/town/landmass';
import {onCay,onCauseway,SANDBARS,BEACH_COURT,FARM,inHostelArea,SHARKS_BEACH,CAY_KONBINI} from '@/lib/town/coralCay';
import {EAST_PIER,jettyOffset} from '@/lib/town/eastPier';
import {onFerryBoarding} from '@/lib/town/ferryBoarding';
import {ISLAND_SQUARE_KONBINI} from '@/lib/town/vendingPlaces';
import type {PlaceId} from './islandIds';

type Box={x0:number;x1:number;z0:number;z1:number};
const inside=(b:Box,x:number,z:number)=>x>=b.x0&&x<=b.x1&&z>=b.z0&&z<=b.z1;
const near=(p:{x:number;z:number},r:number,x:number,z:number)=>(x-p.x)**2+(z-p.z)**2<=r*r;
const venueBox=(id:string,m:number):Box=>{const v=VENUES.find(v=>v.id===id)!;return {x0:v.x-v.width/2-m,x1:v.x+v.width/2+m,z0:v.z-v.length/2-m,z1:v.z+v.length/2+m};};

/** The zones, exported for tests/admin-analytics-places.cjs and the dashboard's map labels. */
export const ZONES={
 museumDoor:{x:MUSEUM_DOOR.x,z:MUSEUM_DOOR.front},
 arcadeDoor:ARCADE_DOOR,
 konbiniDoor:{x:ISLAND_SQUARE_KONBINI.x,z:ISLAND_SQUARE_KONBINI.front-2},
 cayKonbini:{x:CAY_KONBINI.x,z:CAY_KONBINI.front+2},
 boat:{x:282.5,z:-93.5},// the deep-sea boat's mooring (coralCay.ts CAY_LANDMARKS.deepSeaMooring)
 jettyBox:{x0:EAST_PIER.x0,x1:EAST_PIER.cx+EAST_PIER.r0+8,z0:EAST_PIER.cz-EAST_PIER.r0-8,z1:EAST_PIER.z+8} as Box,
 fields:{field_futsal:venueBox('futsal',6),field_7v7:venueBox('7v7',6),field_9v9:venueBox('9v9',6),field_11v11:venueBox('11v11',6)} as Record<string,Box>,
 beachCourt:{x0:BEACH_COURT.x-BEACH_COURT.length/2-8,x1:BEACH_COURT.x+BEACH_COURT.length/2+8,z0:BEACH_COURT.z-BEACH_COURT.width/2-22,z1:BEACH_COURT.z+BEACH_COURT.width/2+6} as Box,
 farm:{x0:Math.min(...FARM.fence.map(p=>p.x))-3,x1:Math.max(...FARM.fence.map(p=>p.x))+3,z0:Math.min(...FARM.fence.map(p=>p.z))-3,z1:Math.max(...FARM.fence.map(p=>p.z))+3} as Box,
 cayTown:{x0:505,x1:612,z0:-200,z1:-131} as Box,
 ferry:{x0:200,x1:254,z0:183,z1:230} as Box,
 communityHall:{x0:164,x1:200,z0:-196,z1:-158} as Box,
 coaches:{x0:139,x1:186,z0:-50,z1:-8} as Box,
 islandSquare:{x0:55,x1:122,z0:-56,z1:-14} as Box,
 librarySquare:{x0:55,x1:110,z0:-160,z1:-78} as Box,
 communityPark:{x0:-25,x1:45,z0:-55,z1:-34} as Box,
 oldTown:{x0:-75,x1:50,z0:-145,z1:-55} as Box,
 westSide:{x0:-110,x1:-25,z0:0,z1:125} as Box,
 palmCoast:{x0:-25,x1:75,z0:-34,z1:125} as Box,
 school:{x0:75,x1:210,z0:42,z1:178} as Box,
 southPier:{x0:30,x1:200,z0:178,z1:232} as Box,
 clubGrounds:{x0:100,x1:215,z0:-205,z1:-56} as Box,
 garden:[{x0:175,x1:212,z0:-42,z1:42},{x0:212,x1:246,z0:-42,z1:12}] as Box[],
 market:{x0:205,x1:250,z0:12,z1:183} as Box,
} as const;

/** Which named place a world position is in. Off land (open water, flying over the sea) is `sea`. */
export function placeAt(x:number,z:number):PlaceId{
 if(!Number.isFinite(x)||!Number.isFinite(z))return 'sea';
 const Z=ZONES;
 // Things that stand over the water first: the jetty, the boat, the sandbars and the causeway.
 if(inside(Z.jettyBox,x,z)&&jettyOffset(x,z)<=EAST_PIER.flankHalf+2)return 'east_jetty';
 if(near(Z.boat,24,x,z))return 'deep_sea_boat';
 if(x>228&&x<506){
  for(const s of SANDBARS)if(near(s,s.radius+6,x,z)||Math.abs(x-s.spur.x)<=s.spur.half+2&&z>=s.spur.z0&&z<=s.spur.z1)return 'sandbars';
  if(onCauseway(x,z))return 'causeway';
 }
 if(x>=490){
  if(!onCay(x,z))return onCauseway(x,z)?'causeway':'sea';
  if(near(Z.cayKonbini,11,x,z))return 'cay_konbini';
  if(inside(Z.beachCourt,x,z))return 'beach_court';
  if(inside(Z.farm,x,z))return 'farm';
  if(inHostelArea(x,z))return 'hostel';
  if(near(SHARKS_BEACH,34,x,z))return 'sharks_beach';
  if(inside(Z.cayTown,x,z))return 'cay_town';
  return 'coral_cay';
 }
 if(onFerryBoarding(x,z)||inside(Z.ferry,x,z)&&onLand(x,z))return 'ferry_dock';
 if(!onIsland(x,z))return onLand(x,z)?(x>228?'causeway':'town'):'sea';
 // Main island, most specific first.
 if(near(Z.museumDoor,14,x,z))return 'museum';
 if(near(Z.arcadeDoor,9,x,z))return 'arcade';
 if(near(Z.konbiniDoor,9,x,z))return 'konbini';
 for(const [id,b] of Object.entries(Z.fields))if(inside(b,x,z))return id as PlaceId;
 if(inside(Z.communityHall,x,z))return 'community_hall';
 if(inside(Z.coaches,x,z))return 'coaches';
 if(inside(Z.islandSquare,x,z))return 'island_square';
 if(z< -190)return 'north_beach';
 if(inside(Z.librarySquare,x,z))return 'library_square';
 if(inside(Z.communityPark,x,z))return 'community_park';
 if(inside(Z.oldTown,x,z))return 'old_town';
 if(inside(Z.westSide,x,z))return 'west_side';
 if(inside(Z.palmCoast,x,z))return 'palm_coast';
 if(inside(Z.southPier,x,z))return 'south_pier';
 if(inside(Z.school,x,z))return 'school';
 if(inside(Z.clubGrounds,x,z))return 'club_grounds';
 if(Z.garden.some(b=>inside(b,x,z)))return 'community_garden';
 if(inside(Z.market,x,z))return 'farmers_market';
 return 'town';
}
