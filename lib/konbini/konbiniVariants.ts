import type {KonbiniShop} from './food';
import type {ShelfId} from './konbiniContent';
/**
 * The two Konbini interiors as DATA (user, Sep 29 2026: "the two Konbinis should vary slightly"). One engine
 * (konbiniScene.ts) and one atlas build both; only placements, colours and which stock/posters appear differ, so neither
 * store loads anything extra.
 *
 * Room frame: x −8…8, z −6…6, the glass front and sliding doors at z = +6 (the camera looks in from the front).
 * A fixture's own front faces its local +z; `yaw` turns it (0 = faces +z, π/2 = faces +x, π = faces −z, −π/2 = faces −x).
 */
export type FixtureKind='fridgeWall'|'riceCase'|'gondola'|'gearRack'|'counter'|'magRack'|'atm'|'beachCorner'|'plant'|'poster'|'sign'|'mat';
export type Fixture={kind:FixtureKind;x:number;z:number;yaw:number;len?:number;
 /** Interaction (shelf lesson / panel) this fixture opens. */
 poi?:ShelfId;
 /** Poster index (konbiniAtlas POSTER_RECTS) or product set for a gondola. */
 poster?:number;stock?:'snacks'|'sweets'|'gear';y?:number};
export type KonbiniPalette={floor:string;grout:string;wall:string;trim:string;trim2:string;counter:string;counterTop:string;shelf:string;light:string;sky:string;hemiSky:string;hemiGround:string;sun:string;accentWood?:string};
export type KonbiniVariant={shop:KonbiniShop;doorX:number;
 /** Camera azimuth: the room is seen from its front-left (−) or front-right (+) corner, so fixture fronts face it. */
 camYaw:number;palette:KonbiniPalette;fixtures:Fixture[];
 /** Behind-the-counter spot for the cashier, and where the player stands to pay. */
 cashier:{x:number;z:number;yaw:number};pay:{x:number;z:number};
 /** Regular vending stock sold on this store's gear shelf (same ledger and prices as the machines). */
 gear:string[]};
const H=Math.PI/2;
export const KONBINI_VARIANTS:Record<KonbiniShop,KonbiniVariant>={
 // Island Square: the classic bright konbini. Door left of centre; drinks fridges along the back-left, the rice case
 // back-right, three aisles across the room, the counter down the right wall. Seen from the front-left.
 main:{shop:'main',doorX:-2,camYaw:-.36,
  palette:{floor:'#f4f2ea',grout:'#dedbd0',wall:'#fbfaf5',trim:'#2f8f8a',trim2:'#ffd35c',counter:'#2f8f8a',counterTop:'#eef1ee',shelf:'#e9ecea',light:'#ffffff',sky:'#dff1ee',hemiSky:'#ffffff',hemiGround:'#c9d6d2',sun:'#ffffff'},
  fixtures:[
   {kind:'fridgeWall',x:-3.6,z:-5.5,yaw:0,len:7.7,poi:'drinks'},
   {kind:'riceCase',x:3.4,z:-5.5,yaw:0,len:5,poi:'rice'},
   // User, Sep 29 2026: the short gear aisle on the right is gone; the back aisle runs on to where it ended (x −5.8…2.7) and
   // the balls, cones and card packs moved to a gear rack beside the counter.
   {kind:'gondola',x:-1.55,z:-2.7,yaw:0,len:8.5,poi:'snacks',stock:'snacks'},
   {kind:'gondola',x:-3.2,z:-.1,yaw:0,len:5.2,poi:'snacks',stock:'sweets'},
   {kind:'gearRack',x:5.3,z:4.15,yaw:-H,len:1.2,poi:'gear'},
   {kind:'counter',x:5.3,z:1.2,yaw:-H,len:4.6,poi:'counter'},
   {kind:'magRack',x:-5.6,z:5.2,yaw:Math.PI,len:3.8,poi:'magazines'},
   {kind:'atm',x:7.35,z:3.9,yaw:-H,poi:'atm'},
   {kind:'plant',x:2.9,z:5.1,yaw:0},
   {kind:'sign',x:-3.6,z:-5.95,yaw:0,y:3.05},
   {kind:'poster',x:7.93,z:-4.4,yaw:-H,poster:0,y:2.3},{kind:'poster',x:7.93,z:-3.2,yaw:-H,poster:1,y:2.3},
   {kind:'poster',x:2.4,z:-5.95,yaw:0,poster:2,y:2.75},{kind:'poster',x:4.6,z:-5.95,yaw:0,poster:3,y:2.75},
   {kind:'mat',x:-2,z:5.2,yaw:0},
  ],
  cashier:{x:6.7,z:1.2,yaw:-H},pay:{x:4.1,z:1.2},gear:['ball:sunset','ball:neon','ball:frost','pack:3']},
 // Coral Cay: beachy and mirrored. Door right of centre; the counter (wood and bamboo) down the left wall, the drinks fridges
 // back-right, the rice case back-left, long aisles on the right, a beach-gear corner and plants. Seen from the front-right.
 cay:{shop:'cay',doorX:2,camYaw:.36,
  palette:{floor:'#f6ead3',grout:'#e6d6b8',wall:'#fff6ea',trim:'#7cc6b9',trim2:'#f6a98f',counter:'#b98552',counterTop:'#f3e3c4',shelf:'#f4ece0',light:'#ffe9c7',sky:'#ffeccf',hemiSky:'#fff1da',hemiGround:'#d9c4a0',sun:'#ffe2b0',accentWood:'#c9a46a'},
  fixtures:[
   {kind:'fridgeWall',x:3.9,z:-5.5,yaw:0,len:7.4,poi:'drinks'},
   {kind:'riceCase',x:-3.1,z:-5.5,yaw:0,len:4.8,poi:'rice'},
   {kind:'gondola',x:1.9,z:-2.6,yaw:0,len:5.6,poi:'snacks',stock:'snacks'},
   {kind:'gondola',x:1.9,z:0,yaw:0,len:5.6,poi:'snacks',stock:'sweets'},
   {kind:'gondola',x:5.4,z:2.6,yaw:0,len:2.4,poi:'gear',stock:'gear'},
   {kind:'counter',x:-5.3,z:1,yaw:H,len:4.6,poi:'counter'},
   {kind:'beachCorner',x:-2.2,z:-2.4,yaw:0,poi:'beach'},
   {kind:'magRack',x:5.6,z:5.2,yaw:Math.PI,len:3.8,poi:'magazines'},
   {kind:'atm',x:-7.35,z:5.1,yaw:H,poi:'atm'},
   {kind:'plant',x:-.9,z:5.1,yaw:0},{kind:'plant',x:7.3,z:-1.2,yaw:0},{kind:'plant',x:-.2,z:-5.3,yaw:0},
   {kind:'sign',x:3.9,z:-5.95,yaw:0,y:3.05},
   {kind:'poster',x:-7.93,z:-4.4,yaw:H,poster:4,y:2.3},{kind:'poster',x:-7.93,z:-3.2,yaw:H,poster:5,y:2.3},
   {kind:'poster',x:-4.3,z:-5.95,yaw:0,poster:0,y:2.75},{kind:'poster',x:-2,z:-5.95,yaw:0,poster:3,y:2.75},
   {kind:'mat',x:2,z:5.2,yaw:0},
  ],
  cashier:{x:-6.7,z:1,yaw:H},pay:{x:-4.1,z:1},gear:['ball:solar','ball:cosmic','ball:sunset','pack:3']},
};
