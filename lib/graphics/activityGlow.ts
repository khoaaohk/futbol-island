// Public island phase 3 (Nov 12 2026): activity glows. A soft column of warm light over a live pitch where other kids in my world are
// playing now, or the Match o'clock pitch (lib/multiplayer/islandLife.ts glowFields). A pointer for finding the pitch from far away.
// Never on the map (strangers never appear on it) and never over the pitch I am playing on.
// Owner, Nov 12 2026: "once the field is in view fade it out" + thinner/softer: the glow fades out while its pitch centre is on screen
// (it only helps while the pitch is off screen or at the edge) and is about half the old width, a lighter gold, a fainter ring.
// Heat: built lazily on the first glow (one shared 1x64 alpha texture, shared geometry, two small materials per lit pitch, at most 4
// pitches), no animation loop of its own: frame() runs inside Town's existing frame, tests the view at most 4 times a second, and
// only touches opacity while a fade is in progress. All hidden outside a world.
import * as T from 'three';
import { LIVE_VENUES, type LiveFormat } from '../town/venues';

const BEAM_H = 20, BEAM_R = 1.3, RING_R = 4.2;
const COLOUR = 0xffe08a; // a lighter island gold
const BEAM_A = 0.38, RING_A = 0.3;
/** The pitch centre counts as "in view" inside this share of the screen (NDC), so a pitch at the very edge still gets its pointer. */
const IN_VIEW = 0.82;
const VIEW_TEST_MS = 250, FADE_MS = 450;

export type ActivityGlows = {
  set(fields: readonly LiveFormat[], playingOn: LiveFormat | null): void;
  /** Town's frame: fade each lit glow out while its pitch is on screen, back in when it leaves the view. */
  frame(camera: T.Camera, t: number): void;
  dispose(): void;
};

function fadeTexture(): T.Texture {
  // 1 x 64 grey levels (alphaMap reads the green channel): bright at the ground, gone at the top. Drawn once.
  const c = document.createElement('canvas'); c.width = 1; c.height = 64;
  const g = c.getContext('2d');
  if (g) for (let y = 0; y < 64; y++) { const v = Math.round((y / 63) ** 1.6 * 230); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(0, y, 1, 1); }
  const t = new T.CanvasTexture(c); t.needsUpdate = true;
  return t;
}

type Glow = { group: T.Group; beam: T.MeshBasicMaterial; ring: T.MeshBasicMaterial; level: number; target: number; centre: T.Vector3 };

export function createActivityGlows(scene: T.Scene): ActivityGlows {
  let built: { tex: T.Texture; beamGeo: T.BufferGeometry; ringGeo: T.BufferGeometry } | null = null;
  const lit = new Map<LiveFormat, Glow>();
  let key = '', nextTest = 0, fading = false, lastT = 0;
  const probe = new T.Vector3();
  const build = () => {
    if (built) return built;
    const tex = fadeTexture();
    const beamGeo = new T.CylinderGeometry(BEAM_R, BEAM_R * 1.25, BEAM_H, 16, 1, true); beamGeo.translate(0, BEAM_H / 2, 0);
    const ringGeo = new T.RingGeometry(RING_R * 0.8, RING_R, 40); ringGeo.rotateX(-Math.PI / 2);
    built = { tex, beamGeo, ringGeo };
    return built;
  };
  const apply = (g: Glow) => { g.beam.opacity = BEAM_A * g.level; g.ring.opacity = RING_A * g.level; const on = g.level > 0.01; if (g.group.visible !== on) g.group.visible = on; };
  const glowFor = (f: LiveFormat) => {
    let g = lit.get(f);
    if (g) return g;
    const v = LIVE_VENUES.find((x) => x.id === f);
    if (!v) return null;
    const b = build();
    // normal blending (an additive gold vanished over the sand and the pale pitches); the beam fades out upward through its alpha map
    const common = { color: COLOUR, transparent: true, depthWrite: false, side: T.DoubleSide, fog: true } as const;
    const beamMat = new T.MeshBasicMaterial({ ...common, alphaMap: b.tex, opacity: 0 }), ringMat = new T.MeshBasicMaterial({ ...common, opacity: 0 });
    const group = new T.Group(); group.name = 'activity-glow-' + f;
    const beam = new T.Mesh(b.beamGeo, beamMat), ring = new T.Mesh(b.ringGeo, ringMat);
    beam.renderOrder = ring.renderOrder = 3; beam.frustumCulled = ring.frustumCulled = true;
    ring.position.y = 0.16;
    group.add(beam, ring);
    group.position.set(v.x, v.elevation ?? 0, v.z);
    group.userData.activityGlow = f;
    group.visible = false;
    scene.add(group);
    g = { group, beam: beamMat, ring: ringMat, level: 0, target: 0, centre: new T.Vector3(v.x, (v.elevation ?? 0) + 0.5, v.z) };
    lit.set(f, g);
    return g;
  };
  return {
    set(fields, playingOn) {
      const want = fields.filter((f) => f !== playingOn);
      const k = want.join(',');
      if (k === key) return;
      key = k;
      for (const [f, g] of lit) if (!want.includes(f)) { g.target = 0; g.level = 0; apply(g); }
      // a newly lit glow starts at 0; the next frame() decides whether it fades in (pitch off screen) or stays out (pitch in view)
      for (const f of want) { const g = glowFor(f); if (g) { g.target = g.level; } }
      nextTest = 0;
    },
    frame(camera, t) {
      if (!key) return;
      if (t >= nextTest) {
        nextTest = t + VIEW_TEST_MS;
        for (const [f, g] of lit) {
          if (!key.split(',').includes(f)) continue;
          probe.copy(g.centre).project(camera);
          const inView = probe.z < 1 && Math.abs(probe.x) < IN_VIEW && Math.abs(probe.y) < IN_VIEW;
          const target = inView ? 0 : 1;
          if (target !== g.target) { g.target = target; fading = true; }
        }
      }
      const dt = lastT ? Math.min(100, t - lastT) : 16; lastT = t;
      if (!fading) return;
      let still = false;
      for (const g of lit.values()) {
        if (g.level === g.target) continue;
        const step = dt / FADE_MS;
        g.level = g.target > g.level ? Math.min(g.target, g.level + step) : Math.max(g.target, g.level - step);
        apply(g);
        if (g.level !== g.target) still = true;
      }
      fading = still;
    },
    dispose() {
      for (const g of lit.values()) { scene.remove(g.group); g.beam.dispose(); g.ring.dispose(); }
      lit.clear(); key = ''; fading = false;
      if (built) { built.tex.dispose(); built.beamGeo.dispose(); built.ringGeo.dispose(); built = null; }
    },
  };
}
