// Ride emotes (user, Oct 22 2026: "the emotes change depending if you're on the bike, scooter and moped ... have them ride with the moped for
// a few seconds. it needs to fit with the type"). Pure data: on a ride the wheel shows Wave, Cheer and three scripted rides for THAT vehicle.
// A script drives the vehicle for a few seconds by writing a gentle synthetic stick (`stickFor`), so the game's own speed, slide-round-a-collider
// and ramp code still runs; Town aborts it on any real input, a dismount, a blocked look-ahead, traffic or water. Local ids start at 10;
// friends only see the bubble through the existing protocol value in `wire` (no new wire values).
export const RIDE_EMOTE = {MopedCruise: 10, MopedRev: 11, MopedEight: 12, ScooterGlide: 13, ScooterSpin: 14, ScooterHop: 15, BikeBell: 16, BikeWheelie: 17, BikeWeave: 18} as const;
export type RideEmote = (typeof RIDE_EMOTE)[keyof typeof RIDE_EMOTE];
export type RideKind = 'moped' | 'scooter' | 'bike';
export const isRideEmote = (e: number): e is RideEmote => e >= 10 && e <= 18;

/** The fastest a script ever drives each vehicle (m/s): a ride-by, not a race. */
export const RIDE_SPEED_CAP: Record<RideKind, number> = {moped: 8, scooter: 4.5, bike: 6};
export interface RideMove {mag: number; turn: number}
export interface RideScript {
  emote: RideEmote; ride: RideKind; label: string; icon: string; emoji: string;
  /** Length (s), the biggest speed it ever asks for as a fraction of the vehicle's script speed cap (`RIDE_SPEED_CAP`, m/s), and the protocol value friends see. */
  seconds: number; maxMag: number; wire: number;
  /** One arm up (the ride-emote arm: 0 wave, 1 fist pump) from this second on, or -1 for none. */
  arm: number; armFrom: number;
  /** A ride trick to start (rideTricks.start): action 0 / 1 at this second. */
  trick?: {action: 0 | 1; at: number};
  /** The wanted speed at `age` as a fraction 0..maxMag of the cap (0 = rolling to a stop), heading change in rad/s. */
  move(age: number, out: RideMove): RideMove;
}
const ease = (age: number, up = .5, end = 0, seconds = 0) => Math.min(1, age / up) * (end > 0 ? Math.min(1, Math.max(0, (seconds - age) / end)) : 1);
export const RIDE_SCRIPTS: readonly RideScript[] = [
  // MOPED: a ride-by, a stationary rev with the rider standing, a figure eight
  {emote: RIDE_EMOTE.MopedCruise, ride: 'moped', label: 'Cruise by', icon: 'ride-cruise', emoji: '\u{1F6F5}', seconds: 4.6, maxMag: 1, wire: 0, arm: 0, armFrom: .5,
    move(age, o) { o.mag = ease(age, .8, .8, 4.6); o.turn = .32; return o; }},
  {emote: RIDE_EMOTE.MopedRev, ride: 'moped', label: 'Rev & wave', icon: 'ride-rev', emoji: '\u{1F4A8}', seconds: 3.2, maxMag: .15, wire: 1, arm: 0, armFrom: 1.1, trick: {action: 0, at: .3},
    move(age, o) { o.mag = age < .5 ? 0 : .15 * ease(age - .5, .3, .8, 2.7); o.turn = 0; return o; }},
  {emote: RIDE_EMOTE.MopedEight, ride: 'moped', label: 'Figure eight', icon: 'ride-eight', emoji: '\u{267E}\u{FE0F}', seconds: 6.4, maxMag: .75, wire: 0, arm: 0, armFrom: 3,
    move(age, o) { o.mag = .75 * ease(age, .8, .6, 6.4); o.turn = (age < 3.2 ? 1 : -1) * 1.15; return o; }},
  // SCOOTER: kick-push then glide, a spin on the spot, a hop
  {emote: RIDE_EMOTE.ScooterGlide, ride: 'scooter', label: 'Kick & glide', icon: 'ride-glide', emoji: '\u{1F6F4}', seconds: 4, maxMag: 1, wire: 0, arm: 0, armFrom: 1.7,
    move(age, o) { o.mag = age < 1.5 ? Math.min(1, age / .5) : 0; o.turn = 0; return o; }},
  {emote: RIDE_EMOTE.ScooterSpin, ride: 'scooter', label: 'Trick spin', icon: 'ride-spin', emoji: '\u{1F300}', seconds: 2.6, maxMag: .3, wire: 1, arm: -1, armFrom: 0, trick: {action: 0, at: .35},
    move(age, o) { o.mag = .3 * ease(age, .3, .5, 2.6); o.turn = 0; return o; }},
  {emote: RIDE_EMOTE.ScooterHop, ride: 'scooter', label: 'Hop & wave', icon: 'ride-hop', emoji: '\u{2B06}\u{FE0F}', seconds: 3, maxMag: .5, wire: 1, arm: 0, armFrom: 1.1, trick: {action: 1, at: .4},
    move(age, o) { o.mag = .5 * ease(age, .4, .6, 3); o.turn = 0; return o; }},
  // BIKE: a slow roll with the bell and a wave, a back wheelie, a slalom weave
  {emote: RIDE_EMOTE.BikeBell, ride: 'bike', label: 'Bell & wave', icon: 'ride-bell', emoji: '\u{1F514}', seconds: 3.4, maxMag: .35, wire: 0, arm: 0, armFrom: .4,
    move(age, o) { o.mag = .35 * ease(age, .5, .8, 3.4); o.turn = 0; return o; }},
  {emote: RIDE_EMOTE.BikeWheelie, ride: 'bike', label: 'Wheelie', icon: 'ride-wheelie', emoji: '\u{1F4AA}', seconds: 3.2, maxMag: .6, wire: 1, arm: -1, armFrom: 0, trick: {action: 1, at: .6},
    move(age, o) { o.mag = .6 * ease(age, .5, .7, 3.2); o.turn = 0; return o; }},
  {emote: RIDE_EMOTE.BikeWeave, ride: 'bike', label: 'Lean & weave', icon: 'ride-weave', emoji: '\u{3030}\u{FE0F}', seconds: 4.2, maxMag: .8, wire: 0, arm: 0, armFrom: 2.6,
    move(age, o) { o.mag = .8 * ease(age, .8, .7, 4.2); o.turn = 1.05 * Math.sin(age * 2.3); return o; }},
];
export const rideScriptFor = (emote: number): RideScript | undefined => RIDE_SCRIPTS.find(s => s.emote === emote);
export const rideScriptsFor = (ride: string): RideScript[] => RIDE_SCRIPTS.filter(s => s.ride === ride);
/** The world heading change a script makes: integrate `turn` over dt. */
export const headingAfter = (h: number, turn: number, dt: number) => h + turn * dt;
/** The synthetic stick (Town's screen-space input) for world heading `h` at magnitude `mag`: the inverse of the follow camera's rotation (see intentHeading in Town.tsx). */
export function stickFor(h: number, mag: number, out: {x: number; z: number}) {
  const hx = Math.sin(h), hz = Math.cos(h);
  out.x = (hx * .857 - hz * .515) * mag; out.z = (hx * .515 + hz * .857) * mag; return out;
}
/** Why a running ride script must end ('' = keep going): real input, a dismount / another ride, the vehicle is blocked ahead or traffic is close, or it ran its length. */
export function rideScriptStop(s: {age: number; seconds: number; realInput: boolean; rideNow: string; rideWas: string; blockedAhead: boolean; trafficNear: boolean; water: boolean; crashed: boolean}): string {
  if (s.realInput) return 'input';
  if (s.rideNow !== s.rideWas) return 'dismount';
  if (s.water || s.crashed) return 'hazard';
  if (s.blockedAhead) return 'blocked';
  if (s.trafficNear) return 'traffic';
  return s.age >= s.seconds ? 'done' : '';
}
