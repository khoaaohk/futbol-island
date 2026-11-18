/**
 * Nov 17 2026 (owner: "place the games in the back and reorganize it so they all line side by side"): every upright cabinet stands
 * in ONE row against the back wall, side by side, all facing the door (yaw 0). ARCADE_ROW is the left-to-right order (west to east);
 * arcadeRowSpot() spaces the row from it, centred on x 0, so adding a cabinet = adding its id here and the row re-spaces itself.
 * Pitch 3 m (a 1.9 m cabinet + a 1.1 m gap) while it fits; past 8 cabinets it shrinks so the end centres stay within x ±11, clear of
 * the north lounge (x −11.8, z −8..−4) and the corner plinths (±13.6): 6 cabinets 3 m, 9 → 2.75 m, 10 → 2.44 m (0.54 m between bodies).
 * The air hockey table is not in the row.
 */
export const ARCADE_ROW=['pinball','kitrush','runner','snake','tennis','puzzle','lineup','trophydrop','clearbox'] as const;
export const ARCADE_ROW_Z=-10,ARCADE_ROW_MAX_HALF=11;
export const arcadeRowPitch=(count:number=ARCADE_ROW.length):number=>count<2?3:Math.min(3,ARCADE_ROW_MAX_HALF*2/(count-1));
function rowSpot(id:typeof ARCADE_ROW[number]){const n=ARCADE_ROW.length,i=ARCADE_ROW.indexOf(id);return {x:Math.round((i-(n-1)/2)*arcadeRowPitch(n)*100)/100,z:ARCADE_ROW_Z,yaw:0};}
export const arcadeCabinets = [
 // Nov 10 2026: Kit Rush took Island Strikers' cabinet (same spot). Strikers' code stays in the repo (components/LiveArcadeMatch.tsx,
 // lib/arcade/striker*) but is no longer a cabinet; an old /arcade?game=live link opens Kit Rush (components/ArcadeRoom.tsx).
 {id:'kitrush',name:'Kit Rush',short:'KIT RUSH',lesson:'Know your team. Scan, then swipe.',color:'#ff65c8',...rowSpot('kitrush')},
 {id:'runner',name:'Breakaway Run',short:'BREAKAWAY',lesson:'Beat the tackle. Find the goal.',color:'#60e9f2',...rowSpot('runner')},
 {id:'tennis',name:'Futbol Tennis',short:'TENNIS',lesson:'Control your first touch.',color:'#b991ff',...rowSpot('tennis')},
 {id:'pinball',name:'Futbol Pinball',short:'PINBALL',lesson:'Read the rebound. Time your block.',color:'#60e9f2',...rowSpot('pinball')},
 {id:'puzzle',name:'Pass Puzzles',short:'PASS PUZZLES',lesson:'See the space. Draw the pass.',color:'#ff65c8',...rowSpot('puzzle')},
 // Nov 10 2026: Squad Snake, the sixth cabinet (docs/arcade-aaa/snake-direction.md); since Nov 17 in the back row with the others.
 {id:'snake',name:'Squad Snake',short:'SQUAD SNAKE',lesson:'Call your eleven. Build the shape.',color:'#ffc83a',...rowSpot('snake')},
 // Nov 11 2026: Air Futbol, the seventh game (docs/arcade-aaa/airhockey-direction.md): not a cabinet but the air hockey TABLE that already
 // stood by the west wall (lib/arcade/arcadeRoomProps.ts draws it at -10,-1). x/z are the table's own centre; it faces the aisle (+x).
 {id:'airhockey',name:'Air Futbol',short:'AIR FUTBOL',lesson:'Play the angles. Guard your goal.',color:'#19b5a5',x:-10,z:-1,yaw:Math.PI/2},
 // Nov 17 2026: Line Up!, the block-fit cabinet (docs/arcade-aaa/lineup-direction.md), at the east end of the back row.
 {id:'lineup',name:'Line Up!',short:'LINE UP!',lesson:'Fill the line. Keep your shape.',color:'#f0452e',...rowSpot('lineup')},
 // Nov 17 2026: Trophy Drop, the drop-and-merge cabinet (docs/arcade-aaa/trophydrop-direction.md), at the east end of the back row.
 {id:'trophydrop',name:'Trophy Drop',short:'TROPHY DROP',lesson:'Small touches add up to big wins.',color:'#ffd24a',...rowSpot('trophydrop')},
 // Nov 17 2026: Clear the Box, the tap-out cabinet (docs/arcade-aaa/clearbox-direction.md), after Line Up! at the east end of the back row.
 {id:'clearbox',name:'Clear the Box',short:'CLEAR BOX',lesson:'Time your run. Make the space.',color:'#19b5a5',...rowSpot('clearbox')},
] as const;
export type ArcadeCabinetId=typeof arcadeCabinets[number]['id'];
/** Admin analytics id for a cabinet (activity `arcade_<id>`, counter `en:game_<id>`). The ids are allow-listed inside the SQL ingest
 *  function, so Kit Rush reports on the slot it took over ('live', relabelled "Kit Rush" in lib/analytics) instead of needing a migration. */
/** The one machine that is a table, not an upright cabinet: the room scene keeps the prop it already draws and only adds the
 *  highlight, the sign and the Play prompt. Its half size on the floor (the prop's collider) and how far in front the player stands. */
export const ARCADE_TABLE_ID:ArcadeCabinetId='airhockey';
export const ARCADE_TABLE_HALF={x:1.55,z:2.4} as const;
/** How far in front of a machine its play spot is (the table is wider than a cabinet, so its spot is further out). */
export const arcadeStand=(id:ArcadeCabinetId):number=>id===ARCADE_TABLE_ID?2.35:1.8;
export const arcadeAnalyticsId=(id:ArcadeCabinetId):string=>id==='kitrush'?'live':id;// 'snake' reports as itself (lib/analytics ARCADE_GAMES; allow-listed by supabase/migrations/20261114_analytics_snake.sql)
/** Hub layout, shared by arcadeRoomScene.ts and the multiplayer room descriptor (lib/multiplayer/rooms/arcade.ts) so a friend's
 *  "Playing <game>" spot is always in front of the real cabinet. Until Nov 17 2026 this angled the two side cabinets (ARCADE_HUB_YAW);
 *  in the back row every cabinet faces the door, so the hub uses the catalog's own spots. */
export function arcadeHubCabinets(){return arcadeCabinets.map(c=>({...c}));}
