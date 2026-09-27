import type {TravelMode} from './travelModes';
import type {Obstacle} from './simulation';

/**
 * Rooftop gap jumps: running or riding off a roof edge toward a LOWER (or level) roof that is close enough
 * lands you on it with a jump arc instead of today's hang-and-fall.
 *
 * Cost: the planner runs only on the single frame the rooftop fall would start (rooftopTravel's edge check), so
 * there is no per-frame work anywhere else; while a jump is in the air it is one lerp per tick.
 *
 * Rules (all must hold, otherwise the existing edge fall happens unchanged, so falls never get easier):
 * - Travel mode walk / scooter / bike / moped (jetpack flies). Speed ≥ `minSpeed` for the mode: a full-stick jog on
 *   foot (joystick maxes at the 3.7 m/s walk pace, so no run button is needed on touch; Shift sprint reaches farther),
 *   real riding pace on wheels. A half-pushed stick walks off the edge and falls as before.
 * - Heading within ±`AIM_CONE_DEG` (32°) of the edge's outward normal.
 * - The first raised surface along the heading is within `maxGap` (measured straight across the gap, along the
 *   edge normal), is not higher than the take-off roof by more than `SAME_HEIGHT_TOLERANCE`, and not more than
 *   `MAX_DROP` lower (a taller roof is a wall; a huge drop is a fall).
 * - A safe landing spot (rooftopTravel.canLand) exists `landingDepth` (or a little less) inside the target, and
 *   the arc clears everything on the target roof on the way in.
 *
 * Constants were picked from the island's real building pairs: straight-across gaps are 1–9.5 m and drops 0–3 m.
 * Jogging clears ≤ 5 m, a Shift sprint ≤ 6 m, scooter 7 m, bike and moped 8 m.
 */
/** ±cone off the edge's outward normal. The brief asked for about ±25°; it is 32° because the island camera sits at a
 * fixed 31° yaw, so a single arrow key (or a stick pushed straight left/right/up on screen) runs 31° off every
 * axis-aligned roof edge. 32° keeps those screen-straight runs jumping while a clearly sideways run (≥ 40°) falls. */
export const AIM_CONE_DEG = 32;
export const SAME_HEIGHT_TOLERANCE = .35;
export const MAX_DROP = 4;
/** Forgiveness on the gap limit (m) so a kid who aims straight at a nominal-limit gap is not cheated by sampling. */
export const GAP_GRACE = .3;
export const ROOF_JUMP_LIMITS: Record<'walk'|'scooter'|'bike'|'moped', {minSpeed:number;maxGap:number;sprintGap?:number;landingDepth:number;apex:number}> = {
  walk: {minSpeed: 3.2, maxGap: 5, sprintGap: 6, landingDepth: 1.4, apex: 1.15},
  scooter: {minSpeed: 6, maxGap: 7, landingDepth: 2.2, apex: .95},
  bike: {minSpeed: 7, maxGap: 8, landingDepth: 2.6, apex: 1},
  moped: {minSpeed: 8, maxGap: 8, landingDepth: 2.8, apex: .9},
};
/** Walking speed from which the sprint gap starts to apply (walk max is 3.7, Shift sprint 6). */
export const SPRINT_SPEED = 4.6;
/** Air time bounds (s); reduced motion uses a lower arc and a shorter flight. */
export const JUMP_MIN_TIME = .42, JUMP_MAX_TIME = .95, JUMP_LAND_TIME = .32, REDUCED_APEX = .4, REDUCED_TIME_SCALE = .8;
/** Share of the take-off speed kept after touchdown (a walker checks up so the next edge is not a surprise). */
const CARRY = {walk: .55, scooter: .7, bike: .7, moped: .7} as const;

/**
 * Edge launch (rides only): riding off a roof edge at speed with NO reachable roof ahead no longer drops straight into
 * the fall. The rider is launched outward along the heading (same ride hop, arc, camera follow and boost sound), then
 * the existing hang → fall → knockdown sequence starts from the end of the arc. Distances grow with the vehicle:
 * scooter 4 m, bike 6 m, moped 8 m (the fastest ground vehicle that can reach a roof; trucks never do and the jetpack
 * flies). Any future ground mode falls back to 0.3 m per m/s of its top speed. The distance is scaled down for a
 * slower run-up (60–100 % of the base from minSpeed to top speed), clamped short of anything taller than the arc
 * (a wall, a sign, a tall prop) with a rider-radius margin, kept on the island and out of ground obstacles.
 * If the end of the launch is over a lower (≤ MAX_DROP) roof that is a safe landing, the rider lands on it as a
 * normal ride jump instead (forgiving for kids). Same speed threshold as the jump: slow rolling off still just falls,
 * and on foot nothing changes.
 */
export const LAUNCH_DISTANCE: Partial<Record<TravelMode, number>> = {scooter: 4, bike: 6, moped: 8};
export const LAUNCH_APEX: Partial<Record<TravelMode, number>> = {scooter: .8, bike: 1, moped: 1.2};
/** Launch stops this far short of a wall (more than the fall's 1.2 m 'roof just left' zone, so the wall still blocks the drift). */
export const LAUNCH_WALL_MARGIN = 1.5;
export const LAUNCH_MIN_TIME = .35, LAUNCH_MAX_TIME = .8;
/** Heading must point at least this much out of the roof (cosine to the edge normal) for a launch; grazing an edge falls. */
export const LAUNCH_MIN_COS = .25;
export type RoofJumpPlan = {kind?:'jump'|'launch';fromX:number;fromZ:number;toX:number;toZ:number;h0:number;h1:number;apex:number;duration:number;dirX:number;dirZ:number;speed:number;gap:number;drop:number;mode:'walk'|'scooter'|'bike'|'moped'};
export type RoofJumpQuery = {
  x:number;z:number;vx:number;vz:number;height:number;mode:TravelMode;
  /** Roof the player is leaving. */
  source:Obstacle|undefined;
  surface:(x:number,z:number)=>number;ground:(x:number,z:number)=>number;canLand:(x:number,z:number)=>boolean;
  reduced?:boolean;
  /** Launch only: true where the rider cannot end up (off the island, inside a ground obstacle). */
  blockedAt?:(x:number,z:number)=>boolean;
};

const COS_CONE = Math.cos(AIM_CONE_DEG*Math.PI/180);
const prefersReduced = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Outward normal of the source roof at the point the player crossed its edge (rounded corners follow the curve). */
export function edgeNormal(source:Obstacle,x:number,z:number,fallbackX:number,fallbackZ:number){
  const r = Math.min(source.cornerRadius??0, source.w/2, source.d/2);
  const hx = source.w/2-r, hz = source.d/2-r;
  const cx = source.x+Math.max(-hx,Math.min(hx,x-source.x)), cz = source.z+Math.max(-hz,Math.min(hz,z-source.z));
  let nx = x-cx, nz = z-cz;
  // Inside the inner rectangle (only on a crossing exactly at the boundary): use the nearest side.
  if (Math.hypot(nx,nz) < 1e-6) {
    const dx = source.w/2-Math.abs(x-source.x), dz = source.d/2-Math.abs(z-source.z);
    if (dx < dz) { nx = Math.sign(x-source.x)||Math.sign(fallbackX); nz = 0; } else { nx = 0; nz = Math.sign(z-source.z)||Math.sign(fallbackZ); }
  }
  // A square corner: split the normal onto the side the heading crosses most.
  if (!r && Math.abs(nx) > 1e-6 && Math.abs(nz) > 1e-6) { if (Math.abs(fallbackX*nx) >= Math.abs(fallbackZ*nz)) nz = 0; else nx = 0; }
  const length = Math.hypot(nx,nz)||1;
  return {x:nx/length,z:nz/length};
}

/** Decides whether leaving a roof here becomes a jump. Null keeps today's edge fall. Runs once per edge crossing. */
export function planRoofJump(q:RoofJumpQuery):RoofJumpPlan|null {
  if (q.mode === 'jetpack' || !q.source) return null;
  const mode = q.mode, limits = ROOF_JUMP_LIMITS[mode], speed = Math.hypot(q.vx,q.vz);
  if (speed < limits.minSpeed) return null;
  const dirX = q.vx/speed, dirZ = q.vz/speed, normal = edgeNormal(q.source,q.x,q.z,dirX,dirZ);
  const cos = dirX*normal.x+dirZ*normal.z;
  if (cos < COS_CONE) return null;
  const maxGap = mode === 'walk' && speed >= SPRINT_SPEED ? limits.sprintGap! : limits.maxGap;
  // March along the heading until the first raised surface (another roof) or the gap limit.
  const maxPath = (maxGap+GAP_GRACE)/cos+.2;
  let entry = -1, targetH = 0;
  for (let s = 0; s <= maxPath; s += .2) {
    const x = q.x+dirX*s, z = q.z+dirZ*s, h = q.surface(x,z);
    if (h > q.height+SAME_HEIGHT_TOLERANCE) return null;
    if (h > q.ground(x,z)+1) { entry = s; targetH = h; break; }
  }
  if (entry < 0) return null;
  const gap = entry*cos, drop = q.height-targetH;
  if (gap > maxGap+GAP_GRACE || drop > MAX_DROP) return null;
  const reduced = q.reduced ?? prefersReduced();
  // A drop tilts the parabola downward; a little extra lift keeps a visible rise off the lip.
  const apexBase = (reduced ? REDUCED_APEX : limits.apex)+Math.max(0,drop)*(reduced ? .1 : .3);
  for (let depth = limits.landingDepth; depth >= .8; depth -= .4) {
    const path = entry+depth, toX = q.x+dirX*path, toZ = q.z+dirZ*path;
    if (!q.canLand(toX,toZ) || Math.abs(q.surface(toX,toZ)-targetH) > .4) continue;
    const duration = Math.min(JUMP_MAX_TIME, Math.max(JUMP_MIN_TIME, path/Math.max(speed,4.5)))*(reduced ? REDUCED_TIME_SCALE : 1);
    const plan:RoofJumpPlan = {kind:'jump',fromX:q.x,fromZ:q.z,toX,toZ,h0:q.height,h1:targetH,apex:apexBase,duration,dirX,dirZ,speed,gap,drop,mode};
    // The arc must pass over anything standing on the target roof between its edge and the landing spot.
    let clear = true;
    for (let s = entry; s < path-.3 && clear; s += .3) clear = q.surface(q.x+dirX*s,q.z+dirZ*s) <= arcHeight(plan,s/path)-.15;
    if (clear) return plan;
  }
  return null;
}

export function launchDistanceFor(mode:TravelMode,speed:number,maxSpeed:number){
  const base = LAUNCH_DISTANCE[mode] ?? .3*maxSpeed, min = mode === 'walk' || mode === 'jetpack' ? Infinity : ROOF_JUMP_LIMITS[mode].minSpeed;
  if (!Number.isFinite(min)) return 0;
  const f = Math.max(0,Math.min(1,(speed-min)/Math.max(.01,maxSpeed-min)));
  return base*(.6+.4*f);
}

/** Launch off an edge with no roof in reach (rides only). Null = today's fall. Runs once per edge crossing. */
export function planRoofLaunch(q:RoofJumpQuery,maxSpeed:number):RoofJumpPlan|null {
  if (q.mode === 'walk' || q.mode === 'jetpack' || !q.source) return null;
  const mode = q.mode, limits = ROOF_JUMP_LIMITS[mode], speed = Math.hypot(q.vx,q.vz);
  if (speed < limits.minSpeed) return null;
  const dirX = q.vx/speed, dirZ = q.vz/speed, normal = edgeNormal(q.source,q.x,q.z,dirX,dirZ);
  if (dirX*normal.x+dirZ*normal.z < LAUNCH_MIN_COS) return null;
  const reduced = q.reduced ?? prefersReduced();
  const apex = (LAUNCH_APEX[mode] ?? 1)*(reduced ? .45 : 1);
  let distance = launchDistanceFor(mode,speed,maxSpeed)*(reduced ? .75 : 1);
  const probe = {h0:q.height,h1:q.height,apex};
  // Clamp short of anything the arc would pass through (the same clearance rule as the jump), and off-island.
  for (let s = .2; s <= distance; s += .2) {
    const x = q.x+dirX*s, z = q.z+dirZ*s;
    if (q.surface(x,z) > arcHeight(probe,s/distance)-.15 || q.blockedAt?.(x,z)) { distance = s-LAUNCH_WALL_MARGIN; break; }
  }
  if (distance < 1) return null;
  // Forgiving: if the arc ends over a lower roof with a safe spot, land on it as a ride jump.
  for (let d = distance; d >= Math.max(1,distance-2.4); d -= .4) {
    const toX = q.x+dirX*d, toZ = q.z+dirZ*d, h = q.surface(toX,toZ), drop = q.height-h;
    if (h > q.ground(toX,toZ)+1 && drop >= -SAME_HEIGHT_TOLERANCE && drop <= MAX_DROP && q.canLand(toX,toZ)) {
      const plan:RoofJumpPlan = {kind:'jump',fromX:q.x,fromZ:q.z,toX,toZ,h0:q.height,h1:h,apex:apex+Math.max(0,drop)*(reduced ? .1 : .3),duration:Math.min(JUMP_MAX_TIME,Math.max(JUMP_MIN_TIME,d/speed))*(reduced ? REDUCED_TIME_SCALE : 1),dirX,dirZ,speed,gap:d,drop,mode};
      let clear = true;
      for (let s = .2; s < d-.3 && clear; s += .3) clear = q.surface(q.x+dirX*s,q.z+dirZ*s) <= arcHeight(plan,s/d)-.15;
      if (clear) return plan;
    }
  }
  const toX = q.x+dirX*distance, toZ = q.z+dirZ*distance;
  return {kind:'launch',fromX:q.x,fromZ:q.z,toX,toZ,h0:q.height,h1:q.height,apex,duration:Math.min(LAUNCH_MAX_TIME,Math.max(LAUNCH_MIN_TIME,distance/speed))*(reduced ? REDUCED_TIME_SCALE : 1),dirX,dirZ,speed,gap:distance,drop:0,mode};
}

/** Height on the arc at flight fraction t (0 take-off, 1 touchdown). */
export function arcHeight(plan:Pick<RoofJumpPlan,'h0'|'h1'|'apex'>,t:number){ return plan.h0+(plan.h1-plan.h0)*t+plan.apex*4*t*(1-t); }

export type RoofJumpState = {
  /** In the air. */
  active:boolean;
  /** Flight fraction 0…1 while active. */
  t:number;
  /** Seconds since touchdown while the landing squash plays; -1 otherwise. */
  landAge:number;
  plan:RoofJumpPlan|null;
  /** One-tick flags for sound/haptics. `fall`: a launch just ended in the air, start today's hang/fall now. */
  started:boolean;landed:boolean;fall:boolean;
};

export function createRoofJump(){
  const state:RoofJumpState = {active:false,t:0,landAge:-1,plan:null,started:false,landed:false,fall:false};
  function start(plan:RoofJumpPlan){ Object.assign(state,{active:true,t:0,landAge:-1,plan,started:true,landed:false,fall:false}); }
  function reset(){ Object.assign(state,{active:false,t:0,landAge:-1,plan:null,started:false,landed:false,fall:false}); }
  /** Advances one tick. Returns the new height while this module owns the player, or null when normal movement runs. */
  function step(dt:number,p:{x:number;z:number},v:{x:number;z:number}):number|null {
    state.started = state.landed = state.fall = false;
    if (state.landAge >= 0) { state.landAge += dt; if (state.landAge >= JUMP_LAND_TIME) { state.landAge = -1; state.plan = null; } }
    if (!state.active || !state.plan) return null;
    const plan = state.plan;
    state.t = Math.min(1,state.t+dt/plan.duration);
    p.x = plan.fromX+(plan.toX-plan.fromX)*state.t; p.z = plan.fromZ+(plan.toZ-plan.fromZ)*state.t;
    if (state.t >= 1 && plan.kind === 'launch') {
      // Mid-air at the end of the launch: hand over to the existing hang → fall → knockdown.
      state.active = false; state.plan = null; state.fall = true; v.x = plan.dirX*plan.speed; v.z = plan.dirZ*plan.speed;
      return plan.h1;
    }
    if (state.t >= 1) {
      state.active = false; state.landAge = 0; state.landed = true;
      const carry = plan.speed*CARRY[plan.mode]; v.x = plan.dirX*carry; v.z = plan.dirZ*carry;
      return plan.h1;
    }
    v.x = plan.dirX*plan.speed; v.z = plan.dirZ*plan.speed;
    return arcHeight(plan,state.t);
  }
  return {state,start,reset,step};
}

/** Rig jump input for the on-foot jump (take-off → air → landing squash on JUMP_PHASE .24 → .7 → 1). */
export function roofJumpMotion(state:RoofJumpState,mode:TravelMode):{progress:number;height:number}|undefined {
  if (mode !== 'walk' || !state.plan) return undefined;
  if (state.active) return {progress:.24+.46*state.t,height:.35};
  if (state.landAge >= 0) return {progress:Math.min(1,.7+.3*state.landAge/JUMP_LAND_TIME),height:.35};
  return undefined;
}

type Posable = {rotation:{x:number};scale:{x:number;y:number;z:number}};
/** Ride hop (nose up off the lip, nose down to meet the roof, landing squash) for scooters, bikes and mopeds.
 * On foot the rig's own jump pose owns the body, so only a light root squash is added on touchdown. */
export function applyRoofJumpPose(state:RoofJumpState,mode:TravelMode,reduced:boolean,player:Posable,vehicle:Posable){
  if (!state.plan || mode === 'jetpack') return;
  const k = reduced ? .4 : 1;
  if (state.active && mode !== 'walk') {
    const t = state.t, pitch = (-.32*(1-t)*(1-t)+.22*t*t)*k;
    player.rotation.x += pitch; vehicle.rotation.x += pitch;
  }
  if (state.landAge >= 0) {
    const s = Math.sin(Math.PI*Math.min(1,state.landAge/JUMP_LAND_TIME))*(mode === 'walk' ? .06 : .16)*k;
    player.scale.y *= 1-s; player.scale.x *= 1+s*.4; player.scale.z *= 1+s*.4;
    if (mode !== 'walk') { vehicle.scale.y *= 1-s*.5; }
  }
}
