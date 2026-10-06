import type {Decal} from '../decals';
/**
 * 2011 Speedcell (Women's World Cup, Germany), rebuilt EXACT on Oct 6 2026 (docs/museum/BALL_SOURCES.md, row 34).
 *
 * Construction: the Jabulani's 8 thermally bonded 3D panels (4 rounded triangles + 4 six-cornered panels; the power diagram of
 * 2010-jabulani.ts with the triangle size measured on this ball, see below). The Commons photos registered onto it put each white 'eye' and its ring on a triangle panel,
 * with the triangle seam running along the outside of the ring (checked on 'Speedcell.jpg' and 'Diana Matheson in 2011').
 *
 * Print: six cube-face bitmaps (decals) covering the sphere, built by scripts/wwc-balls/build_speedcell.py from registered
 * photos. The ring (eleven blue/green lines with white dashes, the 'eleven players'), the black rim, the lime-edged crescents
 * and the grey pinstripes repeat with tetrahedral symmetry (the four elements are identical; tested across both photos) and
 * are taken from the most face-on copy in the CC photos. The marks: eye 1 is the WWC 2011 ball's own (FIFA Women's World Cup
 * Germany 2011 emblem, SPEEDCELL / OFFICIAL MATCH BALL, adidas; crescent text 'FIFA Women's World Cup 2011'), taken from
 * Commons 'Speedcell.jpg'; eye 2 carries SPEEDCELL and the large adidas Badge of Sport with wordmark (redrawn from the
 * public-domain Commons SVG; layout measured on a collector photo, reference only); eyes 3-4 are blank (Matheson photo);
 * a small Badge of Sport sits on the panel beside the blank eye (Matheson photo). Which triangle carries eye 2 relative to
 * eye 1 is not shown by any photo found (see BALL_SOURCES.md). Decal PNG/WebP files are CC BY-SA (derived from the photos).
 */
/** The Jabulani power diagram (2010-jabulani.ts) with this ball's measured triangle size: on the registered Speedcell photos
 *  (Commons 'Speedcell.jpg', 'Diana Matheson in 2011') a triangle's corners sit ~41 deg from its centre and the short
 *  hexagon-hexagon seams span ~27 deg; JAB_K = -.95 gives 40.9 / 27.2 (the shared -.85 gives 44.7 / 19.6, which the same
 *  photos fit 2-3 deg worse). */
export default /* glsl */`
const vec3 SC_C[8]=vec3[](vec3(1,1,1),vec3(1,-1,-1),vec3(-1,1,-1),vec3(-1,-1,1),vec3(-1,-1,-1),vec3(-1,1,1),vec3(1,-1,1),vec3(1,1,-1));
float sc_w(int i){return i<4?2.*.57735027:.57735027;}
float sc_k(int i){return i<4?-.95:0.;}
Surf design(vec3 p){
 float S[8];for(int i=0;i<8;i++)S[i]=sc_w(i)*dot(p,SC_C[i])+sc_k(i);
 int w=0;for(int i=1;i<8;i++)if(S[i]>S[w])w=i;
 float e=9.;vec3 cw=SC_C[w]*sc_w(w);
 for(int i=0;i<8;i++){if(i==w)continue;vec3 g=cw-SC_C[i]*sc_w(i);vec3 gt=g-p*dot(p,g);e=min(e,(S[w]-S[i])/max(length(gt),1e-4));}
 // Print comes from the decals; this is the bare white skin shown while they load.
 return Surf(vec3(.9,.9,.89),seamLine(e,.010),.56);}
`;
const CREDIT = 'Built from "Speedcell.jpg" (Wikimedia Commons, kandschwar, CC BY-SA 3.0), "Adidas Speedcell Colombia 2011.jpg" (Wikimedia Commons, Futbolero, CC BY-SA 2.5 CO; ring and panels only) and "Diana Matheson in 2011.JPG" (Wikimedia Commons, Thew, CC BY-SA 3.0); adidas marks redrawn from the public-domain Commons SVGs. Unwrapped and folded over the print\'s symmetry. This bitmap CC BY-SA 3.0';
const F = (n: number, dir: [number, number, number], up: [number, number, number]): Decal => ({src: `/museum/wcballs/decals/wwc-2011-speedcell-${n}.webp`, dir, up, w: .74, h: .74, gloss: .56, credit: CREDIT});
export const decals: Decal[] = [
 F(1, [1, 0, 0], [0, 1, 0]), F(2, [-1, 0, 0], [0, 1, 0]), F(3, [0, 1, 0], [0, 0, -1]),
 F(4, [0, -1, 0], [0, 0, 1]), F(5, [0, 0, 1], [0, 1, 0]), F(6, [0, 0, -1], [0, 1, 0]),
];
