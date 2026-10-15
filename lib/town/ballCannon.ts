/**
 * Ball Cannon on Summit Isle (Oct 14 2026; user: "In this corner, add a chair that someone can sit on that's connected to a
 * cannon that shoots out soccer balls. You can choose to release clay discs that fly out and the cannon shoots balls to knock
 * them out. No score is needed, this is just for fun to waste time.").
 * Pure rules, no three.js and no DOM (tests/ball-cannon.cjs drives them); the 3D side is lib/graphics/ballCannon.ts, the static
 * prop lib/town/ballCannonWorld.ts, the HUD components/BallCannonHud.tsx (through lib/town/ballCannonStore.ts).
 *
 *  - Where: on the open grass just above Summit Isle's north beach, east of where the sandbar path comes ashore (the user's circle),
 *    on gentle ground, clear of the trails, the welcome and riddle boards, the trailhead orchard, the ranger and the bike test
 *    lines (tests/summit-rides.cjs drives straight down the north face along x ≈ 632, so the prop keeps east of it).
 *  - It fires out to sea only: the aim is limited to an arc round north-north-east, so every ball (and every disc from the trap)
 *    lands in the water north of the beach, never toward the sandbar, its path, the trailhead or the hikers.
 *  - No score, no coins, no records: a ball that meets a disc shatters it ("Nice!"), that is all.
 *  - Motion is closed form (p = p0 + v·t + ½·a·t²), so a ball or disc is in the same place at 20, 30 or 60 fps; a hit is the
 *    closest approach of the ball and the disc over the frame (both straight within a frame), so a fast ball never skips through.
 *
 * Yaw follows the game's convention: atan2(dx, dz) (yaw π looks north, toward −z).
 */
import {SUMMIT_LANDMARKS,summitGround,summitSlope,onSummitLand,onSummitIsle} from './summitIsle';

export type Vec3={x:number;y:number;z:number};
/** One projectile's flight: launched at `t0` (seconds on the runtime's clock) from `p` with velocity `v`, accelerating by `a`. */
export type Flight={p:Vec3;v:Vec3;a:Vec3;t0:number};

export const CANNON={
 /** Where the swivel base stands: an offset from the sandbar landing (so it follows the landing), searched for gentle ground. */
 offset:{dx:14.5,dz:10.8},search:1.5,maxSlope:.2,
 /** Base (a round timber deck): radius; the seat sits `seatBack` behind its centre, the barrel's ball joint `jointAhead` in front. */
 baseR:1.05,seatBack:.38,jointAhead:.55,jointUp:1.12,
 /** The seat top's height over the ground (lib/graphics/npcSeatPose.ts BENCH_SEAT_Y: the sitting pose's hips land on it). */
 seatY:.64,
 /** The firing arc: centred `bearing`° east of north, `arc`° either way; barrel pitch between `pitchMin`° and `pitchMax`°. */
 bearing:20,arc:24,pitchMin:10,pitchMax:40,pitchStart:22,
 /** Ball: muzzle speed (m/s), gravity, the barrel's length from the joint to the muzzle, radius (a size-5 ball, drawn a little big
  *  so it reads at 30 m), the seconds between shots and the most in the air at once. */
 ballSpeed:27,gravity:9.8,muzzle:1.25,ballR:.15,cooldown:.32,balls:8,
 /** How close (m, centre to centre) a ball must pass a disc to knock it out: generous for 7–12 year olds. */
 hitR:.85,
 /** Clay discs: the most in the air at once, radius, launch speed and elevation ranges, their lighter fall (they glide). */
 discs:6,discR:.24,discSpeed:[14,17.5] as readonly [number,number],discElev:[30,42] as readonly [number,number],discGravity:6.2,
 /** Discs leave the trap heading this many degrees east of north (across the cannon's view from the left, away from the sandbar). */
 discBearing:[4,30] as readonly [number,number],
 /** A Pull launches two, the second this long after the first. */
 pullGap:.32,
 /** Shards per broken disc (fewer with reduced motion) and how long they fly. */
 shards:24,shardsPerHit:6,shardsReduced:3,shardLife:1,shardLifeReduced:.45,
 /** Anything still flying after this long is put away. */
 maxFlight:7,
 /** Drag aim: degrees per CSS pixel; keys / stick: degrees per second at full tilt. */
 dragDegPerPx:.18,keyYawDegPerSec:55,keyPitchDegPerSec:32,
 /** On foot within this many metres of the base: the "Sit in the ball cannon" prompt. */
 reach:3.2,
} as const;

const D=Math.PI/180;
/** Yaw (atan2(dx,dz)) of a bearing measured in degrees east of north. */
export const yawOfBearing=(deg:number)=>Math.PI-deg*D;
/** The arc centre's yaw. */
export const CENTRE_YAW=yawOfBearing(CANNON.bearing);

export type CannonLayout={
 /** The base's centre and its ground (the deck sits level on its highest corner). */
 x:number;z:number;ground:number;deck:number;
 /** The seat (the player's spot while sitting) and its facing (the arc centre). */
 seat:{x:number;z:number;ground:number;yaw:number};
 /** The barrel's ball joint (it turns about it). */
 joint:Vec3;
 /** Where you stand to get in, and where you step off to (behind the seat, outside the base). */
 stand:{x:number;z:number};
 /** The clay trap: a few metres to the left (the sandbar side), a little seaward; discs leave from `launch` and fly away from it. */
 trap:{x:number;z:number;ground:number;yaw:number;launch:Vec3};
};

/** The base's spot: the nearest gentle, walkable ground to the target (a 0.25 m grid within CANNON.search), as telescopeSpot does. */
export function cannonLayout():CannonLayout{
 const L=SUMMIT_LANDMARKS.sandbarLanding,tx=L.x+CANNON.offset.dx,tz=L.z+CANNON.offset.dz,step=.25,n=Math.round(CANNON.search/step);
 const good=(x:number,z:number)=>onSummitIsle(x,z)&&summitSlope(x,z)<=CANNON.maxSlope&&[[1,0],[-1,0],[0,1],[0,-1]].every(([a,b])=>onSummitIsle(x+a*2,z+b*2));
 let best={x:tx,z:tz},bestD=Infinity;
 for(let i=-n;i<=n;i++)for(let j=-n;j<=n;j++){const d=Math.hypot(i,j)*step;if(d>CANNON.search+1e-9||d>=bestD)continue;if(good(tx+i*step,tz+j*step)){bestD=d;best={x:tx+i*step,z:tz+j*step};}}
 const {x,z}=best,fx=Math.sin(CENTRE_YAW),fz=Math.cos(CENTRE_YAW),rx=-fz,rz=fx;// forward (the arc centre) and right (as you sit)
 let deck=-Infinity;for(let a=0;a<8;a++)deck=Math.max(deck,summitGround(x+Math.cos(a*Math.PI/4)*CANNON.baseR,z+Math.sin(a*Math.PI/4)*CANNON.baseR));
 const ground=summitGround(x,z);deck=Math.max(deck,ground)+.06;
 const sx=x-fx*CANNON.seatBack,sz=z-fz*CANNON.seatBack;
 const jx=x+fx*CANNON.jointAhead,jz=z+fz*CANNON.jointAhead;
 // The trap: 4 m to the left of the seat and 1.4 m seaward, facing its launch spread's middle.
 const qx=x-rx*4+fx*1.4,qz=z-rz*4+fz*1.4,qg=summitGround(qx,qz),qyaw=yawOfBearing((CANNON.discBearing[0]+CANNON.discBearing[1])/2);
 return {x,z,ground,deck,seat:{x:sx,z:sz,ground:summitGround(sx,sz),yaw:CENTRE_YAW},joint:{x:jx,y:summitGround(x,z)+CANNON.jointUp,z:jz},
  stand:{x:x-fx*(CANNON.baseR+.95),z:z-fz*(CANNON.baseR+.95)},
  trap:{x:qx,z:qz,ground:qg,yaw:qyaw,launch:{x:qx+Math.sin(qyaw)*.35,y:qg+.95,z:qz+Math.cos(qyaw)*.35}}};
}

/** The aim, clamped to the arc: `yaw` is the offset from the arc centre (radians, + = to the left as yaw grows westward). */
export type Aim={yaw:number;pitch:number};
export const startAim=():Aim=>({yaw:0,pitch:CANNON.pitchStart*D});
export function clampAim(a:Aim):Aim{return {yaw:Math.max(-CANNON.arc*D,Math.min(CANNON.arc*D,a.yaw)),pitch:Math.max(CANNON.pitchMin*D,Math.min(CANNON.pitchMax*D,a.pitch))};}
/** The world yaw the barrel points at. */
export const aimYaw=(a:Aim)=>CENTRE_YAW+a.yaw;
/** Unit direction of the barrel. */
export function aimDir(a:Aim):Vec3{const y=aimYaw(a),c=Math.cos(a.pitch);return {x:Math.sin(y)*c,y:Math.sin(a.pitch),z:Math.cos(y)*c};}
/** Drag aim: drag right → the barrel turns right, drag up → it lifts (CSS pixels). */
export function aimByDrag(a:Aim,dxPx:number,dyPx:number):Aim{const k=CANNON.dragDegPerPx*D;return clampAim({yaw:a.yaw-dxPx*k,pitch:a.pitch-dyPx*k*.7});}
/** Keys / stick: x right, y down (each −1…1) over dt seconds. */
export function aimBySteer(a:Aim,x:number,y:number,dt:number):Aim{return clampAim({yaw:a.yaw-x*CANNON.keyYawDegPerSec*D*dt,pitch:a.pitch-y*CANNON.keyPitchDegPerSec*D*dt});}

/** A ball fired now along the aim, from the muzzle. */
export function fireBall(L:CannonLayout,a:Aim,t0:number):Flight{
 const d=aimDir(a),m=CANNON.muzzle,s=CANNON.ballSpeed;
 return {p:{x:L.joint.x+d.x*m,y:L.joint.y+d.y*m,z:L.joint.z+d.z*m},v:{x:d.x*s,y:d.y*s,z:d.z*s},a:{x:0,y:-CANNON.gravity,z:0},t0};
}
/** Position at time `t` (clock seconds) into `out`. */
export function flightAt(f:Flight,t:number,out:Vec3={x:0,y:0,z:0}):Vec3{const u=Math.max(0,t-f.t0);out.x=f.p.x+f.v.x*u+.5*f.a.x*u*u;out.y=f.p.y+f.v.y*u+.5*f.a.y*u*u;out.z=f.p.z+f.v.z*u+.5*f.a.z*u*u;return out;}

/** A small deterministic generator (mulberry32): the same seed always throws the same disc. */
export function discRandom(seed:number){let s=seed>>>0;return ()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
/** Disc number `n` from the trap: a varied arc (speed, elevation, heading, a gentle sideways curve), all from the seed. */
export function throwDisc(L:CannonLayout,n:number,t0:number):Flight{
 const r=discRandom(0x9e37+n*7919),lerp=(lo:number,hi:number,k:number)=>lo+(hi-lo)*k;
 const speed=lerp(CANNON.discSpeed[0],CANNON.discSpeed[1],r()),elev=lerp(CANNON.discElev[0],CANNON.discElev[1],r())*D,yaw=yawOfBearing(lerp(CANNON.discBearing[0],CANNON.discBearing[1],r()));
 const c=Math.cos(elev),curve=(r()-.5)*2.4,side={x:Math.cos(yaw),z:-Math.sin(yaw)};
 return {p:{...L.trap.launch},v:{x:Math.sin(yaw)*c*speed,y:Math.sin(elev)*speed,z:Math.cos(yaw)*c*speed},a:{x:side.x*curve,y:-CANNON.discGravity,z:side.z*curve},t0};
}

/** What is under a point: the island's ground (walkable land), else the sea at y = 0. */
export function surfaceAt(x:number,z:number){return onSummitLand(x,z)?{y:Math.max(0,summitGround(x,z)),sea:false}:{y:0,sea:true};}
/** Where and when a flight comes down (stepped at 1/120 s; tests and the runtime's end check agree). */
export function flightLanding(f:Flight,max=CANNON.maxFlight){
 const p={x:0,y:0,z:0};for(let u=1/120;u<=max;u+=1/120){flightAt(f,f.t0+u,p);if(u>.1){const s=surfaceAt(p.x,p.z);if(p.y<=s.y)return {x:p.x,z:p.z,y:s.y,sea:s.sea,t:u};}}
 return null;
}

/** Closest approach (m) of two points each moving straight from a0→a1 and b0→b1 over the same frame. */
export function sweptDistance(a0:Vec3,a1:Vec3,b0:Vec3,b1:Vec3){
 const dx=a0.x-b0.x,dy=a0.y-b0.y,dz=a0.z-b0.z,ex=(a1.x-b1.x)-dx,ey=(a1.y-b1.y)-dy,ez=(a1.z-b1.z)-dz,e2=ex*ex+ey*ey+ez*ez;
 const s=e2>1e-12?Math.max(0,Math.min(1,-(dx*ex+dy*ey+dz*ez)/e2)):0;
 return Math.hypot(dx+ex*s,dy+ey*s,dz+ez*s);
}
/** Did the ball knock the disc out this frame? */
export const discHit=(b0:Vec3,b1:Vec3,d0:Vec3,d1:Vec3)=>sweptDistance(b0,b1,d0,d1)<=CANNON.hitR;

/** The cheerful word on a hit (no score: a little variety only). */
export const HIT_WORDS=['Nice!','Smashed it!','Great shot!','Boom!','Nice!'] as const;
export const hitWord=(n:number)=>HIT_WORDS[n%HIT_WORDS.length];
