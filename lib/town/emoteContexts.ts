// Emote contexts (user, Oct 22 2026): the Emote wheel changes with WHERE you are. Pure data and rules, no three.js and no DOM.
//  - FLYING (jetpack / glide): the button is disabled (greyed, no wheel) unless a party friend is also flying within FLY_RANGE m; then the wheel
//    shows the FLYING set (below). Purely visual flourishes on the flight pose (a roll / tilt / loop of the rig root over ~3-4 s): velocity,
//    altitude and steering are never touched (the offsets are added after the pose each frame and vanish with the emote).
//  - SWIMMING: the wheel shows the SWIM set (visual pose / offset on the swim rig plus ripple rings).
//  - Local ids start at 20 (the ride emotes use 60..74, lib/town/rideEmotes.ts); friends only ever receive an existing protocol value (`wire`, Emote 0..9) and
//    their avatar picks the matching flourish from the SENDER'S MODE (Mode.Jetpack / Parachute = flying, Mode.Swim = swimming). No new wire values.
// Protocol Mode values (multiplayer/protocol/types.ts), copied so this module stays dependency-free; tests/emote-contexts.cjs pins them.
import {RT, RT_CH, isRideEmote, rideScriptForWire, sampleRideTrick} from './rideEmotes';
export const WIRE_MODE = {Scooter: 2, Bike: 3, Moped: 4, Jetpack: 5, Parachute: 6, Swim: 8} as const;

export const CTX_EMOTE = {
  WingWave: 20, BarrelRoll: 21, Loop: 22, FlyByFive: 23, SideGlide: 24,
  SplashWave: 30, SprayCheer: 31, DuckDive: 32, BackFloat: 33, TreadLaugh: 34,
} as const;
export type CtxEmote = (typeof CTX_EMOTE)[keyof typeof CTX_EMOTE];
export type EmoteContext = 'ground' | 'fly' | 'swim' | 'move';

export interface CtxScript {
  emote: number; ctx: 'fly' | 'swim'; label: string; icon: string; emoji: string;
  /** Length (s) and the protocol Emote value friends receive. */
  seconds: number; wire: number;
  /** The right-arm pose (ride-emote arm: 0 wave, 1 fist pump, 2 air five, 5 clap) and from which second; -1 = none. */
  arm: number; armFrom: number;
}
export const FLY_RANGE = 40, FLY_CAMERA_PAIR_RANGE = 14;
export const FLY_SCRIPTS: readonly CtxScript[] = [
  {emote: CTX_EMOTE.WingWave, ctx: 'fly', label: 'Wing wave', icon: 'hand', emoji: '\u{1F44B}', seconds: 4, wire: 0, arm: 0, armFrom: .3},
  {emote: CTX_EMOTE.BarrelRoll, ctx: 'fly', label: 'Barrel roll', icon: 'ride-spin', emoji: '\u{1F300}', seconds: 3.2, wire: 1, arm: 1, armFrom: 2.2},
  {emote: CTX_EMOTE.Loop, ctx: 'fly', label: 'Loop-de-loop', icon: 'ride-eight', emoji: '\u{267E}\u{FE0F}', seconds: 3.6, wire: 8, arm: 1, armFrom: 2.6},
  {emote: CTX_EMOTE.FlyByFive, ctx: 'fly', label: 'Fly-by high five', icon: 'handshake', emoji: '\u{1F64C}', seconds: 3, wire: 2, arm: 2, armFrom: .5},
  {emote: CTX_EMOTE.SideGlide, ctx: 'fly', label: 'Side-by-side glide', icon: 'ride-glide', emoji: '\u{1F6EB}', seconds: 4, wire: 9, arm: 0, armFrom: 1.2},
];
export const SWIM_SCRIPTS: readonly CtxScript[] = [
  {emote: CTX_EMOTE.SplashWave, ctx: 'swim', label: 'Splash wave', icon: 'hand', emoji: '\u{1F44B}', seconds: 4, wire: 0, arm: 0, armFrom: .2},
  {emote: CTX_EMOTE.SprayCheer, ctx: 'swim', label: 'Water spray cheer', icon: 'star', emoji: '\u{1F4A6}', seconds: 3.4, wire: 1, arm: 1, armFrom: .5},
  {emote: CTX_EMOTE.DuckDive, ctx: 'swim', label: 'Duck-dive pop-up', icon: 'ride-hop', emoji: '\u{1F986}', seconds: 3.4, wire: 8, arm: -1, armFrom: 0},
  {emote: CTX_EMOTE.BackFloat, ctx: 'swim', label: 'Back float', icon: 'wind', emoji: '\u{1F30A}', seconds: 4, wire: 4, arm: -1, armFrom: 0},
  {emote: CTX_EMOTE.TreadLaugh, ctx: 'swim', label: 'Tread & laugh', icon: 'smile', emoji: '\u{1F602}', seconds: 4, wire: 7, arm: -1, armFrom: 0},
];
export const CTX_SCRIPTS: readonly CtxScript[] = [...FLY_SCRIPTS, ...SWIM_SCRIPTS];
export const isFlyEmote = (e: number) => e >= 20 && e <= 24;
export const isSwimEmote = (e: number) => e >= 30 && e <= 34;
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
export const ctxWheelFor = (ctx: EmoteContext): CtxScript[] => ctx === 'fly' ? [...FLY_SCRIPTS] : ctx === 'swim' ? [...SWIM_SCRIPTS] : [];

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
 *  On a scooter / bike / moped: that vehicle's in-place trick with this wire value (rideEmotes.ts); Wave (0) stays the ordinary wave. */
export function flourishForWire(wire: number, mode: number): FlourishScript | undefined {
  const ride = RIDE_MODE[mode]; if (ride) return rideScriptForWire(ride, wire);
  const list = modeIsFlying(mode) ? FLY_SCRIPTS : modeIsSwimming(mode) ? SWIM_SCRIPTS : null;
  return list ? list.find(s => s.wire === wire) : undefined;
}

/** The visual offsets of a flourish (rig-root rotations in rad, a lift in m), added after the pose and gone with the emote. */
export interface Flourish {roll: number; pitch: number; yaw: number; lift: number; ripple: number}
const clamp01 = (v: number) => v < 0 ? 0 : v > 1 ? 1 : v;
const smooth = (v: number) => { const t = clamp01(v); return t * t * (3 - 2 * t); };
const fade = (age: number, dur: number) => clamp01(Math.min(age / .3, (dur - age) / .3));
const TAU = Math.PI * 2, rideBuf = new Float32Array(RT_CH);
/** `side` = +1 / -1: which way a fly-by leans (toward the friend). Writes `out` (no allocation) and returns it. */
export function flourishAt(emote: number, age: number, dur: number, out: Flourish, side = 1): Flourish {
  out.roll = out.pitch = out.yaw = out.lift = out.ripple = 0;
  if (isRideEmote(emote)) { // a friend's ride trick on their own rig: pitch (lifted about its axle), roll, hop; the spin is theirs to show
    const p = sampleRideTrick(emote, age, rideBuf); out.pitch = p[RT.PITCH]; out.roll = p[RT.ROLL]; out.yaw = p[RT.YAW];
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
