/**
 * 2019 Tricolore 19 (Women's World Cup France 2019, round of 16 to the final), rebuilt EXACT on Oct 6 2026
 * (docs/museum/BALL_SOURCES.md row 38). adidas: "an update of the Conext 19 … the same template", so it uses the
 * Conext19's measured Z-seam construction (wwc-2019-conext19.ts) and the same panel artwork layout, printed in three inks
 * (white, royal blue, red) after the 1998 Tricolore.
 *
 * Print: six cube-face decals built by scripts/wwc-balls/build_tricolore19.py: ink layout voted over the panel symmetry
 * from the two isolated balls in Commons "2019 Women's World Cup Ball.jpg" (Liondartois, CC BY-SA 4.0); the white
 * rectangles keep the template's grey pixel marks (from the CC BY-SA Conext19 photos); marks in white: adidas Badge of Sport
 * + wordmark (Commons "Adidas Logo.svg"), 'Tricolore19 / OFFICIAL MATCH BALL' (traced in one ink from the adidas launch
 * photo, reference only), and the FIFA Women's World Cup France 2019 emblem on the next panel (−x).
 */
import {CX_GEOM, cubeDecals} from './wwc-2019-conext19';
export default CX_GEOM + /* glsl */`
Surf design(vec3 p){return cx_bare(p,vec3(.80,.80,.84));}
`;
const CREDIT = 'Built from "2019 Women\'s World Cup Ball" (Wikimedia Commons, Liondartois, CC BY-SA 4.0) and the Conext19 photos credited on that ball (CC BY-SA 4.0); adidas mark from Commons "Adidas Logo.svg" (public domain, trademark of adidas AG); FIFA Women\'s World Cup France 2019 emblem (trademark of FIFA). This bitmap CC BY-SA 4.0';
export const decals = cubeDecals('wwc-2019-tricolore19', CREDIT);
