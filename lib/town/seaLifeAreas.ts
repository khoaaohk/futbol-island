// Sea life per water area (Oct 20 2026, user: "add more whale in the bigger water areas. also add rays to balance the different
// areas out"). Pure data (no three.js, no DOM): the island's water areas (id, centre, radius, big or not), the open-sea whale sharks'
// slow loops, the open-sea rays' lazy loops (manta, eagle and sting rays), the heat caps, and a per-area species table built from
// EVERY sea-life loop in the game (Coral Cay's causeway sharks and mantas, Summit Isle's sharks, mantas and whale shark, these new
// ones, and the fishing spots). getSeaLifeAreas() is the one getter other systems (dive zones, the map) read.
//
// The 3D side reuses the existing builds: lib/graphics/openSeaLife.ts draws the whale sharks from ONE shared whaleShark.ts
// geometry/material and the rays as a second cayMantas.ts instance (one instanced mesh per area). Both are "island friends":
// the whale sharks and the open-sea mantas are ridable through animalRides.ts (same prompt, sound and dismount); eagle and sting
// rays only glide (they are small). tests/sea-life-areas.cjs checks every loop is in swimmable open water clear of land, floats,
// the jetty and the other animals, the caps, and that every big area has a whale and every area a ray or a whale.
//
// Placement notes: every loop sits 10–60 m from land (rays) / 20–60 m (whale sharks): the swim range is 60 m (waterDepth.ts
// SWIM_RANGE), so a swimmer can always reach them. South-east of Summit Isle (Oct 20 2026): its south-east shark patrol was
// trimmed (34–58° → 42–62°) to free a pocket between it, the Turtle Pool dive zone and the flyable edge for the humpback.
import {SHARK_LOOPS,type CayPoint} from './coralCay';
import {MANTA_LOOPS,type RayLoop} from './mantaLoops';
import {SUMMIT_SHARK_LOOPS,WHALE_SHARK_LOOP} from './summitSeaLife';
import {FISH_SPOTS} from './fishing/fishCatalog';
import type {HeatTier} from '../graphics/heatTier';

export type SeaAreaId='main-west'|'main-north'|'main-south'|'north-sea'|'causeway-channel'|'jetty-south'|'coral-cay'|'cay-east'|'summit-west'|'summit-isle';
export type SeaArea={readonly id:SeaAreaId;readonly name:string;readonly x:number;readonly z:number;readonly radius:number;
 /** A big open-water area: it always has a whale (a whale shark or the humpback). */readonly big:boolean};
/** The water areas. Membership is by the nearest centre (a loop's centroid), so every loop belongs to exactly one area; the radius
 *  is the area's rough reach (for the map / dive zones), not a hard edge. */
export const SEA_AREAS:readonly SeaArea[]=[
 {id:'main-west',name:'West Coast',x:-125,z:0,radius:150,big:true},
 {id:'main-north',name:'North Shore',x:60,z:-285,radius:130,big:true},
 {id:'main-south',name:'South Bay',x:60,z:262,radius:130,big:true},
 {id:'north-sea',name:'Open Sea north of the causeway',x:300,z:-275,radius:90,big:true},
 {id:'causeway-channel',name:'Causeway Channel',x:380,z:-160,radius:80,big:false},
 {id:'jetty-south',name:'South of the East Jetty',x:330,z:160,radius:100,big:true},
 {id:'coral-cay',name:'Coral Cay',x:612,z:-160,radius:170,big:false},
 {id:'cay-east',name:'East of Coral Cay',x:790,z:-210,radius:90,big:true},
 {id:'summit-west',name:'Summit Isle west',x:480,z:40,radius:90,big:false},
 {id:'summit-isle',name:'Summit Isle',x:690,z:170,radius:170,big:false},
];

/** A closed, smooth ellipse loop (n samples): centre, half-lengths and rotation (rad, from +x towards +z). */
export function ellipseLoop(cx:number,cz:number,rx:number,rz:number,rot:number,n=72):CayPoint[]{
 const c=Math.cos(rot),s=Math.sin(rot),out:CayPoint[]=[];
 for(let i=0;i<n;i++){const a=i/n*Math.PI*2,x=Math.cos(a)*rx,z=Math.sin(a)*rz;out.push({x:cx+x*c-z*s,z:cz+x*s+z*c});}
 return out;
}

export type WhaleKind='whale-shark'|'humpback';
export type OpenSeaWhaleLoop={readonly id:string;readonly area:SeaAreaId;readonly points:CayPoint[];readonly speed:number;readonly start:number;
 /** Which whale swims it (Oct 20 2026): a whale shark (whaleShark.ts) or the humpback (humpback.ts), both from the one kit. */readonly kind:WhaleKind};
const whale=(id:string,area:SeaAreaId,e:[number,number,number,number,number],speed:number,start:number,kind:WhaleKind='whale-shark'):OpenSeaWhaleLoop=>({id,area,points:ellipseLoop(...e,96),speed,start,kind});
/** The open-sea whales: one long, slow loop in each big area (South Bay's is the humpback) and the humpback off Summit's south-east (slower than Summit's .9 m/s whale shark and every shark). */
export const OPEN_SEA_WHALE_LOOPS:readonly OpenSeaWhaleLoop[]=[
 whale('whale-north-sea','north-sea',[235,-245,25,12,.8],.8,.1),
 whale('whale-main-north','main-north',[120,-280,32,12,0],.75,.6),
 whale('whale-main-west','main-west',[-130,-90,45,12,1.57],.8,.3),
 // Oct 20 2026: South Bay's whale is the humpback (a slow surface cruiser with a tail lift), on the whale shark's old loop.
 whale('humpback-main-south','main-south',[135,260,45,16,0],.7,.8,'humpback'),
 whale('whale-jetty-south','jetty-south',[275,165,40,9,1.57],.8,.45),
 whale('whale-cay-east','cay-east',[775,-195,38,6,1.2],.7,.2),
 // Summit Isle's south-east (Oct 20 2026): room made by trimming the south-east shark patrol (summitSeaLife.ts, 34–58° → 42–62°);
 // between the Turtle Pool dive zone, the patrol and the edge of the flyable sea.
 whale('humpback-summit-se','summit-isle',[828,240,18,6,2],.65,.3,'humpback'),
];

export type RaySpecies='manta'|'eagle'|'sting';
/** The ray kinds: size against a manta, a multiply tint on the shared slate palette (no texture), the loop speed, and whether it
 *  offers a ride (mantas only: the "Hang on" prompt, like the island mantas). */
export const RAY_SPECIES={
 manta:{name:'Manta ray',scale:1,tint:'#ffffff',speed:1.35,ridable:true},
 eagle:{name:'Spotted eagle ray',scale:.62,tint:'#9fb8d6',speed:1.5,ridable:false},
 sting:{name:'Southern stingray',scale:.5,tint:'#d9c49c',speed:1.05,ridable:false},
} as const;
/** The rays' football lines (Oct 20 2026; AGENTS.md: every feature teaches football): a toast the first time each ray kind is
 *  spotted in a visit (components/RayLessonToast.tsx; Town.tsx bumps waterStore.rayLesson). Coaching ideas,
 *  two per kind, alternating. */
export const RAY_LESSONS:Record<RaySpecies,readonly {title:string;text:string}[]>={
 manta:[{title:'Glide into space',text:'A manta glides to open water before it gets crowded. Move into space before the pass comes, and the ball finds you.'},
  {title:'Big and calm',text:'Mantas are huge but never rush. Stay calm on the ball and pick the simple pass.'}],
 eagle:[{title:'Pass into space',text:'An eagle ray glides to where it is going next. Pass into the space in front of your teammate, not to their feet.'},
  {title:'Fly down the wing',text:'Eagle rays sweep wide and fast. Wingers do that too: stay wide by the touchline and stretch the defence.'}],
 sting:[{title:'Stay low, stay ready',text:'A stingray rests flat on the sand, then shoots off fast. Keep your knees bent so you are ready to react.'},
  {title:'Wait, then pounce',text:'A stingray waits quietly under the sand. A clever striker drifts out of sight, then darts in at the last moment.'}],
};
export const RAY_LESSON_KIND='Coaching idea';
export const rayLessonFor=(species:RaySpecies,n:number)=>{const l=RAY_LESSONS[species];return l[Math.abs(n)%l.length];};
export type OpenSeaRayLoop=RayLoop&{readonly species:RaySpecies;readonly area:SeaAreaId};
const ray=(id:string,area:SeaAreaId,species:RaySpecies,e:[number,number,number,number,number]):OpenSeaRayLoop=>{const k=RAY_SPECIES[species];
 return {id,island:area,area,species,points:ellipseLoop(...e),speed:k.speed,scale:k.scale,tint:species==='manta'?undefined:k.tint,ridable:k.ridable};};
/** The open-sea rays, added where the sea was thin (see seaLifeInventory): each area gets its own mix. */
export const OPEN_SEA_RAY_LOOPS:readonly OpenSeaRayLoop[]=[
 ray('ray-west-sting','main-west','sting',[-130,80,22,10,1.57]),
 ray('ray-west-eagle','main-west','eagle',[-115,130,22,10,.4]),
 ray('ray-north-eagle','main-north','eagle',[-70,-260,22,10,2]),
 ray('ray-north-manta','main-north','manta',[-30,-265,22,10,2.4]),
 ray('ray-south-manta','main-south','manta',[15,240,22,10,.8]),
 ray('ray-south-sting','main-south','sting',[-5,190,22,10,1.57]),
 ray('ray-jetty-eagle','jetty-south','eagle',[320,130,22,10,0]),
 ray('ray-jetty-eagle-2','jetty-south','eagle',[370,130,22,10,2.4]),
 ray('ray-cay-east-manta','cay-east','manta',[705,-280,12,5,.8]),
 ray('ray-summit-west-sting','summit-west','sting',[470,85,22,10,2]),
 ray('ray-summit-west-sting-2','summit-west','sting',[575,-10,16,10,2]),
];
/** The areas that have open-sea rays, in a fixed order (one instanced mesh each). */
export const OPEN_SEA_RAY_GROUPS=SEA_AREAS.map(a=>({island:a.id as string,loops:OPEN_SEA_RAY_LOOPS.filter(l=>l.area===a.id) as RayLoop[]})).filter(g=>g.loops.length>0);

/** Hard caps (heat): whale sharks DRAWN at once (the nearest; the rest hidden), and rays kept per area, by heat tier. Static
 *  ambience (tiers 3–4) freezes whatever stays anyway. Never more than MAX_RAYS_PER_AREA rays in one area. */
export const MAX_WHALES_DRAWN=2,MAX_RAYS_PER_AREA=3;
export function openSeaCounts(tier:HeatTier,phone:boolean){
 if(tier===0)return {whales:phone?1:MAX_WHALES_DRAWN,raysPerArea:phone?2:MAX_RAYS_PER_AREA};
 if(tier<=2)return {whales:1,raysPerArea:2};
 if(tier===3)return {whales:1,raysPerArea:1};
 return {whales:1,raysPerArea:0};
}
/** Distances (m): animals beyond FAR_UPDATE from the player step at FAR_HZ (their own sleep at 140 m / hiding at 220–260 m stands);
 *  a ray within RAY_SPOT_RANGE of a swimmer counts as "spotted" once per ray per visit. */
export const FAR_UPDATE=60,FAR_HZ=15,RAY_SPOT_RANGE=16;

export type SpeciesCounts={sharks:number;whaleSharks:number;humpbacks:number;mantas:number;eagleRays:number;stingrays:number;fishSpots:number};
export type SeaAreaLife=SeaArea&{readonly species:SpeciesCounts};
const centroid=(pts:readonly CayPoint[])=>{let x=0,z=0;for(const p of pts){x+=p.x;z+=p.z;}return {x:x/pts.length,z:z/pts.length};};
/** The area a point belongs to (nearest centre). */
export function seaAreaAt(x:number,z:number):SeaArea{
 let best=SEA_AREAS[0],bd=Infinity;for(const a of SEA_AREAS){const d=Math.hypot(a.x-x,a.z-z);if(d<bd){bd=d;best=a;}}return best;
}
/** The per-area species table. `withOpenSea` false gives the sea before the Oct 20 2026 additions (the report's "before"). */
export function seaLifeInventory(withOpenSea=true):SeaAreaLife[]{
 const rows=new Map(SEA_AREAS.map(a=>[a.id,{...a,species:{sharks:0,whaleSharks:0,humpbacks:0,mantas:0,eagleRays:0,stingrays:0,fishSpots:0}}]));
 const add=(pts:readonly CayPoint[],k:keyof SpeciesCounts)=>{const c=centroid(pts);rows.get(seaAreaAt(c.x,c.z).id)!.species[k]++;};
 for(const l of [...SHARK_LOOPS,...SUMMIT_SHARK_LOOPS])add(l.points,'sharks');
 for(const l of MANTA_LOOPS)add(l.points,'mantas');
 add(WHALE_SHARK_LOOP.points,'whaleSharks');
 for(const f of FISH_SPOTS)add([f.buoy],'fishSpots');
 if(withOpenSea){
  for(const l of OPEN_SEA_WHALE_LOOPS)add(l.points,l.kind==='humpback'?'humpbacks':'whaleSharks');
  for(const l of OPEN_SEA_RAY_LOOPS)add(l.points,l.species==='manta'?'mantas':l.species==='eagle'?'eagleRays':'stingrays');
 }
 return [...rows.values()];
}
let cached:readonly SeaAreaLife[]|null=null;
/** The one getter (dive zones, the map, tests): every water area with its species counts. Built once. */
export function getSeaLifeAreas():readonly SeaAreaLife[]{return cached??=seaLifeInventory(true);}
