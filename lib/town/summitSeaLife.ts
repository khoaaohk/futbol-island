// Sea life round Summit Isle (Oct 14 2026, user: "add some sharks, manta rays and even a whale shark around the mountain
// island"). Pure data (no three.js): the sharks' patrol loops and the whale shark's long slow loop, plus how many of each a heat
// tier draws. The mantas' bays live with the other manta loops (mantaLoops.ts, island 'summit'). The 3D side reuses Coral Cay's
// builds: caySharks.ts (one more region, 'summit'), cayMantas.ts (one more island) and whaleShark.ts (one mesh).
// tests/summit-sealife.cjs checks every loop stays in open water deep enough for its animal, clear of the fishing floats, the
// sandbar, Coral Cay's own sharks and mantas, and inside the flight zone.
import {coastRing} from './mantaLoops';
import {SUMMIT_CENTER,SUMMIT_SHORE} from './summitIsle';
import type {SharkLoop} from './coralCay';
import type {HeatTier} from '../graphics/heatTier';

const D=Math.PI/180;
const loop=(a0:number,a1:number,dIn:number,dOut:number)=>coastRing(SUMMIT_SHORE,SUMMIT_CENTER,a0*D,a1*D,dIn,dOut,.2,6);
/**
 * Three sharks in the deeper water, each on its own stretch of coast, outside the manta bays (bearings in degrees round
 * SUMMIT_CENTER, atan2(z, x): -90 is north, 0 east, 90 south): east, past Palm Point's float; the long south beach, short of
 * Boulder Cove; and the south-east headland between them. None on the north side: that channel is Coral Cay's (its south-cove
 * mantas), and the summit's north-bay mantas have it. Order matters: low heat tiers keep the first ones.
 */
export const SUMMIT_SHARK_LOOPS:SharkLoop[]=[
 {id:'summit-east',region:'summit',points:loop(-16,22,30,40),speed:1.5},
 {id:'summit-south',region:'summit',points:loop(78,120,29,38),speed:1.4},
 {id:'summit-south-east',region:'summit',points:loop(34,58,29,38),speed:1.6},
];
/**
 * The whale shark: one long, slow loop off the west coast, the side the summit lookout faces (towards Coral Cay and the main
 * island), between Boulder Cove (≈132°) and Lookout Rocks (≈-137°). Out along 24 m from the waterline, back along 36 m.
 */
export const WHALE_SHARK_LOOP={id:'summit-whale-shark',points:loop(-176,-118,42,58),speed:.9} as const;

/** How many of each animal a heat tier draws (desktop or phone). Tier 0 is everything; a warm phone keeps two sharks and two
 *  mantas; static ambience (tiers 3–4) freezes them anyway, so the hottest tier keeps one shark and no mantas. The whale shark
 *  is one draw and stays at every tier (still at 3–4). */
export function summitSeaLifeCounts(tier:HeatTier,phone:boolean){
 if(tier===0)return {sharks:3,mantas:phone?2:3,whaleShark:1};
 if(tier<=2)return {sharks:2,mantas:2,whaleShark:1};
 if(tier===3)return {sharks:2,mantas:1,whaleShark:1};
 return {sharks:1,mantas:0,whaleShark:1};
}
