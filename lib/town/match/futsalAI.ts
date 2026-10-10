// Futsal AI helpers for the live match on the Palm Coast Rooftop (lib/town/match/matchSim.ts, format 'futsal').
// Pure maths, no allocations: every function writes into caller-owned objects/arrays so the sim can call them on its
// think clock without garbage. The knobs that switch these on live in formatAI.ts (FORMAT_AI.futsal); every other
// format keeps them at their neutral values, so this file never moves 7v7 / 9v9 / 11v11 / beach.
//
// FIFA Futsal Laws of the Game 2024-25 used here:
//  - Law 15/16/17: at a kick-in, a corner kick or a free kick the opponents stand at least 5 m from the ball;
//  - the 4-second count: a restart must be taken within 4 seconds of the taker being ready, and a keeper may not
//    control the ball in his own half for more than 4 seconds;
//  - Law 12: once the keeper has released the ball he may not touch it again in his own half until an opponent has
//    played or touched it (so team-mates do not pass back to him);
//  - goal clearance: the keeper THROWS the ball back into play from his penalty area (no goal kicks in futsal).
// Coaching habits (ages 7-12): pick up your player and stay between him and the goal; when a team-mate has a
// clearly better chance, give him the ball (the extra pass); keep 5 m away at a kick-in.

export const FUTSAL_RING_M = 5;
export const FUTSAL_COUNT_S = 4;
/** Man-oriented marking: units goal-side of the attacker next to the ball, and the most a far-side marker sags toward the ball. */
export const MARK_GAP = 12;
export const MARK_SAG = 0.35;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Field units → metres on a pitch of `widthM` x `lengthM` (250 units across, 380 units goal line to goal line; see venues.ts). */
export function metresBetween(ax: number, ay: number, bx: number, by: number, widthM: number, lengthM: number): number {
  return Math.hypot((ax - bx) * widthM / 250, (ay - by) * lengthM / 380);
}

/**
 * Keep a player `rM` metres (+ margin) from a restart spot: writes the nearest legal point into `out` and returns true
 * when he had to move. A spot on the touchline pushes him infield; anyone standing on top of the spot steps toward the
 * middle of the pitch. The result is clamped to the playing area (x 14..256, y 12..388).
 */
export function ringPush(out: { x: number; y: number }, x: number, y: number, sx: number, sy: number, rM: number, widthM: number, lengthM: number, margin = 0.4): boolean {
  const kx = widthM / 250, ky = lengthM / 380, R = rM + margin;
  let mx = (x - sx) * kx, my = (y - sy) * ky;
  let d = Math.hypot(mx, my);
  out.x = x; out.y = y;
  if (d >= rM) return false;
  if (d < 1e-6) { mx = (135 - sx) * kx; my = (200 - sy) * ky; d = Math.hypot(mx, my) || 1; }
  out.x = clamp(sx + (mx / d) * R / kx, 14, 256);
  out.y = clamp(sy + (my / d) * R / ky, 12, 388);
  // clamped back inside the ring (the spot is near a line): slide along the long axis instead
  if (metresBetween(out.x, out.y, sx, sy, widthM, lengthM) < rM) {
    const rest = Math.sqrt(Math.max(0, R * R - ((out.x - sx) * kx) ** 2)) / ky;
    const up = sy + rest <= 388 && (my >= 0 || sy - rest < 12);
    out.y = clamp(sy + (up ? rest : -rest), 12, 388);
  }
  return true;
}

/**
 * Goal-side marking spot for the attacker at (ax, ay): `gap` units between him and the centre of the goal on y = gy,
 * shaded toward the ball at (bx, by). An attacker far from the ball gets weak-side help: the marker sags up to `sag`
 * of the way toward the ball so he can still cover the middle (the futsal "closing the inside"). Writes into `out`.
 */
export function markSpot(out: { x: number; y: number }, ax: number, ay: number, gy: number, bx: number, by: number, gap: number, sag: number) {
  const gdx = 135 - ax, gdy = gy - ay, gl = Math.hypot(gdx, gdy) || 1;
  const bdx = bx - ax, bdy = by - ay, bl = Math.hypot(bdx, bdy);
  const help = clamp((bl - 60) / 180, 0, 1) * sag; // 0 near the ball (touch-tight), up to `sag` on the far side
  const g = gap + clamp((bl - 60) * 0.06, 0, 10); // a little looser on a man the ball cannot reach yet
  out.x = clamp(ax + (gdx / gl) * g + bdx * help, 14, 256);
  out.y = clamp(ay + (gdy / gl) * g + bdy * help, 12, 388);
}

/**
 * Greedy marking assignment with stickiness: each defender d (positions dx/dy) is given one attacker a (marking spots
 * sx/sy), cheapest pair first, where a defender already marking a keeps a `keep`-unit discount (no flip-flopping
 * between two attackers). `prev[d]` is d's previous attacker index (-1 none); the result goes into `out[d]` (-1 when
 * there are more defenders than attackers). `used` is scratch (length >= attackers). Allocation-free.
 */
export function assignMarks(dx: ArrayLike<number>, dy: ArrayLike<number>, nd: number, sx: ArrayLike<number>, sy: ArrayLike<number>, na: number, prev: ArrayLike<number>, keep: number, out: number[], used: boolean[]) {
  for (let i = 0; i < nd; i++) out[i] = -1;
  for (let j = 0; j < na; j++) used[j] = false;
  const rounds = Math.min(nd, na);
  for (let r = 0; r < rounds; r++) {
    let bi = -1, bj = -1, bc = Infinity;
    for (let i = 0; i < nd; i++) {
      if (out[i] >= 0) continue;
      for (let j = 0; j < na; j++) {
        if (used[j]) continue;
        const c = Math.hypot(dx[i] - sx[j], dy[i] - sy[j]) - (prev[i] === j ? keep : 0);
        if (c < bc) { bc = c; bi = i; bj = j; }
      }
    }
    if (bi < 0) break;
    out[bi] = bj; used[bj] = true;
  }
}

/** Base chance quality of a strike from (x, y) at the goal on y = gy: the same range/angle curve the sim's doShot uses
 *  (before the per-format finish multiplier), so the extra-pass read compares like with like. */
export function chanceQuality(x: number, y: number, gy: number): number {
  const d = Math.hypot(x - 135, y - gy), ang = Math.abs(x - 135);
  return clamp(0.34 - (d - 28) * 0.0035, 0.05, 0.34) * clamp(1.15 - ang / 60, 0.35, 1);
}
/** How much defenders standing in the shooting lane spoil a strike (the sim's shoot-decision factor). */
export const laneFactor = (blockers: number) => (blockers === 0 ? 1 : blockers === 1 ? 0.62 : 0.18);

/** The extra pass: a team-mate's chance must beat the shooter's by `ratio` AND by a clear absolute margin. */
export function isBetterChance(own: number, mate: number, ratio: number, margin = 0.04): boolean {
  return mate > own * ratio && mate - own > margin;
}

/** The live feed's futsal coaching lines (text, reason). */
export const FUTSAL_NOTES = {
  kickIn: (team: string) => [`Kick-in for ${team}`, "Futsal comes back in with the feet: ball still on the line, 4 seconds to take it, and defenders stand 5 m away"],
  clearance: ["Goal clearance", "In futsal the keeper throws it back in from his area, and he has 4 seconds to let it go"],
  backPass: ["Keeper can't have it back", "Once the keeper has passed it, he can't touch it again in his own half until the other team does. Find another team-mate"],
  marking: ["Pick up your player", "Each defender finds an attacker and stays between him and the goal, a step closer to the ball"],
  extraPass: ["The extra pass", "He could shoot, but his team-mate had a better chance. Unselfish passes make goals"],
} as const;
