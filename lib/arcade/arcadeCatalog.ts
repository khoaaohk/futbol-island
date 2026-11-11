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
] as const;
export type ArcadeCabinetId=typeof arcadeCabinets[number]['id'];
/** Admin analytics id for a cabinet (activity `arcade_<id>`, counter `en:game_<id>`). The ids are allow-listed inside the SQL ingest
 *  function, so Kit Rush reports on the slot it took over ('live', relabelled "Kit Rush" in lib/analytics) instead of needing a migration. */
export const arcadeAnalyticsId=(id:ArcadeCabinetId):string=>id==='kitrush'?'live':id;// 'snake' reports as itself (lib/analytics ARCADE_GAMES; allow-listed by supabase/migrations/20261114_analytics_snake.sql)
/** Hub layout: the room angles the two side cabinets toward the aisle. Shared by arcadeRoomScene.ts and the multiplayer room descriptor
 *  (lib/multiplayer/rooms/arcade.ts) so a friend's "Playing <game>" spot is always in front of the real cabinet. */
export const ARCADE_HUB_YAW:Readonly<Partial<Record<ArcadeCabinetId,number>>>={pinball:.55,puzzle:-.55};
export function arcadeHubCabinets(){return arcadeCabinets.map(c=>({...c,yaw:ARCADE_HUB_YAW[c.id]??c.yaw}));}
