// The whole-body Wave / Cheer / Laugh writer (user, Oct 22 2026). Call right after `rig.update` (through applyEmoteArms in emotePose.ts):
// it eases the rig from its own pose into the variant's pose (lib/town/emoteBody.ts) on the pelvis (in-place travel, hop, crouch, spin,
// hip roll), the torso, the head, both arms and both legs (crouch solved with planted feet). Each rig remembers its own variant; a new
// emote (another kind, or the clock restarting) draws the next one from its role's shuffled bag. One scratch pose, no per-frame allocation.
import type * as T from 'three';
import {BC, BODY_CH, BODY_NPC_AMP, BODY_ROLE, isBodyEmote, legBend, npcAnswerFor, pickBodyVariant, sampleBodyPose} from '../town/emoteBody';

type J = T.Object3D;
interface Joints {ls: J; rs: J; le: J; re: J; pelvis: J | null; torso: J | null; head: J | null; lh: J | null; rh: J | null; lk: J | null; rk: J | null; la: J | null; ra: J | null}
interface State {kind: number; age: number; v: number; role: number}
const cache = new WeakMap<J, Joints | null>(), states = new WeakMap<J, State>();
const pose = new Float32Array(BODY_CH);
function joints(root: J): Joints | null {
  if (cache.has(root)) return cache.get(root)!;
  const n = (s: string) => root.getObjectByName(s) ?? null;
  const ls = n('left-shoulder'), rs = n('right-shoulder'), le = n('left-elbow'), re = n('right-elbow');
  const j = ls && rs && le && re ? {ls, rs, le, re, pelvis: n('player-pelvis'), torso: n('armor-torso'), head: n('player-head'),
    lh: n('left-hip'), rh: n('right-hip'), lk: n('left-knee'), rk: n('right-knee'), la: n('left-ankle'), ra: n('right-ankle')} : null;
  cache.set(root, j); return j;
}
/** You ('you' rig), a townsperson (root.userData.npcId) or anyone else (a friend: their own bag). */
function roleOf(root: J): number {
  if (root.userData?.npcId != null) return BODY_ROLE.Npc;
  const jersey = root.getObjectByName('player-jersey');
  return jersey?.userData?.playerId === 'you' ? BODY_ROLE.Self : BODY_ROLE.Friend;
}
const ramp = (age: number, dur: number) => Math.max(0, Math.min(1, age / .3, (dur - age) / .3));
function arm(s: J, e: J, k: number, sx: number, sz: number, el: number) {
  s.rotation.x += (sx - s.rotation.x) * k; s.rotation.y *= 1 - k; s.rotation.z += (sz - s.rotation.z) * k; e.rotation.x += (el - e.rotation.x) * k;
}
function leg(h: J | null, kn: J | null, an: J | null, k: number, side: number, th: number, hx: number, hz: number, knee: number) {
  if (!h || !kn) return;
  const hip = -th + hx, kb = 2 * th + knee;
  h.rotation.x += (hip - h.rotation.x) * k; h.rotation.y *= 1 - k; h.rotation.z += (side * hz - h.rotation.z) * k; kn.rotation.x += (kb - kn.rotation.x) * k;
  if (an) an.rotation.x += (-hip - kb - an.rotation.x) * k;
}
const toward = (o: {x: number; y: number; z: number}, x: number, y: number, z: number, k: number) => { o.x += (x - o.x) * k; o.y += (y - o.y) * k; o.z += (z - o.z) * k; };

/** Poses `root` for a Wave / Cheer / Laugh at `age` of `dur` seconds. Returns false for any other emote (nothing written). */
export function applyBodyEmote(root: J, kind: number, age: number, dur: number, force = -1): boolean {
  if (!isBodyEmote(kind)) return false;
  const j = joints(root); if (!j) return true;
  let s = states.get(root);
  if (!s) { s = {kind: -1, age: 0, v: 0, role: roleOf(root)}; states.set(root, s); }
  if (force >= 0) { s.kind = kind; s.v = force; } // contact sheets / tests: a fixed variant
  else if (s.kind !== kind || age < s.age - .25) { s.kind = kind; s.v = pickBodyVariant(kind, s.role); }
  else if (s.role === BODY_ROLE.Npc && age < .25) { const a = npcAnswerFor(kind); if (a >= 0) s.v = a; } // your pick may land a frame after theirs
  s.age = age;
  const k = ramp(age, dur); if (k <= 0) return true;
  const o = sampleBodyPose(kind, s.v, age, dur, s.role === BODY_ROLE.Npc ? BODY_NPC_AMP : 1, pose);
  arm(j.ls, j.le, k, o[BC.lsx], -o[BC.lsz], o[BC.lel]); arm(j.rs, j.re, k, o[BC.rsx], o[BC.rsz], o[BC.rel]);
  if (j.pelvis) {
    const p = j.pelvis;
    const yaw = Math.atan2(Math.sin(o[BC.yaw]), Math.cos(o[BC.yaw])); // a finished spin is 0, never a half turn back while easing out
    p.position.x += (o[BC.px] - p.position.x) * k; p.position.z += (o[BC.pz] - p.position.z) * k; p.position.y += (o[BC.hop] - o[BC.crouch]) * k;
    p.rotation.x *= 1 - k; p.rotation.y += (yaw - p.rotation.y) * k; p.rotation.z += (o[BC.roll] - p.rotation.z) * k;
  }
  if (j.torso) toward(j.torso.rotation, o[BC.pitch], o[BC.twist], o[BC.side], k);
  if (j.head) toward(j.head.rotation, o[BC.hx], o[BC.hy], o[BC.hz], k);
  const th = legBend(o[BC.crouch]);
  leg(j.lh, j.lk, j.la, k, -1, th, o[BC.lhx], o[BC.lhz], o[BC.lkn]);
  leg(j.rh, j.rk, j.ra, k, 1, th, o[BC.rhx], o[BC.rhz], o[BC.rkn]);
  return true;
}
