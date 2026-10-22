// Whole-body Wave / Cheer / Laugh (user, Oct 22 2026: "many of them look similar ... standing and just waving their arms ... make them all
// very different and not look static and the same"). Pure pose functions + shuffled bags; no three.js, no DOM, no allocation per frame.
//
// Each emote has six variants. A variant fills one pose vector (BODY_CH numbers, layout in BC) for a time on the 4 s clock: the root's
// in-place travel (side / forward, hop, crouch, spin), the torso (pitch / twist / side bend), the head, both arms and both legs. The writer
// (lib/graphics/bodyEmotePose.ts) puts it on the rig after `rig.update` for you, a friend and a townsperson alike. Everything stays inside
// EMOTE_BOUNDS (lib/town/emoteBounds.ts): spins, slides and staggers happen in place, the root never leaves a 1 m circle.
// Arm numbers follow the rig (shoulder-x < 0 swings forward / up, "out" lifts it sideways and is mirrored for the left arm, elbow < 0 bends);
// legs: hip-x < 0 lifts the thigh forward, "out" spreads it sideways (mirrored), knee > 0 bends. The crouch drop bends both knees on top,
// keeping the feet planted (legBend). A townsperson answers with a DIFFERENT variant of the same emote (BODY_ANSWER) at BODY_NPC_AMP.

export const BODY_CH = 24;
/** Channel indices of the pose vector. px / pz in metres (character-local: +x right, +z forward), hop / crouch in metres, the rest radians. */
export const BC = {px: 0, pz: 1, hop: 2, crouch: 3, yaw: 4, pitch: 5, twist: 6, side: 7, hx: 8, hy: 9, hz: 10,
  lsx: 11, lsz: 12, lel: 13, rsx: 14, rsz: 15, rel: 16, lhx: 17, lhz: 18, lkn: 19, rhx: 20, rhz: 21, rkn: 22, roll: 23} as const;
/** The wire values (multiplayer/protocol Emote, fixed) of the three emotes this module owns. */
export const BODY_EMOTE = {Wave: 0, Cheer: 1, Laugh: 7} as const;
export const isBodyEmote = (k: number): boolean => k === 0 || k === 1 || k === 7;
/** A townsperson's answer plays at this amplitude (travel, bends, legs; arms and spins stay whole). */
export const BODY_NPC_AMP = .8;
/** Leg length (hip to ankle, m) the crouch solve uses: thigh .43 + shin .40 (lib/graphics/player.ts). */
export const LEG_LEN = .83;
/** Hip angle for a crouch drop of `c` metres with the feet planted (hip -th, knee +2th, ankle -th). */
export const legBend = (c: number): number => c <= 0 ? 0 : Math.acos(Math.max(-1, 1 - c / LEG_LEN));

const TAU = Math.PI * 2, PI = Math.PI;
const cl = (v: number) => v < 0 ? 0 : v > 1 ? 1 : v;
const S = (v: number) => { const t = cl(v); return t * t * (3 - 2 * t); };
/** 0 → 1 between a and b, eased. */
const seg = (t: number, a: number, b: number) => S((t - a) / (b - a));
/** On between a and b with eased edges of length e. */
const win = (t: number, a: number, b: number, e = .25) => Math.min(seg(t, a, a + e), 1 - seg(t, b - e, b));
/** A hop arc 0..1..0 over [t0, t0 + len]. */
const arc = (t: number, t0: number, len: number) => { const u = (t - t0) / len; return u <= 0 || u >= 1 ? 0 : 4 * u * (1 - u); };
const pos = (v: number) => v > 0 ? v : 0;
const sin = Math.sin, cos = Math.cos, abs = Math.abs;
const RA = [.05, .12, -.1] as const; // arm at rest
type O = Float32Array | number[];
/** Arm `L` (left) or right: rest → (sx, out, el) by f. */
function arm(o: O, L: boolean, f: number, sx: number, sz: number, el: number) {
  const i = L ? BC.lsx : BC.rsx; o[i] = RA[0] + (sx - RA[0]) * f; o[i + 1] = RA[1] + (sz - RA[1]) * f; o[i + 2] = RA[2] + (el - RA[2]) * f;
}
/** Blend the arm already written toward (sx, out, el) by f. */
function armTo(o: O, L: boolean, f: number, sx: number, sz: number, el: number) {
  const i = L ? BC.lsx : BC.rsx; o[i] += (sx - o[i]) * f; o[i + 1] += (sz - o[i + 1]) * f; o[i + 2] += (el - o[i + 2]) * f;
}
function leg(o: O, L: boolean, hx: number, hz: number, kn: number) { const i = L ? BC.lhx : BC.rhx; o[i] = hx; o[i + 1] = hz; o[i + 2] = kn; }
/** Kneel on both knees (thighs upright, shins flat) over the crouch already in o, by f. */
function kneel(o: O, f: number) {
  const th = legBend(o[BC.crouch]);
  o[BC.lhx] = o[BC.rhx] = (th - .12) * f; o[BC.lkn] = o[BC.rkn] = (1.5 - 2 * th) * f;
}

export function restPose(o: O) {
  for (let i = 0; i < BODY_CH; i++) o[i] = 0;
  o[BC.lsx] = o[BC.rsx] = RA[0]; o[BC.lsz] = o[BC.rsz] = RA[1]; o[BC.lel] = o[BC.rel] = RA[2];
}

// ---------------------------------------------------------------------------------------------------------------------------- WAVE
/** Windmill: both arms swing in big opposite circles while the feet shuffle side to side. */
function waveWindmill(t: number, o: O) {
  const e = win(t, .1, 3.8, .5), w = TAU * 1.15 * (t - .2), sway = sin(TAU * .5 * t), step = sin(TAU * t);
  o[BC.px] = .34 * sway * e; o[BC.crouch] = (.06 + .06 * abs(step)) * e; o[BC.hop] = .05 * pos(sin(TAU * 2 * t)) * e;
  o[BC.side] = -.14 * sway * e; o[BC.twist] = .22 * sin(w) * e; o[BC.roll] = .1 * sway * e; o[BC.hy] = .25 * sway * e; o[BC.hz] = .12 * sway * e;
  leg(o, true, -.35 * pos(step) * e, .25 * pos(-cos(TAU * .5 * t)) * e, .6 * pos(step) * e);
  leg(o, false, -.35 * pos(-step) * e, .25 * pos(cos(TAU * .5 * t)) * e, .6 * pos(-step) * e);
  arm(o, true, e, -1.7 - 1.15 * sin(w), 1.0 + .75 * cos(w), -.25);
  arm(o, false, e, -1.7 - 1.15 * sin(w + PI), 1.0 + .75 * cos(w + PI), -.25);
}
/** Jumping hello: crouch, a big jump with both arms flung up, land, then a bouncing one-arm wave with the other hand on the hip. */
function waveJump(t: number, o: O) {
  const load = win(t, .05, .62, .3), air = arc(t, .55, .5), land = win(t, 1.0, 1.4, .18), wv = win(t, 1.25, 3.8, .35), up = win(t, .45, 1.15, .15);
  o[BC.crouch] = .24 * load + .2 * land + (.05 + .05 * abs(sin(TAU * 2 * t))) * wv; o[BC.hop] = .48 * air + .07 * pos(sin(TAU * 2 * t + 1)) * wv;
  o[BC.pitch] = .3 * load - .12 * up + .08 * land; o[BC.hx] = -.3 * up; o[BC.side] = .16 * wv; o[BC.roll] = -.08 * wv; o[BC.hz] = -.18 * wv * sin(TAU * t);
  const tuck = air; leg(o, true, -.6 * tuck, .1 * tuck, 1.1 * tuck + .3 * pos(sin(TAU * 2 * t)) * wv); leg(o, false, -.5 * tuck, .1 * tuck, 1.0 * tuck);
  arm(o, true, load, .7, .35, -.2); arm(o, false, load, .7, .35, -.2);
  armTo(o, true, up, -2.8, .7, -.1); armTo(o, false, up, -2.8, .7, -.1);
  const ws = sin(TAU * 2.4 * t);
  armTo(o, false, wv, -.3, 2.3 + .4 * ws, -.7 - .35 * ws); armTo(o, true, wv, -.25, .95, -1.9);
}
/** Royal wave: forearm up, hand twisting, hips swaying; then a deep curtsy with one leg crossed behind. */
function waveRoyal(t: number, o: O) {
  const e = win(t, .1, 2.6, .35), c = win(t, 2.3, 3.85, .45), sw = sin(TAU * .6 * t);
  o[BC.px] = .14 * sw * e; o[BC.roll] = .16 * sw * e; o[BC.side] = -.1 * sw * e; o[BC.twist] = .18 * sin(TAU * .3 * t) * e; o[BC.hy] = .35 * sin(TAU * .3 * t) * e;
  o[BC.crouch] = .04 * e + .24 * c; o[BC.pitch] = .32 * c; o[BC.hx] = .35 * c; o[BC.hz] = .12 * e * sw;
  leg(o, true, .5 * c + .1 * pos(sw) * e, -.22 * c, .75 * c); leg(o, false, .1 * pos(-sw) * e, .05 * c, .2 * c);
  arm(o, false, e, -.45, .55 + .14 * sin(TAU * 1.8 * t), -1.8); arm(o, true, e, -.65, -.25, -1.55);
  armTo(o, false, c, -.35, .65, -.12); armTo(o, true, c, -.35, .65, -.12);
}
/** Wave, heel click, then a crisp salute leaning back proud. */
function waveSalute(t: number, o: O) {
  const wv = win(t, .1, 1.7, .3), click = arc(t, 1.55, .35), sal = win(t, 1.75, 3.85, .2), ws = sin(TAU * 2 * t);
  o[BC.px] = .18 * wv; o[BC.side] = .22 * wv; o[BC.roll] = -.1 * wv; o[BC.hz] = .2 * wv;
  o[BC.hop] = .12 * click + .02 * sal * pos(sin(TAU * 3 * t)); o[BC.pitch] = -.16 * sal; o[BC.hx] = -.18 * sal; o[BC.twist] = -.2 * sal * sin(TAU * .4 * (t - 1.8));
  leg(o, true, -.1 * wv, .05 * wv, .25 * wv + .3 * click); leg(o, false, -.05 * wv, .28 * wv - .08 * click, .1 * wv + .3 * click);
  if (sal > 0) { o[BC.lhz] -= .05 * sal; o[BC.rhz] -= .05 * sal; }
  arm(o, false, wv, -.35, 2.25 + .35 * ws, -.9 - .3 * ws); arm(o, true, wv, -.25, .95, -1.9);
  armTo(o, false, sal, -1.75, 1.05, -2.35); armTo(o, true, sal, .12, .06, -.02);
}
/** "Hey, over there!": hand shading the eyes, scanning left and right on tiptoe, then a jumping two-arm overhead wave. */
function waveSearch(t: number, o: O) {
  const s = win(t, .1, 1.9, .3), big = win(t, 1.75, 3.85, .3), scan = sin(PI * (t - .1) / .85), ws = sin(TAU * 2.2 * t);
  o[BC.twist] = .5 * scan * s; o[BC.yaw] = .3 * scan * s; o[BC.hy] = .4 * scan * s; o[BC.pitch] = .22 * s - .1 * big; o[BC.hop] = .05 * s + .26 * (arc(t, 2.05, .5) + arc(t, 2.85, .5)) * big;
  o[BC.side] = .12 * scan * s; o[BC.crouch] = .1 * big * pos(-sin(TAU * 1.25 * (t - 2.05))); o[BC.pz] = .25 * big;
  leg(o, true, -.15 * s * pos(scan), .1 * s, .3 * s * pos(scan) + .8 * arc(t, 2.05, .5) * big); leg(o, false, -.15 * s * pos(-scan), .1 * s, .3 * s * pos(-scan) + .8 * arc(t, 2.85, .5) * big);
  arm(o, false, s, -2.3, .45, -2.25); arm(o, true, s, -.2, .9, -1.9);
  armTo(o, false, big, -.4, 2.65 + .4 * ws, -.25); armTo(o, true, big, -.4, 2.65 - .4 * ws, -.25);
}
/** Shy wave: a little wave at the chest, head tilted, toe twisting the ground, then hiding behind both hands and peeking. */
function waveShy(t: number, o: O) {
  const e = win(t, .1, 3.85, .4), hide = win(t, 2.2, 3.25, .25), twist = sin(TAU * .9 * t);
  o[BC.crouch] = .07 * e + .08 * hide; o[BC.hz] = .38 * e * (1 - hide); o[BC.hx] = .28 * e; o[BC.side] = .12 * e + .1 * twist * e; o[BC.twist] = .2 * twist * e;
  o[BC.roll] = .07 * twist * e; o[BC.px] = .07 * twist * e; o[BC.pitch] = .1 * e + .2 * hide;
  leg(o, false, -.15 * e, (.12 + .15 * twist) * e, .4 * e); leg(o, true, -.12 * pos(-twist) * e, -.08 * e, (.12 + .28 * pos(-twist)) * e);
  arm(o, false, e, -.95, .35 + .14 * sin(TAU * 3 * t), -1.9); arm(o, true, e, .55, .3, -.7);
  armTo(o, false, hide, -1.25, .22, -2.45); armTo(o, true, hide, -1.25, .22, -2.45);
}

// ---------------------------------------------------------------------------------------------------------------------------- CHEER
/** Two jumps with fist pumps (the second tucked), then three "yes!" fist pulls with the knee driving up. */
function cheerJumps(t: number, o: O) {
  const load = win(t, .05, .5, .25) + win(t, 1.0, 1.4, .18) * .8, a1 = arc(t, .42, .55), a2 = arc(t, 1.32, .58), yes = win(t, 2.0, 3.85, .3);
  const pull = pos(sin(TAU * 1.6 * (t - 2.05)));
  o[BC.crouch] = .24 * load + .08 * yes * pull + .05 * yes; o[BC.hop] = .45 * a1 + .5 * a2; o[BC.pitch] = .28 * load - .15 * (a1 + a2) + .32 * yes * pull;
  o[BC.hx] = -.3 * (a1 + a2) + .2 * yes * pull; o[BC.twist] = .25 * yes * pull;
  leg(o, true, -1.1 * a2, .1 * a2, 1.6 * a2 + .2 * a1); leg(o, false, -1.0 * a2 - .95 * yes * pull, .08 * a2, 1.5 * a2 + .2 * a1 + 1.25 * yes * pull);
  const upA = win(t, .3, 1.0, .15), upB = win(t, 1.22, 1.95, .15);
  arm(o, true, cl(load), .55, .3, -.3); arm(o, false, cl(load), .55, .3, -.3);
  armTo(o, true, upA, -2.75, .45, -.45); armTo(o, false, upA, -2.75, .45, -.45);
  armTo(o, false, upB, -2.95, .2, -.25); armTo(o, true, upB, -1.2, .4, -1.9);
  armTo(o, false, yes, -1.25 + .55 * (1 - pull), .25, -2.15); armTo(o, true, yes, -.35, .7, -1.7);
}
/** Goal! Run on the spot with high knees, then arms out like an aeroplane banking round one full circle. */
function cheerAirplane(t: number, o: O) {
  const run = win(t, .1, 1.75, .3), pl = win(t, 1.55, 3.85, .3), ph = TAU * 2.6 * t, k = sin(ph);
  const th = TAU * seg(t, 1.75, 3.55);
  o[BC.hop] = .07 * abs(k) * run; o[BC.pitch] = .22 * run - .05 * pl; o[BC.crouch] = .05 * run;
  leg(o, true, -1.15 * pos(k) * run - .4 * pos(sin(TAU * 2 * t)) * pl, .05 * (run + pl), 1.6 * pos(k) * run + .6 * pos(sin(TAU * 2 * t)) * pl);
  leg(o, false, -1.15 * pos(-k) * run - .4 * pos(-sin(TAU * 2 * t)) * pl, .05 * (run + pl), 1.6 * pos(-k) * run + .6 * pos(-sin(TAU * 2 * t)) * pl);
  arm(o, true, run, -.2 - .85 * k, .2, -1.5); arm(o, false, run, -.2 + .85 * k, .2, -1.5);
  armTo(o, true, pl, -.15, 1.5, -.05); armTo(o, false, pl, -.15, 1.5, -.05);
  o[BC.yaw] = th * pl; o[BC.px] = .5 * sin(th) * pl; o[BC.pz] = .5 * (1 - cos(th)) * pl;
  o[BC.side] = .38 * sin(TAU * .9 * (t - 1.75)) * pl; o[BC.roll] = .1 * sin(TAU * .9 * (t - 1.75)) * pl; o[BC.hx] = -.15 * pl + .12 * abs(k) * run; o[BC.hy] = .35 * sin(TAU * .9 * (t - 1.75)) * pl; o[BC.hz] = -.25 * sin(TAU * .9 * (t - 1.75)) * pl;
}
/** Knee slide: two stamping steps, slide forward onto both knees, arch back roaring with fists shaking, then up and back. */
function cheerKneeSlide(t: number, o: O) {
  const runIn = win(t, .05, 1.0, .25), slide = win(t, .85, 3.0, .35), up = seg(t, 2.85, 3.75), stp = sin(TAU * 2.2 * t);
  o[BC.pz] = .85 * seg(t, .8, 1.35) * (1 - up); o[BC.crouch] = .38 * slide + .06 * runIn; o[BC.pitch] = .3 * runIn - .5 * slide; o[BC.hx] = -.45 * slide;
  o[BC.hop] = .06 * pos(stp) * runIn; o[BC.twist] = .12 * sin(TAU * 1.5 * t) * slide;
  leg(o, true, -.7 * pos(stp) * runIn, .05 * runIn, 1.0 * pos(stp) * runIn); leg(o, false, -.7 * pos(-stp) * runIn, .05 * runIn, 1.0 * pos(-stp) * runIn);
  kneel(o, slide); o[BC.lhz] += .12 * slide; o[BC.rhz] += .12 * slide;
  arm(o, true, runIn, .7, .3, -.8); arm(o, false, runIn, .7, .3, -.8);
  const sh = .1 * sin(TAU * 7 * t);
  armTo(o, true, slide, -2.3 + sh, 1.05, -.8); armTo(o, false, slide, -2.3 - sh, 1.05, -.8);
}
/** Cheerleader: pom-pom shakes overhead with a hip bounce, a high kick each side, and a hip-pop finish. */
function cheerPomPom(t: number, o: O) {
  const e = win(t, .1, 3.85, .3), k1 = win(t, 1.1, 1.85, .25), k2 = win(t, 2.2, 2.95, .25), fin = win(t, 3.05, 3.9, .25), sh = sin(TAU * 5 * t);
  o[BC.crouch] = (.08 + .07 * sin(TAU * 2 * t)) * e * (1 - fin); o[BC.roll] = .14 * sin(TAU * t) * e + .16 * fin; o[BC.px] = .1 * sin(TAU * t) * e + .12 * fin;
  o[BC.pitch] = -.1 * (k1 + k2); o[BC.hz] = .22 * fin; o[BC.side] = -.18 * fin;
  leg(o, false, -1.55 * k1, .05 * e, .1 * k1 + .25 * (1 - k1) * pos(sin(TAU * 2 * t)) * e); leg(o, true, -1.55 * k2, .05 * e + .14 * fin, .1 * k2);
  arm(o, true, e, -2.6, .75 + .18 * sh, -.25 - .3 * pos(sh)); arm(o, false, e, -2.6, .75 - .18 * sh, -.25 - .3 * pos(-sh));
  armTo(o, true, k1, -.5, 1.3, -.1); armTo(o, false, k1, -.5, 1.3, -.1);
  armTo(o, true, fin, -.2, .9, -1.9); armTo(o, false, fin, -2.85, .35, -.1);
}
/** Stadium bounce: a deep bounce on every beat with both fists circling overhead, turning to each side of the crowd. */
function cheerStadium(t: number, o: O) {
  const e = win(t, .1, 3.85, .35), b = sin(TAU * 2 * t), w = TAU * 1.6 * t, side = sin(TAU * .5 * (t - .1));
  o[BC.crouch] = (.15 + .1 * b) * e; o[BC.hop] = .14 * pos(-b) * e; o[BC.pitch] = (.12 + .1 * b) * e; o[BC.hx] = .2 * b * e;
  o[BC.twist] = .45 * side * e; o[BC.yaw] = .25 * side * e; o[BC.roll] = .06 * b * e; o[BC.hy] = .3 * side * e;
  leg(o, true, -.1 * e, .18 * e, .1 * e); leg(o, false, -.1 * e, .18 * e, .1 * e);
  arm(o, true, e, -2.3 + .5 * sin(w), .6 + .5 * cos(w), -1.05); arm(o, false, e, -2.3 + .5 * sin(w + PI), .6 + .5 * cos(w + PI), -1.05);
}
/** Victory spin: one full jump-turn pointing to the sky, a wide landing, then double-biceps flexes front and side. */
function cheerSpinFlex(t: number, o: O) {
  const load = win(t, .05, .5, .25), sp = win(t, .4, 1.6, .15), land = win(t, 1.45, 3.85, .3), ft = seg(t, 1.8, 2.1);
  o[BC.yaw] = TAU * seg(t, .45, 1.45); o[BC.hop] = .32 * arc(t, .45, 1.0); o[BC.crouch] = .2 * load + (.17 + .04 * sin(TAU * 1.5 * t)) * land;
  o[BC.pitch] = .25 * load - .18 * land; o[BC.hx] = -.2 * sp - .15 * land; o[BC.twist] = .4 * sin(TAU * .5 * (t - 2.1)) * land * ft; o[BC.hy] = -.35 * sin(TAU * .5 * (t - 2.1)) * land * ft;
  leg(o, true, -.5 * sp * arc(t, .45, 1.0), .25 * land, .9 * sp * arc(t, .45, 1.0)); leg(o, false, -.2 * sp * arc(t, .45, 1.0), .25 * land, .5 * sp * arc(t, .45, 1.0));
  arm(o, true, load, -.6, -.1, -1.6); arm(o, false, load, -.6, -.1, -1.6);
  armTo(o, true, sp, -2.95, .15, -.05); armTo(o, false, sp, -.2, 1.3, -.05);
  const pulse = .3 * pos(sin(TAU * 1.5 * (t - 2.1)));
  armTo(o, true, land * ft, -1.45, 1.05, -1.95 - pulse); armTo(o, false, land * ft, -1.45, 1.05, -1.95 - pulse);
}

// ---------------------------------------------------------------------------------------------------------------------------- LAUGH
/** Doubled over, slapping both knees, stomping one foot then the other. */
function laughKneeSlap(t: number, o: O) {
  const e = win(t, .1, 3.85, .45), sl = sin(TAU * 2.5 * t), st = sin(TAU * 1.25 * t);
  o[BC.pitch] = (.95 + .12 * sl) * e; o[BC.crouch] = (.12 + .07 * abs(sl)) * e; o[BC.hx] = -.45 * e; o[BC.hy] = .35 * sin(TAU * 4 * t) * e;
  o[BC.roll] = .1 * st * e; o[BC.hop] = .03 * pos(sl) * e; o[BC.side] = .1 * st * e;
  leg(o, true, -.8 * pos(st) * e, .16 * e, 1.25 * pos(st) * e); leg(o, false, -.8 * pos(-st) * e, .16 * e, 1.25 * pos(-st) * e);
  arm(o, true, e, -.35 - .75 * pos(sl), .45, -.15 - .9 * pos(-sl)); arm(o, false, e, -.35 - .75 * pos(-sl), .45, -.15 - .9 * pos(sl));
}
/** Belly laugh: each big HA throws the head back and the arms open, then the hands pound the belly; then a tear wiped from the eye. */
function laughBelly(t: number, o: O) {
  const e = win(t, .1, 2.6, .35), wipe = win(t, 2.35, 3.85, .35), sh = sin(TAU * 6.5 * t), ha = pos(sin(TAU * 1.2 * (t - .2))), bo = abs(sin(TAU * 2.6 * t));
  o[BC.pitch] = (-.5 * ha + .1 * (1 - ha)) * e + .22 * wipe; o[BC.hx] = -.6 * ha * e + .3 * wipe; o[BC.crouch] = (.05 + .09 * (1 - ha)) * e + .1 * wipe; o[BC.hop] = .1 * ha * bo * e;
  o[BC.px] = .03 * sh * e; o[BC.roll] = .06 * sh * e; o[BC.side] = .05 * sh * e + .1 * wipe; o[BC.hz] = .22 * wipe; o[BC.twist] = -.15 * wipe; o[BC.hy] = .12 * sh * e;
  leg(o, true, -.05 * e, .22 * (e + wipe), (.15 + .25 * (1 - ha)) * e); leg(o, false, -.05 * e, .22 * (e + wipe), (.15 + .25 * (1 - ha)) * e);
  arm(o, true, e, -.8 + .1 * sh, .35, -1.55); arm(o, false, e, -.8 - .1 * sh, .35, -1.55);
  armTo(o, true, ha * e, -.35, 1.25, -.45); armTo(o, false, ha * e, -.35, 1.25, -.45); // each big HA throws the arms open
  armTo(o, true, wipe, -1.25, -.15 + .12 * sin(TAU * 2 * t), -2.5); armTo(o, false, wipe, -.8, .35, -1.55);
}
/** Points at you, staggers back helpless with one arm flailing, wobbles, points again and shuffles back. */
function laughStagger(t: number, o: O) {
  const pt = win(t, .05, .8, .2) + win(t, 2.15, 3.0, .25), back = seg(t, .65, 1.9) * (1 - seg(t, 2.9, 3.85)), fl = win(t, .6, 2.3, .3), stp = sin(TAU * 2 * t);
  o[BC.pz] = -.7 * back; o[BC.pitch] = .22 * cl(pt) - .45 * fl; o[BC.hx] = -.3 * fl; o[BC.roll] = .2 * sin(TAU * 1.1 * t) * fl; o[BC.side] = .22 * sin(TAU * 1.1 * t) * fl;
  o[BC.crouch] = .08 * fl + .06 * abs(stp) * (back > 0 && back < 1 ? 1 : .4); o[BC.twist] = .3 * cl(pt);
  const walk = fl + win(t, 2.9, 3.85, .25);
  leg(o, true, .4 * stp * walk, .1 * cl(walk), .55 * pos(stp) * walk); leg(o, false, -.4 * stp * walk, .1 * cl(walk), .55 * pos(-stp) * walk);
  arm(o, true, win(t, .05, .8, .2), -1.6, .1, -.05); arm(o, false, win(t, .05, .8, .2), -.7, .3, -1.5);
  armTo(o, false, fl, -.8 + .5 * sin(TAU * 2.5 * t), 1.5 + .4 * sin(TAU * 1.9 * t), -.5); armTo(o, true, fl, -.75, .3, -1.6);
  armTo(o, false, win(t, 2.15, 3.0, .25), -1.6, -.1, -.05);
}
/** Clutching the sides, hopping from one foot to the other, body rocking with each hop. */
function laughHop(t: number, o: O) {
  const e = win(t, .1, 3.85, .35), per = .5, i = Math.floor(t / per), u = t / per - i, L = (i & 1) === 0, h = arc(u, 0, 1);
  o[BC.hop] = .14 * h * e; o[BC.side] = (L ? .25 : -.25) * e; o[BC.roll] = (L ? -.12 : .12) * e; o[BC.hz] = (L ? -.3 : .3) * e;
  o[BC.px] = .22 * sin(PI * t / per - PI / 2) * e * .8; o[BC.pitch] = (.3 + .1 * h) * e; o[BC.crouch] = .06 * e * (1 - h); o[BC.hy] = .2 * sin(TAU * 3 * t) * e;
  leg(o, L, -.65 * e, .12 * e, 1.35 * e); leg(o, !L, .05 * e, .03 * e, .15 * e);
  arm(o, true, e, -.45, .6, -1.85); arm(o, false, e, -.45, .6, -1.85);
}
/** Slaps the thigh (lifting it to meet the hand), spins round on one foot hugging the belly, then slaps the other side, dizzy. */
function laughThighSpin(t: number, o: O) {
  const a = win(t, .1, 1.6, .3), sp = win(t, 1.45, 2.75, .2), b = win(t, 2.6, 3.85, .3), sl = pos(sin(TAU * 2.4 * t));
  o[BC.yaw] = TAU * seg(t, 1.6, 2.6); o[BC.pitch] = .38 * (a + b) * (.7 + .3 * sl) - .1 * sp; o[BC.hz] = .2 * sl * (a + b); o[BC.hy] = .3 * sin(TAU * 2 * t) * (a + b); o[BC.hx] = -.3 * sp;
  o[BC.crouch] = .06 * (a + b) + .05 * sp; o[BC.hop] = .12 * arc(t, 1.65, .9) * sp; o[BC.roll] = .14 * sin(TAU * 1.3 * t) * b; o[BC.side] = .2 * a - .2 * b + .18 * sin(TAU * 1.3 * t) * b;
  leg(o, false, -.7 * sl * a, .08 * (a + sp + b), .7 * sl * a); leg(o, true, -.7 * sp - .7 * sl * b, .08 * (a + sp + b), 1.25 * sp + .7 * sl * b);
  arm(o, false, a, -.15 - .5 * sl, .4, -.2); arm(o, true, a, -.8, .3, -1.55);
  armTo(o, true, sp, -.8, .3, -1.6); armTo(o, false, sp, -.8, .3, -1.6);
  armTo(o, true, b, -.15 - .5 * sl, .4, -.2); armTo(o, false, b, -.6, 1.1, -.3);
}
/** Laughing so hard they lean on the partner: a hand reaching to their shoulder, knees buckling, legs crossed; then a brow wipe. */
function laughLean(t: number, o: O) {
  const e = win(t, .1, 2.8, .4), wipe = win(t, 2.6, 3.85, .3), bu = abs(sin(TAU * 2.2 * t));
  o[BC.pz] = .38 * e; o[BC.px] = .15 * e; o[BC.pitch] = (.4 + .08 * bu) * e - .1 * wipe; o[BC.side] = .28 * e; o[BC.roll] = -.1 * e;
  o[BC.crouch] = (.14 + .07 * bu) * e + .04 * wipe; o[BC.hy] = .3 * sin(TAU * 3.5 * t) * e; o[BC.hx] = -.25 * e - .2 * wipe; o[BC.twist] = -.2 * e;
  leg(o, true, -.2 * e, -.28 * e, .35 * e); leg(o, false, .05 * e, .15 * e, .2 * e);
  arm(o, false, e, -1.6 - .15 * sin(TAU * 2.2 * t), .3, -.15); arm(o, true, e, -.8, .3, -1.55 + .15 * sin(TAU * 6 * t));
  armTo(o, true, wipe, -2.1, .25, -2.35); armTo(o, false, wipe, -.3, .6, -1.9);
}

export type BodyPoseFn = (t: number, o: O) => void;
export interface BodyVariant { id: string; name: string; pose: BodyPoseFn }
const V = (id: string, name: string, pose: BodyPoseFn): BodyVariant => ({id, name, pose});
export const BODY_VARIANTS: Readonly<Record<number, readonly BodyVariant[]>> = {
  0: [V('windmill', 'Windmill shuffle', waveWindmill), V('jump-hello', 'Jumping hello', waveJump), V('royal', 'Royal wave + curtsy', waveRoyal),
    V('salute', 'Wave, heel click, salute', waveSalute), V('over-there', 'Hey, over there!', waveSearch), V('shy', 'Shy wave + peekaboo', waveShy)],
  1: [V('double-jump', 'Double jump fist pumps', cheerJumps), V('airplane', 'Goal run + aeroplane', cheerAirplane), V('knee-slide', 'Knee slide roar', cheerKneeSlide),
    V('pom-pom', 'Pom-pom kicks', cheerPomPom), V('stadium', 'Stadium bounce', cheerStadium), V('spin-flex', 'Victory spin + flex', cheerSpinFlex)],
  7: [V('knee-slap', 'Doubled-over knee slap', laughKneeSlap), V('belly', 'Belly laugh + tear wipe', laughBelly), V('stagger', 'Point and stagger back', laughStagger),
    V('side-hop', 'Clutching sides hop', laughHop), V('thigh-spin', 'Thigh slap spin', laughThighSpin), V('lean', 'Lean on your partner', laughLean)],
};
export const BODY_VARIANT_COUNT = 6;
/** The townsperson's answer to your variant v: a different move of the same emote (windmill ↔ shy wave, jump ↔ search, ...). */
export const BODY_ANSWER: readonly number[] = [3, 4, 5, 0, 1, 2];
/** Amplitude-scaled channels for an answer (travel, bends, legs); arms and spins stay whole. */
const AMP_IDX = [BC.px, BC.pz, BC.hop, BC.crouch, BC.pitch, BC.twist, BC.side, BC.roll, BC.lhx, BC.lhz, BC.lkn, BC.rhx, BC.rhz, BC.rkn] as const;

/** The pose of `kind` variant `v` at `age` s of a `dur` s emote, into `out` (BODY_CH numbers). amp < 1 for a townsperson's answer. */
export function sampleBodyPose(kind: number, v: number, age: number, dur: number, amp: number, out: O): O {
  restPose(out);
  const list = BODY_VARIANTS[kind]; if (!list) return out;
  const d = list[((v % list.length) + list.length) % list.length];
  d.pose(age * 4 / Math.max(.5, dur), out);
  if (amp !== 1) for (const i of AMP_IDX) out[i] *= amp;
  return out;
}

// ------------------------------------------------------------------------------------------------------------------- bags + picks
/** Shuffled bag: all six are used before any repeats, and a new bag never starts with the last one. In place, no allocation. */
export interface BodyBag { order: Uint8Array; pos: number; last: number }
export function createBodyBag(): BodyBag { const order = new Uint8Array(BODY_VARIANT_COUNT); for (let i = 0; i < order.length; i++) order[i] = i; return {order, pos: order.length, last: -1}; }
export function nextBodyVariant(rand: () => number, bag: BodyBag): number {
  const o = bag.order, n = o.length;
  if (bag.pos >= n) {
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)) % (i + 1); const t = o[i]; o[i] = o[j]; o[j] = t; }
    if (o[0] === bag.last) { const j = 1 + Math.min(n - 2, Math.floor(rand() * (n - 1))); const t = o[0]; o[0] = o[j]; o[j] = t; }
    bag.pos = 0;
  }
  const v = o[bag.pos++]; bag.last = v; return v;
}
/** Who is playing: you (the local player), a friend (their own bag: the wire only carries the emote), a townsperson (answers yours). */
export const BODY_ROLE = {Self: 0, Friend: 1, Npc: 2} as const;
const bags: Record<number, BodyBag[]> = {0: [createBodyBag(), createBodyBag(), createBodyBag()], 1: [createBodyBag(), createBodyBag(), createBodyBag()], 7: [createBodyBag(), createBodyBag(), createBodyBag()]};
const localPick: Record<number, number> = {0: -1, 1: -1, 7: -1};
/** A new emote starts on an actor: its variant. Your pick is remembered so the townsperson answers it. */
export function pickBodyVariant(kind: number, role: number, rand: () => number = Math.random): number {
  if (!isBodyEmote(kind)) return 0;
  if (role === BODY_ROLE.Npc) return localPick[kind] >= 0 ? BODY_ANSWER[localPick[kind]] : nextBodyVariant(rand, bags[kind][2]);
  const v = nextBodyVariant(rand, bags[kind][role === BODY_ROLE.Self ? 0 : 1]);
  if (role === BODY_ROLE.Self) localPick[kind] = v;
  return v;
}
/** The townsperson's answer to your current pick (-1 when you have not played this emote yet). */
export const npcAnswerFor = (kind: number): number => isBodyEmote(kind) && localPick[kind] >= 0 ? BODY_ANSWER[localPick[kind]] : -1;
