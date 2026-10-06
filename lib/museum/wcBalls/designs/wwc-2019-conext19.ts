import type {Decal} from '../decals';
/**
 * 2019 Conext19 (Women's World Cup, France, group stage), rebuilt EXACT on Oct 6 2026 (docs/museum/BALL_SOURCES.md row 37).
 *
 * Construction (measured on the Commons photos, ball-local): 6 identical bonded panels on cube topology, 8 three-panel
 * junctions at the cube corners. Every cube edge A|B is replaced by a 'Z' of four great-circle arcs: corner (A+B+A×B) →
 * tA → the edge midpoint → tB → corner (A+B−A×B), where tX lies 19.8° from face centre X toward the edge. So each white
 * rectangle of the print is split lengthwise by the straight middle arc, and the diagonals run through the coloured star
 * arms to the junctions. Fitted to the visible grooves of "Chile v Colombia 20190519 28" (Carlos Figueroa, CC BY-SA 4.0):
 * turn angle 19.84°, 3 independent photos agree within ~2°. This differs from the shared Telstar 18 build
 * (2018-telstar-18.ts warps a cube and gets gently curved edges with no Z), so the Conext19 / Tricolore 19 keep their own
 * copy here (the Telstar 18 ball itself is outside this lane and is not changed).
 *
 * Print: six cube-face bitmaps (decals) built by scripts/wwc-balls/build_conext19.py: the panel artwork (glitched
 * 'Earth from space' swirl: red-orange star round each panel centre, lime and blue arms to the junctions, white rectangles
 * with grey pixel marks) unwrapped from the registered CC BY-SA photos and repeated on all six panels by the print's
 * measured symmetry (D3 about (1,−1,−1): the 180° turn about each edge axis ⊥ it maps a panel's artwork onto its
 * neighbour's, measured 0.87 low-pass / 0.56 detail correlation on one photo); marks: adidas Badge of Sport + wordmark,
 * 'CONEXT19 / OFFICIAL MATCH BALL', and the FIFA Women's World Cup France 2019 emblem panel.
 */
const TH = 19.84 * Math.PI / 180;
type V = [number, number, number];
const nrm = (v: V): V => {const l = Math.hypot(...v); return [v[0] / l, v[1] / l, v[2] / l];};
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sc = (a: V, k: number): V => [a[0] * k, a[1] * k, a[2] * k];
const cr = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const FACES: V[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
/** The 48 seam arcs (12 Z seams × 4 great-circle arcs). */
const ARCS: [V, V][] = [];
for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) {
 const a = FACES[i], b = FACES[j]; if (Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) > .5) continue;
 const c = cr(a, b), c1 = nrm(add(add(a, b), c)), c2 = nrm(add(add(a, b), sc(c, -1))), m = nrm(add(a, b));
 const ta = nrm(add(sc(a, Math.cos(TH)), sc(b, Math.sin(TH)))), tb = nrm(add(sc(b, Math.cos(TH)), sc(a, Math.sin(TH))));
 const z = [c1, ta, m, tb, c2];
 for (let k = 0; k < 4; k++) ARCS.push([z[k], z[k + 1]]);
}
const g = (v: V) => `vec3(${v.map(x => x.toFixed(6)).join(',')})`;
/** GLSL: `float cx_edge(vec3 p)` = angular distance (radians) to the nearest Conext19 seam. */
export const CX_GEOM = /* glsl */`
const vec3 CX_A[48]=vec3[](${ARCS.map(a => g(a[0])).join(',')});
const vec3 CX_B[48]=vec3[](${ARCS.map(a => g(a[1])).join(',')});
const vec3 CX_N[48]=vec3[](${ARCS.map(a => g(nrm(cr(a[0], a[1])))).join(',')});
float cx_edge(vec3 p){float e=9.;
 for(int i=0;i<48;i++){vec3 a=CX_A[i],b=CX_B[i];if(dot(p,a+b)<.2)continue;vec3 n=CX_N[i];float s=dot(p,n);vec3 q=p-n*s;
  float d=(dot(cross(a,q),n)>=0.&&dot(cross(q,b),n)>=0.)?asin(min(abs(s),1.)):min(acos(clamp(dot(p,a),-1.,1.)),acos(clamp(dot(p,b),-1.,1.)));
  e=min(e,d);}
 return e;}
/** Bare panel surface (print comes from the decals): base colour, a narrow bonded seam (3.3 mm ≈ .015 rad wide). */
Surf cx_bare(vec3 p,vec3 base){float e=cx_edge(p);return Surf(base,seamLine(e,.0095),.56);}
`;
export default CX_GEOM + /* glsl */`
Surf design(vec3 p){return cx_bare(p,vec3(.86,.86,.84));}
`;
const CREDIT = 'Built from "Chile v Colombia 20190519 28" (Wikimedia Commons, Carlos Figueroa Rojas, CC BY-SA 4.0), "2019-05-30 Fussball, Frauen Länderspiel, Deutschland - Chile StP 1027 by Stepro" and "2019-06-11 Fußball, Männer, Länderspiel, Deutschland-Estland StP 2042 LR10 by Stepro" (Wikimedia Commons, Steffen Prößdorf, CC BY-SA 4.0); unwrapped, repeated over the six panels; adidas mark redrawn from Commons "Adidas Logo.svg" (public domain, trademark of adidas AG). This bitmap CC BY-SA 4.0';
/** Six cube-face decals (half-size .74 each) that together cover the sphere. */
export const cubeDecals = (id: string, credit: string, ext = 'webp'): Decal[] => ([
 [[1, 0, 0], [0, 1, 0]], [[-1, 0, 0], [0, 1, 0]], [[0, 1, 0], [0, 0, -1]], [[0, -1, 0], [0, 0, 1]], [[0, 0, 1], [0, 1, 0]], [[0, 0, -1], [0, 1, 0]],
] as [V, V][]).map(([dir, up], i) => ({src: `/museum/wcballs/decals/${id}-${i + 1}.${ext}`, dir, up, w: .74, h: .74, gloss: .56, credit}));
export const decals: Decal[] = cubeDecals('wwc-2019-conext19', CREDIT);
