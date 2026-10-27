export const BLOCK_LENGTH = 28;
export const BLOCKS_PER_DISTRICT = 4;
export const ROUTE_BLOCKS = 12;
export const DISTRICT_LENGTH = BLOCK_LENGTH * BLOCKS_PER_DISTRICT;
export const ROUTE_LENGTH = BLOCK_LENGTH * ROUTE_BLOCKS;
export const DISTRICTS = [
  { name: "THE BOARDWALK", subtitle: "Find your rhythm", kind: 2 },
  { name: "OLD TOWN", subtitle: "Through the football district", kind: 1 },
  { name: "CLUB GROUNDS", subtitle: "Play for the crowd", kind: 0 },
] as const;

export function districtAt(distance: number) {
  return DISTRICTS[Math.floor(Math.max(0, distance) / DISTRICT_LENGTH) % DISTRICTS.length];
}

/** Only blocks inside the visible corridor need rendering or shadow draws. */
export function visibleBlock(z: number) { return z >= -30 && z <= 100; }

/* ------------------------------------------------------------------------------------------
 * Winding, hilly route (Oct 9 2026). Pure maths shared by the simulation (slope pace, bends)
 * and the renderer (vertex bend table). The game itself stays a straight three-lane sim:
 * the route only bends how it LOOKS and adds slope/bend rules, so every collision and lane
 * rule is unchanged and exactly as fair as before.
 *
 * The route is a chain of ROUTE_SEGMENT-metre segments. Segment i spans
 * [i*L - L/2, i*L + L/2) and eases a heading change (turn, radians) and a height change
 * (rise, metres) with a smoothstep, so heading, height, curvature and grade are all
 * continuous and curvature/grade are zero where segments join. Stage boundaries
 * (every 360 m) fall mid-segment, where grade and curvature change slowest.
 * Deterministic per segment index: the same run always has the same hills.
 * ---------------------------------------------------------------------------------------- */
export const ROUTE_SEGMENT = 60;
/** Peak heading change (rad) and rise (m) per segment for stages 1..8+: difficulty ramps with curvature and steepness. */
export const ROUTE_TURN = [.32, .42, .54, .64, .72, .8, .86, .9] as const;
export const ROUTE_RISE = [2.2, 3, 3.8, 4.6, 5.2, 5.8, 6.2, 6.4] as const;
/** Steepest rise any profile may use per segment (m): grade stays under ~22 % so slopes read clearly but stay fair. */
export const ROUTE_RISE_CAP = 8.6;
/** Curvature (1/m) above which a stretch counts as a bend for the inside-line rule. */
export const ROUTE_BEND_MIN = .0045;
/** Grade above which the HUD calls a climb or a descent. */
export const ROUTE_STEEP = .05;

const hash = (i: number, salt: number) => {
  let x = Math.imul(i + 1013, 0x9e3779b1) ^ Math.imul(salt + 7, 0x85ebca6b);
  x ^= x >>> 15; x = Math.imul(x, 0x2c1b3c6d); x ^= x >>> 12; x = Math.imul(x, 0x297a2d39); x ^= x >>> 15;
  return (x >>> 0) / 4294967296;
};
const smooth = (u: number) => u * u * (3 - 2 * u);
const dsmooth = (u: number) => 6 * u * (1 - u);
const L = ROUTE_SEGMENT;
export const routeSegmentAt = (s: number) => Math.floor((s + L / 2) / L);
/** Stage index (0..7) of a segment, from its centre distance. */
const stageOf = (i: number) => Math.min(ROUTE_TURN.length - 1, Math.floor(Math.max(0, i * L) / 360));
/** Goals appear at 90 + 180k m and stand 60 m ahead: their segments stay gentle so finishing reads cleanly. */
const goalSegment = (i: number) => i >= 3 && (i - 3) % 3 === 0;
const gentle = (i: number) => (i <= 0 ? 0 : i === 1 ? .45 : goalSegment(i) ? .35 : 1);

/** Heading change of segment i (rad, + = bends right). Mostly alternating S-bends, some straights. */
function turnOf(i: number) {
  const k = gentle(i); if (!k) return 0;
  const stage = stageOf(i);
  if (finishSegment(i) >= 0) return finishSegment(i) === 0 ? 0 : sign01(i) * ROUTE_TURN[stage] * .35 * profile.turn;
  if (hash(i, 1) < (stage === 0 ? .2 : .12)) return 0;
  const sign = (i % 2 ? 1 : -1) * (hash(i, 2) < .25 ? -1 : 1);
  return sign * ROUTE_TURN[stage] * (.55 + .45 * hash(i, 3)) * k * profile.turn;
}
/** Height change of segment i (m). Climbs and descents alternate so crests and dips follow each other. */
function riseOf(i: number) {
  const k = gentle(i); if (!k) return 0;
  const stage = stageOf(i);
  // Finite routes end on a long climb to the goal line, then a flat finishing segment.
  const f = finishSegment(i);
  if (f === 0) return 0;
  if (f > 0) return Math.min(ROUTE_RISE_CAP, ROUTE_RISE[stage] * profile.rise * (f === 1 ? .7 : 1));
  if (hash(i + profile.salt, 5) < .18) return 0;
  const sign = (i % 2 ? -1 : 1) * (hash(i + profile.salt, 6) < .2 ? -1 : 1);
  return sign * Math.min(ROUTE_RISE_CAP, ROUTE_RISE[stage] * profile.rise * (.5 + .5 * hash(i + profile.salt, 4))) * k;
}
const sign01 = (i: number) => (i % 2 ? 1 : -1);
/** For finite routes: 0 = the finishing segment, 1..3 = the final hill segments before it, -1 otherwise. */
function finishSegment(i: number) {
  if (!profile.finish) return -1;
  const last = routeSegmentAt(profile.finish), back = last - i;
  return back >= 0 && back <= 3 ? back : -1;
}
/* ------------------------------------------------------------------------------------------
 * Route profile (Oct 26 2026, round 3): hard routes scale the hills and bends, finite routes end on
 * a final hill to the goal line, and each route has its own sequence of terrain zones. The default
 * profile is the classic endless route, so every existing rule and test is unchanged.
 * ---------------------------------------------------------------------------------------- */
export type RouteProfile = { rise: number; turn: number; finish: number; salt: number; terrains: readonly TerrainId[] };
export const DEFAULT_TERRAINS: readonly TerrainId[] = ['grass', 'cobbles', 'neon', 'sand', 'bridge', 'rooftop'];
const DEFAULT_PROFILE: RouteProfile = { rise: 1, turn: 1, finish: 0, salt: 0, terrains: DEFAULT_TERRAINS };
let profile: RouteProfile = DEFAULT_PROFILE;
/** Select the route profile (called when a run starts). Clears the segment memo and height cache. */
export function setRouteProfile(p: Partial<RouteProfile> = {}) {
  profile = { ...DEFAULT_PROFILE, ...p };
  memoI.fill(NaN); heightCache.length = 1;
}
export const routeProfile = () => profile;

/* ---- terrain zones: one look, one surface feel, one sound per zone ---- */
export type TerrainId = 'grass' | 'sand' | 'cobbles' | 'snow' | 'mud' | 'neon' | 'rooftop' | 'bridge';
/** Ground look (road, land, pattern id for the terrain shader), surface feel and the footstep sound.
 * speed: pace multiplier; grip: lane-change spring multiplier (lower = slidier). Both stay within ±8 % so
 * every read window holds. The tip says the football lesson of the surface in a child's words. */
export const TERRAINS: Record<TerrainId, { name: string; tip: string; road: string; land: string; pattern: number; speed: number; grip: number; step: 'grass' | 'sand' | 'hard' | 'snow' | 'mud' | 'wood' }> = {
  grass: { name: 'GRASS PITCH', tip: 'Fast and true: pass and move', road: '#2f7a4c', land: '#123524', pattern: 0, speed: 1, grip: 1, step: 'grass' },
  sand: { name: 'SAND BEACH', tip: 'Soft sand slows you: lift your knees', road: '#d8b878', land: '#8f7449', pattern: 1, speed: .95, grip: .92, step: 'sand' },
  cobbles: { name: 'COBBLED STREET', tip: 'Bumpy ball: keep your touches small', road: '#7a7488', land: '#2c2838', pattern: 2, speed: 1, grip: .96, step: 'hard' },
  snow: { name: 'SNOW', tip: 'Slippy! Change lanes a little early', road: '#e6eef8', land: '#9fb3cc', pattern: 3, speed: .95, grip: .84, step: 'snow' },
  mud: { name: 'WET MUD', tip: 'Heavy pitch: jump the puddles', road: '#5b4330', land: '#2c2016', pattern: 4, speed: .93, grip: .88, step: 'mud' },
  neon: { name: 'NEON STADIUM', tip: 'Fast floor: look up early', road: '#1d2a52', land: '#0c0f25', pattern: 5, speed: 1.04, grip: 1, step: 'hard' },
  rooftop: { name: 'ROOFTOPS', tip: 'High up! Keep your eyes on the next line', road: '#8a4f45', land: '#3a2430', pattern: 6, speed: 1.02, grip: 1, step: 'hard' },
  bridge: { name: 'THE BRIDGE', tip: 'Wooden boards: stay in your lane', road: '#9a6b42', land: '#16304a', pattern: 7, speed: 1, grip: .96, step: 'wood' },
};
export const TERRAIN_IDS = Object.keys(TERRAINS) as TerrainId[];
/** Metres per terrain zone, and the blend at each change (look and feel ease across it). */
export const TERRAIN_ZONE = 240;
export const TERRAIN_BLEND = 14;
/** Zone index at distance s (zone 0 starts at kick-off). */
export const terrainZoneAt = (s: number) => Math.floor(Math.max(0, s) / TERRAIN_ZONE);
/** Terrain of a zone index in the current profile. */
export const terrainOfZone = (zone: number) => profile.terrains[((zone % profile.terrains.length) + profile.terrains.length) % profile.terrains.length];
export const terrainAt = (s: number) => terrainOfZone(terrainZoneAt(s));
/** Surface feel at s, blended across the zone change so speed and grip never jump. */
export function terrainFeel(s: number, out: { speed: number; grip: number }) {
  const zone = terrainZoneAt(s), a = TERRAINS[terrainOfZone(zone)], into = s - zone * TERRAIN_ZONE;
  if (zone > 0 && into < TERRAIN_BLEND) {
    const b = TERRAINS[terrainOfZone(zone - 1)], t = smooth(Math.max(0, into) / TERRAIN_BLEND);
    out.speed = b.speed + (a.speed - b.speed) * t; out.grip = b.grip + (a.grip - b.grip) * t;
  } else { out.speed = a.speed; out.grip = a.grip; }
  return out;
}

// Tiny memo: the per-frame bend table reads the same few segments ~150 times.
const memoI = new Float64Array(32).fill(NaN), memoT = new Float64Array(32), memoR = new Float64Array(32);
const memo = (i: number) => { const k = i & 31; if (memoI[k] !== i) { memoI[k] = i; memoT[k] = turnOf(i); memoR[k] = riseOf(i); } return k; };
/** Heading change of segment i (rad, + = bends right). */
export const routeTurn = (i: number) => memoT[memo(i)];
/** Height change of segment i (m). */
export const routeRise = (i: number) => memoR[memo(i)];
const at = (s: number) => { const i = routeSegmentAt(s); return { i, u: (s + L / 2) / L - i }; };
/** Signed curvature at distance s (1/m, + = turning right). */
export function routeCurve(s: number) { const { i, u } = at(s); return routeTurn(i) * dsmooth(u) / L; }
/** Grade at distance s (dH/ds: + = uphill). */
export function routeGrade(s: number) { const { i, u } = at(s); return routeRise(i) * dsmooth(u) / L; }
/** Rate of change of grade (1/m): negative over a crest, positive in a dip. */
export function routeGradeChange(s: number) { const { i, u } = at(s); return routeRise(i) * (6 - 12 * u) / (L * L); }
// Prefix sums of segment rises from segment 0 (grown on demand, reset with the profile).
const heightCache: number[] = [0];
/** Absolute ground height at distance s (m, kick-off = 0): one cheap function of route position. */
export function routeHeight(s: number) {
  const { i, u } = at(s);
  if (i <= 0) return i < 0 ? 0 : routeRise(0) * smooth(u);
  while (heightCache.length <= i) { const j = heightCache.length; heightCache.push(heightCache[j - 1] + routeRise(j - 1)); }
  return heightCache[i] + routeRise(i) * smooth(u);
}

/** Heading and height at s relative to the start of segment `base` (bounded loop: the window spans a few segments). */
function local(s: number, base: number, out: { h: number; H: number }) {
  const { i, u } = at(s); let h = 0, H = 0;
  if (i >= base) for (let j = base; j < i; j++) { h += routeTurn(j); H += routeRise(j); }
  else for (let j = i; j < base; j++) { h -= routeTurn(j); H -= routeRise(j); }
  out.h = h + routeTurn(i) * smooth(u); out.H = H + routeRise(i) * smooth(u);
  return out;
}
const tmp = { h: 0, H: 0 }, tmp0 = { h: 0, H: 0 };
/** Heading of the route `ahead` metres past s, relative to the heading at s (rad). */
export function routeHeadingAhead(s: number, ahead: number) {
  const base = routeSegmentAt(s); local(s, base, tmp0); local(s + ahead, base, tmp); return tmp.h - tmp0.h;
}

export type RouteBendOptions = { d0: number; step: number; n: number; yaw: number; viewSlope: number; drop: number };
/**
 * Fill `out` (n × vec4: x, z, heading, height) with the route centreline relative to the runner at s0, for
 * along-track distances d = d0 + k*step. Positions are in the runner's straight frame (forward = -z), rotated by
 * the camera look-ahead `yaw`; height subtracts a share of the current grade (`viewSlope`, a calmer horizon)
 * and a gentle `drop`·d² fall-off ahead so the horizon and the next bend come into view.
 * No allocation: reused scratch objects only.
 */
export function routeBendTable(s0: number, out: Float32Array, o: RouteBendOptions) {
  const base = routeSegmentAt(s0); local(s0, base, tmp0);
  const h0 = tmp0.h, H0 = tmp0.H, c = Math.cos(o.yaw), sn = Math.sin(o.yaw), half = o.step / 2;
  const k0 = Math.round(-o.d0 / o.step);
  const write = (k: number, d: number, x: number, z: number) => {
    local(s0 + d, base, tmp); const j = k * 4;
    out[j] = x * c + z * sn; out[j + 1] = z * c - x * sn; out[j + 2] = tmp.h - h0 - o.yaw;
    out[j + 3] = tmp.H - H0 - o.viewSlope * d - o.drop * Math.max(0, d) * Math.max(0, d);
  };
  for (const dir of [1, -1]) {
    let x = 0, z = 0;
    if (dir > 0) write(k0, 0, 0, 0);
    for (let k = k0 + dir; k >= 0 && k < o.n; k += dir) {
      const dEnd = o.d0 + k * o.step;
      // Two midpoint sub-steps per sample.
      for (let sub = 0; sub < 2; sub++) {
        const dMid = dEnd - dir * (o.step - half * (sub + .5));
        const h = local(s0 + dMid, base, tmp).h - h0;
        x += dir * Math.sin(h) * half; z -= dir * Math.cos(h) * half;
      }
      write(k, dEnd, x, z);
    }
  }
  return out;
}
