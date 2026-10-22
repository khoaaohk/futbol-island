// Ball emote routines (user, Oct 22 2026: "many of them look similar ... standing and just waving their arms ... make them all very different
// and not look static"). PASS IT and JUGGLE WITH ME each rotate through several authored ROUTINES (a shuffled bag, never the same twice in a row,
// like the high-five bag): one-touch wall passes, skill-then-pass, heel back-passes, trap-turn-and-pass, no-look spins, through-balls; thigh and
// header keep-ups, around-the-world volleys, chest-and-flick, shoulder rolls with a neck stall, rainbow heel flicks, a counted knee run that ends
// with a catch behind the back and a bow. Both actors (you and the townsperson) play their half on ONE clock and use the rig's own vocabulary
// (strike wind-up / swing with the contact frame, first-touch cushion, keep-up taps, chest / thigh / header reactions, signature moves, skill
// moves, jumps, spins, full-body trick poses), so every routine moves the whole body and the ball meets the boot / knee / head on the contact frame.
// The ball is THE player's own ball (Town drives it; no extra mesh). Ball motion: a push pass rolls and slows, an air ball follows a gravity arc.
// Bounds (lib/town/emoteBounds.ts): roots never move (everything plays in place: spins, hops, skills), the pair gap stays <= PASS_GAP / JUGGLE_GAP
// max, the ball stays under 3.2 m and within 3 m of the pair's midpoint (tests/emote-ball-play.cjs samples every routine).
// Pure maths: routines are flattened into arrays at module load; the per-frame functions write into reused objects (no allocation).
import {STRIKE_CONTACT} from '../graphics/strikeMotion';
import {SKILL_MOVES, skillBall, skillFrame, type SkillMove} from '../graphics/skillMoves';
import {createTrickPose, type TrickPose} from '../graphics/trickPose';
import type {PlayerReaction, SignatureMove} from '../graphics/player';

export type Touch = 'foot' | 'knee' | 'head' | 'shoulder' | 'around-world';
export type Who = 0 | 1;
/** The rig's strike: `windup` 0..1 draws the leg back (kick phase 0 -> KICK_FROM), then `kick` runs KICK_FROM -> 1 with the ball released at STRIKE_CONTACT. */
export const KICK_FROM = .15;
/** Seconds after the wind-up that the ball leaves the foot, for a swing of `k` seconds (kick phase KICK_FROM -> 1 over k). */
export const contactAfterWindup = (k: number) => (STRIKE_CONTACT - KICK_FROM) / (1 - KICK_FROM) * k;
/** Signature-move timings (copied from player.ts MOVE_PHASE, which imports three.js; tests pin them equal). */
export const MOVE_TIMES: Record<'volley' | 'backHeel' | 'flickUp' | 'scissor', {contact: number; seconds: number}> = {
  volley: {contact: .42, seconds: .8}, backHeel: {contact: .45, seconds: .6}, flickUp: {contact: .38, seconds: .7}, scissor: {contact: .33, seconds: 1.3},
};
/** A gentle "game gravity" for the air ball (m/s^2): real arcs, a touch floatier for kids to follow. */
export const BALL_G = 8.5;
/** The ball's centre height on the grass (m). */
export const BALL_Y = .2;
export const PASS_REACH = .5;
/** Rig scale of each actor (you on the island are 1.12, a townsperson ~1): contact points on the body scale with it. */
export const ACTOR_SCALE: readonly [number, number] = [1.12, 1];

export interface ActorPose {
  /** 0..1 wind-up (undefined = not winding up) and the swing (kick phase, undefined = not swinging). */
  windup: number | undefined; kick: number | undefined; actionKind: 'pass' | 'loft';
  /** 0..1 first-touch cushion (0 = none) and its progress. */
  receive: number; receiveProgress: number;
  /** Keep-up phase (the contact is at each whole number) and the touch kind, or undefined. */
  juggle: number | undefined; juggleTouch: Touch; side: -1 | 1;
  /** A skill move (lib/graphics/skillMoves.ts) played in place, or undefined. */
  skill: {type: SkillMove; progress: number; side: -1 | 1} | undefined;
  /** A signature move (volley, back-heel, flick-up, scissor kick), or undefined. */
  move: {kind: SignatureMove; progress: number; side: -1 | 1; height: number} | undefined;
  /** Chest / thigh / header control, or undefined. */
  reaction: 'chest' | 'thigh' | 'header' | undefined; reactionProgress: number;
  /** A jump (hop on the toes, header leap, celebration), or undefined. */
  jump: {progress: number; height: number} | undefined;
  /** A full-body trick pose (catch behind the back, bow, neck stall, arms up), or undefined. */
  trick: TrickPose | undefined;
  /** 0..1 ready stance (on the toes, knees bent) and 0..1 the "to me!" arm. */
  ready: number; called: number;
  /** Extra heading (rad) on top of facing the partner: spins, turning the back for a heel pass, skill turns. */
  turn: number;
}
const newActor = (): ActorPose => ({windup: undefined, kick: undefined, actionKind: 'pass', receive: 0, receiveProgress: 0, juggle: undefined, juggleTouch: 'foot', side: 1,
  skill: undefined, move: undefined, reaction: undefined, reactionProgress: 0, jump: undefined, trick: undefined, ready: 0, called: 0, turn: 0});
/** Reused sub-objects per actor (assigned into the pose only while active). */
interface ActorStore {skill: {type: SkillMove; progress: number; side: -1 | 1}; move: {kind: SignatureMove; progress: number; side: -1 | 1; height: number}; jump: {progress: number; height: number}; trick: TrickPose}
const newStore = (): ActorStore => ({skill: {type: 'stepover', progress: 0, side: 1}, move: {kind: 'volley', progress: 0, side: 1, height: .5}, jump: {progress: 0, height: 0}, trick: createTrickPose()});

export interface PassBallOut {
  x: number; y: number; z: number;
  /** Who plays the ball now: 0 = you, 1 = your partner, -1 before the first. */
  from: number;
  /** 0..1 the passer's kick, 0 when not kicking (kept for the body hop). */
  kick: number;
  /** The transfer number (-1 before the first contact). */
  index: number;
  /** The ball is in flight (rolling or flying). */
  air: boolean;
  /** The seconds (age) at which the ball last left a body part, and how many contacts so far. */
  contactAt: number; contacts: number;
  /** The two actors' body poses: [you, partner]. */
  actors: [ActorPose, ActorPose];
  /** The routine playing (an index into PASS_ROUTINES / JUGGLE_ROUTINES / JUGGLE_SOLO_ROUTINES), and one to force on the next pick (-1 = the bag). */
  routine: number; force: number;
  /** A short bubble line (the keep-up count) and its serial: Town shows it when `sayN` changes. */
  say: string; sayN: number;
  /** Internal reused stores. */
  store: [ActorStore, ActorStore];
}
export const createPassBallOut = (): PassBallOut => ({x: 0, y: 0, z: 0, from: -1, kick: 0, index: -1, air: false, contactAt: -1, contacts: 0, actors: [newActor(), newActor()],
  routine: 0, force: -1, say: '', sayN: 0, store: [newStore(), newStore()]});

// ------------------------------------------------------------------------------------------------ authoring
/** A ball point in the pair frame of actor `w`: `f` metres toward the other actor, `s` to that actor's right, `y` up; `k` 1 = a body point (scaled
 *  with the actor's rig), 0 = an absolute point (the grass). */
interface Pt {w: Who; f: number; s: number; y: number; k: 0 | 1}
const P = (w: Who, f: number, s: number, y: number, k: 0 | 1 = 1): Pt => ({w, f, s, y, k});
/** The ball on the grass in front of `w` (`s` sideways, `f` forward). */
const G = (w: Who, s = 0, f = PASS_REACH): Pt => P(w, f, s, BALL_Y, 0);
/** Contact points on the body (rig metres at scale 1, as lib/town/walkBall.ts juggleContact). */
const FOOT = (w: Who, side: -1 | 1) => P(w, .45, side * .11, .48);
const KNEE = (w: Who, side: -1 | 1) => P(w, .4, side * .11, 1.02);
const HEAD = (w: Who) => P(w, .06, 0, 2.04);
const SHOULDER = (w: Who, side: -1 | 1) => P(w, .06, side * .28, 1.63);
const CHEST = (w: Who) => P(w, .3, 0, 1.36);
const NECK = (w: Who) => P(w, .2, 0, 1.5);
const BACK = (w: Who) => P(w, -.32, 0, .92);
const headJump = (w: Who, h: number) => P(w, .12, 0, 2.04 + h);

const enum Mode { Hold, Roll, Air, Skill }
interface Seg {t0: number; t1: number; mode: Mode; p0: Pt; p1: Pt; who: Who; skill: SkillMove; side: -1 | 1; settle: number; contact: boolean}
const enum Kind { Strike, Receive, Juggle, Skill, Move, React, Trick }
type TrickId = 'catchBack' | 'bow' | 'neck' | 'armsUp' | 'lunge';
interface Act {who: Who; kind: Kind; t0: number; t1: number; tc: number; side: -1 | 1; w: number; k: number; style: 'pass' | 'loft'; touch: Touch; period: number;
  skill: SkillMove; move: SignatureMove; height: number; react: 'chest' | 'thigh' | 'header'; trick: TrickId}
interface Jump {who: Who; t0: number; t1: number; h: number}
interface Turn {who: Who; t0: number; t1: number; a0: number; a1: number}
interface Call {who: Who; t0: number; t1: number}
interface Say {t: number; text: string}
export interface Routine {id: string; label: string; seconds: number; /** The authored length before the end padding (tests: <= seconds). */ natural: number; segs: Seg[]; acts: Act[]; jumps: Jump[]; turns: Turn[]; calls: Call[]; says: Say[];
  /** Contact times (s) and who touched, in order: the test checks the body action lands on each. */
  contacts: {t: number; who: Who; how: string}[]}

/** How a body part SENDS the ball: seconds from the start of the action to the contact (pre) and after it (post). */
type How = 'pass' | 'quick' | 'loft' | 'volley' | 'heel' | 'flick' | 'scissor' | 'header' | 'chest' | 'thigh' | Touch;
const STRIKE = {pass: {w: .22, k: .42}, quick: {w: .08, k: .3}, loft: {w: .2, k: .4}} as const;
const JUMP_PEAK = .47, HEADER_JUMP = .7, CHEST_T = .8, THIGH_T = .7, CHEST_AT = .3;

class Build {
  t = 0; at: Pt; segs: Seg[] = []; acts: Act[] = []; jumps: Jump[] = []; turns: Turn[] = []; calls: Call[] = []; says: Say[] = []; contacts: {t: number; who: Who; how: string}[] = [];
  /** The juggle period of the next keep-up touch. */
  period = .46;
  /** When each actor last had the ball (s). */
  last = [0, 0];
  constructor(public id: string, public label: string, start: Pt) { this.at = start; }
  private act(a: Partial<Act> & {who: Who; kind: Kind; t0: number; t1: number}) {
    this.acts.push({tc: a.t0, side: 1, w: 0, k: 0, style: 'pass', touch: 'foot', period: this.period, skill: 'stepover', move: 'volley', height: .5, react: 'chest', trick: 'bow', ...a});
  }
  private seg(t1: number, mode: Mode, p1: Pt, who: Who, contact: boolean, settle = 0, skill: SkillMove = 'stepover', side: -1 | 1 = 1) {
    this.segs.push({t0: this.t, t1, mode, p0: this.at, p1, who, skill, side, settle, contact}); this.t = t1; this.at = p1;
  }
  /** The ball rests where it is (a held ball, the lead-in, a settle bounce after a trap). */
  hold(d: number, settle = 0) { this.seg(this.t + d, Mode.Hold, this.at, 0, false, settle); return this; }
  /** `who` sends the ball to `to` over `travel` seconds; `rest` = the ball is resting, so the wind-up plays first (the ball waits on the foot). */
  send(who: Who, how: How, to: Pt, travel: number, o: {side?: -1 | 1; rest?: boolean; ground?: boolean; height?: number} = {}) {
    const side = o.side ?? 1;
    let pre = 0, post = 0;
    if (how === 'pass' || how === 'quick' || how === 'loft') {
      const s = STRIKE[how]; pre = s.w + contactAfterWindup(s.k); post = s.k - contactAfterWindup(s.k);
      if (o.rest) this.hold(pre);
      this.act({who, kind: Kind.Strike, t0: this.t - pre, t1: this.t + post, tc: this.t, side, w: s.w, k: s.k, style: how === 'loft' ? 'loft' : 'pass'});
    } else if (how === 'volley' || how === 'heel' || how === 'flick' || how === 'scissor') {
      const mv = how === 'heel' ? 'backHeel' : how === 'flick' ? 'flickUp' : how, m = MOVE_TIMES[mv]; pre = m.contact * m.seconds; post = m.seconds - pre;
      if (o.rest) this.hold(pre);
      this.act({who, kind: Kind.Move, t0: this.t - pre, t1: this.t + post, tc: this.t, side, move: mv, height: o.height ?? .5});
    } else if (how === 'header') {
      pre = JUMP_PEAK * HEADER_JUMP; post = HEADER_JUMP - pre;
      this.act({who, kind: Kind.React, t0: this.t - pre, t1: this.t + post, tc: this.t, side, react: 'header'});
      this.jumps.push({who, t0: this.t - pre, t1: this.t + post, h: o.height ?? .22});
    } else if (how === 'chest' || how === 'thigh') {
      const d = how === 'chest' ? CHEST_T : THIGH_T; pre = CHEST_AT * d; post = d - pre;
      this.act({who, kind: Kind.React, t0: this.t - pre, t1: this.t + post, tc: this.t, side, react: how});
    } else { // a keep-up touch on the rig's juggle phase (contact at the whole number)
      pre = post = this.period / 2;
      this.act({who, kind: Kind.Juggle, t0: this.t - pre, t1: this.t + post, tc: this.t, side, touch: how, period: this.period});
    }
    this.contacts.push({t: this.t, who, how});
    // the receiver calls for it ("to me!", a real habit worth teaching) when they have had a moment without the ball
    const other = (1 - who) as Who, quiet = this.t - this.last[other];
    if (to.w === other && quiet > 1.1) this.calls.push({who: other, t0: this.t - Math.min(.7, quiet - .4), t1: this.t + .15});
    this.last[who] = this.t + travel;
    this.seg(this.t + travel, o.ground ? Mode.Roll : Mode.Air, to, who, true);
    return this;
  }
  /** The ball bounces off the grass on its own (no body contact) and flies on to `to`. */
  bounce(to: Pt, travel: number) { this.seg(this.t + travel, Mode.Air, to, 0, false); return this; }
  /** A run of keep-up touches by `who` at `period`, touch kinds and sides in turn, the last one sending the ball to `then`. */
  keepups(who: Who, kinds: readonly Touch[], then: Pt, period = .46, count?: string[]) {
    this.period = period;
    for (let i = 0; i < kinds.length; i++) {
      const side: -1 | 1 = i % 2 === 0 ? 1 : -1, k = kinds[i], nk = kinds[i + 1], ns: -1 | 1 = side === 1 ? -1 : 1;
      const next = i + 1 < kinds.length ? (nk === 'knee' ? KNEE(who, ns) : nk === 'head' ? HEAD(who) : nk === 'shoulder' ? SHOULDER(who, ns) : FOOT(who, ns)) : then;
      if (count && count[i]) this.says.push({t: this.t, text: count[i]});
      this.send(who, k, next, period, {side});
    }
    return this;
  }
  /** `who` cushions the ball that arrives now under the foot (the rig's first touch), then it settles for `d` seconds. */
  trap(who: Who, d: number, side: -1 | 1 = 1) {
    this.act({who, kind: Kind.Receive, t0: this.t - .3, t1: this.t + d, tc: this.t, side});
    this.contacts.push({t: this.t, who, how: 'trap'});
    return this.hold(d, 1);
  }
  /** A skill move in place; the ball follows the move's own path (minus its travel: the body does not move). */
  skill(who: Who, type: SkillMove, side: -1 | 1 = 1) {
    const sec = SKILL_MOVES[type].seconds, t0 = this.t;
    this.act({who, kind: Kind.Skill, t0, t1: t0 + sec, side, skill: type});
    const end = skillPoint(who, type, 1, side);
    this.seg(t0 + sec, Mode.Skill, end, who, false, 0, type, side);
    return this;
  }
  /** A skill whose ball path is cut at progress `p` (the flick of a rainbow): the ball then flies to `to` over `travel`, the body finishes the move. */
  skillThen(who: Who, type: SkillMove, p: number, to: Pt, travel: number, side: -1 | 1 = 1) {
    const sec = SKILL_MOVES[type].seconds, t0 = this.t;
    this.act({who, kind: Kind.Skill, t0, t1: t0 + sec, side, skill: type});
    this.seg(t0 + p * sec, Mode.Skill, skillPoint(who, type, p, side), who, false, 0, type, side);
    this.contacts.push({t: this.t, who, how: type});
    this.seg(this.t + travel, Mode.Air, to, who, true);
    return this;
  }
  trick(who: Who, id: TrickId, t0: number, t1: number) { this.act({who, kind: Kind.Trick, t0, t1, trick: id}); return this; }
  jump(who: Who, t0: number, d: number, h: number) { this.jumps.push({who, t0, t1: t0 + d, h}); return this; }
  spin(who: Who, t0: number, d: number, a0: number, a1: number) { this.turns.push({who, t0, t1: t0 + d, a0, a1}); return this; }
  call(who: Who, t0: number, t1: number) { this.calls.push({who, t0, t1}); return this; }
  /** Pads the routine to `seconds` (the ball rests) and freezes it. */
  done(seconds: number): Routine {
    const natural = this.t;
    if (this.t < seconds) this.hold(seconds - this.t, 0);
    this.segs[this.segs.length - 1].t1 = Infinity;
    return {id: this.id, label: this.label, seconds, natural, segs: this.segs, acts: this.acts, jumps: this.jumps, turns: this.turns, calls: this.calls, says: this.says, contacts: this.contacts};
  }
}
/** The ball of a skill at progress p relative to the (unmoved) body, as a body-frame point of `who`. */
function skillPoint(who: Who, type: SkillMove, p: number, side: -1 | 1): Pt {
  const b = skillBall(type, p, side, {x: 0, y: 0, z: 0}), f = skillFrame(type, p, side, {x: 0, z: 0, heading: 0});
  return b ? P(who, b.z - f.z, b.x - f.x, b.y) : G(who);
}

// ------------------------------------------------------------------------------------------------ PASS IT: six routines
export const PASS_SECONDS = 7.5;
const R0 = (id: string, label: string) => new Build(id, label, G(0));
export const PASS_ROUTINES: readonly Routine[] = [
  // One-touch wall passes: a quick rhythm, both on their toes, every return first time, alternating feet; a sole stop and a jump to finish.
  (() => { const b = R0('wall-passes', 'One-touch wall passes').hold(.3).call(1, 0, .7);
    b.send(0, 'pass', G(1, .12), .55, {rest: true, ground: true});
    b.send(1, 'quick', G(0, -.12), .5, {ground: true, side: -1});
    b.send(0, 'quick', G(1, -.12), .5, {ground: true, side: -1});
    b.send(1, 'quick', G(0, .12), .5, {ground: true});
    b.send(0, 'quick', G(1, .12), .5, {ground: true});
    b.send(1, 'quick', G(0, -.12), .5, {ground: true, side: -1});
    b.send(0, 'quick', G(1), .55, {ground: true, side: -1});
    b.send(1, 'quick', G(0), .6, {ground: true}).trap(0, .5, 1);
    const t = b.t; b.jump(0, t - .2, .7, .42).spin(0, t - .1, .5, 0, Math.PI * 2).jump(1, t - .2, .7, .35).call(1, t, t + .8).trick(0, 'armsUp', t + .5, t + 1.6);
    return b.done(PASS_SECONDS); })(),
  // Skill then pass: a stepover, a croqueta and an elastico before each pass; the receiver traps under the sole each time.
  (() => { const b = R0('skill-pass', 'Skill then pass').hold(.2);
    b.skill(0, 'stepover').send(0, 'pass', G(1), .6, {rest: true, ground: true}).trap(1, .3);
    b.skill(1, 'croqueta', -1).send(1, 'pass', G(0), .6, {rest: true, ground: true, side: -1}).trap(0, .3, -1);
    b.skill(0, 'elastico').send(0, 'pass', G(1), .6, {rest: true, ground: true}).trap(1, .35);
    return b.done(PASS_SECONDS); })(),
  // Heel back-passes: you turn your back and flick it back with the heel; the partner spins a roulette and passes, a Cruyff turn and a heel back.
  (() => { const b = R0('heel-pass', 'Heel back-pass').hold(.25);
    b.spin(0, .25, .45, 0, Math.PI).hold(.5);
    b.send(0, 'heel', G(1, .1), .7, {rest: true, ground: true}).spin(0, b.t - .2, .5, Math.PI, Math.PI * 2).trap(1, .3);
    b.skill(1, 'roulette').send(1, 'pass', G(0), .65, {rest: true, ground: true}).trap(0, .3, -1);
    b.skill(0, 'cruyffTurn', -1).spin(0, b.t, .1, -Math.PI, -Math.PI);
    b.send(0, 'heel', G(1), .7, {rest: true, ground: true, side: -1}).spin(0, b.t - .3, .5, -Math.PI, 0).trap(1, .4);
    return b.done(PASS_SECONDS); })(),
  // Trap, turn and pass: a sole drag-back that turns away, a spin back round, a pass; an outside cut before the next; a jump-turn to finish.
  (() => { const b = R0('trap-turn', 'Trap, turn and pass').hold(.25);
    b.send(0, 'pass', G(1), .65, {rest: true, ground: true}).trap(1, .25);
    b.skill(1, 'dragBack').spin(1, b.t, .4, -2.9, -Math.PI * 2).hold(.35);
    b.send(1, 'pass', G(0, .1), .6, {rest: true, ground: true}).trap(0, .2);
    b.skill(0, 'outsideCut', -1).send(0, 'pass', G(1), .6, {rest: true, ground: true, side: -1}).trap(1, .2);
    b.send(1, 'quick', G(0), .55, {rest: true, ground: true}).trap(0, .3);
    b.jump(1, b.t - .3, .7, .3).spin(1, b.t - .25, .55, 0, Math.PI * 2);
    return b.done(PASS_SECONDS); })(),
  // No-look pass with a spin: a roulette, then a pass with the body turned away; the partner jumps a full turn after the trap and plays it back.
  (() => { const b = R0('no-look', 'No-look pass with a spin').hold(.25);
    b.skill(0, 'roulette').spin(0, b.t, .3, 0, 1).hold(.3);
    b.send(0, 'pass', G(1, -.1), .65, {rest: true, ground: true, side: -1}).spin(0, b.t - .1, .4, 1, 0).trap(1, .3);
    b.jump(1, b.t, .75, .4).spin(1, b.t + .05, .6, 0, Math.PI * 2).hold(.8);
    b.send(1, 'pass', G(0), .6, {rest: true, ground: true}).trap(0, .25, -1);
    b.spin(0, b.t, .55, 0, -Math.PI * 2).hold(.55).spin(0, b.t, .3, 0, -1).hold(.3);
    b.send(0, 'quick', G(1), .6, {rest: true, ground: true}).spin(0, b.t - .1, .3, -1, 0).trap(1, .3);
    return b.done(PASS_SECONDS); })(),
  // Drag-back then a through-ball past the partner's side: they turn, trap it, cut back and chip it in the air; you control it with the thigh.
  (() => { const b = R0('through-ball', 'Drag-back, through-ball').hold(.2);
    b.skill(0, 'dragBack').spin(0, b.t, .35, -2.9, -Math.PI * 2).hold(.3);
    b.send(0, 'pass', P(1, -.15, .85, BALL_Y, 0), .8, {rest: true, ground: true}).spin(1, b.t - .65, .5, 0, -1.4).trap(1, .3, 1);
    b.skill(1, 'insideCut', 1).spin(1, b.t - .3, .4, -1.4, 0);
    b.send(1, 'loft', P(0, 1.1, 0, BALL_Y, 0), .8, {rest: true}).bounce(KNEE(0, 1), .45).send(0, 'thigh', G(0), .45).trap(0, .3, -1);
    b.send(0, 'quick', G(1, -.25), .55, {rest: true, ground: true, side: -1}).trap(1, .25, -1);
    return b.done(PASS_SECONDS); })(),
];

// ------------------------------------------------------------------------------------------------ JUGGLE WITH ME: six routines (+ three solo)
export const JUGGLE_SECONDS = 9;
const J = (id: string, label: string) => new Build(id, label, G(0));
export const JUGGLE_ROUTINES: readonly Routine[] = [
  // Thigh keep-ups, then a header across: the partner chests it down, keeps it up and heads it back; you trap it and both jump.
  (() => { const b = J('thigh-header', 'Thigh keep-ups, header across').hold(.3);
    b.send(0, 'flick', FOOT(0, 1), .5, {rest: true}).keepups(0, ['foot', 'knee', 'knee'], headJump(0, .22), .5);
    b.send(0, 'header', CHEST(1), .95).send(1, 'chest', KNEE(1, 1), .5).keepups(1, ['knee', 'foot', 'knee'], headJump(1, .22), .48);
    b.send(1, 'header', CHEST(0), .95).send(0, 'chest', FOOT(0, 1), .5).keepups(0, ['foot', 'foot'], G(0), .46).trap(0, .3);
    const t = b.t; b.jump(0, t, .75, .4).jump(1, t - .1, .75, .35).trick(1, 'armsUp', t, t + 1.2);
    return b.done(JUGGLE_SECONDS); })(),
  // Around-the-world then a volley across; the partner volleys it back off a knee touch; you finish with a scissor-kick pop to the partner's chest.
  (() => { const b = J('around-volley', 'Around-the-world, volley').hold(.3);
    b.send(0, 'flick', FOOT(0, 1), .55, {rest: true}).keepups(0, ['foot', 'around-world', 'foot'], P(0, .5, .1, .62), .55);
    b.send(0, 'volley', KNEE(1, 1), 1, {height: .5}).keepups(1, ['knee', 'around-world'], P(1, .5, -.1, .62), .52);
    b.send(1, 'volley', CHEST(0), 1, {side: -1, height: .5}).send(0, 'chest', FOOT(0, 1), .5).keepups(0, ['foot'], P(0, .5, 0, .8), .5);
    b.send(0, 'scissor', CHEST(1), .95, {height: .6}).send(1, 'chest', G(1), .55).trap(1, .3);
    b.trick(1, 'bow', b.t, b.t + 1);
    return b.done(JUGGLE_SECONDS); })(),
  // Chest trap and flick: a loft to the partner's chest, it drops to the grass, a flick-up sends it back to your chest; thigh, flick, catch.
  (() => { const b = J('chest-flick', 'Chest trap and flick').hold(.3);
    b.send(0, 'loft', CHEST(1), .95, {rest: true}).send(1, 'chest', G(1), .55).trap(1, .2);
    b.send(1, 'flick', CHEST(0), 1.05, {rest: true}).send(0, 'chest', KNEE(0, -1), .5).send(0, 'thigh', G(0), .5, {side: -1}).trap(0, .2);
    b.send(0, 'flick', CHEST(1), 1.05, {rest: true}).send(1, 'chest', FOOT(1, 1), .5).keepups(1, ['foot'], KNEE(1, -1), .5);
    b.send(1, 'knee', CHEST(0), 1, {side: -1}).send(0, 'chest', G(0), .5).trap(0, .3);
    b.jump(1, b.t - .2, .7, .3).call(1, b.t, b.t + .9);
    return b.done(JUGGLE_SECONDS); })(),
  // Shoulder roll and a neck stall: shoulder pop, head, the ball rests on the neck, pop it up and head it across; the partner does the same.
  (() => { const b = J('shoulder-roll', 'Shoulder roll, neck stall').hold(.3);
    b.send(0, 'flick', FOOT(0, 1), .5, {rest: true}).keepups(0, ['foot', 'shoulder', 'head'], NECK(0), .5);
    b.trick(0, 'neck', b.t - .2, b.t + .85).hold(.7).send(0, 'head', headJump(0, .2), .35);
    b.send(0, 'header', SHOULDER(1, -1), .85, {height: .2}).keepups(1, ['shoulder', 'head'], NECK(1), .5);
    b.trick(1, 'neck', b.t - .2, b.t + .85).hold(.7).send(1, 'head', headJump(1, .2), .35);
    b.send(1, 'header', CHEST(0), .95, {height: .2}).send(0, 'chest', FOOT(0, 1), .5).keepups(0, ['foot'], G(0), .45).trap(0, .3);
    return b.done(JUGGLE_SECONDS); })(),
  // Rainbow heel flick over the head to the partner, who heads it up, keeps it on the knee and foot, then flicks a rainbow back.
  (() => { const b = J('heel-flick', 'Heel flick over the head').hold(.25);
    b.skillThen(0, 'rainbowFlick', .43, HEAD(1), 1.05).keepups(1, ['head', 'knee', 'foot'], G(1), .5).trap(1, .3);
    b.skillThen(1, 'rainbowFlick', .43, CHEST(0), 1.05).send(0, 'chest', KNEE(0, 1), .5).keepups(0, ['knee', 'foot'], G(0), .48).trap(0, .3);
    b.jump(1, b.t - .1, .7, .38).jump(0, b.t + .3, .7, .35);
    return b.done(JUGGLE_SECONDS); })(),
  // Knee count: alternating knees with a bubble counter, a header across, the partner counts on, a high pop over you and a catch behind the back, a bow.
  (() => { const b = J('knee-count', 'Knee count, catch and bow').hold(.3);
    b.send(0, 'flick', KNEE(0, 1), .5, {rest: true}).keepups(0, ['knee', 'knee', 'knee', 'knee', 'knee'], HEAD(0), .42, ['1', '2', '3', '4', '5']);
    b.send(0, 'head', KNEE(1, 1), .95, {side: 1}).keepups(1, ['knee', 'knee', 'knee', 'knee', 'knee'], P(1, .45, 0, .7), .42, ['6', '7', '8', '9', '10']);
    b.send(1, 'knee', HEAD(0), 1).send(0, 'head', BACK(0), .85).trick(0, 'catchBack', b.t - .4, b.t + .6);
    b.contacts.push({t: b.t, who: 0, how: 'catch'}); b.says.push({t: b.t, text: 'Catch!'});
    b.hold(.55).trick(0, 'bow', b.t, b.t + 1.05);
    b.call(1, b.t, b.t + .9).jump(1, b.t, .7, .32);
    return b.done(JUGGLE_SECONDS); })(),
];
/** Alone (nobody near, a friend's avatar): three solo keep-up routines at your feet. */
export const JUGGLE_SOLO_SECONDS = 5.8;
export const JUGGLE_SOLO_ROUTINES: readonly Routine[] = [
  (() => { const b = J('solo-mix', 'Keep-ups, header, chest').hold(.3);
    b.send(0, 'flick', FOOT(0, 1), .45, {rest: true}).keepups(0, ['foot', 'knee', 'shoulder'], headJump(0, .25), .44);
    b.send(0, 'header', CHEST(0), .8, {height: .25}).send(0, 'chest', KNEE(0, 1), .45).send(0, 'thigh', G(0), .45).trap(0, .3);
    b.jump(0, b.t, .75, .42).spin(0, b.t + .05, .6, 0, Math.PI * 2).trick(0, 'armsUp', b.t + .55, b.t + 1.5);
    return b.done(JUGGLE_SOLO_SECONDS); })(),
  (() => { const b = J('solo-count', 'Knee count and a bow').hold(.3);
    b.send(0, 'flick', KNEE(0, 1), .45, {rest: true}).keepups(0, ['knee', 'knee', 'knee', 'knee', 'knee', 'knee', 'knee', 'foot'], G(0), .42, ['1', '2', '3', '4', '5', '6', '7', '8']).trap(0, .3);
    b.trick(0, 'bow', b.t, b.t + 1);
    return b.done(JUGGLE_SOLO_SECONDS); })(),
  (() => { const b = J('solo-world', 'Around the world, neck, catch').hold(.3);
    b.send(0, 'flick', FOOT(0, 1), .45, {rest: true}).keepups(0, ['foot', 'around-world', 'foot', 'head'], NECK(0), .5);
    b.trick(0, 'neck', b.t - .2, b.t + .85).hold(.7).send(0, 'head', P(0, -.1, 0, 2.6), .45);
    b.send(0, 'head', BACK(0), .8).trick(0, 'catchBack', b.t - .35, b.t + .9); b.contacts.push({t: b.t, who: 0, how: 'catch'}); b.says.push({t: b.t, text: 'Catch!'});
    return b.done(JUGGLE_SOLO_SECONDS); })(),
];

// ------------------------------------------------------------------------------------------------ the bag
/** Shuffled bags (one per routine list): all routines are used before any repeats, and a new bag never starts with the last one. In place. */
export interface RoutineBag {order: Uint8Array; pos: number; last: number}
export const createRoutineBag = (n: number): RoutineBag => { const order = new Uint8Array(n); for (let i = 0; i < n; i++) order[i] = i; return {order, pos: n, last: -1}; };
export function nextRoutine(rand: () => number, bag: RoutineBag): number {
  const n = bag.order.length;
  if (bag.pos >= n) {
    const o = bag.order;
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); const t = o[i]; o[i] = o[j]; o[j] = t; }
    if (n > 1 && o[0] === bag.last) { const j = 1 + Math.min(n - 2, Math.floor(rand() * (n - 1))); const t = o[0]; o[0] = o[j]; o[j] = t; }
    bag.pos = 0;
  }
  const v = bag.order[bag.pos++]; bag.last = v; return v;
}
const BAGS = {pass: createRoutineBag(PASS_ROUTINES.length), juggle: createRoutineBag(JUGGLE_ROUTINES.length), solo: createRoutineBag(JUGGLE_SOLO_ROUTINES.length)};
/** At the start of a ball emote: the next routine from that emote's bag (or `out.force` when a play-test set it). Reduced motion always plays the
 *  first routine (its first pass / flick comes inside the 1.5 s the bubble shows). */
export function pickBallRoutine(out: PassBallOut, kind: 'pass' | 'juggle' | 'solo', rand: () => number = Math.random, reduced = false): number {
  out.routine = out.force >= 0 ? out.force : reduced ? 0 : nextRoutine(rand, BAGS[kind]); out.sayN = 0; out.say = '';
  return out.routine;
}

// ------------------------------------------------------------------------------------------------ evaluation
type P3 = {x: number; y: number; z: number};
const clamp01 = (v: number) => v < 0 ? 0 : v > 1 ? 1 : v;
const smooth = (v: number) => { const t = clamp01(v); return t * t * (3 - 2 * t); };
/** Pair frame for this frame (set once per call). */
const F = {ax: 0, ay: 0, az: 0, bx: 0, by: 0, bz: 0, ux: 0, uz: 1};
const tA = {x: 0, y: 0, z: 0}, tB = {x: 0, y: 0, z: 0}, tS = {x: 0, y: 0, z: 0}, tF = {x: 0, z: 0, heading: 0};
function resolve(p: Pt, out: P3): P3 {
  const k = p.k ? ACTOR_SCALE[p.w] : 1, sgn = p.w === 0 ? 1 : -1, fx = F.ux * sgn, fz = F.uz * sgn, rx = fz, rz = -fx;
  const ox = p.w === 0 ? F.ax : F.bx, oy = p.w === 0 ? F.ay : F.by, oz = p.w === 0 ? F.az : F.bz;
  out.x = ox + fx * p.f * k + rx * p.s * k; out.z = oz + fz * p.f * k + rz * p.s * k; out.y = oy + p.y * k;
  return out;
}
function setFrame(a: P3, b: P3) {
  const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz);
  F.ax = a.x; F.ay = a.y; F.az = a.z; F.bx = b.x; F.by = b.y; F.bz = b.z;
  if (len > 1e-4) { F.ux = dx / len; F.uz = dz / len; }
}
/** The ball for routine `r` at time t (seconds since its start). */
function ballAt(r: Routine, t: number, out: PassBallOut) {
  const segs = r.segs; let i = 0; while (i < segs.length - 1 && t >= segs[i].t1) i++;
  const s = segs[i], u = s.t1 === Infinity ? 1 : clamp01((t - s.t0) / Math.max(1e-6, s.t1 - s.t0)), T = s.t1 - s.t0;
  resolve(s.p0, tA); resolve(s.p1, tB);
  out.air = false;
  if (s.mode === Mode.Hold) {
    const dt = t - s.t0; out.x = tA.x; out.z = tA.z; out.y = tA.y + (s.settle ? .06 * Math.max(0, 1 - dt * 4) * Math.abs(Math.sin(dt * 18)) : 0);
  } else if (s.mode === Mode.Roll) { // a push pass: quick off the foot, slowing as it rolls, a tiny hop on the grass
    const e = 1 - Math.pow(1 - u, 2.2); out.air = u < 1;
    out.x = tA.x + (tB.x - tA.x) * e; out.z = tA.z + (tB.z - tA.z) * e; out.y = tA.y + (tB.y - tA.y) * e + .03 * Math.sin(u * Math.PI * 2.5) * (1 - u);
  } else if (s.mode === Mode.Air) { // gravity: straight across, a parabola up and down
    out.air = u < 1;
    out.x = tA.x + (tB.x - tA.x) * u; out.z = tA.z + (tB.z - tA.z) * u; out.y = tA.y + (tB.y - tA.y) * u + .5 * BALL_G * T * T * u * (1 - u);
  } else { // a skill: the move's own ball path (body-relative), blended in from where the ball was over the first 12 %
    const sk = SKILL_MOVES[s.skill], p = clamp01((t - s.t0) / sk.seconds), bl = skillBall(s.skill, p, s.side, tS);
    skillFrame(s.skill, p, s.side, tF);
    if (bl) {
      const sgn = s.who === 0 ? 1 : -1, fx = F.ux * sgn, fz = F.uz * sgn, ox = s.who === 0 ? F.ax : F.bx, oy = s.who === 0 ? F.ay : F.by, oz = s.who === 0 ? F.az : F.bz;
      const sc = ACTOR_SCALE[s.who], lf = (bl.z - tF.z) * sc, ls = (bl.x - tF.x) * sc, k = smooth(p / .12), sx = ox + fx * lf + fz * ls, sz = oz + fz * lf - fx * ls, sy = oy + bl.y * sc;
      out.x = tA.x + (sx - tA.x) * k; out.z = tA.z + (sz - tA.z) * k; out.y = tA.y + (sy - tA.y) * k;
    } else { out.x = tA.x; out.y = tA.y; out.z = tA.z; }
  }
}
const resetActor = (a: ActorPose) => {
  a.windup = a.kick = a.juggle = undefined; a.actionKind = 'pass'; a.receive = a.receiveProgress = 0; a.skill = undefined; a.move = undefined;
  a.reaction = undefined; a.reactionProgress = 0; a.jump = undefined; a.trick = undefined; a.ready = 0; a.called = 0; a.turn = 0; a.side = 1;
};
const TRICKS: Record<TrickId, (o: TrickPose) => void> = {
  // Both hands behind the back at the belt, leaning forward under the dropping ball, eyes up.
  catchBack: o => { o.pelvisY = .8; o.pelvisPitch = .25; o.torsoPitch = .5; o.headPitch = -.55; leg(o, 0, -.16, -.06); leg(o, 1, .16, .1); arm(o, 0, .95, .25, -1.5); arm(o, 1, .95, .25, -1.5); },
  // A deep bow: one hand on the chest, the other swept out.
  bow: o => { o.pelvisY = .78; o.pelvisZ = -.1; o.pelvisPitch = .5; o.torsoPitch = .85; o.headPitch = .2; leg(o, 0, -.16, -.04); leg(o, 1, .16, .06); arm(o, 0, -1, .15, -1.9); arm(o, 1, .25, 1.1, -.2); },
  // Neck stall: bent forward, back flat, head up, arms out wide for balance.
  neck: o => { o.pelvisY = .8; o.pelvisPitch = .3; o.torsoPitch = .75; o.headPitch = -.85; leg(o, 0, -.17, 0); leg(o, 1, .17, 0); arm(o, 0, -.2, 1.35, -.2); arm(o, 1, -.2, 1.35, -.2); },
  // Celebration: both arms up in a V, chest out.
  armsUp: o => { o.pelvisY = .9; o.pelvisPitch = -.05; o.torsoPitch = -.18; o.headPitch = -.35; leg(o, 0, -.14, 0); leg(o, 1, .14, 0); arm(o, 0, -2.75, .45, -.12); arm(o, 1, -2.75, .45, -.12); },
  // A wide lunge (unused by default; kept for routines that stretch for a ball).
  lunge: o => { o.pelvisY = .7; o.pelvisPitch = .15; o.torsoPitch = .25; o.headPitch = .3; leg(o, 0, -.3, -.2); leg(o, 1, .35, .35); arm(o, 0, -.6, .9, -.4); arm(o, 1, .3, .9, -.4); },
};
function leg(o: TrickPose, i: number, x: number, z: number) { const l = o.legs[i]; l.x = x; l.y = .075; l.z = z; l.toe = 0; l.w = 1; }
function arm(o: TrickPose, i: number, sx: number, sz: number, el: number) { const a = o.arms[i]; a.sx = sx; a.sz = sz; a.el = el; a.w = 1; }
function trickPose(id: TrickId, w: number, o: TrickPose) {
  o.pelvisZ = 0; o.pelvisRoll = 0; o.pelvisYaw = 0; o.torsoRoll = 0; o.torsoYaw = 0; o.headYaw = 0;
  TRICKS[id](o); o.w = w; return o;
}
/** Body poses of both actors at time t. `solo` = only actor 0 is real. */
function actorsAt(r: Routine, t: number, out: PassBallOut, solo: boolean) {
  for (let wi = 0; wi < 2; wi++) {
    const w = wi as Who, a = out.actors[w], st = out.store[w]; resetActor(a);
    if (solo && w === 1) continue;
    let best: Act | null = null;
    for (let i = 0; i < r.acts.length; i++) { const c = r.acts[i]; if (c.who === w && t >= c.t0 && t < c.t1 && (!best || c.t0 >= best.t0)) best = c; }
    if (best) {
      const c = best; a.side = c.side;
      if (c.kind === Kind.Strike) {
        a.actionKind = c.style;
        if (t < c.t0 + c.w) a.windup = clamp01((t - c.t0) / c.w);
        else { a.kick = KICK_FROM + (1 - KICK_FROM) * clamp01((t - c.t0 - c.w) / c.k); out.kick = Math.max(out.kick, clamp01((t - c.t0 - c.w) / c.k)); }
      } else if (c.kind === Kind.Receive) {
        if (t < c.tc) { a.receive = smooth((t - c.t0) / (c.tc - c.t0)); a.receiveProgress = 0; } else { a.receive = 1; a.receiveProgress = clamp01((t - c.tc) / .3); }
      } else if (c.kind === Kind.Juggle) {
        a.juggle = 1 + (t - c.tc) / c.period + .08; a.juggleTouch = c.touch;
      } else if (c.kind === Kind.Skill) {
        const sec = SKILL_MOVES[c.skill].seconds, p = clamp01((t - c.t0) / sec); st.skill.type = c.skill; st.skill.progress = p; st.skill.side = c.side; a.skill = st.skill;
        a.turn = skillFrame(c.skill, p, c.side, tF).heading;
      } else if (c.kind === Kind.Move) {
        st.move.kind = c.move; st.move.progress = clamp01((t - c.t0) / (c.t1 - c.t0)); st.move.side = c.side; st.move.height = c.height; a.move = st.move;
      } else if (c.kind === Kind.React) {
        a.reaction = c.react; a.reactionProgress = clamp01((t - c.t0) / (c.t1 - c.t0));
      } else {
        a.trick = trickPose(c.trick, Math.min(smooth((t - c.t0) / .22), smooth((c.t1 - t) / .25)), st.trick);
      }
    }
    // overlays: spins, jumps, the "to me" arm; idle = the ready stance
    for (let i = 0; i < r.turns.length; i++) { const q = r.turns[i]; if (q.who === w && t >= q.t0) { if (t < q.t1 || !best || best.kind !== Kind.Skill) a.turn = q.a0 + (q.a1 - q.a0) * smooth((t - q.t0) / Math.max(1e-6, q.t1 - q.t0)); } }
    for (let i = 0; i < r.calls.length; i++) { const q = r.calls[i]; if (q.who === w && t >= q.t0 && t < q.t1) a.called = Math.min(smooth((t - q.t0) / .2), smooth((q.t1 - t) / .2)); }
    let jumped = false;
    for (let i = 0; i < r.jumps.length; i++) { const q = r.jumps[i]; if (q.who === w && t >= q.t0 && t < q.t1) { st.jump.progress = (t - q.t0) / (q.t1 - q.t0); st.jump.height = q.h; a.jump = st.jump; jumped = true; } }
    if (!best && !jumped && a.juggle === undefined) a.ready = .85; // waiting: the ready stance, on the toes, knees bent
    if (a.juggle !== undefined) a.jump = undefined; // the rig keeps the feet on the grass for keep-ups
  }
}
function contactsAt(r: Routine, t: number, out: PassBallOut) {
  let n = 0, at = -1, from = -1;
  for (let i = 0; i < r.contacts.length; i++) { const c = r.contacts[i]; if (c.t <= t) { n++; at = c.t; from = c.who; } }
  out.contacts = n; out.contactAt = at; out.index = n - 1; out.from = from;
  let sn = 0, say = '';
  for (let i = 0; i < r.says.length; i++) if (r.says[i].t <= t) { sn = i + 1; say = r.says[i].text; }
  out.sayN = sn; out.say = say;
}
/** Plays routine `r` at `age` between `a` (you) and `b` (your partner's feet). */
export function playRoutine(r: Routine, age: number, a: P3, b: P3, out: PassBallOut, solo = false): PassBallOut {
  setFrame(a, b); out.kick = 0;
  const t = Math.max(0, Math.min(age, r.seconds));
  contactsAt(r, t, out); actorsAt(r, t, out, solo); ballAt(r, t, out);
  return out;
}
const routineOf = (list: readonly Routine[], i: number) => list[((i % list.length) + list.length) % list.length];
/** Pass it: the ground passing routine `out.routine` at `age`; `a` = your feet, `b` = the partner's (a townsperson, or an imaginary friend ahead). */
export const passBallAt = (age: number, a: P3, b: P3, out: PassBallOut, solo = false) => playRoutine(routineOf(PASS_ROUTINES, out.routine), age, a, b, out, solo);
/** Juggle with me: the air routine `out.routine` at `age` between you (`a`) and your partner (`b`). */
export const juggleBallAt = (age: number, a: P3, b: P3, out: PassBallOut) => playRoutine(routineOf(JUGGLE_ROUTINES, out.routine), age, a, b, out);
const soloB = {x: 0, y: 0, z: 0};
/** Alone: a solo keep-up routine at your feet (`facing` = your heading). */
export function juggleSoloAt(age: number, a: P3, facing: number, out: PassBallOut): PassBallOut {
  soloB.x = a.x + Math.sin(facing) * 3; soloB.y = a.y; soloB.z = a.z + Math.cos(facing) * 3;
  return playRoutine(routineOf(JUGGLE_SOLO_ROUTINES, out.routine), age, a, soloB, out, true);
}

/** A friend's avatar (remoteAvatars): no ball on their side, so their body plays a solo routine (keep-ups for Juggle with me, the passer's half of
 *  a Pass it routine) picked locally. Writes the rig motion fields into `m` (reused); false when the emote is not a ball emote. */
export interface BallRigMotion {actionKind?: 'pass' | 'shot' | 'loft'; windup?: number; kick?: number; kickSide?: -1 | 1; receive?: number; receiveProgress?: number;
  juggle?: number; juggleTouch?: Touch; skill?: ActorPose['skill']; move?: {kind: SignatureMove; progress: number; side: -1 | 1; height?: number}; reaction?: PlayerReaction; reactionProgress?: number;
  jump?: {progress: number; height: number}; trick?: TrickPose; ready?: number; called?: number; facing?: number; turnSmoothing?: number}
/** Copies an actor's pose onto a rig motion object (Town, islandNpcs and remoteAvatars share it). `facing` = the heading toward the partner. */
export function actorMotion(a: ActorPose, facing: number, m: BallRigMotion): BallRigMotion {
  m.actionKind = a.actionKind; m.windup = a.windup; m.kick = a.kick; m.kickSide = a.side; m.receive = a.receive; m.receiveProgress = a.receiveProgress;
  m.juggle = a.juggle; m.juggleTouch = a.juggleTouch; m.skill = a.skill; m.move = a.move; m.reaction = a.reaction; m.reactionProgress = a.reactionProgress;
  m.jump = a.jump; m.trick = a.trick; m.ready = a.ready; m.called = a.called; m.facing = facing + a.turn; m.turnSmoothing = 22;
  return m;
}
/** Clears what `actorMotion` wrote (a friend's motion object outlives the emote). */
export function clearBallMotion(m: BallRigMotion) {
  m.windup = m.kick = m.receive = m.receiveProgress = m.juggle = m.reactionProgress = m.ready = m.called = m.turnSmoothing = undefined;
  m.juggleTouch = undefined; m.actionKind = undefined; m.kickSide = undefined; m.skill = undefined; m.move = undefined; m.reaction = undefined; m.jump = undefined; m.trick = undefined;
}
const friendA = {x: 0, y: 0, z: 0}, friendB = {x: 0, y: 0, z: 0};
export function friendBallMotion(out: PassBallOut, juggle: boolean, age: number, yaw: number, m: BallRigMotion): BallRigMotion {
  friendA.x = friendA.y = friendA.z = 0;
  if (juggle) juggleSoloAt(age, friendA, yaw, out);
  else { friendB.x = Math.sin(yaw) * AIR_PARTNER; friendB.z = Math.cos(yaw) * AIR_PARTNER; passBallAt(age, friendA, friendB, out, true); }
  return actorMotion(out.actors[0], yaw, m);
}
/** The partner of a ground pass when no townsperson is near: an imaginary friend this far in front of you (m); the ball rolls out and comes back. */
export const AIR_PARTNER = 3.2;
/** The gap the townsperson steps to (m, centre to centre): close enough that the pair, the ball and its arcs fit one zoomed frame (pairMaxGap 4.5). */
export const PASS_GAP = {min: 2.9, max: 3.6} as const, JUGGLE_GAP = {min: 2.7, max: 3.4} as const;

// ------------------------------------------------------------------------------------------------ test helpers
/** A numeric pose signature of one actor (for the pairwise-difference test): leg swing, foot lift, body lift, lean, turn, arms, skill. */
export function actorSignature(a: ActorPose, out: Float32Array, o: number) {
  const kickArc = a.kick !== undefined ? Math.sin(Math.PI * clamp01((a.kick - KICK_FROM) / (1 - KICK_FROM))) : 0, wind = a.windup ?? 0;
  const tap = a.juggle !== undefined ? Math.max(0, 1 - (a.juggle % 1) / .32) : 0;
  const touchY = a.juggle === undefined ? 0 : a.juggleTouch === 'knee' ? .6 : a.juggleTouch === 'head' ? 1 : a.juggleTouch === 'shoulder' ? .8 : a.juggleTouch === 'around-world' ? .45 : .3;
  const jumpH = a.jump ? a.jump.height * Math.sin(Math.PI * clamp01(a.jump.progress)) : 0;
  const mv = a.move ? Math.sin(Math.PI * a.move.progress) : 0, rx = a.reaction ? Math.sin(Math.PI * a.reactionProgress) : 0;
  const sk = a.skill ? Math.sin(Math.PI * a.skill.progress) : 0, tr = a.trick ? a.trick.w : 0;
  out[o] = kickArc * a.side; out[o + 1] = -wind * .5; out[o + 2] = tap * touchY * a.side; out[o + 3] = jumpH * 3; out[o + 4] = Math.sin(a.turn); out[o + 5] = Math.cos(a.turn) - 1;
  out[o + 6] = a.receive * .5; out[o + 7] = mv * (a.move && (a.move.kind === 'scissor' || a.move.kind === 'volley') ? 1 : -1); out[o + 8] = rx * (a.reaction === 'header' ? 1 : a.reaction === 'chest' ? -1 : .5);
  const hue = a.skill ? SKILL_HUE[a.skill.type] ?? 0 : 0;
  out[o + 9] = sk * Math.cos(hue); out[o + 10] = tr * (a.trick ? (a.trick.torsoPitch) : 0); out[o + 11] = a.called; out[o + 12] = a.ready * .3; out[o + 13] = sk * Math.sin(hue);
}
const SKILL_HUE: Partial<Record<SkillMove, number>> = {stepover: 0, croqueta: 1, elastico: 2, roulette: 3, cruyffTurn: 4, dragBack: 5, outsideCut: 6, insideCut: 7, rainbowFlick: 8, bodyFeint: 9};
export const SIGNATURE_SIZE = 14;
