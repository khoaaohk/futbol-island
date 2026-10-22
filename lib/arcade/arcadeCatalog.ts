export const arcadeCabinets = [
 {id:'live',name:'Island Strikers',short:'STRIKERS',lesson:'Pass, move, finish.',color:'#ff65c8',x:-8,z:-7,yaw:0},
 {id:'runner',name:'Breakaway Run',short:'BREAKAWAY',lesson:'Beat the tackle. Find the goal.',color:'#60e9f2',x:0,z:-10,yaw:0},
 {id:'tennis',name:'Futbol Tennis',short:'TENNIS',lesson:'Control your first touch.',color:'#b991ff',x:8,z:-7,yaw:0},
 {id:'pinball',name:'Futbol Pinball',short:'PINBALL',lesson:'Read the rebound. Time your block.',color:'#60e9f2',x:-9,z:4,yaw:Math.PI/2},
 {id:'puzzle',name:'Pass Puzzles',short:'PASS PUZZLES',lesson:'See the space. Draw the pass.',color:'#ff65c8',x:9,z:4,yaw:-Math.PI/2},
] as const;
export type ArcadeCabinetId=typeof arcadeCabinets[number]['id'];
/** Hub layout: the room angles the two side cabinets toward the aisle. Shared by arcadeRoomScene.ts and the multiplayer room descriptor
 *  (lib/multiplayer/rooms/arcade.ts) so a friend's "Playing <game>" spot is always in front of the real cabinet. */
export const ARCADE_HUB_YAW:Readonly<Partial<Record<ArcadeCabinetId,number>>>={pinball:.55,puzzle:-.55};
export function arcadeHubCabinets(){return arcadeCabinets.map(c=>({...c,yaw:ARCADE_HUB_YAW[c.id]??c.yaw}));}
