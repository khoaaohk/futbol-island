// Emote contexts (user, Oct 22 2026): the Emote wheel changes with WHERE you are. Pure data and rules, no three.js and no DOM.
//  - FLYING (jetpack / glide): the button is disabled (greyed, no wheel) unless a party friend is also flying within FLY_RANGE m; then the wheel
//    shows the FLYING set (below). Purely visual flourishes on the flight pose (a roll / tilt / loop of the rig root over ~3-4 s): velocity,
//    altitude and steering are never touched (the offsets are added after the pose each frame and vanish with the emote).
//  - SWIMMING: the wheel shows the SWIM set (visual pose / offset on the swim rig plus ripple rings).
//  - Local ids start at 20 (the ride emotes use 60..74, lib/town/rideEmotes.ts); friends only ever receive an existing protocol value (`wire`, Emote 0..9) and
//    their avatar picks the matching flourish from the SENDER'S MODE (Mode.Jetpack / Parachute = flying, Mode.Swim = swimming). No new wire values.
// Protocol Mode values (multiplayer/protocol/types.ts), copied so this module stays dependency-free; tests/emote-contexts.cjs pins them.
//  - TEN per context (owner, Oct 23 2026): flying and swimming each offer one flourish for every standard wheel meaning, in the standard wheel
//    order (WHEEL_WIRE_ORDER): the `wire` IS that meaning's protocol value (0 Wave .. 9 Thanks), one script per (context, wire). Ids 20-29 fly,
//    30-39 swim (20-24 / 30-34 kept). Pass it / Juggle with me have no ball here: a ball-free two-person version (a glowing star, a splash),
//    instant and one-way (no Join card), only with a friend near in the same context (sharedBlocked). docs/emotes-ten-per-context.md.
import {RT, RT_CH, WHEEL_WIRE_ORDER, isRideEmote, rideScriptFor, rideScriptForWire, sampleRideTrick} from './rideEmotes';
export const WIRE_MODE = {Scooter: 2, Bike: 3, Moped: 4, Jetpack: 5, Parachute: 6, Swim: 8} as const;

export const CTX_EMOTE = {
  WingWave: 20, BarrelRoll: 21, Loop: 22, FlyByFive: 23, SideGlide: 24, StarPass: 25, CometKeepyUp: 26, JetSalute: 27, UpsideGiggle: 28, SkyDance: 29,
  SplashWave: 30, SprayCheer: 31, DuckDive: 32, BackFloat: 33, TreadLaugh: 34, SplashFive: 35, SplashPass: 36, BubbleKeepyUp: 37, SealClap: 38, TreadDance: 39,
} as const;
export type CtxEmote = (typeof CTX_EMOTE)[keyof typeof CTX_EMOTE];
export type EmoteContext = 'ground' | 'fly' | 'swim' | 'move';

export interface CtxScript {
  emote: number; ctx: 'fly' | 'swim'; label: string; icon: string; emoji: string;
  /** Length (s) and the protocol Emote value friends receive. */
  seconds: number; wire: number;
  /** The right-arm pose (lib/graphics/celebrations.ts applyRideEmote: 0 wave, 1 fist pump, 2 air five, 3 salute, 4 toss / scoop, 5 clap,
   *  6 hand on heart) and from which second; -1 = none. */
  arm: number; armFrom: number;
}
export const FLY_RANGE = 40, FLY_CAMERA_PAIR_RANGE = 14;
// Listed in the standard wheel order (wire 0, 2, 1, 6, 3, 5, 7, 8, 9, 4); ctxWheelFor keeps that order whatever the list order.
export const FLY_SCRIPTS: readonly CtxScript[] = [
  {emote: CTX_EMOTE.WingWave, ctx: 'fly', label: 'Wing wave', icon: 'hand', emoji: '\u{1F44B}', seconds: 4, wire: 0, arm: 0, armFrom: .3},
  {emote: CTX_EMOTE.FlyByFive, ctx: 'fly', label: 'Fly-by high five', icon: 'handshake', emoji: '\u{1F64C}', seconds: 3, wire: 2, arm: 2, armFrom: .5},
  {emote: CTX_EMOTE.BarrelRoll, ctx: 'fly', label: 'Barrel roll', icon: 'ride-spin', emoji: '\u{1F300}', seconds: 3.2, wire: 1, arm: 1, armFrom: 2.2},
  {emote: CTX_EMOTE.StarPass, ctx: 'fly', label: 'Star pass', icon: 'pass', emoji: '\u{2728}', seconds: 3.4, wire: 6, arm: 4, armFrom: .5},
  {emote: CTX_EMOTE.CometKeepyUp, ctx: 'fly', label: 'Comet keepy-ups', icon: 'juggle-air', emoji: '\u{2604}\u{FE0F}', seconds: 3.6, wire: 3, arm: -1, armFrom: 0},
  {emote: CTX_EMOTE.JetSalute, ctx: 'fly', label: 'Jetpack salute', icon: 'ride-salute', emoji: '\u{1FAE1}', seconds: 3.4, wire: 5, arm: 3, armFrom: .4},
  {emote: CTX_EMOTE.UpsideGiggle, ctx: 'fly', label: 'Upside-down giggle', icon: 'smile', emoji: '\u{1F643}', seconds: 3.6, wire: 7, arm: -1, armFrom: 0},
  {emote: CTX_EMOTE.SkyDance, ctx: 'fly', label: 'Sky dance', icon: 'music', emoji: '\u{1FAA9}', seconds: 3.8, wire: 8, arm: 1, armFrom: .3},
  {emote: CTX_EMOTE.SideGlide, ctx: 'fly', label: 'Thank-you glide', icon: 'ride-glide', emoji: '\u{1F6EB}', seconds: 4, wire: 9, arm: 6, armFrom: 1.2},
  {emote: CTX_EMOTE.Loop, ctx: 'fly', label: 'Loop-de-loop', icon: 'ride-eight', emoji: '\u{267E}\u{FE0F}', seconds: 3.6, wire: 4, arm: 1, armFrom: 2.6},
];
export const SWIM_SCRIPTS: readonly CtxScript[] = [
  {emote: CTX_EMOTE.SplashWave, ctx: 'swim', label: 'Splash wave', icon: 'hand', emoji: '\u{1F44B}', seconds: 4, wire: 0, arm: 0, armFrom: .2},
  {emote: CTX_EMOTE.SplashFive, ctx: 'swim', label: 'Splash high five', icon: 'handshake', emoji: '\u{1F590}\u{FE0F}', seconds: 3.2, wire: 2, arm: 2, armFrom: .5},
  {emote: CTX_EMOTE.SprayCheer, ctx: 'swim', label: 'Water spray cheer', icon: 'star', emoji: '\u{1F4A6}', seconds: 3.4, wire: 1, arm: 1, armFrom: .5},
  {emote: CTX_EMOTE.SplashPass, ctx: 'swim', label: 'Splash pass', icon: 'pass', emoji: '\u{1F93D}', seconds: 3.4, wire: 6, arm: 4, armFrom: .4},
  {emote: CTX_EMOTE.BubbleKeepyUp, ctx: 'swim', label: 'Bubble keepy-ups', icon: 'juggle-air', emoji: '\u{1FAE7}', seconds: 3.6, wire: 3, arm: -1, armFrom: 0},
  {emote: CTX_EMOTE.SealClap, ctx: 'swim', label: 'Seal clap', icon: 'heart', emoji: '\u{1F9AD}', seconds: 3.6, wire: 5, arm: 5, armFrom: .4},
  {emote: CTX_EMOTE.TreadLaugh, ctx: 'swim', label: 'Tread & laugh', icon: 'smile', emoji: '\u{1F602}', seconds: 4, wire: 7, arm: -1, armFrom: 0},
  {emote: CTX_EMOTE.TreadDance, ctx: 'swim', label: 'Tread dance', icon: 'music', emoji: '\u{1F3B6}', seconds: 3.8, wire: 8, arm: 1, armFrom: .4},
  {emote: CTX_EMOTE.BackFloat, ctx: 'swim', label: 'Thank-you float', icon: 'thanks', emoji: '\u{1F30A}', seconds: 4, wire: 9, arm: 6, armFrom: .6},
  {emote: CTX_EMOTE.DuckDive, ctx: 'swim', label: 'Duck-dive pop-up', icon: 'ride-hop', emoji: '\u{1F986}', seconds: 3.4, wire: 4, arm: -1, armFrom: 0},
];
export const CTX_SCRIPTS: readonly CtxScript[] = [...FLY_SCRIPTS, ...SWIM_SCRIPTS];
export const isFlyEmote = (e: number) => e >= 20 && e <= 29;
export const isSwimEmote = (e: number) => e >= 30 && e <= 39;
export const isCtxEmote = (e: number) => isFlyEmote(e) || isSwimEmote(e);
export const ctxScriptFor = (e: number): CtxScript | undefined => CTX_SCRIPTS.find(s => s.emote === e);
export const CTX_EMOTE_EMOJI: Record<number, string> = Object.fromEntries(CTX_SCRIPTS.map(s => [s.emote, s.emoji]));

/** Flying = the jetpack / glide ride, or any jetpack action (charge, blast, parachute...). */
export const isFlying = (ride: string, jetPhase: string) => ride === 'jetpack' || (jetPhase !== 'idle' && jetPhase !== '');
export interface EmoteButtonState {hidden: boolean; disabled: boolean; ctx: EmoteContext; why: string}
/** What the island can offer right now (written by Town at ~4 Hz): a townsperson that would answer (within 9 m, `npcNear`), a party friend within FLY_RANGE (`friendNear`), flying / swimming friends, and the set of the townsperson you would emote at. */
export interface EmoteReach {flying: boolean; swimming: boolean; npcNear: boolean; friendNear: boolean; friendFlyingNear: boolean; friendSwimmingNear: boolean;
  /** Walking / running on foot above the wheel threshold (lib/town/moveEmotes.ts moveWheelOn): the wheel shows the MOVING set. */
  moving?: boolean;
  /** Relay v1.4: the nearest friend said No twice in a row to my ball-emote asks: Pass it / Juggle with me are greyed for a while (lib/multiplayer/emoteAsk.ts). */
  askBlocked?: boolean}
/**
 * The Emote button (user, Oct 22 2026: "emote btn only show when there is a npc or friend to interact with"; this reverses the earlier always-on rule):
 * HIDDEN (its grid cell stays reserved) unless there is someone to emote at. Flying: only beside a flying friend (the FLYING set). Swimming: only beside
 * a swimming friend (the SWIM set; no townsfolk swim). On the ground or a ride: a townsperson that would answer or any party friend nearby.
 */
export function emoteButtonState(s: Pick<EmoteReach, 'flying' | 'swimming'> & Partial<EmoteReach>): EmoteButtonState {
  if (s.flying) return s.friendFlyingNear ? {hidden: false, disabled: false, ctx: 'fly', why: ''} : {hidden: true, disabled: false, ctx: 'fly', why: 'Emotes while flying need a friend flying nearby'};
  if (s.swimming) return s.friendSwimmingNear ? {hidden: false, disabled: false, ctx: 'swim', why: ''} : {hidden: true, disabled: false, ctx: 'swim', why: 'Emotes in the water need a swimming friend nearby'};
  const some = Boolean(s.npcNear || s.friendNear);
  // Walking / running on foot: the MOVING set (lib/town/moveEmotes.ts), same rule: only with a townsperson or a friend to answer.
  return {hidden: !some, disabled: false, ctx: s.moving ? 'move' : 'ground', why: some ? '' : 'Nobody to emote with'};
}
const inWheelOrder = (list: readonly CtxScript[]): CtxScript[] => WHEEL_WIRE_ORDER.map(w => list.find(s => s.wire === w)!);
const FLY_WHEEL = inWheelOrder(FLY_SCRIPTS), SWIM_WHEEL = inWheelOrder(SWIM_SCRIPTS);
/** The ten flourishes of a context in the standard wheel order (the phone bar pages them five at a time). */
export const ctxWheelFor = (ctx: EmoteContext): CtxScript[] => ctx === 'fly' ? [...FLY_WHEEL] : ctx === 'swim' ? [...SWIM_WHEEL] : [];

/** Pass it (6) and Juggle with me (3): the two-person meanings. */
export const isSharedWire = (wire: number) => wire === 6 || wire === 3;
/** A flying / swimming / ride emote with a two-person meaning that cannot be played right now: it needs a friend near in the SAME context
 *  (flying: friendFlyingNear, swimming: friendSwimmingNear, a ride: friendNear, the existing button rules). Ordinary emotes: never blocked. */
export function sharedBlocked(emote: number, reach: Partial<Pick<EmoteReach, 'friendNear' | 'friendFlyingNear' | 'friendSwimmingNear'>>): boolean {
  const cs = ctxScriptFor(emote);
  if (cs) return isSharedWire(cs.wire) && !(cs.ctx === 'fly' ? reach.friendFlyingNear : reach.friendSwimmingNear);
  const rs = isRideEmote(emote) ? rideScriptFor(emote) : undefined;
  return !!rs && isSharedWire(rs.wire) && !reach.friendNear;
}

/** A friend (remote pose) counts as flying in these protocol modes. */
export const modeIsFlying = (mode: number) => mode === WIRE_MODE.Jetpack || mode === WIRE_MODE.Parachute;
export const modeIsSwimming = (mode: number) => mode === WIRE_MODE.Swim;
export interface FriendPose {x: number; y: number; z: number; mode: number}
/** The nearest party friend that is flying within `range` m (3D) of me, or null. `out` receives its position. */
export function nearestFlyingFriend(me: {x: number; y: number; z: number}, friends: Iterable<FriendPose>, out: {x: number; y: number; z: number}, range = FLY_RANGE): number {
  let best = Infinity, found = false;
  for (const f of friends) {
    if (!modeIsFlying(f.mode)) continue;
    const d = Math.hypot(f.x - me.x, f.y - me.y, f.z - me.z);
    if (d <= range && d < best) { best = d; out.x = f.x; out.y = f.y; out.z = f.z; found = true; }
  }
  return found ? best : -1;
}

/** What a friend's avatar needs to play a flourish (a flying / swimming one, or a ride trick). */
export type FlourishScript = Pick<CtxScript, 'emote' | 'seconds' | 'wire' | 'arm' | 'armFrom'>;
const RIDE_MODE: Record<number, string> = {[WIRE_MODE.Scooter]: 'scooter', [WIRE_MODE.Bike]: 'bike', [WIRE_MODE.Moped]: 'moped'};
/** Which flourish a friend's avatar plays for the protocol value `wire` given the SENDER'S mode (undefined = the ordinary ground emote).
 *  On a scooter / bike / moped: that vehicle's in-place trick with this wire value (rideEmotes.ts). Every context has all ten values (0..9). */
export function flourishForWire(wire: number, mode: number): FlourishScript | undefined {
  const ride = RIDE_MODE[mode]; if (ride) return rideScriptForWire(ride, wire);
  const list = modeIsFlying(mode) ? FLY_SCRIPTS : modeIsSwimming(mode) ? SWIM_SCRIPTS : null;
  return list ? list.find(s => s.wire === wire) : undefined;
}

/** The emote context of a wire mode: a ride mode (scooter / bike / moped) is its own, Jetpack + Parachute = flying (5), Swim = 8,
 *  Walk / Run / Idle = on foot (0); any other mode is its own. A friend's flourish or moving emote ends when this changes (as the local one does). */
export const emoteCtxOfMode = (mode: number): number => RIDE_MODE[mode] ? mode : modeIsFlying(mode) ? WIRE_MODE.Jetpack : mode === 0 || mode === 1 || mode === 13 ? 0 : mode;
/** A friend's flourish started in `startMode` must end now that they are in `mode` (landed, left the water, got off / changed the ride). */
export const friendFlourishLapsed = (startMode: number, mode: number): boolean => emoteCtxOfMode(startMode) !== emoteCtxOfMode(mode);

/** The visual offsets of a flourish (rig-root rotations in rad, a lift in m), added after the pose and gone with the emote. */
/** `vyaw` = the vehicle alone turning under the rider (a tail-whip, RT.VYAW) and `rlift` = the part of `lift` that is the rider alone above the
 *  deck (RT.RLIFT): a friend's ride takes the rig root minus `rlift`, plus `vyaw` (written for ride tricks, zero otherwise). */
export interface Flourish {roll: number; pitch: number; yaw: number; lift: number; ripple: number; vyaw?: number; rlift?: number; wheel?: number}
const clamp01 = (v: number) => v < 0 ? 0 : v > 1 ? 1 : v;
const smooth = (v: number) => { const t = clamp01(v); return t * t * (3 - 2 * t); };
const fade = (age: number, dur: number) => clamp01(Math.min(age / .3, (dur - age) / .3));
const TAU = Math.PI * 2, rideBuf = new Float32Array(RT_CH);
/** 0 -> 1 -> 0 over [a, b] (seconds; a sine arch). */
const arch01 = (t: number, a: number, b: number) => t <= a || t >= b ? 0 : Math.sin(Math.PI * (t - a) / (b - a));
/** `side` = +1 / -1: which way a fly-by leans (toward the friend). Writes `out` (no allocation) and returns it. */
export function flourishAt(emote: number, age: number, dur: number, out: Flourish, side = 1): Flourish {
  out.roll = out.pitch = out.yaw = out.lift = out.ripple = out.vyaw = out.rlift = out.wheel = 0;
  if (isRideEmote(emote)) { // a friend's ride trick on their own rig: pitch (lifted about its axle), roll, hop; the spin is theirs to show
    const p = sampleRideTrick(emote, age, rideBuf); out.pitch = p[RT.PITCH]; out.roll = p[RT.ROLL]; out.yaw = p[RT.YAW]; out.vyaw = p[RT.VYAW]; out.rlift = p[RT.RLIFT]; out.wheel = p[RT.WHEEL];
    out.lift = p[RT.LIFT] + p[RT.PIVOT] * Math.sin(p[RT.PITCH]) + p[RT.PIVY] * (1 - Math.cos(p[RT.PITCH])) + p[RT.RLIFT]; return out; // the axle stays put (rideGround.ts)
  }
  const u = clamp01(age / dur), f = fade(age, dur);
  switch (emote) {
    case CTX_EMOTE.WingWave: out.roll = .42 * f * Math.sin(age * 3.1); out.lift = .12 * f * Math.sin(age * 3.1 + 1); break;
    case CTX_EMOTE.BarrelRoll: out.roll = TAU * smooth((u - .12) / .72) * side; break;
    case CTX_EMOTE.Loop: out.pitch = -TAU * smooth((u - .1) / .75); out.lift = 1.5 * Math.sin(smooth((u - .1) / .75) * Math.PI); break;
    case CTX_EMOTE.FlyByFive: out.roll = .5 * f * side * Math.sin(Math.min(1, age / 1.2) * Math.PI / 2); out.lift = .25 * f; break;
    case CTX_EMOTE.SideGlide: out.roll = .22 * f * Math.sin(age * 1.7) * side; out.pitch = -.12 * f; out.lift = .08 * f * Math.sin(age * 2.2); break;
    case CTX_EMOTE.SplashWave: out.roll = .1 * f * Math.sin(age * 3); out.lift = .05 * f * Math.sin(age * 5); out.ripple = f > 0 && Math.sin(age * 5) > .95 ? 1 : 0; break;
    case CTX_EMOTE.SprayCheer: { const hop = Math.max(0, Math.sin(age * 5.2)); out.lift = .38 * hop * f; out.ripple = hop > .97 ? 1 : 0; break; }
    case CTX_EMOTE.DuckDive: { // tip forward, sink, pop up, settle
      const dive = smooth(u / .3) * (1 - smooth((u - .45) / .1)); out.pitch = 1.45 * dive; out.lift = -.34 * dive + .55 * Math.sin(clamp01((u - .45) / .3) * Math.PI);
      out.ripple = u > .28 && u < .32 || u > .5 && u < .54 ? 1 : 0; break;
    }
    case CTX_EMOTE.BackFloat: out.pitch = -1.25 * f; out.lift = -.05 * f + .04 * f * Math.sin(age * 1.6); break;
    case CTX_EMOTE.TreadLaugh: out.lift = .07 * f * Math.abs(Math.sin(age * 8)); out.roll = .08 * f * Math.sin(age * 9); break;
    // The other five per context (Oct 23 2026). `ripple` = a splash ring in the water, a sparkle in the air (Town).
    case CTX_EMOTE.StarPass: { // lean toward the friend, wind up, toss a glowing star across (the sparkle), follow through
      const toss = arch01(age, .95, 1.65); out.roll = .35 * f * side; out.pitch = .3 * toss - .12 * arch01(age, .4, .95); out.lift = .15 * f * Math.sin(age * 2);
      out.ripple = age > 1.2 && age < 1.3 ? 1 : 0; break;
    }
    case CTX_EMOTE.CometKeepyUp: { // heading a comet up again and again: a bob and a nod on every touch, a sparkle at each one
      const b = Math.max(0, Math.sin(age * 4.4)); out.lift = .35 * b * f; out.pitch = -.25 * b * f; out.ripple = f > .5 && b > .985 ? 1 : 0; break;
    }
    case CTX_EMOTE.JetSalute: out.pitch = -.18 * f; out.lift = .1 * f * Math.sin(age * 1.6); out.roll = .06 * f * Math.sin(age * 1.1); break; // hover upright, salute
    case CTX_EMOTE.UpsideGiggle: { // roll half over, giggle upside down (a wobble), roll back
      const over = smooth((u - .1) / .25) * (1 - smooth((u - .7) / .2)); out.roll = (Math.PI * over + .15 * over * Math.sin(age * 12)) * side; out.lift = .2 * over; break;
    }
    case CTX_EMOTE.SkyDance: out.roll = .45 * f * Math.sin(age * 4.2); out.lift = .3 * f * Math.abs(Math.sin(age * 4.2)); out.pitch = .1 * f * Math.sin(age * 8.4); break; // sway to the beat
    case CTX_EMOTE.SplashFive: { // rise out of the water, a high five with a splash, sink back
      const up = smooth(u / .3) * (1 - smooth((u - .7) / .25)); out.lift = .35 * up; out.pitch = -.15 * up; out.ripple = age > 1.35 && age < 1.45 || u > .3 && u < .33 ? 1 : 0; break;
    }
    case CTX_EMOTE.SplashPass: { // a scoop of water flicked across to the friend (the splash), lean into it
      const scoop = arch01(age, .9, 1.8); out.roll = .2 * f * Math.sin(age * 2.2); out.pitch = .3 * scoop; out.lift = -.05 * scoop; out.ripple = scoop > .9 ? 1 : 0; break;
    }
    case CTX_EMOTE.BubbleKeepyUp: { // blowing a bubble up and nodding it back up: nods, a bob, a little ring at each touch
      const b = Math.max(0, Math.sin(age * 5)); out.pitch = -.5 * b * f; out.lift = .2 * b * f; out.ripple = f > .5 && b > .985 ? 1 : 0; break;
    }
    case CTX_EMOTE.SealClap: out.pitch = -.6 * f; out.lift = .06 * f * Math.abs(Math.sin(age * 7)); out.ripple = f > .5 && Math.sin(age * 7) > .97 ? 1 : 0; break; // half on the back, clapping like a seal
    case CTX_EMOTE.TreadDance: out.roll = .3 * f * Math.sin(age * 4); out.lift = .12 * f * Math.abs(Math.sin(age * 4)); out.ripple = f > .5 && Math.abs(Math.sin(age * 4)) < .05 ? 1 : 0; break;
  }
  return out;
}
/** Does the flourish need the emote to end now? Landing ends a flying one, leaving the water ends a swimming one. */
export const ctxStillValid = (emote: number, flying: boolean, swimming: boolean) => isFlyEmote(emote) ? flying : isSwimEmote(emote) ? swimming : true;

/** A tiny external store so the React button follows the island without Town re-rendering (written on the HUD tick, only on a change). `npcKind` = the set of the townsperson you would emote at ('' = the ordinary ground wheel). */
export interface EmoteCtxView extends EmoteReach {npcKind: '' | 'skater' | 'scooter' | 'juggler'}
const IDLE_CTX: EmoteCtxView = {flying: false, friendFlyingNear: false, swimming: false, npcNear: false, friendNear: false, friendSwimmingNear: false, moving: false, askBlocked: false, npcKind: ''};
let ctxView: EmoteCtxView = IDLE_CTX;
const ctxSubs = new Set<() => void>();
const CTX_KEYS = Object.keys(IDLE_CTX) as (keyof EmoteCtxView)[];
export const emoteCtxStore = {
  get: () => ctxView, server: () => IDLE_CTX,
  subscribe(f: () => void) { ctxSubs.add(f); return () => { ctxSubs.delete(f); }; },
  set(next: Partial<EmoteCtxView>) {
    const n = {...ctxView, ...next};
    if (CTX_KEYS.every(k => n[k] === ctxView[k])) return;
    ctxView = n; for (const f of Array.from(ctxSubs)) f();
  },
};
