import type {Decal} from '../decals';
/**
 * 2023 Oceaunz (Women's World Cup, Australia/New Zealand), rebuilt EXACT on Oct 6 2026 (docs/museum/BALL_SOURCES.md, row 39).
 *
 * Construction: the Al Rihla / Oceaunz 20-panel SPEEDSHELL (8 triangles at the cube corners, 12 kites at the edge midpoints,
 * four kites meeting tip to tip at each octahedral point). The photos show the triangles SMALL (CDS-Luthi: "twelve large and
 * eight small triangles"): the smooth, untextured triangle panel ends ~24.5 deg from its centre (Stepro photo, measured
 * after registration), so this ball's triangle weight is .92 (the shared Al Rihla build has 1.0, ~37 deg). Seams are
 * great-circle arcs (the real 'drumstick' curvature is not modelled).
 *
 * Print: six cube-face bitmaps (decals, WebP) that together cover the sphere, drawn by scripts/wwc-balls/oceaunz/oz2.py from
 * seven registered photos (4 of this ball, 3 of the Final Oceaunz Pro, whose print layout registration shows to be the same).
 * Swirl: each photo is levelled, its marks inpainted away and its pixels assigned to six measured inks (white, navy-black with
 * glitter, cyan -> light -> pale sky-blue ramp, lime keyline); every point takes the photo that sees it most face-on (95% of the
 * sphere is seen at >= 17 deg from the limb); the rest is filled from the tetrahedral copy (12 kites, cross-photo agreement
 * 0.06-0.15 against 0.35-0.6 for other turns). Triangles: the eight different blue line patterns (dots, 'AU NZ 2023' rosette,
 * zigzag, cross-hatch, diamond checker, SPEEDSHELL + FIFA Quality Pro, fishnet, tapa) posterised to one ink inside the
 * rounded-triangle outline measured on the Stepro photo; the zigzag and cross-hatch, half hidden in every photo, are completed
 * from their own measured period. Marks round +z (FIFA Women's World Cup AU NZ 2023 emblem cut from the Stepro photo, adidas
 * bars = Commons SVG fitted to it, OFFICIAL MATCH BALL and OCEAUNZ PRO traced) repeat round -z by the half turn about y.
 * The two wordmarks were traced from adidas's HT9011 studio photos (reference only, redrawn as one flat ink).
 * Decal images CC BY-SA 4.0 (derived from the CC BY-SA photos).
 */
const AR_T = .92;
const t = (.57735 * AR_T).toFixed(5), k = '.6859';
export default /* glsl */`
const vec3 OZ_F[20]=vec3[](
 vec3(${t},${t},${t}),vec3(${t},${t},-${t}),vec3(${t},-${t},${t}),vec3(${t},-${t},-${t}),
 vec3(-${t},${t},${t}),vec3(-${t},${t},-${t}),vec3(-${t},-${t},${t}),vec3(-${t},-${t},-${t}),
 vec3(${k},${k},0.),vec3(${k},-${k},0.),vec3(-${k},${k},0.),vec3(-${k},-${k},0.),
 vec3(${k},0.,${k}),vec3(${k},0.,-${k}),vec3(-${k},0.,${k}),vec3(-${k},0.,-${k}),
 vec3(0.,${k},${k}),vec3(0.,${k},-${k}),vec3(0.,-${k},${k}),vec3(0.,-${k},-${k}));
Surf design(vec3 p){
 int b=0;float s=-9.;for(int i=0;i<20;i++){float d=dot(p,OZ_F[i]);if(d>s){s=d;b=i;}}
 float e=9.;vec3 cb=OZ_F[b];for(int i=0;i<20;i++){if(i==b)continue;vec3 dn=cb-OZ_F[i];e=min(e,(s-dot(p,OZ_F[i]))/length(dn));}
 // Print comes from the decals; this is the bare white SPEEDSHELL skin shown while they load.
 return Surf(vec3(.87,.87,.85),seamLine(e,.0105),.6);}
`;
const CREDIT = 'Redrawn from "2023-07-07 Fussball, Frauen, Länderspiel, Deutschland - Sambia 1DX 6938 by Stepro (cropped)" (Wikimedia Commons, Steffen Prößdorf, CC BY-SA 4.0) and "National Football Museum displays 14" (Wikimedia Commons, Hmickey, CC BY-SA 4.0), with adidas studio views as reference and the adidas logo from Commons "Adidas 2022 logo.svg"; this image CC BY-SA 4.0. adidas, OCEAUNZ and the FIFA Women\'s World Cup emblem are trademarks of their owners';
const F = (n: number, dir: [number, number, number], up: [number, number, number]): Decal => ({src: `/museum/wcballs/decals/wwc-2023-oceaunz-${n}.webp`, dir, up, w: .74, h: .74, gloss: .6, credit: CREDIT});
export const decals: Decal[] = [
 F(1, [1, 0, 0], [0, 1, 0]), F(2, [-1, 0, 0], [0, 1, 0]), F(3, [0, 1, 0], [0, 0, -1]),
 F(4, [0, -1, 0], [0, 0, 1]), F(5, [0, 0, 1], [0, 1, 0]), F(6, [0, 0, -1], [0, 1, 0]),
];
