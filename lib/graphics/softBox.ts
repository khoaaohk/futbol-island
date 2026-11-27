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
/**
 * Inflate pass (Nov 27 2026, owner on the sweep: "i don't see the inflatable?"): from the play camera the sweep's 5-10 cm bevels did
 * not read. `?puff=0..2` sets how inflated the soft props are: 0 = the sweep's shapes (for comparison), default PUFF_DEFAULT. With
 * puff > 0 a soft box rounds EACH axis by its own radius (ellipsoid corners: a bench seat becomes a pillow with fat rounded ends in
 * plan, a coping a pill, a board gets round corners in its own plane), the top pillows up, and the geometry carries a puff shading
 * key (`userData.puff`) the batching pass bakes into vertex colour: a lit crown, a soft highlight band on the upper curve, a shaded
 * belly toward the ground (pool-float / bouncy-castle read). Same triangle counts as the sweep (+2 for the dome), 0 draws.
 */
export const PUFF_DEFAULT=1.4;
let puffCached: number | null = null;
export function puffLevel(): number {
  if (!softOn()) return 0;
  if (typeof window === 'undefined') return PUFF_DEFAULT;
  if (puffCached !== null) return puffCached;
  try { const q = new URLSearchParams(window.location.search).get('puff'); const v = q === null ? PUFF_DEFAULT : Number(q); puffCached = Number.isFinite(v) ? Math.max(0, Math.min(2, v)) : PUFF_DEFAULT; } catch { puffCached = PUFF_DEFAULT; }
  return puffCached;
}
/** Puff radii (m) per axis for a w x h x d box at strength p: each axis rounds by a fraction of min(its size, the middle size). */
export function puffRadii(w: number, h: number, d: number, p: number): [number, number, number] {
  const dims = [w, h, d], mid = [...dims].sort((a, b) => a - b)[1], f = Math.min(.47, .2 + .14 * p);
  return dims.map(v => f * Math.min(v, mid)) as [number, number, number];
}
/** Inflate pass helper: a puffed soft box (seg 1 near / chamfer on the low tier) when the puff is on, else null (the caller's plain box). */
export function puffGeo(w: number, h: number, d: number, o: SoftOpts = {}): SoftBoxGeometry | null {
  const p = puffLevel(); if (p <= 0) return null;
  return new SoftBoxGeometry(w, h, d, { puff: p, ...o, seg: Math.max(0, (o.seg ?? 1) - (softLow() ? 1 : 0)) });
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
  /** Top dome height (m), default 0 (the puff adds its own); negative = a flat top even when puffed. */
  dome?: number;
  /** Inflate pass strength (0..2): per-axis radii (puffRadii), a domed top and the puff shading key. 0 / absent = the sweep's box. */
  puff?: number;
  /** Leave out the faces looking down (a buried foot, a cap on a post, a coping on a wall): never seen, ~a third of a chamfer's triangles. */
  openBottom?: boolean;
  /** Per-axis radius caps (m) for the puff radii: e.g. a wall run's long axis kept tight so runs meet without a pinch. */
  maxR?: [number, number, number];
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
  const pf = o.puff ?? 0;
  // per-axis radii: the sweep rounds every axis by r; the inflate pass by puffRadii (never less than the sweep's r)
  const R = pf > 0 ? puffRadii(w, h, d, pf).map((v, k) => Math.max(0.0005, Math.min(H[k] * .98, o.maxR?.[k] ?? Infinity, Math.max(v, Math.min(r, H[k] * .98))))) : [r, r, r].map(v => Math.max(v, 0.0005));
  const dome = (o.dome ?? 0) < 0 ? 0 : Math.max(0, o.dome ?? 0, pf > 0 ? Math.min(.35 * h, .09 * Math.min(w, d)) * Math.min(1.4, pf) : 0);// dome < 0: a flat top (a roof slab)
  const I = H.map((v, k) => v - R[k]);
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
        // inflate pass: the inset corners lean their normals out over the chamfer (pillow shading on a 44-tri piece)
        const bn = pf > 0 ? [0, 0, 0] : n; if (pf > 0) { bn[a] = s; bn[ua] = su * .55; bn[va] = sv * .55; const l = Math.hypot(bn[0], bn[1], bn[2]); bn[0] /= l; bn[1] /= l; bn[2] /= l; }
        const vi = push(p, bn, (su + 1) / 2, (sv + 1) / 2); corner.set(`${a}:${s}:${ua}:${su}:${va}:${sv}`, vi); vs.push(vi);
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
      for (let j = seg; j >= 0; j--) out.push(-(I[a] + R[a] * Math.tan((Math.PI / 4) * j / seg)));
      for (let j = 0; j <= seg; j++) out.push(I[a] + R[a] * Math.tan((Math.PI / 4) * j / seg));
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
        // ellipsoid corner (radii R): unit direction in the corner's scaled frame, point on the ellipsoid, its true normal
        let dx = (p[0] - q[0]) / R[0], dy = (p[1] - q[1]) / R[1], dz = (p[2] - q[2]) / R[2];
        const l = Math.hypot(dx, dy, dz) || 1; dx /= l; dy /= l; dz /= l;
        const pt = [q[0] + R[0] * dx, q[1] + R[1] * dy, q[2] + R[2] * dz];
        let nx = dx / R[0], ny = dy / R[1], nz = dz / R[2]; const ln = Math.hypot(nx, ny, nz) || 1; nx /= ln; ny /= ln; nz /= ln;
        grid.push(push(pt, [nx, ny, nz], (U[i] / H[ua] + 1) / 2, (V[j] / H[va] + 1) / 2));
      }
      const mid = seg; // the centre cell (between -I and I)
      for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) {
        const v00 = grid[j * n + i], v10 = grid[j * n + i + 1], v11 = grid[(j + 1) * n + i + 1], v01 = grid[(j + 1) * n + i];
        if (i === mid && j === mid && topDome(f)) {
          const nn = [0, 0, 0]; nn[a] = 1; p[a] = H[a] + dome; p[ua] = 0; p[va] = 0;
          const c = push(p, nn, .5, .5);
          tri(v00, v10, c); tri(v10, v11, c); tri(v11, v01, c); tri(v01, v00, c);
          // tilt the four inner corners' normals outward a touch so the pillow shades round
          const k = Math.min(pf > 0 ? .9 : .6, 2 * dome / Math.max(Math.min(R[0], R[2]), .01));
          for (const vi of [v00, v10, v11, v01]) {
            const nx = pos[vi * 3] / H[0] * k, nz = pos[vi * 3 + 2] / H[2] * k, l = Math.hypot(nx, 1, nz);
            nrm[vi * 3] = nx / l; nrm[vi * 3 + 1] = 1 / l; nrm[vi * 3 + 2] = nz / l;
          }
        } else quad(v00, v10, v11, v01);
      }
      groups.push([start, idx.length - start]);
    }
  }
  if (o.openBottom) {
    // drop every triangle whose geometric normal looks down (the -y face, its edge strips and corners); groups shrink to match
    const out: number[] = [];
    for (const g of groups) { const st = out.length;
      for (let t = g[0]; t < g[0] + g[1]; t += 3) { const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
        const e1x = pos[b] - pos[a], e1z = pos[b + 2] - pos[a + 2], e2x = pos[c] - pos[a], e2z = pos[c + 2] - pos[a + 2];
        const e1y = pos[b + 1] - pos[a + 1], e2y = pos[c + 1] - pos[a + 1];
        const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x;
        if (ny < -.3 * Math.hypot(nx, ny, nz)) continue; out.push(idx[t], idx[t + 1], idx[t + 2]); }
      g[0] = st; g[1] = out.length - st; }
    idx.length = 0; idx.push(...out);
  }
  // Puff shading key (inflate pass): 1 at the dome's crown, 0 elsewhere; the batching pass turns it + the normal into the baked light.
  let crown: Float32Array | null = null;
  if (pf > 0) {
    crown = new Float32Array(pos.length / 3);
    for (let i = 0; i < crown.length; i++) if (pos[i * 3 + 1] > H[1] + 1e-5) crown[i] = 1;
  }
  return { pos, nrm, uv, idx, groups, crown, pf };
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
    if (b.crown) this.userData.puff = { s: b.pf, crown: b.crown };
    this.computeBoundingBox(); this.computeBoundingSphere();
  }
}

const cache = new Map<string, SoftBoxGeometry>();
/** Shared (cached) geometry per size key, for InstancedMesh / shared-geometry users. Never dispose the result per mesh. */
export function softBoxGeometry(w: number, h: number, d: number, opts: SoftOpts = {}) {
  const k = `${w.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}|${opts.r ?? ''}|${opts.radius ?? ''}|${opts.seg ?? 1}|${opts.dome ?? 0}|${opts.puff ?? 0}`;
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
  // thin pieces (legs, slats, rails, boards: under 15 cm) take the smooth-shaded chamfer (44 tris); chunkier ones the 2-step arc
  const seg = Math.max(0, (opts.seg ?? (min < .15 ? 0 : 1)) - (low ? 1 : 0));
  return new SoftBoxGeometry(w, h, d, { puff: puffLevel(), ...opts, seg });
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

/**
 * A smooth pebble / boulder (soft sweep: beach rocks were 20-facet crystals): a detail-1 icosahedron (80 faces; detail 0 on the low
 * tier), corners pushed in / out up to 9 % by direction (shared corners stay shut), smooth normals. Unit-agnostic: radius r.
 */
export function pebbleGeometry(r: number, seed: number, low = false) {
  const g = new T.IcosahedronGeometry(r, low ? 0 : 1), p = g.getAttribute('position') as T.BufferAttribute, n = g.getAttribute('normal') as T.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), v = Math.sin((x * 7.1 + seed) * 12.9898 + (z * 5.3 + y * 3.7) * 78.233) * 43758.5453, k = 1 + .09 * ((v - Math.floor(v)) * 2 - 1);
    p.setXYZ(i, x * k, y * k, z * k);
  }
  if (low) for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), l = Math.hypot(x, y, z) || 1; n.setXYZ(i, x / l, y / l, z / l); }// detail 0 but smooth: a pebble, not a crystal
  return g;
}

/**
 * Inflate pass: a 20-triangle puff ball (welded icosahedron, a vertex at the top, sphere normals) carrying the puff shading key with
 * its crown on the top vertex, so a bloom / knob reads as a lit round puff, not a faceted gem. Same triangles as the sweep's ball.
 */
export function puffBall(r: number, detail = 0) {
  const g0 = new T.IcosahedronGeometry(r, detail); g0.rotateZ(-Math.atan(1 / ((1 + Math.sqrt(5)) / 2)));
  g0.deleteAttribute('normal'); g0.deleteAttribute('uv');
  const src = g0.getAttribute('position') as T.BufferAttribute, map = new Map<string, number>(), pos: number[] = [], idx: number[] = [];
  for (let i = 0; i < src.count; i++) {
    const k = `${src.getX(i).toFixed(4)},${src.getY(i).toFixed(4)},${src.getZ(i).toFixed(4)}`;
    let v = map.get(k); if (v === undefined) { v = pos.length / 3; map.set(k, v); pos.push(src.getX(i), src.getY(i), src.getZ(i)); }
    idx.push(v);
  }
  const g = new T.BufferGeometry(), n = pos.map((v, i) => v / Math.hypot(pos[i - i % 3], pos[i - i % 3 + 1], pos[i - i % 3 + 2]));
  g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(n, 3));
  g.setAttribute('uv', new T.Float32BufferAttribute(new Float32Array(pos.length / 3 * 2), 2)); g.setIndex(idx);
  const crown = new Float32Array(pos.length / 3); for (let i = 0; i < crown.length; i++) crown[i] = Math.max(0, (pos[i * 3 + 1] / r - .55) / .45);
  g.userData.puff = { s: puffLevel() || PUFF_DEFAULT, crown };
  return g;
}

/** A point on a puffed wall run: plan position, the top of the wall (under the coping's crown) and its foot (bottom of the face). */
export type RunPt = { x: number; z: number; top: number; foot: number };
export type RunOpts = {
  /** Half thickness of the wall body (m). */ half: number;
  /** How far the coping roll stands proud of the face (m), its height and the crown's dome. */ lip?: number; capH?: number; dome?: number;
  /** Linear rgb multiplier turning the body colour into the coping colour (1 = one colour). */ capTint?: readonly [number, number, number];
  /** A soft outward belly half way up the face (m; 0 = none, saves 4 triangles a step). */ belly?: number;
  /** The back face only reaches this far under the top (a retaining wall: the terrace hides the rest); default = down to the foot. */ back?: number;
  /** Rounded (domed) ends: [start, end]. Ends buried in a pier can stay open. */ ends?: readonly [boolean, boolean];
  /** Longest mesh (m) so the batching pass can keep pieces in their own 50 m cells. */ piece?: number;
  /** Lateral shift of the whole profile (m, + = the right of the direction of travel): -half puts the outer face on the line. */ shift?: number;
  /** Polish Nov 27 2026 (owner shot 193: the terrace wall read as a plain face): `courses` rows across the outer face (in place of the
   *  belly) shaded as soft stone courses: a darker bed line, each block a little lighter / darker along the run, a damp mossy foot
   *  and the coping's shadow. Colour only (2 triangles a step a row). */ courses?: number;
};
/**
 * Inflate pass 2 (Nov 27 2026, owner shots 175 / 178: "make it seamless", "also do that for the other walls too"): ONE swept, pillowy
 * wall along a polyline: a slightly bellied face, a coping roll standing proud on both sides and a domed crown, mitred round every
 * corner (no joints, notches or gaps between segments) and smooth normals across the whole run (pieces are cut AFTER the normals, so
 * piece borders do not show). Carries the puff shading key (lit crown, highlight band, shaded belly: world.ts batching) and a per-vertex
 * tint for the coping colour. 2 * (profile points - 1) triangles a step (16-24) + ~30 a rounded end. Returns local pieces (y absolute).
 */
export function puffRun(pts: readonly RunPt[], o: RunOpts): { geo: T.BufferGeometry; cx: number; cz: number; tint: Float32Array }[] {
  if (pts.length < 2) return [];
  const lip = o.lip ?? .08, capH = o.capH ?? .2, dome = o.dome ?? .05, h = o.half, bel = o.belly ?? 0, ct = o.capTint ?? [1, 1, 1];
  // half profile, outer foot -> crown: [lateral offset, y(p), cap?, crown]
  type Row = [number, (p: RunPt) => number, number, number, ((i: number) => readonly [number, number, number])?];
  const outer: Row[] = [[h, p => p.foot, 0, 0, o.courses ? () => [.74, .8, .7] : undefined]];// courses: a damp, mossy foot
  const nc = o.courses ?? 0;
  if (nc) for (let k = 1; k <= nc; k++) { const f = k / (nc + 1), sway = bel * Math.sin(Math.PI * f);
    outer.push([h + sway, p => p.foot + (p.top - capH - p.foot) * f, 0, 0, i => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453, r = v - Math.floor(v), d = k % 2 ? .97 + .1 * r : .76 + .06 * r; return [d * 1.02, d, d * .96]; }]); }// odd rows: a block's face (each a little lighter / darker), even: the bed line between courses
  else if (bel > 0) outer.push([h + bel, p => (p.foot + p.top - capH) / 2, 0, 0]);
  outer.push([h, p => p.top - capH, 0, 0, o.courses ? () => [.8, .8, .8] : undefined], [h + lip, p => p.top - capH * .55, 1, 0], [h + lip * .55, p => p.top - capH * .04, 1, .25],
    [h * .5, p => p.top + dome * .75, 1, .7], [0, p => p.top + dome, 1, 1]);
  const prof: Row[] = [...outer];
  if (o.back !== undefined) prof.push([-h * .5, p => p.top + dome * .75, 1, .7], [-h, p => p.top - capH * .3, 1, 0], [-h, p => p.top - o.back!, 1, 0]);// a retaining wall: the hidden back is plain
  else for (let i = outer.length - 2; i >= 0; i--) { const [off, y, c, k, tf] = outer[i]; prof.push([-off, y, c, k, tf]); }
  const m = prof.length, n = pts.length, pos: number[] = [], tint: number[] = [], crown: number[] = [], idx: number[] = [];
  const dirs = pts.slice(1).map((b, i) => { const a = pts[i], l = Math.hypot(b.x - a.x, b.z - a.z) || 1; return [(b.x - a.x) / l, (b.z - a.z) / l]; });
  for (let i = 0; i < n; i++) {
    const d0 = dirs[Math.max(0, i - 1)], d1 = dirs[Math.min(n - 2, i)], tx = d0[0] + d1[0], tz = d0[1] + d1[1], tl = Math.hypot(tx, tz) || 1;
    let nx = tz / tl, nz = -tx / tl; const mit = 1 / Math.max(.5, nx * d1[1] - nz * d1[0]); nx *= mit; nz *= mit;// mitre: keep the thickness round a corner
    const p = pts[i];
    const sh = o.shift ?? 0;
    for (const [off0, y, c, k, tf] of prof) { const off = off0 + sh; pos.push(p.x + nx * off, y(p), p.z + nz * off); tint.push(...(c ? ct : tf ? tf(i) : [1, 1, 1])); crown.push(k); }
  }
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < m - 1; j++) { const a = i * m + j, b = a + 1, c = a + m, d = c + 1; idx.push(a, c, b, b, c, d); }
  // rounded ends: one ring pushed out along the run and drawn in, then a fan to its centre
  const endRows: number[][] = [];
  (o.ends ?? [true, true]).forEach((on, e) => {
    if (!on) return; const i = e ? n - 1 : 0, d = dirs[e ? n - 2 : 0], s = e ? 1 : -1, p = pts[i], base = i * m, ring = pos.length / 3;
    let cx = 0, cy = 0, cz = 0;
    for (let j = 0; j < m; j++) { const X = pos[(base + j) * 3], Y = pos[(base + j) * 3 + 1], Z = pos[(base + j) * 3 + 2], lx = X - p.x, lz = Z - p.z;
      const yy = Math.max(p.foot, p.top - (p.top - Y) * 1.0 - (Y > p.top - capH ? capH * .25 : 0));
      pos.push(p.x + lx * .62 + d[0] * s * h * .55, yy, p.z + lz * .62 + d[1] * s * h * .55); tint.push(tint[(base + j) * 3], tint[(base + j) * 3 + 1], tint[(base + j) * 3 + 2]); crown.push(crown[base + j] * .6);
      cx += p.x + d[0] * s * h * .75; cy += yy; cz += p.z + d[1] * s * h * .75; }
    const tip = pos.length / 3; pos.push(cx / m, Math.min(cy / m + capH * .3, p.top), cz / m); tint.push(...ct); crown.push(.3);
    for (let j = 0; j < m - 1; j++) { const a = base + j, b = a + 1, c = ring + j, dd = c + 1; if (e) idx.push(a, c, b, b, c, dd); else idx.push(a, b, c, b, dd, c); }
    for (let j = 0; j < m - 1; j++) if (e) idx.push(ring + j, tip, ring + j + 1); else idx.push(ring + j, ring + j + 1, tip);
    endRows[e] = [ring, tip];
  });
  // Polish Nov 27 2026 (owner shots 193 / 200: the west terrace wall "has no base", a slab hanging in the air): the quads above are
  // wound for one direction of travel only; run the other way (the terrace ring, the plaza walls) every face was inside-out, so the
  // wall's long outer face was culled and you saw through it to the short back. Wind every run so its faces look out (the crown up).
  { const j = prof.findIndex(r => r[3] === 1), i0 = Math.floor((n - 1) / 2), a = (i0 * m + j - 1) * 3, b = (i0 * m + j) * 3, c = ((i0 + 1) * m + j) * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2], vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    // the quad (row j-1 -> j, step i0 -> i0+1) is wound (a, c, b): its normal is (c - a) x (b - a); the crown's must point up
    const ny = vz * ux - vx * uz; void uy; void vy;
    if (ny < 0) for (let t = 0; t < idx.length; t += 3) { const k = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = k; } }
  const all = new T.BufferGeometry(); all.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); all.setIndex(idx); all.computeVertexNormals();
  const N = all.getAttribute('normal').array as Float32Array, P = pos;
  // cut into pieces of <= o.piece m along the run (shared normals: no seam at a cut)
  const S = [0]; for (let i = 1; i < n; i++) S.push(S[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z));
  const out: { geo: T.BufferGeometry; cx: number; cz: number; tint: Float32Array }[] = [], piece = o.piece ?? 12;
  for (let s = 0; s < n - 1;) {
    let e = s + 1; while (e < n - 1 && S[e + 1] - S[s] <= piece) e++;
    const cx = (pts[s].x + pts[e].x) / 2, cz = (pts[s].z + pts[e].z) / 2, map = new Map<number, number>(), lp: number[] = [], ln: number[] = [], lt: number[] = [], lc: number[] = [], li: number[] = [];
    const v = (g: number) => { let k = map.get(g); if (k === undefined) { k = lp.length / 3; map.set(g, k); lp.push(P[g * 3] - cx, P[g * 3 + 1], P[g * 3 + 2] - cz); ln.push(N[g * 3], N[g * 3 + 1], N[g * 3 + 2]); lt.push(tint[g * 3], tint[g * 3 + 1], tint[g * 3 + 2]); lc.push(crown[g]); } return k; };
    for (let t = 0; t < idx.length; t += 3) {
      const tri = [idx[t], idx[t + 1], idx[t + 2]], rows = tri.map(g => g < n * m ? Math.floor(g / m) : -1);
      const ext = rows.some(r => r < 0), lo = Math.min(...rows.filter(r => r >= 0)), hi = Math.max(...rows.filter(r => r >= 0));
      const mine = ext ? (lo === 0 && s === 0 && tri.some(g => g >= n * m && endRows[0] && g <= endRows[0][1])) || (hi === n - 1 && e === n - 1 && tri.some(g => endRows[1] && g >= endRows[1][0])) : lo >= s && hi <= e;
      if (mine) li.push(...tri.map(v));
    }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(lp, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(ln, 3));
    g.setAttribute('uv', new T.Float32BufferAttribute(new Float32Array(lp.length / 3 * 2), 2)); g.setIndex(li); g.computeBoundingBox(); g.computeBoundingSphere();
    g.userData.puff = { s: puffLevel() || PUFF_DEFAULT, crown: new Float32Array(lc) };
    out.push({ geo: g, cx, cz, tint: new Float32Array(lt) }); s = e;
  }
  return out;
}
/** Linear rgb multiplier that turns colour `a` into colour `b` (for RunOpts.capTint). */
export function tintFromTo(a: string, b: string): [number, number, number] {
  const A = new T.Color(a), B = new T.Color(b); return [B.r / Math.max(A.r, 1e-3), B.g / Math.max(A.g, 1e-3), B.b / Math.max(A.b, 1e-3)];
}
/**
 * Inflate pass 2 (owner shot 180, lights): a cylinder whose top rim is rolled round (the edge the high play camera sees) and whose top
 * pillows up a little (a lathe), radius `rt` at the top and `rb` at the foot, centred like T.CylinderGeometry. `e` = roll radius (m).
 * Smooth normals across the roll. `openBottom` leaves the underside out. Triangles: n * (closed 10 | open 8) (n 8: 80 / 64).
 */
export function roundCyl(rt: number, rb: number, h: number, n = 8, e = Math.min(rt, rb, h / 2) * .5, openBottom = false) {
  const y0 = -h / 2, y1 = h / 2, pts: T.Vector2[] = [];
  if (!openBottom) pts.push(new T.Vector2(0, y0));
  pts.push(new T.Vector2(rb, y0), new T.Vector2(rt, y1 - e), new T.Vector2(rt - e * .32, y1 - e * .32), new T.Vector2(rt - e, y1), new T.Vector2(0, y1 + e * .15));
  const g = new T.LatheGeometry(pts, n); g.computeVertexNormals();
  return g;
}
/** A round domed cap (a lathe: eave radius `r` at y 0 rising to a soft crown at `h`), open underneath. 8 * n triangles. */
export function domeCap(r: number, h: number, n = 8) {
  const pts = [new T.Vector2(r, 0), new T.Vector2(r * .86, h * .42), new T.Vector2(r * .55, h * .82), new T.Vector2(r * .2, h * .98), new T.Vector2(0, h)];
  const g = new T.LatheGeometry(pts.reverse(), n); g.computeVertexNormals(); return g;
}
/**
 * Leftovers B (Nov 27 2026, window sills "still boxy"; a full puff costs +23k island-wide): a bullnose sill strip, w (x) x h x d (z),
 * centred like a box, front = +z. Profile (back top, front-top shoulder, nose, front-bottom shoulder, back bottom), back face left out
 * (it sits on the wall), smooth normals up -> forward -> down round the nose so the lit edge reads round from the play camera.
 * 14 triangles (a box is 12). The caller keeps plain boxes where a budget is full (west stadium cap).
 */
export function sillGeometry(w: number, h: number, d: number) {
  const hx = w / 2, hy = h / 2, hz = d / 2, r = Math.min(hy, hz * .8);
  const prof: [number, number, number, number][] = [[hy, -hz, 1, 0], [hy, hz - r, 1, 0], [0, hz, 0, 1], [-hy, hz - r, -1, 0], [-hy, -hz, -1, 0]]; // y, z, ny, nz
  const pos: number[] = [], nor: number[] = [], idx: number[] = [];
  for (const [y, z, ny, nz] of prof) for (const x of [-hx, hx]) { const l = Math.hypot(ny, nz); pos.push(x, y, z); nor.push(0, ny / l, nz / l); }
  const tri = (a: number, b: number, c: number, nx: number, ny: number, nz: number) => {
    const A = a * 3, B = b * 3, C = c * 3, ux = pos[B] - pos[A], uy = pos[B + 1] - pos[A + 1], uz = pos[B + 2] - pos[A + 2], vx = pos[C] - pos[A], vy = pos[C + 1] - pos[A + 1], vz = pos[C + 2] - pos[A + 2];
    const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
    (cx * nx + cy * ny + cz * nz >= 0) ? idx.push(a, b, c) : idx.push(a, c, b);
  };
  for (let i = 0; i < prof.length - 1; i++) {
    const a = i * 2, b = a + 1, c = a + 2, e = a + 3, mny = prof[i][2] + prof[i + 1][2], mnz = prof[i][3] + prof[i + 1][3];
    tri(a, b, e, 0, mny, mnz); tri(a, e, c, 0, mny, mnz);
  }
  for (const s of [-1, 1]) {
    const base = pos.length / 3;
    for (const [y, z] of prof) { pos.push(s * hx, y, z); nor.push(s, 0, 0); }
    for (let i = 1; i < prof.length - 1; i++) tri(base, base + i, base + i + 1, s, 0, 0);
  }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); g.setIndex(idx);
  return g;
}
