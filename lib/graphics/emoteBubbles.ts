// Pooled emote bubbles (user, Oct 22 2026): two sprites (you, the answering townsperson) and one spark ring, made once.
// Nothing is allocated per frame, and update() does almost nothing while nothing is showing (no extra draw calls when idle).
import * as T from 'three';
import {EMOTE_EMOJI} from '../town/emoteReact';

const textures = new Map<number, T.CanvasTexture>();
function iconTexture(e: number) {
  let t = textures.get(e);
  if (!t) {
    const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d');
    if (g) { g.fillStyle = 'rgba(255,255,255,.92)'; g.beginPath(); g.arc(48, 48, 44, 0, Math.PI * 2); g.fill(); g.font = '52px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(EMOTE_EMOJI[e] ?? '', 48, 52); }
    t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; textures.set(e, t);
  }
  return t;
}
export interface EmoteBubbles {
  root: T.Group;
  show(slot: 0 | 1, emote: number, seconds: number): void;
  active(slot: 0 | 1): boolean;
  follow(slot: 0 | 1, x: number, y: number, z: number): void;
  spark(x: number, y: number, z: number): void;
  update(dt: number, reduced: boolean): void;
  dispose(): void;
}
export function createEmoteBubbles(scene: T.Scene): EmoteBubbles {
  const root = new T.Group(); root.name = 'emote-bubbles'; scene.add(root);
  const sprites = [0, 1].map(() => { const s = new T.Sprite(new T.SpriteMaterial({transparent: true, depthWrite: false})); s.scale.set(.6, .6, 1); s.visible = false; s.raycast = () => {}; root.add(s); return s; });
  const left = [0, 0];
  const ringMat = new T.MeshBasicMaterial({color: 0xffe08a, transparent: true, depthWrite: false, side: T.DoubleSide});
  const ring = new T.Mesh(new T.RingGeometry(.8, 1, 24), ringMat); ring.visible = false; ring.rotation.x = -Math.PI / 2; ring.raycast = () => {}; root.add(ring);
  let ringAge = -1;
  return {
    root,
    show(slot, emote, seconds) { const s = sprites[slot], m = s.material as T.SpriteMaterial; m.map = iconTexture(emote); m.needsUpdate = true; s.visible = true; left[slot] = seconds; },
    active: slot => left[slot] > 0,
    follow(slot, x, y, z) { sprites[slot].position.set(x, y, z); },
    spark(x, y, z) { ring.position.set(x, y, z); ringAge = 0; ring.visible = true; },
    update(dt, reduced) {
      for (let i = 0; i < 2; i++) if (left[i] > 0) { left[i] -= dt; if (left[i] <= 0) sprites[i].visible = false; }
      if (ringAge >= 0) {
        ringAge += dt;
        if (reduced || ringAge > .5) { ringAge = -1; ring.visible = false; }
        else { const k = ringAge / .5; ring.scale.setScalar(.15 + k * .55); ringMat.opacity = 1 - k; }
      }
    },
    dispose() { scene.remove(root); sprites.forEach(s => (s.material as T.Material).dispose()); ring.geometry.dispose(); ringMat.dispose(); },
  };
}
