// The moving-emote writer (user, Oct 22 2026: "do the walking emotes"). Call right after `rig.update` while the rig walks / runs: it layers the
// overlay of lib/town/moveEmotes.ts on top of the locomotion pose: arms eased toward the emote's arm pose (an arm left NaN keeps its walk
// swing), and ADDED offsets on the torso (lean, twist, side bend), the head and the pelvis (a small bounce on the walk bob, a hip twist /
// sway). No leg joint is written: the legs keep their own walk / run cycle. The rig re-sets every one of these joints each update
// (lib/graphics/player.ts), so the offsets never accumulate. One scratch pose, no allocation per frame. Never under reduced motion.
import type * as T from 'three';
import {BC, BODY_CH} from '../town/emoteBody';
import {sampleMovePose} from '../town/moveEmotes';

type J = T.Object3D;
interface Joints {ls: J; rs: J; le: J; re: J; pelvis: J | null; torso: J | null; head: J | null}
const cache = new WeakMap<J, Joints | null>();
const pose = new Float32Array(BODY_CH);
function joints(root: J): Joints | null {
  if (cache.has(root)) return cache.get(root)!;
  const n = (s: string) => root.getObjectByName(s) ?? null;
  const ls = n('left-shoulder'), rs = n('right-shoulder'), le = n('left-elbow'), re = n('right-elbow');
  const j = ls && rs && le && re ? {ls, rs, le, re, pelvis: n('player-pelvis'), torso: n('armor-torso'), head: n('player-head')} : null;
  cache.set(root, j); return j;
}
function arm(s: J, e: J, k: number, sx: number, sz: number, el: number) {
  if (sx !== sx) return; // NaN: the walk swing keeps this arm
  s.rotation.x += (sx - s.rotation.x) * k; s.rotation.y *= 1 - k; s.rotation.z += (sz - s.rotation.z) * k; e.rotation.x += (el - e.rotation.x) * k;
}

/** Layers moving emote `emote` (variant `v`) at `age` s onto `root` with weight `k` (0..1, moveWeight). Returns whether it wrote anything. */
export function applyMoveEmote(root: J, emote: number, v: number, age: number, k: number): boolean {
  if (k <= 0) return false;
  const j = joints(root); if (!j) return false;
  const o = sampleMovePose(emote, v, age, pose);
  arm(j.ls, j.le, k, o[BC.lsx], -o[BC.lsz], o[BC.lel]); arm(j.rs, j.re, k, o[BC.rsx], o[BC.rsz], o[BC.rel]);
  if (j.pelvis) { j.pelvis.position.y += o[BC.hop] * k; j.pelvis.rotation.y += o[BC.yaw] * k; j.pelvis.rotation.z += o[BC.roll] * k; }
  if (j.torso) { j.torso.rotation.x += o[BC.pitch] * k; j.torso.rotation.y += o[BC.twist] * k; j.torso.rotation.z += o[BC.side] * k; }
  if (j.head) { j.head.rotation.x += o[BC.hx] * k; j.head.rotation.y += o[BC.hy] * k; j.head.rotation.z += o[BC.hz] * k; }
  return true;
}
