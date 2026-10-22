// Pooled emote emoji (user, Oct 22 2026: "the emoji icons above it should animate and dissipate into the air. remove the round background").
// The emoji is drawn ALONE (a soft shadow only, no disc). Each of the two slots (you, the answering townsperson) owns BUBBLE_COPIES billboard
// sprites: a copy pops in, floats up with a sway and dissipates (lib/town/emoteBubbleMotion.ts); a 4 s emote emits a new copy every ~0.8 s.
// One more sprite carries a short TEXT line (the busy field players' refusals) and keeps its rounded background. Everything is made once:
// nothing is allocated per frame and update() does almost nothing while nothing is showing.
import * as T from 'three';
import {EMOTE_EMOJI} from '../town/emoteReact';
import {BUBBLE_COPIES, BUBBLE_LIFE, bubbleFrame, copyStart, type BubbleFrame} from '../town/emoteBubbleMotion';

const textures = new Map<number, T.CanvasTexture>();
function iconTexture(e: number) {
  let t = textures.get(e);
  if (!t) {
    const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d');
    if (g) {
      g.font = '58px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = 'rgba(40,30,10,.4)'; g.shadowBlur = 7; g.shadowOffsetY = 2; // legibility on bright ground, no disc
      g.fillText(EMOTE_EMOJI[e] ?? '', 48, 52);
    }
    t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; textures.set(e, t);
  }
  return t;
}
export interface EmoteBubbles {
  root: T.Group;
  show(slot: 0 | 1, emote: number, seconds: number): void;
  active(slot: 0 | 1): boolean;
  follow(slot: 0 | 1, x: number, y: number, z: number): void;
  /** A short speech line (keeps its rounded background) above a spot; `followText` moves it. */
  showText(text: string, seconds: number, x: number, y: number, z: number): void;
  followText(x: number, y: number, z: number): void;
  textActive(): boolean;
  spark(x: number, y: number, z: number): void;
  update(dt: number, reduced: boolean): void;
  dispose(): void;
}
const SIZE = .72;
export function createEmoteBubbles(scene: T.Scene): EmoteBubbles {
  const root = new T.Group(); root.name = 'emote-bubbles'; scene.add(root);
  const makeSprite = () => { const s = new T.Sprite(new T.SpriteMaterial({transparent: true, depthWrite: false})); s.visible = false; s.raycast = () => {}; s.renderOrder = 3; root.add(s); return s; };
  const slots = [0, 1].map(() => ({copies: Array.from({length: BUBBLE_COPIES}, makeSprite), age: 0, seconds: 0, on: false, x: 0, y: 0, z: 0, seed: 0}));
  const fr: BubbleFrame = {visible: false, dx: 0, dy: 0, scale: 1, opacity: 0};
  const hide = (i: 0 | 1) => { const sl = slots[i]; sl.on = false; for (const s of sl.copies) s.visible = false; };
  // the text line: one sprite over a canvas, redrawn only when a line is shown
  const tc = document.createElement('canvas'); tc.width = 512; tc.height = 96;
  const tTex = new T.CanvasTexture(tc); tTex.colorSpace = T.SRGBColorSpace;
  const tSprite = new T.Sprite(new T.SpriteMaterial({map: tTex, transparent: true, depthWrite: false})); tSprite.visible = false; tSprite.raycast = () => {}; tSprite.renderOrder = 4; root.add(tSprite);
  const text = {left: 0, total: 0};
  const ringMat = new T.MeshBasicMaterial({color: 0xffe08a, transparent: true, depthWrite: false, side: T.DoubleSide});
  const ring = new T.Mesh(new T.RingGeometry(.8, 1, 24), ringMat); ring.visible = false; ring.rotation.x = -Math.PI / 2; ring.raycast = () => {}; root.add(ring);
  let ringAge = -1;
  return {
    root,
    show(i, emote, seconds) {
      const sl = slots[i]; sl.age = 0; sl.seconds = Math.max(.6, seconds); sl.on = true; sl.seed = Math.random() * 6.28;
      for (const s of sl.copies) { const m = s.material as T.SpriteMaterial; m.map = iconTexture(emote); m.needsUpdate = true; s.visible = false; }
    },
    active: i => slots[i].on,
    follow(i, x, y, z) { const sl = slots[i]; sl.x = x; sl.y = y; sl.z = z; },
    showText(str, seconds, x, y, z) {
      const g = tc.getContext('2d');
      if (g) {
        g.clearRect(0, 0, 512, 96); g.font = 'bold 34px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        const w = Math.min(500, g.measureText(str).width + 44);
        g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); if (g.roundRect) g.roundRect(256 - w / 2, 10, w, 64, 28); else g.rect(256 - w / 2, 10, w, 64); g.fill();
        g.beginPath(); g.moveTo(244, 73); g.lineTo(256, 90); g.lineTo(268, 73); g.fill(); // the little tail
        g.fillStyle = '#3a2a12'; g.fillText(str, 256, 43); tTex.needsUpdate = true;
      }
      tSprite.scale.set(2.6, 2.6 * 96 / 512, 1); tSprite.position.set(x, y, z); tSprite.visible = true; text.left = text.total = Math.max(.8, seconds);
    },
    followText(x, y, z) { tSprite.position.set(x, y, z); },
    textActive: () => text.left > 0,
    spark(x, y, z) { ring.position.set(x, y, z); ringAge = 0; ring.visible = true; },
    update(dt, reduced) {
      for (let i = 0; i < 2; i++) {
        const sl = slots[i]; if (!sl.on) continue;
        sl.age += dt;
        let any = false;
        for (let c = 0; c < BUBBLE_COPIES; c++) {
          const s = sl.copies[c], start = reduced ? (c === 0 ? 0 : -1) : copyStart(c, sl.seconds);
          if (start < 0) { s.visible = false; continue; }
          bubbleFrame(sl.age - start, sl.seed + c * 2.1, reduced, fr, reduced ? sl.seconds : BUBBLE_LIFE);
          s.visible = fr.visible; if (!fr.visible) continue;
          any = true; s.position.set(sl.x + fr.dx, sl.y + fr.dy, sl.z); s.scale.setScalar(SIZE * fr.scale); (s.material as T.SpriteMaterial).opacity = fr.opacity;
        }
        if (!any && sl.age > sl.seconds) hide(i as 0 | 1);
      }
      if (text.left > 0) {
        text.left -= dt; const k = Math.min(1, text.left / .3, (text.total - text.left) / .12);
        (tSprite.material as T.SpriteMaterial).opacity = Math.max(0, k);
        if (text.left <= 0) tSprite.visible = false;
      }
      if (ringAge >= 0) {
        ringAge += dt;
        if (reduced || ringAge > .5) { ringAge = -1; ring.visible = false; }
        else { const k = ringAge / .5; ring.scale.setScalar(.15 + k * .55); ringMat.opacity = 1 - k; }
      }
    },
    dispose() {
      scene.remove(root); for (const sl of slots) for (const s of sl.copies) (s.material as T.Material).dispose();
      tSprite.material.dispose(); tTex.dispose(); ring.geometry.dispose(); ringMat.dispose();
    },
  };
}
