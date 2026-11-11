export const arcadeCabinets = [
 // Nov 10 2026: Kit Rush took Island Strikers' cabinet (same spot). Strikers' code stays in the repo (components/LiveArcadeMatch.tsx,
 // lib/arcade/striker*) but is no longer a cabinet; an old /arcade?game=live link opens Kit Rush (components/ArcadeRoom.tsx).
 {id:'kitrush',name:'Kit Rush',short:'KIT RUSH',lesson:'Know your team. Scan, then swipe.',color:'#ff65c8',x:-8,z:-7,yaw:0},
 {id:'runner',name:'Breakaway Run',short:'BREAKAWAY',lesson:'Beat the tackle. Find the goal.',color:'#60e9f2',x:0,z:-10,yaw:0},
 {id:'tennis',name:'Futbol Tennis',short:'TENNIS',lesson:'Control your first touch.',color:'#b991ff',x:8,z:-7,yaw:0},
 {id:'pinball',name:'Futbol Pinball',short:'PINBALL',lesson:'Read the rebound. Time your block.',color:'#60e9f2',x:-9,z:4,yaw:Math.PI/2},
 {id:'puzzle',name:'Pass Puzzles',short:'PASS PUZZLES',lesson:'See the space. Draw the pass.',color:'#ff65c8',x:9,z:4,yaw:-Math.PI/2},
 // Nov 10 2026: Squad Snake, the sixth cabinet (docs/arcade-aaa/snake-direction.md): on the back wall right of Breakaway Run, mirroring the gashapon pair on its left.
 {id:'snake',name:'Squad Snake',short:'SQUAD SNAKE',lesson:'Call your eleven. Build the shape.',color:'#ffc83a',x:4,z:-10,yaw:0},
 // Nov 11 2026: Air Futbol, the seventh game (docs/arcade-aaa/airhockey-direction.md): not a cabinet but the air hockey TABLE that already
 // stood by the west wall (lib/arcade/arcadeRoomProps.ts draws it at -10,-1). x/z are the table's own centre; it faces the aisle (+x).
 {id:'airhockey',name:'Air Futbol',short:'AIR FUTBOL',lesson:'Play the angles. Guard your goal.',color:'#19b5a5',x:-10,z:-1,yaw:Math.PI/2},
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
/** Hub layout: the room angles the two side cabinets toward the aisle. Shared by arcadeRoomScene.ts and the multiplayer room descriptor
 *  (lib/multiplayer/rooms/arcade.ts) so a friend's "Playing <game>" spot is always in front of the real cabinet. */
export const ARCADE_HUB_YAW:Readonly<Partial<Record<ArcadeCabinetId,number>>>={pinball:.55,puzzle:-.55};
export function arcadeHubCabinets(){return arcadeCabinets.map(c=>({...c,yaw:ARCADE_HUB_YAW[c.id]??c.yaw}));}
