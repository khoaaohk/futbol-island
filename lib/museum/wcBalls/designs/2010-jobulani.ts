/**
 * 2010 Jo'bulani (the 11 July 2010 final ball, named after Johannesburg, 'Joburg'): the Jabulani's 8 interlocking 3D panels
 * (see 2010-jabulani.ts) with the four design elements in textured gold edged in black around white eyes. Logos left off.
 */
import {JAB_CORE} from './2010-jabulani';
export default JAB_CORE+/* glsl */`
Surf design(vec3 p){return jab_surf(p,true);}
`;
