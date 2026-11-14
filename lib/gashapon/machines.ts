/**
 * Gashapon capsule-toy machines (owner request, Nov 8 2026; docs/gashapon-design.md). Pure data, no React and no three.js.
 *
 * Eighteen machines: fourteen with their own six toys (lib/gashapon/toys.ts), and (Nov 13 2026) four at the DRIP FC Stadium that
 * sell four of those sets (`set`):
 *  - 4 at the two Konbinis: a pair outside each, flush against the shopfront on the side OPPOSITE the vending + drink pair,
 *    i.e. the vending machine's spot mirrored across the sliding doors' centre line (`gashaponPairOpposite`), never fixed
 *    coordinates, so they follow the store the same way lib/town/drinkMachines.ts `drinkSpotBeside` does;
 *  - 2 inside the Arcade room (room coordinates, its own scene: lib/arcade/arcadeRoomScene.ts), against the back wall between
 *    the Island Strikers and Breakaway Run cabinets;
 *  - 8 outdoors at spread-out spots (west beach, North Beach, Eleven Park, Old Town Ground, the East Jetty lighthouse plaza,
 *    the Coral Cay plaza, Sharks Beach, the Summit Isle lookout). The coordinates were searched against the town the game
 *    builds (lib/town/world.ts buildTown) and tests/gashapon-data.cjs re-checks them: on land, clear of every building and
 *    collider, off roads, narrow walk paths, gardens, courts and pitches, ≥ 4.5 m from every vending machine.
 * Facing: outdoor machines face the island camera (VENDING_YAW, like most vending machines); the Konbini pairs face out of the
 * shop (yaw 0, +z); the arcade pair faces into the room (yaw 0).
 */
import {konbiniMachineSpot,summitSnackSpot,ISLAND_SQUARE_KONBINI,KONBINI_FACADE_PROUD,KONBINI_BACK_GAP} from '../town/vendingPlaces';
import {CAY_KONBINI,CAY_KONBINI_DOOR} from '../town/coralCay';
import {summitGround} from '../town/summitIsle';
import {STADIUM_SHOP_X,STADIUM_SHOP_YAW,STADIUM_SHOP_GAP,STADIUM_VENDING_HALF,stadiumShopZ} from '../town/stadiumShops';

export type GashaponMachineId=
 |'gs-square-snacks'|'gs-square-lucky'|'gs-cay-sweets'|'gs-cay-bento'
 |'gs-arcade-heroes'|'gs-arcade-pixel'
 |'gs-westbeach'|'gs-northbeach'|'gs-eleven'|'gs-oldtown'|'gs-jetty'|'gs-cayplaza'|'gs-sharks'|'gs-summit'
 |'gs-stadium-boots'|'gs-stadium-trophies'|'gs-stadium-pixel'|'gs-stadium-beach';
export type GashaponZone='konbini-square'|'konbini-cay'|'arcade'|'outdoor'|'stadium';
export type GashaponMachine={id:GashaponMachineId;name:string;theme:string;zone:GashaponZone;place:string;
 /** World metres (arcade: room metres). y is the ground the cabinet stands on. */
 x:number;z:number;y:number;yaw:number;
 /** Cabinet colours for the shared instanced mesh (instance colour only, no new materials). */
 color:string;accent:string;
 /** Nov 13 2026: a machine that sells another machine's six toys (the DRIP FC Stadium's four, lib/town/stadiumShops.ts): the
  *  same toys, odds and price, so a toy found here is the same toy as there. Absent: the machine sells its own six. */
 set?:GashaponMachineId};

/** One capsule tower on the ground (metres): narrower and shallower than a vending cabinet (1.69 × 1.12). */
export const GASHA_SIZE={w:.8,d:.6,h:1.55} as const;
/**
 * Body styles (owner, Nov 10 2026: "make the gashapon machines look different in variety and size so they are not all the same
 * with just colour variations"). One small kit, built by lib/graphics/gashaponMesh.ts from the same primitive pieces:
 *  - classic: one globe on a square cabinet (the round-2 machine);
 *  - retro: round-shouldered cabinet under a striped canopy sign on two posts;
 *  - double: double-decker, a 0.9× machine with a shelf on four posts and a second, smaller globe on top;
 *  - tower: a narrow 0.82× cabinet, a tall column lifting the globe, a dome on top;
 *  - counter: a small 0.66× countertop unit on a stool;
 *  - twin: one wide base with two 0.82× globes side by side (the left one is the working one).
 * `GASHA_STYLE_SIZE` is each style's cabinet in the GASHA_SIZE sense (the collider adds 3 cm a side, `gashaponFootprint`).
 */
export type GashaponStyle='classic'|'retro'|'double'|'tower'|'counter'|'twin';
export const GASHA_STYLES:readonly GashaponStyle[]=['classic','retro','double','tower','counter','twin'];
export const GASHA_STYLE_SIZE:Readonly<Record<GashaponStyle,{w:number;d:number}>>={classic:{w:.8,d:.6},retro:{w:.8,d:.6},double:{w:.72,d:.54},tower:{w:.66,d:.5},counter:{w:.56,d:.46},twin:{w:1.3,d:.6}};
/**
 * Which style each machine is, and a trim colour themed to where it stands (stool, column bands, canopy stripes, shelf). The two
 * machines of a Konbini pair and of the Arcade pair always differ. gs-summit stands against the Summit 5s east fence: a shallow
 * tower (never the wide twin).
 */
export const GASHA_LOOK:Readonly<Record<GashaponMachineId,{style:GashaponStyle;trim:string}>>={
 'gs-square-snacks':{style:'classic',trim:'#fff3d6'},'gs-square-lucky':{style:'retro',trim:'#ffe08a'},// Konbini noren-style awning
 'gs-cay-sweets':{style:'counter',trim:'#f7c6dc'},'gs-cay-bento':{style:'double',trim:'#c8a165'},// sweet-pink stool, bento-wood shelf
 'gs-arcade-heroes':{style:'counter',trim:'#2b2b3a'},'gs-arcade-pixel':{style:'classic',trim:'#e8b654'},// an arcade stool
 'gs-westbeach':{style:'twin',trim:'#f3dfb0'},'gs-northbeach':{style:'counter',trim:'#b08a5c'},// sandy base; a driftwood stool
 'gs-eleven':{style:'double',trim:'#ffffff'},'gs-oldtown':{style:'retro',trim:'#3d8f4f'},// stadium stand; old-ground green canopy
 'gs-jetty':{style:'tower',trim:'#ffffff'},'gs-cayplaza':{style:'classic',trim:'#ffd84a'},// lighthouse stripes
 'gs-sharks':{style:'twin',trim:'#9ff0e8'},'gs-summit':{style:'tower',trim:'#8d9399'},// reef base; summit stone
 // The DRIP FC Stadium four (Nov 13 2026): four different single-globe styles (no twin: the stadium cell's triangle budget,
 // tests/west-stadium.cjs), neighbours always different.
 'gs-stadium-boots':{style:'double',trim:'#ffffff'},'gs-stadium-trophies':{style:'retro',trim:'#c9a227'},
 'gs-stadium-pixel':{style:'tower',trim:'#60e9f2'},'gs-stadium-beach':{style:'classic',trim:'#f3dfb0'},
};
export const gashaStyleOf=(m:{id:string}):GashaponStyle=>GASHA_LOOK[m.id as GashaponMachineId]?.style??'classic';
export const gashaTrimOf=(m:{id:string})=>GASHA_LOOK[m.id as GashaponMachineId]?.trim??'#fff6e4';
/** Gap between the two cabinets of a pair. */
export const GASHA_GAP=.12;
/** The outdoor machines face the island camera like the vending machines (lib/town/vendingCatalog.ts VENDING_YAW). */
export const GASHA_OUTDOOR_YAW=Math.atan2(16,33);
const r2=(v:number)=>Math.round(v*100)/100;

/**
 * The Konbini pair: the store's vending machine spot (konbiniMachineSpot, east of the doors) mirrored across the doors' centre
 * line to the west, then two cabinets side by side centred on that mirrored spot, flush against the shopfront (same back gap
 * as the vending machine) and facing out. Returns [the one nearer the doors, the outer one].
 */
export function gashaponPairOpposite(store:{x:number;front:number},doorX:number):[{x:number;z:number;yaw:number},{x:number;z:number;yaw:number}]{
 const vend=konbiniMachineSpot(store),mx=2*doorX-vend.x,side=Math.sign(mx-doorX)||-1,half=(GASHA_SIZE.w+GASHA_GAP)/2;
 const z=r2(store.front+KONBINI_FACADE_PROUD+KONBINI_BACK_GAP+GASHA_SIZE.d/2);
 return [{x:r2(mx-side*half),z,yaw:0},{x:r2(mx+side*half),z,yaw:0}];
}
/** Door centre lines (lib/konbini/konbiniDoors.ts KONBINI_DOORS: 0.55 m west of each store centre). */
export const SQUARE_DOOR_X=ISLAND_SQUARE_KONBINI.x-.55,CAY_DOOR_X=CAY_KONBINI_DOOR.x;
/**
 * The Coral Cay Konbini made room for its pair (Nov 8 2026, lib/town/coralCayWorld.ts): the potted plant west of the doors was
 * removed and the bench in front of the west window moved 2 m west, so the pair and its buying spot are clear of every collider.
 */
const SQUARE_PAIR=gashaponPairOpposite(ISLAND_SQUARE_KONBINI,SQUARE_DOOR_X),CAY_PAIR=gashaponPairOpposite(CAY_KONBINI,CAY_DOOR_X);

/** The arcade pair: back wall (z −10.7 is the floor's north edge), 3.6–4.5 m west of the Breakaway Run cabinet at (0, −10). */
export const ARCADE_GASHA_Z=-10.25;
const ARCADE_X=[-3.6,-3.6-(GASHA_SIZE.w+GASHA_GAP)];

/** Outdoor spots (searched on the built town, re-checked by tests/gashapon-data.cjs). */
/** Nov 9 2026 (owner: "move the gashapon on the mountain next to the vending machines"): side by side with the Summit Isle Konbini vending + drink pair (now behind the east goal, lib/town/vendingPlaces.ts summitSnackSpot), on the vending's left (west) with the same 12 cm gap and the same facing. */
const SUMMIT_SPOT=(()=>{const v=summitSnackSpot();return {x:v.x,z:r2(v.z+1.97),yaw:v.yaw};})();
/**
 * The DRIP FC Stadium four (Nov 13 2026, owner: "on both sides of the vending row, two gashapon machines each"): against the
 * south stand's back wall under the big screen (lib/town/stadiumShops.ts), two west and two east of the vending + drink pair,
 * each flush to the wall, facing out (yaw 0) to the viewing area, 12 cm apart (collider to collider). Listed west to east.
 */
const STADIUM_ROW:readonly GashaponMachineId[]=['gs-stadium-trophies','gs-stadium-boots','gs-stadium-pixel','gs-stadium-beach'];
const stadiumSpot=(id:GashaponMachineId)=>{const i=STADIUM_ROW.indexOf(id),side=i<2?-1:1,near=STADIUM_ROW[i<2?1:2],far=STADIUM_ROW[i<2?0:3];
 const w=(m:GashaponMachineId)=>GASHA_STYLE_SIZE[GASHA_LOOK[m].style].w+.06,inner=STADIUM_VENDING_HALF+STADIUM_SHOP_GAP;
 const off=id===near?inner+w(near)/2:inner+w(near)+STADIUM_SHOP_GAP+w(far)/2;
 return {x:r2(STADIUM_SHOP_X+side*off),z:stadiumShopZ(GASHA_STYLE_SIZE[GASHA_LOOK[id].style].d+.06),yaw:STADIUM_SHOP_YAW};};
/** In the stadium row every machine but the west end one has a cabinet on its left (a gashapon, or the drink machine for the
 *  pixel machine): components/GashaponMachineFace.tsx moves its knob label and tag onto the machine, as for the Konbini pairs. */
export const stadiumCabinetOnLeft=(id:string)=>STADIUM_ROW.indexOf(id as GashaponMachineId)>0;
const STADIUM_PLACE='at the DRIP FC Stadium, against the south stand under the big screen, beside the vending machines';

export const GASHAPON_MACHINES:readonly GashaponMachine[]=[
 {id:'gs-square-snacks',name:'Onigiri Pals',theme:'Konbini snacks with faces',zone:'konbini-square',place:'outside the Island Square Konbini, west of the sliding doors',...SQUARE_PAIR[0],y:0,color:'#e94b3c',accent:'#fff3d6'},
 {id:'gs-square-lucky',name:'Lucky Little Japan',theme:'Cute Japanese good-luck figurines',zone:'konbini-square',place:'outside the Island Square Konbini, west of the sliding doors',...SQUARE_PAIR[1],y:0,color:'#d23a63',accent:'#ffe08a'},
 {id:'gs-cay-sweets',name:'Sweet Shop Treats',theme:'Japanese sweets and fizzy drinks',zone:'konbini-cay',place:'outside the Coral Cay Konbini, west of the sliding doors',...CAY_PAIR[0],y:0,color:'#f28cb8',accent:'#fff6fb'},
 {id:'gs-cay-bento',name:'Bento Box Buddies',theme:'Konbini hot food and lunch boxes',zone:'konbini-cay',place:'outside the Coral Cay Konbini, west of the sliding doors',...CAY_PAIR[1],y:0,color:'#3f8f6c',accent:'#f8e7b0'},
 {id:'gs-arcade-heroes',name:'Cabinet Heroes',theme:'Characters from the arcade games',zone:'arcade',place:'in the Arcade, on the back wall beside Breakaway Run',x:ARCADE_X[0],z:ARCADE_GASHA_Z,y:0,yaw:0,color:'#ff65c8',accent:'#60e9f2'},
 {id:'gs-arcade-pixel',name:'Pixel Pitch',theme:'Retro 8-bit football',zone:'arcade',place:'in the Arcade, on the back wall beside Breakaway Run',x:r2(ARCADE_X[1]),z:ARCADE_GASHA_Z,y:0,yaw:0,color:'#7b5cff',accent:'#e8b654'},
 {id:'gs-westbeach',name:'Beach Day',theme:'Beach soccer and sunny sand',zone:'outdoor',place:'on the west beach, a short walk east of the Beach Kitchen machine',x:-55,z:92,y:0,yaw:GASHA_OUTDOOR_YAW,color:'#ffb347',accent:'#3ec6e0'},
 {id:'gs-northbeach',name:'Shell Seekers',theme:'Shore creatures and beach finds',zone:'outdoor',place:'on the North Beach sand, past the North Beach machine',x:76.3,z:-194.17,y:0,yaw:GASHA_OUTDOOR_YAW,color:'#f6d36b',accent:'#2f86d6'},
 {id:'gs-eleven',name:'Boots & Kits',theme:'Football gear with faces',zone:'outdoor',place:'beside the Eleven Park touchline machine',x:100.33,z:117.5,y:0,yaw:GASHA_OUTDOOR_YAW,color:'#23407e',accent:'#ffffff'},
 {id:'gs-oldtown',name:'Trophies & Legends',theme:'Cups, medals and matchday',zone:'outdoor',place:'by the Old Town Ground, west of its machine and clear of the entrance walk',x:3.17,z:-46.71,y:0,yaw:GASHA_OUTDOOR_YAW,color:'#c9a227',accent:'#3d8f4f'},
 {id:'gs-jetty',name:'Rides & Rollers',theme:'Island rides and vehicles',zone:'outdoor',place:'on the East Jetty plaza, west of the lighthouse',x:338,z:68,y:0,yaw:GASHA_OUTDOOR_YAW,color:'#2fa4a9',accent:'#ff7a45'},
 {id:'gs-cayplaza',name:'Bug Squad',theme:'Island bugs that play football',zone:'outdoor',place:'on the Coral Cay plaza',x:594,z:-159,y:0,yaw:GASHA_OUTDOOR_YAW,color:'#7fb13c',accent:'#ffd84a'},
 {id:'gs-sharks',name:'Reef Friends',theme:'Sea life from the island waters',zone:'outdoor',place:'on the Sharks Beach sand, along from its machine',x:670.62,z:-211.77,y:0,yaw:GASHA_OUTDOOR_YAW,color:'#1f6fb8',accent:'#9ff0e8'},
 {id:'gs-summit',name:'Summit Orchard',theme:'Mountain fruit and summit landmarks',zone:'outdoor',place:'on the summit terrace, right beside the Summit Isle Konbini vending machines',...SUMMIT_SPOT,y:r2(summitGround(SUMMIT_SPOT.x,SUMMIT_SPOT.z)),color:'#6a5acd',accent:'#ffb03b'},
 // Nov 13 2026: the DRIP FC Stadium four sell the island's football sets (no new toys): Boots & Kits, Trophies & Legends, Pixel Pitch
 // and Beach Day. Own names and colours (the shelf lists each set once, under its home machine).
 {id:'gs-stadium-trophies',name:'Trophies & Legends · Stadium',theme:'Cups, medals and matchday',zone:'stadium',place:STADIUM_PLACE,...stadiumSpot('gs-stadium-trophies'),y:0,color:'#b8860b',accent:'#2e7d4f',set:'gs-oldtown'},
 {id:'gs-stadium-boots',name:'Boots & Kits · Stadium',theme:'Football gear with faces',zone:'stadium',place:STADIUM_PLACE,...stadiumSpot('gs-stadium-boots'),y:0,color:'#1d3a8a',accent:'#f4f1e6',set:'gs-eleven'},
 {id:'gs-stadium-pixel',name:'Pixel Pitch · Stadium',theme:'Retro 8-bit football',zone:'stadium',place:STADIUM_PLACE,...stadiumSpot('gs-stadium-pixel'),y:0,color:'#6a4cff',accent:'#ffd447',set:'gs-arcade-pixel'},
 {id:'gs-stadium-beach',name:'Beach Day · Stadium',theme:'Beach soccer and sunny sand',zone:'stadium',place:STADIUM_PLACE,...stadiumSpot('gs-stadium-beach'),y:0,color:'#ff8c42',accent:'#2bb3d1',set:'gs-westbeach'},
];
export const GASHAPON_MACHINE_IDS=GASHAPON_MACHINES.map(m=>m.id);
export const gashaponMachine=(id:string)=>GASHAPON_MACHINES.find(m=>m.id===id);
export const isGashaponMachine=(id:unknown):id is GashaponMachineId=>typeof id==='string'&&GASHAPON_MACHINES.some(m=>m.id===id);
/** World machines (everything but the arcade room's pair), for the island's one instanced mesh. */
export const islandGashaponMachines=()=>GASHAPON_MACHINES.filter(m=>m.zone!=='arcade');
/** The machine whose six toys this machine sells (itself, unless it shares a set). */
export const gashaponSetOf=(id:string):string=>gashaponMachine(id)?.set??id;
/** Machines that own a set of toys (one Toy Shelf section each). */
export const setGashaponMachines=()=>GASHAPON_MACHINES.filter(m=>!m.set);
