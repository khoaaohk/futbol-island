// Ambient NPC thought bubbles (Nov 1 2026), drawn like the emote speech line (lib/graphics/emoteBubbles.ts showText: white rounded card, little
// tail, warm brown bold text). A fixed pool of CHATTER.MAX sprites, each with its own canvas redrawn ONLY when a line is shown. Sprites never
// raycast, so they never block taps or the joystick. Reduced motion: the text stays, the pop (small overshoot) is dropped.
import * as T from 'three';
import {CHATTER} from '@/lib/town/npcChatter';

const W = 512, H = 128, POP = .22;
const easeOutBack = (t: number) => { const c1 = 1.70158, c3 = c1 + 1, u = t - 1; return 1 + c3 * u * u * u + c1 * u * u; };
function draw(g: CanvasRenderingContext2D, str: string) {
  g.clearRect(0, 0, W, H); g.textAlign = 'center'; g.textBaseline = 'middle';
  let size = 40; g.font = `bold ${size}px system-ui, sans-serif`;
  // one line when it fits, else two (split at the space nearest the middle), shrinking a little if still wide
  let a = str, b = '';
  if (g.measureText(str).width > W - 48) { const mid = str.length / 2; let cut = -1; for (let i = 0; i < str.length; i++) if (str[i] === ' ' && (cut < 0 || Math.abs(i - mid) < Math.abs(cut - mid))) cut = i; if (cut > 0) { a = str.slice(0, cut); b = str.slice(cut + 1); } }
  while (size > 20 && Math.max(g.measureText(a).width, g.measureText(b).width) > W - 48) { size -= 2; g.font = `bold ${size}px system-ui, sans-serif`; }
  const w = Math.min(W - 8, Math.max(g.measureText(a).width, g.measureText(b).width) + 44), h = b ? 104 : 66, top = b ? 4 : 40;
  g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); if (g.roundRect) g.roundRect(W / 2 - w / 2, top, w, h, 28); else g.rect(W / 2 - w / 2, top, w, h); g.fill();
  g.beginPath(); g.moveTo(W / 2 - 12, top + h - 1); g.lineTo(W / 2, top + h + 16); g.lineTo(W / 2 + 12, top + h - 1); g.fill(); // the little tail
  g.fillStyle = '#3a2a12';
  if (b) { g.fillText(a, W / 2, top + 30); g.fillText(b, W / 2, top + 74); } else g.fillText(a, W / 2, top + 34);
}
export function createChatterBubbles(scene: T.Scene) {
  const root = new T.Group(); root.name = 'npc-chatter'; scene.add(root);
  const BASE = 3.6, items = Array.from({length: CHATTER.MAX}, () => {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
    const s = new T.Sprite(new T.SpriteMaterial({map: tex, transparent: true, depthWrite: false})); s.visible = false; s.raycast = () => {}; s.renderOrder = 4;
    s.center.set(.5, 0); root.add(s); // anchored at the bottom: grows upward from the head
    return {c, tex, s, age: 0, left: 0, total: 0};
  });
  return {
    show(i: number, text: string, seconds: number) {
      const it = items[i]; if (!it) return; const g = it.c.getContext('2d'); if (g) { draw(g, text); it.tex.needsUpdate = true; }
      it.age = 0; it.left = it.total = Math.max(.8, seconds); it.s.visible = true;
    },
    hide(i: number) { const it = items[i]; if (it) { it.left = 0; it.s.visible = false; } },
    follow(i: number, x: number, y: number, z: number) { items[i]?.s.position.set(x, y, z); },
    active: (i: number) => !!items[i] && items[i].left > 0,
    update(dt: number, reduced: boolean) {
      for (const it of items) {
        if (it.left <= 0) continue;
        it.age += dt; it.left -= dt;
        if (it.left <= 0) { it.s.visible = false; continue; }
        const k = reduced ? 1 : it.age < POP ? Math.max(.01, easeOutBack(it.age / POP)) : 1;
        it.s.scale.set(BASE * k, BASE * H / W * k, 1);
        (it.s.material as T.SpriteMaterial).opacity = Math.max(0, Math.min(1, it.left / .3, it.age / .12));
      }
    },
    dispose() { scene.remove(root); for (const it of items) { it.s.material.dispose(); it.tex.dispose(); } },
  };
}
export type ChatterBubbles = ReturnType<typeof createChatterBubbles>;
