// Show off (user, Oct 22 2026: "replace the space one with something else ... more dynamic and fun"). The wheel's old "Space" (wire value
// 4, unchanged) is now "Show off": ten flashy football-skill mimes performed ON THE SPOT, no ball needed, each ending in a pose, from a
// shuffled bag (never the same twice in a row). A townsperson watching reacts with one of four whole-body reactions (gasp, cheer-clap,
// a wobbly copy of a simpler move, a "not worthy" bow), from its own bag.
// Same pose channels, helpers and writer as the dances (lib/town/emoteDance.ts, lib/graphics/dancePose.ts). Pure, no allocation per frame.
import {A, GX, GZ, HOP, HX, HY, HZ, PP, PR, PY, SPIN, TX, TY, TZ, arm, armP, band, bump, hop, leg, sink, win, type BodyMove} from './emoteDance';

const TAU = Math.PI * 2;
/** Jogging on the spot for `from`..`to` (knees up, arms pumping). */
function jog(t: number, o: Float32Array, from: number, to: number, rate = 3) {
  const on = band(t, from, from + .1, to - .1, to); if (on <= 0) return;
  const ph = (t * rate) % 2, s = ph < 1 ? 1 : -1, up = Math.sin(Math.PI * (ph % 1));
  leg(o, s, -.9 * up, .03, 1.3 * up + .1, .3, on); leg(o, -s, .1, .03, .15, .1, on);
  arm(o, s, .5 * up, .25, -1.5, on); arm(o, -s, -.8 * up, .25, -1.5, on); o[TX] += .15 * on; o[HOP] += .04 * up * on;
}
/** Arms crossed, chin up: the "too easy" finish. */
function crossed(o: Float32Array, w: number) { arm(o, -1, -1.25, -.45, -1.95, w); arm(o, 1, -1.2, -.6, -2.05, w); o[TX] -= .18 * w; o[HX] -= .2 * w; }

const rainbow: BodyMove = {id: 'rainbow-flick', name: 'Rainbow flick', seconds: 4, pose(t, o) {
  jog(t, o, 0, .6);
  // the flick: hop off the left foot, the right heel flies up behind and over, arms out for balance
  const fl = band(t, .55, .8, 1.05, 1.3); o[HOP] += hop(t, .7, 1.2, .25);
  leg(o, -1, .1, .03, .35, .2, fl); leg(o, 1, .55, .05, 2.1, .6, fl); o[TX] += .3 * fl; arm(o, -1, -.3, 1.25, -.3, fl); arm(o, 1, -.2, 1.15, -.3, fl);
  // watch the ball sail over the head, then point up at it
  const look = band(t, 1.0, 1.25, 2.1, 2.3); o[HX] -= .6 * look; o[HY] = .3 * Math.sin(TAU * .6 * (t - 1)) * look; arm(o, 1, -2.7, .15, -.02, look); o[TX] -= .2 * look;
  // then the celebration: two fist pumps with a knee lift, and a V pose
  const pump = band(t, 2.2, 2.35, 3.0, 3.15), pk = Math.abs(Math.sin(TAU * 1.5 * (t - 2.2)));
  arm(o, 1, -.6 - 1.6 * pk, .3, -1.9 + 1.0 * pk, pump); arm(o, -1, -.3, .5, -1.6, pump); leg(o, -1, -1.0 * pk, .03, 1.5 * pk, .3, pump); o[HOP] += .06 * pk * pump;
  const f = win(t, 3.1, 3.35); armP(o, -1, A.vee, f); armP(o, 1, A.vee, f); o[HX] -= .3 * f; o[TX] -= .15 * f;
}};
const stepOvers: BodyMove = {id: 'step-overs', name: 'Step-overs', seconds: 4, pose(t, o) {
  const on = band(t, .05, .25, 2.35, 2.5), per = .5, i = Math.floor((t - .1) / per), u = ((t - .1) % per) / per, s = i % 2 ? 1 : -1;
  // each leg circles over the imaginary ball, inside to outside, and plants wide; the body dips the same way
  const c = Math.sin(Math.PI * u);
  leg(o, s, -.55 * c - .05, -.25 + .7 * u, .3 + .9 * c, .2, on); leg(o, -s, .05, .1, .45, 0, on);
  o[GX] = .14 * s * Math.sin(Math.PI * Math.min(1, u * 1.4)) * on; o[PR] = .14 * s * c * on; o[TZ] = -.22 * s * c * on; o[TX] += .3 * on;
  arm(o, -s, -.2, 1.35, -.3, on); arm(o, s, .2, .55, -.4, on); o[HX] = .45 * on; o[HY] = -.2 * s * on; sink(o, .25 * on);
  // explode away: a lunge forward, arms driving
  const go = band(t, 2.4, 2.55, 2.85, 3.1); o[GZ] = .35 * go; leg(o, -1, -.9, .03, .7, .2, go); leg(o, 1, .45, .03, .5, .4, go); o[TX] += .35 * go; arm(o, -1, .6, .2, -1.4, go); arm(o, 1, -1.0, .2, -1.4, go);
  // finish: point at the camera, hand on the hip, head tilted
  const f = win(t, 3.0, 3.25); arm(o, 1, -1.55, .05, -.02, f); armP(o, -1, A.hip, f); o[HZ] += .25 * f; o[HX] -= .1 * f; leg(o, 1, -.2, .12, .35, .2, f);
}};
const heelFlick: BodyMove = {id: 'heel-flick', name: 'Back-heel and heel click', seconds: 4, pose(t, o) {
  jog(t, o, 0, .55, 3.4);
  // a sharp back-heel behind the standing leg, looking back over the shoulder
  const bh = band(t, .5, .65, .95, 1.15); leg(o, 1, .85, -.25, 1.2, -.3, bh); leg(o, -1, -.05, .03, .3, .1, bh);
  o[TX] += .25 * bh; o[HY] -= .9 * bh; o[TY] -= .45 * bh; arm(o, -1, -.6, 1.0, -.4, bh); arm(o, 1, .4, .8, -.3, bh); o[HOP] += hop(t, .6, .9, .1);
  // "shh": finger to the lips, a cocky lean back and sway
  const sh = band(t, 1.15, 1.35, 2.35, 2.55); arm(o, 1, -1.0, -.4, -2.55, sh); armP(o, -1, A.hip, sh); o[TX] -= .2 * sh; o[PR] = .12 * Math.sin(TAU * 1.2 * t) * sh; o[HZ] += .15 * sh;
  // a heel click in the air, twice
  const hc = band(t, 2.5, 2.6, 3.4, 3.5), ck = bump(t, 2.55, 2.95) + bump(t, 3.0, 3.4); o[HOP] += hop(t, 2.55, 2.95, .32) + hop(t, 3.0, 3.4, .32);
  leg(o, 1, -.1, .5 * ck, .5 * ck, .4, hc); leg(o, -1, -.1, -.1 * ck, .5 * ck, .4, hc); o[TZ] -= .2 * ck * hc; arm(o, -1, -.6, 1.2, -.3, hc); arm(o, 1, -.6, 1.2, -.3, hc);
  const f = win(t, 3.45, 3.65); armP(o, -1, A.out, f); armP(o, 1, A.out, f); sink(o, .3 * f); o[HX] -= .2 * f;
}};
const aroundWorld: BodyMove = {id: 'around-the-world', name: 'Around the world', seconds: 4, pose(t, o) {
  // two keep-up taps to set it up, then the foot circles round the ball twice (the second one faster), hopping on the standing leg
  const tap = band(t, .05, .15, .55, .65), tk = Math.abs(Math.sin(TAU * 1.6 * t)); leg(o, 1, -.7 * tk, .05, .5, -.2, tap); o[HX] = .35 * tap; o[HOP] += .05 * tk * tap;
  const c = band(t, .6, .7, 2.5, 2.65), th = t < 1.6 ? TAU * (t - .65) / .95 : TAU * (1 + (t - 1.6) / .85);
  leg(o, 1, -.45 - .35 * Math.cos(th), .3 + .38 * Math.sin(th), .45 + .3 * Math.sin(th), .2, c); leg(o, -1, .05, .05, .35, .1, c);
  o[HOP] += .1 * Math.abs(Math.sin(th)) * c; o[TZ] = .18 * Math.sin(th) * c; o[TX] += (.2 + .1 * Math.cos(th)) * c;
  arm(o, -1, -.3 + .3 * Math.sin(th), 1.3, -.4, c); arm(o, 1, -.3 - .3 * Math.sin(th), 1.1, -.4, c); o[HX] += .45 * c; o[HY] = -.35 * Math.sin(th) * c;
  // trap it on the thigh, then arms up
  const tr = band(t, 2.55, 2.7, 3.05, 3.2); leg(o, 1, -1.4, .05, 1.6, .2, tr); o[TX] += .3 * tr; o[HX] += .5 * tr; arm(o, -1, -.2, .9, -.3, tr); arm(o, 1, -.2, .9, -.3, tr);
  const f = win(t, 3.15, 3.35); armP(o, -1, A.vee, f); armP(o, 1, A.vee, f); o[HOP] += hop(t, 3.2, 3.55, .18); o[HX] -= .4 * f;
}};
const kneeSlide: BodyMove = {id: 'knee-slide', name: 'Knee slide', seconds: 4, pose(t, o) {
  jog(t, o, 0, .95, 4);
  // drop to the knees and slide forward (well inside the frame), arms flung wide, head back
  const kn = band(t, .85, 1.05, 2.75, 3.0); o[GZ] = .62 * win(t, .9, 1.9) * (1 - win(t, 2.9, 3.8));
  leg(o, -1, -.05, .12, 1.7, .9, kn); leg(o, 1, -.05, .12, 1.7, .9, kn); o[TX] -= .45 * kn; o[HX] -= .45 * kn;
  const roar = Math.abs(Math.sin(TAU * 1.4 * (t - 1.9))) * band(t, 1.85, 2.0, 2.6, 2.75);
  arm(o, -1, -2.2 + .9 * roar, 1.2, -.2 - 1.4 * roar, kn); arm(o, 1, -2.2 + .9 * roar, 1.2, -.2 - 1.4 * roar, kn);
  // get up (one foot forward first), walk back to the spot, arms crossed
  const up = band(t, 2.7, 2.85, 3.0, 3.15); leg(o, 1, -1.2, .05, 1.4, .2, up);
  const back = band(t, 3.0, 3.1, 3.6, 3.75), st = Math.sin(TAU * 2.2 * t); leg(o, st > 0 ? 1 : -1, -.4, .03, .6, .2, Math.abs(st) * back);
  crossed(o, win(t, 3.4, 3.65));
}};
const siu: BodyMove = {id: 'spin-and-pose', name: 'Jump spin and pose', seconds: 4, pose(t, o) {
  jog(t, o, 0, .55, 3.6);
  // a jump with a half turn in the air, landing wide with the arms swung down and out, chest up
  const j = band(t, .5, .62, 1.05, 1.15); o[HOP] += hop(t, .55, 1.15, .45); o[SPIN] = Math.PI * win(t, .6, 1.08);
  leg(o, -1, -.6, .1, 1.3, .6, j); leg(o, 1, -.6, .1, 1.3, .6, j); armP(o, -1, A.up, j); armP(o, 1, A.up, j);
  const land = band(t, 1.1, 1.2, 2.3, 2.45), roar = .03 * Math.sin(TAU * 9 * t);
  leg(o, -1, .05, .38, .55, .1, land); leg(o, 1, .05, .38, .55, .1, land); arm(o, -1, .35, .75 + roar, -.05, land); arm(o, 1, .35, .75 - roar, -.05, land); o[TX] -= .3 * land; o[HX] -= .35 * land;
  // a pirouette back round (knee up, arms tucked), then both fingers to the sky
  o[SPIN] += Math.PI * win(t, 2.4, 3.1); const pir = band(t, 2.35, 2.5, 3.0, 3.15);
  leg(o, 1, -.7, .3, 1.5, .7, pir); leg(o, -1, 0, 0, .1, .7, pir); armP(o, -1, A.chest, pir); armP(o, 1, A.chest, pir); o[HOP] += .04 * pir;
  const f = win(t, 3.1, 3.35), al = Math.sin(TAU * 1.5 * t); arm(o, -1, -2.7 - .15 * al, .35, -.05, f); arm(o, 1, -2.7 + .15 * al, .35, -.05, f); o[HX] -= .45 * f; o[TX] -= .1 * f;
}};
const backflip: BodyMove = {id: 'backflip', name: 'Backflip', seconds: 4, pose(t, o) {
  // load (crouch, arms back), take off, a tucked flip about the hips, land soft
  const load = band(t, .05, .4, .5, .6); sink(o, .9 * load); arm(o, -1, .95, .25, -.1, load); arm(o, 1, .95, .25, -.1, load); o[TX] += .3 * load;
  const air = band(t, .55, .7, 1.25, 1.4); o[HOP] = hop(t, .6, 1.4, 1.0); o[PP] = -TAU * win(t, .66, 1.32);
  leg(o, -1, -1.6, .08, 2.1, .4, air); leg(o, 1, -1.6, .08, 2.1, .4, air); arm(o, -1, -1.2, .25, -1.0, air); arm(o, 1, -1.2, .25, -1.0, air);
  const land = band(t, 1.32, 1.45, 1.55, 1.8); sink(o, .7 * land); arm(o, -1, -1.3, .5, -.2, land); arm(o, 1, -1.3, .5, -.2, land);
  // ta-da, then a double biceps flex with a bounce
  const tada = band(t, 1.7, 1.9, 2.3, 2.45); armP(o, -1, A.vee, tada); armP(o, 1, A.vee, tada); o[HX] -= .3 * tada;
  const fl = win(t, 2.35, 2.6), b = Math.abs(Math.sin(TAU * 1.5 * t)); arm(o, -1, -.2, 1.45, -2.0 - .4 * b, fl); arm(o, 1, -.2, 1.45, -2.0 - .4 * b, fl);
  sink(o, .2 * b * fl); o[TY] = .25 * Math.sin(TAU * .75 * t) * fl; o[HY] = .3 * Math.sin(TAU * .75 * t) * fl;
}};
const keepUps: BodyMove = {id: 'keep-up-mime', name: 'Toe-tap keep-ups', seconds: 4, pose(t, o) {
  // six quick toe taps, alternating feet, the head following the imaginary ball up and down
  const on = band(t, .05, .15, 2.35, 2.5), per = .4, i = Math.floor(t / per), u = (t % per) / per, s = i % 2 ? 1 : -1, tk = Math.sin(Math.PI * u);
  leg(o, s, -.75 * tk, .06, .35 + .2 * (1 - tk), -.25 * tk, on); leg(o, -s, .05, .05, .3, .1, on); o[HOP] += .09 * tk * on;
  o[HX] = (.45 - .35 * Math.sin(Math.PI * u)) * on; o[TZ] = .16 * s * tk * on; o[TY] = .12 * s * on; arm(o, -1, -.5 + .35 * s * tk, 1.3, -.9, on); arm(o, 1, -.5 - .35 * s * tk, 1.3, -.9, on); o[TX] += .12 * on;
  // a big flick up, then it lands on the head: balance it, arms wide, little wobbles
  const fl = band(t, 2.4, 2.5, 2.7, 2.85); leg(o, 1, -1.4, .05, .4, -.3, fl); o[HX] -= .5 * fl;
  const bal = band(t, 2.8, 2.95, 3.85, 3.95), wb = Math.sin(TAU * 1.3 * t);
  o[HX] -= .55 * bal; o[TX] -= .12 * bal; sink(o, .3 * bal); arm(o, -1, -.15, 1.35 + .2 * wb, -.15, bal); arm(o, 1, -.15, 1.35 - .2 * wb, -.15, bal); o[GX] = .06 * wb * bal; o[TZ] += .12 * wb * bal;
}};
const scorpion: BodyMove = {id: 'scorpion', name: 'Scorpion kick', seconds: 4, pose(t, o) {
  jog(t, o, 0, .6, 3.4);
  // dive forward with the hands reaching down, the heels whip up behind and over the head
  const sc = band(t, .55, .85, 1.75, 2.05); o[GZ] = .3 * sc; o[TX] += 1.05 * sc; o[HX] -= .55 * sc;
  arm(o, -1, -1.7, .45, -.1, sc); arm(o, 1, -1.7, .45, -.1, sc); leg(o, -1, -.35, .05, .55, .3, sc);
  const whip = bump(t, .8, 1.9); leg(o, 1, .55 + 1.0 * whip, .05, 1.2 + 1.0 * whip, .8, sc);
  // back up, then the airplane: arms out, banking side to side, then the final bank held
  const ap = band(t, 2.0, 2.2, 3.85, 3.95), bank = Math.sin(TAU * .9 * (t - 2.0));
  arm(o, -1, -.15, 1.5, -.05, ap); arm(o, 1, -.15, 1.5, -.05, ap); o[TZ] = .35 * bank * ap; o[PR] = .1 * bank * ap; o[TX] += .25 * ap; o[PY] = .3 * bank * ap;
  const st = Math.sin(TAU * 2 * t); leg(o, st > 0 ? 1 : -1, -.6, .03, .9, .2, Math.abs(st) * band(t, 2.0, 2.2, 3.3, 3.5)); o[HZ] = -.2 * bank * ap;
}};
const cruyff: BodyMove = {id: 'cruyff-turn', name: 'Cruyff turn', seconds: 4, pose(t, o) {
  jog(t, o, 0, .4, 3);
  // the fake shot: big wind-up, arms wide ... then the foot drags behind the standing leg and the body turns away
  const wind = band(t, .35, .6, .85, 1.0); leg(o, 1, .9, .05, 1.2, .5, wind); arm(o, -1, -1.2, .9, -.2, wind); arm(o, 1, .6, .5, -.2, wind); o[TY] = -.45 * wind; o[TX] += .1 * wind;
  const drag = band(t, .85, 1.0, 1.35, 1.5); leg(o, 1, .1, -.4, .5, .3, drag); sink(o, .35 * drag); o[HX] = .4 * drag;
  o[SPIN] = Math.PI * win(t, .9, 1.45) + Math.PI * win(t, 2.05, 2.6);
  // burst away, then the second turn back with the other foot, sole roll, and the cool finish
  const br = band(t, 1.4, 1.5, 1.9, 2.0); arm(o, -1, .5, .2, -1.4, br); arm(o, 1, -.9, .2, -1.4, br); o[TX] += .3 * br; leg(o, -1, -.8, .03, 1.0, .3, br);
  const d2 = band(t, 2.0, 2.1, 2.5, 2.65); leg(o, -1, .1, -.4, .5, .3, d2); sink(o, .35 * d2);
  const sole = band(t, 2.6, 2.75, 3.05, 3.2); leg(o, 1, -.35 + .15 * Math.sin(TAU * 3 * t), .05, .3, -.4, sole); o[HX] += .4 * sole;
  crossed(o, win(t, 3.2, 3.45)); o[HY] = .2 * win(t, 3.3, 3.6);
}};
export const SHOW_OFFS: readonly BodyMove[] = [rainbow, stepOvers, heelFlick, aroundWorld, kneeSlide, siu, backflip, keepUps, scorpion, cruyff];
export const SHOW_OFF_COUNT = SHOW_OFFS.length;

// ---- a townsperson watching: four reactions
const gasp: BodyMove = {id: 'gasp', name: 'Gasp', seconds: 4, pose(t, o) {
  const on = band(t, .1, .35, 3.6, 3.9), sh = Math.sin(TAU * 1.6 * t);
  arm(o, -1, -2.55, .95, -2.35, on); arm(o, 1, -2.55, .95, -2.35, on); o[TX] -= .3 * on; o[HX] -= .25 * on; o[HY] = .35 * sh * band(t, .9, 1.1, 2.4, 2.6);
  o[GZ] = -.18 * on; leg(o, 1, .5, .05, .7, .3, band(t, .1, .3, .6, .8)); sink(o, .3 * band(t, .5, .7, 2.5, 2.8)); o[HOP] = hop(t, .15, .45, .12) + hop(t, 2.7, 3.0, .1) + hop(t, 3.05, 3.35, .1);
}};
const cheerClap: BodyMove = {id: 'cheer-clap', name: 'Cheer and clap', seconds: 4, pose(t, o) {
  const on = band(t, .05, .25, 3.7, 3.95), c = Math.abs(Math.sin(TAU * 1.4 * t));
  const j = Math.abs(Math.sin(TAU * .7 * t)); arm(o, -1, -2.6, .1 + .45 * c, -.5, on); arm(o, 1, -2.6, .1 + .45 * c, -.5, on); o[HOP] = .16 * j * on;
  leg(o, -1, -.6 * j, .1, .9 * j, .4, on); leg(o, 1, -.6 * j, .1, .9 * j, .4, on); o[HX] -= .3 * on; o[TX] -= .15 * on; o[TZ] = .2 * Math.sin(TAU * .7 * t) * on; o[HY] = .2 * Math.sin(TAU * .7 * t) * on;
}};
const copyCat: BodyMove = {id: 'copy-step-over', name: 'Wobbly copy', seconds: 4, pose(t, o) {
  // two slow step-overs, then a wobble (arms windmilling) and a shrug
  const on = band(t, .05, .3, 2.0, 2.2), u = (t % 1), s = Math.floor(t) % 2 ? 1 : -1, c = Math.sin(Math.PI * u);
  leg(o, s, -.35 * c, -.15 + .45 * u, .25 + .5 * c, .2, on); o[PR] = .1 * s * c * on; o[HX] = .4 * on; arm(o, -1, -.1, .9, -.4, on); arm(o, 1, -.1, .9, -.4, on);
  const wob = band(t, 1.95, 2.1, 2.8, 2.95), wm = TAU * 2.2 * t;
  arm(o, -1, -1.4 + 1.3 * Math.sin(wm), 1.0, -.2, wob); arm(o, 1, -1.4 - 1.3 * Math.sin(wm), 1.0, -.2, wob); o[TZ] = .3 * Math.sin(TAU * 1.3 * t) * wob; leg(o, 1, -.5, .3, .5, .2, wob); o[GX] = .12 * Math.sin(TAU * 1.3 * t) * wob;
  const shrug = band(t, 2.9, 3.1, 3.75, 3.95); arm(o, -1, -.35, .55, -1.7, shrug); arm(o, 1, -.35, .55, -1.7, shrug); o[HZ] = .25 * shrug; o[TZ] -= .08 * shrug; o[HOP] += .03 * shrug;
}};
const notWorthy: BodyMove = {id: 'not-worthy', name: 'Not-worthy bows', seconds: 4, pose(t, o) {
  // drop to both knees and bow down, arms up and down: "we are not worthy!"
  const on = band(t, .1, .3, 3.6, 3.85), kn = band(t, .15, .5, 3.2, 3.6), b = .5 - .5 * Math.cos(TAU * 1.1 * (t - .5)) * win(t, .5, .7);
  leg(o, -1, -.05, .1, 1.7, .9, kn); leg(o, 1, -.05, .1, 1.7, .9, kn); o[TX] += (.95 * b - .1) * kn; o[HX] += .25 * b * on;
  arm(o, -1, -2.8 + 1.3 * b, .4, -.1, on); arm(o, 1, -2.8 + 1.3 * b, .4, -.1, on); o[HOP] = hop(t, 3.3, 3.6, .08);
}};
export const SHOW_OFF_REACTIONS: readonly BodyMove[] = [gasp, cheerClap, copyCat, notWorthy];
export const REACTION_COUNT = SHOW_OFF_REACTIONS.length;
