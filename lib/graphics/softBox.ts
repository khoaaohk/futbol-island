import * as T from 'three';
import { batterySaverOn, effectiveTier } from './heatTier';

/**
 * Soft island sweep (Nov 27 2026, owner: "make these boxes look more like inflatable rounded shapes ... make this world look less
 * blocky"). ONE rounded / pillowed box generator for every prop that used to be a T.BoxGeometry.
 *
 * - `SoftBoxGeometry` EXTENDS T.BoxGeometry: `instanceof T.BoxGeometry` and `.parameters.width/height/depth` keep answering as before,
 *   so the batching pass, surface areas, roof landing and shadow rules that read boxes see no difference. Same attributes as a box
 *   (indexed; position, normal, uv; 6 groups in BoxGeometry's face order) so it merges into the same chunk paint batches (0 draws).
 * - Smooth edge normals: the rounded edge catches a soft highlight; the flat face keeps its own normal.
 * - Tiers: seg 0 = a smooth-shaded chamfer (44 tris, the far / low version), 1 = a 2-step arc (108 tris), 2 = 4-step (300 tris).
 *   `dome` (m) lifts the top face's centre (pillowed top; +4 tris).
 * - `?soft=0` restores today's boxes everywhere (read once per page). Low tier at world build (Battery saver or heat tier >= 2):
 *   every soft box drops one step (seg 1 -> chamfer).
 */
let cached: boolean | null = null;
/** The soft sweep (default ON). Node (tests): ON. */
export function softOn(): boolean {
  if (typeof window === 'undefined') return true;
  if (cached !== null) return cached;
  try { cached = new URLSearchParams(window.location.search).get('soft') !== '0'; } catch { cached = true; }
  return cached;
}
/** Build-time low tier: Battery saver, or the heat governor already at tier 2+ when the world is built. */
export function softLow(): boolean {
  try { return batterySaverOn() || effectiveTier() >= 2; } catch { return false; }
}

export type SoftOpts = {
  /** Corner radius as a fraction of the smallest dimension (default .25, clamped to just under half). */
  r?: number;
  /** Absolute radius (m); wins over `r`. */
  radius?: number;
  /** 0 chamfer, 1, 2 (default 1). */
  seg?: number;
  /** Top dome height (m), default 0. */
  dome?: number;
};

export function softBoxTriangles(seg: number, dome = 0) {
  if (seg <= 0) return 44 + (dome > 0 ? 2 : 0);
  const c = 2 * seg + 1;
  return 6 * 2 * c * c + (dome > 0 ? 2 : 0);
}

// Face table in BoxGeometry's order (+x, -x, +y, -y, +z, -z): normal axis, sign, u axis, v axis.
const FACES: [number, number, number, number][] = [[0, 1, 2, 1], [0, -1, 2, 1], [1, 1, 0, 2], [1, -1, 0, 2], [2, 1, 0, 1], [2, -1, 0, 1]];

function build(w: number, h: number, d: number, o: SoftOpts) {
  const H = [w / 2, h / 2, d / 2];
  const min = Math.min(w, h, d);
  let r = o.radius ?? (o.r ?? 0.25) * min;
  r = Math.max(0, Math.min(r, min * 0.499));
  const seg = Math.max(0, Math.min(3, Math.round(o.seg ?? 1)));
  const dome = Math.max(0, o.dome ?? 0);
  const I = H.map(v => v - r);
  const pos: number[] = [], nrm: number[] = [], uv: number[] = [], idx: number[] = [];
  const groups: [number, number][] = [];
  const p = [0, 0, 0], q = [0, 0, 0];
  const push = (pt: number[], n: number[], u: number, v: number) => { pos.push(pt[0], pt[1], pt[2]); nrm.push(n[0], n[1], n[2]); uv.push(u, v); return pos.length / 3 - 1; };
  // Outward-facing triangle (convex shape around the origin: flip when the face normal points inward).
  const tri = (a: number, b: number, c: number) => {
    const ax = pos[a * 3], ay = pos[a * 3 + 1], az = pos[a * 3 + 2];
    const e1x = pos[b * 3] - ax, e1y = pos[b * 3 + 1] - ay, e1z = pos[b * 3 + 2] - az;
    const e2x = pos[c * 3] - ax, e2y = pos[c * 3 + 1] - ay, e2z = pos[c * 3 + 2] - az;
    const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x;
    const cx = (ax + pos[b * 3] + pos[c * 3]), cy = (ay + pos[b * 3 + 1] + pos[c * 3 + 1]), cz = (az + pos[b * 3 + 2] + pos[c * 3 + 2]);
    if (nx * cx + ny * cy + nz * cz >= 0) idx.push(a, b, c); else idx.push(a, c, b);
  };
  const quad = (a: number, b: number, c: number, e: number) => { tri(a, b, c); tri(a, c, e); };
  const topDome = (f: number) => FACES[f][0] === 1 && FACES[f][1] === 1 && dome > 0;

  if (seg === 0) {
    // Chamfer: per face an inset quad (face normal); edge strips and corner triangles join neighbouring faces' vertices, so their
    // shading blends smoothly from one face normal to the other (a soft rounded read at a distance for 44 tris).
    const corner = new Map<string, number>(); // `${face}:${su}:${sv}` -> vertex
    for (let f = 0; f < 6; f++) {
      const [a, s, ua, va] = FACES[f];
      const start = idx.length;
      const n = [0, 0, 0]; n[a] = s;
      const vs: number[] = [];
      for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        p[a] = s * H[a]; p[ua] = su * I[ua]; p[va] = sv * I[va];
        const vi = push(p, n, (su + 1) / 2, (sv + 1) / 2); corner.set(`${a}:${s}:${ua}:${su}:${va}:${sv}`, vi); vs.push(vi);
      }
      if (topDome(f)) {
        p[a] = s * H[a] + dome; p[ua] = 0; p[va] = 0; const c = push(p, n, .5, .5);
        for (let k = 0; k < 4; k++) tri(vs[k], vs[(k + 1) % 4], c);
      } else quad(vs[0], vs[1], vs[2], vs[3]);
      groups.push([start, idx.length - start]);
    }
    const key = (axis: number, sa: number, o1: number, s1: number, o2: number, s2: number) => {
      // find the vertex on face (axis, sa) whose other two axes have signs s1 (axis o1), s2 (axis o2)
      for (const [k, v] of corner) { const [A, S, U, SU, V, SV] = k.split(':').map(Number); if (A !== axis || S !== sa) continue;
        const su = U === o1 ? s1 : s2, sv = V === o2 ? s2 : s1; if (SU === su && SV === sv) return v; }
      throw new Error('softBox corner');
    };
    const last = groups[groups.length - 1];
    const start = idx.length;
    // 12 edges: for each pair of axes (a, b) and signs, the strip between face a and face b along the third axis c.
    for (const [a, b, c] of [[0, 1, 2], [0, 2, 1], [1, 2, 0]]) for (const sa of [-1, 1]) for (const sb of [-1, 1]) {
      const a0 = key(a, sa, b, sb, c, -1), a1 = key(a, sa, b, sb, c, 1), b0 = key(b, sb, a, sa, c, -1), b1 = key(b, sb, a, sa, c, 1);
      quad(a0, a1, b1, b0);
    }
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) tri(key(0, sx, 1, sy, 2, sz), key(1, sy, 0, sx, 2, sz), key(2, sz, 0, sx, 1, sy));
    // The strips and corners ride in the last group (multi-material users: they take the -z face's material).
    last[1] += idx.length - start;
  } else {
    // Grid per face: sample positions on the face plane chosen so the projection onto the rounded edge gives equal angles.
    const samples = (a: number) => {
      const out: number[] = [];
      for (let j = seg; j >= 0; j--) out.push(-(I[a] + r * Math.tan((Math.PI / 4) * j / seg)));
      for (let j = 0; j <= seg; j++) out.push(I[a] + r * Math.tan((Math.PI / 4) * j / seg));
      return out;
    };
    for (let f = 0; f < 6; f++) {
      const [a, s, ua, va] = FACES[f];
      const U = samples(ua), V = samples(va), n = U.length;
      const start = idx.length;
      const grid: number[] = [];
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
        p[a] = s * H[a]; p[ua] = U[i]; p[va] = V[j];
        for (let k = 0; k < 3; k++) q[k] = Math.max(-I[k], Math.min(I[k], p[k]));
        let dx = p[0] - q[0], dy = p[1] - q[1], dz = p[2] - q[2];
        const l = Math.hypot(dx, dy, dz) || 1; dx /= l; dy /= l; dz /= l;
        const pt = [q[0] + r * dx, q[1] + r * dy, q[2] + r * dz];
        grid.push(push(pt, [dx, dy, dz], (U[i] / H[ua] + 1) / 2, (V[j] / H[va] + 1) / 2));
      }
      const mid = seg; // the centre cell (between -I and I)
      for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) {
        const v00 = grid[j * n + i], v10 = grid[j * n + i + 1], v11 = grid[(j + 1) * n + i + 1], v01 = grid[(j + 1) * n + i];
        if (i === mid && j === mid && topDome(f)) {
          const nn = [0, 0, 0]; nn[a] = 1; p[a] = H[a] + dome; p[ua] = 0; p[va] = 0;
          const c = push(p, nn, .5, .5);
          tri(v00, v10, c); tri(v10, v11, c); tri(v11, v01, c); tri(v01, v00, c);
          // tilt the four inner corners' normals outward a touch so the pillow shades round
          const k = Math.min(.6, 2 * dome / Math.max(r, .01));
          for (const vi of [v00, v10, v11, v01]) {
            const nx = pos[vi * 3] / H[0] * k, nz = pos[vi * 3 + 2] / H[2] * k, l = Math.hypot(nx, 1, nz);
            nrm[vi * 3] = nx / l; nrm[vi * 3 + 1] = 1 / l; nrm[vi * 3 + 2] = nz / l;
          }
        } else quad(v00, v10, v11, v01);
      }
      groups.push([start, idx.length - start]);
    }
  }
  return { pos, nrm, uv, idx, groups };
}

/** A rounded / pillowed box that still IS a T.BoxGeometry (parameters, instanceof) for every reader of boxes. */
export class SoftBoxGeometry extends T.BoxGeometry {
  readonly soft: Required<Pick<SoftOpts, 'seg'>> & SoftOpts;
  constructor(w = 1, h = 1, d = 1, opts: SoftOpts = {}) {
    super(w, h, d);
    this.soft = { seg: 1, ...opts };
    const b = build(w, h, d, this.soft);
    this.setIndex(b.idx);
    this.setAttribute('position', new T.Float32BufferAttribute(b.pos, 3));
    this.setAttribute('normal', new T.Float32BufferAttribute(b.nrm, 3));
    this.setAttribute('uv', new T.Float32BufferAttribute(b.uv, 2));
    this.clearGroups();
    b.groups.forEach(([s, c], i) => this.addGroup(s, c, i));
    this.computeBoundingBox(); this.computeBoundingSphere();
  }
}

const cache = new Map<string, SoftBoxGeometry>();
/** Shared (cached) geometry per size key, for InstancedMesh / shared-geometry users. Never dispose the result per mesh. */
export function softBoxGeometry(w: number, h: number, d: number, opts: SoftOpts = {}) {
  const k = `${w.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}|${opts.r ?? ''}|${opts.radius ?? ''}|${opts.seg ?? 1}|${opts.dome ?? 0}`;
  let g = cache.get(k);
  if (!g) { g = new SoftBoxGeometry(w, h, d, opts); cache.set(k, g); }
  return g;
}

/**
 * The sweep's default for a prop box: rounded when `softOn()`, otherwise a plain box (today's look). Very thin pieces (< 2 cm: decals,
 * stripes, glass) stay boxes; big masses (> `maxDim`) stay boxes; low tier drops a segment.
 */
export function propBox(w: number, h: number, d: number, opts: SoftOpts & { maxDim?: number } = {}, low = false): T.BoxGeometry {
  const min = Math.min(w, h, d), max = Math.max(w, h, d);
  if (!softOn() || min < 0.02 || max > (opts.maxDim ?? 8)) return new T.BoxGeometry(w, h, d);
  const seg = Math.max(0, (opts.seg ?? 1) - (low ? 1 : 0));
  return new SoftBoxGeometry(w, h, d, { ...opts, seg });
}

/**
 * A soft, round, irregular ground patch (owner Nov 27, shot 163: "flush this green area to not be boxy, use a round irregular
 * shape"), replacing the square lawn tiles under trees. Centre fan + an inner ring in the patch colour + an outer ring that dips
 * under the lawn and fades to it (per-vertex tint over the patch colour), so there is no hard edge and no step. Deterministic
 * wobble from `seed`. 3 * n triangles (n rim points, default 18). Local coordinates (centred on 0,0).
 * `rimTint(x, z)` returns the linear rgb multiplier that turns the patch colour into the lawn colour at local (x, z).
 */
export function softPatchGeometry(rx: number, rz: number, seed: number, yTop: number, yRim: number, rimTint: (x: number, z: number) => readonly [number, number, number], n = 18) {
  const pos: number[] = [0, yTop, 0], tint: number[] = [1, 1, 1], idx: number[] = [];
  const h = (k: number) => { const v = Math.sin(k * 127.1 + seed * 311.7) * 43758.5453; return v - Math.floor(v); };
  const ph1 = h(1) * 6.283, ph2 = h(2) * 6.283, a1 = .1 + h(3) * .08, a2 = .06 + h(4) * .06;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2, wob = 1 + a1 * Math.sin(2 * a + ph1) + a2 * Math.sin(3 * a + ph2) + .05 * (h(10 + i) - .5);
    const c = Math.cos(a), s = Math.sin(a);
    pos.push(c * rx * wob * .62, yTop - .004, s * rz * wob * .62); tint.push(1, 1, 1);
    const ox = c * rx * wob, oz = s * rz * wob; pos.push(ox, yRim, oz); const t = rimTint(ox, oz); tint.push(t[0], t[1], t[2]);
  }
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, ai = 1 + 2 * i, bi = 2 + 2 * i, aj = 1 + 2 * j, bj = 2 + 2 * j;
    idx.push(0, aj, ai, ai, aj, bj, ai, bj, bi);
  }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new T.Float32BufferAttribute(pos.map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
  g.setAttribute('uv', new T.Float32BufferAttribute(new Float32Array(pos.length / 3 * 2), 2));
  g.setIndex(idx);
  return { geometry: g, tint: new Float32Array(tint) };
}
