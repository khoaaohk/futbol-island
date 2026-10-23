// Ball knock-overs between party friends, the drawn side (curves + rules: lib/town/ballKnock.ts). Cosmetic only: the overlay goes on a
// rig ROOT right before it is drawn and is gone with the tumble; nobody's real position, facing or control changes.
// - friends: remoteAvatars applies applyTumbleRoot after the pose (and after any friend bump), so the batch draws it;
// - me: Town applies applyLocalTumble around renderer.render only and restores it right after (like applyLocalBump), so no gameplay
//   code ever reads a tumbled transform.
// Heat: module scratch only, no allocation per frame; knockdownLift (~70 point transforms) runs only while someone is down.
import * as T from 'three';
import { knockdownLift } from './knockdown';
import { createTumble, startTumble, stepTumble, tumblePose, type Tumble } from '../town/ballKnock';

const pose = { pitch: 0, roll: 0, fall: 0 };
/** Puts the tumble on a rig root (its yaw = facing, its y = the floor under it). True when it touched x / z rotation. */
export function applyTumbleRoot(root: T.Object3D, t: Tumble, floor: number): boolean {
  if (t.age < 0) return false;
  tumblePose(t, root.rotation.y, pose);
  root.rotation.order = 'YXZ'; root.rotation.x = pose.pitch; root.rotation.z += pose.roll;
  if (pose.fall > .02) root.position.y += knockdownLift(root, floor); // the round bean never sinks into the ground when flat
  return true;
}

/** Friends' tumbles by member id (a Map made once; entries made once per friend, on their first knock). */
export interface FriendTumbles { start(id: number, dir: number, reduced: boolean): boolean; step(dt: number): void; get(id: number): Tumble | null; readonly active: number; clear(): void }
export function createFriendTumbles(): FriendTumbles {
  const map = new Map<number, Tumble>(); let active = 0;
  return {
    get active() { return active; },
    start(id, dir, reduced) { let t = map.get(id); if (!t) { t = createTumble(); map.set(id, t); } if (!startTumble(t, dir, reduced)) return false; active++; return true; },
    step(dt) { if (active === 0) return; active = 0; map.forEach((t) => { if (t.age < 0) return; stepTumble(t, dt); if (t.age >= 0) active++; }); },
    get(id) { if (active === 0) return null; const t = map.get(id); return t && t.age >= 0 ? t : null; },
    clear() { map.clear(); active = 0; },
  };
}

// Local overlay save / restore (module scratch: no allocation).
const saved = { on: false, rx: 0, rz: 0, py: 0, order: 'XYZ' as T.EulerOrder };
/** Town, right before renderer.render: the local player's tumble on their root (floor = the ground under them). */
export function applyLocalTumble(t: Tumble, player: T.Object3D, floor: number): void {
  saved.on = false; if (t.age < 0) return;
  saved.on = true; saved.rx = player.rotation.x; saved.rz = player.rotation.z; saved.py = player.position.y; saved.order = player.rotation.order;
  tumblePose(t, player.rotation.y, pose);
  player.rotation.order = 'YXZ'; player.rotation.x += pose.pitch; player.rotation.z += pose.roll;
  if (pose.fall > .02) player.position.y += knockdownLift(player, floor);
}
export function restoreLocalTumble(player: T.Object3D): void {
  if (!saved.on) return; saved.on = false;
  player.rotation.order = saved.order; player.rotation.x = saved.rx; player.rotation.z = saved.rz; player.position.y = saved.py;
}

/** The knock-over word ("Oof!") over whoever went down, in the friend-bump bubble style (big enough to read from the phone's island
 *  camera): 2 sprites pooled and made on the FIRST knock only, textures cached per word (4 words), asleep when none is alive. */
export interface KnockWords { show(word: string, x: number, y: number, z: number, reduced: boolean): void; update(dt: number): void; readonly alive: number; dispose(): void }
const KW_W = 2.4, KW_S = 1.2;
export function createKnockWords(parent: T.Object3D): KnockWords {
  const tex = new Map<string, T.CanvasTexture>();
  let pool: { s: T.Sprite; age: number; life: number; y: number }[] | null = null, alive = 0, next = 0;
  const texture = (w: string) => {
    let t = tex.get(w); if (t) return t;
    const c = document.createElement('canvas'); c.width = 256; c.height = 96; const g = c.getContext('2d');
    if (g) {
      g.font = '900 46px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; const tw = Math.min(240, g.measureText(w).width + 40);
      g.fillStyle = 'rgba(255,255,255,.96)'; g.beginPath(); if (g.roundRect) g.roundRect(128 - tw / 2, 8, tw, 66, 30); else g.rect(128 - tw / 2, 8, tw, 66); g.fill();
      g.beginPath(); g.moveTo(116, 72); g.lineTo(128, 90); g.lineTo(140, 72); g.fill();
      g.lineWidth = 4; g.strokeStyle = '#ffc93c'; g.beginPath(); if (g.roundRect) g.roundRect(128 - tw / 2, 8, tw, 66, 30); else g.rect(128 - tw / 2, 8, tw, 66); g.stroke();
      g.fillStyle = '#e8562e'; g.fillText(w, 128, 43);
    }
    t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; tex.set(w, t); return t;
  };
  return {
    get alive() { return alive; },
    show(word, x, y, z, reduced) {
      if (!pool) { pool = []; for (let i = 0; i < 2; i++) { const s = new T.Sprite(new T.SpriteMaterial({ transparent: true, depthWrite: false })); s.visible = false; s.raycast = () => {}; s.renderOrder = 4; s.name = 'ball-knock-word'; parent.add(s); pool.push({ s, age: 0, life: 0, y: 0 }); } }
      const b = pool[next]; next = (next + 1) % pool.length;
      if (b.life <= 0) alive++;
      const m = b.s.material as T.SpriteMaterial, t = texture(word); if (m.map !== t) { m.map = t; m.needsUpdate = true; }
      b.age = 0; b.life = reduced ? .8 : KW_S; b.y = y; b.s.position.set(x, y, z); b.s.userData.text = word;
    },
    update(dt) {
      if (!pool || alive === 0) return;
      for (const b of pool) {
        if (b.life <= 0) continue;
        b.age += dt;
        if (b.age >= b.life) { b.life = 0; alive--; b.s.visible = false; continue; }
        const t = b.age / b.life, pop = b.age < .16 ? (b.age / .16) * 1.18 : b.age < .26 ? 1.18 - (b.age - .16) / .1 * .18 : 1;
        b.s.visible = true; b.s.position.y = b.y + .45 * t; b.s.scale.set(KW_W * pop, KW_W * pop * 96 / 256, 1); (b.s.material as T.SpriteMaterial).opacity = Math.min(1, (1 - t) / .3);
      }
    },
    dispose() { if (pool) for (const b of pool) { b.s.removeFromParent(); (b.s.material as T.Material).dispose(); } pool = null; alive = 0; for (const t of tex.values()) t.dispose(); tex.clear(); },
  };
}
