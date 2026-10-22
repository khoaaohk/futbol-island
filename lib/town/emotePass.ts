// Pass it (user, Oct 22 2026): five passes, player -> partner -> player ..., each one a short lifted pass between the two pairs of feet;
// the receiver traps it and passes back. Pure math (no three.js); Town draws one pooled ball with it (lib/graphics/passBall.ts).
export const PASS_COUNT = 5, PASS_LEAD = .35, PASS_PERIOD = 1.05, PASS_FLIGHT = .72, PASS_REACH = .55;
export interface PassBallOut {
  x: number; y: number; z: number;
  /** 0 = you kick this pass, 1 = your partner does, -1 before the first. */
  from: number;
  /** 0..1 the passer's kick, 0 when not kicking. */
  kick: number;
  /** The pass number 0..PASS_COUNT-1 (-1 before the first). */
  index: number;
  /** The ball is in the air. */
  air: boolean;
}
export const createPassBallOut = (): PassBallOut => ({x: 0, y: 0, z: 0, from: -1, kick: 0, index: -1, air: false});
/** The ball for Pass it at `age` seconds: `a` = the player's feet, `b` = the partner's feet (a real townsperson, or the imaginary spot of an air pass). */
export function passBallAt(age: number, a: {x: number; y: number; z: number}, b: {x: number; y: number; z: number}, out: PassBallOut): PassBallOut {
  const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz) || 1, ux = dx / len, uz = dz / len;
  const i = Math.max(0, Math.min(PASS_COUNT - 1, Math.floor((age - PASS_LEAD) / PASS_PERIOD))), t = age - PASS_LEAD - i * PASS_PERIOD;
  const fromMe = i % 2 === 0;
  const sx = fromMe ? a.x + ux * PASS_REACH : b.x - ux * PASS_REACH, sz = fromMe ? a.z + uz * PASS_REACH : b.z - uz * PASS_REACH, sy = fromMe ? a.y : b.y;
  const ex = fromMe ? b.x - ux * PASS_REACH : a.x + ux * PASS_REACH, ez = fromMe ? b.z - uz * PASS_REACH : a.z + uz * PASS_REACH, ey = fromMe ? b.y : a.y;
  out.index = age < PASS_LEAD ? -1 : i; out.from = age < PASS_LEAD ? -1 : fromMe ? 0 : 1;
  if (age < PASS_LEAD || t < 0) { out.x = a.x + ux * PASS_REACH; out.y = a.y + .22; out.z = a.z + uz * PASS_REACH; out.kick = 0; out.air = false; return out; }
  const f = Math.min(1, t / PASS_FLIGHT), e = f * f * (3 - 2 * f) * .35 + f * .65; // eased roll, slowing as it is trapped
  out.x = sx + (ex - sx) * e; out.z = sz + (ez - sz) * e;
  out.y = sy + (ey - sy) * e + .22 + (f < 1 ? 4 * f * (1 - f) * .55 : .08 * Math.max(0, 1 - (t - PASS_FLIGHT) * 6) * Math.abs(Math.sin((t - PASS_FLIGHT) * 18)));
  out.kick = t < .18 ? t / .18 : 0; out.air = f < 1;
  return out;
}
/** The partner of an air pass (no townsperson near): an imaginary friend this far in front of you (m). */
export const AIR_PARTNER = 3.2;
