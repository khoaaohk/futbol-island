/**
 * East Jetty (Sep 29 2026 as the East Pier; reworked Sep 30 2026, user: "change the pier to more of a jetty and have it spiral at
 * the end"). A rock-armoured stone jetty leaves the east-coast seawall between the Farmers Market stalls (on the market banner's
 * axis, z 98), runs ~105 m straight out east, then curls into a nautilus spiral: 1.75 turns winding inward from a 30 m to a
 * 9 m radius around a round plaza with a 16 m lighthouse at its centre (enlarged Sep 30, user: "make the spiral jetty longer
 * and the lighthouse larger as well"). The water inside the coils is open sea.
 *
 * Pure data plus ONE landable-deck registration (lib/town/landableDecks.ts) whose `contains` test is the curved walkway: a
 * bounding rectangle rejects everything else first, then jettyOffset() (a couple of polar sums, no loops over samples) decides.
 * The walkway is a floor at y 0, so walking, every ride, jetpack landings and a kicked ball treat it as ground; its kerbs are
 * the walkable edge. Imported for its side effect by simulation.ts and landmass.ts; no per-frame work.
 */
import {registerLandableDeck} from './landableDecks';

/** Axis z, the seawall (wall x, shore x), straight start x0, spiral centre (cx, cz), radii r0 → r1 over `turns`, widths:
 *  walkHalf = walkable half-width (4.8 m walkable), kerbHalf/railHalf = kerb inner/outer edge, flankHalf = where the rock
 *  armour meets the sea, plazaR = the central plaza (walkable radius), plazaEdge = its kerb. */
export const EAST_PIER={
 z:98,wallX:237.75,shoreX:240.35,x0:236.8,
 cx:343,cz:68,r0:30,r1:9,turns:1.75,
 walkHalf:2.4,kerbHalf:2.55,railHalf:2.95,flankHalf:4.6,deckY:0,
 plazaR:7.5,plazaEdge:7.9,
} as const;
const P=EAST_PIER;
/** Spiral angle: θ runs DOWN from θ0 (the south point, where the straight jetty joins heading east) by 2π·turns. */
export const SPIRAL_THETA0=Math.PI/2,SPIRAL_SPAN=Math.PI*2*P.turns,SPIRAL_THETA1=SPIRAL_THETA0-SPIRAL_SPAN;
export const spiralRadius=(theta:number)=>P.r0-(P.r0-P.r1)*(SPIRAL_THETA0-theta)/SPIRAL_SPAN;
export const spiralPoint=(theta:number)=>{const r=spiralRadius(theta);return {x:P.cx+r*Math.cos(theta),z:P.cz+r*Math.sin(theta)};};
/** Perpendicular distance to the coil at angle θ from radius ρ: the radial gap times cos of the spiral's pitch angle
 *  (tan α = |dr/dθ| / r), which keeps the walkway its true width even on the tight inner coil. */
const PITCH=(P.r0-P.r1)/(Math.PI*2*P.turns);
const coilDistance=(rho:number,theta:number)=>{const r=spiralRadius(theta);return Math.abs(rho-r)*r/Math.hypot(r,PITCH);};
/**
 * Lateral distance from the jetty's centre line (straight part or spiral); the plaza counts as walkHalf at its walkable radius
 * (so one threshold serves both). The spiral part is radial: |ρ − r(θ)| for the one or two coil angles that match the point's bearing (corrected for the
 * coil's pitch angle, so it matches the true perpendicular distance to within a few cm at walkway widths).
 */
export function jettyOffset(x:number,z:number){
 let best=Infinity;
 if(x>=P.x0&&x<=P.cx)best=Math.abs(z-P.z);
 const dx=x-P.cx,dz=z-P.cz,rho=Math.hypot(dx,dz);
 best=Math.min(best,rho-P.plazaR+P.walkHalf);// plaza: walkHalf exactly at its walkable radius
 const phi=Math.atan2(dz,dx);
 // θ = φ + 2πk inside [θ1, θ0].
 for(let k=Math.ceil((SPIRAL_THETA1-phi)/(Math.PI*2));;k++){const theta=phi+k*Math.PI*2;if(theta>SPIRAL_THETA0)break;best=Math.min(best,coilDistance(rho,theta));}
 return best;
}
/** Offset from the straight or spiral walkway only (ignores the plaza): used to cut the plaza kerb where the walkway joins. */
export function walkwayOffset(x:number,z:number){
 let best=x>=P.x0&&x<=P.cx?Math.abs(z-P.z):Infinity;const dx=x-P.cx,dz=z-P.cz,rho=Math.hypot(dx,dz),phi=Math.atan2(dz,dx);
 for(let k=Math.ceil((SPIRAL_THETA1-phi)/(Math.PI*2));;k++){const theta=phi+k*Math.PI*2;if(theta>SPIRAL_THETA0)break;best=Math.min(best,coilDistance(rho,theta));}
 return best;
}
/** Walkable jetty surface (the straight walkway, every coil of the spiral and the plaza). Pure. */
export const onEastPier=(x:number,z:number)=>jettyOffset(x,z)<=P.walkHalf;
/** Over the jetty's stone or rock armour (not open water for fish shadows or floats). Pure. */
export const underEastPier=(x:number,z:number)=>jettyOffset(x,z)<=P.flankHalf;
/** Bounding rectangle of the whole jetty (walkable part). */
const BOX={x0:P.x0,x1:P.cx+P.r0+P.walkHalf,z0:P.cz-P.r0-P.walkHalf,z1:P.z+P.walkHalf};
export const EAST_PIER_DECKS=[{id:'east-jetty',x:(BOX.x0+BOX.x1)/2,z:(BOX.z0+BOX.z1)/2,w:BOX.x1-BOX.x0,d:BOX.z1-BOX.z0,yaw:0,height:P.deckY}];
registerLandableDeck({...EAST_PIER_DECKS[0],contains:onEastPier});

/** Centre-line samples (about every metre) from the seawall to the spiral's inner end: position, unit tangent, arc length. */
export type JettySample={x:number;z:number;tx:number;tz:number;s:number};
export const JETTY_PATH:JettySample[]=(()=>{const out:JettySample[]=[];let s=0;
 for(let x=P.x0;x<P.cx;x+=1){out.push({x,z:P.z,tx:1,tz:0,s});s+=1;}
 const n=Math.ceil(SPIRAL_SPAN*14);let prev=spiralPoint(SPIRAL_THETA0);if(out.length)s+=Math.hypot(prev.x-out[out.length-1].x,prev.z-out[out.length-1].z)-1;
 for(let i=0;i<=n;i++){const t=SPIRAL_THETA0-SPIRAL_SPAN*i/n,p=spiralPoint(t),q=spiralPoint(t-.001),l=Math.hypot(q.x-p.x,q.z-p.z);if(i)s+=Math.hypot(p.x-prev.x,p.z-prev.z);out.push({x:p.x,z:p.z,tx:(q.x-p.x)/l,tz:(q.z-p.z)/l,s});prev=p;}
 return out;})();
/** A point `d` metres to the right of travel (negative = left). */
export const jettySide=(p:JettySample,d:number)=>({x:p.x-p.tz*d,z:p.z+p.tx*d});
/** The sample at a spiral angle (for placing things on a coil). */
export const coilAt=(theta:number,side=0)=>{const p=spiralPoint(theta),q=spiralPoint(theta-.001),l=Math.hypot(q.x-p.x,q.z-p.z),tx=(q.x-p.x)/l,tz=(q.z-p.z)/l;return {x:p.x-tz*side,z:p.z+tx*side,tx,tz};};

/** Jetty fishing (lib/town/fishing/fishCatalog.ts `east-pier`): the spiral's outermost east point, casting east. */
const EAST=spiralRadius(0);
export const EAST_PIER_FISHING={x:P.cx+EAST+1.6,z:P.cz,buoy:{x:P.cx+EAST+14,z:P.cz}};
/** Two islanders (lib/town/eastPierNpcs.ts): a fisher by the post and a kid doing keep-ups on the straight. */
export const EAST_PIER_NPC_SPOTS={fisher:{x:P.cx+EAST-1.2,z:P.cz-3},kid:{x:285,z:97.4}};
/** The lighthouse at the plaza centre (tower base radius r, 16.6 m to the cap) and the keeper's hut on its east side, clear of
 *  the walkway, which enters the plaza from the west. */
export const JETTY_BEACON={x:P.cx,z:P.cz,r:2.3,height:16.6};
export const KEEPER_HUT={x:P.cx+4.6,z:P.cz,w:2.4,d:3.2,h:2.3};

/**
 * Jetty shooting challenge. One floating target ring sits about 23 m off the spiral's outermost NORTH point (a plain tap shot
 * carries ~23 m before it lands: walkBall SHOT_SPEED 38 m/s, lift 3.2 m/s, gravity 13), at one of three spots. Land a shot inside
 * the ring from the painted kick spot and the ring moves to the next spot, so the player has to pick a new spot each time.
 * Teaching (verified 29 Sep 2026): FIFA Training Centre, "Creating chances and finishing (Urias)", key coaching points:
 * "Place shots either side of the goalkeeper to increase the chances of scoring, which ultimately boosts confidence." and
 * passes should let team-mates "finish accurately on goal".
 * https://www.fifatrainingcentre.com/en/practice/elite-sessions/in-possession/creating-chances-and-finishing.php
 */
const NORTH=spiralRadius(-Math.PI/2);
export const PIER_KICK_SPOT={x:P.cx,z:P.cz-NORTH-1.3};
export const PIER_TARGET_SPOTS=[{x:P.cx,z:PIER_KICK_SPOT.z-23.5},{x:P.cx-10,z:PIER_KICK_SPOT.z-21.5},{x:P.cx+10,z:PIER_KICK_SPOT.z-21.5}] as const;
export const PIER_TARGET_RADIUS=2.4;
/** Where challenge kicks count: the outer north stretch of the spiral around the painted spot. */
export const onEastPierHead=(x:number,z:number)=>onEastPier(x,z)&&Math.hypot(x-PIER_KICK_SPOT.x,z-PIER_KICK_SPOT.z)<=4;
export const PIER_CHALLENGE_TIP='Pick your spot before you shoot! Coaches say: place it where the keeper can’t reach, like either side of them. Aim first, then strike.';
export const PIER_CHALLENGE_SOURCE='https://www.fifatrainingcentre.com/en/practice/elite-sessions/in-possession/creating-chances-and-finishing.php';
/** One-off learning coins for the first ring hit (learn:explore:east-pier-target, 5 coins, never metered). Later hits: stat only. */
export const PIER_CHALLENGE_REWARD_ID='east-pier-target';
export type PierChallengeState={spot:number;hits:number;streak:number;best:number};
/** A splash counts when the ball lands inside the ring and the kicker is standing at the kick spot. Pure. */
export function pierTargetHit(state:PierChallengeState,splash:{x:number;z:number},kicker:{x:number;z:number}){
 const t=PIER_TARGET_SPOTS[state.spot%PIER_TARGET_SPOTS.length];
 return onEastPierHead(kicker.x,kicker.z)&&Math.hypot(splash.x-t.x,splash.z-t.z)<=PIER_TARGET_RADIUS;
}
/** Gentle aim help (like the island's shot assist for kick targets): a tap shot from the kick spot that already points within
 *  ~15° of the ring is steered onto it, so a child who faced the right spot is not beaten by an 8-way keyboard. Charged shots
 *  and shots pointing elsewhere are untouched. Returns the new yaw or null. Pure. */
export function pierAimYaw(state:PierChallengeState,kicker:{x:number;z:number},yaw:number):number|null{
 if(!onEastPierHead(kicker.x,kicker.z))return null;
 const t=PIER_TARGET_SPOTS[state.spot%PIER_TARGET_SPOTS.length],want=Math.atan2(t.x-kicker.x,t.z-kicker.z),delta=Math.atan2(Math.sin(want-yaw),Math.cos(want-yaw));
 return Math.abs(delta)<=.26?want:null;
}
/** Applies a jetty splash (only kicks from the kick spot count); returns the message to show, or '' for an unrelated splash. */
export function scorePierSplash(state:PierChallengeState,splash:{x:number;z:number},kicker:{x:number;z:number}):{hit:boolean;message:string}{
 if(!onEastPierHead(kicker.x,kicker.z))return {hit:false,message:''};
 if(pierTargetHit(state,splash,kicker)){
  state.hits++;state.streak++;state.best=Math.max(state.best,state.streak);state.spot=(state.spot+1)%PIER_TARGET_SPOTS.length;
  return {hit:true,message:state.hits===1?`On target! ${PIER_CHALLENGE_TIP}`:`On target! ${state.streak} in a row · the ring has moved: pick your new spot first.`};
 }
 state.streak=0;
 return {hit:false,message:'Just missed. Look at the ring, pick your spot, turn to face it, then kick.'};
}
