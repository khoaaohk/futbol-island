// Public island phase 3 (Nov 12 2026): activity glows. A soft column of warm light over a live pitch where other kids in my world are
// playing now, or the Match o'clock pitch (lib/multiplayer/islandLife.ts glowFields). Seen from far away, so a kid can walk over and join.
// Never on the map (strangers never appear on it) and never over the pitch I am playing on.
// Heat: built lazily on the first glow (one shared 1x64 alpha texture, one shared geometry, one material per colour), static (no
// animation, no per-frame work): set() runs only when the list changes. Two meshes per lit pitch at most, all hidden outside a world.
import * as T from 'three';
import { LIVE_VENUES, type LiveFormat } from '../town/venues';

const BEAM_H = 22, BEAM_R = 2.6, RING_R = 6.5;
const COLOUR = 0xffc93c; // island gold (the coin / Play colour family)

export type ActivityGlows = { set(fields: readonly LiveFormat[], playingOn: LiveFormat | null): void; dispose(): void };

function fadeTexture(): T.Texture {
  // 1 x 64 grey levels (alphaMap reads the green channel): bright at the ground, gone at the top. Drawn once.
  const c = document.createElement('canvas'); c.width = 1; c.height = 64;
  const g = c.getContext('2d');
  if (g) for (let y = 0; y < 64; y++) { const v = Math.round((y / 63) ** 1.6 * 230); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(0, y, 1, 1); }
  const t = new T.CanvasTexture(c); t.needsUpdate = true;
  return t;
}

export function createActivityGlows(scene: T.Scene): ActivityGlows {
  let built: { tex: T.Texture; beamGeo: T.BufferGeometry; ringGeo: T.BufferGeometry; beamMat: T.Material; ringMat: T.Material } | null = null;
  const lit = new Map<LiveFormat, T.Group>();
  let key = '';
  const build = () => {
    if (built) return built;
    const tex = fadeTexture();
    const beamGeo = new T.CylinderGeometry(BEAM_R, BEAM_R * 1.25, BEAM_H, 20, 1, true); beamGeo.translate(0, BEAM_H / 2, 0);
    const ringGeo = new T.RingGeometry(RING_R * 0.72, RING_R, 40); ringGeo.rotateX(-Math.PI / 2);
    // normal blending (an additive gold vanished over the sand and the pale pitches); the beam fades out upward through its alpha map
    const common = { color: COLOUR, transparent: true, depthWrite: false, side: T.DoubleSide, fog: true } as const;
    built = { tex, beamGeo, ringGeo, beamMat: new T.MeshBasicMaterial({ ...common, alphaMap: tex, opacity: 0.6 }), ringMat: new T.MeshBasicMaterial({ ...common, opacity: 0.5 }) };
    return built;
  };
  const glowFor = (f: LiveFormat) => {
    let g = lit.get(f);
    if (g) return g;
    const v = LIVE_VENUES.find((x) => x.id === f);
    if (!v) return null;
    const b = build();
    g = new T.Group(); g.name = 'activity-glow-' + f;
    const beam = new T.Mesh(b.beamGeo, b.beamMat), ring = new T.Mesh(b.ringGeo, b.ringMat);
    beam.renderOrder = ring.renderOrder = 3; beam.frustumCulled = ring.frustumCulled = true;
    ring.position.y = 0.16;
    g.add(beam, ring);
    g.position.set(v.x, v.elevation ?? 0, v.z);
    g.userData.activityGlow = f;
    g.visible = false;
    scene.add(g); lit.set(f, g);
    return g;
  };
  return {
    set(fields, playingOn) {
      const want = fields.filter((f) => f !== playingOn);
      const k = want.join(',');
      if (k === key) return;
      key = k;
      for (const [f, g] of lit) g.visible = want.includes(f);
      for (const f of want) { const g = glowFor(f); if (g) g.visible = true; }
    },
    dispose() {
      for (const g of lit.values()) scene.remove(g);
      lit.clear(); key = '';
      if (built) { built.tex.dispose(); built.beamGeo.dispose(); built.ringGeo.dispose(); built.beamMat.dispose(); built.ringMat.dispose(); built = null; }
    },
  };
}
